/* Progress + lab persistence. Local to this browser and device only. */
const STORE_KEY = 'omantel-clickup-hub:v1';

const Store = (() => {
  let storageOK = false;
  try {
    const k = '__probe__' + Date.now();
    window.localStorage.setItem(k, '1');
    window.localStorage.removeItem(k);
    storageOK = true;
  } catch (e) { storageOK = false; }

  const blank = () => ({
    v: 1, lessons: {}, bookmarks: [], last: null, quizzes: {}, final: null,
    practical: null, challenges: {}, lab: null, startedAt: Date.now()
  });

  let state = blank();
  if (storageOK) {
    try {
      const raw = window.localStorage.getItem(STORE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && parsed.v === 1) state = Object.assign(blank(), parsed);
      }
    } catch (e) { /* corrupted: start fresh, keep working */ }
  }

  const listeners = new Set();
  let saveTimer = null;
  function persist() {
    if (!storageOK) return;
    clearTimeout(saveTimer);
    saveTimer = setTimeout(() => {
      try { window.localStorage.setItem(STORE_KEY, JSON.stringify(state)); }
      catch (e) { storageOK = false; emit('storage'); }
    }, 120);
  }
  function emit(kind) { listeners.forEach(fn => { try { fn(kind); } catch (e) { console.error(e); } }); }

  function lesson(id) { return state.lessons[id] || (state.lessons[id] = { watched: false, practiced: false, checked: null, done: null }); }

  return {
    get ok() { return storageOK; },
    get state() { return state; },
    on(fn) { listeners.add(fn); return () => listeners.delete(fn); },
    save(kind) { persist(); emit(kind || 'change'); },
    lesson,
    lessonState(id) { return state.lessons[id] || { watched: false, practiced: false, checked: null, done: null }; },
    mark(id, key, value) {
      const l = lesson(id);
      if (l[key] === value) return;
      l[key] = value;
      this.save('lesson');
    },
    complete(id) { const l = lesson(id); if (!l.done) { l.done = Date.now(); this.save('lesson'); } },
    uncomplete(id) { const l = lesson(id); l.done = null; this.save('lesson'); },
    isDone(id) { return !!(state.lessons[id] && state.lessons[id].done); },
    visit(id) { state.last = { lesson: id, at: Date.now() }; this.save('visit'); },
    toggleBookmark(id) {
      const i = state.bookmarks.indexOf(id);
      if (i >= 0) state.bookmarks.splice(i, 1); else state.bookmarks.push(id);
      this.save('bookmark');
      return i < 0;
    },
    isBookmarked(id) { return state.bookmarks.includes(id); },
    recordQuiz(key, score, total) {
      const prev = key === 'final' ? state.final : state.quizzes[key];
      const rec = {
        best: Math.max(prev ? prev.best : 0, score), last: score, total,
        attempts: (prev ? prev.attempts : 0) + 1, at: Date.now()
      };
      if (key === 'final') state.final = rec; else state.quizzes[key] = rec;
      this.save('quiz');
      return rec;
    },
    completeChallenge(id) { if (!state.challenges[id]) { state.challenges[id] = Date.now(); this.save('challenge'); return true; } return false; },
    setPractical() { if (!state.practical) { state.practical = { done: Date.now() }; this.save('challenge'); } },
    setLab(lab) { state.lab = lab; persist(); },
    resetAll() {
      state = blank();
      if (storageOK) { try { window.localStorage.removeItem(STORE_KEY); } catch (e) { /* ignore */ } }
      emit('reset');
    }
  };
})();
