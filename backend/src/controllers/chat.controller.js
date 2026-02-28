const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

const SYSTEM_PROMPT = `You are "Know Your Animal" — a friendly, knowledgeable veterinary assistant specializing in animal healthcare. You help farmers, pet owners, and animal caretakers in India.

Your expertise covers:
- Common diseases in cows, goats, dogs, cats, chickens, ducks, rabbits, parrots, pigeons, and other domestic animals
- Symptoms, causes, prevention, and treatment of animal diseases
- General animal care, nutrition, and husbandry tips
- First aid for animals

Guidelines:
- Keep answers concise but informative (2-4 paragraphs max)
- Use simple, easy-to-understand language
- Always recommend consulting a veterinarian for serious conditions
- If asked about something unrelated to animals, politely redirect to animal topics
- Be warm and supportive — many users are worried about their animals`;

exports.chat = async (req, res) => {
    try {
        const { messages } = req.body;

        if (!GEMINI_API_KEY) {
            return res.status(500).json({ error: "GEMINI_API_KEY is not configured" });
        }

        if (!messages || !Array.isArray(messages)) {
            return res.status(400).json({ error: "messages array is required" });
        }

        const response = await fetch(
            "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions",
            {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${GEMINI_API_KEY}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    model: "gemini-2.0-flash",
                    messages: [{ role: "system", content: SYSTEM_PROMPT }, ...messages],
                    stream: true,
                }),
            }
        );

        if (!response.ok) {
            if (response.status === 429) {
                return res.status(429).json({ error: "Too many requests. Please try again in a moment." });
            }
            const text = await response.text();
            console.error("Gemini API error:", response.status, text);
            return res.status(500).json({ error: "AI service error" });
        }

        // Stream the SSE response back to the client
        res.setHeader("Content-Type", "text/event-stream");
        res.setHeader("Cache-Control", "no-cache");
        res.setHeader("Connection", "keep-alive");

        const reader = response.body.getReader();
        const decoder = new TextDecoder();

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            res.write(decoder.decode(value, { stream: true }));
        }

        res.end();
    } catch (error) {
        console.error("Chat error:", error);
        res.status(500).json({ error: "Failed to process chat request" });
    }
};
