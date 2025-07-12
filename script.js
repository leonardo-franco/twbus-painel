// TwBus - Painel de Parada de Ônibus
// Sistema de interface interativa e segura

class BusPanel {
    constructor() {
        this.isExpanded = false;
        this.isAnimating = false;
        this.elements = new Map();
        this.eventListeners = new Map();
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
            if (selector.startsWith('#')) {
                this.elements.set(key, document.getElementById(selector.substring(1)));
            } else if (selector.includes('.stop')) {
                this.elements.set(key, document.querySelectorAll(selector));
            } else {
                this.elements.set(key, document.querySelector(selector));
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
                this.refreshPanel();
            });
            refreshBtn.addEventListener('click', refreshHandler);
            this.eventListeners.set('refresh', refreshHandler);
        }

        // Botão de expandir/contrair com proteção contra cliques múltiplos
        const expandBtn = this.elements.get('expandBtn');
        if (expandBtn) {
            const expandHandler = this.createSafeEventHandler(() => {
                if (!this.isAnimating) {
                    this.toggleExpanded();
                }
            });
            expandBtn.addEventListener('click', expandHandler);
            this.eventListeners.set('expand', expandHandler);
        }

        // Efeitos de hover nas paradas
        const stops = this.elements.get('stops');
        if (stops && stops.length > 0) {
            stops.forEach(stop => {
                const hoverInHandler = this.createSafeEventHandler(function() {
                    this.style.transform = 'translateX(8px) scale(1.02)';
                });
                const hoverOutHandler = this.createSafeEventHandler(function() {
                    this.style.transform = 'translateX(0) scale(1)';
                });
                
                stop.addEventListener('mouseenter', hoverInHandler);
                stop.addEventListener('mouseleave', hoverOutHandler);
            });
        }

        // Efeitos de clique nos badges
        const infoBadges = this.elements.get('infoBadges');
        if (infoBadges && infoBadges.length > 0) {
            infoBadges.forEach(badge => {
                const clickHandler = this.createSafeEventHandler(function() {
                    this.style.transform = 'scale(0.95)';
                    setTimeout(() => {
                        this.style.transform = 'scale(1)';
                    }, 150);
                });
                badge.addEventListener('click', clickHandler);
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
