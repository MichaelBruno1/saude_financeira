import { describe, it, expect, vi, beforeEach } from 'vitest';
import fs from 'fs';

// Mock browser globals
global.window = {
  App: {
    State: {
      getState: () => ({
        perfis: [{ nome: "Principal", salario: 3000.00 }],
        perfilAtivo: "Principal",
        mesAtivo: 7,
        anoAtivo: 2026,
        despesas: [
          { id: "exp-1", perfil: "Principal", descricao: "Almoço", valor: 30.00, categoria: "Alimentação", mes_inicio: 7, ano_inicio: 2026, parcelas: 1, recorrente: false }
        ],
        financiamentos: [],
        categorias: {
          "Alimentação": "#0ea5e9",
          "Lazer": "#f43f5e"
        }
      }),
      subscribe: vi.fn(),
      adicionarDespesa: vi.fn(),
      atualizarDespesa: vi.fn()
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
      appendChild: vi.fn(),
      focus: vi.fn()
    };
  }),
  createElement: vi.fn().mockImplementation((tag) => {
    return {
      tagName: tag,
      className: '',
      innerHTML: '',
      textContent: '',
      addEventListener: vi.fn(),
      appendChild: vi.fn()
    };
  })
};

describe('Financial Agent Chat Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    domElements = {
      'btn-chat-agent': { addEventListener: vi.fn() },
      'agent-chat-modal': { addEventListener: vi.fn(), classList: { add: vi.fn(), remove: vi.fn() } },
      'close-agent-chat-modal-btn': { addEventListener: vi.fn() },
      'agent-chat-messages': { appendChild: vi.fn(), scrollTop: 0, scrollHeight: 100 },
      'agent-chat-loader': { classList: { add: vi.fn(), remove: vi.fn() } },
      'agent-chat-form': { addEventListener: vi.fn() },
      'agent-chat-input': { value: '', focus: vi.fn() }
    };
  });

  it('should process adicionarDespesa action successfully when category exists', async () => {
    const files = ['ui-core.js', 'ui-expenses.js', 'ui-financing.js', 'ui-reports.js', 'ui-investments.js', 'ui-settings.js', 'ui-agent.js'];
    files.forEach(f => eval(fs.readFileSync('js/' + f, 'utf8')));

    const ui = window.App.UI;
    ui.init();

    // Verify submit listener registration
    const chatForm = domElements['agent-chat-form'];
    expect(chatForm.addEventListener).toHaveBeenCalledWith('submit', expect.any(Function));

    const submitCallback = chatForm.addEventListener.mock.calls.find(call => call[0] === 'submit')[1];

    // Mock fetch for LLM response and prompt fetching
    const mockAgentResponse = {
      message: "Adicionei a despesa de Padaria para você.",
      action: {
        type: "adicionarDespesa",
        params: {
          descricao: "Padaria",
          valor: 15.00,
          categoria: "Alimentação",
          mes_inicio: 7,
          ano_inicio: 2026,
          parcelas: 1,
          recorrente: false
        }
      }
    };

    global.fetch = vi.fn().mockImplementation((url) => {
      if (url === "prompts/agente.md") {
        return Promise.resolve({
          ok: true,
          text: async () => "Mocked Prompt Template {{PERGUNTA}}"
        });
      }
      return Promise.resolve({
        ok: true,
        json: async () => ({
          choices: [
            { message: { content: JSON.stringify(mockAgentResponse) } }
          ]
        })
      });
    });

    // Simulate input and submit
    domElements['agent-chat-input'].value = "cadastra padaria de 15 reais";
    const mockEvent = { preventDefault: vi.fn() };
    
    await submitCallback(mockEvent);

    // Verify LLM was called
    expect(global.fetch).toHaveBeenCalled();

    // Verify adicionarDespesa state mutation was called
    expect(window.App.State.adicionarDespesa).toHaveBeenCalledWith(
      "Padaria",
      15.00,
      "Alimentação",
      7,
      1,
      false,
      2026
    );

    // Verify system success message is displayed
    const appends = domElements['agent-chat-messages'].appendChild.mock.calls;
    const systemSuccess = appends.some(call => call[0].innerHTML.includes("cadastrada com sucesso"));
    expect(systemSuccess).toBe(true);
  });

  it('should block adicionarDespesa action and show error when category does not exist', async () => {
    const files = ['ui-core.js', 'ui-expenses.js', 'ui-financing.js', 'ui-reports.js', 'ui-investments.js', 'ui-settings.js', 'ui-agent.js'];
    files.forEach(f => eval(fs.readFileSync('js/' + f, 'utf8')));

    const ui = window.App.UI;
    ui.init();

    const submitCallback = domElements['agent-chat-form'].addEventListener.mock.calls.find(call => call[0] === 'submit')[1];

    // Mock agent response attempting to create category "Inexistente"
    const mockAgentResponse = {
      message: "Criando novo gasto com categoria customizada...",
      action: {
        type: "adicionarDespesa",
        params: {
          descricao: "Jogo Steam",
          valor: 80.00,
          categoria: "Jogos Eletrônicos", // category does not exist in mock state
          mes_inicio: 7,
          ano_inicio: 2026,
          parcelas: 1,
          recorrente: false
        }
      }
    };

    global.fetch = vi.fn().mockImplementation((url) => {
      if (url === "prompts/agente.md") {
        return Promise.resolve({
          ok: true,
          text: async () => "Mocked Prompt Template {{PERGUNTA}}"
        });
      }
      return Promise.resolve({
        ok: true,
        json: async () => ({
          choices: [
            { message: { content: JSON.stringify(mockAgentResponse) } }
          ]
        })
      });
    });

    domElements['agent-chat-input'].value = "cadastra jogo steam de 80 reais";
    const mockEvent = { preventDefault: vi.fn() };
    
    await submitCallback(mockEvent);

    // Should NOT call state adicionarDespesa because category is blocked
    expect(window.App.State.adicionarDespesa).not.toHaveBeenCalled();

    // Should append system error message
    const appends = domElements['agent-chat-messages'].appendChild.mock.calls;
    const systemError = appends.some(call => call[0].innerHTML.includes("O Agente não tem permissão para criar categorias"));
    expect(systemError).toBe(true);
  });

  it('should process editarDespesa action successfully using existing fields as fallbacks', async () => {
    const files = ['ui-core.js', 'ui-expenses.js', 'ui-financing.js', 'ui-reports.js', 'ui-investments.js', 'ui-settings.js', 'ui-agent.js'];
    files.forEach(f => eval(fs.readFileSync('js/' + f, 'utf8')));

    const ui = window.App.UI;
    ui.init();

    const submitCallback = domElements['agent-chat-form'].addEventListener.mock.calls.find(call => call[0] === 'submit')[1];

    // Mock agent response to edit existing "exp-1" (Almoço) to Lazer category and change value
    const mockAgentResponse = {
      message: "Editei a despesa de Almoço para você.",
      action: {
        type: "editarDespesa",
        params: {
          id: "exp-1",
          valor: 45.50,
          categoria: "Lazer" // change category from Alimentação to Lazer
        }
      }
    };

    global.fetch = vi.fn().mockImplementation((url) => {
      if (url === "prompts/agente.md") {
        return Promise.resolve({
          ok: true,
          text: async () => "Mocked Prompt Template {{PERGUNTA}}"
        });
      }
      return Promise.resolve({
        ok: true,
        json: async () => ({
          choices: [
            { message: { content: JSON.stringify(mockAgentResponse) } }
          ]
        })
      });
    });

    domElements['agent-chat-input'].value = "mude o valor do almoço para 45.50 e a categoria para Lazer";
    const mockEvent = { preventDefault: vi.fn() };
    
    await submitCallback(mockEvent);

    // Verify state mutation was called with updated fields and existing fallbacks
    // existing expense: { id: "exp-1", perfil: "Principal", descricao: "Almoço", valor: 30.00, categoria: "Alimentação", mes_inicio: 7, ano_inicio: 2026, parcelas: 1, recorrente: false }
    expect(window.App.State.atualizarDespesa).toHaveBeenCalledWith(
      "exp-1",
      "Almoço", // fallback
      45.50,    // updated
      "Lazer",  // updated
      7,        // fallback
      1,        // fallback
      false,    // fallback
      2026      // fallback
    );

    const appends = domElements['agent-chat-messages'].appendChild.mock.calls;
    const systemSuccess = appends.some(call => call[0].innerHTML.includes("atualizada com sucesso"));
    expect(systemSuccess).toBe(true);
  });
});
