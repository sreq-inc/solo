use super::*;
use serde_json::json;

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
