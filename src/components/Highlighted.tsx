import { useMemo } from 'react'
import { tokenize } from '../lib/highlight'

// Above this size, coloring produces too many DOM nodes to be worth it — fall
// back to plain text so the app stays responsive on big payloads.
const HIGHLIGHT_LIMIT = 200_000

export function Highlighted({ text }: { text: string }) {
  const tokens = useMemo(() => (text.length > HIGHLIGHT_LIMIT ? null : tokenize(text)), [text])

  if (!tokens) {
    return (
      <pre className="output-pre">
        <code>{text}</code>
      </pre>
    )
  }

  return (
    <pre className="output-pre">
      <code>
        {tokens.map((t, i) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: tokens are positional and never reordered
          <span key={i} className={`tok-${t.kind}`}>
            {t.text}
          </span>
        ))}
      </code>
    </pre>
  )
}
