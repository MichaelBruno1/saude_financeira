# Saúde Financeira

Uma aplicação de gestão de saúde financeira pessoal **estritamente local** (Frontend SPA), executada a partir de um arquivo único `index.html` sem necessidade de servidor ou banco de dados em nuvem.

## Funcionalidades

- **Múltiplos Perfis**: Gerenciamento de perfis isolados com salários base e dados independentes.
- **Calendário Multi-Anual Dinâmico**: Visualização e lançamento de despesas em abas de anos e meses criados dinamicamente.
- **Configurações Personalizadas**: Cadastro de categorias, paleta colorida interativa e alternância entre Modo Claro e Escuro.
- **Financiamentos & Simulador de Amortização**: Controle de contratos de financiamento com aplicação de TR e Simulador SAC integrado.
- **Cartão de Crédito Parcelado**: Divisão automática de despesas parceladas distribuídas nos meses subsequentes.
- **Investimentos**: Painel de portfólio com KPIs de total investido, FGTS, reserva de emergência ideal e gráfico de alocação por categoria.
- **Planejador Financeiro**: Metas percentuais por categoria (Conservador, Equilibrado, Agressivo) com comparativo visual.
- **Persistência Local**: Salvamento automático e síncrono no LocalStorage do navegador.
- **Sincronização via CSV**: Importação e exportação incremental de perfis isolados em CSV estruturado.
- **Importação de Fatura PDF**: Extração automática de despesas de faturas de cartão via IA (requer LLM configurada).
- **Agente Financeiro**: Chat conversacional que lança e edita despesas via linguagem natural (requer LLM configurada).
- **Dashboard**: Gráficos donut e lineares responsivos com cores customizadas pelo usuário.

---

## Arquitetura

A aplicação adota o padrão **Single Page Application (SPA) em Vanilla JS**, estruturado em camadas:

| Módulo              | Arquivo              | Responsabilidade                                                   |
|---------------------|----------------------|--------------------------------------------------------------------|
| UI Controller       | `js/ui.js`           | Vinculação de eventos DOM, renderização de abas, modais e tabelas  |
| State Manager       | `js/state.js`        | Estado central em memória com padrão Observer (subscribe/notify)   |
| Storage             | `js/storage.js`      | Persistência em LocalStorage e serialização/desserialização CSV    |
| Financial Engine    | `js/engine.js`       | Motor de cálculos: parcelas, projeções e simulações de amortização |
| Charts Renderer     | `js/charts.js`       | Abstração de gráficos Chart.js (donut, linha, planejador)          |
| App Entry Point     | `js/app.js`          | Inicialização e orquestração do ciclo de vida                      |

---

## Como Executar

### Opção 1: Arquivo direto (mais simples)

Abra o arquivo `index.html` diretamente no navegador (protocolo `file:///`) clicando duas vezes sobre ele. Não requer instalação.

> **Limitação**: O Agente IA e a importação de PDF não funcionam via `file:///` por restrições de `fetch`. Para essas funcionalidades, use as opções 2 ou 3.

### Opção 2: Servidor de desenvolvimento local (npm)

```bash
# 1. Instalar dependências de desenvolvimento
npm install

# 2. Iniciar o servidor de desenvolvimento
npm run dev

# 3. Acessar em: http://localhost:3000
```

Para compilar o Tailwind CSS de produção (opcional):
```bash
npm run build:css
```

### Opção 3: Docker (sem Node.js no host)

> Requer [Docker Desktop](https://www.docker.com/products/docker-desktop/) instalado.

```bash
# 1. Compilar o CSS (requer Node.js apenas neste passo)
npm run build:css

# 2. Construir e subir o container
docker-compose up -d

# 3. Acessar em: http://localhost:8080
```

Para parar:
```bash
docker-compose down
```

> Especificação completa do Docker em [`spec/08-infrastructure/docker.md`](spec/08-infrastructure/docker.md).

---

## Persistência e Backup de Dados

Por ser uma aplicação estritamente local, todos os dados são salvos no **LocalStorage** do navegador.

> ⚠️ **Atenção**: Limpar os dados de navegação, cookies ou histórico do navegador apagará o LocalStorage e causará **perda definitiva de dados**.
>
> **Use a ferramenta "Exportar Perfil (CSV)"** no rodapé do menu lateral como mecanismo de backup físico. Recomenda-se exportar regularmente. Um banner de aviso é exibido automaticamente quando o último backup tem mais de 15 dias.

---

## Inteligência Artificial (LLM)

As funcionalidades de IA (Análise Financeira, Plano de Economia, Importação de PDF e Agente Conversacional) requerem acesso a uma LLM compatível com a API OpenAI (`/chat/completions`).

**Provedores suportados (qualquer um):**
- [Ollama](https://ollama.com/) (local, gratuito) — recomendado para uso 100% offline
- [LM Studio](https://lmstudio.ai/) (local, gratuito)
- [OpenAI API](https://platform.openai.com/) (nuvem, pago)
- [Groq](https://groq.com/) (nuvem, gratuito com limites)

**Configuração:**
Acesse a aba **Configurações** → seção **Inteligência Artificial** e preencha:
- **URL Base**: ex. `http://localhost:11434/v1` (Ollama) ou `https://api.openai.com/v1` (OpenAI)
- **Chave de API**: sua chave (ou qualquer string para provedores locais)
- **Modelo**: ex. `llama3`, `gpt-4o-mini`, `gemma3`

---

## Testes e Qualidade

```bash
# Linting do código JavaScript
npm run lint

# Testes unitários e de integração (Vitest)
npm run test
```

Os testes cobrem os módulos de State (`state.js`), Engine (`engine.js`), configuração LLM e as funcionalidades do Agente de Chat e Investimentos.

---

## Débitos Técnicos

Os débitos técnicos conhecidos do projeto estão documentados e priorizados em:
[`spec/07-quality/technical-debt.md`](spec/07-quality/technical-debt.md)

---

## Documentação Completa

A documentação técnica detalhada está organizada na pasta [`spec/`](spec/):

| Pasta                | Conteúdo                                           |
|----------------------|----------------------------------------------------|
| `01-overview/`       | Visão do produto, restrições e user stories        |
| `02-architecture/`   | Arquitetura do sistema, modelo de dados e contratos|
| `03-modules/`        | Documentação detalhada de cada módulo              |
| `04-features/`       | Especificação de funcionalidades                   |
| `05-api/`            | Contratos de API e integrações                     |
| `06-data-formats/`   | Formatos de dados (LocalStorage, CSV)              |
| `07-quality/`        | Estratégia de testes e débitos técnicos            |
| `08-infrastructure/` | Especificação de Docker e infraestrutura           |
