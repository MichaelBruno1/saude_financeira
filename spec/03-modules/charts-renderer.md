# Spec do Módulo: Charts Renderer (`charts.js`)

> **Spec Layer**: Modules  
> **Arquivo**: [`js/charts.js`](file:///c:/projetos/saude_financeira/js/charts.js)  
> **Namespace**: `window.App.Charts`  
> **Dependência Externa**: Chart.js (via CDN)  
> **Versão**: 1.1.2

---

## 1. Responsabilidade

O `Charts Renderer` é a **ponte entre os dados processados pelo motor financeiro e a biblioteca Chart.js**. Ele gerencia o ciclo de vida das instâncias de canvas (criação, atualização e destruição) e aplica a paleta de cores configurada pelo usuário.

---

## 2. Instâncias de Gráficos

```javascript
let pizzaChartInstance = null;   // Gráfico Donut das categorias de gastos
let lineChartInstance = null;    // Gráfico de Linha do cartão de crédito
let plannerChartInstance = null; // Gráfico Donut do planejador financeiro
```

Cada instância é destruída (`chart.destroy()`) antes de ser recriada para evitar **"ghost charts"** (artefatos visuais do Chart.js ao re-renderizar no mesmo canvas).

---

## 3. Paleta de Cores Padrão

```javascript
const CATEGORY_COLORS = {
  "Saúde":                 "#10b981", // emerald-500
  "Alimentação":           "#0ea5e9", // sky-500
  "Moradia":               "#6366f1", // indigo-500
  "Cartão de Crédito":     "#f59e0b", // amber-500
  "Lazer":                 "#f43f5e", // rose-500
  "Serviços por Assinatura":"#8b5cf6",// violet-500
  "Serviços":              "#14b8a6", // teal-500
  "Financiamento":         "#d946ef", // fuchsia-500
  "Outros":                "#64748b", // slate-500
  "Investimento":          "#eab308"  // yellow-500
};
```

**Resolução de cor**: As cores definidas pelo usuário no `state.categorias` têm prioridade sobre as cores padrão do módulo. Fallback final: `#64748b` (slate-500).

```javascript
const color = userColors[cat] || CATEGORY_COLORS[cat] || "#64748b";
```

---

## 4. `renderPizzaChart(canvasId, categoryData)`

### Propósito
Renderiza o gráfico de rosca (Donut) que divide os gastos por categoria.

### Pré-condições
- `canvasId` deve referenciar um elemento `<canvas>` no DOM.
- `categoryData` deve ser um objeto `{ categoriaNome: valorNumerico }`.

### Comportamento
1. Destrói a instância anterior (`pizzaChartInstance.destroy()`).
2. Calcula o total de gastos (`Object.values().reduce()`).
3. **Se total === 0**: exibe o placeholder e oculta o canvas.
4. **Se total > 0**: oculta o placeholder e renderiza o Donut Chart.

### Configuração do Gráfico

```javascript
{
  type: "doughnut",
  options: {
    cutout: "60%",        // Espessura do donut
    maintainAspectRatio: false,
    plugins: {
      legend: { position: "bottom", usePointStyle: true },
      tooltip: {
        // Mostra: "R$ 800,00 (16.5%)"
        callbacks: { label: (ctx) => `R$ ${val} (${pct}%)` }
      }
    }
  }
}
```

### Dependência de DOM

| ID do Elemento           | Descrição                            |
|--------------------------|--------------------------------------|
| `[canvasId]`             | Canvas do gráfico                    |
| `pizza-chart-placeholder`| Placeholder quando sem dados         |
| `pizza-chart-canvas-container` | Container que envolve o canvas |

---

## 5. `renderLineChart(canvasId, projectionData)`

### Propósito
Renderiza o gráfico de linha com a projeção mensal de parcelas do cartão de crédito.

### Pré-condições
- `projectionData` deve ser um array de 12 números (Jan a Dez).

### Comportamento
1. Destrói a instância anterior.
2. **Se todos os valores === 0**: exibe placeholder.
3. **Se houver algum valor > 0**: renderiza o gráfico de linha com gradiente.

### Configuração do Gráfico

```javascript
{
  type: "line",
  data: {
    labels: ["Jan", "Fev", "Mar", ..., "Dez"],
    datasets: [{
      borderColor: "#6366f1",    // indigo-500
      fill: true,
      backgroundColor: gradient, // Gradiente de indigo translúcido
      tension: 0.35,             // Curva suavizada
      borderWidth: 3
    }]
  }
}
```

### Gradiente Visual

```javascript
const gradient = ctx.createLinearGradient(0, 0, 0, 300);
gradient.addColorStop(0, "rgba(99, 102, 241, 0.35)");  // topo
gradient.addColorStop(1, "rgba(99, 102, 241, 0.0)");   // base transparente
```

### Dependência de DOM

| ID do Elemento            | Descrição                     |
|---------------------------|-------------------------------|
| `[canvasId]`              | Canvas do gráfico             |
| `line-chart-placeholder`  | Placeholder quando sem dados  |
| `line-chart-canvas-container` | Container do canvas       |

---

## 6. `renderPlannerChart(canvasId, plannerData)`

### Propósito
Renderiza o gráfico Donut do planejador financeiro, exibindo a distribuição percentual recomendada por categoria.

### Comportamento
1. Destrói a instância anterior.
2. **Filtra** categorias com percentual > 0 (evita slices invisíveis no gráfico).
3. Renderiza o Donut com os percentuais filtrados.

### Tooltip

```javascript
callbacks: {
  label: (ctx) => ` ${ctx.label}: ${ctx.raw}%`
}
```

---

## 7. Tipografia dos Gráficos

Todos os gráficos usam a fonte **Outfit** (carregada via Google Fonts no `index.html`):

```javascript
font: { family: "Outfit", size: 11, weight: "500" }
```

---

## 8. Regras de Estilo (Modo Escuro)

| Elemento         | Cor            | Descrição            |
|------------------|----------------|----------------------|
| Fundo do tooltip | `rgba(15,23,42, 0.95)` | Quase preto slate-900 |
| Texto da legenda | `#94a3b8`      | slate-400            |
| Borda do canvas  | `#0f172a`      | slate-950            |
| Linhas de grade  | `rgba(255,255,255,0.05)` | Quase invisível |
