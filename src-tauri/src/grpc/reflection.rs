use crate::error::AppResult;
use crate::grpc::{ProtoField, ProtoMessage, ProtoMethod, ProtoSchema, ProtoService};
use tonic::transport::Channel;

pub struct GrpcReflection {
    channel: Channel,
}

impl GrpcReflection {
    pub async fn new(url: &str) -> AppResult<Self> {
        let channel = Channel::from_shared(url.to_string())?.connect().await?;

        Ok(Self { channel })
    }

    pub async fn discover_services(&self) -> AppResult<ProtoSchema> {
        // Use the channel by cloning it for potential future use
        let _channel_clone = self.channel.clone();

        // Mock implementation for now
        // In a real implementation, this would use the reflection API

        let mock_services = vec![
            ProtoService {
                name: "UserService".to_string(),
                methods: vec![
                    ProtoMethod {
                        name: "GetUser".to_string(),
                        input_type: "GetUserRequest".to_string(),
                        output_type: "GetUserResponse".to_string(),
                        is_client_streaming: false,
                        is_server_streaming: false,
                    },
                    ProtoMethod {
                        name: "ListUsers".to_string(),
                        input_type: "ListUsersRequest".to_string(),
                        output_type: "ListUsersResponse".to_string(),
                        is_client_streaming: false,
                        is_server_streaming: true,
                    },
                ],
            },
            ProtoService {
                name: "ProductService".to_string(),
                methods: vec![ProtoMethod {
                    name: "CreateProduct".to_string(),
                    input_type: "CreateProductRequest".to_string(),
                    output_type: "CreateProductResponse".to_string(),
                    is_client_streaming: false,
                    is_server_streaming: false,
                }],
            },
        ];

        let mock_messages = vec![
            ProtoMessage {
                name: "GetUserRequest".to_string(),
                fields: vec![ProtoField {
                    name: "id".to_string(),
                    field_type: "string".to_string(),
                    number: 1,
                    repeated: false,
                }],
            },
            ProtoMessage {
                name: "GetUserResponse".to_string(),
                fields: vec![ProtoField {
                    name: "user".to_string(),
                    field_type: "User".to_string(),
                    number: 1,
                    repeated: false,
                }],
            },
        ];

        Ok(ProtoSchema {
            services: mock_services,
            messages: mock_messages,
        })
    }

    pub async fn get_service_info(&self, service_name: &str) -> AppResult<Option<ProtoService>> {
        let schema = self.discover_services().await?;

        Ok(schema
            .services
            .into_iter()
            .find(|service| service.name == service_name))
    }

    pub async fn get_method_info(
        &self,
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
}
