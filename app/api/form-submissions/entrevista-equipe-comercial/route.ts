import { NextResponse } from "next/server"
import { buildAnswers, getString, insertFormSubmission } from "@/lib/form-submissions"

const fields = [
  ["nomeMembro", "Nome do Membro"],
  ["empresa", "Empresa"],
  ["cnpj", "CNPJ"],
  ["telefoneContato", "Telefone Contato"],
  ["quantidadeLeads", "Quantidade de leads que ele atende"],
  ["quantidadeVendas", "Quantidade de vendas que ele faz"],
  ["fatoresMotivacao", "Quais fatores influenciam mais a sua motivação no trabalho atualmente?"],
  ["objetivosCarreira", "Quais são seus objetivos de carreira a curto (até 1 ano) e longo prazo (mais de 1 ano)?"],
  ["contribuicaoSucesso", "De que forma seu trabalho e suas ações contribuem para o sucesso da equipe e da empresa, e para seus objetivos pessoais?"],
  ["nivelIntegracao", "Em uma escala de 1 a 10, o quanto você se sente integrado à equipe?"],
  ["expressarOpinioes", "Você se sente à vontade para expressar opiniões, ideias e preocupações com colegas e líderes?"],
  ["confiancaColegas", "Em uma escala de 1 a 10, o quanto você confia em seus colegas de equipe?"],
  ["nivelConfianca", "Como você descreveria o nível de confiança entre os membros da equipe?"],
  ["espiritoEquipe", "Como você descreveria o espírito de equipe?"],
  ["parteTime", "Você se sente parte de um time que trabalha em conjunto para alcançar os objetivos?"],
  ["exemploEspiritoEquipe", "Dê um exemplo de uma situação em que você sentiu o espírito de equipe em ação."],
  ["pedirAjuda", "Você se sente à vontade para pedir ajuda aos seus colegas quando precisa?"],
  ["fortalecerEquipe", "O que poderia fortalecer o espírito de equipe?"],
  ["apoioMutuo", "A equipe se apoia mutuamente em momentos de dificuldade."],
  ["celebraSucessos", "A equipe celebra os sucessos em conjunto."],
  ["responsabilidadeResultados", "A equipe se sente responsável pelos resultados uns dos outros."],
  ["entenderCliente", "Como você se coloca no lugar do cliente para entender suas necessidades?"],
  ["doresClientes", "Quais são as principais dores que você identifica nos clientes?"],
  ["adaptarAbordagem", "Em uma escala de 1 a 10, o quanto você se sente capaz de adaptar sua abordagem para atender às necessidades específicas de cada cliente?"],
  ["exemploEmpatia", "Dê um exemplo de uma situação em que você demonstrou empatia com um cliente."],
  ["escutaAtiva", "Escuta ativa"],
  ["comunicacaoClara", "Comunicação clara e eficaz"],
  ["compreensaoCliente", "Compreensão das necessidades do cliente"],
  ["resolucaoProblemas", "Resolução de problemas"],
  ["construcaoRelacionamentos", "Construção de relacionamentos"],
  ["principaisProdutos", "Quais são os principais produtos/serviços que a empresa oferece?"],
  ["confiancaProcessos", "Em uma escala de 1 a 10, o quanto você se sente confiante em relação ao seu conhecimento sobre os processos internos da empresa?"],
  ["descricaoProcessos", "Como você descreveria os processos internos da empresa?"],
  ["produtoMaisVendido", "Qual dos seguintes produtos/serviços é o mais vendido pela empresa?"],
  ["objetivoVendas", "Qual é o principal objetivo do processo de vendas da empresa?"],
  ["sugerirMelhorias", "Você se sente à vontade para sugerir melhorias nos processos da empresa?"],
  ["ideiaSugerida", "Dê um exemplo de uma ideia que você já sugeriu para melhorar os processos da empresa ou a experiência do cliente."],
  ["valorizadoIdeias", "Em uma escala de 1 a 10, o quanto você se sente valorizado pela empresa por suas ideias e sugestões?"],
  ["encorajadoIdeias", "Eu me sinto encorajado a apresentar novas ideias."],
  ["sugestoesConsideradas", "Minhas sugestões são levadas em consideração."],
  ["autonomiaIdeias", "Eu tenho autonomia para implementar minhas ideias."],
  ["avaliacaoClima", "Em uma escala de 1 a 10, como você avalia o clima de trabalho na equipe?"],
  ["pontosPositivosClima", "Quais são os pontos positivos do clima de trabalho?"],
  ["pontosNegativosClima", "Quais são os pontos negativos do clima de trabalho?"],
  ["ambientePositivo", "O ambiente de trabalho é positivo e motivador."],
  ["respeitoColaboracao", "Existe respeito e colaboração entre os membros da equipe."],
  ["liderancaInspiradora", "A liderança da equipe é inspiradora e apoia o desenvolvimento profissional."],
  ["dificuldadesDiarias", "Quais são as maiores dificuldades que você enfrenta no seu dia a dia de trabalho?"],
  ["desafiosEquipe", "Quais são os maiores desafios que a equipe enfrenta para alcançar os resultados?"],
  ["preparoDesafios", "Em uma escala de 1 a 10, o quanto você se sente preparado para enfrentar esses desafios?"],
  ["necessidadesPreparo", "O que você precisa para se sentir mais preparado para enfrentar esses desafios?"],
  ["obstaculosObjetivos", "Quais são os principais obstáculos que impedem você de alcançar seus objetivos?"],
  ["avaliacaoComunicacao", "Em uma escala de 1 a 10, como você avalia a comunicação dentro da equipe?"],
  ["descricaoComunicacao", "Como você avalia e descreve a comunicação dentro da equipe?"],
  ["avaliacaoColaboracao", "Como você avalia a colaboração entre os membros da equipe?"],
  ["comunicacaoEficaz", "A comunicação é clara e eficaz."],
  ["informacoesTransparentes", "As informações são compartilhadas de forma transparente."],
  ["equipeResolveProblemas", "A equipe trabalha em conjunto para resolver problemas."],
  ["confiancaProdutos", "Em uma escala de 1 a 10, o quanto você se sente confiante em relação ao seu conhecimento sobre os produtos/serviços que a empresa oferece?"],
  ["produtosTreinamento", "Quais são os produtos/serviços em que você se sente mais confiante e quais precisam de mais treinamento?"],
  ["confiancaVendas", "Em uma escala de 1 a 10, o quanto você se sente confiante em relação às suas habilidades de vendas?"],
  ["habilidadesTreinamento", "Quais são as habilidades que você considera que precisam de mais treinamento ou desenvolvimento?"],
  ["prospeccao", "Prospecção de clientes"],
  ["qualificacao", "Qualificação de leads"],
  ["apresentacaoPropostas", "Apresentação de propostas"],
  ["negociacao", "Negociação"],
  ["fechamento", "Fechamento de vendas"],
  ["motivacaoEmpresa", "Em uma escala de 1 a 10, o quanto você se sente motivado para trabalhar na empresa?"],
  ["motivacaoDiaria", "O que mais te motiva no trabalho e faz você vir todos os dias?"],
  ["engajadoObjetivos", "Você se sente engajado com os objetivos da empresa?"],
  ["aumentarMotivacao", "O que a empresa pode fazer para aumentar sua motivação e engajamento?"],
  ["sugestoesResultados", "Quais são suas sugestões para melhorar o trabalho da equipe e os resultados da empresa?"],
  ["melhoriasClima", "Quais melhorias você sugere para a comunicação, integração e clima de trabalho na equipe?"],
] as const

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { colaboradores?: unknown }
    if (!Array.isArray(body.colaboradores) || body.colaboradores.length === 0) {
      return NextResponse.json({ error: "Nenhum colaborador informado." }, { status: 400 })
    }

    const collaborators = body.colaboradores as unknown[]
    const results = await Promise.allSettled(collaborators.map(async (value) => {
      if (!value || typeof value !== "object" || Array.isArray(value)) {
        throw new Error("Dados do colaborador inválidos")
      }

      const collaborator = value as Record<string, unknown>
      const companyName = getString(collaborator, "empresa").trim()
      const memberName = getString(collaborator, "nomeMembro").trim()
      if (!companyName || !memberName) throw new Error("Empresa e Nome do Membro são obrigatórios")

      await insertFormSubmission({
        formType: "entrevista_equipe_comercial" as const,
        companyName,
        answers: buildAnswers(collaborator, fields),
      })

      return { companyName, memberName }
    }))

    const failed = results.flatMap((result, index) => {
      if (result.status === "fulfilled") return []

      const collaborator = collaborators[index]
      const payload = collaborator && typeof collaborator === "object" && !Array.isArray(collaborator)
        ? collaborator as Record<string, unknown>
        : {}
      const memberName = getString(payload, "nomeMembro").trim() || `Colaborador ${index + 1}`
      const reason = result.reason instanceof Error ? result.reason.message : String(result.reason)
      console.error(`Falha ao salvar entrevista de ${memberName}:`, result.reason)
      return [{ index, memberName, reason }]
    })
    const savedCount = results.length - failed.length

    if (failed.length === 0) {
      return NextResponse.json({ success: true, savedCount, failed: [] })
    }

    return NextResponse.json(
      { success: false, savedCount, failed },
      { status: savedCount > 0 ? 207 : 500 },
    )
  } catch (error) {
    console.error("Falha ao salvar entrevistas da equipe comercial:", error)
    return NextResponse.json({ error: "Não foi possível enviar as entrevistas." }, { status: 500 })
  }
}
