# 📋 Plano de Desenvolvimento: Testes gRPC no Solo

## 📊 Estado Atual

### ✅ Já Implementado

- **Infraestrutura gRPC**: Client, reflection, proto parser, streaming
- **Comandos Tauri**: `grpc_unary_request`, `grpc_server_streaming_request`, `grpc_discover_services`
- **Frontend**: `GrpcEditor.tsx` com suporte completo a UI
- **Testes Existentes**: HTTP e GraphQL com `httpmock`
- **Tipos de Chamadas**: Unary, Server Streaming, Client Streaming, Bidirectional

### 🚧 Pendente

- Testes unitários para módulos gRPC
- Testes de integração com servidor gRPC mock
- Testes end-to-end com Playwright
- Testes de streaming (server, client, bidirectional)
- Validação de proto parser
- Testes de reflexão
- Testes de metadados e autenticação

---

## 🎯 Objetivos do Plano de Testes

1. **Cobertura Completa**: Testar todos os módulos gRPC (client, reflection, parser, streaming)
2. **Qualidade**: Garantir confiabilidade das funcionalidades gRPC
3. **Regressão**: Prevenir bugs em novas features
4. **Documentação**: Testes como exemplos de uso
5. **CI/CD**: Automação de testes no pipeline

---

## 🏗️ Infraestrutura de Testes

### Ferramentas Necessárias

#### Backend (Rust)

- **`tonic-build`**: Gerar código a partir de `.proto` para testes
- **`tower-test`**: Mock de serviços gRPC
- **`tokio-test`**: Utilities para testes assíncronos
- **Mock gRPC Server**: Servidor de teste local

#### Frontend (TypeScript)

- **Playwright** (já existe): Testes E2E
- **Vitest**: Testes unitários de componentes
- **MSW (Mock Service Worker)**: Mock de invocações Tauri

#### Ferramentas Adicionais

- **`grpcurl`**: Testes manuais de linha de comando
- **`buf`**: Validação e lint de arquivos proto
- **Docker**: Container com servidor gRPC de teste

---

## 📐 Estratégia de Implementação

### Fase 1: Preparação da Infraestrutura (1-2 dias)

#### 1.1 Adicionar Dependências de Teste

```toml
# src-tauri/Cargo.toml
[dev-dependencies]
tonic-build = "0.10"
tower-test = "0.4"
tokio-test = "0.4"
tempfile = "3.0"  # Para testes de arquivos proto temporários
```

#### 1.2 Criar Servidor gRPC Mock

Criar `src-tauri/src/grpc/test_utils.rs`:

- Servidor gRPC de teste com múltiplos serviços
- Helpers para criar requests de teste
- Fixtures de mensagens proto
- Builders para diferentes tipos de resposta

#### 1.3 Estrutura de Proto Files de Teste

Criar `src-tauri/proto/test/`:

- `user_service.proto`: Serviço básico de usuários
- `streaming_service.proto`: Testes de streaming
- `nested_messages.proto`: Mensagens complexas aninhadas
- `auth_service.proto`: Serviço com autenticação

### Fase 2: Testes Unitários (3-4 dias)

#### 2.1 Proto Parser (`proto_parser.rs`)

```rust
#[cfg(test)]
mod tests {
    // Testes já existentes + novos:

    #[test]
    fn test_parse_proto_with_nested_messages() {
        // Testar mensagens aninhadas complexas
    }

    #[test]
    fn test_parse_proto_with_enums() {
        // Testar enums em proto files
    }

    #[test]
    fn test_parse_proto_with_oneof() {
        // Testar campos oneof
    }

    #[test]
    fn test_parse_proto_with_repeated_fields() {
        // Testar campos repetidos (arrays)
    }

    #[test]
    fn test_parse_proto_with_maps() {
        // Testar tipos map
    }

    #[test]
    fn test_parse_proto_syntax_errors() {
        // Testar tratamento de erros de sintaxe
    }

    #[test]
    fn test_parse_proto_with_imports() {
        // Testar imports de outros proto files
    }
}
```

#### 2.2 gRPC Client (`client.rs`)

```rust
#[cfg(test)]
mod tests {
    use super::*;
    use tower_test::mock;

    #[tokio::test]
    async fn test_create_client_valid_url() {
        // Testar criação de cliente com URL válida
    }

    #[tokio::test]
    async fn test_create_client_invalid_url() {
        // Testar erro com URL inválida
    }

    #[tokio::test]
    async fn test_unary_call_success() {
        // Testar chamada unary bem-sucedida
    }

    #[tokio::test]
    async fn test_unary_call_timeout() {
        // Testar timeout em chamada
    }

    #[tokio::test]
    async fn test_unary_call_with_metadata() {
        // Testar metadados em request
    }

    #[tokio::test]
    async fn test_connection_refused() {
        // Testar erro de conexão recusada
    }
}
```

#### 2.3 Reflection (`reflection.rs`)

```rust
#[cfg(test)]
mod tests {
    #[tokio::test]
    async fn test_discover_services_success() {
        // Testar descoberta de serviços via reflection
    }

    #[tokio::test]
    async fn test_get_service_info() {
        // Testar obtenção de info de serviço específico
    }

    #[tokio::test]
    async fn test_get_method_info() {
        // Testar obtenção de info de método específico
    }

    #[tokio::test]
    async fn test_reflection_server_not_supporting() {
        // Testar erro quando servidor não suporta reflection
    }
}
```

#### 2.4 Streaming (`streaming.rs`)

```rust
#[cfg(test)]
mod tests {
    #[tokio::test]
    async fn test_server_streaming_multiple_responses() {
        // Testar recebimento de múltiplas respostas
    }

    #[tokio::test]
    async fn test_client_streaming_multiple_requests() {
        // Testar envio de múltiplos requests
    }

    #[tokio::test]
    async fn test_bidirectional_streaming() {
        // Testar streaming bidirecional
    }

    #[tokio::test]
    async fn test_streaming_cancellation() {
        // Testar cancelamento de stream
    }

    #[tokio::test]
    async fn test_streaming_error_handling() {
        // Testar tratamento de erros em stream
    }
}
```

#### 2.5 Commands (`commands.rs`)

```rust
#[cfg(test)]
mod tests {
    #[tokio::test]
    async fn test_grpc_unary_request_command() {
        // Testar comando Tauri de unary request
    }

    #[tokio::test]
    async fn test_grpc_server_streaming_command() {
        // Testar comando Tauri de server streaming
    }

    #[tokio::test]
    async fn test_grpc_parse_proto_file_command() {
        // Testar comando de parsing de proto
    }

    #[tokio::test]
    async fn test_grpc_discover_services_command() {
        // Testar comando de discovery
    }

    #[tokio::test]
    async fn test_command_error_conversion() {
        // Testar conversão de erros para ApiResponse
    }
}
```

### Fase 3: Testes de Integração (3-4 dias)

#### 3.1 Criar Mock gRPC Server

Criar `src-tauri/tests/grpc_integration_tests.rs`:

```rust
use tonic::{transport::Server, Request, Response, Status};

// Implementar serviços de teste
pub mod test_proto {
    tonic::include_proto!("test");
}

struct TestUserService;

#[tonic::async_trait]
impl test_proto::user_service_server::UserService for TestUserService {
    async fn get_user(
        &self,
        request: Request<test_proto::GetUserRequest>,
    ) -> Result<Response<test_proto::GetUserResponse>, Status> {
        // Implementação mock
    }

    async fn list_users(
        &self,
        request: Request<test_proto::ListUsersRequest>,
    ) -> Result<Response<Self::ListUsersStream>, Status> {
        // Implementação de streaming mock
    }
}

#[tokio::test]
async fn test_integration_unary_call() {
    // Iniciar servidor mock
    // Fazer request real
    // Validar resposta
}

#[tokio::test]
async fn test_integration_server_streaming() {
    // Testar streaming completo
}

#[tokio::test]
async fn test_integration_with_auth() {
    // Testar autenticação Bearer token
}

#[tokio::test]
async fn test_integration_proto_reflection() {
    // Testar reflection API
}
```

#### 3.2 Testes de Scenarios Reais

```rust
#[tokio::test]
async fn test_full_workflow_parse_and_call() {
    // 1. Parsear proto file
    // 2. Descobrir serviços
    // 3. Fazer chamada
    // 4. Validar resposta
}

#[tokio::test]
async fn test_error_scenarios() {
    // Testar diferentes cenários de erro
}

#[tokio::test]
async fn test_connection_retry() {
    // Testar retry de conexão
}
```

### Fase 4: Testes Frontend (2-3 dias)

#### 4.1 Testes de Componente (`GrpcEditor.test.tsx`)

```typescript
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { GrpcEditor } from "../GrpcEditor";

describe("GrpcEditor", () => {
  it("should render proto content textarea", () => {
    // Testar renderização
  });

  it("should parse proto file when button clicked", async () => {
    // Testar parsing de proto
  });

  it("should populate services dropdown after parsing", async () => {
    // Testar população de serviços
  });

  it("should update methods when service selected", async () => {
    // Testar atualização de métodos
  });

  it("should format JSON message", () => {
    // Testar formatação de JSON
  });

  it("should display method info correctly", () => {
    // Testar exibição de info do método
  });
});
```

#### 4.2 Testes E2E com Playwright

Criar `tests/grpc-workflow.spec.ts`:

```typescript
import { test, expect } from "@playwright/test";

test.describe("gRPC Workflow", () => {
  test("should create gRPC request and send", async ({ page }) => {
    // 1. Criar nova request gRPC
    await page.goto("/");
    await page.click('[data-testid="new-grpc-request"]');

    // 2. Cole proto file
    const protoContent = `
      syntax = "proto3";
      service UserService {
        rpc GetUser(GetUserRequest) returns (GetUserResponse);
      }
      message GetUserRequest { string id = 1; }
      message GetUserResponse { string name = 1; }
    `;
    await page.fill('[data-testid="proto-content"]', protoContent);

    // 3. Parse proto
    await page.click('[data-testid="parse-proto"]');

    // 4. Selecionar service e method
    await page.selectOption('[data-testid="service-select"]', "UserService");
    await page.selectOption('[data-testid="method-select"]', "GetUser");

    // 5. Preencher mensagem
    await page.fill('[data-testid="message-input"]', '{"id": "123"}');

    // 6. Enviar request
    await page.fill('[data-testid="url-input"]', "grpc://localhost:50051");
    await page.click('[data-testid="send-button"]');

    // 7. Validar resposta
    await expect(page.locator('[data-testid="response-body"]')).toBeVisible();
  });

  test("should handle proto parse errors", async ({ page }) => {
    // Testar erros de parsing
  });

  test("should switch between call types", async ({ page }) => {
    // Testar troca de tipos de chamada
  });
});
```

### Fase 5: Testes de Performance e Stress (1-2 dias)

#### 5.1 Testes de Carga

```rust
#[tokio::test]
async fn test_concurrent_requests() {
    // Enviar 100 requests simultâneos
    let mut handles = vec![];

    for _ in 0..100 {
        let handle = tokio::spawn(async {
            // Fazer request gRPC
        });
        handles.push(handle);
    }

    // Aguardar todas as respostas
    for handle in handles {
        handle.await.unwrap();
    }
}

#[tokio::test]
async fn test_large_message_payload() {
    // Testar com payload grande (>1MB)
}

#[tokio::test]
async fn test_streaming_performance() {
    // Testar performance de streaming com muitas mensagens
}
```

#### 5.2 Testes de Memória

```rust
#[tokio::test]
async fn test_memory_leak_on_streaming() {
    // Verificar vazamentos de memória em streaming
}
```

### Fase 6: Testes de Segurança (1 dia)

```rust
#[tokio::test]
async fn test_tls_connection() {
    // Testar conexão TLS/SSL
}

#[tokio::test]
async fn test_invalid_credentials() {
    // Testar credenciais inválidas
}

#[tokio::test]
async fn test_metadata_injection() {
    // Testar injeção de metadados maliciosos
}

#[tokio::test]
async fn test_proto_injection() {
    // Testar injeção de código em proto files
}
```

---

## 🗂️ Estrutura de Arquivos Proposta

```
src-tauri/
├── proto/
│   └── test/
│       ├── user_service.proto
│       ├── streaming_service.proto
│       ├── nested_messages.proto
│       └── auth_service.proto
├── src/
│   └── grpc/
│       ├── mod.rs
│       ├── client.rs (+ tests)
│       ├── commands.rs (+ tests)
│       ├── proto_parser.rs (+ tests)
│       ├── reflection.rs (+ tests)
│       ├── streaming.rs (+ tests)
│       └── test_utils.rs (NEW)
└── tests/
    ├── grpc_integration_tests.rs (NEW)
    ├── grpc_performance_tests.rs (NEW)
    └── common/
        └── mock_server.rs (NEW)

tests/
├── grpc-workflow.spec.ts (NEW)
├── grpc-error-handling.spec.ts (NEW)
└── grpc-streaming.spec.ts (NEW)

src/components/
└── __tests__/
    └── GrpcEditor.test.tsx (NEW)
```

---

## 🔧 Configuração Necessária

### Build Configuration

Criar `src-tauri/build.rs` atualizado:

```rust
fn main() {
    tauri_build::build();

    // Compilar proto files de teste apenas em modo teste
    #[cfg(test)]
    {
        tonic_build::configure()
            .build_server(true)
            .build_client(true)
            .out_dir("src/grpc/generated_test")
            .compile(
                &[
                    "proto/test/user_service.proto",
                    "proto/test/streaming_service.proto",
                ],
                &["proto/test"],
            )
            .unwrap();
    }
}
```

### Package.json Scripts

Adicionar em `package.json`:

```json
{
  "scripts": {
    "test:backend": "cargo test --manifest-path src-tauri/Cargo.toml",
    "test:backend:grpc": "cargo test --manifest-path src-tauri/Cargo.toml grpc",
    "test:frontend": "vitest run",
    "test:e2e": "playwright test tests/grpc-*.spec.ts",
    "test:all": "npm run test:backend && npm run test:frontend && npm run test:e2e",
    "test:watch": "vitest watch",
    "test:coverage": "vitest run --coverage"
  }
}
```

### CI/CD Configuration

Criar `.github/workflows/grpc-tests.yml`:

```yaml
name: gRPC Tests

on:
  pull_request:
    paths:
      - "src-tauri/src/grpc/**"
      - "src/components/GrpcEditor.tsx"
      - "tests/grpc-*.spec.ts"

jobs:
  test-grpc:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Install Rust
        uses: actions-rs/toolchain@v1
        with:
          toolchain: stable

      - name: Install Protobuf
        run: sudo apt-get install -y protobuf-compiler

      - name: Run Rust Tests
        run: cargo test --manifest-path src-tauri/Cargo.toml grpc

      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: "18"

      - name: Install Dependencies
        run: npm ci

      - name: Run Frontend Tests
        run: npm run test:frontend

      - name: Install Playwright
        run: npx playwright install

      - name: Run E2E Tests
        run: npm run test:e2e
```

---

## 🎨 Exemplos de Testes

### Exemplo 1: Teste de Proto Parser

```rust
#[test]
fn test_parse_user_service_proto() {
    let proto_content = r#"
        syntax = "proto3";

        package example;

        service UserService {
            rpc GetUser(GetUserRequest) returns (GetUserResponse);
            rpc ListUsers(Empty) returns (stream User);
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

        message Empty {}
    "#;

    let result = ProtoParser::parse_proto_file(proto_content);
    assert!(result.is_ok());

    let schema = result.unwrap();
    assert_eq!(schema.services.len(), 1);

    let service = &schema.services[0];
    assert_eq!(service.name, "UserService");
    assert_eq!(service.methods.len(), 2);

    let get_user_method = &service.methods[0];
    assert_eq!(get_user_method.name, "GetUser");
    assert_eq!(get_user_method.input_type, "GetUserRequest");
    assert_eq!(get_user_method.output_type, "GetUserResponse");
    assert!(!get_user_method.is_server_streaming);

    let list_users_method = &service.methods[1];
    assert_eq!(list_users_method.name, "ListUsers");
    assert!(list_users_method.is_server_streaming);
}
```

### Exemplo 2: Teste de Unary Call com Mock

```rust
#[tokio::test]
async fn test_unary_call_with_mock_server() {
    // Criar e iniciar servidor mock
    let addr = "[::1]:50051".parse().unwrap();
    let user_service = TestUserService;

    tokio::spawn(async move {
        Server::builder()
            .add_service(UserServiceServer::new(user_service))
            .serve(addr)
            .await
    });

    // Aguardar servidor iniciar
    tokio::time::sleep(tokio::time::Duration::from_millis(100)).await;

    // Fazer request
    let request = GrpcRequest {
        url: "http://[::1]:50051".to_string(),
        service: "UserService".to_string(),
        method: "GetUser".to_string(),
        message: serde_json::json!({"id": "123"}),
        metadata: None,
        call_type: GrpcCallType::Unary,
    };

    let client = GrpcClient::new(&request.url).await.unwrap();
    let response = client.execute(request).await.unwrap();

    assert!(response.success);
    assert!(response.data.is_some());

    let data = response.data.unwrap();
    assert_eq!(data["user"]["id"], "123");
}
```

### Exemplo 3: Teste E2E Completo

```typescript
test("complete gRPC workflow with real server", async ({ page }) => {
  // Configurar servidor gRPC de teste local
  // (assumindo que está rodando em background)

  await page.goto("/");

  // Criar nova request gRPC
  await page.getByRole("button", { name: /new request/i }).click();
  await page.getByRole("menuitem", { name: /grpc/i }).click();

  // Inserir proto file
  const protoFile = await fs.readFile(
    "./proto/test/user_service.proto",
    "utf-8"
  );
  await page.locator('[data-testid="proto-content"]').fill(protoFile);

  // Parse proto
  await page.getByRole("button", { name: /parse proto/i }).click();
  await page.waitForSelector(
    '[data-testid="service-select"] option[value="UserService"]'
  );

  // Selecionar service e method
  await page.selectOption('[data-testid="service-select"]', "UserService");
  await page.selectOption('[data-testid="method-select"]', "GetUser");

  // Verificar que info do método apareceu
  await expect(page.getByText(/Input Type: GetUserRequest/i)).toBeVisible();
  await expect(page.getByText(/Output Type: GetUserResponse/i)).toBeVisible();

  // Preencher URL e mensagem
  await page.fill('[data-testid="url-input"]', "grpc://localhost:50051");
  await page.fill(
    '[data-testid="message-input"]',
    JSON.stringify({ id: "123" }, null, 2)
  );

  // Enviar request
  await page.click('[data-testid="send-button"]');

  // Aguardar resposta
  await page.waitForSelector('[data-testid="response-status"]');

  // Validar resposta bem-sucedida
  await expect(page.getByTestId("response-status")).toHaveText(/200|OK/);

  const responseBody = await page
    .locator('[data-testid="response-body"]')
    .textContent();
  const response = JSON.parse(responseBody);

  expect(response).toHaveProperty("user");
  expect(response.user).toHaveProperty("id", "123");
  expect(response.user).toHaveProperty("name");
});
```

---

## 📊 Métricas de Sucesso

### Cobertura de Código

- **Target**: Mínimo 80% de cobertura em módulos gRPC
- **Critical**: 100% em proto_parser e commands

### Performance

- **Unary Call**: < 50ms (local)
- **Streaming**: < 100ms para primeira resposta
- **Proto Parsing**: < 10ms para arquivo médio (< 1KB)

### Confiabilidade

- **Zero falhas** em testes de integração
- **< 1%** de flakiness em testes E2E
- **100%** de cobertura de casos de erro

---

## ⚠️ Desafios Técnicos

### 1. Mock de Servidor gRPC

**Problema**: Tonic não tem suporte built-in para mock servers
**Solução**:

- Criar servidor gRPC real lightweight para testes
- Usar `tower-test` para mockar layers do Tonic
- Considerar `grpcmock` (biblioteca externa)

### 2. Testes de Streaming

**Problema**: Testes assíncronos com streams são complexos
**Solução**:

- Usar `tokio::test` com timeouts
- Implementar helpers para coletar stream items
- Testar com quantidades pequenas de mensagens

### 3. Proto File Compilation em CI

**Problema**: Necessário protobuf compiler no CI
**Solução**:

- Adicionar instalação de `protoc` no workflow
- Considerar commits de código gerado (trade-off)
- Usar imagem Docker com protoc pré-instalado

### 4. Testes E2E com Servidor Real

**Problema**: E2E precisa de servidor gRPC rodando
**Solução**:

- Docker Compose com servidor de teste
- Script para iniciar/parar servidor antes dos testes
- Mock de servidor com Playwright fixtures

### 5. Variação de Plataformas

**Problema**: Comportamento pode variar entre OS
**Solução**:

- CI matrix para testar em Linux, macOS, Windows
- Testes específicos de plataforma quando necessário

---

## 📅 Cronograma Estimado

| Fase                    | Duração        | Prioridade | Status      |
| ----------------------- | -------------- | ---------- | ----------- |
| 1. Infraestrutura       | 1-2 dias       | Alta       | 🔴 Pendente |
| 2. Testes Unitários     | 3-4 dias       | Alta       | 🔴 Pendente |
| 3. Testes de Integração | 3-4 dias       | Média      | 🔴 Pendente |
| 4. Testes Frontend      | 2-3 dias       | Média      | 🔴 Pendente |
| 5. Performance/Stress   | 1-2 dias       | Baixa      | 🔴 Pendente |
| 6. Segurança            | 1 dia          | Média      | 🔴 Pendente |
| **TOTAL**               | **11-16 dias** | -          | -           |

### Priorização

1. **Sprint 1** (Semana 1): Fases 1 e 2 - Infraestrutura e Unitários
2. **Sprint 2** (Semana 2): Fase 3 e 4 - Integração e Frontend
3. **Sprint 3** (Semana 3): Fases 5 e 6 - Performance e Segurança

---

## 🚀 Quick Start: Começando Hoje

### Passo 1: Adicionar Dependências (5 min)

```bash
cd src-tauri
cargo add --dev tower-test tokio-test tempfile
```

### Passo 2: Criar Primeiro Teste (15 min)

Adicionar em `src-tauri/src/grpc/proto_parser.rs`:

```rust
#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_parse_simple_proto() {
        let proto = r#"
            syntax = "proto3";
            service Echo {
                rpc Echo(EchoRequest) returns (EchoResponse);
            }
            message EchoRequest { string message = 1; }
            message EchoResponse { string message = 1; }
        "#;

        let result = ProtoParser::parse_proto_file(proto);
        assert!(result.is_ok(), "Failed to parse proto: {:?}", result.err());
    }
}
```

### Passo 3: Executar Teste (2 min)

```bash
cargo test test_parse_simple_proto
```

### Passo 4: Criar Estrutura de Arquivos (10 min)

```bash
mkdir -p proto/test
mkdir -p tests/common
touch src/grpc/test_utils.rs
touch tests/grpc_integration_tests.rs
```

### Passo 5: Adicionar Script de Testes (5 min)

No `package.json`, adicionar:

```json
{
  "scripts": {
    "test:grpc": "cargo test --manifest-path src-tauri/Cargo.toml grpc -- --nocapture"
  }
}
```

---

## 📚 Recursos e Referências

### Documentação

- [Tonic Testing Guide](https://github.com/hyperium/tonic/blob/master/examples/README.md)
- [Tower Test Utilities](https://docs.rs/tower-test/)
- [gRPC Best Practices](https://grpc.io/docs/guides/performance/)

### Exemplos

- [gRPC Testing Examples](https://github.com/grpc/grpc/tree/master/examples)
- [Tonic Examples](https://github.com/hyperium/tonic/tree/master/examples)

### Ferramentas

- [grpcurl](https://github.com/fullstorydev/grpcurl): CLI para testar gRPC
- [ghz](https://ghz.sh/): Benchmark de gRPC
- [buf](https://buf.build/): Linting e validação de proto files

---

## 🎯 Checklist de Implementação

### Backend

- [ ] Adicionar dependências de teste
- [ ] Criar proto files de teste
- [ ] Implementar test_utils.rs
- [ ] Testes proto_parser (7 casos)
- [ ] Testes client (6 casos)
- [ ] Testes reflection (4 casos)
- [ ] Testes streaming (5 casos)
- [ ] Testes commands (5 casos)
- [ ] Mock gRPC server
- [ ] Testes de integração (4 casos)
- [ ] Testes de performance (3 casos)
- [ ] Testes de segurança (4 casos)

### Frontend

- [ ] Configurar Vitest
- [ ] Testes GrpcEditor (6 casos)
- [ ] Configurar Playwright data-testids
- [ ] Teste E2E workflow completo
- [ ] Teste E2E error handling
- [ ] Teste E2E streaming

### CI/CD

- [ ] Criar workflow GitHub Actions
- [ ] Configurar cache de dependências
- [ ] Adicionar relatório de cobertura
- [ ] Configurar notificações

### Documentação

- [ ] Atualizar README com comandos de teste
- [ ] Documentar como rodar testes localmente
- [ ] Criar guia de contribuição para testes
- [ ] Adicionar badges de CI no README

---

## 🎓 Lições Aprendidas de HTTP/GraphQL

Do código existente em `http/tests.rs`, podemos aplicar:

1. **Usar MockServer** para simular servidor gRPC
2. **Estrutura AAA**: Arrange, Act, Assert clara
3. **Testes Específicos**: Um conceito por teste
4. **Nomenclatura Clara**: `test_<feature>_<scenario>_<expected>`
5. **Cobertura Completa**: Success cases + error cases

---

## 💡 Próximos Passos Imediatos

1. **Revisar este plano** com equipe
2. **Priorizar fases** conforme necessidade
3. **Começar Sprint 1** - Infraestrutura e Unitários
4. **Configurar CI/CD** paralelamente
5. **Documentar progresso** em cada fase

---

**Criado em**: ${new Date().toLocaleDateString('pt-BR')}
**Versão**: 1.0
**Status**: 🔴 Planejamento
**Responsável**: Time Solo
