import type { ImageBlob } from "@/lib/ai/types"
import {
  kitRadius,
  paletteFromSwatches,
  prototypePreviewFamily,
  resolveKitKind,
  resolveLayoutKind,
  type KitKind,
  type PreviewColors,
} from "@/lib/ai/preview-theme"
import type { InputSnapshot } from "@/types/domain"

export function renderPrototypePreview(snapshot: InputSnapshot): ImageBlob {
  const colors = paletteFromSwatches(snapshot.committedPalette?.swatches)
  const layout = resolveLayoutKind({
    title: snapshot.committedWireframe?.title,
    blocks: snapshot.committedWireframe?.blocks,
  })
  const kit = resolveKitKind({
    title: snapshot.committedComponentSet?.title,
    items: snapshot.committedComponentSet?.items,
  })
  return {
    dataUrl: toDataUrl(prototypeSvg(snapshot, colors, layout, kit)),
    width: 1280,
    height: 800,
  }
}

function escapeXml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
}

function toDataUrl(svg: string): string {
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`
}

function prototypeSvg(
  snapshot: InputSnapshot,
  colors: PreviewColors,
  layout: ReturnType<typeof resolveLayoutKind>,
  kit: KitKind
): string {
  const radius = kitRadius(kit)
  const domain = escapeXml(snapshot.domainLabel)
  const title = escapeXml(snapshot.committedConcept?.title ?? snapshot.domainLabel)
  const summary = escapeXml((snapshot.committedConcept?.summary ?? "").slice(0, 64))
  const keyword = escapeXml(snapshot.keywords[0] ?? "시작하기")
  const keyword2 = escapeXml(snapshot.keywords[1] ?? snapshot.keywords[0] ?? "둘러보기")
  const hint = escapeXml(snapshot.committedConcept?.visualHints[0] ?? "핵심 기능")
  const wire = escapeXml(snapshot.committedWireframe?.title ?? "레이아웃")
  const kitTitle = escapeXml(snapshot.committedComponentSet?.title ?? "컴포넌트")

  const chrome = `
    <rect width="1280" height="800" fill="#E5E7EB"/>
    <rect x="24" y="24" width="1232" height="752" rx="16" fill="${colors.background}"/>
    <rect x="24" y="24" width="1232" height="40" rx="16" fill="#D1D5DB"/>
    <rect x="24" y="48" width="1232" height="16" fill="#D1D5DB"/>
    <circle cx="48" cy="44" r="6" fill="#F87171"/>
    <circle cx="68" cy="44" r="6" fill="#FBBF24"/>
    <circle cx="88" cy="44" r="6" fill="#34D399"/>
    <rect x="120" y="34" width="520" height="20" rx="10" fill="#F9FAFB"/>
    <text x="140" y="48" fill="#6B7280" font-family="ui-sans-serif, system-ui, sans-serif" font-size="11">${domain} · ${wire}</text>
  `

  const family = prototypePreviewFamily(layout)

  if (family === "app") {
    return `<svg xmlns="http://www.w3.org/2000/svg" width="1280" height="800" viewBox="0 0 1280 800">
      ${chrome}
      <rect x="24" y="64" width="1232" height="48" fill="${colors.primary}"/>
      <text x="48" y="94" fill="#FFFFFF" font-family="ui-sans-serif, system-ui, sans-serif" font-size="16" font-weight="700">${domain}</text>
      <text x="980" y="94" fill="#FFFFFF" font-family="ui-sans-serif, system-ui, sans-serif" font-size="12">${keyword} · ${kitTitle}</text>
      <rect x="24" y="112" width="220" height="664" fill="${colors.primary}" opacity="0.92"/>
      <rect x="44" y="140" width="180" height="36" rx="${radius}" fill="${colors.accent}"/>
      <text x="56" y="163" fill="#FFFFFF" font-family="ui-sans-serif, system-ui, sans-serif" font-size="13">홈</text>
      <text x="56" y="214" fill="#FFFFFF" font-family="ui-sans-serif, system-ui, sans-serif" font-size="13">${keyword}</text>
      <text x="56" y="254" fill="#FFFFFF" font-family="ui-sans-serif, system-ui, sans-serif" font-size="13">${keyword2}</text>
      <text x="56" y="294" fill="#FFFFFF" font-family="ui-sans-serif, system-ui, sans-serif" font-size="13">${hint}</text>
      <rect x="260" y="128" width="300" height="100" rx="${radius}" fill="#FFFFFF"/>
      <text x="280" y="164" fill="${colors.secondary}" font-family="ui-sans-serif, system-ui, sans-serif" font-size="12">활성</text>
      <text x="280" y="198" fill="${colors.text}" font-family="ui-sans-serif, system-ui, sans-serif" font-size="28" font-weight="700">12,480</text>
      <rect x="576" y="128" width="300" height="100" rx="${radius}" fill="#FFFFFF"/>
      <text x="596" y="164" fill="${colors.secondary}" font-family="ui-sans-serif, system-ui, sans-serif" font-size="12">${keyword}</text>
      <text x="596" y="198" fill="${colors.text}" font-family="ui-sans-serif, system-ui, sans-serif" font-size="28" font-weight="700">98.2%</text>
      <rect x="892" y="128" width="340" height="100" rx="${radius}" fill="#FFFFFF"/>
      <text x="912" y="164" fill="${colors.secondary}" font-family="ui-sans-serif, system-ui, sans-serif" font-size="12">전환</text>
      <text x="912" y="198" fill="${colors.accent}" font-family="ui-sans-serif, system-ui, sans-serif" font-size="28" font-weight="700">+18%</text>
      <rect x="260" y="244" width="620" height="508" rx="${radius}" fill="#FFFFFF"/>
      <text x="280" y="280" fill="${colors.text}" font-family="ui-sans-serif, system-ui, sans-serif" font-size="16" font-weight="700">${title}</text>
      <rect x="280" y="304" width="560" height="14" fill="#F3F4F6"/>
      <rect x="280" y="336" width="560" height="14" fill="#E5E7EB"/>
      <rect x="280" y="368" width="560" height="14" fill="#F3F4F6"/>
      <rect x="280" y="400" width="480" height="14" fill="#E5E7EB"/>
      <rect x="280" y="432" width="560" height="14" fill="#F3F4F6"/>
      <rect x="280" y="464" width="520" height="14" fill="#E5E7EB"/>
      <rect x="280" y="520" width="140" height="36" rx="${radius}" fill="${colors.accent}"/>
      <text x="350" y="543" text-anchor="middle" fill="#FFFFFF" font-family="ui-sans-serif, system-ui, sans-serif" font-size="13">${keyword}</text>
      <rect x="900" y="244" width="332" height="508" rx="${radius}" fill="#FFFFFF"/>
      <text x="920" y="280" fill="${colors.text}" font-family="ui-sans-serif, system-ui, sans-serif" font-size="16" font-weight="700">상세</text>
      <text x="920" y="312" fill="${colors.secondary}" font-family="ui-sans-serif, system-ui, sans-serif" font-size="13">${summary}</text>
      <rect x="920" y="360" width="292" height="120" rx="${radius}" fill="${colors.background}"/>
      <rect x="920" y="500" width="160" height="40" rx="${radius}" fill="${colors.primary}"/>
      <text x="1000" y="525" text-anchor="middle" fill="#FFFFFF" font-family="ui-sans-serif, system-ui, sans-serif" font-size="13">적용</text>
    </svg>`
  }

  if (family === "gallery") {
    return `<svg xmlns="http://www.w3.org/2000/svg" width="1280" height="800" viewBox="0 0 1280 800">
      ${chrome}
      <rect x="24" y="64" width="1232" height="64" fill="#FFFFFF"/>
      <text x="56" y="104" fill="${colors.primary}" font-family="ui-sans-serif, system-ui, sans-serif" font-size="20" font-weight="700">${domain}</text>
      <rect x="900" y="80" width="220" height="32" rx="${radius}" fill="${colors.background}" stroke="${colors.secondary}"/>
      <rect x="1140" y="80" width="80" height="32" rx="${radius}" fill="${colors.primary}"/>
      <rect x="56" y="148" width="88" height="32" rx="16" fill="${colors.primary}"/>
      <text x="100" y="169" text-anchor="middle" fill="#FFFFFF" font-family="ui-sans-serif, system-ui, sans-serif" font-size="12">${keyword}</text>
      <rect x="156" y="148" width="88" height="32" rx="16" fill="#FFFFFF" stroke="${colors.secondary}"/>
      <text x="200" y="169" text-anchor="middle" fill="${colors.text}" font-family="ui-sans-serif, system-ui, sans-serif" font-size="12">${keyword2}</text>
      <rect x="256" y="148" width="88" height="32" rx="16" fill="#FFFFFF" stroke="${colors.secondary}"/>
      <text x="300" y="169" text-anchor="middle" fill="${colors.text}" font-family="ui-sans-serif, system-ui, sans-serif" font-size="12">${hint}</text>
      ${card(56, 204, 380, 430, radius, colors, title, summary)}
      ${card(452, 204, 380, 430, radius, colors, keyword, hint)}
      ${card(848, 204, 380, 430, radius, colors, keyword2, kitTitle)}
      <rect x="24" y="668" width="1232" height="108" fill="#FFFFFF"/>
      <text x="56" y="728" fill="${colors.secondary}" font-family="ui-sans-serif, system-ui, sans-serif" font-size="13">${domain} · ${wire} · ${kitTitle}</text>
    </svg>`
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" width="1280" height="800" viewBox="0 0 1280 800">
    ${chrome}
    <rect x="24" y="64" width="1232" height="64" fill="#FFFFFF"/>
    <text x="56" y="104" fill="${colors.primary}" font-family="ui-sans-serif, system-ui, sans-serif" font-size="20" font-weight="700">${domain}</text>
    <text x="780" y="104" fill="${colors.text}" font-family="ui-sans-serif, system-ui, sans-serif" font-size="13">${keyword}   ${keyword2}   로그인</text>
    <rect x="1148" y="80" width="80" height="32" rx="${radius}" fill="${colors.accent}"/>
    <text x="1188" y="101" text-anchor="middle" fill="#FFFFFF" font-family="ui-sans-serif, system-ui, sans-serif" font-size="12">시작</text>
    <rect x="56" y="160" width="720" height="360" rx="${Math.max(radius, 12)}" fill="#FFFFFF"/>
    <text x="88" y="230" fill="${colors.text}" font-family="ui-sans-serif, system-ui, sans-serif" font-size="36" font-weight="700">${title}</text>
    <text x="88" y="278" fill="${colors.secondary}" font-family="ui-sans-serif, system-ui, sans-serif" font-size="16">${summary}</text>
    <rect x="88" y="320" width="180" height="48" rx="${radius}" fill="${colors.accent}"/>
    <text x="178" y="350" text-anchor="middle" fill="#FFFFFF" font-family="ui-sans-serif, system-ui, sans-serif" font-size="15">${keyword}</text>
    <rect x="284" y="320" width="160" height="48" rx="${radius}" fill="none" stroke="${colors.primary}" stroke-width="2"/>
    <text x="364" y="350" text-anchor="middle" fill="${colors.primary}" font-family="ui-sans-serif, system-ui, sans-serif" font-size="15">${keyword2}</text>
    <text x="88" y="430" fill="${colors.secondary}" font-family="ui-sans-serif, system-ui, sans-serif" font-size="13">${hint} · ${kitTitle}</text>
    <rect x="800" y="160" width="424" height="360" rx="${Math.max(radius, 16)}" fill="${colors.primary}"/>
    <text x="832" y="220" fill="#FFFFFF" font-family="ui-sans-serif, system-ui, sans-serif" font-size="18" font-weight="700">미리보기</text>
    <text x="832" y="256" fill="#FFFFFF" font-family="ui-sans-serif, system-ui, sans-serif" font-size="13">${wire}</text>
    <rect x="832" y="288" width="360" height="160" rx="${radius}" fill="#FFFFFF" opacity="0.18"/>
    <rect x="832" y="468" width="140" height="28" rx="${radius}" fill="${colors.accent}"/>
    <rect x="56" y="544" width="1168" height="120" rx="${radius}" fill="#FFFFFF"/>
    <text x="88" y="592" fill="${colors.text}" font-family="ui-sans-serif, system-ui, sans-serif" font-size="16" font-weight="700">바로 시작</text>
    <rect x="88" y="612" width="320" height="32" rx="${radius}" fill="${colors.background}" stroke="${colors.secondary}"/>
    <rect x="424" y="612" width="120" height="32" rx="${radius}" fill="${colors.primary}"/>
    <text x="484" y="633" text-anchor="middle" fill="#FFFFFF" font-family="ui-sans-serif, system-ui, sans-serif" font-size="13">제출</text>
    <rect x="24" y="688" width="1232" height="88" fill="${colors.primary}"/>
    <text x="56" y="738" fill="#FFFFFF" font-family="ui-sans-serif, system-ui, sans-serif" font-size="13">${domain}  ·  ${snapshot.keywords.map((word) => escapeXml(word)).join(" · ")}</text>
  </svg>`
}

function card(
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
  colors: PreviewColors,
  heading: string,
  body: string
): string {
  return `
    <rect x="${x}" y="${y}" width="${width}" height="${height}" rx="${Math.max(radius, 12)}" fill="#FFFFFF"/>
    <rect x="${x}" y="${y}" width="${width}" height="210" rx="${Math.max(radius, 12)}" fill="${colors.primary}"/>
    <rect x="${x}" y="${y + 186}" width="${width}" height="24" fill="#FFFFFF"/>
    <text x="${x + 24}" y="${y + 252}" fill="${colors.text}" font-family="ui-sans-serif, system-ui, sans-serif" font-size="18" font-weight="700">${heading}</text>
    <text x="${x + 24}" y="${y + 284}" fill="${colors.secondary}" font-family="ui-sans-serif, system-ui, sans-serif" font-size="13">${body}</text>
    <rect x="${x + 24}" y="${y + height - 56}" width="120" height="32" rx="${radius}" fill="${colors.accent}"/>
  `
}
