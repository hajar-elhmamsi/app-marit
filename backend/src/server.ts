import express from 'express';
import cors from 'cors';
import { vesselsRouter } from './routes/vessels.routes.js';
import { portsRouter } from './routes/ports.routes.js';
import { cargoRouter } from './routes/cargo.routes.js';
import { crewRouter } from './routes/crew.routes.js';
import { alarmsRouter } from './routes/alarms.routes.js';

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors({ origin: '*' }));
app.use(express.json());

// Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ONLINE',
    system: 'Navios Maritime OS API',
    database: 'SQLite 3 (maritime.sqlite)',
    timestamp: new Date().toISOString()
  });
});

// Mount Routes
app.use('/api/vessels', vesselsRouter);
app.use('/api/ports', portsRouter);
app.use('/api/cargo', cargoRouter);
app.use('/api/crew', crewRouter);
app.use('/api/alarms', alarmsRouter);

app.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`  NAVIOS MARITIME OS - BACKEND REST API SERVER     `);
  console.log(`  Port: http://localhost:${PORT}                   `);
  console.log(`  Health Check: http://localhost:${PORT}/api/health`);
  console.log(`====================================================`);
});
