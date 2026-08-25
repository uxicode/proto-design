import { describe, expect, it } from "vitest"
import {
  centerOrigin,
  clampToFrame,
  clientToLogical,
  originFromDropCenter,
  resizeRect,
} from "@/lib/canvas/geometry"

describe("canvas geometry", () => {
  it("적용 시 박스 중심이 캔버스 중심이다", () => {
    const origin = centerOrigin(400, 300, 100, 40)
    expect(origin).toEqual({ x: 150, y: 130 })
  })

  it("드롭 지점이 인스턴스 중심이 된다", () => {
    expect(originFromDropCenter(200, 150, 100, 40)).toEqual({ x: 150, y: 130 })
  })

  it("클램프 후 각 축으로 16px 이상 남는다", () => {
    const next = clampToFrame(-200, -200, 80, 40, 400, 300, 16)
    expect(next.x).toBe(16 - 80)
    expect(next.y).toBe(16 - 40)
    expect(next.x + 80).toBe(16)
    expect(next.y + 40).toBe(16)
  })

  it("rect.width와 clientWidth가 달라도 논리 좌표를 역변환한다", () => {
    const point = clientToLogical(
      150,
      120,
      { left: 100, top: 100, width: 200, height: 100 },
      400,
      300
    )
    expect(point).toEqual({ x: 100, y: 60 })
  })

  it("rect.width가 0이면 null이다", () => {
    expect(
      clientToLogical(10, 10, { left: 0, top: 0, width: 0, height: 10 }, 100, 100)
    ).toBeNull()
  })

  it("오른쪽 아래 핸들은 원점을 유지하고 너비·높이를 늘린다", () => {
    const next = resizeRect(
      { x: 40, y: 50, width: 100, height: 40 },
      "se",
      30,
      20,
      80,
      24,
      800,
      600
    )
    expect(next).toEqual({ x: 40, y: 50, width: 130, height: 60 })
  })

  it("왼쪽 위 핸들은 원점을 옮기고 최소 크기를 지킨다", () => {
    const next = resizeRect(
      { x: 40, y: 50, width: 100, height: 40 },
      "nw",
      90,
      50,
      80,
      24,
      800,
      600
    )
    expect(next.width).toBe(80)
    expect(next.height).toBe(24)
    expect(next.x).toBe(40 + 100 - 80)
    expect(next.y).toBe(50 + 40 - 24)
  })
})
