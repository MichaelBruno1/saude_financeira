// ── Módulo: Inteligência Artificial (Agent & PDF) ─────────────────────────────
window.App = window.App || {};

window.App.UIAgent = (() => {
  let agentChatHistory = [];
  let extractedExpenses = [];
  let detectedInvoiceTotal = null;
  
  let btnChatAgent, agentChatModal, closeAgentChatModalBtn;
  let agentChatMessages, agentChatLoader, agentChatForm, agentChatInput;
  
  let btnOpenPdfImport, pdfImportModal, closePdfImportModalBtn;
  let pdfImportUploadZone, pdfImportFileInput, pdfImportLoading, pdfImportStatusText;
  let pdfImportReviewContainer, pdfImportSelectAll, pdfImportTableBody;
  let pdfImportCancelBtn, pdfImportConfirmBtn;

  function mapElements(DOM_IDS) {
    const g = id => document.getElementById(id);
    
    btnChatAgent             = g(DOM_IDS.BTN_CHAT_AGENT);
    agentChatModal           = g(DOM_IDS.AGENT_CHAT_MODAL);
    closeAgentChatModalBtn   = g(DOM_IDS.CLOSE_AGENT_CHAT_MODAL_BTN);
    agentChatMessages        = g(DOM_IDS.AGENT_CHAT_MESSAGES);
    agentChatLoader          = g(DOM_IDS.AGENT_CHAT_LOADER);
    agentChatForm            = g(DOM_IDS.AGENT_CHAT_FORM);
    agentChatInput           = g(DOM_IDS.AGENT_CHAT_INPUT);
    
    btnOpenPdfImport         = g(DOM_IDS.BTN_OPEN_PDF_IMPORT);
    pdfImportModal           = g(DOM_IDS.PDF_IMPORT_MODAL);
    closePdfImportModalBtn   = g(DOM_IDS.CLOSE_PDF_IMPORT_MODAL_BTN);
    pdfImportUploadZone      = g(DOM_IDS.PDF_IMPORT_UPLOAD_ZONE);
    pdfImportFileInput       = g(DOM_IDS.PDF_IMPORT_FILE_INPUT);
    pdfImportLoading         = g(DOM_IDS.PDF_IMPORT_LOADING);
    pdfImportStatusText      = g(DOM_IDS.PDF_IMPORT_STATUS_TEXT);
    pdfImportReviewContainer = g(DOM_IDS.PDF_IMPORT_REVIEW_CONTAINER);
    pdfImportSelectAll       = g(DOM_IDS.PDF_IMPORT_SELECT_ALL);
    pdfImportTableBody       = g(DOM_IDS.PDF_IMPORT_TABLE_BODY);
    pdfImportCancelBtn       = g(DOM_IDS.PDF_IMPORT_CANCEL_BTN);
    pdfImportConfirmBtn      = g(DOM_IDS.PDF_IMPORT_CONFIRM_BTN);
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

  function prepareLlmRequest(promptText, config, extraParams = {}) {
    const maxContext = config.maxContext || 10240;
    const estimatedTokens = Math.ceil(promptText.length / 4);
    if (estimatedTokens > maxContext) {
      throw new Error(`O prompt enviado excede o limite de tokens de contexto configurado (${estimatedTokens} estimados > ${maxContext} limite). Reduza os dados ou aumente o limite nas Configurações.`);
    }

    // Garantir que a soma de prompt + max_tokens nunca exceda o limite máximo de contexto configurado
    const maxOutputTokens = Math.max(1024, maxContext - estimatedTokens);
    let finalMaxTokens = maxOutputTokens;
    if (extraParams.max_tokens) {
      finalMaxTokens = Math.min(extraParams.max_tokens, maxOutputTokens);
    } else {
      finalMaxTokens = Math.min(4096, maxOutputTokens);
    }

    const requestBody = {
      model: config.model,
      messages: [{ role: "user", content: promptText }],
      temperature: 0.1,
      ...extraParams,
      max_tokens: finalMaxTokens
    };

    // Enviar options.num_ctx apenas para endpoints locais ou de ferramentas locais conhecidas (Ollama, LM Studio)
    const isLocalOrOllama = 
      config.apiUrl.startsWith("http://") || 
      config.apiUrl.includes("localhost") || 
      config.apiUrl.includes("127.0.0.1") || 
      config.apiUrl.includes("0.0.0.0") || 
      config.apiUrl.includes("192.168.") || 
      config.apiUrl.includes("10.") ||
      config.apiUrl.toLowerCase().includes("ollama") ||
      config.apiUrl.toLowerCase().includes("lmstudio") ||
      config.apiUrl.toLowerCase().includes("lm-studio");

    if (isLocalOrOllama) {
      requestBody.options = { num_ctx: maxContext };
    }

    return requestBody;
  }

  function appendChatMessage(role, content) {
    if (!agentChatMessages) return;
    const msgDiv = document.createElement("div");
    if (role === "user") {
      msgDiv.className = "flex items-start justify-end space-x-2.5 max-w-[85%] ml-auto";
      msgDiv.innerHTML = `
        <div class="bg-indigo-655 text-white p-3 rounded-2xl rounded-tr-none border border-indigo-600/30 leading-relaxed break-words">${content}</div>
        <div class="w-6 h-6 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-400 shrink-0 text-[10px] select-none">👤</div>
      `;
    } else if (role === "agent") {
      msgDiv.className = "flex items-start space-x-2.5 max-w-[85%]";
      msgDiv.innerHTML = `
        <div class="w-6 h-6 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400 shrink-0 text-[10px] select-none">🤖</div>
        <div class="bg-slate-850 text-slate-350 p-3 rounded-2xl rounded-tl-none border border-slate-800/40 leading-relaxed break-words">${content}</div>
      `;
    } else if (role === "system") {
      msgDiv.className = "flex items-center justify-center py-1";
      msgDiv.innerHTML = `<div class="bg-emerald-950/40 text-emerald-450 border border-emerald-900/30 px-3 py-1 rounded-lg text-xxs font-semibold">✨ ${content}</div>`;
    } else if (role === "system-error") {
      msgDiv.className = "flex items-center justify-center py-1";
      msgDiv.innerHTML = `<div class="bg-rose-950/40 text-rose-450 border border-rose-900/30 px-3 py-1 rounded-lg text-xxs font-semibold">⚠️ ${content}</div>`;
    }
    agentChatMessages.appendChild(msgDiv);
    agentChatMessages.scrollTop = agentChatMessages.scrollHeight;
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
    detectedInvoiceTotal = null;
    const summaryDiv = document.getElementById("pdf-import-validation-summary");
    if (summaryDiv) summaryDiv.remove();
  }

  function detectInvoiceTotal(text) {
    const regexes = [
      /total\s+da\s+fatura\s*(?:r\$\s*)?([\d.,]+)/i,
      /valor\s+total\s*(?:r\$\s*)?([\d.,]+)/i,
      /total\s+a\s+pagar\s*(?:r\$\s*)?([\d.,]+)/i,
      /total\s+desta\s+fatura\s*(?:r\$\s*)?([\d.,]+)/i,
      /fatura\s+total\s*(?:r\$\s*)?([\d.,]+)/i,
      /total\s+devido\s*(?:r\$\s*)?([\d.,]+)/i,
      /pagamento\s+m[íi]nimo\s*(?:r\$\s*)?[\d.,]+\s+total\s*(?:r\$\s*)?([\d.,]+)/i
    ];
    
    for (const regex of regexes) {
      const match = text.match(regex);
      if (match) {
        const cleaned = match[1].replace(/\./g, "").replace(",", ".");
        const parsed = parseFloat(cleaned);
        if (!isNaN(parsed) && parsed > 0) {
          return parsed;
        }
      }
    }
    return null;
  }

  async function processPdfFile(file) {
    if (!file) return;

    if (pdfImportUploadZone) pdfImportUploadZone.classList.add("hidden");
    if (pdfImportLoading) pdfImportLoading.classList.remove("hidden");
    if (pdfImportStatusText) pdfImportStatusText.textContent = "Lendo arquivo PDF localmente...";

    try {
      const arrayBuffer = await file.arrayBuffer();
      // Configure worker (disable on file:// to run on main thread)
      if (window.location.protocol === "file:") {
        window.pdfjsLib.GlobalWorkerOptions.workerSrc = "";
      } else {
        window.pdfjsLib.GlobalWorkerOptions.workerSrc = "public/pdf.worker.min.js";
      }
      
      const pdfDoc = await window.pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      let rawText = "";

      for (let i = 1; i <= pdfDoc.numPages; i++) {
        if (pdfImportStatusText) pdfImportStatusText.textContent = `Lendo página ${i} de ${pdfDoc.numPages}...`;
        const page = await pdfDoc.getPage(i);
        const textContent = await page.getTextContent();
        
        // Agrupar elementos por coordenada Y com tolerância de 6px
        const yLines = [];
        textContent.items.forEach(item => {
          if (!item.str || !item.str.trim()) return;
          const x = item.transform ? item.transform[4] : 0;
          const y = item.transform ? item.transform[5] : 0;
          
          let line = yLines.find(l => Math.abs(l.y - y) < 6);
          if (!line) {
            line = { y, items: [] };
            yLines.push(line);
          }
          line.items.push({ x, str: item.str });
        });

        // Ordenar linhas de cima para baixo (Y descendente)
        yLines.sort((a, b) => b.y - a.y);

        // Processar cada linha ordenando da esquerda para a direita (X crescente)
        const pageLines = [];
        yLines.forEach(line => {
          line.items.sort((a, b) => a.x - b.x);
          const lineText = line.items.map(it => it.str).join(" ").replace(/\s+/g, " ").trim();
          if (lineText) {
            pageLines.push(lineText);
          }
        });

        rawText += pageLines.join("\n") + "\n";
      }

      if (!rawText.trim()) {
        throw new Error("O PDF selecionado parece não conter texto legível. PDFs digitalizados ou escaneados (imagens) não são suportados. Certifique-se de usar a fatura digital original em formato PDF fornecida pelo seu banco.");
      }

      // Detectar o total da fatura para validação cruzada posterior
      detectedInvoiceTotal = detectInvoiceTotal(rawText);
      console.log("Detected invoice total:", detectedInvoiceTotal);

      // Limpeza segura: remove linhas que não contêm uma data e um valor ou informação de parcelamento concomitantes (transações de cartão sempre trazem data e valor/parcela)
      const dateRegex = /\b\d{2}\/\d{2}\b|\b\d{2}\s+(?:JAN|FEV|MAR|ABR|MAI|JUN|JUL|AGO|SET|OUT|NOV|DEZ|jan|fev|mar|abr|mai|jun|jul|ago|set|out|nov|dez)\b/i;
      const valueRegex = /\d+[\s.,]+\d{2}\b/i;
      const parcelRegex = /parcela|\b\d+\/\d+\b/i;

      const lines = rawText.split("\n");
      const cleanLines = lines.filter(line => {
        const trimmed = line.trim();
        const hasDate = dateRegex.test(trimmed);
        const hasValue = valueRegex.test(trimmed);
        const hasParcel = parcelRegex.test(trimmed);
        return trimmed && hasDate && (hasValue || hasParcel);
      });
      const cleanedText = cleanLines.join("\n");
      console.log("Linhas filtradas para a LLM:", cleanLines.length, "de", lines.length, "Caracteres:", cleanedText.length);

      if (pdfImportStatusText) pdfImportStatusText.textContent = "Estruturando fatura com Inteligência Artificial...";
      await sendTextToLlm(cleanedText);

    } catch (err) {
      console.error("Erro no processamento do PDF:", err);
      alert(`Erro no processamento do PDF: ${err.message}`);
      resetPdfImportState();
    }
  }

  async function sendTextToLlm(text) {
    const config = getLlmConfig();
    const apiUrl = config.apiUrl;
    const model = config.model;
    const isOnline = window.App.APIClient.isOnline();

    if (!isOnline && (!apiUrl || !model)) {
      throw new Error("Configuração da LLM incompleta. Certifique-se de preencher URL Base e Modelo nas Configurações.");
    }

    if (pdfImportStatusText) {
      pdfImportStatusText.textContent = "Estruturando fatura com Inteligência Artificial...";
    }
    console.log("Enviando texto completo da fatura para a LLM...");

    const parsedExpenses = await sendInvoiceTextToLlm(text);
    extractedExpenses = parsedExpenses;
    renderReviewTable();
  }

  async function sendInvoiceTextToLlm(text) {
    if (!window.App.APIClient.isOnline()) {
      throw new Error("O servidor Go API está offline. Este recurso de IA requer o servidor ativo.");
    }

    const res = await window.App.APIClient.callLLM("importacao", { texto_fatura: text });
    let choiceText = res.content.trim();
    if (choiceText.startsWith("```")) {
      choiceText = choiceText.replace(/^```[a-zA-Z]*\n/, "").replace(/\n```$/, "");
    }
    choiceText = choiceText.trim();
    choiceText = choiceText.replace(/"value"\s*:\s*"?([0-9]+(?:\.[0-9]+)*(?:,[0-9]+)?)"?/g, (match, numStr) => {
      if (numStr.includes(",")) {
        const cleaned = numStr.replace(/\./g, "").replace(",", ".");
        return `"value": ${cleaned}`;
      }
      return `"value": ${numStr}`;
    });

    try {
      const parsed = JSON.parse(choiceText);
      if (!Array.isArray(parsed)) {
        throw new Error("O retorno da LLM não é um array válido.");
      }
      return parsed;
    } catch (jsonErr) {
      console.error("Erro ao parsear JSON da LLM:", choiceText, jsonErr);
      throw new Error("A inteligência artificial não retornou um formato JSON válido. Tente novamente.");
    }
  }

  function updateValidationSummary() {
    if (!pdfImportReviewContainer) return;
    
    let summaryDiv = document.getElementById("pdf-import-validation-summary");
    if (!summaryDiv) {
      summaryDiv = document.createElement("div");
      summaryDiv.id = "pdf-import-validation-summary";
      summaryDiv.className = "mt-4 p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs";
      pdfImportReviewContainer.appendChild(summaryDiv);
    }
    
    let totalSelectedExpenses = 0;
    if (pdfImportTableBody) {
      const rows = pdfImportTableBody.querySelectorAll("tr");
      rows.forEach(row => {
        const cb = row.querySelector('input[type="checkbox"][data-idx]:not([data-field="is_inst"])');
        const valInput = row.querySelector('input[data-field="value"]');
        if (cb && cb.checked && valInput) {
          totalSelectedExpenses += parseFloat(valInput.value) || 0;
        }
      });
    }
    
    const totalExpensesFormatted = totalSelectedExpenses.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
    
    summaryDiv.innerHTML = `
      <div class="flex items-center justify-between text-slate-300 font-semibold">
        <span>Soma das Despesas Selecionadas:</span>
        <span class="text-indigo-400 font-bold text-sm">${totalExpensesFormatted}</span>
      </div>
    `;
  }

  function renderReviewTable() {
    if (pdfImportLoading) pdfImportLoading.classList.add("hidden");
    if (pdfImportReviewContainer) pdfImportReviewContainer.classList.remove("hidden");

    const state = window.App.State.getState();
    const pdfMonthSelect = document.getElementById("pdf-import-month-select");
    const pdfYearSelect = document.getElementById("pdf-import-year-select");
    if (pdfMonthSelect) {
      pdfMonthSelect.value = String(state.mesAtivo <= 12 ? state.mesAtivo : (new Date().getMonth() + 1));
    }
    if (pdfYearSelect) {
      pdfYearSelect.value = String(state.anoAtivo);
    }

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
          updateValidationSummary();
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
        updateValidationSummary();
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
    updateValidationSummary();
  }

  async function askFinancialAgent(userMessage) {
    if (!window.App.APIClient.isOnline()) {
      throw new Error("O servidor Go API está offline. Este recurso de IA requer o servidor ativo.");
    }
    
    const state = window.App.State.getState();
    const activeProfileName = state.perfilAtivo || "Principal";
    const profileExpenses = state.despesas.filter(d => d.perfil === activeProfileName);
    const profileFinancing = state.financiamentos.filter(f => f.perfil === activeProfileName);
    const categoriesList = Object.keys(state.categorias || {}).join(", ");
    
    // Remover propriedade perfil para economizar tokens e usar JSON minificado
    const cleanedExpenses = profileExpenses.map(({ perfil, ...rest }) => rest);
    const cleanedFinancing = profileFinancing.map(({ perfil, ...rest }) => rest);
    
    // Limitar o histórico de chat para evitar estouro de contexto
    const lastHistory = agentChatHistory.slice(-15);
    const formattedHistory = lastHistory.map(h => `${h.role === 'user' ? 'Usuário' : 'Agente'}: ${h.content}`).join("\n");

    const MONTHS = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
    
    const context = {
      perfil: activeProfileName,
      categorias: categoriesList,
      mes_ativo: `${state.mesAtivo <= 12 ? state.mesAtivo : (new Date().getMonth() + 1)} (${MONTHS[(state.mesAtivo <= 12 ? state.mesAtivo : (new Date().getMonth() + 1)) - 1] || ""})`,
      ano_ativo: String(state.anoAtivo),
      despesas: cleanedExpenses,
      financiamentos: cleanedFinancing,
      historico_chat: formattedHistory || "(Sem histórico anterior)",
      pergunta: userMessage
    };

    const res = await window.App.APIClient.callLLM("agente", context);
    let choiceText = res.content.trim().replace(/^```[a-zA-Z]*\n/, "").replace(/\n```$/, "").trim();
    try {
      return JSON.parse(choiceText);
    } catch (e) {
      return { message: choiceText, action: { type: "none" } };
    }
  }
  async function askInvestmentsAnalysis() {
    if (!window.App.APIClient.isOnline()) {
      throw new Error("O servidor Go API está offline. Este recurso de IA requer o servidor ativo.");
    }
    
    const state = window.App.State.getState();
    const activeProfileName = state.perfilAtivo || "Principal";
    const profile = state.perfis.find(p => p.nome === activeProfileName) || { salario: 0 };
    const fgtsVal = profile.fgts || 0;
    
    const investExpenses = state.despesas.filter(d => d.perfil === activeProfileName && d.categoria === "Investimento");
    const totalInvested = investExpenses.reduce((sum, d) => sum + d.valor, 0);
    const combinedTotal = totalInvested + fgtsVal;

    // Calcular Reserva de Emergência Ideal
    const recurrentExpensesSum = state.despesas.filter(d => d.perfil === activeProfileName && d.recorrente === true).reduce((sum, d) => sum + d.valor, 0);
    const financingInstallmentsSum = state.financiamentos.filter(f => f.perfil === activeProfileName).reduce((sum, f) => sum + f.valorParcela, 0);
    const targetReserve = (recurrentExpensesSum + financingInstallmentsSum) * 6;

    // Detalhe dos Investimentos
    const investGrouped = {};
    investExpenses.forEach(d => {
      const sub = d.subcategoria || "Outros";
      investGrouped[sub] = (investGrouped[sub] || 0) + d.valor;
    });
    const detalheInvestimentos = Object.entries(investGrouped)
      .map(([sub, val]) => `- **${sub}:** R$ ${val.toFixed(2)}`)
      .join("\n") || "Nenhum investimento cadastrado.";

    const monthNames = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
    const currentMonthNum = state.mesAtivo <= 12 ? state.mesAtivo : (new Date().getMonth() + 1);
    const nomeMes = monthNames[currentMonthNum - 1];
    const anoAtual = state.anoAtivo || new Date().getFullYear();
    const mesesRestantes = 12 - currentMonthNum;

    const context = {
      perfil: activeProfileName,
      salario: profile.salario.toFixed(2),
      nome_mes: nomeMes,
      ano_atual: String(anoAtual),
      meses_restantes: String(mesesRestantes),
      total_investido: totalInvested.toFixed(2),
      fgts: fgtsVal.toFixed(2),
      total_com_fgts: combinedTotal.toFixed(2),
      reserva_emergencia: targetReserve.toFixed(2),
      detalhe_investimentos: detalheInvestimentos
    };

    const res = await window.App.APIClient.callLLM("analise_investimentos", context);
    if (res.content) {
      return res.content;
    }
    throw new Error("A IA retornou uma resposta vazia.");
  }

  async function askSavingsPlan() {
    if (!window.App.APIClient.isOnline()) {
      throw new Error("O servidor Go API está offline. Este recurso de IA requer o servidor ativo.");
    }
    
    const state = window.App.State.getState();
    const activeProfileName = state.perfilAtivo || "Principal";
    const profile = state.perfis.find(p => p.nome === activeProfileName) || { salario: 0 };

    const plannerMethodSelect = document.getElementById("planner-method-select");
    const plannerMethod = plannerMethodSelect ? (plannerMethodSelect.value || "Equilibrado") : "Equilibrado";
    const limites = (state.planejamento && state.planejamento[plannerMethod]) || {};
    
    const monthSelect = document.getElementById("reports-pizza-month-select");
    const selectedMonth = monthSelect ? parseInt(monthSelect.value) : (state.mesAtivo <= 12 ? state.mesAtivo : (new Date().getMonth() + 1));
    const isAnual = selectedMonth === 0;
    
    const { gastosPorCategoria } = isAnual 
      ? window.App.Engine.calculateAnnualSummary(profile, state.despesas, state.financiamentos, state.anoAtivo)
      : window.App.Engine.calculateMonthlySummary(profile, selectedMonth, state.despesas, state.financiamentos, state.anoAtivo);
      
    const investExpenses = state.despesas.filter(d => d.perfil === activeProfileName && d.categoria === "Investimento");
    const totalInvested = investExpenses.reduce((sum, d) => sum + d.valor, 0);
    
    const recurrentExpensesSum = state.despesas.filter(d => d.perfil === activeProfileName && d.recorrente === true).reduce((sum, d) => sum + d.valor, 0);
    const financingInstallmentsSum = state.financiamentos.filter(f => f.perfil === activeProfileName).reduce((sum, f) => sum + f.valorParcela, 0);
    const targetReserve = (recurrentExpensesSum + financingInstallmentsSum) * 6;
    
    const investGrouped = {};
    investExpenses.forEach(d => {
      const sub = d.subcategoria || "Outros";
      investGrouped[sub] = (investGrouped[sub] || 0) + d.valor;
    });
    const distribuicaoInvestimentos = Object.entries(investGrouped)
      .map(([sub, val]) => `- **${sub}:** R$ ${val.toFixed(2)}`)
      .join("\n") || "Nenhum investimento cadastrado.";

    const activeFin = state.financiamentos.filter(f => {
      if (f.perfil !== activeProfileName) return false;
      if (isAnual) {
        for (let m = 1; m <= 12; m++) {
          const details = window.App.Engine.getFinancingDetailsForMonth(f, m, state.anoAtivo);
          if (details.active) return true;
        }
        return false;
      } else {
        const details = window.App.Engine.getFinancingDetailsForMonth(f, selectedMonth, state.anoAtivo);
        return details.active;
      }
    });

    const detalheFinanciamentos = activeFin
      .map(f => {
        const details = isAnual ? null : window.App.Engine.getFinancingDetailsForMonth(f, selectedMonth, state.anoAtivo);
        const installmentText = isAnual ? "" : (details ? ` (Parcela ${details.index} de ${f.parcelasTotais})` : "");
        return `- **${f.nome}:** R$ ${f.valorParcela.toFixed(2)}/mês${installmentText} (Total: R$ ${f.valorTotal.toFixed(2)})`;
      })
      .join("\n") || "Nenhuma dívida ativa.";
    
    const consolidatedGastos = { ...gastosPorCategoria };
    const finVal = consolidatedGastos["Financiamento"] || 0;
    consolidatedGastos["Moradia"] = (consolidatedGastos["Moradia"] || 0) + finVal;
    consolidatedGastos["Financiamento"] = 0;

    const context = {
      perfil: activeProfileName,
      salario: profile.salario.toFixed(2),
      metodo_planejador: plannerMethod,
      limites_planejador: limites,
      gastos_reais: consolidatedGastos,
      total_investido: totalInvested.toFixed(2),
      reserva_emergencia: targetReserve.toFixed(2),
      distribuicao_investimentos: distribuicaoInvestimentos,
      detalhe_financiamentos: detalheFinanciamentos
    };

    const res = await window.App.APIClient.callLLM("plano_economia", context);
    if (res.content) {
      return res.content;
    }
    throw new Error("A IA retornou uma resposta vazia.");
  }


  
  async function askFinancialAnalysis() {
    if (!window.App.APIClient.isOnline()) {
      throw new Error("O servidor Go API está offline. Este recurso de IA requer o servidor ativo.");
    }
    
    const state = window.App.State.getState();
    const activeProfileName = state.perfilAtivo || "Principal";
    const profile = state.perfis.find(p => p.nome === activeProfileName) || { salario: 0 };
    
    const monthSelect = document.getElementById("reports-pizza-month-select");
    const selectedMonth = monthSelect ? parseInt(monthSelect.value) : (state.mesAtivo <= 12 ? state.mesAtivo : (new Date().getMonth() + 1));
    const isAnual = selectedMonth === 0;
    
    const { gastosPorCategoria } = isAnual 
      ? window.App.Engine.calculateAnnualSummary(profile, state.despesas, state.financiamentos, state.anoAtivo)
      : window.App.Engine.calculateMonthlySummary(profile, selectedMonth, state.despesas, state.financiamentos, state.anoAtivo);
      
    const plannerMethodSelect = document.getElementById("planner-method-select");
    const plannerMethod = plannerMethodSelect ? (plannerMethodSelect.value || "Equilibrado") : "Equilibrado";
    const limites = (state.planejamento && state.planejamento[plannerMethod]) || {};
    
    const activeDespesas = state.despesas.filter(d => {
      if (d.perfil !== activeProfileName) return false;
      if (isAnual) {
        for (let m = 1; m <= 12; m++) {
          const info = window.App.Engine.getInstallmentInfo(d, m, state.anoAtivo);
          if (info && info.active) return true;
        }
        return false;
      } else {
        const info = window.App.Engine.getInstallmentInfo(d, selectedMonth, state.anoAtivo);
        return info && info.active;
      }
    }).map(d => {
      const info = isAnual ? null : window.App.Engine.getInstallmentInfo(d, selectedMonth, state.anoAtivo);
      return {
        descricao: d.descricao,
        categoria: d.categoria,
        subcategoria: d.subcategoria || "",
        valor: isAnual ? d.valor : (info ? info.valorParcela : d.valor),
        parcelas: d.recorrente ? "Recorrente" : (isAnual ? d.parcelas : (info ? `${info.index}/${info.total}` : "1/1")),
        recorrente: d.recorrente
      };
    });

    const activeFinanciamentos = state.financiamentos.filter(f => {
      if (f.perfil !== activeProfileName) return false;
      if (isAnual) {
        for (let m = 1; m <= 12; m++) {
          const details = window.App.Engine.getFinancingDetailsForMonth(f, m, state.anoAtivo);
          if (details.active) return true;
        }
        return false;
      } else {
        const details = window.App.Engine.getFinancingDetailsForMonth(f, selectedMonth, state.anoAtivo);
        return details.active;
      }
    }).map(f => {
      const details = isAnual ? null : window.App.Engine.getFinancingDetailsForMonth(f, selectedMonth, state.anoAtivo);
      return {
        nome: f.nome,
        valorTotal: f.valorTotal,
        valorParcela: f.valorParcela,
        parcelaAtual: isAnual ? "" : (details ? `${details.index}/${f.parcelasTotais}` : ""),
        parcelasTotais: f.parcelasTotais
      };
    });

    const consolidatedGastos = { ...gastosPorCategoria };
    const finVal = consolidatedGastos["Financiamento"] || 0;
    consolidatedGastos["Moradia"] = (consolidatedGastos["Moradia"] || 0) + finVal;
    consolidatedGastos["Financiamento"] = 0;

    const context = {
      perfil: activeProfileName,
      salario: profile.salario.toFixed(2),
      metodo_planejador: plannerMethod,
      limites_planejador: limites,
      gastos_reais: consolidatedGastos,
      detalhe_despesas: activeDespesas,
      detalhe_financiamentos: activeFinanciamentos
    };

    const res = await window.App.APIClient.callLLM("analise", context);
    if (res.content) {
      return res.content;
    }
    throw new Error("A IA retornou uma resposta vazia.");
  }

  async function askAmortizationPlan(financingId) {
    if (!window.App.APIClient.isOnline()) {
      throw new Error("O servidor Go API está offline. Este recurso de IA requer o servidor ativo.");
    }
    
    const state = window.App.State.getState();
    const activeProfileName = state.perfilAtivo || "Principal";
    const profile = state.perfis.find(p => p.nome === activeProfileName) || { salario: 0, fgts: 0 };
    
    const f = state.financiamentos.find(item => item.id === financingId);
    if (!f) throw new Error("Financiamento não encontrado.");

    const fgtsVal = profile.fgts || 0;
    const investExpenses = state.despesas.filter(d => d.perfil === activeProfileName && d.categoria === "Investimento");
    const totalInvested = investExpenses.reduce((sum, d) => sum + d.valor, 0);

    const recurrentExpensesSum = state.despesas.filter(d => d.perfil === activeProfileName && d.recorrente === true).reduce((sum, d) => sum + d.valor, 0);
    const financingInstallmentsSum = state.financiamentos.filter(f => f.perfil === activeProfileName).reduce((sum, f) => sum + f.valorParcela, 0);
    const targetReserve = (recurrentExpensesSum + financingInstallmentsSum) * 6;

    const monthSelect = document.getElementById("reports-pizza-month-select");
    const selectedMonth = monthSelect ? parseInt(monthSelect.value) : (state.mesAtivo <= 12 ? state.mesAtivo : (new Date().getMonth() + 1));
    const isAnual = selectedMonth === 0;
    const { totalGeral } = isAnual 
      ? window.App.Engine.calculateAnnualSummary(profile, state.despesas, state.financiamentos, state.anoAtivo)
      : window.App.Engine.calculateMonthlySummary(profile, selectedMonth, state.despesas, state.financiamentos, state.anoAtivo);
      
    const sobraMensal = profile.salario - totalGeral;

    const investGrouped = {};
    investExpenses.forEach(d => {
      const sub = d.subcategoria || "Outros";
      investGrouped[sub] = (investGrouped[sub] || 0) + d.valor;
    });
    const detalheInvestimentos = Object.entries(investGrouped)
      .map(([sub, val]) => `- **${sub}:** R$ ${val.toFixed(2)}`)
      .join("\n") || "Nenhum investimento cadastrado.";

    const systemText = String(f.sistema || "price").toUpperCase() === "SAC" ? "SAC (Amortizações Constantes)" : "PRICE (Prestações Constantes)";

    const context = {
      nome_financiamento: f.nome,
      valor_total: f.valorTotal.toFixed(2),
      valor_parcela: f.valorParcela.toFixed(2),
      parcelas_totais: String(f.parcelasTotais),
      taxa_tr: f.taxaTR.toFixed(3),
      taxa_juros_anual: (f.taxaJurosAnual || 0).toFixed(2),
      sistema_amortizacao: systemText,
      perfil: activeProfileName,
      salario: profile.salario.toFixed(2),
      total_investido: totalInvested.toFixed(2),
      detalhe_investimentos: detalheInvestimentos,
      fgts: fgtsVal.toFixed(2),
      reserva_emergencia: targetReserve.toFixed(2),
      sobra_mensal: sobraMensal.toFixed(2)
    };

    const res = await window.App.APIClient.callLLM("plano_amortizacao", context);
    if (res.content) {
      return res.content;
    }
    throw new Error("A IA retornou uma resposta vazia.");
  }

  async function askCustomMethod() {
    if (!window.App.APIClient.isOnline()) {
      throw new Error("O servidor Go API está offline. Este recurso de IA requer o servidor ativo.");
    }

    const state = window.App.State.getState();
    const activeProfileName = state.perfilAtivo || "Principal";
    const profile = state.perfis.find(p => p.nome === activeProfileName) || { salario: 0 };

    const categoriasList = Object.keys(state.categorias);
    const categoriasExistentesText = categoriasList.map(cat => `- ${cat}`).join("\n");

    const gastosAcumulados = {};
    categoriasList.forEach(cat => {
      gastosAcumulados[cat] = 0;
    });
    
    const despesasPerfil = state.despesas.filter(d => d.perfil === activeProfileName);
    despesasPerfil.forEach(d => {
      if (gastosAcumulados[d.categoria] !== undefined) {
        gastosAcumulados[d.categoria] += d.valor;
      }
    });

    const detalheGastosText = Object.entries(gastosAcumulados)
      .map(([cat, val]) => `- **${cat}:** R$ ${val.toFixed(2)}`)
      .join("\n");

    const context = {
      categorias_existentes: categoriasExistentesText,
      perfil: activeProfileName,
      salario: profile.salario.toFixed(2),
      detalhe_gastos: detalheGastosText
    };

    const res = await window.App.APIClient.callLLM("metodo_personalizado", context);
    if (res.content) {
      let resultText = res.content.trim();
      if (resultText.startsWith("```")) {
        resultText = resultText.replace(/^```[a-zA-Z0-9]*\n/, "").replace(/\n```$/, "").trim();
      }
      try {
        const parsed = JSON.parse(resultText);
        const resultObj = {};
        let sum = 0;
        categoriasList.forEach(cat => {
          let val = parseFloat(parsed[cat]) || 0;
          if (val < 0) val = 0;
          resultObj[cat] = val;
          sum += val;
        });

        if (sum !== 100 && sum > 0) {
          let currentSum = 0;
          categoriasList.forEach(cat => {
            resultObj[cat] = Math.round((resultObj[cat] / sum) * 100);
            currentSum += resultObj[cat];
          });
          
          let diff = 100 - currentSum;
          if (diff !== 0) {
            const maxCat = categoriasList.reduce((max, cat) => resultObj[cat] > resultObj[max] ? cat : max, categoriasList[0]);
            resultObj[maxCat] += diff;
          }
        } else if (sum === 0) {
          const share = Math.floor(100 / categoriasList.length);
          categoriasList.forEach(cat => {
            resultObj[cat] = share;
          });
          const diff = 100 - (share * categoriasList.length);
          resultObj[categoriasList[0]] += diff;
        }

        return resultObj;
      } catch(e) {
        console.error("Erro ao parsear JSON retornado pelo LLM Proxy:", e);
        throw new Error(`Retorno da LLM não é um JSON válido: ${resultText}`);
      }
    }
    throw new Error("A IA retornou uma resposta vazia.");
  }

  function init() {
    if (btnChatAgent) {
      btnChatAgent.addEventListener("click", () => {
        agentChatModal.classList.remove("hidden");
        agentChatInput.focus();
      });
    }

    if (closeAgentChatModalBtn) {
      closeAgentChatModalBtn.addEventListener("click", () => {
        agentChatModal.classList.add("hidden");
      });
    }

    if (agentChatForm) {
      agentChatForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const msg = agentChatInput.value.trim();
        if (!msg) return;

        appendChatMessage("user", msg);
        agentChatHistory.push({ role: "user", content: msg });
        agentChatInput.value = "";
        agentChatInput.disabled = true;
        agentChatLoader.classList.remove("hidden");

        try {
          const response = await askFinancialAgent(msg);
          appendChatMessage("agent", response.message);
          agentChatHistory.push({ role: "agent", content: response.message });

          if (response.action && response.action.type !== "none") {
            const type = response.action.type;
            const p = response.action.params;
            const state = window.App.State.getState();
            
            if (type === "adicionarDespesa") {
              if (!state.categorias[p.categoria] && p.categoria !== "Investimento") {
                appendChatMessage("system-error", "O Agente não tem permissão para criar categorias inexistentes.");
              } else {
                window.App.State.adicionarDespesa(p.descricao, p.valor, p.categoria, p.mes_inicio, p.parcelas, p.recorrente, p.ano_inicio);
                appendChatMessage("system", `✅ Despesa "${p.descricao}" cadastrada com sucesso!`);
                window.App.UI.render(window.App.State.getState());
              }
            } else if (type === "editarDespesa") {
              let expenseId = p.id;
              let d = state.despesas.find(x => x.id === expenseId);
              if (!d && p.descricao) {
                d = state.despesas.find(x => x.descricao.toLowerCase() === p.descricao.toLowerCase());
              }
              if (d) {
                const desc = p.descricao || d.descricao;
                const val = p.valor !== undefined ? p.valor : d.valor;
                const cat = p.categoria || d.categoria;
                const mes = p.mes_inicio !== undefined ? p.mes_inicio : d.mes_inicio;
                const parc = p.parcelas !== undefined ? p.parcelas : d.parcelas;
                const rec = p.recorrente !== undefined ? p.recorrente : d.recorrente;
                const ano = p.ano_inicio !== undefined ? p.ano_inicio : d.ano_inicio;

                window.App.State.atualizarDespesa(d.id, desc, val, cat, mes, parc, rec, ano);
                appendChatMessage("system", `✅ Despesa "${desc}" atualizada com sucesso!`);
                window.App.UI.render(window.App.State.getState());
              } else {
                appendChatMessage("system-error", `Não encontrei a despesa para editar.`);
              }
            } else if (type === "removerDespesa" || type === "apagarDespesa") {
              let expenseId = p.id;
              let d = state.despesas.find(x => x.id === expenseId);
              if (!d && p.descricao) {
                d = state.despesas.find(x => x.descricao.toLowerCase() === p.descricao.toLowerCase());
              }
              if (d) {
                window.App.State.removerDespesa(d.id);
                appendChatMessage("system", `✅ Despesa "${d.descricao}" removida com sucesso!`);
                window.App.UI.render(window.App.State.getState());
              } else {
                appendChatMessage("system-error", `Não encontrei a despesa para remover.`);
              }
            }
          }
        } catch (err) {
          appendChatMessage("system-error", `Erro: ${err.message}`);
        } finally {
          agentChatInput.disabled = false;
          agentChatLoader.classList.add("hidden");
          agentChatInput.focus();
        }
      });
    }
    
    // ── Bindings para Importação de Fatura PDF ────────────────
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
        if (file) processPdfFile(file);
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
      pdfImportSelectAll.addEventListener("click", () => {
        if (!pdfImportTableBody) return;
        const checkboxes = pdfImportTableBody.querySelectorAll('input[type="checkbox"][data-idx]:not([data-field="is_inst"])');
        const allSelected = Array.from(checkboxes).every(cb => cb.checked);
        checkboxes.forEach(cb => {
          cb.checked = !allSelected;
        });
        pdfImportSelectAll.textContent = allSelected ? "Marcar Todos" : "Desmarcar Todos";
        updateConfirmBtnState();
      });
    }
    if (pdfImportConfirmBtn) {
      pdfImportConfirmBtn.addEventListener("click", () => {
        const checkedBoxes = pdfImportTableBody.querySelectorAll('input[type="checkbox"][data-idx]:not([data-field="is_inst"]):checked');
        if (checkedBoxes.length === 0) return;

        const state = window.App.State.getState();
        const pdfMonthSelect = document.getElementById("pdf-import-month-select");
        const pdfYearSelect = document.getElementById("pdf-import-year-select");

        const activeMonth = pdfMonthSelect ? parseInt(pdfMonthSelect.value) : state.mesAtivo;
        const activeYear = pdfYearSelect ? parseInt(pdfYearSelect.value) : state.anoAtivo;

        if (activeMonth > 12 || activeMonth < 1) {
          alert("Por favor, selecione um mês de Janeiro a Dezembro para realizar os lançamentos.");
          return;
        }

        let importedCount = 0;

        checkedBoxes.forEach(cb => {
          const idx = parseInt(cb.dataset.idx);
          const exp = extractedExpenses[idx];

          const desc = String(exp.description).trim() || "Compra Cartão";
          const instVal = window.App.UIUtils.parseBRLValue(exp.value);
          const total = Math.max(1, parseInt(exp.totalInstallments) || 1);
          const isInst = !!exp.isInstallment || total > 1;
          const current = Math.max(1, parseInt(exp.currentInstallment) || 1);

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
        // Utilitário global showStatus em vez do local
        window.App.UIUtils.showStatus(`Importação concluída: ${importedCount} despesas cadastradas!`);
        window.App.UI.render(window.App.State.getState());
      });
    }
  }

  return { mapElements, init, askInvestmentsAnalysis, askSavingsPlan, askFinancialAnalysis, askAmortizationPlan, askCustomMethod };
})();
