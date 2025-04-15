use reqwest::{Client, RequestBuilder};
use serde::{Deserialize, Serialize};
use base64::{engine::general_purpose, Engine};
use tauri::command;

#[derive(Serialize, Deserialize)]
pub struct ApiResponse {
    pub success: bool,
    pub data: Option<serde_json::Value>,
    pub error: Option<String>,
}

fn handle_basic_auth(request: RequestBuilder, username: Option<String>, password: Option<String>) -> RequestBuilder {
    let username_str = username.unwrap_or_default(); 
    let password_str = password.unwrap_or_default();

    if !username_str.is_empty() {
        let auth_string = format!("{}:{}", username_str, password_str);
        let auth_header = format!("Basic {}", general_purpose::STANDARD.encode(auth_string));
        request.header("Authorization", auth_header)
    } else {
        request
    }
}

#[command]
pub async fn make_request(
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
        request = handle_basic_auth(request, username, password);       
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
