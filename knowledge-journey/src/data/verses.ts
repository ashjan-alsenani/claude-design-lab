// Verse excerpts exactly as cited in the textbook pages (pp. 74–75).
// Text: Tanzil Uthmani script, retrieved from api.alquran.cloud (edition "quran-uthmani").
// Excerpts were sliced word-by-word from the full ayah text by a script — never retype by hand.

export interface Verse {
  id: string;
  ref: string;
  surah: string;
  ayah: string;
  text: string;
}

export const VERSES = {
  hijr9: { id: "hijr9", ref: "15:9", surah: "الحجر", ayah: "9", text: "إِنَّا نَحْنُ نَزَّلْنَا ٱلذِّكْرَ وَإِنَّا لَهُۥ لَحَٰفِظُونَ" },
  nahl89: { id: "nahl89", ref: "16:89", surah: "النحل", ayah: "89", text: "وَنَزَّلْنَا عَلَيْكَ ٱلْكِتَٰبَ تِبْيَٰنًۭا لِّكُلِّ شَىْءٍۢ" },
  anam38: { id: "anam38", ref: "6:38", surah: "الأنعام", ayah: "38", text: "مَّا فَرَّطْنَا فِى ٱلْكِتَٰبِ مِن شَىْءٍۢ" },
  hud1: { id: "hud1", ref: "11:1", surah: "هود", ayah: "1", text: "كِتَٰبٌ أُحْكِمَتْ ءَايَٰتُهُۥ ثُمَّ فُصِّلَتْ مِن لَّدُنْ حَكِيمٍ خَبِيرٍ" },
  hashr7: { id: "hashr7", ref: "59:7", surah: "الحشر", ayah: "7", text: "وَمَآ ءَاتَىٰكُمُ ٱلرَّسُولُ فَخُذُوهُ وَمَا نَهَىٰكُمْ عَنْهُ فَٱنتَهُوا۟" },
  nisa80: { id: "nisa80", ref: "4:80", surah: "النساء", ayah: "80", text: "مَّن يُطِعِ ٱلرَّسُولَ فَقَدْ أَطَاعَ ٱللَّهَ" },
  nur63: { id: "nur63", ref: "24:63", surah: "النور", ayah: "63", text: "فَلْيَحْذَرِ ٱلَّذِينَ يُخَالِفُونَ عَنْ أَمْرِهِۦٓ أَن تُصِيبَهُمْ فِتْنَةٌ أَوْ يُصِيبَهُمْ عَذَابٌ أَلِيمٌ" },
  hujurat10: { id: "hujurat10", ref: "49:10", surah: "الحجرات", ayah: "10", text: "إِنَّمَا ٱلْمُؤْمِنُونَ إِخْوَةٌۭ" },
} satisfies Record<string, Verse>;

export type VerseId = keyof typeof VERSES;
