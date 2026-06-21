export interface ConceptNode {
  id: string
  label: string
  description: string
  icon: string
  x: number
  y: number
  available: boolean
  unlockedBy?: string[]
  connections: string[]
}

export function effectiveAvailable(node: ConceptNode, completed: Set<string>): boolean {
  if (node.available) return true
  if (!node.unlockedBy?.length) return false
  return node.unlockedBy.every((dep) => completed.has(dep))
}

export const NODES: ConceptNode[] = [
  {
    id: 'what-is-ai',
    label: 'What is AI?',
    description: 'The fundamentals of artificial intelligence',
    icon: '🤖',
    x: 550, y: 80,
    available: true,
    connections: ['types-of-ml', 'neural-networks'],
  },
  {
    id: 'types-of-ml',
    label: 'Types of ML',
    description: 'Supervised, unsupervised & reinforcement learning',
    icon: '📊',
    x: 200, y: 260,
    available: false,
    unlockedBy: ['what-is-ai'],
    connections: [],
  },
  {
    id: 'neural-networks',
    label: 'Neural Networks',
    description: 'How artificial neurons learn from data',
    icon: '🧠',
    x: 850, y: 260,
    available: false,
    unlockedBy: ['what-is-ai'],
    connections: ['activations', 'transformers'],
  },
  {
    id: 'activations',
    label: 'Activations',
    description: 'Functions that give neural networks non-linearity',
    icon: '⚡',
    x: 1080, y: 430,
    available: false,
    unlockedBy: ['neural-networks'],
    connections: [],
  },
  {
    id: 'transformers',
    label: 'Transformers',
    description: 'The architecture behind modern language models',
    icon: '⚙️',
    x: 850, y: 600,
    available: false,
    unlockedBy: ['neural-networks'],
    connections: ['attention', 'tokenization'],
  },
  {
    id: 'attention',
    label: 'Attention',
    description: 'How models focus on relevant parts of input',
    icon: '👁️',
    x: 630, y: 760,
    available: false,
    unlockedBy: ['transformers'],
    connections: [],
  },
  {
    id: 'tokenization',
    label: 'Tokenization',
    description: 'How text is split into model-understandable pieces',
    icon: '✂️',
    x: 1040, y: 760,
    available: false,
    unlockedBy: ['transformers'],
    connections: ['rag'],
  },
  {
    id: 'rag',
    label: 'RAG',
    description: 'Retrieval-Augmented Generation systems',
    icon: '📚',
    x: 1040, y: 920,
    available: false,
    unlockedBy: ['tokenization'],
    connections: ['embeddings', 'retrieval', 'prompt-engineering'],
  },
  {
    id: 'embeddings',
    label: 'Embeddings',
    description: 'Representing meaning as vectors in space',
    icon: '🗺️',
    x: 860, y: 1060,
    available: false,
    unlockedBy: ['rag'],
    connections: [],
  },
  {
    id: 'retrieval',
    label: 'Retrieval',
    description: 'Finding relevant information using similarity',
    icon: '🎯',
    x: 1180, y: 1060,
    available: false,
    unlockedBy: ['rag'],
    connections: [],
  },
  {
    id: 'prompt-engineering',
    label: 'Prompt Engineering',
    description: 'Writing instructions that reliably get useful output',
    icon: '✍️',
    x: 1040, y: 1200,
    available: false,
    unlockedBy: ['rag'],
    connections: ['hallucinations', 'use-cases'],
  },
  {
    id: 'hallucinations',
    label: 'Hallucinations',
    description: 'Why AI makes things up and how to defend against it',
    icon: '👻',
    x: 860, y: 1340,
    available: false,
    unlockedBy: ['prompt-engineering'],
    connections: [],
  },
  {
    id: 'use-cases',
    label: 'Use Cases',
    description: 'Code, summarisation, classification and beyond',
    icon: '🛠️',
    x: 1220, y: 1340,
    available: false,
    unlockedBy: ['prompt-engineering'],
    connections: [],
  },
]

export const NODES_BY_ID: Record<string, ConceptNode> = Object.fromEntries(
  NODES.map((n) => [n.id, n]),
)

export const EDGES: Array<[string, string]> = NODES.flatMap((n) =>
  n.connections.map((to) => [n.id, to] as [string, string]),
)
