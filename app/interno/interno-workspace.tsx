"use client"

import { useEffect, useMemo, useState } from "react"
import { createBrowserClient } from "@supabase/ssr"
import {
  ArrowRight,
  Bell,
  Building2,
  CalendarDays,
  ClipboardList,
  Download,
  FileText,
  Search,
  Trash2,
  Users,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ProspectLogo } from "@/components/prospect-logo"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import type { FormSubmission } from "@/lib/form-submissions"
import { cn } from "@/lib/utils"

type Block = "servicos" | "contabilidade" | "diretoria" | "equipe_comercial"
type FilterableBlock = Block
type SubmissionFilters = { company: string; dateFrom: string; dateTo: string }
const submissionsPerPage = 5
const emptyFilters: SubmissionFilters = { company: "", dateFrom: "", dateTo: "" }

const formTypeLabels: Record<FormSubmission["form_type"], string> = {
  apc_servicos: "APC Serviços",
  apc_contabilidade: "APC Contabilidade",
  entrevista_diretoria: "Entrevista Diretoria",
  entrevista_equipe_comercial: "Entrevista Equipe Comercial",
}

const blocks = [
  {
    id: "servicos" as const,
    title: "APC Serviços",
    description: "Diagnósticos comerciais",
    icon: FileText,
  },
  {
    id: "contabilidade" as const,
    title: "APC Contabilidade",
    description: "Diagnósticos contábeis",
    icon: Building2,
  },
  {
    id: "diretoria" as const,
    title: "Entrevista Diretoria",
    description: "Entrevistas com a direção",
    icon: ClipboardList,
  },
  {
    id: "equipe_comercial" as const,
    title: "Entrevista Equipe Comercial",
    description: "Entrevistas por colaborador",
    icon: Users,
  },
]

function formatDate(date: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
    timeZone: "America/Sao_Paulo",
  }).format(new Date(date))
}

function dateInSaoPaulo(date: string) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Sao_Paulo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date(date))
  const value = Object.fromEntries(parts.map((part) => [part.type, part.value]))
  return `${value.year}-${value.month}-${value.day}`
}

function companyName(submission: FormSubmission) {
  return submission.company_name?.trim() || "Empresa não informada"
}

function submissionListName(submission: FormSubmission) {
  if (submission.form_type !== "entrevista_equipe_comercial") return companyName(submission)

  const memberAnswer = submission.answers.find((answer) => answer.question === "Nome do Membro")?.answer
  const memberName = typeof memberAnswer === "string" ? memberAnswer.trim() : ""
  return memberName ? `${memberName} · ${companyName(submission)}` : companyName(submission)
}

function SubmissionDetail({
  submission,
  onClose,
  onDelete,
}: {
  submission: FormSubmission | null
  onClose: () => void
  onDelete: (id: string) => Promise<void>
}) {
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState("")

  const closeDeleteConfirmation = () => {
    if (isDeleting) return
    setShowDeleteConfirmation(false)
    setDeleteError("")
  }

  const deleteSubmission = async () => {
    if (!submission || isDeleting) return

    setIsDeleting(true)
    setDeleteError("")

    try {
      await onDelete(submission.id)
      setShowDeleteConfirmation(false)
      onClose()
    } catch (error) {
      console.error("Falha ao excluir formulário:", error)
      setDeleteError("Não foi possível excluir o formulário. Tente novamente.")
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <>
      <Dialog open={Boolean(submission)} onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="max-h-[92vh] max-w-4xl overflow-hidden border-slate-700 bg-slate-900 p-0 text-slate-100">
          {submission && (
            <>
            <DialogHeader className="border-b border-slate-800 px-6 py-5 pr-14">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-400">
                    {formTypeLabels[submission.form_type]}
                  </p>
                  <DialogTitle className="mt-2 text-2xl text-white">{companyName(submission)}</DialogTitle>
                  <p className="mt-2 flex items-center gap-2 text-sm text-slate-400">
                    <CalendarDays className="h-4 w-4" />
                    {formatDate(submission.created_at)}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button asChild className="gap-2 bg-amber-500 text-slate-950 hover:bg-amber-400">
                    <a href={`/api/pdf/${submission.id}`} download>
                      <Download className="h-4 w-4" />
                      Baixar PDF
                    </a>
                  </Button>
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    aria-label="Excluir formulário"
                    onClick={() => setShowDeleteConfirmation(true)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </DialogHeader>

            <div className="max-h-[calc(92vh-150px)] overflow-y-auto px-6 py-6">
              <div className="space-y-4">
                {submission.answers.map((item, index) => (
                  <article key={`${index}-${item.question}`} className="rounded-xl border border-slate-800 bg-slate-950/70 p-5">
                    <p className="text-sm font-medium leading-6 text-slate-300">{item.question}</p>
                    {Array.isArray(item.answer) ? (
                      item.answer.length > 0 ? (
                        <ul className="mt-3 space-y-2 text-sm text-white">
                          {item.answer.map((answer) => (
                            <li key={answer} className="flex gap-2">
                              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-400" />
                              <span>{answer}</span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="mt-2 text-sm italic text-slate-500">Não respondido</p>
                      )
                    ) : (
                      <p className={cn("mt-2 whitespace-pre-wrap text-sm leading-6", item.answer ? "text-white" : "italic text-slate-500")}>
                        {item.answer || "Não respondido"}
                      </p>
                    )}
                  </article>
                ))}
              </div>
            </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={showDeleteConfirmation} onOpenChange={(open) => !open && closeDeleteConfirmation()}>
        <DialogContent className="border-slate-700 bg-slate-900 text-slate-100 sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white">Excluir formulário?</DialogTitle>
            <DialogDescription className="pt-2 leading-6 text-slate-300">
              Tem certeza que deseja excluir o formulário de {submission ? companyName(submission) : "esta empresa"}? Essa ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          {deleteError && <p role="alert" className="text-sm text-red-400">{deleteError}</p>}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={closeDeleteConfirmation} disabled={isDeleting}>
              Cancelar
            </Button>
            <Button type="button" variant="destructive" onClick={deleteSubmission} disabled={isDeleting}>
              {isDeleting ? "Excluindo..." : "Excluir"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

function SubmissionList({
  submissions,
  onSelect,
  emptyMessage = "Nenhum formulário recebido",
}: {
  submissions: FormSubmission[]
  onSelect: (submission: FormSubmission) => void
  emptyMessage?: string
}) {
  if (submissions.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-700 bg-slate-900/40 px-6 py-16 text-center">
        <FileText className="mx-auto h-9 w-9 text-slate-600" />
        <p className="mt-4 font-medium text-slate-300">{emptyMessage}</p>
        {emptyMessage === "Nenhum formulário recebido" && <p className="mt-1 text-sm text-slate-500">Os novos envios aparecerão aqui.</p>}
      </div>
    )
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/70">
      {submissions.map((submission) => (
        <button
          key={submission.id}
          type="button"
          onClick={() => onSelect(submission)}
          className="group flex w-full items-center gap-4 border-b border-slate-800 px-5 py-4 text-left transition-colors last:border-b-0 hover:bg-slate-800/80"
        >
          <span className={cn("h-2.5 w-2.5 shrink-0 rounded-full", submission.read ? "bg-slate-600" : "bg-amber-400 shadow-[0_0_12px_rgba(251,191,36,0.5)]")} />
          <span className="min-w-0 flex-1">
            <span className="block truncate font-medium text-white group-hover:text-amber-300">{submissionListName(submission)}</span>
            <span className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-400">
              <span>{formatDate(submission.created_at)}</span>
              <span className={submission.read ? "text-slate-500" : "font-medium text-amber-400"}>
                {submission.read ? "Lido" : "Não lido"}
              </span>
            </span>
          </span>
          <span className="text-xl text-slate-600 transition-transform group-hover:translate-x-1 group-hover:text-amber-400">→</span>
        </button>
      ))}
    </div>
  )
}

export function InternoWorkspace({
  servicosSubmissions,
  contabilidadeSubmissions,
  diretoriaSubmissions,
  equipeComercialSubmissions,
}: {
  servicosSubmissions: FormSubmission[]
  contabilidadeSubmissions: FormSubmission[]
  diretoriaSubmissions: FormSubmission[]
  equipeComercialSubmissions: FormSubmission[]
}) {
  const [activeBlock, setActiveBlock] = useState<Block>("servicos")
  const [selectedSubmission, setSelectedSubmission] = useState<FormSubmission | null>(null)
  const [servicos, setServicos] = useState(servicosSubmissions)
  const [contabilidade, setContabilidade] = useState(contabilidadeSubmissions)
  const [diretoria, setDiretoria] = useState(diretoriaSubmissions)
  const [equipeComercial, setEquipeComercial] = useState(equipeComercialSubmissions)
  const [servicosPage, setServicosPage] = useState(1)
  const [contabilidadePage, setContabilidadePage] = useState(1)
  const [diretoriaPage, setDiretoriaPage] = useState(1)
  const [equipeComercialPage, setEquipeComercialPage] = useState(1)
  const [filters, setFilters] = useState<Record<FilterableBlock, SubmissionFilters>>({
    servicos: { ...emptyFilters },
    contabilidade: { ...emptyFilters },
    diretoria: { ...emptyFilters },
    equipe_comercial: { ...emptyFilters },
  })
  const [notificationQueue, setNotificationQueue] = useState<FormSubmission[]>(() =>
    [...servicosSubmissions, ...contabilidadeSubmissions, ...diretoriaSubmissions, ...equipeComercialSubmissions]
      .filter((submission) => !submission.read)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()),
  )
  const [queueIndex, setQueueIndex] = useState(0)
  const [isAcknowledging, setIsAcknowledging] = useState(false)
  const [acknowledgeError, setAcknowledgeError] = useState("")
  const supabase = useMemo(
    () => createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    ),
    [],
  )

  useEffect(() => {
    const lastPage = Math.max(1, Math.ceil(servicos.length / submissionsPerPage))
    setServicosPage((current) => Math.min(current, lastPage))
  }, [servicos.length])

  useEffect(() => {
    const lastPage = Math.max(1, Math.ceil(contabilidade.length / submissionsPerPage))
    setContabilidadePage((current) => Math.min(current, lastPage))
  }, [contabilidade.length])

  useEffect(() => {
    const lastPage = Math.max(1, Math.ceil(diretoria.length / submissionsPerPage))
    setDiretoriaPage((current) => Math.min(current, lastPage))
  }, [diretoria.length])

  useEffect(() => {
    const lastPage = Math.max(1, Math.ceil(equipeComercial.length / submissionsPerPage))
    setEquipeComercialPage((current) => Math.min(current, lastPage))
  }, [equipeComercial.length])

  useEffect(() => {
    const channel = supabase
      .channel("interno-form-submissions")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "form_submissions" },
        (payload) => {
          const submission = payload.new as FormSubmission

          if (submission.form_type === "apc_servicos") {
            setServicos((current) => [submission, ...current.filter((item) => item.id !== submission.id)])
          } else if (submission.form_type === "apc_contabilidade") {
            setContabilidade((current) => [submission, ...current.filter((item) => item.id !== submission.id)])
          } else if (submission.form_type === "entrevista_diretoria") {
            setDiretoria((current) => [submission, ...current.filter((item) => item.id !== submission.id)])
          } else if (submission.form_type === "entrevista_equipe_comercial") {
            setEquipeComercial((current) => [submission, ...current.filter((item) => item.id !== submission.id)])
          }
          if (!submission.read) {
            setNotificationQueue((current) => current.some((item) => item.id === submission.id)
              ? current
              : [...current, submission])
          }
        },
      )
      .subscribe()

    return () => {
      void supabase.removeChannel(channel)
    }
  }, [supabase])

  const allSubmissions = useMemo(
    () => [...servicos, ...contabilidade, ...diretoria, ...equipeComercial].sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    ),
    [contabilidade, diretoria, equipeComercial, servicos],
  )
  const unreadCount = allSubmissions.filter((submission) => !submission.read).length
  const latestNotifications = allSubmissions.slice(0, 10)
  const currentNotification = notificationQueue[queueIndex] ?? null

  const acknowledgeNotification = async () => {
    if (!currentNotification || isAcknowledging) return

    setIsAcknowledging(true)
    setAcknowledgeError("")
    const { error } = await supabase
      .from("form_submissions")
      .update({ read: true })
      .eq("id", currentNotification.id)

    if (error) {
      console.error("Falha ao marcar notificação como visualizada:", error)
      setAcknowledgeError("Não foi possível confirmar a visualização. Tente novamente.")
      setIsAcknowledging(false)
      return
    }

    const markAsRead = (items: FormSubmission[]) => items.map((item) =>
      item.id === currentNotification.id ? { ...item, read: true } : item,
    )
    setServicos(markAsRead)
    setContabilidade(markAsRead)
    setDiretoria(markAsRead)
    setEquipeComercial(markAsRead)

    if (queueIndex < notificationQueue.length - 1) {
      setQueueIndex((current) => current + 1)
    } else {
      setNotificationQueue([])
      setQueueIndex(0)
    }
    setIsAcknowledging(false)
  }

  const deleteSubmission = async (submissionId: string) => {
    const { error } = await supabase
      .from("form_submissions")
      .delete()
      .eq("id", submissionId)
      .select("id")
      .single()

    if (error) throw error

    const removeSubmission = (items: FormSubmission[]) => items.filter((item) => item.id !== submissionId)
    setServicos(removeSubmission)
    setContabilidade(removeSubmission)
    setDiretoria(removeSubmission)
    setEquipeComercial(removeSubmission)
    setNotificationQueue(removeSubmission)
  }

  const blockSubmissions = activeBlock === "servicos" ? servicos
      : activeBlock === "contabilidade" ? contabilidade
        : activeBlock === "diretoria" ? diretoria
          : equipeComercial
  const activeFilters = filters[activeBlock]
  const hasActiveFilters = Boolean(activeFilters.company || activeFilters.dateFrom || activeFilters.dateTo)
  const filteredSubmissions = blockSubmissions.filter((submission) => {
    const companyMatches = companyName(submission)
      .toLocaleLowerCase("pt-BR")
      .includes(activeFilters.company.trim().toLocaleLowerCase("pt-BR"))
    const submissionDate = dateInSaoPaulo(submission.created_at)
    const afterStart = !activeFilters.dateFrom || submissionDate >= activeFilters.dateFrom
    const beforeEnd = !activeFilters.dateTo || submissionDate <= activeFilters.dateTo
    return companyMatches && afterStart && beforeEnd
  })
  const currentPage = activeBlock === "servicos" ? servicosPage
    : activeBlock === "contabilidade" ? contabilidadePage
      : activeBlock === "diretoria" ? diretoriaPage
        : equipeComercialPage
  const totalPages = Math.max(1, Math.ceil(filteredSubmissions.length / submissionsPerPage))
  const visibleSubmissions = filteredSubmissions.slice(
    (currentPage - 1) * submissionsPerPage,
    currentPage * submissionsPerPage,
  )
  const setCurrentPage = activeBlock === "servicos" ? setServicosPage
    : activeBlock === "contabilidade" ? setContabilidadePage
      : activeBlock === "diretoria" ? setDiretoriaPage
        : setEquipeComercialPage

  const resetBlockPage = (block: FilterableBlock) => {
    if (block === "servicos") setServicosPage(1)
    else if (block === "contabilidade") setContabilidadePage(1)
    else if (block === "diretoria") setDiretoriaPage(1)
    else setEquipeComercialPage(1)
  }

  const updateFilter = (block: FilterableBlock, field: keyof SubmissionFilters, value: string) => {
    setFilters((current) => ({
      ...current,
      [block]: { ...current[block], [field]: value },
    }))
    resetBlockPage(block)
  }

  const clearFilters = (block: FilterableBlock) => {
    setFilters((current) => ({ ...current, [block]: { ...emptyFilters } }))
    resetBlockPage(block)
  }

  useEffect(() => {
    setCurrentPage((page) => Math.min(page, totalPages))
  }, [activeBlock, filteredSubmissions.length, setCurrentPage, totalPages])

  const activeConfig = blocks.find((block) => block.id === activeBlock) ?? blocks[0]
  const filterBlock: FilterableBlock = activeBlock

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <div className="border-b border-slate-800 bg-slate-950/95">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-5 py-5 lg:px-8">
          <ProspectLogo />

          <Popover>
            <PopoverTrigger asChild>
              <button
                type="button"
                aria-label={`${unreadCount} notificações não lidas`}
                className="relative rounded-xl border border-slate-800 bg-slate-900 p-2.5 text-slate-300 transition-colors hover:border-slate-700 hover:text-amber-300"
              >
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <span className="absolute -right-2 -top-2 flex min-h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white ring-2 ring-slate-950">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </button>
            </PopoverTrigger>
            <PopoverContent align="end" sideOffset={10} className="w-[min(380px,calc(100vw-2rem))] border-slate-700 bg-slate-900 p-0 text-slate-100">
              <div className="border-b border-slate-800 px-4 py-3">
                <p className="font-semibold text-white">Notificações</p>
                <p className="mt-0.5 text-xs text-slate-500">Últimos 10 formulários recebidos</p>
              </div>
              <div className="max-h-96 overflow-y-auto">
                {latestNotifications.length === 0 ? (
                  <p className="px-4 py-8 text-center text-sm text-slate-500">Nenhuma notificação.</p>
                ) : latestNotifications.map((submission) => (
                  <button
                    key={submission.id}
                    type="button"
                    onClick={() => setSelectedSubmission(submission)}
                    className="flex w-full gap-3 border-b border-slate-800 px-4 py-3 text-left last:border-0 hover:bg-slate-800/70"
                  >
                    <span className={cn("mt-1.5 h-2 w-2 shrink-0 rounded-full", submission.read ? "bg-slate-600" : "bg-amber-400")} />
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-medium text-white">{companyName(submission)}</span>
                      <span className="mt-1 block text-xs text-slate-400">{formTypeLabels[submission.form_type]} · {formatDate(submission.created_at)}</span>
                    </span>
                  </button>
                ))}
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <div className="mx-auto grid max-w-7xl gap-8 px-5 py-8 lg:grid-cols-[300px_minmax(0,1fr)] lg:px-8 lg:py-10">
        <aside>
          <p className="mb-3 px-1 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Blocos</p>
          <nav className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
            {blocks.map((block) => {
              const Icon = block.icon
              const active = block.id === activeBlock

              return (
                <button
                  key={block.id}
                  type="button"
                  onClick={() => setActiveBlock(block.id)}
                  className={cn(
                    "flex items-start gap-3 rounded-2xl border p-4 text-left transition-all",
                    active
                      ? "border-amber-400/60 bg-amber-400/10 shadow-[0_12px_35px_rgba(0,0,0,0.2)]"
                      : "border-slate-800 bg-slate-900/70 hover:border-slate-700 hover:bg-slate-900",
                  )}
                >
                  <span className={cn("rounded-xl p-2", active ? "bg-amber-400 text-slate-950" : "bg-slate-800 text-slate-400")}>
                    <Icon className="h-5 w-5" />
                  </span>
                  <span>
                    <span className={cn("block text-sm font-semibold", active ? "text-amber-300" : "text-white")}>{block.title}</span>
                    <span className="mt-1 block text-xs leading-5 text-slate-500">{block.description}</span>
                  </span>
                </button>
              )
            })}
          </nav>
        </aside>

        <section className="min-w-0">
          <div className="mb-6 flex flex-col gap-2 border-b border-slate-800 pb-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-medium text-amber-400">Arquivo de formulários</p>
              <h1 className="mt-1 text-3xl font-semibold tracking-tight text-white">{activeConfig.title}</h1>
            </div>
            <p className="text-sm text-slate-500">
              {filteredSubmissions.length} {filteredSubmissions.length === 1 ? "registro" : "registros"}
            </p>
          </div>

          {filterBlock && (
            <div className="mb-5 rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
              <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_180px_180px_auto] lg:items-end">
                <div className="space-y-2">
                  <label htmlFor={`company-filter-${filterBlock}`} className="text-xs font-medium uppercase tracking-wide text-slate-400">
                    Buscar por empresa
                  </label>
                  <div className="relative">
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                    <Input
                      id={`company-filter-${filterBlock}`}
                      type="text"
                      value={activeFilters.company}
                      onChange={(event) => updateFilter(filterBlock, "company", event.target.value)}
                      className="border-slate-700 bg-slate-950 pl-9 text-white"
                      aria-label="Buscar por nome da empresa"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label htmlFor={`date-from-${filterBlock}`} className="text-xs font-medium uppercase tracking-wide text-slate-400">De</label>
                  <Input
                    id={`date-from-${filterBlock}`}
                    type="date"
                    value={activeFilters.dateFrom}
                    max={activeFilters.dateTo || undefined}
                    onChange={(event) => updateFilter(filterBlock, "dateFrom", event.target.value)}
                    className="border-slate-700 bg-slate-950 text-white [color-scheme:dark]"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor={`date-to-${filterBlock}`} className="text-xs font-medium uppercase tracking-wide text-slate-400">Até</label>
                  <Input
                    id={`date-to-${filterBlock}`}
                    type="date"
                    value={activeFilters.dateTo}
                    min={activeFilters.dateFrom || undefined}
                    onChange={(event) => updateFilter(filterBlock, "dateTo", event.target.value)}
                    className="border-slate-700 bg-slate-950 text-white [color-scheme:dark]"
                  />
                </div>
                {hasActiveFilters && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => clearFilters(filterBlock)}
                    className="border-slate-700 bg-slate-900 text-slate-200 hover:bg-slate-800 hover:text-white"
                  >
                    Limpar filtros
                  </Button>
                )}
              </div>
            </div>
          )}

          <SubmissionList
            submissions={visibleSubmissions}
            onSelect={setSelectedSubmission}
            emptyMessage={hasActiveFilters ? "Nenhum formulário encontrado com esses filtros." : undefined}
          />

          {filteredSubmissions.length > 0 && (
            <div className="mt-5 flex flex-col items-center justify-between gap-3 rounded-xl border border-slate-800 bg-slate-900/50 px-4 py-3 sm:flex-row">
              <p className="text-sm text-slate-400">Página {currentPage} de {totalPages}</p>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((page) => page - 1)}
                  className="border-slate-700 bg-slate-900 text-slate-200 hover:bg-slate-800 hover:text-white"
                >
                  Anterior
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((page) => page + 1)}
                  className="border-slate-700 bg-slate-900 text-slate-200 hover:bg-slate-800 hover:text-white"
                >
                  Próxima
                </Button>
              </div>
            </div>
          )}
        </section>
      </div>

      <SubmissionDetail
        submission={selectedSubmission}
        onClose={() => setSelectedSubmission(null)}
        onDelete={deleteSubmission}
      />

      <Dialog open={Boolean(currentNotification)} onOpenChange={() => undefined}>
        <DialogContent
          showCloseButton={false}
          onEscapeKeyDown={(event) => event.preventDefault()}
          onPointerDownOutside={(event) => event.preventDefault()}
          onInteractOutside={(event) => event.preventDefault()}
          className="border-amber-400/40 bg-slate-900 text-slate-100 sm:max-w-md"
        >
          {currentNotification && (
            <>
              <DialogHeader>
                <div className="mb-2 flex items-center justify-between gap-4">
                  <span className="rounded-full bg-amber-400/15 px-3 py-1 text-xs font-semibold text-amber-300">
                    {queueIndex + 1} de {notificationQueue.length}
                  </span>
                  <Bell className="h-5 w-5 text-amber-400" />
                </div>
                <DialogTitle className="text-xl text-white">Novo formulário preenchido</DialogTitle>
                <DialogDescription className="pt-2 leading-6 text-slate-300">
                  A empresa <strong className="font-semibold text-white">{companyName(currentNotification)}</strong> concluiu o preenchimento do formulário <strong className="font-semibold text-white">{formTypeLabels[currentNotification.form_type]}</strong>.
                </DialogDescription>
              </DialogHeader>
              {acknowledgeError && <p role="alert" className="text-sm text-red-400">{acknowledgeError}</p>}
              <Button
                type="button"
                onClick={acknowledgeNotification}
                disabled={isAcknowledging}
                className="mt-2 w-full gap-2 bg-amber-400 font-semibold text-slate-950 hover:bg-amber-300"
              >
                {isAcknowledging ? "Confirmando..." : "Notificação visualizada"}
                {!isAcknowledging && notificationQueue.length > queueIndex + 1 && <ArrowRight className="h-4 w-4" />}
              </Button>
            </>
          )}
        </DialogContent>
      </Dialog>
    </main>
  )
}
