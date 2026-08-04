"use client"

import type React from "react"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { CheckCircle2 } from "lucide-react"

export default function DiagnosticoContabilidade() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSuccessDialog, setShowSuccessDialog] = useState(false)
  const [formData, setFormData] = useState({
    // Seção 1: Identidade e Raízes
    nomeEscritorio: "",
    nomeContatoprincipal: "",
    cnpj: "",
    telefone: "",
    endereçoDoescritorio: "",
    site: "",
    linkedin: "",
    instagram: "",
    principalAreaAtuacao: "",
    faturamentoMensal: "",
    numeroColaboradores: "",
    numeroColaboradorescomercial: "",
    numeroClientesAtivos: "",
    numeroEquipeVendaAtiva: "",
    novasVendasMensais: "",
    missaoEscritorio: "",
    marcoDesafio: "",

    // Seção 2: Estratégia e Objetivos
    objetivosComerciais: [] as string[],
    indicadoresDesempenho: [] as string[],
    diferenciacaoMercado: "",

    // Seção 3: Cliente Ideal
    segmentoNicho: "",
    porteRegime: "",
    principalDor: "",

    // Seção 4: Máquina de Vendas
    canaisAquisicao: [] as string[],
    jornadaVenda: "",
    responsavelVenda: "",
    estiloLideranca: "",

    // Seção 5: Desafios e Oportunidades
    gargalosDesafios: [] as string[],
    concorrentes: "",
    visaoFuturo: "",

    // Seção 6: Tecnologia
    ferramentasUtilizadas: "",
    utilizaCRM: "",
    qualCRM: "",
    campanhasPagas: [] as string[],
  })

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleCheckboxChange = (field: "objetivosComerciais" | "indicadoresDesempenho" | "canaisAquisicao" | "gargalosDesafios" | "campanhasPagas", value: string, checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      [field]: checked ? [...prev[field], value] : prev[field].filter((item) => item !== value),
    }))
  }

  const checkboxGroups = [
    formData.objetivosComerciais,
    formData.indicadoresDesempenho,
    formData.canaisAquisicao,
    formData.gargalosDesafios,
    formData.campanhasPagas,
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (checkboxGroups.some((group) => group.length === 0)) {
      alert("Selecione pelo menos uma opção em cada grupo de múltipla escolha.")
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch("https://eazytech-n8n.gsl3ku.easypanel.host/webhook/contabilidade", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        setShowSuccessDialog(true)
      } else {
        throw new Error("Erro ao enviar")
      }
    } catch (error) {
      alert("Erro ao enviar diagnóstico. Por favor, tente novamente.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <header className="flex h-20 w-full items-center justify-between px-4 md:px-6">
        <a
          href="https://www.prospectvendas.com.br"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center"
        >
          <Image src="/logo.webp" alt="Prospect Vendas" width={200} height={60} className="h-12 w-auto" />
        </a>
      </header>

      <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <DialogContent className="bg-slate-800 border-slate-700 text-white">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3 text-2xl text-green-400">
              <CheckCircle2 className="h-8 w-8" />
              Diagnóstico Enviado com Sucesso!
            </DialogTitle>
            <DialogDescription className="text-gray-300 text-lg pt-4">
              Suas informações foram recebidas corretamente. Em breve nossa equipe entrará em contato com a análise
              completa do seu escritório.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end mt-4">
            <Button
              onClick={() => setShowSuccessDialog(false)}
              className="bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-slate-900 font-bold"
            >
              Fechar
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">Diagnóstico Estratégico</h1>
          <p className="text-lg text-gray-300 max-w-4xl mx-auto leading-relaxed mb-4">
            Este formulário é o ponto de partida para a elaboração do seu Diagnóstico Estratégico de Análise do seu
            Processo Comercial. O objetivo deste levantamento é coletar informações-chave sobre sua estratégia, operação
            comercial e desafios atuais.
          </p>
          <p className="text-base text-gray-400 max-w-4xl mx-auto leading-relaxed">
            Suas respostas são a matéria-prima para construirmos uma análise aprofundada que revelará os pontos fortes,
            gargalos e as principais oportunidades de crescimento para o seu negócio. O resultado final será um plano
            claro e acionável, projetado para otimizar seu desempenho e acelerar seus resultados.
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white text-2xl">Questionário de Diagnóstico</CardTitle>
              <CardDescription className="text-gray-300">
                Para garantir a precisão da nossa análise, pedimos que dedique tempo a este preenchimento. A qualidade
                do diagnóstico está diretamente ligada à profundidade das suas respostas.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-8">
                {/* Seção 1: Identidade e Raízes do Escritório */}
                <div className="space-y-6">
                  <div className="border-b border-yellow-600 pb-2">
                    <h2 className="text-2xl font-bold text-yellow-400">Seção 1: Identidade e Raízes do Escritório</h2>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-xl font-semibold text-white">1.1. Informações de Contato</h3>

                    <div className="space-y-2">
                      <Label htmlFor="nomeEscritorio" className="text-gray-300">
                        Nome do Escritório:
                      </Label>
                      <Input
                        id="nomeEscritorio"
                        value={formData.nomeEscritorio}
                        onChange={(e) => handleInputChange("nomeEscritorio", e.target.value)}
                        className="bg-slate-700 border-slate-600 text-white"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="nomeContatoprincipal" className="text-gray-300">
                        Nome do Contato Principal:
                      </Label>
                      <Input
                        id="nomeContatoprincipal"
                        value={formData.nomeContatoprincipal}
                        onChange={(e) => handleInputChange("nomeContatoprincipal", e.target.value)}
                        className="bg-slate-700 border-slate-600 text-white"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="cnpj" className="text-gray-300">
                        CNPJ:
                      </Label>
                      <Input
                        id="cnpj"
                        value={formData.cnpj}
                        onChange={(e) => handleInputChange("cnpj", e.target.value)}
                        className="bg-slate-700 border-slate-600 text-white"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="telefone" className="text-gray-300">
                        Telefone Principal:
                      </Label>
                      <Input
                        id="telefone"
                        value={formData.telefone}
                        onChange={(e) => handleInputChange("telefone", e.target.value)}
                        className="bg-slate-700 border-slate-600 text-white"
                        required
                      />
                    </div>

                                                             <div className="space-y-2">
                      <Label htmlFor="endereçoDoescritorio" className="text-gray-300">
                        Endereço do escritório:
                      </Label>
                      <Input
                        id="endereçoDoescritorio"
                        value={formData.endereçoDoescritorio}
                        onChange={(e) => handleInputChange("endereçoDoescritorio", e.target.value)}
                        className="bg-slate-700 border-slate-600 text-white"
                      />
                      <p className="text-sm text-gray-400">Ex: Rua Exemplo, 123 - Centro, Rio de Janeiro/RJ</p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="site" className="text-gray-300">
                        Link do Site:
                      </Label>
                      <Input
                        id="site"
                        value={formData.site}
                        onChange={(e) => handleInputChange("site", e.target.value)}
                        className="bg-slate-700 border-slate-600 text-white"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="linkedin" className="text-gray-300">
                        Link do LinkedIn (se tiver):
                      </Label>
                      <Input
                        id="linkedin"
                        value={formData.linkedin}
                        onChange={(e) => handleInputChange("linkedin", e.target.value)}
                        className="bg-slate-700 border-slate-600 text-white"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="instagram" className="text-gray-300">
                        Arroba do Instagram:
                      </Label>
                      <p className="text-sm text-gray-400">Ex: @suacontabilidade</p>
                      <Input
                        id="instagram"
                        value={formData.instagram}
                        onChange={(e) => handleInputChange("instagram", e.target.value)}
                        className="bg-slate-700 border-slate-600 text-white"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-xl font-semibold text-white">1.2. Raio-X do Negócio</h3>

                    <div className="space-y-2">
                      <Label htmlFor="principalAreaAtuacao" className="text-gray-300">
                        Principal Área de Atuação:
                      </Label>
                      <p className="text-sm text-gray-400">Ex: Contabilidade para PMEs, BPO Financeiro, Nicho de saúde</p>
                      <Input
                        id="principalAreaAtuacao"
                        value={formData.principalAreaAtuacao}
                        onChange={(e) => handleInputChange("principalAreaAtuacao", e.target.value)}
                        className="bg-slate-700 border-slate-600 text-white"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="faturamentoMensal" className="text-gray-300">
                        Qual é o seu faturamento mensal atual? (Considere a média dos últimos 3 meses)
                      </Label>
                      <Input
                        id="faturamentoMensal"
                        value={formData.faturamentoMensal}
                        onChange={(e) => handleInputChange("faturamentoMensal", e.target.value)}
                        className="bg-slate-700 border-slate-600 text-white"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="numeroColaboradores" className="text-gray-300">
                        Número Total de Colaboradores:
                      </Label>
                      <p className="text-sm text-gray-400">Ex: 12 no total</p>
                      <Input
                        id="numeroColaboradores"
                        value={formData.numeroColaboradores}
                        onChange={(e) => handleInputChange("numeroColaboradores", e.target.value)}
                        className="bg-slate-700 border-slate-600 text-white"
                        required
                      />
                    </div>

                                        <div className="space-y-2">
                      <Label htmlFor="numeroColaboradorescomercial" className="text-gray-300">
                        Número de Colaboradores (Comercial):
                      </Label>
                      <p className="text-sm text-gray-400">Ex: 2 no comercial</p>
                      <Input
                        id="numeroColaboradorescomercial"
                        value={formData.numeroColaboradorescomercial}
                        onChange={(e) => handleInputChange("numeroColaboradorescomercial", e.target.value)}
                        className="bg-slate-700 border-slate-600 text-white"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="numeroClientesAtivos" className="text-gray-300">
                        Qual é o seu número de clientes ativos hoje?
                      </Label>
                      <Input
                        id="numeroClientesAtivos"
                        value={formData.numeroClientesAtivos}
                        onChange={(e) => handleInputChange("numeroClientesAtivos", e.target.value)}
                        className="bg-slate-700 border-slate-600 text-white"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="numeroEquipeVendaAtiva" className="text-gray-300">
                        Qual o número de pessoas na equipe focadas exclusivamente em vendas (venda ativa)?
                      </Label>
                      <Input id="numeroEquipeVendaAtiva" value={formData.numeroEquipeVendaAtiva} onChange={(e) => handleInputChange("numeroEquipeVendaAtiva", e.target.value)} className="bg-slate-700 border-slate-600 text-white" required />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="novasVendasMensais" className="text-gray-300">
                        Quantas novas vendas (novos contratos) sua contabilidade fecha, em média, por mês atualmente, e quantas vocês gostariam de fechar?
                      </Label>
                      <p className="text-sm text-gray-400">Ex: Fechamos 2 por mês, mas a meta é fechar 5 por mês</p>
                      <Textarea id="novasVendasMensais" value={formData.novasVendasMensais} onChange={(e) => handleInputChange("novasVendasMensais", e.target.value)} className="bg-slate-700 border-slate-600 text-white min-h-[80px]" required />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-xl font-semibold text-white">1.3. Propósito e Legado</h3>

                    <div className="space-y-2">
                      <Label htmlFor="missaoEscritorio" className="text-gray-300">
                        Além do compliance, qual é a missão do seu escritório?
                      </Label>
                      <p className="text-sm text-gray-400">Ex: Ser o braço direito estratégico do empresário, usando os números para gerar crescimento.</p>
                      <Textarea
                        id="missaoEscritorio"
                        value={formData.missaoEscritorio}
                        onChange={(e) => handleInputChange("missaoEscritorio", e.target.value)}
                        className="bg-slate-700 border-slate-600 text-white min-h-[100px]"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="marcoDesafio" className="text-gray-300">
                        Qual foi o marco ou desafio mais importante da sua história?
                      </Label>
                      <p className="text-sm text-gray-400">Ex: A chegada da contabilidade online nos forçou a criar e vender serviços de maior valor, como o BPO.</p>
                      <Textarea
                        id="marcoDesafio"
                        value={formData.marcoDesafio}
                        onChange={(e) => handleInputChange("marcoDesafio", e.target.value)}
                        className="bg-slate-700 border-slate-600 text-white min-h-[100px]"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Seção 2: Estratégia, Objetivos e Métricas */}
                <div className="space-y-6">
                  <div className="border-b border-yellow-600 pb-2">
                    <h2 className="text-2xl font-bold text-yellow-400">
                      Seção 2: Estratégia, Objetivos e Métricas de Sucesso
                    </h2>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-xl font-semibold text-white">
                      2.1. Objetivos de Curto Prazo (Próximos 6-12 meses)
                    </h3>

                    <div className="space-y-2">
                      <Label className="text-gray-300">
                        Quais são seus principais objetivos de curto prazo? (Selecione as opções que se aplicam ao seu momento atual)
                      </Label>
                      {["Aumentar o ticket médio", "Conquistar mais clientes (Ex: +15 novos clientes)", "Deixar de depender somente de indicações", "Estruturar um processo de vendas previsível", "Aumentar a margem de lucro"].map((option) => (
                        <div key={option} className="flex items-center gap-2">
                          <Checkbox id={`objetivo-${option}`} checked={formData.objetivosComerciais.includes(option)} onCheckedChange={(checked) => handleCheckboxChange("objetivosComerciais", option, checked === true)} className="border-gray-400 data-[state=checked]:bg-yellow-500 data-[state=checked]:text-slate-900" />
                          <Label htmlFor={`objetivo-${option}`} className="cursor-pointer text-gray-300">{option}</Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-xl font-semibold text-white">2.2. Indicadores de Desempenho (KPIs)</h3>

                    <div className="space-y-2">
                      <Label className="text-gray-300">
                        Quais os números/indicadores você acompanha hoje para medir o comercial? (Selecione as opções)
                      </Label>
                      {["Número de propostas enviadas por mês", "Taxa de conversão de indicações", "Aumento de faturamento mensal", "Ticket Médio", "Não acompanho nenhum indicador atualmente"].map((option) => (
                        <div key={option} className="flex items-center gap-2">
                          <Checkbox id={`indicador-${option}`} checked={formData.indicadoresDesempenho.includes(option)} onCheckedChange={(checked) => handleCheckboxChange("indicadoresDesempenho", option, checked === true)} className="border-gray-400 data-[state=checked]:bg-yellow-500 data-[state=checked]:text-slate-900" />
                          <Label htmlFor={`indicador-${option}`} className="cursor-pointer text-gray-300">{option}</Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-xl font-semibold text-white">2.3. Diferenciação no Mercado</h3>

                    <div className="space-y-2">
                      <Label htmlFor="diferenciacaoMercado" className="text-gray-300">
                        Por que um cliente deveria escolher seu escritório e não um mais barato?
                      </Label>
                      <p className="text-sm text-gray-400">Ex: Pelas nossas reuniões trimestrais de análise de resultados, que ajudam o cliente a tomar decisões.</p>
                      <Textarea
                        id="diferenciacaoMercado"
                        value={formData.diferenciacaoMercado}
                        onChange={(e) => handleInputChange("diferenciacaoMercado", e.target.value)}
                        className="bg-slate-700 border-slate-600 text-white min-h-[100px]"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Seção 3: O Cliente Ideal */}
                <div className="space-y-6">
                  <div className="border-b border-yellow-600 pb-2">
                    <h2 className="text-2xl font-bold text-yellow-400">
                      Seção 3: O Cliente Ideal (ICP - Ideal Customer Profile)
                    </h2>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-xl font-semibold text-white">3.1. Perfil do Cliente Ideal</h3>
                    <div className="space-y-2">
                      <Label htmlFor="segmentoNicho" className="text-gray-300">
                        Descreva os segmentos de atuação (nichos) que a sua contabilidade atende hoje. Além disso, quais segmentos a sua contabilidade gostaria de atender, porém ainda não atende nenhum, e por qual motivo?
                      </Label>
                      <p className="text-sm text-gray-400">Ex: Hoje atendo comércio em geral. Gostaria de atender clínicas médicas porque o ticket é maior, mas não sei como prospectar esse público.</p>
                      <Textarea
                        id="segmentoNicho"
                        value={formData.segmentoNicho}
                        onChange={(e) => handleInputChange("segmentoNicho", e.target.value)}
                        className="bg-slate-700 border-slate-600 text-white min-h-[120px]"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="porteRegime" className="text-gray-300">
                        Porte e Regime:
                      </Label>
                      <p className="text-sm text-gray-400">Ex: Simples Nacional, faturando acima de R$ 80 mil/mês</p>
                      <Input
                        id="porteRegime"
                        value={formData.porteRegime}
                        onChange={(e) => handleInputChange("porteRegime", e.target.value)}
                        className="bg-slate-700 border-slate-600 text-white"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="principalDor" className="text-gray-300">
                        Principal "Dor" que vocês resolvem:
                      </Label>
                      <p className="text-sm text-gray-400">Ex: Dono perdido no financeiro, paga mais impostos do que deveria, falta de organização para crescer</p>
                      <Textarea
                        id="principalDor"
                        value={formData.principalDor}
                        onChange={(e) => handleInputChange("principalDor", e.target.value)}
                        className="bg-slate-700 border-slate-600 text-white min-h-[80px]"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Seção 4: A Máquina de Vendas */}
                <div className="space-y-6">
                  <div className="border-b border-yellow-600 pb-2">
                    <h2 className="text-2xl font-bold text-yellow-400">
                      Seção 4: A Máquina de Vendas: Processo, Pessoas e Canais
                    </h2>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-xl font-semibold text-white">4.1. Canais de Aquisição de Clientes</h3>

                    <div className="space-y-2">
                      <Label className="text-gray-300">
                        De onde vem a maioria dos seus clientes hoje? (Selecione as opções)
                      </Label>
                      {["Indicação de clientes parceiros", "Redes Sociais (Instagram, LinkedIn, etc.)", "Pesquisa orgânica no Google", "Prospecção Ativa (Cold Call, Abordagem direta no WhatsApp, etc.)", "Eventos e Parcerias"].map((option) => (
                        <div key={option} className="flex items-center gap-2">
                          <Checkbox id={`canal-${option}`} checked={formData.canaisAquisicao.includes(option)} onCheckedChange={(checked) => handleCheckboxChange("canaisAquisicao", option, checked === true)} className="border-gray-400 data-[state=checked]:bg-yellow-500 data-[state=checked]:text-slate-900" />
                          <Label htmlFor={`canal-${option}`} className="cursor-pointer text-gray-300">{option}</Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-xl font-semibold text-white">4.2. Jornada de Venda (Passo a Passo)</h3>

                    <div className="space-y-2">
                      <Label htmlFor="jornadaVenda" className="text-gray-300">
                        Você tem uma jornada de venda estruturada? Descreva abaixo, passo a passo, o caminho que o cliente faz desde quando entra em contato (através dos canais que você marcou acima) até finalizar uma venda.
                      </Label>
                      <p className="text-sm text-gray-400">Ex: 1. Cliente chama no WhatsApp &gt; 2. Faço perguntas de qualificação &gt; 3. Agendo uma reunião de apresentação &gt; 4. Envio a proposta &gt; 5. Faço follow-up.</p>
                      <Textarea
                        id="jornadaVenda"
                        value={formData.jornadaVenda}
                        onChange={(e) => handleInputChange("jornadaVenda", e.target.value)}
                        className="bg-slate-700 border-slate-600 text-white min-h-[100px]"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-xl font-semibold text-white">4.3. Estrutura da Equipe Comercial</h3>

                    <div className="space-y-2">
                      <Label htmlFor="responsavelVenda" className="text-gray-300">
                        Quem é o responsável por vender no escritório hoje?
                      </Label>
                      <p className="text-sm text-gray-400">Ex: Eu, o sócio-contador. Faço tudo, da prospecção ao fechamento.</p>
                      <Textarea
                        id="responsavelVenda"
                        value={formData.responsavelVenda}
                        onChange={(e) => handleInputChange("responsavelVenda", e.target.value)}
                        className="bg-slate-700 border-slate-600 text-white min-h-[80px]"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-xl font-semibold text-white">4.4. Estilo de Liderança e Motivação</h3>

                    <div className="space-y-2">
                      <Label htmlFor="estiloLideranca" className="text-gray-300">
                        Como você gerencia e motiva a área comercial (mesmo que seja só você)?
                      </Label>
                      <p className="text-sm text-gray-400">Ex: Não temos um processo formal de metas ou comissão. A motivação é o crescimento do negócio.</p>
                      <Textarea
                        id="estiloLideranca"
                        value={formData.estiloLideranca}
                        onChange={(e) => handleInputChange("estiloLideranca", e.target.value)}
                        className="bg-slate-700 border-slate-600 text-white min-h-[80px]"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Seção 5: Desafios, Concorrência e Oportunidades */}
                <div className="space-y-6">
                  <div className="border-b border-yellow-600 pb-2">
                    <h2 className="text-2xl font-bold text-yellow-400">
                      Seção 5: Desafios, Concorrência e Oportunidades
                    </h2>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-xl font-semibold text-white">5.1. Principais Gargalos e Dores Comerciais</h3>

                    <div className="space-y-2">
                      <Label className="text-gray-300">
                        Qual é a sua maior frustração e desafio ao tentar vender seus serviços hoje? (Selecione as opções)
                      </Label>
                      {["Não ter tempo para vender de forma estratégica", "Dificuldade de mostrar valor no serviço (cliente só olha preço)", "Dificuldade em criar pacotes de serviços atrativos", "Não tenho um processo de vendas organizado"].map((option) => (
                        <div key={option} className="flex items-center gap-2">
                          <Checkbox id={`gargalo-${option}`} checked={formData.gargalosDesafios.includes(option)} onCheckedChange={(checked) => handleCheckboxChange("gargalosDesafios", option, checked === true)} className="border-gray-400 data-[state=checked]:bg-yellow-500 data-[state=checked]:text-slate-900" />
                          <Label htmlFor={`gargalo-${option}`} className="cursor-pointer text-gray-300">{option}</Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-xl font-semibold text-white">5.2. Concorrência</h3>

                    <div className="space-y-2">
                      <Label htmlFor="concorrentes" className="text-gray-300">
                        Quem são seus 2 principais tipos de concorrentes?
                      </Label>
                      <p className="text-sm text-gray-400">Ex: 1. As contabilidades online de massa (como Contabilizei). 2. O contador tradicional do bairro.</p>
                      <Textarea
                        id="concorrentes"
                        value={formData.concorrentes}
                        onChange={(e) => handleInputChange("concorrentes", e.target.value)}
                        className="bg-slate-700 border-slate-600 text-white min-h-[80px]"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-xl font-semibold text-white">5.3. Visão de Futuro e Oportunidades</h3>

                    <div className="space-y-2">
                      <Label htmlFor="visaoFuturo" className="text-gray-300">
                        Qual seu grande sonho ou oportunidade para o escritório em 3 anos?
                      </Label>
                      <p className="text-sm text-gray-400">Ex: Virar uma boutique de serviços financeiros, reconhecida como especialista em um nicho e poder escolher clientes.</p>
                      <Textarea
                        id="visaoFuturo"
                        value={formData.visaoFuturo}
                        onChange={(e) => handleInputChange("visaoFuturo", e.target.value)}
                        className="bg-slate-700 border-slate-600 text-white min-h-[100px]"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Seção 6: Tecnologia e Ferramentas */}
                <div className="space-y-6">
                  <div className="border-b border-yellow-600 pb-2">
                    <h2 className="text-2xl font-bold text-yellow-400">
                      Seção 6: Tecnologia e Ferramentas (Tech Stack)
                    </h2>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-xl font-semibold text-white">6.1. Ferramentas Utilizadas</h3>

                    <div className="space-y-2">
                      <Label htmlFor="ferramentasUtilizadas" className="text-gray-300">
                        Vocês utilizam alguma ferramenta de CRM? Como vocês organizam e controlam os clientes que entram em contato e estão em alguma tratativa comercial para contratar o serviço de vocês?
                      </Label>
                      <p className="text-sm text-gray-400">Ex: Uso um sistema CRM específico, uso planilha de Excel, organizo pelas etiquetas do WhatsApp, anoto no caderno, etc.</p>
                      <Textarea
                        id="ferramentasUtilizadas"
                        value={formData.ferramentasUtilizadas}
                        onChange={(e) => handleInputChange("ferramentasUtilizadas", e.target.value)}
                        className="bg-slate-700 border-slate-600 text-white min-h-[100px]"
                        required
                      />
                    </div>

                    <div className="space-y-3">
                      <Label className="text-gray-300">
                        Seu escritório utiliza um sistema de CRM para gestão comercial?
                      </Label>
                      <RadioGroup
                        value={formData.utilizaCRM}
                        onValueChange={(value) => handleInputChange("utilizaCRM", value)}
                        className="space-y-3"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="Sim" id="crm-sim" className="border-gray-400 text-yellow-400" />
                          <Label htmlFor="crm-sim" className="text-gray-300 cursor-pointer">
                            Sim
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="Não" id="crm-nao" className="border-gray-400 text-yellow-400" />
                          <Label htmlFor="crm-nao" className="text-gray-300 cursor-pointer">
                            Não, gerenciamos por planilhas ou outro método
                          </Label>
                        </div>
                      </RadioGroup>
                    </div>

                    {formData.utilizaCRM === "Sim" && (
                      <div className="space-y-2">
                        <Label htmlFor="qualCRM" className="text-gray-300">
                          Qual CRM?
                        </Label>
                        <Input
                          id="qualCRM"
                          value={formData.qualCRM}
                          onChange={(e) => handleInputChange("qualCRM", e.target.value)}
                          className="bg-slate-700 border-slate-600 text-white"
                        />
                      </div>
                    )}
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-xl font-semibold text-white">6.2. Campanhas Pagas</h3>
                    <div className="space-y-2">
                      <Label className="text-gray-300">Você faz algum tipo de campanha paga de aquisição? Se sim, quais? (Selecione as opções)</Label>
                      {["Meta Ads (Anúncios Profissionais no Gerenciador do Facebook/Instagram)", "Google Ads (Anúncios na rede de pesquisa)", "Turbinar publicações direto no Instagram / Facebook", "Turbinar diretamente no WhatsApp", "Pego lista de contatos/leads para ligar um a um ou mandar WhatsApp", "Não faço nenhum tipo de campanha paga"].map((option) => (
                        <div key={option} className="flex items-center gap-2">
                          <Checkbox id={`campanha-${option}`} checked={formData.campanhasPagas.includes(option)} onCheckedChange={(checked) => handleCheckboxChange("campanhasPagas", option, checked === true)} className="border-gray-400 data-[state=checked]:bg-yellow-500 data-[state=checked]:text-slate-900" />
                          <Label htmlFor={`campanha-${option}`} className="cursor-pointer text-gray-300">{option}</Label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex justify-center pt-6">
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-green-600 hover:bg-green-700 text-white px-12 py-6 text-lg"
                  >
                    {isSubmitting ? "Enviando..." : "Enviar Formulário"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 border-t border-slate-700 py-8 mt-16">
        <div className="container mx-auto px-4 text-center">
          <p className="text-gray-400">© 2025 Prospect Vendas. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  )
}
