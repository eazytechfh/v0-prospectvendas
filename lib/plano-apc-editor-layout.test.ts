import assert from "node:assert/strict"
import { readFile } from "node:fs/promises"
import path from "node:path"
import test from "node:test"

test("o editor do plano sobrescreve o limite padrão e ocupa a viewport", async () => {
  const source = await readFile(path.join(process.cwd(), "app", "interno", "interno-workspace.tsx"), "utf8")

  assert.match(source, /sm:max-w-\[calc\(100vw-2rem\)\]/)
  assert.match(source, /h-\[calc\(100vh-2rem\)\]/)
  assert.match(source, /lg:grid-cols-\[minmax\(0,1fr\)_minmax\(0,1fr\)\]/)
})

test("o detalhe da submissão usa uma largura ampla no desktop", async () => {
  const source = await readFile(path.join(process.cwd(), "app", "interno", "interno-workspace.tsx"), "utf8")

  assert.match(source, /sm:max-w-6xl/)
})
