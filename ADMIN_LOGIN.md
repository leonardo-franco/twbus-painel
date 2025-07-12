# Sistema de Login Administrativo - TwBus

## Informações de Acesso

### Como Acessar a Área Administrativa

1. **Na página principal** (`index.html`):
   - Clique no ícone **⚙️** no rodapé **5 vezes seguidas**
   - Será redirecionado para a tela de login

2. **Acesso direto**:
   - Navegue para `/admin-login.html`

### Credenciais de Teste

**Usuário 1:**

- Username: `admin`
- Password: `admin123`

**Usuário 2:**

- Username: `twbus`
- Password: `twbus2025`

**Usuário 3:**

- Username: `test`
- Password: `test123`

## Recursos de Segurança

### Proteção contra Ataques

- Rate limiting (máximo 3 tentativas)
- Lockout automático (15 minutos após 3 falhas)
- Proteção contra força bruta
- Sanitização de entrada
- Validação de caracteres perigosos
- Hash SHA-256 para senhas
- Token CSRF
- Sessão com timeout automático

### Gestão de Sessão

- **Duração:** 30 minutos
- **Extensão:** Possível através do botão "Estender"
- **Logout automático:** Ao fechar navegador/aba
- **Aviso:** Quando restam menos de 5 minutos

### Validações Implementadas

- Usuário mínimo 3 caracteres
- Senha mínima 6 caracteres
- Detecção de caracteres maliciosos
- Verificação de autenticidade contínua

## Interface Administrativa

### Funcionalidades Disponíveis

- Dashboard de Testes: Visualização completa dos resultados
- Monitoramento em Tempo Real: Console integrado
- Status dos Componentes: Verificação de integridade
- Exportação de Dados: Resultados em formato JSON
- Execução Manual: Controle total sobre os testes

### Layout e Design

- Design consistente com o painel principal
- Gradiente: `#667eea` → `#764ba2`
- Efeitos glassmorphism
- Animações suaves
- Interface responsiva
- Indicadores visuais de status

## Configurações Técnicas

### Armazenamento Local

```javascript
// Sessão administrativa
localStorage: 'twbus_admin_session'
sessionStorage: 'twbus_admin_active'

// Controle de tentativas
localStorage: 'twbus_login_attempts'
localStorage: 'twbus_last_attempt'
localStorage: 'twbus_lockout'
```

### URLs e Rotas

- **Login:** `/admin-login.html`
- **Dashboard:** `/test-verification.html` (protegido)
- **Painel Principal:** `/index.html`

### Segurança Backend

> **IMPORTANTE:** Em ambiente de produção:
>
> - Implementar autenticação via backend seguro
> - Usar bcrypt para hash de senhas
> - Implementar JWT tokens
> - Configurar HTTPS obrigatório
> - Implementar logs de auditoria

## Para Desenvolvedores

### Estrutura do Sistema

```text
admin-login.html      # Página de login
test-verification.html # Dashboard protegido
script.js            # Lógica principal
security-config.js   # Configurações de segurança
```

### Classes Principais

- `AdminAuth`: Gerenciamento de autenticação
- `SecurityValidator`: Validações de segurança
- `BusPanelTester`: Sistema de testes

### Personalizações

Para alterar credenciais, edite o array `validCredentials` em `admin-login.html`:

```javascript
const validCredentials = [
    { user: 'seu_usuario', pass: await this.hashPassword('sua_senha') }
];
```

## Compatibilidade

### Navegadores Suportados

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

### Recursos Necessários

- JavaScript habilitado
- LocalStorage disponível
- Crypto API suportada

## Troubleshooting

### Problemas Comuns

#### Conta bloqueada

- Aguarde 15 minutos ou limpe o localStorage

#### Sessão expirada

- Faça login novamente
- Verifique se JavaScript está habilitado

#### Não consegue acessar

- Verifique se a URL está correta
- Limpe cache do navegador
- Teste com navegador em modo incógnito

### Reset Manual

```javascript
// Console do navegador
localStorage.clear();
sessionStorage.clear();
location.reload();
```

## Suporte

Para questões técnicas ou problemas de acesso:

1. Verifique este README
2. Consulte os logs do console
3. Teste com credenciais padrão
4. Entre em contato com a equipe de desenvolvimento

**Sistema pronto para uso em desenvolvimento e demonstração!**
