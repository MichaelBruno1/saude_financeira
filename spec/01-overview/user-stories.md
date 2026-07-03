# Histórias de Usuário — Saúde Financeira

> **Spec Layer**: Overview  
> **Versão**: 1.1.2  
> **Última Atualização**: 2026-07-02

---

## Convenção de Escrita

```
Como [persona], quero [ação], para que [benefício].
```

Cada história tem:
- **Critérios de Aceite (AC)**: condições que devem ser verdadeiras para a história ser considerada concluída.
- **Regras de Negócio (RN)**: regras específicas do domínio que governam a implementação.

---

## EPIC-01: Gerenciamento de Perfis

### US-001 — Criar Perfil

> Como usuário, quero criar um perfil com nome e salário base, para que eu possa organizar minhas finanças separadas por contexto (ex: pessoal vs. MEI).

**Critérios de Aceite:**
- `AC-001.1`: O sistema deve exibir um formulário com campo de nome e campo de salário.
- `AC-001.2`: O campo nome não pode estar vazio; deve exibir erro caso esteja.
- `AC-001.3`: O campo salário deve aceitar apenas valores numéricos positivos.
- `AC-001.4`: Ao criar o perfil, ele deve ser automaticamente selecionado como perfil ativo.
- `AC-001.5`: Não deve ser possível criar dois perfis com o mesmo nome (case-insensitive).

**Regras de Negócio:**
- `RN-001.1`: O nome do perfil é higienizado (`.trim()`) antes de ser salvo.
- `RN-001.2`: O salário mínimo é `0` (sem limite máximo).

---

### US-002 — Trocar de Perfil

> Como usuário, quero selecionar um perfil diferente a partir de uma lista, para que eu possa ver os dados financeiros de outro contexto.

**Critérios de Aceite:**
- `AC-002.1`: Todos os perfis cadastrados devem aparecer no seletor lateral.
- `AC-002.2`: Ao selecionar um perfil, toda a UI deve ser re-renderizada com os dados desse perfil.
- `AC-002.3`: O perfil ativo deve ter destaque visual no seletor.

---

### US-003 — Remover Perfil

> Como usuário, quero deletar um perfil que não uso mais, para manter minha lista de perfis organizada.

**Critérios de Aceite:**
- `AC-003.1`: A remoção deve eliminar também todas as despesas e financiamentos vinculados a esse perfil.
- `AC-003.2`: Após remoção, o primeiro perfil restante deve ser ativado automaticamente.
- `AC-003.3`: Se não houver perfil restante, o `perfilAtivo` deve ser `null`.

---

### US-004 — Atualizar Salário

> Como usuário, quero editar o salário base do meu perfil ativo diretamente no cabeçalho, para que os cálculos de saldo sejam imediatamente atualizados.

**Critérios de Aceite:**
- `AC-004.1`: O campo de salário deve ser editável via clique direto no valor exibido no header.
- `AC-004.2`: Ao confirmar a edição (Enter ou perda de foco), o estado deve ser salvo e a tela re-renderizada.
- `AC-004.3`: Valores inválidos (negativos ou não numéricos) devem ser ignorados ou tratados como `0`.

---

## EPIC-02: Calendário e Navegação

### US-005 — Navegar por Meses

> Como usuário, quero clicar em abas de meses (Jan a Dez) para visualizar as despesas e o saldo daquele mês.

**Critérios de Aceite:**
- `AC-005.1`: Os 12 meses do ano devem estar disponíveis como abas clicáveis.
- `AC-005.2`: O mês ativo deve ter destaque visual com gradiente.
- `AC-005.3`: Ao mudar de mês, os dados da tabela de despesas e KPIs devem atualizar instantaneamente.

---

### US-006 — Navegar por Anos

> Como usuário, quero ter abas de anos geradas automaticamente, para que eu possa acessar despesas e financiamentos de anos anteriores.

**Critérios de Aceite:**
- `AC-006.1`: Abas de ano devem aparecer apenas para anos que possuam despesas comuns ou parceladas ativas.
- `AC-006.2`: A aba do ano corrente deve ser exibida por padrão.
- `AC-006.3`: Anos que possuam apenas parcelas de financiamentos de longo prazo não devem gerar abas extras.

---

## EPIC-03: CRUD de Despesas

### US-007 — Adicionar Despesa Simples

> Como usuário, quero registrar uma despesa com descrição, valor, categoria e mês de início, para que ela apareça no mês correto.

**Critérios de Aceite:**
- `AC-007.1`: O formulário deve conter: descrição (texto), valor (decimal), categoria (dropdown), mês início, ano início.
- `AC-007.2`: A descrição não pode estar vazia.
- `AC-007.3`: O valor deve ser maior que zero.
- `AC-007.4`: A despesa deve aparecer imediatamente na tabela do mês correspondente após o cadastro.

**Regras de Negócio:**
- `RN-007.1`: O mês e ano de início são herdados da aba ativa no momento do cadastro.
- `RN-007.2`: Despesas não categorizadas caem automaticamente em "Outros".

---

### US-008 — Adicionar Despesa Parcelada (Cartão de Crédito)

> Como usuário, quero registrar uma compra parcelada no cartão, para que o sistema distribua automaticamente as parcelas nos meses subsequentes.

**Critérios de Aceite:**
- `AC-008.1`: O campo "Número de Parcelas" só deve aparecer quando a categoria "Cartão de Crédito" estiver selecionada.
- `AC-008.2`: O valor de cada parcela deve ser calculado como `valorTotal / numParcelas`, arredondado em 2 casas decimais.
- `AC-008.3`: As parcelas devem aparecer nos meses corretos, inclusive cruzando a virada de ano.

**Regras de Negócio:**
- `RN-008.1`: O cálculo de parcelas usa indexação absoluta de meses: `(ano * 12 + mês - 1)`.
- `RN-008.2`: Uma compra de 12x feita em novembro deve aparecer de nov/ano até out/ano+1.

---

### US-009 — Adicionar Despesa Recorrente

> Como usuário, quero marcar uma despesa como recorrente, para que ela apareça automaticamente em todos os meses do ano a partir do mês de início.

**Critérios de Aceite:**
- `AC-009.1`: O formulário deve ter um toggle/select de "Recorrente: Sim/Não".
- `AC-009.2`: Despesas recorrentes se repetem do mês de início até dezembro do mesmo ano.
- `AC-009.3`: Em anos subsequentes, a despesa recorrente NÃO deve aparecer automaticamente.

**Regras de Negócio:**
- `RN-009.1`: O campo `recorrente: true` no objeto de despesa define o comportamento.
- `RN-009.2`: O valor exibido em cada mês recorrente é o valor total da despesa (sem divisão).

---

### US-010 — Editar Despesa

> Como usuário, quero editar uma despesa já cadastrada, para corrigir valores ou categorias sem precisar excluir e recadastrar.

**Critérios de Aceite:**
- `AC-010.1`: Cada linha da tabela deve ter um botão de editar que abre o modal com os dados preenchidos.
- `AC-010.2`: Todos os campos editáveis devem ser apresentados: descrição, valor, categoria, mês, ano, parcelas, recorrente.
- `AC-010.3`: Ao salvar, as mudanças devem propagar imediatamente para todos os meses afetados.

---

### US-011 — Excluir Despesa

> Como usuário, quero excluir uma despesa da tabela, para removê-la permanentemente do sistema.

**Critérios de Aceite:**
- `AC-011.1`: Cada linha da tabela deve ter um botão de excluir.
- `AC-011.2`: A exclusão deve remover a despesa do estado e do LocalStorage imediatamente.
- `AC-011.3`: A re-renderização de todos os meses afetados deve ocorrer automaticamente.

---

## EPIC-04: Financiamentos

### US-012 — Cadastrar Financiamento

> Como usuário, quero registrar um contrato de financiamento, para acompanhar o progresso das parcelas e o custo total.

**Critérios de Aceite:**
- `AC-012.1`: O formulário deve ter: nome/descrição, valor total, valor da parcela, total de parcelas, taxa TR, mês e ano de início.
- `AC-012.2`: O financiamento cadastrado deve aparecer na tabela mensal de despesas sob a categoria "Financiamento".
- `AC-012.3`: A coluna de parcelas deve exibir "Parcela X de Y".
- `AC-012.4`: O valor da parcela deve ser somado ao total de gastos do mês no KPI.

---

### US-013 — Simular Amortização SAC

> Como usuário com financiamento ativo, quero simular o efeito de pagar um valor extra por mês ou anualmente, para saber quanto economizarei em juros e meses.

**Critérios de Aceite:**
- `AC-013.1`: O simulador deve aceitar o valor de amortização extra e a frequência (mensal ou anual).
- `AC-013.2`: Deve exibir: juros economizados (R$), meses economizados e prazo residual.
- `AC-013.3`: Deve exibir tabela comparativa detalhada entre o cenário original e o amortizado.

**Regras de Negócio:**
- `RN-013.1`: A taxa de juros implícita é resolvida pelo método Newton-Raphson.
- `RN-013.2`: A taxa TR é somada à taxa implícita para calcular os juros mensais.

---

## EPIC-05: Relatórios

### US-014 — Visualizar Gráfico Donut por Categoria

> Como usuário, quero ver um gráfico de rosca mostrando como meu orçamento está distribuído por categoria, para identificar onde gasto mais.

**Critérios de Aceite:**
- `AC-014.1`: O gráfico deve refletir os dados do período selecionado (mês específico ou anual).
- `AC-014.2`: As cores do gráfico devem corresponder às cores configuradas pelo usuário para cada categoria.
- `AC-014.3`: Ao passar o mouse sobre uma fatia, deve aparecer o valor em R$ e o percentual.
- `AC-014.4`: Se não houver gastos, deve exibir um placeholder elegante.

---

### US-015 — Visualizar Gráfico de Linha do Cartão

> Como usuário, quero ver a evolução mensal do meu gasto no cartão de crédito, para antecipar meses com maior pressão financeira.

**Critérios de Aceite:**
- `AC-015.1`: O gráfico deve exibir 12 pontos (Jan a Dez) com o total de parcelas ativas em cada mês.
- `AC-015.2`: Deve ter gradiente sob a linha para destaque visual.
- `AC-015.3`: Se não houver parcelas de cartão, deve exibir um placeholder.

---

## EPIC-06: Planejador Financeiro

### US-016 — Definir Limites por Categoria

> Como usuário, quero definir o percentual máximo do meu salário que cada categoria pode consumir, para ter um orçamento planejado.

**Critérios de Aceite:**
- `AC-016.1`: Deve haver 3 perfis de planejamento: Conservador, Equilibrado, Agressivo.
- `AC-016.2`: O usuário pode editar os percentuais de cada categoria manualmente.
- `AC-016.3`: O sistema calcula automaticamente quanto sobra para "Investimento".
- `AC-016.4`: A soma dos percentuais não pode ultrapassar 100%.
- `AC-016.5`: Exibir mensagem de conclusão do orçamento quando atingir 100%.

---

### US-017 — Comparar Planejado vs. Real

> Como usuário, quero ver o que planejei gastar em cada categoria comparado ao que gastei de fato, para entender desvios.

**Critérios de Aceite:**
- `AC-017.1`: Exibir tabela com: categoria, limite planejado (%), gasto real (R$ e %), status.
- `AC-017.2`: O status deve ser: "OK" (verde), "Atenção" (amarelo), "Excelente" (ciano para investimento acima da meta), "Ruim" (vermelho).
- `AC-017.3`: Gastos de "Financiamento" devem ser consolidados como "Moradia" na comparação real.

---

## EPIC-07: Customização

### US-018 — Criar Categoria Customizada

> Como usuário, quero adicionar novas categorias de gastos com cores personalizadas, para adaptar o sistema ao meu contexto.

**Critérios de Aceite:**
- `AC-018.1`: O formulário deve ter: nome da categoria e seletor de cor (color picker).
- `AC-018.2`: A nova categoria deve aparecer no dropdown de cadastro de despesas imediatamente.
- `AC-018.3`: A categoria deve aparecer no gráfico donut com a cor definida.
- `AC-018.4`: Não deve ser possível criar categorias com nomes duplicados.

---

### US-019 — Alterar Cor de Categoria

> Como usuário, quero mudar a cor de uma categoria existente, para que os gráficos reflitam minha paleta visual preferida.

**Critérios de Aceite:**
- `AC-019.1`: A grade de categorias deve exibir um input `<input type="color">` por categoria.
- `AC-019.2`: A mudança de cor deve atualizar o gráfico donut em tempo real.
- `AC-019.3`: A cor deve ser salva no estado e persistida no LocalStorage.

---

### US-020 — Alternar Tema Claro/Escuro

> Como usuário, quero trocar entre Modo Claro e Modo Escuro, para usar a aplicação no ambiente que prefiro.

**Critérios de Aceite:**
- `AC-020.1`: O botão de toggle deve estar acessível na aba de Configurações.
- `AC-020.2`: A troca de tema deve ser imediata, sem recarregamento da página.
- `AC-020.3`: O tema escolhido deve ser persistido no LocalStorage.

---

## EPIC-08: Sincronização CSV

### US-021 — Exportar Perfil como CSV

> Como usuário, quero exportar os dados do meu perfil ativo como um arquivo CSV, para fazer backup ou transferir para outro dispositivo.

**Critérios de Aceite:**
- `AC-021.1`: O arquivo deve conter despesas e financiamentos do perfil ativo.
- `AC-021.2`: O download deve ser disparado automaticamente no navegador.
- `AC-021.3`: O nome do arquivo deve incluir o nome do perfil e timestamp.

---

### US-022 — Importar Perfil de CSV

> Como usuário, quero importar um arquivo CSV exportado anteriormente, para restaurar ou transferir dados entre dispositivos.

**Critérios de Aceite:**
- `AC-022.1`: Se o perfil já existir, deve atualizar o salário e substituir as despesas/financiamentos.
- `AC-022.2`: Se o perfil não existir, deve criar um novo perfil com os dados do CSV.
- `AC-022.3`: O perfil importado deve ser selecionado como ativo automaticamente.
- `AC-022.4`: A importação deve ser resiliente a colunas ausentes (compatibilidade com versões antigas do CSV).

---

## EPIC-09: Análise com IA

### US-023 — Gerar Análise Financeira com IA

> Como usuário, quero solicitar uma análise inteligente dos meus dados financeiros usando IA local, para receber recomendações personalizadas.

**Critérios de Aceite:**
- `AC-023.1`: O botão "Gerar análise inteligente" deve enviar os dados do perfil ativo para a LLM configurada.
- `AC-023.2`: A análise deve cobrir: saúde financeira geral, comparação com o planejamento, ações recomendadas, projeção anual.
- `AC-023.3`: Em caso de erro de CORS (protocolo `file:///`), deve exibir dica de como resolver.
- `AC-023.4`: A configuração da LLM (`apiUrl`, `apiKey`, `model`) deve ser lida de `llm_config.js`.
