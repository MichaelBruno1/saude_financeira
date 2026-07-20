// ── Módulo: Financiamentos ────────────────────────────────────────────────────
// Responsável pelo modal de financiamentos, tabela de contratos e simulador SAC.
window.App = window.App || {};

window.App.UIFinancing = (() => {
  let financingModal, closeFinancingModalBtn, modalFinancingCancelBtn;
  let financingTableBody, financingRegisterForm;
  let financingNameInput, financingTotalValInput, financingInstallmentValInput, financingSystemSelect;
  let financingInstallmentsCountInput, financingTrRateInput, financingAnnualInterestRateInput;
  let simulatorFinancingSelect, simulatorAmortizationVal, simulatorAmortizationFrequency;
  let simulationResultsContainer;
  let simKpiJurosSaved, simKpiMonthsSaved;
  let simTableNormalMonths, simTableNormalJuros, simTableNormalTotal;
  let simTableAmortMonths, simTableAmortJuros, simTableAmortTotal;
  let btnGenerateAmortizationPlan, amortizationPlanSpinner, amortizationPlanResult, planFinancingSelect;

  function mapElements(DOM_IDS) {
    const g = id => document.getElementById(id);
    const s = window.App.UIState;
    financingModal              = g(DOM_IDS.FINANCING_MODAL);
    closeFinancingModalBtn      = g(DOM_IDS.CLOSE_FINANCING_MODAL_BTN);
    modalFinancingCancelBtn     = g(DOM_IDS.MODAL_FINANCING_CANCEL_BTN);
    financingTableBody          = g(DOM_IDS.FINANCING_TABLE_BODY);
    financingRegisterForm       = g(DOM_IDS.FINANCING_REGISTER_FORM);
    financingNameInput          = g(DOM_IDS.FINANCING_NAME);
    financingTotalValInput      = g(DOM_IDS.FINANCING_TOTAL_VAL);
    financingInstallmentValInput= g(DOM_IDS.FINANCING_INSTALLMENT_VAL);
    financingSystemSelect       = g(DOM_IDS.FINANCING_SYSTEM);
    financingInstallmentsCountInput = g(DOM_IDS.FINANCING_INSTALLMENTS_COUNT);
    financingTrRateInput        = g(DOM_IDS.FINANCING_TR_RATE);
    financingAnnualInterestRateInput = g(DOM_IDS.FINANCING_ANNUAL_INTEREST_RATE);
    simulatorFinancingSelect    = g(DOM_IDS.SIMULATOR_FINANCING_SELECT);
    simulatorAmortizationVal    = g(DOM_IDS.SIMULATOR_AMORTIZATION_VAL);
    simulatorAmortizationFrequency = g(DOM_IDS.SIMULATOR_AMORTIZATION_FREQUENCY);
    simulationResultsContainer  = g(DOM_IDS.SIMULATION_RESULTS_CONTAINER);
    simKpiJurosSaved            = g(DOM_IDS.SIM_KPI_JUROS_SAVED);
    simKpiMonthsSaved           = g(DOM_IDS.SIM_KPI_MONTHS_SAVED);
    simTableNormalMonths        = g(DOM_IDS.SIM_TABLE_NORMAL_MONTHS);
    simTableNormalJuros         = g(DOM_IDS.SIM_TABLE_NORMAL_JUROS);
    simTableNormalTotal         = g(DOM_IDS.SIM_TABLE_NORMAL_TOTAL);
    simTableAmortMonths         = g(DOM_IDS.SIM_TABLE_AMORT_MONTHS);
    simTableAmortJuros          = g(DOM_IDS.SIM_TABLE_AMORT_JUROS);
    simTableAmortTotal          = g(DOM_IDS.SIM_TABLE_AMORT_TOTAL);
    // Compartilha referências usadas por ui-expenses para o modal de financiamento
    s.financingModal            = financingModal;
    s.financingNameInput        = financingNameInput;
    s.financingTotalValInput    = financingTotalValInput;
    s.financingInstallmentValInput = financingInstallmentValInput;
    s.financingRegisterForm     = financingRegisterForm;
    s.financingInstallmentsCountInput = financingInstallmentsCountInput;
    s.financingTrRateInput      = financingTrRateInput;
    s.financingSystemSelect     = financingSystemSelect;
    s.financingAnnualInterestRateInput = financingAnnualInterestRateInput;
    btnGenerateAmortizationPlan = s.btnGenerateAmortizationPlan;
    amortizationPlanSpinner     = s.amortizationPlanSpinner;
    amortizationPlanResult      = s.amortizationPlanResult;
    planFinancingSelect         = s.planFinancingSelect;
  }

  function hideFinancingModal() {
    financingModal.classList.add("hidden");
    financingRegisterForm.reset();
    window.App.UIState.editingFinancingId = null;
  }

  function openFinancingModal() {
    const DOM_IDS = window.App.UI_DOM_IDS;
    const s = window.App.UIState;
    s.editingFinancingId = null;

    if (financingNameInput) financingNameInput.disabled = false;
    if (financingTotalValInput) financingTotalValInput.disabled = false;
    if (financingInstallmentValInput) financingInstallmentValInput.disabled = false;
    if (financingSystemSelect) financingSystemSelect.disabled = false;
    if (financingAnnualInterestRateInput) financingAnnualInterestRateInput.disabled = false;

    const startMonth = document.getElementById(DOM_IDS.FINANCING_START_MONTH);
    const startYear = document.getElementById(DOM_IDS.FINANCING_START_YEAR);
    if (startMonth) startMonth.disabled = false;
    if (startYear) startYear.disabled = false;

    if (financingRegisterForm) financingRegisterForm.reset();

    const modalTitle = financingModal ? financingModal.querySelector("h3") : null;
    const submitBtn = financingRegisterForm ? financingRegisterForm.querySelector('button[type="submit"]') : null;
    if (modalTitle) modalTitle.textContent = "Cadastrar Financiamento";
    if (submitBtn) submitBtn.textContent = "Salvar";

    if (financingModal) {
      financingModal.classList.remove("hidden");
    }
    if (financingNameInput) {
      financingNameInput.focus();
    }
  }

  function runSimulation() {
    const { formatCurrency, parseBRLValue } = window.App.UIUtils;
    if (!simulatorFinancingSelect || !simulationResultsContainer) return;
    const selectedId = simulatorFinancingSelect.value;
    const extraVal   = parseBRLValue(simulatorAmortizationVal.value);
    const freq       = simulatorAmortizationFrequency.value;
    if (!selectedId) { simulationResultsContainer.classList.add("hidden"); return; }
    const state = window.App.State.getState();
    const f = state.financiamentos.find(item => item.id === selectedId);
    if (!f) { simulationResultsContainer.classList.add("hidden"); return; }
    const res = window.App.Engine.simulateAmortization(f.valorTotal, f.valorParcela, f.parcelasTotais, f.taxaTR, extraVal, freq, f.sistema, f.taxaJurosAnual);
    simulationResultsContainer.classList.remove("hidden");
    simKpiJurosSaved.textContent  = formatCurrency(res.jurosEconomizados);
    simKpiMonthsSaved.textContent = `${res.mesesEconomizados} meses`;
    simTableNormalMonths.textContent = `${res.normalMonths} meses`;
    simTableNormalJuros.textContent  = formatCurrency(res.normalInterest);
    simTableNormalTotal.textContent  = formatCurrency(res.normalTotal);
    simTableAmortMonths.textContent  = `${res.amortMonths} meses`;
    simTableAmortJuros.textContent   = formatCurrency(res.amortInterest);
    simTableAmortTotal.textContent   = formatCurrency(res.amortTotal);
  }

  function init() {
    const { parseBRLValue, formatBRLInput, showStatus } = window.App.UIUtils;
    const DOM_IDS = window.App.UI_DOM_IDS;
    const s = window.App.UIState;

    if (closeFinancingModalBtn) closeFinancingModalBtn.addEventListener("click", hideFinancingModal);
    if (modalFinancingCancelBtn) modalFinancingCancelBtn.addEventListener("click", hideFinancingModal);
    if (s.btnAddFinanciamento) s.btnAddFinanciamento.addEventListener("click", () => openFinancingModal());

    if (financingRegisterForm) {
      financingRegisterForm.addEventListener("submit", e => {
      e.preventDefault();
      const count = parseInt(financingInstallmentsCountInput.value);
      const tr    = parseFloat(financingTrRateInput.value) || 0;
      if (isNaN(count) || count <= 0) { alert("Por favor, digite uma quantidade válida de parcelas."); return; }
      try {
        const sistema = financingSystemSelect ? financingSystemSelect.value : "price";
        const annualInterestRate = financingAnnualInterestRateInput ? parseFloat(financingAnnualInterestRateInput.value) || 0 : 0;
        if (s.editingFinancingId) {
          window.App.State.atualizarFinanciamento(s.editingFinancingId, count, tr, sistema, annualInterestRate);
          showStatus("Financiamento atualizado!");
        } else {
          const nome    = financingNameInput.value.trim();
          const total   = parseBRLValue(financingTotalValInput.value);
          const parcVal = parseBRLValue(financingInstallmentValInput.value);
          const mesInicio = parseInt(document.getElementById(DOM_IDS.FINANCING_START_MONTH).value) || 1;
          const anoInicio = parseInt(document.getElementById(DOM_IDS.FINANCING_START_YEAR).value) || new Date().getFullYear();
          if (!nome) { alert("Nome do financiamento inválido."); return; }
          if (isNaN(total) || total <= 0 || isNaN(parcVal) || parcVal <= 0) { alert("Por favor, digite valores válidos superiores a zero."); return; }
          window.App.State.adicionarFinanciamento(nome, total, parcVal, count, tr, mesInicio, anoInicio, sistema, annualInterestRate);
          showStatus("Financiamento cadastrado!");
        }
        hideFinancingModal();
      } catch (err) { alert("Erro ao salvar financiamento."); console.error(err); }
    });
    }

    if (simulatorFinancingSelect)    simulatorFinancingSelect.addEventListener("change", runSimulation);
    if (simulatorAmortizationVal)    simulatorAmortizationVal.addEventListener("input", runSimulation);
    if (simulatorAmortizationFrequency) simulatorAmortizationFrequency.addEventListener("change", runSimulation);

    // Gerador de Plano de Amortização Inteligente
    if (btnGenerateAmortizationPlan) {
      btnGenerateAmortizationPlan.addEventListener("click", async () => {
        const { parseMarkdownToHTML } = window.App.UIUtils;
        const selectedFinancingId = planFinancingSelect ? planFinancingSelect.value : "";
        if (!selectedFinancingId) {
          alert("Selecione um financiamento no seletor acima antes de gerar o plano.");
          return;
        }

        try {
          if (amortizationPlanSpinner) amortizationPlanSpinner.classList.remove("hidden");
          btnGenerateAmortizationPlan.disabled = true;
          const textSpan = document.getElementById("btn-generate-amortization-plan-text");
          if (textSpan) textSpan.textContent = "Gerando Plano Inteligente...";

          const planMarkdown = await window.App.UIAgent.askAmortizationPlan(selectedFinancingId);

          if (amortizationPlanResult) {
            amortizationPlanResult.innerHTML = parseMarkdownToHTML(planMarkdown);
            amortizationPlanResult.classList.remove("hidden");
          }
        } catch (err) {
          alert(`Erro ao gerar plano de amortização: ${err.message}`);
          console.error(err);
        } finally {
          if (amortizationPlanSpinner) amortizationPlanSpinner.classList.add("hidden");
          btnGenerateAmortizationPlan.disabled = false;
          const textSpan = document.getElementById("btn-generate-amortization-plan-text");
          if (textSpan) textSpan.textContent = "Gerar Plano IA";
        }
      });
    }
  }

  function render(state) {
    const { formatCurrency, formatBRLInput, showStatus } = window.App.UIUtils;
    const s = window.App.UIState;
    const DOM_IDS = window.App.UI_DOM_IDS;
    const MONTHS = window.App.UI_MONTHS;
    const { perfilAtivo, financiamentos } = state;

    if (s.lastRenderedProfile !== state.perfilAtivo) {
      s.lastRenderedProfile = state.perfilAtivo;
      if (amortizationPlanResult) {
        amortizationPlanResult.classList.add("hidden");
        amortizationPlanResult.innerHTML = "";
      }
    }

    // A. Tabela de financiamentos
    if (financingTableBody) {
      financingTableBody.innerHTML = "";
      const fAtivos = financiamentos.filter(f => f.perfil === perfilAtivo);
      if (fAtivos.length === 0) {
        financingTableBody.innerHTML = `<tr><td colspan="6" class="text-center py-8 text-slate-500 text-xs font-medium">Nenhum financiamento cadastrado.</td></tr>`;
      } else {
        fAtivos.forEach(f => {
          const currentYear  = new Date().getFullYear();
          const currentMonth = new Date().getMonth() + 1;
          const S_month = parseInt(f.mes_inicio) || 1;
          const S_year  = parseInt(f.ano_inicio) || currentYear;
          const startAbs = S_year * 12 + S_month - 1;
          const nowAbs   = currentYear * 12 + currentMonth - 1;
          const index    = nowAbs - startAbs + 1;
          // Calcular Saldo Devedor dinâmico no mês de referência
          const refMonth = state.mesAtivo <= 12 ? state.mesAtivo : currentMonth;
          const refYear  = state.anoAtivo || currentYear;
          const details = window.App.Engine.getFinancingDetailsForMonth(f, refMonth, refYear, state.despesas);
          const saldoDevedor = details.saldoDevedorAntes;
          const actualN = details.actualMonths;

          let progressoTexto;
          if (index < 1)              progressoTexto = `0 de ${actualN} (Não Iniciado)`;
          else if (index > actualN)   progressoTexto = `${actualN} de ${actualN} (Quitado)`;
          else                        progressoTexto = `${index} de ${actualN}`;
          const endAbs   = startAbs + actualN - 1;
          const endMonth = (endAbs % 12) + 1;
          const endYear  = Math.floor(endAbs / 12);
          const previsaoFim = `${MONTHS[endMonth - 1]} de ${endYear}`;

          const row = document.createElement("tr");
          row.className = "hover:bg-slate-900/40 transition border-b border-slate-850 text-slate-350";
          row.innerHTML = `
            <td class="py-3 px-4 font-medium text-slate-200">${f.nome}</td>
            <td class="py-3 px-4 font-mono">${progressoTexto}</td>
            <td class="py-3 px-4 font-mono">
              <span class="text-emerald-400 font-bold">${formatCurrency(saldoDevedor)}</span>
              <br>
              <span class="text-slate-500 text-[10px]">de ${formatCurrency(f.valorTotal)}</span>
            </td>
            <td class="py-3 px-4 font-mono text-xxs">${f.taxaTR}% T.R. <br> ${(f.taxaJurosAnual || 0)}% a.a. <br> <span class="text-slate-500">Sistema ${String(f.sistema || 'price').toUpperCase()}</span></td>
            <td class="py-3 px-4">${previsaoFim}</td>
            <td class="py-3 px-4 text-right">
              <button class="edit-financing-btn bg-slate-800 hover:bg-slate-750 text-indigo-300 hover:text-indigo-200 border border-slate-700 hover:border-slate-650 px-2.5 py-1 rounded-lg transition text-xs mr-1.5 focus:outline-none" data-id="${f.id}">Editar</button>
              <button class="remove-financing-btn bg-red-950/20 hover:bg-red-950/40 text-red-400 hover:text-red-300 border border-red-500/20 hover:border-red-500/40 px-2.5 py-1 rounded-lg transition text-xs focus:outline-none" data-id="${f.id}">Deletar</button>
            </td>
          `;
          financingTableBody.appendChild(row);
        });

        // Bind: deletar
        financingTableBody.querySelectorAll(".remove-financing-btn").forEach(btn => {
          btn.addEventListener("click", e => {
            const fid = e.target.getAttribute("data-id");
            if (confirm("Deseja realmente deletar este financiamento?")) {
              try { window.App.State.removerFinanciamento(fid); showStatus("Financiamento deletado."); }
              catch (err) { showStatus(err.message, true); }
            }
          });
        });

        // Bind: editar
        financingTableBody.querySelectorAll(".edit-financing-btn").forEach(btn => {
          btn.addEventListener("click", e => {
            const fid   = e.target.getAttribute("data-id");
            const found = fAtivos.find(f => f.id === fid);
            if (!found) return;
            s.editingFinancingId = found.id;
            financingNameInput.value = found.nome;
            financingTotalValInput.value = formatBRLInput(found.valorTotal.toFixed(2));
            financingInstallmentValInput.value = formatBRLInput(found.valorParcela.toFixed(2));
            if (financingSystemSelect) {
              financingSystemSelect.value = found.sistema || "price";
            }
            if (financingAnnualInterestRateInput) {
              financingAnnualInterestRateInput.value = found.taxaJurosAnual || 0;
            }
            financingInstallmentsCountInput.value = found.parcelasTotais;
            financingTrRateInput.value = found.taxaTR;
            document.getElementById(DOM_IDS.FINANCING_START_MONTH).value = found.mes_inicio;
            document.getElementById(DOM_IDS.FINANCING_START_YEAR).value  = found.ano_inicio;
            const modalTitle = financingModal.querySelector("h3");
            const submitBtn  = financingRegisterForm.querySelector('button[type="submit"]');
            if (modalTitle) modalTitle.textContent = "Editar Financiamento";
            if (submitBtn)  submitBtn.textContent  = "Salvar Alterações";
            financingNameInput.disabled = true;
            financingTotalValInput.disabled = true;
            financingInstallmentValInput.disabled = true;
            document.getElementById(DOM_IDS.FINANCING_START_MONTH).disabled = true;
            document.getElementById(DOM_IDS.FINANCING_START_YEAR).disabled = true;
            financingModal.classList.remove("hidden");
            financingInstallmentsCountInput.focus();
          });
        });
      }
    }

    // B. Dropdown do simulador
    if (simulatorFinancingSelect) {
      const previousSelectVal = simulatorFinancingSelect.value;
      simulatorFinancingSelect.innerHTML = "";
      const defaultOpt = document.createElement("option");
      defaultOpt.value = ""; defaultOpt.textContent = "-- Escolha um Financiamento --";
      simulatorFinancingSelect.appendChild(defaultOpt);
      const fAtivos = financiamentos.filter(f => f.perfil === perfilAtivo);
      fAtivos.forEach(f => {
        const opt = document.createElement("option");
        opt.value = f.id; opt.textContent = `${f.nome} (${formatCurrency(f.valorTotal)})`;
        if (f.id === previousSelectVal) opt.selected = true;
        simulatorFinancingSelect.appendChild(opt);
      });
      runSimulation();
    }

    // C. Dropdown do gerador de plano IA
    if (planFinancingSelect) {
      const previousSelectVal = planFinancingSelect.value;
      planFinancingSelect.innerHTML = "";
      const defaultOpt = document.createElement("option");
      defaultOpt.value = ""; defaultOpt.textContent = "-- Escolha um Financiamento --";
      planFinancingSelect.appendChild(defaultOpt);
      const fAtivos = financiamentos.filter(f => f.perfil === perfilAtivo);
      fAtivos.forEach(f => {
        const opt = document.createElement("option");
        opt.value = f.id; opt.textContent = `${f.nome} (${formatCurrency(f.valorTotal)})`;
        if (f.id === previousSelectVal) opt.selected = true;
        planFinancingSelect.appendChild(opt);
      });
    }
  }

  return { mapElements, init, render };
})();
