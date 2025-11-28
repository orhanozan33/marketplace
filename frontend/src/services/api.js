// Backend API servisleri

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// Token'ı localStorage'dan al
const getToken = () => {
  return localStorage.getItem('auth_token');
};

// API isteği yap
const apiRequest = async (endpoint, options = {}) => {
  const token = getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    console.log('🌐 API İsteği:', `${API_URL}${endpoint}`, options);
    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
    });
    console.log('📥 API Yanıtı:', response.status, response.statusText);

    // Response'u text olarak al (JSON parse hatası için)
    const text = await response.text();
    let data;
    
    try {
      data = JSON.parse(text);
    } catch (e) {
      console.error('JSON parse hatası:', text);
      throw new Error(`Sunucu hatası: ${text.substring(0, 100)}`);
    }

    if (!response.ok) {
      // Eğer data bir obje değilse veya error property'si yoksa
      const errorMessage = (data && typeof data === 'object' && data.error) 
        ? data.error 
        : `HTTP ${response.status}: ${response.statusText}`;
      throw new Error(errorMessage);
    }

    // Eğer data undefined veya null ise, endpoint'e göre farklı davran
    // Reklam endpoint'leri için boş array döndür
    if (data === undefined || data === null) {
      // Eğer endpoint advertisements ise boş array döndür
      if (endpoint.includes('advertisements')) {
        return [];
      }
      return null;
    }

    // Eğer data bir array değilse ve advertisements endpoint'i ise boş array döndür
    if (endpoint.includes('advertisements') && !Array.isArray(data)) {
      console.warn('⚠️ Advertisements endpoint returned non-array, returning empty array');
      return [];
    }

    return data;
  } catch (error) {
    console.error('API Request Error:', error);
    throw error;
  }
};

// ==================== AUTH ====================

export const register = async (email, password, displayName, phone, postalCode) => {
  const result = await apiRequest('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify({ email, password, displayName, phone, postalCode }),
  });
  
  if (result.token) {
    localStorage.setItem('auth_token', result.token);
    localStorage.setItem('user', JSON.stringify(result.user));
  }
  
  return result;
};

export const login = async (email, password) => {
  const result = await apiRequest('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  
  if (result.token) {
    localStorage.setItem('auth_token', result.token);
    localStorage.setItem('user', JSON.stringify(result.user));
  }
  
  return result;
};

export const logout = () => {
  localStorage.removeItem('auth_token');
  localStorage.removeItem('user');
};

export const getCurrentUser = () => {
  const userStr = localStorage.getItem('user');
  return userStr ? JSON.parse(userStr) : null;
};

export const getCurrentUserProfile = async () => {
  try {
    const result = await apiRequest('/api/auth/me');
    return result.user;
  } catch (error) {
    return null;
  }
};

// ==================== LISTINGS ====================

export const fetchListings = async (category = null, includeSold = false) => {
  const params = new URLSearchParams();
  if (category) params.append('category', category);
  if (includeSold) params.append('includeSold', 'true');
  const queryString = params.toString();
  return apiRequest(`/api/listings${queryString ? `?${queryString}` : ''}`);
};

export const getListing = async (id) => {
  return apiRequest(`/api/listings/${id}`);
};

export const createListing = async (listingData) => {
  return apiRequest('/api/listings', {
    method: 'POST',
    body: JSON.stringify(listingData),
  });
};

export const updateListing = async (id, listingData) => {
  try {
    const result = await apiRequest(`/api/listings/${id}`, {
      method: 'PUT',
      body: JSON.stringify(listingData),
    });
    return result;
  } catch (error) {
    console.error('updateListing error:', error);
    throw error;
  }
};

export const deleteListing = async (id) => {
  try {
    const result = await apiRequest(`/api/listings/${id}`, {
      method: 'DELETE',
    });
    return result;
  } catch (error) {
    console.error('deleteListing error:', error);
    throw error;
  }
};

// ==================== MESSAGES ====================

export const sendMessage = async (listingId, receiverId, message) => {
  return apiRequest('/api/messages', {
    method: 'POST',
    body: JSON.stringify({ listingId, receiverId, message }),
  });
};

export const getMessages = async (listingId, otherUserId) => {
  const params = new URLSearchParams({ listingId, otherUserId });
  return apiRequest(`/api/messages?${params}`);
};

export const getUserConversations = async () => {
  return apiRequest('/api/conversations');
};

export const deleteMessage = async (messageId) => {
  return apiRequest(`/api/messages/${messageId}`, {
    method: 'DELETE',
  });
};

export const deleteConversation = async (otherUserId, listingId) => {
  return apiRequest(`/api/conversations?otherUserId=${otherUserId}&listingId=${listingId}`, {
    method: 'DELETE',
  });
};

export const markMessageAsRead = async (messageId) => {
  return apiRequest(`/api/messages/${messageId}/read`, {
    method: 'PUT',
  });
};

// ==================== ADMIN USERS ====================

export const getAllUsers = async () => {
  return apiRequest('/api/users');
};

export const deleteUser = async (userId) => {
  return apiRequest(`/api/users/${userId}`, {
    method: 'DELETE',
  });
};

export const toggleUserStatus = async (userId, isBanned) => {
  return apiRequest(`/api/users/${userId}/status`, {
    method: 'PUT',
    body: JSON.stringify({ isBanned }),
  });
};

export const updateUserRole = async (userId, role) => {
  return apiRequest(`/api/users/${userId}/role`, {
    method: 'PUT',
    body: JSON.stringify({ role }),
  });
};

// Kullanıcı profil güncelleme
export const updateUserProfile = async (userId, profileData, photoFile = null) => {
  console.log('🔧 updateUserProfile çağrıldı:', { userId, photoFile: photoFile ? 'VAR' : 'YOK', profileData });
  
  if (photoFile) {
    console.log('📸 Resim dosyası var, FormData ile gönderiliyor');
    console.log('📸 photoFile tipi:', typeof photoFile);
    console.log('📸 photoFile instanceof File:', photoFile instanceof File);
    console.log('📸 photoFile.name:', photoFile.name);
    console.log('📸 photoFile.size:', photoFile.size);
    console.log('📸 photoFile.type:', photoFile.type);
    
    // FormData ile resim yükle
    const formData = new FormData();
    formData.append('photo', photoFile);
    formData.append('displayName', profileData.displayName || '');
    formData.append('email', profileData.email || '');
    formData.append('phone', profileData.phone || '');
    formData.append('postalCode', profileData.postalCode || '');
    formData.append('address', profileData.address || '');
    formData.append('showPhone', profileData.showPhone ? 'true' : 'false');
    formData.append('showAddress', profileData.showAddress ? 'true' : 'false');
    
    // FormData içeriğini kontrol et
    console.log('📦 FormData entries:');
    for (const [key, value] of formData.entries()) {
      if (value instanceof File) {
        console.log(`   ${key}: File(${value.name}, ${value.size} bytes, ${value.type})`);
      } else {
        console.log(`   ${key}: ${value}`);
      }
    }
    
    const token = getToken();
    const headers = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    // FormData gönderildiğinde Content-Type'ı fetch otomatik ayarlar (boundary ile)
    // Bu yüzden Content-Type header'ını eklemiyoruz
    
    console.log('🌐 Fetch isteği gönderiliyor...');
    console.log('🌐 URL:', `${API_URL}/api/users/${userId}/profile`);
    console.log('🌐 Method: PUT');
    console.log('🌐 Headers:', headers);
    console.log('🌐 Body (FormData):', formData);
    
    const response = await fetch(`${API_URL}/api/users/${userId}/profile`, {
      method: 'PUT',
      headers,
      body: formData,
    });
    
    console.log('📥 Response alındı:', response.status, response.statusText);
    console.log('📥 Response URL:', response.url);
    console.log('📥 Response headers:', Object.fromEntries(response.headers.entries()));
    
    const text = await response.text();
    let data;
    try {
      data = JSON.parse(text);
      console.log('📥 Backend\'den dönen profil güncelleme response:', data);
      console.log('📥 photoURL:', data?.photoURL);
    } catch (e) {
      console.error('❌ JSON parse hatası:', text);
      throw new Error(`Sunucu hatası: ${text.substring(0, 100)}`);
    }
    
    if (!response.ok) {
      throw new Error(data.error || 'Profil güncellenemedi');
    }
    
    return data;
  } else {
    // Normal JSON isteği - ama adres de gönderilmeli
    const requestData = {
      displayName: profileData.displayName || '',
      email: profileData.email || '',
      phone: profileData.phone || '',
      postalCode: profileData.postalCode || '',
      address: profileData.address || '',
      showPhone: profileData.showPhone !== undefined ? profileData.showPhone : true,
      showAddress: profileData.showAddress !== undefined ? profileData.showAddress : true
    };
    return apiRequest(`/api/users/${userId}/profile`, {
      method: 'PUT',
      body: JSON.stringify(requestData),
    });
  }
};

export const createUserAdmin = async (email, password, displayName, role = 'user') => {
  return apiRequest('/api/users', {
    method: 'POST',
    body: JSON.stringify({ email, password, displayName, role }),
  });
};

// ==================== ADMIN STATISTICS ====================

export const getAdminStatistics = async () => {
  return apiRequest('/api/admin/statistics');
};

export const getUserMessages = async (userId) => {
  return apiRequest(`/api/admin/user/${userId}/messages`);
};

// Kullanıcı bilgilerini getir
export const getUserById = async (userId) => {
  return apiRequest(`/api/users/${userId}`);
};

export const getAllMessagesAdmin = async () => {
  return apiRequest('/api/admin/messages');
};

export const deleteMessageAdmin = async (messageId) => {
  return apiRequest(`/api/admin/messages/${messageId}`, {
    method: 'DELETE',
  });
};

// ==================== ADVERTISEMENTS ====================

export const getAdvertisements = async () => {
  return apiRequest('/api/advertisements');
};

export const getAllAdvertisements = async () => {
  return apiRequest('/api/admin/advertisements');
};

export const createAdvertisement = async (formData) => {
  const token = getToken();
  const headers = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  return fetch(`${API_URL}/api/admin/advertisements`, {
    method: 'POST',
    headers,
    body: formData,
  }).then(res => res.json());
};

export const updateAdvertisement = async (id, formData) => {
  const token = getToken();
  const headers = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  return fetch(`${API_URL}/api/admin/advertisements/${id}`, {
    method: 'PUT',
    headers,
    body: formData,
  }).then(res => res.json());
};

export const deleteAdvertisement = async (id) => {
  return apiRequest(`/api/admin/advertisements/${id}`, {
    method: 'DELETE',
  });
};

// ==================== IMAGE UPLOAD ====================

export const uploadImage = async (file, folder = 'listings') => {
  const formData = new FormData();
  formData.append('image', file);
  formData.append('folder', folder);

  const token = getToken();
  const headers = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}/api/upload`, {
    method: 'POST',
    headers,
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Bilinmeyen hata' }));
    throw new Error(error.error || `HTTP ${response.status}: ${response.statusText}`);
  }

  const data = await response.json();
  return data.fullUrl || `${API_URL}${data.url}`;
};

// User Ratings & Comments
export const getUserRatings = async (userId) => {
  const response = await apiRequest(`/api/users/${userId}/ratings`, {
    method: 'GET'
  });
  return response;
};

export const createUserRating = async (userId, rating) => {
  const response = await apiRequest(`/api/users/${userId}/ratings`, {
    method: 'POST',
    body: JSON.stringify({ rating })
  });
  return response;
};

export const getUserComments = async (userId) => {
  const response = await apiRequest(`/api/users/${userId}/comments`, {
    method: 'GET'
  });
  return response;
};

export const createUserComment = async (userId, comment, rating = 0) => {
  const response = await apiRequest(`/api/users/${userId}/comments`, {
    method: 'POST',
    body: JSON.stringify({ comment, rating })
  });
  return response;
};

// Listing Reservations & Sales
export const reserveListing = async (listingId, hours, sellerId) => {
  const response = await apiRequest(`/api/listings/${listingId}/reserve`, {
    method: 'POST',
    body: JSON.stringify({ hours, sellerId })
  });
  return response;
};

export const getListingReservation = async (listingId) => {
  const response = await apiRequest(`/api/listings/${listingId}/reservation`, {
    method: 'GET'
  });
  return response;
};

export const getListingSale = async (listingId) => {
  try {
    const response = await apiRequest(`/api/listings/${listingId}/sale`, {
      method: 'GET'
    });
    return response;
  } catch (error) {
    // 404 hatası satış yok demektir, null döndür
    if (error.message && error.message.includes('404')) {
      return null;
    }
    console.error('getListingSale error:', error);
    return null;
  }
};

export const markListingAsSold = async (listingId, buyerId) => {
  const response = await apiRequest(`/api/listings/${listingId}/sold`, {
    method: 'POST',
    body: JSON.stringify({ buyerId })
  });
  return response;
};

export const cancelReservation = async (listingId) => {
  const response = await apiRequest(`/api/listings/${listingId}/reservation/cancel`, {
    method: 'POST'
  });
  return response;
};

export const uploadImages = async (files, folder = 'listings') => {
  const formData = new FormData();
  files.forEach((file) => {
    formData.append('images', file);
  });
  // Folder parametresini sadece 'listings' olarak gönder (userId klasörü olmadan)
  formData.append('folder', 'listings');

  const token = getToken();
  const headers = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}/api/upload/multiple`, {
    method: 'POST',
    headers,
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Bilinmeyen hata' }));
    throw new Error(error.error || `HTTP ${response.status}: ${response.statusText}`);
  }

  const data = await response.json();
  return data.files.map(file => file.fullUrl || `${API_URL}${file.url}`);
};

// ==================== NOTIFICATIONS ====================

export const getNotifications = async () => {
  return apiRequest('/api/notifications');
};

export const markNotificationAsRead = async (notificationId) => {
  return apiRequest(`/api/notifications/${notificationId}/read`, {
    method: 'PUT',
  });
};
