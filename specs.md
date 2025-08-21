# Pulzar Component Registry

## Goal
- Mantener un registry propio con wrappers `@pulzar/*` (Thread, Event, Prompt) que dependan de AI Elements instalados en cada app, sin modificarlos.
- Permitir instalar wrappers vía shadcn CLI (por nombre o URL) y que funcionen tanto en Web como en DevOps.

## Qué se instala dónde
- AI Elements (componentes base): se instalan en cada app, ej.: `npx shadcn@latest add https://registry.ai-sdk.dev/all.json` (crea `@/components/ai-elements/*`).
- Pulzar wrappers (este registry): `pulzar/thread`, `pulzar/event`, `pulzar/prompt`. Importan desde `@/components/ai-elements/*`.

## Estructura
- `registry.json` (raíz): índice del registry para el comando `shadcn build` y `--registry` local.
- `public/r/*.json`: items accesibles por URL directa (`/r/pulzar/thread.json`, etc.).
- Wrappers:
  - `registry/new-york/blocks/pulzar/thread.tsx` → Conversation wrapper.
  - `registry/new-york/blocks/pulzar/event.tsx` → Message universal (text, reasoning, source-url, code, image, inline-citation, loader, suggestion, task, tool, web-preview).
  - `registry/new-york/blocks/pulzar/prompt.tsx` → Prompt Input con botón de voz opcional.

## Uso
- Build del registry (servidor local 3002):
  - `pnpm run registry:build`
- Instalar por nombre (desde índice):
  - `pnpm dlx shadcn@latest add pulzar/thread pulzar/event pulzar/prompt --registry http://localhost:3002/registry.json`
- Instalar por URL directa:
  - `pnpm dlx shadcn@latest add http://localhost:3002/r/pulzar/thread.json`

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

## Notas
- Los wrappers importan desde `@/components/ai-elements/*`. Asegurar que la app instaló AI Elements antes de agregar `@pulzar/*`.
- No incluimos archivos de AI Elements dentro de los items; mantenemos dependencia externa para evitar duplicados y actualizaciones inconsistentes.
