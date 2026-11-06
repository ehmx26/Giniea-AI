const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname)));

// Unified endpoint for text chats and image generation
app.post('/api/chat', async (req, res) => {
    try {
        const { message, mode } = req.body;
        if (!message) {
            return res.status(400).json({ error: 'Message or prompt is required.' });
        }

        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            return res.status(500).json({ error: 'GEMINI_API_KEY environment variable is not configured on Render.' });
        }

        const apiEndpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent?key=${apiKey}`;

        // If mode is 'image', request image modality generation
        const requestBody = mode === 'image' ? {
            contents: [{ role: 'user', parts: [{ text: message }] }],
            generationConfig: {
                responseModalities: ["TEXT", "IMAGE"]
            }
        } : {
            contents: [{ role: 'user', parts: [{ text: message }] }]
        };

        const apiResponse = await fetch(apiEndpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestBody)
        });

        const data = await apiResponse.json();

        if (data.candidates && data.candidates[0]?.content?.parts) {
            let replyText = "";
            let imageUrl = null;

            for (const part of data.candidates[0].content.parts) {
                if (part.text) {
                    replyText += part.text;
                }
                // Handle inline image bytes returned by the model
                if (part.inlineData || part.inline_data) {
                    const inline = part.inlineData || part.inline_data;
                    imageUrl = `data:${inline.mimeType || 'image/png'};base64,${inline.data}`;
                }
            }

            return res.json({ reply: replyText, imageUrl });
        } else if (data.error) {
            return res.status(500).json({ error: data.error.message || 'Gemini API Error' });
        } else {
            return res.status(500).json({ error: 'Unexpected response format from Gemini API.' });
        }
    } catch (error) {
        console.error('Server Error:', error);
        return res.status(500).json({ error: 'Internal server error connecting to AI.' });
    }
});

app.listen(PORT, () => {
    console.log(`Giniea AI server running on port ${PORT}`);
});
