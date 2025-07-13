/**
 * Configuração inicial para testes Jest
 * Setup global para ambiente de teste
 */

// Configuração de mocks globais
global.console = {
  ...console,
  // Silenciar logs durante testes, mas manter errors
  log: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: console.error
};

// Mock do localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn()
};
global.localStorage = localStorageMock;

// Mock do sessionStorage
const sessionStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn()
};
global.sessionStorage = sessionStorageMock;

// Mock de APIs do navegador
global.fetch = jest.fn();
global.navigator = {
  ...global.navigator,
  serviceWorker: {
    register: jest.fn(),
    ready: Promise.resolve({
      update: jest.fn()
    })
  },
  userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
};

// Mock de window APIs
global.window = {
  ...global.window,
  location: {
    href: 'https://twbus.vercel.app',
    reload: jest.fn()
  },
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
  alert: jest.fn(),
  confirm: jest.fn(),
  prompt: jest.fn()
};

// Mock de document APIs
global.document = {
  ...global.document,
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
  querySelector: jest.fn(),
  querySelectorAll: jest.fn(() => []),
  getElementById: jest.fn(),
  createElement: jest.fn(() => ({
    setAttribute: jest.fn(),
    getAttribute: jest.fn(),
    appendChild: jest.fn(),
    removeChild: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    style: {},
    classList: {
      add: jest.fn(),
      remove: jest.fn(),
      contains: jest.fn(),
      toggle: jest.fn()
    }
  })),
  body: {
    appendChild: jest.fn(),
    removeChild: jest.fn(),
    classList: {
      add: jest.fn(),
      remove: jest.fn(),
      contains: jest.fn(),
      toggle: jest.fn()
    }
  }
};

// Mock de APIs de cache
global.caches = {
  open: jest.fn(),
  keys: jest.fn(() => Promise.resolve([])),
  delete: jest.fn()
};

// Mock de IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
};

// Mock de ResizeObserver
global.ResizeObserver = class ResizeObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
};

// Mock de MutationObserver
global.MutationObserver = class MutationObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  takeRecords() { return []; }
};

// Configuração de timeout personalizado
jest.setTimeout(10000);

// Configuração de helpers para testes
global.testHelpers = {
  // Helper para criar elementos DOM mock
  createMockElement: (tag = 'div', attributes = {}) => {
    const element = {
      tagName: tag.toUpperCase(),
      setAttribute: jest.fn(),
      getAttribute: jest.fn(),
      hasAttribute: jest.fn(),
      removeAttribute: jest.fn(),
      appendChild: jest.fn(),
      removeChild: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      click: jest.fn(),
      focus: jest.fn(),
      blur: jest.fn(),
      style: {},
      classList: {
        add: jest.fn(),
        remove: jest.fn(),
        contains: jest.fn(() => false),
        toggle: jest.fn()
      },
      children: [],
      parentNode: null,
      ...attributes
    };
    
    // Simular propriedades comuns
    Object.defineProperty(element, 'textContent', {
      get: jest.fn(() => ''),
      set: jest.fn()
    });
    
    Object.defineProperty(element, 'innerHTML', {
      get: jest.fn(() => ''),
      set: jest.fn()
    });
    
    return element;
  },
  
  // Helper para simular eventos
  createMockEvent: (type, properties = {}) => ({
    type,
    preventDefault: jest.fn(),
    stopPropagation: jest.fn(),
    stopImmediatePropagation: jest.fn(),
    target: null,
    currentTarget: null,
    bubbles: true,
    cancelable: true,
    defaultPrevented: false,
    ...properties
  }),
  
  // Helper para delay em testes
  delay: (ms) => new Promise(resolve => setTimeout(resolve, ms)),
  
  // Helper para limpar mocks
  clearAllMocks: () => {
    jest.clearAllMocks();
    localStorageMock.getItem.mockClear();
    localStorageMock.setItem.mockClear();
    localStorageMock.removeItem.mockClear();
    localStorageMock.clear.mockClear();
    sessionStorageMock.getItem.mockClear();
    sessionStorageMock.setItem.mockClear();
    sessionStorageMock.removeItem.mockClear();
    sessionStorageMock.clear.mockClear();
  }
};

// Configuração de matchers customizados
expect.extend({
  toBeValidElement(received) {
    const pass = received && 
                 typeof received === 'object' &&
                 received.tagName &&
                 typeof received.setAttribute === 'function';
    
    if (pass) {
      return {
        message: () => `expected ${received} not to be a valid element`,
        pass: true
      };
    } else {
      return {
        message: () => `expected ${received} to be a valid element`,
        pass: false
      };
    }
  }
});

// Configuração de cleanup após cada teste
afterEach(() => {
  global.testHelpers.clearAllMocks();
});

// Configuração de setup antes de todos os testes
beforeAll(() => {
  // Configurações globais que persistem durante toda a suíte
  process.env.NODE_ENV = 'test';
});

// Configuração de teardown após todos os testes
afterAll(() => {
  // Limpeza final
  jest.clearAllTimers();
  jest.useRealTimers();
});
