import express from 'express';

// JSON ve form data desteği
// ÖNEMLİ: express.json() ve urlencoded() multer ile çakışabilir
const jsonMiddleware = express.json();
const urlencodedMiddleware = express.urlencoded({ extended: true });

export const jsonHandler = (req, res, next) => {
  const contentType = req.get('Content-Type') || '';
  
  // Profil güncelleme endpoint'i için json/urlencoded kullanma
  if (req.url.includes('/api/users/') && req.url.includes('/profile') && req.method === 'PUT') {
    console.log('⏭️ Profil güncelleme endpoint - json/urlencoded atlanıyor');
    console.log('🔍 URL:', req.url);
    console.log('🔍 Method:', req.method);
    console.log('🔍 Content-Type:', contentType);
    return next();
  }
  
  if (contentType.includes('multipart/form-data')) {
    console.log('⏭️ Multipart istek - json/urlencoded atlanıyor');
    return next();
  }
  
  if (contentType.includes('application/json')) {
    return jsonMiddleware(req, res, next);
  }
  
  if (contentType.includes('application/x-www-form-urlencoded')) {
    return urlencodedMiddleware(req, res, next);
  }
  
  // Content-Type yoksa veya başka bir şeyse, json dene
  jsonMiddleware(req, res, next);
};

export { jsonMiddleware };


