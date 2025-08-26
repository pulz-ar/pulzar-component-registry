# AGENTS y Apps en Pulzar: arquitectura y guía para crear nuevos módulos

Este documento explica la arquitectura de Pulzar y provee una guía paso a paso para crear nuevas apps/módulos de dominio (por ejemplo `@finance/` o `@integrations/`).

Importante: la fuente de verdad sobre especificaciones es `lib/domain/specs-definition.md` y las `specs.md` dentro de cada dominio. Este documento es explicativo (cómo y por qué), no normativo. Ver sección “Fuente de verdad”.

---

## Fuente de verdad y relación con Specs

- Máxima fuente de verdad: `lib/domain/specs-definition.md` (marco y plantilla obligatoria) y las `lib/domain/<contexto>/specs.md` de cada dominio.
- Este `AGENTS.md` describe la arquitectura, los patrones y el “cómo implementarlo”.
- Siempre mantener las specs de dominio alineadas con el estado real del código y datos.

Referencias directas en el código:

```1:20:lib/domain/specs-definition.md
# Definición de Specs para Nuevas Funcionalidades

Este documento describe cómo escribir un spec técnico funcional para implementar una nueva funcionalidad en el proyecto. Debe ser claro, accionable y verificable. Incluye una plantilla lista para copiar, una checklist de secciones obligatorias y ejemplos reales del repo.
```

---

## Arquitectura general

- UI (Next.js App Router): páginas y componentes bajo `app/` y `components/`.
- API (Route Handlers): controladores delgados bajo `app/api/...` que delegan en servicios de dominio.
- Dominio: lógica de negocio en `lib/domain/<contexto>/...` con `service.ts`, subservicios y `constant.ts`.
- Datos: modelo y permisos en InstantDB (`instant.schema.ts` y `instant.perms.ts`).
- Jobs/cron/eventos: funciones Inngest en `lib/domain/<contexto>/inngest.ts` (o en `lib/inngest.ts` cuando aplica).

Referencias directas en el código:

```1:20:instant.schema.ts
// Docs: https://www.instantdb.com/docs/modeling-data

import { i } from "@instantdb/core";

const _schema = i.schema({
  entities: {
    organizations: i.entity({
      clerkOrgId: i.string().indexed().unique(),
```

```64:99:instant.perms.ts
// Ejemplo: entidades multi-tenant vinculadas a organización
"entitiesA": {
  "allow": {
    "view": "auth.id in data.ref('organization.members.id')"
  }
},
"entitiesB": {
  "allow": {
    "view": "auth.id in data.ref('organization.members.id')"
  }
},
```

```4:19:lib/domain/<contexto>/inngest.ts
// Ejemplo: cron que encola eventos por organización
export const scheduleJob = inngest.createFunction(
  { id: "<contexto>/schedule" },
  { cron: "0 * * * *" },
  async ({ step }) => {
    try {
      const result = await step.run("enqueueAll", async () => {
        return await MyContextService.enqueueForAllOrganizations()
      })
      return result
```

```1:21:app/api/<contexto>/action/route.ts
import { NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { MyContextService } from "@/lib/domain/my-context/service"

export async function POST(req: NextRequest) {
    const a = await auth()
    if (!a?.userId) {
        return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 })
    }
    const orgId = a.orgId
    if (!orgId) {
        return NextResponse.json({ ok: false, error: "Falta organización" }, { status: 400 })
    }
    const res = await MyContextService.doAction({ orgClerkId: String(orgId) })
```

---

## Estructura de carpetas

- `app/`: UI y APIs por ruta.
  - `app/api/<contexto>/.../route.ts`: controladores delgados que resuelven auth/tenancy con Clerk y delegan en servicios de dominio.
  - `app/platform/<sección>/<contexto>/...`: páginas UI específicas de plataforma.
- `components/`: componentes UI genéricos, reutilizables y autocontenidos.
- `lib/domain/<contexto>/`: servicios de dominio, subservicios y constantes.
  - `constant.ts`: URLs base, helpers de env.
  - `service.ts`: API de dominio (no filtra detalles de infraestructura).
  - `oauth/service.ts` u otros subservicios cuando aplica.
  - `specs.md`: spec del dominio (obligatorio mantener actualizado).
- `instant.schema.ts`: entidades y links.
- `instant.perms.ts`: reglas de permisos por organización.

Ejemplo genérico de endpoints delgados:

```197:205:lib/domain/specs-definition.md
- Endpoints delgados:
  - `app/api/<contexto>/action/route.ts` → `MyContextService.doAction`
  - `app/api/<contexto>/query/route.ts` → `MyContextService.runQuery`
```

---

## Patrón de controladores delgados (API)

Regla: los `route.ts` validan autenticación y organización; delegan al servicio de dominio; no construyen requests complejos ni manejan persistencia.

Referencia directa:

```4:15:app/api/<contexto>/query/route.ts
export async function GET(req: NextRequest) {
  const res = await MyContextService.runQuery({ q: new URL(req.url).searchParams.get("q") })
  if (!res.ok) {
    return NextResponse.json(res, { status: 400 })
  }
  return NextResponse.json(res)
}
```

---

## Patrón de servicios de dominio

- Servicio principal por contexto: `lib/domain/<contexto>/service.ts`.
- Subservicios especializados: `lib/domain/<contexto>/<subdominio>/service.ts`.
- Constantes y helpers: `lib/domain/<contexto>/constant.ts`.
- Contratos retornan `ServiceResult<T>` y mensajes de error claros.

Referencias directas:

```22:41:lib/domain/my-context/service.ts
export class MyContextService {
  static async enqueueForAllOrganizations(): Promise<ServiceResult<{ scheduled: number }>> {
    try {
      const listRes = await MyContextService.listOrganizations()
      if (!listRes.ok) {
        return { ok: false, error: listRes.error }
      }
      let scheduled = 0
      for (const orgId of listRes.data.orgClerkIds) {
        await inngest.send({ name: "my-context/job.requested", data: { orgClerkId: orgId } })
        scheduled++
      }
      return { ok: true, data: { scheduled } }
```

```125:152:lib/domain/my-context/service.ts
static async getSomethingForOrg(params: { clerkOrgId: string }): Promise<ServiceResult<{ value: string }>> {
  try {
    const { clerkOrgId } = params
    const db = getAdminDb()
    const qr: any = await db.query({
      entitiesA: {
        $: {
          where: {
            "organization.clerkOrgId": clerkOrgId,
          },
          limit: 1,
          fields: ["data", "createdAt"],
        },
      },
    })
```

---

## Datos (InstantDB): entidades, links y permisos

Pasos para agregar datos de un nuevo módulo:
1) Definir entidades y campos en `instant.schema.ts` con índices apropiados.
2) Definir links obligatorios con `organizations` para scoping multi-tenant.
3) Asegurar reglas en `instant.perms.ts` para `view` por organización; `secrets.view=false`.

Referencias directas:

```127:162:instant.schema.ts
// Ejemplo de entidades genéricas A y B
entitiesA: i.entity({
  key: i.string().indexed().unique(),
  name: i.string().indexed(),
  status: i.string().indexed(),
  createdAt: i.date().indexed(),
  updatedAt: i.date().indexed().optional(),
}),
entitiesB: i.entity({
  key: i.string().indexed().unique(),
  kind: i.string().indexed(),
  value: i.number().optional(),
  createdAt: i.date(),
  updatedAt: i.date().optional(),
}),
```

```312:325:instant.schema.ts
// Vínculos por organización y relación 1-1 A <> B
entitiesAOrganization: {
  forward: { on: "entitiesA", has: "one", label: "organization" },
  reverse: { on: "organizations", has: "many", label: "entitiesA" },
},
entitiesBOrganization: {
  forward: { on: "entitiesB", has: "one", label: "organization" },
  reverse: { on: "organizations", has: "many", label: "entitiesB" },
},
entityARelatedB: {
  forward: { on: "entitiesA", has: "one", label: "entityB" },
  reverse: { on: "entitiesB", has: "one", label: "entityA" },
},
```

---

## UI y componentización

- Regla: componentes autocontenidos; genéricos en `components/`, específicos de una ruta en `app/<ruta>/components/`; siempre en minúsculas.
- Ejemplo de componentes de transacciones en plataforma:

```1:12:app/platform/transactions/components/transactions-table.tsx
"use client"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
// ...
```

---

## Crear un nuevo módulo (genérico)

Checklist de alto nivel:
1) Escribir/actualizar el spec del dominio en `lib/domain/<contexto>/specs.md` siguiendo `lib/domain/specs-definition.md`.
2) Modelar entidades y links en `instant.schema.ts` y permisos en `instant.perms.ts`.
3) Implementar servicios en `lib/domain/<contexto>/service.ts` y subservicios.
4) Crear controladores delgados en `app/api/<contexto>/.../route.ts`.
5) Implementar UI componentizada en `app/<sección>/<contexto>/...` y/o `components/`.
6) (Opcional) Jobs/eventos Inngest en `lib/domain/<contexto>/inngest.ts`.

Plantillas (PowerShell):

```powershell
# Crear contexto base
ni lib/domain/my-context -ItemType Directory; ni lib/domain/my-context/constant.ts -ItemType File; ni lib/domain/my-context/service.ts -ItemType File;
Set-Content lib/domain/my-context/constant.ts "export const API_BASE=\"https://api.example.com\"`nexport function getEnvVar(name:string){const v=process.env[name] as string|undefined; if(!v){ throw new Error(name+\" no configurado\") } return v }`n";
Set-Content lib/domain/my-context/service.ts "export type ServiceResult<T=any>={ok:true;data:T}|{ok:false;error:string}`nexport class MyContextService{}`n";

# Subservicio especializado (ej.: oauth)
ni lib/domain/my-context/oauth -ItemType Directory; ni lib/domain/my-context/oauth/service.ts -ItemType File;
Set-Content lib/domain/my-context/oauth/service.ts "export class OAuthService{}`n";

# Spec del dominio
ni lib/domain/my-context/specs.md -ItemType File; Set-Content lib/domain/my-context/specs.md "# My Context`n`n(Completar siguiendo lib/domain/specs-definition.md)\n";
```

---

## Seguridad y tenancy

- Resolver usuario y organización en server con Clerk en cada controlador.
- No exponer `secrets` al cliente; `secrets.view=false` en `instant.perms.ts`.
- Variables de entorno se resuelven mediante helpers en `constant.ts`.

Referencia directa:

```90:106:instant.perms.ts
// Secrets: no exponer vía cliente. Operaciones administrativas via admin token.
"secrets": {
  "allow": {
    "view": "false"
  }
},
```

---

## Observabilidad y tareas programadas

- Usar Inngest para cron/eventos; envolver en try/catch y retornar `{ ok|error }`.

Referencia directa:

```21:35:lib/domain/finance/inngest.ts
export const syncMercadoPagoForOrg = inngest.createFunction(
  { id: "finance/mp.sync.org" },
  { event: "finance/mp.sync.requested" },
  async ({ event, step }) => {
    const orgClerkId = String((event.data as any)?.orgClerkId || "")
    try {
      const result = await step.run("syncOrg", async () => {
        return await FinanceService.handleSyncRequestedEvent({ orgClerkId })
      })
      return result
```

---

## Ejemplo completo: Módulo genérico

- Controladores delgados: `action`, `query`, `disconnect` (si aplica), `me` (si aplica).
- Servicio principal: `lib/domain/my-context/service.ts`.
- Subservicios: `lib/domain/my-context/<subdominio>/service.ts` (opcional).
- Constantes/env: `lib/domain/my-context/constant.ts`.

Referencias directas:

```1:20:lib/domain/my-context/constant.ts
export const API_BASE = "https://api.example.com"
export function getEnvVar(name:string){const v=process.env[name] as string|undefined; if(!v){ throw new Error(name+" no configurado") } return v }
```

---

## Integración ejemplo (GitHub opcional)

- Controladores delgados:
  - `app/api/integration/github/auth-url/route.ts` → `GitHubOAuthService.createAuthorizationUrl`
  - `app/api/integration/github/callback/route.ts` → `GitHubOAuthService.handleCallback`
  - `app/api/integration/github/disconnect/route.ts` → `GitHubOAuthService.disconnectForOrg`
  - `app/api/integration/github/me/route.ts` → `GitHubIntegrationService.getViewer`
  - `app/api/integration/github/orgs/route.ts` → `GitHubIntegrationService.listUserOrganizations`
  - `app/api/integration/github/repos/route.ts` → `GitHubIntegrationService.listRepositories`
  - `app/api/integration/github/access-token/route.ts` → server-to-server token

- Servicio principal: `lib/domain/integrations/github/service.ts`.
- Subservicio OAuth: `lib/domain/integrations/github/oauth/service.ts`.
- Constantes/env: `lib/domain/integrations/github/constant.ts`.

UI plataforma:

```1:60:app/platform/organization/integrations/page.tsx
// Tarjeta GitHub + componente de sesión CLI en ruta
```

DevOps:

```1:120:../pulzar-devops/app/api/github/cli-run/route.ts
// SSE que ejecuta: clone, checkout feature/<name>, git add/commit/push con progreso
```

---

## Checklist de aceptación (DoD) para un nuevo módulo

- Spec del dominio creado y actualizado (`lib/domain/<contexto>/specs.md`).
- Entidades, links e índices definidos en `instant.schema.ts`.
- Permisos por organización en `instant.perms.ts` (`view` mínimo; `secrets.view=false`).
- Servicios y subservicios con `ServiceResult<T>` y errores claros.
- Controladores delgados bajo `app/api/<contexto>/...` que delegan en servicios.
- UI componentizada: genéricos en `components/`, específicos en `app/<ruta>/components/`.
- Variables de entorno documentadas en la spec.
- Logs/observabilidad y (si aplica) jobs/eventos Inngest.

---

## PowerShell (scaffolding rápido)

```powershell
# Crear spec base del contexto y archivos de servicio/constantes
ni lib/domain/new-feature -ItemType Directory; ni lib/domain/new-feature/constant.ts -ItemType File; ni lib/domain/new-feature/service.ts -ItemType File;
Set-Content lib/domain/new-feature/constant.ts "export const API_BASE=\"https://api.example.com\"`nexport function getEnvOrThrow(k:string){const v=process.env[k] as string|undefined; if(!v){ throw new Error(k+\" no configurado\") } return v }`n";
Set-Content lib/domain/new-feature/service.ts "export type ServiceResult<T=any>={ok:true;data:T}|{ok:false;error:string}`nexport class NewFeatureService{}`n";
ni lib/domain/new-feature/specs.md -ItemType File; Set-Content lib/domain/new-feature/specs.md "# New Feature`n`n(Completar siguiendo lib/domain/specs-definition.md)\n";
```

---

## Notas de estilo y convenciones

- Java Style; evitar inline complejos; máxima legibilidad.
- Componentes en minúsculas y autocontenidos.
- Los “prompts” son funcionalidad: no editarlos salvo pedido explícito.


