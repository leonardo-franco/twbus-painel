# 🚌 TwBus - Painel de Parada de Ônibus

Sistema de painel interativo para informações de parada de ônibus em tempo real, desenvolvido com arquitetura moderna ES6 e focado em segurança e performance.

## ✨ Funcionalidades

- **Interface Moderna**: Design responsivo com glassmorphism e gradientes
- **Expansão de Rota**: Visualize paradas básicas ou rota completa
- **Botões de Controle**: Expandir/recolher e atualizar informações
- **Mobile-First**: Otimizado para todos os dispositivos
- **Segurança**: Sistema de validação robusto com CSP
- **Performance**: Carregamento rápido e animações fluidas

## 🏗️ Tecnologias

- **Frontend**: HTML5, CSS3, JavaScript ES6+ Modules
- **Arquitetura**: Modular com classes ES6
- **Segurança**: SecurityValidator, CSP, sanitização
- **Testes**: Jest com testes automatizados
- **Deploy**: Vercel com CDN global

## 🚀 Início Rápido

```bash
# Clonar repositório
git clone https://github.com/leonardo-franco/twbus-painel.git
cd twbus-painel

# Instalar dependências
npm install

# Executar em desenvolvimento
npm run dev
```

## 📁 Estrutura

```
├── assets/                # Recursos estáticos
│   └── icons/             # Ícones e imagens
├── config/                # Arquivos de configuração
│   ├── .eslintrc.js       # Configuração ESLint
│   ├── .prettierrc.yml    # Configuração Prettier
│   ├── jest.config.cjs    # Configuração Jest
│   └── .cspell.json       # Dicionário spell check
├── docs/                  # Documentação
├── src/                   # Código fonte
│   ├── app.js             # Ponto de entrada principal
│   ├── core/              # Módulos principais
│   │   ├── BusPanel.js    # Classe principal do painel
│   │   └── EventManager.js # Gerenciamento de eventos
│   ├── security/          # Sistema de segurança
│   │   └── SecurityValidator.js
│   └── utils/             # Utilitários
│       ├── constants.js   # Constantes do sistema
│       └── helpers.js     # Funções auxiliares
├── tests/                 # Testes automatizados
├── index.html             # Página principal
├── style.css              # Estilos CSS
└── package.json           # Dependências e scripts
```

## 🧪 Testes

```bash
npm run test
```

Testes incluem:
- Funcionalidade dos botões de controle
- Elementos DOM essenciais
- Sistema de segurança
- Responsividade

## 🌐 Deploy

### Vercel (Produção)

```bash
npm run deploy
```

**URL Live**: [https://twbus-odjn8wacd-lleozzxs-projects.vercel.app](https://twbus-odjn8wacd-lleozzxs-projects.vercel.app)

## 📱 Funcionalidades do Painel

### Interface Principal
- **Informações do Ônibus**: Número da linha e tempo de chegada
- **Rota Completa**: Paradas anteriores, atual, próximas e futuras
- **Status Visual**: Indicadores coloridos para cada tipo de parada
- **Informações Extras**: Lugares livres, próximo ônibus, Wi-Fi, acessibilidade

### Controles
- **Expandir/Recolher**: Visualizar rota completa ou compacta
- **Atualizar**: Refresh das informações em tempo real
- **Touch Gestures**: Suporte a swipe em dispositivos móveis

## 🎨 Design System

- **Cores**: Gradiente azul/roxo com alta legibilidade
- **Tipografia**: Inter font para melhor leitura
- **Animações**: Transições suaves CSS3
- **Responsivo**: Breakpoints para mobile, tablet e desktop
- **Glassmorphism**: Efeito de vidro moderno

## 🔧 Scripts Disponíveis

```bash
npm run dev          # Servidor de desenvolvimento
npm run test         # Executar testes
npm run build        # Build para produção
npm run deploy       # Deploy para produção
npm run lint         # Verificar código
```

## 📊 Performance

- **First Paint**: < 1s
- **Fully Loaded**: < 2s
- **Lighthouse Score**: 95+/100
- **PWA Score**: 100/100

## 🔒 Segurança

- Content Security Policy (CSP)
- Sanitização de entradas
- Validação de elementos DOM
- Proteção contra XSS

## 📄 Licença

MIT License - veja [LICENSE](LICENSE) para detalhes.

## 👨‍💻 Autor

**Leonardo Franco** - [GitHub](https://github.com/leonardo-franco)

---

**TwBus v2.0.1** - Painel moderno para informações de transporte público 🚌✨
