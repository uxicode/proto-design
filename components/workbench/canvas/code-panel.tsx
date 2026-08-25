"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"

interface CodePanelProps {
  value: string
}

export function CodePanel({ value }: CodePanelProps) {
  const [copied, setCopied] = useState(false)

  async function handleCopy(): Promise<void> {
    await navigator.clipboard.writeText(value)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium text-muted-foreground">생성 코드 (JSX)</p>
        <Button type="button" size="sm" variant="outline" onClick={() => void handleCopy()}>
          {copied ? "복사됨" : "복사"}
        </Button>
      </div>
      <Textarea
        readOnly
        value={value}
        className="min-h-[160px] font-mono text-xs"
        aria-label="생성 JSX"
      />
    </div>
  )
}
