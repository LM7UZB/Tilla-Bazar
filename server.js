// Render.com uchun bitta yagona server.
// - Tayyor sayt (dist/) statik fayl sifatida beriladi
// - Vercel uchun yozilgan api/*.js funksiyalari (o'zgarishsiz) shu yerda Express marshruti sifatida ishlaydi
// - Ixtiyoriy: Telegram bot (grammY, long polling) — /start bosilganda saytni ochadigan tugma yuboradi
//
// Ishga tushirish: npm install && npm run build && npm start
// (yoki Render'da render.yaml orqali avtomatik)

import 'dotenv/config';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import express from 'express';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = process.env.PORT || 3000;
const BOT_TOKEN = process.env.BOT_TOKEN;
const WEBAPP_URL = (process.env.WEBAPP_URL || '').trim().replace(/\/+$/, '');

const app = express();
app.use(express.json({ limit: '2mb' }));

app.get('/health', (_req, res) => res.json({ ok: true, status: 'running' }));

// ----------------------------------------------------------------------------
// 1-qism: /api/* — Vercel uchun yozilgan funksiyalarni shu yerda ham ishlatamiz
// (fayllar o'zgarishsiz qoladi, faqat Express route sifatida chaqiramiz)
// ----------------------------------------------------------------------------
const wrap = (modPath) => async (req, res) => {
  const mod = await import(modPath);
  return mod.default(req, res);
};

app.all('/api/state', wrap('./api/state.js'));
app.all('/api/notify', wrap('./api/notify.js'));
app.all('/api/bank-rates', wrap('./api/bank-rates.js'));

// ----------------------------------------------------------------------------
// 2-qism: Tayyor frontend'ni (dist/) serve qilish
// ----------------------------------------------------------------------------
const distDir = path.join(__dirname, 'dist');
app.use(express.static(distDir));

app.get('*', (_req, res) => {
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');
  res.set('Pragma', 'no-cache');
  res.set('Expires', '0');
  res.sendFile(path.join(distDir, 'index.html'), (err) => {
    if (err) {
      res.status(500).send('Frontend hali build qilinmagan. "npm run build" buyrug\'ini ishga tushiring.');
    }
  });
});

app.listen(PORT, () => {
  console.log(`🌐 TillaBazar server ishga tushdi: http://localhost:${PORT}`);
});

// ----------------------------------------------------------------------------
// 3-qism (ixtiyoriy): Telegram bot — faqat BOT_TOKEN bor bo'lsa ishga tushadi.
// /start bosilganda saytni ochadigan tugma yuboradi.
// ----------------------------------------------------------------------------
if (BOT_TOKEN) {
  try {
    const { Bot, GrammyError, HttpError } = await import('grammy');
    const bot = new Bot(BOT_TOKEN);

    bot.command('start', async (ctx) => {
      const name = ctx.from?.first_name || 'do\'stim';
      if (!WEBAPP_URL) {
        await ctx.reply(
          `Assalomu alaykum, ${name}! 👋\n\n⚠️ Do'kon manzili (WEBAPP_URL) hali sozlanmagan.`
        );
        return;
      }
      await ctx.reply(
        `Assalomu alaykum, ${name}! 👋\n\n💎 *TillaBazar* — tilla va kumush buyumlar onlayn bozoriga xush kelibsiz!`,
        {
          parse_mode: 'Markdown',
          reply_markup: {
            inline_keyboard: [[{ text: "🛒 Do'konni ochish", web_app: { url: WEBAPP_URL } }]],
          },
        }
      );
    });

    bot.catch((err) => {
      const e = err.error;
      if (e instanceof GrammyError) console.error('Telegram xatosi:', e.description);
      else if (e instanceof HttpError) console.error('HTTP xatosi:', e);
      else console.error('Botda kutilmagan xato:', e);
    });

    bot.start();
    console.log('🤖 Telegram bot ishga tushdi (long polling)');
  } catch (e) {
    console.warn('⚠️  Telegram bot ishga tushmadi (grammy o\'rnatilmaganmi?):', e?.message || e);
  }
} else {
  console.log('ℹ️  BOT_TOKEN topilmadi — faqat sayt (bez bot) ishlaydi.');
}
