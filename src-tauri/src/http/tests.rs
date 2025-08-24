use super::*;
use httpmock::Method::{DELETE, GET, PATCH, POST, PUT};
use httpmock::MockServer;
use serde_json::json;

/// Tests a GET request using plain_request against a mock server.
/// The expected result is a successful response (HTTP 200).
#[tokio::test]
async fn test_plain_get_request_success() {
    let server = MockServer::start();

    let mock = server.mock(|when, then| {
        when.method(GET);
        then.status(200).body("OK");
    });

    let result = plain_request("GET".into(), server.url("/").into(), None).await;

    assert!(result.is_ok());
    mock.assert();
}

/// Tests a POST request with a JSON body using plain_request against a mock server.
/// The expected result is a successful response (HTTP 201).
#[tokio::test]
async fn test_plain_post_request_success() {
    let server = MockServer::start();

    let mock = server.mock(|when, then| {
        when.method(POST)
            .header("Content-Type", "application/json")
            .json_body(json!({
                "title": "foo",
                "body": "bar",
                "userId": 1
            }));
        then.status(201).body("Created");
    });

    let body = json!({
        "title": "foo",
        "body": "bar",
        "userId": 1
    });

    let result = plain_request("POST".into(), server.url("/posts").into(), Some(body)).await;

    assert!(result.is_ok());
    mock.assert();
}

/// Tests a PUT request with a JSON body using plain_request against a mock server.
/// The expected result is a successful response (HTTP 200).
#[tokio::test]
async fn test_plain_put_request_success() {
    let server = MockServer::start();

    let mock = server.mock(|when, then| {
        when.method(PUT)
            .header("Content-Type", "application/json")
            .json_body(json!({
                "id": 1,
                "title": "foo",
                "body": "bar",
                "userId": 1
            }));
        then.status(200).body("Updated");
    });

    let body = json!({
        "id": 1,
        "title": "foo",
        "body": "bar",
        "userId": 1
    });

    let result = plain_request("PUT".into(), server.url("/posts/1").into(), Some(body)).await;

    assert!(result.is_ok());
    mock.assert();
}

/// Tests a DELETE request using plain_request against a mock server.
/// The expected result is a successful response (HTTP 204).
#[tokio::test]
async fn test_plain_delete_request_success() {
    let server = MockServer::start();

    let mock = server.mock(|when, then| {
        when.method(DELETE);
        then.status(204);
    });

    let result = plain_request("DELETE".into(), server.url("/posts/1").into(), None).await;

    assert!(result.is_ok());
    mock.assert();
}

/// Tests a PATCH request with a JSON body using plain_request against a mock server.
/// The expected result is a successful response (HTTP 200).
#[tokio::test]
async fn test_plain_patch_request_success() {
    let server = MockServer::start();

    let mock = server.mock(|when, then| {
        when.method(PATCH)
            .header("Content-Type", "application/json")
            .json_body(json!({
                "id": 1,
                "title": "foo",
                "body": "bar",
                "userId": 1
            }));
        then.status(200).body("Patched");
    });

    let body = json!({
        "id": 1,
        "title": "foo",
        "body": "bar",
        "userId": 1
    });

    let result = plain_request("PATCH".into(), server.url("/posts/1").into(), Some(body)).await;

    assert!(result.is_ok());
    mock.assert();
}

/// Tests if a GET request using Basic Authentication hits a mock server
/// with the correct Authorization header. The expected response is HTTP 200
/// with body "Authorized".
#[tokio::test]
async fn test_basic_auth_request_hits_server() {
    let server = MockServer::start();

    let mock = server.mock(|when, then| {
        when.method(GET)
            .header("Authorization", "Basic dXNlcjpwYXNz");
        then.status(200).body("Authorized");
    });

    let client = Client::new();
    let url = &format!("{}/auth", server.url(""));

    let response = client
        .get(url)
        .basic_auth("user", Some("pass"))
        .send()
        .await
        .unwrap();

    assert_eq!(response.status(), 200);
    assert_eq!(response.text().await.unwrap(), "Authorized");

    mock.assert();
}

/// Tests if a GET request using Bearer Authentication hits a mock server
/// with the correct Authorization header. The expected response is HTTP 200
/// with body "Bearer Authorized".
#[tokio::test]
async fn test_bearer_auth_request_hits_server() {
    let server = MockServer::start();

    let mock = server.mock(|when, then| {
        when.method(GET).header("Authorization", "Bearer abc123");
        then.status(200).body("Bearer Authorized");
    });

    let client = Client::new();
    let url = &format!("{}/auth", server.url(""));

    let response = client.get(url).bearer_auth("abc123").send().await.unwrap();

    assert_eq!(response.status(), 200);
    assert_eq!(response.text().await.unwrap(), "Bearer Authorized");

    mock.assert();
}

// Graphql tests
#[tokio::test]
async fn test_graphql_request_success() {
    let server = MockServer::start();
    let mock = server.mock(|when, then| {
        when.method(POST)
            .header("Content-Type", "application/json")
            .json_body(json!({
                "query": "query { users { id name } }",
                "variables": null
            }));
        then.status(200)
            .header("Content-Type", "application/json")
            .json_body(json!({
                "data": {
                    "users": [
                        {"id": "1", "name":"John"},
                        {"id": "2", "name": "Jane"}
                    ]
                }
            }));
    });

    let result = graphql_request(
        server.url("/graphql").into(),
        "query { users { id name } }".into(),
        None,
    )
    .await;

    assert!(result.is_ok());
    let response = result.unwrap();
    assert!(response.success);
    mock.assert();
}

#[tokio::test]
async fn test_graphql_request_with_variables() {
    let server = MockServer::start();
    let variables = json!({
        "userId": 1,
        "limit": 10
    });

    let mock = server.mock(|when, then| {
        when.method(POST)
            .header("Content-Type", "application/json")
            .json_body(json!({
                "query": "query GetUser($userId: ID!, $limit: Int) { user(id: $userId) { posts(limit: $limit) { title } } }",
                "variables": {
                    "userId": 1,
                    "limit": 10
                }
            }));
        then.status(200)
            .header("Content-Type", "application/json")
            .json_body(json!({
                "data": {
                    "user": {
                        "posts": [
                            {"title": "First Post"},
                            {"title": "Second Post"}
                        ]
                    }
                }
            }));
    });

    let result = graphql_request(
        server.url("/graphql").into(),
        "query GetUser($userId: ID!, $limit: Int) { user(id: $userId) { posts(limit: $limit) { title } } }".into(),
        Some(variables),
    ).await;

    assert!(result.is_ok());
    let response = result.unwrap();
    assert!(response.success);
    mock.assert();
}

#[tokio::test]
async fn test_graphql_basic_auth_request() {
    let server = MockServer::start();
    let mock = server.mock(|when, then| {
        when.method(POST)
            .header("Content-Type", "application/json")
            .header("Authorization", "Basic dXNlcjpwYXNz")
            .json_body(json!({
                "query": "query { me { id name } }",
                "variables": null
            }));
        then.status(200)
            .header("Content-Type", "application/json")
            .json_body(json!({
                "data": {
                    "me": {
                        "id": "1",
                        "name": "Authenticated User"
                    }
                }
            }));
    });

    let result = graphql_basic_auth_request(
        server.url("/graphql").into(),
        "query { me { id name } }".into(),
        None,
        "user".into(),
        "pass".into(),
    )
    .await;

    assert!(result.is_ok());
    let response = result.unwrap();
    assert!(response.success);
    mock.assert();
}

#[tokio::test]
async fn test_graphql_bearer_auth_request() {
    let server = MockServer::start();
    let mock = server.mock(|when, then| {
        when.method(POST)
            .header("Content-Type", "application/json")
            .header("Authorization", "Bearer token123")
            .json_body(json!({
                "query": "query { me { id name } }",
                "variables": null
            }));
        then.status(200)
            .header("Content-Type", "application/json")
            .json_body(json!({
                "data": {
                    "me": {
                        "id": "1",
                        "name": "Bearer Authenticated User"
                    }
                }
            }));
    });

    let result = graphql_bearer_auth_request(
        server.url("/graphql").into(),
        "query { me { id name } }".into(),
        None,
        "token123".into(),
    )
    .await;

    assert!(result.is_ok());
    let response = result.unwrap();
    assert!(response.success);
    mock.assert();
}

#[tokio::test]
async fn test_graphql_error_response() {
    let server = MockServer::start();
    let mock = server.mock(|when, then| {
        when.method(POST)
            .header("Content-Type", "application/json")
            .json_body(json!({
                "query": "query { invalidField }",
                "variables": null
            }));
        then.status(200)
            .header("Content-Type", "application/json")
            .json_body(json!({
                "errors": [
                    {
                        "message": "Cannot query field 'invalidField' on type 'Query'",
                        "locations": [{"line": 1, "column": 9}]
                    }
                ]
            }));
    });

    let result = graphql_request(
        server.url("/graphql").into(),
        "query { invalidField }".into(),
        None,
    )
    .await;

    assert!(result.is_ok());
    let response = result.unwrap();
    assert!(response.success); // HTTP 200 is still success, GraphQL errors are in the response body
    assert!(response.data.is_some());
    mock.assert();
}

#[tokio::test]
async fn test_graphql_mutation() {
    let server = MockServer::start();
    let variables = json!({
        "input": {
            "name": "New User",
            "email": "user@example.com"
        }
    });

    let mock = server.mock(|when, then| {
        when.method(POST)
            .header("Content-Type", "application/json")
            .json_body(json!({
                "query": "mutation CreateUser($input: UserInput!) { createUser(input: $input) { id name email } }",
                "variables": {
                    "input": {
                        "name": "New User",
                        "email": "user@example.com"
                    }
                }
            }));
        then.status(200)
            .header("Content-Type", "application/json")
            .json_body(json!({
                "data": {
                    "createUser": {
                        "id": "3",
                        "name": "New User",
                        "email": "user@example.com"
                    }
                }
            }));
    });

    let result = graphql_request(
        server.url("/graphql").into(),
        "mutation CreateUser($input: UserInput!) { createUser(input: $input) { id name email } }"
            .into(),
        Some(variables),
    )
    .await;

    assert!(result.is_ok());
    let response = result.unwrap();
    assert!(response.success);
    mock.assert();
}

#[tokio::test]
async fn test_graphql_introspection_success() {
    let server = MockServer::start();
    let mock = server.mock(|when, then| {
        when.method(POST)
            .header("Content-Type", "application/json")
            .body_contains("query IntrospectionQuery");
        then.status(200)
            .header("Content-Type", "application/json")
            .json_body(json!({
                "data": {
                    "__schema": {
                        "queryType": {"name": "Query"},
                        "mutationType": {"name": "Mutation"},
                        "subscriptionType": null,
                        "types": [],
                        "directives": []
                    }
                }
            }));
    });

    let result = super::graphql_introspection(server.url("/graphql")).await;

    assert!(result.is_ok());
    let response = result.unwrap();
    assert!(response.success);

    mock.assert();
}

#[tokio::test]
async fn test_graphql_introspection_with_bearer_auth() {
    let server = MockServer::start();
    let mock = server.mock(|when, then| {
        when.method(POST)
            .header("Content-Type", "application/json")
            .header("Authorization", "Bearer test-token")
            .body_contains("query IntrospectionQuery");
        then.status(200)
            .header("Content-Type", "application/json")
            .json_body(json!({
                "data": {
                    "__schema": {
                        "queryType": {"name": "Query"},
                        "types": [],
                        "directives": []
                    }
                }
            }));
    });

    let result = super::graphql_introspection_with_auth(
        server.url("/graphql"),
        "bearer".to_string(),
        Some("test-token".to_string()),
        None,
        None,
    )
    .await;

    assert!(result.is_ok());
    mock.assert();
}
