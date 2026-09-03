import { Document, Page, StyleSheet, Text, View, renderToBuffer } from "@react-pdf/renderer"
import { getFormSubmissionById, markPlanoApcDownloaded } from "@/lib/form-submissions"
import { MarkdownPdfBlocks, parseMarkdownToPdfBlocks } from "@/lib/markdown-pdf"

export const runtime = "nodejs"

const formTypeLabels = {
  apc_servicos: "APC Serviços",
  apc_contabilidade: "APC Contabilidade",
} as const

const styles = StyleSheet.create({
  page: {
    paddingTop: 42,
    paddingRight: 42,
    paddingBottom: 48,
    paddingLeft: 42,
    fontFamily: "Helvetica",
    fontSize: 9.5,
    color: "#1e293b",
    lineHeight: 1.5,
  },
  header: {
    marginBottom: 20,
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
  date: {
    marginTop: 6,
    color: "#64748b",
    fontSize: 9,
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

    const blocks = parseMarkdownToPdfBlocks(submission.plano_apc_markdown)
    const blockChunks = Array.from(
      { length: Math.ceil(blocks.length / 60) },
      (_, index) => blocks.slice(index * 60, (index + 1) * 60),
    )

    const pdf = await renderToBuffer(
      <Document title={`Plano APC - ${submission.company_name || "Empresa"}`}>
        {blockChunks.map((chunk, index) => (
          <Page key={index} size="A4" style={styles.page}>
            <View style={styles.header} fixed>
              <Text style={styles.eyebrow}>
                Plano APC · {formTypeLabels[submission.form_type as keyof typeof formTypeLabels] ?? "APC Vendas"}
              </Text>
              <Text style={styles.date}>
                Gerado em {formatDate(submission.plano_apc_generated_at ?? submission.created_at)}
              </Text>
            </View>

            <MarkdownPdfBlocks blocks={chunk} tocBlocks={index === 0 ? blocks : undefined} />

            <Text
              style={styles.footer}
              fixed
              render={({ pageNumber, totalPages }) => `Prospect Vendas · Página ${pageNumber} de ${totalPages}`}
            />
          </Page>
        ))}
      </Document>,
    )

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
