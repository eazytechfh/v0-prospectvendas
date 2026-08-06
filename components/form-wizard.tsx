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
  const [validatedSteps, setValidatedSteps] = useState<Set<number>>(() => new Set())
  const [invalidSteps, setInvalidSteps] = useState<Set<number>>(() => new Set())
  const [attemptedSteps, setAttemptedSteps] = useState<Set<number>>(() => new Set())
  const containerRef = useRef<HTMLDivElement>(null)
  const contents = Children.toArray(children)
  const lastStep = steps.length - 1

  useEffect(() => {
    setCurrentStep(0)
    setValidatedSteps(new Set())
    setInvalidSteps(new Set())
    setAttemptedSteps(new Set())
  }, [resetKey])

  const goToStep = (step: number) => {
    setCurrentStep(step)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const getStepElement = (step: number) =>
    containerRef.current?.querySelector<HTMLElement>(`[data-wizard-step="${step}"]`)

  const getInvalidField = (step: number) =>
    getStepElement(step)?.querySelector<HTMLElement>("input:invalid, select:invalid, textarea:invalid")

  const validateStep = (step: number) => {
    setAttemptedSteps((previous) => new Set(previous).add(step))

    const invalidField = getInvalidField(step)
    if (invalidField) {
      setInvalidSteps((previous) => new Set(previous).add(step))
      setValidatedSteps((previous) => {
        const next = new Set(previous)
        for (const validatedStep of next) {
          if (validatedStep >= step) next.delete(validatedStep)
        }
        return next
      })
      window.requestAnimationFrame(() => {
        invalidField.focus()
        if ("reportValidity" in invalidField) {
          ;(invalidField as HTMLInputElement).reportValidity()
        }
      })
      return false
    }

    setInvalidSteps((previous) => {
      const next = new Set(previous)
      next.delete(step)
      return next
    })
    setValidatedSteps((previous) => new Set(previous).add(step))
    return true
  }

  const advanceToStep = (targetStep: number) => {
    if (!validateStep(currentStep)) return

    const firstUnvalidatedStep = Array.from({ length: targetStep }, (_, index) => index)
      .find((step) => step !== currentStep && !validatedSteps.has(step))

    goToStep(firstUnvalidatedStep ?? targetStep)
  }

  const handleFieldChange = () => {
    if (!attemptedSteps.has(currentStep)) return

    const hasInvalidField = Boolean(getInvalidField(currentStep))
    setInvalidSteps((previous) => {
      const next = new Set(previous)
      if (hasInvalidField) next.add(currentStep)
      else next.delete(currentStep)
      return next
    })

    if (!hasInvalidField) {
      setValidatedSteps((previous) => new Set(previous).add(currentStep))
    }
  }

  const afterValidation = (action: (form: HTMLFormElement) => void) => {
    const form = containerRef.current?.closest("form")
    if (!form) return

    if (!form.checkValidity()) {
      const invalidField = form.querySelector<HTMLElement>(":invalid")
      const invalidStep = invalidField?.closest<HTMLElement>("[data-wizard-step]")
      const stepIndex = Number(invalidStep?.dataset.wizardStep ?? 0)
      setAttemptedSteps((previous) => new Set(previous).add(stepIndex))
      setInvalidSteps((previous) => new Set(previous).add(stepIndex))
      setCurrentStep(stepIndex)
      window.requestAnimationFrame(() => {
        invalidField?.focus()
        if (invalidField && "reportValidity" in invalidField) {
          ;(invalidField as HTMLInputElement).reportValidity()
        }
      })
      return
    }

    action(form)
  }

  return (
    <div ref={containerRef} className="space-y-6" onInput={handleFieldChange} onChange={handleFieldChange}>
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
              onClick={() => index <= currentStep ? goToStep(index) : advanceToStep(index)}
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
            <div
              key={index}
              data-wizard-step={index}
              data-validation-attempted={attemptedSteps.has(index)}
              className={cn(
                index === currentStep ? "block" : "hidden",
                "[&[data-validation-attempted=true]_input:invalid]:border-red-500 [&[data-validation-attempted=true]_input:invalid]:ring-1 [&[data-validation-attempted=true]_input:invalid]:ring-red-500/40",
                "[&[data-validation-attempted=true]_select:invalid]:border-red-500 [&[data-validation-attempted=true]_select:invalid]:ring-1 [&[data-validation-attempted=true]_select:invalid]:ring-red-500/40",
                "[&[data-validation-attempted=true]_textarea:invalid]:border-red-500 [&[data-validation-attempted=true]_textarea:invalid]:ring-1 [&[data-validation-attempted=true]_textarea:invalid]:ring-red-500/40",
              )}
            >
              {content}
            </div>
          ))}

          {invalidSteps.has(currentStep) && (
            <p role="alert" className="mt-4 rounded-lg border border-red-900/70 bg-red-950/40 px-4 py-3 text-sm text-red-300">
              Preencha os campos obrigatórios destacados antes de avançar.
            </p>
          )}

          {currentStep === lastStep && finalMessage}

          <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
            <Button type="button" variant="outline" disabled={currentStep === 0 || isSubmitting} onClick={() => goToStep(currentStep - 1)} className="gap-2 border-slate-600 bg-slate-800 text-white hover:bg-slate-700 hover:text-white">
              <ArrowLeft className="h-4 w-4" />Voltar
            </Button>
            {currentStep < lastStep ? (
              <Button type="button" onClick={() => advanceToStep(currentStep + 1)} className="gap-2 bg-yellow-600 font-semibold text-black hover:bg-yellow-700">
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
