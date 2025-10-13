# 🧪 Servidor de Teste gRPC

Para testar as funcionalidades gRPC do Solo, criamos um servidor de teste completo.

---

## 📍 Localização

O servidor de teste está em um repositório separado:

```
~/Projects/Personal/solocompany/grpc-test-server/
```

---

## 🚀 Quick Start

### 1. Iniciar o Servidor

```bash
cd ~/Projects/Personal/solocompany/grpc-test-server
docker-compose up -d
```

### 2. Verificar Status

```bash
# Teste rápido
./quick-test.sh

# Esperado: 7/7 testes passando ✅
```

### 3. Usar no Solo

1. Abra o Solo Client: `npm run tauri dev`
2. Crie nova request gRPC
3. URL: `grpc://localhost:50051`
4. Click "Discover Services" (usa reflection)
5. Selecione serviço e método
6. Send!

---

## 📋 Serviços Disponíveis

O servidor tem **5 serviços gRPC**:

1. **test.v1.Echo** - Echo básico
2. **user.v1.UserService** - CRUD + streaming
3. **auth.v1.AuthService** - Login e tokens
4. **streaming.v1.StreamingService** - Todos os tipos de streaming
5. **grpc.reflection.v1alpha.ServerReflection** - Auto-discovery

---

## 📚 Documentação Completa

Consulte o repositório do servidor para documentação detalhada:

| Documento                  | Descrição                          |
| -------------------------- | ---------------------------------- |
| **README.md**              | Overview e quick start             |
| **TESTING_GUIDE.md**       | 40+ casos de teste com grpcurl     |
| **SOLO_CLIENT_TESTING.md** | Como testar o Solo com o servidor  |
| **CHEAT_SHEET.md**         | Comandos e dados para copiar/colar |
| **INDEX.md**               | Navegação completa                 |

---

## 🎯 Testes Principais para o Solo

### Teste 1: Discovery via Reflection

1. URL: `grpc://localhost:50051`
2. Click "Discover Services"
3. Serviços aparecem automaticamente
4. ✅ Sem precisar de proto file!

### Teste 2: Unary Call

1. Service: `user.v1.UserService`
2. Method: `GetUser`
3. Message: `{"id":"user1"}`
4. ✅ Retorna: John Doe

### Teste 3: Server Streaming

1. Service: `user.v1.UserService`
2. Method: `ListUsers`
3. Call Type: **Server Streaming**
4. Message: `{"limit":3,"page":0}`
5. ✅ Retorna: 3 usuários progressivamente

### Teste 4: Autenticação

1. Service: `auth.v1.AuthService`
2. Method: `Login`
3. Message:
   ```json
   {
     "email": "jane@example.com",
     "password": "password456"
   }
   ```
4. ✅ Retorna: Token + user data

---

## 🐛 Troubleshooting

### Servidor não responde

```bash
docker-compose ps  # Verificar status
docker-compose logs  # Ver erros
docker-compose restart  # Reiniciar
```

### Solo não conecta

- ✅ Verificar URL: `grpc://localhost:50051`
- ✅ Testar com grpcurl primeiro
- ✅ Ver logs do Solo no terminal

### Testes falhando

```bash
docker-compose down -v
docker-compose up --build -d
./quick-test.sh
```

---

## 💾 Dados Seed

### Para Testes GetUser

```json
{"id": "user1"}  // John Doe (admin)
{"id": "user2"}  // Jane Smith (user)
{"id": "user3"}  // Bob Johnson (user)
```

### Para Testes Login

```json
{"email": "john@example.com", "password": "password123"}
{"email": "jane@example.com", "password": "password456"}
{"email": "bob@example.com", "password": "password789"}
```

### Para Testes ListUsers

```json
{"limit": 5, "page": 0}   // Todos os usuários
{"limit": 2, "page": 0}   // Primeiros 2
{"limit": 2, "page": 1}   // Próximos 2
```

### Para Testes ServerStream

```json
{"count": 3, "delay_ms": 100}   // 3 mensagens com delay
{"count": 10, "delay_ms": 0}    // 10 mensagens rápidas
{"count": 5, "delay_ms": 500}   // 5 mensagens lentas
```

---

## 📖 Links Úteis

- 📂 Repositório: `~/Projects/Personal/solocompany/grpc-test-server/`
- 📋 Guia completo: `grpc-test-server/SOLO_CLIENT_TESTING.md`
- 🧪 Testes: `grpc-test-server/TESTING_GUIDE.md`
- ⚡ Cheat Sheet: `grpc-test-server/CHEAT_SHEET.md`

---

## ✅ Checklist Rápido

Antes de testar o Solo:

- [ ] Servidor está rodando (`docker-compose ps`)
- [ ] Quick test passou (`./quick-test.sh`)
- [ ] Reflection funciona (`grpcurl -plaintext localhost:50051 list`)
- [ ] Solo está em dev mode (`npm run tauri dev`)

Pronto para testar! 🚀

---

**Versão:** 1.0.0
**Servidor:** grpc-test-server
**URL:** grpc://localhost:50051
