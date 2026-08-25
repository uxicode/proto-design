export const CANVAS_CLAMP_INSET = 16

export interface RectLike {
  left: number
  top: number
  width: number
  height: number
}

export interface Point {
  x: number
  y: number
}

export function clientToLogical(
  clientX: number,
  clientY: number,
  rect: RectLike,
  clientWidth: number,
  clientHeight: number
): Point | null {
  if (rect.width === 0 || rect.height === 0) return null
  return {
    x: (clientX - rect.left) * (clientWidth / rect.width),
    y: (clientY - rect.top) * (clientHeight / rect.height),
  }
}

export function centerOrigin(
  canvasWidth: number,
  canvasHeight: number,
  width: number,
  height: number
): Point {
  return {
    x: (canvasWidth - width) / 2,
    y: (canvasHeight - height) / 2,
  }
}

export function originFromDropCenter(
  dropX: number,
  dropY: number,
  width: number,
  height: number
): Point {
  return {
    x: dropX - width / 2,
    y: dropY - height / 2,
  }
}

export function clampToFrame(
  x: number,
  y: number,
  width: number,
  height: number,
  canvasWidth: number,
  canvasHeight: number,
  inset = CANVAS_CLAMP_INSET
): Point {
  return {
    x: clampAxis(x, width, canvasWidth, inset),
    y: clampAxis(y, height, canvasHeight, inset),
  }
}

function clampAxis(
  position: number,
  size: number,
  frame: number,
  inset: number
): number {
  const min = inset - size
  const max = frame - inset
  if (min > max) return (min + max) / 2
  return Math.min(Math.max(position, min), max)
}

export function isPointInsideCanvas(
  point: Point,
  canvasWidth: number,
  canvasHeight: number
): boolean {
  return point.x >= 0 && point.y >= 0 && point.x <= canvasWidth && point.y <= canvasHeight
}

export const RESIZE_HANDLES = ["n", "s", "e", "w", "ne", "nw", "se", "sw"] as const

export type ResizeHandle = (typeof RESIZE_HANDLES)[number]

export interface Box {
  x: number
  y: number
  width: number
  height: number
}

export function resizeRect(
  box: Box,
  handle: ResizeHandle,
  dx: number,
  dy: number,
  minWidth: number,
  minHeight: number,
  canvasWidth: number,
  canvasHeight: number,
  inset = CANVAS_CLAMP_INSET
): Box {
  const right = box.x + box.width
  const bottom = box.y + box.height
  let x = box.x
  let y = box.y
  let width = box.width
  let height = box.height

  if (handle.includes("e")) width = box.width + dx
  if (handle.includes("s")) height = box.height + dy
  if (handle.includes("w")) {
    width = box.width - dx
    x = box.x + dx
  }
  if (handle.includes("n")) {
    height = box.height - dy
    y = box.y + dy
  }

  if (width < minWidth) {
    if (handle.includes("w")) x = right - minWidth
    width = minWidth
  }
  if (height < minHeight) {
    if (handle.includes("n")) y = bottom - minHeight
    height = minHeight
  }

  const origin = clampToFrame(x, y, width, height, canvasWidth, canvasHeight, inset)
  return { x: origin.x, y: origin.y, width, height }
}
