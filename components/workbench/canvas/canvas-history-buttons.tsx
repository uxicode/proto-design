"use client"

import { Redo2, Undo2 } from "lucide-react"
import { Button } from "@/components/ui/button"

interface CanvasHistoryButtonsProps {
  canUndo: boolean
  canRedo: boolean
  disabled: boolean
  onUndo: () => void
  onRedo: () => void
}

export function CanvasHistoryButtons({
  canUndo,
  canRedo,
  disabled,
  onUndo,
  onRedo,
}: CanvasHistoryButtonsProps) {
  return (
    <div className="flex items-center gap-1">
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={disabled || !canUndo}
        onClick={onUndo}
        aria-label="이전"
      >
        <Undo2 />
        이전
      </Button>
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={disabled || !canRedo}
        onClick={onRedo}
        aria-label="다음"
      >
        <Redo2 />
        다음
      </Button>
    </div>
  )
}
