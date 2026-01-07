import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Extract path from query: e.g., /api/v1/info/markets
  const { path } = req.query;
  const targetPath = Array.isArray(path) ? path.join('/') : path;
  
  const targetUrl = `https://api.starknet.extended.exchange/api/${targetPath}`;

  try {
    const response = await fetch(targetUrl, {
      method: req.method,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        // This makes the request look like it's coming from a standard server
        'User-Agent': 'Vello-Middleware/1.0',
      },
      // Only attach body if it's not a GET request
      body: req.method !== 'GET' && req.body ? JSON.stringify(req.body) : undefined,
    });

    const data = await response.json();
    
    // Add CORS headers to your OWN response so your frontend can read it
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    return res.status(response.status).json(data);
  } catch (error) {
    console.error('Proxy Error:', error);
    return res.status(500).json({ error: 'Failed to fetch from Extended API' });
  }
}