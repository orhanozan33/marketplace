// Ücretsiz alternatif resim yükleme servisleri

/**
 * ImgBB API ile resim yükleme (Ücretsiz)
 * API Key: https://api.imgbb.com/ adresinden alabilirsiniz
 */
export const uploadImageToImgBB = async (file) => {
  const API_KEY = import.meta.env.VITE_IMGBB_API_KEY || 'your-imgbb-api-key';
  
  if (API_KEY === 'your-imgbb-api-key') {
    throw new Error('ImgBB API Key bulunamadı. .env dosyasına VITE_IMGBB_API_KEY ekleyin veya https://api.imgbb.com/ adresinden ücretsiz API key alın.');
  }

  try {
    const formData = new FormData();
    formData.append('image', file);
    formData.append('key', API_KEY);

    const response = await fetch('https://api.imgbb.com/1/upload', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`ImgBB API hatası: ${response.statusText}`);
    }

    const data = await response.json();
    
    if (data.success) {
      return data.data.url; // Resim URL'si
    } else {
      throw new Error(data.error?.message || 'Resim yüklenemedi');
    }
  } catch (error) {
    console.error('ImgBB upload error:', error);
    throw error;
  }
};

/**
 * Cloudinary ile resim yükleme (Ücretsiz plan)
 * Cloudinary ücretsiz hesap: https://cloudinary.com/
 */
export const uploadImageToCloudinary = async (file) => {
  const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
  const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

  if (!CLOUD_NAME || !UPLOAD_PRESET) {
    throw new Error('Cloudinary yapılandırması eksik. .env dosyasına VITE_CLOUDINARY_CLOUD_NAME ve VITE_CLOUDINARY_UPLOAD_PRESET ekleyin.');
  }

  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', UPLOAD_PRESET);

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
      {
        method: 'POST',
        body: formData,
      }
    );

    if (!response.ok) {
      throw new Error(`Cloudinary API hatası: ${response.statusText}`);
    }

    const data = await response.json();
    return data.secure_url; // Resim URL'si
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    throw error;
  }
};

/**
 * Base64 encoding ile resimleri Firestore'da saklama (Geçici çözüm)
 * ⚠️ UYARI: Bu yöntem Firestore doküman boyutunu artırır (1MB limit)
 */
export const convertImageToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
};

/**
 * Birden fazla resmi yükle (ImgBB kullanarak)
 */
export const uploadImagesToImgBB = async (files) => {
  try {
    const uploadPromises = files.map(file => uploadImageToImgBB(file));
    const urls = await Promise.all(uploadPromises);
    return urls;
  } catch (error) {
    console.error('Error uploading images to ImgBB:', error);
    throw error;
  }
};

/**
 * Birden fazla resmi yükle (Cloudinary kullanarak)
 */
export const uploadImagesToCloudinary = async (files) => {
  try {
    const uploadPromises = files.map(file => uploadImageToCloudinary(file));
    const urls = await Promise.all(uploadPromises);
    return urls;
  } catch (error) {
    console.error('Error uploading images to Cloudinary:', error);
    throw error;
  }
};

/**
 * Otomatik fallback ile resim yükleme
 * Önce ImgBB dener, başarısız olursa Cloudinary, o da başarısız olursa Base64
 */
export const uploadImageWithFallback = async (file) => {
  // Önce ImgBB dene
  try {
    if (import.meta.env.VITE_IMGBB_API_KEY) {
      return await uploadImageToImgBB(file);
    }
  } catch (error) {
    console.warn('ImgBB upload failed, trying Cloudinary...', error);
  }

  // Cloudinary dene
  try {
    if (import.meta.env.VITE_CLOUDINARY_CLOUD_NAME) {
      return await uploadImageToCloudinary(file);
    }
  } catch (error) {
    console.warn('Cloudinary upload failed, using Base64...', error);
  }

  // Son çare: Base64 (Firestore'da sakla)
  console.warn('⚠️ Using Base64 encoding as fallback. This is not recommended for production.');
  return await convertImageToBase64(file);
};

