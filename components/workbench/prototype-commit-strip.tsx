import type { ReactNode } from "react"
import { paletteFromSwatches } from "@/lib/ai/preview-theme"
import type { Concept, Palette, Wireframe } from "@/types/domain"

interface PrototypeCommitStripProps {
  concept: Concept
  palette: Palette
  wireframe: Wireframe
}

export function PrototypeCommitStrip({
  concept,
  palette,
  wireframe,
}: PrototypeCommitStripProps) {
  const colors = paletteFromSwatches(palette.swatches)

  return (
    <div
      className="absolute inset-x-4 bottom-[16%] z-[1] mx-auto max-w-5xl"
      role="region"
      aria-label="확정 컨셉·팔레트·와이어프레임"
    >
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
        <StripCard label="컨셉" title={concept.title}>
          <p className="line-clamp-2 text-[11px] leading-relaxed" style={{ color: colors.secondary }}>
            {concept.summary}
          </p>
        </StripCard>
        <StripCard label="팔레트" title={palette.name}>
          <ul className="flex flex-wrap gap-1">
            {palette.swatches.map((swatch) => (
              <li key={swatch.role} className="flex items-center gap-1">
                <span
                  className="h-3.5 w-3.5 rounded-sm border border-black/10"
                  style={{ backgroundColor: swatch.hex }}
                />
                <span className="text-[10px]" style={{ color: colors.secondary }}>
                  {swatch.role}
                </span>
              </li>
            ))}
          </ul>
        </StripCard>
        <StripCard label="와이어프레임" title={wireframe.title}>
          <p className="line-clamp-2 text-[11px] leading-relaxed" style={{ color: colors.secondary }}>
            {wireframe.structureNotes}
          </p>
        </StripCard>
      </div>
    </div>
  )
}

function StripCard({
  label,
  title,
  children,
}: {
  label: string
  title: string
  children: ReactNode
}) {
  return (
    <section className="rounded-lg border border-black/5 bg-white/95 p-3 shadow-sm backdrop-blur">
      <p className="text-[10px] font-medium uppercase tracking-wide text-neutral-500">{label}</p>
      <h3 className="mt-1 truncate text-xs font-semibold text-neutral-900">{title}</h3>
      <div className="mt-1.5">{children}</div>
    </section>
  )
}
