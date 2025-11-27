// Kendi sunucumuzda resim yükleme servisi

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

/**
 * Tek resim yükleme
 */
export const uploadImageToServer = async (file, folder = 'listings') => {
  try {
    const formData = new FormData();
    formData.append('image', file);
    formData.append('folder', folder);

    const response = await fetch(`${API_URL}/api/upload`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Bilinmeyen hata' }));
      throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    
    // Full URL döndür (eğer relative URL ise API_URL ile birleştir)
    if (data.url && !data.url.startsWith('http')) {
      return `${API_URL}${data.url}`;
    }
    
    return data.fullUrl || data.url;
  } catch (error) {
    console.error('Server upload error:', error);
    throw new Error(`Resim yüklenemedi: ${error.message}`);
  }
};

/**
 * Birden fazla resim yükleme
 */
export const uploadImagesToServer = async (files, folder = 'listings') => {
  try {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append('images', file);
    });
    formData.append('folder', folder);

    const response = await fetch(`${API_URL}/api/upload/multiple`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Bilinmeyen hata' }));
      throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    
    // Full URL'leri döndür
    return data.files.map(file => {
      if (file.url && !file.url.startsWith('http')) {
        return `${API_URL}${file.url}`;
      }
      return file.fullUrl || file.url;
    });
  } catch (error) {
    console.error('Server upload error:', error);
    throw new Error(`Resimler yüklenemedi: ${error.message}`);
  }
};

/**
 * Resim silme
 */
export const deleteImageFromServer = async (imageUrl) => {
  try {
    // URL'den folder ve filename çıkar
    const url = new URL(imageUrl);
    const pathParts = url.pathname.split('/');
    const folder = pathParts[pathParts.length - 2];
    const filename = pathParts[pathParts.length - 1];

    const response = await fetch(`${API_URL}/api/upload/${folder}/${filename}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Bilinmeyen hata' }));
      throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
    }

    return true;
  } catch (error) {
    console.error('Server delete error:', error);
    throw new Error(`Resim silinemedi: ${error.message}`);
  }
};

/**
 * Health check
 */
export const checkServerHealth = async () => {
  try {
    const response = await fetch(`${API_URL}/api/health`);
    if (response.ok) {
      const data = await response.json();
      return data.status === 'ok';
    }
    return false;
  } catch (error) {
    console.error('Server health check failed:', error);
    return false;
  }
};

