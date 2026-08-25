import type { ImageBlob } from "@/lib/ai/types"
import type { ComponentItem, Swatch } from "@/types/domain"

type KitKind = "solid" | "soft" | "compact"

export function renderComponentPreview(input: {
  title?: string
  prompt: string
  items?: ComponentItem[]
  swatches?: Swatch[]
  slot: number
}): ImageBlob {
  const kind = resolveKitKind(input)
  const colors = palette(input.swatches)
  return {
    dataUrl: toDataUrl(componentKitSvg(kind, input.title, input.items ?? [], colors)),
    width: 960,
    height: 600,
  }
}

function resolveKitKind(input: {
  title?: string
  prompt: string
  items?: ComponentItem[]
  slot: number
}): KitKind {
  const haystack = `${input.title ?? ""} ${input.prompt} ${(input.items ?? [])
    .map((item) => `${item.variant} ${item.notes}`)
    .join(" ")}`
  if (/soft|pill|둥근|rounded/i.test(haystack)) return "soft"
  if (/compact|dense|밀도|icon-rail|컴팩트/i.test(haystack)) return "compact"
  if (input.slot === 1) return "soft"
  if (input.slot === 2) return "compact"
  return "solid"
}

function palette(swatches: Swatch[] | undefined) {
  const byRole = new Map((swatches ?? []).map((item) => [item.role, item.hex]))
  return {
    primary: byRole.get("primary") ?? "#1F3A5F",
    secondary: byRole.get("secondary") ?? "#5B7C99",
    background: byRole.get("background") ?? "#FAFAF9",
    text: byRole.get("text") ?? "#111827",
    accent: byRole.get("accent") ?? "#C45C26",
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

function variantOf(
  items: ComponentItem[],
  role: ComponentItem["role"]
): string {
  return items.find((item) => item.role === role)?.variant ?? role
}

function componentKitSvg(
  kind: KitKind,
  title: string | undefined,
  items: ComponentItem[],
  colors: ReturnType<typeof palette>
): string {
  const radius = kind === "soft" ? 22 : kind === "compact" ? 4 : 8
  const buttonH = kind === "compact" ? 28 : 44
  const buttonTextY = 118 + Math.round(buttonH / 2) + 5
  const heading = escapeXml((title ?? "컴포넌트 세트").slice(0, 36))
  const buttonLabel = escapeXml(variantOf(items, "button"))
  const inputLabel = escapeXml(variantOf(items, "input"))
  const cardLabel = escapeXml(variantOf(items, "card"))
  const navLabel = escapeXml(variantOf(items, "navigation"))
  const badgeLabel = escapeXml(variantOf(items, "badge") || variantOf(items, "tabs") || "badge")
  const kindLabel = kind === "soft" ? "소프트" : kind === "compact" ? "컴팩트" : "솔리드"

  return `<svg xmlns="http://www.w3.org/2000/svg" width="960" height="600" viewBox="0 0 960 600">
    <rect width="960" height="600" fill="${colors.background}"/>
    <text x="36" y="40" fill="${colors.text}" font-family="ui-sans-serif, system-ui, sans-serif" font-size="20" font-weight="700">${heading}</text>
    <text x="36" y="64" fill="${colors.secondary}" font-family="ui-sans-serif, system-ui, sans-serif" font-size="13">UI Kit · ${kindLabel} · button / input / card / navigation</text>

    <text x="36" y="108" fill="${colors.secondary}" font-family="ui-sans-serif, system-ui, sans-serif" font-size="12">BUTTON</text>
    <rect x="36" y="118" width="168" height="${buttonH}" rx="${radius}" fill="${colors.primary}"/>
    <text x="120" y="${buttonTextY}" text-anchor="middle" fill="#FFFFFF" font-family="ui-sans-serif, system-ui, sans-serif" font-size="13">${buttonLabel}</text>
    <rect x="220" y="118" width="168" height="${buttonH}" rx="${radius}" fill="none" stroke="${colors.primary}" stroke-width="2"/>
    <rect x="404" y="118" width="120" height="${buttonH}" rx="${radius}" fill="${colors.accent}"/>

    <text x="36" y="196" fill="${colors.secondary}" font-family="ui-sans-serif, system-ui, sans-serif" font-size="12">INPUT</text>
    <rect x="36" y="206" width="360" height="48" rx="${radius}" fill="#FFFFFF" stroke="${colors.secondary}" stroke-width="1.5"/>
    <text x="52" y="236" fill="${colors.secondary}" font-family="ui-sans-serif, system-ui, sans-serif" font-size="13">${inputLabel}</text>

    <text x="36" y="290" fill="${colors.secondary}" font-family="ui-sans-serif, system-ui, sans-serif" font-size="12">CARD</text>
    <rect x="36" y="300" width="360" height="168" rx="${Math.max(radius, 12)}" fill="#FFFFFF" stroke="#E5E7EB"/>
    <rect x="56" y="320" width="200" height="16" fill="${colors.primary}"/>
    <rect x="56" y="348" width="280" height="10" fill="#E5E7EB"/>
    <rect x="56" y="368" width="240" height="10" fill="#F3F4F6"/>
    <rect x="56" y="404" width="112" height="32" rx="${radius}" fill="${colors.accent}"/>
    <text x="56" y="452" fill="${colors.secondary}" font-family="ui-sans-serif, system-ui, sans-serif" font-size="12">${cardLabel}</text>

    <text x="440" y="108" fill="${colors.secondary}" font-family="ui-sans-serif, system-ui, sans-serif" font-size="12">NAVIGATION</text>
    ${
      kind === "compact"
        ? `<rect x="440" y="118" width="64" height="350" rx="8" fill="${colors.primary}"/>
           <rect x="456" y="140" width="32" height="32" rx="6" fill="${colors.accent}"/>
           <rect x="456" y="188" width="32" height="32" rx="6" fill="${colors.secondary}"/>
           <rect x="456" y="236" width="32" height="32" rx="6" fill="${colors.secondary}"/>
           <text x="520" y="140" fill="${colors.secondary}" font-family="ui-sans-serif, system-ui, sans-serif" font-size="12">${navLabel}</text>
           <text x="520" y="220" fill="${colors.secondary}" font-family="ui-sans-serif, system-ui, sans-serif" font-size="12">BADGE / TABS</text>
           <rect x="520" y="232" width="88" height="28" rx="14" fill="none" stroke="${colors.primary}"/>
           <text x="564" y="251" text-anchor="middle" fill="${colors.primary}" font-family="ui-sans-serif, system-ui, sans-serif" font-size="11">${badgeLabel}</text>
           <rect x="624" y="232" width="88" height="28" rx="14" fill="${colors.accent}"/>
           <rect x="520" y="280" width="320" height="40" rx="8" fill="#F3F4F6"/>
           <rect x="528" y="288" width="96" height="24" rx="6" fill="${colors.primary}"/>`
        : `<rect x="440" y="118" width="484" height="48" rx="${radius}" fill="#FFFFFF" stroke="#E5E7EB"/>
           <rect x="456" y="130" width="88" height="24" rx="6" fill="${colors.primary}"/>
           <rect x="556" y="130" width="72" height="24" rx="6" fill="#F3F4F6"/>
           <rect x="640" y="130" width="72" height="24" rx="6" fill="#F3F4F6"/>
           <text x="456" y="186" fill="${colors.secondary}" font-family="ui-sans-serif, system-ui, sans-serif" font-size="12">${navLabel}</text>
           <text x="440" y="220" fill="${colors.secondary}" font-family="ui-sans-serif, system-ui, sans-serif" font-size="12">BADGE / TABS</text>
           <rect x="440" y="232" width="88" height="28" rx="14" fill="none" stroke="${colors.primary}"/>
           <text x="484" y="251" text-anchor="middle" fill="${colors.primary}" font-family="ui-sans-serif, system-ui, sans-serif" font-size="11">${badgeLabel}</text>
           <rect x="544" y="232" width="88" height="28" rx="14" fill="${colors.accent}"/>
           <rect x="440" y="280" width="320" height="40" rx="${kind === "soft" ? 20 : 8}" fill="#F3F4F6"/>
           <rect x="448" y="288" width="96" height="24" rx="6" fill="${colors.primary}"/>
           <rect x="552" y="288" width="96" height="24" rx="6" fill="transparent"/>
           <rect x="656" y="288" width="96" height="24" rx="6" fill="transparent"/>`
    }

    <text x="520" y="360" fill="${colors.secondary}" font-family="ui-sans-serif, system-ui, sans-serif" font-size="12">STATES</text>
    <rect x="520" y="372" width="160" height="96" rx="${radius}" fill="#FFFFFF" stroke="#E5E7EB"/>
    <rect x="536" y="392" width="128" height="12" fill="#E5E7EB"/>
    <rect x="536" y="416" width="96" height="12" fill="#F3F4F6"/>
    <rect x="700" y="372" width="160" height="96" rx="${radius}" fill="#FFFFFF" stroke="#E5E7EB"/>
    <rect x="716" y="392" width="128" height="12" fill="#E5E7EB"/>
    <rect x="716" y="416" width="80" height="28" rx="${radius}" fill="${colors.primary}"/>
  </svg>`
}
