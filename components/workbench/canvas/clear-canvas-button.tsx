"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface ClearCanvasButtonProps {
  disabled: boolean
  onConfirm: () => void
}

export function ClearCanvasButton({ disabled, onConfirm }: ClearCanvasButtonProps) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={disabled}
        onClick={() => setOpen(true)}
      >
        캔버스 비우기
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>캔버스를 비울까요?</DialogTitle>
            <DialogDescription>
              올린 컴포넌트가 모두 삭제됩니다. 베이스 목업은 그대로 남습니다.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              취소
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={() => {
                onConfirm()
                setOpen(false)
              }}
            >
              비우기
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
