"""Every number quoted on the SPSD page must match the current manuscript.

Run: python scripts/check-spsd-numbers.py
Fails if the page drifts from arXiv main.tex Table 1 or the Figure 3 CSV.
Needs the Overleaf manuscript clone; skips (exit 0) where it is absent.
"""
import json
import re
import subprocess
import sys
from decimal import Decimal, ROUND_HALF_UP
from pathlib import Path

SITE = Path(__file__).resolve().parents[1]
OVERLEAF = Path.home() / 'GitHub/combinatorial_reasoning_post_training/neurips_paper/6981d0d068d354aab59b0496'

if not (OVERLEAF / '.git').exists():
    print(f'SKIP: manuscript clone not found at {OVERLEAF}')
    sys.exit(0)

# The manuscript rounds half-up; Python's round() is banker's rounding.
r1 = lambda x: float(Decimal(str(x)).quantize(Decimal('0.1'), rounding=ROUND_HALF_UP))
assert r1(39.15) == 39.2 and r1(36.55) == 36.6

page = json.loads(subprocess.check_output(
    ['node', '--input-type=module', '-e',
     'import {publications} from "./data/publications.js";'
     ' const p=publications.find(x=>x.id==="spsd");'
     ' console.log(JSON.stringify({sections:p.sections, abstract:p.abstract}))'], cwd=SITE))
text = '\n'.join(s['body'] for s in page['sections'])


def paper_abstract():
    """The abstract as the manuscript states it, with LaTeX markup stripped."""
    tex = subprocess.check_output(
        ['git', 'show', 'origin/master:arxiv/main.tex'], cwd=OVERLEAF).decode()
    body = tex.split(r'\begin{abstract}')[1].split(r'\end{abstract}')[0]
    joined = ' '.join(l for l in body.splitlines() if l.strip() and l.strip() != '%')
    joined = (joined.replace(r'\SPSD\ ', 'SPSD ').replace(r'\SPSD', 'SPSD')
                    .replace(r'\%', '%').replace('\\ ', ' '))
    return re.sub(r'\s+', ' ', joined).strip()


assert page['abstract'] == paper_abstract(), 'page abstract has drifted from the manuscript'

# arXiv main.tex Table 1, transcribed from origin/master
TABLE1 = {
    ('4B', 'base'): dict(math=24.1, fide=15.0, legal=65.0, win=15.0),
    ('4B', 'sft'):  dict(math=30.3, fide=19.9, legal=34.9, win=20.0),
    ('4B', 'rule'): dict(math=33.9, fide=35.1, legal=70.1, win=35.0, olympiad=35.7),
    ('4B', 'opsd'): dict(math=36.6, fide=39.9, legal=75.1, win=45.0, olympiad=35.1),
    ('8B-think', 'opsd'): dict(fide=59.5, win=62.7),
}

csv = subprocess.check_output(
    ['git', 'show', 'origin/master:arxiv/figures/training_progress/qwen3_4b_training_progress.csv'],
    cwd=OVERLEAF).decode()
curve = {}
for line in csv.strip().splitlines()[1:]:
    step, series, _method, math, fide, legal = line.split(',')
    curve[(int(step), int(series))] = (float(math), float(fide), float(legal))
SFT, BASE, VARIANTS = 1, 2, 4

sft100, sft1000 = curve[(100, SFT)], curve[(1000, SFT)]
base1000, var1000 = curve[(1000, BASE)], curve[(1000, VARIANTS)]

CHECKS = [
    ('15% to 45%', TABLE1[('4B', 'base')]['win'] == 15.0 and TABLE1[('4B', 'opsd')]['win'] == 45.0),
    ('15.0 to 39.9', TABLE1[('4B', 'opsd')]['fide'] == 39.9),
    ('75.1% of evaluated positions', TABLE1[('4B', 'opsd')]['legal'] == 75.1),
    ('24.1 to 36.6', TABLE1[('4B', 'opsd')]['math'] == 36.6),
    ('mathematics mean of 30.3', TABLE1[('4B', 'sft')]['math'] == 30.3),
    ('legality falls to 34.9%', TABLE1[('4B', 'sft')]['legal'] == 34.9),
    ('59.5 FIDE and 62.7% wins',
     TABLE1[('8B-think', 'opsd')]['fide'] == 59.5 and TABLE1[('8B-think', 'opsd')]['win'] == 62.7),
    ('35% to 45% over RuleBot-Distill', TABLE1[('4B', 'rule')]['win'] == 35.0),
    ('33.9 to 36.6', TABLE1[('4B', 'rule')]['math'] == 33.9),
    ('35.7 against 35.1',
     TABLE1[('4B', 'rule')]['olympiad'] == 35.7 and TABLE1[('4B', 'opsd')]['olympiad'] == 35.1),
    ('30.3 at step 100', r1(sft100[0]) == 30.3),
    ('23.1 by step 1000', r1(sft1000[0]) == 23.1),
    ('34.9% to 25.0%', r1(sft100[2]) == 34.9 and r1(sft1000[2]) == 25.0),
    ('42.4 FIDE, 77.3% legality, and a mathematics mean of 39.2',
     (r1(var1000[1]), r1(var1000[2]), r1(var1000[0])) == (42.4, 77.3, 39.2)),
    ('39.9, 75.1%, and 36.6 for the base curriculum',
     (r1(base1000[1]), r1(base1000[2]), r1(base1000[0])) == (39.9, 75.1, 36.6)),
]
for phrase, matches_source in CHECKS:
    assert phrase in text, f'phrase missing from page prose: {phrase}'
    assert matches_source, f'page value contradicts the manuscript: {phrase}'

# "leads at every evaluated checkpoint" must hold on all three metrics
for step in (100, 250, 500, 750, 1000):
    variants, base = curve[(step, VARIANTS)], curve[(step, BASE)]
    assert all(v > b for v, b in zip(variants, base)), (step, variants, base)

# claims superseded by the revision, and projected cells that must not be quoted
for stale in ['36.3', '6.8', '59.4', '62.3', '19.2', 'peaks before the end']:
    assert stale not in text, f'superseded claim still on the page: {stale}'
for projected in ['53.7', '15.6', '30.6', '16.4']:
    assert projected not in text, f'projected value quoted as measured: {projected}'

print(f'OK: {len(CHECKS)} quoted values match the manuscript, '
      'variants lead at all 5 checkpoints, no stale or projected values')
