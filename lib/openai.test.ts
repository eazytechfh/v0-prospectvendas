import assert from "node:assert/strict"
import test from "node:test"
import { assertOpenAIResponseComplete } from "./openai"

test("rejeita resposta incompleta mesmo quando contém texto parcial", () => {
  assert.throws(
    () => assertOpenAIResponseComplete({ status: "incomplete", text: "texto parcial" }),
    /resposta incompleta/i,
  )
})

test("aceita resposta completa com texto", () => {
  assert.doesNotThrow(() => assertOpenAIResponseComplete({ status: "completed", text: "relatório" }))
})
