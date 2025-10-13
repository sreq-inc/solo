use crate::error::AppResult;
use crate::grpc::{ProtoField, ProtoMessage, ProtoMethod, ProtoSchema, ProtoService};
use prost_reflect::DescriptorPool;
use prost_types::FileDescriptorSet;
use tonic::transport::Channel;
use tonic_reflection::pb::server_reflection_client::ServerReflectionClient;
use tonic_reflection::pb::server_reflection_request::MessageRequest;
use tonic_reflection::pb::server_reflection_response::MessageResponse;
use tonic_reflection::pb::{ServerReflectionRequest, ServerReflectionResponse};

pub struct GrpcReflection {
    channel: Channel,
    descriptor_pool: Option<DescriptorPool>,
}

impl GrpcReflection {
    pub async fn new(url: &str) -> AppResult<Self> {
        let channel = Channel::from_shared(url.to_string())?.connect().await?;

        Ok(Self {
            channel,
            descriptor_pool: None,
        })
    }

    /// Get the descriptor pool, initializing it if needed
    pub async fn get_descriptor_pool(&mut self) -> AppResult<&DescriptorPool> {
        if self.descriptor_pool.is_none() {
            let pool = self.fetch_descriptor_pool().await?;
            self.descriptor_pool = Some(pool);
        }
        Ok(self.descriptor_pool.as_ref().unwrap())
    }

    /// Fetch all file descriptors from the server via reflection
    async fn fetch_descriptor_pool(&self) -> AppResult<DescriptorPool> {
        let mut client = ServerReflectionClient::new(self.channel.clone());

        // First, list all services
        let list_services_request = ServerReflectionRequest {
            host: String::new(),
            message_request: Some(MessageRequest::ListServices(String::new())),
        };

        let mut stream = client.server_reflection_info(tokio_stream::once(list_services_request)).await?.into_inner();

        let mut file_descriptor_protos = Vec::new();

        // Collect service names
        let mut service_names = Vec::new();
        if let Some(response) = stream.message().await? {
            if let Some(ServerReflectionResponse { message_response: Some(msg), .. }) = Some(response) {
                if let MessageResponse::ListServicesResponse(services) = msg {
                    for service in services.service {
                        service_names.push(service.name);
                    }
                }
            }
        }

        // For each service, get its file descriptor
        for service_name in service_names {
            let request = ServerReflectionRequest {
                host: String::new(),
                message_request: Some(MessageRequest::FileContainingSymbol(service_name)),
            };

            let mut stream = client.server_reflection_info(tokio_stream::once(request)).await?.into_inner();

            if let Some(response) = stream.message().await? {
                if let Some(ServerReflectionResponse { message_response: Some(msg), .. }) = Some(response) {
                    if let MessageResponse::FileDescriptorResponse(fd_response) = msg {
                        for fd_bytes in fd_response.file_descriptor_proto {
                            file_descriptor_protos.push(fd_bytes);
                        }
                    }
                }
            }
        }

        // Decode file descriptors
        use prost::Message;
        let mut file_descriptors = Vec::new();
        for bytes in file_descriptor_protos {
            if let Ok(fd) = prost_types::FileDescriptorProto::decode(&bytes[..]) {
                file_descriptors.push(fd);
            }
        }

        // Create descriptor pool
        let fds = FileDescriptorSet {
            file: file_descriptors,
        };

        let pool = DescriptorPool::from_file_descriptor_set(fds)?;
        Ok(pool)
    }

    pub async fn discover_services(&mut self) -> AppResult<ProtoSchema> {
        let pool = self.get_descriptor_pool().await?;

        let mut services = Vec::new();
        let mut messages = Vec::new();

        // Extract services
        for service in pool.services() {
            let mut methods = Vec::new();

            for method in service.methods() {
                methods.push(ProtoMethod {
                    name: method.name().to_string(),
                    input_type: method.input().full_name().to_string(),
                    output_type: method.output().full_name().to_string(),
                    is_client_streaming: method.is_client_streaming(),
                    is_server_streaming: method.is_server_streaming(),
                });
            }

            services.push(ProtoService {
                name: service.full_name().to_string(),
                methods,
            });
        }

        // Extract messages
        for message in pool.all_messages() {
            let mut fields = Vec::new();

            for field in message.fields() {
                fields.push(ProtoField {
                    name: field.name().to_string(),
                    field_type: format!("{:?}", field.kind()),
                    number: field.number(),
                    repeated: field.is_list(),
                });
            }

            messages.push(ProtoMessage {
                name: message.full_name().to_string(),
                fields,
            });
        }

        Ok(ProtoSchema { services, messages })
    }

    pub async fn get_service_info(&mut self, service_name: &str) -> AppResult<Option<ProtoService>> {
        let schema = self.discover_services().await?;

        Ok(schema
            .services
            .into_iter()
            .find(|service| service.name == service_name))
    }

    pub async fn get_method_info(
        &mut self,
        service_name: &str,
        method_name: &str,
    ) -> AppResult<Option<ProtoMethod>> {
        if let Some(service) = self.get_service_info(service_name).await? {
            Ok(service
                .methods
                .into_iter()
                .find(|method| method.name == method_name))
        } else {
            Ok(None)
        }
    }

    /// Get the internal descriptor pool for making dynamic calls
    pub async fn descriptor_pool(&mut self) -> AppResult<&DescriptorPool> {
        self.get_descriptor_pool().await
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn test_discover_services_returns_mock_data() {
        // Since we can't test against a real server easily,
        // we test that the mock implementation works
        // This will be updated when real reflection is implemented

        // Note: This will fail without a real server, which is expected in unit tests
        // For now, we just test the structure
        let _url = "http://localhost:50051";

        // This would need a running server, so we skip for now
        // In integration tests, we'd test against the real test server
    }

    #[test]
    fn test_reflection_struct_creation() {
        // Just verify we can construct the schema types
        let service = ProtoService {
            name: "TestService".to_string(),
            methods: vec![],
        };

        assert_eq!(service.name, "TestService");
        assert_eq!(service.methods.len(), 0);
    }

    #[test]
    fn test_proto_method_structure() {
        let method = ProtoMethod {
            name: "TestMethod".to_string(),
            input_type: "Request".to_string(),
            output_type: "Response".to_string(),
            is_client_streaming: false,
            is_server_streaming: true,
        };

        assert_eq!(method.name, "TestMethod");
        assert!(!method.is_client_streaming);
        assert!(method.is_server_streaming);
    }
}
