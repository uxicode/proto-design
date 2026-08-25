# ProtoMatch 구현 Plan

- **문서 버전**: 0.2
- **기준 PRD**: `docs/PRD.md` v0.2 (Draft)
- **대상 스택 (1차)**: Next.js 14 App Router, TypeScript, TailwindCSS, Shadcn UI, Radix, RSC 우선
- **제품명(가칭)**: ProtoMatch
- **워크스페이스**: `/Users/jeonbongcheol/Desktop/proj/proto-design` (그린필드)
- **개정**: 2026-08-24 — 인증·Supabase·DB 스키마·크레딧 원장을 **상용화(다음 개발)** 로 이관. 1차는 워크플로 + 생성 파이프라인만.

---

## 0. 단계 분리 (필수)

| 단계 | 이름 | 범위 |
| --- | --- | --- |
| **지금** | 1차 구현 (프로토타입) | 단계별 컨셉 매칭 UI, 상태머신, AI 생성. 로그인 없음. DB 없음 |
| **다음 개발** | 상용화 | Supabase Auth, 스키마, RLS, 크레딧 원장, 서버 영속, 소유권 격리 |

1차에서 넣지 않는 것: `/login`, Auth 콜백, `supabase/` 마이그레이션, RLS, RPC, `credit_ledger`, 계정 페이지, 미들웨어 보호 경로, 타인 프로젝트 404.

도메인 타입(Concept, Palette 등)은 **TypeScript 인터페이스**로만 둔다. SQL로 내리지 않는다. 상용화 때 같은 모델을 테이블로 옮긴다.

---

## 1. 목표 / 범위 (In / Out)

### 1.1 한 줄 요약

로그인 없이 분야+키워드로 프로젝트를 만들고, 컨셉→팔레트→와이어프레임→컴포넌트를 한 단계씩 생성·확정한 뒤에만 최종 프로토타입 이미지 1장을 볼 수 있게 한다.

### 1.2 이번 Plan에 포함 (In) — 1차만

- 랜딩 + 짧은 온보딩(선택, 로컬 플래그)
- 프로젝트 생성(이름 1~80자) · 목록 · 워크벤치 — **브라우저 저장소**
- 분야(프리셋+기타) + 키워드 (1~15개, 각 2~30자)
- 단계별 추천 3안, 직전 단계 committed 필수, 중간 스킵 금지
- 단계당 확정 1개, 재확정 시 이후 단계 stale
- 최종 프로토타입 이미지 1장 (4단계 committed, stale 없음)
- 로딩 / 실패 / 재시도 UI
- 한국어 UI, 상업적 사용 가능 고지
- AI 어댑터 인터페이스 + mock + OpenAI 호환 1벤더
- 생성 API (컨텍스트는 클라이언트가 보낸 확정 스냅샷). 모델 키는 서버 env만

### 1.3 제외 (Out) — 상용화 또는 이후

| 항목 | 시기 |
| --- | --- |
| 인증, Supabase, DB 스키마, RLS, Storage 버킷 | 상용화 |
| 크레딧 선차감·환급·원장·일일 상한·잔액 UI | 상용화 |
| 서버 영속, 재로그인 재조회, 소유권 격리 | 상용화 |
| P1 variant / PNG·JSON / 공유 / 댓글 / 결제 | v1.1 |
| P2 DS 업로드, 브랜드 학습, 실시간 협업 | v2 |
| 중간 단계 스킵 후 최종 이미지 | 금지 (1차 API도 거절) |

### 1.4 요구사항 → 작업 매핑

| 요구사항 | 작업 ID | 1차 충족 방식 |
| --- | --- | --- |
| 온보딩·프로젝트 생성 | T01, T04, T07 | localStorage 프로젝트, 이름 검증 |
| 분야·키워드 | T04, T05, T08 | 저장 후 컨셉 생성 입력에 포함 |
| 단계 추천 | T03, T05, T06, T08 | 상태머신 + 생성 API, 후보 3개 |
| Commit | T05, T08 | 클라이언트 스토어 committed 1개, 이후 stale |
| 최종 이미지 | T06, T08 | 4단계 가드 후 이미지 1장 |
| 새로고침 유지 | T04 | localStorage. 계정 연동 없음 |
| 로딩/실패 | T06, T08 | queued/running/failed UI, 재시도 |
| 스킵 금지 | T05, T06 | 상태머신 + API 가드 |
| 인증·스키마·원장 | — | 상용화 Plan (섹션 15) |

### 1.5 가정 (1차 고정)

1. **인증 없음**. 누구나 워크벤치를 연다.
2. **분야**: 프리셋(헬스케어, 핀테크, 이커머스, 교육, 사내툴) + 기타(2~40자).
3. **분야/키워드 변경**: 경고 후 이후 단계만 stale. 이전 확정 카드는 표시 유지, 최종 생성 잠금.
4. **크레딧**: 1차 UI에 잔액·차감을 넣지 않는다. 생성은 제한 없이 호출. N 상수는 `lib/config/credits.ts`에만 두어 상용화 때 재사용.
5. **최종 이미지**: 프로젝트당 대표 1장. 재생성 시 최신으로 교체, 이전 몇 장은 메모리/로컬에 둘 수 있으나 20장 정책은 상용화.
6. **영속**: `localStorage` 키 `protomatch:projects`. 서버 재시작과 무관하게 같은 브라우저에서 이어간다. 시크릿 모드·다른 기기는 비움.
7. **생성 컨텍스트**: 1차는 클라이언트가 committed 스냅샷을 API에 보낸다. 상용화는 서버가 DB에서 조립한다.
8. **이미지**: 생성 결과는 data URL 또는 `/tmp` 성격의 메모리 캐시 URL. Supabase Storage 없음.
9. **AI 벤더**: 텍스트는 OpenAI 호환 Chat, 시각은 이미지 API. 인터페이스 + mock 먼저.
10. **팀/결제/공유**: 없음.

---

## 2. 아키텍처 개요 (1차)

```
[브라우저]
  RSC: 랜딩
  Client: 워크벤치, 스텝퍼, 후보 카드, 생성 CTA
  Zustand(+localStorage persist): Project, 단계 확정, 후보
       │ POST JSON (committed snapshot)
       ▼
[Next.js 14 App Router]
  POST /api/generations     → 가드 + job 수락 202
  GET  /api/generations/:id → 폴링
       │
       ├─ lib/generation/state-machine
       ├─ lib/generation/schemas (zod)
       ├─ lib/ai/adapters (mock | openai)
       └─ in-memory job Map + fire-and-forget processJob
```

모델 API 키는 브라우저에 두지 않는다.

### 2.1 생성 실행 패턴

**선택: 프로세스 메모리 job Map + 202 + 2초 폴링.**

1. 클라이언트가 `{ projectId, step, idempotencyKey, inputSnapshot }` POST.
2. 서버는 상태머신으로 스냅샷을 검사한다(선행 committed, stale 없음). 통과 시 `queued` job을 메모리에 넣고 202.
3. `void processGenerationJob(id)` 로 어댑터 호출. 성공/실패를 job에 기록.
4. 클라이언트 폴링. `succeeded` 시 후보/이미지를 스토어에 반영하고 localStorage에 저장.

동기 90초 대기는 하지 않는다(최종 이미지 한도). 서버리스 다중 인스턴스에서는 메모리 job이 유실될 수 있다. **1차는 로컬 `pnpm dev` 단일 프로세스 가정.** 상용화에서 DB job으로 교체한다.

### 2.2 동기화 경계

| 경로 | 렌더 | 데이터 |
| --- | --- | --- |
| 랜딩 | RSC | 없음 |
| 프로젝트 목록·워크벤치 | Client | localStorage |
| 생성 | Client → Route Handler | 스냅샷 JSON in, 후보/이미지 out |

---

## 3. 디렉터리 구조 (1차)

```
proto-design/
  app/
    layout.tsx
    page.tsx                            # 랜딩. CTA → /projects
    onboarding/page.tsx                 # 선택, 로컬 플래그
    projects/page.tsx
    projects/new/page.tsx
    projects/[id]/page.tsx              # 워크벤치
    api/generations/route.ts
    api/generations/[id]/route.ts
    globals.css
  components/
    ui/
    layout/
      site-header.tsx
      site-footer.tsx
    onboarding/
      onboarding-wizard.tsx
    projects/
      project-list.tsx
      project-create-form.tsx
      project-thumbnail.tsx
    workbench/
      workbench-stepper.tsx
      brief-form.tsx
      candidate-grid.tsx
      candidate-card.tsx
      commit-bar.tsx
      generation-status.tsx
      prototype-result.tsx
      stale-banner.tsx
      step-locked-hint.tsx
  lib/
    config/
      credits.ts                        # 상수만. 1차 미적용
      domains.ts
      timeouts.ts
    projects/
      store.ts                          # zustand persist
      types.ts
    generation/
      process-job.ts
      job-store.ts                      # in-memory Map
      state-machine.ts
      context-builder.ts
      schemas.ts
    ai/
      types.ts
      index.ts
      adapters/
        text-structured.ts
        image-generation.ts
        mock-text-adapter.ts
        mock-image-adapter.ts
        gemini-text-adapter.ts
        gemini-image-adapter.ts
      safety.ts
    logging.ts
    errors.ts
  types/
    domain.ts
    export-tokens.ts                    # 상용화/P1 훅
  tests/
    unit/
      state-machine.test.ts
      context-builder.test.ts
      schemas.test.ts
    e2e/
      happy-path.spec.ts
  .env.example
  package.json
  docs/
    PRD.md
    IMPLEMENTATION-PLAN.md
```

넣지 않음: `lib/supabase/`, `supabase/migrations/`, `app/login/`, `app/auth/`, `app/account/`, `middleware.ts` 인증 가드.

컴포넌트는 kebab-case. `'use client'`는 스토어·폼·폴링·다이얼로그에만.

---

## 4. 도메인 모델 (TypeScript만)

상용화 때 이 필드를 테이블로 옮긴다. 1차는 `types/domain.ts`.

```typescript
type ProjectStep =
  | 'input' | 'concept' | 'palette' | 'wireframe' | 'components' | 'prototype'

type ArtifactStatus = 'candidate' | 'committed' | 'superseded' | 'stale'

interface Project {
  id: string
  name: string
  domainKey: 'healthcare' | 'fintech' | 'ecommerce' | 'education' | 'saas_internal' | 'other' | null
  domainCustom: string | null
  keywords: string[]
  briefVersion: number
  currentStep: ProjectStep
  concepts: Concept[]
  palettes: Palette[]
  wireframes: Wireframe[]
  componentSets: ComponentSet[]
  prototype: PrototypeAsset | null
  updatedAt: string
}

interface Concept {
  id: string
  generationId: string
  title: string
  summary: string
  visualHints: string[]
  visualPreviewUrl?: string
  status: ArtifactStatus
  committedAt?: string
}
```

Palette / Wireframe / ComponentSet / PrototypeAsset는 PRD 섹션 9와 동일 필드. `ownerUserId`, `creditBalance`, ledger, `deleted_at`은 1차에 없음.

불변조건(스토어 + 상태머신으로 강제):

- 단계당 `status === 'committed'` 최대 1개
- 최종 생성은 네 단계 committed이고 stale 없음
- 프로토타입 snapshot ID는 생성 당시 committed ID와 일치

---

## 5. 인증 / 세션

**1차: 없음.** 보호 라우트 없음. 사용자 ID 없음.

상용화: Supabase Auth (매직링크 + Google), `@supabase/ssr` 쿠키, `/login`, `/auth/callback`. 세부는 섹션 15.

---

## 6. 크레딧

**1차: 과금하지 않음.** `lib/config/credits.ts`에 PRD 7.0 N 값만 상수로 둔다. UI·API에서 잔액 검사 없음.

상용화: 선차감 RPC, 실패 환급, 가입 20, 일일 20. 세부는 섹션 15.

---

## 7. 생성 파이프라인 (1차 핵심)

### 7.1 상태머신 (스킵 금지)

순서: `input → concept → palette → wireframe → components → prototype`.

| 요청 스텝 | 필요 조건 |
| --- | --- |
| concept | `domainKey` + keywords ≥ 1 |
| palette | concept committed, not stale |
| wireframe | palette committed, not stale |
| components | wireframe committed, not stale |
| prototype | 네 단계 committed, stale 없음 |

확정된 단계의 **새 후보를 commit**하는 순간: 기존 committed → `superseded`, 이후 단계 → `stale`.

브리프 변경: 컨셉~컴포넌트 stale, `briefVersion += 1`, 최종 잠금.

순수 함수 `canGenerate(project, step)`, `commitArtifact(project, step, id)`, `applyBriefChange(project, brief)` — 단위 테스트 대상.

### 7.2 입력 스냅샷 (클라이언트가 POST, 서버가 재검증)

공통: `projectId`, `briefVersion`, `domainKey`, `domainLabel`, `keywords`.

- concept: 공통만
- palette: + committedConcept
- wireframe: + committedPalette swatches
- components: + committedWireframe blocks
- prototype: + committedComponentSet + “한 장의 UI, 확정과 모순되는 새 컨셉/색 금지”

서버는 스냅샷 형태와 단계 가드만 검사한다. 상용화는 DB committed가 진실원.

### 7.3 출력 JSON (파싱 실패 = 생성 실패)

후보 **정확히 3**. 부족하면 실패. 스키마는 기존 Plan과 동일:

- concept: title, summary, visualHints, moodPrompt → 이미지 썸네일 3
- palette: name + swatches 5역할 hex (`primary|secondary|background|text|accent`)
- wireframe: title, structureNotes, blocks, layoutPrompt → 구조 프리뷰
- components: items에 button, input, card, navigation 각 ≥ 1 → 프리뷰
- prototype: 이미지 1장 + snapshot IDs

### 7.4 컨텍스트 누적

| 단계 | 포함 | 제외 |
| --- | --- | --- |
| 컨셉 | 분야, 키워드 | 팔레트, 레이아웃, 최종 픽셀 |
| 팔레트 | + 확정 컨셉 | 와이어, 컴포넌트 |
| 와이어 | + 확정 팔레트 | 포토리얼 브랜드 아트 |
| 컴포넌트 | + 확정 와이어 슬롯 | 무관 템플릿 |
| 최종 | 전부 + 한 장 UI | 확정과 모순되는 새 컨셉/색 |

`prompt_version`: `pm-proto-v1`. 프롬프트 전문은 UI에 미노출.

### 7.5 타임아웃

| 단계 | 한도 |
| --- | --- |
| concept / palette / wireframe / components | 45s |
| prototype | 90s |

`AbortSignal`. 초과 시 `GENERATION_TIMEOUT`. 부분 후보 persist 없음.

### 7.6 어댑터

```typescript
interface TextStructuredAdapter {
  generateConceptSet(input: ConceptInput): Promise<ConceptTextOutput>
  generatePaletteSet(input: PaletteInput): Promise<PaletteTextOutput>
  generateWireframeSet(input: WireframeInput): Promise<WireframeTextOutput>
  generateComponentSet(input: ComponentInput): Promise<ComponentTextOutput>
}

interface ImageGenerationAdapter {
  generateConceptMood(prompt: string, signal: AbortSignal): Promise<ImageBlob>
  generateWireframePreview(prompt: string, signal: AbortSignal): Promise<ImageBlob>
  generateComponentPreview(prompt: string, signal: AbortSignal): Promise<ImageBlob>
  generatePrototype(prompt: string, signal: AbortSignal): Promise<ImageBlob>
}
```

`AI_PROVIDER=mock|gemini`. 테스트·E2E는 mock.

---

## 8. API 계약 (1차)

에러: `{ code, message }` 한국어 메시지, 스택 없음.

| code | HTTP | 의미 |
| --- | --- | --- |
| `VALIDATION_ERROR` | 400 | 이름/키워드/분야/스냅샷 |
| `STEP_LOCKED` | 409 | 선행 미확정 |
| `STEP_STALE` | 409 | 최종 시 stale |
| `GENERATION_IN_FLIGHT` | 409 | 동일 스텝 진행 중 (메모리) |
| `SAFETY_BLOCKED` | 400 | 입력/출력 가드 |
| `GENERATION_FAILED` | job failed | 모델/스키마 |
| `GENERATION_TIMEOUT` | job failed | 한도 초과 |

1차에 없음: `UNAUTHENTICATED`, `INSUFFICIENT_CREDITS`, `DAILY_CAP_EXCEEDED`.

**`POST /api/generations`**  
Body: `{ projectId, step, idempotencyKey, inputSnapshot }`.  
202 `{ generationId, status }`.

**`GET /api/generations/:id`**  
200 `{ id, status, step, errorCode, errorMessageUser, artifacts? }`.

프로젝트 CRUD는 Server Action이 아니라 **클라이언트 스토어** (`createProject`, `updateBrief`, `commitArtifact`).

---

## 9. UI 화면 (1차)

공통: 한국어. 스텝 상태(완료/현재/잠금/stale)는 색+아이콘+텍스트. 데스크톱 우선, 후보 md+ 3열. 키보드로 확정 가능. 크레딧 숫자 CTA 없음.

### 9.1 `/`

단계형 가치, 이미지는 마지막. CTA “시작하기” → `/projects` (로그인 아님). 고지 푸터.

### 9.2 `/onboarding`

3컷: 단계 워크플로 / 이미지는 마지막 / 로컬 저장 안내. 완료·건너뛰기 → `/projects`. `localStorage` 플래그.

### 9.3 `/projects`

로컬 목록: 이름, 단계 배지, 썸네일. 빈 상태 CTA. 삭제(스토어에서 제거).

### 9.4 `/projects/new`

이름 1~80. 성공 시 워크벤치.

### 9.5 `/projects/[id]`

스텝퍼: 입력 | 컨셉 | 팔레트 | 와이어 | 컴포넌트 | 프로토타입.  
생성 중 스피너. 실패 시 재시도. stale 배너. 잠긴 최종 버튼.

**입력**: 프리셋+기타, 키워드 칩. 변경 시 경고.

**후보**: 제목, 설명, 프리뷰, 확정.

**프로토타입**: 4단계 가드 목록, 결과 이미지 + 컨텍스트 요약.

### 9.6 넣지 않음

`/login`, `/account`, 원장, 잔액 부족 패널, 유료 충전 CTA.

---

## 10. 작업 분해 (1차 구현 순서)

상용화 작업(T-GA-*)은 이번 스프린트에 넣지 않는다.

### T01 — 프로젝트 스캐폴딩

- **의존성**: 없음
- **산출**: Next 14, Tailwind, Shadcn, ESLint, `.env.example`, 한국어 `layout`
- **완료**: `pnpm dev` `/` 200, `pnpm lint`, Vue 의존성 없음, `@supabase/*` 없음

### T02 — 도메인 타입 + 상태머신

- **의존성**: T01
- **산출**: `types/domain.ts`, `lib/generation/state-machine.ts`, `tests/unit/state-machine.test.ts`
- **완료**: 스킵 불가, commit 1개, 재commit stale, brief 변경 stale. SQL 없음

### T03 — AI 어댑터 인터페이스 + mock

- **의존성**: T01
- **산출**: `lib/ai/*`, `lib/generation/schemas.ts`, `tests/unit/schemas.test.ts`
- **완료**: mock 3후보 + 픽스처 이미지. OpenAI 호출 없음

### T04 — 로컬 프로젝트 스토어

- **의존성**: T02
- **산출**: `lib/projects/store.ts`, 목록/생성 페이지 셸
- **완료**: 이름 81자 거부, 새로고침 후 목록 유지, 삭제 후 제외

### T05 — 브리프·commit을 스토어에 연결

- **의존성**: T04
- **산출**: brief/commit 액션, `tests/unit/context-builder.test.ts` 초안
- **완료**: 키워드 0이면 컨셉 생성 불가. brief 변경 시 이후 stale

### T06 — Generation API + in-memory job

- **의존성**: T03, T05
- **산출**: `app/api/generations/**`, `lib/generation/job-store.ts`, `process-job.ts`
- **완료**: mock queued→succeeded. 스킵 409. 타임아웃 실패. 동일 스텝 in-flight 409

### T07 — 랜딩·온보딩 UI

- **의존성**: T01
- **산출**: `app/page.tsx`, 온보딩, 푸터 고지
- **완료**: “시작하기”가 `/projects`로. 로그인 화면 없음

### T08 — 워크벤치 UI

- **의존성**: T06, T07
- **산출**: `components/workbench/*`
- **완료**: mock 1사이클. 잠긴 최종. 새로고침 후 후보 유지. stale 시 최종 비활성

### T09 — OpenAI 호환 어댑터

- **의존성**: T03, T06
- **산출**: `openai-*-adapter.ts`, `safety.ts`
- **완료**: `AI_PROVIDER=openai` 로컬 1사이클. 키는 서버 env만

### T10 — 로깅·env·E2E

- **의존성**: T08, T09
- **산출**: `lib/logging.ts`, `tests/e2e/happy-path.spec.ts`
- **완료**: mock으로 프로젝트→4확정→이미지→새로고침 재조회. 스킵 불가. 인증 E2E 없음

---

## 11. 테스트 전략 (1차)

### 11.1 단위

- 상태머신: 스킵, commit, stale, brief 변경
- zod: 3개 미만, hex 오류, 필수 컴포넌트 누락
- 컨텍스트 빌더: 미확정 필드 미주입

### 11.2 통합

1차에서 RLS/RPC 테스트 없음.

### 11.3 E2E (Playwright, `AI_PROVIDER=mock`)

온보딩 → 프로젝트 → 분야/키워드 → 4단계 생성·확정 → 최종 이미지 → 새로고침 후 동일 결과.

추가: 컨셉만 확정 시 최종 버튼 잠금.

### 11.4 회귀

- API로 최종 직행 → 409, 스토어 불변
- 생성 중 같은 스텝 재클릭 → job 1개
- 브리프 변경 후 stale + 최종 잠금
- 조회(폴링, 목록)가 생성을 다시 호출하지 않음

넣지 않음: 타인 404, 원장 합계, 일일 21번째, 재로그인.

---

## 12. 관측 / 환경 변수 (1차)

로그: `generation.accepted` / `started` / `succeeded` / `failed` / `safety.blocked` / `timeout`.  
`userId` 없음. 프롬프트 원문·이미지 바이너리 미로그.

```
AI_PROVIDER=mock
GEMINI_API_KEY=
GEMINI_BASE_URL=
GEMINI_TEXT_MODEL=gemini-2.5-flash
GEMINI_IMAGE_MODEL=gemini-2.5-flash-image
```

Supabase·INTERNAL_JOB_SECRET·CREDIT_* 적용 env는 상용화.

---

## 13. 리스크와 스파이크 (1차)

| 리스크 | 영향 | 완화 |
| --- | --- | --- |
| 모델이 확정 컨텍스트를 무시 | 핵심 가치 붕괴 | 스냅샷 강제, 단계별 프롬프트 |
| 이미지 45s/90s 초과 | 실패 UI | mock으로 플로 완성 후 T09 스파이크 |
| 클라이언트가 스냅샷을 조작 | 프로토타입 한도 | 상용화에서 서버 조립 |
| 메모리 job + 서버 리로드 | 생성 중 유실 | 로컬 단일 프로세스, 재시도 CTA |
| localStorage 용량 | 이미지 data URL | 최신 프리뷰만 유지, 상용화 Storage |
| 인증 없이 API 공개 | 키 남용 | 로컬/비공개 배포만. 상용화 전 공개 금지 |

스파이크: 이미지 p95, data URL vs 디스크 캐시. OpenAI 키 없어도 T01–T08, T10(mock) 가능.

---

## 14. 마일스톤

| 마일스톤 | 작업 | 검증 |
| --- | --- | --- |
| **M0 스캐폴드** | T01 | App Router, Shadcn, 한국어 레이아웃. Supabase 없음 |
| **M1 상태·mock AI** | T02, T03 | 상태머신 테스트 그린, mock 스키마 |
| **M2 로컬 파이프라인** | T04–T06 | API 1사이클, 스킵 409 |
| **M3 워크벤치** | T07, T08 | 브라우저 mock 1사이클, 새로고침 유지 |
| **M4 프로토타입 게이트** | T09, T10 | PRD 3.1 목표 1~3. 실제 벤더 샘플 가능 |

M4 = 내부 데모 가능. 가입·결제·원장 없음.

**승인 후 첫 작업**: **T01 프로젝트 스캐폴딩.**

---

## 15. 상용화 (다음 개발) — 지금 구현하지 않음

다음 개발에서 이어서 할 일. 1차 인터페이스(`types/domain.ts`, 상태머신, 어댑터)를 재사용한다.

1. Supabase 프로젝트, `supabase/migrations` (profiles, credit_ledger, projects, generations, artifacts, RLS, RPC)
2. Auth: 매직링크 + Google, `/login`, 미들웨어
3. 프로젝트·생성 job을 Postgres로 이전. 클라이언트 스냅샷 대신 서버가 committed 조립
4. Storage 버킷(previews/prototypes), signed URL
5. 크레딧 선차감·실패 환급·가입 20·일일 20·헤더 잔액
6. 계정 원장, 활동 로그, 소프트 삭제, 프로토타입 20장
7. 소유권 404, E2E 재로그인 재조회

상세 SQL·RPC·RLS는 상용화 착수 시 이 섹션을 확장한다. 1차 코드에 `@supabase` 의존성을 넣지 않는다.

---

## 16. P1 확장 훅 (구현하지 않음)

variant, PNG/JSON 내보내기, 공유 링크, 댓글, 결제는 상용화 스키마 위에 올린다. Realtime은 `generations` 행 구독으로 폴링을 교체한다. `types/export-tokens.ts`만 1차에 파일로 남겨 팔레트 JSON 형태를 고정한다.
