import { supabase } from './supabase';
import { validateFile, sanitizeFileName, getMediaDuration, FileValidationResult } from './fileValidator';

export interface UploadProgress {
  uploadId: string;
  fileName: string;
  progress: number;
  status: 'pending' | 'uploading' | 'processing' | 'completed' | 'failed';
  error?: string;
  url?: string;
  dccsId?: string;
  dccsCertificateId?: string;
  dccsClearanceCode?: string;
}

export interface UploadOptions {
  projectId?: string;
  onProgress?: (progress: UploadProgress) => void;
  encrypt?: boolean;
  registrationType?: 'register_only' | 'register_and_sell';
  price?: number;
  description?: string;
}

const CHUNK_SIZE = 5 * 1024 * 1024; // 5MB chunks for large files
const LARGE_FILE_THRESHOLD = 50 * 1024 * 1024; // 50MB
const MAX_RETRY_ATTEMPTS = 3;
const INITIAL_RETRY_DELAY = 1000; // 1 second

class UploadManager {
  private activeUploads: Map<string, AbortController> = new Map();
  private uploadQueue: Array<{ file: File; options: UploadOptions; resolve: any; reject: any }> = [];
  private isProcessingQueue = false;

  async checkNetworkConnectivity(): Promise<boolean> {
    if (!navigator.onLine) {
      return false;
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const response = await fetch('/health-check', {
        method: 'HEAD',
        signal: controller.signal,
        cache: 'no-cache'
      });

      clearTimeout(timeoutId);
      return response.ok;
    } catch {
      return false;
    }
  }

  private async retryWithBackoff<T>(
    operation: () => Promise<T>,
    retryCount = 0
  ): Promise<T> {
    try {
      return await operation();
    } catch (error) {
      if (retryCount >= MAX_RETRY_ATTEMPTS) {
        throw error;
      }

      const isNetworkError = error instanceof Error && (
        error.message.includes('network') ||
        error.message.includes('fetch') ||
        error.message.includes('timeout')
      );

      if (!isNetworkError) {
        throw error;
      }

      const delay = INITIAL_RETRY_DELAY * Math.pow(2, retryCount);
      await new Promise(resolve => setTimeout(resolve, delay));

      const isOnline = await this.checkNetworkConnectivity();
      if (!isOnline) {
        throw new Error('Network connection unavailable');
      }

      return this.retryWithBackoff(operation, retryCount + 1);
    }
  }

  async uploadFile(
    file: File,
    options: UploadOptions = {}
  ): Promise<UploadProgress> {
    const uploadId = crypto.randomUUID();
    const abortController = new AbortController();
    this.activeUploads.set(uploadId, abortController);

    try {
      // Check network connectivity first
      const isOnline = await this.checkNetworkConnectivity();
      if (!isOnline) {
        throw new Error('No network connection. Please check your internet and try again.');
      }

      // Validate file
      const validation = validateFile(file);
      if (!validation.valid) {
        throw new Error(validation.error);
      }

      const progress: UploadProgress = {
        uploadId,
        fileName: file.name,
        progress: 0,
        status: 'pending',
      };

      options.onProgress?.(progress);

      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Sanitize filename
      const sanitizedName = sanitizeFileName(file.name);
      const timestamp = Date.now();
      const storagePath = `${user.id}/${timestamp}_${sanitizedName}`;

      // Get media duration if applicable
      const duration = await getMediaDuration(file);

      // Create upload record in database
      const { data: uploadRecord, error: dbError } = await supabase
        .from('uploads')
        .insert({
          user_id: user.id,
          project_id: options.projectId,
          file_name: file.name,
          file_type: file.type,
          file_size: file.size,
          file_category: validation.fileCategory,
          storage_path: storagePath,
          upload_status: 'uploading',
          duration,
          registration_type: options.registrationType || 'register_and_sell',
          price: options.price,
          description: options.description,
          original_filename: file.name,
          marketplace_status: options.registrationType === 'register_only' ? 'draft' : 'active',
          metadata: {
            originalName: file.name,
            uploadedAt: new Date().toISOString(),
            registrationType: options.registrationType || 'register_and_sell',
          },
        })
        .select()
        .single();

      if (dbError) throw dbError;

      progress.status = 'uploading';
      options.onProgress?.(progress);

      // Upload to storage with retry logic
      if (file.size > LARGE_FILE_THRESHOLD) {
        // Chunked upload for large files
        await this.uploadLargeFile(
          file,
          storagePath,
          uploadRecord.id,
          (chunkProgress) => {
            progress.progress = chunkProgress;
            options.onProgress?.(progress);
          },
          abortController.signal
        );
      } else {
        // Standard upload with retry
        await this.retryWithBackoff(async () => {
          const { error: uploadError } = await supabase.storage
            .from('user-uploads')
            .upload(storagePath, file, {
              cacheControl: '3600',
              upsert: false,
            });

          if (uploadError) throw uploadError;
        });
      }

      progress.progress = 90;
      progress.status = 'processing';
      options.onProgress?.(progress);

      // Update upload record as completed
      const { data: completedUpload, error: updateError } = await supabase
        .from('uploads')
        .update({
          upload_status: 'completed',
          processing_progress: 100,
          updated_at: new Date().toISOString(),
        })
        .eq('id', uploadRecord.id)
        .select()
        .single();

      if (updateError) throw updateError;

      // Get DCCS certificate data (auto-generated by trigger)
      const { data: finalUpload } = await supabase
        .from('uploads')
        .select(`
          dccs_certificate_id,
          dccs_certificates (
            certificate_id,
            clearance_code
          )
        `)
        .eq('id', uploadRecord.id)
        .single();

      // Get file URL
      const { data: urlData } = supabase.storage
        .from('user-uploads')
        .getPublicUrl(storagePath);

      progress.progress = 100;
      progress.status = 'completed';
      progress.url = urlData.publicUrl;
      progress.dccsId = finalUpload?.dccs_certificate_id;
      progress.dccsCertificateId = finalUpload?.dccs_certificates?.certificate_id;
      progress.dccsClearanceCode = finalUpload?.dccs_certificates?.clearance_code;
      options.onProgress?.(progress);

      return progress;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Upload failed';

      const progress: UploadProgress = {
        uploadId,
        fileName: file.name,
        progress: 0,
        status: 'failed',
        error: errorMessage,
      };

      options.onProgress?.(progress);
      throw error;

    } finally {
      this.activeUploads.delete(uploadId);
    }
  }

  private async uploadLargeFile(
    file: File,
    storagePath: string,
    uploadId: string,
    onProgress: (progress: number) => void,
    signal: AbortSignal
  ): Promise<void> {
    const totalChunks = Math.ceil(file.size / CHUNK_SIZE);
    let uploadedChunks = 0;

    for (let i = 0; i < totalChunks; i++) {
      if (signal.aborted) {
        throw new Error('Upload cancelled');
      }

      const start = i * CHUNK_SIZE;
      const end = Math.min(start + CHUNK_SIZE, file.size);
      const chunk = file.slice(start, end);

      const chunkPath = `${storagePath}_chunk_${i}`;

      // Upload chunk with retry logic
      await this.retryWithBackoff(async () => {
        const { error } = await supabase.storage
          .from('user-uploads')
          .upload(chunkPath, chunk, {
            cacheControl: '3600',
            upsert: false,
          });

        if (error) throw error;
      });

      // Record chunk in database
      await supabase.from('upload_chunks').insert({
        upload_id: uploadId,
        chunk_number: i,
        chunk_size: chunk.size,
        chunk_path: chunkPath,
        is_uploaded: true,
      });

      uploadedChunks++;
      const progress = Math.floor((uploadedChunks / totalChunks) * 85);
      onProgress(progress);
    }

    // Merge chunks (this would typically be done server-side)
    // For now, we'll keep the main file and clean up chunks later
  }

  private async processQueue(): Promise<void> {
    if (this.isProcessingQueue || this.uploadQueue.length === 0) {
      return;
    }

    this.isProcessingQueue = true;

    while (this.uploadQueue.length > 0) {
      const item = this.uploadQueue.shift();
      if (!item) break;

      try {
        const result = await this.uploadFile(item.file, item.options);
        item.resolve(result);
      } catch (error) {
        item.reject(error);
      }

      await new Promise(resolve => setTimeout(resolve, 100));
    }

    this.isProcessingQueue = false;
  }

  async queueUpload(file: File, options: UploadOptions = {}): Promise<UploadProgress> {
    return new Promise((resolve, reject) => {
      this.uploadQueue.push({ file, options, resolve, reject });
      this.processQueue();
    });
  }

  async uploadMultipleFiles(
    files: File[],
    options: UploadOptions = {}
  ): Promise<UploadProgress[]> {
    const uploads = files.map(file => this.queueUpload(file, options));
    return Promise.all(uploads);
  }

  cancelUpload(uploadId: string): void {
    const controller = this.activeUploads.get(uploadId);
    if (controller) {
      controller.abort();
      this.activeUploads.delete(uploadId);
    }
  }

  cancelAllUploads(): void {
    this.activeUploads.forEach((controller) => controller.abort());
    this.activeUploads.clear();
  }

  async getUserUploads(userId?: string) {
    const query = supabase
      .from('uploads')
      .select(`
        *,
        dccs_certificates!dccs_certificate_id (
          id,
          certificate_id,
          clearance_code,
          audio_fingerprint,
          public_verification_url,
          licensing_status,
          lifetime_tracking_enabled
        )
      `)
      .order('created_at', { ascending: false });

    if (userId) {
      query.eq('user_id', userId);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data;
  }

  async getUploadStats() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase.rpc('get_user_upload_stats', {
      user_uuid: user.id,
    });

    if (error) throw error;
    return data[0];
  }

  async deleteUpload(uploadId: string): Promise<void> {
    const { data: upload, error: fetchError } = await supabase
      .from('uploads')
      .select('storage_path')
      .eq('id', uploadId)
      .single();

    if (fetchError) throw fetchError;

    // Delete from storage
    const { error: storageError } = await supabase.storage
      .from('user-uploads')
      .remove([upload.storage_path]);

    if (storageError) throw storageError;

    // Delete from database (cascades to chunks)
    const { error: dbError } = await supabase
      .from('uploads')
      .delete()
      .eq('id', uploadId);

    if (dbError) throw dbError;
  }

  async retryFailedUpload(uploadId: string): Promise<void> {
    // Reset upload status to allow retry
    const { error } = await supabase
      .from('uploads')
      .update({
        upload_status: 'uploading',
        processing_progress: 0,
        error_message: null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', uploadId);

    if (error) throw error;
  }
}

export const uploadManager = new UploadManager();
