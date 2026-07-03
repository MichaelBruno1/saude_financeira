import { describe, it, expect, vi } from 'vitest';
import fs from 'fs';

// Mock browser globals
global.window = {
  App: {
    State: {
      getState: () => ({ llmConfig: { apiUrl: "", apiKey: "", model: "" } }),
      subscribe: vi.fn(),
      atualizarLlmConfig: vi.fn()
    },
    LlmConfig: { apiUrl: "http://static", apiKey: "static-key", model: "static-model" }
  }
};

const domElements = {
  'llm-settings-form': {
    addEventListener: vi.fn(),
    id: 'llm-settings-form'
  },
  'settings-llm-url': { value: 'http://custom-url' },
  'settings-llm-key': { value: 'custom-key' },
  'settings-llm-model': { value: 'custom-model' },
  'sync-status': { classList: { add: vi.fn(), remove: vi.fn() }, className: '' }
};

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
      querySelector: vi.fn().mockReturnValue({ textContent: '' })
    };
  })
};

describe('UI Event Handling for LLM Settings', () => {
  it('should register submit event and call atualizarLlmConfig on submit', () => {
    // Load ui.js code
    const uiCode = fs.readFileSync('js/ui.js', 'utf8');
    eval(uiCode); // defines window.App.UI

    const ui = window.App.UI;
    ui.init();

    // Verify DOM cached variables
    expect(global.document.getElementById).toHaveBeenCalledWith('llm-settings-form');
    expect(global.document.getElementById).toHaveBeenCalledWith('settings-llm-url');

    // Get the registered submit callback
    const submitForm = domElements['llm-settings-form'];
    expect(submitForm.addEventListener).toHaveBeenCalledWith('submit', expect.any(Function));

    const submitCallback = submitForm.addEventListener.mock.calls.find(call => call[0] === 'submit')[1];
    
    // Call the callback
    const mockEvent = { preventDefault: vi.fn() };
    submitCallback(mockEvent);

    expect(mockEvent.preventDefault).toHaveBeenCalled();
    expect(window.App.State.atualizarLlmConfig).toHaveBeenCalledWith(
      'http://custom-url',
      'custom-key',
      'custom-model'
    );
  });
});
