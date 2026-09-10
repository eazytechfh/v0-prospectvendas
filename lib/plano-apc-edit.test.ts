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

test("rejeita planos maiores que o limite", () => {
  assert.throws(() => validatePlanoApcMarkdown("a".repeat(100_001)), /100.000 caracteres/i)
})
