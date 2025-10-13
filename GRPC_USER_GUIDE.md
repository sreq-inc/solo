# 📘 Solo gRPC User Guide

**Complete guide to using gRPC functionality in Solo**

---

## 🎯 Table of Contents

1. [Introduction](#introduction)
2. [Getting Started](#getting-started)
3. [Proto File Setup](#proto-file-setup)
4. [Service Discovery](#service-discovery)
5. [Making Requests](#making-requests)
6. [Authentication](#authentication)
7. [Custom Metadata](#custom-metadata)
8. [Schema Viewer](#schema-viewer)
9. [Troubleshooting](#troubleshooting)
10. [FAQ](#faq)

---

## Introduction

Solo now supports **gRPC** requests, making it easy to test and interact with gRPC services. This guide will walk you through all the features and how to use them effectively.

### What you can do:

- ✅ **Unary requests** (single request, single response)
- ✅ **Server streaming** (single request, multiple responses)
- ⏳ **Client streaming** (coming soon)
- ⏳ **Bidirectional streaming** (coming soon)
- ✅ **Service discovery via reflection**
- ✅ **Proto file parsing**
- ✅ **Authentication (Bearer tokens)**
- ✅ **Custom metadata headers**
- ✅ **Schema visualization**

---

## Getting Started

### 1. Switch to gRPC Mode

1. Open Solo
2. Click on the **Method dropdown** (GET/POST/etc.)
3. Select **gRPC** from the request type options

Your interface will now show gRPC-specific tabs and options.

### 2. Enter Your gRPC Server URL

In the URL bar, enter your gRPC server address:

```
localhost:50051
```

Or with protocol:

```
grpc://localhost:50051
http://localhost:9090
```

**Note**: Solo supports both plaintext (insecure) and TLS connections automatically.

---

## Proto File Setup

You have **two ways** to set up your gRPC service definitions:

### Option A: Paste Proto File (Manual)

1. Go to the **Proto** tab
2. Paste your `.proto` file content
3. Click **Parse Proto**
4. Services and methods will be populated automatically

**Example proto file**:

```protobuf
syntax = "proto3";

package user.v1;

service UserService {
  rpc GetUser(GetUserRequest) returns (GetUserResponse);
  rpc ListUsers(ListUsersRequest) returns (stream User);
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
}

message ListUsersRequest {
  int32 limit = 1;
}
```

### Option B: Service Discovery (Automatic)

If your server supports **gRPC reflection**:

1. Enter your server URL
2. Click **Discover Services**
3. All available services will be automatically loaded

**Requirements**:

- Server must have reflection enabled
- Server must be running and accessible

---

## Service Discovery

### Using the Discover Services Button

1. Make sure your URL is correct
2. (Optional) Click **Test Connection** to verify connectivity
3. Click **Discover Services**
4. Wait for the discovery process (usually < 1 second)
5. Services and methods will be populated in the dropdowns

### Visual Feedback

- 🟢 **Green badge**: "Found X services" - Discovery successful
- 🔴 **Red badge**: Error message - Check URL or server status
- ⏳ **Spinner**: "Discovering..." - Process in progress

---

## Making Requests

### Unary Requests (Single Response)

1. Select your **Service** from the dropdown
2. Select your **Method** from the dropdown
3. Choose call type: **Unary**
4. Enter your request message in JSON format:

```json
{
  "id": "user123"
}
```

5. Click **Send**

### Server Streaming Requests (Multiple Responses)

1. Select your **Service** and **Method**
2. Choose call type: **Server Streaming**
3. Enter your request message
4. Click **Send**
5. Responses will appear incrementally as they arrive

**Example use cases**:

- Real-time data feeds
- Large data pagination
- Live updates

---

## Authentication

Solo supports **Bearer Token** authentication for gRPC requests.

### Setting Up Auth

1. Go to the **Auth** tab
2. Select **Bearer Token**
3. Enter your token:

```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

4. The token will be automatically sent as the `authorization` metadata header:

```
authorization: Bearer YOUR_TOKEN
```

### How it works

- Solo automatically adds the `authorization` header to all requests
- The header format follows gRPC metadata conventions
- Works with both unary and streaming requests

---

## Custom Metadata

Need to send **custom headers** beyond authentication? Use the Metadata tab.

### Adding Custom Headers

1. Go to the **Metadata** tab
2. Click **+ Add Header**
3. Enter key-value pairs:

```
Key: x-request-id
Value: req-12345
```

### Important Rules

- ✅ Keys must be **lowercase**
- ✅ Keys should use hyphens (e.g., `x-custom-header`)
- ✅ Use checkboxes to temporarily disable headers
- ❌ Don't use uppercase letters in keys

### Common Headers

```
x-request-id: unique-request-id
x-trace-id: trace-123
x-api-version: v1
x-user-id: user-456
x-tenant-id: tenant-789
```

### Tips

- Solo validates keys automatically
- Invalid keys will show a warning
- You can have unlimited headers
- Headers are combined with auth headers automatically

---

## Schema Viewer

The **Schema** tab shows the structure of your gRPC services and messages.

### Viewing Services

1. Parse a proto file or discover services
2. Go to the **Schema** tab
3. See all services and methods organized

**What you'll see**:

- **Service name** (e.g., `UserService`)
- **Methods** with input/output types
- **Streaming badges** (Unary, Server Stream, etc.)

### Viewing Messages

Click on any message to expand and see:

- **Field names**
- **Field types** (string, int32, bool, etc.)
- **Field numbers**
- **Modifiers** (repeated, optional, etc.)

### Color Coding

- 🟢 **Green**: string types
- 🔵 **Blue**: numeric types (int32, float, etc.)
- 🟣 **Purple**: boolean types
- 🟡 **Yellow**: custom message types

---

## Troubleshooting

### ❌ "Failed to connect"

**Possible causes**:

- Server is not running
- Wrong URL or port
- Firewall blocking connection
- TLS/plaintext mismatch

**Solutions**:

1. Click **Test Connection** to verify
2. Check server logs
3. Try with/without `http://` prefix
4. Verify port number

### ❌ "Failed to discover services"

**Possible causes**:

- Server doesn't support reflection
- Reflection not enabled
- Network issues

**Solutions**:

1. Ask your backend team if reflection is enabled
2. Use **manual proto paste** instead
3. Check server reflection configuration

### ❌ "Invalid JSON format"

**Possible causes**:

- Malformed JSON in message field
- Missing quotes or commas
- Trailing commas

**Solutions**:

1. Use the **Format JSON** button
2. Copy-paste from a JSON validator
3. Check for syntax errors (red border indicates invalid JSON)

### ❌ "Metadata key must be lowercase"

**Possible causes**:

- Used uppercase letters in header keys

**Solutions**:

1. Change `X-Custom-Header` to `x-custom-header`
2. Solo will auto-lowercase keys for you

### ❌ "UNAUTHENTICATED" error

**Possible causes**:

- Missing or invalid token
- Token expired
- Wrong auth method

**Solutions**:

1. Check token in **Auth** tab
2. Verify token hasn't expired
3. Ask backend for new token if needed

---

## FAQ

### Q: Do I need proto files to use Solo's gRPC?

**A:** No! If your server supports **reflection**, you can use **Discover Services** to automatically load everything. Proto files are only needed if your server doesn't support reflection.

---

### Q: Can I test localhost servers?

**A:** Yes! Solo works perfectly with localhost gRPC servers. Just use:

- `localhost:50051`
- `127.0.0.1:50051`

---

### Q: Does Solo support TLS/SSL?

**A:** Yes, Solo automatically detects and uses TLS when appropriate. No special configuration needed.

---

### Q: How do I know if my server supports reflection?

**A:** Click **Discover Services**. If it works, your server supports reflection. If it fails with "Failed to discover services", your server likely doesn't have reflection enabled.

---

### Q: Can I save my gRPC requests?

**A:** Currently, gRPC requests are saved in your browser's session. Full request history coming soon!

---

### Q: What gRPC features are supported?

Currently supported:

- ✅ Unary calls
- ✅ Server streaming
- ✅ Service discovery
- ✅ Bearer token auth
- ✅ Custom metadata

Coming soon:

- ⏳ Client streaming
- ⏳ Bidirectional streaming
- ⏳ Request history
- ⏳ Collection management

---

### Q: I'm getting timeout errors. What should I do?

**A:**

1. Check if server is responding
2. Try increasing timeout (coming in future update)
3. Check network connectivity
4. Verify server isn't overloaded

---

### Q: Can I use Solo with gRPC-Web?

**A:** Currently, Solo targets standard gRPC. gRPC-Web support is planned for a future release.

---

### Q: How do I report bugs or request features?

**A:** Please open an issue on our GitHub repository with:

- Steps to reproduce
- Expected vs actual behavior
- Screenshots if applicable
- Your OS and Solo version

---

## Best Practices

### 1. Use Test Connection First

Always click **Test Connection** before making requests to verify your server is reachable.

### 2. Use Service Discovery When Possible

It's faster and less error-prone than manual proto pasting.

### 3. Format Your JSON

Use the **Format JSON** button to ensure your messages are valid before sending.

### 4. Check the Schema Tab

Not sure what fields a message needs? Check the **Schema** tab to see the full structure.

### 5. Use Descriptive Metadata

Add meaningful headers like `x-request-id` for better debugging and tracing.

---

## Keyboard Shortcuts

- **Ctrl/Cmd + Enter**: Send request
- **Ctrl/Cmd + K**: Focus URL bar
- **Ctrl/Cmd + /**: Toggle shortcuts help

---

## Next Steps

Now that you know the basics:

1. ✅ Try connecting to your gRPC server
2. ✅ Discover services or paste a proto file
3. ✅ Make your first unary request
4. ✅ Explore the schema viewer
5. ✅ Add authentication if needed
6. ✅ Experiment with custom metadata

---

## Support

Need help? Here are your options:

- 📖 Re-read this guide
- 🐛 Check the [Troubleshooting](#troubleshooting) section
- 💬 Ask on GitHub Discussions
- 🚨 Report bugs on GitHub Issues

---

**Happy Testing with Solo! 🚀**
