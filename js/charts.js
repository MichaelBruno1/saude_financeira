// Namespace global para gerenciamento de gráficos do Chart.js
window.App = window.App || {};

window.App.Charts = (() => {
  // Instâncias globais privadas dos gráficos para destruição e atualização limpa
  let pizzaChartInstance = null;
  let lineChartInstance = null;
  let plannerChartInstance = null;

  // Cores de categorias consistentes com Tailwind e paletas premium
  const CATEGORY_COLORS = {
    "Saúde": "#10b981",              // emerald-500
    "Alimentação": "#0ea5e9",        // sky-500
    "Moradia": "#6366f1",            // indigo-500
    "Cartão de Crédito": "#f59e0b",  // amber-500
    "Lazer": "#f43f5e",              // rose-500
    "Serviços por Assinatura": "#8b5cf6", // violet-500
    "Serviços": "#14b8a6",            // teal-500
    "Financiamento": "#d946ef",       // fuchsia-500
    "Outros": "#64748b",             // slate-500
    "Investimento": "#eab308"         // gold-500
  };

  return {
    /**
     * Renderiza o gráfico de pizza/rosca para fatiamento setorial por categoria.
     */
    renderPizzaChart(canvasId, categoryData) {
      // Destruir instância anterior para evitar fantasmas visuais ao passar o mouse
      if (pizzaChartInstance) {
        pizzaChartInstance.destroy();
        pizzaChartInstance = null;
      }

      const canvas = document.getElementById(canvasId);
      const placeholder = document.getElementById("pizza-chart-placeholder");
      const container = document.getElementById("pizza-chart-canvas-container");

      if (!canvas) return;

      // Calcular o total gasto
      const values = Object.values(categoryData);
      const total = values.reduce((sum, val) => sum + val, 0);

      // Se não houver gastos, exibe o placeholder e esconde o canvas
      if (total === 0) {
        if (container) container.classList.add("hidden");
        if (placeholder) placeholder.classList.remove("hidden");
        return;
      }

      // Exibir o canvas e ocultar o placeholder
      if (placeholder) placeholder.classList.add("hidden");
      if (container) container.classList.remove("hidden");

      const labels = Object.keys(categoryData);
      const state = window.App.State.getState();
      const userColors = state.categorias || {};
      const backgroundColors = labels.map(cat => userColors[cat] || CATEGORY_COLORS[cat] || "#64748b");

      const ctx = canvas.getContext("2d");
      pizzaChartInstance = new Chart(ctx, {
        type: "doughnut",
        data: {
          labels: labels,
          datasets: [{
            data: values,
            backgroundColor: backgroundColors,
            borderColor: "#0f172a", // borda slate-900 para combinar com o fundo do card
            borderWidth: 2,
            hoverOffset: 4
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: "bottom",
              labels: {
                color: "#94a3b8", // slate-400
                font: {
                  family: "Outfit",
                  size: 11,
                  weight: "500"
                },
                padding: 16,
                usePointStyle: true
              }
            },
            tooltip: {
              backgroundColor: "rgba(15, 23, 42, 0.95)",
              titleFont: { family: "Outfit", size: 12, weight: "bold" },
              bodyFont: { family: "Outfit", size: 12 },
              borderColor: "rgba(255,255,255,0.06)",
              borderWidth: 1,
              padding: 10,
              callbacks: {
                label: function(context) {
                  const value = context.parsed;
                  const percentage = ((value / total) * 100).toFixed(1);
                  return ` R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} (${percentage}%)`;
                }
              }
            }
          },
          cutout: "60%" // Faz o gráfico de pizza virar uma rosca (Doughnut) elegante
        }
      });
    },

    /**
     * Renderiza o gráfico de linha de projeção acumulada do cartão de crédito (mês a mês).
     */
    renderLineChart(canvasId, projectionData) {
      // Destruir instância anterior
      if (lineChartInstance) {
        lineChartInstance.destroy();
        lineChartInstance = null;
      }

      const canvas = document.getElementById(canvasId);
      const placeholder = document.getElementById("line-chart-placeholder");
      const container = document.getElementById("line-chart-canvas-container");

      if (!canvas) return;

      // Validar se há alguma parcela ativa no cartão
      const hasData = projectionData.some(val => val > 0);

      if (!hasData) {
        if (container) container.classList.add("hidden");
        if (placeholder) placeholder.classList.remove("hidden");
        return;
      }

      if (placeholder) placeholder.classList.add("hidden");
      if (container) container.classList.remove("hidden");

      const monthLabels = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

      const ctx = canvas.getContext("2d");
      
      // Criar gradiente sob a linha do gráfico
      const gradient = ctx.createLinearGradient(0, 0, 0, 300);
      gradient.addColorStop(0, "rgba(99, 102, 241, 0.35)");  // indigo-500
      gradient.addColorStop(1, "rgba(99, 102, 241, 0.0)");

      lineChartInstance = new Chart(ctx, {
        type: "line",
        data: {
          labels: monthLabels,
          datasets: [{
            label: "Total no Mês (R$)",
            data: projectionData,
            borderColor: "#6366f1", // indigo-500
            backgroundColor: gradient,
            fill: true,
            tension: 0.35,
            borderWidth: 3,
            pointBackgroundColor: "#818cf8", // indigo-400
            pointBorderColor: "#0f172a",
            pointBorderWidth: 2,
            pointRadius: 4,
            pointHoverRadius: 6
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: false // Não precisa de legenda já que é uma única linha explicada pelo título
            },
            tooltip: {
              backgroundColor: "rgba(15, 23, 42, 0.95)",
              titleFont: { family: "Outfit", size: 12, weight: "bold" },
              bodyFont: { family: "Outfit", size: 12 },
              borderColor: "rgba(255,255,255,0.06)",
              borderWidth: 1,
              padding: 10,
              callbacks: {
                label: function(context) {
                  const value = context.parsed.y;
                  return ` Cartão: R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
                }
              }
            }
          },
          scales: {
            x: {
              grid: {
                color: "rgba(255, 255, 255, 0.03)"
              },
              ticks: {
                color: "#94a3b8", // slate-400
                font: { family: "Outfit", size: 11 }
              }
            },
            y: {
              grid: {
                color: "rgba(255, 255, 255, 0.05)"
              },
              ticks: {
                color: "#94a3b8",
                font: { family: "Outfit", size: 11 },
                callback: function(value) {
                  return "R$ " + value.toLocaleString('pt-BR');
                }
              }
            }
          }
        }
      });
    },

    /**
     * Renderiza o gráfico do planejador financeiro baseado nas porcentagens.
     */
    renderPlannerChart(canvasId, plannerData) {
      if (plannerChartInstance) {
        plannerChartInstance.destroy();
        plannerChartInstance = null;
      }

      const canvas = document.getElementById(canvasId);
      if (!canvas) return;

      // Filtrar categorias com porcentagem maior que 0
      const filteredLabels = [];
      const filteredValues = [];

      for (const cat in plannerData) {
        const val = parseFloat(plannerData[cat]) || 0;
        if (val > 0) {
          filteredLabels.push(cat);
          filteredValues.push(val);
        }
      }

      const state = window.App.State.getState();
      const userColors = state.categorias || {};
      const backgroundColors = filteredLabels.map(cat => userColors[cat] || CATEGORY_COLORS[cat] || "#64748b");

      const ctx = canvas.getContext("2d");
      plannerChartInstance = new Chart(ctx, {
        type: "doughnut",
        data: {
          labels: filteredLabels,
          datasets: [{
            data: filteredValues,
            backgroundColor: backgroundColors,
            borderColor: "#0f172a",
            borderWidth: 2,
            hoverOffset: 4
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: "bottom",
              labels: {
                color: "#94a3b8",
                font: {
                  family: "Outfit",
                  size: 11,
                  weight: "500"
                },
                padding: 16,
                usePointStyle: true
              }
            },
            tooltip: {
              backgroundColor: "rgba(15, 23, 42, 0.95)",
              titleColor: "#f8fafc",
              bodyColor: "#94a3b8",
              borderColor: "rgba(255, 255, 255, 0.1)",
              borderWidth: 1,
              callbacks: {
                label: function(context) {
                  return ` ${context.label}: ${context.raw}%`;
                }
              }
            }
          }
        }
      });
    }
  };
})();
