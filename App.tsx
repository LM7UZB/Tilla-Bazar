
import React, { useState, useEffect, useMemo } from 'react';
import { Category, Product, UserAccount, Language, SortOption, CartItem, UIStrings, Slide } from './types';
import { PRODUCTS, STRINGS, UZUM_LINK } from './constants';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { Navigation } from './components/Navigation';
import { ProductGrid } from './components/ProductGrid';
import { AdSlider } from './components/AdSlider'; 
import { ProductModal } from './components/ProductModal';
import { CartPage } from './components/CartPage';
import { WishlistPage } from './components/WishlistPage';
import { SellModal } from './components/SellModal';
import { FilterDrawer } from './components/FilterDrawer';
import { CheckoutModal } from './components/CheckoutModal';
import { LoginModal } from './components/LoginModal';
import { RatesModal, DEFAULT_RATES, MetalRate } from './components/RatesModal';
import { AdminPanelModal } from './components/AdminPanelModal';
import { SellerPanelModal } from './components/SellerPanelModal';
import { notifyAdmin, customerInfoText } from './utils/telegram';
import { fetchSharedState, saveSharedState } from './utils/state';

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<Category>('home');
  const [selectedStore, setSelectedStore] = useState<string | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<number[]>([]);
  const [soldProductIds, setSoldProductIds] = useState<number[]>([]);
  const [lang, setLang] = useState<Language>('uz');
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [isSellModalOpen, setSellModalOpen] = useState(false);
  const [isLoginModalOpen, setLoginModalOpen] = useState(false);
  const [isFilterOpen, setFilterOpen] = useState(false);
  const [isCheckoutModalOpen, setCheckoutModalOpen] = useState(false);
  const [isRatesOpen, setIsRatesOpen] = useState(false);
  const [isAdminPanelOpen, setIsAdminPanelOpen] = useState(false);
  const [isSellerPanelOpen, setIsSellerPanelOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [cartAnimations, setCartAnimations] = useState<{ id: string; x: number; y: number; img: string }[]>([]);
  const [selectedSubcat, setSelectedSubcat] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [productsList, setProductsList] = useState<Product[]>(() => {
    const saved = localStorage.getItem('tilla_bazar_products_list');
    return saved ? JSON.parse(saved) : PRODUCTS;
  });
  const [metalRates, setMetalRates] = useState<MetalRate[]>(() => {
    const saved = localStorage.getItem('tilla_bazar_metal_rates');
    return saved ? JSON.parse(saved) : DEFAULT_RATES;
  });

  const [slides, setSlides] = useState<Slide[]>(() => {
    const saved = localStorage.getItem('tilla_bazar_slides');
    return saved ? JSON.parse(saved) : [
      { 
        id: 1, 
        img: "https://images.unsplash.com/photo-1599643478518-17488fbbcd75?auto=format&fit=crop&q=80&w=1200", 
        target: { type: 'store', value: 'LM Gold' }
      },
      { 
        id: 2, 
        img: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&q=80&w=1200", 
        target: { type: 'store', value: 'Fonon' }
      },
      { 
        id: 3, 
        img: "https://images.unsplash.com/photo-1629224316810-9d8805b95076?auto=format&fit=crop&q=80&w=1200", 
        target: { type: 'category', value: 'silver' }
      },
      { 
        id: 4, 
        img: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&q=80&w=1200", 
        target: { type: 'store', value: 'Zarbazzar' }
      }
    ];
  });

  useEffect(() => {
    localStorage.setItem('tilla_bazar_slides', JSON.stringify(slides));
  }, [slides]);

  const [pendingProducts, setPendingProducts] = useState<any[]>(() => {
    const saved = localStorage.getItem('tilla_bazar_pending_products');
    return saved ? JSON.parse(saved) : [
      {
        id: 'p1',
        title: 'LM Gold Italiya Dizayn Olmosli Shokila',
        price: 4500,
        gram: '12.5 gr',
        store: 'LM Gold',
        status: 'pending',
        img: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=300&q=80'
      }
    ];
  });

  const [sellersList, setSellersList] = useState(() => {
    const saved = localStorage.getItem('tilla_bazar_sellers_list');
    return saved ? JSON.parse(saved) : [
      {
        name: 'LM Gold',
        productsCount: 1,
        stats: { tasdiq: 0, kutilmoqda: 0, rad: 0, sotilgan: 1 }
      },
      {
        name: 'Fonon',
        productsCount: 3,
        stats: { tasdiq: 2, kutilmoqda: 1, rad: 0, sotilgan: 4 }
      },
      {
        name: 'Akzar',
        productsCount: 2,
        stats: { tasdiq: 1, kutilmoqda: 0, rad: 1, sotilgan: 2 }
      }
    ];
  });

  const [sellerApplications, setSellerApplications] = useState<any[]>(() => {
    const saved = localStorage.getItem('tilla_bazar_seller_apps');
    return saved ? JSON.parse(saved) : [];
  });

  const [salesHistory, setSalesHistory] = useState<any[]>(() => {
    const saved = localStorage.getItem('tilla_bazar_sales_history');
    return saved ? JSON.parse(saved) : [
      {
        id: 's1',
        title: 'LM Gold Elegant Olmosli Shokila',
        price: 4500,
        store: 'LM Gold',
        gram: '12.5 gr',
        img: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=300&q=80',
        date: new Date().toISOString().split('T')[0]
      }
    ];
  });

  const [account, setAccount] = useState<UserAccount>(() => {
    const params = new URLSearchParams(window.location.search);
    const adminParam = params.get('admin');

    const tgUser = (window as any).Telegram?.WebApp?.initDataUnsafe?.user;
    const tgId = tgUser?.id?.toString() || adminParam || '';

    if (tgId === '147775103') {
      return {
        name: tgUser?.first_name || "Lazizbek",
        username: tgUser?.username ? `@${tgUser.username}` : "@lazizbekmm72",
        phone: "+998 90 147 77 51",
        avatar: tgUser?.photo_url || "",
        isOwner: true,
        isAdmin: true,
        telegramId: '147775103',
        storeName: "LM Gold"
      };
    }

    const saved = localStorage.getItem('tilla_bazar_account');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.telegramId === '147775103') {
        return {
          ...parsed,
          isOwner: true,
          isAdmin: true,
          storeName: parsed.storeName || "LM Gold"
        };
      }
      return parsed;
    }

    return {
      name: tgUser?.first_name || "Mijoz",
      username: tgUser?.username ? `@${tgUser.username}` : "@mijoz",
      phone: "",
      avatar: tgUser?.photo_url || "",
      isOwner: false,
      isAdmin: false,
      telegramId: tgId || '',
      sellerStatus: 'none'
    };
  });

  useEffect(() => {
    if (account.telegramId === '147775103' && (!account.isAdmin || !account.isOwner)) {
      setAccount(prev => ({
        ...prev,
        isAdmin: true,
        isOwner: true,
        storeName: prev.storeName || "LM Gold"
      }));
    }
    localStorage.setItem('tilla_bazar_account', JSON.stringify(account));
  }, [account]);

  useEffect(() => {
    localStorage.setItem('tilla_bazar_products_list', JSON.stringify(productsList));
  }, [productsList]);

  useEffect(() => {
    localStorage.setItem('tilla_bazar_pending_products', JSON.stringify(pendingProducts));
  }, [pendingProducts]);

  useEffect(() => {
    localStorage.setItem('tilla_bazar_sellers_list', JSON.stringify(sellersList));
  }, [sellersList]);

  useEffect(() => {
    localStorage.setItem('tilla_bazar_seller_apps', JSON.stringify(sellerApplications));
  }, [sellerApplications]);

  useEffect(() => {
    localStorage.setItem('tilla_bazar_sales_history', JSON.stringify(salesHistory));
  }, [salesHistory]);

  useEffect(() => {
    localStorage.setItem('tilla_bazar_metal_rates', JSON.stringify(metalRates));
  }, [metalRates]);

  // --- Server bilan sinxronlash: sayt ochilganda umumiy (hammaga bir xil) ma'lumotni yuklab olamiz ---
  const hydratedFromServer = React.useRef(false);
  useEffect(() => {
    fetchSharedState().then((shared) => {
      if (shared) {
        if (shared.productsList) setProductsList(shared.productsList);
        if (shared.pendingProducts) setPendingProducts(shared.pendingProducts);
        if (shared.sellersList) setSellersList(shared.sellersList);
        if (shared.sellerApplications) setSellerApplications(shared.sellerApplications);
        if (shared.salesHistory) setSalesHistory(shared.salesHistory);
        if (shared.slides) setSlides(shared.slides);
        if (shared.metalRates) setMetalRates(shared.metalRates);
      }
      hydratedFromServer.current = true;
    });
  }, []);

  // Har qanday o'zgarish serverga (umumiy bazaga) ham yoziladi -> barcha mijoz/adminlarda bir xil ko'rinadi.
  useEffect(() => {
    if (!hydratedFromServer.current) return;
    saveSharedState({ productsList, pendingProducts, sellersList, sellerApplications, salesHistory, slides, metalRates });
  }, [productsList, pendingProducts, sellersList, sellerApplications, salesHistory, slides, metalRates]);

  const handleApproveProduct = (id: string) => {
    setPendingProducts(prev => prev.map(p => p.id === id ? { ...p, status: 'approved' } : p));
    const found = pendingProducts.find(p => p.id === id);
    if (found) {
      const mainProd: Product = {
        id: Math.floor(Math.random() * 1000000) + 1000,
        cat: 'gold',
        type: 'ring',
        title: { uz: found.title, ru: found.title, en: found.title },
        price: found.price,
        gram: found.gram,
        gramValue: parseFloat(found.gram) || 10,
        proba: '585',
        karat: '14K',
        desc: { uz: "Tasdiqlangan mahsulot", ru: "Одобренный товар", en: "Approved product" },
        store: found.store,
        location: "Toshkent sh.",
        logo: "",
        img: found.img
      };
      setProductsList(prev => [mainProd, ...prev]);

      setSellersList(prevSellers => prevSellers.map(s => {
        if (s.name.toLowerCase() === found.store.toLowerCase()) {
          return {
            ...s,
            productsCount: s.productsCount + 1,
            stats: { 
              ...s.stats, 
              tasdiq: s.stats.tasdiq + 1,
              kutilmoqda: Math.max(0, s.stats.kutilmoqda - 1)
            }
          };
        }
        return s;
      }));
    }
  };

  const handleRejectProduct = (id: string) => {
    setPendingProducts(prev => prev.map(p => p.id === id ? { ...p, status: 'rejected' } : p));
    const found = pendingProducts.find(p => p.id === id);
    if (found) {
      setSellersList(prevSellers => prevSellers.map(s => {
        if (s.name.toLowerCase() === found.store.toLowerCase()) {
          return {
            ...s,
            stats: { 
              ...s.stats, 
              rad: s.stats.rad + 1,
              kutilmoqda: Math.max(0, s.stats.kutilmoqda - 1)
            }
          };
        }
        return s;
      }));
    }
  };

  const handleApproveSeller = (id: string) => {
    setSellerApplications(prev => prev.map(app => app.id === id ? { ...app, status: 'approved' } : app));
    const found = sellerApplications.find(app => app.id === id);
    if (found) {
      setSellersList(prev => {
        if (!prev.some(s => s.name.toLowerCase() === found.storeName.toLowerCase())) {
          return [...prev, {
            name: found.storeName,
            productsCount: 0,
            stats: { tasdiq: 0, kutilmoqda: 0, rad: 0, sotilgan: 0 }
          }];
        }
        return prev;
      });

      if (account.telegramId === found.telegramId) {
        setAccount(prev => ({
          ...prev,
          isOwner: true,
          sellerStatus: 'approved',
          storeName: found.storeName
        }));
      }
    }
  };

  const handleRejectSeller = (id: string) => {
    setSellerApplications(prev => prev.map(app => app.id === id ? { ...app, status: 'rejected' } : app));
    const found = sellerApplications.find(app => app.id === id);
    if (found && account.telegramId === found.telegramId) {
      setAccount(prev => ({
        ...prev,
        isOwner: false,
        sellerStatus: 'rejected'
      }));
    }
  };

  const handleAddPendingSellerApp = (newApp: any) => {
    setSellerApplications(prev => [newApp, ...prev]);
    notifyAdmin(
      `🏪 Yangi sotuvchi arizasi!\n\n` +
      `🏢 Do'kon nomi: ${newApp?.storeName || '-'}\n` +
      `${customerInfoText()}`
    );
  };

  const notifyOrderPlaced = (pendingItems: CartItem[], paymentLabel: string) => {
    const total = pendingItems.reduce((sum, item) => sum + item.product.price, 0);
    const lines = pendingItems
      .map((item) => `• ${item.product.title[lang] || item.product.title.uz} — ${item.product.price}$ (${item.product.store})`)
      .join('\n');
    notifyAdmin(
      `🛒 Yangi buyurtma!\n\n${lines}\n\n💳 To'lov: ${paymentLabel}\n💵 Jami: ${total}$\n\n${customerInfoText()}`
    );
  };

  // Reset subcategory selection and search fields when the main category changes
  useEffect(() => {
    setSelectedSubcat(null);
    setSearchQuery('');
    setIsSearchOpen(false);
  }, [currentPage]);

  const [filters, setFilters] = useState({ proba: '', gramRange: '', location: '' });
  const [sort, setSort] = useState<SortOption>('none');
  const s = STRINGS[lang];

  const showNotification = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  };

  const addToCart = (p: Product, e?: any) => {
    setCart(prev => [...prev, { product: p, status: 'pending' }]);

    // 1. Play Telegram WebApp haptic success notification
    if ((window as any).Telegram?.WebApp?.HapticFeedback) {
      (window as any).Telegram.WebApp.HapticFeedback.notificationOccurred('success');
    }

    // 2. Set start positions (defaulting to screen center)
    let startX = window.innerWidth / 2;
    let startY = window.innerHeight / 2 - 100;

    if (e) {
      if (e.clientX && e.clientY) {
        startX = e.clientX;
        startY = e.clientY;
      } else if (e.nativeEvent && e.nativeEvent.clientX && e.nativeEvent.clientY) {
        startX = e.nativeEvent.clientX;
        startY = e.nativeEvent.clientY;
      }
    }

    const animId = Math.random().toString();
    setCartAnimations(prev => [...prev, { id: animId, x: startX, y: startY, img: p.img }]);

    // Auto-clean animation state after 1 second
    setTimeout(() => {
      setCartAnimations(prev => prev.filter(a => a.id !== animId));
    }, 1000);

    showNotification(lang === 'uz' ? "Savatga qo'shildi!" : lang === 'ru' ? "Добавлено в корзину!" : "Added to cart!");
  };

  const toggleWishlist = (id: number) => {
    setWishlist(prev => {
      const isIncluded = prev.includes(id);
      if (!isIncluded) showNotification(lang === 'uz' ? "Sevimlilarga qo'shildi!" : lang === 'ru' ? "Добавлено в избранное!" : "Added to favorites!");
      return isIncluded ? prev.filter(i => i !== id) : [...prev, id];
    });
  };

  const handleStoreSelect = (storeName: string) => {
    setSelectedStore(storeName);
    setCurrentPage('home');
    setSidebarOpen(false);
  };

  const matchSubcat = (p: Product, subcat: string | null) => {
    if (!subcat || subcat === 'all') return true;
    const titleUZ = p.title.uz.toLowerCase();
    const titleRU = p.title.ru.toLowerCase();
    const titleEN = p.title.en.toLowerCase();
    const type = p.type.toLowerCase();

    if (subcat === 'uzuk') {
      return (
        type === 'ring' ||
        type === 'uzuk' ||
        titleUZ.includes('uzuk') ||
        titleRU.includes('кольцо') ||
        titleEN.includes('ring')
      );
    }
    if (subcat === 'zirak') {
      return (
        type === 'earring' ||
        type === 'earrings' ||
        type === 'zirak' ||
        titleUZ.includes('zirak') ||
        titleUZ.includes('isirg') ||
        titleRU.includes('серьг') ||
        titleEN.includes('earring')
      );
    }
    if (subcat === 'sepochka') {
      return (
        type === 'chain' ||
        type === 'necklace' ||
        type === 'sepochka' ||
        titleUZ.includes('sepochka') ||
        titleUZ.includes('shokila') ||
        titleUZ.includes('zanjir') ||
        titleRU.includes('цеп') ||
        titleRU.includes('колье') ||
        titleRU.includes('ожерелье') ||
        titleEN.includes('necklace') ||
        titleEN.includes('chain')
      );
    }
    if (subcat === 'braslet') {
      return (
        type === 'bracelet' ||
        type === 'braslet' ||
        titleUZ.includes('braslet') ||
        titleUZ.includes('bilaguzuk') ||
        titleRU.includes('браслет') ||
        titleEN.includes('bracelet')
      );
    }
    if (subcat === 'kulon') {
      return (
        type === 'pendant' ||
        type === 'kulon' ||
        type === 'podveska' ||
        titleUZ.includes('kulon') ||
        titleUZ.includes('podveska') ||
        titleRU.includes('кулон') ||
        titleRU.includes('подвеск') ||
        titleEN.includes('pendant')
      );
    }
    if (subcat === 'komplekt') {
      return (
        type === 'set' ||
        type === 'komplekt' ||
        type === 'toplam' ||
        titleUZ.includes('komplekt') ||
        titleUZ.includes('to\'plam') ||
        titleRU.includes('комплект') ||
        titleRU.includes('гарнитур') ||
        titleEN.includes('set')
      );
    }
    if (subcat === 'soat') {
      return (
        type === 'clock' ||
        type === 'watch' ||
        type === 'soat' ||
        titleUZ.includes('soat') ||
        titleRU.includes('час') ||
        titleEN.includes('watch') ||
        titleEN.includes('clock')
      );
    }
    return true;
  };

  const displayProducts = useMemo(() => {
    let res = productsList.filter(p => !soldProductIds.includes(p.id));
    if (currentPage === 'gold') res = res.filter(p => p.cat === 'gold');
    if (currentPage === 'silver') res = res.filter(p => p.cat === 'silver');
    if (selectedStore) res = res.filter(p => p.store === selectedStore);
    
    if (selectedSubcat) {
      res = res.filter(p => matchSubcat(p, selectedSubcat));
    }

    if (searchQuery) {
      const q = searchQuery.toLowerCase().trim();
      res = res.filter(p => 
        p.title.uz.toLowerCase().includes(q) ||
        p.title.ru.toLowerCase().includes(q) ||
        p.title.en.toLowerCase().includes(q) ||
        (p.desc && (
          p.desc.uz.toLowerCase().includes(q) ||
          p.desc.ru.toLowerCase().includes(q) ||
          p.desc.en.toLowerCase().includes(q)
        )) ||
        p.proba.toLowerCase().includes(q) ||
        p.store.toLowerCase().includes(q) ||
        p.location.toLowerCase().includes(q)
      );
    }
    
    if (filters.proba) res = res.filter(p => p.proba === filters.proba);
    if (filters.location) res = res.filter(p => p.location === filters.location);
    if (filters.gramRange) {
      const [min, max] = filters.gramRange.replace('+', '-1000').split('-').map(Number);
      res = res.filter(p => p.gramValue >= min && (max === 1000 ? true : p.gramValue <= max));
    }

    if (sort === 'price-asc') res.sort((a, b) => a.price - b.price);
    if (sort === 'price-desc') res.sort((a, b) => b.price - a.price);

    return res;
  }, [currentPage, soldProductIds, selectedStore, filters, sort, selectedSubcat, searchQuery]);

  const subcategories = [
    { id: 'all', label: { uz: 'Barchasi', ru: 'Все', en: 'All' }, icon: '✨' },
    { id: 'uzuk', label: { uz: 'Uzuk', ru: 'Кольца', en: 'Rings' }, icon: '💍' },
    { id: 'zirak', label: { uz: 'Zirak', ru: 'Серьги', en: 'Earrings' }, icon: '💎' },
    { id: 'sepochka', label: { uz: 'Sepochka', ru: 'Цепочки', en: 'Chains' }, icon: '📿' },
    { id: 'braslet', label: { uz: 'Braslet', ru: 'Браслеты', en: 'Bracelets' }, icon: '🪙' },
    { id: 'kulon', label: { uz: 'Kulon', ru: 'Кулоны', en: 'Pendants' }, icon: '🏅' },
    { id: 'komplekt', label: { uz: 'To\'plam', ru: 'Комплекты', en: 'Sets' }, icon: '👑' },
    { id: 'soat', label: { uz: 'Soat', ru: 'Часы', en: 'Watches' }, icon: '⌚' }
  ];

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-[#0a0a0a]' : 'bg-gray-50'} transition-colors duration-500`}>
      {toast && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[100] bg-[#d4af37] text-black px-6 py-2 rounded-full font-bold shadow-2xl animate-fade-in">
          {toast}
        </div>
      )}
      
      <Header onMenuClick={() => setSidebarOpen(true)} onRatesClick={() => setIsRatesOpen(true)} theme={theme} lang={lang} />
      
      <main className="animate-fade-in pb-32 max-w-7xl mx-auto">
        {currentPage === 'home' && (
          <>
            <AdSlider slides={slides} onBannerClick={(slide) => {
              if (slide.videoUrl) { window.open(slide.videoUrl, '_blank'); return; }
              if (slide.target.type === 'url') { window.open(slide.target.value, '_blank'); return; }
              if (slide.target.type === 'store') { handleStoreSelect(slide.target.value); return; }
              setCurrentPage(slide.target.value as Category);
            }} />
            
            <div className="px-6 mt-10 mb-2 flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="w-1.5 h-6 bg-[#d4af37] rounded-full"></span>
                  <h2 className={`text-xl font-black uppercase tracking-tighter ${theme === 'light' ? 'text-black' : 'text-white'}`}>
                    {selectedStore ? `${selectedStore} ${s.storeProducts}` : s.allProducts}
                  </h2>
                </div>
                {selectedStore && (
                  <button 
                    onClick={() => setSelectedStore(null)}
                    className="text-[9px] font-black text-[#d4af37] border-b border-[#d4af37] pb-0.5 uppercase tracking-widest active:scale-95 transition-transform"
                  >
                    {s.showAll}
                  </button>
                )}
              </div>
            </div>
            <ProductGrid products={displayProducts} onProductClick={setSelectedProduct} onWishlistToggle={toggleWishlist} wishlist={wishlist} onAddToCart={addToCart} onStoreClick={handleStoreSelect} theme={theme} lang={lang} />
          </>
        )}
        
        {currentPage === 'cart' && (
          <div className="p-4">
            <CartPage 
              cart={cart} 
              onRemove={(i) => setCart(prev => prev.filter((_, idx) => idx !== i))} 
              onCheckout={() => setCheckoutModalOpen(true)} 
              onProductClick={setSelectedProduct}
              strings={s} 
              theme={theme} 
              lang={lang} 
            />
          </div>
        )}

        {(currentPage === 'gold' || currentPage === 'silver') && (
          <>
            <div className="flex justify-between items-center px-6 mt-6 mb-2">
              <h2 className={`text-2xl font-black uppercase tracking-tighter ${theme === 'light' ? 'text-black' : 'text-[#d4af37]'}`}>
                {currentPage === 'gold' ? s.gold : s.silver} {s.items}
              </h2>
              <div className="flex gap-2">
                {/* Search Toggle Icon Button - Sleek Liquid Glassmorphic Styling resembling 'Lupacha' */}
                <button 
                  onClick={() => {
                    setIsSearchOpen(!isSearchOpen);
                    if ((window as any).Telegram?.WebApp?.HapticFeedback) {
                      (window as any).Telegram.WebApp.HapticFeedback.impactOccurred('light');
                    }
                  }} 
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center border active:scale-90 transition-all duration-300 backdrop-blur-xl ${
                    isSearchOpen 
                      ? 'bg-gradient-to-r from-[#d4af37]/35 to-[#e7ca70]/35 text-[#d4af37] border-[#d4af37]/65 shadow-[0_0_15px_rgba(212,175,55,0.45)]' 
                      : theme === 'dark'
                        ? 'bg-white/[0.04] text-[#d4af37] border-[#d4af37]/20 hover:bg-white/[0.08] hover:border-[#d4af37]/45'
                        : 'bg-white text-[#d4af37] border-[#d4af37]/25 hover:bg-gray-50 hover:border-[#d4af37]'
                  }`}
                  title={lang === 'uz' ? 'Qidirish' : 'Поиск'}
                >
                  <i className="fas fa-search text-base animate-pulse"></i>
                </button>

                <button onClick={() => setFilterOpen(true)} className="w-12 h-12 rounded-2xl bg-[#d4af37]/10 text-[#d4af37] flex items-center justify-center border border-[#d4af37]/20 active:scale-90 transition-transform">
                  <i className="fas fa-filter"></i>
                </button>
              </div>
            </div>

            {/* Liquid Glass search query input box */}
            {isSearchOpen && (
              <div className="px-6 mb-4 animate-fade-in relative z-20">
                <div className={`relative flex items-center rounded-2xl border transition-all duration-300 ${
                  theme === 'dark' 
                    ? 'bg-gradient-to-r from-white/[0.04] to-white/[0.02] border-[#d4af37]/30 focus-within:border-[#d4af37] focus-within:shadow-[0_0_12px_rgba(212,175,55,0.25)]' 
                    : 'bg-gradient-to-r from-white to-gray-50/80 border-[#d4af37]/30 focus-within:border-[#d4af37] focus-within:shadow-[0_4px_12px_rgba(212,175,55,0.15)]'
                } backdrop-blur-3xl p-1.5`}>
                  <i className="fas fa-search pl-3.5 text-[#d4af37]/80 text-sm"></i>
                  <input 
                    type="text" 
                    placeholder={lang === 'uz' ? "Nomi, probasi yokida do'kondan qidirish..." : lang === 'ru' ? "Поиск по имени, пробе или магазину..." : "Search by name, purity, store..."}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className={`flex-1 bg-transparent px-3 py-1.5 text-xs font-black tracking-wide focus:outline-none ${
                      theme === 'dark' ? 'text-white placeholder-gray-500' : 'text-gray-900 placeholder-gray-400'
                    }`}
                    autoFocus
                  />
                  {searchQuery && (
                    <button 
                      onClick={() => {
                        setSearchQuery('');
                        if ((window as any).Telegram?.WebApp?.HapticFeedback) {
                          (window as any).Telegram.WebApp.HapticFeedback.impactOccurred('light');
                        }
                      }} 
                      className={`w-7 h-7 rounded-xl flex items-center justify-center transition-colors ${
                        theme === 'dark' ? 'hover:bg-white/10 text-gray-400 hover:text-white' : 'hover:bg-gray-100 text-gray-500 hover:text-gray-900'
                      }`}
                    >
                      <i className="fas fa-times text-xs"></i>
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Horizontal Subcategory scrolling capsules with ultra-modern glassmorphic "shisha" styles */}
            <div className="px-6 mb-4 overflow-x-auto scrollbar-none flex gap-2.5 py-1 select-none">
              {subcategories.map(catItem => {
                const isActive = (selectedSubcat || 'all') === catItem.id;
                
                // Pure high-fidelity glassmorphism styles matching light/dark themes
                const glassStyle = theme === 'dark'
                  ? isActive
                    ? 'bg-[#d4af37]/25 text-[#d4af37] border-[#d4af37]/60 shadow-[0_0_15px_rgba(212,175,55,0.35)]'
                    : 'bg-white/[0.04] text-gray-300 border-white/[0.06] hover:bg-white/[0.08]'
                  : isActive
                    ? 'bg-[#d4af37]/20 text-[#d4af37] border-[#d4af37]/50 shadow-[0_4px_12px_rgba(212,175,55,0.25)]'
                    : 'bg-white text-gray-700 border-gray-200/80 hover:bg-gray-100 shadow-sm';

                return (
                  <button
                    key={catItem.id}
                    onClick={() => {
                      setSelectedSubcat(catItem.id === 'all' ? null : catItem.id);
                      if ((window as any).Telegram?.WebApp?.HapticFeedback) {
                        (window as any).Telegram.WebApp.HapticFeedback.impactOccurred('light');
                      }
                    }}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-full border text-xs font-black uppercase tracking-wider backdrop-blur-3xl transition-all duration-300 active:scale-95 whitespace-nowrap ${glassStyle}`}
                  >
                    <span className="text-sm">{catItem.icon}</span>
                    <span>{catItem.label[lang] || catItem.label['uz']}</span>
                  </button>
                );
              })}
            </div>

            <ProductGrid products={displayProducts} onProductClick={setSelectedProduct} onWishlistToggle={toggleWishlist} wishlist={wishlist} onAddToCart={addToCart} onStoreClick={handleStoreSelect} theme={theme} lang={lang} />
          </>
        )}

        {currentPage === 'wishlist' && (
          <div className="p-4">
            <WishlistPage wishlist={wishlist} allProducts={productsList} onProductClick={setSelectedProduct} onWishlistToggle={toggleWishlist} onAddToCart={addToCart} strings={s} theme={theme} lang={lang} />
          </div>
        )}
      </main>
      
      {/* 3D Flying Add-to-Cart Animation Layer */}
      {cartAnimations.map(anim => {
        const destX = (window.innerWidth / 2) + 105 - anim.x;
        const destY = (window.innerHeight - 75) - anim.y;
        // Parabolic trajectory coordinates
        const midX = destX * 0.45;
        const midY = destY * 0.15 - 140; // High visual arc path

        return (
          <div
            key={anim.id}
            className="fly-item fixed w-12 h-12 rounded-full border-2 border-[#d4af37] bg-[#15171e]/95 flex items-center justify-center overflow-hidden shadow-2xl"
            style={{
              left: anim.x - 24,
              top: anim.y - 24,
              '--dest-x': `${destX}px`,
              '--dest-y': `${destY}px`,
              '--mid-x': `${midX}px`,
              '--mid-y': `${midY}px`,
            } as React.CSSProperties}
          >
            <img 
              referrerPolicy="no-referrer"
              src={anim.img} 
              alt="Item fly" 
              className="w-full h-full object-cover rounded-full" 
            />
          </div>
        );
      })}

      <Navigation currentPage={currentPage} onPageChange={setCurrentPage} cartCount={cart.filter(i => i.status === 'pending').length} strings={s} theme={theme} />
      
      <Sidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setSidebarOpen(false)} 
        account={account} 
        setAccount={setAccount} 
        theme={theme} 
        setTheme={setTheme} 
        lang={lang} 
        setLang={setLang} 
        onSellClick={() => { setSellModalOpen(true); setSidebarOpen(false); }} 
        onLoginClick={() => { setLoginModalOpen(true); setSidebarOpen(false); }}
        strings={s} 
        wishlist={wishlist}
        onWishlistToggle={toggleWishlist}
        cart={cart}
        onAddToCart={addToCart}
        onProductClick={setSelectedProduct}
        onAdminPanelClick={() => setIsAdminPanelOpen(true)}
        onSellerPanelClick={() => setIsSellerPanelOpen(true)}
      />
      
      {selectedProduct && <ProductModal product={selectedProduct} onClose={() => setSelectedProduct(null)} onAddToCart={addToCart} onWishlistToggle={toggleWishlist} onStoreClick={handleStoreSelect} isWishlisted={wishlist.includes(selectedProduct.id)} strings={s} theme={theme} lang={lang} />}
      {isFilterOpen && <FilterDrawer isOpen={isFilterOpen} onClose={() => setFilterOpen(false)} filters={filters} setFilters={setFilters} sort={sort} setSort={setSort} strings={s} theme={theme} cat={currentPage === 'silver' ? 'silver' : 'gold'} lang={lang} />}
      {isCheckoutModalOpen && (
        <CheckoutModal 
          onClose={() => setCheckoutModalOpen(false)} 
          onCash={() => {
            const pendingItems = cart.filter(item => item.status === 'pending');
            const newSales = pendingItems.map(item => ({
              id: 's_' + Math.random().toString(),
              title: item.product.title[lang] || item.product.title.uz,
              price: item.product.price,
              store: item.product.store,
              gram: item.product.gram,
              img: item.product.img,
              date: new Date().toISOString().split('T')[0]
            }));
            setSalesHistory(prev => [...newSales, ...prev]);

            setSellersList(prevSellers => prevSellers.map(seller => {
              const matches = pendingItems.some(item => item.product.store.toLowerCase() === seller.name.toLowerCase());
              if (matches) {
                return {
                  ...seller,
                  stats: { ...seller.stats, sotilgan: seller.stats.sotilgan + 1 }
                };
              }
              return seller;
            }));

            notifyOrderPlaced(pendingItems, "Naqd pul");
            setCart(prev => prev.map(item => item.status === 'pending' ? { ...item, status: 'ordered', orderDate: new Date().toLocaleDateString('ru-RU') } : item));
          }} 
          onInstallment={() => {
            const pendingItems = cart.filter(item => item.status === 'pending');
            const newSales = pendingItems.map(item => ({
              id: 's_' + Math.random().toString(),
              title: item.product.title[lang] || item.product.title.uz,
              price: item.product.price,
              store: item.product.store,
              gram: item.product.gram,
              img: item.product.img,
              date: new Date().toISOString().split('T')[0]
            }));
            setSalesHistory(prev => [...newSales, ...prev]);

            setSellersList(prevSellers => prevSellers.map(seller => {
              const matches = pendingItems.some(item => item.product.store.toLowerCase() === seller.name.toLowerCase());
              if (matches) {
                return {
                  ...seller,
                  stats: { ...seller.stats, sotilgan: seller.stats.sotilgan + 1 }
                };
              }
              return seller;
            }));

            notifyOrderPlaced(pendingItems, "Muddatli to'lov");
            setCart(prev => prev.map(item => item.status === 'pending' ? { ...item, status: 'ordered', orderDate: new Date().toLocaleDateString('ru-RU') } : item));
          }} 
          strings={s} 
          theme={theme} 
          totalPrice={cart.filter(item => item.status === 'pending').reduce((sum, item) => sum + item.product.price, 0) || 850}
          lang={lang}
        />
      )}
      {isSellModalOpen && (
        <SellModal 
          onClose={() => setSellModalOpen(false)} 
          strings={s} 
          theme={theme} 
          account={account} 
          lang={lang} 
          onAddPendingProduct={(newProd) => {
            setPendingProducts(prev => [newProd, ...prev]);
            setSellersList(prevSellers => prevSellers.map(seller => {
              if (seller.name.toLowerCase() === newProd.store.toLowerCase()) {
                return {
                  ...seller,
                  stats: { ...seller.stats, kutilmoqda: seller.stats.kutilmoqda + 1 }
                };
              }
              return seller;
            }));
            notifyAdmin(
              `🟡 Tasdiqlash kutilmoqda — yangi mahsulot!\n\n` +
              `🏢 Do'kon: ${newProd.store}\n` +
              `🏷 ${newProd.title}\n` +
              `💵 ${newProd.price}$\n` +
              `⚖️ ${newProd.gram || '-'}\n\n` +
              `${customerInfoText()}\n\n` +
              `Admin panel orqali tasdiqlang/rad eting.`
            );
          }}
        />
      )}
      {isLoginModalOpen && (
        <LoginModal 
          onClose={() => setLoginModalOpen(false)} 
          onLogin={setAccount} 
          onApplySeller={handleAddPendingSellerApp} 
          strings={s} 
          theme={theme} 
          lang={lang} 
          account={account} 
        />
      )}
      {isRatesOpen && <RatesModal onClose={() => setIsRatesOpen(false)} theme={theme} lang={lang} rates={metalRates} />}
      {isAdminPanelOpen && (
        <AdminPanelModal 
          onClose={() => setIsAdminPanelOpen(false)} 
          theme={theme} 
          lang={lang} 
          account={account}
          pendingProducts={pendingProducts}
          onApproveProduct={handleApproveProduct}
          onRejectProduct={handleRejectProduct}
          sellersList={sellersList}
          sellerApplications={sellerApplications}
          onApproveSeller={handleApproveSeller}
          onRejectSeller={handleRejectSeller}
          salesHistory={salesHistory}
          productsList={productsList}
          setProductsList={setProductsList}
          slides={slides}
          setSlides={setSlides}
          metalRates={metalRates}
          setMetalRates={setMetalRates}
        />
      )}
      {isSellerPanelOpen && account.isOwner && !account.isAdmin && (
        <SellerPanelModal
          onClose={() => setIsSellerPanelOpen(false)}
          theme={theme}
          lang={lang}
          account={account}
          productsList={productsList}
          setProductsList={setProductsList}
          salesHistory={salesHistory}
          onAddProductClick={() => { setIsSellerPanelOpen(false); setSellModalOpen(true); }}
        />
      )}
    </div>
  );
};

export default App;
