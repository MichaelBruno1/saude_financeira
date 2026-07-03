/* global pdfjsLib */
// Namespace global
window.App = window.App || {};

window.App.UI = (() => {
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
    SETTINGS_LLM_MODEL: "settings-llm-model"
  };

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

  // Importação de Fatura PDF
  let btnOpenPdfImport;
  let pdfImportModal;
  let closePdfImportModalBtn;
  let pdfImportUploadZone;
  let pdfImportFileInput;
  let pdfImportLoading;
  let pdfImportStatusText;
  let pdfImportReviewContainer;
  let pdfImportSelectAll;
  let pdfImportTableBody;
  let pdfImportCancelBtn;
  let pdfImportConfirmBtn;
  let extractedExpenses = [];

  // Backup warning banner
  let backupWarningBanner;
  let btnCloseBackupBanner;

  // LLM custom settings variables
  let llmSettingsForm;
  let settingsLlmUrl;
  let settingsLlmKey;
  let settingsLlmModel;

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

  function getLlmConfig() {
    const state = window.App.State.getState();
    const stateConfig = state.llmConfig || {};
    const staticConfig = window.App.LlmConfig || {};

    return {
      apiUrl: String(stateConfig.apiUrl || staticConfig.apiUrl || "").trim(),
      apiKey: String(stateConfig.apiKey || staticConfig.apiKey || "").trim(),
      model: String(stateConfig.model || staticConfig.model || "").trim()
    };
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

  // ── FUNÇÕES DE IMPORTAÇÃO DE FATURA PDF ──────────────────────

  function showPdfImportModal() {
    if (pdfImportModal) {
      pdfImportModal.classList.remove("hidden");
      resetPdfImportState();
    }
  }

  function hidePdfImportModal() {
    if (pdfImportModal) {
      pdfImportModal.classList.add("hidden");
    }
  }

  function resetPdfImportState() {
    if (pdfImportFileInput) pdfImportFileInput.value = "";
    if (pdfImportUploadZone) pdfImportUploadZone.classList.remove("hidden");
    if (pdfImportLoading) pdfImportLoading.classList.add("hidden");
    if (pdfImportReviewContainer) pdfImportReviewContainer.classList.add("hidden");
    if (pdfImportTableBody) pdfImportTableBody.innerHTML = "";
    if (pdfImportConfirmBtn) {
      pdfImportConfirmBtn.disabled = true;
      pdfImportConfirmBtn.textContent = "Confirmar Lançamento";
    }
    extractedExpenses = [];
  }

  async function processPdfFile(file) {
    if (!file) return;

    if (pdfImportUploadZone) pdfImportUploadZone.classList.add("hidden");
    if (pdfImportLoading) pdfImportLoading.classList.remove("hidden");
    if (pdfImportStatusText) pdfImportStatusText.textContent = "Lendo arquivo PDF localmente...";

    try {
      const arrayBuffer = await file.arrayBuffer();
      // Configure worker CDN
      pdfjsLib.GlobalWorkerOptions.workerSrc = "public/pdf.worker.min.js";
      const pdfDoc = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      let rawText = "";

      for (let i = 1; i <= pdfDoc.numPages; i++) {
        if (pdfImportStatusText) pdfImportStatusText.textContent = `Lendo página ${i} de ${pdfDoc.numPages}...`;
        const page = await pdfDoc.getPage(i);
        const textContent = await page.getTextContent();
        rawText += textContent.items.map(item => item.str).join(" ") + "\n";
      }

      if (!rawText.trim()) {
        throw new Error("Não foi possível extrair nenhum texto legível deste PDF.");
      }

      if (pdfImportStatusText) pdfImportStatusText.textContent = "Estruturando fatura com Inteligência Artificial...";
      await sendTextToLlm(rawText);

    } catch (err) {
      console.error("Erro no processamento do PDF:", err);
      alert(`Erro no processamento do PDF: ${err.message}`);
      resetPdfImportState();
    }
  }

  async function sendTextToLlm(text) {
    // A. Carregar configuração
    const config = getLlmConfig();
    
    const apiUrl = config.apiUrl;
    const apiKey = config.apiKey;
    const model = config.model;

    if (!apiUrl || !model) {
      throw new Error("Configuração da LLM incompleta. Certifique-se de preencher URL Base e Modelo nas Configurações.");
    }

    // B. Carregar o template de prompt
    let promptTemplate = "";
    try {
      const response = await fetch("prompts/importacao.md");
      if (response.ok) {
        promptTemplate = await response.text();
      } else {
        throw new Error(`Erro HTTP! Status: ${response.status}`);
      }
    } catch (err) {
      console.warn("Erro ao carregar o prompt de 'prompts/importacao.md' via fetch. Usando fallback local:", err);
      // Fallback template
      promptTemplate = `Você é um processador de dados especializado em faturas de cartão de crédito. Sua tarefa é analisar o texto extraído de uma fatura de cartão de crédito e retornar ESTRITAMENTE um JSON contendo uma lista de despesas identificadas.

### INSTRUÇÕES DE EXTRAÇÃO:
1. **Identifique apenas transações de gastos/despesas** (compras, débitos, tarifas). Ignore pagamentos de fatura, créditos, estornos ou saldos anteriores.
2. **Identifique compras parceladas**:
   - Compras parceladas normalmente contêm indicações como \`02/05\`, \`2 de 5\`, \`2/5\`, \`Parcela 02\`.
   - Se for uma compra parcelada, identifique:
     - \`description\`: O nome do estabelecimento (remova o sufixo da parcela, ex: "Lojas Americanas 02/05" vira "Lojas Americanas").
     - \`value\`: O valor cobrado NESTA fatura (o valor da parcela individual).
     - \`isInstallment\`: \`true\`.
     - \`currentInstallment\`: O número da parcela atual cobrada (no exemplo acima, \`2\`).
     - \`totalInstallments\`: O total de parcelas (no exemplo acima, \`5\`).
3. **Se a compra NÃO for parcelada**:
   - \`description\`: O nome do estabelecimento.
   - \`value\`: O valor total cobrado.
   - \`isInstallment\`: \`false\`.
   - \`currentInstallment\`: \`1\`.
   - \`totalInstallments\`: \`1\`.

### FORMATO DE RETORNO ESPERADO:
Retorne ESTRITAMENTE uma lista JSON, sem explicações, tags de código markdown (como \`\`\`json) ou qualquer outro texto. Apenas o JSON válido.

Exemplo de formato:
[
  {
    "description": "Supermercado Pão de Açúcar",
    "value": 156.40,
    "isInstallment": false,
    "currentInstallment": 1,
    "totalInstallments": 1
  },
  {
    "description": "Geladeira Consul",
    "value": 120.00,
    "isInstallment": true,
    "currentInstallment": 3,
    "totalInstallments": 10
  }
]

### TEXTO DA FATURA A SER ANALISADO:
{{TEXTO_FATURA}}`;
    }

    const promptText = promptTemplate.replace("{{TEXTO_FATURA}}", text);

    // C. Chamada para a API
    const requestBody = {
      model: model,
      messages: [
        { role: "user", content: promptText }
      ],
      temperature: 0.1
    };

    const response = await fetch(`${apiUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Erro na chamada da LLM (${response.status}): ${errText}`);
    }

    const resData = await response.json();
    let choiceText = resData.choices && resData.choices[0] && resData.choices[0].message && resData.choices[0].message.content;

    if (!choiceText) {
      throw new Error("A API da LLM retornou uma resposta vazia.");
    }

    choiceText = choiceText.trim();
    if (choiceText.startsWith("```")) {
      choiceText = choiceText.replace(/^```[a-zA-Z]*\n/, "");
      choiceText = choiceText.replace(/\n```$/, "");
    }
    choiceText = choiceText.trim();

    try {
      extractedExpenses = JSON.parse(choiceText);
      if (!Array.isArray(extractedExpenses)) {
        throw new Error("O retorno da LLM não é um array válido.");
      }
      renderReviewTable();
    } catch (jsonErr) {
      console.error("Erro ao parsear JSON da LLM:", choiceText, jsonErr);
      throw new Error("A inteligência artificial não retornou um formato JSON válido. Tente novamente.");
    }
  }

  function renderReviewTable() {
    if (pdfImportLoading) pdfImportLoading.classList.add("hidden");
    if (pdfImportReviewContainer) pdfImportReviewContainer.classList.remove("hidden");
    if (pdfImportTableBody) {
      pdfImportTableBody.innerHTML = "";

      if (extractedExpenses.length === 0) {
        pdfImportTableBody.innerHTML = `<tr><td colspan="4" class="py-6 text-center text-slate-500">Nenhum gasto identificado na fatura.</td></tr>`;
        if (pdfImportConfirmBtn) pdfImportConfirmBtn.disabled = true;
        return;
      }

      extractedExpenses.forEach((exp, idx) => {
        const row = document.createElement("tr");
        row.className = "hover:bg-slate-900/30 transition-colors";
        
        const description = exp.description || "";
        const value = parseFloat(exp.value) || 0;
        const isInstallment = !!exp.isInstallment;
        const current = parseInt(exp.currentInstallment) || 1;
        const total = parseInt(exp.totalInstallments) || 1;

        row.innerHTML = `
          <td class="py-3 px-4 text-center">
            <input type="checkbox" data-idx="${idx}" checked class="rounded bg-slate-950 border-slate-800 text-indigo-600 focus:ring-indigo-500 cursor-pointer">
          </td>
          <td class="py-3 px-4">
            <input type="text" data-field="description" data-idx="${idx}" value="${description.replace(/"/g, '&quot;')}" class="w-full bg-slate-950/60 border border-slate-800 focus:border-indigo-500/50 rounded px-2 py-1 text-xs text-slate-300 focus:outline-none transition">
          </td>
          <td class="py-3 px-4">
            <input type="number" step="0.01" data-field="value" data-idx="${idx}" value="${value.toFixed(2)}" class="w-full bg-slate-950/60 border border-slate-800 focus:border-indigo-500/50 rounded px-2 py-1 text-xs text-slate-300 focus:outline-none transition">
          </td>
          <td class="py-3 px-4">
            <div class="flex items-center space-x-1">
              <input type="number" min="1" max="100" data-field="current" data-idx="${idx}" value="${current}" ${isInstallment ? "" : "disabled"} class="w-12 bg-slate-950/60 border border-slate-800 focus:border-indigo-500/50 rounded px-1.5 py-1 text-[11px] text-slate-300 focus:outline-none transition disabled:opacity-40">
              <span class="text-[10px] text-slate-600 font-semibold">de</span>
              <input type="number" min="1" max="100" data-field="total" data-idx="${idx}" value="${total}" ${isInstallment ? "" : "disabled"} class="w-12 bg-slate-950/60 border border-slate-800 focus:border-indigo-500/50 rounded px-1.5 py-1 text-[11px] text-slate-300 focus:outline-none transition disabled:opacity-40">
              <label class="flex items-center space-x-1 ml-2 cursor-pointer select-none">
                <input type="checkbox" data-field="is_inst" data-idx="${idx}" ${isInstallment ? "checked" : ""} class="rounded bg-slate-950 border-slate-800 text-indigo-600 focus:ring-indigo-500">
                <span class="text-[10px] text-slate-500">Parcelada</span>
              </label>
            </div>
          </td>
        `;
        pdfImportTableBody.appendChild(row);
      });
    }

    setupReviewTableListeners();
    updateConfirmBtnState();
  }

  function setupReviewTableListeners() {
    if (!pdfImportTableBody) return;
    const checkboxes = pdfImportTableBody.querySelectorAll('input[type="checkbox"][data-idx]');
    const textInputs = pdfImportTableBody.querySelectorAll('input[type="text"][data-idx]');
    const numInputs = pdfImportTableBody.querySelectorAll('input[type="number"][data-idx]');

    checkboxes.forEach(cb => {
      if (cb.dataset.field === "is_inst") {
        cb.addEventListener("change", (e) => {
          const idx = parseInt(e.target.dataset.idx);
          const isChecked = e.target.checked;
          extractedExpenses[idx].isInstallment = isChecked;
          
          const currentInput = pdfImportTableBody.querySelector(`input[data-field="current"][data-idx="${idx}"]`);
          const totalInput = pdfImportTableBody.querySelector(`input[data-field="total"][data-idx="${idx}"]`);
          
          if (isChecked) {
            if (currentInput) currentInput.disabled = false;
            if (totalInput) {
              totalInput.disabled = false;
              if (parseInt(totalInput.value) <= 1) {
                totalInput.value = "2";
                extractedExpenses[idx].totalInstallments = 2;
              }
            }
          } else {
            if (currentInput) {
              currentInput.disabled = true;
              currentInput.value = "1";
            }
            if (totalInput) {
              totalInput.disabled = true;
              totalInput.value = "1";
            }
            extractedExpenses[idx].currentInstallment = 1;
            extractedExpenses[idx].totalInstallments = 1;
          }
        });
      } else {
        cb.addEventListener("change", () => {
          updateConfirmBtnState();
        });
      }
    });

    textInputs.forEach(input => {
      input.addEventListener("input", (e) => {
        const idx = parseInt(e.target.dataset.idx);
        extractedExpenses[idx].description = e.target.value;
      });
    });

    numInputs.forEach(input => {
      input.addEventListener("input", (e) => {
        const idx = parseInt(e.target.dataset.idx);
        const field = e.target.dataset.field;
        const val = e.target.value;

        if (field === "value") {
          extractedExpenses[idx].value = parseFloat(val) || 0;
        } else if (field === "current") {
          extractedExpenses[idx].currentInstallment = Math.max(1, parseInt(val) || 1);
        } else if (field === "total") {
          extractedExpenses[idx].totalInstallments = Math.max(1, parseInt(val) || 1);
        }
      });
    });
  }

  function updateConfirmBtnState() {
    if (!pdfImportTableBody) return;
    const checkedBoxes = pdfImportTableBody.querySelectorAll('input[type="checkbox"][data-idx]:not([data-field="is_inst"]):checked');
    if (pdfImportConfirmBtn) {
      pdfImportConfirmBtn.disabled = checkedBoxes.length === 0;
      pdfImportConfirmBtn.textContent = `Confirmar Lançamento (${checkedBoxes.length})`;
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
      sidebarProfileSelect = document.getElementById(DOM_IDS.SIDEBAR_PROFILE_SELECT);
      deleteProfileBtn = document.getElementById(DOM_IDS.DELETE_PROFILE_BTN);
      sidebarNewProfileBtn = document.getElementById(DOM_IDS.SIDEBAR_NEW_PROFILE_BTN);
      
      newProfileModal = document.getElementById(DOM_IDS.NEW_PROFILE_MODAL);
      closeProfileModalBtn = document.getElementById(DOM_IDS.CLOSE_PROFILE_MODAL_BTN);
      modalCancelBtn = document.getElementById(DOM_IDS.MODAL_CANCEL_BTN);
      modalProfileCreateForm = document.getElementById(DOM_IDS.MODAL_PROFILE_CREATE_FORM);
      
      exportCsvBtn = document.getElementById(DOM_IDS.EXPORT_CSV_BTN);
      csvFileInput = document.getElementById(DOM_IDS.CSV_FILE_INPUT);
      importCsvBtn = document.getElementById(DOM_IDS.IMPORT_CSV_BTN);
      syncStatus = document.getElementById(DOM_IDS.SYNC_STATUS);
      
      headerProfileName = document.getElementById(DOM_IDS.HEADER_PROFILE_NAME);
      kpiSalario = document.getElementById(DOM_IDS.KPI_SALARIO);
      kpiDespesas = document.getElementById(DOM_IDS.KPI_DESPESAS);
      kpiSaldo = document.getElementById(DOM_IDS.KPI_SALDO);
      
      salaryViewMode = document.getElementById(DOM_IDS.SALARY_VIEW_MODE);
      salaryEditMode = document.getElementById(DOM_IDS.SALARY_EDIT_MODE);
      editSalaryBtn = document.getElementById(DOM_IDS.EDIT_SALARY_BTN);
      salaryInput = document.getElementById(DOM_IDS.SALARY_INPUT);
      saveSalaryBtn = document.getElementById(DOM_IDS.SAVE_SALARY_BTN);
      cancelSalaryBtn = document.getElementById(DOM_IDS.CANCEL_SALARY_BTN);
      
      monthTabsContainer = document.getElementById(DOM_IDS.MONTH_TABS_CONTAINER);
      yearTabsContainer = document.getElementById(DOM_IDS.YEAR_TABS_CONTAINER);
      addExpenseBtn = document.getElementById(DOM_IDS.ADD_EXPENSE_BTN);
      sidebarRelatoriosBtn = document.getElementById(DOM_IDS.SIDEBAR_RELATORIOS_BTN);
      sidebarFinanciamentoBtn = document.getElementById(DOM_IDS.SIDEBAR_FINANCIAMENTO_BTN);
      sidebarDespesasBtn = document.getElementById(DOM_IDS.SIDEBAR_DESPESAS_BTN);
      sidebarSettingsBtn = document.getElementById(DOM_IDS.SIDEBAR_SETTINGS_BTN);
      
      // Configurações
      settingsContainer = document.getElementById(DOM_IDS.SETTINGS_CONTAINER);
      themeToggleBtn = document.getElementById(DOM_IDS.THEME_TOGGLE_BTN);
      themeToggleBtnText = document.getElementById(DOM_IDS.THEME_TOGGLE_BTN_TEXT);
      addCategoryForm = document.getElementById(DOM_IDS.ADD_CATEGORY_FORM);
      newCategoryName = document.getElementById(DOM_IDS.NEW_CATEGORY_NAME);
      newCategoryColor = document.getElementById(DOM_IDS.NEW_CATEGORY_COLOR);
      newCategoryColorHex = document.getElementById(DOM_IDS.NEW_CATEGORY_COLOR_HEX);
      categoriesColorsList = document.getElementById(DOM_IDS.CATEGORIES_COLORS_LIST);
      
      // Modal Despesas
      expenseModal = document.getElementById(DOM_IDS.EXPENSE_MODAL);
      closeExpenseModalBtn = document.getElementById(DOM_IDS.CLOSE_EXPENSE_MODAL_BTN);
      modalExpenseCancelBtn = document.getElementById(DOM_IDS.MODAL_EXPENSE_CANCEL_BTN);
      modalExpenseCreateForm = document.getElementById(DOM_IDS.MODAL_EXPENSE_CREATE_FORM);
      modalExpenseDesc = document.getElementById(DOM_IDS.MODAL_EXPENSE_DESC);
      modalExpenseVal = document.getElementById(DOM_IDS.MODAL_EXPENSE_VAL);
      modalExpenseMonth = document.getElementById(DOM_IDS.MODAL_EXPENSE_MONTH);
      modalExpenseYear = document.getElementById(DOM_IDS.MODAL_EXPENSE_YEAR);
      modalExpenseCat = document.getElementById(DOM_IDS.MODAL_EXPENSE_CAT);
      modalExpenseInstallmentsContainer = document.getElementById(DOM_IDS.MODAL_EXPENSE_INSTALLMENTS_CONTAINER);
      modalExpenseInstallments = document.getElementById(DOM_IDS.MODAL_EXPENSE_INSTALLMENTS);

      // Modal Financiamentos
      financingModal = document.getElementById(DOM_IDS.FINANCING_MODAL);
      closeFinancingModalBtn = document.getElementById(DOM_IDS.CLOSE_FINANCING_MODAL_BTN);
      modalFinancingCancelBtn = document.getElementById(DOM_IDS.MODAL_FINANCING_CANCEL_BTN);
      financingTableBody = document.getElementById(DOM_IDS.FINANCING_TABLE_BODY);
      
      // Modal de Importação PDF
      btnOpenPdfImport = document.getElementById(DOM_IDS.BTN_OPEN_PDF_IMPORT);
      pdfImportModal = document.getElementById(DOM_IDS.PDF_IMPORT_MODAL);
      closePdfImportModalBtn = document.getElementById(DOM_IDS.CLOSE_PDF_IMPORT_MODAL_BTN);
      pdfImportUploadZone = document.getElementById(DOM_IDS.PDF_IMPORT_UPLOAD_ZONE);
      pdfImportFileInput = document.getElementById(DOM_IDS.PDF_IMPORT_FILE_INPUT);
      pdfImportLoading = document.getElementById(DOM_IDS.PDF_IMPORT_LOADING);
      pdfImportStatusText = document.getElementById(DOM_IDS.PDF_IMPORT_STATUS_TEXT);
      pdfImportReviewContainer = document.getElementById(DOM_IDS.PDF_IMPORT_REVIEW_CONTAINER);
      pdfImportSelectAll = document.getElementById(DOM_IDS.PDF_IMPORT_SELECT_ALL);
      pdfImportTableBody = document.getElementById(DOM_IDS.PDF_IMPORT_TABLE_BODY);
      pdfImportCancelBtn = document.getElementById(DOM_IDS.PDF_IMPORT_CANCEL_BTN);
      pdfImportConfirmBtn = document.getElementById(DOM_IDS.PDF_IMPORT_CONFIRM_BTN);
      
      backupWarningBanner = document.getElementById(DOM_IDS.BACKUP_WARNING_BANNER);
      btnCloseBackupBanner = document.getElementById(DOM_IDS.BTN_CLOSE_BACKUP_BANNER);
      
      llmSettingsForm = document.getElementById(DOM_IDS.LLM_SETTINGS_FORM);
      settingsLlmUrl = document.getElementById(DOM_IDS.SETTINGS_LLM_URL);
      settingsLlmKey = document.getElementById(DOM_IDS.SETTINGS_LLM_KEY);
      settingsLlmModel = document.getElementById(DOM_IDS.SETTINGS_LLM_MODEL);
      
      // Containers da aba de relatórios
      monthlyExpensesContainer = document.getElementById(DOM_IDS.MONTHLY_EXPENSES_CONTAINER);
      reportsContainer = document.getElementById(DOM_IDS.REPORTS_CONTAINER);
      reportsPizzaMonthSelect = document.getElementById(DOM_IDS.REPORTS_PIZZA_MONTH_SELECT);
      if (reportsPizzaMonthSelect) {
        reportsPizzaMonthSelect.value = String(new Date().getMonth() + 1);
      }
      reportsBudgetProgressContainer = document.getElementById(DOM_IDS.REPORTS_BUDGET_PROGRESS_CONTAINER);
      
      // Containers da aba de financiamentos
      financingContainer = document.getElementById(DOM_IDS.FINANCING_CONTAINER);
      financingRegisterForm = document.getElementById(DOM_IDS.FINANCING_REGISTER_FORM);
      financingNameInput = document.getElementById(DOM_IDS.FINANCING_NAME);
      financingTotalValInput = document.getElementById(DOM_IDS.FINANCING_TOTAL_VAL);
      financingInstallmentValInput = document.getElementById(DOM_IDS.FINANCING_INSTALLMENT_VAL);
      financingInstallmentsCountInput = document.getElementById(DOM_IDS.FINANCING_INSTALLMENTS_COUNT);
      financingTrRateInput = document.getElementById(DOM_IDS.FINANCING_TR_RATE);

      simulatorFinancingSelect = document.getElementById(DOM_IDS.SIMULATOR_FINANCING_SELECT);
      simulatorAmortizationVal = document.getElementById(DOM_IDS.SIMULATOR_AMORTIZATION_VAL);
      simulatorAmortizationFrequency = document.getElementById(DOM_IDS.SIMULATOR_AMORTIZATION_FREQUENCY);

      simulationResultsContainer = document.getElementById(DOM_IDS.SIMULATION_RESULTS_CONTAINER);
      simKpiJurosSaved = document.getElementById(DOM_IDS.SIM_KPI_JUROS_SAVED);
      simKpiMonthsSaved = document.getElementById(DOM_IDS.SIM_KPI_MONTHS_SAVED);
      simTableNormalMonths = document.getElementById(DOM_IDS.SIM_TABLE_NORMAL_MONTHS);
      simTableNormalJuros = document.getElementById(DOM_IDS.SIM_TABLE_NORMAL_JUROS);
      simTableNormalTotal = document.getElementById(DOM_IDS.SIM_TABLE_NORMAL_TOTAL);
      simTableAmortMonths = document.getElementById(DOM_IDS.SIM_TABLE_AMORT_MONTHS);
      simTableAmortJuros = document.getElementById(DOM_IDS.SIM_TABLE_AMORT_JUROS);
      simTableAmortTotal = document.getElementById(DOM_IDS.SIM_TABLE_AMORT_TOTAL);

      expenseCountBadge = document.getElementById(DOM_IDS.EXPENSE_COUNT_BADGE);
      expensesTableBody = document.getElementById(DOM_IDS.EXPENSES_TABLE_BODY);

      // Planejador Financeiro
      plannerMethodSelect = document.getElementById(DOM_IDS.PLANNER_METHOD_SELECT);
      plannerComparisonTableBody = document.getElementById(DOM_IDS.PLANNER_COMPARISON_TABLE_BODY);
      settingsPlannerMethodSelect = document.getElementById(DOM_IDS.SETTINGS_PLANNER_METHOD_SELECT);
      settingsPlannerLimitsForm = document.getElementById(DOM_IDS.SETTINGS_PLANNER_LIMITS_FORM);
      settingsPlannerInputsGrid = document.getElementById(DOM_IDS.SETTINGS_PLANNER_INPUTS_GRID);
      settingsPlannerTotalSum = document.getElementById(DOM_IDS.SETTINGS_PLANNER_TOTAL_SUM);
      settingsPlannerWarning = document.getElementById(DOM_IDS.SETTINGS_PLANNER_WARNING);
      settingsPlannerInfo = document.getElementById(DOM_IDS.SETTINGS_PLANNER_INFO);
      settingsPlannerSobraSpan = document.getElementById(DOM_IDS.SETTINGS_PLANNER_SOBRA_SPAN);

      // Inteligência Artificial (LLM)
      generateAiAnalysisBtn = document.getElementById(DOM_IDS.GENERATE_AI_ANALYSIS_BTN);
      aiAnalysisLoader = document.getElementById(DOM_IDS.AI_ANALYSIS_LOADER);
      aiAnalysisResultCard = document.getElementById(DOM_IDS.AI_ANALYSIS_RESULT_CARD);
      aiAnalysisTimestamp = document.getElementById(DOM_IDS.AI_ANALYSIS_TIMESTAMP);
      aiAnalysisTextContent = document.getElementById(DOM_IDS.AI_ANALYSIS_TEXT_CONTENT);

      // --- Bind de Mascaramento Monetário ---
      const monetaryFields = [
        salaryInput,
        document.getElementById(DOM_IDS.MODAL_NEW_PROFILE_SALARY),
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
        document.getElementById(DOM_IDS.MODAL_NEW_PROFILE_NAME).focus();
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
        const nome = document.getElementById(DOM_IDS.MODAL_NEW_PROFILE_NAME).value.trim();
        const salario = parseBRLValue(document.getElementById(DOM_IDS.MODAL_NEW_PROFILE_SALARY).value);

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
        
        const recurrentInput = document.getElementById(DOM_IDS.MODAL_EXPENSE_RECURRENT);
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
          document.getElementById(DOM_IDS.FINANCING_START_MONTH).disabled = false;
          document.getElementById(DOM_IDS.FINANCING_START_YEAR).disabled = false;

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
        const recorrente = document.getElementById(DOM_IDS.MODAL_EXPENSE_RECURRENT).value === "sim";

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
            const mesInicio = parseInt(document.getElementById(DOM_IDS.FINANCING_START_MONTH).value) || 1;
            const anoInicio = parseInt(document.getElementById(DOM_IDS.FINANCING_START_YEAR).value) || new Date().getFullYear();

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
          window.App.State.atualizarUltimoBackup();
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
            const config = getLlmConfig();
            
            const apiUrl = config.apiUrl;
            const apiKey = config.apiKey;
            const model = config.model;

            if (!apiUrl || !model) {
              throw new Error("Configuração da LLM incompleta. Certifique-se de preencher URL Base e Modelo nas Configurações.");
            }

            // B. Carregar o template de prompt
            let promptTemplate = "";
            try {
              const response = await fetch("prompts/analise.md");
              if (response.ok) {
                promptTemplate = await response.text();
              } else {
                throw new Error(`Erro HTTP! Status: ${response.status}`);
              }
            } catch (err) {
              console.warn("Erro ao carregar o prompt de 'prompts/analise.md' via fetch. Usando fallback local:", err);
              promptTemplate = `Você é um consultor financeiro pessoal. Analise os dados abaixo e gere um diagnóstico curto, claro e útil.

## Dados do usuário

**Perfil:** {{PERFIL}}

**Salário Mensal:**
{{SALARIO}}

**Método Financeiro ({{METODO_PLANEJADOR}}):**
{{LIMITES_PLANEJADOR}}

**Resumo dos Gastos:**
{{GASTOS_REAIS}}

**Despesas Detalhadas:**
{{DETALHE_DESPESAS}}

**Financiamentos:**
{{DETALHE_FINANCIAMENTOS}}

---

## Gere um relatório em Markdown contendo apenas:

### 🩺 Saúde Financeira
Classifique como:
- Excelente
- Boa
- Atenção
- Crítica

Explique em até 3 frases o motivo.

---

### 📊 Comparação com o Planejamento

Mostre:

- ✅ Categorias dentro da meta
- ⚠️ Categorias próximo da meta
- 🚨 Categorias acima da meta

Se possível, informe quanto passou do limite.

---

### 💡 O que Fazer Agora

Liste no máximo 5 ações práticas, priorizadas pelo maior impacto financeiro.

---

### 💰 Para Onde Seu Dinheiro Está Indo

Resuma quais categorias mais consomem a renda e informe se o valor destinado aos investimentos está adequado.

---

### 🔮 Se Nada Mudar...

Projete o resultado financeiro até o final do ano considerando o padrão atual de receitas e despesas.

Informe:

- saldo estimado;
- principais riscos;
- oportunidade de economia.

---

## Estilo da resposta

- Seja curto e direto.
- Evite repetir informações.
- Use linguagem simples.
- Escreva como um consultor experiente e bem-humorado.
- Faça comentários leves e ocasionais (uma piada ou comparação divertida), sem exagerar.
- Nunca invente informações.
- Não explique como fez os cálculos.
- Não faça introduções nem encerramentos.
- Um baixo gasto com saúde deve ser visto como algo positivo, pois não representa problemas de saúde.
- Um baixo gasto com alimentação deve ser visto como algo positivo, pois representa um baixo uso de apps de delivery de comida.`;
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

      // 12. Importação de Fatura PDF
      if (btnOpenPdfImport) {
        btnOpenPdfImport.addEventListener("click", () => {
          showPdfImportModal();
        });
      }

      if (closePdfImportModalBtn) {
        closePdfImportModalBtn.addEventListener("click", () => {
          hidePdfImportModal();
        });
      }

      if (pdfImportCancelBtn) {
        pdfImportCancelBtn.addEventListener("click", () => {
          hidePdfImportModal();
        });
      }

      if (pdfImportUploadZone && pdfImportFileInput) {
        pdfImportUploadZone.addEventListener("click", () => {
          pdfImportFileInput.click();
        });

        pdfImportFileInput.addEventListener("change", (e) => {
          const file = e.target.files[0];
          if (file) {
            processPdfFile(file);
          }
        });

        pdfImportUploadZone.addEventListener("dragover", (e) => {
          e.preventDefault();
          pdfImportUploadZone.classList.add("border-indigo-500", "bg-slate-900/30");
        });

        pdfImportUploadZone.addEventListener("dragleave", () => {
          pdfImportUploadZone.classList.remove("border-indigo-500", "bg-slate-900/30");
        });

        pdfImportUploadZone.addEventListener("drop", (e) => {
          e.preventDefault();
          pdfImportUploadZone.classList.remove("border-indigo-500", "bg-slate-900/30");
          const file = e.dataTransfer.files[0];
          if (file && file.type === "application/pdf") {
            processPdfFile(file);
          } else {
            alert("Por favor, selecione ou solte um arquivo PDF.");
          }
        });
      }

      if (pdfImportSelectAll) {
        let allSelected = true;
        pdfImportSelectAll.addEventListener("click", () => {
          const checkboxes = pdfImportTableBody.querySelectorAll('input[type="checkbox"][data-idx]:not([data-field="is_inst"])');
          allSelected = !allSelected;
          checkboxes.forEach(cb => {
            cb.checked = allSelected;
          });
          pdfImportSelectAll.textContent = allSelected ? "Desmarcar Todos" : "Marcar Todos";
          updateConfirmBtnState();
        });
      }

      if (pdfImportConfirmBtn) {
        pdfImportConfirmBtn.addEventListener("click", () => {
          const checkedBoxes = pdfImportTableBody.querySelectorAll('input[type="checkbox"][data-idx]:not([data-field="is_inst"]):checked');
          if (checkedBoxes.length === 0) return;

          const state = window.App.State.getState();
          const activeMonth = state.mesAtivo;
          const activeYear = state.anoAtivo;

          if (activeMonth > 12) {
            alert("Por favor, navegue para um mês de Janeiro a Dezembro na barra superior para realizar os lançamentos.");
            return;
          }

          let importedCount = 0;

          checkedBoxes.forEach(cb => {
            const idx = parseInt(cb.dataset.idx);
            const exp = extractedExpenses[idx];

            const desc = String(exp.description).trim() || "Compra Cartão";
            const instVal = parseFloat(exp.value) || 0;
            const isInst = !!exp.isInstallment;
            const current = Math.max(1, parseInt(exp.currentInstallment) || 1);
            const total = Math.max(1, parseInt(exp.totalInstallments) || 1);

            if (isInst && total > 1) {
              // Calcular retroatividade
              const offset = current - 1;
              const absMonth = activeYear * 12 + activeMonth - 1 - offset;
              const startYear = Math.floor(absMonth / 12);
              const startMonth = (absMonth % 12) + 1;
              const totalValue = instVal * total;

              window.App.State.adicionarDespesa(
                desc,
                totalValue,
                "Cartão de Crédito",
                startMonth,
                total,
                false,
                startYear
              );
            } else {
              // Compra comum
              window.App.State.adicionarDespesa(
                desc,
                instVal,
                "Cartão de Crédito",
                activeMonth,
                1,
                false,
                activeYear
              );
            }
            importedCount++;
          });

          hidePdfImportModal();
          showStatus(`Importação concluída: ${importedCount} despesas cadastradas!`);
        });
      }

      if (btnCloseBackupBanner) {
        btnCloseBackupBanner.addEventListener("click", () => {
          if (backupWarningBanner) backupWarningBanner.classList.add("hidden");
        });
      }

      if (llmSettingsForm) {
        console.log("UI: Registro do Evento submit do form LLM efetuado.");
        llmSettingsForm.addEventListener("submit", (e) => {
          e.preventDefault();
          const urlVal = settingsLlmUrl.value.trim();
          const keyVal = settingsLlmKey.value.trim();
          const modelVal = settingsLlmModel.value.trim();
          console.log("UI: Submetendo formulário de LLM:", { urlVal, modelVal });

          try {
            window.App.State.atualizarLlmConfig(urlVal, keyVal, modelVal);
            showStatus("Configuração da LLM atualizada!");
          } catch (err) {
            showStatus(err.message, true);
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

      // 3. Preencher formulário de configuração da LLM
      if (settingsLlmUrl && settingsLlmKey && settingsLlmModel) {
        const llm = state.llmConfig || {};
        console.log("UI: Preenchendo inputs da LLM com dados do estado:", llm);
        settingsLlmUrl.value = llm.apiUrl || "";
        settingsLlmKey.value = llm.apiKey || "";
        settingsLlmModel.value = llm.model || "";
      } else {
        console.warn("UI: Inputs da LLM ausentes na árvore DOM ao tentar preencher:", {
          settingsLlmUrl: !!settingsLlmUrl,
          settingsLlmKey: !!settingsLlmKey,
          settingsLlmModel: !!settingsLlmModel
        });
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
    render(state, changedKey = "all") {
      const { perfis, perfilAtivo, despesas, mesAtivo, anoAtivo, financiamentos } = state;

      // Verificar recomendação de backup
      if (backupWarningBanner && (changedKey === "all" || changedKey === "ultimoBackup" || changedKey === "despesas" || changedKey === "financiamentos")) {
        const ultimoBackup = state.ultimoBackup;
        const quinzeDiasMs = 15 * 24 * 60 * 60 * 1000;
        
        // Se nunca fez backup ou fez há mais de 15 dias, e tem dados para fazer backup
        const possuiDados = (Array.isArray(despesas) && despesas.length > 0) || (Array.isArray(financiamentos) && financiamentos.length > 0);
        if (possuiDados && (!ultimoBackup || (Date.now() - ultimoBackup) > quinzeDiasMs)) {
          backupWarningBanner.classList.remove("hidden");
        } else {
          backupWarningBanner.classList.add("hidden");
        }
      }

      // Aplicar Tema Claro/Escuro
      if (document.body && (changedKey === "all" || changedKey === "theme")) {
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
        if (mesAtivo <= 12 && (changedKey === "all" || changedKey === "despesas" || changedKey === "financiamentos" || changedKey === "calendario" || changedKey === "perfilAtivo")) {
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
                  document.getElementById(DOM_IDS.FINANCING_START_MONTH).value = found.mes_inicio;
                  document.getElementById(DOM_IDS.FINANCING_START_YEAR).value = found.ano_inicio;

                  // Ajustar títulos do modal
                  const modalTitle = financingModal.querySelector("h3");
                  const submitBtn = financingRegisterForm.querySelector('button[type="submit"]');
                  if (modalTitle) modalTitle.textContent = "Editar Financiamento";
                  if (submitBtn) submitBtn.textContent = "Salvar Alterações";

                  // GATILHO IMPORTANTE: Desabilitar campos não-permitidos
                  financingNameInput.disabled = true;
                  financingTotalValInput.disabled = true;
                  financingInstallmentValInput.disabled = true;
                  document.getElementById(DOM_IDS.FINANCING_START_MONTH).disabled = true;
                  document.getElementById(DOM_IDS.FINANCING_START_YEAR).disabled = true;

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
                  
                  const recurrentInput = document.getElementById(DOM_IDS.MODAL_EXPENSE_RECURRENT);
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
