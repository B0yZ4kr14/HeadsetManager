# 🎧 Headset Manager - TSI Telecom

**Gerenciador Profissional de Headsets USB para Linux e Windows**

Aplicação completa para diagnóstico, teste e gerenciamento de headsets USB, desenvolvida para técnicos e usuários finais da TSI Telecom.

---

## ✨ Funcionalidades

### 🎤 Gravação e Análise de Áudio
- Gravação de áudio com visualização de espectro em tempo real
- Análise de qualidade de áudio (nível de ruído, frequência de pico)
- Teste de ruído (pink noise) para validação de drivers
- Salvamento de metadados no banco de dados para histórico

### 🔧 Diagnóstico e Troubleshooting
- **10 scripts pré-configurados** para resolução de problemas comuns:
  - Verificação de drivers USB
  - Análise de logs do kernel
  - Testes de PulseAudio/ALSA
  - Diagnóstico de permissões
- Execução com um clique e histórico de resultados
- Categorização por tipo (driver, áudio, sistema, rede)

### 🤖 Assistente de IA (Opcional)
- Análise inteligente de logs com OpenAI, Anthropic ou Google Gemini
- Sugestões automáticas de correção
- Diagnóstico com nível de severidade e confiança

### 📊 Monitoramento em Tempo Real
- WebSockets para logs do sistema ao vivo
- Painel de terminal integrado
- Notificações de execução de scripts

### 📝 Histórico e Relatórios
- Registro completo de todas as gravações
- Métricas de qualidade ao longo do tempo
- Consulta para manutenção preventiva

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
- Node.js 22.x
- PostgreSQL 14+
- pnpm 9.x

```bash
# Clone o repositório
git clone https://github.com/B0yZ4kr14/HeadsetManager.git
cd HeadsetManager

# Instale dependências
pnpm install

# Configure o banco de dados
cp .env.example .env
# Edite .env com suas credenciais do PostgreSQL

# Execute migrações
pnpm db:push

# Popule scripts de troubleshooting
pnpm seed

# Inicie o servidor de desenvolvimento
pnpm dev
```

---

## 📖 Uso

### 1. Dashboard Principal

Acesse `http://localhost:3000` (ou o endereço do servidor instalado).

- **Análise de Espectro:** Visualize frequências em tempo real
- **Gravação:** Clique em "Iniciar Gravação" para capturar áudio
- **Teste de Ruído:** Execute pink noise para validar drivers
- **Dispositivo Ativo:** Selecione o headset a ser testado

### 2. Diagnósticos Manuais

Navegue para **Diagnósticos** no menu lateral.

- Escolha uma categoria (Driver, Áudio, Sistema, Rede)
- Clique em "Executar" no script desejado
- Veja o resultado em tempo real no painel de histórico

### 3. Configuração de IA (Opcional)

1. Acesse **Configurações**
2. Selecione o provedor de IA (OpenAI, Anthropic ou Gemini)
3. Insira sua API Key
4. Salve as alterações
5. O assistente de IA estará disponível em **Terminal & Logs**

### 4. Histórico de Gravações

Navegue para **Histórico** para visualizar:
- Todas as gravações anteriores
- Métricas de qualidade (duração, nível de ruído, frequência de pico)
- Filtros por data e qualidade

---

## 🛠️ Tecnologias

### Frontend
- **React 19** - Interface moderna e reativa
- **Tailwind CSS 4** - Design system com tema dark TSI
- **shadcn/ui** - Componentes acessíveis
- **Wouter** - Roteamento client-side
- **Socket.IO Client** - WebSockets para tempo real

### Backend
- **Node.js 22** + **Express** - Servidor HTTP
- **tRPC** - Type-safe API
- **PostgreSQL** - Banco de dados relacional
- **Drizzle ORM** - ORM TypeScript-first
- **Socket.IO** - WebSockets
- **OpenAI SDK** - Integração com IA

### DevOps
- **Vite** - Build tool ultra-rápido
- **TypeScript** - Type safety
- **Vitest** - Testes unitários
- **Prettier** - Formatação de código

---

## 🧪 Testes

```bash
# Executar todos os testes
pnpm test

# Executar testes em modo watch
pnpm test:watch

# Cobertura de testes
pnpm test:coverage
```

**Cobertura atual:** 8 testes passando (troubleshooting, IA, autenticação)

---

## 📦 Build para Produção

### Web Application

```bash
# Build do frontend e backend
pnpm build

# Iniciar em produção
pnpm start
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

Os instaladores serão gerados em `dist/installers/`.

---

## 🤝 Contribuindo

Contribuições são bem-vindas! Por favor, leia [CONTRIBUTING.md](CONTRIBUTING.md) para detalhes sobre nosso código de conduta e processo de pull requests.

### Desenvolvimento

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

---

## 📄 Licença

Este projeto está licenciado sob a licença MIT - veja o arquivo [LICENSE](LICENSE) para detalhes.

---

## 👥 Autores

- **TSI Telecom** - *Desenvolvimento inicial* - [B0yZ4kr14](https://github.com/B0yZ4kr14)

---

## 🙏 Agradecimentos

- Equipe de suporte da TSI Telecom
- Comunidade open-source do React e Node.js
- Contribuidores do projeto

---

## 📞 Suporte

Para suporte, abra uma [issue](https://github.com/B0yZ4kr14/HeadsetManager/issues) ou entre em contato com a equipe TSI Telecom.

---

## 🗺️ Roadmap

- [ ] Exportação de relatórios em PDF
- [ ] Gráficos de tendências de qualidade
- [ ] Alertas automáticos de degradação
- [ ] Suporte para múltiplos idiomas
- [ ] Modo offline com sincronização
- [ ] Integração com sistemas de ticketing

---

**Desenvolvido com ❤️ pela TSI Telecom**
