import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { StorageService } from './storage';

import dotenv from 'dotenv';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });
const app = express();
const port = process.env.PORT || 3001;

// Configure multer for file uploads
const upload = multer({ dest: 'uploads/' });
const storageService = new StorageService();

// Create upload directory if it doesn't exist
if (!fs.existsSync('uploads')) {
  fs.mkdirSync('uploads');
}

// Upload endpoint
app.post('/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      res.status(400).json({ error: 'No file provided' });
      return;
    }

    const result = await storageService.uploadFile(req.file.path);
    
    // Clean up temporary file
    fs.unlinkSync(req.file.path);
    
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Download endpoint
app.get('/download/:rootHash', async (req, res) => {
  try {
    const { rootHash } = req.params;
    const outputPath = path.join('downloads', rootHash);
    
    // Create downloads directory if it doesn't exist
    if (!fs.existsSync('downloads')) {
      fs.mkdirSync('downloads');
    }
    
    await storageService.downloadFile(rootHash, outputPath);
    
    // Set appropriate headers
    res.download(outputPath, (err) => {
      if (err) {
        res.status(500).json({ error: 'Failed to send file' });
        return;
      }
      
      // Clean up downloaded file after download completes
      fs.unlinkSync(outputPath);
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Key-value store endpoints
app.post('/kv', express.json(), async (req, res) => {
  try {
    const { key, value } = req.body;
    if (!key || value === undefined) {
      res.status(400).json({ error: 'Key and value are required' });
      return;
    }
    
    await storageService.storeKeyValue(key, value);
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Fixed route handler for getting key-value pairs
app.get('/kv/:key', async (req, res) => {
  try {
    const { key } = req.params;
    const value = await storageService.retrieveKeyValue(key);
    
    if (value === null) {
      res.status(404).json({ error: 'Key not found' });
      return;
    }
    
    res.json({ key, value });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(port, () => {
  console.log(`0G Storage service running at http://localhost:${port}`);
});
