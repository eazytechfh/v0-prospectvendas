import { Document, Image, Link, Page, StyleSheet, Text, View, renderToBuffer } from "@react-pdf/renderer"
import path from "node:path"
import { readFile } from "node:fs/promises"
import { getFormSubmissionById, markPlanoApcDownloaded } from "@/lib/form-submissions"
import { MarkdownPdfBlocks, parseMarkdownToPdfBlocks } from "@/lib/markdown-pdf"

export const runtime = "nodejs"

const styles = StyleSheet.create({
  page: {
    paddingTop: 94,
    paddingRight: 42,
    paddingBottom: 82,
    paddingLeft: 42,
    fontFamily: "Helvetica",
    fontSize: 9.5,
    color: "#1e293b",
  },
  logo: {
    position: "absolute",
    top: 26,
    right: 42,
    width: 142,
    height: 47,
    objectFit: "contain",
  },
  footer: {
    position: "absolute",
    right: 42,
    bottom: 30,
    left: 42,
    color: "#222222",
    fontSize: 6.8,
    textAlign: "left",
  },
  footerLink: {
    color: "#222222",
    textDecoration: "underline",
  },
  pageNumber: {
    position: "absolute",
    right: 42,
    bottom: 16,
    fontSize: 7,
    color: "#222222",
    textAlign: "right",
  },
})

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
    const logo = await readFile(path.join(process.cwd(), "public", "logo-prospect-vendas-preto.png"))

    const pdf = await renderToBuffer(
      <Document title={`Plano APC - ${submission.company_name || "Empresa"}`}>
        <Page size="A4" style={styles.page} wrap>
          <Image style={styles.logo} src={{ data: logo, format: "png" }} fixed />

          <MarkdownPdfBlocks blocks={blocks} />

          <View style={styles.footer} fixed>
            <Text>Prospect Vendas | Mentoria, Sistemas e Treinamentos</Text>
            <Text>R. Dalcídio Jurandir, 255 sala 146 – Barra da Tijuca -  Rio de Janeiro – RJ – CEP: 22.631-250</Text>
            <Text>
              <Link src="https://www.prospectvendas.com.br" style={styles.footerLink}>www.prospectvendas.com.br</Link>
              {" - "}
              <Link src="mailto:comercial@prospectvendas.com.br" style={styles.footerLink}>comercial@prospectvendas.com.br</Link>
              {" - 21- 96436-9577"}
            </Text>
          </View>

          <Text
            style={styles.pageNumber}
            fixed
            render={({ pageNumber, totalPages }) => `Página ${pageNumber} de ${totalPages}`}
          />
        </Page>
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
