# Edição do Plano da IA Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Permitir que o usuário edite o Markdown gerado pela IA, salve a revisão e baixe o PDF verde com o conteúdo atualizado, sem alterar o PDF laranja do formulário.

**Architecture:** O `PATCH /api/plano-apc/[id]` validará e persistirá o Markdown revisado no campo existente `plano_apc_markdown`. O modal interno manterá um rascunho local, salvará pela API e atualizará o estado da submissão antes de oferecer o download pelo endpoint de PDF já existente.

**Tech Stack:** Next.js 15, React 19, TypeScript, Supabase REST, React PDF, Node test runner via `tsx`.

## Global Constraints

- O botão laranja e `/api/pdf/[id]` não serão modificados.
- O PDF verde continuará sendo renderizado a partir de `plano_apc_markdown`.
- Conteúdo vazio ou acima de 100.000 caracteres será rejeitado.
- Nenhuma nova dependência de produção será adicionada.

---

### Task 1: Validação e persistência da revisão

**Files:**
- Create: `lib/plano-apc-edit.ts`
- Create: `lib/plano-apc-edit.test.ts`
- Modify: `app/api/plano-apc/[id]/route.ts`
- Modify: `package.json`

**Interfaces:**
- Produces: `validatePlanoApcMarkdown(value: unknown): string`, que retorna Markdown normalizado ou lança `PlanoApcValidationError`.
- Produces: `PATCH /api/plano-apc/[id]` com corpo `{ markdown: string }` e resposta `{ success: true, markdown, updatedAt }`.

- [x] **Step 1: Write the failing test**

```ts
import assert from "node:assert/strict"
import test from "node:test"
import { validatePlanoApcMarkdown } from "./plano-apc-edit"

test("normaliza um plano válido", () => {
  assert.equal(validatePlanoApcMarkdown("  # Plano\r\n\r\nAção  "), "# Plano\n\nAção")
})

test("rejeita plano vazio", () => {
  assert.throws(() => validatePlanoApcMarkdown("   "), /não pode ficar vazio/i)
})

test("rejeita valor que não seja texto", () => {
  assert.throws(() => validatePlanoApcMarkdown(null), /formato inválido/i)
})
```

- [x] **Step 2: Run test to verify it fails**

Run: `pnpm exec tsx --test lib/plano-apc-edit.test.ts`
Expected: FAIL porque `lib/plano-apc-edit.ts` ainda não existe.

- [x] **Step 3: Write minimal implementation**

Criar a validação, adicionar o script `test` e implementar `PATCH` carregando a submissão, limitando o recurso aos tipos APC, salvando por `savePlanoApc` e retornando erros 400/404/500 apropriados.

- [x] **Step 4: Run test to verify it passes**

Run: `pnpm test`
Expected: 3 testes aprovados.

### Task 2: Editor do Plano da IA

**Files:**
- Modify: `app/interno/interno-workspace.tsx`

**Interfaces:**
- Consumes: `PATCH /api/plano-apc/[id]`.
- Produces: botão `Editar Plano`, diálogo de edição e ações `Salvar alterações` e `Salvar e baixar PDF`.

- [x] **Step 1: Add the editor flow**

Adicionar estados de abertura, rascunho, salvamento, download posterior e erro. O editor deve carregar somente `submission.plano_apc_markdown`, preservar o rascunho enquanto aberto, impedir salvamento vazio e atualizar o item nas listas e no modal após sucesso.

- [x] **Step 2: Keep the PDF flows isolated**

Manter o link laranja inalterado e fazer o download verde chamar `/api/plano-apc/[id]/pdf` somente após um salvamento bem-sucedido quando a ação escolhida for `Salvar e baixar PDF`.

- [x] **Step 3: Verify static correctness**

Run: `pnpm exec tsc --noEmit`
Expected: nenhum erro TypeScript.

### Task 3: Verificação final

**Files:**
- Verify only.

**Interfaces:**
- Consumes: todos os artefatos das tarefas anteriores.

- [x] **Step 1: Run automated checks**

Run: `pnpm test && pnpm exec tsc --noEmit && pnpm build`
Expected: testes, verificação de tipos e build aprovados.

- [x] **Step 2: Review the diff**

Run: `git diff --check` e `git diff -- app/api/plano-apc/[id]/route.ts app/interno/interno-workspace.tsx lib/plano-apc-edit.ts lib/plano-apc-edit.test.ts package.json`
Expected: nenhuma falha de whitespace e somente o fluxo do plano verde alterado.
