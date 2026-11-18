import dotenv from 'dotenv';
dotenv.config();

import app from './app.js';
import { connectDB } from './config/db.js';

const PORT = process.env.PORT || 5000;

// Connect to MongoDB and then start listening
connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`=========================================`);
      console.log(`🚀 EasyBuy Backend running on port ${PORT}`);
      console.log(`📡 API URL: http://localhost:${PORT}/api`);
      console.log(`🛡️  Admin Portal Demo Credentials:`);
      console.log(`   Email: admin@gmail.com | Password: 123456`);
      console.log(`=========================================`);
    });
  })
  .catch((err) => {
    console.error('Failed to start server:', err);
    process.exit(1);
  });
