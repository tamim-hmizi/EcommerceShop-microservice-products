import express from 'express';
import productRoutes from './routes/productRoutes.js';
import { client, httpRequestDurationMicroseconds } from './utils/metrics.js';

const app = express();
app.use(express.json());

// Prometheus metrics middleware
app.use((req, res, next) => {
  const startHrTime = process.hrtime();

  res.on('finish', () => {
    const elapsedHrTime = process.hrtime(startHrTime);
    const elapsedMs = elapsedHrTime[0] * 1000 + elapsedHrTime[1] / 1e6;

    httpRequestDurationMicroseconds
      .labels(req.method, req.route?.path || req.path, res.statusCode)
      .observe(elapsedMs);
  });

  next();
});

// Prometheus metrics endpoint
app.get('/api/products/metrics', async (req, res) => {
  res.set('Content-Type', client.register.contentType);
  res.end(await client.register.metrics());
});

// API routes
app.use('/api/products', productRoutes);

export default app;
