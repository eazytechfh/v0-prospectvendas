import { StyleSheet, Text, View } from "@react-pdf/renderer"

type InlineRun = { text: string; bold: boolean }

type PdfBlock =
  | { type: "h1" | "h2" | "h3" | "h4"; text: string }
  | { type: "p"; runs: InlineRun[] }
  | { type: "li"; runs: InlineRun[] }
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

  for (const rawLine of lines) {
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

    const listMatch = line.match(/^[-*]\s+(.*)$/)
    if (listMatch) {
      flushParagraph()
      blocks.push({ type: "li", runs: parseInline(listMatch[1].trim()) })
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

export function MarkdownPdfBlocks({ blocks }: { blocks: PdfBlock[] }) {
  return (
    <>
      {blocks.map((block, index) => {
        switch (block.type) {
          case "h1":
            return (
              <Text key={index} style={styles.h1}>
                {block.text}
              </Text>
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
                <Text style={styles.li}>{"•  "}</Text>
                <Text style={[styles.li, { flex: 1 }]}>
                  <Runs runs={block.runs} />
                </Text>
              </View>
            )
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
