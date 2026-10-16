import katex from 'katex'
import { memo, useMemo } from 'react'

export const Tex = memo(function Tex({ tex, block = false, className = '' }: { tex: string; block?: boolean; className?: string }) {
  const html = useMemo(() => {
    try {
      return katex.renderToString(tex, { displayMode: block, throwOnError: false, strict: 'ignore', output: 'htmlAndMathml' })
    } catch {
      return tex
    }
  }, [tex, block])
  return block
    ? <div className={`overflow-x-auto overflow-y-hidden py-1 ${className}`} dangerouslySetInnerHTML={{ __html: html }} />
    : <span className={className} dangerouslySetInnerHTML={{ __html: html }} />
})
