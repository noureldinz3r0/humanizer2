import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

dotenv.config();

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  methods: ['POST'],
  allowedHeaders: ['Content-Type']
}));
app.use(express.json());

// StealthGPT proxy endpoint
app.post('/api/humanize', async (req, res) => {
  try {
    const response = await fetch('https://www.stealthgpt.ai/api/stealthify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-token': process.env.STEALTHGPT_API_KEY
      },
      body: JSON.stringify({
        prompt: req.body.text,
        rephrase: true
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to humanize text');
    }

    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'healthy' });
});

app.listen(port, () => {
  console.log(`Proxy server running on port ${port}`);
});