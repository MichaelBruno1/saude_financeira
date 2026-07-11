// ── Módulo: Relatórios & Planejamento ─────────────────────────────────────────
window.App = window.App || {};

window.App.UIReports = (() => {
  let reportsContainer, reportsPizzaMonthSelect, reportsBudgetProgressContainer;
  let plannerMethodSelect, plannerComparisonTableBody;
  let generateAiAnalysisBtn, aiAnalysisLoader, aiAnalysisResultCard, aiAnalysisTimestamp, aiAnalysisTextContent;
  let generateSavingsPlanBtn, savingsPlanLoader, savingsPlanResultCard, savingsPlanTimestamp, savingsPlanTextContent;
  
  function mapElements(DOM_IDS) {
    const g = id => document.getElementById(id);
    const s = window.App.UIState;
    reportsContainer                = g(DOM_IDS.REPORTS_CONTAINER);
    reportsPizzaMonthSelect         = g(DOM_IDS.REPORTS_PIZZA_MONTH_SELECT);
    reportsBudgetProgressContainer  = g(DOM_IDS.REPORTS_BUDGET_PROGRESS_CONTAINER);
    plannerMethodSelect             = g(DOM_IDS.PLANNER_METHOD_SELECT);
    plannerComparisonTableBody      = g(DOM_IDS.PLANNER_COMPARISON_TABLE_BODY);
    
    generateAiAnalysisBtn           = g(DOM_IDS.GENERATE_AI_ANALYSIS_BTN);
    aiAnalysisLoader                = g("ai-analysis-loader");
    aiAnalysisResultCard            = g("ai-analysis-result-card");
    aiAnalysisTimestamp             = g("ai-analysis-timestamp");
    aiAnalysisTextContent           = g("ai-analysis-text-content");
    
    generateSavingsPlanBtn          = g(DOM_IDS.GENERATE_SAVINGS_PLAN_BTN);
    savingsPlanLoader               = g(DOM_IDS.SAVINGS_PLAN_LOADER);
    savingsPlanResultCard           = g(DOM_IDS.SAVINGS_PLAN_RESULT_CARD);
    savingsPlanTimestamp            = g(DOM_IDS.SAVINGS_PLAN_TIMESTAMP);
    savingsPlanTextContent          = g(DOM_IDS.SAVINGS_PLAN_TEXT_CONTENT);
    
    // Compartilha referencias usadas pelo ui-core e outros
    s.reportsContainer = reportsContainer;
    s.reportsPizzaMonthSelect = reportsPizzaMonthSelect;
    s.plannerMethodSelect = plannerMethodSelect;
    s.plannerComparisonTableBody = plannerComparisonTableBody;
  }

  function init() {
    if (plannerMethodSelect) {
      plannerMethodSelect.addEventListener("change", (e) => {
        window.App.State.selecionarMetodoPlanejamento(e.target.value);
      });
    }

    if (generateAiAnalysisBtn) {
      generateAiAnalysisBtn.addEventListener("click", async () => {
        if (!window.App.UIAgent || !window.App.UIAgent.askFinancialAnalysis) {
          alert("O módulo de agente IA não está carregado corretamente."); return;
        }
        generateAiAnalysisBtn.disabled = true;
        aiAnalysisLoader.classList.remove("hidden");
        aiAnalysisResultCard.classList.add("hidden");
        try {
          const res = await window.App.UIAgent.askFinancialAnalysis();
          const { parseMarkdownToHTML } = window.App.UIUtils;
          aiAnalysisTextContent.innerHTML = parseMarkdownToHTML(res);
          const now = new Date();
          aiAnalysisTimestamp.textContent = `Análise gerada em: ${now.toLocaleDateString()} às ${now.toLocaleTimeString()}`;
          aiAnalysisResultCard.classList.remove("hidden");
        } catch (err) {
          alert(`Erro ao gerar análise: ${err.message}`);
        } finally {
          generateAiAnalysisBtn.disabled = false;
          aiAnalysisLoader.classList.add("hidden");
        }
      });
    }

    if (generateSavingsPlanBtn) {
      generateSavingsPlanBtn.addEventListener("click", async () => {
        if (!window.App.UIAgent || !window.App.UIAgent.askSavingsPlan) {
          alert("O módulo de agente IA não está carregado corretamente."); return;
        }
        generateSavingsPlanBtn.disabled = true;
        savingsPlanLoader.classList.remove("hidden");
        savingsPlanResultCard.classList.add("hidden");
        try {
          const res = await window.App.UIAgent.askSavingsPlan();
          const { parseMarkdownToHTML } = window.App.UIUtils;
          savingsPlanTextContent.innerHTML = parseMarkdownToHTML(res);
          const now = new Date();
          savingsPlanTimestamp.textContent = `Plano gerado em: ${now.toLocaleDateString()} às ${now.toLocaleTimeString()}`;
          savingsPlanResultCard.classList.remove("hidden");
        } catch (err) {
          alert(`Erro ao gerar plano: ${err.message}`);
        } finally {
          generateSavingsPlanBtn.disabled = false;
          savingsPlanLoader.classList.add("hidden");
        }
      });
    }
  }

  function render(state) {
    const { formatCurrency } = window.App.UIUtils;
    const { perfis, perfilAtivo, despesas, anoAtivo, financiamentos } = state;
    const ativo = perfis.find(p => p.nome === perfilAtivo);
    
    if (reportsContainer && !reportsContainer.classList.contains("hidden")) {
      const selectedMonth = parseInt(reportsPizzaMonthSelect.value);
      let pizzaSummary;
      if (selectedMonth === 0) {
        pizzaSummary = window.App.Engine.calculateAnnualSummary(ativo, despesas, financiamentos, anoAtivo);
      } else {
        pizzaSummary = window.App.Engine.calculateMonthlySummary(ativo, selectedMonth, despesas, financiamentos, anoAtivo);
      }

      // Desenhar gráficos principais
      if (window.App.Charts) {
        window.App.Charts.renderPizzaChart("pizza-chart-canvas", pizzaSummary.gastosPorCategoria);
        const projection = window.App.Engine.calculateCardProjection(despesas, perfilAtivo, anoAtivo);
        window.App.Charts.renderLineChart("line-chart-canvas", projection);
      }

      // Desenhar Barras de Progresso por Categoria
      if (reportsBudgetProgressContainer) {
        reportsBudgetProgressContainer.innerHTML = "";
        const userColors = state.categorias || {};
        const DEFAULT_COLORS = {
          "Saúde": "#10b981", "Alimentação": "#0ea5e9", "Moradia": "#6366f1",
          "Cartão de Crédito": "#f59e0b", "Lazer": "#f43f5e", "Serviços por Assinatura": "#8b5cf6",
          "Serviços": "#14b8a6", "Financiamento": "#d946ef", "Outros": "#64748b"
        };
        for (const cat in pizzaSummary.gastosPorCategoria) {
          const valor = pizzaSummary.gastosPorCategoria[cat];
          const pct = pizzaSummary.porcentagemPorCategoria[cat];
          const catCor = userColors[cat] || DEFAULT_COLORS[cat] || "#64748b";
          const barDiv = document.createElement("div");
          barDiv.className = "flex flex-col space-y-1.5";
          barDiv.innerHTML = `
            <div class="flex justify-between items-center text-xs font-semibold">
              <span class="text-slate-350">${cat}: <span class="font-mono text-indigo-300 font-bold">${formatCurrency(valor)}</span></span>
              <span class="text-slate-400 font-mono">${pct}%</span>
            </div>
            <div class="w-full bg-slate-850 h-2.5 rounded-full overflow-hidden border border-slate-800/40">
              <div class="h-full rounded-full transition-all duration-500" style="width: ${Math.min(pct, 100)}%; background-color: ${catCor}"></div>
            </div>
          `;
          reportsBudgetProgressContainer.appendChild(barDiv);
        }
      }

      // Renderizar Planejador Financeiro Comparativo
      if (plannerComparisonTableBody) {
        plannerComparisonTableBody.innerHTML = "";
        const plannerMethod = plannerMethodSelect ? plannerMethodSelect.value : "Equilibrado";
        const limites = (state.planejamento && state.planejamento[plannerMethod]) || {};
        
        if (window.App.Charts) window.App.Charts.renderPlannerChart("planner-chart-canvas", limites);

        const salary = ativo ? ativo.salario : 0;
        const factor = selectedMonth === 0 ? 12 : 1;
        const actualExpenses = {};
        for (const cat in state.categorias) {
          actualExpenses[cat] = parseFloat(pizzaSummary.gastosPorCategoria[cat]) || 0;
        }
        
        // Consolidar financiamento como moradia no planejamento
        const finVal = actualExpenses["Financiamento"] || 0;
        actualExpenses["Moradia"] = (actualExpenses["Moradia"] || 0) + finVal;
        actualExpenses["Financiamento"] = 0;

        for (const cat in state.categorias) {
          const pct = limites[cat] !== undefined ? limites[cat] : 0;
          const limitVal = salary * factor * (pct / 100);
          const actualVal = actualExpenses[cat] || 0;

          if (pct === 0 && actualVal === 0 && cat !== "Moradia" && cat !== "Investimento") continue;

          const row = document.createElement("tr");
          row.className = "border-b border-slate-900/40 hover:bg-slate-900/20 transition";
          
          let statusHtml = "";
          if (cat === "Investimento") {
            const atingiu = actualVal >= limitVal;
            statusHtml = atingiu
              ? `<span class="bg-emerald-950/40 text-emerald-400 border border-emerald-900/40 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">Atingido</span>`
              : `<span class="bg-rose-950/40 text-rose-400 border border-rose-900/40 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">Abaixo da meta</span>`;
          } else {
            const extrapolou = actualVal > limitVal;
            statusHtml = extrapolou
              ? `<span class="bg-rose-950/40 text-rose-400 border border-rose-900/40 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">Excedeu o limite</span>`
              : `<span class="bg-emerald-950/40 text-emerald-400 border border-emerald-900/40 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">Saudável</span>`;
          }

          row.innerHTML = `
            <td class="py-3 px-4 font-medium text-slate-300 text-xs">${cat}</td>
            <td class="py-3 px-4 text-slate-400 font-mono text-xs">${pct}%</td>
            <td class="py-3 px-4 text-indigo-300 font-mono text-xs font-bold">${formatCurrency(limitVal)}</td>
            <td class="py-3 px-4 text-slate-300 font-mono text-xs">${formatCurrency(actualVal)}</td>
            <td class="py-3 px-4 text-right">${statusHtml}</td>
          `;
          plannerComparisonTableBody.appendChild(row);
        }
      }
    }
  }

  return { mapElements, init, render };
})();
