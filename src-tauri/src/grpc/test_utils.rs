#[cfg(test)]
pub mod fixtures {
    use super::super::{ProtoSchema, ProtoService, ProtoMethod, ProtoMessage, ProtoField};

    pub fn simple_echo_proto() -> &'static str {
        r#"
syntax = "proto3";

package test.v1;

service Echo {
  rpc Echo(EchoRequest) returns (EchoResponse);
}

message EchoRequest {
  string message = 1;
}

message EchoResponse {
  string message = 1;
}
"#
    }

    pub fn user_service_proto() -> &'static str {
        r#"
syntax = "proto3";

package user.v1;

service UserService {
  rpc GetUser(GetUserRequest) returns (GetUserResponse);
  rpc ListUsers(ListUsersRequest) returns (stream UserResponse);
  rpc CreateUser(stream CreateUserRequest) returns (CreateUserResponse);
  rpc Chat(stream ChatMessage) returns (stream ChatMessage);
}

message GetUserRequest {
  string id = 1;
}

message GetUserResponse {
  User user = 1;
}

message User {
  string id = 1;
  string name = 2;
  string email = 3;
  string role = 4;
}

message ListUsersRequest {
  int32 limit = 1;
  int32 page = 2;
}

message UserResponse {
  User user = 1;
}

message CreateUserRequest {
  string name = 1;
  string email = 2;
}

message CreateUserResponse {
  User user = 1;
}

message ChatMessage {
  string user_id = 1;
  string message = 2;
  int64 timestamp = 3;
}
"#
    }

    pub fn nested_messages_proto() -> &'static str {
        r#"
syntax = "proto3";

package nested.v1;

service NestedService {
  rpc ProcessData(DataRequest) returns (DataResponse);
}

message DataRequest {
  string id = 1;
  Metadata metadata = 2;
  repeated Tag tags = 3;
}

message DataResponse {
  bool success = 1;
  Result result = 2;
}

message Metadata {
  string created_by = 1;
  int64 created_at = 2;
  map<string, string> attributes = 3;
}

message Tag {
  string name = 1;
  string value = 2;
}

message Result {
  int32 code = 1;
  string message = 2;
  repeated string errors = 3;
}
"#
    }

    pub fn invalid_proto() -> &'static str {
        r#"
syntax = "proto3"

package invalid;

service BadService {
  rpc MissingTypes() returns ();
}
"#
    }

    pub fn proto_with_enums() -> &'static str {
        r#"
syntax = "proto3";

package enums.v1;

service EnumService {
  rpc UpdateStatus(StatusRequest) returns (StatusResponse);
}

enum Status {
  UNKNOWN = 0;
  PENDING = 1;
  APPROVED = 2;
  REJECTED = 3;
}

message StatusRequest {
  string id = 1;
  Status status = 2;
}

message StatusResponse {
  bool success = 1;
  Status new_status = 2;
}
"#
    }

    pub fn expected_echo_schema() -> ProtoSchema {
        ProtoSchema {
            services: vec![ProtoService {
                name: "Echo".to_string(),
                methods: vec![ProtoMethod {
                    name: "Echo".to_string(),
                    input_type: "EchoRequest".to_string(),
                    output_type: "EchoResponse".to_string(),
                    is_client_streaming: false,
                    is_server_streaming: false,
                }],
            }],
            messages: vec![
                ProtoMessage {
                    name: "EchoRequest".to_string(),
                    fields: vec![ProtoField {
                        name: "message".to_string(),
                        field_type: "string".to_string(),
                        number: 1,
                        repeated: false,
                    }],
                },
                ProtoMessage {
                    name: "EchoResponse".to_string(),
                    fields: vec![ProtoField {
                        name: "message".to_string(),
                        field_type: "string".to_string(),
                        number: 1,
                        repeated: false,
                    }],
                },
            ],
        }
    }

    pub fn mock_grpc_response_success(data: serde_json::Value) -> super::super::GrpcResponse {
        super::super::GrpcResponse {
            success: true,
            data: Some(data),
            error: None,
            status_code: Some(0),
            status_message: Some("OK".to_string()),
        }
    }

    pub fn mock_grpc_response_error(error_msg: &str) -> super::super::GrpcResponse {
        super::super::GrpcResponse {
            success: false,
            data: None,
            error: Some(error_msg.to_string()),
            status_code: Some(5),
            status_message: Some("NOT_FOUND".to_string()),
        }
    }
}

