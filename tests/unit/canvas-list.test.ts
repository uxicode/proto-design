import { describe, expect, it } from "vitest"
import {
  RADIO_ITEM_MAX,
  RADIO_ITEM_MIN,
  SELECT_OPTION_MAX,
  SELECT_OPTION_MIN,
  TABS_LABEL_MAX,
  TABS_LABEL_MIN,
  addListItem,
  clampStringList,
  radioGroupBox,
  removeListItemAt,
  resizeStringList,
  sanitizeProps,
  updateListItem,
} from "@/lib/canvas/defaults"
import type { CanvasRadioGroupProps, CanvasSelectProps, CanvasTabsProps } from "@/types/domain"

describe("canvas option lists", () => {
  it("항목을 최대치까지 추가하고 최소치까지 삭제한다", () => {
    const started = ["옵션 1", "옵션 2"]
    const added = addListItem(started, RADIO_ITEM_MAX, "옵션")
    expect(added).toEqual(["옵션 1", "옵션 2", "옵션 3"])
    const full = addListItem(added, RADIO_ITEM_MAX, "옵션")
    expect(full).toHaveLength(RADIO_ITEM_MAX)
    expect(addListItem(full, RADIO_ITEM_MAX, "옵션")).toEqual(full)

    const removed = removeListItemAt(full, 1, RADIO_ITEM_MIN)
    expect(removed).toEqual(["옵션 1", "옵션 3", "옵션 4"])
    const minList = ["옵션 1", "옵션 2"]
    expect(removeListItemAt(minList, 0, RADIO_ITEM_MIN)).toEqual(minList)
  })

  it("개수 입력으로 라디오·탭·셀렉트 길이를 조절한다", () => {
    expect(resizeStringList(["탭 1", "탭 2"], 4, TABS_LABEL_MIN, TABS_LABEL_MAX, "탭")).toEqual([
      "탭 1",
      "탭 2",
      "탭 3",
      "탭 4",
    ])
    expect(resizeStringList(["탭 1", "탭 2", "탭 3"], 2, TABS_LABEL_MIN, TABS_LABEL_MAX, "탭")).toEqual([
      "탭 1",
      "탭 2",
    ])
    expect(
      resizeStringList(["항목 1", "항목 2"], 9, SELECT_OPTION_MIN, SELECT_OPTION_MAX, "항목")
    ).toHaveLength(SELECT_OPTION_MAX)
  })

  it("빈 칸을 지워도 개수는 유지한다", () => {
    expect(clampStringList(["옵션 1", " ", "옵션 3"], RADIO_ITEM_MIN, RADIO_ITEM_MAX, "옵션")).toEqual([
      "옵션 1",
      "옵션 2",
      "옵션 3",
    ])
  })

  it("sanitize가 추가·삭제된 개수를 보존한다", () => {
    const radio = sanitizeProps("radio-group", {
      items: ["옵션 1", "옵션 2", "옵션 3"],
      value: "옵션 2",
    }) as CanvasRadioGroupProps
    expect(radio.items).toHaveLength(3)
    expect(radio.value).toBe("옵션 2")
    expect(radio.orientation).toBe("vertical")

    const tabs = sanitizeProps("tabs", {
      labels: ["탭 1"],
      activeIndex: 0,
    }) as CanvasTabsProps
    expect(tabs.labels).toHaveLength(TABS_LABEL_MIN)

    const select = sanitizeProps("select", {
      options: ["항목 1", "항목 2", "항목 3", "항목 4", "항목 5", "항목 6"],
      value: "항목 1",
      placeholder: "선택",
    }) as CanvasSelectProps
    expect(select.options).toHaveLength(SELECT_OPTION_MAX)
  })

  it("라디오 가로 배치를 보존한다", () => {
    const radio = sanitizeProps("radio-group", {
      items: ["옵션 1", "옵션 2"],
      value: "옵션 1",
      orientation: "horizontal",
    }) as CanvasRadioGroupProps
    expect(radio.orientation).toBe("horizontal")
    expect(radioGroupBox(3, "horizontal").height).toBe(32)
    expect(radioGroupBox(3, "horizontal").width).toBeGreaterThan(radioGroupBox(2, "vertical").width)
    expect(radioGroupBox(3, "vertical").height).toBe(96)
  })

  it("라벨 수정을 해당 인덱스에만 반영한다", () => {
    expect(updateListItem(["옵션 1", "옵션 2"], 1, "기타")).toEqual(["옵션 1", "기타"])
  })
})
