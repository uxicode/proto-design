"use client"

import type { ReactNode } from "react"
import { CanvasSlot } from "@/components/workbench/canvas/canvas-slot"
import { cn } from "@/lib/utils"

interface CanvasPartProps {
  id: string
  label: string
  className?: string
  block?: boolean
  children: ReactNode
}

export function CanvasPart({ id, label, className, block = false, children }: CanvasPartProps) {
  return (
    <CanvasSlot
      id={id}
      label={label}
      kind="part"
      className={cn(block ? "block max-w-full" : "inline-flex max-w-full align-top", className)}
    >
      {children}
    </CanvasSlot>
  )
}
