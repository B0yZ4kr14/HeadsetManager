# 🎧 HeadsetManager

**Gerenciador Profissional de Headsets USB para Linux e Windows**

Sistema completo de diagnóstico, teste e gerenciamento de headsets USB (Attimo Telecom HS01/HS02 e Fanvil HT201/HT202/HT301-U), desenvolvido para técnicos e usuários finais da TSI Telecom.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org/)
[![Tests](https://img.shields.io/badge/tests-8%20passing-success)](https://vitest.dev/)

---

## ✨ Funcionalidades Principais

### 🎤 Gravação e Análise de Áudio

- **Gravação em tempo real** com visualização de espectro colorido (Chart.js)
- **Medidores circulares** de nível de áudio e qualidade
- **Modo fullscreen** para análise detalhada durante testes prolongados
- **Teste de ruído branco** para validação de cancelamento de ruído
- **Download local** de gravações (formato WebM)
- **Metadados persistentes** no banco de dados para histórico de manutenção

### 🔧 Diagnóstico e Troubleshooting

- **10 scripts pré-configurados** para resolução de problemas comuns:
  - Verificação de drivers USB (lsusb, dmesg)
  - Análise de logs do kernel
  - Testes de PulseAudio/ALSA
  - Diagnóstico de permissões de áudio
  - Verificação de codecs e sample rates
- **Execução com um clique** e histórico completo de resultados
- **Categorização automática** por tipo (driver, áudio, sistema, rede)
- **Filtros de status** (online/offline) para dispositivos

### 🤖 Assistente de IA (Opcional)

- **Análise inteligente de logs** com OpenAI GPT-4o-mini, Anthropic Claude ou Google Gemini
- **Sugestões automáticas** de correção com nível de severidade
- **Diagnóstico com confiança** (0-100%)
- **Configuração flexível** de API Key (suporta múltiplos provedores)

### 📊 Monitoramento em Tempo Real

- **WebSockets** para logs do sistema ao vivo
- **Painel de terminal integrado** com exportação de logs (.txt)
- **Notificações** de execução de scripts e alertas
- **Sistema de atualizações** via GitHub Releases

### 📝 Histórico e Relatórios

- **Registro completo** de todas as gravações com metadados
- **Métricas de qualidade** ao longo do tempo
- **Consulta para manutenção preventiva**
- **FAQ integrado** com guias de instalação e troubleshooting

---

## 🎨 Interface

- **Tema neon dark moderno** com paleta azul TSI (#1E3A8A, #2563EB)
- **Layout Bento Grid** responsivo e modular
- **Glassmorphism effects** com bordas neon (azul/verde/laranja)
- **Tooltips explicativos** em todos os botões (UX para leigos)
- **Loading states** e skeleton loaders
- **Efeitos hover** interativos nos medidores circulares

---

## 🚀 Instalação

### Windows (.msi)

1. Baixe o instalador `HeadsetManager-Setup.msi` da [página de releases](https://github.com/B0yZ4kr14/HeadsetManager/releases)
2. Execute o instalador e siga as instruções
3. O aplicativo será instalado em `C:\Program Files\HeadsetManager`
4. Acesse pelo menu Iniciar: **TSI Telecom > Headset Manager**

### Linux (.bin)

```bash
# Baixe o instalador
wget https://github.com/B0yZ4kr14/HeadsetManager/releases/latest/download/HeadsetManager-Installer.bin

# Torne executável
chmod +x HeadsetManager-Installer.bin

# Execute o instalador
./HeadsetManager-Installer.bin

# O aplicativo será instalado em /opt/headset-manager
# Acesse via: headset-manager
```

### Instalação Manual (Desenvolvimento)

**Requisitos:**

- Node.js 22.x ou superior
- PostgreSQL 14+ (ou MySQL/TiDB compatível)
- pnpm 9.x

```bash
# Clone o repositório
git clone https://github.com/B0yZ4kr14/HeadsetManager.git
cd HeadsetManager

# Instale dependências
pnpm install

# Configure o banco de dados
# As variáveis de ambiente são injetadas automaticamente pelo Manus
# Para desenvolvimento local, configure DATABASE_URL manualmente

# Execute migrações
pnpm db:push

# Popule scripts de troubleshooting
pnpm seed

# Inicie o servidor de desenvolvimento
pnpm dev

# Acesse: http://localhost:3000
```

---

## 📖 Uso Básico

### 1. Seleção de Dispositivo

1. Clique no botão **Atualizar** (ícone de refresh) no canto superior direito
2. Selecione o headset USB no dropdown **DISPOSITIVO**
3. O status mudará para **ONLINE** (indicador verde)

### 2. Gravação de Áudio

1. Clique em **Iniciar Gravação** (ícone de microfone)
2. O analisador de espectro exibirá as frequências em tempo real
3. Os medidores circulares mostrarão **Nível** (dB) e **Qualidade** (%)
4. Clique em **Parar** para finalizar a gravação
5. Use **Reproduzir** para ouvir a gravação
6. Clique em **Salvar** para fazer download local

### 3. Teste de Cancelamento de Ruído

1. Selecione o dispositivo
2. Clique em **Teste de Ruído**
3. Um ruído branco será reproduzido
4. A gravação iniciará automaticamente
5. Analise a qualidade de cancelamento nos medidores

### 4. Diagnósticos Manuais

1. Acesse **Diagnósticos** no menu lateral
2. Escolha um script da lista (ex: "Verificar Drivers USB")
3. Clique em **Executar**
4. Aguarde a conclusão e visualize os resultados
5. Consulte o **Histórico de Execuções** abaixo

### 5. Assistente de IA (Opcional)

1. Acesse **Configurações** no menu lateral
2. Escolha o provedor (OpenAI/Anthropic/Gemini)
3. Insira sua API Key
4. Clique em **Salvar Configurações**
5. Retorne ao **Dashboard** e use o chat de IA no canto inferior direito

---

## 🏗️ Arquitetura Técnica

### Stack

- **Frontend**: React 19 + TypeScript + Tailwind CSS 4 + shadcn/ui
- **Backend**: Next.js 14 (App Router) + tRPC 11 + Express 4
- **Database**: PostgreSQL (via Drizzle ORM)
- **Real-time**: Socket.IO (WebSockets)
- **Charts**: Chart.js 4
- **Audio**: Web Audio API + MediaRecorder API
- **Tests**: Vitest (8 testes unitários)

### Estrutura de Diretórios

```
headset_demo_web/
├── client/                 # Frontend React
│   ├── public/            # Assets estáticos
│   └── src/
│       ├── pages/         # Páginas (Home, Diagnostics, etc.)
│       ├── components/    # Componentes reutilizáveis
│       └── lib/           # Utilitários e tRPC client
├── server/                # Backend Node.js
│   ├── _core/            # Infraestrutura (OAuth, tRPC, LLM)
│   ├── routers/          # Rotas tRPC
│   └── services/         # Serviços (OpenAI, Socket.IO)
├── drizzle/              # Schema e migrações do banco
├── shared/               # Tipos compartilhados
└── scripts/              # Build scripts para instaladores
```

### Database Schema

- **devices**: Dispositivos de áudio detectados
- **audio_tests**: Gravações e metadados
- **system_logs**: Logs do sistema
- **troubleshooting_scripts**: Scripts de diagnóstico
- **script_executions**: Histórico de execuções
- **ai_diagnostics**: Análises de IA
- **user_settings**: Configurações do usuário (API Keys)

---

## 🧪 Testes

```bash
# Executar todos os testes
pnpm test

# Testes com cobertura
pnpm test:coverage

# Testes em modo watch
pnpm test:watch
```

**Cobertura atual**: 8 testes passando
- Autenticação (logout)
- Integração com OpenAI (3 testes)
- Troubleshooting scripts (4 testes)

---

## 🔧 Build e Deploy

### Desenvolvimento

```bash
pnpm dev          # Inicia servidor de desenvolvimento (porta 3000)
pnpm db:push      # Sincroniza schema do banco
pnpm seed         # Popula scripts de troubleshooting
```

### Produção

```bash
pnpm build        # Build otimizado para produção
pnpm start        # Inicia servidor de produção
```

### Instaladores

```bash
# Windows (.msi)
pnpm build:windows

# Linux (.bin)
pnpm build:linux

# Ambos
pnpm build:installers
```

---

## 🤝 Contribuindo

Contribuições são bem-vindas! Por favor, leia o [CONTRIBUTING.md](CONTRIBUTING.md) para detalhes sobre nosso código de conduta e processo de pull requests.

### Passos para Contribuir

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

---

## 📄 Licença

Este projeto está licenciado sob a Licença MIT - veja o arquivo [LICENSE](LICENSE) para detalhes.

---

## 🆘 Suporte

### FAQ

Consulte a seção **Documentação** no aplicativo para perguntas frequentes sobre:
- Instalação e configuração inicial
- Troubleshooting de drivers USB
- Configuração de API Keys para IA
- Problemas comuns de áudio

### Reportar Bugs

Abra uma [issue no GitHub](https://github.com/B0yZ4kr14/HeadsetManager/issues) com:
- Descrição detalhada do problema
- Passos para reproduzir
- Sistema operacional e versão
- Logs relevantes (exportados via Terminal & Logs)

### Contato

- **Desenvolvedor**: TSI Telecom
- **Email**: suporte@tsitelecom.com.br
- **Website**: https://tsitelecom.com.br

---

## 🙏 Agradecimentos

- [shadcn/ui](https://ui.shadcn.com/) - Componentes UI
- [Chart.js](https://www.chartjs.org/) - Visualização de dados
- [tRPC](https://trpc.io/) - Type-safe APIs
- [Drizzle ORM](https://orm.drizzle.team/) - Database toolkit
- [Vitest](https://vitest.dev/) - Testing framework

---

**Desenvolvido com ❤️ pela equipe TSI Telecom**
