"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface RegistryItemMeta {
  name: string
  title?: string
  description?: string
}

export function Sidebar({ items, selected, onSelect, className }: { items: RegistryItemMeta[]; selected: string; onSelect: (name: string) => void; className?: string }) {
  const handleSelect = (name: string) => {
    onSelect(name)
  }

  return (
    <aside className={cn("w-full sm:w-64 border rounded-lg p-2", className)}>
      <div className="px-2 py-1 border-l-4 border-cyan-500 pl-3">
        <p className="text-xs text-cyan-700 dark:text-cyan-300">Pulzar Registry</p>
      </div>
      <nav className="mt-1 flex flex-col gap-1">
        {items.map((it) => {
          const isActive = it.name === selected
          return (
            <button
              key={it.name}
              type="button"
              className={cn(
                "text-left px-3 py-2 rounded-md border",
                isActive ? "bg-cyan-50 border-cyan-400 text-cyan-900 dark:bg-cyan-900/30 dark:border-cyan-600 dark:text-cyan-100" : "bg-background hover:bg-muted"
              )}
              onClick={() => handleSelect(it.name)}
              aria-current={isActive ? "page" : undefined}
            >
              <div className="text-sm font-medium">{it.title || it.name}</div>
              {it.description && (
                <div className="text-xs text-muted-foreground line-clamp-2">{it.description}</div>
              )}
            </button>
          )
        })}
      </nav>
    </aside>
  )
}


