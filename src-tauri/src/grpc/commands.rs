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
