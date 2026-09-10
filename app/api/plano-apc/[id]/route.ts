import { NextResponse } from "next/server"
import { getFormSubmissionById, savePlanoApc } from "@/lib/form-submissions"
import { generateWithOpenAI } from "@/lib/openai"
import { buildPlanoApcPrompt } from "@/lib/plano-apc-prompt"
import { PlanoApcValidationError, validatePlanoApcMarkdown } from "@/lib/plano-apc-edit"

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

    return NextResponse.json({ success: true, generatedAt, markdown })
  } catch (error) {
    console.error("Falha ao gerar Plano APC:", error)
    const message = error instanceof Error ? error.message : "Erro desconhecido."
    return NextResponse.json({ error: `Não foi possível gerar o Plano APC. ${message}` }, { status: 500 })
  }
}

export async function PATCH(
  request: Request,
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
        { error: "O Plano APC só pode ser editado em formulários do APC Serviços ou APC Contabilidade." },
        { status: 400 },
      )
    }

    if (!submission.plano_apc_markdown) {
      return NextResponse.json({ error: "O Plano APC ainda não foi gerado." }, { status: 400 })
    }

    const body = (await request.json().catch(() => null)) as { markdown?: unknown } | null
    const markdown = validatePlanoApcMarkdown(body?.markdown)
    const updatedAt = await savePlanoApc(id, markdown)

    return NextResponse.json({ success: true, markdown, updatedAt })
  } catch (error) {
    if (error instanceof PlanoApcValidationError) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    console.error("Falha ao editar Plano APC:", error)
    return NextResponse.json({ error: "Não foi possível salvar as alterações do Plano APC." }, { status: 500 })
  }
}
