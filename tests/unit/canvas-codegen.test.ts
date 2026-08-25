import { readFileSync } from "node:fs"
import path from "node:path"
import { describe, expect, it } from "vitest"
import { generateInstanceJsx } from "@/lib/canvas/codegen"
import type { CanvasInstance } from "@/types/domain"

const button: CanvasInstance = {
  id: "i1",
  type: "button",
  x: 10,
  y: 10,
  width: 136,
  height: 40,
  zIndex: 1,
  props: {
    label: "가입",
    variant: "default",
    size: "sm",
    disabled: false,
  },
}

describe("canvas codegen", () => {
  it("shadcn Button import와 라벨·variant를 포함한다", () => {
    const jsx = generateInstanceJsx(button)
    expect(jsx).toContain('from "@/components/ui/button"')
    expect(jsx).toContain('variant="default"')
    expect(jsx).toContain("가입")
    expect(jsx).not.toMatch(/#[0-9A-Fa-f]{6}/)
    expect(jsx).not.toContain("borderRadius")
  })

  it("모듈이 eval을 참조하지 않는다", () => {
    const source = readFileSync(
      path.resolve(process.cwd(), "lib/canvas/codegen.ts"),
      "utf8"
    )
    expect(source).not.toContain("eval")
    expect(source).not.toContain("new Function")
  })
})
