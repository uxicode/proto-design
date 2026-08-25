import type {
  ComponentTextOutput,
  ConceptTextOutput,
  PaletteTextOutput,
  TextStructuredAdapter,
  WireframeTextOutput,
} from "@/lib/ai/types"
import type { InputSnapshot } from "@/types/domain"
import {
  firstTextPart,
  geminiGenerateContent,
  getGeminiConfig,
} from "@/lib/ai/gemini-client"
import {
  componentSetSchema,
  conceptSetSchema,
  paletteSetSchema,
  parseJsonObject,
  wireframeSetSchema,
} from "@/lib/generation/schemas"

async function completeJson(
  system: string,
  user: string,
  temperature = 0.7
): Promise<unknown> {
  const { textModel } = getGeminiConfig()
  const response = await geminiGenerateContent({
    model: textModel,
    system,
    user,
    json: true,
    temperature,
  })
  return parseJsonObject(firstTextPart(response))
}

function briefLine(input: InputSnapshot): string {
  const avoid =
    input.avoidTitles && input.avoidTitles.length > 0
      ? `\n이미 나온 제목은 쓰지 마세요: ${input.avoidTitles.join(", ")}`
      : ""
  const entropy = input.entropy ? `\n탐색 시드: ${input.entropy}` : ""
  return `분야: ${input.domainLabel}\n키워드: ${input.keywords.join(", ")}${avoid}${entropy}`
}

export class GeminiTextAdapter implements TextStructuredAdapter {
  async generateConceptSet(input: InputSnapshot): Promise<ConceptTextOutput> {
    const data = await completeJson(
      `당신은 제품 디자인 디렉터입니다. 레이아웃이나 최종 UI 화면을 그리지 마세요.
컨셉 후보 정확히 3개를 JSON으로만 반환하세요.
세 안은 서로 다른 시각 전략이어야 합니다. 제목은 분야·키워드에서 나온 고유한 이름이어야 하며, '선명', '온기', '밀도' 같은 고정 라벨을 반복하지 마세요.
매번 다른 조합을 제안하세요.
스키마: {"candidates":[{"title":"2-40자","summary":"10-200자","visualHints":["문자열"],"moodPrompt":"영문 이미지 프롬프트, 각 후보가 뚜렷이 다르게"}]}
한국어 title/summary.`,
      briefLine(input),
      1.05
    )
    return conceptSetSchema.parse(data)
  }

  async generatePaletteSet(input: InputSnapshot): Promise<PaletteTextOutput> {
    const data = await completeJson(
      `당신은 컬러 시스템 디자이너입니다. 화면 전체를 그리지 마세요. 팔레트 후보 정확히 3개. 각 팔레트는 primary, secondary, background, text, accent hex(#RRGGBB) 5개를 포함합니다. JSON만. {"candidates":[{"name":"","swatches":[{"role":"primary","hex":"#112233"}]}]}`,
      `${briefLine(input)}\n확정 컨셉: ${input.committedConcept?.title} — ${input.committedConcept?.summary}`
    )
    return paletteSetSchema.parse(data)
  }

  async generateWireframeSet(input: InputSnapshot): Promise<WireframeTextOutput> {
    const palette = input.committedPalette?.swatches
      .map((item) => `${item.role}:${item.hex}`)
      .join(", ")
    const data = await completeJson(
      `당신은 UX 와이어프레임 설계자입니다. 포토리얼 비주얼 금지. 구조 블록 중심. 후보 정확히 20개. 서로 다른 레이아웃(히어로, 사이드바, 갤러리, 스플릿, 가격, 대시보드, 온보딩, 아티클, 체크아웃, 설정, 칸반, 채팅, 검색 결과, 프로필, 지도, 비디오, 타임라인, 위자드, 캘린더, 인박스). 확정 컨셉·분야·키워드에 가장 잘 맞는 레이아웃을 배열 앞쪽에 두세요. JSON만. {"candidates":[{"title":"","structureNotes":"","blocks":[{"id":"","role":"nav|hero|form|list|footer|sidebar|content","notes":""}],"layoutPrompt":"영문 와이어프레임 이미지 프롬프트, grayscale boxes"}]}`,
      `${briefLine(input)}\n컨셉: ${input.committedConcept?.title}\n팔레트 역할색: ${palette}`
    )
    return wireframeSetSchema.parse(data)
  }

  async generateComponentSet(input: InputSnapshot): Promise<ComponentTextOutput> {
    const data = await completeJson(
      `당신은 UI 키트 디자이너입니다. 무관한 화면 템플릿 금지. 후보 정확히 3개. 각 후보 items에 button, input, card, navigation이 최소 1개. JSON만. {"candidates":[{"title":"","items":[{"role":"button","variant":"","notes":""}],"previewPrompt":"영문 컴포넌트 키트 프롬프트"}]}`,
      `${briefLine(input)}\n컨셉: ${input.committedConcept?.title}\n와이어: ${input.committedWireframe?.title} ${input.committedWireframe?.structureNotes}`
    )
    return componentSetSchema.parse(data)
  }
}
