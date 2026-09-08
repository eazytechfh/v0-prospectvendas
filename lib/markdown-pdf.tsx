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

// Leave lineHeight at the font default: layout 4.6.1 reapplies numeric line
// heights on each page relayout, multiplying them across a continuous document.
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
    color: "#334155",
  },
  li: {
    marginBottom: 5,
    marginLeft: 10,
    fontSize: 9.5,
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

// Estimates only decide which small blocks may be kept together. React-pdf
// measures their actual height against the remaining page space before placing
// them (wrap=false), and minPresenceAhead protects the start of larger blocks.
// Never make an arbitrarily large AI-generated paragraph/list unbreakable.
function compactHeight(block: PdfBlock): number {
  if (block.type === "p" || block.type === "li") {
    const length = block.runs.reduce((total, run) => total + run.text.length, 0)
    return (Math.ceil(length / 45) + 1) * 14.25 + 8
  }
  if ("text" in block) return (Math.ceil(block.text.length / 35) + 1) * 24 + 34
  return Infinity
}

const COMPACT_HEIGHT = 300

function MarkdownTable({ block }: { block: Extract<PdfBlock, { type: "table" }> }) {
  return (
    <View style={styles.table}>
      <View style={styles.tableRow} wrap={false} minPresenceAhead={40}>
        {block.header.map((cell, cellIndex) => (
          <Text key={cellIndex} style={styles.tableHeaderCell}>
            <Runs runs={cell.runs} />
          </Text>
        ))}
      </View>
      {block.rows.map((row, rowIndex) => (
        <View
          key={rowIndex}
          style={styles.tableRow}
          wrap={row.some((cell) =>
            cell.runs.reduce((total, run) => total + run.text.length, 0) > 900 / block.header.length
          )}
        >
          {block.header.map((_, cellIndex) => (
            <Text key={cellIndex} style={styles.tableCell} orphans={3} widows={3}>
              <Runs runs={row[cellIndex]?.runs ?? [{ text: "", bold: false }]} />
            </Text>
          ))}
        </View>
      ))}
    </View>
  )
}

function TableOfContents({ blocks }: { blocks: PdfBlock[] }) {
  const headings = blocks.filter(
    (block): block is PdfBlock & { type: "h2" | "h3"; text: string } =>
      block.type === "h2" || block.type === "h3",
  )

  return (
    <View style={styles.toc}>
      <Text style={styles.tocTitle} minPresenceAhead={30}>Índice</Text>
      {headings.map((heading, index) => (
        <Text key={index} wrap={false} style={[styles.tocItem, heading.type === "h3" ? styles.tocSubItem : {}]}>
          {heading.text}
        </Text>
      ))}
    </View>
  )
}

export function MarkdownPdfBlocks({ blocks, tocBlocks }: { blocks: PdfBlock[]; tocBlocks?: PdfBlock[] }) {
  const firstTitleIndex = blocks.findIndex((block) => block.type === "h1")
  const presenceAhead = (index: number) => {
    const next = blocks[index + 1]
    const height = next ? compactHeight(next) : 0
    return height <= COMPACT_HEIGHT ? height : 60
  }
  const renderBlock = (block: PdfBlock, index: number) => {
    switch (block.type) {
      case "h1":
        return (
          <View key={index}>
            <Text style={styles.h1} minPresenceAhead={50}>{block.text}</Text>
            {index === firstTitleIndex && <TableOfContents blocks={tocBlocks ?? blocks} />}
          </View>
        )
      case "h2":
        return (
          <Text key={index} style={styles.h2} wrap={false} minPresenceAhead={presenceAhead(index)}>
            {block.text}
          </Text>
        )
      case "h3":
        return (
          <Text key={index} style={styles.h3} wrap={false} minPresenceAhead={presenceAhead(index)}>
            {block.text}
          </Text>
        )
      case "h4":
        return (
          <Text key={index} style={styles.h4} wrap={false} minPresenceAhead={presenceAhead(index)}>
            {block.text}
          </Text>
        )
      case "hr":
        return <View key={index} style={styles.hr} />
      case "li":
        return (
          <Text key={index} style={styles.li} wrap={compactHeight(block) > COMPACT_HEIGHT} orphans={3} widows={3}
            minPresenceAhead={blocks[index - 1]?.type !== "li" && blocks[index + 1]?.type === "li" ? 40 : 0}>
            {`${block.marker}  `}
            <Runs runs={block.runs} />
          </Text>
        )
      case "table":
        return <MarkdownTable key={index} block={block} />
      case "p":
      default:
        return (
          <Text key={index} style={styles.p} wrap={compactHeight(block) > COMPACT_HEIGHT} orphans={3} widows={3}>
            <Runs runs={block.runs} />
          </Text>
        )
    }
  }

  const groups: { blocks: PdfBlock[]; start: number; height: number }[] = []
  for (let index = 0; index < blocks.length; index += 1) {
    const block = blocks[index]
    const group = { blocks: [block], start: index, height: compactHeight(block) }
    if (block.type === "li") {
      // Keep short lists whole; longer lists flow at item boundaries instead of
      // pushing an entire section onto a fresh page and wasting the current one.
      let end = index + 1
      let height = group.height
      while (blocks[end]?.type === "li" && height <= COMPACT_HEIGHT) height += compactHeight(blocks[end++])
      if (height <= COMPACT_HEIGHT) {
        group.height = height
        group.blocks = blocks.slice(index, end)
        index = end - 1
      }
    }
    const previous = groups[groups.length - 1]
    const previousEndsWithHeading = previous && /^(h2|h3|h4)$/.test(previous.blocks[previous.blocks.length - 1].type)
    if (previousEndsWithHeading && previous.height + group.height <= 420) {
      previous.blocks.push(...group.blocks)
      previous.height += group.height
    } else {
      groups.push(group)
    }
  }

  return <>{groups.map((group) => group.blocks.length > 1 ? (
    <View key={group.start} wrap={false}
      minPresenceAhead={/^(h2|h3|h4)$/.test(group.blocks[group.blocks.length - 1].type)
        ? presenceAhead(group.start + group.blocks.length - 1) : 0}>
      {group.blocks.map((block, offset) => renderBlock(block, group.start + offset))}
    </View>
  ) : renderBlock(group.blocks[0], group.start))}</>
}
