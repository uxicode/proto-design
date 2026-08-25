"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { POLL_INTERVAL_MS } from "@/lib/config/timeouts"
import { useProjectStore } from "@/lib/projects/store"
import {
  assertCanBuildSnapshot,
  buildInputSnapshot,
} from "@/lib/generation/context-builder"
import type {
  ComponentSet,
  Concept,
  ErrorCode,
  GenerationStatus,
  GenerationStep,
  Palette,
  PrototypeAsset,
  Wireframe,
} from "@/types/domain"

interface GenerationState {
  isLoading: boolean
  errorMessage: string | null
  errorCode: ErrorCode | null
}

interface PollPayload {
  id: string
  status: GenerationStatus
  errorCode?: ErrorCode
  errorMessageUser?: string
  artifacts?: {
    concepts?: Concept[]
    palettes?: Palette[]
    wireframes?: Wireframe[]
    componentSets?: ComponentSet[]
    prototype?: PrototypeAsset
  }
}

export function useGeneration(projectId: string) {
  const applyGeneration = useProjectStore((state) => state.applyGeneration)
  const getProject = useProjectStore((state) => state.getProject)
  const [state, setState] = useState<GenerationState>({
    isLoading: false,
    errorMessage: null,
    errorCode: null,
  })
  const inflightKey = useRef<string | null>(null)

  const start = useCallback(
    async (step: GenerationStep) => {
      const project = getProject(projectId)
      if (!project) {
        setState({
          isLoading: false,
          errorCode: "NOT_FOUND",
          errorMessage: "프로젝트를 찾을 수 없습니다.",
        })
        return
      }

      async function pollUntilDone(generationId: string): Promise<void> {
        let missingCount = 0
        while (true) {
          const response = await fetch(
            `/api/generations?id=${encodeURIComponent(generationId)}`
          )
          const json = (await response.json().catch(() => ({}))) as PollPayload & {
            code?: ErrorCode
            message?: string
          }

          if (response.status === 404) {
            missingCount += 1
            if (missingCount > 12) {
              setState({
                isLoading: false,
                errorCode: "NOT_FOUND",
                errorMessage: json.message ?? "생성 작업을 찾을 수 없습니다.",
              })
              return
            }
            await new Promise((resolve) => setTimeout(resolve, 250))
            continue
          }

          if (!response.ok) {
            setState({
              isLoading: false,
              errorCode: json.code ?? "GENERATION_FAILED",
              errorMessage: json.message ?? "생성 상태를 확인하지 못했습니다.",
            })
            return
          }

          missingCount = 0

          if (json.status === "succeeded") {
            if (json.artifacts) applyGeneration(projectId, json.artifacts)
            setState({ isLoading: false, errorMessage: null, errorCode: null })
            return
          }

          if (json.status === "failed") {
            setState({
              isLoading: false,
              errorCode: json.errorCode ?? "GENERATION_FAILED",
              errorMessage:
                json.errorMessageUser ??
                "생성에 실패했습니다. 다시 시도해 주세요.",
            })
            return
          }

          await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS))
        }
      }

      try {
        assertCanBuildSnapshot(project, step)
        const inputSnapshot = buildInputSnapshot(project, step)
        const idempotencyKey = crypto.randomUUID()
        inflightKey.current = `${projectId}:${step}`
        setState({ isLoading: true, errorMessage: null, errorCode: null })

        const response = await fetch("/api/generations", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            projectId,
            step,
            idempotencyKey,
            inputSnapshot,
          }),
        })
        const json = await response.json()
        if (!response.ok) {
          setState({
            isLoading: false,
            errorCode: json.code,
            errorMessage: json.message ?? "생성 요청에 실패했습니다.",
          })
          return
        }

        await pollUntilDone(json.generationId as string)
      } catch (error) {
        setState({
          isLoading: false,
          errorCode: "GENERATION_FAILED",
          errorMessage:
            error instanceof Error ? error.message : "생성 요청에 실패했습니다.",
        })
      }
    },
    [applyGeneration, getProject, projectId]
  )

  useEffect(() => {
    return () => {
      inflightKey.current = null
    }
  }, [])

  return { ...state, start }
}
