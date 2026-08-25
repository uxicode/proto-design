import { z } from "zod"
import { SWATCH_ROLES, GENERATION_STEPS } from "@/types/domain"
import {
  COMPONENT_CANDIDATE_COUNT,
  CONCEPT_CANDIDATE_COUNT,
  PALETTE_CANDIDATE_COUNT,
  WIREFRAME_CANDIDATE_COUNT,
} from "@/lib/config/candidates"

export const hexSchema = z
  .string()
  .regex(/^#([0-9A-Fa-f]{6})$/, "hex 형식이 아닙니다.")

export const swatchSchema = z.object({
  role: z.enum(SWATCH_ROLES),
  hex: hexSchema,
})

export const conceptCandidateSchema = z.object({
  title: z.string().min(2).max(40),
  summary: z.string().min(10).max(200),
  visualHints: z.array(z.string()).min(1),
  moodPrompt: z.string().min(1),
})

export const conceptSetSchema = z.object({
  candidates: z.array(conceptCandidateSchema).length(CONCEPT_CANDIDATE_COUNT),
})

export const paletteCandidateSchema = z.object({
  name: z.string().min(1),
  swatches: z
    .array(swatchSchema)
    .length(5)
    .refine(
      (swatches) => SWATCH_ROLES.every((role) => swatches.some((item) => item.role === role)),
      "필수 색 역할이 빠졌습니다."
    ),
})

export const paletteSetSchema = z.object({
  candidates: z.array(paletteCandidateSchema).length(PALETTE_CANDIDATE_COUNT),
})

export const wireframeBlockSchema = z.object({
  id: z.string().min(1),
  role: z.enum(["nav", "hero", "form", "list", "footer", "sidebar", "content"]),
  notes: z.string().min(1),
})

export const wireframeCandidateSchema = z.object({
  title: z.string().min(1),
  structureNotes: z.string().min(1),
  blocks: z.array(wireframeBlockSchema).min(3),
  layoutPrompt: z.string().min(1),
})

export const wireframeSetSchema = z.object({
  candidates: z.array(wireframeCandidateSchema).length(WIREFRAME_CANDIDATE_COUNT),
})

export const componentItemSchema = z.object({
  role: z.enum(["button", "input", "card", "navigation", "badge", "tabs"]),
  variant: z.string().min(1),
  notes: z.string().min(1),
})

export const componentCandidateSchema = z
  .object({
    title: z.string().min(1),
    items: z.array(componentItemSchema).min(4),
    previewPrompt: z.string().min(1),
  })
  .refine((candidate) => {
    const roles = candidate.items.map((item) => item.role)
    return (
      roles.includes("button") &&
      roles.includes("input") &&
      roles.includes("card") &&
      roles.includes("navigation")
    )
  }, "button, input, card, navigation이 각각 최소 1개 필요합니다.")

export const componentSetSchema = z.object({
  candidates: z.array(componentCandidateSchema).length(COMPONENT_CANDIDATE_COUNT),
})

export const artifactStatusSchema = z.enum([
  "candidate",
  "committed",
  "superseded",
  "stale",
])

export const inputSnapshotSchema = z.object({
  projectId: z.string().min(1),
  briefVersion: z.number().int().nonnegative(),
  domainKey: z.enum([
    "healthcare",
    "fintech",
    "ecommerce",
    "education",
    "saas_internal",
    "other",
  ]),
  domainLabel: z.string().min(1),
  keywords: z.array(z.string().min(2).max(30)).min(1).max(15),
  entropy: z.string().optional(),
  avoidTitles: z.array(z.string()).optional(),
  committedConcept: z
    .object({
      id: z.string(),
      title: z.string(),
      summary: z.string(),
      visualHints: z.array(z.string()),
      status: artifactStatusSchema,
    })
    .optional(),
  committedPalette: z
    .object({
      id: z.string(),
      name: z.string(),
      swatches: z.array(swatchSchema),
      status: artifactStatusSchema,
    })
    .optional(),
  committedWireframe: z
    .object({
      id: z.string(),
      title: z.string(),
      structureNotes: z.string(),
      blocks: z.array(wireframeBlockSchema),
      status: artifactStatusSchema,
    })
    .optional(),
  committedComponentSet: z
    .object({
      id: z.string(),
      title: z.string(),
      items: z.array(componentItemSchema),
      status: artifactStatusSchema,
    })
    .optional(),
})

export const generationRequestSchema = z.object({
  projectId: z.string().min(1),
  step: z.enum(GENERATION_STEPS),
  idempotencyKey: z.string().uuid(),
  inputSnapshot: inputSnapshotSchema,
})

export function parseJsonObject(text: string): unknown {
  const trimmed = text.trim()
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/)
  const raw = fenced ? fenced[1] : trimmed
  return JSON.parse(raw)
}
