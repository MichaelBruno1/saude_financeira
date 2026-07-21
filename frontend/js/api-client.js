// API Client to interact with the Saúde Financeira Go backend
window.App = window.App || {};

window.App.APIClient = (() => {
  let _isOnline = false;
  let _apiBaseUrl = "";

  function getApiBaseUrl() {
    const loc = window.location;
    // Se a porta for de desenvolvimento (diferente de 8080 e 8081 e não vazia),
    // resolve dinamicamente para o backend na mesma máquina/IP
    if (loc.port !== "8081" && loc.port !== "8080" && loc.port !== "") {
      return `${loc.protocol}//${loc.hostname}:8081`;
    }
    // Se acessado diretamente via arquivo local (file://)
    if (loc.protocol === "file:") {
      return "http://localhost:8081";
    }
    return "";
  }

  _apiBaseUrl = getApiBaseUrl();

  async function checkHealth() {
    try {
      const response = await fetch(`${_apiBaseUrl}/health`);
      if (response.ok) {
        if (!_apiBaseUrl) {
          const contentType = response.headers.get("Content-Type");
          if (contentType && contentType.includes("text/html")) {
            _isOnline = false;
            return false;
          }
        }
        _isOnline = true;
      } else {
        _isOnline = false;
      }
    } catch (err) {
      _isOnline = false;
    }
    return _isOnline;
  }

  async function _retryWithBackoff(fn, maxRetries = 3) {
    let attempt = 0;
    while (true) {
      try {
        return await fn();
      } catch (err) {
        attempt++;
        if (attempt >= maxRetries || err.message.includes("422") || err.message.includes("409") || err.message.includes("404")) {
          throw err;
        }
        const delay = Math.pow(2, attempt) * 500;
        console.warn(`APIClient: Requisição falhou. Tentando novamente em ${delay}ms (tentativa ${attempt}/${maxRetries}). Erro: ${err.message}`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  async function _fetch(method, path, body = null) {
    const options = {
      method: method,
      headers: {}
    };

    if (body) {
      if (body instanceof FormData) {
        options.body = body;
      } else {
        options.headers["Content-Type"] = "application/json";
        options.body = JSON.stringify(body);
      }
    }

    const fn = async () => {
      const response = await fetch(`${_apiBaseUrl}${path}`, options);
      if (response.status === 204) {
        return null;
      }
      if (response.headers.get("Content-Type")?.includes("text/csv")) {
        return await response.text();
      }
      const res = await response.json();
      if (res.success) {
        return res.data;
      }
      throw new Error(res.error?.message || `HTTP Error ${response.status}`);
    };

    try {
      _updateSyncStatus("saving");
      const result = await _retryWithBackoff(fn);
      _updateSyncStatus("saved");
      return result;
    } catch (err) {
      _updateSyncStatus("error", `Erro: ${err.message}`);
      throw err;
    }
  }

  function _updateSyncStatus(status, message = "") {
    if (window.App.UIUtils && window.App.UIUtils.showStatus) {
      if (status === "saving") {
        window.App.UIUtils.showStatus("Salvando...", false);
      } else if (status === "saved") {
        window.App.UIUtils.showStatus("Salvo ✓", false);
      } else if (status === "error") {
        window.App.UIUtils.showStatus(message || "Erro ao salvar ✗", true);
      }
    }
  }

  return {
    init: async () => {
      await checkHealth();
    },

    isOnline: () => _isOnline,
    
    checkHealth,

    // Perfis
    async getPerfis() {
      return await _fetch("GET", "/api/v1/perfis");
    },
    async createPerfil(data) {
      return await _fetch("POST", "/api/v1/perfis", data);
    },
    async deletePerfil(id) {
      return await _fetch("DELETE", `/api/v1/perfis/${id}`);
    },
    async updateSalario(id, salario) {
      return await _fetch("PUT", `/api/v1/perfis/${id}/salario`, { salario });
    },
    async updateFGTS(id, fgts) {
      return await _fetch("PUT", `/api/v1/perfis/${id}/fgts`, { fgts });
    },

    // Despesas
    async getDespesasByPerfil(perfilId) {
      return await _fetch("GET", `/api/v1/perfis/${perfilId}/despesas`);
    },
    async createDespesa(perfilId, data) {
      return await _fetch("POST", `/api/v1/perfis/${perfilId}/despesas`, data);
    },
    async updateDespesa(id, data) {
      return await _fetch("PUT", `/api/v1/despesas/${id}`, data);
    },
    async deleteDespesa(id) {
      return await _fetch("DELETE", `/api/v1/despesas/${id}`);
    },
    async bulkCreateDespesas(perfilId, data) {
      return await _fetch("POST", `/api/v1/perfis/${perfilId}/despesas/bulk`, data);
    },

    // Financiamentos
    async getFinanciamentosByPerfil(perfilId) {
      return await _fetch("GET", `/api/v1/perfis/${perfilId}/financiamentos`);
    },
    async createFinanciamento(perfilId, data) {
      return await _fetch("POST", `/api/v1/perfis/${perfilId}/financiamentos`, data);
    },
    async updateFinanciamento(id, data) {
      return await _fetch("PUT", `/api/v1/financiamentos/${id}`, data);
    },
    async deleteFinanciamento(id) {
      return await _fetch("DELETE", `/api/v1/financiamentos/${id}`);
    },

    // Metas
    async getMetasByPerfil(perfilId) {
      return await _fetch("GET", `/api/v1/perfis/${perfilId}/metas`);
    },
    async createMeta(perfilId, data) {
      return await _fetch("POST", `/api/v1/perfis/${perfilId}/metas`, data);
    },
    async deleteMeta(id) {
      return await _fetch("DELETE", `/api/v1/metas/${id}`);
    },
    async reorderMetas(perfilId, ids) {
      return await _fetch("POST", `/api/v1/perfis/${perfilId}/metas/reorder`, { ids });
    },
    async comprarMeta(id) {
      return await _fetch("POST", `/api/v1/metas/${id}/comprar`);
    },
    async updateMetaTargets(perfilId, reajustes) {
      return await _fetch("PUT", `/api/v1/perfis/${perfilId}/metas/targets`, { reajustes });
    },

    // Categorias
    async getCategorias() {
      return await _fetch("GET", "/api/v1/categorias");
    },
    async createCategoria(data) {
      return await _fetch("POST", "/api/v1/categorias", data);
    },
    async updateCorCategoria(id, cor) {
      return await _fetch("PUT", `/api/v1/categorias/${id}/cor`, { cor });
    },
    async getCategoriasInvestimento() {
      return await _fetch("GET", "/api/v1/categorias-investimento");
    },
    async createCategoriaInvestimento(data) {
      return await _fetch("POST", "/api/v1/categorias-investimento", data);
    },

    // Planejamento
    async getPlanejamento(perfilId) {
      return await _fetch("GET", `/api/v1/perfis/${perfilId}/planejamento`);
    },
    async updatePlanejamento(perfilId, metodo, limites) {
      return await _fetch("PUT", `/api/v1/perfis/${perfilId}/planejamento/${metodo}`, { limites });
    },

    // Settings
    async getSettings() {
      return await _fetch("GET", "/api/v1/settings");
    },
    async updateSetting(key, value) {
      return await _fetch("PUT", `/api/v1/settings/${key}`, { value });
    },

    // CSV
    async exportCSV(perfilId) {
      return await _fetch("GET", `/api/v1/perfis/${perfilId}/csv/export`);
    },
    async importCSV(file) {
      const formData = new FormData();
      formData.append("file", file);
      return await _fetch("POST", "/api/v1/csv/import", formData);
    },

    // LLM
    async callLLM(endpoint, context, messages = []) {
      const fn = async () => {
        const response = await fetch(`${_apiBaseUrl}/api/v1/llm/${endpoint}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            prompt_name: endpoint,
            context: context,
            messages: messages
          })
        });
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`LLM Error: ${errorText}`);
        }
        const res = await response.json();
        if (res.success && res.data) {
          return res.data;
        }
        throw new Error(res.error?.message || "Empty response from LLM proxy");
      };
      return await _retryWithBackoff(fn, 1);
    },

    // Upload Meta Foto
    async uploadMetaFoto(file) {
      const formData = new FormData();
      formData.append("file", file);
      const res = await _fetch("POST", "/api/v1/uploads/meta-foto", formData);
      return res.path;
    },

    // Estado completo
    async fetchState() {
      const state = await _fetch("GET", "/api/v1/state");
      try {
        if (state && Array.isArray(state.perfis)) {
          state.planejamento = {};
          await Promise.all(state.perfis.map(async (profile) => {
            const plan = await this.getPlanejamento(profile.id);
            if (Array.isArray(plan)) {
              plan.forEach(item => {
                if (item.metodo === "Personalizado") {
                  state.planejamento["Personalizado_" + profile.nome] = item.limites;
                } else {
                  state.planejamento[item.metodo] = item.limites;
                }
              });
            }
          }));
        }
      } catch (err) {
        console.warn("APIClient: falha ao buscar limites do planejador do backend:", err);
      }
      return state;
    },

    // Migração
    async importState(state) {
      return await _fetch("POST", "/api/v1/migration/import-state", state);
    }
  };
})();
