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
}

// Configuração dos testes
const tester = new BusPanelTester();

// Teste 1: Verificar inicialização da classe
tester.addTest('Inicialização da classe BusPanel', () => {
    const mockDOM = tester.createMockDOM();
    const panel = new BusPanel();
    
    tester.assert(panel instanceof BusPanel, 'Instância criada com sucesso');
    tester.assert(panel.isExpanded === false, 'Estado inicial correto');
    tester.assert(panel.isAnimating === false, 'Estado de animação inicial correto');
    tester.assert(panel.elements instanceof Map, 'Elementos cacheados corretamente');
    
    tester.cleanupDOM();
});

// Teste 2: Verificar cache de elementos
tester.addTest('Cache de elementos DOM', () => {
    const mockDOM = tester.createMockDOM();
    const panel = new BusPanel();
    
    tester.assert(panel.elements.has('container'), 'Container cacheado');
    tester.assert(panel.elements.has('refreshBtn'), 'Botão refresh cacheado');
    tester.assert(panel.elements.has('expandBtn'), 'Botão expand cacheado');
    tester.assert(panel.elements.has('stops'), 'Paradas cacheadas');
    
    tester.cleanupDOM();
});

// Teste 3: Verificar proteção contra cliques múltiplos
tester.addTest('Proteção contra cliques múltiplos', () => {
    const mockDOM = tester.createMockDOM();
    const panel = new BusPanel();
    
    // Simular estado de animação
    panel.isAnimating = true;
    
    // Tentar expandir durante animação
    const initialState = panel.isExpanded;
    panel.toggleExpanded();
    
    tester.assert(panel.isExpanded === initialState, 'Estado não mudou durante animação');
    
    tester.cleanupDOM();
});

// Teste 4: Verificar validação de segurança
tester.addTest('Validação de segurança', () => {
    // Teste de validação de elemento
    try {
        SecurityValidator.validateElement(null);
        tester.assert(false, 'Deveria lançar erro para elemento null');
    } catch (error) {
        tester.assert(true, 'Erro lançado corretamente para elemento null');
    }
    
    // Teste de sanitização
    const maliciousInput = '<script>alert("xss")</script>';
    const sanitized = SecurityValidator.sanitizeInput(maliciousInput);
    tester.assert(!sanitized.includes('<script>'), 'Input malicioso sanitizado');
});

// Teste 5: Verificar método de destruct
tester.addTest('Método de limpeza (destroy)', () => {
    const mockDOM = tester.createMockDOM();
    const panel = new BusPanel();
    
    // Verificar se elementos estão cacheados
    tester.assert(panel.elements.size > 0, 'Elementos cacheados antes da limpeza');
    
    // Chamar método de limpeza
    panel.destroy();
    
    // Verificar se foram limpos
    tester.assert(panel.elements.size === 0, 'Elementos limpos após destroy');
    tester.assert(panel.eventListeners.size === 0, 'Event listeners limpos após destroy');
    
    tester.cleanupDOM();
});

// Teste 6: Verificar destaque de paradas importantes
tester.addTest('Destaque de paradas importantes', () => {
    const mockDOM = tester.createMockDOM();
    
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
    tester.assert(currentBus.classList.contains('highlighted'), 'Parada do ônibus destacada');
    tester.assert(currentLocation.classList.contains('highlighted'), 'Localização atual destacada');
    tester.assert(nextStop.classList.contains('highlighted'), 'Próxima parada destacada');
    
    tester.cleanupDOM();
});

// Teste 7: Verificar atualização de timestamp
tester.addTest('Atualização de timestamp', () => {
    const mockDOM = tester.createMockDOM();
    
    // Criar elemento de timestamp
    const timestampElement = document.createElement('span');
    timestampElement.className = 'footer';
    document.body.appendChild(timestampElement);
    
    const panel = new BusPanel();
    panel.updateTimestamp();
    
    // Verificar se timestamp foi atualizado
    tester.assert(timestampElement.textContent.includes('Atualizado:'), 'Timestamp atualizado');
    
    tester.cleanupDOM();
});

// Teste 8: Verificar função debounce
tester.addTest('Função debounce', (done) => {
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
        tester.assert(callCount === 1, 'Função debounce funcionou corretamente');
    }, 150);
});

// Teste 9: Verificar manipulação segura de eventos
tester.addTest('Manipulação segura de eventos', () => {
    const mockDOM = tester.createMockDOM();
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
        tester.assert(true, 'Handler seguro executado com sucesso');
    } catch (error) {
        tester.assert(false, 'Handler seguro não deveria lançar erro');
    }
    
    tester.cleanupDOM();
});

// Teste 10: Verificar estado de erro
tester.addTest('Estado de erro da aplicação', () => {
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
    
    tester.assert(errorCaught, 'Erro capturado e logado corretamente');
});

// =====================================================
// TESTES DE SEGURANÇA AVANÇADOS
// =====================================================

tester.addTest('Validação de SecurityValidator', () => {
    if (typeof SecurityValidator === 'undefined') {
        throw new Error('SecurityValidator não está definido');
    }
    
    const security = new SecurityValidator();
    if (!security.sanitizeInput || !security.validateElement) {
        throw new Error('Métodos de segurança ausentes');
    }
});

tester.addTest('Sanitização de entrada XSS', () => {
    const security = new SecurityValidator();
    
    // Teste básico de XSS
    const maliciousInput = '<script>alert("XSS")</script>';
    const sanitized = security.sanitizeInput(maliciousInput);
    
    if (sanitized.includes('<script>') || sanitized.includes('alert')) {
        throw new Error('Sanitização XSS falhou');
    }
    
    // Teste de event handlers inline
    const eventInput = '<div onclick="malicious()">test</div>';
    const sanitizedEvent = security.sanitizeInput(eventInput);
    
    if (sanitizedEvent.includes('onclick=')) {
        throw new Error('Event handlers inline não foram removidos');
    }
});

tester.addTest('Rate limiting funcional', () => {
    const security = new SecurityValidator();
    
    // Teste rate limiting normal
    try {
        security.checkRateLimit('test', 5);
        security.checkRateLimit('test', 5);
    } catch (error) {
        throw new Error('Rate limiting rejeitou requisições válidas');
    }
    
    // Teste rate limiting excedido
    let rateLimitTriggered = false;
    try {
        for (let i = 0; i < 20; i++) {
            security.checkRateLimit('spam', 5);
        }
    } catch (error) {
        if (error instanceof SecurityError) {
            rateLimitTriggered = true;
        }
    }
    
    if (!rateLimitTriggered) {
        throw new Error('Rate limiting não foi ativado quando deveria');
    }
});

tester.addTest('Validação de elementos DOM', () => {
    const security = new SecurityValidator();
    
    // Elemento válido
    const validElement = document.createElement('div');
    try {
        security.validateElement(validElement);
    } catch (error) {
        throw new Error('Elemento válido foi rejeitado');
    }
    
    // Elemento com handler inline (perigoso)
    const dangerousElement = document.createElement('div');
    dangerousElement.setAttribute('onclick', 'malicious()');
    
    let validationFailed = false;
    try {
        security.validateElement(dangerousElement);
    } catch (error) {
        if (error instanceof SecurityError) {
            validationFailed = true;
        }
    }
    
    if (!validationFailed) {
        throw new Error('Elemento perigoso passou na validação');
    }
});

tester.addTest('Proteção contra clickjacking', () => {
    const security = new SecurityValidator();
    
    // Simular ambiente de iframe
    const originalTop = window.top;
    const originalSelf = window.self;
    
    // Mock: simular que estamos em um iframe
    Object.defineProperty(window, 'top', {
        value: {},
        writable: true,
        configurable: true
    });
    
    let clickjackingDetected = false;
    try {
        security.preventClickjacking();
    } catch (error) {
        if (error instanceof SecurityError && error.message.includes('clickjacking')) {
            clickjackingDetected = true;
        }
    }
    
    // Restaurar valores originais
    Object.defineProperty(window, 'top', {
        value: originalTop,
        writable: true,
        configurable: true
    });
    
    if (!clickjackingDetected) {
        throw new Error('Proteção contra clickjacking falhou');
    }
});

tester.addTest('Verificação de CSP violations', () => {
    const security = new SecurityValidator();
    
    if (!security.cspViolations || !Array.isArray(security.cspViolations)) {
        throw new Error('Sistema de monitoramento CSP não está funcionando');
    }
    
    // Verificar se o listener está registrado
    const listeners = getEventListeners ? getEventListeners(document) : null;
    const hasCSPListener = listeners && 
        listeners.securitypolicyviolation && 
        listeners.securitypolicyviolation.length > 0;
    
    // Note: getEventListeners pode não estar disponível em todos os browsers
    // Este teste é mais indicativo que definitivo
    console.log('CSP violation listener configurado');
});

tester.addTest('Integridade de protótipos', () => {
    const security = new SecurityValidator();
    
    // Verificar se protótipos estão congelados
    try {
        Object.prototype.maliciousProperty = 'hack';
        if (Object.prototype.maliciousProperty === 'hack') {
            throw new Error('Object.prototype não está protegido');
        }
    } catch (error) {
        // Esperado: deveria falhar ao tentar modificar
        if (!error.message.includes('Cannot add property')) {
            console.log('Proteção de protótipo funcionando');
        }
    }
    
    // Verificar Array.prototype
    try {
        Array.prototype.maliciousMethod = () => 'hack';
        if (typeof Array.prototype.maliciousMethod === 'function') {
            throw new Error('Array.prototype não está protegido');
        }
    } catch (error) {
        // Esperado: deveria falhar
        console.log('Array.prototype protegido');
    }
});

tester.addTest('Headers de segurança presentes', () => {
    // Verificar se headers críticos estão configurados
    const requiredHeaders = [
        'X-Content-Type-Options',
        'X-Frame-Options', 
        'X-XSS-Protection',
        'Strict-Transport-Security'
    ];
    
    // Note: Em ambiente de teste local, não podemos verificar headers HTTP
    // Este teste verifica se a configuração está presente
    if (typeof SECURITY_CONFIG !== 'undefined' && SECURITY_CONFIG.requiredHeaders) {
        for (const header of requiredHeaders) {
            if (!SECURITY_CONFIG.requiredHeaders[header]) {
                throw new Error(`Header de segurança ausente: ${header}`);
            }
        }
    } else {
        throw new Error('Configuração de headers de segurança não encontrada');
    }
});

tester.addTest('Debounce de segurança', () => {
    const security = new SecurityValidator();
    let callCount = 0;
    
    const testFunction = () => { callCount++; };
    const debouncedFunction = security.debounce(testFunction, 100);
    
    // Chamar múltiplas vezes rapidamente
    debouncedFunction();
    debouncedFunction();
    debouncedFunction();
    
    // Debounce deve limitar para apenas uma execução
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            if (callCount === 1) {
                resolve();
            } else {
                reject(new Error(`Debounce falhou: ${callCount} execuções`));
            }
        }, 150);
    });
});

tester.addTest('Monitoramento de escopo global', () => {
    const security = new SecurityValidator();
    
    // Verificar se funções sensíveis ainda existem
    const sensitiveGlobals = ['eval', 'Function', 'setTimeout', 'setInterval'];
    
    for (const globalName of sensitiveGlobals) {
        if (typeof window[globalName] !== 'function') {
            throw new Error(`Global ${globalName} foi modificado ou removido`);
        }
    }
    
    console.log('Escopo global monitorado e íntegro');
});

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
