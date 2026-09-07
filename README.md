# 💎 TillaBazar

Tilla va kumush buyumlar onlayn bozori — Telegram Mini App + mustaqil veb-sayt.

## 🏗 Hozirgi arxitektura

| Qism | Qayerda | Nima qiladi |
|---|---|---|
| **Frontend** (sayt) | **Vercel** (`tillabazar.uz`) | React + Vite bilan yozilgan interfeys |
| **Backend** (API) | **Render** (`tillabazar.onrender.com`) | Express server: `/api/state`, `/api/notify`, `/api/bank-rates` + Telegram bot (long polling) |
| **Ma'lumotlar bazasi** | **Upstash Redis** | Mahsulotlar, sotuvchilar, arizalar, savdo tarixi — hammaga umumiy |
| **Rasm/video saqlash** | **Cloudinary** | Yuklangan rasmlar (bepul, doimiy, hech qachon o'chmaydi) |
| **Dollar kursi** | bank.uz → CBU (rasmiy) → taxminiy | 3 bosqichli zaxira tizimi (`api/bank-rates.js`) |

Frontend barcha `/api/...` so'rovlarini to'g'ridan-to'g'ri Render manziliga yuboradi (`constants.ts` dagi `API_BASE`). Bu ikkalasini alohida (frontend — Vercel, backend — Render) joylashtirish imkonini beradi.

## ✅ Asosiy imkoniyatlar

- 🛍 Mahsulotlar katalogi (tilla/kumush), savat, checkout (naqd/muddatli)
- 🏪 **Sotuvchi paneli** — har bir do'kon egasi o'z mahsulotlarini ko'radi, tahrirlaydi, sotilganlarini kuzatadi
- 🛠 **Admin paneli** — tasdiqlash, sotuvchilar, mahsulotlar, reklamalar, bank/metal kurslari (faqat shu yerda tahrirlanadi)
- 📩 Har bir muhim voqeada (yangi mahsulot, buyurtma, tahrirlash, ariza) — Telegram orqali adminga xabar
- 🖼 Rasm/reklama galereyadan to'g'ridan-to'g'ri yuklanadi (Cloudinary)
- 💵 Bank USD kurslari va tilla/kumush narxlari avtomatik (yoki admin tomonidan majburiy)
- 👆 Reklama banneri qo'l bilan (swipe) suriladigan

## 🔑 Environment Variables

### Render (backend) — barchasi kerak
| Nomi | Izoh |
|---|---|
| `BOT_TOKEN` | BotFather tokeni — bot va xabarnomalar uchun |
| `ADMIN_CHAT_ID` | Arizalar/buyurtmalar keladigan chat ID |
| `WEBAPP_URL` | Botning "Do'konni ochish" tugmasi uchun (masalan `https://tillabazar.uz`) |
| `KV_REST_API_URL` / `KV_REST_API_TOKEN` | Upstash Redis — umumiy ma'lumotlar bazasi |

### Vercel (frontend) — ixtiyoriy
| Nomi | Izoh |
|---|---|
| `VITE_API_BASE_URL` | Agar Render manzili o'zgarsa, shu yerda yangilanadi. Berilmasa, `constants.ts` dagi standart qiymat (`https://tillabazar.onrender.com`) ishlatiladi |
| `GEMINI_API_KEY` | AI yordamchisi uchun (ixtiyoriy, kalitsiz ham sayt ishlayveradi) |

Cloudinary sozlamalari (`CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_UPLOAD_PRESET`) hozircha `constants.ts` faylida to'g'ridan-to'g'ri yozilgan (ular maxfiy emas — "unsigned" ochiq kalitlar, shuning uchun kodda turishi xavfsiz).

## 🚀 Deploy qilish

### Backend (Render)
1. [render.com](https://render.com) → **New + → Blueprint** → shu repo'ni tanlang (`render.yaml` avtomatik topiladi)
2. Environment Variables'ni to'ldiring (yuqoridagi jadval)
3. Deploy — Render `npm install && npm run build` qilib, `npm start` bilan ishga tushiradi

### Frontend (Vercel)
1. [vercel.com/new](https://vercel.com/new) → shu repo'ni import qiling
2. Framework: **Vite** (avtomatik aniqlanadi)
3. Deploy — `.vercelignore` tufayli faqat frontend joylanadi, backend fayllari (`api/`, `server.js`) e'tiborga olinmaydi
4. **Settings → Domains** → o'z domeningizni ulang

## 🛠 Lokal test

```bash
npm install
npm run dev        # frontend: http://localhost:5173 (Vite)
npm run build       # production build -> dist/
npm start            # backend (Express + bot): http://localhost:3000
```

## 📁 Muhim fayllar

```
.
├── App.tsx                  # Asosiy ilova
├── components/               # UI (SellModal, AdminPanelModal, SellerPanelModal va h.k.)
├── api/
│   ├── _kv.js                 # Upstash Redis bilan ishlash
│   ├── notify.js               # Telegram xabarnomalari
│   ├── state.js                 # Umumiy do'kon holati
│   └── bank-rates.js             # bank.uz -> CBU -> zaxira (3 bosqichli)
├── server.js                 # Render uchun Express server + Telegram bot
├── render.yaml                # Render blueprint
├── vercel.json                 # Vercel sozlamalari
├── .vercelignore                # Vercel'ga backend fayllarini yuklamaslik
└── constants.ts                  # API_BASE, Cloudinary, admin login va h.k.
```
