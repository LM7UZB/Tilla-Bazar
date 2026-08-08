import React, { useState, useEffect } from 'react';
import { UIStrings, Language } from '../types';

interface CheckoutModalProps {
  onClose: () => void;
  onCash: () => void;
  onInstallment: () => void;
  strings: UIStrings;
  theme: 'dark' | 'light';
  totalPrice: number;
  lang: Language;
}

type CheckoutStep = 'select' | 'cash-details' | 'card-details' | 'installment-details' | 'installment-provider' | 'redirecting' | 'success';

export const CheckoutModal: React.FC<CheckoutModalProps> = ({ 
  onClose, onCash, onInstallment, strings, theme, totalPrice, lang 
}) => {
  const [step, setStep] = useState<CheckoutStep>('select');
  const [selectedOption, setSelectedOption] = useState<'cash' | 'card' | 'installment' | null>(null);
  
  // Confirmed States
  const [promoCode, setPromoCode] = useState('');
  const [isPromoValid, setIsPromoValid] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);

  // Redirection states
  const [selectedProvider, setSelectedProvider] = useState<string>('');
  const [providerLetter, setProviderLetter] = useState<string>('');
  const [providerColor, setProviderColor] = useState<string>('');
  
  // Cash form fields
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('+998 ');
  const [address, setAddress] = useState('');

  // Card form fields
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [cardHolder, setCardHolder] = useState('');
  const [isCardFlipped, setIsCardFlipped] = useState(false);

  // Installment fields
  const [selectedMonths, setSelectedMonths] = useState<3 | 6 | 12 | 24>(12);

  const handleProviderSelect = (name: string, letter: string, color: string, isInstallmentType = false) => {
    setSelectedProvider(name);
    setProviderLetter(letter);
    setProviderColor(color);
    setStep('redirecting');
    
    if ((window as any).Telegram?.WebApp?.HapticFeedback) {
      (window as any).Telegram.WebApp.HapticFeedback.impactOccurred('medium');
    }

    // Dynamic redirection link based on payment system
    let redirectUrl = "https://payme.uz";
    const lowerName = name.toLowerCase();
    if (lowerName.includes('click')) {
      redirectUrl = "https://click.uz";
    } else if (lowerName.includes('alif')) {
      redirectUrl = "https://alif.uz";
    } else if (lowerName.includes('paynet')) {
      redirectUrl = "https://paynet.uz";
    } else if (lowerName.includes('tbc')) {
      redirectUrl = "https://tbcbank.uz";
    } else if (lowerName.includes('uzum')) {
      redirectUrl = "https://uzum.uz";
    } else if (lowerName.includes('xazna')) {
      redirectUrl = "https://xazna.uz";
    }

    setTimeout(() => {
      // Trigger the automatic redirection
      try {
        window.open(redirectUrl, '_blank');
      } catch (err) {
        console.error("Redirection blocked by pop-up blocker", err);
      }

      setStep('success');
      if (isInstallmentType) {
        onInstallment();
      } else {
        onCash();
      }
      setShowCelebration(true);
      if ((window as any).Telegram?.WebApp?.HapticFeedback) {
        (window as any).Telegram.WebApp.HapticFeedback.notificationOccurred('success');
      }
      setTimeout(() => setShowCelebration(false), 5000);
    }, 2500);
  };

  const renderProviderLogo = (name: string, size: 'sm' | 'lg' = 'sm') => {
    const dim = size === 'lg' ? 'w-20 h-20 rounded-2xl' : 'w-12 h-12 rounded-xl';
    const scale = size === 'lg' ? 'scale-[1.35]' : 'scale-100';

    switch (name.toLowerCase()) {
      case 'payme':
        return (
          <div className={`${dim} bg-white flex flex-col items-center justify-center shadow-md p-1 border border-zinc-100 transition-all duration-300`}>
            <div className={`flex flex-col items-center justify-center ${scale}`}>
              <span className="text-[10px] font-sans font-black text-[#2e2e2e] leading-none mb-0.5">pay</span>
              <div className="bg-[#1ea1a9] px-2 py-0.5 rounded-[4px] relative flex items-center justify-center">
                <span className="text-[9px] font-sans font-black text-white leading-none">me</span>
                <div className="absolute right-[-2.5px] top-[4px] w-0 h-0 border-t-[4px] border-t-transparent border-b-[4px] border-b-transparent border-l-[4px] border-l-[#1ea1a9]"></div>
              </div>
            </div>
          </div>
        );
      case 'click':
      case 'click super...':
        return (
          <div className={`${dim} bg-[#0e1726] flex items-center justify-center shadow-md border border-zinc-850 transition-all duration-300`}>
            <svg viewBox="0 0 100 100" className={`${size === 'lg' ? 'w-14 h-14' : 'w-8 h-8'}`}>
              <circle cx="50" cy="50" r="32" fill="none" stroke="#00a3ff" strokeWidth="12" />
              <circle cx="50" cy="50" r="10" fill="#00a3ff" />
            </svg>
          </div>
        );
      case 'alif':
      case 'alif nasiya':
        return (
          <div className={`${dim} bg-white flex items-center justify-center shadow-md border border-zinc-100 transition-all duration-300`}>
            <svg viewBox="0 0 100 100" className={`${size === 'lg' ? 'w-14 h-14' : 'w-8 h-8'}`}>
              <path 
                d="M 68 22 A 38 38 0 1 0 72 70" 
                fill="none" 
                stroke="#14c185" 
                strokeWidth="10" 
                strokeLinecap="round" 
              />
              <polygon 
                points="50,34 33,62 67,62" 
                fill="#14c185" 
              />
            </svg>
          </div>
        );
      case 'paynet':
        return (
          <div className={`${dim} bg-white flex items-center justify-center shadow-md border border-zinc-100 transition-all duration-300`}>
            <div className={`${size === 'lg' ? 'w-14 h-14' : 'w-9 h-9'} rounded-full bg-gradient-to-tr from-[#00b050] via-[#00cc66] to-[#66ff99] relative shadow-inner overflow-hidden`}>
              <div className="absolute top-1 left-1.5 w-3 h-3 bg-white/40 rounded-full filter blur-[0.5px]"></div>
            </div>
          </div>
        );
      case 'tbc bank':
      case 'tbc uz':
        return (
          <div className={`${dim} bg-[#008be2] flex items-center justify-center shadow-md transition-all duration-300`}>
            <svg viewBox="0 0 100 100" className={`${size === 'lg' ? 'w-14 h-14' : 'w-8 h-8'}`} fill="white">
              <polygon points="50,22 25,65 37,68" />
              <polygon points="50,22 75,65 63,68" />
              <polygon points="50,45 34,75 66,75" />
            </svg>
          </div>
        );
      case 'uzum bank':
      case 'uzum nasiya':
        return (
          <div className={`${dim} bg-[#5d1bf2] flex items-center justify-center shadow-md relative overflow-hidden p-1 transition-all duration-300`}>
            <div className="w-full h-full rounded-lg border-2 border-[#a2fd0b] flex flex-col items-center justify-center">
              <span className={`text-white font-sans font-black ${size === 'lg' ? 'text-2xl' : 'text-lg'} leading-none mt-0.5`}>U</span>
              <span className={`text-[#a2fd0b] font-sans font-extrabold ${size === 'lg' ? 'text-[8px]' : 'text-[5px]'} uppercase tracking-wider leading-none mt-0.5`}>bank</span>
            </div>
          </div>
        );
      case 'xazna':
        return (
          <div className={`${dim} bg-[#7a37df] flex items-center justify-center shadow-md transition-all duration-300`}>
            <svg viewBox="0 0 100 100" className={`${size === 'lg' ? 'w-14 h-14' : 'w-8 h-8'}`} stroke="#ffd700" strokeWidth="6" fill="none">
              <circle cx="50" cy="50" r="30" />
              <path d="M 50 10 L 50 90 M 10 50 L 90 50" strokeWidth="8" />
              <circle cx="50" cy="50" r="10" fill="#ffd700" />
            </svg>
          </div>
        );
      default:
        return (
          <div className={`${dim} bg-gradient-to-br from-zinc-700 to-zinc-900 flex items-center justify-center font-sans font-black ${size === 'lg' ? 'text-3xl' : 'text-lg'} text-white shadow-md shadow-black/10 transition-all duration-300`}>
            {name.charAt(0)}
          </div>
        );
    }
  };

  const VALID_PROMO = "GOLD2025"; 

  const bgColor = theme === 'light' ? 'bg-[#f4f5f8]' : 'bg-[#121214]';
  const cardBg = theme === 'light' ? 'bg-white shadow-md border border-gray-100' : 'bg-[#1c1c1e] border-white/5';
  const textColor = theme === 'light' ? 'text-black' : 'text-white';
  const itemBg = theme === 'light' ? 'bg-white border-gray-100' : 'bg-[#18181b] border-white/5';
  const inputBg = theme === 'light' ? 'bg-[#eaebec]/60 border-transparent' : 'bg-white/5 border-transparent';

  useEffect(() => {
    if (promoCode.toUpperCase() === VALID_PROMO) {
      setIsPromoValid(true);
      setShowCelebration(true);
      if ((window as any).Telegram?.WebApp?.HapticFeedback) {
        (window as any).Telegram.WebApp.HapticFeedback.notificationOccurred('success');
      }
      setTimeout(() => setShowCelebration(false), 3000);
    } else {
      setIsPromoValid(false);
    }
  }, [promoCode]);

  // Handle phone entry auto formatter
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let raw = e.target.value.replace(/\D/g, '');
    if (raw.startsWith('998')) raw = raw.substring(3);
    let formatted = '+998 ';
    if (raw.length > 0) formatted += raw.substring(0, 2);
    if (raw.length > 2) formatted += ' ' + raw.substring(2, 5);
    if (raw.length > 5) formatted += ' ' + raw.substring(5, 7);
    if (raw.length > 7) formatted += ' ' + raw.substring(7, 9);
    setPhone(formatted.trimEnd());
  };

  // Format Card Number entry (groups of 4)
  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let raw = e.target.value.replace(/\D/g, '').substring(0, 16);
    let formatted = raw.replace(/(\d{4})/g, '$1 ').trim();
    setCardNumber(formatted);
  };

  // Format Card Expiry (MM/YY)
  const handleCardExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let raw = e.target.value.replace(/\D/g, '').substring(0, 4);
    let formatted = raw;
    if (raw.length > 2) {
      formatted = raw.substring(0, 2) + '/' + raw.substring(2);
    }
    setCardExpiry(formatted);
  };

  const calculateInstallment = () => {
    let interest = 0;
    if (selectedMonths === 6) interest = 0.05;
    if (selectedMonths === 12) interest = 0.10;
    if (selectedMonths === 24) interest = 0.18;

    const totalWithInterest = totalPrice * (1 + interest);
    const monthlyPayment = Math.round(totalWithInterest / selectedMonths);
    const totalInterestAdded = Math.round(totalPrice * interest);

    return {
      monthly: monthlyPayment,
      total: Math.round(totalWithInterest),
      interest: totalInterestAdded
    };
  };

  const installmentDetails = calculateInstallment();

  const handleNextStep = () => {
    if (selectedOption === 'cash') setStep('cash-details');
    if (selectedOption === 'card') setStep('card-details');
    if (selectedOption === 'installment') setStep('installment-details');
    if ((window as any).Telegram?.WebApp?.HapticFeedback) {
      (window as any).Telegram.WebApp.HapticFeedback.impactOccurred('medium');
    }
  };

  const handleConfirmOrder = () => {
    setStep('success');
    if (selectedOption === 'cash') onCash();
    if (selectedOption === 'installment') onInstallment();
    setShowCelebration(true);
    if ((window as any).Telegram?.WebApp?.HapticFeedback) {
      (window as any).Telegram.WebApp.HapticFeedback.notificationOccurred('success');
    }
    setTimeout(() => setShowCelebration(false), 5000);
  };

  // Localized words for payment
  const t = {
    title: lang === 'uz' ? "TO'LOV USULINI TANLANG" : lang === 'ru' ? "ВЫБЕРИТЕ СПОСОБ ОПЛАТЫ" : "CHOOSE PAYMENT METHOD",
    cashTitle: lang === 'uz' ? "NAQD PULDA" : lang === 'ru' ? "НАЛИЧНЫМИ" : "CASH ON DELIVERY",
    cashDesc: lang === 'uz' ? "Yetkazib berilganda to'lanadi" : lang === 'ru' ? "Оплачивается при доставке" : "Paid on delivery",
    cardTitle: lang === 'uz' ? "KARTA ORQALI" : lang === 'ru' ? "КАРТОЙ ОНЛАЙН" : "BY DEBIT CARD",
    cardDesc: lang === 'uz' ? "Visa / Mastercard / Humo / Uzcard" : lang === 'ru' ? "Visa / Mastercard / Humo / Uzcard" : "Visa / Mastercard / Humo / Uzcard",
    instTitle: lang === 'uz' ? "MUDDATLI BO'LIB TO'LASH" : lang === 'ru' ? "РАССРОЧКА" : "INSTALLMENT PAYMENTS",
    instDesc: lang === 'uz' ? "3, 6, 12 yoki 24 oyga bo'lib to'lash" : lang === 'ru' ? "3, 6, 12 или 24 месяца" : "Split in 3, 6, 12 or 24 months",
    confirmBtn: lang === 'uz' ? "BUYURTMANI TASDIQLASH" : lang === 'ru' ? "ПОДТВЕРДИТЬ ЗАКАЗ" : "CONFIRM ORDER",
    cancelBtn: lang === 'uz' ? "BEKOR QILISH" : lang === 'ru' ? "ОТМЕНА" : "CANCEL",
    summaryTitle: lang === 'uz' ? "BUYURTMA XULOSASI" : lang === 'ru' ? "СВОДКА ЗАКАЗА" : "ORDER SUMMARY",
    totalLabel: lang === 'uz' ? "Jami" : lang === 'ru' ? "Итого" : "Total",
    enterPromo: lang === 'uz' ? "Promokodni kiriting" : lang === 'ru' ? "Введите промокод" : "Enter coupon code",
    promoTip: lang === 'uz' ? "Promokod faqat naqd pulda amal qiladi." : lang === 'ru' ? "Промокод действует только при оплате наличными." : "Promocode only valid for cash payments.",
    deliveryTitle: lang === 'uz' ? "YETKAZIB BERISH" : lang === 'ru' ? "ДОСТАВКА" : "DELIVERY INFORMATION",
    nameLabel: lang === 'uz' ? "To'liq ismingiz" : lang === 'ru' ? "Ваше полное имя" : "Full Name",
    phoneLabel: lang === 'uz' ? "Telefon raqamingiz" : lang === 'ru' ? "Номер телефона" : "Phone Number",
    addressLabel: lang === 'uz' ? "Yetkazib berish manzili" : lang === 'ru' ? "Адрес доставки" : "Delivery address",
    cardHolderPlaceholder: lang === 'uz' ? "KARTA EGASI" : lang === 'ru' ? "ВЛАДЕЛЕЦ КАРТЫ" : "CARD HOLDER",
    cardNumberPlaceholder: lang === 'uz' ? "Karta raqami" : lang === 'ru' ? "Номер карты" : "Card Number",
    cardExpiryPlaceholder: lang === 'uz' ? "Amal qilish muddati" : lang === 'ru' ? "Срок действия" : "Expiry Month/Year",
    cardFlipTip: lang === 'uz' ? "↑ Kartani burish uchun bosing" : lang === 'ru' ? "↑ Нажмите на карту, чтобы перевернуть" : "↑ Tap card to flip",
    payNow: lang === 'uz' ? "HOZIR TO'LASH" : lang === 'ru' ? "ОПЛАТИТЬ СЕЙЧАС" : "PAY NOW",
    monthsTitle: lang === 'uz' ? "MUDDAT TANLANG" : lang === 'ru' ? "ВЫБЕРИТЕ СРОК" : "CHOOSE TERM",
    monthLabel: lang === 'uz' ? "OY" : lang === 'ru' ? "МЕС" : "MO",
    monthlyLabel: lang === 'uz' ? "OYLIK TO'LOV" : lang === 'ru' ? "ЕЖЕМЕСЯЧНЫЙ ПЛАТЕЖ" : "MONTHLY PAYMENT",
    totalWithInterest: lang === 'uz' ? "Jami (foiz bilan)" : lang === 'ru' ? "Итого (с процентами)" : "Total with interest",
    interestLabel: lang === 'uz' ? "To'lov foizi" : lang === 'ru' ? "Процент наценки" : "Markup fee",
    installmentAlert: lang === 'uz' ? "ESLATMA: Menejerimiz siz bilan bog'lanib, kerakli hujjatlarni rasmiylashtiradi." : lang === 'ru' ? "ПРИМЕЧАНИЕ: Наш менеджер свяжется с вами для оформления документов." : "NOTE: Our representative will call you to finalize paperwork.",
    completeInstallment: lang === 'uz' ? "MUDDATLI TO'LOVNI RASMIYLASHTIRISH" : lang === 'ru' ? "ОФОРМИТЬ В РАССРОЧКУ" : "ORDER IN INSTALLMENTS",
    successSub: lang === 'uz' ? "Buyurtmangiz muvaffaqiyatli rasmiylashtirildi!" : lang === 'ru' ? "Ваш заказ успешно принят!" : "Your order has been registered!",
    selectProvider: lang === 'uz' ? "TO'LOV TIZIMINI TANLANG" : lang === 'ru' ? "ВЫБЕРИТЕ ПЛАТЕЖНУЮ СИСТЕМУ" : "SELECT PAYMENT SYSTEM",
    selectInstProvider: lang === 'uz' ? "MUDDATLI TO'LOV TIZIMINI TANLANG" : lang === 'ru' ? "ВЫБЕРИТЕ СИСТЕМУ РАССРОЧКИ" : "SELECT INSTALLMENT SYSTEM",
    redirectingText: lang === 'uz' ? "to'lov tizimiga xavfsiz o'tkazilmoqda..." : lang === 'ru' ? "безопасный переход в платежную систему..." : "securely redirecting to payment system...",
    pleaseWait: lang === 'uz' ? "Iltimos, kuting..." : lang === 'ru' ? "Пожалуйста, подождите..." : "Please wait...",
  };

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-[200] flex items-end sm:items-center justify-center p-0 sm:p-6 animate-fade-in overflow-y-auto">
      {/* Dynamic Confetti Celebration */}
      {showCelebration && (
        <div className="fixed inset-0 pointer-events-none z-[300] flex items-center justify-center overflow-hidden">
          {['🥳', '🎉', '🌟', '💎', '🔥', '👏', '👑', '🥇', '⚡'].map((emoji, i) => (
            <div 
              key={i} 
              className="absolute text-5xl animate-bounce"
              style={{ 
                left: `${Math.random() * 80 + 10}%`, 
                top: `${Math.random() * 60 + 10}%`,
                animationDelay: `${i * 0.1}s`,
                opacity: 0.9,
                transform: `rotate(${Math.sin(i) * 30}deg)`
              }}
            >
              {emoji}
            </div>
          ))}
        </div>
      )}

      {/* Main Drawer container */}
      <div className={`w-full sm:max-w-lg ${bgColor} rounded-t-[40px] sm:rounded-[40px] border-t sm:border border-[#d4af37]/30 shadow-2xl p-6 sm:p-8 space-y-6 relative max-sm:pb-12 animate-slide-up`}>
        
        {/* Step: Selection Mode */}
        {step === 'select' && (
          <>
            {/* Soft drag indicator on mobile */}
            <div className="w-12 h-1 bg-gray-300 dark:bg-zinc-700 rounded-full mx-auto sm:hidden mb-2"></div>

            <div className="text-center space-y-3">
              <div className="w-16 h-16 bg-[#d4af37]/10 rounded-3xl flex items-center justify-center mx-auto text-[#d4af37] text-2xl shadow-inner border border-[#d4af37]/20">
                <i className="fas fa-wallet"></i>
              </div>
              <h2 className={`text-xl font-black ${textColor} uppercase tracking-tight`}>{t.title}</h2>
              <p className="text-sm font-black text-[#d4af37] tracking-wider uppercase">
                {t.totalLabel}: <span className="text-xl ml-1 font-bold">{totalPrice} $</span>
              </p>
            </div>

            <div className="space-y-3 pt-2">
              {/* Cash option */}
              <button 
                onClick={() => setSelectedOption('cash')}
                className={`w-full p-4 rounded-[26px] border flex items-center justify-between transition-all duration-300 ${selectedOption === 'cash' ? 'border-[#d4af37] bg-[#d4af37]/5 shadow-sm' : `${itemBg} border-transparent`}`}
              >
                <div className="flex items-center gap-4 text-left">
                  <div className="w-12 h-12 bg-green-500/10 rounded-2xl flex items-center justify-center text-green-500 shadow-inner">
                    <i className="fas fa-money-bill-wave text-xl"></i>
                  </div>
                  <div>
                    <h4 className={`font-black text-sm uppercase ${textColor}`}>{t.cashTitle}</h4>
                    <p className="text-[10px] text-gray-500 font-bold">{t.cashDesc}</p>
                  </div>
                </div>
                {/* Custom radio button */}
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${selectedOption === 'cash' ? 'border-[#d4af37] bg-[#d4af37]' : 'border-gray-300 dark:border-zinc-700'}`}>
                  {selectedOption === 'cash' && <i className="fas fa-check text-black text-[10px] font-black"></i>}
                </div>
              </button>

              {/* Card option */}
              <button 
                onClick={() => setSelectedOption('card')}
                className={`w-full p-4 rounded-[26px] border flex items-center justify-between transition-all duration-300 ${selectedOption === 'card' ? 'border-[#d4af37] bg-[#d4af37]/5 shadow-sm' : `${itemBg} border-transparent`}`}
              >
                <div className="flex items-center gap-4 text-left">
                  <div className="w-12 h-12 bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-500 shadow-inner">
                    <i className="fas fa-credit-card text-xl"></i>
                  </div>
                  <div>
                    <h4 className={`font-black text-sm uppercase ${textColor}`}>{t.cardTitle}</h4>
                    <p className="text-[10px] text-gray-500 font-bold">{t.cardDesc}</p>
                  </div>
                </div>
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${selectedOption === 'card' ? 'border-[#d4af37] bg-[#d4af37]' : 'border-gray-300 dark:border-zinc-700'}`}>
                  {selectedOption === 'card' && <i className="fas fa-check text-black text-[10px] font-black"></i>}
                </div>
              </button>

              {/* Installments option */}
              <button 
                onClick={() => setSelectedOption('installment')}
                className={`w-full p-4 rounded-[26px] border flex items-center justify-between transition-all duration-300 ${selectedOption === 'installment' ? 'border-[#d4af37] bg-[#d4af37]/5 shadow-sm' : `${itemBg} border-transparent`}`}
              >
                <div className="flex items-center gap-4 text-left">
                  <div className="w-12 h-12 bg-purple-500/10 rounded-2xl flex items-center justify-center text-purple-500 shadow-inner">
                    <i className="fas fa-calendar-alt text-xl"></i>
                  </div>
                  <div>
                    <h4 className={`font-black text-sm uppercase ${textColor}`}>{t.instTitle}</h4>
                    <p className="text-[10px] text-gray-500 font-bold">{t.instDesc}</p>
                  </div>
                </div>
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${selectedOption === 'installment' ? 'border-[#d4af37] bg-[#d4af37]' : 'border-gray-300 dark:border-zinc-700'}`}>
                  {selectedOption === 'installment' && <i className="fas fa-check text-black text-[10px] font-black"></i>}
                </div>
              </button>
            </div>

            {/* Confirm button */}
            <div className="space-y-3 pt-3">
              {selectedOption ? (
                <button 
                  onClick={handleNextStep}
                  className="w-full py-4 bg-gradient-to-r from-[#d4af37] to-[#e4bf47] hover:opacity-90 text-black font-black rounded-2xl text-xs uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg shadow-[#d4af37]/20 transition-all hover:scale-[1.01] active:scale-95 cursor-pointer"
                >
                  <span>{t.confirmBtn}</span>
                  <i className="fas fa-arrow-right"></i>
                </button>
              ) : (
                <button 
                  disabled
                  className="w-full py-4 bg-gray-300/40 dark:bg-zinc-800 text-gray-400 dark:text-zinc-600 font-black rounded-2xl text-xs uppercase tracking-widest cursor-not-allowed text-center"
                >
                  {t.confirmBtn} →
                </button>
              )}

              <button 
                onClick={onClose}
                className="w-full py-2 hover:opacity-80 text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] active:scale-95 transition-transform"
              >
                {t.cancelBtn}
              </button>
            </div>
          </>
        )}

        {/* Step: Cash details (Naqd Pulda Form) */}
        {step === 'cash-details' && (
          <>
            <div className="flex items-center justify-between pb-2">
              <button 
                onClick={() => setStep('select')}
                className="w-9 h-9 rounded-full bg-white dark:bg-zinc-800 shadow-sm flex items-center justify-center text-gray-500 dark:text-gray-300 hover:scale-105 active:scale-95 transition-all"
              >
                <i className="fas fa-arrow-left"></i>
              </button>
              <div className="text-right">
                <h3 className={`text-base font-black ${textColor} uppercase tracking-tight`}>{t.cashTitle}</h3>
                <p className="text-[9px] text-gray-500 font-extrabold uppercase">{t.cashDesc}</p>
              </div>
            </div>

            {/* Order summary row */}
            <div className={`${cardBg} rounded-[24px] p-4 flex items-center justify-between font-sans shadow-sm border`}>
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-widest">{t.summaryTitle}</span>
              <div className="flex items-baseline gap-1">
                <span className="text-xs font-semibold text-gray-400 uppercase">{t.totalLabel}:</span>
                <span className="text-lg font-black text-[#d4af37]">{totalPrice} $</span>
              </div>
            </div>

            {/* Promocode field */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.15em] ml-1">{strings.promocode.toUpperCase()}</label>
              <div className="relative group">
                <input 
                  type="text" 
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value)}
                  placeholder={t.enterPromo}
                  className={`w-full p-4 pr-12 rounded-2xl text-sm font-black outline-none transition-all duration-300 border ${isPromoValid ? 'border-green-500 bg-green-500/10 text-green-500' : `${inputBg} focus:border-[#d4af37]/30 ${textColor}`}`}
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-1">
                  <i className={`fas ${isPromoValid ? 'fa-check-circle text-green-500' : 'fa-ticket-alt text-gray-400 opacity-60'} text-lg transition-all`}></i>
                </div>
              </div>
              <p className="text-[9px] text-[#ff6b6b] ml-1 font-bold">{t.promoTip}</p>
              {isPromoValid && <p className="text-[10px] text-green-500 ml-1 font-black animate-pulse">{strings.promoApplied}</p>}
            </div>

            {/* Delivery Details */}
            <div className="space-y-3">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.15em] ml-1">{t.deliveryTitle}</label>
              
              <div className={`relative flex items-center ${inputBg} rounded-2xl p-3 border border-transparent focus-within:border-[#d4af37]/20`}>
                <i className="fas fa-user text-gray-400 w-8 text-center text-sm"></i>
                <input 
                  type="text" 
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder={t.nameLabel}
                  className={`w-full text-sm font-bold bg-transparent outline-none border-none ${textColor} focus:ring-0 placeholder:text-gray-500`}
                />
              </div>

              <div className={`relative flex items-center ${inputBg} rounded-2xl p-3 border border-transparent focus-within:border-[#d4af37]/20`}>
                <i className="fas fa-phone text-gray-400 w-8 text-center text-sm"></i>
                <input 
                  type="text" 
                  value={phone}
                  onChange={handlePhoneChange}
                  placeholder="+998 XX XXX XX XX"
                  className={`w-full text-sm font-bold bg-transparent outline-none border-none ${textColor} focus:ring-0 placeholder:text-gray-500`}
                />
              </div>

              <div className={`relative flex items-center ${inputBg} rounded-2xl p-3 border border-transparent focus-within:border-[#d4af37]/20`}>
                <i className="fas fa-map-marker-alt text-gray-400 w-8 text-center text-sm"></i>
                <input 
                  type="text" 
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder={t.addressLabel}
                  className={`w-full text-sm font-bold bg-transparent outline-none border-none ${textColor} focus:ring-0 placeholder:text-gray-500`}
                />
              </div>
            </div>

            {/* Submit button */}
            <button 
              onClick={handleConfirmOrder}
              disabled={!fullName || phone.length < 15 || !address}
              className={`w-full py-4 text-white font-black rounded-2xl text-xs uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg transition-all duration-300 ${(!fullName || phone.length < 15 || !address) ? 'bg-zinc-700/50 text-zinc-500 cursor-not-allowed shadow-none' : 'bg-[#2ecc71] hover:bg-[#27ae60] shadow-green-500/10 active:scale-95 cursor-pointer'}`}
            >
              <i className="fas fa-check-circle"></i>
              <span>{t.confirmBtn}</span>
            </button>
          </>
        )}

        {/* Step: Card Details screen with Grid of Payment Systems */}
        {step === 'card-details' && (
          <>
            <div className="flex items-center justify-between pb-1">
              <button 
                onClick={() => setStep('select')}
                className="w-9 h-9 rounded-full bg-white dark:bg-zinc-800 shadow-sm flex items-center justify-center text-gray-500 dark:text-gray-300 hover:scale-105 active:scale-95 transition-all"
              >
                <i className="fas fa-arrow-left"></i>
              </button>
              <div className="text-right">
                <h3 className={`text-base font-black ${textColor} uppercase tracking-tight`}>{t.cardTitle}</h3>
                <p className="text-[9px] text-gray-500 font-extrabold uppercase">{t.cardDesc}</p>
              </div>
            </div>

            {/* Price Box */}
            <div className={`${cardBg} rounded-[24px] p-4 flex items-center justify-between font-sans shadow-sm border`}>
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-widest">{lang === 'uz' ? 'JAMI' : lang === 'ru' ? 'ИТОГО' : 'TOTAL'}</span>
              <span className="text-2xl font-black text-[#d4af37]">{totalPrice} $</span>
            </div>

            {/* Provider Grid Title */}
            <div className="pt-2 text-left">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.12em] ml-1">{t.selectProvider}</label>
            </div>

            {/* Payment Systems Grid */}
            <div className="grid grid-cols-2 gap-3 pb-2">
              {[
                { name: 'Payme', letter: 'P', color: 'bg-[#1ea1a9]', border: 'border-[#1ea1a9]/20' },
                { name: 'Click', letter: 'C', color: 'bg-[#00a3ff]', border: 'border-[#00a3ff]/20' },
                { name: 'Alif', letter: 'A', color: 'bg-[#00b050]', border: 'border-[#00b050]/20' },
                { name: 'Paynet', letter: 'P', color: 'bg-[#ff9900]', border: 'border-[#ff9900]/20' },
                { name: 'TBC Bank', letter: 'T', color: 'bg-[#008be2]', border: 'border-[#008be2]/20' },
                { name: 'Xazna', letter: 'X', color: 'bg-[#7a37df]', border: 'border-[#7a37df]/20' }
              ].map(provider => (
                <button
                  key={provider.name}
                  onClick={() => handleProviderSelect(provider.name, provider.letter, provider.color, false)}
                  className={`p-4 rounded-[26px] border ${provider.border} ${itemBg} flex flex-col items-center justify-center gap-3 transition-all hover:scale-[1.03] hover:border-gray-300 dark:hover:border-zinc-700 active:scale-95 group relative overflow-hidden`}
                >
                  <div className="transition-transform group-hover:scale-110">
                    {renderProviderLogo(provider.name, 'sm')}
                  </div>
                  <span className={`text-xs font-black tracking-tight ${textColor}`}>{provider.name}</span>
                </button>
              ))}
            </div>
          </>
        )}

        {/* Step: Installment calculator screen */}
        {step === 'installment-details' && (
          <>
            <div className="flex items-center justify-between pb-1">
              <button 
                onClick={() => setStep('select')}
                className="w-9 h-9 rounded-full bg-white dark:bg-zinc-800 shadow-sm flex items-center justify-center text-gray-500 dark:text-gray-300 hover:scale-105 active:scale-95 transition-all"
              >
                <i className="fas fa-arrow-left"></i>
              </button>
              <div className="text-right">
                <h3 className={`text-base font-black ${textColor} uppercase tracking-tight`}>{t.instTitle}</h3>
                <p className="text-[9px] text-gray-500 font-extrabold uppercase">{t.instDesc}</p>
              </div>
            </div>

            {/* Price reference */}
            <div className={`${cardBg} rounded-[24px] p-4 flex items-center justify-between font-sans shadow-sm border`}>
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-widest">{t.summaryTitle}</span>
              <div className="flex items-baseline gap-1">
                <span className="text-xs font-semibold text-gray-400 uppercase">{t.totalLabel}:</span>
                <span className="text-lg font-black text-[#d4af37]">{totalPrice} $</span>
              </div>
            </div>

            {/* SELECT DURATION TABS */}
            <div className="space-y-3">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.12em] ml-1">{t.monthsTitle}</label>
              <div className="grid grid-cols-4 gap-2">
                {([
                  { val: 3, label: '3', flag: '0%' },
                  { val: 6, label: '6', flag: '+5%' },
                  { val: 12, label: '12', flag: '+10%' },
                  { val: 24, label: '24', flag: '+18%' }
                ] as const).map(tab => (
                  <button 
                     key={tab.val}
                     onClick={() => {
                       setSelectedMonths(tab.val);
                       if ((window as any).Telegram?.WebApp?.HapticFeedback) {
                         (window as any).Telegram.WebApp.HapticFeedback.impactOccurred('light');
                       }
                     }}
                     className={`p-3 rounded-2xl flex flex-col items-center justify-center gap-0.5 border transition-all ${selectedMonths === tab.val ? 'bg-purple-600/15 border-purple-500 text-purple-400 ring-2 ring-purple-500/20' : `${itemBg} border-transparent hover:border-gray-300 dark:hover:border-zinc-700`}`}
                  >
                    <span className="text-lg font-black leading-tight">{tab.label}</span>
                    <span className="text-[7px] font-bold uppercase tracking-wider">{t.monthLabel}</span>
                    <span className="text-[9px] font-extrabold text-[#2ecc71]">{tab.flag}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* INSTALLMENT FORMULA CALCULATIONS */}
            <div className={`${cardBg} rounded-[30px] p-5 border shadow-sm space-y-4`}>
              <div>
                <span className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">{t.monthlyLabel}</span>
                <div className="flex items-baseline gap-1 mt-0.5">
                  <span className="text-4xl font-extrabold text-purple-500 font-sans tracking-tight">{installmentDetails.monthly} $</span>
                  <span className="text-sm font-semibold text-gray-400">/ {t.monthLabel.toLowerCase()}</span>
                </div>
              </div>

              <div className="border-t border-gray-100 dark:border-white/5 pt-3 space-y-2.5 font-sans">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-400 uppercase font-semibold">{t.totalWithInterest}</span>
                  <span className={`text-sm font-extrabold ${textColor}`}>{installmentDetails.total} $</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-400 uppercase font-semibold">{t.interestLabel}</span>
                  <span className="text-sm font-extrabold text-purple-400">+{installmentDetails.interest} $</span>
                </div>
              </div>
            </div>

            {/* ESLATMA NOTE */}
            <div className="bg-purple-500/10 border border-purple-500/20 p-4 rounded-2xl flex gap-3 text-left">
              <i className="fas fa-info-circle text-purple-400 text-base mt-0.5 flex-shrink-0"></i>
              <p className="text-[10px] text-purple-300 font-bold leading-normal">{t.installmentAlert}</p>
            </div>

            {/* Confirmation Button */}
            <button 
              onClick={() => {
                setStep('installment-provider');
                if ((window as any).Telegram?.WebApp?.HapticFeedback) {
                  (window as any).Telegram.WebApp.HapticFeedback.impactOccurred('medium');
                }
              }}
              className="w-full py-4 bg-purple-600 hover:bg-purple-700 active:scale-95 text-white font-black rounded-2xl text-xs uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg shadow-purple-600/10 transition-transform cursor-pointer"
            >
              <i className="fas fa-arrow-right text-sm"></i>
              <span>{t.completeInstallment} — {installmentDetails.monthly} $ × {selectedMonths}</span>
            </button>
          </>
        )}

        {/* Step: Installment Provider Selection screen */}
        {step === 'installment-provider' && (
          <>
            <div className="flex items-center justify-between pb-1">
              <button 
                onClick={() => setStep('installment-details')}
                className="w-9 h-9 rounded-full bg-white dark:bg-zinc-800 shadow-sm flex items-center justify-center text-gray-500 dark:text-gray-300 hover:scale-105 active:scale-95 transition-all"
              >
                <i className="fas fa-arrow-left"></i>
              </button>
              <div className="text-right">
                <h3 className={`text-base font-black ${textColor} uppercase tracking-tight`}>{t.instTitle}</h3>
                <p className="text-[9px] text-gray-500 font-extrabold uppercase">{selectedMonths} {t.monthLabel.toLowerCase()}</p>
              </div>
            </div>

            {/* Price Box */}
            <div className={`${cardBg} rounded-[24px] p-4 flex items-center justify-between font-sans shadow-sm border`}>
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-widest">{t.monthlyLabel}</span>
              <span className="text-2xl font-black text-purple-500">{installmentDetails.monthly} $ / {t.monthLabel.toLowerCase()}</span>
            </div>

            {/* Provider Grid Title */}
            <div className="pt-2 text-left">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.12em] ml-1">{t.selectInstProvider}</label>
            </div>

            {/* Installment Systems Grid */}
            <div className="grid grid-cols-3 gap-2 pb-2">
              {[
                { name: 'Alif Nasiya', letter: 'A', color: 'bg-[#00b050]', border: 'border-[#00b050]/20' },
                { name: 'Payme', letter: 'P', color: 'bg-[#1ea1a9]', border: 'border-[#1ea1a9]/20' },
                { name: 'Uzum Nasiya', letter: 'U', color: 'bg-[#7a37df]', border: 'border-[#7a37df]/20' }
              ].map(provider => (
                <button
                  key={provider.name}
                  onClick={() => handleProviderSelect(provider.name, provider.letter, provider.color, true)}
                  className={`p-3 rounded-[24px] border ${provider.border} ${itemBg} flex flex-col items-center justify-center gap-2 transition-all hover:scale-[1.03] hover:border-gray-300 dark:hover:border-zinc-700 active:scale-95 group relative overflow-hidden`}
                >
                  <div className="transition-transform group-hover:scale-110">
                    {renderProviderLogo(provider.name, 'sm')}
                  </div>
                  <span className={`text-[10px] font-black tracking-tight text-center leading-tight ${textColor}`}>{provider.name}</span>
                </button>
              ))}
            </div>
          </>
        )}

        {/* Step: Redirection animation loader screen */}
        {step === 'redirecting' && (
          <div className="text-center py-8 space-y-6 animate-fade-in">
            {/* Pulsing colored logo indicator */}
            <div className="relative w-24 h-24 mx-auto flex items-center justify-center">
              {/* Outer pulsing rings */}
              <div className={`absolute inset-0 rounded-full ${providerColor} opacity-20 animate-ping duration-1000`}></div>
              <div className={`absolute -inset-2 rounded-full ${providerColor} opacity-10 animate-pulse duration-700`}></div>
              
              {/* Main premium logo */}
              <div className="relative z-10">
                {renderProviderLogo(selectedProvider, 'lg')}
              </div>
            </div>

            <div className="space-y-2">
              <h3 className={`text-lg font-black tracking-wide ${textColor}`}>
                {selectedProvider}
              </h3>
              <p className="text-xs text-gray-500 font-extrabold max-w-[280px] mx-auto leading-relaxed">
                {t.redirectingText}
              </p>
            </div>

            <div className="flex flex-col items-center justify-center gap-2 pt-2">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#d4af37] animate-bounce" style={{ animationDelay: '0s' }}></span>
                <span className="w-2 h-2 rounded-full bg-[#d4af37] animate-bounce" style={{ animationDelay: '0.15s' }}></span>
                <span className="w-2 h-2 rounded-full bg-[#d4af37] animate-bounce" style={{ animationDelay: '0.3s' }}></span>
              </div>
              <span className="text-[10px] font-bold text-gray-400 tracking-widest uppercase">{t.pleaseWait}</span>
            </div>
          </div>
        )}

        {/* Step: Order Accepted/Success screen */}
        {step === 'success' && (
          <div className="text-center py-6 sm:py-9 space-y-6 animate-slide-up">
            <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto text-green-500 text-4xl shadow-[0_0_40px_rgba(46,204,113,0.4)] animate-bounce border border-green-500/30">
              <i className="fas fa-check-circle"></i>
            </div>
            
            <div className="space-y-4 px-2">
              <h2 className={`text-2xl font-black ${textColor} uppercase tracking-tighter`}>
                {strings.orderAccepted}
              </h2>
              <p className={`text-sm font-bold leading-relaxed px-1 ${theme === 'light' ? 'text-gray-600' : 'text-gray-300'}`}>
                {selectedOption === 'cash' 
                  ? t.successSub + " " + strings.cashSuccess 
                  : t.successSub + " " + t.installmentAlert
                }
              </p>
            </div>

            <button 
              onClick={onClose}
              className="w-full py-4 bg-gradient-to-r from-[#d4af37] to-[#e4bf47] text-black font-black rounded-2xl active:scale-95 transition-transform uppercase text-xs tracking-widest shadow-lg shadow-[#d4af37]/20"
            >
              {strings.close}
            </button>
          </div>
        )}

      </div>
    </div>
  );
};
