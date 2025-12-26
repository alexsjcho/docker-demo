// Next.js API route that proxies requests to the backend
// This avoids CORS issues by making server-to-server calls

export default async function handler(req, res) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiBase = process.env.API_INTERNAL_BASE || 'http://backend:4000';

  try {
    // Fetch from backend service over Docker network
    const response = await fetch(`${apiBase}/api`);
    
    if (!response.ok) {
      throw new Error(`Backend responded with status: ${response.status}`);
    }

    const data = await response.json();
    
    // Return the same status and JSON from backend
    res.status(response.status).json(data);
  } catch (error) {
    console.error('Proxy error:', error);
    res.status(500).json({ 
      error: 'Failed to proxy request to backend',
      message: error.message 
    });
  }
}

