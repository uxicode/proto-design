import type {
  ComponentTextOutput,
  ConceptTextOutput,
  PaletteTextOutput,
  TextStructuredAdapter,
  WireframeTextOutput,
} from "@/lib/ai/types"
import type { InputSnapshot, Swatch } from "@/types/domain"
import type { WireframeLayoutId } from "@/lib/generation/wireframe-rank"
import { rankWireframesByConceptFit } from "@/lib/generation/wireframe-rank"

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

interface ConceptTemplate {
  title: string
  summary: (domain: string, keyword: string) => string
  visualHints: string[]
  moodPrompt: (domain: string) => string
}

interface PaletteTemplate {
  name: string
  swatches: Swatch[]
}

const CONCEPT_BANK: ConceptTemplate[] = [
  {
    title: "에디토리얼 잉크",
    summary: (domain, keyword) =>
      `${domain}을 잡지처럼 큰 타이포와 여백으로 보여 줍니다. ${keyword}를 헤드라인 소재로 둡니다.`,
    visualHints: ["큰 세리프", "넓은 여백", "흑백 대비"],
    moodPrompt: (domain) =>
      `editorial magazine ${domain} moodboard, oversized serif type, generous whitespace, ink contrast`,
  },
  {
    title: "글래스 스튜디오",
    summary: (domain, keyword) =>
      `반투명 레이어와 부드러운 블러로 ${domain}의 프리미엄 톤을 잡습니다. ${keyword}는 하이라이트입니다.`,
    visualHints: ["유리 패널", "소프트 블러", "얇은 보더"],
    moodPrompt: (domain) =>
      `glassmorphism ${domain} product mood, frosted panels, soft blur, premium highlights`,
  },
  {
    title: "네오 브루탈",
    summary: (domain, keyword) =>
      `굵은 외곽선과 원색 블록으로 ${domain}을 직설적으로 전달합니다. ${keyword}를 배너처럼 크게 둡니다.`,
    visualHints: ["두꺼운 보더", "원색 블록", "오프셋 섀도"],
    moodPrompt: (domain) =>
      `neo brutalist ${domain} UI moodboard, thick black borders, primary color blocks, offset shadow`,
  },
  {
    title: "나이트 커맨드",
    summary: (domain, keyword) =>
      `어두운 캔버스와 네온 액센트로 ${domain} 전문가 화면을 만듭니다. ${keyword}는 야간 작업에 맞춰집니다.`,
    visualHints: ["다크 배경", "네온 액센트", "조밀한 그리드"],
    moodPrompt: (domain) =>
      `dark mode ${domain} command center mood, neon accent, dense grid, night operations`,
  },
  {
    title: "파스텔 캔버스",
    summary: (domain, keyword) =>
      `낮은 채도와 둥근 면으로 ${domain}을 편안하게 엽니다. ${keyword}는 부드러운 일러스트 톤입니다.`,
    visualHints: ["파스텔 면", "둥근 코너", "손그림 텍스처"],
    moodPrompt: (domain) =>
      `pastel canvas ${domain} moodboard, low saturation, rounded shapes, hand-drawn texture`,
  },
  {
    title: "아카이브 페이퍼",
    summary: (domain, keyword) =>
      `종이 질감과 스탬프형 라벨로 ${domain}에 기록 감성을 입힙니다. ${keyword}는 분류 태그가 됩니다.`,
    visualHints: ["크래프트 텍스처", "스탬프 라벨", "세피아"],
    moodPrompt: (domain) =>
      `archival paper ${domain} moodboard, kraft texture, stamp labels, sepia catalog`,
  },
  {
    title: "리테일 팝",
    summary: (domain, keyword) =>
      `큰 상품 컷과 배지로 ${domain}을 매장처럼 구성합니다. ${keyword}는 프로모션 훅입니다.`,
    visualHints: ["히어로 컷", "세일 배지", "그리드 상품"],
    moodPrompt: (domain) =>
      `retail pop ${domain} moodboard, hero product cutouts, promo badges, catalog grid`,
  },
  {
    title: "인더스트리얼 라인",
    summary: (domain, keyword) =>
      `모노라인과 기술 도면 느낌으로 ${domain}을 정밀하게 보여 줍니다. ${keyword}는 스펙 라벨입니다.`,
    visualHints: ["1px 라인", "블루프린트", "고정폭 숫자"],
    moodPrompt: (domain) =>
      `industrial blueprint ${domain} mood, monoline diagrams, technical labels, precise grid`,
  },
  {
    title: "갤러리 프레임",
    summary: (domain, keyword) =>
      `큰 이미지 프레임과 짧은 캡션으로 ${domain}을 전시합니다. ${keyword}는 작품 제목처럼 쓰입니다.`,
    visualHints: ["풀블리드 이미지", "짧은 캡션", "미니멀 내비"],
    moodPrompt: (domain) =>
      `gallery framed ${domain} moodboard, full-bleed imagery, short captions, museum nav`,
  },
  {
    title: "키네틱 스트라이프",
    summary: (domain, keyword) =>
      `사선 스트라이프와 모션 잔상으로 ${domain}에 속도를 줍니다. ${keyword}는 움직임 힌트입니다.`,
    visualHints: ["사선 스트라이프", "모션 블러", "하이 컨트라스트"],
    moodPrompt: (domain) =>
      `kinetic stripe ${domain} moodboard, diagonal bands, motion blur, high contrast energy`,
  },
  {
    title: "오가닉 가든",
    summary: (domain, keyword) =>
      `비정형 쉐이프와 식물 텍스처로 ${domain}을 자연스럽게 엽니다. ${keyword}는 성장 메타포입니다.`,
    visualHints: ["비정형 쉐이프", "잎맥 텍스처", "어스 톤"],
    moodPrompt: (domain) =>
      `organic garden ${domain} mood, irregular blobs, leaf texture, earth tones`,
  },
  {
    title: "미니멀 모노",
    summary: (domain, keyword) =>
      `색을 거의 빼고 자간과 그리드만으로 ${domain}을 정리합니다. ${keyword}는 유일한 강조어입니다.`,
    visualHints: ["무채색", "넓은 트래킹", "얇은 구분선"],
    moodPrompt: (domain) =>
      `minimal monochrome ${domain} moodboard, tracking type, thin rules, almost no color`,
  },
]

const PALETTE_BANK: PaletteTemplate[] = [
  {
    name: "잉크 오커",
    swatches: [
      { role: "primary", hex: "#1F3A5F" },
      { role: "secondary", hex: "#5B7C99" },
      { role: "background", hex: "#F4F1EA" },
      { role: "text", hex: "#1A1A1A" },
      { role: "accent", hex: "#C45C26" },
    ],
  },
  {
    name: "세이지 골드",
    swatches: [
      { role: "primary", hex: "#2F5D50" },
      { role: "secondary", hex: "#7A9E8F" },
      { role: "background", hex: "#F7F6F2" },
      { role: "text", hex: "#1C241F" },
      { role: "accent", hex: "#D4A017" },
    ],
  },
  {
    name: "슬레이트 블루",
    swatches: [
      { role: "primary", hex: "#2B2F36" },
      { role: "secondary", hex: "#6B7280" },
      { role: "background", hex: "#EEF1F4" },
      { role: "text", hex: "#111827" },
      { role: "accent", hex: "#2563EB" },
    ],
  },
  {
    name: "와인 크림",
    swatches: [
      { role: "primary", hex: "#6B2D3C" },
      { role: "secondary", hex: "#A56B76" },
      { role: "background", hex: "#F8F1EC" },
      { role: "text", hex: "#2A181C" },
      { role: "accent", hex: "#E8B86D" },
    ],
  },
  {
    name: "미드나잇 라임",
    swatches: [
      { role: "primary", hex: "#121826" },
      { role: "secondary", hex: "#3A4660" },
      { role: "background", hex: "#0B0F18" },
      { role: "text", hex: "#E8EDF7" },
      { role: "accent", hex: "#B8F272" },
    ],
  },
  {
    name: "코랄 스카이",
    swatches: [
      { role: "primary", hex: "#E36B5B" },
      { role: "secondary", hex: "#7FB3D5" },
      { role: "background", hex: "#FFF8F4" },
      { role: "text", hex: "#2C1A16" },
      { role: "accent", hex: "#2A6F97" },
    ],
  },
  {
    name: "모스 클레이",
    swatches: [
      { role: "primary", hex: "#4A5D23" },
      { role: "secondary", hex: "#8B7355" },
      { role: "background", hex: "#F3EDE4" },
      { role: "text", hex: "#1F1A14" },
      { role: "accent", hex: "#C46B3A" },
    ],
  },
  {
    name: "바이올렛 미스트",
    swatches: [
      { role: "primary", hex: "#4C3A6B" },
      { role: "secondary", hex: "#8E7AA8" },
      { role: "background", hex: "#F5F2F8" },
      { role: "text", hex: "#1E1628" },
      { role: "accent", hex: "#E09F3E" },
    ],
  },
  {
    name: "오션 솔트",
    swatches: [
      { role: "primary", hex: "#0E4D64" },
      { role: "secondary", hex: "#5C8D9A" },
      { role: "background", hex: "#F2F7F8" },
      { role: "text", hex: "#102027" },
      { role: "accent", hex: "#F4A259" },
    ],
  },
]

interface WireframeTemplate {
  layoutId: WireframeLayoutId
  title: (screen: string) => string
  structureNotes: string
  blocks: Array<{
    id: string
    role: "nav" | "hero" | "form" | "list" | "footer" | "sidebar" | "content"
    notes: string
  }>
  layoutPrompt: string
}

const WIREFRAME_BANK: WireframeTemplate[] = [
  {
    layoutId: "hero",
    title: (screen) => `${screen} 히어로 우선`,
    structureNotes: "상단 내비, 넓은 히어로, 핵심 폼/CTA, 하단 푸터로 설득 후 전환.",
    blocks: [
      { id: "nav", role: "nav", notes: "로고 + 주요 메뉴 4개 + 로그인" },
      { id: "hero", role: "hero", notes: "한 줄 가치제안과 주요 CTA" },
      { id: "form", role: "form", notes: "이메일 또는 시작 폼" },
      { id: "footer", role: "footer", notes: "약관과 보조 링크" },
    ],
    layoutPrompt: "hero-first landing wireframe",
  },
  {
    layoutId: "app",
    title: (screen) => `${screen} 사이드바 앱`,
    structureNotes: "좌측 내비와 본문 리스트. 사내툴·대시보드에 적합.",
    blocks: [
      { id: "nav", role: "nav", notes: "상단 유틸 바" },
      { id: "sidebar", role: "sidebar", notes: "섹션 네비게이션" },
      { id: "list", role: "list", notes: "카드 또는 테이블 본문" },
      { id: "content", role: "content", notes: "상세 패널" },
    ],
    layoutPrompt: "sidebar app wireframe",
  },
  {
    layoutId: "gallery",
    title: (screen) => `${screen} 카드 갤러리`,
    structureNotes: "히어로 없이 필터와 카드 그리드로 탐색. 카탈로그형.",
    blocks: [
      { id: "nav", role: "nav", notes: "검색이 있는 상단바" },
      { id: "content", role: "content", notes: "필터 칩 줄" },
      { id: "list", role: "list", notes: "3열 카드 그리드" },
      { id: "footer", role: "footer", notes: "페이지네이션" },
    ],
    layoutPrompt: "card gallery wireframe",
  },
  {
    layoutId: "split",
    title: (screen) => `${screen} 스플릿 히어로`,
    structureNotes: "좌측 카피와 우측 비주얼을 나눈 랜딩. 제품 소개에 적합.",
    blocks: [
      { id: "nav", role: "nav", notes: "얇은 상단 내비" },
      { id: "hero", role: "hero", notes: "좌측 헤드라인과 CTA" },
      { id: "content", role: "content", notes: "우측 프리뷰 패널" },
      { id: "footer", role: "footer", notes: "짧은 푸터" },
    ],
    layoutPrompt: "split-hero two column wireframe",
  },
  {
    layoutId: "pricing",
    title: (screen) => `${screen} 가격 3열`,
    structureNotes: "플랜 비교 카드 3열. 요금·구독 화면에 적합.",
    blocks: [
      { id: "nav", role: "nav", notes: "요금 메뉴가 강조된 내비" },
      { id: "content", role: "content", notes: "짧은 안내 카피" },
      { id: "list", role: "list", notes: "3열 가격 카드" },
      { id: "footer", role: "footer", notes: "FAQ 링크" },
    ],
    layoutPrompt: "pricing three-column wireframe",
  },
  {
    layoutId: "dashboard",
    title: (screen) => `${screen} 대시보드 지표`,
    structureNotes: "상단 KPI와 본문 테이블. 운영·분석 화면에 적합.",
    blocks: [
      { id: "nav", role: "nav", notes: "검색과 알림" },
      { id: "sidebar", role: "sidebar", notes: "아이콘 레일" },
      { id: "list", role: "list", notes: "KPI 카드 줄 + 테이블" },
      { id: "content", role: "content", notes: "필터 패널" },
    ],
    layoutPrompt: "dashboard metrics wireframe",
  },
  {
    layoutId: "onboard",
    title: (screen) => `${screen} 중앙 온보딩`,
    structureNotes: "가운데 정렬된 단계 폼. 가입·온보딩에 적합.",
    blocks: [
      { id: "nav", role: "nav", notes: "로고만 있는 미니 헤더" },
      { id: "content", role: "content", notes: "진행 단계 표시" },
      { id: "form", role: "form", notes: "중앙 카드 폼" },
      { id: "footer", role: "footer", notes: "도움말 링크" },
    ],
    layoutPrompt: "centered onboarding form wireframe",
  },
  {
    layoutId: "article",
    title: (screen) => `${screen} 아티클 리드`,
    structureNotes: "본문과 우측 목차 레일. 가이드·헬프센터에 적합.",
    blocks: [
      { id: "nav", role: "nav", notes: "문서 검색 내비" },
      { id: "content", role: "content", notes: "본문 타이틀과 단락" },
      { id: "sidebar", role: "sidebar", notes: "우측 목차" },
      { id: "footer", role: "footer", notes: "관련 문서" },
    ],
    layoutPrompt: "article reading rail wireframe",
  },
  {
    layoutId: "checkout",
    title: (screen) => `${screen} 체크아웃 스텝`,
    structureNotes: "단계 표시와 요약 사이드. 결제·신청 흐름에 적합.",
    blocks: [
      { id: "nav", role: "nav", notes: "단계 인디케이터" },
      { id: "form", role: "form", notes: "배송/결제 입력" },
      { id: "content", role: "content", notes: "주문 요약" },
      { id: "footer", role: "footer", notes: "보안 안내" },
    ],
    layoutPrompt: "checkout stepper wireframe",
  },
  {
    layoutId: "settings",
    title: (screen) => `${screen} 설정 패널`,
    structureNotes: "좌측 설정 메뉴와 우측 폼. 계정·환경설정에 적합.",
    blocks: [
      { id: "nav", role: "nav", notes: "계정 내비" },
      { id: "sidebar", role: "sidebar", notes: "설정 섹션 목록" },
      { id: "form", role: "form", notes: "필드 그룹" },
      { id: "content", role: "content", notes: "저장 바" },
    ],
    layoutPrompt: "settings panel wireframe",
  },
  {
    layoutId: "kanban",
    title: (screen) => `${screen} 칸반 보드`,
    structureNotes: "열 단위 카드 이동. 작업 관리·파이프라인에 적합.",
    blocks: [
      { id: "nav", role: "nav", notes: "보드 전환과 필터" },
      { id: "sidebar", role: "sidebar", notes: "프로젝트 목록" },
      { id: "list", role: "list", notes: "칸반 열 3~4개" },
      { id: "content", role: "content", notes: "카드 상세 서랍" },
    ],
    layoutPrompt: "kanban board columns wireframe",
  },
  {
    layoutId: "chat",
    title: (screen) => `${screen} 채팅 스레드`,
    structureNotes: "대화 목록과 메시지 본문. 상담·메신저에 적합.",
    blocks: [
      { id: "nav", role: "nav", notes: "검색과 상태" },
      { id: "list", role: "list", notes: "대화 목록" },
      { id: "content", role: "content", notes: "메시지 스레드" },
      { id: "form", role: "form", notes: "입력창" },
    ],
    layoutPrompt: "chat messenger thread wireframe",
  },
  {
    layoutId: "search",
    title: (screen) => `${screen} 검색 결과`,
    structureNotes: "쿼리, 필터, 결과 리스트. 탐색·조회 화면에 적합.",
    blocks: [
      { id: "nav", role: "nav", notes: "검색바 강조" },
      { id: "content", role: "content", notes: "필터와 정렬" },
      { id: "list", role: "list", notes: "결과 행" },
      { id: "footer", role: "footer", notes: "더 보기" },
    ],
    layoutPrompt: "search-results list wireframe",
  },
  {
    layoutId: "profile",
    title: (screen) => `${screen} 프로필 헤더`,
    structureNotes: "아바타 헤더와 탭 본문. 계정·크리에이터 페이지에 적합.",
    blocks: [
      { id: "nav", role: "nav", notes: "계정 메뉴" },
      { id: "hero", role: "hero", notes: "커버와 아바타" },
      { id: "content", role: "content", notes: "탭 바" },
      { id: "list", role: "list", notes: "활동 그리드" },
    ],
    layoutPrompt: "profile header and tabs wireframe",
  },
  {
    layoutId: "map",
    title: (screen) => `${screen} 지도 스플릿`,
    structureNotes: "좌측 목록과 우측 지도. 지점·매장 찾기에 적합.",
    blocks: [
      { id: "nav", role: "nav", notes: "위치 검색" },
      { id: "list", role: "list", notes: "장소 카드 목록" },
      { id: "content", role: "content", notes: "지도 캔버스" },
      { id: "footer", role: "footer", notes: "선택된 장소 요약" },
    ],
    layoutPrompt: "map-split list wireframe",
  },
  {
    layoutId: "video",
    title: (screen) => `${screen} 비디오 시청`,
    structureNotes: "플레이어와 추천 레일. 강의·미디어에 적합.",
    blocks: [
      { id: "nav", role: "nav", notes: "채널 내비" },
      { id: "hero", role: "hero", notes: "플레이어 영역" },
      { id: "content", role: "content", notes: "제목과 설명" },
      { id: "list", role: "list", notes: "추천 목록" },
    ],
    layoutPrompt: "video-player watch wireframe",
  },
  {
    layoutId: "timeline",
    title: (screen) => `${screen} 활동 타임라인`,
    structureNotes: "세로 피드와 필터. 알림·활동 내역에 적합.",
    blocks: [
      { id: "nav", role: "nav", notes: "활동 탭" },
      { id: "content", role: "content", notes: "필터 칩" },
      { id: "list", role: "list", notes: "타임라인 이벤트" },
      { id: "footer", role: "footer", notes: "이전 기록" },
    ],
    layoutPrompt: "activity timeline feed wireframe",
  },
  {
    layoutId: "wizard",
    title: (screen) => `${screen} 빈 상태 위자드`,
    structureNotes: "빈 화면과 시작 CTA. 첫 설정·온보딩 안내에 적합.",
    blocks: [
      { id: "nav", role: "nav", notes: "미니 헤더" },
      { id: "hero", role: "hero", notes: "빈 상태 일러스트 영역" },
      { id: "content", role: "content", notes: "안내 카피" },
      { id: "form", role: "form", notes: "시작하기 CTA" },
    ],
    layoutPrompt: "empty-wizard getting started wireframe",
  },
  {
    layoutId: "calendar",
    title: (screen) => `${screen} 월간 캘린더`,
    structureNotes: "월 그리드와 사이드 일정. 예약·스케줄에 적합.",
    blocks: [
      { id: "nav", role: "nav", notes: "월 이동" },
      { id: "content", role: "content", notes: "캘린더 그리드" },
      { id: "list", role: "list", notes: "선택일 일정" },
      { id: "form", role: "form", notes: "새 일정" },
    ],
    layoutPrompt: "calendar month grid wireframe",
  },
  {
    layoutId: "inbox",
    title: (screen) => `${screen} 인박스`,
    structureNotes: "메일/티켓 목록과 본문. 고객지원·메시지함에 적합.",
    blocks: [
      { id: "nav", role: "nav", notes: "폴더와 검색" },
      { id: "sidebar", role: "sidebar", notes: "폴더 트리" },
      { id: "list", role: "list", notes: "스레드 목록" },
      { id: "content", role: "content", notes: "본문 읽기" },
    ],
    layoutPrompt: "inbox mail thread wireframe",
  },
]

export class MockTextAdapter implements TextStructuredAdapter {
  async generateConceptSet(input: InputSnapshot): Promise<ConceptTextOutput> {
    await delay(280)
    const domain = input.domainLabel
    const keyword = input.keywords[0] ?? "핵심"
    const avoid = new Set(input.avoidTitles ?? [])
    const picked = pickThree(
      CONCEPT_BANK,
      seedFrom(input),
      (item) => avoid.has(`${domain} ${item.title}`) || avoid.has(item.title)
    )
    return {
      candidates: picked.map((item) => ({
        title: `${domain} ${item.title}`,
        summary: item.summary(domain, keyword),
        visualHints: item.visualHints,
        moodPrompt: item.moodPrompt(domain),
      })),
    }
  }

  async generatePaletteSet(input: InputSnapshot): Promise<PaletteTextOutput> {
    await delay(220)
    const concept = input.committedConcept?.title ?? "기본"
    const picked = pickThree(PALETTE_BANK, seedFrom(input), () => false)
    return {
      candidates: picked.map((item) => ({
        name: `${concept} ${item.name}`,
        swatches: item.swatches,
      })),
    }
  }

  async generateWireframeSet(input: InputSnapshot): Promise<WireframeTextOutput> {
    await delay(260)
    const screen = input.keywords.find((word) => word.includes("화면")) ?? "홈"
    const ranked = rankWireframesByConceptFit(WIREFRAME_BANK, input, (item) => item.layoutId)
    return {
      candidates: ranked.map((item) => ({
        title: item.title(screen),
        structureNotes: item.structureNotes,
        blocks: item.blocks,
        layoutPrompt: item.layoutPrompt,
      })),
    }
  }

  async generateComponentSet(input: InputSnapshot): Promise<ComponentTextOutput> {
    await delay(240)
    const tone = input.committedConcept?.title ?? "기본"
    return {
      candidates: [
        {
          title: `${tone} 솔리드`,
          items: [
            { role: "button", variant: "filled", notes: "강한 모서리, 단색 채움" },
            { role: "input", variant: "underline", notes: "하단 보더만 있는 입력" },
            { role: "card", variant: "elevated", notes: "가벼운 그림자 카드" },
            { role: "navigation", variant: "horizontal", notes: "텍스트 링크 내비" },
            { role: "badge", variant: "outline", notes: "얇은 아웃라인 배지" },
          ],
          previewPrompt: "UI kit preview of solid buttons inputs cards navigation, flat product shot",
        },
        {
          title: `${tone} 소프트`,
          items: [
            { role: "button", variant: "pill", notes: "필 모양 버튼" },
            { role: "input", variant: "filled-soft", notes: "연한 배경 입력" },
            { role: "card", variant: "rounded", notes: "큰 라운드 카드" },
            { role: "navigation", variant: "tabs", notes: "하단 인디케이터 탭" },
            { role: "tabs", variant: "segmented", notes: "세그먼트 컨트롤" },
          ],
          previewPrompt: "soft rounded UI component set, pill buttons, airy cards",
        },
        {
          title: `${tone} 컴팩트`,
          items: [
            { role: "button", variant: "compact", notes: "작은 높이의 툴바 버튼" },
            { role: "input", variant: "dense", notes: "밀도 높은 폼 필드" },
            { role: "card", variant: "table-row", notes: "행처럼 붙는 카드" },
            { role: "navigation", variant: "icon-rail", notes: "아이콘 레일" },
            { role: "badge", variant: "status-dot", notes: "상태 닷 배지" },
          ],
          previewPrompt: "compact dense admin UI components, icon rail, small buttons",
        },
      ],
    }
  }
}

function seedFrom(input: InputSnapshot): number {
  return hashSeed(
    `${input.entropy ?? ""}|${input.domainKey}|${input.keywords.join(",")}|${(input.avoidTitles ?? []).join(",")}`
  )
}

function hashSeed(value: string): number {
  let hash = 2166136261
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index)
    hash = Math.imul(hash, 16777619)
  }
  return hash >>> 0
}

function pickThree<T>(
  items: T[],
  seed: number,
  isAvoided: (item: T) => boolean
): T[] {
  const available = items.filter((item) => !isAvoided(item))
  const pool = available.length >= 3 ? available : items
  const shuffled = [...pool]
  let state = seed || 1
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0
    const swapIndex = state % (index + 1)
    const current = shuffled[index]
    const swap = shuffled[swapIndex]
    if (current === undefined || swap === undefined) continue
    shuffled[index] = swap
    shuffled[swapIndex] = current
  }
  return shuffled.slice(0, 3)
}
