/**
 * Configuração do ESLint para o projeto TwBus
 * Garante qualidade e consistência do código
 */

module.exports = {
  env: {
    browser: true,
    es2022: true,
    node: true,
    jest: true
  },
  extends: [
    'standard'
  ],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module'
  },
  rules: {
    // Configurações específicas para o projeto
    'no-console': 'off', // Permitir console.log para debug
    'no-unused-vars': 'warn', // Avisar sobre variáveis não utilizadas
    'prefer-const': 'error', // Preferir const quando possível
    'no-var': 'error', // Não usar var
    'arrow-spacing': 'error', // Espaçamento em arrow functions
    'object-shorthand': 'error', // Usar sintaxe abreviada de objetos
    'prefer-template': 'error', // Preferir template literals
    'template-curly-spacing': 'error', // Espaçamento em template literals
    'quote-props': ['error', 'as-needed'], // Aspas em propriedades apenas quando necessário
    'no-multiple-empty-lines': ['error', { max: 1 }], // Máximo de 1 linha vazia
    'eol-last': 'error', // Linha vazia no final do arquivo
    'comma-dangle': ['error', 'never'], // Não permitir vírgulas no final
    'semi': ['error', 'always'], // Sempre usar ponto e vírgula
    
    // Regras específicas para segurança
    'no-eval': 'error', // Nunca usar eval
    'no-implied-eval': 'error', // Nunca usar eval implícito
    'no-new-func': 'error', // Nunca usar new Function
    'no-script-url': 'error', // Nunca usar javascript: URLs
    'no-with': 'error', // Nunca usar with
    
    // Regras para melhor performance
    'no-loop-func': 'error', // Não criar funções dentro de loops
    'no-extend-native': 'error', // Não estender protótipos nativos
    'no-proto': 'error', // Não usar __proto__
    
    // Regras para melhores práticas
    'no-alert': 'warn', // Avisar sobre uso de alert
    'no-confirm': 'warn', // Avisar sobre uso de confirm
    'no-debugger': 'error', // Não usar debugger em produção
    'no-empty': 'error', // Não permitir blocos vazios
    'no-unreachable': 'error', // Não permitir código inalcançável
    'curly': 'error', // Sempre usar chaves
    'default-case': 'error', // Sempre ter default em switch
    'eqeqeq': 'error', // Sempre usar === e !==
    'no-fallthrough': 'error', // Não permitir fallthrough em switch
    'no-floating-decimal': 'error', // Não permitir decimais flutuantes
    'no-self-compare': 'error', // Não permitir comparação consigo mesmo
    'no-throw-literal': 'error', // Não jogar literais
    'no-unmodified-loop-condition': 'error', // Não permitir condições de loop não modificadas
    'no-unused-expressions': 'error', // Não permitir expressões não utilizadas
    'no-useless-call': 'error', // Não permitir calls desnecessários
    'no-useless-concat': 'error', // Não permitir concatenações desnecessárias
    'no-useless-return': 'error', // Não permitir returns desnecessários
    'radix': 'error', // Sempre usar radix em parseInt
    'wrap-iife': 'error', // Sempre envolver IIFEs em parênteses
    'yoda': 'error', // Não usar condições yoda
    
    // Regras para variáveis
    'no-catch-shadow': 'error', // Não permitir shadow em catch
    'no-shadow': 'error', // Não permitir shadow de variáveis
    'no-shadow-restricted-names': 'error', // Não permitir shadow de nomes restritos
    'no-undef': 'error', // Não permitir variáveis indefinidas
    'no-undef-init': 'error', // Não inicializar com undefined
    'no-undefined': 'error', // Não usar undefined
    'no-use-before-define': 'error' // Não usar antes de definir
  },
  globals: {
    // Globais específicas do projeto
    BusPanelTester: 'readonly',
    TwBusApp: 'readonly',
    BusPanel: 'readonly',
    SecurityValidator: 'readonly'
  },
  overrides: [
    {
      files: ['tests/**/*.js', '**/*.test.js'],
      rules: {
        'no-unused-expressions': 'off' // Permitir expressões não utilizadas em testes
      }
    }
  ]
};
