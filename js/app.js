// Ponto de entrada e orquestração do ciclo de vida da aplicação
document.addEventListener("DOMContentLoaded", () => {
  console.log("Inicializando Aplicação Saúde Financeira...");

  // 1. Inicializar os Event Listeners da UI
  window.App.UI.init();

  // 2. Inscrever o Renderizador da UI nas atualizações do Estado Central
  window.App.State.subscribe((state, changedKey) => {
    window.App.UI.render(state, changedKey);
  });

  // 3. Inscrever o Storage Engine nas atualizações do Estado Central (persistência síncrona automática)
  window.App.State.subscribe((state) => {
    window.App.Storage.saveToLocalStorage(state);
  });

  // 4. Carregar os dados persistidos no LocalStorage
  const savedState = window.App.Storage.loadFromLocalStorage();

  if (savedState && Array.isArray(savedState.perfis) && savedState.perfis.length > 0) {
    console.log("Dados carregados com sucesso do LocalStorage.");
    window.App.State.loadState(savedState);
  } else {
    console.log("Nenhum dado prévio encontrado. Inicializando perfil demonstrativo padrão...");
    // Isso vai disparar automaticamente a notificação e renderizar o perfil inicial
    window.App.State.adicionarPerfil("Principal", 3000.00);
  }
});
