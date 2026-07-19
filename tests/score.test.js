import { describe, it, expect, vi, beforeEach } from 'vitest';
import fs from 'fs';

// Mock global window
global.window = {
  App: {}
};

describe('Financial Score Engine Calculations', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Load engine.js in global context
    const engineCode = fs.readFileSync('js/engine.js', 'utf8');
    eval(engineCode);
  });

  it('should return 0 score for empty profile', () => {
    const Engine = global.window.App.Engine;
    const res = Engine.calculateFinancialScore(null, [], [], [], 2026, 1);
    expect(res.score).toBe(0);
    expect(res.details).toEqual({});
  });

  it('should calculate perfect score (1000 points) for an excellent financial profile', () => {
    const Engine = global.window.App.Engine;
    
    // Profile with stable high salary
    const perfil = { nome: "Michael", salario: 10000 };

    // Regular investments in CDB in all 12 months
    const despesas = [];
    for (let m = 1; m <= 12; m++) {
      despesas.push({
        perfil: "Michael",
        categoria: "Investimento",
        subcategoria: "CDB",
        valor: 2000, // 20% savings rate (2000/10000)
        mes_inicio: m,
        ano_inicio: 2026,
        parcelas: 1,
        recorrente: false
      });
    }

    // Add extra categories for diversification (Ações, CDB, Poupança, FGTS = 4 unique subcategories)
    despesas.push({ perfil: "Michael", categoria: "Investimento", subcategoria: "Ações", valor: 50000, mes_inicio: 1, ano_inicio: 2026, parcelas: 1 });
    despesas.push({ perfil: "Michael", categoria: "Investimento", subcategoria: "Poupança", valor: 10000, mes_inicio: 1, ano_inicio: 2026, parcelas: 1 });
    despesas.push({ perfil: "Michael", categoria: "Investimento", subcategoria: "FGTS", valor: 38000, mes_inicio: 1, ano_inicio: 2026, parcelas: 1 });
    // Total invested = 24k (CDB regular) + 50k (Ações) + 10k (Poupança) + 38k (FGTS) = 122k (Exceeds 100k target)

    // No financing/debts (points = 100)
    const financiamentos = [];

    // Goals: all bought or highly progressed (points = 100)
    const metas = [
      { perfil: "Michael", nome: "Celular", valor: 2000, comprado: true, prioridade: 0 },
      { perfil: "Michael", nome: "Viagem", valor: 5000, comprado: true, prioridade: 1 }
    ];

    const res = Engine.calculateFinancialScore(perfil, despesas, financiamentos, metas, 2026, 1);
    
    // Let's assert details:
    expect(res.details.aportes).toBe(200);       // Investments in all 12 months (max 200)
    expect(res.details.patrimonio).toBe(200);    // > 100k total invested (max 200)
    expect(res.details.liquidez).toBe(150);      // Reserve completely filled (max 150)
    expect(res.details.concentracao).toBe(100);  // 4 unique subcategories (max 100)
    expect(res.details.essenciais).toBe(150);    // 0 essential spending (max 150)
    expect(res.details.poupanca).toBe(100);      // 2000 CDB / 10000 salary = 20% (exactly meets 20% target)
    expect(res.details.dividas).toBe(100);       // no debt (max 100)
    
    expect(res.score).toBe(1000);
  });

  it('should decrease score appropriately when profile has debts, high essential expenses, or zero investments', () => {
    const Engine = global.window.App.Engine;

    const perfil = { nome: "Michael", salario: 3000 };

    // June: No investments, high essential expenses (Housing)
    const despesas = [
      { perfil: "Michael", categoria: "Moradia", valor: 2400, mes_inicio: 1, ano_inicio: 2026, parcelas: 1 } // 80% essential ratio
    ];

    // Active financing with 0% paid off
    const financiamentos = [
      { perfil: "Michael", nome: "Casa", valorTotal: 100000, valorParcela: 1000, parcelasTotais: 100, mes_inicio: 1, ano_inicio: 2026 }
    ];

    const metas = [];

    const res = Engine.calculateFinancialScore(perfil, despesas, financiamentos, metas, 2026, 1);

    expect(res.details.aportes).toBe(0);         // No investments
    expect(res.details.patrimonio).toBe(0);      // 0 invested
    expect(res.details.liquidez).toBe(0);        // 0 reserve ratio
    expect(res.details.concentracao).toBe(0);    // 0 investment categories
    expect(res.details.essenciais).toBe(0);     // ratio = (2400 Moradia + 1000 Financiamento) / 3000 = 1.13 -> exceeds 100% -> 0 points
    expect(res.details.poupanca).toBe(0);        // 0 savings rate
    expect(res.details.dividas).toBe(0);         // paidOff = 0% paid off -> 0 points

    expect(res.score).toBe(0);
  });
});
