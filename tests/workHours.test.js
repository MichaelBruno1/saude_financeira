import { describe, it, expect, vi, beforeEach } from 'vitest';
import fs from 'fs';

// Mock state and global window
global.window = {
  App: {
    UIUtils: {
      formatCurrency: (val) => `R$ ${val.toFixed(2)}`,
      showStatus: vi.fn()
    },
    Engine: {
      getInstallmentInfo: (d, mes, ano) => {
        return {
          active: true,
          valorParcela: d.valor,
          index: 1,
          total: 1
        };
      },
      getFinancingDetailsForMonth: () => ({ active: false })
    },
    UI_DOM_IDS: {},
    UIState: {}
  }
};

let domElements = {};

global.document = {
  getElementById: vi.fn().mockImplementation((id) => {
    if (domElements[id]) return domElements[id];
    return {
      id: id,
      value: '',
      addEventListener: vi.fn(),
      classList: {
        add: vi.fn(),
        remove: vi.fn(),
        contains: vi.fn().mockReturnValue(false)
      },
      querySelectorAll: vi.fn().mockReturnValue([]),
      appendChild: vi.fn(),
      innerHTML: ''
    };
  }),
  createElement: vi.fn().mockImplementation((tag) => {
    return {
      tagName: tag,
      className: '',
      innerHTML: '',
      textContent: '',
      addEventListener: vi.fn(),
      appendChild: vi.fn(),
      querySelectorAll: vi.fn().mockReturnValue([])
    };
  })
};

describe('Work Hours Calculation in Expenses List', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    domElements = {
      'expenses-table-body': {
        innerHTML: '',
        appendChild: vi.fn(),
        querySelectorAll: vi.fn().mockReturnValue([])
      },
      'expense-category-filter': {
        value: '',
        innerHTML: '',
        appendChild: vi.fn()
      },
      'expense-count-badge': {
        textContent: ''
      }
    };

    // Load ui-expenses.js
    const expensesCode = fs.readFileSync('js/ui-expenses.js', 'utf8');
    eval(expensesCode);
  });

  it('should render standard hours calculation (10.0h) for expense = R$ 100 and salary = R$ 2200', () => {
    const UIExpenses = global.window.App.UIExpenses;
    
    // Map DOM elements to global state
    global.window.App.UIState.expensesTableBody = domElements['expenses-table-body'];
    global.window.App.UIState.expenseCategoryFilter = domElements['expense-category-filter'];
    global.window.App.UIState.expenseCountBadge = domElements['expense-count-badge'];

    const state = {
      perfis: [{ nome: "Michael", salario: 2200 }],
      perfilAtivo: "Michael",
      despesas: [
        { id: "exp-1", perfil: "Michael", descricao: "Supermercado", valor: 100, categoria: "Alimentação", mes_inicio: 1, ano_inicio: 2026, parcelas: 1, recorrente: false }
      ],
      financiamentos: [],
      mesAtivo: 1,
      anoAtivo: 2026,
      categorias: { "Alimentação": "#eab308" }
    };

    const renderedRows = [];
    domElements['expenses-table-body'].appendChild = vi.fn().mockImplementation((row) => {
      renderedRows.push(row);
    });

    UIExpenses.render(state);

    expect(renderedRows.length).toBe(1);
    const rowContent = renderedRows[0].innerHTML;
    // Verification: valorHora = 2200 / 220 = 10. For 100 R$, it takes 100 / 10 = 10 hours.
    expect(rowContent).toContain('10.0h');
    expect(rowContent).toContain('Supermercado');
  });

  it('should format as minutes (30 min) for smaller expenses (R$ 10 with R$ 4400 salary)', () => {
    const UIExpenses = global.window.App.UIExpenses;
    
    global.window.App.UIState.expensesTableBody = domElements['expenses-table-body'];
    global.window.App.UIState.expenseCategoryFilter = domElements['expense-category-filter'];
    global.window.App.UIState.expenseCountBadge = domElements['expense-count-badge'];

    const state = {
      perfis: [{ nome: "Michael", salario: 4400 }],
      perfilAtivo: "Michael",
      despesas: [
        { id: "exp-2", perfil: "Michael", descricao: "Cafezinho", valor: 10, categoria: "Alimentação", mes_inicio: 1, ano_inicio: 2026, parcelas: 1, recorrente: false }
      ],
      financiamentos: [],
      mesAtivo: 1,
      anoAtivo: 2026,
      categorias: { "Alimentação": "#eab308" }
    };

    const renderedRows = [];
    domElements['expenses-table-body'].appendChild = vi.fn().mockImplementation((row) => {
      renderedRows.push(row);
    });

    UIExpenses.render(state);

    expect(renderedRows.length).toBe(1);
    const rowContent = renderedRows[0].innerHTML;
    // Verification: valorHora = 4400 / 220 = 20. For 10 R$, it takes 10 / 20 = 0.5 hours = 30 min.
    expect(rowContent).toContain('30 min');
    expect(rowContent).toContain('Cafezinho');
  });

  it('should display fallback - for profile with zero/undefined salary', () => {
    const UIExpenses = global.window.App.UIExpenses;
    
    global.window.App.UIState.expensesTableBody = domElements['expenses-table-body'];
    global.window.App.UIState.expenseCategoryFilter = domElements['expense-category-filter'];
    global.window.App.UIState.expenseCountBadge = domElements['expense-count-badge'];

    const state = {
      perfis: [{ nome: "Michael", salario: 0 }],
      perfilAtivo: "Michael",
      despesas: [
        { id: "exp-3", perfil: "Michael", descricao: "Uber", valor: 15, categoria: "Transporte", mes_inicio: 1, ano_inicio: 2026, parcelas: 1, recorrente: false }
      ],
      financiamentos: [],
      mesAtivo: 1,
      anoAtivo: 2026,
      categorias: { "Transporte": "#64748b" }
    };

    const renderedRows = [];
    domElements['expenses-table-body'].appendChild = vi.fn().mockImplementation((row) => {
      renderedRows.push(row);
    });

    UIExpenses.render(state);

    expect(renderedRows.length).toBe(1);
    const rowContent = renderedRows[0].innerHTML;
    expect(rowContent).toContain('>-<');
    expect(rowContent).toContain('Uber');
  });

  it('should sort recurring expenses first, and then non-recurring by creation order', () => {
    const UIExpenses = global.window.App.UIExpenses;
    
    global.window.App.UIState.expensesTableBody = domElements['expenses-table-body'];
    global.window.App.UIState.expenseCategoryFilter = domElements['expense-category-filter'];
    global.window.App.UIState.expenseCountBadge = domElements['expense-count-badge'];

    const state = {
      perfis: [{ nome: "Michael", salario: 2200 }],
      perfilAtivo: "Michael",
      despesas: [
        { id: "exp-1", perfil: "Michael", descricao: "Primeiro Eventual", valor: 100, categoria: "Outros", mes_inicio: 1, ano_inicio: 2026, parcelas: 1, recorrente: false },
        { id: "exp-2", perfil: "Michael", descricao: "Segundo Recorrente", valor: 50, categoria: "Outros", mes_inicio: 1, ano_inicio: 2026, parcelas: 1, recorrente: true },
        { id: "exp-3", perfil: "Michael", descricao: "Terceiro Eventual", valor: 30, categoria: "Outros", mes_inicio: 1, ano_inicio: 2026, parcelas: 1, recorrente: false }
      ],
      financiamentos: [],
      mesAtivo: 1,
      anoAtivo: 2026,
      categorias: { "Outros": "#64748b" }
    };

    const renderedRows = [];
    domElements['expenses-table-body'].appendChild = vi.fn().mockImplementation((row) => {
      renderedRows.push(row);
    });

    UIExpenses.render(state);

    expect(renderedRows.length).toBe(3);
    // Verificações de ordem:
    // 1º deve ser "Segundo Recorrente" (id: exp-2)
    expect(renderedRows[0].innerHTML).toContain('Segundo Recorrente');
    // 2º deve ser "Primeiro Eventual" (id: exp-1)
    expect(renderedRows[1].innerHTML).toContain('Primeiro Eventual');
    // 3º deve ser "Terceiro Eventual" (id: exp-3)
    expect(renderedRows[2].innerHTML).toContain('Terceiro Eventual');
  });
});
