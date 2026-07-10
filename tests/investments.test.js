import { describe, it, expect, vi, beforeEach } from 'vitest';
import fs from 'fs';

// Mock state and global window
global.window = {
  App: {
    State: {
      getState: () => ({
        perfis: [{ nome: "Principal", salario: 3000.00, fgts: 1000.00 }],
        perfilAtivo: "Principal",
        mesAtivo: 1,
        anoAtivo: 2026,
        despesas: [
          { id: "exp-inv-1", perfil: "Principal", descricao: "Aporte CDB", valor: 500.00, categoria: "Investimento", subcategoria: "CDB", mes_inicio: 1, ano_inicio: 2026, parcelas: 1, recorrente: false },
          { id: "exp-rec-1", perfil: "Principal", descricao: "Aluguel", valor: 1200.00, categoria: "Moradia", mes_inicio: 1, ano_inicio: 2026, parcelas: 1, recorrente: true }
        ],
        financiamentos: [],
        categorias: {
          "Investimento": "#eab308",
          "Moradia": "#6366f1"
        },
        categoriasInvestimento: ["CDB", "Previdência", "Fundos", "Ações", "Poupança", "FGTS", "Outros"]
      }),
      subscribe: vi.fn(),
      adicionarDespesa: vi.fn(),
      atualizarDespesa: vi.fn(),
      adicionarCategoriaInvestimento: vi.fn(),
      atualizarFgts: vi.fn()
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
      'kpi-reserva-emergencia': { textContent: '' },
      'kpi-fgts-view': { textContent: '' },
      'kpi-fgts-input': { addEventListener: vi.fn(), classList: { add: vi.fn(), remove: vi.fn() }, value: '' },
      'btn-edit-fgts': { addEventListener: vi.fn(), classList: { add: vi.fn(), remove: vi.fn() } },
      'btn-save-fgts': { addEventListener: vi.fn(), classList: { add: vi.fn(), remove: vi.fn() } },
      'kpi-total-com-fgts': { textContent: '' },
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

    // KPI emergency reserve should show 6x 1200.00 = R$ 7.200,00
    const cleanEmergencyReserveText = domElements['kpi-reserva-emergencia'].textContent.replace(/\s/g, ' ');
    expect(cleanEmergencyReserveText).toContain('R$ 7.200,00');

    // KPI FGTS should show formatCurrency(1000.00)
    const cleanFgtsText = domElements['kpi-fgts-view'].textContent.replace(/\s/g, ' ');
    expect(cleanFgtsText).toContain('R$ 1.000,00');

    // KPI combined should show formatCurrency(1500.00)
    const cleanCombinedText = domElements['kpi-total-com-fgts'].textContent.replace(/\s/g, ' ');
    expect(cleanCombinedText).toContain('R$ 1.500,00');

    // Chart should contain CDB and FGTS only, and exclude Emergency Reserve
    expect(window.App.Charts.renderInvestmentsChart).toHaveBeenCalledWith(
      'investments-chart-canvas',
      { CDB: 500.00, FGTS: 1000.00 }
    );
  });
});
