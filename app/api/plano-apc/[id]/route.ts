import { NextResponse } from "next/server"
import { getFormSubmissionById, savePlanoApc } from "@/lib/form-submissions"
import { generateWithOpenAI } from "@/lib/openai"
import { buildPlanoApcPrompt } from "@/lib/plano-apc-prompt"

export const runtime = "nodejs"
export const maxDuration = 300

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params
    const submission = await getFormSubmissionById(id)

    if (!submission) {
      return NextResponse.json({ error: "Formulário não encontrado." }, { status: 404 })
    }

    if (submission.form_type !== "apc_servicos" && submission.form_type !== "apc_contabilidade") {
      return NextResponse.json(
        { error: "O Plano APC só pode ser gerado a partir de um formulário do APC Serviços ou do APC Contabilidade." },
        { status: 400 },
      )
    }

    const { system, user } = buildPlanoApcPrompt(submission)
    const markdown = await generateWithOpenAI({ system, user })

    const generatedAt = await savePlanoApc(id, markdown)

    return NextResponse.json({ success: true, generatedAt })
  } catch (error) {
    console.error("Falha ao gerar Plano APC:", error)
    const message = error instanceof Error ? error.message : "Erro desconhecido."
    return NextResponse.json({ error: `Não foi possível gerar o Plano APC. ${message}` }, { status: 500 })
  }
}
