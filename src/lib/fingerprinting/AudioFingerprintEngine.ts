/**
 * Audio Fingerprinting Engine - Phase 1 Core Component
 * Engineer: Audio Recognition Specialist
 *
 * Purpose: Perceptual audio fingerprinting for content identification
 * across transformations (compression, pitch shifts, format changes)
 *
 * Algorithm: Spectrogram-based chromaprint with multi-resolution analysis
 */

export interface AudioFingerprint {
  fingerprintHash: string;
  spectralSignature: number[];
  chromaprintData: Uint8Array;
  duration: number;
  sampleRate: number;
  confidence: number;
  metadata: {
    algorithm: string;
    version: string;
    timestamp: string;
  };
}

export interface FingerprintMatch {
  matchedFingerprintId: string;
  similarity: number;
  confidence: number;
  matchType: 'exact' | 'derivative' | 'partial' | 'remix';
  timeOffset?: number;
}

export interface FingerprintConfig {
  spectrogramResolution: number;
  chromaprintDuration: number;
  minConfidenceThreshold: number;
  enableDerivativeDetection: boolean;
}

export class AudioFingerprintEngine {
  private config: FingerprintConfig;
  private readonly SPECTROGRAM_WINDOW_SIZE = 2048;
  private readonly HOP_LENGTH = 512;
  private readonly MEL_BANDS = 128;
  private readonly CHROMA_BINS = 12;
  private readonly MIN_MATCH_THRESHOLD = 0.95;

  constructor(config?: Partial<FingerprintConfig>) {
    this.config = {
      spectrogramResolution: 128,
      chromaprintDuration: 120,
      minConfidenceThreshold: 0.85,
      enableDerivativeDetection: true,
      ...config
    };
  }

  async generateFingerprint(audioBuffer: ArrayBuffer, metadata: {
    filename: string;
    originalFormat: string;
  }): Promise<AudioFingerprint> {
    const audioData = await this.decodeAudioData(audioBuffer);

    const spectralSignature = await this.extractSpectralFeatures(audioData);
    const chromaprintData = await this.generateChromaprint(audioData);
    const fingerprintHash = await this.computeFingerprintHash(spectralSignature, chromaprintData);

    const confidence = this.calculateFingerprintConfidence(spectralSignature);

    return {
      fingerprintHash,
      spectralSignature,
      chromaprintData,
      duration: audioData.duration,
      sampleRate: audioData.sampleRate,
      confidence,
      metadata: {
        algorithm: 'V3B-DCCS-Chromaprint-v1',
        version: '1.0.0',
        timestamp: new Date().toISOString()
      }
    };
  }

  async compareFingerprints(
    source: AudioFingerprint,
    target: AudioFingerprint
  ): Promise<FingerprintMatch | null> {
    const spectralSimilarity = this.computeSpectralSimilarity(
      source.spectralSignature,
      target.spectralSignature
    );

    const chromaSimilarity = this.computeChromaSimilarity(
      source.chromaprintData,
      target.chromaprintData
    );

    const combinedSimilarity = (spectralSimilarity * 0.6) + (chromaSimilarity * 0.4);

    if (combinedSimilarity < this.config.minConfidenceThreshold) {
      return null;
    }

    const matchType = this.determineMatchType(combinedSimilarity, spectralSimilarity);

    return {
      matchedFingerprintId: target.fingerprintHash,
      similarity: combinedSimilarity,
      confidence: Math.min(source.confidence, target.confidence),
      matchType,
      timeOffset: this.detectTimeOffset(source, target)
    };
  }

  async findMatches(
    sourceFingerprint: AudioFingerprint,
    candidateFingerprints: AudioFingerprint[]
  ): Promise<FingerprintMatch[]> {
    const matches: FingerprintMatch[] = [];

    for (const candidate of candidateFingerprints) {
      const match = await this.compareFingerprints(sourceFingerprint, candidate);
      if (match && match.similarity >= this.MIN_MATCH_THRESHOLD) {
        matches.push(match);
      }
    }

    return matches.sort((a, b) => b.similarity - a.similarity);
  }

  private async decodeAudioData(buffer: ArrayBuffer): Promise<{
    samples: Float32Array;
    sampleRate: number;
    duration: number;
    channels: number;
  }> {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const audioBuffer = await audioContext.decodeAudioData(buffer.slice(0));

    const samples = audioBuffer.getChannelData(0);

    return {
      samples,
      sampleRate: audioBuffer.sampleRate,
      duration: audioBuffer.duration,
      channels: audioBuffer.numberOfChannels
    };
  }

  private async extractSpectralFeatures(audioData: {
    samples: Float32Array;
    sampleRate: number;
  }): Promise<number[]> {
    const features: number[] = [];
    const { samples, sampleRate } = audioData;

    const numFrames = Math.floor((samples.length - this.SPECTROGRAM_WINDOW_SIZE) / this.HOP_LENGTH);

    for (let i = 0; i < numFrames; i++) {
      const frameStart = i * this.HOP_LENGTH;
      const frame = samples.slice(frameStart, frameStart + this.SPECTROGRAM_WINDOW_SIZE);

      const spectrum = this.computeFFT(frame);
      const melSpectrum = this.applyMelFilterbank(spectrum, sampleRate);

      features.push(...this.extractPeakFeatures(melSpectrum));
    }

    return this.normalizeFeatures(features);
  }

  private computeFFT(frame: Float32Array): Float32Array {
    const n = frame.length;
    const real = new Float32Array(n);
    const imag = new Float32Array(n);

    for (let i = 0; i < n; i++) {
      real[i] = frame[i] * this.hannWindow(i, n);
      imag[i] = 0;
    }

    this.fft(real, imag);

    const magnitude = new Float32Array(n / 2);
    for (let i = 0; i < n / 2; i++) {
      magnitude[i] = Math.sqrt(real[i] * real[i] + imag[i] * imag[i]);
    }

    return magnitude;
  }

  private fft(real: Float32Array, imag: Float32Array): void {
    const n = real.length;
    if (n <= 1) return;

    const halfN = n / 2;
    const evenReal = new Float32Array(halfN);
    const evenImag = new Float32Array(halfN);
    const oddReal = new Float32Array(halfN);
    const oddImag = new Float32Array(halfN);

    for (let i = 0; i < halfN; i++) {
      evenReal[i] = real[i * 2];
      evenImag[i] = imag[i * 2];
      oddReal[i] = real[i * 2 + 1];
      oddImag[i] = imag[i * 2 + 1];
    }

    this.fft(evenReal, evenImag);
    this.fft(oddReal, oddImag);

    for (let k = 0; k < halfN; k++) {
      const angle = -2 * Math.PI * k / n;
      const cos = Math.cos(angle);
      const sin = Math.sin(angle);

      const tReal = cos * oddReal[k] - sin * oddImag[k];
      const tImag = cos * oddImag[k] + sin * oddReal[k];

      real[k] = evenReal[k] + tReal;
      imag[k] = evenImag[k] + tImag;
      real[k + halfN] = evenReal[k] - tReal;
      imag[k + halfN] = evenImag[k] - tImag;
    }
  }

  private hannWindow(index: number, length: number): number {
    return 0.5 * (1 - Math.cos(2 * Math.PI * index / (length - 1)));
  }

  private applyMelFilterbank(spectrum: Float32Array, sampleRate: number): Float32Array {
    const melSpectrum = new Float32Array(this.MEL_BANDS);
    const melMin = this.hzToMel(0);
    const melMax = this.hzToMel(sampleRate / 2);
    const melStep = (melMax - melMin) / (this.MEL_BANDS + 1);

    for (let i = 0; i < this.MEL_BANDS; i++) {
      const melCenter = melMin + (i + 1) * melStep;
      const hzCenter = this.melToHz(melCenter);
      const binCenter = Math.floor(hzCenter * spectrum.length * 2 / sampleRate);

      let energy = 0;
      const windowSize = 3;
      for (let j = Math.max(0, binCenter - windowSize);
           j < Math.min(spectrum.length, binCenter + windowSize); j++) {
        energy += spectrum[j];
      }
      melSpectrum[i] = energy;
    }

    return melSpectrum;
  }

  private hzToMel(hz: number): number {
    return 2595 * Math.log10(1 + hz / 700);
  }

  private melToHz(mel: number): number {
    return 700 * (Math.pow(10, mel / 2595) - 1);
  }

  private extractPeakFeatures(melSpectrum: Float32Array): number[] {
    const peaks: number[] = [];
    const threshold = this.calculateAdaptiveThreshold(melSpectrum);

    for (let i = 1; i < melSpectrum.length - 1; i++) {
      if (melSpectrum[i] > melSpectrum[i - 1] &&
          melSpectrum[i] > melSpectrum[i + 1] &&
          melSpectrum[i] > threshold) {
        peaks.push(i, melSpectrum[i]);
      }
    }

    return peaks.slice(0, 20);
  }

  private calculateAdaptiveThreshold(spectrum: Float32Array): number {
    const sorted = Array.from(spectrum).sort((a, b) => b - a);
    return sorted[Math.floor(sorted.length * 0.1)];
  }

  private normalizeFeatures(features: number[]): number[] {
    if (features.length === 0) return features;

    const max = Math.max(...features.map(Math.abs));
    if (max === 0) return features;

    return features.map(f => f / max);
  }

  private async generateChromaprint(audioData: {
    samples: Float32Array;
    sampleRate: number;
  }): Promise<Uint8Array> {
    const chromaFeatures: number[][] = [];
    const { samples, sampleRate } = audioData;

    const numFrames = Math.floor((samples.length - this.SPECTROGRAM_WINDOW_SIZE) / this.HOP_LENGTH);

    for (let i = 0; i < numFrames; i++) {
      const frameStart = i * this.HOP_LENGTH;
      const frame = samples.slice(frameStart, frameStart + this.SPECTROGRAM_WINDOW_SIZE);

      const spectrum = this.computeFFT(frame);
      const chroma = this.computeChroma(spectrum, sampleRate);
      chromaFeatures.push(chroma);
    }

    return this.encodeChromaprint(chromaFeatures);
  }

  private computeChroma(spectrum: Float32Array, sampleRate: number): number[] {
    const chroma = new Array(this.CHROMA_BINS).fill(0);

    for (let i = 0; i < spectrum.length; i++) {
      const hz = i * sampleRate / (2 * spectrum.length);
      if (hz < 20) continue;

      const pitch = 12 * Math.log2(hz / 440) + 69;
      const chromaBin = Math.round(pitch) % 12;

      if (chromaBin >= 0 && chromaBin < this.CHROMA_BINS) {
        chroma[chromaBin] += spectrum[i];
      }
    }

    const max = Math.max(...chroma);
    return max > 0 ? chroma.map(c => c / max) : chroma;
  }

  private encodeChromaprint(chromaFeatures: number[][]): Uint8Array {
    const bits: number[] = [];

    for (let i = 1; i < chromaFeatures.length; i++) {
      const diff = chromaFeatures[i].map((val, idx) =>
        val - chromaFeatures[i - 1][idx]
      );

      for (const d of diff) {
        bits.push(d > 0 ? 1 : 0);
      }
    }

    const bytes = new Uint8Array(Math.ceil(bits.length / 8));
    for (let i = 0; i < bits.length; i++) {
      if (bits[i]) {
        bytes[Math.floor(i / 8)] |= 1 << (i % 8);
      }
    }

    return bytes;
  }

  private async computeFingerprintHash(
    spectralSignature: number[],
    chromaprintData: Uint8Array
  ): Promise<string> {
    const combined = new Uint8Array(
      spectralSignature.length * 4 + chromaprintData.length
    );

    const spectralBytes = new Float32Array(spectralSignature).buffer;
    combined.set(new Uint8Array(spectralBytes), 0);
    combined.set(chromaprintData, spectralSignature.length * 4);

    const hashBuffer = await crypto.subtle.digest('SHA-256', combined);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return 'FP-' + hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  private calculateFingerprintConfidence(spectralSignature: number[]): number {
    if (spectralSignature.length === 0) return 0;

    const variance = this.calculateVariance(spectralSignature);
    const peakCount = spectralSignature.filter(v => Math.abs(v) > 0.5).length;
    const peakRatio = peakCount / spectralSignature.length;

    const confidenceScore = Math.min(
      1.0,
      (variance * 0.5 + peakRatio * 0.5)
    );

    return Math.max(0, Math.min(1, confidenceScore));
  }

  private calculateVariance(data: number[]): number {
    const mean = data.reduce((a, b) => a + b, 0) / data.length;
    const variance = data.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / data.length;
    return Math.sqrt(variance);
  }

  private computeSpectralSimilarity(sig1: number[], sig2: number[]): number {
    const minLength = Math.min(sig1.length, sig2.length);
    if (minLength === 0) return 0;

    let dotProduct = 0;
    let norm1 = 0;
    let norm2 = 0;

    for (let i = 0; i < minLength; i++) {
      dotProduct += sig1[i] * sig2[i];
      norm1 += sig1[i] * sig1[i];
      norm2 += sig2[i] * sig2[i];
    }

    const denominator = Math.sqrt(norm1) * Math.sqrt(norm2);
    return denominator > 0 ? dotProduct / denominator : 0;
  }

  private computeChromaSimilarity(chroma1: Uint8Array, chroma2: Uint8Array): number {
    const minLength = Math.min(chroma1.length, chroma2.length);
    if (minLength === 0) return 0;

    let matches = 0;
    for (let i = 0; i < minLength; i++) {
      const xor = chroma1[i] ^ chroma2[i];
      matches += 8 - this.countBits(xor);
    }

    return matches / (minLength * 8);
  }

  private countBits(byte: number): number {
    let count = 0;
    while (byte > 0) {
      count += byte & 1;
      byte >>= 1;
    }
    return count;
  }

  private determineMatchType(
    combinedSimilarity: number,
    spectralSimilarity: number
  ): 'exact' | 'derivative' | 'partial' | 'remix' {
    if (combinedSimilarity > 0.98) return 'exact';
    if (spectralSimilarity > 0.90 && combinedSimilarity > 0.85) return 'derivative';
    if (combinedSimilarity > 0.80) return 'remix';
    return 'partial';
  }

  private detectTimeOffset(source: AudioFingerprint, target: AudioFingerprint): number {
    const durationDiff = Math.abs(source.duration - target.duration);
    return durationDiff < 1 ? 0 : durationDiff;
  }
}

export const audioFingerprintEngine = new AudioFingerprintEngine();
