/**
 * TwBus Security Configuration
 * Configurações avançadas de segurança para o painel de ônibus
 */

// Configuração CSP (Content Security Policy)
const SECURITY_CONFIG = {
    // Origens confiáveis
    trustedOrigins: [
        'https://twbus.vercel.app',
        'https://*.vercel.app',
        'https://localhost',
        'http://localhost'
    ],
    
    // Headers de segurança obrigatórios
    requiredHeaders: {
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'DENY',
        'X-XSS-Protection': '1; mode=block',
        'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
        'Referrer-Policy': 'strict-origin-when-cross-origin'
    },
    
    // Rate limits por tipo de evento
    rateLimits: {
        'click': 10,      // 10 cliques por segundo
        'refresh': 5,     // 5 refresh por segundo
        'expand': 3,      // 3 expand/collapse por segundo
        'hover': 20,      // 20 hover events por segundo
        'touch': 15       // 15 touch events por segundo
    },
    
    // Padrões perigosos para validação
    dangerousPatterns: [
        /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
        /<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi,
        /javascript:/gi,
        /data:text\/html/gi,
        /on\w+\s*=/gi,
        /eval\s*\(/gi,
        /Function\s*\(/gi,
        /setTimeout\s*\(/gi,
        /setInterval\s*\(/gi,
        /document\.write/gi,
        /innerHTML\s*=/gi,
        /outerHTML\s*=/gi
    ],
    
    // Eventos permitidos
    allowedEvents: [
        'click',
        'touchstart',
        'touchend',
        'mouseenter',
        'mouseleave',
        'keydown',
        'keyup',
        'resize',
        'scroll',
        'focus',
        'blur'
    ],
    
    // Atributos perigosos
    dangerousAttributes: [
        'onclick',
        'onload',
        'onerror',
        'onmouseover',
        'onmouseout',
        'onfocus',
        'onblur',
        'onchange',
        'onsubmit',
        'onreset',
        'onselect',
        'onkeydown',
        'onkeyup',
        'onkeypress'
    ],
    
    // Configurações de monitoramento
    monitoring: {
        logCSPViolations: true,
        logRateLimitViolations: true,
        logSecurityErrors: true,
        alertOnSuspiciousActivity: true,
        maxViolationsBeforeBlock: 5
    },
    
    // Configurações de sessão
    session: {
        maxDuration: 3600000,      // 1 hora em milliseconds
        inactivityTimeout: 900000,  // 15 minutos em milliseconds
        requireRevalidation: false  // Para totem público
    },
    
    // Features de segurança habilitadas
    features: {
        clickjackingProtection: true,
        xssProtection: true,
        prototypePollutionProtection: true,
        rateLimiting: true,
        inputSanitization: true,
        domValidation: true,
        cspViolationReporting: true,
        integrityChecks: true
    }
};

// Políticas de Content Security Policy
const CSP_POLICIES = {
    'default-src': ["'self'"],
    'script-src': [
        "'self'",
        "'unsafe-inline'", // Necessário para scripts inline
        "'unsafe-eval'",   // Necessário para avaliação dinâmica de JavaScript
        "https://cdnjs.cloudflare.com"
    ],
    'style-src': [
        "'self'",
        "'unsafe-inline'", // Necessário para estilos inline
        "https://cdnjs.cloudflare.com"
    ],
    'font-src': [
        "'self'",
        "https://cdnjs.cloudflare.com"
    ],
    'img-src': [
        "'self'",
        "data:",
        "https:"
    ],
    'connect-src': ["'self'", "https://twbus.vercel.app"],
    'frame-ancestors': ["'none'"],
    'base-uri': ["'self'"],
    'form-action': ["'self'"],
    'object-src': ["'none'"],
    'media-src': ["'none'"],
    'child-src': ["'none'"],
    'worker-src': ["'self'"],
    'manifest-src': ["'self'"]
};

// Função para gerar string CSP
function generateCSPString() {
    return Object.entries(CSP_POLICIES)
        .map(([directive, sources]) => `${directive} ${sources.join(' ')}`)
        .join('; ');
}

// Função para validar configuração de segurança
function validateSecurityConfig() {
    const errors = [];
    
    // Validar origens confiáveis
    if (!SECURITY_CONFIG.trustedOrigins || SECURITY_CONFIG.trustedOrigins.length === 0) {
        errors.push('Nenhuma origem confiável configurada');
    }
    
    // Validar rate limits
    for (const [event, limit] of Object.entries(SECURITY_CONFIG.rateLimits)) {
        if (typeof limit !== 'number' || limit <= 0) {
            errors.push(`Rate limit inválido para evento: ${event}`);
        }
    }
    
    // Validar headers obrigatórios
    const requiredHeaders = ['X-Content-Type-Options', 'X-Frame-Options', 'X-XSS-Protection'];
    for (const header of requiredHeaders) {
        if (!SECURITY_CONFIG.requiredHeaders[header]) {
            errors.push(`Header obrigatório ausente: ${header}`);
        }
    }
    
    return {
        valid: errors.length === 0,
        errors
    };
}

// Função para aplicar configurações de segurança
function applySecurityConfig() {
    const validation = validateSecurityConfig();
    
    if (!validation.valid) {
        console.error('Configuração de segurança inválida:', validation.errors);
        throw new Error('Falha na validação da configuração de segurança');
    }
    
    // Aplicar CSP via meta tag (fallback)
    const cspMeta = document.createElement('meta');
    cspMeta.httpEquiv = 'Content-Security-Policy';
    cspMeta.content = generateCSPString();
    document.head.appendChild(cspMeta);
    
    console.log('✅ Configuração de segurança aplicada com sucesso');
    console.log('📋 CSP Policy:', generateCSPString());
    
    return true;
}

// Exportar configurações
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        SECURITY_CONFIG,
        CSP_POLICIES,
        generateCSPString,
        validateSecurityConfig,
        applySecurityConfig
    };
}

// Aplicar configurações automaticamente se em ambiente browser
if (typeof window !== 'undefined') {
    document.addEventListener('DOMContentLoaded', () => {
        try {
            applySecurityConfig();
        } catch (error) {
            console.error('Erro ao aplicar configurações de segurança:', error);
        }
    });
}
