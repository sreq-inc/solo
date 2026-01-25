use serde::{Deserialize, Serialize};

/// Solo export format - represents a complete collection export
#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct SoloExport {
    pub format_version: String,
    pub exported_at: String,
    pub collection_name: String,
    pub requests: Vec<ExportedRequest>,
    pub variables: Vec<ExportedVariable>,
}

/// Exported request in Solo format
#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ExportedRequest {
    pub file_name: String,
    pub display_name: Option<String>,
    pub file_data: RequestData,
}

/// Request data for export
#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct RequestData {
    pub method: String,
    pub url: String,
    pub payload: Option<String>,
    pub username: Option<String>,
    pub password: Option<String>,
    pub use_basic_auth: bool,
    pub bearer_token: Option<String>,
    pub query_params: Vec<QueryParam>,
    pub request_type: String,
    pub graphql_query: Option<String>,
    pub graphql_variables: Option<String>,
    pub grpc_service: Option<String>,
    pub grpc_method: Option<String>,
    pub grpc_message: Option<String>,
    pub grpc_call_type: Option<String>,
    pub proto_content: Option<String>,
    pub description: Option<String>,
}

/// Query parameter
#[derive(Debug, Serialize, Deserialize)]
pub struct QueryParam {
    pub key: String,
    pub value: String,
    pub enabled: bool,
}

/// Exported variable
#[derive(Debug, Serialize, Deserialize)]
pub struct ExportedVariable {
    pub key: String,
    pub value: String,
    pub enabled: bool,
}

impl SoloExport {
    /// Create a new Solo export
    pub fn new(collection_name: String, requests: Vec<ExportedRequest>, variables: Vec<ExportedVariable>) -> Self {
        Self {
            format_version: "1.0".to_string(),
            exported_at: chrono::Utc::now().to_rfc3339(),
            collection_name,
            requests,
            variables,
        }
    }

    /// Convert to JSON string
    pub fn to_json(&self) -> Result<String, serde_json::Error> {
        serde_json::to_string_pretty(self)
    }
}
