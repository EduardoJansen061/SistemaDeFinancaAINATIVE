<div align="center">

# 💰 FinançasPRO

**Aplicação fullstack de gestão de finanças pessoais**

Controle receitas, despesas, investimentos e gere relatórios — tudo com uma interface moderna e responsiva.

[![Node.js](https://img.shields.io/badge/Node.js-20-339933?logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![MySQL](https://img.shields.io/badge/MySQL-8.0-4479A1?logo=mysql&logoColor=white)](https://www.mysql.com/)
[![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?logo=docker&logoColor=white)](https://docs.docker.com/compose/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

</div>

---

## 📋 Sumário

- [Sobre](#-sobre)
- [Funcionalidades](#-funcionalidades)
- [Arquitetura](#-arquitetura)
- [Tech Stack](#-tech-stack)
- [Pré-requisitos](#-pré-requisitos)
- [Instalação e Setup](#-instalação-e-setup)
- [Variáveis de Ambiente](#-variáveis-de-ambiente)
- [Rotas da API](#-rotas-da-api)
- [Estrutura do Projeto](#-estrutura-do-projeto)
- [Scripts Disponíveis](#-scripts-disponíveis)
- [Deploy em Produção](#-deploy-em-produção)
- [Licença](#-licença)

---

## 🎯 Sobre

O **FinançasPRO** é uma aplicação web completa para gerenciamento de finanças pessoais. Permite cadastrar receitas (salário, extras), controlar despesas (recorrentes e parceladas), acompanhar investimentos e visualizar relatórios com gráficos interativos — tudo com suporte a múltiplas moedas (BRL, USD, EUR) e conversão automática.

---

## ✨ Funcionalidades

| Módulo | Destaques |
|---|---|
| **🔐 Autenticação** | Registro e login com JWT, senhas com bcrypt |
| **💵 Receitas** | Cadastro por tipo (salário, extra, outros), marcação de recebimento, recorrência mensal |
| **💳 Despesas** | Categorias customizáveis, parcelas com tracking automático, dia de vencimento, status de pagamento |
| **📈 Investimentos** | Suporte a ações, cripto, renda fixa, poupança, imóveis; ticker opcional, valor atual atualizável |
| **📊 Dashboard** | Resumo financeiro mensal, cards de estatísticas, alertas inteligentes |
| **📉 Relatórios** | Gráficos interativos com Chart.js, breakdown por categoria |
| **🌍 Multi-moeda** | Valores em BRL, USD ou EUR com taxa de câmbio e conversão automática para BRL |
| **🔔 Webhooks** | Integração com n8n para automações via webhook |

---

## 🏗 Arquitetura

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Frontend   │────▶│    Nginx     │────▶│   Backend    │
│  React + Vite│     │  (Reverse   │     │  Express.js  │
│  :5173       │     │   Proxy)    │     │  :3001       │
└─────────────┘     │  :80        │     └──────┬──────┘
                    └─────────────┘            │
                                               ▼
                                        ┌─────────────┐
                                        │   MySQL 8.0  │
                                        │  :3306       │
                                        └─────────────┘
```

- **Nginx** atua como reverse proxy, com rate limiting diferenciado para rotas de autenticação e API geral
- **Backend** usa Sequelize como ORM, com Helmet, CORS e compression para segurança e performance
- **Frontend** é um SPA com React Router, validação com Zod + React Hook Form e toasts para feedback

---

## 🛠 Tech Stack

### Backend
- **Runtime:** Node.js 20 (Alpine)
- **Framework:** Express.js 4
- **ORM:** Sequelize 6
- **Banco de Dados:** MySQL 8.0
- **Autenticação:** JWT (jsonwebtoken) + bcryptjs
- **Segurança:** Helmet, CORS, express-rate-limit, express-validator
- **Logging:** Winston
- **Testes:** Jest + Supertest

### Frontend
- **Framework:** React 19
- **Bundler:** Vite 8
- **Estilização:** Tailwind CSS 4
- **Roteamento:** React Router 7
- **Gráficos:** Chart.js + react-chartjs-2
- **Formulários:** React Hook Form + Zod
- **HTTP Client:** Axios
- **Ícones:** React Icons
- **Notificações:** React Hot Toast
- **Animações:** AOS (Animate on Scroll)
- **Linter:** oxlint

### Infraestrutura
- **Containerização:** Docker + Docker Compose
- **Reverse Proxy:** Nginx (Alpine)
- **Produção:** Docker Compose separado com suporte a SSL/HTTPS

---

## 📦 Pré-requisitos

- [Docker](https://www.docker.com/) e [Docker Compose](https://docs.docker.com/compose/) instalados
- Git

> **Alternativa sem Docker:** Node.js 20+, MySQL 8.0 e npm instalados localmente.

---

## 🚀 Instalação e Setup

### 1. Clone o repositório

```bash
git clone https://github.com/EduardoJansen061/financaspro.git
cd financaspro
```

### 2. Configure as variáveis de ambiente

```bash
cp .env.example .env
```

Edite o arquivo `.env` com suas credenciais (veja a seção [Variáveis de Ambiente](#-variáveis-de-ambiente)).

### 3. Suba os containers

```bash
docker compose up -d
```

### 4. Acesse a aplicação

| Serviço | URL |
|---|---|
| **Frontend** | http://localhost:5173 |
| **API** | http://localhost:3001/api |
| **Nginx (proxy)** | http://localhost |
| **Health Check** | http://localhost:3001/api/health |

> O banco de dados é inicializado automaticamente com o schema definido em `backend/src/database/init.sql`.

---

## 🔐 Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto baseado no `.env.example`:

| Variável | Descrição | Exemplo |
|---|---|---|
| `MYSQL_ROOT_PASSWORD` | Senha root do MySQL | `rootpassword_change_me` |
| `MYSQL_DATABASE` | Nome do banco de dados | `financaspro` |
| `MYSQL_USER` | Usuário do banco | `financaspro_user` |
| `MYSQL_PASSWORD` | Senha do usuário do banco | `financaspro_pass_change_me` |
| `JWT_SECRET` | Chave secreta para JWT (mín. 32 chars) | `your_super_secret_jwt_key...` |
| `JWT_EXPIRES_IN` | Tempo de expiração do token | `7d` |
| `FRONTEND_URL` | URL do frontend (CORS) | `http://localhost:5173` |
| `VITE_API_URL` | URL da API (usada no frontend) | `http://localhost:3001/api` |
| `N8N_WEBHOOK_URL` | URL do webhook n8n (opcional) | `https://n8n.example.com/webhook/...` |
| `NODE_ENV` | Ambiente de execução | `development` |

---

## 🔌 Rotas da API

### Autenticação
| Método | Rota | Descrição |
|---|---|---|
| `POST` | `/api/auth/register` | Criar nova conta |
| `POST` | `/api/auth/login` | Fazer login |

### Receitas
| Método | Rota | Descrição |
|---|---|---|
| `GET` | `/api/incomes` | Listar receitas |
| `POST` | `/api/incomes` | Criar receita |
| `PUT` | `/api/incomes/:id` | Atualizar receita |
| `DELETE` | `/api/incomes/:id` | Remover receita |

### Despesas
| Método | Rota | Descrição |
|---|---|---|
| `GET` | `/api/expenses` | Listar despesas |
| `POST` | `/api/expenses` | Criar despesa |
| `PUT` | `/api/expenses/:id` | Atualizar despesa |
| `DELETE` | `/api/expenses/:id` | Remover despesa |

### Investimentos
| Método | Rota | Descrição |
|---|---|---|
| `GET` | `/api/investments` | Listar investimentos |
| `POST` | `/api/investments` | Criar investimento |
| `PUT` | `/api/investments/:id` | Atualizar investimento |
| `DELETE` | `/api/investments/:id` | Remover investimento |

### Outros
| Método | Rota | Descrição |
|---|---|---|
| `GET` | `/api/summary` | Resumo financeiro mensal |
| `GET` | `/api/categories` | Listar categorias de despesa |
| `POST` | `/api/categories` | Criar categoria |
| `POST` | `/api/webhooks` | Disparar webhook |
| `GET` | `/api/health` | Health check |

> 🔒 Todas as rotas (exceto auth e health) requerem token JWT no header `Authorization: Bearer <token>`.

---

## 📁 Estrutura do Projeto

```
financaspro/
├── backend/
│   ├── src/
│   │   ├── config/          # Configuração do banco (Sequelize)
│   │   ├── controllers/     # Lógica dos endpoints
│   │   ├── database/        # Script de inicialização SQL
│   │   ├── middleware/       # Auth JWT, validação, error handling
│   │   ├── models/          # Models Sequelize (User, Income, Expense, etc.)
│   │   ├── routes/          # Definição de rotas Express
│   │   ├── services/        # Lógica de negócio e integrações
│   │   ├── tests/           # Testes com Jest + Supertest
│   │   └── server.js        # Entry point da API
│   ├── Dockerfile
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── assets/          # Recursos estáticos
│   │   ├── components/      # Componentes reutilizáveis (Header, Sidebar, Modal, etc.)
│   │   ├── hooks/           # Custom hooks (useAuth, etc.)
│   │   ├── pages/           # Páginas da aplicação
│   │   │   ├── DashboardPage.jsx
│   │   │   ├── IncomesPage.jsx
│   │   │   ├── ExpensesPage.jsx
│   │   │   ├── InvestmentsPage.jsx
│   │   │   ├── ReportsPage.jsx
│   │   │   ├── LoginPage.jsx
│   │   │   └── RegisterPage.jsx
│   │   ├── services/        # Configuração Axios e chamadas à API
│   │   ├── utils/           # Funções utilitárias
│   │   ├── App.jsx          # Roteamento principal
│   │   ├── main.jsx         # Entry point React
│   │   └── index.css        # Estilos globais
│   ├── Dockerfile
│   ├── vite.config.js
│   └── package.json
│
├── nginx/
│   └── nginx.conf           # Configuração do reverse proxy
│
├── docker-compose.yml       # Ambiente de desenvolvimento
├── docker-compose.prod.yml  # Ambiente de produção (com SSL)
├── .env.example             # Template de variáveis de ambiente
├── .gitignore
└── README.md
```

---

## 📜 Scripts Disponíveis

### Backend (`/backend`)

```bash
npm run dev          # Inicia com nodemon (hot reload)
npm start            # Inicia em produção
npm test             # Executa testes
npm run test:watch   # Testes em modo watch
npm run test:coverage # Testes com relatório de cobertura
```

### Frontend (`/frontend`)

```bash
npm run dev          # Dev server Vite (HMR)
npm run build        # Build de produção
npm run preview      # Preview do build
npm run lint         # Linting com oxlint
```

---

## 🚢 Deploy em Produção

O projeto inclui um `docker-compose.prod.yml` preparado para deploy em VPS:

```bash
docker compose -f docker-compose.prod.yml up -d --build
```

**Inclui:**
- Nginx com suporte a SSL/HTTPS (porta 443)
- Certificados Let's Encrypt (monte em `./nginx/ssl/`)
- Containers com `restart: always`
- Backend em `NODE_ENV=production`

---

## 🤝 Contribuindo

1. Faça um fork do repositório
2. Crie sua branch (`git checkout -b feature/nova-funcionalidade`)
3. Commit suas mudanças (`git commit -m 'feat: adiciona nova funcionalidade'`)
4. Push para a branch (`git push origin feature/nova-funcionalidade`)
5. Abra um Pull Request

---

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

---

<div align="center">

Feito com ❤️ por **EduardoJansen061**

</div>

