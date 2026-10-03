/**
 * Read English aloud with the browser's built-in speech (Web Speech API).
 * Free, offline on most devices, no keys. If the device has no voice,
 * the 🔊 buttons simply don't appear.
 */
let voice: SpeechSynthesisVoice | null = null;
let arVoice: SpeechSynthesisVoice | null | undefined;

export function canSpeak(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window;
}

function pickVoice(): SpeechSynthesisVoice | null {
  if (voice) return voice;
  const all = window.speechSynthesis.getVoices();
  const en = all.filter((v) => v.lang.toLowerCase().startsWith('en'));
  voice = en.find((v) => /en-gb/i.test(v.lang)) ?? en.find((v) => /en-us/i.test(v.lang)) ?? en[0] ?? null;
  return voice;
}

if (canSpeak()) {
  window.speechSynthesis.addEventListener?.('voiceschanged', () => {
    voice = null;
    arVoice = undefined;
  });
}

function pickArabic(): SpeechSynthesisVoice | null {
  if (arVoice !== undefined) return arVoice;
  const all = window.speechSynthesis.getVoices();
  if (!all.length) return null;
  arVoice = all.find((v) => /^ar[-_](OM|SA|AE)/i.test(v.lang)) ?? all.find((v) => v.lang.toLowerCase().startsWith('ar')) ?? null;
  return arVoice;
}

/** The device has an Arabic voice (many phones and tablets do). */
export function canSpeakArabic(): boolean {
  return canSpeak() && Boolean(pickArabic());
}

/** True for text that is English (Latin letters and no Arabic). */
export function isEnglish(text: string | undefined): text is string {
  return Boolean(text) && /[A-Za-z]/.test(text!) && !/[؀-ۿ]/.test(text!);
}

/** Speak a word or sentence. `slow` reads it more slowly for listening practice. */
export function speak(text: string, opts: { slow?: boolean; onEnd?: () => void; lang?: 'en' | 'ar' } = {}) {
  if (!canSpeak()) return;
  const synth = window.speechSynthesis;
  synth.cancel();
  // emoji and symbols are not read aloud
  const clean = text.replace(/[\p{Extended_Pictographic}\u{FE0F}]/gu, '').replace(/___/g, ' … ').trim();
  const u = new SpeechSynthesisUtterance(clean);
  const v = opts.lang === 'ar' ? pickArabic() : pickVoice();
  if (v) u.voice = v;
  u.lang = v?.lang ?? (opts.lang === 'ar' ? 'ar' : 'en-GB');
  u.rate = opts.slow ? 0.7 : 0.9;
  u.pitch = 1.05;
  if (opts.onEnd) {
    u.onend = opts.onEnd;
    u.onerror = opts.onEnd;
  }
  synth.speak(u);
}

export function stopSpeaking() {
  if (canSpeak()) window.speechSynthesis.cancel();
}
