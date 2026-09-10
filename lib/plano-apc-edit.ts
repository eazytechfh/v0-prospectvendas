const PLANO_APC_MAX_LENGTH = 100_000

export class PlanoApcValidationError extends Error {}

export function validatePlanoApcMarkdown(value: unknown) {
  if (typeof value !== "string") {
    throw new PlanoApcValidationError("Formato inválido para o conteúdo do plano.")
  }

  const markdown = value.replace(/\r\n?/g, "\n").trim()

  if (!markdown) {
    throw new PlanoApcValidationError("O conteúdo do plano não pode ficar vazio.")
  }

  if (markdown.length > PLANO_APC_MAX_LENGTH) {
    throw new PlanoApcValidationError("O plano não pode ultrapassar 100.000 caracteres.")
  }

  return markdown
}
