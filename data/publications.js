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
    "id": "spsd",
    "title": "Self-Play Search Distillation for Large Language Model Reasoning",
    "authors": "Lorenzo Molfetta, Wai-Chung Kwan, Giacomo Frisoni, Luca Ragazzi, Gianluca Moro, Pavlos Vougiouklis, Jeff Z. Pan, Pasquale Minervini",
    "venue": "Submitted to TACL",
    "year": 2026,
    "type": "submitted",
    "selected": true,
    "role": "first",
    "tags": [
      "LLM reasoning",
      "Self-play",
      "Knowledge distillation"
    ],
    "tldr": "SPSD turns board-game search records into environment-grounded reasoning supervision, improving generalization to unseen games and mathematics without human annotations.",
    "abstract": "Improving reasoning abilities in Large Language Models (LLMs) requires high-quality data that exposes difficult decisions, competing alternatives, and their consequences. Data scarcity is driven by the low quality of synthetic data and the cost of human labeling. We introduce Self-Play Search Distillation (SPSD), a framework for generating superhuman synthetic data via self-play of MuZero-like networks trained on board games. SPSD uses executable environments to turn search into structured reasoning problems. At each state, the expert identifies a preferred decision, plausible alternatives, plausible opponent replies, and value estimates. By converting the self-play search records into superhuman chains-of-thought, we train LLMs with environment-grounded supervision. Although trained only on self-play search records, SPSD transfers to unseen mathematics. On Qwen3-4B-Base, it raises the mean over six mathematics benchmarks from 24.1 to 36.6 while increasing the held-out-game win rate from 15% to 45%. SPSD offers an annotation-efficient way to create high-quality synthetic data for improving LLM performance in reasoning tasks.",
    "sections": [
      {
        "id": "spsd-beyond-answer-labels",
        "title": "Learning from the search behind a move",
        "body": "A final answer records that a solution worked. It does not show how the solver tracked the state, rejected the alternatives that looked promising, or anticipated a consequence several moves away. Human process supervision can expose those operations, but it is expensive, hard to verify, and ultimately capped by the expertise of the annotators. Letting a model generate its own supervision scales better, yet ties the quality of the data to the errors the learner already makes.\n\n**Self-Play Search Distillation (SPSD)** takes the supervision from somewhere else entirely: a frozen search expert that already plays above human level. While choosing a move, such an expert compares legal alternatives, scores them, and explores what happens next. We keep those comparisons and turn them into reasoning supervision for a language model.\n\nBoard games make this practical. The rules define exact transitions and legal actions, terminal states expose delayed consequences, and every claim in a training example can be checked by replaying it in the simulator. The expert supplies the decisions; replay supplies the facts used to explain them.\n\n{{visual:Figure 1}}\n\nGame competence tracks broader reasoning performance as models grow, and even frontier systems are far from saturating the board-game benchmark. These environments demand exactly what a scale curve cannot supply on its own: maintaining state and anticipating consequences across a sequence of decisions.\n\nThat gap motivates the experiment. We train on game-derived supervision, then measure what carries over to **unseen games and mathematics**. The panels above use GPQA-Diamond and Humanity's Last Exam for cross-model context; the post-training experiments use a separate suite of six mathematics benchmarks."
      },
      {
        "id": "spsd-search-to-supervision",
        "title": "Replay turns search records into training data",
        "body": "SPSD runs in three stages. A frozen search expert plays itself and exports one record per decision state, the simulator replays every record and discards whatever it cannot reproduce, and a renderer converts the survivors into prompts and reference responses. Freezing the expert before generation means the corpus never depends on the student trained from it.\n\nEach game gets an EfficientZero expert trained by self-play through LightZero. At every retained state it runs 50 Monte Carlo tree search simulations and exports the selected action, the visit-derived ranking over legal alternatives, value estimates, and replayable branch evidence. Trajectories start from a uniformly random legal prefix so the retained decisions spread across the reachable state space instead of clustering on one deterministic line of play.\n\n{{visual:Figure 2}}\n\nThe renderer then restores the position and replays the expert's move, up to one visit-ranked alternative, and where available one opponent reply. Only board effects recovered from those transitions reach the trace. A win, loss, or draw is stated **only when replay actually reaches that terminal state**; an invalid optional branch is dropped, and a record whose selected action fails to replay is rejected outright. The chain always ends on the expert's chosen legal handle.\n\nChoosing a strong move is not the same as reading the board that justifies it, so SPSD adds six **state questions**: occupancy, legality, threat count, legal-action count, legal-action enumeration, and successor state. Each decision state belongs to exactly one row family, which keeps a position from being both trained and probed.\n\n{{visual:Table 2}}\n\nEvery answer has an executable criterion. Enumeration requires the exact legal-action set, successor prediction requires the state produced by applying the transition, and the counting questions are recomputed from the restored board. The supervision is auditable by construction rather than by how convincing it sounds."
      },
      {
        "id": "spsd-how-transfer-is-learned",
        "title": "Game supervision transfers to mathematics",
        "body": "Three post-training paths use the same corpus. **Supervised fine-tuning (SFT)** trains directly on the rendered chain and answer. **On-policy self-distillation (OPSD)** lets the student sample its own response while a frozen teacher, conditioned on the expert trace as privileged context, supplies token-level guidance along that response. The student's own prompt contains only the board and the task. **RuleBot-Distill** keeps the OPSD procedure unchanged and swaps the search-derived corpus for completions from a fixed heuristic policy, so the origin of the supervision is the only thing that differs.\n\nEvaluation covers 15 held-out Ludii games, disjoint from training, and six mathematics benchmarks absent from the game supervision: MATH500, AIME24, AIME25, AMC23, Olympiad Bench, and Minerva Math.\n\n{{visual:Table 1}}\n\n**On Qwen3-4B-Base, OPSD triples the held-out-game win rate from 15% to 45%** and lifts FIDE from 15.0 to 39.9 while producing legal actions in 75.1% of evaluated positions. The same training raises the six-benchmark mathematics mean from 24.1 to 36.6, improving every individual benchmark over the base model. One corpus of search records buys gains in the source domain and in a reasoning domain it never touched.\n\nFitting the rendered chains directly does not achieve this. SFT reaches a mathematics mean of 30.3 but its legality falls to 34.9%, so the model gains on external tasks while losing command of the action interface it was trained on. Preserving what the student can already do turns out to be part of the result, not a side condition.\n\nThinking configuration reshapes the picture on Qwen3-8B. With thinking enabled, mathematics is near saturation for every condition, and the separation moves to game play: OPSD reaches the strongest trained held-out-game result, 59.5 FIDE and 62.7% wins, with complete action legality. With thinking disabled, search-derived knowledge lifts both evaluations. Llama-3.1-8B marks the boundary of the effect, where the two expert sources produce the same game outcomes and neither moves the mathematics mean.\n\nThe comparison against the heuristic teacher isolates what search contributes. On Qwen3-4B-Base, OPSD raises the win rate from 35% to 45% over RuleBot-Distill and the mathematics mean from 33.9 to 36.6, leading on the mathematics aggregate, FIDE, legality, and win rate together. RuleBot-Distill keeps the best Olympiad Bench score, 35.7 against 35.1, so a verified action alone is not worthless; it simply does not carry the ranked alternatives and replayable consequences that produce the broader gain."
      },
      {
        "id": "spsd-retaining-gains",
        "title": "OPSD keeps improving after SFT peaks",
        "body": "The endpoint ranking hides how each method got there. Tracking Qwen3-4B-Base across training makes the difference a matter of **retention** rather than speed. Game strength uses the FIDE score, which credits a loss 0, a draw 0.5, and a win 1.\n\n{{visual:Figure 3}}\n\nSFT reaches the strongest early mathematics checkpoint, 30.3 at step 100, then gives it all back: 23.1 by step 1000, with legality sliding from 34.9% to 25.0% and FIDE returning to its untrained level. Repeatedly fitting a fixed rendered response narrows the model on the game interface and on the separate reasoning tasks at the same time.\n\nOPSD improves late instead. Attaching the teacher's privileged evidence to **student-generated prefixes** keeps the update target on the responses the current model actually produces, and its curves climb through the final checkpoint on every axis.\n\nVarying the rules pushes this further. A separate pool of five base games with nine variants each yields 50 environments that change scoring, openings, movement, or winning conditions while preserving board topology, observation shape, and action-space size, so the student meets new decision patterns through an unchanged interface. **The variant-enriched curriculum leads at every evaluated checkpoint**, finishing at 42.4 FIDE, 77.3% legality, and a mathematics mean of 39.2, against 39.9, 75.1%, and 36.6 for the base curriculum. Diversifying the decisions a search expert is asked to explain improves what survives to the end of training."
      },
      {
        "id": "spsd-agreement-is-not-quality",
        "title": "Winning decisions align with MCTS",
        "body": "A last question is whether the trained model actually reasons the way the expert searched. We re-read each episode's trace to recover the move it commits to, restore the position, and query the frozen expert with a fresh 50-simulation search. **Q50** is the expert's value for the committed move; **oracle@50** is how often that move matches the one search prefers.\n\n{{visual:Figure 4}}\n\nWins concentrate where both signals are high, and the systems reach that region differently. Gemini 3.1 Pro sustains a high estimated win rate at intermediate agreement when its chosen actions carry high search value, so successful play there can diverge from the expert's preference. For GPT-5.5 and the SPSD model, high-valued choices are associated with wins most strongly when agreement is high as well, while Opus 5 shows a lower estimated win rate even when both coordinates are favorable.\n\nFor the SPSD student, winning and choosing the search-preferred action move together. We call this **reasoning sharpness**: selecting valuable actions and following the expert where its preference carries information. The coupling is tighter than in Gemini 3.1 Pro, which points at the comparative supervision itself, since each training example shows not only the chosen move but the alternatives it was weighed against.\n\nThe search runs once, during corpus construction. At inference the model sees only the rules and the board, with no values and no traces, which makes expert strength, simulation budget, and environment diversity adjustable inputs to the data rather than costs paid at deployment."
      }
    ],
    "links": {},
    "visualSelection": {
      "main": [
        "Figure 1",
        "Figure 2",
        "Table 1",
        "Figure 3",
        "Figure 4"
      ],
      "appendix": [
        "Table 2"
      ]
    }
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
        "id": "jab-beyond-working-functions",
        "title": "From isolated functions to object-oriented programs",
        "body": "Code generation benchmarks often ask a model to complete an isolated function. **Object-oriented programming** adds another obligation: the implementation must fit a system of interfaces, responsibilities, types, and state boundaries. Java Academic Benchmark (JAB) asks whether success on short coding problems survives that shift.\n\nThe manuscript surveys existing benchmarks by language and task granularity to explain the gap it targets.\n\n{{visual:Table 1}}\n\nThe concentration around Python and function-level tasks leaves room for a complementary class-level test. JAB places class-level implementation in an academic setting where both behavior and design are part of the assignment. Its evaluation follows the layers a professor would inspect.\n\n{{visual:Figure 1}}\n\nCompilation establishes whether the program is admissible; tests check behavior; KODE examines design quality. Each layer measures a distinct part of the solution.\n\nThe numbered visuals and results here follow the author manuscript, which differs from the final *Journal of Systems and Software* publication. Their correspondence to the final article remains unverified."
      },
      {
        "id": "jab-exams-as-specifications",
        "title": "An exam supplies an implementation contract",
        "body": "JAB collects 103 Java exams from 2014–2024, supported by 506 expert-written JUnit tests. The model receives instructions, interfaces, utility files, and tests. It must implement the missing pieces while respecting the provided structure. In the lamp example, that means representing different failure behaviors without duplicating everything those lamps share.\n\n{{visual:Figure 2}}\n\nThe example exposes the difference between returning the right value once and preserving an object’s behavior across repeated operations. It also explicitly prefers factoring common behavior into an abstract class. A solution can therefore satisfy visible assertions while leaving a design obligation unresolved.\n\nThe yearly statistics describe the amount of material the model must read and produce.\n\n{{visual:Table 2}}\n\nInputs average 1,858 tokens and reference solutions 623 tokens under the reported tokenizer. The specifications span multiple files and requirements. Complexity and solution length also vary by year, so an aggregate score combines different kinds of difficulty.\n\nThe topic map explains why that variation matters.\n\n{{visual:Table 3}}\n\nAlongside inheritance and encapsulation, the exams require generics, nested collections, design patterns, streams, and functional idioms. Knowing each construct separately may not be enough when a task combines them. The benchmark covers the curriculum of one instructor at one institution, with broader software-development settings outside its scope."
      },
      {
        "id": "jab-what-passing-means",
        "title": "Passing is deliberately a layered judgment",
        "body": "JAB distinguishes mandatory functionality from optional extensions. S-Pass requires every mandatory test; H-Pass additionally requires the optional tests. The original assignments define which requirements are mandatory and which are optional.\n\n{{visual:Figure 3}}\n\nA program can implement the required core and still omit operations or quality features needed for the stronger result. Compilation sits below both: code that never compiles cannot pass either test suite. The evaluation of 27 models makes these bottlenecks visible.\n\n{{visual:Table 4}}\n\nIn the manuscript, o4-mini-high reaches 96.1% S-Pass and 95.1% H-Pass, while Qwen2.5-Coder-32B reaches 48.5% and 33.0%. The latter gap shows that extended requirements remain difficult even among solutions that satisfy the core assignment. Other models lose substantial ground before tests can run at all.\n\nThe results apply to the studied model versions and decoding protocols. Reasoning models and other model families use different sampling settings, which also affect the comparison."
      },
      {
        "id": "jab-feedback-versus-another-guess",
        "title": "A compiler can help—but only if the model uses the feedback",
        "body": "Programming is rarely a single uninterrupted act of correct generation. JAB therefore adds an agentic setting with compiler diagnostics, test feedback, and up to three refinement rounds. A successful agentic pass@1 counts the entire permitted interaction, including refinements after the first code submission.\n\n{{visual:Table 5}}\n\nThe gains are model-dependent. Qwen2.5-Coder-32B moves from 48.5% to 57.3% S-Pass in this comparison, while smaller models remain substantially weaker. Most recoverable mistakes are fixed early; extra rounds offer diminishing returns.\n\nRepeated independent sampling is a different way to improve success probability.\n\n{{visual:Figure 4}}\n\nThe hatched extensions show @10 improvements over @1 through independent sampling. Here the gain comes from producing more candidates; compiler-guided revision is measured separately.\n\nThe student comparison narrows the evaluation to the 2023 exams and places model grades alongside a distribution from 176 students.\n\n{{visual:Figure 5}}\n\nSome strong models approach or exceed the student distribution under the reported protocol, especially with feedback. The comparison measures performance on these exams; professional engineering competence lies outside its scope. The same figure also compares Java tasks with their Python translations; several conditions improve in Python, while others tie.\n\nThe Qwen family provides a closer look at the interaction between language, sampling, and refinement.\n\n{{visual:Figure 6}}\n\nFeedback benefits vary with model size and language. Java’s static type constraints can stop a solution before an analogous Python program reaches its tests. The ten-task translated subset suggests a language-sensitive weakness; its cause, including any role of training-data bias, remains unresolved."
      },
      {
        "id": "jab-failures-have-structure",
        "title": "Errors reveal what a pass rate conceals",
        "body": "Class-level tasks make failures easier to localize than an undifferentiated project score. JAB groups the compiler and runtime errors generated by each model, retaining their frequencies and total counts.\n\n{{visual:Table 7}}\n\nSymbol-resolution failures are prominent: a plausible-looking method or class reference may not exist in the supplied program. At runtime, assertion failures dominate many distributions, showing that executable code can still violate the assignment. Boundary conditions, missing resources, and null handling provide additional failure modes. The totals show the absolute error burden behind each percentage.\n\nExam-year trends offer a second view of difficulty, linking performance to changes in the curriculum.\n\n{{visual:Figure 7}}\n\nThe highlighted periods emphasize tasks mixing object-oriented and functional styles, where several models deteriorate. The pattern is consistent with difficulty composing abstractions. Several task characteristics change together across years, leaving the contribution of each language feature unresolved."
      },
      {
        "id": "jab-cost-of-a-correct-solution",
        "title": "Correct code can still be expensive to produce and maintain",
        "body": "A passing implementation may be much longer or more complicated than the professor’s solution. JAB compares only passed model solutions with their corresponding references, using lexical overlap and output-to-reference ratios for size and structural complexity.\n\n{{visual:Table 8}}\n\nSeveral models produce substantially more verbose and complex code. Valid designs can have low lexical overlap, while complexity and duplication add maintenance work. Each row contains a different subset of solved tasks, so the cross-model ratios reflect both coding style and task selection.\n\nGeneration also has an immediate computational cost. The manuscript contrasts token consumption and API expenditure for two reasoning models.\n\n{{visual:Figure 8}}\n\nGemini-2.5-Flash produces more output tokens than o4-mini in this measurement, and the reported benchmark run costs more. These historical costs reflect the study’s settings and API prices; current prices and latency require separate measurement. Output length contributes to the cost of a solution alongside its correctness and maintainability."
      },
      {
        "id": "jab-a-judge-is-another-measurement",
        "title": "Design quality needs a rubric—and scrutiny of the judges",
        "body": "KODE evaluates clarity and maintainability, object design and encapsulation, reuse and modularity, and resource management and efficiency. In this author manuscript, one human expert and two language-model judges independently apply a three-point rubric without a reference solution. Their scores are then aggregated and normalized.\n\n{{visual:Table 6}}\n\nSome weaker programming models receive respectable OOP ratings despite low test-pass rates. Their solutions exhibit recognizable design patterns while still failing behavioral requirements. The human and automated judges also differ in strictness, particularly for clarity.\n\nAgreement statistics test how consistently these judgments can be reproduced.\n\n{{visual:Figure 9}}\n\nThe manuscript reports modest correlations and chance-corrected agreement despite high adjacent agreement. On a three-point scale, adjacent agreement allows a full point of difference between judges. The criterion-level matrices show which disagreements an aggregate hides, starting with readability.\n\n{{visual:Figure 10}}\n\nThe off-diagonal counts show disagreement over the readability of the same solutions. Encapsulation asks a more structural question: whether objects preserve a boundary around their state.\n\n{{visual:Figure 11}}\n\nScores concentrate near the upper end, leaving limited separation between good and excellent designs. Resource management and efficiency add concrete criteria, including container choices, memory handling, and computational cost.\n\n{{visual:Figure 12}}\n\nThe spread reflects judgment about efficiency, separate from measured execution behavior. Reuse introduces yet another judgment call: when is repeated logic minor, and when should it become a shared abstraction?\n\n{{visual:Figure 13}}\n\nDisagreement between satisfactory and excellent ratings remains visible. The matrices locate the disagreements within KODE’s rubric. The separate public supplement specifies a five-point scale, distinct from the manuscript’s three-point setup."
      },
      {
        "id": "jab-disagreement-in-the-code",
        "title": "The same duplication can look minor or decisive",
        "body": "The qualitative examples show what lies behind adjacent rating disagreements. For a Gemini-2.5-Pro solution, the automated judges criticize repeated list-combination logic and implementation-specific branches. The human judge acknowledges duplication but considers the overall builder design adequate for the highest reuse rating.\n\n{{visual:Figure 14}}\n\nThe judges agree that repetition exists and differ on its penalty. The same example also separates clarity from reuse: a design can organize responsibilities sensibly while making execution flow difficult to follow.\n\nThe o4-mini example reverses the reuse judgment: both automated judges award the higher score, while the human penalizes repeated list construction.\n\n{{visual:Figure 15}}\n\nOn efficiency, however, all judges identify unnecessary reconstruction or copying of lists and assign the same score. Agreement improves when the critique points to a concrete computational pattern rather than a stylistic threshold.\n\nJAB separates syntax, behavior, revision, and design into distinct measurements. Within one curriculum, it diagnoses where models fail under visible tests, standardized prompting, and model-specific decoding. The design rubric adds a human assessment whose disagreements remain visible alongside the execution results."
      }
    ],
    "links": {
      "read": "https://www.sciencedirect.com/science/article/pii/S0164121226002669",
      "doi": "https://doi.org/10.1016/j.jss.2026.113033",
      "code": "https://github.com/disi-unibo-nlp/jab"
    },
    "visualSelection": {
      "main": [
        "Table 1",
        "Figure 1",
        "Figure 2",
        "Table 2",
        "Table 3",
        "Figure 3",
        "Table 4",
        "Table 5",
        "Figure 4",
        "Figure 5",
        "Figure 6",
        "Table 6",
        "Table 7",
        "Figure 7",
        "Figure 8",
        "Table 8",
        "Figure 9",
        "Figure 10",
        "Figure 11",
        "Figure 12",
        "Figure 13",
        "Figure 14",
        "Figure 15"
      ],
      "appendix": []
    }
  },
  {
    "id": "sycophants",
    "title": "Sycophants in the Courtroom: Are LLMs Fragile to Juridical Authority and Evolving Legal Standards?",
    "authors": "Lorenzo Molfetta, Alessio Cocchieri, Luca Ragazzi, Ilaria Bartolini, Marco Patella, Gianluca Moro",
    "venue": "ACL",
    "year": 2026,
    "type": "conference",
    "selected": true,
    "role": "first",
    "tags": [
      "Legal NLP",
      "LLM robustness",
      "Evaluation"
    ],
    "tldr": "We probe whether LLMs bend their answers to juridical authority and shifting legal standards, and how fragile they are to such pressure in legal QA.",
    "abstract": "In medicine, claims remain valid when supported by empirical evidence grounded in stable biological reality. In law, by contrast, truth is contingent, defined by jurisdiction, temporal validity, and the hierarchy of authoritative sources. The recent success of large language models (LLMs) on medical licensing examinations has encouraged an expectation of comparable legal competence. This analogy, however, obscures a critical distinction between domains. Unlike in medicine, legal performance often depends less on inference than on determining when external authority is applicable, valid, and non-contradictory. We introduce a comparative diagnostic framework evaluating legal reasoning against medical baselines along four axes (knowledge recall, grounding, confidence, and robustness), uncovering a sharp domain asymmetry when applied to a new benchmark that encodes temporal validity and normative relationships. While medical LLMs reliably benefit from verified sources, legal LLMs struggle to assess when retrieved citations are useful or misleading, exhibiting overconfidence in perturbed contexts and sensitivity to superficial formatting cues. Increased model scale amplifies this tendency, revealing that stronger instruction following can coincide with weaker resistance to authoritative perturbations. These findings show that LLMs treat law as unstructured text rather than binding precedent, while revealing a tendency to over-trust authoritative but false information when external references conflict with a model’s internal knowledge.",
    "abstractSource": "https://aclanthology.org/2026.acl-long.497/",
    "sections": [
      {
        "id": "authority-not-just-recall",
        "title": "Legal answers depend on when a rule applies",
        "body": "A legal answer can cite a real instrument and still be wrong: a later act may have repealed it, extended its validity, or changed the scope of an exception. Sycophants in the Courtroom asks whether language models can use **authoritative evidence** without automatically deferring to it. The comparison with medicine tests whether the same model behaves differently on questions about changing normative relationships and clinical facts.\n\nThe study separates four measurements: Knowledge Recall (KR), accuracy without supporting context; Knowledge Grounding (KG), accuracy with relevant reference texts; Knowledge Confidence (KC), accuracy when those contexts are manipulated; and Format Perturbation (FP), sensitivity to how the question and options are presented. Here, confidence measures resistance to misleading evidence; probability calibration and self-reported certainty are separate concepts. The opening profiles show why one aggregate accuracy would conceal the problem.\n\n{{visual:Figure 1}}\n\nEach model has four percentage axes, with solid, hatched, and dotted marks distinguishing Standard, Incorrect, and None-Provided formats. GPT-OSS 120B reaches 92.5% on standard legal grounding but only 13.4% on standard knowledge confidence. Llama-3.1 8B has a lower grounding score, 68%, but a higher confidence score, 31.8%. The imbalance within each profile shows how greater success with valid context can coexist with weaker resistance to false context."
      },
      {
        "id": "relationship-benchmark",
        "title": "A benchmark built around legal relationships",
        "body": "LEGAL-LINK-EU contains 1,127 questions generated from 880 distinct EUR-Lex document pairs spanning 1953–2025. Its seven relation types are completes, corrects, extends application, extends validity, implicitly repeals, rendered obsolete by, and repeals. Each contributes 161 questions. The task requires inferring the legal consequences of an interaction between acts; the question leaves the relationship label implicit.\n\nThe generation pipeline uses GEPA prompt optimization, quality judgments, and structural checks intended to require cross-document reasoning and plausible distractors. A separate three-model jury audits a stratified 100-item sample. Validation therefore rests on a sample of synthetic questions assessed by LLMs, with exhaustive professional legal review outside the protocol. The cross-domain evaluation also includes paired legal and medical MMLU subjects and MedQA. Medical grounding uses generated MEDGENIE supporting passages, whereas legal grounding supplies the paired EUR-Lex texts.\n\nA worked repeal example makes the distinction concrete. The question concerns saithe and herring catches on 30 December 1983: does a new regulation replace every relevant fishing rule, or only a species-specific part of the regime?\n\n{{visual:Table 11}}\n\nOption D preserves the distinction: saithe falls under 31983R3624, while herring continues under Regulation (EEC) No 198/83. Option B is the tempting overgeneralization, treating the new act as an exclusive replacement for both activities. The answer depends on the scope of the replacement.\n\n{{visual:Table 12}}\n\nReading across the original-context, perturbed-context, and effect columns shows how the attack changes that interpretation. A title gains “UNIFORM,” a blanket applicability clause is inserted, replacement language is added, and herring-specific evidence is moved. Together these edits make B appear supported without simply telling the model which letter to choose. The example illustrates the intended failure mechanism; individual model responses are unreported."
      },
      {
        "id": "grounding-dependency",
        "title": "Reliable context repairs law more than medicine",
        "body": "The first empirical comparison asks how much knowledge is already available without the documents, and how much relevant context repairs. Table 1 groups recall results by legal and medical subject, then places the grounded and perturbed conditions side by side for LEGAL-LINK-EU and MedQA. Rows compare the same evaluated models across these conditions.\n\n{{visual:Table 1}}\n\nFor Gemini-2.5-Flash, MedQA moves from 86.9% recall to 89.7% grounding; LEGAL-LINK-EU moves from 70.5% to 97.5%. GPT-OSS 120B shows the same asymmetry: 84.1% to 86.4% in medicine, versus 62.6% to 92.5% in law. The paper reports grounding gains of 2.8 and 2.3 percentage points on MedQA, compared with 27.0 and 29.9 points on the legal benchmark.\n\nLEGAL-LINK-EU deliberately requires source documents, and supplying the correct texts produces substantial gains. The perturbed conditions test the cost of that reliance. Once that context is manipulated, Gemini's legal accuracy is 14.0% and GPT-OSS 120B's is 13.4%. Medical KC also varies sharply: Gemini reaches only 18.8% under medical KC, while GPT-OSS 120B retains 54.8%. The domain asymmetry is pronounced for the reasoning models, while medical robustness varies across the model roster."
      },
      {
        "id": "legal-effects",
        "title": "Which legal relationships break under pressure?",
        "body": "A single legal score can hide whether a model struggles with explicit corrections, temporal extensions, or implicit supersession. Table 2 therefore repeats the comparison by relation type. Its upper block gives grounded accuracy; the lower block gives perturbed-context accuracy, with subscripts recording the decrease from grounding.\n\n{{visual:Table 2}}\n\nLlama-3.1 reaches 75.2% on completes with valid context, but 62.1% on both implicitly repeals and repeals. Stronger models can resolve these relations when given the unmodified texts: Gemini reaches 98.8% on implicitly repeals and 100.0% on extends validity. Yet those same columns fall to 4.7% and 7.0% under perturbation. GPT-OSS 120B drops from 98.8% to 7.5% on extends validity, a reported 91.3-point decrease.\n\nHigh grounded scores show that the evaluated models can often recover the correct answer from clean documents, including on temporal questions. The larger difficulty is deciding whether the presented evidence deserves that trust. Extends application is comparatively less destructive under KC—for example, 29.8% for GPT-OSS 120B against 7.5% on completes—but it is still far below its 91.9% grounded result."
      },
      {
        "id": "perturbation-density",
        "title": "More corrupted context, less reliable answers",
        "body": "The confidence experiment partitions supporting text into chunks and varies how many are perturbed while retaining the overall context structure. Evaluation prompts explicitly permit the model to discount incomplete or misleading evidence. Models defer to corrupted context even with explicit permission to reject it.\n\n{{visual:Figure 2}}\n\nThe horizontal axis is perturbed-context percentage, from 20% to 100%; the vertical axis is accuracy. For GPT-OSS 20B, the legal curve falls from 35.7% to 14.8%, while MedQA falls from 65.2% to 50.5%. The bands report 95% confidence intervals over three independent runs per level. These means come from the perturbation-density experiment; Table 1 reports separate summary scores. Both domains deteriorate, but the legal curve is lower throughout and declines more strongly.\n\nAttack difficulty also depends on how each chunk changes. The cross-domain comparison measures those structural differences.\n\n{{visual:Table 14}}\n\nThe legal column has higher vocabulary overlap with its original contexts—Jaccard overlap 0.893 versus 0.822 for medicine—but lower sequence similarity, 0.680 versus 0.759. Length ratios stay close to one, at 0.983 and 1.028. Legal attacks preserve more words while reorganizing them more heavily. Surface lexical similarity can therefore conceal a changed legal meaning. The structural differences between attacks also complicate attribution of the cross-domain gap to legal authority."
      },
      {
        "id": "diagnostic-indices",
        "title": "Better grounding can coexist with greater deference",
        "body": "Four derived indices separate transitions that raw accuracy merges. The Grounding Inefficiency Index (GII) is lower when valid context more effectively repairs recall errors. The Parametric Override Index (POI) is lower when adversarial evidence displaces internal knowledge. The Citation Sycophancy Index (CSI) is lower when performance collapses from grounded to perturbed conditions. The Artifact Exploitation Index (AEI) measures the excess of Incorrect over None-Provided performance, normalized by the remaining headroom; higher values indicate greater option-artifact exploitation. Improvement has a different direction for each index.\n\n{{visual:Figure 3}}\n\nModel groups run from Llama-3.1 8B through Mistral-3 14B to GPT-OSS 20B and 120B; solid bars show law and hatched bars medicine. In the legal comparison, declining GII accompanies declining CSI and POI: useful grounding becomes stronger while resistance becomes weaker. The paper reports legal CSI of 46.9% for Llama-3.1 and 8.66% for GPT-OSS 120B, and POI of 78.2% versus 43.1%.\n\nThe scale-sensitive pattern applies to the evaluated families, where architecture, training, instruction following, and reasoning policy change alongside size. The authors hypothesize that extended reasoning can rationalize a supplied authority. Establishing that mechanism would require evidence beyond these indices."
      },
      {
        "id": "format-fragility",
        "title": "Removing the question can be easier than rejecting its options",
        "body": "Context is only one source of misleading evidence. The format tests change labels to Roman numerals, remove labels, place the correct answer last, ask for all incorrect options, substitute a None-Provided answer, or remove the question stem altogether. These manipulations probe different behaviors: some preserve the decision problem's surface meaning, while others deliberately change what the model must recognize.\n\n{{visual:Table 3}}\n\nEach setting contains Gemini-2.5-Flash and GPT-OSS 120B rows, with subject-specific columns and an average. On the legal subjects, Gemini scores 87.3% in the standard format, 51.8% with None Provided, and 65.4% with Options Only. GPT-OSS 120B follows the same ordering: 77.6%, 46.4%, and 59.8%. A model does better without the question than when it must recognize that the substantive answer is absent. In medicine, the ordering is more intuitive: Gemini scores 91.7%, 62.7%, and 52.2%; GPT-OSS 120B scores 90.1%, 70.7%, and 48.3%.\n\nOther changes expose model-specific sensitivity. Roman numerals raise Gemini's legal average to 88.5% but reduce GPT-OSS 120B's to 71.3%; fixing the correct answer's position yields 88.0% and 80.6%. Incorrect framing also interacts with the broader legal profiles, sometimes improving perturbed-context behavior. These results motivate the authors' helpfulness-prior interpretation; using incorrect-option prompts as a deployment safeguard would require separate validation."
      },
      {
        "id": "scope-and-design",
        "title": "Test evidence use and evidence rejection separately",
        "body": "Clean legal evidence produces some of the study's largest improvements. Retrieval evaluation needs to measure both extraction of the correct consequence from valid documents and rejection of comparable-looking evidence that changes that consequence. The model profiles show how sharply these abilities can diverge.\n\nThe study isolates this vulnerability through zero-shot multiple-choice tasks and oracle contexts. End-to-end retrieval, legal drafting, cross-examination, multi-jurisdiction argumentation, and deployed attack frequency remain outside the evaluation. The legal questions and perturbations are synthetic, the medical and legal supporting texts have different origins, and the attacks differ in their structural effects. Source validity, temporal applicability, and resistance to false citations each need direct testing in those settings."
      }
    ],
    "links": {
      "read": "https://aclanthology.org/2026.acl-long.497/",
      "doi": "https://doi.org/10.18653/v1/2026.acl-long.497",
      "pdf": "https://aclanthology.org/2026.acl-long.497.pdf"
    },
    "visualSelection": {
      "main": [
        "Figure 1",
        "Table 1",
        "Table 2",
        "Figure 2",
        "Figure 3",
        "Table 3"
      ],
      "appendix": [
        "Table 11",
        "Table 12",
        "Table 14"
      ]
    }
  },
  {
    "id": "ports",
    "title": "PORTS: Preference-Optimized Retrievers for Tool Selection with Large Language Models",
    "authors": "Lorenzo Molfetta, Giacomo Frisoni, Nicolò Monaldini, Gianluca Moro",
    "venue": "EMNLP",
    "year": 2025,
    "type": "conference",
    "selected": true,
    "role": "first",
    "tags": [
      "Tool use",
      "Retrieval",
      "LLMs"
    ],
    "tldr": "PORTS trains a retriever to pre-select the most useful tools for an LLM, using a preference signal derived from the LLM's own downstream performance.",
    "abstract": "Integrating external tools with Large Language Models (LLMs) has emerged as a promising paradigm for accomplishing complex tasks. Since LLMs still struggle to effectively manage large tool collections, researchers have begun exploring retrieval-based methods to pre-select the most relevant options, addressing input length and latency constraints. However, existing retrievers are often misaligned with tool-calling LLMs due to their separate training processes. This paper presents PORTS, a novel odds ratio preference optimization method for training retrievers aimed at tool selection. Using a perplexity-inspired preference signal from a frozen LLM, our approach fine-tunes a retriever to find helpful tools by optimizing the correlation between the selection probabilities and the downstream performances while jointly enforcing a contrastive semantic loss between documentation strings. The versatility of PORTS and its ability to significantly improve tool selection accuracy are demonstrated through extensive experiments on six datasets, two encoder models, and three LLMs with diverse prior knowledge. With low computational demands, our alignment process facilitates generalization to new queries and tools, proving valuable for practical applications with evolving toolsets.",
    "abstractSource": "https://aclanthology.org/2025.emnlp-main.507/",
    "method": "PORTS aligns a retriever with a frozen tool-calling LLM through an odds-ratio preference optimization. Tool-documentation triplets (one positive, several negatives) are encoded independently and prompted separately to the frozen LLM. The retriever is fine-tuned so that its selection probabilities correlate with the LLM's answer likelihood — maximizing the ratio between the odds of selecting the right tool versus the wrong ones — while a contrastive semantic loss over documentation embeddings keeps representations meaningful. Only the retriever is updated, so alignment is cheap and the LLM stays frozen.",
    "results": "Across six datasets, two encoders and three LLMs, PORTS lifts tool-selection accuracy substantially: average Recall@1-3 by up to +71.7 points and NDCG@1,3,5 by +70.2 over the RePlug baseline for seen tools; for unseen tools it still gains +61.2 Recall and +59.8 NDCG. The alignment is low-cost and generalizes to new queries and tools.",
    "sections": [
      {
        "id": "retrieval-bottleneck",
        "title": "Retrieve the tool that can perform the operation",
        "body": "A tool-using language model can only call an API it has been shown. Supplying an entire catalog is expensive and introduces competing descriptions, so a retriever usually selects a small candidate set first. That creates a separate failure point: an embedding model trained to recognize **semantic similarity** may retrieve a tool that sounds relevant but cannot perform the requested operation. Similar tool names and docstrings can conceal different arguments, types, and effects.\n\nPORTS trains that retrieval component to distinguish useful tools, using a frozen language model's likelihood of the correct tool call as guidance. Training updates the smaller context-selecting model while keeping the caller frozen. The opening comparison shows both the value of any adaptation and the additional contribution of preference optimization.\n\n{{visual:Figure 1}}\n\nThe horizontal axis is average recall, with separate rows for RoBERTa and BGE and bars for frozen, REPLUG-tuned, and PORTS-tuned retrievers. RoBERTa moves from 8.8% frozen to 50.8% with REPLUG and 57.5% with PORTS. BGE starts much stronger, at 54.4%, then reaches 62.5% and 65.6%. These plotted averages cover Recall@1, @2, and @3 across six datasets and, for tuned models, three guiding LLMs. Most of RoBERTa's improvement comes from adaptation itself; PORTS adds a further advantage over an already adapted retriever."
      },
      {
        "id": "two-training-signals",
        "title": "Align likelihoods, then separate the alternatives",
        "body": "Each training instance contains a query, its correct tool call, a positive tool, and negative tools. PORTS encodes the query and each docstring, converts their cosine similarities into a retrieval distribution, and separately prompts the frozen caller with each candidate. The caller's average log-likelihood of the gold call becomes a second distribution: a candidate is useful to the extent that its documentation supports producing that call. The supervision uses likelihood as a proxy for usefulness; tool execution is outside the training loop.\n\n{{visual:Figure 2}}\n\nThe diagram follows one positive and two negative docstrings through independent encoding and LLM scoring. The snowflake-marked caller remains fixed; the retriever is updated. Keeping candidates separate attributes the guidance signal to an individual docstring instead of mixing their contributions in one long prompt.\n\nThe objective combines a REPLUG-style distribution-matching term with a preference term: L_PORTS = L_replug + λ · L_po. The latter penalizes the retriever when the positive tool does not have sufficiently greater selection odds than each negative. In the paper, each pair contributes −log σ(log(odds-positive / odds-negative)), with pairwise contributions summed across negatives. Hard negatives are selected by the encoder's current similarity scores, and tool embeddings and negatives are refreshed periodically as that space changes.\n\nThis second signal matters when several descriptions are similarly plausible under the caller's likelihoods. Distribution matching aligns the retriever with the caller, while explicit positive-versus-negative comparisons preserve pressure to distinguish the correct tool from its close competitors."
      },
      {
        "id": "evaluation-design",
        "title": "Six datasets, two kinds of generalization",
        "body": "The evaluation spans ToolBench, API-Bank, APIBench, BFCL-v2, ToolE, and Octopus-v2. They differ in catalog size, query style—conversational, code-oriented, or ordinary requests—and whether a request requires one or several tools. Table 1 makes these differences visible before any score is compared.\n\n{{visual:Table 1}}\n\nThe table separates train and test examples from total tool inventories. ToolBench has 12,934 tools, whereas Octopus-v2 has only 20. API-Bank includes conversational inputs; APIBench and BFCL include programming-oriented tools. The final two rows are ToolE and Octopus variants with disjoint training and test tool inventories. Their inventories split into 160/39 and 16/4 train/test tools, respectively. This distinguishes generalizing to new queries about known tools from selecting tools absent during training.\n\nFor training, multi-tool examples from ToolBench, API-Bank, and BFCL are decomposed into single-tool targets; prior calls are removed from the retriever's conversational input. The main experiments pair RoBERTa-base and BGE-base with LLAMA3-8B, LLAMA3-GROQ-8B-Tool-Use, and CODESTRAL-22B-v0.1. Each run fits a single 24GB RTX 3090, with the LLM frozen and quantized to 4 bits. The reported setup uses three negatives, refreshes every 50 training steps, and trains for two epochs, with a 10K-instance sampling budget where data permit.\n\nRecall measures whether relevant tools are retrieved; NDCG additionally rewards placing them nearer the top. The results table reports Recall@1, @2, @3 and NDCG@1, @3, @5. These metrics measure candidate selection and ranking. Execution correctness and completion of the user's full request require downstream evaluation."
      },
      {
        "id": "results-and-baselines",
        "title": "Separate gains over frozen models from gains over REPLUG",
        "body": "The main result table compares PORTS and REPLUG within each encoder–dataset group. It also reports improvements over the frozen baseline. The baseline columns measure total adaptation gains; paired method rows measure the incremental preference-optimization gain. Each displayed row uses the best guiding LLM for that encoder–dataset–loss combination, so adjacent rows do not always share the same teacher.\n\n{{visual:Table 2}}\n\nThe headline increases of 71.66 recall points and 70.16 NDCG points occur for seen-tool RoBERTa on Octopus in the Δavg baseline columns. For unseen-tool RoBERTa on ToolE, those columns show 61.24 and 59.79 points. Both sets of gains use the frozen encoder as the reference. The paired seen-tool Octopus rows are more informative about the incremental method change: PORTS obtains Recall@1/@2/@3 of 95.00/100/100, compared with 87.50/97.50/100 for REPLUG. Both already recover the tool within three candidates; preference optimization mainly improves its placement.\n\nThe harder catalogs reveal remaining headroom. With BGE on ToolBench, PORTS reaches Recall@1 of 25.80% and Recall@3 of 43.35%. With RoBERTa on APIBench, it reaches 21.50% and 30.53%, against REPLUG's 8.74% and 15.35% in the displayed best-teacher comparison. Absolute recall remains low on these catalogs.\n\nThe preference objective generally raises dataset-level retrieval performance, but not every individual metric. For example, the BGE BFCL rows show NDCG@5 of 73.10 for PORTS and 74.31 for REPLUG, even though PORTS has a higher average gain. The small unseen Octopus catalog has a starred final NDCG column reporting NDCG@4, because only four test tools exist."
      },
      {
        "id": "caller-and-docstrings",
        "title": "The teacher and the documentation both matter",
        "body": "A retriever teacher supplies contrast between candidate-conditioned gold-call likelihoods. Tool-calling specialization alone is an unreliable guide to that contrast. An uncertain general model can sometimes provide a more informative distribution than a specialized model that assigns similar confidence to several candidates.\n\n{{visual:Figure 3}}\n\nEach dataset panel compares RoBERTa and BGE on its horizontal axis; bar groups correspond to the three guiding LLMs, and the frozen baseline supplies a reference. The right-hand panels isolate unseen ToolE and Octopus tools. The pattern is consistent with Figure 1: the weaker RoBERTa baseline leaves much more room for adaptation, whereas BGE's strong starting point compresses the available gain, especially on Octopus. Across panels, no teacher is uniformly best.\n\nThe paper associates some of this variation with documentation. Detailed argument names, outputs, types, and defaults give the caller—and therefore the retriever's learning signal—more functional information. Broad descriptions of model capabilities can leave competing tools difficult to distinguish. The best teacher–retriever pairing depends on the catalog and needs empirical selection."
      },
      {
        "id": "unseen-tool-sweep",
        "title": "What happens when fewer training tools are available?",
        "body": "Holding out queries is a relatively forgiving test if the entire catalog was already represented during training. The out-of-domain sweep instead changes the proportion of **seen tools** in ToolE, keeping a consistent test distribution while reducing the training inventory. It uses RoBERTa with LLAMA3-8B guidance to compare PORTS directly with REPLUG.\n\n{{visual:Figure 4}}\n\nThe horizontal axis runs through 35%, 50%, 70%, 80%, and 90% training-tool coverage; the two panels plot average recall and NDCG. Both methods improve as more of the catalog becomes available during training, but PORTS stays above REPLUG at every plotted coverage level. Its advantage persists at the low-coverage end instead of depending entirely on memorizing a nearly complete inventory.\n\nThe static split tests transfer to held-out tools through their documentation. Changing API versions and multi-step agent plans introduce additional shifts in schemas, state, and downstream requirements that remain outside this evaluation."
      },
      {
        "id": "retrieval-example",
        "title": "A hotel request should retrieve a hotel tool",
        "body": "The qualitative example translates the ranking objective back into an ordinary request: “I'm looking for a hotel in Sapporo.” Table 13 compares the top three tools under PORTS-tuned and frozen BGE.\n\n{{visual:Table 13}}\n\nThe gold tool, TripTool, describes hotel and accommodation bookings alongside broader travel functions. Frozen BGE ranks Sakenowa ahead of TripTool and places Local third, with the three cosine similarities close together. PORTS puts TripTool first and separates it much more clearly from SmartTicket and Local. The bar heights measure cosine similarity; successful execution is a separate outcome.\n\nIn this example, preference training favors the documentation that supports hotel booking over descriptions that share geographic or travel-related language. It changes both the winning tool and its separation from the alternatives; the aggregate results measure how broadly ranking improves."
      },
      {
        "id": "robustness-and-cost",
        "title": "Likelihood supervision has a computational cost",
        "body": "Repeated runs with different random seeds test how stable the retrieval gains are.\n\n{{visual:Table 10}}\n\nRows group average recall by dataset across seeds 0, 42, and 100, followed by a variance column. ToolE is comparatively stable, with reported variance 0.69; API-Bank is less stable, with 33.59 and seed scores ranging from 46.73 to 60.38. Octopus also varies, with reported variance 19.39. Stability is catalog-dependent, making repeated runs on the intended catalog useful before deployment.\n\nPORTS avoids updating the caller, but must repeatedly query it to obtain likelihood guidance. The paper explicitly identifies this time and memory overhead as a limitation, along with sensitivity to vague docstrings; its full experiment suite totals approximately 500 GPU-hours. Re-aligning a retriever to another caller therefore has a cost, even if each run is feasible on one workstation.\n\nThe contribution is a practical training objective for the retrieval bottleneck. The next validation step is to connect better rankings to actual execution success, code-generation correctness, and complete multi-step tasks. The present results establish retrieval gains; those downstream outcomes remain unmeasured."
      }
    ],
    "links": {
      "code": "https://github.com/disi-unibo-nlp/ports",
      "read": "https://aclanthology.org/2025.emnlp-main.507/",
      "doi": "https://doi.org/10.18653/v1/2025.emnlp-main.507",
      "pdf": "https://aclanthology.org/2025.emnlp-main.507.pdf",
      "arxiv": "https://arxiv.org/abs/2607.05441"
    },
    "visualSelection": {
      "main": [
        "Figure 1",
        "Figure 2",
        "Table 1",
        "Table 2",
        "Figure 3",
        "Figure 4"
      ],
      "appendix": [
        "Table 13",
        "Table 10"
      ]
    }
  },
  {
    "id": "feast",
    "title": "FEAST: Retrieval-Augmented Multi-Hierarchical Food Classification for the FoodEx2 System",
    "authors": "Lorenzo Molfetta, Alessio Cocchieri, Stefano Fantazzini, Giacomo Frisoni, Luca Ragazzi, Gianluca Moro",
    "venue": "ECAI",
    "year": 2025,
    "type": "conference",
    "selected": true,
    "role": "first",
    "tags": [
      "Retrieval-augmented",
      "Food / health",
      "Classification"
    ],
    "tldr": "A retrieval-augmented classifier over the multi-hierarchical FoodEx2 food-coding taxonomy.",
    "abstract": "Hierarchical text classification (HTC) and extreme multi-label classification (XML) tasks face compounded challenges from complex label interdependencies, data sparsity, and extreme output dimensions. These challenges are exemplified in the European Food Safety Authority's FoodEx2 system-a standardized food classification framework essential for food consumption monitoring and contaminant exposure assessment across Europe. FoodEx2 coding transforms natural language food descriptions into a set of codes from multiple standardized hierarchies, but faces implementation barriers due to its complex structure. Given a food description (e.g., \"organic yogurt''), the system identifies its base term (\"yogurt''), all the applicable facet categories (e.g., \"production method''), and then, every relevant facet descriptors to each category (e.g., \"organic production''). While existing models perform adequately on well-balanced and semantically dense hierarchies, no work has been applied on the practical constraints imposed by the FoodEx2 system. The limited literature addressing such real-world scenarios further compounds these challenges. We propose FEAST (Food Embedding And Semantic Taxonomy), a novel retrieval-augmented framework that decomposes FoodEx2 classification into a three-stage approach: (1) base term identification, (2) multi-label facet prediction, and (3) facet descriptor assignment. By leveraging the system's hierarchical structure to guide training and performing deep metric learning, FEASTlearns discriminative embeddings that mitigate data sparsity and improve generalization on rare and fine-grained labels. Evaluated on the multilingual FoodEx2 benchmark, FEAST outperforms the prior European's CNN baseline F1 scores by 12-38 % on rare classes.",
    "abstractSource": "https://arxiv.org/abs/2603.03176",
    "sections": [
      {
        "id": "structured-food-coding",
        "title": "Food descriptions require several coordinated labels",
        "body": "FoodEx2 turns an everyday description into a **structured record** for food-consumption monitoring and exposure assessment. The system must distinguish yoghurt as the base food from its ingredients, production methods, and packaging, then choose valid descriptors from several taxonomic hierarchies. FEAST—Food Embedding And Semantic Taxonomy—treats this as a combination of hierarchical and extreme multi-label classification.\n\n{{visual:Figure 1}}\n\nFollow the yoghurt example from the input sentence to its base term and separate facet groups. Corn flakes, oats, and raspberries create multiple ingredient descriptors, while the glass cup contributes information to two different packaging categories. **The target is a coordinated set of decisions.** A complete code requires both the right food identity and the right facets, which motivates a staged model."
      },
      {
        "id": "coverage-before-models",
        "title": "The bottleneck begins with the available annotations",
        "body": "The source dataset contains 72,197 entries; cleaning missing values, duplicates, anonymized descriptions, and inconsistent annotations leaves 28,648. The resulting corpus is multilingual in content and contains mappings that require domain knowledge rather than simple word matching. Its observed labels cover only a fraction of the catalog.\n\n{{visual:Table 1}}\n\nCompare coverage after preprocessing across the three rows: all 28 **facet categories** appear, but only 1,650 of 4,367 base terms and 1,355 of 28,675 facet descriptors are represented. Broad coverage of category names therefore coexists with very sparse coverage of the fine-grained decisions the system ultimately has to make.\n\n{{visual:Table 2}}\n\nThe per-instance distributions add another constraint. Some descriptions require no facets at all; others require several categories and multiple descriptors within them. The averages and maxima show how much output length varies. The authors also construct an out-of-sample split with disjoint base-term categories, which is the default evaluation setting unless otherwise stated. This probes transfer beyond seen base terms within the reduced tender dataset."
      },
      {
        "id": "retrieve-then-disambiguate",
        "title": "Use the taxonomy to retrieve plausible codes before choosing",
        "body": "FEAST separates base-term selection, facet-category prediction, and descriptor selection. Dense retrieval narrows the large base-term and descriptor spaces; cross-encoders or an instruction-tuned language model then assess the candidates. Category prediction is treated separately because it must identify several overlapping dimensions rather than select a single food identity.\n\n{{visual:Figure 2}}\n\nRead the pipeline in order, paying attention to the category decision that determines which descriptor candidates are considered. The diagram shows alternative model stacks: lightweight classification and generative classification occupy different positions in the design space. Taxonomy-aware hard negatives make training examples deliberately confusable, drawing on shared parents, structural proximity, and overlapping implicit facets. This is a way to teach distinctions that ordinary semantic similarity can miss.\n\n{{visual:Figure 3}}\n\nThe instruction templates show how the same LLM is adapted to the three subtasks. Inspect the candidate lists and contextual descriptions, and the explicit permission to return an empty category list. The prompts restrict FoodEx2 decisions to the supplied candidates and context. Errors in earlier selections can propagate to later stages, so full-code reliability depends on the entire pipeline."
      },
      {
        "id": "ranking-versus-classification",
        "title": "Retrieval is strong; selecting the right dimensions is harder",
        "body": "The ranking experiments distinguish finding plausible candidates from assigning the final labels. This distinction matters in a taxonomy where many nearby descriptions differ in small but consequential ways.\n\n{{visual:Table 3}}\n\nInspect the retrieval and reranking blocks separately. ModernBERT reports 96.57% Acc@1 for base-term retrieval and 98.90% for descriptor retrieval; DeBERTa-v3-large reports 91.01% and 96.03% Acc@1 in the corresponding reranking blocks. These scores measure individual components. In both tasks, the reported reranker accuracy is lower than the retriever's own top-result accuracy.\n\n{{visual:Table 4}}\n\nFacet-category retrieval is less decisive. DeBERTa-v3-base reaches 73.03% Acc@1, while Recall@1 is 44.70%; expanding the candidate list increases recall. Read this gap as evidence that locating one plausible category is easier than recovering all relevant categories.\n\n{{visual:Table 5}}\n\nThresholding exposes the remaining precision–recall trade-off. At threshold 0.4, the reported micro-F1 is 88.00%, but macro-F1 is 53.05%. Lower thresholds recover more labels without eliminating that disparity. **An aggregate score dominated by frequent labels can conceal weak coverage of rare categories.**"
      },
      {
        "id": "llm-is-not-universally-better",
        "title": "Model choice depends on the subtask",
        "body": "Joint instruction tuning makes the LLM a flexible classifier, but its effectiveness varies sharply by subtask. Facet categories require simultaneous recognition of several semantic dimensions, and the authors report that a smaller supervised classifier can outperform the LLM on this decision.\n\n{{visual:Figure 4}}\n\nPerformance varies across facet categories. The plot lacks a color-to-model legend, leaving the two series unidentified. Both series are relatively weak on F09, F26, and F27, while F08, F10, F22, and F28 are consistently stronger. This category-level unevenness matters when deciding which facets need more examples or closer review.\n\n{{visual:Table 6}}\n\nThe LLM's validation results sharpen that picture: micro-F1 is 99.18% for Task I, 78.82% for Task II, and 99.82% for Task III. For Task II, the reported accuracy of 96.39% sits alongside only 55.65% exact match of the **complete label set**. Exact match requires every label in the set to be correct. Validation uses simulated distractor candidates; the test set uses the **real retrieval pipeline**. The near-perfect validation scores therefore describe candidate selection under the simulated setup."
      },
      {
        "id": "scope-and-deployment",
        "title": "Expert inspection and catalog coverage",
        "body": "FEAST's practical contribution is an inspectable decomposition: experts can examine retrieved candidates and reranking scores rather than receive only an opaque final code. The paper compares selected task-level accuracies with previously reported CNN-based FoodEx2 figures, but explicitly conditions its interpretation on retrieval coverage and acknowledges the absence of a standardized public benchmark. The evaluation covers the curated dataset, with full-catalog reliability still untested.\n\nThe discussion reports that the most underrepresented categories can still have zero F1. It also states that raw data and model weights were not publicly available at the time of writing because release required the contracting authority's approval. The authors propose joint end-to-end optimization, targeted data augmentation, and continual adaptation for future evaluation.\n\n*Source: the eight-page arXiv v1 dated 3 March 2026, which has no appendix and identifies a separate definitive ECAI 2025 version.*"
      }
    ],
    "links": {
      "arxiv": "https://arxiv.org/abs/2603.03176",
      "read": "https://ebooks.iospress.nl/doi/10.3233/FAIA251309",
      "doi": "https://doi.org/10.3233/FAIA251309",
      "pdf": "https://arxiv.org/pdf/2603.03176"
    },
    "visualSelection": {
      "main": [
        "Figure 1",
        "Table 1",
        "Table 2",
        "Figure 2",
        "Figure 3",
        "Table 3",
        "Table 4",
        "Table 5",
        "Figure 4",
        "Table 6"
      ],
      "appendix": []
    }
  },
  {
    "id": "graph-of-mark",
    "title": "Graph-of-Mark: Promote Spatial Reasoning in Multimodal Language Models with Graph-based Visual Prompting",
    "authors": "Giacomo Frisoni, Lorenzo Molfetta, Mattia Buzzoni, Gianluca Moro",
    "venue": "AAAI",
    "year": 2026,
    "type": "conference",
    "selected": true,
    "role": "cofirst",
    "tags": [
      "Multimodal",
      "Spatial reasoning",
      "Visual prompting"
    ],
    "tldr": "Graph-based visual prompting that improves spatial reasoning in multimodal language models.",
    "abstract": "Recent advances in training-free visual prompting, such as Set-of-Mark, have emerged as a promising direction for enhancing the grounding capabilities of multimodal language models (MLMs). These techniques operate by partitioning the input image into object regions and annotating them with marks, predominantly boxes with numeric identifiers, before feeding the augmented image to the MLM. However, these approaches treat marked objects as isolated entities, failing to capture the relationships between them. On these premises, we propose Graph-of-Mark (GoM), the first pixel-level visual prompting technique that overlays scene graphs onto the input image for spatial reasoning tasks. We evaluate GoM across 3 open-source MLMs and 4 different datasets, conducting extensive ablations on drawn components and investigating the impact of auxiliary graph descriptions in the text prompt. Our results demonstrate that GoM consistently improves the zero-shot capability of MLMs in interpreting object positions and relative directions, improving base accuracy in visual question answering and localization up to 11 percentage points.",
    "abstractSource": "https://arxiv.org/abs/2603.06663",
    "sections": [
      {
        "id": "from-objects-to-relations",
        "title": "Draw spatial relationships onto the image",
        "body": "A multimodal language model may recognize an oven and a plant yet still misread which is above the other. Graph-of-Mark (GoM) addresses this gap by modifying the input: it draws an estimated **scene graph** directly onto the image, making **object identities** and **spatial relationships** jointly visible.\n\n{{visual:Figure 1}}\n\nCompare the isolated region marks with the connected representation. Set-of-Mark provides names for regions; GoM additionally supplies arrows and, in some variants, relation labels. **The model weights stay frozen.** Gains depend on the accuracy of the automatically estimated graph and the model's ability to interpret the overlay."
      },
      {
        "id": "construct-a-readable-graph",
        "title": "Building useful structure requires selective annotation",
        "body": "The pipeline combines detector outputs, merges overlapping boxes, and refines regions with segmentation. It estimates directional relations from image geometry, front–back ordering from monocular depth, and proximity where appropriate. Query-based filtering then removes irrelevant objects and relations before rendering masks, IDs, arrows, and optional edge labels. Collision handling is important: an annotation that covers the evidence can undermine the reasoning it was meant to support.\n\n{{visual:Figure 2}}\n\nIn the kitchen example, hold the question fixed and compare the answers produced by the different image treatments. The raw and SoM responses incorrectly place the potted plant below the oven, whereas the GoM examples answer no. Inspect the referenced object IDs as well as the final yes/no answer: the example shows how marking affects regional attribution. This qualitative illustration uses enlarged fonts and line widths for readability.\n\n{{visual:Table 1}}\n\nThe hyperparameter sweep documents the preprocessing choices. Detection confidence, geometric thresholds, query matching, and retained relations all influence the constructed evidence. Starred algorithm settings were selected after preliminary Qwen-2.5-VL runs on GQA; the evaluation then varies seed, temperature, and top-p across 27 decoding configurations. Those repetitions quantify decoding variation with the selected preprocessing settings held fixed."
      },
      {
        "id": "read-the-results-by-task",
        "title": "The gains depend on both the model and the prompt variant",
        "body": "The evaluation uses three open-source multimodal models and four datasets: GQA, VQAv1, VQAv2, and RefCOCOg. It samples 1,000 images per dataset while retaining their associated questions. Referring-expression comprehension is evaluated through predicted object IDs, with a correct region requiring IoU at least 0.9; this protocol is not applied to raw-image or segmentation-only inputs that lack the necessary IDs.\n\n{{visual:Table 2}}\n\nRead each model block against its own baselines and use the icon legend to distinguish connectivity, object-ID format, and explicit relation labels. For Gemma-3 on VQAv2, the table reports 59.9% with raw images and 71.9% with textual object IDs plus relation labels. Ordinary marking lowers performance for Qwen-2.5-VL: its VQAv2 accuracy is 73.8% on raw images but 68.6% with SoM, while a labeled GoM variant reaches 80.5%. The size and direction of the effect vary across variants and metrics.\n\nThe best configuration varies by column. RefCOCOg improvements are smaller than the strongest VQA improvements; raw-image localization entries are absent because those inputs lack object IDs. Means and standard deviations summarize decoding runs under the chosen preprocessing and sampled-image protocol."
      },
      {
        "id": "density-and-modality",
        "title": "More structure helps only while it remains readable",
        "body": "The graph-density ablation tests how the number of drawn relationships affects performance.\n\n{{visual:Figure 3}}\n\nStart at zero edges, the SoM-like condition, then follow each model as edges are added. The authors identify the most effective regime around 3–10 entities and 4–16 relations; denser annotation reduces the available headroom by introducing noise. Filtering keeps the overlay within this useful density range.\n\n{{visual:Figure 4}}\n\nThe modality ablation asks a separate question: should the graph be shown, verbalized, or both? Compare raw-image/text, textual-graph, visual-graph, and combined conditions within each dataset. For Gemma-3, visual graphs provide the stronger contribution, with verbalization adding smaller gains. This Gemma-3 experiment supports combining spatial overlays with text; the balance between them remains to be tested across other architectures."
      },
      {
        "id": "an-appendix-case-that-tests-the-limit",
        "title": "When a richer label becomes a distraction",
        "body": "The appendix's referring-expression example requires the model to select a marked object, shifting the task from answering a spatial question to identifying a region.\n\n{{visual:Figure 7}}\n\nCompare the two couch descriptions and track which IDs each prompt assigns to them. Several GoM variants resolve the requested objects, but the example also contains a GoM failure: textual IDs together with relation labels lead to an incorrect assignment. The naming scheme can distract from the relational evidence during ID-based localization.\n\nThe example preserves the actual font size and line thickness used by the source, unlike the enlarged main-body illustration. This Appendix C case documents a specific localization failure; its frequency requires quantitative evaluation."
      },
      {
        "id": "scope-of-the-intervention",
        "title": "Inference-time cost and geometric errors",
        "body": "GoM makes a structured intermediate representation available to a frozen multimodal model without architectural changes. On the reported workstation, image augmentation averages 1.13 seconds, compared with 0.77 for segmentation-only and 0.92 for SoM. These timings cover preprocessing on the paper's workstation; total response time also includes model inference.\n\nThe method still relies on detected objects, heuristic spatial relations, relative depth estimation, and query filtering. Missing objects or incorrect depth ordering can become confidently rendered evidence. The experiments demonstrate benefits in the tested settings, with reliability still dependent on those upstream estimates. Proposed extensions include hypergraphs, stereo depth, video, and clinical applications.\n\n*Source: the fourteen-page arXiv 2603.06663v2, including Appendices A–C. The final AAAI publisher version was unavailable for comparison.*"
      }
    ],
    "links": {
      "arxiv": "https://arxiv.org/abs/2603.06663",
      "read": "https://ojs.aaai.org/index.php/AAAI/article/view/40329",
      "doi": "https://doi.org/10.1609/aaai.v40i36.40329",
      "pdf": "https://arxiv.org/pdf/2603.06663"
    },
    "visualSelection": {
      "main": [
        "Figure 1",
        "Figure 2",
        "Table 1",
        "Table 2",
        "Figure 3",
        "Figure 4"
      ],
      "appendix": [
        "Figure 7"
      ]
    }
  },
  {
    "id": "comma",
    "title": "COMMA: A Multi-task and Multi-lingual Dataset of Constitutional Verdicts",
    "authors": "Luca Ragazzi, Giacomo Frisoni, Gianluca Moro, Paolo Italiani, Lorenzo Molfetta, Veronika Folin",
    "venue": "Artificial Intelligence and Law",
    "year": 2026,
    "type": "journal",
    "selected": true,
    "role": "cofirst",
    "tags": [
      "Legal NLP",
      "Dataset",
      "Multilingual"
    ],
    "tldr": "A multi-task, multilingual dataset of constitutional-court verdicts for legal NLP.",
    "abstract": "Transformer-based language models have sparked a revolutionary change in Legal NLP, endowing lawyers with unparalleled tools to effectively navigate, understand, and draft large volumes of text. However, the dearth of large-scale datasets from authoritative sources hampers further progress. The available resources are primarily single-task, English-only, and written in layman’s terms. To bridge this gap, we introduce Comma , a multi-task and multi-lingual archive of 14K verdicts drawn from the Constitutional Court of the Italian Republic, grounded in a non-common law system. Documents in Comma diverge from ordinary legal manuscripts as they address fundamental principles and rights, involve technical jargon, exhibit an articulated structure, are diachronic, have extended length, and demand more significant expertise and interpretation. By embracing 4 widespread languages, Comma tackles a panoply of necessity-driven tasks: multi-granular abstractive summarization, decision generation, article retrieval, and ruling classification. We systematically benchmark a catalog of language models in both few-shot and full settings, uncovering substantial headroom for improvement. We contribute to the new era of Legal NLP systems by openly releasing Comma and best-performing models (https://github.com/disi-unibo-nlp/comma).",
    "abstractSource": "https://api.crossref.org/works/10.1007/s10506-026-09520-x",
    "method": "COMMA is a multi-task, multilingual archive of 14K verdicts from the Italian Constitutional Court (a non-common-law system). The documents address fundamental rights, use technical jargon, are diachronic and long. COMMA covers 4 languages and 4 tasks: multi-granular abstractive summarization, decision generation, article retrieval, and ruling classification.",
    "results": "Benchmarking a catalog of language models in few-shot and full settings reveals substantial headroom for improvement across all four tasks. The dataset and best-performing models are released openly.",
    "sections": [
      {
        "id": "court-to-benchmark",
        "title": "A benchmark built from the work of a constitutional court",
        "body": "A constitutional ruling brings together a factual account, legal reasoning, a final determination, and expert summaries. Each serves a different purpose. COMMA preserves those distinctions in 14,000 rulings from the Constitutional Court of the Italian Republic, covering 1956 to April 2022. COMMA organizes this material into a **structured research resource** for evaluating legal-language tasks.\n\n{{visual:Figure 1}}\n\nThe writing pipeline connects the Court's procedures to the resulting document: epigraph, body, decision, and accompanying maxims. The body distinguishes facts from legal reasoning where the source permits that separation. Maxims summarize key legal points and supply titles and optional constitutional references. These components make several supervised tasks possible without treating every output as an interchangeable summary.\n\nCOMMA also brings Italian constitutional material into a multilingual evaluation setting. Its English, Spanish, and French versions translate the same Italian archive; all cases come from one jurisdiction.\n\n{{visual:Table 1}}\n\nThe comparison situates COMMA among existing civil-law and multilingual legal resources. COMMA combines three summarization tasks, decision generation, retrieval, and two classification tasks within one newly assembled dataset."
      },
      {
        "id": "length-and-sampling",
        "title": "Long documents, informative targets, unequal classes",
        "body": "The archive is filtered for supervised learning. Starting from 21,429 merged records, the pipeline removes missing maxims, length and compression outliers, and near-duplicates. The resulting split contains 12,600 training rulings, 700 validation rulings, and 700 test rulings. Sampling is stratified by ruling type and length, with cases distributed across splits independently of chronology.\n\n{{visual:Table 2}}\n\nThe statistics separate document length from summarization difficulty. English rulings average 3,418.5 words, while concatenated maxim texts average 482.5 and maxim titles 125.2. Narrative targets are therefore substantial texts. High source coverage measures shared vocabulary between the ruling and the expert's synthesis, while density describes how that overlap forms fragments and compression captures relative length. These are source–target statistics; model accuracy requires separate evaluation.\n\n{{visual:Figure 2}}\n\nThe distributions expose variation hidden by those averages: ruling types, document lengths, years, and judgment categories are not interchangeable populations. Judgments outnumber orders, and some judgment types are rare. Classification evaluation retains only types represented in every split, reducing the ten-type source taxonomy to six evaluated classes. **Macro-F1** is consequently important alongside micro-F1: strong aggregate performance can conceal errors on less common classes."
      },
      {
        "id": "structured-knowledge",
        "title": "Article retrieval needs more than an article number",
        "body": "COMMA's retrieval task asks for constitutional parameters from the epigraph and factual account, down to the paragraph, or comma, level. The companion Constitution dataset preserves both paragraph text and its place in a hierarchy, defining the search space for retrieval.\n\n{{visual:Figure 3}}\n\nThe dictionary-like representation separates article and paragraph content from parts, titles, and sections. This supports indexing precise provisions while retaining broader legal context. The resource covers the Constitution's 139 article numbers and reflects the February 2022 revision; historical rulings are paired with that fixed snapshot.\n\n{{visual:Figure 4}}\n\nThe access examples distinguish loading the ruling corpus from loading the Constitution resource through HuggingFace Datasets. Decision generation uses the epigraph, facts, and text of the **gold constitutional parameters**, while withholding the Court's legal reasoning. Its scores measure generation with the correct provisions supplied; retrieval is evaluated separately."
      },
      {
        "id": "translation-evidence",
        "title": "Translation quality is measured indirectly",
        "body": "The translated rulings expand access, but introduce another source of uncertainty. The study compares Google Translate, GPT-3.5-turbo, and NLLB using **round-trip translation**: Italian text is translated outward and then back into Italian. ROUGE measures lexical overlap with the original; an Italian cross-encoder supplies semantic similarity. Legal correctness of the intermediate translation remains outside these automatic measures.\n\n{{visual:Table 3}}\n\nGoogle Translate leads the full-text averages, with ROUGE-1 of 83.69 and semantic similarity of 57.75, compared with 79.75 and 52.20 for ChatGPT. NLLB scores 60.85 and 55.07. NLLB is closer on semantic similarity than on lexical overlap. This comparison of the tested systems motivates the dataset's translation choice.\n\n{{visual:Figure 5}}\n\nThe section-level histograms show why a document-wide average is incomplete. Epigraphs and decisions concentrate at higher ROUGE-1 values than maxim titles; body and maxim distributions also vary. The titles used as short summarization targets are thus not automatically the easiest material to preserve across languages.\n\n{{visual:Table 4}}\n\nThe decision from ruling 106/1983 makes the risk concrete. NLLB renders the Italian public-security consolidated text as the “Single European Act on public security,” changing the legal reference. Legal-T5 also distorts wording and a place name. This individual example shows how a legal-reference error can survive aggregate similarity scoring; its frequency across the archive remains unmeasured."
      },
      {
        "id": "baselines-and-metrics",
        "title": "More context helps, but the task determines the score",
        "body": "The experiments use resource-constrained multilingual baselines on a single 24GB GPU. Standard mBart accepts 1,024 input tokens; adding local, sparse, and global attention extends mBart-Lsg to 4,096. Classification also uses XLM-RoBERTa-Lsg, while retrieval compares an encoder-based model with a contrastive Matrix model. Models are trained for four epochs and selected on validation performance.\n\n{{visual:Table 5}}\n\nThe main table reports separate results for each task and language. For English ruling-to-narrative summarization, mBart-Lsg raises the aggregated ROUGE-derived R score from 36.97 to 45.70 and BERTScore from 15.43 to 30.29. Yet BARTScore **faithfulness** moves from −5.37 to −5.93, where higher is better. Overlap and semantic matching improve here while the source-consistency score declines.\n\nClassification and retrieval tell different stories. English XLM-R-Lsg reaches 100.0 micro- and macro-F1 for ruling type, but article-retrieval accuracy is 28.50. Its retrieval NDCG is 67.36 because that metric also rewards constitutional proximity, not only exact identification. Decision generation obtains an English R score of 72.79 with mBart-Lsg, but uses gold provision text. Each score measures its defined task: document classification, provision retrieval, or reference matching in generation."
      },
      {
        "id": "output-ceiling",
        "title": "A shared decoding ceiling limits both models",
        "body": "The long-context advantage is strongest when the source is the full ruling. Turning already condensed maxim texts into titles changes the problem: much of the selection work is already embodied in the gold input. This helps explain why maxim-to-title generation is easier than producing titles directly from the ruling.\n\n{{visual:Table 12}}\n\nThe appendix's length settings qualify the long-summary results. Both mBart variants have a **512-token maximum output length**, despite their different input capacities. Table 5 reports English narrative outputs averaging 388.5 tokens for mBart and 412.4 for mBart-Lsg; the paper describes narrative references averaging 624 tokens across languages. The decoding ceiling constrains summary length in both models. These subword-token counts use a different unit from the word counts in Table 2."
      },
      {
        "id": "low-resource-learning",
        "title": "Learning curves vary by task and sample size",
        "body": "The low-resource experiment trains on the first 10, 100, or 1,000 training instances, alongside zero-shot and full-data settings. Here, “few-shot” refers to limited supervised training.\n\n{{visual:Figure 6}}\n\nThe four panels separate the generative tasks; solid lines show mBart and dashed lines mBart-Lsg. Full-ruling narrative summarization benefits visibly from longer context, while decision-generation curves approach their full-data scores earlier. Individual curves also dip or cross at small sample sizes. The benefit of more data and longer context varies by task and sample size. These curves track the R score; factual reliability requires its own evaluation."
      },
      {
        "id": "human-reliability",
        "title": "Experts find faithfulness errors despite strong automatic scores",
        "body": "Three legal experts evaluate mBart-Lsg outputs for 20 test rulings across four generative tasks and four languages. Each evaluator assesses 320 examples on three-point scales for recall, precision, and faithfulness. The assessment covers this selected subset of test predictions.\n\n{{visual:Figure 7}}\n\nThe grouped bars make the metric mismatch visible. Decision generation, despite its strong automatic scores, receives low faithfulness ratings. Reproducing much of a reference's wording can coexist with a consequential factual error. The reported inter-evaluator Kendall coefficient is 0.18, indicating substantial disagreement and uncertainty in small differences between language bars.\n\nFor legal use, that distinction is central. Classifying document form, retrieving the right provision, and generating a faithful determination require separate validation. The expert findings make faithful generation a particular concern."
      },
      {
        "id": "historical-scope",
        "title": "A historical archive needs historical legal context",
        "body": "The archive spans decades, but the linked constitutional text is a February 2022 snapshot. This creates a concrete boundary for interpreting retrieval and generation: an article cited by an older ruling may have since changed or been repealed.\n\n{{visual:Table 7}}\n\nThe amendment table pairs affected articles with amendment years and records occurrences before those changes. Repeated entries for Article 117 illustrate that an article number alone does not identify a timeless text. A time-aware knowledge base remains proposed future work.\n\nCOMMA supports research on one court's structured legal language, with multilingual access through translation and evaluation on fixed splits. Practical reuse requires checking imperfect source metadata and handling the possible personal information that the paper acknowledges in public rulings. Legal deployment would also require task-specific reliability validation."
      }
    ],
    "links": {
      "read": "https://link.springer.com/article/10.1007/s10506-026-09520-x",
      "doi": "https://doi.org/10.1007/s10506-026-09520-x",
      "code": "https://github.com/disi-unibo-nlp/comma"
    },
    "visualSelection": {
      "main": [
        "Figure 1",
        "Table 1",
        "Table 2",
        "Figure 2",
        "Figure 3",
        "Figure 4",
        "Table 3",
        "Figure 5",
        "Table 4",
        "Table 5",
        "Figure 6",
        "Figure 7"
      ],
      "appendix": [
        "Table 12",
        "Table 7"
      ]
    }
  },
  {
    "id": "nesy-survey",
    "title": "Neuro-Symbolic Artificial Intelligence: A Task-Directed Survey in the Black-Box Models Era",
    "authors": "Giovanni Pio Delvecchio, Lorenzo Molfetta, Gianluca Moro",
    "venue": "IJCAI",
    "year": 2025,
    "type": "conference",
    "selected": true,
    "role": "cofirst",
    "tags": [
      "Neuro-symbolic",
      "Survey",
      "Explainability"
    ],
    "tldr": "A task-directed survey of neuro-symbolic AI in the era of black-box models, covering explainability and reasoning.",
    "abstract": "The integration of symbolic computing with neural networks has intrigued researchers since the first theorizations of Artificial intelligence (AI). The ability of Neuro-Symbolic (NeSy) methods to infer or exploit behavioral schema has been widely considered as one of the possible proxies for human-level intelligence. However, the limited semantic generalizability and the challenges in declining complex domains with pre-defined patterns and rules hinder their practical implementation in real-world scenarios. The unprecedented results achieved by connectionist systems since the last AI breakthrough in 2017 have raised questions about the competitiveness of NeSy solutions, with particular emphasis on the Natural Language Processing and Computer Vision fields. This survey examines task-specific advancements in the NeSy domain to explore how incorporating symbolic systems can enhance explainability and reasoning capabilities. Our findings are meant to serve as a resource for researchers exploring explainable NeSy methodologies for real-life tasks and applications. Reproducibility details and in-depth comments on each surveyed research work are made available at https://github.com/disi-unibo-nlp/task-oriented-neuro-symbolic.git.",
    "abstractSource": "https://arxiv.org/abs/2603.03177",
    "sections": [
      {
        "id": "define-the-symbolic-contribution",
        "title": "Start with what the symbolic component actually does",
        "body": "Neuro-symbolic AI is often invoked as a route to explainability, **reasoning**, and **data efficiency**. This survey asks a more operational question: for a given task, what does an **explicit symbolic component** contribute, and how does the resulting system compare with a black-box alternative? Its definition requires neural networks combined with identifiable symbolic machinery, such as logical rules, solvers, or state–action schemas.\n\nThe authors distinguish rules that constrain a prediction from explanations reconstructed afterward. Their definition centers on the symbolic machinery involved in producing the result.\n\n{{visual:Figure 1}}\n\nThe inner ring shows the selection process; the outer ring shows the distribution across venues. A DBLP-based search covering 2017–2024 produced 172 papers; the chart identifies 92 surveyed works after excluding black-box, purely logical, and short-paper groups. **The sample is scoped by the chosen venues, keywords, dates, and definition.**"
      },
      {
        "id": "navigate-from-the-task",
        "title": "A taxonomy that can be entered from the application",
        "body": "Architecture-first classifications can make neighboring methods look unrelated when they use different networks, or deceptively similar when they share a formalism but solve different problems. The survey instead organizes the field around three operations: extracting rules from data, enforcing supplied rules, and synthesizing executable programs.\n\n{{visual:Figure 2}}\n\nStart at a task—such as relation extraction, claim verification, or visual question answering—and trace upward to the applicable techniques and macro-category. Then reverse direction to see where a familiar formalism might transfer. The repeated appearance of deterministic finite automata is instructive: learning an automaton from behavioral traces and using one to shape an agent's behavior are different uses of the same representational tool.\n\nBenchmark labels connect the map to evaluation practice. Blank entries mark areas where prompt-dependent evaluation, custom reinforcement-learning tasks, or limited causal-estimation datasets prevent reliable common comparisons."
      },
      {
        "id": "formal-languages-are-design-choices",
        "title": "The intermediate language determines the kind of control",
        "body": "A symbolic layer is useful only insofar as its language can express the distinctions the task requires. Horn clauses capture implication-like relations; natural logic manipulates entailment relations between linguistic expressions; finite automata represent state transitions. First-order and probabilistic logic support explicit constraints and uncertainty, while grammars and semantic parsing enable structured programs.\n\n{{visual:Figure 3}}\n\nThe examples express simple statements as predicate implications, probabilistic rules, transition graphs, and grammar productions. Each representation determines what the system can check, compose, learn, and potentially explain.\n\nThe reviewed applications expose the cost of each choice. Rule-mining systems can recover relational patterns but face search and expressivity limits. Enforcement can guide attention, regularize outputs, or shield unsafe actions, yet depends on the adequacy of the supplied constraints. Program synthesis offers executable structure, but a correct solver cannot repair an incorrectly parsed problem. **Correctness also depends on the perception and translation stages that produce the intermediate representation.**"
      },
      {
        "id": "compare-without-flattening",
        "title": "Performance varies by task and evaluation protocol",
        "body": "The survey compares published results by task and benchmark. Training data, model scale, and evaluation protocols vary across the underlying studies.\n\n{{visual:Table 1}}\n\nInspect the benchmark and metric before the sign of the reported delta. The table lists JMLR at 77.9% accuracy on DWIE with a reported +10.8% delta over DocRE-CLiP, while QA-NatVer is listed at 70.3% on FEVER development data with a −20.0% delta against SFAVEL. Other rows use macro-F1 or BLEU rather than accuracy. Each comparison applies to its own benchmark and metric.\n\nThe LECTER row needs an additional qualification: its reported +6.5% comparison uses *2-best accuracy* for LECTER, whereas the discussion identifies standard accuracy for the GPT-3.5 comparison. That mismatch prevents a like-for-like superiority claim. Elsewhere, the authors flag inconsistent baseline results on WN18RR and the sensitivity of negative-sampling procedures. These protocol differences limit the strength of the reported comparisons."
      },
      {
        "id": "where-structure-earns-its-cost",
        "title": "Use structure where its guarantees or constraints are needed",
        "body": "Across the reviewed work, neuro-symbolic methods are most compelling when explicit structure is part of the requirement: enforcing permitted actions, exposing a proof-like chain, incorporating domain constraints, or making sequential dependencies inspectable. In open-domain settings, the survey finds that black-box models often benefit more directly from large unstructured datasets. Even within one family, the balance changes with supervision: the discussion of dialogue-structure induction notes that a simpler neural baseline can overtake a constrained approach as labeled data increases.\n\nThis suggests a practical reading of the taxonomy. First specify the behavior that must be represented or constrained; then select a formalism capable of expressing it; finally evaluate against a strong task-matched neural alternative. Evaluation needs to cover symbolic clarity, predictive quality, and robustness together. The paper proposes research on complex linguistic structures, safety-oriented reinforcement learning, and rule mining over modern neural features; high-stakes deployment remains future work.\n\n*Source: the nine-page arXiv v1 dated 3 March 2026, which identifies a separate definitive IJCAI 2025 article. It contains Figures 1–3 and Table 1 and has no appendix. The literature window is 2017–2024.*"
      }
    ],
    "links": {
      "arxiv": "https://arxiv.org/abs/2603.03177",
      "code": "https://github.com/disi-unibo-nlp/task-oriented-neuro-symbolic",
      "read": "https://www.ijcai.org/proceedings/2025/1157",
      "doi": "https://doi.org/10.24963/ijcai.2025/1157",
      "pdf": "https://www.ijcai.org/proceedings/2025/1157.pdf"
    },
    "visualSelection": {
      "main": [
        "Figure 1",
        "Figure 2",
        "Figure 3",
        "Table 1"
      ],
      "appendix": []
    }
  },
  {
    "id": "mixture-of-masters",
    "title": "Mixture of Masters: Sparse Chess Language Models with Player Routing",
    "authors": "Giacomo Frisoni, Lorenzo Molfetta, Davide Freddi, Gianluca Moro",
    "venue": "arXiv preprint",
    "year": 2026,
    "type": "preprint",
    "role": "cofirst",
    "tags": [
      "Mixture of experts",
      "Chess",
      "Language models"
    ],
    "tldr": "A sparse mixture-of-experts chess language model where each expert channels a grandmaster's style, routed per move.",
    "abstract": "Modern chess language models are dense transformers trained on millions of games played by thousands of high-rated individuals. However, these monolithic networks tend to collapse into mode-averaged behavior, where stylistic boundaries are blurred, and rare but effective strategies are suppressed. To counteract homogenization, we introduce Mixture-of-Masters (MoM), the first chess mixture-of-experts model with small-sized GPT experts emulating world-class grandmasters. For each move, a post-hoc learnable gating network selects the most appropriate persona to channel depending on the game state, allowing MoM to switch its style dynamically, e.g., Tal's offensive vocation or Petrosian's defensive solidity. When evaluated against Stockfish on unseen standard games, MoM outperforms both dense individual expert networks and popular GPT baselines trained on aggregated data, while ensuring generation variety, control, and interpretability.",
    "abstractSource": "https://arxiv.org/abs/2602.04447",
    "sections": [
      {
        "id": "compose-player-specialists",
        "title": "Can a chess language model preserve several ways of playing?",
        "body": "Mixture of Masters (MOM) studies chess as autoregressive language modeling: a transformer reads a game in PGN notation and predicts the next move without explicit tree search. It trains separate **player-specific branches** and learns how to combine them, with pooled grandmaster fine-tuning as a baseline. The central question is whether coherent behavioral specialization is more useful than generic diversity between experts.\n\n{{visual:Figure 1}}\n\nFollow the branch–train–stitch sequence. Each expert begins from a shared chess-language-model seed, then learns from one grandmaster's moves; the loss excludes the opponent's tokens. The stitched model routes learned linear transformations in attention and feed-forward modules while sharing other parameters through uniform averaging. This is finer-grained than selecting one complete grandmaster model for an entire game.\n\nDuring router training, Gumbel-Softmax relaxation and a load-balancing objective support differentiable, noncollapsed expert selection. At inference, only the top-k branches contribute at each routed module. **Player identity determines each expert's training data.** The router learns when to use each branch without direct supervision linking positions to player styles."
      },
      {
        "id": "data-and-seed-determine-the-experts",
        "title": "Specialization depends on both the seed and the player corpus",
        "body": "The experiments train experts for ten contemporary grandmasters, then stitch five selected for their joint playing strength and **native legality**: Carlsen, Giri, Nakamura, Nepomniachtchi, and So. The training collections combine PGNMentor, Chess.com, and Lichess records, with filtering, deduplication, color balancing, and an 80:20 split stratified by color and outcome.\n\n{{visual:Table 3}}\n\nThe Appendix C table shows the unequal training collections behind the personas. Collections range from 1,208 games for Vachier-Lagrave to 11,052 for Nepomniachtchi and span 1984–2025. Inspect game volume alongside rating and length rather than attributing every downstream difference to style alone. The curation also appends a shortest forced-mate continuation when Stockfish finds one within the specified horizon, so the training material includes engine-generated continuations.\n\n{{visual:Figure 2}}\n\nThe seed comparison asks which pretrained representation can be specialized effectively. Across the tested experts, the Karvonen seed provides a stronger foundation than the rating-restricted Transcendence seeds and is adopted for MOM. The authors attribute this result to greater representational flexibility, a proposed explanation that the experiment leaves causally unresolved.\n\n{{visual:Table 1}}\n\nCompare the seed with each independently trained expert under the same Stockfish level-0 protocol. The table reports seed FIDEScore 54.1% and expert scores from 57.8% to 65.6%, alongside win and draw rates and their variability. These results measure the gains from player-specific fine-tuning within this model family; human grandmaster strength is outside the comparison."
      },
      {
        "id": "separate-legality-from-strength",
        "title": "A legal move and a strong move are different achievements",
        "body": "The evaluation deliberately exposes native generation failures. Models use greedy decoding, receive no retry after an illegal move, and forfeit immediately if one occurs. Legality is a game-level metric: the percentage of games completed without an illegal model move. FIDEScore separately awards one point for a win, half for a draw, and zero for a loss.\n\n{{visual:Figure 3}}\n\nRead the legality distributions before the constrained-decoding comparison. Restricting generation to legal moves removes a major failure mode and raises the selected experts' scores substantially. The gain measures playing strength recovered by enforcing legality at inference time; native legality remains a separate property of the network. Main-paper results are unconstrained unless otherwise specified.\n\n{{visual:Table 7}}\n\nThe selected Appendix E ablation separates legality-oriented reinforcement learning from constrained decoding. For MOM, the table reports 69.7 under SSL, 78.1 under SSL plus constrained decoding, 69.1 under SSL plus RL, and 78.7 with both additions. Legality-focused GRPO slightly lowers the unconstrained score, while combining it with constrained decoding gives the highest reported MOM score in this ablation. The experiment uses a single-move reward; long-horizon self-play optimization remains untested."
      },
      {
        "id": "controlled-strength-comparison",
        "title": "Compare composition against matched baselines",
        "body": "The matched baselines test MOM against alternatives using the same model family and data. The baselines include the seed, pooled-GM fine-tuning, dense expert-weight averaging, and sparse models whose experts are trained on random rather than player-aligned partitions. The random-partition controls are particularly important because they test whether meaningful specialization adds value beyond routing capacity alone.\n\n{{visual:Figure 4}}\n\nCompare the bars within each Stockfish difficulty level, then inspect the tournament ratings in the legend. MOM is reported as the highest-scoring model across levels 0–5, with a Glicko-2 estimate of 1,557±12 versus 1,553±12 for expert soup and an average of 1,549±7 for random-partition MOM. The rating estimates are close and their displayed intervals overlap.\n\nThe tournament uses Stockfish 16.1 with a 100,000-node budget per move, balanced colors, and a 90-turn horizon; unfinished games are adjudicated from the final position's centipawn evaluation. The ratings apply within this protocol. Comparisons with Lichess, Chess.com, human tournaments, or other papers would require matched evaluation conditions."
      },
      {
        "id": "measure-specialization-not-just-names",
        "title": "Do the named experts actually behave differently?",
        "body": "Naming branches after grandmasters would be superficial if their predictions and representations remained interchangeable. The paper therefore probes three complementary signals: layer-wise activation separation, likelihood assigned to held-out player moves, and exact move emulation.\n\n{{visual:Figure 5}}\n\nIn panel (a), compare parameter distance with the own-master/other-master activation-displacement ratio. Functional separation becomes particularly visible in upper-middle blocks, around layers 10–14; nearby weights can still produce different responses to player-associated positions. In panel (b), a positive NLL advantage means greater confidence on the target master's games. Opening advantages are generally stronger, while the phase- and color-stratified bars reveal variation and some near-zero or negative cases.\n\nPanel (c) provides a more concrete behavioral check. Own-master emulation generally improves over the seed, but the displayed Vachier-Lagrave row does not exceed the corresponding others' emulation average. The visual shows **measurable but nonuniform specialization**. As the limitations section stresses, these are statistical associations: openings, opponent pools, repeated structures, and historical context can contribute to the signal without constituting a complete causal account of human style."
      },
      {
        "id": "routing-as-a-computational-trace",
        "title": "Routing traces show conditional expert selection",
        "body": "The routing analysis tests whether the stitched system preserves distinctions between its branches. MOM's routing analysis examines both the number of active experts and the probability distribution before top-k selection.\n\n{{visual:Figure 6}}\n\nPanel (a) favors two active experts rather than activating all five. Panel (b) then compares persona-aligned and random-partition models: MOM's top two experts hold at least half the routing mass in 99.9% of recorded passes, and at least 60% in 84.0%. The random controls are markedly less concentrated. Compared with the random controls, MOM concentrates selection on fewer branches. The selected pair can change with the input and module.\n\n{{visual:Figure 7}}\n\nTrace the highlighted top-1 paths across layers for the two board states. Their changes make conditional expert recruitment visible during a game. The visualization shows only the strongest branch of the evaluated model's **top-2** routing. It identifies contributing components; interpreting them as human thought processes or specific attacking and defensive styles would require separate evidence."
      },
      {
        "id": "a-useful-negative-stylometry-result",
        "title": "Independent player identification remains a harder test",
        "body": "The appendix investigates a separate vision-based stylometry model as a post-hoc diagnostic, independent of MOM's training and routing. It encodes sequences of rendered board positions, aggregates spatial and temporal features, and learns game embeddings relative to player centroids. This gives an external test of whether generated games retain signals associated with the target master.\n\n{{visual:Figure 19}}\n\nCompare real-game bars with hatched expert-generated-game bars at the same retrieval depth. The source reports mean P@5 of 0.80 on held-out human games and 0.72 on generated games, while mean human-game P@3 is 0.68. Here P@k measures whether the correct grandmaster appears anywhere among the k nearest candidates; top-1 identification requires first place. The subsampling panel asks a different question: whether a player's estimated centroid stays stable as more generated games are included.\n\nIn this Appendix D experiment, centroids are stable and top-k retrieval is useful, while fine-grained identification remains unreliable. The appendix characterizes these stylometry baselines as falling short of consistently separating the desired signatures, motivating the main paper's activation and likelihood diagnostics."
      },
      {
        "id": "what-the-study-establishes",
        "title": "Behavioral composition in a small grandmaster cohort",
        "body": "MOM's contribution is a small, structured test of how persona-aligned experts can be composed without erasing all their differences. The combination of controlled random-partition baselines, native-legality evaluation, and internal diagnostics is more informative than a strength score alone. The source reports 50,905,088 parameters per grandmaster model and 185,245,696 for the five-expert MOM; the five-expert model therefore has a larger total parameter storage cost despite sparse activation.\n\nThe study covers a small elite cohort with unequal historical corpora under a fixed Stockfish evaluation protocol. Its style analysis measures behavioral associations. The companion survey records practitioners' beliefs about recognizability and style. It provides motivation and context; persona validation and the causal effect of engine use on style remain separate empirical questions. The source withholds the ablative stylometry-model weights to reduce profiling and attribution misuse.\n\n*Source: the 52-page arXiv preprint 2602.04447v2 dated 8 May 2026, including all appendices and the checklist.*"
      }
    ],
    "links": {
      "arxiv": "https://arxiv.org/abs/2602.04447",
      "pdf": "https://arxiv.org/pdf/2602.04447"
    },
    "visualSelection": {
      "main": [
        "Figure 1",
        "Figure 2",
        "Table 1",
        "Figure 3",
        "Figure 4",
        "Figure 5",
        "Figure 6",
        "Figure 7"
      ],
      "appendix": [
        "Table 3",
        "Table 7",
        "Figure 19"
      ]
    }
  },
  {
    "id": "retrieve-rank",
    "title": "Retrieve-and-rank End-to-end Summarization of Biomedical Studies",
    "authors": "Gianluca Moro, Luca Ragazzi, Lorenzo Valgimigli, Lorenzo Molfetta",
    "venue": "SISAP",
    "year": 2023,
    "type": "conference",
    "selected": true,
    "role": "cofirst",
    "tags": [
      "Summarization",
      "Biomedical",
      "Retrieval"
    ],
    "tldr": "RAMSES: an end-to-end retrieve-and-rank model for summarising multiple biomedical studies.",
    "abstract": "An arduous biomedical task involves condensing evidence derived from multiple interrelated studies, given a context as input, to generate reviews or provide answers autonomously. We named this task context-aware multi-document summarization (CA-MDS). Existing state-of-the-art (SOTA) solutions require truncation of the input due to the high memory demands, resulting in the loss of meaningful content. To address this issue effectively, we propose a novel approach called RAMSES, which employs a retrieve-and-rank technique for end-to-end summarization. The model acquires the ability to (i) index each document by modeling its semantic features, (ii) retrieve the most relevant ones, and (iii) generate a summary via token probability marginalization. To facilitate the evaluation, we introduce a new dataset, FAQSUMC19, which includes the synthesizing of multiple supporting papers to answer questions related to Covid-19. Our experimental findings demonstrate that RAMSES achieves notably superior ROUGE scores compared to state-of-the-art methodologies, including the establishment of a new SOTA for the generation of systematic literature reviews using MS2. Quality observation through human evaluation indicates that our model produces more informative responses than previous leading approaches.",
    "abstractSource": "https://cris.unibo.it/handle/11585/962117",
    "method": "RAMSES tackles context-aware multi-document summarization (CA-MDS). It indexes each document by its semantic features, retrieves the most relevant ones, and generates a summary via token-probability marginalization — avoiding the input truncation that hurts SOTA models. We also introduce FAQSUMC19, a Covid-19 multi-paper QA dataset for evaluation.",
    "results": "RAMSES achieves notably higher ROUGE than SOTA methods and sets a new SOTA for systematic-review generation on MS2; human evaluation rates its summaries as more informative than prior leading approaches.",
    "sections": [
      {
        "id": "ramses-question-shapes-summary",
        "title": "The same studies can support different summaries",
        "body": "A useful biomedical summary selects evidence around a specific need. A research background may call for a systematic-review statement; a patient-facing question may require an answer focused on a particular concern. The context determines **which evidence matters** and how it should be combined. RAMSES addresses this setting as *context-aware multi-document summarization*: a context, a cluster of related studies, and one synthesized output.\n\n{{visual:Figure 1}}\n\nThe shared structure is selection followed by synthesis, whether the context is a question or a research issue. Simply concatenating documents can exhaust the model’s input budget before the most relevant material appears. RAMSES instead learns which documents deserve the generator’s attention.\n\nThe results and visuals here follow the author manuscript, *Retrieve-and-Marginalize End-to-End Summarization of Biomedical Studies*. The SISAP chapter was published as *Retrieve-and-Rank End-to-End Summarization of Biomedical Studies*; equivalence with the publisher PDF remains unverified."
      },
      {
        "id": "ramses-retrieval-learns-from-writing",
        "title": "Let the summary teach the retriever what matters",
        "body": "RAMSES uses separate BioBERT encoders for the context and candidate documents. Their representations produce relevance scores, which select the top-k documents. BART then processes each selected document together with the context. It combines their predictions during decoding, keeping the document-conditioned inputs separate.\n\nAt each output position, every selected document contributes a probability distribution over the next token. RAMSES weights these distributions by **retrieval** relevance and marginalizes them into one distribution. The generated summary therefore draws on several document-conditioned predictions.\n\n{{visual:Figure 2}}\n\nThe important training connection runs backward from writing to retrieval. Because relevance scores weight the generator’s token probabilities, the loss for the reference summary also updates the encoders. Training rewards document representations whose contributions help predict the desired summary. This distinguishes RAMSES from an otherwise similar pipeline with a frozen retriever.\n\nOnly selected documents reach the generator, so retrieval can discard relevant facts. Marginalization combines token predictions while leaving disagreements between studies unresolved."
      },
      {
        "id": "ramses-building-evidence-clusters",
        "title": "Building answer-informed evidence clusters",
        "body": "To evaluate question-conditioned synthesis, the authors introduce FAQSUMC19: 514 Covid-19 questions with expert-written WHO answers, each paired with 30 scientific abstracts drawn from CORD-19. The dataset is split into 464 training examples and 50 test examples. Constructing the document clusters is a retrieval problem in its own right.\n\nThe authors compare random selection, BM25, and SUBLIMER using lexical and semantic overlap with the question–answer pair.\n\n{{visual:Table 1}}\n\nSUBLIMER achieves the strongest average overlap under both reported measures and is used to build the supporting clusters. The selection criterion is overlap with the concatenated question and reference answer. Evaluation therefore measures synthesis from answer-informed candidate clusters; biomedical evidence quality and question-only literature search remain separate evaluation problems.\n\nMS2 supplies a complementary task: generate a review statement from a research background and biomedical study abstracts. The dataset statistics show how much material must be compressed in each setting.\n\n{{visual:Table 2}}\n\nMS2 has longer source collections and shorter targets on average; FAQSUMC19 asks for fuller answers from its fixed-size clusters. Both experiments use abstracts as the supporting documents. The reported reading task is limited to those abstracts."
      },
      {
        "id": "ramses-better-overlap-not-clinical-proof",
        "title": "The gains appear in both review writing and question answering",
        "body": "The comparisons cover several approaches to handling multiple documents: sparse attention over concatenated text, Fusion-in-Decoder, **marginalization** with a frozen retriever, and a model pretrained specifically for multi-document summarization. The central question is whether joint retrieval and generation outperform these alternatives under the reported experimental setup.\n\n{{visual:Table 3}}\n\nRAMSES reaches ROUGE-1/2/L scores of 31.83/10.44/22.19 on MS2 and 30.18/7.31/15.67 on FAQSUMC19. Its aggregate R scores are 21.32 and 17.56, respectively. These are the best reported values among the baselines evaluated in the manuscript.\n\nThe magnitude of the advantage differs by metric. On MS2, for example, ROUGE-L is close to PRIMERA’s 22.16, while the gains in other measures are clearer. The gains thus vary across measures. ROUGE quantifies reference overlap; the later human evaluation tests reader preference, while clinical reliability requires separate validation."
      },
      {
        "id": "ramses-evidence-budget",
        "title": "Retrieval depth sets the evidence and memory budget",
        "body": "Retrieval depth k controls how much evidence the generator sees and how much memory training consumes. A larger generator or a larger k might help, but either can spend resources on redundant material. The checkpoint comparison tests generator size and retrieval depth.\n\n{{visual:Table 4}}\n\nBART-large is competitive, while BART-base provides similar performance with fewer parameters and becomes the default generator. The BART-base MS2 training sweep favors k = 9; increasing the document count further does not consistently improve the scores. The authors suggest redundancy and contradiction as possible explanations, without directly isolating either mechanism.\n\nTraining depth need not equal inference depth. The next experiment keeps the selected MS2 checkpoint and changes how many documents it receives at inference; its FAQSUMC19 columns instead vary k during training.\n\n{{visual:Table 5}}\n\nFor MS2, retrieving 12 documents at inference gives the best reported scores. FAQSUMC19 also favors 12 for ROUGE-1 and ROUGE-2, though not ROUGE-L. The preferred budget depends on the pipeline phase and the metric.\n\nThe resource side of that choice is visible in the training-memory measurement.\n\n{{visual:Figure 3}}\n\nMemory grows approximately linearly with k in the tested range. The experiments use a 24 GB RTX 3090, making retrieval depth a direct memory-budget choice within the tested range."
      },
      {
        "id": "ramses-keep-the-question-visible",
        "title": "The generator needs the question too",
        "body": "The ablations ask what each component contributes once the overall method works. Besides freezing document retrieval, the study tests sharing an encoder, changing the similarity function, removing the context–document separator, reversing input order, and withholding the context from the generator.\n\n{{visual:Table 6}}\n\nRemoving the generator’s context causes by far the largest reported decline: aggregate R falls from 21.32 to 15.88. The generator benefits from seeing the question or research background while composing the answer.\n\nFreezing retrieval produces a smaller decline, consistent with a benefit from end-to-end training. Separate encoders and explicit input boundaries also help in this setup. Within this architecture, context has the largest measured effect: relevance shapes synthesis as well as source selection."
      },
      {
        "id": "ramses-experts-see-progress-and-distance",
        "title": "Experts favor RAMSES over LED-GAQ, with a gap to WHO",
        "body": "Three evaluators with medical or biological master’s degrees rank answers for the full FAQSUMC19 test set. Each sees the question and anonymized, randomly ordered answers from WHO, RAMSES, and LED-GAQ. The instructions emphasize how thoroughly the answer addresses the question, primarily considering factuality.\n\n{{visual:Table 7}}\n\nAveraged across evaluators, RAMSES is preferred to LED-GAQ in 76% of comparisons. The automatic-score improvement has a reader-visible counterpart, with complete agreement on that comparison at 46%. RAMSES is preferred to the WHO answer only about 7.3% of the time, leaving a substantial gap to the expert-written targets.\n\nJoint retrieval and generation improve synthesis in this small evaluation with answer-informed evidence clusters. The gap to WHO answers points to substantial remaining work on faithful, complete synthesis. Use for medical advice would require clinical safety validation beyond these preference rankings."
      }
    ],
    "links": {
      "read": "https://link.springer.com/chapter/10.1007/978-3-031-46994-7_6",
      "doi": "https://doi.org/10.1007/978-3-031-46994-7_6"
    },
    "visualSelection": {
      "main": [
        "Figure 1",
        "Figure 2",
        "Table 1",
        "Table 2",
        "Table 3",
        "Table 4",
        "Table 5",
        "Figure 3",
        "Table 6",
        "Table 7"
      ],
      "appendix": []
    }
  },
  {
    "id": "ke-qa",
    "title": "Knowledge-enhanced Neural Models for Question Answering Based on Retrieval",
    "authors": "Lorenzo Molfetta",
    "venue": "MSc thesis",
    "year": 2023,
    "type": "thesis",
    "role": "first",
    "tags": [
      "Question answering",
      "Knowledge graphs",
      "Retrieval"
    ],
    "tldr": "An MSc thesis on explainability and biomedical question answering through context augmentation, passage reranking and structured knowledge.",
    "abstract": "Explainability in AI models has emerged as a paramount concern in various domains, including natural language processing (NLP). Understanding and interpreting AI models' decision-making processes is crucial for ensuring their ethical and trustworthy deployment. This thesis addresses the pressing need to improve explainability in language models, explicitly focusing on knowledge retrieval and integration for question-answering tasks. It delves into the rich landscape of neuro-symbolic and sub-symbolic techniques in reasoning, highlighting their strengths in combining rule-based interpretability with data-driven learning. The study provides a comprehensive overview of research advances in explainable AI. Also, it proposes to adopt a context-augmentation strategy for tackling the question-answering task in the biomedical field. This approach aims at enhancing the performances of retrieval models without intervening directly on its core functioning, namely modifying its parameters, but rather carrying out a reranking of the retrieved passages internally to the inference network. The proposed strategy suggests leveraging external sources more efficiently by integrating structured knowledge into the answer generation. This thesis encourages the usage of systems fostering explainability by showing the theoretical foundations and results of knowledge-enhanced solutions in the question-answering field. By inspiring confidence in users, regulators, and stakeholders, we propel the deployment of AI technologies towards a more transparent and accountable future.",
    "abstractSource": "https://amslaurea.unibo.it/id/eprint/30058/",
    "sections": [
      {
        "id": "beyond-fluent-answers",
        "title": "Using retrieved knowledge inside the reader",
        "body": "A biomedical question-answering system has two different jobs: **finding relevant knowledge** and using it to produce an answer. Each job needs its own evaluation. My MSc thesis, *Knowledge-Enhanced Neural Models for Question Answering based on Retrieval*, investigates that gap through a survey of neural reasoning and a biomedical retrieval architecture. Its central design question is practical: can we improve the use of retrieved documents without continually changing the retriever itself? The eventual answer combines a frozen retriever, a graph of PubMed abstracts, and two stages of passage **reranking** inside a T5-based pipeline. The survey traces the architectural choices behind that pipeline. (Thesis PDF pp. 9, 12, 85–94.)\n\nChapter 1 opens by reviewing the Reversal Curse experiments of Berglund and colleagues. Figure 1.1 concerns models trained on fictional name–description associations; Figure 1.2 tests reversed celebrity-family questions without additional fine-tuning. They expose a difference between reproducing a learned association and accessing it in the opposite direction.\n\n{{visual:Figure 1.1}}\n\n{{visual:Figure 1.2}}\n\nReversing a question can change performance even when the relevant relationship appears simple. These examples motivate the thesis’s investigation of structured support for inference, explainability, and generalization. (PDF pp. 26–30.)\n\nChapter 2 adds a related warning from Anil and colleagues: success at familiar problem lengths need not transfer to longer ones. Figure 2.1 shows parity and Boolean-variable-assignment tasks, with training lengths highlighted.\n\n{{visual:Figure 2.1}}\n\nThis prior work on length generalization motivates attention to how a model represents and processes longer contexts. (PDF pp. 63–64.)"
      },
      {
        "id": "retrieval-as-external-memory",
        "title": "Retrieval moves knowledge outside the weight matrices",
        "body": "The retrieval chapter starts from a separation of responsibilities. An external collection stores documents; a search procedure identifies candidates; a reader conditions its prediction on those candidates. The thesis discusses lexical scoring, vector representations, and approximate nearest-neighbour search as ways of making large collections accessible. Retrieval makes the candidate evidence available for inspection. Assessing reader faithfulness then requires checking the generated answer against those passages. (PDF pp. 30–33.)\n\nBioReader, prior work by Frisoni and colleagues, supplies a biomedical example in Figure 1.3. Its T5-based architecture retrieves PubMed information in chunks and introduces chunked cross-attention into the decoder.\n\n{{visual:Figure 1.3}}\n\nThe important distinction is where external knowledge enters computation. BioReader leaves the encoder unchanged and conditions decoding on retrieved neighbours while maintaining autoregressive generation. This gives the thesis a concrete precedent for separating retrieval from prediction, but its eventual method takes a different route: it ranks whole abstract passages using graph structure before and during encoding. (PDF pp. 32–33, 88–93.)"
      },
      {
        "id": "choosing-graph-computation",
        "title": "What should a graph contribute—and how expensive should it be?",
        "body": "Graphs make relationships explicit, but graph computation still requires choices. Ordinary message passing propagates information through local neighbours; deeper stacks expand the reachable neighbourhood but can blur distinctions between nodes. Chapter 1 contrasts attention-weighted GAT aggregation with the existing ReFactor framework. Figure 1.4 illustrates ReFactor's separate treatment of incoming and outgoing information and its wider interaction mechanism.\n\n{{visual:Figure 1.4}}\n\nAlongside the literature review, I compare existing message-passing approaches in Chapter 1, using DistMult as a lightweight scoring component. (PDF pp. 34–38.)\n\nThose experiments put GAT-Conv, DistMult, and ReFactor into a QA-GNN baseline with five graph layers and 200-dimensional **graph representations**. Table 1.1 characterizes CommonsenseQA and OpenbookQA question lengths; Table 1.2 records decoder parameter counts and variation across configurations.\n\n{{visual:Table 1.1}}\n\n{{visual:Table 1.2}}\n\nThe resource contrast is clear: GAT-Conv has 2.85 million trainable decoder parameters, against 1.24 million for each alternative. ReFactor has the lowest reported accuracy standard deviation, 0.0501. The variation is across configurations; repeated biomedical trials would be needed to estimate run-to-run uncertainty. The datasets also differ in question length, whose effect is not isolated here. (PDF pp. 38–40.)\n\nTable 1.3 gives the actual accuracies for add, max, and mean aggregation; Figure 1.5 reorganizes those values into a radar chart.\n\n{{visual:Table 1.3}}\n\n{{visual:Figure 1.5}}\n\nGAT with add aggregation reaches 0.6841 on CommonsenseQA and 0.4760 on OpenbookQA. ReFactor is more even across settings, while other configurations achieve higher peak accuracy. The relative performance on CommonsenseQA and OpenbookQA also varies by configuration. These comparisons expose a trade-off between peak accuracy and stability across the tested settings.\n\nFigure 1.6 adds the operational cost, showing GPU memory usage for mean aggregation on an RTX 3090 with a batch size of 64.\n\n{{visual:Figure 1.6}}\n\nGAT's more demanding training profile helps explain the later mixed-GNN design: use attention where the retrieved graph is richer, then use ReFactor after pruning has reduced connectivity. These preliminary comparisons motivate the mixed design; its optimality remains untested. (PDF pp. 39–42, 93–94.)"
      },
      {
        "id": "logic-and-learned-representations",
        "title": "Three ways to connect logic with learned representations",
        "body": "The reasoning survey explores more than retrieval. DeepProbLog connects neural predictions to probabilistic logic programs. Its digit-recognition example, Figure 1.7, wraps a neural classifier in a predicate whose outputs form a distribution over digits.\n\n{{visual:Figure 1.7}}\n\nThe bridge is the probability interface: neural perception can contribute to a larger logical computation, and training can propagate through both components. Nearby, the thesis discusses LAMBADA's different approach—backward chaining from a goal through fact checking, rule selection, and subgoal decomposition. Both belong to the thesis’s survey of alternative reasoning architectures. (PDF pp. 42–45.)\n\nLogic Tensor Networks provide another interface, grounding logical expressions in real-valued tensors and fuzzy truth values. Figure 1.8 shows the surveyed use of existing entity embeddings to learn predicates consistent with an ontology.\n\n{{visual:Figure 1.8}}\n\nHere, the ontology constrains how concepts relate in the embedding space. The surveyed example illustrates the resulting learned predicate regions. (PDF pp. 46–48.)\n\nRulE goes further by jointly representing entities, relations, and logical rules. Figure 1.9 illustrates a query answered through activated relation paths.\n\n{{visual:Figure 1.9}}\n\nIts final scoring combines embedding-based evidence with grounded rule scores. The pictured nationality inference depends on the example’s stipulated rule connecting residence and nationality. Across these approaches, explicit structure can constrain or organize learning, but a chosen rule system still determines which deductions are justified. (PDF pp. 48–50.)"
      },
      {
        "id": "reasoning-traces-and-control",
        "title": "Reasoning traces need selection, stopping, and comparison",
        "body": "Chain-of-Thought offers a less formal route: demonstrate intermediate steps in a prompt rather than require every operation to pass through a logic engine. Figure 1.10 contrasts standard few-shot examples with rationale-bearing examples from the surveyed work by Wei and colleagues.\n\n{{visual:Figure 1.10}}\n\nThe change concerns how the model is asked to solve a problem. An intelligible rationale gives readers a trace to inspect; verifying its relationship to the model's internal computation is a separate problem. The survey then asks how to control the construction of these traces. (PDF pp. 50–52.)\n\nSelection-Inference separates choosing contextual statements from deriving a new statement. Figure 1.11 shows the tagged-sentence interface; Figure 1.12 shows the larger cycle with a Halter module.\n\n{{visual:Figure 1.11}}\n\n{{visual:Figure 1.12}}\n\nTags constrain selection to supplied statements, while the Halter checks whether enough information is available to answer. This makes selection and stopping explicit design decisions, including the possibility of returning unknown. The factual validity of subsequent generated inferences still requires checking. (PDF pp. 52–54.)\n\nSelf-Consistency addresses a different failure mode: dependence on a single sampled rationale. Figure 1.13 contrasts one reasoning path with multiple paths whose answers are aggregated.\n\n{{visual:Figure 1.13}}\n\nThe method samples alternatives and selects an answer through voting or marginalization. Agreement supplies a selection signal whose factual correctness requires separate assessment. All three techniques belong to the background review, outside the biomedical experiments. (PDF pp. 53–56.)"
      },
      {
        "id": "graphs-and-trees-of-thought",
        "title": "From a chain to a structured reasoning space",
        "body": "The specific Graph-of-Thought architecture reviewed in the thesis combines text, extracted graph structure, and potentially images. Figure 1.14 shows feature fusion before rationale or answer generation.\n\n{{visual:Figure 1.14}}\n\nIts graph is constructed from textual triplets and coreference resolution, then encoded alongside other modalities. The graph re-expresses the input evidence, inheriting its factual limitations. (PDF pp. 56–58.)\n\nTree-of-Thought instead organizes candidate intermediate states into a search problem. Figure 1.15 compares direct generation, a single chain, multiple sampled chains, and tree search; Figure 1.16 gives the creative-writing example discussed in the source.\n\n{{visual:Figure 1.15}}\n\n{{visual:Figure 1.16}}\n\nIn the writing example, text fragments become search units and alternative plans are evaluated for coherence. Thought granularity, state evaluation, and breadth- or depth-first traversal become explicit choices. These surveyed methods organize generated reasoning states. The thesis’s PubMed graph instead connects source documents for reranking. (PDF pp. 58–61, 87–91.)"
      },
      {
        "id": "knowledge-inside-the-reader",
        "title": "Where should external knowledge enter the reader?",
        "body": "Chapter 2 turns the broad reasoning survey into architectural choices. QA-GNN, the existing baseline used in the earlier message-passing experiments, jointly represents question–answer context and a relevant ConceptNet subgraph. Figure 2.2 shows the architecture, while Table 2.1 identifies the relevance, node-type, edge-type, and message representations used by its graph layers.\n\n{{visual:Figure 2.2}}\n\n{{visual:Table 2.1}}\n\nA context node connects the linguistic input to graph entities, and relevance scores help distinguish useful neighbours from incidental ones. The table makes clear that graph topology alone is insufficient: the model also needs typed relations and a question-conditioned notion of relevance. (PDF pp. 65–68.)\n\nEMAT chooses another insertion point. In Figure 2.3, question–answer encodings reside in key–value memory, with retrieval initiated from early Transformer representations and the results injected deeper in the encoder.\n\n{{visual:Figure 2.3}}\n\nThe useful precedent is representation reuse: intermediate states can support another computation instead of being discarded. The thesis later applies representation reuse to intermediate reranking; EMAT's question–answer memory remains a surveyed precedent. (PDF pp. 68–69, 93.)\n\nOREOLM makes knowledge interaction iterative through layers that guide contextualized walks over a graph. Figure 2.4 contrasts this differentiable interaction with a semantic-parser-based knowledge-base query.\n\n{{visual:Figure 2.4}}\n\nKnowledge is repeatedly aligned with the current language representation, rather than fetched once as an immutable block. The surrounding discussion of Onto-GPT, adapters, and semantic-role enrichment adds other ways to construct or integrate structured knowledge. These design families complete the survey of alternative knowledge-integration methods. (PDF pp. 69–73.)"
      },
      {
        "id": "relations-and-multi-hop-clues",
        "title": "Relationships matter at several levels of granularity",
        "body": "Knowledge-enhanced natural-language inference provides a focused example of combining semantic similarity with relational information. Figure 2.5 presents KGNLI, which predicts entailment, contradiction, or neutrality from a premise and hypothesis using both text and graph representations.\n\n{{visual:Figure 2.5}}\n\nThe surveyed architecture models connections between subject, predicate, and object pairs. It represents relationships that a text-only comparison might miss. Tables 2.2 and 2.3 give complementary evidence: a model comparison on SNLI and a component ablation on SciTail.\n\n{{visual:Table 2.2}}\n\n{{visual:Table 2.3}}\n\nKGNLI's reported SNLI accuracy is 88.9, compared with 87.5 for LSTM plus attention and 83.5 for BiMPM. On SciTail, retaining subjects, predicates, and objects reaches 84.3, above the partial-component configurations shown. These prior-work results favor KGNLI and its full-component configuration in the respective benchmark comparisons. (PDF pp. 73–76.)\n\nMulti-hop QA adds another difficulty: useful clues may live in separate paragraphs. Figure 2.6 shows KIFGraph's extraction, reasoning, and prediction pipeline.\n\n{{visual:Figure 2.6}}\n\nQuestion, paragraph, sentence, and entity clues form a hierarchy, with direct clues updated before indirect ones and masked attention suppressing noise. This contrasts with the thesis's later document-centred choice: retaining abstract-level context avoids reducing every biomedical question to isolated entity links, while still allowing relationships between documents to influence selection. (PDF pp. 76–78, 92–94.)"
      },
      {
        "id": "memory-and-document-links",
        "title": "Context can be retrieved, remembered, or learned across documents",
        "body": "The Scratchpad mechanism reviewed in Chapter 2 lets a recurrent decoder modify encoder states as a form of memory. Figure 2.7 illustrates the recurrent updates.\n\n{{visual:Figure 2.7}}\n\nThis is an internal-state mechanism, distinct from using generated text as a visible scratchpad. The next part of the survey considers explicit intermediate tokens and contrasts post-context reasoning with notes produced while reading. Figure 2.8 shows Self-Notes' interleaving mechanism.\n\n{{visual:Figure 2.8}}\n\nSpecial start and end tokens let the model insert a note and then resume the input. The timing matters: intermediate information can influence processing before the entire context has been consumed. Figure 2.9 compares baseline, scratchpad, and Self-Notes behaviour across ToyStory, algorithmic, Boolean, and chess-piece tasks.\n\n{{visual:Figure 2.9}}\n\nThese prior-work examples evaluate Self-Notes on the illustrated tasks; its ability to address the Reversal Curse more broadly remains unestablished. The chapter also discusses the training burden of obtaining intermediate supervision and managing longer note-enriched contexts. (PDF pp. 78–83.)\n\nLinkBERT changes pretraining rather than the timing of notes. Figure 2.10 shows document pairs constructed using within-document context, random sampling, and links between documents.\n\n{{visual:Figure 2.10}}\n\nCombining masked-language modelling with document-relationship prediction encourages cross-document representations. This completes the conceptual path toward the thesis method: external passages need not be treated as independent search hits. Their connections can help determine which evidence reaches the answer generator. (PDF pp. 82–84, 93.)"
      },
      {
        "id": "pubmed-graph-and-two-stage-reader",
        "title": "The thesis method: a PubMed graph and a two-stage reader",
        "body": "Chapter 3 moves from surveyed algorithms to the thesis's biomedical application. Its starting point is existing KG-FiD, which already combines Fusion-in-Decoder with two-stage graph-based passage reranking. My contribution is the PubMed-oriented construction and adaptation, including different graph networks for the two stages. (PDF pp. 85–94.)\n\nThe first step is to expose structure that an abstract-only pipeline would ignore. Figure 3.1 shows the parsing categories: abstract, journal, authors, chemical terms, and MeSH information.\n\n{{visual:Figure 3.1}}\n\nAbstracts become document nodes, linked by shared metadata with relation classes. The chapter additionally describes biomedical named-entity processing, directed subject–object links, and mapping through UMLS and DDB. These relationships encode metadata associations, such as co-authorship or shared chemicals; entailment between scientific claims requires separate evidence. The graph-building discussion covers the 2022 PubMed repository, while the reported experiments use a 150K sample. (PDF pp. 86–87, 100.)\n\nFigure 3.2 brings retrieval, graph processing, and generation together. A frozen BGE encoder and FAISS similarity search retrieve candidate abstracts; a GAT reranker selects a smaller set before T5 encoding; a ReFactor reranker prunes again using intermediate reader representations.\n\n{{visual:Figure 3.2}}\n\nThe two stages answer progressively more contextual questions. Stage one starts from precomputed passage vectors and scores graph-updated documents against the query vector. Stage two starts from the first-token representations of question–passage pairs inside the reader. The selected passages continue through the remaining encoder layers and are fused for decoding. Keeping retrieval fixed means these learned reranking operations do not require changing the searchable embedding space.\n\nThe mixed-GNN choice follows the earlier connectivity argument: GAT handles the initial retrieved neighbourhood, while ReFactor is intended to remain useful after pruning makes that neighbourhood sparser. Training combines answer-generation loss with two reranking losses. MedMCQA provides no gold passage-relevance labels, so the thesis derives surrogate targets from similarity between the correct answer and retrieved documents. This answer-conditioned similarity supplies proxy relevance labels; expert-verified support labels are unavailable. (PDF pp. 88–94.)"
      },
      {
        "id": "what-the-dataset-measures",
        "title": "The dataset defines the limits of the experiment",
        "body": "MedMCQA supplies questions, answer choices, explanations, and subject metadata. The thesis retains single-choice instances: 120,765 examples, reported as 66.1% of the original training split. Because the official test split lacks labels, the original validation split becomes the experimental test set, and 20% of training data is reserved for validation. (PDF p. 94.)\n\nTable 3.1 records question and answer token lengths by correct-option label; Figure 3.3 shows subject coverage.\n\n{{visual:Table 3.1}}\n\n{{visual:Figure 3.3}}\n\nAnswers are short—roughly six to seven tokens on average in the listed groups—while questions span multiple medical subjects. The later metrics measure token matching on these short answers across subjects; clinical competence requires a different evaluation.\n\nFigures 3.4 and 3.5 examine two potential shortcuts: correct-option frequency and question length by answer label.\n\n{{visual:Figure 3.4}}\n\n{{visual:Figure 3.5}}\n\nThe frequencies are uneven: option A accounts for 31.47% of training examples and D for 17.74%. The thesis accepts this distribution without extra preprocessing. These descriptive plots leave dataset bias and the causal role of character-length shortcuts untested. (PDF pp. 94–96.)\n\nFigure 3.6 shows the fields of an individual record, including its explanation and topic.\n\n{{visual:Figure 3.6}}\n\nThe example illustrates the record structure but contains a mismatch: its question asks for an investigation, while its options and explanation concern disease causes. It is unsuitable as clinical guidance. The thesis trains and evaluates answer generation using the question–answer fields; explanation generation remains outside the experiment. (PDF pp. 94–97.)"
      },
      {
        "id": "experimental-contract",
        "title": "Short-answer generation on one GPU",
        "body": "The evaluation casts multiple-choice QA as answer-text generation. Chapter 4 reports Match Acc and Match F1-Macro based on predicted tokens and their order relative to the reference answer. A Match Acc near 95 describes this token-matching measure, not 95% standard MedMCQA answer-choice accuracy. Carburacy supplies a carbon-aware performance measure alongside them. (PDF pp. 99, 105.)\n\nTable 4.1 specifies the small-model configuration.\n\n{{visual:Table 4.1}}\n\nThe reader is t5-small with six encoder layers, and the frozen retrieval encoder is BAAI/bge-base-en-v1.5. The passage pipeline narrows from 20 retrieved documents to 12 after the first reranker and five after the second. Training uses one epoch, batch size two, seed 42, and a 0.2 reranking-loss weight. Runs use a 24GB RTX 3090, with Weights & Biases tracking and CodeCarbon monitoring. The results cover this single-seed experimental setting; repeated-seed uncertainty and clinical validity remain unmeasured. (PDF pp. 99–105.)"
      },
      {
        "id": "what-the-ablations-show",
        "title": "Reranking helps modestly; replacing reader states hurts substantially",
        "body": "One ablation asks whether graph representations should only select passages or also replace the representations passed to later T5 layers. Table 4.2 compares that choice across prompt and '/w Answer' settings. The rows vary the representations passed onward, despite the caption’s reference to reranking position.\n\n{{visual:Table 4.2}}\n\nWith neither prompt nor appended answer, feeding GNN encodings onward gives 88.67 Match Acc and 82.81 Match F1-Macro, versus 95.42 and 92.76 when the reader's own selected encodings continue. The same broad gap appears across the other settings. The thesis interprets this as disruption of pretrained inter-layer representations under short fine-tuning. Direct GNN-state reuse improves training and total Carburacy, but lowers test Carburacy and substantially reduces **matching quality**. (PDF pp. 101–102.)\n\nTable 4.3 then compares reranking against no reranking, with the second reranker placed at encoder position three.\n\n{{visual:Table 4.3}}\n\nReranking improves both matching measures in every corresponding input configuration shown. With prompt and '/w Answer' enabled, the reported values are 95.43 Match Acc and 92.77 Match F1-Macro, compared with 95.17 and 92.36 without reranking. The numerical gains are modest, with statistical significance untested. The source describes '/w Answer' as appending answers to questions without clearly documenting here whether that means answer choices or the gold answer. This ambiguity limits interpretation of the answer-appended settings. (PDF pp. 101–103.)\n\nTable 4.4 is essential to interpreting both quality and cost: its baseline retrieves five passages, while the reranking system initially retrieves 20.\n\n{{visual:Table 4.4}}\n\nThus the comparison changes the **candidate budget** as well as adding reranking. Parameter counts rise from 83.6M to 89.4M, and average Carburacy falls from 0.467 to 0.399. Carburacy combines performance and carbon cost into a score. The result applies to the combined wider-search-and-rerank configuration; the effect of reranking at a fixed candidate budget remains untested. (PDF p. 103.)"
      },
      {
        "id": "when-to-prune",
        "title": "When to prune is a quality–cost decision",
        "body": "A final ablation varies the position of the intermediate reranker while keeping the overall architecture recognizable. Early pruning means fewer passages traverse the remaining encoder layers; later pruning lets more passages receive deeper contextual processing. Table 4.5 makes that trade-off measurable.\n\n{{visual:Table 4.5}}\n\nAt positions two, three, and four, Match Acc is respectively 95.40, 95.41, and 95.43; Match F1-Macro is 92.75, 92.76, and 92.79. Total Carburacy moves in the opposite direction: 0.491, 0.436, and 0.321. The quality differences are small, while the carbon-aware score is more sensitive to the extra computation.\n\nAmong the tested positions, later pruning favors matching quality, while earlier pruning favors the carbon-aware score. The thesis’s complexity discussion explains why processing more passages through more encoder layers increases the cost. (PDF pp. 93, 104–105.)"
      },
      {
        "id": "traceability-not-proof",
        "title": "Ranked sources make the evidence available for inspection",
        "body": "The thesis combines existing retrieval and graph techniques so that a fixed search system supplies a broader candidate set, document relationships guide selection, and only selected passages consume the full reader budget. The biomedical adaptation and its ablations show where that design helps and where additional structure interferes with pretrained representations. (PDF pp. 85–94, 101–107.)\n\nIts interpretability benefit is source traceability: predictions are accompanied by a ranked set of candidate documents. Readers can inspect the candidate sources; the neural computation remains opaque, and checking whether the documents support the answer requires a separate assessment. Chapter 5 explicitly retains concerns about hallucination, incomplete sources, bias, and computational cost. It also states that the system must not substitute for diagnosis by qualified healthcare professionals. (PDF pp. 107–109.)\n\nThe experiments favor graph-based passage selection over replacing pretrained reader states, and quantify the matching-quality and cost trade-off of pruning earlier. Source traceability adds an inspection aid alongside these measured outcomes.\n\nSource: [MSc thesis, Knowledge-Enhanced Neural Models for Question Answering based on Retrieval](https://amslaurea.unibo.it/id/eprint/30058/). Page references throughout this article are physical, one-based PDF pages from the supplied 122-page version."
      }
    ],
    "links": {
      "read": "https://amslaurea.unibo.it/id/eprint/30058/"
    },
    "visualSelection": {
      "main": [
        "Figure 1.1",
        "Figure 1.2",
        "Figure 1.3",
        "Figure 1.4",
        "Table 1.1",
        "Table 1.2",
        "Table 1.3",
        "Figure 1.5",
        "Figure 1.6",
        "Figure 1.7",
        "Figure 1.8",
        "Figure 1.9",
        "Figure 1.10",
        "Figure 1.11",
        "Figure 1.12",
        "Figure 1.13",
        "Figure 1.14",
        "Figure 1.15",
        "Figure 1.16",
        "Figure 2.1",
        "Figure 2.2",
        "Table 2.1",
        "Figure 2.3",
        "Figure 2.4",
        "Figure 2.5",
        "Table 2.2",
        "Table 2.3",
        "Figure 2.6",
        "Figure 2.7",
        "Figure 2.8",
        "Figure 2.9",
        "Figure 2.10",
        "Figure 3.1",
        "Figure 3.2",
        "Table 3.1",
        "Figure 3.3",
        "Figure 3.4",
        "Figure 3.5",
        "Figure 3.6",
        "Table 4.1",
        "Table 4.2",
        "Table 4.3",
        "Table 4.4",
        "Table 4.5"
      ],
      "appendix": []
    }
  }
];
