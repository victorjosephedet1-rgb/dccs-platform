import { supabase } from './supabase';

export interface VersionInfo {
  version: string;
  buildDate: string;
}

export interface DeploymentVersion {
  id: string;
  version_number: string;
  commit_hash: string | null;
  deployed_at: string;
  deployment_status: string;
  changes_summary: any;
  affected_files: string[] | null;
  build_duration_seconds: number | null;
  metadata: any;
}

export class VersionService {
  private static currentVersion: VersionInfo | null = null;
  private static listeners: Array<(hasUpdate: boolean, newVersion?: DeploymentVersion) => void> = [];

  static async getCurrentVersion(): Promise<VersionInfo> {
    if (this.currentVersion) {
      return this.currentVersion;
    }

    try {
      const response = await fetch('/version.json');
      const versionData = await response.json();
      this.currentVersion = versionData;
      return versionData;
    } catch (error) {
      console.error('Failed to fetch current version:', error);
      return {
        version: '1.0.0',
        buildDate: new Date().toISOString(),
      };
    }
  }

  static async getLatestDeployment(): Promise<DeploymentVersion | null> {
    try {
      const { data, error } = await supabase
        .from('deployment_versions')
        .select('*')
        .eq('deployment_status', 'deployed')
        .order('deployed_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error('Error fetching latest deployment:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Failed to fetch latest deployment:', error);
      return null;
    }
  }

  static async checkForUpdates(): Promise<{ hasUpdate: boolean; newVersion?: DeploymentVersion }> {
    try {
      const currentVersion = await this.getCurrentVersion();
      const latestDeployment = await this.getLatestDeployment();

      if (!latestDeployment) {
        return { hasUpdate: false };
      }

      const hasUpdate = latestDeployment.version_number !== currentVersion.version;

      if (hasUpdate) {
        this.notifyListeners(true, latestDeployment);
      }

      return {
        hasUpdate,
        newVersion: hasUpdate ? latestDeployment : undefined,
      };
    } catch (error) {
      console.error('Error checking for updates:', error);
      return { hasUpdate: false };
    }
  }

  static subscribeToUpdates(callback: (hasUpdate: boolean, newVersion?: DeploymentVersion) => void): () => void {
    this.listeners.push(callback);

    return () => {
      this.listeners = this.listeners.filter(listener => listener !== callback);
    };
  }

  private static notifyListeners(hasUpdate: boolean, newVersion?: DeploymentVersion) {
    this.listeners.forEach(listener => {
      try {
        listener(hasUpdate, newVersion);
      } catch (error) {
        console.error('Error in version update listener:', error);
      }
    });
  }

  static async getAllDeployments(limit = 10): Promise<DeploymentVersion[]> {
    try {
      const { data, error } = await supabase
        .from('deployment_versions')
        .select('*')
        .order('deployed_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Error fetching deployments:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Failed to fetch deployments:', error);
      return [];
    }
  }

  static async getDeploymentLogs(deploymentId: string) {
    try {
      const { data, error } = await supabase
        .from('deployment_logs')
        .select('*')
        .eq('deployment_version_id', deploymentId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching deployment logs:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Failed to fetch deployment logs:', error);
      return [];
    }
  }

  static async getCustomerInstances() {
    try {
      const { data, error } = await supabase
        .from('customer_instances')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching customer instances:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Failed to fetch customer instances:', error);
      return [];
    }
  }

  static async refreshApp() {
    window.location.reload();
  }

  static startAutoUpdateCheck(intervalMinutes = 5) {
    this.checkForUpdates();

    const intervalMs = intervalMinutes * 60 * 1000;
    const intervalId = setInterval(() => {
      this.checkForUpdates();
    }, intervalMs);

    return () => clearInterval(intervalId);
  }
}
