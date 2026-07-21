// ── Módulo: Configurações ─────────────────────────────────────────────────────
window.App = window.App || {};

window.App.UISettings = (() => {
  let settingsContainer, themeToggleBtn, themeToggleBtnText, localstorageUsageBadge;
  let categoriesColorsList, addCategoryForm, newCategoryName, newCategoryColor, newCategoryColorHex;
  let llmSettingsForm, settingsLlmUrl, settingsLlmKey, settingsLlmModel, settingsLlmMaxContext;
  let settingsInvestmentCategoriesList;
  let settingsPlannerInputsGrid, settingsPlannerMethodSelect, settingsPlannerTotalSum;
  let settingsPlannerWarning, settingsPlannerInfo, settingsPlannerSobraSpan;
  let btnGenerateCustomMethod, generateCustomMethodSpinner, optMethodPersonalizado;
  let lastProfile = null;

  function mapElements(DOM_IDS) {
    const g = id => document.getElementById(id);
    const s = window.App.UIState;
    settingsContainer                = g(DOM_IDS.SETTINGS_CONTAINER);
    themeToggleBtn                   = g(DOM_IDS.THEME_TOGGLE_BTN);
    themeToggleBtnText               = g(DOM_IDS.THEME_TOGGLE_BTN_TEXT);
    localstorageUsageBadge           = g(DOM_IDS.LOCALSTORAGE_USAGE_BADGE);
    categoriesColorsList             = g(DOM_IDS.CATEGORIES_COLORS_LIST);
    addCategoryForm                  = g(DOM_IDS.ADD_CATEGORY_FORM);
    newCategoryName                  = g(DOM_IDS.NEW_CATEGORY_NAME);
    newCategoryColor                 = g(DOM_IDS.NEW_CATEGORY_COLOR);
    newCategoryColorHex              = g(DOM_IDS.NEW_CATEGORY_COLOR_HEX);
    llmSettingsForm                  = g(DOM_IDS.LLM_SETTINGS_FORM);
    settingsLlmUrl                   = g(DOM_IDS.SETTINGS_LLM_URL);
    settingsLlmKey                   = g(DOM_IDS.SETTINGS_LLM_KEY);
    settingsLlmModel                 = g(DOM_IDS.SETTINGS_LLM_MODEL);
    settingsLlmMaxContext            = g(DOM_IDS.SETTINGS_LLM_MAX_CONTEXT);
    settingsInvestmentCategoriesList = g(DOM_IDS.SETTINGS_INVESTMENT_CATEGORIES_LIST);
    settingsPlannerInputsGrid        = g(DOM_IDS.SETTINGS_PLANNER_INPUTS_GRID);
    settingsPlannerMethodSelect      = g(DOM_IDS.SETTINGS_PLANNER_METHOD_SELECT);
    settingsPlannerTotalSum          = g(DOM_IDS.SETTINGS_PLANNER_TOTAL_SUM);
    settingsPlannerWarning           = g(DOM_IDS.SETTINGS_PLANNER_WARNING);
    settingsPlannerInfo              = g(DOM_IDS.SETTINGS_PLANNER_INFO);
    settingsPlannerSobraSpan         = g(DOM_IDS.SETTINGS_PLANNER_SOBRA_SPAN);
    btnGenerateCustomMethod          = g(DOM_IDS.BTN_GENERATE_CUSTOM_METHOD);
    generateCustomMethodSpinner      = g(DOM_IDS.GENERATE_CUSTOM_METHOD_SPINNER);
    optMethodPersonalizado           = g(DOM_IDS.OPT_METHOD_PERSONALIZADO);

    // Compartilha referencias
    s.settingsContainer = settingsContainer;
    s.categoriesColorsList = categoriesColorsList;
  }

  function init() {
    const { showStatus } = window.App.UIUtils;

    // Theme Toggle
    if (themeToggleBtn) {
      themeToggleBtn.addEventListener("click", () => {
        window.App.State.toggleTheme();
      });
    }

    // Add Category
    if (newCategoryColor) {
      newCategoryColor.addEventListener("input", (e) => {
        if (newCategoryColorHex) newCategoryColorHex.textContent = e.target.value;
      });
    }

    if (addCategoryForm) {
      addCategoryForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const nome = newCategoryName.value.trim();
        const cor = newCategoryColor.value;
        if (!nome) { alert("Nome da categoria não pode ser vazio."); return; }
        try {
          window.App.State.adicionarCategoria(nome, cor);
          showStatus(`Categoria "${nome}" adicionada!`);
          addCategoryForm.reset();
          if (newCategoryColorHex) newCategoryColorHex.textContent = "#000000";
        } catch (err) {
          alert(`Erro: ${err.message}`);
        }
      });
    }

    // LLM Form
    if (llmSettingsForm) {
      llmSettingsForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const apiUrl = settingsLlmUrl.value.trim();
        const apiKey = settingsLlmKey.value.trim();
        const model = settingsLlmModel.value.trim();
        const maxContext = parseInt(settingsLlmMaxContext.value) || 10240;
        try {
          window.App.State.atualizarLlmConfig(apiUrl, apiKey, model, maxContext);
          showStatus("Configuração da LLM salva com sucesso!");
        } catch (err) {
          showStatus(err.message, true);
        }
      });
    }

    // Alterar método no planejador
    if (settingsPlannerMethodSelect) {
      settingsPlannerMethodSelect.addEventListener("change", () => {
        renderPlannerSettingsForm();
      });
    }

    // Salvar limites do planejador
    const plannerLimitsForm = document.getElementById("settings-planner-limits-form");
    if (plannerLimitsForm) {
      plannerLimitsForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const metodo = settingsPlannerMethodSelect.value;
        const inputs = settingsPlannerInputsGrid.querySelectorAll(".planner-percentage-input");
        const limites = {};
        inputs.forEach(inp => {
          const cat = inp.getAttribute("data-category");
          limites[cat] = parseFloat(inp.value) || 0;
        });

        try {
          window.App.State.atualizarPlanejamento(metodo, limites);
          showStatus(`Limites do método "${metodo}" salvos com sucesso!`);
        } catch (err) {
          alert(`Erro: ${err.message}`);
        }
      });
    }

    // Gerar Método Personalizado por IA
    if (btnGenerateCustomMethod) {
      btnGenerateCustomMethod.addEventListener("click", async () => {
        const state = window.App.State.getState();
        const isOnline = window.App.APIClient.isOnline();
        const llm = state.llmConfig || {};
        if (!isOnline && (!llm.apiUrl || !llm.model)) {
          alert("Por favor, configure as chaves da LLM nas Configurações antes de gerar o método personalizado.");
          return;
        }

        const textCustomMethod = document.getElementById("btn-generate-custom-method-text");

        try {
          btnGenerateCustomMethod.disabled = true;
          if (generateCustomMethodSpinner) generateCustomMethodSpinner.classList.remove("hidden");
          if (textCustomMethod) textCustomMethod.textContent = "Gerando...";

          const result = await window.App.UIAgent.askCustomMethod();
          
          window.App.State.atualizarPlanejamento("Personalizado", result);
          
          if (optMethodPersonalizado) optMethodPersonalizado.classList.remove("hidden");
          if (settingsPlannerMethodSelect) {
            settingsPlannerMethodSelect.value = "Personalizado";
          }
          
          renderPlannerSettingsForm();
          showStatus("Método Personalizado gerado com sucesso pela IA!");
        } catch (err) {
          console.error(err);
          alert(`Erro ao gerar método personalizado: ${err.message}`);
        } finally {
          btnGenerateCustomMethod.disabled = false;
          if (generateCustomMethodSpinner) generateCustomMethodSpinner.classList.add("hidden");
          if (textCustomMethod) textCustomMethod.textContent = "Gerar Método Personalizado";
        }
      });
    }
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

    if (settingsPlannerTotalSum) settingsPlannerTotalSum.textContent = `${total}%`;

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

  function render(state) {
    const { showStatus } = window.App.UIUtils;
    const { perfilAtivo } = state;
    
    if (perfilAtivo !== lastProfile) {
      lastProfile = perfilAtivo;
      window.App.UIState.hasSetDefaultSettingsPlannerMethod = false;
    }
    
    if (optMethodPersonalizado) {
      if (state.planejamento && state.planejamento["Personalizado"]) {
        optMethodPersonalizado.classList.remove("hidden");
        if (!window.App.UIState.hasSetDefaultSettingsPlannerMethod) {
          if (settingsPlannerMethodSelect) settingsPlannerMethodSelect.value = "Personalizado";
          window.App.UIState.hasSetDefaultSettingsPlannerMethod = true;
        }
      } else {
        optMethodPersonalizado.classList.add("hidden");
        if (settingsPlannerMethodSelect && settingsPlannerMethodSelect.value === "Personalizado") {
          settingsPlannerMethodSelect.value = "Equilibrado";
        }
      }
    }

    if (themeToggleBtnText) {
      themeToggleBtnText.textContent = state.theme === "light" ? "Mudar para Modo Escuro" : "Mudar para Modo Claro";
    }

    if (localstorageUsageBadge) {
      let totalChars = 0;
      for (let key in localStorage) {
        if (localStorage.hasOwnProperty(key)) {
          totalChars += localStorage[key].length + key.length;
        }
      }
      const mbUsed = (totalChars / (1024 * 1024)).toFixed(2);
      localstorageUsageBadge.textContent = `${mbUsed}/5.0 mb`;
    }

    if (categoriesColorsList) {
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
    }

    if (settingsLlmUrl && settingsLlmKey && settingsLlmModel && settingsLlmMaxContext) {
      const llm = state.llmConfig || {};
      settingsLlmUrl.value = llm.apiUrl || "";
      settingsLlmKey.value = llm.apiKey || "";
      settingsLlmModel.value = llm.model || "";
      settingsLlmMaxContext.value = llm.maxContext || 10240;
    }

    renderPlannerSettingsForm();

    if (settingsInvestmentCategoriesList) {
      settingsInvestmentCategoriesList.innerHTML = "";
      const list = state.categoriasInvestimento || ["CDB", "Previdência", "Fundos", "Ações", "Poupança", "Outros"];
      list.forEach(c => {
        const badge = document.createElement("span");
        badge.className = "bg-slate-900 border border-slate-800 text-slate-400 text-xxs px-2.5 py-1 rounded-lg font-semibold";
        badge.textContent = c;
        settingsInvestmentCategoriesList.appendChild(badge);
      });
    }
  }

  return { mapElements, init, render };
})();
