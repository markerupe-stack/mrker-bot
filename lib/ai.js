require("dotenv").config();
const OpenAI = require("openai");

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

// memory system
const memory = new Map();

const SYSTEM_PROMPT = `
You are MRK.ER Bot, a WhatsApp AI assistant.
- Be short and clear
- Be helpful
- Answer like a smart chatbot
`;

async function askAI(userId, text) {
    if (!memory.has(userId)) {
        memory.set(userId, []);
    }

    const history = memory.get(userId);

    history.push({ role: "user", content: text });

    if (history.length > 10) {
        history.shift();
    }

    const res = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
            { role: "system", content: SYSTEM_PROMPT },
            ...history
        ]
    });

    const reply = res.choices[0].message.content;

    history.push({ role: "assistant", content: reply });

    return reply;
}

module.exports = { askAI };
