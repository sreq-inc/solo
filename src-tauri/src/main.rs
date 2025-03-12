#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use tauri::command;
use serde::{Deserialize, Serialize};
use reqwest::Client;
use base64::{engine::general_purpose, Engine};

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
    use_basic_auth: Option<bool>,
    username: Option<String>,
    password: Option<String>,
) -> Result<ApiResponse, String> {
    let client = Client::new();
    
    let mut request = match method.as_str() {
        "GET" => client.get(&url),
        "POST" => client.post(&url),
        "PUT" => client.put(&url),
        "DELETE" => client.delete(&url),
        "PATCH" => client.patch(&url),
        _ => return Err("Invalid HTTP method".into()),
    };
    
    if use_basic_auth.unwrap_or(false) {
        let username_str = username.unwrap_or_default();
        let password_str = password.unwrap_or_default();
        
        if !username_str.is_empty() {
            let auth_string = format!("{}:{}", username_str, password_str);
            let auth_header = format!("Basic {}", general_purpose::STANDARD.encode(auth_string));
            request = request.header("Authorization", auth_header);
        }
    }
    
    if method == "POST" || method == "PUT" || method == "PATCH" {
        if let Some(body_value) = body {
            request = request.json(&body_value);
        }
    }
    
    match request.send().await {
        Ok(resp) => {
            let status = resp.status().is_success();
            match resp.json::<serde_json::Value>().await {
                Ok(json) => Ok(ApiResponse {
                    success: status,
                    data: Some(json),
                    error: None,
                }),
                Err(err) => Ok(ApiResponse {
                    success: false,
                    data: None,
                    error: Some(format!("Failed to parse response: {}", err)),
                }),
            }
        },
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
