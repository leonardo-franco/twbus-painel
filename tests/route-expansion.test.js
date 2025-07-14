/**
 * Testes Avançados para Route Expansion Manager
 * Testa todos os cenários de expansão/contração de rotas
 */

describe('RouteExpansionManager - Testes Avançados', () => {
    let manager;
    let mockContainer;
    let mockExpandBtn;
    let mockExtraStops;

    beforeEach(() => {
        // Setup DOM mock
        document.body.innerHTML = `
            <div class="container">
                <button id="expandBtn">
                    <i class="fas fa-expand" aria-hidden="true"></i>
                </button>
                <div class="route-line">
                    <div class="stop extra hidden" style="display: none;">Stop 1</div>
                    <div class="stop extra hidden" style="display: none;">Stop 2</div>
                    <div class="stop extra hidden" style="display: none;">Stop 3</div>
                </div>
            </div>
        `;

        // Simula requestAnimationFrame
        global.requestAnimationFrame = jest.fn(cb => setTimeout(cb, 0));
        
        // Mock console para testes silenciosos
        global.console = {
            log: jest.fn(),
            error: jest.fn()
        };

        // Importa e inicializa o manager
        const RouteExpansionManager = require('../src/route-expansion.js');
        manager = new RouteExpansionManager();
        
        // Referências aos elementos
        mockContainer = document.querySelector('.container');
        mockExpandBtn = document.getElementById('expandBtn');
        mockExtraStops = document.querySelectorAll('.stop.extra');
    });

    afterEach(() => {
        if (manager) {
            manager.destroy();
        }
        jest.clearAllMocks();
    });

    describe('Inicialização', () => {
        test('deve inicializar com estado contraído', () => {
            expect(manager.isExpanded).toBe(false);
            expect(manager.isAnimating).toBe(false);
            expect(mockContainer.classList.contains('expanded')).toBe(false);
        });

        test('deve encontrar todos os elementos DOM necessários', () => {
            expect(manager.expandBtn).toBeTruthy();
            expect(manager.container).toBeTruthy();
            expect(manager.extraStops.length).toBe(3);
        });

        test('deve configurar event listeners corretamente', () => {
            expect(manager.boundHandleClick).toBeDefined();
            expect(manager.boundHandleKeydown).toBeDefined();
        });
    });

    describe('Expansão de Rotas', () => {
        test('deve expandir rota corretamente', async () => {
            // Estado inicial
            expect(manager.isExpanded).toBe(false);
            
            // Executa expansão
            await manager.expandRoute();
            
            // Verifica resultados
            expect(mockContainer.classList.contains('expanded')).toBe(true);
            
            // Verifica se paradas extras estão visíveis
            mockExtraStops.forEach(stop => {
                expect(stop.classList.contains('hidden')).toBe(false);
                expect(stop.style.display).toBe('flex');
            });
        });

        test('deve atualizar botão para ícone de comprimir', async () => {
            await manager.expandRoute();
            
            const icon = mockExpandBtn.querySelector('i');
            expect(icon.className).toBe('fas fa-compress');
            expect(mockExpandBtn.classList.contains('expanded')).toBe(true);
        });

        test('deve aplicar animação escalonada', async () => {
            const startTime = Date.now();
            
            await manager.expandRoute();
            
            // Verifica se houve delay entre elementos
            const endTime = Date.now();
            expect(endTime - startTime).toBeGreaterThan(manager.staggerDelay);
        });
    });

    describe('Contração de Rotas', () => {
        beforeEach(async () => {
            // Expande primeiro para poder testar contração
            await manager.expandRoute();
            manager.isExpanded = true;
        });

        test('deve contrair rota corretamente', async () => {
            // Verifica estado expandido
            expect(manager.isExpanded).toBe(true);
            expect(mockContainer.classList.contains('expanded')).toBe(true);
            
            // Executa contração
            await manager.contractRoute();
            
            // Verifica resultados
            expect(mockContainer.classList.contains('expanded')).toBe(false);
            
            // Verifica se paradas extras estão ocultas
            mockExtraStops.forEach(stop => {
                expect(stop.classList.contains('hidden')).toBe(true);
                expect(stop.style.display).toBe('none');
            });
        });

        test('deve atualizar botão para ícone de expandir', async () => {
            await manager.contractRoute();
            
            const icon = mockExpandBtn.querySelector('i');
            expect(icon.className).toBe('fas fa-expand');
            expect(mockExpandBtn.classList.contains('expanded')).toBe(false);
        });

        test('deve ocultar elementos imediatamente', async () => {
            const startTime = Date.now();
            
            await manager.contractRoute();
            
            // Verifica se foi rápido (sem animação complexa)
            const endTime = Date.now();
            expect(endTime - startTime).toBeLessThan(100);
        });
    });

    describe('Toggle de Estados', () => {
        test('deve alternar de contraído para expandido', async () => {
            expect(manager.isExpanded).toBe(false);
            
            await manager.toggleExpansion();
            
            expect(manager.isExpanded).toBe(true);
            expect(mockContainer.classList.contains('expanded')).toBe(true);
        });

        test('deve alternar de expandido para contraído', async () => {
            // Expande primeiro
            await manager.toggleExpansion();
            expect(manager.isExpanded).toBe(true);
            
            // Contrai
            await manager.toggleExpansion();
            
            expect(manager.isExpanded).toBe(false);
            expect(mockContainer.classList.contains('expanded')).toBe(false);
        });

        test('deve manter estado consistente após múltiplas alternâncias', async () => {
            // Executa múltiplas alternâncias
            for (let i = 0; i < 5; i++) {
                await manager.toggleExpansion();
                
                // Verifica consistência
                const expectedState = i % 2 === 0; // true para ímpares, false para pares
                expect(manager.isExpanded).toBe(expectedState);
                expect(mockContainer.classList.contains('expanded')).toBe(expectedState);
            }
        });
    });

    describe('Prevenção de Cliques Múltiplos', () => {
        test('deve bloquear cliques durante animação', async () => {
            manager.isAnimating = true;
            
            const mockEvent = {
                preventDefault: jest.fn(),
                stopPropagation: jest.fn()
            };
            
            manager.handleClick(mockEvent);
            
            expect(mockEvent.preventDefault).toHaveBeenCalled();
            expect(mockEvent.stopPropagation).toHaveBeenCalled();
        });

        test('deve bloquear cliques muito rápidos', async () => {
            const mockEvent = {
                preventDefault: jest.fn(),
                stopPropagation: jest.fn()
            };
            
            // Primeiro clique
            manager.handleClick(mockEvent);
            
            // Segundo clique imediato
            manager.handleClick(mockEvent);
            
            // Verifica se o segundo foi bloqueado
            expect(console.log).toHaveBeenCalledWith('⏸️ Click blocked - too fast');
        });

        test('deve desabilitar botão durante animação', async () => {
            manager.isAnimating = true;
            
            await manager.toggleExpansion();
            
            expect(mockExpandBtn.style.pointerEvents).toBe('none');
        });
    });

    describe('Accessibility', () => {
        test('deve definir atributos ARIA corretos', () => {
            expect(mockExpandBtn.getAttribute('role')).toBe('button');
            expect(mockExpandBtn.getAttribute('tabindex')).toBe('0');
        });

        test('deve atualizar aria-label baseado no estado', async () => {
            // Estado contraído
            manager.updateAriaLabels();
            expect(mockExpandBtn.getAttribute('aria-label')).toBe('Expandir rota');
            
            // Estado expandido
            manager.isExpanded = true;
            manager.updateAriaLabels();
            expect(mockExpandBtn.getAttribute('aria-label')).toBe('Contrair rota');
        });

        test('deve responder a teclas Enter e Space', () => {
            const mockEvent = {
                key: 'Enter',
                preventDefault: jest.fn()
            };
            
            const handleClickSpy = jest.spyOn(manager, 'handleClick');
            
            manager.handleKeydown(mockEvent);
            
            expect(mockEvent.preventDefault).toHaveBeenCalled();
            expect(handleClickSpy).toHaveBeenCalled();
        });
    });

    describe('Gestão de Estado', () => {
        test('deve retornar estado atual corretamente', () => {
            const state = manager.getState();
            
            expect(state).toEqual({
                isExpanded: false,
                isAnimating: false,
                extraStopsCount: 3
            });
        });

        test('deve reinicializar estado corretamente', () => {
            // Modifica estado
            manager.isExpanded = true;
            manager.isAnimating = true;
            mockContainer.classList.add('expanded');
            
            // Reinicializa
            manager.reinitialize();
            
            // Verifica reset
            expect(manager.isExpanded).toBe(false);
            expect(manager.isAnimating).toBe(false);
            expect(mockContainer.classList.contains('expanded')).toBe(false);
        });
    });

    describe('Cenários de Erro', () => {
        test('deve lidar com elementos DOM ausentes', () => {
            // Remove elementos do DOM
            document.body.innerHTML = '';
            
            const newManager = new (require('../src/route-expansion.js'))();
            
            expect(newManager.expandBtn).toBeFalsy();
            expect(newManager.container).toBeFalsy();
        });

        test('deve lidar com zero paradas extras', async () => {
            // Remove paradas extras
            mockExtraStops.forEach(stop => stop.remove());
            manager.extraStops = document.querySelectorAll('.stop.extra');
            
            await manager.expandRoute();
            
            expect(console.log).toHaveBeenCalledWith('⚠️ No extra stops found');
        });

        test('deve capturar erros de animação', async () => {
            // Mock que gera erro
            manager.updateExpandButton = jest.fn(() => {
                throw new Error('Test error');
            });
            
            await manager.toggleExpansion();
            
            expect(console.error).toHaveBeenCalledWith('❌ Animation error:', expect.any(Error));
        });
    });

    describe('Performance', () => {
        test('deve executar expansão em tempo hábil', async () => {
            const startTime = Date.now();
            
            await manager.expandRoute();
            
            const endTime = Date.now();
            expect(endTime - startTime).toBeLessThan(1000); // Menos de 1 segundo
        });

        test('deve executar contração rapidamente', async () => {
            await manager.expandRoute();
            manager.isExpanded = true;
            
            const startTime = Date.now();
            
            await manager.contractRoute();
            
            const endTime = Date.now();
            expect(endTime - startTime).toBeLessThan(100); // Menos de 100ms
        });
    });

    describe('Integração com CSS', () => {
        test('deve aplicar classes CSS corretas', async () => {
            await manager.expandRoute();
            
            expect(mockContainer.classList.contains('expanded')).toBe(true);
            
            mockExtraStops.forEach(stop => {
                expect(stop.classList.contains('hidden')).toBe(false);
            });
        });

        test('deve aplicar estilos inline corretos', async () => {
            await manager.expandRoute();
            
            mockExtraStops.forEach(stop => {
                expect(stop.style.display).toBe('flex');
                expect(stop.style.opacity).toBe('1');
                expect(stop.style.transform).toBe('translateX(0)');
            });
        });
    });
});
