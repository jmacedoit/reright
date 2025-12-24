use serde::Serialize;

// Platform-specific implementations
#[cfg(target_os = "macos")]
mod macos;

#[cfg(target_os = "windows")]
mod windows;

#[cfg(target_os = "linux")]
mod linux;

/// Capabilities of the ergonomic mode on the current platform
#[derive(Debug, Serialize)]
pub struct ErgonomicCapabilities {
    /// Whether this platform supports ergonomic mode at all
    pub platform_supported: bool,
    /// Whether this platform requires special permissions
    pub requires_permissions: bool,
    /// Whether we can show a native permission dialog
    pub has_native_permission_dialog: bool,
}

/// Get the ergonomic mode capabilities for the current platform
#[tauri::command]
pub fn get_ergonomic_capabilities() -> ErgonomicCapabilities {
    #[cfg(target_os = "macos")]
    {
        ErgonomicCapabilities {
            platform_supported: true,
            requires_permissions: true,
            has_native_permission_dialog: true,
        }
    }

    #[cfg(target_os = "windows")]
    {
        ErgonomicCapabilities {
            platform_supported: true,
            requires_permissions: false,
            has_native_permission_dialog: false,
        }
    }

    #[cfg(target_os = "linux")]
    {
        // Linux support not yet implemented
        ErgonomicCapabilities {
            platform_supported: false,
            requires_permissions: false,
            has_native_permission_dialog: false,
        }
    }

    #[cfg(not(any(target_os = "macos", target_os = "windows", target_os = "linux")))]
    {
        ErgonomicCapabilities {
            platform_supported: false,
            requires_permissions: false,
            has_native_permission_dialog: false,
        }
    }
}

/// Check if the required permissions are granted
#[tauri::command]
pub fn check_ergonomic_permissions() -> bool {
    #[cfg(target_os = "macos")]
    {
        macos::check_permissions()
    }

    #[cfg(target_os = "windows")]
    {
        windows::check_permissions()
    }

    #[cfg(target_os = "linux")]
    {
        linux::check_permissions()
    }

    #[cfg(not(any(target_os = "macos", target_os = "windows", target_os = "linux")))]
    {
        false
    }
}

/// Request the required permissions
/// On macOS: Shows native dialog and opens System Settings
/// Returns true if the request was initiated successfully
#[tauri::command]
pub fn request_ergonomic_permissions() -> bool {
    #[cfg(target_os = "macos")]
    {
        macos::request_permissions()
    }

    #[cfg(target_os = "windows")]
    {
        windows::request_permissions()
    }

    #[cfg(target_os = "linux")]
    {
        linux::request_permissions()
    }

    #[cfg(not(any(target_os = "macos", target_os = "windows", target_os = "linux")))]
    {
        false
    }
}

/// Simulate copy command (Cmd+C on macOS, Ctrl+C on Windows/Linux)
#[tauri::command]
pub fn simulate_copy() -> Result<(), String> {
    #[cfg(target_os = "macos")]
    {
        macos::simulate_copy()
    }

    #[cfg(target_os = "windows")]
    {
        windows::simulate_copy()
    }

    #[cfg(target_os = "linux")]
    {
        linux::simulate_copy()
    }

    #[cfg(not(any(target_os = "macos", target_os = "windows", target_os = "linux")))]
    {
        Err("Platform not supported".to_string())
    }
}

/// Simulate paste command (Cmd+V on macOS, Ctrl+V on Windows/Linux)
#[tauri::command]
pub fn simulate_paste() -> Result<(), String> {
    #[cfg(target_os = "macos")]
    {
        macos::simulate_paste()
    }

    #[cfg(target_os = "windows")]
    {
        windows::simulate_paste()
    }

    #[cfg(target_os = "linux")]
    {
        linux::simulate_paste()
    }

    #[cfg(not(any(target_os = "macos", target_os = "windows", target_os = "linux")))]
    {
        Err("Platform not supported".to_string())
    }
}
