// Server bilan umumiy holatni sinxronlash (mahsulotlar, sotuvchilar, arizalar, savdo tarixi, slaydlar).
// KV ulangan bo'lsa -> hamma foydalanuvchida bir xil ma'lumot (haqiqiy umumiy do'kon).
// KV ulanmagan bo'lsa -> localStorage'ga tushib qoladi (eski xatti-harakat, faqat shu brauzerda).

export interface SharedState {
  productsList?: any[];
  pendingProducts?: any[];
  sellersList?: any[];
  sellerApplications?: any[];
  salesHistory?: any[];
  slides?: any[];
  metalRates?: any[];
  updatedAt?: string;
}

let kvAvailable: boolean | null = null;

/** Serverdan joriy umumiy holatni oladi. KV ulanmagan/xato bo'lsa null qaytaradi. */
export async function fetchSharedState(): Promise<SharedState | null> {
  try {
    const res = await fetch('/api/state');
    const data = await res.json();
    kvAvailable = !!data?.configured;
    return data?.ok && data.state ? data.state : null;
  } catch {
    kvAvailable = false;
    return null;
  }
}

/** Berilgan bo'lakni serverdagi umumiy holatga saqlaydi (boshqalarga ta'sir qilmaydi). */
export async function saveSharedState(patch: SharedState): Promise<boolean> {
  if (kvAvailable === false) return false; // KV yo'q ekanligi allaqachon ma'lum -> behuda so'rov yubormaymiz
  try {
    const res = await fetch('/api/state', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ state: patch }),
    });
    const data = await res.json();
    return !!data?.ok;
  } catch {
    return false;
  }
}
