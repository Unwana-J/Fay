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
 * Classic game buzzer sound effect (low frequency detuned sawtooth buzz).
 * Plays immediately across all active participants when the round timer reaches 0.
 */
export function playBuzzerSound() {
  if (typeof window === "undefined") return;

  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;

    const ctx = new AudioCtx();
    if (ctx.state === "suspended") {
      ctx.resume().catch(() => {});
    }

    const now = ctx.currentTime;
    const duration = 0.65;

    // Dual detuned sawtooth oscillators create an authentic physical board-game buzzer tone
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gain = ctx.createGain();

    osc1.type = "sawtooth";
    osc1.frequency.setValueAtTime(135, now);
    osc1.frequency.linearRampToValueAtTime(120, now + duration);

    osc2.type = "sawtooth";
    osc2.frequency.setValueAtTime(142, now);
    osc2.frequency.linearRampToValueAtTime(127, now + duration);

    // Filter to soften extreme high-pitch harshness while keeping the buzzy body
    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(800, now);

    // Gain envelope: fast punchy attack, sustained loud buzz, quick cutoff
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

    // Clean up AudioContext once playback finishes
    setTimeout(() => {
      try {
        ctx.close();
      } catch {}
    }, (duration + 0.2) * 1000);

    // Synchronized mobile haptic vibration
    try {
      navigator.vibrate?.([200, 80, 250]);
    } catch {}
  } catch {
    // Autoplay restrictions or unsupported environment fail gracefully
  }
}

