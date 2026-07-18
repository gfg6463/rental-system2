'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { BrandLogo } from './BrandLogos';
import { fetchCars, fetchOffers, fetchLastUpdate, fetchDeliveryFees, fetchCirculars, Car, Offer, DeliveryFee, Circular } from './api';
import { 
  Search, 
  Car as CarIcon, 
  Tag, 
  Copy, 
  Printer, 
  Download, 
  LogIn, 
  LogOut, 
  ShieldAlert, 
  Sun, 
  Moon, 
  CheckCircle2, 
  XCircle, 
  X,
  RefreshCw,
  BellRing,
  MapPin,
  Truck,
  Megaphone
} from 'lucide-react';

export default function HomePage() {
  const [cars, setCars] = useState<Car[]>([]);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [lastUpdate, setLastUpdate] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  
  // Delivery Fees States
  const [activeTabMenu, setActiveTabMenu] = useState<'cars' | 'delivery'>('cars');
  const [deliveryFees, setDeliveryFees] = useState<DeliveryFee[]>([]);
  const [calcFrom, setCalcFrom] = useState<string>('');
  const [calcTo, setCalcTo] = useState<string>('');
  const [calculatedPrice, setCalculatedPrice] = useState<number | null>(null);
  const [deliverySearch, setDeliverySearch] = useState<string>('');
  
  // Search & Filter state
  const [search, setSearch] = useState<string>('');
  const [category, setCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('default');
  const [availableOnly, setAvailableOnly] = useState<boolean>(false);
  const [darkMode, setDarkMode] = useState<boolean>(false);
  
  // Custom toast notification state
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);
  const [newOfferAlert, setNewOfferAlert] = useState<boolean>(false);
  const [selectedOfferForCar, setSelectedOfferForCar] = useState<Record<number, number>>({});
  
  // Circulars States
  const [circulars, setCirculars] = useState<Circular[]>([]);
  const [showCircularsModal, setShowCircularsModal] = useState<boolean>(false);
  const [dismissedCirculars, setDismissedCirculars] = useState<Record<number, boolean>>({});
  const [selectedCircular, setSelectedCircular] = useState<Circular | null>(null);
  const [showCircularsDropdown, setShowCircularsDropdown] = useState<boolean>(false);
  const [readCirculars, setReadCirculars] = useState<string[]>([]);
  
  // User state
  const [user, setUser] = useState<{ username: string; role: string } | null>(null);
  const router = useRouter();

  // Load user from localStorage & enforce login
  useEffect(() => {
    const token = localStorage.getItem('token');
    const username = localStorage.getItem('username');
    const role = localStorage.getItem('role');
    if (token && username && role) {
      setUser({ username, role });
    } else {
      router.push('/login');
      return;
    }

    const rawRead = localStorage.getItem('read_circulars');
    if (rawRead) {
      setReadCirculars(JSON.parse(rawRead));
    }
    
    // Check system preference for dark mode
    if (typeof window !== 'undefined') {
      const isDark = localStorage.getItem('darkMode') === 'true' || 
                     (!('darkMode' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches);
      setDarkMode(isDark);
      if (isDark) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  }, [router]);

  // Fetch data
  const loadData = async () => {
    setLoading(true);
    try {
      const [carsData, offersData, updateTime, deliveryData, circularsData] = await Promise.all([
        fetchCars(),
        fetchOffers(),
        fetchLastUpdate(),
        fetchDeliveryFees(),
        fetchCirculars()
      ]);
      setCars(carsData);
      setOffers(offersData);
      setLastUpdate(updateTime);
      setDeliveryFees(deliveryData);
      setCirculars(circularsData);
      
      // Trigger new offer alert if there's a recent active offer (e.g. added in the last 24h)
      const hasRecentOffer = offersData.some(offer => offer.active);
      if (hasRecentOffer) {
        setNewOfferAlert(true);
      }
    } catch (err) {
      showToast('حدث خطأ أثناء تحميل البيانات من الخادم', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Delivery calculation auto-updater
  useEffect(() => {
    if (calcFrom && calcTo) {
      if (calcFrom === calcTo) {
        setCalculatedPrice(0);
        return;
      }
      const match = deliveryFees.find(f => f.from_city === calcFrom && f.to_city === calcTo) ||
                    deliveryFees.find(f => f.from_city === calcTo && f.to_city === calcFrom);
      if (match) {
        setCalculatedPrice(match.price);
      } else {
        setCalculatedPrice(null);
      }
    } else {
      setCalculatedPrice(null);
    }
  }, [calcFrom, calcTo, deliveryFees]);

  const swapCities = () => {
    const tmp = calcFrom;
    setCalcFrom(calcTo);
    setCalcTo(tmp);
  };

  const copyDeliveryPrice = () => {
    if (calcFrom && calcTo && calculatedPrice !== null) {
      const basePrice = calculatedPrice;
      const taxAmount = Number((calculatedPrice * 0.15).toFixed(2));
      const totalPrice = Number((calculatedPrice * 1.15).toFixed(2));
      const text = "🚚 تكلفة تسليم السيارة بين المناطق:\n" +
                   "• من: " + calcFrom + "\n" +
                   "• إلى: " + calcTo + "\n" +
                   "• السعر الأساسي: " + basePrice + " ريال سعودي\n" +
                   "• ضريبة القيمة المضافة (15%): " + taxAmount + " ريال سعودي\n" +
                   "• السعر الإجمالي شامل الضريبة: " + totalPrice + " ريال سعودي";
      navigator.clipboard.writeText(text)
        .then(() => showToast("تم نسخ رسوم الشحن شاملة الضريبة لـ (" + calcFrom + " ➔ " + calcTo + ") بنجاح!", "success"))
        .catch(() => showToast("فشل النسخ التلقائي للأسعار", "error"));
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const showToast = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 3000);
  };

  const toggleDarkMode = () => {
    const newDark = !darkMode;
    setDarkMode(newDark);
    localStorage.setItem('darkMode', String(newDark));
    if (newDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    localStorage.removeItem('role');
    localStorage.removeItem('permissions');
    sessionStorage.removeItem('login_popup_shown');
    setUser(null);
    showToast('تم تسجيل الخروج بنجاح', 'success');
    router.push('/login');
  };

  // Get all active matching offers for a car
  const getCarActiveOffers = (car: Car) => {
    return offers.filter(o => {
      if (!o.active) return false;
      const isPermanent = o.is_permanent === true;
      if (!isPermanent && o.end_date) {
        const now = new Date();
        const expiry = new Date(o.end_date);
        expiry.setHours(23, 59, 59, 999);
        if (now > expiry) return false;
      }
      const carCategories = car.category ? car.category.split(',').map(s => s.trim()) : [];
      return o.discount_type && 
        o.discount_type !== 'none' && 
        (o.apply_to_category === 'الكل' || (o.apply_to_category && carCategories.includes(o.apply_to_category)));
    });
  };

  // Calculate price under a specific offer (returns original rates if offer is null)
  const getCarPriceForOffer = (car: Car, offer: Offer | null) => {
    let price_daily = car.price_daily;
    let price_weekly = car.price_weekly;
    let price_monthly = car.price_monthly;

    if (offer && offer.discount_type && offer.discount_type !== 'none') {
      if (offer.discount_type === 'percentage' && offer.discount_value) {
        const factor = (100 - offer.discount_value) / 100;
        price_daily = Math.round(car.price_daily * factor);
        price_weekly = Math.round(car.price_weekly * factor);
        price_monthly = Math.round(car.price_monthly * factor);
      } else if (offer.discount_type === 'value' && offer.discount_value) {
        const dailyDiscount = offer.discount_value;
        price_daily = Math.max(1, car.price_daily - dailyDiscount);
        price_weekly = Math.max(1, car.price_weekly - (dailyDiscount * 6));
        price_monthly = Math.max(1, car.price_monthly - (dailyDiscount * 20));
      }
    }

    return {
      price_daily,
      price_weekly,
      price_monthly,
      hasDiscount: price_daily < car.price_daily
    };
  };

  // Copy rates handler
  const handleCopyRates = (car: Car) => {
    const activeOffers = getCarActiveOffers(car);
    
    let textToCopy = `🚗 أسعار تأجير: ${car.name} (${car.model})
• الفئة: ${car.category}`;

    if (activeOffers.length > 0) {
      // 1. Show base price
      textToCopy += `\n\n💵 الأسعار بدون العروض:`;
      textToCopy += `\n  - الإيجار اليومي: ${car.price_daily} ريال`;
      textToCopy += `\n  - الإيجار الأسبوعي: ${car.price_weekly} ريال`;
      textToCopy += `\n  - الإيجار الشهري: ${car.price_monthly} ريال`;

      // 2. Show each offer
      textToCopy += `\n\n🎉 عروض الخصم المتاحة:`;
      activeOffers.forEach(o => {
        const rates = getCarPriceForOffer(car, o);
        textToCopy += `\n• ${o.title}:`;
        textToCopy += `\n  - الإيجار اليومي: ${rates.price_daily} ريال`;
        textToCopy += `\n  - الإيجار الأسبوعي: ${rates.price_weekly} ريال`;
        textToCopy += `\n  - الإيجار الشهري: ${rates.price_monthly} ريال`;
      });
    } else {
      textToCopy += `\n• الإيجار اليومي: ${car.price_daily} ريال سعودي`;
      textToCopy += `\n• الإيجار الأسبوعي: ${car.price_weekly} ريال سعودي`;
      textToCopy += `\n• الإيجار الشهري: ${car.price_monthly} ريال سعودي`;
    }

    if (car.allowed_km_daily !== undefined) {
      textToCopy += `\n\n• الكيلومترات المسموحة يومياً: ${car.allowed_km_daily} كم`;
    }
    if (car.extra_km_price !== undefined) {
      textToCopy += `\n• سعر الكيلومتر الزائد: ${car.extra_km_price} ريال`;
    }

    textToCopy += `\n• التوفر: ${car.available ? '✓ متوفر الآن' : '✗ غير متوفر حالياً'}`;

    navigator.clipboard.writeText(textToCopy)
      .then(() => showToast(`تم نسخ أسعار جميع العروض لـ ${car.name} إلى الحافظة!`, 'success'))
      .catch(() => showToast('فشل النسخ التلقائي للأسعار', 'error'));
  };

  // Export to CSV/Excel handler
  const handleExportCSV = () => {
    const headers = ['اسم السيارة', 'الموديل', 'الفئة', 'السعر اليومي (ريال)', 'السعر الأسبوعي (ريال)', 'السعر الشهري (ريال)', 'الحالة'];
    const rows = filteredCars.map(car => [
      car.name,
      car.model,
      car.category,
      car.price_daily,
      car.price_weekly,
      car.price_monthly,
      car.available ? 'متوفر' : 'غير متوفر'
    ]);

    // Use BOM for Excel Arabic characters support
    const csvContent = '\uFEFF' + [
      headers.join(','),
      ...rows.map(e => e.map(val => `"${val}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `أسعار_تأجير_السيارات_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('تم تصدير الأسعار بتنسيق CSV بنجاح', 'success');
  };

  // Dynamically extract unique cities from deliveryFees
  const allCities = Array.from(new Set([
    ...deliveryFees.map(f => f.from_city),
    ...deliveryFees.map(f => f.to_city)
  ])).sort();

  // Filter and sort logic
  const filteredCars = cars
    .filter(car => {
      const matchSearch = car.name.toLowerCase().includes(search.toLowerCase()) || 
                          car.category.toLowerCase().includes(search.toLowerCase()) ||
                          car.model.includes(search);
      const carCategories = car.category ? car.category.split(',').map(s => s.trim()) : [];
      const matchCategory = category === 'all' || carCategories.includes(category);
      const matchAvailability = !availableOnly || car.available;
      return matchSearch && matchCategory && matchAvailability;
    })
    .sort((a, b) => {
      if (sortBy === 'price-asc') return a.price_daily - b.price_daily;
      if (sortBy === 'price-desc') return b.price_daily - a.price_daily;
      return 0; // Default ID sort (descending order from API)
    });

  const categories = ['سيدان', 'اقتصادي', 'عائلي', 'اس يو في', 'دفع رباعي', 'بيك أب', 'فارهة'];

  const activeOffersList = offers.filter(o => {
    if (!o.active) return false;
    if (o.is_permanent) return true;
    if (!o.end_date) return true;
    const now = new Date();
    const expiry = new Date(o.end_date);
    expiry.setHours(23, 59, 59, 999);
    return now <= expiry;
  });

  const activeCirculars = circulars.filter(c => {
    if (!c.active) return false;
    if (c.is_permanent) return true;
    if (!c.end_date) return true;
    const now = new Date();
    const expiry = new Date(c.end_date);
    expiry.setHours(23, 59, 59, 999);
    return now <= expiry;
  });

  const unreadCirculars = activeCirculars.filter(c => !readCirculars.includes(c.id.toString()));

  const markAsRead = (id: number) => {
    const sId = id.toString();
    if (!readCirculars.includes(sId)) {
      const updated = [...readCirculars, sId];
      setReadCirculars(updated);
      localStorage.setItem('read_circulars', JSON.stringify(updated));
    }
  };

  // Auto-open circulars modal once per session on login as a reminder
  useEffect(() => {
    if (user && activeCirculars.length > 0) {
      const shown = sessionStorage.getItem('login_popup_shown');
      if (!shown) {
        setShowCircularsModal(true);
        sessionStorage.setItem('login_popup_shown', 'true');
      }
    }
  }, [user, activeCirculars]);

  const formatDate = (isoString: string) => {
    if (!isoString) return 'قيد التحديث';
    const date = new Date(isoString);
    return date.toLocaleString('ar-SA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors duration-200">
      
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed top-5 left-5 z-50 px-6 py-4 rounded-xl shadow-xl flex items-center gap-3 transition-all duration-300 transform translate-y-0 ${
          toast.type === 'success' ? 'bg-emerald-600 text-white' : 
          toast.type === 'error' ? 'bg-red-600 text-white' : 'bg-blue-600 text-white'
        }`}>
          {toast.type === 'success' && <CheckCircle2 className="w-5 h-5" />}
          {toast.type === 'error' && <XCircle className="w-5 h-5" />}
          <span className="text-sm font-semibold">{toast.message}</span>
        </div>
      )}

      {/* Header / Navbar */}
      <header className="bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 sticky top-0 z-40 transition-colors duration-200 no-print">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img 
              src="/logo.png" 
              alt="شعار شركة حسين" 
              className="w-12 h-12 object-contain"
            />
            <div>
              <h1 className="text-xl font-extrabold text-gray-900 dark:text-white tracking-tight flex items-center gap-2">
                <span>شركة حسين لتأجير السيارات</span>
                <span className="bg-brand-50 text-brand-700 dark:bg-brand-950/50 dark:text-brand-400 text-xs font-semibold px-2.5 py-0.5 rounded-full border border-brand-200 dark:border-brand-900/50">
                  لوحة الموظفين
                </span>
              </h1>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">بوابة الموظفين - خدمة العملاء وحاسبة الأسعار</p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            
            {/* Dark Mode Toggle */}
            <button 
              onClick={toggleDarkMode}
              className="p-2.5 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-xl transition duration-150"
              title="تبديل المظهر"
            >
              {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            {/* Circulars Dropdown Trigger */}
            <div className="relative">
              <button 
                onClick={() => setShowCircularsDropdown(!showCircularsDropdown)}
                className="relative p-2.5 bg-brand-50 hover:bg-brand-100 text-brand-700 dark:bg-brand-950/40 dark:hover:bg-brand-950/60 dark:text-brand-400 rounded-xl transition duration-150 flex items-center gap-1.5 font-bold text-xs"
                title="التعميمات والقرارات"
              >
                <Megaphone className="w-5 h-5 text-brand-500" />
                <span className="hidden md:inline">التعميمات الإدارية</span>
                {unreadCirculars.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full border-2 border-white dark:border-gray-900 animate-bounce flex items-center justify-center text-[9px] text-white font-black">
                    {unreadCirculars.length}
                  </span>
                )}
              </button>

              {/* Dropdown Menu */}
              {showCircularsDropdown && (
                <>
                  {/* Backdrop click-away helper */}
                  <div className="fixed inset-0 z-40" onClick={() => setShowCircularsDropdown(false)}></div>
                  
                  <div className="absolute left-0 mt-2 w-80 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl shadow-xl z-50 py-3 no-print text-right animate-fade-in max-h-[400px] overflow-y-auto">
                    <div className="px-4 pb-2 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between gap-2">
                      <span className="text-xs font-black text-gray-900 dark:text-white">قائمة التعميمات والقرارات</span>
                      {unreadCirculars.length > 0 && (
                        <button 
                          onClick={() => {
                            const allIds = activeCirculars.map(c => c.id.toString());
                            setReadCirculars(allIds);
                            localStorage.setItem('read_circulars', JSON.stringify(allIds));
                          }}
                          className="text-[10px] font-bold text-brand-650 hover:text-brand-700 dark:text-brand-450 dark:hover:text-brand-400"
                        >
                          تحديد الكل كمقروء
                        </button>
                      )}
                    </div>
                    <div className="divide-y divide-gray-50 dark:divide-gray-800/40">
                      {activeCirculars.length === 0 ? (
                        <div className="py-8 text-center text-xs text-gray-400 dark:text-gray-550">لا توجد تعميمات إدارية نشطة</div>
                      ) : (
                        activeCirculars.map((c) => {
                          const isUnread = !readCirculars.includes(c.id.toString());
                          return (
                            <div 
                              key={c.id}
                              onClick={() => {
                                setSelectedCircular(c);
                                markAsRead(c.id);
                                setShowCircularsDropdown(false);
                              }}
                              className={`p-3.5 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition cursor-pointer text-right flex items-start gap-2.5 ${isUnread ? 'bg-brand-50/20 dark:bg-brand-950/10' : ''}`}
                            >
                              <div className="mt-1">
                                {isUnread ? (
                                  <span className="w-2 h-2 rounded-full bg-brand-500 inline-block shrink-0 animate-pulse"></span>
                                ) : (
                                  <span className="w-2 h-2 rounded-full bg-gray-300 dark:bg-gray-700 inline-block shrink-0"></span>
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <h4 className={`text-xs truncate ${isUnread ? 'font-black text-gray-900 dark:text-white' : 'font-semibold text-gray-500 dark:text-gray-400'}`}>
                                  {c.title}
                                </h4>
                                <span className="text-[9px] text-gray-400 dark:text-gray-550 block mt-1">
                                  {new Date(c.created_at).toLocaleDateString('ar-SA')}
                                </span>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Login / Actions */}
            {user ? (
              <div className="flex items-center gap-2">
                <div className="hidden md:flex flex-col text-left items-end ml-2">
                  <span className="text-xs font-semibold text-gray-800 dark:text-gray-200">{user.username}</span>
                  <span className="text-[10px] text-brand-600 dark:text-brand-400 font-medium">
                    {user.role === 'admin' ? 'مدير النظام' : 'موظف'}
                  </span>
                </div>
                {(user.role === 'admin' || (localStorage.getItem('permissions') && JSON.parse(localStorage.getItem('permissions') || '[]').length > 0)) && (
                  <button 
                    onClick={() => router.push('/admin')}
                    className="bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold px-4 py-2.5 rounded-xl shadow-lg shadow-brand-600/15 hover:shadow-brand-600/25 transition duration-150 flex items-center gap-1.5"
                  >
                    <ShieldAlert className="w-4 h-4" />
                    <span className="hidden sm:inline">لوحة الإدارة</span>
                  </button>
                )}
                <button 
                  onClick={handleLogout}
                  className="p-2.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-xl transition duration-150"
                  title="تسجيل الخروج"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <button 
                onClick={() => router.push('/login')}
                className="bg-brand-500 hover:bg-brand-600 text-white text-sm font-semibold px-4 py-2.5 rounded-xl shadow-lg shadow-brand-500/10 hover:shadow-brand-500/20 transition duration-150 flex items-center gap-1.5"
              >
                <LogIn className="w-4 h-4" />
                <span>دخول المدير</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Top Circular Notification Banner */}
      {circulars.length > 0 && !dismissedCirculars[circulars[0].id] && (
        <div className="bg-amber-50/95 dark:bg-amber-950/20 backdrop-blur-md py-3 px-4 shadow-sm border-b border-amber-100 dark:border-amber-900/30 flex items-center justify-between no-print relative overflow-hidden animate-slide-down z-30 transition-colors duration-200">
          <div className="absolute top-0 right-0 h-1 bg-amber-500 w-full animate-pulse"></div>
          <div className="max-w-7xl mx-auto w-full flex flex-col sm:flex-row sm:items-center justify-between gap-3 relative z-10">
            <div className="flex items-center gap-3">
              <span className="p-2 bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 rounded-xl shrink-0 flex items-center justify-center">
                <Megaphone className="w-5 h-5 animate-bounce" />
              </span>
              <div className="text-right">
                <span className="text-[9px] uppercase tracking-wider font-extrabold bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-350 px-2.5 py-0.5 rounded-full inline-block mb-1">
                  إعلان إداري هام للموظفين
                </span>
                <h4 className="text-xs md:text-sm font-black text-gray-900 dark:text-gray-100 flex items-center justify-start gap-2">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                  </span>
                  <span>{circulars[0].title}</span>
                </h4>
              </div>
            </div>
            
            <div className="flex items-center gap-3 self-end sm:self-center">
              <button
                onClick={() => setSelectedCircular(circulars[0])}
                className="px-4 py-2 bg-amber-600 text-white hover:bg-amber-700 text-xs font-bold rounded-xl transition shadow-md shadow-amber-600/10"
              >
                تفاصيل التعميم
              </button>
              <button
                onClick={() => setDismissedCirculars(prev => ({ ...prev, [circulars[0].id]: true }))}
                className="p-2 text-gray-400 hover:text-gray-600 dark:text-gray-550 dark:hover:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition"
                title="إغلاق التنبيه"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Body */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Printable Header */}
        <div className="hidden print:block text-center border-b pb-6 mb-8 text-black">
          <h1 className="text-3xl font-bold">لائحة أسعار تأجير السيارات الرسمية</h1>
          <p className="text-gray-600 mt-2">تاريخ الطباعة والتحديث: {formatDate(lastUpdate)}</p>
        </div>

        {/* Navigation Tabs (Mobile & Desktop) */}
        <div className="flex bg-white dark:bg-gray-900 border border-gray-150/50 dark:border-gray-800/50 p-1.5 rounded-2xl mb-8 no-print shadow-sm transition">
          <button
            onClick={() => setActiveTabMenu('cars')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition duration-150 ${
              activeTabMenu === 'cars'
                ? 'bg-brand-500 text-white shadow-md shadow-brand-500/15'
                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/30'
            }`}
          >
            <CarIcon className="w-4.5 h-4.5" />
            <span>أسعار تأجير السيارات</span>
          </button>
          <button
            onClick={() => setActiveTabMenu('delivery')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition duration-150 ${
              activeTabMenu === 'delivery'
                ? 'bg-brand-500 text-white shadow-md shadow-brand-500/15'
                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/30'
            }`}
          >
            <Truck className="w-4.5 h-4.5" />
            <span>التسليم بين المناطق</span>
          </button>
        </div>

        {/* Top Info Banner */}
        <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-6 mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4 transition-colors duration-200">
          <div className="flex items-center gap-3">
            <div className="w-2.5 h-2.5 bg-brand-500 rounded-full animate-ping"></div>
            <div>
              <span className="text-sm font-semibold text-gray-500 dark:text-gray-400">آخر تحديث لأسعار السيارات:</span>
              <span className="text-sm font-bold text-gray-900 dark:text-white mr-2">
                {lastUpdate ? formatDate(lastUpdate) : 'جاري تحميل التوقيت...'}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2 no-print">
            <button 
              onClick={loadData}
              className="p-2 text-gray-400 hover:text-brand-600 dark:text-gray-500 dark:hover:text-brand-400 transition"
              title="تحديث البيانات"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              onClick={handleExportCSV}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm font-bold rounded-xl transition flex items-center gap-1.5 shadow-sm"
            >
              <Download className="w-4 h-4" />
              <span>تصدير Excel</span>
            </button>
            <button
              onClick={() => window.print()}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm font-bold rounded-xl transition flex items-center gap-1.5 shadow-sm"
            >
              <Printer className="w-4 h-4" />
              <span>طباعة الأسعار</span>
            </button>
          </div>
        </div>

        {/* Dynamic New Offers Notification Bar */}
        {newOfferAlert && (
          <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/30 rounded-2xl p-4 mb-8 flex items-center justify-between no-print animate-fade-in">
            <div className="flex items-center gap-3">
              <span className="p-2 bg-emerald-500 text-white rounded-xl">
                <BellRing className="w-5 h-5 animate-swing" />
              </span>
              <div>
                <h4 className="text-sm font-bold text-emerald-900 dark:text-emerald-300">عروض ترويجية جديدة متوفرة الآن!</h4>
                <p className="text-xs text-emerald-700 dark:text-emerald-400/80 mt-0.5">انتبه للعروض الترويجية الحالية عند الرد على استفسارات العملاء.</p>
              </div>
            </div>
            <button 
              onClick={() => setNewOfferAlert(false)}
              className="text-xs font-semibold text-emerald-800 dark:text-emerald-400 hover:underline"
            >
              إغلاق
            </button>
          </div>
        )}

        {/* Content Layout Grid (Main Left, Offers Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Main Pricing/Delivery Portal (Left/Middle 3 Columns) */}
          <div className="lg:col-span-3 space-y-8">
            
            {/* View 1: Cars Rates */}
            {activeTabMenu === 'cars' && (
              <div className="space-y-8 animate-fade-in">
                {/* Search and Filters Card */}
                <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-6 shadow-sm transition-colors duration-200 no-print">
                  <div className="flex flex-col md:flex-row gap-4">
                    
                    {/* Search input */}
                    <div className="relative flex-grow">
                      <input
                        type="text"
                        placeholder="ابحث باسم السيارة أو الموديل أو الفئة..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-4 pr-11 py-3 bg-gray-50 border border-gray-200 dark:bg-gray-800 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none transition duration-200 text-right text-sm"
                      />
                      <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-gray-400">
                        <Search className="w-5 h-5" />
                      </div>
                    </div>

                    {/* Sort Option */}
                    <div className="w-full md:w-48">
                      <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 dark:bg-gray-800 dark:border-gray-700 rounded-xl outline-none text-sm transition focus:ring-2 focus:ring-brand-500 text-right"
                      >
                        <option value="default">الترتيب الافتراضي</option>
                        <option value="price-asc">السعر اليومي: من الأقل للأعلى</option>
                        <option value="price-desc">السعر اليومي: من الأعلى للأقل</option>
                      </select>
                    </div>
                  </div>

                  {/* Category buttons row */}
                  <div className="flex flex-wrap items-center justify-between gap-4 mt-6 pt-6 border-t border-gray-50 dark:border-gray-800">
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => setCategory('all')}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition duration-150 ${
                          category === 'all' 
                            ? 'bg-brand-500 text-white shadow-md shadow-brand-500/10' 
                            : 'bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300'
                        }`}
                      >
                        الكل
                      </button>
                      {categories.map((cat) => (
                        <button
                          key={cat}
                          onClick={() => setCategory(cat)}
                          className={`px-4 py-2 rounded-xl text-xs font-bold transition duration-150 ${
                            category === cat 
                              ? 'bg-brand-500 text-white shadow-md shadow-brand-500/10' 
                              : 'bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300'
                          }`}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>

                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={availableOnly}
                        onChange={(e) => setAvailableOnly(e.target.checked)}
                        className="rounded text-brand-500 focus:ring-brand-500 w-4 h-4 dark:bg-gray-800 dark:border-gray-700"
                      />
                      <span className="text-xs font-semibold text-gray-600 dark:text-gray-400">السيارات المتوفرة فقط</span>
                    </label>
                  </div>
                </div>

                {/* Car Cards Grid */}
                {loading ? (
                  <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl">
                    <div className="w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 mt-4">جاري تحميل قائمة الأسعار والسيارات...</p>
                  </div>
                ) : filteredCars.length === 0 ? (
                  <div className="text-center py-20 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl">
                    <CarIcon className="w-16 h-16 text-gray-300 dark:text-gray-700 mx-auto mb-4" />
                    <h3 className="text-lg font-bold text-gray-800 dark:text-white">لم يتم العثور على نتائج</h3>
                    <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">تأكد من تعديل كلمات البحث أو الفلترة المحددة.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 print-grid">
                    {filteredCars.map((car) => {
                      const activeOffers = getCarActiveOffers(car);
                      
                      // Determine current selected offer
                      let currentOffer = null as Offer | null;
                      if (activeOffers.length > 0) {
                        const selectedVal = selectedOfferForCar[car.id];
                        if (selectedVal === undefined) {
                          // Default to pinned offer or first offer
                          currentOffer = activeOffers.find(o => o.pinned) || activeOffers[0];
                        } else if (selectedVal !== 0) {
                          currentOffer = activeOffers.find(o => o.id === selectedVal) || null;
                        }
                      }

                      const { price_daily, price_weekly, price_monthly, hasDiscount } = getCarPriceForOffer(car, currentOffer);
                      return (
                        <div 
                          key={car.id} 
                          className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-lg hover:border-brand-200 dark:hover:border-brand-900/40 transition-all duration-200 group flex flex-col justify-between print-card"
                        >
                        {/* Brand Logo Container */}
                        <div className="relative h-44 w-full bg-gray-50 dark:bg-gray-950/40 overflow-hidden flex items-center justify-center border-b border-gray-100/50 dark:border-gray-800/40">
                          {/* Decorative pattern or gradient */}
                          <div className="absolute inset-0 bg-gradient-to-tr from-brand-500/5 via-transparent to-emerald-500/5 opacity-50"></div>
                          <div className="relative z-10 text-brand-600 dark:text-brand-400 group-hover:scale-110 transition duration-300 transform">
                            <BrandLogo carName={car.name} className="w-16 h-16" />
                          </div>
                          
                          {/* Availability badge */}
                          <span className={`absolute top-4 right-4 px-3 py-1 text-[10px] font-extrabold rounded-full flex items-center gap-1.5 shadow-md ${
                            car.available 
                              ? 'bg-emerald-500 text-white' 
                              : 'bg-red-500 text-white'
                          }`}>
                            {car.available ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                            <span>{car.available ? 'متوفر' : 'غير متوفر'}</span>
                          </span>

                          {/* Category Badge */}
                          <div className="absolute bottom-4 left-4 flex flex-wrap gap-1 max-w-[70%]">
                            {car.category ? car.category.split(',').map(s => s.trim()).map(cat => (
                              <span key={cat} className="bg-gray-900/80 text-white text-[9px] font-bold px-2 py-0.5 rounded backdrop-blur-sm">
                                {cat}
                              </span>
                            )) : null}
                          </div>
                        </div>

                        {/* Info */}
                        <div className="p-5 flex-grow flex flex-col justify-between">
                          <div>
                            <div className="flex items-start justify-between">
                              <h3 className="text-lg font-bold text-gray-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-400 transition">
                                {car.name}
                              </h3>
                              <span className="text-xs font-semibold text-gray-400 dark:text-gray-500 border border-gray-100 dark:border-gray-800 px-2 py-0.5 rounded-lg bg-gray-50 dark:bg-gray-800/40">
                                {car.model}
                              </span>
                            </div>
                          </div>

                          {/* Pricing Table */}
                          {/* Single active offer display */}
                          {activeOffers.length === 1 && (
                            <div className="mb-2 bg-brand-50/50 dark:bg-brand-950/20 text-brand-700 dark:text-brand-400 text-[10px] px-2.5 py-1 rounded-lg font-bold border border-brand-100/50 dark:border-brand-900/30 flex items-center justify-between no-print animate-fade-in">
                              <span>خصم نشط: {activeOffers[0].title}</span>
                            </div>
                          )}

                          {/* Multiple active offers interactive pills selection */}
                          {activeOffers.length > 1 && (
                            <div className="mb-4 space-y-1.5 no-print animate-fade-in">
                              <span className="text-[10px] font-bold text-gray-455 dark:text-gray-500 block">عروض ترويجية متعددة متوفرة (انقر للاختيار):</span>
                              <div className="flex flex-wrap gap-1.5">
                                {/* Base price pill */}
                                <button
                                  onClick={() => setSelectedOfferForCar(prev => ({ ...prev, [car.id]: 0 }))}
                                  className={`px-2 py-0.5 rounded-lg text-[9px] font-black border transition ${
                                    currentOffer === null
                                      ? 'bg-gray-800 border-gray-800 text-white dark:bg-white dark:border-white dark:text-gray-900 shadow-sm'
                                      : 'bg-gray-50 border-gray-150 text-gray-500 hover:bg-gray-100 dark:bg-gray-800/60 dark:border-gray-800 dark:text-gray-400'
                                  }`}
                                >
                                  السعر الأصلي
                                </button>
                                {activeOffers.map(o => (
                                  <button
                                    key={o.id}
                                    onClick={() => setSelectedOfferForCar(prev => ({ ...prev, [car.id]: o.id }))}
                                    className={`px-2 py-0.5 rounded-lg text-[9px] font-black border transition flex items-center gap-1.5 ${
                                      currentOffer?.id === o.id
                                        ? 'bg-brand-500 border-brand-500 text-white shadow-md shadow-brand-500/10'
                                        : 'bg-gray-50 border-gray-150 text-gray-500 hover:bg-brand-50 hover:text-brand-700 dark:bg-gray-800/60 dark:border-gray-800 dark:text-gray-400'
                                    }`}
                                  >
                                    {o.pinned && <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 animate-pulse"></span>}
                                    <span>{o.title}</span>
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}
                          <div className="mt-5 space-y-2 border-t border-gray-50 dark:border-gray-800/50 pt-4">
                            <div className="flex justify-between items-center py-0.5 text-sm">
                              <span className="text-gray-400 dark:text-gray-500 font-medium">اليومي</span>
                              <span className="text-gray-900 dark:text-white font-extrabold text-base flex items-center gap-1.5">
                                {hasDiscount ? (
                                  <>
                                    <span className="line-through text-gray-450 dark:text-gray-550 text-xs font-normal">{car.price_daily}</span>
                                    <span className="text-brand-650 dark:text-brand-450 font-black">{price_daily}</span>
                                  </>
                                ) : (
                                  car.price_daily
                                )}
                                <span className="text-[10px] font-medium text-gray-450 dark:text-gray-500 font-normal">ريال/يوم</span>
                              </span>
                            </div>
                            <div className="flex justify-between items-center py-0.5 text-sm">
                              <span className="text-gray-400 dark:text-gray-500 font-medium">الأسبوعي</span>
                              <span className="text-gray-900 dark:text-white font-extrabold text-base flex items-center gap-1.5">
                                {hasDiscount ? (
                                  <>
                                    <span className="line-through text-gray-450 dark:text-gray-550 text-xs font-normal">{car.price_weekly}</span>
                                    <span className="text-brand-650 dark:text-brand-450 font-black">{price_weekly}</span>
                                  </>
                                ) : (
                                  car.price_weekly
                                )}
                                <span className="text-[10px] font-medium text-gray-450 dark:text-gray-550 font-normal">ريال/أسبوع</span>
                              </span>
                            </div>
                            <div className="flex justify-between items-center py-0.5 text-sm">
                              <span className="text-gray-400 dark:text-gray-500 font-medium">الشهري</span>
                              <span className="text-gray-900 dark:text-white font-extrabold text-base flex items-center gap-1.5">
                                {hasDiscount ? (
                                  <>
                                    <span className="line-through text-gray-450 dark:text-gray-550 text-xs font-normal">{car.price_monthly}</span>
                                    <span className="text-brand-650 dark:text-brand-450 font-black">{price_monthly}</span>
                                  </>
                                ) : (
                                  car.price_monthly
                                )}
                                <span className="text-[10px] font-medium text-gray-450 dark:text-gray-550 font-normal">ريال/شهر</span>
                              </span>
                            </div>
                            {(car.allowed_km_daily !== undefined || car.extra_km_price !== undefined) && (
                              <div className="mt-3 pt-3 border-t border-gray-150 dark:border-gray-800/50 space-y-1 text-xs">
                                {car.allowed_km_daily !== undefined && (
                                  <div className="flex justify-between text-gray-500 dark:text-gray-400">
                                    <span>المسافة اليومية المسموحة</span>
                                    <span className="font-semibold text-gray-700 dark:text-gray-350">{car.allowed_km_daily} كم</span>
                                  </div>
                                )}
                                {car.extra_km_price !== undefined && (
                                  <div className="flex justify-between text-gray-500 dark:text-gray-400">
                                    <span>سعر الكيلومتر الزائد</span>
                                    <span className="font-semibold text-gray-700 dark:text-gray-350">{car.extra_km_price} ريال</span>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                          
                          {/* Copy Action button */}
                          <div className="mt-6 pt-4 border-t border-gray-50 dark:border-gray-800/50 flex gap-2 no-print">
                            <button
                              onClick={() => handleCopyRates(car)}
                              className="w-full bg-brand-50 hover:bg-brand-100 dark:bg-brand-950/30 dark:hover:bg-brand-900/40 text-brand-700 dark:text-brand-400 font-bold py-2.5 px-3 rounded-xl transition duration-150 flex items-center justify-center gap-1.5 text-xs shadow-inner"
                            >
                              <Copy className="w-4 h-4" />
                              <span>نسخ الأسعار للعميل</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  </div>
                )}
              </div>
            )}

            {/* View 2: Intercity Delivery Calculator */}
            {activeTabMenu === 'delivery' && (
              <div className="space-y-8 animate-fade-in">
                
                {/* Interactive Calculator Card */}
                <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-6 shadow-sm no-print">
                  <h3 className="text-base font-extrabold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-brand-500" />
                    <span>حاسبة شحن وتسليم السيارات بين المناطق</span>
                  </h3>
                  
                  <div className="flex flex-col md:flex-row items-center gap-4">
                    {/* From City */}
                    <div className="w-full">
                      <label className="block text-xs font-bold text-gray-400 dark:text-gray-500 mb-2">منطقة الاستلام (من)</label>
                      <select
                        value={calcFrom}
                        onChange={(e) => setCalcFrom(e.target.value)}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 dark:bg-gray-800 dark:border-gray-700 rounded-xl outline-none text-sm transition focus:ring-2 focus:ring-brand-500 text-right font-bold text-gray-800 dark:text-white"
                      >
                        <option value="">-- اختر مدينة الاستلام --</option>
                        {Array.from(new Set([
                          ...deliveryFees.map(f => f.from_city),
                          ...deliveryFees.map(f => f.to_city)
                        ])).sort().map(city => (
                          <option key={city} value={city}>{city}</option>
                        ))}
                      </select>
                    </div>

                    {/* Swap button */}
                    <button
                      onClick={swapCities}
                      className="p-3 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 rounded-full transition transform hover:rotate-180 duration-300 shrink-0 mt-6"
                      title="عكس المدن"
                    >
                      <RefreshCw className="w-4 h-4" />
                    </button>

                    {/* To City */}
                    <div className="w-full">
                      <label className="block text-xs font-bold text-gray-400 dark:text-gray-500 mb-2">منطقة التسليم (إلى)</label>
                      <select
                        value={calcTo}
                        onChange={(e) => setCalcTo(e.target.value)}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 dark:bg-gray-800 dark:border-gray-700 rounded-xl outline-none text-sm transition focus:ring-2 focus:ring-brand-500 text-right font-bold text-gray-800 dark:text-white"
                      >
                        <option value="">-- اختر مدينة التسليم --</option>
                        {Array.from(new Set([
                          ...deliveryFees.map(f => f.from_city),
                          ...deliveryFees.map(f => f.to_city)
                        ])).sort().map(city => (
                          <option key={city} value={city}>{city}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Calculator Result Box */}
                  {calcFrom && calcTo && (
                    <div className="mt-8 p-6 bg-brand-50/50 dark:bg-brand-950/20 border border-brand-100 dark:border-brand-900/40 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-6">
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-8 w-full sm:w-auto">
                        <div>
                          <div className="text-xs font-bold text-gray-400 dark:text-gray-550">السعر بدون الضريبة:</div>
                          <div className="mt-1.5 flex items-baseline gap-1.5">
                            {calculatedPrice !== null ? (
                              <>
                                <span className="text-2xl font-extrabold text-gray-700 dark:text-gray-300">{calculatedPrice}</span>
                                <span className="text-xs font-semibold text-gray-400 dark:text-gray-550 font-normal">ريال</span>
                              </>
                            ) : (
                              <span className="text-sm font-bold text-red-500">غير متوفر حالياً</span>
                            )}
                          </div>
                        </div>

                        {calculatedPrice !== null && (
                          <div className="border-t sm:border-t-0 sm:border-r border-gray-200 dark:border-gray-800 pt-3 sm:pt-0 sm:pr-8 w-full sm:w-auto">
                            <div className="text-xs font-bold text-brand-600 dark:text-brand-400">السعر شامل الضريبة (15%):</div>
                            <div className="mt-1.5 flex items-baseline gap-1.5 flex-wrap">
                              <span className="text-3xl font-black text-brand-700 dark:text-brand-400">
                                {Number((calculatedPrice * 1.15).toFixed(2))}
                              </span>
                              <span className="text-xs font-bold text-brand-650 dark:text-brand-400 font-normal">ريال سعودي</span>
                              <span className="text-[10px] text-gray-450 dark:text-gray-550 font-normal mr-1">
                                (يشمل ضريبة {Number((calculatedPrice * 0.15).toFixed(2))} ريال)
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                      
                      {calculatedPrice !== null && (
                        <button
                          onClick={copyDeliveryPrice}
                          className="w-full sm:w-auto bg-brand-600 hover:bg-brand-700 text-white font-bold py-2.5 px-4 rounded-xl shadow-lg shadow-brand-600/10 transition duration-150 flex items-center justify-center gap-1.5 text-xs shrink-0"
                        >
                          <Copy className="w-4 h-4" />
                          <span>نسخ رسوم التوصيل للعميل</span>
                        </button>
                      )}
                    </div>
                  )}

                </div>

                {/* Full Routes Pricing Grid / Reference Table */}
                <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-6 shadow-sm">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                    <h3 className="text-base font-extrabold text-gray-900 dark:text-white flex items-center gap-2">
                      <Truck className="w-5 h-5 text-brand-500" />
                      <span>جدول تسعير الشحن والتوصيل المعتمد</span>
                    </h3>
                    
                    <div className="relative w-full sm:w-64 no-print">
                      <input
                        type="text"
                        placeholder="ابحث عن مدينة..."
                        value={deliverySearch}
                        onChange={(e) => setDeliverySearch(e.target.value)}
                        className="w-full pl-4 pr-9 py-2 bg-gray-50 border border-gray-200 dark:bg-gray-800 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none transition text-right text-xs text-gray-800 dark:text-white"
                      />
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-gray-400">
                        <Search className="w-4 h-4" />
                      </div>
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-right text-xs border-collapse">
                      <thead>
                        <tr className="bg-gray-50 dark:bg-gray-800/40 text-gray-500 dark:text-gray-400 font-bold border-b border-gray-100 dark:border-gray-800">
                          <th className="p-3">نقطة الاستلام (من)</th>
                          <th className="p-3">نقطة التسليم (إلى)</th>
                          <th className="p-3">التكلفة الإجمالية (ريال)</th>
                          <th className="p-3 text-center no-print">الإجراء</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                        {deliveryFees
                          .filter(fee => {
                            return fee.from_city.toLowerCase().includes(deliverySearch.toLowerCase()) ||
                                   fee.to_city.toLowerCase().includes(deliverySearch.toLowerCase()) ||
                                   String(fee.price).includes(deliverySearch);
                          })
                          .length === 0 ? (
                          <tr>
                            <td colSpan={4} className="p-4 text-center text-gray-400">لا توجد مسارات شحن مطابقة لبحثك.</td>
                          </tr>
                        ) : (
                          deliveryFees
                            .filter(fee => {
                              return fee.from_city.toLowerCase().includes(deliverySearch.toLowerCase()) ||
                                     fee.to_city.toLowerCase().includes(deliverySearch.toLowerCase()) ||
                                     String(fee.price).includes(deliverySearch);
                            })
                            .map((fee) => (
                              <tr key={fee.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/10 transition">
                                <td className="p-3 font-bold text-gray-800 dark:text-gray-200">{fee.from_city}</td>
                                <td className="p-3 font-bold text-gray-800 dark:text-gray-200">{fee.to_city}</td>
                                <td className="p-3 font-extrabold text-brand-700 dark:text-brand-400 text-sm">{fee.price} ريال</td>
                                <td className="p-3 text-center no-print">
                                  <button
                                    onClick={() => {
                                      setCalcFrom(fee.from_city);
                                      setCalcTo(fee.to_city);
                                      window.scrollTo({ top: 0, behavior: 'smooth' });
                                    }}
                                    className="text-brand-600 hover:text-brand-700 hover:underline font-bold"
                                  >
                                    تحديد في الحاسبة
                                  </button>
                                </td>
                              </tr>
                            ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Offers Panel (Right 1 Column) */}
          <div className="space-y-6">
            
            {/* Offers Card */}
            <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-6 shadow-sm transition-colors duration-200">
              <h2 className="text-lg font-extrabold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                <Tag className="w-5 h-5 text-brand-500" />
                <span>العروض الحالية</span>
              </h2>

              {loading ? (
                <div className="space-y-4">
                  <div className="h-20 bg-gray-100 dark:bg-gray-800 rounded-xl animate-pulse"></div>
                  <div className="h-20 bg-gray-100 dark:bg-gray-800 rounded-xl animate-pulse"></div>
                </div>
              ) : activeOffersList.length === 0 ? (
                <p className="text-xs text-gray-400 dark:text-gray-550 text-center py-6">لا يوجد عروض ترويجية نشطة حالياً.</p>
              ) : (
                <div className="space-y-4">
                  {activeOffersList.map((offer) => (
                    <div 
                      key={offer.id}
                      className={`p-4 rounded-xl border relative overflow-hidden transition ${
                        offer.pinned 
                          ? 'bg-brand-50/50 border-brand-200 dark:bg-brand-950/20 dark:border-brand-900/60 shadow-md ring-1 ring-brand-400/20' 
                          : 'bg-gray-50 border-gray-100 dark:bg-gray-900/50 dark:border-gray-800/60'
                      }`}
                    >
                      {/* Pinned star badge */}
                      {offer.pinned && (
                        <span className="absolute top-0 left-0 bg-brand-500 text-white text-[8px] font-extrabold px-2 py-0.5 rounded-br-lg shadow-sm">
                          مثبت
                        </span>
                      )}

                      <h3 className="text-sm font-bold text-gray-900 dark:text-white pr-2 mt-1">
                        {offer.title}
                      </h3>
                      
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-2 leading-relaxed">
                        {offer.description}
                      </p>

                      {offer.discount_type && offer.discount_type !== 'none' && (
                        <div className="mt-2.5 inline-flex items-center gap-1 bg-brand-50 dark:bg-brand-950/40 text-brand-700 dark:text-brand-400 text-[10px] px-2 py-0.5 rounded border border-brand-100 dark:border-brand-900 font-bold">
                          <span>خصم {offer.discount_value} {offer.discount_type === 'percentage' ? '%' : 'ريال'}</span>
                          <span>على ({offer.apply_to_category})</span>
                        </div>
                      )}

                      {offer.is_permanent ? (
                        <div className="mt-3 flex items-center justify-between text-[9px] font-semibold text-gray-400 dark:text-gray-550 border-t border-gray-100 dark:border-gray-800 pt-2">
                          <span className="px-1.5 py-0.5 bg-brand-100 dark:bg-brand-950/40 text-brand-700 dark:text-brand-400 text-[8px] font-black rounded">عروض مستمرة دائمًا</span>
                        </div>
                      ) : offer.start_date && offer.end_date ? (
                        <div className="mt-3 flex items-center justify-between text-[9px] font-semibold text-gray-400 dark:text-gray-550 border-t border-gray-100 dark:border-gray-800 pt-2">
                          <span>يبدأ: {offer.start_date}</span>
                          <span>ينتهي: {offer.end_date}</span>
                        </div>
                      ) : null}
                    </div>
                  ))}
                </div>
              )}
            </div>



          </div>        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 py-6 mt-16 transition-colors duration-200 no-print">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-xs text-gray-400 dark:text-gray-500">© جميع الحقوق محفوظة لشركة تأجير السيارات 2026</p>
        </div>
      </footer>

      {/* SHOW ALL CIRCULARS MODAL */}
      {showCircularsModal && (
        <div className="fixed inset-0 bg-black/60 z-50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 w-full max-w-2xl rounded-2xl shadow-2xl p-6 md:p-8 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-4 mb-6">
              <div className="flex items-center gap-2">
                <Megaphone className="w-6 h-6 text-brand-500" />
                <h3 className="text-lg font-black text-gray-900 dark:text-white">لوحة التعميمات والقرارات الإدارية</h3>
              </div>
              <button 
                onClick={() => setShowCircularsModal(false)}
                className="p-1.5 hover:bg-gray-150 dark:hover:bg-gray-800 rounded-lg text-gray-500 transition"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>

            <div className="overflow-y-auto flex-1 space-y-4 pr-1">
              {circulars.map((c) => (
                <div 
                  key={c.id} 
                  className="p-5 bg-gray-50 dark:bg-gray-800/40 rounded-2xl border border-gray-100 dark:border-gray-800/60 hover:border-brand-200 dark:hover:border-brand-900/30 transition-all text-right"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                    <h4 className="text-sm font-extrabold text-gray-900 dark:text-white flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-brand-500"></span>
                      {c.title}
                    </h4>
                    <span className="text-[10px] text-gray-400 font-semibold">
                      {new Date(c.created_at).toLocaleString('ar-SA')}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">{c.content}</p>
                </div>
              ))}
            </div>

            <div className="pt-6 border-t border-gray-100 dark:border-gray-800 flex justify-end mt-4">
              <button
                onClick={() => setShowCircularsModal(false)}
                className="px-6 py-2.5 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs font-bold rounded-xl transition"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SHOW SPECIFIC CIRCULAR MODAL */}
      {selectedCircular && (
        <div className="fixed inset-0 bg-black/60 z-50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 w-full max-w-xl rounded-2xl shadow-2xl p-6 md:p-8 animate-scale-up">
            <div className="flex items-center gap-3 border-b border-gray-100 dark:border-gray-800 pb-4 mb-6">
              <Megaphone className="w-6 h-6 text-brand-500 animate-bounce" />
              <div className="text-right">
                <h3 className="text-md font-black text-gray-900 dark:text-white">{selectedCircular.title}</h3>
                <span className="text-[10px] text-gray-400 font-semibold block mt-0.5">
                  تاريخ النشر: {new Date(selectedCircular.created_at).toLocaleString('ar-SA')}
                </span>
              </div>
            </div>

            <div className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed bg-gray-50 dark:bg-gray-800/40 p-5 rounded-2xl border border-gray-100 dark:border-gray-800/60 text-right whitespace-pre-wrap max-h-[50vh] overflow-y-auto font-medium">
              {selectedCircular.content}
            </div>

            <div className="pt-6 border-t border-gray-100 dark:border-gray-800 flex justify-end gap-3 mt-6">
              <button
                onClick={() => {
                  setDismissedCirculars(prev => ({ ...prev, [selectedCircular.id]: true }));
                  setSelectedCircular(null);
                }}
                className="px-5 py-2.5 bg-gray-100 hover:bg-gray-250 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-650 dark:text-gray-300 text-xs font-black rounded-xl transition text-red-600"
              >
                تأكيد القراءة وإخفاء التنبيه
              </button>
              <button
                onClick={() => setSelectedCircular(null)}
                className="px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold rounded-xl transition"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
