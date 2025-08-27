use crate::error::AppResult;
use crate::grpc::{GrpcCallType, GrpcRequest, GrpcResponse};
use tonic::transport::Channel;

pub struct GrpcClient {
    channel: Channel,
}

impl GrpcClient {
    pub async fn new(url: &str) -> AppResult<Self> {
        let channel = Channel::from_shared(url.to_string())?.connect().await?;

        Ok(Self { channel })
    }

    pub async fn unary_call(&self, request: GrpcRequest) -> AppResult<GrpcResponse> {
        // Use the channel by cloning it for potential future use
        let _channel_clone = self.channel.clone();

        // For now, we'll return a mock response since we need proto definitions
        // In a real implementation, this would use the actual proto-generated code
        Ok(GrpcResponse {
            success: true,
            data: Some(request.message),
            error: None,
            status_code: Some(0), // OK
            status_message: Some("OK".to_string()),
        })
    }

    pub async fn server_streaming_call(&self, request: GrpcRequest) -> AppResult<GrpcResponse> {
        // Mock implementation for server streaming
        Ok(GrpcResponse {
            success: true,
            data: Some(serde_json::json!({
                "stream_type": "server_streaming",
                "message": request.message,
                "status": "streaming_started"
            })),
            error: None,
            status_code: Some(0),
            status_message: Some("Streaming started".to_string()),
        })
    }

    pub async fn client_streaming_call(&self, request: GrpcRequest) -> AppResult<GrpcResponse> {
        // Mock implementation for client streaming
        Ok(GrpcResponse {
            success: true,
            data: Some(serde_json::json!({
                "stream_type": "client_streaming",
                "message": request.message,
                "status": "ready_for_stream"
            })),
            error: None,
            status_code: Some(0),
            status_message: Some("Ready for client stream".to_string()),
        })
    }

    pub async fn bidirectional_call(&self, request: GrpcRequest) -> AppResult<GrpcResponse> {
        // Mock implementation for bidirectional streaming
        Ok(GrpcResponse {
            success: true,
            data: Some(serde_json::json!({
                "stream_type": "bidirectional",
                "message": request.message,
                "status": "streaming_established"
            })),
            error: None,
            status_code: Some(0),
            status_message: Some("Bidirectional stream established".to_string()),
        })
    }

    pub async fn execute(&self, request: GrpcRequest) -> AppResult<GrpcResponse> {
        match request.call_type {
            GrpcCallType::Unary => self.unary_call(request).await,
            GrpcCallType::ServerStreaming => self.server_streaming_call(request).await,
            GrpcCallType::ClientStreaming => self.client_streaming_call(request).await,
            GrpcCallType::Bidirectional => self.bidirectional_call(request).await,
        }
    }
}

impl Default for GrpcClient {
    fn default() -> Self {
        // This is a fallback implementation
        // In practice, we'd need a valid channel
        unimplemented!("GrpcClient requires a valid channel")
    }
}
