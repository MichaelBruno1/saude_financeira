import { describe, it, expect, vi, beforeEach } from 'vitest';
import fs from 'fs';

// Mock state and global window
global.window = {
  App: {
    State: {
      getState: () => ({
        perfis: [{ nome: "Principal", salario: 3000.00 }],
        perfilAtivo: "Principal",
        mesAtivo: 1,
        anoAtivo: 2026,
        despesas: [
          { id: "exp-inv-1", perfil: "Principal", descricao: "Aporte CDB", valor: 500.00, categoria: "Investimento", subcategoria: "CDB", mes_inicio: 1, ano_inicio: 2026, parcelas: 1, recorrente: false }
        ],
        financiamentos: [],
        categorias: {
          "Investimento": "#eab308"
        },
        categoriasInvestimento: ["CDB", "Previdência", "Fundos", "Ações", "Poupança", "Outros"]
      }),
      subscribe: vi.fn(),
      adicionarDespesa: vi.fn(),
      atualizarDespesa: vi.fn(),
      adicionarCategoriaInvestimento: vi.fn()
    },
    LlmConfig: { apiUrl: "http://localhost:11434", apiKey: "test-key", model: "llama3" }
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
      querySelector: vi.fn().mockReturnValue({ textContent: '' }),
      appendChild: vi.fn()
    };
  }),
  createElement: vi.fn().mockImplementation((tag) => {
    return {
      tagName: tag,
      className: '',
      innerHTML: ''
    };
  })
};

describe('Investments Feature integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    domElements = {
      'sidebar-investimentos-btn': { addEventListener: vi.fn() },
      'investments-container': { classList: { add: vi.fn(), remove: vi.fn() } },
      'kpi-total-investido': { textContent: '' },
      'investments-table-body': { appendChild: vi.fn(), innerHTML: '' },
      'generate-investments-analysis-btn': { addEventListener: vi.fn(), disabled: false },
      'investments-analysis-loader': { classList: { add: vi.fn(), remove: vi.fn() } },
      'investments-analysis-result-card': { classList: { add: vi.fn(), remove: vi.fn() } },
      'investments-analysis-timestamp': { textContent: '' },
      'investments-analysis-text-content': { innerHTML: '' },
      'add-investment-category-form': { addEventListener: vi.fn() },
      'new-investment-category-name': { value: '' },
      'settings-investment-categories-list': { appendChild: vi.fn(), innerHTML: '' },
      'modal-expense-investment-container': { classList: { add: vi.fn(), remove: vi.fn() } },
      'modal-expense-investment-cat': { appendChild: vi.fn(), innerHTML: '', value: '' },
      'modal-expense-cat': { addEventListener: vi.fn(), value: '' }
    };
  });

  it('should register click listener on sidebar investments button and navigate to aba 16', () => {
    const uiCode = fs.readFileSync('js/ui.js', 'utf8');
    eval(uiCode);

    const ui = window.App.UI;
    ui.init();

    const sidebarBtn = domElements['sidebar-investimentos-btn'];
    expect(sidebarBtn.addEventListener).toHaveBeenCalledWith('click', expect.any(Function));
  });

  it('should render investment portfolio table, KPI and chart correctly', () => {
    const uiCode = fs.readFileSync('js/ui.js', 'utf8');
    eval(uiCode);

    const ui = window.App.UI;
    ui.init();

    // Mock window.App.Charts
    window.App.Charts = {
      renderInvestmentsChart: vi.fn()
    };

    const state = window.App.State.getState();
    ui.renderInvestimentos(state);

    // KPI total invested should show formatCurrency(500.00)
    // CDB aporte should be in table body HTML
    const cleanKpiText = domElements['kpi-total-investido'].textContent.replace(/\s/g, ' ');
    expect(cleanKpiText).toContain('R$ 500,00');
    expect(window.App.Charts.renderInvestmentsChart).toHaveBeenCalledWith(
      'investments-chart-canvas',
      { CDB: 500.00 }
    );
  });
});
