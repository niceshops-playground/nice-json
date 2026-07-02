import { useState } from 'react'

// Rendering a giant object as live DOM is expensive; past this many nodes we
// steer the user back to the formatted text view instead.
const TREE_NODE_LIMIT = 20_000

type Kind = 'object' | 'array' | 'string' | 'number' | 'boolean' | 'null'

function kindOf(v: unknown): Kind {
  if (v === null) return 'null'
  if (Array.isArray(v)) return 'array'
  const t = typeof v
  if (t === 'object') return 'object'
  return t as Kind
}

function Leaf({ value, kind }: { value: unknown; kind: Kind }) {
  const text = kind === 'string' ? `"${value as string}"` : String(value)
  return <span className={`tok-${kind}`}>{text}</span>
}

function Branch({
  name,
  value,
  depth,
  isLast,
}: {
  name: string | null
  value: unknown
  depth: number
  isLast: boolean
}) {
  const kind = kindOf(value)
  const branch = kind === 'object' || kind === 'array'
  const [open, setOpen] = useState(depth < 2)

  const key = name === null ? null : <span className="tree-key">{name}</span>

  if (!branch) {
    return (
      <div className="tree-row" style={{ paddingLeft: depth * 14 }}>
        {key}
        {key && <span className="tree-colon">: </span>}
        <Leaf value={value} kind={kind} />
        {!isLast && <span className="tree-comma">,</span>}
      </div>
    )
  }

  const entries: [string, unknown][] = Array.isArray(value)
    ? value.map((v, i) => [String(i), v])
    : Object.entries(value as Record<string, unknown>)

  const open$ = kind === 'array' ? '[' : '{'
  const close$ = kind === 'array' ? ']' : '}'
  const count = entries.length
  const summary =
    kind === 'array'
      ? `${count} item${count === 1 ? '' : 's'}`
      : `${count} key${count === 1 ? '' : 's'}`

  return (
    <div className="tree-branch">
      <button
        type="button"
        className="tree-row tree-toggle"
        style={{ paddingLeft: depth * 14 }}
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
      >
        <span className={`tree-caret ${open ? 'open' : ''}`}>▸</span>
        {key}
        {key && <span className="tree-colon">: </span>}
        <span className="tree-bracket">{open$}</span>
        {!open && (
          <>
            <span className="tree-summary"> {summary} </span>
            <span className="tree-bracket">{close$}</span>
            {!isLast && <span className="tree-comma">,</span>}
          </>
        )}
      </button>

      {open && (
        <>
          {entries.map(([k, v], i) => (
            <Branch
              key={k}
              name={kind === 'array' ? null : k}
              value={v}
              depth={depth + 1}
              isLast={i === entries.length - 1}
            />
          ))}
          <div className="tree-row" style={{ paddingLeft: depth * 14 }}>
            <span className="tree-bracket">{close$}</span>
            {!isLast && <span className="tree-comma">,</span>}
          </div>
        </>
      )}
    </div>
  )
}

export function TreeView({ value, nodes }: { value: unknown; nodes: number }) {
  if (nodes > TREE_NODE_LIMIT) {
    return (
      <div className="pane-notice">
        Too large to explore as a tree ({nodes.toLocaleString()} nodes). Use the{' '}
        <strong>Formatted</strong> view.
      </div>
    )
  }
  return (
    <div className="tree">
      <Branch name={null} value={value} depth={0} isLast />
    </div>
  )
}
