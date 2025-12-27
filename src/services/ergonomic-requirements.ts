import { invoke } from "@tauri-apps/api/core";

/*
 * Types.
 */

export interface ErgonomicCapabilities {
  platformSupported: boolean;
  requiresPermissions: boolean;
  hasNativePermissionDialog: boolean;
}

/*
 * Service.
 */

export class ErgonomicRequirementsService {
  private cachedCapabilities: ErgonomicCapabilities | null = null;

  /*
   * Results are cached after first call.
   */

  async getCapabilities(): Promise<ErgonomicCapabilities> {
    if (this.cachedCapabilities) {
      return this.cachedCapabilities;
    }

    const capabilities = await invoke<{
      platform_supported: boolean;
      requires_permissions: boolean;
      has_native_permission_dialog: boolean;
    }>("get_ergonomic_capabilities");

    this.cachedCapabilities = {
      platformSupported: capabilities.platform_supported,
      requiresPermissions: capabilities.requires_permissions,
      hasNativePermissionDialog: capabilities.has_native_permission_dialog
    };

    return this.cachedCapabilities;
  }

  /*
   * Only meaningful if `requiresPermissions` is true.
   */

  async checkPermissions(): Promise<boolean> {
    return invoke<boolean>("check_ergonomic_permissions");
  }

  /*
   * Request the required permissions.
   * On macOS: Shows native dialog and opens System Settings.
   * Returns true if the request was initiated successfully.
   * Note: On macOS, permissions don't take effect until app restart.
   */

  async requestPermissions(): Promise<boolean> {
    return invoke<boolean>("request_ergonomic_permissions");
  }
}

export const ergonomicRequirementsService = new ErgonomicRequirementsService();
