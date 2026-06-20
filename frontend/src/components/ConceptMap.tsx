import { select, zoom, zoomIdentity } from 'd3'
import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { EDGES, NODES, NODES_BY_ID, type ConceptNode } from '../data/nodes'

type NodeState = 'available' | 'completed' | 'locked'

function nodeState(node: ConceptNode, completed: Set<string>): NodeState {
  if (completed.has(node.id)) return 'completed'
  if (node.available) return 'available'
  return 'locked'
}

// Natural bounding box of all node positions
const GRAPH_W = 1380
const GRAPH_H = 1140

function Edge({ from, to }: { from: ConceptNode; to: ConceptNode }) {
  const midY = (from.y + to.y) / 2
  const d = `M ${from.x} ${from.y + 38} C ${from.x} ${midY}, ${to.x} ${midY}, ${to.x} ${to.y - 38}`
  return <path d={d} stroke="#1f2937" strokeWidth={1.5} fill="none" />
}

function MapNode({
  node,
  state,
  onClick,
}: {
  node: ConceptNode
  state: NodeState
  onClick: () => void
}) {
  const [hovered, setHovered] = useState(false)
  const clickable = state !== 'locked'

  const ring = state === 'completed' ? '#818cf8' : state === 'available' ? '#6366f1' : '#374151'
  const fill = state === 'completed' ? '#312e81' : state === 'available' ? '#0d0d1f' : '#111827'
  const label = state === 'locked' ? '#4b5563' : '#e5e7eb'
  const r = hovered && clickable ? 40 : 36

  return (
    <g
      transform={`translate(${node.x},${node.y})`}
      onClick={clickable ? onClick : undefined}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{ cursor: clickable ? 'pointer' : 'default' }}
    >
      {/* Outer glow ring for available/completed */}
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
        style={{ transition: 'r 0.15s, opacity 0.2s' }}
      />

      {state === 'completed' && (
        <text
          textAnchor="middle"
          dominantBaseline="central"
          fill="#a5b4fc"
          fontSize={18}
          style={{ userSelect: 'none' }}
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
          style={{ userSelect: 'none' }}
        >
          ⬡
        </text>
      )}

      <text
        y={54}
        textAnchor="middle"
        fill={label}
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

export function ConceptMap({ completed }: { completed: Set<string> }) {
  const svgRef = useRef<SVGSVGElement>(null)
  const gRef = useRef<SVGGElement>(null)
  const navigate = useNavigate()
  const [dragging, setDragging] = useState(false)

  useEffect(() => {
    const svg = select(svgRef.current!)
    const g = select(gRef.current!)

    const zoomBehavior = zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.2, 2.5])
      .on('start', () => setDragging(true))
      .on('zoom', (event) => {
        g.attr('transform', event.transform.toString())
      })
      .on('end', () => setDragging(false))

    svg.call(zoomBehavior).on('dblclick.zoom', null)

    // Fit the entire graph into the viewport on mount
    const { clientWidth: w, clientHeight: h } = svgRef.current!
    const scale = Math.min(w / GRAPH_W, h / GRAPH_H) * 0.88
    const tx = (w - GRAPH_W * scale) / 2
    const ty = (h - GRAPH_H * scale) / 2 + 20

    svg.call(zoomBehavior.transform, zoomIdentity.translate(tx, ty).scale(scale))

    return () => {
      svg.on('.zoom', null)
    }
  }, [])

  return (
    <svg
      ref={svgRef}
      className="w-full h-full"
      style={{ cursor: dragging ? 'grabbing' : 'grab' }}
    >
      <g ref={gRef}>
        {EDGES.map(([fromId, toId]) => (
          <Edge
            key={`${fromId}-${toId}`}
            from={NODES_BY_ID[fromId]}
            to={NODES_BY_ID[toId]}
          />
        ))}
        {NODES.map((node) => (
          <MapNode
            key={node.id}
            node={node}
            state={nodeState(node, completed)}
            onClick={() => navigate(`/learn/${node.id}`)}
          />
        ))}
      </g>
    </svg>
  )
}
