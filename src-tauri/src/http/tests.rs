use super::*;


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


