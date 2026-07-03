// Namespace global para encapsulamento
window.App = window.App || {};

window.App.State = (() => {
  // Estado privado em memória RAM
  const _state = {
    perfis: [],       // Array de { nome, salario }
    perfilAtivo: null, // String contendo o nome do perfil selecionado
    despesas: [],      // Array de { id, perfil, descricao, valor, categoria, mes_inicio, parcelas }
    mesAtivo: 1,       // Mês ativo selecionado (1 a 14)
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
      "Outros": "#64748b",
      "Investimento": "#eab308"
    },
    theme: "dark",       // Tema padrão dark
    ultimoBackup: null,  // Timestamp do último backup CSV
    llmConfig: {         // Configurações personalizadas da LLM
      apiUrl: "",
      apiKey: "",
      model: ""
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
      return JSON.parse(JSON.stringify(_state));
    },

    // Carregar ou substituir todo o estado (usado na inicialização e imports)
    loadState(newState) {
      if (!newState) return;
      
      _state.perfis = Array.isArray(newState.perfis) ? newState.perfis.map(p => ({
        nome: String(p.nome).trim(),
        salario: parseFloat(p.salario) || 0
      })) : [];
      
      _state.perfilAtivo = newState.perfilAtivo ? String(newState.perfilAtivo).trim() : null;
      
      _state.despesas = Array.isArray(newState.despesas) ? newState.despesas.map(d => ({
        id: d.id || (Date.now().toString(36) + Math.random().toString(36).substr(2, 5)),
        perfil: String(d.perfil).trim(),
        descricao: String(d.descricao).trim(),
        valor: parseFloat(d.valor) || 0,
        categoria: String(d.categoria).trim(),
        mes_inicio: parseInt(d.mes_inicio) || 1,
        ano_inicio: parseInt(d.ano_inicio) || new Date().getFullYear(),
        parcelas: parseInt(d.parcelas) || 1,
        recorrente: !!d.recorrente
      })) : [];

      _state.mesAtivo = newState.mesAtivo ? Math.min(15, Math.max(1, parseInt(newState.mesAtivo) || 1)) : 1;
      _state.anoAtivo = newState.anoAtivo ? parseInt(newState.anoAtivo) || new Date().getFullYear() : new Date().getFullYear();

      _state.financiamentos = Array.isArray(newState.financiamentos) ? newState.financiamentos.map(f => ({
        id: f.id || (Date.now().toString(36) + Math.random().toString(36).substr(2, 5)),
        perfil: String(f.perfil).trim(),
        nome: String(f.nome).trim(),
        valorTotal: parseFloat(f.valorTotal) || 0,
        valorParcela: parseFloat(f.valorParcela) || 0,
        parcelasTotais: parseInt(f.parcelasTotais) || 1,
        taxaTR: parseFloat(f.taxaTR) || 0,
        mes_inicio: parseInt(f.mes_inicio) || 1,
        ano_inicio: parseInt(f.ano_inicio) || new Date().getFullYear()
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
        "Outros": "#64748b",
        "Investimento": "#eab308"
      };

      if (!_state.categorias["Investimento"]) {
        _state.categorias["Investimento"] = "#eab308";
      }

      _state.theme = newState.theme || "dark";
      _state.ultimoBackup = newState.ultimoBackup ? parseInt(newState.ultimoBackup) || null : null;
      _state.llmConfig = newState.llmConfig || { apiUrl: "", apiKey: "", model: "" };


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

      const metodos = ["Conservador", "Equilibrado", "Agressivo"];
      metodos.forEach(metodo => {
        if (!_state.planejamento[metodo]) {
          _state.planejamento[metodo] = {};
        }
        for (const cat in _state.categorias) {
          if (_state.planejamento[metodo][cat] === undefined) {
            _state.planejamento[metodo][cat] = 0;
          }
        }
      });

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
          // Atualizar o salário
          _state.perfis[existingIdx].salario = impPerfil.salario;

          // Limpar despesas e financiamentos anteriores deste perfil
          _state.despesas = _state.despesas.filter(d => d.perfil !== impPerfil.nome);
          _state.financiamentos = _state.financiamentos.filter(f => f.perfil !== impPerfil.nome);
        } else {
          // Criar novo perfil
          _state.perfis.push({
            nome: impPerfil.nome,
            salario: impPerfil.salario
          });
        }

        // Adicionar as novas despesas importadas
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

        // Adicionar os novos financiamentos importados
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
            ano_inicio: f.ano_inicio
          })));
        }
      });

      // Definir o primeiro perfil importado como o perfil ativo
      if (importedData.perfis.length > 0) {
        _state.perfilAtivo = importedData.perfis[0].nome;
      }

      notify();
    },

    // Selecionar o mês ativo
    selecionarMes(mes) {
      const mesInt = parseInt(mes);
      if (isNaN(mesInt) || mesInt < 1 || mesInt > 15) {
        throw new Error("Mês inválido. Deve ser entre 1 e 15.");
      }
      if (_state.mesAtivo !== mesInt) {
        _state.mesAtivo = mesInt;
        notify("calendario");
        return true;
      }
      return false;
    },

    // Selecionar o ano ativo
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

    // Adicionar um novo perfil
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
        nome: nomeFormatado,
        salario: Math.max(0, parseFloat(salario) || 0)
      };

      _state.perfis.push(novoPerfil);
      _state.perfilAtivo = nomeFormatado; // Ativa automaticamente o recém criado
      notify("perfis");
      return novoPerfil;
    },

    // Remover perfil ativo e dependências
    removerPerfil(nome) {
      const index = _state.perfis.findIndex(p => p.nome === nome);
      if (index === -1) {
        throw new Error("Perfil não encontrado.");
      }

      // Remover perfil
      _state.perfis.splice(index, 1);

      // Limpar despesas e financiamentos vinculados
      _state.despesas = _state.despesas.filter(d => d.perfil !== nome);
      _state.financiamentos = _state.financiamentos.filter(f => f.perfil !== nome);

      // Atualizar o perfil ativo
      if (_state.perfilAtivo === nome) {
        _state.perfilAtivo = _state.perfis.length > 0 ? _state.perfis[0].nome : null;
      }

      notify("perfis");
      return true;
    },

    // Atualizar o salário base do perfil ativo
    atualizarSalario(novoSalario) {
      if (!_state.perfilAtivo) {
        throw new Error("Nenhum perfil ativo para atualizar salário.");
      }

      const perfil = _state.perfis.find(p => p.nome === _state.perfilAtivo);
      if (perfil) {
        perfil.salario = Math.max(0, parseFloat(novoSalario) || 0);
        notify("perfis");
        return true;
      }
      return false;
    },

    // Selecionar perfil ativo por nome
    selecionarPerfil(nome) {
      const perfil = _state.perfis.find(p => p.nome === nome);
      if (!perfil) {
        throw new Error("Perfil não encontrado.");
      }
      _state.perfilAtivo = nome;
      notify("perfilAtivo");
      return true;
    },

    // Adicionar gasto à base
    adicionarDespesa(descricao, valor, categoria, mes_inicio, parcelas, recorrente, ano_inicio) {
      if (!_state.perfilAtivo) {
        throw new Error("Não há perfil ativo para lançar a despesa.");
      }

      const descFormatada = String(descricao).trim();
      if (!descFormatada) {
        throw new Error("A descrição da despesa não pode ser vazia.");
      }

      const novoGasto = {
        id: Date.now().toString(36) + Math.random().toString(36).substr(2, 5),
        perfil: _state.perfilAtivo,
        descricao: descFormatada,
        valor: Math.max(0, parseFloat(valor) || 0),
        categoria: String(categoria).trim() || "Outros",
        mes_inicio: Math.min(12, Math.max(1, parseInt(mes_inicio) || 1)),
        ano_inicio: parseInt(ano_inicio) || _state.anoAtivo || new Date().getFullYear(),
        parcelas: Math.max(1, parseInt(parcelas) || 1),
        recorrente: !!recorrente
      };

      _state.despesas.push(novoGasto);
      notify("despesas");
      return novoGasto;
    },

    // Remover despesa por ID
    removerDespesa(id) {
      const index = _state.despesas.findIndex(d => d.id === id);
      if (index === -1) {
        throw new Error("Despesa não encontrada.");
      }

      _state.despesas.splice(index, 1);
      notify("despesas");
      return true;
    },

    // Atualizar despesa por ID
    atualizarDespesa(id, descricao, valor, categoria, mes_inicio, parcelas, recorrente, ano_inicio) {
      const d = _state.despesas.find(item => item.id === id);
      if (!d) {
        throw new Error("Despesa não encontrada.");
      }

      const descFormatada = String(descricao).trim();
      if (!descFormatada) {
        throw new Error("A descrição da despesa não pode ser vazia.");
      }

      d.descricao = descFormatada;
      d.valor = Math.max(0, parseFloat(valor) || 0);
      d.categoria = String(categoria).trim() || "Outros";
      d.mes_inicio = Math.min(12, Math.max(1, parseInt(mes_inicio) || 1));
      d.ano_inicio = parseInt(ano_inicio) || d.ano_inicio || new Date().getFullYear();
      d.parcelas = Math.max(1, parseInt(parcelas) || 1);
      d.recorrente = !!recorrente;

      notify("despesas");
      return d;
    },

    // Adicionar financiamento
    adicionarFinanciamento(nome, valorTotal, valorParcela, parcelasTotais, taxaTR, mesInicio, anoInicio) {
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

      const mesInicioVal = Math.min(12, Math.max(1, parseInt(mesInicio) || 1));
      const anoInicioVal = parseInt(anoInicio) || new Date().getFullYear();

      const novo = {
        id: Date.now().toString(36) + Math.random().toString(36).substr(2, 5),
        perfil: _state.perfilAtivo,
        nome: nomeFormatado,
        valorTotal: parseFloat(valorTotal),
        valorParcela: parseFloat(valorParcela),
        parcelasTotais: parseInt(parcelasTotais),
        taxaTR: parseFloat(taxaTR),
        mes_inicio: mesInicioVal,
        ano_inicio: anoInicioVal
      };

      _state.financiamentos.push(novo);
      notify("financiamentos");
      return novo;
    },

    // Atualizar parcelasTotais e taxaTR do financiamento
    atualizarFinanciamento(id, parcelasTotais, taxaTR) {
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

      f.parcelasTotais = parseInt(parcelasTotais);
      f.taxaTR = parseFloat(taxaTR);

      notify("financiamentos");
      return f;
    },

    // Remover financiamento por ID
    removerFinanciamento(id) {
      const idx = _state.financiamentos.findIndex(f => f.id === id);
      if (idx === -1) {
        throw new Error("Financiamento não encontrado.");
      }

      _state.financiamentos.splice(idx, 1);
      notify("financiamentos");
      return true;
    },

    // Cadastrar uma nova categoria com cor
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
      return true;
    },

    // Alterar a cor de uma categoria existente
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
      return true;
    },

    // Alternar o tema do projeto entre claro e escuro
    toggleTheme() {
      _state.theme = _state.theme === "light" ? "dark" : "light";
      notify("theme");
      return _state.theme;
    },

    // Atualizar limites percentuais do planejador financeiro
    atualizarPlanejamento(metodo, limites) {
      const metodos = ["Conservador", "Equilibrado", "Agressivo"];
      if (!metodos.includes(metodo)) {
        throw new Error("Método de planejamento inválido.");
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

      if (!_state.planejamento[metodo]) {
        _state.planejamento[metodo] = {};
      }

      for (const cat in _state.categorias) {
        const val = Math.max(0, parseFloat(limites[cat]) || 0);
        _state.planejamento[metodo][cat] = val;
      }

      _state.planejamento[metodo]["Investimento"] = (_state.planejamento[metodo]["Investimento"] || 0) + sobra;

      notify("planejamento");
      return true;
    },

    // Atualizar data/hora do último backup em CSV realizado
    atualizarUltimoBackup() {
      _state.ultimoBackup = Date.now();
      notify("ultimoBackup");
      return true;
    },

    // Atualizar configurações da LLM
    atualizarLlmConfig(apiUrl, apiKey, model) {
      _state.llmConfig = {
        apiUrl: String(apiUrl || "").trim(),
        apiKey: String(apiKey || "").trim(),
        model: String(model || "").trim()
      };
      console.log("State: Configuração da LLM atualizada no estado central:", _state.llmConfig);
      notify("llmConfig");
      return true;
    }
  };
})();
