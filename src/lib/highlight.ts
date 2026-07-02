// Tokenize a *formatted* JSON string into classified spans for coloring.
// Works on the pretty/minified output, so it only ever sees valid JSON.

export type TokenKind = 'key' | 'string' | 'number' | 'boolean' | 'null' | 'punct'

export interface Token {
  text: string
  kind: TokenKind
}

const RE =
  /("(?:\\.|[^"\\])*")(\s*:)?|(-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?)|\b(true|false)\b|\b(null)\b/g

/**
 * Split `src` into tokens. Everything the regex doesn't claim (braces, commas,
 * whitespace) is emitted as `punct` so the original text round-trips exactly.
 */
export function tokenize(src: string): Token[] {
  const tokens: Token[] = []
  let last = 0

  for (let m = RE.exec(src); m; m = RE.exec(src)) {
    if (m.index > last) tokens.push({ text: src.slice(last, m.index), kind: 'punct' })

    const [, str, colon, num, bool, nul] = m
    if (str !== undefined) {
      // A string followed by `:` is an object key.
      tokens.push({ text: str, kind: colon ? 'key' : 'string' })
      if (colon) tokens.push({ text: colon, kind: 'punct' })
    } else if (num !== undefined) {
      tokens.push({ text: num, kind: 'number' })
    } else if (bool !== undefined) {
      tokens.push({ text: bool, kind: 'boolean' })
    } else if (nul !== undefined) {
      tokens.push({ text: nul, kind: 'null' })
    }
    last = RE.lastIndex
  }

  if (last < src.length) tokens.push({ text: src.slice(last), kind: 'punct' })
  return tokens
}
