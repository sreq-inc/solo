use reqwest::{Client, RequestBuilder};
use std::time::Duration;

use crate::error::{AppError, AppResult};
use crate::http::ApiResponse;

pub struct HttpClient {
    client: Client,
}

impl HttpClient {
    pub fn new() -> Self {
        let client = Client::builder()
            .timeout(Duration::from_secs(30))
            .user_agent("Solo-Client/1.0")
            .pool_max_idle_per_host(4)
            .pool_idle_timeout(Duration::from_secs(30))
            .build()
            .expect("Failed to create HTTP client");

        Self { client }
    }

    pub fn client(&self) -> &Client {
        &self.client
    }

    pub fn build_request(
        &self,
        method: &str,
        url: &str,
        body: Option<serde_json::Value>,
    ) -> AppResult<RequestBuilder> {
        let request = match method.to_uppercase().as_str() {
            "GET" => self.client.get(url),
            "POST" => self.client.post(url),
            "PUT" => self.client.put(url),
            "DELETE" => self.client.delete(url),
            "PATCH" => self.client.patch(url),
            "HEAD" => self.client.head(url),
            "OPTIONS" => self.client.request(reqwest::Method::OPTIONS, url),
            _ => return Err(AppError::validation("method", "Invalid HTTP method")),
        };

        Ok(if let Some(body) = body {
            request.json(&body)
        } else {
            request
        })
    }

    pub async fn send_and_parse(&self, request: RequestBuilder) -> AppResult<ApiResponse> {
        let response = request.send().await?;
        let status = response.status();
        let success = status.is_success();

        // Try to parse as JSON first
        match response.json::<serde_json::Value>().await {
            Ok(json) => Ok(ApiResponse {
                success,
                data: Some(json),
                error: None,
            }),
            Err(json_err) => {
                // If JSON parsing fails, return appropriate error
                if !success {
                    Err(AppError::http(
                        format!("HTTP request failed with status: {}", status),
                        Some(status.as_u16()),
                    ))
                } else {
                    // Success status but invalid JSON
                    Ok(ApiResponse {
                        success: false,
                        data: None,
                        error: Some(format!("Failed to parse response as JSON: {}", json_err)),
                    })
                }
            }
        }
    }

    pub async fn execute_request(
        &self,
        method: &str,
        url: &str,
        body: Option<serde_json::Value>,
    ) -> AppResult<ApiResponse> {
        let request = self.build_request(method, url, body)?;
        self.send_and_parse(request).await
    }
}

impl Default for HttpClient {
    fn default() -> Self {
        Self::new()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_http_client_creation() {
        let _client = HttpClient::new();
        // Ensure client was created successfully
        assert!(true);
    }

    #[test]
    fn test_build_request_valid_methods() {
        let client = HttpClient::new();
        let url = "https://example.com";

        let methods = ["GET", "POST", "PUT", "DELETE", "PATCH", "HEAD", "OPTIONS"];

        for method in methods {
            let result = client.build_request(method, url, None);
            assert!(result.is_ok(), "Method {} should be valid", method);
        }
    }

    #[test]
    fn test_build_request_invalid_method() {
        let client = HttpClient::new();
        let result = client.build_request("INVALID", "https://example.com", None);

        assert!(result.is_err());
        match result.unwrap_err() {
            AppError::ValidationError { field, .. } => assert_eq!(field, "method"),
            _ => panic!("Expected validation error"),
        }
    }

    #[test]
    fn test_build_request_with_body() {
        let client = HttpClient::new();
        let body = Some(serde_json::json!({"key": "value"}));

        let result = client.build_request("POST", "https://example.com", body);
        assert!(result.is_ok());
    }
}
