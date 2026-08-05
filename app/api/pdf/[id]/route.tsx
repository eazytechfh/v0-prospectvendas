import { Document, Page, StyleSheet, Text, View, renderToBuffer } from "@react-pdf/renderer"
import { getFormSubmissionById, type FormSubmission } from "@/lib/form-submissions"

export const runtime = "nodejs"

const formTypeLabels: Record<FormSubmission["form_type"], string> = {
  apc_servicos: "APC Serviços",
  apc_contabilidade: "APC Contabilidade",
  entrevista_diretoria: "Entrevista Diretoria",
  entrevista_equipe_comercial: "Entrevista Equipe Comercial",
}

const styles = StyleSheet.create({
  page: {
    paddingTop: 42,
    paddingRight: 42,
    paddingBottom: 48,
    paddingLeft: 42,
    fontFamily: "Helvetica",
    fontSize: 10,
    color: "#1e293b",
    lineHeight: 1.5,
  },
  header: {
    marginBottom: 24,
    paddingBottom: 16,
    borderBottomWidth: 2,
    borderBottomColor: "#f59e0b",
  },
  eyebrow: {
    marginBottom: 6,
    color: "#b45309",
    fontSize: 9,
    fontWeight: 700,
    textTransform: "uppercase",
  },
  title: {
    fontSize: 22,
    fontWeight: 700,
    color: "#0f172a",
  },
  date: {
    marginTop: 6,
    color: "#64748b",
    fontSize: 9,
  },
  answerBlock: {
    marginBottom: 13,
    padding: 11,
    backgroundColor: "#f8fafc",
    borderLeftWidth: 2,
    borderLeftColor: "#cbd5e1",
  },
  question: {
    marginBottom: 5,
    fontWeight: 700,
    color: "#0f172a",
  },
  answer: {
    color: "#334155",
  },
  emptyAnswer: {
    color: "#94a3b8",
    fontStyle: "italic",
  },
  footer: {
    position: "absolute",
    right: 42,
    bottom: 22,
    left: 42,
    color: "#94a3b8",
    fontSize: 8,
    textAlign: "center",
  },
})

function formatDate(value: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "long",
    timeStyle: "short",
    timeZone: "America/Sao_Paulo",
  }).format(new Date(value))
}

function SubmissionPdf({ submission }: { submission: FormSubmission }) {
  const companyName = submission.company_name?.trim() || "Empresa não informada"

  return (
    <Document title={`${companyName} - ${formTypeLabels[submission.form_type]}`}>
      <Page size="A4" style={styles.page}>
        <View style={styles.header} fixed>
          <Text style={styles.eyebrow}>{formTypeLabels[submission.form_type]}</Text>
          <Text style={styles.title}>{companyName}</Text>
          <Text style={styles.date}>Recebido em {formatDate(submission.created_at)}</Text>
        </View>

        {submission.answers.map((item, index) => {
          const answer = Array.isArray(item.answer) ? item.answer.join(", ") : item.answer

          return (
            <View key={`${index}-${item.question}`} style={styles.answerBlock} wrap={false}>
              <Text style={styles.question}>{item.question}</Text>
              <Text style={answer ? styles.answer : styles.emptyAnswer}>{answer || "Não respondido"}</Text>
            </View>
          )
        })}

        <Text
          style={styles.footer}
          fixed
          render={({ pageNumber, totalPages }) => `Prospect Vendas · Página ${pageNumber} de ${totalPages}`}
        />
      </Page>
    </Document>
  )
}

function attachmentFileName(submission: FormSubmission) {
  const company = submission.company_name
    ?.normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9_-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80)

  return `formulario-${company || submission.id}.pdf`
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

    const pdf = await renderToBuffer(<SubmissionPdf submission={submission} />)

    return new Response(new Uint8Array(pdf), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${attachmentFileName(submission)}"`,
        "Cache-Control": "private, no-store",
      },
    })
  } catch (error) {
    console.error("Falha ao gerar PDF do formulário:", error)
    return Response.json({ error: "Não foi possível gerar o PDF." }, { status: 500 })
  }
}
