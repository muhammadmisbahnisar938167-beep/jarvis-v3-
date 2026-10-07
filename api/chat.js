export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { command } = req.body;
        const apiKey = process.env.GEMINI_API_KEY;

        if (!apiKey) {
            return res.status(500).json({ reply: "API key is missing on the server, sir." });
        }

        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{ text: command }]
                }]
            })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error?.message || 'Gemini API error');
        }

        const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || "I didn't get a response, sir.";
        return res.status(200).json({ reply });

    } catch (error) {
        console.error("API Error:", error);
        return res.status(500).json({ reply: "I encountered an error processing your command, sir." });
    }
}
