require('dotenv').config();
const express = require('express');
const cors = require('cors');

const { initSchema } = require('./db/db');
const authRoutes = require('./routes/auth');
const taskRoutes = require('./routes/tasks');

const app = express();

// Allow requests from your deployed frontend. Set FRONTEND_URL in your
// hosting platform's environment variables once the frontend is deployed
// (e.g. https://your-app.vercel.app). Falls back to allowing all origins
// if not set, which is fine for initial testing but should be tightened.
const allowedOrigin = process.env.FRONTEND_URL || '*';
app.use(cors({ origin: allowedOrigin }));
app.use(express.json());

app.get('/', (req, res) => {
  res.json({ message: 'Task API is running. See README for endpoint docs.' });
});

// Simple health check — useful for the hosting platform and for your own testing.
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);

app.use((req, res) => {
  res.status(404).json({ error: 'Route not found.' });
});

app.use((err, req, res, next) => {
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'Malformed JSON in request body.' });
  }
  console.error(err);
  res.status(500).json({ error: 'Internal server error.' });
});

const PORT = process.env.PORT || 3000;

// Create tables (if they don't already exist) before accepting traffic.
initSchema()
  .then(() => {
    app.listen(PORT, () => console.log(`Task API listening on port ${PORT}`));
  })
  .catch((err) => {
    console.error('Failed to initialize database schema:', err);
    process.exit(1);
  });

module.exports = app;
