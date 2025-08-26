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
pnpm dlx shadcn@latest add http://localhost:3002/r/pulzar/orb.json;
```

- Instalar todos los wrappers Pulzar:
```powershell
pnpm dlx shadcn@latest add http://localhost:3002/r/all.json;
```

## Notas

- Imports siempre desde `@/registry/...` al consumir dentro de esta app demo.
- Si el item depende de otros componentes (p.ej. AI Elements), listarlos en `registryDependencies`.

