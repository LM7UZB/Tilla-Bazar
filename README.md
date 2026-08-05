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
