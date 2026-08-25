import { NextResponse } from "next/server"
import { createBriefingSubmission } from "@/lib/form-submissions"

export const runtime = "nodejs"

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const formType = formData.get("formType")
    const companyName = formData.get("companyName")
    const file = formData.get("briefing")

    if (formType !== "apc_servicos" && formType !== "apc_contabilidade") {
      return NextResponse.json({ error: "Tipo de formulário inválido." }, { status: 400 })
    }

    if (typeof companyName !== "string" || !companyName.trim()) {
      return NextResponse.json({ error: "Informe o nome da empresa." }, { status: 400 })
    }

    if (!(file instanceof File) || file.size === 0) {
      return NextResponse.json({ error: "Selecione um arquivo de briefing." }, { status: 400 })
    }

    const submission = await createBriefingSubmission({
      formType,
      companyName: companyName.trim(),
      file,
    })

    return NextResponse.json({ success: true, submission })
  } catch (error) {
    console.error("Falha ao importar briefing:", error)
    const message = error instanceof Error ? error.message : "Erro desconhecido."
    return NextResponse.json({ error: `Não foi possível importar o briefing. ${message}` }, { status: 500 })
  }
}
