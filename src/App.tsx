import { useEffect, useMemo, useRef, useState } from 'react'
import { Highlighted } from './components/Highlighted'
import { TreeView } from './components/TreeView'
import {
  computeStats,
  formatBytes,
  formatJson,
  type Indent,
  minifyJson,
  parseJson,
} from './lib/json'
import { SAMPLE } from './lib/sample'

type View = 'formatted' | 'tree'

const STORAGE_KEY = 'nice-json:v1'

interface Persisted {
  input: string
  indent: Indent
  sortKeys: boolean
}

function loadPersisted(): Persisted {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return { input: '', indent: 2, sortKeys: false, ...JSON.parse(raw) }
  } catch {
    // ignore corrupt storage
  }
  return { input: '', indent: 2, sortKeys: false }
}

export default function App() {
  const initial = useMemo(() => loadPersisted(), [])
  const [input, setInput] = useState(initial.input)
  const [indent, setIndent] = useState<Indent>(initial.indent)
  const [sortKeys, setSortKeys] = useState(initial.sortKeys)
  const [view, setView] = useState<View>('formatted')
  const [copied, setCopied] = useState(false)
  const copyTimer = useRef<number | undefined>(undefined)

  useEffect(() => {
    const data: Persisted = { input, indent, sortKeys }
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
    } catch {
      // storage full / disabled — non-fatal
    }
  }, [input, indent, sortKeys])

  const parsed = useMemo(() => parseJson(input), [input])
  const trimmed = input.trim()

  const output = useMemo(
    () => (parsed.ok ? formatJson(parsed.value, indent, sortKeys) : ''),
    [parsed, indent, sortKeys],
  )

  const stats = useMemo(
    () => (parsed.ok ? computeStats(parsed.value, output) : null),
    [parsed, output],
  )

  const flashCopied = () => {
    setCopied(true)
    window.clearTimeout(copyTimer.current)
    copyTimer.current = window.setTimeout(() => setCopied(false), 1200)
  }

  const doFormat = () => {
    if (parsed.ok) setInput(formatJson(parsed.value, indent, sortKeys))
  }
  const doMinify = () => {
    if (parsed.ok) setInput(minifyJson(parsed.value, sortKeys))
  }
  const doCopy = async () => {
    if (!output) return
    await navigator.clipboard.writeText(output)
    flashCopied()
  }
  const doDownload = () => {
    if (!output) return
    const blob = new Blob([output], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'nice.json'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="app">
      <header className="topbar">
        <div className="brand">
          <span className="brand-mark">{'{ }'}</span>
          <h1>Nice JSON</h1>
        </div>
        <p className="tagline">Format, minify &amp; explore JSON — all in your browser.</p>
      </header>

      <div className="toolbar">
        <button
          type="button"
          className="btn btn-primary btn-sm"
          onClick={doFormat}
          disabled={!parsed.ok}
        >
          Format
        </button>
        <button
          type="button"
          className="btn btn-secondary btn-sm"
          onClick={doMinify}
          disabled={!parsed.ok}
        >
          Minify
        </button>

        <span className="sep" />

        <label className="field">
          Indent
          <select
            value={String(indent)}
            onChange={(e) =>
              setIndent(e.target.value === 'tab' ? 'tab' : (Number(e.target.value) as Indent))
            }
          >
            <option value="2">2 spaces</option>
            <option value="4">4 spaces</option>
            <option value="tab">Tab</option>
          </select>
        </label>

        <label className="field checkbox">
          <input
            type="checkbox"
            checked={sortKeys}
            onChange={(e) => setSortKeys(e.target.checked)}
          />
          Sort keys
        </label>

        <span className="spacer" />

        <button type="button" className="btn btn-ghost btn-sm" onClick={() => setInput(SAMPLE)}>
          Sample
        </button>
        <button
          type="button"
          className="btn btn-ghost btn-sm"
          onClick={() => setInput('')}
          disabled={!input}
        >
          Clear
        </button>
      </div>

      <main className="panes">
        <section className="pane">
          <div className="pane-head">
            <span className="pane-title">Input</span>
            {trimmed && !parsed.ok && (
              <span className="badge badge-error">
                {parsed.error.line
                  ? `Invalid · line ${parsed.error.line}, col ${parsed.error.column}`
                  : 'Invalid'}
              </span>
            )}
            {parsed.ok && trimmed && <span className="badge badge-ok">Valid</span>}
          </div>
          <textarea
            className="editor"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Paste JSON here…"
            spellCheck={false}
            autoCapitalize="off"
            autoCorrect="off"
          />
          {trimmed && !parsed.ok && <div className="error-bar">{parsed.error.message}</div>}
        </section>

        <section className="pane">
          <div className="pane-head">
            <div className="tabs">
              <button
                type="button"
                className={`tab ${view === 'formatted' ? 'active' : ''}`}
                onClick={() => setView('formatted')}
              >
                Formatted
              </button>
              <button
                type="button"
                className={`tab ${view === 'tree' ? 'active' : ''}`}
                onClick={() => setView('tree')}
              >
                Tree
              </button>
            </div>
            <div className="pane-actions">
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={doCopy}
                disabled={!output}
              >
                {copied ? 'Copied!' : 'Copy'}
              </button>
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={doDownload}
                disabled={!output}
              >
                Download
              </button>
            </div>
          </div>

          <div className="output">
            {!trimmed ? (
              <div className="pane-notice">Output appears here.</div>
            ) : !parsed.ok ? (
              <div className="pane-notice pane-notice-error">
                Fix the error on the left to see the result.
              </div>
            ) : view === 'formatted' ? (
              <Highlighted text={output} />
            ) : (
              <TreeView value={parsed.value} nodes={stats?.nodes ?? 0} />
            )}
          </div>
        </section>
      </main>

      <footer className="statusbar">
        {parsed.ok && stats && trimmed ? (
          <>
            <span>{formatBytes(stats.bytes)}</span>
            <span>{stats.lines.toLocaleString()} lines</span>
            <span>{stats.nodes.toLocaleString()} nodes</span>
            <span>depth {stats.depth}</span>
          </>
        ) : (
          <span className="muted">Nothing to measure yet.</span>
        )}
        <span className="spacer" />
        <span className="muted">Runs entirely on your device — nothing is uploaded.</span>
      </footer>
    </div>
  )
}
