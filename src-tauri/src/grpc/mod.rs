pub mod client;
pub mod reflection;
pub mod proto_parser;
pub mod streaming;
pub mod commands;

use serde::{Deserialize, Serialize};
use tonic::metadata::{MetadataMap, MetadataKey, MetadataValue};
use tonic::Request;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum GrpcCallType {
    Unary,
    ServerStreaming,
    ClientStreaming,
    Bidirectional,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct GrpcRequest {
    pub url: String,
    pub service: String,
    pub method: String,
    pub message: serde_json::Value,
    pub metadata: Option<std::collections::HashMap<String, String>>,
    pub call_type: GrpcCallType,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct GrpcResponse {
    pub success: bool,
    pub data: Option<serde_json::Value>,
    pub error: Option<String>,
    pub status_code: Option<u32>,
    pub status_message: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ProtoService {
    pub name: String,
    pub methods: Vec<ProtoMethod>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ProtoMethod {
    pub name: String,
    pub input_type: String,
    pub output_type: String,
    pub is_client_streaming: bool,
    pub is_server_streaming: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ProtoSchema {
    pub services: Vec<ProtoService>,
    pub messages: Vec<ProtoMessage>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ProtoMessage {
    pub name: String,
    pub fields: Vec<ProtoField>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ProtoField {
    pub name: String,
    pub field_type: String,
    pub number: u32,
    pub repeated: bool,
}

pub fn create_metadata_map(metadata: &std::collections::HashMap<String, String>) -> MetadataMap {
    let mut map = MetadataMap::new();

    for (key, value) in metadata {
        if let Ok(key) = key.parse::<MetadataKey<tonic::metadata::Ascii>>() {
            if let Ok(value) = value.parse::<MetadataValue<tonic::metadata::Ascii>>() {
                let _ = map.insert(key, value);
            }
        }
    }

    map
}

pub fn create_tonic_request<T>(
    message: T,
    metadata: Option<std::collections::HashMap<String, String>>,
) -> Request<T> {
    let mut request = Request::new(message);

    if let Some(metadata_map) = metadata {
        let tonic_metadata = create_metadata_map(&metadata_map);
        *request.metadata_mut() = tonic_metadata;
    }

    request
}
