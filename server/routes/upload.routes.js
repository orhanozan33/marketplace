import express from 'express';
import path from 'path';
import fs from 'fs';
import { upload } from '../middleware/multer.config.js';
import { uploadsDir } from '../middleware/multer.config.js';

const router = express.Router();

// Tek resim yükleme
router.post('/', upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Dosya yüklenmedi' });
    }

    let folder = req.body.folder || 'listings';
    if (folder.includes('/')) {
      folder = folder.split('/')[0];
    }

    const fileUrl = `/uploads/${folder}/${req.file.filename}`;
    const fullUrl = `${req.protocol}://${req.get('host')}${fileUrl}`;

    res.json({
      success: true,
      url: fileUrl,
      fullUrl: fullUrl,
      filename: req.file.filename,
      size: req.file.size,
      mimetype: req.file.mimetype
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: error.message || 'Resim yüklenirken hata oluştu' });
  }
});

// Çoklu resim yükleme
router.post('/multiple', upload.array('images', 10), (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'Dosya yüklenmedi' });
    }

    let folder = req.body.folder || 'listings';
    if (folder.includes('/')) {
      folder = folder.split('/')[0];
    }

    const files = req.files.map(file => {
      const fileUrl = `/uploads/${folder}/${file.filename}`;
      const fullUrl = `${req.protocol}://${req.get('host')}${fileUrl}`;
      
      return {
        url: fileUrl,
        fullUrl: fullUrl,
        filename: file.filename,
        size: file.size,
        mimetype: file.mimetype
      };
    });

    res.json({
      success: true,
      files: files,
      count: files.length
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: error.message || 'Resimler yüklenirken hata oluştu' });
  }
});

// Resim silme
router.delete('/:folder/:filename', (req, res) => {
  try {
    const { folder, filename } = req.params;
    const filePath = path.join(uploadsDir, folder, filename);

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      res.json({ success: true, message: 'Dosya silindi' });
    } else {
      res.status(404).json({ error: 'Dosya bulunamadı' });
    }
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({ error: error.message || 'Dosya silinirken hata oluştu' });
  }
});

export default router;


