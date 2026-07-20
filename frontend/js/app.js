// Ponto de entrada e orquestração do ciclo de vida da aplicação
document.addEventListener("DOMContentLoaded", async () => {
  console.log("Inicializando Aplicação Saúde Financeira...");

  // 1. Inicializar os Event Listeners da UI
  window.App.UI.init();

  // 2. Inscrever o Renderizador da UI nas atualizações do Estado Central
  window.App.State.subscribe((state, changedKey) => {
    window.App.UI.render(state, changedKey);
  });

  // 3. Inscrever o Storage Engine nas atualizações do Estado Central (persistência síncrona automática)
  window.App.State.subscribe(async (state) => {
    window.App.Storage.saveToLocalStorage(state);
    
    // Asynchronously sync with Go API backend if online
    if (window.App.APIClient.isOnline()) {
      try {
        await window.App.APIClient.importState(state);
      } catch (err) {
        console.warn("Falha ao sincronizar com servidor API, dados mantidos localmente:", err);
      }
    }
  });

  // 4. Inicializar API Client
  await window.App.APIClient.init();

  let stateToLoad = null;
  let fromAPI = false;

  const savedState = window.App.Storage.loadFromLocalStorage();
  const hasLocalData = savedState && Array.isArray(savedState.perfis) && savedState.perfis.length > 0;

  if (window.App.APIClient.isOnline()) {
    try {
      console.log("Buscando estado a partir do servidor API Go...");
      const apiState = await window.App.APIClient.fetchState();
      if (apiState && Array.isArray(apiState.perfis) && apiState.perfis.length > 0) {
        stateToLoad = apiState;
        fromAPI = true;
        console.log("Dados hidratados com sucesso a partir do servidor API Go.");
      } else if (hasLocalData) {
        // Server database is empty, but LocalStorage has data -> Show Migration Banner
        showMigrationBanner(savedState);
      }
    } catch (err) {
      console.warn("Falha ao obter estado da API. Usando LocalStorage como contingência:", err);
    }
  }

  if (!stateToLoad) {
    if (hasLocalData) {
      stateToLoad = savedState;
      console.log("Dados carregados com sucesso do LocalStorage.");
    }
  }

  if (stateToLoad) {
    window.App.State.loadState(stateToLoad);
    if (fromAPI) {
      showNotification("Conectado ao servidor Go API. Banco relacional ativo.");
    }
  } else {
    // Only add default profile if no banner is shown (to prevent overwriting while banner is active)
    const banner = document.getElementById("migration-banner");
    if (!banner) {
      console.log("Nenhum dado prévio encontrado. Inicializando perfil demonstrativo padrão...");
      window.App.State.adicionarPerfil("Principal", 3000.00);
    }
  }
});

function showMigrationBanner(localData) {
  // Prevent duplicate banners
  if (document.getElementById("migration-banner")) return;

  const banner = document.createElement("div");
  banner.id = "migration-banner";
  banner.style.backgroundColor = "#1e1b4b";
  banner.style.borderBottom = "2px solid #6366f1";
  banner.style.padding = "12px 24px";
  banner.style.display = "flex";
  banner.style.justifyContent = "space-between";
  banner.style.alignItems = "center";
  banner.style.zIndex = "9999";
  banner.style.position = "relative";
  banner.style.fontFamily = "'Outfit', sans-serif";

  banner.innerHTML = `
    <div style="display: flex; align-items: center; gap: 12px;">
      <span style="font-size: 20px;">📦</span>
      <div>
        <h4 style="margin: 0; color: #ffffff; font-size: 14px; font-weight: bold;">Sincronização com o Servidor Disponível</h4>
        <p style="margin: 0; color: #94a3b8; font-size: 12px;">Detectamos dados locais salvos neste navegador. Deseja enviá-los para o banco de dados seguro do servidor?</p>
      </div>
    </div>
    <div style="display: flex; gap: 8px;">
      <button id="btn-migration-dismiss" style="background-color: transparent; border: 1px solid #475569; color: #94a3b8; padding: 6px 12px; border-radius: 6px; font-size: 12px; cursor: pointer; transition: all 0.2s;">Usar apenas Local</button>
      <button id="btn-migration-confirm" style="background-color: #6366f1; border: none; color: #ffffff; padding: 6px 16px; border-radius: 6px; font-size: 12px; font-weight: bold; cursor: pointer; box-shadow: 0 2px 4px rgba(99, 102, 241, 0.4); transition: all 0.2s;">Sincronizar Agora</button>
    </div>
  `;

  // Prepend to body or layout container
  const mainHeader = document.querySelector("header") || document.body;
  if (mainHeader === document.body) {
    document.body.insertBefore(banner, document.body.firstChild);
  } else {
    mainHeader.parentNode.insertBefore(banner, mainHeader);
  }

  // Hook button events
  const btnDismiss = banner.querySelector("#btn-migration-dismiss");
  const btnConfirm = banner.querySelector("#btn-migration-confirm");

  btnDismiss.addEventListener("click", () => {
    banner.remove();
    window.App.State.loadState(localData);
    showNotification("Carregado dados locais. Operando em modo de contingência local.");
  });

  btnConfirm.addEventListener("click", async () => {
    btnDismiss.disabled = true;
    btnConfirm.disabled = true;
    btnConfirm.textContent = "Sincronizando...";

    try {
      const res = await window.App.APIClient.importState(localData);
      showNotification(`Sincronização concluída! ${res.perfis_migrados} perfis e ${res.despesas_migradas} despesas importadas.`);
      banner.remove();
      
      // Hydrate state from API response or reload state
      const apiState = await window.App.APIClient.fetchState();
      window.App.State.loadState(apiState);
    } catch (err) {
      console.error("Migration failed:", err);
      btnDismiss.disabled = false;
      btnConfirm.disabled = false;
      btnConfirm.textContent = "Sincronizar Agora";
      alert(`Falha ao sincronizar dados com o servidor: ${err.message}`);
    }
  });
}

function showNotification(msg) {
  // Remove existing notification if any
  const existing = document.getElementById("toast-notification");
  if (existing) existing.remove();

  const notif = document.createElement("div");
  notif.id = "toast-notification";
  notif.style.position = "fixed";
  notif.style.bottom = "20px";
  notif.style.right = "20px";
  notif.style.backgroundColor = "#10b981";
  notif.style.color = "#ffffff";
  notif.style.padding = "12px 24px";
  notif.style.borderRadius = "8px";
  notif.style.zIndex = "99999";
  notif.style.boxShadow = "0 4px 6px -1px rgba(0, 0, 0, 0.1)";
  notif.style.fontSize = "14px";
  notif.style.fontWeight = "bold";
  notif.style.fontFamily = "'Outfit', sans-serif";
  notif.textContent = msg;
  
  document.body.appendChild(notif);
  setTimeout(() => notif.remove(), 4000);
}
