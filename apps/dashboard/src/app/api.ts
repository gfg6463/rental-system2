const API_BASE = typeof window !== 'undefined' 
  ? `${window.location.protocol}//${window.location.hostname}:8000` 
  : 'http://localhost:8000';

export interface Car {
  id: number;
  name: string;
  model: string;
  image: string;
  price_daily: number;
  price_weekly: number;
  price_monthly: number;
  category: string;
  available: boolean;
  visible: boolean;
  extra_km_price?: number;
  allowed_km_daily?: number;
}

export interface Offer {
  id: number;
  title: string;
  description: string;
  start_date: string;
  end_date: string;
  active: boolean;
  pinned: boolean;
  discount_type?: 'none' | 'percentage' | 'value';
  discount_value?: number;
  apply_to_category?: string;
  is_permanent?: boolean;
}

export interface ActivityLog {
  id: number;
  action: string;
  details: string;
  username: string;
  timestamp: string;
}

export interface User {
  username: string;
  role: 'admin' | 'employee';
  permissions?: string[];
}

export interface DeliveryFee {
  id: number;
  from_city: string;
  to_city: string;
  price: number;
}

export interface Circular {
  id: number;
  title: string;
  content: string;
  created_at: string;
  active: boolean;
  end_date?: string;
  is_permanent?: boolean;
}

export function getHeaders() {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }
  return headers;
}

export async function login(username: string, password: string): Promise<{ token: string; user: User }> {
  const res = await fetch(`${API_BASE}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });
  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.error || 'فشل تسجيل الدخول');
  }
  return res.json();
}

export async function fetchCars(): Promise<Car[]> {
  const res = await fetch(`${API_BASE}/api/cars`, {
    headers: getHeaders(),
    cache: 'no-store'
  });
  if (!res.ok) throw new Error('فشل جلب قائمة السيارات');
  return res.json();
}

export async function fetchOffers(): Promise<Offer[]> {
  const res = await fetch(`${API_BASE}/api/offers`, {
    headers: getHeaders(),
    cache: 'no-store'
  });
  if (!res.ok) throw new Error('فشل جلب العروض');
  return res.json();
}

export async function fetchLogs(): Promise<ActivityLog[]> {
  const res = await fetch(`${API_BASE}/api/logs`, {
    headers: getHeaders(),
    cache: 'no-store'
  });
  if (!res.ok) throw new Error('فشل جلب سجل العمليات');
  return res.json();
}

export async function fetchLastUpdate(): Promise<string> {
  const res = await fetch(`${API_BASE}/api/last-update`, {
    headers: getHeaders(),
    cache: 'no-store'
  });
  if (!res.ok) throw new Error('فشل جلب تاريخ التحديث');
  const data = await res.json();
  return data.lastUpdate;
}

export async function triggerManualUpdate(): Promise<string> {
  const res = await fetch(`${API_BASE}/api/last-update`, {
    method: 'POST',
    headers: getHeaders(),
  });
  if (!res.ok) throw new Error('فشل تحديث تاريخ التحديث');
  const data = await res.json();
  return data.lastUpdate;
}

export async function createCar(car: Omit<Car, 'id'>): Promise<Car> {
  const res = await fetch(`${API_BASE}/api/cars`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(car),
  });
  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.error || 'فشل إضافة السيارة');
  }
  return res.json();
}

export async function updateCar(id: number, car: Omit<Car, 'id'>): Promise<Car> {
  const res = await fetch(`${API_BASE}/api/cars/${id}`, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify(car),
  });
  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.error || 'فشل تعديل السيارة');
  }
  return res.json();
}

export async function deleteCar(id: number): Promise<void> {
  const res = await fetch(`${API_BASE}/api/cars/${id}`, {
    method: 'DELETE',
    headers: getHeaders(),
  });
  if (!res.ok) throw new Error('فشل حذف السيارة');
}

export async function createOffer(offer: Omit<Offer, 'id' | 'pinned'>): Promise<Offer> {
  const res = await fetch(`${API_BASE}/api/offers`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ ...offer, pinned: false }),
  });
  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.error || 'فشل إضافة العرض');
  }
  return res.json();
}

export async function updateOffer(id: number, offer: Omit<Offer, 'id' | 'pinned'>): Promise<Offer> {
  const res = await fetch(`${API_BASE}/api/offers/${id}`, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify(offer),
  });
  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.error || 'فشل تعديل العرض');
  }
  return res.json();
}

export async function deleteOffer(id: number): Promise<void> {
  const res = await fetch(`${API_BASE}/api/offers/${id}`, {
    method: 'DELETE',
    headers: getHeaders(),
  });
  if (!res.ok) throw new Error('فشل حذف العرض');
}

export async function togglePinOffer(id: number, pinned: boolean): Promise<Offer> {
  const res = await fetch(`${API_BASE}/api/offers/${id}/pin`, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify({ pinned }),
  });
  if (!res.ok) throw new Error('فشل تعديل تثبيت العرض');
  return res.json();
}

export async function uploadImage(file: File): Promise<string> {
  const formData = new FormData();
  formData.append('image', file);
  
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const headers: Record<string, string> = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}/api/upload`, {
    method: 'POST',
    headers,
    body: formData,
  });
  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.error || 'فشل رفع الصورة');
  }
  const data = await res.json();
  return data.url;
}

export async function fetchDeliveryFees(): Promise<DeliveryFee[]> {
  const res = await fetch(`${API_BASE}/api/delivery-fees`, {
    headers: getHeaders(),
    cache: 'no-store'
  });
  if (!res.ok) throw new Error('فشل جلب أسعار التوصيل بين المناطق');
  return res.json();
}

export async function createDeliveryFee(fee: Omit<DeliveryFee, 'id'>): Promise<DeliveryFee> {
  const res = await fetch(`${API_BASE}/api/delivery-fees`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(fee),
  });
  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.error || 'فشل إضافة مسار التوصيل');
  }
  return res.json();
}

export async function updateDeliveryFee(id: number, fee: Omit<DeliveryFee, 'id'>): Promise<DeliveryFee> {
  const res = await fetch(`${API_BASE}/api/delivery-fees/${id}`, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify(fee),
  });
  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.error || 'فشل تعديل مسار التوصيل');
  }
  return res.json();
}

export async function deleteDeliveryFee(id: number): Promise<void> {
  const res = await fetch(`${API_BASE}/api/delivery-fees/${id}`, {
    method: 'DELETE',
    headers: getHeaders(),
  });
  if (!res.ok) throw new Error('فشل حذف مسار التوصيل');
}

export async function fetchCirculars(): Promise<Circular[]> {
  const res = await fetch(`${API_BASE}/api/circulars`, {
    headers: getHeaders(),
    cache: 'no-store'
  });
  if (!res.ok) throw new Error('فشل جلب التعميمات');
  return res.json();
}

export async function createCircular(circular: { title: string; content: string; end_date?: string; is_permanent?: boolean }): Promise<Circular> {
  const res = await fetch(`${API_BASE}/api/circulars`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(circular),
  });
  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.error || 'فشل إضافة التعميم');
  }
  return res.json();
}

export async function deleteCircular(id: number): Promise<void> {
  const res = await fetch(`${API_BASE}/api/circulars/${id}`, {
    method: 'DELETE',
    headers: getHeaders(),
  });
  if (!res.ok) throw new Error('فشل حذف التعميم');
}

export interface UserManage {
  username: string;
  role: 'admin' | 'employee';
  permissions: string[];
  password?: string;
}

export async function fetchUsers(): Promise<UserManage[]> {
  const res = await fetch(`${API_BASE}/api/users`, {
    headers: getHeaders(),
    cache: 'no-store'
  });
  if (!res.ok) throw new Error('فشل جلب قائمة المستخدمين');
  return res.json();
}

export async function createUser(user: UserManage): Promise<UserManage> {
  const res = await fetch(`${API_BASE}/api/users`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(user)
  });
  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.error || 'فشل إضافة المستخدم');
  }
  return res.json();
}

export async function updateUser(username: string, payload: { role?: string; permissions?: string[]; password?: string }): Promise<UserManage> {
  const res = await fetch(`${API_BASE}/api/users/${username}`, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify(payload)
  });
  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.error || 'فشل تعديل المستخدم');
  }
  return res.json();
}

export async function deleteUser(username: string): Promise<{ message: string }> {
  const res = await fetch(`${API_BASE}/api/users/${username}`, {
    method: 'DELETE',
    headers: getHeaders()
  });
  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.error || 'فشل حذف المستخدم');
  }
  return res.json();
}
