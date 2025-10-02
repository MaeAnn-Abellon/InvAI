import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { testDB } from './db.js';
import { runMigrations } from './migrate.js';
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import inventoryRoutes from './routes/inventoryRoutes.js';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();
const app = express();

app.use(cors({
  origin: process.env.CORS_ORIGIN,
  credentials: false // using Authorization header (token), not cookies
}));
app.use(express.json());

app.get('/api/health', (_req,res)=>res.json({ ok:true }));
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
// Serve uploaded avatars
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use('/uploads', express.static(path.join(__dirname,'..','uploads')));
app.use('/api/inventory', inventoryRoutes);

const PORT = process.env.PORT || 5000;
async function start() {
  try {
    await testDB();
    await runMigrations();
    const server = app.listen(PORT, () => console.log('API listening on', PORT));
    server.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        console.error(`Port ${PORT} is already in use. Free the port or set PORT env variable to a different value.`);
        console.error('Windows quick fix:');
        console.error('  netstat -ano | findstr :' + PORT);
        console.error('  taskkill /PID <pid> /F');
      } else {
        console.error('Server error:', err);
      }
      process.exit(1);
    });
  } catch (err) {
    console.error('Startup failed:', err);
    process.exit(1);
  }
}

start();