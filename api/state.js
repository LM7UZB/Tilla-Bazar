// Umumiy do'kon holati (mahsulotlar, sotuvchilar, arizalar, savdo tarixi, slaydlar).
// Bitta KV kalitda saqlanadi -> barcha foydalanuvchilar (mijoz/admin) BIR XIL ma'lumotni ko'radi.
//
//   GET  /api/state          -> joriy holatni qaytaradi ({ ok, configured, state })
//   POST /api/state {state}  -> yuborilgan bo'laklarni joriy holatga qo'shib (merge) saqlaydi
//
// Eslatma: bu oddiy va yengil yechim (kichik/o'rtacha do'kon uchun yetarli).
// KV ulanmagan bo'lsa (Vercel Storage -> KV/Upstash biriktirilmagan), configured:false qaytadi
// va frontend avtomatik brauzer xotirasiga (localStorage) tushib qoladi.

import { kvGetJSON, kvSetJSON, kvConfigured } from './_kv.js';

const KEY = 'tillabazar:appstate:v1';

export default async function handler(req, res) {
  if (!kvConfigured()) {
    return res.status(200).json({ ok: true, configured: false, state: null });
  }

  if (req.method === 'GET') {
    try {
      const state = await kvGetJSON(KEY, null);
      return res.status(200).json({ ok: true, configured: true, state });
    } catch (e) {
      return res.status(500).json({ ok: false, error: String(e) });
    }
  }

  if (req.method === 'POST') {
    let body = req.body;
    if (typeof body === 'string') {
      try { body = JSON.parse(body); } catch { body = {}; }
    }
    const patch = body?.state;
    if (!patch || typeof patch !== 'object' || Array.isArray(patch)) {
      return res.status(400).json({ ok: false, error: "'state' obyekt bo'lishi kerak" });
    }
    try {
      const current = (await kvGetJSON(KEY, {})) || {};
      const merged = { ...current, ...patch, updatedAt: new Date().toISOString() };
      await kvSetJSON(KEY, merged);
      return res.status(200).json({ ok: true, state: merged });
    } catch (e) {
      return res.status(500).json({ ok: false, error: String(e) });
    }
  }

  return res.status(405).json({ ok: false, error: 'Method not allowed' });
}
