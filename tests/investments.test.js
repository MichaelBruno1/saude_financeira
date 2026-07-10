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
          { id: "exp-inv-2", perfil: "Principal", descricao: "Saque CDB", valor: -200.00, categoria: "Investimento", subcategoria: "CDB", mes_inicio: 1, ano_inicio: 2026, parcelas: 1, recorrente: false },
          { id: "exp-rec-1", perfil: "Principal", descricao: "Aluguel", valor: 1200.00, categoria: "Moradia", mes_inicio: 1, ano_inicio: 2026, parcelas: 1, recorrente: true }
        ],
        financiamentos: [
          { id: "fin-1", perfil: "Principal", nome: "Casa", valorTotal: 120000.00, valorParcela: 300.00, parcelasTotais: 240, taxaTR: 0.1, mes_inicio: 1, ano_inicio: 2026 }
        ],
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
      'kpi-reserva-emergencia': { textContent: '', className: '' },
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

  it('should render investment portfolio table, KPI and chart correctly, adjusting for withdrawals and reserve rules', () => {
    const uiCode = fs.readFileSync('js/ui.js', 'utf8');
    eval(uiCode);

    const ui = window.App.UI;
    ui.init();

    window.App.Charts = {
      renderInvestmentsChart: vi.fn()
    };

    const state = window.App.State.getState();
    ui.renderInvestimentos(state);

    // KPI total invested should show formatCurrency(300.00) due to 500 - 200 resgate
    const cleanKpiText = domElements['kpi-total-investido'].textContent.replace(/\s/g, ' ');
    expect(cleanKpiText).toContain('R$ 300,00');

    // KPI emergency reserve should show 6x (1200 + 300) = R$ 9.000,00
    const cleanEmergencyReserveText = domElements['kpi-reserva-emergencia'].textContent.replace(/\s/g, ' ');
    expect(cleanEmergencyReserveText).toContain('R$ 9.000,00');

    // Since totalInvested (300) is < 80% * 9000 (7200), reserve KPI should be red/rose-400
    expect(domElements['kpi-reserva-emergencia'].className).toContain('text-rose-400');

    // KPI FGTS should show formatCurrency(1000.00)
    const cleanFgtsText = domElements['kpi-fgts-view'].textContent.replace(/\s/g, ' ');
    expect(cleanFgtsText).toContain('R$ 1.000,00');

    // KPI combined should show formatCurrency(1300.00)
    const cleanCombinedText = domElements['kpi-total-com-fgts'].textContent.replace(/\s/g, ' ');
    expect(cleanCombinedText).toContain('R$ 1.300,00');

    // Chart should contain CDB (300) and FGTS (1000) only, and exclude Emergency Reserve
    expect(window.App.Charts.renderInvestmentsChart).toHaveBeenCalledWith(
      'investments-chart-canvas',
      { CDB: 300.00, FGTS: 1000.00 }
    );
  });

  it('should apply correct color class based on reserve percentages', () => {
    const uiCode = fs.readFileSync('js/ui.js', 'utf8');
    eval(uiCode);

    const ui = window.App.UI;
    ui.init();

    // 1. Test yellow color (80% <= invested < 100% of 9000)
    const yellowState = {
      perfis: [{ nome: "Principal", salario: 3000.00, fgts: 1000.00 }],
      perfilAtivo: "Principal",
      despesas: [
        { id: "exp-inv-1", perfil: "Principal", descricao: "Aporte", valor: 8000.00, categoria: "Investimento", subcategoria: "CDB", mes_inicio: 1, ano_inicio: 2026, parcelas: 1, recorrente: false },
        { id: "exp-rec-1", perfil: "Principal", descricao: "Aluguel", valor: 1200.00, categoria: "Moradia", mes_inicio: 1, ano_inicio: 2026, parcelas: 1, recorrente: true }
      ],
      financiamentos: [
        { id: "fin-1", perfil: "Principal", nome: "Casa", valorTotal: 120000.00, valorParcela: 300.00, parcelasTotais: 240, taxaTR: 0.1, mes_inicio: 1, ano_inicio: 2026 }
      ]
    };
    ui.renderInvestimentos(yellowState);
    expect(domElements['kpi-reserva-emergencia'].className).toContain('text-amber-400');

    // 2. Test green color (invested >= 9000)
    const greenState = {
      perfis: [{ nome: "Principal", salario: 3000.00, fgts: 1000.00 }],
      perfilAtivo: "Principal",
      despesas: [
        { id: "exp-inv-1", perfil: "Principal", descricao: "Aporte", valor: 9500.00, categoria: "Investimento", subcategoria: "CDB", mes_inicio: 1, ano_inicio: 2026, parcelas: 1, recorrente: false },
        { id: "exp-rec-1", perfil: "Principal", descricao: "Aluguel", valor: 1200.00, categoria: "Moradia", mes_inicio: 1, ano_inicio: 2026, parcelas: 1, recorrente: true }
      ],
      financiamentos: [
        { id: "fin-1", perfil: "Principal", nome: "Casa", valorTotal: 120000.00, valorParcela: 300.00, parcelasTotais: 240, taxaTR: 0.1, mes_inicio: 1, ano_inicio: 2026 }
      ]
    };
    ui.renderInvestimentos(greenState);
    expect(domElements['kpi-reserva-emergencia'].className).toContain('text-emerald-400');
  });

  it('should allow negative values for all categories in state.js (representing refunds, withdrawals, etc.)', () => {
    const prevApp = global.window.App;
    
    global.window.localStorage = {
      getItem: vi.fn().mockReturnValue(null),
      setItem: vi.fn()
    };
    
    const stateCode = fs.readFileSync('js/state.js', 'utf8');
    eval(stateCode);
    
    const stateObj = window.App.State;
    // Criar perfil para teste
    stateObj.adicionarPerfil("TestProfile", 5000);
    stateObj.selecionarPerfil("TestProfile");
    
    // 1. Add negative investment expense
    const invGasto = stateObj.adicionarDespesa("Resgate", -100.0, "Investimento", 1, 1, false, 2026);
    expect(invGasto.valor).toBe(-100.0);
    
    // 2. Add negative other expense (representing a card refund, e.g. -50)
    const otherGasto = stateObj.adicionarDespesa("Reembolso", -50.0, "Alimentação", 1, 1, false, 2026);
    expect(otherGasto.valor).toBe(-50.0);
    
    // 3. Update investment expense to negative
    stateObj.atualizarDespesa(invGasto.id, "Resgate 2", -200.0, "Investimento", 1, 1, false, 2026);
    const updatedInv = window.App.State.getState().despesas.find(d => d.id === invGasto.id);
    expect(updatedInv.valor).toBe(-200.0);

    // 4. Update other expense to negative
    stateObj.atualizarDespesa(otherGasto.id, "Reembolso 2", -80.0, "Alimentação", 1, 1, false, 2026);
    const updatedOther = window.App.State.getState().despesas.find(d => d.id === otherGasto.id);
    expect(updatedOther.valor).toBe(-80.0);
    
    global.window.App = prevApp;
  });
});
