/**
 * Teste de Integração Específico para o Problema de Persistência de Estado
 * Simula exatamente o comportamento relatado pelo usuário
 */

describe('RouteExpansionManager - Teste de Persistência de Estado', () => {
    let manager;
    let container;
    let expandBtn;
    let extraStops;

    beforeEach(() => {
        // Setup DOM exato como no projeto
        document.body.innerHTML = `
            <div class="container">
                <div class="route-controls">
                    <button id="expandBtn" class="control-btn">
                        <i class="fas fa-expand" aria-hidden="true"></i>
                    </button>
                </div>
                <div class="route-line">
                    <div class="stop">Parada Normal 1</div>
                    <div class="stop extra hidden" style="display: none; opacity: 0; transform: translateX(-20px);">Parada Extra 1</div>
                    <div class="stop extra hidden" style="display: none; opacity: 0; transform: translateX(-20px);">Parada Extra 2</div>
                    <div class="stop extra hidden" style="display: none; opacity: 0; transform: translateX(-20px);">Parada Extra 3</div>
                </div>
            </div>
        `;

        // Simula transições CSS
        const style = document.createElement('style');
        style.textContent = `
            .stop.extra {
                transition: opacity 300ms ease-out, transform 300ms ease-out;
            }
            .container.expanded .stop.extra {
                opacity: 1;
                transform: translateX(0);
            }
        `;
        document.head.appendChild(style);

        // Mock de funções do navegador
        global.requestAnimationFrame = jest.fn(cb => setTimeout(cb, 16));
        global.console = {
            log: jest.fn(),
            error: jest.fn()
        };

        // Inicializa o manager
        const RouteExpansionManager = require('../src/route-expansion.js');
        manager = new RouteExpansionManager();
        
        container = document.querySelector('.container');
        expandBtn = document.getElementById('expandBtn');
        extraStops = document.querySelectorAll('.stop.extra');
    });

    afterEach(() => {
        if (manager) {
            manager.destroy();
        }
        jest.clearAllMocks();
    });

    describe('Cenário do Problema Reportado', () => {
        test('deve manter estado contraído após primeira contração', async () => {
            // ESTADO INICIAL: Contraído
            expect(manager.isExpanded).toBe(false);
            expect(container.classList.contains('expanded')).toBe(false);
            extraStops.forEach(stop => {
                expect(stop.style.display).toBe('none');
                expect(stop.classList.contains('hidden')).toBe(true);
            });

            // PRIMEIRO CLIQUE: Expandir
            console.log('=== PRIMEIRO CLIQUE: EXPANDIR ===');
            await manager.toggleExpansion();
            
            expect(manager.isExpanded).toBe(true);
            expect(container.classList.contains('expanded')).toBe(true);
            
            // Verifica se paradas extras estão visíveis
            extraStops.forEach(stop => {
                expect(stop.style.display).toBe('flex');
                expect(stop.classList.contains('hidden')).toBe(false);
            });

            // SEGUNDO CLIQUE: Contrair
            console.log('=== SEGUNDO CLIQUE: CONTRAIR ===');
            await manager.toggleExpansion();
            
            expect(manager.isExpanded).toBe(false);
            expect(container.classList.contains('expanded')).toBe(false);
            
            // VERIFICAÇÃO CRÍTICA: Paradas devem estar ocultas
            extraStops.forEach(stop => {
                expect(stop.style.display).toBe('none');
                expect(stop.classList.contains('hidden')).toBe(true);
            });

            // TERCEIRO CLIQUE: Expandir novamente
            console.log('=== TERCEIRO CLIQUE: EXPANDIR NOVAMENTE ===');
            await manager.toggleExpansion();
            
            expect(manager.isExpanded).toBe(true);
            expect(container.classList.contains('expanded')).toBe(true);
            
            // Verifica se paradas extras estão visíveis novamente
            extraStops.forEach(stop => {
                expect(stop.style.display).toBe('flex');
                expect(stop.classList.contains('hidden')).toBe(false);
            });
        });

        test('deve manter consistência após múltiplas alternâncias', async () => {
            console.log('=== TESTE DE MÚLTIPLAS ALTERNÂNCIAS ===');
            
            for (let i = 0; i < 10; i++) {
                await manager.toggleExpansion();
                
                const expectedExpanded = (i + 1) % 2 === 1; // Ímpar = expandido
                
                console.log(`Clique ${i + 1}: Esperado ${expectedExpanded ? 'EXPANDIDO' : 'CONTRAÍDO'}`);
                
                // Verifica estado interno
                expect(manager.isExpanded).toBe(expectedExpanded);
                
                // Verifica classe CSS
                expect(container.classList.contains('expanded')).toBe(expectedExpanded);
                
                // Verifica elementos DOM
                extraStops.forEach((stop, index) => {
                    const isVisible = stop.style.display === 'flex';
                    const isHidden = stop.classList.contains('hidden');
                    
                    if (expectedExpanded) {
                        expect(isVisible).toBe(true);
                        expect(isHidden).toBe(false);
                    } else {
                        expect(isVisible).toBe(false);
                        expect(isHidden).toBe(true);
                    }
                });
                
                // Pequena pausa para simular comportamento real
                await new Promise(resolve => setTimeout(resolve, 10));
            }
        });

        test('deve prevenir interferência de CSS externo', async () => {
            // Simula CSS que pode interferir
            const interferingStyle = document.createElement('style');
            interferingStyle.textContent = `
                .stop.extra {
                    display: flex !important;
                    opacity: 1 !important;
                }
            `;
            document.head.appendChild(interferingStyle);
            
            // Testa se a lógica JavaScript prevalece
            await manager.toggleExpansion(); // Expandir
            expect(manager.isExpanded).toBe(true);
            
            await manager.toggleExpansion(); // Contrair
            expect(manager.isExpanded).toBe(false);
            
            // Remove CSS interferente
            document.head.removeChild(interferingStyle);
        });
    });

    describe('Simulação de Cliques Reais', () => {
        test('deve responder a eventos de clique real', async () => {
            const clickEvent = new MouseEvent('click', {
                bubbles: true,
                cancelable: true
            });
            
            // Primeiro clique
            expandBtn.dispatchEvent(clickEvent);
            await new Promise(resolve => setTimeout(resolve, 50));
            
            expect(manager.isExpanded).toBe(true);
            
            // Segundo clique
            expandBtn.dispatchEvent(clickEvent);
            await new Promise(resolve => setTimeout(resolve, 50));
            
            expect(manager.isExpanded).toBe(false);
        });

        test('deve bloquear cliques duplos', async () => {
            const clickEvent = new MouseEvent('click', {
                bubbles: true,
                cancelable: true
            });
            
            // Cliques rápidos
            expandBtn.dispatchEvent(clickEvent);
            expandBtn.dispatchEvent(clickEvent);
            
            await new Promise(resolve => setTimeout(resolve, 200));
            
            // Só deve ter processado um clique
            expect(console.log).toHaveBeenCalledWith('⏸️ Click blocked - too fast');
        });
    });

    describe('Verificação de Logs', () => {
        test('deve gerar logs corretos para debug', async () => {
            // Limpa logs anteriores
            console.log.mockClear();
            
            // Executa toggle
            await manager.toggleExpansion();
            
            // Verifica logs específicos
            expect(console.log).toHaveBeenCalledWith('🔄 Toggle expansion - Current state:', false, 'Container has expanded class:', false);
            expect(console.log).toHaveBeenCalledWith('📤 Expanding route...');
            expect(console.log).toHaveBeenCalledWith('✅ Route expanded, new state:', true);
        });
    });

    describe('Testes de Performance', () => {
        test('contração deve ser instantânea', async () => {
            // Expande primeiro
            await manager.toggleExpansion();
            
            // Mede tempo de contração
            const startTime = performance.now();
            await manager.contractRoute();
            const endTime = performance.now();
            
            // Deve ser muito rápido (< 10ms)
            expect(endTime - startTime).toBeLessThan(10);
        });

        test('expansão deve respeitar stagger delay', async () => {
            const startTime = performance.now();
            await manager.expandRoute();
            const endTime = performance.now();
            
            // Deve levar pelo menos o tempo do stagger
            const expectedMinTime = extraStops.length * manager.staggerDelay;
            expect(endTime - startTime).toBeGreaterThanOrEqual(expectedMinTime - 50); // Margem de erro
        });
    });
});
