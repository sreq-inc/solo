pub mod queries;

use reqwest::RequestBuilder;
use serde::{Deserialize, Serialize};

use crate::auth::AuthType;
use crate::client::HttpClient;
use crate::error::AppResult;
use crate::http::ApiResponse;

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct GraphQLRequest {
    pub query: String,
    pub variables: Option<serde_json::Value>,
}

impl GraphQLRequest {
    pub fn new(query: impl Into<String>, variables: Option<serde_json::Value>) -> Self {
        Self {
            query: query.into(),
            variables,
        }
    }

    pub fn introspection() -> Self {
        Self::new(queries::INTROSPECTION_QUERY, None)
    }
}

pub struct GraphQLClient {
    http_client: HttpClient,
}

impl GraphQLClient {
    pub fn new() -> Self {
        Self {
            http_client: HttpClient::new(),
        }
    }

    pub fn build_request(
        &self,
        url: &str,
        request: &GraphQLRequest,
        auth: Option<AuthType>,
    ) -> RequestBuilder {
        let mut req = self.http_client
            .client()
            .post(url)
            .header("Content-Type", "application/json")
            .json(request);

        if let Some(auth) = auth {
            req = auth.apply_to_request(req);
        }

        req
    }

    pub async fn execute(
        &self,
        url: &str,
        request: GraphQLRequest,
        auth: Option<AuthType>,
    ) -> AppResult<ApiResponse> {
        let req = self.build_request(url, &request, auth);
        self.http_client.send_and_parse(req).await
    }

    pub async fn introspect(
        &self,
        url: &str,
        auth: Option<AuthType>,
    ) -> AppResult<ApiResponse> {
        let request = GraphQLRequest::introspection();
        self.execute(url, request, auth).await
    }
}

impl Default for GraphQLClient {
    fn default() -> Self {
        Self::new()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_graphql_request_creation() {
        let query = "query { users { id name } }";
        let variables = Some(serde_json::json!({"limit": 10}));

        let request = GraphQLRequest::new(query, variables.clone());

        assert_eq!(request.query, query);
        assert_eq!(request.variables, variables);
    }

    #[test]
    fn test_introspection_request() {
        let request = GraphQLRequest::introspection();

        assert!(request.query.contains("IntrospectionQuery"));
        assert!(request.variables.is_none());
    }

    #[test]
    fn test_graphql_client_creation() {
        let _client = GraphQLClient::new();
        // Just ensure it compiles and creates successfully
        assert!(true);
    }
}
