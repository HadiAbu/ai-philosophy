import { useState, type ReactNode } from 'react'

import { RAG_CATEGORY_COLORS, RAG_DOCS, type RagDoc } from '../../data/ragDocuments'

type ModuleProps = { onComplete: () => Promise<void>; completed: boolean }

function Section({ number, title, children }: { number: number; title: string; children: ReactNode }) {
  return (
    <section className="mb-16">
      <div className="mb-6 flex items-center gap-3">
        <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-indigo-900 text-xs font-bold text-indigo-300">
          {number}
        </span>
        <h3 className="text-xl font-bold">{title}</h3>
      </div>
      {children}
    </section>
  )
}

// ─── Retrieval logic ──────────────────────────────────────────────────────────

function scoreDoc(query: string, doc: RagDoc): number {
  const qWords = query.toLowerCase().split(/\W+/).filter((w) => w.length > 2)
  return qWords.reduce((total, qw) => {
    return total + doc.keywords.filter((kw) => kw.includes(qw) || qw.includes(kw)).length
  }, 0)
}

function retrieveDocs(query: string, k = 3): Array<{ doc: RagDoc; score: number }> {
  return RAG_DOCS.map((doc) => ({ doc, score: scoreDoc(query, doc) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, k)
}

// ─── Pipeline step indicator ──────────────────────────────────────────────────

type Phase = 'idle' | 'embedding' | 'searching' | 'augmenting' | 'generating' | 'done'

const PIPELINE_STEPS: Array<{ key: Phase; label: string; icon: string }> = [
  { key: 'embedding',   label: 'Embed query',   icon: '📐' },
  { key: 'searching',   label: 'Search vectors', icon: '🔍' },
  { key: 'augmenting',  label: 'Build prompt',   icon: '📝' },
  { key: 'generating',  label: 'Generate',       icon: '💬' },
]

const PHASE_ORDER: Phase[] = ['idle', 'embedding', 'searching', 'augmenting', 'generating', 'done']

function phaseIndex(p: Phase) { return PHASE_ORDER.indexOf(p) }

function PipelineBar({ phase }: { phase: Phase }) {
  return (
    <div className="flex items-center gap-1 mb-6">
      {PIPELINE_STEPS.map(({ key, label, icon }, i) => {
        const done   = phaseIndex(phase) > phaseIndex(key)
        const active = phase === key
        return (
          <div key={key} className="flex items-center gap-1 flex-1 min-w-0">
            <div className={`flex-1 rounded-lg px-2 py-2 text-center transition-all ${
              done   ? 'bg-indigo-900/60 border border-indigo-700' :
              active ? 'bg-indigo-600 border border-indigo-400' :
                       'bg-gray-900 border border-gray-800'
            }`}>
              <div className="text-lg">{done ? '✓' : icon}</div>
              <div className={`text-xs mt-0.5 truncate ${
                done ? 'text-indigo-300' : active ? 'text-white' : 'text-gray-600'
              }`}>{label}</div>
            </div>
            {i < PIPELINE_STEPS.length - 1 && (
              <div className={`w-4 h-px flex-shrink-0 ${
                phaseIndex(phase) > phaseIndex(PIPELINE_STEPS[i + 1].key)
                  ? 'bg-indigo-600' : 'bg-gray-800'
              }`} />
            )}
          </div>
        )
      })}
    </div>
  )
}

// ─── Knowledge base mini-scatter ──────────────────────────────────────────────

const SVG_W = 320, SVG_H = 220, PAD = 20

function toSx(x: number) { return PAD + ((x + 1) / 2) * (SVG_W - 2 * PAD) }
function toSy(y: number) { return PAD + ((1 - y) / 2) * (SVG_H - 2 * PAD) }

function KnowledgeScatter({
  retrieved,
  phase,
}: {
  retrieved: Array<{ doc: RagDoc; score: number }>
  phase: Phase
}) {
  const [hov, setHov] = useState<string | null>(null)
  const topIds = new Set(retrieved.slice(0, 3).map((r) => r.doc.id))
  const showQuery = phaseIndex(phase) >= phaseIndex('searching')

  // Query point sits at centroid of top-3 (or just a fixed pos for idle)
  const qx = toSx(0.1), qy = toSy(0.1)

  return (
    <svg viewBox={`0 0 ${SVG_W} ${SVG_H}`} className="w-full rounded-xl border border-gray-800 bg-gray-900/40">
      {/* Lines from query to top-3 */}
      {showQuery && retrieved.slice(0, 3).map(({ doc }) => (
        <line key={doc.id}
          x1={qx} y1={qy} x2={toSx(doc.x)} y2={toSy(doc.y)}
          stroke="#6366f1" strokeWidth={1} strokeDasharray="4,3" strokeOpacity={0.5} />
      ))}

      {/* Doc dots */}
      {RAG_DOCS.map((doc) => {
        const isTop = topIds.has(doc.id)
        const color = RAG_CATEGORY_COLORS[doc.category]
        const r = isTop && showQuery ? 7 : 4
        return (
          <g key={doc.id}
            onMouseEnter={() => setHov(doc.id)}
            onMouseLeave={() => setHov(null)}
          >
            <circle cx={toSx(doc.x)} cy={toSy(doc.y)} r={r}
              fill={color}
              fillOpacity={isTop && showQuery ? 1 : 0.7}
              stroke={isTop && showQuery ? '#fff' : 'none'}
              strokeWidth={1.5}
              style={{ transition: 'r 0.3s, fill-opacity 0.3s' }}
            />
            {(hov === doc.id || (isTop && showQuery)) && (
              <text x={toSx(doc.x) + 8} y={toSy(doc.y) + 4}
                fill={color} fontSize={9} fontFamily="system-ui">
                {doc.title.split(':')[0].slice(0, 22)}
              </text>
            )}
          </g>
        )
      })}

      {/* Query point */}
      {showQuery && (
        <g>
          <circle cx={qx} cy={qy} r={6} fill="#6366f1" stroke="#a5b4fc" strokeWidth={1.5} />
          <text x={qx + 9} y={qy + 4} fill="#a5b4fc" fontSize={9}>query</text>
        </g>
      )}
    </svg>
  )
}

// ─── Interactive RAG demo ─────────────────────────────────────────────────────

const EXAMPLE_QUERIES = [
  'how does attention work?',
  'what are word embeddings?',
  'what is gradient descent?',
  'how do I reduce hallucinations?',
]

function RAGDemo() {
  const [query, setQuery] = useState('')
  const [phase, setPhase] = useState<Phase>('idle')
  const [retrieved, setRetrieved] = useState<Array<{ doc: RagDoc; score: number }>>([])

  function run(q: string) {
    if (!q.trim() || phase !== 'idle') return
    const results = retrieveDocs(q)
    setPhase('embedding')
    setTimeout(() => { setRetrieved(results); setPhase('searching') }, 600)
    setTimeout(() => setPhase('augmenting'),  1200)
    setTimeout(() => setPhase('generating'),  2000)
    setTimeout(() => setPhase('done'),         2800)
  }

  function reset() { setPhase('idle'); setRetrieved([]) }

  const top = retrieved[0]

  return (
    <div className="rounded-xl border border-gray-800 bg-gray-900/40 p-5">
      {/* Query input */}
      <div className="flex gap-2 mb-3">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && run(query)}
          placeholder="Ask something about AI…"
          className="flex-1 rounded-lg border border-gray-700 bg-gray-800 px-4 py-2 text-sm text-white placeholder-gray-600 focus:border-indigo-500 focus:outline-none"
          disabled={phase !== 'idle'}
        />
        {phase === 'idle' ? (
          <button
            onClick={() => run(query)}
            disabled={!query.trim()}
            className="px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-500 disabled:opacity-40 transition-colors"
          >
            Search
          </button>
        ) : (
          <button
            onClick={reset}
            className="px-4 py-2 rounded-lg bg-gray-800 text-gray-400 text-sm hover:text-white transition-colors"
          >
            Reset
          </button>
        )}
      </div>

      {/* Example queries */}
      {phase === 'idle' && (
        <div className="flex flex-wrap gap-1.5 mb-4">
          {EXAMPLE_QUERIES.map((q) => (
            <button key={q} onClick={() => { setQuery(q); run(q) }}
              className="px-2.5 py-1 rounded-lg text-xs bg-gray-800 text-gray-400 hover:text-white transition-colors">
              {q}
            </button>
          ))}
        </div>
      )}

      {phase !== 'idle' && (
        <>
          <PipelineBar phase={phase} />

          <div className="grid gap-4 sm:grid-cols-2">
            {/* Scatter */}
            <KnowledgeScatter retrieved={retrieved} phase={phase} />

            {/* Right panel: changes per phase */}
            <div className="text-sm">
              {(phase === 'embedding') && (
                <div className="rounded-xl border border-gray-800 bg-gray-900/60 p-4 h-full flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-2xl mb-2">📐</div>
                    <p className="text-gray-400 text-xs">Converting query to a vector…</p>
                    <p className="mt-2 font-mono text-xs text-indigo-300">[0.23, −0.81, 0.55, …]</p>
                  </div>
                </div>
              )}

              {(phase === 'searching') && (
                <div className="space-y-2">
                  <p className="text-xs text-gray-500 mb-2">Top results from knowledge base:</p>
                  {retrieved.map(({ doc, score }, i) => (
                    <div key={doc.id} className={`rounded-lg border p-2.5 ${
                      i === 0 ? 'border-indigo-700 bg-indigo-950/40' : 'border-gray-800 bg-gray-900/30'
                    }`}>
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <p className="text-xs font-medium text-white">{doc.title}</p>
                        <span className="text-xs font-mono text-indigo-400 shrink-0">
                          sim {(0.45 + score * 0.12).toFixed(2)}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 line-clamp-2">{doc.content}</p>
                    </div>
                  ))}
                </div>
              )}

              {(phase === 'augmenting' || phase === 'generating' || phase === 'done') && (
                <div className="rounded-xl border border-gray-800 bg-gray-900/60 p-3 font-mono text-xs leading-relaxed">
                  <p className="text-gray-600 mb-1">--- Context ---</p>
                  {retrieved.map((r) => (
                    <p key={r.doc.id} className="text-gray-400 mb-1 line-clamp-2">
                      <span className="text-gray-600">{r.doc.title}: </span>
                      {r.doc.content.slice(0, 80)}…
                    </p>
                  ))}
                  <p className="text-gray-600 mt-2 mb-1">--- Question ---</p>
                  <p className="text-indigo-300">{query}</p>
                  <p className="text-gray-600 mt-2 mb-1">--- Answer ---</p>
                  {phase === 'generating' && (
                    <span className="inline-block w-2 h-3 bg-indigo-400 animate-pulse" />
                  )}
                  {phase === 'done' && top && (
                    <p className="text-emerald-300">{top.doc.mockResponse}</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

// ─── Module export ────────────────────────────────────────────────────────────

export function RAG({ onComplete, completed }: ModuleProps) {
  return (
    <div className="mx-auto max-w-2xl px-6 py-12 text-white">
      <section className="mb-20 text-center">
        <div className="mb-6 inline-flex h-20 w-20 items-center justify-center rounded-2xl border border-indigo-800 bg-indigo-950/60">
          <span className="text-4xl">📚</span>
        </div>
        <h2 className="mb-4 text-4xl font-bold tracking-tight">RAG</h2>
        <p className="text-lg text-gray-400 leading-relaxed">
          AI chatbots don't have the internet open while they're talking to you — all their
          knowledge was locked in during training. RAG is a way to give them fresh,
          up-to-date information by searching a document library before they answer.
        </p>
      </section>

      <Section number={1} title="The Problem RAG Solves">
        <p className="mb-4 text-gray-300 leading-relaxed">
          Imagine someone who read every book and article ever published, then walked into
          a room with no internet and started answering questions. They'd know an enormous
          amount — but their knowledge would be frozen at the moment they walked in. Ask
          about last week's news and they'd either say "I don't know" or make something up.
          Retraining an AI on new information would cost millions of dollars and take months.
          RAG solves this differently: let the AI quickly search a document library and read
          the relevant results before it answers.
        </p>
        <div className="grid grid-cols-2 gap-4">
          {[
            { icon: '⚠️', title: 'Without RAG', points: ['Knowledge frozen at training cutoff', 'No source citations', 'Hallucinations hard to detect'] },
            { icon: '✅', title: 'With RAG',     points: ['Retrieves current documents', 'Cites specific sources', 'Grounded in verifiable text'] },
          ].map(({ icon, title, points }) => (
            <div key={title} className="rounded-xl border border-gray-800 bg-gray-900/40 p-4">
              <div className="text-2xl mb-2">{icon}</div>
              <p className="font-semibold text-sm mb-2">{title}</p>
              <ul className="space-y-1">
                {points.map((p) => <li key={p} className="text-xs text-gray-500">{p}</li>)}
              </ul>
            </div>
          ))}
        </div>
      </Section>

      <Section number={2} title="The RAG Pipeline">
        <p className="mb-5 text-gray-300 leading-relaxed">
          Here's how RAG works: your question gets converted into a mathematical fingerprint,
          then compared to every document in the library. The most relevant documents get
          pulled out and placed right before your question so the AI can read them. The AI
          then uses those documents to give you a grounded, accurate answer instead of
          relying on potentially outdated memory.
        </p>
        <div className="flex items-start gap-2 overflow-x-auto pb-2">
          {[
            { icon: '❓', step: '1. Query', desc: 'User asks a question' },
            { icon: '📐', step: '2. Embed', desc: 'Query → dense vector' },
            { icon: '🔍', step: '3. Retrieve', desc: 'Top-k similar chunks' },
            { icon: '📝', step: '4. Augment', desc: 'Chunks + question → prompt' },
            { icon: '💬', step: '5. Generate', desc: 'LLM produces answer' },
          ].map(({ icon, step, desc }, i, arr) => (
            <div key={step} className="flex items-center gap-2 shrink-0">
              <div className="rounded-xl border border-gray-800 bg-gray-900/40 p-3 text-center w-28">
                <div className="text-xl mb-1">{icon}</div>
                <p className="text-xs font-semibold text-indigo-300 mb-0.5">{step}</p>
                <p className="text-xs text-gray-600">{desc}</p>
              </div>
              {i < arr.length - 1 && <span className="text-gray-700 text-lg">→</span>}
            </div>
          ))}
        </div>
      </Section>

      <Section number={3} title="Live Demo">
        <p className="mb-4 text-gray-300 leading-relaxed">
          The knowledge base below has 20 short articles about AI concepts. Type a question
          and watch the whole pipeline run live: your question gets converted to a
          fingerprint, the most relevant articles are retrieved, and a grounded answer is
          assembled from them.
        </p>
        <RAGDemo />
      </Section>

      <Section number={4} title="Why It Works">
        <p className="mb-4 text-gray-300 leading-relaxed">
          RAG works because it combines two types of knowledge. The AI's training gave it a
          deep understanding of language, reasoning, and the world in general. The retrieved
          documents give it specific, current, verifiable facts to work from right now.
          Neither alone is enough — an AI with only training memory guesses; a search engine
          with only documents can't reason. Together they produce answers that are both
          thoughtful and accurate.
        </p>
        <div className="grid grid-cols-3 gap-3 text-xs">
          {[
            { term: 'Chunking', def: 'Long documents are split into smaller pieces (around 500 words each) before being stored, so each piece covers one focused idea and is easier to match to a question.' },
            { term: 'Vector store', def: 'The document fingerprints are stored in a special database built for comparing similarity quickly — searching millions of documents in milliseconds.' },
            { term: 'Re-ranking', def: 'After retrieval, a second AI pass re-scores the retrieved documents for actual relevance to the question, making sure only the most useful ones get included.' },
          ].map(({ term, def }) => (
            <div key={term} className="rounded-xl border border-gray-800 bg-gray-900/40 p-3">
              <p className="font-semibold text-indigo-300 mb-1">{term}</p>
              <p className="text-gray-500 leading-snug">{def}</p>
            </div>
          ))}
        </div>
      </Section>

      <section className="mt-4 rounded-2xl border border-indigo-900/60 bg-indigo-950/30 p-8 text-center">
        <div className="mb-2 text-2xl">{completed ? '✅' : '🎯'}</div>
        <h3 className="mb-2 text-xl font-bold">{completed ? 'Module Complete' : 'Ready to continue?'}</h3>
        <p className="mb-6 text-sm text-gray-400">
          {completed
            ? 'Embeddings and Retrieval are now unlocked on the map.'
            : 'Mark complete to unlock the Embeddings and Retrieval nodes.'}
        </p>
        {!completed && (
          <button onClick={onComplete}
            className="rounded-lg bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2 focus:ring-offset-gray-950">
            Mark as Complete
          </button>
        )}
      </section>
    </div>
  )
}
