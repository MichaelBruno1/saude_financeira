// ── Módulo: Inteligência Artificial (Agent & PDF) ─────────────────────────────
window.App = window.App || {};

window.App.UIAgent = (() => {
  let agentChatHistory = [];
  let extractedExpenses = [];
  
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
      model: String(stateConfig.model || staticConfig.model || "").trim()
    };
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
    
    const formattedHistory = agentChatHistory.map(h => `${h.role === 'user' ? 'Usuário' : 'Agente'}: ${h.content}`).join("\n");

    const MONTHS = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
    
    let promptText = promptTemplate
      .replace("{{PERFIL}}", activeProfileName)
      .replace("{{CATEGORIAS}}", categoriesList)
      .replace("{{MES_ATIVO}}", `${state.mesAtivo} (${MONTHS[state.mesAtivo - 1] || ""})`)
      .replace("{{ANO_ATIVO}}", String(state.anoAtivo))
      .replace("{{DESPESAS}}", JSON.stringify(profileExpenses, null, 2))
      .replace("{{FINANCIAMENTOS}}", JSON.stringify(profileFinancing, null, 2))
      .replace("{{HISTORICO_CHAT}}", formattedHistory || "(Sem histórico anterior)")
      .replace("{{PERGUNTA}}", userMessage);

    const response = await fetch(`${config.apiUrl}/chat/completions`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${config.apiKey}` },
      body: JSON.stringify({ model: config.model, messages: [{ role: "user", content: promptText }], temperature: 0.1 })
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

    let promptText = promptTemplate
      .replace("{{PERFIL}}", activeProfileName)
      .replace("{{SALARIO}}", profile.salario.toFixed(2))
      .replace("{{TOTAL_INVESTIDO}}", totalInvested.toFixed(2))
      .replace("{{FGTS}}", fgtsVal.toFixed(2))
      .replace("{{TOTAL_COM_FGTS}}", combinedTotal.toFixed(2));
      
    const response = await fetch(`${config.apiUrl}/chat/completions`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${config.apiKey}` },
      body: JSON.stringify({ model: config.model, messages: [{ role: "user", content: promptText }], temperature: 0.3 })
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
    
    let promptText = promptTemplate
      .replace("{{PERFIL}}", activeProfileName)
      .replace("{{SALARIO}}", profile.salario.toFixed(2));
      
    const response = await fetch(`${config.apiUrl}/chat/completions`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${config.apiKey}` },
      body: JSON.stringify({ model: config.model, messages: [{ role: "user", content: promptText }], temperature: 0.3 })
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
      
    const response = await fetch(`${config.apiUrl}/chat/completions`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${config.apiKey}` },
      body: JSON.stringify({ model: config.model, messages: [{ role: "user", content: promptText }], temperature: 0.3 })
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
    
    // PDF IMPORT BINDINGS CAN BE ADDED HERE IF NEEDED. (They also call PDF logic).
  }

  return { mapElements, init, askInvestmentsAnalysis, askSavingsPlan, askFinancialAnalysis };
})();
