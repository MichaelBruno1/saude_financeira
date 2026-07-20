# Prompt — Retomar Implementação da Refatoração

Você é um Engenheiro de Software Sênior retomando a implementação de uma refatoração que já está em andamento.

---

## Contexto

O projeto **Saúde Financeira** está sendo refatorado de uma SPA frontend-only para uma arquitetura cliente-servidor (Go + PostgreSQL + Docker Compose).

Existe uma especificação técnica completa e um roadmap de 11 etapas.

---

## Antes de Qualquer Coisa

Execute estas ações de diagnóstico para entender o estado atual:

### 1. Leia a especificação

```
Arquivo: docs/implementation_plan.md
```

Leia a **Fase 10 — Roadmap de Implementação** para entender as 11 etapas e seus critérios de aceite.

### 2. Identifique o progresso atual

Verifique quais arquivos já existem e o que já foi implementado:

```bash
# Estrutura do backend
find backend/ -type f -name "*.go" 2>/dev/null | head -50
ls backend/migrations/*.sql 2>/dev/null

# Docker
cat docker-compose.yml
ls backend/Dockerfile 2>/dev/null

# Frontend API Client
ls js/api-client.js 2>/dev/null

# Verificar se o projeto Go compila
cd backend && go build ./... 2>&1 | head -20

# Verificar se Docker sobe
docker compose ps 2>/dev/null

# Verificar se testes passam
cd backend && go test ./... 2>&1 | tail -20
```

### 3. Determine a etapa atual

Com base nos arquivos existentes e no que compila/funciona, identifique:
- Qual foi a **última etapa completada** (todos os critérios atendidos)
- Qual é a **etapa atual** (em andamento ou próxima a iniciar)
- Se há **problemas pendentes** (erros de compilação, testes falhando, etc.)

### 4. Reporte o diagnóstico

Antes de continuar implementando, reporte ao usuário:

```
## Diagnóstico da Refatoração

**Última etapa completa**: Etapa N — [nome]
**Etapa atual**: Etapa N+1 — [nome]
**Status**: [Em andamento / Não iniciada]

### Arquivos existentes:
- [lista]

### Problemas encontrados:
- [lista, se houver]

### Próximos passos:
- [o que será implementado agora]
```

---

## Regras para Retomada

1. **Não refaça trabalho já feito**. Se uma etapa está completa e funcional, pule para a próxima.

2. **Se uma etapa está parcialmente implementada**, complete-a antes de avançar. Não pule etapas incompletas.

3. **Se encontrar bugs** no trabalho anterior, corrija-os antes de avançar.

4. **Se encontrar divergências** entre o código existente e a especificação, priorize a especificação. Documente a correção.

5. **Mantenha o padrão**: commits atômicos, testes por etapa, checklist validado.

---

## Decisões Já Definidas (não altere)

- Cálculos ficam no frontend (engine.js)
- LLM passa pelo backend como proxy (8 endpoints)
- Fotos de metas: upload → disco, URL → banco
- Chat history não é persistido
- Sem autenticação na V1
- UUID como PK
- Nginx reverse proxy

---

## Referência Rápida das Etapas

| # | Etapa | Arquivos-chave |
|---|-------|---------------|
| 1 | Setup Go + Docker | `cmd/server/main.go`, `Dockerfile`, `docker-compose.yml` |
| 2 | Migrations | `migrations/001_*.sql` a `008_*.sql` |
| 3 | Domain Layer | `internal/domain/entity/*.go`, `repository/*.go`, `errors/*.go` |
| 4 | Repos PostgreSQL | `internal/infrastructure/persistence/postgres/*.go` |
| 5 | Use Cases | `internal/application/usecase/*.go`, `dto/*.go` |
| 6 | HTTP + LLM + Uploads | `internal/infrastructure/http/handler/*.go`, `llm/client.go` |
| 7 | Migração | `usecase/migration_usecase.go`, `handler/migration_handler.go` |
| 8 | Frontend API Client | `js/api-client.js`, mudanças em `app.js`, `storage.js`, `ui-agent.js` |
| 9 | Migração Frontend | Banner + lógica em `app.js` |
| 10 | Docker Final | `nginx.conf`, volumes, health checks |
| 11 | Testes + Docs | Cobertura > 80%, smoke tests, README |

---

## Início

Execute o diagnóstico descrito acima e reporte o estado atual ao usuário. Depois, continue a implementação a partir da etapa pendente.
