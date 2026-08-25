"use client"

import { resolveConceptMood } from "@/lib/ai/concept-mood"

interface ConceptMoodPreviewProps {
  src: string
  title: string
  hints?: string[]
}

export function ConceptMoodPreview({ src, title, hints }: ConceptMoodPreviewProps) {
  const mood = resolveConceptMood(title, hints)
  const label = mood.stem === "기본" ? title : mood.stem

  return (
    <div
      className="relative aspect-[16/10] overflow-hidden bg-muted"
      style={{ backgroundColor: mood.colors.background }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={`${title} 무드 미리보기`}
        className="h-full w-full object-cover"
        style={{ filter: mood.filter }}
      />
      <div
        className="absolute inset-0"
        style={{
          background: mood.overlay,
          mixBlendMode: mood.blend,
          opacity: mood.overlayOpacity,
        }}
      />
      <MoodFrame frame={mood.frame} accent={mood.colors.accent} text={mood.colors.text} />
      <p
        className="absolute left-3 top-3 max-w-[80%] text-xs font-semibold tracking-wide"
        style={{ color: mood.colors.text, mixBlendMode: "normal" }}
      >
        <span
          className="inline-block rounded-sm px-1.5 py-0.5"
          style={{ backgroundColor: `${mood.colors.background}cc` }}
        >
          {label}
        </span>
      </p>
      <div className="absolute inset-x-0 bottom-0 flex h-2.5">
        {mood.swatches.map((hex, index) => (
          <span key={`${hex}-${index}`} className="flex-1" style={{ backgroundColor: hex }} title={hex} />
        ))}
      </div>
    </div>
  )
}

function MoodFrame({
  frame,
  accent,
  text,
}: {
  frame: ReturnType<typeof resolveConceptMood>["frame"]
  accent: string
  text: string
}) {
  if (frame === "gallery") {
    return <div className="pointer-events-none absolute inset-3 border-8 border-white/90 shadow-sm" />
  }
  if (frame === "glass") {
    return (
      <div className="pointer-events-none absolute right-6 top-10 h-24 w-40 rounded-2xl border border-white/70 bg-white/25 backdrop-blur-[1px]" />
    )
  }
  if (frame === "brutal") {
    return (
      <div
        className="pointer-events-none absolute bottom-8 right-6 h-14 w-28 border-4"
        style={{ borderColor: text, backgroundColor: accent, boxShadow: "6px 6px 0 #111" }}
      />
    )
  }
  if (frame === "night") {
    return (
      <div
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          backgroundImage:
            "linear-gradient(to right, #B8F27222 1px, transparent 1px), linear-gradient(to bottom, #B8F27222 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />
    )
  }
  if (frame === "editorial") {
    return (
      <div className="pointer-events-none absolute bottom-8 left-4 right-20 h-1" style={{ backgroundColor: accent }} />
    )
  }
  if (frame === "kinetic") {
    return (
      <div
        className="pointer-events-none absolute -left-10 top-0 h-[140%] w-16 rotate-12 opacity-70"
        style={{ backgroundColor: accent }}
      />
    )
  }
  if (frame === "organic") {
    return (
      <div
        className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full opacity-50"
        style={{ backgroundColor: accent }}
      />
    )
  }
  if (frame === "industrial") {
    return <div className="pointer-events-none absolute inset-3 border border-current/40" style={{ color: text }} />
  }
  if (frame === "retail") {
    return (
      <div
        className="pointer-events-none absolute right-4 top-4 rounded-full px-2 py-1 text-[10px] font-bold text-white"
        style={{ backgroundColor: accent }}
      >
        세일
      </div>
    )
  }
  if (frame === "paper") {
    return (
      <div
        className="pointer-events-none absolute right-5 top-8 rotate-12 border px-2 py-1 text-[10px] tracking-widest"
        style={{ borderColor: accent, color: accent, backgroundColor: "#E8D9C4cc" }}
      >
        기록
      </div>
    )
  }
  if (frame === "pastel") {
    return (
      <div
        className="pointer-events-none absolute bottom-8 left-6 h-16 w-16 rounded-full opacity-60"
        style={{ backgroundColor: accent }}
      />
    )
  }
  return (
    <div className="pointer-events-none absolute inset-x-8 bottom-8 h-px" style={{ backgroundColor: text }} />
  )
}
