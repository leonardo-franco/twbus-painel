/**
 * Configuração central do projeto TwBus
 * Referências para todos os arquivos de configuração
 */

module.exports = {
  // Paths de configuração
  eslint: './config/.eslintrc.js',
  prettier: './config/.prettierrc.yml',
  jest: './config/jest.config.cjs',
  vercel: './config/vercel.json',
  spell: './config/.cspell.json',
  
  // Estrutura de pastas
  paths: {
    src: './src',
    assets: './assets',
    config: './config',
    docs: './docs',
    tests: './tests'
  },
  
  // Configurações do projeto
  project: {
    name: 'twbus-painel',
    version: '2.0.1',
    description: 'Painel interativo para informações de parada de ônibus'
  }
};
