"use client"
import * as React from "react"
import registry from "@/registry.json"
import { Sidebar, Viewer } from "@/components/registry-explorer"

type RegistryItem = {
  name: string
  title?: string
  description?: string
}

export default function Home() {
  const items = React.useMemo(() => {
    const arr = Array.isArray((registry as any)?.items) ? (registry as any).items : []
    const mapped: RegistryItem[] = arr.map((it: any) => {
      return { name: String(it?.name || ""), title: it?.title ? String(it.title) : undefined, description: it?.description ? String(it.description) : undefined }
    })
    return mapped
  }, [])

  const initial = React.useMemo(() => {
    const preferred = items.find((i) => i.name === "pulzar/stories") || items.find((i) => i.name === "pulzar/all")
    if (preferred) {
      return preferred.name
    }
    if (items.length > 0) {
      return items[0].name
    }
    return ""
  }, [items])

  const [selected, setSelected] = React.useState<string>(initial)

  React.useEffect(() => {
    if (initial && selected === "") {
      setSelected(initial)
    }
  }, [initial, selected])

  const current = React.useMemo(() => {
    const found = items.find((i) => i.name === selected)
    if (found) {
      return found
    }
    return { name: "", title: "", description: "" }
  }, [items, selected])

  return (
    <div className="max-w-6xl mx-auto flex flex-col min-h-svh px-4 py-8 gap-6">
      <header className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold tracking-tight">Pulzar Registry</h1>
        <p className="text-muted-foreground">Explora y prueba los wrappers desde el índice del registry.json</p>
      </header>
      <main className="flex flex-col gap-6">
        <div className="grid grid-cols-1 sm:grid-cols-[16rem_1fr] gap-4 items-start">
          <Sidebar items={items} selected={selected} onSelect={setSelected} />
          <div className="flex flex-col gap-4">
            <Viewer item={current} />
            <section className="border rounded-lg p-4">
              <h3 className="text-sm font-medium mb-2">Índice del registry</h3>
              <p className="text-sm text-muted-foreground mb-2">Puedes instalar por URL o por nombre usando el índice.</p>
              <div className="grid gap-2 text-xs">
                <code>GET /registry.json</code>
                <code>GET /r/pulzar/thread.json</code>
                <code>GET /r/pulzar/event.json</code>
                <code>GET /r/pulzar/prompt.json</code>
                <code>GET /r/pulzar/orb.json</code>
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  )
}
