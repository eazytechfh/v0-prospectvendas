import { getFormSubmissions } from "@/lib/form-submissions"
import { InternoWorkspace } from "./interno-workspace"

export const dynamic = "force-dynamic"

export default async function InternoPage() {
  try {
    const [servicosSubmissions, contabilidadeSubmissions, diretoriaSubmissions, equipeComercialSubmissions] = await Promise.all([
      getFormSubmissions({ formType: "apc_servicos" }),
      getFormSubmissions({ formType: "apc_contabilidade" }),
      getFormSubmissions({ formType: "entrevista_diretoria" }),
      getFormSubmissions({ formType: "entrevista_equipe_comercial" }),
    ])

    return (
      <InternoWorkspace
        servicosSubmissions={servicosSubmissions}
        contabilidadeSubmissions={contabilidadeSubmissions}
        diretoriaSubmissions={diretoriaSubmissions}
        equipeComercialSubmissions={equipeComercialSubmissions}
      />
    )
  } catch (error) {
    console.error("Não foi possível carregar a área interna:", error)

    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-950 px-6 text-slate-100">
        <div className="w-full max-w-lg rounded-2xl border border-red-900/70 bg-slate-900 p-8 shadow-2xl">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-red-400">Área interna</p>
          <h1 className="mt-3 text-2xl font-semibold">Não foi possível carregar os formulários</h1>
          <p className="mt-3 text-sm leading-6 text-slate-400">
            Verifique a configuração do Supabase e tente recarregar esta página.
          </p>
        </div>
      </main>
    )
  }
}
