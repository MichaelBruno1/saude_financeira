// ── Módulo: Despesas ──────────────────────────────────────────────────────────
// Responsável pelo modal de despesas, tabela mensal de gastos e edição inline.
window.App = window.App || {};

window.App.UIExpenses = (() => {
  // Referências locais aos elementos DOM deste módulo
  let expenseModal, closeExpenseModalBtn, modalExpenseCancelBtn;
  let modalExpenseCreateForm, modalExpenseDesc, modalExpenseVal;
  let modalExpenseMonth, modalExpenseYear, modalExpenseCat;
  let modalExpenseInstallmentsContainer, modalExpenseInstallments;
  let modalExpenseInvestmentContainer, modalExpenseInvestmentCat;
  let addExpenseBtn, financingModal, financingNameInput;
  let financingTotalValInput, financingInstallmentValInput;
  let financingRegisterForm;

  function mapElements(DOM_IDS) {
    const g = id => document.getElementById(id);
    const s = window.App.UIState;
    expenseModal                    = g(DOM_IDS.EXPENSE_MODAL);
    closeExpenseModalBtn            = g(DOM_IDS.CLOSE_EXPENSE_MODAL_BTN);
    modalExpenseCancelBtn           = g(DOM_IDS.MODAL_EXPENSE_CANCEL_BTN);
    modalExpenseCreateForm          = g(DOM_IDS.MODAL_EXPENSE_CREATE_FORM);
    modalExpenseDesc                = g(DOM_IDS.MODAL_EXPENSE_DESC);
    modalExpenseVal                 = g(DOM_IDS.MODAL_EXPENSE_VAL);
    modalExpenseMonth               = g(DOM_IDS.MODAL_EXPENSE_MONTH);
    modalExpenseYear                = g(DOM_IDS.MODAL_EXPENSE_YEAR);
    modalExpenseCat                 = g(DOM_IDS.MODAL_EXPENSE_CAT);
    modalExpenseInstallmentsContainer = g(DOM_IDS.MODAL_EXPENSE_INSTALLMENTS_CONTAINER);
    modalExpenseInstallments        = g(DOM_IDS.MODAL_EXPENSE_INSTALLMENTS);
    modalExpenseInvestmentContainer = g(DOM_IDS.MODAL_EXPENSE_INVESTMENT_CONTAINER);
    modalExpenseInvestmentCat       = g(DOM_IDS.MODAL_EXPENSE_INVESTMENT_CAT);
    addExpenseBtn                   = s.addExpenseBtn;
    financingModal                  = g(DOM_IDS.FINANCING_MODAL);
    financingNameInput              = g(DOM_IDS.FINANCING_NAME);
    financingTotalValInput          = g(DOM_IDS.FINANCING_TOTAL_VAL);
    financingInstallmentValInput    = g(DOM_IDS.FINANCING_INSTALLMENT_VAL);
    financingRegisterForm           = g(DOM_IDS.FINANCING_REGISTER_FORM);

    // Expõe referências usadas por outros módulos
    s.expenseModal                    = expenseModal;
    s.modalExpenseCreateForm          = modalExpenseCreateForm;
    s.modalExpenseDesc                = modalExpenseDesc;
    s.modalExpenseVal                 = modalExpenseVal;
    s.modalExpenseCat                 = modalExpenseCat;
    s.modalExpenseMonth               = modalExpenseMonth;
    s.modalExpenseYear                = modalExpenseYear;
    s.modalExpenseInstallments        = modalExpenseInstallments;
    s.modalExpenseInstallmentsContainer = modalExpenseInstallmentsContainer;
    s.modalExpenseInvestmentContainer = modalExpenseInvestmentContainer;
    s.modalExpenseInvestmentCat       = modalExpenseInvestmentCat;
  }

  function renderInvestmentCategoriesDropdown() {
    if (!modalExpenseInvestmentCat) return;
    modalExpenseInvestmentCat.innerHTML = "";
    const state = window.App.State.getState();
    const list = state.categoriasInvestimento || ["CDB", "Previdência", "Fundos", "Ações", "Poupança", "Outros"];
    list.forEach(c => {
      const opt = document.createElement("option");
      opt.value = c; opt.textContent = c;
      modalExpenseInvestmentCat.appendChild(opt);
    });
  }

  function hideExpenseModal() {
    const s = window.App.UIState;
    const DOM_IDS = window.App.UI_DOM_IDS;
    expenseModal.classList.add("hidden");
    modalExpenseCreateForm.reset();
    modalExpenseInstallmentsContainer.classList.add("hidden");
    modalExpenseInstallments.value = "1";
    const recurrentInput = document.getElementById(DOM_IDS.MODAL_EXPENSE_RECURRENT);
    if (recurrentInput) recurrentInput.value = "nao";
    s.editingExpenseId = null;
  }

  function init() {
    const { formatBRLInput, parseBRLValue, showStatus } = window.App.UIUtils;
    const DOM_IDS = window.App.UI_DOM_IDS;
    const s = window.App.UIState;

    if (closeExpenseModalBtn) closeExpenseModalBtn.addEventListener("click", hideExpenseModal);
    if (modalExpenseCancelBtn) modalExpenseCancelBtn.addEventListener("click", hideExpenseModal);

    // Controle condicional para Cartão de Crédito e Investimento
    if (modalExpenseCat) modalExpenseCat.addEventListener("change", e => {
      const val = e.target.value;
      if (val === "Cartão de Crédito") {
        modalExpenseInstallmentsContainer.classList.remove("hidden");
        modalExpenseInstallments.focus();
      } else {
        modalExpenseInstallmentsContainer.classList.add("hidden");
        modalExpenseInstallments.value = "1";
      }
      if (val === "Investimento") {
        modalExpenseInvestmentContainer.classList.remove("hidden");
        renderInvestmentCategoriesDropdown();
      } else {
        modalExpenseInvestmentContainer.classList.add("hidden");
      }
    });

    // Botão Adicionar Gasto / Cadastrar Financiamento (dinâmico por aba)
    if (addExpenseBtn) addExpenseBtn.addEventListener("click", () => {
      const state = window.App.State.getState();
      if (state.mesAtivo === 14) {
        s.editingFinancingId = null;
        financingNameInput.disabled = false;
        financingTotalValInput.disabled = false;
        financingInstallmentValInput.disabled = false;
        document.getElementById(DOM_IDS.FINANCING_START_MONTH).disabled = false;
        document.getElementById(DOM_IDS.FINANCING_START_YEAR).disabled = false;
        financingRegisterForm.reset();
        const modalTitle  = financingModal.querySelector("h3");
        const submitBtn   = financingRegisterForm.querySelector('button[type="submit"]');
        if (modalTitle) modalTitle.textContent = "Cadastrar Financiamento";
        if (submitBtn)  submitBtn.textContent  = "Salvar";
        financingModal.classList.remove("hidden");
        financingNameInput.focus();
      } else {
        if (!state.perfilAtivo) { showStatus("Crie um perfil antes de adicionar despesas.", true); return; }
        s.editingExpenseId = null;
        const modalTitle = expenseModal.querySelector("h3");
        const submitBtn  = modalExpenseCreateForm.querySelector('button[type="submit"]');
        if (modalTitle) modalTitle.textContent = "Adicionar Novo Gasto";
        if (submitBtn)  submitBtn.textContent  = "Salvar Gasto";
        modalExpenseMonth.value = state.mesAtivo > 12 ? "1" : state.mesAtivo;
        modalExpenseYear.value  = state.anoAtivo || new Date().getFullYear();
        expenseModal.classList.remove("hidden");
        modalExpenseDesc.focus();
      }
    });

    // Filtro de Categoria na tela de despesas
    if (s.expenseCategoryFilter) {
      s.expenseCategoryFilter.addEventListener("change", () => {
        const state = window.App.State.getState();
        render(state);
      });
    }

    // Submit do formulário de despesas (Add ou Edit)
    if (modalExpenseCreateForm) modalExpenseCreateForm.addEventListener("submit", e => {
      e.preventDefault();
      const state  = window.App.State.getState();
      const desc   = modalExpenseDesc.value.trim();
      const valor  = parseBRLValue(modalExpenseVal.value);
      const cat    = modalExpenseCat.value;
      const mes    = state.mesAtivo > 12 ? 1 : state.mesAtivo;
      const ano    = state.anoAtivo;
      const parc   = parseInt(modalExpenseInstallments.value);
      const recurrentInput = document.getElementById(DOM_IDS.MODAL_EXPENSE_RECURRENT);
      const recorrente = recurrentInput ? recurrentInput.value === "sim" : false;
      if (!desc)                          { alert("Por favor, digite uma descrição."); return; }
      if (isNaN(valor) || valor === 0)    { alert("O valor do lançamento não pode ser zero."); return; }
      if (isNaN(parc) || parc < 1)        { alert("O número de parcelas deve ser igual ou maior que 1."); return; }
      const subcat = cat === "Investimento" && modalExpenseInvestmentCat ? modalExpenseInvestmentCat.value : "";
      try {
        if (s.editingExpenseId) {
          window.App.State.atualizarDespesa(s.editingExpenseId, desc, valor, cat, mes, parc, recorrente, ano, subcat);
          showStatus("Gasto atualizado com sucesso!");
        } else {
          window.App.State.adicionarDespesa(desc, valor, cat, mes, parc, recorrente, ano, subcat);
          showStatus("Gasto lançado com sucesso!");
        }
        hideExpenseModal();
      } catch (err) { alert(`Erro: ${err.message}`); }
    });
  }

  function render(state) {
    const { formatCurrency, formatBRLInput, showStatus } = window.App.UIUtils;
    const s = window.App.UIState;
    const DOM_IDS = window.App.UI_DOM_IDS;
    const { perfis, perfilAtivo, despesas, mesAtivo, anoAtivo, financiamentos } = state;

    // Atualizar as opções do filtro de categoria se o elemento existir na tela
    if (s.expenseCategoryFilter) {
      const currentSelected = s.expenseCategoryFilter.value;
      s.expenseCategoryFilter.innerHTML = '<option value="">Todas as Categorias</option>';
      const categoriesList = Object.keys(state.categorias || {});
      categoriesList.forEach(cat => {
        const opt = document.createElement("option");
        opt.value = cat;
        opt.textContent = cat;
        s.expenseCategoryFilter.appendChild(opt);
      });
      // Restaurar o valor selecionado se ele ainda existir nas categorias
      if (categoriesList.includes(currentSelected)) {
        s.expenseCategoryFilter.value = currentSelected;
      } else {
        s.expenseCategoryFilter.value = "";
      }
    }

    if (!s.expensesTableBody) return;
    s.expensesTableBody.innerHTML = "";
    const itensDaTabela = [];

    // 1. Despesas ativas no mês
    despesas.forEach(d => {
      if (d.perfil !== perfilAtivo) return;
      const info = window.App.Engine.getInstallmentInfo(d, mesAtivo, anoAtivo);
      if (info && info.active) {
        itensDaTabela.push({
          tipo: "despesa", id: d.id,
          descricao: d.descricao, categoria: d.categoria,
          valorParcela: info.valorParcela,
          parcelasTexto: d.recorrente ? "Recorrente" : (info.total === 1 ? "À vista" : `Parcela ${info.index} de ${info.total}`),
          objetoOriginal: d
        });
      }
    });

    // 2. Financiamentos ativos como linhas informativas
    const fAtivos = financiamentos.filter(f => f.perfil === perfilAtivo);
    fAtivos.forEach(f => {
      const S_month = parseInt(f.mes_inicio) || 1;
      const S_year  = parseInt(f.ano_inicio) || anoAtivo;
      const P       = parseInt(f.parcelasTotais) || 1;
      const startAbs = S_year * 12 + S_month - 1;
      const viewAbs  = anoAtivo * 12 + mesAtivo - 1;
      const index    = viewAbs - startAbs + 1;
      if (index >= 1 && index <= P) {
        itensDaTabela.push({
          tipo: "financiamento", id: f.id,
          descricao: `Financiamento: ${f.nome}`, categoria: "Financiamento",
          valorParcela: f.valorParcela,
          parcelasTexto: `Parcela ${index} de ${f.parcelasTotais}`
        });
      }
    });

    let itensFiltrados = itensDaTabela;
    if (s.expenseCategoryFilter) {
      const selectedCategory = s.expenseCategoryFilter.value;
      if (selectedCategory) {
        itensFiltrados = itensDaTabela.filter(item => item.categoria === selectedCategory);
      }
    }

    if (s.expenseCountBadge) s.expenseCountBadge.textContent = `${itensFiltrados.length} total`;

    if (itensFiltrados.length === 0) {
      const row = document.createElement("tr");
      row.innerHTML = `<td colspan="5" class="text-center py-8 text-slate-500 text-xs font-medium">Nenhum gasto cadastrado para este mês.</td>`;
      s.expensesTableBody.appendChild(row);
    } else {
      itensFiltrados.forEach(item => {
        const row = document.createElement("tr");
        row.className = "hover:bg-slate-900/40 transition border-b border-slate-850 text-slate-300";
        const actionCol = item.tipo === "despesa"
          ? `<button class="edit-expense-btn bg-slate-800 hover:bg-slate-750 text-indigo-300 hover:text-indigo-200 border border-slate-700 hover:border-slate-650 px-2.5 py-1 rounded-lg transition text-xs mr-1.5 focus:outline-none" data-id="${item.id}">Editar</button>
             <button class="remove-expense-btn bg-red-950/20 hover:bg-red-950/40 text-red-400 hover:text-red-300 border border-red-500/20 hover:border-red-500/40 px-2.5 py-1 rounded-lg transition text-xs focus:outline-none" data-id="${item.id}">Excluir</button>`
          : `<span class="text-xxs font-bold text-slate-500 uppercase tracking-wider bg-slate-950/40 px-2.5 py-1.5 border border-slate-850 rounded-lg">Fixo Contrato</span>`;

        row.innerHTML = `
          <td class="py-3 px-4 font-medium text-slate-200">${item.descricao}</td>
          <td class="py-3 px-4">
            <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xxs font-bold bg-slate-800 text-slate-400 border border-slate-700/60 shrink-0">
              <span class="inline-block w-1.5 h-1.5 rounded-full mr-1.5 shrink-0" style="background-color: ${state.categorias[item.categoria] || '#64748b'}"></span>
              ${item.categoria}
            </span>
          </td>
          <td class="py-3 px-4 font-mono text-indigo-300">${formatCurrency(item.valorParcela)}</td>
          <td class="py-3 px-4 font-mono text-slate-400">${item.parcelasTexto}</td>
          <td class="py-3 px-4 text-right">${actionCol}</td>
        `;
        s.expensesTableBody.appendChild(row);
      });

      // Bind: excluir despesa
      s.expensesTableBody.querySelectorAll(".remove-expense-btn").forEach(btn => {
        btn.addEventListener("click", e => {
          const id = e.target.getAttribute("data-id");
          try { window.App.State.removerDespesa(id); showStatus("Despesa excluída."); }
          catch (err) { showStatus(err.message, true); }
        });
      });

      // Bind: editar despesa
      s.expensesTableBody.querySelectorAll(".edit-expense-btn").forEach(btn => {
        btn.addEventListener("click", e => {
          const id    = e.target.getAttribute("data-id");
          const found = despesas.find(d => d.id === id);
          if (!found) return;
          s.editingExpenseId = found.id;
          const { formatBRLInput } = window.App.UIUtils;
          const modalTitle = expenseModal.querySelector("h3");
          const submitBtn  = modalExpenseCreateForm.querySelector('button[type="submit"]');
          if (modalTitle) modalTitle.textContent = "Editar Gasto";
          if (submitBtn)  submitBtn.textContent  = "Salvar Alterações";
          modalExpenseDesc.value   = found.descricao;
          modalExpenseVal.value    = formatBRLInput(found.valor.toFixed(2));
          modalExpenseMonth.value  = found.mes_inicio;
          modalExpenseYear.value   = found.ano_inicio || new Date().getFullYear();
          modalExpenseCat.value    = found.categoria;
          modalExpenseInstallments.value = found.parcelas;
          const recurrentInput = document.getElementById(window.App.UI_DOM_IDS.MODAL_EXPENSE_RECURRENT);
          if (recurrentInput) recurrentInput.value = found.recorrente ? "sim" : "nao";
          if (found.categoria === "Cartão de Crédito") {
            modalExpenseInstallmentsContainer.classList.remove("hidden");
          } else {
            modalExpenseInstallmentsContainer.classList.add("hidden");
          }
          if (found.categoria === "Investimento" && modalExpenseInvestmentContainer) {
            modalExpenseInvestmentContainer.classList.remove("hidden");
            renderInvestmentCategoriesDropdown();
            if (modalExpenseInvestmentCat) modalExpenseInvestmentCat.value = found.subcategoria || "";
          } else if (modalExpenseInvestmentContainer) {
            modalExpenseInvestmentContainer.classList.add("hidden");
          }
          expenseModal.classList.remove("hidden");
          modalExpenseDesc.focus();
        });
      });
    }
  }

  return { mapElements, init, render };
})();
