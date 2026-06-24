import { useState, type ReactNode } from 'react'
import { Quiz, type QuizQuestion } from '../../components/Quiz'

type ModuleProps = { onComplete: () => Promise<void>; completed: boolean }

// ─── Tokenizer ────────────────────────────────────────────────────────────────

const VOCAB = new Map<string, number>([
  // Function words
  ['the', 262], ['a', 64], ['an', 281], ['of', 286], ['to', 284],
  ['and', 290], ['in', 287], ['is', 318], ['it', 340], ['you', 345],
  ['that', 326], ['he', 339], ['was', 373], ['for', 329], ['on', 319],
  ['are', 389], ['with', 351], ['as', 355], ['at', 379], ['be', 307],
  ['by', 416], ['from', 422], ['this', 428], ['have', 423], ['not', 407],
  ['or', 393], ['but', 475], ['what', 437], ['all', 477], ['were', 502],
  ['we', 356], ['when', 618], ['your', 534], ['can', 460], ['so', 523],
  ['there', 612], ['each', 924], ['which', 543], ['she', 673], ['do', 466],
  ['how', 703], ['their', 616], ['if', 611], ['will', 481], ['up', 510],
  ['other', 584], ['about', 546], ['out', 503], ['then', 788], ['them', 606],
  ['her', 607], ['would', 574], ['like', 763], ['into', 656], ['time', 640],
  ['has', 468], ['no', 412], ['way', 835], ['could', 722], ['my', 616],
  ['than', 621], ['been', 648], ['who', 508], ['its', 663], ['now', 783],
  ['more', 689], ['go', 467], ['see', 629], ['did', 750], ['get', 588],
  ['come', 727], ['may', 743], ['some', 617], ['these', 777], ['two', 734],
  ['make', 787], ['look', 804], ['first', 717], ['him', 515], ['me', 502],
  ['new', 649], ['old', 1468], ['good', 922], ['bad', 1460], ['big', 1117],
  // Nouns
  ['cat', 9246], ['dog', 3290], ['man', 582], ['word', 1573], ['book', 1336],
  ['door', 3424], ['key', 1994], ['house', 2436], ['city', 1748], ['data', 1366],
  ['model', 2746], ['layer', 7679], ['weight', 3463], ['text', 2420],
  ['sat', 3332], ['walked', 13073], ['gave', 6957],
  // AI / tech
  ['neural', 18893], ['network', 3127], ['train', 3047], ['learn', 2193],
  ['token', 11241], ['language', 3303], ['attention', 3241], ['input', 5128],
  ['output', 5072], ['loss', 2994], ['gradient', 19979], ['vector', 15879],
  ['transformer', 37979], ['embedding', 11525], ['chat', 8573],
  // Common subwords (continuation pieces after the first chunk)
  ['ing', 278], ['tion', 295], ['ed', 276], ['ly', 306], ['er', 263],
  ['est', 395], ['un', 555], ['re', 260], ['pre', 883], ['dis', 1221],
  ['al', 435], ['ful', 992], ['less', 1365], ['ness', 1108], ['ment', 434],
  ['ous', 607], ['ive', 444], ['ize', 1096], ['ation', 784], ['ion', 295],
  ['ent', 678], ['ant', 902], ['ism', 1784], ['ist', 1175], ['ity', 1163],
  ['able', 1498], ['ible', 4335], ['ical', 2649], ['ize', 1096], ['ate', 779],
  // Punctuation
  [',', 11], ['.', 13], ['!', 0], ['?', 30], ["'", 6], ['"', 198],
  [':', 25], [';', 26], ['-', 12], ['(', 7], [')', 8],
])

interface Token {
  text: string
  id: number
  isContinuation: boolean
}

function tokenizeText(text: string): Token[] {
  if (!text.trim()) return []

  const tokens: Token[] = []
  const chunks = text.match(/[a-zA-Z0-9]+|[^\w\s]/g) ?? []

  for (const chunk of chunks) {
    // Punctuation
    if (/^[^\w]$/.test(chunk)) {
      tokens.push({ text: chunk, id: VOCAB.get(chunk) ?? chunk.charCodeAt(0), isContinuation: false })
      continue
    }
    // Number
    if (/^\d+$/.test(chunk)) {
      tokens.push({ text: chunk, id: 4764 + (parseInt(chunk[0]) % 10), isContinuation: false })
      continue
    }
    // Word — greedy longest-match from vocab
    const lower = chunk.toLowerCase()
    let remaining = lower
    let origRemaining = chunk
    let isFirst = true

    while (remaining.length > 0) {
      let matched = false
      for (let len = Math.min(remaining.length, 12); len >= 1; len--) {
        const sub = remaining.slice(0, len)
        if (VOCAB.has(sub)) {
          tokens.push({
            text: isFirst ? origRemaining.slice(0, len) : `##${origRemaining.slice(0, len)}`,
            id: VOCAB.get(sub)!,
            isContinuation: !isFirst,
          })
          remaining = remaining.slice(len)
          origRemaining = origRemaining.slice(len)
          isFirst = false
          matched = true
          break
        }
      }
      if (!matched) {
        tokens.push({
          text: isFirst ? origRemaining[0] : `##${origRemaining[0]}`,
          id: origRemaining.charCodeAt(0),
          isContinuation: !isFirst,
        })
        remaining = remaining.slice(1)
        origRemaining = origRemaining.slice(1)
        isFirst = false
      }
    }
  }

  return tokens
}

// ─── Palette ──────────────────────────────────────────────────────────────────

const CHIPS = [
  'bg-indigo-900/80 border border-indigo-700/50 text-indigo-200',
  'bg-violet-900/80 border border-violet-700/50 text-violet-200',
  'bg-blue-900/80 border border-blue-700/50 text-blue-200',
  'bg-teal-900/80 border border-teal-700/50 text-teal-200',
  'bg-emerald-900/80 border border-emerald-700/50 text-emerald-200',
  'bg-fuchsia-900/80 border border-fuchsia-700/50 text-fuchsia-200',
]

// ─── Components ───────────────────────────────────────────────────────────────

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

const PRESETS = [
  'The neural network learns from data',
  'Tokenization splits text into pieces',
  'ChatGPT understands context remarkably well',
  'Type your own sentence here',
]

function TokenizerDemo() {
  const [text, setText] = useState(PRESETS[0])
  const [hovered, setHovered] = useState<number | null>(null)

  const tokens = tokenizeText(text)

  return (
    <div className="rounded-xl border border-gray-800 bg-gray-900/40 p-6">
      {/* Preset buttons */}
      <div className="flex flex-wrap gap-1.5 mb-3">
        {PRESETS.map((p, i) => (
          <button
            key={i}
            onClick={() => setText(p)}
            className={`px-2.5 py-1 rounded-lg text-xs transition-colors ${
              text === p ? 'bg-indigo-700 text-white' : 'bg-gray-800 text-gray-400 hover:text-white'
            }`}
          >
            {i < 3 ? p.slice(0, 22) + '…' : p}
          </button>
        ))}
      </div>

      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-3 text-sm text-white placeholder-gray-600 focus:border-indigo-500 focus:outline-none resize-none"
        rows={2}
        placeholder="Type something…"
        spellCheck={false}
      />

      {/* Token chips */}
      <div className="mt-4 min-h-[52px] flex flex-wrap gap-1.5 items-start">
        {tokens.length === 0 ? (
          <p className="text-sm text-gray-600">Tokens appear here…</p>
        ) : (
          tokens.map((tok, i) => {
            const chipClass = CHIPS[i % CHIPS.length]
            return (
              <div key={i} className="relative">
                <span
                  onMouseEnter={() => setHovered(i)}
                  onMouseLeave={() => setHovered(null)}
                  className={`inline-block rounded px-2 py-1 text-xs font-mono cursor-default select-none ${chipClass} ${
                    tok.isContinuation ? 'opacity-60' : ''
                  }`}
                >
                  {tok.text}
                </span>
                {hovered === i && (
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 z-10 rounded bg-gray-800 border border-gray-700 px-2 py-1 whitespace-nowrap pointer-events-none">
                    <span className="text-gray-500 text-xs">id </span>
                    <span className="text-indigo-300 text-xs font-mono">{tok.id}</span>
                  </div>
                )}
              </div>
            )
          })
        )}
      </div>

      <div className="mt-3 flex items-center gap-4 text-xs text-gray-500 border-t border-gray-800 pt-3">
        <span>
          <span className="text-white font-mono">{tokens.length}</span> tokens
        </span>
        <span>
          <span className="text-white font-mono">{text.replace(/\s/g, '').length}</span> chars (no spaces)
        </span>
        <span className="ml-auto text-gray-700">Hover a token → see its ID</span>
      </div>
    </div>
  )
}

// ─── BPE steps illustration ───────────────────────────────────────────────────

function BPESteps() {
  const steps = [
    { label: 'Start: characters', tokens: ['l', 'o', 'w', 'e', 'r'] },
    { label: 'Merge most common pair: l+o → lo', tokens: ['lo', 'w', 'e', 'r'] },
    { label: 'Merge: lo+w → low', tokens: ['low', 'e', 'r'] },
    { label: 'Merge: e+r → er', tokens: ['low', 'er'] },
  ]
  const [step, setStep] = useState(0)

  return (
    <div className="rounded-xl border border-gray-800 bg-gray-900/40 p-5">
      <p className="text-xs text-gray-500 mb-3 font-mono">Word: "lower"</p>
      <div className="flex flex-wrap gap-1.5 min-h-[36px] mb-3">
        {steps[step].tokens.map((t, i) => (
          <span key={i} className={`px-2.5 py-1 rounded text-sm font-mono border ${CHIPS[i % CHIPS.length]}`}>
            {t}
          </span>
        ))}
      </div>
      <p className="text-xs text-gray-400 mb-4">{steps[step].label}</p>
      <div className="flex gap-2">
        <button
          disabled={step === 0}
          onClick={() => setStep((s) => s - 1)}
          className="px-3 py-1.5 rounded-lg bg-gray-800 text-gray-400 text-xs disabled:opacity-30 hover:text-white transition-colors"
        >
          ← Back
        </button>
        <button
          disabled={step === steps.length - 1}
          onClick={() => setStep((s) => s + 1)}
          className="px-3 py-1.5 rounded-lg bg-indigo-600 text-white text-xs disabled:opacity-30 hover:bg-indigo-500 transition-colors"
        >
          Next step →
        </button>
        <span className="ml-auto text-xs text-gray-600 self-center">
          Step {step + 1} / {steps.length}
        </span>
      </div>
    </div>
  )
}

// ─── Module export ────────────────────────────────────────────────────────────

const TOK_QUIZ: QuizQuestion[] = [
  {
    q: "Why don't language models simply use whole words as their basic unit?",
    options: ['Words are too short to carry meaning', 'The vocabulary would be unmanageably large and new words would be impossible to handle', 'Words contain too many characters', "Models can't store text in UTF-8"],
    answer: 1,
    explanation: 'English has hundreds of thousands of words; new ones appear constantly. Subword tokenization handles any text with a compact, fixed vocabulary.',
  },
  {
    q: 'What does Byte Pair Encoding (BPE) do?',
    options: ['Splits every word into individual characters permanently', 'Starts with characters and iteratively merges the most frequent adjacent pair until the vocabulary size is reached', 'Assigns a random ID to each word', 'Compresses text using Huffman coding'],
    answer: 1,
    explanation: 'BPE builds its vocabulary by repeatedly merging the most common adjacent pair. Common words end up as single tokens; rare ones stay split into subwords.',
  },
  {
    q: 'After tokenization, what happens to each token?',
    options: ['It is converted to audio', 'It is mapped to a unique integer ID, which is used to look up a dense embedding vector', 'It is sent to the attention layer as raw text', 'It is compressed with gzip'],
    answer: 1,
    explanation: 'Tokens become integer IDs. The model looks each ID up in an embedding table to get a dense vector — the actual input to the transformer layers.',
  },
  {
    q: 'Why does GPT-4 charge by token rather than by word?',
    options: ['Because words are ambiguous to count', 'Processing cost scales with the number of tokens the model must attend to, not word count', 'Because the API measures bytes', 'Tokens are always longer than words'],
    answer: 1,
    explanation: 'Each token requires compute in every attention head. Cost is proportional to sequence length in tokens, so that is what billing is based on.',
  },
  {
    q: '"unhappiness" is likely split into subword tokens like "un" + "happiness". Why?',
    options: ['The tokenizer removes all prefixes', "It's uncommon enough that it was never merged into a single high-frequency token during BPE training", 'It has too many characters for one token', 'All words starting with "un" are always split'],
    answer: 1,
    explanation: 'BPE only merges pairs that appear frequently. "unhappiness" is rare, so its parts never reached the frequency threshold for a single merged token.',
  },
]

export function Tokenization({ onComplete, completed }: ModuleProps) {
  return (
    <div className="mx-auto max-w-2xl px-6 py-12 text-white">
      {/* Hero */}
      <section className="mb-20 text-center">
        <div className="mb-6 inline-flex h-20 w-20 items-center justify-center rounded-2xl border border-indigo-800 bg-indigo-950/60">
          <span className="text-4xl">🔤</span>
        </div>
        <h2 className="mb-4 text-4xl font-bold tracking-tight">Tokenization</h2>
        <p className="text-lg text-gray-400 leading-relaxed">
          Before a model can read a sentence, it must break it into pieces. The choice of
          pieces changes everything about how language is learned.
        </p>
      </section>

      <Section number={1} title="Why Not Words or Characters?">
        <p className="mb-4 text-gray-300 leading-relaxed">
          You might think: just split the text into individual words. But English alone has
          hundreds of thousands of words — and new slang, typos, and technical terms appear
          every day. The vocabulary would be unmanageably large, and the AI still couldn't
          handle anything it hadn't seen before. The opposite approach — splitting into
          individual letters — keeps the vocabulary tiny but forces the AI to figure out
          that c + a + t means cat, which is a much harder problem. Neither extreme works.
        </p>
        <div className="grid grid-cols-3 gap-3 text-xs">
          {[
            { approach: 'Characters', vocab: '~256', pro: 'Handles any input — even typos and made-up words', con: 'Very long sequences; the AI has to rediscover what words mean from scratch' },
            { approach: 'Words', vocab: '~100k+', pro: 'Natural, human-readable units', con: 'Can\'t handle typos, new words, or uncommon terms it hasn\'t seen' },
            { approach: 'Subwords', vocab: '~50k', pro: 'Best of both: common words stay whole, rare words split into familiar pieces', con: 'Requires a training step to learn the best splits', highlight: true },
          ].map(({ approach, vocab, pro, con, highlight }) => (
            <div key={approach} className={`rounded-xl border p-3 ${highlight ? 'border-indigo-700 bg-indigo-950/40' : 'border-gray-800 bg-gray-900/30'}`}>
              <p className={`font-semibold mb-1 ${highlight ? 'text-indigo-300' : 'text-gray-300'}`}>{approach}</p>
              <p className="text-gray-500 mb-2">vocab: {vocab}</p>
              <p className="text-emerald-600 mb-1">✓ {pro}</p>
              <p className="text-red-700">✗ {con}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section number={2} title="Byte Pair Encoding">
        <p className="mb-4 text-gray-300 leading-relaxed">
          BPE (Byte Pair Encoding) finds the clever middle ground. It starts with individual
          letters, then repeatedly glues together the most common pairs. "lower" starts as
          l, o, w, e, r. Then "lo" gets merged because it appears a lot. Then "low". Then
          "er". Now "lower" is just two pieces instead of five letters. Common words like
          "the" end up as a single chunk. Rarer words like "sesquipedalian" get split into
          recognizable parts. Step through the example below to watch it work.
        </p>
        <BPESteps />
        <p className="mt-4 text-sm text-gray-500 leading-relaxed">
          GPT-2 learned exactly 50,257 of these chunks. Common words like{' '}
          <span className="font-mono text-gray-300">" the"</span> are a single token.
          Longer or rarer words get split up — for example,{' '}
          <span className="font-mono text-gray-300">"tokenization"</span> becomes{' '}
          <span className="font-mono text-gray-300">["token", "##ization"]</span>{' '}
          (the ## marks a continuation piece).
        </p>
      </Section>

      <Section number={3} title="Try It">
        <p className="mb-4 text-gray-300 leading-relaxed">
          Type anything below and watch it get split into tokens in real time. Each coloured
          chip is one token. Common words usually stay in one piece. Less common words split
          into smaller parts (marked with <span className="font-mono text-gray-300">##</span>).
          Hover any token to see the number the AI actually uses for it.
        </p>
        <TokenizerDemo />
      </Section>

      <Section number={4} title="Tokens Are Numbers">
        <p className="mb-4 text-gray-300 leading-relaxed">
          Here's the part most people don't realise: the AI never actually reads words.
          Every token gets replaced with a number (its ID), and that number is looked up
          in a giant table to retrieve a list of numbers that represent its meaning. From
          that point on, it's all math. The example below shows exactly what that conversion
          looks like step by step.
        </p>
        <div className="rounded-xl border border-gray-800 bg-gray-900/40 p-4 font-mono text-sm">
          <p className="text-gray-500 mb-2">// Input to a language model</p>
          <p className="text-gray-300">"The cat sat"</p>
          <p className="text-gray-500 mt-1 mb-1">→ tokenize →</p>
          <p className="text-indigo-300">["The", " cat", " sat"]</p>
          <p className="text-gray-500 mt-1 mb-1">→ lookup IDs →</p>
          <p className="text-emerald-300">[464, 3797, 3332]</p>
          <p className="text-gray-500 mt-1 mb-1">→ embed →</p>
          <p className="text-purple-300">[[0.23, -0.81, …], [0.55, 0.12, …], [-0.04, 0.77, …]]</p>
        </div>
      </Section>

      <Section number={5} title="Quiz Yourself">
        <p className="mb-4 leading-relaxed text-gray-300">Check whether tokens, BPE, and the text-to-numbers pipeline have clicked.</p>
        <Quiz questions={TOK_QUIZ} title="Tokenization" />
      </Section>

      {/* Completion */}
      <section className="mt-4 rounded-2xl border border-indigo-900/60 bg-indigo-950/30 p-8 text-center">
        <div className="mb-2 text-2xl">{completed ? '✅' : '🎯'}</div>
        <h3 className="mb-2 text-xl font-bold">
          {completed ? 'Module Complete' : 'Ready to mark this done?'}
        </h3>
        <p className="mb-6 text-sm text-gray-400">
          {completed
            ? 'You understand how text becomes numbers — the first step in every language model.'
            : 'Mark this complete to track your progress through the concept map.'}
        </p>
        {!completed && (
          <button
            onClick={onComplete}
            className="rounded-lg bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2 focus:ring-offset-gray-950"
          >
            Mark as Complete
          </button>
        )}
      </section>
    </div>
  )
}
