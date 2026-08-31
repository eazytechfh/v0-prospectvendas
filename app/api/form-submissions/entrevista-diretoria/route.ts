import { NextResponse } from "next/server"
import { buildAnswers, findRecentDuplicate, getString, insertFormSubmission } from "@/lib/form-submissions"

const fields = [
  ["data", "Data"],
  ["consultor", "Consultor"],
  ["cliente", "Cliente (Nome da Empresa)"],
  ["telefone", "Qual o telefone de contato?"],
  ["cnpj", "Qual o CNPJ da empresa?"],
  ["areaAtuacao", "Área de atuação?"],
  ["faturamentoAnual", "Faturamento Anual Bruto?"],
  ["numeroFuncionarios", "Número de Funcionários?"],
  ["numeroClientes", "Quantos clientes a empresa possui atualmente?"],
  ["processoComercial", "Como é o processo comercial da empresa?"],
  ["historiaMarcos", "1.1. Quais os principais marcos e eventos que moldaram a história da sua empresa? Quais desafios e conquistas mais te marcaram?"],
  ["proposito", "1.2. O que mais te movimenta como empreendedor/gestor(a)? Qual é o verdadeiro propósito desta empresa, além do lucro?"],
  ["legado", "1.3. Se sua empresa deixasse de existir, que legado gostaria que fosse lembrado?"],
  ["clima", "2.1. Como é o clima do ambiente de trabalho? Como sua equipe se relaciona?"],
  ["valores", "2.2. Quais são os valores inegociáveis dentro da empresa? Cite exemplos práticos de como eles aparecem no dia a dia."],
  ["objetivos", "3.1. Quais são os principais objetivos comerciais para os próximos 6 a 12 meses?"],
  ["metricasSucesso", "3.2. Quais são suas principais métricas de sucesso?"],
  ["propostaValor", "3.3. O que diferencia a sua proposta de valor em relação à concorrência?"],
  ["clienteIdeal", "3.4. Descreva o perfil do seu cliente ideal (ICP)."],
  ["desafiosCriticos", "4.1. Quais desafios mais críticos sua empresa enfrenta atualmente?"],
  ["gargalosComercial", "4.2. No comercial, quais são os principais gargalos? O que mais gera frustrações?"],
  ["solucoesTestadas", "4.3. O que já foi testado para solucionar esses pontos? Teve algum resultado relevante?"],
  ["oportunidades", "5.1. Quais novas oportunidades você enxerga para futuro crescimento?"],
  ["sonho", "5.2. Se pudesse sonhar alto, onde gostaria de ver a empresa em 2-3 anos?"],
  ["indicadores", "6.1. Quais indicadores você acompanha regularmente?"],
  ["metasBenchmarks", "6.2. Quais metas e benchmarks são prioridade neste ciclo?"],
  ["utilizaCrm", "7.1. Utiliza sistema CRM?"],
  ["qualCrm", "Se sim, qual CRM utiliza?"],
  ["clientesAtivosInativos", "7.2. Número de clientes ativos/inativos e principais critérios:"],
  ["mediaNovosClientes", "7.3. Média mensal de novos clientes e canais de aquisição principais:"],
  ["dadosEssenciais", "7.4. Quais dados/plataformas analíticas são essenciais na gestão e tomada de decisão?"],
  ["composicaoEquipe", "8.1. Como é composta sua equipe comercial?"],
  ["talentosDesafios", "8.2. Quais talentos se destacam e quais desafios aparecem mais?"],
  ["incentivos", "8.3. Quais tipos de incentivos ou programas de motivação são praticados?"],
  ["lideranca", "8.4. Como descreve seu próprio estilo de liderança e relação com o time?"],
  ["fluxoComercial", "9.1. Descreva o fluxo atual do processo comercial, do primeiro contato ao pós-venda:"],
  ["integracaoAreas", "9.2. Como as áreas de marketing, vendas e operação se integram?"],
  ["canaisClientes", "9.3. Quais canais trazem mais clientes hoje?"],
  ["estrategiasDivulgacao", "10.1. Quais estratégias e canais de divulgação são mais potentes hoje? Exemplos práticos:"],
  ["processoEstruturado", "10.2. Seu comercial segue roteiro, metodologia ou processo estruturado? Qual?"],
  ["tecnologias", "11.1. Quais tecnologias e ferramentas são essenciais para a rotina comercial e gestão?"],
  ["inovacao", "11.2. Como a empresa busca inovação e ganhos de eficiência?"],
  ["tendencias", "11.3. Quais tendências do mercado avalia como ameaça ou oportunidade?"],
  ["jornadaCliente", "12.1. Explique a jornada completa do seu cliente, passo a passo:"],
  ["pontosContato", "12.2. Principais pontos de contato e possíveis atritos. Como monitoram e corrigem?"],
  ["feedback", "12.3. Como coletam feedback dos clientes? Com que frequência?"],
  ["experienciaQualidade", "12.4. O que mais garante uma experiência de alta qualidade ao cliente?"],
  ["concorrentes", "13.1. Principais concorrentes diretos/indiretos:"],
  ["diferenciacao", "13.2. O que diferencia sua empresa no mercado?"],
  ["percepcao", "13.3. Como gostaria de ser percebido por seus clientes e pelo mercado?"],
  ["comparacao", "13.4. Comparação rápida com concorrência: Preço / Serviços / Experiência do Cliente"],
  ["inspiracaoConcorrentes", "13.5. O que vê de positivo nos concorrentes que podem inspirar seu crescimento?"],
] as const

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as Record<string, unknown>
    const companyName = getString(payload, "cliente").trim()
    if (!companyName) return NextResponse.json({ error: "Cliente não informado." }, { status: 400 })

    // Protege contra duplo envio: rejeita submissão da mesma empresa nos últimos 5 min
    const duplicate = await findRecentDuplicate("entrevista_diretoria", companyName)
    if (duplicate) {
      console.log(`[Entrevista Diretoria] Submissão duplicada ignorada para "${companyName}" (id: ${duplicate.id})`)
      return NextResponse.json({ success: true })
    }

    await insertFormSubmission({
      formType: "entrevista_diretoria",
      companyName,
      answers: buildAnswers(payload, fields),
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Falha ao salvar entrevista da diretoria:", error)
    return NextResponse.json({ error: "Não foi possível enviar a entrevista." }, { status: 500 })
  }
}

