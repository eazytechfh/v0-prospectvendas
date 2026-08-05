import { readFile } from "node:fs/promises"
import { loadEnvFile } from "node:process"
import { resolve } from "node:path"
import { parse } from "csv-parse/sync"

type CsvRow = Record<string, string>

type Answer = {
  question: string
  answer: string
}

const csvPath = resolve(process.cwd(), "scripts/legacy-import/apc-servicos-legado.csv")

const metadataColumns = [
  ["Nome do Contato principal (Cliente)", "Nome do Contato principal (Cliente)"],
  ["Nome Contato", "Nome Contato"],
  ["Telefone", "Telefone"],
  ["CNPJ", "CNPJ"],
  ["Website", "Website"],
  ["Redes Sociais", "Redes Sociais"],
  ["Segmento", "Segmento"],
  ["Faturamento", "Faturamento"],
  ["Atendentes", "Atendentes"],
  ["Funcionários Comercial", "Funcionários Comercial"],
  ["Clientes", "Clientes"],
  ["Endereço da Empresa", "Endereço da Empresa"],
] as const

const firstOpenQuestion = "Quais os principais marcos que moldaram a história da sua empresa? Quais desafios ou conquistas foram mais marcantes?"
const lastOpenQuestion = "Qual o impacto direto ou indireto desses gargalos e frustrações nos resultados da empresa?"

function requiredEnvironment() {
  loadEnvFile(resolve(process.cwd(), ".env.local"))

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY devem estar definidos em .env.local")
  }

  return {
    supabaseUrl: supabaseUrl.replace(/\/$/, ""),
    serviceRoleKey,
  }
}

function isoDate(value: string) {
  const match = value.trim().match(/^(\d{2})\/(\d{2})\/(\d{4})$/)
  if (!match) throw new Error(`Data inválida: ${JSON.stringify(value)}`)

  const [, dayText, monthText, yearText] = match
  const day = Number(dayText)
  const month = Number(monthText)
  const year = Number(yearText)
  const date = new Date(Date.UTC(year, month - 1, day))

  if (
    date.getUTCFullYear() !== year
    || date.getUTCMonth() !== month - 1
    || date.getUTCDate() !== day
  ) {
    throw new Error(`Data inválida: ${JSON.stringify(value)}`)
  }

  return date.toISOString()
}

function addAnswer(answers: Answer[], question: string, rawValue: string | undefined) {
  const answer = rawValue?.trim()
  if (answer) answers.push({ question, answer })
}

function buildAnswers(row: CsvRow, openQuestionColumns: string[]) {
  const answers: Answer[] = [
    {
      question: "Observação",
      answer: "⚠️ Dados migrados do formulário antigo, estrutura de perguntas anterior à atualização",
    },
  ]

  for (const [column, question] of metadataColumns) {
    addAnswer(answers, question, row[column])
  }

  for (const question of openQuestionColumns) {
    addAnswer(answers, question, row[question])
  }

  return answers
}

async function main() {
  const { supabaseUrl, serviceRoleKey } = requiredEnvironment()
  const csv = await readFile(csvPath, "utf8")
  const rows = parse(csv, {
    bom: true,
    columns: true,
    skip_empty_lines: true,
    trim: false,
  }) as CsvRow[]

  if (rows.length === 0) throw new Error("O CSV não contém registros")

  const headers = Object.keys(rows[0])
  const firstOpenQuestionIndex = headers.indexOf(firstOpenQuestion)
  const lastOpenQuestionIndex = headers.indexOf(lastOpenQuestion)

  if (firstOpenQuestionIndex === -1 || lastOpenQuestionIndex < firstOpenQuestionIndex) {
    throw new Error("Não foi possível localizar o intervalo de perguntas abertas no CSV")
  }

  const requiredColumns = [
    "Data",
    "Nome Empresa (Razão Social)",
    "ID da entrevista",
    ...metadataColumns.map(([column]) => column),
  ]
  const missingColumns = requiredColumns.filter((column) => !headers.includes(column))
  if (missingColumns.length > 0) {
    throw new Error(`Colunas obrigatórias ausentes: ${missingColumns.join(", ")}`)
  }

  const openQuestionColumns = headers.slice(firstOpenQuestionIndex, lastOpenQuestionIndex + 1)
  const seenStarchyDates = new Set<string>()
  const importRows = rows.filter((row) => {
    const isStarchy = row["Nome Empresa (Razão Social)"].trim().toLocaleLowerCase("pt-BR") === "starchy"
    const date = row.Data.trim()

    if (!isStarchy || date !== "25/06/2026") return true
    if (seenStarchyDates.has(date)) return false

    seenStarchyDates.add(date)
    return true
  })

  let successCount = 0
  const failures: Array<{ company: string; date: string; reason: string }> = []

  for (const row of importRows) {
    const company = row["Nome Empresa (Razão Social)"].trim()
    const date = row.Data.trim()

    try {
      if (!company) throw new Error("Nome Empresa (Razão Social) vazio")

      const response = await fetch(`${supabaseUrl}/rest/v1/form_submissions`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${serviceRoleKey}`,
          apikey: serviceRoleKey,
          "Content-Type": "application/json",
          Prefer: "return=minimal",
        },
        body: JSON.stringify({
          form_type: "apc_servicos",
          company_name: company,
          answers: buildAnswers(row, openQuestionColumns),
          read: true,
          webhook_delivered: true,
          created_at: isoDate(date),
        }),
      })

      if (!response.ok) {
        const details = await response.text()
        throw new Error(`Supabase respondeu ${response.status}: ${details}`)
      }

      successCount += 1
      console.log(`[OK] ${company} (${date})`)
    } catch (error) {
      const reason = error instanceof Error ? error.message : String(error)
      failures.push({ company: company || "Empresa não informada", date, reason })
      console.error(`[FALHA] ${company || "Empresa não informada"} (${date}): ${reason}`)
    }
  }

  console.log("\nResumo da importação")
  console.log(`Inseridos com sucesso: ${successCount}`)
  console.log(`Falhas: ${failures.length}`)

  if (failures.length > 0) {
    for (const failure of failures) {
      console.log(`- ${failure.company} (${failure.date}): ${failure.reason}`)
    }
    process.exitCode = 1
  }
}

main().catch((error) => {
  console.error("Importação não iniciada:", error instanceof Error ? error.message : error)
  process.exitCode = 1
})

