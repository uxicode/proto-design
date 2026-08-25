import type { CSSProperties } from "react"
import type { PreviewColors } from "@/lib/ai/preview-theme"

export function canvasThemeStyle(
  colors: PreviewColors,
  radiusPx: number
): CSSProperties {
  return {
    "--background": colors.background,
    "--foreground": colors.text,
    "--card": colors.background,
    "--card-foreground": colors.text,
    "--popover": colors.background,
    "--popover-foreground": colors.text,
    "--primary": colors.primary,
    "--primary-foreground": colors.background,
    "--secondary": colors.secondary,
    "--secondary-foreground": colors.text,
    "--muted": colors.secondary,
    "--muted-foreground": colors.text,
    "--accent": colors.accent,
    "--accent-foreground": colors.background,
    "--border": colors.secondary,
    "--input": colors.secondary,
    "--ring": colors.accent,
    "--radius": `${radiusPx}px`,
  } as CSSProperties
}
