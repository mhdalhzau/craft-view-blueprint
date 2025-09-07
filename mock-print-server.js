const express = require('express');
const cors = require('cors');
const app = express();

// Enable CORS for cross-origin requests
app.use(cors());
app.use(express.json());

// Mock print endpoint
app.post('/print', (req, res) => {
  const { text, printer, options } = req.body;
  
  console.log('='.repeat(50));
  console.log('📄 PRINT REQUEST RECEIVED');
  console.log('='.repeat(50));
  console.log('Printer:', printer || 'RPP02N');
  console.log('Options:', JSON.stringify(options, null, 2));
  console.log('\n📝 RECEIPT CONTENT:');
  console.log(text);
  console.log('='.repeat(50));
  
  // Simulate printing delay
  setTimeout(() => {
    res.json({ 
      success: true, 
      message: 'Receipt printed successfully (mock)',
      printer: printer || 'RPP02N',
      timestamp: new Date().toISOString()
    });
  }, 1000);
});

// Mock status endpoint
app.get('/status', (req, res) => {
  res.json({ 
    connected: true, 
    printer: 'RPP02N (mock)',
    status: 'ready',
    paperLevel: 'normal',
    lastPrint: new Date().toISOString()
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', service: 'Mock Print Server' });
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`🖨️  Mock Print Server running on port ${PORT}`);
  console.log(`📍 Endpoints:`);
  console.log(`   POST http://localhost:${PORT}/print`);
  console.log(`   GET  http://localhost:${PORT}/status`);
  console.log(`   GET  http://localhost:${PORT}/health`);
  console.log(`\n✅ Server ready to receive print requests...`);
});