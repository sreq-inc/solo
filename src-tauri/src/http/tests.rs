use super::*;
use httpmock::MockServer;
use httpmock::Method::{GET, POST, PUT, DELETE, PATCH};
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
        then.status(200)
            .body("Authorized");
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
        when.method(GET)
            .header("Authorization", "Bearer abc123");
        then.status(200)
            .body("Bearer Authorized");
    });

    let client = Client::new();
    let url = &format!("{}/auth", server.url(""));

    let response = client
        .get(url)
        .bearer_auth("abc123")
        .send()
        .await
        .unwrap();

    assert_eq!(response.status(), 200);
    assert_eq!(response.text().await.unwrap(), "Bearer Authorized");

    mock.assert();
}
