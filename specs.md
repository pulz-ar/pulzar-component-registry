# Pulzar Component Registry

## Goal
- Mantener un registry propio con wrappers `@pulzar/*` (Thread, Event, Prompt) que dependan de AI Elements instalados en cada app, sin modificarlos.
- Permitir instalar wrappers vía shadcn CLI (por nombre o URL) y que funcionen tanto en Web como en DevOps.

## Qué se instala dónde
- AI Elements (componentes base): se instalan en cada app, ej.: `npx shadcn@latest add https://registry.ai-sdk.dev/all.json` (crea `@/components/ai-elements/*`).
- Pulzar wrappers (este registry): `pulzar/thread`, `pulzar/event`, `pulzar/prompt`, `pulzar/orb`. Importan desde `@/components/ai-elements/*`.
  - Tipo de item: ahora todos los items son `registry:block` según la especificación de `registry-item.json`.
  - Target de instalación: los archivos se instalan bajo la carpeta configurada en `components.json` → `components`, dentro de `pulzar/*`. Es decir, `components/pulzar/<nombre>.tsx`.

## Estructura
- `registry.json` (raíz): índice del registry para el comando `shadcn build` y `--registry` local.
- `public/r/*.json`: items accesibles por URL directa (`/r/pulzar/thread.json`, etc.).
  - agregado: `/r/pulzar/orb.json` para el Orb.
- Wrappers:
  - `registry/new-york/blocks/pulzar/thread.tsx` → Conversation wrapper.
  - `registry/new-york/blocks/pulzar/event.tsx` → Message universal (text, reasoning, source-url, code, image, inline-citation, loader, suggestion, task, tool, web-preview).
  - `registry/new-york/blocks/pulzar/prompt.tsx` → Prompt Input con botón de voz opcional.
  - `registry/new-york/blocks/pulzar/orb.tsx` → Orb animado en canvas (Pulzar logo animado).

### Targets y rutas de instalación
- `pulzar/thread` → `pulzar/thread.tsx`
- `pulzar/event` → `pulzar/event.tsx`
- `pulzar/prompt` → `pulzar/prompt.tsx`
- `pulzar/orb` → `pulzar/orb.tsx`

Estas rutas son relativas a la carpeta `components` definida en `components.json` del proyecto que instala los componentes.

## Uso
- Build del registry (servidor local 3002):
  - `pnpm run registry:build`
- Instalar por nombre (desde índice):
  - PowerShell: `pnpm dlx shadcn@latest add pulzar/thread pulzar/event pulzar/prompt --registry http://localhost:3002/registry.json; pnpm dlx shadcn@latest add pulzar/orb --registry http://localhost:3002/registry.json`
- Instalar por URL directa (PowerShell):
  - `pnpm dlx shadcn@latest add http://localhost:3002/r/pulzar/thread.json; pnpm dlx shadcn@latest add http://localhost:3002/r/pulzar/event.json; pnpm dlx shadcn@latest add http://localhost:3002/r/pulzar/prompt.json; pnpm dlx shadcn@latest add http://localhost:3002/r/pulzar/orb.json`

### Instalar todos los wrappers Pulzar de una vez
- Agregado `all.json` en `public/r/all.json` que agrega Thread, Event y Prompt.
- Usar:
  - PowerShell: `pnpm dlx shadcn@latest add http://localhost:3002/r/all.json; pnpm dlx shadcn@latest add http://localhost:3002/r/pulzar/orb.json`

## Convenciones y Schema (shadcn)
- `registry.json` describe items; cada item implementa `registry-item.json`.
- Campos mínimos en items: `name`, `type`, `description`, `files`.
- `dependencies`: paquetes NPM que instalar (ej. `react@^18`).
- `registryDependencies`: nombres o URLs de otros items del registry a instalar.
- Los archivos de items deben vivir bajo `registry/<style>/...`.
- Se pueden crear items “universales” con `target` explícitos.

Referencias:
- registry.json: https://ui.shadcn.com/docs/registry/registry-json
- registry-item.json: https://ui.shadcn.com/docs/registry/registry-item-json
- Examples: https://ui.shadcn.com/docs/registry/examples
- Getting started / FAQ / Open in v0: https://ui.shadcn.com/docs/registry/getting-started, https://ui.shadcn.com/docs/registry/faq, https://ui.shadcn.com/docs/registry/open-in-v0
- AI Elements overview: https://ai-sdk.dev/elements/overview

## Componentes `@pulzar/*`
- **Thread**: wrapper de Conversation (Thread, ThreadContent, ThreadScrollButton).
- **Event**: wrapper universal de “evento” que renderiza múltiples tipos de partes (texto, reasoning, fuentes, código, imagen, etc.).
- **Prompt**: wrapper de Prompt Input con botón de voz opcional.
- **Orb**: componente canvas del logo Pulzar con animaciones (`idle`, `rotate45*`, `explode`, `spin`, `alert`, `loading`).
  - Props adicionales `shader` (opcional):
    - `type: "mesh-gradient"`
    - `colors?: string[]`, `distortion?: number`, `swirl?: number`, `speed?: number`
    - `position?: "figure"` (ahora enmascarado a la figura del Orb)

## Notas
- Los wrappers importan desde `@/components/ai-elements/*`. Asegurar que la app instaló AI Elements antes de agregar `@pulzar/*`.
- No incluimos archivos de AI Elements dentro de los items; mantenemos dependencia externa para evitar duplicados y actualizaciones inconsistentes.
 - La página principal del registry incluye una vista de "Story‑Driven AI" enfocada solo en uso (no definiciones), ver `app/components/stories-docs.tsx`.
