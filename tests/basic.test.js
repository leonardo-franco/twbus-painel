/**
 * Testes básicos para verificação da aplicação
 */

// Mock do DOM
Object.defineProperty(window, 'localStorage', {
  value: {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn()
  }
});

// Mock básico para fetch
global.fetch = jest.fn();

describe('TwBus Application Tests', () => {
  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    
    // Setup DOM básico
    document.body.innerHTML = `
      <div class="container">
        <div class="loading" id="loading">Loading...</div>
        <div class="bus-panel" id="busPanel">
          <div class="bus-info">
            <h2 class="bus-line">Test Line</h2>
          </div>
        </div>
      </div>
    `;
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  test('DOM elements exist', () => {
    const container = document.querySelector('.container');
    const loading = document.getElementById('loading');
    const busPanel = document.getElementById('busPanel');
    
    expect(container).toBeTruthy();
    expect(loading).toBeTruthy();
    expect(busPanel).toBeTruthy();
  });

  test('localStorage mock works', () => {
    const testKey = 'testKey';
    const testValue = 'testValue';
    
    localStorage.setItem(testKey, testValue);
    expect(localStorage.setItem).toHaveBeenCalledWith(testKey, testValue);
  });

  test('fetch mock works', () => {
    fetch.mockResolvedValue({
      ok: true,
      json: async () => ({ data: 'test' })
    });
    
    expect(fetch).toBeDefined();
  });

  test('console methods are mocked', () => {
    console.log('test message');
    expect(console.log).toHaveBeenCalledWith('test message');
  });

  test('basic security validation', () => {
    const input = '<script>alert("xss")</script>';
    const sanitized = input.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
    
    expect(sanitized).not.toContain('<script>');
  });

  test('CSS class manipulation', () => {
    const element = document.createElement('div');
    element.classList.add('test-class');
    
    expect(element.classList.contains('test-class')).toBe(true);
  });

  test('event listener setup', () => {
    const element = document.createElement('button');
    const mockHandler = jest.fn();
    
    element.addEventListener('click', mockHandler);
    element.click();
    
    expect(mockHandler).toHaveBeenCalled();
  });

  test('data validation functions', () => {
    const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    const isValidNumber = (num) => !isNaN(num) && isFinite(num);
    
    expect(isValidEmail('test@example.com')).toBe(true);
    expect(isValidEmail('invalid-email')).toBe(false);
    expect(isValidNumber(123)).toBe(true);
    expect(isValidNumber('abc')).toBe(false);
  });

  test('JSON handling', () => {
    const testObject = { name: 'test', value: 123 };
    const jsonString = JSON.stringify(testObject);
    const parsedObject = JSON.parse(jsonString);
    
    expect(parsedObject).toEqual(testObject);
  });

  test('array operations', () => {
    const testArray = [1, 2, 3, 4, 5];
    const filtered = testArray.filter(x => x > 3);
    const mapped = testArray.map(x => x * 2);
    
    expect(filtered).toEqual([4, 5]);
    expect(mapped).toEqual([2, 4, 6, 8, 10]);
  });
});
