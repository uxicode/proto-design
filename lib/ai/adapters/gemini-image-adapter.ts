import type { ImageBlob, ImageGenerationAdapter, ImageRequest } from "@/lib/ai/types"
import { renderComponentPreview } from "@/lib/ai/component-preview"
import { renderPrototypePreview } from "@/lib/ai/prototype-preview"
import { pickStockImage } from "@/lib/stock/pick"
import { renderWireframePreview } from "@/lib/ai/wireframe-preview"

/** Gemini 호출은 사용하지 않습니다. 인터페이스 호환을 위해 스톡 이미지를 반환합니다. */
export class GeminiImageAdapter implements ImageGenerationAdapter {
  generateConceptMood(request: ImageRequest, signal: AbortSignal): Promise<ImageBlob> {
    void signal
    return Promise.resolve(
      pickStockImage({
        domainKey: request.snapshot.domainKey,
        step: "concept",
        slot: request.slot,
        entropy: request.snapshot.entropy,
        salt: request.title ?? request.prompt,
      })
    )
  }

  generateWireframePreview(request: ImageRequest, signal: AbortSignal): Promise<ImageBlob> {
    void signal
    return Promise.resolve(
      renderWireframePreview({
        title: request.title,
        prompt: request.prompt,
        blocks: request.blocks,
        slot: request.slot,
      })
    )
  }

  generateComponentPreview(request: ImageRequest, signal: AbortSignal): Promise<ImageBlob> {
    void signal
    return Promise.resolve(
      renderComponentPreview({
        title: request.title,
        prompt: request.prompt,
        items: request.items,
        swatches: request.snapshot.committedPalette?.swatches,
        slot: request.slot,
      })
    )
  }

  generatePrototype(request: ImageRequest, signal: AbortSignal): Promise<ImageBlob> {
    void signal
    return Promise.resolve(renderPrototypePreview(request.snapshot))
  }
}
