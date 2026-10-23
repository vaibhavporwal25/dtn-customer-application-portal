import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import apiRoutes from './routes/api.js';
import { getDatabase } from './db/database.js';
import { seedDatabase } from './scripts/seed.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const app = express();
const PORT = process.env.PORT || 5000;

// Security Middlewares
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' }
}));

// CORS Configuration: explicitly permit the production Netlify deployment, approved previews, and CLIENT_URL
const defaultAllowedOrigins = [
  'https://dtn-india-apply.netlify.app',
  'http://localhost:5173',
  'http://localhost:4173',
  'http://localhost:3000',
  'http://localhost:5000',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:4173',
  'http://127.0.0.1:5000'
];

const envOrigins = (process.env.CLIENT_URL || '')
  .split(',')
  .map((url) => url.trim().replace(/\/+$/, ''))
  .filter(Boolean);

const allowedOriginsSet = new Set([...defaultAllowedOrigins, ...envOrigins]);

app.use(cors({
  origin: (requestOrigin, callback) => {
    // Allow server-to-server, health checkers, or curl requests with no origin header
    if (!requestOrigin) {
      return callback(null, true);
    }
    const cleanOrigin = requestOrigin.replace(/\/+$/, '');

    if (allowedOriginsSet.has(cleanOrigin)) {
      return callback(null, true);
    }

    // Allow Netlify deploy previews for DTN India portal
    if (/^https:\/\/([a-zA-Z0-9-]+--)?dtn-india-apply\.netlify\.app$/.test(cleanOrigin)) {
      return callback(null, true);
    }

    // In local development, allow any localhost port
    if (process.env.NODE_ENV !== 'production' && /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(cleanOrigin)) {
      return callback(null, true);
    }

    callback(new Error(`CORS origin '${requestOrigin}' not allowed`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Logging
app.use(morgan('dev'));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Mount API routes
app.use('/api', apiRoutes);

// Serve static frontend build if available
const clientDistPath = path.resolve(__dirname, '../../client/dist');
import fs from 'fs';
if (fs.existsSync(clientDistPath)) {
  app.use(express.static(clientDistPath));
  app.use((req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    res.sendFile(path.join(clientDistPath, 'index.html'));
  });
}

// Global Error Handler
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('[Server Error]', err);
  const status = err.status || 500;
  res.status(status).json({
    success: false,
    message: err.message || 'Internal server error occurred',
    ...(process.env.NODE_ENV === 'development' ? { stack: err.stack } : {})
  });
});

// Initialize database and start server
async function startServer() {
  try {
    console.log('[Server] Connecting to persistent database...');
    await getDatabase();
    await seedDatabase();

    app.listen(PORT, () => {
      console.log(`========================================================`);
      console.log(` DTN INDIA CUSTOMER APPLICATION PORTAL BACKEND SERVICE `);
      console.log(` Company: Digital Telco Network India Pvt. Ltd.         `);
      console.log(` Running on: http://localhost:${PORT}                  `);
      console.log(` API Endpoint: http://localhost:${PORT}/api/health     `);
      console.log(` Mode: ${process.env.NODE_ENV || 'development'}        `);
      console.log(` Payment Simulation: ${process.env.PAYMENT_MODE || 'simulated'}`);
      console.log(`========================================================`);
    });
  } catch (error) {
    console.error('Fatal error starting server:', error);
    process.exit(1);
  }
}

startServer();
