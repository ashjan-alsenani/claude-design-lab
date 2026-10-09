import { Fragment } from 'react';
import { VERSES, type VerseId } from '../data/verses';

/** Renders text, turning [[verseId]] tokens into Uthmani-script verse quotes with references. */
export function RichText({ text, className }: { text: string; className?: string }) {
  const parts = text.split(/\[\[(\w+)\]\]/g);
  return (
    <span className={className}>
      {parts.map((p, i) => {
        if (i % 2 === 0) return <Fragment key={i}>{p}</Fragment>;
        const v = VERSES[p as VerseId];
        if (!v) return <Fragment key={i}>{`[[${p}]]`}</Fragment>;
        return <VerseQuote key={i} id={p as VerseId} />;
      })}
    </span>
  );
}

export function VerseQuote({ id, block = false }: { id: VerseId; block?: boolean }) {
  const v = VERSES[id];
  const Tag = block ? 'p' : 'span';
  return (
    <Tag className="verse-wrap" style={block ? { margin: '0.4em 0 0' } : undefined}>
      <span className="verse" lang="ar">
        ﴿{v.text}﴾
      </span>{' '}
      <span className="verse-ref">
        ({v.surah}: {v.ayah})
      </span>
    </Tag>
  );
}
