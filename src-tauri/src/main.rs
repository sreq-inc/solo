#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod http;

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![http::make_request])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}