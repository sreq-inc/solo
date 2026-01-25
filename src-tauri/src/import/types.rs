use serde::{Deserialize, Serialize};

/// Result of importing a collection
#[derive(Debug, Serialize, Deserialize)]
pub struct ImportResult {
    pub success: bool,
    pub folder_name: String,
    pub requests: Vec<ImportedRequest>,
    pub variables: Vec<ImportedVariable>,
    pub error: Option<String>,
}

/// Imported request structure matching Solo's StoredFile format
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ImportedRequest {
    pub file_name: String,
    pub display_name: Option<String>,
    pub file_data: RequestData,
}

/// Request data matching Solo's RequestData format
#[derive(Debug, Clone, Serialize, Deserialize)]
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
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct QueryParam {
    pub key: String,
    pub value: String,
    pub enabled: bool,
}

/// Imported variable
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ImportedVariable {
    pub key: String,
    pub value: String,
    pub enabled: bool,
}

/// Authentication type
#[derive(Debug, Clone)]
pub enum ImportAuthType {
    None,
    Basic { username: String, password: String },
    Bearer { token: String },
    ApiKey { key: String, value: String, in_header: bool },
}

impl RequestData {
    /// Create a new RequestData with default values
    pub fn new(method: String, url: String) -> Self {
        Self {
            method,
            url,
            payload: None,
            username: None,
            password: None,
            use_basic_auth: false,
            bearer_token: None,
            query_params: Vec::new(),
            request_type: "http".to_string(),
            graphql_query: None,
            graphql_variables: None,
            grpc_service: None,
            grpc_method: None,
            grpc_message: None,
            grpc_call_type: None,
            proto_content: None,
            description: None,
        }
    }

    /// Set authentication
    pub fn with_auth(mut self, auth: ImportAuthType) -> Self {
        match auth {
            ImportAuthType::Basic { username, password } => {
                self.username = Some(username);
                self.password = Some(password);
                self.use_basic_auth = true;
            }
            ImportAuthType::Bearer { token } => {
                self.bearer_token = Some(token);
            }
            ImportAuthType::ApiKey { key: _, value, in_header } => {
                // For API key, we'll use bearer token if it's meant for header
                if in_header {
                    self.bearer_token = Some(value);
                }
            }
            ImportAuthType::None => {}
        }
        self
    }

    /// Set body/payload
    pub fn with_body(mut self, body: String) -> Self {
        self.payload = Some(body);
        self
    }

    /// Set query parameters
    pub fn with_query_params(mut self, params: Vec<QueryParam>) -> Self {
        self.query_params = params;
        self
    }

    /// Set request type
    pub fn with_request_type(mut self, request_type: String) -> Self {
        self.request_type = request_type;
        self
    }

    /// Set GraphQL query
    pub fn with_graphql(mut self, query: String, variables: Option<String>) -> Self {
        self.graphql_query = Some(query);
        self.graphql_variables = variables;
        self.request_type = "graphql".to_string();
        self
    }

    /// Set description
    pub fn with_description(mut self, description: String) -> Self {
        self.description = Some(description);
        self
    }
}

impl ImportedRequest {
    /// Create a new imported request
    pub fn new(file_name: String, file_data: RequestData) -> Self {
        Self {
            file_name: file_name.clone(),
            display_name: Some(file_name),
            file_data,
        }
    }

    /// Set display name
    pub fn with_display_name(mut self, display_name: String) -> Self {
        self.display_name = Some(display_name);
        self
    }
}

impl ImportResult {
    /// Create a successful import result
    pub fn success(
        folder_name: String,
        requests: Vec<ImportedRequest>,
        variables: Vec<ImportedVariable>,
    ) -> Self {
        Self {
            success: true,
            folder_name,
            requests,
            variables,
            error: None,
        }
    }

    /// Create a failed import result
    pub fn error(message: String) -> Self {
        Self {
            success: false,
            folder_name: String::new(),
            requests: Vec::new(),
            variables: Vec::new(),
            error: Some(message),
        }
    }
}
