import { getFormSubmissionById, recordActivityLog, saveDriveDocument, saveDriveSyncError, type FormSubmission } from "@/lib/form-submissions"
import { isGoogleDriveConfigured, type DriveDocumentType, uploadPdfToCompanyDrive } from "@/lib/google-drive"
import { renderPlanoApcPdf } from "@/lib/plano-apc-pdf"
import { renderSubmissionPdf } from "@/lib/submission-pdf"

export async function syncSubmissionDocumentToDrive(submissionId: string, documentType: DriveDocumentType) {
  const submission = await getFormSubmissionById(submissionId)
  if (!submission) throw new Error("Formulário não encontrado.")
  if (submission.form_type !== "apc_servicos" && submission.form_type !== "apc_contabilidade") {
    throw new Error("O Google Drive está disponível somente para APC Serviços e Contabilidade.")
  }

  const companyName = submission.company_name?.trim()
  if (!companyName) throw new Error("Nome da empresa não informado.")
  if (documentType === "plano" && !submission.plano_apc_markdown) {
    throw new Error("O Plano APC ainda não foi gerado.")
  }

  const pdf = documentType === "briefing"
    ? await renderSubmissionPdf(submission)
    : await renderPlanoApcPdf(submission.plano_apc_markdown!, companyName)
  const result = await uploadPdfToCompanyDrive({ submissionId, companyName, documentType, pdf })
  await saveDriveDocument(submissionId, documentType, result)
  return result
}

export async function syncNewBriefingToDrive(submissionId: string) {
  if (!isGoogleDriveConfigured()) return
  let submission: FormSubmission | null = null

  try {
    submission = await getFormSubmissionById(submissionId)
    await syncSubmissionDocumentToDrive(submissionId, "briefing")
    await recordActivityLog({
      action: "Google Drive: envio do briefing concluído",
      submissionId,
      companyName: submission?.company_name,
      formType: submission?.form_type,
      details: { documentType: "briefing", source: "automatic" },
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro desconhecido"
    console.error("Falha ao enviar briefing ao Google Drive:", message)
    await recordActivityLog({
      action: "Google Drive: erro no envio do briefing",
      submissionId,
      companyName: submission?.company_name,
      formType: submission?.form_type,
      details: { documentType: "briefing", source: "automatic" },
      error: message,
    })
    await saveDriveSyncError(submissionId, error).catch(() => undefined)
  }
}
