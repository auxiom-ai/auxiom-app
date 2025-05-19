/* multi-build-map.mjs  ────────────────────────────────────────────────
   node multi-build-map.mjs
   ▸ downloads BILLSTATUS XMLs for the congresses in CONGRESSES[]
   ▸ aggregates subject–policy counts (one global matrix)
   ▸ drops subjects seen on < MIN_SUPPORT bills total
   ▸ links each remaining subject to every policy where
       count ≥ THRESHOLD × subject’s max count
   ▸ outputs policy-subject-map-<low>-<high>.json
*/

import fs from 'fs';
import path from 'path';
import { XMLParser } from 'fast-xml-parser';
import { globSync } from 'glob';
import { setTimeout as wait } from 'node:timers/promises';

/* ───── configurable knobs ─────────────────────────────────────────── */
const CONGRESSES = [116, 117, 118, 119];   // any list you need
const TYPES      = ['hr','s','hjres','sjres','hconres','sconres','hres','sres'];
const THRESHOLD  = 0.30;   // cluster edge rule
const MIN_SUPPORT = 10;     // ignore subjects below this total freq
const MAX_PAR    = 12;     // max parallel file downloads
const RETRIES    = 3;      // per-file fetch attempts
const TIMEOUT_MS = 12_000; // per-request timeout (ms)

const OUT_FILE   =
  `policy-subject-map-${CONGRESSES[0]}-${CONGRESSES.at(-1)}.json`;

/* ───── resilient fetch helper ─────────────────────────────────────── */
async function fetchOK(url, tries = RETRIES) {
  for (let k = 1; k <= tries; k++) {
    try {
      const res = await fetch(url, { timeout: TIMEOUT_MS });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res;
    } catch (err) {
      if (k === tries) throw err;
      console.warn(`  ↻  ${url}  (retry ${k})`);
      await wait(1_000 * k);                   // 1 s, 2 s, 3 s …
    }
  }
}

/* ───── step 1 : download every XML that exists ─────────────────────── */
async function downloadCongress(congress) {
  for (const t of TYPES) {
    const dir = path.join(`data-${congress}`, t);
    fs.mkdirSync(dir, { recursive: true });

    const sitemap =
      `https://www.govinfo.gov/sitemap/bulkdata/BILLSTATUS/${congress}${t}/sitemap.xml`;
    const idxXML = await fetchOK(sitemap).then(r => r.text());
    const urls   = [...idxXML.matchAll(/<loc>([^<]+\.xml)<\/loc>/g)]
                   .map(m => m[1]);

    console.log(`⏬  ${t.padEnd(6)}  ${congress}th – ${urls.length} files`);

    for (let i = 0; i < urls.length; i += MAX_PAR) {
      await Promise.all(urls.slice(i, i + MAX_PAR).map(async url => {
        const dst = path.join(dir, path.basename(url));
        if (fs.existsSync(dst)) return;               // cached
        const buf = await fetchOK(url).then(r => r.arrayBuffer());
        fs.writeFileSync(dst, Buffer.from(buf));
      }));
    }
  }
}

/* ───── helper : harvest every @name / <name> in <subjects> tree ────── */
function extractTerms(node, bag) {
  if (!node) return;
  if (Array.isArray(node)) return node.forEach(n => extractTerms(n, bag));

  if (typeof node === 'object') {
    const attr = node['@_name'] ?? node['@_term'] ?? node['@_label'];
    const elem = typeof node.name === 'string' ? node.name : null;
    if (attr) bag.add(attr);
    if (elem) bag.add(elem);
    for (const v of Object.values(node)) extractTerms(v, bag);
  }
}

/* ───── step 2 : build global count matrices ────────────────────────── */
function buildMatrices() {
  const parser = new XMLParser({ ignoreAttributes:false,
                                 transformTagName:t=>t.toLowerCase() });

  const p2s = new Map();   // Map<policy, Map<subject,count>>
  const s2p = new Map();   // Map<subject, Map<policy,count>>
  let files = 0, hits = 0;

  for (const c of CONGRESSES) {
    for (const f of globSync(`data-${c}/**/*.xml`)) {
      files++;
      const root = parser.parse(fs.readFileSync(f,'utf8')).billstatus;
      const paTag = root?.bill?.policyarea;
      const policy = typeof paTag === 'string'
                   ? paTag
                   : paTag?.['@_name'] ?? paTag?.name;
      if (!policy) continue;

      const bag = new Set();
      extractTerms(root.bill?.subjects, bag);
      if (!bag.size) continue;

      bag.forEach(term => {
        const subMap = p2s.get(policy) ?? new Map();
        subMap.set(term, (subMap.get(term) ?? 0) + 1);
        p2s.set(policy, subMap);

        const polMap = s2p.get(term) ?? new Map();
        polMap.set(policy, (polMap.get(policy) ?? 0) + 1);
        s2p.set(term, polMap);

        hits++;
      });
    }
  }
  console.log(`✓ parsed ${files} XMLs, harvested ${hits} term-hits`);
  return { p2s, s2p };
}

/* ───── step 3 : soft clustering with MIN_SUPPORT filter ─────────────── */
function buildClusters(p2s, s2p) {
  const clusters = new Map([...p2s.keys()].map(pa => [pa, new Set()]));

  for (const [term, polMap] of s2p) {
    const total = [...polMap.values()].reduce((a,b)=>a+b, 0);
    if (total < MIN_SUPPORT) continue;          // support filter

    const max = Math.max(...polMap.values());
    for (const [policy, cnt] of polMap) {
      if (cnt >= max * THRESHOLD) clusters.get(policy).add(term);
    }
  }
  return clusters;
}

/* ───── orchestrate ─────────────────────────────────────────────────── */
for (const c of CONGRESSES) await downloadCongress(c);
const { p2s, s2p } = buildMatrices();
const clusters     = buildClusters(p2s, s2p);

fs.writeFileSync(
  OUT_FILE,
  JSON.stringify(
    Object.fromEntries([...clusters].map(([k,v]) => [k,[...v].sort()])),
    null, 2
  )
);
console.log(`✅  ${OUT_FILE}  (${clusters.size} policy areas)`);

