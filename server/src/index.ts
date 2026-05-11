import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import staffRoutes from './routes/staff';
import scheduleRoutes from './routes/schedule';
import staffRequestRoutes from './routes/staffRequest';
import fixedShiftRoutes from './routes/fixedShift';
import scheduleChangeLogRoutes from './routes/scheduleChangeLog';
import shiftRoutes from './routes/shift';
import { errorHandler } from './utils/errorHandler';
import pool from './utils/db';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use('/api/staff', staffRoutes);
app.use('/api/schedule', scheduleRoutes);
app.use('/api/staff-request', staffRequestRoutes);
app.use('/api/fixed-shift', fixedShiftRoutes);
app.use('/api/schedule-change-log', scheduleChangeLogRoutes);
app.use('/api/shift', shiftRoutes);

app.get('/api/health', (req, res) => {
  res.json({ code: 0, message: 'ok', data: null });
});

app.use(errorHandler);

async function startServer() {
  let retries = 5;
  while (retries > 0) {
    try {
      const conn = await pool.getConnection();
      await conn.ping();
      conn.release();
      console.log('Database connected successfully');
      break;
    } catch (err: any) {
      retries--;
      console.error(`Database connection failed (${retries} retries left):`, err.message);
      if (retries === 0) {
        console.error('All database connection retries exhausted. Starting server without DB...');
      }
      await new Promise(resolve => setTimeout(resolve, 3000));
    }
  }

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
