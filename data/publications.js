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
    id: "spsd",
    title: "Self-Play Search Distillation for Large Language Model Reasoning",
    authors: "Lorenzo Molfetta, Wai-Chung Kwan, Giacomo Frisoni, Luca Ragazzi, Gianluca Moro, Pavlos Vougiouklis, Jeff Z. Pan, Pasquale Minervini",
    venue: "Submitted to TACL", year: 2026, type: "submitted", selected: true, role: "first",
    tags: ["LLM reasoning", "Self-play", "Knowledge distillation"],
    tldr: "SPSD turns board-game search records into environment-grounded reasoning supervision, improving generalization to unseen games and mathematics without human annotations.",
    abstract: "Improving reasoning abilities in Large Language Models (LLMs) requires high-quality data that exposes difficult decisions, competing alternatives, and their consequences. Data scarcity is driven by the low quality of synthetic data and the cost of human labeling. We introduce Self-Play Search Distillation (SPSD), a framework for generating superhuman synthetic data via self-play of MuZero-like networks trained on board games. SPSD uses executable environments to turn search into structured reasoning problems. At each state, the expert identifies a preferred decision, plausible alternatives, plausible opponent replies, and value estimates. By converting the self-play search records into superhuman chains-of-thought, we train LLMs with environment-grounded supervision. Although trained only on self-play search records, SPSD transfers to unseen mathematics. On Qwen3-4B-Base, it raises the mean over six mathematics benchmarks from 24.1 to 36.3 while increasing the held-out-game win rate from 15% to 45%. SPSD offers an annotation-efficient way to create high-quality synthetic data for improving LLM performance in reasoning tasks.",
    sections: [
      {
        id: "method", title: "Method",
        body: `**Self-Play Search Distillation (SPSD)** uses frozen, search-based board-game experts to generate reasoning supervision independently of the language model being trained. Executable environments provide exact rules, legal actions and replayable consequences.

At each state, the search record contains a preferred decision, plausible alternatives, opponent replies and value estimates. These records are converted into structured chains of thought, so the language model learns not only which action to choose but how to compare alternatives and anticipate their consequences. The supervision comes from self-play search rather than human-written demonstrations.

![SPSD method diagram: a tic-tac-toe search tree with selected actions and alternative branches, alongside replay-grounded next-move reasoning and a state question about immediate winning actions.](/assets/paper-img/spsd/figure-2-method.png "Figure 2: From self-play search to language supervision. A frozen search expert exports selected actions, root-level estimates, and replayable continuations. The simulator validates these records before the renderer constructs move-chain and state-question supervision for language-model post-training.")

Source: submitted TACL manuscript, p. 5.`
      },
      {
        id: "evidence", title: "Evidence",
        body: `The submitted manuscript evaluates transfer beyond the self-play training data. On **Qwen3-4B-Base**, SPSD improves the mean score across **six mathematics benchmarks from 24.1 to 36.3** and the **held-out-game win rate from 15% to 45%**.

The mathematics results test transfer to a domain absent from the board-game training records. The held-out-game evaluation tests whether the learned reasoning extends beyond the games used for supervision.

> **Status.** Submitted to *Transactions of the Association for Computational Linguistics (TACL)* in September 2026. This manuscript is not yet accepted or published.

![Three Qwen3-4B-Base training curves: game FIDE, move legality, and six-benchmark mathematics mean across training steps, comparing SFT, RuleBot-Distill, OPSD base, and OPSD with variants.](/assets/paper-img/spsd/figure-3-training-trajectories.png "Figure 3: Training trajectories. Evolution of reasoning abilities of Qwen3-4B-Base during training. SPSD’s advantage emerges from opposite dynamics: SFT peaks early and declines while OPSD keeps improving.")

Source: submitted TACL manuscript, p. 8.`
      }
    ],
    links: {}
  },
  {
    "id": "jab",
    "title": "Java academic benchmark: Exam-based evaluation of LLMs on object-oriented programming",
    "year": 2026,
    "venue": "Journal of Systems and Software",
    "type": "journal",
    "authors": "Alessio Cocchieri, Luca Ragazzi, Gianluca Aguzzi, Giacomo Frisoni, Lorenzo Molfetta, Gianluca Moro, Mirko Viroli",
    "tags": [
      "Code generation",
      "Object-oriented programming",
      "Evaluation"
    ],
    "tldr": "JAB evaluates object-oriented programming with 103 real Java exams, 506 JUnit tests and KODE design-quality judgments, comparing one-shot and feedback-driven LLM solutions.",
    "abstract": "Current code generation benchmarks largely overlook object-oriented programming (OOP) skills, leaving open whether large language models (LLMs) can effectively apply OOP principles to structured programming tasks. The dominance and permissiveness of Python in most benchmarks further obscure model weaknesses in core OOP principles. We introduce the Java Academic Benchmark (JAB), based on 103 authentic Java exams collected over a decade at a major university, together with 506 expert-written JUnit tests, to rigorously evaluate advanced Java programming competence with a strong focus on OOP. To complement execution-based scoring, we propose KODE, an LLM-as-a-Judge framework that assesses OOP adherence across four pedagogical dimensions. We evaluate 27 LLMs under two resolution strategies: single-attempt (one-shot) and agentic (iterative refinement with compiler and test feedback). Results reveal that, under our evaluation protocol, larger closed models match or surpass bachelor-level OOP students–especially under agentic resolution–while smaller open models lag behind. JAB’s class-level design enables fine-grained error analysis, exposing recurring misconceptions. Editor’s note: Open Science material was validated by the Journal of Systems and Software Open Science Board.",
    "abstractSource": "https://raw.githubusercontent.com/disi-unibo-nlp/jab/main/README.md",
    "sections": [
      {
        "id": "method",
        "title": "Method",
        "body": "**Java Academic Benchmark (JAB)** tests object-oriented programming through **103 authentic university Java exams** and **506 expert-written JUnit tests**. Class-level evaluation exposes errors that short, function-level coding benchmarks can miss.\n\nExecution tests are complemented by **KODE**, a judgment framework covering clarity and maintainability, object design and encapsulation, reuse and modularity, and resource management and efficiency. The evaluation compares a single-attempt setting with an agentic setting in which models revise their code using compiler and test feedback.\n\n![Original JAB overview: exam context and assignment, soft/hard evaluation, Compilation@K, Pass@K, and KODE.](/assets/paper-img/jab/overview.jpg \"**JAB evaluation pipeline.** Exam instructions, utility classes, interfaces, and mandatory/optional tests define the task. Generated implementations are assessed for compilation, test passing at soft and hard levels, and OOP adherence using KODE; resolution can be single-attempt or agentic.\")\n\nSource: Figure 1 of the [published article](https://doi.org/10.1016/j.jss.2026.113033)."
      },
      {
        "id": "evidence",
        "title": "Evidence",
        "body": "The study evaluates **27 LLMs**. Under the reported evaluation protocol, larger closed models match or surpass bachelor-level OOP students, particularly when they can iteratively refine solutions using compiler and test feedback. Smaller open models lag behind.\n\nJAB separates executable correctness from adherence to OOP principles. Its class-level design supports fine-grained analysis of recurring programming misconceptions. Code, data and evaluation instructions are available in the [project repository](https://github.com/disi-unibo-nlp/jab).\n\n> **Scope.** The findings concern the Java exams and evaluation protocol studied, not a general claim of professional software-engineering competence.\n\n![Original JAB horizontal bar chart comparing S-Pass, H-Pass and compilation at one and ten samples across thirteen code models.](/assets/paper-img/jab/progressive-results.jpg \"**Progressive results across code models.** Solid bars report @1 performance; crosshatched extensions show improvements at @10. Blue denotes S-Pass (mandatory tests), orange H-Pass (mandatory and optional tests), and purple compilation. Values are percentages. This is the sampling comparison, not the separate agentic-refinement experiment.\")\n\nSource: Figure 4 of the [published article](https://doi.org/10.1016/j.jss.2026.113033)."
      }
    ],
    "links": {
      "read": "https://www.sciencedirect.com/science/article/pii/S0164121226002669",
      "doi": "https://doi.org/10.1016/j.jss.2026.113033",
      "code": "https://github.com/disi-unibo-nlp/jab"
    }
  },
  {
    id: "sycophants",
    title: "Sycophants in the Courtroom: Are LLMs Fragile to Juridical Authority and Evolving Legal Standards?",
    authors: "Lorenzo Molfetta, Alessio Cocchieri, Luca Ragazzi, Ilaria Bartolini, Marco Patella, Gianluca Moro",
    venue: "ACL", year: 2026, type: "conference", selected: true, role: "first",
    tags: ["Legal NLP", "LLM robustness", "Evaluation"],
    tldr: "We probe whether LLMs bend their answers to juridical authority and shifting legal standards, and how fragile they are to such pressure in legal QA.",
    abstract: "In medicine, claims remain valid when supported by empirical evidence grounded in stable biological reality. In law, by contrast, truth is contingent, defined by jurisdiction, temporal validity, and the hierarchy of authoritative sources. The recent success of large language models (LLMs) on medical licensing examinations has encouraged an expectation of comparable legal competence. This analogy, however, obscures a critical distinction between domains. Unlike in medicine, legal performance often depends less on inference than on determining when external authority is applicable, valid, and non-contradictory. We introduce a comparative diagnostic framework evaluating legal reasoning against medical baselines along four axes (knowledge recall, grounding, confidence, and robustness), uncovering a sharp domain asymmetry when applied to a new benchmark that encodes temporal validity and normative relationships. While medical LLMs reliably benefit from verified sources, legal LLMs struggle to assess when retrieved citations are useful or misleading, exhibiting overconfidence in perturbed contexts and sensitivity to superficial formatting cues. Increased model scale amplifies this tendency, revealing that stronger instruction following can coincide with weaker resistance to authoritative perturbations. These findings show that LLMs treat law as unstructured text rather than binding precedent, while revealing a tendency to over-trust authoritative but false information when external references conflict with a model’s internal knowledge.",
    abstractSource: "https://aclanthology.org/2026.acl-long.497/",
    sections: [
      {
        id: "method", title: "Method",
        body: `Medicine has a stable ground truth — a claim survives if it matches biological reality. **Law does not.** Legal truth is contingent on jurisdiction, *temporal validity*, and a hierarchy of authoritative sources: a statute overrides a precedent, and a 2010 ruling may simply no longer apply in 2026. So why would we expect LLMs that ace medical licensing exams to be competent at law? To answer this we build a **comparative diagnostic framework** that evaluates legal reasoning *against* medical baselines along four orthogonal axes — **Knowledge Recall** (does the model know the rule?), **Knowledge Grounding** (does it lean on a retrieved citation only when that citation is actually authoritative here and now?), **Knowledge Confidence** (is its certainty calibrated, or does it swing under pressure?), and **Format Perturbation** (does changing the *surface* of a question change the answer?). The benchmark, **Legal-Link-EU**, is built from EUR-Lex document pairs and explicitly encodes **temporal validity** and the **hierarchy of normative relationships** — when an authority is applicable, valid, and non-contradictory — so we can tell whether a model is reasoning about *binding precedent* or just pattern-matching text. We probe instruction-tuned and reasoning models (Llama-3.1, Mistral-3, Qwen-3, Gemini-2.5-Flash, GPT-OSS 20B/120B) and derive four **sycophancy indices** — $\\texttt{GII}$ (grounding gain), $\\texttt{POI}$ (perturbation offset), $\\texttt{CSI}$ (confidence stability), and $\\texttt{AEI}$ (authority-evidence inversion) — that jointly expose how a model treats authoritative context.`
      },
      {
        id: "evidence", title: "Evidence",
        body: `The headline is a **stark domain asymmetry**: medical models and legal models react to authoritative context in opposite ways, and scale makes the legal failure *worse*, not better.

![Legal profiles across the diagnostic axes (Knowledge Recall, Grounding, Confidence, and average Format Perturbation) for instruction-tuned vs. reasoning models.](/assets/paper-img/sycophants/legal_profiles.png "**Legal profiles.** Each model is scored along Knowledge Recall, Knowledge Grounding, Knowledge Confidence, and average Format Perturbation. Reasoning-centric architectures (GPT-OSS 20B/120B) reach high recall but collapse on confidence — they trust whatever authority is placed in front of them.")

### RQ1 — Does grounding help, or mislead?

In medicine, verified sources barely move the needle because the knowledge is already internalized: Gemini-2.5-Flash sits at **86.9%** recall on MedQA and gains only **+2.8 pp** from grounding context, GPT-OSS 120B **84.1%** with **+2.3 pp**. In law the picture inverts — recall is lower (Gemini **70.5%**, GPT-OSS 120B **62.6%** on Legal-Link-EU) but grounding context delivers **+27.0 pp** and **+29.9 pp** respectively. This is a **grounding dependency**: legal LLMs lack internalized doctrine and treat any provided statute as authoritative *without scrutinizing it*. The relation-level breakdown confirms the mechanism — explicit relations like \`completes\` are handled well, but temporal ones like \`implicitly repeals\` crater performance (Llama-3.1 falls to **62.1%**), because current architectures cannot determine whether a retrieved provision is still in force.

### RQ2 — Are larger models more robust to misleading authority?

No — **larger models are more sycophantic**. GPT-OSS 120B scores only **13.4%** on Knowledge Confidence, *below* the much smaller Qwen-3 8B (**20.3%**), and its $\\texttt{CSI}$ collapses from Llama-3.1's **46.9** to **8.66**. As parameter count grows, $\\texttt{GII}$, $\\texttt{CSI}$ and $\\texttt{POI}$ all shrink in the legal domain: the model harvests bigger gains from valid grounding but offers *less* resistance when the same authoritative channel turns misleading.

![Sycophancy indices (GII, POI, CSI, AEI) across models, legal (solid) vs. medical (hatched).](/assets/paper-img/sycophants/sycophancy_indices.png "**Sycophancy indices** across models for legal (solid) and medical (hatched) domains. Resistance indices fall with scale in law — the defining signature of sycophancy.")

### RQ3 — How fast does confidence collapse under perturbation?

Using GPT-OSS 20B as a representative mid-scale model, accuracy decays monotonically as the percentage of perturbed context rises from 20%→100%, but the slope is domain-dependent: **Legal-Link-EU drops 35.7% → 14.8%** while **MedQA decays far more gently, 65.2% → 50.5%**. The same retrieval mechanism that *repairs* the answer under grounding *restores the wrong option* when the context is misleading.

![Accuracy with 95% CI vs. perturbed-context percentage on MedQA vs. Legal-Link-EU.](/assets/paper-img/sycophants/confidence_degradation.png "**Knowledge-confidence degradation** (GPT-OSS 20B, three runs, 95% CI). Orange: MedQA; blue: Legal-Link-EU. The horizontal axis is the percentage of perturbed context. Legal accuracy decays more steeply than medical accuracy as perturbation density increases.")

### RQ4 — Is it a reasoning failure or a "helpfulness" prior?

A telling anomaly: under a **"Select Incorrect"** framing (invert the objective, ask the model to spot the false authority), some models recover. This suggests the sycophantic loop is driven less by a reasoning deficit than by a *helpfulness prior* that seeks agreement with context — once the task is to identify falsity, the tendency to hallucinate support for invalid authorities is disrupted.

> **Scope.** The diagnostic covers recall, grounding, confidence, and format robustness along a benchmark that encodes temporal validity and normative hierarchy. We do not claim coverage of all legal competence (analogy across jurisdictions, multi-step rule chaining under conflict remain open); rather, we show that the authority-sensitivity failure mode is real, measurable, and amplifies with scale.`
      }
    ],
    links: {"read": "https://aclanthology.org/2026.acl-long.497/", "doi": "https://doi.org/10.18653/v1/2026.acl-long.497", "pdf": "https://aclanthology.org/2026.acl-long.497.pdf"}
  },
  {
    id: "ports",
    title: "PORTS: Preference-Optimized Retrievers for Tool Selection with Large Language Models",
    authors: "Lorenzo Molfetta, Giacomo Frisoni, Nicolò Monaldini, Gianluca Moro",
    venue: "EMNLP", year: 2025, type: "conference", selected: true, role: "first",
    tags: ["Tool use", "Retrieval", "LLMs"],
    tldr: "PORTS trains a retriever to pre-select the most useful tools for an LLM, using a preference signal derived from the LLM's own downstream performance.",
    abstract: "Integrating external tools with Large Language Models (LLMs) has emerged as a promising paradigm for accomplishing complex tasks. Since LLMs still struggle to effectively manage large tool collections, researchers have begun exploring retrieval-based methods to pre-select the most relevant options, addressing input length and latency constraints. However, existing retrievers are often misaligned with tool-calling LLMs due to their separate training processes. This paper presents PORTS, a novel odds ratio preference optimization method for training retrievers aimed at tool selection. Using a perplexity-inspired preference signal from a frozen LLM, our approach fine-tunes a retriever to find helpful tools by optimizing the correlation between the selection probabilities and the downstream performances while jointly enforcing a contrastive semantic loss between documentation strings. The versatility of PORTS and its ability to significantly improve tool selection accuracy are demonstrated through extensive experiments on six datasets, two encoder models, and three LLMs with diverse prior knowledge. With low computational demands, our alignment process facilitates generalization to new queries and tools, proving valuable for practical applications with evolving toolsets.",
    abstractSource: "https://aclanthology.org/2025.emnlp-main.507/",
    method: "PORTS aligns a retriever with a frozen tool-calling LLM through an odds-ratio preference optimization. Tool-documentation triplets (one positive, several negatives) are encoded independently and prompted separately to the frozen LLM. The retriever is fine-tuned so that its selection probabilities correlate with the LLM's answer likelihood — maximizing the ratio between the odds of selecting the right tool versus the wrong ones — while a contrastive semantic loss over documentation embeddings keeps representations meaningful. Only the retriever is updated, so alignment is cheap and the LLM stays frozen.",
    results: "Across six datasets, two encoders and three LLMs, PORTS lifts tool-selection accuracy substantially: average Recall@1-3 by up to +71.7 points and NDCG@1,3,5 by +70.2 over the RePlug baseline for seen tools; for unseen tools it still gains +61.2 Recall and +59.8 NDCG. The alignment is low-cost and generalizes to new queries and tools.",
    sections: [
      {
        id: "method", title: "Method",
        body: `Tool-calling LLMs are gated by **input length and latency** — you cannot feed them a 10,000-tool catalog, so a retriever pre-selects a few relevant tools first. The problem is that retrievers are trained on *semantic similarity* between query and docstring, while the LLM only cares about *whether the tool actually helps it answer*. The two objectives are misaligned, and a tool that reads as topically similar can be useless downstream. **PORTS** closes this gap with an **odds-ratio preference optimization** built from the LLM's own signal: it takes tool-documentation triplets (one positive, several negatives), encodes each independently, prompts the frozen LLM separately with every candidate, and reads off an answer-likelihood — a *perplexity-inspired* preference signal for how much that tool helps. The retriever is then fine-tuned to maximize the ratio between the odds of selecting the right tool versus the wrong ones, $\\mathcal{L}_{\\text{PORTS}} = -\\log \\frac{\\text{odds}(\\text{right tool})}{\\sum_{j}\\text{odds}(\\text{wrong tool}_j)}$, while a contrastive semantic loss over documentation embeddings keeps representations meaningful so preference alignment does not collapse the embedding space. Only the retriever updates — the LLM stays frozen — so **alignment is cheap** and one-off.

![PORTS overview: a frozen tool-calling LLM emits a perplexity-inspired preference signal that fine-tunes the retriever.](/assets/paper-img/ports/overview.png "**PORTS.** The frozen LLM emits a perplexity-inspired preference signal; the retriever is fine-tuned so that its selection probability for a tool correlates with that tool's downstream contribution to the LLM's answer. Only the retriever is updated.")

`
      },
      {
        id: "evidence", title: "Evidence",
        body: `PORTS is evaluated on **6 datasets**, **2 encoders** (RoBERTa, BGE), and **3 LLMs** with diverse prior knowledge (Codestral, Llama-3.1, Groq-Llama), against the RePlug-LSR baseline — the only prior method with a comparable goal-driven retrieval objective.

### RQ1 — Does preference alignment beat semantic retrieval?

Decisively. On *seen* tools, PORTS lifts average **Recall@{1,2,3} by up to +71.66 points** and **NDCG@{1,3,5} by +70.16** over RePlug. The retriever stops returning topically-similar tools and starts returning *useful* ones — per-domain, PORTS beats RePlug everywhere, with the largest gaps on **ToolE (+15.8)** and **ApiBench (+12.3)**.

### RQ2 — Does the signal transfer to unseen tools?

Yes — and this is the point of learning a signal rather than memorizing a catalog. On tools *never seen during training*, PORTS still gains **+61.24 Recall** and **+59.79 NDCG**. Starting from a 90/10 seen-to-unseen split and progressively shrinking the training set, PORTS's preference loss keeps deriving semantic query-tool structure without dense pairwise supervision — confirming its low-resource robustness for catalogs whose API documentation constantly evolves.

### RQ3 — Is the alignment robust across LLMs?

The gains hold across all three LLMs and both encoder backbones, so PORTS is not exploiting one model's quirks; averaging over every dataset and LLM, the Recall@K improvement is **+6.7 (RoBERTa)** and **+3.4 (BGE)** over RePlug. Because the LLM is frozen, a retriever can be re-aligned to a different downstream model at near-zero cost.

> **Scope.** PORTS assumes a frozen tool-calling LLM whose answer-likelihood can be read off as a preference signal, and a fixed tool catalog with textual documentation. Dynamic tool inventories and multi-step tool *chaining* — where the right tool depends on the previous call's output — remain open.`
      }
    ],
    links: {"code": "https://github.com/disi-unibo-nlp/ports", "read": "https://aclanthology.org/2025.emnlp-main.507/", "doi": "https://doi.org/10.18653/v1/2025.emnlp-main.507", "pdf": "https://aclanthology.org/2025.emnlp-main.507.pdf", "arxiv": "https://arxiv.org/abs/2607.05441"}
  },
  {
    id: "feast",
    title: "FEAST: Retrieval-Augmented Multi-Hierarchical Food Classification for the FoodEx2 System",
    authors: "Lorenzo Molfetta, Alessio Cocchieri, Stefano Fantazzini, Giacomo Frisoni, Luca Ragazzi, Gianluca Moro",
    venue: "ECAI", year: 2025, type: "conference", selected: true, role: "first",
    tags: ["Retrieval-augmented", "Food / health", "Classification"],
    tldr: "A retrieval-augmented classifier over the multi-hierarchical FoodEx2 food-coding taxonomy.",
    abstract: "Hierarchical text classification (HTC) and extreme multi-label classification (XML) tasks face compounded challenges from complex label interdependencies, data sparsity, and extreme output dimensions. These challenges are exemplified in the European Food Safety Authority's FoodEx2 system-a standardized food classification framework essential for food consumption monitoring and contaminant exposure assessment across Europe. FoodEx2 coding transforms natural language food descriptions into a set of codes from multiple standardized hierarchies, but faces implementation barriers due to its complex structure. Given a food description (e.g., \"organic yogurt''), the system identifies its base term (\"yogurt''), all the applicable facet categories (e.g., \"production method''), and then, every relevant facet descriptors to each category (e.g., \"organic production''). While existing models perform adequately on well-balanced and semantically dense hierarchies, no work has been applied on the practical constraints imposed by the FoodEx2 system. The limited literature addressing such real-world scenarios further compounds these challenges. We propose FEAST (Food Embedding And Semantic Taxonomy), a novel retrieval-augmented framework that decomposes FoodEx2 classification into a three-stage approach: (1) base term identification, (2) multi-label facet prediction, and (3) facet descriptor assignment. By leveraging the system's hierarchical structure to guide training and performing deep metric learning, FEASTlearns discriminative embeddings that mitigate data sparsity and improve generalization on rare and fine-grained labels. Evaluated on the multilingual FoodEx2 benchmark, FEAST outperforms the prior European's CNN baseline F1 scores by 12-38 % on rare classes.",
    abstractSource: "https://arxiv.org/abs/2603.03176",
    sections: [
      {
        id: "method", title: "Method",
        body: `FoodEx2 is the European Food Safety Authority's standardized coding system: a free-text food description ("organic yogurt") must map to a **base term** ("yogurt"), a set of applicable **facet categories** ("production method"), and a **descriptor** per category ("organic production"). It is hierarchical, multilingual, and brutally long-tailed — exactly where standard classifiers fail.

**FEAST** decomposes the problem into three retrieval-augmented stages, each tackling one axis of the FoodEx2 hierarchy:

![FEAST pipeline: hard-negative mining from the taxonomy feeds a bi-encoder retriever, a cross-encoder reranker, and a multi-label facet classifier across the three FoodEx2 tasks.](/assets/paper-img/feast/method.png "**FEAST three-stage pipeline.** (1) Base-term identification, (2) multi-label facet-category prediction, (3) facet-descriptor assignment. Taxonomy-aware hard-negative mining feeds every stage so fine-grained semantic distinctions are learned explicitly.")

1. **Task I — Base term.** Retrieve the correct base term from the taxonomy.
2. **Task II — Facet categories.** Multi-label prediction of *which* facet categories apply.
3. **Task III — Facet descriptors.** Retrieve the right descriptor for each chosen category.

The key ingredient is **taxonomy-aware hard-negative mining**. Given a target term $t$ in the tree $\\mathcal{T}=(V,E)$, hard negatives are siblings (same parent), and when those run out, candidates are scored by hop distance through their Lowest Common Ancestor and by shared implicit facets:

$$\\mathcal{S}(t,v) = \\frac{1 + o_{\\text{facets}}(t,v)}{1 + d_{\\text{hop}}(t,v)}, \\qquad d_{\\text{hop}}(t,v) = |dp(t)-dp(z)| + |dp(v)-dp(z)|,\\;\\; z=\\text{LCA}(t,v)$$

These negatives train a **bi-encoder retriever** (Multiple Negative Ranking loss) and a **cross-encoder reranker** that re-scores the top-$k$ candidates:

$$\\mathcal{L}_{\\text{RETR}}(q,d) = -\\frac{1}{|\\mathcal{B}|}\\sum_i \\Big[\\, \\text{sim}(q_i,d_i) - \\log\\!\\Big(e^{\\text{sim}(q_i,d_i)} + \\!\\!\\sum_{d_j \\in \\mathcal{H}(q_i)} e^{\\text{sim}(q_i,d_j)}\\Big)\\Big]$$

So retrieval handles the *scale* of the taxonomy (no softmax over thousands of labels), while the reranker handles the *fine grain* (resolving near-identical siblings).`
      },
      {
        id: "evidence", title: "Evidence",
        body: `FEAST is evaluated on the multilingual FoodEx2 benchmark across all three tasks. The pattern is consistent: a fine-tuned **ModernBERT** retriever plus a **DeBERTa-v3** reranker beats every off-the-shelf encoder.

### RQ1 — Does retrieval crack the base-term and descriptor tasks?

Yes, decisively. ModernBERT tops both retrieval tasks across Acc@1, NDCG@10, MRR@10, and MAP@100, beating strong multilingual encoders (GTE-Multilingual, BGE-M3, EuroBERT-610M):

| Retriever (Task I — Base term) | Acc@1 | Rec@1 | NDCG@10 | MAP@100 |
|---|---|---|---|---|
| GTE-Multilingual-base | 95.10 | 94.84 | 98.01 | 97.30 |
| BGE-M3 | 95.95 | 95.67 | 98.38 | 97.81 |
| EuroBERT-610M | 95.10 | 95.20 | 98.29 | 97.77 |
| **ModernBERT (ours)** | **96.57** | **96.31** | **98.63** | **98.14** |

On Task III (descriptors) it reaches **98.90% Acc@1** and **99.53% NDCG@10** — near-saturation.

### RQ2 — Does the reranker actually sharpen the ranking?

The cross-encoder reranker refines the retriever's shortlist, lifting base-term Acc@1 to **91.01%** and descriptor Acc@1 to **96.03%** at the top of the ranking — confirming that the bi-encoder retrieves the right answer *in the top-k*, and the reranker promotes it to rank-1.

### RQ3 — How does FEAST handle the long tail (rare classes)?

This is the headline. On **rare classes** — the ones that matter for food-safety monitoring and that the prior EFSA CNN baseline systematically misses — FEAST improves F1 by **+12 to +38%**. The combination of taxonomy-aware hard negatives and deep metric learning is what generalizes to under-represented labels; without it, rare classes collapse.

On the multi-label facet task (Task II), a 142M-parameter DeBERTa-v3 bi-encoder classifier holds its own despite severe class imbalance, and an LLM variant (LLaMA-3.1-8B) reaches **99.18% F1** on Task I and **99.82% F1** on Task III — showing the FEAST decomposition composes cleanly with both small specialized encoders and large generative models.

> **Scope.** FEAST targets the FoodEx2 hierarchy specifically; the decomposition (base term → facets → descriptors) is dictated by that system's structure. The taxonomy-aware mining recipe is general and transfers to any hierarchically-organized label space suffering from data sparsity.`
      }
    ],
    links: {"arxiv": "https://arxiv.org/abs/2603.03176", "read": "https://ebooks.iospress.nl/doi/10.3233/FAIA251309", "doi": "https://doi.org/10.3233/FAIA251309", "pdf": "https://arxiv.org/pdf/2603.03176"}
  },
  {
    id: "graph-of-mark",
    title: "Graph-of-Mark: Promote Spatial Reasoning in Multimodal Language Models with Graph-based Visual Prompting",
    authors: "Giacomo Frisoni, Lorenzo Molfetta, Mattia Buzzoni, Gianluca Moro",
    venue: "AAAI", year: 2026, type: "conference", selected: true, role: "cofirst",
    tags: ["Multimodal", "Spatial reasoning", "Visual prompting"],
    tldr: "Graph-based visual prompting that improves spatial reasoning in multimodal language models.",
    abstract: "Recent advances in training-free visual prompting, such as Set-of-Mark, have emerged as a promising direction for enhancing the grounding capabilities of multimodal language models (MLMs). These techniques operate by partitioning the input image into object regions and annotating them with marks, predominantly boxes with numeric identifiers, before feeding the augmented image to the MLM. However, these approaches treat marked objects as isolated entities, failing to capture the relationships between them. On these premises, we propose Graph-of-Mark (GoM), the first pixel-level visual prompting technique that overlays scene graphs onto the input image for spatial reasoning tasks. We evaluate GoM across 3 open-source MLMs and 4 different datasets, conducting extensive ablations on drawn components and investigating the impact of auxiliary graph descriptions in the text prompt. Our results demonstrate that GoM consistently improves the zero-shot capability of MLMs in interpreting object positions and relative directions, improving base accuracy in visual question answering and localization up to 11 percentage points.",
    abstractSource: "https://arxiv.org/abs/2603.06663",
    sections: [
      {
        id: "context", title: "Context",
        body: `Current multimodal language models (MLMs) still reason about images as a **"bag of objects"** — they detect *what* is in a scene but largely miss *how* those objects are arranged. Despite strong global understanding, they routinely fail at basic spatial concepts such as *left of*, *above*, *in front of*, and *behind* — a deficit rooted in architectures and training objectives that prioritize whole-image semantics over explicit, localized spatial supervision.

Existing fixes fall into two camps. **Fine-tuning** for spatial awareness works but is computationally expensive and brittle, demanding retraining for every new task or domain. **Prompting** is more flexible and splits further into *embedding-level* (soft) methods that encode visual cues into latent features, and *pixel-level* (hard) methods like **Set-of-Mark (SoM)** that render visible annotations — boxes with numeric IDs — onto the image. SoM improves grounding, but it still treats each marked object as an **isolated entity**, leaving the *relational structure* of the scene implicit. Separately, scene graphs have been fused through latent mechanisms or verbalized into text, but never drawn directly onto the pixels the model actually attends to.

**Graph-of-Mark (GoM)** closes exactly this gap. It is a **training-free, plug-and-play, pixel-level** prompting technique that overlays a **depth-aware scene graph** — object masks, IDs, and directed, labeled relation arrows — onto the input image, with no architectural change or fine-tuning of the MLM. The motivations are:

- **Address fundamental spatial-reasoning deficiencies** in MLMs by making relations a first-class visual signal.
- **Bridge the SoM gap** — objects are not independent; scene semantics live in the *arrangement*.
- **Overcome fine-tuning and text-only limits** — visual prompting conveys dense spatial structure that text prompts cannot.
- **Stay training-free and broadly applicable** — GoM builds scene graphs automatically from open-vocabulary detectors, segmenters, and depth estimators, with no task-specific ground truth, and runs on any MLM.`
      },
      {
        id: "method", title: "Method",
        body: `Given an RGB image $I$ and a text prompt $T$, GoM produces an augmented image $I^{\\text{SG}}$ and lets the MLM answer from $P_{\\text{MLM}}(\\cdot \\mid I^{\\text{SG}}, T)$. The pipeline is **training-free** and runs in four stages.

![Graph-of-Mark overlays a depth-aware scene graph onto the image: object masks, IDs, and directed relation arrows between them.](/assets/paper-img/graph-of-mark/overview.png "**Graph-of-Mark.** Given an image, GoM detects and segments objects, estimates pairwise spatial relations (directional, depth, proximity), filters them against the query, and renders a scene graph — masks + IDs + directed labeled arrows — directly onto the pixels. The MLM reasons over $I^{\\text{SG}}$ instead of $I$.")

1. **Detect & segment.** A coarse-to-fine **ensemble of three complementary detectors** — OWL-V2 (open-vocabulary), YOLOv8-X and Mask R-CNN R101-FPN (closed-vocabulary) — proposes boxes, merged by **Weighted Boxes Fusion**. **SAM-HQ** then refines boxes into precise masks (falling back to boxes if segmentation fails). These regions are the **nodes** of the scene graph.
2. **Estimate relations.** For every object pair, GoM computes an **ontology of 7 relations in 3 groups**: *directional* (above / below / left_of / right_of) from the displacement between box centers; *depth stacking* (in_front_of / behind) from a **MiDaS DPT-Large** monocular depth gap $|\\text{depth}_j - \\text{depth}_i|$; and *proximity* (near) as a fallback. Directional relations carry **modifiers** — touching, very_close, close — based on IoU and normalized center distance.
3. **Filter to the query.** A two-step pipeline prunes irrelevant structure against $T$: objects are kept by lexical then semantic matching (FastText cosine similarity), and for each surviving object only the **top-$k$** most query-relevant and nearest relations are retained.
4. **Render the graph.** Nodes are drawn as colored masks with unique IDs (numeric or textual); relations become directed **head-to-tail arrows** colored to match the head object, optionally with relation-label boxes. A novel **collision-free placement allocator** iteratively displaces conflicting marks and reconnects displaced edge labels with dashed lines, so every annotation stays legible.

Two prompting modes are supported: **Visual SG** (graph drawn on pixels, plain text prompt $T$) and **Visual + Textual SG** (the graph is *also* verbalized in the prompt as *<head> --(relation)--> <tail>* triplets, $T^{\\text{SG}}$).`
      },
      {
        id: "evidence", title: "Evidence",
        body: `We evaluate GoM on **3 open-source MLMs** (Gemma-3 4B, Qwen-2.5-VL 7B, LlamaV-o1 11B) across **4 datasets** (GQA, VQA-v1, VQA-v2 for VQA; RefCOCOg for REC), sampling 1K images per dataset and retaining all associated queries, against raw images, segmentation-only, and SoM.

### RQ1 — Does the graph actually help spatial reasoning?

Across every model and nearly every dataset, the best GoM variant beats all baselines by up to **+11 percentage points**.

| Model | Method | GQA | VQA-v1 | VQA-v2 | RefCOCOg |
|---|---|---|---|---|---|
| **Gemma-3 4B** | Raw image | 56.2 | 64.3 | 59.9 | — |
| | SoM (seg + num IDs) | 56.9 | 63.8 | 59.0 | 54.8 |
| | **GoM (best)** | **63.2** | **74.2** | **71.9** | **56.4** |
| **Qwen-2.5-VL 7B** | Raw image | 61.6 | 77.7 | 73.8 | — |
| | SoM | 61.8 | 65.4 | 68.6 | 55.5 |
| | **GoM (best)** | **65.0** | **82.5** | **80.5** | **57.5** |
| **LlamaV-o1 11B** | Raw image | 60.2 | 75.3 | 75.1 | — |
| | SoM | 62.0 | 72.8 | 75.5 | 55.3 |
| | **GoM (best)** | **67.0** | **83.2** | **83.6** | **57.6** |

Gemma-3 sees the largest jumps (VQA-v2: **59.9 → 71.9**); LlamaV-o1 reaches the highest absolute scores (**83.6** VQA, **57.6** REC), suggesting reasoning-centric models exploit GoM best. Strikingly, **SoM actively *hurts* Qwen** (VQA-v1: 77.7 → 65.4) because it fails to reference the right regions — GoM restores and surpasses the raw-image baseline by adding relational structure. There is **no single optimal variant**: textual object IDs without relation labels win for VQA (models track textual descriptors when generating abstractive answers), while numeric IDs are better for REC; strip out relation labels and models systematically ignore directional cues.

![Same image under SoM vs GoM on a RefCOCOg referring-expression query.](/assets/paper-img/graph-of-mark/qualitative_som.jpg "**Set-of-Mark** marks objects but leaves the model to infer relations on its own — leading to wrong spatial attributions on referring expressions.")

![The same scene under GoM: relations are drawn as labeled arrows, so the correct target region is recoverable.](/assets/paper-img/graph-of-mark/qualitative_gom.jpg "**Under GoM**, directed, labeled relation arrows mean the model no longer has to *guess* how objects relate — it reads the graph off the pixels.")

### RQ2 — Is *seeing* the graph better than *reading* it?

Yes — and this was not a given, since prior work injected scene graphs only as text. Across graph densities, accuracy peaks with **3–10 entities and 4–16 relations**; beyond that, surplus annotations add noise and headroom shrinks.

![GoM accuracy in VQA-v2 as a function of the number of edges in the visual scene graph.](/assets/paper-img/graph-of-mark/graph_density.svg "**Effect of graph density** (VQA-v2). Performance rises sharply once relations are added — 0 edges is SoM-like prompting — peaks around 4–16 edges, then slowly decays as annotations become noise. LlamaV-o1 (orange) stays on top throughout.")

On the modality question (Gemma-3), drawing the graph on pixels beats verbalizing it as text by **up to +10 points**, and stacking the textual graph on top of the visual one gives only a modest extra bump — the gains come from *drawing* the relations, not listing them.

![Accuracy across four prompt modalities — $I{+}T$, $I{+}T^{\\text{SG}}$, $I^{\\text{SG}}{+}T$, $I^{\\text{SG}}{+}T^{\\text{SG}}$ — on Gemma-3.](/assets/paper-img/graph-of-mark/sg_modality.svg "**Scene-graph modality** (Gemma-3). Visual graphs ($I^{\\text{SG}}$, purple/red) clearly beat text-only graphs ($I{+}T^{\\text{SG}}$, blue). The win comes from drawing the relations on the pixels, not from listing them in the prompt.")

### RQ3 — What does it cost?

Very little. GoM averages **1.13 s/image** vs 0.92 s for SoM and 0.77 s for segmentation-only — the extra cost attributable to relation estimation, easily offset by the spatial-reasoning gains.`
      },
      {
        id: "impact", title: "Impact",
        body: `GoM directly targets a **core MLM limitation** — the move from a "bag of objects" to an integrated object network — so models grasp not just *what* is present but *how* it is spatially arranged. Because it is **training-free and plug-and-play**, any existing MLM gains spatial reasoning without fine-tuning or architectural changes, which notably includes **lightweight open-source MLMs (≤11B)** and contradicts the prior assumption that hard visual prompting only pays off in large closed-source models. Drawing the scene graph on the pixels also gives a **transparent, interpretable** grounding for the model's spatial judgments, visible by construction rather than hidden in latent features.

The consistent gains across VQA and REC — and the open release of code, preprocessed data, and evaluation scripts — position GoM as a **strong baseline for visually-driven relational prompting** and open several directions: robotics and autonomous navigation (manipulation, path planning), augmented reality (spatial grounding for virtual content), GUI agents (understanding UI layout), biomedical and clinical imaging (diagnostic classification, surgical-video analysis, where anatomical spatial relations are critical), and **neuro-symbolic systems**, where GoM offers a clean way to inject symbolic graph structure into a neural pipeline.

> **Scope.** GoM is training-free and validated on open-source MLMs ≤11B. The relation ontology is **geometric** (directional / depth / proximity); semantic and physical relations — functional, action-based — are left to future work, along with scene hypergraphs, stereo depth, and temporal/video modeling.`
      }
    ],
    links: {"arxiv": "https://arxiv.org/abs/2603.06663", "read": "https://ojs.aaai.org/index.php/AAAI/article/view/40329", "doi": "https://doi.org/10.1609/aaai.v40i36.40329", "pdf": "https://arxiv.org/pdf/2603.06663"}
  },
  {
    id: "comma",
    title: "COMMA: A Multi-task and Multi-lingual Dataset of Constitutional Verdicts",
    authors: "Luca Ragazzi, Giacomo Frisoni, Gianluca Moro, Paolo Italiani, Lorenzo Molfetta, Veronika Folin",
    venue: "Artificial Intelligence and Law", year: 2026, type: "journal", selected: true, role: "cofirst",
    tags: ["Legal NLP", "Dataset", "Multilingual"],
    tldr: "A multi-task, multilingual dataset of constitutional-court verdicts for legal NLP.",
    abstract: "Transformer-based language models have sparked a revolutionary change in Legal NLP, endowing lawyers with unparalleled tools to effectively navigate, understand, and draft large volumes of text. However, the dearth of large-scale datasets from authoritative sources hampers further progress. The available resources are primarily single-task, English-only, and written in layman’s terms. To bridge this gap, we introduce Comma , a multi-task and multi-lingual archive of 14K verdicts drawn from the Constitutional Court of the Italian Republic, grounded in a non-common law system. Documents in Comma diverge from ordinary legal manuscripts as they address fundamental principles and rights, involve technical jargon, exhibit an articulated structure, are diachronic, have extended length, and demand more significant expertise and interpretation. By embracing 4 widespread languages, Comma tackles a panoply of necessity-driven tasks: multi-granular abstractive summarization, decision generation, article retrieval, and ruling classification. We systematically benchmark a catalog of language models in both few-shot and full settings, uncovering substantial headroom for improvement. We contribute to the new era of Legal NLP systems by openly releasing Comma and best-performing models (https://github.com/disi-unibo-nlp/comma).",
    abstractSource: "https://api.crossref.org/works/10.1007/s10506-026-09520-x",
    method: "COMMA is a multi-task, multilingual archive of 14K verdicts from the Italian Constitutional Court (a non-common-law system). The documents address fundamental rights, use technical jargon, are diachronic and long. COMMA covers 4 languages and 4 tasks: multi-granular abstractive summarization, decision generation, article retrieval, and ruling classification.",
    results: "Benchmarking a catalog of language models in few-shot and full settings reveals substantial headroom for improvement across all four tasks. The dataset and best-performing models are released openly.",
    sections: [
      {
        id: "method", title: "Method",
        body: `Legal NLP is starved of *authoritative* data — most resources are single-task, English-only, and written in layman's terms, useless for studying the technical, diachronic reasoning a constitutional court actually performs. **COMMA** (a **co**nstitutional-court **m**ulti-task and **m**ulti-lingual **a**rchive) fills this gap with **14K verdicts from the Constitutional Court of the Italian Republic (CCIR)**, a civil-law, non-common-law system whose rulings adjudicate fundamental rights and principles. To our knowledge it is the **first multi-task, multilingual benchmark that does not follow a common-law system**: because CCIR verdicts are code-based and do not originate under binding precedent, NLP models must reason on top of *explicit rules*, grasping their intended scope, exceptions, and ambiguities. The corpus is deliberately hard on four axes — it is **technical** (constitutional-law jargon, not plain language), **diachronic** (spanning decades, so the same legal concept drifts as doctrine evolves), **long** (well beyond the comfort zone of standard summarizers), and **multilingual** (rulings, constitutional parameters, and task targets are released in **4 languages**: Italian, English, Spanish, and French via semi-automatic translation).

![COMMA input and output examples for summarization, text generation, constitutional-article retrieval and classification.](/assets/paper-img/comma/comma_input_output.png "**COMMA task examples.** Example inputs and outputs illustrate summarization at multiple granularities, text generation, constitutional-article retrieval and classification.")

COMMA frames **seven tasks in four families** that are each meaningful to legal professionals: **abstractive summarization** at multiple granularities (ruling → narrative, ruling → bullet-point keyphrases, and maxim-text → keyphrase titles), **text generation** (produce the decision given the epigraph, facts, and gold constitutional articles), **information retrieval** (fetch the constitutional articles that bear on a case — at "comma" precision), and **document classification** (ruling type: order vs. judgment, plus a 10-class judgment-type variant).

![The Italian Constitution tree that grounds COMMA's constitutional parameters.](/assets/paper-img/comma/comma_constitution.png "**Constitution parameter tree.** Article retrieval targets are rooted in the Italian Constitution — the apex of the regulatory hierarchy — so the task is highly knowledge-intensive and requires resolving broad principles from specific case references.")`
      },
      {
        id: "evidence", title: "Evidence",
        body: `We benchmark a catalog of language models — from mBart and mT5 to Llama-3 and Gemma, in both few-shot and full fine-tuning settings — across all seven tasks and four languages.

### RQ1 — Does long-context reading pay off?

Yes, and it is the single clearest signal. **Long-context (LSG) models outperform vanilla ones on every generative task**, because reading and comprehending a *full* ruling is what drives performance. On ruling → narrative summarization, ROUGE-1 ($\\mathcal{R}$) rises by **+14% to +28%** and BertScore (BeS) by **+68% to +96%** when the model can ingest the entire input; on ruling → bullet-point, the gains are **+8–10%** $\\mathcal{R}$ and **+13–15%** BeS. Condensed inputs help too — maxim-text → bullet-point outperforms ruling → bullet-point, confirming that compressing the source simplifies the summarization task.

### RQ2 — Can models actually write long, faithful maxims?

This is where current summarizers break. Gold maxim texts average **624 tokens**, yet **mBart** predictions average only **~378 tokens (under 40% of gold length)**, and even **mBart-LSG** stops at **443**. Models truncate, omitting the very reasoning a constitutional lawyer needs — a clear call for multilingual pretraining with ad-hoc legal vocabularies.

### RQ3 — Is article retrieval solved?

No — it sits at a steady **~28% accuracy** (excluding encoding-based methods for Spanish). The failure is contextual: even when the ruling's text *references* a parameter, extracting a broad constitutional principle from a specific case is genuinely hard. Ranking inspection shows models usually identify the *right section* (semantic domain) but misidentify the *specific article* — a precise-but-not-accurate failure mode.

### RQ4 — How much headroom remains?

A lot, on every task. Full fine-tuning beats few-shot prompting, as expected, but no model in the catalog solves COMMA — it is positioned as a benchmark with room to grow, not a solved one. The dataset and the best-performing models are **released openly** to anchor future work.

> **Scope.** COMMA is drawn from a single (civil-law) constitutional court; cross-jurisdiction transfer and the diachronic-drift axis specifically are open. The seven tasks are a starting set — the corpus supports more (e.g., citation-graph and precedent-network prediction).`
      }
    ],
    links: {"read": "https://link.springer.com/article/10.1007/s10506-026-09520-x", "doi": "https://doi.org/10.1007/s10506-026-09520-x", "code": "https://github.com/disi-unibo-nlp/comma"}
  },
  {
    id: "nesy-survey",
    title: "Neuro-Symbolic Artificial Intelligence: A Task-Directed Survey in the Black-Box Models Era",
    authors: "Giovanni Pio Delvecchio, Lorenzo Molfetta, Gianluca Moro",
    venue: "IJCAI", year: 2025, type: "conference", selected: true, role: "cofirst",
    tags: ["Neuro-symbolic", "Survey", "Explainability"],
    tldr: "A task-directed survey of neuro-symbolic AI in the era of black-box models, covering explainability and reasoning.",
    abstract: "The integration of symbolic computing with neural networks has intrigued researchers since the first theorizations of Artificial intelligence (AI). The ability of Neuro-Symbolic (NeSy) methods to infer or exploit behavioral schema has been widely considered as one of the possible proxies for human-level intelligence. However, the limited semantic generalizability and the challenges in declining complex domains with pre-defined patterns and rules hinder their practical implementation in real-world scenarios. The unprecedented results achieved by connectionist systems since the last AI breakthrough in 2017 have raised questions about the competitiveness of NeSy solutions, with particular emphasis on the Natural Language Processing and Computer Vision fields. This survey examines task-specific advancements in the NeSy domain to explore how incorporating symbolic systems can enhance explainability and reasoning capabilities. Our findings are meant to serve as a resource for researchers exploring explainable NeSy methodologies for real-life tasks and applications. Reproducibility details and in-depth comments on each surveyed research work are made available at https://github.com/disi-unibo-nlp/task-oriented-neuro-symbolic.git.",
    abstractSource: "https://arxiv.org/abs/2603.03177",
    sections: [
      {
        id: "method", title: "Method",
        body: `The term *neuro-symbolic* is used inconsistently — often stretched to any model that *claims* reasoning or interpretability without a real symbolic component. This survey narrows the definition: **NeSy = neural networks integrated with symbolic components** (solvers, logical rules, state-action schemas) — and asks where such systems still earn their keep after the 2017 connectionist breakthrough.

We systematically collected **172 papers (2017–2024)** from leading NLP and CV venues via DBLP, using keywords covering neuro-symbolic, rule-based, probabilistic-logic, fuzzy-logic, concept-learning, and inductive-logic-programming methods. Each was read and categorized — we excluded non-interpretable methods, purely logical approaches, and short papers.

The organizing principle is **task-directed**: instead of classifying work by architectural variants, we group every method by *what it does with the symbolic layer* into three macro-categories:

![Task-directed neuro-symbolic taxonomy: three macro-categories (Rule Mining, Rule Enforcement, Program Synthesis) mapped to techniques, tasks, and standard benchmarks.](/assets/paper-img/nesy-survey/taxonomy.png "**Task-directed NeSy taxonomy.** Three macro-categories — (1) Rule Mining, (2) Rule Enforcement, (3) Program Synthesis — organize techniques by the role the symbolic layer plays. Tasks are annotated with the benchmarks that meet our fairness criteria; tasks with only synthetic or bespoke benchmarks are left unlabelled.")

1. **Rule Mining** — extract interpretable rules *from* a trained network (Horn clauses, Natural Logic, Deterministic Finite Automata).
2. **Rule Enforcement** — inject symbolic constraints *into* learning (First-Order Logic, Probabilistic Logic, DFAs) to shape or shield behavior.
3. **Program Synthesis** — synthesize programs from specifications (Context-Free Grammars, Semantic Parsing) so reasoning is executed symbolically.

![Examples of the formal languages each macro-category employs.](/assets/paper-img/nesy-survey/formal_languages.png "**Formal languages** underlying each framework: Horn clauses and logic programs (Mining), first-order / probabilistic logics and automata (Enforcement), and context-free grammars / semantic programs (Synthesis). Complexity grows left to right.")`
      },
      {
        id: "evidence", title: "Evidence",
        body: `The core question is not *do NeSy methods work* — it's **where they still beat black-box models**, and where they have quietly fallen behind.

### RQ1 — Where does the symbolic layer still add value?

NeSy methods earn their keep on tasks that demand **explicit rule enforcement and structured reasoning**: claim verification with legible proof chains, spatial/visual reasoning with compositional structure, and safety-critical control where constraints must be *guaranteed*, not approximated. Here the symbolic component delivers **interpretability and data efficiency** that black-box models cannot match at comparable accuracy.

### RQ2 — Where do black-box models now dominate?

On open-domain tasks fed by large-scale unstructured data — claim verification on **FEVER**, visual QA on **Sr3D**, temporal commonsense reasoning — black-box models leverage semantically-rich unlabeled data that symbolic pipelines cannot ingest, and NeSy accuracy drops noticeably. A clean example is the **TIMEDIAL vs McTACO** split on temporal reasoning: the same method's score swings sharply depending on whether the benchmark masks dialogue (TIMEDIAL) or asks multiple-choice QA (McTACO). NeSy solutions are **highly sensitive to the application framework**.

### RQ3 — Is the benchmarking itself fair?

Often, no. We flag two systemic problems:

- **Synthetic, method-tailored benchmarks.** Many NeSy papers evaluate on toy tasks specifically designed to highlight the proposed method's features — we consider these unsuitable for drawing cross-method conclusions.
- **Reproducibility gaps in sampling.** Tasks involving negative-example mining produce inconsistent results across replications; even **WN18RR** shows substantial disagreements for the *same* black-box baseline across different papers.

Only benchmarks meeting a fairness criterion are labelled on the taxonomy above; image generation, custom RL games, and causal-effect estimation are left unlabelled precisely because no comparable benchmark exists.

### RQ4 — What is the fundamental trade-off?

**Interpretability vs. generalization.** A case study is QA-NatVer: multi-granular chunking and step-by-step scoring deliver explainability but limit generalization relative to black-box models. Every NeSy design sits on this spectrum — symbolic clarity trades against neural adaptability — and the field's progress depends on methods that move the Pareto frontier rather than picking one corner.

> **Scope & outlook.** Image-based reasoning (post-NS-CL) appears near saturation; well-structured synthetic benchmarks reflecting real scenarios (e.g., CLEVR's effect on spatial reasoning) can still drive field-wide advances. The most promising frontiers are **trustworthy deployment via NLI-grounded constraints** — DFAs for shielding, reward shaping, and rule enforcement — in high-stakes domains (surgery, medical QA, autonomous driving, legal analysis), and design patterns like NeSyFOLD that mine rules from *neural features*, partial-interpretability bridges into black-box models.`
      }
    ],
    links: {"arxiv": "https://arxiv.org/abs/2603.03177", "code": "https://github.com/disi-unibo-nlp/task-oriented-neuro-symbolic", "read": "https://www.ijcai.org/proceedings/2025/1157", "doi": "https://doi.org/10.24963/ijcai.2025/1157", "pdf": "https://www.ijcai.org/proceedings/2025/1157.pdf"}
  },
  {
    id: "mixture-of-masters",
    title: "Mixture of Masters: Sparse Chess Language Models with Player Routing",
    authors: "Giacomo Frisoni, Lorenzo Molfetta, Davide Freddi, Gianluca Moro",
    venue: "arXiv preprint", year: 2026, type: "preprint", role: "cofirst",
    tags: ["Mixture of experts", "Chess", "Language models"],
    tldr: "A sparse mixture-of-experts chess language model where each expert channels a grandmaster's style, routed per move.",
    abstract: "Modern chess language models are dense transformers trained on millions of games played by thousands of high-rated individuals. However, these monolithic networks tend to collapse into mode-averaged behavior, where stylistic boundaries are blurred, and rare but effective strategies are suppressed. To counteract homogenization, we introduce Mixture-of-Masters (MoM), the first chess mixture-of-experts model with small-sized GPT experts emulating world-class grandmasters. For each move, a post-hoc learnable gating network selects the most appropriate persona to channel depending on the game state, allowing MoM to switch its style dynamically, e.g., Tal's offensive vocation or Petrosian's defensive solidity. When evaluated against Stockfish on unseen standard games, MoM outperforms both dense individual expert networks and popular GPT baselines trained on aggregated data, while ensuring generation variety, control, and interpretability.",
    abstractSource: "https://arxiv.org/abs/2602.04447",
    sections: [
      {
        id: "method", title: "Method",
        body: `Dense chess language models blend every playing style into one mode-averaged policy, so stylistic boundaries blur and rare but effective strategies get suppressed. **Mixture-of-Masters (MoM)** keeps the styles *separate* and picks one on the fly. It is built in three stages: **Branch** — start from a dense decoder-only transformer pretrained on chess (a 50M-parameter nanoGPT) and make $P$ copies, one per target grandmaster; **Train** — fine-tune each copy $\\varepsilon_{\\phi_p}$ on *only* the moves of one player $p$, using a player-side self-supervised loss $\\mathcal{L}_{\\text{SSL}} = - \\sum_{(s,m) \\in \\mathcal{D}_p} \\log \\varepsilon_{\\phi_p}(m \\mid s)$ that ignores opponent moves so they cannot dilute the target persona; and **Stitch** — assemble the experts into one sparse model where a **router** $\\mathcal{G}_\\phi$ reads the board state $s$, picks the top-$k$ personas via $P(p|s) = \\text{softmax}(\\mathcal{G}_\\phi(s))$, and aggregates them as $\\sum_{p \\in \\text{top-}k} P(p|s) \\cdot \\varepsilon_{\\phi_p}(s)$ while everything else is **uniformly merged** into a shared backbone. Training the router is the hard part because grandmaster selection is discrete, so we relax it with a **Gumbel-Softmax** (temperature-annealed from soft blending to sharp routing) and add a load-balancing loss so no expert gets starved. Only the merged weights and the router are trained — the experts stay frozen.

![Overview of Mixture-of-Masters. Per-player experts are trained, then stitched into a sparse model that routes each move to the right grandmaster persona.](/assets/paper-img/mixture-of-masters/overview.png "**Mixture-of-Masters.** Per-player experts are fine-tuned to emulate specific grandmasters, then *stitched* into a sparse model: at each layer the model either routes through persona-specific weights (top-$k$) or uses uniformly merged shared weights.")`
      },
      {
        id: "evidence", title: "Evidence",
        body: `We anchor everything on **10 world-class grandmasters** (Anand, Aronian, Carlsen, Caruana, Firouzja, Giri, Nakamura, Nepomniachtchi, So, Vachier-Lagrave), stitch the five strongest into MoM, and evaluate against Stockfish 16.1.

### RQ1 — Which seed model is the best foundation?

The seed matters more than expected. The Karvonen model — trained on *general* Lichess records rather than rating-filtered amateur play — gives every expert a clean **+0.1–0.2 FIDEScore** jump, consistently pushing them past the 0.6 threshold; its broader strategic prior is more amenable to stylistic shifting without catastrophic forgetting, so we adopt it as the backbone.

### RQ2 — Do grandmaster experts actually get stronger?

Every single expert beats the seed. **FIDEScores span 57.8 → 65.6** (seed = 54.1), with the ranking tracking training-set size — the gap is genuine, not noise.

| Expert | Anand | Aronian | Carlsen | Caruana | Firouzja | Giri | Nakamura | Nepo | So | MVL | Seed |
|---|---|---|---|---|---|---|---|---|---|---|---|
| FIDEScore | 59.4 | 59.9 | 62.6 | 62.5 | 59.1 | 63.7 | 63.5 | 65.3 | **65.6** | 57.8 | 54.1 |

The top-5 (Carlsen, Giri, Nakamura, Nepo, So) feed MoM. Crucially, FIDEScore climbs another **+11–15 points** once illegal moves are filtered at decode time (constrained decoding) — so raw move *quality* is far higher than the headline number.

### RQ3 — Does MoM beat single-model and composite baselines?

This is the headline. With the optimal $k=2$ active experts, MoM is the strongest model at every Stockfish difficulty.

| Model | FIDEScore (lv.0) | Glicko-2 rating |
|---|---|---|
| Karvonen seed | 54.0 | 1423 ± 11 |
| Mixed-GM (pooled) | 65.5 | 1540 ± 12 |
| Expert soup (uniform avg) | 65.4 | 1553 ± 12 |
| Random-partition MoM | 67.7 | 1549 ± 7 |
| **Mixture-of-Masters** | **69.1** | **1557 ± 12** |

MoM improves over the seed by **+15.0 FIDEScore** — *more* than the gain of the best individual expert (+11.5) — and beats the expert soup by **+3**. The decisive comparison is the last row: **random-partition MoM** has identical routing, parameters, and budget, but its experts are trained on *shuffled, player-agnostic* data, and MoM still beats it — persona-aligned specialization, not ensemble diversity, drives the gain.

### RQ4 — Do experts internalize *style*, not just strength?

Yes, in the geometry of their representations. Weight distances from the seed grow monotonically with depth, but the real separation is in **activations**: on an expert's *own* master's games, hidden states diverge sharply from sibling experts (ratios peak in layers 10–14), while on *other* masters' games they stay close.

Every expert's NLL advantage is positive across opening, middlegame, *and* endgame — ruling out the confound that experts merely memorize early-game sequences. Each expert's own master is the **top-1 most-likely player in 9 of 10 cases**.

### RQ5 — Is the routing interpretable?

The router doesn't collapse onto one expert. It maintains **sharp top-$k$ concentration** and produces meaningful style transitions across game phases — when MoM plays, you can read *which persona is being channeled* on each move, whereas a random-partition control does not.

> **Scope.** MoM shows that persona-aligned experts, stitched with a lightweight router, beat both dense and randomly-partitioned ensembles at the same parameter budget. The framework is demonstrated on chess; whether the same persona-routing principle transfers to other sequential-decision domains (code, dialogue) is the open question.`
      }
    ],
    links: {"arxiv": "https://arxiv.org/abs/2602.04447", "pdf": "https://arxiv.org/pdf/2602.04447"}
  },
  {
    id: "retrieve-rank",
    title: "Retrieve-and-rank End-to-end Summarization of Biomedical Studies",
    authors: "Gianluca Moro, Luca Ragazzi, Lorenzo Valgimigli, Lorenzo Molfetta",
    venue: "SISAP", year: 2023, type: "conference", selected: true, role: "cofirst",
    tags: ["Summarization", "Biomedical", "Retrieval"],
    tldr: "RAMSES: an end-to-end retrieve-and-rank model for summarising multiple biomedical studies.",
    abstract: "An arduous biomedical task involves condensing evidence derived from multiple interrelated studies, given a context as input, to generate reviews or provide answers autonomously. We named this task context-aware multi-document summarization (CA-MDS). Existing state-of-the-art (SOTA) solutions require truncation of the input due to the high memory demands, resulting in the loss of meaningful content. To address this issue effectively, we propose a novel approach called RAMSES, which employs a retrieve-and-rank technique for end-to-end summarization. The model acquires the ability to (i) index each document by modeling its semantic features, (ii) retrieve the most relevant ones, and (iii) generate a summary via token probability marginalization. To facilitate the evaluation, we introduce a new dataset, FAQSUMC19, which includes the synthesizing of multiple supporting papers to answer questions related to Covid-19. Our experimental findings demonstrate that RAMSES achieves notably superior ROUGE scores compared to state-of-the-art methodologies, including the establishment of a new SOTA for the generation of systematic literature reviews using MS2. Quality observation through human evaluation indicates that our model produces more informative responses than previous leading approaches.",
    abstractSource: "https://cris.unibo.it/handle/11585/962117",
    method: "RAMSES tackles context-aware multi-document summarization (CA-MDS). It indexes each document by its semantic features, retrieves the most relevant ones, and generates a summary via token-probability marginalization — avoiding the input truncation that hurts SOTA models. We also introduce FAQSUMC19, a Covid-19 multi-paper QA dataset for evaluation.",
    results: "RAMSES achieves notably higher ROUGE than SOTA methods and sets a new SOTA for systematic-review generation on MS2; human evaluation rates its summaries as more informative than prior leading approaches.",
    sections: [
      {
        id: "method", title: "Method",
        body: `Condensing evidence from *multiple interrelated studies given a context* — we name this **context-aware multi-document summarization (CA-MDS)** — is an arduous biomedical task. The core obstacle is length: with several full papers as input, state-of-the-art summarizers simply **truncate**, silently discarding the content that mattered most.

**RAMSES** replaces truncation with **retrieve-and-rank**:

1. **Index** each document by its semantic features.
2. **Retrieve** the passages most relevant to the *query context*.
3. **Generate** a summary via **token-probability marginalization** over the retrieved evidence — instead of decoding from a single concatenated-and-truncated input.

The pipeline preserves the full evidence pool and lets the model attend to what the context actually demands. We also introduce **FAQSUMC19**, a dataset of multiple supporting papers answering Covid-19 questions, built precisely for CA-MDS evaluation where a context-driven choice among sources is required.

![RAMSES bi-encoder retrieval and BART probability-marginalization architecture, including the end-to-end loss and decoding detail.](/assets/paper-img/retrieve-rank/ramses-method.png "**RAMSES architecture.** Separate BioBERT encoders represent the biomedical context and studies. Relevance scores select the top-k documents; BART generates the summary by marginalizing token probabilities weighted by those scores. Reproduced from Figure 2 of the authors’ SISAP manuscript.")`
      },
      {
        id: "evidence", title: "Evidence",
        body: `RAMSES is benchmarked against state-of-the-art multi-document summarizers and on the **MS2** systematic-review dataset.

### RQ1 — Does retrieve-and-rank beat truncation?

Yes. RAMSES achieves **notably higher ROUGE** than SOTA methods — the gain comes directly from *not* throwing away relevant evidence at the input stage.

### RQ2 — Does it set a new state of the art?

On **MS2** (systematic-review generation), RAMSES posts a new SOTA. Crucially, **human evaluation** rates its summaries as **more informative** than those of prior leading approaches — the ROUGE gain reflects a genuine qualitative improvement, not metric-gaming.

> **Scope.** RAMSES targets biomedical CA-MDS where documents are long but individually well-structured; domains with dense cross-document contradictions or heavily multi-modal evidence are left to future work.

### MS2

| Model | ROUGE-1 F1 | ROUGE-2 F1 | ROUGE-L F1 | R (aggregate) |
|---|---:|---:|---:|---:|
| LED-GAQ | 26.89 | 8.91 | 20.32 | 18.60 |
| BART-FID | 27.56 | 9.49 | 20.80 | 19.18 |
| DAMEN | 28.95 | 9.72 | 21.83 | 20.04 |
| PRIMERA | 30.07 | 9.85 | 22.16 | 20.55 |
| **RAMSES** | **31.83** | **10.44** | **22.19** | **21.32** |

### FAQSUMC19

| Model | ROUGE-1 F1 | ROUGE-2 F1 | ROUGE-L F1 | R (aggregate) |
|---|---:|---:|---:|---:|
| LED-GAQ | 25.55 | 4.42 | 13.77 | 14.47 |
| BART-FID | 20.26 | 5.59 | 14.84 | 13.51 |
| DAMEN | 23.81 | 3.50 | 13.03 | 13.35 |
| PRIMERA | 25.04 | 3.64 | 13.00 | 13.79 |
| **RAMSES** | **30.18** | **7.31** | **15.67** | **17.56** |

Figure 2 and Table 3 (manuscript pp. 3 and 8) are reproduced from the authors’ SISAP 2023 manuscript, titled *Retrieve-and-Marginalize End-to-End Summarization of Biomedical Studies*. The [published chapter](https://doi.org/10.1007/978-3-031-46994-7_6) is titled *Retrieve-and-Rank End-to-End Summarization of Biomedical Studies*. The reported values above are from that author manuscript, not independently checked against the publisher PDF.
`
      }
    ],
    links: {"read": "https://link.springer.com/chapter/10.1007/978-3-031-46994-7_6", "doi": "https://doi.org/10.1007/978-3-031-46994-7_6"}
  },
  {
    id: "ke-qa",
    title: "Knowledge-enhanced Neural Models for Question Answering Based on Retrieval",
    authors: "Lorenzo Molfetta",
    venue: "MSc thesis", year: 2023, type: "thesis", role: "first",
    tags: ["Question answering", "Knowledge graphs", "Retrieval"],
    tldr: "An MSc thesis on explainability and biomedical question answering through context augmentation, passage reranking and structured knowledge.",
    abstract: "Explainability in AI models has emerged as a paramount concern in various domains, including natural language processing (NLP). Understanding and interpreting AI models' decision-making processes is crucial for ensuring their ethical and trustworthy deployment. This thesis addresses the pressing need to improve explainability in language models, explicitly focusing on knowledge retrieval and integration for question-answering tasks. It delves into the rich landscape of neuro-symbolic and sub-symbolic techniques in reasoning, highlighting their strengths in combining rule-based interpretability with data-driven learning. The study provides a comprehensive overview of research advances in explainable AI. Also, it proposes to adopt a context-augmentation strategy for tackling the question-answering task in the biomedical field. This approach aims at enhancing the performances of retrieval models without intervening directly on its core functioning, namely modifying its parameters, but rather carrying out a reranking of the retrieved passages internally to the inference network. The proposed strategy suggests leveraging external sources more efficiently by integrating structured knowledge into the answer generation. This thesis encourages the usage of systems fostering explainability by showing the theoretical foundations and results of knowledge-enhanced solutions in the question-answering field. By inspiring confidence in users, regulators, and stakeholders, we propel the deployment of AI technologies towards a more transparent and accountable future.",
    abstractSource: "https://amslaurea.unibo.it/id/eprint/30058/",
    sections: [
      {
        "id": "method",
        "title": "Method",
        "body": "This MSc thesis studies explainability in language models, with a focus on retrieving and integrating knowledge for question answering. It reviews neuro-symbolic and sub-symbolic reasoning approaches and their different routes to interpretability.\n\nFor biomedical QA, it proposes a **context-augmentation strategy** that reranks retrieved passages inside the inference network without changing the retriever parameters. Structured knowledge is integrated into answer generation to make better use of external sources.\n\n![PubMed KG-FiD architecture showing frozen retrieval, graph-based passage reranking and a T5 encoder-decoder.](/assets/paper-img/ke-qa/pubmed-kg-fid.png \"**PubMed KG-FiD architecture.** Frozen retrieval selects PubMed abstracts; a GAT reranks the passages before T5 encoding, and a ReFactor module performs further reranking inside the encoder. Source: Figure 3.2 of the author’s MSc thesis, p. 65 (PDF p. 89).\")"
      },
      {
        "id": "scope",
        "title": "Scope",
        "body": "The thesis connects the theoretical foundations of explainable AI with knowledge-enhanced question answering. The [University of Bologna repository](https://amslaurea.unibo.it/id/eprint/30058/) provides the official metadata and full abstract; the thesis full text is not publicly available there."
      }
    ],
    links: {"read": "https://amslaurea.unibo.it/id/eprint/30058/"}
  }
];
