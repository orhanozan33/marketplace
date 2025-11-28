import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Uploads klasörünü oluştur
const uploadsDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Alt klasörler oluştur
const listingsDir = path.join(uploadsDir, 'listings');
if (!fs.existsSync(listingsDir)) {
  fs.mkdirSync(listingsDir, { recursive: true });
}

const advertisementsDir = path.join(uploadsDir, 'advertisements');
if (!fs.existsSync(advertisementsDir)) {
  fs.mkdirSync(advertisementsDir, { recursive: true });
}

const profilesDir = path.join(uploadsDir, 'profiles');
if (!fs.existsSync(profilesDir)) {
  fs.mkdirSync(profilesDir, { recursive: true });
}

// Multer yapılandırması - Genel
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let folder = 'listings'; // Varsayılan
    
    if (req.body && req.body.folder) {
      folder = req.body.folder;
    } else if (req.query && req.query.folder) {
      folder = req.query.folder;
    }
    
    const folderPath = path.join(uploadsDir, folder);
    
    if (!fs.existsSync(folderPath)) {
      fs.mkdirSync(folderPath, { recursive: true });
    }
    
    console.log(`📁 Multer destination: ${folderPath} (folder: ${folder})`);
    cb(null, folderPath);
  },
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    const sanitizedName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
    const ext = path.extname(sanitizedName);
    const name = path.basename(sanitizedName, ext);
    const uniqueName = `${timestamp}_${name}${ext}`;
    cb(null, uniqueName);
  }
});

// Dosya filtreleme (sadece resimler)
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Sadece resim dosyaları yüklenebilir (JPEG, PNG, GIF, WEBP)'));
  }
};

// Multer middleware - Genel
export const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
  fileFilter: fileFilter
});

// Multer middleware - Profil resmi
export const uploadProfile = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      console.log('📁 Profile directory path:', profilesDir);
      console.log('📁 Profile directory exists?', fs.existsSync(profilesDir));
      
      if (!fs.existsSync(profilesDir)) {
        console.log('📁 Creating profile directory...');
        fs.mkdirSync(profilesDir, { recursive: true });
        console.log('✅ Profile directory created:', profilesDir);
      }
      
      try {
        fs.accessSync(profilesDir, fs.constants.W_OK);
        console.log('✅ Profile directory is writable');
      } catch (err) {
        console.error('❌ Profile directory is NOT writable:', err);
      }
      
      cb(null, profilesDir);
    },
    filename: (req, file, cb) => {
      const timestamp = Date.now();
      const sanitizedName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
      const filename = `${timestamp}_${sanitizedName}`;
      console.log('📝 Generated filename:', filename);
      cb(null, filename);
    }
  }),
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (extname && mimetype) {
      cb(null, true);
    } else {
      cb(new Error('Sadece resim dosyaları yüklenebilir!'));
    }
  },
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB
});

// Multer middleware - Reklamlar
export const uploadAd = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      const folderPath = path.join(uploadsDir, 'advertisements');
      if (!fs.existsSync(folderPath)) {
        fs.mkdirSync(folderPath, { recursive: true });
      }
      console.log(`📁 Reklam dosyası kaydediliyor: ${folderPath}`);
      cb(null, folderPath);
    },
    filename: (req, file, cb) => {
      const timestamp = Date.now();
      const sanitizedName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
      const ext = path.extname(sanitizedName);
      const name = path.basename(sanitizedName, ext);
      const uniqueName = `${timestamp}_${name}${ext}`;
      console.log(`📝 Reklam dosya adı: ${uniqueName}`);
      cb(null, uniqueName);
    }
  }),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Sadece resim dosyaları yüklenebilir (JPEG, PNG, GIF, WEBP)'));
    }
  }
});

// Multer error handler
export const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    console.error('❌ Multer hatası:', err.message);
    return res.status(400).json({ error: `Dosya yükleme hatası: ${err.message}` });
  } else if (err) {
    console.error('❌ Dosya yükleme hatası:', err.message);
    return res.status(400).json({ error: err.message || 'Dosya yüklenemedi' });
  }
  next();
};

export { uploadsDir };


