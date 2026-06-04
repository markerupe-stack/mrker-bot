const OpenAI = require("openai");

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

module.exports = async (text) => {
    try {
        const res = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                { role: "system", content: "You are MRKER BOT assistant." },
                { role: "user", content: text }
            ]
        });

        return res.choices[0].message.content;
    } catch {
        return "AI error";
    }
};
