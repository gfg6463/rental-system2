require('dotenv').config();
const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const db = require('./db');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --- Users / Admin management routes ---
app.get('/api/users', authenticateToken, requirePrimaryAdmin, (req, res) => {
  try {
    const users = loadUsers().map(u => ({ username: u.username, role: u.role, permissions: u.permissions || [] }));
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: 'حدث خطأ أثناء جلب المستخدمين' });
  }
});

app.post('/api/users', authenticateToken, requirePrimaryAdmin, async (req, res) => {
  try {
    const { username, password, role } = req.body;
    if (!username || !password || !role) {
      return res.status(400).json({ error: 'جميع الحقول مطلوبة' });
    }
    const users = loadUsers();
    if (users.find(u => u.username === username)) {
      return res.status(400).json({ error: 'اسم المستخدم موجود بالفعل' });
    }
    const newUser = {
      username,
      passwordHash: await bcrypt.hash(password, 10),
      role,
      permissions: req.body.permissions || []
    };
    users.push(newUser);
    saveUsers(users);
    await db.addLog('إضافة مستخدم', `تم إضافة مشرف جديد: ${username} بدور ${role}`, req.user.username);
    res.status(201).json({ username, role });
  } catch (err) {
    res.status(500).json({ error: 'حدث خطأ أثناء إضافة المستخدم' });
  }
});

app.put('/api/users/:username', authenticateToken, requirePrimaryAdmin, async (req, res) => {
  try {
    const targetUsername = req.params.username;
    const { role, password } = req.body;
    const users = loadUsers();
    const userIndex = users.findIndex(u => u.username === targetUsername);
    if (userIndex === -1) {
      return res.status(404).json({ error: 'المستخدم غير موجود' });
    }
    if (targetUsername === 'bader' && role !== 'admin') {
      return res.status(400).json({ error: 'لا يمكن تعديل دور المدير الأساسي' });
    }
    if (role) {
      users[userIndex].role = role;
    }
    if (req.body.permissions) {
      users[userIndex].permissions = req.body.permissions;
    }
    if (password) {
      users[userIndex].passwordHash = await bcrypt.hash(password, 10);
    }
    saveUsers(users);
    await db.addLog('تعديل مستخدم', `تم تعديل بيانات المشرف: ${targetUsername}`, req.user.username);
    res.json({ username: targetUsername, role: users[userIndex].role, permissions: users[userIndex].permissions || [] });
  } catch (err) {
    res.status(500).json({ error: 'حدث خطأ أثناء تعديل المستخدم' });
  }
});

app.delete('/api/users/:username', authenticateToken, requirePrimaryAdmin, async (req, res) => {
  try {
    const targetUsername = req.params.username;
    if (targetUsername === 'bader') {
      return res.status(400).json({ error: 'لا يمكن حذف المدير الأساسي للنظام' });
    }
    const users = loadUsers();
    const initialLength = users.length;
    const filtered = users.filter(u => u.username !== targetUsername);
    if (filtered.length === initialLength) {
      return res.status(404).json({ error: 'المستخدم غير موجود' });
    }
    saveUsers(filtered);
    await db.addLog('حذف مستخدم', `تم حذف المشرف: ${targetUsername}`, req.user.username);
    res.json({ message: 'تم حذف المستخدم بنجاح' });
  } catch (err) {
    res.status(500).json({ error: 'حدث خطأ أثناء حذف المستخدم' });
  }
});

const PORT = process.env.PORT || 8000;
const SECRET_KEY = process.env.SECRET_KEY || 'supersecretkeychangeinproduction1234567890';

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}



// Serve uploaded images statically
app.use('/uploads', express.static(uploadsDir));

// Pre-seeded users in memory for quick checks
// Passwords hashed with bcryptjs

const JSON_DB_PATH = path.join(__dirname, 'data.json');

function loadUsers() {
  try {
    const data = JSON.parse(fs.readFileSync(JSON_DB_PATH, 'utf8'));
    if (!data.users) {
      data.users = [
        {
          username: 'bader',
          passwordHash: bcrypt.hashSync('admin123', 10),
          role: 'admin',
          permissions: ['cars', 'offers', 'delivery', 'logs', 'circulars']
        },
        {
          username: 'admin2',
          passwordHash: bcrypt.hashSync('admin123', 10),
          role: 'employee',
          permissions: ['circulars']
        },
        {
          username: 'admin3',
          passwordHash: bcrypt.hashSync('admin123', 10),
          role: 'employee',
          permissions: ['offers']
        },
        {
          username: 'agent',
          passwordHash: bcrypt.hashSync('agent123', 10),
          role: 'employee',
          permissions: []
        }
      ];
      fs.writeFileSync(JSON_DB_PATH, JSON.stringify(data, null, 2), 'utf8');
    }
    return data.users;
  } catch (err) {
    console.error('Error loading users:', err);
    return [];
  }
}

function saveUsers(users) {
  try {
    const data = JSON.parse(fs.readFileSync(JSON_DB_PATH, 'utf8'));
    data.users = users;
    fs.writeFileSync(JSON_DB_PATH, JSON.stringify(data, null, 2), 'utf8');
  } catch (err) {
    console.error('Error saving users:', err);
  }
}

const SEEDED_USERS = {
  bader: {
    username: 'bader',
    passwordHash: bcrypt.hashSync('admin123', 10),
    role: 'admin'
  },
  admin2: {
    username: 'admin2',
    passwordHash: bcrypt.hashSync('admin123', 10),
    role: 'admin_circulars'
  },
  admin3: {
    username: 'admin3',
    passwordHash: bcrypt.hashSync('admin123', 10),
    role: 'admin_offers'
  },
  agent: {
    username: 'agent',
    passwordHash: bcrypt.hashSync('agent123', 10),
    role: 'employee'
  }
};

// --- AUTHENTICATION MIDDLEWARE ---
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'غير مصرح للوصول - الرمز مفقود' });
  }

  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'الرمز غير صالح أو منتهي الصلاحية' });
    }
    req.user = user;
    next();
  });
}

function requireAdmin(req, res, next) {
  if (!req.user) {
    return res.status(403).json({ error: 'صلاحيات غير كافية' });
  }
  next();
}

function requirePrimaryAdmin(req, res, next) {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ error: 'صلاحيات غير كافية - للمدير الأساسي فقط' });
  }
  next();
}

function hasPermission(req, permission) {
  if (!req.user) return false;
  if (req.user.role === 'admin') return true;
  
  const permissions = req.user.permissions || [];
  
  if (['POST', 'PUT', 'DELETE'].includes(req.method)) {
    if (permissions.includes('view_only')) {
      return false;
    }
  }
  
  if (req.method === 'GET' && permissions.includes('view_only')) {
    return true;
  }
  
  return permissions.includes(permission);
}

function requireCarsAdmin(req, res, next) {
  if (!hasPermission(req, 'cars')) {
    return res.status(403).json({ error: 'صلاحيات غير كافية - لإدارة السيارات فقط' });
  }
  next();
}

function requireOffersAdmin(req, res, next) {
  if (!hasPermission(req, 'offers')) {
    return res.status(403).json({ error: 'صلاحيات غير كافية - لإدارة العروض فقط' });
  }
  next();
}

function requireDeliveryAdmin(req, res, next) {
  if (!hasPermission(req, 'delivery')) {
    return res.status(403).json({ error: 'صلاحيات غير كافية - لإدارة أسعار التوصيل فقط' });
  }
  next();
}

function requireCircularsAdmin(req, res, next) {
  if (!hasPermission(req, 'circulars')) {
    return res.status(403).json({ error: 'صلاحيات غير كافية - لإدارة التعميمات فقط' });
  }
  next();
}

function requireLogsAdmin(req, res, next) {
  if (!hasPermission(req, 'logs')) {
    return res.status(403).json({ error: 'صلاحيات غير كافية - لعرض سجل العمليات فقط' });
  }
  next();
}

// --- FILE UPLOAD SETUP ---
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});


// --- ROUTES ---

// 1. Authentication
app.post('/api/auth/login', async (req, res) => {
  const { username, password } = req.body;
  
  if (!username || !password) {
    return res.status(400).json({ error: 'يرجى إدخال اسم المستخدم وكلمة المرور' });
  }

  // Load from dynamic database storage
  const users = loadUsers();
  const user = users.find(u => u.username.toLowerCase() === username.toLowerCase());

  if (!user) {
    return res.status(401).json({ error: 'اسم المستخدم أو كلمة المرور غير صحيحة' });
  }

  const passwordIsValid = bcrypt.compareSync(password, user.passwordHash);
  if (!passwordIsValid) {
    return res.status(401).json({ error: 'اسم المستخدم أو كلمة المرور غير صحيحة' });
  }

  const token = jwt.sign(
    { username: user.username, role: user.role, permissions: user.permissions || [] },
    SECRET_KEY,
    { expiresIn: '12h' }
  );

  res.json({
    token,
    user: {
      username: user.username,
      role: user.role,
      permissions: user.permissions || []
    }
  });
});

// Get current user profile (token verification)
app.get('/api/auth/me', authenticateToken, (req, res) => {
  res.json({ user: req.user });
});

// 2. Cars API
app.get('/api/cars', async (req, res) => {
  try {
    const cars = await db.getCars();
    
    // Check if user is authenticated and is admin
    // Note: We check token optionally here. If no token or not admin, we filter out hidden cars.
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    let isAdmin = false;
    
    if (token) {
      try {
        const decoded = jwt.verify(token, SECRET_KEY);
        if (decoded.role === 'admin') {
          isAdmin = true;
        }
      } catch (err) {
        // Invalid token, treat as normal employee
      }
    }

    const filteredCars = isAdmin ? cars : cars.filter(car => car.visible);
    res.json(filteredCars);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'حدث خطأ أثناء جلب قائمة السيارات' });
  }
});

app.get('/api/cars/:id', async (req, res) => {
  try {
    const car = await db.getCarById(req.params.id);
    if (!car) {
      return res.status(404).json({ error: 'السيارة غير موجودة' });
    }
    res.json(car);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'حدث خطأ أثناء جلب تفاصيل السيارة' });
  }
});

app.post('/api/cars', authenticateToken, requireCarsAdmin, async (req, res) => {
  try {
    const { name, model, image, price_daily, price_weekly, price_monthly, category, available, visible, extra_km_price, allowed_km_daily } = req.body;
    
    if (!name || !model || !price_daily || !price_weekly || !price_monthly || !category) {
      return res.status(400).json({ error: 'يرجى تعبئة كافة الحقول المطلوبة' });
    }

    const newCar = await db.createCar({
      name,
      model,
      image,
      price_daily,
      price_weekly,
      price_monthly,
      category,
      available,
      visible,
      extra_km_price,
      allowed_km_daily
    });

    await db.addLog('إضافة سيارة', `تمت إضافة سيارة جديدة: ${name} (${model}) بسعر يومي: ${price_daily} ريال`, req.user.username);

    res.status(201).json(newCar);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'حدث خطأ أثناء إضافة السيارة' });
  }
});

app.put('/api/cars/:id', authenticateToken, requireCarsAdmin, async (req, res) => {
  try {
    const { name, model, image, price_daily, price_weekly, price_monthly, category, available, visible, extra_km_price, allowed_km_daily } = req.body;
    
    const existing = await db.getCarById(req.params.id);
    if (!existing) {
      return res.status(404).json({ error: 'السيارة غير موجودة' });
    }

    const updated = await db.updateCar(req.params.id, {
      name,
      model,
      image,
      price_daily,
      price_weekly,
      price_monthly,
      category,
      available,
      visible,
      extra_km_price,
      allowed_km_daily
    });

    // Detect pricing changes for detailed log
    let details = `تم تعديل السيارة ${name} (${model}).`;
    if (existing.price_daily !== parseInt(price_daily) || 
        existing.price_weekly !== parseInt(price_weekly) || 
        existing.price_monthly !== parseInt(price_monthly)) {
      details += ` تعديل الأسعار: يومي (${existing.price_daily} -> ${price_daily})، أسبوعي (${existing.price_weekly} -> ${price_weekly})، شهري (${existing.price_monthly} -> ${price_monthly}).`;
    }
    if (existing.extra_km_price !== parseFloat(extra_km_price || 0) || 
        existing.allowed_km_daily !== parseInt(allowed_km_daily || 250)) {
      details += ` تعديل العداد: يومي مسموح (${existing.allowed_km_daily} -> ${allowed_km_daily})، سعر الكيلو الزائد (${existing.extra_km_price} -> ${extra_km_price}).`;
    }

    await db.addLog('تعديل سيارة', details, req.user.username);

    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'حدث خطأ أثناء تعديل السيارة' });
  }
});

app.delete('/api/cars/:id', authenticateToken, requireCarsAdmin, async (req, res) => {
  try {
    const existing = await db.getCarById(req.params.id);
    if (!existing) {
      return res.status(404).json({ error: 'السيارة غير موجودة' });
    }

    await db.deleteCar(req.params.id);
    await db.addLog('حذف سيارة', `تم حذف السيارة: ${existing.name} (${existing.model})`, req.user.username);

    res.json({ message: 'تم حذف السيارة بنجاح' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'حدث خطأ أثناء حذف السيارة' });
  }
});

// 3. Offers API
app.get('/api/offers', async (req, res) => {
  try {
    const offers = await db.getOffers();
    res.json(offers);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'حدث خطأ أثناء جلب العروض' });
  }
});

app.post('/api/offers', authenticateToken, requireOffersAdmin, async (req, res) => {
  try {
    const { title, description, start_date, end_date, active, pinned, discount_type, discount_value, apply_to_category, is_permanent } = req.body;
    
    if (!title || !description) {
      return res.status(400).json({ error: 'يرجى كتابة عنوان ووصف العرض' });
    }

    const newOffer = await db.createOffer({
      title,
      description,
      start_date,
      end_date,
      active,
      pinned,
      discount_type,
      discount_value,
      apply_to_category,
      is_permanent
    });

    await db.addLog('إضافة عرض', `تمت إضافة عرض جديد: ${title}`, req.user.username);

    res.status(201).json(newOffer);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'حدث خطأ أثناء إضافة العرض' });
  }
});

app.delete('/api/offers/:id', authenticateToken, requireOffersAdmin, async (req, res) => {
  try {
    const offers = await db.getOffers();
    const existing = offers.find(o => o.id === parseInt(req.params.id));
    
    if (!existing) {
      return res.status(404).json({ error: 'العرض غير موجود' });
    }

    await db.deleteOffer(req.params.id);
    await db.addLog('حذف عرض', `تم حذف العرض: ${existing.title}`, req.user.username);

    res.json({ message: 'تم حذف العرض بنجاح' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'حدث خطأ أثناء حذف العرض' });
  }
});

app.put('/api/offers/:id', authenticateToken, requireOffersAdmin, async (req, res) => {
  try {
    const { title, description, start_date, end_date, active, discount_type, discount_value, apply_to_category, is_permanent } = req.body;
    
    if (!title || !description) {
      return res.status(400).json({ error: 'يرجى كتابة عنوان ووصف العرض' });
    }

    const updated = await db.updateOffer(req.params.id, {
      title,
      description,
      start_date,
      end_date,
      active,
      discount_type,
      discount_value,
      apply_to_category,
      is_permanent
    });

    if (!updated) {
      return res.status(404).json({ error: 'العرض غير موجود' });
    }

    await db.addLog('تعديل عرض', `تم تعديل العرض الترويجي: ${title}`, req.user.username);
    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'حدث خطأ أثناء تعديل العرض' });
  }
});

app.put('/api/offers/:id/pin', authenticateToken, requireOffersAdmin, async (req, res) => {
  try {
    const { pinned } = req.body;
    const updated = await db.togglePinOffer(req.params.id, pinned);
    
    if (!updated) {
      return res.status(404).json({ error: 'العرض غير موجود' });
    }

    await db.addLog(pinned ? 'تثبيت عرض' : 'إلغاء تثبيت عرض', `عرض: ${updated.title}`, req.user.username);

    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'حدث خطأ أثناء تعديل حالة التثبيت للعرض' });
  }
});

// 4. File Upload
app.post('/api/upload', authenticateToken, requireCarsAdmin, upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'يرجى اختيار صورة لرفعها' });
  }
  
  // Return the path
  const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
  res.json({ url: fileUrl });
});

// 4.5. Delivery Fees API
app.get('/api/delivery-fees', async (req, res) => {
  try {
    const fees = await db.getDeliveryFees();
    res.json(fees);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'حدث خطأ أثناء جلب أسعار التوصيل بين المناطق' });
  }
});

app.post('/api/delivery-fees', authenticateToken, requireDeliveryAdmin, async (req, res) => {
  try {
    const { from_city, to_city, price } = req.body;
    
    if (!from_city || !to_city || !price) {
      return res.status(400).json({ error: 'يرجى ملء كافة حقول التوصيل' });
    }

    const newFee = await db.createDeliveryFee({ from_city, to_city, price });
    await db.addLog('إضافة سعر توصيل', `تم إضافة مسار توصيل: من ${from_city} إلى ${to_city} بسعر ${price} ريال`, req.user.username);
    res.status(201).json(newFee);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'حدث خطأ أثناء إضافة مسار التوصيل' });
  }
});

app.put('/api/delivery-fees/:id', authenticateToken, requireDeliveryAdmin, async (req, res) => {
  try {
    const { from_city, to_city, price } = req.body;
    const existing = await db.getDeliveryFees();
    const target = existing.find(f => f.id === parseInt(req.params.id));
    
    if (!target) {
      return res.status(404).json({ error: 'مسار التوصيل غير موجود' });
    }

    const updated = await db.updateDeliveryFee(req.params.id, { from_city, to_city, price });
    await db.addLog('تعديل سعر توصيل', `تعديل مسار: ${from_city} -> ${to_city}. السعر (${target.price} -> ${price} ريال)`, req.user.username);
    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'حدث خطأ أثناء تعديل مسار التوصيل' });
  }
});

app.delete('/api/delivery-fees/:id', authenticateToken, requireDeliveryAdmin, async (req, res) => {
  try {
    const existing = await db.getDeliveryFees();
    const target = existing.find(f => f.id === parseInt(req.params.id));
    
    if (!target) {
      return res.status(404).json({ error: 'مسار التوصيل غير موجود' });
    }

    await db.deleteDeliveryFee(req.params.id);
    await db.addLog('حذف سعر توصيل', `تم حذف مسار التوصيل: من ${target.from_city} إلى ${target.to_city}`, req.user.username);
    res.json({ message: 'تم حذف مسار التوصيل بنجاح' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'حدث خطأ أثناء حذف مسار التوصيل' });
  }
});

// --- Circulars Endpoints ---
app.get('/api/circulars', async (req, res) => {
  try {
    const circulars = await db.getCirculars();
    res.json(circulars);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'حدث خطأ أثناء جلب التعميمات' });
  }
});

app.post('/api/circulars', authenticateToken, requireCircularsAdmin, async (req, res) => {
  try {
    const { title, content, end_date, is_permanent } = req.body;
    if (!title || !content) {
      return res.status(400).json({ error: 'العنوان والمحتوى مطلوبان' });
    }
    const circular = await db.createCircular({ title, content, end_date, is_permanent });
    await db.addLog('إضافة تعميم جديد', `تم إضافة تعميم: ${title}`, req.user.username);
    res.status(201).json(circular);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'حدث خطأ أثناء إضافة التعميم' });
  }
});

app.delete('/api/circulars/:id', authenticateToken, requireCircularsAdmin, async (req, res) => {
  try {
    const circulars = await db.getCirculars();
    const target = circulars.find(c => c.id === parseInt(req.params.id));
    if (!target) {
      return res.status(404).json({ error: 'التعميم غير موجود' });
    }
    await db.deleteCircular(req.params.id);
    await db.addLog('حذف تعميم', `تم حذف تعميم: ${target.title}`, req.user.username);
    res.json({ message: 'تم حذف التعميم بنجاح' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'حدث خطأ أثناء حذف التعميم' });
  }
});

// 5. Activity Logs (Admin Only)
app.get('/api/logs', authenticateToken, requireLogsAdmin, async (req, res) => {
  try {
    const logs = await db.getLogs();
    res.json(logs);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'حدث خطأ أثناء جلب سجل العمليات' });
  }
});

// 6. Last Update Check
app.get('/api/last-update', async (req, res) => {
  try {
    const timestamp = await db.getLastUpdate();
    res.json({ lastUpdate: timestamp });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'حدث خطأ أثناء جلب تاريخ التحديث' });
  }
});

app.post('/api/last-update', authenticateToken, requireCarsAdmin, async (req, res) => {
  try {
    const timestamp = await db.updateLastUpdateTimestamp();
    await db.addLog('تحديث يدوي للتاريخ', 'تم تحديث تاريخ آخر تعديل للأسعار يدوياً', req.user.username);
    res.json({ lastUpdate: timestamp });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'حدث خطأ أثناء تحديث التاريخ' });
  }
});


// Start Server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
