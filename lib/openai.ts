type ChatCompletionMessage = {
  role: "assistant" | "user" | "system"
  content: string
}

type ChatCompletionChoice = {
  message: ChatCompletionMessage
  finish_reason: string
}

type ChatCompletionPayload = {
  choices?: ChatCompletionChoice[]
  usage?: { total_tokens?: number }
  error?: { message?: string }
}

export async function generateWithOpenAI(options: { system: string; user: string }) {
  const apiKey = process.env.OPENAI_API_KEY

  if (!apiKey) {
    throw new Error("OPENAI_API_KEY não configurada.")
  }

  const model = process.env.OPENAI_MODEL || "gpt-4.1"

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: options.system },
        { role: "user", content: options.user },
      ],
      max_tokens: 32000,
    }),
  })

  const payload = (await response.json()) as ChatCompletionPayload

  if (!response.ok) {
    throw new Error(`Falha na chamada à OpenAI: ${response.status} ${payload.error?.message ?? ""}`)
  }

  const text = payload.choices?.[0]?.message?.content?.trim()

  if (!text) {
    throw new Error("A OpenAI não retornou conteúdo.")
  }

  return { text, tokensUsed: payload.usage?.total_tokens ?? null }
}