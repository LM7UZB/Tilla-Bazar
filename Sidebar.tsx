import React, { useState, useEffect } from 'react';
import { UserAccount, Language, UIStrings, Product, CartItem } from '../types';
import { ADMIN_TELEGRAM, IMG_API_KEY, PRODUCTS } from '../constants';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  account: UserAccount;
  setAccount: (a: UserAccount) => void;
  theme: 'dark' | 'light';
  setTheme: (t: 'dark' | 'light') => void;
  lang: Language;
  setLang: (l: Language) => void;
  onSellClick: () => void;
  onLoginClick: () => void;
  strings: UIStrings;
  wishlist: number[];
  onWishlistToggle: (id: number) => void;
  cart: CartItem[];
  onAddToCart: (p: Product, e?: any) => void;
  onProductClick: (p: Product) => void;
  onAdminPanelClick: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  isOpen, onClose, account, setAccount, theme, setTheme, lang, setLang, onSellClick, onLoginClick, strings,
  wishlist, onWishlistToggle, cart, onAddToCart, onProductClick, onAdminPanelClick
}) => {
  const [isEditOpen, setEditOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [tempAccount, setTempAccount] = useState<UserAccount>({ ...account });

  // Best Bank rates matching screenshot 10
  const [bankRates, setBankRates] = useState(() => {
    const saved = localStorage.getItem('tilla_bazar_bank_rates');
    return saved ? JSON.parse(saved) : {
      sotish: [
        { bank: 'Hayot bank', rate: '12 050' },
        { bank: 'Asakabank', rate: '12 050' },
        { bank: 'Openbank', rate: '12 055' }
      ],
      sotib: [
        { bank: 'Universalbank', rate: '12 010' },
        { bank: 'Infinbank', rate: '12 010' },
        { bank: 'Turonbank', rate: '12 010' }
      ]
    };
  });
  const [isEditingBanks, setIsEditingBanks] = useState(false);

  // Accordion open/close states
  const [isOrdersOpen, setOrdersOpen] = useState(false);
  const [isFavsOpen, setFavsOpen] = useState(false);

  useEffect(() => {
    if (isEditOpen) {
      setTempAccount({ ...account });
    }
  }, [isEditOpen, account]);
  
  const sidebarBg = theme === 'light' 
    ? 'bg-[#f4f5f8] text-black shadow-2xl' 
    : 'bg-[#121214] text-white shadow-[0_0_50px_rgba(0,0,0,0.8)]';
    
  const textColor = theme === 'light' ? 'text-black' : 'text-white';
  const itemBg = theme === 'light' ? 'bg-[#ffffff] shadow-sm border border-gray-100/50' : 'bg-[#1a1a1e] border-white/5';

  const formatPhoneNumber = (value: string) => {
    if (!value) return '+998 ';
    let digits = value.replace(/\D/g, '');
    if (digits.startsWith('998')) digits = digits.substring(3);
    
    let formatted = '+998 ';
    if (digits.length > 0) formatted += digits.substring(0, 2);
    if (digits.length > 2) formatted += ' ' + digits.substring(2, 5);
    if (digits.length > 5) formatted += ' ' + digits.substring(5, 7);
    if (digits.length > 7) formatted += ' ' + digits.substring(7, 9);
    
    return formatted.trimEnd();
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value);
    if (formatted.length <= 17) {
      setTempAccount({ ...tempAccount, phone: formatted });
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    const formData = new FormData();
    formData.append("image", file);
    try {
      const res = await fetch(`https://api.imgbb.com/1/upload?key=${IMG_API_KEY}`, {
        method: "POST",
        body: formData
      });
      const data = await res.json();
      if (data.success) {
        setTempAccount({ ...tempAccount, avatar: data.data.url });
        if ((window as any).Telegram?.WebApp?.HapticFeedback) {
          (window as any).Telegram.WebApp.HapticFeedback.notificationOccurred('success');
        }
      }
    } catch (err) {
      alert("Error uploading avatar");
    } finally {
      setIsUploading(false);
    }
  };

  const handleSave = () => {
    setAccount({ ...tempAccount });
    setEditOpen(false);
    if ((window as any).Telegram?.WebApp?.HapticFeedback) {
      (window as any).Telegram.WebApp.HapticFeedback.notificationOccurred('success');
    }
  };

  const formattedDate = new Date().toLocaleDateString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });

  const orderedItems = cart.filter(item => item.status === 'ordered');
  const wishlistProducts = PRODUCTS.filter(p => wishlist.includes(p.id));

  return (
    <>
      <div 
        className={`fixed inset-0 bg-black/70 backdrop-blur-sm z-[100] transition-opacity duration-500 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />
      
      <div className={`fixed top-0 right-0 w-[330px] h-full ${sidebarBg} z-[101] transition-transform duration-500 ease-out overflow-y-auto scrollbar-none pb-8 ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        
        <div className="p-6 pt-8 flex justify-between items-center">
          <h3 className="text-[#d4af37] font-black text-2xl uppercase tracking-widest italic font-sans">
            {strings.profile}
          </h3>
          <button 
            onClick={onClose} 
            className="w-9 h-9 rounded-full bg-white shadow-md border border-gray-100 flex items-center justify-center text-gray-500 active:scale-90 transition-all"
          >
            <i className="fas fa-times text-md"></i>
          </button>
        </div>

        {/* Compact User Section (Replaced the massive card with a sleek top profile section) */}
        <div className="px-5 mb-4 animate-fade-in">
          <div className={`${itemBg} rounded-[28px] p-3.5 flex items-center justify-between border shadow-sm`}>
            <div className="flex items-center gap-3">
              {/* Rounded Avatar with premium gold gradient ring */}
              <div className="relative w-11 h-11 rounded-full bg-gradient-to-br from-[#d4af37] via-[#f0e68c] to-[#d4af37] p-0.5 shadow">
                <div className="w-full h-full rounded-full bg-black flex items-center justify-center overflow-hidden">
                  {account.avatar ? (
                    <img src={account.avatar} className="w-full h-full object-cover" alt="Profile" />
                  ) : (
                    <span className="text-xl">👤</span>
                  )}
                </div>
                {account.isOwner && (
                  <div className="absolute -bottom-0.5 -right-0.5 bg-yellow-500 text-black w-4.5 h-4.5 rounded-full flex items-center justify-center text-[8px] border border-white font-bold">
                    <i className="fas fa-check"></i>
                  </div>
                )}
              </div>
              
              {/* Text stack */}
              <div className="text-left">
                <h4 className={`text-sm font-black ${textColor} leading-tight`}>{account.name}</h4>
                <p className="text-[9px] text-[#d4af37] font-bold tracking-wider uppercase">{account.username}</p>
                {account.phone && <p className="text-[8px] text-gray-500 font-bold">{account.phone}</p>}
              </div>
            </div>
            
            {/* Quick Edit Action button */}
            <div className="flex items-center gap-1.5">
              <button 
                onClick={() => setEditOpen(true)}
                className="w-8 h-8 rounded-full bg-[#f4f5f8] dark:bg-white/5 text-[#d4af37] border border-gray-100 dark:border-white/5 flex items-center justify-center text-xs active:scale-90 transition-all hover:opacity-85"
                title={strings.edit}
              >
                <i className="fas fa-edit"></i>
              </button>
            </div>
          </div>
        </div>

        {/* Admin Panel Quick Access Button matching screenshot 11 */}
        {account.isAdmin && (
          <div className="px-5 mb-4 animate-fade-in">
            <button 
              onClick={() => {
                onAdminPanelClick();
                onClose();
              }}
              className="w-full flex items-center justify-between p-4 bg-[#d4af37] hover:bg-[#c29e2f] text-black rounded-[28px] group active:scale-95 transition-all shadow-lg shadow-[#d4af37]/15 border border-white/10"
            >
              <div className="flex items-center gap-3.5 text-left">
                <div className="w-10 h-10 bg-black/10 rounded-xl flex items-center justify-center text-black">
                  <i className="fas fa-shield-halved text-lg"></i>
                </div>
                <div className="flex flex-col">
                  <div className="font-black text-xs uppercase tracking-tight font-sans">{strings.adminPanel}</div>
                  <div className="text-[7.5px] font-black text-black/50 uppercase tracking-widest mt-0.5">{strings.reviewsStats}</div>
                </div>
              </div>
              <i className="fas fa-chevron-right text-xs mr-1 opacity-60"></i>
            </button>
          </div>
        )}

        {/* Interactive Accordion Menus (My Orders & Favorites inside Profile menu) */}
        <div className="px-5 mb-4 space-y-3 animate-fade-in">
          
          {/* Buyurtmalarim Section */}
          <div className={`${itemBg} rounded-[24px] border overflow-hidden shadow-sm transition-all`}>
            <button 
              onClick={() => {
                setOrdersOpen(!isOrdersOpen);
                setFavsOpen(false);
              }}
              className="w-full flex items-center justify-between p-4 font-black text-[11px] uppercase tracking-wider text-[#d4af37]"
            >
              <div className="flex items-center gap-2.5">
                <span className="text-sm">📦</span>
                <span>{strings.myOrders}</span>
                {orderedItems.length > 0 && (
                  <span className="bg-[#d4af37] text-black text-[8px] px-1.5 py-0.5 rounded-full font-black">
                    {orderedItems.length}
                  </span>
                )}
              </div>
              <i className={`fas fa-chevron-down text-[10px] transition-transform duration-300 ${isOrdersOpen ? 'rotate-180' : ''}`}></i>
            </button>
            
            {isOrdersOpen && (
              <div className="p-3.5 border-t border-gray-100 dark:border-white/5 max-h-[220px] overflow-y-auto space-y-2.5 scrollbar-none animate-slide-down">
                {orderedItems.length === 0 ? (
                  <div className="text-center py-6 text-gray-400 text-[10px] font-bold uppercase tracking-wider">
                    {strings.noOrdersYet}
                  </div>
                ) : (
                  orderedItems.map((item, idx) => (
                    <div 
                      key={idx} 
                      onClick={() => {
                        onProductClick(item.product);
                        onClose();
                      }}
                      className="flex gap-2.5 bg-gray-50 dark:bg-white/[0.02] p-2 rounded-xl border border-gray-100 dark:border-white/5 hover:border-[#d4af37]/30 transition-all cursor-pointer group"
                    >
                      <img src={item.product.img} className="w-10 h-10 object-cover rounded-lg flex-none border dark:border-white/5" alt="" />
                      <div className="flex-1 text-left min-w-0">
                        <div className={`text-[10px] font-black ${textColor} truncate group-hover:text-[#d4af37] transition-colors`}>
                          {item.product.title[lang]}
                        </div>
                        <div className="text-[9px] text-[#d4af37] font-extrabold mt-0.5">
                          {item.product.price.toLocaleString()} $
                        </div>
                        <div className="flex items-center justify-between mt-1 text-[7px] font-black uppercase text-gray-400">
                          <span>{item.orderDate || strings.today}</span>
                          <span className="bg-green-500/15 text-green-500 px-1.5 py-0.5 rounded">{strings.confirmed}</span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          {/* Sevimlilarim Section */}
          <div className={`${itemBg} rounded-[24px] border overflow-hidden shadow-sm transition-all`}>
            <button 
              onClick={() => {
                setFavsOpen(!isFavsOpen);
                setOrdersOpen(false);
              }}
              className="w-full flex items-center justify-between p-4 font-black text-[11px] uppercase tracking-wider text-[#d4af37]"
            >
              <div className="flex items-center gap-2.5">
                <span className="text-sm">❤️</span>
                <span>{strings.myWishlist}</span>
                {wishlistProducts.length > 0 && (
                  <span className="bg-red-500 text-white text-[8px] px-1.5 py-0.5 rounded-full font-black animate-pulse">
                    {wishlistProducts.length}
                  </span>
                )}
              </div>
              <i className={`fas fa-chevron-down text-[10px] transition-transform duration-300 ${isFavsOpen ? 'rotate-180' : ''}`}></i>
            </button>
            
            {isFavsOpen && (
              <div className="p-3.5 border-t border-gray-100 dark:border-white/5 max-h-[220px] overflow-y-auto space-y-2.5 scrollbar-none animate-slide-down">
                {wishlistProducts.length === 0 ? (
                  <div className="text-center py-6 text-gray-400 text-[10px] font-bold uppercase tracking-wider">
                    {strings.noWishlistYet}
                  </div>
                ) : (
                  wishlistProducts.map((p) => (
                    <div 
                      key={p.id}
                      className="flex gap-2.5 bg-gray-50 dark:bg-white/[0.02] p-2 rounded-xl border border-gray-100 dark:border-white/5 hover:border-[#d4af37]/30 transition-all text-left relative group-hover:shadow-[0_4px_12px_rgba(0,0,0,0.05)]"
                    >
                      {/* Image Thumbnail */}
                      <div 
                        onClick={() => {
                          onProductClick(p);
                          onClose();
                        }}
                        className="w-10 h-10 object-cover rounded-lg flex-none border dark:border-white/5 overflow-hidden cursor-pointer"
                      >
                        <img src={p.img} className="w-full h-full object-cover rounded-lg" alt="" />
                      </div>

                      {/* Info Details */}
                      <div className="flex-1 min-w-0 pr-12 cursor-pointer text-left" onClick={() => {
                        onProductClick(p);
                        onClose();
                      }}>
                        <div className={`text-[10px] font-black ${textColor} truncate group-hover:text-[#d4af37] transition-colors`}>
                          {p.title[lang]}
                        </div>
                        <div className="text-[9px] text-[#d4af37] font-extrabold mt-0.5">
                          {p.price.toLocaleString()} $
                        </div>
                        <div className="text-[7.5px] font-extrabold text-gray-400 mt-0.5">
                          Proba: {p.proba} • {p.gram}g
                        </div>
                      </div>

                      {/* Action buttons Pinned to the right */}
                      <div className="absolute right-2 top-1/2 -translate-y-1/2 flex flex-col gap-1 z-10">
                        {/* Add to Cart icon */}
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            onAddToCart(p, e);
                          }}
                          className="w-5.5 h-5.5 rounded bg-[#d4af37] text-black flex items-center justify-center text-[9px] active:scale-95 transition-all hover:opacity-90 shadow-sm"
                          title={strings.toCart}
                        >
                          <i className="fas fa-shopping-bag"></i>
                        </button>
                        {/* Trash outline */}
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            onWishlistToggle(p.id);
                          }}
                          className="w-5.5 h-5.5 rounded bg-red-500/10 hover:bg-red-500/20 text-red-500 flex items-center justify-center text-[8px] active:scale-95 transition-all"
                          title={strings.delete}
                        >
                          <i className="fas fa-trash-alt"></i>
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

        </div>

        {/* Seller Button */}
        <div className="px-5 mb-5">
          {account.isOwner ? (
            <button 
              onClick={onSellClick}
              className="w-full flex items-center justify-between p-5 bg-[#d4af37] text-black rounded-[28px] group active:scale-95 transition-all shadow-xl shadow-[#d4af37]/20 border border-white/10"
            >
              <div className="flex items-center gap-4 text-left">
                <div className="w-12 h-12 bg-black/10 rounded-2xl flex items-center justify-center">
                  <i className="fas fa-store text-xl"></i>
                </div>
                <div className="flex flex-col">
                  <div className="font-black text-sm uppercase tracking-tight">{strings.sellTitle}</div>
                  <div className="text-[8px] font-black text-black/50 uppercase tracking-widest mt-1">{account.storeName || strings.myStore}</div>
                </div>
              </div>
              <i className="fas fa-chevron-right mr-1 text-sm"></i>
            </button>
          ) : (
            <button 
              onClick={onLoginClick}
              className="w-full flex items-center justify-between p-4 bg-white text-black rounded-[28px] group active:scale-95 transition-all shadow-md hover:shadow-lg border border-gray-100"
            >
              <div className="flex items-center gap-4 text-left">
                <div className="w-12 h-12 bg-yellow-500/10 rounded-2xl flex items-center justify-center text-yellow-600">
                  <i className="fas fa-store text-xl"></i>
                </div>
                <div className="flex flex-col">
                  <div className="font-extrabold text-sm uppercase tracking-tight">{strings.loginAsStore}</div>
                  <div className="text-[7px] font-black text-gray-400 uppercase tracking-widest mt-1">{strings.sellStoreOnly}</div>
                </div>
              </div>
              <div className="flex items-center gap-1.5 text-gray-500">
                <i className="fas fa-sign-in-alt text-sm"></i>
              </div>
            </button>
          )}
        </div>

        {/* CBU Exhange Rates Widget */}
        <div className="px-5 mb-5">
          <div className={`${itemBg} rounded-[28px] p-4 border relative overflow-hidden flex flex-col gap-3 shadow-sm`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-green-500/20 text-green-600 flex items-center justify-center font-bold text-xs shadow-inner">
                  $
                </div>
                <span className="text-[9px] font-black text-gray-400 uppercase tracking-wider">USD / UZS • CBU</span>
              </div>
              <span className="text-[9px] text-gray-400 font-bold">{formattedDate}</span>
            </div>

            <div className="flex items-center justify-between border-t border-gray-100 dark:border-white/5 pt-2">
              <div className="flex items-baseline gap-1">
                <span className={`text-[21px] font-black ${textColor} tracking-tight font-sans`}>12 052,05</span>
                <span className="text-[10px] text-gray-400 font-bold uppercase">{strings.som}</span>
              </div>
              <div className="bg-green-100 dark:bg-green-950/40 text-green-600 dark:text-green-400 px-2.5 py-1 rounded-full text-[10px] font-extrabold flex items-center gap-1 shadow-sm">
                <i className="fas fa-arrow-up text-[8px]"></i>
                <span>+39.93</span>
              </div>
            </div>
          </div>
        </div>

        {/* ENG YAXSHI BANKLAR • USD Widget matching screenshot 10 */}
        <div className="px-5 mb-5 font-sans">
          <div className={`${itemBg} rounded-[28px] p-4 border relative overflow-hidden flex flex-col gap-2.5 shadow-sm`}>
            
            {/* Header part */}
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-white/5 pb-2.5">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-[#d4af37]/20 text-[#d4af37] flex items-center justify-center font-bold text-[10px] shadow-sm">
                  <i className="fas fa-landmark text-[9px]"></i>
                </div>
                <span className="text-[9px] font-black text-gray-400 uppercase tracking-wider">{strings.bestBanks}</span>
              </div>
              
              <div className="flex items-center gap-1.5">
                <button 
                  onClick={() => setIsEditingBanks(!isEditingBanks)}
                  className="w-5 h-5 rounded-full bg-[#d4af37]/15 hover:bg-[#d4af37]/25 text-[#d4af37] flex items-center justify-center text-[9px] active:scale-90 transition-all"
                  title={strings.edit}
                >
                  <i className="fas fa-edit"></i>
                </button>
              </div>
            </div>

            {/* Editable inline fields if writing mode is on */}
            {isEditingBanks ? (
              <div className="space-y-4 text-left p-1 animate-slide-up">
                <div>
                  <h4 className="text-[9px] font-black text-green-500 uppercase tracking-widest mb-2">{strings.sell} (USD):</h4>
                  <div className="space-y-1.5 w-full">
                    {bankRates.sotish.map((item: any, i: number) => (
                      <div key={i} className="flex gap-2 items-center">
                        <span className="text-[9px] font-bold text-gray-400 w-3">{i+1}.</span>
                        <input 
                          type="text" 
                          value={item.bank} 
                          onChange={e => {
                            const updated = { ...bankRates };
                            updated.sotish[i].bank = e.target.value;
                            setBankRates(updated);
                            localStorage.setItem('tilla_bazar_bank_rates', JSON.stringify(updated));
                          }}
                          className={`flex-1 ${itemBg} rounded-lg px-2 py-1 text-[10px] font-bold border outline-none focus:border-[#d4af37]/50 ${textColor}`}
                          placeholder="Bank"
                        />
                        <input 
                          type="text" 
                          value={item.rate} 
                          onChange={e => {
                            const updated = { ...bankRates };
                            updated.sotish[i].rate = e.target.value;
                            setBankRates(updated);
                            localStorage.setItem('tilla_bazar_bank_rates', JSON.stringify(updated));
                          }}
                          className={`w-16 ${itemBg} rounded-lg px-2 py-1 text-[10px] font-mono font-bold text-right border outline-none focus:border-[#d4af37]/50 ${textColor}`}
                          placeholder="Rate"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-[9px] font-black text-red-500 uppercase tracking-widest mb-2">{strings.buy} (USD):</h4>
                  <div className="space-y-1.5 w-full">
                    {bankRates.sotib.map((item: any, i: number) => (
                      <div key={i} className="flex gap-2 items-center">
                        <span className="text-[9px] font-bold text-gray-400 w-3">{i+1}.</span>
                        <input 
                          type="text" 
                          value={item.bank} 
                          onChange={e => {
                            const updated = { ...bankRates };
                            updated.sotib[i].bank = e.target.value;
                            setBankRates(updated);
                            localStorage.setItem('tilla_bazar_bank_rates', JSON.stringify(updated));
                          }}
                          className={`flex-1 ${itemBg} rounded-lg px-2 py-1 text-[10px] font-bold border outline-none focus:border-[#d4af37]/50 ${textColor}`}
                          placeholder="Bank"
                        />
                        <input 
                          type="text" 
                          value={item.rate} 
                          onChange={e => {
                            const updated = { ...bankRates };
                            updated.sotib[i].rate = e.target.value;
                            setBankRates(updated);
                            localStorage.setItem('tilla_bazar_bank_rates', JSON.stringify(updated));
                          }}
                          className={`w-16 ${itemBg} rounded-lg px-2 py-1 text-[10px] font-mono font-bold text-right border outline-none focus:border-[#d4af37]/50 ${textColor}`}
                          placeholder="Rate"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <button 
                  onClick={() => {
                    setIsEditingBanks(false);
                    if ((window as any).Telegram?.WebApp?.HapticFeedback) {
                      (window as any).Telegram.WebApp.HapticFeedback.notificationOccurred('success');
                    }
                  }}
                  className="w-full py-2 bg-[#d4af37] text-black font-black text-[9px] uppercase tracking-widest rounded-xl shadow active:scale-95 transition-all mt-2"
                >
                  {strings.save}
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4 text-left pt-1">
                {/* SOTISH Column */}
                <div>
                  <h4 className="text-[9px] font-black text-gray-400 uppercase tracking-wider mb-2.5 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                    <span>{strings.sell}</span>
                  </h4>
                  <div className="space-y-2">
                    {bankRates.sotish.map((item: any, i: number) => (
                      <div key={i} className="flex justify-between items-center text-[10.5px]">
                        <div className="flex items-center gap-1.5 truncate max-w-[65%]">
                          <span className="text-[10px] text-gray-400 font-bold">{i+1}.</span>
                          <span className={`font-bold ${textColor} truncate`}>{item.bank}</span>
                        </div>
                        <span className="font-mono font-extrabold text-[#d4af37] tracking-tight">{item.rate}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* SOTIB OLISH Column */}
                <div>
                  <h4 className="text-[9px] font-black text-gray-400 uppercase tracking-wider mb-2.5 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse"></span>
                    <span>{strings.buy}</span>
                  </h4>
                  <div className="space-y-2">
                    {bankRates.sotib.map((item: any, i: number) => (
                      <div key={i} className="flex justify-between items-center text-[10.5px]">
                        <div className="flex items-center gap-1.5 truncate max-w-[65%]">
                          <span className="text-[10px] text-gray-400 font-bold">{i+1}.</span>
                          <span className={`font-bold ${textColor} truncate`}>{item.bank}</span>
                        </div>
                        <span className="font-mono font-black text-gray-500 dark:text-gray-400 tracking-tight">{item.rate}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Settings Widget */}
        <div className="px-5 space-y-4 pb-8">
          <div className="text-[10px] text-gray-400 font-black uppercase tracking-[0.2em] ml-2 font-sans">{strings.settings.toUpperCase()}</div>
          
          <div className={`flex items-center gap-2 p-2.5 ${itemBg} rounded-[24px] border relative overflow-hidden shadow-sm`}>
            <div className="flex-none pr-3 border-r border-gray-100 dark:border-white/5">
              <button 
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="relative w-11 h-11 flex items-center justify-center rounded-2xl bg-[#eaebec]/60 dark:bg-white/5 overflow-hidden shadow-inner hover:scale-105 active:scale-95 transition-all"
              >
                <div className={`transition-all duration-700 transform flex items-center justify-center ${theme === 'light' ? 'rotate-0 scale-100' : 'rotate-[360deg] scale-0 absolute opacity-0'}`}>
                  <i className="fas fa-sun text-yellow-500 text-lg"></i>
                </div>
                <div className={`transition-all duration-700 transform flex items-center justify-center ${theme === 'dark' ? 'rotate-0 scale-100' : 'rotate-[-360deg] scale-0 absolute opacity-0'}`}>
                  <i className="fas fa-moon text-indigo-400 text-lg"></i>
                </div>
              </button>
            </div>

            <div className="flex-1 flex justify-around items-center px-1">
              {[
                { label: 'uz', flag: '🇺🇿' },
                { label: 'ru', flag: '🇷🇺' },
                { label: 'en', flag: '🇺🇸' }
              ].map(item => (
                <button 
                  key={item.label} 
                  onClick={() => setLang(item.label as Language)} 
                  className={`flex flex-col items-center gap-0.5 transition-all duration-300 ${lang === item.label ? 'scale-110 font-black opacity-100' : 'opacity-40 grayscale hover:opacity-75'}`}
                >
                  <span className="text-2xl filter drop-shadow-sm">{item.flag}</span>
                  <span className={`text-[8px] font-extrabold uppercase tracking-tighter ${textColor}`}>{item.label}</span>
                </button>
              ))}
            </div>
          </div>

          <button 
            onClick={() => window.open(ADMIN_TELEGRAM, '_blank')} 
            className={`w-full flex justify-between items-center p-4 ${itemBg} rounded-[24px] border group active:scale-[0.98] transition-all hover:bg-gray-100/50 dark:hover:bg-white/[0.02] shadow-sm`}
          >
            <div className="flex items-center gap-4">
              <div className="w-9 h-9 rounded-xl bg-green-500/10 flex items-center justify-center text-green-500">
                <i className="fas fa-headset text-sm"></i>
              </div>
              <span className={`text-[10px] font-black uppercase tracking-wider ${textColor}`}>{strings.adminContact.toUpperCase()}</span>
            </div>
            <i className="fas fa-chevron-right text-[10px] text-gray-400 group-hover:translate-x-0.5 transition-transform"></i>
          </button>
        </div>
      </div>

      {isEditOpen && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-3xl z-[200] flex items-center justify-center p-6 animate-fade-in">
          <div className={`w-full max-sm:max-w-xs max-w-sm ${theme === 'light' ? 'bg-white' : 'bg-[#141414]'} rounded-[40px] border border-[#d4af37]/30 p-8 shadow-2xl space-y-6 animate-slide-up`}>
            <div className="text-center">
              <h2 className="text-xl font-black text-[#d4af37] italic uppercase tracking-tighter mb-4">{strings.edit}</h2>
              
              <label className="block w-24 h-24 mx-auto mb-6 relative cursor-pointer group">
                <div className="w-full h-full rounded-full border-2 border-dashed border-[#d4af37]/40 flex items-center justify-center overflow-hidden">
                  {isUploading ? (
                    <i className="fas fa-circle-notch fa-spin text-[#d4af37]"></i>
                  ) : tempAccount.avatar ? (
                    <img src={tempAccount.avatar} className="w-full h-full object-cover" alt="Avatar Preview" />
                  ) : (
                    <i className="fas fa-camera text-gray-500 text-xl"></i>
                  )}
                </div>
                <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                   <i className="fas fa-edit text-white text-xs"></i>
                </div>
                <input type="file" hidden accept="image/*" onChange={handleAvatarUpload} />
              </label>
            </div>

            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest ml-2">{strings.fullNameLabel}</label>
                <input type="text" className={`w-full ${itemBg} rounded-xl p-4 text-sm ${textColor} focus:border-[#d4af37]/50 outline-none border border-transparent transition-all`} value={tempAccount.name} onChange={e => setTempAccount({...tempAccount, name: e.target.value})} placeholder={strings.fullNameLabel} />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest ml-2">{strings.telegramLabel}</label>
                <input type="text" className={`w-full ${itemBg} rounded-xl p-4 text-sm ${textColor} focus:border-[#d4af37]/50 outline-none border border-transparent transition-all`} value={tempAccount.username} onChange={e => setTempAccount({...tempAccount, username: e.target.value})} placeholder="@username" />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest ml-2">{strings.phoneLabel}</label>
                <input type="text" className={`w-full ${itemBg} rounded-xl p-4 text-sm ${textColor} focus:border-[#d4af37]/50 outline-none border border-transparent transition-all`} value={tempAccount.phone} onChange={handlePhoneChange} placeholder="+998 XX XXX XX XX" />
              </div>
            </div>

            <div className="flex flex-col gap-2 pt-2">
              <button onClick={handleSave} className="w-full py-4 bg-[#d4af37] text-black font-black rounded-2xl uppercase text-xs tracking-widest shadow-lg shadow-[#d4af37]/20 active:scale-95 transition-all">{strings.save}</button>
              <button onClick={() => setEditOpen(false)} className="w-full py-2 text-gray-500 font-black uppercase text-[10px] tracking-[0.2em]">{strings.cancel}</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
