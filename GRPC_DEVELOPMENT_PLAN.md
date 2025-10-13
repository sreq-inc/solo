# 🦀 Plano Completo: Desenvolvimento e Teste gRPC no Solo

**Versão**: 2.0
**Data**: Outubro 2025
**Status**: 📋 Planejamento
**Escopo**: Ambiente completo de desenvolvimento, teste e demonstração gRPC

---

## 📊 Visão Geral

Este plano descreve como criar um **ambiente completo** para:

1. ✅ Desenvolver e debugar features gRPC do Solo
2. ✅ Testar manualmente o Solo como cliente gRPC (tipo Postman)
3. ✅ Garantir qualidade com testes automatizados do backend Rust
4. ✅ Demonstrar todas as capacidades gRPC do Solo

---

## 🏗️ Arquitetura da Solução

```
┌─────────────────────────────────────────────────────────────┐
│                     AMBIENTE COMPLETO                        │
└─────────────────────────────────────────────────────────────┘

┌──────────────────┐         ┌──────────────────┐
│   Solo Client    │◄───────►│  Test Server     │
│   (Tauri App)    │  gRPC   │  (Rust/Tonic)    │
│                  │         │                  │
│  ┌────────────┐  │         │  ┌────────────┐  │
│  │  Frontend  │  │         │  │  Services  │  │
│  │   React    │  │         │  │   - User   │  │
│  │  gRPC UI   │  │         │  │   - Auth   │  │
│  └──────┬─────┘  │         │  │   - Stream │  │
│         │        │         │  │   - Reflect│  │
│  ┌──────▼─────┐  │         │  └────────────┘  │
│  │  Backend   │  │         │                  │
│  │   Rust     │  │         │  ┌────────────┐  │
│  │ gRPC Client│  │         │  │  Mock DB   │  │
│  └────────────┘  │         │  └────────────┘  │
└──────────────────┘         └──────────────────┘
                                      │
                                      ▼
                              ┌───────────────┐
                              │    Docker     │
                              │  Container    │
                              └───────────────┘

┌──────────────────────────────────────────────┐
│         Testes Automatizados (Rust)          │
│  - Unit Tests (cada módulo gRPC)             │
│  - Integration Tests (com test server)       │
└──────────────────────────────────────────────┘
```

---

## 📦 Parte 1: Servidor gRPC de Teste em Rust

### 1.1 Estrutura do Projeto

```
grpc-test-server/  (workspace separado do Solo)
├── .env.example
├── .gitignore
├── Cargo.toml
├── docker/
│   ├── Dockerfile
│   └── docker-compose.yml
├── proto/
│   ├── user.proto           (CRUD de usuários)
│   ├── auth.proto           (Autenticação)
│   ├── streaming.proto      (Todos os tipos de streaming)
│   ├── reflection.proto     (Server reflection)
│   └── common.proto         (Tipos comuns)
├── src/
│   ├── main.rs              (Bootstrap do servidor)
│   ├── config.rs            (Configurações)
│   ├── error.rs             (Error handling)
│   ├── interceptors/
│   │   ├── mod.rs
│   │   ├── auth.rs          (Validação de Bearer token)
│   │   └── logging.rs       (Request/response logging)
│   ├── services/
│   │   ├── mod.rs
│   │   ├── user.rs          (UserService implementation)
│   │   ├── auth.rs          (AuthService implementation)
│   │   ├── streaming.rs     (StreamingService implementation)
│   │   └── reflection.rs    (Reflection service)
│   ├── models/
│   │   ├── mod.rs
│   │   ├── user.rs          (User model)
│   │   └── auth.rs          (Auth model)
│   └── db/
│       ├── mod.rs
│       └── mock.rs          (In-memory database)
├── seeds/
│   └── test_data.json       (Dados iniciais para testes)
├── tests/
│   └── integration_tests.rs (Testes do próprio servidor)
└── README.md
```

### 1.2 Proto Files - Especificação Completa

#### **user.proto** - Serviço de Usuários (CRUD)

```protobuf
syntax = "proto3";

package user.v1;

service UserService {
  // Unary calls
  rpc GetUser(GetUserRequest) returns (GetUserResponse);
  rpc CreateUser(CreateUserRequest) returns (CreateUserResponse);
  rpc UpdateUser(UpdateUserRequest) returns (UpdateUserResponse);
  rpc DeleteUser(DeleteUserRequest) returns (DeleteUserResponse);

  // Server streaming
  rpc ListUsers(ListUsersRequest) returns (stream User);
  rpc WatchUser(WatchUserRequest) returns (stream UserEvent);
}

message User {
  string id = 1;
  string name = 2;
  string email = 3;
  string role = 4;
  int64 created_at = 5;
  int64 updated_at = 6;
}

message GetUserRequest { string id = 1; }
message GetUserResponse { User user = 1; }

message CreateUserRequest {
  string name = 1;
  string email = 2;
  string password = 3;
  string role = 4;
}
message CreateUserResponse { User user = 1; }

message UpdateUserRequest {
  string id = 1;
  optional string name = 2;
  optional string email = 3;
  optional string role = 4;
}
message UpdateUserResponse { User user = 1; }

message DeleteUserRequest { string id = 1; }
message DeleteUserResponse { bool success = 1; }

message ListUsersRequest {
  int32 page = 1;
  int32 limit = 2;
  optional string role_filter = 3;
}

message WatchUserRequest { string user_id = 1; }

message UserEvent {
  enum EventType {
    CREATED = 0;
    UPDATED = 1;
    DELETED = 2;
  }
  EventType type = 1;
  User user = 2;
  int64 timestamp = 3;
}
```

#### **auth.proto** - Autenticação e Autorização

```protobuf
syntax = "proto3";

package auth.v1;

service AuthService {
  // Unary calls
  rpc Login(LoginRequest) returns (LoginResponse);
  rpc Logout(LogoutRequest) returns (LogoutResponse);
  rpc ValidateToken(ValidateTokenRequest) returns (ValidateTokenResponse);
  rpc RefreshToken(RefreshTokenRequest) returns (RefreshTokenResponse);
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

message LogoutRequest {
  string token = 1;
}

message LogoutResponse {
  bool success = 1;
}

message ValidateTokenRequest {
  string token = 1;
}

message ValidateTokenResponse {
  bool valid = 1;
  optional User user = 2;
}

message RefreshTokenRequest {
  string refresh_token = 1;
}

message RefreshTokenResponse {
  string access_token = 1;
  int64 expires_in = 2;
}
```

#### **streaming.proto** - Todos os Tipos de Streaming

```protobuf
syntax = "proto3";

package streaming.v1;

service StreamingService {
  // Unary
  rpc Echo(EchoRequest) returns (EchoResponse);

  // Server streaming
  rpc ServerStream(ServerStreamRequest) returns (stream StreamMessage);

  // Client streaming
  rpc ClientStream(stream StreamMessage) returns (ClientStreamResponse);

  // Bidirectional streaming
  rpc BidirectionalStream(stream StreamMessage) returns (stream StreamMessage);

  // Real-world example: Chat
  rpc Chat(stream ChatMessage) returns (stream ChatMessage);
}

message EchoRequest {
  string message = 1;
}

message EchoResponse {
  string message = 1;
  int64 timestamp = 2;
}

message ServerStreamRequest {
  int32 count = 1;
  int32 delay_ms = 2;
}

message StreamMessage {
  string id = 1;
  string content = 2;
  int64 timestamp = 3;
}

message ClientStreamResponse {
  int32 received_count = 1;
  string summary = 2;
}

message ChatMessage {
  string user_id = 1;
  string room_id = 2;
  string content = 3;
  int64 timestamp = 4;
}
```

### 1.3 Implementação do Servidor - Visão Geral

#### **main.rs** - Bootstrap

```rust
// Estrutura (não é código completo, é o plano):

// 1. Carregar configurações (.env)
// 2. Inicializar mock database
// 3. Criar serviços (User, Auth, Streaming)
// 4. Adicionar interceptors (auth, logging)
// 5. Habilitar reflection
// 6. Iniciar servidor Tonic
// 7. Graceful shutdown

// Servidor rodará em: 0.0.0.0:50051
// Health check em: :50052
```

#### **Interceptors**

**Auth Interceptor**:

- Extrair Bearer token do metadata
- Validar token
- Rejeitar requests não autorizados (exceto Login)
- Adicionar user info ao request context

**Logging Interceptor**:

- Log de todas as requests
- Log de responses
- Log de erros
- Timing de chamadas

#### **Mock Database**

Estrutura em memória com:

- HashMap de Users
- HashMap de Tokens
- HashMap de Chat rooms
- Mutex/RwLock para concorrência
- Seed data inicial

**Seed Data**: 10 usuários, 3 tokens válidos, 2 chat rooms

### 1.4 Scenarios de Teste do Servidor

#### **Scenario 1: CRUD Básico**

- ✅ GetUser (existente)
- ✅ GetUser (não existente) → NOT_FOUND
- ✅ CreateUser (sucesso)
- ✅ CreateUser (email duplicado) → ALREADY_EXISTS
- ✅ UpdateUser (sucesso)
- ✅ UpdateUser (não existe) → NOT_FOUND
- ✅ DeleteUser (sucesso)
- ✅ DeleteUser (já deletado) → NOT_FOUND

#### **Scenario 2: Autenticação**

- ✅ Login com credenciais válidas → token
- ✅ Login com credenciais inválidas → UNAUTHENTICATED
- ✅ Request sem token → UNAUTHENTICATED
- ✅ Request com token inválido → PERMISSION_DENIED
- ✅ Request com token expirado → PERMISSION_DENIED
- ✅ Logout → invalidar token

#### **Scenario 3: Server Streaming**

- ✅ ListUsers paginado (10 items)
- ✅ ListUsers com filtro
- ✅ WatchUser (simular eventos)
- ✅ ServerStream com delay configurável

#### **Scenario 4: Client Streaming**

- ✅ ClientStream (enviar 10 mensagens)
- ✅ ClientStream (0 mensagens)
- ✅ ClientStream com erro no meio

#### **Scenario 5: Bidirectional Streaming**

- ✅ BidirectionalStream (echo messages)
- ✅ Chat (múltiplos usuários)
- ✅ Stream cancelado pelo cliente
- ✅ Stream cancelado pelo servidor

#### **Scenario 6: Errors**

- ✅ INVALID_ARGUMENT (dados inválidos)
- ✅ NOT_FOUND (recurso não existe)
- ✅ ALREADY_EXISTS (duplicado)
- ✅ PERMISSION_DENIED (sem permissão)
- ✅ UNAUTHENTICATED (sem autenticação)
- ✅ INTERNAL (erro do servidor)
- ✅ UNAVAILABLE (servidor sobrecarregado)

### 1.5 Docker Configuration

#### **Dockerfile**

```dockerfile
# Plano do Dockerfile:

# Stage 1: Builder
# - FROM rust:1.87 como base
# - Instalar protobuf-compiler
# - Copiar Cargo.toml e src/
# - cargo build --release

# Stage 2: Runtime
# - FROM debian:bookworm-slim
# - Instalar dependências runtime
# - Copiar binário do stage anterior
# - EXPOSE 50051 (gRPC) 50052 (health)
# - CMD ["./grpc-test-server"]
```

#### **docker-compose.yml**

```yaml
# Plano do docker-compose:

services:
  grpc-server:
    build: .
    ports:
      - "50051:50051" # gRPC
      - "50052:50052" # Health check
    environment:
      - RUST_LOG=debug
      - SERVER_HOST=0.0.0.0
      - SERVER_PORT=50051
    volumes:
      - ./seeds:/app/seeds # Seed data
    healthcheck:
      test: ["CMD", "grpcurl", "-plaintext", "localhost:50051", "list"]
      interval: 10s
      timeout: 5s
      retries: 3
```

### 1.6 Dependências do Servidor

```toml
# Cargo.toml (plano):

[dependencies]
tonic = "0.10"
tonic-reflection = "0.10"
prost = "0.12"
prost-types = "0.12"
tokio = { version = "1", features = ["full"] }
tower = "0.4"
tower-http = "0.5"
serde = { version = "1", features = ["derive"] }
serde_json = "1"
uuid = { version = "1", features = ["v4"] }
chrono = "0.4"
jsonwebtoken = "9"
bcrypt = "0.15"
tracing = "0.1"
tracing-subscriber = "0.3"
dotenv = "0.15"

[build-dependencies]
tonic-build = "0.10"
```

### 1.7 Comandos para Uso

```bash
# Desenvolvimento local
cargo run

# Docker
docker-compose up --build

# Testes do servidor
cargo test

# Verificar serviços disponíveis (grpcurl)
grpcurl -plaintext localhost:50051 list

# Testar endpoint
grpcurl -plaintext -d '{"id":"user1"}' \
  localhost:50051 user.v1.UserService/GetUser
```

---

## 🔄 Parte 2: Fluxo de Dados e Arquitetura

### 2.1 Fluxo Completo: Request gRPC Unary

```
┌──────────────────────────────────────────────────────────────────┐
│ 1. USUÁRIO INTERAGE COM UI                                       │
└──────────────────────────────────────────────────────────────────┘
    │
    │ Preenche formulário:
    │ - URL: grpc://localhost:50051
    │ - Service: UserService
    │ - Method: GetUser
    │ - Message: {"id": "user1"}
    │ - Auth: Bearer token123
    │
    ▼
┌──────────────────────────────────────────────────────────────────┐
│ 2. FRONTEND (React - GrpcEditor.tsx)                             │
└──────────────────────────────────────────────────────────────────┘
    │
    │ Coleta dados do formulário
    │ Monta objeto para Tauri command
    │
    ▼
    invoke("grpc_unary_request", {
      url: "grpc://localhost:50051",
      service: "UserService",
      method: "GetUser",
      message: {"id": "user1"},
      metadata: {"authorization": "Bearer token123"}
    })
    │
    ▼
┌──────────────────────────────────────────────────────────────────┐
│ 3. TAURI IPC BRIDGE                                              │
└──────────────────────────────────────────────────────────────────┘
    │
    │ Serializa JSON → Rust
    │ Invoca comando registrado
    │
    ▼
┌──────────────────────────────────────────────────────────────────┐
│ 4. BACKEND RUST (commands.rs)                                    │
└──────────────────────────────────────────────────────────────────┘
    │
    │ #[command]
    │ async fn grpc_unary_request(...)
    │
    ▼
    Cria GrpcRequest struct
    │
    ▼
┌──────────────────────────────────────────────────────────────────┐
│ 5. GRPC CLIENT (client.rs)                                       │
└──────────────────────────────────────────────────────────────────┘
    │
    │ GrpcClient::new(url) → Cria conexão
    │ client.execute(request)
    │
    ▼
    • Parse URL
    • Criar Channel (tonic)
    • Converter message JSON → Bytes (prost)
    • Adicionar metadata ao Request
    │
    ▼
┌──────────────────────────────────────────────────────────────────┐
│ 6. TONIC TRANSPORT LAYER                                         │
└──────────────────────────────────────────────────────────────────┘
    │
    │ HTTP/2 Connection
    │ Protobuf serialization
    │ TLS (se configurado)
    │
    ▼
    ═══════════════════════════════════════════════════════════════
                        NETWORK (gRPC/HTTP2)
    ═══════════════════════════════════════════════════════════════
    │
    ▼
┌──────────────────────────────────────────────────────────────────┐
│ 7. TEST SERVER (Tonic Server)                                    │
└──────────────────────────────────────────────────────────────────┘
    │
    │ Recebe request
    │ Passa por interceptors
    │
    ▼
┌──────────────────────────────────────────────────────────────────┐
│ 8. INTERCEPTORS                                                  │
└──────────────────────────────────────────────────────────────────┘
    │
    ▼ Auth Interceptor
    • Extrai Bearer token do metadata
    • Valida token
    • Adiciona user_id ao context
    │
    ▼ Logging Interceptor
    • Log da request
    • Timing start
    │
    ▼
┌──────────────────────────────────────────────────────────────────┐
│ 9. SERVICE IMPLEMENTATION (user.rs)                              │
└──────────────────────────────────────────────────────────────────┘
    │
    │ async fn get_user(request)
    │
    ▼
    • Extrai user_id da request
    • Busca no mock database
    • Retorna User ou Erro
    │
    ▼
┌──────────────────────────────────────────────────────────────────┐
│ 10. MOCK DATABASE (mock.rs)                                      │
└──────────────────────────────────────────────────────────────────┘
    │
    │ HashMap lookup
    │ users.get("user1")
    │
    ▼
    Retorna: User { id, name, email, ... }
    │
    ▼
    [RESPOSTA SOBE A STACK]
    │
    ▼
┌──────────────────────────────────────────────────────────────────┐
│ 11. RESPONSE PROCESSAMENTO                                       │
└──────────────────────────────────────────────────────────────────┘
    │
    │ Service retorna GetUserResponse
    │ Interceptors (logging: timing end)
    │ Serializa para Protobuf
    │ Envia via HTTP/2
    │
    ▼
    ═══════════════════════════════════════════════════════════════
                        NETWORK (gRPC/HTTP2)
    ═══════════════════════════════════════════════════════════════
    │
    ▼
┌──────────────────────────────────────────────────────────────────┐
│ 12. TONIC CLIENT (client.rs)                                     │
└──────────────────────────────────────────────────────────────────┘
    │
    │ Recebe response bytes
    │ Deserializa Protobuf → JSON
    │ Cria GrpcResponse struct
    │
    ▼
┌──────────────────────────────────────────────────────────────────┐
│ 13. COMMAND HANDLER (commands.rs)                                │
└──────────────────────────────────────────────────────────────────┘
    │
    │ Converte GrpcResponse → ApiResponse
    │ Serializa para JSON
    │
    ▼
┌──────────────────────────────────────────────────────────────────┐
│ 14. TAURI IPC BRIDGE                                             │
└──────────────────────────────────────────────────────────────────┘
    │
    │ Retorna JSON ao frontend
    │
    ▼
┌──────────────────────────────────────────────────────────────────┐
│ 15. FRONTEND (React)                                             │
└──────────────────────────────────────────────────────────────────┘
    │
    │ Recebe resposta do invoke()
    │ Atualiza state
    │ Renderiza na UI
    │
    ▼
┌──────────────────────────────────────────────────────────────────┐
│ 16. USUÁRIO VÊ RESULTADO                                         │
└──────────────────────────────────────────────────────────────────┘
    Response:
    {
      "success": true,
      "data": {
        "user": {
          "id": "user1",
          "name": "John Doe",
          "email": "john@example.com",
          ...
        }
      }
    }
```

### 2.2 Fluxo: Server Streaming

```
[Frontend] → [Tauri Command] → [gRPC Client]
                                      │
                                      ▼
                              Inicia stream
                                      │
     ┌────────────────────────────────┘
     │
     ▼ [Test Server retorna stream]
     │
     ├─► Message 1 → [Client] → [Command] → [Frontend] → Renderiza
     │
     ├─► Message 2 → [Client] → [Command] → [Frontend] → Renderiza
     │
     ├─► Message 3 → [Client] → [Command] → [Frontend] → Renderiza
     │
     └─► Stream END → [Client] → [Command] → [Frontend] → Completo
```

**Desafio**: Como mostrar mensagens conforme chegam no frontend?

**Opções**:

1. Coletar todas e retornar no final (simples, mas não real-time)
2. WebSocket/eventos do Tauri (complexo, mas real-time)
3. Polling de status (intermediário)

### 2.3 Como Funciona Proto Parsing

```
┌────────────────────────────────────────────────────────────┐
│ PROTO FILE (string)                                        │
└────────────────────────────────────────────────────────────┘
    │
    │ syntax = "proto3";
    │ service UserService {
    │   rpc GetUser(GetUserRequest) returns (GetUserResponse);
    │ }
    │ message GetUserRequest { string id = 1; }
    │
    ▼
┌────────────────────────────────────────────────────────────┐
│ PROTO PARSER (proto_parser.rs)                            │
└────────────────────────────────────────────────────────────┘
    │
    │ Parsing manual com regex/string matching
    │ (Nota: Não usa protoc, é parsing "lite")
    │
    ▼
┌────────────────────────────────────────────────────────────┐
│ EXTRAIR INFORMAÇÕES                                        │
└────────────────────────────────────────────────────────────┘
    │
    ├─► Services
    │   └─► Service name: "UserService"
    │       └─► Methods: ["GetUser", "CreateUser", ...]
    │           ├─► Input type: "GetUserRequest"
    │           ├─► Output type: "GetUserResponse"
    │           ├─► is_client_streaming: false
    │           └─► is_server_streaming: false
    │
    └─► Messages
        └─► Message name: "GetUserRequest"
            └─► Fields
                └─► name: "id", type: "string", number: 1
    │
    ▼
┌────────────────────────────────────────────────────────────┐
│ PROTO SCHEMA (struct)                                      │
└────────────────────────────────────────────────────────────┘
    {
      services: [
        {
          name: "UserService",
          methods: [
            {
              name: "GetUser",
              input_type: "GetUserRequest",
              output_type: "GetUserResponse",
              is_client_streaming: false,
              is_server_streaming: false
            }
          ]
        }
      ],
      messages: [...]
    }
    │
    ▼
┌────────────────────────────────────────────────────────────┐
│ FRONTEND (populate dropdowns)                              │
└────────────────────────────────────────────────────────────┘
    Service Dropdown: [UserService, AuthService, ...]
    Method Dropdown: [GetUser, CreateUser, ...]
```

### 2.4 Como Funciona Metadata (Auth)

```
Frontend:
  metadata: { "authorization": "Bearer token123" }
    │
    ▼
Backend (commands.rs):
  metadata: Option<HashMap<String, String>>
    │
    ▼
Client (client.rs):
  create_tonic_request(message, metadata)
    │
    ▼
  for (key, value) in metadata {
    request.metadata_mut().insert(key, value);
  }
    │
    ▼
Tonic Transport:
  HTTP/2 headers:
    :method: POST
    :path: /user.v1.UserService/GetUser
    authorization: Bearer token123  ◄── Aqui!
    content-type: application/grpc
    │
    ▼
Test Server:
  Interceptor extrai metadata:
    let token = request.metadata()
      .get("authorization")
      .and_then(|v| v.to_str().ok());

    if let Some(token) = token {
      validate_token(token)?;
    }
```

### 2.5 Como Funciona Streaming (Detalhes Técnicos)

#### **Server Streaming**

```rust
// Test Server (user.rs)
async fn list_users(
    request: Request<ListUsersRequest>,
) -> Result<Response<impl Stream<Item = Result<User, Status>>>, Status> {
    let users = get_users_from_db();

    // Cria um stream
    let stream = tokio_stream::iter(users)
        .map(|user| Ok(user));

    Ok(Response::new(Box::pin(stream)))
}

// Solo Client (streaming.rs)
let mut stream = client.list_users(request).await?.into_inner();

while let Some(user) = stream.message().await? {
    // Processar cada user
    // Como enviar ao frontend em real-time?
}
```

#### **Client Streaming**

```rust
// Solo Client (streaming.rs)
let messages = vec![msg1, msg2, msg3];
let stream = tokio_stream::iter(messages);

let response = client.client_stream(stream).await?;
// Recebe uma resposta única no final
```

#### **Bidirectional Streaming**

```rust
// Solo Client (streaming.rs)
let (tx, rx) = mpsc::channel(10);

// Task 1: Enviar mensagens
tokio::spawn(async move {
    tx.send(message1).await;
    tx.send(message2).await;
});

// Task 2: Receber mensagens
let mut stream = client.bidirectional_stream(rx).await?;
while let Some(response) = stream.message().await? {
    // Processar resposta
}
```

---

## 🎨 Parte 3: Análise da Interface Atual (GrpcEditor.tsx)

### 3.1 Funcionalidades Existentes ✅

1. **Proto File Input**
   - ✅ Textarea para colar proto file
   - ✅ Botão "Parse Proto"
   - ✅ Botão "Discover Services" (placeholder)

2. **Service/Method Selection**
   - ✅ Dropdown de serviços (após parsing)
   - ✅ Dropdown de métodos (filtrado por serviço)
   - ✅ Auto-select primeiro método

3. **Call Type Selection**
   - ✅ Radio buttons para 4 tipos
   - ✅ Descrição de cada tipo
   - ✅ Visual feedback (border/background)

4. **Message Editor**
   - ✅ Textarea JSON
   - ✅ Botão "Format JSON"
   - ✅ Placeholder exemplo

5. **Method Info Display**
   - ✅ Input/Output types
   - ✅ Streaming indicators
   - ✅ Card visual

### 3.2 Gaps Identificados ⚠️

#### **Gap 1: Feedback de Parsing**

**Problema**: Não mostra erros de parsing ao usuário
**Impacto**: Usuário não sabe por que parsing falhou
**Solução Proposta**:

- Toast/Alert com erro detalhado
- Highlight da linha com erro (se possível)
- Sugestões de correção

#### **Gap 2: Reflection não funcional**

**Problema**: Botão "Discover Services" não implementado
**Impacto**: Usuário precisa ter proto file sempre
**Solução Proposta**:

- Implementar grpc_discover_services
- Mostrar loading state
- Popular serviços automaticamente

#### **Gap 3: Streaming não tem UI especial**

**Problema**: Streaming usa mesma UI que unary
**Impacto**: Não fica claro que é streaming, não mostra mensagens incrementais
**Solução Proposta**:

- Badge "STREAMING" visível
- Para server streaming: Lista de mensagens recebidas
- Para client streaming: UI para enviar múltiplas mensagens
- Para bidirectional: Chat-like interface

#### **Gap 4: Metadados Limitados**

**Problema**: Só suporta auth, não custom headers
**Impacto**: Não testa metadados customizados
**Solução Proposta**:

- Tab "Metadata" com key-value editor
- Presets (auth, correlation-id, etc)
- Validação de nomes (lowercase, ASCII)

#### **Gap 5: Sem Schema Viewer**

**Problema**: Não mostra estrutura das mensagens
**Impacto**: Usuário precisa ler proto file manualmente
**Solução Proposta**:

- Tab "Schema" mostrando campos
- Tree view de mensagens aninhadas
- Tipos e números dos campos

#### **Gap 6: Sem Histórico de Respostas**

**Problema**: Não salva histórico de chamadas
**Impacto**: Difícil comparar respostas
**Solução Proposta**:

- Lista de requests anteriores
- Click para reenviar
- Diff entre respostas

#### **Gap 7: Sem Validação de JSON**

**Problema**: Não valida JSON antes de enviar
**Impacto**: Erro só aparece ao enviar
**Solução Proposta**:

- Validação em tempo real
- Syntax highlighting
- Autocomplete baseado no schema

#### **Gap 8: Sem Feedback de Conexão**

**Problema**: Não mostra status da conexão gRPC
**Impacto**: Usuário não sabe se servidor está acessível
**Solução Proposta**:

- Botão "Test Connection"
- Indicator (🟢 Connected / 🔴 Disconnected)
- Ping/Health check

### 3.3 Usabilidade - Checklist de Melhorias

#### **Essenciais (Deve ter)** 🔴

- [ ] Validação e erro de parsing visível
- [ ] Loading states em todas as ações assíncronas
- [ ] Desabilitar botões quando campos obrigatórios vazios
- [ ] Mensagens de erro claras (não só "Failed to...")
- [ ] Feedback visual de sucesso/erro

#### **Importantes (Deveria ter)** 🟡

- [ ] Reflection funcional
- [ ] UI especial para streaming
- [ ] Schema viewer básico
- [ ] Test connection button
- [ ] Metadata editor

#### **Desejáveis (Bom ter)** 🟢

- [ ] Histórico de requests
- [ ] Autocomplete no JSON editor
- [ ] Diff de respostas
- [ ] Export/Import de coleções
- [ ] Templates de mensagens

### 3.4 Proposta de Novo Layout (Wireframe Textual)

```
┌─────────────────────────────────────────────────────────────────┐
│ gRPC Request                                          [⚙️ Config]│
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│ URL: [grpc://localhost:50051              ] [🔗 Test Connection]│
│      Status: 🟢 Connected                                        │
│                                                                  │
│ ┌─────────────┬─────────────┬─────────────┬──────────────────┐ │
│ │ Request     │ Schema      │ Metadata    │ History          │ │
│ └─────────────┴─────────────┴─────────────┴──────────────────┘ │
│                                                                  │
│ ┌─ Request Tab ─────────────────────────────────────────────┐  │
│ │                                                            │  │
│ │ Proto File:                                                │  │
│ │ ┌────────────────────────────────────────────────────────┐ │  │
│ │ │ syntax = "proto3";                                     │ │  │
│ │ │ service UserService { ...                              │ │  │
│ │ └────────────────────────────────────────────────────────┘ │  │
│ │ [Parse Proto] [Discover Services] [📁 Load from file]     │  │
│ │                                                            │  │
│ │ Service: [UserService ▼]   Method: [GetUser ▼]            │  │
│ │                                                            │  │
│ │ Call Type: ⚪ Unary  ⚪ Server Stream                       │  │
│ │            ⚪ Client Stream  ⚪ Bidirectional               │  │
│ │                                                            │  │
│ │ Message:                                 [Format] [Clear] │  │
│ │ ┌────────────────────────────────────────────────────────┐ │  │
│ │ │ {                                                      │ │  │
│ │ │   "id": "user1"                                        │ │  │
│ │ │ }                                                      │ │  │
│ │ └────────────────────────────────────────────────────────┘ │  │
│ │ ✅ Valid JSON                                              │  │
│ │                                                            │  │
│ │ ┌─ Method Info ──────────────────────────────────────────┐ │  │
│ │ │ Input:  GetUserRequest                                 │ │  │
│ │ │ Output: GetUserResponse                                │ │  │
│ │ │ Type:   Unary                                          │ │  │
│ │ └────────────────────────────────────────────────────────┘ │  │
│ └────────────────────────────────────────────────────────────┘  │
│                                                                  │
│ [🚀 Send Request]                                                │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

---

## 🧪 Parte 4: Plano de Testes Automatizados (Rust)

### 4.1 Estratégia de Testes

```
┌─────────────────────────────────────────────────────────────┐
│                    PIRÂMIDE DE TESTES                        │
└─────────────────────────────────────────────────────────────┘

                      /\
                     /  \  E2E (Playwright) - Futuramente
                    /____\
                   /      \
                  / Integr \  Integration Tests (com test server)
                 /__________\
                /            \
               /    Unit      \  Unit Tests (cada módulo)
              /________________\
```

### 4.2 Unit Tests (src-tauri/src/grpc/\*\_test.rs)

#### **proto_parser.rs**

```
Testes (15 casos):
├─ Parsing Básico
│  ├─ test_parse_simple_proto
│  ├─ test_parse_multiple_services
│  └─ test_parse_multiple_messages
├─ Tipos de Streaming
│  ├─ test_parse_unary_method
│  ├─ test_parse_server_streaming
│  ├─ test_parse_client_streaming
│  └─ test_parse_bidirectional_streaming
├─ Mensagens Complexas
│  ├─ test_parse_nested_messages
│  ├─ test_parse_repeated_fields
│  ├─ test_parse_optional_fields
│  └─ test_parse_map_fields
├─ Enums e Oneof
│  ├─ test_parse_enum
│  └─ test_parse_oneof
└─ Error Handling
   ├─ test_parse_invalid_syntax
   └─ test_parse_empty_proto

Cobertura alvo: 90%
```

#### **client.rs**

```
Testes (12 casos):
├─ Client Creation
│  ├─ test_create_client_valid_url
│  ├─ test_create_client_invalid_url
│  └─ test_create_client_with_tls
├─ Request Execution
│  ├─ test_execute_unary_request
│  ├─ test_execute_with_metadata
│  └─ test_execute_with_timeout
├─ Error Handling
│  ├─ test_connection_refused
│  ├─ test_timeout_error
│  ├─ test_invalid_message
│  └─ test_status_code_mapping
└─ Conversions
   ├─ test_json_to_bytes
   └─ test_bytes_to_json

Cobertura alvo: 85%
```

#### **reflection.rs**

```
Testes (8 casos):
├─ Service Discovery
│  ├─ test_discover_services_success
│  ├─ test_discover_services_not_supported
│  └─ test_discover_services_timeout
├─ Service Info
│  ├─ test_get_service_info_exists
│  ├─ test_get_service_info_not_found
│  └─ test_get_service_info_invalid_name
└─ Method Info
   ├─ test_get_method_info_exists
   └─ test_get_method_info_not_found

Cobertura alvo: 80%
```

#### **streaming.rs**

```
Testes (10 casos):
├─ Server Streaming
│  ├─ test_server_stream_collect_all
│  ├─ test_server_stream_partial
│  └─ test_server_stream_error_mid_stream
├─ Client Streaming
│  ├─ test_client_stream_send_all
│  ├─ test_client_stream_empty
│  └─ test_client_stream_error
├─ Bidirectional
│  ├─ test_bidirectional_echo
│  └─ test_bidirectional_complex
└─ Cancellation
   ├─ test_cancel_stream_client
   └─ test_cancel_stream_server

Cobertura alvo: 75% (streaming é complexo)
```

#### **commands.rs**

```
Testes (8 casos):
├─ Command Invocation
│  ├─ test_grpc_unary_request_command
│  ├─ test_grpc_server_streaming_command
│  ├─ test_grpc_parse_proto_command
│  └─ test_grpc_discover_services_command
└─ Error Conversion
   ├─ test_convert_grpc_error_to_api_response
   ├─ test_convert_parse_error
   ├─ test_convert_connection_error
   └─ test_convert_timeout_error

Cobertura alvo: 95% (critical path)
```

### 4.3 Integration Tests (src-tauri/tests/)

#### **grpc_integration_tests.rs**

```rust
// Estrutura do teste de integração:

// Setup:
// 1. Iniciar test server em thread separada
// 2. Aguardar servidor estar ready
// 3. Executar testes
// 4. Shutdown do servidor

mod setup {
    async fn start_test_server() -> ServerHandle { ... }
    async fn wait_for_ready() { ... }
}

// Testes:
#[tokio::test]
async fn test_end_to_end_unary_call() {
    // 1. Start server
    // 2. Create request via commands
    // 3. Verify response
    // 4. Assert database state
}

#[tokio::test]
async fn test_end_to_end_with_auth() {
    // 1. Login to get token
    // 2. Use token in request
    // 3. Verify authenticated response
}

#[tokio::test]
async fn test_end_to_end_server_streaming() {
    // 1. Start server
    // 2. Request stream
    // 3. Collect all messages
    // 4. Verify count and content
}

#[tokio::test]
async fn test_end_to_end_reflection() {
    // 1. Discover services via reflection
    // 2. Verify services found
    // 3. Get method info
    // 4. Execute method
}

#[tokio::test]
async fn test_end_to_end_error_handling() {
    // 1. Invalid request
    // 2. Not found
    // 3. Unauthenticated
    // 4. Verify error codes
}

// Total: ~15 integration tests
```

### 4.4 Fixtures e Test Utils

#### **test_utils.rs** (já criado, expandir)

```
Adicionar:
├─ Mock Server Builder
│  └─ TestServerBuilder::new()
│      .with_auth()
│      .with_services(vec![...])
│      .build()
├─ Request Builders
│  ├─ unary_request_builder()
│  ├─ streaming_request_builder()
│  └─ auth_request_builder()
├─ Assertion Helpers
│  ├─ assert_grpc_success(response)
│  ├─ assert_grpc_error(response, code)
│  └─ assert_user_equals(actual, expected)
└─ Mock Data
   ├─ mock_users() -> Vec<User>
   ├─ mock_tokens() -> Vec<Token>
   └─ mock_chat_rooms() -> Vec<Room>
```

### 4.5 Comandos de Teste

```bash
# Rodar todos os testes
cargo test --manifest-path src-tauri/Cargo.toml

# Só unit tests
cargo test --lib

# Só integration tests
cargo test --test '*'

# Módulo específico
cargo test grpc::client

# Com output detalhado
cargo test -- --nocapture

# Com coverage
cargo tarpaulin --out Html

# Watch mode (requer cargo-watch)
cargo watch -x test
```

### 4.6 CI/CD Integration

```yaml
# .github/workflows/grpc-tests.yml

name: gRPC Tests

on:
  push:
    branches: [feat/grpc, main]
  pull_request:
    paths:
      - "src-tauri/src/grpc/**"
      - "src-tauri/Cargo.toml"

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Install Rust
        uses: actions-rs/toolchain@v1
        with:
          toolchain: stable
          components: rustfmt, clippy

      - name: Cache cargo
        uses: actions/cache@v3
        with:
          path: |
            ~/.cargo
            src-tauri/target
          key: ${{ runner.os }}-cargo-${{ hashFiles('**/Cargo.lock') }}

      - name: Run tests
        run: |
          cd src-tauri
          cargo test --all-features -- --nocapture

      - name: Run clippy
        run: |
          cd src-tauri
          cargo clippy -- -D warnings

      - name: Check formatting
        run: |
          cd src-tauri
          cargo fmt -- --check

      - name: Generate coverage
        run: |
          cargo install cargo-tarpaulin
          cd src-tauri
          cargo tarpaulin --out Xml

      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: src-tauri/cobertura.xml
```

---

## 🎯 Parte 5: Workflow de Teste Manual

### 5.1 Setup do Ambiente

#### **Passo 1: Preparar Test Server**

```bash
# Clone do repo do test server (após ser criado)
git clone https://github.com/solocompany/grpc-test-server
cd grpc-test-server

# Iniciar com Docker
docker-compose up -d

# Verificar que está rodando
docker-compose ps
# Esperado: grpc-test-server UP

# Verificar logs
docker-compose logs -f

# Testar com grpcurl
grpcurl -plaintext localhost:50051 list
# Esperado:
# - user.v1.UserService
# - auth.v1.AuthService
# - streaming.v1.StreamingService
# - grpc.reflection.v1alpha.ServerReflection
```

#### **Passo 2: Preparar Solo**

```bash
# No projeto Solo
cd /Users/igorvieira/Projects/Personal/solocompany/solo

# Instalar dependências (se necessário)
npm install

# Build do backend
npm run tauri build

# Rodar em dev mode
npm run tauri dev
```

### 5.2 Scenarios de Teste Manual

#### **Scenario 1: CRUD Básico - GetUser**

**Objetivo**: Testar chamada unary básica

**Passos**:

1. Abrir Solo
2. Criar nova request gRPC (botão direito → New → gRPC Request)
3. Preencher:
   - URL: `grpc://localhost:50051`
   - Proto file: Copiar de `grpc-test-server/proto/user.proto`
4. Click "Parse Proto"
5. Verificar: Dropdowns populados
6. Selecionar:
   - Service: `UserService`
   - Method: `GetUser`
7. Call Type: `Unary` (já selecionado)
8. Message:
   ```json
   {
     "id": "user1"
   }
   ```
9. Click "Send Request"

**Resultado Esperado**:

- Status: 200 / OK
- Response:
  ```json
  {
    "user": {
      "id": "user1",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "admin",
      "created_at": 1234567890,
      "updated_at": 1234567890
    }
  }
  ```

**Validações**:

- ✅ Response veio em < 1 segundo
- ✅ Formato JSON correto
- ✅ Dados condizem com seed data
- ✅ UI mostra resposta formatada

---

#### **Scenario 2: Autenticação - Login e Request Autenticado**

**Objetivo**: Testar fluxo completo de autenticação

**Parte A: Login**

1. Nova request gRPC
2. Service: `AuthService`
3. Method: `Login`
4. Message:
   ```json
   {
     "email": "john@example.com",
     "password": "password123"
   }
   ```
5. Send Request

**Resultado Esperado**:

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIs...",
  "expires_in": 3600,
  "user": {
    "id": "user1",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "admin"
  }
}
```

**Parte B: Request Autenticado**

1. Copiar `access_token` da resposta
2. Nova request gRPC
3. Service: `UserService`
4. Method: `CreateUser`
5. **Auth Tab**: Bearer Token: `<colar token>`
6. Message:
   ```json
   {
     "name": "Jane Smith",
     "email": "jane@example.com",
     "password": "pass456",
     "role": "user"
   }
   ```
7. Send Request

**Resultado Esperado**:

- Status: 200 / OK
- User criado retornado

**Parte C: Request Sem Token (deve falhar)**

1. Mesma request, mas remover token
2. Send Request

**Resultado Esperado**:

- Status: 401 / UNAUTHENTICATED
- Error: "Missing or invalid authentication token"

---

#### **Scenario 3: Server Streaming - ListUsers**

**Objetivo**: Testar recebimento de múltiplas mensagens

**Passos**:

1. Service: `UserService`
2. Method: `ListUsers`
3. Call Type: **Server Streaming**
4. Message:
   ```json
   {
     "page": 1,
     "limit": 5
   }
   ```
5. Send Request

**Resultado Esperado**:

- UI mostra "Receiving stream..."
- Mensagens aparecem incrementalmente (ou todas no final, dependendo da implementação)
- Total: 5 users
- Status: Stream completed

**Desafio**: Como mostrar isso na UI?

- Opção 1: Lista que vai crescendo
- Opção 2: Array no final
- Opção 3: Log de mensagens recebidas

---

#### **Scenario 4: Error Handling - User Not Found**

**Objetivo**: Testar tratamento de erros

**Passos**:

1. Service: `UserService`
2. Method: `GetUser`
3. Message:
   ```json
   {
     "id": "nonexistent"
   }
   ```
4. Send Request

**Resultado Esperado**:

- Status: 404 / NOT_FOUND
- Error: "User with id 'nonexistent' not found"
- UI mostra erro claramente (vermelho, ícone de erro)

---

#### **Scenario 5: Reflection - Service Discovery**

**Objetivo**: Descobrir serviços sem proto file

**Passos**:

1. Nova request gRPC
2. URL: `grpc://localhost:50051`
3. **NÃO colar proto file**
4. Click "Discover Services"

**Resultado Esperado**:

- Loading indicator
- Após ~1 segundo:
  - Dropdowns populados com serviços descobertos
  - Mesmos serviços que com proto file manual
- Console log: "Discovered 3 services: UserService, AuthService, StreamingService"

---

#### **Scenario 6: Proto Parsing Error**

**Objetivo**: Testar feedback de erro de parsing

**Passos**:

1. Proto file com erro de sintaxe:

   ```protobuf
   syntax = "proto3"  // Faltando ;

   service BrokenService {
     rpc DoSomething(Request returns (Response);  // Faltando )
   }
   ```

2. Click "Parse Proto"

**Resultado Esperado**:

- Erro visível na UI
- Mensagem clara: "Failed to parse proto file: Syntax error on line X"
- Sugestão de correção (se possível)
- Proto textarea com borda vermelha

---

#### **Scenario 7: Streaming Chat - Bidirectional**

**Objetivo**: Testar streaming bidirecional (mais complexo)

**Passos**:

1. Service: `StreamingService`
2. Method: `Chat`
3. Call Type: **Bidirectional**
4. Messages (enviar múltiplos):
   ```json
   {"user_id": "user1", "room_id": "room1", "content": "Hello"}
   {"user_id": "user1", "room_id": "room1", "content": "How are you?"}
   {"user_id": "user1", "room_id": "room1", "content": "Goodbye"}
   ```

**Resultado Esperado**:

- UI mostra mensagens enviadas
- UI mostra mensagens recebidas (echo ou respostas)
- Chat-like interface (ideal)

**Desafio**: Como UI suporta envio de múltiplas mensagens?

---

### 5.3 Checklist de Validação Manual

Usar esta checklist para cada release/sprint:

#### **Funcionalidades Core** ✅

- [ ] Parse proto file simples
- [ ] Parse proto file complexo (nested, streaming)
- [ ] Selecionar service/method
- [ ] Enviar unary request
- [ ] Receber resposta unary
- [ ] Format JSON message

#### **Autenticação** 🔐

- [ ] Login e receber token
- [ ] Usar Bearer token em request
- [ ] Request sem token (deve falhar)
- [ ] Token inválido (deve falhar)

#### **Streaming** 📡

- [ ] Server streaming (receber múltiplas mensagens)
- [ ] Client streaming (enviar múltiplas mensagens)
- [ ] Bidirectional streaming

#### **Error Handling** ⚠️

- [ ] NOT_FOUND (404)
- [ ] UNAUTHENTICATED (401)
- [ ] INVALID_ARGUMENT (400)
- [ ] INTERNAL_ERROR (500)
- [ ] Connection refused
- [ ] Timeout

#### **Reflection** 🔍

- [ ] Discover services
- [ ] Get service info
- [ ] Get method info
- [ ] Parse discovered schema

#### **Usabilidade** 🎨

- [ ] Loading states visíveis
- [ ] Erros claros e acionáveis
- [ ] Success feedback visível
- [ ] Botões desabilitados quando necessário
- [ ] Tooltips/help text

---

## 🛠️ Parte 6: Ambiente de Desenvolvimento Completo

### 6.1 Setup Inicial (Uma Vez)

#### **Passo 1: Instalar Dependências do Sistema**

```bash
# macOS
brew install protobuf grpcurl

# Verificar instalação
protoc --version  # libprotoc 25.x
grpcurl --version  # grpcurl v1.8.x
```

#### **Passo 2: Clonar Projetos**

```bash
# Solo (já tem)
cd ~/Projects/Personal/solocompany/solo

# Test Server (após criar)
cd ~/Projects/Personal/solocompany
git clone https://github.com/solocompany/grpc-test-server
```

#### **Passo 3: Configurar Test Server**

```bash
cd grpc-test-server

# Instalar dependências Rust
cargo build

# Copiar .env
cp .env.example .env

# Editar se necessário
# SERVER_HOST=0.0.0.0
# SERVER_PORT=50051
# LOG_LEVEL=debug

# Build Docker image
docker-compose build
```

#### **Passo 4: Verificar Solo**

```bash
cd ~/Projects/Personal/solocompany/solo

# Dependências atualizadas?
npm install

# Backend compila?
cd src-tauri
cargo build
cd ..

# Frontend compila?
npm run build
```

### 6.2 Workflow Diário de Desenvolvimento

#### **Morning Routine** ☀️

```bash
# 1. Start test server
cd ~/Projects/grpc-test-server
docker-compose up -d

# 2. Verify running
docker-compose ps
grpcurl -plaintext localhost:50051 list

# 3. Start Solo in dev mode
cd ~/Projects/solo
npm run tauri dev

# 4. Open browser console
# Cmd+Option+I (macOS)
```

#### **Development Loop** 🔄

```bash
# 1. Make changes to Solo code
# 2. Tauri hot reload (frontend) ou restart (backend)
# 3. Test manually in Solo UI
# 4. Run unit tests
cargo test --lib grpc::module_name

# 5. Check logs
# Solo: terminal onde rodou `npm run tauri dev`
# Server: docker-compose logs -f

# 6. Commit quando tudo funcionar
git add .
git commit -m "feat(grpc): add X feature"
```

#### **Evening Cleanup** 🌙

```bash
# Stop test server
cd ~/Projects/grpc-test-server
docker-compose down

# Commit final
cd ~/Projects/solo
git push origin feat/grpc
```

### 6.3 Debugging

#### **Debug Backend Rust**

```bash
# Opção 1: Logs
RUST_LOG=debug npm run tauri dev

# Opção 2: VS Code debugger
# .vscode/launch.json:
{
  "type": "lldb",
  "request": "launch",
  "name": "Tauri Development Debug",
  "cargo": {
    "args": [
      "build",
      "--manifest-path=./src-tauri/Cargo.toml",
      "--no-default-features"
    ]
  }
}

# Opção 3: println! debugging
println!("DEBUG: request = {:?}", request);
```

#### **Debug Test Server**

```bash
# Logs em tempo real
docker-compose logs -f

# Entrar no container
docker-compose exec grpc-server sh

# Ver processos
ps aux | grep grpc

# Test endpoint diretamente
grpcurl -plaintext \
  -d '{"id":"user1"}' \
  localhost:50051 \
  user.v1.UserService/GetUser
```

#### **Debug Fluxo Completo**

```bash
# 1. Backend Solo logs
RUST_LOG=solo_lib::grpc=trace npm run tauri dev

# 2. Server logs
docker-compose logs -f

# 3. Frontend console
# Abrir DevTools

# 4. Network inspector
# Ver chamadas Tauri (não é HTTP, mas dá pra ver timing)
```

### 6.4 Como Adicionar Nova Feature gRPC

#### **Exemplo: Adicionar suporte a TLS**

**Backend**:

1. Adicionar config de TLS em `client.rs`:

   ```rust
   // src-tauri/src/grpc/client.rs

   pub struct TlsConfig {
       cert_path: String,
       key_path: String,
   }

   impl GrpcClient {
       pub async fn new_with_tls(url: &str, tls: TlsConfig) -> Result<Self> {
           // Implementar
       }
   }
   ```

2. Adicionar comando Tauri:

   ```rust
   // src-tauri/src/grpc/commands.rs

   #[command]
   pub async fn grpc_request_with_tls(
       url: String,
       cert_path: String,
       key_path: String,
       // ... outros params
   ) -> Result<ApiResponse, String> {
       // Implementar
   }
   ```

3. Registrar comando:

   ```rust
   // src-tauri/src/main.rs

   .invoke_handler(tauri::generate_handler![
       // ... existing commands
       grpc_request_with_tls,
   ])
   ```

**Frontend**:

1. Adicionar UI para TLS config:

   ```typescript
   // src/components/GrpcEditor.tsx

   const [tlsEnabled, setTlsEnabled] = useState(false);
   const [certPath, setCertPath] = useState("");
   const [keyPath, setKeyPath] = useState("");

   // Adicionar toggles e file pickers
   ```

2. Chamar comando com TLS:
   ```typescript
   if (tlsEnabled) {
     result = await invoke("grpc_request_with_tls", {
       url, certPath, keyPath, ...
     });
   }
   ```

**Testes**:

1. Unit test:

   ```rust
   #[tokio::test]
   async fn test_tls_connection() {
       let tls = TlsConfig { ... };
       let client = GrpcClient::new_with_tls(url, tls).await;
       assert!(client.is_ok());
   }
   ```

2. Integration test:
   - Configurar test server com TLS
   - Testar conexão completa

3. Manual test:
   - Configurar certificados
   - Testar na UI

### 6.5 Troubleshooting Comum

#### **Problema 1: Test server não inicia**

```bash
# Verificar porta ocupada
lsof -i :50051

# Matar processo se necessário
kill -9 <PID>

# Recriar container
docker-compose down -v
docker-compose up --build
```

#### **Problema 2: Solo não conecta ao servidor**

```bash
# Ping do servidor
grpcurl -plaintext localhost:50051 list

# Se funciona com grpcurl mas não com Solo:
# - Check URL format: grpc:// ou http://
# - Check firewall
# - Check logs do Solo para erro específico
```

#### **Problema 3: Proto parsing falha**

```bash
# Validar proto file manualmente
protoc --proto_path=. --descriptor_set_out=/dev/null user.proto

# Se der erro, corrigir sintaxe
# Se não der erro, bug no parser do Solo
```

#### **Problema 4: Testes falhando**

```bash
# Limpar build cache
cargo clean

# Rebuild
cargo build

# Rodar teste específico com output
cargo test test_name -- --nocapture --test-threads=1
```

---

## 📅 Cronograma de Implementação

### **Sprint 1: Test Server (3-4 dias)**

- [ ] Dia 1: Setup projeto, proto files, estrutura
- [ ] Dia 2: Implementar serviços (User, Auth)
- [ ] Dia 3: Implementar streaming, interceptors
- [ ] Dia 4: Docker, seed data, documentação

### **Sprint 2: Testes Automatizados Rust (4-5 dias)**

- [ ] Dia 1: Setup test utils, fixtures
- [ ] Dia 2: Unit tests (proto_parser, client)
- [ ] Dia 3: Unit tests (reflection, streaming)
- [ ] Dia 4: Integration tests
- [ ] Dia 5: CI/CD, coverage

### **Sprint 3: Melhorias UI (3-4 dias)**

- [ ] Dia 1: Análise gaps, wireframes
- [ ] Dia 2: Implementar feedback visual, validation
- [ ] Dia 3: Implementar streaming UI
- [ ] Dia 4: Polimento, testes manuais

### **Sprint 4: Documentação e Demo (1-2 dias)**

- [ ] Dia 1: Documentação completa
- [ ] Dia 2: Video demo, screenshots

**Total: 11-15 dias**

---

## 📚 Recursos e Referências

### **Tonic (Rust gRPC)**

- [Tonic Docs](https://docs.rs/tonic/)
- [Tonic Examples](https://github.com/hyperium/tonic/tree/master/examples)
- [Tonic Book](https://github.com/hyperium/tonic/blob/master/tonic/README.md)

### **Protocol Buffers**

- [Proto3 Language Guide](https://protobuf.dev/programming-guides/proto3/)
- [Proto Style Guide](https://protobuf.dev/programming-guides/style/)

### **gRPC Concepts**

- [gRPC Introduction](https://grpc.io/docs/what-is-grpc/introduction/)
- [gRPC Core Concepts](https://grpc.io/docs/what-is-grpc/core-concepts/)
- [gRPC Status Codes](https://grpc.io/docs/guides/status-codes/)

### **Testing**

- [Rust Testing Book](https://rust-lang.github.io/async-book/09_example/01_running.html)
- [Tower Test](https://docs.rs/tower-test/)
- [Tokio Test](https://docs.rs/tokio-test/)

### **Ferramentas**

- [grpcurl](https://github.com/fullstorydev/grpcurl) - CLI para gRPC
- [ghz](https://ghz.sh/) - Benchmark tool
- [BloomRPC](https://github.com/bloomrpc/bloomrpc) - GUI client (referência)

---

## ✅ Checklist Final do Plano

### **Está claro como:**

- [x] Estruturar o test server Rust
- [x] Implementar todos os tipos de gRPC calls
- [x] Configurar Docker para o server
- [x] Fluxo de dados completo (Frontend → Backend → Server)
- [x] Funcionam proto parsing, metadata, streaming
- [x] Estruturar testes automatizados Rust
- [x] Realizar testes manuais com Solo
- [x] Debugar problemas
- [x] Adicionar novas features
- [x] Melhorar usabilidade da UI

### **Está documentado:**

- [x] Arquitetura completa
- [x] Proto files spec
- [x] Fluxo de dados detalhado
- [x] Gaps da UI atual
- [x] Plano de testes (unit + integration)
- [x] Scenarios de teste manual
- [x] Workflow de desenvolvimento
- [x] Troubleshooting comum
- [x] Cronograma estimado

---

## 🚀 Próximos Passos

### **Antes de Implementar**:

1. ✅ Revisar este plano completo
2. ⬜ Fazer perguntas/ajustes necessários
3. ⬜ Aprovar escopo e cronograma
4. ⬜ Criar issues/tasks no GitHub
5. ⬜ Priorizar sprints

### **Para Começar Implementação**:

1. ⬜ Sprint 1: Criar repo do test server
2. ⬜ Setup inicial (proto files, estrutura)
3. ⬜ Implementar primeiro serviço (UserService)
4. ⬜ Testar com grpcurl
5. ⬜ Dockerizar
6. ⬜ Testar com Solo (manual)

---

**Criado**: ${new Date().toLocaleDateString('pt-BR')}
**Versão**: 2.0
**Status**: 📋 Aguardando Aprovação
**Próximo**: Revisão e ajustes conforme feedback
