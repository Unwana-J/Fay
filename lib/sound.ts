import { BuzzerSoundType } from "./articulate-room";

/**
 * Lightweight browser AudioContext tone generator for quiz and game feedback.
 */
export function playAudioTone(
  frequency: number = 440,
  type: OscillatorType = "sine",
  durationSeconds: number = 0.15
) {
  if (typeof window === "undefined") return;

  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;

    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(frequency, ctx.currentTime);

    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + durationSeconds);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + durationSeconds);
  } catch {
    // Ignore audio autoplay restrictions gracefully
  }
}

/**
 * Synthesizes a customizable buzzer sound effect using the Web Audio API with zero asset downloads.
 * Plays across all active participants when the round timer reaches 0.
 *
 * Supported sound types:
 * - "classic": Vintage electric board-game dual-sawtooth vibrating buzz
 * - "airhorn": Hype triple-blast DJ stadium party horn
 * - "bell": Boxing round triple metallic bell ding
 * - "gong": Deep cinematic bronze temple gong strike
 * - "arcade": Retro 8-bit downward chiptune game over zap
 */
export function playBuzzerSound(soundType: BuzzerSoundType = "classic") {
  if (typeof window === "undefined") return;

  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;

    const ctx = new AudioCtx();
    if (ctx.state === "suspended") {
      ctx.resume().catch(() => {});
    }

    const now = ctx.currentTime;

    if (soundType === "airhorn") {
      // Triple blast DJ airhorn (short, short, long blast)
      const blasts = [
        { start: 0, duration: 0.13, haptic: 100 },
        { start: 0.17, duration: 0.13, haptic: 100 },
        { start: 0.34, duration: 0.38, haptic: 250 },
      ];

      blasts.forEach(({ start, duration }) => {
        const t = now + start;
        // Dominant Bb4 (466Hz) + sub-fifth F4 (349Hz) + shimmer octave Bb5 (932Hz)
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const osc3 = ctx.createOscillator();
        const blastGain = ctx.createGain();

        osc1.type = "sawtooth";
        osc1.frequency.setValueAtTime(466, t);
        osc1.frequency.exponentialRampToValueAtTime(480, t + 0.04);
        osc1.frequency.setValueAtTime(466, t + duration);

        osc2.type = "sawtooth";
        osc2.frequency.setValueAtTime(349, t);
        osc2.frequency.exponentialRampToValueAtTime(359, t + 0.04);
        osc2.frequency.setValueAtTime(349, t + duration);

        osc3.type = "square";
        osc3.frequency.setValueAtTime(932, t);

        blastGain.gain.setValueAtTime(0.01, t);
        blastGain.gain.linearRampToValueAtTime(0.25, t + 0.02);
        blastGain.gain.setValueAtTime(0.25, t + duration - 0.03);
        blastGain.gain.linearRampToValueAtTime(0.001, t + duration);

        const filter = ctx.createBiquadFilter();
        filter.type = "bandpass";
        filter.frequency.setValueAtTime(700, t);
        filter.Q.setValueAtTime(1.2, t);

        osc1.connect(blastGain);
        osc2.connect(blastGain);
        osc3.connect(blastGain);
        blastGain.connect(filter);
        filter.connect(ctx.destination);

        osc1.start(t);
        osc2.start(t);
        osc3.start(t);
        osc1.stop(t + duration);
        osc2.stop(t + duration);
        osc3.stop(t + duration);
      });

      try {
        navigator.vibrate?.([100, 50, 100, 50, 250]);
      } catch {}

      setTimeout(() => {
        try { ctx.close(); } catch {}
      }, 1000);
      return;
    }

    if (soundType === "bell") {
      // Triple crisp boxing round championship bell
      const dings = [0, 0.22, 0.44];
      dings.forEach((offset) => {
        const t = now + offset;
        const freqs = [880, 1760, 2480]; // Fundamental A5 + metallic overtones
        freqs.forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = "sine";
          osc.frequency.setValueAtTime(freq, t);

          const vol = idx === 0 ? 0.3 : 0.12 / (idx + 1);
          gain.gain.setValueAtTime(vol, t);
          gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.35);

          osc.connect(gain);
          gain.connect(ctx.destination);

          osc.start(t);
          osc.stop(t + 0.38);
        });
      });

      try {
        navigator.vibrate?.([80, 120, 80, 120, 100]);
      } catch {}

      setTimeout(() => {
        try { ctx.close(); } catch {}
      }, 1100);
      return;
    }

    if (soundType === "gong") {
      // Deep resonant bronze temple gong
      const duration = 1.4;
      const gongFreqs = [110, 165, 220, 335]; // Deep fundamental + minor third resonance

      gongFreqs.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = idx === 0 ? "sawtooth" : "sine";
        osc.frequency.setValueAtTime(freq, now);
        osc.frequency.exponentialRampToValueAtTime(freq * 0.98, now + duration);

        const filter = ctx.createBiquadFilter();
        filter.type = "lowpass";
        filter.frequency.setValueAtTime(320 + idx * 80, now);

        const vol = idx === 0 ? 0.35 : 0.18;
        gain.gain.setValueAtTime(0.01, now);
        gain.gain.linearRampToValueAtTime(vol, now + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now);
        osc.stop(now + duration);
      });

      try {
        navigator.vibrate?.([400]);
      } catch {}

      setTimeout(() => {
        try { ctx.close(); } catch {}
      }, 1600);
      return;
    }

    if (soundType === "arcade") {
      // 8-bit retro arcade downward timeout zap
      const notes = [
        { freq: 659, dur: 0.07 },
        { freq: 523, dur: 0.07 },
        { freq: 415, dur: 0.07 },
        { freq: 311, dur: 0.07 },
        { freq: 220, dur: 0.09 },
        { freq: 110, dur: 0.22 },
      ];

      let elapsed = 0;
      notes.forEach(({ freq, dur }, i) => {
        const t = now + elapsed;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = "square";
        osc.frequency.setValueAtTime(freq, t);
        if (i === notes.length - 1) {
          osc.frequency.exponentialRampToValueAtTime(55, t + dur);
        }

        gain.gain.setValueAtTime(0.22, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + dur);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(t);
        osc.stop(t + dur);

        elapsed += dur;
      });

      try {
        navigator.vibrate?.([90, 40, 90, 40, 160]);
      } catch {}

      setTimeout(() => {
        try { ctx.close(); } catch {}
      }, (elapsed + 0.2) * 1000);
      return;
    }

    // Default "classic" board-game physical buzzer
    const duration = 0.65;
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gain = ctx.createGain();

    osc1.type = "sawtooth";
    osc1.frequency.setValueAtTime(135, now);
    osc1.frequency.linearRampToValueAtTime(120, now + duration);

    osc2.type = "sawtooth";
    osc2.frequency.setValueAtTime(142, now);
    osc2.frequency.linearRampToValueAtTime(127, now + duration);

    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(800, now);

    gain.gain.setValueAtTime(0.01, now);
    gain.gain.linearRampToValueAtTime(0.32, now + 0.03);
    gain.gain.setValueAtTime(0.32, now + duration - 0.08);
    gain.gain.linearRampToValueAtTime(0.001, now + duration);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(filter);
    filter.connect(ctx.destination);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + duration);
    osc2.stop(now + duration);

    setTimeout(() => {
      try {
        ctx.close();
      } catch {}
    }, (duration + 0.2) * 1000);

    try {
      navigator.vibrate?.([200, 80, 250]);
    } catch {}
  } catch {
    // Autoplay restrictions or unsupported environment fail gracefully
  }
}
