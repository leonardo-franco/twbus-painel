/**
 * Testes para o SecurityValidator
 * Verifica funcionalidades de segurança
 */

import { SecurityValidator, SecurityError } from '../src/security/SecurityValidator.js';

describe('SecurityValidator', () => {
  let validator;

  beforeEach(() => {
    validator = new SecurityValidator();
  });

  afterEach(() => {
    global.testHelpers.clearAllMocks();
  });

  describe('Singleton Pattern', () => {
    test('deve retornar a mesma instância', () => {
      const validator1 = new SecurityValidator();
      const validator2 = new SecurityValidator();
      
      expect(validator1).toBe(validator2);
    });
  });

  describe('Input Sanitization', () => {
    test('deve sanitizar scripts maliciosos', () => {
      const maliciousInput = '<script>alert("XSS")</script>Hello';
      const sanitized = validator.sanitizeInput(maliciousInput);
      
      expect(sanitized).toBe('Hello');
      expect(sanitized).not.toContain('<script>');
    });

    test('deve remover javascript: URLs', () => {
      const maliciousInput = 'javascript:alert("XSS")';
      const sanitized = validator.sanitizeInput(maliciousInput);
      
      expect(sanitized).toBe('alert("XSS")');
      expect(sanitized).not.toContain('javascript:');
    });

    test('deve remover event handlers inline', () => {
      const maliciousInput = '<div onclick="alert()">Content</div>';
      const sanitized = validator.sanitizeInput(maliciousInput);
      
      expect(sanitized).not.toContain('onclick');
    });

    test('deve lançar erro para input muito longo', () => {
      const longInput = 'a'.repeat(1001);
      
      expect(() => {
        validator.sanitizeInput(longInput);
      }).toThrow(SecurityError);
    });

    test('deve lançar erro para input não-string', () => {
      expect(() => {
        validator.sanitizeInput(123);
      }).toThrow(SecurityError);
    });
  });

  describe('Element Validation', () => {
    test('deve validar elemento DOM válido', () => {
      const element = global.testHelpers.createMockElement('div');
      
      expect(() => {
        validator.validateElement(element);
      }).not.toThrow();
    });

    test('deve rejeitar elemento inválido', () => {
      expect(() => {
        validator.validateElement(null);
      }).toThrow(SecurityError);
    });

    test('deve rejeitar elemento com atributos perigosos', () => {
      const element = global.testHelpers.createMockElement('div');
      element.hasAttribute = jest.fn(() => true);
      
      expect(() => {
        validator.validateElement(element);
      }).toThrow(SecurityError);
    });
  });

  describe('Rate Limiting', () => {
    test('deve permitir requisições dentro do limite', () => {
      expect(() => {
        validator.checkRateLimit('test', 10);
      }).not.toThrow();
    });

    test('deve bloquear requisições acima do limite', () => {
      // Fazer muitas requisições rapidamente
      for (let i = 0; i < 11; i++) {
        if (i === 10) {
          expect(() => {
            validator.checkRateLimit('test', 10);
          }).toThrow(SecurityError);
        } else {
          validator.checkRateLimit('test', 10);
        }
      }
    });

    test('deve limpar rate limit antigo', () => {
      // Simular timeout para limpeza
      jest.useFakeTimers();
      
      validator.checkRateLimit('test', 10);
      
      // Avançar tempo
      jest.advanceTimersByTime(61000);
      
      // Deve funcionar novamente
      expect(() => {
        validator.checkRateLimit('test', 10);
      }).not.toThrow();
      
      jest.useRealTimers();
    });
  });

  describe('Origin Validation', () => {
    test('deve validar origem confiável', () => {
      const trustedOrigin = 'https://twbus.vercel.app';
      
      expect(validator.validateOrigin(trustedOrigin)).toBe(true);
    });

    test('deve rejeitar origem não confiável', () => {
      const untrustedOrigin = 'https://malicious.com';
      
      expect(validator.validateOrigin(untrustedOrigin)).toBe(false);
    });

    test('deve rejeitar origem vazia', () => {
      expect(validator.validateOrigin('')).toBe(false);
      expect(validator.validateOrigin(null)).toBe(false);
    });
  });

  describe('Event Handler Creation', () => {
    test('deve criar handler seguro', () => {
      const originalHandler = jest.fn();
      const secureHandler = validator.createSecureEventHandler(originalHandler);
      
      expect(typeof secureHandler).toBe('function');
    });

    test('deve executar handler original com evento válido', () => {
      const originalHandler = jest.fn();
      const secureHandler = validator.createSecureEventHandler(originalHandler);
      
      const mockEvent = global.testHelpers.createMockEvent('click');
      
      secureHandler(mockEvent);
      
      expect(originalHandler).toHaveBeenCalledWith(mockEvent);
    });

    test('deve bloquear tipos de evento não permitidos', () => {
      const originalHandler = jest.fn();
      const secureHandler = validator.createSecureEventHandler(originalHandler);
      
      const mockEvent = global.testHelpers.createMockEvent('dangerous');
      
      secureHandler(mockEvent);
      
      expect(originalHandler).not.toHaveBeenCalled();
    });
  });

  describe('Security Metrics', () => {
    test('deve retornar métricas iniciais', () => {
      const metrics = validator.getSecurityMetrics();
      
      expect(metrics).toHaveProperty('totalViolations');
      expect(metrics).toHaveProperty('rateLimitHits');
      expect(metrics).toHaveProperty('sanitizedInputs');
      expect(metrics).toHaveProperty('timestamp');
    });

    test('deve incrementar métricas corretamente', () => {
      const initialMetrics = validator.getSecurityMetrics();
      
      // Fazer sanitização
      validator.sanitizeInput('test');
      
      const updatedMetrics = validator.getSecurityMetrics();
      
      expect(updatedMetrics.sanitizedInputs).toBe(initialMetrics.sanitizedInputs + 1);
    });

    test('deve resetar métricas', () => {
      // Gerar algumas métricas
      validator.sanitizeInput('test');
      
      validator.resetSecurityMetrics();
      
      const metrics = validator.getSecurityMetrics();
      expect(metrics.sanitizedInputs).toBe(0);
    });
  });

  describe('Security Incident Reporting', () => {
    test('deve reportar incidente de segurança', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      
      validator.reportSecurityIncident('TEST_INCIDENT', { test: 'data' });
      
      expect(consoleSpy).toHaveBeenCalled();
      
      consoleSpy.mockRestore();
    });
  });
});
