# ROADMAP DE ENTREGAS INCREMENTAIS (ROADMAP)

O roteiro evolutivo do projeto baseia-se em entregas de MVPs (Minimum Viable Products) funcionais e compiláveis a cada etapa. Nenhuma etapa intermediária deixará o projeto quebrado ou inoperante.

```
[PLAN] ─────────────────────────────────────────────────────────────────────────────────┐
  │                                                                                     │
  ├─► Milestone 1: PROJETO INICIAL (Prompt 001)                                         │
  │   - Estrutura física de diretórios                                                  │
  │   - Dependências de desenvolvimento e linter (package.json, eslint)                 │
  │   - index.html base com Tailwind CSS e Chart.js locais em cache                     │
  │                                                                                     │
  ├─► Milestone 2: CORE DE ESTADO & ARMAZENAMENTO CSV (Prompt 002)                      │
  │   - State Manager (`js/state.js`) para gerenciar múltiplos perfis                   │
  │   - Conversor bidirecional e importador/exportador de arquivos CSV                 │
  │   - Sincronização em tempo real com LocalStorage do navegador                       │
  │                                                                                     │
  ├─► Milestone 3: PERFIS E ABAS MENSAIS (Prompt 003)                                   │
  │   - Dropdown e controle de criação/remoção de Perfis na UI                          │
  │   - Abas de Janeiro a Dezembro para navegação visual em tela                        │
  │   - Input reativo para atualizar o salário mensal do perfil                         │
  │                                                                                     │
  ├─► Milestone 4: CADASTRO DE GASTOS (Prompt 004)                                      │
  │   - Formulário de despesas com categorias padronizadas                              │
  │   - Validador e condicional de número de parcelas para despesa em Cartão            │
  │   - Tabela de listagem de gastos do mês com ação de deletar                         │
  │                                                                                     │
  ├─► Milestone 5: MOTOR DE PROJEÇÕES (Prompt 005)                                      │
  │   - Distribuição de parcelas nos meses subsequentes automáticas                     │
  │   - Totalizador de gastos acumulados, cálculo de saldo líquido restante             │
  │   - Geração automática de taxas e fatias orçamentárias                              │
  │                                                                                     │
  ├─► Milestone 6: DASHBOARD E GRÁFICOS (Prompt 006)                                    │
  │   - Aba especial de "Relatórios" consolidando os dados                              │
  │   - Gráfico de pizza mostrando divisão setorial de categorias por mês               │
  │   - Gráfico de linha traçando a evolução acumulada do cartão de crédito             │
  │                                                                                     │
  └─► Milestone 7: TESTES E DOCUMENTAÇÃO FINAL (Prompt 007)                             │
      - Testes automatizados do motor de cálculo e persistência                         │
      - Garantia de funcionamento via clique duplo sem CORS (protocolo file:///)        │
      - Arquivo README.md completo de instruções ao usuário                             │
```

## CONTROLE DE QUALIDADE DAS ETAPAS
Para passar de um Milestone ao outro, os seguintes critérios devem estar marcados como verdadeiros:
1. O comando `npm run build` ou inicialização do arquivo estático funciona sem erros.
2. A aplicação abre e é manipulável localmente através de qualquer navegador web moderno.
3. Não há erros de Javascript no console de ferramentas do desenvolvedor (F12).
4. O estado de carregamento e salvamento de dados do utilizador está íntegro.
