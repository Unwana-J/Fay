"use client";

import { useEffect, useRef, useState, use } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import {
  Clock, BookOpen, Mic, CheckCircle2, AlertCircle, X,
  Bold, Italic, List, ListOrdered, CheckSquare,
  ChevronRight, Star, ArrowLeft, Zap, Volume2, RefreshCcw, Globe,
  Share2, Check, ExternalLink, Sparkles
} from "lucide-react";
import { useAppStore, type ActiveSession } from "@/store/useAppStore";
import { CATEGORY_ICONS, CATEGORY_COLORS } from "@/lib/topics";
import { formatTime, cn } from "@/lib/utils";
import ShareNoteModal from "@/components/notes/ShareNoteModal";
import { encodeSharedNote } from "@/lib/share-note";

// ─── Utility: Blob to Base64 ────────────────────────────────────────────────
function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

// ─── Timer Ring ───────────────────────────────────────────────────────────────
function TimerRing({
  secondsLeft,
  totalSeconds,
  size = 180,
  strokeWidth = 10,
}: {
  secondsLeft: number;
  totalSeconds: number;
  size?: number;
  strokeWidth?: number;
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (secondsLeft / totalSeconds) * circumference;
  const isDanger = secondsLeft <= 10;

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg className="transform -rotate-90" width={size} height={size}>
        {/* Background ring */}
        <circle
          className="transition-colors"
          stroke="var(--olive-dim)"
          fill="transparent"
          strokeWidth={strokeWidth}
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
        {/* Progress ring */}
        <circle
          className="transition-all duration-300"
          stroke={isDanger ? "var(--red)" : "var(--terra)"}
          fill="transparent"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
      </svg>
      {/* Time text centered */}
      <div className="absolute flex flex-col items-center justify-center">
        <span className="font-mono text-4xl font-bold tracking-tight" style={{ color: isDanger ? "var(--red)" : "var(--text)" }}>
          {formatTime(secondsLeft)}
        </span>
        <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 mt-1">
          {secondsLeft === 0 ? "Time's up" : "Speaking"}
        </span>
      </div>
    </div>
  );
}

// ─── Live Waveform Visualizer ──────────────────────────────────────────────
function Waveform({ active, analyser }: { active: boolean; analyser: AnalyserNode | null }) {
  const [dataArray, setDataArray] = useState<Uint8Array>(new Uint8Array(16));
  const animationRef = useRef<number | null>(null);

  useEffect(() => {
    if (!active || !analyser) {
      setDataArray(new Uint8Array(16));
      return;
    }

    const bufferLength = analyser.frequencyBinCount;
    const data = new Uint8Array(bufferLength);

    const update = () => {
      analyser.getByteFrequencyData(data);
      // Downsample to 16 bars
      const nextData = new Uint8Array(16);
      const step = Math.floor(bufferLength / 16);
      for (let i = 0; i < 16; i++) {
        let sum = 0;
        for (let j = 0; j < step; j++) {
          sum += data[i * step + j];
        }
        nextData[i] = sum / step;
      }
      setDataArray(nextData);
      animationRef.current = requestAnimationFrame(update);
    };

    update();
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [active, analyser]);

  return (
    <div className="flex items-end justify-center gap-1.5 h-16 w-full px-8">
      {Array.from({ length: 16 }).map((_, i) => {
        const val = dataArray[i] ?? 0;
        const height = active ? Math.max(4, Math.round((val / 255) * 56)) : 4;
        return (
          <div
            key={i}
            className="flex-1 rounded-full transition-all duration-75"
            style={{
              height,
              background: active ? "var(--terra)" : "var(--olive-dim)",
              opacity: active ? 0.3 + (height / 56) * 0.7 : 0.4,
            }}
          />
        );
      })}
    </div>
  );
}

// ─── TipTap editor toolbar ───────────────────────────────────────────────────
function EditorToolbar({ editor }: { editor: ReturnType<typeof useEditor> }) {
  if (!editor) return null;
  return (
    <div className="flex items-center gap-1 px-3 py-2 border-b rounded-t-xl bg-[var(--bg-input)]" style={{ borderColor: "var(--border-dim)" }}>
      {[
        { icon: <Bold size={13} />, action: () => editor.chain().focus().toggleBold().run(), active: editor.isActive("bold"), title: "Bold" },
        { icon: <Italic size={13} />, action: () => editor.chain().focus().toggleItalic().run(), active: editor.isActive("italic"), title: "Italic" },
      ].map((btn, i) => (
        <button key={i} onClick={btn.action} title={btn.title}
          className={cn("p-1.5 rounded-lg text-[var(--text-mute)] hover:text-[var(--text)] hover:bg-black/5 transition-colors", btn.active && "bg-[var(--bg-card)] text-[var(--text)] border border-[var(--border-dim)]")}
        >{btn.icon}</button>
      ))}
      <div className="w-px h-4 mx-0.5" style={{ backgroundColor: "var(--border-dim)" }} />
      {[
        { label: "H1", action: () => editor.chain().focus().toggleHeading({ level: 1 }).run(), active: editor.isActive("heading", { level: 1 }) },
        { label: "H2", action: () => editor.chain().focus().toggleHeading({ level: 2 }).run(), active: editor.isActive("heading", { level: 2 }) },
      ].map((btn, i) => (
        <button key={i} onClick={btn.action}
          className={cn("px-1.5 py-0.5 rounded-lg text-xs font-bold text-[var(--text-mute)] hover:text-[var(--text)] hover:bg-black/5 transition-colors", btn.active && "bg-[var(--bg-card)] text-[var(--text)] border border-[var(--border-dim)]")}
        >{btn.label}</button>
      ))}
      <div className="w-px h-4 mx-0.5" style={{ backgroundColor: "var(--border-dim)" }} />
      {[
        { icon: <List size={13} />, action: () => editor.chain().focus().toggleBulletList().run(), active: editor.isActive("bulletList"), title: "Bullet list" },
        { icon: <ListOrdered size={13} />, action: () => editor.chain().focus().toggleOrderedList().run(), active: editor.isActive("orderedList"), title: "Numbered list" },
        { icon: <CheckSquare size={13} />, action: () => editor.chain().focus().toggleTaskList().run(), active: editor.isActive("taskList"), title: "Checklist" },
      ].map((btn, i) => (
        <button key={i} onClick={btn.action} title={btn.title}
          className={cn("p-1.5 rounded-lg text-[var(--text-mute)] hover:text-[var(--text)] hover:bg-black/5 transition-colors", btn.active && "bg-[var(--bg-card)] text-[var(--text)] border border-[var(--border-dim)]")}
        >{btn.icon}</button>
      ))}
    </div>
  );
}

// ─── Confetti ─────────────────────────────────────────────────────────────────
async function fireConfetti() {
  const confetti = (await import("canvas-confetti")).default;
  confetti({ particleCount: 140, spread: 80, origin: { y: 0.6 }, colors: ["#D4622A", "#C9993A", "#8A9E42", "#E2E0D0"] });
}

// ─── STAGE COMPONENTS ─────────────────────────────────────────────────────────

function StageResearch({ session, onAdvance, onAbandon }: {
  session: ActiveSession;
  onAdvance: (notes: string) => void;
  onAbandon: () => void;
}) {
  const { topic } = session;
  const updateNotes = useAppStore((s) => s.updateNotes);

  const [pasteWarning, setPasteWarning] = useState<string | null>(null);
  const triggerWarningRef = useRef<(msg?: string) => void>(() => {});

  function triggerPasteWarning(msg = "Clipboard transfer is disabled. Write your notes in your own words!") {
    setPasteWarning(msg);
    // Auto clear warning
    const t = setTimeout(() => setPasteWarning(null), 3500);
    return () => clearTimeout(t);
  }
  triggerWarningRef.current = triggerPasteWarning;

  const editor = useEditor({
    extensions: [
      StarterKit,
      TaskList,
      TaskItem.configure({ nested: true }),
      Link.configure({ openOnClick: false }),
      Placeholder.configure({ placeholder: "Type your findings here. Summarize key arguments, definitions, and examples..." }),
    ],
    editorProps: {
      handlePaste(view, event, slice) {
        triggerWarningRef.current("Pasting is disabled. Write your notes in your own words!");
        return true;
      },
      handleDrop(view, event, slice, moved) {
        triggerWarningRef.current("Drag and drop is disabled. Write your notes in your own words!");
        return true;
      },
      handleDOMEvents: {
        copy(view, event) {
          triggerWarningRef.current("Copying text is disabled to protect learning notes!");
          event.preventDefault();
          return true;
        },
        cut(view, event) {
          triggerWarningRef.current("Cutting text is disabled!");
          event.preventDefault();
          return true;
        }
      }
    },
    content: session.notes || "",
    onUpdate({ editor }) {
      updateNotes(editor.getHTML());
    },
  });

  const wordCount = editor
    ? editor.state.doc.textContent.split(/\s+/).filter(Boolean).length
    : 0;
  const canAdvance = wordCount >= 30;

  // Timer states
  const [secondsLeft, setSecondsLeft] = useState(session.researchDurationMin * 60);
  const [isPaused, setIsPaused] = useState(false);
  const [timeUpUnlocked, setTimeUpUnlocked] = useState(false);
  
  const effectiveCanAdvance = canAdvance || timeUpUnlocked;

  useEffect(() => {
    if (isPaused) return;
    if (secondsLeft <= 0) {
      if (!timeUpUnlocked) {
        if (canAdvance) {
          onAdvance(editor?.getHTML() ?? "");
        } else {
          setTimeUpUnlocked(true);
          triggerWarningRef.current("Time's up — you can still add notes before advancing.");
        }
      }
      return;
    }
    const interval = setInterval(() => {
      setSecondsLeft((s) => Math.max(0, s - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [isPaused, secondsLeft, canAdvance, timeUpUnlocked, editor, onAdvance]);

  function handleExtend() {
    setSecondsLeft((s) => s + 300); // Add 5 minutes (300 seconds)
  }

  function handleStop() {
    if (effectiveCanAdvance) {
      onAdvance(editor?.getHTML() ?? "");
    } else {
      triggerPasteWarning("You need to write at least 30 words before stopping the research stage.");
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
      {/* Left — Topic context */}
      <div className="lg:col-span-1 space-y-4">
        <div className="rounded-2xl p-6 surface">
          <div className="text-label mb-2">Research timer</div>
          
          {/* Print Stopwatch Widget */}
          <div className="flex flex-col items-center gap-3 py-4 bg-[var(--bg-input)] rounded-xl border border-[var(--border-dim)] mb-4">
            <div className={cn("font-mono text-3xl font-bold tracking-tight transition-all", secondsLeft <= 10 ? "text-[var(--red)] animate-pulse" : "text-[var(--text)]")}>
              {secondsLeft === 0 ? "00:00" : formatTime(secondsLeft)}
            </div>
            {secondsLeft === 0 && (
              <span className="text-[10px] text-[var(--red)] font-bold uppercase tracking-wide px-2 text-center">Time's Up! Wrap up & speak</span>
            )}
            
            <div className="flex gap-2">
              <button
                onClick={() => setIsPaused(!isPaused)}
                className="px-2.5 py-1.5 rounded-lg bg-[var(--bg-card)] border border-[var(--border-dim)] hover:bg-black/5 text-xs font-semibold flex items-center justify-center gap-1 min-w-[70px] transition-colors"
              >
                {isPaused ? "Resume" : "Pause"}
              </button>
              <button
                onClick={handleExtend}
                className="px-2.5 py-1.5 rounded-lg bg-[var(--bg-card)] border border-[var(--border-dim)] hover:bg-black/5 text-xs font-semibold flex items-center justify-center gap-1 transition-colors"
              >
                +5 Min
              </button>
              <button
                onClick={handleStop}
                className="px-2.5 py-1.5 rounded-lg bg-[var(--terra)] text-white border-b-2 border-[var(--terra-dk)] hover:opacity-90 text-xs font-bold transition-transform active:translate-y-0.5"
              >
                Stop
              </button>
            </div>
          </div>

          <div className="divider mb-4" />

          <div className="text-label mb-2">Topic Question</div>
          <p
            className="font-space font-bold leading-tight animate-fade-in"
            style={{ fontSize: "1.2rem", color: "var(--text)" }}
          >
            {topic.text}
          </p>
          <div className="flex items-center gap-2 mt-3">
            <span className="tag tag-olive">
              {CATEGORY_ICONS[topic.category]} {topic.category}
            </span>
          </div>
        </div>

        {/* Rules */}
        <div className="rounded-2xl p-4 text-xs space-y-2.5 surface">
          <div className="text-label mb-1">Challenge rules</div>
          {["Read articles & books", "Watch educational videos", "Take notes in your words"].map((r, i) => (
            <div key={i} className="flex items-start gap-2" style={{ color: "var(--olive-text)" }}>
              <CheckCircle2 size={12} className="mt-0.5 flex-shrink-0" />{r}
            </div>
          ))}
          {["AI-generated summaries", "Copy-pasting content"].map((r, i) => (
            <div key={i} className="flex items-start gap-2" style={{ color: "var(--text-mute)" }}>
              <X size={12} className="mt-0.5 flex-shrink-0" />{r}
            </div>
          ))}
        </div>
      </div>

      {/* Right — editor */}
      <div className="flex-1 flex flex-col gap-3 min-h-0 lg:col-span-2">
        <div className="flex items-center justify-between">
          <h2 className="font-space text-xl font-bold" style={{ color: "var(--text)" }}>Research Notes</h2>
          <div className="flex items-center gap-2 text-xs text-[var(--text-mute)]">
            <span className={cn("transition-colors font-mono", canAdvance ? "text-[var(--olive-text)] font-semibold" : "text-[var(--text-mute)]")}>
              {wordCount} words
            </span>
            {canAdvance && <CheckCircle2 size={11} style={{ color: "var(--olive)" }} />}
          </div>
        </div>

        {/* Editor Container with clipboard interception */}
        <div className="flex-1 rounded-xl overflow-hidden flex flex-col surface relative">
          <EditorToolbar editor={editor} />
          
          <div
            onCopy={(e) => { e.preventDefault(); triggerPasteWarning("Copying text is disabled to protect learning notes!"); }}
            onCut={(e) => { e.preventDefault(); triggerPasteWarning("Cutting text is disabled!"); }}
            onPaste={(e) => { e.preventDefault(); triggerPasteWarning("Pasting is disabled. Write your notes in your own words!"); }}
            className="flex-1 overflow-y-auto p-4"
            style={{ backgroundColor: "var(--bg-input)" }}
          >
            <EditorContent editor={editor} className="tiptap min-h-[300px]" />
          </div>

          {/* Paste Warning Overlay Banner */}
          <AnimatePresence>
            {pasteWarning && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 15 }}
                className="absolute bottom-4 left-4 right-4 bg-[var(--red)] text-white text-xs font-semibold px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 z-30"
              >
                <AlertCircle size={14} className="flex-shrink-0" />
                <span>{pasteWarning}</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {!effectiveCanAdvance && (
          <div className="flex items-center gap-2 text-xs" style={{ color: "var(--text-mute)" }}>
            <AlertCircle size={12} />
            Write at least 30 words of notes to unlock the speaking stage.
          </div>
        )}

        <div className="flex gap-3">
          <button onClick={onAbandon} className="btn-ghost">
            Abandon
          </button>
          <button
            disabled={!effectiveCanAdvance}
            onClick={() => onAdvance(editor?.getHTML() ?? "")}
            className="flex-1 btn-terra"
          >
            <Mic size={14} /> I'm Ready to Speak <ChevronRight size={14} className="ml-1" />
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Stage Speaking ───────────────────────────────────────────────────────────
function StageSpeaking({ session, onComplete, onAbandon }: {
  session: ActiveSession;
  onComplete: (speakingSeconds: number, blob: Blob | null) => void;
  onAbandon: () => void;
}) {
  const TOTAL = 60;
  const [phase, setPhase] = useState<"countdown" | "recording" | "done">("countdown");
  const [countdown, setCountdown] = useState(3);
  const [secondsLeft, setSecondsLeft] = useState(TOTAL);
  const [actualElapsed, setActualElapsed] = useState(0);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [analyser, setAnalyser] = useState<AnalyserNode | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTsRef = useRef(0);
  const { topic } = session;

  // Countdown
  useEffect(() => {
    if (phase !== "countdown") return;
    if (countdown === 0) {
      startRecording();
      return;
    }
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [phase, countdown]);

  async function startRecording() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const audioCtx = new AudioCtx();
      const source = audioCtx.createMediaStreamSource(stream);
      const analyserNode = audioCtx.createAnalyser();
      analyserNode.fftSize = 64;
      source.connect(analyserNode);
      setAnalyser(analyserNode);

      const mimeType = MediaRecorder.isTypeSupported("audio/webm") ? "audio/webm" : "audio/mp4";
      const mr = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = mr;
      chunksRef.current = [];
      mr.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data); };
      mr.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: mimeType });
        setRecordedBlob(blob);
        setAudioUrl(URL.createObjectURL(blob));
        stream.getTracks().forEach((t) => t.stop());
      };
      mr.start(200);
      setPhase("recording");
      startTsRef.current = Date.now();

      intervalRef.current = setInterval(() => {
        const elapsed = Math.floor((Date.now() - startTsRef.current) / 1000);
        const left = Math.max(0, TOTAL - elapsed);
        setSecondsLeft(left);
        if (left === 0) {
          clearInterval(intervalRef.current!);
          stopRecording();
        }
      }, 250);
    } catch (err) {
      setPhase("done");
    }
  }

  function stopRecording() {
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (mediaRecorderRef.current?.state !== "inactive") {
      mediaRecorderRef.current?.stop();
    }
    const finalElapsed = Math.round((Date.now() - startTsRef.current) / 1000);
    setActualElapsed(Math.max(1, Math.min(TOTAL, finalElapsed)));
    setPhase("done");
  }

  const liveElapsed = TOTAL - secondsLeft;

  return (
    <div className="flex flex-col items-center justify-center min-h-[500px] gap-8">
      <AnimatePresence mode="wait">
        {phase === "countdown" && (
          <motion.div
            key="countdown"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 1.2, opacity: 0 }}
            className="flex flex-col items-center gap-4"
          >
            <div className="text-label">Get ready to speak</div>
            <div className="text-9xl font-bold font-space leading-none" style={{ color: "var(--terra)" }}>
              {countdown === 0 ? "Go!" : countdown}
            </div>
            <div className="text-sm max-w-md text-center" style={{ color: "var(--text-dim)" }}>{topic.text}</div>
          </motion.div>
        )}

        {phase === "recording" && (
          <motion.div
            key="recording"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center gap-6 w-full max-w-md"
          >
            <div className="flex items-center gap-2 px-4 py-1.5 rounded-full border" style={{ backgroundColor: "var(--red-bg)", borderColor: "var(--red)" }}>
              <div className="w-2 h-2 rounded-full bg-[#D94F4F] animate-pulse" />
              <span className="text-red-400 text-xs font-semibold uppercase tracking-wider">Active mic</span>
            </div>

            <div className="relative flex items-center justify-center my-4">
              <motion.div
                className="absolute rounded-full border-2 border-[var(--terra)]/20"
                style={{ width: 220, height: 220 }}
                animate={{ scale: [1, 1.08, 1], opacity: [0.2, 0.6, 0.2] }}
                transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
              />
              <motion.div
                className="absolute rounded-full border border-[var(--terra)]/10"
                style={{ width: 240, height: 240 }}
                animate={{ scale: [1, 1.15, 1], opacity: [0.1, 0.3, 0.1] }}
                transition={{ repeat: Infinity, duration: 2, delay: 0.5, ease: "easeInOut" }}
              />
              <TimerRing secondsLeft={secondsLeft} totalSeconds={TOTAL} size={200} strokeWidth={12} />
            </div>

            <Waveform active={true} analyser={analyser} />

            <div className="rounded-2xl p-5 text-center w-full surface">
              <div className="text-label mb-2">Your topic</div>
              <p className="font-space font-bold text-lg leading-snug" style={{ color: "var(--text)" }}>{topic.text}</p>
            </div>

            <div className="w-full flex flex-col gap-2">
              <div className="flex gap-3 w-full">
                <button onClick={onAbandon} className="btn-ghost flex-1">
                  Abandon
                </button>
                <button
                  disabled={liveElapsed < 5}
                  onClick={stopRecording}
                  className="btn-terra flex-1 disabled:opacity-50"
                >
                  <CheckCircle2 size={14} /> Done Speaking
                </button>
              </div>
              {liveElapsed < 5 && (
                <div className="text-[10px] text-[var(--red)] text-center font-semibold">
                  Speak for at least 5 seconds to continue.
                </div>
              )}
            </div>
          </motion.div>
        )}

        {phase === "done" && (
          <motion.div
            key="done"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center gap-6 w-full max-w-md"
          >
            <div className="text-5xl">🎙️</div>
            <h3 className="font-space text-2xl font-bold" style={{ color: "var(--text)" }}>Great job!</h3>
            <p style={{ color: "var(--text-dim)" }} className="text-sm">You spoke for {actualElapsed} seconds.</p>

            {audioUrl && (
              <div className="rounded-xl p-4 w-full surface" style={{ background: "var(--bg-input)" }}>
                <div className="text-label mb-2 flex items-center gap-1.5">
                  <Volume2 size={11} /> Playback
                </div>
                <audio controls src={audioUrl} className="w-full h-8" />
              </div>
            )}

            <div className="flex gap-3 w-full">
              <button
                onClick={() => { setPhase("countdown"); setCountdown(3); setSecondsLeft(TOTAL); setActualElapsed(0); setRecordedBlob(null); setAudioUrl(null); }}
                className="btn-ghost flex-1"
              >
                <RefreshCcw size={13} className="mr-1" /> Retry
              </button>
              <button
                onClick={() => onComplete(actualElapsed, recordedBlob)}
                className="btn-terra flex-1"
              >
                Continue <ChevronRight size={14} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Stage Reflection ─────────────────────────────────────────────────────────
function StageReflection({ session, speakingSeconds, onComplete, onAbandon }: {
  session: ActiveSession;
  speakingSeconds: number;
  onComplete: (data: {
    reflection: { interesting: string; hardest: string; different: string };
    ratings: { confidence: number; understanding: number; communication: number };
  }) => void;
  onAbandon: () => void;
}) {
  const [reflection, setReflection] = useState({ interesting: "", hardest: "", different: "" });
  const [ratings, setRatings] = useState({ confidence: 0, understanding: 0, communication: 0 });

  const canSubmit = ratings.confidence > 0 && ratings.understanding > 0 && ratings.communication > 0;

  function handleSkip() {
    onComplete({
      reflection: {
        interesting: reflection.interesting.trim(),
        hardest: reflection.hardest.trim(),
        different: reflection.different.trim(),
      },
      ratings: {
        confidence: ratings.confidence || 4,
        understanding: ratings.understanding || 4,
        communication: ratings.communication || 4,
      },
    });
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div className="w-16" />
        <div className="text-center">
          <div className="text-4xl mb-3">🧠</div>
          <h2 className="font-serif text-3xl font-bold mb-1" style={{ color: "var(--text)" }}>Reflection</h2>
          <p className="font-serif italic text-sm" style={{ color: "var(--text-dim)" }}>The final step. What did you actually learn?</p>
        </div>
        <button
          type="button"
          onClick={handleSkip}
          className="text-xs font-mono text-[var(--text-dim)] hover:text-[var(--terra)] flex items-center gap-1 transition-colors px-3 py-1.5 rounded-lg border border-[var(--border-dim)] hover:border-[var(--terra)] cursor-pointer"
        >
          <span>Skip</span>
          <ChevronRight size={13} />
        </button>
      </div>

      <div className="space-y-4 mb-8">
        {[
          { key: "interesting", label: "What was the most interesting thing you learned?", placeholder: "Something that surprised you or changed how you think…" },
          { key: "hardest", label: "What was hardest to explain?", placeholder: "Where did your understanding break down?…" },
          { key: "different", label: "What would you explain differently next time?", placeholder: "With more time, how would you do it better?…" },
        ].map((q) => (
          <div key={q.key} className="rounded-2xl p-5 surface">
            <label className="block text-sm font-semibold mb-3" style={{ color: "var(--text)" }}>{q.label}</label>
            <textarea
              placeholder={q.placeholder}
              value={reflection[q.key as keyof typeof reflection]}
              onChange={(e) => setReflection((r) => ({ ...r, [q.key]: e.target.value }))}
              rows={2}
              className="w-full rounded-xl p-3 text-sm placeholder:text-[var(--text-mute)]/60 focus:outline-none surface-input resize-none"
              style={{ color: "var(--text)" }}
            />
          </div>
        ))}
      </div>

      <div className="rounded-2xl p-5 mb-6 surface">
        <div className="text-label mb-5">How did you do?</div>
        <div className="grid grid-cols-3 gap-6">
          <StarRating label="Confidence" value={ratings.confidence} onChange={(v) => setRatings((r) => ({ ...r, confidence: v }))} />
          <StarRating label="Understanding" value={ratings.understanding} onChange={(v) => setRatings((r) => ({ ...r, understanding: v }))} />
          <StarRating label="Communication" value={ratings.communication} onChange={(v) => setRatings((r) => ({ ...r, communication: v }))} />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button onClick={onAbandon} className="btn-ghost text-xs">
          Abandon
        </button>
        <button
          type="button"
          onClick={handleSkip}
          className="btn-ghost text-xs font-mono border border-[var(--border-dim)] hover:border-[var(--text)] hover:text-[var(--text)] transition-all px-4 py-3.5 rounded-xl flex items-center gap-1.5 cursor-pointer"
        >
          <span>Skip Reflection</span>
          <ChevronRight size={13} />
        </button>
        <button
          disabled={!canSubmit}
          onClick={() => onComplete({ reflection, ratings })}
          className="flex-1 btn-terra h-14 font-mono font-medium"
        >
          <Zap size={16} /> Complete &amp; Earn XP
        </button>
      </div>
    </div>
  );
}

// ─── Gamified Count-Up score count animation ─────────────────────────────────
function CountUp({ end, duration = 1200 }: { end: number; duration?: number }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTimestamp: number | null = null;
    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      // Ease out quad
      const easeProgress = progress * (2 - progress);
      setCount(Math.floor(easeProgress * end));
      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    };
    window.requestAnimationFrame(step);
  }, [end, duration]);

  return <>{count}</>;
}

// Helper Star rating with spring scale & custom sparkles
function StarRating({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  interface Sparkle {
    id: number;
    angle: number;
    distance: number;
  }
  const [sparkles, setSparkles] = useState<Record<number, Sparkle[]>>({});

  const handleStarClick = (idx: number) => {
    onChange(idx);
    
    // Generate 6 particles radiating outwards
    const newSparkles = Array.from({ length: 6 }).map((_, i) => ({
      id: Math.random(),
      angle: (i * 60) + (Math.random() * 20 - 10), // even distribution with noise
      distance: 25 + Math.random() * 20,
    }));

    setSparkles((prev) => ({ ...prev, [idx]: newSparkles }));

    // Clean up particles
    setTimeout(() => {
      setSparkles((prev) => {
        const next = { ...prev };
        delete next[idx];
        return next;
      });
    }, 600);
  };

  return (
    <div className="text-center">
      <div className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-mute)] mb-3">{label}</div>
      <div className="flex justify-center gap-1.5">
        {[1, 2, 3, 4, 5].map((i) => {
          const isActive = i <= value;
          return (
            <div key={i} className="relative">
              <motion.button 
                whileTap={{ scale: 1.4 }}
                onClick={() => handleStarClick(i)} 
                className="focus:outline-none block transition-all"
              >
                <motion.div
                  animate={isActive ? { scale: [1, 1.25, 1] } : {}}
                  transition={{ duration: 0.25, ease: "easeOut" }}
                >
                  <Star
                    size={20}
                    className={cn("transition-colors duration-200", isActive ? "text-[var(--gold)] fill-[var(--gold)]" : "text-[var(--text-mute)]/35")}
                  />
                </motion.div>
              </motion.button>

              {/* Sparkle burst particles */}
              <AnimatePresence>
                {sparkles[i]?.map((sp) => {
                  const rad = (sp.angle * Math.PI) / 180;
                  const targetX = Math.cos(rad) * sp.distance;
                  const targetY = Math.sin(rad) * sp.distance;

                  return (
                    <motion.div
                      key={sp.id}
                      initial={{ opacity: 1, scale: 0, x: 0, y: 0 }}
                      animate={{ 
                        opacity: 0, 
                        scale: [0, 1.2, 0.4, 0],
                        x: targetX, 
                        y: targetY 
                      }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.5, ease: "easeOut" }}
                      className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none w-1.5 h-1.5 rounded-full bg-[var(--gold)]"
                    />
                  );
                })}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Completion screen ────────────────────────────────────────────────────────
function StageComplete({
  xpEarned,
  newAchievements,
  streak,
  onNext,
  topicId,
  topicText,
  topicCategory,
  topicDifficulty,
  notes,
  tags,
  speakingSeconds,
}: {
  xpEarned: number;
  newAchievements: string[];
  streak: number;
  onNext: () => void;
  topicId: string;
  topicText: string;
  topicCategory: string;
  topicDifficulty?: string;
  notes?: string;
  tags?: string[];
  speakingSeconds: number;
}) {
  const { ACHIEVEMENTS } = require("@/lib/achievements");
  const unlockedAchs = ACHIEVEMENTS.filter((a: any) => newAchievements.includes(a.id));
  const { toggleFavoriteTopic, settings, profile } = useAppStore();
  const isFav = settings.favoriteTopics?.includes(topicId);
  const [copiedDispatch, setCopiedDispatch] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);

  useEffect(() => { fireConfetti(); }, []);

  const catColor = CATEGORY_COLORS[topicCategory] || "var(--terra)";
  const displayNotes = notes && notes.trim().length > 0
    ? notes.trim()
    : "Understanding proven through Feynman vocal articulation.";

  const sharePayload = {
    topicId,
    topicText,
    category: topicCategory,
    difficulty: topicDifficulty || "Scholar",
    notes: displayNotes,
    author: profile.username || "Scholar",
    date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
    speakingSeconds,
    xpEarned,
    tags: tags || [],
  };

  const shareUrl = (() => {
    try {
      const code = encodeSharedNote(sharePayload);
      const origin = typeof window !== "undefined" && window.location.origin
        ? window.location.origin
        : "https://fey-eight-liard.vercel.app";
      return `${origin}/note/${code}`;
    } catch {
      return "";
    }
  })();

  function handleCopyShareLink() {
    if (!shareUrl) return;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(shareUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  }

  function handleShareDispatch() {
    const dispatch = `🏛️ Fey Daily Sprint · "${topicText}"\n🎙️ ${speakingSeconds}s Spoken Synthesis · ${topicCategory}\n✨ Understanding proven through the Feynman Technique.\n${shareUrl || "https://fey-eight-liard.vercel.app"}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(dispatch);
      setCopiedDispatch(true);
      setTimeout(() => setCopiedDispatch(false), 2500);
    }
  }

  function handleShareTwitter() {
    const tweet = `Read my synthesis on "${topicText}" — written using the Feynman Technique on @FeyPlatform:\n\n`;
    window.open(
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweet)}&url=${encodeURIComponent(shareUrl)}`,
      "_blank"
    );
  }

  function handleShareLinkedIn() {
    window.open(
      `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`,
      "_blank"
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center min-h-[500px] gap-6 text-center max-w-2xl mx-auto"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
        className="text-6xl"
      >
        🏆
      </motion.div>

      <div>
        <h2 className="font-serif text-3xl md:text-4xl font-bold mb-1" style={{ color: "var(--text)" }}>
          Session Complete!
        </h2>
        <p className="font-serif italic text-sm" style={{ color: "var(--text-dim)" }}>
          True understanding proven. Your synthesis is permanently archived.
        </p>
      </div>

      <div className="flex gap-4">
        <motion.div
          initial={{ y: 12, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.25 }}
          className="rounded-2xl px-8 py-5 text-center surface border"
          style={{ borderColor: "var(--border-dim)" }}
        >
          <div className="text-4xl font-bold font-mono" style={{ color: "var(--gold)" }}>
            +<CountUp end={xpEarned} />
          </div>
          <div className="text-xs font-mono mt-1" style={{ color: "var(--text-dim)" }}>XP Earned</div>
        </motion.div>
        <motion.div
          initial={{ y: 12, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="rounded-2xl px-8 py-5 text-center surface border"
          style={{ borderColor: "var(--border-dim)" }}
        >
          <div className="text-4xl font-bold font-mono" style={{ color: "var(--terra)" }}>
            <CountUp end={streak} />
          </div>
          <div className="text-xs font-mono mt-1" style={{ color: "var(--text-dim)" }}>Day Streak</div>
        </motion.div>
      </div>

      {/* ── Prominent Broadside Note Preview Card ── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
        className="w-full text-left rounded-2xl p-6 border surface-raised relative overflow-hidden"
        style={{
          borderColor: "var(--border)",
          background: "var(--bg-card)",
          boxShadow: "0 4px 24px -6px rgba(0,0,0,0.06)",
        }}
      >
        <div className="flex items-center justify-between mb-3 text-[10px] font-mono uppercase tracking-widest text-[var(--text-mute)] border-b pb-2" style={{ borderColor: "var(--border-dim)" }}>
          <div className="flex items-center gap-1.5">
            <Sparkles size={12} className="text-[var(--gold)]" />
            <span className="font-semibold text-[var(--text)]">Your Synthesized Note Preview</span>
          </div>
          <span className="text-[var(--olive)] font-semibold flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--olive)] animate-pulse" />
            Ready to Share
          </span>
        </div>

        <div className="flex items-center gap-2 mb-2.5 flex-wrap">
          <span
            className="tag text-[10px] font-mono font-bold"
            style={{
              backgroundColor: `${catColor}18`,
              color: catColor,
              border: `1px solid ${catColor}30`,
            }}
          >
            {CATEGORY_ICONS[topicCategory] || "📜"} {topicCategory}
          </span>
          {topicDifficulty && (
            <span className="tag tag-olive text-[10px] font-mono">
              {topicDifficulty}
            </span>
          )}
          {speakingSeconds > 0 && (
            <span className="tag tag-gold text-[10px] font-mono flex items-center gap-1">
              <Mic size={9} />
              <span>{speakingSeconds}s Spoken Synthesis</span>
            </span>
          )}
        </div>

        <h3 className="font-serif font-bold text-lg mb-2.5 leading-snug" style={{ color: "var(--text)" }}>
          {topicText}
        </h3>

        <div className="rounded-xl p-4 surface border mb-4" style={{ borderColor: "var(--border-dim)", background: "var(--bg-panel)" }}>
          <p className="font-serif italic text-xs sm:text-sm leading-relaxed text-[var(--text-dim)] whitespace-pre-wrap max-h-40 overflow-y-auto">
            &ldquo;{displayNotes}&rdquo;
          </p>
          <div className="mt-3 pt-2 border-t text-[10px] font-mono text-[var(--text-mute)] flex items-center justify-between" style={{ borderColor: "var(--border-dim)" }}>
            <span>Scholar {profile.username || "Scholar"}</span>
            <span>Fey Academic Archive</span>
          </div>
        </div>

        {/* Action controls directly inside the preview card */}
        <div className="flex items-center justify-between gap-3 pt-1 flex-wrap">
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyShareLink}
              className="btn-terra px-4 py-2 text-xs font-mono rounded-lg flex items-center gap-1.5 cursor-pointer shadow-sm hover:opacity-90 transition-opacity"
            >
              {copiedLink ? <Check size={13} /> : <Share2 size={13} />}
              <span>{copiedLink ? "✓ Copied Public Link!" : "Copy Public Link"}</span>
            </button>

            {shareUrl && (
              <a
                href={shareUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-ghost px-3 py-2 text-xs font-mono rounded-lg border border-[var(--border-dim)] hover:border-[var(--text)] transition-colors flex items-center gap-1.5"
              >
                <span>View Full Page</span>
                <ExternalLink size={12} />
              </a>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleShareTwitter}
              className="px-3 py-1.5 rounded-lg text-xs font-mono border border-[var(--border-dim)] hover:border-[var(--text)] text-[var(--text-dim)] transition-colors cursor-pointer"
              title="Post to X / Twitter"
            >
              Post to X
            </button>
            <button
              onClick={handleShareLinkedIn}
              className="px-3 py-1.5 rounded-lg text-xs font-mono border border-[var(--border-dim)] hover:border-[var(--text)] text-[var(--text-dim)] transition-colors cursor-pointer"
              title="Share on LinkedIn"
            >
              LinkedIn
            </button>
          </div>
        </div>
      </motion.div>

      {/* Constellation star notification */}
      <div
        className="p-3.5 rounded-xl border flex items-center justify-between gap-4 w-full surface"
        style={{ borderColor: "var(--border-dim)" }}
      >
        <div className="flex items-center gap-2.5 text-left">
          <span className="text-xl select-none">✨</span>
          <div>
            <div className="text-xs font-bold font-serif" style={{ color: "var(--text)" }}>
              New Star Ignited
            </div>
            <div className="text-[11px] font-mono" style={{ color: "var(--text-mute)" }}>
              Added to your {topicCategory} constellation cluster
            </div>
          </div>
        </div>
        <a
          href="/constellation"
          className="text-xs font-mono font-semibold hover:underline"
          style={{ color: "var(--terra)" }}
        >
          View Map →
        </a>
      </div>

      <div className="flex gap-3 flex-wrap justify-center">
        <button
          onClick={handleShareDispatch}
          className="btn-ghost flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl border cursor-pointer font-mono"
          style={{ borderColor: "var(--border-dim)" }}
        >
          <span>{copiedDispatch ? "✓ Copied Dispatch!" : "📋 Copy Text Feynman Card"}</span>
        </button>

        <button
          onClick={() => toggleFavoriteTopic(topicId)}
          className={cn(
            "btn-ghost flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl border cursor-pointer font-mono",
            isFav && "border-yellow-500/30 bg-yellow-500/5 text-yellow-600"
          )}
        >
          <Star size={13} className={isFav ? "fill-yellow-500 text-yellow-500" : "text-gray-400"} />
          {isFav ? "Favorited" : "Save Topic"}
        </button>
      </div>

      <ShareNoteModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        note={sharePayload}
      />

      {unlockedAchs.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="rounded-2xl p-5 surface"
        >
          <div className="text-label mb-3">🎉 Achievements unlocked!</div>
          <div className="flex flex-wrap gap-2 justify-center">
            {unlockedAchs.map((a: any) => (
              <div key={a.id} className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold tag tag-gold">
                <span>{a.icon}</span>
                <span>{a.title}</span>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      <button
        onClick={onNext}
        className="btn-terra h-14 w-64"
      >
        Back to Dashboard <ChevronRight size={16} />
      </button>
    </motion.div>
  );
}

const stageSlideVariants = {
  enter: {
    x: 80,
    opacity: 0,
  },
  center: {
    x: 0,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 260,
      damping: 24,
    }
  },
  exit: {
    x: -80,
    opacity: 0,
    transition: {
      duration: 0.16,
    }
  },
};

// ─── Main session page ────────────────────────────────────────────────────────
export default function SessionPage({ params }: { params: Promise<{ id: string }> }) {
  const unwrappedParams = use(params);
  const router = useRouter();
  const { activeSession, updateActiveSessionStage, updateNotes, completeSession, abandonSession, streak } = useAppStore();
  const [speakingSeconds, setSpeakingSeconds] = useState(0);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [completionData, setCompletionData] = useState<{ xpEarned: number; newAchievements: string[] } | null>(null);
  const [completedSession, setCompletedSession] = useState<ActiveSession | null>(null);

  const currentSession = activeSession || completedSession;

  const STAGES = ["research", "speaking", "reflection", "complete"] as const;
  const stageIndex = completionData
    ? 3
    : currentSession?.stage === "research" ? 0
    : currentSession?.stage === "speaking" ? 1
    : 2;

  useEffect(() => {
    if (completionData) return;
    if (!activeSession || activeSession.id !== unwrappedParams.id) {
      router.replace("/discover");
    }
  }, [activeSession, unwrappedParams.id, router, completionData]);

  if (!currentSession && !completionData) return null;
  if (!currentSession) return null;

  function handleResearchDone(notes: string) {
    updateNotes(notes);
    updateActiveSessionStage("speaking");
  }

  function handleSpeakDone(secs: number, blob: Blob | null) {
    setSpeakingSeconds(secs);
    setRecordedBlob(blob);
    updateActiveSessionStage("reflection");
  }

  async function handleReflectionDone(data: {
    reflection: { interesting: string; hardest: string; different: string };
    ratings: { confidence: number; understanding: number; communication: number };
  }) {
    if (!activeSession) return;
    
    // Preserve snapshot so completion screen renders smoothly without null dereference
    setCompletedSession({ ...activeSession });

    let audioBase64 = undefined;
    if (recordedBlob) {
      try {
        audioBase64 = await blobToBase64(recordedBlob);
      } catch (err) {
        console.error("Audio conversion to base64 failed", err);
      }
    }

    const result = completeSession({
      notes: activeSession.notes,
      speakingSeconds,
      reflection: data.reflection,
      ratings: data.ratings,
      audioBase64,
    });
    setCompletionData(result);
    fireConfetti();
  }

  function handleAbandon() {
    abandonSession();
    router.push("/");
  }

  const stageLabels = ["Research", "Speak", "Reflect", "Done"];

  return (
    <div className="min-h-screen p-8 max-w-5xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <button onClick={handleAbandon} className="flex items-center gap-1.5 text-xs font-semibold hover:text-[var(--text)] transition-colors" style={{ color: "var(--text-dim)" }}>
          <ArrowLeft size={13} /> Leave session
        </button>

        {/* Stage progress */}
        <div className="flex items-center gap-2">
          {stageLabels.map((label, i) => (
            <div key={i} className="flex items-center gap-2">
              <div className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all border",
                i < stageIndex ? "bg-[var(--bg-input)] border-[var(--olive)] text-[var(--olive-text)]" :
                i === stageIndex ? "border-[var(--terra)] bg-[var(--terra-bg)] text-[var(--terra)] font-bold" :
                "border-transparent text-[var(--text-mute)]"
              )}>
                {i < stageIndex && <CheckCircle2 size={11} style={{ color: "var(--olive-br)" }} />}
                {label}
              </div>
              {i < stageLabels.length - 1 && <ChevronRight size={12} className="text-[var(--text-mute)]/30" />}
            </div>
          ))}
        </div>

        <div className="w-32" />
      </div>

      {/* Stage content */}
      <AnimatePresence mode="wait">
        {completionData ? (
          <motion.div key="complete" variants={stageSlideVariants} initial="enter" animate="center" exit="exit">
            <StageComplete
              xpEarned={completionData.xpEarned}
              newAchievements={completionData.newAchievements}
              streak={streak.current}
              onNext={() => router.push("/")}
              topicId={currentSession.topic.id}
              topicText={currentSession.topic.text}
              topicCategory={currentSession.topic.category}
              topicDifficulty={currentSession.topic.difficulty}
              notes={currentSession.notes}
              tags={currentSession.topic.tags}
              speakingSeconds={speakingSeconds}
            />
          </motion.div>
        ) : currentSession.stage === "research" ? (
          <motion.div key="research" variants={stageSlideVariants} initial="enter" animate="center" exit="exit">
            <StageResearch session={currentSession} onAdvance={handleResearchDone} onAbandon={handleAbandon} />
          </motion.div>
        ) : currentSession.stage === "speaking" ? (
          <motion.div key="speaking" variants={stageSlideVariants} initial="enter" animate="center" exit="exit">
            <StageSpeaking session={currentSession} onComplete={handleSpeakDone} onAbandon={handleAbandon} />
          </motion.div>
        ) : (
          <motion.div key="reflection" variants={stageSlideVariants} initial="enter" animate="center" exit="exit">
            <StageReflection
              session={currentSession}
              speakingSeconds={speakingSeconds}
              onComplete={handleReflectionDone}
              onAbandon={handleAbandon}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
