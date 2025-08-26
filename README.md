# Pulzar Component Registry

Wrappers `@pulzar/*` instalables vía `shadcn` CLI. Incluye demo en `/`.

## Items disponibles

- `pulzar/thread` – Thread, ThreadContent, ThreadScrollButton
- `pulzar/event` – Evento universal (text, reasoning, source-url, code, image, inline-citation, loader, suggestion, task, tool, web-preview)
- `pulzar/prompt` – Prompt input con botón de voz opcional
- `pulzar/orb` – Orb animado (canvas) con shaders opcionales

## Instalar desde este registry

- Instalar un item por URL:
```powershell
pnpm dlx shadcn@latest add https://registry.pulz.ar/orb;
```

- Instalar todos los wrappers Pulzar de una vez:
```powershell
pnpm dlx shadcn@latest add https://registry.pulz.ar/all;
```

## Desarrollo del registry

- Agregar un item en `registry.json` con su `files` y dependencias.
- Exportar los archivos bajo `registry/new-york/blocks/pulzar/*`.
- Construir los JSON:
```powershell
pnpm run registry:build;
```

Los archivos generados quedan en `public/r/*.json`.

## Uso del Orb con shaders

```tsx
import { Orb } from "@/registry/new-york/blocks/pulzar/orb"

export function Demo() {
  return (
    <Orb width={320} height={320} theme="dark" shader={{ type: "mesh-gradient", colors: ["#5100ff", "#00ff80"], distortion: 1, swirl: 0.8, speed: 0.25, position: "background" }} />
  )
}
```
