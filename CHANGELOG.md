# Changelog

Todas as mudanças notáveis neste projeto serão documentadas neste arquivo.

O formato é baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.0.0/),
e este projeto adere ao [Semantic Versioning](https://semver.org/lang/pt-BR/).

## [1.0.0] - 2024-12-03

### 🎉 Lançamento Inicial

Primeira versão estável do HeadsetManager com funcionalidades completas de diagnóstico e gerenciamento de headsets USB.

### ✨ Adicionado

#### Core Features
- Gravação de áudio com MediaRecorder API
- Análise de espectro em tempo real com Chart.js
- Medidores circulares de performance (nível de áudio e qualidade)
- Teste de cancelamento de ruído com ruído branco
- Seleção de dispositivos de entrada (USB)
- Download de gravações localmente (formato WebM)
- Histórico de gravações com metadados no banco

#### Backend e Database
- Full Stack com Next.js 14 + tRPC 11 + PostgreSQL
- 7 tabelas no banco (devices, tests, logs, scripts, executions, diagnostics, settings)
- 10 scripts de troubleshooting pré-configurados
- Integração com IA (OpenAI GPT-4o-mini, Anthropic Claude, Google Gemini)
- WebSockets (Socket.IO) para logs em tempo real
- Sistema de autenticação OAuth

#### UI/UX
- Tema neon dark moderno com paleta azul TSI
- Layout Bento Grid responsivo
- Glassmorphism effects com bordas neon
- Tooltips explicativos em todos os botões
- Loading states e skeleton loaders
- Filtro de status (online/offline) para dispositivos
- Efeitos hover nos medidores circulares com tooltips detalhados
- **Modo fullscreen** para analisador de espectro
- Logo TSI estilizada com CSS (sem fundo branco)

#### Documentação
- README.md completo com guias de instalação
- CONTRIBUTING.md com diretrizes de contribuição
- FAQ integrado na aplicação
- LICENSE (MIT)
- Sistema de notificações de atualização via GitHub Releases

#### Testes
- 8 testes unitários com Vitest
- Testes de autenticação (logout)
- Testes de integração com OpenAI (3 testes)
- Testes de troubleshooting scripts (4 testes)

#### Build e Deploy
- Script build-windows.js para gerar instalador .msi
- Script build-linux.sh para gerar instalador .bin
- Comandos npm: `build:windows`, `build:linux`, `build:installers`

### 🔧 Técnico

- **Frontend**: React 19, TypeScript 5.9, Tailwind CSS 4, shadcn/ui
- **Backend**: Next.js 14, tRPC 11, Express 4
- **Database**: PostgreSQL com Drizzle ORM
- **Real-time**: Socket.IO (WebSockets)
- **Charts**: Chart.js 4
- **Audio**: Web Audio API + MediaRecorder API
- **Tests**: Vitest

### 📦 Instaladores

- Windows: `HeadsetManager-Setup.msi` (instalação em `C:\Program Files\HeadsetManager`)
- Linux: `HeadsetManager-Installer.bin` (instalação em `/opt/headset-manager`)

### 🐛 Correções

- Corrigido fundo branco na logo TSI (agora usa texto CSS estilizado)
- Corrigido caminho de imagem inexistente (`/tsi-logo.png` → texto CSS)
- Validado TypeScript (zero erros)
- Formatado código com Prettier

### 🔒 Segurança

- API Keys armazenadas de forma segura no banco (criptografadas)
- Autenticação OAuth para acesso ao sistema
- Validação de permissões de microfone no navegador
- CORS configurado para produção

---

## [Unreleased]

### 🚀 Planejado para v1.1.0

- Gráfico de tendências no Histórico (Chart.js - linha temporal)
- Sistema de alertas automáticos (notificações quando ruído > 70dB)
- Exportação de relatório PDF com estatísticas
- Suporte a múltiplos idiomas (i18n)
- Modo claro (light theme)
- Integração com Slack/Discord para notificações

---

## Tipos de Mudanças

- `Adicionado` para novas funcionalidades
- `Modificado` para mudanças em funcionalidades existentes
- `Descontinuado` para funcionalidades que serão removidas
- `Removido` para funcionalidades removidas
- `Correção` para correção de bugs
- `Segurança` para vulnerabilidades corrigidas

---

**Legenda de Versões**:
- **Major** (X.0.0): Mudanças incompatíveis com versões anteriores
- **Minor** (0.X.0): Novas funcionalidades compatíveis
- **Patch** (0.0.X): Correções de bugs e melhorias
