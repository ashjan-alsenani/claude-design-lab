/** Lesson numbers like "1-2" must stay left-to-right inside Arabic text (otherwise they show as "2-1"). */
export function lessonNo(id: string): string {
  return `⁦${id}⁩`;
}
