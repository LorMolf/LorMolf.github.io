"""Browser regression check. Run with uv run --with playwright python scripts/check-site.py.
Serve the repository on port 8766 first. No test dependencies are shipped to visitors.
"""
import argparse
import json
from pathlib import Path
from urllib.parse import urljoin, urlparse
from playwright.sync_api import sync_playwright

parser = argparse.ArgumentParser()
parser.add_argument('--base', default='http://127.0.0.1:8766/')
parser.add_argument('--artifacts', default='/tmp/lormolf-site-check')
args = parser.parse_args()
base = args.base.rstrip('/') + '/'
out = Path(args.artifacts)
out.mkdir(parents=True, exist_ok=True)
report = {'base': base, 'pages': [], 'internal_links': [], 'errors': []}
with sync_playwright() as pw:
    chrome = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
    browser = pw.chromium.launch(headless=True, **({'executable_path': chrome} if Path(chrome).exists() else {}))
    context = browser.new_context(permissions=['clipboard-read', 'clipboard-write'])
    page = context.new_page()
    page.on('pageerror', lambda e: report['errors'].append(str(e)))
    page.goto(base)
    pubs = page.evaluate("async () => (await import('/data/publications.js')).publications")
    catalog = page.evaluate("async () => (await import('/data/paper-visuals.js')).paperVisuals")
    assert set(catalog) == {p['id'] for p in pubs}, 'Missing paper inventory'
    assert len({p['id'] for p in pubs}) == len(pubs), 'Duplicate publication IDs'
    assert all(p.get('tldr') and p.get('abstract') and p.get('sections') for p in pubs), 'Missing descriptions'
    assert all(s.get('body', '').strip() for p in pubs for s in p['sections']), 'Empty article sections'
    assert all(not any(c in s['body'] for c in '\t\r\b\f') for p in pubs for s in p['sections']), 'Corrupted LaTeX string escaping'
    spsd = next(p for p in pubs if p['id'] == 'spsd')
    assert spsd['type'] == 'submitted' and spsd['venue'] == 'Submitted to TACL'
    assert len(spsd['authors'].split(', ')) == 8 and not spsd.get('links'), 'Do not link private submission files'
    routes = ['/', '/publications/', '/cv/'] + [f"/publications/{p['id']}/" for p in pubs]
    internal = set(routes)
    for route in routes:
        response = page.goto(urljoin(base, route), wait_until='networkidle')
        assert response.status == 200, (route, response.status)
        page.locator('.nav-name').wait_for()
        page.evaluate('document.fonts.ready')
        assert page.locator('.nav-links a').count() == 5
        assert page.locator('.nav-links a > svg[aria-hidden="true"]').count() == 5
        assert page.locator('#theme-toggle').get_attribute('aria-label')
        assert page.locator('.nav-items .active').count() == 1
        assert page.locator('.authortag').count() == 0, (route, 'Author-role badges remain')
        assert page.locator('.nav-foot').evaluate('(e) => getComputedStyle(e, "::after").content') in ['none', 'normal'], 'Decorative swatches remain'
        if route == '/':
            assert page.locator('.pub-item').count() == sum(bool(p.get('selected')) for p in pubs)
            assert page.locator('.pub-item .pt').first.get_attribute('href') == '/publications/spsd/'
            assert page.locator('.status-item .out').all_text_contents() == ['finishing my PhD at the end of October.', 'at home in Puglia.']
            assert page.locator('.status-item .out').evaluate_all('(nodes) => nodes.every(e => getComputedStyle(e).fontFamily.includes("Computer Modern Typewriter"))')
            assert page.locator('.status .cur').evaluate('(e) => getComputedStyle(e).display === "inline-block" && getComputedStyle(e).animationName === "blink"')
            assert page.locator('.research-lead').evaluate('(e) => getComputedStyle(e).maxWidth === "none" && !e.querySelector("br")')
            image = page.locator('.photo-frame img')
            assert image.evaluate('(i) => i.complete && i.naturalWidth === 700')
            assert image.evaluate('(i) => getComputedStyle(i).filter') == 'grayscale(1)'
            assert '[ B/W portrait ]' not in page.locator('body').inner_text()
            assert 'six-month research visit' in page.locator('.bio').inner_text()
            assert '30 January to 30 July 2026' in page.locator('.bio').inner_text()
            page.locator('#more-btn').click()
            assert page.locator('.research-item').count() == 5
            topics = page.locator('.research').inner_text().lower()
            assert not any(term in topics for term in ['neuro-symbolic', 'nesy', 'ports', 'feast', 'comma', 'spsd', 'graph-of-mark', 'mixture of masters', 'sycophants'])
            page.locator('#more-btn').click()
            assert page.locator('.research-item').count() == 3
        elif route == '/publications/':
            assert page.locator('.pub-item .pt').first.get_attribute('href') == '/publications/spsd/'
            for kind in ['conference', 'journal', 'preprint', 'submitted', 'thesis', 'all']:
                page.locator(f'[data-f="{kind}"]').click()
                expected = len(pubs) if kind == 'all' else sum(p['type'] == kind for p in pubs)
                assert page.locator('.pub-item').count() == expected, kind
                assert page.locator('.pub-description').count() == expected
        elif route.startswith('/publications/'):
            p = next(p for p in pubs if route == f"/publications/{p['id']}/")
            page.wait_for_function("Array.from(document.querySelectorAll('.paper-body')).every(e => e.textContent.trim().length > 0)")
            assert page.locator('.paper-title').inner_text() == p['title']
            assert page.locator('.paper-abs').inner_text() == p['abstract']
            assert page.locator('meta[name="description"]').get_attribute('content') == p['tldr']
            assert page.locator('.katex-error').count() == 0, (route, 'KaTeX error')
            assert page.locator('.paper-body figure, .paper-body table').count() > 0, (route, 'Missing substantive visuals')
            assert page.locator('.paper-body figure').evaluate_all('(figs) => figs.every(f => f.querySelector("figcaption")?.textContent.trim() && f.querySelector("a[href] > img"))'), (route, 'Missing figure caption or full-resolution link')
            visual_data = catalog[p['id']]
            for kind, key in [('figure', 'figures'), ('table', 'tables')]:
                actual = page.locator(f'.source-visual[data-kind="{kind}"]').evaluate_all('(figs) => figs.map(f => f.dataset.label).filter(s => !s.toLowerCase().includes("continued"))')
                assert len(actual) == len(set(actual)) and set(actual) == set(visual_data['expected'][key]), (route, key, 'Incomplete source coverage')
            page.locator('.paper-visuals summary').click()
            assert page.locator('.paper-visuals').get_attribute('open') is not None
            page.locator('.source-visual img').evaluate_all('(images) => images.forEach(i => i.loading = "eager")')
            page.wait_for_function('Array.from(document.images).every(i => i.complete && i.naturalWidth > 0)')
            if any('$' in s['body'] for s in p['sections']):
                assert page.locator('.katex').count() > 0, (route, 'Math not rendered')
                assert page.locator('.math-source').evaluate_all('(nodes) => nodes.every(n => n.querySelector(".katex"))'), (route, 'Unrendered equation')
            for anchor in page.locator('.paper-anchors a').all():
                assert page.locator(anchor.get_attribute('href')).count() == 1
            page.locator('#copy-bib').click()
            assert page.evaluate('navigator.clipboard.readText()') == page.locator('#bib').inner_text()
            if p['id'] == 'spsd':
                assert page.locator('#bib').inner_text().startswith('@unpublished{')
        assert page.locator('img').evaluate_all('(images) => images.every(i => i.complete && i.naturalWidth > 0)'), (route, 'Broken image')
        internal.update(page.locator('a[href^="/"]').evaluate_all('(links) => links.map(a => new URL(a.href).pathname)'))
        checks = []
        for width in [1360, 900, 768, 390, 320]:
            page.set_viewport_size({'width': width, 'height': 900})
            for theme in ['light', 'dark']:
                page.evaluate('(t) => {document.documentElement.dataset.theme=t;window.scrollTo(0,0)}', theme)
                assert page.evaluate('document.documentElement.scrollWidth <= innerWidth'), (route, width, theme, 'Horizontal overflow')
                assert page.locator('.paper-body td').evaluate_all('(cells) => cells.every(c => getComputedStyle(c).whiteSpace === "nowrap")'), (route, width, theme, 'Table values may split across lines')
                assert page.locator('.paper-body figure img').evaluate_all('''(images) => images.every(i => {
                    const r = i.getBoundingClientRect();
                    return r.width <= Math.min(i.naturalWidth, 640) + 2 && r.height <= 480 + 2 &&
                        Math.abs((r.width - 2) / (r.height - 2) - i.naturalWidth / i.naturalHeight) < .05;
                })'''), (route, width, theme, 'Oversized or distorted figure')
                if theme == 'light':
                    assert page.locator('.status-item, .research-item, .pub-item, .news-list, .paper-body figure').evaluate_all('(cards) => cards.every(e => getComputedStyle(e).backgroundColor === "rgb(255, 255, 255)")'), (route, width, 'Cards are not white')
                if width > 860:
                    assert page.locator('#nav').bounding_box()['x'] > page.locator('#content').bounding_box()['x']
                checks.append({'width': width, 'theme': theme})
                if width in [1360, 390]:
                    slug = route.strip('/').replace('/', '-') or 'home'
                    page.screenshot(path=str(out / f'{slug}-{theme}-{width}.png'), full_page=True)
        page.locator('#theme-toggle').click()
        assert page.locator('html').get_attribute('data-theme') == 'light'
        page.reload(wait_until='networkidle')
        assert page.locator('html').get_attribute('data-theme') == 'light'
        page.emulate_media(reduced_motion='reduce')
        assert page.locator('#theme-toggle').evaluate('(b) => getComputedStyle(b).transitionDuration') == '0s'
        if route == '/':
            assert page.locator('.status .cur').evaluate('(e) => getComputedStyle(e).animationName') == 'none'
        page.emulate_media(reduced_motion='no-preference')
        report['pages'].append({'route': route, 'viewports': checks, 'passed': True})
        (out / 'verification.json').write_text(json.dumps(report, indent=2))
    for route in sorted(internal):
        response = context.request.get(urljoin(base, route))
        assert response.status == 200, ('Internal link', route, response.status)
        report['internal_links'].append(route)
    sitemap = context.request.get(urljoin(base, '/sitemap.xml')).text()
    assert all(f'/publications/{p["id"]}/' in sitemap for p in pubs)
    assert not report['errors'], report['errors']
    browser.close()
report.update(publications=len(pubs), passed=True)
(out / 'verification.json').write_text(json.dumps(report, indent=2))
print(json.dumps({'publications':len(pubs), 'pages':len(report['pages']), 'viewport_theme_checks':sum(len(p['viewports']) for p in report['pages']), 'internal_links':len(report['internal_links']), 'errors':report['errors'], 'report':str(out/'verification.json')}, indent=2))
