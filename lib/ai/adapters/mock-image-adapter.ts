import { pickStockImage } from "@/lib/stock/pick"
import { renderComponentPreview } from "@/lib/ai/component-preview"
import { renderPrototypePreview } from "@/lib/ai/prototype-preview"
import { renderWireframePreview } from "@/lib/ai/wireframe-preview"
import type { ImageBlob, ImageGenerationAdapter, ImageRequest } from "@/lib/ai/types"

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

function fromRequest(request: ImageRequest): ImageBlob {
  return pickStockImage({
    domainKey: request.snapshot.domainKey,
    step: request.step,
    slot: request.slot,
    entropy: request.snapshot.entropy,
    salt: request.title ?? request.prompt,
  })
}

export class MockImageAdapter implements ImageGenerationAdapter {
  async generateConceptMood(
    request: ImageRequest,
    signal: AbortSignal
  ): Promise<ImageBlob> {
    void signal
    await delay(120)
    return fromRequest(request)
  }

  async generateWireframePreview(
    request: ImageRequest,
    signal: AbortSignal
  ): Promise<ImageBlob> {
    void signal
    await delay(120)
    return renderWireframePreview({
      title: request.title,
      prompt: request.prompt,
      blocks: request.blocks,
      slot: request.slot,
    })
  }

  async generateComponentPreview(
    request: ImageRequest,
    signal: AbortSignal
  ): Promise<ImageBlob> {
    void signal
    await delay(120)
    return renderComponentPreview({
      title: request.title,
      prompt: request.prompt,
      items: request.items,
      swatches: request.snapshot.committedPalette?.swatches,
      slot: request.slot,
    })
  }

  async generatePrototype(
    request: ImageRequest,
    signal: AbortSignal
  ): Promise<ImageBlob> {
    void signal
    await delay(160)
    return renderPrototypePreview(request.snapshot)
  }
}
