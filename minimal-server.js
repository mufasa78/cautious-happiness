// Minimal Express server for Railway deployment
import express from 'express';
import cors from 'cors';

// Create Express app
const app = express();

// Configure CORS
app.use(cors({ origin: '*' }));
app.use(express.json());

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Minimal API is running',
    env: process.env.NODE_ENV || 'development'
  });
});

// Login endpoint (mock)
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;

  // Mock authentication
  if (username === 'Mufasa' && password === '$Paxful90210') {
    res.json({
      user: {
        id: 1,
        username: 'Mufasa',
        userType: 'admin'
      },
      token: 'mock-jwt-token-for-testing'
    });
  } else {
    res.status(401).json({ error: 'Invalid credentials' });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    environment: process.env.NODE_ENV || 'development'
  });
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Minimal server running on port ${PORT}`);
});
