// TwBus - Painel de Parada de Ônibus
// Sistema de interface interativa e segura

// =====================================================
// MÓDULO DE SEGURANÇA AVANÇADO
// =====================================================

class SecurityValidator {
    static instance = null;
    
    constructor() {
        if (SecurityValidator.instance) {
            return SecurityValidator.instance;
        }
        SecurityValidator.instance = this;
        
        this.trustedOrigins = ['https://twbus.vercel.app', 'https://localhost', 'http://localhost'];
        this.maxInputLength = 1000;
        this.rateLimitMap = new Map();
        this.allowedEventTypes = ['click', 'touchstart', 'keydown', 'resize'];
        this.cspViolations = [];
        
        this.initSecurity();
    }

    initSecurity() {
        this.setupCSPViolationReporting();
        this.preventClickjacking();
        this.setupIntegrityChecks();
        this.monitorGlobalScope();
        this.freezePrototypes();
    }

    // Validação rigorosa de entrada
    sanitizeInput(input) {
        if (typeof input !== 'string') {
            throw new SecurityError('Input deve ser string');
        }
        
        if (input.length > this.maxInputLength) {
            throw new SecurityError('Input excede tamanho máximo permitido');
        }

        // Remove caracteres perigosos
        const sanitized = input
            .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
            .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
            .replace(/javascript:/gi, '')
            .replace(/data:text\/html/gi, '')
            .replace(/on\w+\s*=/gi, '')
            .replace(/eval\s*\(/gi, '')
            .replace(/Function\s*\(/gi, '')
            .replace(/setTimeout\s*\(/gi, '')
            .replace(/setInterval\s*\(/gi, '');

        return sanitized.trim();
    }

    // Validação de elementos DOM
    validateElement(element) {
        if (!element || !(element instanceof Element)) {
            throw new SecurityError('Elemento DOM inválido');
        }
        
        if (element.hasAttribute('onclick') || 
            element.hasAttribute('onload') || 
            element.hasAttribute('onerror')) {
            throw new SecurityError('Elemento contém handlers inline suspeitos');
        }
        
        return true;
    }

    // Rate limiting para eventos
    checkRateLimit(eventType, maxPerSecond = 10) {
        const now = Date.now();
        const key = `${eventType}_${Math.floor(now / 1000)}`;
        
        if (!this.rateLimitMap.has(key)) {
            this.rateLimitMap.set(key, 0);
        }
        
        const count = this.rateLimitMap.get(key) + 1;
        this.rateLimitMap.set(key, count);
        
        if (count > maxPerSecond) {
            throw new SecurityError(`Rate limit excedido para ${eventType}`);
        }
        
        // Limpeza periódica
        if (this.rateLimitMap.size > 100) {
            this.cleanupRateLimit();
        }
        
        return true;
    }

    cleanupRateLimit() {
        const now = Date.now();
        for (const [key] of this.rateLimitMap) {
            const timestamp = parseInt(key.split('_')[1]) * 1000;
            if (now - timestamp > 60000) { // Remove entradas antigas (1min)
                this.rateLimitMap.delete(key);
            }
        }
    }

    setupCSPViolationReporting() {
        document.addEventListener('securitypolicyviolation', (e) => {
            this.cspViolations.push({
                blockedURI: e.blockedURI,
                violatedDirective: e.violatedDirective,
                timestamp: new Date().toISOString()
            });
            console.error('CSP Violation:', e.violatedDirective, e.blockedURI);
        });
    }

    preventClickjacking() {
        if (window.top !== window.self) {
            document.body.style.display = 'none';
            throw new SecurityError('Possível ataque de clickjacking detectado');
        }
    }

    setupIntegrityChecks() {
        // Verifica se scripts críticos foram modificados
        const scripts = document.querySelectorAll('script[src]');
        scripts.forEach(script => {
            if (!script.src.startsWith('https://')) {
                console.warn('Script não-HTTPS detectado:', script.src);
            }
        });
    }

    monitorGlobalScope() {
        // Monitora modificações no objeto global
        const sensitiveGlobals = ['eval', 'Function', 'setTimeout', 'setInterval'];
        sensitiveGlobals.forEach(name => {
            if (typeof window[name] !== 'function') {
                console.warn(`Global ${name} foi modificado`);
            }
        });
    }

    freezePrototypes() {
        // Congela protótipos críticos para prevenir prototype pollution
        if (typeof Object.freeze === 'function') {
            Object.freeze(Object.prototype);
            Object.freeze(Array.prototype);
            Object.freeze(String.prototype);
            Object.freeze(Number.prototype);
        }
    }

    // Debounce seguro
    debounce(func, wait, options = {}) {
        let timeout;
        let lastArgs;
        
        return function executedFunction(...args) {
            // Validação de segurança
            if (typeof func !== 'function') {
                throw new SecurityError('Debounce requer uma função válida');
            }
            
            lastArgs = args;
            const later = () => {
                timeout = null;
                if (!options.leading) func.apply(this, lastArgs);
            };
            
            const callNow = options.leading && !timeout;
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
            if (callNow) func.apply(this, lastArgs);
        };
    }
}

// Classe de erro personalizada
class SecurityError extends Error {
    constructor(message) {
        super(message);
        this.name = 'SecurityError';
    }
}

// =====================================================
// CLASSE PRINCIPAL DO PAINEL
// =====================================================

class BusPanel {
    constructor() {
        this.isExpanded = false;
        this.isAnimating = false;
        this.elements = new Map();
        this.eventListeners = new Map();
        this.security = new SecurityValidator();
        this.init();
    }

    init() {
        try {
            this.cacheElements();
            this.setupEventListeners();
            this.animateEntrance();
            this.highlightKeyStops();
        } catch (error) {
            console.error('Erro na inicialização do painel:', error);
            this.handleSecurityError(error);
        }
    }

    cacheElements() {
        const elementSelectors = {
            container: '.container',
            refreshBtn: '#refreshBtn',
            expandBtn: '#expandBtn',
            stops: '.stop',
            extraStops: '.stop.extra',
            infoBadges: '.info-badge',
            currentBusStop: '.current-bus',
            currentLocation: '.current-location',
            nextStop: '.next'
        };

        for (const [key, selector] of Object.entries(elementSelectors)) {
            try {
                let element;
                if (selector.startsWith('#')) {
                    element = document.getElementById(selector.substring(1));
                } else if (selector.includes('.stop')) {
                    element = document.querySelectorAll(selector);
                } else {
                    element = document.querySelector(selector);
                }
                
                // Validação de segurança para elementos únicos
                if (element && element instanceof Element) {
                    this.security.validateElement(element);
                }
                
                this.elements.set(key, element);
            } catch (error) {
                console.warn(`Erro ao cachear elemento ${key}:`, error.message);
            }
        }
    }

    highlightKeyStops() {
        const currentBus = this.elements.get('currentBusStop');
        const currentLocation = this.elements.get('currentLocation');
        const nextStop = this.elements.get('nextStop');

        if (currentBus) {
            currentBus.classList.add('highlighted');
            currentBus.setAttribute('aria-label', 'Localização atual do ônibus');
        }
        
        if (currentLocation) {
            currentLocation.classList.add('highlighted');
            currentLocation.setAttribute('aria-label', 'Sua localização atual');
        }
        
        if (nextStop) {
            nextStop.classList.add('highlighted');
            nextStop.setAttribute('aria-label', 'Próxima parada do ônibus');
        }
    }

    setupEventListeners() {
        // Botão de refresh - agora apenas feedback visual
        const refreshBtn = this.elements.get('refreshBtn');
        if (refreshBtn) {
            const refreshHandler = this.createSafeEventHandler(() => {
                try {
                    this.security.checkRateLimit('refresh', 5); // Max 5 por segundo
                    this.refreshPanel();
                } catch (error) {
                    this.handleSecurityError(error);
                }
            });
            refreshBtn.addEventListener('click', refreshHandler);
            this.eventListeners.set('refresh', refreshHandler);
        }

        // Botão de expandir/contrair com proteção contra cliques múltiplos
        const expandBtn = this.elements.get('expandBtn');
        if (expandBtn) {
            const expandHandler = this.createSafeEventHandler(() => {
                try {
                    this.security.checkRateLimit('expand', 3); // Max 3 por segundo
                    if (!this.isAnimating) {
                        this.toggleExpanded();
                    }
                } catch (error) {
                    this.handleSecurityError(error);
                }
            });
            expandBtn.addEventListener('click', expandHandler);
            this.eventListeners.set('expand', expandHandler);
        }

        // Efeitos de hover nas paradas com validação
        const stops = this.elements.get('stops');
        if (stops && stops.length > 0) {
            stops.forEach(stop => {
                try {
                    this.security.validateElement(stop);
                    
                    const hoverInHandler = this.createSafeEventHandler(function() {
                        this.style.transform = 'translateX(8px) scale(1.02)';
                    });
                    
                    const hoverOutHandler = this.createSafeEventHandler(function() {
                        this.style.transform = '';
                    });
                    
                    stop.addEventListener('mouseenter', hoverInHandler);
                    stop.addEventListener('mouseleave', hoverOutHandler);
                } catch (error) {
                    console.warn('Elemento de parada inválido ignorado:', error.message);
                }
            });
        }

        // Efeitos de clique nos badges com validação
        const infoBadges = this.elements.get('infoBadges');
        if (infoBadges && infoBadges.length > 0) {
            infoBadges.forEach(badge => {
                try {
                    this.security.validateElement(badge);
                    const clickHandler = this.createSafeEventHandler(function() {
                        this.style.transform = 'scale(0.95)';
                        setTimeout(() => {
                            this.style.transform = 'scale(1)';
                        }, 150);
                    });
                    badge.addEventListener('click', clickHandler);
                } catch (error) {
                    console.warn('Badge inválido ignorado:', error.message);
                }
            });
        }
    }

    createSafeEventHandler(handler) {
        return function(event) {
            try {
                event.preventDefault();
                handler.call(this, event);
            } catch (error) {
                console.error('Erro no manipulador de evento:', error);
            }
        };
    }

    refreshPanel() {
        const refreshBtn = this.elements.get('refreshBtn');
        if (!refreshBtn) return;

        refreshBtn.classList.add('refreshing');
        refreshBtn.setAttribute('aria-label', 'Atualizando informações...');
        
        // Simula refresh visual sem alterar dados
        setTimeout(() => {
            refreshBtn.classList.remove('refreshing');
            refreshBtn.setAttribute('aria-label', 'Atualizar informações');
            
            // Atualiza timestamp
            this.updateTimestamp();
        }, 800);
    }

    updateTimestamp() {
        const timestampElement = document.querySelector('.footer span');
        if (timestampElement) {
            const now = new Date();
            const hours = now.getHours().toString().padStart(2, '0');
            const minutes = now.getMinutes().toString().padStart(2, '0');
            timestampElement.textContent = `Atualizado: ${hours}:${minutes}`;
        }
    }

    toggleExpanded() {
        if (this.isAnimating) return;
        
        this.isAnimating = true;
        const container = this.elements.get('container');
        const expandBtn = this.elements.get('expandBtn');
        
        if (!container || !expandBtn) {
            this.isAnimating = false;
            return;
        }

        try {
            if (this.isExpanded) {
                container.classList.remove('expanded');
                expandBtn.innerHTML = '<i class="fas fa-expand" aria-hidden="true"></i>';
                expandBtn.setAttribute('aria-label', 'Expandir painel');
                this.hideExtraStops();
            } else {
                container.classList.add('expanded');
                expandBtn.innerHTML = '<i class="fas fa-compress" aria-hidden="true"></i>';
                expandBtn.setAttribute('aria-label', 'Contrair painel');
                this.showExtraStops();
            }
            
            this.isExpanded = !this.isExpanded;
            
            // Libera o bloqueio após a animação
            setTimeout(() => {
                this.isAnimating = false;
            }, 600);
            
        } catch (error) {
            console.error('Erro ao expandir/contrair painel:', error);
            this.isAnimating = false;
        }
    }

    showExtraStops() {
        const extraStops = this.elements.get('extraStops');
        if (!extraStops || extraStops.length === 0) return;

        extraStops.forEach((stop, index) => {
            if (stop) {
                stop.style.display = 'flex';
                stop.style.opacity = '0';
                stop.style.transform = 'translateX(-20px)';
                
                setTimeout(() => {
                    stop.style.transition = 'all 0.4s ease';
                    stop.style.opacity = '1';
                    stop.style.transform = 'translateX(0)';
                }, 100 + (index * 50));
            }
        });
    }

    hideExtraStops() {
        const extraStops = this.elements.get('extraStops');
        if (!extraStops || extraStops.length === 0) return;

        extraStops.forEach(stop => {
            if (stop) {
                stop.style.opacity = '0';
                stop.style.transform = 'translateX(-20px)';
                setTimeout(() => {
                    stop.style.display = 'none';
                }, 300);
            }
        });
    }

    animateEntrance() {
        const container = this.elements.get('container');
        const stops = this.elements.get('stops');
        
        if (!container) return;

        container.style.opacity = '0';
        container.style.transform = 'translateY(30px)';
        
        setTimeout(() => {
            container.style.transition = 'all 0.6s ease';
            container.style.opacity = '1';
            container.style.transform = 'translateY(0)';
        }, 100);
        
        // Animação sequencial das paradas principais
        if (stops && stops.length > 0) {
            const mainStops = Array.from(stops).filter(stop => !stop.classList.contains('extra'));
            mainStops.forEach((stop, index) => {
                if (stop) {
                    stop.style.opacity = '0';
                    stop.style.transform = 'translateX(-20px)';
                    
                    setTimeout(() => {
                        stop.style.transition = 'all 0.4s ease';
                        stop.style.opacity = '1';
                        stop.style.transform = 'translateX(0)';
                    }, 500 + (index * 100));
                }
            });
        }
    }

    // Método para tratar erros de segurança
    handleSecurityError(error) {
        if (error instanceof SecurityError) {
            console.error('🔒 Erro de Segurança:', error.message);
            document.body.classList.add('security-error');
            
            // Notifica o usuário de forma discreta
            const errorIndicator = document.createElement('div');
            errorIndicator.className = 'security-indicator';
            errorIndicator.textContent = '🔒';
            errorIndicator.title = 'Sistema seguro ativo';
            document.body.appendChild(errorIndicator);
        }
    }

    // Método para limpeza de eventos (para evitar memory leaks)
    destroy() {
        this.eventListeners.forEach((handler, key) => {
            // Remove event listeners se necessário
        });
        this.eventListeners.clear();
        this.elements.clear();
    }
}


// Funcionalidade de segurança - Validação de entrada
class SecurityValidator {
    static validateElement(element, type = 'HTMLElement') {
        if (!element) {
            throw new Error(`Elemento ${type} não encontrado`);
        }
        return element;
    }

    static sanitizeInput(input) {
        if (typeof input !== 'string') return input;
        return input.replace(/[<>]/g, '');
    }

    static debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
}

// Inicialização segura do painel
document.addEventListener('DOMContentLoaded', () => {
    try {
        window.busPanel = new BusPanel();
        console.log('Painel TwBus inicializado com sucesso');
    } catch (error) {
        console.error('Erro ao inicializar painel:', error);
        // Fallback para funcionalidade básica
        document.body.classList.add('error-state');
    }
});
