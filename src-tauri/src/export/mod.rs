pub mod types;

pub use types::*;

use crate::error::{AppError, AppResult};
use serde_json::Value;
use tauri::command;

/// Export a single collection to Solo JSON format
#[command]
pub async fn export_collection(
    folder_name: String,
    collection_data: String,
) -> Result<String, String> {
    match export_collection_internal(&folder_name, &collection_data) {
        Ok(json) => Ok(json),
        Err(e) => Err(e.to_string()),
    }
}

/// Export all collections to Solo JSON format
#[command]
pub async fn export_all_collections(all_data: String) -> Result<String, String> {
    match export_all_collections_internal(&all_data) {
        Ok(json) => Ok(json),
        Err(e) => Err(e.to_string()),
    }
}

fn export_collection_internal(folder_name: &str, collection_data: &str) -> AppResult<String> {
    // Parse collection data (array of requests)
    let requests: Vec<ExportedRequest> = serde_json::from_str(collection_data)
        .map_err(|e| AppError::parse(format!("Failed to parse collection data: {}", e)))?;

    // Load variables for this folder from the variables key
    let variables = Vec::new(); // Variables are loaded separately in the frontend

    let export = SoloExport::new(folder_name.to_string(), requests, variables);

    export
        .to_json()
        .map_err(|e| AppError::internal(format!("Failed to serialize export: {}", e)))
}

fn export_all_collections_internal(all_data: &str) -> AppResult<String> {
    // Parse all data as a map of folder names to request arrays
    let all_collections: serde_json::Map<String, Value> = serde_json::from_str(all_data)
        .map_err(|e| AppError::parse(format!("Failed to parse collections data: {}", e)))?;

    let mut exports = Vec::new();

    for (folder_name, requests_value) in all_collections {
        let requests: Vec<ExportedRequest> = serde_json::from_value(requests_value)
            .map_err(|e| AppError::parse(format!("Failed to parse requests for folder {}: {}", folder_name, e)))?;

        let export = SoloExport::new(folder_name, requests, Vec::new());
        exports.push(export);
    }

    // Create a combined export
    let combined = serde_json::json!({
        "formatVersion": "1.0",
        "exportedAt": chrono::Utc::now().to_rfc3339(),
        "collections": exports
    });

    serde_json::to_string_pretty(&combined)
        .map_err(|e| AppError::internal(format!("Failed to serialize combined export: {}", e)))
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_export_single_collection() {
        let collection_data = r#"[
            {
                "fileName": "test_request",
                "displayName": "Test Request",
                "fileData": {
                    "method": "GET",
                    "url": "https://api.example.com/test",
                    "payload": null,
                    "username": null,
                    "password": null,
                    "useBasicAuth": false,
                    "bearerToken": null,
                    "queryParams": [],
                    "requestType": "http",
                    "graphqlQuery": null,
                    "graphqlVariables": null,
                    "grpcService": null,
                    "grpcMethod": null,
                    "grpcMessage": null,
                    "grpcCallType": null,
                    "protoContent": null,
                    "description": null
                }
            }
        ]"#;

        let result = export_collection_internal("Test Collection", collection_data);
        assert!(result.is_ok());

        let json = result.unwrap();
        assert!(json.contains("Test Collection"));
        assert!(json.contains("formatVersion"));
    }

    #[test]
    fn test_export_invalid_data() {
        let result = export_collection_internal("Test", "invalid json");
        assert!(result.is_err());
    }

    #[tokio::test]
    async fn test_export_collection_command() {
        let collection_data = r#"[
            {
                "fileName": "test_request",
                "displayName": "Test Request",
                "fileData": {
                    "method": "GET",
                    "url": "https://api.example.com/test",
                    "payload": null,
                    "username": null,
                    "password": null,
                    "useBasicAuth": false,
                    "bearerToken": null,
                    "queryParams": [],
                    "requestType": "http",
                    "graphqlQuery": null,
                    "graphqlVariables": null,
                    "grpcService": null,
                    "grpcMethod": null,
                    "grpcMessage": null,
                    "grpcCallType": null,
                    "protoContent": null,
                    "description": null
                }
            }
        ]"#;

        let result = export_collection("Test Collection".to_string(), collection_data.to_string()).await;
        assert!(result.is_ok());
    }

    #[tokio::test]
    async fn test_export_all_collections_command() {
        let all_data = r#"{
            "Collection 1": [
                {
                    "fileName": "test_request_1",
                    "displayName": "Test Request 1",
                    "fileData": {
                        "method": "GET",
                        "url": "https://api.example.com/test1",
                        "payload": null,
                        "username": null,
                        "password": null,
                        "useBasicAuth": false,
                        "bearerToken": null,
                        "queryParams": [],
                        "requestType": "http",
                        "graphqlQuery": null,
                        "graphqlVariables": null,
                        "grpcService": null,
                        "grpcMethod": null,
                        "grpcMessage": null,
                        "grpcCallType": null,
                        "protoContent": null,
                        "description": null
                    }
                }
            ],
            "Collection 2": [
                {
                    "fileName": "test_request_2",
                    "displayName": "Test Request 2",
                    "fileData": {
                        "method": "POST",
                        "url": "https://api.example.com/test2",
                        "payload": null,
                        "username": null,
                        "password": null,
                        "useBasicAuth": false,
                        "bearerToken": null,
                        "queryParams": [],
                        "requestType": "http",
                        "graphqlQuery": null,
                        "graphqlVariables": null,
                        "grpcService": null,
                        "grpcMethod": null,
                        "grpcMessage": null,
                        "grpcCallType": null,
                        "protoContent": null,
                        "description": null
                    }
                }
            ]
        }"#;

        let result = export_all_collections(all_data.to_string()).await;
        assert!(result.is_ok());

        let json = result.unwrap();
        assert!(json.contains("Collection 1"));
        assert!(json.contains("Collection 2"));
    }
}
