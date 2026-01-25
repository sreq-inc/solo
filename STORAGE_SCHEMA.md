# Storage Schema Documentation

This document defines all storage keys, data structures, and patterns used by Solo for data persistence.

## Table of Contents

- [Overview](#overview)
- [localStorage Schema](#localstorage-schema)
  - [Folders/Collections](#folderscollections)
  - [Variables](#variables)
  - [Theme](#theme)
- [sessionStorage Schema](#sessionstorage-schema)
- [TypeScript Type Definitions](#typescript-type-definitions)
- [Storage Patterns](#storage-patterns)
- [Data Migration](#data-migration)
- [Example Data](#example-data)

## Overview

Solo uses the browser's Web Storage API for data persistence:

- **localStorage**: Persistent storage for folders, requests, variables, and theme
- **sessionStorage**: Temporary storage for current folder tracking

**Storage Quota:**
- localStorage: Typically 5-10MB per origin
- sessionStorage: Similar quota, cleared when tab/window closes

**Data Format:** All data is stored as JSON strings and parsed when retrieved.

## localStorage Schema

### Folders/Collections

Each folder is stored with the folder name as the key.

**Key Pattern:** `{folderName}`

**Value Type:** `Array<StoredFile>`

**Type Definition:**
```typescript
type StoredFile = {
  fileName: string;           // Unique identifier (e.g., "request_1234567890")
  fileData: RequestData;      // Request configuration
  displayName?: string;       // Human-readable name (e.g., "Get Users")
};

type RequestData = {
  method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  url: string;
  payload?: string;          // JSON string
  response?: unknown;        // Last response data
  useBasicAuth?: boolean;
  username?: string;
  password?: string;
  bearerToken?: string;
  activeTab?: "body" | "auth" | "params" | "graphql" | "grpc" | "proto" | "variables" | "description" | "schema";
  queryParams?: QueryParam[];
  requestType?: "http" | "graphql" | "grpc";
  graphqlQuery?: string;
  graphqlVariables?: string;  // JSON string
  grpcService?: string;
  grpcMethod?: string;
  grpcMessage?: string;       // JSON string
  grpcCallType?: "unary" | "server_streaming" | "client_streaming" | "bidirectional";
  protoContent?: string;
  description?: string;
};

type QueryParam = {
  key: string;
  value: string;
  enabled: boolean;
};
```

**Example Key:** `"Work Projects"`

**Example Value:**
```json
[
  {
    "fileName": "request_1704459600000",
    "displayName": "Get Users",
    "fileData": {
      "method": "GET",
      "url": "https://api.example.com/users",
      "payload": "",
      "useBasicAuth": false,
      "activeTab": "body",
      "bearerToken": "",
      "queryParams": [
        { "key": "limit", "value": "10", "enabled": true },
        { "key": "offset", "value": "0", "enabled": true }
      ],
      "requestType": "http",
      "description": "Fetches a paginated list of users"
    }
  },
  {
    "fileName": "request_1704460000000",
    "displayName": "Create User",
    "fileData": {
      "method": "POST",
      "url": "https://api.example.com/users",
      "payload": "{\n  \"name\": \"John Doe\",\n  \"email\": \"john@example.com\"\n}",
      "useBasicAuth": false,
      "activeTab": "body",
      "bearerToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "queryParams": [{ "key": "", "value": "", "enabled": true }],
      "requestType": "http",
      "description": "Creates a new user account"
    }
  }
]
```

**Notes:**
- Each folder name must be unique
- `fileName` is generated using `request_${Date.now()}`
- `displayName` defaults to request type if not provided
- All optional fields may be omitted

### Variables

Variables are stored per folder with a prefixed key pattern.

**Key Pattern:** `solo-variables-{folderName}`

**Value Type:** `Array<Variable>`

**Type Definition:**
```typescript
type Variable = {
  key: string;      // Variable name (without braces)
  value: string;    // Variable value
  enabled: boolean; // Whether to use this variable
};
```

**Example Key:** `"solo-variables-Work Projects"`

**Example Value:**
```json
[
  {
    "key": "baseUrl",
    "value": "https://api.staging.example.com",
    "enabled": true
  },
  {
    "key": "apiKey",
    "value": "sk_test_1234567890",
    "enabled": true
  },
  {
    "key": "version",
    "value": "v2",
    "enabled": false
  }
]
```

**Usage in Requests:**
```
URL: {{baseUrl}}/{{version}}/users
Result: https://api.staging.example.com/v2/users (if version is enabled)
```

**Notes:**
- Variables are scoped to folders
- Disabled variables are not replaced
- Variable keys are case-sensitive
- Supports whitespace inside braces: `{{ baseUrl }}` is valid

### Theme

Theme preference is stored with a simple key.

**Key:** `"theme"`

**Value Type:** `"light" | "dark"`

**Example Value:**
```json
"dark"
```

**Default Behavior:**
- If no theme is stored, detects system preference via `window.matchMedia("(prefers-color-scheme: dark)")`
- Falls back to `"light"` if system preference unavailable

## sessionStorage Schema

### Current Folder

Tracks the currently active folder for variable loading.

**Key:** `"current-request-folder"`

**Value Type:** `string` (folder name)

**Example Value:**
```json
"Work Projects"
```

**Usage:**
- Set when a folder is selected or a request is opened
- Used to restore variable context on page refresh
- Cleared when session ends (tab/window close)

**Notes:**
- This is the only sessionStorage key used by Solo
- Helps maintain context between page reloads during development

## TypeScript Type Definitions

Complete type definitions for reference:

```typescript
// FileContext types
type RequestData = {
  method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  url: string;
  payload?: string;
  response?: unknown;
  useBasicAuth?: boolean;
  username?: string;
  password?: string;
  bearerToken?: string;
  activeTab?: "body" | "auth" | "params" | "graphql" | "grpc" | "proto" | "variables" | "description" | "schema";
  queryParams?: QueryParam[];
  requestType?: "http" | "graphql" | "grpc";
  graphqlQuery?: string;
  graphqlVariables?: string;
  grpcService?: string;
  grpcMethod?: string;
  grpcMessage?: string;
  grpcCallType?: "unary" | "server_streaming" | "client_streaming" | "bidirectional";
  protoContent?: string;
  description?: string;
};

type StoredFile = {
  fileName: string;
  fileData: RequestData;
  displayName?: string;
};

type QueryParam = {
  key: string;
  value: string;
  enabled: boolean;
};

// VariablesContext types
type Variable = {
  key: string;
  value: string;
  enabled: boolean;
};

// ThemeContext types
type Theme = "light" | "dark";
```

## Storage Patterns

### Pattern 1: Folder Detection

When loading folders, skip variable storage keys:

```typescript
const loadAllFolders = () => {
  const loadedFolders: FolderStructure = {};

  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);

    // Skip variable keys and other non-folder keys
    if (key && !key.startsWith("solo-variables-") && key !== "theme") {
      try {
        const files = JSON.parse(localStorage.getItem(key) || "[]") as StoredFile[];
        loadedFolders[key] = files.map(file => file.fileName);
      } catch {
        continue; // Skip invalid JSON
      }
    }
  }

  return loadedFolders;
};
```

### Pattern 2: Variable Storage Key Generation

Always use the helper function for consistency:

```typescript
const getVariablesStorageKey = (folderName: string) => {
  return `solo-variables-${folderName}`;
};

// Usage
const storageKey = getVariablesStorageKey("My Folder");
// Result: "solo-variables-My Folder"
```

### Pattern 3: Folder Renaming

When renaming a folder, migrate both folder and variable data:

```typescript
const renameFolder = (oldName: string, newName: string) => {
  // 1. Get old data
  const oldFolderData = localStorage.getItem(oldName);
  const oldVariablesData = localStorage.getItem(`solo-variables-${oldName}`);

  // 2. Write to new keys
  if (oldFolderData) {
    localStorage.setItem(newName, oldFolderData);
  }
  if (oldVariablesData) {
    localStorage.setItem(`solo-variables-${newName}`, oldVariablesData);
  }

  // 3. Clean up old keys
  localStorage.removeItem(oldName);
  localStorage.removeItem(`solo-variables-${oldName}`);
};
```

### Pattern 4: Folder Deletion

Remove both folder and variable storage:

```typescript
const removeFolder = (folder: string) => {
  localStorage.removeItem(folder);
  localStorage.removeItem(`solo-variables-${folder}`);
};
```

### Pattern 5: Auto-Save on Change

Use React useEffect to auto-save when request fields change:

```typescript
useEffect(() => {
  if (currentRequestId && currentFolder) {
    saveCurrentRequest();
  }
}, [method, url, payload, /* ...other fields */]);
```

## Data Migration

### Backwards Compatibility

**Current Version:** No versioning system implemented yet

**Future Considerations:**
- Add a `solo-schema-version` key to track storage schema version
- Implement migration functions for breaking changes
- Consider adding a `migrated` flag to each folder/request

**Example Migration Pattern:**
```typescript
const CURRENT_SCHEMA_VERSION = 1;

const migrateStorage = () => {
  const storedVersion = parseInt(localStorage.getItem("solo-schema-version") || "0");

  if (storedVersion < CURRENT_SCHEMA_VERSION) {
    // Run migrations
    if (storedVersion === 0) {
      // Migrate from v0 to v1
      migrateV0ToV1();
    }

    localStorage.setItem("solo-schema-version", CURRENT_SCHEMA_VERSION.toString());
  }
};
```

### Breaking Changes to Avoid

1. **Never change key patterns** without migration
2. **Never remove required fields** from types
3. **Always make new fields optional** for backwards compatibility
4. **Always validate JSON** before parsing to prevent crashes

## Example Data

### Complete localStorage Example

```javascript
// Folder: "Personal Projects"
localStorage.setItem("Personal Projects", JSON.stringify([
  {
    "fileName": "request_1704459600000",
    "displayName": "GitHub API - Get User",
    "fileData": {
      "method": "GET",
      "url": "https://api.github.com/users/{{username}}",
      "payload": "",
      "useBasicAuth": false,
      "activeTab": "params",
      "bearerToken": "ghp_1234567890",
      "queryParams": [
        { "key": "per_page", "value": "30", "enabled": true }
      ],
      "requestType": "http",
      "description": "Fetches GitHub user profile"
    }
  }
]));

// Variables for "Personal Projects"
localStorage.setItem("solo-variables-Personal Projects", JSON.stringify([
  {
    "key": "username",
    "value": "octocat",
    "enabled": true
  },
  {
    "key": "repo",
    "value": "hello-world",
    "enabled": true
  }
]));

// Theme
localStorage.setItem("theme", JSON.stringify("dark"));
```

### GraphQL Request Example

```json
{
  "fileName": "request_1704460000000",
  "displayName": "GraphQL - Get Posts",
  "fileData": {
    "method": "POST",
    "url": "https://api.example.com/graphql",
    "payload": "",
    "useBasicAuth": false,
    "activeTab": "graphql",
    "bearerToken": "",
    "queryParams": [{ "key": "", "value": "", "enabled": true }],
    "requestType": "graphql",
    "graphqlQuery": "query GetPosts($limit: Int!) {\n  posts(limit: $limit) {\n    id\n    title\n    author {\n      name\n    }\n  }\n}",
    "graphqlVariables": "{\n  \"limit\": 10\n}",
    "description": "Fetches posts with author information"
  }
}
```

### gRPC Request Example

```json
{
  "fileName": "request_1704470000000",
  "displayName": "gRPC - List Users",
  "fileData": {
    "method": "POST",
    "url": "localhost:50051",
    "payload": "",
    "useBasicAuth": false,
    "activeTab": "grpc",
    "bearerToken": "",
    "queryParams": [{ "key": "", "value": "", "enabled": true }],
    "requestType": "grpc",
    "grpcService": "UserService",
    "grpcMethod": "ListUsers",
    "grpcMessage": "{\n  \"page\": 1,\n  \"pageSize\": 20\n}",
    "grpcCallType": "unary",
    "protoContent": "syntax = \"proto3\";\n\nservice UserService {\n  rpc ListUsers(ListUsersRequest) returns (ListUsersResponse);\n}\n\nmessage ListUsersRequest {\n  int32 page = 1;\n  int32 pageSize = 2;\n}\n\nmessage ListUsersResponse {\n  repeated User users = 1;\n}\n\nmessage User {\n  string id = 1;\n  string name = 2;\n  string email = 3;\n}",
    "description": "Lists users with pagination"
  }
}
```

## Storage Best Practices

### 1. Always Validate JSON

```typescript
try {
  const data = JSON.parse(localStorage.getItem(key) || "[]");
} catch (error) {
  console.error("Invalid JSON in storage:", error);
  // Fallback to default
  return [];
}
```

### 2. Use Type Guards

```typescript
const isStoredFile = (obj: any): obj is StoredFile => {
  return obj && typeof obj.fileName === "string" && typeof obj.fileData === "object";
};
```

### 3. Handle Missing Keys Gracefully

```typescript
const files = JSON.parse(localStorage.getItem(folderName) || "[]") as StoredFile[];
```

### 4. Debounce Auto-Save

While not currently implemented, consider debouncing auto-save to reduce write frequency:

```typescript
const debouncedSave = useDebounce(saveCurrentRequest, 500);
```

### 5. Monitor Storage Quota

```typescript
if ('storage' in navigator && 'estimate' in navigator.storage) {
  navigator.storage.estimate().then(estimate => {
    const percentUsed = (estimate.usage / estimate.quota) * 100;
    if (percentUsed > 90) {
      console.warn("Storage quota nearly full!");
    }
  });
}
```

## Troubleshooting

### Issue: Variables not loading

**Check:**
1. Verify key format: `solo-variables-{folderName}` (exact match)
2. Check JSON validity in localStorage
3. Ensure folder name matches exactly (case-sensitive)
4. Verify `current-request-folder` in sessionStorage

### Issue: Folder not appearing

**Check:**
1. Ensure key doesn't start with `solo-variables-`
2. Verify JSON is valid array of `StoredFile` objects
3. Check for hidden characters in folder name
4. Ensure folder name is not empty string

### Issue: Auto-save not working

**Check:**
1. Verify `currentRequestId` and `currentFolder` are set
2. Check useEffect dependencies include all request fields
3. Ensure no console errors during save
4. Verify localStorage is not disabled in browser

### Issue: Theme not persisting

**Check:**
1. Verify key is exactly `"theme"`
2. Check value is `"light"` or `"dark"` (with quotes in JSON)
3. Ensure localStorage write succeeded
4. Check browser privacy settings allow localStorage
