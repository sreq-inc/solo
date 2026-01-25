use super::types::*;
use crate::error::{AppError, AppResult};
use serde::Deserialize;
use serde_json::Value;

/// Postman Collection v2.1 and v2.0 format
#[derive(Debug, Deserialize)]
struct PostmanCollection {
    info: PostmanInfo,
    item: Vec<PostmanItem>,
    variable: Option<Vec<PostmanVariable>>,
}

#[derive(Debug, Deserialize)]
struct PostmanInfo {
    name: String,
    #[serde(default)]
    #[allow(dead_code)]
    description: Option<String>,
}

#[derive(Debug, Deserialize)]
#[serde(untagged)]
enum PostmanItem {
    Folder {
        name: String,
        item: Vec<PostmanItem>,
        #[serde(default)]
        variable: Option<Vec<PostmanVariable>>,
    },
    Request {
        name: String,
        request: PostmanRequest,
        #[serde(default)]
        #[allow(dead_code)]
        response: Option<Vec<Value>>,
    },
}

#[derive(Debug, Deserialize)]
#[serde(untagged)]
enum PostmanRequest {
    String(String),
    Object {
        method: String,
        #[serde(default)]
        header: Vec<PostmanHeader>,
        url: PostmanUrl,
        #[serde(default)]
        body: Option<PostmanBody>,
        #[serde(default)]
        auth: Option<PostmanAuth>,
        #[serde(default)]
        description: Option<String>,
    },
}

#[derive(Debug, Deserialize)]
#[serde(untagged)]
enum PostmanUrl {
    String(String),
    Object {
        raw: String,
        #[serde(default)]
        query: Option<Vec<PostmanQueryParam>>,
    },
}

#[derive(Debug, Deserialize)]
struct PostmanHeader {
    key: String,
    value: String,
    #[serde(default = "default_true")]
    #[allow(dead_code)]
    enabled: bool,
}

#[derive(Debug, Deserialize)]
struct PostmanQueryParam {
    key: String,
    value: String,
    #[serde(default = "default_true")]
    disabled: bool,
}

#[derive(Debug, Deserialize)]
struct PostmanBody {
    mode: String,
    #[serde(default)]
    raw: Option<String>,
    #[serde(default)]
    options: Option<Value>,
    #[serde(default)]
    graphql: Option<PostmanGraphQL>,
}

#[derive(Debug, Deserialize)]
struct PostmanGraphQL {
    query: String,
    #[serde(default)]
    variables: Option<String>,
}

#[derive(Debug, Deserialize)]
struct PostmanAuth {
    #[serde(rename = "type")]
    auth_type: String,
    #[serde(default)]
    basic: Option<Vec<PostmanAuthParam>>,
    #[serde(default)]
    bearer: Option<Vec<PostmanAuthParam>>,
    #[serde(default)]
    apikey: Option<Vec<PostmanAuthParam>>,
}

#[derive(Debug, Deserialize)]
struct PostmanAuthParam {
    key: String,
    value: Value,
}

#[derive(Debug, Deserialize)]
struct PostmanVariable {
    key: String,
    value: String,
    #[serde(default = "default_true")]
    enabled: bool,
}

fn default_true() -> bool {
    true
}

/// Parse Postman collection JSON
pub fn parse_postman_collection(json_content: &str) -> AppResult<ImportResult> {
    let collection: PostmanCollection = serde_json::from_str(json_content)
        .map_err(|e| AppError::parse(format!("Invalid Postman collection format: {}", e)))?;

    let folder_name = sanitize_folder_name(&collection.info.name);
    let mut all_requests = Vec::new();
    let mut all_variables = Vec::new();

    // Parse collection-level variables
    if let Some(vars) = collection.variable {
        for var in vars {
            all_variables.push(ImportedVariable {
                key: var.key,
                value: var.value,
                enabled: var.enabled,
            });
        }
    }

    // Parse items (can be nested folders or requests)
    parse_postman_items(&collection.item, &folder_name, &mut all_requests, &mut all_variables)?;

    Ok(ImportResult::success(folder_name, all_requests, all_variables))
}

fn parse_postman_items(
    items: &[PostmanItem],
    prefix: &str,
    requests: &mut Vec<ImportedRequest>,
    variables: &mut Vec<ImportedVariable>,
) -> AppResult<()> {
    for item in items {
        match item {
            PostmanItem::Folder { name, item: sub_items, variable } => {
                // Add folder variables
                if let Some(vars) = variable {
                    for var in vars {
                        variables.push(ImportedVariable {
                            key: var.key.clone(),
                            value: var.value.clone(),
                            enabled: var.enabled,
                        });
                    }
                }
                // Recursively parse folder items
                let new_prefix = format!("{}/{}", prefix, sanitize_folder_name(name));
                parse_postman_items(sub_items, &new_prefix, requests, variables)?;
            }
            PostmanItem::Request { name, request, .. } => {
                let imported_request = parse_postman_request(name, request, prefix)?;
                requests.push(imported_request);
            }
        }
    }
    Ok(())
}

fn parse_postman_request(
    name: &str,
    request: &PostmanRequest,
    prefix: &str,
) -> AppResult<ImportedRequest> {
    match request {
        PostmanRequest::String(url) => {
            // Simple string URL (v1.0 format or simplified)
            let file_name = format!("{}_{}", prefix, sanitize_file_name(name));
            let request_data = RequestData::new("GET".to_string(), url.clone());
            Ok(ImportedRequest::new(file_name, request_data).with_display_name(name.to_string()))
        }
        PostmanRequest::Object {
            method,
            url,
            body,
            auth,
            header,
            description,
            ..
        } => {
            let file_name = format!("{}_{}", prefix, sanitize_file_name(name));

            // Parse URL
            let (url_string, query_params) = parse_postman_url(url)?;

            // Create base request data
            let mut request_data = RequestData::new(method.to_uppercase(), url_string)
                .with_query_params(query_params);

            // Parse authentication
            if let Some(auth) = auth {
                let auth_type = parse_postman_auth(auth)?;
                request_data = request_data.with_auth(auth_type);
            }

            // Check for Authorization header as fallback
            if request_data.bearer_token.is_none() && request_data.username.is_none() {
                for header in header {
                    if header.key.to_lowercase() == "authorization" {
                        if header.value.starts_with("Bearer ") {
                            request_data.bearer_token = Some(header.value[7..].to_string());
                        } else if header.value.starts_with("Basic ") {
                            // Basic auth is base64 encoded, we'll leave it as bearer for now
                            request_data.bearer_token = Some(header.value.clone());
                        }
                    }
                }
            }

            // Parse body
            if let Some(body) = body {
                request_data = parse_postman_body(body, request_data)?;
            }

            // Add description
            if let Some(desc) = description {
                request_data = request_data.with_description(desc.clone());
            }

            Ok(ImportedRequest::new(file_name, request_data).with_display_name(name.to_string()))
        }
    }
}

fn parse_postman_url(url: &PostmanUrl) -> AppResult<(String, Vec<QueryParam>)> {
    match url {
        PostmanUrl::String(url_string) => Ok((url_string.clone(), Vec::new())),
        PostmanUrl::Object { raw, query } => {
            let mut query_params = Vec::new();
            if let Some(params) = query {
                for param in params {
                    query_params.push(QueryParam {
                        key: param.key.clone(),
                        value: param.value.clone(),
                        enabled: !param.disabled,
                    });
                }
            }
            Ok((raw.clone(), query_params))
        }
    }
}

fn parse_postman_auth(auth: &PostmanAuth) -> AppResult<ImportAuthType> {
    match auth.auth_type.as_str() {
        "basic" => {
            if let Some(params) = &auth.basic {
                let mut username = String::new();
                let mut password = String::new();

                for param in params {
                    match param.key.as_str() {
                        "username" => username = extract_string_value(&param.value),
                        "password" => password = extract_string_value(&param.value),
                        _ => {}
                    }
                }

                Ok(ImportAuthType::Basic { username, password })
            } else {
                Ok(ImportAuthType::None)
            }
        }
        "bearer" => {
            if let Some(params) = &auth.bearer {
                for param in params {
                    if param.key == "token" {
                        return Ok(ImportAuthType::Bearer {
                            token: extract_string_value(&param.value),
                        });
                    }
                }
            }
            Ok(ImportAuthType::None)
        }
        "apikey" => {
            if let Some(params) = &auth.apikey {
                let mut key = String::new();
                let mut value = String::new();
                let mut in_header = true;

                for param in params {
                    match param.key.as_str() {
                        "key" => key = extract_string_value(&param.value),
                        "value" => value = extract_string_value(&param.value),
                        "in" => in_header = extract_string_value(&param.value) == "header",
                        _ => {}
                    }
                }

                Ok(ImportAuthType::ApiKey { key, value, in_header })
            } else {
                Ok(ImportAuthType::None)
            }
        }
        _ => Ok(ImportAuthType::None),
    }
}

fn parse_postman_body(body: &PostmanBody, mut request_data: RequestData) -> AppResult<RequestData> {
    match body.mode.as_str() {
        "raw" => {
            if let Some(raw) = &body.raw {
                // Check if it's GraphQL
                if let Some(options) = &body.options {
                    if let Some(lang) = options.get("raw").and_then(|r| r.get("language")) {
                        if lang.as_str() == Some("graphql") {
                            request_data = request_data.with_graphql(raw.clone(), None);
                            return Ok(request_data);
                        }
                    }
                }
                request_data = request_data.with_body(raw.clone());
            }
        }
        "graphql" => {
            if let Some(graphql) = &body.graphql {
                request_data = request_data.with_graphql(
                    graphql.query.clone(),
                    graphql.variables.clone(),
                );
            }
        }
        _ => {
            // For other modes (formdata, urlencoded, etc.), convert to JSON string
            if let Some(raw) = &body.raw {
                request_data = request_data.with_body(raw.clone());
            }
        }
    }
    Ok(request_data)
}

fn extract_string_value(value: &Value) -> String {
    match value {
        Value::String(s) => s.clone(),
        Value::Number(n) => n.to_string(),
        Value::Bool(b) => b.to_string(),
        _ => String::new(),
    }
}

fn sanitize_folder_name(name: &str) -> String {
    name.chars()
        .map(|c| match c {
            '/' | '\\' | ':' | '*' | '?' | '"' | '<' | '>' | '|' => '_',
            _ => c,
        })
        .collect()
}

fn sanitize_file_name(name: &str) -> String {
    name.chars()
        .filter(|c| c.is_alphanumeric() || *c == '_' || *c == '-' || *c == ' ')
        .collect::<String>()
        .replace(' ', "_")
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_parse_simple_postman_collection() {
        let json = r#"{
            "info": {
                "name": "Test Collection",
                "description": "A test collection"
            },
            "item": [
                {
                    "name": "Get Users",
                    "request": {
                        "method": "GET",
                        "url": "https://api.example.com/users"
                    }
                }
            ]
        }"#;

        let result = parse_postman_collection(json);
        assert!(result.is_ok());

        let import_result = result.unwrap();
        assert!(import_result.success);
        assert_eq!(import_result.folder_name, "Test Collection");
        assert_eq!(import_result.requests.len(), 1);
        assert_eq!(import_result.requests[0].file_data.method, "GET");
    }

    #[test]
    fn test_parse_postman_with_auth() {
        let json = r#"{
            "info": {
                "name": "Auth Collection"
            },
            "item": [
                {
                    "name": "Bearer Request",
                    "request": {
                        "method": "POST",
                        "url": "https://api.example.com/data",
                        "auth": {
                            "type": "bearer",
                            "bearer": [
                                {
                                    "key": "token",
                                    "value": "test-token-123"
                                }
                            ]
                        }
                    }
                }
            ]
        }"#;

        let result = parse_postman_collection(json);
        assert!(result.is_ok());

        let import_result = result.unwrap();
        assert_eq!(import_result.requests.len(), 1);
        assert!(import_result.requests[0].file_data.bearer_token.is_some());
        assert_eq!(
            import_result.requests[0].file_data.bearer_token.as_ref().unwrap(),
            "test-token-123"
        );
    }

    #[test]
    fn test_parse_postman_with_variables() {
        let json = r#"{
            "info": {
                "name": "Variables Collection"
            },
            "variable": [
                {
                    "key": "baseUrl",
                    "value": "https://api.example.com",
                    "enabled": true
                }
            ],
            "item": []
        }"#;

        let result = parse_postman_collection(json);
        assert!(result.is_ok());

        let import_result = result.unwrap();
        assert_eq!(import_result.variables.len(), 1);
        assert_eq!(import_result.variables[0].key, "baseUrl");
        assert_eq!(import_result.variables[0].value, "https://api.example.com");
    }

    #[test]
    fn test_parse_invalid_json() {
        let json = "invalid json";
        let result = parse_postman_collection(json);
        assert!(result.is_err());
    }

    #[test]
    fn test_sanitize_names() {
        assert_eq!(sanitize_folder_name("Test/Collection"), "Test_Collection");
        assert_eq!(sanitize_file_name("Get Users List"), "Get_Users_List");
    }
}
