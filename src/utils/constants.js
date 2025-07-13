/**
 * Constantes do sistema TwBus
 * Centralizadas para facilitar manutenção
 */

export const SYSTEM_CONFIG = {
    NAME: 'TwBus',
    VERSION: '1.0.0',
    DESCRIPTION: 'Sistema de painel de parada de ônibus em tempo real',
    AUTHOR: 'TwBus Team',
    
    // Configurações de segurança
    SECURITY: {
        MAX_INPUT_LENGTH: 1000,
        RATE_LIMIT_MAX_PER_SECOND: 10,
        RATE_LIMIT_CLEANUP_THRESHOLD: 100,
        RATE_LIMIT_CLEANUP_TIMEOUT: 60000,
        TRUSTED_ORIGINS: ['https://twbus.vercel.app', 'https://localhost', 'http://localhost'],
        ALLOWED_EVENT_TYPES: ['click', 'touchstart', 'keydown', 'resize'],
        SENSITIVE_GLOBALS: ['eval', 'Function', 'setTimeout', 'setInterval']
    },
    
    // Configurações de interface
    UI: {
        ANIMATION_DURATION: 600,
        REFRESH_ANIMATION_DURATION: 800,
        ENTRANCE_ANIMATION_DELAY: 100,
        ENTRANCE_ANIMATION_DURATION: 600,
        STOP_ANIMATION_DURATION: 400,
        STOP_ANIMATION_DELAY: 100,
        STOP_ANIMATION_INTERVAL: 50,
        HOVER_ANIMATION_DURATION: 150,
        EXPAND_ANIMATION_DURATION: 600,
        EXTRA_STOP_ANIMATION_DURATION: 400,
        EXTRA_STOP_ANIMATION_DELAY: 100,
        EXTRA_STOP_ANIMATION_INTERVAL: 50
    },
    
    // Configurações de PWA
    PWA: {
        INSTALL_BANNER_DELAY: 3000,
        INSTALL_BANNER_ANIMATION_DURATION: 300,
        WELCOME_MESSAGE_DELAY: 1000
    },
    
    // Configurações de admin
    ADMIN: {
        REQUIRED_CLICKS: 5,
        CLICK_RESET_TIMEOUT: 3000,
        FEEDBACK_THRESHOLD: 3
    },
    
    // Seletores DOM
    SELECTORS: {
        CONTAINER: '.container',
        REFRESH_BTN: '#refreshBtn',
        EXPAND_BTN: '#expandBtn',
        ADMIN_BTN: '#adminBtn',
        STOPS: '.stop',
        EXTRA_STOPS: '.stop.extra',
        INFO_BADGES: '.info-badge',
        CURRENT_BUS_STOP: '.current-bus',
        CURRENT_LOCATION: '.current-location',
        NEXT_STOP: '.next',
        FOOTER_TIMESTAMP: '.footer span'
    },
    
    // Classes CSS
    CSS_CLASSES: {
        EXPANDED: 'expanded',
        HIGHLIGHTED: 'highlighted',
        REFRESHING: 'refreshing',
        SECURITY_ERROR: 'security-error',
        TESTS_PASSED: 'tests-passed',
        TESTS_FAILED: 'tests-failed',
        ERROR_STATE: 'error-state',
        OFFLINE: 'offline'
    },
    
    // Mensagens do sistema
    MESSAGES: {
        PANEL_INITIALIZED: '✅ Painel TwBus inicializado com sucesso',
        PANEL_NOT_FOUND: '⚠️ BusPanel não encontrado, usando modo básico',
        SECURITY_TESTS_START: '\n🔒 Iniciando testes de segurança automáticos...',
        SECURITY_TESTS_PASSED: '\n🎉 Todos os testes de segurança passaram!',
        SECURITY_TESTS_FAILED: '\n⚠️ Alguns testes falharam - verifique o console',
        TESTS_NOT_LOADED: '⚠️ Sistema de testes não carregado',
        CRITICAL_ERROR: '❌ Erro crítico na inicialização:',
        PWA_INSTALL_AVAILABLE: '💾 PWA: Install prompt disponível',
        PWA_INSTALL_ACCEPTED: '✅ PWA: Usuário aceitou instalação',
        PWA_INSTALL_REJECTED: '❌ PWA: Usuário recusou instalação',
        PWA_INSTALLED: '🎉 PWA: App instalado com sucesso',
        PWA_INSTALL_SUCCESS: '🎉 TwBus instalado com sucesso!\nAgora você pode acessar offline.',
        SERVICE_WORKER_REGISTERED: '✅ Service Worker registrado:',
        SERVICE_WORKER_UPDATE_FOUND: '🔄 Service Worker: Nova versão detectada',
        SERVICE_WORKER_UPDATE_AVAILABLE: '⬆️ Service Worker: Atualização disponível',
        SERVICE_WORKER_FAILED: '❌ Service Worker falhou:',
        SERVICE_WORKER_NOT_SUPPORTED: '⚠️ Service Worker não suportado neste navegador',
        CONNECTION_RESTORED: '🌐 Conexão restaurada',
        OFFLINE_MODE: '📱 Modo offline ativado',
        SECURITY_ERROR_PREFIX: '🔒 Erro de Segurança:',
        SCRIPT_LOADED: '✅ Script principal carregado com sucesso'
    }
};

export const DOM_ATTRIBUTES = {
    ARIA_LABEL: 'aria-label',
    ARIA_HIDDEN: 'aria-hidden',
    TITLE: 'title',
    DATA_CLICKS: 'data-clicks'
};

export const STORAGE_KEYS = {
    PWA_DISMISSED: 'pwa-dismissed'
};

export const URLS = {
    ADMIN_LOGIN: 'admin-login.html',
    SERVICE_WORKER: '/sw.js'
};

export const ICONS = {
    BUS: 'fas fa-bus',
    CLOCK: 'fas fa-clock',
    ROUTE: 'fas fa-route',
    SYNC: 'fas fa-sync-alt',
    EXPAND: 'fas fa-expand',
    COMPRESS: 'fas fa-compress',
    USERS: 'fas fa-users',
    WIFI: 'fas fa-wifi',
    WHEELCHAIR: 'fas fa-wheelchair',
    MAP_MARKER: 'fas fa-map-marker-alt'
};

export const COLORS = {
    GOLD: '#ffd700',
    LIGHT_GREEN: '#98fb98',
    WHITE: '#ffffff',
    WHITE_TRANSPARENT: 'rgba(255,255,255,0.1)',
    WHITE_SEMI_TRANSPARENT: 'rgba(255,255,255,0.2)',
    WHITE_MEDIUM_TRANSPARENT: 'rgba(255,255,255,0.5)',
    WHITE_LIGHT_TRANSPARENT: 'rgba(255,255,255,0.6)'
};
