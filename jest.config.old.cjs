/**
 * Arquivo de configuração do Jest para testes
 * Configurações específicas para o projeto TwBus
 */

module.exports = {
  // Ambiente de teste
  testEnvironment: 'jsdom',
  
  // Arquivos de configuração antes dos testes
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
  
  // Padrões para encontrar arquivos de teste
  testMatch: [
    '<rootDir>/tests/**/*.test.js',
    '<rootDir>/src/**/*.test.js'
  ],
  
  // Arquivos a serem ignorados
  testPathIgnorePatterns: [
    '/node_modules/',
    '/dist/',
    '/build/'
  ],
  
  // Configuração de cobertura
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/**/*.test.js',
    '!src/**/index.js',
    '!src/utils/constants.js' // Arquivo de constantes não precisa de testes
  ],
  
  // Thresholds de cobertura
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  },
  
  // Formato dos relatórios de cobertura
  coverageReporters: [
    'text',
    'html',
    'lcov',
    'clover'
  ],
  
  // Diretório para saída da cobertura
  coverageDirectory: 'coverage',
  
  // Configuração de módulos
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/src/$1'
  },
  
  // Timeout para testes
  testTimeout: 10000,
  
  // Configuração de transformação
  transform: {
    '^.+\\.js$': 'babel-jest'
  },
  
  // Configuração de mocks
  moduleFileExtensions: ['js', 'json'],
  
  // Configuração de verbose
  verbose: true,
  
  // Configuração de watch
  watchman: true,
  
  // Configuração de cache
  cache: true,
  cacheDirectory: '/tmp/jest_cache',
  
  // Configuração de relatórios
  reporters: [
    'default',
    [
      'jest-html-reporters',
      {
        publicPath: './coverage/html-report',
        filename: 'report.html',
        expand: true
      }
    ]
  ],
  
  // Configuração de globals
  globals: {
    'process.env': {
      NODE_ENV: 'test'
    }
  }
};
