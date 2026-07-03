# Feature Spec: Importação de Fatura de Cartão de Crédito via PDF

> **Spec Layer**: Features  
> **ID**: `FEAT-018`  
> **Versão**: 1.1.3  
> **Última Atualização**: 2026-07-03

---

## 1. Visão Geral

Esta feature permite ao usuário automatizar o lançamento de gastos de seu cartão de crédito a partir do arquivo PDF de sua fatura. A aplicação realiza a extração do texto do PDF localmente no navegador, envia o texto estruturado para processamento da LLM (configurada localmente em `llm_config.js`), permite que o usuário revise e edite os gastos extraídos e, finalmente, insere as despesas na base de dados com a categoria "Cartão de Crédito", lidando perfeitamente com compras parceladas.

---

## 2. Requisitos de Negócio e Funcionais

1. **Upload em Memória**: O usuário seleciona o PDF da fatura. O arquivo é mantido estritamente em memória RAM (usando `FileReader` como `ArrayBuffer`) e **nunca** é enviado a um servidor backend proprietário ou salvo em disco.
2. **Extração de Texto Cliente-Side**: A extração do texto contido no PDF ocorre de forma 100% offline no navegador utilizando a biblioteca `pdf.js`.
3. **Interpretação Inteligente (LLM)**: O texto extraído é enviado para a LLM local ou remota (configurada no `llm_config.js` do usuário) com instruções específicas para converter o extrato em dados estruturados (JSON).
4. **Tratamento de Compras Parceladas**:
   - Para compras parceladas (identificadas por padrões como `X/Y`, `de`, `Parcela`), a aplicação identifica:
     - A descrição original da compra.
     - O valor da parcela individual.
     - O índice da parcela atual (ex: 3).
     - O total de parcelas (ex: 10).
   - O lançamento no `State Manager` é feito recalculando retroativamente:
     - O valor total da compra (`valor_parcela * total_parcelas`).
     - O mês e o ano de início da compra (retroagindo `parcela_atual - 1` meses com base no mês/ano ativo no momento da importação).
     - Exemplo: Fatura de **Julho/2026** contendo parcela `03/10` de R$ 120,00 resulta em despesa com `mes_inicio: 5`, `ano_inicio: 2026`, `valor: 1200.00` e `parcelas: 10`.
5. **Painel de Revisão antes do Cadastro**:
   - Os gastos identificados pela LLM são exibidos em uma tabela visual (tabela de revisão) dentro de um modal.
   - O usuário pode:
     - Editar a descrição de cada gasto.
     - Editar o valor.
     - Editar as informações de parcelamento (parcela atual e total de parcelas).
     - Escolher se quer importar ou não o gasto individual (via checkbox de seleção individual ou "marcar todos").
6. **Lançamento no Estado**: Ao clicar em "Confirmar Lançamento", todos os gastos selecionados e revisados são criados no estado usando `adicionarDespesa` e persistidos.
7. **Suporte Offline / Standalone**: Funciona abrindo o `index.html` diretamente via protocolo `file:///`, sem necessidade de servidor local de aplicação.

---

## 3. Interface com Usuário (UI/UX)

- **Botão "Importar Fatura PDF"**: Adicionado à esquerda do botão "Adicionar Gasto" na barra de ações mensal.
- **Modal de Importação (`#pdf-import-modal`)**:
  - Área de drop e seleção de arquivo PDF.
  - Indicador de progresso ("Lendo arquivo...", "Interpretando fatura com IA...", etc.).
  - **Tabela de Revisão**: Exibida após o processamento da LLM, com campos editáveis:
    - Checkbox de seleção.
    - Input de descrição.
    - Input de valor.
    - Seção de parcelas (se aplicável, com inputs para Parcela Atual e Total de Parcelas).
  - Botão "Confirmar Lançamento" e "Cancelar".
  - Alerta de erro de CORS / Conectividade caso a LLM não responda, indicando soluções.

---

## 4. Arquitetura Técnica e Fluxo de Dados

```
[ Usuário seleciona PDF ]
         │
         ▼ (FileReader em ArrayBuffer)
[ pdf.js extrai texto localmente ]
         │
         ▼ (Texto limpo)
[ Chamada para LLM (llm_config.js) com Prompt de Extração JSON ]
         │
         ▼ (JSON com gastos)
[ Renderização da tabela de revisão editável ]
         │ (Usuário ajusta e clica em Confirmar)
         ▼
[ Conversão de parcelas e lançamento retroativo no State Manager ]
         │
         ▼
[ Notificação e Renderização Reativa da UI ]
```

### Prompt de Extração da LLM (`prompts/importacao.md`)
Um prompt dedicado será definido para instruir a LLM a retornar estritamente um JSON estruturado com o formato:
```json
[
  {
    "description": "Nome do Estabelecimento",
    "value": 150.00,
    "isInstallment": false,
    "currentInstallment": 1,
    "totalInstallments": 1
  }
]
```

---

## 5. Critérios de Aceite

- `CA-1`: O arquivo PDF é lido inteiramente na RAM e nunca gravado em disco ou enviado a servidores de terceiros.
- `CA-2`: A biblioteca `pdf.js` é carregada via CDN e funciona sob protocolo `file:///` com acesso à internet.
- `CA-3`: O parser identifica corretamente compras parceladas no extrato (ex: Nubank, Itaú ou Inter) e a aplicação calcula o valor total correto e o recuo retroativo do mês/ano de início.
- `CA-4`: A tabela de revisão permite editar a descrição, valor e parcelamento de cada gasto antes de confirmar o salvamento.
- `CA-5`: Despesas desmarcadas na tabela de revisão não são salvas no banco de dados.
- `CA-6`: Funciona independentemente de ter um servidor HTTP rodando na porta local, consumindo as chaves e modelos do `llm_config.js`.
