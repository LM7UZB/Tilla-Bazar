import React, { useState, useMemo, useEffect } from 'react';
import { UserAccount, Language, Product, Slide } from '../types';
import { CLOUDINARY_UPLOAD_URL, CLOUDINARY_UPLOAD_PRESET, API_BASE } from '../constants';
import { MetalRate } from './RatesModal';

interface ApprovedProduct {
  id: string;
  title: string;
  price: number;
  gram: string;
  store: string;
  status: 'pending' | 'approved' | 'rejected';
  img: string;
}

interface SellerApplication {
  id: string;
  name: string;
  username: string;
  phone: string;
  storeName: string;
  status: 'pending' | 'approved' | 'rejected';
  telegramId: string;
}

interface AdminPanelModalProps {
  onClose: () => void;
  theme: 'dark' | 'light';
  lang: Language;
  account: UserAccount;
  
  // Dynamic application-level states
  pendingProducts: ApprovedProduct[];
  onApproveProduct: (id: string) => void;
  onRejectProduct: (id: string) => void;
  
  sellersList: {
    name: string;
    productsCount: number;
    stats: {
      tasdiq: number;
      kutilmoqda: number;
      rad: number;
      sotilgan: number;
    };
  }[];
  
  sellerApplications: SellerApplication[];
  onApproveSeller: (id: string) => void;
  onRejectSeller: (id: string) => void;
  
  salesHistory: any[];

  // Dynamic products and banners edit state
  productsList: Product[];
  setProductsList: React.Dispatch<React.SetStateAction<Product[]>>;
  slides: Slide[];
  setSlides: React.Dispatch<React.SetStateAction<Slide[]>>;
  metalRates: MetalRate[];
  setMetalRates: React.Dispatch<React.SetStateAction<MetalRate[]>>;
}

const translations = {
  uz: {
    adminPanel: "ADMIN PANEL",
    reviewsStats: "TAHRIRLASH & STATISTIKA",
    tabApprove: "TASDIQLASH",
    tabSales: "SOTUVLAR",
    tabSellers: "SOTUVCHILAR",
    tabProducts: "MAHSULOTLAR",
    tabBanners: "REKLAMALAR",
    subPending: "KUTILMOQDA",
    subApproved: "TASDIQLANGAN",
    subRejected: "RAD ETILGAN",
    noProducts: "BU BO'LIMDA MAHSULOT YO'Q",
    btnReject: "RAD ETISH",
    btnApprove: "TASDIQLASH",
    lblDateFrom: "SANADAN",
    lblDateTo: "SANAGACHA",
    lblTotalSales: "SAVDO AYLANMASI",
    lblSalesCount: "SOTUVLAR",
    lblSoldProducts: "SOTILGAN MAHSULOTLAR",
    noSales: "BU DAVRDA SOTUV YO'Q",
    lblRegisteredStores: "ROʻYXATDAN OʻTGAN DOʻKONLAR",
    lblActiveSeller: "FAOL SOTUVCHI",
    capsuleAppr: "TASDIQ",
    capsulePend: "KUTILMOQDA",
    capsuleRej: "RAD",
    capsuleSold: "SOTILGAN",
    productsCountText: "MAHSULOT",
    lblSellerApplications: "SOTUVCHILIK ARIZALARI (KUTILAYOTGANLAR)",
    noNewApplications: "YANGI ARIZALAR YO'Q",
    lblStore: "DO'KON",
    
    // Product editing
    editProductTitle: "MAHSULOTNI TAHRIRLASH",
    addProductTitle: "YANGI MAHSULOT QO'SHISH",
    saveSuccess: "Muvaffaqiyatli saqlandi!",
    deleteConfirm: "Haqiqatan ham o'chirmoqchimisiz?",
    addBtn: "Qo'shish",
    editBtn: "Tahrirlash",
    deleteBtn: "O'chirish",
    searchPlaceholder: "Nom bo'yicha qidirish...",
    
    // Slide editing
    editBannerTitle: "REKLAMANI TAHRIRLASH",
    addBannerTitle: "YANGI REKLAMA QO'SHISH",
    imageLink: "Rasm havolasi (URL)",
    targetType: "Havola turi",
    targetValue: "Havola qiymati (Do'kon nomi yoki 'silver')",
    addBannerBtn: "REKLAMA QO'SHISH",
    addProductBtn: "MAHSULOT QO'SHISH",
    saveBtn: "SAQLASH",
    cancelBtn: "BEKOR QILISH"
  },
  ru: {
    adminPanel: "АДМИН ПАНЕЛЬ",
    reviewsStats: "УПРАВЛЕНИЕ И СТАТИСТИКА",
    tabApprove: "ОДОБРЕНИЕ",
    tabSales: "ПРОДАЖИ",
    tabSellers: "ПРОДАВЦЫ",
    tabProducts: "ТОВАРЫ",
    tabBanners: "РЕКЛАМА",
    subPending: "ОЖИДАНИЕ",
    subApproved: "ОДОБРЕНО",
    subRejected: "ОТКЛОНЕНО",
    noProducts: "В ЭТОМ РАЗДЕЛЕ НЕТ ТОВАРОВ",
    btnReject: "ОТКЛОНИТЬ",
    btnApprove: "ОДОБРИТЬ",
    lblDateFrom: "С ДАТЫ",
    lblDateTo: "ПО ДАТУ",
    lblTotalSales: "ОБЩИЕ ПРОДАЖИ",
    lblSalesCount: "ПРОДАЖИ",
    lblSoldProducts: "ПРОДАННЫЕ ТОВАРЫ",
    noSales: "НЕТ ПРОДАЖ ЗА ЭТОТ ПЕРИОД",
    lblRegisteredStores: "ЗАРЕГИСТРИРОВАННЫЕ МАГАЗИНЫ",
    lblActiveSeller: "АКТИВНЫЙ ПРОДАВЕЦ",
    capsuleAppr: "ОДОБР",
    capsulePend: "ОЖИД",
    capsuleRej: "ОТКЛ",
    capsuleSold: "ПРОДАНО",
    productsCountText: "ТОВАРОВ",
    lblSellerApplications: "ЗАЯВКИ НА ПРОДАЖУ",
    noNewApplications: "НЕТ НОВЫХ ЗАЯВОК",
    lblStore: "МАГАЗИН",

    // Product editing
    editProductTitle: "РЕДАКТИРОВАНИЕ ТОВАРА",
    addProductTitle: "ДОБАВИТЬ НОВЫЙ ТОВАР",
    saveSuccess: "Успешно сохранено!",
    deleteConfirm: "Вы действительно хотите удалить?",
    addBtn: "Добавить",
    editBtn: "Изменить",
    deleteBtn: "Удалить",
    searchPlaceholder: "Поиск по названию...",

    // Slide editing
    editBannerTitle: "РЕДАКТИРОВАТЬ РЕКЛАМУ",
    addBannerTitle: "ДОБАВИТЬ РЕКЛАМУ",
    imageLink: "Ссылка на изображение (URL)",
    targetType: "Тип ссылки",
    targetValue: "Значение ссылки (Магазин или 'silver')",
    addBannerBtn: "ДОБАВИТЬ РЕКЛАМУ",
    addProductBtn: "ДОБАВИТЬ ТОВАР",
    saveBtn: "СОХРАНИТЬ",
    cancelBtn: "ОТМЕНА"
  },
  en: {
    adminPanel: "ADMIN PANEL",
    reviewsStats: "EDITING & STATS",
    tabApprove: "APPROVE",
    tabSales: "SALES",
    tabSellers: "SELLERS",
    tabProducts: "PRODUCTS",
    tabBanners: "BANNERS",
    subPending: "PENDING",
    subApproved: "APPROVED",
    subRejected: "REJECTED",
    noProducts: "NO PRODUCTS IN THIS SECTION",
    btnReject: "REJECT",
    btnApprove: "APPROVE",
    lblDateFrom: "START DATE",
    lblDateTo: "END DATE",
    lblTotalSales: "TOTAL REVENUE",
    lblSalesCount: "SALES",
    lblSoldProducts: "SOLD PRODUCTS",
    noSales: "NO SALES FOR THIS PERIOD",
    lblRegisteredStores: "REGISTERED STORES",
    lblActiveSeller: "ACTIVE SELLER",
    capsuleAppr: "APPR",
    capsulePend: "PENDING",
    capsuleRej: "REJ",
    capsuleSold: "SOLD",
    productsCountText: "PRODUCTS",
    lblSellerApplications: "SELLER APPLICATIONS",
    noNewApplications: "NO NEW APPLICATIONS",
    lblStore: "STORE",

    // Product editing
    editProductTitle: "EDIT PRODUCT",
    addProductTitle: "ADD NEW PRODUCT",
    saveSuccess: "Successfully saved!",
    deleteConfirm: "Are you sure you want to delete?",
    addBtn: "Add",
    editBtn: "Edit",
    deleteBtn: "Delete",
    searchPlaceholder: "Search by title...",

    // Slide editing
    editBannerTitle: "EDIT BANNER",
    addBannerTitle: "ADD NEW BANNER",
    imageLink: "Image link (URL)",
    targetType: "Target type",
    targetValue: "Target value (Store name or 'silver')",
    addBannerBtn: "ADD BANNER",
    addProductBtn: "ADD PRODUCT",
    saveBtn: "SAVE",
    cancelBtn: "CANCEL"
  }
};

export const AdminPanelModal: React.FC<AdminPanelModalProps> = ({ 
  onClose, 
  theme, 
  lang, 
  account,
  pendingProducts,
  onApproveProduct,
  onRejectProduct,
  sellersList,
  sellerApplications,
  onApproveSeller,
  onRejectSeller,
  salesHistory,
  productsList,
  setProductsList,
  slides,
  setSlides,
  metalRates,
  setMetalRates
}) => {
  const [activeTab, setActiveTab] = useState<'approve' | 'sales' | 'sellers' | 'products' | 'banners' | 'rates'>('sellers');
  const [approveFilter, setApproveFilter] = useState<'pending' | 'approved' | 'rejected'>('pending');
  
  // Set date bounds to current day by default
  const todayStr = useMemo(() => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }, []);

  const [dateFrom, setDateFrom] = useState(todayStr);
  const [dateTo, setDateTo] = useState(todayStr);

  const isDark = theme === 'dark';
  const bgColor = isDark ? 'bg-[#0e0e11]' : 'bg-white';
  const textColor = isDark ? 'text-white' : 'text-black';
  const itemBg = isDark ? 'bg-[#15151a] border-white/5' : 'bg-white border-gray-100 shadow-sm';
  const inputBg = isDark ? 'bg-white/5 text-white border-white/10' : 'bg-gray-100 text-black border-transparent';

  const t = translations[lang] || translations.uz;

  // Local notifications inside Admin panel
  const [panelToast, setPanelToast] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setPanelToast(msg);
    setTimeout(() => setPanelToast(null), 2500);
  };

  // --- Bank USD kurslari: faqat shu (Admin) panelda majburiy o'zgartirish mumkin ---
  const [rSotish, setRSotish] = useState<{ bank: string; rate: string }[]>([
    { bank: '', rate: '' }, { bank: '', rate: '' }, { bank: '', rate: '' }
  ]);
  const [rSotib, setRSotib] = useState<{ bank: string; rate: string }[]>([
    { bank: '', rate: '' }, { bank: '', rate: '' }, { bank: '', rate: '' }
  ]);
  const [ratesSource, setRatesSource] = useState<string>('');
  const [ratesLoading, setRatesLoading] = useState(false);

  const loadRatesForAdmin = () => {
    setRatesLoading(true);
    fetch(`${API_BASE}/api/bank-rates`)
      .then(r => r.json())
      .then(data => {
        if (data?.ok) {
          setRSotish((data.bestSell || []).map((x: any) => ({ bank: x.bank || '', rate: String(x.rate ?? '') })));
          setRSotib((data.bestBuy || []).map((x: any) => ({ bank: x.bank || '', rate: String(x.rate ?? '') })));
          setRatesSource(data.source || '');
        }
      })
      .catch(() => {})
      .finally(() => setRatesLoading(false));
  };

  useEffect(() => {
    if (activeTab === 'rates') loadRatesForAdmin();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  const handleSaveRates = () => {
    const clean = (arr: { bank: string; rate: string }[]) =>
      arr.filter(x => x.bank.trim() && Number(x.rate) > 0)
         .map(x => ({ bank: x.bank.trim(), rate: Number(x.rate) }));
    const bestSell = clean(rSotish);
    const bestBuy = clean(rSotib);
    if (bestSell.length === 0 && bestBuy.length === 0) {
      showToast("Kamida bitta bank kiritilishi kerak");
      return;
    }
    fetch(`${API_BASE}/api/bank-rates`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bestBuy, bestSell }),
    })
      .then(r => r.json())
      .then(data => {
        if (data?.ok) { showToast("Kurslar saqlandi ✅"); loadRatesForAdmin(); }
        else { showToast(data?.error || "Xatolik yuz berdi"); }
      })
      .catch(() => showToast("Xatolik yuz berdi"));
  };

  const handleResetRatesToAuto = () => {
    fetch(`${API_BASE}/api/bank-rates`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'clear' }),
    })
      .then(r => r.json())
      .then(() => { showToast("Avtomatik rejimga qaytarildi"); loadRatesForAdmin(); })
      .catch(() => showToast("Xatolik yuz berdi"));
  };

  // --- Galereyadan to'g'ridan-to'g'ri rasm yuklash (URL yozish shart emas) ---
  const [isUploadingPImg, setIsUploadingPImg] = useState(false);
  const [isUploadingSImg, setIsUploadingSImg] = useState(false);

  const uploadImageToHost = async (file: File): Promise<string | null> => {
    const formData = new FormData();
    formData.append('file', file);
      formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
    try {
      const res = await fetch(`${CLOUDINARY_UPLOAD_URL}`, { method: 'POST', body: formData });
      const data = await res.json();
      if (!data?.secure_url) console.error('Cloudinary upload error:', data);
      return data?.secure_url || null;
    } catch (e) {
      console.error('Cloudinary yuklash istisnosi:', e);
      return null;
    }
  };

  const handlePImgGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingPImg(true);
    const url = await uploadImageToHost(file);
    if (url) { setPImg(url); showToast("Rasm yuklandi ✅"); }
    else { showToast("Rasm yuklashda xatolik"); }
    setIsUploadingPImg(false);
  };

  const handleSImgGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingSImg(true);
    const url = await uploadImageToHost(file);
    if (url) { setSImg(url); showToast("Rasm yuklandi ✅"); }
    else { showToast("Rasm yuklashda xatolik"); }
    setIsUploadingSImg(false);
  };

  // State for editing and adding products
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [productSearch, setProductSearch] = useState('');

  // Product form fields
  const [pCat, setPCat] = useState<'gold' | 'silver'>('gold');
  const [pType, setPType] = useState('ring');
  const [pTitleUz, setPTitleUz] = useState('');
  const [pTitleRu, setPTitleRu] = useState('');
  const [pTitleEn, setPTitleEn] = useState('');
  const [pPrice, setPPrice] = useState(0);
  const [pGram, setPGram] = useState('');
  const [pGramValue, setPGramValue] = useState(0);
  const [pProba, setPProba] = useState('');
  const [pKarat, setPKarat] = useState('');
  const [pDescUz, setPDescUz] = useState('');
  const [pDescRu, setPDescRu] = useState('');
  const [pDescEn, setPDescEn] = useState('');
  const [pStore, setPStore] = useState('');
  const [pLocation, setPLocation] = useState('');
  const [pImg, setPImg] = useState('');

  // State for editing and adding banners/slides
  const [editingSlide, setEditingSlide] = useState<Slide | null>(null);
  const [isAddingSlide, setIsAddingSlide] = useState(false);

  // Slide form fields
  const [sImg, setSImg] = useState('');
  const [sVideoUrl, setSVideoUrl] = useState('');
  const [sTargetType, setSTargetType] = useState<'category' | 'store' | 'url'>('store');
  const [sTargetValue, setSTargetValue] = useState('');

  // Trigger editing a product
  const handleStartEditProduct = (prod: Product) => {
    setEditingProduct(prod);
    setIsAddingProduct(false);

    setPCat(prod.cat);
    setPType(prod.type);
    setPTitleUz(prod.title.uz);
    setPTitleRu(prod.title.ru);
    setPTitleEn(prod.title.en);
    setPPrice(prod.price);
    setPGram(prod.gram);
    setPGramValue(prod.gramValue);
    setPProba(prod.proba);
    setPKarat(prod.karat);
    setPDescUz(prod.desc?.uz || '');
    setPDescRu(prod.desc?.ru || '');
    setPDescEn(prod.desc?.en || '');
    setPStore(prod.store);
    setPLocation(prod.location);
    setPImg(prod.img);
  };

  // Trigger adding a product
  const handleStartAddProduct = () => {
    setIsAddingProduct(true);
    setEditingProduct(null);

    setPCat('gold');
    setPType('ring');
    setPTitleUz('');
    setPTitleRu('');
    setPTitleEn('');
    setPPrice(100);
    setPGram('5.5 gr');
    setPGramValue(5.5);
    setPProba('585');
    setPKarat('14K');
    setPDescUz('');
    setPDescRu('');
    setPDescEn('');
    setPStore('LM Gold');
    setPLocation('Toshkent sh.');
    setPImg('https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=600&q=80');
  };

  // Save product (Add or Edit)
  const handleSaveProduct = () => {
    if (!pTitleUz || !pPrice || !pGram) {
      showToast("Sarlavha, narx va og'irlik to'ldirilishi shart!");
      return;
    }

    if (editingProduct) {
      // Edit mode
      setProductsList(prev => prev.map(p => p.id === editingProduct.id ? {
        ...p,
        cat: pCat,
        type: pType,
        title: { uz: pTitleUz, ru: pTitleRu || pTitleUz, en: pTitleEn || pTitleUz },
        price: Number(pPrice),
        gram: pGram,
        gramValue: Number(pGramValue) || parseFloat(pGram) || 5,
        proba: pProba,
        karat: pKarat,
        desc: { uz: pDescUz, ru: pDescRu || pDescUz, en: pDescEn || pDescUz },
        store: pStore,
        location: pLocation,
        img: pImg
      } : p));
      showToast(t.saveSuccess);
    } else {
      // Add mode
      const newProduct: Product = {
        id: Math.floor(Math.random() * 1000000) + 2000,
        cat: pCat,
        type: pType,
        title: { uz: pTitleUz, ru: pTitleRu || pTitleUz, en: pTitleEn || pTitleUz },
        price: Number(pPrice),
        gram: pGram,
        gramValue: Number(pGramValue) || parseFloat(pGram) || 5,
        proba: pProba,
        karat: pKarat,
        desc: { uz: pDescUz, ru: pDescRu || pDescUz, en: pDescEn || pDescUz },
        store: pStore,
        location: pLocation,
        logo: '',
        img: pImg
      };
      setProductsList(prev => [newProduct, ...prev]);
      showToast("Mahsulot muvaffaqiyatli qo'shildi!");
    }

    // Reset forms
    setEditingProduct(null);
    setIsAddingProduct(false);
  };

  // Delete product
  const handleDeleteProduct = (id: number) => {
    if (confirm(t.deleteConfirm)) {
      setProductsList(prev => prev.filter(p => p.id !== id));
      showToast("Mahsulot o'chirildi!");
    }
  };

  // Trigger editing a banner/slide
  const handleStartEditSlide = (slide: Slide) => {
    setEditingSlide(slide);
    setIsAddingSlide(false);

    setSImg(slide.img);
    setSVideoUrl(slide.videoUrl || '');
    setSTargetType(slide.target.type);
    setSTargetValue(slide.target.value);
  };

  // Trigger adding a banner/slide
  const handleStartAddSlide = () => {
    setIsAddingSlide(true);
    setEditingSlide(null);

    setSImg('https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&q=80&w=1200');
    setSVideoUrl('');
    setSTargetType('store');
    setSTargetValue('LM Gold');
  };

  // Save banner (Add or Edit)
  const handleSaveSlide = () => {
    if (!sImg || !sTargetValue) {
      showToast("Rasm va qiymati to'ldirilishi shart!");
      return;
    }

    if (editingSlide) {
      // Edit mode
      setSlides(prev => prev.map(s => s.id === editingSlide.id ? {
        ...s,
        img: sImg,
        videoUrl: sVideoUrl || undefined,
        target: { type: sTargetType, value: sTargetValue }
      } : s));
      showToast(t.saveSuccess);
    } else {
      // Add mode
      const newSlide: Slide = {
        id: Math.floor(Math.random() * 1000000) + 3000,
        img: sImg,
        videoUrl: sVideoUrl || undefined,
        target: { type: sTargetType, value: sTargetValue }
      };
      setSlides(prev => [...prev, newSlide]);
      showToast("Reklama muvaffaqiyatli qo'shildi!");
    }

    // Reset forms
    setEditingSlide(null);
    setIsAddingSlide(false);
  };

  // Delete banner
  const handleDeleteSlide = (id: number) => {
    if (confirm(t.deleteConfirm)) {
      setSlides(prev => prev.filter(s => s.id !== id));
      showToast("Reklama o'chirildi!");
    }
  };

  // Count review items under dynamic filter
  const getFilterCount = (status: 'pending' | 'approved' | 'rejected') => {
    return pendingProducts.filter(p => p.status === status).length;
  };

  // Filter reviewed items
  const filteredProducts = pendingProducts.filter(p => p.status === approveFilter);

  // Filter Sales History by Date Range
  const salesHistoryFiltered = useMemo(() => {
    return salesHistory.filter(sale => {
      if (!sale.date) return true;
      try {
        let saleDateStr = '';
        if (sale.date.includes('/')) {
          const parts = sale.date.split('/');
          if (parts.length === 3) {
            saleDateStr = `${parts[2]}-${parts[0].padStart(2, '0')}-${parts[1].padStart(2, '0')}`;
          }
        } else {
          saleDateStr = sale.date;
        }
        return saleDateStr >= dateFrom && saleDateStr <= dateTo;
      } catch (e) {
        return true;
      }
    });
  }, [salesHistory, dateFrom, dateTo]);

  // Total sales revenue for selected dates
  const totalRevenue = useMemo(() => {
    return salesHistoryFiltered.reduce((sum, item) => sum + (item.price || 0), 0);
  }, [salesHistoryFiltered]);

  // Filter products search list
  const filteredProductsList = useMemo(() => {
    const q = productSearch.toLowerCase().trim();
    if (!q) return productsList;
    return productsList.filter(p => 
      p.title.uz.toLowerCase().includes(q) ||
      p.title.ru.toLowerCase().includes(q) ||
      p.title.en.toLowerCase().includes(q) ||
      p.store.toLowerCase().includes(q)
    );
  }, [productsList, productSearch]);

  const tabClass = (tab: 'approve' | 'sales' | 'sellers' | 'products' | 'banners' | 'rates') => {
    const isActive = activeTab === tab;
    return `flex flex-col items-center justify-center py-2.5 px-0.5 rounded-xl border transition-all ${
      isActive 
        ? 'border-[#d4af37] text-[#d4af37] bg-[#d4af37]/5 font-black scale-102 shadow-sm' 
        : 'border-white/5 bg-[#1a1a1e]/50 text-gray-500 hover:text-gray-400 font-extrabold'
    }`;
  };

  const subFilterClass = (filter: 'pending' | 'approved' | 'rejected', color: 'yellow' | 'green' | 'red') => {
    const isActive = approveFilter === filter;
    const colorClasses = {
      yellow: { active: 'border-yellow-500/50 bg-yellow-500/10 text-yellow-500', hover: 'hover:text-yellow-400 hover:bg-white/5' },
      green: { active: 'border-green-500/50 bg-green-500/10 text-green-500', hover: 'hover:text-green-400 hover:bg-white/5' },
      red: { active: 'border-red-500/50 bg-red-500/10 text-red-500', hover: 'hover:text-red-400 hover:bg-white/5' }
    };
    return `flex-1 py-2 text-[8px] font-sans font-black uppercase tracking-wider rounded-xl border transition-all ${
      isActive 
        ? colorClasses[color].active 
        : `border-white/5 bg-transparent text-gray-500 ${colorClasses[color].hover}`
    }`;
  };

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-xl z-[180] flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fade-in">
      {/* Outside click handler */}
      <div className="absolute inset-0 z-0" onClick={onClose} />

      <div className={`w-full max-w-md sm:max-w-2xl lg:max-w-4xl ${bgColor} border-t sm:border border-[#d4af37]/30 rounded-t-[40px] sm:rounded-[40px] p-5 md:p-8 shadow-2xl max-h-[95vh] sm:max-h-[90vh] overflow-y-auto scrollbar-none transition-all duration-300 relative z-10`}>
        
        {/* Toast Notification */}
        {panelToast && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[190] bg-[#d4af37] text-black text-[10px] px-4 py-1.5 rounded-full font-black shadow-xl">
            {panelToast}
          </div>
        )}

        {/* Header section matching style */}
        <div className="flex justify-between items-center mb-5 px-1">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#d4af37]/15 border border-[#d4af37]/30 rounded-xl flex items-center justify-center text-[#d4af37]">
              <i className="fas fa-shield-halved text-base"></i>
            </div>
            <div className="text-left">
              <h2 className="text-sm font-black text-[#d4af37] tracking-tight uppercase">
                {t.adminPanel}
              </h2>
              <p className="text-[7.5px] font-black tracking-widest text-[#d4af37]/60 uppercase">
                {t.reviewsStats}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="w-8 h-8 flex items-center justify-center bg-white/5 rounded-full text-gray-400 hover:text-white active:scale-75 transition-all"
          >
            <i className="fas fa-times text-xs"></i>
          </button>
        </div>

        {/* 6 Main Tab Controls */}
        <div className="grid grid-cols-6 gap-1.5 mb-5">
          <button onClick={() => { setActiveTab('approve'); setEditingProduct(null); setIsAddingProduct(null as any); setEditingSlide(null); setIsAddingSlide(false); }} className={tabClass('approve')}>
            <span className="text-sm">📦</span>
            <span className="text-[7px] tracking-widest font-sans font-black mt-1 uppercase">{t.tabApprove.slice(0,4)}..</span>
          </button>
          <button onClick={() => { setActiveTab('sales'); setEditingProduct(null); setIsAddingProduct(null as any); setEditingSlide(null); setIsAddingSlide(false); }} className={tabClass('sales')}>
            <span className="text-sm">📊</span>
            <span className="text-[7px] tracking-widest font-sans font-black mt-1 uppercase">{t.tabSales.slice(0,4)}..</span>
          </button>
          <button onClick={() => { setActiveTab('sellers'); setEditingProduct(null); setIsAddingProduct(null as any); setEditingSlide(null); setIsAddingSlide(false); }} className={tabClass('sellers')}>
            <span className="text-sm">🏪</span>
            <span className="text-[7px] tracking-widest font-sans font-black mt-1 uppercase">{t.tabSellers.slice(0,4)}..</span>
          </button>
          <button onClick={() => { setActiveTab('products'); setEditingProduct(null); setIsAddingProduct(null as any); setEditingSlide(null); setIsAddingSlide(false); }} className={tabClass('products')}>
            <span className="text-sm">💍</span>
            <span className="text-[7px] tracking-widest font-sans font-black mt-1 uppercase">{t.tabProducts.slice(0,4)}..</span>
          </button>
          <button onClick={() => { setActiveTab('banners'); setEditingProduct(null); setIsAddingProduct(null as any); setEditingSlide(null); setIsAddingSlide(false); }} className={tabClass('banners')}>
            <span className="text-sm">🖼️</span>
            <span className="text-[7px] tracking-widest font-sans font-black mt-1 uppercase">{t.tabBanners.slice(0,4)}..</span>
          </button>
          <button onClick={() => { setActiveTab('rates'); setEditingProduct(null); setIsAddingProduct(null as any); setEditingSlide(null); setIsAddingSlide(false); }} className={tabClass('rates')}>
            <span className="text-sm">💵</span>
            <span className="text-[7px] tracking-widest font-sans font-black mt-1 uppercase">Kurs</span>
          </button>
        </div>

        {/* Contents for Tab 1: TASDIQLASH */}
        {activeTab === 'approve' && (
          <div className="space-y-4 animate-slide-up">
            <div className="flex gap-2 justify-between">
              <button onClick={() => setApproveFilter('pending')} className={subFilterClass('pending', 'yellow')}>
                🟡 {t.subPending} ({getFilterCount('pending')})
              </button>
              <button onClick={() => setApproveFilter('approved')} className={subFilterClass('approved', 'green')}>
                🟢 {t.subApproved} ({getFilterCount('approved')})
              </button>
              <button onClick={() => setApproveFilter('rejected')} className={subFilterClass('rejected', 'red')}>
                🔴 {t.subRejected} ({getFilterCount('rejected')})
              </button>
            </div>

            {filteredProducts.length === 0 ? (
              <div className="text-center py-12 border rounded-[28px] border-dashed border-white/5 bg-white/2">
                <i className="fas fa-folder-open text-gray-500 text-2xl mb-3 block"></i>
                <h3 className="text-gray-400 font-sans text-[9px] font-black tracking-widest uppercase">
                  {t.noProducts}
                </h3>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredProducts.map(p => (
                  <div key={p.id} className={`${itemBg} border rounded-2xl p-3.5 text-left flex gap-3 relative overflow-hidden shadow-inner`}>
                    <img src={p.img} alt="" className="w-14 h-14 object-cover rounded-xl border border-white/5 shadow-inner" />
                    <div className="flex-1 min-w-0 text-left">
                      <div className="flex items-center justify-between">
                        <span className="text-[6px] text-[#d4af37] bg-[#d4af37]/10 px-2 py-0.5 rounded-full font-black uppercase tracking-wider">{p.store}</span>
                        <span className="text-[8px] font-mono text-gray-400 font-bold">{p.gram}</span>
                      </div>
                      <h4 className={`text-xs font-black truncate ${textColor} mt-1`}>{p.title}</h4>
                      <p className="text-sm font-black text-[#d4af37] mt-0.5">${p.price.toLocaleString()}</p>
                      
                      {p.status === 'pending' && (
                        <div className="flex gap-2 mt-2.5">
                          <button 
                            onClick={() => onRejectProduct(p.id)} 
                            className="bg-red-500/15 hover:bg-red-500/25 border border-red-500/20 text-red-400 text-[8px] font-black uppercase px-3 py-1.5 rounded-xl active:scale-95 transition-all"
                          >
                            {t.btnReject}
                          </button>
                          <button 
                            onClick={() => onApproveProduct(p.id)} 
                            className="bg-green-500 text-black text-[8px] font-black uppercase px-3 py-1.5 rounded-xl active:scale-95 transition-all"
                          >
                            {t.btnApprove}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Contents for Tab 2: SOTUVLAR */}
        {activeTab === 'sales' && (
          <div className="space-y-4 animate-slide-up">
            <div className="grid grid-cols-2 gap-3 text-left">
              <div>
                <label className="text-[7px] font-black text-gray-500 uppercase tracking-widest block pl-2 mb-1">
                  {t.lblDateFrom}
                </label>
                <input 
                  type="date" 
                  value={dateFrom} 
                  onChange={e => setDateFrom(e.target.value)} 
                  className={`w-full ${inputBg} rounded-xl px-3 py-2 text-[10px] font-black border border-transparent outline-none focus:border-[#d4af37]/50`}
                />
              </div>
              <div>
                <label className="text-[7px] font-black text-gray-500 uppercase tracking-widest block pl-2 mb-1">
                  {t.lblDateTo}
                </label>
                <input 
                  type="date" 
                  value={dateTo} 
                  onChange={e => setDateTo(e.target.value)} 
                  className={`w-full ${inputBg} rounded-xl px-3 py-2 text-[10px] font-black border border-transparent outline-none focus:border-[#d4af37]/50`}
                />
              </div>
            </div>

            <div className={`${itemBg} rounded-[24px] border border-white/5 p-4 grid grid-cols-2 gap-4 text-left shadow-md`}>
              <div>
                <p className="text-[7px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest">
                  {t.lblTotalSales}
                </p>
                <p className="text-xl font-black text-[#d4af37] font-sans mt-0.5">
                  ${totalRevenue.toLocaleString()}
                </p>
              </div>
              <div className="border-l border-white/10 pl-4">
                <p className="text-[7px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest">
                  {t.lblSalesCount}
                </p>
                <p className="text-xl font-black text-white font-sans mt-0.5">
                  {salesHistoryFiltered.length}
                </p>
              </div>
            </div>

            <div>
              <h3 className="text-[7px] font-black text-gray-400 uppercase tracking-widest text-left mb-2 ml-2">
                {t.lblSoldProducts}
              </h3>
              
              {salesHistoryFiltered.length === 0 ? (
                <div className="text-center py-8 border rounded-[24px] border-dashed border-white/5 bg-white/2">
                  <h3 className="text-gray-400 font-sans text-[9px] font-black tracking-widest uppercase">
                    {t.noSales}
                  </h3>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {salesHistoryFiltered.map((sale, idx) => (
                    <div key={sale.id || idx} className={`${itemBg} border rounded-2xl p-2.5 flex items-center justify-between text-left shadow-sm`}>
                      <div className="flex items-center gap-3">
                        <img src={sale.img || "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=150&q=80"} alt="" className="w-9 h-9 object-cover rounded-lg border border-white/5" />
                        <div>
                          <h4 className={`text-[11px] font-black truncate max-w-[140px] ${textColor}`}>{sale.title}</h4>
                          <p className="text-[7px] font-black text-gray-400 uppercase mt-0.5">{sale.store} • {sale.gram}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-[11px] font-black text-green-500 block">+${sale.price.toLocaleString()}</span>
                        <span className="text-[6.5px] text-gray-400 font-bold uppercase">{sale.date}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Contents for Tab 3: SOTUVCHILAR */}
        {activeTab === 'sellers' && (
          <div className="space-y-4 animate-slide-up">
            <div>
              <h3 className="text-[7px] font-black text-gray-400 uppercase tracking-widest text-left ml-2 mb-2">
                {t.lblRegisteredStores}
              </h3>

              <div className="space-y-3">
                {sellersList.map((s, idx) => (
                  <div key={idx} className={`${itemBg} border rounded-[24px] p-3.5 text-left shadow-md flex flex-col gap-2.5 relative`}>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-[#d4af37]/15 border border-[#d4af37]/30 text-[#d4af37] flex items-center justify-center font-black text-xs shadow-inner">
                          <i className="fas fa-store text-[9px]"></i>
                        </div>
                        <div>
                          <h4 className={`text-xs font-black ${textColor}`}>{s.name}</h4>
                          <span className="text-[6.5px] text-[#d4af37] font-black tracking-widest uppercase block">
                            {t.lblActiveSeller}
                          </span>
                        </div>
                      </div>
                      <span className="text-[7px] font-black bg-[#d4af37]/10 text-[#d4af37] px-2 py-0.5 rounded-full uppercase">
                        {s.productsCount} {t.productsCountText}
                      </span>
                    </div>

                    <div className="grid grid-cols-4 gap-1 pt-1.5 border-t border-gray-100 dark:border-white/5">
                      <div className="bg-green-500/10 border border-green-500/10 rounded-lg p-1 text-center flex flex-col">
                        <span className="text-[6.5px] font-black text-green-500 tracking-tighter">{t.capsuleAppr}</span>
                        <span className="text-[10px] font-black text-green-500 mt-0.5">{s.stats.tasdiq}</span>
                      </div>
                      <div className="bg-yellow-500/10 border border-yellow-500/10 rounded-lg p-1 text-center flex flex-col">
                        <span className="text-[6.5px] font-black text-yellow-500 tracking-tighter">{t.capsulePend}</span>
                        <span className="text-[10px] font-black text-yellow-500 mt-0.5">{s.stats.kutilmoqda}</span>
                      </div>
                      <div className="bg-red-500/10 border border-red-500/10 rounded-lg p-1 text-center flex flex-col">
                        <span className="text-[6.5px] font-black text-red-500 tracking-tighter">{t.capsuleRej}</span>
                        <span className="text-[10px] font-black text-red-500 mt-0.5">{s.stats.rad}</span>
                      </div>
                      <div className="bg-blue-500/10 border border-blue-500/10 rounded-lg p-1 text-center flex flex-col">
                        <span className="text-[6.5px] font-black text-blue-400 tracking-tighter">{t.capsuleSold}</span>
                        <span className="text-[10px] font-black text-blue-400 mt-0.5">{s.stats.sotilgan}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-1">
              <h3 className="text-[7px] font-black text-gray-400 uppercase tracking-widest text-left ml-2 mb-2">
                {t.lblSellerApplications}
              </h3>

              {sellerApplications.filter(app => app.status === 'pending').length === 0 ? (
                <div className="text-center py-8 border rounded-[24px] border-dashed border-white/5 bg-white/2">
                  <h3 className="text-gray-400 font-sans text-[9px] font-black tracking-widest uppercase">
                    {t.noNewApplications}
                  </h3>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {sellerApplications.filter(app => app.status === 'pending').map((app) => (
                    <div key={app.id} className={`${itemBg} border rounded-[24px] p-3 text-left shadow-md flex flex-col gap-2 relative`}>
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className={`text-xs font-black ${textColor}`}>{app.name}</h4>
                          <p className="text-[8px] text-gray-400 font-black tracking-wider uppercase mt-0.5">
                            {t.lblStore}: <span className="text-[#d4af37]">{app.storeName}</span>
                          </p>
                        </div>
                        <span className="text-[6.5px] font-black bg-yellow-500/10 text-yellow-500 px-2 py-0.5 rounded uppercase tracking-wider">
                          {t.subPending}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-[8px] font-semibold text-gray-400 bg-black/10 dark:bg-white/2 p-2 rounded-lg">
                        <div>📞 {app.phone}</div>
                        <div>✈️ {app.username}</div>
                      </div>

                      <div className="flex gap-2 justify-end pt-1">
                        <button 
                          onClick={() => onRejectSeller(app.id)}
                          className="px-2.5 py-1 border border-red-500/20 bg-red-500/10 text-red-500 text-[7.5px] font-black uppercase rounded-md active:scale-95 transition-all"
                        >
                          {t.btnReject}
                        </button>
                        <button 
                          onClick={() => onApproveSeller(app.id)}
                          className="px-2.5 py-1 bg-green-500 text-black text-[7.5px] font-black uppercase rounded-md active:scale-95 transition-all"
                        >
                          {t.btnApprove}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Contents for Tab 4: MAHSULOTLARNI TAHRIRLASH */}
        {activeTab === 'products' && (
          <div className="space-y-4 animate-slide-up">
            
            {/* Show Form block or List block */}
            {editingProduct || isAddingProduct ? (
              <div className={`${itemBg} border rounded-[28px] p-4 text-left space-y-3.5 shadow-md`}>
                <h3 className="text-xs font-black text-[#d4af37] uppercase tracking-wide">
                  {editingProduct ? t.editProductTitle : t.addProductTitle}
                </h3>

                <div className="space-y-3">
                  <div>
                    <label className="text-[7.5px] font-black text-gray-400 block mb-1 uppercase">Toifa & Turi</label>
                    <div className="grid grid-cols-2 gap-2">
                      <select 
                        value={pCat} 
                        onChange={e => setPCat(e.target.value as 'gold' | 'silver')}
                        className={`w-full ${inputBg} rounded-xl px-2.5 py-2 text-[10px] font-black border border-transparent outline-none`}
                      >
                        <option value="gold">GOLD</option>
                        <option value="silver">SILVER</option>
                      </select>
                      <select 
                        value={pType} 
                        onChange={e => setPType(e.target.value)}
                        className={`w-full ${inputBg} rounded-xl px-2.5 py-2 text-[10px] font-black border border-transparent outline-none`}
                      >
                        <option value="ring">RING (Uzuk)</option>
                        <option value="earring">EARRING (Zirak)</option>
                        <option value="chain">CHAIN (Sepochka)</option>
                        <option value="bracelet">BRACELET (Braslet)</option>
                        <option value="pendant">PENDANT (Kulon)</option>
                        <option value="set">SET (To'plam)</option>
                        <option value="watch">WATCH (Soat)</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-1.5">
                    <div>
                      <label className="text-[7.5px] font-black text-gray-400 block mb-1 uppercase">{t.productTitleUz}</label>
                      <input type="text" value={pTitleUz} onChange={e => setPTitleUz(e.target.value)} className={`w-full ${inputBg} rounded-lg px-2 py-1.5 text-[9px] font-black outline-none`} />
                    </div>
                    <div>
                      <label className="text-[7.5px] font-black text-gray-400 block mb-1 uppercase">{t.productTitleRu}</label>
                      <input type="text" value={pTitleRu} onChange={e => setPTitleRu(e.target.value)} className={`w-full ${inputBg} rounded-lg px-2 py-1.5 text-[9px] font-black outline-none`} />
                    </div>
                    <div>
                      <label className="text-[7.5px] font-black text-gray-400 block mb-1 uppercase">{t.productTitleEn}</label>
                      <input type="text" value={pTitleEn} onChange={e => setPTitleEn(e.target.value)} className={`w-full ${inputBg} rounded-lg px-2 py-1.5 text-[9px] font-black outline-none`} />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-1.5">
                    <div>
                      <label className="text-[7.5px] font-black text-gray-400 block mb-1 uppercase">{t.productPrice}</label>
                      <input type="number" value={pPrice} onChange={e => setPPrice(Number(e.target.value))} className={`w-full ${inputBg} rounded-lg px-2 py-1.5 text-[9px] font-black outline-none`} />
                    </div>
                    <div>
                      <label className="text-[7.5px] font-black text-gray-400 block mb-1 uppercase">{t.productGram}</label>
                      <input type="text" value={pGram} onChange={e => setPGram(e.target.value)} className={`w-full ${inputBg} rounded-lg px-2 py-1.5 text-[9px] font-black outline-none`} />
                    </div>
                    <div>
                      <label className="text-[7.5px] font-black text-gray-400 block mb-1 uppercase">{t.productGramValue}</label>
                      <input type="number" value={pGramValue} onChange={e => setPGramValue(Number(e.target.value))} className={`w-full ${inputBg} rounded-lg px-2 py-1.5 text-[9px] font-black outline-none`} />
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-1.5">
                    <div>
                      <label className="text-[7.5px] font-black text-gray-400 block mb-1 uppercase">{t.productProba}</label>
                      <input type="text" value={pProba} onChange={e => setPProba(e.target.value)} className={`w-full ${inputBg} rounded-lg px-1.5 py-1.5 text-[9px] font-black outline-none`} />
                    </div>
                    <div>
                      <label className="text-[7.5px] font-black text-gray-400 block mb-1 uppercase">{t.productKarat}</label>
                      <input type="text" value={pKarat} onChange={e => setPKarat(e.target.value)} className={`w-full ${inputBg} rounded-lg px-1.5 py-1.5 text-[9px] font-black outline-none`} />
                    </div>
                    <div>
                      <label className="text-[7.5px] font-black text-gray-400 block mb-1 uppercase">{t.lblStore}</label>
                      <input type="text" value={pStore} onChange={e => setPStore(e.target.value)} className={`w-full ${inputBg} rounded-lg px-1.5 py-1.5 text-[9px] font-black outline-none`} />
                    </div>
                    <div>
                      <label className="text-[7.5px] font-black text-gray-400 block mb-1 uppercase">{t.location}</label>
                      <input type="text" value={pLocation} onChange={e => setPLocation(e.target.value)} className={`w-full ${inputBg} rounded-lg px-1.5 py-1.5 text-[9px] font-black outline-none`} />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-1.5">
                    <div>
                      <label className="text-[7.5px] font-black text-gray-400 block mb-1 uppercase">{t.productDescUz}</label>
                      <textarea value={pDescUz} onChange={e => setPDescUz(e.target.value)} className={`w-full h-11 ${inputBg} rounded-lg px-2 py-1 text-[8px] font-black outline-none resize-none`} />
                    </div>
                    <div>
                      <label className="text-[7.5px] font-black text-gray-400 block mb-1 uppercase">{t.productDescRu}</label>
                      <textarea value={pDescRu} onChange={e => setPDescRu(e.target.value)} className={`w-full h-11 ${inputBg} rounded-lg px-2 py-1 text-[8px] font-black outline-none resize-none`} />
                    </div>
                    <div>
                      <label className="text-[7.5px] font-black text-gray-400 block mb-1 uppercase">{t.productDescEn}</label>
                      <textarea value={pDescEn} onChange={e => setPDescEn(e.target.value)} className={`w-full h-11 ${inputBg} rounded-lg px-2 py-1 text-[8px] font-black outline-none resize-none`} />
                    </div>
                  </div>

                  <div>
                    <label className="text-[7.5px] font-black text-gray-400 block mb-1 uppercase">{t.productImg}</label>
                    <div className="flex gap-2 items-center">
                      {pImg && <img src={pImg} alt="" className="w-11 h-11 rounded-lg object-cover border border-white/10 shrink-0" />}
                      <label className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 ${inputBg} rounded-lg text-[9px] font-black uppercase tracking-wide cursor-pointer active:scale-95 transition-all`}>
                        {isUploadingPImg ? (
                          <><i className="fas fa-spinner fa-spin"></i><span>Yuklanmoqda...</span></>
                        ) : (
                          <><i className="fas fa-image"></i><span>{pImg ? 'Rasmni almashtirish' : 'Galereyadan tanlash'}</span></>
                        )}
                        <input type="file" hidden accept="image/*" onChange={handlePImgGalleryUpload} disabled={isUploadingPImg} />
                      </label>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 justify-end pt-2">
                  <button 
                    onClick={() => { setEditingProduct(null); setIsAddingProduct(false); }}
                    className="px-4 py-2 border border-white/10 text-gray-400 text-[8px] font-black uppercase rounded-lg active:scale-95"
                  >
                    {t.cancelBtn}
                  </button>
                  <button 
                    onClick={handleSaveProduct}
                    className="px-5 py-2 bg-[#d4af37] text-black text-[8px] font-black uppercase rounded-lg active:scale-95"
                  >
                    {t.saveBtn}
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-3.5">
                {/* Search and Add buttons */}
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    placeholder={t.searchPlaceholder} 
                    value={productSearch}
                    onChange={e => setProductSearch(e.target.value)}
                    className={`flex-1 ${inputBg} rounded-xl px-3 py-2 text-[10px] font-semibold outline-none border border-transparent focus:border-[#d4af37]/30`}
                  />
                  <button 
                    onClick={handleStartAddProduct}
                    className="bg-[#d4af37] text-black px-3 rounded-xl font-black text-[10px] uppercase flex items-center gap-1.5 active:scale-95 transition-all"
                  >
                    <i className="fas fa-plus"></i>
                  </button>
                </div>

                {/* Products List */}
                <div className="space-y-2.5 max-h-[380px] overflow-y-auto scrollbar-none pr-1">
                  {filteredProductsList.map(p => (
                    <div key={p.id} className={`${itemBg} border rounded-2xl p-2.5 flex items-center justify-between text-left shadow-sm gap-2`}>
                      <div className="flex items-center gap-2.5 min-w-0">
                        <img src={p.img} alt="" className="w-10 h-10 object-cover rounded-lg border border-white/5 shrink-0" />
                        <div className="min-w-0">
                          <h4 className={`text-[10px] font-black truncate max-w-[150px] ${textColor}`}>{p.title[lang] || p.title.uz}</h4>
                          <p className="text-[7px] font-black text-[#d4af37] uppercase mt-0.5">${p.price.toLocaleString()} • {p.gram} • {p.store}</p>
                        </div>
                      </div>
                      <div className="flex gap-1 shrink-0">
                        <button 
                          onClick={() => handleStartEditProduct(p)}
                          className="w-6 h-6 rounded-lg bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 flex items-center justify-center text-[9px] active:scale-90"
                          title={t.editBtn}
                        >
                          <i className="fas fa-edit"></i>
                        </button>
                        <button 
                          onClick={() => handleDeleteProduct(p.id)}
                          className="w-6 h-6 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 flex items-center justify-center text-[9px] active:scale-90"
                          title={t.deleteBtn}
                        >
                          <i className="fas fa-trash-alt"></i>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Contents for Tab 5: REKLAMALARNI TAHRIRLASH */}
        {activeTab === 'banners' && (
          <div className="space-y-4 animate-slide-up">
            
            {editingSlide || isAddingSlide ? (
              <div className={`${itemBg} border rounded-[28px] p-4 text-left space-y-3.5 shadow-md`}>
                <h3 className="text-xs font-black text-[#d4af37] uppercase tracking-wide">
                  {editingSlide ? t.editBannerTitle : t.addBannerTitle}
                </h3>

                <div className="space-y-3">
                  <div>
                    <label className="text-[7.5px] font-black text-gray-400 block mb-1 uppercase">Reklama rasmi</label>
                    <div className="flex gap-2 items-center">
                      {sImg && <img src={sImg} alt="" className="w-14 h-9 rounded-lg object-cover border border-white/10 shrink-0" />}
                      <label className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 ${inputBg} rounded-xl text-[9px] font-black uppercase tracking-wide cursor-pointer active:scale-95 transition-all`}>
                        {isUploadingSImg ? (
                          <><i className="fas fa-spinner fa-spin"></i><span>Yuklanmoqda...</span></>
                        ) : (
                          <><i className="fas fa-image"></i><span>{sImg ? 'Rasmni almashtirish' : 'Galereyadan tanlash'}</span></>
                        )}
                        <input type="file" hidden accept="image/*" onChange={handleSImgGalleryUpload} disabled={isUploadingSImg} />
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="text-[7.5px] font-black text-gray-400 block mb-1 uppercase">Video / Rolik havolasi (ixtiyoriy)</label>
                    <input 
                      type="text" 
                      value={sVideoUrl} 
                      onChange={e => setSVideoUrl(e.target.value)} 
                      placeholder="YouTube, Telegram yoki .mp4 havola"
                      className={`w-full ${inputBg} rounded-xl px-2.5 py-2 text-[9px] font-semibold outline-none`} 
                    />
                    <p className="text-[7.5px] text-gray-400 font-bold mt-1 leading-relaxed">Kiritilsa, banner bosilganda shu video ochiladi (yangi tabda).</p>
                  </div>

                  <div>
                    <label className="text-[7.5px] font-black text-gray-400 block mb-1 uppercase">{t.targetType}</label>
                    <select 
                      value={sTargetType} 
                      onChange={e => setSTargetType(e.target.value as 'store' | 'category' | 'url')}
                      className={`w-full ${inputBg} rounded-xl px-2.5 py-2 text-[10px] font-black border border-transparent outline-none`}
                    >
                      <option value="store">STORE (Do'kon)</option>
                      <option value="category">CATEGORY (Toifa)</option>
                      <option value="url">URL (Sayt / Joylashuv)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[7.5px] font-black text-gray-400 block mb-1 uppercase">{t.targetValue}</label>
                    <input 
                      type="text" 
                      value={sTargetValue} 
                      onChange={e => setSTargetValue(e.target.value)} 
                      placeholder={sTargetType === 'url' ? 'https://... yoki maps.google.com/...' : "Masalan: LM Gold yoki silver"}
                      className={`w-full ${inputBg} rounded-xl px-2.5 py-2 text-[9px] font-black outline-none`} 
                    />
                  </div>
                </div>

                <div className="flex gap-2 justify-end pt-2">
                  <button 
                    onClick={() => { setEditingSlide(null); setIsAddingSlide(false); }}
                    className="px-4 py-2 border border-white/10 text-gray-400 text-[8px] font-black uppercase rounded-lg active:scale-95"
                  >
                    {t.cancelBtn}
                  </button>
                  <button 
                    onClick={handleSaveSlide}
                    className="px-5 py-2 bg-[#d4af37] text-black text-[8px] font-black uppercase rounded-lg active:scale-95"
                  >
                    {t.saveBtn}
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-3.5">
                <button 
                  onClick={handleStartAddSlide}
                  className="w-full py-2.5 bg-[#d4af37] text-black font-black text-[10px] uppercase tracking-wider rounded-xl shadow active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                  <i className="fas fa-plus"></i>
                  <span>{t.addBannerBtn}</span>
                </button>

                {/* Banners List */}
                <div className="space-y-2.5 max-h-[380px] overflow-y-auto scrollbar-none pr-1">
                  {slides.map(slide => (
                    <div key={slide.id} className={`${itemBg} border rounded-2xl p-2.5 flex items-center justify-between text-left shadow-sm gap-2`}>
                      <div className="flex items-center gap-3 min-w-0">
                        <img src={slide.img} alt="" className="w-16 h-10 object-cover rounded-lg border border-white/5 shrink-0 shadow-inner" />
                        <div className="min-w-0 text-left">
                          <h4 className={`text-[10px] font-black uppercase tracking-wider ${textColor}`}>{slide.target.type}</h4>
                          <p className="text-[8px] font-black text-[#d4af37] uppercase truncate mt-0.5">{slide.target.value}</p>
                        </div>
                      </div>
                      <div className="flex gap-1 shrink-0">
                        <button 
                          onClick={() => handleStartEditSlide(slide)}
                          className="w-6 h-6 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center text-[9px] active:scale-90"
                          title={t.editBtn}
                        >
                          <i className="fas fa-edit"></i>
                        </button>
                        <button 
                          onClick={() => handleDeleteSlide(slide.id)}
                          className="w-6 h-6 rounded-lg bg-red-500/10 text-red-400 flex items-center justify-center text-[9px] active:scale-90"
                          title={t.deleteBtn}
                        >
                          <i className="fas fa-trash-alt"></i>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Contents for Tab 6: BANK KURSLARI (majburiy o'zgartirish) */}
        {activeTab === 'rates' && (
          <div className="space-y-4 animate-slide-up">
            <div className={`${itemBg} border rounded-[24px] p-3.5 text-[9px] font-bold leading-relaxed ${textColor} opacity-70`}>
              💵 Kurslar odatda <b>bank.uz</b>'dan avtomatik olinadi (har 30 daqiqada). Bu yerda kiritsangiz, sizning qiymatlaringiz <b>ustun</b> turadi (avtomatikani vaqtincha to'xtatadi). Saytdagi oddiy foydalanuvchilarga bu boshqaruv umuman ko'rinmaydi — faqat shu admin panelda.
            </div>

            {ratesSource === 'admin' && (
              <div className="px-3 py-2 bg-yellow-500/10 border border-yellow-500/20 rounded-xl text-[9px] font-black text-yellow-500 text-center uppercase tracking-wide">
                Hozir: QO'LDA kiritilgan kurslar faol
              </div>
            )}

            <div>
              <h4 className="text-[9px] font-black text-green-500 uppercase tracking-widest mb-2">{t.tabSales ? 'SOTISH (USD)' : 'SOTISH (USD)'}</h4>
              <div className="space-y-1.5 w-full">
                {rSotish.map((item, i) => (
                  <div key={i} className="flex gap-2 items-center">
                    <span className="text-[9px] font-bold text-gray-400 w-3">{i+1}.</span>
                    <input
                      type="text"
                      value={item.bank}
                      onChange={e => { const u = [...rSotish]; u[i] = { ...u[i], bank: e.target.value }; setRSotish(u); }}
                      className={`flex-1 ${inputBg} rounded-lg px-2 py-1.5 text-[10px] font-bold border outline-none focus:border-[#d4af37]/50`}
                      placeholder="Bank nomi"
                    />
                    <input
                      type="text"
                      value={item.rate}
                      onChange={e => { const u = [...rSotish]; u[i] = { ...u[i], rate: e.target.value }; setRSotish(u); }}
                      className={`w-20 ${inputBg} rounded-lg px-2 py-1.5 text-[10px] font-mono font-bold text-right border outline-none focus:border-[#d4af37]/50`}
                      placeholder="12050"
                    />
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-[9px] font-black text-red-500 uppercase tracking-widest mb-2">SOTIB OLISH (USD)</h4>
              <div className="space-y-1.5 w-full">
                {rSotib.map((item, i) => (
                  <div key={i} className="flex gap-2 items-center">
                    <span className="text-[9px] font-bold text-gray-400 w-3">{i+1}.</span>
                    <input
                      type="text"
                      value={item.bank}
                      onChange={e => { const u = [...rSotib]; u[i] = { ...u[i], bank: e.target.value }; setRSotib(u); }}
                      className={`flex-1 ${inputBg} rounded-lg px-2 py-1.5 text-[10px] font-bold border outline-none focus:border-[#d4af37]/50`}
                      placeholder="Bank nomi"
                    />
                    <input
                      type="text"
                      value={item.rate}
                      onChange={e => { const u = [...rSotib]; u[i] = { ...u[i], rate: e.target.value }; setRSotib(u); }}
                      className={`w-20 ${inputBg} rounded-lg px-2 py-1.5 text-[10px] font-mono font-bold text-right border outline-none focus:border-[#d4af37]/50`}
                      placeholder="12010"
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={handleResetRatesToAuto}
                disabled={ratesLoading}
                className="flex-1 py-2.5 border border-white/10 text-gray-400 text-[9px] font-black uppercase tracking-wider rounded-xl active:scale-95 transition-all"
              >
                Avtomatikaga qaytarish
              </button>
              <button
                onClick={handleSaveRates}
                disabled={ratesLoading}
                className="flex-1 py-2.5 bg-[#d4af37] text-black text-[9px] font-black uppercase tracking-wider rounded-xl shadow active:scale-95 transition-all"
              >
                Saqlash
              </button>
            </div>

            {/* --- Tilla va Kumush narxlari (1 gramm uchun) --- */}
            <div className="pt-5 mt-5 border-t border-white/10 space-y-3">
              <div className={`${itemBg} border rounded-[24px] p-3.5 text-[9px] font-bold leading-relaxed ${textColor} opacity-70`}>
                💰 Bu yerda kiritilgan narxlar saytdagi "Tilla va Kumush narxlari" oynasida (tepadagi menyu) barcha foydalanuvchilarga ko'rinadi. Faqat shu admin panelda o'zgartirish mumkin — do'kon egalari (sotuvchilar) bunga tega olmaydi.
              </div>

              <div className="grid grid-cols-4 text-[8px] font-black uppercase tracking-wider text-gray-400 pb-1 px-1">
                <span className="col-span-2">Metal / Proba</span>
                <span className="text-center">Sotish</span>
                <span className="text-center">Sotib olish</span>
              </div>

              <div className="space-y-1.5">
                {metalRates.map((r, i) => (
                  <div key={r.id} className={`grid grid-cols-4 items-center gap-1.5 ${itemBg} border rounded-xl px-2.5 py-2`}>
                    <div className="col-span-2 flex items-center gap-1.5 min-w-0">
                      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${r.metal === 'gold' ? 'bg-[#d4af37]' : 'bg-gray-400'}`}></span>
                      <span className={`text-[9px] font-bold ${textColor} truncate`}>{r.proba}</span>
                    </div>
                    <input
                      type="number"
                      step="0.01"
                      value={r.sellPrice}
                      onChange={e => {
                        const val = parseFloat(e.target.value) || 0;
                        const updated = [...metalRates];
                        updated[i] = { ...updated[i], sellPrice: val };
                        setMetalRates(updated);
                      }}
                      className={`w-full ${inputBg} rounded-lg px-1.5 py-1 text-[9px] font-mono font-bold text-center outline-none`}
                    />
                    <input
                      type="number"
                      step="0.01"
                      value={r.buyPrice}
                      onChange={e => {
                        const val = parseFloat(e.target.value) || 0;
                        const updated = [...metalRates];
                        updated[i] = { ...updated[i], buyPrice: val };
                        setMetalRates(updated);
                      }}
                      className={`w-full ${inputBg} rounded-lg px-1.5 py-1 text-[9px] font-mono font-bold text-center outline-none`}
                    />
                  </div>
                ))}
              </div>
              <p className="text-[8px] text-gray-500 font-bold text-center pt-1">Narxlar kiritilgan zahoti avtomatik saqlanadi</p>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
