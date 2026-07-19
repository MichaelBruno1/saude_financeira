import { describe, it, expect, vi, beforeEach } from 'vitest';
import fs from 'fs';

// Mock state and global window
global.window = {
  App: {
    UIUtils: {
      formatCurrency: (val) => `R$ ${val.toFixed(2)}`,
      formatBRLInput: (val) => val,
      parseBRLValue: (val) => parseFloat(val),
      showStatus: vi.fn()
    }
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

describe('Metas Feature State Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.window.localStorage = {
      getItem: vi.fn().mockReturnValue(null),
      setItem: vi.fn()
    };
    
    // Load state.js in global context
    const stateCode = fs.readFileSync('js/state.js', 'utf8');
    eval(stateCode);
  });

  it('should successfully add a meta, set baseline and calculate targets', () => {
    const State = global.window.App.State;
    
    // Add profile
    State.adicionarPerfil("Michael", 5000);
    
    // Add an investment despesa so we have some investment
    State.adicionarDespesa("CDB", 1000, "Investimento", 1, 1, false, 2026, "CDB");
    
    // Initially metas is empty and baseline is null
    let state = State.getState();
    expect(state.metas).toEqual([]);
    let activeProfile = state.perfis.find(p => p.nome === "Michael");
    expect(activeProfile.metaBaseline).toBeNull();

    // Add first meta (value 2000)
    State.adicionarMeta("Celular", 2000, "");
    
    state = State.getState();
    expect(state.metas.length).toBe(1);
    expect(state.metas[0].nome).toBe("Celular");
    expect(state.metas[0].valor).toBe(2000);
    expect(state.metas[0].comprado).toBe(false);
    
    // Baseline should capture totalInvested (1000)
    activeProfile = state.perfis.find(p => p.nome === "Michael");
    expect(activeProfile.metaBaseline).toBe(1000);
    
    // Target should be baseline + valor = 1000 + 2000 = 3000
    expect(state.metas[0].valorTarget).toBe(3000);

    // Add second meta (value 1500)
    State.adicionarMeta("Roupa", 1500, "");
    state = State.getState();
    expect(state.metas.length).toBe(2);
    // Target should be baseline + sum(values) = 1000 + 2000 + 1500 = 4500
    expect(state.metas[1].valorTarget).toBe(4500);
  });

  it('should adjust targets and baseline on buying a meta', () => {
    const State = global.window.App.State;
    State.adicionarPerfil("Michael", 5000);
    State.adicionarDespesa("CDB", 1000, "Investimento", 1, 1, false, 2026, "CDB");

    // Add 2 metas
    const m1 = State.adicionarMeta("Celular", 2000, "");
    const m2 = State.adicionarMeta("Viagem", 5000, "");

    let state = State.getState();
    expect(state.metas[0].valorTarget).toBe(3000);
    expect(state.metas[1].valorTarget).toBe(8000);

    // Buy first meta
    State.comprarMeta(m1.id);

    state = State.getState();
    expect(state.metas.find(m => m.id === m1.id).comprado).toBe(true);

    // Baseline should increment by purchased item's value (1000 + 2000 = 3000)
    const activeProfile = state.perfis.find(p => p.nome === "Michael");
    expect(activeProfile.metaBaseline).toBe(3000);

    // Remaining active meta (Viagem) target should be recalculated based on new baseline:
    // new target = new baseline + value = 3000 + 5000 = 8000. (Stays 8000!)
    expect(state.metas.find(m => m.id === m2.id).valorTarget).toBe(8000);
  });

  it('should reorder metas and recalculate targets based on new priority', () => {
    const State = global.window.App.State;
    State.adicionarPerfil("Michael", 5000);
    State.adicionarDespesa("CDB", 1000, "Investimento", 1, 1, false, 2026, "CDB");

    const m1 = State.adicionarMeta("Celular", 2000, ""); // idx 0, val 2000
    const m2 = State.adicionarMeta("Viagem", 5000, "");  // idx 1, val 5000

    let state = State.getState();
    expect(state.metas[0].valorTarget).toBe(3000); // 1000 + 2000
    expect(state.metas[1].valorTarget).toBe(8000); // 1000 + 2000 + 5000

    // Reorder: Viagem first, then Celular
    State.reordenarMetas([m2.id, m1.id]);

    state = State.getState();
    const sortedMetas = state.metas.sort((a, b) => a.prioridade - b.prioridade);
    expect(sortedMetas[0].nome).toBe("Viagem");
    expect(sortedMetas[1].nome).toBe("Celular");

    // Targets should be recalculated:
    // Viagem (first): baseline (1000) + value (5000) = 6000
    // Celular (second): baseline (1000) + Viagem (5000) + Celular (2000) = 8000
    expect(sortedMetas[0].valorTarget).toBe(6000);
    expect(sortedMetas[1].valorTarget).toBe(8000);
  });

  it('should remove metas and adjust active metas indexes and targets', () => {
    const State = global.window.App.State;
    State.adicionarPerfil("Michael", 5000);
    State.adicionarDespesa("CDB", 1000, "Investimento", 1, 1, false, 2026, "CDB");

    const m1 = State.adicionarMeta("Celular", 2000, "");
    const m2 = State.adicionarMeta("Viagem", 5000, "");

    // Remove m1 (Celular)
    State.removerMeta(m1.id);

    const state = State.getState();
    expect(state.metas.length).toBe(1);
    expect(state.metas[0].nome).toBe("Viagem");
    // Priority of Viagem should become 0
    expect(state.metas[0].prioridade).toBe(0);
    // Target should be baseline (1000) + value (5000) = 6000
    expect(state.metas[0].valorTarget).toBe(6000);
  });
});
