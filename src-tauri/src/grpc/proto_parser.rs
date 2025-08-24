use crate::error::AppResult;
use crate::grpc::{ProtoField, ProtoMessage, ProtoMethod, ProtoSchema, ProtoService};

pub struct ProtoParser;

impl ProtoParser {
    pub fn parse_proto_file(content: &str) -> AppResult<ProtoSchema> {
        // Simple proto file parser
        // This is a basic implementation - in production you'd want a more robust parser

        let mut services = Vec::new();
        let mut messages = Vec::new();

        let lines: Vec<&str> = content.lines().collect();
        let mut current_service: Option<ProtoService> = None;
        let mut current_message: Option<ProtoMessage> = None;

        for line in lines {
            let trimmed = line.trim();

            if trimmed.starts_with("service ") {
                // Start of a new service
                if let Some(service) = current_service.take() {
                    services.push(service);
                }

                let service_name = trimmed
                    .strip_prefix("service ")
                    .and_then(|s| s.strip_suffix(" {"))
                    .unwrap_or("UnknownService")
                    .to_string();

                current_service = Some(ProtoService {
                    name: service_name,
                    methods: Vec::new(),
                });
            } else if trimmed.starts_with("message ") {
                // Start of a new message
                if let Some(message) = current_message.take() {
                    messages.push(message);
                }

                let message_name = trimmed
                    .strip_prefix("message ")
                    .and_then(|s| s.strip_suffix(" {"))
                    .unwrap_or("UnknownMessage")
                    .to_string();

                current_message = Some(ProtoMessage {
                    name: message_name,
                    fields: Vec::new(),
                });
            } else if trimmed.starts_with("rpc ") && current_service.is_some() {
                // Parse RPC method
                if let Some(service) = &mut current_service {
                    if let Some(method) = Self::parse_rpc_method(trimmed) {
                        service.methods.push(method);
                    }
                }
            } else if trimmed.contains("=") && current_message.is_some() {
                // Parse message field
                if let Some(message) = &mut current_message {
                    if let Some(field) = Self::parse_field(trimmed) {
                        message.fields.push(field);
                    }
                }
            }
        }

        // Add the last service and message
        if let Some(service) = current_service {
            services.push(service);
        }
        if let Some(message) = current_message {
            messages.push(message);
        }

        Ok(ProtoSchema { services, messages })
    }

    fn parse_rpc_method(line: &str) -> Option<ProtoMethod> {
        // Parse: rpc GetUser(GetUserRequest) returns (GetUserResponse);
        let parts: Vec<&str> = line.split_whitespace().collect();
        if parts.len() < 6 {
            return None;
        }

        let method_name = parts[1].to_string();
        let input_type = parts[2].trim_matches('(').to_string();
        let output_type = parts[4].trim_matches('(').to_string();

        // For now, assume all methods are unary
        // In a real parser, you'd check for stream keywords
        Some(ProtoMethod {
            name: method_name,
            input_type,
            output_type,
            is_client_streaming: false,
            is_server_streaming: false,
        })
    }

    fn parse_field(line: &str) -> Option<ProtoField> {
        // Parse: string name = 1;
        let parts: Vec<&str> = line.split_whitespace().collect();
        if parts.len() < 4 {
            return None;
        }

        let field_type = parts[0].to_string();
        let name = parts[1].to_string();
        let number = parts[3].trim_matches(';').parse().unwrap_or(0);
        let repeated = line.contains("repeated");

        Some(ProtoField {
            name,
            field_type,
            number,
            repeated,
        })
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_parse_simple_proto() {
        let proto_content = r#"
            service UserService {
                rpc GetUser(GetUserRequest) returns (GetUserResponse);
                rpc ListUsers(ListUsersRequest) returns (stream ListUsersResponse);
            }

            message GetUserRequest {
                string id = 1;
            }

            message GetUserResponse {
                User user = 1;
            }
        "#;

        let result = ProtoParser::parse_proto_file(proto_content).unwrap();

        assert_eq!(result.services.len(), 1);
        assert_eq!(result.services[0].name, "UserService");
        assert_eq!(result.services[0].methods.len(), 2);
        assert_eq!(result.messages.len(), 2);
    }
}
