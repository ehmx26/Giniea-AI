// Image Generation Endpoint using Google's Imagen / Gemini Image Capabilities
app.post('/api/generate-image', async (req, res) => {
    try {
        const { prompt } = req.body;
        if (!prompt) {
            return res.status(400).json({ error: 'Image prompt is required.' });
        }

        const apiKey = process.env.GEMINI_API_KEY;
        // Using Google's Imagen endpoint for high-quality image generation
        const apiEndpoint = `https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-002:predict?key=${apiKey}`;

        const apiResponse = await fetch(apiEndpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                instances: [{ prompt: prompt }],
                parameters: { sampleCount: 1, aspectRatios: ["1:1"] }
            })
        });

        const data = await apiResponse.json();

        if (data.predictions && data.predictions[0]?.bytesBase64Encoded) {
            const base64Image = `data:image/png;base64,${data.predictions[0].bytesBase64Encoded}`;
            return res.json({ imageUrl: base64Image });
        } else if (data.error) {
            return res.status(500).json({ error: data.error.message || 'Image Generation Error' });
        } else {
            return res.status(500).json({ error: 'Failed to generate image.' });
        }
    } catch (error) {
        console.error('Server Image Error:', error);
        return res.status(500).json({ error: 'Internal server error during image creation.' });
    }
});
