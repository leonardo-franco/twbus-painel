/**
 * Utilitários gerais para o sistema TwBus
 * Funções auxiliares reutilizáveis
 */

import { SYSTEM_CONFIG } from './constants.js';

/**
 * Utilitários de DOM
 */
export const DOMUtils = {
    /**
     * Seleciona um elemento por ID de forma segura
     * @param {string} id - ID do elemento
     * @returns {HTMLElement|null}
     */
    getElementById(id) {
        try {
            return document.getElementById(id);
        } catch (error) {
            console.warn(`Erro ao buscar elemento por ID: ${id}`, error);
            return null;
        }
    },

    /**
     * Seleciona um elemento por seletor de forma segura
     * @param {string} selector - Seletor CSS
     * @returns {HTMLElement|null}
     */
    querySelector(selector) {
        try {
            return document.querySelector(selector);
        } catch (error) {
            console.warn(`Erro ao buscar elemento por seletor: ${selector}`, error);
            return null;
        }
    },

    /**
     * Seleciona múltiplos elementos por seletor de forma segura
     * @param {string} selector - Seletor CSS
     * @returns {NodeList}
     */
    querySelectorAll(selector) {
        try {
            return document.querySelectorAll(selector);
        } catch (error) {
            console.warn(`Erro ao buscar elementos por seletor: ${selector}`, error);
            return [];
        }
    },

    /**
     * Cria elemento HTML de forma segura
     * @param {string} tagName - Nome da tag
     * @param {Object} attributes - Atributos do elemento
     * @param {string} textContent - Conteúdo de texto
     * @returns {HTMLElement}
     */
    createElement(tagName, attributes = {}, textContent = '') {
        try {
            const element = document.createElement(tagName);
            
            Object.entries(attributes).forEach(([key, value]) => {
                element.setAttribute(key, value);
            });
            
            if (textContent) {
                element.textContent = textContent;
            }
            
            return element;
        } catch (error) {
            console.error(`Erro ao criar elemento: ${tagName}`, error);
            return null;
        }
    },

    /**
     * Define atributos em um elemento de forma segura
     * @param {HTMLElement} element - Elemento DOM
     * @param {Object} attributes - Atributos para definir
     */
    setAttributes(element, attributes) {
        if (!element || typeof attributes !== 'object') return;
        
        Object.entries(attributes).forEach(([key, value]) => {
            try {
                element.setAttribute(key, value);
            } catch (error) {
                console.warn(`Erro ao definir atributo ${key}:`, error);
            }
        });
    },

    /**
     * Verifica se um elemento é válido
     * @param {*} element - Elemento a ser verificado
     * @returns {boolean}
     */
    isValidElement(element) {
        return element && element instanceof Element;
    }
};

/**
 * Utilitários de tempo
 */
export const TimeUtils = {
    /**
     * Formata timestamp para exibição
     * @param {Date} date - Data a ser formatada
     * @returns {string}
     */
    formatTimestamp(date = new Date()) {
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');
        return `${hours}:${minutes}`;
    },

    /**
     * Cria um delay com Promise
     * @param {number} ms - Milissegundos para esperar
     * @returns {Promise}
     */
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    },

    /**
     * Debounce de função
     * @param {Function} func - Função a ser debounced
     * @param {number} wait - Tempo de espera em ms
     * @param {Object} options - Opções de configuração
     * @returns {Function}
     */
    debounce(func, wait, options = {}) {
        let timeout;
        let lastArgs;
        
        return function executedFunction(...args) {
            if (typeof func !== 'function') {
                throw new Error('Debounce requer uma função válida');
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
    },

    /**
     * Throttle de função
     * @param {Function} func - Função a ser throttled
     * @param {number} limit - Limite de tempo em ms
     * @returns {Function}
     */
    throttle(func, limit) {
        let inThrottle;
        return function(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }
};

/**
 * Utilitários de validação
 */
export const ValidationUtils = {
    /**
     * Verifica se uma string é válida
     * @param {*} value - Valor a ser verificado
     * @returns {boolean}
     */
    isValidString(value) {
        return typeof value === 'string' && value.trim().length > 0;
    },

    /**
     * Verifica se um número é válido
     * @param {*} value - Valor a ser verificado
     * @returns {boolean}
     */
    isValidNumber(value) {
        return typeof value === 'number' && !isNaN(value) && isFinite(value);
    },

    /**
     * Verifica se uma função é válida
     * @param {*} value - Valor a ser verificado
     * @returns {boolean}
     */
    isValidFunction(value) {
        return typeof value === 'function';
    },

    /**
     * Sanitiza entrada de texto
     * @param {string} input - Texto a ser sanitizado
     * @returns {string}
     */
    sanitizeInput(input) {
        if (!this.isValidString(input)) {
            return '';
        }
        
        if (input.length > SYSTEM_CONFIG.SECURITY.MAX_INPUT_LENGTH) {
            console.warn('Input excede tamanho máximo permitido');
            return input.substring(0, SYSTEM_CONFIG.SECURITY.MAX_INPUT_LENGTH);
        }

        return input
            .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
            .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
            .replace(/javascript:/gi, '')
            .replace(/data:text\/html/gi, '')
            .replace(/on\w+\s*=/gi, '')
            .replace(/eval\s*\(/gi, '')
            .replace(/Function\s*\(/gi, '')
            .replace(/setTimeout\s*\(/gi, '')
            .replace(/setInterval\s*\(/gi, '')
            .trim();
    }
};

/**
 * Utilitários de animação
 */
export const AnimationUtils = {
    /**
     * Aplica animação de entrada em um elemento
     * @param {HTMLElement} element - Elemento a ser animado
     * @param {Object} options - Opções de animação
     */
    async fadeIn(element, options = {}) {
        if (!DOMUtils.isValidElement(element)) return;
        
        const {
            duration = SYSTEM_CONFIG.UI.ENTRANCE_ANIMATION_DURATION,
            delay = SYSTEM_CONFIG.UI.ENTRANCE_ANIMATION_DELAY,
            easing = 'ease'
        } = options;
        
        element.style.opacity = '0';
        element.style.transform = 'translateY(30px)';
        
        await TimeUtils.delay(delay);
        
        element.style.transition = `all ${duration}ms ${easing}`;
        element.style.opacity = '1';
        element.style.transform = 'translateY(0)';
    },

    /**
     * Aplica animação de saída em um elemento
     * @param {HTMLElement} element - Elemento a ser animado
     * @param {Object} options - Opções de animação
     */
    async fadeOut(element, options = {}) {
        if (!DOMUtils.isValidElement(element)) return;
        
        const {
            duration = SYSTEM_CONFIG.UI.ENTRANCE_ANIMATION_DURATION,
            easing = 'ease'
        } = options;
        
        element.style.transition = `all ${duration}ms ${easing}`;
        element.style.opacity = '0';
        element.style.transform = 'translateY(-30px)';
        
        await TimeUtils.delay(duration);
        element.style.display = 'none';
    },

    /**
     * Aplica animação de slide para elementos
     * @param {HTMLElement} element - Elemento a ser animado
     * @param {Object} options - Opções de animação
     */
    async slideIn(element, options = {}) {
        if (!DOMUtils.isValidElement(element)) return;
        
        const {
            duration = SYSTEM_CONFIG.UI.STOP_ANIMATION_DURATION,
            delay = 0,
            direction = 'left',
            easing = 'ease'
        } = options;
        
        const transform = direction === 'left' ? 'translateX(-20px)' : 'translateX(20px)';
        
        element.style.opacity = '0';
        element.style.transform = transform;
        element.style.display = 'flex';
        
        await TimeUtils.delay(delay);
        
        element.style.transition = `all ${duration}ms ${easing}`;
        element.style.opacity = '1';
        element.style.transform = 'translateX(0)';
    },

    /**
     * Aplica animação de scale em um elemento
     * @param {HTMLElement} element - Elemento a ser animado
     * @param {Object} options - Opções de animação
     */
    async scaleAnimation(element, options = {}) {
        if (!DOMUtils.isValidElement(element)) return;
        
        const {
            scale = 0.95,
            duration = SYSTEM_CONFIG.UI.HOVER_ANIMATION_DURATION,
            resetDelay = duration
        } = options;
        
        element.style.transform = `scale(${scale})`;
        
        await TimeUtils.delay(resetDelay);
        element.style.transform = 'scale(1)';
    }
};

/**
 * Utilitários de armazenamento
 */
export const StorageUtils = {
    /**
     * Salva item no localStorage de forma segura
     * @param {string} key - Chave do item
     * @param {*} value - Valor a ser salvo
     * @returns {boolean}
     */
    setItem(key, value) {
        try {
            const serializedValue = JSON.stringify(value);
            localStorage.setItem(key, serializedValue);
            return true;
        } catch (error) {
            console.error('Erro ao salvar no localStorage:', error);
            return false;
        }
    },

    /**
     * Recupera item do localStorage de forma segura
     * @param {string} key - Chave do item
     * @param {*} defaultValue - Valor padrão se não encontrar
     * @returns {*}
     */
    getItem(key, defaultValue = null) {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : defaultValue;
        } catch (error) {
            console.error('Erro ao recuperar do localStorage:', error);
            return defaultValue;
        }
    },

    /**
     * Remove item do localStorage de forma segura
     * @param {string} key - Chave do item
     * @returns {boolean}
     */
    removeItem(key) {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (error) {
            console.error('Erro ao remover do localStorage:', error);
            return false;
        }
    },

    /**
     * Verifica se localStorage está disponível
     * @returns {boolean}
     */
    isAvailable() {
        try {
            const test = '__localStorage_test__';
            localStorage.setItem(test, 'test');
            localStorage.removeItem(test);
            return true;
        } catch (error) {
            return false;
        }
    }
};

/**
 * Utilitários de log
 */
export const LogUtils = {
    /**
     * Log com formatação específica do sistema
     * @param {string} level - Nível do log (info, warn, error)
     * @param {string} message - Mensagem do log
     * @param {*} data - Dados adicionais
     */
    log(level, message, data = null) {
        const timestamp = new Date().toISOString();
        const formattedMessage = `[${timestamp}] [${level.toUpperCase()}] ${message}`;
        
        switch (level) {
            case 'info':
                console.info(formattedMessage, data || '');
                break;
            case 'warn':
                console.warn(formattedMessage, data || '');
                break;
            case 'error':
                console.error(formattedMessage, data || '');
                break;
            default:
                console.log(formattedMessage, data || '');
        }
    },

    info(message, data) {
        this.log('info', message, data);
    },

    warn(message, data) {
        this.log('warn', message, data);
    },

    error(message, data) {
        this.log('error', message, data);
    }
};
