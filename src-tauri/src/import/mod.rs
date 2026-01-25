pub mod insomnia;
pub mod postman;
pub mod types;

pub use types::*;

use tauri::command;

/// Import a Postman collection (v2.0 or v2.1)
#[command]
pub async fn import_postman_collection(json_content: String) -> Result<ImportResult, String> {
    match postman::parse_postman_collection(&json_content) {
        Ok(result) => Ok(result),
        Err(e) => Ok(ImportResult::error(e.to_string())),
    }
}

/// Import an Insomnia workspace (Export Format v4)
#[command]
pub async fn import_insomnia_workspace(json_content: String) -> Result<ImportResult, String> {
    match insomnia::parse_insomnia_workspace(&json_content) {
        Ok(result) => Ok(result),
        Err(e) => Ok(ImportResult::error(e.to_string())),
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn test_import_postman_command() {
        let json = r#"{
            "info": {
                "name": "Test Collection"
            },
            "item": [
                {
                    "name": "Test Request",
                    "request": {
                        "method": "GET",
                        "url": "https://api.example.com/test"
                    }
                }
            ]
        }"#;

        let result = import_postman_collection(json.to_string()).await;
        assert!(result.is_ok());

        let import_result = result.unwrap();
        assert!(import_result.success);
        assert_eq!(import_result.folder_name, "Test Collection");
    }

    #[tokio::test]
    async fn test_import_insomnia_command() {
        let json = r#"{
            "__export_format": 4,
            "resources": [
                {
                    "_type": "workspace",
                    "_id": "wrk_1",
                    "name": "Test Workspace"
                },
                {
                    "_type": "request",
                    "_id": "req_1",
                    "name": "Test Request",
                    "url": "https://api.example.com/test",
                    "method": "GET",
                    "parentId": "wrk_1",
                    "body": {},
                    "parameters": [],
                    "headers": []
                }
            ]
        }"#;

        let result = import_insomnia_workspace(json.to_string()).await;
        assert!(result.is_ok());

        let import_result = result.unwrap();
        if !import_result.success {
            eprintln!("Import error: {:?}", import_result.error);
        }
        assert!(import_result.success);
        assert_eq!(import_result.folder_name, "Test Workspace");
    }

    #[tokio::test]
    async fn test_import_invalid_json() {
        let result = import_postman_collection("invalid json".to_string()).await;
        assert!(result.is_ok());

        let import_result = result.unwrap();
        assert!(!import_result.success);
        assert!(import_result.error.is_some());
    }
}
