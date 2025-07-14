/**
 * TwBus - Módulo de Expansão de Rotas
 * Gerencia a expansão/contração das rotas do painel sem travamentos
 */

class RouteExpansionManager {
    constructor() {
        this.isExpanded = false;
        this.isAnimating = false;
        this.expandBtn = null;
        this.container = null;
        this.extraStops = [];
        this.touchStartY = 0;
        this.touchThreshold = 50;
        this.animationDuration = 300;
        this.staggerDelay = 50;
        
        this.init();
    }

    /**
     * Inicializa o gerenciador de expansão
     */
    init() {
        this.findElements();
        this.setupEventListeners();
        this.setupAccessibility();
        this.preloadAnimations();
        
        console.log('✅ Route Expansion Manager initialized');
    }

    /**
     * Encontra e armazena referências aos elementos DOM
     */
    findElements() {
        this.expandBtn = document.getElementById('expandBtn');
        this.container = document.querySelector('.container');
        this.extraStops = document.querySelectorAll('.stop.extra');
        
        if (!this.expandBtn || !this.container) {
            console.error('❌ Route expansion elements not found');
            return false;
        }
        
        return true;
    }

    /**
     * Configura os event listeners
     */
    setupEventListeners() {
        if (!this.expandBtn) return;

        // Previne múltiplos event listeners
        this.expandBtn.removeEventListener('click', this.handleClick);
        this.expandBtn.addEventListener('click', this.handleClick.bind(this));

        // Suporte a teclado
        this.expandBtn.addEventListener('keydown', this.handleKeydown.bind(this));

        // Suporte a touch em dispositivos móveis
        if ('ontouchstart' in window) {
            this.setupTouchGestures();
        }

        // Listener para mudanças de orientação
        window.addEventListener('orientationchange', this.handleOrientationChange.bind(this));
    }

    /**
     * Configura gestos de toque
     */
    setupTouchGestures() {
        this.container.addEventListener('touchstart', this.handleTouchStart.bind(this), { passive: true });
        this.container.addEventListener('touchend', this.handleTouchEnd.bind(this), { passive: true });
    }

    /**
     * Configura acessibilidade
     */
    setupAccessibility() {
        if (!this.expandBtn) return;

        this.expandBtn.setAttribute('role', 'button');
        this.expandBtn.setAttribute('tabindex', '0');
        this.updateAriaLabels();
    }

    /**
     * Atualiza labels de acessibilidade
     */
    updateAriaLabels() {
        const label = this.isExpanded ? 'Contrair rota' : 'Expandir rota';
        this.expandBtn.setAttribute('aria-label', label);
        this.expandBtn.setAttribute('title', label);
    }

    /**
     * Prepara animações para melhor performance
     */
    preloadAnimations() {
        // Força o navegador a calcular estilos antecipadamente
        this.extraStops.forEach(stop => {
            stop.style.transition = `opacity ${this.animationDuration}ms ease-out, transform ${this.animationDuration}ms ease-out`;
        });
    }

    /**
     * Manipula cliques no botão
     */
    handleClick(event) {
        event.preventDefault();
        event.stopPropagation();
        
        if (this.isAnimating) return;
        
        this.toggleExpansion();
    }

    /**
     * Manipula eventos de teclado
     */
    handleKeydown(event) {
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            this.handleClick(event);
        }
    }

    /**
     * Manipula início do toque
     */
    handleTouchStart(event) {
        this.touchStartY = event.touches[0].clientY;
    }

    /**
     * Manipula fim do toque
     */
    handleTouchEnd(event) {
        const touchEndY = event.changedTouches[0].clientY;
        const deltaY = this.touchStartY - touchEndY;
        
        // Verifica se o movimento é suficiente para ativar
        if (Math.abs(deltaY) > this.touchThreshold) {
            // Swipe up para expandir, down para contrair
            if (deltaY > 0 && !this.isExpanded) {
                this.toggleExpansion();
            } else if (deltaY < 0 && this.isExpanded) {
                this.toggleExpansion();
            }
        }
    }

    /**
     * Manipula mudanças de orientação
     */
    handleOrientationChange() {
        // Pequeno delay para aguardar o redimensionamento
        setTimeout(() => {
            this.recalculateLayout();
        }, 200);
    }

    /**
     * Recalcula layout após mudanças
     */
    recalculateLayout() {
        if (this.isExpanded) {
            this.extraStops.forEach(stop => {
                stop.style.display = 'flex';
            });
        }
    }

    /**
     * Alterna entre expandido e contraído
     */
    async toggleExpansion() {
        if (this.isAnimating) return;
        
        this.isAnimating = true;
        this.isExpanded = !this.isExpanded;
        
        try {
            if (this.isExpanded) {
                await this.expandRoute();
            } else {
                await this.contractRoute();
            }
        } catch (error) {
            console.error('❌ Animation error:', error);
        } finally {
            this.isAnimating = false;
            this.updateAriaLabels();
        }
    }

    /**
     * Expande a rota
     */
    async expandRoute() {
        // Atualiza o botão
        this.updateExpandButton(true);
        
        // Adiciona classe ao container
        this.container.classList.add('expanded');
        
        // Mostra paradas extras com animação escalonada
        return new Promise((resolve) => {
            let completedAnimations = 0;
            const totalStops = this.extraStops.length;
            
            if (totalStops === 0) {
                resolve();
                return;
            }
            
            this.extraStops.forEach((stop, index) => {
                setTimeout(() => {
                    stop.classList.remove('hidden');
                    stop.style.display = 'flex';
                    
                    // Força reflow para garantir que o display seja aplicado
                    stop.offsetHeight;
                    
                    // Aplica animação
                    requestAnimationFrame(() => {
                        stop.style.opacity = '1';
                        stop.style.transform = 'translateX(0)';
                    });
                    
                    // Verifica se todas as animações terminaram
                    setTimeout(() => {
                        completedAnimations++;
                        if (completedAnimations === totalStops) {
                            resolve();
                        }
                    }, this.animationDuration);
                    
                }, index * this.staggerDelay);
            });
        });
    }

    /**
     * Contrai a rota
     */
    async contractRoute() {
        // Atualiza o botão
        this.updateExpandButton(false);
        
        // Remove classe do container
        this.container.classList.remove('expanded');
        
        // Esconde paradas extras com animação
        return new Promise((resolve) => {
            let completedAnimations = 0;
            const totalStops = this.extraStops.length;
            
            if (totalStops === 0) {
                resolve();
                return;
            }
            
            this.extraStops.forEach((stop, index) => {
                // Aplica animação de saída
                stop.style.opacity = '0';
                stop.style.transform = 'translateX(-20px)';
                
                setTimeout(() => {
                    stop.classList.add('hidden');
                    stop.style.display = 'none';
                    
                    completedAnimations++;
                    if (completedAnimations === totalStops) {
                        resolve();
                    }
                }, this.animationDuration);
            });
        });
    }

    /**
     * Atualiza o ícone do botão de expansão
     */
    updateExpandButton(isExpanded) {
        const iconClass = isExpanded ? 'fas fa-compress' : 'fas fa-expand';
        this.expandBtn.innerHTML = `<i class="${iconClass}" aria-hidden="true"></i>`;
    }

    /**
     * Força expansão
     */
    forceExpand() {
        if (!this.isExpanded) {
            this.toggleExpansion();
        }
    }

    /**
     * Força contração
     */
    forceContract() {
        if (this.isExpanded) {
            this.toggleExpansion();
        }
    }

    /**
     * Obtém estado atual
     */
    getState() {
        return {
            isExpanded: this.isExpanded,
            isAnimating: this.isAnimating,
            extraStopsCount: this.extraStops.length
        };
    }

    /**
     * Reinicializa o gerenciador
     */
    reinitialize() {
        this.isExpanded = false;
        this.isAnimating = false;
        this.findElements();
        this.setupEventListeners();
        this.updateAriaLabels();
        
        // Reset visual state
        this.container?.classList.remove('expanded');
        this.extraStops.forEach(stop => {
            stop.classList.add('hidden');
            stop.style.display = 'none';
            stop.style.opacity = '0';
            stop.style.transform = 'translateX(-20px)';
        });
        
        this.updateExpandButton(false);
    }

    /**
     * Destrói o gerenciador
     */
    destroy() {
        this.expandBtn?.removeEventListener('click', this.handleClick);
        this.expandBtn?.removeEventListener('keydown', this.handleKeydown);
        window.removeEventListener('orientationchange', this.handleOrientationChange);
        
        this.expandBtn = null;
        this.container = null;
        this.extraStops = [];
    }
}

// Inicialização automática
let routeExpansionManager = null;

function initRouteExpansion() {
    if (routeExpansionManager) {
        routeExpansionManager.destroy();
    }
    
    routeExpansionManager = new RouteExpansionManager();
    
    // Expõe globalmente para debugging
    window.routeExpansionManager = routeExpansionManager;
}

// Inicialização quando DOM estiver pronto
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initRouteExpansion);
} else {
    initRouteExpansion();
}

// Reinicializa se elementos não forem encontrados
setTimeout(() => {
    if (!routeExpansionManager || !routeExpansionManager.expandBtn) {
        console.log('⚠️ Retrying route expansion initialization...');
        initRouteExpansion();
    }
}, 1000);

// Exporta para uso em módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = RouteExpansionManager;
}
