"use client"

import { create } from "zustand"
import { createJSONStorage, persist } from "zustand/middleware"
import { resolveKitKind } from "@/lib/ai/preview-theme"
import {
  clampBox,
  defaultBoxForType,
  defaultPropsForType,
  mergeInstancePatch,
} from "@/lib/canvas/defaults"
import { clampToFrame } from "@/lib/canvas/geometry"
import { isCanvasEditable } from "@/lib/canvas/guards"
import { migratePersistedState, sanitizeCanvasInstances } from "@/lib/canvas/migrate"
import { debouncedLocalStorage } from "@/lib/projects/debounced-storage"
import {
  applyBriefChange,
  commitArtifact,
  deriveCurrentStep,
  getCommittedArtifact,
  replaceCandidates,
  stripHeavyPreviews,
} from "@/lib/generation/state-machine"
import { validateProjectName } from "@/lib/projects/validation"
import type {
  BriefInput,
  CanvasComponentType,
  CanvasInstance,
  CanvasInstanceProps,
  ComponentSet,
  Concept,
  GenerationStep,
  Palette,
  Project,
  PrototypeAsset,
  Wireframe,
} from "@/types/domain"

export const PROJECTS_STORAGE_KEY = "protomatch:projects"
export const ONBOARDING_STORAGE_KEY = "protomatch:onboarding"

interface PersistedState {
  projects: Project[]
  onboardingCompleted: boolean
}

interface AddInstanceInput {
  type: CanvasComponentType
  x: number
  y: number
  canvasWidth: number
  canvasHeight: number
}

interface ProjectStore extends PersistedState {
  selectedInstanceId: string | null
  createProject: (name: string) => Project
  deleteProject: (id: string) => void
  updateBrief: (id: string, brief: BriefInput) => Project
  commitStepArtifact: (
    id: string,
    step: Exclude<GenerationStep, "prototype">,
    artifactId: string
  ) => Project
  applyGeneration: (
    id: string,
    payload: {
      concepts?: Concept[]
      palettes?: Palette[]
      wireframes?: Wireframe[]
      componentSets?: ComponentSet[]
      prototype?: PrototypeAsset
    }
  ) => Project
  completeOnboarding: () => void
  getProject: (id: string) => Project | undefined
  addInstance: (projectId: string, input: AddInstanceInput) => CanvasInstance | null
  moveInstance: (projectId: string, instanceId: string, x: number, y: number, canvasWidth: number, canvasHeight: number) => void
  resizeInstance: (
    projectId: string,
    instanceId: string,
    x: number,
    y: number,
    width: number,
    height: number,
    canvasWidth: number,
    canvasHeight: number
  ) => void
  updateInstanceProps: (
    projectId: string,
    instanceId: string,
    patch: Partial<CanvasInstanceProps>,
    box?: { width?: number; height?: number }
  ) => void
  deleteInstance: (projectId: string, instanceId: string) => void
  clearCanvas: (projectId: string) => void
  selectInstance: (instanceId: string | null) => void
}

function nowIso(): string {
  return new Date().toISOString()
}

function withCanvasInstances(project: Project): Project {
  return {
    ...project,
    canvasInstances: sanitizeCanvasInstances(project.canvasInstances),
  }
}

function emptyProject(name: string): Project {
  const timestamp = nowIso()
  return {
    id: crypto.randomUUID(),
    name: name.trim(),
    domainKey: null,
    domainCustom: null,
    keywords: [],
    briefVersion: 0,
    currentStep: "input",
    concepts: [],
    palettes: [],
    wireframes: [],
    componentSets: [],
    prototype: null,
    canvasInstances: [],
    createdAt: timestamp,
    updatedAt: timestamp,
  }
}

function mapProject(
  projects: Project[],
  id: string,
  updater: (project: Project) => Project
): Project[] {
  return projects.map((item) => (item.id === id ? updater(item) : item))
}

function kitForProject(project: Project) {
  const componentSet = getCommittedArtifact(project.componentSets)
  return resolveKitKind({
    title: componentSet?.title,
    items: componentSet?.items,
  })
}

export const useProjectStore = create<ProjectStore>()(
  persist(
    (set, get) => ({
      projects: [],
      onboardingCompleted: false,
      selectedInstanceId: null,
      getProject: (id) => {
        const project = get().projects.find((item) => item.id === id)
        return project ? withCanvasInstances(project) : undefined
      },
      completeOnboarding: () => set({ onboardingCompleted: true }),
      createProject: (name) => {
        const error = validateProjectName(name)
        if (error) throw new Error(error)
        const project = emptyProject(name)
        set((state) => ({ projects: [project, ...state.projects] }))
        return project
      },
      deleteProject: (id) => {
        set((state) => ({
          projects: state.projects.filter((item) => item.id !== id),
          selectedInstanceId:
            state.projects.find((item) => item.id === id) &&
            state.selectedInstanceId
              ? null
              : state.selectedInstanceId,
        }))
      },
      updateBrief: (id, brief) => {
        const current = get().getProject(id)
        if (!current) throw new Error("프로젝트를 찾을 수 없습니다.")
        const next = applyBriefChange(current, brief)
        set((state) => ({
          projects: mapProject(state.projects, id, () => next),
        }))
        return next
      },
      commitStepArtifact: (id, step, artifactId) => {
        const current = get().getProject(id)
        if (!current) throw new Error("프로젝트를 찾을 수 없습니다.")
        const next = commitArtifact(current, step, artifactId)
        set((state) => ({
          projects: mapProject(state.projects, id, () => next),
        }))
        return next
      },
      applyGeneration: (id, payload) => {
        const current = get().getProject(id)
        if (!current) throw new Error("프로젝트를 찾을 수 없습니다.")
        let next: Project = { ...current, updatedAt: nowIso() }
        if (payload.concepts) {
          next = {
            ...next,
            concepts: stripHeavyPreviews(
              replaceCandidates(next.concepts, payload.concepts)
            ),
          }
        }
        if (payload.palettes) {
          next = {
            ...next,
            palettes: stripHeavyPreviews(
              replaceCandidates(next.palettes, payload.palettes)
            ),
          }
        }
        if (payload.wireframes) {
          next = {
            ...next,
            wireframes: stripHeavyPreviews(
              replaceCandidates(next.wireframes, payload.wireframes)
            ),
          }
        }
        if (payload.componentSets) {
          next = {
            ...next,
            componentSets: stripHeavyPreviews(
              replaceCandidates(next.componentSets, payload.componentSets)
            ),
          }
        }
        if (payload.prototype) {
          next = { ...next, prototype: payload.prototype }
        }
        next = { ...next, currentStep: deriveCurrentStep(next) }
        set((state) => ({
          projects: mapProject(state.projects, id, () => next),
        }))
        return next
      },
      addInstance: (projectId, input) => {
        const current = get().getProject(projectId)
        if (!current || !isCanvasEditable(current)) return null
        const kit = kitForProject(current)
        const props = defaultPropsForType(input.type, kit)
        const box = defaultBoxForType(input.type, kit, props)
        const origin = clampToFrame(
          input.x,
          input.y,
          box.width,
          box.height,
          input.canvasWidth,
          input.canvasHeight
        )
        const zIndex =
          current.canvasInstances.reduce(
            (max, item) => Math.max(max, item.zIndex),
            0
          ) + 1
        const instance: CanvasInstance = {
          id: crypto.randomUUID(),
          type: input.type,
          x: origin.x,
          y: origin.y,
          width: box.width,
          height: box.height,
          props,
          zIndex,
        }
        set((state) => ({
          selectedInstanceId: instance.id,
          projects: mapProject(state.projects, projectId, (project) => ({
            ...project,
            canvasInstances: [...project.canvasInstances, instance],
            updatedAt: nowIso(),
          })),
        }))
        return instance
      },
      moveInstance: (projectId, instanceId, x, y, canvasWidth, canvasHeight) => {
        const current = get().getProject(projectId)
        if (!current || !isCanvasEditable(current)) return
        set((state) => ({
          projects: mapProject(state.projects, projectId, (project) => ({
            ...project,
            updatedAt: nowIso(),
            canvasInstances: project.canvasInstances.map((item) => {
              if (item.id !== instanceId) return item
              const next = clampToFrame(
                x,
                y,
                item.width,
                item.height,
                canvasWidth,
                canvasHeight
              )
              return { ...item, x: next.x, y: next.y }
            }),
          })),
        }))
      },
      resizeInstance: (projectId, instanceId, x, y, width, height, canvasWidth, canvasHeight) => {
        const current = get().getProject(projectId)
        if (!current || !isCanvasEditable(current)) return
        set((state) => ({
          projects: mapProject(state.projects, projectId, (project) => ({
            ...project,
            updatedAt: nowIso(),
            canvasInstances: project.canvasInstances.map((item) => {
              if (item.id !== instanceId) return item
              const sized = clampBox(item.type, width, height)
              const origin = clampToFrame(
                x,
                y,
                sized.width,
                sized.height,
                canvasWidth,
                canvasHeight
              )
              return {
                ...item,
                x: origin.x,
                y: origin.y,
                width: Math.round(sized.width),
                height: Math.round(sized.height),
              }
            }),
          })),
        }))
      },
      updateInstanceProps: (projectId, instanceId, patch, box) => {
        const current = get().getProject(projectId)
        if (!current || !isCanvasEditable(current)) return
        set((state) => ({
          projects: mapProject(state.projects, projectId, (project) => ({
            ...project,
            updatedAt: nowIso(),
            canvasInstances: project.canvasInstances.map((item) => {
              if (item.id !== instanceId) return item
              const merged = mergeInstancePatch(item, patch, box)
              return merged
            }),
          })),
        }))
      },
      deleteInstance: (projectId, instanceId) => {
        const current = get().getProject(projectId)
        if (!current || !isCanvasEditable(current)) return
        set((state) => ({
          selectedInstanceId:
            state.selectedInstanceId === instanceId ? null : state.selectedInstanceId,
          projects: mapProject(state.projects, projectId, (project) => ({
            ...project,
            updatedAt: nowIso(),
            canvasInstances: project.canvasInstances.filter(
              (item) => item.id !== instanceId
            ),
          })),
        }))
      },
      clearCanvas: (projectId) => {
        const current = get().getProject(projectId)
        if (!current || !isCanvasEditable(current)) return
        set((state) => ({
          selectedInstanceId: null,
          projects: mapProject(state.projects, projectId, (project) => ({
            ...project,
            updatedAt: nowIso(),
            canvasInstances: [],
          })),
        }))
      },
      selectInstance: (instanceId) => {
        set({ selectedInstanceId: instanceId })
      },
    }),
    {
      name: PROJECTS_STORAGE_KEY,
      version: 1,
      storage: createJSONStorage(() => debouncedLocalStorage),
      partialize: (state) => ({
        projects: state.projects,
        onboardingCompleted: state.onboardingCompleted,
      }),
      migrate: (persisted) => migratePersistedState(persisted) as PersistedState,
    }
  )
)

export function useHasHydrated(): boolean {
  return useProjectStore((state) => state.projects !== undefined)
}
