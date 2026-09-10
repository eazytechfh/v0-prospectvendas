export type DriveDocumentType = "briefing" | "plano"

type DriveConfig = {
  clientId: string
  clientSecret: string
  refreshToken: string
  rootFolderId: string
}

type DriveFile = { id: string; name?: string; webViewLink?: string }

export type DriveUploadResult = {
  folderId: string
  fileId: string
  webViewLink: string
}

export function normalizeCompanyFolderKey(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("pt-BR")
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 100)
}

export function escapeDriveQueryValue(value: string) {
  return value.replace(/\\/g, "\\\\").replace(/'/g, "\\'")
}

export function driveDocumentFileName(companyName: string, documentType: DriveDocumentType) {
  const prefix = documentType === "briefing" ? "Briefing APC" : "Plano APC"
  const safeCompany = companyName.trim().replace(/[\\/:*?"<>|]/g, "-").slice(0, 120) || "Empresa"
  return `${prefix} - ${safeCompany}.pdf`
}

export function isGoogleDriveConfigured() {
  return Boolean(
    process.env.GOOGLE_DRIVE_CLIENT_ID
      && process.env.GOOGLE_DRIVE_CLIENT_SECRET
      && process.env.GOOGLE_DRIVE_REFRESH_TOKEN
      && process.env.GOOGLE_DRIVE_ROOT_FOLDER_ID,
  )
}

function getDriveConfig(): DriveConfig {
  const config = {
    clientId: process.env.GOOGLE_DRIVE_CLIENT_ID?.trim() || "",
    clientSecret: process.env.GOOGLE_DRIVE_CLIENT_SECRET?.trim() || "",
    refreshToken: process.env.GOOGLE_DRIVE_REFRESH_TOKEN?.trim() || "",
    rootFolderId: process.env.GOOGLE_DRIVE_ROOT_FOLDER_ID?.trim() || "",
  }

  if (!config.clientId || !config.clientSecret || !config.refreshToken || !config.rootFolderId) {
    throw new Error("Google Drive não configurado.")
  }
  if (!/^[a-zA-Z0-9_-]+$/.test(config.rootFolderId)) {
    throw new Error("ID da pasta raiz do Google Drive inválido.")
  }

  return config
}

async function getAccessToken(config: DriveConfig) {
  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: config.clientId,
      client_secret: config.clientSecret,
      refresh_token: config.refreshToken,
      grant_type: "refresh_token",
    }),
    cache: "no-store",
  })

  const data = (await response.json().catch(() => ({}))) as { access_token?: string; error?: string }
  if (!response.ok || !data.access_token) {
    throw new Error(`Falha na autenticação do Google Drive${data.error ? `: ${data.error}` : "."}`)
  }
  return data.access_token
}

async function driveJson<T>(url: string, accessToken: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    ...init,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      ...(init?.headers || {}),
    },
    cache: "no-store",
  })
  const data = (await response.json().catch(() => ({}))) as T & { error?: { message?: string } }
  if (!response.ok) throw new Error(data.error?.message || `Google Drive respondeu com status ${response.status}.`)
  return data
}

async function findCompanyFolder(accessToken: string, rootFolderId: string, companyName: string) {
  const key = normalizeCompanyFolderKey(companyName)
  if (!key) throw new Error("Nome da empresa inválido para criação da pasta.")

  const baseQuery = `'${escapeDriveQueryValue(rootFolderId)}' in parents and mimeType = 'application/vnd.google-apps.folder' and trashed = false`
  const propertyQuery = `${baseQuery} and appProperties has { key='prospectCompanyKey' and value='${escapeDriveQueryValue(key)}' }`
  const exactNameQuery = `${baseQuery} and name = '${escapeDriveQueryValue(companyName.trim())}'`

  for (const query of [propertyQuery, exactNameQuery]) {
    const params = new URLSearchParams({ q: query, fields: "files(id,name)", spaces: "drive" })
    const result = await driveJson<{ files?: DriveFile[] }>(
      `https://www.googleapis.com/drive/v3/files?${params}`,
      accessToken,
    )
    if (result.files?.[0]) return result.files[0]
  }

  return driveJson<DriveFile>(
    "https://www.googleapis.com/drive/v3/files?supportsAllDrives=true&fields=id,name",
    accessToken,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: companyName.trim(),
        mimeType: "application/vnd.google-apps.folder",
        parents: [rootFolderId],
        appProperties: { prospectCompanyKey: key },
      }),
    },
  )
}

function multipartBody(metadata: Record<string, unknown>, pdf: Buffer) {
  const boundary = `prospect_${crypto.randomUUID()}`
  const prefix = Buffer.from(
    `--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${JSON.stringify(metadata)}\r\n`
      + `--${boundary}\r\nContent-Type: application/pdf\r\n\r\n`,
  )
  const suffix = Buffer.from(`\r\n--${boundary}--`)
  return { boundary, body: Buffer.concat([prefix, pdf, suffix]) }
}

export async function uploadPdfToCompanyDrive(input: {
  submissionId: string
  companyName: string
  documentType: DriveDocumentType
  pdf: Buffer
}): Promise<DriveUploadResult> {
  const config = getDriveConfig()
  const accessToken = await getAccessToken(config)
  const folder = await findCompanyFolder(accessToken, config.rootFolderId, input.companyName)
  const fileKey = `${input.submissionId}:${input.documentType}`
  const query = `'${escapeDriveQueryValue(folder.id)}' in parents and trashed = false and appProperties has { key='prospectDocumentKey' and value='${escapeDriveQueryValue(fileKey)}' }`
  const params = new URLSearchParams({ q: query, fields: "files(id,name,webViewLink)", spaces: "drive" })
  const existing = await driveJson<{ files?: DriveFile[] }>(
    `https://www.googleapis.com/drive/v3/files?${params}`,
    accessToken,
  )
  const currentFile = existing.files?.[0]
  const metadata = {
    name: driveDocumentFileName(input.companyName, input.documentType),
    mimeType: "application/pdf",
    ...(!currentFile ? { parents: [folder.id] } : {}),
    appProperties: { prospectDocumentKey: fileKey },
  }
  const multipart = multipartBody(metadata, input.pdf)
  const endpoint = currentFile
    ? `https://www.googleapis.com/upload/drive/v3/files/${encodeURIComponent(currentFile.id)}?uploadType=multipart&supportsAllDrives=true&fields=id,name,webViewLink`
    : "https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&supportsAllDrives=true&fields=id,name,webViewLink"
  const file = await driveJson<DriveFile>(endpoint, accessToken, {
    method: currentFile ? "PATCH" : "POST",
    headers: { "Content-Type": `multipart/related; boundary=${multipart.boundary}` },
    body: new Uint8Array(multipart.body),
  })

  return {
    folderId: folder.id,
    fileId: file.id,
    webViewLink: file.webViewLink || `https://drive.google.com/file/d/${file.id}/view`,
  }
}
