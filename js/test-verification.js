/**
 * ========================================
 * TEST VERIFICATION - JAVASCRIPT
 * Sistema de testes e verificação
 * ========================================
 */

class TestVerificationSystem {
    constructor() {
        this.testResults = [];
        this.benchmarks = [];
        this.reports = [];
        this.isRunning = false;
        
        this.init();
    }
    
    init() {
        this.setupConsoleCapture();
        this.bindEvents();
        this.loadTestHistory();
        
        // Aguardar outros scripts carregarem
        setTimeout(() => {
            this.autoRunTests();
        }, 1000);
    }
    
    bindEvents() {
        // Event delegation para botões dinâmicos
        document.addEventListener('click', (e) => {
            const target = e.target;
            
            if (target.matches('#run-tests-btn')) {
                this.runAllTests();
            } else if (target.matches('#clear-results-btn')) {
                this.clearResults();
            } else if (target.matches('#save-report-btn')) {
                this.saveReport();
            } else if (target.matches('#export-json-btn')) {
                this.exportJSON();
            } else if (target.matches('#run-benchmark-btn')) {
                this.runBenchmark();
            } else if (target.matches('#simulate-error-btn')) {
                this.simulateError();
            }
        });
    }
    
    setupConsoleCapture() {
        const originalLog = console.log;
        const originalError = console.error;
        const originalWarn = console.warn;
        
        console.log = (...args) => {
            originalLog.apply(console, args);
            this.captureOutput('log', args.join(' '));
        };
        
        console.error = (...args) => {
            originalError.apply(console, args);
            this.captureOutput('error', args.join(' '));
        };
        
        console.warn = (...args) => {
            originalWarn.apply(console, args);
            this.captureOutput('warn', args.join(' '));
        };
    }
    
    captureOutput(type, message) {
        const outputDiv = document.getElementById('output');
        if (outputDiv) {
            const timestamp = new Date().toLocaleTimeString();
            const typeColors = {
                log: '#00ff00',
                error: '#ff4444',
                warn: '#ffaa00'
            };
            
            outputDiv.innerHTML += `<div class="output-line">
                <span style="color: #666;">[${timestamp}]</span>
                <span style="color: ${typeColors[type]};">[${type.toUpperCase()}]</span>
                ${message}
            </div>`;
            
            outputDiv.scrollTop = outputDiv.scrollHeight;
        }
        
        // Adicionar aos resultados se for um teste
        if (message.includes('✅') || message.includes('❌') || message.includes('Test:')) {
            this.addTestResult({
                timestamp: new Date().toISOString(),
                type: message.includes('✅') ? 'success' : message.includes('❌') ? 'error' : 'info',
                message: message
            });
        }
    }
    
    addTestResult(result) {
        this.testResults.push(result);
        this.updateTestCounter();
        this.updateResultsDisplay();
    }
    
    updateTestCounter() {
        const counter = document.getElementById('test-counter');
        if (counter) {
            const passed = this.testResults.filter(r => r.type === 'success').length;
            const failed = this.testResults.filter(r => r.type === 'error').length;
            const total = this.testResults.length;
            
            counter.textContent = `Passed: ${passed} | Failed: ${failed} | Total: ${total}`;
        }
    }
    
    updateResultsDisplay() {
        const resultsDiv = document.getElementById('test-results');
        if (resultsDiv) {
            resultsDiv.innerHTML = '';
            
            this.testResults.forEach(result => {
                const resultElement = document.createElement('div');
                resultElement.className = `test-item test-${result.type}`;
                
                const time = new Date(result.timestamp).toLocaleTimeString();
                resultElement.innerHTML = `
                    <span class="test-time">${time}</span>
                    <span class="test-message">${result.message}</span>
                `;
                
                resultsDiv.appendChild(resultElement);
            });
            
            resultsDiv.scrollTop = resultsDiv.scrollHeight;
        }
    }
    
    loadTestHistory() {
        try {
            const saved = localStorage.getItem('twbus_test_history');
            if (saved) {
                const history = JSON.parse(saved);
                this.reports = history.reports || [];
                this.updateReportsDisplay();
            }
        } catch (error) {
            console.error('Erro ao carregar histórico de testes:', error);
        }
    }
    
    saveTestHistory() {
        try {
            const history = {
                lastUpdate: new Date().toISOString(),
                reports: this.reports
            };
            localStorage.setItem('twbus_test_history', JSON.stringify(history));
        } catch (error) {
            console.error('Erro ao salvar histórico de testes:', error);
        }
    }
    
    async autoRunTests() {
        console.log('🔄 Iniciando testes automáticos...');
        
        // Verificar se BusPanelTester está disponível
        if (typeof BusPanelTester !== 'undefined') {
            try {
                const tester = new BusPanelTester();
                console.log('✅ BusPanelTester inicializado');
                
                tester.registerAllTests();
                console.log('✅ Todos os testes registrados');
                
                await tester.runAllTests();
                console.log('✅ Testes automáticos concluídos');
                
            } catch (error) {
                console.error('❌ Erro nos testes automáticos:', error);
            }
        } else {
            console.warn('⚠️ BusPanelTester não disponível para testes automáticos');
        }
        
        // Executar verificações básicas
        this.runBasicChecks();
    }
    
    runBasicChecks() {
        console.log('🔍 Executando verificações básicas...');
        
        // Verificar Service Worker
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.getRegistration()
                .then(registration => {
                    if (registration && registration.active) {
                        console.log('✅ Service Worker está ativo');
                    } else {
                        console.log('❌ Service Worker não está ativo');
                    }
                })
                .catch(error => {
                    console.error('❌ Erro ao verificar Service Worker:', error);
                });
        } else {
            console.log('❌ Service Worker não suportado');
        }
        
        // Verificar localStorage
        try {
            localStorage.setItem('test_key', 'test_value');
            const value = localStorage.getItem('test_key');
            if (value === 'test_value') {
                console.log('✅ localStorage funcionando');
                localStorage.removeItem('test_key');
            } else {
                console.log('❌ localStorage com problemas');
            }
        } catch (error) {
            console.error('❌ Erro no localStorage:', error);
        }
        
        // Verificar conectividade
        if (navigator.onLine) {
            console.log('✅ Conectividade online detectada');
        } else {
            console.log('❌ Aplicação está offline');
        }
        
        // Verificar scripts essenciais
        const scripts = ['SecurityValidator', 'SECURITY_CONFIG', 'BusPanelTester'];
        scripts.forEach(scriptName => {
            if (typeof window[scriptName] !== 'undefined') {
                console.log(`✅ ${scriptName} carregado`);
            } else {
                console.log(`❌ ${scriptName} não encontrado`);
            }
        });
    }
    
    async runAllTests() {
        if (this.isRunning) {
            console.log('⚠️ Testes já estão executando...');
            return;
        }
        
        this.isRunning = true;
        const startTime = Date.now();
        
        console.log('🚀 Iniciando suite completa de testes...');
        this.clearResults();
        
        try {
            // Executar testes básicos
            this.runBasicChecks();
            
            // Executar BusPanelTester se disponível
            if (typeof BusPanelTester !== 'undefined') {
                const tester = new BusPanelTester();
                tester.registerAllTests();
                await tester.runAllTests();
            }
            
            // Executar testes de segurança
            if (typeof SecurityValidator !== 'undefined') {
                const validator = new SecurityValidator();
                validator.validateAll();
            }
            
            const duration = Date.now() - startTime;
            console.log(`✅ Suite de testes concluída em ${duration}ms`);
            
        } catch (error) {
            console.error('❌ Erro durante execução dos testes:', error);
        } finally {
            this.isRunning = false;
        }
    }
    
    clearResults() {
        this.testResults = [];
        
        const outputDiv = document.getElementById('output');
        const resultsDiv = document.getElementById('test-results');
        
        if (outputDiv) {
            outputDiv.innerHTML = '<div class="output-line">Console limpo - aguardando novos testes...</div>';
        }
        
        if (resultsDiv) {
            resultsDiv.innerHTML = '';
        }
        
        this.updateTestCounter();
        console.log('🧹 Resultados limpos');
    }
    
    saveReport() {
        const report = {
            id: Date.now(),
            timestamp: new Date().toISOString(),
            totalTests: this.testResults.length,
            passed: this.testResults.filter(r => r.type === 'success').length,
            failed: this.testResults.filter(r => r.type === 'error').length,
            duration: this.testResults.length > 0 ? 
                new Date(this.testResults[this.testResults.length - 1].timestamp) - 
                new Date(this.testResults[0].timestamp) : 0,
            results: [...this.testResults]
        };
        
        this.reports.push(report);
        this.saveTestHistory();
        this.updateReportsDisplay();
        
        console.log(`💾 Relatório salvo - ID: ${report.id}`);
    }
    
    updateReportsDisplay() {
        const reportsDiv = document.getElementById('saved-reports');
        if (reportsDiv) {
            reportsDiv.innerHTML = '';
            
            this.reports.slice(-10).reverse().forEach(report => {
                const reportElement = document.createElement('div');
                reportElement.className = 'report-item';
                
                const date = new Date(report.timestamp).toLocaleString();
                const successRate = report.totalTests > 0 ? 
                    Math.round((report.passed / report.totalTests) * 100) : 0;
                
                reportElement.innerHTML = `
                    <div class="report-header">
                        <span class="report-date">${date}</span>
                        <span class="report-success-rate ${successRate >= 80 ? 'success' : 'warning'}">
                            ${successRate}% (${report.passed}/${report.totalTests})
                        </span>
                    </div>
                    <div class="report-actions">
                        <button onclick="testSystem.viewReport(${report.id})" class="btn-small">Visualizar</button>
                        <button onclick="testSystem.deleteReport(${report.id})" class="btn-small btn-danger">Excluir</button>
                    </div>
                `;
                
                reportsDiv.appendChild(reportElement);
            });
        }
    }
    
    viewReport(reportId) {
        const report = this.reports.find(r => r.id === reportId);
        if (report) {
            // Substitir resultados atuais pelo relatório
            this.testResults = [...report.results];
            this.updateResultsDisplay();
            this.updateTestCounter();
            
            console.log(`📋 Visualizando relatório de ${new Date(report.timestamp).toLocaleString()}`);
        }
    }
    
    deleteReport(reportId) {
        if (confirm('Deseja realmente excluir este relatório?')) {
            this.reports = this.reports.filter(r => r.id !== reportId);
            this.saveTestHistory();
            this.updateReportsDisplay();
            
            console.log(`🗑️ Relatório ${reportId} excluído`);
        }
    }
    
    exportJSON() {
        const data = {
            timestamp: new Date().toISOString(),
            testResults: this.testResults,
            reports: this.reports,
            summary: {
                totalTests: this.testResults.length,
                passed: this.testResults.filter(r => r.type === 'success').length,
                failed: this.testResults.filter(r => r.type === 'error').length
            }
        };
        
        const blob = new Blob([JSON.stringify(data, null, 2)], { 
            type: 'application/json' 
        });
        
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `twbus-test-results-${Date.now()}.json`;
        a.click();
        
        URL.revokeObjectURL(url);
        console.log('📤 Dados exportados em JSON');
    }
    
    runBenchmark() {
        console.log('⏱️ Iniciando benchmark de performance...');
        
        const startTime = performance.now();
        
        // Teste de renderização DOM
        const testElement = document.createElement('div');
        testElement.innerHTML = '<span>Teste de performance</span>'.repeat(1000);
        document.body.appendChild(testElement);
        document.body.removeChild(testElement);
        
        const domTime = performance.now() - startTime;
        
        // Teste de localStorage
        const lsStart = performance.now();
        for (let i = 0; i < 100; i++) {
            localStorage.setItem(`bench_${i}`, 'test data');
            localStorage.getItem(`bench_${i}`);
            localStorage.removeItem(`bench_${i}`);
        }
        const lsTime = performance.now() - lsStart;
        
        // Teste de cálculo
        const calcStart = performance.now();
        let result = 0;
        for (let i = 0; i < 100000; i++) {
            result += Math.sqrt(i);
        }
        const calcTime = performance.now() - calcStart;
        
        const benchmark = {
            timestamp: new Date().toISOString(),
            domRendering: `${domTime.toFixed(2)}ms`,
            localStorage: `${lsTime.toFixed(2)}ms`,
            calculation: `${calcTime.toFixed(2)}ms`,
            total: `${(domTime + lsTime + calcTime).toFixed(2)}ms`
        };
        
        this.benchmarks.push(benchmark);
        
        console.log('📊 Benchmark concluído:');
        console.log(`- DOM Rendering: ${benchmark.domRendering}`);
        console.log(`- LocalStorage: ${benchmark.localStorage}`);
        console.log(`- Calculation: ${benchmark.calculation}`);
        console.log(`- Total: ${benchmark.total}`);
        
        this.updateBenchmarkDisplay();
    }
    
    updateBenchmarkDisplay() {
        const benchmarkDiv = document.getElementById('benchmark-results');
        if (benchmarkDiv && this.benchmarks.length > 0) {
            const latest = this.benchmarks[this.benchmarks.length - 1];
            
            benchmarkDiv.innerHTML = `
                <div class="benchmark-item">
                    <h4>Último Benchmark - ${new Date(latest.timestamp).toLocaleTimeString()}</h4>
                    <div class="benchmark-metrics">
                        <span>DOM: ${latest.domRendering}</span>
                        <span>Storage: ${latest.localStorage}</span>
                        <span>Calc: ${latest.calculation}</span>
                        <span><strong>Total: ${latest.total}</strong></span>
                    </div>
                </div>
            `;
        }
    }
    
    simulateError() {
        console.log('🔥 Simulando erro para teste...');
        
        try {
            // Erro intencional
            throw new Error('Erro simulado para demonstração do sistema de captura');
        } catch (error) {
            console.error('❌ Erro capturado:', error.message);
            
            // Adicionar informações extras
            console.warn('⚠️ Este é um erro simulado para testar o sistema');
            console.log('ℹ️ Stack trace disponível no console do navegador');
        }
    }
}

// Instância global
let testSystem;

// Inicializar quando DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
    testSystem = new TestVerificationSystem();
    console.log('🧪 Sistema de testes e verificação inicializado');
});

// Funções globais para compatibilidade
function runAllTests() {
    if (testSystem) {
        testSystem.runAllTests();
    }
}

function clearResults() {
    if (testSystem) {
        testSystem.clearResults();
    }
}

function saveReport() {
    if (testSystem) {
        testSystem.saveReport();
    }
}

function exportJSON() {
    if (testSystem) {
        testSystem.exportJSON();
    }
}

function runBenchmark() {
    if (testSystem) {
        testSystem.runBenchmark();
    }
}

function simulateError() {
    if (testSystem) {
        testSystem.simulateError();
    }
}

console.log('🧪 Sistema de testes v1.1.1 carregado com sucesso');
