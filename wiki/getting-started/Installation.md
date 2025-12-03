# 📥 Guia de Instalação

Este guia vai te ensinar a instalar o HeadsetManager no seu computador de forma simples e rápida.

---

## 🪟 Instalação no Windows

### Passo 1: Baixar o Instalador
1. Acesse a [página de releases](https://github.com/B0yZ4kr14/HeadsetManager/releases)
2. Clique no arquivo **HeadsetManager-Setup.msi** (mais recente)
3. Aguarde o download terminar

### Passo 2: Executar o Instalador
1. Localize o arquivo baixado (geralmente na pasta **Downloads**)
2. Clique duas vezes no arquivo **HeadsetManager-Setup.msi**
3. Se aparecer um aviso de segurança, clique em **"Executar mesmo assim"**

### Passo 3: Seguir o Assistente
1. Clique em **"Avançar"** na tela de boas-vindas
2. Escolha a pasta de instalação (recomendado: deixar padrão)
3. Clique em **"Instalar"**
4. Aguarde a instalação terminar (leva cerca de 2 minutos)
5. Clique em **"Concluir"**

### Passo 4: Abrir o Programa
1. Procure por **"HeadsetManager"** no menu Iniciar
2. Clique no ícone para abrir
3. Na primeira vez, pode demorar um pouco mais

**Pronto!** O HeadsetManager está instalado e funcionando.

---

## 🐧 Instalação no Linux

### Método 1: Instalador Automático (Recomendado)

#### Passo 1: Baixar o Instalador
```bash
wget https://github.com/B0yZ4kr14/HeadsetManager/releases/latest/download/headset-manager-installer.bin
```

#### Passo 2: Dar Permissão de Execução
```bash
chmod +x headset-manager-installer.bin
```

#### Passo 3: Executar o Instalador
```bash
sudo ./headset-manager-installer.bin
```

O instalador vai:
- Verificar dependências
- Instalar PostgreSQL (se necessário)
- Configurar o banco de dados
- Criar atalho no menu

#### Passo 4: Iniciar o Programa
```bash
headset-manager
```

Ou procure por **"HeadsetManager"** no menu de aplicativos.

---

### Método 2: Instalação Manual (Avançado)

#### Requisitos
- Node.js 18+ ([instalar](https://nodejs.org/))
- PostgreSQL 15+ ([instalar](https://www.postgresql.org/download/))
- pnpm ([instalar](https://pnpm.io/installation))

#### Passo 1: Clonar o Repositório
```bash
git clone https://github.com/B0yZ4kr14/HeadsetManager.git
cd HeadsetManager
```

#### Passo 2: Instalar Dependências
```bash
pnpm install
```

#### Passo 3: Configurar Banco de Dados
1. Crie um banco PostgreSQL:
```bash
sudo -u postgres psql
CREATE DATABASE headset_manager;
CREATE USER headset_user WITH PASSWORD 'sua_senha_aqui';
GRANT ALL PRIVILEGES ON DATABASE headset_manager TO headset_user;
\q
```

2. Configure as variáveis de ambiente:
```bash
cp .env.example .env
nano .env
```

3. Edite as seguintes linhas:
```env
DATABASE_URL="postgresql://headset_user:sua_senha_aqui@localhost:5432/headset_manager"
```

#### Passo 4: Executar Migrações
```bash
pnpm db:push
```

#### Passo 5: Iniciar o Servidor
```bash
pnpm dev
```

O sistema estará disponível em: **http://localhost:3000**

---

## ✅ Verificando a Instalação

Após instalar, siga estes passos para confirmar que tudo está funcionando:

### 1. Abrir o Sistema
- Acesse **http://localhost:3000** no navegador
- Você deve ver a tela inicial do HeadsetManager

### 2. Testar Permissão de Microfone
- Clique em **"Dashboard"** no menu lateral
- O navegador vai pedir permissão para acessar o microfone
- Clique em **"Permitir"**

### 3. Verificar Detecção de Dispositivo
- Na seção **"Dispositivos Conectados"**, você deve ver seu headset listado
- Se não aparecer, veja a seção de [Solução de Problemas](#solução-de-problemas)

---

## 🔧 Solução de Problemas

### Problema: "Erro ao conectar ao banco de dados"
**Solução**:
1. Verifique se o PostgreSQL está rodando:
   - **Windows**: Abra o "Gerenciador de Tarefas" e procure por "postgres"
   - **Linux**: Execute `sudo systemctl status postgresql`
2. Se não estiver rodando, inicie:
   - **Windows**: Abra "Serviços" e inicie "PostgreSQL"
   - **Linux**: Execute `sudo systemctl start postgresql`

### Problema: "Porta 3000 já está em uso"
**Solução**:
1. Feche outros programas que possam estar usando a porta 3000
2. Ou altere a porta no arquivo `.env`:
   ```env
   PORT=3001
   ```

### Problema: "Microfone não detectado"
**Solução**:
1. Verifique se o headset está conectado corretamente
2. Teste o microfone nas configurações do sistema operacional
3. Recarregue a página (F5)
4. Veja o guia completo: [Microfone Não Detectado](../troubleshooting/Microphone-Not-Detected.md)

### Problema: "Navegador não suportado"
**Solução**:
- Use um navegador moderno:
  - Google Chrome 90+
  - Mozilla Firefox 88+
  - Microsoft Edge 90+
- Atualize seu navegador para a versão mais recente

---

## 🔄 Atualizando o HeadsetManager

### Windows
1. Baixe a versão mais recente do instalador
2. Execute o novo instalador
3. Ele vai atualizar automaticamente

### Linux (Instalador Automático)
```bash
headset-manager --update
```

### Linux (Instalação Manual)
```bash
cd HeadsetManager
git pull origin main
pnpm install
pnpm db:push
pnpm dev
```

---

## 🗑️ Desinstalando

### Windows
1. Abra **"Configurações"** > **"Aplicativos"**
2. Procure por **"HeadsetManager"**
3. Clique em **"Desinstalar"**
4. Confirme a desinstalação

### Linux (Instalador Automático)
```bash
sudo headset-manager --uninstall
```

### Linux (Instalação Manual)
```bash
cd HeadsetManager
pnpm db:drop  # Remove o banco de dados
cd ..
rm -rf HeadsetManager
```

---

## 📞 Precisa de Mais Ajuda?

Se você encontrou algum problema não listado aqui:

1. Consulte as [Perguntas Frequentes (FAQ)](FAQ.md)
2. Veja a seção de [Solução de Problemas](../troubleshooting/Common-Errors.md)
3. Abra uma [issue no GitHub](https://github.com/B0yZ4kr14/HeadsetManager/issues)
4. Entre em contato: suporte@tsitelecom.com.br

---

**Próximo Passo**: [Guia de Primeiro Uso](Quick-Start.md)
