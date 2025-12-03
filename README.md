# 🎧 HeadsetManager

> **Sistema completo de diagnóstico e gerenciamento de headsets USB**  
> Desenvolvido pela TSI Telecom para profissionais de suporte e usuários finais

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Version](https://img.shields.io/badge/version-1.0.0-green.svg)](https://github.com/B0yZ4kr14/HeadsetManager/releases)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19.0-61DAFB)](https://reactjs.org/)
[![Tests](https://img.shields.io/badge/tests-8%20passing-success)](https://vitest.dev/)

---

## 📖 O que é o HeadsetManager?

O **HeadsetManager** é um programa que ajuda você a **testar e diagnosticar problemas** com fones de ouvido USB (headsets). Ele é como um "médico" para o seu headset: grava áudio, mostra gráficos de som e te avisa se algo não está funcionando direito.

**Ideal para**:
- ✅ Testar qualidade do microfone antes de reuniões importantes
- ✅ Diagnosticar problemas de áudio sem conhecimento técnico
- ✅ Verificar se o cancelamento de ruído está funcionando
- ✅ Equipes de suporte técnico que atendem remotamente

---

## ✨ Principais Funcionalidades

### 🎙️ Gravação e Análise de Áudio
- **Grave áudio com um clique** e veja gráficos coloridos das frequências de som
- **Medidores visuais** de nível de áudio (0-100) e qualidade (0-100)
- **Modo fullscreen** para análise detalhada durante testes prolongados
- **Baixe as gravações** para compartilhar com o suporte

### 🔇 Teste de Cancelamento de Ruído
- O sistema toca um "chiado" (ruído branco)
- Você fala normalmente
- O programa mostra se o cancelamento de ruído está funcionando

### 🛠️ Scripts de Diagnóstico Automático
- **10 comandos prontos** para resolver problemas comuns
- Exemplos: verificar drivers, testar latência, resetar configurações
- Basta clicar e deixar o sistema fazer o trabalho

### 📊 Monitoramento em Tempo Real
- **Logs ao vivo** do sistema via WebSockets
- **Painel de terminal integrado** com exportação de logs
- **Notificações** de execução de scripts e alertas
- **Filtros de status** (online/offline) para dispositivos

### 🤖 Assistente de IA (Opcional)
- **Análise inteligente de logs** com OpenAI GPT-4, Anthropic Claude ou Google Gemini
- **Sugestões automáticas** de correção com nível de severidade
- **Diagnóstico com confiança** (0-100%)

### 📈 Histórico e Relatórios
- **Registro completo** de todas as gravações com metadados
- **Métricas de qualidade** ao longo do tempo
- **Consulta para manutenção preventiva**

---

## 🚀 Como Instalar

### 📥 Windows (Mais Fácil)
1. Baixe o instalador: [HeadsetManager-Setup.msi](https://github.com/B0yZ4kr14/HeadsetManager/releases)
2. Clique duas vezes no arquivo baixado
3. Siga as instruções na tela
4. Pronto! Procure por "HeadsetManager" no menu Iniciar

### 🐧 Linux
```bash
# Baixar instalador
wget https://github.com/B0yZ4kr14/HeadsetManager/releases/latest/download/headset-manager-installer.bin

# Dar permissão
chmod +x headset-manager-installer.bin

# Instalar
sudo ./headset-manager-installer.bin

# Abrir
headset-manager
```

### 💻 Instalação Manual (Desenvolvedores)

**Requisitos**: Node.js 22+, PostgreSQL 14+, pnpm 9+

```bash
# Clone o repositório
git clone https://github.com/B0yZ4kr14/HeadsetManager.git
cd HeadsetManager

# Instale dependências
pnpm install

# Configure o banco de dados (edite .env)
pnpm db:push

# Popule scripts de troubleshooting
pnpm seed

# Inicie o servidor
pnpm dev

# Acesse: http://localhost:3000
```

**Guia completo**: [Instalação Detalhada](wiki/getting-started/Installation.md)

---

## 📋 Requisitos Mínimos

| Item | Requisito |
|------|-----------|
| **Sistema** | Windows 10+ ou Linux (Ubuntu 20.04+) |
| **Navegador** | Chrome 90+, Firefox 88+, Edge 90+ |
| **RAM** | 4 GB |
| **Espaço** | 500 MB livres |
| **Headset** | Qualquer modelo USB |

---

## 🎯 Como Usar (Passo a Passo)

### 1️⃣ Primeira Vez
1. Abra o HeadsetManager
2. O navegador vai pedir permissão para usar o microfone
3. Clique em **"Permitir"** (seus dados ficam apenas no seu computador!)
4. Pronto! Você já pode começar a usar

### 2️⃣ Gravar Áudio
1. Clique em **"Dashboard"** no menu lateral
2. Clique no botão **"Iniciar Gravação"** (ícone de microfone)
3. Fale normalmente
4. Clique em **"Parar Gravação"**
5. A gravação aparece na lista abaixo

### 3️⃣ Testar Cancelamento de Ruído
1. Vá em **"Diagnósticos"** no menu
2. Clique em **"Teste de Cancelamento de Ruído"**
3. O sistema toca um ruído branco
4. Fale normalmente
5. Veja o resultado na tela

### 4️⃣ Executar Scripts de Diagnóstico
1. Acesse **"Diagnósticos"** no menu lateral
2. Escolha um script (ex: "Verificar Drivers USB")
3. Clique em **"Executar"**
4. Aguarde a conclusão e visualize os resultados

### 5️⃣ Usar Assistente de IA (Opcional)
1. Acesse **"Configurações"** no menu
2. Escolha o provedor (OpenAI/Anthropic/Gemini)
3. Insira sua API Key
4. Clique em **"Salvar"**
5. Use o chat de IA no canto inferior direito

**Mais detalhes**: [Guia de Primeiro Uso](wiki/getting-started/Quick-Start.md)

---

## ❓ Perguntas Frequentes

### É grátis?
✅ Sim! Completamente gratuito e open-source.

### Funciona em qualquer headset?
✅ Sim, em qualquer headset USB que funcione no seu computador.

### Preciso de internet?
❌ Não para as funções básicas. Apenas para integração com IA.

### Meus dados são enviados para algum servidor?
❌ Não! Tudo fica armazenado localmente no seu computador.

### É seguro?
✅ Sim! O código é open-source e pode ser auditado por qualquer pessoa.

**Mais perguntas**: [FAQ Completo](wiki/getting-started/FAQ.md)

---

## 🏗️ Arquitetura Técnica

### Stack Tecnológico

| Camada | Tecnologia | Versão |
|--------|-----------|--------|
| **Frontend** | React | 19.0 |
| **Linguagem** | TypeScript | 5.9 |
| **Estilização** | Tailwind CSS | 4.0 |
| **Componentes** | shadcn/ui | Latest |
| **Backend** | Next.js | 14.0 |
| **API** | tRPC | 11.0 |
| **Banco de Dados** | PostgreSQL | 15+ |
| **ORM** | Drizzle | Latest |
| **Real-time** | Socket.IO | 4.0 |
| **Gráficos** | Chart.js | 4.0 |
| **Testes** | Vitest | Latest |

### Estrutura de Diretórios

```
HeadsetManager/
├── client/                 # Frontend React
│   ├── public/            # Assets estáticos (logo, ícones)
│   └── src/
│       ├── pages/         # Páginas (Home, Diagnostics, Histórico)
│       ├── components/    # Componentes reutilizáveis
│       └── lib/           # Utilitários e tRPC client
├── server/                # Backend Node.js
│   ├── _core/            # Infraestrutura (OAuth, tRPC, LLM)
│   ├── routers/          # Rotas tRPC
│   └── services/         # Serviços (OpenAI, Socket.IO)
├── drizzle/              # Schema e migrações do banco
├── shared/               # Tipos compartilhados
├── scripts/              # Build scripts para instaladores
└── wiki/                 # Documentação completa
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

## 📚 Documentação Completa

- 📖 [**Wiki Oficial**](wiki/Home.md) - Documentação completa
- 🚀 [**Guia de Instalação**](wiki/getting-started/Installation.md) - Passo a passo detalhado
- ❓ [**FAQ**](wiki/getting-started/FAQ.md) - Perguntas frequentes
- 🔧 [**Solução de Problemas**](wiki/troubleshooting/Common-Errors.md) - Erros comuns
- 💻 [**API para Desenvolvedores**](wiki/api/TRPC-API.md) - Documentação técnica
- 🤝 [**Guia de Contribuição**](wiki/contributing/Contributing-Guide.md) - Como contribuir

---

## 🐛 Encontrou um Problema?

Se algo não está funcionando:

1. **Consulte o FAQ**: [Perguntas Frequentes](wiki/getting-started/FAQ.md)
2. **Veja os Guias**: [Solução de Problemas](wiki/troubleshooting/Common-Errors.md)
3. **Reporte um Bug**: [Abrir Issue](https://github.com/B0yZ4kr14/HeadsetManager/issues)
4. **Entre em Contato**: suporte@tsitelecom.com.br

---

## 🤝 Como Contribuir

O HeadsetManager é open-source! Você pode ajudar de várias formas:

- 🐛 **Reportar bugs** - [Abrir Issue](https://github.com/B0yZ4kr14/HeadsetManager/issues)
- 💡 **Sugerir funcionalidades** - [Discussions](https://github.com/B0yZ4kr14/HeadsetManager/discussions)
- 🌍 **Traduzir** - Ajude a traduzir para outros idiomas
- 💻 **Contribuir com código** - Veja o [Guia de Contribuição](wiki/contributing/Contributing-Guide.md)

### Passos para Contribuir

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

---

## 📄 Licença

Este projeto está licenciado sob a **MIT License** - veja o arquivo [LICENSE](LICENSE) para detalhes.

Isso significa que você pode:
- ✅ Usar comercialmente
- ✅ Modificar o código
- ✅ Distribuir
- ✅ Uso privado

---

## 🙏 Agradecimentos

Desenvolvido com ❤️ pela **TSI Telecom** para profissionais que precisam de ferramentas confiáveis de diagnóstico de áudio.

**Agradecimentos especiais**:
- [shadcn/ui](https://ui.shadcn.com/) - Componentes UI
- [Chart.js](https://www.chartjs.org/) - Visualização de dados
- [tRPC](https://trpc.io/) - Type-safe APIs
- [Drizzle ORM](https://orm.drizzle.team/) - Database toolkit
- [Vitest](https://vitest.dev/) - Testing framework
- Comunidade open-source por bibliotecas incríveis
- Usuários que reportam bugs e sugerem melhorias

---

## 📞 Contato

- **Website**: [tsitelecom.com.br](https://tsitelecom.com.br)
- **Email**: suporte@tsitelecom.com.br
- **GitHub**: [B0yZ4kr14/HeadsetManager](https://github.com/B0yZ4kr14/HeadsetManager)
- **Issues**: [Reportar Problema](https://github.com/B0yZ4kr14/HeadsetManager/issues)
- **Discussions**: [Fórum da Comunidade](https://github.com/B0yZ4kr14/HeadsetManager/discussions)

---

## 🌟 Gostou do Projeto?

Se o HeadsetManager te ajudou, considere:
- ⭐ Dar uma estrela no GitHub
- 🐦 Compartilhar nas redes sociais
- 💬 Recomendar para colegas
- 🤝 Contribuir com código ou documentação

---

<div align="center">
  <img src="client/public/tsi-logo-transparent.png" alt="TSI Telecom Logo" width="200"/>
  
  **HeadsetManager v1.0.0**  
  © 2024 TSI Telecom. Todos os direitos reservados.
</div>
