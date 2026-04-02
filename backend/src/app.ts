import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import connectDB from './config/database.mongo';
import { seedDatabase } from './seeders/seedDatabaseFixed';
import authRoutes from './routes/authRoutes';
import placeRoutes from './routes/placeRoutes';
import favoriteRoutes from './routes/favoriteRoutes';
import bookingRoutes from './routes/bookingRoutes';
import chatRoutes from './routes/chatRoutes';
import itineraryRoutes from './routes/itineraryRoutes';
import travelAssistantRoutes from './routes/travelAssistantRoutes';
import adminRoutes from './routes/adminRoutes';

dotenv.config();

process.on('uncaughtException', (err: any) => {
  console.error('❌ Uncaught exception:', err && (err.stack || err));
  process.exit(1);
});

process.on('unhandledRejection', (reason: any) => {
  console.error('❌ Unhandled rejection:', reason && (reason.stack || reason));
  process.exit(1);
});

const app = express();
const PORT = parseInt(process.env.PORT || '5000', 10);

app.use(cors());
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Register routes
app.use('/api/auth', authRoutes);
app.use('/api/places', placeRoutes);
app.use('/api/favorites', favoriteRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/itineraries', itineraryRoutes);
app.use('/api/utility', travelAssistantRoutes);
app.use('/api/admin', adminRoutes);

app.get('/health', (_req, res) => res.json({ status: 'OK', timestamp: new Date().toISOString() }));

app.get('/', (_req, res) => res.json({ message: 'Welcome to Damascus Tourism API', version: '1.0.0' }));

// Error handler
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('ERROR:', err && (err.stack || err));
  res.status(500).json({ success: false, message: 'Internal server error' });
});

// 404 handler
app.use((_req, res) => res.status(404).json({ success: false, message: 'Route not found' }));

async function startServer() {
  try {
    await connectDB();

    const env = process.env.NODE_ENV || 'development';
    if (env === 'development' && process.env.SEED_DATABASE === 'true') {
      console.log('[app] seeding database (if enabled)');
      await seedDatabase();
      console.log('[app] seeding complete');
    }

    const server = app.listen(PORT, () => {
      console.log(`🚀 Server listening on http://localhost:${PORT}`);
    });

    server.on('error', (err: any) => {
      console.error('[app] server error', err);
      process.exit(1);
    });

    // keep process alive in some environments
    if (server && server.ref) server.ref();
    process.stdin && process.stdin.resume();
  } catch (err: any) {
    console.error('[app] failed to start', err && (err.stack || err));
    process.exit(1);
  }
}

startServer();

export default app;