import type { PreviewColors } from "@/lib/ai/preview-theme"

export type ConceptBlendMode =
  | "multiply"
  | "soft-light"
  | "overlay"
  | "color"
  | "screen"
  | "luminosity"
  | "hue"

export type ConceptFrame =
  | "editorial"
  | "glass"
  | "brutal"
  | "night"
  | "pastel"
  | "paper"
  | "retail"
  | "industrial"
  | "gallery"
  | "kinetic"
  | "organic"
  | "mono"

export interface ConceptMood {
  stem: string
  frame: ConceptFrame
  colors: PreviewColors
  swatches: string[]
  filter: string
  overlay: string
  blend: ConceptBlendMode
  overlayOpacity: number
}

const MOODS: Record<string, Omit<ConceptMood, "stem">> = {
  "에디토리얼 잉크": {
    frame: "editorial",
    colors: {
      primary: "#1F3A5F",
      secondary: "#5B7C99",
      background: "#F4F1EA",
      text: "#1A1A1A",
      accent: "#C45C26",
    },
    swatches: ["#1F3A5F", "#5B7C99", "#F4F1EA", "#1A1A1A", "#C45C26"],
    filter: "grayscale(0.85) contrast(1.15) brightness(1.05)",
    overlay: "linear-gradient(180deg, #F4F1EA88 0%, #1F3A5F66 100%)",
    blend: "multiply",
    overlayOpacity: 0.72,
  },
  "글래스 스튜디오": {
    frame: "glass",
    colors: {
      primary: "#4C3A6B",
      secondary: "#8E7AA8",
      background: "#F5F2F8",
      text: "#1E1628",
      accent: "#E09F3E",
    },
    swatches: ["#4C3A6B", "#8E7AA8", "#F5F2F8", "#1E1628", "#E09F3E"],
    filter: "saturate(0.7) brightness(1.12) contrast(0.95)",
    overlay: "linear-gradient(135deg, #F5F2F8cc 0%, #8E7AA866 55%, #E09F3E44 100%)",
    blend: "soft-light",
    overlayOpacity: 0.85,
  },
  "네오 브루탈": {
    frame: "brutal",
    colors: {
      primary: "#111111",
      secondary: "#F2E749",
      background: "#F6F1E8",
      text: "#111111",
      accent: "#E23D28",
    },
    swatches: ["#111111", "#F2E749", "#F6F1E8", "#111111", "#E23D28"],
    filter: "saturate(1.45) contrast(1.25)",
    overlay: "linear-gradient(90deg, #F2E74999 0%, transparent 42%, #E23D2866 100%)",
    blend: "overlay",
    overlayOpacity: 0.7,
  },
  "나이트 커맨드": {
    frame: "night",
    colors: {
      primary: "#121826",
      secondary: "#3A4660",
      background: "#0B0F18",
      text: "#E8EDF7",
      accent: "#B8F272",
    },
    swatches: ["#121826", "#3A4660", "#0B0F18", "#E8EDF7", "#B8F272"],
    filter: "brightness(0.55) saturate(0.35) contrast(1.2)",
    overlay: "linear-gradient(180deg, #0B0F18e6 0%, #121826b3 55%, #B8F27233 100%)",
    blend: "multiply",
    overlayOpacity: 0.88,
  },
  "파스텔 캔버스": {
    frame: "pastel",
    colors: {
      primary: "#E8A0BF",
      secondary: "#9DC7C5",
      background: "#FFF6F1",
      text: "#3D2C33",
      accent: "#F4C095",
    },
    swatches: ["#E8A0BF", "#9DC7C5", "#FFF6F1", "#3D2C33", "#F4C095"],
    filter: "saturate(0.55) brightness(1.18) contrast(0.9)",
    overlay: "linear-gradient(160deg, #FFF6F1cc 0%, #E8A0BF66 50%, #9DC7C566 100%)",
    blend: "soft-light",
    overlayOpacity: 0.9,
  },
  "아카이브 페이퍼": {
    frame: "paper",
    colors: {
      primary: "#6B4F3A",
      secondary: "#A56B4E",
      background: "#E8D9C4",
      text: "#2A1810",
      accent: "#8A3B2A",
    },
    swatches: ["#6B4F3A", "#A56B4E", "#E8D9C4", "#2A1810", "#8A3B2A"],
    filter: "sepia(0.7) saturate(0.65) contrast(1.05)",
    overlay: "linear-gradient(180deg, #E8D9C4aa 0%, #6B4F3A55 100%)",
    blend: "multiply",
    overlayOpacity: 0.75,
  },
  "리테일 팝": {
    frame: "retail",
    colors: {
      primary: "#E36B5B",
      secondary: "#7FB3D5",
      background: "#FFF8F4",
      text: "#2C1A16",
      accent: "#2A6F97",
    },
    swatches: ["#E36B5B", "#7FB3D5", "#FFF8F4", "#2C1A16", "#2A6F97"],
    filter: "saturate(1.35) contrast(1.1) brightness(1.05)",
    overlay: "linear-gradient(120deg, #E36B5B66 0%, transparent 45%, #2A6F9766 100%)",
    blend: "overlay",
    overlayOpacity: 0.65,
  },
  "인더스트리얼 라인": {
    frame: "industrial",
    colors: {
      primary: "#2B2F36",
      secondary: "#6B7280",
      background: "#EEF1F4",
      text: "#111827",
      accent: "#2563EB",
    },
    swatches: ["#2B2F36", "#6B7280", "#EEF1F4", "#111827", "#2563EB"],
    filter: "grayscale(0.55) contrast(1.2) brightness(1.02)",
    overlay: "linear-gradient(180deg, #EEF1F466 0%, #2563EB33 100%)",
    blend: "luminosity",
    overlayOpacity: 0.55,
  },
  "갤러리 프레임": {
    frame: "gallery",
    colors: {
      primary: "#1A1A1A",
      secondary: "#6B6B6B",
      background: "#F7F7F5",
      text: "#111111",
      accent: "#C4A574",
    },
    swatches: ["#1A1A1A", "#6B6B6B", "#F7F7F5", "#111111", "#C4A574"],
    filter: "saturate(0.35) contrast(1.12)",
    overlay: "linear-gradient(180deg, #F7F7F522 0%, #1A1A1A33 100%)",
    blend: "soft-light",
    overlayOpacity: 0.5,
  },
  "키네틱 스트라이프": {
    frame: "kinetic",
    colors: {
      primary: "#111827",
      secondary: "#EC4899",
      background: "#0F172A",
      text: "#F8FAFC",
      accent: "#FACC15",
    },
    swatches: ["#111827", "#EC4899", "#0F172A", "#F8FAFC", "#FACC15"],
    filter: "saturate(1.5) contrast(1.3) brightness(0.95)",
    overlay: "linear-gradient(115deg, #EC489966 0%, transparent 40%, #FACC1566 100%)",
    blend: "overlay",
    overlayOpacity: 0.7,
  },
  "오가닉 가든": {
    frame: "organic",
    colors: {
      primary: "#4A5D23",
      secondary: "#8B7355",
      background: "#F3EDE4",
      text: "#1F1A14",
      accent: "#C46B3A",
    },
    swatches: ["#4A5D23", "#8B7355", "#F3EDE4", "#1F1A14", "#C46B3A"],
    filter: "saturate(0.85) hue-rotate(-8deg) brightness(1.05)",
    overlay: "linear-gradient(160deg, #F3EDE4aa 0%, #4A5D2366 100%)",
    blend: "multiply",
    overlayOpacity: 0.7,
  },
  "미니멀 모노": {
    frame: "mono",
    colors: {
      primary: "#111111",
      secondary: "#6B6B6B",
      background: "#F4F4F4",
      text: "#111111",
      accent: "#111111",
    },
    swatches: ["#111111", "#6B6B6B", "#F4F4F4", "#111111", "#D4D4D4"],
    filter: "grayscale(1) contrast(1.2)",
    overlay: "linear-gradient(180deg, #F4F4F433 0%, #11111122 100%)",
    blend: "luminosity",
    overlayOpacity: 0.35,
  },
}

const FALLBACK: Omit<ConceptMood, "stem"> = MOODS["미니멀 모노"]

function moodFromHints(hints: string[]): Omit<ConceptMood, "stem"> | undefined {
  const text = hints.join(" ")
  if (/다크|네온|야간/.test(text)) return MOODS["나이트 커맨드"]
  if (/파스텔|둥근|손그림/.test(text)) return MOODS["파스텔 캔버스"]
  if (/세피아|크래프트|스탬프/.test(text)) return MOODS["아카이브 페이퍼"]
  if (/무채색|트래킹/.test(text)) return MOODS["미니멀 모노"]
  if (/세일|히어로 컷|상품/.test(text)) return MOODS["리테일 팝"]
  if (/유리|블러/.test(text)) return MOODS["글래스 스튜디오"]
  if (/원색|보더/.test(text)) return MOODS["네오 브루탈"]
  if (/스트라이프|모션/.test(text)) return MOODS["키네틱 스트라이프"]
  if (/잎|어스|비정형/.test(text)) return MOODS["오가닉 가든"]
  if (/세리프|여백/.test(text)) return MOODS["에디토리얼 잉크"]
  return undefined
}

export function conceptMoodStem(title?: string): string | undefined {
  if (!title) return undefined
  return Object.keys(MOODS).find((stem) => title.includes(stem))
}

export function resolveConceptMood(title?: string, hints: string[] = []): ConceptMood {
  const stem = conceptMoodStem(title)
  if (stem) return { stem, ...MOODS[stem] }
  const hinted = moodFromHints(hints)
  if (hinted) return { stem: title ?? "기본", ...hinted }
  return { stem: title ?? "기본", ...FALLBACK }
}

export function isRasterPreview(url?: string): boolean {
  if (!url) return false
  return !url.startsWith("data:image/svg")
}
