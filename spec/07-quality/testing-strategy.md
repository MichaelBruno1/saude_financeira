# Estratégia de Testes — Saúde Financeira

> **Spec Layer**: Quality  
> **Versão**: 1.1.2  
> **Última Atualização**: 2026-07-02

---

## 1. Framework de Testes

| Ferramenta | Versão  | Finalidade                                   |
|------------|---------|----------------------------------------------|
| **Vitest** | ^1.6.0  | Framework de testes unitários (runner + assertions) |
| **ESLint** | ^9.0.0  | Análise estática de qualidade do código      |

---

## 2. Pirâmide de Testes

```
         /\
        /  \
       / E2E \      (não implementado — escopo futuro)
      /--------\
     /  Integração \  (não implementado — JSDOM não configurado)
    /--------------\
   /    Unitários   \  ← Foco atual (engine.js, storage.js)
  /------------------\
```

O projeto prioriza testes unitários de **lógica pura** (engine e storage), onde o valor de cobertura é mais alto e a implementação é mais simples (sem dependência de DOM).

---

## 3. Escopo dos Testes Unitários

### 3.1. `engine.js` — Motor Financeiro (Prioridade Alta)

| Função                       | Cenários a cobrir                                       |
|------------------------------|---------------------------------------------------------|
| `getInstallmentInfo`         | Despesa simples, parcelada, recorrente, inativa, cross-year |
| `calculateMonthlySummary`    | Mês com despesas, sem despesas, com financiamentos      |
| `calculateAnnualSummary`     | Ano completo consolidado                                |
| `calculateCardProjection`    | 12 meses com parcelas distribuídas                      |
| `solveImplicitInterestRate`  | Convergência do Newton-Raphson, caso sem juros          |
| `simulateAmortization`       | Mensal, anual, sem amortização extra                    |

### 3.2. `storage.js` — Persistência (Prioridade Média)

| Função               | Cenários a cobrir                                       |
|----------------------|---------------------------------------------------------|
| `convertToCSV`       | Perfil com despesas, com financiamentos, vazio          |
| `parseFromCSV`       | CSV completo, CSV antigo (retrocompat.), CSV inválido   |
| `parseCSVLine`       | Campos simples, aspas duplas, delimitadores em campos   |

### 3.3. `state.js` — State Manager (Prioridade Baixa)

| Método                   | Cenários a cobrir                                  |
|--------------------------|-----------------------------------------------------|
| `adicionarPerfil`        | Nome válido, nome vazio, nome duplicado             |
| `adicionarDespesa`       | Despesa válida, sem perfil, descrição vazia         |
| `removerDespesa`         | ID existente, ID inexistente                        |
| `atualizarPlanejamento`  | Soma válida, soma > 100%                            |

---

## 4. Casos de Teste Críticos

### TC-001: Parcelamento Cross-Year

```javascript
describe("getInstallmentInfo - parcelamento cross-year", () => {
  it("deve calcular parcela 3 de 12 em Jan/2026 para compra em Nov/2025", () => {
    const despesa = {
      valor: 1200, categoria: "Cartão de Crédito",
      mes_inicio: 11, ano_inicio: 2025, parcelas: 12, recorrente: false
    };
    const result = Engine.getInstallmentInfo(despesa, 1, 2026);
    expect(result.active).toBe(true);
    expect(result.index).toBe(3);
    expect(result.total).toBe(12);
    expect(result.valorParcela).toBe(100.00);
  });

  it("não deve ativar após o término das parcelas", () => {
    const despesa = {
      valor: 1200, categoria: "Cartão de Crédito",
      mes_inicio: 11, ano_inicio: 2025, parcelas: 12, recorrente: false
    };
    const result = Engine.getInstallmentInfo(despesa, 11, 2026); // Parcela 13 → inativa
    expect(result).toBeNull();
  });
});
```

### TC-002: Recorrência Anual

```javascript
describe("getInstallmentInfo - recorrente", () => {
  it("deve ativar do mes_inicio até dezembro do mesmo ano", () => {
    const despesa = {
      valor: 39.90, categoria: "Serviços por Assinatura",
      mes_inicio: 3, ano_inicio: 2026, parcelas: 1, recorrente: true
    };
    expect(Engine.getInstallmentInfo(despesa, 3, 2026).active).toBe(true);
    expect(Engine.getInstallmentInfo(despesa, 12, 2026).active).toBe(true);
    expect(Engine.getInstallmentInfo(despesa, 2, 2026)).toBeNull(); // Antes do início
    expect(Engine.getInstallmentInfo(despesa, 1, 2027)).toBeNull(); // Ano seguinte
  });
});
```

### TC-003: Parse CSV Retrocompatível

```javascript
describe("parseFromCSV - retrocompat", () => {
  it("deve importar CSV sem coluna ano_inicio com fallback para ano atual", () => {
    const csv = `perfil,salario_base,descricao,valor,categoria,mes_inicio,parcelas
"Principal",3000.00,"Aluguel",1200.00,"Moradia",1,1`;
    const result = Storage.parseFromCSV(csv);
    expect(result.despesas[0].ano_inicio).toBe(new Date().getFullYear());
  });
});
```

### TC-004: Simulador Newton-Raphson

```javascript
describe("solveImplicitInterestRate", () => {
  it("deve convergir para taxa mensal implícita de financiamento Price", () => {
    // Financiamento: R$280.000, 360 parcelas de R$2.100
    const r = Engine.solveImplicitInterestRate(280000, 2100, 360);
    expect(r).toBeGreaterThan(0);
    expect(r).toBeLessThan(0.02); // Taxa razoável < 2% ao mês
  });

  it("deve retornar 0 quando parcela * N <= V (sem juros)", () => {
    const r = Engine.solveImplicitInterestRate(12000, 1000, 12); // P*N = V
    expect(r).toBe(0);
  });
});
```

---

## 5. Execução dos Testes

### Rodar todos os testes
```bash
npm run test
```

### Rodar com coverage (futuro)
```bash
npx vitest run --coverage
```

### Rodar em modo watch (desenvolvimento)
```bash
npx vitest
```

---

## 6. Análise Estática (Linting)

### Rodar o linter
```bash
npm run lint
```

### Configuração (`eslint.config.js`)
- **ECMAScript**: 2022
- **Ambiente**: Browser (acesso a `window`, `document`, `localStorage`)
- **Globais declarados**: `App`, `Chart`, `setTimeout`
- **Regras principais**: sem variáveis não declaradas, sem imports desnecessários.

---

## 7. Critérios de Qualidade (Definition of Done)

| Critério                                         | Meta         |
|--------------------------------------------------|--------------|
| `npm run lint` sem erros                         | Obrigatório  |
| Cobertura de testes do `engine.js`              | > 80%        |
| Zero erros no console do navegador ao abrir o app | Obrigatório |
| Compatível com protocolo `file:///`             | Obrigatório  |
| Compatível com Chrome 90+, Firefox 88+, Edge 90+ | Obrigatório |
| Importação e exportação de CSV sem perda de dados | Obrigatório |
