import type { DomainKey, InputSnapshot } from "@/types/domain"

export const WIREFRAME_LAYOUT_IDS = [
  "hero",
  "app",
  "gallery",
  "split",
  "pricing",
  "dashboard",
  "onboard",
  "article",
  "checkout",
  "settings",
  "kanban",
  "chat",
  "search",
  "profile",
  "map",
  "video",
  "timeline",
  "wizard",
  "calendar",
  "inbox",
] as const

export type WireframeLayoutId = (typeof WIREFRAME_LAYOUT_IDS)[number]

type ScoreMap = Partial<Record<WireframeLayoutId, number>>

const DOMAIN_AFFINITY: Record<DomainKey, ScoreMap> = {
  healthcare: { calendar: 6, profile: 5, chat: 5, article: 4, wizard: 4, search: 3, onboard: 3 },
  fintech: { dashboard: 6, pricing: 5, checkout: 5, app: 4, settings: 4, inbox: 3, hero: 2 },
  ecommerce: { gallery: 6, checkout: 6, pricing: 5, hero: 5, search: 4, map: 4, split: 2 },
  education: { video: 6, article: 5, onboard: 5, wizard: 4, calendar: 4, timeline: 3, hero: 2 },
  saas_internal: { app: 6, dashboard: 6, kanban: 6, inbox: 5, settings: 5, calendar: 4, chat: 2 },
  other: { hero: 3, split: 3, gallery: 2, article: 2 },
}

const CONCEPT_AFFINITY: Record<string, ScoreMap> = {
  "에디토리얼 잉크": { article: 8, hero: 6, split: 5, wizard: 2 },
  "글래스 스튜디오": { split: 8, hero: 6, wizard: 5, onboard: 4 },
  "네오 브루탈": { hero: 7, gallery: 6, pricing: 5, dashboard: 3 },
  "나이트 커맨드": { dashboard: 9, app: 8, kanban: 7, inbox: 6, settings: 5 },
  "파스텔 캔버스": { onboard: 8, wizard: 7, profile: 6, chat: 5 },
  "아카이브 페이퍼": { article: 8, timeline: 7, search: 6, inbox: 4 },
  "리테일 팝": { gallery: 9, checkout: 8, pricing: 7, hero: 7 },
  "인더스트리얼 라인": { dashboard: 8, app: 7, settings: 6, kanban: 6 },
  "갤러리 프레임": { gallery: 9, profile: 7, video: 6, hero: 5 },
  "키네틱 스트라이프": { video: 8, hero: 7, split: 6, timeline: 5 },
  "오가닉 가든": { wizard: 7, profile: 6, timeline: 6, onboard: 5 },
  "미니멀 모노": { article: 8, hero: 6, split: 5, settings: 4 },
}

const HINT_RULES: Array<{ pattern: RegExp; scores: ScoreMap }> = [
  { pattern: /조밀|그리드|네온|다크|야간/, scores: { dashboard: 4, app: 3, kanban: 3 } },
  { pattern: /히어로|풀블리드|상품 컷|세일/, scores: { hero: 4, gallery: 3, split: 2 } },
  { pattern: /여백|세리프|캡션|무채색|트래킹/, scores: { article: 4, hero: 3, wizard: 2 } },
  { pattern: /파스텔|둥근|손그림|비정형|잎/, scores: { onboard: 3, wizard: 3, profile: 3 } },
  { pattern: /스탬프|크래프트|세피아|기록/, scores: { article: 3, timeline: 3, search: 2 } },
  { pattern: /라인|블루프린트|스펙|고정폭/, scores: { dashboard: 3, app: 3, settings: 2 } },
  { pattern: /유리|블러|프리미엄/, scores: { split: 3, hero: 2, wizard: 2 } },
  { pattern: /원색|보더|오프셋/, scores: { hero: 3, gallery: 2, pricing: 2 } },
  { pattern: /스트라이프|모션|속도/, scores: { video: 3, hero: 3, timeline: 2 } },
]

const KEYWORD_RULES: Array<{ pattern: RegExp; scores: ScoreMap }> = [
  { pattern: /대시보드|운영|분석|지표/, scores: { dashboard: 8, app: 4 } },
  { pattern: /결제|구매|체크아웃|카트|주문/, scores: { checkout: 8, pricing: 4 } },
  { pattern: /가격|요금|구독|플랜/, scores: { pricing: 8, checkout: 3 } },
  { pattern: /검색|조회|필터/, scores: { search: 8, gallery: 3 } },
  { pattern: /예약|일정|캘린더|스케줄/, scores: { calendar: 8, dashboard: 2 } },
  { pattern: /채팅|상담|메시지|메신저/, scores: { chat: 8, inbox: 3 } },
  { pattern: /지도|위치|매장|지점/, scores: { map: 8, search: 3 } },
  { pattern: /강의|영상|비디오|시청/, scores: { video: 8, article: 3 } },
  { pattern: /칸반|작업|보드|파이프라인/, scores: { kanban: 8, dashboard: 3 } },
  { pattern: /설정|계정|환경/, scores: { settings: 8, profile: 3 } },
  { pattern: /온보딩|가입|시작|위자드/, scores: { onboard: 7, wizard: 7 } },
  { pattern: /갤러리|상품|카탈로그|쇼핑/, scores: { gallery: 8, hero: 3 } },
  { pattern: /랜딩|홈|히어로|소개/, scores: { hero: 7, split: 5 } },
  { pattern: /문서|가이드|아티클|헬프/, scores: { article: 8, search: 3 } },
  { pattern: /인박스|메일|티켓|지원/, scores: { inbox: 8, chat: 3 } },
  { pattern: /프로필|마이|계정 페이지/, scores: { profile: 8, settings: 3 } },
  { pattern: /타임라인|활동|피드|알림/, scores: { timeline: 8, inbox: 3 } },
  { pattern: /사내|앱|사이드바|어드민/, scores: { app: 7, dashboard: 4 } },
]

function addScores(target: Record<WireframeLayoutId, number>, extra: ScoreMap): void {
  for (const [layoutId, value] of Object.entries(extra) as Array<[WireframeLayoutId, number]>) {
    if (value == null) continue
    target[layoutId] += value
  }
}

function conceptStem(title: string | undefined): string | undefined {
  if (!title) return undefined
  return Object.keys(CONCEPT_AFFINITY).find((stem) => title.includes(stem))
}

function hashTieBreak(value: string): number {
  let hash = 2166136261
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index)
    hash = Math.imul(hash, 16777619)
  }
  return ((hash >>> 0) % 50) / 100
}

export function scoreWireframeLayout(input: {
  layoutId: WireframeLayoutId
  snapshot: InputSnapshot
}): number {
  const totals = Object.fromEntries(WIREFRAME_LAYOUT_IDS.map((id) => [id, 0])) as Record<
    WireframeLayoutId,
    number
  >
  addScores(totals, DOMAIN_AFFINITY[input.snapshot.domainKey] ?? {})

  const stem = conceptStem(input.snapshot.committedConcept?.title)
  if (stem) addScores(totals, CONCEPT_AFFINITY[stem] ?? {})

  const conceptText = [
    input.snapshot.committedConcept?.title,
    input.snapshot.committedConcept?.summary,
    ...(input.snapshot.committedConcept?.visualHints ?? []),
  ]
    .filter(Boolean)
    .join(" ")
  for (const rule of HINT_RULES) {
    if (rule.pattern.test(conceptText)) addScores(totals, rule.scores)
  }

  const keywordText = `${input.snapshot.keywords.join(" ")} ${conceptText}`
  for (const rule of KEYWORD_RULES) {
    if (rule.pattern.test(keywordText)) addScores(totals, rule.scores)
  }

  return totals[input.layoutId] + hashTieBreak(`${input.snapshot.entropy ?? ""}:${input.layoutId}`)
}

export function rankWireframesByConceptFit<T>(
  items: T[],
  snapshot: InputSnapshot,
  getLayoutId: (item: T) => WireframeLayoutId
): T[] {
  return items
    .map((item, index) => ({
      item,
      index,
      score: scoreWireframeLayout({ layoutId: getLayoutId(item), snapshot }),
    }))
    .sort((left, right) => {
      if (right.score !== left.score) return right.score - left.score
      return left.index - right.index
    })
    .map((entry) => entry.item)
}
