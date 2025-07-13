/**
 * Sistema de segurança avançado para TwBus
 * Implementa validações, rate limiting e proteções contra ataques
 */

import { SYSTEM_CONFIG } from '../utils/constants.js';
import { ValidationUtils, LogUtils } from '../utils/helpers.js';

/**
 * Classe de erro personalizada para segurança
 */
export class SecurityError extends Error {
    constructor(message, code = 'SECURITY_ERROR') {
        super(message);
        this.name = 'SecurityError';
        this.code = code;
        this.timestamp = new Date().toISOString();
    }
}

/**
 * Validador de segurança principal
 */
export class SecurityValidator {
    /**
     * Singleton pattern para garantir uma única instância
     */
    static instance = null;
    
    constructor() {
        if (SecurityValidator.instance) {
            return SecurityValidator.instance;
        }
        
        SecurityValidator.instance = this;
        this.initializeValidator();
    }

    /**
     * Inicializa o validador de segurança
     */
    initializeValidator() {
        this.trustedOrigins = [...SYSTEM_CONFIG.SECURITY.TRUSTED_ORIGINS];
        this.maxInputLength = SYSTEM_CONFIG.SECURITY.MAX_INPUT_LENGTH;
        this.rateLimitMap = new Map();
        this.allowedEventTypes = [...SYSTEM_CONFIG.SECURITY.ALLOWED_EVENT_TYPES];
        this.cspViolations = [];
        this.securityMetrics = {
            totalViolations: 0,
            rateLimitHits: 0,
            sanitizedInputs: 0,
            blockedRequests: 0
        };
        
        this.setupSecurityMeasures();
    }

    /**
     * Configura medidas de segurança inicial
     */
    setupSecurityMeasures() {
        try {
            this.setupCSPViolationReporting();
            this.preventClickjacking();
            this.setupIntegrityChecks();
            this.monitorGlobalScope();
            this.freezePrototypes();
            this.setupSecurityHeaders();
        } catch (error) {
            LogUtils.error('Erro ao configurar medidas de segurança:', error);
        }
    }

    /**
     * Configura relatórios de violação de CSP
     */
    setupCSPViolationReporting() {
        document.addEventListener('securitypolicyviolation', (event) => {
            const violation = {
                blockedURI: event.blockedURI,
                violatedDirective: event.violatedDirective,
                originalPolicy: event.originalPolicy,
                timestamp: new Date().toISOString(),
                userAgent: navigator.userAgent
            };
            
            this.cspViolations.push(violation);
            this.securityMetrics.totalViolations++;
            
            LogUtils.error('CSP Violation detected:', violation);
            
            // Notificar sistema de monitoramento se configurado
            this.reportSecurityIncident('CSP_VIOLATION', violation);
        });
    }

    /**
     * Previne ataques de clickjacking
     */
    preventClickjacking() {
        if (window.top !== window.self) {
            document.body.style.display = 'none';
            throw new SecurityError('Possível ataque de clickjacking detectado', 'CLICKJACKING_DETECTED');
        }
    }

    /**
     * Configura verificações de integridade
     */
    setupIntegrityChecks() {
        const scripts = document.querySelectorAll('script[src]');
        scripts.forEach(script => {
            if (!script.src.startsWith('https://') && !script.src.startsWith('http://localhost')) {
                LogUtils.warn('Script não-HTTPS detectado:', script.src);
            }
            
            // Verificar se script tem atributo integrity
            if (!script.hasAttribute('integrity') && !script.src.includes('localhost')) {
                LogUtils.warn('Script sem verificação de integridade:', script.src);
            }
        });
    }

    /**
     * Monitora modificações no escopo global
     */
    monitorGlobalScope() {
        const sensitiveGlobals = SYSTEM_CONFIG.SECURITY.SENSITIVE_GLOBALS;
        
        sensitiveGlobals.forEach(name => {
            const originalValue = window[name];
            
            if (typeof originalValue !== 'function') {
                LogUtils.warn(`Global ${name} foi modificado ou não é uma função`);
                return;
            }
            
            // Monitorar modificações futuras
            Object.defineProperty(window, name, {
                get() {
                    return originalValue;
                },
                set(newValue) {
                    LogUtils.warn(`Tentativa de modificar global ${name}`, { newValue });
                    this.reportSecurityIncident('GLOBAL_MODIFICATION', { global: name, newValue });
                },
                configurable: false
            });
        });
    }

    /**
     * Congela protótipos para prevenir prototype pollution
     */
    freezePrototypes() {
        if (typeof Object.freeze === 'function') {
            try {
                Object.freeze(Object.prototype);
                Object.freeze(Array.prototype);
                Object.freeze(String.prototype);
                Object.freeze(Number.prototype);
                Object.freeze(Boolean.prototype);
                Object.freeze(Date.prototype);
                Object.freeze(RegExp.prototype);
            } catch (error) {
                LogUtils.warn('Erro ao congelar protótipos:', error);
            }
        }
    }

    /**
     * Configura headers de segurança
     */
    setupSecurityHeaders() {
        // Verificar se headers de segurança estão presentes
        const securityHeaders = [
            'X-Content-Type-Options',
            'X-Frame-Options',
            'X-XSS-Protection',
            'Strict-Transport-Security',
            'Content-Security-Policy'
        ];

        securityHeaders.forEach(header => {
            // Em um ambiente real, isso seria verificado no servidor
            // Aqui, apenas logamos para auditoria
            LogUtils.info(`Verificando header de segurança: ${header}`);
        });
    }

    /**
     * Sanitiza entrada de dados
     * @param {string} input - Entrada a ser sanitizada
     * @returns {string} - Entrada sanitizada
     */
    sanitizeInput(input) {
        try {
            if (!ValidationUtils.isValidString(input)) {
                throw new SecurityError('Input deve ser uma string válida', 'INVALID_INPUT');
            }
            
            if (input.length > this.maxInputLength) {
                throw new SecurityError(`Input excede tamanho máximo permitido (${this.maxInputLength})`, 'INPUT_TOO_LONG');
            }

            this.securityMetrics.sanitizedInputs++;
            return ValidationUtils.sanitizeInput(input);
        } catch (error) {
            LogUtils.error('Erro na sanitização de input:', error);
            throw error;
        }
    }

    /**
     * Valida elemento DOM
     * @param {HTMLElement} element - Elemento a ser validado
     * @returns {boolean} - True se válido
     */
    validateElement(element) {
        try {
            if (!element || !(element instanceof Element)) {
                throw new SecurityError('Elemento DOM inválido', 'INVALID_DOM_ELEMENT');
            }
            
            // Verificar atributos perigosos
            const dangerousAttributes = [
                'onclick', 'onload', 'onerror', 'onmouseover', 'onmouseout',
                'onfocus', 'onblur', 'onchange', 'onsubmit', 'onreset'
            ];
            
            dangerousAttributes.forEach(attr => {
                if (element.hasAttribute(attr)) {
                    throw new SecurityError(`Elemento contém atributo perigoso: ${attr}`, 'DANGEROUS_ATTRIBUTE');
                }
            });
            
            // Verificar conteúdo perigoso
            if (element.innerHTML.includes('<script>') || element.innerHTML.includes('javascript:')) {
                throw new SecurityError('Elemento contém conteúdo perigoso', 'DANGEROUS_CONTENT');
            }
            
            return true;
        } catch (error) {
            LogUtils.error('Erro na validação de elemento:', error);
            throw error;
        }
    }

    /**
     * Implementa rate limiting
     * @param {string} eventType - Tipo de evento
     * @param {number} maxPerSecond - Máximo por segundo
     * @returns {boolean} - True se permitido
     */
    checkRateLimit(eventType, maxPerSecond = SYSTEM_CONFIG.SECURITY.RATE_LIMIT_MAX_PER_SECOND) {
        try {
            const now = Date.now();
            const key = `${eventType}_${Math.floor(now / 1000)}`;
            
            if (!this.rateLimitMap.has(key)) {
                this.rateLimitMap.set(key, 0);
            }
            
            const count = this.rateLimitMap.get(key) + 1;
            this.rateLimitMap.set(key, count);
            
            if (count > maxPerSecond) {
                this.securityMetrics.rateLimitHits++;
                throw new SecurityError(`Rate limit excedido para ${eventType}`, 'RATE_LIMIT_EXCEEDED');
            }
            
            // Limpeza periódica
            if (this.rateLimitMap.size > SYSTEM_CONFIG.SECURITY.RATE_LIMIT_CLEANUP_THRESHOLD) {
                this.cleanupRateLimit();
            }
            
            return true;
        } catch (error) {
            LogUtils.error('Erro no rate limiting:', error);
            throw error;
        }
    }

    /**
     * Limpa entradas antigas do rate limit
     */
    cleanupRateLimit() {
        const now = Date.now();
        const cleanupThreshold = SYSTEM_CONFIG.SECURITY.RATE_LIMIT_CLEANUP_TIMEOUT;
        
        for (const [key] of this.rateLimitMap) {
            try {
                const timestamp = parseInt(key.split('_')[1]) * 1000;
                if (now - timestamp > cleanupThreshold) {
                    this.rateLimitMap.delete(key);
                }
            } catch (error) {
                // Remove chaves malformadas
                this.rateLimitMap.delete(key);
            }
        }
    }

    /**
     * Valida origem da requisição
     * @param {string} origin - Origem a ser validada
     * @returns {boolean} - True se confiável
     */
    validateOrigin(origin) {
        if (!origin) {
            return false;
        }
        
        return this.trustedOrigins.some(trusted => 
            origin === trusted || origin.startsWith(trusted)
        );
    }

    /**
     * Cria handler de evento seguro
     * @param {Function} handler - Handler original
     * @returns {Function} - Handler seguro
     */
    createSecureEventHandler(handler) {
        return (event) => {
            try {
                // Validar tipo de evento
                if (!this.allowedEventTypes.includes(event.type)) {
                    throw new SecurityError(`Tipo de evento não permitido: ${event.type}`, 'INVALID_EVENT_TYPE');
                }
                
                // Prevenir comportamento padrão perigoso
                if (event.type === 'click' && event.target) {
                    this.validateElement(event.target);
                }
                
                // Executar handler original
                return handler.call(this, event);
            } catch (error) {
                LogUtils.error('Erro no handler de evento seguro:', error);
                this.reportSecurityIncident('EVENT_HANDLER_ERROR', { 
                    eventType: event.type, 
                    error: error.message 
                });
            }
        };
    }

    /**
     * Reporta incidente de segurança
     * @param {string} type - Tipo do incidente
     * @param {Object} details - Detalhes do incidente
     */
    reportSecurityIncident(type, details) {
        const incident = {
            type,
            details,
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent,
            url: window.location.href,
            metrics: this.securityMetrics
        };
        
        LogUtils.error(`Incidente de segurança: ${type}`, incident);
        
        // Em produção, isso seria enviado para um sistema de monitoramento
        console.groupCollapsed(`🔒 Incidente de Segurança: ${type}`);
        console.error('Detalhes:', incident);
        console.groupEnd();
    }

    /**
     * Obtém métricas de segurança
     * @returns {Object} - Métricas de segurança
     */
    getSecurityMetrics() {
        return {
            ...this.securityMetrics,
            cspViolations: this.cspViolations.length,
            rateLimitMapSize: this.rateLimitMap.size,
            timestamp: new Date().toISOString()
        };
    }

    /**
     * Reseta métricas de segurança
     */
    resetSecurityMetrics() {
        this.securityMetrics = {
            totalViolations: 0,
            rateLimitHits: 0,
            sanitizedInputs: 0,
            blockedRequests: 0
        };
        this.cspViolations = [];
        this.rateLimitMap.clear();
    }
}

/**
 * Instância singleton do validador de segurança
 */
export const securityValidator = new SecurityValidator();
