/**
 * ========================================
 * ADMIN LOGIN - JAVASCRIPT
 * Sistema de autenticação administrativo
 * ========================================
 */

class AdminAuth {
    constructor() {
        this.maxAttempts = 3;
        this.lockoutTime = 15 * 60 * 1000; // 15 minutos
        this.sessionDuration = 60 * 60 * 1000; // 1 hora
        
        this.init();
    }
    
    init() {
        this.initSecurity();
        this.setupCSRFProtection();
        this.preventBruteForce();
        this.bindEvents();
    }
    
    initSecurity() {
        // Verificar se já está logado
        if (this.isAuthenticated()) {
            this.redirectToDashboard();
            return;
        }
        
        // Verificar tentativas de login
        this.checkLoginAttempts();
        
        // Headers de segurança
        this.addSecurityHeaders();
    }
    
    bindEvents() {
        const form = document.getElementById('loginForm');
        const usernameInput = document.getElementById('username');
        const passwordInput = document.getElementById('password');
        
        form.addEventListener('submit', (e) => this.handleLogin(e));
        
        // Limpar mensagens ao digitar
        [usernameInput, passwordInput].forEach(input => {
            input.addEventListener('input', () => this.clearMessages());
        });
        
        // Detectar Enter
        [usernameInput, passwordInput].forEach(input => {
            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    form.dispatchEvent(new Event('submit'));
                }
            });
        });
    }
    
    async handleLogin(e) {
        e.preventDefault();
        
        // Verificar se está bloqueado
        if (this.isLockedOut()) {
            this.showError('Conta bloqueada. Tente novamente em alguns minutos.');
            return;
        }
        
        const username = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value;
        
        // Validação básica
        if (!username || !password) {
            this.showError('Por favor, preencha todos os campos.');
            return;
        }
        
        this.setLoading(true);
        this.clearMessages();
        
        try {
            // Simular delay de rede para prevenir ataques
            await this.delay(Math.random() * 1000 + 500);
            
            const isValid = await this.validateCredentials(username, password);
            
            if (isValid) {
                this.onLoginSuccess(username);
            } else {
                this.onLoginFailure();
            }
        } catch (error) {
            this.showError('Erro interno. Tente novamente.');
            console.error('Erro no login:', error);
        } finally {
            this.setLoading(false);
        }
    }
    
    async validateCredentials(username, password) {
        // Simular validação segura
        await this.delay(500);
        
        // Verificação básica para demo
        const validCredentials = [
            { user: 'admin', pass: 'admin123' },
            { user: 'leonardo', pass: 'franco123' },
            { user: 'twbus', pass: 'painel2025' }
        ];
        
        return validCredentials.some(cred => 
            cred.user === username && cred.pass === password
        );
    }
    
    onLoginSuccess(username) {
        this.clearLoginAttempts();
        this.createSession(username);
        this.showSuccess('Login realizado com sucesso! Redirecionando...');
        
        setTimeout(() => {
            this.redirectToDashboard();
        }, 1500);
    }
    
    onLoginFailure() {
        const attempts = this.incrementLoginAttempts();
        const remaining = this.maxAttempts - attempts;
        
        if (remaining > 0) {
            this.showError(`Credenciais inválidas. ${remaining} tentativa(s) restante(s).`);
        } else {
            this.lockAccount();
            this.showError('Muitas tentativas falharam. Conta bloqueada temporariamente.');
        }
    }
    
    createSession(username) {
        const sessionData = {
            username: username,
            authenticated: true,
            loginTime: Date.now(),
            expires: Date.now() + this.sessionDuration,
            token: this.generateSessionToken(),
            userAgent: navigator.userAgent,
            ip: 'client-side' // Em produção seria obtido do servidor
        };
        
        localStorage.setItem('twbus_admin_session', JSON.stringify(sessionData));
        sessionStorage.setItem('twbus_admin_active', 'true');
        
        console.log('✅ Sessão administrativa criada');
    }
    
    isAuthenticated() {
        try {
            const session = JSON.parse(localStorage.getItem('twbus_admin_session') || '{}');
            const isActive = sessionStorage.getItem('twbus_admin_active') === 'true';
            
            return session.authenticated && 
                   session.expires > Date.now() && 
                   isActive &&
                   session.token;
        } catch {
            return false;
        }
    }
    
    generateSessionToken() {
        return Array.from(crypto.getRandomValues(new Uint8Array(32)), b => 
            b.toString(16).padStart(2, '0')).join('');
    }
    
    redirectToDashboard() {
        window.location.href = 'admin-dashboard.html';
    }
    
    // Controle de tentativas de login
    getLoginAttempts() {
        const attempts = localStorage.getItem('twbus_login_attempts');
        return attempts ? parseInt(attempts) : 0;
    }
    
    incrementLoginAttempts() {
        const attempts = this.getLoginAttempts() + 1;
        localStorage.setItem('twbus_login_attempts', attempts.toString());
        localStorage.setItem('twbus_last_attempt', Date.now().toString());
        return attempts;
    }
    
    clearLoginAttempts() {
        localStorage.removeItem('twbus_login_attempts');
        localStorage.removeItem('twbus_last_attempt');
    }
    
    isLockedOut() {
        const attempts = this.getLoginAttempts();
        const lastAttempt = localStorage.getItem('twbus_last_attempt');
        
        if (attempts >= this.maxAttempts && lastAttempt) {
            const timePassed = Date.now() - parseInt(lastAttempt);
            return timePassed < this.lockoutTime;
        }
        
        return false;
    }
    
    lockAccount() {
        const lockoutUntil = Date.now() + this.lockoutTime;
        localStorage.setItem('twbus_lockout', lockoutUntil.toString());
    }
    
    checkLoginAttempts() {
        const attempts = this.getLoginAttempts();
        if (attempts >= this.maxAttempts) {
            const lastAttempt = localStorage.getItem('twbus_last_attempt');
            if (lastAttempt && (Date.now() - parseInt(lastAttempt)) < this.lockoutTime) {
                this.lockAccount();
            } else {
                this.clearLoginAttempts();
            }
        }
    }
    
    preventBruteForce() {
        let requestCount = 0;
        const resetTime = 60000; // 1 minuto
        
        setInterval(() => {
            requestCount = 0;
        }, resetTime);
        
        // Monitorar tentativas rápidas
        document.getElementById('loginForm').addEventListener('submit', () => {
            requestCount++;
            if (requestCount > 5) {
                this.showError('Muitas tentativas muito rápidas. Aguarde um momento.');
                this.setLoading(true);
                setTimeout(() => this.setLoading(false), 3000);
            }
        });
    }
    
    setupCSRFProtection() {
        // Token CSRF simples
        const token = this.generateSessionToken();
        document.getElementById('loginForm').insertAdjacentHTML('beforeend',
            `<input type="hidden" name="csrf_token" value="${token}">`
        );
    }
    
    addSecurityHeaders() {
        // Headers de segurança visuais para fins de demonstração
        const meta = document.createElement('meta');
        meta.httpEquiv = 'Content-Security-Policy';
        meta.content = "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'";
        document.head.appendChild(meta);
    }
    
    // Utilitários
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    
    setLoading(loading) {
        const button = document.getElementById('loginButton');
        const text = document.getElementById('loginText');
        const spinner = document.getElementById('loginSpinner');
        
        if (loading) {
            button.disabled = true;
            text.textContent = 'Verificando...';
            if (spinner) spinner.classList.remove('spinner-hidden');
        } else {
            button.disabled = false;
            text.textContent = 'Entrar';
            if (spinner) spinner.classList.add('spinner-hidden');
        }
    }
    
    showError(message) {
        const errorDiv = document.getElementById('errorMessage');
        const successDiv = document.getElementById('successMessage');
        
        successDiv.style.display = 'none';
        errorDiv.textContent = message;
        errorDiv.style.display = 'block';
        
        // Auto-limpar após 5 segundos
        setTimeout(() => {
            errorDiv.style.display = 'none';
        }, 5000);
    }
    
    showSuccess(message) {
        const errorDiv = document.getElementById('errorMessage');
        const successDiv = document.getElementById('successMessage');
        
        errorDiv.style.display = 'none';
        successDiv.textContent = message;
        successDiv.style.display = 'block';
    }
    
    clearMessages() {
        document.getElementById('errorMessage').style.display = 'none';
        document.getElementById('successMessage').style.display = 'none';
    }
}

// Inicializar sistema de autenticação
document.addEventListener('DOMContentLoaded', () => {
    new AdminAuth();
});

// Logout automático ao fechar aba/navegador
window.addEventListener('beforeunload', () => {
    sessionStorage.removeItem('twbus_admin_active');
});

console.log('🔐 Sistema de login administrativo carregado');
