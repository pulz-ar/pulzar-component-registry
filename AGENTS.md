# Pulzar Registry — Agents Guide

## Cómo agregar un nuevo componente al registry

1. Crear el archivo en `registry/new-york/blocks/pulzar/<nombre>.tsx` y exportar el componente.
2. Registrar en `registry.json`:
   - `name`: `pulzar/<nombre>`
   - `type`: `registry:component`
   - `files`: lista con `path` al archivo creado
   - `dependencies` si requiere paquetes NPM
3. Construir JSONs:
```powershell
pnpm run registry:build;
```
4. Verificar en `public/r/pulzar/<nombre>.json` que `files[0].content` esté embebido.

## Cómo instalar desde un proyecto

- Instalar un item puntual (ej. orb):
```powershell
pnpm dlx shadcn@latest add https://registry.pulz.ar/orb;
```

- Instalar todos los wrappers Pulzar:
```powershell
pnpm dlx shadcn@latest add https://registry.pulz.ar/all;
```

## Agents (proceso obligatorio)

Para asegurar que siempre se siga el proceso de specs y guías, instalar el item de documentación `pulzar/agents` en cada proyecto:

```powershell
pnpm dlx shadcn@latest add https://registry.pulz.ar/agents;
```

Esto agrega los archivos de referencia del proceso:

- `AGENTS.md` (guía de arquitectura y patrones del registry)
- `lib/domain/specs-definition.md` (definición normativa de specs)

Referencias directas en el registry:

- Item `pulzar/agents` en `components/pulzar-component-registry/registry.json`
- JSON público: `components/pulzar-component-registry/public/r/pulzar/agents.json`

## Notas

- Imports siempre desde `@/registry/...` al consumir dentro de esta app demo.
- Si el item depende de otros componentes (p.ej. AI Elements), listarlos en `registryDependencies`.

