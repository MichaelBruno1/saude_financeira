// API Client to interact with the Salud Financeira Go backend
window.App = window.App || {};

window.App.APIClient = (() => {
  let _isOnline = false;

  async function checkHealth() {
    try {
      const response = await fetch("/health");
      if (response.ok) {
        _isOnline = true;
        console.log("Go API Backend is ONLINE.");
      } else {
        _isOnline = false;
        console.log("Go API Backend is OFFLINE (status check failed).");
      }
    } catch (err) {
      _isOnline = false;
      console.log("Go API Backend is OFFLINE (connection failed).");
    }
    return _isOnline;
  }

  return {
    init: async () => {
      await checkHealth();
    },

    isOnline: () => _isOnline,

    async fetchState() {
      const response = await fetch("/api/v1/state");
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const res = await response.json();
      if (res.success && res.data) {
        return res.data;
      }
      throw new Error(res.error?.message || "Failed to load state from API");
    },

    async importState(state) {
      if (!_isOnline) return null;
      const response = await fetch("/api/v1/migration/import-state", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(state)
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const res = await response.json();
      return res.data;
    },

    async callLLM(endpoint, context, messages = []) {
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
        return res.data; // { content, usage }
      }
      throw new Error(res.error?.message || "Empty response from LLM proxy");
    },

    async uploadMetaFoto(file) {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/v1/uploads/meta-foto", {
        method: "POST",
        body: formData
      });
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Upload Error: ${errorText}`);
      }
      const res = await response.json();
      if (res.success && res.data) {
        return res.data.path;
      }
      throw new Error(res.error?.message || "Failed to upload photo");
    }
  };
})();
