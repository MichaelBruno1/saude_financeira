// ── Módulo: Investimentos ──────────────────────────────────────────────────────
window.App = window.App || {};

window.App.UIInvestments = (() => {
  let investmentsContainer, kpiTotalInvestido, kpiReservaEmergencia;
  let kpiFgtsView, kpiFgtsInput, btnEditFgts, btnSaveFgts, kpiTotalComFgts;
  let investmentsTableBody;
  let generateInvestmentsAnalysisBtn, investmentsAnalysisLoader;
  let investmentsAnalysisResultCard, investmentsAnalysisTimestamp, investmentsAnalysisTextContent;
  let investmentsAnalysisResultCard, investmentsAnalysisTimestamp, investmentsAnalysisTextContent;
  
  function mapElements(DOM_IDS) {
    const g = id => document.getElementById(id);
    const s = window.App.UIState;
    investmentsContainer           = g(DOM_IDS.INVESTMENTS_CONTAINER);
    kpiTotalInvestido              = g(DOM_IDS.KPI_TOTAL_INVESTIDO);
    kpiReservaEmergencia           = g(DOM_IDS.KPI_RESERVA_EMERGENCIA);
    kpiFgtsView                    = g(DOM_IDS.KPI_FGTS_VIEW);
    kpiFgtsInput                   = g(DOM_IDS.KPI_FGTS_INPUT);
    btnEditFgts                    = g(DOM_IDS.BTN_EDIT_FGTS);
    btnSaveFgts                    = g(DOM_IDS.BTN_SAVE_FGTS);
    kpiTotalComFgts                = g(DOM_IDS.KPI_TOTAL_COM_FGTS);
    investmentsTableBody           = g(DOM_IDS.INVESTMENTS_TABLE_BODY);
    generateInvestmentsAnalysisBtn = g(DOM_IDS.GENERATE_INVESTMENTS_ANALYSIS_BTN);
    investmentsAnalysisLoader      = g(DOM_IDS.INVESTMENTS_ANALYSIS_LOADER);
    investmentsAnalysisResultCard  = g(DOM_IDS.INVESTMENTS_ANALYSIS_RESULT_CARD);
    investmentsAnalysisTimestamp   = g(DOM_IDS.INVESTMENTS_ANALYSIS_TIMESTAMP);
    investmentsAnalysisTextContent = g(DOM_IDS.INVESTMENTS_ANALYSIS_TEXT_CONTENT);

    // Compartilha referencias usadas por ui-core
    s.investmentsContainer = investmentsContainer;
  }

  function init() {
    const { formatBRLInput, parseBRLValue, showStatus } = window.App.UIUtils;
    
    // FGTS Inline Edit
    if (btnEditFgts && kpiFgtsInput && kpiFgtsView && btnSaveFgts) {
      kpiFgtsInput.addEventListener("input", () => {
        kpiFgtsInput.value = formatBRLInput(kpiFgtsInput.value);
      });
      btnEditFgts.addEventListener("click", () => {
        const state = window.App.State.getState();
        const activeProfileName = state.perfilAtivo || "Principal";
        const profile = state.perfis.find(p => p.nome === activeProfileName) || { fgts: 0 };
        kpiFgtsInput.value = formatBRLInput((profile.fgts || 0).toFixed(2));
        kpiFgtsView.classList.add("hidden");
        btnEditFgts.classList.add("hidden");
        kpiFgtsInput.classList.remove("hidden");
        btnSaveFgts.classList.remove("hidden");
        kpiFgtsInput.focus();
      });
      const cancelFgtsEdit = () => {
        kpiFgtsInput.classList.add("hidden");
        btnSaveFgts.classList.add("hidden");
        kpiFgtsView.classList.remove("hidden");
        btnEditFgts.classList.remove("hidden");
      };
      btnSaveFgts.addEventListener("click", () => {
        const novoFgts = parseBRLValue(kpiFgtsInput.value);
        if (isNaN(novoFgts) || novoFgts < 0) {
          showStatus("Digite um valor válido de FGTS.", true); return;
        }
        try {
          window.App.State.atualizarFgts(novoFgts);
          cancelFgtsEdit();
          showStatus("Valor de FGTS atualizado!");
        } catch (err) {
          showStatus(err.message, true);
        }
      });
      kpiFgtsInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter") btnSaveFgts.click();
        else if (e.key === "Escape") cancelFgtsEdit();
      });
    }

    // Agent Bindings (Analise de Investimentos e Plano de Economia)
    if (generateInvestmentsAnalysisBtn) {
      generateInvestmentsAnalysisBtn.addEventListener("click", async () => {
        if (!window.App.UIAgent || !window.App.UIAgent.askInvestmentsAnalysis) {
          alert("O módulo de agente IA não está carregado corretamente."); return;
        }
        generateInvestmentsAnalysisBtn.disabled = true;
        investmentsAnalysisLoader.classList.remove("hidden");
        investmentsAnalysisResultCard.classList.add("hidden");
        try {
          const res = await window.App.UIAgent.askInvestmentsAnalysis();
          const { parseMarkdownToHTML } = window.App.UIUtils;
          investmentsAnalysisTextContent.innerHTML = parseMarkdownToHTML(res);
          const now = new Date();
          investmentsAnalysisTimestamp.textContent = `Análise gerada em: ${now.toLocaleDateString()} às ${now.toLocaleTimeString()}`;
          investmentsAnalysisResultCard.classList.remove("hidden");
        } catch (err) {
          alert(`Erro ao gerar análise: ${err.message}`);
        } finally {
          generateInvestmentsAnalysisBtn.disabled = false;
          investmentsAnalysisLoader.classList.add("hidden");
        }
      });
    }
    // (Savings plan was moved to ui-reports.js)
  }

  function render(state) {
    const { formatCurrency } = window.App.UIUtils;
    const { despesas, perfilAtivo, financiamentos } = state;
    
    const investExpenses = despesas.filter(d => d.perfil === perfilAtivo && d.categoria === "Investimento");
    const totalInvested = investExpenses.reduce((sum, d) => sum + d.valor, 0);

    const activeProfile = state.perfis.find(p => p.nome === perfilAtivo) || { fgts: 0 };
    const fgtsVal = activeProfile.fgts || 0;

    // Calcular Reserva de Emergencia Ideal
    const recurrentExpensesSum = despesas.filter(d => d.perfil === perfilAtivo && d.recorrente === true).reduce((sum, d) => sum + d.valor, 0);
    const financingInstallmentsSum = financiamentos.filter(f => f.perfil === perfilAtivo).reduce((sum, f) => sum + f.valorParcela, 0);
    const targetReserve = (recurrentExpensesSum + financingInstallmentsSum) * 6;

    if (kpiReservaEmergencia) {
      kpiReservaEmergencia.textContent = formatCurrency(targetReserve);
      if (targetReserve > 0) {
        if (totalInvested < 0.8 * targetReserve) kpiReservaEmergencia.className = "text-base font-bold text-rose-400 mt-0.5";
        else if (totalInvested < targetReserve) kpiReservaEmergencia.className = "text-base font-bold text-amber-400 mt-0.5";
        else kpiReservaEmergencia.className = "text-base font-bold text-emerald-400 mt-0.5";
      } else {
        kpiReservaEmergencia.className = "text-base font-bold text-emerald-400 mt-0.5";
      }
    }
    if (kpiTotalInvestido) kpiTotalInvestido.textContent = formatCurrency(totalInvested);
    if (kpiFgtsView) kpiFgtsView.textContent = formatCurrency(fgtsVal);
    if (kpiTotalComFgts) kpiTotalComFgts.textContent = formatCurrency(totalInvested + fgtsVal);

    // Tabela de aportes
    if (investmentsTableBody) {
      investmentsTableBody.innerHTML = "";
      if (investExpenses.length === 0) {
        investmentsTableBody.innerHTML = `<tr><td colspan="4" class="text-center py-8 text-slate-500 text-xs font-medium">Nenhum investimento cadastrado.</td></tr>`;
      } else {
        investExpenses.forEach(d => {
          const tr = document.createElement("tr");
          tr.className = "hover:bg-slate-900/30 transition-colors border-b border-slate-850/50";
          tr.innerHTML = `
            <td class="py-3 px-3 font-semibold text-slate-250">${d.descricao}</td>
            <td class="py-3 px-3"><span class="bg-indigo-950/40 text-indigo-400 border border-indigo-900/30 px-2.5 py-0.5 rounded-lg text-[10px] font-bold">${d.subcategoria || "Outros"}</span></td>
            <td class="py-3 px-3 font-bold text-emerald-400">${formatCurrency(d.valor)}</td>
            <td class="py-3 px-3 text-slate-400">${d.mes_inicio}/${d.ano_inicio}</td>
          `;
          investmentsTableBody.appendChild(tr);
        });
      }
    }

    // Grafico
    const distribution = {};
    investExpenses.forEach(d => {
      const subcat = d.subcategoria || "Outros";
      distribution[subcat] = (distribution[subcat] || 0) + d.valor;
    });
    if (fgtsVal > 0) distribution["FGTS"] = (distribution["FGTS"] || 0) + fgtsVal;

    if (window.App.Charts) {
      window.App.Charts.renderInvestmentsChart("investments-chart-canvas", distribution);

      // Scatter Chart Data
      const currentYear = state.anoAtivo || new Date().getFullYear();
      const monthLabels = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
      const scatterValues = new Array(12).fill(0);
      
      investExpenses.forEach(d => {
        if (d.ano_inicio < currentYear || (d.ano_inicio === currentYear && d.mes_inicio <= 12)) {
           // Se é recorrente
           if (d.recorrente) {
             let startM = (d.ano_inicio < currentYear) ? 1 : d.mes_inicio;
             for (let m = startM; m <= 12; m++) {
               scatterValues[m - 1] += d.valor;
             }
           } else {
             // Aporte unico
             if (d.ano_inicio === currentYear && d.mes_inicio >= 1 && d.mes_inicio <= 12) {
               scatterValues[d.mes_inicio - 1] += d.valor;
             }
           }
        }
      });
      window.App.Charts.renderInvestmentsScatterChart("investments-scatter-canvas", {
        labels: monthLabels,
        values: scatterValues
      });
    }
  }

  return { mapElements, init, render };
})();
