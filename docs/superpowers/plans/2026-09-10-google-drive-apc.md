# Google Drive para APC Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Criar/reutilizar uma pasta por empresa e salvar nela os PDFs de briefing e Plano da IA para APC Serviços e Contabilidade.

**Architecture:** Um cliente server-only troca o refresh token por access tokens e chama exclusivamente endpoints fixos do Google Drive. Cada pasta recebe uma chave normalizada em `appProperties`; IDs, links e erros de sincronização são persistidos na submissão. O recebimento do briefing tenta o upload automaticamente sem perder a submissão em falhas externas, e a área interna permite novas tentativas manuais.

**Tech Stack:** Next.js 15, Google Drive REST API v3, Supabase REST, React PDF, TypeScript.

## Global Constraints

- Limitar a integração a `apc_servicos` e `apc_contabilidade`.
- Nunca enviar credenciais ao navegador ou registrá-las em logs.
- Restringir chamadas externas aos hosts OAuth e Drive fixos do Google.
- Reutilizar arquivos pela combinação `submissionId` + tipo para evitar duplicatas.
- Uma falha do Drive não pode apagar nem invalidar um briefing recebido.

---

### Task 1: Cliente Drive e persistência

**Files:**
- Create: `lib/google-drive.ts`
- Create: `lib/google-drive.test.ts`
- Create: `supabase/migrations/20260910170000_add_google_drive_to_form_submissions.sql`
- Modify: `lib/form-submissions.ts`

**Interfaces:**
- Produces: normalização de chave, criação/reutilização de pasta, upsert de PDF e gravação de IDs/links/erro.

- [x] Escrever testes para normalização, escape de busca e nomes determinísticos.
- [x] Confirmar falha por módulo inexistente.
- [x] Implementar cliente com configuração validada e endpoints Google fixos.
- [x] Executar os testes até aprovação.

### Task 2: Geração e upload dos documentos

**Files:**
- Create: `lib/submission-pdf.tsx`
- Modify: `app/api/pdf/[id]/route.tsx`
- Create: `app/api/google-drive/[id]/route.ts`
- Modify: `app/api/form-submissions/servicos/route.ts`
- Modify: `app/api/form-submissions/contabilidade/route.ts`

**Interfaces:**
- Produces: `POST /api/google-drive/[id]` com `{ documentType: "briefing" | "plano" }`.

- [x] Extrair o PDF laranja para uso compartilhado.
- [x] Implementar upload manual dos dois tipos de PDF.
- [x] Após uma nova submissão, tentar salvar automaticamente o briefing.
- [x] Confirmar que falhas externas são registradas sem falhar o formulário.

### Task 3: Interface e verificação

**Files:**
- Modify: `app/interno/interno-workspace.tsx`

**Interfaces:**
- Consumes: endpoint de upload.
- Produces: botões de Drive, estado de carregamento, confirmação e link para o arquivo.

- [x] Adicionar ações de Drive apenas aos formulários APC.
- [x] Executar testes, TypeScript, build e `git diff --check`.
