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
        this.lastClickTime = 0;
        
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
        
        console.log('🔍 Finding elements:', {
            expandBtn: !!this.expandBtn,
            container: !!this.container,
            extraStopsCount: this.extraStops.length
        });
        
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

        // Remove listeners existentes para evitar duplicatas
        this.expandBtn.removeEventListener('click', this.boundHandleClick);
        this.expandBtn.removeEventListener('keydown', this.boundHandleKeydown);
        
        // Cria funções bound para poder removê-las depois
        this.boundHandleClick = this.handleClick.bind(this);
        this.boundHandleKeydown = this.handleKeydown.bind(this);
        
        // Adiciona novos listeners
        this.expandBtn.addEventListener('click', this.boundHandleClick);
        this.expandBtn.addEventListener('keydown', this.boundHandleKeydown);

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
        
        // Previne múltiplos cliques simultâneos
        if (this.isAnimating) {
            console.log('⏸️ Click blocked - animation in progress');
            return;
        }
        
        // Adiciona um pequeno delay para prevenir double-clicks
        if (this.lastClickTime && Date.now() - this.lastClickTime < 100) {
            console.log('⏸️ Click blocked - too fast');
            return;
        }
        
        this.lastClickTime = Date.now();
        console.log('🔄 Toggle expansion - Current state:', this.isExpanded);
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
        if (this.isAnimating) {
            console.log('⏸️ Animation already in progress, skipping...');
            return;
        }
        
        // Refresh dos elementos DOM antes de cada toggle
        this.extraStops = document.querySelectorAll('.stop.extra');
        
        console.log('🔄 Toggle expansion - Current state:', this.isExpanded, 'Container has expanded class:', this.container.classList.contains('expanded'));
        this.isAnimating = true;
        
        // Desabilita o botão temporariamente para evitar cliques múltiplos
        this.expandBtn.style.pointerEvents = 'none';
        
        try {
            if (this.isExpanded) {
                console.log('📥 Contracting route...');
                await this.contractRoute();
                this.isExpanded = false;
                console.log('✅ Route contracted, new state:', this.isExpanded);
            } else {
                console.log('📤 Expanding route...');
                await this.expandRoute();
                this.isExpanded = true;
                console.log('✅ Route expanded, new state:', this.isExpanded);
            }
            
            // Verificação adicional do estado final
            console.log('🔍 Final state check:', {
                isExpanded: this.isExpanded,
                containerHasClass: this.container.classList.contains('expanded'),
                visibleStops: Array.from(this.extraStops).filter(stop => stop.style.display !== 'none').length
            });
            
        } catch (error) {
            console.error('❌ Animation error:', error);
        } finally {
            this.isAnimating = false;
            this.expandBtn.style.pointerEvents = 'auto';
            this.updateAriaLabels();
        }
    }

    /**
     * Expande a rota
     */
    async expandRoute() {
        console.log('🔍 Expanding route - extraStops count:', this.extraStops.length);
        
        // Atualiza o botão ANTES da animação
        this.updateExpandButton(true);
        
        // Adiciona classe ao container
        this.container.classList.add('expanded');
        
        // Mostra paradas extras com animação escalonada
        return new Promise((resolve) => {
            let completedAnimations = 0;
            const totalStops = this.extraStops.length;
            
            if (totalStops === 0) {
                console.log('⚠️ No extra stops found');
                resolve();
                return;
            }
            
            this.extraStops.forEach((stop, index) => {
                setTimeout(() => {
                    // Prepara estado inicial para animação
                    stop.classList.remove('hidden');
                    stop.style.display = 'flex';
                    stop.style.opacity = '0';
                    stop.style.transform = 'translateX(-20px)';
                    
                    // Força reflow para garantir que o display seja aplicado
                    stop.offsetHeight;
                    
                    // Aplica animação de entrada
                    requestAnimationFrame(() => {
                        stop.style.opacity = '1';
                        stop.style.transform = 'translateX(0)';
                    });
                    
                    // Verifica se todas as animações terminaram
                    setTimeout(() => {
                        completedAnimations++;
                        if (completedAnimations === totalStops) {
                            console.log('✅ All expand animations completed');
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
        console.log('🔍 Contracting route - extraStops count:', this.extraStops.length);
        
        // Atualiza o botão ANTES da animação
        this.updateExpandButton(false);
        
        // Remove classe do container
        this.container.classList.remove('expanded');
        
        // Esconde paradas extras com animação
        return new Promise((resolve) => {
            let completedAnimations = 0;
            const totalStops = this.extraStops.length;
            
            if (totalStops === 0) {
                console.log('⚠️ No extra stops found');
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
                        console.log('✅ All contract animations completed');
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
        console.log('🔄 Updating button icon:', iconClass, 'for expanded state:', isExpanded);
        
        this.expandBtn.innerHTML = `<i class="${iconClass}" aria-hidden="true"></i>`;
        
        // Atualiza classe CSS no botão
        if (isExpanded) {
            this.expandBtn.classList.add('expanded');
        } else {
            this.expandBtn.classList.remove('expanded');
        }
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
        
        // Reset visual state
        this.container?.classList.remove('expanded');
        this.extraStops.forEach(stop => {
            stop.classList.add('hidden');
            stop.style.display = 'none';
            stop.style.opacity = '0';
            stop.style.transform = 'translateX(-20px)';
        });
        
        this.updateExpandButton(false);
        this.updateAriaLabels();
        
        console.log('🔄 Route expansion manager reinitialized');
    }

    /**
     * Destrói o gerenciador
     */
    destroy() {
        if (this.expandBtn) {
            this.expandBtn.removeEventListener('click', this.boundHandleClick);
            this.expandBtn.removeEventListener('keydown', this.boundHandleKeydown);
        }
        
        window.removeEventListener('orientationchange', this.handleOrientationChange);
        
        this.expandBtn = null;
        this.container = null;
        this.extraStops = [];
        this.boundHandleClick = null;
        this.boundHandleKeydown = null;
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
