/**
 * Classe principal do painel TwBus
 * Gerencia a interface e funcionalidades do sistema
 */

import { SYSTEM_CONFIG, DOM_ATTRIBUTES } from '../utils/constants.js';
import { DOMUtils, TimeUtils, AnimationUtils, LogUtils } from '../utils/helpers.js';
import { securityValidator, SecurityError } from '../security/SecurityValidator.js';
import { eventManager, domEventManager } from './EventManager.js';

/**
 * Classe principal do painel de ônibus
 */
export class BusPanel {
    constructor() {
        this.state = {
            isExpanded: false,
            isAnimating: false,
            isInitialized: false,
            lastUpdate: null
        };
        
        this.elements = new Map();
        this.eventIds = new Set();
        this.animations = new Map();
        
        this.init();
    }

    /**
     * Inicializa o painel
     */
    async init() {
        try {
            LogUtils.info('Inicializando painel TwBus...');
            
            await this.cacheElements();
            await this.setupEventListeners();
            await this.setupAccessibility();
            await this.animateEntrance();
            
            this.state.isInitialized = true;
            this.state.lastUpdate = new Date();
            
            // Emitir evento de inicialização
            eventManager.emit('panel:initialized', {
                timestamp: this.state.lastUpdate,
                version: SYSTEM_CONFIG.VERSION
            });
            
            LogUtils.info(SYSTEM_CONFIG.MESSAGES.PANEL_INITIALIZED);
        } catch (error) {
            LogUtils.error('Erro na inicialização do painel:', error);
            this.handleError(error);
        }
    }

    /**
     * Armazena referências dos elementos DOM
     */
    async cacheElements() {
        try {
            const elementMappings = {
                container: SYSTEM_CONFIG.SELECTORS.CONTAINER,
                refreshBtn: SYSTEM_CONFIG.SELECTORS.REFRESH_BTN,
                expandBtn: SYSTEM_CONFIG.SELECTORS.EXPAND_BTN,
                stops: SYSTEM_CONFIG.SELECTORS.STOPS,
                extraStops: SYSTEM_CONFIG.SELECTORS.EXTRA_STOPS,
                infoBadges: SYSTEM_CONFIG.SELECTORS.INFO_BADGES,
                currentBusStop: SYSTEM_CONFIG.SELECTORS.CURRENT_BUS_STOP,
                currentLocation: SYSTEM_CONFIG.SELECTORS.CURRENT_LOCATION,
                nextStop: SYSTEM_CONFIG.SELECTORS.NEXT_STOP,
                footerTimestamp: SYSTEM_CONFIG.SELECTORS.FOOTER_TIMESTAMP
            };

            for (const [key, selector] of Object.entries(elementMappings)) {
                try {
                    let element;
                    
                    if (selector.startsWith('#')) {
                        element = DOMUtils.getElementById(selector.substring(1));
                    } else if (selector.includes('.stop')) {
                        element = DOMUtils.querySelectorAll(selector);
                    } else {
                        element = DOMUtils.querySelector(selector);
                    }
                    
                    // Validar elementos únicos
                    if (element && element instanceof Element) {
                        securityValidator.validateElement(element);
                    }
                    
                    this.elements.set(key, element);
                } catch (error) {
                    LogUtils.warn(`Erro ao cachear elemento ${key}:`, error);
                }
            }

            LogUtils.info('Elementos DOM cacheados com sucesso');
        } catch (error) {
            LogUtils.error('Erro ao cachear elementos:', error);
            throw error;
        }
    }

    /**
     * Configura listeners de eventos
     */
    async setupEventListeners() {
        try {
            // Botão de refresh
            const refreshBtn = this.elements.get('refreshBtn');
            if (refreshBtn) {
                const eventId = domEventManager.addEventListener(
                    refreshBtn,
                    'click',
                    this.handleRefreshClick.bind(this)
                );
                this.eventIds.add(eventId);
            }

            // Botão de expandir/contrair
            const expandBtn = this.elements.get('expandBtn');
            if (expandBtn) {
                const eventId = domEventManager.addEventListener(
                    expandBtn,
                    'click',
                    this.handleExpandClick.bind(this)
                );
                this.eventIds.add(eventId);
            }

            // Efeitos de hover nas paradas
            const stops = this.elements.get('stops');
            if (stops && stops.length > 0) {
                Array.from(stops).forEach(stop => {
                    try {
                        securityValidator.validateElement(stop);
                        
                        const hoverInId = domEventManager.addEventListener(
                            stop,
                            'mouseenter',
                            this.handleStopHoverIn.bind(this)
                        );
                        
                        const hoverOutId = domEventManager.addEventListener(
                            stop,
                            'mouseleave',
                            this.handleStopHoverOut.bind(this)
                        );
                        
                        this.eventIds.add(hoverInId);
                        this.eventIds.add(hoverOutId);
                    } catch (error) {
                        LogUtils.warn('Elemento de parada inválido ignorado:', error);
                    }
                });
            }

            // Efeitos de clique nos badges
            const infoBadges = this.elements.get('infoBadges');
            if (infoBadges && infoBadges.length > 0) {
                Array.from(infoBadges).forEach(badge => {
                    try {
                        securityValidator.validateElement(badge);
                        
                        const clickId = domEventManager.addEventListener(
                            badge,
                            'click',
                            this.handleBadgeClick.bind(this)
                        );
                        
                        this.eventIds.add(clickId);
                    } catch (error) {
                        LogUtils.warn('Badge inválido ignorado:', error);
                    }
                });
            }

            // Eventos do sistema
            eventManager.on('panel:refresh', this.handleSystemRefresh.bind(this));
            eventManager.on('panel:expand', this.handleSystemExpand.bind(this));
            eventManager.on('panel:collapse', this.handleSystemCollapse.bind(this));

            LogUtils.info('Listeners de eventos configurados');
        } catch (error) {
            LogUtils.error('Erro ao configurar listeners:', error);
            throw error;
        }
    }

    /**
     * Configura acessibilidade
     */
    async setupAccessibility() {
        try {
            // Configurar paradas principais
            const currentBusStop = this.elements.get('currentBusStop');
            if (currentBusStop) {
                currentBusStop.classList.add(SYSTEM_CONFIG.CSS_CLASSES.HIGHLIGHTED);
                DOMUtils.setAttributes(currentBusStop, {
                    [DOM_ATTRIBUTES.ARIA_LABEL]: 'Localização atual do ônibus'
                });
            }
            
            const currentLocation = this.elements.get('currentLocation');
            if (currentLocation) {
                currentLocation.classList.add(SYSTEM_CONFIG.CSS_CLASSES.HIGHLIGHTED);
                DOMUtils.setAttributes(currentLocation, {
                    [DOM_ATTRIBUTES.ARIA_LABEL]: 'Sua localização atual'
                });
            }
            
            const nextStop = this.elements.get('nextStop');
            if (nextStop) {
                nextStop.classList.add(SYSTEM_CONFIG.CSS_CLASSES.HIGHLIGHTED);
                DOMUtils.setAttributes(nextStop, {
                    [DOM_ATTRIBUTES.ARIA_LABEL]: 'Próxima parada do ônibus'
                });
            }

            // Configurar botões
            const refreshBtn = this.elements.get('refreshBtn');
            if (refreshBtn) {
                DOMUtils.setAttributes(refreshBtn, {
                    [DOM_ATTRIBUTES.ARIA_LABEL]: 'Atualizar informações',
                    [DOM_ATTRIBUTES.TITLE]: 'Atualizar informações'
                });
            }

            const expandBtn = this.elements.get('expandBtn');
            if (expandBtn) {
                DOMUtils.setAttributes(expandBtn, {
                    [DOM_ATTRIBUTES.ARIA_LABEL]: 'Expandir painel',
                    [DOM_ATTRIBUTES.TITLE]: 'Expandir/Recolher rota'
                });
            }

            LogUtils.info('Acessibilidade configurada');
        } catch (error) {
            LogUtils.error('Erro ao configurar acessibilidade:', error);
        }
    }

    /**
     * Handler para clique no botão de refresh
     */
    async handleRefreshClick(event) {
        try {
            event.preventDefault();
            
            // Verificar rate limiting
            securityValidator.checkRateLimit('refresh', 5);
            
            await this.refreshPanel();
            
            // Emitir evento
            eventManager.emit('panel:refresh', {
                timestamp: new Date(),
                trigger: 'user_click'
            });
        } catch (error) {
            this.handleError(error);
        }
    }

    /**
     * Handler para clique no botão de expandir
     */
    async handleExpandClick(event) {
        try {
            event.preventDefault();
            
            // Verificar rate limiting
            securityValidator.checkRateLimit('expand', 3);
            
            if (!this.state.isAnimating) {
                await this.toggleExpanded();
            }
            
            // Emitir evento
            eventManager.emit('panel:expand', {
                timestamp: new Date(),
                expanded: this.state.isExpanded
            });
        } catch (error) {
            this.handleError(error);
        }
    }

    /**
     * Handler para hover in em parada
     */
    handleStopHoverIn(event) {
        try {
            const stop = event.currentTarget;
            stop.style.transform = 'translateX(8px) scale(1.02)';
            stop.style.transition = `transform ${SYSTEM_CONFIG.UI.HOVER_ANIMATION_DURATION}ms ease`;
        } catch (error) {
            LogUtils.warn('Erro no hover in de parada:', error);
        }
    }

    /**
     * Handler para hover out em parada
     */
    handleStopHoverOut(event) {
        try {
            const stop = event.currentTarget;
            stop.style.transform = '';
        } catch (error) {
            LogUtils.warn('Erro no hover out de parada:', error);
        }
    }

    /**
     * Handler para clique em badge
     */
    async handleBadgeClick(event) {
        try {
            const badge = event.currentTarget;
            await AnimationUtils.scaleAnimation(badge, {
                scale: 0.95,
                duration: SYSTEM_CONFIG.UI.HOVER_ANIMATION_DURATION
            });
        } catch (error) {
            LogUtils.warn('Erro no clique de badge:', error);
        }
    }

    /**
     * Handler para refresh do sistema
     */
    async handleSystemRefresh(event) {
        try {
            LogUtils.info('Refresh do sistema solicitado:', event.data);
            await this.refreshPanel();
        } catch (error) {
            LogUtils.error('Erro no refresh do sistema:', error);
        }
    }

    /**
     * Handler para expandir do sistema
     */
    async handleSystemExpand(event) {
        try {
            if (!this.state.isExpanded) {
                await this.toggleExpanded();
            }
        } catch (error) {
            LogUtils.error('Erro ao expandir sistema:', error);
        }
    }

    /**
     * Handler para recolher do sistema
     */
    async handleSystemCollapse(event) {
        try {
            if (this.state.isExpanded) {
                await this.toggleExpanded();
            }
        } catch (error) {
            LogUtils.error('Erro ao recolher sistema:', error);
        }
    }

    /**
     * Atualiza o painel
     */
    async refreshPanel() {
        try {
            const refreshBtn = this.elements.get('refreshBtn');
            if (!refreshBtn) return;

            refreshBtn.classList.add(SYSTEM_CONFIG.CSS_CLASSES.REFRESHING);
            DOMUtils.setAttributes(refreshBtn, {
                [DOM_ATTRIBUTES.ARIA_LABEL]: 'Atualizando informações...'
            });
            
            // Simular operação de refresh
            await TimeUtils.delay(SYSTEM_CONFIG.UI.REFRESH_ANIMATION_DURATION);
            
            refreshBtn.classList.remove(SYSTEM_CONFIG.CSS_CLASSES.REFRESHING);
            DOMUtils.setAttributes(refreshBtn, {
                [DOM_ATTRIBUTES.ARIA_LABEL]: 'Atualizar informações'
            });
            
            this.updateTimestamp();
            this.state.lastUpdate = new Date();
            
            LogUtils.info('Painel atualizado com sucesso');
        } catch (error) {
            LogUtils.error('Erro ao atualizar painel:', error);
            throw error;
        }
    }

    /**
     * Atualiza timestamp de atualização
     */
    updateTimestamp() {
        try {
            const timestampElement = this.elements.get('footerTimestamp');
            if (timestampElement) {
                const formattedTime = TimeUtils.formatTimestamp();
                timestampElement.textContent = `Atualizado: ${formattedTime}`;
            }
        } catch (error) {
            LogUtils.warn('Erro ao atualizar timestamp:', error);
        }
    }

    /**
     * Alterna estado expandido/recolhido
     */
    async toggleExpanded() {
        if (this.state.isAnimating) return;
        
        try {
            this.state.isAnimating = true;
            
            const container = this.elements.get('container');
            const expandBtn = this.elements.get('expandBtn');
            
            if (!container || !expandBtn) {
                throw new Error('Elementos necessários não encontrados');
            }

            if (this.state.isExpanded) {
                await this.collapsePanel(container, expandBtn);
            } else {
                await this.expandPanel(container, expandBtn);
            }
            
            this.state.isExpanded = !this.state.isExpanded;
            
            // Aguardar animação completa
            await TimeUtils.delay(SYSTEM_CONFIG.UI.EXPAND_ANIMATION_DURATION);
            
        } catch (error) {
            LogUtils.error('Erro ao alternar expansão:', error);
            throw error;
        } finally {
            this.state.isAnimating = false;
        }
    }

    /**
     * Expande o painel
     */
    async expandPanel(container, expandBtn) {
        try {
            container.classList.add(SYSTEM_CONFIG.CSS_CLASSES.EXPANDED);
            expandBtn.innerHTML = '<i class="fas fa-compress" aria-hidden="true"></i>';
            DOMUtils.setAttributes(expandBtn, {
                [DOM_ATTRIBUTES.ARIA_LABEL]: 'Contrair painel'
            });
            
            await this.showExtraStops();
            LogUtils.info('Painel expandido');
        } catch (error) {
            LogUtils.error('Erro ao expandir painel:', error);
            throw error;
        }
    }

    /**
     * Recolhe o painel
     */
    async collapsePanel(container, expandBtn) {
        try {
            container.classList.remove(SYSTEM_CONFIG.CSS_CLASSES.EXPANDED);
            expandBtn.innerHTML = '<i class="fas fa-expand" aria-hidden="true"></i>';
            DOMUtils.setAttributes(expandBtn, {
                [DOM_ATTRIBUTES.ARIA_LABEL]: 'Expandir painel'
            });
            
            await this.hideExtraStops();
            LogUtils.info('Painel recolhido');
        } catch (error) {
            LogUtils.error('Erro ao recolher painel:', error);
            throw error;
        }
    }

    /**
     * Mostra paradas extras
     */
    async showExtraStops() {
        try {
            const extraStops = this.elements.get('extraStops');
            if (!extraStops || extraStops.length === 0) return;

            const animationPromises = Array.from(extraStops).map(async (stop, index) => {
                if (stop) {
                    const delay = SYSTEM_CONFIG.UI.EXTRA_STOP_ANIMATION_DELAY + 
                                 (index * SYSTEM_CONFIG.UI.EXTRA_STOP_ANIMATION_INTERVAL);
                    
                    await AnimationUtils.slideIn(stop, {
                        duration: SYSTEM_CONFIG.UI.EXTRA_STOP_ANIMATION_DURATION,
                        delay,
                        direction: 'left'
                    });
                }
            });

            await Promise.all(animationPromises);
        } catch (error) {
            LogUtils.error('Erro ao mostrar paradas extras:', error);
        }
    }

    /**
     * Esconde paradas extras
     */
    async hideExtraStops() {
        try {
            const extraStops = this.elements.get('extraStops');
            if (!extraStops || extraStops.length === 0) return;

            const animationPromises = Array.from(extraStops).map(async (stop) => {
                if (stop) {
                    await AnimationUtils.fadeOut(stop, {
                        duration: SYSTEM_CONFIG.UI.EXTRA_STOP_ANIMATION_DURATION
                    });
                }
            });

            await Promise.all(animationPromises);
        } catch (error) {
            LogUtils.error('Erro ao esconder paradas extras:', error);
        }
    }

    /**
     * Anima entrada do painel
     */
    async animateEntrance() {
        try {
            const container = this.elements.get('container');
            if (!container) return;

            // Animar container principal
            await AnimationUtils.fadeIn(container, {
                duration: SYSTEM_CONFIG.UI.ENTRANCE_ANIMATION_DURATION,
                delay: SYSTEM_CONFIG.UI.ENTRANCE_ANIMATION_DELAY
            });
            
            // Animar paradas sequencialmente
            const stops = this.elements.get('stops');
            if (stops && stops.length > 0) {
                const mainStops = Array.from(stops).filter(stop => 
                    !stop.classList.contains('extra')
                );
                
                const animationPromises = mainStops.map(async (stop, index) => {
                    if (stop) {
                        const delay = 500 + (index * 100);
                        await AnimationUtils.slideIn(stop, {
                            duration: SYSTEM_CONFIG.UI.STOP_ANIMATION_DURATION,
                            delay,
                            direction: 'left'
                        });
                    }
                });

                await Promise.all(animationPromises);
            }
            
            LogUtils.info('Animação de entrada concluída');
        } catch (error) {
            LogUtils.error('Erro na animação de entrada:', error);
        }
    }

    /**
     * Trata erros do sistema
     */
    handleError(error) {
        try {
            if (error instanceof SecurityError) {
                LogUtils.error(SYSTEM_CONFIG.MESSAGES.SECURITY_ERROR_PREFIX, error.message);
                document.body.classList.add(SYSTEM_CONFIG.CSS_CLASSES.SECURITY_ERROR);
                
                // Criar indicador de segurança
                const indicator = DOMUtils.createElement('div', {
                    class: 'security-indicator',
                    title: 'Sistema seguro ativo'
                }, '🔒');
                
                if (indicator) {
                    document.body.appendChild(indicator);
                }
            } else {
                LogUtils.error('Erro no painel:', error);
                document.body.classList.add(SYSTEM_CONFIG.CSS_CLASSES.ERROR_STATE);
            }
            
            // Emitir evento de erro
            eventManager.emit('panel:error', {
                error: error.message,
                timestamp: new Date(),
                type: error.constructor.name
            });
        } catch (handlerError) {
            console.error('Erro crítico no handler de erro:', handlerError);
        }
    }

    /**
     * Obtém estado atual do painel
     */
    getState() {
        return {
            ...this.state,
            elementsCount: this.elements.size,
            eventsCount: this.eventIds.size,
            securityMetrics: securityValidator.getSecurityMetrics()
        };
    }

    /**
     * Destrói o painel e limpa recursos
     */
    destroy() {
        try {
            // Remover listeners de eventos
            this.eventIds.forEach(eventId => {
                domEventManager.removeEventListener(eventId);
            });
            this.eventIds.clear();
            
            // Remover listeners do sistema
            eventManager.removeAllListeners();
            
            // Limpar elementos
            this.elements.clear();
            
            // Limpar animações
            this.animations.clear();
            
            // Resetar estado
            this.state = {
                isExpanded: false,
                isAnimating: false,
                isInitialized: false,
                lastUpdate: null
            };
            
            LogUtils.info('Painel destruído e recursos limpos');
        } catch (error) {
            LogUtils.error('Erro ao destruir painel:', error);
        }
    }
}
