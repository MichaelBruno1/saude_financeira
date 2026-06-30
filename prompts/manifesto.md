# MANIFESTO - SISTEMA DE SAÚDE FINANCEIRA PESLOAL LOCAL

## 1. PROJETO ORIGINAL
Aplicação de saúde financeira pessoal estritamente cliente (Frontend local) executada por um arquivo único `index.html`. Permite gestão de múltiplos perfis de usuários, salários e gastos por abas mensais, classificação em categorias, compras parceladas no cartão de crédito, salvamento automático em LocalStorage e sincronização bidirecional por arquivo CSV (importação/exportação). Inclui dashboard com gráficos de projeções financeiras.

## 2. ARQUITETURA
Padrão SPA (Single Page Application) em Vanilla JS moderno estruturado em camadas:
* **UI/HTML**: `index.html` e `css/style.css`.
* **State Manager (`js/state.js`)**: Controle reativo de perfis, despesas e salário.
* **Storage (`js/storage.js`)**: Sincronização em LocalStorage e gerador/parser de arquivo CSV.
* **Financial Engine (`js/engine.js`)**: Motor matemático de parcelas, saldos e projeções.
* **Renderers (`js/ui.js` & `js/charts.js`)**: Pintam o DOM e renderizam gráficos do Chart.js.

## 3. TECNOLOGIAS
* **Linguagem**: JavaScript (ES6+ Vanilla) — Sem frameworks para portabilidade absoluta.
* **Estilização**: Tailwind CSS (via CDN offline-friendly ou arquivos locais em `lib/`).
* **Gráficos**: Chart.js (via CDN ou arquivo local em `lib/`).
* **Persistência**: LocalStorage + download/upload de CSV para sincronização.
* **Dev Tools**: Node.js, `lite-server`, `eslint` e `vitest` para testes unitários lógicos.

## 4. MILESTONES
* **Milestone 1**: Projeto Inicial e Estrutura Física (Prompt 001)
* **Milestone 2**: Core de Estado e Armazenamento CSV/LocalStorage (Prompt 002)
* **Milestone 3**: UI de Perfis, Abas Mensais e Salários (Prompt 003)
* **Milestone 4**: CRUD de Gastos Categorizados e Cartão Parcelado (Prompt 004)
* **Milestone 5**: Motor de Cálculos e Projeções Financeiras (Prompt 005)
* **Milestone 6**: Dashboard de Relatórios e Gráficos do Chart.js (Prompt 006)
* **Milestone 7**: Testes Unitários com Vitest, Hardening e Entrega (Prompt 007)

## 5. QUANTIDADE DE PROMPTS
Total de **7 prompts sequenciais**, respeitando os limites seguros de modificações por arquivo.

## 6. DEPENDÊNCIAS
* Desenvolvimento: `lite-server` (v2.6.4), `vitest` (v1.6.0), `eslint` (v9.0.0).
* Produção: Nenhuma. Execução direta via clique duplo no `index.html`.

## 7. STATUS
* **Status**: Planeamento (Fase 0 concluída). Aguardando execução do Prompt 001.

## 8. ESTIMATIVAS TOTAIS
* **Tokens Estimados**: ~28.000 tokens totais. Média de 4.000 tokens por prompt.
* **Horas de Desenvolvimento**: 28 horas (4 horas por etapa).
* **Custo Computacional**: Muito baixo (API otimizada, contexto estrito).

## 9. ROADMAP
1. Setup inicial de diretórios, package.json, linter e index.html base.
2. Implementação do State Manager e parser bidirecional de CSV.
3. Interface baseada em abas de Jan a Dez e controle de múltiplos perfis.
4. Formulário e tabelas de CRUD de despesas com detecção de parcelamento de cartão.
5. Escrita do motor de distribuição de despesas temporais e saldos líquidos.
6. Integração de gráficos interativos (pizza e projeção temporal de linha).
7. Cobertura de testes das regras de negócios com Vitest e finalização.

## 10. RISCOS E MITIGAÇÕES
* **Risco**: Restrições do navegador para gravar arquivos diretamente no disco local.
  * *Mitigação*: Armazenar de forma transparente no LocalStorage e prover botões de download e upload fáceis de CSV como mecanismo oficial de importação/exportação física.
* **Risco**: Complexidade em calcular e projetar parcelamentos de cartão de crédito que cruzam o fim do ano fiscal de forma recursiva.
  * *Mitigação*: Lógica matemática isolada em `js/engine.js` com bateria de testes unitários rígida.
* **Risco**: Erros de CORS ao executar o código via protocolo de arquivos locais (`file:///`).
  * *Mitigação*: Evitar módulos JavaScript que requeiram cabeçalhos CORS específicos e usar técnicas seguras de namespaces tradicionais de JavaScript ou caminhos relativos robustos.
