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
    const apiKey = config.apiKey;
    const model = config.model;

    if (!apiUrl || !model) {
      throw new Error("Configuração da LLM incompleta. Certifique-se de preencher URL Base e Modelo nas Configurações.");
    }

    if (pdfImportStatusText) {
      pdfImportStatusText.textContent = "Estruturando fatura com Inteligência Artificial...";
    }
    console.log("Enviando texto completo da fatura para a LLM...");

    const parsedExpenses = await sendInvoiceTextToLlm(text, apiUrl, apiKey, model);
    extractedExpenses = parsedExpenses;
    renderReviewTable();
  }

  async function sendInvoiceTextToLlm(text, apiUrl, apiKey, model) {
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
NÃO escreva nenhuma introdução, explicação ou bloco de raciocínio (como tags <think> ou explicações passo a passo). Não use blocos de código markdown (como \`\`\`json).
Inicie sua resposta IMEDIATAMENTE com o caractere '[' do JSON e termine com ']'. Apenas o JSON válido é permitido.

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

    const config = getLlmConfig();
    const requestBody = prepareLlmRequest(promptText, config);

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
    console.log("LLM response data:", resData);
    let choiceText = resData.choices && resData.choices[0] && resData.choices[0].message && resData.choices[0].message.content;

    if (!choiceText) {
      throw new Error(`A API da LLM retornou uma resposta vazia. (Status: ${response.status}, Resposta: ${JSON.stringify(resData)})`);
    }

    choiceText = choiceText.trim();
    if (choiceText.startsWith("```")) {
      choiceText = choiceText.replace(/^```[a-zA-Z]*\n/, "");
      choiceText = choiceText.replace(/\n```$/, "");
    }
    choiceText = choiceText.trim();

    // Sanitizar números com padrão brasileiro (ex: 4.362,68) no JSON retornado pela LLM sem engolir vírgulas estruturais
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
    const config = getLlmConfig();
    if (!config.apiUrl || !config.model) throw new Error("Configuração da LLM incompleta.");
    
    let promptTemplate = "";
    try {
      const response = await fetch("prompts/agente.md");
      if (response.ok) promptTemplate = await response.text();
      else throw new Error("Erro HTTP");
    } catch (err) {
      promptTemplate = `Você é o Agente Financeiro Inteligente integrado à aplicação Saúde Financeira.
Sua principal função é responder às dúvidas do usuário sobre suas despesas cadastradas e ajudá-lo a cadastrar ou editar despesas.

## Restrições Críticas (Siga Estritamente):
1. **Foco em Gastos/Despesas**: Você só pode responder dúvidas sobre as despesas cadastradas do usuário. Não responda a perguntas não relacionadas aos gastos ou finanças pessoais do usuário. Se o usuário fizer uma pergunta geral (ex: "Qual a capital da França?" ou "Quem descobriu o Brasil?"), responda educadamente dizendo que você é um agente financeiro e só pode ajudar com as despesas e orçamento dele.
2. **Edição e Criação**:
   - Você **PODE** propor a criação de uma nova despesa (\`adicionarDespesa\`) se o usuário solicitar explicitamente (ex: "cadastra mercado de 50 reais").
   - Você **PODE** propor a edição de uma despesa existente (\`editarDespesa\`) se o usuário solicitar explicitamente (ex: "altere o valor da despesa X para 100 reais").
   - Você **NÃO PODE** criar novas categorias. As categorias permitidas estão listadas abaixo. Se o usuário sugerir uma categoria que não existe, mapeie para uma categoria existente (como "Outros" ou a que for mais apropriada) ou solicite que ele escolha uma existente, mas nunca invente ou tente criar uma nova.
   - Você **NÃO PODE** editar as configurações gerais do sistema (como limites do planejador, temas, backups, etc.) ou criar/excluir perfis.
   - Você **NÃO PODE** alterar nenhuma regra de negócio.
3. **Formato da Resposta**:
   Você deve responder ESTRITAMENTE em formato JSON respeitando a seguinte estrutura. Não adicione nenhuma explicação extra fora do JSON e não envolva o JSON em blocos de código markdown (como \`\`\`json). A resposta deve ser um JSON válido cru:
   {
     "message": "Mensagem amigável explicando sua resposta ou confirmação da ação...",
     "action": {
       "type": "adicionarDespesa" | "editarDespesa" | "none",
       "params": {
         // Se for "adicionarDespesa":
         "descricao": "Nome da despesa",
         "valor": 150.00,
         "categoria": "Moradia", // Deve ser uma das categorias permitidas
         "mes_inicio": 7, // Mês de início (1-12)
         "ano_inicio": 2026, // Ano de início
         "parcelas": 1, // Quantidade de parcelas (opcional, default 1)
         "recorrente": false // Se é recorrente (opcional, default false)

         // Se for "editarDespesa":
         "id": "id-da-despesa-a-ser-editada",
         "descricao": "Novo nome", // Opcional, apenas se alterar
         "valor": 200.00, // Opcional, apenas se alterar
         "categoria": "Lazer", // Opcional, apenas se alterar e deve ser uma das permitidas
         "mes_inicio": 7, // Opcional, apenas se alterar
         "ano_inicio": 2026, // Opcional, apenas se alterar
         "parcelas": 1, // Opcional, apenas se alterar
         "recorrente": false // Opcional, apenas se alterar
       }
     }
   }

## Contexto de Negócio do Usuário:
- **Perfil Ativo**: {{PERFIL}}
- **Categorias Permitidas**: {{CATEGORIAS}}
- **Mês Ativo de Referência**: {{MES_ATIVO}}
- **Ano Ativo de Referência**: {{ANO_ATIVO}}

### Lista de Despesas Cadastradas:
{{DESPESAS}}

### Lista de Financiamentos Ativos:
{{FINANCIAMENTOS}}

## Histórico da Conversa:
{{HISTORICO_CHAT}}

## Nova Pergunta do Usuário:
{{PERGUNTA}}
`;
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
    
    let promptText = promptTemplate
      .replace("{{PERFIL}}", activeProfileName)
      .replace("{{CATEGORIAS}}", categoriesList)
      .replace("{{MES_ATIVO}}", `${state.mesAtivo} (${MONTHS[state.mesAtivo - 1] || ""})`)
      .replace("{{ANO_ATIVO}}", String(state.anoAtivo))
      .replace("{{DESPESAS}}", JSON.stringify(cleanedExpenses))
      .replace("{{FINANCIAMENTOS}}", JSON.stringify(cleanedFinancing))
      .replace("{{HISTORICO_CHAT}}", formattedHistory || "(Sem histórico anterior)")
      .replace("{{PERGUNTA}}", userMessage);

    const requestBody = prepareLlmRequest(promptText, config, { temperature: 0.1 });

    const response = await fetch(`${config.apiUrl}/chat/completions`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${config.apiKey}` },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) throw new Error(`Erro: ${await response.text()}`);
    const resData = await response.json();
    let choiceText = resData.choices && resData.choices[0] && resData.choices[0].message && resData.choices[0].message.content;
    
    if (!choiceText) throw new Error("A API retornou vazio.");
    
    choiceText = choiceText.trim().replace(/^```[a-zA-Z]*\n/, "").replace(/\n```$/, "").trim();
    
    try {
      return JSON.parse(choiceText);
    } catch (e) {
      return { message: choiceText, action: { type: "none" } };
    }
  }

  async function askInvestmentsAnalysis() {
    const config = getLlmConfig();
    if (!config.apiUrl || !config.model) throw new Error("Configuração da LLM incompleta.");
    
    let promptTemplate = "";
    try {
      const response = await fetch("prompts/analise_investimentos.md");
      if (response.ok) promptTemplate = await response.text();
      else throw new Error("Erro HTTP");
    } catch (err) {
      promptTemplate = `Você é um consultor financeiro e especialista em alocação de ativos e investimentos.
Analise a carteira de investimentos do usuário abaixo e retorne um diagnóstico objetivo, analítico e bem-humorado.

## Dados Financeiros do Usuário
**Perfil:** {{PERFIL}}
**Renda/Salário Declarado:** R$ {{SALARIO}}

**Total Investido (Excluindo FGTS):** R$ {{TOTAL_INVESTIDO}}
**Saldo no FGTS:** R$ {{FGTS}}
**Patrimônio Total (Investimentos + FGTS):** R$ {{TOTAL_COM_FGTS}}
**Reserva de Emergência Ideal (Alvo Calculado):** R$ {{RESERVA_EMERGENCIA}}

### Alocação por Categoria de Investimento:
{{DETALHE_INVESTIMENTOS}}

---

## Estrutura do Relatório (Gere em Markdown):

### 🎯 Diagnóstico da Alocação
Analise a alocação atual (CDB, Previdência, Ações, Poupança, etc.). Destaque se a alocação está muito concentrada, se o montante total investido em relação à renda mensal faz sentido e qual o nível de risco percebido.

### ⚖️ Oportunidade de Otimização
Faça uma crítica construtiva. Se houver poupança, explique com bom humor por que deixar dinheiro na poupança é um "pecado financeiro". Recomende ajustes práticos de realocação para maximizar os rendimentos.

### 💡 Próximos Aportes
Sugira como o usuário deve distribuir os seus próximos aportes financeiros mensais para equilibrar a carteira.

### 🔮 Previsão de Fechamento Anual
Com base nos aportes recorrentes e o total já investido (levando em conta a média ou os aportes declarados), faça uma projeção do valor total que o usuário deverá ter investido até o fim do ano. Brinque com essa previsão (ex: se o usuário vai poder viajar para as Maldivas ou apenas para a praia mais próxima).

---

## Estilo da Resposta:
- Seja direto, claro e analítico.
- Use humor inteligente e analogias engraçadas para descrever os hábitos de investimento do usuário (ex: comparar deixar muito dinheiro parado a comprar pão seco).
- Não invente informações; baseie-se estritamente nas categorias e montantes reais informados.
`;
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

    let promptText = promptTemplate
      .replace("{{PERFIL}}", activeProfileName)
      .replace("{{SALARIO}}", profile.salario.toFixed(2))
      .replace("{{TOTAL_INVESTIDO}}", totalInvested.toFixed(2))
      .replace("{{FGTS}}", fgtsVal.toFixed(2))
      .replace("{{TOTAL_COM_FGTS}}", combinedTotal.toFixed(2))
      .replace("{{RESERVA_EMERGENCIA}}", targetReserve.toFixed(2))
      .replace("{{DETALHE_INVESTIMENTOS}}", detalheInvestimentos);
      
    const requestBody = prepareLlmRequest(promptText, config, { temperature: 0.3 });

    const response = await fetch(`${config.apiUrl}/chat/completions`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${config.apiKey}` },
      body: JSON.stringify(requestBody)
    });
    
    if (!response.ok) throw new Error(`Erro: ${await response.text()}`);
    const resData = await response.json();
    const resultText = resData.choices?.[0]?.message?.content;
    if (!resultText) throw new Error("Retorno vazio.");
    return resultText;
  }

  async function askSavingsPlan() {
    const config = getLlmConfig();
    if (!config.apiUrl || !config.model) throw new Error("Configuração da LLM incompleta.");
    
    let promptTemplate = "";
    try {
      const response = await fetch("prompts/plano_economia.md");
      if (response.ok) promptTemplate = await response.text();
      else throw new Error("Erro HTTP");
    } catch (err) {
      promptTemplate = `Você é um consultor financeiro especialista em otimização de orçamento e planejamento de economia.
Analise os dados financeiros do usuário abaixo e elabore um plano de economia estratégico, detalhado e prático.

## Dados Financeiros do Usuário

**Perfil:** {{PERFIL}}
**Salário/Renda Mensal:** R$ {{SALARIO}}

**Método Financeiro Selecionado:** {{METODO_PLANEJADOR}}
**Limites de Metas recomendadas:**
{{LIMITES_PLANEJADOR}}

**Gastos Reais por Categoria (Mês Ativo):**
{{GASTOS_REAIS}}

**Investimentos Cadastrados:**
**Total Investido:** R$ {{TOTAL_INVESTIDO}}
**Reserva de Emergência Ideal Alvo:** R$ {{RESERVA_EMERGENCIA}}
**Distribuição por Categoria:**
{{DISTRIBUICAO_INVESTIMENTOS}}

**Financiamentos e Dívidas Ativas:**
{{DETALHE_FINANCIAMENTOS}}

---

## Estrutura do Relatório (Gere em Markdown):

### 🎯 Diagnóstico Orçamentário
Faça um breve resumo (3 a 4 frases) do estado atual do usuário. Aponte se ele está gastando acima da renda, se a proporção de investimentos está saudável e qual o impacto das dívidas no orçamento.

### 🛡️ Onde Cortar Gastos (Plano de Ação)
Identifique as 3 categorias de gastos mais críticas onde o usuário está extrapolando ou que possuem maior potencial de economia imediata. Dê sugestões de ações práticas para reduzir essas despesas.

### 💸 Estratégia de Quitação de Dívidas
Se o usuário tiver financiamentos/dívidas ativos, sugira uma estratégia para amortizá-los mais rapidamente. Se não tiver dívidas, explique como ele pode alocar esse potencial de poupança extra.

### 🚀 Aceleração de Investimentos
Com base no potencial de economia gerado, explique como o usuário pode otimizar a distribuição de seus investimentos atuais. Dê sugestões sobre como diversificar ou aumentar os aportes mensais.

---

## Estilo e Tom:
- Seja extremamente prático, objetivo e realista.
- Use um tom profissional, porém leve e bem-humorado (comentários inteligentes e divertidos sobre o padrão de consumo).
- Não invente dados; baseie-se estritamente nas despesas, investimentos e financiamentos fornecidos.
`;
    }
    
    const state = window.App.State.getState();
    const activeProfileName = state.perfilAtivo || "Principal";
    const profile = state.perfis.find(p => p.nome === activeProfileName) || { salario: 0 };

    const plannerMethod = state.metodoPlanejamento || "Equilibrado";
    const limites = (state.planejamento && state.planejamento[plannerMethod]) || {};
    
    const selectedMonth = state.mesAtivo || new Date().getMonth() + 1;
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

    const detalheFinanciamentos = state.financiamentos.filter(f => f.perfil === activeProfileName)
      .map(f => `- **${f.nome}:** R$ ${f.valorParcela.toFixed(2)}/mês (Total: R$ ${f.valorTotal.toFixed(2)})`)
      .join("\n") || "Nenhuma dívida ativa.";
    
    let promptText = promptTemplate
      .replace("{{PERFIL}}", activeProfileName)
      .replace("{{SALARIO}}", profile.salario.toFixed(2))
      .replace("{{METODO_PLANEJADOR}}", plannerMethod)
      .replace("{{LIMITES_PLANEJADOR}}", JSON.stringify(limites, null, 2))
      .replace("{{GASTOS_REAIS}}", JSON.stringify(gastosPorCategoria, null, 2))
      .replace("{{TOTAL_INVESTIDO}}", totalInvested.toFixed(2))
      .replace("{{RESERVA_EMERGENCIA}}", targetReserve.toFixed(2))
      .replace("{{DISTRIBUICAO_INVESTIMENTOS}}", distribuicaoInvestimentos)
      .replace("{{DETALHE_FINANCIAMENTOS}}", detalheFinanciamentos);
      
    const requestBody = prepareLlmRequest(promptText, config, { temperature: 0.3 });

    const response = await fetch(`${config.apiUrl}/chat/completions`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${config.apiKey}` },
      body: JSON.stringify(requestBody)
    });
    
    if (!response.ok) throw new Error(`Erro: ${await response.text()}`);
    const resData = await response.json();
    const resultText = resData.choices?.[0]?.message?.content;
    if (!resultText) throw new Error("Retorno vazio.");
    return resultText;
  }


  
  async function askFinancialAnalysis() {
    const config = getLlmConfig();
    if (!config.apiUrl || !config.model) throw new Error("Configuração da LLM incompleta.");
    
    let promptTemplate = ``;
    try {
      const response = await fetch("prompts/analise.md");
      if (response.ok) promptTemplate = await response.text();
      else throw new Error("Erro HTTP");
    } catch (err) {
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
- Um baixo gasto com alimentação deve ser visto como algo positivo, pois representa um baixo uso de apps de delivery de comida.
`;
    }
    
    const state = window.App.State.getState();
    const activeProfileName = state.perfilAtivo || "Principal";
    const profile = state.perfis.find(p => p.nome === activeProfileName) || { salario: 0 };
    
    const selectedMonth = state.mesAtivo || new Date().getMonth() + 1;
    const isAnual = selectedMonth === 0;
    
    const { gastosPorCategoria } = isAnual 
      ? window.App.Engine.calculateAnnualSummary(profile, state.despesas, state.financiamentos, state.anoAtivo)
      : window.App.Engine.calculateMonthlySummary(profile, selectedMonth, state.despesas, state.financiamentos, state.anoAtivo);
      
    const plannerMethod = state.metodoPlanejamento || "Equilibrado";
    const limites = (state.planejamento && state.planejamento[plannerMethod]) || {};
    
    let promptText = promptTemplate
      .replace("{{PERFIL}}", activeProfileName)
      .replace("{{SALARIO}}", profile.salario.toFixed(2))
      .replace("{{METODO_PLANEJADOR}}", plannerMethod)
      .replace("{{LIMITES_PLANEJADOR}}", JSON.stringify(limites))
      .replace("{{GASTOS_REAIS}}", JSON.stringify(gastosPorCategoria))
      .replace("{{DETALHE_DESPESAS}}", JSON.stringify(state.despesas.filter(d => d.perfil === activeProfileName)))
      .replace("{{DETALHE_FINANCIAMENTOS}}", JSON.stringify(state.financiamentos));
      
    const requestBody = prepareLlmRequest(promptText, config, { temperature: 0.3 });

    const response = await fetch(`${config.apiUrl}/chat/completions`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${config.apiKey}` },
      body: JSON.stringify(requestBody)
    });
    
    if (!response.ok) throw new Error(`Erro: ${await response.text()}`);
    const resData = await response.json();
    const resultText = resData.choices?.[0]?.message?.content;
    if (!resultText) throw new Error("Retorno vazio.");
    return resultText;
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

  return { mapElements, init, askInvestmentsAnalysis, askSavingsPlan, askFinancialAnalysis };
})();
