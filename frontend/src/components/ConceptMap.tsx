import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { EDGES, NODES, NODES_BY_ID, effectiveAvailable, type ConceptNode } from '../data/nodes'

type NodeState = 'available' | 'completed' | 'locked'

function nodeState(node: ConceptNode, completed: Set<string>): NodeState {
  if (completed.has(node.id)) return 'completed'
  if (effectiveAvailable(node, completed)) return 'available'
  return 'locked'
}

// Graph bounding box (used for initial fit-to-screen calculation)
const GRAPH_W = 1380
const GRAPH_H = 1480

// ─── Edge ─────────────────────────────────────────────────────────────────────

function Edge({
  from,
  to,
  hoveredId,
}: {
  from: ConceptNode
  to: ConceptNode
  hoveredId: string | null
}) {
  const midY = (from.y + to.y) / 2
  const d = `M ${from.x} ${from.y + 38} C ${from.x} ${midY}, ${to.x} ${midY}, ${to.x} ${to.y - 38}`
  const isConnected = hoveredId && (from.id === hoveredId || to.id === hoveredId)
  const stroke = isConnected ? '#4b5563' : '#1f2937'
  const strokeOpacity = hoveredId ? (isConnected ? 1 : 0.15) : 1

  return (
    <path
      d={d}
      stroke={stroke}
      strokeWidth={1.5}
      fill="none"
      strokeOpacity={strokeOpacity}
      style={{ transition: 'stroke-opacity 0.2s ease, stroke 0.2s ease' }}
    />
  )
}

// ─── Node ─────────────────────────────────────────────────────────────────────

function MapNode({
  node,
  state,
  hoveredId,
  onHover,
}: {
  node: ConceptNode
  state: NodeState
  hoveredId: string | null
  onHover: (id: string | null) => void
}) {
  const clickable = state !== 'locked'
  const isHovered = hoveredId === node.id
  const isDimmed = hoveredId !== null && !isHovered

  const ring = state === 'completed' ? '#818cf8' : state === 'available' ? '#6366f1' : '#374151'
  const fill = state === 'completed' ? '#312e81' : state === 'available' ? '#0d0d1f' : '#111827'
  const labelColor = state === 'locked' ? '#4b5563' : '#e5e7eb'

  const r = isHovered ? 46 : isDimmed ? 26 : 36
  const circleOpacity = isDimmed ? (state === 'locked' ? 0.15 : 0.35) : state === 'locked' ? 0.45 : 1
  const glowR = isHovered ? 62 : isDimmed ? 38 : 50
  const glowOpacity = isHovered ? 0.5 : isDimmed ? 0.05 : 0.2
  const textOpacity = isDimmed ? 0.3 : 1

  const transition = 'r 0.2s ease, opacity 0.2s ease'

  return (
    <g
      transform={`translate(${node.x},${node.y})`}
      data-node-id={node.id}
      data-clickable={clickable ? 'true' : undefined}
      onMouseEnter={() => onHover(node.id)}
      onMouseLeave={() => onHover(null)}
      style={{ cursor: clickable ? 'pointer' : 'default' }}
    >
      {state !== 'locked' && (
        <circle
          r={glowR}
          fill="none"
          stroke={ring}
          strokeWidth={1}
          opacity={glowOpacity}
          style={{ transition }}
        />
      )}
      <circle
        r={r}
        fill={fill}
        stroke={ring}
        strokeWidth={state === 'locked' ? 1 : 2}
        opacity={circleOpacity}
        style={{ transition }}
      />
      {state === 'completed' && (
        <text
          textAnchor="middle"
          dominantBaseline="central"
          fill="#a5b4fc"
          fontSize={18}
          opacity={textOpacity}
          style={{ userSelect: 'none', transition: 'opacity 0.2s ease' }}
        >
          ✓
        </text>
      )}
      {state === 'locked' && (
        <text
          textAnchor="middle"
          dominantBaseline="central"
          fill="#374151"
          fontSize={14}
          opacity={textOpacity}
          style={{ userSelect: 'none', transition: 'opacity 0.2s ease' }}
        >
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
        opacity={textOpacity}
        style={{ userSelect: 'none', transition: 'opacity 0.2s ease' }}
      >
        {node.label}
      </text>
    </g>
  )
}

// ─── Tooltip ──────────────────────────────────────────────────────────────────

function NodeTooltip({
  node,
  state,
  sx,
  sy,
  containerH,
  scale,
}: {
  node: ConceptNode
  state: NodeState
  sx: number
  sy: number
  containerH: number
  scale: number
}) {
  const above = sy > containerH * 0.55
  const nodeEdgePx = 46 * scale

  return (
    <div
      className="pointer-events-none absolute z-20 w-52 rounded-xl border border-gray-800 bg-gray-950/95 px-3 py-2.5 shadow-2xl"
      style={{
        left: sx,
        top: above ? sy - nodeEdgePx - 12 - 80 : sy + nodeEdgePx + 12,
        transform: 'translateX(-50%)',
      }}
    >
      <p className="mb-0.5 text-sm font-semibold text-white">{node.label}</p>
      <p className="text-xs leading-snug text-gray-400">{node.description}</p>
      {state === 'locked' && (
        <p className="mt-1.5 text-xs text-gray-600">🔒 Complete prerequisites first</p>
      )}
    </div>
  )
}

// ─── ConceptMap ───────────────────────────────────────────────────────────────

interface Transform { x: number; y: number; k: number }

export function ConceptMap({ completed }: { completed: Set<string> }) {
  const svgRef = useRef<SVGSVGElement>(null)
  const wrapRef = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()
  const [transform, setTransform] = useState<Transform>({ x: 0, y: 0, k: 1 })
  const drag = useRef<{ ox: number; oy: number; moved: boolean } | null>(null)
  const [cursor, setCursor] = useState<'grab' | 'grabbing'>('grab')
  const [hoveredId, setHoveredId] = useState<string | null>(null)

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

  // Tooltip screen position
  const hoveredNode = hoveredId ? NODES_BY_ID[hoveredId] : null
  const tooltipSx = hoveredNode ? hoveredNode.x * transform.k + transform.x : 0
  const tooltipSy = hoveredNode ? hoveredNode.y * transform.k + transform.y : 0
  const containerH = wrapRef.current?.clientHeight ?? window.innerHeight

  return (
    <div ref={wrapRef} className="relative h-full w-full">
      <svg
        ref={svgRef}
        className="h-full w-full"
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
            <Edge
              key={`${fromId}-${toId}`}
              from={NODES_BY_ID[fromId]}
              to={NODES_BY_ID[toId]}
              hoveredId={hoveredId}
            />
          ))}
          {NODES.map((node) => (
            <MapNode
              key={node.id}
              node={node}
              state={nodeState(node, completed)}
              hoveredId={hoveredId}
              onHover={setHoveredId}
            />
          ))}
        </g>
      </svg>

      {hoveredNode && (
        <NodeTooltip
          node={hoveredNode}
          state={nodeState(hoveredNode, completed)}
          sx={tooltipSx}
          sy={tooltipSy}
          containerH={containerH}
          scale={transform.k}
        />
      )}
    </div>
  )
}
