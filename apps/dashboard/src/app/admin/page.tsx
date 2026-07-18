'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  fetchCars, 
  fetchOffers, 
  fetchLogs, 
  fetchLastUpdate, 
  createCar, 
  updateCar, 
  deleteCar, 
  createOffer, 
  updateOffer,
  deleteOffer, 
  togglePinOffer, 
  triggerManualUpdate, 
  uploadImage,
  fetchDeliveryFees,
  createDeliveryFee,
  updateDeliveryFee,
  deleteDeliveryFee,
  fetchCirculars,
  createCircular,
  deleteCircular,
  fetchUsers,
  createUser,
  updateUser,
  deleteUser,
  Car, 
  Offer, 
  ActivityLog,
  DeliveryFee,
  Circular,
  UserManage
} from '../api';
import { BrandLogo } from '../BrandLogos';
import { 
  Plus, 
  Edit2, 
  Trash2, 
  Image as ImageIcon, 
  Upload, 
  Pin, 
  Activity, 
  ArrowLeft, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Eye, 
  EyeOff, 
  Check,
  Search,
  RefreshCw,
  FolderOpen,
  Truck,
  MapPin,
  Megaphone,
  Users,
  UserPlus
} from 'lucide-react';

export default function AdminPage() {
  const [cars, setCars] = useState<Car[]>([]);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [lastUpdate, setLastUpdate] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'cars' | 'offers' | 'logs' | 'delivery' | 'circulars' | 'users'>('cars');
  
  // Users state hooks
  const [usersList, setUsersList] = useState<UserManage[]>([]);
  const [showUserModal, setShowUserModal] = useState(false);
  const [userFormMode, setUserFormMode] = useState<'add' | 'edit'>('add');
  const [userForm, setUserForm] = useState({
    username: '',
    password: '',
    role: 'employee' as 'admin' | 'employee',
    permissions: [] as string[]
  });
  const [submittingUser, setSubmittingUser] = useState(false);

  // Circulars States
  const [circulars, setCirculars] = useState<Circular[]>([]);
  const [showCircularModal, setShowCircularModal] = useState(false);
  const [circularTitle, setCircularTitle] = useState('');
  const [circularContent, setCircularContent] = useState('');
  const [circularEndDate, setCircularEndDate] = useState('');
  const [circularIsPermanent, setCircularIsPermanent] = useState(false);
  const [submittingCircular, setSubmittingCircular] = useState(false);

  // Delivery Fees States
  const [deliveryFees, setDeliveryFees] = useState<DeliveryFee[]>([]);
  const [showDeliveryModal, setShowDeliveryModal] = useState(false);
  const [deliveryFormMode, setDeliveryFormMode] = useState<'add' | 'edit'>('add');
  const [deliveryForm, setDeliveryForm] = useState({
    id: null as number | null,
    from_city: '',
    to_city: '',
    price: ''
  });
  const [deliverySearch, setDeliverySearch] = useState('');
  
  // Custom Toast state
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Cars Form States
  const [carForm, setCarForm] = useState({
    id: null as number | null,
    name: '',
    model: '',
    image: '',
    price_daily: '',
    price_weekly: '',
    price_monthly: '',
    category: 'سيدان',
    available: true,
    visible: true,
    extra_km_price: '0',
    allowed_km_daily: '250'
  });
  const [carFormMode, setCarFormMode] = useState<'add' | 'edit'>('add');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [showCarModal, setShowCarModal] = useState(false);

  // Offers Form States
  const [offerForm, setOfferForm] = useState({
    id: null as number | null,
    title: '',
    description: '',
    start_date: '',
    end_date: '',
    active: true,
    discount_type: 'none',
    discount_value: '0',
    apply_to_category: 'الكل',
    is_permanent: false
  });
  const [offerFormMode, setOfferFormMode] = useState<'add' | 'edit'>('add');
  const [showOfferModal, setShowOfferModal] = useState(false);

  // Log filter
  const [logSearch, setLogSearch] = useState('');

  const router = useRouter();

  const [userRole, setUserRole] = useState<string | null>(null);
  const [userPermissions, setUserPermissions] = useState<string[]>([]);

  // Authentication & Security check
  useEffect(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    const rawPerms = localStorage.getItem('permissions');
    const perms = rawPerms ? JSON.parse(rawPerms) : [];
    
    setUserRole(role);
    setUserPermissions(perms);
    
    if (!token || (!['admin', 'employee'].includes(role || '') && perms.length === 0)) {
      // Redirect to login or home if not authenticated
      router.push('/login');
    }
    
    // Default active tab based on permissions
    const allowed = [];
    if (role === 'admin' || perms.includes('cars') || perms.includes('view_only')) allowed.push('cars');
    if (role === 'admin' || perms.includes('offers') || perms.includes('view_only')) allowed.push('offers');
    if (role === 'admin' || perms.includes('delivery') || perms.includes('view_only')) allowed.push('delivery');
    if (role === 'admin' || perms.includes('logs') || perms.includes('view_only')) allowed.push('logs');
    if (role === 'admin' || perms.includes('circulars') || perms.includes('view_only')) allowed.push('circulars');
    if (role === 'admin') allowed.push('users');

    if (allowed.length > 0) {
      if (!allowed.includes(activeTab)) {
        setActiveTab(allowed[0] as any);
      }
    }
  }, [router, activeTab]);

  const loadUsersData = async () => {
    try {
      const data = await fetchUsers();
      setUsersList(data);
    } catch (err) {
      console.error('Failed to load users list:', err);
    }
  };

  const handleUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userForm.username.trim()) {
      showToast('يرجى كتابة اسم المستخدم', 'error');
      return;
    }
    if (userFormMode === 'add' && !userForm.password) {
      showToast('يرجى كتابة كلمة المرور للمستخدم الجديد', 'error');
      return;
    }
    setSubmittingUser(true);
    try {
      if (userFormMode === 'add') {
        await createUser(userForm);
        showToast('تم إضافة المستخدم بنجاح');
      } else {
        await updateUser(userForm.username, {
          role: userForm.role,
          permissions: userForm.permissions,
          password: userForm.password || undefined
        });
        showToast('تم تعديل بيانات المستخدم بنجاح');
      }
      setShowUserModal(false);
      resetUserForm();
      loadUsersData();
    } catch (err: any) {
      showToast(err.message || 'فشل حفظ المستخدم', 'error');
    } finally {
      setSubmittingUser(false);
    }
  };

  const resetUserForm = () => {
    setUserForm({
      username: '',
      password: '',
      role: 'employee',
      permissions: []
    });
    setUserFormMode('add');
  };

  const handleEditUserClick = (u: any) => {
    setUserForm({
      username: u.username,
      password: '',
      role: u.role,
      permissions: u.permissions || []
    });
    setUserFormMode('edit');
    setShowUserModal(true);
  };

  const handleDeleteUserClick = (username: string) => {
    requestDelete('user', username, username);
  };

  const loadAllData = async () => {
    setLoading(true);
    try {
      const role = localStorage.getItem('role');
      const rawPerms = localStorage.getItem('permissions');
      const perms = rawPerms ? JSON.parse(rawPerms) : [];
      const hasLogs = role === 'admin' || perms.includes('logs');

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

      if (hasLogs) {
        try {
          const logsData = await fetchLogs();
          setLogs(logsData);
        } catch (err) {
          console.error('Failed to fetch logs:', err);
        }
      } else {
        setLogs([]);
      }

      if (role === 'admin') {
        await loadUsersData();
      }
    } catch (err) {
      showToast('خطأ أثناء جلب البيانات الإدارية من الخادم', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // --- CAR MANAGEMENT ACTIONS ---
  const handleCarSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      name: carForm.name,
      model: carForm.model,
      image: carForm.image,
      price_daily: parseInt(carForm.price_daily),
      price_weekly: parseInt(carForm.price_weekly),
      price_monthly: parseInt(carForm.price_monthly),
      category: carForm.category,
      available: carForm.available,
      visible: carForm.visible,
      extra_km_price: parseFloat(carForm.extra_km_price || '0'),
      allowed_km_daily: parseInt(carForm.allowed_km_daily || '250')
    };

    if (!payload.name || !payload.model || !payload.price_daily || !payload.price_weekly || !payload.price_monthly) {
      showToast('يرجى ملء كافة الحقول الأساسية', 'error');
      return;
    }

    try {
      if (carFormMode === 'add') {
        await createCar(payload);
        showToast('تمت إضافة السيارة بنجاح');
      } else if (carFormMode === 'edit' && carForm.id) {
        await updateCar(carForm.id, payload);
        showToast('تم تعديل بيانات السيارة بنجاح');
      }
      setShowCarModal(false);
      resetCarForm();
      loadAllData();
    } catch (err: any) {
      showToast(err.message || 'فشل حفظ السيارة', 'error');
    }
  };

  const handleEditCarClick = (car: Car) => {
    setCarForm({
      id: car.id,
      name: car.name,
      model: car.model,
      image: car.image,
      price_daily: String(car.price_daily),
      price_weekly: String(car.price_weekly),
      price_monthly: String(car.price_monthly),
      category: car.category,
      available: car.available,
      visible: car.visible,
      extra_km_price: String(car.extra_km_price || 0),
      allowed_km_daily: String(car.allowed_km_daily || 250)
    });
    setCarFormMode('edit');
    setShowCarModal(true);
  };

  // Delete confirmation modal state
  const [deleteConfirm, setDeleteConfirm] = useState<{ show: boolean, type: 'car' | 'offer' | 'delivery' | 'circular' | 'user', id: number | string | null, title: string }>({
    show: false,
    type: 'car',
    id: null,
    title: ''
  });

  const requestDelete = (type: 'car' | 'offer' | 'delivery' | 'circular' | 'user', id: number | string, title: string) => {
    setDeleteConfirm({
      show: true,
      type,
      id,
      title
    });
  };

  const confirmDeleteAction = async () => {
    const { type, id } = deleteConfirm;
    if (!id) return;
    
    try {
      if (type === 'car') {
        await deleteCar(Number(id));
        showToast('تم حذف السيارة بنجاح');
      } else if (type === 'offer') {
        await deleteOffer(Number(id));
        showToast('تم حذف العرض بنجاح');
      } else if (type === 'delivery') {
        await deleteDeliveryFee(Number(id));
        showToast('تم حذف مسار التوصيل بنجاح');
      } else if (type === 'circular') {
        await deleteCircular(Number(id));
        showToast('تم حذف التعميم بنجاح');
      } else if (type === 'user') {
        await deleteUser(String(id));
        showToast('تم حذف المستخدم بنجاح');
        loadUsersData();
      }
      loadAllData();
    } catch (err) {
      showToast('فشل تنفيذ عملية الحذف', 'error');
    } finally {
      setDeleteConfirm({ show: false, type: 'car', id: null, title: '' });
    }
  };

  const handleAddCircular = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!circularTitle.trim() || !circularContent.trim()) {
      showToast('يرجى ملء جميع الحقول', 'error');
      return;
    }
    setSubmittingCircular(true);
    try {
      await createCircular({ 
        title: circularTitle, 
        content: circularContent,
        end_date: circularIsPermanent ? '' : circularEndDate,
        is_permanent: circularIsPermanent
      });
      showToast('تم إضافة التعميم بنجاح');
      setCircularTitle('');
      setCircularContent('');
      setCircularEndDate('');
      setCircularIsPermanent(false);
      setShowCircularModal(false);
      loadAllData();
    } catch (err) {
      showToast('فشل إضافة التعميم', 'error');
    } finally {
      setSubmittingCircular(false);
    }
  };

  const handleDeleteCar = (id: number) => {
    const car = cars.find(c => c.id === id);
    requestDelete('car', id, car ? `${car.name} (${car.model})` : 'هذه السيارة');
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const url = await uploadImage(file);
      setCarForm(prev => ({ ...prev, image: url }));
      showToast('تم رفع الصورة بنجاح');
    } catch (err: any) {
      showToast(err.message || 'فشل رفع الصورة', 'error');
    } finally {
      setUploadingImage(false);
    }
  };

  const resetCarForm = () => {
    setCarForm({
      id: null,
      name: '',
      model: '',
      image: '',
      price_daily: '',
      price_weekly: '',
      price_monthly: '',
      category: 'سيدان',
      available: true,
      visible: true,
      extra_km_price: '0',
      allowed_km_daily: '250'
    });
    setCarFormMode('add');
  };

  // --- OFFERS ACTIONS ---
  const handleOfferSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!offerForm.title || !offerForm.description) {
      showToast('يرجى ملء عنوان ووصف العرض الترويجي', 'error');
      return;
    }

    try {
      const payload = {
        title: offerForm.title,
        description: offerForm.description,
        start_date: offerForm.start_date,
        end_date: offerForm.end_date,
        active: offerForm.active,
        discount_type: offerForm.discount_type as 'none' | 'percentage' | 'value',
        discount_value: offerForm.discount_type !== 'none' ? parseFloat(offerForm.discount_value || '0') : 0,
        apply_to_category: offerForm.discount_type !== 'none' ? offerForm.apply_to_category : 'الكل'
      };

      if (offerFormMode === 'add') {
        await createOffer(payload);
        showToast('تم إضافة العرض الترويجي بنجاح');
      } else if (offerFormMode === 'edit' && offerForm.id) {
        await updateOffer(offerForm.id, payload);
        showToast('تم تعديل العرض الترويجي بنجاح');
      }

      setShowOfferModal(false);
      resetOfferForm();
      loadAllData();
    } catch (err: any) {
      showToast(err.message || 'فشل حفظ العرض الترويجي', 'error');
    }
  };

  const resetOfferForm = () => {
    setOfferForm({
      id: null,
      title: '',
      description: '',
      start_date: '',
      end_date: '',
      active: true,
      discount_type: 'none',
      discount_value: '0',
      apply_to_category: 'الكل',
      is_permanent: false
    });
    setOfferFormMode('add');
  };

  const handleEditOfferClick = (offer: Offer) => {
    setOfferForm({
      id: offer.id,
      title: offer.title,
      description: offer.description,
      start_date: offer.start_date || '',
      end_date: offer.end_date || '',
      active: offer.active,
      discount_type: offer.discount_type || 'none',
      discount_value: String(offer.discount_value || 0),
      apply_to_category: offer.apply_to_category || 'الكل',
      is_permanent: offer.is_permanent || false
    });
    setOfferFormMode('edit');
    setShowOfferModal(true);
  };

  const handleDeleteOffer = (id: number) => {
    const offer = offers.find(o => o.id === id);
    requestDelete('offer', id, offer ? offer.title : 'هذا العرض الترويجي');
  };

  const handleTogglePinOffer = async (id: number, currentPin: boolean) => {
    try {
      await togglePinOffer(id, !currentPin);
      showToast(!currentPin ? 'تم تثبيت العرض في الأعلى' : 'تم إلغاء تثبيت العرض');
      loadAllData();
    } catch (err) {
      showToast('فشل تعديل حالة التثبيت للعرض', 'error');
    }
  };

  // --- DELIVERY FEES ACTIONS ---
  const handleDeliverySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      from_city: deliveryForm.from_city,
      to_city: deliveryForm.to_city,
      price: parseInt(deliveryForm.price)
    };

    if (!payload.from_city || !payload.to_city || isNaN(payload.price)) {
      showToast('يرجى تعبئة كافة حقول التوصيل', 'error');
      return;
    }

    try {
      if (deliveryFormMode === 'add') {
        await createDeliveryFee(payload);
        showToast('تم إضافة مسار التوصيل بنجاح');
      } else if (deliveryFormMode === 'edit' && deliveryForm.id) {
        await updateDeliveryFee(deliveryForm.id, payload);
        showToast('تم تعديل مسار التوصيل بنجاح');
      }
      setShowDeliveryModal(false);
      resetDeliveryForm();
      loadAllData();
    } catch (err: any) {
      showToast(err.message || 'فشل حفظ مسار التوصيل', 'error');
    }
  };

  const handleEditDeliveryClick = (fee: DeliveryFee) => {
    setDeliveryForm({
      id: fee.id,
      from_city: fee.from_city,
      to_city: fee.to_city,
      price: String(fee.price)
    });
    setDeliveryFormMode('edit');
    setShowDeliveryModal(true);
  };

  const handleDeleteDelivery = (id: number) => {
    const fee = deliveryFees.find(f => f.id === id);
    requestDelete('delivery', id, fee ? `مسار ${fee.from_city} إلى ${fee.to_city}` : 'هذا المسار');
  };

  const resetDeliveryForm = () => {
    setDeliveryForm({
      id: null,
      from_city: '',
      to_city: '',
      price: ''
    });
    setDeliveryFormMode('add');
  };

  // --- SETTINGS ACTIONS ---
  const handleManualTimestampUpdate = async () => {
    try {
      const updatedTime = await triggerManualUpdate();
      setLastUpdate(updatedTime);
      showToast('تم تحديث تاريخ الأسعار في الواجهة بنجاح');
      loadAllData();
    } catch (err) {
      showToast('فشل تحديث تاريخ التحديث للأسعار', 'error');
    }
  };

  // Log filter matching
  const filteredLogs = logs.filter(log => {
    return log.action.toLowerCase().includes(logSearch.toLowerCase()) || 
           log.details.toLowerCase().includes(logSearch.toLowerCase()) || 
           log.username.toLowerCase().includes(logSearch.toLowerCase());
  });

  const categories = ['سيدان', 'اقتصادي', 'عائلي', 'اس يو في', 'دفع رباعي', 'بيك أب', 'فارهة'];
  const isReadOnly = userPermissions.includes('view_only') && userRole !== 'admin';

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors duration-200">
      
      {/* Toast */}
      {toast && (
        <div className={`fixed top-5 left-5 z-50 px-6 py-4 rounded-xl shadow-xl flex items-center gap-3 transition-all duration-300 transform translate-y-0 ${
          toast.type === 'success' ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'
        }`}>
          {toast.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
          <span className="text-sm font-semibold">{toast.message}</span>
        </div>
      )}

      {/* Header */}
      <header className="bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => router.push('/')}
              className="p-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-xl transition duration-150"
            >
              <ArrowLeft className="w-5 h-5 transform rotate-180" />
            </button>
            <img 
              src="/logo.png" 
              alt="شعار شركة حسين" 
              className="w-12 h-12 object-contain"
            />
            <div>
              <h1 className="text-xl font-extrabold text-gray-900 dark:text-white flex items-center gap-2">
                <span>شركة حسين - لوحة المدير</span>
                <span className="bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400 text-xs font-semibold px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-900/50">
                  صلاحيات كاملة
                </span>
              </h1>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">إدارة السيارات، العروض ومراجعة سجلات الأمان والعمليات</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleManualTimestampUpdate}
              className="px-4 py-2 bg-brand-50 hover:bg-brand-100 dark:bg-brand-950/30 dark:hover:bg-brand-900/50 text-brand-700 dark:text-brand-400 text-xs font-bold rounded-xl transition flex items-center gap-1.5 shadow-sm border border-brand-200/50 dark:border-brand-900/30"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>تحديث تاريخ الأسعار يدوياً</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main content layout */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Navigation Tabs */}
        <div className="flex border-b border-gray-200 dark:border-gray-800 mb-8 gap-4">
          {(userRole === 'admin' || userPermissions.includes('cars') || userPermissions.includes('view_only')) && (
            <button
              onClick={() => setActiveTab('cars')}
              className={`pb-4 px-2 font-bold text-sm border-b-2 transition duration-150 ${
                activeTab === 'cars' 
                  ? 'border-brand-500 text-brand-600 dark:text-brand-400' 
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400'
              }`}
            >
              إدارة السيارات ({cars.length})
            </button>
          )}
          {(userRole === 'admin' || userPermissions.includes('offers') || userPermissions.includes('view_only')) && (
            <button
              onClick={() => setActiveTab('offers')}
              className={`pb-4 px-2 font-bold text-sm border-b-2 transition duration-150 ${
                activeTab === 'offers' 
                  ? 'border-brand-500 text-brand-600 dark:text-brand-400' 
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400'
              }`}
            >
              إدارة العروض الترويجية ({offers.length})
            </button>
          )}
          {(userRole === 'admin' || userPermissions.includes('delivery') || userPermissions.includes('view_only')) && (
            <button
              onClick={() => setActiveTab('delivery')}
              className={`pb-4 px-2 font-bold text-sm border-b-2 transition duration-150 ${
                activeTab === 'delivery' 
                  ? 'border-brand-500 text-brand-600 dark:text-brand-400' 
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400'
              }`}
            >
              إدارة أسعار التوصيل ({deliveryFees.length})
            </button>
          )}
          {(userRole === 'admin' || userPermissions.includes('logs') || userPermissions.includes('view_only')) && (
            <button
              onClick={() => setActiveTab('logs')}
              className={`pb-4 px-2 font-bold text-sm border-b-2 transition duration-150 ${
                activeTab === 'logs' 
                  ? 'border-brand-500 text-brand-600 dark:text-brand-400' 
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400'
              }`}
            >
              سجل العمليات الأمني ({logs.length})
            </button>
          )}
          {userRole === 'admin' && (
            <button
              onClick={() => setActiveTab('users')}
              className={`pb-4 px-2 font-bold text-sm border-b-2 transition duration-150 flex items-center gap-1.5 ${
                activeTab === 'users' 
                  ? 'border-brand-500 text-brand-600 dark:text-brand-400' 
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400'
              }`}
            >
              <Users className="w-4 h-4" />
              إدارة الصلاحيات والمشرفين ({usersList.length})
            </button>
          )}
          {(userRole === 'admin' || userPermissions.includes('circulars') || userPermissions.includes('view_only')) && (
            <button
              onClick={() => setActiveTab('circulars')}
              className={`pb-4 px-2 font-bold text-sm border-b-2 transition duration-150 flex items-center gap-1.5 ${
                activeTab === 'circulars' 
                  ? 'border-brand-500 text-brand-600 dark:text-brand-400' 
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400'
              }`}
            >
              <Megaphone className="w-4 h-4" />
              إدارة التعميمات والقرارات ({circulars.length})
            </button>
          )}
        </div>

        {/* Tab 1: Cars Management */}
        {activeTab === 'cars' && (userRole === 'admin' || userPermissions.includes('cars') || userPermissions.includes('view_only')) && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-800 dark:text-white">قائمة السيارات والأسعار</h2>
              {!isReadOnly && (
                <button
                  onClick={() => { resetCarForm(); setShowCarModal(true); }}
                  className="bg-brand-600 hover:bg-brand-700 text-white font-bold py-2.5 px-4 rounded-xl shadow-md transition duration-150 flex items-center gap-1.5 text-sm"
                >
                  <Plus className="w-4 h-4" />
                  <span>إضافة سيارة جديدة</span>
                </button>
              )}
            </div>

            {loading ? (
              <div className="text-center py-20">جاري تحميل قائمة السيارات...</div>
            ) : (
              <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl overflow-hidden shadow-sm">
                <table className="w-full text-right text-sm border-collapse">
                  <thead>
                    <tr className="bg-gray-50 dark:bg-gray-800/40 text-gray-500 dark:text-gray-400 font-bold border-b border-gray-100 dark:border-gray-800">
                      <th className="p-4">السيارة</th>
                      <th className="p-4">الفئة</th>
                      <th className="p-4">اليومي</th>
                      <th className="p-4">الأسبوعي</th>
                      <th className="p-4">الشهري</th>
                      <th className="p-4">التوفر</th>
                      <th className="p-4">الحالة</th>
                      {!isReadOnly && <th className="p-4 text-center">الإجراءات</th>}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                    {cars.map((car) => (
                      <tr key={car.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/20 transition duration-100">
                        <td className="p-4 font-bold flex items-center gap-3">
                          <div className="w-12 h-10 flex items-center justify-center rounded-lg border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-950/40 text-brand-600 dark:text-brand-400 shrink-0">
                            <BrandLogo carName={car.name} className="w-6 h-6" />
                          </div>
                          <div>
                            <div className="text-gray-900 dark:text-white">{car.name}</div>
                            <div className="text-[10px] text-gray-400 mt-0.5">موديل {car.model}</div>
                          </div>
                        </td>
                        <td className="p-4 text-gray-600 dark:text-gray-400">
                          <div className="flex flex-wrap gap-1">
                            {car.category ? car.category.split(',').map(s => s.trim()).map(cat => (
                              <span key={cat} className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-[10px] font-bold px-1.5 py-0.5 rounded border border-gray-200/40 dark:border-gray-700/40">
                                {cat}
                              </span>
                            )) : null}
                          </div>
                        </td>
                        <td className="p-4 font-extrabold text-gray-900 dark:text-white">{car.price_daily} ريال</td>
                        <td className="p-4 font-extrabold text-gray-900 dark:text-white">{car.price_weekly} ريال</td>
                        <td className="p-4 font-extrabold text-gray-900 dark:text-white">{car.price_monthly} ريال</td>
                        <td className="p-4">
                          <span className={`inline-flex items-center gap-1 text-xs font-bold ${car.available ? 'text-emerald-600' : 'text-red-500'}`}>
                            {car.available ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                            <span>{car.available ? 'متوفر' : 'غير متوفر'}</span>
                          </span>
                        </td>
                        <td className="p-4">
                          <span className={`inline-flex items-center gap-1 text-xs font-semibold ${car.visible ? 'text-blue-600' : 'text-gray-400'}`}>
                            {car.visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                            <span>{car.visible ? 'نشط/مرئي' : 'مخفي'}</span>
                          </span>
                        </td>
                        {!isReadOnly && (
                          <td className="p-4 text-center">
                            <div className="flex items-center justify-center gap-2">
                              <button
                                onClick={() => handleEditCarClick(car)}
                                className="p-2 text-brand-600 hover:bg-brand-50 dark:hover:bg-brand-950/20 rounded-lg transition"
                                title="تعديل السيارة"
                              >
                                <Edit2 className="w-4.5 h-4.5" />
                              </button>
                              <button
                                onClick={() => handleDeleteCar(car.id)}
                                className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg transition"
                                title="حذف نهائي"
                              >
                                <Trash2 className="w-4.5 h-4.5" />
                              </button>
                            </div>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Offers Management */}
        {activeTab === 'offers' && (userRole === 'admin' || userPermissions.includes('offers') || userPermissions.includes('view_only')) && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-800 dark:text-white">إدارة العروض الترويجية الحالية</h2>
              {!isReadOnly && (
                <button
                  onClick={() => { resetOfferForm(); setShowOfferModal(true); }}
                  className="bg-brand-600 hover:bg-brand-700 text-white font-bold py-2.5 px-4 rounded-xl shadow-md transition duration-150 flex items-center gap-1.5 text-sm"
                >
                  <Plus className="w-4 h-4" />
                  <span>إضافة عرض جديد</span>
                </button>
              )}
            </div>

            {loading ? (
              <div className="text-center py-20">جاري تحميل قائمة العروض...</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {offers.map((offer) => (
                  <div 
                    key={offer.id}
                    className={`bg-white dark:bg-gray-900 border rounded-2xl p-5 shadow-sm relative flex flex-col justify-between ${
                      offer.pinned ? 'border-brand-300 dark:border-brand-800 shadow-md' : 'border-gray-100 dark:border-gray-800'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          offer.active ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-500'
                        }`}>
                          {offer.active ? 'نشط' : 'غير نشط'}
                        </span>
                        {!isReadOnly && (
                          <button
                            onClick={() => handleTogglePinOffer(offer.id, offer.pinned)}
                            className={`p-1.5 rounded-lg border transition ${
                              offer.pinned 
                                ? 'bg-brand-500 border-brand-500 text-white' 
                                : 'bg-gray-50 border-gray-100 text-gray-400 hover:text-brand-500'
                            }`}
                            title={offer.pinned ? 'إلغاء التثبيت في الأعلى' : 'تثبيت في الأعلى'}
                          >
                            <Pin className="w-4 h-4" />
                          </button>
                        )}
                      </div>

                      <h3 className="text-base font-bold text-gray-900 dark:text-white">{offer.title}</h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 leading-relaxed">{offer.description}</p>
                      
                      {offer.discount_type && offer.discount_type !== 'none' && (
                        <div className="mt-3 inline-flex items-center gap-1 bg-brand-50 dark:bg-brand-950/40 text-brand-700 dark:text-brand-400 text-xs px-2.5 py-1 rounded-lg font-bold border border-brand-100 dark:border-brand-900">
                          <span>تطبيق خصم تلقائي: </span>
                          <span>{offer.discount_value} {offer.discount_type === 'percentage' ? '%' : 'ريال'}</span>
                          <span>على فئة ({offer.apply_to_category})</span>
                        </div>
                      )}
                    </div>

                    <div className="mt-6 pt-4 border-t border-gray-50 dark:border-gray-800 flex items-center justify-between">
                      <div className="text-[10px] font-semibold text-gray-400">
                        {offer.start_date && offer.end_date ? `${offer.start_date} إلى ${offer.end_date}` : 'مفتوح المدة'}
                      </div>
                      {!isReadOnly && (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleEditOfferClick(offer)}
                            className="text-xs font-bold text-brand-600 hover:underline flex items-center gap-1"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                            <span>تعديل</span>
                          </button>
                          <span className="text-gray-300 dark:text-gray-700">|</span>
                          <button
                            onClick={() => handleDeleteOffer(offer.id)}
                            className="text-xs font-bold text-red-600 hover:underline flex items-center gap-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>حذف</span>
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

        {/* Tab 3: Security Logs */}
        {activeTab === 'logs' && (userRole === 'admin' || userPermissions.includes('logs') || userPermissions.includes('view_only')) && (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <h2 className="text-lg font-bold text-gray-800 dark:text-white">سجل العمليات الأمني (Activity Logs)</h2>
              
              {/* Log Search */}
              <div className="relative w-full md:w-80">
                <input
                  type="text"
                  placeholder="ابحث في السجلات (إجراء، مدير، تفاصيل)..."
                  value={logSearch}
                  onChange={(e) => setLogSearch(e.target.value)}
                  className="w-full pl-4 pr-10 py-2.5 bg-white border border-gray-200 dark:bg-gray-900 dark:border-gray-800 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none transition duration-200 text-right text-xs"
                />
                <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-gray-400">
                  <Search className="w-4 h-4" />
                </div>
              </div>
            </div>

            {loading ? (
              <div className="text-center py-20">جاري تحميل سجل العمليات...</div>
            ) : (
              <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl overflow-hidden shadow-sm">
                <div className="max-h-[600px] overflow-y-auto divide-y divide-gray-100 dark:divide-gray-800">
                  {filteredLogs.length === 0 ? (
                    <div className="p-8 text-center text-gray-400">لم يتم العثور على سجلات مطابقة للبحث.</div>
                  ) : (
                    filteredLogs.map((log) => (
                      <div key={log.id} className="p-4 hover:bg-gray-50/50 dark:hover:bg-gray-800/10 transition flex flex-col md:flex-row md:items-center justify-between gap-4 text-right">
                        <div className="flex items-start gap-3">
                          <span className="p-2 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 rounded-xl shrink-0 mt-0.5">
                            <Activity className="w-4 h-4" />
                          </span>
                          <div>
                            <div className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
                              <span>{log.action}</span>
                              <span className="text-[10px] text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-950/50 px-2 py-0.5 rounded-full font-medium">
                                {log.username}
                              </span>
                            </div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{log.details}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 text-[10px] text-gray-400 font-semibold shrink-0">
                          <Clock className="w-3.5 h-3.5" />
                          <span>{new Date(log.timestamp).toLocaleString('ar-SA')}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        )}

      {/* Tab 3.5: Delivery Fees Management */}
      {activeTab === 'delivery' && (userRole === 'admin' || userPermissions.includes('delivery') || userPermissions.includes('view_only')) && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h2 className="text-lg font-bold text-gray-800 dark:text-white">إدارة أسعار تسليم السيارات بين المناطق</h2>
            {!isReadOnly && (
              <button
                onClick={() => { resetDeliveryForm(); setDeliveryFormMode('add'); setShowDeliveryModal(true); }}
                className="bg-brand-600 hover:bg-brand-700 text-white font-bold py-2.5 px-4 rounded-xl shadow-md transition duration-150 flex items-center gap-1.5 text-sm shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>إضافة مسار توصيل جديد</span>
              </button>
            )}
          </div>

          {loading ? (
            <div className="text-center py-20">جاري تحميل قائمة الأسعار...</div>
          ) : (
            <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl overflow-hidden shadow-sm">
              
              {/* Search Bar for delivery route management */}
              <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex justify-end">
                <div className="relative w-full sm:w-72">
                  <input
                    type="text"
                    placeholder="ابحث عن مسار توصيل..."
                    value={deliverySearch}
                    onChange={(e) => setDeliverySearch(e.target.value)}
                    className="w-full pl-4 pr-10 py-2 bg-gray-50 border border-gray-200 dark:bg-gray-800 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none transition text-right text-xs"
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-gray-400">
                    <Search className="w-4 h-4" />
                  </div>
                </div>
              </div>

              <table className="w-full text-right text-sm border-collapse">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-800/40 text-gray-500 dark:text-gray-400 font-bold border-b border-gray-100 dark:border-gray-800">
                    <th className="p-4">منطقة الاستلام (من)</th>
                    <th className="p-4">منطقة التسليم (إلى)</th>
                    <th className="p-4">السعر المعتمد</th>
                    {!isReadOnly && <th className="p-4 text-center">الإجراءات</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {deliveryFees
                    .filter(f => {
                      return f.from_city.toLowerCase().includes(deliverySearch.toLowerCase()) ||
                             f.to_city.toLowerCase().includes(deliverySearch.toLowerCase()) ||
                             String(f.price).includes(deliverySearch);
                    })
                    .length === 0 ? (
                    <tr>
                      <td colSpan={4} className="p-4 text-center text-gray-400">لا توجد مسارات توصيل مضافة حالياً.</td>
                    </tr>
                  ) : (
                    deliveryFees
                      .filter(f => {
                        return f.from_city.toLowerCase().includes(deliverySearch.toLowerCase()) ||
                               f.to_city.toLowerCase().includes(deliverySearch.toLowerCase()) ||
                               String(f.price).includes(deliverySearch);
                      })
                      .map((fee) => (
                        <tr key={fee.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/20 transition duration-100">
                          <td className="p-4 font-bold text-gray-900 dark:text-white">{fee.from_city}</td>
                          <td className="p-4 font-bold text-gray-900 dark:text-white">{fee.to_city}</td>
                          <td className="p-4 font-extrabold text-brand-700 dark:text-brand-400">{fee.price} ريال</td>
                          {!isReadOnly && (
                            <td className="p-4 text-center">
                              <div className="flex items-center justify-center gap-2">
                                <button
                                  onClick={() => handleEditDeliveryClick(fee)}
                                  className="p-2 text-brand-600 hover:bg-brand-50 dark:hover:bg-brand-950/20 rounded-lg transition"
                                  title="تعديل السعر"
                                >
                                  <Edit2 className="w-4.5 h-4.5" />
                                </button>
                                <button
                                  onClick={() => handleDeleteDelivery(fee.id)}
                                  className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg transition"
                                  title="حذف المسار"
                                >
                                  <Trash2 className="w-4.5 h-4.5" />
                                </button>
                              </div>
                            </td>
                          )}
                        </tr>
                      ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Tab 4: Circulars Management */}
      {activeTab === 'circulars' && (userRole === 'admin' || userPermissions.includes('circulars') || userPermissions.includes('view_only')) && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-gray-800 dark:text-white">إدارة التعميمات والقرارات الإدارية</h2>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                أضف تعميمات تظهر لموظفي خدمة العملاء والكول سنتر في الصفحة الرئيسية فوراً كإشعار وتنبيه مميز.
              </p>
            </div>
            {!isReadOnly && (
              <button
                onClick={() => setShowCircularModal(true)}
                className="flex items-center justify-center gap-2 px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold rounded-xl shadow-lg shadow-brand-600/10 transition shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>إضافة تعميم جديد</span>
              </button>
            )}
          </div>

          <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl overflow-hidden shadow-sm">
            <div className="divide-y divide-gray-100 dark:divide-gray-800">
              {circulars.length === 0 ? (
                <div className="p-12 text-center text-gray-400 flex flex-col items-center justify-center">
                  <Megaphone className="w-12 h-12 mx-auto mb-3 text-gray-300 animate-bounce" />
                  <span>لا توجد تعميمات إدارية نشطة حالياً.</span>
                </div>
              ) : (
                circulars.map((c) => (
                  <div key={c.id} className="p-6 hover:bg-gray-50/50 dark:hover:bg-gray-800/10 transition flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2.5">
                        <span className="p-2 bg-brand-50 dark:bg-brand-950/20 text-brand-600 dark:text-brand-400 rounded-xl">
                          <Megaphone className="w-4 h-4" />
                        </span>
                        <h3 className="text-sm font-extrabold text-gray-900 dark:text-white">{c.title}</h3>
                        <span className="text-[10px] text-gray-400 font-semibold">
                          {new Date(c.created_at).toLocaleString('ar-SA')}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed pr-10">{c.content}</p>
                    </div>
                    
                    {!isReadOnly && (
                      <button
                        onClick={() => requestDelete('circular', c.id, c.title)}
                        className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg transition self-start sm:self-center"
                        title="حذف التعميم"
                      >
                        <Trash2 className="w-4.5 h-4.5" />
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      </main>

      {/* CAR MODAL (ADD & EDIT) */}
      {showCarModal && (
        <div className="fixed inset-0 bg-black/60 z-50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 w-full max-w-2xl rounded-2xl shadow-2xl p-6 md:p-8 max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-extrabold text-gray-900 dark:text-white mb-6 border-b border-gray-100 dark:border-gray-800 pb-4">
              {carFormMode === 'add' ? 'إضافة سيارة جديدة لقائمة الأسعار' : 'تعديل بيانات سيارة قائمة'}
            </h3>

            <form onSubmit={handleCarSubmit} className="space-y-6">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-2">اسم السيارة بالكامل</label>
                  <input
                    type="text"
                    value={carForm.name}
                    onChange={(e) => setCarForm(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="مثال: Toyota Corolla"
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 dark:bg-gray-800 dark:border-gray-700 rounded-xl outline-none focus:ring-2 focus:ring-brand-500 text-sm"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-2">الموديل (السنة)</label>
                  <input
                    type="text"
                    value={carForm.model}
                    onChange={(e) => setCarForm(prev => ({ ...prev, model: e.target.value }))}
                    placeholder="مثال: 2025"
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 dark:bg-gray-800 dark:border-gray-700 rounded-xl outline-none focus:ring-2 focus:ring-brand-500 text-sm"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-2">الإيجار اليومي (ريال)</label>
                  <input
                    type="number"
                    value={carForm.price_daily}
                    onChange={(e) => setCarForm(prev => ({ ...prev, price_daily: e.target.value }))}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 dark:bg-gray-800 dark:border-gray-700 rounded-xl outline-none focus:ring-2 focus:ring-brand-500 text-sm font-bold text-center"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-2">الإيجار الأسبوعي (ريال)</label>
                  <input
                    type="number"
                    value={carForm.price_weekly}
                    onChange={(e) => setCarForm(prev => ({ ...prev, price_weekly: e.target.value }))}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 dark:bg-gray-800 dark:border-gray-700 rounded-xl outline-none focus:ring-2 focus:ring-brand-500 text-sm font-bold text-center"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-2">الإيجار الشهري (ريال)</label>
                  <input
                    type="number"
                    value={carForm.price_monthly}
                    onChange={(e) => setCarForm(prev => ({ ...prev, price_monthly: e.target.value }))}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 dark:bg-gray-800 dark:border-gray-700 rounded-xl outline-none focus:ring-2 focus:ring-brand-500 text-sm font-bold text-center"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-2">فئات السيارة (اختر فئة أو أكثر)</label>
                  <div className="flex flex-wrap gap-2.5 p-3.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl max-h-[110px] overflow-y-auto">
                    {categories.map(cat => {
                      const selectedCats = carForm.category ? carForm.category.split(',').map(s => s.trim()) : [];
                      const isChecked = selectedCats.includes(cat);
                      return (
                        <label key={cat} className="flex items-center gap-1.5 cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={(e) => {
                              let newCats = [...selectedCats];
                              if (e.target.checked) {
                                if (!newCats.includes(cat)) newCats.push(cat);
                              } else {
                                newCats = newCats.filter(c => c !== cat);
                              }
                              // Set category joined by comma
                              setCarForm(prev => ({ ...prev, category: newCats.join(', ') }));
                            }}
                            className="rounded text-brand-500 focus:ring-brand-500 w-3.5 h-3.5"
                          />
                          <span className="text-xs font-bold text-gray-750 dark:text-gray-300">{cat}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>

                {/* Upload / Image link input */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-2">صورة السيارة</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={carForm.image}
                      onChange={(e) => setCarForm(prev => ({ ...prev, image: e.target.value }))}
                      placeholder="رابط الصورة أو قم برفعها"
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 dark:bg-gray-800 dark:border-gray-700 rounded-xl outline-none focus:ring-2 focus:ring-brand-500 text-xs"
                    />
                    <label className="bg-brand-50 hover:bg-brand-100 text-brand-700 dark:bg-brand-950 dark:hover:bg-brand-900 border border-brand-200 dark:border-brand-850 px-4 rounded-xl flex items-center justify-center cursor-pointer shrink-0 transition select-none">
                      {uploadingImage ? (
                        <div className="w-4 h-4 border-2 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        <Upload className="w-4 h-4" />
                      )}
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={handleImageUpload} 
                        className="hidden" 
                        disabled={uploadingImage}
                      />
                    </label>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-2">الكيلومترات المسموحة يومياً</label>
                  <input
                    type="number"
                    value={carForm.allowed_km_daily}
                    onChange={(e) => setCarForm(prev => ({ ...prev, allowed_km_daily: e.target.value }))}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 dark:bg-gray-800 dark:border-gray-700 rounded-xl outline-none focus:ring-2 focus:ring-brand-500 text-sm font-bold text-center"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-2">سعر الكيلومتر الزائد (ريال)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={carForm.extra_km_price}
                    onChange={(e) => setCarForm(prev => ({ ...prev, extra_km_price: e.target.value }))}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 dark:bg-gray-800 dark:border-gray-700 rounded-xl outline-none focus:ring-2 focus:ring-brand-500 text-sm font-bold text-center"
                    required
                  />
                </div>
              </div>

              {/* Switches */}
              <div className="flex flex-wrap gap-6 pt-4 border-t border-gray-100 dark:border-gray-800">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={carForm.available}
                    onChange={(e) => setCarForm(prev => ({ ...prev, available: e.target.checked }))}
                    className="rounded text-brand-500 focus:ring-brand-500 w-4 h-4"
                  />
                  <span className="text-xs font-bold text-gray-700 dark:text-gray-300">السيارة متوفرة للتأجير حالياً</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={carForm.visible}
                    onChange={(e) => setCarForm(prev => ({ ...prev, visible: e.target.checked }))}
                    className="rounded text-brand-500 focus:ring-brand-500 w-4 h-4"
                  />
                  <span className="text-xs font-bold text-gray-700 dark:text-gray-300">إظهار السيارة في لائحة الأسعار للعملاء</span>
                </label>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-3 pt-6 border-t border-gray-100 dark:border-gray-800">
                <button
                  type="button"
                  onClick={() => setShowCarModal(false)}
                  className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 text-sm font-bold rounded-xl transition"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white text-sm font-bold rounded-xl shadow-lg shadow-brand-600/10 transition"
                >
                  حفظ البيانات
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* OFFERS MODAL (ADD) */}
      {showOfferModal && (
        <div className="fixed inset-0 bg-black/60 z-50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 w-full max-w-xl rounded-2xl shadow-2xl p-6 md:p-8">
            <h3 className="text-xl font-extrabold text-gray-900 dark:text-white mb-6 border-b border-gray-100 dark:border-gray-800 pb-4">
              {offerFormMode === 'add' ? 'إضافة عرض ترويجي جديد' : 'تعديل العرض الترويجي'}
            </h3>

            <form onSubmit={handleOfferSubmit} className="space-y-6">
              
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-2">عنوان العرض الترويجي</label>
                <input
                  type="text"
                  value={offerForm.title}
                  onChange={(e) => setOfferForm(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="مثال: 🔥 خصم 15٪ لمدة أسبوع"
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 dark:bg-gray-800 dark:border-gray-700 rounded-xl outline-none focus:ring-2 focus:ring-brand-500 text-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-2">وصف وتفاصيل العرض</label>
                <textarea
                  value={offerForm.description}
                  onChange={(e) => setOfferForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="اكتب تفاصيل العرض الترويجي بدقة..."
                  rows={4}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 dark:bg-gray-800 dark:border-gray-700 rounded-xl outline-none focus:ring-2 focus:ring-brand-500 text-sm"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-2">تاريخ البدء (اختياري)</label>
                  <input
                    type="date"
                    value={offerForm.start_date}
                    onChange={(e) => setOfferForm(prev => ({ ...prev, start_date: e.target.value }))}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 dark:bg-gray-800 dark:border-gray-700 rounded-xl outline-none focus:ring-2 focus:ring-brand-500 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-2">تاريخ الانتهاء</label>
                  <input
                    type="date"
                    value={offerForm.end_date}
                    onChange={(e) => setOfferForm(prev => ({ ...prev, end_date: e.target.value }))}
                    disabled={offerForm.is_permanent}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 dark:bg-gray-800 dark:border-gray-700 rounded-xl outline-none focus:ring-2 focus:ring-brand-500 text-xs disabled:opacity-50 font-bold"
                  />
                </div>
              </div>

              <div className="flex items-center">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={offerForm.is_permanent || false}
                    onChange={(e) => setOfferForm(prev => ({ ...prev, is_permanent: e.target.checked }))}
                    className="rounded text-brand-500 focus:ring-brand-500 w-4 h-4"
                  />
                  <span className="text-xs font-bold text-gray-700 dark:text-gray-300">العرض دائم (ليس له وقت انتهاء)</span>
                </label>
              </div>

              <div className="border-t border-gray-150 dark:border-gray-800 pt-4 space-y-4">
                <h4 className="text-xs font-extrabold text-gray-900 dark:text-white">إعدادات الخصم التلقائي على السيارات</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-2">نوع الخصم</label>
                    <select
                      value={offerForm.discount_type}
                      onChange={(e) => setOfferForm(prev => ({ ...prev, discount_type: e.target.value }))}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 dark:bg-gray-800 dark:border-gray-700 rounded-xl outline-none focus:ring-2 focus:ring-brand-500 text-xs"
                    >
                      <option value="none">لا يوجد خصم تلقائي</option>
                      <option value="percentage">نسبة مئوية (%)</option>
                      <option value="value">قيمة ثابتة (ريال)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-2">قيمة الخصم</label>
                    <input
                      type="number"
                      value={offerForm.discount_value}
                      onChange={(e) => setOfferForm(prev => ({ ...prev, discount_value: e.target.value }))}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 dark:bg-gray-800 dark:border-gray-700 rounded-xl outline-none focus:ring-2 focus:ring-brand-500 text-xs font-bold text-center"
                      disabled={offerForm.discount_type === 'none'}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-2">فئة السيارات المستهدفة</label>
                    <select
                      value={offerForm.apply_to_category}
                      onChange={(e) => setOfferForm(prev => ({ ...prev, apply_to_category: e.target.value }))}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 dark:bg-gray-800 dark:border-gray-700 rounded-xl outline-none focus:ring-2 focus:ring-brand-500 text-xs"
                      disabled={offerForm.discount_type === 'none'}
                    >
                      <option value="الكل">كل الفئات</option>
                      {categories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-3 pt-6 border-t border-gray-100 dark:border-gray-800">
                <button
                  type="button"
                  onClick={() => setShowOfferModal(false)}
                  className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 text-sm font-bold rounded-xl transition"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white text-sm font-bold rounded-xl shadow-lg shadow-brand-600/10 transition"
                >
                  حفظ العرض
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* DELIVERY MODAL (ADD & EDIT) */}
      {showDeliveryModal && (
        <div className="fixed inset-0 bg-black/60 z-50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 w-full max-w-lg rounded-2xl shadow-2xl p-6 md:p-8">
            <h3 className="text-xl font-extrabold text-gray-900 dark:text-white mb-6 border-b border-gray-100 dark:border-gray-800 pb-4">
              {deliveryFormMode === 'add' ? 'إضافة مسار تسليم جديد' : 'تعديل مسار تسليم قائم'}
            </h3>

            <form onSubmit={handleDeliverySubmit} className="space-y-6">
              
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-2">منطقة/مدينة الاستلام (من)</label>
                <input
                  type="text"
                  value={deliveryForm.from_city}
                  onChange={(e) => setDeliveryForm(prev => ({ ...prev, from_city: e.target.value }))}
                  placeholder="مثال: الرياض"
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 dark:bg-gray-800 dark:border-gray-700 rounded-xl outline-none focus:ring-2 focus:ring-brand-500 text-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-2">منطقة/مدينة التسليم (إلى)</label>
                <input
                  type="text"
                  value={deliveryForm.to_city}
                  onChange={(e) => setDeliveryForm(prev => ({ ...prev, to_city: e.target.value }))}
                  placeholder="مثال: جدة"
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 dark:bg-gray-800 dark:border-gray-700 rounded-xl outline-none focus:ring-2 focus:ring-brand-500 text-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-2">تكلفة الشحن والتوصيل (ريال)</label>
                <input
                  type="number"
                  value={deliveryForm.price}
                  onChange={(e) => setDeliveryForm(prev => ({ ...prev, price: e.target.value }))}
                  placeholder="مثال: 500"
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 dark:bg-gray-800 dark:border-gray-700 rounded-xl outline-none focus:ring-2 focus:ring-brand-500 text-sm font-bold text-center"
                  required
                />
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-3 pt-6 border-t border-gray-100 dark:border-gray-800">
                <button
                  type="button"
                  onClick={() => setShowDeliveryModal(false)}
                  className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 text-sm font-bold rounded-xl transition"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white text-sm font-bold rounded-xl shadow-lg shadow-brand-600/10 transition"
                >
                  حفظ البيانات
                </button>
              </div>

            </form>
          </div>
        </div>
      )}
      {/* Custom Delete Confirmation Modal */}
      {deleteConfirm.show && (
        <div className="fixed inset-0 bg-black/60 z-[60] backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 w-full max-w-md rounded-2xl shadow-2xl p-6 text-center animate-fade-in">
            <div className="w-14 h-14 bg-red-50 dark:bg-red-950/30 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-100 dark:border-red-900/30">
              <Trash2 className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">تأكيد الحذف نهائياً</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-6 leading-relaxed">
              هل أنت متأكد من رغبتك في حذف <span className="font-extrabold text-gray-850 dark:text-gray-250">"{deleteConfirm.title}"</span>؟
              <br />
              هذا الإجراء نهائي ولا يمكن التراجع عنه.
            </p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={confirmDeleteAction}
                className="bg-red-650 hover:bg-red-700 text-white font-bold py-2.5 px-6 rounded-xl transition duration-150 text-xs shadow-md"
              >
                نعم، احذف
              </button>
              <button
                onClick={() => setDeleteConfirm({ show: false, type: 'car', id: null, title: '' })}
                className="bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 font-bold py-2.5 px-6 rounded-xl transition duration-150 text-xs"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CIRCULAR MODAL (ADD) */}
      {showCircularModal && (
        <div className="fixed inset-0 bg-black/60 z-50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 w-full max-w-xl rounded-2xl shadow-2xl p-6 md:p-8">
            <h3 className="text-xl font-extrabold text-gray-900 dark:text-white mb-6 border-b border-gray-100 dark:border-gray-800 pb-4">
              إضافة تعميم إداري جديد
            </h3>

            <form onSubmit={handleAddCircular} className="space-y-6">
              
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-2">عنوان التعميم</label>
                <input
                  type="text"
                  value={circularTitle}
                  onChange={(e) => setCircularTitle(e.target.value)}
                  placeholder="مثال: تعميم بخصوص سياسة تأمين فئات الـ SUV"
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 dark:bg-gray-800 dark:border-gray-700 rounded-xl outline-none focus:ring-2 focus:ring-brand-500 text-sm text-right"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-2">تفاصيل ومحتوى التعميم</label>
                <textarea
                  value={circularContent}
                  onChange={(e) => setCircularContent(e.target.value)}
                  placeholder="اكتب نص التعميم بالتفصيل..."
                  rows={6}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 dark:bg-gray-800 dark:border-gray-700 rounded-xl outline-none focus:ring-2 focus:ring-brand-500 text-sm text-right font-medium"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-2">تاريخ انتهاء التعميم</label>
                  <input
                    type="date"
                    value={circularEndDate}
                    onChange={(e) => setCircularEndDate(e.target.value)}
                    disabled={circularIsPermanent}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 dark:bg-gray-800 dark:border-gray-700 rounded-xl outline-none focus:ring-2 focus:ring-brand-500 text-sm text-center font-bold disabled:opacity-50"
                    required={!circularIsPermanent}
                  />
                </div>

                <div className="flex items-center pt-6">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={circularIsPermanent}
                      onChange={(e) => setCircularIsPermanent(e.target.checked)}
                      className="rounded text-brand-500 focus:ring-brand-500 w-4 h-4"
                    />
                    <span className="text-xs font-bold text-gray-700 dark:text-gray-300">التعميم دائم (ليس له وقت انتهاء)</span>
                  </label>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-3 pt-6 border-t border-gray-100 dark:border-gray-800">
                <button
                  type="button"
                  onClick={() => setShowCircularModal(false)}
                  className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 text-sm font-bold rounded-xl transition"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={submittingCircular}
                  className="px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white text-sm font-bold rounded-xl shadow-lg shadow-brand-600/10 transition disabled:opacity-50"
                >
                  {submittingCircular ? 'جاري الحفظ...' : 'نشر التعميم'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* Users Management View */}
      {activeTab === 'users' && userRole === 'admin' && (
        <div className="space-y-6 animate-fade-in">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-gray-800 dark:text-white">إدارة حسابات المشرفين والموظفين</h2>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">يمكنك إضافة مشرفين وتحديد صلاحياتهم أو سحبها وتغيير كلمات المرور</p>
            </div>
            <button
              onClick={() => {
                resetUserForm();
                setShowUserModal(true);
              }}
              className="px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold rounded-xl shadow-md transition flex items-center gap-1.5"
            >
              <UserPlus className="w-4 h-4" />
              <span>إضافة مشرف/موظف</span>
            </button>
          </div>

          <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl shadow-sm overflow-hidden">
            <table className="w-full text-right text-sm border-collapse">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-800">
                  <th className="p-4 font-bold text-gray-700 dark:text-gray-300">اسم المستخدم</th>
                  <th className="p-4 font-bold text-gray-700 dark:text-gray-300">الدور والصلاحيات</th>
                  <th className="p-4 font-bold text-gray-700 dark:text-gray-300">تفاصيل الصلاحية</th>
                  <th className="p-4 font-bold text-gray-700 dark:text-gray-300 text-center">العمليات</th>
                </tr>
              </thead>
              <tbody>
                {usersList.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="p-12 text-center text-gray-400 dark:text-gray-550">لا توجد حسابات مسجلة حالياً.</td>
                  </tr>
                ) : (
                  usersList.map((u) => (
                    <tr key={u.username} className="border-b border-gray-100/50 dark:border-gray-850 hover:bg-gray-50/50 dark:hover:bg-gray-800/10 transition">
                      <td className="p-4 font-bold text-gray-955 dark:text-white">{u.username}</td>
                      <td className="p-4">
                        <span className={
                          u.role === 'admin' 
                            ? 'px-2 py-0.5 rounded text-[10px] font-bold bg-red-50 text-red-700 dark:bg-red-950/20 dark:text-red-400' 
                            : 'px-2 py-0.5 rounded text-[10px] font-bold bg-gray-100 text-gray-750 dark:bg-gray-800 dark:text-gray-350'
                        }>
                          {u.role === 'admin' ? 'مدير نظام كامل الصلاحيات' : 'مشرف مخصص الصلاحيات'}
                        </span>
                      </td>
                      <td className="p-4 text-xs text-gray-550 dark:text-gray-400">
                        {u.role === 'admin' ? (
                          <span className="text-red-600 dark:text-red-400 font-bold">صلاحية كاملة مطلقة لوظائف النظام</span>
                        ) : (
                          <div className="flex flex-wrap gap-1.5">
                            {(!u.permissions || u.permissions.length === 0) ? (
                              <span className="text-gray-400">لا توجد صلاحيات إضافية (عرض فقط)</span>
                            ) : (
                              u.permissions.map(p => {
                                let label = '';
                                if (p === 'cars') label = 'السيارات';
                                else if (p === 'offers') label = 'العروض';
                                else if (p === 'delivery') label = 'أسعار التوصيل';
                                else if (p === 'logs') label = 'سجل الأمان';
                                else if (p === 'circulars') label = 'التعميمات';
                                return (
                                  <span key={p} className="bg-brand-50 text-brand-700 dark:bg-brand-950/30 dark:text-brand-400 text-[10px] font-bold px-1.5 py-0.5 rounded">
                                    {label}
                                  </span>
                                );
                              })
                            )}
                          </div>
                        )}
                      </td>
                      <td className="p-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleEditUserClick(u)}
                            className="px-2.5 py-1 text-[11px] font-bold text-brand-650 hover:bg-brand-50 dark:text-brand-400 dark:hover:bg-brand-950/30 rounded-lg transition"
                          >
                            تعديل
                          </button>
                          {u.username !== 'bader' && (
                            <button
                              onClick={() => handleDeleteUserClick(u.username)}
                              className="px-2.5 py-1 text-[11px] font-bold text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/30 rounded-lg transition"
                            >
                              حذف
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* USER MODAL (ADD/EDIT) */}
      {showUserModal && (
        <div className="fixed inset-0 bg-black/60 z-50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 w-full max-w-md rounded-2xl shadow-2xl p-6 md:p-8">
            <h3 className="text-lg font-extrabold text-gray-900 dark:text-white mb-6 border-b border-gray-100 dark:border-gray-800 pb-4">
              {userFormMode === 'add' ? 'إضافة حساب مشرف/موظف جديد' : 'تعديل بيانات الحساب: ' + userForm.username}
            </h3>

            <form onSubmit={handleUserSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-2">اسم المستخدم</label>
                <input
                  type="text"
                  value={userForm.username}
                  onChange={(e) => setUserForm(prev => ({ ...prev, username: e.target.value }))}
                  disabled={userFormMode === 'edit'}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 dark:bg-gray-800 dark:border-gray-700 rounded-xl outline-none focus:ring-2 focus:ring-brand-500 text-sm text-right disabled:opacity-50"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-2">
                  {userFormMode === 'add' ? 'كلمة المرور' : 'كلمة المرور الجديدة (اتركه فارغاً بعدم التعديل)'}
                </label>
                <input
                  type="password"
                  value={userForm.password}
                  onChange={(e) => setUserForm(prev => ({ ...prev, password: e.target.value }))}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 dark:bg-gray-800 dark:border-gray-700 rounded-xl outline-none focus:ring-2 focus:ring-brand-500 text-sm text-right"
                  required={userFormMode === 'add'}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-2">نوع الحساب الأساسي</label>
                <select
                  value={userForm.role}
                  onChange={(e) => {
                    const newRole = e.target.value as 'admin' | 'employee';
                    setUserForm(prev => ({ 
                      ...prev, 
                      role: newRole,
                      permissions: newRole === 'admin' ? ['cars', 'offers', 'delivery', 'logs', 'circulars'] : []
                    }));
                  }}
                  disabled={userForm.username === 'bader'}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 dark:bg-gray-800 dark:border-gray-700 rounded-xl outline-none focus:ring-2 focus:ring-brand-500 text-sm text-right disabled:opacity-50"
                >
                  <option value="employee">مشرف مخصص الصلاحيات (موظف)</option>
                  <option value="admin">مدير نظام كامل الصلاحيات (Admin)</option>
                </select>
              </div>

              {userForm.role === 'employee' && (
                <div className="space-y-2 mt-4 p-4 bg-gray-50 dark:bg-gray-800/40 rounded-xl border border-gray-100 dark:border-gray-800">
                  <label className="block text-xs font-bold text-gray-750 dark:text-gray-300 mb-2">تحديد الصلاحيات الممنوحة:</label>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={userForm.permissions.includes('cars')}
                        onChange={(e) => {
                          const perms = e.target.checked 
                            ? [...userForm.permissions, 'cars'] 
                            : userForm.permissions.filter(p => p !== 'cars');
                          setUserForm(prev => ({ ...prev, permissions: perms }));
                        }}
                        className="rounded text-brand-500 focus:ring-brand-500 w-4 h-4"
                      />
                      <span className="text-xs font-bold text-gray-700 dark:text-gray-300">إدارة السيارات</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={userForm.permissions.includes('offers')}
                        onChange={(e) => {
                          const perms = e.target.checked 
                            ? [...userForm.permissions, 'offers'] 
                            : userForm.permissions.filter(p => p !== 'offers');
                          setUserForm(prev => ({ ...prev, permissions: perms }));
                        }}
                        className="rounded text-brand-500 focus:ring-brand-500 w-4 h-4"
                      />
                      <span className="text-xs font-bold text-gray-700 dark:text-gray-300">إدارة العروض</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={userForm.permissions.includes('delivery')}
                        onChange={(e) => {
                          const perms = e.target.checked 
                            ? [...userForm.permissions, 'delivery'] 
                            : userForm.permissions.filter(p => p !== 'delivery');
                          setUserForm(prev => ({ ...prev, permissions: perms }));
                        }}
                        className="rounded text-brand-500 focus:ring-brand-500 w-4 h-4"
                      />
                      <span className="text-xs font-bold text-gray-700 dark:text-gray-300">أسعار التوصيل</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={userForm.permissions.includes('circulars')}
                        onChange={(e) => {
                          const perms = e.target.checked 
                            ? [...userForm.permissions, 'circulars'] 
                            : userForm.permissions.filter(p => p !== 'circulars');
                          setUserForm(prev => ({ ...prev, permissions: perms }));
                        }}
                        className="rounded text-brand-500 focus:ring-brand-500 w-4 h-4"
                      />
                      <span className="text-xs font-bold text-gray-700 dark:text-gray-300">إدارة التعميمات</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer select-none col-span-2">
                      <input
                        type="checkbox"
                        checked={userForm.permissions.includes('logs')}
                        onChange={(e) => {
                          const perms = e.target.checked 
                            ? [...userForm.permissions, 'logs'] 
                            : userForm.permissions.filter(p => p !== 'logs');
                          setUserForm(prev => ({ ...prev, permissions: perms }));
                        }}
                        className="rounded text-brand-500 focus:ring-brand-500 w-4 h-4"
                      />
                      <span className="text-xs font-bold text-gray-700 dark:text-gray-300">عرض سجل الأمان والعمليات</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer select-none col-span-2 border-t border-gray-100 dark:border-gray-800 pt-2 mt-1">
                      <input
                        type="checkbox"
                        checked={userForm.permissions.includes('view_only')}
                        onChange={(e) => {
                          const perms = e.target.checked 
                            ? [...userForm.permissions, 'view_only'] 
                            : userForm.permissions.filter(p => p !== 'view_only');
                          setUserForm(prev => ({ ...prev, permissions: perms }));
                        }}
                        className="rounded text-brand-500 focus:ring-brand-500 w-4 h-4"
                      />
                      <span className="text-xs font-extrabold text-brand-600 dark:text-brand-400">استعراض فقط (رؤية البيانات دون التعديل/الإضافة/الحذف)</span>
                    </label>
                  </div>
                </div>
              )}

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-3 pt-6 border-t border-gray-100 dark:border-gray-800 mt-6">
                <button
                  type="button"
                  onClick={() => setShowUserModal(false)}
                  className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 text-sm font-bold rounded-xl transition"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={submittingUser}
                  className="px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white text-sm font-bold rounded-xl shadow-lg transition disabled:opacity-50"
                >
                  {submittingUser ? 'جاري الحفظ...' : 'حفظ البيانات'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete confirmation modal */}
      {deleteConfirm.show && (
        <div className="fixed inset-0 bg-black/60 z-50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 w-full max-w-md rounded-2xl shadow-2xl p-6 text-center animate-scale-up">
            <div className="w-16 h-16 bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-100 dark:border-red-900/30">
              <Trash2 className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-black text-gray-900 dark:text-white mb-2">تأكيد الحذف نهائياً</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-6 px-4">
              هل أنت متأكد من رغبتك في حذف "{deleteConfirm.title}"؟
              <br />
              هذا الإجراء نهائي ولا يمكن التراجع عنه.
            </p>
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => setDeleteConfirm({ show: false, type: 'car', id: null, title: '' })}
                className="px-6 py-2.5 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs font-bold rounded-xl transition"
              >
                إلغاء
              </button>
              <button
                onClick={confirmDeleteAction}
                className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl transition shadow-lg shadow-red-600/10"
              >
                نعم، احذف
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
