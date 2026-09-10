export const PLANO_APC_GENERATED_MIN_LENGTH = 35_000

export type PlanoApcGenerationValidation = {
  valid: boolean
  characterCount: number
  issues: string[]
}

const requiredSections = [
  "## 1. Sumário Executivo",
  "## 2. Análise do Cenário Atual de Vendas",
  "## 3. Identificação de Gargalos e Pontos de Atrito",
  "## 4. Oportunidades de Melhoria",
  "## 5. Análise SWOT de Vendas",
  "## 6. Conclusão",
  "## 7. Plano de Ação",
]

function countMatches(value: string, pattern: RegExp) {
  return value.match(pattern)?.length ?? 0
}

export function validateGeneratedPlanoApc(markdown: string): PlanoApcGenerationValidation {
  const normalized = markdown.replace(/\r\n?/g, "\n").trim()
  const issues: string[] = []

  if (normalized.length < PLANO_APC_GENERATED_MIN_LENGTH) {
    issues.push(`O relatório tem ${normalized.length.toLocaleString("pt-BR")} caracteres; precisa ter no mínimo 35.000 caracteres.`)
  }
  if (!/^# Diagnóstico Comercial\s*[—-]/m.test(normalized)) {
    issues.push("O título principal '# Diagnóstico Comercial — ...' está ausente ou inválido.")
  }

  const missingSections = requiredSections.filter((section) => !normalized.includes(section))
  if (missingSections.length) issues.push(`Seções obrigatórias ausentes: ${missingSections.join(", ")}.`)

  const structureChecks: Array<[number, RegExp, string]> = [
    [6, /^### 3\.[1-6]\.\s+.+$/gm, "6 gargalos numerados de 3.1 a 3.6"],
    [6, /^### 4\.[1-6]\.\s+.+$/gm, "6 oportunidades numeradas de 4.1 a 4.6"],
    [6, /^### 7\.[1-6]\.\s+.+$/gm, "6 ações numeradas de 7.1 a 7.6"],
    [6, /^\*\*Ponto de Atrito:\*\*/gm, "6 linhas de Ponto de Atrito"],
    [6, /^\*\*Impacto Esperado:\*\*/gm, "6 linhas de Impacto Esperado das oportunidades"],
    [6, /^\*\*O QUE É:/gm, "6 campos O QUE É"],
    [6, /^\*\*Descrição Detalhada:\*\*/gm, "6 campos de Descrição Detalhada"],
    [6, /^\*\*Responsável Interno:\*\*/gm, "6 campos de Responsável Interno"],
    [6, /^\*\*Tempo Estimado:\*\*/gm, "6 campos de Tempo Estimado"],
    [6, /^\*\*Recursos Necessários:\*\*/gm, "6 campos de Recursos Necessários"],
    [6, /^\*\*Indicadores de Sucesso \(Como saber se deu certo\?\):\*\*/gm, "6 campos de Indicadores de Sucesso"],
    [6, /^\*\*Próximos Passos \(O que fazer primeiro\?\):\*\*/gm, "6 campos de Próximos Passos"],
  ]

  for (const [expected, pattern, description] of structureChecks) {
    const actual = countMatches(normalized, pattern)
    if (actual !== expected) issues.push(`A estrutura exige ${description}; foram encontrados ${actual}.`)
  }

  return { valid: issues.length === 0, characterCount: normalized.length, issues }
}

export function buildPlanoApcRepairPrompt(markdown: string, issues: string[]) {
  return `Reescreva integralmente o relatório abaixo, corrigindo todas as violações listadas. Preserve os fatos do briefing e não invente dados. Entregue somente o relatório Markdown completo, nunca comentários sobre a revisão.

VIOLAÇÕES QUE DEVEM SER CORRIGIDAS:
${issues.map((issue) => `- ${issue}`).join("\n")}

O resultado final deve ter no mínimo 35.000 caracteres úteis, sem repetições artificiais, mantendo exatamente 6 gargalos, 6 oportunidades, 6 ações e a correspondência 1:1.

RELATÓRIO A CORRIGIR:
${markdown}`
}
