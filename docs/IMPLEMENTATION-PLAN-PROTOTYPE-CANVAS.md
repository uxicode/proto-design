# ProtoMatch 구현 Plan — 프로토타입 캔버스 편집 레이어

- **문서 버전**: 0.2
- **기준 PRD**: `docs/PRD-PROTOTYPE-CANVAS.md` v0.1 (Draft, 2026-08-25)
- **부모 PRD**: `docs/PRD.md` v0.2
- **부모 구현 Plan**: `docs/IMPLEMENTATION-PLAN.md` v0.2 — **본 문서는 덮어쓰지 않는다**
- **대상 스택**: Next.js 14 App Router, TypeScript, TailwindCSS, Shadcn UI, kebab-case, named export
- **워크스페이스**: `/Users/jeonbongcheol/Desktop/proj/proto-design`
- **작성일**: 2026-08-25
- **개정**: 2026-08-25 — 좌측 컴포넌트 라이브러리·캔버스 인스턴스 렌더러를 **shadcn/ui (`@/components/ui`)** 로 고정. PRD의 키트 role 9종(`heading`/`text`/`image`/`navigation` 포함)은 본 Plan에서 대체한다.

---

## 0. MVP Must 요약

4단계(컨셉·팔레트·와이어·컴포넌트)가 `committed`이고 stale이 아닐 때만 프로토타입 스텝에서 캔버스를 편집한다. 3열(좌 **shadcn/ui 라이브러리** / 중 베이스 목업+오버레이 / 우 인스펙터)에서 적용은 정중앙·자동 선택, DnD는 드롭 지점이 인스턴스 중심(밖이면 미생성), 인스턴스는 자유 드래그·16px 클램프, 단일 선택, 베이스는 `pointer-events: none`이다. 팔레트 항목과 캔버스 위 블록은 **같은 `@/components/ui/*` 컴포넌트**로 그린다. 인스펙터는 스키마 필드·shadcn `variant`/`size`·읽기전용 JSX(복사, eval 금지)만 제공하고, 선택은 즉시 삭제(Undo 없음)한다. `canvasInstances[]`는 Zustand persist `protomatch:projects`로 저장하고, stale 시 트리는 유지·편집만 잠그며 재확정 후 좌표·카피는 유지하고 **CSS 변수로 입힌 확정 팔레트**만 재바인딩한다. 캔버스 비우기는 활성일 때만.

---

## 1. 한 줄 요약

확정된 프로토타입 목업 위에, 같은 브라우저 localStorage만으로 컴포넌트 인스턴스를 올리고 옮기고 속성을 고칠 수 있는 로컬 편집 레이어를 프로토타입 스텝에 붙인다.

---

## 2. 목표

1. `canGenerate(project, "prototype").ok`일 때만 추가·이동·속성·삭제·비우기가 된다.
2. 적용 = 캔버스 정중앙 + 자동 선택. DnD = 드롭 중심. 밖이면 생성하지 않는다.
3. 인스턴스 좌표·props는 새로고침 후에도 동일 프로젝트에서 유지된다.
4. 앞 단계 재확정(stale) 시 트리는 남고 편집은 잠긴다. 재확정 후 **스테이지 CSS 변수(확정 팔레트)** 와 키트→`size` 매핑만 다시 입힌다.
5. 생성 코드는 문자열 JSX뿐이며 실행되지 않는다. import는 `@/components/ui/*`. `avatar.src`는 `http(s)`만.

---

## 3. 가정 · 오픈 이슈 고정값 · 스파이크

### 3.1 가정

- 인증·Supabase·생성 API 변경 없음. 캔버스는 클라이언트 스토어만 쓴다.
- `prototype-result.tsx`는 `workbench-view.tsx`(`'use client'`) 아래에서만 쓰이므로, 캔버스 트리는 그 클라이언트 경계 안의 **작은 `'use client'` 서브트리**로 둔다.
- 베이스 목업은 기존 `PrototypeScreen`을 삭제하지 않고 오버레이한다.
- 색 hex는 인스턴스에 저장하지 않는다. shadcn `variant`/`size`만 저장하고, 스테이지 루트에 확정 팔레트를 **CSS 변수(`--primary` 등)** 로 올려 재바인딩한다.
- 좌측 라이브러리의 유일한 소스는 `components/ui` (shadcn new-york). 커스텀 heading/text/image/navigation 팔레트는 P0에 두지 않는다.
- 선택은 persist하지 않는다. 새로고침 후 `selectedInstanceId = null`.
- 데스크톱 Pointer Events 우선. 터치 제스처는 P1.
- 새 DnD 라이브러리(`@dnd-kit`, `react-dnd`)는 P0에 넣지 않는다.

### 3.2 오픈 이슈 → 구현 기본값 (PRD §11 고정)

| # | 이슈 | **P0 고정값** |
| --- | --- | --- |
| 1 | DnD 최초 좌표 | **DnD = 드롭 지점이 인스턴스 중심**. **적용 = 캔버스 정중앙**. 드롭이 캔버스 밖이면 미생성. 클램프는 생성 후 16px 규칙만. |
| 2 | 코드 패널 언어 | **JSX 한 블록**. HTML 탭 없음. |
| 3 | 베이스 목업 | **항상 표시**. 숨김 토글은 P1. |
| 4 | 논리 좌표 | **캔버스 콘텐츠 박스 CSS 픽셀**. `x,y`는 인스턴스 **좌상단**. CSS `transform`이 있으면 `getBoundingClientRect` 대비 `clientWidth/Height` 비율로 **역변환**. 고정 1440×900 논리 캔버스는 쓰지 않는다. |
| 5 | 삭제 확인 | **P0 즉시 삭제**. Undo 없음. 확인 모달 없음. |
| 6 | 인스턴스 상한 | **50개부터 소프트 경고**. 하드캡 없음(성능 가정: 50개에서 드래그가 사용 가능). |
| 7 | 목록형 최대 | **select 옵션 2~5**, **radio-group 항목 2~4**, **tabs 라벨 2~4**. navigation/heading/text/image는 P0 팔레트에 없음. |
| 8 | persist 마이그레이션 실패 | **`canvasInstances = []`**. 프로젝트 로드 자체를 실패시키지 않는다. |
| 9 | 좌측 라이브러리 | **shadcn/ui**. 캔버스 렌더러·codegen도 `@/components/ui` import. PRD 키트 9종은 본 Plan이 우선. |

### 3.3 스파이크 (선택, 0.5일 이내)

- HTML5 `dataTransfer`가 Safari에서 커스텀 MIME을 비우면 `text/plain` 폴백을 쓰는지 확인. 실패 시에만 라이브러리 도입을 재검토한다. **기본은 네이티브**.

---

## 4. 범위

### 4.1 이번 Plan에 포함 (P0)

- 게이트, 3열 셸, **shadcn/ui 팔레트(아래 카탈로그)**, 적용, DnD 추가, 자유 이동, 클램프, 단일 선택, 인스펙터(`variant`/`size`·스키마), JSX 코드+복사, 즉시 삭제, 비우기, persist, stale 잠금+CSS 변수 재바인딩, URL/XSS 가드, 단위·E2E.
- 누락된 shadcn 컴포넌트는 `npx shadcn@latest add`로 추가한다. 캔버스용 커스텀 primitive를 새로 그리지 않는다.

### 4.2 제외 (비목표 · 부모 상용화 · P1 이후)

| 항목 | 이유 |
| --- | --- |
| 4단계 스킵 후 빈 캔버스 | 부모 핵심 가치 보호 |
| 실시간 협업, Figma export, 오토레이아웃, eval | PRD 비목표 |
| 인증, Supabase, 크레딧, 생성 API 변경 | 부모 1차 범위. 본 기능은 추가 모델 호출 없음 |
| 다중 선택, Undo/Redo, z-index UI, 스냅, 리사이즈 핸들, 베이스 숨김, 임의 hex | **P1 — 나중**. 본 Plan 작업 카드로 분해하지 않음 |
| 터치 전용 제스처, 이미지 업로드(data URL), 인스턴스 복제 | P2 |
| `docs/IMPLEMENTATION-PLAN.md` 수정 | 별도 문서 유지 |

---

## 5. 요구사항 → 작업 매핑

| 요구사항 | 작업 | 수용 기준 충족 방식 |
| --- | --- | --- |
| 4단계 committed & 비-stale일 때만 편집 | T02, T07 | `isCanvasEditable` = `canGenerate(..., "prototype").ok`. 잠금 시 팔레트/드롭/폼 disabled + 이유 문구 |
| 3열 셸 | T07 | `canvas-shell`: 좌 팔레트, 중 스테이지, 우 인스펙터 |
| shadcn/ui 팔레트 | T00, T01, T08 | `CANVAS_COMPONENT_TYPES` 전 항목을 항상 표시. 각 행은 실제 `@/components/ui` 미니 프리뷰 |
| 적용 → 정중앙 + 자동 선택 | T02, T04, T08 | `centerOrigin(W,H,w,h)` 후 `addInstance` + `selectInstance` |
| DnD 추가, 밖이면 미생성 | T09 | drop 좌표 → 중심. `relatedTarget`/`currentTarget`이 스테이지가 아니면 return |
| 자유 드래그 + 16px 클램프 | T02, T11 | 드래그 중 로컬 좌표, pointerup에 `moveInstance`. `clampToFrame(..., 16)` |
| 단일 선택, 빈 곳 해제, 베이스 비히트 | T07, T10 | 베이스 래퍼 `pointer-events-none`. 오버레이 빈 클릭 → `selectInstance(null)` |
| 인스펙터 스키마 + shadcn variant/size | T01, T12 | 타입별 props 유니온만 폼. hex 피커 없음. 색은 스테이지 CSS 변수 |
| 읽기전용 JSX + 복사, eval 금지 | T05, T12 | `lib/canvas/codegen.ts` 문자열. 패널은 readOnly. `eval`/`new Function` 금지 |
| 즉시 삭제 | T13 | 인스펙터 삭제 + Delete/Backspace(입력 포커스 아닐 때). 확인 없음 |
| persist `canvasInstances[]`, 구 프로젝트 `[]` | T03, T04 | persist `version: 1` migrate. 실패 시 `[]` |
| stale 시 트리 유지·잠금, 재확정 후 스타일만 재바인딩 | T04, T06, T07 | commit/brief가 배열을 지우지 않음. hex 미저장. 스테이지 CSS 변수만 갱신 |
| 캔버스 비우기(활성만) | T13 | `clearCanvas`. 잠금이면 disabled |
| 소프트 경고 50 | T08 | count ≥ 50이면 한국어 경고. 추가는 막지 않음 |
| select 5 / radio·tabs 4 | T01, T12 | 스키마 max. 인스펙터에서 초과 입력 불가 |
| `avatar.src` http(s)만 | T02, T06 | `javascript:`/`data:`/`blob:` 거부. 빈 값이면 Avatar fallback |
| 한국어 UI | T07, T16 | 팔레트·빈 상태·잠금·경고 문구 |

---

## 6. 아키텍처

```
[프로토타입 스텝]
  workbench-view.tsx          ('use client', 기존)
    prototype-result.tsx      (합성. 생성 CTA + 스펙 그리드 유지)
      canvas-shell.tsx        ('use client' 경계)
        component-palette     shadcn 카탈로그 / 적용 / dragstart
        canvas-stage          베이스 + 오버레이 + drop + CSS 변수 테마
          PrototypeScreen     pointer-events-none 래퍼
          canvas-overlay      instances (zIndex 정렬, 실제 shadcn 컴포넌트)
        canvas-inspector      폼(variant/size) + code-panel + 삭제
              │
              ▼
  useProjectStore (zustand persist protomatch:projects)
    Project.canvasInstances[]     persist O, 디바운스 300ms
    selectedInstanceId            persist X
              │
  순수 모듈 (서버/클라이언트 공용, 실행 없음)
    lib/canvas/geometry.ts
    lib/canvas/guards.ts
    lib/canvas/codegen.ts         import { Button } from "@/components/ui/button" 형태 문자열
    lib/canvas/defaults.ts
    lib/canvas/shadcn-catalog.ts  type → ui 모듈 경로·표시명
    lib/ai/preview-theme.ts       paletteFromSwatches, resolveKitKind → CSS 변수 / size
    lib/generation/state-machine  canGenerate, getCommittedArtifact 재사용
```

**넣지 않음**: 새 Route Handler, 생성 job, 상태머신 전이 변경, Supabase.

### 6.1 RSC 원칙

- 페이지 RSC는 그대로. 워크벤치는 이미 클라이언트다.
- `'use client'`는 `components/workbench/canvas/*`와 스토어 액션을 쓰는 셸에만. 순수 `lib/canvas/*`는 지시문 없음.
- `PrototypeResult` 전체를 새로 client로 바꿀 필요는 없다. 이벤트 트리는 `CanvasShell`로 격리한다.

### 6.2 베이스 vs 오버레이 히트

```
div.relative [data-canvas-stage]     ← 논리 박스 = 이 요소의 content box
  div.pointer-events-none            ← PrototypeScreen (선택·드래그 불가)
  div.absolute.inset-0               ← 인스턴스 + 빈 곳 클릭 해제
```

크롬 바(트래픽 라이트)는 캔버스 밖이다. 스테이지는 `PrototypeScreen`과 같은 박스만 덮는다.

### 6.3 토큰 재바인딩 (구현 방식)

인스턴스 `props`에 hex·radius를 저장하지 않는다. 커스텀 박스 스킨 대신 **shadcn CSS 변수**를 쓴다.

- 스테이지 루트(`[data-canvas-stage]`)에 확정 팔레트를 인라인 스타일로 올린다.
  - `primary` swatch → `--primary`
  - `secondary` → `--secondary`
  - `accent` → `--accent`
  - `background` → `--background` / `--card`
  - `text` → `--foreground` / `--card-foreground`
  - `--primary-foreground` 등은 대비가 충분한 고정 전경(또는 팔레트 `text`)을 쓴다.
- 키트 `solid` → 생성 시 `variant: "default"`, `size: "default"`
- 키트 `soft` → `variant: "secondary"` (버튼·배지) 또는 `outline`
- 키트 `compact` → `size: "sm"` (해당 컴포넌트에 size가 있을 때)
- **재바인딩 시** 저장된 `variant`/`size`/카피는 유지한다. 바뀌는 것은 스테이지 CSS 변수와 키트 radius(`--radius`)뿐이다.
- 인스펙터에서 사용자가 고른 `variant`/`size`는 persist되며, 재확정이 덮어쓰지 않는다.
- stale 잠금 화면: 표시용으로 committed가 없으면 **가장 최근 stale 산출물**로 목업·CSS 변수를 그린다. 편집은 계속 잠금.
- 프로토타입 “다시 생성”은 `applyGeneration`이 `prototype`만 교체하고 `canvasInstances`는 그대로 둔다.

### 6.4 DnD 구현 선택

| 동작 | 구현 |
| --- | --- |
| 팔레트 → 캔버스 추가 | HTML5 Drag and Drop (`draggable`, `dataTransfer`, `dragover`+`preventDefault`, `drop`) |
| 인스턴스 재배치 | **Pointer Events** (`pointerdown/move/up`, `setPointerCapture`). HTML5 DnD로 옮기지 않음 |

커스텀 타입 키: `application/x-protomatch-canvas-type`. Safari 폴백: `text/plain`에 동일 `type` 문자열.

### 6.5 좌측 라이브러리 = shadcn/ui

좌측 팔레트·오버레이 렌더러·codegen은 **같은 카탈로그**를 쓴다. 소스는 `components.json` (style: new-york, baseColor: zinc, cssVariables: true)과 `@/components/ui/*`.

**P0 카탈로그 (`CANVAS_COMPONENT_TYPES`)**

| type | UI 모듈 | 레포 상태 | 비고 |
| --- | --- | --- | --- |
| `button` | `@/components/ui/button` | 있음 | `variant`/`size` |
| `input` | `@/components/ui/input` | 있음 | |
| `textarea` | `@/components/ui/textarea` | 있음 | |
| `label` | `@/components/ui/label` | 있음 | |
| `card` | `@/components/ui/card` | 있음 | Header/Title/Description/Content |
| `badge` | `@/components/ui/badge` | 있음 | `variant` |
| `alert` | `@/components/ui/alert` | 있음 | Title + Description |
| `separator` | `@/components/ui/separator` | 있음 | `orientation` |
| `radio-group` | `@/components/ui/radio-group` | 있음 | 항목 2~4 |
| `tabs` | `@/components/ui/tabs` | **T00에서 add** | 라벨 2~4 |
| `checkbox` | `@/components/ui/checkbox` | **T00에서 add** | |
| `switch` | `@/components/ui/switch` | **T00에서 add** | |
| `avatar` | `@/components/ui/avatar` | **T00에서 add** | PRD `image` 대체. `src`는 http(s)만 |
| `select` | `@/components/ui/select` | **T00에서 add** | 옵션 2~5 |

**P0에서 넣지 않음**

| 항목 | 이유 |
| --- | --- |
| `dialog` (레포에 이미 있음) | Portal/오버레이가 캔버스 논리 박스 밖으로 나감. 인스턴스 좌표와 충돌 |
| `heading` / `text` / `image` / `navigation` | shadcn 컴포넌트가 아님. PRD 9종은 본 Plan이 대체 |
| 팔레트에 없는 `@/components/ui` 추가분 | P1. 카탈로그 배열만 늘린다 |

팔레트 행 UI:

- 표시명 한국어 (버튼, 입력, 카드 …).
- 오른쪽 미니 프리뷰는 **실제 shadcn 컴포넌트**를 작게 렌더한다(스크린샷/이모지 플레이스홀더 금지).
- 잠금이면 `draggable={false}` + 적용 disabled.

렌더러 규칙:

- `instance-renderers.tsx`는 `import { Button } from "@/components/ui/button"` 등 **named export를 직접 import**.
- 인스턴스 래퍼(선택 링, pointer 드래그)만 커스텀. 안쪽은 shadcn DOM.
- 드래그 중 버튼 클릭이 폼 submit처럼 동작하지 않게 인스턴스 내부 인터랙티브는 `pointer-events-none` (선택·이동만). 인스펙터에서 상태를 바꾼다.

---

## 7. 데이터 모델

`types/domain.ts`에 추가한다. `enum` 없이 `as const` + 유니온.

```typescript
export const CANVAS_COMPONENT_TYPES = [
  "button",
  "input",
  "textarea",
  "label",
  "card",
  "badge",
  "alert",
  "separator",
  "radio-group",
  "tabs",
  "checkbox",
  "switch",
  "avatar",
  "select",
] as const

export type CanvasComponentType = (typeof CANVAS_COMPONENT_TYPES)[number]

export type ShadcnButtonVariant =
  | "default"
  | "secondary"
  | "outline"
  | "ghost"
  | "destructive"
  | "link"

export type ShadcnButtonSize = "default" | "sm" | "lg"

export type ShadcnBadgeVariant = "default" | "secondary" | "outline" | "destructive"

export interface CanvasButtonProps {
  label: string
  variant: ShadcnButtonVariant
  size: ShadcnButtonSize
  disabled: boolean
}

export interface CanvasInputProps {
  placeholder: string
  value: string
  disabled: boolean
}

export interface CanvasTextareaProps {
  placeholder: string
  value: string
  disabled: boolean
}

export interface CanvasLabelProps {
  text: string
}

export interface CanvasCardProps {
  title: string
  description: string
  body: string
}

export interface CanvasBadgeProps {
  label: string
  variant: ShadcnBadgeVariant
}

export interface CanvasAlertProps {
  title: string
  description: string
}

export interface CanvasSeparatorProps {
  orientation: "horizontal" | "vertical"
}

export interface CanvasRadioGroupProps {
  items: string[] // length 2..4
  value: string
}

export interface CanvasTabsProps {
  labels: string[] // length 2..4
  activeIndex: number
}

export interface CanvasCheckboxProps {
  label: string
  checked: boolean
}

export interface CanvasSwitchProps {
  label: string
  checked: boolean
}

export interface CanvasAvatarProps {
  alt: string
  src: string // 빈 문자열 = fallback. 렌더 시 http(s)만
}

export interface CanvasSelectProps {
  options: string[] // length 2..5
  value: string
  placeholder: string
}

export type CanvasInstanceProps =
  | CanvasButtonProps
  | CanvasInputProps
  | CanvasTextareaProps
  | CanvasLabelProps
  | CanvasCardProps
  | CanvasBadgeProps
  | CanvasAlertProps
  | CanvasSeparatorProps
  | CanvasRadioGroupProps
  | CanvasTabsProps
  | CanvasCheckboxProps
  | CanvasSwitchProps
  | CanvasAvatarProps
  | CanvasSelectProps

export interface CanvasInstance {
  id: string
  type: CanvasComponentType
  x: number
  y: number
  width: number
  height: number
  props: CanvasInstanceProps
  zIndex: number
}

export interface Project {
  // ...기존 필드
  canvasInstances: CanvasInstance[]
}
```

`props`는 타입 가드를 `instance.type`으로 좁힌다. 함수·클래스·DOM 노드는 저장하지 않는다. hex·`colorRole`은 인스턴스에 두지 않는다.

### 7.1 타입별 기본 박스 (논리 px)

생성 시점 키트가 `compact`이면 `size: "sm"`인 타입의 높이만 낮춘다. **재바인딩 시 width/height는 유지**한다.

| type | width | height |
| --- | --- | --- |
| button | 136 | default/lg 40, sm 32 |
| input | 240 | 36 |
| textarea | 240 | 88 |
| label | 160 | 24 |
| card | 280 | 176 |
| badge | 88 | 24 |
| alert | 320 | 88 |
| separator | 240 (horizontal) / 8 (vertical) | 8 / 120 |
| radio-group | 200 | 항목 수 × 32 |
| tabs | 320 | 40 |
| checkbox | 180 | 24 |
| switch | 180 | 24 |
| avatar | 40 | 40 |
| select | 220 | 36 |

최소 크기 하한(인스펙터 클램프): button 80×24, input 120×28, textarea 120×48, label 48×16, card 160×80, badge 48×16, alert 160×48, separator 40×4, radio-group 120×48, tabs 160×28, checkbox 80×20, switch 80×20, avatar 24×24, select 120×28.

### 7.2 기본 props

생성 시 키트 매핑을 기본 `variant`/`size`에 한 번 적용한다. 이후 사용자가 인스펙터에서 바꾼 값은 유지.

- button: `{ label: "버튼", variant: "default", size: "default", disabled: false }` (`soft`→`secondary`, `compact`→`size: "sm"`)
- input: `{ placeholder: "입력하세요", value: "", disabled: false }`
- textarea: `{ placeholder: "내용을 입력하세요", value: "", disabled: false }`
- label: `{ text: "레이블" }`
- card: `{ title: "카드 제목", description: "설명", body: "본문을 입력하세요" }`
- badge: `{ label: "배지", variant: "default" }` (`soft`→`secondary`)
- alert: `{ title: "알림", description: "설명을 입력하세요" }`
- separator: `{ orientation: "horizontal" }`
- radio-group: `{ items: ["옵션 1", "옵션 2"], value: "옵션 1" }`
- tabs: `{ labels: ["탭 1", "탭 2"], activeIndex: 0 }`
- checkbox: `{ label: "동의", checked: false }`
- switch: `{ label: "켜기", checked: false }`
- avatar: `{ alt: "아바타", src: "" }`
- select: `{ options: ["항목 1", "항목 2"], value: "항목 1", placeholder: "선택" }`

### 7.3 기존 테스트 fixture

`Project`에 `canvasInstances`가 필수이므로 `tests/unit/state-machine.test.ts` 등 `baseProject`에 `canvasInstances: []`를 넣는다. 상태머신 동작은 바꾸지 않는다.

---

## 8. 좌표 시스템 (한 가지로 고정)

**논리 좌표 = `[data-canvas-stage]` 콘텐츠 박스 CSS 픽셀.** 저장 단위는 그 박스의 좌상단 원점, 인스턴스 `x,y`는 박스 좌상단.

화면 좌표 → 논리:

```
logicalX = (clientX - rect.left) * (el.clientWidth / rect.width)
logicalY = (clientY - rect.top) * (el.clientHeight / rect.height)
```

`rect.width === 0`이면 변환하지 않고 drop을 무시한다.

- **적용**: `x = (W - width) / 2`, `y = (H - height) / 2` (박스 중심 = 캔버스 중심).
- **DnD 생성**: 드롭 논리점이 인스턴스 중심 → `x = dropX - width/2`, `y = dropY - height/2`.
- **클램프**: 박스와 프레임 AABB 교집합이 각 축 ≥ 16px. 완전히 사라지지 않게 `x,y`만 조정한다(P0는 리사이즈 없음).
- 드래그 중에는 오버레이 로컬 state만 갱신하고, **pointerup에서만** 스토어에 `x,y`를 쓴다(픽셀마다 persist 금지).
- 인스펙터 숫자와 캔버스는 같은 논리 좌표를 쓴다.

P0에서 `PrototypeScreen`에 transform이 없어도 위 식을 쓴다. 이후 스케일 프리뷰를 넣어도 공식이 같다.

---

## 9. 스토어 · persist

파일: `lib/projects/store.ts`. 키는 기존 `PROJECTS_STORAGE_KEY = "protomatch:projects"`.

### 9.1 액션

| 액션 | 역할 |
| --- | --- |
| `addInstance(projectId, input)` | type + 논리 x,y + 카탈로그 기본 크기/props(키트→variant/size 1회 적용). `id = crypto.randomUUID()`. `zIndex = max+1` (없으면 1). `updatedAt` 갱신. 소프트 경고만, 추가는 거부하지 않음 |
| `moveInstance(projectId, instanceId, x, y)` | 클램프된 좌표 저장 |
| `updateInstanceProps(projectId, instanceId, patch)` | 스키마 필드만. width/height 하한 클램프. type 변경 금지 |
| `deleteInstance(projectId, instanceId)` | 배열에서 제거. 선택 중이면 `selectedInstanceId = null` |
| `clearCanvas(projectId)` | `canvasInstances = []`. 호출 측에서 `isCanvasEditable`을 검사. 스토어는 잠금이어도 기술적으로 가능하므로 **UI에서만 막고**, 가드 함수를 액션 앞단에서도 호출해 stale 중 비우기를 거부한다 |
| `selectInstance(instanceId \| null)` | 세션 전용. persist `partialize`에서 제외 |

`createProject` / `emptyProject`는 `canvasInstances: []`를 넣는다.

`commitStepArtifact` / `updateBrief` / `applyGeneration`은 기존처럼 project spread → **배열을 건드리지 않음**(유지+잠금).

### 9.2 선택 상태

```typescript
selectedInstanceId: string | null  // persist 제외
```

프로젝트 전환 시 `null`. persist 복원 후에도 `null`.

### 9.3 디바운스 전략 (300ms)

Zustand persist는 매 `set`마다 `localStorage`에 쓴다. 드래그 중 매 픽셀 직렬화를 막기 위해 **이중 장치**를 둔다.

1. **쓰기 빈도**: 이동은 pointerup 1회. 인스펙터 키 입력은 스토어를 즉시 갱신(화면 동기화)하되 persist 스토리지만 디바운스.
2. **커스텀 storage**: `setItem`을 300ms debounce. 마지막 페이로드만 기록.
3. **플러시**: `visibilitychange` hidden, `pagehide`에서 타이머를 취소하고 즉시 `setItem`.
4. **금지**: 드래그 `pointermove`에서 `moveInstance` 호출.

구현 위치: `lib/projects/debounced-storage.ts` (또는 `store.ts` 내부). `createJSONStorage(() => debouncedLocalStorage)`.

### 9.4 마이그레이션

persist 옵션:

```typescript
version: 1,
migrate: (persisted, version) => {
  // version 0 / 필드 없음 / 파싱 실패 / 배열 아님 → canvasInstances: []
  // 항목별 필수 키 없으면 그 항목 drop. 전부 실패해도 프로젝트는 유지
}
```

개별 인스턴스 sanitize 실패는 해당 항목만 버리고 나머지는 살린다. **migrate 함수 전체가 throw하면 catch에서 모든 프로젝트 `canvasInstances = []`.** 프로젝트 목록 로드 실패로 만들지 않는다.

구 프로젝트(필드 없음) → `[]`.

---

## 10. 파일 목록

신규·수정만. kebab-case, named export.

### 10.1 수정

| 파일 | 변경 |
| --- | --- |
| `types/domain.ts` | `CanvasInstance` 및 shadcn props, `Project.canvasInstances` |
| `lib/projects/store.ts` | 액션, persist version/migrate, 디바운스 storage, partialize |
| `components/workbench/prototype-result.tsx` | 3열 셸 삽입. 잠금 시에도 스테이지+오버레이 표시 |
| `components/workbench/prototype-screen.tsx` | 직접 수정 최소화. 히트는 래퍼에서 차단 |
| `components/ui/*` | T00: 없는 항목만 `npx shadcn@latest add tabs checkbox switch avatar select` |
| `tests/unit/state-machine.test.ts` 외 fixture | `canvasInstances: []` |
| `docs/IMPLEMENTATION-PLAN.md` | **수정하지 않음** |

### 10.2 신규 — lib

| 파일 | 역할 |
| --- | --- |
| `lib/canvas/defaults.ts` | 카탈로그 기본 크기·props, 하한, select/radio/tabs 길이 |
| `lib/canvas/shadcn-catalog.ts` | type → import 경로, 한국어 표시명, 미니 프리뷰 메타 |
| `lib/canvas/geometry.ts` | `clientToLogical`, `centerOrigin`, `originFromDropCenter`, `clampToFrame` |
| `lib/canvas/guards.ts` | `isCanvasEditable`, `isSafeHttpUrl`, `sanitizeCanvasInstances` |
| `lib/canvas/codegen.ts` | `generateInstanceJsx(instance): string` — `@/components/ui` import + JSX. hex 인라인 금지 |
| `lib/canvas/migrate.ts` | persist blob → `canvasInstances[]` |
| `lib/projects/debounced-storage.ts` | 300ms persist + flush |

### 10.3 신규 — UI (`components/workbench/canvas/`)

| 파일 | 역할 |
| --- | --- |
| `canvas-shell.tsx` | 3열 레이아웃, 게이트 전달, 비우기, 50 경고 |
| `component-palette.tsx` | 카탈로그 전 행 + 적용 + dragstart |
| `palette-item.tsx` | 행 UI. 실제 shadcn 미니 프리뷰 |
| `canvas-stage.tsx` | 스테이지 ref, drop, 빈 곳 클릭, CSS 변수 테마 |
| `canvas-overlay.tsx` | zIndex 정렬 렌더 |
| `canvas-instance.tsx` | 선택 링 + pointer 이동. 내부 shadcn은 pointer-events-none |
| `instance-renderers.tsx` | `Record<CanvasComponentType, ...>` 맵. `@/components/ui` 직접 import |
| `canvas-inspector.tsx` | 빈 상태 / 폼 / 삭제 |
| `inspector-fields.tsx` | 타입별 스키마 + variant/size |
| `code-panel.tsx` | readOnly JSX + 복사 |
| `canvas-lock-hint.tsx` | 미확정/stale 한국어 이유 |
| `clear-canvas-button.tsx` | 활성일 때만 |

### 10.4 신규 — 테스트

| 파일 | 역할 |
| --- | --- |
| `tests/unit/canvas-geometry.test.ts` | 중앙, 드롭 중심, 클램프 16px, 역변환 |
| `tests/unit/canvas-guards.test.ts` | 편집 게이트, URL 가드 |
| `tests/unit/canvas-codegen.test.ts` | `@/components/ui/button` import·라벨·variant 포함, hex 인라인 없음, 스크립트 미실행 |
| `tests/unit/canvas-store.test.ts` | add/move/update/delete/clear, 선택 비영속, stale 시 트리 유지 |
| `tests/unit/canvas-migrate.test.ts` | 구 프로젝트 `[]`, 손상 페이로드 `[]` |
| `tests/e2e/prototype-canvas.spec.ts` | 적용→중앙→이동→라벨 변경→새로고침 유지 |

컴포넌트 수준: P0는 렌더러를 순수 함수/맵으로 두고 단위 테스트로 커버한다. `@testing-library/react`는 현재 의존성에 없음. 필요해지면 T14에서 jsdom 환경만 추가하고, 무거운 RTL 도입은 선택.

---

## 11. UI · 렌더러 규칙

### 11.1 인스턴스 렌더러

- `instance-renderers.tsx`의 **타입 → shadcn 컴포넌트 맵**. `switch` 누락 시 컴파일로 드러나게 `satisfies Record<CanvasComponentType, ...>`.
- 사용자 문자열은 `{label}` 등 **텍스트 노드**만. `dangerouslySetInnerHTML` 금지. 코드 패널 문자열을 DOM에 삽입하지 않음.
- `avatar`: `isSafeHttpUrl(src)`일 때만 `AvatarImage`. 아니면 `AvatarFallback`. `javascript:` / `data:` / `blob:` / 상대 경로 / `//` 프로토콜-상대는 거부.
- 채움색·전경색은 인스턴스 인라인이 아니라 **스테이지 CSS 변수**. shadcn `bg-primary` 등이 확정 팔레트를 탄다.
- `--radius`는 `kitRadius(resolveKitKind(...))`를 스테이지에 올린다.
- 선택: 링(색+두께) + `aria-selected` / 스크린리더용 “선택됨”. 색만으로 구분하지 않음.
- 캔버스 위 shadcn 컨트롤은 미리보기일 뿐, 클릭으로 앱 상태를 바꾸지 않는다(`pointer-events-none`).

### 11.2 codegen (`lib/canvas/codegen.ts`)

- 입력: 인스턴스. 테마 hex는 넣지 않는다(소비 앱의 CSS 변수를 가정).
- 출력: import + JSX 한 블록. 사용자 텍스트는 `JSON.stringify`로 이스케이프.
- 버튼 예:

```tsx
import { Button } from "@/components/ui/button"

<Button variant="default" size="sm">가입</Button>
```

- 카드는 `Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`를 조합한 문자열.
- `eval`, `new Function`, `Function(`, iframe `srcdoc` 실행 경로 없음.
- 코드 패널을 고쳐 써도 스토어에 apply하지 않음 (`readOnly`).

### 11.3 잠금 UI

- 미확정: 팔레트·드롭·인스펙터 편집 disabled. `canvas-lock-hint`에 어떤 단계가 비었는지.
- stale: 인스턴스는 보이되 이동/추가/속성/삭제/비우기 불가. 기존 `StaleBanner`와 캔버스 힌트를 함께 쓴다.
- 4단계가 다시 ok면 동일 id의 인스턴스가 **새 스테이지 CSS 변수**(확정 팔레트)로 그려진다. 저장된 variant/size/라벨은 유지.

---

## 12. 작업 목록 (WBS)

각 카드 0.5~2일. **구현 태스크는 P0만.**

### T00 — shadcn 카탈로그 설치

- **목적**: 좌측 라이브러리와 렌더러가 쓸 `@/components/ui` 모듈을 맞춘다.
- **산출물**: `npx shadcn@latest add tabs checkbox switch avatar select` (이미 있는 button/input/textarea/label/card/badge/alert/separator/radio-group은 재생성하지 않음). `dialog`는 캔버스 카탈로그에 넣지 않음.
- **선행**: 없음
- **병렬**: T01
- **완료 조건**: 카탈로그 14종 파일이 `components/ui`에 존재. `pnpm exec tsc --noEmit` 그린. 커스텀 heading/nav primitive 파일 없음.

### T01 — 도메인 타입 · 기본값 · 스키마

- **목적**: `CanvasInstance`와 shadcn 카탈로그 props·하한·select/radio/tabs 길이를 코드로 고정한다.
- **산출물**: `types/domain.ts` 확장, `lib/canvas/defaults.ts`, `lib/canvas/shadcn-catalog.ts`, 기존 fixture에 `canvasInstances: []`.
- **선행**: 없음
- **병렬**: T00, T02와 착수 가능(타입만 먼저 merge)
- **완료 조건**: `Project`에 배열 필수. `CANVAS_COMPONENT_TYPES`가 14종. enum 없음. `heading`/`text`/`image`/`navigation` 타입 없음. `pnpm exec tsc --noEmit` 그린.

### T02 — 좌표 · URL 가드 · 편집 게이트

- **목적**: 중앙/드롭/클램프/http(s)/`isCanvasEditable`을 순수 함수로 둔다.
- **산출물**: `lib/canvas/geometry.ts`, `lib/canvas/guards.ts`
- **선행**: T01 (타입 import)
- **병렬**: T05
- **완료 조건**: `isCanvasEditable` ≡ `canGenerate(project, "prototype").ok`. `javascript:` URL false. 클램프 후 16px 이상 교차. **단위 테스트는 T14에서 일괄**이어도 함수 시그니처는 이 태스크에서 고정.

### T03 — persist 마이그레이션

- **목적**: 구 프로젝트·손상 데이터를 `[]`로 복구한다.
- **산출물**: `lib/canvas/migrate.ts`, store `version: 1`
- **선행**: T01
- **병렬**: T02
- **완료 조건**: 필드 없는 persist → `[]`. throw 경로 → `[]`. 프로젝트 목록은 유지.

### T04 — 스토어 액션 + 디바운스 persist + 세션 선택

- **목적**: add/move/update/delete/clear/select와 300ms persist.
- **산출물**: `lib/projects/store.ts`, `lib/projects/debounced-storage.ts`
- **선행**: T01, T03
- **병렬**: T05, T06
- **완료 조건**: `emptyProject`에 `[]`. commit/brief/generation이 트리를 지우지 않음. `selectInstance`는 partialize 밖. 이동 액션은 좌표만. 디바운스 storage에 테스트 가능한 `flush()` export.

### T05 — JSX codegen

- **목적**: 실행 없는 생성 문자열. 출력은 `@/components/ui` import + JSX.
- **산출물**: `lib/canvas/codegen.ts`
- **선행**: T01
- **병렬**: T02–T04
- **완료 조건**: 버튼 문자열에 `from "@/components/ui/button"`, `variant=`, 라벨이 있음. hex/`borderRadius` 인라인 없음. 모듈이 `eval`을 참조하지 않음.

### T06 — 인스턴스 렌더러 맵

- **목적**: 카탈로그 전 타입을 실제 shadcn 컴포넌트로 그린다. 텍스트 노드, avatar URL 가드.
- **산출물**: `instance-renderers.tsx` (+ 필요 시 view-model 헬퍼)
- **선행**: T00, T01, T02
- **병렬**: T07 골격과 가능
- **완료 조건**: 14 타입 맵 완결. 각 엔트리가 `@/components/ui`를 import. `dangerouslySetInnerHTML` 없음. 불안전 src는 `AvatarImage`가 아님. 커스텀 div 스킨으로 Button을 대체하지 않음.

### T07 — 3열 셸 + 게이트 + 베이스 pointer-events

- **목적**: 프로토타입 결과 영역에 좌·중·우와 잠금 힌트를 붙인다.
- **산출물**: `canvas-shell.tsx`, `canvas-stage.tsx`, `canvas-lock-hint.tsx`, `prototype-result.tsx` 연결
- **선행**: T04, T06
- **병렬**: 없음(셸이 팔레트/인스펙터 자리)
- **완료 조건**: 편집 활성 시 3열이 동시에 보임. 베이스 클릭이 목업 DOM을 옮기지 않음. 미확정/stale 시 편집 컨트롤 disabled + 한국어 이유. 기존 생성 CTA·스펙 그리드 유지.

### T08 — shadcn 팔레트 + 적용(중앙·선택) + 50 경고

- **목적**: 적용 한 번에 중앙 생성·선택. 좌측은 shadcn 카탈로그.
- **산출물**: `component-palette.tsx`, `palette-item.tsx`
- **선행**: T00, T02, T04, T07
- **병렬**: T09 드래그 시작 속성만 같이 넣어도 됨
- **완료 조건**: 카탈로그 14행이 실제 shadcn 미니 프리뷰를 보여 줌. button 적용 시 중심 `(W/2,H/2)`. 기존 인스턴스 좌표 유지. 새 인스턴스 선택. count≥50 경고, 추가는 성공. heading/image 행 없음.

### T09 — DnD 추가

- **목적**: 팔레트→스테이지 드롭 생성. 밖이면 미생성. 잠금이면 미생성.
- **산출물**: palette `dragstart` + stage `drop`
- **선행**: T08
- **병렬**: T10
- **완료 조건**: 내부 드롭 → 그 점이 중심, 선택됨. 외부 드롭 → 개수 불변. 잠금 중 드롭 → 개수 불변. 새 패키지 없음.

### T10 — 단일 선택 · 해제

- **목적**: 인스펙터가 열리게 한다.
- **산출물**: `canvas-instance.tsx` 클릭, stage 빈 곳 클릭
- **선행**: T07
- **병렬**: T09, T11
- **완료 조건**: A 클릭 시 A만 선택. 빈 곳 클릭 시 선택 없음. 베이스는 히트하지 않음.

### T11 — 인스턴스 드래그 이동 + 클램프

- **목적**: 자유 좌표 재배치.
- **산출물**: `canvas-instance.tsx` pointer 핸들러, pointerup → `moveInstance`
- **선행**: T02, T04, T10
- **병렬**: T12 폼의 x,y 표시와 맞춤
- **완료 조건**: 드래그 종료 좌표가 스토어와 일치. 모서리로 밀면 16px 남음. 드래그 중 localStorage 매 픽셀 기록 없음(디바운스+pointerup). 스냅 없음.

### T12 — 인스펙터 폼 + JSX 패널 + 복사

- **목적**: 스키마 필드만 편집하고 코드를 복사한다.
- **산출물**: `canvas-inspector.tsx`, `inspector-fields.tsx`, `code-panel.tsx`
- **선행**: T05, T10
- **병렬**: T13
- **완료 조건**: 버튼 라벨 변경이 캔버스·스토어에 반영. `variant`/`size` select만(hex 피커 없음). width 하한 클램프. 코드는 readOnly이며 `@/components/ui` import를 포함. 복사 텍스트 = 패널 텍스트. 코드 패널 수정은 시각에 미반영(수정 UI 자체가 없으면 충족). select 최대 5, radio/tabs 최대 4.

### T13 — 삭제 + 캔버스 비우기

- **목적**: 오염 복구. Undo 없음.
- **산출물**: 인스펙터 삭제, Delete/Backspace, `clear-canvas-button.tsx`
- **선행**: T04, T10
- **병렬**: T12
- **완료 조건**: 선택 삭제 즉시, 확인 없음, 인스펙터 빈 상태. 선택 없을 때 Delete no-op. 입력 포커스 중 Delete는 글자 삭제만. 비우기는 활성일 때만, 확인 후 `[]`, 베이스 목업은 남음. stale이면 비우기 disabled.

> 비우기는 대량 파괴이므로 **확인 다이얼로그를 둔다**. 단일 삭제 확인은 오픈 이슈 5에 따라 **두지 않는다**.

### T14 — 단위 테스트

- **목적**: 스토어/가드/좌표/codegen/URL/migrate 회귀.
- **산출물**: `tests/unit/canvas-*.test.ts`, 기존 fixture 갱신 확인
- **선행**: T02–T05, T04 (스토어)
- **병렬**: T07–T13 UI와 병행 가능하나 함수 안정 후 작성
- **완료 조건**: `pnpm test` 그린. 아래 회귀 포인트 포함.

### T15 — E2E 한 시나리오

- **목적**: 적용→중앙→이동→라벨→새로고침 유지.
- **산출물**: `tests/e2e/prototype-canvas.spec.ts`
- **선행**: T08, T11, T12, 기존 happy-path 생성 플로
- **병렬**: T16
- **완료 조건**: mock 제공자에서 4단계 확정+프로토타입 화면 후: 적용, 중앙 근사(허용오차 ≤ 8px), 드래그 후 좌표 변화, 인스펙터 라벨 “가입”, reload 후 동일 라벨·인스턴스 수. 기존 `happy-path.spec.ts` 통과.

### T16 — 한국어 · a11y 마무리

- **목적**: 잠금/빈/경고 문구와 키보드 적용·삭제·폼.
- **산출물**: 카피 점검, `aria-selected`, 팔레트/인스펙터 포커스
- **선행**: T07–T13
- **병렬**: T15
- **완료 조건**: UI 문자열 한국어. 적용·인스펙터·삭제가 키보드로 가능. 캔버스 드래그는 마우스 우선(방향키 이동은 P1).

---

## 13. 구현 순서 (권장)

```
Phase A  기반     T00 ∥ T01 → T02 → T03 → T04
Phase B  순수/뷰  T05 ∥ T06          (A 타입 + T00 이후 병렬)
Phase C  셸       T07 → T08 → T09
Phase D  편집     T10 → T11 → T12 ∥ T13
Phase E  검증     T14 (C와 일부 병렬) → T15 → T16
```

### Phase 끝 검증 / 데모

| Phase | 데모 |
| --- | --- |
| A | 콘솔/테스트에서 add 후 localStorage JSON에 `canvasInstances` 존재. 구 데이터 hydrate 시 `[]`. `components/ui/tabs.tsx` 등 T00 파일 존재 |
| B | codegen이 `@/components/ui/button`을 포함하고 hex 인라인이 없음. 렌더러가 불안전 URL을 버림 |
| C | 브라우저: 좌측 shadcn 프리뷰, 3열, 적용 시 중앙, 캔버스 밖 드롭 무생성 |
| D | 이동·라벨·variant·삭제·비우기. stale이면 잠금 |
| E | `pnpm test` + Playwright 캔버스 시나리오 |

**승인 후 첫 작업**: **T00 shadcn 카탈로그 설치**와 **T01 도메인 타입 · 기본값 · 스키마**를 병렬.

---

## 14. 검증 · 품질

### 14.1 단위 (vitest, 기존 `tests/unit`)

- geometry: 중앙, 드롭 중심, 16px 클램프, scale 역변환 (`rect.width ≠ clientWidth`)
- guards: 4단계 미확정 / stale → 편집 false. 재확정 → true
- URL: `https://example.com/a.png` true, `javascript:alert(1)` false, `data:image/png;base64,...` false
- codegen: `from "@/components/ui/button"` + 라벨 + variant. hex 인라인 없음. `eval` 미사용
- store: add/move/update/delete/clear. commit 후에도 길이 유지. select 비영속
- migrate: missing / invalid → `[]`

### 14.2 컴포넌트

가능하면 렌더러+가드를 순수 함수로 테스트. RTL은 선택. jsdom이 필요하면 `vitest.config.ts`의 canvas 파일만 environment를 나눈다.

### 14.3 E2E (Playwright, `AI_PROVIDER=mock`)

한 시나리오: 기존 해피패스와 같이 4확정 → 프로토타입 화면 → **적용** → 중앙 → **이동** → 인스펙터 **라벨 변경** → **새로고침 후 유지**.

추가 수동/후속(이번 필수 아님): 캔버스 밖 드롭, stale 잠금, 삭제.

### 14.4 구현 완료 후 회귀 포인트 (`post-plan-test-writer`용)

- `canGenerate(prototype)`가 false인데 add/move/update/clear가 UI에서 성공하지 않는다. 스토어 트리는 지워지지 않는다.
- 컨셉 재확정 후 인스턴스 `id, x, y, props.label` 유지.
- 팔레트 재확정 후 같은 인스턴스의 채움색이 **새** hex(스테이지 CSS 변수). 저장된 `variant`는 그대로.
- `PrototypeScreen` 클릭이 선택/이동을 만들지 않는다.
- persist 키 `protomatch:projects`에 `canvasInstances`가 있고, 선택 ID는 없다.
- 드래그 중 `localStorage` set 횟수가 픽셀 수와 비례하지 않는다.
- 코드 패널 문자열을 innerHTML로 넣지 않는다.
- 기존 `tests/e2e/happy-path.spec.ts` (최종 영역 표시·새로고침) 통과.
- 생성 API 스킵 409 동작 불변.
- 한국어 잠금 문구, 로그인 화면 없음.

---

## 15. 리스크 · 완화

| 리스크 | 영향 | 완화 |
| --- | --- | --- |
| 베이스와 오버레이 히트 충돌 | 드래그/선택 실패 | 베이스 `pointer-events-none`, 히트는 인스턴스만 |
| stale 구현이 배열을 초기화 | 작업 유실 | commit/brief가 필드 미터치 + 회귀 테스트 |
| 스케일된 프리뷰에서 중앙 어긋남 | QA 실패 | 논리 좌표 = content box, 역변환 공식 고정 |
| HTML5 DnD MIME 드롭 실패 | 추가 0건 | `text/plain` 폴백. 적용 버튼은 독립 |
| `avatar.src` XSS | 보안 | http(s)만, AvatarFallback, 텍스트 노드 |
| shadcn 내부 클릭이 드래그를 가로챔 | 이동 실패 | 인스턴스 내부 `pointer-events-none` |
| persist 용량 | 저장 실패 | JSON만. data URL 이미지 첨부 금지 |
| 50개+ 성능 | 드래그 버벅 | 드래그 중 로컬 state, pointerup persist. 하드캡 없음 |
| Figma화 범위 팽창 | 일정 | P1을 작업 카드로 넣지 않음 |
| 기존 fixture 컴파일 깨짐 | CI | T01에서 `canvasInstances: []` |

롤백: 캔버스 컴포넌트 import를 `prototype-result`에서 제거하고 persist migrate는 `[]`로 안전. API 마이그레이션 없음.

플래그: P0는 별도 feature flag 없음. 프로토타입 스텝 UI에만 노출.

---

## 16. 기존 Plan과의 관계

| 항목 | 관계 |
| --- | --- |
| `docs/IMPLEMENTATION-PLAN.md` | **유지**. 1차 T01–T10·상용화 섹션 15를 대체하지 않음 |
| 상태머신 | `canGenerate` / `getCommittedArtifact` / `hasStaleArtifacts` **재사용**. 전이 규칙 변경 없음 |
| 생성 API | 변경 없음. 캔버스는 모델 호출 없음 |
| 스토어 키 | `protomatch:projects` 유지. **필드 추가 + persist version 1** |
| 프로토타입 UI | `prototype-result` / `prototype-screen` 위에 레이어. 라이브 목업 폐기 없음 |
| 키트/색 | `lib/ai/preview-theme.ts` 재사용. 캔버스는 **스테이지 CSS 변수**로 shadcn 토큰에 입힘 |
| 좌측 컴포넌트 라이브러리 | **shadcn/ui `@/components/ui`**. PRD 키트 role 9종(heading/text/image/navigation)은 본 Plan이 대체 |
| 인증 | 없음 |

부모 마일스톤 M4(프로토타입 게이트) 위에 **M5 캔버스 P0**를 얹는 것으로 본다. 상용화 때 `canvasInstances`는 같은 모델을 컬럼 JSON으로 옮긴다(지금 구현하지 않음).

---

## 17. P1 — 나중 (작업 분해하지 않음)

PRD 6.8. 착수 시 별도 Plan.

- 다중 선택 및 함께 이동
- Undo/Redo (세션 메모리, 새로고침 시 스택 비움)
- z-index 앞/뒤 UI
- 스냅/가이드 (4px)
- 리사이즈 핸들
- 베이스 목업 숨김 토글
- 임의 hex / 타이포
- `dialog` 등 Portal 컴포넌트, 카탈로그 외 shadcn 추가분

P2: 링크, 이미지 업로드, 복제, 정렬 분배, 전체 캔버스 export, 터치 제스처.

---

## 18. 오픈 이슈 → Plan 영향

PRD §11은 **§3.2에서 전부 기본값으로 닫았다.** 구현을 블로킹하는 미결은 없다.

남은 관찰(블로킹 아님): Safari `dataTransfer` MIME → T09 폴백. 50개 성능 → 하드캡 없이 소프트 경고만.

---

## 19. 다음 액션

구현 기본값은 이미 고정했다. 리뷰에서 뒤집을 때만 선택한다.

1. DnD 최초 위치: **드롭 중심** 유지 / 적용과 같이 항상 중앙
2. 코드 패널: **JSX** 유지 / HTML
3. 베이스 목업: **항상 표시** 유지 / 빈 캔버스
4. 삭제: **즉시** 유지 / 확인 모달
5. 상한: **50 경고·하드캡 없음** 유지 / 하드캡 N
6. persist 실패: **`[]` 복구** 유지 / 프로젝트 로드 에러 UI

**Plan 승인 후 첫 작업: T00 — 없는 shadcn 컴포넌트 설치 (`tabs`, `checkbox`, `switch`, `avatar`, `select`)와 T01 — `types/domain.ts`에 `CanvasInstance`와 `Project.canvasInstances`를 추가하고 `lib/canvas/defaults.ts` / `lib/canvas/shadcn-catalog.ts`를 만든다.**
