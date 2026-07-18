const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

const usePostgres = process.env.DATABASE_URL && (process.env.DATABASE_URL.startsWith('postgres://') || process.env.DATABASE_URL.startsWith('postgresql://'));
let pool = null;

if (usePostgres) {
  console.log('Database Mode: PostgreSQL');
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_URL.includes('supabase') ? { rejectUnauthorized: false } : false
  });
} else {
  console.log('Database Mode: Local JSON File');
}

// Local JSON file path
const jsonDbPath = path.join(__dirname, 'data.json');

// Default initial database content
const initialData = {
  cars: [
    {
      id: 1,
      name: "لكزس 600 إل إكس",
      model: "2025",
      image: "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=600&auto=format&fit=crop&q=60",
      price_daily: 5000,
      price_weekly: 30000,
      price_monthly: 78750,
      category: "SUV",
      available: true,
      visible: true,
      extra_km_price: 4.0,
      allowed_km_daily: 250
    },
    {
      id: 2,
      name: "لكزس 600 إل إكس",
      model: "2024",
      image: "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=600&auto=format&fit=crop&q=60",
      price_daily: 4000,
      price_weekly: 24000,
      price_monthly: 60000,
      category: "SUV",
      available: true,
      visible: true,
      extra_km_price: 4.0,
      allowed_km_daily: 250
    },
    {
      id: 3,
      name: "مرسيدس S450",
      model: "2025",
      image: "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=600&auto=format&fit=crop&q=60",
      price_daily: 4000,
      price_weekly: 24000,
      price_monthly: 54000,
      category: "سيدان",
      available: true,
      visible: true,
      extra_km_price: 4.0,
      allowed_km_daily: 250
    },
    {
      id: 4,
      name: "BMW 735",
      model: "2025",
      image: "https://images.unsplash.com/photo-1555215695-3004980ad54e?w=600&auto=format&fit=crop&q=60",
      price_daily: 3500,
      price_weekly: 21000,
      price_monthly: 48000,
      category: "سيدان",
      available: true,
      visible: true,
      extra_km_price: 4.0,
      allowed_km_daily: 250
    },
    {
      id: 5,
      name: "BMW 735",
      model: "2024",
      image: "https://images.unsplash.com/photo-1555215695-3004980ad54e?w=600&auto=format&fit=crop&q=60",
      price_daily: 3000,
      price_weekly: 18000,
      price_monthly: 45000,
      category: "سيدان",
      available: true,
      visible: true,
      extra_km_price: 4.0,
      allowed_km_daily: 250
    },
    {
      id: 6,
      name: "جينسس G80",
      model: "2026",
      image: "https://images.unsplash.com/photo-1617814076367-b759c7d7e738?w=600&auto=format&fit=crop&q=60",
      price_daily: 1200,
      price_weekly: 7200,
      price_monthly: 19500,
      category: "سيدان",
      available: true,
      visible: true,
      extra_km_price: 1.5,
      allowed_km_daily: 250
    },
    {
      id: 7,
      name: "جينسس G70",
      model: "2026",
      image: "https://images.unsplash.com/photo-1617814076367-b759c7d7e738?w=600&auto=format&fit=crop&q=60",
      price_daily: 1000,
      price_weekly: 6000,
      price_monthly: 18000,
      category: "سيدان",
      available: true,
      visible: true,
      extra_km_price: 1.5,
      allowed_km_daily: 250
    },
    {
      id: 8,
      name: "فورد تورس",
      model: "2026",
      image: "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=600&auto=format&fit=crop&q=60",
      price_daily: 700,
      price_weekly: 4200,
      price_monthly: 15000,
      category: "سيدان",
      available: true,
      visible: true,
      extra_km_price: 0.8,
      allowed_km_daily: 250
    },
    {
      id: 9,
      name: "فورد تورس",
      model: "2024",
      image: "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=600&auto=format&fit=crop&q=60",
      price_daily: 550,
      price_weekly: 3300,
      price_monthly: 10500,
      category: "سيدان",
      available: true,
      visible: true,
      extra_km_price: 0.8,
      allowed_km_daily: 250
    },
    {
      id: 10,
      name: "تويوتا كامري",
      model: "2025",
      image: "https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=600&auto=format&fit=crop&q=60",
      price_daily: 500,
      price_weekly: 3000,
      price_monthly: 9000,
      category: "سيدان",
      available: true,
      visible: true,
      extra_km_price: 0.8,
      allowed_km_daily: 250
    },
    {
      id: 11,
      name: "لاند كروزر GXR3",
      model: "2025",
      image: "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=600&auto=format&fit=crop&q=60",
      price_daily: 2000,
      price_weekly: 12000,
      price_monthly: 30000,
      category: "SUV",
      available: true,
      visible: true,
      extra_km_price: 2.0,
      allowed_km_daily: 250
    },
    {
      id: 12,
      name: "لاند كروزر GXR",
      model: "2024",
      image: "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=600&auto=format&fit=crop&q=60",
      price_daily: 1600,
      price_weekly: 9600,
      price_monthly: 24000,
      category: "SUV",
      available: true,
      visible: true,
      extra_km_price: 2.0,
      allowed_km_daily: 250
    },
    {
      id: 13,
      name: "باترول بلاتينيوم",
      model: "2026",
      image: "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=600&auto=format&fit=crop&q=60",
      price_daily: 3200,
      price_weekly: 19200,
      price_monthly: 36000,
      category: "SUV",
      available: true,
      visible: true,
      extra_km_price: 2.0,
      allowed_km_daily: 250
    },
    {
      id: 14,
      name: "باترول بلاتينيوم",
      model: "2025",
      image: "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=600&auto=format&fit=crop&q=60",
      price_daily: 2800,
      price_weekly: 16800,
      price_monthly: 33000,
      category: "SUV",
      available: true,
      visible: true,
      extra_km_price: 2.0,
      allowed_km_daily: 250
    },
    {
      id: 15,
      name: "شيفرولية تاهو",
      model: "2025",
      image: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=600&auto=format&fit=crop&q=60",
      price_daily: 1700,
      price_weekly: 10200,
      price_monthly: 24000,
      category: "SUV",
      available: true,
      visible: true,
      extra_km_price: 2.0,
      allowed_km_daily: 250
    },
    {
      id: 16,
      name: "شيفرولية تاهو",
      model: "2024",
      image: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=600&auto=format&fit=crop&q=60",
      price_daily: 1200,
      price_weekly: 7200,
      price_monthly: 19500,
      category: "SUV",
      available: true,
      visible: true,
      extra_km_price: 2.0,
      allowed_km_daily: 250
    },
    {
      id: 17,
      name: "شيفرولية سوبربان",
      model: "2024",
      image: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=600&auto=format&fit=crop&q=60",
      price_daily: 1300,
      price_weekly: 7800,
      price_monthly: 21000,
      category: "SUV",
      available: true,
      visible: true,
      extra_km_price: 2.0,
      allowed_km_daily: 250
    },
    {
      id: 18,
      name: "تويوتا فورتشنر",
      model: "2024",
      image: "https://images.unsplash.com/photo-1606016159991-dfe4f2746ad5?w=600&auto=format&fit=crop&q=60",
      price_daily: 650,
      price_weekly: 3900,
      price_monthly: 12000,
      category: "SUV",
      available: true,
      visible: true,
      extra_km_price: 0.8,
      allowed_km_daily: 250
    },
    {
      id: 19,
      name: "هيونداي كونا",
      model: "2025",
      image: "https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=600&auto=format&fit=crop&q=60",
      price_daily: 300,
      price_weekly: 1800,
      price_monthly: 7500,
      category: "SUV",
      available: true,
      visible: true,
      extra_km_price: 0.6,
      allowed_km_daily: 250
    },
    {
      id: 20,
      name: "هيونداي كريتا",
      model: "2026",
      image: "https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=600&auto=format&fit=crop&q=60",
      price_daily: 350,
      price_weekly: 2100,
      price_monthly: 9000,
      category: "SUV",
      available: true,
      visible: true,
      extra_km_price: 0.6,
      allowed_km_daily: 250
    },
    {
      id: 21,
      name: "هيونداي فينيو",
      model: "2025",
      image: "https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=600&auto=format&fit=crop&q=60",
      price_daily: 300,
      price_weekly: 1800,
      price_monthly: 7500,
      category: "SUV",
      available: true,
      visible: true,
      extra_km_price: 0.6,
      allowed_km_daily: 250
    },
    {
      id: 22,
      name: "هيونداي ستار جيزر",
      model: "2025",
      image: "https://images.unsplash.com/photo-1616422285623-13ff0162193c?w=600&auto=format&fit=crop&q=60",
      price_daily: 300,
      price_weekly: 1800,
      price_monthly: 7500,
      category: "فان",
      available: true,
      visible: true,
      extra_km_price: 0.6,
      allowed_km_daily: 250
    },
    {
      id: 23,
      name: "هيونداي ستاريا",
      model: "2026",
      image: "https://images.unsplash.com/photo-1616422285623-13ff0162193c?w=600&auto=format&fit=crop&q=60",
      price_daily: 900,
      price_weekly: 5400,
      price_monthly: 12000,
      category: "فان",
      available: true,
      visible: true,
      extra_km_price: 1.0,
      allowed_km_daily: 250
    },
    {
      id: 24,
      name: "هيونداي ستاريا",
      model: "2024",
      image: "https://images.unsplash.com/photo-1616422285623-13ff0162193c?w=600&auto=format&fit=crop&q=60",
      price_daily: 750,
      price_weekly: 4500,
      price_monthly: 9000,
      category: "فان",
      available: true,
      visible: true,
      extra_km_price: 1.0,
      allowed_km_daily: 250
    },
    {
      id: 25,
      name: "تويوتا هايلكس",
      model: "2024",
      image: "https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?w=600&auto=format&fit=crop&q=60",
      price_daily: 650,
      price_weekly: 3900,
      price_monthly: 15000,
      category: "بيك أب",
      available: true,
      visible: true,
      extra_km_price: 1.0,
      allowed_km_daily: 250
    },
    {
      id: 26,
      name: "تويوتا كورولا",
      model: "2025",
      image: "https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=600&auto=format&fit=crop&q=60",
      price_daily: 280,
      price_weekly: 1680,
      price_monthly: 4500,
      category: "سيدان",
      available: true,
      visible: true,
      extra_km_price: 0.5,
      allowed_km_daily: 250
    },
    {
      id: 27,
      name: "تويوتا يارس",
      model: "2026",
      image: "https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=600&auto=format&fit=crop&q=60",
      price_daily: 260,
      price_weekly: 1560,
      price_monthly: 4200,
      category: "سيدان",
      available: true,
      visible: true,
      extra_km_price: 0.5,
      allowed_km_daily: 250
    },
    {
      id: 28,
      name: "هيونداي النترا",
      model: "2026",
      image: "https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=600&auto=format&fit=crop&q=60",
      price_daily: 300,
      price_weekly: 1800,
      price_monthly: 5400,
      category: "سيدان",
      available: true,
      visible: true,
      extra_km_price: 0.5,
      allowed_km_daily: 250
    },
    {
      id: 29,
      name: "هيونداي أكسنت",
      model: "2026",
      image: "https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=600&auto=format&fit=crop&q=60",
      price_daily: 270,
      price_weekly: 1620,
      price_monthly: 4200,
      category: "سيدان",
      available: true,
      visible: true,
      extra_km_price: 4.0,
      allowed_km_daily: 250
    },
    {
      id: 30,
      name: "هيونداي جراند آي 10",
      model: "2026",
      image: "https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=600&auto=format&fit=crop&q=60",
      price_daily: 190,
      price_weekly: 1140,
      price_monthly: 4050,
      category: "سيدان",
      available: true,
      visible: true,
      extra_km_price: 0.5,
      allowed_km_daily: 250
    },
    {
      id: 31,
      name: "كيا كي 5",
      model: "2025",
      image: "https://images.unsplash.com/photo-1619767886558-efdc259cde1a?w=600&auto=format&fit=crop&q=60",
      price_daily: 350,
      price_weekly: 2100,
      price_monthly: 8100,
      category: "سيدان",
      available: true,
      visible: true,
      extra_km_price: 0.5,
      allowed_km_daily: 250
    },
    {
      id: 32,
      name: "كيا كي 4",
      model: "2026",
      image: "https://images.unsplash.com/photo-1619767886558-efdc259cde1a?w=600&auto=format&fit=crop&q=60",
      price_daily: 300,
      price_weekly: 1800,
      price_monthly: 6900,
      category: "سيدان",
      available: true,
      visible: true,
      extra_km_price: 0.5,
      allowed_km_daily: 250
    },
    {
      id: 33,
      name: "كيا كي 3",
      model: "2026",
      image: "https://images.unsplash.com/photo-1619767886558-efdc259cde1a?w=600&auto=format&fit=crop&q=60",
      price_daily: 260,
      price_weekly: 1560,
      price_monthly: 4500,
      category: "سيدان",
      available: true,
      visible: true,
      extra_km_price: 0.5,
      allowed_km_daily: 250
    },
    {
      id: 34,
      name: "كيا بيجاس",
      model: "2026",
      image: "https://images.unsplash.com/photo-1619767886558-efdc259cde1a?w=600&auto=format&fit=crop&q=60",
      price_daily: 220,
      price_weekly: 1320,
      price_monthly: 4050,
      category: "سيدان",
      available: true,
      visible: true,
      extra_km_price: 0.5,
      allowed_km_daily: 250
    },
    {
      id: 35,
      name: "سوزوكي ديزاير",
      model: "2026",
      image: "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=600&auto=format&fit=crop&q=60",
      price_daily: 190,
      price_weekly: 1140,
      price_monthly: 3900,
      category: "سيدان",
      available: true,
      visible: true,
      extra_km_price: 0.5,
      allowed_km_daily: 250
    },
    {
      id: 36,
      name: "سوزوكي بالينو",
      model: "2026",
      image: "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=600&auto=format&fit=crop&q=60",
      price_daily: 200,
      price_weekly: 1200,
      price_monthly: 4050,
      category: "سيدان",
      available: true,
      visible: true,
      extra_km_price: 0.5,
      allowed_km_daily: 250
    }
  ],
  offers: [
    {
      id: 1,
      title: "🔥 استأجر 30 يوم واحصل على 3000 كم مجاناً",
      description: "عرض الكيلومترات المفتوحة للمدد الطويلة. احصل على 3000 كيلومتر مجاناً عند استئجار أي سيارة لمدة شهر كامل.",
      start_date: "2026-07-01",
      end_date: "2026-08-31",
      active: true,
      pinned: true
    },
    {
      id: 2,
      title: "🎁 خصم 15٪ لمدة أسبوع",
      description: "استمتع بخصم خاص 15٪ على جميع فئات السيارات السيدان والـ SUV عند الاستئجار الأسبوعي.",
      start_date: "2026-07-05",
      end_date: "2026-07-15",
      active: true,
      pinned: false
    },
    {
      id: 3,
      title: "🚗 ترقية مجانية لفئة أعلى",
      description: "احجز فئة سيدان اقتصادية واحصل على ترقية مجانية لفئة سيدان متوسطة الحجم مجاناً (حسب التوفر).",
      start_date: "2026-07-01",
      end_date: "2026-07-31",
      active: true,
      pinned: false
    }
  ],
  logs: [
    {
      id: 1,
      action: "تهيئة النظام",
      details: "تم تشغيل قاعدة البيانات الافتراضية بنجاح",
      username: "system",
      timestamp: new Date().toISOString()
    }
  ],
  deliveryFees: [
  {
    "id": 1,
    "from_city": "الرياض",
    "to_city": "الدمام",
    "price": 225
  },
  {
    "id": 2,
    "from_city": "الرياض",
    "to_city": "جدة",
    "price": 425
  },
  {
    "id": 3,
    "from_city": "الرياض",
    "to_city": "خميس مشيط",
    "price": 425
  },
  {
    "id": 4,
    "from_city": "الرياض",
    "to_city": "مكة",
    "price": 450
  },
  {
    "id": 5,
    "from_city": "الرياض",
    "to_city": "تبوك",
    "price": 550
  },
  {
    "id": 6,
    "from_city": "الرياض",
    "to_city": "الجوف (سكاكا)",
    "price": 650
  },
  {
    "id": 7,
    "from_city": "الرياض",
    "to_city": "المدينة المنورة",
    "price": 500
  },
  {
    "id": 8,
    "from_city": "الرياض",
    "to_city": "جازان",
    "price": 650
  },
  {
    "id": 9,
    "from_city": "الرياض",
    "to_city": "نجران",
    "price": 600
  },
  {
    "id": 10,
    "from_city": "الرياض",
    "to_city": "القصيم",
    "price": 225
  },
  {
    "id": 11,
    "from_city": "الرياض",
    "to_city": "حائل",
    "price": 425
  },
  {
    "id": 12,
    "from_city": "الرياض",
    "to_city": "الأحساء",
    "price": 200
  },
  {
    "id": 13,
    "from_city": "الدمام",
    "to_city": "الرياض",
    "price": 225
  },
  {
    "id": 14,
    "from_city": "الدمام",
    "to_city": "جدة",
    "price": 550
  },
  {
    "id": 15,
    "from_city": "الدمام",
    "to_city": "خميس مشيط",
    "price": 550
  },
  {
    "id": 16,
    "from_city": "الدمام",
    "to_city": "مكة",
    "price": 575
  },
  {
    "id": 17,
    "from_city": "الدمام",
    "to_city": "تبوك",
    "price": 775
  },
  {
    "id": 18,
    "from_city": "الدمام",
    "to_city": "الجوف (سكاكا)",
    "price": 650
  },
  {
    "id": 19,
    "from_city": "الدمام",
    "to_city": "المدينة المنورة",
    "price": 625
  },
  {
    "id": 20,
    "from_city": "الدمام",
    "to_city": "جازان",
    "price": 800
  },
  {
    "id": 21,
    "from_city": "الدمام",
    "to_city": "نجران",
    "price": 675
  },
  {
    "id": 22,
    "from_city": "الدمام",
    "to_city": "القصيم",
    "price": 425
  },
  {
    "id": 23,
    "from_city": "الدمام",
    "to_city": "حائل",
    "price": 525
  },
  {
    "id": 24,
    "from_city": "الدمام",
    "to_city": "الأحساء",
    "price": 100
  },
  {
    "id": 25,
    "from_city": "جدة",
    "to_city": "الرياض",
    "price": 425
  },
  {
    "id": 26,
    "from_city": "جدة",
    "to_city": "الدمام",
    "price": 550
  },
  {
    "id": 27,
    "from_city": "جدة",
    "to_city": "خميس مشيط",
    "price": 375
  },
  {
    "id": 28,
    "from_city": "جدة",
    "to_city": "مكة",
    "price": 250
  },
  {
    "id": 29,
    "from_city": "جدة",
    "to_city": "تبوك",
    "price": 500
  },
  {
    "id": 30,
    "from_city": "جدة",
    "to_city": "الجوف (سكاكا)",
    "price": 525
  },
  {
    "id": 31,
    "from_city": "جدة",
    "to_city": "المدينة المنورة",
    "price": 300
  },
  {
    "id": 32,
    "from_city": "جدة",
    "to_city": "جازان",
    "price": 425
  },
  {
    "id": 33,
    "from_city": "جدة",
    "to_city": "نجران",
    "price": 525
  },
  {
    "id": 34,
    "from_city": "جدة",
    "to_city": "القصيم",
    "price": 425
  },
  {
    "id": 35,
    "from_city": "جدة",
    "to_city": "حائل",
    "price": 475
  },
  {
    "id": 36,
    "from_city": "جدة",
    "to_city": "الأحساء",
    "price": 500
  },
  {
    "id": 37,
    "from_city": "خميس مشيط",
    "to_city": "الرياض",
    "price": 425
  },
  {
    "id": 38,
    "from_city": "خميس مشيط",
    "to_city": "الدمام",
    "price": 550
  },
  {
    "id": 39,
    "from_city": "خميس مشيط",
    "to_city": "جدة",
    "price": 375
  },
  {
    "id": 40,
    "from_city": "خميس مشيط",
    "to_city": "مكة",
    "price": 440
  },
  {
    "id": 41,
    "from_city": "خميس مشيط",
    "to_city": "تبوك",
    "price": 900
  },
  {
    "id": 42,
    "from_city": "خميس مشيط",
    "to_city": "الجوف (سكاكا)",
    "price": 1125
  },
  {
    "id": 43,
    "from_city": "خميس مشيط",
    "to_city": "المدينة المنورة",
    "price": 690
  },
  {
    "id": 44,
    "from_city": "خميس مشيط",
    "to_city": "جازان",
    "price": 440
  },
  {
    "id": 45,
    "from_city": "خميس مشيط",
    "to_city": "نجران",
    "price": 250
  },
  {
    "id": 46,
    "from_city": "خميس مشيط",
    "to_city": "القصيم",
    "price": 750
  },
  {
    "id": 47,
    "from_city": "خميس مشيط",
    "to_city": "حائل",
    "price": 875
  },
  {
    "id": 48,
    "from_city": "خميس مشيط",
    "to_city": "الأحساء",
    "price": 600
  },
  {
    "id": 49,
    "from_city": "مكة",
    "to_city": "الرياض",
    "price": 450
  },
  {
    "id": 50,
    "from_city": "مكة",
    "to_city": "الدمام",
    "price": 575
  },
  {
    "id": 51,
    "from_city": "مكة",
    "to_city": "جدة",
    "price": 250
  },
  {
    "id": 52,
    "from_city": "مكة",
    "to_city": "خميس مشيط",
    "price": 440
  },
  {
    "id": 53,
    "from_city": "مكة",
    "to_city": "تبوك",
    "price": 535
  },
  {
    "id": 54,
    "from_city": "مكة",
    "to_city": "الجوف (سكاكا)",
    "price": 750
  },
  {
    "id": 55,
    "from_city": "مكة",
    "to_city": "المدينة المنورة",
    "price": 375
  },
  {
    "id": 56,
    "from_city": "مكة",
    "to_city": "جازان",
    "price": 656
  },
  {
    "id": 57,
    "from_city": "مكة",
    "to_city": "نجران",
    "price": 625
  },
  {
    "id": 58,
    "from_city": "مكة",
    "to_city": "القصيم",
    "price": 500
  },
  {
    "id": 59,
    "from_city": "مكة",
    "to_city": "حائل",
    "price": 565
  },
  {
    "id": 60,
    "from_city": "مكة",
    "to_city": "الأحساء",
    "price": 500
  },
  {
    "id": 61,
    "from_city": "تبوك",
    "to_city": "الرياض",
    "price": 550
  },
  {
    "id": 62,
    "from_city": "تبوك",
    "to_city": "الدمام",
    "price": 775
  },
  {
    "id": 63,
    "from_city": "تبوك",
    "to_city": "جدة",
    "price": 500
  },
  {
    "id": 64,
    "from_city": "تبوك",
    "to_city": "خميس مشيط",
    "price": 900
  },
  {
    "id": 65,
    "from_city": "تبوك",
    "to_city": "مكة",
    "price": 535
  },
  {
    "id": 66,
    "from_city": "تبوك",
    "to_city": "الجوف (سكاكا)",
    "price": 425
  },
  {
    "id": 67,
    "from_city": "تبوك",
    "to_city": "المدينة المنورة",
    "price": 525
  },
  {
    "id": 68,
    "from_city": "تبوك",
    "to_city": "جازان",
    "price": 1015
  },
  {
    "id": 69,
    "from_city": "تبوك",
    "to_city": "نجران",
    "price": 1015
  },
  {
    "id": 70,
    "from_city": "تبوك",
    "to_city": "القصيم",
    "price": 570
  },
  {
    "id": 71,
    "from_city": "تبوك",
    "to_city": "حائل",
    "price": 525
  },
  {
    "id": 72,
    "from_city": "تبوك",
    "to_city": "الأحساء",
    "price": 700
  },
  {
    "id": 73,
    "from_city": "الجوف (سكاكا)",
    "to_city": "الرياض",
    "price": 650
  },
  {
    "id": 74,
    "from_city": "الجوف (سكاكا)",
    "to_city": "الدمام",
    "price": 625
  },
  {
    "id": 75,
    "from_city": "الجوف (سكاكا)",
    "to_city": "جدة",
    "price": 525
  },
  {
    "id": 76,
    "from_city": "الجوف (سكاكا)",
    "to_city": "خميس مشيط",
    "price": 1125
  },
  {
    "id": 77,
    "from_city": "الجوف (سكاكا)",
    "to_city": "مكة",
    "price": 750
  },
  {
    "id": 78,
    "from_city": "الجوف (سكاكا)",
    "to_city": "تبوك",
    "price": 425
  },
  {
    "id": 79,
    "from_city": "الجوف (سكاكا)",
    "to_city": "المدينة المنورة",
    "price": 750
  },
  {
    "id": 80,
    "from_city": "الجوف (سكاكا)",
    "to_city": "جازان",
    "price": 1085
  },
  {
    "id": 81,
    "from_city": "الجوف (سكاكا)",
    "to_city": "نجران",
    "price": 1250
  },
  {
    "id": 82,
    "from_city": "الجوف (سكاكا)",
    "to_city": "القصيم",
    "price": 570
  },
  {
    "id": 83,
    "from_city": "الجوف (سكاكا)",
    "to_city": "حائل",
    "price": 285
  },
  {
    "id": 84,
    "from_city": "الجوف (سكاكا)",
    "to_city": "الأحساء",
    "price": 500
  },
  {
    "id": 85,
    "from_city": "المدينة المنورة",
    "to_city": "الرياض",
    "price": 500
  },
  {
    "id": 86,
    "from_city": "المدينة المنورة",
    "to_city": "الدمام",
    "price": 625
  },
  {
    "id": 87,
    "from_city": "المدينة المنورة",
    "to_city": "جدة",
    "price": 300
  },
  {
    "id": 88,
    "from_city": "المدينة المنورة",
    "to_city": "خميس مشيط",
    "price": 690
  },
  {
    "id": 89,
    "from_city": "المدينة المنورة",
    "to_city": "مكة",
    "price": 375
  },
  {
    "id": 90,
    "from_city": "المدينة المنورة",
    "to_city": "تبوك",
    "price": 525
  },
  {
    "id": 91,
    "from_city": "المدينة المنورة",
    "to_city": "الجوف (سكاكا)",
    "price": 750
  },
  {
    "id": 92,
    "from_city": "المدينة المنورة",
    "to_city": "جازان",
    "price": 690
  },
  {
    "id": 93,
    "from_city": "المدينة المنورة",
    "to_city": "نجران",
    "price": 850
  },
  {
    "id": 94,
    "from_city": "المدينة المنورة",
    "to_city": "القصيم",
    "price": 375
  },
  {
    "id": 95,
    "from_city": "المدينة المنورة",
    "to_city": "حائل",
    "price": 250
  },
  {
    "id": 96,
    "from_city": "المدينة المنورة",
    "to_city": "الأحساء",
    "price": 600
  },
  {
    "id": 97,
    "from_city": "جازان",
    "to_city": "الرياض",
    "price": 650
  },
  {
    "id": 98,
    "from_city": "جازان",
    "to_city": "الدمام",
    "price": 800
  },
  {
    "id": 99,
    "from_city": "جازان",
    "to_city": "جدة",
    "price": 425
  },
  {
    "id": 100,
    "from_city": "جازان",
    "to_city": "خميس مشيط",
    "price": 440
  },
  {
    "id": 101,
    "from_city": "جازان",
    "to_city": "مكة",
    "price": 656
  },
  {
    "id": 102,
    "from_city": "جازان",
    "to_city": "تبوك",
    "price": 1015
  },
  {
    "id": 103,
    "from_city": "جازان",
    "to_city": "الجوف (سكاكا)",
    "price": 1085
  },
  {
    "id": 104,
    "from_city": "جازان",
    "to_city": "المدينة المنورة",
    "price": 690
  },
  {
    "id": 105,
    "from_city": "جازان",
    "to_city": "نجران",
    "price": 500
  },
  {
    "id": 106,
    "from_city": "جازان",
    "to_city": "القصيم",
    "price": 960
  },
  {
    "id": 107,
    "from_city": "جازان",
    "to_city": "حائل",
    "price": 875
  },
  {
    "id": 108,
    "from_city": "جازان",
    "to_city": "الأحساء",
    "price": 700
  },
  {
    "id": 109,
    "from_city": "نجران",
    "to_city": "الرياض",
    "price": 600
  },
  {
    "id": 110,
    "from_city": "نجران",
    "to_city": "الدمام",
    "price": 675
  },
  {
    "id": 111,
    "from_city": "نجران",
    "to_city": "جدة",
    "price": 525
  },
  {
    "id": 112,
    "from_city": "نجران",
    "to_city": "خميس مشيط",
    "price": 250
  },
  {
    "id": 113,
    "from_city": "نجران",
    "to_city": "مكة",
    "price": 625
  },
  {
    "id": 114,
    "from_city": "نجران",
    "to_city": "تبوك",
    "price": 1015
  },
  {
    "id": 115,
    "from_city": "نجران",
    "to_city": "الجوف (سكاكا)",
    "price": 1250
  },
  {
    "id": 116,
    "from_city": "نجران",
    "to_city": "المدينة المنورة",
    "price": 850
  },
  {
    "id": 117,
    "from_city": "نجران",
    "to_city": "جازان",
    "price": 550
  },
  {
    "id": 118,
    "from_city": "نجران",
    "to_city": "القصيم",
    "price": 820
  },
  {
    "id": 119,
    "from_city": "نجران",
    "to_city": "حائل",
    "price": 875
  },
  {
    "id": 120,
    "from_city": "نجران",
    "to_city": "الأحساء",
    "price": 700
  },
  {
    "id": 121,
    "from_city": "القصيم",
    "to_city": "الرياض",
    "price": 225
  },
  {
    "id": 122,
    "from_city": "القصيم",
    "to_city": "الدمام",
    "price": 425
  },
  {
    "id": 123,
    "from_city": "القصيم",
    "to_city": "جدة",
    "price": 425
  },
  {
    "id": 124,
    "from_city": "القصيم",
    "to_city": "خميس مشيط",
    "price": 750
  },
  {
    "id": 125,
    "from_city": "القصيم",
    "to_city": "مكة",
    "price": 500
  },
  {
    "id": 126,
    "from_city": "القصيم",
    "to_city": "تبوك",
    "price": 570
  },
  {
    "id": 127,
    "from_city": "القصيم",
    "to_city": "الجوف (سكاكا)",
    "price": 570
  },
  {
    "id": 128,
    "from_city": "القصيم",
    "to_city": "المدينة المنورة",
    "price": 375
  },
  {
    "id": 129,
    "from_city": "القصيم",
    "to_city": "جازان",
    "price": 960
  },
  {
    "id": 130,
    "from_city": "القصيم",
    "to_city": "نجران",
    "price": 820
  },
  {
    "id": 131,
    "from_city": "القصيم",
    "to_city": "حائل",
    "price": 220
  },
  {
    "id": 132,
    "from_city": "القصيم",
    "to_city": "الأحساء",
    "price": 400
  },
  {
    "id": 133,
    "from_city": "حائل",
    "to_city": "الرياض",
    "price": 425
  },
  {
    "id": 134,
    "from_city": "حائل",
    "to_city": "الدمام",
    "price": 525
  },
  {
    "id": 135,
    "from_city": "حائل",
    "to_city": "جدة",
    "price": 475
  },
  {
    "id": 136,
    "from_city": "حائل",
    "to_city": "خميس مشيط",
    "price": 875
  },
  {
    "id": 137,
    "from_city": "حائل",
    "to_city": "مكة",
    "price": 565
  },
  {
    "id": 138,
    "from_city": "حائل",
    "to_city": "تبوك",
    "price": 525
  },
  {
    "id": 139,
    "from_city": "حائل",
    "to_city": "الجوف (سكاكا)",
    "price": 285
  },
  {
    "id": 140,
    "from_city": "حائل",
    "to_city": "المدينة المنورة",
    "price": 250
  },
  {
    "id": 141,
    "from_city": "حائل",
    "to_city": "جازان",
    "price": 875
  },
  {
    "id": 142,
    "from_city": "حائل",
    "to_city": "نجران",
    "price": 875
  },
  {
    "id": 143,
    "from_city": "حائل",
    "to_city": "القصيم",
    "price": 220
  },
  {
    "id": 144,
    "from_city": "حائل",
    "to_city": "الأحساء",
    "price": 100
  },
  {
    "id": 145,
    "from_city": "الأحساء",
    "to_city": "الرياض",
    "price": 225
  },
  {
    "id": 146,
    "from_city": "الأحساء",
    "to_city": "الدمام",
    "price": 100
  },
  {
    "id": 147,
    "from_city": "الأحساء",
    "to_city": "جدة",
    "price": 550
  },
  {
    "id": 148,
    "from_city": "الأحساء",
    "to_city": "خميس مشيط",
    "price": 600
  },
  {
    "id": 149,
    "from_city": "الأحساء",
    "to_city": "مكة",
    "price": 500
  },
  {
    "id": 150,
    "from_city": "الأحساء",
    "to_city": "تبوك",
    "price": 700
  },
  {
    "id": 151,
    "from_city": "الأحساء",
    "to_city": "الجوف (سكاكا)",
    "price": 600
  },
  {
    "id": 152,
    "from_city": "الأحساء",
    "to_city": "المدينة المنورة",
    "price": 600
  },
  {
    "id": 153,
    "from_city": "الأحساء",
    "to_city": "جازان",
    "price": 700
  },
  {
    "id": 154,
    "from_city": "الأحساء",
    "to_city": "نجران",
    "price": 700
  },
  {
    "id": 155,
    "from_city": "الأحساء",
    "to_city": "القصيم",
    "price": 400
  },
  {
    "id": 156,
    "from_city": "الأحساء",
    "to_city": "حائل",
    "price": 400
  }
],
  circulars: [],
  lastUpdate: new Date().toISOString()
};

// Helper function to read from JSON file
function readJsonDb() {
  try {
    if (!fs.existsSync(jsonDbPath)) {
      fs.writeFileSync(jsonDbPath, JSON.stringify(initialData, null, 2), 'utf8');
      return initialData;
    }
    const content = fs.readFileSync(jsonDbPath, 'utf8');
    return JSON.parse(content);
  } catch (err) {
    console.error('Error reading JSON DB, using defaults:', err);
    return initialData;
  }
}

// Helper function to write to JSON file
function writeJsonDb(data) {
  try {
    fs.writeFileSync(jsonDbPath, JSON.stringify(data, null, 2), 'utf8');
    return true;
  } catch (err) {
    console.error('Error writing JSON DB:', err);
    return false;
  }
}

// Initialize tables if using Postgres
async function initDb() {
  if (usePostgres) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      
      // Cars Table
      await client.query(`
        CREATE TABLE IF NOT EXISTS cars (
          id SERIAL PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          model VARCHAR(50) NOT NULL,
          image TEXT,
          price_daily INT NOT NULL,
          price_weekly INT NOT NULL,
          price_monthly INT NOT NULL,
          category VARCHAR(50) NOT NULL,
          available BOOLEAN DEFAULT TRUE,
          visible BOOLEAN DEFAULT TRUE,
          extra_km_price NUMERIC DEFAULT 0,
          allowed_km_daily INT DEFAULT 250
        )
      `);
      // Add columns if they do not exist
      await client.query(`
        ALTER TABLE cars ADD COLUMN IF NOT EXISTS extra_km_price NUMERIC DEFAULT 0;
        ALTER TABLE cars ADD COLUMN IF NOT EXISTS allowed_km_daily INT DEFAULT 250;
      `);

      // Offers Table
      await client.query(`
        CREATE TABLE IF NOT EXISTS offers (
          id SERIAL PRIMARY KEY,
          title VARCHAR(255) NOT NULL,
          description TEXT,
          start_date VARCHAR(50) NOT NULL,
          end_date VARCHAR(50) NOT NULL,
          active BOOLEAN DEFAULT TRUE,
          pinned BOOLEAN DEFAULT FALSE,
          discount_type VARCHAR(20) DEFAULT 'none',
          discount_value NUMERIC DEFAULT 0,
          apply_to_category VARCHAR(100) DEFAULT 'الكل'
        )
      `);
      // Add columns if they do not exist
      await client.query(`
        ALTER TABLE offers ADD COLUMN IF NOT EXISTS discount_type VARCHAR(20) DEFAULT 'none';
        ALTER TABLE offers ADD COLUMN IF NOT EXISTS discount_value NUMERIC DEFAULT 0;
        ALTER TABLE offers ADD COLUMN IF NOT EXISTS apply_to_category VARCHAR(100) DEFAULT 'الكل';
      `);

      // Logs Table
      await client.query(`
        CREATE TABLE IF NOT EXISTS activity_logs (
          id SERIAL PRIMARY KEY,
          action VARCHAR(100) NOT NULL,
          details TEXT,
          username VARCHAR(100) NOT NULL,
          timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Metadata Table for Last Update
      await client.query(`
        CREATE TABLE IF NOT EXISTS meta (
          key VARCHAR(50) PRIMARY KEY,
          value VARCHAR(100)
        )
      `);

      // Delivery Fees Table
      await client.query(`
        CREATE TABLE IF NOT EXISTS delivery_fees (
          id SERIAL PRIMARY KEY,
          from_city VARCHAR(100) NOT NULL,
          to_city VARCHAR(100) NOT NULL,
          price INT NOT NULL,
          UNIQUE(from_city, to_city)
        )
      `);

      // Circulars Table
      await client.query(`
        CREATE TABLE IF NOT EXISTS circulars (
          id SERIAL PRIMARY KEY,
          title VARCHAR(255) NOT NULL,
          content TEXT NOT NULL,
          created_at VARCHAR(100) NOT NULL,
          active BOOLEAN DEFAULT TRUE
        )
      `);

      // Seed initial cars if empty
      const carCountRes = await client.query('SELECT COUNT(*) FROM cars');
      if (parseInt(carCountRes.rows[0].count) === 0) {
        for (const car of initialData.cars) {
          await client.query(
            `INSERT INTO cars (name, model, image, price_daily, price_weekly, price_monthly, category, available, visible, extra_km_price, allowed_km_daily) 
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
            [car.name, car.model, car.image, car.price_daily, car.price_weekly, car.price_monthly, car.category, car.available, car.visible, car.extra_km_price || 0, car.allowed_km_daily || 250]
          );
        }
      }

      // Seed initial offers if empty
      const offerCountRes = await client.query('SELECT COUNT(*) FROM offers');
      if (parseInt(offerCountRes.rows[0].count) === 0) {
        for (const offer of initialData.offers) {
          await client.query(
            `INSERT INTO offers (title, description, start_date, end_date, active, pinned, discount_type, discount_value, apply_to_category) 
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
            [
              offer.title,
              offer.description,
              offer.start_date,
              offer.end_date,
              offer.active,
              offer.pinned,
              offer.discount_type || 'none',
              offer.discount_value || 0,
              offer.apply_to_category || 'الكل'
            ]
          );
        }
      }

      // Seed last update key
      await client.query(`
        INSERT INTO meta (key, value) 
        VALUES ('last_update', $1)
        ON CONFLICT (key) DO NOTHING
      `, [new Date().toISOString()]);

      // Seed delivery fees if empty
      const deliveryCountRes = await client.query('SELECT COUNT(*) FROM delivery_fees');
      if (parseInt(deliveryCountRes.rows[0].count) === 0) {
        for (const fee of initialData.deliveryFees) {
          await client.query(
            `INSERT INTO delivery_fees (from_city, to_city, price) 
             VALUES ($1, $2, $3)`,
            [fee.from_city, fee.to_city, fee.price]
          );
        }
      }

      await client.query('COMMIT');
      console.log('PostgreSQL tables initialized and seeded successfully.');
    } catch (err) {
      await client.query('ROLLBACK');
      console.error('Error initializing PostgreSQL tables:', err);
    } finally {
      client.release();
    }
  } else {
    // Make sure JSON file exists and is written
    readJsonDb();
  }
}

// Call initDb
initDb().catch(console.error);

// Exported Functions
module.exports = {
  // Cars
  getCars: async () => {
    if (usePostgres) {
      const res = await pool.query('SELECT * FROM cars ORDER BY id DESC');
      return res.rows;
    } else {
      const db = readJsonDb();
      return db.cars;
    }
  },

  getCarById: async (id) => {
    if (usePostgres) {
      const res = await pool.query('SELECT * FROM cars WHERE id = $1', [id]);
      return res.rows[0] || null;
    } else {
      const db = readJsonDb();
      return db.cars.find(c => c.id === parseInt(id)) || null;
    }
  },

  createCar: async (car) => {
    if (usePostgres) {
      const res = await pool.query(
        `INSERT INTO cars (name, model, image, price_daily, price_weekly, price_monthly, category, available, visible, extra_km_price, allowed_km_daily)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *`,
        [car.name, car.model, car.image, parseInt(car.price_daily), parseInt(car.price_weekly), parseInt(car.price_monthly), car.category, car.available !== false, car.visible !== false, parseFloat(car.extra_km_price || 0), parseInt(car.allowed_km_daily || 250)]
      );
      // Update last_update
      await pool.query("INSERT INTO meta (key, value) VALUES ('last_update', $1) ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value", [new Date().toISOString()]);
      return res.rows[0];
    } else {
      const db = readJsonDb();
      const newId = db.cars.length > 0 ? Math.max(...db.cars.map(c => c.id)) + 1 : 1;
      const newCar = {
        id: newId,
        name: car.name,
        model: car.model,
        image: car.image || '',
        price_daily: parseInt(car.price_daily),
        price_weekly: parseInt(car.price_weekly),
        price_monthly: parseInt(car.price_monthly),
        category: car.category,
        available: car.available !== false,
        visible: car.visible !== false,
        extra_km_price: parseFloat(car.extra_km_price || 0),
        allowed_km_daily: parseInt(car.allowed_km_daily || 250)
      };
      db.cars.push(newCar);
      db.lastUpdate = new Date().toISOString();
      writeJsonDb(db);
      return newCar;
    }
  },

  updateCar: async (id, car) => {
    if (usePostgres) {
      const res = await pool.query(
        `UPDATE cars 
         SET name = $1, model = $2, image = COALESCE($3, image), price_daily = $4, price_weekly = $5, price_monthly = $6, category = $7, available = $8, visible = $9, extra_km_price = $10, allowed_km_daily = $11
         WHERE id = $12 RETURNING *`,
        [car.name, car.model, car.image || null, parseInt(car.price_daily), parseInt(car.price_weekly), parseInt(car.price_monthly), car.category, car.available !== false, car.visible !== false, parseFloat(car.extra_km_price || 0), parseInt(car.allowed_km_daily || 250), id]
      );
      // Update last_update
      await pool.query("INSERT INTO meta (key, value) VALUES ('last_update', $1) ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value", [new Date().toISOString()]);
      return res.rows[0] || null;
    } else {
      const db = readJsonDb();
      const index = db.cars.findIndex(c => c.id === parseInt(id));
      if (index === -1) return null;
      
      db.cars[index] = {
        ...db.cars[index],
        name: car.name,
        model: car.model,
        image: car.image !== undefined ? car.image : db.cars[index].image,
        price_daily: parseInt(car.price_daily),
        price_weekly: parseInt(car.price_weekly),
        price_monthly: parseInt(car.price_monthly),
        category: car.category,
        available: car.available !== false,
        visible: car.visible !== false,
        extra_km_price: parseFloat(car.extra_km_price || 0),
        allowed_km_daily: parseInt(car.allowed_km_daily || 250)
      };
      db.lastUpdate = new Date().toISOString();
      writeJsonDb(db);
      return db.cars[index];
    }
  },

  deleteCar: async (id) => {
    if (usePostgres) {
      const res = await pool.query('DELETE FROM cars WHERE id = $1 RETURNING *', [id]);
      // Update last_update
      await pool.query("INSERT INTO meta (key, value) VALUES ('last_update', $1) ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value", [new Date().toISOString()]);
      return res.rowCount > 0;
    } else {
      const db = readJsonDb();
      const initialLength = db.cars.length;
      db.cars = db.cars.filter(c => c.id !== parseInt(id));
      db.lastUpdate = new Date().toISOString();
      writeJsonDb(db);
      return db.cars.length < initialLength;
    }
  },

  // Offers
  getOffers: async () => {
    if (usePostgres) {
      const res = await pool.query('SELECT * FROM offers ORDER BY pinned DESC, id DESC');
      return res.rows;
    } else {
      const db = readJsonDb();
      // sort by pinned first
      return [...db.offers].sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0));
    }
  },

  createOffer: async (offer) => {
    if (usePostgres) {
      const res = await pool.query(
        `INSERT INTO offers (title, description, start_date, end_date, active, pinned, discount_type, discount_value, apply_to_category)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
        [
          offer.title,
          offer.description,
          offer.start_date || '',
          offer.end_date || '',
          offer.active !== false,
          offer.pinned === true,
          offer.discount_type || 'none',
          parseFloat(offer.discount_value || 0),
          offer.apply_to_category || 'الكل'
        ]
      );
      return res.rows[0];
    } else {
      const db = readJsonDb();
      const newId = db.offers.length > 0 ? Math.max(...db.offers.map(o => o.id)) + 1 : 1;
      const newOffer = {
        id: newId,
        title: offer.title,
        description: offer.description || '',
        start_date: offer.start_date || '',
        end_date: offer.end_date || '',
        active: offer.active !== false,
        pinned: offer.pinned === true,
        discount_type: offer.discount_type || 'none',
        discount_value: parseFloat(offer.discount_value || 0),
        apply_to_category: offer.apply_to_category || 'الكل',
        is_permanent: offer.is_permanent === true
      };
      db.offers.push(newOffer);
      writeJsonDb(db);
      return newOffer;
    }
  },

  updateOffer: async (id, offer) => {
    if (usePostgres) {
      const res = await pool.query(
        `UPDATE offers 
         SET title = $1, description = $2, start_date = $3, end_date = $4, active = $5, discount_type = $6, discount_value = $7, apply_to_category = $8
         WHERE id = $9 RETURNING *`,
        [
          offer.title,
          offer.description,
          offer.start_date || '',
          offer.end_date || '',
          offer.active !== false,
          offer.discount_type || 'none',
          parseFloat(offer.discount_value || 0),
          offer.apply_to_category || 'الكل',
          id
        ]
      );
      return res.rows[0] || null;
    } else {
      const db = readJsonDb();
      const index = db.offers.findIndex(o => o.id === parseInt(id));
      if (index === -1) return null;
      
      db.offers[index] = {
        ...db.offers[index],
        title: offer.title,
        description: offer.description !== undefined ? offer.description : db.offers[index].description,
        start_date: offer.start_date !== undefined ? offer.start_date : db.offers[index].start_date,
        end_date: offer.end_date !== undefined ? offer.end_date : db.offers[index].end_date,
        active: offer.active !== undefined ? offer.active : db.offers[index].active,
        discount_type: offer.discount_type !== undefined ? offer.discount_type : db.offers[index].discount_type,
        discount_value: offer.discount_value !== undefined ? parseFloat(offer.discount_value) : db.offers[index].discount_value,
        apply_to_category: offer.apply_to_category !== undefined ? offer.apply_to_category : db.offers[index].apply_to_category,
        is_permanent: offer.is_permanent !== undefined ? offer.is_permanent === true : db.offers[index].is_permanent
      };
      writeJsonDb(db);
      return db.offers[index];
    }
  },

  deleteOffer: async (id) => {
    if (usePostgres) {
      const res = await pool.query('DELETE FROM offers WHERE id = $1 RETURNING *', [id]);
      return res.rowCount > 0;
    } else {
      const db = readJsonDb();
      const initialLength = db.offers.length;
      db.offers = db.offers.filter(o => o.id !== parseInt(id));
      writeJsonDb(db);
      return db.offers.length < initialLength;
    }
  },

  togglePinOffer: async (id, pinned) => {
    if (usePostgres) {
      const res = await pool.query(
        'UPDATE offers SET pinned = $1 WHERE id = $2 RETURNING *',
        [pinned === true, id]
      );
      return res.rows[0] || null;
    } else {
      const db = readJsonDb();
      const index = db.offers.findIndex(o => o.id === parseInt(id));
      if (index === -1) return null;
      db.offers[index].pinned = pinned === true;
      writeJsonDb(db);
      return db.offers[index];
    }
  },

  // Audit Logs
  getLogs: async () => {
    if (usePostgres) {
      const res = await pool.query('SELECT * FROM activity_logs ORDER BY id DESC LIMIT 200');
      return res.rows;
    } else {
      const db = readJsonDb();
      return [...db.logs].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    }
  },

  addLog: async (action, details, username) => {
    const timestamp = new Date().toISOString();
    if (usePostgres) {
      try {
        await pool.query(
          `INSERT INTO activity_logs (action, details, username, timestamp) 
           VALUES ($1, $2, $3, $4)`,
          [action, details, username, new Date()]
        );
      } catch (err) {
        console.error('Error logging activity to PG:', err);
      }
    } else {
      const db = readJsonDb();
      const newId = db.logs.length > 0 ? Math.max(...db.logs.map(l => l.id)) + 1 : 1;
      db.logs.push({
        id: newId,
        action,
        details,
        username,
        timestamp
      });
      writeJsonDb(db);
    }
  },

  // Metadata
  getLastUpdate: async () => {
    if (usePostgres) {
      const res = await pool.query("SELECT value FROM meta WHERE key = 'last_update'");
      return res.rows[0] ? res.rows[0].value : new Date().toISOString();
    } else {
      const db = readJsonDb();
      return db.lastUpdate || new Date().toISOString();
    }
  },

  updateLastUpdateTimestamp: async () => {
    const ts = new Date().toISOString();
    if (usePostgres) {
      await pool.query("INSERT INTO meta (key, value) VALUES ('last_update', $1) ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value", [ts]);
    } else {
      const db = readJsonDb();
      db.lastUpdate = ts;
      writeJsonDb(db);
    }
    return ts;
  },

  // Delivery Fees
  getDeliveryFees: async () => {
    if (usePostgres) {
      const res = await pool.query('SELECT * FROM delivery_fees ORDER BY id DESC');
      return res.rows;
    } else {
      const db = readJsonDb();
      return db.deliveryFees || [];
    }
  },

  createDeliveryFee: async (fee) => {
    if (usePostgres) {
      const res = await pool.query(
        `INSERT INTO delivery_fees (from_city, to_city, price)
         VALUES ($1, $2, $3) RETURNING *`,
        [fee.from_city, fee.to_city, parseInt(fee.price)]
      );
      return res.rows[0];
    } else {
      const db = readJsonDb();
      if (!db.deliveryFees) db.deliveryFees = [];
      const newId = db.deliveryFees.length > 0 ? Math.max(...db.deliveryFees.map(f => f.id)) + 1 : 1;
      const newFee = {
        id: newId,
        from_city: fee.from_city,
        to_city: fee.to_city,
        price: parseInt(fee.price)
      };
      db.deliveryFees.push(newFee);
      writeJsonDb(db);
      return newFee;
    }
  },

  updateDeliveryFee: async (id, fee) => {
    if (usePostgres) {
      const res = await pool.query(
        `UPDATE delivery_fees 
         SET from_city = $1, to_city = $2, price = $3
         WHERE id = $4 RETURNING *`,
        [fee.from_city, fee.to_city, parseInt(fee.price), id]
      );
      return res.rows[0] || null;
    } else {
      const db = readJsonDb();
      if (!db.deliveryFees) db.deliveryFees = [];
      const index = db.deliveryFees.findIndex(f => f.id === parseInt(id));
      if (index === -1) return null;
      db.deliveryFees[index] = {
        ...db.deliveryFees[index],
        from_city: fee.from_city,
        to_city: fee.to_city,
        price: parseInt(fee.price)
      };
      writeJsonDb(db);
      return db.deliveryFees[index];
    }
  },

  deleteDeliveryFee: async (id) => {
    if (usePostgres) {
      const res = await pool.query('DELETE FROM delivery_fees WHERE id = $1 RETURNING *', [id]);
      return res.rowCount > 0;
    } else {
      const db = readJsonDb();
      if (!db.deliveryFees) db.deliveryFees = [];
      const initialLength = db.deliveryFees.length;
      db.deliveryFees = db.deliveryFees.filter(f => f.id !== parseInt(id));
      writeJsonDb(db);
      return db.deliveryFees.length < initialLength;
    }
  },

  getCirculars: async () => {
    if (usePostgres) {
      const res = await pool.query('SELECT * FROM circulars ORDER BY id DESC');
      return res.rows;
    } else {
      const db = readJsonDb();
      if (!db.circulars) db.circulars = [];
      return db.circulars.sort((a, b) => b.id - a.id);
    }
  },

  createCircular: async (circular) => {
    if (usePostgres) {
      const res = await pool.query(
        `INSERT INTO circulars (title, content, created_at, active)
         VALUES ($1, $2, $3, $4) RETURNING *`,
        [
          circular.title,
          circular.content,
          new Date().toISOString(),
          circular.active !== false
        ]
      );
      return res.rows[0];
    } else {
      const db = readJsonDb();
      if (!db.circulars) db.circulars = [];
      const newId = db.circulars.length > 0 ? Math.max(...db.circulars.map(c => c.id)) + 1 : 1;
      const newCircular = {
        id: newId,
        title: circular.title,
        content: circular.content,
        created_at: new Date().toISOString(),
        active: circular.active !== false,
        end_date: circular.end_date || '',
        is_permanent: circular.is_permanent === true
      };
      db.circulars.push(newCircular);
      writeJsonDb(db);
      return newCircular;
    }
  },

  deleteCircular: async (id) => {
    if (usePostgres) {
      const res = await pool.query('DELETE FROM circulars WHERE id = $1 RETURNING *', [id]);
      return res.rowCount > 0;
    } else {
      const db = readJsonDb();
      if (!db.circulars) db.circulars = [];
      const initialLength = db.circulars.length;
      db.circulars = db.circulars.filter(c => c.id !== parseInt(id));
      writeJsonDb(db);
      return db.circulars.length < initialLength;
    }
  }
};
