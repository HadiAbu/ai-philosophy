export interface ConceptNode {
  id: string
  label: string
  description: string
  x: number
  y: number
  available: boolean
  connections: string[]
}

export const NODES: ConceptNode[] = [
  {
    id: 'what-is-ai',
    label: 'What is AI?',
    description: 'The fundamentals of artificial intelligence',
    x: 550, y: 80,
    available: true,
    connections: ['types-of-ml', 'neural-networks'],
  },
  {
    id: 'types-of-ml',
    label: 'Types of ML',
    description: 'Supervised, unsupervised & reinforcement learning',
    x: 200, y: 260,
    available: false,
    connections: [],
  },
  {
    id: 'neural-networks',
    label: 'Neural Networks',
    description: 'How artificial neurons learn from data',
    x: 850, y: 260,
    available: false,
    connections: ['activations'],
  },
  {
    id: 'activations',
    label: 'Activations',
    description: 'Functions that give neural networks non-linearity',
    x: 850, y: 430,
    available: false,
    connections: ['transformers'],
  },
  {
    id: 'transformers',
    label: 'Transformers',
    description: 'The architecture behind modern language models',
    x: 850, y: 600,
    available: false,
    connections: ['attention', 'tokenization'],
  },
  {
    id: 'attention',
    label: 'Attention',
    description: 'How models focus on relevant parts of input',
    x: 630, y: 760,
    available: false,
    connections: [],
  },
  {
    id: 'tokenization',
    label: 'Tokenization',
    description: 'How text is split into model-understandable pieces',
    x: 1040, y: 760,
    available: false,
    connections: ['rag'],
  },
  {
    id: 'rag',
    label: 'RAG',
    description: 'Retrieval-Augmented Generation systems',
    x: 1040, y: 920,
    available: false,
    connections: ['embeddings', 'retrieval'],
  },
  {
    id: 'embeddings',
    label: 'Embeddings',
    description: 'Representing meaning as vectors in space',
    x: 860, y: 1060,
    available: false,
    connections: [],
  },
  {
    id: 'retrieval',
    label: 'Retrieval',
    description: 'Finding relevant information using similarity',
    x: 1180, y: 1060,
    available: false,
    connections: [],
  },
]

export const NODES_BY_ID: Record<string, ConceptNode> = Object.fromEntries(
  NODES.map((n) => [n.id, n]),
)

export const EDGES: Array<[string, string]> = NODES.flatMap((n) =>
  n.connections.map((to) => [n.id, to] as [string, string]),
)
