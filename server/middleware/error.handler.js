import multer from 'multer';

// Hata yakalama middleware
export const errorHandler = (error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'Dosya boyutu çok büyük. Maksimum 10MB.' });
    }
    console.error('❌ Multer hatası:', error);
    return res.status(400).json({ error: `Dosya yükleme hatası: ${error.message}` });
  }
  
  console.error('❌ Sunucu hatası:', error);
  res.status(500).json({ error: error.message || 'Sunucu hatası' });
};


