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
    tldr: "We probe whether LLMs bend their answers to juridical authority and shifting legal standards, and how fragile they are to such pressure in legal QA.",
    abstract: "In medicine, claims persist insofar as they withstand empirical verification against a stable biological reality; in law, by contrast, truth is contingent, defined by jurisdiction, temporal validity, and the hierarchy of authoritative sources. The recent success of Large Language Models (LLMs) on medical licensing examinations has encouraged an expectation of comparable legal competence. We introduce a comparative diagnostic framework that evaluates legal reasoning against medical baselines along four axes spanning knowledge recall, grounding, confidence, and robustness to format changes. Evaluating models on a benchmark that explicitly encodes temporal validity and normative relationships, we uncover a sharp domain asymmetry: while medical models reliably benefit from verified sources, legal LLMs struggle to assess when retrieved citations are useful or misleading, exhibiting overconfidence in perturbed contexts and sensitivity to superficial formatting cues. Increased model scale amplifies this tendency. These findings show that current LLMs treat law as unstructured text rather than binding precedent.",
    method: "We introduce a comparative diagnostic framework that evaluates legal reasoning against medical baselines along four axes: knowledge recall, grounding, confidence, and robustness to format changes. The evaluation runs on a new benchmark that explicitly encodes temporal validity and the hierarchy of normative relationships (when authority is applicable, valid, and non-contradictory).",
    results: "Models show a sharp domain asymmetry. Medical models reliably benefit from verified sources, but legal LLMs struggle to tell useful from misleading citations, are overconfident in perturbed contexts, and are sensitive to superficial formatting cues. Larger scale amplifies this fragility — suggesting LLMs treat law as unstructured text rather than binding precedent."
  },
  {
    id: "ports",
    title: "PORTS: Preference-Optimized Retrievers for Tool Selection with Large Language Models",
    authors: "Lorenzo Molfetta, Giacomo Frisoni, Niccolò Monaldini, Gianluca Moro",
    venue: "EMNLP", year: 2025, type: "conference", selected: true, role: "first",
    tags: ["Tool use", "Retrieval", "LLMs"],
    tldr: "PORTS trains a retriever to pre-select the most useful tools for an LLM, using a preference signal derived from the LLM's own downstream performance.",
    abstract: "Integrating external tools with Large Language Models (LLMs) has emerged as a promising paradigm for accomplishing complex tasks. Since LLMs still struggle to effectively manage large tool collections, researchers have begun exploring retrieval-based methods to pre-select the most relevant options, addressing input length and latency constraints. However, existing retrievers are often misaligned with tool-calling LLMs due to their separate training processes. This paper presents PORTS, a novel odds-ratio preference optimization method for training retrievers aimed at tool selection. Using a perplexity-inspired preference signal from a frozen LLM, our approach fine-tunes a retriever to find helpful tools by optimizing the correlation between selection probabilities and downstream performances while jointly enforcing a contrastive semantic loss between documentation strings. PORTS is evaluated on six datasets, two encoder models, and three LLMs with diverse prior knowledge.",
    method: "PORTS aligns a retriever with a frozen tool-calling LLM through an odds-ratio preference optimization. Tool-documentation triplets (one positive, several negatives) are encoded independently and prompted separately to the frozen LLM. The retriever is fine-tuned so that its selection probabilities correlate with the LLM's answer likelihood — maximizing the ratio between the odds of selecting the right tool versus the wrong ones — while a contrastive semantic loss over documentation embeddings keeps representations meaningful. Only the retriever is updated, so alignment is cheap and the LLM stays frozen.",
    results: "Across six datasets, two encoders and three LLMs, PORTS lifts tool-selection accuracy substantially: average Recall@1-3 by up to +71.7 points and NDCG@1,3,5 by +70.2 over the RePlug baseline for seen tools; for unseen tools it still gains +61.2 Recall and +59.8 NDCG. The alignment is low-cost and generalizes to new queries and tools.",
    figure: "/assets/fig-ports.png",
    figureCaption: "PORTS — preference optimization aligns the retriever's tool-selection odds with a frozen LLM's answer likelihood.",
    links: { code: "https://github.com/disi-unibo-nlp/ports", read: "https://aclanthology.org/2025.emnlp-main.507/" }
  },
  {
    id: "feast",
    title: "FEAST: Retrieval-Augmented Multi-Hierarchical Food Classification for the FoodEx2 System",
    authors: "Lorenzo Molfetta, Alessio Cocchieri, Stefano Fantazzini, Giacomo Frisoni, Luca Ragazzi, Gianluca Moro",
    venue: "ECAI", year: 2025, type: "conference", selected: true, role: "first",
    tags: ["Retrieval-augmented", "Food / health", "Classification"],
    tldr: "A retrieval-augmented classifier over the multi-hierarchical FoodEx2 food-coding taxonomy.",
    abstract: "Hierarchical text classification and extreme multi-label classification face compounded challenges from complex label interdependencies, data sparsity, and extreme output dimensions. These are exemplified in the EFSA FoodEx2 system. We propose FEAST (Food Embedding And Semantic Taxonomy), a retrieval-augmented framework that decomposes FoodEx2 classification into a three-stage approach: (1) base term identification, (2) multi-label facet prediction, and (3) facet descriptor assignment. By leveraging the system's hierarchical structure to guide training and performing deep metric learning, FEAST learns discriminative embeddings that mitigate data sparsity and improve generalization on rare and fine-grained labels.",
    method: "FEAST decomposes FoodEx2 coding into three retrieval-augmented stages: (1) base-term identification, (2) multi-label facet prediction, and (3) facet-descriptor assignment. It uses the hierarchy to guide training and applies deep metric learning so the embeddings separate rare, fine-grained labels.",
    results: "On the multilingual FoodEx2 benchmark, FEAST outperforms the prior EFSA CNN baseline by 12-38% F1 on rare classes.",
    links: { read: "https://ebooks.iospress.nl/doi/10.3233/FAIA251309" }
  },
  {
    id: "graph-of-mark",
    title: "Graph-of-Mark: Promote Spatial Reasoning in Multimodal Language Models with Graph-based Visual Prompting",
    authors: "Giacomo Frisoni, Lorenzo Molfetta, Mattia Buzzoni, Gianluca Moro",
    venue: "AAAI", year: 2026, type: "conference", selected: true, role: "cofirst",
    tags: ["Multimodal", "Spatial reasoning", "Visual prompting"],
    tldr: "Graph-based visual prompting that improves spatial reasoning in multimodal language models.",
    abstract: "Training-free visual prompting techniques such as Set-of-Mark partition an image into object regions annotated with marks (boxes with numeric identifiers) before feeding the augmented image to a multimodal language model (MLM). However, they treat marked objects as isolated entities, failing to capture the relationships between them. We propose Graph-of-Mark (GoM), the first pixel-level visual prompting technique that overlays scene graphs onto the input image for spatial reasoning tasks. We evaluate GoM across 3 open-source MLMs and 4 datasets, conducting extensive ablations on drawn components and investigating the impact of auxiliary graph descriptions in the text prompt.",
    method: "Graph-of-Mark (GoM) is the first pixel-level visual-prompting method that overlays scene graphs onto the input image for spatial reasoning. It extends Set-of-Mark (which marks isolated objects with boxes/IDs) by also drawing the relationships between objects, so the model sees structure rather than disconnected regions. Ablations isolate which drawn graph components and auxiliary text descriptions contribute.",
    results: "Across 3 open-source MLMs and 4 datasets, GoM consistently improves zero-shot spatial reasoning — object positions and relative directions — lifting VQA and localization accuracy by up to 11 percentage points over the base model.",
    links: { read: "https://ojs.aaai.org/index.php/AAAI/article/view/40329" }
  },
  {
    id: "comma",
    title: "COMMA: A Multi-task and Multi-lingual Dataset of Constitutional Verdicts",
    authors: "Luca Ragazzi, Giacomo Frisoni, Gianluca Moro, Paolo Italiani, Lorenzo Molfetta, Valentina Folin",
    venue: "Artificial Intelligence and Law", year: 2026, type: "journal", selected: true, role: "cofirst",
    tags: ["Legal NLP", "Dataset", "Multilingual"],
    tldr: "A multi-task, multilingual dataset of constitutional-court verdicts for legal NLP.",
    abstract: "Transformer-based language models have sparked a revolutionary change in Legal NLP, but the dearth of large-scale datasets from authoritative sources hampers progress; available resources are mostly single-task, English-only, and written in layman's terms. We introduce COMMA, a multi-task, multilingual archive of 14K verdicts from the Constitutional Court of the Italian Republic (a non-common-law system). Documents address fundamental principles and rights, involve technical jargon, are diachronic and long. COMMA spans 4 languages and 4 tasks: multi-granular abstractive summarization, decision generation, article retrieval, and ruling classification.",
    method: "COMMA is a multi-task, multilingual archive of 14K verdicts from the Italian Constitutional Court (a non-common-law system). The documents address fundamental rights, use technical jargon, are diachronic and long. COMMA covers 4 languages and 4 tasks: multi-granular abstractive summarization, decision generation, article retrieval, and ruling classification.",
    results: "Benchmarking a catalog of language models in few-shot and full settings reveals substantial headroom for improvement across all four tasks. The dataset and best-performing models are released openly.",
    links: { read: "https://link.springer.com/article/10.1007/s10506-026-09520-x" }
  },
  {
    id: "nesy-survey",
    title: "Neuro-Symbolic Artificial Intelligence: A Task-Directed Survey in the Black-Box Models Era",
    authors: "Giovanni Pio Delvecchio, Lorenzo Molfetta, Gianluca Moro",
    venue: "IJCAI", year: 2025, type: "conference", selected: true, role: "cofirst",
    tags: ["Neuro-symbolic", "Survey", "Explainability"],
    tldr: "A task-directed survey of neuro-symbolic AI in the era of black-box models, covering explainability and reasoning.",
    abstract: "The integration of symbolic computing with neural networks has intrigued researchers since the first theorizations of AI. The ability of Neuro-Symbolic (NeSy) methods to infer or exploit behavioral schema has been widely considered as a possible proxy for human-level intelligence. However, limited semantic generalizability and the difficulty of declining complex domains with pre-defined patterns hinder their practical implementation. The unprecedented results of connectionist systems since the 2017 AI breakthrough have raised questions about the competitiveness of NeSy solutions. This survey examines task-specific advancements in the NeSy domain to explore how incorporating symbolic systems can enhance explainability and reasoning capabilities.",
    method: "A task-directed survey of neuro-symbolic (NeSy) AI in the black-box/LLM era. We organize task-specific NeSy advances — particularly in NLP and computer vision — and examine how symbolic components can enhance explainability and reasoning, contrasting them with post-2017 connectionist systems.",
    results: "The synthesis shows where NeSy methods still add value over pure neural baselines (explainability, reasoning, data efficiency) and where they remain hard to deploy in real domains. Released with reproducibility details and per-paper commentary.",
    links: { arxiv: "https://arxiv.org/abs/2603.03177", code: "https://github.com/disi-unibo-nlp/task-oriented-neuro-symbolic", read: "https://www.ijcai.org/proceedings/2025/1157" }
  },
  {
    id: "mixture-of-masters",
    title: "Mixture of Masters: Sparse Chess Language Models with Player Routing",
    authors: "Giacomo Frisoni, Lorenzo Molfetta, Davide Freddi, Gianluca Moro",
    venue: "arXiv preprint", year: 2026, type: "preprint", role: "cofirst",
    tags: ["Mixture of experts", "Chess", "Language models"],
    tldr: "A sparse mixture-of-experts chess language model where each expert channels a grandmaster's style, routed per move.",
    abstract: "Modern chess language models are dense transformers trained on millions of games, but they collapse into mode-averaged behavior where stylistic boundaries blur and rare but effective strategies are suppressed. We introduce Mixture-of-Masters (MoM), the first chess mixture-of-experts model with small GPT experts emulating world-class grandmasters. For each move, a post-hoc learnable gating network selects the most appropriate persona to channel depending on the game state, allowing MoM to switch style dynamically.",
    method: "Mixture-of-Masters (MoM) is a sparse mixture-of-experts chess LM: small GPT experts each emulate a world-class grandmaster's style, and a post-hoc learnable gating network selects which persona to channel on each move depending on the game state (e.g., Tal's attack vs Petrosian's defense).",
    results: "Against Stockfish on unseen standard games, MoM outperforms both dense single-expert networks and popular GPT baselines trained on aggregated data, while improving generation variety, control, and interpretability.",
    links: { arxiv: "https://arxiv.org/abs/2602.04447" }
  },
  {
    id: "retrieve-rank",
    title: "Retrieve-and-rank End-to-end Summarization of Biomedical Studies",
    authors: "Gianluca Moro, Luca Ragazzi, Lorenzo Valgimigli, Lorenzo Molfetta",
    venue: "SISAP", year: 2023, type: "conference", selected: true, role: "cofirst",
    tags: ["Summarization", "Biomedical", "Retrieval"],
    tldr: "RAMSES: an end-to-end retrieve-and-rank model for summarising multiple biomedical studies.",
    abstract: "An arduous biomedical task involves condensing evidence from multiple interrelated studies given a context. We name this task context-aware multi-document summarization (CA-MDS); existing SOTA solutions truncate the input because of high memory demands, losing meaningful content. We propose RAMSES, which employs a retrieve-and-rank technique for end-to-end summarization: it indexes each document by its semantic features, retrieves the most relevant ones, and generates a summary via token-probability marginalization. We also introduce FAQSUMC19, a dataset of multiple supporting papers answering Covid-19 questions.",
    method: "RAMSES tackles context-aware multi-document summarization (CA-MDS). It indexes each document by its semantic features, retrieves the most relevant ones, and generates a summary via token-probability marginalization — avoiding the input truncation that hurts SOTA models. We also introduce FAQSUMC19, a Covid-19 multi-paper QA dataset for evaluation.",
    results: "RAMSES achieves notably higher ROUGE than SOTA methods and sets a new SOTA for systematic-review generation on MS2; human evaluation rates its summaries as more informative than prior leading approaches.",
    links: { read: "https://link.springer.com/chapter/10.1007/978-3-031-46994-7_6" }
  },
  {
    id: "ke-qa",
    title: "Knowledge-enhanced Neural Models for Question Answering Based on Retrieval",
    authors: "Lorenzo Molfetta",
    venue: "MSc thesis", year: 2023, type: "preprint", role: "first",
    tags: ["Question answering", "Knowledge graphs", "Retrieval"],
    tldr: "Knowledge-enhanced neural question answering based on retrieval (MSc thesis).",
    method: "MSc thesis investigating knowledge-enhanced neural question answering based on retrieval — combining a parametric language model with retrieved structured (knowledge-graph) evidence to ground answers in biomedical/domain knowledge.",
    results: "Thesis work demonstrating the value of grounding neural QA with retrieved knowledge for more factual, traceable answers."
  }
];
