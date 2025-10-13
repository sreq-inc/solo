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
        // or: rpc ListUsers(ListUsersRequest) returns (stream UserResponse);

        let parts: Vec<&str> = line.split_whitespace().collect();
        if parts.len() < 4 {
            return None;
        }

        // Extract method name (parts[1] might be like "Echo(EchoRequest)")
        let method_name = if parts[1].contains('(') {
            parts[1].split('(').next().unwrap_or("Unknown").to_string()
        } else {
            parts[1].to_string()
        };

        // Extract input type from the part containing the first parentheses
        let input_type = if parts[1].contains('(') {
            // Case: "Echo(EchoRequest)"
            parts[1]
                .split('(')
                .nth(1)
                .unwrap_or("Unknown")
                .trim_matches(')')
                .trim_matches(';')
                .to_string()
        } else {
            // Case: separate parts
            parts.get(2)
                .map(|s| s.trim_matches('(').trim_matches(')').to_string())
                .unwrap_or("Unknown".to_string())
        };

        // Check for streaming keywords
        let is_client_streaming = line.contains("stream") &&
            line.find("stream").unwrap_or(0) < line.find("returns").unwrap_or(usize::MAX);
        let is_server_streaming = line.contains("stream") &&
            line.find("stream").unwrap_or(usize::MAX) > line.find("returns").unwrap_or(0);

        // Extract output type - find the last parenthesized value
        let output_type = if let Some(returns_idx) = line.find("returns") {
            let after_returns = &line[returns_idx..];
            if let Some(start) = after_returns.find('(') {
                if let Some(end) = after_returns.find(')') {
                    after_returns[start + 1..end]
                        .trim()
                        .replace("stream ", "")
                        .to_string()
                } else {
                    "Unknown".to_string()
                }
            } else {
                "Unknown".to_string()
            }
        } else {
            "Unknown".to_string()
        };

        Some(ProtoMethod {
            name: method_name,
            input_type,
            output_type,
            is_client_streaming,
            is_server_streaming,
        })
    }

    fn parse_field(line: &str) -> Option<ProtoField> {
        // Parse: string name = 1;
        // or: repeated string tags = 3;
        let parts: Vec<&str> = line.split_whitespace().collect();
        if parts.len() < 4 {
            return None;
        }

        let repeated = line.trim().starts_with("repeated");
        let (field_type, name, number_idx) = if repeated {
            // repeated string tags = 3;
            // parts: ["repeated", "string", "tags", "=", "3;"]
            (parts[1].to_string(), parts[2].to_string(), 4)
        } else {
            // string name = 1;
            // parts: ["string", "name", "=", "1;"]
            (parts[0].to_string(), parts[1].to_string(), 3)
        };

        let number = parts
            .get(number_idx)
            .and_then(|s| s.trim_matches(';').parse().ok())
            .unwrap_or(0);

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
    use crate::grpc::test_utils::fixtures;

    #[test]
    fn test_parse_simple_echo_proto() {
        let proto = fixtures::simple_echo_proto();
        let result = ProtoParser::parse_proto_file(proto);

        assert!(result.is_ok());
        let schema = result.unwrap();

        assert_eq!(schema.services.len(), 1);
        assert_eq!(schema.services[0].name, "Echo");
        assert_eq!(schema.services[0].methods.len(), 1);
        assert_eq!(schema.services[0].methods[0].name, "Echo");
        assert_eq!(schema.services[0].methods[0].input_type, "EchoRequest");
        assert_eq!(schema.services[0].methods[0].output_type, "EchoResponse");

        assert_eq!(schema.messages.len(), 2);
    }

    #[test]
    fn test_parse_user_service_proto() {
        let proto = fixtures::user_service_proto();
        let result = ProtoParser::parse_proto_file(proto);

        assert!(result.is_ok());
        let schema = result.unwrap();

        assert_eq!(schema.services.len(), 1);
        assert_eq!(schema.services[0].name, "UserService");
        assert_eq!(schema.services[0].methods.len(), 4);

        // Verify methods
        let methods = &schema.services[0].methods;
        assert_eq!(methods[0].name, "GetUser");
        assert_eq!(methods[1].name, "ListUsers");
        assert_eq!(methods[2].name, "CreateUser");
        assert_eq!(methods[3].name, "Chat");

        // Verify messages
        assert!(schema.messages.len() >= 5);
    }

    #[test]
    fn test_parse_nested_messages() {
        let proto = fixtures::nested_messages_proto();
        let result = ProtoParser::parse_proto_file(proto);

        assert!(result.is_ok());
        let schema = result.unwrap();

        assert_eq!(schema.services.len(), 1);
        assert!(schema.messages.len() >= 4);

        // Find Metadata message
        let metadata = schema.messages.iter().find(|m| m.name == "Metadata");
        assert!(metadata.is_some());
    }

    #[test]
    fn test_parse_proto_with_enums() {
        let proto = fixtures::proto_with_enums();
        let result = ProtoParser::parse_proto_file(proto);

        assert!(result.is_ok());
        let schema = result.unwrap();

        assert_eq!(schema.services.len(), 1);
        assert_eq!(schema.services[0].name, "EnumService");
    }

    #[test]
    fn test_parse_empty_proto() {
        let proto = "";
        let result = ProtoParser::parse_proto_file(proto);

        assert!(result.is_ok());
        let schema = result.unwrap();

        assert_eq!(schema.services.len(), 0);
        assert_eq!(schema.messages.len(), 0);
    }

    #[test]
    fn test_parse_proto_with_comments() {
        let proto = r#"
// This is a comment
syntax = "proto3";

// Service comment
service TestService {
  // Method comment
  rpc Test(TestRequest) returns (TestResponse);
}

// Message comment
message TestRequest {
  string id = 1; // Field comment
}

message TestResponse {
  bool success = 1;
}
"#;
        let result = ProtoParser::parse_proto_file(proto);

        assert!(result.is_ok());
        let schema = result.unwrap();

        assert_eq!(schema.services.len(), 1);
        assert_eq!(schema.messages.len(), 2);
    }

    #[test]
    fn test_parse_rpc_method_unary() {
        let line = "rpc GetUser(GetUserRequest) returns (GetUserResponse);";
        let method = ProtoParser::parse_rpc_method(line);

        assert!(method.is_some());
        let m = method.unwrap();

        assert_eq!(m.name, "GetUser");
        assert_eq!(m.input_type, "GetUserRequest");
        assert_eq!(m.output_type, "GetUserResponse");
        assert!(!m.is_client_streaming);
        assert!(!m.is_server_streaming);
    }

    #[test]
    fn test_parse_field_simple() {
        let line = "string name = 1;";
        let field = ProtoParser::parse_field(line);

        assert!(field.is_some());
        let f = field.unwrap();

        assert_eq!(f.name, "name");
        assert_eq!(f.field_type, "string");
        assert_eq!(f.number, 1);
        assert!(!f.repeated);
    }

    #[test]
    fn test_parse_field_repeated() {
        let line = "repeated string tags = 3;";
        let field = ProtoParser::parse_field(line);

        assert!(field.is_some());
        let f = field.unwrap();

        assert_eq!(f.name, "tags");
        assert_eq!(f.field_type, "string");
        assert_eq!(f.number, 3);
        assert!(f.repeated);
    }

    #[test]
    fn test_parse_field_with_type_int32() {
        let line = "int32 count = 2;";
        let field = ProtoParser::parse_field(line);

        assert!(field.is_some());
        let f = field.unwrap();

        assert_eq!(f.field_type, "int32");
        assert_eq!(f.number, 2);
    }

    #[test]
    fn test_parse_multiple_services() {
        let proto = r#"
service ServiceA {
  rpc MethodA(RequestA) returns (ResponseA);
}

service ServiceB {
  rpc MethodB(RequestB) returns (ResponseB);
}
"#;
        let result = ProtoParser::parse_proto_file(proto);

        assert!(result.is_ok());
        let schema = result.unwrap();

        assert_eq!(schema.services.len(), 2);
        assert_eq!(schema.services[0].name, "ServiceA");
        assert_eq!(schema.services[1].name, "ServiceB");
    }

    #[test]
    fn test_parse_service_with_no_methods() {
        let proto = r#"
service EmptyService {
}
"#;
        let result = ProtoParser::parse_proto_file(proto);

        assert!(result.is_ok());
        let schema = result.unwrap();

        assert_eq!(schema.services.len(), 1);
        assert_eq!(schema.services[0].methods.len(), 0);
    }

    #[test]
    fn test_parse_message_with_no_fields() {
        let proto = r#"
message Empty {
}
"#;
        let result = ProtoParser::parse_proto_file(proto);

        assert!(result.is_ok());
        let schema = result.unwrap();

        assert_eq!(schema.messages.len(), 1);
        assert_eq!(schema.messages[0].fields.len(), 0);
    }
}
