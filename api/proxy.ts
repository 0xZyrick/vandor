// /api/proxy.ts
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // 1. Get the path from the query (e.g., v1/info/markets)
  const { path } = req.query;
  const targetPath = Array.isArray(path) ? path.join('/') : path;
  
  const targetUrl = `https://api.starknet.extended.exchange/api/${targetPath}`;

  try {
    // 2. Fetch from the exchange server-to-server
    const response = await fetch(targetUrl, {
      method: req.method,
      headers: {
        'Content-Type': 'application/json',
        // We don't forward YOUR browser headers, so the API sees a "clean" request
      },
      // If it's a POST request (like placing an order), forward the body
      body: req.method !== 'GET' ? JSON.stringify(req.body) : undefined,
    });

    const data = await response.json();

    // 3. Send the data back to your frontend
    return res.status(response.status).json(data);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch from Extended API' });
  }
}