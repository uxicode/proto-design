import catalog from "@/public/stock/catalog.json"
import type { DomainKey, GenerationStep } from "@/types/domain"

const STEP_OFFSET: Record<GenerationStep, number> = {
  concept: 0,
  palette: 0,
  wireframe: 6,
  components: 12,
  prototype: 18,
}

export function stockPoolFor(domainKey: DomainKey): string[] {
  if (domainKey === "other") {
    return Object.values(catalog).flat()
  }
  const pool = catalog[domainKey as keyof typeof catalog]
  return pool ?? catalog.saas_internal
}

export function pickStockPath(input: {
  domainKey: DomainKey
  step: GenerationStep
  slot: number
  entropy?: string
  salt?: string
  exclude?: string[]
}): string {
  const pool = stockPoolFor(input.domainKey)
  const start =
    (hashSeed(
      `${input.entropy ?? ""}|${input.domainKey}|${input.step}|${input.salt ?? ""}`
    ) +
      STEP_OFFSET[input.step] +
      input.slot) %
    pool.length
  for (let offset = 0; offset < pool.length; offset += 1) {
    const path = pool[(start + offset) % pool.length]
    if (path && !input.exclude?.includes(path)) return path
  }
  return pool[start] ?? pool[0] ?? "/stock/saas_internal/01.jpg"
}

export function pickUniqueStockPaths(input: {
  domainKey: DomainKey
  step: GenerationStep
  entropy?: string
  salts: string[]
}): string[] {
  const used: string[] = []
  return input.salts.map((salt, slot) => {
    const path = pickStockPath({
      domainKey: input.domainKey,
      step: input.step,
      slot,
      entropy: input.entropy,
      salt,
      exclude: used,
    })
    used.push(path)
    return path
  })
}

export function pickStockImage(input: {
  domainKey: DomainKey
  step: GenerationStep
  slot: number
  entropy?: string
  salt?: string
  exclude?: string[]
}): { dataUrl: string; width: number; height: number } {
  return {
    dataUrl: pickStockPath(input),
    width: 960,
    height: 600,
  }
}

function hashSeed(value: string): number {
  let hash = 2166136261
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index)
    hash = Math.imul(hash, 16777619)
  }
  return hash >>> 0
}
