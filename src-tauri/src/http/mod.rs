use serde::{Deserialize, Serialize};
use tauri::command;

use crate::auth::AuthType;
use crate::client::HttpClient;
use crate::error::AppResult;
use crate::graphql::{GraphQLClient, GraphQLRequest};

#[derive(Serialize, Deserialize)]
pub struct ApiResponse {
    pub success: bool,
    pub data: Option<serde_json::Value>,
    pub error: Option<String>,
}

fn app_result_to_result(result: AppResult<ApiResponse>) -> Result<ApiResponse, String> {
    match result {
        Ok(response) => Ok(response),
        Err(error) => Ok(ApiResponse {
            success: false,
            data: None,
            error: Some(error.to_string()),
        }),
    }
}

// Regular HTTP request commands
#[command]
pub async fn plain_request(
    method: String,
    url: String,
    body: Option<serde_json::Value>,
) -> Result<ApiResponse, String> {
    let client = HttpClient::new();
    app_result_to_result(client.execute_request(&method, &url, body).await)
}

#[command]
pub async fn basic_auth_request(
    method: String,
    url: String,
    body: Option<serde_json::Value>,
    username: String,
    password: String,
) -> Result<ApiResponse, String> {
    let client = HttpClient::new();
    let auth = AuthType::Basic { username, password };

    match client.build_request(&method, &url, body) {
        Ok(request) => {
            let request_with_auth = auth.apply_to_request(request);
            app_result_to_result(client.send_and_parse(request_with_auth).await)
        }
        Err(error) => Err(error.to_string()),
    }
}

#[command]
pub async fn bearer_auth_request(
    method: String,
    url: String,
    body: Option<serde_json::Value>,
    bearer_token: String,
) -> Result<ApiResponse, String> {
    let client = HttpClient::new();
    let auth = AuthType::Bearer {
        token: bearer_token,
    };

    match client.build_request(&method, &url, body) {
        Ok(request) => {
            let request_with_auth = auth.apply_to_request(request);
            app_result_to_result(client.send_and_parse(request_with_auth).await)
        }
        Err(error) => Err(error.to_string()),
    }
}

// GraphQL request commands
#[command]
pub async fn graphql_request(
    url: String,
    query: String,
    variables: Option<serde_json::Value>,
) -> Result<ApiResponse, String> {
    let client = GraphQLClient::new();
    let request = GraphQLRequest::new(query, variables);
    app_result_to_result(client.execute(&url, request, None).await)
}

#[command]
pub async fn graphql_basic_auth_request(
    url: String,
    query: String,
    variables: Option<serde_json::Value>,
    username: String,
    password: String,
) -> Result<ApiResponse, String> {
    let client = GraphQLClient::new();
    let request = GraphQLRequest::new(query, variables);
    let auth = AuthType::Basic { username, password };
    app_result_to_result(client.execute(&url, request, Some(auth)).await)
}

#[command]
pub async fn graphql_bearer_auth_request(
    url: String,
    query: String,
    variables: Option<serde_json::Value>,
    bearer_token: String,
) -> Result<ApiResponse, String> {
    let client = GraphQLClient::new();
    let request = GraphQLRequest::new(query, variables);
    let auth = AuthType::Bearer {
        token: bearer_token,
    };
    app_result_to_result(client.execute(&url, request, Some(auth)).await)
}

#[command]
pub async fn graphql_introspection(url: String) -> Result<ApiResponse, String> {
    let client = GraphQLClient::new();
    app_result_to_result(client.introspect(&url, None).await)
}

#[command]
pub async fn graphql_introspection_with_auth(
    url: String,
    auth_type: String,
    token: Option<String>,
    username: Option<String>,
    password: Option<String>,
) -> Result<ApiResponse, String> {
    let client = GraphQLClient::new();
    let auth = AuthType::from_params(&auth_type, token, username, password);

    let auth_option = match auth {
        AuthType::None => None,
        auth => Some(auth),
    };

    app_result_to_result(client.introspect(&url, auth_option).await)
}

#[cfg(test)]
mod tests;
