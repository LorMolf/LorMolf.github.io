"""Import reviewed narratives without publishing private evidence notes.
Run: python scripts/import-narratives.py ../all-visuals/narrative-review
"""
import json
import re
import subprocess
import sys
from pathlib import Path

root = Path(__file__).resolve().parents[1]
review = Path(sys.argv[1])
data = json.loads(subprocess.check_output(['node', '--input-type=module', '-e',
    'import * as d from "./data/publications.js"; console.log(JSON.stringify(d))'], cwd=root))
report = []
for paper in data['publications']:
    pid = paper['id']
    doc = json.loads((review / f'{pid}.json').read_text())
    manifest = json.loads((review.parent / f'{pid}.json').read_text())
    assert doc['id'] == pid and doc['evidence'], (pid, 'Missing evidence')
    main, appendix = doc['mainLabels'], doc['selectedAppendixLabels']
    parent_coverage = json.loads((review / 'parent-main-coverage.json').read_text())
    assert set(main) == set(parent_coverage[pid]['mainLabels']), (pid, 'Independent main-body audit disagrees')
    included = main + appendix
    omitted = [entry['label'] for entry in doc['omitted']]
    assert all(entry['reason'].strip() for entry in doc['omitted'])
    all_labels = {item['label'] for item in manifest['items']}
    assert len(included + omitted) == len(set(included + omitted)), (pid, 'Repeated classification')
    assert set(included + omitted) == all_labels, (pid, 'Unclassified visual')
    sections = doc['sections']
    assert len({s['id'] for s in sections}) == len(sections)
    assert all(re.fullmatch('[a-z][a-z0-9-]*', s['id']) and s['id'] not in ['abstract', 'citation', 'visuals'] for s in sections)
    found = []
    for section in sections:
        body = section['body']
        assert section['title'].strip() and body.strip()
        assert not any(c in body for c in '\t\r\b\f')
        assert not re.search(r'<(?:details|summary|img)\b|!\[', body), (pid, 'Legacy or collapsible visual')
        tokens = re.findall(r'^\{\{visual:([^}\n]+)\}\}$', body, flags=re.M)
        assert body.count('{{visual:') == len(tokens), (pid, 'Malformed visual reference')
        found.extend(tokens)
    assert len(found) == len(set(found)) and set(found) == set(included), (pid, 'Narrative coverage mismatch')
    paper['sections'] = sections
    paper['visualSelection'] = {'main': main, 'appendix': appendix}
    report.append({'id': pid, 'main': len(main), 'appendix': len(appendix), 'omitted': len(omitted), 'sections': len(sections)})
assert len(report) == 11
# Preserve all exported metadata values; only sections and selection are changed.
output = '\n\n'.join('export const ' + key + ' = ' + json.dumps(data[key], ensure_ascii=False, indent=2) + ';'
    for key in ['me', 'venueLinks', 'publications']) + '\n'
(root / 'data/publications.js').write_text(output)
print(json.dumps(report, indent=2))
