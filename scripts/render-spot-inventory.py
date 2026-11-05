#!/usr/bin/env python3
"""Render a private, read-only work list from the audited public catalogue."""
import argparse
import html
import json
from pathlib import Path

parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument('--input', required=True)
parser.add_argument('--output', required=True)
args = parser.parse_args()
report = json.loads(Path(args.input).read_text())
patches = json.loads(Path('src/data/spot-completion-patches.json').read_text())
notes = json.loads(Path('src/data/spot-research-notes.json').read_text())
patch_by_id = {p['id']: p for p in patches}
notes_by_id = {sid: note for note in notes for sid in note['ids']}
labels = {'description': 'Description', 'access': 'Accès et restrictions', 'hazards': 'Risques', 'directions': 'Orientations', 'season': 'Saison', 'windRange': 'Plage de vent'}
statuses = {'MISSING': 'Sources à compléter', 'DOCUMENTED': 'Profil documenté', 'NEEDS_REVIEW': 'À vérifier', 'EXPIRED': 'Revue expirée', 'CHANGED': 'Fiche modifiée', 'CLOSED': 'Accès fermé'}
esc = html.escape
rows = []
for spot in report['spots']:
    missing = spot['missing']
    patch = patch_by_id.get(spot['id'])
    note = notes_by_id.get(spot['id'])
    sources = spot['sources'][:]
    if patch: sources += [patch['source']] + patch.get('additionalSources', [])
    if note:
        sources += [{'title': 'Source de recherche', 'url': url} for url in note['sources']]
    unique_sources = {s['url']: s for s in reversed(sources)}
    links = ''.join(f'<li><a href="{esc(s["url"], quote=True)}" target="_blank" rel="noopener">{esc(s.get("title", "Source"))}</a></li>' for s in reversed(list(unique_sources.values())))
    detail = ''.join(f'<dt>{esc(label)}</dt><dd>{esc(spot.get(key) or "À compléter")}</dd>' for key, label in [('description', 'Description actuelle'), ('difficulty', 'Niveau actuel'), ('access', 'Accès actuels'), ('hazards', 'Risques actuels')])
    if patch:
        for key, label in [('description', 'Description préparée'), ('difficulty', 'Niveau préparé'), ('access', 'Accès préparés'), ('hazards', 'Risques préparés'), ('bestMonths', 'Mois préparés'), ('bestWindDirections', 'Orientations préparées')]:
            if key in patch['fields']:
                value = patch['fields'][key]
                detail += f'<dt>{esc(label)} — non appliqué</dt><dd>{esc(", ".join(value) if isinstance(value, list) else value)}</dd>'
        if patch.get('reason'): detail += f'<dt>Motif du complément</dt><dd>{esc(patch["reason"])}</dd>'
        if patch.get('review'): detail += f'<dt>Profil préparé</dt><dd>{esc(statuses.get(patch["review"]["status"], patch["review"]["status"]))}</dd>'
    if note: detail += f'<dt>{esc(note["topic"])}</dt><dd>{esc(note["note"])}</dd>'
    chips = ''.join(f'<span class="chip">{esc(labels[k])}</span>' for k in missing) or '<span class="ok">Champs présents</span>'
    search = f'{spot["name"]} {spot["country"]} {spot["sportType"]} '.lower()
    rows.append(f'''<article data-search="{esc(search, quote=True)}" data-missing="{int(bool(missing))}" data-review="{int(spot['reviewStatus'] != 'DOCUMENTED')}" data-prepared="{int(bool(patch))}">
    <div class="head"><div><h2>{esc(spot['name'])}</h2><p>{esc(spot['country'] or 'Pays à préciser')} · {esc(spot['sportType'])}</p></div><a href="http://localhost:3001/fr/spots/{esc(spot['id'], quote=True)}" target="_blank" rel="noopener">Fiche ↗</a></div>
    <div>{chips}</div><p class="status">{esc(statuses.get(spot['reviewStatus'], spot['reviewStatus']))}{' · Complément sourcé préparé' if patch else ''}</p>
    <details><summary>Informations, sources et travail restant</summary><dl>{detail}<dt>Mois déjà renseignés</dt><dd>{esc(', '.join(spot['bestMonths']) or 'À préciser selon les conditions locales')}</dd><dt>Orientations</dt><dd>{esc(', '.join(spot['bestWindDirections']) or 'À compléter')}</dd></dl><ul>{links}</ul><a href="http://localhost:3001/fr/admin/planner?q={esc(spot['id'], quote=True)}" target="_blank" rel="noopener">Ouvrir la revue administrative ↗</a></details></article>''')
summary = report['summary']
page = '''<!doctype html><html lang="fr"><meta charset="utf-8"><meta name="viewport" content="width=device-width"><meta name="robots" content="noindex,nofollow"><title>Openwind — inventaire des spots</title><style>
*{box-sizing:border-box}body{font:15px/1.6 system-ui;color:#172033;background:#f6f8fa;margin:0}main{max-width:1120px;margin:auto;padding:36px 24px}h1{font-size:clamp(28px,5vw,40px);line-height:1.15;letter-spacing:-.04em;margin:12px 0}h2{font-size:19px;margin:0}p{color:#566579;margin:8px 0}.intro{max-width:800px}.stats{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin:28px 0}.stats div,article{background:white;border:1px solid #dce3e9;border-radius:16px;padding:20px}.stats strong{display:block;font-size:30px;color:#172033}.filters{position:sticky;top:0;z-index:1;background:#f6f8faf5;padding:14px 0;display:flex;gap:12px;flex-wrap:wrap}input,select{font:inherit;color:inherit;border:1px solid #cbd5df;border-radius:10px;background:white;padding:12px;min-height:48px}input{flex:1;min-width:220px}input:focus,select:focus{outline:2px solid #64748b;outline-offset:2px}#list{display:grid;gap:14px}.head{display:flex;justify-content:space-between;gap:20px}.head a,summary{min-height:44px;display:flex;align-items:center}a{color:#204c66;text-underline-offset:3px}summary{cursor:pointer;font-weight:600}.chip{display:inline-block;border-radius:7px;background:#fff1dc;color:#775018;font-size:12px;padding:3px 8px;margin:3px 3px 0 0}.ok{color:#366054;font-size:13px}.status{font-size:13px}dt{font-weight:600;margin-top:12px}dd{margin:4px 0;white-space:pre-line;color:#566579}li{overflow-wrap:anywhere}[hidden]{display:none!important}.notice{padding:16px;border-left:3px solid #7e96a6;background:#edf3f7;margin:24px 0}@media(max-width:600px){main{padding:20px 16px}.stats{grid-template-columns:repeat(2,1fr)}article{padding:16px}.head{gap:12px}.head a{white-space:nowrap}}
</style><main><p>OPENWIND · INVENTAIRE DU 4 NOVEMBRE 2026</p><h1>Compléter chaque spot, avec des sources.</h1><p class="intro">Les champs présents et la vérification des sources sont suivis séparément. Cette liste couvre tout le catalogue. Elle ne certifie pas les conditions de pratique.</p>'''
page += f'<div class="stats"><div><strong>{summary["total"]}</strong>spots analysés</div><div><strong>{summary["withInformationIssues"]}</strong>fiches avec des lacunes</div><div><strong>{summary["reviewStatuses"].get("DOCUMENTED", 0)}</strong>profils documentés actuels</div><div><strong>{len(patches)}</strong>compléments sourcés préparés</div></div>'
page += '<div class="notice">Aucune écriture en base ni publication. Les compléments restent à appliquer après validation. Les autres fiches sont conservées et leurs lacunes restent visibles dans cet inventaire. Les mois anciens en français, anglais, allemand ou italien sont reconnus pour éviter de les compter comme des informations absentes.</div>'
page += '<div class="filters"><input id="search" type="search" aria-label="Rechercher un spot ou un pays" placeholder="Spot, pays ou activité…"><select id="filter" aria-label="Travail à afficher"><option value="all">Tous les spots</option><option value="missing">Informations à compléter</option><option value="review">Sources à vérifier</option><option value="prepared">Compléments préparés</option></select></div><p id="count" role="status"></p><section id="list">'
page += ''.join(rows) + '''</section><script>
const search=document.getElementById('search'),filter=document.getElementById('filter'),cards=[...document.querySelectorAll('article')];const normalize=s=>s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();function update(){const q=normalize(search.value);let count=0;for(const card of cards){const show=normalize(card.dataset.search).includes(q)&&(filter.value==='all'||card.dataset[filter.value]==='1');card.hidden=!show;if(show)count++;}document.getElementById('count').textContent=count+' spots affichés sur '+cards.length;}search.addEventListener('input',update);filter.addEventListener('change',update);update();</script></main></html>'''
Path(args.output).write_text(page)
print(f'{len(rows)} spots rendered; {len(patches)} prepared completions. No database changes.')
