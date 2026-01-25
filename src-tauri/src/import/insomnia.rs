use super::types::*;
use crate::error::{AppError, AppResult};
use serde::Deserialize;
use serde_json::Value;
use std::collections::HashMap;

/// Insomnia Export Format v4
#[derive(Debug, Deserialize)]
struct InsomniaExport {
    #[serde(rename = "__export_format")]
    export_format: u32,
    resources: Vec<InsomniaResource>,
}

#[derive(Debug, Deserialize)]
#[serde(tag = "_type")]
enum InsomniaResource {
    #[serde(rename = "request")]
    Request(InsomniaRequest),
    #[serde(rename = "request_group")]
    RequestGroup(InsomniaRequestGroup),
    #[serde(rename = "workspace")]
    Workspace(InsomniaWorkspace),
    #[serde(rename = "environment")]
    Environment(InsomniaEnvironment),
    #[serde(rename = "cookie_jar")]
    #[allow(dead_code)]
    CookieJar(Value),
    #[serde(other)]
    Other,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
struct InsomniaRequest {
    #[serde(rename = "_id")]
    _id: String,
    name: String,
    url: String,
    method: String,
    body: Option<InsomniaBody>,
    parameters: Option<Vec<InsomniaParam>>,
    headers: Option<Vec<InsomniaHeader>>,
    authentication: Option<InsomniaAuth>,
    #[serde(default)]
    description: Option<String>,
    parent_id: String,
}

#[derive(Debug, Clone, Deserialize)]
#[serde(rename_all = "camelCase")]
struct InsomniaRequestGroup {
    #[serde(rename = "_id")]
    _id: String,
    name: String,
    parent_id: String,
    #[serde(default)]
    #[allow(dead_code)]
    description: Option<String>,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
struct InsomniaWorkspace {
    #[serde(rename = "_id")]
    _id: String,
    name: String,
    #[serde(default)]
    #[allow(dead_code)]
    description: Option<String>,
}

#[derive(Debug, Clone, Deserialize)]
#[serde(rename_all = "camelCase")]
struct InsomniaEnvironment {
    #[serde(rename = "_id")]
    _id: String,
    #[allow(dead_code)]
    name: String,
    data: HashMap<String, Value>,
    #[allow(dead_code)]
    parent_id: Option<String>,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
struct InsomniaBody {
    mime_type: Option<String>,
    text: Option<String>,
}

#[derive(Debug, Deserialize)]
struct InsomniaParam {
    name: String,
    value: String,
    #[serde(default = "default_false")]
    disabled: bool,
}

#[derive(Debug, Deserialize)]
struct InsomniaHeader {
    name: String,
    value: String,
    #[serde(default = "default_false")]
    #[allow(dead_code)]
    disabled: bool,
}

#[derive(Debug, Deserialize)]
struct InsomniaAuth {
    #[serde(rename = "type")]
    auth_type: String,
    #[serde(default)]
    username: Option<String>,
    #[serde(default)]
    password: Option<String>,
    #[serde(default)]
    token: Option<String>,
    #[serde(default)]
    #[allow(dead_code)]
    prefix: Option<String>,
}

fn default_false() -> bool {
    false
}

/// Parse Insomnia workspace export JSON
pub fn parse_insomnia_workspace(json_content: &str) -> AppResult<ImportResult> {
    let export: InsomniaExport = serde_json::from_str(json_content)
        .map_err(|e| AppError::parse(format!("Invalid Insomnia export format: {}", e)))?;

    // Validate export format version
    if export.export_format != 4 {
        return Err(AppError::parse(format!(
            "Unsupported Insomnia export format version: {}. Only version 4 is supported.",
            export.export_format
        )));
    }

    // First pass: collect workspace info, groups, and environments
    let mut workspace_name = String::from("Insomnia Import");
    let mut groups: HashMap<String, InsomniaRequestGroup> = HashMap::new();
    let mut environments: HashMap<String, InsomniaEnvironment> = HashMap::new();

    for resource in &export.resources {
        match resource {
            InsomniaResource::Workspace(workspace) => {
                workspace_name = workspace.name.clone();
            }
            InsomniaResource::RequestGroup(group) => {
                groups.insert(group._id.clone(), group.clone());
            }
            InsomniaResource::Environment(env) => {
                environments.insert(env._id.clone(), env.clone());
            }
            _ => {}
        }
    }

    let folder_name = sanitize_folder_name(&workspace_name);
    let mut all_requests = Vec::new();
    let mut all_variables = Vec::new();

    // Extract variables from environments
    for (_, env) in &environments {
        for (key, value) in &env.data {
            let value_string = extract_json_value(value);
            all_variables.push(ImportedVariable {
                key: key.clone(),
                value: value_string,
                enabled: true,
            });
        }
    }

    // Second pass: process requests
    for resource in &export.resources {
        if let InsomniaResource::Request(request) = resource {
            let path = build_group_path(&request.parent_id, &groups);
            let prefix = if path.is_empty() {
                folder_name.clone()
            } else {
                format!("{}/{}", folder_name, path)
            };

            let imported_request = parse_insomnia_request(request, &prefix)?;
            all_requests.push(imported_request);
        }
    }

    Ok(ImportResult::success(folder_name, all_requests, all_variables))
}

fn build_group_path(
    parent_id: &str,
    groups: &HashMap<String, InsomniaRequestGroup>,
) -> String {
    if let Some(group) = groups.get(parent_id) {
        let parent_path = build_group_path(&group.parent_id, groups);
        if parent_path.is_empty() {
            sanitize_folder_name(&group.name)
        } else {
            format!("{}/{}", parent_path, sanitize_folder_name(&group.name))
        }
    } else {
        String::new()
    }
}

fn parse_insomnia_request(
    request: &InsomniaRequest,
    prefix: &str,
) -> AppResult<ImportedRequest> {
    let file_name = format!("{}_{}", prefix, sanitize_file_name(&request.name));

    // Parse query parameters
    let mut query_params = Vec::new();
    if let Some(params) = &request.parameters {
        for param in params {
            query_params.push(QueryParam {
                key: param.name.clone(),
                value: param.value.clone(),
                enabled: !param.disabled,
            });
        }
    }

    // Create base request data
    let mut request_data = RequestData::new(request.method.to_uppercase(), request.url.clone())
        .with_query_params(query_params);

    // Parse authentication
    if let Some(auth) = &request.authentication {
        let auth_type = parse_insomnia_auth(auth)?;
        request_data = request_data.with_auth(auth_type);
    }

    // Check for Authorization header as fallback
    if request_data.bearer_token.is_none() && request_data.username.is_none() {
        if let Some(headers) = &request.headers {
            for header in headers {
                if header.name.to_lowercase() == "authorization" {
                    if header.value.starts_with("Bearer ") {
                        request_data.bearer_token = Some(header.value[7..].to_string());
                    } else if header.value.starts_with("Basic ") {
                        request_data.bearer_token = Some(header.value.clone());
                    }
                }
            }
        }
    }

    // Parse body
    if let Some(body) = &request.body {
        request_data = parse_insomnia_body(body, request_data)?;
    }

    // Add description
    if let Some(desc) = &request.description {
        request_data = request_data.with_description(desc.clone());
    }

    Ok(ImportedRequest::new(file_name, request_data).with_display_name(request.name.clone()))
}

fn parse_insomnia_auth(auth: &InsomniaAuth) -> AppResult<ImportAuthType> {
    match auth.auth_type.as_str() {
        "basic" => {
            let username = auth.username.clone().unwrap_or_default();
            let password = auth.password.clone().unwrap_or_default();
            Ok(ImportAuthType::Basic { username, password })
        }
        "bearer" => {
            let token = auth.token.clone().unwrap_or_default();
            Ok(ImportAuthType::Bearer { token })
        }
        "oauth2" => {
            // OAuth2 is complex, we'll treat it as a bearer token placeholder
            let token = auth.token.clone().unwrap_or_else(|| {
                "{{oauth2_token}}".to_string()
            });
            Ok(ImportAuthType::Bearer { token })
        }
        _ => Ok(ImportAuthType::None),
    }
}

fn parse_insomnia_body(body: &InsomniaBody, mut request_data: RequestData) -> AppResult<RequestData> {
    if let Some(text) = &body.text {
        if let Some(mime_type) = &body.mime_type {
            // Check if it's GraphQL
            if mime_type.contains("graphql") || text.trim_start().starts_with("query") || text.trim_start().starts_with("mutation") {
                // Try to parse as GraphQL
                // Insomnia stores GraphQL as plain text, so we need to detect it
                request_data = request_data.with_graphql(text.clone(), None);
                return Ok(request_data);
            }
        }
        request_data = request_data.with_body(text.clone());
    }
    Ok(request_data)
}

fn extract_json_value(value: &Value) -> String {
    match value {
        Value::String(s) => s.clone(),
        Value::Number(n) => n.to_string(),
        Value::Bool(b) => b.to_string(),
        Value::Null => String::new(),
        Value::Array(arr) => serde_json::to_string(arr).unwrap_or_default(),
        Value::Object(obj) => serde_json::to_string(obj).unwrap_or_default(),
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
    fn test_parse_simple_insomnia_export() {
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
                    "name": "Get Users",
                    "url": "https://api.example.com/users",
                    "method": "GET",
                    "parentId": "wrk_1",
                    "body": {},
                    "parameters": [],
                    "headers": []
                }
            ]
        }"#;

        let result = parse_insomnia_workspace(json);
        if let Err(ref e) = result {
            eprintln!("Parse error: {}", e);
        }
        assert!(result.is_ok());

        let import_result = result.unwrap();
        assert!(import_result.success);
        assert_eq!(import_result.folder_name, "Test Workspace");
        assert_eq!(import_result.requests.len(), 1);
        assert_eq!(import_result.requests[0].file_data.method, "GET");
    }

    #[test]
    fn test_parse_insomnia_with_auth() {
        let json = r#"{
            "__export_format": 4,
            "resources": [
                {
                    "_type": "workspace",
                    "_id": "wrk_1",
                    "name": "Auth Workspace"
                },
                {
                    "_type": "request",
                    "_id": "req_1",
                    "name": "Bearer Request",
                    "url": "https://api.example.com/data",
                    "method": "POST",
                    "parentId": "wrk_1",
                    "body": {},
                    "parameters": [],
                    "headers": [],
                    "authentication": {
                        "type": "bearer",
                        "token": "test-token-123"
                    }
                }
            ]
        }"#;

        let result = parse_insomnia_workspace(json);
        if let Err(ref e) = result {
            eprintln!("Parse error: {}", e);
        }
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
    fn test_parse_insomnia_with_environment() {
        let json = r#"{
            "__export_format": 4,
            "resources": [
                {
                    "_type": "workspace",
                    "_id": "wrk_1",
                    "name": "Env Workspace"
                },
                {
                    "_type": "environment",
                    "_id": "env_1",
                    "name": "Base Environment",
                    "data": {
                        "baseUrl": "https://api.example.com",
                        "apiKey": "secret-key"
                    }
                }
            ]
        }"#;

        let result = parse_insomnia_workspace(json);
        if let Err(ref e) = result {
            eprintln!("Parse error: {}", e);
        }
        assert!(result.is_ok());

        let import_result = result.unwrap();
        assert_eq!(import_result.variables.len(), 2);
    }

    #[test]
    fn test_parse_invalid_version() {
        let json = r#"{
            "__export_format": 3,
            "resources": []
        }"#;

        let result = parse_insomnia_workspace(json);
        assert!(result.is_err());
    }

    #[test]
    fn test_sanitize_names() {
        assert_eq!(sanitize_folder_name("Test/Workspace"), "Test_Workspace");
        assert_eq!(sanitize_file_name("Get Users List"), "Get_Users_List");
    }
}
