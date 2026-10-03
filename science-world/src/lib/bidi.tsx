import { Fragment, type ReactNode } from 'react';

/** A run of English inside Arabic text: words, digits and the punctuation between them. */
const LATIN_RUN = /[A-Za-z][A-Za-z0-9'’.,:;/+\- ]*[A-Za-z0-9'’!?)]|[A-Za-z]/g;
const ARABIC = /[؀-ۿ]/;

/**
 * Arabic sentences with English words in them («سلطان tall وchatty …»)
 * can come out scrambled. Wrapping every English run in <bdi dir="ltr">
 * keeps each run in one readable piece. Other text passes through unchanged.
 */
export function mixed(text: ReactNode): ReactNode {
  if (typeof text !== 'string' || !ARABIC.test(text) || !/[A-Za-z]/.test(text)) return text;
  const out: ReactNode[] = [];
  let last = 0;
  for (const m of text.matchAll(LATIN_RUN)) {
    const i = m.index ?? 0;
    if (i > last) out.push(text.slice(last, i));
    out.push(
      <bdi key={i} dir="ltr">
        {m[0]}
      </bdi>,
    );
    last = i + m[0].length;
  }
  if (last < text.length) out.push(text.slice(last));
  return <Fragment>{out}</Fragment>;
}
