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
    "abstract": "Improving reasoning abilities in Large Language Models (LLMs) requires high-quality data that exposes difficult decisions, competing alternatives, and their consequences. Data scarcity is driven by the low quality of synthetic data and the cost of human labeling. We introduce Self-Play Search Distillation (SPSD), a framework for generating superhuman synthetic data via self-play of MuZero-like networks trained on board games. SPSD uses executable environments to turn search into structured reasoning problems. At each state, the expert identifies a preferred decision, plausible alternatives, plausible opponent replies, and value estimates. By converting the self-play search records into superhuman chains-of-thought, we train LLMs with environment-grounded supervision. Although trained only on self-play search records, SPSD transfers to unseen mathematics. On Qwen3-4B-Base, it raises the mean over six mathematics benchmarks from 24.1 to 36.3 while increasing the held-out-game win rate from 15% to 45%. SPSD offers an annotation-efficient way to create high-quality synthetic data for improving LLM performance in reasoning tasks.",
    "sections": [
      {
        "id": "spsd-beyond-answer-labels",
        "title": "A good move is only the beginning of a lesson",
        "body": "A winning move says what to do. It does not explain which tempting alternative fails, how an opponent might respond, or which changes to the board make the decision worthwhile. Self-Play Search Distillation (SPSD) starts from that missing information: **search-based game experts** already produce comparisons and continuations while choosing an action. Can those records become useful reasoning supervision for a language model?\n\nBoard games make this question unusually testable. Legal actions and state transitions are executable, and a claimed win can be checked by replay rather than accepted because an explanation sounds convincing. The manuscript first places game competence alongside broader reasoning performance across model scale.\n\n{{visual:Figure 1}}\n\nThe broad association motivates the experiment, but it is not evidence that training on games causes mathematical improvement. Nor is the second panel the six-benchmark mathematics suite used later: it averages GPQA-Diamond and Humanity’s Last Exam. The stronger test comes from changing the training of a fixed language model and measuring what transfers.\n\n**Source status:** this article discusses a submitted TACL manuscript, not an accepted or published paper. Its results and visual labels refer to that supplied version."
      },
      {
        "id": "spsd-search-to-supervision",
        "title": "Turn search into evidence the simulator can check",
        "body": "SPSD separates the data-producing expert from the language-model learner. A MuZero-family expert is trained through self-play, frozen, and then used to generate decision records. The language model does not participate in that self-play, and it receives no expert search information at inference time. This is offline transfer from a planner, not a language model repeatedly playing against itself during post-training.\n\nAt a retained state, the expert performs 50 search simulations and exports the selected action, a visit-based ranking of legal alternatives, value estimates, and retained continuations. These are raw materials for a lesson, not prose to copy indiscriminately. The simulator restores the state and replays branches before a renderer turns the verified facts into language.\n\n{{visual:Figure 2}}\n\nThe key boundary is between an estimated advantage and an observed outcome. Search values can determine which comparison is worth including, but the renderer only claims a win, loss, or draw when replay reaches the corresponding terminal state. An invalid selected move rejects the record; an invalid optional branch is removed. A trace can therefore be shorter when evidence is insufficient, rather than inventing a justification.\n\nThe accompanying state questions teach complementary skills: identifying occupancy, checking legality, counting threats or legal actions, enumerating actions, and predicting a successor state. An appendix table makes the grounding contract concrete.\n\n{{visual:Table 2}}\n\nEach answer has an executable criterion, from exact set equality for action enumeration to an actual state transition for successor prediction. That makes correctness auditable, although it does not make every question equally difficult: the manuscript notes that some legal-action answers can be extracted directly from the visible options."
      },
      {
        "id": "spsd-how-transfer-is-learned",
        "title": "The training objective matters as much as the teacher",
        "body": "The study compares ways of using the same general supervision interface. Supervised fine-tuning (SFT) directly imitates a rendered reasoning chain and answer. On-policy self-distillation (OPSD) instead lets the student generate its own response. A fixed language-model teacher, given the privileged expert trace, supplies token-level guidance along the prefixes that the student actually produced. The student is trained to approach that teacher distribution without seeing the trace in its own prompt.\n\nRuleBot-Distill provides a non-search comparison, generating compact, rule-verified responses from a fixed heuristic policy. It asks whether choosing plausible actions is enough, or whether richer search-derived evidence helps. This is not a perfectly isolated removal of search information: the heuristic and search policies also visit different states and produce different targets.\n\nThe endpoint table separates mathematics, game outcomes, and legality rather than collapsing them into a single notion of reasoning. Evaluation includes held-out games and mathematics benchmarks absent from the game supervision.\n\n{{visual:Table 1}}\n\nThe clearest joint improvement is Qwen3-4B-Base: OPSD raises the six-benchmark mathematics mean from 24.1 to 36.3 and the held-out-game win rate from 15% to 45%. Its legality also improves, whereas SFT raises mathematics performance while substantially reducing legality. Learning something transferable and becoming better at the action interface are not the same event.\n\nThe other model blocks prevent a universal success story. Qwen3-8B responds differently with native thinking enabled or disabled. For Llama-3.1-8B, OPSD does not improve the mathematics mean over the baseline, and it ties RuleBot-Distill on the reported game metrics. Search-derived supervision is useful in these experiments, but its benefit depends on the student and training regime."
      },
      {
        "id": "spsd-retaining-gains",
        "title": "Early progress can disappear with more training",
        "body": "A final checkpoint hides how a model arrived there. If direct imitation improves quickly but subsequently damages generalization, stopping early tells a different story from training to the full budget. The Qwen3-4B-Base trajectories track game performance, legal moves, and mathematics together. Game performance uses the **FIDE score**: a loss receives 0, a draw 0.5, and a win 1. It therefore credits draws, unlike the separate win-rate measure.\n\n{{visual:Figure 3}}\n\nSFT produces a strong early mathematics checkpoint and then declines, alongside deteriorating game behavior. RuleBot-Distill also gives back some early gains. OPSD continues improving later in training, making **retention of progress**—not simply its initial acquisition—a central part of the result.\n\nThe variant-enriched curriculum changes local game rules while preserving the interface, so the learner encounters different decision patterns without a different action representation. Its measured curves are higher in the results discussion, but mathematics still peaks before the final checkpoint. Diversity does not remove saturation or the need to choose checkpoints carefully.\n\nThe curves are compatible with a benefit from guidance on **student-generated prefixes**. They do not isolate that mechanism from the expert evidence or optimization schedule. The measured trajectories support a benefit from broader coverage in this comparison, not a guarantee that more variants will improve every checkpoint or student."
      },
      {
        "id": "spsd-agreement-is-not-quality",
        "title": "Copying the oracle is not the same as making a good decision",
        "body": "A model can choose a valuable action without matching the expert’s exact favorite, especially when several moves are nearly tied. Conversely, matching the favorite in a bad position does not guarantee victory. The final analysis therefore evaluates choices against a fresh search in two ways: Q50 measures the estimated value of the selected move, while oracle@50 records exact agreement with the search-preferred action.\n\n{{visual:Figure 4}}\n\nThe surfaces relate those two coordinates to episode wins. Their shapes differ across systems and are not uniformly increasing, so absolute surface height is not a cross-model leaderboard. Value and agreement capture different properties of a decision; neither alone replaces the actual game outcome. These are descriptive associations, not evidence that the language model internally executes MCTS.\n\nThe larger contribution is a way to make synthetic reasoning data accountable to something outside the learner. Search supplies difficult comparisons; the simulator constrains what may be claimed; post-training determines whether the lesson survives beyond the original game. Mathematical transfer is encouraging, but backbone dependence and non-isolated controls remain important limits. Stronger experts and broader executable environments offer ways to improve the supervision without making the learner responsible for inventing its own ground truth."
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
        "title": "A working function is not an object-oriented program",
        "body": "Code generation benchmarks often ask a model to complete an isolated function. **Object-oriented programming** adds another obligation: the implementation must fit a system of interfaces, responsibilities, types, and state boundaries. Java Academic Benchmark (JAB) asks whether success on short coding problems survives that shift.\n\nThe manuscript surveys existing benchmarks by language and task granularity to explain the gap it targets.\n\n{{visual:Table 1}}\n\nThe concentration around Python and function-level tasks motivates a complementary test, not a dismissal of those benchmarks. JAB places class-level implementation in an academic setting where both behavior and design are part of the assignment. Its evaluation follows the layers a professor would inspect.\n\n{{visual:Figure 1}}\n\nCompilation establishes whether the program is admissible; tests check behavior; KODE examines design quality. These layers answer different questions, so no single passing score substitutes for the others.\n\n**Version note:** all numbered visuals and results here come from the supplied author manuscript, which differs from the final *Journal of Systems and Software* publication. They must not be treated as a verified inventory of the final journal article."
      },
      {
        "id": "jab-exams-as-specifications",
        "title": "An exam supplies a contract, not a blank editor",
        "body": "JAB collects 103 Java exams from 2014–2024, supported by 506 expert-written JUnit tests. The model receives instructions, interfaces, utility files, and tests. It must implement the missing pieces while respecting the provided structure. In the lamp example, that means representing different failure behaviors without duplicating everything those lamps share.\n\n{{visual:Figure 2}}\n\nThe example exposes the difference between returning the right value once and preserving an object’s behavior across repeated operations. It also explicitly prefers factoring common behavior into an abstract class. A solution can therefore satisfy visible assertions while leaving a design obligation unresolved.\n\nThe yearly statistics describe the amount of material the model must read and produce.\n\n{{visual:Table 2}}\n\nInputs average 1,858 tokens and reference solutions 623 tokens under the reported tokenizer. These are structured, multi-part specifications rather than tiny snippets. Complexity and solution length also vary by year, so an aggregate score combines different kinds of difficulty.\n\nThe topic map explains why that variation matters.\n\n{{visual:Table 3}}\n\nAlongside inheritance and encapsulation, the exams require generics, nested collections, design patterns, streams, and functional idioms. Knowing each construct separately may not be enough when a task combines them. The benchmark remains drawn from one instructor and institution, however; breadth within a curriculum is not the same as coverage of all software development."
      },
      {
        "id": "jab-what-passing-means",
        "title": "Passing is deliberately a layered judgment",
        "body": "JAB distinguishes mandatory functionality from optional extensions. S-Pass requires every mandatory test; H-Pass additionally requires the optional tests. The distinction comes from the original assignments rather than an arbitrary difficulty split imposed after generation.\n\n{{visual:Figure 3}}\n\nA program can implement the required core and still omit operations or quality features needed for the stronger result. Compilation sits below both: code that never compiles cannot pass either test suite. The evaluation of 27 models makes these bottlenecks visible.\n\n{{visual:Table 4}}\n\nIn the manuscript, o4-mini-high reaches 96.1% S-Pass and 95.1% H-Pass, while Qwen2.5-Coder-32B reaches 48.5% and 33.0%. The latter gap is not just a syntax problem: even among solutions that satisfy the core assignment, extended requirements remain difficult. Other models lose substantial ground before tests can run at all.\n\nThese are results for the model versions and decoding protocols studied, not a current ranking. The paper also uses different sampling settings for reasoning models and other model families, so the table should be read together with its evaluation contract."
      },
      {
        "id": "jab-feedback-versus-another-guess",
        "title": "A compiler can help—but only if the model uses the feedback",
        "body": "Programming is rarely a single uninterrupted act of correct generation. JAB therefore adds an agentic setting with compiler diagnostics, test feedback, and up to three refinement rounds. A successful agentic pass@1 means success within that permitted interaction, not necessarily on the first code submission.\n\n{{visual:Table 5}}\n\nThe gains are model-dependent. Qwen2.5-Coder-32B moves from 48.5% to 57.3% S-Pass in this comparison, while smaller models remain substantially weaker. Most recoverable mistakes are fixed early; extra rounds offer diminishing returns rather than an assurance of eventual success.\n\nRepeated independent sampling is a different way to improve success probability.\n\n{{visual:Figure 4}}\n\nThe hatched extensions show @10 improvements over @1, not the benefit of a debugging agent. A model can improve by producing more candidates without learning anything from a previous compiler error. Keeping these comparisons separate prevents a misleading claim about agentic reasoning.\n\nThe student comparison narrows the evaluation to the 2023 exams and places model grades alongside a distribution from 176 students.\n\n{{visual:Figure 5}}\n\nSome strong models approach or exceed the student distribution under the reported protocol, especially with feedback. This concerns exam performance, not professional engineering competence. The same figure also compares Java tasks with their Python translations; several conditions improve in Python, while others tie.\n\nThe Qwen family provides a closer look at the interaction between language, sampling, and refinement.\n\n{{visual:Figure 6}}\n\nFeedback does not yield identical benefits at every model size or in both languages. Moreover, Python execution is not Java compilation: static type constraints can stop a Java solution before an analogous Python program reaches its tests. The translated subset contains only ten tasks, so it suggests a language-sensitive weakness rather than proving a universal training-data bias."
      },
      {
        "id": "jab-failures-have-structure",
        "title": "Errors reveal what a pass rate conceals",
        "body": "Class-level tasks make failures easier to localize than an undifferentiated project score. JAB groups the compiler and runtime errors generated by each model, retaining their frequencies and total counts.\n\n{{visual:Table 7}}\n\nSymbol-resolution failures are prominent: a plausible-looking method or class reference may not exist in the supplied program. At runtime, assertion failures dominate many distributions, showing that executable code can still violate the assignment. Boundary conditions, missing resources, and null handling provide additional failure modes. Percentages must be read alongside totals—a large slice of a small error pool is not the same absolute burden as a similar slice of a large pool.\n\nExam-year trends offer a second view of difficulty, linking performance to changes in the curriculum.\n\n{{visual:Figure 7}}\n\nThe highlighted periods emphasize tasks mixing object-oriented and functional styles, where several models deteriorate. The pattern is consistent with difficulty composing abstractions, not merely recalling syntax. Year is also a bundle of task characteristics, so the plot does not independently establish which language feature caused each decline."
      },
      {
        "id": "jab-cost-of-a-correct-solution",
        "title": "Correct code can still be expensive to produce and maintain",
        "body": "A passing implementation may be much longer or more complicated than the professor’s solution. JAB compares only passed model solutions with their corresponding references, using lexical overlap and output-to-reference ratios for size and structural complexity.\n\n{{visual:Table 8}}\n\nSeveral models produce substantially more verbose and complex code. Low lexical overlap is not inherently wrong—valid designs can differ—but complexity and duplication matter to whoever maintains the result. Because each row contains a different subset of solved tasks, these ratios are not a perfectly matched comparison of coding style across models.\n\nGeneration also has an immediate computational cost. The manuscript contrasts token consumption and API expenditure for two reasoning models.\n\n{{visual:Figure 8}}\n\nGemini-2.5-Flash produces more output tokens than o4-mini in this measurement, and the reported benchmark run costs more. These are historical measurements under the study’s settings, not present-day prices or latency guarantees. The practical lesson is to evaluate the full cost of obtaining useful code, rather than treating answer length as evidence of better reasoning."
      },
      {
        "id": "jab-a-judge-is-another-measurement",
        "title": "Design quality needs a rubric—and scrutiny of the judges",
        "body": "KODE evaluates clarity and maintainability, object design and encapsulation, reuse and modularity, and resource management and efficiency. In this author manuscript, one human expert and two language-model judges independently apply a three-point rubric without a reference solution. Their scores are then aggregated and normalized.\n\n{{visual:Table 6}}\n\nStrong design scores do not eliminate the execution gap. Some weaker programming models still receive respectable OOP ratings, illustrating that recognizable structure and correct behavior can come apart. The human and automated judges also differ in strictness, particularly for clarity.\n\nAgreement statistics test how consistently these judgments can be reproduced.\n\n{{visual:Figure 9}}\n\nThe manuscript reports modest correlations and chance-corrected agreement despite high adjacent agreement. On a three-point scale, being within one point is a permissive criterion; it should not be mistaken for interchangeable grading. The criterion-level matrices show which disagreements an aggregate hides, starting with readability.\n\n{{visual:Figure 10}}\n\nThe off-diagonal counts show that clear naming and apparently tidy control flow do not always persuade judges equally. Encapsulation asks a more structural question: whether objects preserve a boundary around their state.\n\n{{visual:Figure 11}}\n\nScores concentrate near the upper end, but concentration alone cannot establish strong discrimination between good and excellent designs. Resource management and efficiency present another challenge, because suitable containers and absence of leaks do not settle algorithmic quality.\n\n{{visual:Figure 12}}\n\nThe dispersion between judges cautions against treating that dimension as an objective execution metric. Reuse introduces yet another judgment call: when is repeated logic minor, and when should it become a shared abstraction?\n\n{{visual:Figure 13}}\n\nDisagreement between satisfactory and excellent ratings remains visible. Together, these matrices make KODE useful as a structured diagnostic while retaining its uncertainty. The separate public rubric supplement uses a five-point scale; it is a different evaluation specification and must not be silently substituted for the manuscript’s three-point setup."
      },
      {
        "id": "jab-disagreement-in-the-code",
        "title": "The same duplication can look minor or decisive",
        "body": "The qualitative examples show what lies behind adjacent rating disagreements. For a Gemini-2.5-Pro solution, the automated judges criticize repeated list-combination logic and implementation-specific branches. The human judge acknowledges duplication but considers the overall builder design adequate for the highest reuse rating.\n\n{{visual:Figure 14}}\n\nThis is not disagreement about whether repetition exists. It is disagreement about how heavily to penalize it. The same example also separates clarity from reuse: a design can organize responsibilities sensibly while making execution flow difficult to follow.\n\nThe o4-mini example reverses the reuse judgment: both automated judges award the higher score, while the human penalizes repeated list construction.\n\n{{visual:Figure 15}}\n\nOn efficiency, however, all judges identify unnecessary reconstruction or copying of lists and assign the same score. Agreement improves when the critique points to a concrete computational pattern rather than a stylistic threshold. These examples belong to the main discussion even though the manuscript places their figures after the references.\n\nJAB’s contribution is thus more than a difficult Java leaderboard. It separates syntax, behavior, revision, and design so that success in one cannot hide failure in another. Its conclusions remain bounded by one curriculum, visible tests, standardized prompting, model-specific decoding, and subjective quality judgments. Those limits make the benchmark a diagnostic tool—not a replacement for an instructor or a certificate of general software-engineering ability."
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
        "title": "Knowing a rule is not the same as knowing when it applies",
        "body": "A legal answer can cite a real instrument and still be wrong: a later act may have repealed it, extended its validity, or changed the scope of an exception. Sycophants in the Courtroom asks whether language models can use **authoritative evidence** without automatically deferring to it. The comparison with medicine is diagnostic rather than a claim that either profession reduces to a multiple-choice exam. The question is whether the same model behaves differently when the truth of an answer depends on changing normative relationships rather than clinical facts.\n\nThe study separates four measurements: Knowledge Recall (KR), accuracy without supporting context; Knowledge Grounding (KG), accuracy with relevant reference texts; Knowledge Confidence (KC), accuracy when those contexts are manipulated; and Format Perturbation (FP), sensitivity to how the question and options are presented. Here, confidence means resistance to misleading evidence, not a calibrated probability or a model's self-reported certainty. The opening profiles show why one aggregate accuracy would conceal the problem.\n\n{{visual:Figure 1}}\n\nEach model has four percentage axes, with solid, hatched, and dotted marks distinguishing Standard, Incorrect, and None-Provided formats. GPT-OSS 120B reaches 92.5% on standard legal grounding but only 13.4% on standard knowledge confidence. Llama-3.1 8B has a lower grounding score, 68%, but a higher confidence score, 31.8%. The useful contrast is the imbalance within each profile, not simply which model draws the largest shape: greater success with valid context need not bring greater resistance to false context."
      },
      {
        "id": "relationship-benchmark",
        "title": "A benchmark built around legal relationships",
        "body": "LEGAL-LINK-EU contains 1,127 questions generated from 880 distinct EUR-Lex document pairs spanning 1953–2025. Its seven relation types are completes, corrects, extends application, extends validity, implicitly repeals, rendered obsolete by, and repeals. Each contributes 161 questions. The task is to infer the legal consequences of an interaction between acts, rather than recognize a relationship label supplied in the question.\n\nThe generation pipeline uses GEPA prompt optimization, quality judgments, and structural checks intended to require cross-document reasoning and plausible distractors. A separate three-model jury audits a stratified 100-item sample. This is useful validation, but remains an LLM-based audit of synthetic questions rather than an exhaustive assessment by legal professionals. The cross-domain evaluation also includes paired legal and medical MMLU subjects and MedQA. Medical grounding uses generated MEDGENIE supporting passages, whereas legal grounding supplies the paired EUR-Lex texts.\n\nA worked repeal example makes the distinction concrete. The question concerns saithe and herring catches on 30 December 1983: does a new regulation replace every relevant fishing rule, or only a species-specific part of the regime?\n\n{{visual:Table 11}}\n\nOption D preserves the distinction: saithe falls under 31983R3624, while herring continues under Regulation (EEC) No 198/83. Option B is the tempting overgeneralization, treating the new act as an exclusive replacement for both activities. This is why finding the newest-looking citation is not enough.\n\n{{visual:Table 12}}\n\nReading across the original-context, perturbed-context, and effect columns shows how the attack changes that interpretation. A title gains “UNIFORM,” a blanket applicability clause is inserted, replacement language is added, and herring-specific evidence is moved. Together these edits make B appear supported without simply telling the model which letter to choose. The example illustrates the intended failure mechanism; it is not a reported model-by-model execution trace."
      },
      {
        "id": "grounding-dependency",
        "title": "Reliable context repairs law more than medicine",
        "body": "The first empirical comparison asks how much knowledge is already available without the documents, and how much relevant context repairs. Table 1 groups recall results by legal and medical subject, then places the grounded and perturbed conditions side by side for LEGAL-LINK-EU and MedQA. Rows compare the same evaluated models across these conditions.\n\n{{visual:Table 1}}\n\nFor Gemini-2.5-Flash, MedQA moves from 86.9% recall to 89.7% grounding; LEGAL-LINK-EU moves from 70.5% to 97.5%. GPT-OSS 120B shows the same asymmetry: 84.1% to 86.4% in medicine, versus 62.6% to 92.5% in law. The paper reports grounding gains of 2.8 and 2.3 percentage points on MedQA, compared with 27.0 and 29.9 points on the legal benchmark.\n\nThose are substantial benefits of supplying the correct legal texts. They do not, by themselves, establish blind obedience: LEGAL-LINK-EU was deliberately designed around questions requiring source documents. The troubling evidence comes from the next columns. Once that context is manipulated, Gemini's legal accuracy is 14.0% and GPT-OSS 120B's is 13.4%. Medicine is not immune either: Gemini reaches only 18.8% under medical KC, while GPT-OSS 120B retains 54.8%. The domain asymmetry is pronounced for the reasoning models, but medical robustness is not universal across the model roster."
      },
      {
        "id": "legal-effects",
        "title": "Which legal relationships break under pressure?",
        "body": "A single legal score can hide whether a model struggles with explicit corrections, temporal extensions, or implicit supersession. Table 2 therefore repeats the comparison by relation type. Its upper block gives grounded accuracy; the lower block gives perturbed-context accuracy, with subscripts recording the decrease from grounding.\n\n{{visual:Table 2}}\n\nLlama-3.1 reaches 75.2% on completes with valid context, but 62.1% on both implicitly repeals and repeals. Stronger models can resolve these relations when given the unmodified texts: Gemini reaches 98.8% on implicitly repeals and 100.0% on extends validity. Yet those same columns fall to 4.7% and 7.0% under perturbation. GPT-OSS 120B drops from 98.8% to 7.5% on extends validity, a reported 91.3-point decrease.\n\nThe pattern is not simply that temporal questions are impossible. High grounded scores show that the evaluated models can often recover the correct answer from clean documents. The larger difficulty is deciding whether the presented evidence deserves that trust. Extends application is comparatively less destructive under KC—for example, 29.8% for GPT-OSS 120B against 7.5% on completes—but it is still far below its 91.9% grounded result."
      },
      {
        "id": "perturbation-density",
        "title": "More corrupted context, less reliable answers",
        "body": "The confidence experiment partitions supporting text into chunks and varies how many are perturbed while retaining the overall context structure. Evaluation prompts explicitly permit the model to discount incomplete or misleading evidence. The observed deference therefore cannot be explained simply as obeying an instruction to treat every supplied passage as true.\n\n{{visual:Figure 2}}\n\nThe horizontal axis is perturbed-context percentage, from 20% to 100%; the vertical axis is accuracy. For GPT-OSS 20B, the legal curve falls from 35.7% to 14.8%, while MedQA falls from 65.2% to 50.5%. The bands report 95% confidence intervals over three independent runs per level. These are the means from the perturbation-density experiment, not replacements for the single summary scores in Table 1. Both domains deteriorate, but the legal curve is lower throughout and declines more strongly.\n\nMatched percentages of perturbed chunks do not necessarily mean equally difficult attacks. An appendix comparison helps qualify the causal interpretation.\n\n{{visual:Table 14}}\n\nThe legal column has higher vocabulary overlap with its original contexts—Jaccard overlap 0.893 versus 0.822 for medicine—but lower sequence similarity, 0.680 versus 0.759. Length ratios stay close to one, at 0.983 and 1.028. Legal attacks preserve more words while reorganizing them more heavily. This supports the claim that surface lexical similarity can conceal a changed legal meaning, while also warning against attributing the entire cross-domain difference to legal authority alone."
      },
      {
        "id": "diagnostic-indices",
        "title": "Better grounding can coexist with greater deference",
        "body": "Four derived indices separate transitions that raw accuracy merges. The Grounding Inefficiency Index (GII) is lower when valid context more effectively repairs recall errors. The Parametric Override Index (POI) is lower when adversarial evidence displaces internal knowledge. The Citation Sycophancy Index (CSI) is lower when performance collapses from grounded to perturbed conditions. The Artifact Exploitation Index (AEI) measures the excess of Incorrect over None-Provided performance, normalized by the remaining headroom; higher values indicate greater option-artifact exploitation. Unlike a single robustness score, these indices do not all improve in the same direction.\n\n{{visual:Figure 3}}\n\nModel groups run from Llama-3.1 8B through Mistral-3 14B to GPT-OSS 20B and 120B; solid bars show law and hatched bars medicine. In the legal comparison, declining GII accompanies declining CSI and POI: useful grounding becomes stronger while resistance becomes weaker. The paper reports legal CSI of 46.9% for Llama-3.1 and 8.66% for GPT-OSS 120B, and POI of 78.2% versus 43.1%.\n\nThis is a scale-sensitive pattern within the evaluated families, not a controlled law of parameter count. Model architecture, training, instruction following, and reasoning policy change alongside size. The authors' explanation—that extended reasoning can rationalize a supplied authority instead of auditing it—is a hypothesis consistent with these results, not a mechanism directly established by the indices."
      },
      {
        "id": "format-fragility",
        "title": "Removing the question can be easier than rejecting its options",
        "body": "Context is only one source of misleading evidence. The format tests change labels to Roman numerals, remove labels, place the correct answer last, ask for all incorrect options, substitute a None-Provided answer, or remove the question stem altogether. These manipulations probe different behaviors: some preserve the decision problem's surface meaning, while others deliberately change what the model must recognize.\n\n{{visual:Table 3}}\n\nEach setting contains Gemini-2.5-Flash and GPT-OSS 120B rows, with subject-specific columns and an average. On the legal subjects, Gemini scores 87.3% in the standard format, 51.8% with None Provided, and 65.4% with Options Only. GPT-OSS 120B follows the same ordering: 77.6%, 46.4%, and 59.8%. A model does better without the question than when it must recognize that the substantive answer is absent. In medicine, the ordering is more intuitive: Gemini scores 91.7%, 62.7%, and 52.2%; GPT-OSS 120B scores 90.1%, 70.7%, and 48.3%.\n\nOther changes expose model-specific sensitivity rather than a universal collapse. Roman numerals raise Gemini's legal average to 88.5% but reduce GPT-OSS 120B's to 71.3%; fixing the correct answer's position yields 88.0% and 80.6%. Incorrect framing also interacts with the broader legal profiles, sometimes improving perturbed-context behavior. These results motivate the authors' helpfulness-prior interpretation, but do not establish “ask for the wrong answers” as a validated deployment safeguard."
      },
      {
        "id": "scope-and-design",
        "title": "Evaluate whether evidence can be rejected, not only used",
        "body": "The practical lesson is not to remove retrieval. Clean legal evidence produces some of the study's largest improvements. It is to test the two sides of retrieval separately: can a system extract the correct consequence from valid documents, and can it withhold trust when comparable-looking evidence changes that consequence? A strong answer to the first question does not settle the second.\n\nThe study uses zero-shot multiple-choice tasks and oracle contexts, not an end-to-end retrieval service. It isolates a vulnerability but does not measure legal drafting, cross-examination, multi-jurisdiction argumentation, or the frequency of these attacks in deployed systems. The legal questions and perturbations are synthetic, the medical and legal supporting texts have different origins, and the attacks differ in their structural effects. Further evaluation should combine source-validity checks, temporal applicability, and resistance to false citations rather than treating a high legal-exam score as sufficient evidence of reliability."
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
        "title": "The right tool is not always the closest description",
        "body": "A tool-using language model can only call an API it has been shown. Supplying an entire catalog is expensive and introduces competing descriptions, so a retriever usually selects a small candidate set first. That creates a separate failure point: an embedding model trained to recognize **semantic similarity** may retrieve a tool that sounds relevant but cannot perform the requested operation. Similar tool names and docstrings can conceal different arguments, types, and effects.\n\nPORTS trains that retrieval component to distinguish useful tools, using a frozen language model's likelihood of the correct tool call as guidance. The goal is not to fine-tune a larger caller. It is to make the smaller model that selects its context more discriminating. The opening comparison shows both the value of any adaptation and the additional contribution of preference optimization.\n\n{{visual:Figure 1}}\n\nThe horizontal axis is average recall, with separate rows for RoBERTa and BGE and bars for frozen, REPLUG-tuned, and PORTS-tuned retrievers. RoBERTa moves from 8.8% frozen to 50.8% with REPLUG and 57.5% with PORTS. BGE starts much stronger, at 54.4%, then reaches 62.5% and 65.6%. These plotted averages cover Recall@1, @2, and @3 across six datasets and, for tuned models, three guiding LLMs. Most of RoBERTa's improvement comes from adaptation itself; PORTS adds a further advantage over an already adapted retriever."
      },
      {
        "id": "two-training-signals",
        "title": "Align likelihoods, then separate the alternatives",
        "body": "Each training instance contains a query, its correct tool call, a positive tool, and negative tools. PORTS encodes the query and each docstring, converts their cosine similarities into a retrieval distribution, and separately prompts the frozen caller with each candidate. The caller's average log-likelihood of the gold call becomes a second distribution: a candidate is useful to the extent that its documentation supports producing that call. This is a likelihood-based proxy, not feedback from executing the tool.\n\n{{visual:Figure 2}}\n\nThe diagram follows one positive and two negative docstrings through independent encoding and LLM scoring. The snowflake-marked caller remains fixed; the retriever is updated. Keeping candidates separate attributes the guidance signal to an individual docstring instead of mixing their contributions in one long prompt.\n\nThe objective combines a REPLUG-style distribution-matching term with a preference term: L_PORTS = L_replug + λ · L_po. The latter penalizes the retriever when the positive tool does not have sufficiently greater selection odds than each negative. In the paper, each pair contributes −log σ(log(odds-positive / odds-negative)); it is not a single log-ratio over a sum of negative odds. Hard negatives are selected by the encoder's current similarity scores, and tool embeddings and negatives are refreshed periodically as that space changes.\n\nThis second signal matters when several descriptions are similarly plausible under the caller's likelihoods. Distribution matching aligns the retriever with the caller, while explicit positive-versus-negative comparisons preserve pressure to distinguish the correct tool from its close competitors."
      },
      {
        "id": "evaluation-design",
        "title": "Six datasets, two kinds of generalization",
        "body": "The evaluation spans ToolBench, API-Bank, APIBench, BFCL-v2, ToolE, and Octopus-v2. They differ not just in catalog size, but in whether queries are conversational, code-oriented, or ordinary requests and whether they require one or several tools. Table 1 makes these differences visible before any score is compared.\n\n{{visual:Table 1}}\n\nRead the train and test columns separately from the total-tool column. ToolBench has 12,934 tools, whereas Octopus-v2 has only 20. API-Bank includes conversational inputs; APIBench and BFCL include programming-oriented tools. The final two rows are not additional source datasets: they are ToolE and Octopus variants whose training and test tools do not overlap. Their inventories split into 160/39 and 16/4 train/test tools, respectively. This distinguishes generalizing to new queries about known tools from selecting tools absent during training.\n\nFor training, multi-tool examples from ToolBench, API-Bank, and BFCL are decomposed into single-tool targets; prior calls are removed from the retriever's conversational input. The main experiments pair RoBERTa-base and BGE-base with LLAMA3-8B, LLAMA3-GROQ-8B-Tool-Use, and CODESTRAL-22B-v0.1. Each run fits a single 24GB RTX 3090, with the LLM frozen and quantized to 4 bits. The reported setup uses three negatives, refreshes every 50 training steps, and trains for two epochs, with a 10K-instance sampling budget where data permit.\n\nRecall measures whether relevant tools are retrieved; NDCG additionally rewards placing them nearer the top. The results table reports Recall@1, @2, @3 and NDCG@1, @3, @5. These are retrieval metrics, not a guarantee that the resulting call will execute correctly or satisfy the user's full request."
      },
      {
        "id": "results-and-baselines",
        "title": "Separate gains over frozen models from gains over REPLUG",
        "body": "The main result table compares PORTS and REPLUG within each encoder–dataset group. It also reports improvements over the frozen baseline. Those are different comparisons and should not be interchanged. Each displayed row uses the best guiding LLM for that encoder–dataset–loss combination, so adjacent rows do not always share the same teacher.\n\n{{visual:Table 2}}\n\nThe headline increases of 71.66 recall points and 70.16 NDCG points occur for seen-tool RoBERTa on Octopus in the Δavg baseline columns. For unseen-tool RoBERTa on ToolE, those columns show 61.24 and 59.79 points. They are gains over the frozen encoder, not gains over REPLUG. The paired seen-tool Octopus rows are more informative about the incremental method change: PORTS obtains Recall@1/@2/@3 of 95.00/100/100, compared with 87.50/97.50/100 for REPLUG. Both already recover the tool within three candidates; preference optimization mainly improves its placement.\n\nThe harder catalogs reveal remaining headroom. With BGE on ToolBench, PORTS reaches Recall@1 of 25.80% and Recall@3 of 43.35%. With RoBERTa on APIBench, it reaches 21.50% and 30.53%, against REPLUG's 8.74% and 15.35% in the displayed best-teacher comparison. Improving a weak baseline does not make these tasks solved.\n\nThe preference objective generally raises dataset-level retrieval performance, but not every individual metric. For example, the BGE BFCL rows show NDCG@5 of 73.10 for PORTS and 74.31 for REPLUG, even though PORTS has a higher average gain. The small unseen Octopus catalog also requires care: its starred final NDCG column is NDCG@4, because only four test tools exist."
      },
      {
        "id": "caller-and-docstrings",
        "title": "The teacher and the documentation both matter",
        "body": "A downstream model's tool-calling specialization does not automatically make it the best retriever teacher. The useful quantity during training is the contrast between candidate-conditioned gold-call likelihoods. An uncertain general model can sometimes provide a more informative distribution than a specialized model that assigns similar confidence to several candidates.\n\n{{visual:Figure 3}}\n\nEach dataset panel compares RoBERTa and BGE on its horizontal axis; bar groups correspond to the three guiding LLMs, and the frozen baseline supplies a reference. The right-hand panels isolate unseen ToolE and Octopus tools. The pattern is consistent with Figure 1: the weaker RoBERTa baseline leaves much more room for adaptation, whereas BGE's strong starting point compresses the available gain, especially on Octopus. Across panels, no teacher is uniformly best.\n\nThe paper associates some of this variation with documentation. Detailed argument names, outputs, types, and defaults give the caller—and therefore the retriever's learning signal—more functional information. Broad descriptions of model capabilities can leave competing tools difficult to distinguish. The experiments support selecting a teacher–retriever pairing empirically rather than assuming that the largest or most tool-specialized caller supplies the best signal in every catalog."
      },
      {
        "id": "unseen-tool-sweep",
        "title": "What happens when fewer training tools are available?",
        "body": "Holding out queries is a relatively forgiving test if the entire catalog was already represented during training. The out-of-domain sweep instead changes the proportion of **seen tools** in ToolE, keeping a consistent test distribution while reducing the training inventory. It uses RoBERTa with LLAMA3-8B guidance to compare PORTS directly with REPLUG.\n\n{{visual:Figure 4}}\n\nThe horizontal axis runs through 35%, 50%, 70%, 80%, and 90% training-tool coverage; the two panels plot average recall and NDCG. Both methods improve as more of the catalog becomes available during training, but PORTS stays above REPLUG at every plotted coverage level. Its advantage persists at the low-coverage end instead of depending entirely on memorizing a nearly complete inventory.\n\nThis is evidence for transfer to held-out tools through their documentation. It is not a live evaluation of changing API versions or multi-step agent plans. Those scenarios can introduce shifts in schemas, state, and downstream requirements that a static held-out-tool split does not capture."
      },
      {
        "id": "retrieval-example",
        "title": "A hotel request should retrieve a hotel tool",
        "body": "The qualitative example translates the ranking objective back into an ordinary request: “I'm looking for a hotel in Sapporo.” Table 13 compares the top three tools under PORTS-tuned and frozen BGE.\n\n{{visual:Table 13}}\n\nThe gold tool, TripTool, describes hotel and accommodation bookings alongside broader travel functions. Frozen BGE ranks Sakenowa ahead of TripTool and places Local third, with the three cosine similarities close together. PORTS puts TripTool first and separates it much more clearly from SmartTicket and Local. Read these bar heights as cosine similarities, not calibrated probabilities of successful execution.\n\nThe example illustrates the distinction that motivates the loss: sharing geographic or travel-related language is not the same as supporting the requested operation. A single successful ranking cannot establish overall reliability, but it makes the aggregate improvements interpretable—preference training can change both which tool wins and how distinctly it stands apart from alternatives."
      },
      {
        "id": "robustness-and-cost",
        "title": "Low-memory adaptation is not free supervision",
        "body": "The study also tests different random seeds. This appendix result is worth retaining because it qualifies the stability of the larger gains rather than adding another leaderboard.\n\n{{visual:Table 10}}\n\nRows group average recall by dataset across seeds 0, 42, and 100, followed by a variance column. ToolE is comparatively stable, with reported variance 0.69; API-Bank is less stable, with 33.59 and seed scores ranging from 46.73 to 60.38. Octopus also varies, with reported variance 19.39. These differences argue for checking repeated runs on the intended catalog rather than translating a general statement of robustness into a guarantee for every dataset.\n\nPORTS avoids updating the caller, but must repeatedly query it to obtain likelihood guidance. The paper explicitly identifies this time and memory overhead as a limitation, along with sensitivity to vague docstrings; its full experiment suite totals approximately 500 GPU-hours. Re-aligning a retriever to another caller therefore has a cost, even if each run is feasible on one workstation.\n\nThe contribution is a practical training objective for the retrieval bottleneck. The next validation step is to connect better rankings to actual execution success, code-generation correctness, and complete multi-step tasks. Those outcomes are not established by recall and NDCG alone."
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
        "title": "A food description is not a single label",
        "body": "FoodEx2 turns an everyday description into a **structured record** for food-consumption monitoring and exposure assessment. The challenge is not merely to recognize yoghurt: the system must distinguish the base food from ingredients, production methods, and packaging, then choose valid descriptors from several taxonomic hierarchies. FEAST—Food Embedding And Semantic Taxonomy—treats this as a combination of hierarchical and extreme multi-label classification.\n\n{{visual:Figure 1}}\n\nFollow the yoghurt example from the input sentence to its base term and separate facet groups. Corn flakes, oats, and raspberries create multiple ingredient descriptors, while the glass cup contributes information to two different packaging categories. **The target is a coordinated set of decisions**, not a flat list of interchangeable labels. This structure motivates a staged model, but also means that recognizing the food correctly does not establish that the complete code is correct."
      },
      {
        "id": "coverage-before-models",
        "title": "The bottleneck begins with the available annotations",
        "body": "The source dataset contains 72,197 entries; cleaning missing values, duplicates, anonymized descriptions, and inconsistent annotations leaves 28,648. The resulting corpus is multilingual in content and contains mappings that require domain knowledge rather than simple word matching. More importantly, its observed labels cover only a fraction of the catalog.\n\n{{visual:Table 1}}\n\nCompare coverage after preprocessing across the three rows: all 28 **facet categories** appear, but only 1,650 of 4,367 base terms and 1,355 of 28,675 facet descriptors are represented. Broad coverage of category names therefore coexists with very sparse coverage of the fine-grained decisions the system ultimately has to make.\n\n{{visual:Table 2}}\n\nThe per-instance distributions add another constraint. Some descriptions require no facets at all; others require several categories and multiple descriptors within them. Inspect both the averages and maxima rather than imagining a fixed-length output. The authors also construct an out-of-sample split with disjoint base-term categories, which is the default evaluation setting unless otherwise stated. This probes transfer beyond seen base terms, but does not remove the underlying limits of the reduced tender dataset."
      },
      {
        "id": "retrieve-then-disambiguate",
        "title": "Use the taxonomy to retrieve plausible codes before choosing",
        "body": "FEAST separates base-term selection, facet-category prediction, and descriptor selection. Dense retrieval narrows the large base-term and descriptor spaces; cross-encoders or an instruction-tuned language model then assess the candidates. Category prediction is treated separately because it must identify several overlapping dimensions rather than select a single food identity.\n\n{{visual:Figure 2}}\n\nRead the pipeline in order, paying attention to the category decision that determines which descriptor candidates are considered. The diagram also shows alternatives rather than one compulsory model stack: lightweight classification and generative classification occupy different positions in the design space. Taxonomy-aware hard negatives make training examples deliberately confusable, drawing on shared parents, structural proximity, and overlapping implicit facets. This is a way to teach distinctions that ordinary semantic similarity can miss.\n\n{{visual:Figure 3}}\n\nThe instruction templates show how the same LLM is adapted to the three subtasks. Inspect the candidate lists and contextual descriptions, and the explicit permission to return an empty category list. These prompts constrain the decision context; they should not be read as unconstrained generation of arbitrary FoodEx2 codes. Because later stages depend on earlier selections, strong component scores alone cannot establish full-code reliability."
      },
      {
        "id": "ranking-versus-classification",
        "title": "Retrieval is strong; selecting the right dimensions is harder",
        "body": "The ranking experiments distinguish finding plausible candidates from assigning the final labels. This distinction matters in a taxonomy where many nearby descriptions differ in small but consequential ways.\n\n{{visual:Table 3}}\n\nInspect the retrieval and reranking blocks separately. ModernBERT reports 96.57% Acc@1 for base-term retrieval and 98.90% for descriptor retrieval; DeBERTa-v3-large reports 91.01% and 96.03% Acc@1 in the corresponding reranking blocks. These are component results, not a single end-to-end accuracy curve. In particular, the table does not justify treating reranking as an unconditional numerical improvement over the retriever's own top result.\n\n{{visual:Table 4}}\n\nFacet-category retrieval is less decisive. DeBERTa-v3-base reaches 73.03% Acc@1, while Recall@1 is 44.70%; expanding the candidate list increases recall. Read this gap as evidence that locating one plausible category is easier than recovering all relevant categories.\n\n{{visual:Table 5}}\n\nThresholding exposes the remaining precision–recall trade-off. At threshold 0.4, the reported micro-F1 is 88.00%, but macro-F1 is 53.05%. Lower thresholds recover more labels without eliminating that disparity. **An aggregate score dominated by frequent labels can conceal weak coverage of rare categories.**"
      },
      {
        "id": "llm-is-not-universally-better",
        "title": "Why a larger generative model is not the answer to every stage",
        "body": "Joint instruction tuning makes the LLM a flexible classifier, but its effectiveness varies sharply by subtask. Facet categories require simultaneous recognition of several semantic dimensions, and the authors report that a smaller supervised classifier can outperform the LLM on this decision.\n\n{{visual:Figure 4}}\n\nInspect the variation across facet categories rather than looking for one universal winner. The source plot does not provide a color-to-model legend, so it should not be used to infer a missing color assignment or exact model-specific bar values. Both series are relatively weak on F09, F26, and F27, while F08, F10, F22, and F28 are consistently stronger. This category-level unevenness matters when deciding which facets need more examples or closer review.\n\n{{visual:Table 6}}\n\nThe LLM's validation results sharpen that picture: micro-F1 is 99.18% for Task I, 78.82% for Task II, and 99.82% for Task III. For Task II, the reported accuracy of 96.39% sits alongside only 55.65% exact match of the **complete label set**. These measures answer different questions. Moreover, the validation procedure uses simulated distractor candidates, whereas the **real retrieval pipeline** is used on the test set; the near-perfect validation results must not be presented as complete real-pipeline coding accuracy."
      },
      {
        "id": "scope-and-deployment",
        "title": "A modular coding assistant, with a bounded evidence base",
        "body": "FEAST's practical contribution is an inspectable decomposition: experts can examine retrieved candidates and reranking scores rather than receive only an opaque final code. The paper compares selected task-level accuracies with previously reported CNN-based FoodEx2 figures, but explicitly conditions its interpretation on retrieval coverage and acknowledges the absence of a standardized public benchmark. The evidence supports this modular approach on the curated dataset; it does not establish uniformly reliable coding across the entire catalog.\n\nThe discussion reports that the most underrepresented categories can still have zero F1. It also states that raw data and model weights were not publicly available at the time of writing because release required the contracting authority's approval. Joint end-to-end optimization, targeted data augmentation, and continual adaptation are future directions, not completed evaluations.\n\n*Source scope: this narrative uses the complete eight-page arXiv v1 dated 3 March 2026, including end matter. No appendix is present. The source itself identifies a separate definitive ECAI 2025 version; this account does not substitute the arXiv file for that publisher version or alter publication status.*"
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
        "title": "Mark relationships, not just objects",
        "body": "A multimodal language model may recognize an oven and a plant yet still misread which is above the other. Graph-of-Mark (GoM) addresses this gap at the input rather than by retraining the model: it draws an estimated **scene graph** directly onto the image, making **object identities** and **spatial relationships** jointly visible.\n\n{{visual:Figure 1}}\n\nCompare the isolated region marks with the connected representation. Set-of-Mark provides names for regions; GoM additionally supplies arrows and, in some variants, relation labels. **The intervention changes what the frozen model sees**, not its weights. The graph is automatically estimated rather than provided as ground truth, so any gain depends on both the accuracy of those estimates and the model's ability to interpret the overlay."
      },
      {
        "id": "construct-a-readable-graph",
        "title": "Building useful structure requires selective annotation",
        "body": "The pipeline combines detector outputs, merges overlapping boxes, and refines regions with segmentation. It estimates directional relations from image geometry, front–back ordering from monocular depth, and proximity where appropriate. Query-based filtering then removes irrelevant objects and relations before rendering masks, IDs, arrows, and optional edge labels. Collision handling is important: an annotation that covers the evidence can undermine the reasoning it was meant to support.\n\n{{visual:Figure 2}}\n\nIn the kitchen example, hold the question fixed and compare the answers produced by the different image treatments. The raw and SoM responses incorrectly place the potted plant below the oven, whereas the GoM examples answer no. Inspect the referenced object IDs as well as the final yes/no answer: the example illustrates how marking affects regional attribution, not only answer wording. It is a qualitative case, not a success rate, and the source enlarges fonts and line widths here for readability.\n\n{{visual:Table 1}}\n\nThe hyperparameter sweep makes clear that training-free does not mean configuration-free. Detection confidence, geometric thresholds, query matching, and retained relations all influence the constructed evidence. Starred algorithm settings were selected after preliminary Qwen-2.5-VL runs on GQA; the evaluation then varies seed, temperature, and top-p across 27 decoding configurations. Those repetitions quantify decoding variation, not independent reconstruction of every possible preprocessing design."
      },
      {
        "id": "read-the-results-by-task",
        "title": "The gains depend on both the model and the prompt variant",
        "body": "The evaluation uses three open-source multimodal models and four datasets: GQA, VQAv1, VQAv2, and RefCOCOg. It samples 1,000 images per dataset while retaining their associated questions. Referring-expression comprehension is evaluated through predicted object IDs, with a correct region requiring IoU at least 0.9; this protocol is not applied to raw-image or segmentation-only inputs that lack the necessary IDs.\n\n{{visual:Table 2}}\n\nRead each model block against its own baselines and use the icon legend to distinguish connectivity, object-ID format, and explicit relation labels. For Gemma-3 on VQAv2, the table reports 59.9% with raw images and 71.9% with textual object IDs plus relation labels. Qwen-2.5-VL illustrates why ordinary marking is not automatically helpful: its VQAv2 accuracy is 73.8% on raw images but 68.6% with SoM, while a labeled GoM variant reaches 80.5%. These are selected table entries, not a claim that every variant improves every metric.\n\nNo single configuration wins all columns. RefCOCOg improvements are smaller than the strongest VQA improvements, and the table's missing raw-image localization entries should not be interpreted as zero scores. The displayed means and standard deviations summarize the decoding runs under the chosen preprocessing and sampled-image protocol, rather than population-wide guarantees."
      },
      {
        "id": "density-and-modality",
        "title": "More structure helps only while it remains readable",
        "body": "If explicit relationships help, a natural next question is whether drawing more of them is always better. The graph-density ablation directly tests that assumption.\n\n{{visual:Figure 3}}\n\nStart at zero edges, the SoM-like condition, then follow each model as edges are added. The authors identify the most effective regime around 3–10 entities and 4–16 relations; denser annotation reduces the available headroom by introducing noise. This is evidence for filtering, not for rendering every pairwise relation.\n\n{{visual:Figure 4}}\n\nThe modality ablation asks a separate question: should the graph be shown, verbalized, or both? Compare raw-image/text, textual-graph, visual-graph, and combined conditions within each dataset. For Gemma-3, visual graphs provide the stronger contribution, with verbalization adding smaller gains. Because this figure reports Gemma-3 results, it should not be promoted into a universal statement about every multimodal architecture. The result supports a practical complementarity between spatial overlays and text, rather than showing that either representation is always sufficient."
      },
      {
        "id": "an-appendix-case-that-tests-the-limit",
        "title": "When a richer label becomes a distraction",
        "body": "The appendix's referring-expression example is worth retaining because it tests a different output requirement from the kitchen question. Instead of generating a verbal spatial answer, the model must select the correct marked object.\n\n{{visual:Figure 7}}\n\nCompare the two couch descriptions and track which IDs each prompt assigns to them. Several GoM variants resolve the requested objects, but the example also contains a GoM failure: textual IDs together with relation labels lead to an incorrect assignment. This makes the figure more informative than another unqualified success case. An overlay can supply useful relational evidence while its naming scheme adds distraction for ID-based localization.\n\nThe example preserves the actual font size and line thickness used by the source, unlike the enlarged main-body illustration. It is included from Appendix C as a concrete limitation, not as an additional quantitative evaluation or a claim that textual labels invariably hurt referring-expression comprehension."
      },
      {
        "id": "scope-of-the-intervention",
        "title": "A useful inference-time interface, not guaranteed geometry",
        "body": "GoM makes a structured intermediate representation available to a frozen multimodal model without architectural changes. On the reported workstation, image augmentation averages 1.13 seconds, compared with 0.77 for segmentation-only and 0.92 for SoM. These are preprocessing measurements under the paper's hardware conditions, not a general end-to-end response-time guarantee.\n\nThe method still relies on detected objects, heuristic spatial relations, relative depth estimation, and query filtering. Missing objects or incorrect depth ordering can become confidently rendered evidence. The observed benefits therefore establish the usefulness of this particular visual interface in the tested settings, not reliable physical understanding in arbitrary scenes. Hypergraphs, stereo depth, video, and clinical applications are proposed extensions rather than evaluated capabilities.\n\n*Source scope: the full fourteen-page arXiv 2603.06663v2 is the reviewed source, including Appendices A–C. The publisher's final AAAI article endpoint was unavailable during source collection; this narrative does not represent the arXiv file as the final publisher version or change publication status.*"
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
        "body": "A constitutional ruling is not simply a document with an outcome attached. Its factual account, legal reasoning, final determination, and expert summaries serve different purposes. COMMA preserves those distinctions in 14,000 rulings from the Constitutional Court of the Italian Republic, covering 1956 to April 2022. The contribution is a **structured research resource**, not a system that has demonstrated an ability to replace judicial deliberation.\n\n{{visual:Figure 1}}\n\nThe writing pipeline connects the Court's procedures to the resulting document: epigraph, body, decision, and accompanying maxims. The body distinguishes facts from legal reasoning where the source permits that separation. Maxims summarize key legal points and supply titles and optional constitutional references. These components make several supervised tasks possible without treating every output as an interchangeable summary.\n\nCOMMA also brings Italian constitutional material into a multilingual evaluation setting. Its English, Spanish, and French rulings are translations of the Italian archive, not independent collections of cases from four jurisdictions.\n\n{{visual:Table 1}}\n\nRead the comparison by task family, language, and jurisdiction together. COMMA combines three summarization tasks, decision generation, retrieval, and two classification tasks within one newly assembled dataset. That combination is more specific than a claim that civil-law datasets or multilingual legal benchmarks did not previously exist."
      },
      {
        "id": "length-and-sampling",
        "title": "Long documents, informative targets, unequal classes",
        "body": "The archive is curated rather than an unfiltered census. Starting from 21,429 merged records, the pipeline removes missing maxims, length and compression outliers, and near-duplicates. The resulting split contains 12,600 training rulings, 700 validation rulings, and 700 test rulings. Sampling is stratified by ruling type and length; it is not a chronological test of future court decisions.\n\n{{visual:Table 2}}\n\nThe statistics separate document length from summarization difficulty. English rulings average 3,418.5 words, while concatenated maxim texts average 482.5 and maxim titles 125.2. Narrative targets are therefore substantial texts, not headline-length abstracts. High source coverage means much target vocabulary appears in the ruling; it does not establish that extracting a few sentences will reproduce the expert's synthesis. Coverage, density, and compression describe different properties of the source–target relationship, not model accuracy.\n\n{{visual:Figure 2}}\n\nThe distributions expose variation hidden by those averages: ruling types, document lengths, years, and judgment categories are not interchangeable populations. Judgments outnumber orders, and some judgment types are rare. Classification evaluation retains only types represented in every split, reducing the ten-type source taxonomy to six evaluated classes. **Macro-F1** is consequently important alongside micro-F1: strong aggregate performance can conceal errors on less common classes."
      },
      {
        "id": "structured-knowledge",
        "title": "Article retrieval needs more than an article number",
        "body": "COMMA's retrieval task asks for constitutional parameters from the epigraph and factual account, down to the paragraph, or comma, level. The companion Constitution dataset preserves both paragraph text and its place in a hierarchy, giving the task a defined search space rather than an unrestricted web-search objective.\n\n{{visual:Figure 3}}\n\nThe dictionary-like representation separates article and paragraph content from parts, titles, and sections. This supports indexing precise provisions while retaining broader legal context. The resource covers the Constitution's 139 article numbers and reflects the February 2022 revision; it is not a versioned reconstruction of the law applicable to every historical ruling.\n\n{{visual:Figure 4}}\n\nThe access examples distinguish loading the ruling corpus from loading the Constitution resource through HuggingFace Datasets. That separation matters experimentally: supplying a model with the correct provision is not equivalent to asking it to retrieve that provision. In decision generation, COMMA supplies the epigraph, facts, and text of the **gold constitutional parameters**, while withholding the Court's legal reasoning. The reported generation scores therefore do not measure an end-to-end retrieval-and-decision pipeline."
      },
      {
        "id": "translation-evidence",
        "title": "Translation quality is measured indirectly",
        "body": "The translated rulings expand access, but introduce another source of uncertainty. The study compares Google Translate, GPT-3.5-turbo, and NLLB using **round-trip translation**: Italian text is translated outward and then back into Italian. ROUGE measures lexical overlap with the original; an Italian cross-encoder supplies semantic similarity. Neither directly certifies the legal correctness of the intermediate translation.\n\n{{visual:Table 3}}\n\nGoogle Translate leads the full-text averages, with ROUGE-1 of 83.69 and semantic similarity of 57.75, compared with 79.75 and 52.20 for ChatGPT. NLLB scores 60.85 and 55.07. Its relatively closer semantic score does not erase the much larger lexical gap. These results motivate the dataset's translation choice, not a universal ranking of today's translation systems.\n\n{{visual:Figure 5}}\n\nThe section-level histograms show why a document-wide average is incomplete. Epigraphs and decisions concentrate at higher ROUGE-1 values than maxim titles; body and maxim distributions also vary. The titles used as short summarization targets are thus not automatically the easiest material to preserve across languages.\n\n{{visual:Table 4}}\n\nThe decision from ruling 106/1983 makes the risk concrete. NLLB renders the Italian public-security consolidated text as the “Single European Act on public security,” changing the legal reference. Legal-T5 also distorts wording and a place name. The example illustrates terminology failures that aggregate similarity scores can obscure; it is not a frequency estimate for the full archive."
      },
      {
        "id": "baselines-and-metrics",
        "title": "More context helps, but the task determines the score",
        "body": "The experiments use resource-constrained multilingual baselines on a single 24GB GPU. Standard mBart accepts 1,024 input tokens; adding local, sparse, and global attention extends mBart-Lsg to 4,096. Classification also uses XLM-RoBERTa-Lsg, while retrieval compares an encoder-based model with a contrastive Matrix model. Models are trained for four epochs and selected on validation performance.\n\n{{visual:Table 5}}\n\nThe main table should be read within each task and language, not as one leaderboard. For English ruling-to-narrative summarization, mBart-Lsg raises the aggregated ROUGE-derived R score from 36.97 to 45.70 and BERTScore from 15.43 to 30.29. Yet BARTScore **faithfulness** moves from −5.37 to −5.93, where higher is better. Better overlap and semantic matching do not guarantee better source consistency.\n\nClassification and retrieval tell different stories. English XLM-R-Lsg reaches 100.0 micro- and macro-F1 for ruling type, but article-retrieval accuracy is 28.50. Its retrieval NDCG is 67.36 because that metric also rewards constitutional proximity, not only exact identification. Decision generation obtains an English R score of 72.79 with mBart-Lsg, but uses gold provision text. None of these numbers is an overall percentage of legally correct reasoning."
      },
      {
        "id": "output-ceiling",
        "title": "Long inputs do not remove the output constraint",
        "body": "The long-context advantage is strongest when the source is the full ruling. Turning already condensed maxim texts into titles changes the problem: much of the selection work is already embodied in the gold input. This helps explain why maxim-to-title generation is easier than producing titles directly from the ruling.\n\n{{visual:Table 12}}\n\nThe appendix's length settings qualify the long-summary results. Both mBart variants have a **512-token maximum output length**, despite their different input capacities. Table 5 reports English narrative outputs averaging 388.5 tokens for mBart and 412.4 for mBart-Lsg; the paper describes narrative references averaging 624 tokens across languages. Short outputs must therefore be interpreted alongside an explicit decoding ceiling, not solely as evidence that the models cannot learn long legal summaries. Subword token counts should not be equated with the word counts in Table 2."
      },
      {
        "id": "low-resource-learning",
        "title": "Learning curves are not uniformly smooth",
        "body": "The low-resource experiment trains on the first 10, 100, or 1,000 training instances, alongside zero-shot and full-data settings. Here, “few-shot” means limited supervised training, not inserting demonstrations into a chat prompt.\n\n{{visual:Figure 6}}\n\nThe four panels separate the generative tasks; solid lines show mBart and dashed lines mBart-Lsg. Full-ruling narrative summarization benefits visibly from longer context, while decision-generation curves approach their full-data scores earlier. Individual curves also dip or cross at small sample sizes. The figure supports task-dependent learning behavior rather than an assertion that adding data always helps or Lsg wins every low-resource comparison. It plots the R score, so it does not establish that factual reliability improves at the same rate."
      },
      {
        "id": "human-reliability",
        "title": "The strongest automatic score is not the safest output",
        "body": "Three legal experts evaluate mBart-Lsg outputs for 20 test rulings across four generative tasks and four languages. Each evaluator assesses 320 examples on three-point scales for recall, precision, and faithfulness. This is a focused expert assessment, not a human review of every test prediction.\n\n{{visual:Figure 7}}\n\nThe grouped bars make the metric mismatch visible. Decision generation, despite its strong automatic scores, receives low faithfulness ratings. Reproducing much of a reference's wording can coexist with a consequential factual error. The reported inter-evaluator Kendall coefficient is 0.18, also indicating substantial disagreement; small differences between language bars should not be treated as definitive rankings.\n\nFor legal use, that distinction is central. Classifying document form, retrieving the right provision, and generating a faithful determination require separate validation. Success on the easier classification tasks cannot stand in for reliability on the latter two."
      },
      {
        "id": "historical-scope",
        "title": "A historical archive needs historical legal context",
        "body": "The archive spans decades, but the linked constitutional text is a February 2022 snapshot. This creates a concrete boundary for interpreting retrieval and generation: an article cited by an older ruling may have since changed or been repealed.\n\n{{visual:Table 7}}\n\nThe amendment table pairs affected articles with amendment years and records occurrences before those changes. Repeated entries for Article 117 illustrate that an article number alone does not identify a timeless text. A time-aware knowledge base is proposed as future work, not supplied by these experiments.\n\nCOMMA provides useful material for studying structured legal language, but remains bounded by one court, translated rather than independently authored multilingual cases, fixed experimental splits, and imperfect source metadata. The paper also acknowledges possible personal information in the public rulings. Research availability is not a guarantee of deployment readiness, factual reliability, or absence of privacy risk."
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
        "body": "Neuro-symbolic AI is often invoked as a route to explainability, **reasoning**, and **data efficiency**. This survey asks a more operational question: for a given task, what does an **explicit symbolic component** contribute, and how does the resulting system compare with a black-box alternative? Its definition requires neural networks combined with identifiable symbolic machinery, such as logical rules, solvers, or state–action schemas.\n\nThat boundary matters. A rule that constrains a prediction is not equivalent to a plausible explanation reconstructed after the prediction. The authors distinguish these mechanisms rather than treating every model described as reasoning or interpretable as neuro-symbolic.\n\n{{visual:Figure 1}}\n\nRead the inner ring as a record of this selection process, then the outer ring as the distribution across venues. A DBLP-based search covering 2017–2024 produced 172 papers; the chart identifies 92 surveyed works after excluding black-box, purely logical, and short-paper groups. **This is a deliberately scoped literature sample**, not a census of every system that might be called neuro-symbolic. Its counts reflect the chosen venues, keywords, dates, and definition."
      },
      {
        "id": "navigate-from-the-task",
        "title": "A taxonomy that can be entered from the application",
        "body": "Architecture-first classifications can make neighboring methods look unrelated when they use different networks, or deceptively similar when they share a formalism but solve different problems. The survey instead organizes the field around three operations: extracting rules from data, enforcing supplied rules, and synthesizing executable programs.\n\n{{visual:Figure 2}}\n\nStart at a task—such as relation extraction, claim verification, or visual question answering—and trace upward to the applicable techniques and macro-category. Then reverse direction to see where a familiar formalism might transfer. The repeated appearance of deterministic finite automata is instructive: learning an automaton from behavioral traces and using one to shape an agent's behavior are different uses of the same representational tool.\n\nBenchmark labels anchor the map to evaluation practice, but blank entries are not oversights to be filled speculatively. The authors withhold comparable benchmark labels where prompt-dependent evaluation, custom reinforcement-learning tasks, or limited causal-estimation datasets make a common comparison unreliable. The taxonomy is therefore both a navigation aid and a warning about where apparent task similarity does not yield comparable evidence."
      },
      {
        "id": "formal-languages-are-design-choices",
        "title": "The intermediate language determines the kind of control",
        "body": "A symbolic layer is useful only insofar as its language can express the distinctions the task requires. Horn clauses capture implication-like relations; natural logic manipulates entailment relations between linguistic expressions; finite automata represent state transitions. First-order and probabilistic logic support explicit constraints and uncertainty, while grammars and semantic parsing enable structured programs.\n\n{{visual:Figure 3}}\n\nInspect how a simple statement changes form across the examples: a predicate implication is not the same object as a probabilistic rule, a transition graph, or a grammar production. These are not interchangeable decorations on a neural model. They determine what can be checked, composed, learned, and potentially explained.\n\nThe reviewed applications expose the cost of each choice. Rule-mining systems can recover relational patterns but face search and expressivity limits. Enforcement can guide attention, regularize outputs, or shield unsafe actions, yet depends on the adequacy of the supplied constraints. Program synthesis offers executable structure, but a correct solver cannot repair an incorrectly parsed problem. **Interpretability of the intermediate representation does not guarantee correctness of the perception or translation that produced it.**"
      },
      {
        "id": "compare-without-flattening",
        "title": "Competitiveness is task-specific, not a single ranking",
        "body": "The survey's performance comparison is most useful when read row by row. It juxtaposes published results for particular tasks and benchmarks; it is not a controlled rerun in which training data, model scale, and evaluation protocols have all been equalized.\n\n{{visual:Table 1}}\n\nInspect the benchmark and metric before the sign of the reported delta. The table lists JMLR at 77.9% accuracy on DWIE with a reported +10.8% delta over DocRE-CLiP, while QA-NatVer is listed at 70.3% on FEVER development data with a −20.0% delta against SFAVEL. Other rows use macro-F1 or BLEU rather than accuracy. These values cannot be averaged into a meaningful overall advantage for either paradigm.\n\nThe LECTER row needs an additional qualification: its reported +6.5% comparison uses *2-best accuracy* for LECTER, whereas the discussion identifies standard accuracy for the GPT-3.5 comparison. That mismatch prevents a like-for-like superiority claim. Elsewhere, the authors flag inconsistent baseline results on WN18RR and the sensitivity of negative-sampling procedures. The lesson is not that symbolic reasoning uniformly wins or loses, but that credible comparisons require matching the actual decision problem and evaluation protocol."
      },
      {
        "id": "where-structure-earns-its-cost",
        "title": "Use structure where its guarantees or constraints are needed",
        "body": "Across the reviewed work, neuro-symbolic methods are most compelling when explicit structure is part of the requirement: enforcing permitted actions, exposing a proof-like chain, incorporating domain constraints, or making sequential dependencies inspectable. In open-domain settings, the survey finds that black-box models often benefit more directly from large unstructured datasets. Even within one family, the balance changes with supervision: the discussion of dialogue-structure induction notes that a simpler neural baseline can overtake a constrained approach as labeled data increases.\n\nThis suggests a practical reading of the taxonomy. First specify the behavior that must be represented or constrained; then select a formalism capable of expressing it; finally evaluate against a strong task-matched neural alternative. Symbolic clarity should be assessed alongside predictive quality and robustness, not substituted for them. The paper proposes stronger evaluation of complex linguistic structures, safety-oriented reinforcement learning, and rule mining over modern neural features as research directions rather than demonstrated deployments in high-stakes domains.\n\n*Source scope: this account follows the complete nine-page arXiv v1 dated 3 March 2026, which identifies the definitive IJCAI 2025 article separately. The reviewed file contains Figures 1–3 and Table 1 and has no appendix; its end matter is not an additional experimental supplement. The survey's literature window remains 2017–2024, not the arXiv deposit year.*"
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
        "body": "Mixture of Masters (MOM) studies chess as autoregressive language modeling: a transformer reads a game in PGN notation and predicts the next move without explicit tree search. Rather than fine-tuning one dense model on pooled grandmaster games, it trains separate **player-specific branches** and learns how to combine them. The central question is whether coherent behavioral specialization is more useful than generic diversity between experts.\n\n{{visual:Figure 1}}\n\nFollow the branch–train–stitch sequence. Each expert begins from a shared chess-language-model seed, then learns from one grandmaster's moves; the loss excludes the opponent's tokens. The stitched model routes learned linear transformations in attention and feed-forward modules while sharing other parameters through uniform averaging. This is finer-grained than selecting one complete grandmaster model for an entire game.\n\nDuring router training, Gumbel-Softmax relaxation and a load-balancing objective support differentiable, noncollapsed expert selection. At inference, only the top-k branches contribute at each routed module. **Player identity defines the expert data, not a fixed rule about when that expert must be used.** The router receives no direct supervision telling it which player's style a position requires."
      },
      {
        "id": "data-and-seed-determine-the-experts",
        "title": "Specialization depends on both the seed and the player corpus",
        "body": "The experiments train experts for ten contemporary grandmasters, then stitch five selected for their joint playing strength and **native legality**: Carlsen, Giri, Nakamura, Nepomniachtchi, and So. The training collections combine PGNMentor, Chess.com, and Lichess records, with filtering, deduplication, color balancing, and an 80:20 split stratified by color and outcome.\n\n{{visual:Table 3}}\n\nThis selected Appendix C table makes the unequal evidence behind the personas visible. Collections range from 1,208 games for Vachier-Lagrave to 11,052 for Nepomniachtchi and span 1984–2025. Inspect game volume alongside rating and length rather than attributing every downstream difference to style alone. The curation also appends a shortest forced-mate continuation when Stockfish finds one within the specified horizon, so the training material is not exclusively untouched human move sequences.\n\n{{visual:Figure 2}}\n\nThe seed comparison asks which pretrained representation can be specialized effectively. Across the tested experts, the Karvonen seed provides a stronger foundation than the rating-restricted Transcendence seeds and is adopted for MOM. The proposed explanation—greater representational flexibility—is an interpretation of the result, not a directly isolated causal measurement.\n\n{{visual:Table 1}}\n\nCompare the seed with each independently trained expert under the same Stockfish level-0 protocol. The table reports seed FIDEScore 54.1% and expert scores from 57.8% to 65.6%, alongside win and draw rates and their variability. These results establish useful player-specific fine-tuning within this model family; they do not imply that the expert models reach the competitive strength of their human namesakes."
      },
      {
        "id": "separate-legality-from-strength",
        "title": "A legal move and a strong move are different achievements",
        "body": "The evaluation deliberately exposes native generation failures. Models use greedy decoding, receive no retry after an illegal move, and forfeit immediately if one occurs. Legality is the percentage of games completed without an illegal model move—not the percentage of individual moves that are legal. FIDEScore separately awards one point for a win, half for a draw, and zero for a loss.\n\n{{visual:Figure 3}}\n\nRead the legality distributions before the constrained-decoding comparison. Restricting generation to legal moves removes a major failure mode and raises the selected experts' scores substantially. This shows how much playing strength is lost to rule violations, but constrained decoding is an inference-time intervention rather than evidence that the unconstrained network has learned perfect legality. Main-paper results are unconstrained unless otherwise specified.\n\n{{visual:Table 7}}\n\nThe selected Appendix E ablation separates legality-oriented reinforcement learning from constrained decoding. For MOM, the table reports 69.7 under SSL, 78.1 under SSL plus constrained decoding, 69.1 under SSL plus RL, and 78.7 with both additions. Read across the row: legality-focused GRPO does not automatically improve unconstrained playing strength, although combining it with constrained decoding gives the highest reported MOM score in this ablation. This narrow, single-move reward experiment is not a study of long-horizon self-play optimization."
      },
      {
        "id": "controlled-strength-comparison",
        "title": "Sparse composition helps within a carefully bounded comparison",
        "body": "The strongest test of MOM is not whether it beats an individual expert, but whether it beats alternatives using the same model family and data. The baselines include the seed, pooled-GM fine-tuning, dense expert-weight averaging, and sparse models whose experts are trained on random rather than player-aligned partitions. The random-partition controls are particularly important because they test whether meaningful specialization adds value beyond routing capacity alone.\n\n{{visual:Figure 4}}\n\nCompare the bars within each Stockfish difficulty level, then inspect the tournament ratings in the legend. MOM is reported as the highest-scoring model across levels 0–5, with a Glicko-2 estimate of 1,557±12 versus 1,553±12 for expert soup and an average of 1,549±7 for random-partition MOM. The nearby rating estimates and overlapping displayed intervals counsel against describing this as a large, cleanly separated rating advantage over every composite baseline.\n\nThe tournament uses Stockfish 16.1 with a 100,000-node budget per move, balanced colors, and a 90-turn horizon; unfinished games are adjudicated from the final position's centipawn evaluation. These choices make the comparison concrete and reproducible, but they also define its limits. The ratings are comparative within this protocol, not directly transferable to Lichess, Chess.com, human tournament play, or differently evaluated papers."
      },
      {
        "id": "measure-specialization-not-just-names",
        "title": "Do the named experts actually behave differently?",
        "body": "Naming branches after grandmasters would be superficial if their predictions and representations remained interchangeable. The paper therefore probes three complementary signals: layer-wise activation separation, likelihood assigned to held-out player moves, and exact move emulation.\n\n{{visual:Figure 5}}\n\nIn panel (a), compare parameter distance with the own-master/other-master activation-displacement ratio. Functional separation becomes particularly visible in upper-middle blocks, around layers 10–14; nearby weights can still produce different responses to player-associated positions. In panel (b), a positive NLL advantage means greater confidence on the target master's games. Opening advantages are generally stronger, while the phase- and color-stratified bars reveal variation and some near-zero or negative cases.\n\nPanel (c) provides a more concrete behavioral check. Own-master emulation generally improves over the seed, but the displayed Vachier-Lagrave row does not exceed the corresponding others' emulation average. The visual therefore supports **measurable but nonuniform specialization**, not universal player separation. As the limitations section stresses, these are statistical associations: openings, opponent pools, repeated structures, and historical context can contribute to the signal without constituting a complete causal account of human style."
      },
      {
        "id": "routing-as-a-computational-trace",
        "title": "The router selects sharply, but its trace is not a human explanation",
        "body": "The next question is whether the stitched system preserves distinctions between its branches or merely averages them away. MOM's routing analysis examines both the number of active experts and the probability distribution before top-k selection.\n\n{{visual:Figure 6}}\n\nPanel (a) favors two active experts rather than activating all five. Panel (b) then compares persona-aligned and random-partition models: MOM's top two experts hold at least half the routing mass in 99.9% of recorded passes, and at least 60% in 84.0%. The random controls are markedly less concentrated. This supports selective composition of coherent branches rather than a generic benefit of sparse architecture alone. It does not mean that the same pair is selected everywhere.\n\n{{visual:Figure 7}}\n\nTrace the highlighted top-1 paths across layers for the two board states. Their changes make conditional expert recruitment visible during a game. Importantly, this visualization shows the strongest branch, while the evaluated model uses **top-2** routing; it is a partial view of the computation. The trace helps locate which trained components contributed, but it should not be read as proof that a move literally instantiates a human grandmaster's thought process or a uniquely identifiable attacking or defensive style."
      },
      {
        "id": "a-useful-negative-stylometry-result",
        "title": "Independent player identification remains a harder test",
        "body": "The appendix investigates a separate vision-based stylometry model as a diagnostic—not as part of MOM's training or routing. It encodes sequences of rendered board positions, aggregates spatial and temporal features, and learns game embeddings relative to player centroids. This gives an external test of whether generated games retain signals associated with the target master.\n\n{{visual:Figure 19}}\n\nCompare real-game bars with hatched expert-generated-game bars at the same retrieval depth. The source reports mean P@5 of 0.80 on held-out human games and 0.72 on generated games, while mean human-game P@3 is 0.68. Here the reported P@k measures whether the correct grandmaster appears among the k nearest candidates; it is not top-1 identification accuracy. The subsampling panel asks a different question: whether a player's estimated centroid stays stable as more generated games are included.\n\nThis selected Appendix D result is compelling precisely because it qualifies the main narrative. Stable centroids and useful top-k retrieval can coexist with insufficiently reliable fine-grained identification. The appendix characterizes these stylometry baselines as falling short of consistently separating the desired signatures, motivating the main paper's activation and likelihood diagnostics. **Repeatable embeddings do not by themselves validate a unique player identity.**"
      },
      {
        "id": "what-the-study-establishes",
        "title": "A controlled study of behavioral composition, not an engine replacement",
        "body": "MOM's contribution is a small, structured test of how persona-aligned experts can be composed without erasing all their differences. The combination of controlled random-partition baselines, native-legality evaluation, and internal diagnostics is more informative than a strength score alone. The source reports 50,905,088 parameters per grandmaster model and 185,245,696 for the five-expert MOM; sparse activation does not mean the total model has the same storage cost as one expert.\n\nThe claims remain bounded by a small elite cohort, unequal historical corpora, the fixed Stockfish protocol, and behavioral rather than causal evidence of style. The companion survey records practitioners' beliefs about recognizability and style; it is motivation and context, not an objective validation of every persona or evidence that engine use causally homogenizes play. The source withholds the ablative stylometry-model weights to reduce profiling and attribution misuse.\n\n*Source scope: this narrative uses the complete 52-page arXiv 2602.04447v2 dated 8 May 2026, including all appendices and the checklist. It remains an account of that preprint source.*"
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
        "body": "A useful biomedical summary is not simply a shorter version of a pile of papers. A research background may call for a systematic-review statement; a patient-facing question may require an answer focused on a particular concern. The context determines **which evidence matters** and how it should be combined. RAMSES addresses this setting as *context-aware multi-document summarization*: a context, a cluster of related studies, and one synthesized output.\n\n{{visual:Figure 1}}\n\nThe shared structure is selection followed by synthesis, whether the context is a question or a research issue. Simply concatenating documents can exhaust the model’s input budget before the most relevant material appears. RAMSES instead learns which documents deserve the generator’s attention.\n\n**Version note:** the source for this article and every reproduced visual is the author manuscript titled *Retrieve-and-Marginalize End-to-End Summarization of Biomedical Studies*. The published SISAP chapter is titled *Retrieve-and-Rank End-to-End Summarization of Biomedical Studies*. The results below have not been independently checked against the publisher PDF."
      },
      {
        "id": "ramses-retrieval-learns-from-writing",
        "title": "Let the summary teach the retriever what matters",
        "body": "RAMSES uses separate BioBERT encoders for the context and candidate documents. Their representations produce relevance scores, which select the top-k documents. BART then processes each selected document together with the context. Rather than merging all document representations into one enormous input, it combines their predictions during decoding.\n\nAt each output position, every selected document contributes a probability distribution over the next token. RAMSES weights these distributions by **retrieval** relevance and marginalizes them into one distribution. The generated summary therefore draws on several document-conditioned predictions, not a single winning source.\n\n{{visual:Figure 2}}\n\nThe important training connection runs backward from writing to retrieval. Because relevance scores weight the generator’s token probabilities, the loss for the reference summary also updates the encoders. A document representation is useful not merely when it resembles the query, but when its contribution helps predict the desired summary. This distinguishes RAMSES from an otherwise similar pipeline with a frozen retriever.\n\nSelection still has a cost: only the chosen documents reach the generator. The method makes the evidence budget learnable; it does not guarantee that every relevant fact survives retrieval, or that marginalizing predictions resolves disagreements between studies."
      },
      {
        "id": "ramses-building-evidence-clusters",
        "title": "A benchmark needs supporting evidence, not just questions",
        "body": "To evaluate question-conditioned synthesis, the authors introduce FAQSUMC19: 514 Covid-19 questions with expert-written WHO answers, each paired with 30 scientific abstracts drawn from CORD-19. The dataset is split into 464 training examples and 50 test examples. Constructing the document clusters is a retrieval problem in its own right.\n\nThe authors compare random selection, BM25, and SUBLIMER using lexical and semantic overlap with the question–answer pair.\n\n{{visual:Table 1}}\n\nSUBLIMER achieves the strongest average overlap under both reported measures and is used to build the supporting clusters. This supports its role as a dataset-construction tool, not a claim that overlap alone certifies biomedical evidence quality. Crucially, construction retrieves with the concatenated question and reference answer. Evaluation therefore concerns synthesis from answer-informed candidate clusters, not unrestricted question-only search over the entire literature.\n\nMS2 supplies a complementary task: generate a review statement from a research background and biomedical study abstracts. The dataset statistics show how much material must be compressed in each setting.\n\n{{visual:Table 2}}\n\nMS2 has longer source collections and shorter targets on average; FAQSUMC19 asks for fuller answers from its fixed-size clusters. Both experiments use abstracts as the supporting documents. The motivating problem includes long scientific literature, but these results should not be described as a demonstration of reading every full paper."
      },
      {
        "id": "ramses-better-overlap-not-clinical-proof",
        "title": "The gains appear in both review writing and question answering",
        "body": "The comparisons cover several approaches to handling multiple documents: sparse attention over concatenated text, Fusion-in-Decoder, **marginalization** with a frozen retriever, and a model pretrained specifically for multi-document summarization. The central question is whether joint retrieval and generation outperform these alternatives under the reported experimental setup.\n\n{{visual:Table 3}}\n\nRAMSES reaches ROUGE-1/2/L scores of 31.83/10.44/22.19 on MS2 and 30.18/7.31/15.67 on FAQSUMC19. Its aggregate R scores are 21.32 and 17.56, respectively. These are the best reported values in this manuscript’s comparison, supporting the paper’s contemporary state-of-the-art claim rather than a claim about today’s models.\n\nThe magnitude of the advantage differs by metric. On MS2, for example, ROUGE-L is close to PRIMERA’s 22.16, while the gains in other measures are clearer. That matters because a leaderboard win can conceal a mixture of substantial and small improvements. More importantly, ROUGE measures overlap with a reference, not clinical reliability. The human evaluation later asks whether the improvement is also apparent to readers."
      },
      {
        "id": "ramses-evidence-budget",
        "title": "More retrieved documents are not always better",
        "body": "Retrieval depth k controls how much evidence the generator sees and how much memory training consumes. A larger generator or a larger k might help, but either can spend resources on redundant material. The checkpoint comparison tests these choices rather than assuming that maximum capacity is optimal.\n\n{{visual:Table 4}}\n\nBART-large is competitive, while BART-base provides similar performance with fewer parameters and becomes the default generator. The BART-base MS2 training sweep favors k = 9; increasing the document count further does not consistently improve the scores. The authors suggest redundancy and contradiction as possible explanations, without directly isolating either mechanism.\n\nTraining depth need not equal inference depth. The next experiment keeps the selected MS2 checkpoint and changes how many documents it receives at inference; its FAQSUMC19 columns instead vary k during training.\n\n{{visual:Table 5}}\n\nFor MS2, retrieving 12 documents at inference gives the best reported scores. FAQSUMC19 also favors 12 for ROUGE-1 and ROUGE-2, though not ROUGE-L. Thus the useful budget depends on both the phase of the pipeline and the metric, rather than obeying a universal more-is-better rule.\n\nThe resource side of that choice is visible in the training-memory measurement.\n\n{{visual:Figure 3}}\n\nMemory grows approximately linearly with k in the tested range. That offers a practical tuning knob—the experiments use a 24 GB RTX 3090—but does not make retrieval depth free, nor establish unlimited scaling to arbitrarily large evidence collections."
      },
      {
        "id": "ramses-keep-the-question-visible",
        "title": "Retrieving with the question is not enough",
        "body": "The ablations ask what each component contributes once the overall method works. Besides freezing document retrieval, the study tests sharing an encoder, changing the similarity function, removing the context–document separator, reversing input order, and withholding the context from the generator.\n\n{{visual:Table 6}}\n\nRemoving the generator’s context causes by far the largest reported decline: aggregate R falls from 21.32 to 15.88. The question or research background is not just an address for retrieving documents. It must remain visible while the model decides what to say about them.\n\nFreezing retrieval produces a smaller decline, consistent with a benefit from end-to-end training. Separate encoders and explicit input boundaries also help in this setup. These are empirical component comparisons, not proof that every alternative architecture needs the same choices. The particularly strong context effect does, however, support the task’s central premise: relevance must shape synthesis, not only source selection."
      },
      {
        "id": "ramses-experts-see-progress-and-distance",
        "title": "Better than a baseline is still far from the reference answer",
        "body": "Three evaluators with medical or biological master’s degrees rank answers for the full FAQSUMC19 test set. Each sees the question and anonymized, randomly ordered answers from WHO, RAMSES, and LED-GAQ. The instructions emphasize how thoroughly the answer addresses the question, primarily considering factuality.\n\n{{visual:Table 7}}\n\nAveraged across evaluators, RAMSES is preferred to LED-GAQ in 76% of comparisons. That is evidence that the automatic-score improvement has a reader-visible counterpart. It is not unanimous: complete agreement on that comparison is 46%. RAMSES is preferred to the WHO answer only about 7.3% of the time, leaving a substantial gap to the expert-written targets.\n\nThe result supports retrieval-aware synthesis as a useful research direction, not deployment as an autonomous source of medical advice. The evaluation is small, its evidence clusters were constructed with access to reference answers, and its human rankings are not a comprehensive audit of clinical safety. RAMSES shows how learning to select documents and learning to write can reinforce one another—while leaving faithful, complete biomedical synthesis an open problem."
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
        "title": "Beyond fluent answers: why knowledge needs a place in the model",
        "body": "A biomedical question-answering system has two different jobs: **finding relevant knowledge** and using it to produce an answer. Fluent generation does not establish that either job was done correctly. My MSc thesis, *Knowledge-Enhanced Neural Models for Question Answering based on Retrieval*, investigates that gap through a survey of neural reasoning and a biomedical retrieval architecture. Its central design question is practical: can we improve the use of retrieved documents without continually changing the retriever itself? The eventual answer combines a frozen retriever, a graph of PubMed abstracts, and two stages of passage **reranking** inside a T5-based pipeline. The foundations matter because they explain both the architecture and what its results cannot establish. (Thesis PDF pp. 9, 12, 85–94.)\n\nChapter 1 opens with the Reversal Curse experiments of Berglund and colleagues, not experiments introduced by this thesis. Figure 1.1 concerns models trained on fictional name–description associations; Figure 1.2 tests reversed celebrity-family questions without additional fine-tuning. They expose a difference between reproducing a learned association and accessing it in the opposite direction.\n\n{{visual:Figure 1.1}}\n\n{{visual:Figure 1.2}}\n\nTogether, these examples motivate structured support for inference, rather than proving that every language model lacks reasoning. Reversing a question can change performance even when the relevant relationship appears simple. The thesis therefore treats explainability and generalization as problems to investigate, not automatic consequences of model scale. (PDF pp. 26–30.)\n\nChapter 2 adds a related warning from Anil and colleagues: success at familiar problem lengths need not transfer to longer ones. Figure 2.1 shows parity and Boolean-variable-assignment tasks, with training lengths highlighted.\n\n{{visual:Figure 2.1}}\n\nThis is background evidence about length generalization, not a benchmark of the biomedical system. It broadens the motivation: useful context must be represented and processed effectively, rather than merely made longer. (PDF pp. 63–64.)"
      },
      {
        "id": "retrieval-as-external-memory",
        "title": "Retrieval moves knowledge outside the weight matrices",
        "body": "The retrieval chapter starts from a separation of responsibilities. An external collection stores documents; a search procedure identifies candidates; a reader conditions its prediction on those candidates. The thesis discusses lexical scoring, vector representations, and approximate nearest-neighbour search as ways of making large collections accessible. Retrieval creates an inspectable source of information, although a retrieved passage is not itself proof that the generated answer follows from it. (PDF pp. 30–33.)\n\nBioReader, prior work by Frisoni and colleagues, supplies a biomedical example in Figure 1.3. Its T5-based architecture retrieves PubMed information in chunks and introduces chunked cross-attention into the decoder.\n\n{{visual:Figure 1.3}}\n\nThe important distinction is where external knowledge enters computation. BioReader leaves the encoder unchanged and conditions decoding on retrieved neighbours while maintaining autoregressive generation. This gives the thesis a concrete precedent for separating retrieval from prediction, but its eventual method takes a different route: it ranks whole abstract passages using graph structure before and during encoding. (PDF pp. 32–33, 88–93.)"
      },
      {
        "id": "choosing-graph-computation",
        "title": "What should a graph contribute—and how expensive should it be?",
        "body": "Graphs make relationships explicit, but graph computation still requires choices. Ordinary message passing propagates information through local neighbours; deeper stacks expand the reachable neighbourhood but can blur distinctions between nodes. Chapter 1 contrasts attention-weighted GAT aggregation with the existing ReFactor framework. Figure 1.4 illustrates ReFactor's separate treatment of incoming and outgoing information and its wider interaction mechanism.\n\n{{visual:Figure 1.4}}\n\nReFactor is not a thesis invention. The thesis implements and investigates existing message-passing approaches, using DistMult as a lightweight scoring component. This distinction matters because Chapter 1 contains original comparative experiments alongside its literature review. (PDF pp. 34–38.)\n\nThose experiments put GAT-Conv, DistMult, and ReFactor into a QA-GNN baseline with five graph layers and 200-dimensional **graph representations**. Table 1.1 characterizes CommonsenseQA and OpenbookQA question lengths; Table 1.2 records decoder parameter counts and variation across configurations.\n\n{{visual:Table 1.1}}\n\n{{visual:Table 1.2}}\n\nThe resource contrast is clear: GAT-Conv has 2.85 million trainable decoder parameters, against 1.24 million for each alternative. ReFactor has the lowest reported accuracy standard deviation, 0.0501. These are configuration-level comparisons, not uncertainty estimates from repeated biomedical trials. Question lengths differ between datasets, so they cannot independently establish why performance differs. (PDF pp. 38–40.)\n\nTable 1.3 gives the actual accuracies for add, max, and mean aggregation; Figure 1.5 reorganizes those values into a radar chart.\n\n{{visual:Table 1.3}}\n\n{{visual:Figure 1.5}}\n\nGAT with add aggregation reaches 0.6841 on CommonsenseQA and 0.4760 on OpenbookQA. ReFactor is more even across settings, but not the overall accuracy winner. Indeed, the table contains exceptions to the surrounding prose's broad suggestion that all models do better on CommonsenseQA. The defensible lesson is a trade-off between peak accuracy and stability across these particular settings, not a universal ranking of graph methods.\n\nFigure 1.6 adds the operational cost, showing GPU memory usage for mean aggregation on an RTX 3090 with a batch size of 64.\n\n{{visual:Figure 1.6}}\n\nGAT's more demanding training profile helps explain the later mixed-GNN design: use attention where the retrieved graph is richer, then use ReFactor after pruning has reduced connectivity. That is an architectural motivation supported by preliminary comparisons, not an isolated proof that the mixed design is optimal. (PDF pp. 39–42, 93–94.)"
      },
      {
        "id": "logic-and-learned-representations",
        "title": "Three ways to connect logic with learned representations",
        "body": "The reasoning survey explores more than retrieval. DeepProbLog connects neural predictions to probabilistic logic programs. Its digit-recognition example, Figure 1.7, wraps a neural classifier in a predicate whose outputs form a distribution over digits.\n\n{{visual:Figure 1.7}}\n\nThe bridge is the probability interface: neural perception can contribute to a larger logical computation, and training can propagate through both components. Nearby, the thesis discusses LAMBADA's different approach—backward chaining from a goal through fact checking, rule selection, and subgoal decomposition. These are surveyed alternatives, not components of the final biomedical reader. (PDF pp. 42–45.)\n\nLogic Tensor Networks provide another interface, grounding logical expressions in real-valued tensors and fuzzy truth values. Figure 1.8 shows the surveyed use of existing entity embeddings to learn predicates consistent with an ontology.\n\n{{visual:Figure 1.8}}\n\nHere, the ontology supplies constraints on how concepts relate; similarity in a text-derived embedding space is not the only organizing principle. The example illustrates learned predicate regions, rather than a new embedding method contributed by the thesis. (PDF pp. 46–48.)\n\nRulE goes further by jointly representing entities, relations, and logical rules. Figure 1.9 illustrates a query answered through activated relation paths.\n\n{{visual:Figure 1.9}}\n\nIts final scoring combines embedding-based evidence with grounded rule scores. The pictured nationality inference is an illustration under the supplied rule, not a universally valid inference from residence. Across these approaches, explicit structure can constrain or organize learning, but a chosen rule system still determines which deductions are justified. (PDF pp. 48–50.)"
      },
      {
        "id": "reasoning-traces-and-control",
        "title": "Reasoning traces need selection, stopping, and comparison",
        "body": "Chain-of-Thought offers a less formal route: demonstrate intermediate steps in a prompt rather than require every operation to pass through a logic engine. Figure 1.10 contrasts standard few-shot examples with rationale-bearing examples from the surveyed work by Wei and colleagues.\n\n{{visual:Figure 1.10}}\n\nThe change concerns how the model is asked to solve a problem. An intelligible rationale can be useful, but its existence should not be confused with a verified account of the model's internal computation. The survey then asks how to control the construction of these traces. (PDF pp. 50–52.)\n\nSelection-Inference separates choosing contextual statements from deriving a new statement. Figure 1.11 shows the tagged-sentence interface; Figure 1.12 shows the larger cycle with a Halter module.\n\n{{visual:Figure 1.11}}\n\n{{visual:Figure 1.12}}\n\nTags constrain selection to supplied statements, while the Halter checks whether enough information is available to answer. This makes selection and stopping explicit design decisions, including the possibility of returning unknown. It does not turn every subsequent generated inference into a guaranteed fact. (PDF pp. 52–54.)\n\nSelf-Consistency addresses a different failure mode: dependence on a single sampled rationale. Figure 1.13 contrasts one reasoning path with multiple paths whose answers are aggregated.\n\n{{visual:Figure 1.13}}\n\nThe method samples alternatives and selects an answer through voting or marginalization. Agreement offers a useful selection signal, not an independent factual guarantee. All three techniques belong to the background review; the thesis's biomedical experiments do not evaluate a Chain-of-Thought ensemble. (PDF pp. 53–56.)"
      },
      {
        "id": "graphs-and-trees-of-thought",
        "title": "From a chain to a structured reasoning space",
        "body": "Not every reasoning process is naturally linear. The specific Graph-of-Thought architecture reviewed in the thesis combines text, extracted graph structure, and potentially images. Figure 1.14 shows feature fusion before rationale or answer generation.\n\n{{visual:Figure 1.14}}\n\nIts graph is constructed from textual triplets and coreference resolution, then encoded alongside other modalities. This is important context for the thesis: a graph can be another representation of the same evidence, not necessarily a separate database of verified facts. (PDF pp. 56–58.)\n\nTree-of-Thought instead organizes candidate intermediate states into a search problem. Figure 1.15 compares direct generation, a single chain, multiple sampled chains, and tree search; Figure 1.16 gives the creative-writing example discussed in the source.\n\n{{visual:Figure 1.15}}\n\n{{visual:Figure 1.16}}\n\nIn the writing example, text fragments become search units and alternative plans are evaluated for coherence. Thought granularity, state evaluation, and breadth- or depth-first traversal become explicit choices. These examples broaden the survey without becoming claimed biomedical contributions: the eventual PubMed graph connects documents for reranking, rather than searching a tree of generated rationales. (PDF pp. 58–61, 87–91.)"
      },
      {
        "id": "knowledge-inside-the-reader",
        "title": "Where should external knowledge enter the reader?",
        "body": "Chapter 2 turns the broad reasoning survey into architectural choices. QA-GNN, the existing baseline used in the earlier message-passing experiments, jointly represents question–answer context and a relevant ConceptNet subgraph. Figure 2.2 shows the architecture, while Table 2.1 identifies the relevance, node-type, edge-type, and message representations used by its graph layers.\n\n{{visual:Figure 2.2}}\n\n{{visual:Table 2.1}}\n\nA context node connects the linguistic input to graph entities, and relevance scores help distinguish useful neighbours from incidental ones. The table makes clear that graph topology alone is insufficient: the model also needs typed relations and a question-conditioned notion of relevance. (PDF pp. 65–68.)\n\nEMAT chooses another insertion point. In Figure 2.3, question–answer encodings reside in key–value memory, with retrieval initiated from early Transformer representations and the results injected deeper in the encoder.\n\n{{visual:Figure 2.3}}\n\nThe useful precedent is representation reuse: intermediate states can support another computation instead of being discarded. The thesis later adopts this principle for intermediate reranking, not EMAT's question–answer memory itself. (PDF pp. 68–69, 93.)\n\nOREOLM makes knowledge interaction iterative through layers that guide contextualized walks over a graph. Figure 2.4 contrasts this differentiable interaction with a semantic-parser-based knowledge-base query.\n\n{{visual:Figure 2.4}}\n\nKnowledge is repeatedly aligned with the current language representation, rather than fetched once as an immutable block. The surrounding discussion of Onto-GPT, adapters, and semantic-role enrichment adds other ways to construct or integrate structured knowledge. These are alternative design families; they are not all modules installed in the thesis system. (PDF pp. 69–73.)"
      },
      {
        "id": "relations-and-multi-hop-clues",
        "title": "Relationships matter at several levels of granularity",
        "body": "Knowledge-enhanced natural-language inference provides a focused example of combining semantic similarity with relational information. Figure 2.5 presents KGNLI, which predicts entailment, contradiction, or neutrality from a premise and hypothesis using both text and graph representations.\n\n{{visual:Figure 2.5}}\n\nThe surveyed architecture models connections between subject, predicate, and object pairs. Its purpose is not simply to append more words, but to represent relationships that a text-only comparison might miss. Tables 2.2 and 2.3 give complementary evidence: a model comparison on SNLI and a component ablation on SciTail.\n\n{{visual:Table 2.2}}\n\n{{visual:Table 2.3}}\n\nKGNLI's reported SNLI accuracy is 88.9, compared with 87.5 for LSTM plus attention and 83.5 for BiMPM. On SciTail, retaining subjects, predicates, and objects reaches 84.3, above the partial-component configurations shown. These are results reproduced from prior research, not measurements of PubMed KG-FiD; they support the particular comparisons in the tables rather than a claim of universal superiority. (PDF pp. 73–76.)\n\nMulti-hop QA adds another difficulty: useful clues may live in separate paragraphs. Figure 2.6 shows KIFGraph's extraction, reasoning, and prediction pipeline.\n\n{{visual:Figure 2.6}}\n\nQuestion, paragraph, sentence, and entity clues form a hierarchy, with direct clues updated before indirect ones and masked attention suppressing noise. This contrasts with the thesis's later document-centred choice: retaining abstract-level context avoids reducing every biomedical question to isolated entity links, while still allowing relationships between documents to influence selection. (PDF pp. 76–78, 92–94.)"
      },
      {
        "id": "memory-and-document-links",
        "title": "Context can be retrieved, remembered, or learned across documents",
        "body": "Not all context augmentation requires an external repository. The Scratchpad mechanism reviewed in Chapter 2 lets a recurrent decoder modify encoder states as a form of memory. Figure 2.7 illustrates the recurrent updates.\n\n{{visual:Figure 2.7}}\n\nThis is an internal-state mechanism, distinct from using generated text as a visible scratchpad. The next part of the survey considers explicit intermediate tokens and contrasts post-context reasoning with notes produced while reading. Figure 2.8 shows Self-Notes' interleaving mechanism.\n\n{{visual:Figure 2.8}}\n\nSpecial start and end tokens let the model insert a note and then resume the input. The timing matters: intermediate information can influence processing before the entire context has been consumed. Figure 2.9 compares baseline, scratchpad, and Self-Notes behaviour across ToyStory, algorithmic, Boolean, and chess-piece tasks.\n\n{{visual:Figure 2.9}}\n\nThese examples illustrate the surveyed approach's range; they do not establish that the thesis system solves those tasks or that Self-Notes universally removes the Reversal Curse. The chapter also discusses the training burden of obtaining intermediate supervision and managing longer note-enriched contexts. (PDF pp. 78–83.)\n\nLinkBERT changes pretraining rather than the timing of notes. Figure 2.10 shows document pairs constructed using within-document context, random sampling, and links between documents.\n\n{{visual:Figure 2.10}}\n\nCombining masked-language modelling with document-relationship prediction encourages cross-document representations. This completes the conceptual path toward the thesis method: external passages need not be treated as independent search hits. Their connections can help determine which evidence reaches the answer generator. (PDF pp. 82–84, 93.)"
      },
      {
        "id": "pubmed-graph-and-two-stage-reader",
        "title": "The thesis method: a PubMed graph and a two-stage reader",
        "body": "Chapter 3 moves from surveyed algorithms to the thesis's biomedical application. Its starting point is existing KG-FiD, which already combines Fusion-in-Decoder with two-stage graph-based passage reranking. The contribution is the PubMed-oriented construction and adaptation, including different graph networks for the two stages—not the invention of retrieval, FiD, or KG-FiD. (PDF pp. 85–94.)\n\nThe first step is to expose structure that an abstract-only pipeline would ignore. Figure 3.1 shows the parsing categories: abstract, journal, authors, chemical terms, and MeSH information.\n\n{{visual:Figure 3.1}}\n\nAbstracts become document nodes, linked by shared metadata with relation classes. The chapter additionally describes biomedical named-entity processing, directed subject–object links, and mapping through UMLS and DDB. These metadata relationships provide contextual signals; co-authorship or shared chemicals should not be mistaken for entailment between two scientific claims. The graph-building discussion covers the 2022 PubMed repository, while the reported experiments use a 150K sample. (PDF pp. 86–87, 100.)\n\nFigure 3.2 brings retrieval, graph processing, and generation together. A frozen BGE encoder and FAISS similarity search retrieve candidate abstracts; a GAT reranker selects a smaller set before T5 encoding; a ReFactor reranker prunes again using intermediate reader representations.\n\n{{visual:Figure 3.2}}\n\nThe two stages answer progressively more contextual questions. Stage one starts from precomputed passage vectors and scores graph-updated documents against the query vector. Stage two starts from the first-token representations of question–passage pairs inside the reader. The selected passages continue through the remaining encoder layers and are fused for decoding. Keeping retrieval fixed means these learned reranking operations do not require changing the searchable embedding space.\n\nThe mixed-GNN choice follows the earlier connectivity argument: GAT handles the initial retrieved neighbourhood, while ReFactor is intended to remain useful after pruning makes that neighbourhood sparser. Training combines answer-generation loss with two reranking losses. MedMCQA provides no gold passage-relevance labels, so the thesis derives surrogate targets from similarity between the correct answer and retrieved documents. This answer-conditioned supervision is a proxy for relevance, not expert verification of supporting evidence. (PDF pp. 88–94.)"
      },
      {
        "id": "what-the-dataset-measures",
        "title": "The dataset defines the limits of the experiment",
        "body": "MedMCQA supplies questions, answer choices, explanations, and subject metadata. The thesis retains single-choice instances: 120,765 examples, reported as 66.1% of the original training split. Because the official test split lacks labels, the original validation split becomes the experimental test set, and 20% of training data is reserved for validation. This is not evaluation against the hidden official test labels. (PDF p. 94.)\n\nTable 3.1 records question and answer token lengths by correct-option label; Figure 3.3 shows subject coverage.\n\n{{visual:Table 3.1}}\n\n{{visual:Figure 3.3}}\n\nAnswers are short—roughly six to seven tokens on average in the listed groups—while questions span multiple medical subjects. That combination matters when reading the later matching metrics: diverse subject matter does not make token-level matching equivalent to medical competence.\n\nFigures 3.4 and 3.5 examine two potential shortcuts: correct-option frequency and question length by answer label.\n\n{{visual:Figure 3.4}}\n\n{{visual:Figure 3.5}}\n\nThe frequencies are not uniform: option A accounts for 31.47% of training examples and D for 17.74%. The thesis describes the distribution as sufficiently balanced to avoid extra preprocessing, but these plots cannot establish the absence of dataset bias. Likewise, character-length differences are descriptive, not a causal test of shortcut learning. (PDF pp. 94–96.)\n\nFigure 3.6 shows the fields of an individual record, including its explanation and topic.\n\n{{visual:Figure 3.6}}\n\nIts role here is to illustrate the record structure, not provide clinical guidance: the displayed question asks for an investigation, whereas its options and explanation concern disease causes. The thesis uses the question–answer fields rather than training a separately evaluated explanation generator. Keeping those distinctions visible prevents the dataset's available annotations from being mistaken for capabilities actually tested. (PDF pp. 94–97.)"
      },
      {
        "id": "experimental-contract",
        "title": "The experimental contract: short-answer generation on one GPU",
        "body": "The evaluation treats multiple-choice QA as text generation, not conventional option classification. Chapter 4 reports Match Acc and Match F1-Macro based on predicted tokens and their order relative to the reference answer. Those names must stay attached to the numbers: a Match Acc near 95 is not a claim of 95% standard MedMCQA answer-choice accuracy. Carburacy supplies a carbon-aware performance measure alongside them. (PDF pp. 99, 105.)\n\nTable 4.1 anchors the experiments in a small, specified configuration rather than an unspecified large language model.\n\n{{visual:Table 4.1}}\n\nThe reader is t5-small with six encoder layers, and the frozen retrieval encoder is BAAI/bge-base-en-v1.5. The passage pipeline narrows from 20 retrieved documents to 12 after the first reranker and five after the second. Training uses one epoch, batch size two, seed 42, and a 0.2 reranking-loss weight. Runs use a 24GB RTX 3090, with Weights & Biases tracking and CodeCarbon monitoring. The source provides neither a repeated-seed uncertainty analysis nor a clinical validation study; conclusions belong to this experimental setting. (PDF pp. 99–105.)"
      },
      {
        "id": "what-the-ablations-show",
        "title": "Reranking helps modestly; replacing reader states hurts substantially",
        "body": "One ablation asks whether graph representations should only select passages or also replace the representations passed to later T5 layers. Table 4.2 compares that choice across prompt and '/w Answer' settings. Its caption discusses reranking position, but its row variables and the surrounding section identify an input-representation experiment.\n\n{{visual:Table 4.2}}\n\nWith neither prompt nor appended answer, feeding GNN encodings onward gives 88.67 Match Acc and 82.81 Match F1-Macro, versus 95.42 and 92.76 when the reader's own selected encodings continue. The same broad gap appears across the other settings. The thesis interprets this as disruption of pretrained inter-layer representations under short fine-tuning. Direct GNN-state reuse improves training and total Carburacy, but lowers test Carburacy and substantially reduces **matching quality**. (PDF pp. 101–102.)\n\nTable 4.3 then compares reranking against no reranking, with the second reranker placed at encoder position three.\n\n{{visual:Table 4.3}}\n\nReranking improves both matching measures in every corresponding input configuration shown. With prompt and '/w Answer' enabled, the reported values are 95.43 Match Acc and 92.77 Match F1-Macro, compared with 95.17 and 92.36 without reranking. These are modest numerical gains, and the table does not establish statistical significance. The source describes '/w Answer' as appending answers to questions without clearly documenting here whether that means answer choices or the gold answer. The article preserves the setting label rather than resolving that ambiguity by assumption. (PDF pp. 101–103.)\n\nTable 4.4 is essential to interpreting both quality and cost: its baseline retrieves five passages, while the reranking system initially retrieves 20.\n\n{{visual:Table 4.4}}\n\nThus the comparison changes the **candidate budget** as well as adding reranking. Parameter counts rise from 83.6M to 89.4M, and average Carburacy falls from 0.467 to 0.399. These scores describe a carbon-aware trade-off, not kilograms of emissions. The experiment supports the usefulness of this wider-search-and-rerank configuration, but does not isolate a same-budget reranker's causal effect. (PDF p. 103.)"
      },
      {
        "id": "when-to-prune",
        "title": "When to prune is a quality–cost decision",
        "body": "A final ablation varies the position of the intermediate reranker while keeping the overall architecture recognizable. Early pruning means fewer passages traverse the remaining encoder layers; later pruning lets more passages receive deeper contextual processing. Table 4.5 makes that trade-off measurable.\n\n{{visual:Table 4.5}}\n\nAt positions two, three, and four, Match Acc is respectively 95.40, 95.41, and 95.43; Match F1-Macro is 92.75, 92.76, and 92.79. Total Carburacy moves in the opposite direction: 0.491, 0.436, and 0.321. The quality differences are small, while the carbon-aware score is more sensitive to the extra computation.\n\nThere is therefore no single winning configuration independent of priorities. A reader optimized for matching quality can retain more context longer; a resource-constrained deployment can prune earlier. The thesis's complexity discussion motivates that decision, but these measured settings—not a general promise that graphs make generation cheaper—define the supported result. (PDF pp. 93, 104–105.)"
      },
      {
        "id": "traceability-not-proof",
        "title": "Traceability is the outcome—not a proof of clinical reasoning",
        "body": "The thesis arrives at a narrower, more useful conclusion than 'knowledge graphs solve reasoning.' Existing retrieval and graph techniques can be assembled so that a fixed search system supplies a broader candidate set, document relationships guide selection, and only selected passages consume the full reader budget. The biomedical adaptation and its ablations show where that design helps and where additional structure interferes with pretrained representations. (PDF pp. 85–94, 101–107.)\n\nIts interpretability benefit is source traceability: predictions are accompanied by a ranked set of candidate documents. That makes evidence available for inspection, but does not expose the exact neural computation or guarantee that the answer is entailed by those documents. Chapter 5 explicitly retains concerns about hallucination, incomplete sources, bias, and computational cost. It also states that the system must not substitute for diagnosis by qualified healthcare professionals. (PDF pp. 107–109.)\n\nRead in that light, the long background survey and the small-model experiment tell one story: knowledge enhancement is a set of choices about representation, evidence selection, and computational budget. Evaluating those choices requires keeping answer matching, factual support, and explainability separate.\n\nSource: [MSc thesis, Knowledge-Enhanced Neural Models for Question Answering based on Retrieval](https://amslaurea.unibo.it/id/eprint/30058/). Page references throughout this article are physical, one-based PDF pages from the supplied 122-page version."
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
