/**
 * Gerenciador de eventos centralizado para TwBus
 * Implementa padrão Observer para comunicação entre componentes
 */

import { LogUtils } from '../utils/helpers.js';
import { securityValidator } from '../security/SecurityValidator.js';

/**
 * Classe para gerenciar eventos do sistema
 */
export class EventManager {
    static instance = null;
    
    constructor() {
        if (EventManager.instance) {
            return EventManager.instance;
        }
        
        EventManager.instance = this;
        this.events = new Map();
        this.eventHistory = [];
        this.maxHistorySize = 100;
    }

    /**
     * Registra um listener para um evento
     * @param {string} eventName - Nome do evento
     * @param {Function} listener - Função listener
     * @param {Object} options - Opções do listener
     */
    on(eventName, listener, options = {}) {
        try {
            if (typeof listener !== 'function') {
                throw new Error('Listener deve ser uma função');
            }

            if (!this.events.has(eventName)) {
                this.events.set(eventName, new Set());
            }

            const wrappedListener = {
                fn: listener,
                once: options.once || false,
                priority: options.priority || 0,
                context: options.context || null,
                id: this.generateListenerId()
            };

            this.events.get(eventName).add(wrappedListener);
            
            LogUtils.info(`Listener registrado para evento: ${eventName}`);
            return wrappedListener.id;
        } catch (error) {
            LogUtils.error('Erro ao registrar listener:', error);
            throw error;
        }
    }

    /**
     * Remove um listener de um evento
     * @param {string} eventName - Nome do evento
     * @param {string|Function} listenerOrId - ID do listener ou função
     */
    off(eventName, listenerOrId) {
        try {
            if (!this.events.has(eventName)) {
                return false;
            }

            const listeners = this.events.get(eventName);
            
            for (const listener of listeners) {
                if (listener.id === listenerOrId || listener.fn === listenerOrId) {
                    listeners.delete(listener);
                    LogUtils.info(`Listener removido do evento: ${eventName}`);
                    return true;
                }
            }

            return false;
        } catch (error) {
            LogUtils.error('Erro ao remover listener:', error);
            return false;
        }
    }

    /**
     * Registra um listener que será executado apenas uma vez
     * @param {string} eventName - Nome do evento
     * @param {Function} listener - Função listener
     * @param {Object} options - Opções do listener
     */
    once(eventName, listener, options = {}) {
        return this.on(eventName, listener, { ...options, once: true });
    }

    /**
     * Emite um evento para todos os listeners
     * @param {string} eventName - Nome do evento
     * @param {*} data - Dados do evento
     */
    emit(eventName, data = null) {
        try {
            if (!this.events.has(eventName)) {
                return false;
            }

            const listeners = Array.from(this.events.get(eventName));
            
            // Ordenar por prioridade (maior prioridade primeiro)
            listeners.sort((a, b) => b.priority - a.priority);

            const event = {
                name: eventName,
                data,
                timestamp: new Date().toISOString(),
                preventDefault: false,
                stopPropagation: false
            };

            // Adicionar ao histórico
            this.addToHistory(event);

            let listenersExecuted = 0;

            for (const listener of listeners) {
                try {
                    if (event.stopPropagation) {
                        break;
                    }

                    // Executar listener no contexto apropriado
                    const context = listener.context || this;
                    listener.fn.call(context, event);
                    
                    listenersExecuted++;

                    // Remover listener se for 'once'
                    if (listener.once) {
                        this.events.get(eventName).delete(listener);
                    }
                } catch (error) {
                    LogUtils.error(`Erro ao executar listener para evento ${eventName}:`, error);
                }
            }

            LogUtils.info(`Evento ${eventName} emitido para ${listenersExecuted} listeners`);
            return listenersExecuted > 0;
        } catch (error) {
            LogUtils.error('Erro ao emitir evento:', error);
            return false;
        }
    }

    /**
     * Remove todos os listeners de um evento
     * @param {string} eventName - Nome do evento
     */
    removeAllListeners(eventName = null) {
        try {
            if (eventName) {
                this.events.delete(eventName);
                LogUtils.info(`Todos os listeners removidos do evento: ${eventName}`);
            } else {
                this.events.clear();
                LogUtils.info('Todos os listeners removidos');
            }
        } catch (error) {
            LogUtils.error('Erro ao remover listeners:', error);
        }
    }

    /**
     * Lista todos os eventos registrados
     * @returns {Array} - Lista de eventos
     */
    getRegisteredEvents() {
        return Array.from(this.events.keys());
    }

    /**
     * Obtém número de listeners para um evento
     * @param {string} eventName - Nome do evento
     * @returns {number} - Número de listeners
     */
    getListenerCount(eventName) {
        return this.events.has(eventName) ? this.events.get(eventName).size : 0;
    }

    /**
     * Gera ID único para listener
     * @returns {string} - ID único
     */
    generateListenerId() {
        return `listener_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * Adiciona evento ao histórico
     * @param {Object} event - Evento para adicionar
     */
    addToHistory(event) {
        this.eventHistory.push(event);
        
        // Manter histórico limitado
        if (this.eventHistory.length > this.maxHistorySize) {
            this.eventHistory.shift();
        }
    }

    /**
     * Obtém histórico de eventos
     * @param {number} limit - Limite de eventos
     * @returns {Array} - Histórico de eventos
     */
    getEventHistory(limit = 10) {
        return this.eventHistory.slice(-limit);
    }

    /**
     * Limpa histórico de eventos
     */
    clearHistory() {
        this.eventHistory = [];
    }

    /**
     * Obtém estatísticas do gerenciador de eventos
     * @returns {Object} - Estatísticas
     */
    getStats() {
        const stats = {
            totalEvents: this.events.size,
            totalListeners: 0,
            eventHistory: this.eventHistory.length,
            events: {}
        };

        for (const [eventName, listeners] of this.events) {
            stats.totalListeners += listeners.size;
            stats.events[eventName] = listeners.size;
        }

        return stats;
    }
}

/**
 * Instância singleton do gerenciador de eventos
 */
export const eventManager = new EventManager();

/**
 * Classe para gerenciar eventos DOM de forma segura
 */
export class DOMEventManager {
    constructor() {
        this.registeredEvents = new Map();
        this.eventListeners = new Map();
    }

    /**
     * Adiciona listener de evento DOM de forma segura
     * @param {HTMLElement} element - Elemento DOM
     * @param {string} eventType - Tipo de evento
     * @param {Function} handler - Handler do evento
     * @param {Object} options - Opções do evento
     */
    addEventListener(element, eventType, handler, options = {}) {
        try {
            // Validar elemento
            securityValidator.validateElement(element);
            
            // Criar handler seguro
            const secureHandler = securityValidator.createSecureEventHandler(handler);
            
            // Registrar evento
            const eventId = this.generateEventId();
            element.addEventListener(eventType, secureHandler, options);
            
            // Armazenar referência para limpeza
            this.registeredEvents.set(eventId, {
                element,
                eventType,
                handler: secureHandler,
                options,
                timestamp: new Date().toISOString()
            });
            
            LogUtils.info(`Evento DOM registrado: ${eventType}`, { eventId });
            return eventId;
        } catch (error) {
            LogUtils.error('Erro ao adicionar listener DOM:', error);
            throw error;
        }
    }

    /**
     * Remove listener de evento DOM
     * @param {string} eventId - ID do evento
     */
    removeEventListener(eventId) {
        try {
            if (!this.registeredEvents.has(eventId)) {
                return false;
            }

            const eventData = this.registeredEvents.get(eventId);
            eventData.element.removeEventListener(
                eventData.eventType,
                eventData.handler,
                eventData.options
            );

            this.registeredEvents.delete(eventId);
            LogUtils.info(`Evento DOM removido: ${eventData.eventType}`, { eventId });
            return true;
        } catch (error) {
            LogUtils.error('Erro ao remover listener DOM:', error);
            return false;
        }
    }

    /**
     * Remove todos os listeners de um elemento
     * @param {HTMLElement} element - Elemento DOM
     */
    removeAllListeners(element) {
        try {
            const eventsToRemove = [];
            
            for (const [eventId, eventData] of this.registeredEvents) {
                if (eventData.element === element) {
                    eventsToRemove.push(eventId);
                }
            }

            eventsToRemove.forEach(eventId => {
                this.removeEventListener(eventId);
            });

            LogUtils.info(`Removidos ${eventsToRemove.length} listeners do elemento`);
        } catch (error) {
            LogUtils.error('Erro ao remover todos os listeners:', error);
        }
    }

    /**
     * Gera ID único para evento
     * @returns {string} - ID único
     */
    generateEventId() {
        return `dom_event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * Obtém estatísticas dos eventos DOM
     * @returns {Object} - Estatísticas
     */
    getStats() {
        const stats = {
            totalEvents: this.registeredEvents.size,
            eventsByType: {},
            eventsByElement: new Map()
        };

        for (const [eventId, eventData] of this.registeredEvents) {
            // Contagem por tipo
            if (!stats.eventsByType[eventData.eventType]) {
                stats.eventsByType[eventData.eventType] = 0;
            }
            stats.eventsByType[eventData.eventType]++;

            // Contagem por elemento
            if (!stats.eventsByElement.has(eventData.element)) {
                stats.eventsByElement.set(eventData.element, 0);
            }
            stats.eventsByElement.set(eventData.element, 
                stats.eventsByElement.get(eventData.element) + 1
            );
        }

        return stats;
    }

    /**
     * Limpa todos os listeners registrados
     */
    cleanup() {
        try {
            const eventIds = Array.from(this.registeredEvents.keys());
            eventIds.forEach(eventId => {
                this.removeEventListener(eventId);
            });
            
            LogUtils.info('Limpeza de eventos DOM concluída');
        } catch (error) {
            LogUtils.error('Erro na limpeza de eventos DOM:', error);
        }
    }
}

/**
 * Instância do gerenciador de eventos DOM
 */
export const domEventManager = new DOMEventManager();
