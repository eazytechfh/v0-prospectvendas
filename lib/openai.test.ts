import assert from "node:assert/strict"
import test from "node:test"
import { assertOpenAIResponseComplete, getOpenAIGenerationSettings } from "./openai"

test("rejeita resposta incompleta mesmo quando contém texto parcial", () => {
  assert.throws(
    () => assertOpenAIResponseComplete({ status: "incomplete", text: "texto parcial" }),
    /resposta incompleta/i,
  )
})

test("aceita resposta completa com texto", () => {
  assert.doesNotThrow(() => assertOpenAIResponseComplete({ status: "completed", text: "relatório" }))
})

test("usa configuração de baixa latência por padrão", () => {
  assert.deepEqual(getOpenAIGenerationSettings({}), {
    model: "o3",
    reasoningEffort: "low",
    maxOutputTokens: 16_000,
  })
})
