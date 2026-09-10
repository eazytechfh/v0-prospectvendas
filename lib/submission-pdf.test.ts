import assert from "node:assert/strict"
import test from "node:test"
import type { FormSubmission } from "./form-submissions"
import { renderSubmissionPdf } from "./submission-pdf"

test("renderiza o briefing como PDF", async () => {
  const submission = {
    id: "00000000-0000-0000-0000-000000000001",
    form_type: "apc_servicos",
    company_name: "Empresa Teste",
    answers: [{ question: "Pergunta", answer: "Resposta" }],
    created_at: "2026-09-10T12:00:00.000Z",
  } as FormSubmission

  const pdf = await renderSubmissionPdf(submission)
  assert.equal(pdf.subarray(0, 4).toString(), "%PDF")
})
