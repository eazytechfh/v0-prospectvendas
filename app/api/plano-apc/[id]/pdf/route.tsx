import { getFormSubmissionById, markPlanoApcDownloaded } from "@/lib/form-submissions"
import { PlanoApcValidationError, validatePlanoApcMarkdown } from "@/lib/plano-apc-edit"
import { renderPlanoApcPdf } from "@/lib/plano-apc-pdf"

export const runtime = "nodejs"

function stripDiacritics(value: string) {
  return Array.from(value.normalize("NFD"))
    .filter((char) => {
      const code = char.codePointAt(0) ?? 0
      return code < 0x0300 || code > 0x036f
    })
    .join("")
}

function attachmentFileName(companyName: string | null, id: string) {
  const company = companyName
    ? stripDiacritics(companyName)
        .replace(/[^a-zA-Z0-9_-]+/g, "-")
        .replace(/^-+|-+$/g, "")
        .slice(0, 80)
    : ""

  return `plano-apc-${company || id}.pdf`
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params
    const submission = await getFormSubmissionById(id)

    if (!submission) {
      return Response.json({ error: "Formulário não encontrado." }, { status: 404 })
    }

    if (!submission.plano_apc_markdown) {
      return Response.json({ error: "O Plano APC ainda não foi gerado para este formulário." }, { status: 404 })
    }

    const pdf = await renderPlanoApcPdf(submission.plano_apc_markdown, submission.company_name)
    await markPlanoApcDownloaded(id)

    return new Response(new Uint8Array(pdf), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${attachmentFileName(submission.company_name, id)}"`,
        "Cache-Control": "private, no-store",
      },
    })
  } catch (error) {
    console.error("Falha ao gerar PDF do Plano APC:", error)
    return Response.json({ error: "Não foi possível gerar o PDF do Plano APC." }, { status: 500 })
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params
    const submission = await getFormSubmissionById(id)

    if (!submission) {
      return Response.json({ error: "Formulário não encontrado." }, { status: 404 })
    }

    if (submission.form_type !== "apc_servicos" && submission.form_type !== "apc_contabilidade") {
      return Response.json({ error: "Este formulário não possui Plano APC." }, { status: 400 })
    }

    const body = (await request.json().catch(() => null)) as { markdown?: unknown } | null
    const markdown = validatePlanoApcMarkdown(body?.markdown)
    const pdf = await renderPlanoApcPdf(markdown, submission.company_name)

    return new Response(new Uint8Array(pdf), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": "inline",
        "Cache-Control": "private, no-store",
      },
    })
  } catch (error) {
    if (error instanceof PlanoApcValidationError) {
      return Response.json({ error: error.message }, { status: 400 })
    }

    console.error("Falha ao gerar prévia do Plano APC:", error)
    return Response.json({ error: "Não foi possível gerar a prévia do Plano APC." }, { status: 500 })
  }
}
