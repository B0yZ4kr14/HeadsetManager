# ❓ Perguntas Frequentes (FAQ)

Respostas rápidas para as dúvidas mais comuns sobre o HeadsetManager.

---

## 📋 Índice

- [Sobre o Sistema](#sobre-o-sistema)
- [Instalação e Configuração](#instalação-e-configuração)
- [Uso Básico](#uso-básico)
- [Problemas Técnicos](#problemas-técnicos)
- [Segurança e Privacidade](#segurança-e-privacidade)

---

## Sobre o Sistema

### O que é o HeadsetManager?
O HeadsetManager é um programa que ajuda você a testar e diagnosticar problemas com fones de ouvido USB (headsets). Ele grava áudio, mostra gráficos de som e te avisa se algo não está funcionando direito.

### É grátis?
Sim! O HeadsetManager é completamente gratuito e open-source (código aberto). Você pode usar, modificar e compartilhar livremente.

### Funciona em qualquer headset?
Funciona com a maioria dos headsets USB. Se o seu headset funciona normalmente no computador (você consegue ouvir e falar), ele vai funcionar no HeadsetManager.

### Preciso de internet para usar?
Não para as funções básicas (gravar áudio, ver gráficos). Mas algumas funcionalidades avançadas, como a integração com IA, precisam de internet.

---

## Instalação e Configuração

### Quais são os requisitos mínimos?
- **Windows 10 ou superior** OU **Linux (Ubuntu 20.04+)**
- **4 GB de RAM**
- **500 MB de espaço livre**
- **Navegador moderno** (Chrome, Firefox ou Edge)

### Onde baixo o programa?
Na [página de releases do GitHub](https://github.com/B0yZ4kr14/HeadsetManager/releases). Procure pelo arquivo **.msi** (Windows) ou **.bin** (Linux).

### O instalador é seguro?
Sim! O código é open-source e pode ser auditado por qualquer pessoa. Alguns antivírus podem dar um alerta falso porque o programa acessa o microfone, mas isso é normal.

### Preciso instalar alguma coisa antes?
**Windows**: Não, o instalador já vem com tudo.  
**Linux**: O instalador automático instala as dependências. Se for instalação manual, você precisa de Node.js e PostgreSQL.

### Como desinstalo?
**Windows**: Vá em Configurações > Aplicativos > HeadsetManager > Desinstalar  
**Linux**: Execute `sudo headset-manager --uninstall` no terminal

---

## Uso Básico

### Como faço para gravar áudio?
1. Abra o HeadsetManager
2. Clique em **"Dashboard"** no menu lateral
3. Clique no botão **"Iniciar Gravação"** (ícone de microfone)
4. Fale normalmente
5. Clique em **"Parar Gravação"**
6. A gravação aparece na lista abaixo

### O que são os "medidores circulares"?
São indicadores visuais que mostram:
- **Nível**: Quão alto está o som (0-100)
- **Qualidade**: Quão boa está a gravação (0-100)

Quanto mais próximo de 100, melhor!

### O que é o "analisador de espectro"?
É um gráfico colorido que mostra as frequências do som em tempo real. Pense nele como um "raio-X" do áudio. Útil para identificar ruídos ou problemas.

### Como testo o cancelamento de ruído?
1. Vá em **"Diagnósticos"** no menu
2. Clique em **"Teste de Cancelamento de Ruído"**
3. O sistema vai tocar um ruído branco (tipo "chiado")
4. Fale normalmente
5. O sistema mostra se o cancelamento está funcionando

### Onde ficam salvas as gravações?
As gravações ficam no banco de dados local do seu computador. Você pode baixá-las clicando no botão **"Download"** ao lado de cada gravação.

### Posso deletar gravações antigas?
Sim! Clique no ícone de **lixeira** ao lado da gravação que você quer apagar.

---

## Problemas Técnicos

### O navegador pede permissão para usar o microfone. É seguro permitir?
Sim! O HeadsetManager precisa dessa permissão para gravar áudio. Seus dados ficam apenas no seu computador, não são enviados para nenhum servidor externo.

### Meu headset não aparece na lista de dispositivos
**Soluções**:
1. Desconecte e reconecte o headset USB
2. Recarregue a página (F5)
3. Verifique se o headset funciona em outros programas
4. Veja o guia: [Microfone Não Detectado](../troubleshooting/Microphone-Not-Detected.md)

### A gravação não tem som
**Soluções**:
1. Verifique se o microfone não está mudo (botão físico no headset)
2. Aumente o volume do microfone nas configurações do Windows/Linux
3. Teste o microfone em outro programa (ex: gravador de voz)
4. Veja o guia: [Sem Áudio na Gravação](../troubleshooting/No-Audio-Recording.md)

### O programa está lento
**Soluções**:
1. Feche outras abas do navegador
2. Feche programas pesados rodando em segundo plano
3. Verifique se tem espaço livre no disco (mínimo 1 GB)
4. Reinicie o computador

### Aparece "Erro ao conectar ao banco de dados"
**Solução**:
1. Verifique se o serviço PostgreSQL está rodando
2. Reinicie o HeadsetManager
3. Se persistir, reinstale o programa

### O gráfico de espectro não aparece
**Soluções**:
1. Verifique se o navegador é compatível (Chrome 90+, Firefox 88+)
2. Atualize o navegador para a versão mais recente
3. Limpe o cache do navegador (Ctrl+Shift+Del)

---

## Segurança e Privacidade

### Meus dados são enviados para algum servidor?
**Não!** Todas as gravações e dados ficam armazenados localmente no seu computador. Nada é enviado para servidores externos, exceto se você usar as funcionalidades de IA (e mesmo assim, apenas o texto da consulta é enviado, não o áudio).

### O HeadsetManager coleta informações pessoais?
Não. O sistema não coleta nome, email, endereço IP ou qualquer dado pessoal. Ele apenas armazena as gravações de áudio que você faz voluntariamente.

### Posso usar em ambiente corporativo?
Sim! O HeadsetManager é ideal para equipes de suporte técnico. Você pode até mesmo hospedar em um servidor interno da empresa para uso compartilhado.

### O código é auditável?
Sim! O código-fonte completo está disponível no [GitHub](https://github.com/B0yZ4kr14/HeadsetManager). Qualquer pessoa pode revisar, auditar e contribuir.

### Há alguma telemetria ou rastreamento?
Não. O HeadsetManager não envia dados de uso, métricas ou telemetria para nenhum servidor.

---

## Funcionalidades Avançadas

### O que é a integração com IA?
O HeadsetManager pode se conectar com serviços de IA (OpenAI, Anthropic, Google Gemini) para:
- Transcrever áudio automaticamente
- Analisar qualidade de gravações
- Sugerir soluções para problemas

**Nota**: Essa funcionalidade é opcional e requer chaves de API (pagas).

### Como configuro a integração com IA?
1. Vá em **"Configurações"** no menu
2. Clique em **"Integrações"**
3. Cole sua chave de API do serviço escolhido
4. Salve as configurações

### O que são os "scripts de troubleshooting"?
São 10 comandos automatizados que diagnosticam problemas comuns, como:
- Verificar drivers de áudio
- Testar latência
- Resetar configurações de som

Você encontra eles em **"Diagnósticos" > "Scripts Automáticos"**.

### Posso criar meus próprios scripts?
Sim! Se você tem conhecimento técnico, pode adicionar scripts personalizados editando o arquivo `scripts/custom/` no diretório de instalação.

---

## Contribuindo e Suporte

### Como reporto um bug?
1. Acesse [GitHub Issues](https://github.com/B0yZ4kr14/HeadsetManager/issues)
2. Clique em **"New Issue"**
3. Descreva o problema detalhadamente
4. Inclua prints de tela se possível

### Como sugiro uma nova funcionalidade?
Use o [GitHub Discussions](https://github.com/B0yZ4kr14/HeadsetManager/discussions) para sugerir ideias. A comunidade vai discutir e votar nas melhores sugestões.

### Posso contribuir com código?
Sim! Veja nosso [Guia de Contribuição](../contributing/Contributing-Guide.md) para saber como começar.

### Onde consigo suporte técnico?
- **Email**: suporte@tsitelecom.com.br
- **GitHub Issues**: Para bugs e problemas técnicos
- **GitHub Discussions**: Para dúvidas gerais

---

## Outras Dúvidas

### Posso usar o HeadsetManager comercialmente?
Sim! A licença MIT permite uso comercial sem restrições.

### Há uma versão mobile (Android/iOS)?
Ainda não, mas está nos planos futuros. Por enquanto, a interface é responsiva e funciona em tablets.

### O HeadsetManager funciona com Bluetooth?
Atualmente, apenas headsets USB são suportados. Suporte a Bluetooth pode ser adicionado em versões futuras.

### Posso traduzir o sistema para outro idioma?
Sim! Contribuições de tradução são bem-vindas. Veja o [Guia de Internacionalização](../contributing/Internationalization.md).

---

**Não encontrou sua dúvida aqui?**  
Entre em contato conosco ou abra uma [discussão no GitHub](https://github.com/B0yZ4kr14/HeadsetManager/discussions).
