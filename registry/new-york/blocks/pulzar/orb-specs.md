# Orb Framework Spec

## Purpose
Component `Orb` renders Pulzar's concentric rotated squares with an animation engine and optional shader overlay masked to the orb surface.

## Component
- File: `registry/new-york/blocks/pulzar/orb.tsx`
- Export: `export function Orb(props: OrbProps)`

## Props (OrbProps)
- `width?: number` – canvas width in px. Default: 360.
- `height?: number` – canvas height in px. Default: 360.
- `initialAnimation?: string` – optional method name to invoke on boot (e.g. `rotate45`, `spin`, `loading`, `idle`).
- `theme?: "dark" | "light"` – sets base color: dark → white, light → black.
- `className?: string` – wrapper div classes.
- `ariaHidden?: boolean` – forward to canvas for decorative use.
- `shader?: {` optional shader layer
  - `type: "mesh-gradient"`
  - `colors?: string[]`
  - `distortion?: number`
  - `swirl?: number`
  - `speed?: number`
  - `position?: "background" | "foreground" | "figure"` – figure applies shader only within orb mask.
  `}`

## Rendering Model
- Engine draws 3 squares (outer ring, middle ring, center solid) rotated 45°.
- Sizes are proportional to min(width, height).
- When `shader.position === "figure"`:
  1) Render shader to an off-screen canvas
  2) Build a mask (union of outer ring, middle ring, and center fill) matching stroke geometry
  3) Composite: destination-in → shader ⊗ mask
  4) No shader is visible outside the orb.

## Key references
- Mask creation and composition
```424:470:registry/new-york/blocks/pulzar/orb.tsx
  private drawShaderMaskedToOrb(shaderCanvas: HTMLCanvasElement): void {
    const ctx = this.ctx
    // build mask into offscreen canvas (mctx), then destination-in
    ...
  }
```
- Shader binding and mode
```817:839:registry/new-york/blocks/pulzar/orb.tsx
  useEffect(() => {
    const canvas = shaderHostRef.current?.querySelector("canvas") as HTMLCanvasElement | null
    ... orbRef.current.setShader(() => shaderCanvasRef.current, mode)
  }, [...])
```

## Animation Engine (OrbEngine)
- Public methods: `rotate45`, `rotate45Center`, `rotate45Middle`, `rotate45External`, `explode`, `spin`, `alert`, `loading`, `reset`.
- Idle animation pulses scale per square.
- Queues support sequential animations per square.

```470:673:registry/new-york/blocks/pulzar/orb.tsx
public rotate45(): void { /* ... */ }
public explode(onComplete?: () => void): void { /* ... */ }
```

## Sizing & Geometry
- Ring mask matches canvas strokes:
  - `outer = size + borderWidth`
  - `inner = size - borderWidth`
- Center mask expands by its stroke width to align with original draw.

```448:466:registry/new-york/blocks/pulzar/orb.tsx
const drawRing = (...) => { rect(outer); rect(inner); fill("evenodd") }
```

## Defaults
- Base color set by `theme`.
- Canvas cleared per frame; shader only applied when `shader.position === "figure"`.

## Future Extensions
- `shader.type` variants
- Parameterized figure (n-rings, gap, angle)
- Programmatic color theming per animation phase

