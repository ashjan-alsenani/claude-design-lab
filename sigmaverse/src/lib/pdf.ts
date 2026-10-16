import { del, get, set } from 'idb-keyval'
import type { PDFDocumentProxy } from 'pdfjs-dist'
import type { SourceId } from '../data/types'

export interface LibraryDoc {
  id: string
  name: string
  size: number
  pageCount: number
  addedAt: number
  /** 'supplied' = the learner's own copy of a document used to build the academy. 'upload' = any other PDF. */
  kind: 'supplied' | 'upload'
  sourceId?: SourceId
  textIndexed: boolean
}

const INDEX = 'sv.library.index'

let pdfjsPromise: Promise<typeof import('pdfjs-dist')> | null = null
export function pdfjs() {
  if (!pdfjsPromise) {
    pdfjsPromise = Promise.all([import('pdfjs-dist'), import('pdfjs-dist/build/pdf.worker.min.mjs?url')]).then(([lib, worker]) => {
      lib.GlobalWorkerOptions.workerSrc = (worker as { default: string }).default
      return lib
    })
  }
  return pdfjsPromise
}

export async function listDocs(): Promise<LibraryDoc[]> {
  try { return (await get<LibraryDoc[]>(INDEX)) ?? [] } catch { return [] }
}

async function saveIndex(docs: LibraryDoc[]) { await set(INDEX, docs) }

export async function addPdf(file: File, kind: LibraryDoc['kind'], sourceId?: SourceId): Promise<LibraryDoc> {
  if (file.type && file.type !== 'application/pdf') throw new Error('Only PDF files can be added.')
  const buf = await file.arrayBuffer()
  const lib = await pdfjs()
  const doc = await lib.getDocument({ data: buf.slice(0) }).promise
  const entry: LibraryDoc = { id: `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`, name: file.name, size: file.size, pageCount: doc.numPages, addedAt: Date.now(), kind, sourceId, textIndexed: false }
  await set(`sv.library.file.${entry.id}`, new Blob([buf], { type: 'application/pdf' }))
  const docs = await listDocs()
  // Only one stored copy per supplied source.
  const kept = sourceId ? docs.filter(d => d.sourceId !== sourceId) : docs
  for (const d of docs) if (sourceId && d.sourceId === sourceId) await removeDoc(d.id, false)
  await saveIndex([...kept, entry])
  await doc.loadingTask.destroy()
  return entry
}

export async function removeDoc(id: string, updateIndex = true) {
  await del(`sv.library.file.${id}`)
  await del(`sv.library.text.${id}`)
  if (updateIndex) await saveIndex((await listDocs()).filter(d => d.id !== id))
}

export async function openDoc(id: string): Promise<PDFDocumentProxy> {
  const blob = await get<Blob>(`sv.library.file.${id}`)
  if (!blob) throw new Error('This PDF is no longer stored in this browser.')
  const lib = await pdfjs()
  return lib.getDocument({ data: await blob.arrayBuffer() }).promise
}

/** Extracts and caches the text of every page (client-side, no upload). */
export async function pageTexts(id: string, pdf: PDFDocumentProxy, onProgress?: (done: number, total: number) => void): Promise<string[]> {
  const cached = await get<string[]>(`sv.library.text.${id}`)
  if (cached) return cached
  const out: string[] = []
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i)
    const tc = await page.getTextContent()
    out.push(tc.items.map(it => ('str' in it ? it.str : '')).join(' ').replace(/\s+/g, ' '))
    page.cleanup()
    if (i % 5 === 0) onProgress?.(i, pdf.numPages)
  }
  await set(`sv.library.text.${id}`, out)
  const docs = await listDocs()
  await saveIndex(docs.map(d => (d.id === id ? { ...d, textIndexed: true } : d)))
  return out
}

export function storageEstimate(): Promise<{ usage: number; quota: number } | null> {
  if (!navigator.storage?.estimate) return Promise.resolve(null)
  return navigator.storage.estimate().then(e => ({ usage: e.usage ?? 0, quota: e.quota ?? 0 })).catch(() => null)
}
