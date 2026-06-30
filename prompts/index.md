# ÍNDICE DE PROMPTS - SISTEMA DE SAÚDE FINANCEIRA

Abaixo está o índice sequencial e idempotente de prompts necessários para o desenvolvimento evolutivo da aplicação "Saúde Financeira". Cada arquivo contém a especificação fechada para a realização de um incremento funcional estável.

| Arquivo | Título | Milestone | Complexidade | Estimativa de Tempo | Status |
| :--- | :--- | :--- | :---: | :---: | :---: |
| `prompt_001.md` | Infraestrutura, Estrutura de Pastas e Projeto Base | Milestone 1: Projeto Inicial | Baixa | 3 horas | Concluido |
| `prompt_002.md` | Core de Estado e Mecanismo de Armazenamento CSV / LocalStorage | Milestone 2: Banco de Dados/CSV | Média | 4 horas | Concluido |
| `prompt_003.md` | Interface por Abas Mensais, Cadastro e Seleção de Perfis | Milestone 3: Perfis e Abas | Média | 4 horas | Concluido |
| `prompt_004.md` | CRUD de Gastos Categorizados e Inputs de Cartão de Crédito | Milestone 4: Cadastro de Gastos | Média | 4 horas | Concluido |
| `prompt_005.md` | Motor de Cálculos e Distribuição Temporal de Parcelas de Cartão | Milestone 5: Motor de Projeções | Alta | 5 horas | Concluido |
| `prompt_006.md` | Dashboard de Relatórios com Gráficos Interativos (Line & Pie Charts) | Milestone 6: Dashboard e Gráficos| Alta | 5 horas | Concluido |
| `prompt_007.md` | Cores exclusivas no donut chart, KPI principal e menu Despesas | Milestone 7: Ajustes e Despesas | Média | 3 horas | Concluido |
| `prompt_008.md` | Estrutura de visualização multi-anual de parcelas e recorrências | Milestone 8: Anos Dinâmicos | Alta | 4 horas | Concluido |
| `prompt_009.md` | Ocultação de data de início no modal e centralização de Simulador | Milestone 9: Refinamento UI | Baixa | 2 horas | Concluido |
| `prompt_010.md` | Painel de Configurações, Customização de Categorias e Modo Claro | Milestone 10: Temas e Cores | Alta | 5 horas | Concluido |
| `prompt_011.md` | Sincronização no footer, exportação e importação integral por perfil | Milestone 11: Export/Import | Média | 3 horas | Concluido |
| `prompt_012.md` | Planejador Financeiro nos relatórios e editor de limites nas configs | Milestone 12: Planejador | Alta | 6 horas | Concluido |
| `prompt_013.md` | Status personalizado de investimentos no planejador | Milestone 13: Status Investimento | Baixa | 1 hora | Concluido |
| `prompt_014.md` | Correção de consolidação de Investimentos em Outros | Milestone 14: Engine Fix | Média | 1 hora | Concluido |
| `prompt_015.md` | Remoção do Depurador de Estado RAM (JSON) | Milestone 15: Clean Debugger | Baixa | 1 hora | Concluido |
---
**Nota de Idempotência**: Antes de iniciar qualquer etapa, o agente executor deve obrigatoriamente validar a existência de alterações anteriores e ler os arquivos correspondentes para manter o projeto íntegro e em perfeito funcionamento como MVP após cada entrega.
