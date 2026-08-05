export type FormAnswer = {
  question: string
  answer: string | string[]
}

export type FormSubmission = {
  id: string
  form_type: "apc_servicos" | "apc_contabilidade" | "entrevista_diretoria" | "entrevista_equipe_comercial"
  company_name: string | null
  answers: FormAnswer[]
  read: boolean
  webhook_delivered: boolean
  created_at: string
}

type SubmissionInput = {
  formType: FormSubmission["form_type"]
  companyName: string
  answers: FormAnswer[]
}

type SubmissionRow = {
  id: string
}

function getSupabaseConfig() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  console.log("[DEBUG] NEXT_PUBLIC_SUPABASE_URL:", JSON.stringify(url))
  console.log("[DEBUG] NEXT_PUBLIC_SUPABASE_ANON_KEY:", JSON.stringify(anonKey ? "***presente***" : anonKey))
  console.log("[DEBUG] cwd:", process.cwd())
  console.log("[DEBUG] NODE_ENV:", process.env.NODE_ENV)

  if (!url || !anonKey) {
    throw new Error("Supabase não configurado")
  }

  return { url: url.replace(/\/$/, ""), anonKey }
}

function supabaseHeaders(anonKey: string) {
  return {
    apikey: anonKey,
    Authorization: `Bearer ${anonKey}`,
    "Content-Type": "application/json",
  }
}

export async function insertFormSubmission(input: SubmissionInput) {
  const { url, anonKey } = getSupabaseConfig()
  const response = await fetch(`${url}/rest/v1/form_submissions`, {
    method: "POST",
    headers: {
      ...supabaseHeaders(anonKey),
      Prefer: "return=representation",
    },
    body: JSON.stringify({
      form_type: input.formType,
      company_name: input.companyName,
      answers: input.answers,
    }),
    cache: "no-store",
  })

  if (!response.ok) {
    const details = await response.text()
    throw new Error(`Falha ao salvar formulário no Supabase: ${response.status} ${details}`)
  }

  const rows = (await response.json()) as SubmissionRow[]
  const submission = rows[0]

  if (!submission?.id) {
    throw new Error("Supabase não retornou o id do formulário salvo")
  }

  return submission.id
}

export async function insertFormSubmissions(inputs: SubmissionInput[]) {
  const { url, anonKey } = getSupabaseConfig()
  const response = await fetch(`${url}/rest/v1/form_submissions`, {
    method: "POST",
    headers: {
      ...supabaseHeaders(anonKey),
      Prefer: "return=minimal",
    },
    body: JSON.stringify(inputs.map((input) => ({
      form_type: input.formType,
      company_name: input.companyName,
      answers: input.answers,
      read: false,
      webhook_delivered: false,
    }))),
    cache: "no-store",
  })

  if (!response.ok) {
    const details = await response.text()
    throw new Error(`Falha ao salvar formulários no Supabase: ${response.status} ${details}`)
  }
}

export async function markWebhookDelivered(submissionId: string) {
  const { url, anonKey } = getSupabaseConfig()
  const response = await fetch(
    `${url}/rest/v1/form_submissions?id=eq.${encodeURIComponent(submissionId)}`,
    {
      method: "PATCH",
      headers: supabaseHeaders(anonKey),
      body: JSON.stringify({ webhook_delivered: true }),
      cache: "no-store",
    },
  )

  if (!response.ok) {
    const details = await response.text()
    throw new Error(`Falha ao atualizar status do webhook: ${response.status} ${details}`)
  }
}

export function buildAnswers(
  payload: Record<string, unknown>,
  fields: ReadonlyArray<readonly [key: string, question: string]>,
) {
  return fields.map(([key, question]) => ({
    question,
    answer: Array.isArray(payload[key])
      ? payload[key].map(String)
      : String(payload[key] ?? ""),
  }))
}

export function getString(payload: Record<string, unknown>, key: string) {
  return typeof payload[key] === "string" ? payload[key] : ""
}

export async function getFormSubmissions(options?: {
  formType?: FormSubmission["form_type"]
  limit?: number
}) {
  const { url, anonKey } = getSupabaseConfig()
  const query = new URLSearchParams({
    select: "id,form_type,company_name,answers,read,webhook_delivered,created_at",
    order: "created_at.desc",
  })
  if (options?.formType) query.set("form_type", `eq.${options.formType}`)
  if (options?.limit) query.set("limit", String(options.limit))
  const response = await fetch(`${url}/rest/v1/form_submissions?${query}`, {
    headers: supabaseHeaders(anonKey),
    cache: "no-store",
  })

  if (!response.ok) {
    const details = await response.text()
    throw new Error(`Falha ao carregar formulários do Supabase: ${response.status} ${details}`)
  }

  return (await response.json()) as FormSubmission[]
}

export async function getFormSubmissionById(id: string) {
  const { url, anonKey } = getSupabaseConfig()
  const query = new URLSearchParams({
    select: "id,form_type,company_name,answers,read,webhook_delivered,created_at",
    id: `eq.${id}`,
    limit: "1",
  })
  const response = await fetch(`${url}/rest/v1/form_submissions?${query}`, {
    headers: supabaseHeaders(anonKey),
    cache: "no-store",
  })

  if (!response.ok) {
    const details = await response.text()
    throw new Error(`Falha ao carregar formulário do Supabase: ${response.status} ${details}`)
  }

  const submissions = (await response.json()) as FormSubmission[]
  return submissions[0] ?? null
}
