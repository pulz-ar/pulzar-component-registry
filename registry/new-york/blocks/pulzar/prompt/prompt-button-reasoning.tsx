import React from "react"
import { cn } from "@/lib/utils"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { Info } from "lucide-react"

type ReasoningLevel = 0 | 1 | 2 | 3

interface ModeDef {
  value: ReasoningLevel
  name: string
  headline: string
  details: string
}

const MODES: ModeDef[] = [
  {
    value: 0,
    name: "Apagado",
    headline: "Sin razonamiento adicional",
    details: "Respuestas más rápidas y económicas. No incluye pasos intermedios ni justificaciones.",
  },
  {
    value: 1,
    name: "Básico",
    headline: "Razonamiento ligero",
    details: "Buen equilibrio entre costo y calidad. Traza breve cuando es útil.",
  },
  {
    value: 2,
    name: "Equilibrado",
    headline: "Estructura y justificaciones moderadas",
    details: "Ideal para tareas con varios pasos. Precisión y contexto razonables.",
  },
  {
    value: 3,
    name: "Profundo",
    headline: "Análisis detallado",
    details: "Cadenas de pensamiento extensas. Mayor costo y posible mayor latencia.",
  },
]

function Bars({ level }: { level: ReasoningLevel }) {
  const on = "bg-primary border-primary"
  const off = "bg-transparent border-border"
  return (
    <div className="flex items-end gap-[2px]">
      <span className={["inline-block h-[6px] w-[6px] rounded-[2px] border", level >= 1 ? on : off].join(" ")}></span>
      <span className={["inline-block h-[9px] w-[6px] rounded-[2px] border", level >= 2 ? on : off].join(" ")}></span>
      <span className={["inline-block h-[12px] w-[6px] rounded-[2px] border", level >= 3 ? on : off].join(" ")}></span>
    </div>
  )
}

export function PromptReasoningButton({ value, onChange }: { value?: ReasoningLevel; onChange?: (v: ReasoningLevel) => void }) {
  const level: ReasoningLevel = typeof value === "number" ? value : 1

  function handleChange(next: string) {
    const parsed = Number(next) as ReasoningLevel
    if (onChange) {
      onChange(parsed)
    }
  }

  const active = level > 0
  const current = MODES.find(m => m.value === level) || MODES[1]

  return (
    <Select value={String(level)} onValueChange={handleChange}>
      <Tooltip>
        <TooltipTrigger asChild>
          <SelectTrigger
            aria-label="Razonamiento"
            title="Razonamiento"
            className={cn(
              "h-9 w-9 min-w-0 shrink-0 aspect-square grid place-items-center rounded-lg border p-0",
              "border-border bg-background text-foreground",
              "hover:bg-accent/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent",
              "disabled:opacity-50 disabled:pointer-events-none",
              "[&_svg]:hidden",
              active ? "bg-accent/40 border-accent" : undefined
            )}
          >
            <SelectValue asChild>
              <div>
                <Bars level={level} />
              </div>
            </SelectValue>
          </SelectTrigger>
        </TooltipTrigger>
        <TooltipContent sideOffset={6}>
          <div className="max-w-64">
            <div className="font-medium">Razonamiento: {current.name}</div>
            <div className="opacity-90">
              {current.headline}
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
      <SelectContent>
        {MODES.map(mode => (
          <SelectItem key={mode.value} value={String(mode.value)} className="pr-10">
            <div className="flex w-full items-start gap-3">
              <div className="mt-0.5">
                <Bars level={mode.value} />
              </div>
              <div className="flex-1">
                <div className="text-sm font-medium leading-none">{mode.name}</div>
                <div className="text-xs text-muted-foreground leading-snug">{mode.headline}</div>
              </div>
              <div className="ml-auto pl-2">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button type="button" className="text-muted-foreground/80 hover:text-foreground p-1 rounded-md border border-transparent hover:border-border">
                      <Info className="size-3.5" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent sideOffset={6}>
                    <div className="text-left max-w-72">
                      <div className="font-medium mb-0.5">{mode.name}</div>
                      <div className="opacity-90 mb-1">{mode.details}</div>
                      <ul className="list-disc pl-4 space-y-0.5">
                        <li>Uso recomendado: {mode.value === 0 ? "consultas simples" : mode.value === 1 ? "tareas cotidianas" : mode.value === 2 ? "análisis con varios pasos" : "investigación y diagnóstico"}</li>
                        <li>Coste relativo: {mode.value === 0 ? "Muy bajo" : mode.value === 1 ? "Bajo" : mode.value === 2 ? "Medio" : "Alto"}</li>
                      </ul>
                    </div>
                  </TooltipContent>
                </Tooltip>
              </div>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

export default PromptReasoningButton


