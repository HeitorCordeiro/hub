# Hub Inteligente de Recursos Educacionais

Aplicação Fullstack para gerenciamento de materiais didáticos com sugestão inteligente de descrições via IA e autenticação JWT.

## Tecnologias

| Camada | Tecnologia |
|---|---|
| Backend | PHP 8.3 + Laravel 12 |
| Frontend | Angular 21 (Standalone) — HTML/CSS próprio |
| Banco de Dados | **MySQL 8.0** |
| Autenticação | JWT (`tymon/jwt-auth`) |
| IA | Google Gemini API (com fallback mock) |
| CI | GitHub Actions |

---

## Pré-requisitos

- PHP 8.3+
- Composer
- Node.js 20+ e npm
- **MySQL 8.0+**

---

## Configuração do Banco de Dados (MySQL)

Crie o banco de dados antes de iniciar o backend:

```sql
CREATE DATABASE hub_recursos_educacionais CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

---

## Backend (Laravel)

```bash
cd backend

# Copiar e editar variáveis de ambiente
cp .env.example .env

# Editar .env com suas credenciais MySQL:
# DB_HOST=127.0.0.1
# DB_PORT=3306
# DB_DATABASE=hub_recursos_educacionais
# DB_USERNAME=seu_usuario
# DB_PASSWORD=sua_senha

# Instalar dependências
composer install

# Gerar chave da aplicação
php artisan key:generate

# Gerar secret JWT (obrigatório para autenticação)
php artisan jwt:secret

# Executar migrations
php artisan migrate

# (Opcional) Seed de usuário inicial
# php artisan db:seed

# Iniciar servidor de desenvolvimento
php artisan serve
```

O backend ficará disponível em `http://localhost:8000`.

### Credenciais de Seed (se aplicável)

Após rodar as migrations, registre um usuário em `POST /api/users/register` ou use a tela de cadastro do frontend.

---

## Frontend (Angular)

```bash
cd frontend

# Instalar dependências
npm install

# Iniciar servidor de desenvolvimento
npm start
```

O frontend ficará disponível em `http://localhost:4200`.

Ao acessar, você será redirecionado para a tela de **Login**. Utilize a tela de **Cadastro** para criar sua conta antes de fazer login.

---

## Endpoints da API

### Autenticação (públicos)

| Método | Rota | Descrição |
|---|---|---|
| `POST` | `/api/users/register` | Registrar novo usuário |
| `POST` | `/api/users/login` | Fazer login (retorna JWT) |

**Login retorna:**
```json
{
  "message": "Login realizado com sucesso.",
  "token": "<jwt_token>",
  "user": { "id": 1, "name": "Nome", "email": "email@exemplo.com" }
}
```

**Register retorna:**
```json
{
  "message": "Usuário criado com sucesso.",
  "user": { "id": 1, "name": "Nome", "email": "email@exemplo.com" }
}
```

### Rotas protegidas (requerem `Authorization: Bearer <token>`)

| Método | Rota | Descrição |
|---|---|---|
| `GET` | `/api/users` | Listar usuários |
| `GET` | `/api/resources` | Listar recursos (paginado) |
| `POST` | `/api/resources` | Criar recurso |
| `GET` | `/api/resources/{id}` | Buscar recurso |
| `PUT` | `/api/resources/{id}` | Atualizar recurso |
| `DELETE` | `/api/resources/{id}` | Excluir recurso |
| `POST` | `/api/ai/generate-description` | Smart Assist (IA) |

---

## Funcionalidades

- ✅ **Autenticação JWT** — Login e Registro com persistência de sessão
- ✅ **Rotas protegidas** — Guard no frontend + middleware JWT no backend
- ✅ **Interceptor HTTP** — Token JWT enviado automaticamente nas requisições
- ✅ **CRUD completo** de recursos educacionais com paginação
- ✅ **Smart Assist** — geração automática de descrição e tags via IA
- ✅ **Visual inspirado no vlab** — gradientes, cards brancos, CSS próprio (sem Angular Material)
- ✅ **CORS** configurado para `http://localhost:4200`
- ✅ **Health check** em `/health`

---

## CI/CD

Pipeline GitHub Actions (`.github/workflows/ci.yml`) com:
- **PHP Pint** — linter do Laravel
- **PHP Tests** — testes unitários com MySQL de serviço
- **Angular ESLint** — linter do frontend
- **Angular Build** — build de produção

---

## Variáveis de Ambiente (.env)

```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=hub_recursos_educacionais
DB_USERNAME=root
DB_PASSWORD=

GEMINI_API_KEY=sua_chave_aqui
AI_MOCK_MODE=true   # false para usar a IA real

JWT_SECRET=          # Gerado automaticamente com: php artisan jwt:secret
JWT_TTL=60           # Tempo de expiração do token em minutos
```

> ⚠️ O arquivo `.env` está no `.gitignore` e **nunca** deve ser commitado.
> ⚠️ Execute `php artisan jwt:secret` após configurar o `.env` para gerar o secret JWT.
