# 🦕 Dino App - Backend API

Backend da aplicação educacional Dino, desenvolvido com Express.js e MySQL, seguindo as melhores práticas de arquitetura e segurança.

## 📋 Índice

- [Funcionalidades](#funcionalidades)
- [Tecnologias](#tecnologias)
- [Arquitetura](#arquitetura)
- [Instalação](#instalação)
- [Configuração](#configuração)
- [Uso](#uso)
- [API Endpoints](#api-endpoints)
- [Estrutura do Projeto](#estrutura-do-projeto)
- [Segurança](#segurança)
- [Contribuição](#contribuição)

## 🚀 Funcionalidades

### 👥 Usuários e Permissões
- ✅ Registro de usuários (Alunos e Professores)
- ✅ Autenticação JWT com refresh tokens
- ✅ Bloqueio de conta após 3 tentativas falhas
- ✅ Reset de senha via email
- ✅ Perfis de usuário com progresso
- ✅ Política de privacidade obrigatória

### 🏫 Gestão de Turmas
- ✅ Criação de turmas por professores
- ✅ Códigos únicos de ingresso (5 caracteres)
- ✅ Limite de 5 turmas por professor
- ✅ Limite de 50 alunos por turma
- ✅ Professores colaboradores
- ✅ Ingresso de alunos via código

### 📚 Atividades Educacionais
- ✅ Criação de atividades (Quiz, Enquetes)
- ✅ 5-10 questões por atividade
- ✅ 4 alternativas por questão
- ✅ Tempo limite configurável (30 min padrão)
- ✅ Até 3 tentativas por atividade
- ✅ Cálculo automático de progresso
- ✅ Atividades do app e de turmas

### 📊 Gamificação
- ✅ Sistema de progresso por conteúdo
- ✅ Progresso geral calculado automaticamente
- ✅ Barra de progresso animada (0-100%)
- ✅ Conclusão de atividades, vídeos e apostilas
- ✅ Persistência em banco de dados

### 📝 Sistema de Notas
- ✅ Criação de notas pessoais
- ✅ Vinculação a conteúdos
- ✅ Limite de 500 palavras
- ✅ Salvamento automático
- ✅ Edição e exclusão

### 📧 Comunicação
- ✅ Sistema de email integrado
- ✅ Notificações de novas atividades
- ✅ Feedback via formulário
- ✅ Emails de boas-vindas

## 🛠️ Tecnologias

- **Runtime:** Node.js 18+
- **Framework:** Express.js 4.18+
- **Banco de Dados:** MySQL 8.0+
- **Autenticação:** JWT + bcryptjs
- **Validação:** Joi
- **Email:** Nodemailer
- **Segurança:** Helmet, CORS, Rate Limiting
- **Logs:** Winston
- **Compressão:** Compression

## 🏗️ Arquitetura

```
src/
├── config/          # Configurações (DB, etc.)
├── controllers/     # Controladores da API
├── database/        # Migrações e seeds
├── middleware/      # Middlewares (auth, validation)
├── models/          # Modelos de dados
├── routes/          # Rotas da API
├── schemas/         # Schemas de validação
├── services/        # Serviços (email, etc.)
├── utils/           # Utilitários
└── server.js        # Servidor principal
```

## 📦 Instalação

### Pré-requisitos

- Node.js 18+ 
- MySQL 8.0+
- npm ou yarn

### 1. Clone o repositório

```bash
git clone <repository-url>
cd dino-app-backend
```

### 2. Instale as dependências

```bash
npm install
```

### 3. Configure o banco de dados

```bash
# Crie o banco de dados
mysql -u root -p
CREATE DATABASE dino_app CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 4. Configure as variáveis de ambiente

```bash
# Copie o arquivo de exemplo
cp env.example .env

# Edite o arquivo .env com suas configurações
nano .env
```

### 5. Execute as migrações

```bash
npm run migrate
```

### 6. Inicie o servidor

```bash
# Desenvolvimento
npm run dev

# Produção
npm start
```

## ⚙️ Configuração

### Variáveis de Ambiente

```env
# Servidor
PORT=3000
NODE_ENV=development

# Banco de Dados
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=sua_senha
DB_NAME=dino_app
DB_CONNECTION_LIMIT=10

# Segurança
JWT_SECRET=seu_jwt_secret_muito_longo_e_aleatorio
JWT_REFRESH_SECRET=seu_refresh_secret_muito_longo_e_aleatorio
JWT_EXPIRES_IN=7d
JWT_REFRESH_EXPIRES_IN=30d

# Email
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=seu_email@gmail.com
EMAIL_PASS=sua_senha_de_app
EMAIL_FROM=noreply@dinoapp.com

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
LOGIN_RATE_LIMIT_WINDOW_MS=120000
LOGIN_RATE_LIMIT_MAX_REQUESTS=5
```

## 🚀 Uso

### Scripts Disponíveis

```bash
# Desenvolvimento
npm run dev          # Inicia com nodemon

# Produção
npm start            # Inicia o servidor

# Banco de Dados
npm run migrate      # Executa migrações
npm run seed         # Executa seeds (se disponível)

# Testes
npm test             # Executa testes
```

### Estrutura do Banco de Dados

O sistema cria automaticamente as seguintes tabelas:

- `users` - Usuários (alunos e professores)
- `classes` - Turmas
- `user_classes` - Relacionamento usuário-turma
- `activities` - Atividades
- `questions` - Questões das atividades
- `activity_attempts` - Tentativas de atividades
- `attempt_answers` - Respostas das tentativas
- `contents` - Conteúdos (apostilas, vídeos)
- `progress` - Progresso dos usuários
- `notes` - Notas pessoais
- `feedback` - Feedback dos usuários
- `auth_tokens` - Tokens de autenticação
- `audit_logs` - Logs de auditoria

## 📡 API Endpoints

### Autenticação

```
POST   /api/auth/register              # Registrar usuário
POST   /api/auth/login                 # Login
POST   /api/auth/refresh-token         # Renovar token
POST   /api/auth/logout                # Logout
POST   /api/auth/request-password-reset # Solicitar reset de senha
POST   /api/auth/reset-password        # Resetar senha
GET    /api/auth/profile               # Obter perfil
PUT    /api/auth/profile               # Atualizar perfil
PUT    /api/auth/change-password       # Alterar senha
GET    /api/auth/verify-token          # Verificar token
```

### Health Check

```
GET    /health                         # Status da API
GET    /                              # Informações da API
```

## 🔒 Segurança

### Implementações de Segurança

- ✅ **Autenticação JWT** com refresh tokens
- ✅ **Criptografia de senhas** com bcrypt (cost 12)
- ✅ **Rate limiting** para prevenir ataques de força bruta
- ✅ **Helmet** para headers de segurança
- ✅ **CORS** configurado adequadamente
- ✅ **Validação de entrada** com Joi
- ✅ **Mascaramento de dados sensíveis** em logs
- ✅ **Bloqueio de conta** após tentativas falhas
- ✅ **Tokens revogáveis** no logout
- ✅ **Sanitização de dados** de entrada

### Rate Limiting

- **Geral:** 100 requisições por 15 minutos
- **Login:** 5 tentativas por 2 minutos
- **Registro:** 3 tentativas por 15 minutos
- **Reset de senha:** 3 tentativas por hora

## 📁 Estrutura do Projeto

```
dino-app-backend/
├── src/
│   ├── config/
│   │   └── database.js           # Configuração do MySQL
│   ├── controllers/
│   │   └── authController.js     # Controller de autenticação
│   ├── database/
│   │   └── migrate.js            # Migrações do banco
│   ├── middleware/
│   │   └── auth.js               # Middlewares de autenticação
│   ├── models/
│   │   ├── User.js               # Modelo de usuário
│   │   ├── Class.js              # Modelo de turma
│   │   └── Activity.js           # Modelo de atividade
│   ├── routes/
│   │   └── auth.js               # Rotas de autenticação
│   ├── schemas/
│   │   └── userSchemas.js        # Schemas de validação
│   ├── services/
│   │   └── emailService.js       # Serviço de email
│   ├── utils/
│   │   └── codeGenerator.js      # Gerador de códigos
│   └── server.js                 # Servidor principal
├── .env.example                  # Exemplo de variáveis
├── package.json                  # Dependências
├── README.md                     # Este arquivo
└── requisitos.txt               # Requisitos do projeto
```

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

## 📞 Suporte

Para suporte, envie um email para suporte@dinoapp.com ou abra uma issue no repositório.

## 🎯 Status do Projeto

- ✅ **Fase 1:** Autenticação e usuários
- ✅ **Fase 2:** Gestão de turmas
- ✅ **Fase 3:** Sistema de atividades
- 🔄 **Fase 4:** Gamificação e progresso
- ⏳ **Fase 5:** Conteúdos e notas
- ⏳ **Fase 6:** Feedback e notificações

---

**Desenvolvido com ❤️ pela equipe Dino** 