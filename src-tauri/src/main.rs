// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]


use tauri::command;
use serde::{Deserialize, Serialize};
use reqwest::Client;

#[derive(Serialize, Deserialize)]
struct ApiResponse {
    success: bool,
    data: Option<serde_json::Value>,
    error: Option<String>,
}

#[command]
async fn make_request(
    method: String,
    url: String,
    body: Option<serde_json::Value>,
) -> Result<ApiResponse, String> {
    let client = Client::new();

    let response = match method.as_str() {
        "GET" => client.get(&url).send().await,
        "POST" => client.post(&url).json(&body.unwrap_or_default()).send().await,
        "PUT" => client.put(&url).json(&body.unwrap_or_default()).send().await,
        "DELETE" => client.delete(&url).send().await,
        _ => return Err("Invalid HTTP method".into()),
    };

    match response {
        Ok(resp) => {
            let status = resp.status().is_success();
            let json = resp.json::<serde_json::Value>().await.unwrap_or_default();
            Ok(ApiResponse {
                success: status,
                data: Some(json),
                error: None,
            })
        }
        Err(err) => Ok(ApiResponse {
            success: false,
            data: None,
            error: Some(err.to_string()),
        }),
    }
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![make_request])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

