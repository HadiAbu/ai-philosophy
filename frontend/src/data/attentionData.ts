export interface AttentionExample {
  label: string
  tokens: string[]
  // attention[i][j] = weight from token i to token j; each row sums to 1
  attention: number[][]
}

export const ATTENTION_EXAMPLES: AttentionExample[] = [
  {
    label: 'The cat sat on the mat',
    tokens: ['The', 'cat', 'sat', 'on', 'the', 'mat'],
    attention: [
      [0.60, 0.10, 0.10, 0.05, 0.10, 0.05],
      [0.30, 0.40, 0.15, 0.05, 0.05, 0.05],
      [0.05, 0.40, 0.20, 0.10, 0.05, 0.20],
      [0.10, 0.10, 0.20, 0.30, 0.10, 0.20],
      [0.40, 0.05, 0.05, 0.10, 0.35, 0.05],
      [0.05, 0.10, 0.30, 0.20, 0.20, 0.15],
    ],
  },
  {
    label: 'She gave him a book',
    tokens: ['She', 'gave', 'him', 'a', 'book'],
    attention: [
      [0.60, 0.20, 0.10, 0.05, 0.05],
      [0.40, 0.20, 0.20, 0.05, 0.15],
      [0.30, 0.30, 0.20, 0.05, 0.15],
      [0.05, 0.10, 0.05, 0.50, 0.30],
      [0.10, 0.25, 0.10, 0.20, 0.35],
    ],
  },
  {
    label: 'The old man walked slowly',
    tokens: ['The', 'old', 'man', 'walked', 'slowly'],
    attention: [
      [0.60, 0.10, 0.20, 0.05, 0.05],
      [0.05, 0.20, 0.65, 0.05, 0.05],
      [0.30, 0.25, 0.25, 0.10, 0.10],
      [0.05, 0.10, 0.50, 0.25, 0.10],
      [0.00, 0.05, 0.10, 0.70, 0.15],
    ],
  },
  {
    label: 'AI learns from data',
    tokens: ['AI', 'learns', 'from', 'data'],
    attention: [
      [0.70, 0.20, 0.05, 0.05],
      [0.45, 0.20, 0.10, 0.25],
      [0.10, 0.30, 0.20, 0.40],
      [0.10, 0.30, 0.25, 0.35],
    ],
  },
  {
    label: 'The key unlocks the door',
    tokens: ['The', 'key', 'unlocks', 'the', 'door'],
    attention: [
      [0.60, 0.20, 0.05, 0.10, 0.05],
      [0.20, 0.30, 0.35, 0.05, 0.10],
      [0.05, 0.45, 0.15, 0.05, 0.30],
      [0.35, 0.05, 0.05, 0.40, 0.15],
      [0.05, 0.15, 0.40, 0.15, 0.25],
    ],
  },
]
