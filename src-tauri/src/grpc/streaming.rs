use crate::error::AppResult;
use crate::grpc::{GrpcRequest, GrpcResponse};
use serde_json::Value;
use tokio::sync::mpsc;

pub struct GrpcStreaming;

impl GrpcStreaming {
    pub async fn handle_server_streaming(
        request: GrpcRequest,
        tx: mpsc::Sender<GrpcResponse>,
    ) -> AppResult<()> {
        // Mock server streaming implementation
        // In a real implementation, this would handle the actual gRPC stream

        let mock_responses   = vec![
            serde_json::json!({
                "message": "Stream started",
                "timestamp": chrono::Utc::now().to_rfc3339(),
                "data": request.message
            }),
            serde_json::json!({
                "message": "Stream data 1",
                "timestamp": chrono::Utc::now().to_rfc3339(),
                "data": serde_json::json!({"id": 1, "name": "User 1"})
            }),
            serde_json::json!({
                "message": "Stream data 2",
                "timestamp": chrono::Utc::now().to_rfc3339(),
                "data": serde_json::json!({"id": 2, "name": "User 2"})
            }),
        ];

        for (i, data) in mock_responses.into_iter().enumerate() {
            let response = GrpcResponse {
                success: true,
                data: Some(data),
                error: None,
                status_code: Some(0),
                status_message: Some(format!("Stream message {}", i + 1)),
            };

            if tx.send(response).await.is_err() {
                break;
            }

            // Simulate some delay between messages
            tokio::time::sleep(tokio::time::Duration::from_millis(500)).await;
        }

        // Send final message
        let final_response = GrpcResponse {
            success: true,
            data: Some(serde_json::json!({
                "message": "Stream completed",
                "timestamp": chrono::Utc::now().to_rfc3339()
            })),
            error: None,
            status_code: Some(0),
            status_message: Some("Stream completed".to_string()),
        };

        let _ = tx.send(final_response).await;

        Ok(())
    }

    pub async fn handle_client_streaming(
        mut rx: mpsc::Receiver<Value>,
        tx: mpsc::Sender<GrpcResponse>,
    ) -> AppResult<()> {
        // Mock client streaming implementation
        let mut received_messages = Vec::new();

        while let Some(message) = rx.recv().await {
            received_messages.push(message);

            // Send acknowledgment for each received message
            let ack = GrpcResponse {
                success: true,
                data: Some(serde_json::json!({
                    "message": "Message received",
                    "count": received_messages.len(),
                    "timestamp": chrono::Utc::now().to_rfc3339()
                })),
                error: None,
                status_code: Some(0),
                status_message: Some("Message acknowledged".to_string()),
            };

            if tx.send(ack).await.is_err() {
                break;
            }
        }

        // Send final response with summary
        let final_response = GrpcResponse {
            success: true,
            data: Some(serde_json::json!({
                "message": "Client stream completed",
                "total_messages": received_messages.len(),
                "messages": received_messages,
                "timestamp": chrono::Utc::now().to_rfc3339()
            })),
            error: None,
            status_code: Some(0),
            status_message: Some("Client stream completed".to_string()),
        };

        let _ = tx.send(final_response).await;

        Ok(())
    }

    pub async fn handle_bidirectional_streaming(
        mut rx: mpsc::Receiver<Value>,
        tx: mpsc::Sender<GrpcResponse>,
    ) -> AppResult<()> {
        // Mock bidirectional streaming implementation
        let mut message_count = 0;

        while let Some(message) = rx.recv().await {
            message_count += 1;

            // Echo back the message with some processing
            let echo_response = GrpcResponse {
                success: true,
                data: Some(serde_json::json!({
                    "message": "Echo response",
                    "original_message": message,
                    "message_number": message_count,
                    "timestamp": chrono::Utc::now().to_rfc3339()
                })),
                error: None,
                status_code: Some(0),
                status_message: Some("Message echoed".to_string()),
            };

            if tx.send(echo_response).await.is_err() {
                break;
            }

            // Simulate processing time
            tokio::time::sleep(tokio::time::Duration::from_millis(200)).await;
        }

        // Send completion message
        let completion_response = GrpcResponse {
            success: true,
            data: Some(serde_json::json!({
                "message": "Bidirectional stream completed",
                "total_messages_processed": message_count,
                "timestamp": chrono::Utc::now().to_rfc3339()
            })),
            error: None,
            status_code: Some(0),
            status_message: Some("Bidirectional stream completed".to_string()),
        };

        let _ = tx.send(completion_response).await;

        Ok(())
    }
}

// Helper function to create streaming channels
pub fn create_streaming_channels() -> (mpsc::Sender<Value>, mpsc::Receiver<Value>) {
    mpsc::channel(100) // Buffer size of 100
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::collections::HashMap;

    #[tokio::test]
    async fn test_server_streaming_sends_multiple_messages() {
        let (tx, mut rx) = mpsc::channel(10);

        let request = GrpcRequest {
            url: "http://localhost:50051".to_string(),
            service: "TestService".to_string(),
            method: "StreamData".to_string(),
            message: serde_json::json!({"test": "data"}),
            metadata: None,
            call_type: crate::grpc::GrpcCallType::ServerStreaming,
        };

        // Start streaming in background
        let handle = tokio::spawn(async move {
            GrpcStreaming::handle_server_streaming(request, tx).await
        });

        // Collect all messages
        let mut messages = Vec::new();
        while let Some(response) = rx.recv().await {
            messages.push(response);
        }

        // Wait for completion
        let result = handle.await.unwrap();
        assert!(result.is_ok());

        // Verify we received multiple messages
        assert!(messages.len() >= 3, "Should receive at least 3 stream messages");

        // Verify all messages are successful
        for msg in &messages {
            assert!(msg.success, "All stream messages should be successful");
            assert!(msg.data.is_some(), "All messages should have data");
        }
    }

    #[tokio::test]
    async fn test_server_streaming_final_message() {
        let (tx, mut rx) = mpsc::channel(10);

        let request = GrpcRequest {
            url: "http://localhost:50051".to_string(),
            service: "TestService".to_string(),
            method: "StreamData".to_string(),
            message: serde_json::json!({"test": "data"}),
            metadata: None,
            call_type: crate::grpc::GrpcCallType::ServerStreaming,
        };

        tokio::spawn(async move {
            let _ = GrpcStreaming::handle_server_streaming(request, tx).await;
        });

        let mut last_message = None;
        while let Some(response) = rx.recv().await {
            last_message = Some(response);
        }

        // Verify final message
        assert!(last_message.is_some());
        let last = last_message.unwrap();
        assert!(last.success);

        if let Some(data) = last.data {
            if let Some(message) = data.get("message") {
                let msg_str = message.as_str().unwrap_or("");
                assert!(msg_str.contains("completed"), "Final message should indicate completion");
            }
        }
    }

    #[tokio::test]
    async fn test_client_streaming_aggregates_messages() {
        let (msg_tx, msg_rx) = mpsc::channel(10);
        let (resp_tx, mut resp_rx) = mpsc::channel(10);

        // Start client streaming handler
        tokio::spawn(async move {
            let _ = GrpcStreaming::handle_client_streaming(msg_rx, resp_tx).await;
        });

        // Send multiple messages
        msg_tx.send(serde_json::json!({"id": 1, "data": "message 1"})).await.unwrap();
        msg_tx.send(serde_json::json!({"id": 2, "data": "message 2"})).await.unwrap();
        msg_tx.send(serde_json::json!({"id": 3, "data": "message 3"})).await.unwrap();

        // Close sender to signal end of stream
        drop(msg_tx);

        // Collect responses
        let mut responses = Vec::new();
        while let Some(response) = resp_rx.recv().await {
            responses.push(response);
        }

        // Should have acknowledgments + final response
        assert!(responses.len() >= 3, "Should have at least 3 responses");

        // Check final response
        let final_resp = responses.last().unwrap();
        assert!(final_resp.success);

        if let Some(data) = &final_resp.data {
            if let Some(total) = data.get("total_messages") {
                assert_eq!(total.as_u64().unwrap(), 3);
            }
        }
    }

    #[tokio::test]
    async fn test_bidirectional_streaming_echoes_messages() {
        let (msg_tx, msg_rx) = mpsc::channel(10);
        let (resp_tx, mut resp_rx) = mpsc::channel(10);

        // Start bidirectional handler
        tokio::spawn(async move {
            let _ = GrpcStreaming::handle_bidirectional_streaming(msg_rx, resp_tx).await;
        });

        // Send messages and receive echoes
        msg_tx.send(serde_json::json!({"text": "hello"})).await.unwrap();

        // Wait a bit for response
        tokio::time::sleep(tokio::time::Duration::from_millis(100)).await;

        msg_tx.send(serde_json::json!({"text": "world"})).await.unwrap();

        // Close to signal end
        drop(msg_tx);

        // Collect all responses
        let mut responses = Vec::new();
        while let Some(response) = resp_rx.recv().await {
            responses.push(response);
        }

        // Should have at least 2 echoes + completion
        assert!(responses.len() >= 2, "Should have at least 2 responses");

        // Verify all are successful
        for resp in &responses {
            assert!(resp.success);
        }
    }

    #[tokio::test]
    async fn test_create_streaming_channels() {
        let (tx, mut rx) = create_streaming_channels();

        // Test sending and receiving
        let test_value = serde_json::json!({"test": "value"});
        tx.send(test_value.clone()).await.unwrap();

        let received = rx.recv().await.unwrap();
        assert_eq!(received, test_value);
    }

    #[tokio::test]
    async fn test_streaming_channel_capacity() {
        let (tx, _rx) = create_streaming_channels();

        // Should be able to send multiple messages without blocking
        for i in 0..10 {
            let result = tx.send(serde_json::json!({"id": i})).await;
            assert!(result.is_ok(), "Should send message {}", i);
        }
    }

    #[tokio::test]
    async fn test_server_streaming_with_empty_request() {
        let (tx, mut rx) = mpsc::channel(10);

        let request = GrpcRequest {
            url: "http://localhost:50051".to_string(),
            service: "TestService".to_string(),
            method: "StreamData".to_string(),
            message: serde_json::json!({}),  // Empty message
            metadata: None,
            call_type: crate::grpc::GrpcCallType::ServerStreaming,
        };

        tokio::spawn(async move {
            let _ = GrpcStreaming::handle_server_streaming(request, tx).await;
        });

        let mut count = 0;
        while let Some(response) = rx.recv().await {
            assert!(response.success);
            count += 1;
        }

        assert!(count > 0, "Should still receive messages with empty request");
    }
}
