import { NextResponse } from "next/server"
import {
  buildAnswers,
  getString,
  insertFormSubmission,
  markWebhookDelivered,
} from "@/lib/form-submissions"

const webhookUrl = "https://eazytech-n8n.gsl3ku.easypanel.host/webhook/cc42a81b-dde0-4c76-8147-6545ab18c8e1"

const fields = [
  ["nomeResponsavel", "Nome do Responsável / Contato"],
  ["nomeFantasia", "Nome da Empresa (Nome Fantasia)"],
  ["razaoSocial", "Razão Social"],
  ["cnpj", "CNPJ"],
  ["telefoneContato", "Telefone / WhatsApp do Contato Principal"],
  ["enderecoEmpresa", "Endereço completo da Empresa"],
  ["site", "Link do Site (Se tiver)"],
  ["linkedin", "Link do LinkedIn (Se tiver)"],
  ["instagram", "Arroba do Instagram"],
  ["faturamentoMensal", "Qual é o seu faturamento mensal atual? (Considere a média dos últimos 3 meses)"],
  ["novasVendasMensais", "Quantas novas vendas (novos contratos) a empresa fecha, em média, por mês atualmente, e quantas vocês gostariam de fechar?"],
  ["clientesAtivos", "Quantos clientes ativos a empresa possui atualmente?"],
  ["totalColaboradores", "Qual o número total de colaboradores na empresa hoje?"],
  ["equipeVendaAtiva", "Desse total, qual o número de pessoas focadas exclusivamente em vendas (venda ativa)?"],
  ["metaCrescimentoReceita", "1.1. Qual é a meta de crescimento de receita para este ano e para os próximos 3 anos?"],
  ["visaoLongoPrazo", "1.2. Qual é a visão de longo prazo para a empresa? Como vocês enxergam o negócio no futuro?"],
  ["alinhamentoComercial", "1.3. Como o setor comercial se alinha e contribui com essa visão geral da empresa hoje?"],
  ["clienteIdeal", "2.1. Como vocês descrevem o cliente ideal da empresa hoje (ICP - Perfil de Cliente Ideal)?"],
  ["diferencial", "2.2. Por que os clientes escolhem o serviço de vocês e não o dos concorrentes? (Qual o seu diferencial?)"],
  ["principaisConcorrentes", "2.3. Quem são seus principais concorrentes hoje?"],
  ["motivosPerdaVendas", "2.4. Por que vocês acabam perdendo vendas (negócios perdidos) para esses concorrentes?"],
  ["objecoesClientes", "2.5. Quando um cliente está pensando em contratar vocês, quais são as principais objeções e desculpas que ele dá para não fechar?"],
  ["tratamentoObjecoes", "2.6. Como a sua equipe lida com essas objeções no dia a dia?"],
  ["canaisAquisicao", "3.1. De onde vem a maioria dos seus clientes hoje? (Selecione as opções)"],
  ["taxaConversao", "3.2. Qual é a sua taxa de conversão média? De cada 10 propostas que vocês enviam, quantas viram vendas de fato?"],
  ["processoIntegrado", "3.3. O setor comercial segue um processo estruturado e tem integração com os esforços de marketing e operações?"],
  ["descricaoIntegracao", "Como funciona essa integração?"],
  ["cicloVendas", "3.4. Qual é o tempo médio do seu Ciclo de Vendas (quanto tempo leva entre o primeiro contato com o cliente até a assinatura do contrato/pagamento)?"],
  ["estruturaEquipeComercial", "4.1. Como a sua equipe comercial está dividida hoje? Quais são as funções?"],
  ["remuneracaoVariavel", "4.2. Existe um modelo de remuneração variável ou comissões? Se sim, como funciona de forma resumida?"],
  ["treinamentoVendedores", "4.3. Como vocês treinam os vendedores novos e como atualizam os vendedores antigos?"],
  ["ferramentasVendas", "5.1. Quais ferramentas e softwares a equipe de vendas utiliza no dia a dia?"],
  ["possuiCRM", "5.2. Vocês utilizam algum sistema de CRM (Sistema de controle de relacionamento com o cliente)?"],
  ["qualCRM", "Qual CRM vocês utilizam?"],
  ["maiorGargalo", "6.1. Qual é o maior gargalo (dificuldade) do comercial hoje que impede vocês de crescerem mais rápido?"],
  ["preocupacaoVendas", "6.2. O que tem tirado o seu sono ultimamente em relação às vendas da empresa?"],
] as const

export async function POST(request: Request) {
  let payload: Record<string, unknown>

  try {
    payload = (await request.json()) as Record<string, unknown>
    const submissionId = await insertFormSubmission({
      formType: "apc_servicos",
      companyName: getString(payload, "nomeFantasia"),
      answers: buildAnswers(payload, fields),
    })

    try {
      const webhookResponse = await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      if (!webhookResponse.ok) {
        throw new Error(`Webhook respondeu com status ${webhookResponse.status}`)
      }

      await markWebhookDelivered(submissionId)
    } catch (error) {
      console.error("Formulário salvo, mas o webhook de APC Serviços falhou:", error)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Falha ao salvar formulário de APC Serviços:", error)
    return NextResponse.json({ error: "Não foi possível enviar o formulário." }, { status: 500 })
  }
}

