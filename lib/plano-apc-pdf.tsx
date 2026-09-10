import { Document, Image, Link, Page, StyleSheet, Text, View, renderToBuffer } from "@react-pdf/renderer"
import { readFile } from "node:fs/promises"
import path from "node:path"
import React from "react"
import { MarkdownPdfBlocks, parseMarkdownToPdfBlocks } from "@/lib/markdown-pdf"

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

export async function renderPlanoApcPdf(markdown: string, companyName: string | null) {
  const blocks = parseMarkdownToPdfBlocks(markdown)
  const logo = await readFile(path.join(process.cwd(), "public", "logo-prospect-vendas-preto.png"))

  return renderToBuffer(
    <Document title={`Plano APC - ${companyName || "Empresa"}`}>
      <Page size="A4" style={styles.page} wrap>
        <Image style={styles.logo} src={{ data: logo, format: "png" }} fixed />

        <MarkdownPdfBlocks blocks={blocks} />

        <View style={styles.footer} fixed>
          <Text>Prospect Vendas | Mentoria, Sistemas e Treinamentos</Text>
          <Text>R. Dalcídio Jurandir, 255 sala 146 – Barra da Tijuca - Rio de Janeiro – RJ – CEP: 22.631-250</Text>
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
}
