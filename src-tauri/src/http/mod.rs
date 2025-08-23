use base64::{engine::general_purpose, Engine};
use reqwest::{Client, RequestBuilder};
use serde::{Deserialize, Serialize};
use tauri::command;

#[derive(Serialize, Deserialize)]
pub struct ApiResponse {
    pub success: bool,
    pub data: Option<serde_json::Value>,
    pub error: Option<String>,
}

#[derive(Serialize, Deserialize)]
pub struct GraphQLRequest {
    pub query: String,
    pub variables: Option<serde_json::Value>,
}

fn build_request(
    client: &Client,
    method: &str,
    url: &str,
    body: Option<serde_json::Value>,
) -> Result<RequestBuilder, String> {
    let request = match method.to_uppercase().as_str() {
        "GET" => client.get(url),
        "POST" => client.post(url),
        "PUT" => client.put(url),
        "DELETE" => client.delete(url),
        "PATCH" => client.patch(url),
        _ => return Err("Invalid HTTP method".into()),
    };

    Ok(if let Some(b) = body {
        request.json(&b)
    } else {
        request
    })
}

fn build_graphql_request(
    client: &Client,
    url: &str,
    query: &str,
    variables: Option<serde_json::Value>,
) -> RequestBuilder {
    let graphql_body = GraphQLRequest {
        query: query.to_string(),
        variables,
    };

    client
        .post(url)
        .header("Content-Type", "application/json")
        .json(&graphql_body)
}

fn handle_basic_auth(
    request: RequestBuilder,
    username: Option<String>,
    password: Option<String>,
) -> RequestBuilder {
    let username = username.unwrap_or_default();
    let password = password.unwrap_or_default();

    if !username.is_empty() {
        let auth_string = format!("{}:{}", username, password);
        let encoded = general_purpose::STANDARD.encode(auth_string);
        request.header("Authorization", format!("Basic {}", encoded))
    } else {
        request
    }
}

async fn send_and_parse(request: RequestBuilder) -> Result<ApiResponse, String> {
    let resp = request.send().await.map_err(|e| e.to_string())?;
    let success = resp.status().is_success();

    match resp.json::<serde_json::Value>().await {
        Ok(json) => Ok(ApiResponse {
            success,
            data: Some(json),
            error: None,
        }),
        Err(err) => Ok(ApiResponse {
            success: false,
            data: None,
            error: Some(format!("Failed to parse response: {}", err)),
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
    let client = Client::new();
    let request = build_request(&client, &method, &url, body)?;
    send_and_parse(request).await
}

#[command]
pub async fn basic_auth_request(
    method: String,
    url: String,
    body: Option<serde_json::Value>,
    username: String,
    password: String,
) -> Result<ApiResponse, String> {
    let client = Client::new();
    let request = build_request(&client, &method, &url, body)?;
    let request = handle_basic_auth(request, Some(username), Some(password));
    send_and_parse(request).await
}

#[command]
pub async fn bearer_auth_request(
    method: String,
    url: String,
    body: Option<serde_json::Value>,
    bearer_token: String,
) -> Result<ApiResponse, String> {
    let client = Client::new();
    let request = build_request(&client, &method, &url, body)?
        .header("Authorization", format!("Bearer {}", bearer_token));
    send_and_parse(request).await
}

// GraphQL request commands
#[command]
pub async fn graphql_request(
    url: String,
    query: String,
    variables: Option<serde_json::Value>,
) -> Result<ApiResponse, String> {
    let client = Client::new();
    let request = build_graphql_request(&client, &url, &query, variables);
    send_and_parse(request).await
}

#[command]
pub async fn graphql_basic_auth_request(
    url: String,
    query: String,
    variables: Option<serde_json::Value>,
    username: String,
    password: String,
) -> Result<ApiResponse, String> {
    let client = Client::new();
    let request = build_graphql_request(&client, &url, &query, variables);
    let request = handle_basic_auth(request, Some(username), Some(password));
    send_and_parse(request).await
}

#[command]
pub async fn graphql_bearer_auth_request(
    url: String,
    query: String,
    variables: Option<serde_json::Value>,
    bearer_token: String,
) -> Result<ApiResponse, String> {
    let client = Client::new();
    let request = build_graphql_request(&client, &url, &query, variables)
        .header("Authorization", format!("Bearer {}", bearer_token));
    send_and_parse(request).await
}

#[cfg(test)]
mod tests;

const INTROSPECTION_QUERY: &str = r#"
query IntrospectionQuery {
  __schema {
    queryType { name }
    mutationType { name }
    subscriptionType { name }
    types {
      ...FullType
    }
    directives {
      name
      description
      locations
      args {
        ...InputValue
      }
    }
  }
}

fragment FullType on __Type {
  kind
  name
  description
  fields(includeDeprecated: true) {
    name
    description
    args {
      ...InputValue
    }
    type {
      ...TypeRef
    }
    isDeprecated
    deprecationReason
  }
  inputFields {
    ...InputValue
  }
  interfaces {
    ...TypeRef
  }
  enumValues(includeDeprecated: true) {
    name
    description
    isDeprecated
    deprecationReason
  }
  possibleTypes {
    ...TypeRef
  }
}

fragment InputValue on __InputValue {
  name
  description
  type { ...TypeRef }
  defaultValue
}

fragment TypeRef on __Type {
  kind
  name
  ofType {
    kind
    name
    ofType {
      kind
      name
      ofType {
        kind
        name
        ofType {
          kind
          name
          ofType {
            kind
            name
            ofType {
              kind
              name
              ofType {
                kind
                name
              }
            }
          }
        }
      }
    }
  }
}
"#;

#[command]
pub async fn graphql_introspection(url: String) -> Result<ApiResponse, String> {
    let client = Client::new();
    let request = build_graphql_request(&client, &url, INTROSPECTION_QUERY, None);
    send_and_parse(request).await
}

#[command]
pub async fn graphql_introspection_with_auth(
    url: String,
    auth_type: String,
    token: Option<String>,
    username: Option<String>,
    password: Option<String>,
) -> Result<ApiResponse, String> {
    let client = Client::new();
    let mut request = build_graphql_request(&client, &url, INTROSPECTION_QUERY, None);
    
    match auth_type.as_str() {
        "bearer" => {
            if let Some(bearer_token) = token {
                request = request.header("Authorization", format!("Bearer {}", bearer_token));
            }
        }
        "basic" => {
            request = handle_basic_auth(request, username, password);
        }
        _ => {}
    }
    
    send_and_parse(request).await
}
