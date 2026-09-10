# Validação do Plano da IA Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Salvar somente planos com pelo menos 35.000 caracteres e estrutura APC completa, corrigindo automaticamente saídas insuficientes.

**Architecture:** Um validador puro inspecionará tamanho, seções, seis gargalos, seis oportunidades, seis ações e campos obrigatórios. A rota fará uma geração inicial e até duas rodadas de correção; respostas incompletas da API serão rejeitadas e o plano anterior só será substituído após aprovação.

**Tech Stack:** Next.js 15, TypeScript, OpenAI Responses API, Node test runner.

## Global Constraints

- Mínimo de 35.000 caracteres após `trim()`.
- Máximo de três chamadas por ação do usuário.
- Nunca sobrescrever o plano salvo com uma saída reprovada.
- Edição manual continua permitida abaixo de 35.000 caracteres.

---

### Task 1: Validador determinístico

**Files:**
- Create: `lib/plano-apc-generation-validation.ts`
- Create: `lib/plano-apc-generation-validation.test.ts`

- [x] Escrever testes para tamanho insuficiente, estrutura incompleta e documento aprovado.
- [x] Confirmar falha por módulo inexistente.
- [x] Implementar métricas e lista objetiva de violações.
- [x] Confirmar aprovação dos testes.

### Task 2: Correção automática e resposta incompleta

**Files:**
- Modify: `lib/openai.ts`
- Modify: `lib/plano-apc-prompt.ts`
- Modify: `app/api/plano-apc/[id]/route.ts`

- [x] Rejeitar `status: incomplete` mesmo quando houver texto parcial.
- [x] Criar prompt de correção com violações e rascunho anterior.
- [x] Fazer até duas correções e salvar somente a primeira saída válida.
- [x] Retornar erro 422 preservando o plano anterior quando todas falharem.

### Task 3: Feedback visual e verificação

**Files:**
- Modify: `app/interno/interno-workspace.tsx`

- [x] Colorir contador abaixo/acima de 35.000 e explicar que o mínimo vale para geração automática.
- [x] Executar testes, TypeScript, build e `git diff --check`.
