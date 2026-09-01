import { StyleSheet, Text, View } from "@react-pdf/renderer"

type InlineRun = { text: string; bold: boolean }

type TableCell = { runs: InlineRun[] }

export type PdfBlock =
  | { type: "h1" | "h2" | "h3" | "h4"; text: string }
  | { type: "p"; runs: InlineRun[] }
  | { type: "li"; marker: string; runs: InlineRun[] }
  | { type: "table"; header: TableCell[]; rows: TableCell[][] }
  | { type: "hr" }

function parseInline(text: string): InlineRun[] {
  const runs: InlineRun[] = []
  const regex = /\*\*(.+?)\*\*/g
  let lastIndex = 0
  let match: RegExpExecArray | null

  while ((match = regex.exec(text))) {
    if (match.index > lastIndex) {
      runs.push({ text: text.slice(lastIndex, match.index), bold: false })
    }
    runs.push({ text: match[1], bold: true })
    lastIndex = regex.lastIndex
  }
  if (lastIndex < text.length) {
    runs.push({ text: text.slice(lastIndex), bold: false })
  }

  return runs.length > 0 ? runs : [{ text, bold: false }]
}

export function parseMarkdownToPdfBlocks(markdown: string): PdfBlock[] {
  const lines = markdown.replace(/\r\n/g, "\n").split("\n")
  const blocks: PdfBlock[] = []
  let paragraphBuffer: string[] = []

  const flushParagraph = () => {
    if (paragraphBuffer.length === 0) return
    const text = paragraphBuffer.join(" ").trim()
    if (text) blocks.push({ type: "p", runs: parseInline(text) })
    paragraphBuffer = []
  }

  const parseTableRow = (line: string) => {
    const normalized = line.trim().replace(/^\|/, "").replace(/\|$/, "")
    return normalized.split("|").map((cell) => ({ runs: parseInline(cell.trim()) }))
  }

  const isTableSeparator = (line: string) => {
    const cells = line.trim().replace(/^\|/, "").replace(/\|$/, "").split("|")
    return cells.length > 0 && cells.every((cell) => /^:?-{3,}:?$/.test(cell.trim()))
  }

  for (let lineIndex = 0; lineIndex < lines.length; lineIndex += 1) {
    const rawLine = lines[lineIndex]
    const line = rawLine.trim()

    if (line === "") {
      flushParagraph()
      continue
    }
    if (line === "---" || line === "***") {
      flushParagraph()
      blocks.push({ type: "hr" })
      continue
    }

    const headingMatch = line.match(/^(#{1,4})\s+(.*)$/)
    if (headingMatch) {
      flushParagraph()
      const level = headingMatch[1].length
      const type = (["h1", "h2", "h3", "h4"] as const)[level - 1]
      blocks.push({ type, text: headingMatch[2].trim() })
      continue
    }

    const nextLine = lines[lineIndex + 1]?.trim() ?? ""
    if (line.includes("|") && isTableSeparator(nextLine)) {
      flushParagraph()
      const header = parseTableRow(line)
      const rows: TableCell[][] = []
      lineIndex += 2

      while (lineIndex < lines.length) {
        const tableLine = lines[lineIndex].trim()
        if (!tableLine || !tableLine.includes("|")) {
          lineIndex -= 1
          break
        }
        rows.push(parseTableRow(tableLine))
        lineIndex += 1
      }

      blocks.push({ type: "table", header, rows })
      continue
    }

    const listMatch = line.match(/^[-*]\s+(.*)$/)
    if (listMatch) {
      flushParagraph()
      blocks.push({ type: "li", marker: "•", runs: parseInline(listMatch[1].trim()) })
      continue
    }

    const orderedListMatch = line.match(/^(\d+)\.\s+(.*)$/)
    if (orderedListMatch) {
      flushParagraph()
      blocks.push({ type: "li", marker: `${orderedListMatch[1]}.`, runs: parseInline(orderedListMatch[2].trim()) })
      continue
    }

    paragraphBuffer.push(line)
  }
  flushParagraph()

  return blocks
}

const styles = StyleSheet.create({
  h1: {
    marginBottom: 14,
    fontSize: 20,
    fontWeight: 700,
    color: "#0f172a",
  },
  h2: {
    marginTop: 18,
    marginBottom: 10,
    paddingBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: "#f59e0b",
    fontSize: 14,
    fontWeight: 700,
    color: "#0f172a",
  },
  h3: {
    marginTop: 12,
    marginBottom: 6,
    fontSize: 11.5,
    fontWeight: 700,
    color: "#b45309",
  },
  h4: {
    marginTop: 10,
    marginBottom: 5,
    fontSize: 10.5,
    fontWeight: 700,
    color: "#0f172a",
  },
  p: {
    marginBottom: 8,
    fontSize: 9.5,
    lineHeight: 1.5,
    color: "#334155",
  },
  li: {
    marginBottom: 5,
    marginLeft: 10,
    fontSize: 9.5,
    lineHeight: 1.5,
    color: "#334155",
  },
  toc: {
    marginTop: 4,
    marginBottom: 18,
    padding: 12,
    backgroundColor: "#f8fafc",
    borderLeftWidth: 3,
    borderLeftColor: "#f59e0b",
  },
  tocTitle: {
    marginBottom: 8,
    fontSize: 12,
    fontWeight: 700,
    color: "#0f172a",
  },
  tocItem: {
    marginBottom: 3,
    fontSize: 8.5,
    color: "#334155",
  },
  tocSubItem: {
    marginLeft: 12,
    color: "#64748b",
  },
  table: {
    marginTop: 6,
    marginBottom: 12,
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderColor: "#94a3b8",
  },
  tableRow: {
    flexDirection: "row",
  },
  tableHeaderCell: {
    flex: 1,
    padding: 6,
    backgroundColor: "#f1f5f9",
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderColor: "#94a3b8",
    fontSize: 8.5,
    fontWeight: 700,
    color: "#0f172a",
  },
  tableCell: {
    flex: 1,
    padding: 6,
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderColor: "#94a3b8",
    fontSize: 8.2,
    lineHeight: 1.4,
    color: "#334155",
  },
  bold: {
    fontWeight: 700,
    color: "#0f172a",
  },
  hr: {
    marginVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
})

function Runs({ runs }: { runs: InlineRun[] }) {
  return (
    <>
      {runs.map((run, index) => (
        <Text key={index} style={run.bold ? styles.bold : undefined}>
          {run.text}
        </Text>
      ))}
    </>
  )
}

const TABLE_ROWS_PER_PAGE = 14

function MarkdownTable({ block }: { block: Extract<PdfBlock, { type: "table" }> }) {
  const chunks: TableCell[][][] = []
  for (let index = 0; index < block.rows.length; index += TABLE_ROWS_PER_PAGE) {
    chunks.push(block.rows.slice(index, index + TABLE_ROWS_PER_PAGE))
  }
  if (chunks.length === 0) chunks.push([])

  return (
    <>
      {chunks.map((rows, chunkIndex) => (
        <View key={chunkIndex} style={styles.table} wrap={false} break={chunkIndex > 0}>
          <View style={styles.tableRow}>
            {block.header.map((cell, cellIndex) => (
              <Text key={cellIndex} style={styles.tableHeaderCell}>
                <Runs runs={cell.runs} />
              </Text>
            ))}
          </View>
          {rows.map((row, rowIndex) => (
            <View key={rowIndex} style={styles.tableRow}>
              {block.header.map((_, cellIndex) => (
                <Text key={cellIndex} style={styles.tableCell}>
                  <Runs runs={row[cellIndex]?.runs ?? [{ text: "", bold: false }]} />
                </Text>
              ))}
            </View>
          ))}
        </View>
      ))}
    </>
  )
}

function TableOfContents({ blocks }: { blocks: PdfBlock[] }) {
  const headings = blocks.filter(
    (block): block is PdfBlock & { type: "h2" | "h3"; text: string } =>
      block.type === "h2" || block.type === "h3",
  )

  return (
    <View style={styles.toc}>
      <Text style={styles.tocTitle}>Índice</Text>
      {headings.map((heading, index) => (
        <Text key={index} style={[styles.tocItem, heading.type === "h3" ? styles.tocSubItem : {}]}>
          {heading.text}
        </Text>
      ))}
    </View>
  )
}

export function MarkdownPdfBlocks({ blocks }: { blocks: PdfBlock[] }) {
  const firstTitleIndex = blocks.findIndex((block) => block.type === "h1")

  return (
    <>
      {blocks.map((block, index) => {
        switch (block.type) {
          case "h1":
            return (
              <View key={index}>
                <Text style={styles.h1}>{block.text}</Text>
                {index === firstTitleIndex && <TableOfContents blocks={blocks} />}
              </View>
            )
          case "h2":
            return (
              <Text key={index} style={styles.h2} wrap={false}>
                {block.text}
              </Text>
            )
          case "h3":
            return (
              <Text key={index} style={styles.h3} wrap={false}>
                {block.text}
              </Text>
            )
          case "h4":
            return (
              <Text key={index} style={styles.h4} wrap={false}>
                {block.text}
              </Text>
            )
          case "hr":
            return <View key={index} style={styles.hr} />
          case "li":
            return (
              <View key={index} style={{ flexDirection: "row" }}>
                <Text style={styles.li}>{`${block.marker}  `}</Text>
                <Text style={[styles.li, { flex: 1 }]}>
                  <Runs runs={block.runs} />
                </Text>
              </View>
            )
          case "table":
            return <MarkdownTable key={index} block={block} />
          case "p":
          default:
            return (
              <Text key={index} style={styles.p}>
                <Runs runs={block.runs} />
              </Text>
            )
        }
      })}
    </>
  )
}
