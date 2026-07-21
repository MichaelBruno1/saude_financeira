// Namespace global para encapsulamento
window.App = window.App || {};
window.App.APIClient = window.App.APIClient || { isOnline: () => false };

window.App.State = (() => {
  // Estado privado em memória RAM
  const _state = {
    perfis: [],       // Array de { nome, salario }
    perfilAtivo: null, // String contendo o nome do perfil selecionado
    despesas: [],      // Array de { id, perfil, descricao, valor, categoria, mes_inicio, parcelas }
    metas: [],         // Array de { id, perfil, nome, valor, foto, comprado, prioridade, valorTarget }
    categoriasInvestimento: ["CDB", "Previdência", "Fundos", "Ações", "Poupança", "FGTS", "Outros"],
    mesAtivo: 1,       // Mês ativo selecionado (1 a 17)
    anoAtivo: new Date().getFullYear(), // Ano ativo selecionado
    financiamentos: [], // Array de { id, perfil, nome, valorTotal, valorParcela, parcelasTotais, taxaTR }
    categorias: {       // Objeto de nome -> cor hex
      "Saúde": "#10b981",
      "Alimentação": "#0ea5e9",
      "Moradia": "#6366f1",
      "Cartão de Crédito": "#f59e0b",
      "Lazer": "#f43f5e",
      "Serviços por Assinatura": "#8b5cf6",
      "Serviços": "#14b8a6",
      "Financiamento": "#d946ef",
      "Amortização": "#06b6d4",
      "Outros": "#64748b",
      "Investimento": "#eab308"
    },
    theme: "dark",       // Tema padrão dark
    ultimoBackup: null,  // Timestamp do último backup CSV
    llmConfig: {         // Configurações personalizadas da LLM
      apiUrl: "",
      apiKey: "",
      model: "",
      maxContext: 10240
    },
    planejamento: {
      "Conservador": {
        "Saúde": 8,
        "Alimentação": 18,
        "Moradia": 30,
        "Lazer": 5,
        "Cartão de Crédito": 8,
        "Serviços por Assinatura": 2,
        "Serviços": 9,
        "Investimento": 20,
        "Financiamento": 0,
        "Outros": 0
      },
      "Equilibrado": {
        "Saúde": 7,
        "Alimentação": 18,
        "Moradia": 28,
        "Lazer": 10,
        "Cartão de Crédito": 10,
        "Serviços por Assinatura": 2,
        "Serviços": 10,
        "Investimento": 15,
        "Financiamento": 0,
        "Outros": 0
      },
      "Agressivo": {
        "Saúde": 6,
        "Alimentação": 17,
        "Moradia": 25,
        "Lazer": 7,
        "Cartão de Crédito": 8,
        "Serviços por Assinatura": 2,
        "Serviços": 10,
        "Investimento": 25,
        "Financiamento": 0,
        "Outros": 0
      }
    }
  };

  // Array de callbacks inscritos
  const _listeners = [];

  function _calcularTotalInvestido(perfil) {
    const investExpenses = _state.despesas.filter(d => d.perfil === perfil && d.categoria === "Investimento");
    return investExpenses.reduce((sum, d) => sum + d.valor, 0);
  }

  function _recalcularMetasTargets(perfil) {
    const activeProfile = _state.perfis.find(p => p.nome === perfil);
    if (!activeProfile) return;

    const totalInvested = _calcularTotalInvestido(perfil);
    const activeMetas = _state.metas
      .filter(m => m.perfil === perfil && !m.comprado)
      .sort((a, b) => a.prioridade - b.prioridade);

    if (activeMetas.length === 0) {
      activeProfile.metaBaseline = null;
      return;
    }

    if (activeProfile.metaBaseline === undefined || activeProfile.metaBaseline === null) {
      activeProfile.metaBaseline = totalInvested;
    }

    let currentBaseline = activeProfile.metaBaseline;
    let accumulatedValue = 0;

    activeMetas.forEach(meta => {
      accumulatedValue += meta.valor;
      meta.valorTarget = currentBaseline + accumulatedValue;
    });
  }

  function _getPerfilIDAtivo() {
    const active = _state.perfis.find(p => p.nome === _state.perfilAtivo);
    return active ? active.id : null;
  }

  // Notificar todos os inscritos sobre a mudança de estado
  function notify(changedKey = "all") {
    // Passar uma cópia profunda para garantir imutabilidade fora do estado central
    const stateCopy = JSON.parse(JSON.stringify(_state));
    _listeners.forEach(callback => {
      try {
        callback(stateCopy, changedKey);
      } catch (err) {
        console.error("Erro ao executar listener de estado:", err);
      }
    });
  }

  return {
    // Inscrever-se para escutar as mudanças de estado
    subscribe(callback) {
      if (typeof callback === 'function') {
        _listeners.push(callback);
        // Retorna função para cancelar a inscrição
        return () => {
          const index = _listeners.indexOf(callback);
          if (index !== -1) {
            _listeners.splice(index, 1);
          }
        };
      }
      return null;
    },

    // Obter cópia do estado atual
    getState() {
      const copy = JSON.parse(JSON.stringify(_state));
      const activeProfile = copy.perfilAtivo;
      if (activeProfile && copy.planejamento["Personalizado_" + activeProfile]) {
        copy.planejamento["Personalizado"] = copy.planejamento["Personalizado_" + activeProfile];
      } else {
        delete copy.planejamento["Personalizado"];
      }
      return copy;
    },

    loadState(newState) {
      if (!newState) return;
      
      const unwrapSetting = (val) => {
        if (val && typeof val === "object" && val.hasOwnProperty("value")) {
          return val.value;
        }
        return val;
      };
      
      const profilesMap = {};
      _state.perfis = Array.isArray(newState.perfis) ? newState.perfis.map(p => {
        const mapped = {
          id: p.id,
          nome: String(p.nome).trim(),
          salario: parseFloat(p.salario) || 0,
          fgts: parseFloat(p.fgts) || 0,
          metaBaseline: p.metaBaseline !== undefined && p.metaBaseline !== null ? parseFloat(p.metaBaseline) : (p.meta_baseline !== undefined && p.meta_baseline !== null ? parseFloat(p.meta_baseline) : null)
        };
        if (mapped.id) {
          profilesMap[mapped.id] = mapped.nome;
        }
        return mapped;
      }) : [];
      
      _state.perfilAtivo = newState.perfilAtivo ? String(newState.perfilAtivo).trim() : null;
      if (!_state.perfilAtivo && _state.perfis.length > 0) {
        _state.perfilAtivo = _state.perfis[0].nome;
      }
      
      _state.despesas = Array.isArray(newState.despesas) ? newState.despesas.map(d => ({
        id: d.id || (Date.now().toString(36) + Math.random().toString(36).substr(2, 5)),
        perfil: d.perfil ? String(d.perfil).trim() : (profilesMap[d.perfil_id] || ""),
        descricao: String(d.descricao).trim(),
        valor: parseFloat(d.valor) || 0,
        categoria: String(d.categoria).trim(),
        subcategoria: d.subcategoria ? String(d.subcategoria).trim() : (d.subcategoria_investimento ? String(d.subcategoria_investimento).trim() : ""),
        financiamentoId: d.financiamentoId ? String(d.financiamentoId).trim() : (d.financiamento_id ? String(d.financiamento_id).trim() : ""),
        mes_inicio: parseInt(d.mes_inicio) || 1,
        ano_inicio: parseInt(d.ano_inicio) || new Date().getFullYear(),
        parcelas: parseInt(d.parcelas) || 1,
        recorrente: !!d.recorrente
      })) : [];

      _state.metas = Array.isArray(newState.metas) ? newState.metas.map(m => ({
        id: m.id || (Date.now().toString(36) + Math.random().toString(36).substr(2, 5)),
        perfil: m.perfil ? String(m.perfil).trim() : (profilesMap[m.perfil_id] || ""),
        nome: String(m.nome).trim(),
        valor: parseFloat(m.valor) || 0,
        foto: String(m.foto || "").trim(),
        comprado: !!m.comprado,
        prioridade: parseInt(m.prioridade) || 0,
        valorTarget: parseFloat(m.valorTarget !== undefined ? m.valorTarget : (m.valor_target !== undefined ? m.valor_target : 0))
      })) : [];

      _state.categoriasInvestimento = Array.isArray(newState.categoriasInvestimento)
        ? newState.categoriasInvestimento.map(c => String(c).trim())
        : ["CDB", "Previdência", "Fundos", "Ações", "Poupança", "FGTS", "Outros"];
      if (!_state.categoriasInvestimento.includes("FGTS")) {
        _state.categoriasInvestimento.push("FGTS");
      }

      let loadedMes = newState.mesAtivo ? Math.min(17, Math.max(1, parseInt(newState.mesAtivo) || 1)) : 1;
      if (loadedMes <= 12) { loadedMes = new Date().getMonth() + 1; }
      _state.mesAtivo = loadedMes;
      _state.anoAtivo = newState.anoAtivo ? parseInt(newState.anoAtivo) || new Date().getFullYear() : new Date().getFullYear();

      _state.financiamentos = Array.isArray(newState.financiamentos) ? newState.financiamentos.map(f => ({
        id: f.id || (Date.now().toString(36) + Math.random().toString(36).substr(2, 5)),
        perfil: f.perfil ? String(f.perfil).trim() : (profilesMap[f.perfil_id] || ""),
        nome: String(f.nome).trim(),
        valorTotal: parseFloat(f.valorTotal !== undefined ? f.valorTotal : (f.valor_total !== undefined ? f.valor_total : 0)),
        valorParcela: parseFloat(f.valorParcela !== undefined ? f.valorParcela : (f.valor_parcela !== undefined ? f.valor_parcela : 0)),
        parcelasTotais: parseInt(f.parcelasTotais !== undefined ? f.parcelasTotais : (f.parcelas_totais !== undefined ? f.parcelas_totais : 1)),
        taxaTR: parseFloat(f.taxaTR !== undefined ? f.taxaTR : (f.taxa_tr !== undefined ? f.taxa_tr : 0)),
        mes_inicio: parseInt(f.mes_inicio) || 1,
        ano_inicio: parseInt(f.ano_inicio) || new Date().getFullYear(),
        sistema: String(f.sistema || "price").toLowerCase() === "sac" ? "sac" : "price",
        taxaJurosAnual: parseFloat(f.taxaJurosAnual !== undefined ? f.taxaJurosAnual : (f.taxa_juros_anual !== undefined ? f.taxa_juros_anual : 0))
      })) : [];

      _state.categorias = newState.categorias || {
        "Saúde": "#10b981",
        "Alimentação": "#0ea5e9",
        "Moradia": "#6366f1",
        "Cartão de Crédito": "#f59e0b",
        "Lazer": "#f43f5e",
        "Serviços por Assinatura": "#8b5cf6",
        "Serviços": "#14b8a6",
        "Financiamento": "#d946ef",
        "Amortização": "#06b6d4",
        "Outros": "#64748b",
        "Investimento": "#eab308"
      };

      if (!_state.categorias["Investimento"]) {
        _state.categorias["Investimento"] = "#eab308";
      }

      if (!_state.categorias["Amortização"]) {
        _state.categorias["Amortização"] = "#06b6d4";
      }

      const rawTheme = unwrapSetting(newState.theme);
      _state.theme = typeof rawTheme === "string" ? rawTheme : "dark";

      const rawBackup = unwrapSetting(newState.ultimoBackup);
      _state.ultimoBackup = rawBackup ? parseInt(rawBackup) || null : null;

      const rawLlm = unwrapSetting(newState.llmConfig || newState.llm_config);
      _state.llmConfig = rawLlm || { apiUrl: "", apiKey: "", model: "" };


      _state.planejamento = newState.planejamento || {
        "Conservador": {
          "Saúde": 8,
          "Alimentação": 18,
          "Moradia": 30,
          "Lazer": 5,
          "Cartão de Crédito": 8,
          "Serviços por Assinatura": 2,
          "Serviços": 9,
          "Investimento": 20
        },
        "Equilibrado": {
          "Saúde": 7,
          "Alimentação": 18,
          "Moradia": 28,
          "Lazer": 10,
          "Cartão de Crédito": 10,
          "Serviços por Assinatura": 2,
          "Serviços": 10,
          "Investimento": 15
        },
        "Agressivo": {
          "Saúde": 6,
          "Alimentação": 17,
          "Moradia": 25,
          "Lazer": 7,
          "Cartão de Crédito": 8,
          "Serviços por Assinatura": 2,
          "Serviços": 10,
          "Investimento": 25
        }
      };

      // Map global "Personalizado" (if present) to profile-scoped name
      if (_state.planejamento["Personalizado"] && _state.perfilAtivo) {
        _state.planejamento["Personalizado_" + _state.perfilAtivo] = _state.planejamento["Personalizado"];
        delete _state.planejamento["Personalizado"];
      }

      // Fill all methods in planning with missing category defaults
      for (const metodo in _state.planejamento) {
        for (const cat in _state.categorias) {
          if (_state.planejamento[metodo][cat] === undefined) {
            _state.planejamento[metodo][cat] = 0;
          }
        }
      }

      notify();
    },

    // Importar perfil(is) do CSV de forma incremental (cria se novo, atualiza se existente)
    importarPerfilCSV(importedData) {
      if (!importedData || !Array.isArray(importedData.perfis)) {
        throw new Error("Dados de importação inválidos.");
      }

      importedData.perfis.forEach(impPerfil => {
        const existingIdx = _state.perfis.findIndex(p => p.nome === impPerfil.nome);
        if (existingIdx !== -1) {
          _state.perfis[existingIdx].salario = impPerfil.salario;
          _state.despesas = _state.despesas.filter(d => d.perfil !== impPerfil.nome);
          _state.financiamentos = _state.financiamentos.filter(f => f.perfil !== impPerfil.nome);
        } else {
          _state.perfis.push({
            nome: impPerfil.nome,
            salario: impPerfil.salario,
            fgts: 0,
            metaBaseline: null
          });
        }

        if (Array.isArray(importedData.despesas)) {
          const profileExpenses = importedData.despesas.filter(d => d.perfil === impPerfil.nome);
          _state.despesas.push(...profileExpenses.map(d => ({
            id: d.id || (Date.now().toString(36) + Math.random().toString(36).substr(2, 5)),
            perfil: d.perfil,
            descricao: d.descricao,
            valor: d.valor,
            categoria: d.categoria,
            mes_inicio: d.mes_inicio,
            ano_inicio: d.ano_inicio,
            parcelas: d.parcelas,
            recorrente: d.recorrente
          })));
        }

        if (Array.isArray(importedData.financiamentos)) {
          const profileFinancings = importedData.financiamentos.filter(f => f.perfil === impPerfil.nome);
          _state.financiamentos.push(...profileFinancings.map(f => ({
            id: f.id || (Date.now().toString(36) + Math.random().toString(36).substr(2, 5)),
            perfil: f.perfil,
            nome: f.nome,
            valorTotal: f.valorTotal,
            valorParcela: f.valorParcela,
            parcelasTotais: f.parcelasTotais,
            taxaTR: f.taxaTR,
            mes_inicio: f.mes_inicio,
            ano_inicio: f.ano_inicio,
            sistema: f.sistema || "price",
            taxaJurosAnual: f.taxaJurosAnual || 0
          })));
        }
      });

      if (importedData.perfis.length > 0) {
        _state.perfilAtivo = importedData.perfis[0].nome;
      }

      notify();
    },

    selecionarMes(mes) {
      const mesInt = parseInt(mes);
      if (isNaN(mesInt) || mesInt < 1 || mesInt > 17) {
        throw new Error("Mês inválido. Deve ser entre 1 e 17.");
      }
      if (_state.mesAtivo !== mesInt) {
        _state.mesAtivo = mesInt;
        notify("calendario");
        return true;
      }
      return false;
    },

    adicionarCategoriaInvestimento(nome) {
      const formatado = String(nome).trim();
      if (!formatado) throw new Error("O nome da categoria de investimento não pode ser vazio.");
      if (!_state.categoriasInvestimento) {
        _state.categoriasInvestimento = ["CDB", "Previdência", "Fundos", "Ações", "Poupança", "Outros"];
      }
      if (_state.categoriasInvestimento.some(c => c.toLowerCase() === formatado.toLowerCase())) {
        throw new Error(`A categoria de investimento "${formatado}" já existe.`);
      }
      _state.categoriasInvestimento.push(formatado);
      notify("categoriasInvestimento");

      if (window.App.APIClient.isOnline()) {
        window.App.APIClient.createCategoriaInvestimento({ nome: formatado }).catch(err => {
          console.error("Erro ao criar categoria de investimento no backend:", err);
        });
      }
      return true;
    },

    atualizarFgts(valor) {
      if (!_state.perfilAtivo) {
        throw new Error("Não há perfil ativo para atualizar o FGTS.");
      }
      const ativo = _state.perfis.find(p => p.nome === _state.perfilAtivo);
      if (ativo) {
        ativo.fgts = Math.max(0, parseFloat(valor) || 0);
        notify("perfis");

        if (window.App.APIClient.isOnline() && ativo.id) {
          window.App.APIClient.updateFGTS(ativo.id, ativo.fgts).catch(err => {
            console.error("Erro ao atualizar FGTS no backend:", err);
          });
        }
        return true;
      }
      return false;
    },

    selecionarAno(ano) {
      const anoInt = parseInt(ano);
      if (isNaN(anoInt)) {
        throw new Error("Ano inválido.");
      }
      if (_state.anoAtivo !== anoInt) {
        _state.anoAtivo = anoInt;
        notify("calendario");
        return true;
      }
      return false;
    },

    adicionarPerfil(nome, salario) {
      const nomeFormatado = String(nome).trim();
      if (!nomeFormatado) {
        throw new Error("O nome do perfil não pode ser vazio.");
      }
      
      const perfilExiste = _state.perfis.some(p => p.nome.toLowerCase() === nomeFormatado.toLowerCase());
      if (perfilExiste) {
        throw new Error(`O perfil "${nomeFormatado}" já existe.`);
      }

      const novoPerfil = {
        id: null,
        nome: nomeFormatado,
        salario: Math.max(0, parseFloat(salario) || 0),
        fgts: 0,
        metaBaseline: null
      };

      _state.perfis.push(novoPerfil);
      _state.perfilAtivo = nomeFormatado;
      notify("perfis");

      if (window.App.APIClient.isOnline()) {
        window.App.APIClient.createPerfil({ nome: nomeFormatado, salario: novoPerfil.salario })
          .then(res => {
            novoPerfil.id = res.id;
          })
          .catch(err => {
            console.error("Erro ao criar perfil no backend:", err);
          });
      }
      return novoPerfil;
    },

    removerPerfil(nome) {
      const index = _state.perfis.findIndex(p => p.nome === nome);
      if (index === -1) {
        throw new Error("Perfil não encontrado.");
      }

      const p = _state.perfis[index];
      _state.perfis.splice(index, 1);

      _state.despesas = _state.despesas.filter(d => d.perfil !== nome);
      _state.financiamentos = _state.financiamentos.filter(f => f.perfil !== nome);

      if (_state.perfilAtivo === nome) {
        _state.perfilAtivo = _state.perfis.length > 0 ? _state.perfis[0].nome : null;
      }

      notify("perfis");

      if (window.App.APIClient.isOnline() && p.id) {
        window.App.APIClient.deletePerfil(p.id).catch(err => {
          console.error("Erro ao deletar perfil no backend:", err);
        });
      }
      return true;
    },

    atualizarSalario(novoSalario) {
      if (!_state.perfilAtivo) {
        throw new Error("Nenhum perfil ativo para atualizar salário.");
      }

      const perfil = _state.perfis.find(p => p.nome === _state.perfilAtivo);
      if (perfil) {
        perfil.salario = Math.max(0, parseFloat(novoSalario) || 0);
        notify("perfis");

        if (window.App.APIClient.isOnline() && perfil.id) {
          window.App.APIClient.updateSalario(perfil.id, perfil.salario).catch(err => {
            console.error("Erro ao atualizar salário no backend:", err);
          });
        }
        return true;
      }
      return false;
    },

    selecionarPerfil(nome) {
      const perfil = _state.perfis.find(p => p.nome === nome);
      if (!perfil) {
        throw new Error("Perfil não encontrado.");
      }
      _state.perfilAtivo = nome;
      notify("perfilAtivo");
      return true;
    },

    adicionarDespesa(descricao, valor, categoria, mes_inicio, parcelas, recorrente, ano_inicio, subcategoria, financingId) {
      if (!_state.perfilAtivo) {
        throw new Error("Não há perfil ativo para lançar a despesa.");
      }

      const descFormatada = String(descricao).trim();
      if (!descFormatada) {
        throw new Error("A descrição da despesa não pode ser vazia.");
      }

      const catClean = String(categoria).trim() || "Outros";
      const valorFloat = parseFloat(valor) || 0;

      const novoGasto = {
        id: Date.now().toString(36) + Math.random().toString(36).substr(2, 5),
        perfil: _state.perfilAtivo,
        descricao: descFormatada,
        valor: valorFloat,
        categoria: catClean,
        subcategoria: subcategoria ? String(subcategoria).trim() : "",
        financiamentoId: financingId ? String(financingId).trim() : "",
        mes_inicio: Math.min(12, Math.max(1, parseInt(mes_inicio) || 1)),
        ano_inicio: parseInt(ano_inicio) || _state.anoAtivo || new Date().getFullYear(),
        parcelas: Math.max(1, parseInt(parcelas) || 1),
        recorrente: !!recorrente
      };

      _state.despesas.push(novoGasto);
      
      const isInvest = novoGasto.categoria === "Investimento";
      if (isInvest) {
        _recalcularMetasTargets(novoGasto.perfil);
      }

      notify("despesas");
      if (isInvest) {
        notify("metas");
      }

      const pid = _getPerfilIDAtivo();
      if (window.App.APIClient.isOnline() && pid) {
        const payload = {
          descricao: descFormatada,
          valor: valorFloat,
          categoria: catClean,
          subcategoria_investimento: subcategoria ? String(subcategoria).trim() : null,
          financiamento_id: financingId ? String(financingId).trim() : null,
          mes_inicio: novoGasto.mes_inicio,
          ano_inicio: novoGasto.ano_inicio,
          parcelas: novoGasto.parcelas,
          recorrente: novoGasto.recorrente
        };
        window.App.APIClient.createDespesa(pid, payload)
          .then(res => {
            novoGasto.id = res.id;
          })
          .catch(err => {
            console.error("Erro ao criar despesa no backend:", err);
          });
      }
      return novoGasto;
    },

    removerDespesa(id) {
      const index = _state.despesas.findIndex(d => d.id === id);
      if (index === -1) {
        throw new Error("Despesa não encontrada.");
      }

      const d = _state.despesas[index];
      _state.despesas.splice(index, 1);
      
      const isInvest = d.categoria === "Investimento";
      if (isInvest) {
        _recalcularMetasTargets(d.perfil);
      }

      notify("despesas");
      if (isInvest) {
        notify("metas");
      }

      if (window.App.APIClient.isOnline() && d.id && isNaN(parseInt(d.id))) {
        window.App.APIClient.deleteDespesa(d.id).catch(err => {
          console.error("Erro ao deletar despesa no backend:", err);
        });
      }
      return true;
    },

    atualizarDespesa(id, descricao, valor, categoria, mes_inicio, parcelas, recorrente, ano_inicio, subcategoria, financingId) {
      const d = _state.despesas.find(item => item.id === id);
      if (!d) {
        throw new Error("Despesa não encontrada.");
      }

      const descFormatada = String(descricao).trim();
      if (!descFormatada) {
        throw new Error("A descrição da despesa não pode ser vazia.");
      }

      const catClean = String(categoria).trim() || "Outros";
      const valorFloat = parseFloat(valor) || 0;

      d.descricao = descFormatada;
      d.valor = valorFloat;
      d.categoria = catClean;
      d.subcategoria = subcategoria ? String(subcategoria).trim() : "";
      d.financiamentoId = financingId ? String(financingId).trim() : "";
      d.mes_inicio = Math.min(12, Math.max(1, parseInt(mes_inicio) || 1));
      d.ano_inicio = parseInt(ano_inicio) || _state.anoAtivo || new Date().getFullYear();
      d.parcelas = Math.max(1, parseInt(parcelas) || 1);
      d.recorrente = !!recorrente;

      const isInvest = d.categoria === "Investimento";
      if (isInvest) {
        _recalcularMetasTargets(d.perfil);
      }

      notify("despesas");
      if (isInvest) {
        notify("metas");
      }

      if (window.App.APIClient.isOnline() && d.id && isNaN(parseInt(d.id))) {
        const payload = {
          descricao: descFormatada,
          valor: valorFloat,
          categoria: catClean,
          subcategoria_investimento: d.subcategoria || null,
          financiamento_id: d.financiamentoId || null,
          mes_inicio: d.mes_inicio,
          ano_inicio: d.ano_inicio,
          parcelas: d.parcelas,
          recorrente: d.recorrente
        };
        window.App.APIClient.updateDespesa(d.id, payload).catch(err => {
          console.error("Erro ao atualizar despesa no backend:", err);
        });
      }
      return d;
    },

    adicionarFinanciamento(nome, valorTotal, valorParcela, parcelasTotais, taxaTR, mesInicio, anoInicio, sistema = "price", taxaJurosAnual = 0) {
      if (!_state.perfilAtivo) {
        throw new Error("Crie um perfil antes de adicionar financiamentos.");
      }
      const nomeFormatado = String(nome).trim();
      if (!nomeFormatado) {
        throw new Error("O nome do financiamento não pode ser vazio.");
      }
      if (isNaN(valorTotal) || valorTotal <= 0) {
        throw new Error("O valor total do financiamento deve ser maior que zero.");
      }
      if (isNaN(valorParcela) || valorParcela <= 0) {
        throw new Error("O valor da parcela deve ser maior que zero.");
      }
      if (isNaN(parcelasTotais) || parcelasTotais <= 0) {
        throw new Error("A quantidade de parcelas deve ser maior que zero.");
      }
      if (isNaN(taxaTR) || taxaTR < 0) {
        throw new Error("A taxa T.R. não pode ser negativa.");
      }
      if (isNaN(taxaJurosAnual) || taxaJurosAnual < 0) {
        throw new Error("A taxa de juros anual não pode ser negativa.");
      }

      const mesInicioVal = Math.min(12, Math.max(1, parseInt(mesInicio) || 1));
      const anoInicioVal = parseInt(anoInicio) || new Date().getFullYear();
      const sistemaVal = String(sistema || "price").toLowerCase() === "sac" ? "sac" : "price";

      const novo = {
        id: Date.now().toString(36) + Math.random().toString(36).substr(2, 5),
        perfil: _state.perfilAtivo,
        nome: nomeFormatado,
        valorTotal: parseFloat(valorTotal),
        valorParcela: parseFloat(valorParcela),
        parcelasTotais: parseInt(parcelasTotais),
        taxaTR: parseFloat(taxaTR),
        mes_inicio: mesInicioVal,
        ano_inicio: anoInicioVal,
        sistema: sistemaVal,
        taxaJurosAnual: parseFloat(taxaJurosAnual) || 0
      };

      _state.financiamentos.push(novo);
      notify("financiamentos");

      const pid = _getPerfilIDAtivo();
      if (window.App.APIClient.isOnline() && pid) {
        const payload = {
          nome: novo.nome,
          valorTotal: novo.valorTotal,
          valorParcela: novo.valorParcela,
          parcelasTotais: novo.parcelasTotais,
          taxaTR: novo.taxaTR,
          mes_inicio: novo.mes_inicio,
          ano_inicio: novo.ano_inicio,
          sistema: novo.sistema,
          taxaJurosAnual: novo.taxaJurosAnual
        };
        window.App.APIClient.createFinanciamento(pid, payload)
          .then(res => {
            novo.id = res.id;
          })
          .catch(err => {
            console.error("Erro ao criar financiamento no backend:", err);
          });
      }
      return novo;
    },

    atualizarFinanciamento(id, parcelasTotais, taxaTR, sistema = "price", taxaJurosAnual = 0) {
      const f = _state.financiamentos.find(item => item.id === id);
      if (!f) {
        throw new Error("Financiamento não encontrado.");
      }
      if (isNaN(parcelasTotais) || parcelasTotais <= 0) {
        throw new Error("A quantidade de parcelas deve ser maior que zero.");
      }
      if (isNaN(taxaTR) || taxaTR < 0) {
        throw new Error("A taxa T.R. não pode ser negativa.");
      }
      if (isNaN(taxaJurosAnual) || taxaJurosAnual < 0) {
        throw new Error("A taxa de juros anual não pode ser negativa.");
      }

      f.parcelasTotais = parseInt(parcelasTotais);
      f.taxaTR = parseFloat(taxaTR);
      f.sistema = String(sistema || "price").toLowerCase() === "sac" ? "sac" : "price";
      f.taxaJurosAnual = parseFloat(taxaJurosAnual) || 0;

      notify("financiamentos");

      if (window.App.APIClient.isOnline() && f.id && isNaN(parseInt(f.id))) {
        const payload = {
          nome: f.nome,
          valorTotal: f.valorTotal,
          valorParcela: f.valorParcela,
          parcelasTotais: f.parcelasTotais,
          taxaTR: f.taxaTR,
          mes_inicio: f.mes_inicio,
          ano_inicio: f.ano_inicio,
          sistema: f.sistema,
          taxaJurosAnual: f.taxaJurosAnual
        };
        window.App.APIClient.updateFinanciamento(f.id, payload).catch(err => {
          console.error("Erro ao atualizar financiamento no backend:", err);
        });
      }
      return f;
    },

    removerFinanciamento(id) {
      const idx = _state.financiamentos.findIndex(f => f.id === id);
      if (idx === -1) {
        throw new Error("Financiamento não encontrado.");
      }

      const f = _state.financiamentos[idx];
      _state.financiamentos.splice(idx, 1);
      notify("financiamentos");

      if (window.App.APIClient.isOnline() && f.id && isNaN(parseInt(f.id))) {
        window.App.APIClient.deleteFinanciamento(f.id).catch(err => {
          console.error("Erro ao deletar financiamento no backend:", err);
        });
      }
      return true;
    },

    adicionarCategoria(nome, cor) {
      if (!nome || !nome.trim()) {
        throw new Error("O nome da categoria não pode estar em branco.");
      }
      const nomeLimpo = nome.trim();
      if (_state.categorias[nomeLimpo]) {
        throw new Error("Esta categoria já está cadastrada.");
      }
      const corHex = String(cor || "#64748b").trim();
      if (!/^#[0-9A-F]{6}$/i.test(corHex)) {
        throw new Error("Cor inválida. Use o formato hexadecimal (#RRGGBB).");
      }

      _state.categorias[nomeLimpo] = corHex;
      
      const metodos = ["Conservador", "Equilibrado", "Agressivo"];
      metodos.forEach(m => {
        if (_state.planejamento && _state.planejamento[m]) {
          _state.planejamento[m][nomeLimpo] = 0;
        }
      });

      notify("categorias");

      if (window.App.APIClient.isOnline()) {
        window.App.APIClient.createCategoria({ nome: nomeLimpo, cor: corHex }).catch(err => {
          console.error("Erro ao criar categoria no backend:", err);
        });
      }
      return true;
    },

    atualizarCorCategoria(nome, cor) {
      if (!nome || !_state.categorias[nome]) {
        throw new Error("Categoria não encontrada.");
      }
      const corHex = String(cor || "#64748b").trim();
      if (!/^#[0-9A-F]{6}$/i.test(corHex)) {
        throw new Error("Cor inválida. Use o formato hexadecimal (#RRGGBB).");
      }

      _state.categorias[nome] = corHex;
      notify("categorias");

      if (window.App.APIClient.isOnline()) {
        window.App.APIClient.getCategorias().then(cats => {
          const cat = cats.find(c => c.nome === nome);
          if (cat) {
            window.App.APIClient.updateCorCategoria(cat.id, corHex).catch(err => {
              console.error("Erro ao atualizar cor da categoria no backend:", err);
            });
          }
        });
      }
      return true;
    },

    toggleTheme() {
      _state.theme = _state.theme === "light" ? "dark" : "light";
      notify("theme");

      if (window.App.APIClient.isOnline()) {
        window.App.APIClient.updateSetting("theme", _state.theme).catch(err => {
          console.error("Erro ao salvar tema no backend:", err);
        });
      }
      return _state.theme;
    },

    atualizarPlanejamento(metodo, limites) {
      const metodos = ["Conservador", "Equilibrado", "Agressivo", "Personalizado"];
      if (!metodos.includes(metodo)) {
        throw new Error("Método de planejamento inválido.");
      }

      let targetMetodo = metodo;
      if (metodo === "Personalizado") {
        if (!_state.perfilAtivo) {
          throw new Error("Nenhum perfil ativo para atualizar limites personalizados.");
        }
        targetMetodo = "Personalizado_" + _state.perfilAtivo;
      }

      let total = 0;
      for (const cat in limites) {
        if (cat !== "Investimento") {
          total += Math.max(0, parseFloat(limites[cat]) || 0);
        }
      }
      
      const invVal = Math.max(0, parseFloat(limites["Investimento"]) || 0);
      total += invVal;

      if (total > 100) {
        throw new Error("A soma das porcentagens não pode ultrapassar 100%.");
      }

      const sobra = 100 - total;

      if (!_state.planejamento[targetMetodo]) {
        _state.planejamento[targetMetodo] = {};
      }

      for (const cat in _state.categorias) {
        const val = Math.max(0, parseFloat(limites[cat]) || 0);
        _state.planejamento[targetMetodo][cat] = val;
      }

      _state.planejamento[targetMetodo]["Investimento"] = (_state.planejamento[targetMetodo]["Investimento"] || 0) + sobra;

      notify("planejamento");

      if (window.App.APIClient.isOnline()) {
        window.App.APIClient.updatePlanejamento(targetMetodo, _state.planejamento[targetMetodo]).catch(err => {
          console.error("Erro ao salvar limites no backend:", err);
        });
      }
      return true;
    },

    atualizarUltimoBackup() {
      _state.ultimoBackup = Date.now();
      notify("ultimoBackup");

      if (window.App.APIClient.isOnline()) {
        window.App.APIClient.updateSetting("ultimo_backup", _state.ultimoBackup).catch(err => {
          console.error("Erro ao salvar data do backup no backend:", err);
        });
      }
      return true;
    },

    adicionarMeta(nome, valor, foto) {
      if (!_state.perfilAtivo) {
        throw new Error("Não há perfil ativo para adicionar a meta.");
      }
      const nomeClean = String(nome).trim();
      if (!nomeClean) {
        throw new Error("O nome da meta não pode ser vazio.");
      }
      const valorFloat = parseFloat(valor) || 0;
      if (valorFloat <= 0) {
        throw new Error("O valor da meta deve ser maior que zero.");
      }

      const activeMetas = _state.metas.filter(m => m.perfil === _state.perfilAtivo && !m.comprado);
      const maxPrioridade = activeMetas.reduce((max, m) => Math.max(max, m.prioridade), -1);
      const novaPrioridade = maxPrioridade + 1;

      const novaMeta = {
        id: Date.now().toString(36) + Math.random().toString(36).substr(2, 5),
        perfil: _state.perfilAtivo,
        nome: nomeClean,
        valor: valorFloat,
        foto: String(foto || "").trim(),
        comprado: false,
        prioridade: novaPrioridade,
        valorTarget: 0
      };

      _state.metas.push(novaMeta);
      _recalcularMetasTargets(_state.perfilAtivo);
      notify("metas");

      const pid = _getPerfilIDAtivo();
      if (window.App.APIClient.isOnline() && pid) {
        const payload = {
          nome: novaMeta.nome,
          valor: novaMeta.valor,
          foto: novaMeta.foto || null,
          comprado: novaMeta.comprado
        };
        window.App.APIClient.createMeta(pid, payload)
          .then(res => {
            novaMeta.id = res.id;
            novaMeta.prioridade = res.prioridade;
            novaMeta.valorTarget = res.valor_target;
            notify("metas");
          })
          .catch(err => {
            console.error("Erro ao criar meta no backend:", err);
          });
      }
      return novaMeta;
    },

    removerMeta(id) {
      const index = _state.metas.findIndex(m => m.id === id);
      if (index === -1) {
        throw new Error("Meta não encontrada.");
      }
      const meta = _state.metas[index];
      const perfil = meta.perfil;
      _state.metas.splice(index, 1);

      const activeMetas = _state.metas
        .filter(m => m.perfil === perfil && !m.comprado)
        .sort((a, b) => a.prioridade - b.prioridade);
      activeMetas.forEach((m, idx) => {
        m.prioridade = idx;
      });

      _recalcularMetasTargets(perfil);
      notify("metas");

      if (window.App.APIClient.isOnline() && meta.id && isNaN(parseInt(meta.id))) {
        window.App.APIClient.deleteMeta(meta.id).catch(err => {
          console.error("Erro ao remover meta no backend:", err);
        });
      }
      return true;
    },

    reordenarMetas(idsOrdenados) {
      if (!Array.isArray(idsOrdenados)) return false;
      
      idsOrdenados.forEach((id, index) => {
        const meta = _state.metas.find(m => m.id === id);
        if (meta && meta.perfil === _state.perfilAtivo && !meta.comprado) {
          meta.prioridade = index;
        }
      });

      _recalcularMetasTargets(_state.perfilAtivo);
      notify("metas");

      const pid = _getPerfilIDAtivo();
      if (window.App.APIClient.isOnline() && pid) {
        window.App.APIClient.reorderMetas(pid, idsOrdenados).catch(err => {
          console.error("Erro ao reordenar metas no backend:", err);
        });
      }
      return true;
    },

    comprarMeta(id) {
      const meta = _state.metas.find(m => m.id === id);
      if (!meta) {
        throw new Error("Meta não encontrada.");
      }
      if (meta.comprado) return true;

      meta.comprado = true;
      
      const perfil = meta.perfil;
      const activeProfile = _state.perfis.find(p => p.nome === perfil);
      if (activeProfile) {
        const totalInvested = _calcularTotalInvestido(perfil);
        if (activeProfile.metaBaseline === undefined || activeProfile.metaBaseline === null) {
          activeProfile.metaBaseline = totalInvested;
        }
        activeProfile.metaBaseline += meta.valor;
      }

      _recalcularMetasTargets(perfil);
      notify("metas");

      if (window.App.APIClient.isOnline() && meta.id && isNaN(parseInt(meta.id))) {
        window.App.APIClient.comprarMeta(meta.id).catch(err => {
          console.error("Erro ao comprar meta no backend:", err);
        });
      }
      return true;
    },

    atualizarMetasTargetsLlm(reajustes) {
      if (!Array.isArray(reajustes)) return false;
      reajustes.forEach(r => {
        const meta = _state.metas.find(m => m.id === r.id);
        if (meta) {
          meta.valorTarget = parseFloat(r.valorTarget) || 0;
        }
      });
      notify("metas");

      const pid = _getPerfilIDAtivo();
      if (window.App.APIClient.isOnline() && pid) {
        window.App.APIClient.updateMetaTargets(pid, reajustes.map(r => ({
          id: r.id,
          valorTarget: r.valorTarget
        }))).catch(err => {
          console.error("Erro ao atualizar targets via LLM no backend:", err);
        });
      }
      return true;
    },

    atualizarLlmConfig(apiUrl, apiKey, model, maxContext) {
      _state.llmConfig = {
        apiUrl: String(apiUrl || "").trim(),
        apiKey: String(apiKey || "").trim(),
        model: String(model || "").trim(),
        maxContext: parseInt(maxContext) || 10240
      };
      console.log("State: Configuração da LLM atualizada no estado central:", _state.llmConfig.model);
      notify("llmConfig");

      if (window.App.APIClient.isOnline()) {
        window.App.APIClient.updateSetting("llm_config", _state.llmConfig).catch(err => {
          console.error("Erro ao salvar configuração da LLM no backend:", err);
        });
      }
      return true;
    }
  };
})();
