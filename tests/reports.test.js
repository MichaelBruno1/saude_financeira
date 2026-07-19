import { describe, it, expect, vi, beforeEach } from 'vitest';
import fs from 'fs';

// Mock state and global window
global.window = {
  App: {
    UIUtils: {
      formatCurrency: (val) => `R$ ${val.toFixed(2)}`,
      formatBRLInput: (val) => val,
      parseBRLValue: (val) => parseFloat(val),
      parseMarkdownToHTML: (text) => text,
      showStatus: vi.fn()
    },
    Engine: {
      calculateMonthlySummary: (perfil, mes, despesas, financiamentos, anoSelecionado) => {
        // Simple mock of monthly summary
        const categoryMap = {
          6: { "Saúde": 100.0, "Cartão de Crédito": 500.0, "Investimento": 1000.0 }, // June
          7: { "Saúde": 85.0, "Cartão de Crédito": 550.0, "Investimento": 1200.0 }  // July
        };
        return {
          gastosPorCategoria: categoryMap[mes] || {},
          porcentagemPorCategoria: {},
          totalGastos: 0,
          saldoRestante: 0
        };
      },
      calculateAnnualSummary: () => ({ gastosPorCategoria: {}, porcentagemPorCategoria: {} }),
      calculateCardProjection: () => [],
      getFinancingDetailsForMonth: () => ({ active: false })
    },
    Charts: {
      renderPizzaChart: vi.fn(),
      renderLineChart: vi.fn(),
      renderPlannerChart: vi.fn()
    },
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
      querySelector: vi.fn().mockReturnValue({ textContent: '' }),
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
      querySelector: vi.fn().mockImplementation((selector) => {
        return {
          addEventListener: vi.fn()
        };
      })
    };
  })
};

describe('Reports Monthly Comparison Feature', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    domElements = {
      'reports-container': { classList: { add: vi.fn(), remove: vi.fn(), contains: vi.fn().mockReturnValue(false) } },
      'reports-pizza-month-select': { value: '7', addEventListener: vi.fn() },
      'reports-budget-progress-container': { appendChild: vi.fn(), innerHTML: '' },
      'planner-method-select': { value: 'Equilibrado', addEventListener: vi.fn() },
      'planner-comparison-table-body': { appendChild: vi.fn(), innerHTML: '' },
      'opt-report-method-personalizado': { classList: { add: vi.fn(), remove: vi.fn() } },
      'reports-comparison-card': { classList: { add: vi.fn(), remove: vi.fn() } },
      'reports-comparison-subtitle': { textContent: '' },
      'reports-comparison-container': { appendChild: vi.fn(), innerHTML: '' }
    };

    // Load ui-reports.js
    const reportsCode = fs.readFileSync('js/ui-reports.js', 'utf8');
    eval(reportsCode);
  });

  it('should map elements and hide comparative card if selected month is 0', () => {
    const UIReports = global.window.App.UIReports;
    UIReports.mapElements({
      REPORTS_CONTAINER: 'reports-container',
      REPORTS_PIZZA_MONTH_SELECT: 'reports-pizza-month-select',
      REPORTS_BUDGET_PROGRESS_CONTAINER: 'reports-budget-progress-container',
      PLANNER_METHOD_SELECT: 'planner-method-select',
      PLANNER_COMPARISON_TABLE_BODY: 'planner-comparison-table-body',
      OPT_REPORT_METHOD_PERSONALIZADO: 'opt-report-method-personalizado',
      GENERATE_AI_ANALYSIS_BTN: 'generate-ai-analysis-btn',
      GENERATE_SAVINGS_PLAN_BTN: 'generate-savings-plan-btn',
      SAVINGS_PLAN_LOADER: 'savings-plan-loader',
      SAVINGS_PLAN_RESULT_CARD: 'savings-plan-result-card',
      SAVINGS_PLAN_TIMESTAMP: 'savings-plan-timestamp',
      SAVINGS_PLAN_TEXT_CONTENT: 'savings-plan-text-content'
    });

    const state = {
      perfis: [{ nome: "Principal", salario: 3000 }],
      perfilAtivo: "Principal",
      despesas: [],
      financiamentos: [],
      anoAtivo: 2026
    };

    // 1. Switch select month to 0 (Consolidado Anual)
    domElements['reports-pizza-month-select'].value = '0';
    UIReports.render(state);

    // Verify reports-comparison-card is hidden
    expect(domElements['reports-comparison-card'].classList.add).toHaveBeenCalledWith('hidden');
  });

  it('should render comparison insights for month 7 compared to month 6', () => {
    const UIReports = global.window.App.UIReports;
    UIReports.mapElements({
      REPORTS_CONTAINER: 'reports-container',
      REPORTS_PIZZA_MONTH_SELECT: 'reports-pizza-month-select',
      REPORTS_BUDGET_PROGRESS_CONTAINER: 'reports-budget-progress-container',
      PLANNER_METHOD_SELECT: 'planner-method-select',
      PLANNER_COMPARISON_TABLE_BODY: 'planner-comparison-table-body',
      OPT_REPORT_METHOD_PERSONALIZADO: 'opt-report-method-personalizado',
      GENERATE_AI_ANALYSIS_BTN: 'generate-ai-analysis-btn',
      GENERATE_SAVINGS_PLAN_BTN: 'generate-savings-plan-btn',
      SAVINGS_PLAN_LOADER: 'savings-plan-loader',
      SAVINGS_PLAN_RESULT_CARD: 'savings-plan-result-card',
      SAVINGS_PLAN_TIMESTAMP: 'savings-plan-timestamp',
      SAVINGS_PLAN_TEXT_CONTENT: 'savings-plan-text-content'
    });

    const state = {
      perfis: [{ nome: "Principal", salario: 3000 }],
      perfilAtivo: "Principal",
      despesas: [],
      financiamentos: [],
      anoAtivo: 2026
    };

    // Month 7 selected (July)
    domElements['reports-pizza-month-select'].value = '7';
    
    // Catch children added to comparison container
    const addedCards = [];
    domElements['reports-comparison-container'].appendChild = vi.fn().mockImplementation((child) => {
      addedCards.push(child);
    });

    UIReports.render(state);

    // Verify comparison subtitle is set
    expect(domElements['reports-comparison-subtitle'].textContent).toContain('Julho de 2026 com Junho de 2026');
    
    // Verify reports-comparison-card is displayed
    expect(domElements['reports-comparison-card'].classList.remove).toHaveBeenCalledWith('hidden');

    // We mock summary to have:
    // June: Saúde 100, Cartão 500, Investimento 1000
    // July: Saúde 85 (decrease 15% - Good!), Cartão 550 (increase 10% - Bad!), Investimento 1200 (increase 20% - Good!)
    expect(addedCards.length).toBe(3);

    // Check Saúde: decrease 15%, isGood = true
    const saudeCard = addedCards.find(c => c.innerHTML.includes('Saúde'));
    expect(saudeCard).toBeDefined();
    expect(saudeCard.innerHTML).toContain('Seu gasto com Saúde diminuiu 15%');
    expect(saudeCard.className).toContain('border-emerald-950/40 bg-emerald-950/5'); // good border colors

    // Check Cartão de Crédito: increase 10%, isGood = false
    const cartaoCard = addedCards.find(c => c.innerHTML.includes('Cartão de Crédito'));
    expect(cartaoCard).toBeDefined();
    expect(cartaoCard.innerHTML).toContain('Seu gasto com Cartão de Crédito aumentou 10%');
    expect(cartaoCard.className).toContain('border-rose-950/40 bg-rose-950/5'); // bad border colors

    // Check Investimento: increase 20%, isGood = true (investment increase is good!)
    const invCard = addedCards.find(c => c.innerHTML.includes('Investimento'));
    expect(invCard).toBeDefined();
    expect(invCard.innerHTML).toContain('Seu gasto com Investimento aumentou 20%');
    expect(invCard.className).toContain('border-emerald-950/40 bg-emerald-950/5'); // good border colors
  });
});
