# 🎧 HeadsetManager Wiki

Bem-vindo à documentação oficial do **HeadsetManager** — o sistema completo de diagnóstico e gerenciamento de headsets USB desenvolvido pela TSI Telecom.

---

## 📚 Navegação Rápida

### Para Iniciantes
- [**Instalação Rápida**](getting-started/Installation.md) - Como instalar em Windows e Linux
- [**Primeiro Uso**](getting-started/Quick-Start.md) - Guia passo a passo para começar
- [**Perguntas Frequentes (FAQ)**](getting-started/FAQ.md) - Respostas para dúvidas comuns

### Funcionalidades
- [**Gravação de Áudio**](features/Audio-Recording.md) - Como gravar e analisar áudio
- [**Análise de Espectro**](features/Spectrum-Analyzer.md) - Visualizar frequências em tempo real
- [**Teste de Cancelamento de Ruído**](features/Noise-Cancellation-Test.md) - Avaliar qualidade do microfone
- [**Medidores de Performance**](features/Performance-Meters.md) - Entender métricas de qualidade
- [**Modo Fullscreen**](features/Fullscreen-Mode.md) - Expandir visualizações

### Solução de Problemas
- [**Microfone Não Detectado**](troubleshooting/Microphone-Not-Detected.md)
- [**Sem Áudio na Gravação**](troubleshooting/No-Audio-Recording.md)
- [**Problemas de Conexão**](troubleshooting/Connection-Issues.md)
- [**Erros Comuns**](troubleshooting/Common-Errors.md)

### Para Desenvolvedores
- [**Arquitetura do Sistema**](api/Architecture.md)
- [**API tRPC**](api/TRPC-API.md)
- [**Banco de Dados**](api/Database-Schema.md)
- [**WebSockets**](api/WebSockets.md)
- [**Contribuindo**](contributing/Contributing-Guide.md)

---

## 🚀 O que é o HeadsetManager?

O HeadsetManager é uma aplicação web profissional que permite diagnosticar, testar e gerenciar headsets USB de forma eficiente. Desenvolvido para profissionais de suporte técnico e usuários finais, o sistema oferece:

- **Gravação de áudio** com análise de espectro em tempo real
- **Teste de cancelamento de ruído** com geração de ruído branco
- **Medidores circulares** de nível de áudio e qualidade
- **Histórico de gravações** com estatísticas detalhadas
- **10 scripts de troubleshooting** pré-configurados
- **Integração com IA** (OpenAI, Anthropic, Google Gemini)
- **Interface neon dark moderna** com tema TSI

---

## 🎯 Casos de Uso

### Para Usuários Finais
- Testar qualidade do microfone antes de reuniões importantes
- Diagnosticar problemas de áudio sem conhecimento técnico
- Verificar se o cancelamento de ruído está funcionando
- Baixar gravações de teste para compartilhar com suporte

### Para Equipes de Suporte
- Diagnosticar remotamente problemas de headsets
- Executar scripts de troubleshooting automatizados
- Monitorar qualidade de áudio em tempo real
- Gerar relatórios de performance

### Para Desenvolvedores
- Integrar com sistemas existentes via API tRPC
- Personalizar scripts de diagnóstico
- Estender funcionalidades com plugins
- Contribuir com melhorias open-source

---

## 📦 Requisitos do Sistema

### Mínimos
- **Sistema Operacional**: Windows 10+ ou Linux (Ubuntu 20.04+)
- **Navegador**: Chrome 90+, Firefox 88+, Edge 90+
- **RAM**: 4 GB
- **Disco**: 500 MB livres
- **Microfone**: Qualquer dispositivo USB compatível

### Recomendados
- **RAM**: 8 GB ou mais
- **Processador**: Intel i5 ou equivalente
- **Conexão**: Internet para integração com IA

---

## 🛠️ Stack Tecnológico

O HeadsetManager utiliza tecnologias modernas e confiáveis:

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

---

## 📞 Suporte e Comunidade

### Precisa de Ajuda?
- **Issues**: [GitHub Issues](https://github.com/B0yZ4kr14/HeadsetManager/issues)
- **Discussões**: [GitHub Discussions](https://github.com/B0yZ4kr14/HeadsetManager/discussions)
- **Email**: suporte@tsitelecom.com.br

### Contribuindo
O HeadsetManager é um projeto open-source! Veja nosso [Guia de Contribuição](contributing/Contributing-Guide.md) para saber como ajudar.

---

## 📄 Licença

Este projeto está licenciado sob a **MIT License**. Veja o arquivo [LICENSE](https://github.com/B0yZ4kr14/HeadsetManager/blob/main/LICENSE) para mais detalhes.

---

## 🙏 Agradecimentos

Desenvolvido com ❤️ pela **TSI Telecom** para profissionais que precisam de ferramentas confiáveis de diagnóstico de áudio.

**Versão da Wiki**: 1.0.0  
**Última Atualização**: Dezembro 2024
