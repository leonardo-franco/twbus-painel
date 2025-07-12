// =====================================================
// SCRIPT DE TESTE PARA VERIFICAÇÃO DOS TESTES AUTOMÁTICOS
// =====================================================

console.log('🚀 Iniciando verificação dos testes automáticos...');

// Simular carregamento dos arquivos necessários
const scriptsToLoad = [
    'security-config.js',
    'script.js', 
    'tests.js'
];

let loadedScripts = 0;

function loadScript(src, callback) {
    const script = document.createElement('script');
    script.src = src;
    script.onload = () => {
        loadedScripts++;
        console.log(`✅ Script carregado: ${src}`);
        if (callback) callback();
    };
    script.onerror = () => {
        console.error(`❌ Erro ao carregar: ${src}`);
    };
    document.head.appendChild(script);
}

function runTestVerification() {
    console.log('\n📋 Verificando disponibilidade dos componentes...');
    
    // Verificar se SecurityValidator está disponível
    if (typeof SecurityValidator !== 'undefined') {
        console.log('✅ SecurityValidator disponível');
        
        // Teste básico de segurança
        try {
            const security = new SecurityValidator();
            const testInput = '<script>alert("test")</script>';
            const sanitized = security.sanitizeInput(testInput);
            console.log('✅ Sanitização funcionando:', !sanitized.includes('<script>'));
        } catch (error) {
            console.error('❌ Erro na sanitização:', error.message);
        }
    } else {
        console.error('❌ SecurityValidator não disponível');
    }
    
    // Verificar se BusPanelTester está disponível
    if (typeof BusPanelTester !== 'undefined') {
        console.log('✅ BusPanelTester disponível');
        
        // Criar instância do tester
        try {
            const tester = new BusPanelTester();
            console.log('✅ Instância do tester criada');
            
            // Registrar testes automaticamente
            tester.registerAllTests();
            console.log('✅ Testes registrados automaticamente');
            
            // Executar alguns testes básicos
            setTimeout(() => {
                console.log('\n🔄 Executando testes básicos...');
                tester.runAllTests().then(() => {
                    console.log('✅ Todos os testes executados');
                }).catch((error) => {
                    console.error('❌ Erro na execução dos testes:', error);
                });
            }, 1000);
            
        } catch (error) {
            console.error('❌ Erro ao criar tester:', error.message);
        }
    } else {
        console.error('❌ BusPanelTester não disponível');
    }
    
    // Verificar configurações de segurança
    if (typeof SECURITY_CONFIG !== 'undefined') {
        console.log('✅ SECURITY_CONFIG disponível');
        console.log('📋 Configurações de segurança:', Object.keys(SECURITY_CONFIG));
    } else {
        console.error('❌ SECURITY_CONFIG não disponível');
    }
}

// Carregar scripts sequencialmente
let currentScript = 0;

function loadNextScript() {
    if (currentScript < scriptsToLoad.length) {
        loadScript(scriptsToLoad[currentScript], () => {
            currentScript++;
            loadNextScript();
        });
    } else {
        console.log('\n🎯 Todos os scripts carregados. Iniciando verificação...');
        setTimeout(runTestVerification, 500);
    }
}

// Iniciar carregamento quando DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
    console.log('📄 DOM carregado. Iniciando carregamento dos scripts...');
    loadNextScript();
});

// Feedback visual no HTML
function addTestResultToPage(message, type = 'info') {
    const container = document.getElementById('test-results') || createTestResultsContainer();
    const item = document.createElement('div');
    item.className = `test-result test-${type}`;
    item.textContent = message;
    container.appendChild(item);
}

function createTestResultsContainer() {
    const container = document.createElement('div');
    container.id = 'test-results';
    container.style.cssText = `
        position: fixed;
        top: 50px;
        right: 10px;
        width: 300px;
        max-height: 400px;
        overflow-y: auto;
        background: rgba(0, 0, 0, 0.9);
        color: white;
        padding: 10px;
        border-radius: 8px;
        font-family: monospace;
        font-size: 12px;
        z-index: 9999;
        border: 1px solid #333;
    `;
    
    const title = document.createElement('div');
    title.textContent = 'Resultados dos Testes';
    title.style.cssText = 'font-weight: bold; margin-bottom: 10px; color: #4ade80;';
    container.appendChild(title);
    
    document.body.appendChild(container);
    return container;
}

// Interceptar console.log para mostrar na página
const originalConsoleLog = console.log;
console.log = function(...args) {
    originalConsoleLog.apply(console, args);
    
    const message = args.join(' ');
    if (message.includes('✅') || message.includes('❌') || message.includes('🔄')) {
        addTestResultToPage(message, message.includes('✅') ? 'success' : message.includes('❌') ? 'error' : 'info');
    }
};

console.log('🚀 Test runner inicializado');
