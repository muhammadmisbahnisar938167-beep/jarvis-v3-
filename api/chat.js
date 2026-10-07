export default async function handler(req, res) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { command } = req.body || {};

    if (!command) {
      return res.status(400).json({ error: 'Command is required' });
    }

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return res.status(500).json({ reply: 'API key is missing in Vercel settings, sir.' });
    }

    // Call Gemini API
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: `You are JARVIS, an AI assistant. Be concise, polite, and address the user as 'sir'. User query: ${command}` }]
            }
          ]
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error('Gemini API Error:', data);
      return res.status(500).json({ reply: 'Gemini API connection error, sir.' });
    }

    const replyText = data.candidates?.[0]?.content?.parts?.[0]?.text || "I couldn't generate a response, sir.";

    return res.status(200).json({ reply: replyText });

  } catch (error) {
    console.error('Server Error:', error);
    return res.status(500).json({ reply: 'Internal server error, sir.' });
  }
}
