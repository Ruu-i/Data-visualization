/**
 * Simple Express proxy server for Claude API.
 *
 * WHY: The Angular dev server (Vite-based) proxy doesn't reliably
 * support header injection. This tiny server:
 * 1. Receives POST from the Angular app at /api/claude
 * 2. Forwards it to Claude's API with the API key
 * 3. Returns the response
 *
 * RUN: $env:CLAUDE_API_KEY="sk-ant-..." ; node server.js
 */
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 3000;

const API_KEY = process.env.CLAUDE_API_KEY;
if (!API_KEY) {
  console.error('ERROR: Set CLAUDE_API_KEY environment variable first.');
  console.error('  PowerShell: $env:CLAUDE_API_KEY="sk-ant-..."');
  process.exit(1);
}

app.use(cors({ origin: 'http://localhost:4200' }));
app.use(express.json({ limit: '1mb' }));

app.post('/api/claude', async (req, res) => {
  try {
    console.log('→ Forwarding request to Claude API...');

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify(req.body)
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('✗ Claude API error:', response.status, data);
      return res.status(response.status).json(data);
    }

    console.log('✓ Claude responded successfully');
    res.json(data);
  } catch (err) {
    console.error('✗ Proxy error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`\nProxy server running on http://localhost:${PORT}`);
  console.log('Forwarding /api/claude → https://api.anthropic.com/v1/messages');
  console.log('API key loaded: ' + API_KEY.substring(0, 10) + '...\n');
});
