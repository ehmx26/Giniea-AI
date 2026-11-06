const express = require('express');
const path = require('path');
const { GoogleGenAI } = require('@google/genai');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to parse incoming JSON request bodies
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// Initialize the Google Gen AI SDK using your Render Environment Variable
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// API Endpoint for chat
app.post('/api/chat', async (req, res) => {
    try {
        const { message } = req.body;
        if (!message) {
            return res.status(400).json({ error: 'Message is required' });
        }

        // Call the Gemini model (using gemini-2.5-flash as the default fast model)
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: message,
        });

        res.json({ reply: response.text });
    } catch (error) {
        console.error('Gemini API Error:', error);
        res.status(500).json({ error: 'Failed to generate AI response' });
    }
});

app.listen(PORT, () => {
    console.log(`Giniea AI server running on port ${PORT}`);
});
