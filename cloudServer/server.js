const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to parse JSON requests
app.use(express.json());

// A simple test route
app.get('/', (req, res) => {
  res.json({
    message: 'Your Note Sync Server is running! 🚀',
    timestamp: new Date().toISOString(),
    endpoints: {
      health: '/health',
      api: '/api'
    }
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', serverTime: new Date().toISOString() });
});

// A placeholder for your future sync API
app.post('/api/sync', (req, res) => {
  console.log('Received sync data:', req.body);
  // This is where your sync logic will go later
  res.json({
    status: 'received',
    message: 'Sync endpoint - ready for your implementation',
    receivedAt: new Date().toISOString()
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});