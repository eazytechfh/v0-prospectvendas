"use client"

import { useRef, useState } from "react"
import Image from "next/image"
import { CheckCircle2 } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { FormWizard } from "@/components/form-wizard"
import { InterviewSectionBlock, scale10, scale5, yesNoSometimes, type InterviewField, type InterviewSection } from "@/components/interview-form-fields"

const textarea = (name: string, question: string): InterviewField => ({ name, question, kind: "textarea" })
const text = (name: string, question: string, required = false): InterviewField => ({ name, question, kind: "text", required })
const select = (name: string, question: string, options: readonly string[]): InterviewField => ({ name, question, kind: "select", options })
const radio = (name: string, question: string, options: readonly string[]): InterviewField => ({ name, question, kind: "radio", options })

const sections: InterviewSection[] = [
  { title: "Seção 1: Informações Básicas", fields: [
    text("empresa", "Empresa", true),
    text("cnpj", "CNPJ", true),
    text("nomeMembro", "Nome do Membro", true),
    text("telefoneContato", "Telefone Contato", true),
    { name: "quantidadeLeads", question: "Quantidade de leads que ele atende", kind: "number", required: true, defaultValue: 0 },
    { name: "quantidadeVendas", question: "Quantidade de vendas que ele faz", kind: "number", required: true, defaultValue: 0 },
  ] },
  { title: "Seção 2: Motivação Individual", fields: [
    textarea("fatoresMotivacao", "Quais fatores influenciam mais a sua motivação no trabalho atualmente?"),
    textarea("objetivosCarreira", "Quais são seus objetivos de carreira a curto (até 1 ano) e longo prazo (mais de 1 ano)?"),
    textarea("contribuicaoSucesso", "De que forma seu trabalho e suas ações contribuem para o sucesso da equipe e da empresa, e para seus objetivos pessoais?"),
  ] },
  { title: "Seção 3: Nível de Integração", fields: [
    select("nivelIntegracao", "Em uma escala de 1 a 10, o quanto você se sente integrado à equipe?", scale10),
    radio("expressarOpinioes", "Você se sente à vontade para expressar opiniões, ideias e preocupações com colegas e líderes?", yesNoSometimes),
    select("confiancaColegas", "Em uma escala de 1 a 10, o quanto você confia em seus colegas de equipe?", scale10),
    textarea("nivelConfianca", "Como você descreveria o nível de confiança entre os membros da equipe?"),
  ] },
  { title: "Seção 4: Coesão e Espírito de Equipe", fields: [
    textarea("espiritoEquipe", "Como você descreveria o espírito de equipe?"),
    radio("parteTime", "Você se sente parte de um time que trabalha em conjunto para alcançar os objetivos?", yesNoSometimes),
    textarea("exemploEspiritoEquipe", "Dê um exemplo de uma situação em que você sentiu o espírito de equipe em ação."),
    radio("pedirAjuda", "Você se sente à vontade para pedir ajuda aos seus colegas quando precisa?", yesNoSometimes),
    textarea("fortalecerEquipe", "O que poderia fortalecer o espírito de equipe?"),
    select("apoioMutuo", "A equipe se apoia mutuamente em momentos de dificuldade.", scale5),
    select("celebraSucessos", "A equipe celebra os sucessos em conjunto.", scale5),
    select("responsabilidadeResultados", "A equipe se sente responsável pelos resultados uns dos outros.", scale5),
  ] },
  { title: "Seção 5: Empatia", fields: [
    textarea("entenderCliente", "Como você se coloca no lugar do cliente para entender suas necessidades?"),
    textarea("doresClientes", "Quais são as principais dores que você identifica nos clientes?"),
    select("adaptarAbordagem", "Em uma escala de 1 a 10, o quanto você se sente capaz de adaptar sua abordagem para atender às necessidades específicas de cada cliente?", scale10),
    textarea("exemploEmpatia", "Dê um exemplo de uma situação em que você demonstrou empatia com um cliente."),
    select("escutaAtiva", "Escuta ativa", scale5),
    select("comunicacaoClara", "Comunicação clara e eficaz", scale5),
    select("compreensaoCliente", "Compreensão das necessidades do cliente", scale5),
    select("resolucaoProblemas", "Resolução de problemas", scale5),
    select("construcaoRelacionamentos", "Construção de relacionamentos", scale5),
  ] },
  { title: "Seção 6: Conhecimentos Básicos", fields: [
    textarea("principaisProdutos", "Quais são os principais produtos/serviços que a empresa oferece?"),
    select("confiancaProcessos", "Em uma escala de 1 a 10, o quanto você se sente confiante em relação ao seu conhecimento sobre os processos internos da empresa?", scale10),
    textarea("descricaoProcessos", "Como você descreveria os processos internos da empresa?"),
    text("produtoMaisVendido", "Qual dos seguintes produtos/serviços é o mais vendido pela empresa?"),
    textarea("objetivoVendas", "Qual é o principal objetivo do processo de vendas da empresa?"),
  ] },
  { title: "Seção 7: Proatividade", fields: [
    radio("sugerirMelhorias", "Você se sente à vontade para sugerir melhorias nos processos da empresa?", yesNoSometimes),
    textarea("ideiaSugerida", "Dê um exemplo de uma ideia que você já sugeriu para melhorar os processos da empresa ou a experiência do cliente."),
    select("valorizadoIdeias", "Em uma escala de 1 a 10, o quanto você se sente valorizado pela empresa por suas ideias e sugestões?", scale10),
    select("encorajadoIdeias", "Eu me sinto encorajado a apresentar novas ideias.", scale5),
    select("sugestoesConsideradas", "Minhas sugestões são levadas em consideração.", scale5),
    select("autonomiaIdeias", "Eu tenho autonomia para implementar minhas ideias.", scale5),
  ] },
  { title: "Seção 8: Clima de Trabalho", fields: [
    select("avaliacaoClima", "Em uma escala de 1 a 10, como você avalia o clima de trabalho na equipe?", scale10),
    textarea("pontosPositivosClima", "Quais são os pontos positivos do clima de trabalho?"),
    textarea("pontosNegativosClima", "Quais são os pontos negativos do clima de trabalho?"),
    select("ambientePositivo", "O ambiente de trabalho é positivo e motivador.", scale5),
    select("respeitoColaboracao", "Existe respeito e colaboração entre os membros da equipe.", scale5),
    select("liderancaInspiradora", "A liderança da equipe é inspiradora e apoia o desenvolvimento profissional.", scale5),
  ] },
  { title: "Seção 9: Dificuldades e Desafios", fields: [
    textarea("dificuldadesDiarias", "Quais são as maiores dificuldades que você enfrenta no seu dia a dia de trabalho?"),
    textarea("desafiosEquipe", "Quais são os maiores desafios que a equipe enfrenta para alcançar os resultados?"),
    select("preparoDesafios", "Em uma escala de 1 a 10, o quanto você se sente preparado para enfrentar esses desafios?", scale10),
    textarea("necessidadesPreparo", "O que você precisa para se sentir mais preparado para enfrentar esses desafios?"),
    textarea("obstaculosObjetivos", "Quais são os principais obstáculos que impedem você de alcançar seus objetivos?"),
  ] },
  { title: "Seção 10: Comunicação e Colaboração", fields: [
    select("avaliacaoComunicacao", "Em uma escala de 1 a 10, como você avalia a comunicação dentro da equipe?", scale10),
    textarea("descricaoComunicacao", "Como você avalia e descreve a comunicação dentro da equipe?"),
    textarea("avaliacaoColaboracao", "Como você avalia a colaboração entre os membros da equipe?"),
    select("comunicacaoEficaz", "A comunicação é clara e eficaz.", scale5),
    select("informacoesTransparentes", "As informações são compartilhadas de forma transparente.", scale5),
    select("equipeResolveProblemas", "A equipe trabalha em conjunto para resolver problemas.", scale5),
  ] },
  { title: "Seção 11: Conhecimento e Habilidades", fields: [
    select("confiancaProdutos", "Em uma escala de 1 a 10, o quanto você se sente confiante em relação ao seu conhecimento sobre os produtos/serviços que a empresa oferece?", scale10),
    textarea("produtosTreinamento", "Quais são os produtos/serviços em que você se sente mais confiante e quais precisam de mais treinamento?"),
    select("confiancaVendas", "Em uma escala de 1 a 10, o quanto você se sente confiante em relação às suas habilidades de vendas?", scale10),
    textarea("habilidadesTreinamento", "Quais são as habilidades que você considera que precisam de mais treinamento ou desenvolvimento?"),
    select("prospeccao", "Prospecção de clientes", scale5),
    select("qualificacao", "Qualificação de leads", scale5),
    select("apresentacaoPropostas", "Apresentação de propostas", scale5),
    select("negociacao", "Negociação", scale5),
    select("fechamento", "Fechamento de vendas", scale5),
  ] },
  { title: "Seção 12: Motivação e Engajamento", fields: [
    select("motivacaoEmpresa", "Em uma escala de 1 a 10, o quanto você se sente motivado para trabalhar na empresa?", scale10),
    textarea("motivacaoDiaria", "O que mais te motiva no trabalho e faz você vir todos os dias?"),
    radio("engajadoObjetivos", "Você se sente engajado com os objetivos da empresa?", ["Sim", "Não", "Parcialmente"]),
    textarea("aumentarMotivacao", "O que a empresa pode fazer para aumentar sua motivação e engajamento?"),
  ] },
  { title: "Seção 13: Sugestões e Melhorias", fields: [
    textarea("sugestoesResultados", "Quais são suas sugestões para melhorar o trabalho da equipe e os resultados da empresa?"),
    textarea("melhoriasClima", "Quais melhorias você sugere para a comunicação, integração e clima de trabalho na equipe?"),
  ] },
]

const wizardSteps = sections.map((section) => section.title.replace(/^Seção \d+: /, ""))

type Colaborador = Record<string, FormDataEntryValue>
type SubmissionResult = {
  success: boolean
  savedCount: number
  failed: Array<{ index: number; memberName: string; reason: string }>
}

function fillForm(form: HTMLFormElement, collaborator: Colaborador) {
  form.reset()
  for (const element of Array.from(form.elements)) {
    if (!(element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement || element instanceof HTMLSelectElement)) continue
    if (!element.name || collaborator[element.name] === undefined) continue

    const value = String(collaborator[element.name])
    if (element instanceof HTMLInputElement && element.type === "radio") {
      element.checked = element.value === value
    } else {
      element.value = value
    }
  }
}

export default function EntrevistaEquipeComercialPage() {
  const formRef = useRef<HTMLFormElement>(null)
  const [colaboradores, setColaboradores] = useState<Colaborador[]>([])
  const [showSuccess, setShowSuccess] = useState(false)
  const [submittedCount, setSubmittedCount] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submissionError, setSubmissionError] = useState("")
  const [wizardResetKey, setWizardResetKey] = useState(0)

  const readForm = () => {
    if (!formRef.current || !formRef.current.reportValidity()) return null
    return Object.fromEntries(new FormData(formRef.current).entries())
  }

  const nextCollaborator = () => {
    const collaborator = readForm()
    if (!collaborator || !formRef.current) return
    setSubmissionError("")
    setColaboradores((current) => [...current, collaborator])
    formRef.current.reset()
    setWizardResetKey((current) => current + 1)
    formRef.current.scrollIntoView({ behavior: "smooth", block: "start" })
  }

  const submitAll = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const form = event.currentTarget
    const collaborator = Object.fromEntries(new FormData(form).entries())
    const allCollaborators = [...colaboradores, collaborator]
    setIsSubmitting(true)
    setSubmissionError("")
    const controller = new AbortController()
    const timeout = window.setTimeout(() => controller.abort(), 60_000)

    try {
      const response = await fetch("/api/form-submissions/entrevista-equipe-comercial", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ colaboradores: allCollaborators }),
        signal: controller.signal,
      })
      const result = (await response.json()) as SubmissionResult

      if (result.failed?.length > 0) {
        const failedIndexes = new Set(result.failed.map((failure) => failure.index))
        const failedCollaborators = allCollaborators.filter((_, index) => failedIndexes.has(index))
        const currentRetry = failedCollaborators.at(-1)

        setColaboradores(failedCollaborators.slice(0, -1))
        if (currentRetry) fillForm(form, currentRetry)
        const failedNames = result.failed.map((failure) => failure.memberName).join(", ")
        setSubmissionError(
          `${result.savedCount} colaborador(es) foram salvos com sucesso. Reenvie apenas: ${failedNames}.`,
        )
        return
      }

      if (!response.ok || !result.success) throw new Error("Erro ao enviar")

      setSubmittedCount(allCollaborators.length)
      setColaboradores([])
      form.reset()
      setShowSuccess(true)
    } catch (error) {
      setSubmissionError(
        error instanceof DOMException && error.name === "AbortError"
          ? "O envio excedeu 60 segundos e foi interrompido. Verifique os registros no painel interno antes de reenviar."
          : "Não foi possível confirmar o envio. Verifique os registros no painel interno antes de tentar novamente.",
      )
    } finally {
      window.clearTimeout(timeout)
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <header className="flex h-20 items-center px-4 md:px-6"><a href="https://www.prospectvendas.com.br" target="_blank" rel="noopener noreferrer"><Image src="/logo.webp" alt="Prospect Vendas" width={200} height={60} className="h-12 w-auto" /></a></header>
      <Dialog open={showSuccess} onOpenChange={setShowSuccess}><DialogContent className="border-slate-700 bg-slate-800 text-white"><DialogHeader><DialogTitle className="flex items-center gap-3 text-2xl text-green-400"><CheckCircle2 className="h-8 w-8" />Entrevistas enviadas!</DialogTitle><DialogDescription className="pt-4 text-gray-300">{submittedCount} {submittedCount === 1 ? "registro foi coletado" : "registros foram coletados"} com sucesso.</DialogDescription></DialogHeader></DialogContent></Dialog>
      <main className="container mx-auto px-4 py-12">
        <div className="mb-12 text-center"><h1 className="mb-4 text-4xl font-bold text-white md:text-5xl">Entrevista Equipe Comercial</h1><p className="text-xl text-gray-300">Informações sobre os membros da equipe comercial</p></div>
        <Card className="mx-auto max-w-4xl border-slate-700 bg-slate-800"><CardHeader><CardTitle className="text-2xl text-white">Entrevista Equipe Comercial</CardTitle><CardDescription className="text-gray-300">{colaboradores.length > 0 ? `${colaboradores.length} colaborador(es) já adicionado(s).` : "Preencha os dados do primeiro colaborador."}</CardDescription></CardHeader><CardContent>
          <form ref={formRef} onSubmit={submitAll} className="space-y-8" autoComplete="off">
            <FormWizard
              steps={wizardSteps}
              submitLabel="Enviar Entrevista Equipe Comercial"
              isSubmitting={isSubmitting}
              resetKey={wizardResetKey}
              secondaryFinalLabel="Próximo Colaborador"
              onSecondaryFinalAction={nextCollaborator}
              finalMessage={submissionError && <p role="alert" className="mt-6 rounded-lg border border-red-900/70 bg-red-950/40 px-4 py-3 text-sm leading-6 text-red-300">{submissionError}</p>}
            >
              {sections.map((section) => <InterviewSectionBlock key={section.title} section={section} />)}
            </FormWizard>
          </form>
        </CardContent></Card>
      </main>
    </div>
  )
}
