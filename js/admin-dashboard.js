/**
 * ========================================
 * ADMIN DASHBOARD - JAVASCRIPT
 * Sistema de gerenciamento administrativo
 * ========================================
 */

class AdminDashboard {
    constructor() {
        this.systemStartTime = Date.now();
        this.logEntries = [];
        this.testResults = [];
        this.componentStatus = {};
        
        this.init();
    }
    
    init() {
        // Verificar autenticação imediatamente
        if (!this.checkAuthImmediate()) {
            return;
        }
        
        this.bindEvents();
        this.startPeriodicUpdates();
        this.initializeComponents();
        this.loadInitialData();
    }
    
    checkAuthImmediate() {
        try {
            const session = JSON.parse(localStorage.getItem('twbus_admin_session') || '{}');
            const isActive = sessionStorage.getItem('twbus_admin_active') === 'true';
            
            const isAuthenticated = session.authenticated && 
                                   session.expires > Date.now() && 
                                   isActive &&
                                   session.token;
            
            if (!isAuthenticated) {
                console.log('❌ Não autenticado - redirecionando para login');
                window.location.replace('admin-login.html');
                return false;
            }
            
            console.log('✅ Autenticação válida');
            return true;
        } catch (error) {
            console.error('Erro na verificação de autenticação:', error);
            window.location.replace('admin-login.html');
            return false;
        }
    }
    
    bindEvents() {
        // Interceptar console para logs
        this.interceptConsole();
        
        // Event listeners para navegação
        document.addEventListener('click', (e) => {
            if (e.target.matches('.nav-item')) {
                this.handleNavigation(e);
            }
        });
    }
    
    handleNavigation(e) {
        const navItem = e.target.closest('.nav-item');
        const onclick = navItem.getAttribute('onclick');
        
        if (onclick) {
            // Extrair nome da seção do onclick
            const match = onclick.match(/showSection\('(.+?)'\)/);
            if (match) {
                this.showSection(match[1]);
            }
        }
    }
    
    showSection(sectionName) {
        // Remover active de todos os nav-items
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
        });
        
        // Adicionar active ao item clicado
        const activeItem = document.querySelector(`[onclick*="${sectionName}"]`);
        if (activeItem) {
            activeItem.classList.add('active');
        }
        
        // Esconder todas as seções
        document.querySelectorAll('.content-section').forEach(section => {
            section.classList.remove('active');
        });
        
        // Mostrar seção selecionada
        const targetSection = document.getElementById(sectionName + '-section');
        if (targetSection) {
            targetSection.classList.add('active');
        }
        
        // Fechar sidebar em mobile
        if (window.innerWidth <= 480) {
            document.getElementById('sidebar').classList.remove('visible');
        }
    }
    
    startPeriodicUpdates() {
        // Atualizar informações a cada segundo
        setInterval(() => this.updateSessionInfo(), 1000);
        
        // Atualizar métricas de performance
        setTimeout(() => this.updatePerformanceMetrics(), 2000);
        
        // Verificar Service Worker automaticamente
        setTimeout(() => this.checkCacheStatus(), 2000);
    }
    
    initializeComponents() {
        // Incrementar page views
        const pageViews = document.getElementById('page-views');
        if (pageViews) {
            let count = parseInt(localStorage.getItem('twbus_page_views') || '0') + 1;
            localStorage.setItem('twbus_page_views', count.toString());
            pageViews.textContent = count;
        }
        
        // Executar verificações automáticas
        setTimeout(() => {
            this.checkComponents();
        }, 500);
    }
    
    loadInitialData() {
        this.addSystemLog('Dashboard administrativo inicializado', 'success');
        console.log('🚀 Dashboard administrativo carregado');
    }
    
    checkComponents() {
        // Verificar SecurityValidator
        if (typeof SecurityValidator !== 'undefined') {
            this.updateComponentStatus('SecurityValidator', 'success', '✅ Disponível');
            this.addSystemLog('SecurityValidator carregado e funcional', 'success');
        } else {
            this.updateComponentStatus('SecurityValidator', 'error', '❌ Não disponível');
            this.addSystemLog('SecurityValidator não encontrado', 'error');
        }
        
        // Verificar BusPanelTester
        if (typeof BusPanelTester !== 'undefined') {
            this.updateComponentStatus('BusPanelTester', 'success', '✅ Disponível');
            this.addSystemLog('BusPanelTester carregado e funcional', 'success');
            
            // Executar testes automaticamente
            setTimeout(() => {
                console.log('🔄 Executando testes automaticamente...');
                this.runManualTests();
            }, 1000);
            
        } else {
            this.updateComponentStatus('BusPanelTester', 'error', '❌ Não disponível');
            this.addSystemLog('BusPanelTester não encontrado', 'error');
        }
        
        // Verificar SECURITY_CONFIG
        if (typeof SECURITY_CONFIG !== 'undefined') {
            this.updateComponentStatus('SECURITY_CONFIG', 'success', 
                '✅ Disponível (' + Object.keys(SECURITY_CONFIG).length + ' configurações)');
            this.addSystemLog('SECURITY_CONFIG carregado com ' + Object.keys(SECURITY_CONFIG).length + ' configurações', 'success');
        } else {
            this.updateComponentStatus('SECURITY_CONFIG', 'error', '❌ Não disponível');
            this.addSystemLog('SECURITY_CONFIG não encontrado', 'error');
        }
    }
    
    updateComponentStatus(component, status, message) {
        this.componentStatus[component] = { status, message };
        this.renderComponentStatus();
    }
    
    renderComponentStatus() {
        const container = document.getElementById('component-status-container');
        if (container) {
            container.innerHTML = '';
            
            Object.entries(this.componentStatus).forEach(([component, info]) => {
                const item = document.createElement('div');
                item.className = `test-result test-${info.status}`;
                item.textContent = component + ': ' + info.message;
                container.appendChild(item);
            });
        }
    }
    
    updateSessionInfo() {
        try {
            const session = JSON.parse(localStorage.getItem('twbus_admin_session') || '{}');
            const sessionTime = document.getElementById('session-time');
            
            if (session.expires) {
                const timeLeft = session.expires - Date.now();
                const minutesLeft = Math.floor(timeLeft / 60000);
                if (sessionTime) {
                    sessionTime.textContent = `Sessão: ${minutesLeft}min restantes`;
                }
            }
            
            // Atualizar uptime
            const uptimeElement = document.getElementById('system-uptime');
            if (uptimeElement) {
                const uptime = Math.floor((Date.now() - this.systemStartTime) / 1000);
                const minutes = Math.floor(uptime / 60);
                const seconds = uptime % 60;
                uptimeElement.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
            }
            
            // Atualizar duração da sessão
            const sessionDuration = document.getElementById('session-duration');
            if (sessionDuration && session.loginTime) {
                const duration = Math.floor((Date.now() - session.loginTime) / 60000);
                sessionDuration.textContent = `${duration}min`;
            }
            
        } catch (error) {
            console.error('Erro ao atualizar info da sessão:', error);
        }
    }
    
    updatePerformanceMetrics() {
        // DOM Content Loaded
        const domLoading = document.getElementById('dom-loading');
        if (domLoading && performance.timing) {
            const domTime = performance.timing.domContentLoadedEventEnd - performance.timing.navigationStart;
            domLoading.textContent = domTime + 'ms';
        }
        
        // Page Load
        const pageLoad = document.getElementById('page-load');
        if (pageLoad && performance.timing) {
            const loadTime = performance.timing.loadEventEnd - performance.timing.navigationStart;
            pageLoad.textContent = loadTime + 'ms';
        }
        
        // Memory usage (se disponível)
        if (performance.memory) {
            const jsHeap = document.getElementById('js-heap');
            if (jsHeap) {
                const used = (performance.memory.usedJSHeapSize / 1024 / 1024).toFixed(2);
                jsHeap.textContent = used + ' MB';
            }
        }
    }
    
    addSystemLog(message, type = 'info') {
        const timestamp = new Date().toLocaleTimeString();
        const logEntry = { timestamp, message, type };
        this.logEntries.push(logEntry);
        
        const logsContainer = document.getElementById('system-logs');
        if (logsContainer) {
            const colorMap = {
                'info': '#00ff00',
                'warning': '#ffaa00',
                'error': '#ff4444',
                'success': '#00ff00'
            };
            
            logsContainer.innerHTML += `<span style="color: #666;">[${timestamp}]</span> <span style="color: ${colorMap[type] || '#00ff00'};">[${type.toUpperCase()}]</span> ${message}<br>`;
            logsContainer.scrollTop = logsContainer.scrollHeight;
            
            // Atualizar badge de logs
            const logCount = document.getElementById('log-count');
            if (logCount) {
                logCount.textContent = this.logEntries.length;
            }
        }
    }
    
    addTestResult(message, type = 'info') {
        const timestamp = new Date().toLocaleTimeString();
        this.testResults.push({ timestamp, message, type });
        
        const container = document.getElementById('test-results');
        if (container) {
            const item = document.createElement('div');
            item.className = `test-result test-${type}`;
            item.textContent = '[' + timestamp + '] ' + message;
            container.appendChild(item);
            
            // Limitar a 50 resultados
            if (container.children.length > 50) {
                container.removeChild(container.firstChild);
            }
            
            container.scrollTop = container.scrollHeight;
            
            // Atualizar contador
            const testCount = document.getElementById('test-count');
            if (testCount) {
                testCount.textContent = this.testResults.length;
            }
            
            this.updateTestMetrics();
        }
    }
    
    addConsoleOutput(message) {
        const container = document.getElementById('console-output');
        if (container) {
            const timestamp = new Date().toLocaleTimeString();
            container.innerHTML += '<span style="color: #666;">[' + timestamp + ']</span> ' + message + '<br>';
            container.scrollTop = container.scrollHeight;
        }
    }
    
    updateTestMetrics() {
        const testsExecuted = document.getElementById('tests-executed');
        const failuresCount = document.getElementById('failures-count');
        
        if (testsExecuted) {
            testsExecuted.textContent = this.testResults.filter(t => t.type === 'success' || t.type === 'error').length;
        }
        
        if (failuresCount) {
            failuresCount.textContent = this.testResults.filter(t => t.type === 'error').length;
        }
    }
    
    interceptConsole() {
        const originalConsoleLog = console.log;
        const originalConsoleError = console.error;
        const originalConsoleWarn = console.warn;
        
        console.log = (...args) => {
            originalConsoleLog.apply(console, args);
            const message = args.join(' ');
            this.addConsoleOutput('<span style="color: #00ff00;">[LOG]</span> ' + message);
            this.addSystemLog(message, 'info');
            
            if (message.includes('✅')) {
                this.addTestResult(message, 'success');
            } else if (message.includes('❌')) {
                this.addTestResult(message, 'error');
            } else if (message.includes('🔄')) {
                this.addTestResult(message, 'info');
            }
        };
        
        console.error = (...args) => {
            originalConsoleError.apply(console, args);
            const message = args.join(' ');
            this.addConsoleOutput('<span style="color: #ff4444;">[ERROR]</span> ' + message);
            this.addSystemLog('ERRO: ' + message, 'error');
            this.addTestResult('❌ ERRO: ' + message, 'error');
        };
        
        console.warn = (...args) => {
            originalConsoleWarn.apply(console, args);
            const message = args.join(' ');
            this.addConsoleOutput('<span style="color: #ffaa00;">[WARN]</span> ' + message);
            this.addSystemLog('AVISO: ' + message, 'warning');
            this.addTestResult('⚠️ AVISO: ' + message, 'info');
        };
    }
    
    // Métodos expostos globalmente
    checkCacheStatus() {
        this.addSystemLog('Verificando status do Service Worker e cache', 'info');
        
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.getRegistration()
                .then(registration => {
                    const swState = document.getElementById('sw-state');
                    if (registration) {
                        if (registration.active) {
                            swState.innerHTML = '<span style="color: #4ade80;">✅ Ativo</span>';
                            this.addSystemLog('Service Worker está ativo', 'success');
                        } else {
                            swState.innerHTML = '<span style="color: #ef4444;">❌ Inativo</span>';
                            this.addSystemLog('Service Worker não está ativo', 'error');
                        }
                    } else {
                        swState.innerHTML = '<span style="color: #ef4444;">❌ Não registrado</span>';
                        this.addSystemLog('Service Worker não está registrado', 'error');
                    }
                })
                .catch(error => {
                    document.getElementById('sw-state').innerHTML = '<span style="color: #ef4444;">❌ Erro</span>';
                    this.addSystemLog('Erro ao verificar Service Worker: ' + error.message, 'error');
                });
            
            // Verificar caches
            caches.keys().then(cacheNames => {
                const cacheInfo = document.getElementById('cache-info');
                if (cacheNames.length > 0) {
                    cacheInfo.innerHTML = `<span style="color: #4ade80;">✅ ${cacheNames.length} cache(s) ativo(s)</span>`;
                    this.addSystemLog(`${cacheNames.length} caches encontrados: ${cacheNames.join(', ')}`, 'success');
                    
                    // Verificar tamanho do cache
                    const promises = cacheNames.map(cacheName => {
                        return caches.open(cacheName).then(cache => {
                            return cache.keys().then(requests => {
                                this.addSystemLog(`Cache ${cacheName}: ${requests.length} itens`, 'info');
                                return requests.length;
                            });
                        });
                    });
                    
                    Promise.all(promises).then(sizes => {
                        const totalItems = sizes.reduce((sum, size) => sum + size, 0);
                        this.addSystemLog(`Total de itens em cache: ${totalItems}`, 'info');
                    });
                    
                } else {
                    cacheInfo.innerHTML = '<span style="color: #ef4444;">❌ Nenhum cache</span>';
                    this.addSystemLog('Nenhum cache encontrado', 'warning');
                }
            });
        } else {
            document.getElementById('sw-state').innerHTML = '<span style="color: #ef4444;">❌ Não suportado</span>';
            document.getElementById('cache-info').innerHTML = '<span style="color: #ef4444;">❌ Não suportado</span>';
            this.addSystemLog('Service Worker não é suportado neste navegador', 'warning');
        }
    }
    
    clearCache() {
        if (confirm('⚠️ Isso irá limpar todo o cache do Service Worker. Continuar?')) {
            this.addSystemLog('Iniciando limpeza de cache', 'info');
            
            caches.keys().then(cacheNames => {
                const promises = cacheNames.map(cacheName => {
                    this.addSystemLog(`Removendo cache: ${cacheName}`, 'info');
                    return caches.delete(cacheName);
                });
                
                return Promise.all(promises);
            }).then(() => {
                this.addSystemLog('Cache limpo com sucesso', 'success');
                document.getElementById('cache-info').innerHTML = '<span style="color: #ef4444;">❌ Cache limpo</span>';
                
                // Recarregar Service Worker
                if ('serviceWorker' in navigator) {
                    navigator.serviceWorker.getRegistration().then(registration => {
                        if (registration) {
                            registration.unregister().then(() => {
                                this.addSystemLog('Service Worker desregistrado para recriação', 'info');
                                setTimeout(() => {
                                    window.location.reload();
                                }, 1000);
                            });
                        }
                    });
                }
            }).catch(error => {
                this.addSystemLog('Erro ao limpar cache: ' + error.message, 'error');
            });
        }
    }
    
    runManualTests() {
        this.addTestResult('🚀 Iniciando testes manuais...', 'info');
        this.addSystemLog('Testes manuais iniciados pelo usuário', 'info');
        
        if (typeof BusPanelTester !== 'undefined') {
            try {
                const tester = new BusPanelTester();
                tester.registerAllTests();
                
                tester.runAllTests().then(() => {
                    this.addTestResult('✅ Todos os testes manuais concluídos', 'success');
                    this.addSystemLog('Todos os testes concluídos com sucesso', 'success');
                }).catch((error) => {
                    this.addTestResult('❌ Erro nos testes manuais: ' + error.message, 'error');
                    this.addSystemLog('Erro nos testes: ' + error.message, 'error');
                });
            } catch (error) {
                this.addTestResult('❌ Erro ao executar testes: ' + error.message, 'error');
                this.addSystemLog('Erro ao executar testes: ' + error.message, 'error');
            }
        } else {
            this.addTestResult('❌ BusPanelTester não disponível', 'error');
            this.addSystemLog('BusPanelTester não está disponível', 'error');
        }
    }
    
    clearResults() {
        document.getElementById('test-results').innerHTML = 
            '<div class="test-result test-info">📋 Resultados limpos</div>';
        document.getElementById('console-output').innerHTML = 
            'Console limpo...<br>';
        this.testResults = [];
        document.getElementById('test-count').textContent = '0';
        this.addSystemLog('Resultados de testes limpos', 'info');
    }
    
    exportResults() {
        const data = {
            timestamp: new Date().toISOString(),
            componentStatus: this.componentStatus,
            testResults: this.testResults,
            systemLogs: this.logEntries
        };
        
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = 'admin-test-results-' + Date.now() + '.json';
        a.click();
        
        URL.revokeObjectURL(url);
        this.addTestResult('💾 Resultados exportados', 'success');
        this.addSystemLog('Resultados de testes exportados', 'success');
    }
    
    toggleAutoMode() {
        this.addTestResult('🔄 Modo automático alternado', 'info');
        this.addSystemLog('Modo automático de testes alternado', 'info');
    }
    
    clearLogs() {
        this.logEntries = [];
        document.getElementById('system-logs').innerHTML = 'Logs limpos...<br>';
        document.getElementById('log-count').textContent = '0';
        this.addSystemLog('Logs do sistema foram limpos', 'info');
    }
    
    exportLogs() {
        const data = {
            timestamp: new Date().toISOString(),
            logs: this.logEntries
        };
        
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = 'system-logs-' + Date.now() + '.json';
        a.click();
        
        URL.revokeObjectURL(url);
        this.addSystemLog('Logs exportados com sucesso', 'success');
    }
    
    logout() {
        localStorage.removeItem('twbus_admin_session');
        sessionStorage.removeItem('twbus_admin_active');
        window.location.href = 'admin-login.html';
    }
    
    toggleSidebar() {
        const sidebar = document.getElementById('sidebar');
        const mainContent = document.getElementById('main-content');
        
        if (window.innerWidth <= 480) {
            sidebar.classList.toggle('visible');
        } else {
            sidebar.classList.toggle('hidden');
            mainContent.classList.toggle('expanded');
        }
    }
}

// Instância global
let adminDashboard;

// Funções globais para compatibilidade
function showSection(sectionName) {
    if (adminDashboard) {
        adminDashboard.showSection(sectionName);
    }
}

function checkCacheStatus() {
    if (adminDashboard) {
        adminDashboard.checkCacheStatus();
    }
}

function clearCache() {
    if (adminDashboard) {
        adminDashboard.clearCache();
    }
}

function runManualTests() {
    if (adminDashboard) {
        adminDashboard.runManualTests();
    }
}

function clearResults() {
    if (adminDashboard) {
        adminDashboard.clearResults();
    }
}

function exportResults() {
    if (adminDashboard) {
        adminDashboard.exportResults();
    }
}

function toggleAutoMode() {
    if (adminDashboard) {
        adminDashboard.toggleAutoMode();
    }
}

function clearLogs() {
    if (adminDashboard) {
        adminDashboard.clearLogs();
    }
}

function exportLogs() {
    if (adminDashboard) {
        adminDashboard.exportLogs();
    }
}

function logout() {
    if (adminDashboard) {
        adminDashboard.logout();
    }
}

function toggleSidebar() {
    if (adminDashboard) {
        adminDashboard.toggleSidebar();
    }
}

// Inicializar quando DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
    adminDashboard = new AdminDashboard();
});

console.log('📋 Dashboard administrativo v1.1.1 carregado com sucesso');
