#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

pub mod http;

fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_os::init())
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_updater::Builder::new().build())
        .invoke_handler(tauri::generate_handler![
            http::plain_request,
            http::basic_auth_request,
            http::bearer_auth_request,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
