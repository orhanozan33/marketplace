export const CATEGORIES = [
  { id: 'housing', label: 'Konut', labelEn: 'Housing', labelFr: 'Logement', icon: 'Home', color: 'bg-blue-500', emoji: '🏠' },
  { id: 'vehicle', label: 'Araç', labelEn: 'Vehicle', labelFr: 'Véhicule', icon: 'Car', color: 'bg-green-500', emoji: '🚗' },
  { id: 'buysell', label: 'Al & Sat', labelEn: 'Buy & Sell', labelFr: 'Acheter & Vendre', icon: 'ShoppingBag', color: 'bg-orange-500', emoji: '🛍️' },
];

export const PROPERTY_TYPES = [
  { value: 'apartment', label: 'Apartment', labelTr: 'Daire', labelFr: 'Appartement', emoji: '🏢' },
  { value: 'condo', label: 'Condo', labelTr: 'Kondo', labelFr: 'Condominium', emoji: '🏙️' },
  { value: 'house', label: 'House', labelTr: 'Ev', labelFr: 'Maison', emoji: '🏠' },
  { value: 'townhouse', label: 'Townhouse', labelTr: 'Müstakil', labelFr: 'Maison de ville', emoji: '🏘️' },
  { value: 'basement', label: 'Basement Suite', labelTr: 'Bodrum Dairesi', labelFr: 'Appartement au sous-sol', emoji: '🚪' },
  { value: 'room', label: 'Room / Shared', labelTr: 'Oda / Paylaşımlı', labelFr: 'Chambre / Partagé', emoji: '🛏️' },
];

export const BEDROOM_OPTIONS = [
  { value: 'studio', label: 'Studio', labelTr: 'Stüdyo', labelFr: 'Studio' },
  { value: '1', label: '1 Bed', labelTr: '1 Yatak', labelFr: '1 Chambre' },
  { value: '2', label: '2 Bed', labelTr: '2 Yatak', labelFr: '2 Chambres' },
  { value: '3', label: '3 Bed', labelTr: '3 Yatak', labelFr: '3 Chambres' },
  { value: '4', label: '4 Bed', labelTr: '4 Yatak', labelFr: '4 Chambres' },
  { value: '5+', label: '5+ Bed', labelTr: '5+ Yatak', labelFr: '5+ Chambres' },
];

export const BATHROOM_OPTIONS = [
  { value: '1', label: '1 Bath', labelTr: '1 Banyo', labelFr: '1 Salle de bain' },
  { value: '1.5', label: '1.5 Bath', labelTr: '1.5 Banyo', labelFr: '1.5 Salle de bain' },
  { value: '2', label: '2 Bath', labelTr: '2 Banyo', labelFr: '2 Salles de bain' },
  { value: '2.5', label: '2.5 Bath', labelTr: '2.5 Banyo', labelFr: '2.5 Salles de bain' },
  { value: '3+', label: '3+ Bath', labelTr: '3+ Banyo', labelFr: '3+ Salles de bain' },
];

export const VEHICLE_TYPES = [
  { value: 'car', label: 'Car', labelTr: 'Otomobil', labelFr: 'Voiture', emoji: '🚗' },
  { value: 'suv', label: 'SUV', labelTr: 'SUV', labelFr: 'VUS', emoji: '🚙' },
  { value: 'truck', label: 'Truck', labelTr: 'Kamyon', labelFr: 'Camion', emoji: '🛻' },
  { value: 'motorcycle', label: 'Motorcycle', labelTr: 'Motosiklet', labelFr: 'Moto', emoji: '🏍️' },
];

export const VEHICLE_MAKES = [
  'Toyota', 'Honda', 'Ford', 'Chevrolet', 'BMW', 'Mercedes', 'Audi', 
  'Volkswagen', 'Hyundai', 'Kia', 'Mazda', 'Subaru', 'Nissan', 'Jeep', 'Tesla'
];

export const BUYSELL_CATEGORIES = [
  { value: 'electronics', label: 'Electronics', labelTr: 'Elektronik', labelFr: 'Électronique', emoji: '📱' },
  { value: 'furniture', label: 'Furniture', labelTr: 'Mobilya', labelFr: 'Meubles', emoji: '🪑' },
  { value: 'clothing', label: 'Clothing', labelTr: 'Giyim', labelFr: 'Vêtements', emoji: '👕' },
  { value: 'sports', label: 'Sports', labelTr: 'Spor', labelFr: 'Sports', emoji: '⚽' },
  { value: 'books', label: 'Books', labelTr: 'Kitap', labelFr: 'Livres', emoji: '📚' },
  { value: 'other', label: 'Other', labelTr: 'Diğer', labelFr: 'Autre', emoji: '📦' },
];

export const CONDITION_OPTIONS = [
  { value: 'new', label: 'New', labelTr: 'Yeni', labelFr: 'Neuf' },
  { value: 'like-new', label: 'Like New', labelTr: 'Sıfır Gibi', labelFr: 'Comme neuf' },
  { value: 'good', label: 'Good', labelTr: 'İyi', labelFr: 'Bon' },
  { value: 'fair', label: 'Fair', labelTr: 'Orta', labelFr: 'Correct' },
  { value: 'for-parts', label: 'For Parts', labelTr: 'Yedek Parça', labelFr: 'Pour pièces' },
];

export const CANADIAN_PROVINCES = [
  { value: 'all', label: 'Tüm Kanada', labelEn: 'All Canada', labelFr: 'Tout le Canada', lat: 56.1304, lng: -106.3468 },
  { value: 'BC', label: 'British Columbia', labelEn: 'British Columbia', labelFr: 'Colombie-Britannique', lat: 49.2827, lng: -123.1207 },
  { value: 'AB', label: 'Alberta', labelEn: 'Alberta', labelFr: 'Alberta', lat: 51.0447, lng: -114.0719 },
  { value: 'SK', label: 'Saskatchewan', labelEn: 'Saskatchewan', labelFr: 'Saskatchewan', lat: 50.4452, lng: -104.6189 },
  { value: 'MB', label: 'Manitoba', labelEn: 'Manitoba', labelFr: 'Manitoba', lat: 49.8951, lng: -97.1384 },
  { value: 'ON', label: 'Ontario', labelEn: 'Ontario', labelFr: 'Ontario', lat: 43.6532, lng: -79.3832 },
  { value: 'QC', label: 'Quebec', labelEn: 'Quebec', labelFr: 'Québec', lat: 45.5017, lng: -73.5673 },
  { value: 'NB', label: 'New Brunswick', labelEn: 'New Brunswick', labelFr: 'Nouveau-Brunswick', lat: 45.9636, lng: -66.6431 },
  { value: 'NS', label: 'Nova Scotia', labelEn: 'Nova Scotia', labelFr: 'Nouvelle-Écosse', lat: 44.6488, lng: -63.5752 },
  { value: 'PE', label: 'Prince Edward Island', labelEn: 'Prince Edward Island', labelFr: 'Île-du-Prince-Édouard', lat: 46.2382, lng: -63.1311 },
  { value: 'NL', label: 'Newfoundland and Labrador', labelEn: 'Newfoundland and Labrador', labelFr: 'Terre-Neuve-et-Labrador', lat: 47.5615, lng: -52.7126 },
  { value: 'YT', label: 'Yukon', labelEn: 'Yukon', labelFr: 'Yukon', lat: 60.7212, lng: -135.0568 },
  { value: 'NT', label: 'Northwest Territories', labelEn: 'Northwest Territories', labelFr: 'Territoires du Nord-Ouest', lat: 62.4540, lng: -114.3718 },
  { value: 'NU', label: 'Nunavut', labelEn: 'Nunavut', labelFr: 'Nunavut', lat: 63.7467, lng: -68.5170 },
];

// Kanada şehirleri - Eyaletlere göre
export const CANADIAN_CITIES = {
  BC: [
    { value: 'vancouver', label: 'Vancouver', labelTr: 'Vancouver', labelFr: 'Vancouver', lat: 49.2827, lng: -123.1207 },
    { value: 'victoria', label: 'Victoria', labelTr: 'Victoria', labelFr: 'Victoria', lat: 48.4284, lng: -123.3656 },
    { value: 'surrey', label: 'Surrey', labelTr: 'Surrey', labelFr: 'Surrey', lat: 49.1913, lng: -122.8490 },
    { value: 'burnaby', label: 'Burnaby', labelTr: 'Burnaby', labelFr: 'Burnaby', lat: 49.2488, lng: -122.9805 },
    { value: 'richmond', label: 'Richmond', labelTr: 'Richmond', labelFr: 'Richmond', lat: 49.1666, lng: -123.1336 },
  ],
  AB: [
    { value: 'calgary', label: 'Calgary', labelTr: 'Calgary', labelFr: 'Calgary', lat: 51.0447, lng: -114.0719 },
    { value: 'edmonton', label: 'Edmonton', labelTr: 'Edmonton', labelFr: 'Edmonton', lat: 53.5461, lng: -113.4938 },
    { value: 'red-deer', label: 'Red Deer', labelTr: 'Red Deer', labelFr: 'Red Deer', lat: 52.2681, lng: -113.8112 },
    { value: 'lethbridge', label: 'Lethbridge', labelTr: 'Lethbridge', labelFr: 'Lethbridge', lat: 49.6944, lng: -112.8328 },
  ],
  SK: [
    { value: 'saskatoon', label: 'Saskatoon', labelTr: 'Saskatoon', labelFr: 'Saskatoon', lat: 52.1332, lng: -106.6700 },
    { value: 'regina', label: 'Regina', labelTr: 'Regina', labelFr: 'Regina', lat: 50.4452, lng: -104.6189 },
  ],
  MB: [
    { value: 'winnipeg', label: 'Winnipeg', labelTr: 'Winnipeg', labelFr: 'Winnipeg', lat: 49.8951, lng: -97.1384 },
  ],
  ON: [
    { value: 'toronto', label: 'Toronto', labelTr: 'Toronto', labelFr: 'Toronto', lat: 43.6532, lng: -79.3832 },
    { value: 'ottawa', label: 'Ottawa', labelTr: 'Ottawa', labelFr: 'Ottawa', lat: 45.4215, lng: -75.6972 },
    { value: 'mississauga', label: 'Mississauga', labelTr: 'Mississauga', labelFr: 'Mississauga', lat: 43.5890, lng: -79.6441 },
    { value: 'brampton', label: 'Brampton', labelTr: 'Brampton', labelFr: 'Brampton', lat: 43.7315, lng: -79.7624 },
    { value: 'hamilton', label: 'Hamilton', labelTr: 'Hamilton', labelFr: 'Hamilton', lat: 43.2557, lng: -79.8711 },
    { value: 'london', label: 'London', labelTr: 'London', labelFr: 'London', lat: 42.9849, lng: -81.2453 },
    { value: 'kitchener', label: 'Kitchener', labelTr: 'Kitchener', labelFr: 'Kitchener', lat: 43.4516, lng: -80.4925 },
  ],
  QC: [
    { value: 'montreal', label: 'Montreal', labelTr: 'Montreal', labelFr: 'Montréal', lat: 45.5017, lng: -73.5673 },
    { value: 'quebec-city', label: 'Quebec City', labelTr: 'Quebec City', labelFr: 'Québec', lat: 46.8139, lng: -71.2080 },
    { value: 'laval', label: 'Laval', labelTr: 'Laval', labelFr: 'Laval', lat: 45.6067, lng: -73.7123 },
    { value: 'gatineau', label: 'Gatineau', labelTr: 'Gatineau', labelFr: 'Gatineau', lat: 45.4765, lng: -75.7013 },
  ],
  NB: [
    { value: 'moncton', label: 'Moncton', labelTr: 'Moncton', labelFr: 'Moncton', lat: 46.0878, lng: -64.7782 },
    { value: 'saint-john', label: 'Saint John', labelTr: 'Saint John', labelFr: 'Saint-Jean', lat: 45.2733, lng: -66.0633 },
    { value: 'fredericton', label: 'Fredericton', labelTr: 'Fredericton', labelFr: 'Fredericton', lat: 45.9636, lng: -66.6431 },
  ],
  NS: [
    { value: 'halifax', label: 'Halifax', labelTr: 'Halifax', labelFr: 'Halifax', lat: 44.6488, lng: -63.5752 },
  ],
  PE: [
    { value: 'charlottetown', label: 'Charlottetown', labelTr: 'Charlottetown', labelFr: 'Charlottetown', lat: 46.2382, lng: -63.1311 },
  ],
  NL: [
    { value: 'st-johns', label: "St. John's", labelTr: "St. John's", labelFr: "St. John's", lat: 47.5615, lng: -52.7126 },
  ],
  YT: [
    { value: 'whitehorse', label: 'Whitehorse', labelTr: 'Whitehorse', labelFr: 'Whitehorse', lat: 60.7212, lng: -135.0568 },
  ],
  NT: [
    { value: 'yellowknife', label: 'Yellowknife', labelTr: 'Yellowknife', labelFr: 'Yellowknife', lat: 62.4540, lng: -114.3718 },
  ],
  NU: [
    { value: 'iqaluit', label: 'Iqaluit', labelTr: 'Iqaluit', labelFr: 'Iqaluit', lat: 63.7467, lng: -68.5170 },
  ],
};

// Eyalet koordinatlarını almak için helper fonksiyon
export const getProvinceCoordinates = (provinceCode) => {
  const province = CANADIAN_PROVINCES.find(p => p.value === provinceCode);
  if (province) {
    return { lat: province.lat, lng: province.lng, name: province.labelEn };
  }
  return null;
};

// Şehir koordinatlarını almak için helper fonksiyon
export const getCityCoordinates = (provinceCode, cityCode) => {
  const cities = CANADIAN_CITIES[provinceCode];
  if (cities) {
    const city = cities.find(c => c.value === cityCode);
    if (city) {
      return { lat: city.lat, lng: city.lng, name: city.labelEn };
    }
  }
  return null;
};

