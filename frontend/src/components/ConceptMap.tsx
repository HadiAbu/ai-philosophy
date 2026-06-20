import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { EDGES, NODES, NODES_BY_ID, effectiveAvailable, type ConceptNode } from '../data/nodes'

type NodeState = 'available' | 'completed' | 'locked'

function nodeState(node: ConceptNode, completed: Set<string>): NodeState {
  if (completed.has(node.id)) return 'completed'
  if (effectiveAvailable(node, completed)) return 'available'
  return 'locked'
}

const GRAPH_W = 1380
const GRAPH_H = 1140

// ─── Edge ────────────────────────────────────────────────────────────────────

function Edge({ from, to }: { from: ConceptNode; to: ConceptNode }) {
  const midY = (from.y + to.y) / 2
  const d = `M ${from.x} ${from.y + 38} C ${from.x} ${midY}, ${to.x} ${midY}, ${to.x} ${to.y - 38}`
  return <path d={d} stroke="#1f2937" strokeWidth={1.5} fill="none" />
}

// ─── Node ─────────────────────────────────────────────────────────────────────

function MapNode({
  node,
  state,
}: {
  node: ConceptNode
  state: NodeState
}) {
  const [hovered, setHovered] = useState(false)
  const clickable = state !== 'locked'

  const ring = state === 'completed' ? '#818cf8' : state === 'available' ? '#6366f1' : '#374151'
  const fill = state === 'completed' ? '#312e81' : state === 'available' ? '#0d0d1f' : '#111827'
  const labelColor = state === 'locked' ? '#4b5563' : '#e5e7eb'
  const r = hovered && clickable ? 40 : 36

  return (
    <g
      transform={`translate(${node.x},${node.y})`}
      data-node-id={node.id}
      data-clickable={clickable ? 'true' : undefined}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{ cursor: clickable ? 'pointer' : 'default' }}
    >
      {state !== 'locked' && (
        <circle
          r={50}
          fill="none"
          stroke={ring}
          strokeWidth={1}
          opacity={hovered ? 0.5 : 0.2}
          style={{ transition: 'opacity 0.2s' }}
        />
      )}
      <circle
        r={r}
        fill={fill}
        stroke={ring}
        strokeWidth={state === 'locked' ? 1 : 2}
        opacity={state === 'locked' ? 0.45 : 1}
        style={{ transition: 'r 0.15s' }}
      />
      {state === 'completed' && (
        <text textAnchor="middle" dominantBaseline="central" fill="#a5b4fc" fontSize={18} style={{ userSelect: 'none' }}>
          ✓
        </text>
      )}
      {state === 'locked' && (
        <text textAnchor="middle" dominantBaseline="central" fill="#374151" fontSize={14} style={{ userSelect: 'none' }}>
          ⬡
        </text>
      )}
      <text
        y={54}
        textAnchor="middle"
        fill={labelColor}
        fontSize={12}
        fontWeight={state === 'locked' ? 400 : 600}
        fontFamily="system-ui, -apple-system, sans-serif"
        style={{ userSelect: 'none' }}
      >
        {node.label}
      </text>
    </g>
  )
}

// ─── ConceptMap ───────────────────────────────────────────────────────────────

interface Transform { x: number; y: number; k: number }

export function ConceptMap({ completed }: { completed: Set<string> }) {
  const svgRef = useRef<SVGSVGElement>(null)
  const navigate = useNavigate()
  const [transform, setTransform] = useState<Transform>({ x: 0, y: 0, k: 1 })
  const drag = useRef<{ ox: number; oy: number; moved: boolean } | null>(null)
  const [cursor, setCursor] = useState<'grab' | 'grabbing'>('grab')

  // Fit entire graph into the viewport on first render
  useEffect(() => {
    if (!svgRef.current) return
    const { clientWidth: w, clientHeight: h } = svgRef.current
    const k = Math.min(w / GRAPH_W, h / GRAPH_H) * 0.88
    setTransform({ x: (w - GRAPH_W * k) / 2, y: (h - GRAPH_H * k) / 2 + 20, k })
  }, [])

  // Wheel zoom — must be non-passive to preventDefault
  useEffect(() => {
    const svg = svgRef.current
    if (!svg) return
    function onWheel(e: WheelEvent) {
      e.preventDefault()
      setTransform(t => {
        const factor = e.deltaY < 0 ? 1.1 : 1 / 1.1
        const k = Math.max(0.2, Math.min(2.5, t.k * factor))
        const rect = svg!.getBoundingClientRect()
        const cx = e.clientX - rect.left
        const cy = e.clientY - rect.top
        return { x: cx - (cx - t.x) * (k / t.k), y: cy - (cy - t.y) * (k / t.k), k }
      })
    }
    svg.addEventListener('wheel', onWheel, { passive: false })
    return () => svg.removeEventListener('wheel', onWheel)
  }, [])

  return (
    <svg
      ref={svgRef}
      className="w-full h-full"
      style={{ cursor }}
      onPointerDown={(e) => {
        drag.current = { ox: e.clientX, oy: e.clientY, moved: false }
        e.currentTarget.setPointerCapture(e.pointerId)
      }}
      onPointerMove={(e) => {
        if (!drag.current) return
        const dx = e.clientX - drag.current.ox
        const dy = e.clientY - drag.current.oy
        if (!drag.current.moved && Math.hypot(dx, dy) > 4) {
          drag.current.moved = true
          setCursor('grabbing')
        }
        if (drag.current.moved) {
          setTransform(t => ({ ...t, x: t.x + dx, y: t.y + dy }))
          drag.current = { ...drag.current, ox: e.clientX, oy: e.clientY }
        }
      }}
      onPointerUp={(e) => {
        const moved = drag.current?.moved ?? false
        drag.current = null
        setCursor('grab')
        if (!moved) {
          // setPointerCapture redirects pointerup to the SVG, so onClick on child
          // <g> elements never fires. Resolve the real target via hit-testing.
          const el = document.elementFromPoint(e.clientX, e.clientY)
          const group = el?.closest('[data-node-id]')
          if (group?.getAttribute('data-clickable') === 'true') {
            const nodeId = group.getAttribute('data-node-id')
            if (nodeId) navigate(`/learn/${nodeId}`)
          }
        }
      }}
    >
      <g transform={`translate(${transform.x},${transform.y}) scale(${transform.k})`}>
        {EDGES.map(([fromId, toId]) => (
          <Edge key={`${fromId}-${toId}`} from={NODES_BY_ID[fromId]} to={NODES_BY_ID[toId]} />
        ))}
        {NODES.map((node) => (
          <MapNode
            key={node.id}
            node={node}
            state={nodeState(node, completed)}
          />
        ))}
      </g>
    </svg>
  )
}
