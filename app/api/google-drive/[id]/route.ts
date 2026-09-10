import { NextResponse } from "next/server"
import { syncSubmissionDocumentToDrive } from "@/lib/drive-documents"
import { isGoogleDriveConfigured, type DriveDocumentType } from "@/lib/google-drive"
import { saveDriveSyncError } from "@/lib/form-submissions"

export const runtime = "nodejs"
export const maxDuration = 60

function isSameOrigin(request: Request) {
  const origin = request.headers.get("origin")
  if (!origin) return false
  try {
    return new URL(origin).host === new URL(request.url).host
  } catch {
    return false
  }
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  try {
    if (!isSameOrigin(request)) {
      return NextResponse.json({ error: "Origem da solicitação inválida." }, { status: 403 })
    }
    if (!isGoogleDriveConfigured()) {
      return NextResponse.json({ error: "Google Drive ainda não foi configurado na Vercel." }, { status: 503 })
    }

    const body = (await request.json().catch(() => null)) as { documentType?: unknown } | null
    if (body?.documentType !== "briefing" && body?.documentType !== "plano") {
      return NextResponse.json({ error: "Tipo de documento inválido." }, { status: 400 })
    }

    const documentType = body.documentType as DriveDocumentType
    const result = await syncSubmissionDocumentToDrive(id, documentType)
    return NextResponse.json({ success: true, documentType, ...result })
  } catch (error) {
    console.error("Falha ao salvar documento no Google Drive:", error instanceof Error ? error.message : "Erro desconhecido")
    await saveDriveSyncError(id, error).catch(() => undefined)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Não foi possível salvar o documento no Google Drive." },
      { status: 500 },
    )
  }
}
