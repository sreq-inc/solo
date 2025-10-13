use crate::error::AppResult;
use crate::grpc::{GrpcCallType, GrpcRequest, GrpcResponse};
use crate::grpc::reflection::GrpcReflection;
use prost::Message;
use prost_reflect::{DynamicMessage, DescriptorPool};
use tonic::transport::Channel;

pub struct GrpcClient {
    #[allow(dead_code)]
    channel: Channel, // Will be used for real gRPC calls in next iteration
    reflection: Option<GrpcReflection>,
}

impl GrpcClient {
    pub async fn new(url: &str) -> AppResult<Self> {
        let channel = Channel::from_shared(url.to_string())?.connect().await?;
        let reflection = GrpcReflection::new(url).await.ok();

        Ok(Self { channel, reflection })
    }

    /// Get or initialize the descriptor pool via reflection
    async fn get_descriptor_pool(&mut self) -> AppResult<&DescriptorPool> {
        if let Some(ref mut reflection) = self.reflection {
            reflection.descriptor_pool().await
        } else {
            Err("Reflection not available".to_string().into())
        }
    }

    /// Convert JSON value to DynamicMessage
    fn json_to_dynamic_message(
        &self,
        json: &serde_json::Value,
        message_desc: &prost_reflect::MessageDescriptor,
    ) -> AppResult<DynamicMessage> {
        let dynamic_msg = DynamicMessage::deserialize(message_desc.clone(), json.clone())?;
        Ok(dynamic_msg)
    }

    /// Convert DynamicMessage to JSON value (for future use in real gRPC calls)
    #[allow(dead_code)]
    fn dynamic_message_to_json(&self, message: &DynamicMessage) -> AppResult<serde_json::Value> {
        // Convert to JSON using serde
        let json = serde_json::to_value(message)?;
        Ok(json)
    }

    pub async fn unary_call(&mut self, request: GrpcRequest) -> AppResult<GrpcResponse> {
        let descriptor_pool = self.get_descriptor_pool().await?;

        // Find the service and method
        // Try exact match first, then try as a suffix match (for cases like "Echo" when service is "mypackage.Echo")
        let service_desc = descriptor_pool
            .get_service_by_name(&request.service)
            .or_else(|| {
                // Try to find by short name (last part after the last dot)
                descriptor_pool.services().find(|s| {
                    s.full_name() == request.service ||
                    s.name() == request.service ||
                    s.full_name().ends_with(&format!(".{}", request.service))
                })
            })
            .ok_or_else(|| {
                // List available services for better error message
                let available: Vec<String> = descriptor_pool
                    .services()
                    .map(|s| s.full_name().to_string())
                    .collect();
                format!(
                    "Service '{}' not found. Available services: [{}]",
                    request.service,
                    available.join(", ")
                )
            })?;

        let method_desc = service_desc
            .methods()
            .find(|m| m.name() == request.method)
            .ok_or_else(|| {
                // List available methods for better error message
                let available: Vec<String> = service_desc
                    .methods()
                    .map(|m| m.name().to_string())
                    .collect();
                format!(
                    "Method '{}' not found in service '{}'. Available methods: [{}]",
                    request.method,
                    service_desc.full_name(),
                    available.join(", ")
                )
            })?;

        // Convert JSON input to DynamicMessage
        let input_desc = method_desc.input();
        let input_message = self.json_to_dynamic_message(&request.message, &input_desc)?;

        // Encode the message to bytes (for future use in real gRPC calls)
        let _request_bytes = input_message.encode_to_vec();

        // Use grpcurl-style approach for dynamic calls
        // This is more reliable than trying to implement custom codecs

        // For now, return a detailed response showing what we found
        // This proves that reflection is working and we can find services/methods

        let response_data = serde_json::json!({
            "service_found": service_desc.full_name(),
            "method_found": method_desc.name(),
            "input_type": method_desc.input().full_name(),
            "output_type": method_desc.output().full_name(),
            "is_client_streaming": method_desc.is_client_streaming(),
            "is_server_streaming": method_desc.is_server_streaming(),
            "request_message": request.message,
            "request_url": request.url,
            "status": "✅ Service and method successfully discovered via reflection",
            "next_step": "Real gRPC call implementation in progress",
            "reflection_working": true
        });

        Ok(GrpcResponse {
            success: true,
            data: Some(response_data),
            error: None,
            status_code: Some(0),
            status_message: Some("Reflection successful - Service found".to_string()),
        })
    }

    pub async fn server_streaming_call(&mut self, request: GrpcRequest) -> AppResult<GrpcResponse> {
        // TODO: Implement actual server streaming
        // For now, return a placeholder
        Ok(GrpcResponse {
            success: true,
            data: Some(serde_json::json!({
                "stream_type": "server_streaming",
                "message": request.message,
                "status": "streaming_started",
                "note": "Server streaming implementation pending"
            })),
            error: None,
            status_code: Some(0),
            status_message: Some("Streaming started".to_string()),
        })
    }

    pub async fn client_streaming_call(&mut self, request: GrpcRequest) -> AppResult<GrpcResponse> {
        // TODO: Implement actual client streaming
        // For now, return a placeholder
        Ok(GrpcResponse {
            success: true,
            data: Some(serde_json::json!({
                "stream_type": "client_streaming",
                "message": request.message,
                "status": "ready_for_stream",
                "note": "Client streaming implementation pending"
            })),
            error: None,
            status_code: Some(0),
            status_message: Some("Ready for client stream".to_string()),
        })
    }

    pub async fn bidirectional_call(&mut self, request: GrpcRequest) -> AppResult<GrpcResponse> {
        // TODO: Implement actual bidirectional streaming
        // For now, return a placeholder
        Ok(GrpcResponse {
            success: true,
            data: Some(serde_json::json!({
                "stream_type": "bidirectional",
                "message": request.message,
                "status": "streaming_established",
                "note": "Bidirectional streaming implementation pending"
            })),
            error: None,
            status_code: Some(0),
            status_message: Some("Bidirectional stream established".to_string()),
        })
    }

    pub async fn execute(&mut self, request: GrpcRequest) -> AppResult<GrpcResponse> {
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

#[cfg(test)]
mod tests {
    use super::*;
    use std::collections::HashMap;

    fn create_test_request(call_type: GrpcCallType) -> GrpcRequest {
        GrpcRequest {
            url: "http://localhost:50051".to_string(),
            service: "TestService".to_string(),
            method: "TestMethod".to_string(),
            message: serde_json::json!({"test": "data"}),
            metadata: Some(HashMap::new()),
            call_type,
        }
    }

    #[test]
    fn test_grpc_request_creation() {
        let request = create_test_request(GrpcCallType::Unary);

        assert_eq!(request.service, "TestService");
        assert_eq!(request.method, "TestMethod");
        assert!(request.metadata.is_some());
    }

    #[test]
    fn test_grpc_response_structure() {
        let response = GrpcResponse {
            success: true,
            data: Some(serde_json::json!({"result": "ok"})),
            error: None,
            status_code: Some(0),
            status_message: Some("OK".to_string()),
        };

        assert!(response.success);
        assert!(response.data.is_some());
        assert!(response.error.is_none());
        assert_eq!(response.status_code, Some(0));
    }

    #[test]
    fn test_grpc_response_error() {
        let response = GrpcResponse {
            success: false,
            data: None,
            error: Some("Connection failed".to_string()),
            status_code: Some(14),
            status_message: Some("UNAVAILABLE".to_string()),
        };

        assert!(!response.success);
        assert!(response.error.is_some());
        assert_eq!(response.error.unwrap(), "Connection failed");
    }

    #[test]
    fn test_call_type_variants() {
        let unary = GrpcCallType::Unary;
        let server_streaming = GrpcCallType::ServerStreaming;
        let client_streaming = GrpcCallType::ClientStreaming;
        let bidirectional = GrpcCallType::Bidirectional;

        // Just verify all variants compile and can be created
        assert!(matches!(unary, GrpcCallType::Unary));
        assert!(matches!(server_streaming, GrpcCallType::ServerStreaming));
        assert!(matches!(client_streaming, GrpcCallType::ClientStreaming));
        assert!(matches!(bidirectional, GrpcCallType::Bidirectional));
    }
}
