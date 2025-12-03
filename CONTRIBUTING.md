# Contribuindo para o Headset Manager

Obrigado por considerar contribuir para o Headset Manager! Este documento fornece diretrizes para contribuir com o projeto.

## 📋 Código de Conduta

Este projeto adere ao código de conduta da comunidade open-source. Ao participar, você concorda em manter um ambiente respeitoso e colaborativo.

## 🚀 Como Contribuir

### Reportando Bugs

Antes de criar uma issue de bug:

1. **Verifique se o bug já foi reportado** nas [issues existentes](https://github.com/B0yZ4kr14/HeadsetManager/issues)
2. **Use a versão mais recente** do projeto
3. **Colete informações do sistema:**
   - Versão do Node.js (`node --version`)
   - Sistema operacional e versão
   - Versão do Headset Manager
   - Logs de erro completos

**Template de Bug Report:**

```markdown
**Descrição do Bug**
Uma descrição clara e concisa do problema.

**Passos para Reproduzir**

1. Vá para '...'
2. Clique em '...'
3. Veja o erro

**Comportamento Esperado**
O que deveria acontecer.

**Screenshots**
Se aplicável, adicione screenshots.

**Ambiente:**

- SO: [ex: Windows 11, Ubuntu 22.04]
- Node.js: [ex: 22.13.0]
- Versão: [ex: 1.0.0]

**Logs de Erro**
```

Cole os logs aqui

```

```

### Sugerindo Melhorias

Para sugerir uma nova funcionalidade:

1. **Verifique se já não foi sugerida** nas issues
2. **Descreva o caso de uso** claramente
3. **Explique por que seria útil** para outros usuários

**Template de Feature Request:**

```markdown
**Problema que Resolve**
Descreva o problema que esta feature resolveria.

**Solução Proposta**
Descreva como você imagina a solução.

**Alternativas Consideradas**
Outras abordagens que você considerou.

**Contexto Adicional**
Qualquer outra informação relevante.
```

### Pull Requests

#### Processo

1. **Fork o repositório** e crie sua branch a partir de `main`:

   ```bash
   git checkout -b feature/minha-feature
   ```

2. **Faça suas alterações** seguindo os padrões de código

3. **Adicione testes** para suas mudanças

4. **Execute os testes** e garanta que todos passem:

   ```bash
   pnpm test
   ```

5. **Commit suas mudanças** usando mensagens descritivas:

   ```bash
   git commit -m "feat: adiciona suporte para exportação PDF"
   ```

6. **Push para seu fork**:

   ```bash
   git push origin feature/minha-feature
   ```

7. **Abra um Pull Request** com uma descrição clara

#### Padrões de Código

**TypeScript:**

- Use TypeScript estrito (`strict: true`)
- Defina tipos explícitos para funções públicas
- Evite `any`, use `unknown` quando necessário
- Use interfaces para objetos complexos

**React:**

- Use componentes funcionais com hooks
- Extraia lógica complexa para custom hooks
- Use `useCallback` e `useMemo` para otimização
- Mantenha componentes pequenos e focados

**Estilo:**

- Use 2 espaços para indentação
- Máximo de 100 caracteres por linha
- Use aspas duplas para strings
- Adicione ponto e vírgula ao final de statements

**Commits:**
Siga o padrão [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` Nova funcionalidade
- `fix:` Correção de bug
- `docs:` Mudanças na documentação
- `style:` Formatação (não afeta código)
- `refactor:` Refatoração de código
- `test:` Adição ou correção de testes
- `chore:` Tarefas de manutenção

Exemplos:

```
feat: adiciona gráfico de tendências no histórico
fix: corrige memory leak na gravação de áudio
docs: atualiza README com instruções de instalação
```

#### Checklist do Pull Request

Antes de submeter, verifique:

- [ ] Código segue os padrões do projeto
- [ ] Testes foram adicionados/atualizados
- [ ] Todos os testes passam (`pnpm test`)
- [ ] TypeScript compila sem erros (`pnpm type-check`)
- [ ] Documentação foi atualizada (se necessário)
- [ ] Commit messages seguem o padrão
- [ ] Branch está atualizada com `main`

## 🏗️ Estrutura do Projeto

```
headset_demo_web/
├── client/                 # Frontend React
│   ├── public/            # Arquivos estáticos
│   └── src/
│       ├── components/    # Componentes reutilizáveis
│       ├── pages/         # Páginas da aplicação
│       ├── hooks/         # Custom hooks
│       └── lib/           # Utilitários
├── server/                # Backend Node.js
│   ├── routers/          # Rotas tRPC
│   ├── services/         # Lógica de negócio
│   └── _core/            # Configuração do servidor
├── drizzle/              # Schema do banco de dados
└── shared/               # Código compartilhado
```

## 🧪 Testes

### Executando Testes

```bash
# Todos os testes
pnpm test

# Modo watch
pnpm test:watch

# Cobertura
pnpm test:coverage
```

### Escrevendo Testes

**Testes de Backend (Vitest):**

```typescript
import { describe, it, expect, beforeAll } from "vitest";
import { createCaller } from "./test-utils";

describe("headset.tests", () => {
  let caller: ReturnType<typeof createCaller>;

  beforeAll(() => {
    caller = createCaller();
  });

  it("should create a recording", async () => {
    const result = await caller.headset.tests.create({
      deviceId: "test-device",
      duration: 5000,
      quality: "good",
    });

    expect(result.success).toBe(true);
  });
});
```

## 📚 Recursos

- [Documentação do React](https://react.dev/)
- [Documentação do tRPC](https://trpc.io/)
- [Documentação do Drizzle ORM](https://orm.drizzle.team/)
- [Tailwind CSS](https://tailwindcss.com/)

## ❓ Dúvidas?

Se tiver dúvidas sobre como contribuir:

1. Verifique a [documentação](README.md)
2. Procure em [issues fechadas](https://github.com/B0yZ4kr14/HeadsetManager/issues?q=is%3Aissue+is%3Aclosed)
3. Abra uma [nova issue](https://github.com/B0yZ4kr14/HeadsetManager/issues/new) com sua pergunta

## 🙏 Obrigado!

Suas contribuições tornam o Headset Manager melhor para todos. Obrigado por dedicar seu tempo!

---

**TSI Telecom** - Desenvolvendo soluções profissionais de áudio
