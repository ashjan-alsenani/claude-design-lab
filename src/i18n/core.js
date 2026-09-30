/* ==========================================================================
   Bilingual core. One shared content model: Arabic is authored in
   src/content/, English overlays in src/content/en/ address the same IDs.
   Switching language re-applies the matching overlay in place, so lesson,
   question and task IDs, answers and progress never change.
   ========================================================================== */

let LANG = 'ar';
const LANG_META = {
  ar: { dir: 'rtl', name: 'العربية', html: 'ar' },
  en: { dir: 'ltr', name: 'English', html: 'en' }
};
const isEN = () => LANG === 'en';
const isRTL = () => LANG !== 'en';
/* Inline UI string: tx('عربي', 'English') */
function tx(ar, en) { return LANG === 'en' ? en : ar; }

const I18N = (() => {
  const pairs = [];
  const errors = [];

  // Arrays can be addressed by index or by an element's id, key or English term.
  function slot(target, k) {
    if (!Array.isArray(target)) return k;
    if (/^\d+$/.test(k)) return +k;
    return target.findIndex(el => el && (el.id === k || el.key === k || el.en === k));
  }
  function capture(target, src, path) {
    const out = Array.isArray(src) ? [] : {};
    Object.keys(src).forEach(k => {
      const i = slot(target, k); const sv = src[k];
      const tv = target == null || i === -1 ? undefined : target[i];
      if (tv === undefined) { errors.push('missing ' + path + '.' + k); return; }
      if (sv !== null && typeof sv === 'object') {
        if (typeof tv !== 'object' || tv === null) { errors.push('shape ' + path + '.' + k); return; }
        out[k] = capture(tv, sv, path + '.' + k);
      } else out[k] = tv;
    });
    return out;
  }
  function apply(target, src) {
    Object.keys(src).forEach(k => {
      const i = slot(target, k); if (i === -1 || target[i] === undefined) return;
      const sv = src[k];
      if (sv !== null && typeof sv === 'object') apply(target[i], sv);
      else target[i] = sv;
    });
  }
  return {
    errors,
    register(name, target, en) { pairs.push({ name, target, en, ar: capture(target, en, name) }); },
    set(lang) { pairs.forEach(p => apply(p.target, lang === 'en' ? p.en : p.ar)); }
  };
})();

/* Demo action strings (typed text, replaced labels) translated by lookup */
const DEMO_EN = {};
const HAS_AR = /[؀-ۿ]/;
function demoStr(s) {
  if (typeof s !== 'string' || LANG !== 'en' || !HAS_AR.test(s)) return s;
  if (DEMO_EN[s] == null) { I18N.errors.push('demo: ' + s); return s; }
  return DEMO_EN[s];
}

/* In-memory UI state (quiz answers, exercise progress, demo position, open
   panels). It survives a language switch and is cleared on normal navigation,
   so switching language never resets what the learner is doing. */
const UIState = (() => {
  let bag = {};
  return { get: k => bag[k], set: (k, v) => { bag[k] = v; }, clear: () => { bag = {}; } };
})();
