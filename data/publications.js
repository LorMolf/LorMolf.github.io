export const me = "Lorenzo Molfetta";

export const venueLinks = {
  "ACL": "https://2026.aclweb.org/",
  "AAAI": "https://aaai.org/aaai-conference/",
  "EMNLP": "https://2025.emnlp.org/",
  "ECAI": "https://ecai2025.org/",
  "IJCAI": "https://www.ijcai.org/",
  "SISAP": "https://sisap.org/",
  "Artificial Intelligence and Law": "https://www.springer.com/journal/10506"
};

export const publications = [
  {
    id: "sycophants",
    title: "Sycophants in the Courtroom: Are LLMs Fragile to Juridical Authority and Evolving Legal Standards?",
    authors: "Lorenzo Molfetta, Alessio Cocchieri, Luca Ragazzi, Ilaria Bartolini, Mirko Patella, Gianluca Moro",
    venue: "ACL", year: 2026, type: "conference", selected: true, role: "first",
    tags: ["Legal NLP", "LLM robustness", "Evaluation"],
    tldr: "We probe whether LLMs bend their answers to juridical authority and to shifting legal standards, and how fragile they are to such pressure in legal QA."
  },
  {
    id: "ports",
    title: "PORTS: Preference-Optimized Retrievers for Tool Selection with Large Language Models",
    authors: "Lorenzo Molfetta, Giacomo Frisoni, Niccolò Monaldini, Gianluca Moro",
    venue: "EMNLP", year: 2025, type: "conference", selected: true, role: "first",
    tags: ["Tool use", "Retrieval", "LLMs"],
    tldr: "PORTS trains a retriever to pre-select the most useful tools for an LLM, using a preference signal derived from the LLM's own downstream performance.",
    abstract: "Integrating external tools with Large Language Models (LLMs) has emerged as a promising paradigm for accomplishing complex tasks. Since LLMs still struggle to effectively manage large tool collections, researchers have begun exploring retrieval-based methods to pre-select the most relevant options, addressing input length and latency constraints. However, existing retrievers are often misaligned with tool-calling LLMs due to their separate training processes. This paper presents PORTS, a novel odds-ratio preference optimization method for training retrievers aimed at tool selection. Using a perplexity-inspired preference signal from a frozen LLM, our approach fine-tunes a retriever to find helpful tools by optimizing the correlation between the selection probabilities and the downstream performances while jointly enforcing a contrastive semantic loss between documentation embeddings. PORTS establishes the first supervised framework for explicitly aligning retrievers with the downstream tool-calling task.",
    figure: "/assets/fig-ports.png",
    figureCaption: "PORTS — a preference-optimized retriever aligned with a frozen tool-calling LLM."
  },
  {
    id: "feast",
    title: "FEAST: Retrieval-Augmented Multi-Hierarchical Food Classification for the FoodEx2 System",
    authors: "Lorenzo Molfetta, Silvia Cocchieri, Alessio Fantazzini, Giacomo Frisoni, Luca Ragazzi, Gianluca Moro",
    venue: "ECAI", year: 2025, type: "conference", selected: true, role: "first",
    tags: ["Retrieval-augmented", "Food / health", "Classification"],
    tldr: "A retrieval-augmented classifier over the multi-hierarchical FoodEx2 food-coding taxonomy."
  },
  {
    id: "graph-of-mark",
    title: "Graph-of-Mark: Promote Spatial Reasoning in Multimodal Language Models with Graph-based Visual Prompting",
    authors: "Giacomo Frisoni, Lorenzo Molfetta, Marco Buzzoni, Gianluca Moro",
    venue: "AAAI", year: 2026, type: "conference", selected: true, role: "cofirst",
    tags: ["Multimodal", "Spatial reasoning", "Visual prompting"],
    tldr: "Graph-based visual prompting that improves spatial reasoning in multimodal language models."
  },
  {
    id: "comma",
    title: "COMMA: A Multi-task and Multi-lingual Dataset of Constitutional Verdicts",
    authors: "Luca Ragazzi, Giacomo Frisoni, Gianluca Moro, Paolo Italiani, Lorenzo Molfetta, Valentina Folin",
    venue: "Artificial Intelligence and Law", year: 2026, type: "journal", selected: true, role: "cofirst",
    tags: ["Legal NLP", "Dataset", "Multilingual"],
    tldr: "A multi-task, multilingual dataset of constitutional-court verdicts for legal NLP research."
  },
  {
    id: "nesy-survey",
    title: "Neuro-Symbolic Artificial Intelligence: A Task-Directed Survey in the Black-Box Models Era",
    authors: "Giovanni Pio Delvecchio, Lorenzo Molfetta, Gianluca Moro",
    venue: "IJCAI", year: 2025, type: "conference", selected: true, role: "cofirst",
    tags: ["Neuro-symbolic", "Survey", "Explainability"],
    tldr: "A task-directed survey of neuro-symbolic AI in the era of black-box models, covering explainability and reasoning.",
    abstract: "The integration of symbolic computing with neural networks has intrigued researchers since the first theorizations of Artificial Intelligence (AI). The ability of Neuro-Symbolic (NeSy) methods to infer or exploit behavioral schema has been widely considered as one of the possible proxies for human-level intelligence. However, the limited semantic generalizability and the challenges in declining complex domains with pre-defined patterns and rules hinder their practical implementation in real-world scenarios. The unprecedented results achieved by connectionist systems since the last AI breakthrough in 2017 have raised questions about the competitiveness of NeSy solutions, with particular emphasis on the Natural Language Processing and Computer Vision fields. This survey examines task-specific advancements in the NeSy domain to explore how incorporating symbolic systems can enhance explainability and reasoning capabilities.",
    links: { arxiv: "https://arxiv.org/abs/2603.03177", code: "https://github.com/disi-unibo-nlp/task-oriented-neuro-symbolic" }
  },
  {
    id: "mixture-of-masters",
    title: "Mixture of Masters: Sparse Chess Language Models with Player Routing",
    authors: "Giacomo Frisoni, Lorenzo Molfetta, Davide Freddi, Gianluca Moro",
    venue: "arXiv preprint", year: 2026, type: "preprint", role: "cofirst",
    tags: ["Mixture of experts", "Chess", "Language models"],
    tldr: "A sparse mixture-of-experts chess language model where each expert channels a grandmaster's style, routed per move.",
    abstract: "Modern chess language models are dense transformers trained on millions of games played by thousands of high-rated individuals. However, these monolithic networks tend to collapse into mode-averaged behavior, where stylistic boundaries are blurred, and rare but effective strategies are suppressed. To counteract homogenization, we introduce Mixture-of-Masters (MoM), the first chess mixture-of-experts model with small-sized GPT experts emulating world-class grandmasters. For each move, a post-hoc learnable gating network selects the most appropriate persona to channel depending on the game state, allowing MoM to switch its style dynamically, e.g., Tal's offensive vocation or Petrosian's defensive solidity. When evaluated against Stockfish on unseen standard games, MoM outperforms both dense individual expert networks and popular GPT baselines trained on aggregated data, while ensuring generation variety, control, and interpretability.",
    links: { arxiv: "https://arxiv.org/abs/2602.04447" }
  },
  {
    id: "retrieve-rank",
    title: "Retrieve-and-rank End-to-end Summarization of Biomedical Studies",
    authors: "Gianluca Moro, Luca Ragazzi, Lorenzo Valgimigli, Lorenzo Molfetta",
    venue: "SISAP", year: 2023, type: "conference", selected: true, role: "cofirst",
    tags: ["Summarization", "Biomedical", "Retrieval"],
    tldr: "An end-to-end retrieve-and-rank model for summarising biomedical studies."
  },
  {
    id: "ke-qa",
    title: "Knowledge-enhanced Neural Models for Question Answering Based on Retrieval",
    authors: "Lorenzo Molfetta",
    venue: "MSc thesis", year: 2023, type: "preprint", role: "first",
    tags: ["Question answering", "Knowledge graphs", "Retrieval"],
    tldr: "Knowledge-enhanced neural question answering based on retrieval (MSc thesis)."
  }
];
