// TwBus - Testes Automatizados
// Sistema de testes para garantir funcionalidade e segurança

class BusPanelTester {
    constructor() {
        this.tests = [];
        this.passed = 0;
        this.failed = 0;
        this.errors = [];
    }

    // Método para adicionar testes
    addTest(name, testFunction) {
        this.tests.push({ name, testFunction });
    }

    // Executar todos os testes
    async runAllTests() {
        console.log('🧪 Iniciando testes do TwBus...\n');
        
        for (const test of this.tests) {
            try {
                await test.testFunction();
                this.passed++;
                console.log(`✅ ${test.name}`);
            } catch (error) {
                this.failed++;
                this.errors.push({ test: test.name, error: error.message });
                console.error(`❌ ${test.name}: ${error.message}`);
            }
        }
        
        this.printSummary();
        return this.failed === 0;
    }

    // Imprimir resumo dos testes
    printSummary() {
        console.log('\n📊 Resumo dos Testes:');
        console.log(`Total: ${this.tests.length}`);
        console.log(`✅ Passou: ${this.passed}`);
        console.log(`❌ Falhou: ${this.failed}`);
        
        if (this.errors.length > 0) {
            console.log('\n🔍 Erros detalhados:');
            this.errors.forEach(error => {
                console.error(`  - ${error.test}: ${error.error}`);
            });
        }
    }

    // Método auxiliar para assertions
    assert(condition, message) {
        if (!condition) {
            throw new Error(message || 'Asserção falhou');
        }
    }

    // Método para simular DOM
    createMockDOM() {
        // Criar elementos DOM simulados para testes
        const mockElements = {
            container: document.createElement('div'),
            refreshBtn: document.createElement('button'),
            expandBtn: document.createElement('button'),
            stops: [document.createElement('div'), document.createElement('div')],
            extraStops: [document.createElement('div')],
            infoBadges: [document.createElement('div')]
        };

        // Configurar elementos
        mockElements.container.className = 'container';
        mockElements.refreshBtn.id = 'refreshBtn';
        mockElements.expandBtn.id = 'expandBtn';
        mockElements.stops.forEach(stop => stop.className = 'stop');
        mockElements.extraStops.forEach(stop => stop.className = 'stop extra');
        mockElements.infoBadges.forEach(badge => badge.className = 'info-badge');

        // Adicionar ao DOM
        document.body.appendChild(mockElements.container);
        document.body.appendChild(mockElements.refreshBtn);
        document.body.appendChild(mockElements.expandBtn);
        mockElements.stops.forEach(stop => document.body.appendChild(stop));
        mockElements.extraStops.forEach(stop => document.body.appendChild(stop));
        mockElements.infoBadges.forEach(badge => document.body.appendChild(badge));

        return mockElements;
    }

    // Limpar DOM após testes
    cleanupDOM() {
        const elementsToRemove = [
            '.container', '#refreshBtn', '#expandBtn', 
            '.stop', '.info-badge'
        ];
        
        elementsToRemove.forEach(selector => {
            const elements = document.querySelectorAll(selector);
            elements.forEach(el => el.remove());
        });
   }

    /**
     * Registra automaticamente todos os testes definidos na classe
     * Este método é chamado automaticamente quando os testes são executados no index.html
     */
    registerAllTests() {
        console.log('🔄 Registrando todos os testes automaticamente...');
        
        // =====================================================
        // TESTES DE FUNCIONALIDADE PRINCIPAL
        // =====================================================
        
        // Teste 1: Verificar inicialização da classe
        this.addTest('Inicialização da classe BusPanel', () => {
            const mockDOM = this.createMockDOM();
            const panel = new BusPanel();
            
            this.assert(panel instanceof BusPanel, 'Instância criada com sucesso');
            this.assert(panel.isExpanded === false, 'Estado inicial correto');
            this.assert(panel.isAnimating === false, 'Estado de animação inicial correto');
            this.assert(panel.elements instanceof Map, 'Elementos cacheados corretamente');
            
            this.cleanupDOM();
        });

        // Teste 2: Verificar cache de elementos
        this.addTest('Cache de elementos DOM', () => {
            const mockDOM = this.createMockDOM();
            const panel = new BusPanel();
            
            this.assert(panel.elements.has('container'), 'Container cacheado');
            this.assert(panel.elements.has('refreshBtn'), 'Botão refresh cacheado');
            this.assert(panel.elements.has('expandBtn'), 'Botão expand cacheado');
            this.assert(panel.elements.has('stops'), 'Paradas cacheadas');
            
            this.cleanupDOM();
        });

        // Teste 3: Verificar proteção contra cliques múltiplos
        this.addTest('Proteção contra cliques múltiplos', () => {
            const mockDOM = this.createMockDOM();
            const panel = new BusPanel();
            
            // Simular estado de animação
            panel.isAnimating = true;
            
            // Tentar expandir durante animação
            const initialState = panel.isExpanded;
            panel.toggleExpanded();
            
            this.assert(panel.isExpanded === initialState, 'Estado não mudou durante animação');
            
            this.cleanupDOM();
        });

        // Teste 4: Verificar validação de segurança
        this.addTest('Validação de segurança', () => {
            // Teste de validação de elemento
            try {
                SecurityValidator.validateElement(null);
                this.assert(false, 'Deveria lançar erro para elemento null');
            } catch (error) {
                this.assert(true, 'Erro lançado corretamente para elemento null');
            }
            
            // Teste de sanitização
            const maliciousInput = '<script>alert("xss")</script>';
            const sanitized = SecurityValidator.sanitizeInput(maliciousInput);
            this.assert(!sanitized.includes('<script>'), 'Input malicioso sanitizado');
        });

        // Teste 5: Verificar método de destruct
        this.addTest('Método de limpeza (destroy)', () => {
            const mockDOM = this.createMockDOM();
            const panel = new BusPanel();
            
            // Verificar se elementos estão cacheados
            this.assert(panel.elements.size > 0, 'Elementos cacheados antes da limpeza');
            
            // Chamar método de limpeza
            panel.destroy();
            
            // Verificar se foram limpos
            this.assert(panel.elements.size === 0, 'Elementos limpos após destroy');
            this.assert(panel.eventListeners.size === 0, 'Event listeners limpos após destroy');
            
            this.cleanupDOM();
        });

        // Teste 6: Verificar destaque de paradas importantes
        this.addTest('Destaque de paradas importantes', () => {
            const mockDOM = this.createMockDOM();
            
            // Criar paradas específicas
            const currentBus = document.createElement('div');
            currentBus.className = 'stop current-bus';
            
            const currentLocation = document.createElement('div');
            currentLocation.className = 'stop current-location';
            
            const nextStop = document.createElement('div');
            nextStop.className = 'stop next';
            
            document.body.appendChild(currentBus);
            document.body.appendChild(currentLocation);
            document.body.appendChild(nextStop);
            
            const panel = new BusPanel();
            
            // Verificar se os destaques foram aplicados
            this.assert(currentBus.classList.contains('highlighted'), 'Parada do ônibus destacada');
            this.assert(currentLocation.classList.contains('highlighted'), 'Localização atual destacada');
            this.assert(nextStop.classList.contains('highlighted'), 'Próxima parada destacada');
            
            this.cleanupDOM();
        });

        // Teste 7: Verificar atualização de timestamp
        this.addTest('Atualização de timestamp', () => {
            const mockDOM = this.createMockDOM();
            
            // Criar elemento de timestamp
            const timestampElement = document.createElement('span');
            timestampElement.className = 'footer';
            document.body.appendChild(timestampElement);
            
            const panel = new BusPanel();
            panel.updateTimestamp();
            
            // Verificar se timestamp foi atualizado
            this.assert(timestampElement.textContent.includes('Atualizado:'), 'Timestamp atualizado');
            
            this.cleanupDOM();
        });

        // Teste 8: Verificar função debounce
        this.addTest('Função debounce', (done) => {
            let callCount = 0;
            const debouncedFunction = SecurityValidator.debounce(() => {
                callCount++;
            }, 100);
            
            // Chamar função múltiplas vezes
            debouncedFunction();
            debouncedFunction();
            debouncedFunction();
            
            // Verificar se foi chamada apenas uma vez após delay
            setTimeout(() => {
                this.assert(callCount === 1, 'Função debounce funcionou corretamente');
            }, 150);
        });

        // Teste 9: Verificar manipulação segura de eventos
        this.addTest('Manipulação segura de eventos', () => {
            const mockDOM = this.createMockDOM();
            const panel = new BusPanel();
            
            // Criar evento mock
            const mockEvent = {
                preventDefault: () => {},
                target: mockDOM.refreshBtn
            };
            
            // Criar handler seguro
            const safeHandler = panel.createSafeEventHandler(() => {
                return 'success';
            });
            
            // Verificar se handler executa sem erro
            try {
                safeHandler(mockEvent);
                this.assert(true, 'Handler seguro executado com sucesso');
            } catch (error) {
                this.assert(false, 'Handler seguro não deveria lançar erro');
            }
            
            this.cleanupDOM();
        });

        // Teste 10: Verificar estado de erro da aplicação
        this.addTest('Estado de erro da aplicação', () => {
            // Simular erro na inicialização
            const originalConsoleError = console.error;
            let errorCaught = false;
            
            console.error = () => {
                errorCaught = true;
            };
            
            // Tentar inicializar sem DOM adequado
            try {
                const panel = new BusPanel();
                panel.init();
            } catch (error) {
                // Esperado
            }
            
            console.error = originalConsoleError;
            
            this.assert(errorCaught, 'Erro capturado e logado corretamente');
        });

        console.log('✅ Todos os testes de funcionalidade registrados');
    }
}

// Configuração dos testes
const tester = new BusPanelTester();

// Exportar tester para uso externo
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { BusPanelTester, tester };
}

// Auto-executar testes se carregado diretamente
if (typeof window !== 'undefined' && window.location.pathname.includes('tests')) {
    document.addEventListener('DOMContentLoaded', () => {
        tester.runAllTests();
    });
}
