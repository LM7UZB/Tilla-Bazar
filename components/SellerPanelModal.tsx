import React, { useState, useMemo } from 'react';
import { UserAccount, Language, Product } from '../types';
import { IMG_API_KEY } from '../constants';
import { notifyAdmin, customerInfoText } from '../utils/telegram';

interface SellerPanelModalProps {
  onClose: () => void;
  theme: 'dark' | 'light';
  lang: Language;
  account: UserAccount;
  productsList: Product[];
  setProductsList: React.Dispatch<React.SetStateAction<Product[]>>;
  salesHistory: any[];
  onAddProductClick: () => void;
}

export const SellerPanelModal: React.FC<SellerPanelModalProps> = ({
  onClose, theme, lang, account, productsList, setProductsList, salesHistory, onAddProductClick
}) => {
  const isDark = theme === 'dark';
  const bgColor = isDark ? 'bg-[#0e0e11]' : 'bg-white';
  const textColor = isDark ? 'text-white' : 'text-black';
  const itemBg = isDark ? 'bg-[#15151a] border-white/5' : 'bg-white border-gray-100 shadow-sm';
  const inputBg = isDark ? 'bg-white/5 text-white border-white/10' : 'bg-gray-100 text-black border-transparent';

  const [activeTab, setActiveTab] = useState<'products' | 'sales'>('products');
  const [toast, setToast] = useState<string | null>(null);
  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 2200); };

  const storeName = (account.storeName || '').toLowerCase().trim();
  const myProducts = useMemo(
    () => productsList.filter(p => p.store.toLowerCase().trim() === storeName),
    [productsList, storeName]
  );
  const mySales = useMemo(
    () => salesHistory.filter(s => (s.store || '').toLowerCase().trim() === storeName),
    [salesHistory, storeName]
  );
  const totalRevenue = useMemo(() => mySales.reduce((sum, s) => sum + (s.price || 0), 0), [mySales]);

  const [editingId, setEditingId] = useState<number | null>(null);
  const [eTitle, setETitle] = useState('');
  const [ePrice, setEPrice] = useState('');
  const [eGram, setEGram] = useState('');
  const [eDesc, setEDesc] = useState('');
  const [eImg, setEImg] = useState('');
  const [isUploadingImg, setIsUploadingImg] = useState(false);

  const startEdit = (p: Product) => {
    setEditingId(p.id);
    setETitle(p.title.uz);
    setEPrice(String(p.price));
    setEGram(p.gram);
    setEDesc(p.desc.uz);
    setEImg(p.img);
  };

  const cancelEdit = () => setEditingId(null);

  const handleImgUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingImg(true);
    const formData = new FormData();
    formData.append('image', file);
    try {
      const res = await fetch(`https://api.imgbb.com/1/upload?key=${IMG_API_KEY}`, { method: 'POST', body: formData });
      const data = await res.json();
      if (data?.success) { setEImg(data.data.url); showToast('Rasm yuklandi'); }
      else { showToast('Rasm yuklashda xatolik'); }
    } catch {
      showToast('Rasm yuklashda xatolik');
    }
    setIsUploadingImg(false);
  };

  const saveEdit = () => {
    if (!eTitle.trim() || !ePrice || Number(ePrice) <= 0) {
      showToast("Nom va narx to'g'ri kiritilishi shart");
      return;
    }
    setProductsList(prev => prev.map(p => p.id === editingId ? {
      ...p,
      title: { ...p.title, uz: eTitle.trim() },
      price: Number(ePrice),
      gram: eGram,
      desc: { ...p.desc, uz: eDesc },
      img: eImg || p.img,
    } : p));

    notifyAdmin(
      "Sotuvchi mahsulotni tahrirladi!\n\nDo'kon: " + account.storeName + "\n" + eTitle + "\n" + ePrice + "$\n\n" + customerInfoText()
    );
    showToast('Saqlandi');
    setEditingId(null);
  };

  const handleDelete = (p: Product) => {
    if (!window.confirm(p.title.uz + " mahsulotini o'chirmoqchimisiz?")) return;
    setProductsList(prev => prev.filter(x => x.id !== p.id));
    notifyAdmin(
      "Sotuvchi mahsulotni o'chirdi!\n\nDo'kon: " + account.storeName + "\n" + p.title.uz + "\n\n" + customerInfoText()
    );
    showToast("Mahsulot o'chirildi");
  };

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-xl z-[180] flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fade-in">
      <div className="absolute inset-0 z-0" onClick={onClose} />

      <div className={`w-full max-w-md ${bgColor} border-t sm:border border-[#d4af37]/30 rounded-t-[40px] sm:rounded-[40px] p-5 shadow-2xl max-h-[95vh] sm:max-h-[90vh] overflow-y-auto scrollbar-none relative z-10`}>

        {toast && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[190] bg-[#d4af37] text-black text-[10px] px-4 py-1.5 rounded-full font-black shadow-xl">
            {toast}
          </div>
        )}

        <div className="flex justify-between items-center mb-5 px-1">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#d4af37]/15 border border-[#d4af37]/30 rounded-xl flex items-center justify-center text-[#d4af37]">
              <i className="fas fa-store text-base"></i>
            </div>
            <div className="text-left">
              <h2 className="text-sm font-black text-[#d4af37] tracking-tight uppercase">MENING DO'KONIM</h2>
              <p className="text-[8px] text-gray-500 font-bold uppercase tracking-widest">{account.storeName}</p>
            </div>
          </div>
          <button onClick={onClose} className={`w-8 h-8 rounded-full ${itemBg} border flex items-center justify-center ${textColor} active:scale-90 transition-all`}>
            <i className="fas fa-times text-xs"></i>
          </button>
        </div>

        <div className="grid grid-cols-3 gap-2 mb-5">
          <div className={`${itemBg} border rounded-2xl p-3 text-center`}>
            <div className="text-lg font-black text-[#d4af37]">{myProducts.length}</div>
            <div className="text-[7px] font-black text-gray-400 uppercase tracking-wide mt-0.5">Mahsulot</div>
          </div>
          <div className={`${itemBg} border rounded-2xl p-3 text-center`}>
            <div className="text-lg font-black text-green-500">{mySales.length}</div>
            <div className="text-[7px] font-black text-gray-400 uppercase tracking-wide mt-0.5">Sotilgan</div>
          </div>
          <div className={`${itemBg} border rounded-2xl p-3 text-center`}>
            <div className="text-sm font-black text-[#d4af37]">${totalRevenue.toLocaleString('ru-RU')}</div>
            <div className="text-[7px] font-black text-gray-400 uppercase tracking-wide mt-0.5">Aylanma</div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-1.5 mb-4">
          <button onClick={() => { setActiveTab('products'); setEditingId(null); }} className={`py-2.5 rounded-xl border text-[9px] font-black uppercase tracking-wider transition-all ${activeTab === 'products' ? 'border-[#d4af37] text-[#d4af37] bg-[#d4af37]/5' : 'border-white/5 bg-[#1a1a1e]/50 text-gray-500'}`}>
            Mahsulotlarim
          </button>
          <button onClick={() => { setActiveTab('sales'); setEditingId(null); }} className={`py-2.5 rounded-xl border text-[9px] font-black uppercase tracking-wider transition-all ${activeTab === 'sales' ? 'border-[#d4af37] text-[#d4af37] bg-[#d4af37]/5' : 'border-white/5 bg-[#1a1a1e]/50 text-gray-500'}`}>
            Sotilganlar
          </button>
        </div>

        {activeTab === 'products' && (
          <div className="space-y-3 animate-slide-up">
            <button
              onClick={onAddProductClick}
              className="w-full py-3 bg-[#d4af37] text-black text-[10px] font-black uppercase tracking-wider rounded-2xl shadow active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              <i className="fas fa-plus"></i> Yangi mahsulot qo'shish
            </button>

            {myProducts.length === 0 && (
              <div className={`${itemBg} border rounded-2xl p-6 text-center text-[10px] font-bold text-gray-400`}>
                Hozircha mahsulotingiz yo'q
              </div>
            )}

            {myProducts.map(p => (
              <div key={p.id} className={`${itemBg} border rounded-[24px] p-3.5`}>
                {editingId === p.id ? (
                  <div className="space-y-2.5">
                    <div className="flex gap-2 items-center">
                      {eImg && <img src={eImg} alt="" className="w-12 h-12 rounded-lg object-cover border border-white/10 shrink-0" />}
                      <label className={`flex-1 flex items-center justify-center gap-1.5 py-2 ${inputBg} rounded-lg text-[8.5px] font-black uppercase cursor-pointer active:scale-95 transition-all`}>
                        {isUploadingImg ? <><i className="fas fa-spinner fa-spin"></i><span>Yuklanmoqda...</span></> : <><i className="fas fa-image"></i><span>Rasm almashtirish</span></>}
                        <input type="file" hidden accept="image/*" onChange={handleImgUpload} disabled={isUploadingImg} />
                      </label>
                    </div>
                    <input type="text" value={eTitle} onChange={e => setETitle(e.target.value)} placeholder="Nomi" className={`w-full ${inputBg} rounded-lg px-2.5 py-2 text-[10px] font-bold outline-none`} />
                    <div className="flex gap-2">
                      <input type="number" value={ePrice} onChange={e => setEPrice(e.target.value)} placeholder="Narxi ($)" className={`flex-1 ${inputBg} rounded-lg px-2.5 py-2 text-[10px] font-bold outline-none`} />
                      <input type="text" value={eGram} onChange={e => setEGram(e.target.value)} placeholder="Og'irligi" className={`flex-1 ${inputBg} rounded-lg px-2.5 py-2 text-[10px] font-bold outline-none`} />
                    </div>
                    <textarea value={eDesc} onChange={e => setEDesc(e.target.value)} placeholder="Tavsif" rows={2} className={`w-full ${inputBg} rounded-lg px-2.5 py-2 text-[10px] font-bold outline-none resize-none`} />
                    <div className="flex gap-2 pt-1">
                      <button onClick={cancelEdit} className="flex-1 py-2 border border-white/10 text-gray-400 text-[9px] font-black uppercase rounded-xl active:scale-95 transition-all">Bekor qilish</button>
                      <button onClick={saveEdit} className="flex-1 py-2 bg-[#d4af37] text-black text-[9px] font-black uppercase rounded-xl active:scale-95 transition-all">Saqlash</button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <img src={p.img} alt="" className="w-14 h-14 rounded-xl object-cover border border-white/10 shrink-0" />
                    <div className="flex-1 min-w-0 text-left">
                      <h4 className={`text-[11px] font-black ${textColor} truncate`}>{p.title.uz}</h4>
                      <p className="text-[9px] text-gray-400 font-bold">{p.gram} - {p.karat}</p>
                      <p className="text-[11px] font-black text-[#d4af37] mt-0.5">${p.price.toLocaleString('ru-RU')}</p>
                    </div>
                    <div className="flex flex-col gap-1.5 shrink-0">
                      <button onClick={() => startEdit(p)} className="w-7 h-7 rounded-full bg-[#d4af37]/15 text-[#d4af37] flex items-center justify-center text-[10px] active:scale-90 transition-all">
                        <i className="fas fa-edit"></i>
                      </button>
                      <button onClick={() => handleDelete(p)} className="w-7 h-7 rounded-full bg-red-500/15 text-red-500 flex items-center justify-center text-[10px] active:scale-90 transition-all">
                        <i className="fas fa-trash"></i>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {activeTab === 'sales' && (
          <div className="space-y-2.5 animate-slide-up">
            {mySales.length === 0 && (
              <div className={`${itemBg} border rounded-2xl p-6 text-center text-[10px] font-bold text-gray-400`}>
                Hozircha sotuv yo'q
              </div>
            )}
            {mySales.map((s, i) => (
              <div key={s.id || i} className={`${itemBg} border rounded-2xl p-3 flex items-center gap-3`}>
                <img src={s.img} alt="" className="w-11 h-11 rounded-lg object-cover border border-white/10 shrink-0" />
                <div className="flex-1 min-w-0 text-left">
                  <h4 className={`text-[10px] font-black ${textColor} truncate`}>{s.title}</h4>
                  <p className="text-[8.5px] text-gray-400 font-bold">{s.date}</p>
                </div>
                <div className="text-[11px] font-black text-green-500 shrink-0">${(s.price || 0).toLocaleString('ru-RU')}</div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
};
