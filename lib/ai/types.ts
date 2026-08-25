import type { ComponentItem, GenerationStep, InputSnapshot, WireframeBlock } from "@/types/domain"
import type { z } from "zod"
import type {
  componentSetSchema,
  conceptSetSchema,
  paletteSetSchema,
  wireframeSetSchema,
} from "@/lib/generation/schemas"

export interface ImageBlob {
  dataUrl: string
  width?: number
  height?: number
}

export type ConceptTextOutput = z.infer<typeof conceptSetSchema>
export type PaletteTextOutput = z.infer<typeof paletteSetSchema>
export type WireframeTextOutput = z.infer<typeof wireframeSetSchema>
export type ComponentTextOutput = z.infer<typeof componentSetSchema>

export interface TextStructuredAdapter {
  generateConceptSet(input: InputSnapshot): Promise<ConceptTextOutput>
  generatePaletteSet(input: InputSnapshot): Promise<PaletteTextOutput>
  generateWireframeSet(input: InputSnapshot): Promise<WireframeTextOutput>
  generateComponentSet(input: InputSnapshot): Promise<ComponentTextOutput>
}

export interface ImageRequest {
  snapshot: InputSnapshot
  prompt: string
  slot: number
  step: GenerationStep
  title?: string
  blocks?: WireframeBlock[]
  items?: ComponentItem[]
}

export interface ImageGenerationAdapter {
  generateConceptMood(request: ImageRequest, signal: AbortSignal): Promise<ImageBlob>
  generateWireframePreview(request: ImageRequest, signal: AbortSignal): Promise<ImageBlob>
  generateComponentPreview(request: ImageRequest, signal: AbortSignal): Promise<ImageBlob>
  generatePrototype(request: ImageRequest, signal: AbortSignal): Promise<ImageBlob>
}
