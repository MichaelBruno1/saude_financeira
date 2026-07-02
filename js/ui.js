// Namespace global
window.App = window.App || {};

window.App.UI = (() => {
  // Elementos do DOM cached
  let sidebarProfileSelect;
  let deleteProfileBtn;
  let sidebarNewProfileBtn;
  let newProfileModal;
  let closeProfileModalBtn;
  let modalCancelBtn;
  let modalProfileCreateForm;
  
  let exportCsvBtn;
  let csvFileInput;
  let importCsvBtn;
  let syncStatus;
  
  // KPIs
  let headerProfileName;
  let kpiSalario;
  let kpiDespesas;
  let kpiSaldo;
  
  // Salário Edit Inline
  let salaryViewMode;
  let salaryEditMode;
  let editSalaryBtn;
  let salaryInput;
  let saveSalaryBtn;
  let cancelSalaryBtn;

  // Abas e Botões do Sidebar
  let monthTabsContainer;
  let yearTabsContainer;
  let addExpenseBtn;
  let sidebarRelatoriosBtn;
  let sidebarFinanciamentoBtn;
  let sidebarDespesasBtn;
  let sidebarSettingsBtn;

  // Configurações
  let settingsContainer;
  let themeToggleBtn;
  let themeToggleBtnText;
  let addCategoryForm;
  let newCategoryName;
  let newCategoryColor;
  let newCategoryColorHex;
  let categoriesColorsList;

  // Planejador Financeiro (Relatórios)
  let plannerMethodSelect;
  let plannerComparisonTableBody;

  // Planejador Financeiro (Configurações)
  let settingsPlannerMethodSelect;
  let settingsPlannerLimitsForm;
  let settingsPlannerInputsGrid;
  let settingsPlannerTotalSum;
  let settingsPlannerWarning;
  let settingsPlannerInfo;
  let settingsPlannerSobraSpan;
  
  // Modal de Despesas
  let expenseModal;
  let closeExpenseModalBtn;
  let modalExpenseCancelBtn;
  let modalExpenseCreateForm;
  let modalExpenseDesc;
  let modalExpenseVal;
  let modalExpenseMonth;
  let modalExpenseYear;
  let modalExpenseCat;
  let modalExpenseInstallmentsContainer;
  let modalExpenseInstallments;

  // Modal de Financiamentos
  let financingModal;
  let closeFinancingModalBtn;
  let modalFinancingCancelBtn;
  let financingTableBody;
  
  // Containers Principais (Aba Comum vs Relatórios vs Financiamento)
  let monthlyExpensesContainer;
  let reportsContainer;
  let reportsPizzaMonthSelect;
  let reportsBudgetProgressContainer;

  let financingContainer;
  let financingRegisterForm;
  let financingNameInput;
  let financingTotalValInput;
  let financingInstallmentValInput;
  let financingInstallmentsCountInput;
  let financingTrRateInput;

  let simulatorFinancingSelect;
  let simulatorAmortizationVal;
  let simulatorAmortizationFrequency;

  let simulationResultsContainer;
  let simKpiJurosSaved;
  let simKpiMonthsSaved;
  let simTableNormalMonths;
  let simTableNormalJuros;
  let simTableNormalTotal;
  let simTableAmortMonths;
  let simTableAmortJuros;
  let simTableAmortTotal;
  // Tabelas
  let expenseCountBadge;
  let expensesTableBody;

  // Inteligência Artificial (LLM)
  let generateAiAnalysisBtn;
  let aiAnalysisLoader;
  let aiAnalysisResultCard;
  let aiAnalysisTimestamp;
  let aiAnalysisTextContent;

  // Controle de edição
  let editingExpenseId = null;
  let editingFinancingId = null;

  const MONTHS = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
  ];

  // Utilitário de formatação de moeda BRL para exibição textual
  function formatCurrency(value) {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  }

  // Mascaramento monetário em tempo real para campos de input
  function formatBRLInput(value) {
    let digits = value.replace(/\D/g, "");
    if (digits === "") return "";
    let numberVal = parseFloat(digits) / 100;
    return new Intl.NumberFormat('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(numberVal);
  }

  // Conversão de valor de texto formatado (BRL) para número flutuante (JS)
  function parseBRLValue(formattedString) {
    if (!formattedString) return 0;
    const clean = formattedString.replace(/\./g, "").replace(",", ".");
    return parseFloat(clean) || 0;
  }

  // Renderizar campos de edição de limites de porcentagem do planejador
  function renderPlannerSettingsForm() {
    if (!settingsPlannerInputsGrid || !settingsPlannerMethodSelect) return;
    settingsPlannerInputsGrid.innerHTML = "";

    const state = window.App.State.getState();
    const metodo = settingsPlannerMethodSelect.value;
    const limites = (state.planejamento && state.planejamento[metodo]) || {};
    const cats = state.categorias || {};

    for (const name in cats) {
      if (name === "Financiamento") continue;
      const val = limites[name] !== undefined ? limites[name] : 0;
      const div = document.createElement("div");
      div.className = "flex flex-col space-y-1.5";
      div.innerHTML = `
        <label class="text-xxs font-semibold text-slate-400 uppercase tracking-wider">${name}</label>
        <div class="relative flex items-center">
          <input type="number" min="0" max="100" step="1" data-category="${name}" value="${val}" class="planner-percentage-input w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-350 focus:outline-none focus:border-indigo-500 transition pr-8 font-mono">
          <span class="absolute right-3 text-xs text-slate-500 font-mono">%</span>
        </div>
      `;
      settingsPlannerInputsGrid.appendChild(div);
    }

    const inputs = settingsPlannerInputsGrid.querySelectorAll(".planner-percentage-input");
    inputs.forEach(inp => {
      inp.addEventListener("input", recalculatePlannerTotal);
    });

    recalculatePlannerTotal();
  }

  // Recalcular soma das porcentagens do planejador
  function recalculatePlannerTotal() {
    if (!settingsPlannerInputsGrid) return;
    const inputs = settingsPlannerInputsGrid.querySelectorAll(".planner-percentage-input");
    let total = 0;

    inputs.forEach(inp => {
      const catName = inp.getAttribute("data-category");
      if (catName !== "Investimento") {
        total += Math.max(0, parseFloat(inp.value) || 0);
      }
    });

    const invInput = Array.from(inputs).find(inp => inp.getAttribute("data-category") === "Investimento");
    const invVal = invInput ? Math.max(0, parseFloat(invInput.value) || 0) : 0;
    total += invVal;

    if (settingsPlannerTotalSum) {
      settingsPlannerTotalSum.textContent = `${total}%`;
    }

    if (total > 100) {
      if (settingsPlannerWarning) settingsPlannerWarning.classList.remove("hidden");
      if (settingsPlannerInfo) settingsPlannerInfo.classList.add("hidden");
    } else {
      if (settingsPlannerWarning) settingsPlannerWarning.classList.add("hidden");
      if (settingsPlannerInfo) settingsPlannerInfo.classList.remove("hidden");
      const sobra = 100 - total;
      if (settingsPlannerSobraSpan) {
        if (sobra > 0) {
          settingsPlannerSobraSpan.innerHTML = `&#x2192; <strong class="font-mono font-bold text-emerald-300">${sobra}%</strong> serão direcionados para <strong>Investimento</strong>`;
          settingsPlannerInfo.className = "ml-3 text-xxs font-semibold text-emerald-400";
        } else {
          settingsPlannerSobraSpan.innerHTML = `&#x2713; Orçamento completo!`;
          settingsPlannerInfo.className = "ml-3 text-xxs font-semibold text-slate-400";
        }
      }
    }
  }

  // Utilitário para exibir mensagens de status
  function showStatus(message, isError = false) {
    if (!syncStatus) return;
    syncStatus.textContent = message;
    syncStatus.className = `text-xs text-center font-medium mt-2 px-3 py-1.5 rounded-lg transition ${
      isError ? 'bg-red-950/40 text-red-400 border border-red-900/40' : 'bg-emerald-950/40 text-emerald-400 border border-emerald-900/40'
    }`;
    syncStatus.classList.remove('hidden');
    
    // Esconder após 4 segundos
    setTimeout(() => {
      syncStatus.classList.add('hidden');
    }, 4000);
  }

  // Função interna para rodar a simulação reativamente
  function runSimulation() {
    if (!simulatorFinancingSelect || !simulationResultsContainer) return;

    const selectedId = simulatorFinancingSelect.value;
    const extraVal = parseBRLValue(simulatorAmortizationVal.value);
    const freq = simulatorAmortizationFrequency.value;

    if (!selectedId) {
      simulationResultsContainer.classList.add("hidden");
      return;
    }

    const state = window.App.State.getState();
    const f = state.financiamentos.find(item => item.id === selectedId);
    if (!f) {
      simulationResultsContainer.classList.add("hidden");
      return;
    }

    // Executar os cálculos matemáticos da engine
    const res = window.App.Engine.simulateAmortization(
      f.valorTotal,
      f.valorParcela,
      f.parcelasTotais,
      f.taxaTR,
      extraVal,
      freq
    );

    // Preencher a UI de resultados da simulação
    simulationResultsContainer.classList.remove("hidden");
    simKpiJurosSaved.textContent = formatCurrency(res.jurosEconomizados);
    simKpiMonthsSaved.textContent = `${res.mesesEconomizados} meses`;

    simTableNormalMonths.textContent = `${res.normalMonths} meses`;
    simTableNormalJuros.textContent = formatCurrency(res.normalInterest);
    simTableNormalTotal.textContent = formatCurrency(res.normalTotal);

    simTableAmortMonths.textContent = `${res.amortMonths} meses`;
    simTableAmortJuros.textContent = formatCurrency(res.amortInterest);
    simTableAmortTotal.textContent = formatCurrency(res.amortTotal);
  }

  return {
    // Inicialização da interface e registro de escutas
    init() {
      // Mapeamento dos elementos
      sidebarProfileSelect = document.getElementById("sidebar-profile-select");
      deleteProfileBtn = document.getElementById("delete-profile-btn");
      sidebarNewProfileBtn = document.getElementById("sidebar-new-profile-btn");
      
      newProfileModal = document.getElementById("new-profile-modal");
      closeProfileModalBtn = document.getElementById("close-profile-modal-btn");
      modalCancelBtn = document.getElementById("modal-cancel-btn");
      modalProfileCreateForm = document.getElementById("modal-profile-create-form");
      
      exportCsvBtn = document.getElementById("export-csv-btn");
      csvFileInput = document.getElementById("csv-file-input");
      importCsvBtn = document.getElementById("import-csv-btn");
      syncStatus = document.getElementById("sync-status");
      
      headerProfileName = document.getElementById("header-profile-name");
      kpiSalario = document.getElementById("kpi-salario");
      kpiDespesas = document.getElementById("kpi-despesas");
      kpiSaldo = document.getElementById("kpi-saldo");
      
      salaryViewMode = document.getElementById("salary-view-mode");
      salaryEditMode = document.getElementById("salary-edit-mode");
      editSalaryBtn = document.getElementById("edit-salary-btn");
      salaryInput = document.getElementById("salary-input");
      saveSalaryBtn = document.getElementById("save-salary-btn");
      cancelSalaryBtn = document.getElementById("cancel-salary-btn");
      
      monthTabsContainer = document.getElementById("month-tabs-container");
      yearTabsContainer = document.getElementById("year-tabs-container");
      addExpenseBtn = document.getElementById("add-expense-btn");
      sidebarRelatoriosBtn = document.getElementById("sidebar-relatorios-btn");
      sidebarFinanciamentoBtn = document.getElementById("sidebar-financiamento-btn");
      sidebarDespesasBtn = document.getElementById("sidebar-despesas-btn");
      sidebarSettingsBtn = document.getElementById("sidebar-settings-btn");
      
      // Configurações
      settingsContainer = document.getElementById("settings-container");
      themeToggleBtn = document.getElementById("theme-toggle-btn");
      themeToggleBtnText = document.getElementById("theme-toggle-btn-text");
      addCategoryForm = document.getElementById("add-category-form");
      newCategoryName = document.getElementById("new-category-name");
      newCategoryColor = document.getElementById("new-category-color");
      newCategoryColorHex = document.getElementById("new-category-color-hex");
      categoriesColorsList = document.getElementById("categories-colors-list");
      
      // Modal Despesas
      expenseModal = document.getElementById("expense-modal");
      closeExpenseModalBtn = document.getElementById("close-expense-modal-btn");
      modalExpenseCancelBtn = document.getElementById("modal-expense-cancel-btn");
      modalExpenseCreateForm = document.getElementById("modal-expense-create-form");
      modalExpenseDesc = document.getElementById("modal-expense-desc");
      modalExpenseVal = document.getElementById("modal-expense-val");
      modalExpenseMonth = document.getElementById("modal-expense-month");
      modalExpenseYear = document.getElementById("modal-expense-year");
      modalExpenseCat = document.getElementById("modal-expense-cat");
      modalExpenseInstallmentsContainer = document.getElementById("modal-expense-installments-container");
      modalExpenseInstallments = document.getElementById("modal-expense-installments");

      // Modal Financiamentos
      financingModal = document.getElementById("financing-modal");
      closeFinancingModalBtn = document.getElementById("close-financing-modal-btn");
      modalFinancingCancelBtn = document.getElementById("modal-financing-cancel-btn");
      financingTableBody = document.getElementById("financing-table-body");
      
      // Containers da aba de relatórios
      monthlyExpensesContainer = document.getElementById("monthly-expenses-container");
      reportsContainer = document.getElementById("reports-container");
      reportsPizzaMonthSelect = document.getElementById("reports-pizza-month-select");
      if (reportsPizzaMonthSelect) {
        reportsPizzaMonthSelect.value = String(new Date().getMonth() + 1);
      }
      reportsBudgetProgressContainer = document.getElementById("reports-budget-progress-container");
      
      // Containers da aba de financiamentos
      financingContainer = document.getElementById("financing-container");
      financingRegisterForm = document.getElementById("financing-register-form");
      financingNameInput = document.getElementById("financing-name");
      financingTotalValInput = document.getElementById("financing-total-val");
      financingInstallmentValInput = document.getElementById("financing-installment-val");
      financingInstallmentsCountInput = document.getElementById("financing-installments-count");
      financingTrRateInput = document.getElementById("financing-tr-rate");

      simulatorFinancingSelect = document.getElementById("simulator-financing-select");
      simulatorAmortizationVal = document.getElementById("simulator-amortization-val");
      simulatorAmortizationFrequency = document.getElementById("simulator-amortization-frequency");

      simulationResultsContainer = document.getElementById("simulation-results-container");
      simKpiJurosSaved = document.getElementById("sim-kpi-juros-saved");
      simKpiMonthsSaved = document.getElementById("sim-kpi-months-saved");
      simTableNormalMonths = document.getElementById("sim-table-normal-months");
      simTableNormalJuros = document.getElementById("sim-table-normal-juros");
      simTableNormalTotal = document.getElementById("sim-table-normal-total");
      simTableAmortMonths = document.getElementById("sim-table-amort-months");
      simTableAmortJuros = document.getElementById("sim-table-amort-juros");
      simTableAmortTotal = document.getElementById("sim-table-amort-total");

      expenseCountBadge = document.getElementById("expense-count-badge");
      expensesTableBody = document.getElementById("expenses-table-body");

      // Planejador Financeiro
      plannerMethodSelect = document.getElementById("planner-method-select");
      plannerComparisonTableBody = document.getElementById("planner-comparison-table-body");
      settingsPlannerMethodSelect = document.getElementById("settings-planner-method-select");
      settingsPlannerLimitsForm = document.getElementById("settings-planner-limits-form");
      settingsPlannerInputsGrid = document.getElementById("settings-planner-inputs-grid");
      settingsPlannerTotalSum = document.getElementById("settings-planner-total-sum");
      settingsPlannerWarning = document.getElementById("settings-planner-warning");
      settingsPlannerInfo = document.getElementById("settings-planner-info");
      settingsPlannerSobraSpan = document.getElementById("settings-planner-sobra-span");

      // Inteligência Artificial (LLM)
      generateAiAnalysisBtn = document.getElementById("generate-ai-analysis-btn");
      aiAnalysisLoader = document.getElementById("ai-analysis-loader");
      aiAnalysisResultCard = document.getElementById("ai-analysis-result-card");
      aiAnalysisTimestamp = document.getElementById("ai-analysis-timestamp");
      aiAnalysisTextContent = document.getElementById("ai-analysis-text-content");

      // --- Bind de Mascaramento Monetário ---
      const monetaryFields = [
        salaryInput,
        document.getElementById("modal-new-profile-salary"),
        modalExpenseVal,
        financingTotalValInput,
        financingInstallmentValInput,
        simulatorAmortizationVal
      ];

      monetaryFields.forEach(field => {
        if (field) {
          field.addEventListener("input", (e) => {
            e.target.value = formatBRLInput(e.target.value);
          });
        }
      });

      // --- Event Listeners ---

      // 1. Mudança de Perfil Ativo
      sidebarProfileSelect.addEventListener("change", (e) => {
        const selectedProfile = e.target.value;
        if (selectedProfile) {
          window.App.State.selecionarPerfil(selectedProfile);
        }
      });

      // 2. Excluir Perfil Ativo
      deleteProfileBtn.addEventListener("click", () => {
        const state = window.App.State.getState();
        const ativo = state.perfilAtivo;
        if (!ativo) {
          showStatus("Nenhum perfil ativo para deletar.", true);
          return;
        }

        if (confirm(`Tem certeza que deseja deletar o perfil "${ativo}" e todas as suas despesas?`)) {
          try {
            window.App.State.removerPerfil(ativo);
            showStatus(`Perfil "${ativo}" deletado.`);
          } catch (err) {
            showStatus(err.message, true);
          }
        }
      });

      // 3. Controle do Modal de Perfil (Abrir/Fechar)
      sidebarNewProfileBtn.addEventListener("click", () => {
        newProfileModal.classList.remove("hidden");
        document.getElementById("modal-new-profile-name").focus();
      });

      const hideProfileModal = () => {
        newProfileModal.classList.add("hidden");
        modalProfileCreateForm.reset();
      };
      
      closeProfileModalBtn.addEventListener("click", hideProfileModal);
      modalCancelBtn.addEventListener("click", hideProfileModal);

      // 4. Submissão de Novo Perfil pelo Modal
      modalProfileCreateForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const nome = document.getElementById("modal-new-profile-name").value.trim();
        const salario = parseBRLValue(document.getElementById("modal-new-profile-salary").value);

        if (!nome) {
          alert("Por favor, digite um nome válido.");
          return;
        }
        if (isNaN(salario) || salario < 0) {
          alert("Por favor, digite um salário válido.");
          return;
        }

        try {
          window.App.State.adicionarPerfil(nome, salario);
          hideProfileModal();
          showStatus(`Perfil "${nome}" criado com sucesso!`);
        } catch (err) {
          alert(`Erro: ${err.message}`);
        }
      });

      // 5. Edição Inline de Salário
      editSalaryBtn.addEventListener("click", () => {
        const state = window.App.State.getState();
        const ativo = state.perfis.find(p => p.nome === state.perfilAtivo);
        if (ativo) {
          salaryInput.value = formatBRLInput(ativo.salario.toFixed(2));
          salaryViewMode.classList.add("hidden");
          salaryEditMode.classList.remove("hidden");
          salaryInput.focus();
        }
      });

      cancelSalaryBtn.addEventListener("click", () => {
        salaryEditMode.classList.add("hidden");
        salaryViewMode.classList.remove("hidden");
      });

      saveSalaryBtn.addEventListener("click", () => {
        const novoSalario = parseBRLValue(salaryInput.value);
        if (isNaN(novoSalario) || novoSalario < 0) {
          showStatus("Digite um salário válido.", true);
          return;
        }

        try {
          window.App.State.atualizarSalario(novoSalario);
          salaryEditMode.classList.add("hidden");
          salaryViewMode.classList.remove("hidden");
          showStatus("Salário atualizado com sucesso!");
        } catch (err) {
          showStatus(err.message, true);
        }
      });

      salaryInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
          saveSalaryBtn.click();
        } else if (e.key === "Escape") {
          cancelSalaryBtn.click();
        }
      });



      // --- 7. Modal de Inserção / Edição de Despesas ---
      
      // Fechar modal de despesas
      const hideExpenseModal = () => {
        expenseModal.classList.add("hidden");
        modalExpenseCreateForm.reset();
        modalExpenseInstallmentsContainer.classList.add("hidden");
        modalExpenseInstallments.value = "1";
        
        const recurrentInput = document.getElementById("modal-expense-recurrent");
        if (recurrentInput) recurrentInput.value = "nao";
        
        editingExpenseId = null;
      };

      closeExpenseModalBtn.addEventListener("click", hideExpenseModal);
      modalExpenseCancelBtn.addEventListener("click", hideExpenseModal);

      // Fechar modal de financiamento
      const hideFinancingModal = () => {
        financingModal.classList.add("hidden");
        financingRegisterForm.reset();
        editingFinancingId = null;
      };

      if (closeFinancingModalBtn) closeFinancingModalBtn.addEventListener("click", hideFinancingModal);
      if (modalFinancingCancelBtn) modalFinancingCancelBtn.addEventListener("click", hideFinancingModal);

      // Tratamento condicional para "Cartão de Crédito"
      modalExpenseCat.addEventListener("change", (e) => {
        if (e.target.value === "Cartão de Crédito") {
          modalExpenseInstallmentsContainer.classList.remove("hidden");
          modalExpenseInstallments.focus();
        } else {
          modalExpenseInstallmentsContainer.classList.add("hidden");
          modalExpenseInstallments.value = "1";
        }
      });

      // Redirecionamento dinâmico do clique no botão "Adicionar Gasto/Cadastrar Financiamento"
      addExpenseBtn.addEventListener("click", () => {
        const state = window.App.State.getState();
        if (state.mesAtivo === 14) {
          // Abertura do Modal de Cadastro de Financiamentos
          editingFinancingId = null;

          // Habilitar todos os campos para novo cadastro
          financingNameInput.disabled = false;
          financingTotalValInput.disabled = false;
          financingInstallmentValInput.disabled = false;
          document.getElementById("financing-start-month").disabled = false;
          document.getElementById("financing-start-year").disabled = false;

          // Resetar formulário
          financingRegisterForm.reset();

          // Ajustar título e botão do modal
          const modalTitle = financingModal.querySelector("h3");
          const submitBtn = financingRegisterForm.querySelector('button[type="submit"]');
          if (modalTitle) modalTitle.textContent = "Cadastrar Financiamento";
          if (submitBtn) submitBtn.textContent = "Salvar";

          financingModal.classList.remove("hidden");
          financingNameInput.focus();
        } else {
          // Fluxo normal de despesas
          if (!state.perfilAtivo) {
            showStatus("Crie um perfil antes de adicionar despesas.", true);
            return;
          }
          editingExpenseId = null;
          const modalTitle = expenseModal.querySelector("h3");
          const submitBtn = modalExpenseCreateForm.querySelector('button[type="submit"]');
          if (modalTitle) modalTitle.textContent = "Adicionar Novo Gasto";
          if (submitBtn) submitBtn.textContent = "Salvar Gasto";

          modalExpenseMonth.value = state.mesAtivo > 12 ? "1" : state.mesAtivo;
          modalExpenseYear.value = state.anoAtivo || new Date().getFullYear();
          expenseModal.classList.remove("hidden");
          modalExpenseDesc.focus();
        }
      });

      // Envio do formulário de despesas do modal (Add ou Edit)
      modalExpenseCreateForm.addEventListener("submit", (e) => {
        e.preventDefault();

        const state = window.App.State.getState();
        const desc = modalExpenseDesc.value.trim();
        const valor = parseBRLValue(modalExpenseVal.value);
        const cat = modalExpenseCat.value;
        const mes = state.mesAtivo > 12 ? 1 : state.mesAtivo;
        const ano_inicio = state.anoAtivo;
        const parc = parseInt(modalExpenseInstallments.value);
        const recorrente = document.getElementById("modal-expense-recurrent").value === "sim";

        if (!desc) {
          alert("Por favor, digite uma descrição.");
          return;
        }
        if (isNaN(valor) || valor <= 0) {
          alert("O valor da despesa deve ser maior que zero.");
          return;
        }
        if (isNaN(parc) || parc < 1) {
          alert("O número de parcelas deve ser igual ou maior que 1.");
          return;
        }

        try {
          if (editingExpenseId) {
            window.App.State.atualizarDespesa(editingExpenseId, desc, valor, cat, mes, parc, recorrente, ano_inicio);
            showStatus("Gasto atualizado com sucesso!");
          } else {
            window.App.State.adicionarDespesa(desc, valor, cat, mes, parc, recorrente, ano_inicio);
            showStatus("Gasto lançado com sucesso!");
          }
          hideExpenseModal();
        } catch (err) {
          alert(`Erro: ${err.message}`);
        }
      });

      // Seletor de mês do gráfico de pizza
      reportsPizzaMonthSelect.addEventListener("change", () => {
        const state = window.App.State.getState();
        this.render(state);
      });

      // --- Sidebar Navegação Direct Clicks ---
      if (sidebarDespesasBtn) {
        sidebarDespesasBtn.addEventListener("click", () => {
          const state = window.App.State.getState();
          let targetMonth = state.mesAtivo;
          if (targetMonth > 12) {
            targetMonth = new Date().getMonth() + 1;
          }
          window.App.State.selecionarMes(targetMonth);
        });
      }
      if (sidebarRelatoriosBtn) {
        sidebarRelatoriosBtn.addEventListener("click", () => {
          window.App.State.selecionarMes(13);
        });
      }
      if (sidebarFinanciamentoBtn) {
        sidebarFinanciamentoBtn.addEventListener("click", () => {
          window.App.State.selecionarMes(14);
        });
      }
      if (sidebarSettingsBtn) {
        sidebarSettingsBtn.addEventListener("click", () => {
          window.App.State.selecionarMes(15);
        });
      }

      // --- Event Listeners de Configurações ---
      if (themeToggleBtn) {
        themeToggleBtn.addEventListener("click", () => {
          window.App.State.toggleTheme();
        });
      }
      if (newCategoryColor) {
        newCategoryColor.addEventListener("input", (e) => {
          if (newCategoryColorHex) newCategoryColorHex.textContent = e.target.value;
        });
      }
      if (addCategoryForm) {
        addCategoryForm.addEventListener("submit", (e) => {
          e.preventDefault();
          const name = newCategoryName.value.trim();
          const color = newCategoryColor.value;
          if (!name) {
            alert("Por favor, preencha o nome da categoria.");
            return;
          }
          try {
            window.App.State.adicionarCategoria(name, color);
            newCategoryName.value = "";
            showStatus("Categoria cadastrada!");
          } catch (err) {
            alert(`Erro: ${err.message}`);
          }
        });
      }

      // --- Event Listeners de Financiamento ---
      financingRegisterForm.addEventListener("submit", (e) => {
        e.preventDefault();
        
        const count = parseInt(financingInstallmentsCountInput.value);
        const tr = parseFloat(financingTrRateInput.value) || 0;

        if (isNaN(count) || count <= 0) {
          alert("Por favor, digite uma quantidade válida de parcelas.");
          return;
        }

        try {
          if (editingFinancingId) {
            // Edição parcial (Apenas parcelasTotais e taxaTR permitidos)
            window.App.State.atualizarFinanciamento(editingFinancingId, count, tr);
            showStatus("Financiamento atualizado!");
          } else {
            // Cadastro completo
            const nome = financingNameInput.value.trim();
            const total = parseBRLValue(financingTotalValInput.value);
            const parcVal = parseBRLValue(financingInstallmentValInput.value);
            const mesInicio = parseInt(document.getElementById("financing-start-month").value) || 1;
            const anoInicio = parseInt(document.getElementById("financing-start-year").value) || new Date().getFullYear();

            if (!nome) {
              alert("Nome do financiamento inválido.");
              return;
            }
            if (isNaN(total) || total <= 0 || isNaN(parcVal) || parcVal <= 0) {
              alert("Por favor, digite valores válidos superiores a zero.");
              return;
            }

            window.App.State.adicionarFinanciamento(nome, total, parcVal, count, tr, mesInicio, anoInicio);
            showStatus("Financiamento cadastrado!");
          }
          hideFinancingModal();
        } catch (err) {
          alert(`Erro: ${err.message}`);
        }
      });

      // Registrar listeners para reatividade do simulador
      simulatorFinancingSelect.addEventListener("change", runSimulation);
      simulatorAmortizationVal.addEventListener("input", runSimulation);
      simulatorAmortizationFrequency.addEventListener("change", runSimulation);

      // Planejador Financeiro - Relatórios
      if (plannerMethodSelect) {
        plannerMethodSelect.addEventListener("change", () => {
          window.App.UI.render(window.App.State.getState());
        });
      }

      // Planejador Financeiro - Configurações
      if (settingsPlannerMethodSelect) {
        settingsPlannerMethodSelect.addEventListener("change", () => {
          renderPlannerSettingsForm();
        });
      }

      if (settingsPlannerLimitsForm) {
        settingsPlannerLimitsForm.addEventListener("submit", (e) => {
          e.preventDefault();
          const metodo = settingsPlannerMethodSelect.value;
          const inputs = settingsPlannerInputsGrid.querySelectorAll(".planner-percentage-input");
          const limites = {};
          inputs.forEach(inp => {
            const cat = inp.getAttribute("data-category");
            limites[cat] = Math.max(0, parseFloat(inp.value) || 0);
          });

          try {
            window.App.State.atualizarPlanejamento(metodo, limites);
            showStatus("Limites salvos com sucesso!");
          } catch (err) {
            alert(`Erro: ${err.message}`);
          }
        });
      }

      // 8. Exportar CSV
      exportCsvBtn.addEventListener("click", () => {
        const state = window.App.State.getState();
        const success = window.App.Storage.exportAsCSVFile(state);
        if (success) {
          showStatus("Arquivo CSV exportado!");
        } else {
          showStatus("Erro ao exportar CSV.", true);
        }
      });

      // 9. Importar CSV (Disparar Input)
      importCsvBtn.addEventListener("click", () => {
        csvFileInput.click();
      });

      // 10. Processar Upload de CSV
      csvFileInput.addEventListener("change", (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
          try {
            const csvText = event.target.result;
            const importedState = window.App.Storage.parseFromCSV(csvText);
            window.App.State.importarPerfilCSV(importedState);
            csvFileInput.value = "";
            showStatus("Perfil importado com sucesso!");
          } catch (err) {
            csvFileInput.value = "";
            showStatus(err.message, true);
            alert(`Erro na importação: ${err.message}`);
          }
        };
        reader.readAsText(file, "UTF-8");
      });

      // 11. Gerar Análise Inteligente via LLM
      if (generateAiAnalysisBtn) {
        generateAiAnalysisBtn.addEventListener("click", async () => {
          if (aiAnalysisLoader) aiAnalysisLoader.classList.remove("hidden");
          if (aiAnalysisResultCard) aiAnalysisResultCard.classList.add("hidden");
          generateAiAnalysisBtn.disabled = true;

          try {
            // A. Carregar configuração
            const config = window.App.LlmConfig;
            if (!config) {
              throw new Error("Não foi possível carregar as configurações de 'llm_config.js'. Certifique-se de que o arquivo existe na raiz do projeto.");
            }
            
            const apiUrl = String(config.apiUrl || "").trim();
            const apiKey = String(config.apiKey || "").trim();
            const model = String(config.model || "").trim();

            if (!apiUrl || !apiKey || !model) {
              throw new Error("Configuração incompleta em 'llm_config.js'. Certifique-se de preencher apiUrl, apiKey e model.");
            }

            if (apiKey === "SUA_API_KEY_AQUI") {
              throw new Error("Chave de API não configurada em 'llm_config.js'. Abra o arquivo e altere a chave de API para uma válida.");
            }

            // B. Carregar o template de prompt
            const promptTemplate = window.App.LlmPromptTemplate;
            if (!promptTemplate) {
              throw new Error("Não foi possível carregar o template de prompt de 'prompts/analise.js'.");
            }

            // C. Coletar dados do estado atual
            const state = window.App.State.getState();
            const perfil = state.perfis.find(p => p.nome === state.perfilAtivo);
            const salario = perfil ? perfil.salario : 0;

            // Limites recomendados do planejador
            const plannerMethod = plannerMethodSelect ? plannerMethodSelect.value : "Equilibrado";
            const limites = (state.planejamento && state.planejamento[plannerMethod]) || {};
            let limitesStr = "";
            for (const cat in state.categorias) {
              limitesStr += `- ${cat}: ${limites[cat] || 0}%\n`;
            }

            // Obter gastos reais consolidados
            const selectedMonth = reportsPizzaMonthSelect ? parseInt(reportsPizzaMonthSelect.value) : 1;
            let summary;
            if (selectedMonth === 0) {
              summary = window.App.Engine.calculateAnnualSummary(perfil, state.despesas, state.financiamentos, state.anoAtivo);
            } else {
              summary = window.App.Engine.calculateMonthlySummary(perfil, selectedMonth, state.despesas, state.financiamentos, state.anoAtivo);
            }

            let gastosReaisStr = "";
            for (const cat in state.categorias) {
              const valor = summary.gastosPorCategoria[cat] || 0;
              const pct = summary.porcentagemPorCategoria[cat] || 0;
              gastosReaisStr += `- ${cat}: ${formatCurrency(valor)} (${pct}%)\n`;
            }

            // Detalhe das despesas
            let detalheDespesasStr = "";
            const activeExpenses = state.despesas.filter(d => d.perfil === state.perfilAtivo);
            if (activeExpenses.length === 0) {
              detalheDespesasStr = "Nenhuma despesa cadastrada.\n";
            } else {
              activeExpenses.forEach(d => {
                const rec = d.recorrente ? "Recorrente" : `Parcelado (${d.parcelas}x)`;
                detalheDespesasStr += `- ${d.descricao}: ${formatCurrency(parseFloat(d.valor) || 0)} | Categoria: ${d.categoria} | Início: ${d.mes_inicio}/${d.ano_inicio} | ${rec}\n`;
              });
            }

            // Detalhe dos financiamentos
            let detalheFinanciamentosStr = "";
            const activeFinancings = state.financiamentos.filter(f => f.perfil === state.perfilAtivo);
            if (activeFinancings.length === 0) {
              detalheFinanciamentosStr = "Nenhum financiamento cadastrado.\n";
            } else {
              activeFinancings.forEach(f => {
                detalheFinanciamentosStr += `- ${f.nome}: Total: ${formatCurrency(f.valorTotal)} | Parcela: ${formatCurrency(f.valorParcela)} | Parcelas: ${f.parcelasTotais} | TR: ${f.taxaTR}%\n`;
              });
            }

            // D. Substituir placeholders no template
            const promptContent = promptTemplate
              .replace("{{PERFIL}}", state.perfilAtivo || "Nenhum")
              .replace("{{SALARIO}}", formatCurrency(salario))
              .replace("{{METODO_PLANEJADOR}}", plannerMethod)
              .replace("{{LIMITES_PLANEJADOR}}", limitesStr)
              .replace("{{GASTOS_REAIS}}", gastosReaisStr)
              .replace("{{DETALHE_DESPESAS}}", detalheDespesasStr)
              .replace("{{DETALHE_FINANCIAMENTOS}}", detalheFinanciamentosStr);

            // E. Chamar LLM externa compatível com OpenAI
            const chatUrl = apiUrl.endsWith("/") ? `${apiUrl}chat/completions` : `${apiUrl}/chat/completions`;
            const response = await fetch(chatUrl, {
              method: "POST",
              headers: {
                "Authorization": `Bearer ${apiKey}`,
                "Content-Type": "application/json"
              },
              body: JSON.stringify({
                model: model,
                messages: [
                  {
                    role: "user",
                    content: promptContent
                  }
                ],
                temperature: 0.7
              })
            });

            if (!response.ok) {
              const errorText = await response.text();
              throw new Error(`Erro na API (${response.status}): ${errorText}`);
            }

            const data = await response.json();
            const aiText = data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content;

            if (!aiText) {
              throw new Error("A API retornou uma resposta vazia.");
            }

            // F. Formatação simples de Markdown para HTML
            if (aiAnalysisTextContent) {
              let html = aiText
                .replace(/&/g, "&amp;")
                .replace(/</g, "&lt;")
                .replace(/>/g, "&gt;")
                .replace(/\n\n/g, "</p><p>")
                .replace(/\n/g, "<br>")
                .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
                .replace(/\*(.*?)\*/g, "<em>$1</em>")
                .replace(/### (.*?)(<br>|<\/p>)/g, "<h3 class='text-xs font-bold text-indigo-300 mt-4 mb-2 uppercase tracking-wider'>$1</h3>$2")
                .replace(/## (.*?)(<br>|<\/p>)/g, "<h2 class='text-sm font-bold text-white mt-5 mb-2'>$1</h2>$2")
                .replace(/- (.*?)(<br>)/g, "<li class='list-disc list-inside ml-2 text-slate-400'>$1</li>");

              aiAnalysisTextContent.innerHTML = `<p>${html}</p>`;
            }

            if (aiAnalysisTimestamp) {
              const now = new Date();
              const timeStr = now.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
              aiAnalysisTimestamp.textContent = `Gerado às ${timeStr}`;
            }

            if (aiAnalysisResultCard) aiAnalysisResultCard.classList.remove("hidden");

          } catch (err) {
            console.error(err);
            if (window.location.protocol === "file:") {
              alert(`Erro na Análise Inteligente: ${err.message}\n\nNota: Como a aplicação está rodando via file://, chamadas para servidores locais (localhost) costumam ser bloqueadas por CORS. Para resolver:\n1. Execute o projeto usando o servidor de desenvolvimento ('npm run dev').\n2. Ou configure seu servidor LLM (LM Studio / Ollama) para permitir CORS de todas as origens (*).`);
            } else {
              alert(`Erro: ${err.message}`);
            }
          } finally {
            if (aiAnalysisLoader) aiAnalysisLoader.classList.add("hidden");
            generateAiAnalysisBtn.disabled = false;
          }
        });
      }
    },

    // Renderizar Abas de Anos (Gerados dinamicamente com base nas despesas comuns e ano atual)
    renderAnos(state) {
      if (!yearTabsContainer) return;
      yearTabsContainer.innerHTML = "";

      const activeYear = state.anoAtivo || new Date().getFullYear();
      const currentYear = new Date().getFullYear();

      // Computar anos únicos com despesas comuns/cartão de crédito ativas
      const years = new Set();
      years.add(currentYear);

      const { despesas, perfilAtivo } = state;
      if (Array.isArray(despesas) && perfilAtivo) {
        despesas.forEach(d => {
          if (d.perfil !== perfilAtivo) return;

          const S_year = parseInt(d.ano_inicio) || currentYear;
          if (d.categoria === "Cartão de Crédito" && d.parcelas > 1) {
            const S_month = parseInt(d.mes_inicio) || 1;
            const P = parseInt(d.parcelas) || 1;
            const startAbs = S_year * 12 + S_month - 1;
            const endAbs = startAbs + P - 1;
            const endYear = Math.floor(endAbs / 12);
            for (let y = S_year; y <= endYear; y++) {
              years.add(y);
            }
          } else {
            years.add(S_year);
          }
        });
      }

      // Ordenar anos em ordem crescente
      const sortedYears = Array.from(years).sort((a, b) => a - b);

      sortedYears.forEach(y => {
        const tabBtn = document.createElement("button");
        tabBtn.type = "button";
        tabBtn.className = "px-4 py-2 text-xs font-semibold rounded-xl border border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-850/50 transition whitespace-nowrap shrink-0 focus:outline-none cursor-pointer";
        tabBtn.textContent = String(y);

        if (y === activeYear) {
          tabBtn.classList.add("tab-month-active");
        }

        tabBtn.addEventListener("click", () => {
          window.App.State.selecionarAno(y);
        });

        yearTabsContainer.appendChild(tabBtn);
      });
    },

    // Atualiza o select de categoria no modal de gastos com base no estado
    renderCategoriasDropdowns(state) {
      if (!modalExpenseCat) return;
      const previousValue = modalExpenseCat.value;
      modalExpenseCat.innerHTML = "";

      const cats = state.categorias || {};
      for (const name in cats) {
        const opt = document.createElement("option");
        opt.value = name;
        opt.textContent = name;
        if (name === previousValue) {
          opt.selected = true;
        }
        modalExpenseCat.appendChild(opt);
      }
    },

    // Renderiza a lista de categorias e tema na tela de configurações
    renderConfiguracoes(state) {
      // 1. Atualizar o botão e texto de tema
      if (themeToggleBtnText) {
        themeToggleBtnText.textContent = state.theme === "light" ? "Mudar para Modo Escuro" : "Mudar para Modo Claro";
      }

      // 2. Renderizar a lista de categorias com color pickers
      if (!categoriesColorsList) return;
      categoriesColorsList.innerHTML = "";

      const cats = state.categorias || {};
      for (const name in cats) {
        const cor = cats[name];

        const card = document.createElement("div");
        card.className = "bg-slate-900 border border-slate-800 p-4 rounded-xl flex flex-col items-center justify-between space-y-3";
        
        card.innerHTML = `
          <div class="text-center">
            <span class="block text-xs font-semibold text-slate-350 truncate max-w-[120px]">${name}</span>
          </div>
          <div class="flex items-center space-x-2">
            <input type="color" value="${cor}" class="w-8 h-8 bg-transparent border-0 cursor-pointer focus:outline-none cat-color-picker-input" data-category="${name}">
            <span class="text-[10px] font-mono text-slate-500">${cor}</span>
          </div>
        `;

        // Ouvir mudanças de cor do input de cor
        const picker = card.querySelector(".cat-color-picker-input");
        picker.addEventListener("change", (e) => {
          const catName = e.target.getAttribute("data-category");
          const selectedColor = e.target.value;
          try {
            window.App.State.atualizarCorCategoria(catName, selectedColor);
            showStatus(`Cor de "${catName}" atualizada!`);
          } catch (err) {
            alert(err.message);
          }
        });

        categoriesColorsList.appendChild(card);
      }

      // Renderizar formulário do Planejador Financeiro nas configurações
      renderPlannerSettingsForm();

    },

    // Renderizar Abas de Meses (Janeiro a Dezembro apenas)
    renderAbas(state) {
      if (!monthTabsContainer) return;
      monthTabsContainer.innerHTML = "";

      const activeMonth = state.mesAtivo || 1;

      // Renderizar meses 1 a 12
      MONTHS.forEach((nome, idx) => {
        const mesNumero = idx + 1;
        const tabBtn = document.createElement("button");
        tabBtn.type = "button";
        tabBtn.className = "px-4 py-2.5 text-xs font-semibold rounded-xl border border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-850/50 transition whitespace-nowrap shrink-0 focus:outline-none";
        tabBtn.textContent = nome;

        if (mesNumero === activeMonth) {
          tabBtn.classList.add("tab-month-active");
        }

        tabBtn.addEventListener("click", () => {
          window.App.State.selecionarMes(mesNumero);
        });

        monthTabsContainer.appendChild(tabBtn);
      });
    },

    // Renderizar dropdown de Perfis
    renderPerfis(state) {
      if (!sidebarProfileSelect) return;
      sidebarProfileSelect.innerHTML = "";

      const { perfis, perfilAtivo } = state;

      if (perfis.length === 0) {
        const option = document.createElement("option");
        option.value = "";
        option.textContent = "Nenhum Perfil";
        sidebarProfileSelect.appendChild(option);
        
        headerProfileName.textContent = "";
        headerProfileName.classList.add("hidden");
        kpiSalario.textContent = formatCurrency(0);
        kpiDespesas.textContent = formatCurrency(0);
        if (kpiSaldo) {
          kpiSaldo.textContent = formatCurrency(0);
          kpiSaldo.className = "text-lg font-bold text-slate-400";
        }
        deleteProfileBtn.disabled = true;
        editSalaryBtn.disabled = true;
        addExpenseBtn.disabled = true;
      } else {
        deleteProfileBtn.disabled = false;
        editSalaryBtn.disabled = false;
        addExpenseBtn.disabled = false;
        
        perfis.forEach(p => {
          const option = document.createElement("option");
          option.value = p.nome;
          option.textContent = p.nome;
          if (p.nome === perfilAtivo) {
            option.selected = true;
          }
          sidebarProfileSelect.appendChild(option);
        });

        const ativo = perfis.find(p => p.nome === perfilAtivo);
        if (ativo) {
          headerProfileName.textContent = "";
          headerProfileName.classList.add("hidden");
          kpiSalario.textContent = formatCurrency(ativo.salario);
        }
      }
    },

    // Renderizar dados do Estado no DOM
    render(state) {
      const { perfis, perfilAtivo, despesas, mesAtivo, anoAtivo, financiamentos } = state;

      // Aplicar Tema Claro/Escuro
      if (document.body) {
        if (state.theme === "light") {
          document.body.classList.add("theme-light");
        } else {
          document.body.classList.remove("theme-light");
        }
      }

      // 1. Renderizar Perfis e Abas
      this.renderPerfis(state);
      this.renderAnos(state);
      this.renderAbas(state);
      this.renderCategoriasDropdowns(state);

      // Alternar visualização ativa dos botões do menu lateral esquerdo
      if (sidebarDespesasBtn) {
        if (mesAtivo <= 12) {
          sidebarDespesasBtn.classList.add("sidebar-nav-active");
        } else {
          sidebarDespesasBtn.classList.remove("sidebar-nav-active");
        }
      }
      if (sidebarRelatoriosBtn) {
        if (mesAtivo === 13) {
          sidebarRelatoriosBtn.classList.add("sidebar-nav-active");
        } else {
          sidebarRelatoriosBtn.classList.remove("sidebar-nav-active");
        }
      }
      if (sidebarFinanciamentoBtn) {
        if (mesAtivo === 14) {
          sidebarFinanciamentoBtn.classList.add("sidebar-nav-active");
        } else {
          sidebarFinanciamentoBtn.classList.remove("sidebar-nav-active");
        }
      }
      if (sidebarSettingsBtn) {
        if (mesAtivo === 15) {
          sidebarSettingsBtn.classList.add("sidebar-nav-active");
        } else {
          sidebarSettingsBtn.classList.remove("sidebar-nav-active");
        }
      }

      // --- AJUSTE: Ocultar meses e renomear botão quando na aba de financiamento/configurações ---
      const addBtnSpan = addExpenseBtn.querySelector("span");
      if (mesAtivo === 14 || mesAtivo === 15) {
        if (monthTabsContainer) monthTabsContainer.classList.add("hidden");
        if (yearTabsContainer) yearTabsContainer.classList.add("hidden");
        if (mesAtivo === 14) {
          if (addBtnSpan) addBtnSpan.textContent = "Cadastrar Financiamento";
          addExpenseBtn.classList.remove("opacity-50", "pointer-events-none");
        } else {
          addExpenseBtn.classList.add("opacity-50", "pointer-events-none");
        }
      } else {
        if (monthTabsContainer) monthTabsContainer.classList.remove("hidden");
        if (yearTabsContainer) yearTabsContainer.classList.remove("hidden");
        if (addBtnSpan) addBtnSpan.textContent = "Adicionar Gasto";
        if (mesAtivo === 13) {
          addExpenseBtn.classList.add("opacity-50", "pointer-events-none");
        } else {
          addExpenseBtn.classList.remove("opacity-50", "pointer-events-none");
        }
      }

      const ativo = perfis.find(p => p.nome === perfilAtivo);

      // --- AJUSTE: Não atualizar os KPIs do Header ao ir para Relatório/Financiamento ---
      if (mesAtivo <= 12) {
        const summary = window.App.Engine.calculateMonthlySummary(ativo, mesAtivo, despesas, financiamentos, anoAtivo);
        if (kpiDespesas) {
          kpiDespesas.textContent = formatCurrency(summary.totalGastos);
        }
        if (kpiSaldo) {
          kpiSaldo.textContent = formatCurrency(summary.saldoRestante);
          if (summary.saldoRestante >= 0) {
            kpiSaldo.className = "text-lg font-bold text-emerald-400";
          } else {
            kpiSaldo.className = "text-lg font-bold text-rose-400";
          }
        }
      }



      // 4. Fluxo de Visualização Condicional
      if (mesAtivo === 13) {
        // --- TELA DE RELATÓRIOS ---
        if (monthlyExpensesContainer) monthlyExpensesContainer.classList.add("hidden");
        if (financingContainer) financingContainer.classList.add("hidden");
        if (settingsContainer) settingsContainer.classList.add("hidden");
        if (reportsContainer) reportsContainer.classList.remove("hidden");

        if (reportsContainer && !reportsContainer.classList.contains("hidden")) {
          const selectedMonth = parseInt(reportsPizzaMonthSelect.value);
          let pizzaSummary;
          if (selectedMonth === 0) {
            pizzaSummary = window.App.Engine.calculateAnnualSummary(ativo, despesas, financiamentos, anoAtivo);
          } else {
            pizzaSummary = window.App.Engine.calculateMonthlySummary(ativo, selectedMonth, despesas, financiamentos, anoAtivo);
          }

          if (window.App.Charts) {
            window.App.Charts.renderPizzaChart("pizza-chart-canvas", pizzaSummary.gastosPorCategoria);
            const projection = window.App.Engine.calculateCardProjection(despesas, perfilAtivo, anoAtivo);
            window.App.Charts.renderLineChart("line-chart-canvas", projection);
          }

          if (reportsBudgetProgressContainer) {
            reportsBudgetProgressContainer.innerHTML = "";
            const userColors = state.categorias || {};
            const DEFAULT_COLORS = {
              "Saúde": "#10b981",
              "Alimentação": "#0ea5e9",
              "Moradia": "#6366f1",
              "Cartão de Crédito": "#f59e0b",
              "Lazer": "#f43f5e",
              "Serviços por Assinatura": "#8b5cf6",
              "Serviços": "#14b8a6",
              "Financiamento": "#d946ef",
              "Outros": "#64748b"
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

          // --- Renderizar Planejador Financeiro (Aba Relatório) ---
          if (plannerComparisonTableBody) {
            plannerComparisonTableBody.innerHTML = "";
            const plannerMethod = plannerMethodSelect ? plannerMethodSelect.value : "Equilibrado";
            const limites = (state.planejamento && state.planejamento[plannerMethod]) || {};
            
            // Desenhar Gráfico Donut do Planejador
            if (window.App.Charts) {
              window.App.Charts.renderPlannerChart("planner-chart-canvas", limites);
            }

            const salary = ativo ? ativo.salario : 0;
            const factor = selectedMonth === 0 ? 12 : 1;
            
            // Obter gastos reais
            const actualExpenses = {};
            for (const cat in state.categorias) {
              actualExpenses[cat] = parseFloat(pizzaSummary.gastosPorCategoria[cat]) || 0;
            }

            // Consolidar financiamento como moradia
            const finVal = actualExpenses["Financiamento"] || 0;
            actualExpenses["Moradia"] = (actualExpenses["Moradia"] || 0) + finVal;
            actualExpenses["Financiamento"] = 0;

            for (const cat in state.categorias) {
              const pct = limites[cat] !== undefined ? limites[cat] : 0;
              const limitVal = salary * factor * (pct / 100);
              const actualVal = actualExpenses[cat] || 0;

              // Ignorar categorias com limite 0 e gasto 0 para deixar a tabela limpa,
              // exceto se for "Moradia" ou "Investimento" para garantir visibilidade estrutural.
              if (pct === 0 && actualVal === 0 && cat !== "Moradia" && cat !== "Investimento") {
                continue;
              }

              const row = document.createElement("tr");
              row.className = "border-b border-slate-900/40 hover:bg-slate-900/20 transition";
              
              let statusText = "OK";
              let statusClass = "bg-emerald-950/40 text-emerald-400 border border-emerald-900/40";
              
              if (cat === "Investimento") {
                if (actualVal < limitVal) {
                  statusText = "Ruim";
                  statusClass = "bg-red-950/40 text-red-400 border border-red-900/40";
                } else if (actualVal > limitVal) {
                  statusText = "Excelente";
                  statusClass = "bg-cyan-950/40 text-cyan-400 border border-cyan-900/40";
                }
              } else {
                if (actualVal > limitVal) {
                  statusText = "Excedido";
                  statusClass = "bg-red-950/40 text-red-400 border border-red-900/40";
                }
              }

              row.innerHTML = `
                <td class="py-2.5 px-3 font-semibold text-slate-350">${cat}</td>
                <td class="py-2.5 px-3 font-mono text-slate-400">${pct}%</td>
                <td class="py-2.5 px-3 font-mono text-slate-400">${formatCurrency(limitVal)}</td>
                <td class="py-2.5 px-3 font-mono text-indigo-300 font-bold">${formatCurrency(actualVal)}</td>
                <td class="py-2.5 px-3 text-right">
                  <span class="inline-block text-[10px] font-bold px-2 py-0.5 rounded-full border ${statusClass}">
                    ${statusText}
                  </span>
                </td>
              `;
              plannerComparisonTableBody.appendChild(row);
            }
          }
        }
      } else if (mesAtivo === 14) {
        // --- TELA DE FINANCIAMENTO ---
        if (monthlyExpensesContainer) monthlyExpensesContainer.classList.add("hidden");
        if (reportsContainer) reportsContainer.classList.add("hidden");
        if (settingsContainer) settingsContainer.classList.add("hidden");
        if (financingContainer) financingContainer.classList.remove("hidden");

        // A. Renderizar tabela de financiamentos ativos
        if (financingTableBody) {
          financingTableBody.innerHTML = "";
          const fAtivos = financiamentos.filter(f => f.perfil === perfilAtivo);

          if (fAtivos.length === 0) {
            financingTableBody.innerHTML = `
              <tr>
                <td colspan="6" class="text-center py-8 text-slate-500 text-xs font-medium">
                  Nenhum financiamento cadastrado.
                </td>
              </tr>
            `;
          } else {
            fAtivos.forEach(f => {
              // Calcular número atual de parcela para o mês/ano do calendário real corrente
              const currentYear = new Date().getFullYear();
              const currentMonth = new Date().getMonth() + 1;

              const S_month = parseInt(f.mes_inicio) || 1;
              const S_year = parseInt(f.ano_inicio) || currentYear;

              const startAbs = S_year * 12 + S_month - 1;
              const nowAbs = currentYear * 12 + currentMonth - 1;
              const index = nowAbs - startAbs + 1;

              let progressoTexto = "";
              if (index < 1) {
                progressoTexto = `0 de ${f.parcelasTotais} (Não Iniciado)`;
              } else if (index > f.parcelasTotais) {
                progressoTexto = `${f.parcelasTotais} de ${f.parcelasTotais} (Quitado)`;
              } else {
                progressoTexto = `${index} de ${f.parcelasTotais}`;
              }

              // Calcular data prevista do fim do financiamento
              const endAbs = startAbs + f.parcelasTotais - 1;
              const endMonth = (endAbs % 12) + 1;
              const endYear = Math.floor(endAbs / 12);
              const previsaoFim = `${MONTHS[endMonth - 1]} de ${endYear}`;

              const row = document.createElement("tr");
              row.className = "hover:bg-slate-900/40 transition border-b border-slate-850 text-slate-350";
              
              row.innerHTML = `
                <td class="py-3 px-4 font-medium text-slate-200">${f.nome}</td>
                <td class="py-3 px-4 font-mono">${progressoTexto}</td>
                <td class="py-3 px-4 font-mono text-indigo-300">${formatCurrency(f.valorTotal)}</td>
                <td class="py-3 px-4 font-mono">${f.taxaTR}%</td>
                <td class="py-3 px-4">${previsaoFim}</td>
                <td class="py-3 px-4 text-right">
                  <button class="edit-financing-btn bg-slate-800 hover:bg-slate-750 text-indigo-300 hover:text-indigo-200 border border-slate-700 hover:border-slate-650 px-2.5 py-1 rounded-lg transition text-xs mr-1.5 focus:outline-none" data-id="${f.id}">
                    Editar
                  </button>
                  <button class="remove-financing-btn bg-red-950/20 hover:bg-red-950/40 text-red-400 hover:text-red-300 border border-red-500/20 hover:border-red-500/40 px-2.5 py-1 rounded-lg transition text-xs focus:outline-none" data-id="${f.id}">
                    Deletar
                  </button>
                </td>
              `;
              financingTableBody.appendChild(row);
            });

            // Bind dos botões de exclusão
            const delButtons = financingTableBody.querySelectorAll(".remove-financing-btn");
            delButtons.forEach(btn => {
              btn.addEventListener("click", (e) => {
                const fid = e.target.getAttribute("data-id");
                if (confirm("Deseja realmente deletar este financiamento?")) {
                  try {
                    window.App.State.removerFinanciamento(fid);
                    showStatus("Financiamento deletado.");
                  } catch (err) {
                    showStatus(err.message, true);
                  }
                }
              });
            });

            // Bind dos botões de edição parcial (TR e parcelas editáveis apenas)
            const editButtons = financingTableBody.querySelectorAll(".edit-financing-btn");
            editButtons.forEach(btn => {
              btn.addEventListener("click", (e) => {
                const fid = e.target.getAttribute("data-id");
                const found = fAtivos.find(f => f.id === fid);
                if (found) {
                  editingFinancingId = found.id;

                  // Preencher campos no modal
                  financingNameInput.value = found.nome;
                  financingTotalValInput.value = formatBRLInput(found.valorTotal.toFixed(2));
                  financingInstallmentValInput.value = formatBRLInput(found.valorParcela.toFixed(2));
                  financingInstallmentsCountInput.value = found.parcelasTotais;
                  financingTrRateInput.value = found.taxaTR;
                  document.getElementById("financing-start-month").value = found.mes_inicio;
                  document.getElementById("financing-start-year").value = found.ano_inicio;

                  // Ajustar títulos do modal
                  const modalTitle = financingModal.querySelector("h3");
                  const submitBtn = financingRegisterForm.querySelector('button[type="submit"]');
                  if (modalTitle) modalTitle.textContent = "Editar Financiamento";
                  if (submitBtn) submitBtn.textContent = "Salvar Alterações";

                  // GATILHO IMPORTANTE: Desabilitar campos não-permitidos
                  financingNameInput.disabled = true;
                  financingTotalValInput.disabled = true;
                  financingInstallmentValInput.disabled = true;
                  document.getElementById("financing-start-month").disabled = true;
                  document.getElementById("financing-start-year").disabled = true;

                  financingModal.classList.remove("hidden");
                  financingInstallmentsCountInput.focus();
                }
              });
            });
          }
        }

        // B. Atualizar dropdown do simulador
        if (simulatorFinancingSelect) {
          const previousSelectVal = simulatorFinancingSelect.value;
          simulatorFinancingSelect.value = "";
          simulatorFinancingSelect.innerHTML = "";

          const defaultOpt = document.createElement("option");
          defaultOpt.value = "";
          defaultOpt.textContent = "-- Escolha um Financiamento --";
          simulatorFinancingSelect.appendChild(defaultOpt);

          const fAtivos = financiamentos.filter(f => f.perfil === perfilAtivo);
          fAtivos.forEach(f => {
            const opt = document.createElement("option");
            opt.value = f.id;
            opt.textContent = `${f.nome} (${formatCurrency(f.valorTotal)})`;
            if (f.id === previousSelectVal) {
              opt.selected = true;
            }
            simulatorFinancingSelect.appendChild(opt);
          });

          // Re-executar simulação
          runSimulation();
        }

      } else if (mesAtivo === 15) {
        // --- TELA DE CONFIGURAÇÕES (ABA 15) ---
        if (reportsContainer) reportsContainer.classList.add("hidden");
        if (financingContainer) financingContainer.classList.add("hidden");
        if (monthlyExpensesContainer) monthlyExpensesContainer.classList.add("hidden");
        if (settingsContainer) settingsContainer.classList.remove("hidden");

        this.renderConfiguracoes(state);
      } else {
        // --- TELA DE GASTOS COMUNS (ABAS 1-12) ---
        if (reportsContainer) reportsContainer.classList.add("hidden");
        if (financingContainer) financingContainer.classList.add("hidden");
        if (settingsContainer) settingsContainer.classList.add("hidden");
        if (monthlyExpensesContainer) monthlyExpensesContainer.classList.remove("hidden");

        // Preencher Tabela de Despesas do Mês com dados reais distribuídos + Financiamentos
        if (expensesTableBody) {
          expensesTableBody.innerHTML = "";

          const itensDaTabela = [];

          // 1. Adicionar despesas ativas do mês
          despesas.forEach(d => {
            if (d.perfil !== perfilAtivo) return;
            const info = window.App.Engine.getInstallmentInfo(d, mesAtivo, anoAtivo);
            if (info && info.active) {
              itensDaTabela.push({
                tipo: "despesa",
                id: d.id,
                descricao: d.descricao,
                categoria: d.categoria,
                valorParcela: info.valorParcela,
                parcelasTexto: d.recorrente ? "Recorrente" : (info.total === 1 ? "À vista" : `Parcela ${info.index} de ${info.total}`),
                objetoOriginal: d
              });
            }
          });

          // 2. Adicionar financiamentos ativos como linhas informativas sob a categoria "Financiamento"
          const fAtivos = financiamentos.filter(f => f.perfil === perfilAtivo);
          fAtivos.forEach(f => {
            const S_month = parseInt(f.mes_inicio) || 1;
            const S_year = parseInt(f.ano_inicio) || anoAtivo;
            const P = parseInt(f.parcelasTotais) || 1;

            const startAbs = S_year * 12 + S_month - 1;
            const viewAbs = anoAtivo * 12 + mesAtivo - 1;
            const index = viewAbs - startAbs + 1;

            // Apenas listar na tabela se estiver ativo no mês selecionado
            if (index >= 1 && index <= P) {
              itensDaTabela.push({
                tipo: "financiamento",
                id: f.id,
                descricao: `Financiamento: ${f.nome}`,
                categoria: "Financiamento",
                valorParcela: f.valorParcela,
                parcelasTexto: `Parcela ${index} de ${f.parcelasTotais}`
              });
            }
          });
          
          expenseCountBadge.textContent = `${itensDaTabela.length} total`;

          if (itensDaTabela.length === 0) {
            const row = document.createElement("tr");
            row.innerHTML = `
              <td colspan="5" class="text-center py-8 text-slate-500 text-xs font-medium">
                Nenhum gasto cadastrado para este mês.
              </td>
            `;
            expensesTableBody.appendChild(row);
          } else {
            itensDaTabela.forEach(item => {
              const row = document.createElement("tr");
              row.className = "hover:bg-slate-900/40 transition border-b border-slate-850 text-slate-300";
              
              let actionCol = "";
              if (item.tipo === "despesa") {
                actionCol = `
                  <button class="edit-expense-btn bg-slate-800 hover:bg-slate-750 text-indigo-300 hover:text-indigo-200 border border-slate-700 hover:border-slate-650 px-2.5 py-1 rounded-lg transition text-xs mr-1.5 focus:outline-none" data-id="${item.id}">
                    Editar
                  </button>
                  <button class="remove-expense-btn bg-red-950/20 hover:bg-red-950/40 text-red-400 hover:text-red-300 border border-red-500/20 hover:border-red-500/40 px-2.5 py-1 rounded-lg transition text-xs focus:outline-none" data-id="${item.id}">
                    Excluir
                  </button>
                `;
              } else {
                actionCol = `
                  <span class="text-xxs font-bold text-slate-500 uppercase tracking-wider bg-slate-950/40 px-2.5 py-1.5 border border-slate-850 rounded-lg">Fixo Contrato</span>
                `;
              }

              row.innerHTML = `
                <td class="py-3 px-4 font-medium text-slate-200">${item.descricao}</td>
                <td class="py-3 px-4">
                  <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xxs font-bold bg-slate-800 text-slate-400 border border-slate-700/60 shrink-0">
                    <span class="inline-block w-1.5 h-1.5 rounded-full mr-1.5 shrink-0" style="background-color: ${state.categorias[item.categoria] || '#64748b'}"></span>
                    ${item.categoria}
                  </span>
                </td>
                <td class="py-3 px-4 font-mono text-indigo-300">${formatCurrency(item.valorParcela)}</td>
                <td class="py-3 px-4 font-mono text-slate-400">${item.parcelasTexto}</td>
                <td class="py-3 px-4 text-right">
                  ${actionCol}
                </td>
              `;
              expensesTableBody.appendChild(row);
            });

            // Bind nos botões de excluir despesa
            const delButtons = expensesTableBody.querySelectorAll(".remove-expense-btn");
            delButtons.forEach(btn => {
              btn.addEventListener("click", (e) => {
                const id = e.target.getAttribute("data-id");
                try {
                  window.App.State.removerDespesa(id);
                  showStatus("Despesa excluída.");
                } catch (err) {
                  showStatus(err.message, true);
                }
              });
            });

            // Bind nos botões de editar despesa
            const editButtons = expensesTableBody.querySelectorAll(".edit-expense-btn");
            editButtons.forEach(btn => {
              btn.addEventListener("click", (e) => {
                const id = e.target.getAttribute("data-id");
                const found = despesas.find(d => d.id === id);
                if (found) {
                  editingExpenseId = found.id;
                  
                  // Atualizar títulos do modal
                  const modalTitle = expenseModal.querySelector("h3");
                  const submitBtn = modalExpenseCreateForm.querySelector('button[type="submit"]');
                  if (modalTitle) modalTitle.textContent = "Editar Gasto";
                  if (submitBtn) submitBtn.textContent = "Salvar Alterações";

                  // Preencher campos
                  modalExpenseDesc.value = found.descricao;
                  modalExpenseVal.value = formatBRLInput(found.valor.toFixed(2));
                  modalExpenseMonth.value = found.mes_inicio;
                  modalExpenseYear.value = found.ano_inicio || new Date().getFullYear();
                  modalExpenseCat.value = found.categoria;
                  modalExpenseInstallments.value = found.parcelas;
                  
                  const recurrentInput = document.getElementById("modal-expense-recurrent");
                  if (recurrentInput) {
                    recurrentInput.value = found.recorrente ? "sim" : "nao";
                  }

                  // Mostrar parcelamento caso cartão de crédito
                  if (found.categoria === "Cartão de Crédito") {
                    modalExpenseInstallmentsContainer.classList.remove("hidden");
                  } else {
                    modalExpenseInstallmentsContainer.classList.add("hidden");
                  }

                  expenseModal.classList.remove("hidden");
                  modalExpenseDesc.focus();
                }
              });
            });
          }
        }
      }
    }
  };
})();
