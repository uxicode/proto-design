import { describe, expect, it } from "vitest"
import { pickStockPath, pickUniqueStockPaths, stockPoolFor } from "@/lib/stock/pick"

describe("pickStockPath", () => {
  it("분야당 20장 풀을 사용한다", () => {
    expect(stockPoolFor("healthcare")).toHaveLength(20)
    expect(stockPoolFor("fintech")).toHaveLength(20)
    expect(stockPoolFor("ecommerce")).toHaveLength(20)
    expect(stockPoolFor("education")).toHaveLength(20)
    expect(stockPoolFor("saas_internal")).toHaveLength(20)
  })

  it("같은 시드에서 슬롯 3개는 서로 다른 파일을 고른다", () => {
    const paths = [0, 1, 2].map((slot) =>
      pickStockPath({
        domainKey: "fintech",
        step: "concept",
        slot,
        entropy: "seed-a",
      })
    )
    expect(new Set(paths).size).toBe(3)
    expect(paths.every((path) => path.startsWith("/stock/fintech/"))).toBe(true)
  })

  it("헬스케어 풀만 사용한다", () => {
    const path = pickStockPath({
      domainKey: "healthcare",
      step: "concept",
      slot: 0,
      entropy: "x",
    })
    expect(path.startsWith("/stock/healthcare/")).toBe(true)
  })

  it("컨셉 제목마다 겹치지 않는 사진을 고른다", () => {
    const paths = pickUniqueStockPaths({
      domainKey: "fintech",
      step: "concept",
      entropy: "same",
      salts: ["핀테크 에디토리얼 잉크", "핀테크 나이트 커맨드", "핀테크 파스텔 캔버스"],
    })
    expect(new Set(paths).size).toBe(3)
    expect(paths.every((path) => path.startsWith("/stock/fintech/"))).toBe(true)
  })
})
