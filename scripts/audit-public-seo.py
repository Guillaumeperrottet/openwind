#!/usr/bin/env python3
"""Read-only audit of the HTML actually served, not just metadata source code."""
import argparse
import concurrent.futures
import html
import json
import re
import time
import urllib.request
import urllib.error
import urllib.robotparser
from html.parser import HTMLParser
from pathlib import Path

SITE = "https://www.openwind.ch"
CASES = [
    ("/fr/explorer", True, "CollectionPage", 5),
    ("/fr/vent-en-direct/lac-de-la-gruyere", True, "Article", 4),
    ("/fr/spots/cmnq613tx00it04kw1d0vraq4", True, "Place", 5),
    ("/fr/stations/PRE", True, "WebPage", 5),
    ("/fr/webcams", True, None, 5),
    ("/fr/webcams?q=gruyere", False, None, 5),
    ("/fr/recherche?q=Morlon", False, None, 0),
    ("/fr/forum/le-projet-openwind", True, "CollectionPage", 0),
    ("/fr/forum/le-projet-openwind/cmnpv4nkt0000pdf6mbdsccuj", True, "DiscussionForumPosting", 0),
]

WATER_CASES = [("/fr/temperatures", True, "CollectionPage", 5), *[(f"/{lang}/lacs/gruyere", True, "WebPage", 5) for lang in ("fr", "en", "de", "it")]]

class Document(HTMLParser):
    def __init__(self):
        super().__init__()
        self.meta, self.canonical, self.languages, self.h1, self.graphs = {}, [], [], [], []
        self.heading, self.script, self.buffer = False, False, ""
        self.titles, self.in_title = [], False
        self.issues = []

    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        if tag == "meta" and (a.get("name") or a.get("property")):
            key = a.get("name") or a.get("property")
            self.meta.setdefault(key, []).append(a.get("content", ""))
        if tag == "link" and a.get("rel") == "canonical": self.canonical.append(a.get("href"))
        if tag == "link" and a.get("hreflang"): self.languages.append(a.get("hreflang"))
        if tag == "h1": self.heading = True; self.h1.append("")
        if tag == "title": self.in_title = True; self.titles.append("")
        if tag == "script" and a.get("type") == "application/ld+json": self.script = True; self.buffer = ""

    def handle_data(self, text):
        if self.heading: self.h1[-1] += text
        if self.in_title: self.titles[-1] += text
        if self.script: self.buffer += text

    def handle_endtag(self, tag):
        if tag == "h1": self.heading = False
        if tag == "title": self.in_title = False
        if tag == "script" and self.script:
            self.script = False
            try:
                graph = json.loads(self.buffer)
                self.graphs.extend(graph.get("@graph", [graph]))
            except (ValueError, AttributeError): self.issues.append("Invalid JSON-LD")

def audit(base, case, user_agent="Googlebot"):
    path, indexable, schema_type, language_count = case
    started = time.perf_counter()
    try:
        request = urllib.request.Request(base + path, headers={"User-Agent": user_agent})
        with urllib.request.urlopen(request, timeout=45) as response:
            raw = response.read()
            source = raw.decode()
            doc = Document(); doc.feed(source)
            issues = doc.issues[:]
            robot_values = ",".join(doc.meta.get("robots", []) + [response.headers.get("X-Robots-Tag", "")])
            if ("noindex" not in robot_values) != indexable: issues.append("Unexpected indexation policy")
            canonical = SITE + path.split("?")[0]
            if path.startswith("/fr/recherche"): canonical = None
            if canonical and doc.canonical != [canonical]: issues.append("Canonical missing or inconsistent")
            if len(doc.h1) != 1 or not doc.h1[0].strip(): issues.append("Expected one nonempty H1")
            if len(doc.titles) != 1 or not doc.titles[0].strip(): issues.append("Expected one nonempty document title")
            if len(doc.languages) != language_count: issues.append("Unexpected language alternates")
            types = [node.get("@type") for node in doc.graphs]
            if schema_type and schema_type not in types: issues.append("Expected structured data missing: " + schema_type)
            if "Organization" not in types or "WebSite" not in types: issues.append("Missing site identity")
            if indexable and not doc.meta.get("description", [""])[0]: issues.append("Missing description")
            water_reading = None
            if path.endswith("/lacs/gruyere"):
                dataset = next((node for node in doc.graphs if node.get("@type") == "Dataset"), {})
                for field in ("name", "description", "license", "creator", "variableMeasured", "measurementTechnique", "spatialCoverage"):
                    if not dataset.get(field): issues.append("Missing dataset field: " + field)
                if dataset.get("measurementTechnique") != "Simstrat (1D)": issues.append("Incorrect model attribution")
                if dataset.get("license") != "https://creativecommons.org/licenses/by/4.0/": issues.append("Incorrect data licence")
                # Inspect real markup, excluding escaped client payloads. No JS is executed.
                reading = re.search(r'<p class="ow-lake-temperature">(.*?)</p>', source, re.S)
                if not reading: issues.append("Missing server-rendered reading or unavailable state")
                else:
                    water_reading = html.unescape(re.sub(r'<[^>]*>', '', reading.group(1)))
                    if "°C" in water_reading and not re.search(r'<time dateTime="[^"]+"', source): issues.append("Undated water estimate")
                head = source.split("</head>", 1)[0]
                if 'rel="canonical"' not in head or "<title>" not in head: issues.append("Metadata absent from HTML head")
            for node in doc.graphs:
                if node.get("@type") == "DiscussionForumPosting":
                    for field in ("author", "datePublished", "headline", "text", "url"):
                        if not node.get(field): issues.append("Missing discussion field: " + field)
            return {"path": path, "user_agent": user_agent, "status": response.status, "passed": not issues, "issues": issues, "water_reading": water_reading, "title": doc.titles, "canonical": doc.canonical, "robots": robot_values, "h1": doc.h1, "schema_types": types, "html_bytes": len(raw), "html_response_ms": round((time.perf_counter() - started) * 1000)}
    except Exception as error:
        return {"path": path, "passed": False, "issues": [str(error)]}

def audit_water_discovery(base):
    issues = []
    try:
        with urllib.request.urlopen(base + "/robots.txt", timeout=45) as response:
            robots = urllib.robotparser.RobotFileParser()
            robots.parse(response.read().decode().splitlines())
        with urllib.request.urlopen(base + "/sitemap.xml", timeout=45) as response:
            sitemap = response.read().decode()
        for lang in ("fr", "en", "de", "it"):
            for route in ("/lacs/gruyere", "/temperatures"):
                url = f"{SITE}/{lang}{route}"
                if f"<loc>{url}</loc>" not in sitemap: issues.append("Missing sitemap URL: " + url)
                for bot in ("Googlebot", "Bingbot", "OAI-SearchBot"):
                    if not robots.can_fetch(bot, url): issues.append(bot + " blocked: " + url)
    except Exception as error:
        issues.append(str(error))
    return {"path": "/robots.txt + /sitemap.xml (water)", "passed": not issues, "issues": issues}

def audit_private(base, path, recovery=False):
    """Unvalidated features must not be indexed or expose a data preview."""
    try:
        request = urllib.request.Request(base + path, headers={"User-Agent": "Googlebot"})
        try:
            response = urllib.request.urlopen(request, timeout=45)
        except urllib.error.HTTPError as error:
            response = error
        with response:
            doc = Document(); doc.feed(response.read().decode())
            issues = doc.issues[:]
            robots = ",".join(doc.meta.get("robots", []) + [response.headers.get("X-Robots-Tag", "")])
            if "noindex" not in robots: issues.append("Private feature must be noindex")
            if recovery:
                if response.status != 200: issues.append("Recovery page unavailable")
                if "nofollow" not in robots: issues.append("Recovery page must be nofollow")
                if len(doc.h1) != 1 or not doc.h1[0].strip(): issues.append("Missing recovery H1")
                if len(doc.titles) != 1 or not doc.titles[0].strip(): issues.append("Missing recovery title")
            else:
                if response.status not in (200, 404): issues.append("Unexpected private feature response")
                if any(node.get("@type") in ("CollectionPage", "WebPage") for node in doc.graphs): issues.append("Hidden water page exposes public page schema")
                if any("Simstrat" in heading for heading in doc.h1): issues.append("Hidden feature still rendered")
            return {"path": path, "status": response.status, "passed": not issues, "issues": issues, "robots": robots, "h1": doc.h1, "title": doc.titles}
    except Exception as error:
        return {"path": path, "passed": False, "issues": [str(error)]}

def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--base-url", default="http://127.0.0.1:3001")
    parser.add_argument("--output", help="Optional JSON report")
    parser.add_argument("--html-report", help="Optional local HTML report, outside the customer app")
    parser.add_argument("--water-enabled", action="store_true", help="Audit visible water coverage (default application configuration)")
    args = parser.parse_args()
    with concurrent.futures.ThreadPoolExecutor(max_workers=3) as executor:
        base = args.base_url.rstrip("/")
        cases = CASES + (WATER_CASES if args.water_enabled else [])
        results = list(executor.map(lambda case: audit(base, case), cases))
        if args.water_enabled:
            for bot in ("OAI-SearchBot", "Bingbot"):
                results.extend(executor.map(lambda case: audit(base, case, bot), WATER_CASES))
            results.append(audit_water_discovery(base))
        if not args.water_enabled:
            results.extend(executor.map(lambda case: audit_private(base, case[0]), WATER_CASES))
        results.extend(executor.map(lambda lang: audit_private(base, f"/auth/reset-password?locale={lang}", recovery=True), ("fr", "en")))
    report = {"base_url": args.base_url, "passed": all(r["passed"] for r in results), "note": "HTML response timings are local diagnostics, not Core Web Vitals, search rankings or real-user measurements.", "pages": results}
    if args.output: Path(args.output).write_text(json.dumps(report, ensure_ascii=False, indent=2))
    if args.html_report:
        rows = "".join(f'<tr><td>{html.escape(r["path"])}</td><td>{"OK" if r["passed"] else "À corriger"}</td><td>{html.escape(", ".join(r.get("schema_types", [])))}</td><td>{html.escape("; ".join(r["issues"]))}</td></tr>' for r in results)
        Path(args.html_report).write_text(f'''<!doctype html><html lang="fr"><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>Openwind — contrôle qualité et référencement</title><style>body{{font:16px/1.6 system-ui;color:#172033;margin:32px auto;padding:0 20px;max-width:1184px}}h1{{font-size:32px;line-height:1.2}}table{{border-collapse:collapse;width:100%;font-size:14px}}td,th{{padding:12px;text-align:left;border-bottom:1px solid #d6dae1;overflow-wrap:anywhere}}.table{{overflow:auto}}p{{max-width:75ch;color:#45556c}}</style><h1>Openwind — contrôle qualité et référencement</h1><p>{sum(r["passed"] for r in results)} pages validées sur {len(results)}. Contrôle de l’HTML servi : indexation, adresses canoniques, langues, titres et données structurées. Les temps de réponse locaux ne sont pas des scores Core Web Vitals ni une preuve de positionnement Google.</p><div class="table"><table><thead><tr><th>Page</th><th>Résultat</th><th>Données structurées</th><th>Points à corriger</th></tr></thead><tbody>{rows}</tbody></table></div><p>Aucun déploiement. Les mesures réelles nécessitent la version publiée et les rapports Search Console / Analytics.</p></html>''')
    print(json.dumps({"passed": report["passed"], "pages": len(results), "failures": [r for r in results if not r["passed"]]}, ensure_ascii=False, indent=2))
    raise SystemExit(0 if report["passed"] else 1)

if __name__ == "__main__": main()
