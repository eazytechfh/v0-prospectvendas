import { getFormSubmissionById } from "@/lib/form-submissions"
import { renderSubmissionPdf, submissionAttachmentFileName } from "@/lib/submission-pdf"

export const runtime = "nodejs"

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params
    const submission = await getFormSubmissionById(id)
    if (!submission) return Response.json({ error: "Formulário não encontrado." }, { status: 404 })

    const pdf = await renderSubmissionPdf(submission)
    return new Response(new Uint8Array(pdf), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${submissionAttachmentFileName(submission)}"`,
        "Cache-Control": "private, no-store",
      },
    })
  } catch (error) {
    console.error("Falha ao gerar PDF do formulário:", error)
    return Response.json({ error: "Não foi possível gerar o PDF." }, { status: 500 })
  }
}
