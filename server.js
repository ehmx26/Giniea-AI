const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname)));

app.post('/api/chat', async (req, res) => {
    try {
        const { message } = req.body;
        if (!message) {
            return res.status(400).json({ error: 'Message is required' });
        }

        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            return res.status(500).json({ error: 'GEMINI_API_KEY environment variable is not set on Render.' });
        }

        // Using the stable gemini-3.5-flash model endpoint
        const apiEndpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=${apiKey}`;

        const apiResponse = await fetch(apiEndpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ role: 'user', parts: [{ text: message }] }]
            })
        });

        const data = await apiResponse.json();

        if (data.candidates && data.candidates[0]?.content?.parts?.[0]?.text) {
            const reply = data.candidates[0].content.parts[0].text;
            res.json({ reply });
        } else if (data.error) {
            res.status(500).json({ error: data.error.message || 'Gemini API Error' });
        } else {
            res.status(500).json({ error: 'Invalid response structure received from Gemini API.' });
        }
    } catch (error) {
        console.error('Server Error:', error);
        res.status(500).json({ error: 'Failed to generate AI response.' });
    }
});

app.listen(PORT, () => {
    console.log(`Giniea AI server running on port ${PORT}`);
});
