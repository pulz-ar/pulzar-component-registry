# Definición de Specs para Nuevas Funcionalidades

Nota canónica: Este archivo es la fuente de verdad sobre cómo definir specs. Las specs por dominio (`lib/domain/<contexto>/specs.md`) también son canónicas respecto a su ámbito. Para una guía arquitectónica y ejemplos de implementación, ver `AGENTS.md` en la raíz (explica patrones, estructura del proyecto y cómo crear nuevos módulos), pero la definición normativa vive aquí y en las specs de dominio.

Este documento describe cómo escribir un spec técnico funcional para implementar una nueva funcionalidad en el proyecto. Debe ser claro, accionable y verificable. Incluye una plantilla lista para copiar, una checklist de secciones obligatorias y ejemplos reales del repo.

Referencias útiles (según el tema de la funcionalidad):
- Diseño de APIs REST: https://restfulapi.net/
- GraphQL (si aplica): https://graphql.org/learn/
- OAuth 2.0 (si aplica): RFC 6749
- Accesibilidad (WCAG): https://www.w3.org/WAI/standards-guidelines/wcag/

---

## ¿Cuándo escribir un spec?

- Antes de implementar cualquier funcionalidad no trivial que: cambie el modelo de datos, exponga nuevas APIs, requiera integraciones externas, o afecte la seguridad.
- Si involucra múltiples capas (UI, API, dominio, datos), siempre.

---

## Estructura mínima obligatoria (Checklist)

- Goal: objetivo concreto, medible.
- Alcance y Fuera de alcance.
- Historia(s) de usuario y UX/flujo.
- Diseño de datos (InstantDB): entidades, links, permisos, migración.
- API (Next.js Route Handlers): endpoints, métodos, contratos, errores.
- Servicios de dominio: responsabilidad y API pública.
- Integración con auth/tenancy: uso de Clerk y resolución de `orgId` en server.
- Seguridad y cumplimiento: secrets, PII, permisos, mitigaciones.
- Observabilidad: logs, métricas, eventos.
- Testing: unitario, integración, e2e; datos de prueba.
- Rollout/rollback: banderas, migraciones, compatibilidad.
- Variables de entorno y configuración.
- Performance y límites (timeouts, retries, paginado, batch size).
- Accesibilidad e i18n (si aplica).
- Aceptación (DoD): criterios verificables.

---

## Lineamientos por sección

### Goal
- Describe el “por qué” y el resultado esperado. Evitar vaguedades.

### Alcance / Fuera de alcance
- Enumera explícitamente lo que sí/no se hará en este ciclo.

### UX / Flujos
- Pantallas afectadas; navegación; estados vacíos; errores y loading.
- Componentización obligatoria:
  - Si es genérico → `components/`.
  - Si es específico de una ruta → `app/<ruta>/components/`.
  - Siempre en lower-case y autocontenidos (prop-driven, sin dependencias globales ocultas).

### Datos (InstantDB)
- Entidades nuevas o campos nuevos, con tipos.
- Links entre entidades.
- Permisos: reglas en `instant.perms.ts` (asegurar `view` mínimo necesario; `secrets.view=false`).
- Migración: cómo poblar y versionar datos.

### API (Route Handlers)
- Rutas exactas bajo `app/api/...`.
- Métodos, payloads, respuestas, códigos de error.
- Autenticación y scoping por organización con Clerk en server (no pasar `orgId` desde cliente).
- Controladores delgados: delegar toda la lógica de negocio/infra a servicios de `lib/domain/...`. Evitar construir cuerpos de requests a proveedores, lógica de autenticación, persistencia o parsing en el controlador.


### Servicios de dominio (`lib/domain/...`)
- API clara (métodos, tipos), sin filtrar detalles de infraestructura.
- Manejo de errores y límites (timeouts, retries cuando corresponda).
- Organización por responsabilidad:
  - Servicio principal del contexto: `lib/domain/<contexto>/service.ts` (operaciones de negocio: persistencia de conexiones, fetchs al proveedor, etc.).
  - Subservicios especializados: `lib/domain/<contexto>/<subdominio>/service.ts` (ej.: `oauth/service.ts` para autorización, intercambio de tokens y callback).
  - Constantes y helpers de configuración: `lib/domain/<contexto>/constant.ts` (URLs base, helpers de env vars como `get...()` e `is...Enabled()`).
- Los servicios deben exponer `ServiceResult<T>` y nunca arrojar detalles de infraestructura al controlador.


### Seguridad
- Secrets en `secrets` (InstantDB) y nunca visibles al cliente.
- Validaciones de entrada; protección CSRF si aplica; SameSite de cookies; CORS.
- Variables de entorno: no acceder directo desde controladores; resolver mediante helpers en `constant.ts` para validar presencia y dar errores claros.


### Observabilidad
- ¿Qué se loguea? ¿Dónde?
- Métricas clave y eventos para auditoría.

### Testing
- Escenarios felices y errores.
- Falsos (fixtures) de datos y mocks de integraciones externas.

### Rollout / Rollback
- Flags si fuera necesario.
- Pasos para revertir cambios (migraciones incluidas).

### Variables de entorno
- Lista completa y formato esperado (ej.: URLs exactas registradas en proveedores externos).

### Aceptación (Definition of Done)
- Lista corta y verificable de criterios de aceptación.

### Estilo / Código
- Java Style; evitar inline complejos; legibilidad máxima.
- “Prompts” son funcionalidad; no editarlos salvo pedido explícito.

---

## Estructura de carpetas (convención)

- Dominio: `lib/domain/<contexto>/...`
- Constantes por contexto: `lib/domain/<contexto>/constant.ts`
- Subservicios por responsabilidad (si aplica): `lib/domain/<contexto>/<subdominio>/service.ts` (ej.: `oauth/service.ts`)
- Datos: `instant.schema.ts`, `instant.perms.ts`
- API: `app/api/<contexto>/.../route.ts`
- UI: `app/<sección>/...` y `components/...`

---

## Plantilla (copiar y completar)

```markdown
# <NOMBRE DE LA FUNCIÓN / PROYECTO>

## Goal
- <Objetivo medible>

## Alcance
- <Incluye>

## Fuera de alcance
- <Excluye>

## Historias de usuario / UX
- <Escenarios y flujos, componentes y rutas afectadas>

## Datos (InstantDB)
- Entidades:
  - <entity>: { campo: tipo, ... }
- Links:
  - <link>: forward/reverse
- Permisos:
  - <reglas>
- Migración:
  - <pasos>

## API
- Rutas:
  - METHOD /app/api/.../route.ts
- Contratos:
  - Request/Response
- Errores:
  - Lista de códigos y formatos

## Servicios de dominio
- Archivo(s): `lib/domain/<contexto>/...`
- Métodos públicos y responsabilidades

## Seguridad
- Secrets en `secrets` (view: false)
- Validaciones y mitigaciones

## Observabilidad
- Logs, métricas, eventos

## Testing
- Unitario, integración, e2e
- Fixtures/mocks

## Rollout / Rollback
- Plan de despliegue / reversión

## Variables de entorno
- <NOMBRE>=<formato>

## Aceptación (DoD)
- [ ] Criterio 1
- [ ] Criterio 2
```

---

## Patrones aplicables a OAuth 2.0 (si aplica)

- Controladores delgados:
  - `app/api/integration/<proveedor>/auth-url/route.ts` delega en `OAuthService.createAuthorizationUrl`
  - `app/api/integration/<proveedor>/callback/route.ts` delega en `OAuthService.handleCallback`
  - `app/api/integration/<proveedor>/disconnect/route.ts` delega en `<ContextService>.disconnectForOrg`
- Servicios:
  - Servicio principal: `lib/domain/<contexto>/service.ts` (upsert/disconnect/fetch/list)
  - Subservicio OAuth: `lib/domain/<contexto>/oauth/service.ts` (autorización + callback)
- Constantes y helpers: `lib/domain/<contexto>/constant.ts` (URLs base del proveedor, getters de env vars)

---

## Ejemplo real en este repo (para inspirar specs)

- Integración OAuth 2.0 (Mercado Pago):
  - Controladores delgados:
    - `app/api/integration/mercadopago/auth-url/route.ts` → `MercadoPagoOAuthService.createAuthorizationUrl`
    - `app/api/integration/mercadopago/callback/route.ts` → `MercadoPagoOAuthService.handleCallback`
    - `app/api/integration/mercadopago/disconnect/route.ts` → `MercadoPagoIntegrationService.disconnectForOrg`
  - Servicios:
    - Servicio principal: `lib/domain/integrations/mercadopago/service.ts`
    - Subservicio OAuth: `lib/domain/integrations/mercadopago/oauth/service.ts`
  - Constantes y helpers: `lib/domain/integrations/mercadopago/constant.ts`
  - Modelo: `externalConnections`, `secrets`, `oauthSessions`: `instant.schema.ts`
  - Permisos: `instant.perms.ts`
  - UI: `app/platform/organization/integrations/page.tsx`

---

## PowerShell (crear un nuevo spec)

```powershell
ni lib/domain/my-feature-spec.md -ItemType File; Set-Content lib/domain/my-feature-spec.md "# Mi Nueva Funcionalidad`n`n## Goal`n- ...`n"
```

---

## PowerShell (plantillas de organización de código por contexto)

```powershell
# Constantes del proveedor/ámbito
ni lib/domain/<contexto>/constant.ts -ItemType File; Set-Content lib/domain/<contexto>/constant.ts "export const API_BASE=\"https://api.example.com\"`nexport function getClientId(){const v=process.env.CLIENT_ID as string|undefined; if(!v){ throw new Error(\"CLIENT_ID no configurado\") } return v }`n"
;
# Servicio principal del contexto
ni lib/domain/<contexto>/service.ts -ItemType File; Set-Content lib/domain/<contexto>/service.ts "export type ServiceResult<T=any>={ok:true;data:T}|{ok:false;error:string}`nexport class ContextService{}`n"
;
# Subservicio especializado (ej.: oauth)
ni lib/domain/<contexto>/oauth -ItemType Directory; ni lib/domain/<contexto>/oauth/service.ts -ItemType File; Set-Content lib/domain/<contexto>/oauth/service.ts "export class OAuthService{}`n"
```

---

## Checklist final de calidad del spec

- [ ] Claridad: cualquiera del equipo puede ejecutarlo sin preguntas.
- [ ] Completo: cubre datos, API, dominio, UI, seguridad, pruebas y despliegue.
- [ ] Verificable: criterios de aceptación objetivos.
- [ ] Cumple convenciones de carpeta, estilo y componentización.
- [ ] Referencias a archivos reales cuando aplique.

