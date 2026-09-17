import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes.js';
import portalRoutes from './routes/portalRoutes.js';
import whatsappRoutes from './routes/whatsappRoutes.js';
import assistantRoutes from './routes/assistantRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Security & Logging Middleware
app.use(helmet());
app.use(morgan('dev'));
app.use(cors({
  origin: '*',
  credentials: true
}));
app.use(express.json());

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/portal', portalRoutes);
app.use('/api/whatsapp', whatsappRoutes);
app.use('/api/assistant', assistantRoutes);

// Health Check Endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    service: 'Govt Portal Express Backend',
    whatsappIntegration: 'Twilio Sandbox Ready',
    timestamp: new Date().toISOString()
  });
});

// Start Server
app.listen(PORT, () => {
  console.log(`===================================================`);
  console.log(`🏛️ Govt Portal Backend running on port http://localhost:${PORT}`);
  console.log(`📱 WhatsApp Bot Active (Hindi / Marathi / English)`);
  console.log(`===================================================`);
});
