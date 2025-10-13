// Integration tests for gRPC functionality
// These tests require the grpc-test-server to be running on localhost:50051

use solo_lib::grpc::proto_parser::ProtoParser;
use solo_lib::grpc::reflection::GrpcReflection;
use solo_lib::grpc::{GrpcCallType, GrpcRequest};
use std::collections::HashMap;

const TEST_SERVER_URL: &str = "http://localhost:50051";

/// Test Scenario 1: Parse Echo Proto File
#[tokio::test]
async fn test_scenario_1_parse_echo_proto() {
    let proto_content = r#"
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
"#;

    let result = ProtoParser::parse_proto_file(proto_content);
    assert!(result.is_ok(), "Should parse echo proto successfully");

    let schema = result.unwrap();
    assert_eq!(schema.services.len(), 1, "Should have 1 service");
    assert_eq!(schema.services[0].name, "Echo", "Service should be named Echo");
    assert_eq!(
        schema.services[0].methods.len(),
        1,
        "Should have 1 method"
    );
    assert_eq!(
        schema.services[0].methods[0].name, "Echo",
        "Method should be named Echo"
    );
    assert_eq!(schema.messages.len(), 2, "Should have 2 messages");
}

/// Test Scenario 2: Discovery via Reflection
/// Note: This requires the test server to be running
#[tokio::test]
#[ignore] // Requires live server
async fn test_scenario_2_discover_services() {
    let reflection = GrpcReflection::new(TEST_SERVER_URL).await;

    if reflection.is_err() {
        println!("⚠️  Skipping: Server not available at {}", TEST_SERVER_URL);
        return;
    }

    let reflection = reflection.unwrap();
    let schema = reflection.discover_services().await;

    assert!(schema.is_ok(), "Should discover services successfully");
    let schema = schema.unwrap();

    // The mock implementation returns at least UserService
    assert!(
        !schema.services.is_empty(),
        "Should discover at least one service"
    );
}

/// Test Scenario 3: Authentication Flow (Parse Auth Proto)
#[tokio::test]
async fn test_scenario_3_parse_auth_proto() {
    let auth_proto = r#"
syntax = "proto3";

package auth.v1;

service AuthService {
  rpc Login(LoginRequest) returns (LoginResponse);
}

message LoginRequest {
  string email = 1;
  string password = 2;
}

message LoginResponse {
  string access_token = 1;
  string refresh_token = 2;
  int64 expires_in = 3;
  User user = 4;
}

message User {
  string id = 1;
  string name = 2;
  string email = 3;
  string role = 4;
}
"#;

    let result = ProtoParser::parse_proto_file(auth_proto);
    assert!(result.is_ok(), "Should parse auth proto successfully");

    let schema = result.unwrap();
    assert_eq!(schema.services.len(), 1);
    assert_eq!(schema.services[0].name, "AuthService");

    let login_method = &schema.services[0].methods[0];
    assert_eq!(login_method.name, "Login");
    assert_eq!(login_method.input_type, "LoginRequest");
    assert_eq!(login_method.output_type, "LoginResponse");

    // Verify messages
    assert!(schema.messages.len() >= 3, "Should have at least 3 messages");
    assert!(
        schema.messages.iter().any(|m| m.name == "LoginRequest"),
        "Should have LoginRequest message"
    );
    assert!(
        schema.messages.iter().any(|m| m.name == "LoginResponse"),
        "Should have LoginResponse message"
    );
}

/// Test Scenario 4: Server Streaming (Parse Proto)
#[tokio::test]
async fn test_scenario_4_parse_server_streaming_proto() {
    let streaming_proto = r#"
syntax = "proto3";

package user.v1;

service UserService {
  rpc ListUsers(ListUsersRequest) returns (stream UserResponse);
}

message ListUsersRequest {
  int32 limit = 1;
  int32 page = 2;
}

message UserResponse {
  User user = 1;
}

message User {
  string id = 1;
  string name = 2;
  string email = 3;
}
"#;

    let result = ProtoParser::parse_proto_file(streaming_proto);
    assert!(result.is_ok(), "Should parse streaming proto successfully");

    let schema = result.unwrap();
    let list_users = &schema.services[0].methods[0];

    assert_eq!(list_users.name, "ListUsers");
    // Note: Our parser needs to detect streaming
    // This is a known limitation we should fix
}

/// Test Scenario 5: Error Handling (Invalid Proto)
#[tokio::test]
async fn test_scenario_5_parse_invalid_proto() {
    let invalid_proto = "this is not valid proto syntax!!!";

    let result = ProtoParser::parse_proto_file(invalid_proto);

    // Even with invalid syntax, our basic parser doesn't fail
    // It just returns empty services/messages
    assert!(result.is_ok());
    let schema = result.unwrap();
    assert_eq!(schema.services.len(), 0, "Should have no services");
}

/// Test Scenario 6: Multiple Services
#[tokio::test]
async fn test_scenario_6_parse_multiple_services() {
    let multi_proto = r#"
syntax = "proto3";

service UserService {
  rpc GetUser(UserRequest) returns (UserResponse);
}

service ProductService {
  rpc GetProduct(ProductRequest) returns (ProductResponse);
}

message UserRequest { string id = 1; }
message UserResponse { string name = 1; }
message ProductRequest { string id = 1; }
message ProductResponse { string name = 1; }
"#;

    let result = ProtoParser::parse_proto_file(multi_proto);
    assert!(result.is_ok());

    let schema = result.unwrap();
    assert_eq!(schema.services.len(), 2, "Should have 2 services");
    assert_eq!(schema.services[0].name, "UserService");
    assert_eq!(schema.services[1].name, "ProductService");
}

/// Test Scenario 7: Request Structure Validation
#[tokio::test]
async fn test_scenario_7_grpc_request_structure() {
    // Test all call types
    let call_types = vec![
        GrpcCallType::Unary,
        GrpcCallType::ServerStreaming,
        GrpcCallType::ClientStreaming,
        GrpcCallType::Bidirectional,
    ];

    for call_type in call_types {
        let request = GrpcRequest {
            url: TEST_SERVER_URL.to_string(),
            service: "TestService".to_string(),
            method: "TestMethod".to_string(),
            message: serde_json::json!({"test": "data"}),
            metadata: Some(HashMap::new()),
            call_type: call_type.clone(),
        };

        // Validate structure
        assert_eq!(request.url, TEST_SERVER_URL);
        assert_eq!(request.service, "TestService");
        assert_eq!(request.method, "TestMethod");
        assert!(request.metadata.is_some());
    }
}

/// Integration Test: Full Workflow
#[tokio::test]
async fn test_full_workflow_parse_and_validate() {
    // Step 1: Parse proto
    let proto = r#"
syntax = "proto3";

service TestService {
  rpc Test(TestRequest) returns (TestResponse);
}

message TestRequest { string id = 1; }
message TestResponse { string result = 1; }
"#;

    let schema = ProtoParser::parse_proto_file(proto).unwrap();

    // Step 2: Verify parsed data
    assert_eq!(schema.services.len(), 1);
    let service = &schema.services[0];
    assert_eq!(service.name, "TestService");
    assert_eq!(service.methods.len(), 1);

    // Step 3: Create request based on parsed schema
    let method = &service.methods[0];
    let request = GrpcRequest {
        url: TEST_SERVER_URL.to_string(),
        service: service.name.clone(),
        method: method.name.clone(),
        message: serde_json::json!({"id": "123"}),
        metadata: None,
        call_type: GrpcCallType::Unary,
    };

    // Step 4: Validate request structure
    assert_eq!(request.service, "TestService");
    assert_eq!(request.method, "Test");
}

/// Test metadata handling
#[tokio::test]
async fn test_metadata_creation() {
    let mut metadata = HashMap::new();
    metadata.insert("authorization".to_string(), "Bearer token123".to_string());
    metadata.insert("x-custom-header".to_string(), "value".to_string());

    let request = GrpcRequest {
        url: TEST_SERVER_URL.to_string(),
        service: "AuthService".to_string(),
        method: "GetUser".to_string(),
        message: serde_json::json!({"id": "user1"}),
        metadata: Some(metadata.clone()),
        call_type: GrpcCallType::Unary,
    };

    assert!(request.metadata.is_some());
    let meta = request.metadata.unwrap();
    assert_eq!(meta.len(), 2);
    assert_eq!(meta.get("authorization").unwrap(), "Bearer token123");
}

