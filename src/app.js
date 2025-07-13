/**
 * Ponto de entrada principal do sistema TwBus
 * Inicializa todos os módulos e gerencia o ciclo de vida da aplicação
 */

import { SYSTEM_CONFIG, STORAGE_KEYS, URLS } from './utils/constants.js';
import { LogUtils, StorageUtils, TimeUtils } from './utils/helpers.js';
import { BusPanel } from './core/BusPanel.js';
import { eventManager } from './core/EventManager.js';
import { securityValidator } from './security/SecurityValidator.js';

/**
 * Classe principal da aplicação
 */
class TwBusApp {
    constructor() {
        this.state = {
            isInitialized: false,
            hasErrors: false,
            startTime: new Date(),
            version: SYSTEM_CONFIG.VERSION
        };
        
        this.components = new Map();
        this.services = new Map();
        
        this.initializeApp();
    }

    /**
     * Inicializa a aplicação
     */
    async initializeApp() {
        try {
            LogUtils.info('Iniciando aplicação TwBus...', {
                version: SYSTEM_CONFIG.VERSION,
                timestamp: this.state.startTime
            });

            // Aguardar DOM estar pronto
            await this.waitForDOMReady();
            
            // Inicializar serviços principais
            await this.initializeServices();
            
            // Inicializar componentes
            await this.initializeComponents();
            
            // Configurar PWA
            await this.initializePWA();
            
            // Configurar funcionalidades adicionais
            await this.initializeFeatures();
            
            this.state.isInitialized = true;
            
            LogUtils.info(SYSTEM_CONFIG.MESSAGES.PANEL_INITIALIZED);
            
        } catch (error) {
            this.handleCriticalError(error);
        }
    }

    /**
     * Aguarda DOM estar pronto
     */
    async waitForDOMReady() {
        return new Promise((resolve) => {
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', resolve);
            } else {
                resolve();
            }
        });
    }

    /**
     * Inicializa serviços principais
     */
    async initializeServices() {
        try {
            LogUtils.info('Inicializando serviços...');
            
            // Serviço de segurança já inicializado automaticamente
            this.services.set('security', securityValidator);
            
            // Serviço de eventos já inicializado automaticamente
            this.services.set('events', eventManager);
            
            // Configurar listeners globais de eventos
            this.setupGlobalEventListeners();
            
            LogUtils.info('Serviços inicializados');
        } catch (error) {
            LogUtils.error('Erro ao inicializar serviços:', error);
            throw error;
        }
    }

    /**
     * Inicializa componentes principais
     */
    async initializeComponents() {
        try {
            LogUtils.info('Inicializando componentes...');
            
            // Inicializar painel principal
            const busPanel = new BusPanel();
            this.components.set('busPanel', busPanel);
            
            // Aguardar inicialização completa
            await new Promise((resolve) => {
                eventManager.once('panel:initialized', resolve);
            });
            
            LogUtils.info('Componentes inicializados');
        } catch (error) {
            LogUtils.error('Erro ao inicializar componentes:', error);
            throw error;
        }
    }

    /**
     * Configura funcionalidades PWA
     */
    async initializePWA() {
        try {
            LogUtils.info('Configurando PWA...');
            
            // Registrar Service Worker
            if ('serviceWorker' in navigator) {
                await this.registerServiceWorker();
            } else {
                LogUtils.warn(SYSTEM_CONFIG.MESSAGES.SERVICE_WORKER_NOT_SUPPORTED);
            }
            
            // Configurar prompt de instalação
            this.setupInstallPrompt();
            
            // Configurar eventos de conectividade
            this.setupConnectivityEvents();
            
            LogUtils.info('PWA configurado');
        } catch (error) {
            LogUtils.error('Erro ao configurar PWA:', error);
        }
    }

    /**
     * Registra Service Worker
     */
    async registerServiceWorker() {
        try {
            const registration = await navigator.serviceWorker.register(URLS.SERVICE_WORKER);
            
            LogUtils.info(SYSTEM_CONFIG.MESSAGES.SERVICE_WORKER_REGISTERED, registration.scope);
            
            // Verificar atualizações
            registration.addEventListener('updatefound', () => {
                LogUtils.info(SYSTEM_CONFIG.MESSAGES.SERVICE_WORKER_UPDATE_FOUND);
                
                const newWorker = registration.installing;
                newWorker.addEventListener('statechange', () => {
                    if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                        LogUtils.info(SYSTEM_CONFIG.MESSAGES.SERVICE_WORKER_UPDATE_AVAILABLE);
                        this.showUpdateNotification();
                    }
                });
            });
            
            // Log de caches disponíveis
            const cacheNames = await caches.keys();
            LogUtils.info('Caches disponíveis:', cacheNames);
            
        } catch (error) {
            LogUtils.error(SYSTEM_CONFIG.MESSAGES.SERVICE_WORKER_FAILED, error);
        }
    }

    /**
     * Configura prompt de instalação PWA
     */
    setupInstallPrompt() {
        let deferredPrompt;
        
        window.addEventListener('beforeinstallprompt', (event) => {
            LogUtils.info(SYSTEM_CONFIG.MESSAGES.PWA_INSTALL_AVAILABLE);
            
            event.preventDefault();
            deferredPrompt = event;
            
            // Mostrar banner de instalação após delay
            setTimeout(() => {
                if (!StorageUtils.getItem(STORAGE_KEYS.PWA_DISMISSED)) {
                    this.showInstallBanner(deferredPrompt);
                }
            }, SYSTEM_CONFIG.PWA.INSTALL_BANNER_DELAY);
        });
        
        window.addEventListener('appinstalled', () => {
            LogUtils.info(SYSTEM_CONFIG.MESSAGES.PWA_INSTALLED);
            this.hideInstallBanner();
            
            // Mostrar mensagem de boas-vindas
            setTimeout(() => {
                this.showWelcomeMessage();
            }, SYSTEM_CONFIG.PWA.WELCOME_MESSAGE_DELAY);
        });
    }

    /**
     * Mostra banner de instalação
     */
    showInstallBanner(deferredPrompt) {
        // Implementação seria similar ao código original
        // mas com melhor estrutura e tratamento de erros
        LogUtils.info('Mostrando banner de instalação PWA');
    }

    /**
     * Esconde banner de instalação
     */
    hideInstallBanner() {
        LogUtils.info('Escondendo banner de instalação PWA');
    }

    /**
     * Mostra mensagem de boas-vindas
     */
    showWelcomeMessage() {
        LogUtils.info('Mostrando mensagem de boas-vindas');
        // Implementação da mensagem de boas-vindas
    }

    /**
     * Mostra notificação de atualização
     */
    showUpdateNotification() {
        LogUtils.info('Mostrando notificação de atualização');
        // Implementação da notificação de atualização
    }

    /**
     * Configura eventos de conectividade
     */
    setupConnectivityEvents() {
        window.addEventListener('online', () => {
            LogUtils.info(SYSTEM_CONFIG.MESSAGES.CONNECTION_RESTORED);
            document.body.classList.remove(SYSTEM_CONFIG.CSS_CLASSES.OFFLINE);
            
            eventManager.emit('connectivity:online', {
                timestamp: new Date()
            });
        });

        window.addEventListener('offline', () => {
            LogUtils.info(SYSTEM_CONFIG.MESSAGES.OFFLINE_MODE);
            document.body.classList.add(SYSTEM_CONFIG.CSS_CLASSES.OFFLINE);
            
            eventManager.emit('connectivity:offline', {
                timestamp: new Date()
            });
        });
    }

    /**
     * Inicializa funcionalidades adicionais
     */
    async initializeFeatures() {
        try {
            LogUtils.info('Inicializando funcionalidades adicionais...');
            
            // Configurar acesso administrativo
            this.setupAdminAccess();
            
            // Configurar testes automáticos se disponíveis
            await this.initializeTests();
            
            LogUtils.info('Funcionalidades adicionais inicializadas');
        } catch (error) {
            LogUtils.error('Erro ao inicializar funcionalidades:', error);
        }
    }

    /**
     * Configura acesso administrativo
     */
    setupAdminAccess() {
        try {
            const adminBtn = document.getElementById('adminBtn');
            if (!adminBtn) return;

            let clickCount = 0;
            let clickTimer;

            adminBtn.addEventListener('click', () => {
                clickCount++;
                
                // Feedback visual
                const opacity = clickCount >= SYSTEM_CONFIG.ADMIN.FEEDBACK_THRESHOLD ? 0.6 : 0.2;
                adminBtn.style.color = `rgba(255,255,255,${opacity})`;
                
                // Verificar se atingiu o número necessário de cliques
                if (clickCount >= SYSTEM_CONFIG.ADMIN.REQUIRED_CLICKS) {
                    window.location.href = URLS.ADMIN_LOGIN;
                    return;
                }
                
                // Reset do contador após timeout
                clearTimeout(clickTimer);
                clickTimer = setTimeout(() => {
                    clickCount = 0;
                    adminBtn.style.color = 'rgba(255,255,255,0.2)';
                }, SYSTEM_CONFIG.ADMIN.CLICK_RESET_TIMEOUT);
            });
            
            // Efeitos de hover
            adminBtn.addEventListener('mouseenter', () => {
                adminBtn.style.color = 'rgba(255,255,255,0.5)';
                adminBtn.style.background = 'rgba(255,255,255,0.1)';
            });
            
            adminBtn.addEventListener('mouseleave', () => {
                adminBtn.style.color = 'rgba(255,255,255,0.2)';
                adminBtn.style.background = 'none';
            });
            
            LogUtils.info('Acesso administrativo configurado');
        } catch (error) {
            LogUtils.error('Erro ao configurar acesso administrativo:', error);
        }
    }

    /**
     * Inicializa sistema de testes
     */
    async initializeTests() {
        try {
            if (typeof BusPanelTester !== 'undefined') {
                LogUtils.info(SYSTEM_CONFIG.MESSAGES.SECURITY_TESTS_START);
                
                const tester = new BusPanelTester();
                tester.registerAllTests();
                
                const testsPassed = await tester.runAllTests();
                
                if (testsPassed) {
                    LogUtils.info(SYSTEM_CONFIG.MESSAGES.SECURITY_TESTS_PASSED);
                    document.body.classList.add(SYSTEM_CONFIG.CSS_CLASSES.TESTS_PASSED);
                    this.showTestSuccessIndicator();
                } else {
                    LogUtils.error(SYSTEM_CONFIG.MESSAGES.SECURITY_TESTS_FAILED);
                    document.body.classList.add(SYSTEM_CONFIG.CSS_CLASSES.TESTS_FAILED);
                    this.showTestFailIndicator();
                }
            } else {
                LogUtils.warn(SYSTEM_CONFIG.MESSAGES.TESTS_NOT_LOADED);
            }
        } catch (error) {
            LogUtils.error('Erro ao inicializar testes:', error);
        }
    }

    /**
     * Mostra indicador de sucesso nos testes
     */
    showTestSuccessIndicator() {
        const indicator = document.createElement('div');
        indicator.className = 'test-success-indicator';
        indicator.innerHTML = '✅ Testes OK';
        indicator.title = 'Todos os testes de segurança passaram';
        document.body.appendChild(indicator);
    }

    /**
     * Mostra indicador de falha nos testes
     */
    showTestFailIndicator() {
        const indicator = document.createElement('div');
        indicator.className = 'test-fail-indicator';
        indicator.innerHTML = '⚠️ Testes';
        indicator.title = 'Alguns testes falharam - verifique o console';
        document.body.appendChild(indicator);
    }

    /**
     * Configura listeners globais de eventos
     */
    setupGlobalEventListeners() {
        // Listener para erros não tratados
        window.addEventListener('error', (event) => {
            LogUtils.error('Erro JavaScript não tratado:', {
                message: event.message,
                filename: event.filename,
                lineno: event.lineno,
                colno: event.colno,
                error: event.error
            });
        });

        // Listener para promises rejeitadas
        window.addEventListener('unhandledrejection', (event) => {
            LogUtils.error('Promise rejeitada não tratada:', event.reason);
        });

        // Listener para eventos de visibilidade
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                LogUtils.info('Aplicação ficou invisível');
                eventManager.emit('app:hidden', { timestamp: new Date() });
            } else {
                LogUtils.info('Aplicação ficou visível');
                eventManager.emit('app:visible', { timestamp: new Date() });
            }
        });
    }

    /**
     * Trata erros críticos da aplicação
     */
    handleCriticalError(error) {
        this.state.hasErrors = true;
        
        LogUtils.error(SYSTEM_CONFIG.MESSAGES.CRITICAL_ERROR, error);
        document.body.classList.add(SYSTEM_CONFIG.CSS_CLASSES.ERROR_STATE);
        
        // Criar indicador de erro crítico
        const errorIndicator = document.createElement('div');
        errorIndicator.className = 'critical-error-indicator';
        errorIndicator.innerHTML = '🚨 Erro';
        errorIndicator.title = 'Erro crítico - verifique o console';
        document.body.appendChild(errorIndicator);
        
        // Emitir evento de erro crítico
        eventManager.emit('app:critical-error', {
            error: error.message,
            timestamp: new Date(),
            stack: error.stack
        });
    }

    /**
     * Obtém informações da aplicação
     */
    getAppInfo() {
        return {
            name: SYSTEM_CONFIG.NAME,
            version: SYSTEM_CONFIG.VERSION,
            description: SYSTEM_CONFIG.DESCRIPTION,
            author: SYSTEM_CONFIG.AUTHOR,
            state: this.state,
            uptime: new Date() - this.state.startTime,
            components: Array.from(this.components.keys()),
            services: Array.from(this.services.keys())
        };
    }

    /**
     * Obtém métricas da aplicação
     */
    getMetrics() {
        return {
            ...this.getAppInfo(),
            securityMetrics: securityValidator.getSecurityMetrics(),
            eventStats: eventManager.getStats(),
            panelState: this.components.get('busPanel')?.getState()
        };
    }

    /**
     * Destrói a aplicação e limpa recursos
     */
    destroy() {
        try {
            LogUtils.info('Destruindo aplicação...');
            
            // Destruir componentes
            this.components.forEach((component, name) => {
                if (component && typeof component.destroy === 'function') {
                    component.destroy();
                }
            });
            this.components.clear();
            
            // Limpar serviços
            this.services.clear();
            
            // Resetar estado
            this.state.isInitialized = false;
            this.state.hasErrors = false;
            
            LogUtils.info('Aplicação destruída');
        } catch (error) {
            LogUtils.error('Erro ao destruir aplicação:', error);
        }
    }
}

// Inicializar aplicação quando DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
    try {
        // Exportar para escopo global para compatibilidade
        window.TwBusApp = TwBusApp;
        
        // Inicializar aplicação
        const app = new TwBusApp();
        window.twBusApp = app;
        
        // Disponibilizar métricas no console para debug
        window.getAppMetrics = () => app.getMetrics();
        
    } catch (error) {
        console.error('Erro crítico na inicialização:', error);
    }
});

// Exportar para uso em módulos
export { TwBusApp };
