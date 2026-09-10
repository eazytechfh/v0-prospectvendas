import assert from "node:assert/strict"
import test from "node:test"
import { renderPlanoApcPdf } from "./plano-apc-pdf"

test("renderiza o plano como um documento PDF", async () => {
  const pdf = await renderPlanoApcPdf("# Plano\n\nConteúdo de teste.", "Empresa Teste")

  assert.ok(Buffer.isBuffer(pdf))
  assert.equal(pdf.subarray(0, 4).toString(), "%PDF")
  assert.ok(pdf.length > 1_000)
})
