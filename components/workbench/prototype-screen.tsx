"use client"

import { PrototypeCommitStrip } from "@/components/workbench/prototype-commit-strip"
import { PrototypeHtmlLayout } from "@/components/workbench/prototype-html-layout"
import { buildPrototypeHtmlModel } from "@/components/workbench/prototype-html-model"
import { canvasThemeStyle } from "@/lib/canvas/theme"
import { getDisplayArtifact } from "@/lib/canvas/guards"
import {
  kitRadius,
  paletteFromSwatches,
  resolveKitKind,
  resolveLayoutKind,
} from "@/lib/ai/preview-theme"
import type { Project } from "@/types/domain"

interface PrototypeScreenProps {
  project: Project
}

export function PrototypeScreen({ project }: PrototypeScreenProps) {
  const concept = getDisplayArtifact(project.concepts)
  const palette = getDisplayArtifact(project.palettes)
  const wireframe = getDisplayArtifact(project.wireframes)
  const componentSet = getDisplayArtifact(project.componentSets)
  const colors = paletteFromSwatches(palette?.swatches)
  const layout = resolveLayoutKind({
    title: wireframe?.title,
    blocks: wireframe?.blocks,
  })
  const kit = resolveKitKind({
    title: componentSet?.title,
    items: componentSet?.items,
  })
  const model = buildPrototypeHtmlModel(project, concept, wireframe, componentSet)

  return (
    <div
      className="relative flex h-full min-h-full w-full flex-col overflow-hidden pb-40 text-sm"
      style={{
        ...canvasThemeStyle(colors, kitRadius(kit)),
        background: colors.background,
        color: colors.text,
        borderRadius: 16,
      }}
    >
      <PrototypeHtmlLayout layout={layout} model={model} />
      {concept && palette && wireframe ? (
        <PrototypeCommitStrip
          concept={concept}
          palette={palette}
          wireframe={wireframe}
        />
      ) : null}
    </div>
  )
}
