#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use tauri::command;
use serde::{Deserialize, Serialize};
use reqwest::Client;
use reqwest::header::{HeaderMap, HeaderValue, AUTHORIZATION};

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
    username: Option<String>,
    password: Option<String>,
    token: Option<String>,
) -> Result<ApiResponse, String> {
    let client = Client::new();
    let mut headers = HeaderMap::new();
    
    if let (Some(username), Some(password)) = (username.as_ref(), password.as_ref()) {
        let auth_string = format!("{}:{}", username, password);
        let encoded = base64::encode(auth_string);
        let basic_auth = format!("Basic {}", encoded);
        
        headers.insert(
            AUTHORIZATION,
            HeaderValue::from_str(&basic_auth).map_err(|e| e.to_string())?
        );
    }
    
    else if let Some(token) = token {
        let bearer_auth = format!("Bearer {}", token);
        
        headers.insert(
            AUTHORIZATION,
            HeaderValue::from_str(&bearer_auth).map_err(|e| e.to_string())?
        );
    }

    let request = match method.as_str() {
        "GET" => client.get(&url),
        "POST" => client.post(&url).json(&body.unwrap_or_default()),
        "PUT" => client.put(&url).json(&body.unwrap_or_default()),
        "DELETE" => client.delete(&url),
        _ => return Err("Invalid HTTP method".into()),
    };
    
    let request_with_headers = request.headers(headers);
    
    match request_with_headers.send().await {
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
