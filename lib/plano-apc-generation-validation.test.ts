import assert from "node:assert/strict"
import test from "node:test"
import {
  PLANO_APC_GENERATION_MAX_ATTEMPTS,
  validateGeneratedPlanoApc,
} from "./plano-apc-generation-validation"

test("limita a geração a uma chamada por clique", () => {
  assert.equal(PLANO_APC_GENERATION_MAX_ATTEMPTS, 1)
})

function structurallyCompletePlano() {
  const sections = [
    "# Diagnóstico Comercial — Empresa",
    "## 1. Sumário Executivo",
    "## 2. Análise do Cenário Atual de Vendas",
    "## 3. Identificação de Gargalos e Pontos de Atrito",
    ...Array.from({ length: 6 }, (_, index) => `### 3.${index + 1}. Gargalo\n\nAnálise.\n\n**Ponto de Atrito:** Impacto.`),
    "## 4. Oportunidades de Melhoria",
    ...Array.from({ length: 6 }, (_, index) => `### 4.${index + 1}. Oportunidade\n\nAnálise.\n\n**Impacto Esperado:** Resultado.`),
    "## 5. Análise SWOT de Vendas",
    "## 6. Conclusão",
    "## 7. Plano de Ação",
    ...Array.from({ length: 6 }, (_, index) => `### 7.${index + 1}. Ação\n\n**O QUE É: Ação completa**\n\n**Descrição Detalhada:**\n- Item\n\n**Impacto Esperado (Por que fazer isso?):**\n- Item\n\n**Responsável Interno:** Direção\n\n**Tempo Estimado:** 30 dias\n\n**Recursos Necessários:**\n- Item\n\n**Indicadores de Sucesso (Como saber se deu certo?):**\n- Item\n\n**Próximos Passos (O que fazer primeiro?):**\n1. Passo`),
  ]
  return sections.join("\n\n")
}

test("rejeita plano com menos de 35.000 caracteres", () => {
  const result = validateGeneratedPlanoApc(structurallyCompletePlano())
  assert.equal(result.valid, false)
  assert.match(result.issues.join(" "), /35\.000 caracteres/)
})

test("rejeita plano longo sem a estrutura obrigatória", () => {
  const result = validateGeneratedPlanoApc("texto ".repeat(6_000))
  assert.equal(result.valid, false)
  assert.match(result.issues.join(" "), /6 gargalos/)
})

test("aprova plano longo com todas as seções e subseções", () => {
  const markdown = `${structurallyCompletePlano()}\n\n${"Análise aprofundada. ".repeat(2_000)}`
  const result = validateGeneratedPlanoApc(markdown)
  assert.equal(result.valid, true, result.issues.join("; "))
  assert.ok(result.characterCount >= 35_000)
})
