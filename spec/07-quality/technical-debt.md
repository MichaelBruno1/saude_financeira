# Dívidas Técnicas — Saúde Financeira

> **Spec Layer**: Quality
> **Versão**: 1.3.6
> **Última Atualização**: 2026-07-10

---

## Introdução

Este documento registra as dívidas técnicas conhecidas do projeto, priorizadas por impacto e esforço de resolução. Uma dívida técnica é uma decisão consciente de implementar uma solução sub-ótima no curto prazo, com a intenção de refatorar no futuro.

Escopo declarado: **projeto pessoal de uso local**. Questões de segurança, LGPD e acessibilidade foram conscientemente excluídas do escopo de débitos.

---

## TD-001: Módulo `ui.js` Monolítico

| Atributo     | Valor                                |
|--------------|--------------------------------------|
| **Severity** | Alta                                 |
| **Tipo**     | Manutenibilidade                     |
| **Desde**    | v0.2.0                               |
| **Status**   | Aberto                               |

### Descrição
O arquivo `js/ui.js` possui **~150 KB** e **3.432 linhas** de código. Gerencia simultaneamente: tabelas de despesas, modais, relatórios, financiamentos, configurações, análise com IA, importação de PDF, agente de chat e módulo de investimentos. Viola o Princípio da Responsabilidade Única (SRP) e é o maior ponto de risco do projeto.

### Evidência
- `js/ui.js`: 3.432 linhas, ~150 KB — aproximadamente **10x maior** que qualquer outro módulo.
- Existe um arquivo `js/ui.js.tmp` (98 KB) no repositório, sugerindo dificuldade de gerenciar a refatoração.

### Impacto
- Dificuldade extrema de encontrar funções específicas.
- Alto risco de regressão ao modificar qualquer área.
- Impossibilidade prática de testar componentes de UI de forma isolada sem `eval`.
- Os testes atuais (`agentChat.test.js`, `investments.test.js`) usam `eval(uiCode)` como workaround para o problema estrutural.

### Solução Proposta
Dividir em módulos coesos por responsabilidade:

| Módulo proposto     | Responsabilidade                                 |
|---------------------|--------------------------------------------------|
| `ui-core.js`        | Init, render dispatch, KPIs, utilitários globais |
| `ui-expenses.js`    | Tabela e modal de despesas                       |
| `ui-financing.js`   | Aba de financiamentos e simulador de amortização |
| `ui-reports.js`     | Aba de relatórios, planejador e gráficos         |
| `ui-investments.js` | Módulo de investimentos e análise de portfólio   |
| `ui-settings.js`    | Aba de configurações, categorias e LLM           |
| `ui-agent.js`       | Agente de chat financeiro e importação de PDF    |

> Pré-requisito: migrar para ES Modules (`import/export`) via TD-011.

### Esforço Estimado: Muito Alto (requer refatoração estrutural completa)

---

## TD-002: Re-renderização Total a Cada Mutação

| Atributo     | Valor                           |
|--------------|---------------------------------|
| **Severity** | Baixa/Média                     |
| **Tipo**     | Performance                     |
| **Desde**    | v0.2.0                          |
| **Status**   | **Resolvido (v1.1.3)**          |

### Resolução (v1.1.3)
- Implementada renderização seletiva/condicional via `changedKey` no State Manager.
- O método `render(state, changedKey)` analisa a chave alterada e renderiza apenas os blocos correspondentes.

---

## TD-003: Ausência de Testes de Integração e E2E Robustos

| Atributo     | Valor                              |
|--------------|------------------------------------|
| **Severity** | Média                              |
| **Tipo**     | Confiabilidade                     |
| **Desde**    | v0.1.0                             |
| **Status**   | Parcialmente resolvido (v1.2.x+)   |

### Descrição
Os testes existentes (`agentChat.test.js`, `investments.test.js`, `llmConfig.test.js`) são testes de integração que usam `eval(fs.readFileSync('js/ui.js', 'utf8'))` para carregar o módulo IIFE. Esta abordagem é frágil: qualquer erro de sintaxe no arquivo inteiro quebra todos os testes, e o mock manual do DOM é extenso e propenso a erros.

Não existem testes E2E (Playwright/Cypress).

### Impacto
- Testes que usam `eval` em arquivos de 3.400+ linhas têm custo de manutenção alto.
- Regressões visuais e de fluxo completo (adicionar despesa → exportar CSV) não são detectadas automaticamente.
- Cobertura de testes do `state.js` e `storage.js` é indireta.

### Solução Proposta
1. Migrar para ES Modules (TD-011) para eliminar a necessidade de `eval`.
2. Adicionar testes unitários diretos para `state.js` e `storage.js`.
3. Adicionar Playwright para fluxos E2E críticos:
   - Adicionar/editar/remover despesa
   - Exportar e importar CSV
   - Alternar tema e perfil

### Esforço Estimado: Alto

---

## TD-004: Tailwind CSS via CDN em Produção

| Atributo     | Valor                   |
|--------------|-------------------------|
| **Severity** | Baixa                   |
| **Tipo**     | Performance             |
| **Desde**    | v0.1.0                  |
| **Status**   | **Resolvido (v1.1.3)**  |

### Resolução (v1.1.3)
- Adicionado `@tailwindcss/cli` com script `npm run build:css` para gerar `css/tailwind.min.css`.
- CDN mantido como modo padrão para compatibilidade com execução via `file:///`.

---

## TD-005: LocalStorage como Único Backup

| Atributo     | Valor                   |
|--------------|-------------------------|
| **Severity** | Média                   |
| **Tipo**     | Confiabilidade de Dados |
| **Desde**    | v0.2.0                  |
| **Status**   | **Resolvido (v1.1.3)**  |

### Resolução (v1.1.3)
- Banner de aviso dinâmico exibido quando não há backup CSV há mais de 15 dias.
- Campo `ultimoBackup` adicionado ao estado central.

---

## TD-006: IDs de Elementos DOM Hardcoded

| Atributo     | Valor                   |
|--------------|-------------------------|
| **Severity** | Baixa                   |
| **Tipo**     | Manutenibilidade        |
| **Desde**    | v0.3.0                  |
| **Status**   | **Resolvido (v1.1.3)**  |

### Resolução (v1.1.3)
- Todos os IDs centralizados no objeto `DOM_IDS` no topo do módulo `ui.js`.

---

## TD-007: Recorrências Limitadas ao Ano de Início

| Atributo     | Valor                   |
|--------------|-------------------------|
| **Severity** | Alta                    |
| **Tipo**     | Correção Funcional      |
| **Desde**    | v0.2.0                  |
| **Status**   | **Resolvido (v1.1.4)**  |

### Resolução (v1.1.4)
- Corrigida lógica de `getInstallmentInfo` no `engine.js` para replicar recorrências em qualquer ano posterior ao de início.

---

## TD-008: Configuração LLM Hardcoded

| Atributo     | Valor                              |
|--------------|------------------------------------|
| **Severity** | Média                              |
| **Tipo**     | Usabilidade / Manutenibilidade     |
| **Desde**    | v1.1.2                             |
| **Status**   | **Resolvido (v1.1.5)**             |

### Resolução (v1.1.5)
- Formulário de configuração LLM na aba de Configurações.
- `llm_config.js` funciona apenas como fallback.

---

## TD-009: Falta de Validação no Processador de PDFs

| Atributo     | Valor                   |
|--------------|-------------------------|
| **Severity** | Média                   |
| **Tipo**     | Confiabilidade / UX     |
| **Desde**    | v1.1.3                  |
| **Status**   | Aberto                  |

### Descrição
O método `processPdfFile` em `ui.js` extrai texto de PDFs de forma textual direta. PDFs escaneados (imagem pura) resultam em texto vazio, enviando um prompt inválido à LLM com feedback de erro confuso ao usuário.

### Evidência
```js
// js/ui.js, linha ~535
if (!rawText.trim()) {
  throw new Error("Nao foi possivel extrair nenhum texto legivel deste PDF.");
}
// Erro capturado mas exibido via alert() generico:
alert(`Erro no processamento do PDF: ${err.message}`);
```

### Solução Proposta
- Validar se `rawText` possui mais de 100 caracteres antes de enviar à LLM.
- Exibir mensagem clara no modal explicando que PDFs digitalizados/escaneados não possuem suporte.
- Substituir `alert()` por notificação inline no modal de importação.

### Esforço Estimado: Baixo

---

## TD-010: Dependência de Bibliotecas via CDN

| Atributo     | Valor                              |
|--------------|------------------------------------|
| **Severity** | Baixa                              |
| **Tipo**     | Confiabilidade / Offline-first     |
| **Desde**    | v0.1.0                             |
| **Status**   | **Resolvido (v1.1.6)**             |

### Resolução (v1.1.6)
- `chart.js`, `pdf.min.js` e `pdf.worker.min.js` hospedados localmente em `public/`.
- Fonte `Outfit` ainda carregada via Google Fonts CDN (aceito para uso local).

---

## TD-011: Ausência de Sistema de Módulos (ES Modules)

| Atributo     | Valor                              |
|--------------|------------------------------------|
| **Severity** | Alta                               |
| **Tipo**     | Manutenibilidade / Testabilidade   |
| **Desde**    | v0.1.0                             |
| **Status**   | Aberto                             |

### Descrição
Todos os módulos JS usam o padrão IIFE (Immediately Invoked Function Expression) com namespace global `window.App`. Não há sistema de módulos (`import/export`). Os arquivos são carregados sequencialmente via `<script>` no `index.html` e dependem da ordem de declaração.

### Evidência
```js
// Padrão atual em todos os módulos:
window.App = window.App || {};
window.App.State = (() => { ... })();
window.App.UI = (() => { ... })();
```

```html
<!-- index.html: ordem manual e frágil de carregamento -->
<script src="js/state.js"></script>
<script src="js/storage.js"></script>
<script src="js/engine.js"></script>
<script src="js/charts.js"></script>
<script src="js/ui.js"></script>
<script src="js/app.js"></script>
```

### Impacto
- Impossibilidade de usar `import/export` — todos os módulos vivem em escopo global.
- Testes unitários requerem `eval()` ou mocks manuais do `window`.
- Qualquer erro de carregamento de um `<script>` quebra silenciosamente toda a cadeia.
- Impossibilidade de fazer tree-shaking ou bundling (Vite, Rollup) sem refatoração.

### Solução Proposta
1. Adicionar `type="module"` no `<script>` de entrada (`js/app.js`).
2. Converter cada módulo de IIFE para named exports.
3. Substituir referências a `window.App.*` por imports diretos.
4. Benefício: testes com Vitest funcionam nativamente sem `eval`.

> **Nota**: Esta dívida é pré-requisito para TD-001 (decomposição do `ui.js`).

### Esforço Estimado: Alto (impacto transversal em todos os módulos)

---

## TD-012: Arquivo `ui.js.tmp` no Repositório

| Atributo     | Valor                    |
|--------------|--------------------------|
| **Severity** | Baixa                    |
| **Tipo**     | Higiene de Repositório   |
| **Desde**    | Desconhecida             |
| **Status**   | Aberto                   |

### Descrição
Existe um arquivo `js/ui.js.tmp` (98 KB) no diretório `js/`, provavelmente artefato de uma sessão de edição ou refatoração. Arquivos `.tmp` não devem existir em repositórios versionados.

### Estrutura atual
```
js/
├── app.js      (1.2 KB)
├── charts.js   (12 KB)
├── engine.js   (12 KB)
├── state.js    (23 KB)
├── storage.js  (12 KB)
├── ui.js       (150 KB) <- producao
└── ui.js.tmp   (99 KB)  <- artefato indesejado
```

### Impacto
- Confusão sobre qual arquivo é a versão canônica.
- Risco de editar o arquivo errado por acidente.
- Polui o repositório e aumenta o tamanho do clone.

### Solução Proposta
1. Verificar se `ui.js.tmp` contém lógica ausente em `ui.js`.
2. Remover o arquivo e adicionar `*.tmp` ao `.gitignore`.

### Esforço Estimado: Muito Baixo

---

## TD-013: Logs de Debug (`console.log`) em Produção

| Atributo     | Valor               |
|--------------|---------------------|
| **Severity** | Baixa               |
| **Tipo**     | Higiene de Código   |
| **Desde**    | v0.1.0              |
| **Status**   | Aberto              |

### Descrição
O código possui múltiplas chamadas `console.log` de debug não removidas, incluindo algumas que expõem dados de configuração da LLM.

### Evidência
```js
// js/storage.js, linha 38
console.log("Storage: Gravando estado no LocalStorage. llmConfig ativa:", data.llmConfig);

// js/storage.js, linha 54
console.log("Storage: Carregado estado do LocalStorage. llmConfig recuperada:", parsed?.llmConfig);

// js/state.js, linha 666
console.log("State: Configuracao da LLM atualizada no estado central:", _state.llmConfig);
```

### Impacto
- Poluição do console do navegador durante o uso normal.
- Exposição desnecessária de dados de configuração no console.

### Solução Proposta
- Criar função utilitária `debug(msg, ...args)` ativada por flag `APP_DEBUG = true`.
- Substituir todos os `console.log` de debug pela função utilitária.
- Ajustar ESLint de `"no-console": "off"` para `"warn"` para forçar revisão futura.

### Esforço Estimado: Baixo

---

## TD-014: Lógica de Negócio de Investimentos no `ui.js`

| Atributo     | Valor                       |
|--------------|-----------------------------|
| **Severity** | Média                       |
| **Tipo**     | Manutenibilidade / DRY      |
| **Desde**    | v1.3.0                      |
| **Status**   | Aberto                      |

### Descrição
A lógica de cálculo de investimentos (total por subcategoria, reserva de emergência ideal, filtragem de aportes vs. resgates) está implementada dentro da função `renderInvestimentos` no `ui.js`. O módulo `engine.js` existe precisamente para conter lógica financeira, mas não foi estendido para suportar investimentos.

### Evidência
Lógica de negócio diretamente na função de renderização em `ui.js`:
```js
// Calculo do total investido (deveria estar em engine.js)
despesas.filter(d => d.categoria === "Investimento").reduce(...)

// Calculo da reserva de emergencia (deveria estar em engine.js)
const reservaEmergencia = 6 * (somaRecorrentes + somaFinanciamentos);
```

### Impacto
- Regra de negócio da reserva de emergência duplicada entre `ui.js` e os prompts de IA.
- Se a regra mudar (ex: de 6x para 12x), é necessário alterar múltiplos lugares.
- Impossibilidade de testar o cálculo da reserva sem carregar todo o `ui.js`.

### Solução Proposta
Adicionar ao `engine.js`:
- `calculateInvestmentSummary(despesas, perfilNome)` → total por subcategoria
- `calculateEmergencyReserve(despesas, financiamentos, perfilNome)` → valor da reserva ideal
- `getActiveInvestments(despesas, perfilNome)` → aportes e saldo líquido

### Esforço Estimado: Médio

---

## TD-015: Gerador de IDs sem Garantia de Unicidade Global

| Atributo     | Valor                                          |
|--------------|------------------------------------------------|
| **Severity** | Baixa (atual) / Média (importações em lote)   |
| **Tipo**     | Confiabilidade de Dados                        |
| **Desde**    | v0.2.0                                         |
| **Status**   | Aberto                                         |

### Descrição
Os IDs de despesas são gerados com `Date.now().toString(36) + Math.random().toString(36).substr(2, 5)`. Colisão pode ocorrer em importações CSV em lote (múltiplas linhas no mesmo millisegundo).

### Evidência
```js
// js/storage.js, linha 245 — dentro de loop for(let i = 1; ...)
id: Date.now().toString(36) + Math.random().toString(36).substr(2, 5) + i,
```
O índice `i` é concatenado como mitigação, mas não garante unicidade ao mesclar múltiplos CSVs.

### Solução Proposta
Substituir por `crypto.randomUUID()` (nativo nos navegadores modernos):
```js
id: crypto.randomUUID()
```

### Esforço Estimado: Muito Baixo

---

## TD-016: Ausência de Suporte a Docker / docker-compose

| Atributo     | Valor                      |
|--------------|----------------------------|
| **Severity** | Média                      |
| **Tipo**     | Portabilidade / DevEx      |
| **Desde**    | v0.1.0                     |
| **Status**   | **Resolvido (v1.3.7)**     |

### Descrição
O projeto não possui configuração Docker. Para executar, o usuário precisa ter Node.js e npm instalados localmente. Isso cria dependência no ambiente do host e dificulta a portabilidade entre máquinas e dispositivos.

### Impacto
- Necessidade de instalar Node.js localmente para desenvolvimento.
- Inconsistência entre ambientes caso a versão do Node.js seja diferente.
- Impossibilidade de executar em ambientes sem npm (ex: NAS doméstico, Raspberry Pi).

### Solução Proposta
Ver especificação detalhada em: `spec/08-infrastructure/docker.md`

**Resumo:**
- `Dockerfile` usando imagem `nginx:alpine` para servir os arquivos estáticos.
- `docker-compose.yml` com serviço único expondo porta `8080`.
- `.dockerignore` excluindo `node_modules`, arquivos de desenvolvimento e `.tmp`.
- O `npm run build:css` é executado antes do build (ou em stage multi-stage opcional).

**Uso pós-implementação:**
```bash
docker-compose up -d
# Acessar em: http://localhost:8080
```

### Esforço Estimado: Baixo

---

## Resumo Executivo

| ID     | Dívida                                         | Severity    | Status                   | Esforço      |
|--------|------------------------------------------------|-------------|--------------------------|--------------|
| TD-001 | `ui.js` monolítico (150KB / 3.432 linhas)      | Alta        | **Aberto**               | Muito Alto   |
| TD-002 | Re-renderização total                          | Baixa/Média | Resolvido (v1.1.3)       | —            |
| TD-003 | Testes com `eval`, sem E2E                     | Média       | Parcialmente resolvido   | Alto         |
| TD-004 | Tailwind via CDN                               | Baixa       | Resolvido (v1.1.3)       | —            |
| TD-005 | LocalStorage como único backup                 | Média       | Resolvido (v1.1.3)       | —            |
| TD-006 | IDs DOM hardcoded                              | Baixa       | Resolvido (v1.1.3)       | —            |
| TD-007 | Recorrências limitadas ao ano de início        | Alta        | Resolvido (v1.1.4)       | —            |
| TD-008 | Configuração LLM hardcoded                     | Média       | Resolvido (v1.1.5)       | —            |
| TD-009 | Falta de validação no processador de PDFs      | Média       | **Aberto**               | Baixo        |
| TD-010 | Dependência de bibliotecas via CDN             | Baixa       | Resolvido (v1.1.6)       | —            |
| TD-011 | Ausência de ES Modules                         | Alta        | **Aberto**               | Alto         |
| TD-012 | Arquivo `ui.js.tmp` no repositório             | Baixa       | **Aberto**               | Muito Baixo  |
| TD-013 | `console.log` de debug em produção             | Baixa       | **Aberto**               | Baixo        |
| TD-014 | Lógica de investimentos misturada no `ui.js`   | Média       | **Aberto**               | Médio        |
| TD-015 | Gerador de IDs sem unicidade global garantida  | Baixa/Média | **Aberto**               | Muito Baixo  |
| TD-016 | Ausência de suporte Docker / docker-compose    | Média       | Resolvido (v1.3.7)       | —            |

### Priorização dos Débitos Abertos

**Alta Severidade / Alto Esforço** — Fazer quando houver capacidade:
- TD-001: `ui.js` monolítico
- TD-011: ES Modules (pré-requisito de TD-001 e TD-003)

**Média Severidade / Baixo Esforço** — Quick wins:
- TD-009: Validação de PDF com feedback amigável
- TD-014: Extrair lógica de investimentos para `engine.js`

**Baixa Severidade / Esforço Mínimo** — Fazer quando conveniente:
- TD-012: Remover `ui.js.tmp` e adicionar ao `.gitignore`
- TD-013: Limpar `console.log` de debug
- TD-015: Substituir gerador de ID por `crypto.randomUUID()`
