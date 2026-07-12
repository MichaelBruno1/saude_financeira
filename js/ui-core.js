/* global pdfjsLib */
// ── Namespace global ──────────────────────────────────────────────────────────
window.App = window.App || {};

// Objeto de estado compartilhado de elementos DOM — populado pelo init() do ui-core
// e lido por todos os outros módulos (ui-expenses, ui-financing, etc.)
window.App.UIState = {};

window.App.UI = (() => {
  // ── Mapa centralizado de IDs do DOM ─────────────────────────────────────────
  const DOM_IDS = {
    ADD_CATEGORY_FORM: "add-category-form",
    ADD_EXPENSE_BTN: "add-expense-btn",
    AI_ANALYSIS_LOADER: "ai-analysis-loader",
    AI_ANALYSIS_RESULT_CARD: "ai-analysis-result-card",
    AI_ANALYSIS_TEXT_CONTENT: "ai-analysis-text-content",
    AI_ANALYSIS_TIMESTAMP: "ai-analysis-timestamp",
    BACKUP_WARNING_BANNER: "backup-warning-banner",
    BTN_CLOSE_BACKUP_BANNER: "btn-close-backup-banner",
    BTN_OPEN_PDF_IMPORT: "btn-open-pdf-import",
    CANCEL_SALARY_BTN: "cancel-salary-btn",
    CATEGORIES_COLORS_LIST: "categories-colors-list",
    CLOSE_EXPENSE_MODAL_BTN: "close-expense-modal-btn",
    CLOSE_FINANCING_MODAL_BTN: "close-financing-modal-btn",
    CLOSE_PDF_IMPORT_MODAL_BTN: "close-pdf-import-modal-btn",
    CLOSE_PROFILE_MODAL_BTN: "close-profile-modal-btn",
    CSV_FILE_INPUT: "csv-file-input",
    DELETE_PROFILE_BTN: "delete-profile-btn",
    EDIT_SALARY_BTN: "edit-salary-btn",
    EXPENSE_COUNT_BADGE: "expense-count-badge",
    EXPENSE_MODAL: "expense-modal",
    EXPENSES_TABLE_BODY: "expenses-table-body",
    EXPORT_CSV_BTN: "export-csv-btn",
    FINANCING_CONTAINER: "financing-container",
    FINANCING_INSTALLMENT_VAL: "financing-installment-val",
    FINANCING_INSTALLMENTS_COUNT: "financing-installments-count",
    FINANCING_MODAL: "financing-modal",
    FINANCING_NAME: "financing-name",
    FINANCING_REGISTER_FORM: "financing-register-form",
    FINANCING_START_MONTH: "financing-start-month",
    FINANCING_START_YEAR: "financing-start-year",
    FINANCING_TABLE_BODY: "financing-table-body",
    FINANCING_TOTAL_VAL: "financing-total-val",
    FINANCING_TR_RATE: "financing-tr-rate",
    GENERATE_AI_ANALYSIS_BTN: "generate-ai-analysis-btn",
    HEADER_PROFILE_NAME: "header-profile-name",
    IMPORT_CSV_BTN: "import-csv-btn",
    KPI_DESPESAS: "kpi-despesas",
    KPI_SALARIO: "kpi-salario",
    KPI_SALDO: "kpi-saldo",
    MODAL_CANCEL_BTN: "modal-cancel-btn",
    MODAL_EXPENSE_CANCEL_BTN: "modal-expense-cancel-btn",
    MODAL_EXPENSE_CAT: "modal-expense-cat",
    MODAL_EXPENSE_CREATE_FORM: "modal-expense-create-form",
    MODAL_EXPENSE_DESC: "modal-expense-desc",
    MODAL_EXPENSE_INSTALLMENTS: "modal-expense-installments",
    MODAL_EXPENSE_INSTALLMENTS_CONTAINER: "modal-expense-installments-container",
    MODAL_EXPENSE_MONTH: "modal-expense-month",
    MODAL_EXPENSE_RECURRENT: "modal-expense-recurrent",
    MODAL_EXPENSE_VAL: "modal-expense-val",
    MODAL_EXPENSE_YEAR: "modal-expense-year",
    MODAL_FINANCING_CANCEL_BTN: "modal-financing-cancel-btn",
    MODAL_NEW_PROFILE_NAME: "modal-new-profile-name",
    MODAL_NEW_PROFILE_SALARY: "modal-new-profile-salary",
    MODAL_PROFILE_CREATE_FORM: "modal-profile-create-form",
    MONTH_TABS_CONTAINER: "month-tabs-container",
    MONTHLY_EXPENSES_CONTAINER: "monthly-expenses-container",
    NEW_CATEGORY_COLOR: "new-category-color",
    NEW_CATEGORY_COLOR_HEX: "new-category-color-hex",
    NEW_CATEGORY_NAME: "new-category-name",
    NEW_PROFILE_MODAL: "new-profile-modal",
    PDF_IMPORT_CANCEL_BTN: "pdf-import-cancel-btn",
    PDF_IMPORT_CONFIRM_BTN: "pdf-import-confirm-btn",
    PDF_IMPORT_FILE_INPUT: "pdf-import-file-input",
    PDF_IMPORT_LOADING: "pdf-import-loading",
    PDF_IMPORT_MODAL: "pdf-import-modal",
    PDF_IMPORT_REVIEW_CONTAINER: "pdf-import-review-container",
    PDF_IMPORT_SELECT_ALL: "pdf-import-select-all",
    PDF_IMPORT_STATUS_TEXT: "pdf-import-status-text",
    PDF_IMPORT_TABLE_BODY: "pdf-import-table-body",
    PDF_IMPORT_UPLOAD_ZONE: "pdf-import-upload-zone",
    PLANNER_COMPARISON_TABLE_BODY: "planner-comparison-table-body",
    PLANNER_METHOD_SELECT: "planner-method-select",
    REPORTS_BUDGET_PROGRESS_CONTAINER: "reports-budget-progress-container",
    REPORTS_CONTAINER: "reports-container",
    REPORTS_PIZZA_MONTH_SELECT: "reports-pizza-month-select",
    SALARY_EDIT_MODE: "salary-edit-mode",
    SALARY_INPUT: "salary-input",
    SALARY_VIEW_MODE: "salary-view-mode",
    SAVE_SALARY_BTN: "save-salary-btn",
    SETTINGS_CONTAINER: "settings-container",
    SETTINGS_PLANNER_INFO: "settings-planner-info",
    SETTINGS_PLANNER_INPUTS_GRID: "settings-planner-inputs-grid",
    SETTINGS_PLANNER_LIMITS_FORM: "settings-planner-limits-form",
    SETTINGS_PLANNER_METHOD_SELECT: "settings-planner-method-select",
    SETTINGS_PLANNER_SOBRA_SPAN: "settings-planner-sobra-span",
    SETTINGS_PLANNER_TOTAL_SUM: "settings-planner-total-sum",
    SETTINGS_PLANNER_WARNING: "settings-planner-warning",
    SIDEBAR_DESPESAS_BTN: "sidebar-despesas-btn",
    SIDEBAR_FINANCIAMENTO_BTN: "sidebar-financiamento-btn",
    SIDEBAR_NEW_PROFILE_BTN: "sidebar-new-profile-btn",
    SIDEBAR_PROFILE_SELECT: "sidebar-profile-select",
    SIDEBAR_RELATORIOS_BTN: "sidebar-relatorios-btn",
    SIDEBAR_SETTINGS_BTN: "sidebar-settings-btn",
    SIM_KPI_JUROS_SAVED: "sim-kpi-juros-saved",
    SIM_KPI_MONTHS_SAVED: "sim-kpi-months-saved",
    SIM_TABLE_AMORT_JUROS: "sim-table-amort-juros",
    SIM_TABLE_AMORT_MONTHS: "sim-table-amort-months",
    SIM_TABLE_AMORT_TOTAL: "sim-table-amort-total",
    SIM_TABLE_NORMAL_JUROS: "sim-table-normal-juros",
    SIM_TABLE_NORMAL_MONTHS: "sim-table-normal-months",
    SIM_TABLE_NORMAL_TOTAL: "sim-table-normal-total",
    SIMULATION_RESULTS_CONTAINER: "simulation-results-container",
    SIMULATOR_AMORTIZATION_FREQUENCY: "simulator-amortization-frequency",
    SIMULATOR_AMORTIZATION_VAL: "simulator-amortization-val",
    SIMULATOR_FINANCING_SELECT: "simulator-financing-select",
    SYNC_STATUS: "sync-status",
    THEME_TOGGLE_BTN: "theme-toggle-btn",
    THEME_TOGGLE_BTN_TEXT: "theme-toggle-btn-text",
    YEAR_TABS_CONTAINER: "year-tabs-container",
    LLM_SETTINGS_FORM: "llm-settings-form",
    SETTINGS_LLM_URL: "settings-llm-url",
    SETTINGS_LLM_KEY: "settings-llm-key",
    SETTINGS_LLM_MODEL: "settings-llm-model",
    SETTINGS_LLM_MAX_CONTEXT: "settings-llm-max-context",
    BTN_CHAT_AGENT: "btn-chat-agent",
    AGENT_CHAT_MODAL: "agent-chat-modal",
    CLOSE_AGENT_CHAT_MODAL_BTN: "close-agent-chat-modal-btn",
    AGENT_CHAT_MESSAGES: "agent-chat-messages",
    AGENT_CHAT_LOADER: "agent-chat-loader",
    AGENT_CHAT_FORM: "agent-chat-form",
    AGENT_CHAT_INPUT: "agent-chat-input",
    // Investimentos & Plano Economia
    MODAL_EXPENSE_INVESTMENT_CONTAINER: "modal-expense-investment-container",
    MODAL_EXPENSE_INVESTMENT_CAT: "modal-expense-investment-cat",
    SIDEBAR_INVESTIMENTOS_BTN: "sidebar-investimentos-btn",
    INVESTMENTS_CONTAINER: "investments-container",
    KPI_TOTAL_INVESTIDO: "kpi-total-investido",
    KPI_RESERVA_EMERGENCIA: "kpi-reserva-emergencia",
    KPI_FGTS_VIEW: "kpi-fgts-view",
    KPI_FGTS_INPUT: "kpi-fgts-input",
    BTN_EDIT_FGTS: "btn-edit-fgts",
    BTN_SAVE_FGTS: "btn-save-fgts",
    KPI_TOTAL_COM_FGTS: "kpi-total-com-fgts",
    INVESTMENTS_TABLE_BODY: "investments-table-body",
    GENERATE_INVESTMENTS_ANALYSIS_BTN: "generate-investments-analysis-btn",
    INVESTMENTS_ANALYSIS_LOADER: "investments-analysis-loader",
    INVESTMENTS_ANALYSIS_RESULT_CARD: "investments-analysis-result-card",
    INVESTMENTS_ANALYSIS_TIMESTAMP: "investments-analysis-timestamp",
    INVESTMENTS_ANALYSIS_TEXT_CONTENT: "investments-analysis-text-content",
    ADD_INVESTMENT_CATEGORY_FORM: "add-investment-category-form",
    NEW_INVESTMENT_CATEGORY_NAME: "new-investment-category-name",
    SETTINGS_INVESTMENT_CATEGORIES_LIST: "settings-investment-categories-list",
    GENERATE_SAVINGS_PLAN_BTN: "generate-savings-plan-btn",
    SAVINGS_PLAN_LOADER: "savings-plan-loader",
    SAVINGS_PLAN_RESULT_CARD: "savings-plan-result-card",
    SAVINGS_PLAN_TIMESTAMP: "savings-plan-timestamp",
    SAVINGS_PLAN_TEXT_CONTENT: "savings-plan-text-content"
  };

  // Expõe DOM_IDS para que os sub-módulos possam consultar sem duplicar
  window.App.UI_DOM_IDS = DOM_IDS;

  const MONTHS = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
  ];
  window.App.UI_MONTHS = MONTHS;

  // ── Utilitários globais ──────────────────────────────────────────────────────

  function formatCurrency(value) {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  }

  function parseMarkdownToHTML(text) {
    if (!text) return "";
    let html = text
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
    return `<p>${html}</p>`;
  }

  function formatBRLInput(value) {
    const isNegative = String(value).trim().startsWith("-");
    let digits = String(value).replace(/\D/g, "");
    if (digits === "") return "";
    let numberVal = parseFloat(digits) / 100;
    const formatted = new Intl.NumberFormat('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(numberVal);
    return isNegative ? `-${formatted}` : formatted;
  }

  function parseBRLValue(formattedString) {
    if (typeof formattedString === "number") return formattedString;
    if (!formattedString) return 0;
    const clean = String(formattedString).replace(/\./g, "").replace(",", ".");
    return parseFloat(clean) || 0;
  }

  function getLlmConfig() {
    const state = window.App.State.getState();
    const stateConfig = state.llmConfig || {};
    const staticConfig = window.App.LlmConfig || {};
    return {
      apiUrl: String(stateConfig.apiUrl || staticConfig.apiUrl || "").trim(),
      apiKey: String(stateConfig.apiKey || staticConfig.apiKey || "").trim(),
      model: String(stateConfig.model || staticConfig.model || "").trim(),
      maxContext: parseInt(stateConfig.maxContext || staticConfig.maxContext || 10240)
    };
  }

  function showStatus(message, isError = false) {
    const syncStatus = window.App.UIState.syncStatus;
    if (!syncStatus) return;
    syncStatus.textContent = message;
    syncStatus.className = `text-xs text-center font-medium mt-2 px-3 py-1.5 rounded-lg transition ${
      isError ? 'bg-red-950/40 text-red-400 border border-red-900/40' : 'bg-emerald-950/40 text-emerald-400 border border-emerald-900/40'
    }`;
    syncStatus.classList.remove('hidden');
    setTimeout(() => { syncStatus.classList.add('hidden'); }, 4000);
  }

  // Expõe utilitários para sub-módulos
  window.App.UIUtils = { formatCurrency, parseMarkdownToHTML, formatBRLInput, parseBRLValue, getLlmConfig, showStatus };

  // ── Módulo principal ─────────────────────────────────────────────────────────
  return {
    init() {
      const s = window.App.UIState;
      const g = id => document.getElementById(id);

      // ── Mapear elementos DOM para o namespace compartilhado ──────────────────
      s.sidebarProfileSelect   = g(DOM_IDS.SIDEBAR_PROFILE_SELECT);
      s.deleteProfileBtn       = g(DOM_IDS.DELETE_PROFILE_BTN);
      s.sidebarNewProfileBtn   = g(DOM_IDS.SIDEBAR_NEW_PROFILE_BTN);
      s.newProfileModal        = g(DOM_IDS.NEW_PROFILE_MODAL);
      s.closeProfileModalBtn   = g(DOM_IDS.CLOSE_PROFILE_MODAL_BTN);
      s.modalCancelBtn         = g(DOM_IDS.MODAL_CANCEL_BTN);
      s.modalProfileCreateForm = g(DOM_IDS.MODAL_PROFILE_CREATE_FORM);
      s.exportCsvBtn           = g(DOM_IDS.EXPORT_CSV_BTN);
      s.csvFileInput           = g(DOM_IDS.CSV_FILE_INPUT);
      s.importCsvBtn           = g(DOM_IDS.IMPORT_CSV_BTN);
      s.syncStatus             = g(DOM_IDS.SYNC_STATUS);
      s.headerProfileName      = g(DOM_IDS.HEADER_PROFILE_NAME);
      s.kpiSalario             = g(DOM_IDS.KPI_SALARIO);
      s.kpiDespesas            = g(DOM_IDS.KPI_DESPESAS);
      s.kpiSaldo               = g(DOM_IDS.KPI_SALDO);
      s.salaryViewMode         = g(DOM_IDS.SALARY_VIEW_MODE);
      s.salaryEditMode         = g(DOM_IDS.SALARY_EDIT_MODE);
      s.editSalaryBtn          = g(DOM_IDS.EDIT_SALARY_BTN);
      s.salaryInput            = g(DOM_IDS.SALARY_INPUT);
      s.saveSalaryBtn          = g(DOM_IDS.SAVE_SALARY_BTN);
      s.cancelSalaryBtn        = g(DOM_IDS.CANCEL_SALARY_BTN);
      s.monthTabsContainer     = g(DOM_IDS.MONTH_TABS_CONTAINER);
      s.yearTabsContainer      = g(DOM_IDS.YEAR_TABS_CONTAINER);
      s.btnOpenPdfImport       = g(DOM_IDS.BTN_OPEN_PDF_IMPORT);
      s.btnAddFinanciamento    = g("btn-add-financiamento");
      
      // Mapear elementos locais para os módulos filhos
      s.sidebarFinanciamentoBtn= g(DOM_IDS.SIDEBAR_FINANCIAMENTO_BTN);
      s.sidebarDespesasBtn     = g(DOM_IDS.SIDEBAR_DESPESAS_BTN);
      s.sidebarRelatoriosBtn   = g(DOM_IDS.SIDEBAR_RELATORIOS_BTN);
      s.sidebarSettingsBtn     = g(DOM_IDS.SIDEBAR_SETTINGS_BTN);
      s.sidebarInvestimentosBtn= g(DOM_IDS.SIDEBAR_INVESTIMENTOS_BTN);
      s.addExpenseBtn          = g(DOM_IDS.ADD_EXPENSE_BTN);
      s.backupWarningBanner    = g(DOM_IDS.BACKUP_WARNING_BANNER);
      s.btnCloseBackupBanner   = g(DOM_IDS.BTN_CLOSE_BACKUP_BANNER);
      s.monthlyExpensesContainer = g(DOM_IDS.MONTHLY_EXPENSES_CONTAINER);
      s.reportsContainer       = g(DOM_IDS.REPORTS_CONTAINER);
      s.financingContainer     = g(DOM_IDS.FINANCING_CONTAINER);
      s.settingsContainer      = g(DOM_IDS.SETTINGS_CONTAINER);
      s.investmentsContainer   = g(DOM_IDS.INVESTMENTS_CONTAINER);
      s.reportsPizzaMonthSelect= g(DOM_IDS.REPORTS_PIZZA_MONTH_SELECT);
      s.expenseCountBadge      = g(DOM_IDS.EXPENSE_COUNT_BADGE);
      s.expensesTableBody      = g(DOM_IDS.EXPENSES_TABLE_BODY);
      s.plannerMethodSelect    = g(DOM_IDS.PLANNER_METHOD_SELECT);
      // Controle de edição — mutável pelos sub-módulos
      s.editingExpenseId       = null;
      s.editingFinancingId     = null;

      if (s.reportsPizzaMonthSelect) {
        s.reportsPizzaMonthSelect.value = String(new Date().getMonth() + 1);
      }

      // Delega mapeamento dos elementos especializados para cada sub-módulo
      if (window.App.UIExpenses)    window.App.UIExpenses.mapElements(DOM_IDS);
      if (window.App.UIFinancing)   window.App.UIFinancing.mapElements(DOM_IDS);
      if (window.App.UIReports)     window.App.UIReports.mapElements(DOM_IDS);
      if (window.App.UIInvestments) window.App.UIInvestments.mapElements(DOM_IDS);
      if (window.App.UISettings)    window.App.UISettings.mapElements(DOM_IDS);
      if (window.App.UIAgent)       window.App.UIAgent.mapElements(DOM_IDS);

      // ── Mascaramento monetário ───────────────────────────────────────────────
      const monetaryFieldIds = [
        DOM_IDS.SALARY_INPUT,
        DOM_IDS.MODAL_NEW_PROFILE_SALARY,
        DOM_IDS.MODAL_EXPENSE_VAL,
        DOM_IDS.FINANCING_TOTAL_VAL,
        DOM_IDS.FINANCING_INSTALLMENT_VAL,
        DOM_IDS.SIMULATOR_AMORTIZATION_VAL
      ];
      monetaryFieldIds.forEach(id => {
        const field = g(id);
        if (field) {
          field.addEventListener("input", e => {
            e.target.value = formatBRLInput(e.target.value);
          });
        }
      });

      // ── Sidebar: Navegação ───────────────────────────────────────────────────
      if (s.sidebarDespesasBtn) {
        s.sidebarDespesasBtn.addEventListener("click", () => {
          const state = window.App.State.getState();
          let targetMonth = state.mesAtivo;
          if (targetMonth > 12) targetMonth = new Date().getMonth() + 1;
          window.App.State.selecionarMes(targetMonth);
        });
      }
      if (s.sidebarRelatoriosBtn)    s.sidebarRelatoriosBtn.addEventListener("click",    () => window.App.State.selecionarMes(13));
      if (s.sidebarFinanciamentoBtn) s.sidebarFinanciamentoBtn.addEventListener("click", () => window.App.State.selecionarMes(14));
      if (s.sidebarSettingsBtn)      s.sidebarSettingsBtn.addEventListener("click",      () => window.App.State.selecionarMes(15));
      if (s.sidebarInvestimentosBtn) s.sidebarInvestimentosBtn.addEventListener("click", () => window.App.State.selecionarMes(16));

      // ── Perfis ───────────────────────────────────────────────────────────────
      s.sidebarProfileSelect.addEventListener("change", e => {
        if (e.target.value) window.App.State.selecionarPerfil(e.target.value);
      });

      s.deleteProfileBtn.addEventListener("click", () => {
        const state = window.App.State.getState();
        const ativo = state.perfilAtivo;
        if (!ativo) { showStatus("Nenhum perfil ativo para deletar.", true); return; }
        if (confirm(`Tem certeza que deseja deletar o perfil "${ativo}" e todas as suas despesas?`)) {
          try { window.App.State.removerPerfil(ativo); showStatus(`Perfil "${ativo}" deletado.`); }
          catch (err) { showStatus(err.message, true); }
        }
      });

      s.sidebarNewProfileBtn.addEventListener("click", () => {
        s.newProfileModal.classList.remove("hidden");
        g(DOM_IDS.MODAL_NEW_PROFILE_NAME).focus();
      });

      const hideProfileModal = () => {
        s.newProfileModal.classList.add("hidden");
        s.modalProfileCreateForm.reset();
      };
      s.closeProfileModalBtn.addEventListener("click", hideProfileModal);
      s.modalCancelBtn.addEventListener("click", hideProfileModal);

      s.modalProfileCreateForm.addEventListener("submit", e => {
        e.preventDefault();
        const nome = g(DOM_IDS.MODAL_NEW_PROFILE_NAME).value.trim();
        const salario = parseBRLValue(g(DOM_IDS.MODAL_NEW_PROFILE_SALARY).value);
        if (!nome) { alert("Por favor, digite um nome válido."); return; }
        if (isNaN(salario) || salario < 0) { alert("Por favor, digite um salário válido."); return; }
        try { window.App.State.adicionarPerfil(nome, salario); hideProfileModal(); showStatus(`Perfil "${nome}" criado com sucesso!`); }
        catch (err) { alert(`Erro: ${err.message}`); }
      });

      // ── Salário ──────────────────────────────────────────────────────────────
      s.editSalaryBtn.addEventListener("click", () => {
        const state = window.App.State.getState();
        const ativo = state.perfis.find(p => p.nome === state.perfilAtivo);
        if (ativo) {
          s.salaryInput.value = formatBRLInput(ativo.salario.toFixed(2));
          s.salaryViewMode.classList.add("hidden");
          s.salaryEditMode.classList.remove("hidden");
          s.salaryInput.focus();
        }
      });
      s.cancelSalaryBtn.addEventListener("click", () => {
        s.salaryEditMode.classList.add("hidden");
        s.salaryViewMode.classList.remove("hidden");
      });
      s.saveSalaryBtn.addEventListener("click", () => {
        const novoSalario = parseBRLValue(s.salaryInput.value);
        if (isNaN(novoSalario) || novoSalario < 0) { showStatus("Digite um salário válido.", true); return; }
        try {
          window.App.State.atualizarSalario(novoSalario);
          s.salaryEditMode.classList.add("hidden");
          s.salaryViewMode.classList.remove("hidden");
          showStatus("Salário atualizado com sucesso!");
        } catch (err) { showStatus(err.message, true); }
      });
      s.salaryInput.addEventListener("keydown", e => {
        if (e.key === "Enter") s.saveSalaryBtn.click();
        else if (e.key === "Escape") s.cancelSalaryBtn.click();
      });

      // ── CSV Export / Import ──────────────────────────────────────────────────
      s.exportCsvBtn.addEventListener("click", () => {
        const state = window.App.State.getState();
        const success = window.App.Storage.exportAsCSVFile(state);
        if (success) { window.App.State.atualizarUltimoBackup(); showStatus("Arquivo CSV exportado!"); }
        else { showStatus("Erro ao exportar CSV.", true); }
      });

      s.importCsvBtn.addEventListener("click", () => s.csvFileInput.click());

      s.csvFileInput.addEventListener("change", e => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = event => {
          try {
            const importedState = window.App.Storage.parseFromCSV(event.target.result);
            window.App.State.importarPerfilCSV(importedState);
            s.csvFileInput.value = "";
            showStatus("Perfil importado com sucesso!");
          } catch (err) {
            s.csvFileInput.value = "";
            showStatus(err.message, true);
            alert(`Erro na importação: ${err.message}`);
          }
        };
        reader.readAsText(file, "UTF-8");
      });

      // ── Backup banner ────────────────────────────────────────────────────────
      if (s.btnCloseBackupBanner) {
        s.btnCloseBackupBanner.addEventListener("click", () => {
          if (s.backupWarningBanner) s.backupWarningBanner.classList.add("hidden");
        });
      }

      // ── Seletor de mês do gráfico de pizza ───────────────────────────────────
      if (s.reportsPizzaMonthSelect) {
        s.reportsPizzaMonthSelect.addEventListener("change", () => {
          window.App.UI.render(window.App.State.getState());
        });
      }

      // ── Delega init dos sub-módulos ──────────────────────────────────────────
      if (window.App.UIExpenses)    window.App.UIExpenses.init();
      if (window.App.UIFinancing)   window.App.UIFinancing.init();
      if (window.App.UIReports)     window.App.UIReports.init();
      if (window.App.UIInvestments) window.App.UIInvestments.init();
      if (window.App.UISettings)    window.App.UISettings.init();
      if (window.App.UIAgent)       window.App.UIAgent.init();
    },

    // ── Renderização de abas de anos ─────────────────────────────────────────
    renderAnos(state) {
      const s = window.App.UIState;
      if (!s.yearTabsContainer) return;
      s.yearTabsContainer.innerHTML = "";
      const activeYear  = state.anoAtivo || new Date().getFullYear();
      const currentYear = new Date().getFullYear();
      const years = new Set([currentYear]);
      const { despesas, perfilAtivo } = state;
      if (Array.isArray(despesas) && perfilAtivo) {
        despesas.forEach(d => {
          if (d.perfil !== perfilAtivo) return;
          const S_year = parseInt(d.ano_inicio) || currentYear;
          if (d.categoria === "Cartão de Crédito" && d.parcelas > 1) {
            const S_month = parseInt(d.mes_inicio) || 1;
            const P = parseInt(d.parcelas) || 1;
            const startAbs = S_year * 12 + S_month - 1;
            const endYear = Math.floor((startAbs + P - 1) / 12);
            for (let y = S_year; y <= endYear; y++) years.add(y);
          } else {
            years.add(S_year);
          }
        });
      }
      Array.from(years).sort((a, b) => a - b).forEach(y => {
        const tabBtn = document.createElement("button");
        tabBtn.type = "button";
        tabBtn.className = "px-4 py-2 text-xs font-semibold rounded-xl border border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-850/50 transition whitespace-nowrap shrink-0 focus:outline-none cursor-pointer";
        tabBtn.textContent = String(y);
        if (y === activeYear) tabBtn.classList.add("tab-month-active");
        tabBtn.addEventListener("click", () => window.App.State.selecionarAno(y));
        s.yearTabsContainer.appendChild(tabBtn);
      });
    },

    // ── Renderização de abas de meses ────────────────────────────────────────
    renderAbas(state) {
      const s = window.App.UIState;
      if (!s.monthTabsContainer) return;
      s.monthTabsContainer.innerHTML = "";
      const activeMonth = state.mesAtivo || 1;
      window.App.UI_MONTHS.forEach((nome, idx) => {
        const mesNumero = idx + 1;
        const tabBtn = document.createElement("button");
        tabBtn.type = "button";
        tabBtn.className = "px-4 py-2.5 text-xs font-semibold rounded-xl border border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-850/50 transition whitespace-nowrap shrink-0 focus:outline-none";
        tabBtn.textContent = nome;
        if (mesNumero === activeMonth) tabBtn.classList.add("tab-month-active");
        tabBtn.addEventListener("click", () => window.App.State.selecionarMes(mesNumero));
        s.monthTabsContainer.appendChild(tabBtn);
      });
    },

    // ── Renderização do dropdown de perfis ───────────────────────────────────
    renderPerfis(state) {
      const s = window.App.UIState;
      const { formatCurrency } = window.App.UIUtils;
      if (!s.sidebarProfileSelect) return;
      s.sidebarProfileSelect.innerHTML = "";
      const { perfis, perfilAtivo } = state;
      if (perfis.length === 0) {
        const option = document.createElement("option");
        option.value = ""; option.textContent = "Nenhum Perfil";
        s.sidebarProfileSelect.appendChild(option);
        if (s.headerProfileName) { s.headerProfileName.textContent = ""; s.headerProfileName.classList.add("hidden"); }
        if (s.kpiSalario)  s.kpiSalario.textContent  = formatCurrency(0);
        if (s.kpiDespesas) s.kpiDespesas.textContent  = formatCurrency(0);
        if (s.kpiSaldo)    { s.kpiSaldo.textContent   = formatCurrency(0); s.kpiSaldo.className = "text-lg font-bold text-slate-400"; }
        s.deleteProfileBtn.disabled = true;
        s.editSalaryBtn.disabled    = true;
        s.addExpenseBtn.disabled    = true;
      } else {
        s.deleteProfileBtn.disabled = false;
        s.editSalaryBtn.disabled    = false;
        s.addExpenseBtn.disabled    = false;
        perfis.forEach(p => {
          const option = document.createElement("option");
          option.value = p.nome; option.textContent = p.nome;
          if (p.nome === perfilAtivo) option.selected = true;
          s.sidebarProfileSelect.appendChild(option);
        });
        const ativo = perfis.find(p => p.nome === perfilAtivo);
        if (ativo) {
          if (s.headerProfileName) { s.headerProfileName.textContent = ""; s.headerProfileName.classList.add("hidden"); }
          if (s.kpiSalario) s.kpiSalario.textContent = formatCurrency(ativo.salario);
        }
      }
    },

    // ── Atualiza select de categoria no modal de despesas ────────────────────
    renderCategoriasDropdowns(state) {
      const modalExpenseCat = window.App.UIState.modalExpenseCat;
      if (!modalExpenseCat) return;
      const previousValue = modalExpenseCat.value;
      modalExpenseCat.innerHTML = "";
      const cats = state.categorias || {};
      for (const name in cats) {
        const opt = document.createElement("option");
        opt.value = name; opt.textContent = name;
        if (name === previousValue) opt.selected = true;
        modalExpenseCat.appendChild(opt);
      }
    },

    // ── Render principal — dispatcher de telas ───────────────────────────────
    render(state, changedKey = "all") {
      const s = window.App.UIState;
      const { formatCurrency } = window.App.UIUtils;
      const { perfis, perfilAtivo, despesas, mesAtivo, anoAtivo, financiamentos } = state;

      // Banner de backup
      if (s.backupWarningBanner && (changedKey === "all" || changedKey === "ultimoBackup" || changedKey === "despesas" || changedKey === "financiamentos")) {
        const quinzeDiasMs = 15 * 24 * 60 * 60 * 1000;
        const possuiDados  = (Array.isArray(despesas) && despesas.length > 0) || (Array.isArray(financiamentos) && financiamentos.length > 0);
        if (possuiDados && (!state.ultimoBackup || (Date.now() - state.ultimoBackup) > quinzeDiasMs)) {
          s.backupWarningBanner.classList.remove("hidden");
        } else {
          s.backupWarningBanner.classList.add("hidden");
        }
      }

      // Tema
      if (document.body && (changedKey === "all" || changedKey === "theme")) {
        if (state.theme === "light") document.body.classList.add("theme-light");
        else document.body.classList.remove("theme-light");
      }

      this.renderPerfis(state);
      this.renderAnos(state);
      this.renderAbas(state);
      this.renderCategoriasDropdowns(state);

      // Destaque no menu lateral
      const navMap = { sidebarDespesasBtn: m => m <= 12, sidebarRelatoriosBtn: m => m === 13, sidebarFinanciamentoBtn: m => m === 14, sidebarSettingsBtn: m => m === 15, sidebarInvestimentosBtn: m => m === 16 };
      for (const [key, fn] of Object.entries(navMap)) {
        if (s[key]) {
          if (fn(mesAtivo)) s[key].classList.add("sidebar-nav-active");
          else s[key].classList.remove("sidebar-nav-active");
        }
      }

      // Controle de visibilidade do botão de adicionar e das abas de mês/ano
      if (mesAtivo === 14 || mesAtivo === 15 || mesAtivo === 16) {
        if (s.monthTabsContainer) s.monthTabsContainer.classList.add("hidden");
        if (s.yearTabsContainer)  s.yearTabsContainer.classList.add("hidden");
        
        s.addExpenseBtn.classList.add("hidden");
        s.btnOpenPdfImport.classList.add("hidden");
        
        if (mesAtivo === 14) {
          s.btnAddFinanciamento.classList.remove("hidden");
        } else {
          s.btnAddFinanciamento.classList.add("hidden");
        }
      } else {
        if (s.monthTabsContainer) s.monthTabsContainer.classList.remove("hidden");
        if (s.yearTabsContainer)  s.yearTabsContainer.classList.remove("hidden");
        
        s.btnAddFinanciamento.classList.add("hidden");
        if (mesAtivo === 13) {
          s.addExpenseBtn.classList.add("hidden");
          s.btnOpenPdfImport.classList.add("hidden");
        } else {
          s.addExpenseBtn.classList.remove("hidden");
          s.btnOpenPdfImport.classList.remove("hidden");
        }
      }

      // KPIs do header
      const ativo = perfis.find(p => p.nome === perfilAtivo);
      const activeHeaderMonth = mesAtivo <= 12 ? mesAtivo : (new Date().getMonth() + 1);
      const summary = window.App.Engine.calculateMonthlySummary(ativo, activeHeaderMonth, despesas, financiamentos, anoAtivo);
      if (s.kpiDespesas) s.kpiDespesas.textContent = formatCurrency(summary.totalGastos);
      if (s.kpiSaldo) {
        s.kpiSaldo.textContent = formatCurrency(summary.saldoRestante);
        s.kpiSaldo.className = summary.saldoRestante >= 0 ? "text-lg font-bold text-emerald-400" : "text-lg font-bold text-rose-400";
      }

      // Dispatcher de telas
      if (mesAtivo === 13) {
        if (s.monthlyExpensesContainer) s.monthlyExpensesContainer.classList.add("hidden");
        if (s.financingContainer)       s.financingContainer.classList.add("hidden");
        if (s.settingsContainer)        s.settingsContainer.classList.add("hidden");
        if (s.investmentsContainer)     s.investmentsContainer.classList.add("hidden");
        if (s.reportsContainer)         s.reportsContainer.classList.remove("hidden");
        if (window.App.UIReports) window.App.UIReports.render(state);
      } else if (mesAtivo === 14) {
        if (s.monthlyExpensesContainer) s.monthlyExpensesContainer.classList.add("hidden");
        if (s.reportsContainer)         s.reportsContainer.classList.add("hidden");
        if (s.settingsContainer)        s.settingsContainer.classList.add("hidden");
        if (s.investmentsContainer)     s.investmentsContainer.classList.add("hidden");
        if (s.financingContainer)       s.financingContainer.classList.remove("hidden");
        if (window.App.UIFinancing) window.App.UIFinancing.render(state);
      } else if (mesAtivo === 15) {
        if (s.reportsContainer)         s.reportsContainer.classList.add("hidden");
        if (s.financingContainer)       s.financingContainer.classList.add("hidden");
        if (s.monthlyExpensesContainer) s.monthlyExpensesContainer.classList.add("hidden");
        if (s.investmentsContainer)     s.investmentsContainer.classList.add("hidden");
        if (s.settingsContainer)        s.settingsContainer.classList.remove("hidden");
        if (window.App.UISettings) window.App.UISettings.render(state);
      } else if (mesAtivo === 16) {
        if (s.reportsContainer)         s.reportsContainer.classList.add("hidden");
        if (s.financingContainer)       s.financingContainer.classList.add("hidden");
        if (s.monthlyExpensesContainer) s.monthlyExpensesContainer.classList.add("hidden");
        if (s.settingsContainer)        s.settingsContainer.classList.add("hidden");
        if (s.investmentsContainer)     s.investmentsContainer.classList.remove("hidden");
        if (window.App.UIInvestments) window.App.UIInvestments.render(state);
      } else {
        if (s.reportsContainer)         s.reportsContainer.classList.add("hidden");
        if (s.financingContainer)       s.financingContainer.classList.add("hidden");
        if (s.settingsContainer)        s.settingsContainer.classList.add("hidden");
        if (s.investmentsContainer)     s.investmentsContainer.classList.add("hidden");
        if (s.monthlyExpensesContainer) s.monthlyExpensesContainer.classList.remove("hidden");
        if (window.App.UIExpenses) window.App.UIExpenses.render(state);
      }
    },

    // Compat: expõe renderInvestimentos para testes legados
    renderInvestimentos(state) {
      if (window.App.UIInvestments) window.App.UIInvestments.render(state);
    }
  };
})();
