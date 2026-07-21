// ── Módulo: Relatórios & Planejamento ─────────────────────────────────────────
window.App = window.App || {};

window.App.UIReports = (() => {
  let reportsContainer, reportsPizzaMonthSelect, reportsBudgetProgressContainer;
  let plannerMethodSelect, plannerComparisonTableBody, optReportMethodPersonalizado;
  let generateAiAnalysisBtn, aiAnalysisLoader, aiAnalysisResultCard, aiAnalysisTimestamp, aiAnalysisTextContent;
  let generateSavingsPlanBtn, savingsPlanLoader, savingsPlanResultCard, savingsPlanTimestamp, savingsPlanTextContent;
  
  let reportsComparisonCard, reportsComparisonSubtitle, reportsComparisonContainer;
  let lastProfile = null;

  function mapElements(DOM_IDS) {
    const g = id => document.getElementById(id);
    const s = window.App.UIState;
    reportsContainer                = g(DOM_IDS.REPORTS_CONTAINER);
    reportsPizzaMonthSelect         = g(DOM_IDS.REPORTS_PIZZA_MONTH_SELECT);
    reportsBudgetProgressContainer  = g(DOM_IDS.REPORTS_BUDGET_PROGRESS_CONTAINER);
    plannerMethodSelect             = g(DOM_IDS.PLANNER_METHOD_SELECT);
    plannerComparisonTableBody      = g(DOM_IDS.PLANNER_COMPARISON_TABLE_BODY);
    optReportMethodPersonalizado    = g(DOM_IDS.OPT_REPORT_METHOD_PERSONALIZADO);
    
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
    
    reportsComparisonCard           = g("reports-comparison-card");
    reportsComparisonSubtitle       = g("reports-comparison-subtitle");
    reportsComparisonContainer      = g("reports-comparison-container");

    // Compartilha referencias usadas pelo ui-core e outros
    s.reportsContainer = reportsContainer;
    s.reportsPizzaMonthSelect = reportsPizzaMonthSelect;
    s.plannerMethodSelect = plannerMethodSelect;
    s.plannerComparisonTableBody = plannerComparisonTableBody;
  }

  function init() {
    if (plannerMethodSelect) {
      plannerMethodSelect.addEventListener("change", () => {
        const state = window.App.State.getState();
        const activeProfile = state.perfilAtivo || "Principal";
        window.App.UIState.selectedMethodPerProfile = window.App.UIState.selectedMethodPerProfile || {};
        window.App.UIState.selectedMethodPerProfile[activeProfile] = plannerMethodSelect.value;
        window.App.UIReports.render(state);
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

  function renderMonthlyComparison(state, selectedMonth, currentSummary) {
    const { formatCurrency } = window.App.UIUtils;
    if (!reportsComparisonCard) return;

    if (selectedMonth === 0) {
      reportsComparisonCard.classList.add("hidden");
      return;
    }
    reportsComparisonCard.classList.remove("hidden");

    let prevMonth = selectedMonth - 1;
    let prevYear = state.anoAtivo || new Date().getFullYear();
    if (prevMonth === 0) {
      prevMonth = 12;
      prevYear = prevYear - 1;
    }

    const { perfis, perfilAtivo, despesas, financiamentos } = state;
    const ativo = perfis.find(p => p.nome === perfilAtivo);
    const prevSummary = window.App.Engine.calculateMonthlySummary(ativo, prevMonth, despesas, financiamentos, prevYear);

    const meses = [
      "", "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
      "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
    ];
    const currentMonthLabel = meses[selectedMonth];
    const prevMonthLabel = meses[prevMonth];
    
    if (reportsComparisonSubtitle) {
      reportsComparisonSubtitle.textContent = `Comparando ${currentMonthLabel} de ${state.anoAtivo} com ${prevMonthLabel} de ${prevYear}`;
    }

    if (!reportsComparisonContainer) return;
    reportsComparisonContainer.innerHTML = "";

    const userColors = state.categorias || {};
    const DEFAULT_COLORS = {
      "Saúde": "#10b981", "Alimentação": "#0ea5e9", "Moradia": "#6366f1",
      "Cartão de Crédito": "#f59e0b", "Lazer": "#f43f5e", "Serviços por Assinatura": "#8b5cf6",
      "Serviços": "#14b8a6", "Financiamento": "#d946ef", "Investimento": "#eab308", "Outros": "#64748b"
    };

    const categoriesSet = new Set([
      ...Object.keys(currentSummary.gastosPorCategoria),
      ...Object.keys(prevSummary.gastosPorCategoria)
    ]);

    let hasInsights = false;

    categoriesSet.forEach(cat => {
      const currentVal = currentSummary.gastosPorCategoria[cat] || 0;
      const prevVal = prevSummary.gastosPorCategoria[cat] || 0;

      if (currentVal === 0 && prevVal === 0) return;

      hasInsights = true;

      let pctChange = 0;
      let text = "";
      let isGood = false;
      let statusIcon = "";
      let changeColorClass = "";

      if (prevVal > 0 && currentVal > 0) {
        pctChange = ((currentVal - prevVal) / prevVal) * 100;
        const absPct = Math.abs(pctChange).toFixed(0);
        if (pctChange > 0) {
          text = `Seu gasto com ${cat} aumentou ${absPct}%`;
          isGood = (cat === "Investimento");
        } else if (pctChange < 0) {
          text = `Seu gasto com ${cat} diminuiu ${absPct}%`;
          isGood = (cat !== "Investimento");
        } else {
          text = `Seu gasto com ${cat} manteve-se estável`;
          isGood = true;
        }
      } else if (prevVal === 0 && currentVal > 0) {
        text = `Novo gasto em ${cat}: +${formatCurrency(currentVal)}`;
        isGood = (cat === "Investimento");
        pctChange = 100;
      } else if (prevVal > 0 && currentVal === 0) {
        text = `Seu gasto com ${cat} diminuiu 100% (economia de ${formatCurrency(prevVal)})`;
        isGood = (cat !== "Investimento");
        pctChange = -100;
      }

      if (pctChange === 0) {
        statusIcon = `<svg class="w-4 h-4 shrink-0 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4"></path></svg>`;
        changeColorClass = "text-slate-400";
      } else if (isGood) {
        // Redução de gastos ou Aumento de investimentos
        statusIcon = `<svg class="w-4 h-4 shrink-0 text-emerald-450" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6"></path></svg>`;
        changeColorClass = "text-emerald-400 font-bold";
      } else {
        // Aumento de gastos ou Redução de investimentos
        statusIcon = `<svg class="w-4 h-4 shrink-0 text-rose-455" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path></svg>`;
        changeColorClass = "text-rose-400 font-bold";
      }

      const cardColorBorder = isGood 
        ? "border-emerald-950/40 bg-emerald-950/5 hover:border-emerald-900/60" 
        : "border-rose-950/40 bg-rose-950/5 hover:border-rose-900/60";

      const itemCard = document.createElement("div");
      itemCard.className = `p-4 border rounded-xl flex flex-col justify-between gap-2.5 transition duration-200 ${cardColorBorder}`;
      
      const catColor = userColors[cat] || DEFAULT_COLORS[cat] || "#64748b";

      itemCard.innerHTML = `
        <div class="flex items-center justify-between gap-2">
          <span class="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border" style="color: ${catColor}; border-color: ${catColor}40; background-color: ${catColor}10">${cat}</span>
          ${statusIcon}
        </div>
        <p class="text-xs font-semibold text-slate-200 leading-snug">${text}</p>
        <div class="flex items-baseline justify-between text-[10px] text-slate-500 font-mono mt-1 pt-1.5 border-t border-slate-900/40">
          <span>Anterior: <strong class="text-slate-400 font-semibold">${formatCurrency(prevVal)}</strong></span>
          <span>Atual: <strong class="${changeColorClass}">${formatCurrency(currentVal)}</strong></span>
        </div>
      `;
      reportsComparisonContainer.appendChild(itemCard);
    });

    if (!hasInsights) {
      reportsComparisonContainer.innerHTML = `
        <div class="col-span-full text-center py-6 text-slate-500 text-xs font-medium">
          Nenhuma alteração registrada em relação ao mês anterior.
        </div>`;
    }
  }

  function render(state) {
    const { formatCurrency } = window.App.UIUtils;
    const { perfis, perfilAtivo, despesas, anoAtivo, financiamentos } = state;
    
    if (perfilAtivo !== lastProfile) {
      lastProfile = perfilAtivo;
      window.App.UIState.hasSetDefaultPlannerMethod = false;
    }

    const ativo = perfis.find(p => p.nome === perfilAtivo);
    
    if (reportsContainer && !reportsContainer.classList.contains("hidden")) {
      const selectedMonth = parseInt(reportsPizzaMonthSelect.value);
      let pizzaSummary;
      if (selectedMonth === 0) {
        pizzaSummary = window.App.Engine.calculateAnnualSummary(ativo, despesas, financiamentos, anoAtivo);
      } else {
        pizzaSummary = window.App.Engine.calculateMonthlySummary(ativo, selectedMonth, despesas, financiamentos, anoAtivo);
      }

      // Render comparative card
      renderMonthlyComparison(state, selectedMonth, pizzaSummary);

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

      const activeProfileName = state.perfilAtivo || "Principal";
      window.App.UIState.selectedMethodPerProfile = window.App.UIState.selectedMethodPerProfile || {};
      const hasPersonalizado = state.planejamento && state.planejamento["Personalizado"];

      if (optReportMethodPersonalizado) {
        if (hasPersonalizado) {
          optReportMethodPersonalizado.classList.remove("hidden");
        } else {
          optReportMethodPersonalizado.classList.add("hidden");
        }
      }

      let plannerMethod = window.App.UIState.selectedMethodPerProfile[activeProfileName];
      if (!plannerMethod) {
        plannerMethod = hasPersonalizado ? "Personalizado" : "Equilibrado";
      } else if (plannerMethod === "Personalizado" && !hasPersonalizado) {
        plannerMethod = "Equilibrado";
      }

      if (plannerMethodSelect) {
        plannerMethodSelect.value = plannerMethod;
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
