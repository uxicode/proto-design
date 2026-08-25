import { MockTextAdapter } from "@/lib/ai/adapters/mock-text-adapter"
import { StockImageAdapter } from "@/lib/ai/adapters/stock-image-adapter"
import type { ImageGenerationAdapter, TextStructuredAdapter } from "@/lib/ai/types"

export function getAiProvider(): "stock" {
  return "stock"
}

export function getTextAdapter(): TextStructuredAdapter {
  return new MockTextAdapter()
}

export function getImageAdapter(): ImageGenerationAdapter {
  return new StockImageAdapter()
}
