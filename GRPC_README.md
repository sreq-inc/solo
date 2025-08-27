# 🚀 gRPC Support in Solo

Solo now supports gRPC requests alongside HTTP and GraphQL! This feature allows you to test gRPC services directly from the application.

## ✨ Features

- **Proto File Parsing**: Upload and parse `.proto` files to discover services and methods
- **Service Discovery**: Auto-discovery of services and methods from proto definitions
- **Multiple Call Types**: Support for unary, server streaming, client streaming, and bidirectional streaming
- **Message Editor**: JSON editor for gRPC message payloads
- **Authentication**: Support for Bearer token authentication via metadata
- **Service Reflection**: Server reflection support for dynamic service discovery

## 🎯 Getting Started

### 1. Create a gRPC Request

1. Right-click on any folder in the sidebar
2. Select "gRPC Request" from the context menu
3. The application will switch to gRPC mode

### 2. Configure Your gRPC Request

#### Proto File Input

- Paste your `.proto` file content in the "Proto File Content" textarea
- Click "Parse Proto" to extract services and methods
- Alternatively, use "Discover Services" for server reflection

#### Service and Method Selection

- Choose a service from the dropdown (e.g., "UserService")
- Select a method (e.g., "GetUser")
- The interface will automatically show method information

#### Call Type Selection

- **Unary**: Single request, single response
- **Server Streaming**: Single request, multiple responses
- **Client Streaming**: Multiple requests, single response
- **Bidirectional**: Multiple requests, multiple responses

#### Message Configuration

- Enter your message payload in JSON format
- Use the "Format JSON" button to prettify your JSON
- Example: `{"id": "123", "name": "John Doe"}`

### 3. Set the Server URL

- Enter your gRPC server URL in the main input field
- Format: `grpc://localhost:50051` or `grpc://your-server.com:443`
- For local development: `grpc://localhost:50051`

### 4. Send the Request

- Click the "Send" button to execute your gRPC request
- View the response in the Response tab
- For streaming requests, you'll see multiple responses over time

## 🔧 Configuration

### Authentication

gRPC requests support Bearer token authentication:

1. Go to the "Auth" tab
2. Enter your Bearer token
3. The token will be automatically included in gRPC metadata

### Variables Support

Use environment variables in your gRPC requests:

- URL: `grpc://{{grpcUrl}}/service`
- Message: `{"id": "{{userId}}", "name": "{{userName}}"}`

## 📁 Example Proto File

Here's a sample `.proto` file you can use for testing:

```protobuf
syntax = "proto3";

package example;

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

message ListUsersRequest {
  int32 page = 1;
  int32 limit = 2;
}

message ListUsersResponse {
  repeated User users = 1;
  int32 total = 2;
}

message User {
  string id = 1;
  string name = 2;
  string email = 3;
}
```

## 🎮 Usage Examples

### Unary Call

```json
{
  "service": "UserService",
  "method": "GetUser",
  "message": { "id": "123" },
  "callType": "unary"
}
```

### Server Streaming Call

```json
{
  "service": "UserService",
  "method": "ListUsers",
  "message": { "page": 1, "limit": 10 },
  "callType": "server_streaming"
}
```

## 🔍 Troubleshooting

### Common Issues

1. **Connection Failed**: Ensure your gRPC server is running and accessible
2. **Proto Parse Error**: Check that your `.proto` file syntax is correct
3. **Service Not Found**: Verify the service name matches exactly (case-sensitive)
4. **Method Not Found**: Ensure the method name exists in the selected service

### Debug Tips

- Check the browser console for detailed error messages
- Verify your gRPC server supports the reflection API if using service discovery
- Ensure your server accepts the call type you're trying to use

## 🚧 Current Limitations

- **Mock Implementation**: The current backend uses mock responses for demonstration
- **Real gRPC Client**: Full gRPC client implementation requires proto-generated code
- **Streaming UI**: Advanced streaming interface is planned for future releases

## 🔮 Future Enhancements

- [ ] Real gRPC client implementation
- [ ] Advanced streaming interface
- [ ] Proto file import/export
- [ ] gRPC status code handling
- [ ] Metadata editor
- [ ] TLS certificate support
- [ ] Interceptor support

## 💡 Tips for Development

1. **Start Simple**: Begin with unary calls before moving to streaming
2. **Use Variables**: Leverage environment variables for dynamic values
3. **Test Locally**: Use local gRPC servers for development and testing
4. **Proto Validation**: Ensure your proto files are syntactically correct
5. **Error Handling**: Check response status codes and error messages

## 🤝 Contributing

Found a bug or have a feature request? Please open an issue on GitHub!

---

**Note**: This is a beta feature. Some functionality may be limited or subject to change.
