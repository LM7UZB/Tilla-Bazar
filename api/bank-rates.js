// bank.uz dan O'zbekiston banklari bo'yicha USD (dollar) kurslarini olib beradi.
//
// Qaytaradi:
//   bestBuy  — eng YUQORI "sotib olish" narxli 3 ta bank
//              (bank sizdan dollarni qimmatroq oladi => dollaringizni SOTISH uchun eng yaxshi)
//   bestSell — eng PAST "sotish" narxli 3 ta bank
//              (bank sizga dollarni arzonroq sotadi => dollar SOTIB OLISH uchun eng yaxshi)
//
// Ishlash tartibi (foydalanuvchidan hech narsa talab qilinmaydi):
//   1) bank.uz ga to'g'ridan-to'g'ri mobil User-Agent bilan urinadi.
//   2) Bloklansa, bir nechta ochiq proksi orqali avtomatik urinadi.
//   3) Hammasi ishlamasa, to'g'ri ko'rinadigan zaxira kurslar qaytadi.
//
// Admin (faqat ADMIN_IDS) qo'lda tahrirlashi mumkin:
//   POST /api/bank-rates {action:'save', bestBuy:[{bank,rate}], bestSell:[{bank,rate}]}
//   POST /api/bank-rates {action:'clear'}   -> qo'lda kurslarni o'chirib, yana jonli (bank.uz) ga qaytaradi
// Admin saqlagan kurslar bank.uz dan ustun turadi (source: 'admin').
//
// Tekshirish (ixtiyoriy): /api/bank-rates?debug=1
//
// Node 18+ da global fetch mavjud — qo'shimcha npm paket kerak emas.

import { kvGetJSON, kvSetJSON, kvConfigured } from './_kv.js';

const OVERRIDE_KEY = 'bankrates:override:v1';

const TARGET_URLS = [
  process.env.BANK_UZ_URL,
  'https://bank.uz/uz/currency',
  'https://bank.uz/uz/currency/usd',
].filter(Boolean);

// To'g'ridan-to'g'ri + ochiq proksilar (Cloudflare blokini chetlab o'tish uchun).
const PROXIES = [
  (u) => u, // to'g'ridan-to'g'ri
  (u) => `https://api.codetabs.com/v1/proxy/?quest=${encodeURIComponent(u)}`,
  (u) => `https://api.allorigins.win/raw?url=${encodeURIComponent(u)}`,
  (u) => `https://corsproxy.io/?url=${encodeURIComponent(u)}`,
  (u) => `https://thingproxy.freeboard.io/fetch/${u}`,
];

const BROWSER_HEADERS = {
  'User-Agent':
    'Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Mobile Safari/537.36',
  Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,application/json,*/*;q=0.8',
  'Accept-Language': 'uz,en;q=0.9,ru;q=0.8',
  Referer: 'https://bank.uz/',
};

// USD kurslari shu oraliqda bo'ladi (EUR ~14500+, GBP ~17000 — chiqarib tashlanadi).
const USD_MIN = Number(process.env.BANK_UZ_USD_MIN) || 9000;
const USD_MAX = Number(process.env.BANK_UZ_USD_MAX) || 13900;

function toNumber(v) {
  if (v == null) return NaN;
  if (typeof v === 'number') return v;
  let s = String(v).trim().replace(/\u00a0/g, ' ').replace(/[^\d.,]/g, '');
  if (!s) return NaN;
  if (s.includes('.') && s.includes(',')) {
    s = s.lastIndexOf(',') > s.lastIndexOf('.')
      ? s.replace(/\./g, '').replace(',', '.')
      : s.replace(/,/g, '');
  } else if (s.includes(',')) {
    const parts = s.split(',');
    s = parts[parts.length - 1].length === 3 ? s.replace(/,/g, '') : s.replace(',', '.');
  }
  const n = parseFloat(s);
  return Number.isFinite(n) ? n : NaN;
}

function isUsdRate(n) {
  return Number.isFinite(n) && n >= USD_MIN && n <= USD_MAX;
}

function cleanText(html) {
  return html
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&[a-z]+;/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function looksLikeBankName(s) {
  return (
    /[a-zA-Zа-яА-ЯёЁ]{3,}/.test(s) &&
    !/(usd|eur|rub|gbp|kzt|chf|jpy|so'?m|сум|сом|dollar|доллар|евро|valyuta|kurs|sotib|sotish|bank\.uz)/i.test(s)
  );
}

function parseJson(data) {
  const buy = [];
  const sell = [];
  const visit = (node) => {
    if (!node || typeof node !== 'object') return;
    if (Array.isArray(node)) { node.forEach(visit); return; }
    const name = node.bank_name || node.bankName || node.name || node.title || node.bank;
    const b = toNumber(node.buy ?? node.buy_price ?? node.buyPrice ?? node.purchase ?? node.cb_buy);
    const s = toNumber(node.sell ?? node.sell_price ?? node.sellPrice ?? node.sale ?? node.cb_sell);
    const ccy = String(node.currency || node.ccy || node.code || node.currency_code || 'USD').toUpperCase();
    if (name && typeof name === 'string' && ccy.includes('USD')) {
      if (isUsdRate(b)) buy.push({ bank: name.trim(), rate: b });
      if (isUsdRate(s)) sell.push({ bank: name.trim(), rate: s });
    }
    Object.values(node).forEach(visit);
  };
  visit(data);
  return { buy, sell };
}

function parseHtml(html) {
  const buy = [];
  const sell = [];
  const trBlocks = html.match(/<tr[\s\S]*?<\/tr>/gi) || [];
  let section = null; // 'buy' | 'sell'
  for (const tr of trBlocks) {
    const rowText = cleanText(tr).toLowerCase();
    const hasNums = /\d{4,}/.test(rowText.replace(/[\s,]/g, ''));
    if (!hasNums) {
      if (/sotib\s*olish|покупк|harid|buy/i.test(rowText)) { section = 'buy'; continue; }
      if (/sotish|продаж|sell|sale/i.test(rowText)) { section = 'sell'; continue; }
    }
    const cells = (tr.match(/<t[dh][\s\S]*?<\/t[dh]>/gi) || []).map(cleanText);
    if (cells.length < 2) continue;
    const name = cells.find(looksLikeBankName);
    if (!name) continue;
    const nums = cells.map(toNumber).filter(isUsdRate);
    if (nums.length >= 2) {
      buy.push({ bank: name, rate: nums[0] });
      sell.push({ bank: name, rate: nums[1] });
    } else if (nums.length === 1 && section) {
      (section === 'buy' ? buy : sell).push({ bank: name, rate: nums[0] });
    }
  }
  return { buy, sell };
}

function dedupe(list, keep) {
  const map = new Map();
  for (const item of list) {
    if (!item.bank || !Number.isFinite(item.rate)) continue;
    const key = item.bank.toLowerCase();
    const cur = map.get(key);
    if (!cur) map.set(key, item);
    else if (keep === 'max' && item.rate > cur.rate) map.set(key, item);
    else if (keep === 'min' && item.rate < cur.rate) map.set(key, item);
  }
  return [...map.values()];
}

// O'zbekiston Markaziy Banki rasmiy kursi (bank.uz ishlamay qolsa, zaxira sifatida).
// Bu API doimiy va barqaror ishlaydi, hech qanday to'siq yo'q.
async function fetchCbuRate() {
  const urls = [
    'https://cbu.uz/uz/arkhiv-kursov-valyut/json/',
    'https://cbu.uz/en/arkhiv-kursov-valyut/json/',
    'https://cbu.uz/oz/arkhiv-kursov-valyut/json/',
  ];
  for (const url of urls) {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 6000);
    try {
      const r = await fetch(url, { headers: BROWSER_HEADERS, signal: ctrl.signal });
      if (!r.ok) continue;
      const data = await r.json();
      const list = Array.isArray(data) ? data : [data];
      const usd = list.find((x) => String(x?.Ccy || x?.ccy || '').toUpperCase() === 'USD');
      if (usd) {
        const rate = toNumber(usd.Rate ?? usd.rate);
        if (isUsdRate(rate)) return { rate, date: usd.Date || usd.date || null };
      }
    } catch { /* keyingi manzilga o'tamiz */ }
    finally { clearTimeout(timer); }
  }
  return null;
}

async function tryFetch(url) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 8000);
  try {
    const r = await fetch(url, { headers: BROWSER_HEADERS, redirect: 'follow', signal: ctrl.signal });
    const ctype = (r.headers.get('content-type') || '').toLowerCase();
    const text = await r.text();
    return { ok: r.ok, status: r.status, ctype, text };
  } finally {
    clearTimeout(timer);
  }
}

// Ba'zi saytlar (Next.js, Nuxt va h.k.) jadvalni ko'zga ko'rinadigan HTML sifatida emas,
// balki sahifa ichiga "yashirilgan" JSON holida joylaydi (JavaScript keyin uni chizadi).
// Shu JSON bo'laklarini qidirib topamiz va odatdagidek tekshiramiz.
function extractEmbeddedJsonBlobs(html) {
  const blobs = [];

  // 1) Next.js: <script id="__NEXT_DATA__" type="application/json">{...}</script>
  const nextMatch = html.match(/<script[^>]*id=["']__NEXT_DATA__["'][^>]*>([\s\S]*?)<\/script>/i);
  if (nextMatch) {
    try { blobs.push(JSON.parse(nextMatch[1])); } catch { /* JSON emas */ }
  }

  // 2) Har qanday application/json turidagi <script> bloklari
  const jsonScripts = html.match(/<script[^>]+type=["']application\/(?:json|ld\+json)["'][^>]*>[\s\S]*?<\/script>/gi) || [];
  for (const block of jsonScripts) {
    const inner = block.replace(/^<script[^>]*>/i, '').replace(/<\/script>$/i, '').trim();
    try { blobs.push(JSON.parse(inner)); } catch { /* JSON emas */ }
  }

  // 3) Nuxt: window.__NUXT__= yoki self.__NUXT__= bilan boshlanadigan bloklar ichidan
  //    JSON'ga o'xshagan {...} qismini ajratib olishga urinamiz.
  const nuxtMatch = html.match(/__NUXT__\s*=\s*(\{[\s\S]*?\})\s*;?\s*<\/script>/i);
  if (nuxtMatch) {
    try { blobs.push(JSON.parse(nuxtMatch[1])); } catch { /* murakkab JS ifoda, o'tkazib yuboramiz */ }
  }

  return blobs;
}

function parseAny(text, ctype) {
  let parsed = { buy: [], sell: [] };
  const looksJson = ctype.includes('json') || /^\s*[[{]/.test(text);
  if (looksJson) {
    try { parsed = parseJson(JSON.parse(text)); } catch { /* JSON emas */ }
  }
  if (parsed.buy.length === 0 && parsed.sell.length === 0) parsed = parseHtml(text);
  if (parsed.buy.length === 0 && parsed.sell.length === 0) {
    for (const blob of extractEmbeddedJsonBlobs(text)) {
      const fromBlob = parseJson(blob);
      if (fromBlob.buy.length || fromBlob.sell.length) { parsed = fromBlob; break; }
    }
  }
  return parsed;
}

// To'g'ri ko'rinadigan zaxira (jonli ma'lumot olinmasa).
const STATIC_FALLBACK = {
  bestBuy: [
    { bank: 'Infinbank', rate: 11955 },
    { bank: 'MKBank', rate: 11950 },
    { bank: 'Universal bank', rate: 11950 },
  ],
  bestSell: [
    { bank: "Xalq Banki", rate: 11980 },
    { bank: 'Openbank', rate: 11995 },
    { bank: 'Hayot Bank', rate: 12000 },
  ],
};

// Admin kiritgan kurslarni tozalaydi/tekshiradi.
function sanitizeRates(list) {
  if (!Array.isArray(list)) return [];
  return list
    .map((x) => ({
      bank: String(x?.bank ?? '').trim().slice(0, 40),
      rate: Number(x?.rate),
    }))
    .filter((x) => x.bank && Number.isFinite(x.rate) && x.rate > 0)
    .slice(0, 3);
}

export default async function handler(req, res) {
  // --- Admin: qo'lda kurslarni saqlash / o'chirish ---
  // Eslatma: bu app asosan mustaqil sayt sifatida ishlaydi (Telegram tashqarisida),
  // shuning uchun bu yerda Telegram initData talab qilinmaydi — himoya faqat
  // Admin Panelning o'zi login/parol bilan yopilganligiga tayanadi (frontend tomonda).
  if (req.method === 'POST') {
    if (!kvConfigured()) {
      return res.status(500).json({ ok: false, error: 'Baza ulanmagan (KV)' });
    }
    let body = req.body;
    if (typeof body === 'string') { try { body = JSON.parse(body); } catch { body = {}; } }
    try {
      if (body?.action === 'clear') {
        await kvSetJSON(OVERRIDE_KEY, null);
        return res.status(200).json({ ok: true, cleared: true });
      }
      const bestBuy = sanitizeRates(body?.bestBuy);
      const bestSell = sanitizeRates(body?.bestSell);
      if (bestBuy.length === 0 && bestSell.length === 0) {
        return res.status(400).json({ ok: false, error: "Hech qanday kurs kiritilmadi" });
      }
      const payload = { bestBuy, bestSell, updatedAt: new Date().toISOString() };
      await kvSetJSON(OVERRIDE_KEY, payload);
      return res.status(200).json({ ok: true, source: 'admin', ...payload });
    } catch (e) {
      return res.status(500).json({ ok: false, error: String(e) });
    }
  }

  const debug = req.query?.debug === '1' || req.query?.debug === 'true';
  const attempts = [];

  // --- Admin qo'lda kiritgan kurslar bo'lsa, ular ustun turadi ---
  if (!debug && kvConfigured()) {
    try {
      const override = await kvGetJSON(OVERRIDE_KEY, null);
      if (override && (override.bestBuy?.length || override.bestSell?.length)) {
        res.setHeader('Cache-Control', 'no-store');
        return res.status(200).json({
          ok: true, ccy: 'USD', source: 'admin',
          updatedAt: override.updatedAt,
          bestBuy: override.bestBuy || [],
          bestSell: override.bestSell || [],
        });
      }
    } catch { /* KV xatosi — jonli ma'lumotga o'tamiz */ }
  }

  for (const target of TARGET_URLS) {
    for (const wrap of PROXIES) {
      const url = wrap(target);
      try {
        const { ok, status, ctype, text } = await tryFetch(url);
        if (!ok) { attempts.push({ url, status }); continue; }
        const parsed = parseAny(text, ctype);
        const found = parsed.buy.length + parsed.sell.length;
        const embeddedBlobCount = extractEmbeddedJsonBlobs(text).length;
        attempts.push({ url, status, found, embeddedBlobCount, textLen: text.length });

        if (debug && found > 0) {
          return res.status(200).json({
            ok: true, debug: true, source: url, status, contentType: ctype,
            usdBand: [USD_MIN, USD_MAX],
            buyCount: parsed.buy.length, sellCount: parsed.sell.length,
            sampleBuy: parsed.buy.slice(0, 6), sampleSell: parsed.sell.slice(0, 6),
            rawSnippet: text.slice(0, 2000),
          });
        }
        if (debug && found === 0 && url === TARGET_URLS[0]) {
          // Birinchi (asosiy) manzil hech narsa bermasa - tekshirish uchun xom HTML namunasini qaytaramiz
          return res.status(200).json({
            ok: false, debug: true, note: 'HTML topildi, lekin kurslar aniqlanmadi',
            status, contentType: ctype, textLength: text.length,
            embeddedBlobCount,
            rawSnippet: text.slice(0, 3000),
          });
        }
        if (found === 0) continue;

        const bestBuy = dedupe(parsed.buy, 'max').sort((a, b) => b.rate - a.rate).slice(0, 3);
        const bestSell = dedupe(parsed.sell, 'min').sort((a, b) => a.rate - b.rate).slice(0, 3);
        if (bestBuy.length === 0 && bestSell.length === 0) continue;

        res.setHeader('Cache-Control', 's-maxage=1800, stale-while-revalidate=3600');
        return res.status(200).json({
          ok: true, ccy: 'USD', source: 'bank.uz', via: url,
          updatedAt: new Date().toISOString(),
          bestBuy, bestSell,
        });
      } catch (e) {
        attempts.push({ url, error: String(e?.name || e) });
      }
    }
  }

  // --- bank.uz/proksilar ishlamadi -> O'zbekiston Markaziy Banki rasmiy kursiga murojaat qilamiz ---
  const cbu = await fetchCbuRate();
  if (cbu) {
    const label = "Markaziy Bank (rasmiy)";
    if (debug) {
      return res.status(200).json({
        ok: true, debug: true, source: 'cbu', cbuRate: cbu.rate, cbuDate: cbu.date, attempts,
      });
    }
    res.setHeader('Cache-Control', 's-maxage=1800, stale-while-revalidate=3600');
    return res.status(200).json({
      ok: true, ccy: 'USD', source: 'cbu',
      updatedAt: new Date().toISOString(),
      cbuDate: cbu.date,
      bestBuy: [{ bank: label, rate: cbu.rate }],
      bestSell: [{ bank: label, rate: cbu.rate }],
      note: "bank.uz dan jonli ma'lumot olinmadi; O'zbekiston Markaziy Banki rasmiy kursi ko'rsatilmoqda",
    });
  }

  if (debug) {
    return res.status(200).json({ ok: false, debug: true, note: 'bank.uz/proksilar/CBU ishlamadi', attempts });
  }

  // Hammasi ishlamadi — zaxira (taxminiy) kurslar.
  res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=900');
  return res.status(200).json({
    ok: true, ccy: 'USD', source: 'fallback',
    updatedAt: new Date().toISOString(),
    bestBuy: STATIC_FALLBACK.bestBuy,
    bestSell: STATIC_FALLBACK.bestSell,
    note: 'bank.uz va CBU dan jonli ma\'lumot olinmadi; taxminiy kurslar',
  });
}
