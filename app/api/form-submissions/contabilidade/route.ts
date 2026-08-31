import { NextResponse } from "next/server"
import {
  buildAnswers,
  findRecentDuplicate,
  getString,
  insertFormSubmission,
  markWebhookDelivered,
} from "@/lib/form-submissions"

const webhookUrl = "https://eazytech-n8n.gsl3ku.easypanel.host/webhook/contabilidade"

const fields = [
  ["nomeEscritorio", "Nome do Escritório"],
  ["nomeContatoprincipal", "Nome do Contato Principal"],
  ["cnpj", "CNPJ"],
  ["telefone", "Telefone / WhatsApp"],
  ["endereçoDoescritorio", "Endereço do Escritório"],
  ["site", "Site"],
  ["linkedin", "LinkedIn"],
  ["instagram", "Instagram"],
  ["principalAreaAtuacao", "Principal área de atuação"],
  ["faturamentoMensal", "Faturamento Mensal Médio"],
  ["numeroColaboradores", "Número Total de Colaboradores"],
  ["numeroColaboradorescomercial", "Número de Colaboradores no Comercial"],
  ["numeroClientesAtivos", "Número de Clientes Ativos"],
  ["numeroEquipeVendaAtiva", "Número de pessoas focadas em venda ativa"],
  ["novasVendasMensais", "Quantas novas vendas o escritório fecha por mês atualmente, e quantas gostaria de fechar?"],
  ["missaoEscritorio", "Qual é a missão do escritório?"],
  ["marcoDesafio", "Qual foi o principal marco ou desafio na história do escritório?"],
  ["objetivosComerciais", "Quais são os principais objetivos comerciais para os próximos 12 meses? (Selecione as opções)"],
  ["indicadoresDesempenho", "Quais os números/indicadores você acompanha hoje para medir o comercial? (Selecione as opções)"],
  ["diferenciacaoMercado", "Por que um cliente deveria escolher seu escritório e não um mais barato?"],
  ["segmentoNicho", "Descreva os segmentos de atuação (nichos) que a sua contabilidade atende hoje. Além disso, quais segmentos a sua contabilidade gostaria de atender, porém ainda não atende nenhum, e por qual motivo?"],
  ["porteRegime", "Porte e Regime"],
  ["principalDor", "Principal \"Dor\" que vocês resolvem"],
  ["canaisAquisicao", "De onde vem a maioria dos seus clientes hoje? (Selecione as opções)"],
  ["jornadaVenda", "Você tem uma jornada de venda estruturada? Descreva abaixo, passo a passo, o caminho que o cliente faz desde quando entra em contato (através dos canais que você marcou acima) até finalizar uma venda."],
  ["responsavelVenda", "Quem é o responsável por vender no escritório hoje?"],
  ["estiloLideranca", "Como você gerencia e motiva a área comercial (mesmo que seja só você)?"],
  ["gargalosDesafios", "Qual é a sua maior frustração e desafio ao tentar vender seus serviços hoje? (Selecione as opções)"],
  ["concorrentes", "Quem são seus 2 principais tipos de concorrentes?"],
  ["visaoFuturo", "Qual seu grande sonho ou oportunidade para o escritório em 3 anos?"],
  ["ferramentasUtilizadas", "Vocês utilizam alguma ferramenta de CRM? Como vocês organizam e controlam os clientes que entram em contato e estão em alguma tratativa comercial para contratar o serviço de vocês?"],
  ["utilizaCRM", "Seu escritório utiliza um sistema de CRM para gestão comercial?"],
  ["qualCRM", "Qual CRM?"],
  ["campanhasPagas", "Você faz algum tipo de campanha paga de aquisição? Se sim, quais? (Selecione as opções)"],
] as const

export async function POST(request: Request) {
  let payload: Record<string, unknown>

  try {
    payload = (await request.json()) as Record<string, unknown>
    const companyName = getString(payload, "nomeEscritorio")

    // Protege contra duplo envio: rejeita submissão da mesma empresa nos últimos 5 min
    const duplicate = await findRecentDuplicate("apc_contabilidade", companyName)
    if (duplicate) {
      console.log(`[APC Contabilidade] Submissão duplicada ignorada para "${companyName}" (id: ${duplicate.id})`)
      return NextResponse.json({ success: true })
    }

    const submissionId = await insertFormSubmission({
      formType: "apc_contabilidade",
      companyName,
      answers: buildAnswers(payload, fields),
    })

    // Dispara o webhook em background — não bloqueia a resposta ao usuário
    fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }).then(async (res) => {
      if (res.ok) {
        await markWebhookDelivered(submissionId)
      } else {
        console.error(`Webhook APC Contabilidade respondeu com status ${res.status}`)
      }
    }).catch((err) => {
      console.error("Webhook de APC Contabilidade falhou:", err)
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Falha ao salvar formulário de APC Contabilidade:", error)
    return NextResponse.json({ error: "Não foi possível enviar o formulário." }, { status: 500 })
  }
}
