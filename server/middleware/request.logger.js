// Request logger middleware
export const requestLogger = (req, res, next) => {
  // Profil güncelleme isteklerini özellikle logla
  if (req.url.includes('/api/users/') && req.url.includes('/profile') && req.method === 'PUT') {
    console.log('');
    console.log('🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨');
    console.log('🚨🚨🚨 PROFİL GÜNCELLEME İSTEĞİ GLOBAL MIDDLEWARE\'DE! 🚨🚨🚨');
    console.log('🚨 Method:', req.method);
    console.log('🚨 URL:', req.url);
    console.log('🚨 Original URL:', req.originalUrl);
    console.log('🚨 Path:', req.path);
    console.log('🚨 Content-Type:', req.get('Content-Type'));
    console.log('🚨 Headers:', JSON.stringify(req.headers, null, 2));
    console.log('🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨');
    console.log('');
  }
  // Kullanıcı profil isteklerini özellikle logla
  if (req.url.match(/^\/api\/users\/[^\/]+$/) && req.method === 'GET' && !req.url.includes('/profile')) {
    console.log('');
    console.log('👤👤👤 KULLANICI PROFİL İSTEĞİ GLOBAL MIDDLEWARE\'DE! 👤👤👤');
    console.log('👤 Method:', req.method);
    console.log('👤 URL:', req.url);
    console.log('👤 Original URL:', req.originalUrl);
    console.log('👤 Path:', req.path);
    console.log('');
  }
  console.log('🌐 İstek alındı:', req.method, req.url);
  console.log('🌐 Content-Type:', req.get('Content-Type'));
  console.log('🌐 User-Agent:', req.get('User-Agent')?.substring(0, 50));
  next();
};


