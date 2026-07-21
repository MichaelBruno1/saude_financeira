# Saúde Financeira

Uma aplicação full-stack de **gestão de saúde financeira pessoal** com arquitetura cliente-servidor (Go + PostgreSQL) servida via Docker Compose, com frontend em Vanilla JS/HTML.

> **Evolução**: O projeto foi migrado de uma SPA frontend-only (LocalStorage) para uma arquitetura cliente-servidor completa, mantendo compatibilidade retroativa via fluxo de migração de dados do LocalStorage para o PostgreSQL.

---

## Funcionalidades

- **Múltiplos Perfis**: Perfis financeiros isolados com salários base e dados independentes.
- **Calendário Multi-Anual Dinâmico**: Lançamento de despesas em abas de anos e meses criados dinamicamente.
- **Financiamentos & Simulador de Amortização**: Controle de contratos SAC/PRICE com aplicação de TR.
- **Cartão de Crédito Parcelado**: Divisão automática de despesas parceladas nos meses subsequentes.
- **Investimentos**: Painel de portfólio com KPIs de total investido, FGTS, reserva de emergência e gráfico de alocação.
- **Metas Financeiras**: Metas com prioridade, valor target calculado sequencialmente e fluxo de compra.
- **Planejador Financeiro**: Limites percentuais por categoria (Conservador, Equilibrado, Agressivo).
- **Sincronização via CSV**: Importação e exportação incremental por perfil.
- **Importação de Fatura PDF**: Extração de despesas de faturas via IA (proxy seguro de LLM no backend).
- **Agente Financeiro**: Chat conversacional que lança despesas via linguagem natural.
- **Migração do LocalStorage**: Banner de migração para importar dados existentes do navegador para o banco de dados.
- **Dashboard**: Gráficos donut e lineares responsivos com cores customizadas.

---

## Arquitetura

### Stack

| Camada      | Tecnologia                                     |
|-------------|------------------------------------------------|
| Frontend    | HTML + Vanilla JS (módulos ES6)                |
| Servidor    | Go 1.22 (`net/http`)                           |
| Banco       | PostgreSQL 15                                  |
| Migração DB | `golang-migrate/migrate`                       |
| Deploy      | Docker Compose (3 containers)                  |
| Proxy       | Nginx (serve frontend + proxy reverso → Go)    |

### Estrutura de Containers

```
nginx (:80)  ──► frontend/  (HTML/JS/CSS estáticos)
              └─► /api/v1/  ──► go-api (:8081) ──► postgres (:5432)
```

### Estrutura do Backend (Go)

```
backend/
├── cmd/server/           # Ponto de entrada (main.go + router.go)
├── internal/
│   ├── application/
│   │   ├── dto/          # Data Transfer Objects
│   │   └── usecase/      # Lógica de negócio (casos de uso)
│   ├── domain/
│   │   ├── entity/       # Entidades com validação
│   │   ├── errors/       # Erros de domínio tipados
│   │   └── repository/   # Interfaces de repositório
│   └── infrastructure/
│       ├── config/       # Configuração via variáveis de ambiente
│       ├── http/
│       │   ├── handler/  # Handlers HTTP
│       │   └── middleware/ # CORS, logging, recuperação de pânico
│       ├── llm/          # Cliente LLM (proxy para OpenAI/Groq/Gemini)
│       └── persistence/postgres/ # Implementação PostgreSQL
├── migrations/           # Arquivos SQL de migração
└── Dockerfile
```

### Módulos do Frontend

| Módulo            | Arquivo            | Responsabilidade                                          |
|-------------------|--------------------|-----------------------------------------------------------|
| API Client        | `js/api-client.js` | Chamadas HTTP ao backend com retry e backoff              |
| State Manager     | `js/state.js`      | Estado central em memória, observable, com fallback local |
| UI Controller     | `js/ui.js`         | Eventos DOM, renderização, modais e tabelas               |
| Financial Engine  | `js/engine.js`     | Motor de cálculos: parcelas, projeções SAC/PRICE          |
| Charts Renderer   | `js/charts.js`     | Abstração Chart.js (donut, linha, planejador)             |
| App Entry Point   | `js/app.js`        | Inicialização e ciclo de vida                             |

---

## Pré-requisitos

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (inclui Docker Compose)
- **Opcional** (para desenvolvimento local do backend): Go 1.22+

---

## Como Executar

### Produção via Docker Compose (recomendado)

```bash
# Clone o repositório
git clone <URL_DO_REPO>
cd saude_financeira

# Suba o stack completo (primeiro start pode levar ~1 min para build)
docker compose up -d --build

# Acesse no navegador
# http://localhost:80
```

#### Variáveis de Ambiente (opcionais)

Crie um arquivo `.env` na raiz (copiado de `.env.example`):

```env
# Banco de dados (use os padrões ou customize)
POSTGRES_USER=saude
POSTGRES_PASSWORD=saude123
POSTGRES_DB=saude_financeira

# LLM (opcional — necessário para Agente IA e importação PDF)
LLM_PROVIDER=openai          # openai | groq | gemini
LLM_API_KEY=sk-...
LLM_MODEL=gpt-4o-mini
```

#### Comandos Úteis

```bash
# Ver logs do backend
docker compose logs -f api

# Parar os containers
docker compose down

# Resetar banco de dados (apaga todos os dados)
docker compose down -v && docker compose up -d --build

# Rodar migrations manualmente
docker compose exec api migrate -path /app/migrations -database "postgres://..." up
```

---

## Desenvolvimento Local (sem Docker)

### Backend (Go)

```bash
cd backend

# Instalar dependências
go mod download

# Rodar o servidor (requer PostgreSQL local rodando na porta 5432)
go run ./cmd/server/

# Variáveis de ambiente necessárias
$env:DATABASE_URL="postgres://saude:saude123@localhost:5432/saude_financeira?sslmode=disable"
$env:PORT="8081"
$env:UPLOADS_PATH="./uploads"
```

### Frontend

```bash
cd frontend

# Instalar dependências de teste
npm install

# Iniciar servidor de desenvolvimento
npm run dev
# → http://localhost:3000
```

---

## Testes

### Frontend (Vitest)

```bash
cd frontend
npm run test

# Resultado esperado:
# 8 suítes de teste, 23 testes — todos passando ✓
```

### Backend (Go)

```bash
cd backend

# Testes unitários e de handler (não requerem banco)
go test ./internal/application/usecase/... ./internal/domain/entity/... ./internal/infrastructure/http/handler/... ./internal/infrastructure/http/middleware/...

# Testes de integração (requerem PostgreSQL na porta 5432)
go test ./internal/infrastructure/persistence/postgres/...

# Todos os testes (com cobertura)
go test -cover ./...
```

#### Cobertura por Pacote

| Pacote                                   | Cobertura |
|------------------------------------------|-----------|
| `domain/entity` (validações)             | ~64%      |
| `application/usecase` (casos de uso)     | ~48-80%   |
| `infrastructure/http/handler` (handlers) | ~47%      |
| `infrastructure/http/middleware`         | ~92%      |
| `infrastructure/persistence/postgres`*   | ~44%      |

> *Tests de integração postgres exigem banco de dados ativo e são saltados automaticamente se indisponível.

---

## API Reference

Base URL: `http://localhost:80/api/v1`

### Perfis

| Método | Endpoint                        | Descrição                  |
|--------|---------------------------------|----------------------------|
| GET    | `/perfis`                       | Listar todos os perfis      |
| POST   | `/perfis`                       | Criar novo perfil           |
| PUT    | `/perfis/{id}/salario`          | Atualizar salário           |
| PUT    | `/perfis/{id}/fgts`             | Atualizar FGTS              |
| DELETE | `/perfis/{id}`                  | Remover perfil              |

### Despesas

| Método | Endpoint                              | Descrição                        |
|--------|---------------------------------------|----------------------------------|
| GET    | `/perfis/{pid}/despesas`              | Listar despesas do perfil        |
| POST   | `/perfis/{pid}/despesas`              | Criar despesa                    |
| POST   | `/perfis/{pid}/despesas/bulk`         | Criar múltiplas despesas         |
| PUT    | `/despesas/{id}`                      | Atualizar despesa                |
| DELETE | `/despesas/{id}`                      | Remover despesa                  |

### Financiamentos

| Método | Endpoint                                 | Descrição                         |
|--------|------------------------------------------|-----------------------------------|
| GET    | `/perfis/{pid}/financiamentos`           | Listar financiamentos do perfil   |
| POST   | `/perfis/{pid}/financiamentos`           | Criar financiamento               |
| PUT    | `/financiamentos/{id}`                   | Atualizar financiamento           |
| DELETE | `/financiamentos/{id}`                   | Remover financiamento             |

### Metas

| Método | Endpoint                                 | Descrição                        |
|--------|------------------------------------------|----------------------------------|
| GET    | `/perfis/{pid}/metas`                    | Listar metas do perfil           |
| POST   | `/perfis/{pid}/metas`                    | Criar meta                       |
| PUT    | `/metas/{id}`                            | Atualizar meta                   |
| DELETE | `/metas/{id}`                            | Remover meta                     |
| POST   | `/metas/{id}/comprar`                    | Marcar como comprada             |
| PUT    | `/perfis/{pid}/metas/reordenar`          | Reordenar prioridades            |
| PUT    | `/perfis/{pid}/metas/targets`            | Atualizar valores target         |

### Categorias

| Método | Endpoint                                      | Descrição                            |
|--------|-----------------------------------------------|--------------------------------------|
| GET    | `/categorias`                                 | Listar categorias                    |
| POST   | `/categorias`                                 | Criar categoria                      |
| PUT    | `/categorias/{id}/cor`                        | Atualizar cor da categoria           |
| GET    | `/categorias/investimento`                    | Listar categorias de investimento    |
| POST   | `/categorias/investimento`                    | Criar categoria de investimento      |

### Outros

| Método | Endpoint                       | Descrição                                      |
|--------|--------------------------------|------------------------------------------------|
| GET    | `/state`                       | Estado completo do banco (hidratação frontend) |
| POST   | `/migration/import-state`      | Importar estado do LocalStorage                |
| GET    | `/csv/{pid}`                   | Exportar CSV do perfil                         |
| POST   | `/csv/import`                  | Importar CSV (upsert por perfil)               |
| POST   | `/llm/proxy`                   | Proxy seguro para LLM configurada              |
| GET    | `/settings`                    | Obter configurações                            |
| PUT    | `/settings/{key}`              | Atualizar configuração                         |
| GET    | `/health`                      | Status de saúde da API                         |

---

## Migração do LocalStorage para o Banco de Dados

Usuários vindos da versão anterior (SPA) verão automaticamente um **banner de migração** no topo do app após o primeiro acesso. O banner só aparece quando:
1. Existem dados salvos no LocalStorage do navegador; **E**
2. O banco de dados ainda não possui perfis cadastrados.

**Processo:**
1. Clique em **"Migrar dados"** no banner.
2. O frontend serializa o estado completo do LocalStorage.
3. O backend importa todos os perfis, despesas, financiamentos, metas e categorias.
4. As fotos de metas referenciadas localmente são preservadas no diretório de uploads.
5. Após a migração bem-sucedida, o LocalStorage é limpo e o banner desaparece.

---

## Licença

MIT
