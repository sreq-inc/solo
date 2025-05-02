use super::*;
use httpmock::MockServer;
use httpmock::Method::GET;
use reqwest::Client;

/// Tests a simple GET request to a public known endpoint.
/// The expected result is a successful response (HTTP 200).
#[tokio::test]
async fn test_plain_get_request_success() {
    let result = plain_request(
        "GET".into(),
        "https://jsonplaceholder.typicode.com/posts/1".into(),
        None,
    )
    .await;

    assert!(result.is_ok());
}

/// Tests a POST request with a JSON body to a test endpoint.
/// The expected result is a successful response (HTTP 201 or 200).
#[tokio::test]
async fn test_plain_post_request_success() {
    let body = serde_json::json!({
        "title": "foo",
        "body": "bar",
        "userId": 1
    });

    let result = plain_request(
        "POST".into(),
        "https://jsonplaceholder.typicode.com/posts".into(),
        Some(body),
    )
    .await;

    assert!(result.is_ok());
}

/// Tests a PUT request with a JSON body to a test endpoint.
/// The expected result is a successful response (HTTP 200).
#[tokio::test]
async fn test_plain_put_request_success() {
    let body = serde_json::json!({
        "id": 1,
        "title": "foo",
        "body": "bar",
        "userId": 1
    });

    let result = plain_request(
        "PUT".into(),
        "https://jsonplaceholder.typicode.com/posts/1".into(),
        Some(body),
    )
    .await;

    assert!(result.is_ok());
}

/// Tests a DELETE request to remove a specific resource.
/// The expected result is a successful response (HTTP 200 or 204).
#[tokio::test]
async fn test_plain_delete_request_success() {
    let result = plain_request(
        "DELETE".into(),
        "https://jsonplaceholder.typicode.com/posts/1".into(),
        None,
    )
    .await;

    assert!(result.is_ok());
}

/// Tests a PATCH request with a JSON body to update part of a resource.
/// The expected result is a successful response (HTTP 200).
#[tokio::test]
async fn test_plain_patch_request_success() {
    let body = serde_json::json!({
        "id": 1,
        "title": "foo",
        "body": "bar",
        "userId": 1
    });

    let result = plain_request(
        "PATCH".into(),
        "https://jsonplaceholder.typicode.com/posts/1".into(),
        Some(body),
    )
    .await;

    assert!(result.is_ok());
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
