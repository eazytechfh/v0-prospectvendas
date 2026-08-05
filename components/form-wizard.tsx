"use client"

import type React from "react"
import { Children, useEffect, useRef, useState } from "react"
import { ArrowLeft, ArrowRight, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export function FormWizard({
  steps,
  children,
  submitLabel,
  submittingLabel = "Enviando...",
  isSubmitting = false,
  resetKey = 0,
  secondaryFinalLabel,
  onSecondaryFinalAction,
  finalMessage,
}: {
  steps: string[]
  children: React.ReactNode
  submitLabel: string
  submittingLabel?: string
  isSubmitting?: boolean
  resetKey?: number
  secondaryFinalLabel?: string
  onSecondaryFinalAction?: () => void
  finalMessage?: React.ReactNode
}) {
  const [currentStep, setCurrentStep] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)
  const contents = Children.toArray(children)
  const lastStep = steps.length - 1

  useEffect(() => {
    setCurrentStep(0)
  }, [resetKey])

  const goToStep = (step: number) => {
    setCurrentStep(step)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const afterValidation = (action: (form: HTMLFormElement) => void) => {
    const form = containerRef.current?.closest("form")
    if (!form) return

    if (!form.checkValidity()) {
      const invalidField = form.querySelector<HTMLElement>(":invalid")
      const invalidStep = invalidField?.closest<HTMLElement>("[data-wizard-step]")
      const stepIndex = Number(invalidStep?.dataset.wizardStep ?? 0)
      setCurrentStep(stepIndex)
      window.requestAnimationFrame(() => invalidField?.focus())
      return
    }

    action(form)
  }

  return (
    <div ref={containerRef} className="space-y-6">
      <div className="rounded-2xl border border-slate-700 bg-slate-900/50 p-4">
        <div className="mb-2 flex items-center justify-between text-sm">
          <span className="font-medium text-yellow-400">Progresso {currentStep + 1}/{steps.length}</span>
          <span className="text-slate-400">{steps[currentStep]}</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-slate-700">
          <div className="h-full rounded-full bg-yellow-500 transition-all duration-300" style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }} />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[250px_minmax(0,1fr)]">
        <nav aria-label="Etapas do formulário" className="grid gap-2 sm:grid-cols-2 lg:grid-cols-1 lg:self-start">
          {steps.map((step, index) => (
            <button
              key={step}
              type="button"
              onClick={() => goToStep(index)}
              className={cn(
                "flex items-center gap-3 rounded-xl border px-3 py-3 text-left text-sm transition-colors",
                index === currentStep
                  ? "border-yellow-500/70 bg-yellow-500/10 font-semibold text-yellow-300"
                  : "border-slate-700 bg-slate-900/60 text-slate-300 hover:border-slate-600 hover:bg-slate-800",
              )}
            >
              <span className={cn("flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs", index === currentStep ? "bg-yellow-500 text-slate-950" : "bg-slate-700 text-slate-300")}>
                {index < currentStep ? <Check className="h-4 w-4" /> : index + 1}
              </span>
              <span className="leading-5">{step}</span>
            </button>
          ))}
        </nav>

        <div className="min-w-0">
          {contents.map((content, index) => (
            <div key={index} data-wizard-step={index} className={index === currentStep ? "block" : "hidden"}>
              {content}
            </div>
          ))}

          {currentStep === lastStep && finalMessage}

          <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
            <Button type="button" variant="outline" disabled={currentStep === 0 || isSubmitting} onClick={() => goToStep(currentStep - 1)} className="gap-2 border-slate-600 bg-slate-800 text-white hover:bg-slate-700 hover:text-white">
              <ArrowLeft className="h-4 w-4" />Voltar
            </Button>
            {currentStep < lastStep ? (
              <Button type="button" onClick={() => goToStep(currentStep + 1)} className="gap-2 bg-yellow-600 font-semibold text-black hover:bg-yellow-700">
                Avançar<ArrowRight className="h-4 w-4" />
              </Button>
            ) : (
              <div className="flex flex-col gap-3 sm:flex-row">
                {secondaryFinalLabel && onSecondaryFinalAction && (
                  <Button type="button" variant="outline" disabled={isSubmitting} onClick={() => afterValidation(() => onSecondaryFinalAction())} className="border-slate-600 bg-slate-800 text-white hover:bg-slate-700 hover:text-white">
                    {secondaryFinalLabel}
                  </Button>
                )}
                <Button type="button" disabled={isSubmitting} onClick={() => afterValidation((form) => form.requestSubmit())} className="bg-yellow-600 font-semibold text-black hover:bg-yellow-700">
                  {isSubmitting ? submittingLabel : submitLabel}
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
