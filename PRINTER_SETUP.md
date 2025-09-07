# Setup Printer Bluetooth RPP02N

## Instruksi Setup Print Server

Untuk menggunakan printer bluetooth RPP02N dengan sistem POS ini, Anda perlu menjalankan Node Print Server di port 3001.

### 1. Install Node Print Server

```bash
npm install -g node-print-server
```

### 2. Setup Printer RPP02N

1. Pastikan printer RPP02N sudah di-pair dengan komputer via Bluetooth
2. Catat nama device printer (biasanya "RPP02N" atau "Bluetooth Printer")

### 3. Konfigurasi Print Server

Buat file `print-server-config.json`:

```json
{
  "port": 3001,
  "printers": {
    "RPP02N": {
      "type": "bluetooth",
      "device": "RPP02N",
      "encoding": "UTF8",
      "paperWidth": 48
    }
  }
}
```

### 4. Jalankan Print Server

```bash
node-print-server --config print-server-config.json
```

Atau gunakan mock server untuk testing:

```bash
node mock-print-server.js
```

### 5. API Endpoints

Print server akan menyediakan endpoint:

- `POST /print` - Print text ke printer
- `GET /status` - Cek status printer

### Format Request Print

```json
{
  "text": "Content struk untuk dicetak...",
  "printer": "RPP02N",
  "options": {
    "characterSet": "UTF8",
    "fontSize": "small",
    "alignment": "left"
  }
}
```

### Mock Server untuk Testing

Jika printer belum tersedia, gunakan mock server di `mock-print-server.js` yang akan mensimulasikan print berhasil.

```javascript
const express = require('express');
const app = express();

app.use(express.json());

app.post('/print', (req, res) => {
  console.log('Print Request:', req.body);
  res.json({ success: true, message: 'Receipt printed successfully (mock)' });
});

app.get('/status', (req, res) => {
  res.json({ connected: true, printer: 'RPP02N (mock)' });
});

app.listen(3001, () => {
  console.log('Mock Print Server running on port 3001');
});
```