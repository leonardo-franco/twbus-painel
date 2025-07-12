// TwBus Panel Tester v1.2.0
// Sistema de testes de segurança e funcionalidade

class BusPanelTester {
    constructor() {
        this.tests = new Map();
        this.results = [];
        this.passedTests = 0;
        this.totalTests = 0;
    }

    // Registrar um teste
    registerTest(name, testFunction, description = '') {
        this.tests.set(name, {
            fn: testFunction,
            description: description,
            category: 'general'
        });
    }

    // Executar todos os testes
    async runAllTests() {
        console.log('🧪 Executando testes de segurança...');
        this.results = [];
        this.passedTests = 0;
        this.totalTests = this.tests.size;

        for (const [name, test] of this.tests) {
            try {
                const result = await test.fn();
                if (result) {
                    this.passedTests++;
                    console.log(`✅ ${name}: PASSOU`);
                } else {
                    console.warn(`⚠️ ${name}: FALHOU`);
                }
                this.results.push({ name, passed: result, error: null });
            } catch (error) {
                console.error(`❌ ${name}: ERRO - ${error.message}`);
                this.results.push({ name, passed: false, error: error.message });
            }
        }

        const success = this.passedTests === this.totalTests;
        console.log(`\n📊 Resultado: ${this.passedTests}/${this.totalTests} testes passaram`);
        
        return success;
    }

    // Registrar todos os testes padrão
    registerAllTests() {
        // Teste de elementos HTML
        this.registerTest('DOM Elements', () => {
            const requiredElements = ['adminBtn', 'refreshBtn', 'expandBtn'];
            return requiredElements.every(id => document.getElementById(id) !== null);
        }, 'Verifica se elementos essenciais existem');

        // Teste de CSS
        this.registerTest('CSS Loaded', () => {
            const testElement = document.createElement('div');
            testElement.className = 'container';
            document.body.appendChild(testElement);
            const styles = window.getComputedStyle(testElement);
            const hasStyles = styles.background && styles.background !== 'rgba(0, 0, 0, 0)';
            document.body.removeChild(testElement);
            return hasStyles;
        }, 'Verifica se o CSS está carregado');

        // Teste de Service Worker
        this.registerTest('Service Worker', () => {
            return 'serviceWorker' in navigator;
        }, 'Verifica suporte ao Service Worker');

        // Teste de PWA
        this.registerTest('PWA Support', () => {
            return 'BeforeInstallPromptEvent' in window || 
                   window.matchMedia('(display-mode: standalone)').matches;
        }, 'Verifica suporte a PWA');

        // Teste de localStorage
        this.registerTest('LocalStorage', () => {
            try {
                localStorage.setItem('test', 'value');
                const result = localStorage.getItem('test') === 'value';
                localStorage.removeItem('test');
                return result;
            } catch {
                return false;
            }
        }, 'Verifica acesso ao localStorage');
    }

    // Obter relatório de testes
    getTestReport() {
        return {
            total: this.totalTests,
            passed: this.passedTests,
            failed: this.totalTests - this.passedTests,
            results: this.results,
            success: this.passedTests === this.totalTests
        };
    }
}

// Exportar para uso global
if (typeof window !== 'undefined') {
    window.BusPanelTester = BusPanelTester;
}

console.log('✅ Sistema de testes carregado');
