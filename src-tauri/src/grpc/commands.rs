use crate::grpc::{
    client::GrpcClient, proto_parser::ProtoParser, reflection::GrpcReflection, GrpcCallType,
    GrpcRequest, GrpcResponse, ProtoSchema,
};
use crate::http::ApiResponse;
use tauri::command;

fn grpc_response_to_api_response(response: GrpcResponse) -> ApiResponse {
    ApiResponse {
        success: response.success,
        data: response.data,
        error: response.error,
    }
}

#[command]
pub async fn grpc_unary_request(
    url: String,
    service: String,
    method: String,
    message: serde_json::Value,
    metadata: Option<std::collections::HashMap<String, String>>,
) -> Result<ApiResponse, String> {
    let request = GrpcRequest {
        url,
        service,
        method,
        message,
        metadata,
        call_type: GrpcCallType::Unary,
    };

    match GrpcClient::new(&request.url).await {
        Ok(client) => match client.execute(request).await {
            Ok(response) => Ok(grpc_response_to_api_response(response)),
            Err(e) => Ok(ApiResponse {
                success: false,
                data: None,
                error: Some(e.to_string()),
            }),
        },
        Err(e) => Ok(ApiResponse {
            success: false,
            data: None,
            error: Some(format!("Failed to create gRPC client: {}", e)),
        }),
    }
}

#[command]
pub async fn grpc_server_streaming_request(
    url: String,
    service: String,
    method: String,
    message: serde_json::Value,
    metadata: Option<std::collections::HashMap<String, String>>,
) -> Result<ApiResponse, String> {
    let request = GrpcRequest {
        url,
        service,
        method,
        message,
        metadata,
        call_type: GrpcCallType::ServerStreaming,
    };

    match GrpcClient::new(&request.url).await {
        Ok(client) => match client.execute(request).await {
            Ok(response) => Ok(grpc_response_to_api_response(response)),
            Err(e) => Ok(ApiResponse {
                success: false,
                data: None,
                error: Some(e.to_string()),
            }),
        },
        Err(e) => Ok(ApiResponse {
            success: false,
            data: None,
            error: Some(format!("Failed to create gRPC client: {}", e)),
        }),
    }
}

#[command]
pub async fn grpc_discover_services(url: String) -> Result<ProtoSchema, String> {
    match GrpcReflection::new(&url).await {
        Ok(reflection) => match reflection.discover_services().await {
            Ok(schema) => Ok(schema),
            Err(e) => Err(format!("Failed to discover services: {}", e)),
        },
        Err(e) => Err(format!("Failed to create reflection client: {}", e)),
    }
}

#[command]
pub async fn grpc_parse_proto_file(content: String) -> Result<ProtoSchema, String> {
    match ProtoParser::parse_proto_file(&content) {
        Ok(schema) => Ok(schema),
        Err(e) => Err(format!("Failed to parse proto file: {}", e)),
    }
}

#[command]
pub async fn grpc_get_service_info(
    url: String,
    service_name: String,
) -> Result<Option<crate::grpc::ProtoService>, String> {
    match GrpcReflection::new(&url).await {
        Ok(reflection) => match reflection.get_service_info(&service_name).await {
            Ok(service) => Ok(service),
            Err(e) => Err(format!("Failed to get service info: {}", e)),
        },
        Err(e) => Err(format!("Failed to create reflection client: {}", e)),
    }
}

#[command]
pub async fn grpc_get_method_info(
    url: String,
    service_name: String,
    method_name: String,
) -> Result<Option<crate::grpc::ProtoMethod>, String> {
    match GrpcReflection::new(&url).await {
        Ok(reflection) => {
            match reflection
                .get_method_info(&service_name, &method_name)
                .await
            {
                Ok(method) => Ok(method),
                Err(e) => Err(format!("Failed to get method info: {}", e)),
            }
        }
        Err(e) => Err(format!("Failed to create reflection client: {}", e)),
    }
}

#[derive(serde::Serialize)]
pub struct ConnectionStatus {
    pub connected: bool,
    pub message: String,
    pub latency_ms: Option<u64>,
}

#[command]
pub async fn grpc_test_connection(url: String) -> Result<ConnectionStatus, String> {
    let start = std::time::Instant::now();

    match GrpcReflection::new(&url).await {
        Ok(_reflection) => {
            let latency = start.elapsed().as_millis() as u64;
            Ok(ConnectionStatus {
                connected: true,
                message: "Successfully connected to gRPC server".to_string(),
                latency_ms: Some(latency),
            })
        }
        Err(e) => Ok(ConnectionStatus {
            connected: false,
            message: format!("Failed to connect: {}", e),
            latency_ms: None,
        }),
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_grpc_response_to_api_response_success() {
        let grpc_response = GrpcResponse {
            success: true,
            data: Some(serde_json::json!({"result": "ok"})),
            error: None,
            status_code: Some(0),
            status_message: Some("OK".to_string()),
        };

        let api_response = grpc_response_to_api_response(grpc_response);

        assert!(api_response.success);
        assert!(api_response.data.is_some());
        assert!(api_response.error.is_none());
    }

    #[test]
    fn test_grpc_response_to_api_response_error() {
        let grpc_response = GrpcResponse {
            success: false,
            data: None,
            error: Some("Connection failed".to_string()),
            status_code: Some(14),
            status_message: Some("UNAVAILABLE".to_string()),
        };

        let api_response = grpc_response_to_api_response(grpc_response);

        assert!(!api_response.success);
        assert!(api_response.data.is_none());
        assert!(api_response.error.is_some());
        assert_eq!(api_response.error.unwrap(), "Connection failed");
    }

    #[tokio::test]
    async fn test_grpc_parse_proto_file_command() {
        let proto_content = r#"
syntax = "proto3";

service TestService {
  rpc Test(TestRequest) returns (TestResponse);
}

message TestRequest { string id = 1; }
message TestResponse { string result = 1; }
"#.to_string();

        let result = grpc_parse_proto_file(proto_content).await;

        assert!(result.is_ok());
        let schema = result.unwrap();
        assert_eq!(schema.services.len(), 1);
        assert_eq!(schema.services[0].name, "TestService");
    }

    #[tokio::test]
    async fn test_grpc_parse_proto_file_empty() {
        let result = grpc_parse_proto_file("".to_string()).await;

        assert!(result.is_ok());
        let schema = result.unwrap();
        assert_eq!(schema.services.len(), 0);
        assert_eq!(schema.messages.len(), 0);
    }

    #[tokio::test]
    async fn test_grpc_parse_proto_with_multiple_services() {
        let proto = r#"
service ServiceA {
  rpc MethodA(RequestA) returns (ResponseA);
}

service ServiceB {
  rpc MethodB(RequestB) returns (ResponseB);
}

message RequestA { string id = 1; }
message ResponseA { string data = 1; }
message RequestB { string id = 1; }
message ResponseB { string data = 1; }
"#.to_string();

        let result = grpc_parse_proto_file(proto).await;

        assert!(result.is_ok());
        let schema = result.unwrap();
        assert_eq!(schema.services.len(), 2);
    }

    #[tokio::test]
    async fn test_grpc_response_conversion_preserves_data() {
        let original_data = serde_json::json!({
            "users": [
                {"id": 1, "name": "Alice"},
                {"id": 2, "name": "Bob"}
            ],
            "total": 2
        });

        let grpc_response = GrpcResponse {
            success: true,
            data: Some(original_data.clone()),
            error: None,
            status_code: Some(0),
            status_message: Some("OK".to_string()),
        };

        let api_response = grpc_response_to_api_response(grpc_response);

        assert!(api_response.success);
        assert_eq!(api_response.data, Some(original_data));
    }
}
