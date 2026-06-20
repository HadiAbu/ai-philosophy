export type RagCategory = 'neural' | 'language' | 'retrieval' | 'prompting'

export interface RagDoc {
  id: string
  title: string
  content: string
  keywords: string[]
  x: number  // 2D scatter coord -1..1
  y: number
  category: RagCategory
  mockResponse: string
}

export const RAG_DOCS: RagDoc[] = [
  // ── Neural / Training cluster ──────────────────────────────────────────────
  {
    id: 'ml-basics',
    title: 'What is Machine Learning?',
    content: 'Machine learning is a subset of AI where systems learn patterns from data rather than following explicit rules. A model is trained on labelled examples and generalises to new inputs it has never seen.',
    keywords: ['machine', 'learning', 'ml', 'model', 'train', 'data', 'pattern', 'artificial', 'intelligence', 'supervised'],
    x: 0.48, y: 0.60, category: 'neural',
    mockResponse: 'Machine learning lets computers learn from examples rather than hand-coded rules. A model is shown many labelled inputs, adjusts its internal parameters to minimise prediction errors, and can then generalise to new data.',
  },
  {
    id: 'backprop',
    title: 'Backpropagation',
    content: 'Backpropagation computes gradients of the loss with respect to every weight by applying the chain rule from the output layer back to the input. Those gradients are then used by gradient descent to update the weights and reduce training loss.',
    keywords: ['backprop', 'backpropagation', 'gradient', 'chain', 'rule', 'loss', 'weight', 'train', 'descent', 'update'],
    x: 0.60, y: 0.50, category: 'neural',
    mockResponse: 'Backpropagation efficiently computes how much each weight contributed to the error, by flowing gradients backwards through the network using the chain rule. This tells gradient descent exactly how to adjust each weight to reduce the loss.',
  },
  {
    id: 'neural-networks',
    title: 'Neural Networks',
    content: 'A neural network is a stack of layers, each containing neurons that apply a weighted sum followed by a non-linear activation function. Deep networks can learn hierarchical representations: early layers detect edges, later layers detect objects.',
    keywords: ['neural', 'network', 'neuron', 'layer', 'hidden', 'perceptron', 'deep', 'activation', 'weight', 'bias'],
    x: 0.52, y: 0.68, category: 'neural',
    mockResponse: 'Neural networks are composed of layers of neurons. Each neuron computes a weighted sum of its inputs and passes the result through an activation function. Stacking many layers lets the network learn increasingly abstract features from raw data.',
  },
  {
    id: 'gradient-descent',
    title: 'Gradient Descent',
    content: 'Gradient descent iteratively moves model weights in the direction that reduces the loss. The learning rate controls step size; too large causes divergence, too small causes slow convergence. Adam and AdamW are popular adaptive variants.',
    keywords: ['gradient', 'descent', 'optimize', 'loss', 'minimum', 'learning', 'rate', 'adam', 'update', 'converge'],
    x: 0.65, y: 0.58, category: 'neural',
    mockResponse: 'Gradient descent is the core optimisation algorithm in deep learning. At each step, it computes the gradient of the loss and moves weights in the opposite direction by a small amount (the learning rate). Over many steps the model converges to a low-loss solution.',
  },
  {
    id: 'activations',
    title: 'Activation Functions',
    content: 'Activation functions introduce non-linearity, allowing neural networks to learn functions that are not just linear combinations of inputs. Without activation functions, any depth of network collapses to a single linear layer. ReLU is the most widely used today.',
    keywords: ['activation', 'function', 'relu', 'sigmoid', 'tanh', 'nonlinear', 'neuron', 'gelu', 'swish'],
    x: 0.56, y: 0.45, category: 'neural',
    mockResponse: 'Activation functions add non-linearity to neural networks. Without them, stacking layers is mathematically equivalent to a single matrix multiplication. ReLU (max(0, z)) is the most common choice because it avoids vanishing gradients and is computationally cheap.',
  },

  // ── Language model cluster ─────────────────────────────────────────────────
  {
    id: 'transformers',
    title: 'How Transformers Work',
    content: 'Transformers replace sequential RNN processing with parallel self-attention, allowing every token to attend to every other token simultaneously. This enables faster training and better capture of long-range dependencies in text.',
    keywords: ['transformer', 'attention', 'architecture', 'encoder', 'decoder', 'parallel', 'sequence', 'language', 'model'],
    x: -0.20, y: 0.60, category: 'language',
    mockResponse: 'Transformers process all tokens in parallel using self-attention, where each token can directly attend to any other token in the sequence. This solves the long-range dependency problem that plagued RNNs and enables models to scale to very large sizes.',
  },
  {
    id: 'self-attention',
    title: 'Self-Attention Mechanism',
    content: 'Self-attention computes three projections per token — Query, Key, and Value. Attention scores are the dot product of queries and keys, scaled and softmaxed to produce weights, which are then applied to the values. Multi-head attention runs this in parallel across H independent subspaces.',
    keywords: ['attention', 'self', 'query', 'key', 'value', 'qkv', 'head', 'multi', 'mechanism', 'softmax', 'score'],
    x: -0.32, y: 0.52, category: 'language',
    mockResponse: 'Self-attention lets each token ask "which other tokens are most relevant to me?" using learned Query, Key, and Value projections. The similarity between a token\'s query and every key determines how much of each value it incorporates into its output representation.',
  },
  {
    id: 'bert',
    title: 'BERT: Bidirectional Transformers',
    content: 'BERT (2018) pre-trains a transformer encoder by masking random tokens and predicting them from both left and right context simultaneously. This bidirectional training produces rich contextual representations, making it excellent for understanding tasks like classification and QA.',
    keywords: ['bert', 'bidirectional', 'pretrain', 'mask', 'mlm', 'encoder', 'classification', 'understand'],
    x: -0.15, y: 0.70, category: 'language',
    mockResponse: 'BERT is a transformer encoder pre-trained by masking 15% of tokens and learning to predict them from their surrounding context. Because it sees both left and right context simultaneously, BERT develops strong representations for language understanding tasks.',
  },
  {
    id: 'gpt',
    title: 'GPT and Autoregressive Models',
    content: 'GPT models are transformer decoders trained to predict the next token from all preceding tokens. By scaling this simple objective to hundreds of billions of parameters and trillions of tokens, they develop emergent capabilities including reasoning, translation, and code generation.',
    keywords: ['gpt', 'autoregressive', 'predict', 'next', 'token', 'decode', 'generate', 'language', 'scale', 'llm'],
    x: -0.28, y: 0.68, category: 'language',
    mockResponse: 'GPT is trained on a single objective: predict the next token. This simple task, applied at massive scale, forces the model to learn grammar, facts, reasoning, and world knowledge implicitly. The decoder-only architecture makes generation natural and efficient.',
  },
  {
    id: 'language-model',
    title: 'How Language Models Work',
    content: 'A language model assigns probabilities to sequences of tokens. During generation, it repeatedly samples from the probability distribution over the next token given all previous tokens. Temperature controls randomness: low temperature makes the model more deterministic.',
    keywords: ['language', 'model', 'llm', 'probability', 'generate', 'text', 'token', 'sample', 'temperature'],
    x: -0.10, y: 0.45, category: 'language',
    mockResponse: 'Language models work by learning the probability of each next token given all previous tokens. During generation, the model samples from this distribution repeatedly to produce coherent text. The temperature parameter controls how "creative" or "safe" the sampling is.',
  },
  {
    id: 'tokenization-doc',
    title: 'Tokenization',
    content: 'Tokenization converts raw text into integer token IDs. Byte Pair Encoding (BPE) iteratively merges frequent character pairs until the vocabulary reaches its target size (typically 50,000–100,000 tokens). Common words become single tokens; rare words split into subwords.',
    keywords: ['token', 'tokenize', 'bpe', 'subword', 'vocab', 'vocabulary', 'split', 'text', 'word', 'byte', 'pair'],
    x: -0.38, y: 0.40, category: 'language',
    mockResponse: 'Tokenization maps text to integer IDs using a pre-built vocabulary. BPE builds this vocabulary by merging the most frequent character pairs repeatedly. Common words like "the" become a single token; rare words like "tokenization" split into familiar subwords.',
  },

  // ── Retrieval cluster ──────────────────────────────────────────────────────
  {
    id: 'embeddings-doc',
    title: 'Word and Sentence Embeddings',
    content: 'An embedding is a dense vector that represents the meaning of a word or sentence. Models like Word2Vec learn that semantically similar words have nearby vectors. Modern sentence encoders produce embeddings where similar meanings cluster together in the vector space.',
    keywords: ['embedding', 'vector', 'word', 'sentence', 'represent', 'semantic', 'space', 'meaning', 'dense', 'encode'],
    x: 0.45, y: -0.25, category: 'retrieval',
    mockResponse: 'Embeddings are dense vectors that encode meaning numerically. Words with similar meanings end up close together in embedding space — you can even do arithmetic: king − man + woman ≈ queen. Modern sentence encoders extend this to full sentences and paragraphs.',
  },
  {
    id: 'rag-doc',
    title: 'Retrieval-Augmented Generation (RAG)',
    content: 'RAG augments an LLM with a retrieval step: the user query is embedded, similar documents are fetched from a vector database, and both the query and retrieved context are passed to the model. This grounds responses in real documents and reduces hallucinations.',
    keywords: ['rag', 'retrieval', 'augmented', 'generation', 'retrieve', 'context', 'knowledge', 'document', 'vector', 'ground'],
    x: 0.58, y: -0.38, category: 'retrieval',
    mockResponse: 'RAG works by embedding the user\'s question, searching a vector database for the most relevant document chunks, and prepending them to the prompt as context. The LLM then generates an answer grounded in retrieved facts rather than relying on memorised training data alone.',
  },
  {
    id: 'vector-search',
    title: 'Vector Search',
    content: 'Vector search finds the most similar items in a database by computing distances between embedding vectors. Unlike keyword search, it captures semantic similarity: "automobile" will match "car" even without shared words. Approximate methods like HNSW make billion-scale search practical.',
    keywords: ['vector', 'search', 'similarity', 'nearest', 'neighbour', 'cosine', 'database', 'index', 'semantic', 'hnsw'],
    x: 0.65, y: -0.48, category: 'retrieval',
    mockResponse: 'Vector search works by converting all documents into embedding vectors and storing them in a specialised index. A query is embedded the same way, and the index returns the documents whose vectors are closest — capturing semantic similarity rather than exact keyword matches.',
  },
  {
    id: 'cosine-similarity',
    title: 'Cosine Similarity',
    content: 'Cosine similarity measures the angle between two vectors: cos(θ) = A·B / (|A|·|B|). It ranges from −1 (opposite) to 1 (identical direction), ignoring magnitude. This makes it ideal for comparing embedding vectors of different lengths.',
    keywords: ['cosine', 'similarity', 'dot', 'product', 'angle', 'vector', 'metric', 'distance', 'measure'],
    x: 0.55, y: -0.55, category: 'retrieval',
    mockResponse: 'Cosine similarity measures how aligned two vectors are regardless of their lengths, making it ideal for comparing embeddings. A similarity of 1 means identical direction (very similar meaning), 0 means orthogonal (unrelated), and −1 means opposite meaning.',
  },

  // ── Prompting cluster ──────────────────────────────────────────────────────
  {
    id: 'few-shot',
    title: 'Few-Shot Learning',
    content: 'Few-shot learning lets an LLM solve new tasks by showing it 2–10 worked examples in the prompt. No gradient updates occur — the model adapts purely from in-context examples. This is possible because large models develop broad meta-learning capabilities during pretraining.',
    keywords: ['few', 'shot', 'example', 'prompt', 'in-context', 'learn', 'demonstrate', 'inference', 'zero', 'meta'],
    x: -0.38, y: -0.35, category: 'prompting',
    mockResponse: 'Few-shot learning works by including a handful of input-output examples directly in the prompt. The model reads the pattern from the examples and applies it to a new input — no fine-tuning required. Larger models tend to be dramatically better at few-shot learning.',
  },
  {
    id: 'prompt-engineering',
    title: 'Prompt Engineering',
    content: 'Prompt engineering crafts inputs to elicit better model outputs. Techniques include: chain-of-thought (asking the model to reason step by step), role assignment (system prompts), output format specification, and breaking complex tasks into subtasks.',
    keywords: ['prompt', 'engineer', 'instruction', 'chain', 'thought', 'system', 'role', 'format', 'reasoning', 'craft'],
    x: -0.52, y: -0.42, category: 'prompting',
    mockResponse: 'Prompt engineering improves model outputs by shaping how the model is instructed. Key techniques: chain-of-thought prompting asks the model to think step-by-step before answering; role prompts set the model\'s persona; output format instructions constrain the response structure.',
  },
  {
    id: 'hallucinations',
    title: 'AI Hallucinations',
    content: 'LLMs sometimes generate plausible-sounding but false information — called hallucinations. This happens because models are trained to produce coherent text, not to verify factual accuracy. RAG and grounding techniques help by anchoring responses to retrieved, verifiable sources.',
    keywords: ['hallucination', 'hallucinate', 'false', 'fact', 'accurate', 'error', 'wrong', 'fabricate', 'confabulate', 'ground'],
    x: -0.42, y: -0.55, category: 'prompting',
    mockResponse: 'Hallucinations occur because language models are optimised to produce fluent, coherent text, not necessarily true text. When the model doesn\'t know something, it may still generate a confident-sounding answer. RAG reduces hallucinations by giving the model real documents to reference.',
  },
  {
    id: 'fine-tuning',
    title: 'Fine-Tuning',
    content: 'Fine-tuning updates a pre-trained model\'s weights on a smaller task-specific dataset, adapting it to a target domain. Parameter-efficient methods like LoRA freeze most weights and train only small adapter matrices, reducing compute cost by 10–100×.',
    keywords: ['fine', 'tune', 'finetune', 'adapt', 'task', 'pretrain', 'lora', 'parameter', 'efficient', 'domain'],
    x: -0.25, y: -0.48, category: 'prompting',
    mockResponse: 'Fine-tuning takes a pre-trained model and continues training it on a smaller, task-specific dataset. This adapts the model\'s general knowledge to a specific domain or behaviour. LoRA (Low-Rank Adaptation) makes this efficient by only training a small number of additional parameters.',
  },
  {
    id: 'chatgpt',
    title: 'How ChatGPT Works',
    content: 'ChatGPT is built on GPT with Reinforcement Learning from Human Feedback (RLHF). Human raters score model responses; a reward model is trained on those scores; then the GPT model is fine-tuned to maximise reward using PPO. This aligns the model with human preferences.',
    keywords: ['chatgpt', 'chat', 'assistant', 'rlhf', 'feedback', 'human', 'align', 'instruction', 'tune', 'reward', 'ppo'],
    x: -0.55, y: -0.30, category: 'prompting',
    mockResponse: 'ChatGPT starts from a GPT base model then adds RLHF: human labellers rate pairs of responses, a reward model learns their preferences, and the GPT model is fine-tuned using reinforcement learning to maximise that reward. This makes the model helpful, harmless, and honest.',
  },
]

export const RAG_CATEGORY_COLORS: Record<RagCategory, string> = {
  neural:    '#818cf8',
  language:  '#34d399',
  retrieval: '#fb923c',
  prompting: '#f472b6',
}
