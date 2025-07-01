# Bibliotecas do Sistema - Melhorias Implementadas

Este diretório contém as bibliotecas principais do sistema com melhorias de autorização e organização.

## Arquivos

### api.ts
**Melhorias implementadas:**

1. **Interceptor Global de Autorização**:
   - Adiciona automaticamente o token `Bearer` em todas as requisições
   - Trata erros 401 redirecionando para login
   - Remove token inválido do localStorage

2. **API Simplificada**:
   - Removida adição manual de headers de autorização
   - Código mais limpo e consistente
   - Função `getStudents` adicionada à classesAPI

3. **Interceptors Configurados**:
   ```typescript
   // Request interceptor - adiciona token automaticamente
   api.interceptors.request.use((config) => {
     const token = localStorage.getItem('token');
     if (token) config.headers.Authorization = `Bearer ${token}`;
     return config;
   });

   // Response interceptor - trata erros 401
   api.interceptors.response.use(
     (response) => response,
     (error) => {
       if (error.response?.status === 401) {
         localStorage.removeItem('token');
         window.location.href = '/login';
       }
       return Promise.reject(error);
     }
   );
   ```

### store.ts
**Funcionalidades:**
- Gerenciamento de estado de autenticação
- Inicialização automática do usuário
- Validação de token no carregamento da aplicação

### utils.ts
**Utilitários:**
- Validação de email, senha e username
- Geração de códigos de turma
- Formatação de datas
- Utilitários para arquivos

## Benefícios das Melhorias

1. **Segurança**: Token adicionado automaticamente em todas as requisições
2. **UX**: Redirecionamento automático em caso de token expirado
3. **Manutenibilidade**: Código mais limpo e consistente
4. **Performance**: Menos código duplicado
5. **Confiabilidade**: Tratamento centralizado de erros de autorização

## Uso

```typescript
// Antes (com adição manual de token)
const response = await api.get('/classes', {
  headers: { Authorization: `Bearer ${token}` }
});

// Agora (automático)
const response = await api.get('/classes');
```

## APIs Disponíveis

- `authAPI`: Login, registro, atualização de perfil, mudança de senha
- `classesAPI`: CRUD de turmas, incluir alunos, buscar estudantes
- `contentAPI`: CRUD de conteúdo
- `activitiesAPI`: CRUD de atividades
- `notesAPI`: CRUD de notas
- `notificationAPI`: Gerenciamento de notificações
- `progressAPI`: Acompanhamento de progresso
- `feedbackAPI`: Envio de feedback 