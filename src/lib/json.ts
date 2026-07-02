// Pure JSON helpers — parse, format, minify, sort, and measure. No React here.

export type Indent = 2 | 4 | 'tab'

export interface ParseError {
  message: string
  /** Zero-based character offset into the source, when known. */
  position?: number
  /** One-based line number, when known. */
  line?: number
  /** One-based column, when known. */
  column?: number
}

export type ParseResult = { ok: true; value: unknown } | { ok: false; error: ParseError }

/** Parse text, returning the value or a located error (never throws). */
export function parseJson(text: string): ParseResult {
  try {
    return { ok: true, value: JSON.parse(text) }
  } catch (e) {
    return { ok: false, error: locateError((e as Error).message, text) }
  }
}

// V8 encodes the offset in the message ("... at position 42 ..."). We pull it
// out when present and turn it into a line/column the editor can point at.
function locateError(message: string, text: string): ParseError {
  const posMatch = message.match(/position (\d+)/)
  if (!posMatch) return { message }

  const position = Number(posMatch[1])
  const upto = text.slice(0, position)
  const line = upto.split('\n').length
  const column = position - upto.lastIndexOf('\n')

  // Strip V8's trailing "(line x column y)" — we render our own.
  const clean = message.replace(/\s*\(line \d+ column \d+\)/, '').replace(/ in JSON.*$/, '')
  return { message: clean, position, line, column }
}

/** Recursively sort object keys so diffs and lookups are stable. */
export function sortDeep(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(sortDeep)
  if (value && typeof value === 'object') {
    const out: Record<string, unknown> = {}
    for (const key of Object.keys(value).sort()) {
      out[key] = sortDeep((value as Record<string, unknown>)[key])
    }
    return out
  }
  return value
}

export function formatJson(value: unknown, indent: Indent, sortKeys: boolean): string {
  return JSON.stringify(sortKeys ? sortDeep(value) : value, null, indent === 'tab' ? '\t' : indent)
}

export function minifyJson(value: unknown, sortKeys: boolean): string {
  return JSON.stringify(sortKeys ? sortDeep(value) : value)
}

export interface Stats {
  bytes: number
  lines: number
  nodes: number
  depth: number
}

/** Byte size of the rendered text plus structural stats of the value. */
export function computeStats(value: unknown, text: string): Stats {
  let nodes = 0
  let depth = 0

  const walk = (v: unknown, d: number): void => {
    nodes++
    if (d > depth) depth = d
    if (Array.isArray(v)) {
      for (const item of v) walk(item, d + 1)
    } else if (v && typeof v === 'object') {
      for (const key of Object.keys(v)) walk((v as Record<string, unknown>)[key], d + 1)
    }
  }
  walk(value, 1)

  return {
    bytes: new TextEncoder().encode(text).length,
    lines: text.length ? text.split('\n').length : 0,
    nodes,
    depth,
  }
}

export function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`
  return `${(n / (1024 * 1024)).toFixed(2)} MB`
}
