import { describe, it, expect, vi, beforeEach } from 'vitest';
import fs from 'fs';

// Mock browser globals
global.window = {
  App: {
    State: {
      getState: () => ({
        theme: "dark",
        categorias: { "Lazer": "#f43f5e" },
        llmConfig: {},
        categoriasInvestimento: []
      })
    },
    UIState: {},
    UIUtils: {
      showStatus: vi.fn()
    }
  }
};

const domElements = {
  'localstorage-usage-badge': { textContent: '' }
};

global.document = {
  createElement: vi.fn().mockImplementation((tag) => {
    return {
      tagName: tag,
      className: '',
      innerHTML: '',
      textContent: '',
      addEventListener: vi.fn(),
      appendChild: vi.fn(),
      querySelector: vi.fn().mockReturnValue({ addEventListener: vi.fn(), focus: vi.fn(), value: '' })
    };
  }),
  getElementById: vi.fn().mockImplementation((id) => {
    if (domElements[id]) return domElements[id];
    return {
      id: id,
      value: '',
      addEventListener: vi.fn(),
      appendChild: vi.fn(),
      classList: {
        add: vi.fn(),
        remove: vi.fn(),
        contains: vi.fn().mockReturnValue(false)
      },
      querySelector: vi.fn().mockReturnValue({ textContent: '' }),
      querySelectorAll: vi.fn().mockReturnValue([])
    };
  })
};

// Mock localStorage
let localStorageMock = {};
global.localStorage = new Proxy({}, {
  get(target, prop) {
    if (prop === 'getItem') return key => localStorageMock[key] || null;
    if (prop === 'setItem') return (key, val) => { localStorageMock[key] = String(val); };
    if (prop === 'removeItem') return key => { delete localStorageMock[key]; };
    if (prop === 'clear') return () => { localStorageMock = {}; };
    if (prop === 'hasOwnProperty') return key => Object.prototype.hasOwnProperty.call(localStorageMock, key);
    if (prop === 'length') return Object.keys(localStorageMock).length;
    return localStorageMock[prop];
  },
  set(target, prop, value) {
    localStorageMock[prop] = String(value);
    return true;
  },
  ownKeys(target) {
    return Object.keys(localStorageMock);
  },
  getOwnPropertyDescriptor(target, prop) {
    return {
      enumerable: true,
      configurable: true
    };
  }
});

describe('UI Settings localStorage badge', () => {
  beforeEach(() => {
    localStorageMock = {};
    domElements['localstorage-usage-badge'].textContent = '';
  });

  it('should compute and show localStorage usage correctly', () => {
    // Populate mock localStorage with about 0.5 MB of data
    // 0.5 MB = 524288 characters
    const dummyData = 'A'.repeat(524200);
    global.localStorage['dummy-key'] = dummyData;

    // Load ui-settings.js
    const engineCode = fs.readFileSync('js/ui-settings.js', 'utf8');
    eval(engineCode);

    const UISettings = global.window.App.UISettings;
    UISettings.mapElements({
      LOCALSTORAGE_USAGE_BADGE: 'localstorage-usage-badge',
      SETTINGS_CONTAINER: 'settings-container'
    });

    UISettings.render(global.window.App.State.getState());

    // Expected usage: (524200 + 9) characters / (1024 * 1024) = 0.50 MB
    expect(domElements['localstorage-usage-badge'].textContent).toBe('0.50/5.0 mb');
  });
});
