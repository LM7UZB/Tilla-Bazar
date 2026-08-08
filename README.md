# 💎 TillaBazar — birlashtirilgan yakuniy versiya

Bu versiya ikkita zip faylning eng yaxshi tomonlarini birlashtiradi:

- 🎨 **Dizayn va UI** — oxirgi "Glass Edition" versiyasidan (chiroyli glassmorphism interfeys, yagona Admin panel)
- ⚙️ **Ishlaydigan backend** — birinchi versiyadan (umumiy ma'lumotlar bazasi + Telegram xabarnomalari)

## ✅ Nima tuzatildi / qo'shildi

1. **Kritik xato tuzatildi**: `SellModal.tsx`da mahsulot qo'shish funksiyasi (`onAddPendingProduct`) komponentga ulanmagan edi — sotuvchi "Sotish" tugmasini bossa, hech narsa saqlanmas edi. Endi ishlaydi.
2. **Umumiy ma'lumotlar bazasi qo'shildi** (`api/state.js` + `utils/state.ts`): mahsulotlar, sotuvchilar, arizalar, savdo tarixi endi serverda saqlanadi — **barcha mijozlar bir xil ma'lumotni ko'radi**, oldingi versiyada esa har bir brauzerda alohida edi.
3. **Telegram xabarnomalari qaytarildi** (`api/notify.js`): endi quyidagi hollarda sizga (adminga) Telegram orqali xabar keladi:
   - Yangi mahsulot sotishga qo'yilganda
   - Yangi buyurtma (naqd yoki muddatli) qilinganda
   - Yangi sotuvchi arizasi kelganda
4. Telegram Mini App sifatida ochilish qobiliyati saqlab qolindi (`index.tsx`, `index.html`), lekin sayt **mustaqil domenda ham to'liq ishlaydi**.

## ⚠️ Bilib qo'yish kerak bo'lgan narsa

- `GEMINI_API_KEY` (AI yordamchisi uchun) hozircha build vaqtida frontendga "yopishtiriladi" — ya'ni texnik jihatdan har kim ko'rishi mumkin. Kalitsiz ham sayt to'liq ishlayveradi. Agar buni real (pullik) kalit bilan xavfsiz qilish kerak bo'lsa, alohida ayting — server orqali "proksi" qilib beraman.
- `/api/state` yozish huquqi hozircha ochiq (har qanday kishi texnik jihatdan so'rov yubora oladi). Kichik/shaxsiy do'kon uchun bu odatiy holat, lekin katta loyihaga aylansa, admin login/parol bilan himoyalashni tavsiya qilaman.

---

## 🚀 Ishga tushirish — 4 qadam (serversiz, bepul)

> Bu bo'lim **Vercel** uchun. Agar **Render.com**'ga o'tmoqchi bo'lsangiz (masalan Vercel joyi/limiti tugab qolgan bo'lsa), pastdagi **"🖥️ Render.com'ga o'tish"** bo'limiga o'ting.


### 1-qadam — Bot tokeningiz
[@BotFather](https://t.me/BotFather) orqali olingan token: `123456789:AAE...`

### 2-qadam — Admin Chat ID
[@userinfobot](https://t.me/userinfobot) ga `/start` yuboring → Chat ID raqamingizni oladi.

### 3-qadam — Vercel'ga deploy
1. Bu loyihani GitHub akkauntingizga yuklang.
2. [vercel.com](https://vercel.com) → **Add New → Project** → repo'ni import qiling.
3. Framework: **Vite** (avtomatik aniqlanadi). Root Directory: loyihaning o'zi (agar repo faqat shu loyihadan iborat bo'lsa, o'zgartirish shart emas).
4. **Environment Variables**:
   | Nomi | Majburiy | Izoh |
   |------|:---:|------|
   | `BOT_TOKEN` | ✅ | BotFather token — xabarnomalar uchun |
   | `ADMIN_CHAT_ID` | ➖ | Arizalar keladigan chat ID |
   | `GEMINI_API_KEY` | ➖ | AI yordamchisi uchun (ixtiyoriy) |
5. **Storage → Create Database → KV** ni loyihaga ulang — bu **umumiy ma'lumotlar bazasi** uchun kerak (ulamasangiz ham sayt ishlaydi, lekin ma'lumotlar faqat brauzerda qoladi).
6. **Deploy** tugmasini bosing. Manzil beriladi, masalan: `https://tillabazar.vercel.app`

### 4-qadam — Domeningizni ulash
Vercel loyihasi → **Settings → Domains** → domeningizni kiriting → ko'rsatilgan DNS yozuvlarini (A/CNAME) domen provayderingizda (masalan Cloudflare, Reg.ru, Uzinfocom) sozlang.

### (Ixtiyoriy) Telegram bot tugmasi
Agar Telegram ichida ham ochilishini xohlasangiz: [@BotFather](https://t.me/BotFather) → `/mybots` → botingiz → **Bot Settings → Menu Button** → URL sifatida domeningizni kiriting.

---

## 📁 Tuzilish

```
.
├── App.tsx                 # Asosiy ilova (holatni serverga sinxronlaydi)
├── components/              # UI komponentlari (glass dizayn)
├── api/
│   ├── _kv.js               # Vercel KV (Upstash Redis) bilan ishlash
│   ├── _auth.js              # Telegram initData tekshiruvi (kelajakda kengaytirish uchun)
│   ├── notify.js             # Adminga Telegram xabar yuborish
│   └── state.js              # Umumiy do'kon holati (mahsulot/sotuvchi/buyurtma)
├── utils/
│   ├── telegram.ts           # notifyAdmin(), customerInfoText()
│   └── state.ts               # fetchSharedState(), saveSharedState()
├── services/geminiService.ts # AI yordamchisi (ixtiyoriy)
├── vercel.json
└── .env.example
```

## 🛠 Lokal test

```bash
npm install
npm run dev      # http://localhost:3000
```

## 🏗 Build

```bash
npm run build     # natija: dist/
```

---

## 🖥️ Render.com'ga o'tish (Vercel o'rniga)

Vercel'da joy/limit tugab qolsa, butun loyihani **Render.com**'ga (bepul reja bor) ko'chirish mumkin. Bu loyihada Render uchun kerakli hamma narsa (`server.js`, `render.yaml`) allaqachon tayyor.

**Farqi:** Vercel'da har bir `api/*.js` fayli alohida "serverless funksiya" sifatida ishlaydi. Render'da esa ular bitta doimiy ishlaydigan `server.js` (Express) orqali xizmat qiladi — bir xil kod, faqat ishga tushirish usuli boshqacha. Bonus: shu bitta server ichida **Telegram bot** ham (agar xohlasangiz) uzluksiz ishlab turadi.

### Qadamlar

1. **Ma'lumotlar bazasini saqlab qolish** (muhim!): agar Vercel'da "Storage → KV" ulagan bo'lsangiz, o'sha joydan `KV_REST_API_URL` va `KV_REST_API_TOKEN` qiymatlarini nusxalab oling (Vercel loyihasi → Storage → tegishli baza → ".env.local" yoki "Quickstart" bo'limida ko'rinadi). Bu Upstash Redis — Render'da ham xuddi shu qiymatlar bilan ishlatiladi, ma'lumot yo'qolmaydi.

2. [render.com](https://render.com) da ro'yxatdan o'ting/kiring → **"New +" → "Blueprint"**

3. Shu GitHub repongizni tanlang — Render `render.yaml` faylini avtomatik topib, xizmatni sozlab beradi

4. **Environment Variables** bo'limida to'ldiring:
   | Nomi | Qiymat |
   |------|--------|
   | `BOT_TOKEN` | BotFather tokeningiz |
   | `ADMIN_CHAT_ID` | Chat ID raqamingiz |
   | `WEBAPP_URL` | Render sizga beradigan manzil (masalan `https://tillabazar.onrender.com`) — birinchi deploydan keyin bilib, qayta kiritib qo'ysangiz ham bo'ladi |
   | `KV_REST_API_URL` | Vercel'dan nusxalangan qiymat (1-qadam) |
   | `KV_REST_API_TOKEN` | Vercel'dan nusxalangan qiymat (1-qadam) |

5. **"Apply"** / **"Deploy"** tugmasini bosing — Render avtomatik `npm install && npm run build` qilib, keyin `npm start` bilan ishga tushiradi

6. Deploy tugagach, sizga berilgan manzilni (`https://xxxxx.onrender.com`) domeningizga (`tillabazar.uz`) ulang — bu qadam Vercel'dagi bilan bir xil: Render loyihasi → **Settings → Custom Domain** → domeningizni kiriting → ko'rsatilgan DNS yozuvini domen provayderingizda (Ahost.uz) sozlang

7. **Eslatma:** Render'ning bepul rejasida xizmat 15 daqiqa faoliyatsiz qolsa "uxlab qoladi" va keyingi so'rovda ~30-50 soniya sekinroq ochiladi. Agar bu muammo bo'lsa, Render'ning pullik ("Starter", ~$7/oy) rejasiga o'tish tavsiya etiladi — u doim "uyg'oq" turadi.

Ikkalasini (Vercel va Render) parallel ham ochiq qoldirishingiz mumkin — kodga hech narsa o'zgartirish shart emas, faqat qaysi birini domeningizga ulashni tanlaysiz.
