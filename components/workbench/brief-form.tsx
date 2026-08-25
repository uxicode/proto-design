"use client"

import { useMemo, useState } from "react"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { DOMAIN_PRESETS } from "@/lib/config/domains"
import { isBriefComplete } from "@/lib/generation/state-machine"
import { KEYWORD_MAX, KEYWORDS_MAX, validateBrief } from "@/lib/projects/validation"
import type { BriefInput, DomainKey, Project } from "@/types/domain"

interface BriefFormProps {
  project: Project
  onSave: (brief: BriefInput) => void
}

export function BriefForm({ project, onSave }: BriefFormProps) {
  const [domainKey, setDomainKey] = useState<DomainKey>(
    project.domainKey ?? "healthcare"
  )
  const [domainCustom, setDomainCustom] = useState(project.domainCustom ?? "")
  const [keywords, setKeywords] = useState<string[]>(project.keywords)
  const [draft, setDraft] = useState("")
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isConfirmOpen, setIsConfirmOpen] = useState(false)

  const brief: BriefInput = useMemo(
    () => ({
      domainKey,
      domainCustom: domainKey === "other" ? domainCustom : null,
      keywords,
    }),
    [domainCustom, domainKey, keywords]
  )

  function addKeyword(): void {
    const value = draft.trim()
    if (!value) return
    if (keywords.includes(value)) {
      setDraft("")
      return
    }
    if (keywords.length >= KEYWORDS_MAX) {
      setErrorMessage("키워드는 최대 15개입니다.")
      return
    }
    if (value.length > KEYWORD_MAX) {
      setErrorMessage("각 키워드는 2~30자여야 합니다.")
      return
    }
    setKeywords((current) => [...current, value])
    setDraft("")
    setErrorMessage(null)
  }

  function submit(): void {
    const message = validateBrief(brief)
    if (message) {
      setErrorMessage(message)
      return
    }
    if (isBriefComplete(project)) {
      setIsConfirmOpen(true)
      return
    }
    onSave(brief)
  }

  return (
    <form
      className="space-y-6"
      onSubmit={(event) => {
        event.preventDefault()
        submit()
      }}
    >
      <fieldset className="space-y-3">
        <legend className="text-sm font-medium">서비스 분야</legend>
        <RadioGroup
          value={domainKey}
          onValueChange={(value) => setDomainKey(value as DomainKey)}
          className="grid gap-2 sm:grid-cols-2"
        >
          {DOMAIN_PRESETS.map((preset) => (
            <Label
              key={preset.key}
              className="flex cursor-pointer items-center gap-2 rounded-lg border border-border px-3 py-2"
            >
              <RadioGroupItem value={preset.key} />
              {preset.label}
            </Label>
          ))}
        </RadioGroup>
        {domainKey === "other" ? (
          <Input
            value={domainCustom}
            onChange={(event) => setDomainCustom(event.target.value)}
            placeholder="분야를 직접 입력"
            maxLength={40}
          />
        ) : null}
      </fieldset>

      <div className="space-y-3">
        <Label htmlFor="keyword">키워드</Label>
        <p className="text-sm text-muted-foreground">
          톤, 타깃, 화면 종류를 칩으로 추가합니다. 최소 1개.
        </p>
        <div className="flex gap-2">
          <Input
            id="keyword"
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault()
                addKeyword()
              }
            }}
            placeholder="예: 차분한, 30대, 대시보드"
          />
          <Button type="button" variant="secondary" onClick={addKeyword}>
            추가
          </Button>
        </div>
        <ul className="flex flex-wrap gap-2">
          {keywords.map((word) => (
            <li
              key={word}
              className="inline-flex items-center gap-1 rounded-full bg-secondary px-3 py-1 text-sm"
            >
              {word}
              <button
                type="button"
                aria-label={`${word} 삭제`}
                onClick={() =>
                  setKeywords((current) => current.filter((item) => item !== word))
                }
              >
                <X className="size-3.5" />
              </button>
            </li>
          ))}
        </ul>
      </div>

      {errorMessage ? (
        <p className="text-sm text-destructive">{errorMessage}</p>
      ) : null}

      <Button type="submit">분야와 키워드 저장</Button>

      <Dialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>이후 단계를 다시 확정해야 합니다</DialogTitle>
            <DialogDescription>
              분야나 키워드를 바꾸면 컨셉부터 다시 생성·확정해야 최종 이미지를 만들 수
              있습니다. 이전 카드는 남아 있지만 오래됨으로 표시됩니다.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="secondary" onClick={() => setIsConfirmOpen(false)}>
              취소
            </Button>
            <Button
              onClick={() => {
                onSave(brief)
                setIsConfirmOpen(false)
              }}
            >
              변경하고 이어가기
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </form>
  )
}
