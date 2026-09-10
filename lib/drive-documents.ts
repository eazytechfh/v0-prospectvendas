import { getFormSubmissionById, saveDriveDocument, saveDriveSyncError } from "@/lib/form-submissions"
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
  try {
    await syncSubmissionDocumentToDrive(submissionId, "briefing")
  } catch (error) {
    console.error("Falha ao enviar briefing ao Google Drive:", error instanceof Error ? error.message : "Erro desconhecido")
    await saveDriveSyncError(submissionId, error).catch(() => undefined)
  }
}
