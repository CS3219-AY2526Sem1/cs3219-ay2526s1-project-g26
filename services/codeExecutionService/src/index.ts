import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { executionRoutes } from './routes/execution';

const app = express();
const PORT = process.env.PORT || 4040;

// Middleware
app.use(cors());
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' })); // Allow larger payloads for code submissions
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api', executionRoutes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Code Execution Service',
    version: '1.0.0',
    endpoints: {
      'POST /api/execute': 'Execute code against test cases',
      'GET /api/health': 'Health check',
      'GET /api/languages': 'Get supported languages'
    }
  });
});

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: err.message
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not found',
    path: req.originalUrl
  });
});

app.listen(PORT, () => {
  console.log(`Code Execution Service running on port ${PORT}`);
  console.log(`Available endpoints:`);
  console.log(`  GET  http://localhost:${PORT}/`);
  console.log(`  POST http://localhost:${PORT}/api/execute`);
  console.log(`  GET  http://localhost:${PORT}/api/health`);
  console.log(`  GET  http://localhost:${PORT}/api/languages`);
});

export default app;