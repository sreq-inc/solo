# 🧪 Guia Prático: Testando Solo Client com gRPC Server

**Objetivo:** Manual completo para testar todas as funcionalidades gRPC do Solo usando o grpc-test-server

**Pré-requisitos:**

- ✅ grpc-test-server rodando em `localhost:50051`
- ✅ Solo Client executando (`npm run tauri dev`)

---

## 🚀 Setup Inicial

### 1. Iniciar o Servidor gRPC

```bash
cd ~/Projects/Personal/solocompany/grpc-test-server
docker-compose up -d

# Verificar status
docker-compose ps

# Validar que está funcionando
./quick-test.sh
# Esperado: 7/7 testes passando ✅
```

### 2. Iniciar o Solo Client

```bash
cd ~/Projects/Personal/solocompany/solo
npm run tauri dev
```

A aplicação deve abrir com a interface do Solo.

---

## 📋 Cenário 1: Echo Service (Básico)

**Objetivo:** Testar a funcionalidade mais básica - um simples echo.

### Passos:

#### 1.1 Criar Nova Request gRPC

1. Click no botão `+` ou `New Request`
2. Selecione o tipo: **gRPC**
3. Nome da request: `Echo Test`

#### 1.2 Configurar URL

No campo **URL**, digite:

```
grpc://localhost:50051
```

**Nota:** Use `grpc://` não `http://`

#### 1.3 Adicionar Proto File

Na aba **Proto File Content**, cole:

```protobuf
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
```

#### 1.4 Parse Proto

1. Click no botão **Parse Proto**
2. ✅ **Esperado:** Mensagem de sucesso aparece: "✅ Found 1 service"
3. ✅ Dropdown **Service** deve mostrar: `Echo`

#### 1.5 Selecionar Service e Method

1. **Service:** Selecione `Echo`
2. **Method:** Selecione `Echo` (deve aparecer automaticamente)
3. **Call Type:** Mantenha `Unary` selecionado

**Verificação:**

- Caixa "Method Information" deve mostrar:
  - Input Type: `EchoRequest`
  - Output Type: `EchoResponse`
  - Streaming: None

#### 1.6 Preparar Mensagem

No campo **Message (JSON)**, cole:

```json
{
  "message": "Hello from Solo!"
}
```

Opcional: Click em **Format JSON** para formatar bonito.

#### 1.7 Enviar Request

1. Click no botão **Send** (grande, no topo)
2. ⏳ **Loading:** Deve mostrar indicador de carregamento
3. ✅ **Sucesso esperado!**

**Response Esperada:**

```json
{
  "message": "Hello from Solo!"
}
```

**Status:** 200 OK ou Success

### ✅ Validações do Cenário 1

- [ ] Proto foi parseado sem erros
- [ ] Service `Echo` apareceu no dropdown
- [ ] Method info está correto
- [ ] Response retornou a mesma mensagem
- [ ] Status é sucesso (200/OK)
- [ ] Tempo de resposta < 1 segundo

---

## 📋 Cenário 2: Discovery via Reflection (Sem Proto File!)

**Objetivo:** Testar auto-discovery de serviços usando gRPC Reflection.

### Passos:

#### 2.1 Criar Nova Request

1. Nova request gRPC
2. Nome: `Discovery Test`

#### 2.2 URL e Discovery

1. **URL:** `grpc://localhost:50051`
2. **NÃO** cole nenhum proto file!
3. Click no botão **Discover Services**

#### 2.3 Aguardar Discovery

1. ⏳ Botão mostra "Discovering..."
2. ⏳ Loading state ativo
3. ✅ **Sucesso esperado:** Mensagem "✅ Found X services"

#### 2.4 Verificar Serviços Descobertos

O dropdown **Service** deve mostrar:

- `auth.v1.AuthService`
- `streaming.v1.StreamingService`
- `test.v1.Echo`
- `user.v1.UserService`

**Nota:** Se aparecer "UserService" (mock), também está correto!

#### 2.5 Testar um Serviço Descoberto

1. **Service:** Selecione `user.v1.UserService`
2. **Method:** Selecione `GetUser`
3. **Message:**

```json
{
  "id": "user1"
}
```

4. Click **Send**

**Response Esperada:**

```json
{
  "user": {
    "id": "user1",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "admin",
    "createdAt": "1704067200"
  }
}
```

### ✅ Validações do Cenário 2

- [ ] Discovery funcionou sem proto file
- [ ] Múltiplos serviços foram listados
- [ ] Request com serviço descoberto funciona
- [ ] Response é válida
- [ ] Proto content mostra "// Services discovered via reflection"

---

## 📋 Cenário 3: Autenticação (Login + Token)

**Objetivo:** Testar fluxo completo de autenticação.

### Parte A: Login

#### 3.1 Criar Request de Login

1. Nova request gRPC: `Auth - Login`
2. **URL:** `grpc://localhost:50051`

#### 3.2 Proto File de Auth

Cole no campo Proto:

```protobuf
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
```

#### 3.3 Parse e Selecionar

1. **Parse Proto**
2. **Service:** `AuthService`
3. **Method:** `Login`

#### 3.4 Credenciais de Teste

**Usuário 1 (Admin):**

```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Usuário 2 (User):**

```json
{
  "email": "jane@example.com",
  "password": "password456"
}
```

**Usuário 3 (User):**

```json
{
  "email": "bob@example.com",
  "password": "password789"
}
```

#### 3.5 Enviar Login

Use credenciais do Usuário 1 e click **Send**.

**Response Esperada:**

```json
{
  "accessToken": "token_user1",
  "refreshToken": "refresh_user1",
  "expiresIn": "3600",
  "user": {
    "id": "user1",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "admin"
  }
}
```

#### 3.6 Copiar Token

1. Selecione o valor do `accessToken`: `token_user1`
2. Copie para usar depois (Ctrl+C / Cmd+C)

### Parte B: Usar Token (Futura Feature)

**Nota:** Quando o Solo suportar metadata/headers, você poderá:

1. Criar nova request para `GetUser`
2. Adicionar header: `Authorization: Bearer token_user1`
3. Fazer request autenticada

### ✅ Validações do Cenário 3

- [ ] Login bem-sucedido
- [ ] Token foi gerado
- [ ] User data retornado corretamente
- [ ] Diferentes usuários funcionam
- [ ] Credenciais inválidas retornam erro

---

## 📋 Cenário 4: Server Streaming (ListUsers)

**Objetivo:** Testar recebimento de múltiplas mensagens via streaming.

### Passos:

#### 4.1 Criar Request de Streaming

1. Nova request gRPC: `List Users Stream`
2. **URL:** `grpc://localhost:50051`

#### 4.2 Proto File com Streaming

```protobuf
syntax = "proto3";

package user.v1;

service UserService {
  rpc ListUsers(ListUsersRequest) returns (stream UserResponse);
  rpc GetUser(GetUserRequest) returns (GetUserResponse);
}

message ListUsersRequest {
  int32 limit = 1;
  int32 page = 2;
}

message UserResponse {
  User user = 1;
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
  int64 createdAt = 5;
}
```

#### 4.3 Configurar Streaming

1. **Parse Proto**
2. **Service:** `UserService`
3. **Method:** `ListUsers`
4. **Call Type:** ⚠️ **Server Streaming** (importante!)

#### 4.4 Mensagem de Paginação

**Todos os usuários:**

```json
{
  "limit": 5,
  "page": 0
}
```

**Primeiros 2:**

```json
{
  "limit": 2,
  "page": 0
}
```

**Próximos 2:**

```json
{
  "limit": 2,
  "page": 1
}
```

#### 4.5 Enviar e Observar

1. Use `{"limit": 3, "page": 0}`
2. Click **Send**
3. ⏳ Aguarde - mensagens devem chegar progressivamente

**Responses Esperadas (3 mensagens):**

```json
// Mensagem 1
{
  "user": {
    "id": "user1",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "admin"
  }
}

// Mensagem 2
{
  "user": {
    "id": "user2",
    "name": "Jane Smith",
    "email": "jane@example.com",
    "role": "user"
  }
}

// Mensagem 3
{
  "user": {
    "id": "user3",
    "name": "Bob Johnson",
    "email": "bob@example.com",
    "role": "user"
  }
}
```

### ✅ Validações do Cenário 4

- [ ] Call Type está em "Server Streaming"
- [ ] Múltiplas respostas recebidas
- [ ] Cada resposta tem um usuário diferente
- [ ] Paginação funciona corretamente
- [ ] UI atualiza conforme mensagens chegam

---

## 📋 Cenário 5: Tratamento de Erros

**Objetivo:** Verificar que erros são mostrados claramente.

### Teste 5.1: Usuário Não Encontrado

#### Setup

1. Reuse a request `Discovery Test` ou crie nova
2. **Service:** `user.v1.UserService`
3. **Method:** `GetUser`

#### Mensagem com ID Inválido

```json
{
  "id": "userXYZ"
}
```

#### Enviar e Verificar Erro

**Resultado Esperado:**

- ❌ Status: Error ou NOT_FOUND
- ❌ Mensagem: "User 'userXYZ' not found"
- ❌ UI mostra erro em vermelho

### Teste 5.2: Credenciais Inválidas

#### Setup

1. Reuse request `Auth - Login`
2. **Service:** `AuthService`
3. **Method:** `Login`

#### Credenciais Falsas

```json
{
  "email": "fake@test.com",
  "password": "wrongpass"
}
```

#### Resultado Esperado

- ❌ Status: UNAUTHENTICATED ou Error
- ❌ Mensagem: "Invalid credentials"
- ❌ Sem token retornado

### Teste 5.3: Proto File Inválido

#### Setup

1. Nova request gRPC
2. Cole proto INVÁLIDO:

```protobuf
this is not valid proto syntax!!!
```

3. Click **Parse Proto**

#### Resultado Esperado

- ❌ Mensagem de erro: "No services found in proto file" ou erro de parsing
- ❌ Toast vermelho com mensagem clara
- ❌ Sem serviços no dropdown

### ✅ Validações do Cenário 5

- [ ] Erros de usuário não encontrado são claros
- [ ] Erros de auth são descritivos
- [ ] Proto inválido mostra erro apropriado
- [ ] Todos erros têm feedback visual (vermelho)
- [ ] Mensagens de erro são úteis

---

## 📋 Cenário 6: Paginação

**Objetivo:** Testar navegação entre páginas de resultados.

### Passos:

#### 6.1 Setup

Reuse a request de `ListUsers` do Cenário 4.

#### 6.2 Página 0 (Primeiros 2)

```json
{
  "limit": 2,
  "page": 0
}
```

**Esperado:**

- user1 (John Doe)
- user2 (Jane Smith)

#### 6.3 Página 1 (Próximos 2)

```json
{
  "limit": 2,
  "page": 1
}
```

**Esperado:**

- user3 (Bob Johnson)

#### 6.4 Página 2 (Vazio)

```json
{
  "limit": 2,
  "page": 2
}
```

**Esperado:**

- Nenhuma mensagem ou lista vazia

### ✅ Validações do Cenário 6

- [ ] Paginação funciona
- [ ] Sem duplicatas entre páginas
- [ ] Ordem consistente
- [ ] Página vazia retorna corretamente

---

## 📋 Cenário 7: Múltiplos Tipos de Call

**Objetivo:** Testar todos os tipos de chamada disponíveis.

### Teste 7.1: Unary (já testado)

✅ Cenário 1 - Echo

### Teste 7.2: Server Streaming (já testado)

✅ Cenário 4 - ListUsers

### Teste 7.3: Streaming Service

#### Proto File Completo

```protobuf
syntax = "proto3";

package streaming.v1;

service StreamingService {
  rpc Echo(EchoRequest) returns (EchoResponse);
  rpc ServerStream(StreamRequest) returns (stream StreamResponse);
  rpc ClientStream(stream ClientMessage) returns (ClientStreamResponse);
  rpc BidirectionalStream(stream ChatMessage) returns (stream ChatMessage);
}

message EchoRequest {
  string message = 1;
}

message EchoResponse {
  string message = 1;
}

message StreamRequest {
  int32 count = 1;
  int32 delay_ms = 2;
}

message StreamResponse {
  int32 index = 1;
  string message = 2;
  int64 timestamp = 3;
}

message ClientMessage {
  string content = 1;
}

message ClientStreamResponse {
  int32 message_count = 1;
  string summary = 2;
}

message ChatMessage {
  string user_id = 1;
  string message = 2;
  int64 timestamp = 3;
}
```

#### Teste: ServerStream

1. **Service:** `StreamingService`
2. **Method:** `ServerStream`
3. **Call Type:** Server Streaming
4. **Message:**

```json
{
  "count": 5,
  "delay_ms": 200
}
```

**Esperado:** 5 mensagens com delay de 200ms entre elas.

### ✅ Validações do Cenário 7

- [ ] Unary funciona
- [ ] Server Streaming funciona
- [ ] UI diferencia os tipos corretamente
- [ ] Call Type seletor funciona

---

## 📊 Checklist Completo de Testes

### Funcionalidades Core

- [ ] **Parse Proto File**
  - [ ] Proto válido parseia com sucesso
  - [ ] Proto inválido mostra erro
  - [ ] Múltiplos serviços são detectados
  - [ ] Mensagens aninhadas funcionam

- [ ] **Discovery**
  - [ ] Discover Services funciona sem proto
  - [ ] Múltiplos serviços são listados
  - [ ] Serviços descobertos funcionam
  - [ ] Erro de conexão é tratado

- [ ] **Call Types**
  - [ ] Unary calls funcionam
  - [ ] Server streaming funciona
  - [ ] Client streaming (se implementado)
  - [ ] Bidirectional (se implementado)

- [ ] **UI/UX**
  - [ ] Loading states aparecem
  - [ ] Erros mostram toast vermelho
  - [ ] Sucesso mostra toast verde
  - [ ] Format JSON funciona
  - [ ] Method info é exibida

- [ ] **Error Handling**
  - [ ] Usuário não encontrado
  - [ ] Credenciais inválidas
  - [ ] Proto inválido
  - [ ] Servidor offline
  - [ ] Timeout

- [ ] **Features Avançadas**
  - [ ] Paginação
  - [ ] Metadata (se implementado)
  - [ ] Auth headers (se implementado)
  - [ ] Request history (se implementado)

---

## 🐛 Bugs Conhecidos para Reportar

Durante os testes, verifique e reporte:

### Bugs do GRPC_BUGS_IMPROVEMENTS.md

1. **JSON validation não real-time**
   - Digite JSON inválido no Message
   - Observe se há validação enquanto digita
   - ❌ Esperado: Só valida ao clicar "Format JSON"

2. **Sem Test Connection button**
   - Observe se existe botão para testar conexão
   - ❌ Esperado: Não existe (feature pendente)

3. **Sem Metadata Editor**
   - Procure onde adicionar headers
   - ❌ Esperado: Não existe interface (feature pendente)

### Novos Bugs

Se encontrar bugs não documentados, anote:

- **Descrição:** O que aconteceu
- **Passos:** Como reproduzir
- **Esperado:** O que deveria acontecer
- **Screenshot:** Se possível

---

## 🎯 Cenários de Teste Rápidos (Quick Tests)

Para testes rápidos, use estes comandos prontos:

### Quick Test 1: Echo

```
URL: grpc://localhost:50051
Service: Echo
Method: Echo
Message: {"message": "test"}
```

### Quick Test 2: GetUser

```
URL: grpc://localhost:50051
Service: UserService
Method: GetUser
Message: {"id": "user1"}
```

### Quick Test 3: Login

```
URL: grpc://localhost:50051
Service: AuthService
Method: Login
Message: {"email": "john@example.com", "password": "password123"}
```

### Quick Test 4: ListUsers (Streaming)

```
URL: grpc://localhost:50051
Service: UserService
Method: ListUsers
Call Type: Server Streaming
Message: {"limit": 3, "page": 0}
```

---

## 🔧 Troubleshooting

### Problema: "Failed to connect"

**Solução:**

```bash
# Verificar servidor
docker-compose ps

# Reiniciar se necessário
docker-compose restart

# Testar com grpcurl
grpcurl -plaintext localhost:50051 list
```

### Problema: "No services found"

**Possíveis causas:**

1. Proto file tem erro de sintaxe
2. Proto file está vazio
3. Reflection não está habilitada no servidor

**Solução:**

- Verifique o proto file
- Use Discovery para confirmar que servidor tem serviços

### Problema: "Parse failed"

**Solução:**

- Verifique sintaxe do proto
- Certifique-se de ter `syntax = "proto3";`
- Verifique que mensagens e serviços estão bem definidos

### Problema: UI não atualiza

**Solução:**

- Feche e reabra o Solo (`Cmd+Q` / `Ctrl+Q`)
- Limpe o cache (se houver opção)
- Reinicie em modo dev: `npm run tauri dev`

---

## 📝 Dados de Teste (Cheat Sheet)

### Usuários Disponíveis

```
user1: John Doe (admin)
- Email: john@example.com
- Password: password123

user2: Jane Smith (user)
- Email: jane@example.com
- Password: password456

user3: Bob Johnson (user)
- Email: bob@example.com
- Password: password789
```

### URLs

```
Servidor: grpc://localhost:50051
Web UI: http://localhost:8080 (se houver)
```

### Proto Files Úteis

Todos os proto files estão em:

```
~/Projects/Personal/solocompany/grpc-test-server/proto/
```

---

## ✅ Resultado Esperado

Após completar todos os cenários:

- ✅ 7 cenários principais testados
- ✅ Todas funcionalidades básicas validadas
- ✅ Bugs conhecidos confirmados
- ✅ Novos bugs (se houver) documentados
- ✅ Solo está pronto para uso em gRPC!

---

**Tempo estimado:** 30-45 minutos para testes completos
**Dificuldade:** Fácil/Média
**Pré-requisitos:** Servidor rodando + Solo aberto

**Próximo passo:** Reportar bugs e continuar desenvolvimento do Módulo 3! 🚀
