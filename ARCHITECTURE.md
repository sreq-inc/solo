# Architecture Documentation

This document provides a comprehensive overview of Solo's architecture, including frontend components, backend modules, and data flow patterns.

## Table of Contents

- [Overview](#overview)
- [Frontend Architecture](#frontend-architecture)
  - [Context Providers](#context-providers)
  - [Components](#components)
  - [Hooks](#hooks)
- [Backend Architecture](#backend-architecture)
  - [Modules](#modules)
  - [Tauri Commands](#tauri-commands)
- [Data Flow](#data-flow)
- [Storage Architecture](#storage-architecture)
- [Technology Stack](#technology-stack)

## Overview

Solo is a cross-platform API client built with Tauri 2, React, and TypeScript. The application follows a clear separation between frontend (React/TypeScript) and backend (Rust/Tauri), communicating through Tauri's IPC bridge.

**Key Features:**
- HTTP, GraphQL, and gRPC request execution
- Collection-based request organization
- Folder-scoped variables with `{{variableName}}` syntax
- Multiple authentication methods (Basic, Bearer)
- Light/dark theme support
- Proto file parsing and gRPC reflection
- Auto-save functionality

## Frontend Architecture

### Context Providers

The frontend uses React Context API for global state management. All contexts are located in `src/context/`.

#### FileContext (`src/context/FileContext.tsx`)

Manages collections (folders) and requests with localStorage persistence.

**Responsibilities:**
- CRUD operations for folders and requests
- Auto-save request changes
- Request file management (create, delete, rename, duplicate)
- Folder management (create, delete, rename)
- Current request tracking

**Key State:**
- `folders`: Object mapping folder names to arrays of request IDs
- `openFolders`: Object tracking which folders are expanded in the UI
- `currentFolder`: Active folder name
- `currentRequestId`: Currently selected request ID
- `showModal`: Modal visibility state

**Key Functions:**
- `createFolder(folderName)`: Creates a new folder
- `createNewRequest(folder, type)`: Creates a new request in a folder (HTTP/GraphQL/gRPC)
- `saveRequest()`: Persists request to localStorage
- `handleFileClick(fileName)`: Loads a request into the editor
- `renameFolder(oldName, newName)`: Renames a folder and migrates data
- `duplicateRequest(folder, fileName)`: Duplicates an existing request

**Storage Pattern:**
- Key: `{folderName}`
- Value: `Array<StoredFile>`

#### RequestContext (`src/context/RequestContext.tsx`)

Manages the current request state and execution.

**Responsibilities:**
- Request configuration (method, URL, payload, auth)
- Request execution via Tauri commands
- Response handling and display
- Support for HTTP, GraphQL, and gRPC request types
- JSON formatting and validation
- Performance metrics (response time, status code)

**Key State:**
- `method`: HTTP method (GET, POST, PUT, DELETE, PATCH)
- `url`: Request URL
- `payload`: Request body (JSON string)
- `requestType`: "http" | "graphql" | "grpc"
- `useBasicAuth`, `username`, `password`: Basic auth config
- `bearerToken`: Bearer token auth
- `queryParams`: URL query parameters
- `graphqlQuery`, `graphqlVariables`: GraphQL-specific fields
- `grpcService`, `grpcMethod`, `grpcMessage`, `grpcCallType`: gRPC-specific fields
- `response`, `error`, `loading`: Response state
- `responseTime`, `statusCode`: Performance metrics

**Key Functions:**
- `handleRequest(processedUrl?)`: Executes the request via appropriate Tauri command
- `resetFields()`: Resets all request fields to defaults
- `formatJson()`: Formats payload JSON
- `formatGraphqlVariables()`: Formats GraphQL variables JSON
- `handleCopyResponse()`: Copies response to clipboard

**Request Execution Flow:**
1. Variable substitution (via VariablesContext)
2. Request validation
3. Tauri command invocation based on request type and auth
4. Response/error handling
5. Performance metric calculation

#### VariablesContext (`src/context/VariablesContext.tsx`)

Manages folder-scoped variables for dynamic URL and payload substitution.

**Responsibilities:**
- Variable management (add, remove, update)
- Variable substitution in URLs and payloads
- Folder-scoped variable persistence
- Current folder tracking

**Key State:**
- `variables`: Array of `Variable` objects (`{key, value, enabled}`)
- `currentFolder`: Active folder name

**Key Functions:**
- `loadVariablesForFolder(folderName)`: Loads variables for a specific folder
- `replaceVariablesInUrl(url)`: Replaces `{{variableName}}` with actual values
- `addVariable()`: Adds a new variable row
- `removeVariable(index)`: Removes a variable
- `updateVariable(index, field, value)`: Updates a variable field
- `clearVariables()`: Clears all variables and current folder

**Storage Pattern:**
- localStorage Key: `solo-variables-{folderName}`
- localStorage Value: `Array<Variable>`
- sessionStorage Key: `current-request-folder`
- sessionStorage Value: `{folderName}`

**Variable Syntax:**
- Pattern: `{{variableName}}`
- Example: `https://api.example.com/{{environment}}/users`
- Replacement: Regex-based, supports whitespace inside braces

#### ThemeContext (`src/context/ThemeContext.tsx`)

Manages light/dark theme switching with system preference detection.

**Responsibilities:**
- Theme state management
- System preference detection
- Theme persistence

**Key State:**
- `theme`: "light" | "dark"

**Key Functions:**
- `toggleTheme()`: Switches between light and dark modes

**Storage Pattern:**
- Key: `theme`
- Value: `"light"` | `"dark"`

### Components

Major UI components are located in `src/components/`.

**Core Components:**
- `RequestForm.tsx`: Main request editor with tabs
- `ResponseView.tsx`: Response display with JSON viewer
- `Sidebar.tsx`: Folder and request tree view
- `TabComponent.tsx`: Tab navigation (Body, Auth, Params, GraphQL, gRPC, Variables, etc.)
- `SmartUrlInput.tsx`: URL input with variable autocomplete
- `GraphQLEditor.tsx`: GraphQL query and variables editor
- `GrpcEditor.tsx`: gRPC service/method selector and message editor
- `VariablesTab.tsx`: Variable management UI
- `SchemaViewer.tsx`: GraphQL schema viewer (introspection)
- `GrpcSchemaViewer.tsx`: gRPC proto schema viewer
- `ThemeToggle.tsx`: Theme switcher button
- `TitleBar.tsx`: Application title bar with window controls

**Authentication Components:**
- `SelectAuth.tsx`: Auth type selector
- `UsernameAndPassword.tsx`: Basic auth inputs
- `BearerToken.tsx`: Bearer token input

**Utility Components:**
- `JsonViewer.tsx`: JSON syntax highlighting and formatting
- `CopyIcon.tsx`: Copy to clipboard button
- `Checkbox.tsx`: Reusable checkbox component
- `Folder.tsx`: Folder item with context menu

### Hooks

Custom React hooks are located in `src/hooks/`.

**Available Hooks:**
- `useToast()`: Toast notification system
- `useKeyboardShortcuts()`: Keyboard shortcut handler
- `useVariableSubstitution()`: Variable substitution logic
- `useBracketAutocompletion()`: Auto-closes `{{` with `}}`
- `useCurlGenerator()`: Generates cURL commands from requests
- `useIntrospection()`: GraphQL introspection query execution
- `useLatestRelease()`: Checks for application updates

## Backend Architecture

### Modules

The backend is organized into modular Rust crates under `src-tauri/src/`.

#### HTTP Module (`src-tauri/src/http/`)

**Files:**
- `mod.rs`: HTTP and GraphQL Tauri commands
- `tests.rs`: HTTP module tests

**Key Types:**
- `ApiResponse`: Standard response format `{success, data, error}`

**Commands:**
- `plain_request`: Basic HTTP request
- `basic_auth_request`: HTTP request with Basic auth
- `bearer_auth_request`: HTTP request with Bearer token
- `graphql_request`: GraphQL query execution
- `graphql_basic_auth_request`: GraphQL with Basic auth
- `graphql_bearer_auth_request`: GraphQL with Bearer token
- `graphql_introspection`: GraphQL schema introspection
- `graphql_introspection_with_auth`: Introspection with authentication

#### GraphQL Module (`src-tauri/src/graphql/`)

**Files:**
- `mod.rs`: GraphQL client implementation
- `queries.rs`: GraphQL introspection query

**Key Types:**
- `GraphQLRequest`: Query + variables wrapper
- `GraphQLClient`: HTTP-based GraphQL client

**Functionality:**
- GraphQL request execution
- Introspection query support
- Authentication integration

#### gRPC Module (`src-tauri/src/grpc/`)

**Files:**
- `mod.rs`: gRPC types and utilities
- `commands.rs`: Tauri commands for gRPC
- `client.rs`: gRPC client implementation
- `reflection.rs`: gRPC server reflection client
- `proto_parser.rs`: Proto file parser
- `streaming.rs`: Streaming RPC handlers
- `test_utils.rs`: Testing utilities

**Key Types:**
- `GrpcRequest`: Service, method, message, metadata
- `GrpcResponse`: Success, data, error, status
- `ProtoSchema`: Services and messages schema
- `GrpcCallType`: Unary, ServerStreaming, ClientStreaming, Bidirectional

**Commands:**
- `grpc_unary_request`: Unary RPC call
- `grpc_server_streaming_request`: Server streaming RPC
- `grpc_discover_services`: Discover services via reflection
- `grpc_parse_proto_file`: Parse proto file content
- `grpc_get_service_info`: Get service details
- `grpc_get_method_info`: Get method details
- `grpc_test_connection`: Test gRPC server connectivity

#### Auth Module (`src-tauri/src/auth/mod.rs`)

**Key Types:**
- `AuthType`: Enum for None, Basic, Bearer authentication
- Methods: `apply_to_request()` adds auth headers to requests

#### Client Module (`src-tauri/src/client/mod.rs`)

**Key Types:**
- `HttpClient`: Wrapper around `reqwest::Client`

**Functionality:**
- Request building and execution
- Response parsing
- Error handling

#### Error Module (`src-tauri/src/error/mod.rs`)

**Key Types:**
- `AppError`: Application error types
- `AppResult<T>`: Result type alias

### Tauri Commands

All commands are registered in `src-tauri/src/main.rs`:

```rust
.invoke_handler(tauri::generate_handler![
    http::plain_request,
    http::basic_auth_request,
    http::bearer_auth_request,
    http::graphql_request,
    http::graphql_basic_auth_request,
    http::graphql_introspection,
    http::graphql_introspection_with_auth,
    grpc::commands::grpc_unary_request,
    grpc::commands::grpc_server_streaming_request,
    grpc::commands::grpc_discover_services,
    grpc::commands::grpc_parse_proto_file,
    grpc::commands::grpc_get_service_info,
    grpc::commands::grpc_get_method_info,
    grpc::commands::grpc_test_connection,
])
```

**Command Convention:**
- All commands use `#[tauri::command]` attribute
- Return type: `Result<T, String>`
- Error handling: Errors converted to `String` or wrapped in `ApiResponse`

## Data Flow

### Request Execution Flow

```
1. User Input (UI)
   └─> RequestContext state update

2. Variable Substitution
   └─> VariablesContext.replaceVariablesInUrl()
   └─> Replaces {{var}} with actual values

3. Request Validation
   └─> JSON parsing (if applicable)
   └─> URL validation

4. Tauri Command Invocation
   └─> RequestContext.handleRequest()
   └─> invoke(commandName, params)

5. Rust Backend Processing
   └─> HTTP/GraphQL/gRPC client execution
   └─> Authentication application
   └─> External API call

6. Response Handling
   └─> Parse response
   └─> Calculate response time
   └─> Extract status code

7. UI Update
   └─> RequestContext state update
   └─> ResponseView renders result
```

### Storage Flow

```
1. User creates/modifies request
   └─> RequestContext state update

2. Auto-save trigger (useEffect)
   └─> FileContext.saveCurrentRequest()

3. localStorage write
   └─> Key: folderName
   └─> Value: Array<StoredFile>

4. State sync
   └─> FileContext.folders update
```

### Variable Substitution Flow

```
1. User types URL with {{variable}}
   └─> RequestContext.url update

2. Request execution triggered
   └─> VariablesContext.replaceVariablesInUrl(url)

3. Variable lookup
   └─> Filter enabled variables
   └─> Regex match and replace

4. Processed URL passed to backend
   └─> Tauri command receives final URL
```

## Storage Architecture

Solo uses browser localStorage and sessionStorage for data persistence. See [STORAGE_SCHEMA.md](./STORAGE_SCHEMA.md) for detailed schema documentation.

**Key Patterns:**
- **Folders/Collections**: Direct folder name as key
- **Variables**: Prefixed with `solo-variables-`
- **Theme**: Simple key `theme`
- **Current Folder**: sessionStorage key `current-request-folder`

**Storage Filtering:**
- When loading folders, skip keys starting with `solo-variables-`
- When loading variables, use `solo-variables-{folderName}` pattern

## Technology Stack

### Frontend
- **React 18**: UI framework
- **TypeScript**: Type safety
- **Vite**: Build tool and dev server
- **Tailwind CSS 4**: Styling
- **Lucide React**: Icon library
- **@tauri-apps/api**: Tauri bindings

### Backend
- **Rust**: Systems programming language
- **Tauri 2**: Desktop application framework
- **reqwest**: HTTP client library
- **tonic**: gRPC framework
- **serde**: Serialization/deserialization
- **tokio**: Async runtime

### Testing
- **Frontend**: Vitest 3.2.4, React Testing Library, jsdom
- **Backend**: cargo test, tokio-test, httpmock

### Build & Deployment
- **Bun**: Package manager and test runner
- **Vite**: Frontend bundler
- **Tauri CLI**: Application packaging
- **Platform-specific bundlers**: DMG (macOS), AppImage (Linux), MSI (Windows)

## Development Patterns

### Adding a New Request Type

1. Add type to `RequestType` union in `src/context/RequestContext.tsx`
2. Add corresponding tab to `Tab` union
3. Implement Rust command in appropriate module under `src-tauri/src/`
4. Add command invocation in `RequestContext.handleRequest()`
5. Update `FileContext` to handle new request type in `createNewRequest()` and `saveRequest()`
6. Register command in `src-tauri/src/main.rs`

### Variable Naming Conventions

- **React Components**: PascalCase (e.g., `RequestForm.tsx`)
- **Hooks**: camelCase with `use` prefix (e.g., `useToast.tsx`)
- **Context**: PascalCase with `Context` suffix (e.g., `FileContext.tsx`)
- **Rust Modules**: snake_case (e.g., `proto_parser.rs`)
- **Tauri Commands**: snake_case (e.g., `plain_request`)

### Error Handling

**Frontend:**
- Use `try/catch` for async operations
- Display errors via `useToast()` hook
- Set `error` state in RequestContext

**Backend:**
- Use `Result<T, AppError>` for internal functions
- Convert to `Result<ApiResponse, String>` for Tauri commands
- Wrap errors in `ApiResponse` for consistent frontend handling
