// API Client to interact with the Saúde Financeira Go backend
window.App = window.App || {};

window.App.APIClient = (() => {
  let _isOnline = false;

  async function checkHealth() {
    try {
      const response = await fetch("/health");
      if (response.ok) {
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
      const response = await fetch(path, options);
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
    async getPlanejamento() {
      return await _fetch("GET", "/api/v1/planejamento");
    },
    async updatePlanejamento(metodo, limites) {
      return await _fetch("PUT", `/api/v1/planejamento/${metodo}`, { limites });
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
        const response = await fetch(`/api/v1/llm/${endpoint}`, {
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
      return await _fetch("GET", "/api/v1/state");
    },

    // Migração
    async importState(state) {
      return await _fetch("POST", "/api/v1/migration/import-state", state);
    }
  };
})();
