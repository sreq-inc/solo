# 🐛 Bugs e Melhorias - gRPC Solo Client

## 🐛 Bugs Encontrados

### 1. Discovery não funciona (Módulo 3 - Alta prioridade)

- Botão "Discover Services" não chama a API de reflection
- Apenas reutiliza serviços parseados
- Código atual em GrpcEditor.tsx linha 96-108

### 2. Parsing errors silenciosos (Módulo 3 - Alta)

- Erros de parsing apenas no console
- Sem feedback visual ao usuário
- Linha 92-93 do GrpcEditor.tsx

### 3. JSON validation não real-time (Módulo 3 - Média)

- Validação só no "Format JSON"
- Deveria validar enquanto digita

## ✨ Melhorias Necessárias

### Módulo 3: UI Improvements

1. **Parsing Error Feedback** (Alta)
   - Mostrar erros de parsing na UI
   - Toast ou mensagem inline

2. **Loading States** (Alta)
   - Loading ao parsear proto
   - Loading ao descobrir serviços
   - Loading ao enviar request

3. **Real-time JSON Validation** (Média)
   - Validar JSON enquanto digita
   - Highlight de sintaxe

4. **Reflection Real** (Alta)
   - Implementar discovery via grpc_discover_services
   - Usar URL do request

5. **Test Connection Button** (Média)
   - Testar conexão antes de enviar

6. **Metadata Editor** (Baixa)
   - Para headers/auth

7. **Schema Viewer** (Baixa)
   - Visualizar mensagens parseadas

### Módulo 2: Backend Tests

1. **Test Utils** - test_utils.rs
2. **Proto Parser Tests** - 15 casos
3. **gRPC Client Tests** - 12 casos
4. **Reflection Tests** - 5 casos
5. **Streaming Tests** - 7 casos
6. **Integration Tests** - 4 casos
