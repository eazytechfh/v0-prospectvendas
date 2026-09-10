import assert from "node:assert/strict"
import test from "node:test"
import { driveDocumentFileName, escapeDriveQueryValue, normalizeCompanyFolderKey } from "./google-drive"

test("normaliza a empresa para uma chave estável", () => {
  assert.equal(normalizeCompanyFolderKey("  Atlas  Márketing  "), "atlas-marketing")
})

test("escapa valores usados na busca do Drive", () => {
  assert.equal(escapeDriveQueryValue("D'Água\\Sul"), "D\\'Água\\\\Sul")
})

test("gera nomes determinísticos para os documentos", () => {
  assert.equal(driveDocumentFileName("Atlas Marketing", "briefing"), "Briefing APC - Atlas Marketing.pdf")
  assert.equal(driveDocumentFileName("Atlas Marketing", "plano"), "Plano APC - Atlas Marketing.pdf")
})
