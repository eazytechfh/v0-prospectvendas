"use client"

import type React from "react"

import { useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { CheckCircle2 } from "lucide-react"

type FieldProps = {
  id: string
  label: string
  example?: string
  required?: boolean
  type?: React.HTMLInputTypeAttribute
}

function ShortField({ id, label, example, required = true, type = "text" }: FieldProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id} className="text-white">{label}{required && " *"}</Label>
      {example && <p className="text-sm italic text-gray-400">{example}</p>}
      <Input id={id} name={id} type={type} required={required} autoComplete="off" className="bg-slate-600 border-slate-500 text-white" />
    </div>
  )
}

function LongField({ id, label, example }: Omit<FieldProps, "required" | "type">) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id} className="text-white">{label} *</Label>
      {example && <p className="text-sm italic text-gray-400">{example}</p>}
      <Textarea id={id} name={id} required rows={4} className="bg-slate-600 border-slate-500 text-white" />
    </div>
  )
}

const canaisOptions = [
  "Indicação",
  "Redes Sociais (Instagram, LinkedIn, etc.)",
  "Pesquisa no Google / Site",
  "Prospecção Ativa (Ligar a frio, Abordagem direta no WhatsApp, etc.)",
  "Eventos e Feiras",
  "Outros",
]

export default function ProspectForms() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSuccessDialog, setShowSuccessDialog] = useState(false)
  const [canaisAquisicao, setCanaisAquisicao] = useState<string[]>([])
  const [processoIntegrado, setProcessoIntegrado] = useState("")
  const [possuiCRM, setPossuiCRM] = useState("")

  const toggleCanal = (value: string, checked: boolean) => {
    setCanaisAquisicao((current) => checked ? [...current, value] : current.filter((item) => item !== value))
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (canaisAquisicao.length === 0) {
      alert("Selecione pelo menos um canal de aquisição.")
      return
    }

    setIsSubmitting(true)
    const formData = new FormData(e.currentTarget)
    const data = Object.fromEntries(formData.entries()) as Record<string, FormDataEntryValue | string[]>
    data.canaisAquisicao = canaisAquisicao

    try {
      const response = await fetch("https://eazytech-n8n.gsl3ku.easypanel.host/webhook/cc42a81b-dde0-4c76-8147-6545ab18c8e1", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      if (!response.ok) throw new Error("Erro ao enviar")
      setShowSuccessDialog(true)
    } catch {
      alert("Erro ao enviar o formulário. Tente novamente.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <header className="flex h-20 w-full items-center justify-between px-4 md:px-6">
        <a href="https://www.prospectvendas.com.br" target="_blank" rel="noopener noreferrer" className="flex items-center">
          <Image src="/logo.webp" alt="Prospect Vendas" width={200} height={60} className="h-12 w-auto" />
        </a>
      </header>

      <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <DialogContent className="bg-slate-800 border-slate-700 text-white">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3 text-2xl text-green-400"><CheckCircle2 className="h-8 w-8" />Formulário Enviado com Sucesso!</DialogTitle>
            <DialogDescription className="pt-4 text-lg text-gray-300">Suas informações foram recebidas corretamente. Em breve nossa equipe entrará em contato para dar continuidade ao processo.</DialogDescription>
          </DialogHeader>
          <div className="mt-4 flex justify-end">
            <Button onClick={() => setShowSuccessDialog(false)} className="bg-gradient-to-r from-yellow-500 to-yellow-600 font-bold text-slate-900 hover:from-yellow-600 hover:to-yellow-700">Fechar</Button>
          </div>
        </DialogContent>
      </Dialog>

      <main className="container mx-auto px-4 py-12">
        <div className="mb-12 text-center">
          <h1 className="mb-6 text-4xl font-bold text-white md:text-5xl">Formulário de Avaliação</h1>
          <p className="mx-auto max-w-3xl text-xl text-gray-300">Preencha o formulário abaixo para avaliarmos suas necessidades e identificarmos oportunidades de melhoria em seu processo comercial.</p>
        </div>

        <div className="mx-auto max-w-4xl">
          <Card className="border-slate-700 bg-slate-800">
            <CardHeader>
              <CardTitle className="text-2xl text-white">Briefing de Diagnóstico Comercial: Entrevista com a Diretoria</CardTitle>
              <CardDescription className="text-gray-300">Avaliação estratégica e operacional da empresa</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-8" autoComplete="off">
                <section className="space-y-4 rounded-lg bg-slate-700 p-6">
                  <h2 className="mb-4 text-xl font-semibold text-yellow-400">Informações Básicas e Raio-X do Negócio</h2>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <ShortField id="nomeResponsavel" label="Nome do Responsável / Contato" />
                    <ShortField id="nomeFantasia" label="Nome da Empresa (Nome Fantasia)" />
                  </div>
                  <ShortField id="razaoSocial" label="Razão Social" />
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <ShortField id="cnpj" label="CNPJ" />
                    <ShortField id="telefoneContato" label="Telefone / WhatsApp do Contato Principal" type="tel" />
                  </div>
                  <ShortField id="enderecoEmpresa" label="Endereço completo da Empresa" />
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <ShortField id="site" label="Link do Site (Se tiver)" required={false} />
                    <ShortField id="linkedin" label="Link do LinkedIn (Se tiver)" required={false} />
                  </div>
                  <ShortField id="instagram" label="Arroba do Instagram" example="Ex: @suaempresa" />
                  <ShortField id="faturamentoMensal" label="Qual é o seu faturamento mensal atual? (Considere a média dos últimos 3 meses)" />
                  <ShortField id="novasVendasMensais" label="Quantas novas vendas (novos contratos) a empresa fecha, em média, por mês atualmente, e quantas vocês gostariam de fechar?" example="Ex: Fechamos 2 por mês, mas a meta é fechar 5 por mês" />
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    <ShortField id="clientesAtivos" label="Quantos clientes ativos a empresa possui atualmente?" type="number" />
                    <ShortField id="totalColaboradores" label="Qual o número total de colaboradores na empresa hoje?" type="number" />
                    <ShortField id="equipeVendaAtiva" label="Desse total, qual o número de pessoas focadas exclusivamente em vendas (venda ativa)?" type="number" />
                  </div>
                </section>

                <section className="space-y-6 rounded-lg bg-slate-700 p-6">
                  <h2 className="text-xl font-semibold text-yellow-400">Seção 1: Visão Estratégica e Objetivos</h2>
                  <p className="text-sm italic text-gray-300">Foco: Para onde a empresa está indo</p>
                  <LongField id="metaCrescimentoReceita" label="1.1. Qual é a meta de crescimento de receita para este ano e para os próximos 3 anos?" example="Ex: Crescer 20% em receita este ano e dobrar o faturamento nos próximos 3 anos." />
                  <LongField id="visaoLongoPrazo" label="1.2. Qual é a visão de longo prazo para a empresa? Como vocês enxergam o negócio no futuro?" example="Ex: Ser a maior referência do nosso serviço no estado; ou, expandir para atendimento nacional." />
                  <LongField id="alinhamentoComercial" label="1.3. Como o setor comercial se alinha e contribui com essa visão geral da empresa hoje?" example="Ex: O comercial hoje foca apenas em apagar incêndios e fechar qualquer venda; ou, o comercial foca em trazer apenas clientes do perfil ideal para garantir nosso crescimento seguro." />
                </section>

                <section className="space-y-6 rounded-lg bg-slate-700 p-6">
                  <h2 className="text-xl font-semibold text-yellow-400">Seção 2: Mercado e Posicionamento</h2>
                  <p className="text-sm italic text-gray-300">Foco: Onde a empresa compete e por que ela ganha</p>
                  <LongField id="clienteIdeal" label="2.1. Como vocês descrevem o cliente ideal da empresa hoje (ICP - Perfil de Cliente Ideal)?" example="Ex: Empresas de médio porte do setor varejista, que faturam acima de R$ 1 milhão e têm problemas de logística." />
                  <LongField id="diferencial" label="2.2. Por que os clientes escolhem o serviço de vocês e não o dos concorrentes? (Qual o seu diferencial?)" example="Ex: Nosso diferencial é o atendimento humanizado 24h e a rapidez na entrega." />
                  <LongField id="principaisConcorrentes" label="2.3. Quem são seus principais concorrentes hoje?" example="Ex: Empresa X, Clínica Y e Loja Z." />
                  <LongField id="motivosPerdaVendas" label="2.4. Por que vocês acabam perdendo vendas (negócios perdidos) para esses concorrentes?" example="Ex: Perdemos muito pelo nosso preço ser mais alto; ou, perdemos porque eles têm mais tempo de mercado e o cliente sente mais segurança neles." />
                  <LongField id="objecoesClientes" label="2.5. Quando um cliente está pensando em contratar vocês, quais são as principais objeções e desculpas que ele dá para não fechar?" example={'Ex: "Achei caro", "Preciso falar com meu sócio", "Vou deixar para o mês que vem".'} />
                  <LongField id="tratamentoObjecoes" label="2.6. Como a sua equipe lida com essas objeções no dia a dia?" example="Ex: Nós geralmente damos desconto para não perder a venda; ou, temos um roteiro pronto onde mostramos que nosso serviço dá mais retorno que o do concorrente." />
                </section>

                <section className="space-y-6 rounded-lg bg-slate-700 p-6">
                  <h2 className="text-xl font-semibold text-yellow-400">Seção 3: Processo de Aquisição e Venda</h2>
                  <p className="text-sm italic text-gray-300">Foco: O &apos;Como&apos; - A jornada prática do cliente</p>
                  <div className="space-y-3">
                    <Label className="text-white">3.1. De onde vem a maioria dos seus clientes hoje? (Selecione as opções) *</Label>
                    {canaisOptions.map((option) => (
                      <div key={option} className="flex items-center gap-2">
                        <Checkbox id={`canal-${option}`} checked={canaisAquisicao.includes(option)} onCheckedChange={(checked) => toggleCanal(option, checked === true)} className="border-gray-400 data-[state=checked]:bg-yellow-500 data-[state=checked]:text-slate-900" />
                        <Label htmlFor={`canal-${option}`} className="cursor-pointer text-white">{option}</Label>
                      </div>
                    ))}
                  </div>
                  <ShortField id="taxaConversao" label="3.2. Qual é a sua taxa de conversão média? De cada 10 propostas que vocês enviam, quantas viram vendas de fato?" example="Ex: Enviamos 10 propostas e fechamos 3 vendas, ou seja, taxa de 30%." />
                  <div className="space-y-3">
                    <Label className="text-white">3.3. O setor comercial segue um processo estruturado e tem integração com os esforços de marketing e operações? *</Label>
                    <RadioGroup name="processoIntegrado" value={processoIntegrado} onValueChange={setProcessoIntegrado} required className="space-y-3">
                      {["Não", "Sim"].map((option) => <div key={option} className="flex items-center gap-2"><RadioGroupItem value={option} id={`integracao-${option}`} className="border-gray-400 text-yellow-400" /><Label htmlFor={`integracao-${option}`} className="cursor-pointer text-white">{option}</Label></div>)}
                    </RadioGroup>
                  </div>
                  {processoIntegrado === "Sim" && <LongField id="descricaoIntegracao" label="Como funciona essa integração?" example="Ex: O marketing gera o contato através de anúncios, envia para a planilha do comercial e o comercial liga no mesmo dia." />}
                  <ShortField id="cicloVendas" label="3.4. Qual é o tempo médio do seu Ciclo de Vendas (quanto tempo leva entre o primeiro contato com o cliente até a assinatura do contrato/pagamento)?" example="Ex: Geralmente demora 2 semanas; ou, varia de 1 a 3 meses dependendo do tamanho da empresa." />
                </section>

                <section className="space-y-6 rounded-lg bg-slate-700 p-6">
                  <h2 className="text-xl font-semibold text-yellow-400">Seção 4: Equipe Comercial e Gestão</h2>
                  <p className="text-sm italic text-gray-300">Foco: O &apos;Quem&apos; - As pessoas que executam o processo</p>
                  <LongField id="estruturaEquipeComercial" label="4.1. Como a sua equipe comercial está dividida hoje? Quais são as funções?" example="Ex: Tenho 1 pessoa só para prospectar e agendar reuniões e 2 vendedores que fazem o fechamento e negociação." />
                  <LongField id="remuneracaoVariavel" label="4.2. Existe um modelo de remuneração variável ou comissões? Se sim, como funciona de forma resumida?" example="Ex: Sim, salário fixo de R$ 2.000 + 5% de comissão por cada contrato novo fechado." />
                  <LongField id="treinamentoVendedores" label="4.3. Como vocês treinam os vendedores novos e como atualizam os vendedores antigos?" example="Ex: O novo vendedor acompanha o mais velho por 15 dias; não temos treinamento formal, ele aprende na prática." />
                </section>

                <section className="space-y-6 rounded-lg bg-slate-700 p-6">
                  <h2 className="text-xl font-semibold text-yellow-400">Seção 5: Tecnologia e Ferramentas (Tech Stack)</h2>
                  <p className="text-sm italic text-gray-300">Foco: As ferramentas que dão suporte à operação</p>
                  <LongField id="ferramentasVendas" label="5.1. Quais ferramentas e softwares a equipe de vendas utiliza no dia a dia?" example="Ex: Usamos o RD Station para marketing, Trello para organizar tarefas e WhatsApp Business para contato." />
                  <div className="space-y-3">
                    <Label className="text-white">5.2. Vocês utilizam algum sistema de CRM (Sistema de controle de relacionamento com o cliente)? *</Label>
                    <RadioGroup name="possuiCRM" value={possuiCRM} onValueChange={setPossuiCRM} required className="space-y-3">
                      <div className="flex items-start gap-2"><RadioGroupItem value="Não" id="crm-nao" className="mt-1 border-gray-400 text-yellow-400" /><Label htmlFor="crm-nao" className="cursor-pointer text-white">Não, gerenciamos por planilhas (Excel/Google Sheets), cadernos ou direto no WhatsApp.</Label></div>
                      <div className="flex items-center gap-2"><RadioGroupItem value="Sim" id="crm-sim" className="border-gray-400 text-yellow-400" /><Label htmlFor="crm-sim" className="cursor-pointer text-white">Sim. Qual?</Label></div>
                    </RadioGroup>
                  </div>
                  {possuiCRM === "Sim" && <ShortField id="qualCRM" label="Qual CRM vocês utilizam?" example="Ex: Pipedrive, HubSpot, RD CRM, Moskit." />}
                </section>

                <section className="space-y-6 rounded-lg bg-slate-700 p-6">
                  <h2 className="text-xl font-semibold text-yellow-400">Seção 6: Desafios e Obstáculos</h2>
                  <p className="text-sm italic text-gray-300">Foco: Os problemas a serem resolvidos</p>
                  <LongField id="maiorGargalo" label="6.1. Qual é o maior gargalo (dificuldade) do comercial hoje que impede vocês de crescerem mais rápido?" example="Ex: Nossa maior dificuldade é atrair clientes qualificados, só chega gente pedindo desconto e sem dinheiro." />
                  <LongField id="preocupacaoVendas" label="6.2. O que tem tirado o seu sono ultimamente em relação às vendas da empresa?" example="Ex: A dependência exclusiva de indicações; se não nos indicarem ninguém, nós não batemos a meta naquele mês." />
                </section>

                <Button type="submit" disabled={isSubmitting} className="w-full bg-yellow-600 py-3 text-lg font-semibold text-black hover:bg-yellow-700">{isSubmitting ? "Enviando..." : "Enviar Formulário"}</Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>

      <footer className="mt-16 border-t border-slate-700 bg-slate-900 py-8"><div className="container mx-auto px-4 text-center"><p className="text-gray-400">© 2025 Prospect Vendas. Todos os direitos reservados.</p></div></footer>
    </div>
  )
}
