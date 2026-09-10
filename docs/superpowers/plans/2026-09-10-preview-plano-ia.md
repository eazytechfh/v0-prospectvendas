# Preview do Plano da IA Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Corrigir o contraste do editor e exibir ao lado uma prévia real do PDF verde enquanto o texto é editado.

**Architecture:** A composição React PDF será extraída para uma função compartilhada entre download e preview. Um novo `POST` no endpoint de PDF validará o rascunho, renderizará sem persistir e responderá inline; o cliente fará requisições com debounce e exibirá o Blob em um iframe.

**Tech Stack:** Next.js 15, React 19, TypeScript, React PDF, Node test runner.

## Global Constraints

- Preview não salva conteúdo e não registra download.
- Download existente continua usando a versão persistida.
- Botões devem ter contraste legível nos estados normal e desabilitado.
- URLs de Blob devem ser revogadas para evitar vazamento de memória.

---

### Task 1: Renderizador compartilhado

**Files:**
- Create: `lib/plano-apc-pdf.tsx`
- Create: `lib/plano-apc-pdf.test.ts`
- Modify: `app/api/plano-apc/[id]/pdf/route.tsx`

**Interfaces:**
- Produces: `renderPlanoApcPdf(markdown: string, companyName: string | null): Promise<Buffer>`.
- Produces: `POST /api/plano-apc/[id]/pdf` com `{ markdown }`, PDF inline e sem gravação no banco.

- [x] Escrever teste que renderiza `# Plano\n\nConteúdo` e exige um Buffer iniciado por `%PDF`.
- [x] Executar `pnpm test` e confirmar falha por módulo inexistente.
- [x] Extrair o documento React PDF, reutilizá-lo no GET e implementar POST com `validatePlanoApcMarkdown`.
- [x] Executar `pnpm test` e confirmar aprovação.

### Task 2: Editor lado a lado

**Files:**
- Modify: `app/interno/interno-workspace.tsx`

**Interfaces:**
- Consumes: `POST /api/plano-apc/[id]/pdf`.
- Produces: layout responsivo com editor e iframe, debounce de 700 ms, carregamento e erro de preview.

- [x] Tornar o diálogo largo, com textarea à esquerda e preview à direita em telas grandes.
- [x] Criar/revogar Blob URLs a cada resposta e ignorar respostas canceladas via `AbortController`.
- [x] Aplicar cores explícitas aos botões Cancelar e Salvar alterações.
- [x] Executar `pnpm exec tsc --noEmit`.

### Task 3: Verificação final

**Files:**
- Verify only.

**Interfaces:**
- Consumes: fluxo completo das tarefas anteriores.

- [x] Executar `pnpm test`, `pnpm exec tsc --noEmit`, `pnpm build` e `git diff --check`.
- [x] Confirmar no diff que POST de preview não chama `savePlanoApc` nem `markPlanoApcDownloaded`.
