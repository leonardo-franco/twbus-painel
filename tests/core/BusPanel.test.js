/**
 * Testes para o BusPanel
 * Verifica funcionalidades principais do painel
 */

import { BusPanel } from '../src/core/BusPanel.js';

describe('BusPanel', () => {
  let busPanel;

  beforeEach(() => {
    // Mock do DOM
    document.body.innerHTML = `
      <div class="container">
        <button id="refreshBtn">Refresh</button>
        <button id="expandBtn">Expand</button>
        <div class="stop">Stop 1</div>
        <div class="stop">Stop 2</div>
        <div class="stop extra">Extra Stop</div>
        <div class="info-badge">Badge</div>
      </div>
    `;
    
    busPanel = new BusPanel();
  });

  afterEach(() => {
    if (busPanel && typeof busPanel.destroy === 'function') {
      busPanel.destroy();
    }
    global.testHelpers.clearAllMocks();
  });

  describe('Initialization', () => {
    test('deve inicializar com estado correto', () => {
      expect(busPanel.state.isExpanded).toBe(false);
      expect(busPanel.state.isAnimating).toBe(false);
      expect(busPanel.state.isInitialized).toBe(true);
    });

    test('deve cachear elementos DOM', () => {
      expect(busPanel.elements.size).toBeGreaterThan(0);
    });

    test('deve configurar event listeners', () => {
      expect(busPanel.eventIds.size).toBeGreaterThan(0);
    });
  });

  describe('Element Caching', () => {
    test('deve cachear elementos únicos', () => {
      const refreshBtn = busPanel.elements.get('refreshBtn');
      expect(refreshBtn).toBeDefined();
    });

    test('deve cachear coleções de elementos', () => {
      const stops = busPanel.elements.get('stops');
      expect(stops).toBeDefined();
    });

    test('deve lidar com elementos não encontrados', () => {
      document.body.innerHTML = '<div></div>';
      const newPanel = new BusPanel();
      
      expect(newPanel.elements.get('refreshBtn')).toBeNull();
    });
  });

  describe('Event Handling', () => {
    test('deve lidar com clique de refresh', async () => {
      const refreshBtn = busPanel.elements.get('refreshBtn');
      const mockEvent = global.testHelpers.createMockEvent('click');
      
      await busPanel.handleRefreshClick(mockEvent);
      
      expect(mockEvent.preventDefault).toHaveBeenCalled();
    });

    test('deve lidar com clique de expand', async () => {
      const mockEvent = global.testHelpers.createMockEvent('click');
      
      await busPanel.handleExpandClick(mockEvent);
      
      expect(mockEvent.preventDefault).toHaveBeenCalled();
    });

    test('deve aplicar hover effects', () => {
      const mockStop = global.testHelpers.createMockElement('div');
      const mockEvent = global.testHelpers.createMockEvent('mouseenter');
      mockEvent.currentTarget = mockStop;
      
      busPanel.handleStopHoverIn(mockEvent);
      
      expect(mockStop.style.transform).toBe('translateX(8px) scale(1.02)');
    });
  });

  describe('Panel Refresh', () => {
    test('deve atualizar painel corretamente', async () => {
      const refreshBtn = busPanel.elements.get('refreshBtn');
      
      await busPanel.refreshPanel();
      
      expect(refreshBtn.classList.remove).toHaveBeenCalledWith('refreshing');
    });

    test('deve atualizar timestamp', () => {
      const timestampElement = global.testHelpers.createMockElement('span');
      busPanel.elements.set('footerTimestamp', timestampElement);
      
      busPanel.updateTimestamp();
      
      expect(timestampElement.textContent).toContain('Atualizado:');
    });
  });

  describe('Expand/Collapse', () => {
    test('deve expandir painel', async () => {
      const container = global.testHelpers.createMockElement('div');
      const expandBtn = global.testHelpers.createMockElement('button');
      
      busPanel.elements.set('container', container);
      busPanel.elements.set('expandBtn', expandBtn);
      
      await busPanel.expandPanel(container, expandBtn);
      
      expect(container.classList.add).toHaveBeenCalledWith('expanded');
    });

    test('deve recolher painel', async () => {
      const container = global.testHelpers.createMockElement('div');
      const expandBtn = global.testHelpers.createMockElement('button');
      
      busPanel.elements.set('container', container);
      busPanel.elements.set('expandBtn', expandBtn);
      
      await busPanel.collapsePanel(container, expandBtn);
      
      expect(container.classList.remove).toHaveBeenCalledWith('expanded');
    });

    test('deve alternar estado corretamente', async () => {
      const container = global.testHelpers.createMockElement('div');
      const expandBtn = global.testHelpers.createMockElement('button');
      
      busPanel.elements.set('container', container);
      busPanel.elements.set('expandBtn', expandBtn);
      
      const initialState = busPanel.state.isExpanded;
      
      await busPanel.toggleExpanded();
      
      expect(busPanel.state.isExpanded).toBe(!initialState);
    });
  });

  describe('Error Handling', () => {
    test('deve tratar erro de segurança', () => {
      const SecurityError = class extends Error {
        constructor(message) {
          super(message);
          this.name = 'SecurityError';
        }
      };
      
      const error = new SecurityError('Test error');
      
      busPanel.handleError(error);
      
      expect(document.body.classList.add).toHaveBeenCalledWith('security-error');
    });

    test('deve tratar erro genérico', () => {
      const error = new Error('Generic error');
      
      busPanel.handleError(error);
      
      expect(document.body.classList.add).toHaveBeenCalledWith('error-state');
    });
  });

  describe('State Management', () => {
    test('deve retornar estado atual', () => {
      const state = busPanel.getState();
      
      expect(state).toHaveProperty('isExpanded');
      expect(state).toHaveProperty('isAnimating');
      expect(state).toHaveProperty('isInitialized');
      expect(state).toHaveProperty('elementsCount');
    });

    test('deve atualizar lastUpdate', async () => {
      const initialUpdate = busPanel.state.lastUpdate;
      
      await global.testHelpers.delay(10);
      await busPanel.refreshPanel();
      
      expect(busPanel.state.lastUpdate).not.toBe(initialUpdate);
    });
  });

  describe('Cleanup', () => {
    test('deve limpar recursos na destruição', () => {
      const initialEventIds = busPanel.eventIds.size;
      const initialElements = busPanel.elements.size;
      
      busPanel.destroy();
      
      expect(busPanel.eventIds.size).toBe(0);
      expect(busPanel.elements.size).toBe(0);
      expect(busPanel.state.isInitialized).toBe(false);
    });
  });
});
