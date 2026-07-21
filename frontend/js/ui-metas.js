// ── Módulo: Metas de Investimento ──────────────────────────────────────────────
window.App = window.App || {};

window.App.UIMetas = (() => {
  let metasContainer, metasKpiTotalInvestido, btnAjustarMetaLlm, ajustarMetaSpinner;
  let metasLlmJustificationCard, metasLlmJustificationText;
  let formNovaMeta, metaNomeInput, metaValorInput;
  let metaPhotoUploadZone, metaPhotoFileInput, metaPhotoUrlInput;
  let metaPhotoPreviewContainer, metaPhotoPreview, btnMetaPhotoClear;
  let metasActiveList, metasPurchasedList;

  let currentPhotoBase64 = "";

  function mapElements(DOM_IDS) {
    const g = id => document.getElementById(id);
    metasContainer            = g(DOM_IDS.METAS_CONTAINER);
    metasKpiTotalInvestido    = g("metas-kpi-total-investido");
    btnAjustarMetaLlm         = g("btn-ajustar-meta-llm");
    ajustarMetaSpinner        = g("ajustar-meta-spinner");
    metasLlmJustificationCard = g("metas-llm-justification-card");
    metasLlmJustificationText = g("metas-llm-justification-text");
    formNovaMeta              = g("form-nova-meta");
    metaNomeInput             = g("meta-nome-input");
    metaValorInput            = g("meta-valor-input");
    metaPhotoUploadZone       = g("meta-photo-upload-zone");
    metaPhotoFileInput        = g("meta-photo-file-input");
    metaPhotoUrlInput         = g("meta-photo-url-input");
    metaPhotoPreviewContainer = g("meta-photo-preview-container");
    metaPhotoPreview          = g("meta-photo-preview");
    btnMetaPhotoClear         = g("btn-meta-photo-clear");
    metasActiveList           = g("metas-active-list");
    metasPurchasedList        = g("metas-purchased-list");
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
      throw new Error(`O prompt enviado excede o limite de tokens de contexto configurado (${estimatedTokens} estimados > ${maxContext} limite).`);
    }

    const maxOutputTokens = Math.max(1024, maxContext - estimatedTokens);
    const finalMaxTokens = Math.min(4096, maxOutputTokens);

    const requestBody = {
      model: config.model,
      messages: [{ role: "user", content: promptText }],
      temperature: 0.1,
      ...extraParams,
      max_tokens: finalMaxTokens
    };

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

  function init() {
    const { formatBRLInput, parseBRLValue, showStatus } = window.App.UIUtils;

    // Mascaramento do valor da meta
    if (metaValorInput) {
      metaValorInput.addEventListener("input", (e) => {
        e.target.value = formatBRLInput(e.target.value);
      });
    }

    // Abertura do upload ao clicar na zona pontilhada
    if (metaPhotoUploadZone && metaPhotoFileInput) {
      metaPhotoUploadZone.addEventListener("click", () => {
        metaPhotoFileInput.click();
      });

      // Drag and drop de arquivo de foto na zona
      metaPhotoUploadZone.addEventListener("dragover", (e) => {
        e.preventDefault();
        metaPhotoUploadZone.classList.add("border-indigo-500", "bg-indigo-950/10");
      });

      metaPhotoUploadZone.addEventListener("dragleave", () => {
        metaPhotoUploadZone.classList.remove("border-indigo-500", "bg-indigo-950/10");
      });

      metaPhotoUploadZone.addEventListener("drop", (e) => {
        e.preventDefault();
        metaPhotoUploadZone.classList.remove("border-indigo-500", "bg-indigo-950/10");
        const file = e.dataTransfer.files[0];
        if (file && file.type.startsWith("image/")) {
          carregarFoto(file);
        } else {
          showStatus("Arquivo inválido. Envie apenas imagens.", true);
        }
      });
    }

    // Upload de arquivo de foto comum
    if (metaPhotoFileInput) {
      metaPhotoFileInput.addEventListener("change", (e) => {
        const file = e.target.files[0];
        if (file) {
          carregarFoto(file);
        }
      });
    }

    // Foto via URL
    if (metaPhotoUrlInput) {
      metaPhotoUrlInput.addEventListener("input", (e) => {
        const url = e.target.value.trim();
        if (url) {
          currentPhotoBase64 = ""; // reseta base64 se inseriu URL
          metaPhotoPreview.src = url;
          metaPhotoPreviewContainer.classList.remove("hidden");
          metaPhotoUploadZone.classList.add("hidden");
        } else {
          resetPhotoInput();
        }
      });
    }

    // Botão de limpar foto
    if (btnMetaPhotoClear) {
      btnMetaPhotoClear.addEventListener("click", () => {
        resetPhotoInput();
      });
    }

    // Formulário de Nova Meta
    if (formNovaMeta) {
      formNovaMeta.addEventListener("submit", (e) => {
        e.preventDefault();
        const nome = metaNomeInput.value.trim();
        const valor = parseBRLValue(metaValorInput.value);
        let foto = currentPhotoBase64 || metaPhotoUrlInput.value.trim();

        if (!nome) {
          showStatus("Digite o nome do produto/viagem.", true);
          return;
        }
        if (isNaN(valor) || valor <= 0) {
          showStatus("Digite um valor válido de meta.", true);
          return;
        }

        try {
          window.App.State.adicionarMeta(nome, valor, foto);
          formNovaMeta.reset();
          resetPhotoInput();
          showStatus("Meta adicionada com sucesso!");
        } catch (err) {
          showStatus(err.message, true);
        }
      });
    }

    // Botão de Ajustar Meta via LLM
    if (btnAjustarMetaLlm) {
      btnAjustarMetaLlm.addEventListener("click", async () => {
        if (!window.App.APIClient.isOnline()) {
          alert("O servidor Go API está offline. Este recurso de IA requer o servidor ativo.");
          return;
        }

        btnAjustarMetaLlm.disabled = true;
        if (ajustarMetaSpinner) ajustarMetaSpinner.classList.remove("hidden");

        try {
          const state = window.App.State.getState();
          const activeProfileName = state.perfilAtivo || "Principal";
          const profile = state.perfis.find(p => p.nome === activeProfileName) || { salario: 0 };
          const activeMetas = state.metas.filter(m => m.perfil === activeProfileName && !m.comprado);
          
          if (activeMetas.length === 0) {
            showStatus("Você não possui metas ativas para ajustar.", true);
            return;
          }

          const totalInvested = _calcularInvestido(state);

          // Agrupar gastos por categoria
          const categoriasList = Object.keys(state.categorias);
          const gastosAcumulados = {};
          categoriasList.forEach(cat => { gastosAcumulados[cat] = 0; });
          const despesasPerfil = state.despesas.filter(d => d.perfil === activeProfileName);
          despesasPerfil.forEach(d => {
            if (gastosAcumulados[d.categoria] !== undefined) {
              gastosAcumulados[d.categoria] += d.valor;
            }
          });
          const detalheGastosText = Object.entries(gastosAcumulados)
            .map(([cat, val]) => `- **${cat}:** R$ ${val.toFixed(2)}`)
            .join("\n");

          // Formatar lista de metas
          const listaMetasText = activeMetas
            .map((m, idx) => `ID: ${m.id} | Prioridade: ${idx + 1} | Nome: ${m.nome} | Valor do Produto: R$ ${m.valor.toFixed(2)} | Target Atual de Desbloqueio: R$ ${m.valorTarget.toFixed(2)}`)
            .join("\n");

          const context = {
            perfil: activeProfileName,
            salario: profile.salario.toFixed(2),
            total_investido: totalInvested.toFixed(2),
            detalhe_gastos: detalheGastosText,
            lista_metas: listaMetasText
          };

          const res = await window.App.APIClient.callLLM("ajustar_meta", context);
          if (res.content) {
            let resultText = res.content.trim();
            if (resultText.startsWith("```")) {
              resultText = resultText.replace(/^```[a-zA-Z0-9]*\n/, "").replace(/\n```$/, "").trim();
            }
            const parsed = JSON.parse(resultText);
            if (Array.isArray(parsed)) {
              window.App.State.atualizarMetasTargetsLlm(parsed);
              const justificativas = parsed.map(p => `• **${obterNomeMeta(state, p.id)}**: ${p.justificativa}`).join("<br>");
              metasLlmJustificationText.innerHTML = justificativas;
              metasLlmJustificationCard.classList.remove("hidden");
              showStatus("Metas reajustadas pelo agente de IA!");
            } else {
              throw new Error("Resposta em formato inválido.");
            }
          } else {
            throw new Error("A IA retornou uma resposta vazia.");
          }
        } catch (err) {
          console.error(err);
          alert(`Falha no ajuste por IA: ${err.message}`);
        } finally {
          btnAjustarMetaLlm.disabled = false;
          if (ajustarMetaSpinner) ajustarMetaSpinner.classList.add("hidden");
        }
      });
    }
  }

  async function carregarFoto(file) {
    if (window.App.APIClient.isOnline()) {
      try {
        if (window.App.UIUtils && window.App.UIUtils.showStatus) {
          window.App.UIUtils.showStatus("Fazendo upload da imagem...", false);
        }
        const uploadedPath = await window.App.APIClient.uploadMetaFoto(file);
        currentPhotoBase64 = uploadedPath;
        metaPhotoPreview.src = uploadedPath;
        metaPhotoPreviewContainer.classList.remove("hidden");
        metaPhotoUploadZone.classList.add("hidden");
        if (metaPhotoUrlInput) metaPhotoUrlInput.value = "";
        if (window.App.UIUtils && window.App.UIUtils.showStatus) {
          window.App.UIUtils.showStatus("Upload concluído com sucesso!");
        }
        return;
      } catch (err) {
        console.error("Falha no upload físico da imagem, usando base64 local:", err);
      }
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      currentPhotoBase64 = e.target.result;
      metaPhotoPreview.src = currentPhotoBase64;
      metaPhotoPreviewContainer.classList.remove("hidden");
      metaPhotoUploadZone.classList.add("hidden");
      if (metaPhotoUrlInput) metaPhotoUrlInput.value = "";
    };
    reader.readAsDataURL(file);
  }

  function resetPhotoInput() {
    currentPhotoBase64 = "";
    if (metaPhotoFileInput) metaPhotoFileInput.value = "";
    if (metaPhotoUrlInput) metaPhotoUrlInput.value = "";
    if (metaPhotoPreview) metaPhotoPreview.src = "";
    if (metaPhotoPreviewContainer) metaPhotoPreviewContainer.classList.add("hidden");
    if (metaPhotoUploadZone) metaPhotoUploadZone.classList.remove("hidden");
  }

  function obterNomeMeta(state, id) {
    const meta = state.metas.find(m => m.id === id);
    return meta ? meta.nome : "Meta desconhecida";
  }

  function _calcularInvestido(state) {
    const activeProfileName = state.perfilAtivo || "Principal";
    const investExpenses = state.despesas.filter(d => d.perfil === activeProfileName && d.categoria === "Investimento");
    return investExpenses.reduce((sum, d) => sum + d.valor, 0);
  }

  function render(state) {
    const { formatCurrency, showStatus } = window.App.UIUtils;
    const activeProfileName = state.perfilAtivo || "Principal";
    
    // 1. Calcular patrimônio investido atual
    const totalInvested = _calcularInvestido(state);
    if (metasKpiTotalInvestido) {
      metasKpiTotalInvestido.textContent = formatCurrency(totalInvested);
    }

    // 2. Filtrar metas do perfil ativo
    const profileMetas = state.metas.filter(m => m.perfil === activeProfileName);
    const activeMetas = profileMetas.filter(m => !m.comprado).sort((a, b) => a.prioridade - b.prioridade);
    const purchasedMetas = profileMetas.filter(m => m.comprado).sort((a, b) => b.prioridade - a.prioridade); // mais recentes primeiro

    // 3. Renderizar metas ativas (Radar de Objetivos)
    if (metasActiveList) {
      metasActiveList.innerHTML = "";
      if (activeMetas.length === 0) {
        metasActiveList.innerHTML = `
          <div class="text-center py-10 text-slate-500 text-xs font-medium border border-dashed border-slate-800 rounded-xl">
            Nenhuma meta cadastrada neste perfil. Use o painel ao lado para cadastrar!
          </div>`;
      } else {
        activeMetas.forEach((meta, idx) => {
          const isEligibleToUnlock = idx === 0; // "só pode ter 1 item desbloqueado por vez"
          const isUnlocked = isEligibleToUnlock && (totalInvested >= meta.valorTarget);

          const card = document.createElement("div");
          card.className = `bg-slate-900/60 border rounded-xl p-4 flex flex-col sm:flex-row items-center sm:items-start gap-4 transition duration-200 cursor-grab active:cursor-grabbing relative select-none ${
            isUnlocked 
              ? "border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.08)] bg-slate-900" 
              : "border-slate-800/80 hover:border-slate-700/60"
          }`;
          card.draggable = true;
          card.dataset.id = meta.id;

          // Imagem
          const imgSrc = meta.foto || "https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=150&auto=format&fit=crop&q=60";

          card.innerHTML = `
            <!-- Drag Handle Icon -->
            <div class="hidden sm:flex items-center self-stretch pr-1 text-slate-600 hover:text-slate-400">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
            </div>
            
            <!-- Imagem -->
            <img class="w-20 h-20 object-cover rounded-lg bg-slate-950 shrink-0 border border-slate-850" src="${imgSrc}" alt="${meta.nome}" draggable="false">
            
            <!-- Detalhes -->
            <div class="flex-1 min-w-0 space-y-2.5 w-full">
              <div class="flex items-start justify-between gap-1.5">
                <div class="space-y-0.5 min-w-0">
                  <h5 class="text-sm font-bold text-slate-200 truncate">${meta.nome}</h5>
                  <p class="text-xs font-semibold text-slate-400">${formatCurrency(meta.valor)}</p>
                </div>
                <div class="shrink-0">
                  ${
                    isUnlocked 
                      ? `<span class="bg-emerald-950/60 text-emerald-450 border border-emerald-900/40 px-2 py-0.5 rounded-lg text-[9px] font-bold uppercase tracking-wider animate-pulse">Desbloqueado</span>`
                      : isEligibleToUnlock 
                        ? `<span class="bg-amber-950/60 text-amber-450 border border-amber-900/40 px-2 py-0.5 rounded-lg text-[9px] font-bold uppercase tracking-wider">Foco Principal</span>`
                        : `<span class="bg-slate-950/60 text-slate-500 border border-slate-850/60 px-2 py-0.5 rounded-lg text-[9px] font-bold uppercase tracking-wider">Bloqueado</span>`
                  }
                </div>
              </div>
              
              <div class="flex items-center text-[10px] text-slate-400 font-medium pt-1">
                <span class="text-sm font-bold text-slate-200">Desbloqueia com: <strong class="text-emerald-400 font-bold font-mono ml-1.5">${formatCurrency(meta.valorTarget)}</strong></span>
              </div>
            </div>
            
            <!-- Ações -->
            <div class="flex sm:flex-col justify-end gap-2 w-full sm:w-auto shrink-0 pt-2 sm:pt-0 border-t border-slate-800/40 sm:border-0">
              ${
                isUnlocked 
                  ? `<button class="btn-comprar w-full sm:w-auto bg-emerald-650 hover:bg-emerald-600 text-white font-semibold py-1.5 px-3 rounded-lg text-xs transition focus:outline-none cursor-pointer" data-id="${meta.id}">Adquirir</button>`
                  : ""
              }
              <button class="btn-excluir w-full sm:w-auto bg-slate-850 hover:bg-slate-800 text-rose-400 hover:text-rose-300 font-semibold py-1.5 px-3 rounded-lg text-xs transition focus:outline-none cursor-pointer" data-id="${meta.id}">Excluir</button>
            </div>
          `;

          // Eventos do Drag & Drop no Card
          card.addEventListener("dragstart", (e) => {
            card.classList.add("opacity-40", "border-indigo-600", "dragging");
            e.dataTransfer.setData("text/plain", meta.id);
            e.dataTransfer.effectAllowed = "move";
          });

          card.addEventListener("dragend", () => {
            card.classList.remove("opacity-40", "border-indigo-600", "dragging");
            removerBordasDeArrastar();
          });

          card.addEventListener("dragover", (e) => {
            e.preventDefault();
            const draggingCard = document.querySelector(".dragging");
            if (draggingCard === card) return;

            const rect = card.getBoundingClientRect();
            const relativeY = e.clientY - rect.top;
            const isUpperHalf = relativeY < (rect.height / 2);

            removerBordasDeArrastar();
            if (isUpperHalf) {
              card.classList.add("border-t-2", "border-t-indigo-500");
            } else {
              card.classList.add("border-b-2", "border-b-indigo-500");
            }
          });

          card.addEventListener("dragleave", () => {
            removerBordasDeArrastar();
          });

          card.addEventListener("drop", (e) => {
            e.preventDefault();
            removerBordasDeArrastar();

            const draggedId = e.dataTransfer.getData("text/plain");
            if (draggedId === meta.id) return;

            const rect = card.getBoundingClientRect();
            const relativeY = e.clientY - rect.top;
            const isUpperHalf = relativeY < (rect.height / 2);

            const activeIds = activeMetas.map(m => m.id);
            const draggedIndex = activeIds.indexOf(draggedId);
            if (draggedIndex !== -1) {
              activeIds.splice(draggedIndex, 1);
            }
            
            let targetIndex = activeIds.indexOf(meta.id);
            if (!isUpperHalf) {
              targetIndex += 1;
            }
            activeIds.splice(targetIndex, 0, draggedId);

            window.App.State.reordenarMetas(activeIds);
            showStatus("Prioridades de metas atualizadas!");
          });

          // Bind dos botões
          const btnComprar = card.querySelector(".btn-comprar");
          if (btnComprar) {
            btnComprar.addEventListener("click", () => {
              try {
                window.App.State.comprarMeta(meta.id);
                showStatus(`Parabéns! Você adquiriu a meta "${meta.nome}"! 🎉`);
              } catch (err) {
                showStatus(err.message, true);
              }
            });
          }

          const btnExcluir = card.querySelector(".btn-excluir");
          if (btnExcluir) {
            btnExcluir.addEventListener("click", () => {
              if (confirm(`Deseja realmente remover a meta "${meta.nome}"?`)) {
                try {
                  window.App.State.removerMeta(meta.id);
                  showStatus("Meta excluída com sucesso.");
                } catch (err) {
                  showStatus(err.message, true);
                }
              }
            });
          }

          metasActiveList.appendChild(card);
        });
      }
    }

    // 4. Renderizar conquistas compradas (Conquistas Adquiridas)
    if (metasPurchasedList) {
      metasPurchasedList.innerHTML = "";
      if (purchasedMetas.length === 0) {
        metasPurchasedList.innerHTML = `
          <div class="col-span-full text-center py-6 text-slate-600 text-xxs font-semibold">
            Nenhum produto adquirido ainda. Desbloqueie sua primeira conquista!
          </div>`;
      } else {
        purchasedMetas.forEach(meta => {
          const card = document.createElement("div");
          card.className = "bg-slate-950/20 border border-slate-900 p-3 rounded-xl flex items-center gap-3 grayscale opacity-65";
          
          const imgSrc = meta.foto || "https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=100&auto=format&fit=crop&q=60";
          
          card.innerHTML = `
            <img class="w-12 h-12 object-cover rounded-lg shrink-0 border border-slate-900" src="${imgSrc}" alt="${meta.nome}">
            <div class="flex-1 min-w-0">
              <h5 class="text-xs font-bold text-slate-400 truncate">${meta.nome}</h5>
              <span class="text-[10px] font-mono text-slate-500 font-bold">${formatCurrency(meta.valor)}</span>
            </div>
            <div class="flex items-center gap-2 shrink-0">
              <div class="flex items-center space-x-1 bg-emerald-950/20 text-emerald-450 border border-emerald-950 px-2 py-0.5 rounded-lg text-[9px] font-bold uppercase tracking-wider">
                <span>✓ Adquirido</span>
              </div>
              <button class="btn-excluir-adquirido p-1 text-slate-500 hover:text-rose-450 transition duration-150 cursor-pointer animate-none" data-id="${meta.id}" title="Excluir conquista">
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
              </button>
            </div>
          `;

          const btnExcluirAdquirido = card.querySelector(".btn-excluir-adquirido");
          if (btnExcluirAdquirido) {
            btnExcluirAdquirido.addEventListener("click", () => {
              if (confirm(`Deseja realmente remover a conquista "${meta.nome}"?`)) {
                try {
                  window.App.State.removerMeta(meta.id);
                  showStatus("Conquista excluída com sucesso.");
                } catch (err) {
                  showStatus(err.message, true);
                }
              }
            });
          }

          metasPurchasedList.appendChild(card);
        });
      }
    }
  }

  function removerBordasDeArrastar() {
    const listItems = metasActiveList.querySelectorAll("[data-id]");
    listItems.forEach(item => {
      item.classList.remove("border-t-2", "border-t-indigo-500", "border-b-2", "border-b-indigo-500");
    });
  }

  return { mapElements, init, render };
})();
