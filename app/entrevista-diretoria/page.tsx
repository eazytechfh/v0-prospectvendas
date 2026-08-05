"use client"

import { useState } from "react"
import Image from "next/image"
import { CheckCircle2 } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { FormWizard } from "@/components/form-wizard"
import { InterviewFieldControl, InterviewSectionBlock, type InterviewSection } from "@/components/interview-form-fields"

const sections: InterviewSection[] = [
  { title: "Informações Básicas", fields: [
    { name: "data", question: "Data", kind: "date", required: true },
    { name: "consultor", question: "Consultor", kind: "text", required: true },
    { name: "cliente", question: "Cliente (Nome da Empresa)", kind: "text", required: true },
    { name: "telefone", question: "Qual o telefone de contato?", kind: "text", required: true },
    { name: "cnpj", question: "Qual o CNPJ da empresa?", kind: "text", required: true },
    { name: "areaAtuacao", question: "Área de atuação?", kind: "text", required: true },
    { name: "faturamentoAnual", question: "Faturamento Anual Bruto?", kind: "text", required: true },
    { name: "numeroFuncionarios", question: "Número de Funcionários?", kind: "text", required: true },
    { name: "numeroClientes", question: "Quantos clientes a empresa possui atualmente?", kind: "text", required: true },
    { name: "processoComercial", question: "Como é o processo comercial da empresa?", kind: "textarea", required: true },
  ] },
  { title: "Seção 1: História e Propósito", fields: [
    { name: "historiaMarcos", question: "1.1. Quais os principais marcos e eventos que moldaram a história da sua empresa? Quais desafios e conquistas mais te marcaram?", kind: "textarea" },
    { name: "proposito", question: "1.2. O que mais te movimenta como empreendedor/gestor(a)? Qual é o verdadeiro propósito desta empresa, além do lucro?", kind: "textarea" },
    { name: "legado", question: "1.3. Se sua empresa deixasse de existir, que legado gostaria que fosse lembrado?", kind: "textarea" },
  ] },
  { title: "Seção 2: Cultura e Valores", fields: [
    { name: "clima", question: "2.1. Como é o clima do ambiente de trabalho? Como sua equipe se relaciona?", kind: "textarea" },
    { name: "valores", question: "2.2. Quais são os valores inegociáveis dentro da empresa? Cite exemplos práticos de como eles aparecem no dia a dia.", kind: "textarea" },
  ] },
  { title: "Seção 3: Estratégia e Objetivos", fields: [
    { name: "objetivos", question: "3.1. Quais são os principais objetivos comerciais para os próximos 6 a 12 meses?", kind: "textarea" },
    { name: "metricasSucesso", question: "3.2. Quais são suas principais métricas de sucesso?", kind: "textarea" },
    { name: "propostaValor", question: "3.3. O que diferencia a sua proposta de valor em relação à concorrência?", kind: "textarea" },
    { name: "clienteIdeal", question: "3.4. Descreva o perfil do seu cliente ideal (ICP).", kind: "textarea" },
  ] },
  { title: "Seção 4: Desafios e Dores", fields: [
    { name: "desafiosCriticos", question: "4.1. Quais desafios mais críticos sua empresa enfrenta atualmente?", kind: "textarea" },
    { name: "gargalosComercial", question: "4.2. No comercial, quais são os principais gargalos? O que mais gera frustrações?", kind: "textarea" },
    { name: "solucoesTestadas", question: "4.3. O que já foi testado para solucionar esses pontos? Teve algum resultado relevante?", kind: "textarea" },
  ] },
  { title: "Seção 5: Oportunidades e Sonhos", fields: [
    { name: "oportunidades", question: "5.1. Quais novas oportunidades você enxerga para futuro crescimento?", kind: "textarea" },
    { name: "sonho", question: "5.2. Se pudesse sonhar alto, onde gostaria de ver a empresa em 2-3 anos?", kind: "textarea" },
  ] },
  { title: "Seção 6: Resultados & Métricas", fields: [
    { name: "indicadores", question: "6.1. Quais indicadores você acompanha regularmente?", kind: "textarea" },
    { name: "metasBenchmarks", question: "6.2. Quais metas e benchmarks são prioridade neste ciclo?", kind: "textarea" },
  ] },
  { title: "Seção 8: Equipe Comercial e Liderança", fields: [
    { name: "composicaoEquipe", question: "8.1. Como é composta sua equipe comercial?", kind: "textarea" },
    { name: "talentosDesafios", question: "8.2. Quais talentos se destacam e quais desafios aparecem mais?", kind: "textarea" },
    { name: "incentivos", question: "8.3. Quais tipos de incentivos ou programas de motivação são praticados?", kind: "textarea" },
    { name: "lideranca", question: "8.4. Como descreve seu próprio estilo de liderança e relação com o time?", kind: "textarea" },
  ] },
  { title: "Seção 9: Processo Comercial", fields: [
    { name: "fluxoComercial", question: "9.1. Descreva o fluxo atual do processo comercial, do primeiro contato ao pós-venda:", kind: "textarea" },
    { name: "integracaoAreas", question: "9.2. Como as áreas de marketing, vendas e operação se integram?", kind: "textarea" },
    { name: "canaisClientes", question: "9.3. Quais canais trazem mais clientes hoje?", kind: "textarea" },
  ] },
  { title: "Seção 10: Marketing & Vendas", fields: [
    { name: "estrategiasDivulgacao", question: "10.1. Quais estratégias e canais de divulgação são mais potentes hoje? Exemplos práticos:", kind: "textarea" },
    { name: "processoEstruturado", question: "10.2. Seu comercial segue roteiro, metodologia ou processo estruturado? Qual?", kind: "textarea" },
  ] },
  { title: "Seção 11: Tecnologia & Inovação", fields: [
    { name: "tecnologias", question: "11.1. Quais tecnologias e ferramentas são essenciais para a rotina comercial e gestão?", kind: "textarea" },
    { name: "inovacao", question: "11.2. Como a empresa busca inovação e ganhos de eficiência?", kind: "textarea" },
    { name: "tendencias", question: "11.3. Quais tendências do mercado avalia como ameaça ou oportunidade?", kind: "textarea" },
  ] },
  { title: "Seção 12: Jornada, Experiência do Cliente e Feedback", fields: [
    { name: "jornadaCliente", question: "12.1. Explique a jornada completa do seu cliente, passo a passo:", kind: "textarea" },
    { name: "pontosContato", question: "12.2. Principais pontos de contato e possíveis atritos. Como monitoram e corrigem?", kind: "textarea" },
    { name: "feedback", question: "12.3. Como coletam feedback dos clientes? Com que frequência?", kind: "textarea" },
    { name: "experienciaQualidade", question: "12.4. O que mais garante uma experiência de alta qualidade ao cliente?", kind: "textarea" },
  ] },
  { title: "Seção 13: Concorrência, Benchmark & Diferenciação", fields: [
    { name: "concorrentes", question: "13.1. Principais concorrentes diretos/indiretos:", kind: "textarea" },
    { name: "diferenciacao", question: "13.2. O que diferencia sua empresa no mercado?", kind: "textarea" },
    { name: "percepcao", question: "13.3. Como gostaria de ser percebido por seus clientes e pelo mercado?", kind: "textarea" },
    { name: "comparacao", question: "13.4. Comparação rápida com concorrência: Preço / Serviços / Experiência do Cliente", kind: "textarea" },
    { name: "inspiracaoConcorrentes", question: "13.5. O que vê de positivo nos concorrentes que podem inspirar seu crescimento?", kind: "textarea" },
  ] },
]

const baseClientesSection: InterviewSection = { title: "Seção 7: Base de Clientes e Dados", fields: [
  { name: "clientesAtivosInativos", question: "7.2. Número de clientes ativos/inativos e principais critérios:", kind: "textarea" },
  { name: "mediaNovosClientes", question: "7.3. Média mensal de novos clientes e canais de aquisição principais:", kind: "textarea" },
  { name: "dadosEssenciais", question: "7.4. Quais dados/plataformas analíticas são essenciais na gestão e tomada de decisão?", kind: "textarea" },
] }

const wizardSteps = [
  "Informações Básicas",
  "História e Propósito",
  "Cultura e Valores",
  "Estratégia e Objetivos",
  "Desafios e Dores",
  "Oportunidades e Sonhos",
  "Resultados & Métricas",
  "Base de Clientes e Dados",
  "Equipe Comercial e Liderança",
  "Processo Comercial",
  "Marketing & Vendas",
  "Tecnologia & Inovação",
  "Jornada e Experiência do Cliente",
  "Concorrência e Diferenciação",
]

export default function EntrevistaDiretoriaPage() {
  const [utilizaCrm, setUtilizaCrm] = useState("")
  const [showSuccess, setShowSuccess] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsSubmitting(true)

    try {
      const payload = Object.fromEntries(new FormData(event.currentTarget).entries())
      const response = await fetch("/api/form-submissions/entrevista-diretoria", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      if (!response.ok) throw new Error("Erro ao enviar")
      setShowSuccess(true)
    } catch {
      alert("Erro ao enviar a entrevista. Tente novamente.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <header className="flex h-20 items-center px-4 md:px-6"><a href="https://www.prospectvendas.com.br" target="_blank" rel="noopener noreferrer"><Image src="/logo.webp" alt="Prospect Vendas" width={200} height={60} className="h-12 w-auto" /></a></header>
      <Dialog open={showSuccess} onOpenChange={setShowSuccess}><DialogContent className="border-slate-700 bg-slate-800 text-white"><DialogHeader><DialogTitle className="flex items-center gap-3 text-2xl text-green-400"><CheckCircle2 className="h-8 w-8" />Entrevista enviada!</DialogTitle><DialogDescription className="pt-4 text-gray-300">As informações da entrevista da diretoria foram recebidas.</DialogDescription></DialogHeader></DialogContent></Dialog>
      <main className="container mx-auto px-4 py-12">
        <div className="mb-12 text-center"><h1 className="mb-4 text-4xl font-bold text-white md:text-5xl">Entrevista Diretoria</h1><p className="text-xl text-gray-300">Avaliação estratégica e operacional da empresa</p></div>
        <Card className="mx-auto max-w-4xl border-slate-700 bg-slate-800"><CardHeader><CardTitle className="text-2xl text-white">Entrevista Diretoria</CardTitle><CardDescription className="text-gray-300">Preencha as informações abaixo.</CardDescription></CardHeader><CardContent>
          <form onSubmit={handleSubmit} className="space-y-8" autoComplete="off">
            <FormWizard steps={wizardSteps} submitLabel="Enviar Entrevista Diretoria" isSubmitting={isSubmitting}>
              {sections.slice(0, 7).map((section) => <InterviewSectionBlock key={section.title} section={section} />)}
              <section className="space-y-6 rounded-lg bg-slate-700 p-6"><h2 className="border-b border-yellow-600 pb-3 text-xl font-semibold text-yellow-400">{baseClientesSection.title}</h2><InterviewFieldControl field={{ name: "utilizaCrm", question: "7.1. Utiliza sistema CRM?", kind: "radio", options: ["Sim", "Não"] }} value={utilizaCrm} onValueChange={setUtilizaCrm} />{utilizaCrm === "Sim" && <InterviewFieldControl field={{ name: "qualCrm", question: "Se sim, qual CRM utiliza?", kind: "text" }} />}{baseClientesSection.fields.map((field) => <InterviewFieldControl key={field.name} field={field} />)}</section>
              {sections.slice(7).map((section) => <InterviewSectionBlock key={section.title} section={section} />)}
            </FormWizard>
          </form>
        </CardContent></Card>
      </main>
    </div>
  )
}
