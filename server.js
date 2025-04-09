// This is a simplified entry point for Railway deployment
import dotenv from 'dotenv';
import { app } from './server/index.js';

// Set the port
const PORT = process.env.PORT || 3000;

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
});
