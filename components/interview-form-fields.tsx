import type React from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

export type InterviewField = {
  name: string
  question: string
  kind: "text" | "date" | "number" | "textarea" | "select" | "radio"
  required?: boolean
  defaultValue?: string | number
  options?: readonly string[]
}

export type InterviewSection = {
  title: string
  fields: InterviewField[]
}

export const scale10 = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"] as const
export const scale5 = ["1", "2", "3", "4", "5"] as const
export const yesNoSometimes = ["Sim", "Não", "Às vezes"] as const

export function InterviewFieldControl({
  field,
  value,
  onValueChange,
}: {
  field: InterviewField
  value?: string
  onValueChange?: (value: string) => void
}) {
  const label = (
    <Label htmlFor={field.name} className="text-gray-300">
      {field.question}{field.required && " *"}
    </Label>
  )

  if (field.kind === "textarea") {
    return (
      <div className="space-y-2">
        {label}
        <Textarea id={field.name} name={field.name} required={field.required} rows={4} className="min-h-[100px] border-slate-600 bg-slate-700 text-white" />
      </div>
    )
  }

  if (field.kind === "select") {
    return (
      <div className="space-y-2">
        {label}
        <select
          id={field.name}
          name={field.name}
          required={field.required}
          defaultValue=""
          className="flex h-10 w-full rounded-md border border-slate-600 bg-slate-700 px-3 py-2 text-sm text-white outline-none focus-visible:ring-2 focus-visible:ring-yellow-500"
        >
          <option value="" disabled>Selecione</option>
          {field.options?.map((option) => <option key={option} value={option}>{option}</option>)}
        </select>
      </div>
    )
  }

  if (field.kind === "radio") {
    return (
      <fieldset className="space-y-3">
        <legend className="text-sm font-medium text-gray-300">{field.question}{field.required && " *"}</legend>
        <div className="flex flex-wrap gap-4">
          {field.options?.map((option) => (
            <label key={option} className="flex cursor-pointer items-center gap-2 text-sm text-gray-300">
              <input
                type="radio"
                name={field.name}
                value={option}
                required={field.required}
                checked={value === undefined ? undefined : value === option}
                onChange={onValueChange ? () => onValueChange(option) : undefined}
                className="h-4 w-4 accent-yellow-500"
              />
              {option}
            </label>
          ))}
        </div>
      </fieldset>
    )
  }

  return (
    <div className="space-y-2">
      {label}
      <Input
        id={field.name}
        name={field.name}
        type={field.kind}
        required={field.required}
        defaultValue={field.defaultValue}
        min={field.kind === "number" ? 0 : undefined}
        className="border-slate-600 bg-slate-700 text-white"
      />
    </div>
  )
}

export function InterviewSectionBlock({
  section,
  children,
}: {
  section: InterviewSection
  children?: React.ReactNode
}) {
  return (
    <section className="space-y-6 rounded-lg bg-slate-700 p-6">
      <h2 className="border-b border-yellow-600 pb-3 text-xl font-semibold text-yellow-400">{section.title}</h2>
      {section.fields.map((field) => <InterviewFieldControl key={field.name} field={field} />)}
      {children}
    </section>
  )
}

