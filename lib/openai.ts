type ResponsesApiOutputTextContent = {
  type: "output_text"
  text: string
}

type ResponsesApiMessageItem = {
  type: "message"
  content?: ResponsesApiOutputTextContent[]
}

type ResponsesApiPayload = {
  status?: string
  error?: { message?: string }
  output?: ResponsesApiMessageItem[]
}

function extractOutputText(payload: ResponsesApiPayload) {
  const output = Array.isArray(payload.output) ? payload.output : []
  const parts: string[] = []

  for (const item of output) {
    if (item.type !== "message" || !Array.isArray(item.content)) continue
    for (const content of item.content) {
      if (content.type === "output_text" && typeof content.text === "string") {
        parts.push(content.text)
      }
    }
  }

  return parts.join("\n\n").trim()
}

export async function generateWithOpenAI(options: { system: string; user: string }) {
  const apiKey = process.env.OPENAI_API_KEY

  if (!apiKey) {
    throw new Error("OPENAI_API_KEY não configurada.")
  }

  const model = process.env.OPENAI_MODEL || "o3"
  const reasoningEffort = process.env.OPENAI_REASONING_EFFORT || "high"

  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      instructions: options.system,
      input: options.user,
      reasoning: { effort: reasoningEffort },
      max_output_tokens: 32000,
    }),
  })

  const payload = (await response.json()) as ResponsesApiPayload

  if (!response.ok) {
    throw new Error(`Falha na chamada à OpenAI: ${response.status} ${payload.error?.message ?? ""}`)
  }

  const text = extractOutputText(payload)

  if (!text) {
    const reason = payload.status === "incomplete" ? " (resposta incompleta, aumente max_output_tokens)" : ""
    throw new Error(`A OpenAI não retornou conteúdo${reason}.`)
  }

  return text
}
