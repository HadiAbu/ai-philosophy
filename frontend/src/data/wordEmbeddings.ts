export type EmbCategory = 'tech' | 'language' | 'animal' | 'food' | 'nature' | 'person' | 'sentiment'

export interface WordPoint {
  word: string
  x: number  // -1..1
  y: number  // -1..1
  category: EmbCategory
}

export const EMB_CATEGORIES: Record<EmbCategory, { label: string; color: string }> = {
  tech:      { label: 'AI / Tech',  color: '#818cf8' },
  language:  { label: 'Language',   color: '#34d399' },
  animal:    { label: 'Animals',    color: '#fb923c' },
  food:      { label: 'Food',       color: '#facc15' },
  nature:    { label: 'Nature',     color: '#4ade80' },
  person:    { label: 'People',     color: '#f472b6' },
  sentiment: { label: 'Sentiment',  color: '#a78bfa' },
}

// Coordinates are hand-crafted to show semantic clusters and the
// king − man + woman ≈ queen analogy (people cluster, centre)
export const WORD_POINTS: WordPoint[] = [
  // AI / Tech — top-right cluster
  { word: 'neural',     x:  0.72, y:  0.35, category: 'tech' },
  { word: 'network',    x:  0.65, y:  0.44, category: 'tech' },
  { word: 'model',      x:  0.60, y:  0.28, category: 'tech' },
  { word: 'data',       x:  0.78, y:  0.22, category: 'tech' },
  { word: 'train',      x:  0.68, y:  0.52, category: 'tech' },
  { word: 'algorithm',  x:  0.80, y:  0.40, category: 'tech' },
  { word: 'layer',      x:  0.57, y:  0.48, category: 'tech' },
  { word: 'gradient',   x:  0.74, y:  0.55, category: 'tech' },
  { word: 'weight',     x:  0.82, y:  0.30, category: 'tech' },
  { word: 'compute',    x:  0.76, y:  0.62, category: 'tech' },
  { word: 'parameter',  x:  0.86, y:  0.48, category: 'tech' },
  { word: 'loss',       x:  0.88, y:  0.60, category: 'tech' },

  // Language — top-left cluster
  { word: 'word',       x: -0.42, y:  0.65, category: 'language' },
  { word: 'sentence',   x: -0.52, y:  0.72, category: 'language' },
  { word: 'token',      x: -0.35, y:  0.58, category: 'language' },
  { word: 'text',       x: -0.58, y:  0.60, category: 'language' },
  { word: 'meaning',    x: -0.38, y:  0.76, category: 'language' },
  { word: 'grammar',    x: -0.62, y:  0.50, category: 'language' },
  { word: 'language',   x: -0.48, y:  0.82, category: 'language' },
  { word: 'phrase',     x: -0.55, y:  0.68, category: 'language' },
  { word: 'context',    x: -0.32, y:  0.70, category: 'language' },

  // Animals — bottom-left cluster
  { word: 'cat',        x: -0.55, y: -0.38, category: 'animal' },
  { word: 'dog',        x: -0.63, y: -0.46, category: 'animal' },
  { word: 'bird',       x: -0.46, y: -0.30, category: 'animal' },
  { word: 'fish',       x: -0.70, y: -0.38, category: 'animal' },
  { word: 'lion',       x: -0.64, y: -0.55, category: 'animal' },
  { word: 'horse',      x: -0.50, y: -0.52, category: 'animal' },
  { word: 'wolf',       x: -0.74, y: -0.48, category: 'animal' },
  { word: 'bear',       x: -0.58, y: -0.62, category: 'animal' },
  { word: 'eagle',      x: -0.42, y: -0.42, category: 'animal' },

  // Food — top-centre cluster
  { word: 'bread',      x:  0.05, y:  0.72, category: 'food' },
  { word: 'apple',      x:  0.16, y:  0.78, category: 'food' },
  { word: 'rice',       x:  0.10, y:  0.63, category: 'food' },
  { word: 'soup',       x: -0.02, y:  0.80, category: 'food' },
  { word: 'cake',       x:  0.20, y:  0.68, category: 'food' },
  { word: 'fruit',      x:  0.12, y:  0.87, category: 'food' },
  { word: 'milk',       x: -0.08, y:  0.70, category: 'food' },
  { word: 'meat',       x:  0.02, y:  0.59, category: 'food' },

  // Nature — bottom-right cluster
  { word: 'tree',       x:  0.32, y: -0.52, category: 'nature' },
  { word: 'river',      x:  0.22, y: -0.63, category: 'nature' },
  { word: 'mountain',   x:  0.42, y: -0.58, category: 'nature' },
  { word: 'ocean',      x:  0.14, y: -0.72, category: 'nature' },
  { word: 'forest',     x:  0.36, y: -0.44, category: 'nature' },
  { word: 'cloud',      x:  0.48, y: -0.50, category: 'nature' },
  { word: 'sun',        x:  0.52, y: -0.62, category: 'nature' },
  { word: 'rain',       x:  0.24, y: -0.46, category: 'nature' },
  { word: 'stone',      x:  0.42, y: -0.68, category: 'nature' },

  // People — centre (arranged for king−man+woman=queen analogy)
  // man/woman share same y; king/queen share same y, offset upward
  { word: 'man',        x: -0.22, y: -0.16, category: 'person' },
  { word: 'woman',      x: -0.06, y: -0.16, category: 'person' },
  { word: 'king',       x: -0.22, y:  0.14, category: 'person' },
  { word: 'queen',      x: -0.06, y:  0.14, category: 'person' },
  { word: 'child',      x: -0.14, y: -0.30, category: 'person' },
  { word: 'doctor',     x: -0.30, y: -0.04, category: 'person' },
  { word: 'teacher',    x: -0.34, y:  0.08, category: 'person' },
  { word: 'student',    x: -0.18, y:  0.24, category: 'person' },

  // Sentiment — left-centre cluster
  { word: 'good',       x: -0.64, y:  0.28, category: 'sentiment' },
  { word: 'bad',        x: -0.78, y:  0.10, category: 'sentiment' },
  { word: 'happy',      x: -0.60, y:  0.38, category: 'sentiment' },
  { word: 'sad',        x: -0.82, y:  0.20, category: 'sentiment' },
  { word: 'love',       x: -0.62, y:  0.18, category: 'sentiment' },
  { word: 'hate',       x: -0.80, y:  0.02, category: 'sentiment' },
  { word: 'great',      x: -0.55, y:  0.45, category: 'sentiment' },
  { word: 'terrible',   x: -0.84, y:  0.32, category: 'sentiment' },
  { word: 'amazing',    x: -0.50, y:  0.52, category: 'sentiment' },
  { word: 'awful',      x: -0.88, y:  0.18, category: 'sentiment' },
]

// The four royalty words used in the analogy annotation
export const ANALOGY_WORDS = new Set(['man', 'woman', 'king', 'queen'])
