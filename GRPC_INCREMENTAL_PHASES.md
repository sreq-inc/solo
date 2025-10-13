# 📋 Plano Incremental: Desenvolvimento gRPC no Solo

**Estratégia**: Micro-fases com entregas testáveis e independentes

---

## 🎯 Princípios do Plano Incremental

1. **Micro-entregas**: Cada fase = 0.5 a 1 dia
2. **Testável**: Toda fase tem validação clara
3. **Independente**: Pode ser usada sem próximas fases
4. **Valor agregado**: Cada fase melhora algo funcional
5. **Rollback fácil**: Pode voltar atrás sem quebrar

---

## 📦 MÓDULO 1: Test Server MVP (6 fases - 3 dias)

### **Fase 1.1: Setup Básico do Servidor** (2h)

**Objetivo**: Servidor gRPC "Hello World" rodando

**Tarefas**:

- [ ] Criar repo `grpc-test-server`
- [ ] Setup Cargo.toml com dependências mínimas
- [ ] Criar proto/echo.proto simples
- [ ] main.rs: servidor básico na porta 50051

**Proto file**:

```protobuf
syntax = "proto3";
package test.v1;

service Echo {
  rpc Echo(EchoRequest) returns (EchoResponse);
}

message EchoRequest { string message = 1; }
message EchoResponse { string message = 1; }
```

**Entrega**: Servidor que responde "Hello" ao grpcurl

**Validação**:

```bash
cargo run
# Em outro terminal:
grpcurl -plaintext -d '{"message":"test"}' \
  localhost:50051 test.v1.Echo/Echo
# Esperado: {"message":"test"}
```

**Critério de Sucesso**: ✅ grpcurl funciona

---

### **Fase 1.2: Dockerizar Servidor Básico** (2h)

**Objetivo**: Servidor rodando em Docker

**Tarefas**:

- [ ] Criar Dockerfile simples
- [ ] Criar docker-compose.yml
- [ ] Adicionar health check
- [ ] Documentar comandos Docker

**Entrega**: `docker-compose up` funciona

**Validação**:

```bash
docker-compose up -d
docker-compose ps  # Status: Up
grpcurl -plaintext localhost:50051 list
# Esperado: test.v1.Echo
```

**Critério de Sucesso**: ✅ Docker funciona, grpcurl funciona

---

### **Fase 1.3: Adicionar UserService CRUD Básico** (3h)

**Objetivo**: Operações GetUser e ListUsers

**Tarefas**:

- [ ] Criar proto/user.proto (só Get e List)
- [ ] Implementar UserService com mock DB
- [ ] Adicionar 3 usuários seed
- [ ] Registrar serviço no servidor

**Proto file**:

```protobuf
service UserService {
  rpc GetUser(GetUserRequest) returns (GetUserResponse);
  rpc ListUsers(ListUsersRequest) returns (stream User);
}
```

**Entrega**: 2 endpoints funcionando

**Validação**:

```bash
# GetUser
grpcurl -plaintext -d '{"id":"user1"}' \
  localhost:50051 user.v1.UserService/GetUser

# ListUsers
grpcurl -plaintext -d '{"limit":3}' \
  localhost:50051 user.v1.UserService/ListUsers
```

**Critério de Sucesso**: ✅ Ambos retornam dados corretos

---

### **Fase 1.4: Adicionar Reflection** (2h)

**Objetivo**: Descoberta de serviços via reflection

**Tarefas**:

- [ ] Adicionar tonic-reflection ao Cargo.toml
- [ ] Habilitar reflection no servidor
- [ ] Testar descoberta

**Entrega**: Reflection funcionando

**Validação**:

```bash
grpcurl -plaintext localhost:50051 list
# Esperado:
# - grpc.reflection.v1alpha.ServerReflection
# - test.v1.Echo
# - user.v1.UserService

grpcurl -plaintext localhost:50051 describe user.v1.UserService
# Esperado: descrição completa do serviço
```

**Critério de Sucesso**: ✅ `list` e `describe` funcionam

---

### **Fase 1.5: Adicionar Autenticação Básica** (3h)

**Objetivo**: Login e validação de Bearer token

**Tarefas**:

- [ ] Criar proto/auth.proto (só Login)
- [ ] Implementar AuthService
- [ ] Criar interceptor de auth
- [ ] Mock tokens em memória

**Proto file**:

```protobuf
service AuthService {
  rpc Login(LoginRequest) returns (LoginResponse);
}
```

**Entrega**: Login funciona, requests protegidos

**Validação**:

```bash
# Login
grpcurl -plaintext -d '{"email":"john@example.com","password":"pass"}' \
  localhost:50051 auth.v1.AuthService/Login
# Retorna: {"access_token": "..."}

# Request sem token (deve falhar)
grpcurl -plaintext -d '{"id":"user1"}' \
  localhost:50051 user.v1.UserService/GetUser
# Esperado: UNAUTHENTICATED

# Request com token (deve funcionar)
grpcurl -plaintext \
  -H "authorization: Bearer <token>" \
  -d '{"id":"user1"}' \
  localhost:50051 user.v1.UserService/GetUser
# Esperado: User data
```

**Critério de Sucesso**: ✅ Auth funciona, requests protegidos

---

### **Fase 1.6: Adicionar Streaming Completo** (4h)

**Objetivo**: Server, client e bidirectional streaming

**Tarefas**:

- [ ] Criar proto/streaming.proto
- [ ] Implementar StreamingService
- [ ] Adicionar 3 tipos de streaming
- [ ] Testar cada tipo

**Proto file**:

```protobuf
service StreamingService {
  rpc ServerStream(ServerStreamRequest) returns (stream Message);
  rpc ClientStream(stream Message) returns (ClientStreamResponse);
  rpc BiStream(stream Message) returns (stream Message);
}
```

**Entrega**: Todos os tipos de streaming funcionam

**Validação**:

```bash
# Server streaming
grpcurl -plaintext -d '{"count":5}' \
  localhost:50051 streaming.v1.StreamingService/ServerStream
# Esperado: 5 mensagens

# Client/Bi streaming: testar manualmente no código
```

**Critério de Sucesso**: ✅ Server streaming funciona via grpcurl

**🎉 Checkpoint**: Servidor completo e funcional!

---

## 🧪 MÓDULO 2: Testes Automatizados Backend (8 fases - 4 dias)

### **Fase 2.1: Setup de Test Utils** (2h)

**Objetivo**: Fixtures prontos para testes

**Tarefas**:

- [ ] Verificar test_utils.rs (já criado)
- [ ] Adicionar mais fixtures
- [ ] Adicionar builders de request
- [ ] Documentar uso

**Entrega**: test_utils.rs completo

**Validação**:

```bash
cargo test grpc::test_utils
# Esperado: 9 testes passando
```

**Critério de Sucesso**: ✅ Todos os testes do test_utils passam

---

### **Fase 2.2: Testes Proto Parser - Básicos** (3h)

**Objetivo**: 5 testes fundamentais de parsing

**Tarefas**:

- [ ] test_parse_simple_proto
- [ ] test_parse_service_with_methods
- [ ] test_parse_unary_method
- [ ] test_parse_server_streaming
- [ ] test_parse_invalid_proto_fails

**Entrega**: 5 testes passando

**Validação**:

```bash
cargo test grpc::proto_parser::tests
# Esperado: 5/5 passando
```

**Critério de Sucesso**: ✅ 100% dos testes passam

---

### **Fase 2.3: Testes Proto Parser - Avançados** (3h)

**Objetivo**: 10 testes de casos complexos

**Tarefas**:

- [ ] test_parse_nested_messages
- [ ] test_parse_repeated_fields
- [ ] test_parse_optional_fields
- [ ] test_parse_map_fields
- [ ] test_parse_enum
- [ ] test_parse_oneof
- [ ] test_parse_multiple_services
- [ ] test_parse_client_streaming
- [ ] test_parse_bidirectional
- [ ] test_parse_empty_proto_fails

**Entrega**: 10 testes passando

**Validação**:

```bash
cargo test grpc::proto_parser
# Esperado: 15/15 total
```

**Critério de Sucesso**: ✅ 15 testes, 90%+ cobertura

---

### **Fase 2.4: Testes gRPC Client - Básicos** (3h)

**Objetivo**: Testes de criação e request simples

**Tarefas**:

- [ ] test_create_client_valid_url
- [ ] test_create_client_invalid_url
- [ ] test_execute_unary_request_mock
- [ ] test_execute_with_metadata
- [ ] test_connection_refused_error

**Entrega**: 5 testes de client

**Validação**:

```bash
cargo test grpc::client::tests
# Esperado: 5/5 passando
```

**Critério de Sucesso**: ✅ Cliente básico testado

---

### **Fase 2.5: Testes gRPC Client - Avançados** (3h)

**Objetivo**: Testes de erro e conversão

**Tarefas**:

- [ ] test_timeout_error
- [ ] test_invalid_message_error
- [ ] test_status_code_mapping
- [ ] test_json_to_bytes_conversion
- [ ] test_bytes_to_json_conversion
- [ ] test_metadata_creation
- [ ] test_metadata_invalid_key

**Entrega**: 7 testes adicionais

**Validação**:

```bash
cargo test grpc::client
# Esperado: 12/12 total
```

**Critério de Sucesso**: ✅ 12 testes, 85%+ cobertura

---

### **Fase 2.6: Testes Reflection** (2h)

**Objetivo**: Testes de service discovery

**Tarefas**:

- [ ] test_discover_services_success
- [ ] test_discover_services_timeout
- [ ] test_get_service_info_exists
- [ ] test_get_service_info_not_found
- [ ] test_get_method_info_exists

**Entrega**: 5 testes de reflection

**Validação**:

```bash
cargo test grpc::reflection::tests
```

**Critério de Sucesso**: ✅ Reflection testado

---

### **Fase 2.7: Testes Streaming** (4h)

**Objetivo**: Testes dos 3 tipos de streaming

**Tarefas**:

- [ ] test_server_stream_collect_all
- [ ] test_server_stream_partial
- [ ] test_server_stream_error
- [ ] test_client_stream_send_all
- [ ] test_client_stream_empty
- [ ] test_bidirectional_echo
- [ ] test_stream_cancellation

**Entrega**: 7 testes de streaming

**Validação**:

```bash
cargo test grpc::streaming::tests
```

**Critério de Sucesso**: ✅ Streaming testado

---

### **Fase 2.8: Testes de Integração** (4h)

**Objetivo**: Testes end-to-end com test server

**Tarefas**:

- [ ] Setup de test server em testes
- [ ] test_end_to_end_unary
- [ ] test_end_to_end_with_auth
- [ ] test_end_to_end_streaming
- [ ] test_end_to_end_error_handling

**Entrega**: 4 testes de integração

**Validação**:

```bash
cargo test --test grpc_integration_tests
```

**Critério de Sucesso**: ✅ E2E funcionando

**🎉 Checkpoint**: Backend totalmente testado!

---

## 🎨 MÓDULO 3: Melhorias UI (12 fases - 6 dias)

### **Fase 3.1: Validação de Proto Parsing** (2h)

**Objetivo**: Mostrar erros de parsing ao usuário

**Tarefas**:

- [ ] Adicionar try-catch no parseProtoContent
- [ ] Mostrar erro em Toast/Alert
- [ ] Highlight textarea com borda vermelha
- [ ] Adicionar mensagem de sucesso

**Entrega**: Feedback visual de parsing

**Validação Manual**:

1. Colar proto inválido
2. Click "Parse Proto"
3. Ver erro claro na UI

**Critério de Sucesso**: ✅ Erro visível e claro

---

### **Fase 3.2: Loading States** (2h)

**Objetivo**: Feedback visual de ações assíncronas

**Tarefas**:

- [ ] Adicionar estados de loading
- [ ] Botão "Parse Proto" com spinner
- [ ] Botão "Discover Services" com spinner
- [ ] Desabilitar inputs durante loading

**Entrega**: Loading states em todas as ações

**Validação Manual**:

1. Click "Parse Proto"
2. Ver spinner durante parsing
3. Botão desabilitado durante ação

**Critério de Sucesso**: ✅ Loading visível

---

### **Fase 3.3: Validação de JSON em Tempo Real** (3h)

**Objetivo**: Validar JSON da mensagem antes de enviar

**Tarefas**:

- [ ] Adicionar validação onChange no textarea
- [ ] Mostrar ✅ ou ❌ ao lado do textarea
- [ ] Desabilitar "Send" se JSON inválido
- [ ] Mostrar erro específico de JSON

**Entrega**: Validação real-time de JSON

**Validação Manual**:

1. Digitar JSON inválido: `{invalid`
2. Ver ❌ e botão "Send" desabilitado
3. Corrigir para `{"id":"1"}`
4. Ver ✅ e botão habilitado

**Critério de Sucesso**: ✅ Validação funciona

---

### **Fase 3.4: Test Connection Button** (3h)

**Objetivo**: Testar conectividade com servidor

**Tarefas**:

- [ ] Adicionar botão "Test Connection"
- [ ] Implementar health check no backend
- [ ] Mostrar status (🟢/🔴)
- [ ] Feedback de sucesso/erro

**Entrega**: Connection testing funcional

**Validação Manual**:

1. URL válida → Click "Test Connection"
2. Ver 🟢 "Connected"
3. URL inválida → Ver 🔴 "Failed to connect"

**Critério de Sucesso**: ✅ Status correto

---

### **Fase 3.5: Implementar Reflection Funcional** (3h)

**Objetivo**: Botão "Discover Services" funcionando

**Tarefas**:

- [ ] Conectar botão ao comando Tauri
- [ ] Mostrar loading durante discovery
- [ ] Popular serviços descobertos
- [ ] Feedback de erro se falhar

**Entrega**: Reflection funcionando na UI

**Validação Manual**:

1. URL do test server (reflection habilitado)
2. Click "Discover Services"
3. Ver dropdowns populados automaticamente

**Critério de Sucesso**: ✅ Discovery funciona

---

### **Fase 3.6: Metadata Editor Básico** (4h)

**Objetivo**: Adicionar custom headers além de auth

**Tarefas**:

- [ ] Criar nova tab "Metadata"
- [ ] Key-value editor (adicionar/remover)
- [ ] Validação de keys (lowercase)
- [ ] Enviar metadata nos requests

**Entrega**: Metadata customizado funcional

**Validação Manual**:

1. Tab "Metadata"
2. Adicionar: `x-custom-header: value`
3. Enviar request
4. Verificar header chegou no servidor (logs)

**Critério de Sucesso**: ✅ Metadata enviado

---

### **Fase 3.7: Schema Viewer Básico** (4h)

**Objetivo**: Mostrar estrutura das mensagens

**Tarefas**:

- [ ] Criar nova tab "Schema"
- [ ] Exibir mensagens do proto parseado
- [ ] Mostrar campos e tipos
- [ ] Indicar campos required/repeated

**Entrega**: Schema viewer funcional

**Validação Manual**:

1. Parsear proto
2. Tab "Schema"
3. Ver estrutura de GetUserRequest

**Critério de Sucesso**: ✅ Schema visível e correto

---

### **Fase 3.8: UI Especial para Server Streaming** (4h)

**Objetivo**: Mostrar mensagens incrementais

**Tarefas**:

- [ ] Badge "STREAMING" quando tipo selected
- [ ] Área de respostas em lista
- [ ] Adicionar mensagens conforme chegam
- [ ] Status: "Streaming..." → "Completed"

**Entrega**: Streaming UI diferenciado

**Validação Manual**:

1. Selecionar "Server Streaming"
2. Ver badge e UI diferente
3. Enviar request
4. Ver mensagens aparecendo incrementalmente

**Critério de Sucesso**: ✅ Streaming visível

---

### **Fase 3.9: UI para Client Streaming** (3h)

**Objetivo**: Enviar múltiplas mensagens

**Tarefas**:

- [ ] UI para adicionar múltiplas mensagens
- [ ] Lista de mensagens a enviar
- [ ] Botão "Add Message"
- [ ] Enviar stream ao clicar "Send"

**Entrega**: Client streaming UI

**Validação Manual**:

1. Selecionar "Client Streaming"
2. Adicionar 3 mensagens
3. Enviar
4. Receber resposta única

**Critério de Sucesso**: ✅ Múltiplas mensagens enviadas

---

### **Fase 3.10: UI para Bidirectional Streaming** (4h)

**Objetivo**: Chat-like interface

**Tarefas**:

- [ ] UI estilo chat
- [ ] Input para enviar mensagens
- [ ] Lista de mensagens enviadas/recebidas
- [ ] Diferenciação visual (sent/received)

**Entrega**: Bidirectional UI

**Validação Manual**:

1. Selecionar "Bidirectional"
2. Ver interface de chat
3. Enviar mensagens
4. Ver echo responses

**Critério de Sucesso**: ✅ Chat funciona

---

### **Fase 3.11: Histórico de Requests** (4h)

**Objetivo**: Salvar e reusar requests anteriores

**Tarefas**:

- [ ] Salvar cada request executado
- [ ] Lista de histórico (sidebar)
- [ ] Click para carregar request
- [ ] Limpar histórico

**Entrega**: Histórico funcional

**Validação Manual**:

1. Fazer 3 requests diferentes
2. Ver histórico na sidebar
3. Click em request anterior
4. Ver formulário preenchido

**Critério de Sucesso**: ✅ Histórico funciona

---

### **Fase 3.12: Polish e Refinamentos** (3h)

**Objetivo**: Melhorias finais de UX

**Tarefas**:

- [ ] Tooltips em botões
- [ ] Keyboard shortcuts (Ctrl+Enter = Send)
- [ ] Mensagens de sucesso mais claras
- [ ] Animações suaves
- [ ] Responsive design

**Entrega**: UI polida e profissional

**Validação Manual**:

- [ ] Testar todos os fluxos
- [ ] Verificar acessibilidade
- [ ] Testar em diferentes tamanhos de tela

**Critério de Sucesso**: ✅ UX excelente

**🎉 Checkpoint**: UI completa e intuitiva!

---

## 📚 MÓDULO 4: Documentação e CI/CD (4 fases - 2 dias)

### **Fase 4.1: README do Test Server** (2h)

**Objetivo**: Documentação completa do servidor

**Tarefas**:

- [ ] Criar README.md
- [ ] Seção "Getting Started"
- [ ] Seção "API Documentation"
- [ ] Seção "Development"
- [ ] Exemplos de uso com grpcurl

**Entrega**: README completo

**Validação**:

- [ ] Seguir README do zero
- [ ] Conseguir rodar servidor
- [ ] Conseguir testar endpoints

**Critério de Sucesso**: ✅ Qualquer dev consegue usar

---

### **Fase 4.2: Guia de Uso do Solo para gRPC** (2h)

**Objetivo**: Tutorial completo no projeto Solo

**Tarefas**:

- [ ] Criar GRPC_USER_GUIDE.md
- [ ] Step-by-step para cada funcionalidade
- [ ] Screenshots (opcional)
- [ ] Troubleshooting comum
- [ ] FAQ

**Entrega**: Guia do usuário completo

**Validação**:

- [ ] Usuário novo consegue seguir
- [ ] Todos os fluxos documentados

**Critério de Sucesso**: ✅ Self-service completo

---

### **Fase 4.3: CI/CD para Test Server** (3h)

**Objetivo**: Automação de build e testes

**Tarefas**:

- [ ] Criar .github/workflows/test-server.yml
- [ ] Build automático em push
- [ ] Testes automáticos
- [ ] Docker build e push
- [ ] Badges no README

**Entrega**: CI funcionando

**Validação**:

```bash
git push
# Ver GitHub Actions rodando
# Ver testes passando
```

**Critério de Sucesso**: ✅ CI verde

---

### **Fase 4.4: CI/CD para Solo Backend** (3h)

**Objetivo**: Testes Rust automatizados

**Tarefas**:

- [ ] Atualizar .github/workflows/rust-tests.yml
- [ ] Rodar testes gRPC
- [ ] Coverage report
- [ ] Lint (clippy + fmt)
- [ ] Badges

**Entrega**: CI completo para Rust

**Validação**:

- [ ] Push → Tests rodam
- [ ] Coverage reportado
- [ ] Lint passa

**Critério de Sucesso**: ✅ CI completo

**🎉 Checkpoint Final**: Tudo documentado e automatizado!

---

## 📊 Resumo Executivo

### **Módulo 1: Test Server MVP** (3 dias)

```
Fase 1.1 → Servidor básico          [2h] ✅ grpcurl funciona
Fase 1.2 → Docker                   [2h] ✅ Container up
Fase 1.3 → UserService CRUD         [3h] ✅ Get/List funcionam
Fase 1.4 → Reflection               [2h] ✅ Discovery funciona
Fase 1.5 → Autenticação             [3h] ✅ Auth funciona
Fase 1.6 → Streaming                [4h] ✅ Todos os tipos
                                    ─────
                                    16h = 2 dias úteis
```

### **Módulo 2: Testes Backend** (4 dias)

```
Fase 2.1 → Test utils               [2h] ✅ Fixtures prontos
Fase 2.2 → Parser básico            [3h] ✅ 5 testes
Fase 2.3 → Parser avançado          [3h] ✅ 15 testes total
Fase 2.4 → Client básico            [3h] ✅ 5 testes
Fase 2.5 → Client avançado          [3h] ✅ 12 testes total
Fase 2.6 → Reflection               [2h] ✅ 5 testes
Fase 2.7 → Streaming                [4h] ✅ 7 testes
Fase 2.8 → Integração               [4h] ✅ E2E
                                    ─────
                                    24h = 3 dias úteis
```

### **Módulo 3: UI Improvements** (6 dias)

```
Fase 3.1  → Parsing errors          [2h] ✅ Feedback visual
Fase 3.2  → Loading states          [2h] ✅ Spinners
Fase 3.3  → JSON validation         [3h] ✅ Real-time
Fase 3.4  → Test connection         [3h] ✅ Health check
Fase 3.5  → Reflection UI           [3h] ✅ Discovery
Fase 3.6  → Metadata editor         [4h] ✅ Custom headers
Fase 3.7  → Schema viewer           [4h] ✅ Proto structure
Fase 3.8  → Server streaming UI     [4h] ✅ Incremental
Fase 3.9  → Client streaming UI     [3h] ✅ Multiple msgs
Fase 3.10 → Bidirectional UI        [4h] ✅ Chat
Fase 3.11 → Request history         [4h] ✅ Reuse
Fase 3.12 → Polish                  [3h] ✅ UX++
                                    ─────
                                    39h = 5 dias úteis
```

### **Módulo 4: Docs & CI/CD** (2 dias)

```
Fase 4.1 → Server README            [2h] ✅ Docs completas
Fase 4.2 → Solo guide               [2h] ✅ Tutorial
Fase 4.3 → Server CI                [3h] ✅ Automation
Fase 4.4 → Solo CI                  [3h] ✅ Full CI
                                    ─────
                                    10h = 1.5 dias úteis
```

### **Total Geral**

```
Módulo 1: 16h (2 dias)
Módulo 2: 24h (3 dias)
Módulo 3: 39h (5 dias)
Módulo 4: 10h (1.5 dias)
─────────────────────
Total: 89h ≈ 11 dias úteis
```

---

## 🎯 Como Usar Este Plano

### **Abordagem Recomendada**

#### **Opção A: Linear (Recomendado para 1 dev)**

```
Dia 1-2:   Módulo 1 completo
Dia 3-5:   Módulo 2 completo
Dia 6-10:  Módulo 3 completo
Dia 11-12: Módulo 4 completo
```

#### **Opção B: Paralelo (Se 2+ devs)**

```
Dev 1: Módulo 1 + Módulo 2
Dev 2: Módulo 3 (após 1.1 pronto)
Dev 3: Módulo 4 (conforme necessário)
```

#### **Opção C: MVP Rápido (Priorizado)**

```
Semana 1:
- Fase 1.1, 1.2, 1.3 (servidor básico)
- Fase 3.1, 3.2, 3.3 (UI essencial)
→ Entrega: Funcionalidade básica testável

Semana 2:
- Fase 1.4, 1.5, 1.6 (features completas)
- Fase 3.4, 3.5 (conexão + discovery)
→ Entrega: Feature completa

Semana 3:
- Módulo 2 (testes)
- Resto do Módulo 3 (polish)
→ Entrega: Produção-ready
```

### **Checkpoint de Validação**

Após cada **4 fases**, pare e valide:

**Perguntas**:

- ✅ Todas as fases passaram nos critérios?
- ✅ Algo quebrou inesperadamente?
- ✅ Alguma fase tomou muito mais tempo?
- ✅ Precisa ajustar o plano?

**Ações**:

- Commit de código
- Push para branch
- Documentar aprendizados
- Ajustar próximas fases se necessário

---

## 📋 Template de Execução de Fase

Para cada fase, use este template:

```markdown
## Fase X.Y: [Nome da Fase]

### Antes de Começar

- [ ] Entendi o objetivo?
- [ ] Tenho todas as dependências?
- [ ] Ambiente está configurado?

### Durante

- [ ] Tarefa 1
- [ ] Tarefa 2
- [ ] Tarefa 3

### Validação

- [ ] Critério 1 passou
- [ ] Critério 2 passou
- [ ] Sem regressões

### Após Concluir

- [ ] Commit: `feat(grpc): fase X.Y - [nome]`
- [ ] Push (se estável)
- [ ] Atualizar checklist do módulo
- [ ] Nota de aprendizados (se houver)

### Tempo Real

- Estimado: Xh
- Real: Yh
- Diferença: +/- Zh
- Motivo: [se diferente]
```

---

## 🚀 Começando Hoje - Quick Start

### **Se você tem 2 horas hoje**:

→ Faça **Fase 1.1** (Servidor Hello World)

### **Se você tem meio dia hoje**:

→ Faça **Fases 1.1 + 1.2** (Servidor em Docker)

### **Se você tem 1 dia completo hoje**:

→ Faça **Fases 1.1, 1.2, 1.3** (Servidor com CRUD)

### **Primeiro comando a executar**:

```bash
# Criar repositório do test server
mkdir -p ~/Projects/grpc-test-server
cd ~/Projects/grpc-test-server
cargo init --name grpc-test-server
```

---

## 📝 Tracking de Progresso

### **Checklist Geral**

#### Módulo 1: Test Server

- [ ] 1.1 Servidor básico
- [ ] 1.2 Docker
- [ ] 1.3 UserService
- [ ] 1.4 Reflection
- [ ] 1.5 Auth
- [ ] 1.6 Streaming

#### Módulo 2: Testes

- [ ] 2.1 Test utils
- [ ] 2.2 Parser básico
- [ ] 2.3 Parser avançado
- [ ] 2.4 Client básico
- [ ] 2.5 Client avançado
- [ ] 2.6 Reflection tests
- [ ] 2.7 Streaming tests
- [ ] 2.8 Integration tests

#### Módulo 3: UI

- [ ] 3.1 Parsing errors
- [ ] 3.2 Loading states
- [ ] 3.3 JSON validation
- [ ] 3.4 Test connection
- [ ] 3.5 Reflection UI
- [ ] 3.6 Metadata editor
- [ ] 3.7 Schema viewer
- [ ] 3.8 Server streaming UI
- [ ] 3.9 Client streaming UI
- [ ] 3.10 Bidirectional UI
- [ ] 3.11 History
- [ ] 3.12 Polish

#### Módulo 4: Docs & CI

- [ ] 4.1 Server README
- [ ] 4.2 Solo guide
- [ ] 4.3 Server CI
- [ ] 4.4 Solo CI

### **Métrica de Progresso**

```
Total: 30 fases
Concluídas: __/30 (__ %)
Tempo estimado restante: __ dias
```

---

## 💡 Dicas para Sucesso

### **Para Fases de Código (Backend/Server)**

1. ✅ Escreva o teste primeiro (se aplicável)
2. ✅ Implemente o mínimo para passar
3. ✅ Refatore se necessário
4. ✅ Documente o código
5. ✅ Commit com mensagem clara

### **Para Fases de UI**

1. ✅ Faça wireframe rápido (papel/Excalidraw)
2. ✅ Implemente estrutura HTML/componente
3. ✅ Adicione estilos
4. ✅ Adicione lógica
5. ✅ Teste em diferentes cenários

### **Para Fases de Documentação**

1. ✅ Escreva pensando em usuário novo
2. ✅ Adicione exemplos concretos
3. ✅ Teste seguindo sua própria doc
4. ✅ Peça feedback de outra pessoa

### **Para Todas as Fases**

- 🚫 **Não pule validações**
- 🚫 **Não faça duas fases simultaneamente**
- 🚫 **Não avance se critério não passou**
- ✅ **Pause e ajuste se necessário**
- ✅ **Documente desvios do plano**

---

**Criado**: Outubro 2025
**Versão**: 1.0
**Status**: 📋 Pronto para Execução
**Próximo**: Escolher por onde começar e executar Fase 1.1
