"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Highlighter, X, BookOpen, ExternalLink, Loader2, StickyNote } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  type ResearchPack,
  type Cue,
  MAX_CUE_WORDS_TOTAL,
  countWords,
  cacheResearch,
  getCachedResearch,
} from "@/lib/research-types";

type Tab = "gist" | "summary" | "deep";

// Keeps fallback packs alive across remounts so the reader never reloads needlessly
const memo = new Map<string, ResearchPack>();

function Cited({ text, pack }: { text: string; pack: ResearchPack }) {
  const parts = text.split(/(\[S\d+\])/g);
  return (
    <>
      {parts.map((p, i) => {
        const m = p.match(/^\[(S\d+)\]$/);
        if (!m) return <span key={i}>{p}</span>;
        const src = pack.sources.find((s) => s.id === m[1]);
        if (!src) return null;
        const n = pack.sources.indexOf(src) + 1;
        return (
          <a
            key={i}
            href={`#src-${src.id}`}
            title={src.title}
            className="align-super text-[10px] font-mono font-bold px-0.5"
            style={{ color: "var(--olive)" }}
          >
            [{n}]
          </a>
        );
      })}
    </>
  );
}

function Paragraphs({ text, pack }: { text: string; pack: ResearchPack }) {
  return (
    <>
      {text.split(/\n{2,}/).map((para, i) => (
        <p key={i} className="mb-3 leading-relaxed">
          <Cited text={para} pack={pack} />
        </p>
      ))}
    </>
  );
}

function cleanCue(raw: string): string {
  return raw.replace(/\[S\d+\]|\[\d+\]/g, "").replace(/\s+/g, " ").trim();
}

export default function ResearchReader({
  topicId,
  topicText,
  category,
  cues,
  onCuesChange,
}: {
  topicId: string;
  topicText: string;
  category: string;
  cues: Cue[];
  onCuesChange: (cues: Cue[]) => void;
}) {
  const [pack, setPack] = useState<ResearchPack | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [tab, setTab] = useState<Tab>("gist");
  const [pill, setPill] = useState<{ x: number; y: number; below: boolean; text: string } | null>(null);
  const [limitMsg, setLimitMsg] = useState<string | null>(null);
  const boxRef = useRef<HTMLDivElement>(null);

  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const cached = attempt === 0 ? memo.get(topicId) ?? getCachedResearch(topicId) : null;
    if (cached) {
      setPack(cached);
      setStatus("ready");
      return;
    }
    let cancelled = false;
    setStatus("loading");
    fetch("/api/ai/research", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ topicId, topic: topicText, category }),
      signal: AbortSignal.timeout(30000),
    })
      .then(async (r) => {
        if (!r.ok) throw new Error(String(r.status));
        return (await r.json()) as ResearchPack;
      })
      .then((p) => {
        if (cancelled) return;
        memo.set(topicId, p);
        if (!p.degraded) cacheResearch(p);
        setPack(p);
        setStatus("ready");
      })
      .catch(() => !cancelled && setStatus("error"));
    return () => {
      cancelled = true;
    };
  }, [topicId, topicText, category, attempt]);

  function handleSelect() {
    const sel = window.getSelection();
    const text = sel?.toString().trim() ?? "";
    if (!sel || sel.rangeCount === 0 || text.length < 3 || !boxRef.current?.contains(sel.anchorNode)) {
      setPill(null);
      return;
    }
    setLimitMsg(null);
    const rect = sel.getRangeAt(0).getBoundingClientRect();
    const below = rect.top < 56;
    const x = Math.min(Math.max(rect.left + rect.width / 2, 80), window.innerWidth - 80);
    setPill({ x, y: below ? rect.bottom + 8 : rect.top - 8, below, text });
  }

  function addCue() {
    if (!pill) return;
    const text = cleanCue(pill.text);
    if (overLimit)
      setLimitMsg(`Cue limit reached (${MAX_CUE_WORDS_TOTAL} words). Remove a cue to add another.`);
    else {
      setLimitMsg(null);
      onCuesChange([...cues, { id: crypto.randomUUID(), text, addToNotes: false }]);
    }
    window.getSelection()?.removeAllRanges();
    setPill(null);
  }

  useEffect(() => {
    if (!pill) return;
    const hide = () => setPill(null);
    window.addEventListener("scroll", hide, true);
    window.addEventListener("resize", hide);
    return () => {
      window.removeEventListener("scroll", hide, true);
      window.removeEventListener("resize", hide);
    };
  }, [pill]);

  const usedWords = cues.reduce((n, c) => n + countWords(c.text), 0);
  const pillWords = pill ? countWords(cleanCue(pill.text)) : 0;
  const overLimit = usedWords + pillWords > MAX_CUE_WORDS_TOTAL;

  if (status === "loading") {
    return (
      <div className="rounded-xl surface p-6 space-y-3" aria-busy="true">
        <div className="flex items-center gap-2 text-xs font-semibold" style={{ color: "var(--olive-text)" }}>
          <Loader2 size={14} className="animate-spin" /> Gathering published sources…
        </div>
        {[90, 100, 75, 95, 60].map((w, i) => (
          <div key={i} className="h-3 rounded animate-pulse" style={{ width: `${w}%`, background: "var(--border-dim)" }} />
        ))}
      </div>
    );
  }

  if (status === "error" || !pack) {
    return (
      <div className="rounded-xl surface p-6 text-sm" style={{ color: "var(--text-dim)" }}>
        <p>We couldn't load the reading for this topic.</p>
        <button onClick={() => setAttempt((n) => n + 1)} className="btn-terra mt-3">
          Try again
        </button>
        <p className="mt-3 text-xs" style={{ color: "var(--text-mute)" }}>
          Or research it yourself and write what you learn in Your Notes.
        </p>
      </div>
    );
  }

  const tabs: { id: Tab; label: string }[] = [
    { id: "gist", label: "Gist" },
    { id: "summary", label: "Summary" },
    { id: "deep", label: "Deep Dive" },
  ];

  return (
    <div className="flex flex-col gap-3">
      {pill &&
        createPortal(
          <button
            onMouseDown={(e) => e.preventDefault()}
            onClick={addCue}
            disabled={overLimit}
            className={cn(
              "fixed z-[100] -translate-x-1/2 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold text-white shadow-lg whitespace-nowrap",
              !pill.below && "-translate-y-full"
            )}
            style={{ left: pill.x, top: pill.y, background: overLimit ? "var(--red)" : "var(--olive)" }}
          >
            <Highlighter size={12} />
            {overLimit
              ? `Over the limit (${pillWords} words, ${Math.max(0, MAX_CUE_WORDS_TOTAL - usedWords)} left). Select less`
              : `Add as cue (${pillWords} words)`}
          </button>,
          document.body
        )}
      {pack.degraded && (
        <div className="flex items-center justify-between gap-2 rounded-lg px-3 py-2 text-xs surface" style={{ color: "var(--text-dim)" }}>
          <span>Showing source excerpts. The plain-language summary is unavailable right now.</span>
          <button onClick={() => setAttempt((n) => n + 1)} className="font-bold underline" style={{ color: "var(--olive)" }}>
            Retry
          </button>
        </div>
      )}
      <div className="flex items-center gap-1 rounded-lg p-1 surface w-fit">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={cn(
              "px-3 py-1.5 rounded-md text-xs font-semibold transition-colors",
              tab === t.id ? "bg-[var(--olive)] text-white" : "text-[var(--text-dim)] hover:bg-black/5"
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div
        ref={boxRef}
        onMouseUp={handleSelect}
        onKeyUp={handleSelect}
        onTouchEnd={handleSelect}
        className="relative rounded-xl surface p-5 text-sm max-h-[360px] xl:max-h-[520px] overflow-y-auto"
        style={{ color: "var(--text)" }}
      >

        {tab === "gist" && <Paragraphs text={pack.gist} pack={pack} />}
        {tab === "summary" && <Paragraphs text={pack.summary} pack={pack} />}
        {tab === "deep" &&
          pack.sections.map((s, i) => (
            <section key={i} className="mb-4">
              <h3 className="font-space font-bold text-base mb-2">{s.heading}</h3>
              <Paragraphs text={s.body} pack={pack} />
            </section>
          ))}

        <div className="mt-5 pt-4 border-t" style={{ borderColor: "var(--border-dim)" }}>
          <div className="text-label mb-2 flex items-center gap-1.5">
            <BookOpen size={12} /> Sources
          </div>
          <ol className="space-y-1.5 text-xs" style={{ color: "var(--text-dim)" }}>
            {pack.sources.map((s, i) => (
              <li key={s.id} id={`src-${s.id}`} className="flex gap-1.5">
                <span className="font-mono">[{i + 1}]</span>
                <a href={s.url} target="_blank" rel="noopener noreferrer" className="hover:underline">
                  {s.authors ? `${s.authors}. ` : ""}
                  {s.title}
                  {s.year ? ` (${s.year})` : ""}. {s.publisher}.{" "}
                  <ExternalLink size={10} className="inline" />
                </a>
              </li>
            ))}
          </ol>
        </div>
      </div>

      {/* Cue tray */}
      <div className="rounded-xl surface p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="text-label flex items-center gap-1.5">
            <Highlighter size={12} /> Your cues ({usedWords}/{MAX_CUE_WORDS_TOTAL} words)
          </div>
          <span className="text-[10px]" style={{ color: "var(--text-mute)" }}>
            Select text above to add short reminders. They appear while you speak.
          </span>
        </div>
        {limitMsg && (
          <div className="text-[11px] font-semibold mb-2" style={{ color: "var(--red)" }}>
            {limitMsg}
          </div>
        )}
        {cues.length === 0 ? (
          <p className="text-xs" style={{ color: "var(--text-mute)" }}>
            No cues yet.
          </p>
        ) : (
          <ul className="space-y-1.5">
            {cues.map((c) => (
              <li
                key={c.id}
                className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs"
                style={{ background: "var(--bg-input)", border: "1px solid var(--border-dim)" }}
              >
                <span className="flex-1 font-medium">{c.text}</span>
                <label className="flex items-center gap-1 cursor-pointer select-none" style={{ color: "var(--text-dim)" }}>
                  <input
                    type="checkbox"
                    checked={c.addToNotes}
                    disabled={c.addToNotes}
                    onChange={() =>
                      onCuesChange(cues.map((x) => (x.id === c.id ? { ...x, addToNotes: !x.addToNotes } : x)))
                    }
                  />
                  <StickyNote size={11} /> {c.addToNotes ? "In notes" : "Save to notes"}
                </label>
                <button
                  aria-label="Remove cue"
                  onClick={() => onCuesChange(cues.filter((x) => x.id !== c.id))}
                  className="p-1 rounded hover:bg-black/5"
                >
                  <X size={12} />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
