mod ergonomic;

use tauri_plugin_log::{Target, TargetKind};

#[tauri::command]
fn test(name: &str) -> String {
    format!("Test, {}! Interop with Rust works!", name)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(
            tauri_plugin_log::Builder::new()
                .targets([
                    Target::new(TargetKind::Stdout),
                    Target::new(TargetKind::Webview),
                    Target::new(TargetKind::LogDir {
                        file_name: Some("logs".to_string()),
                    }),
                ])
                .level(log::LevelFilter::Debug)
                .build(),
        )
        .plugin(tauri_plugin_autostart::Builder::new().build())
        .plugin(tauri_plugin_process::init())
        .plugin(tauri_plugin_os::init())
        .plugin(tauri_plugin_store::Builder::new().build())
        .plugin(tauri_plugin_single_instance::init(|_app, _args, _cwd| {}))
        .plugin(tauri_plugin_clipboard_manager::init())
        .plugin(tauri_plugin_global_shortcut::Builder::new().build())
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_updater::Builder::new().build())
        .invoke_handler(tauri::generate_handler![
            test,
            ergonomic::get_ergonomic_capabilities,
            ergonomic::check_ergonomic_permissions,
            ergonomic::request_ergonomic_permissions,
            ergonomic::simulate_copy,
            ergonomic::simulate_paste
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
