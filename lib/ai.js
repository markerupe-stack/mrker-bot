const OpenAI = require("openai");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// 🧠 memory system
const memory = new Map();
const MAX_HISTORY = 10;

const SYSTEM_PROMPT = `
You are a WhatsApp AI assistant.
- Keep replies short
- Be helpful
- Be natural like a human chat
`;

async function askAI(userId, text) {
  if (!memory.has(userId)) {
    memory.set(userId, []);
  }

  const history = memory.get(userId);

  history.push({ role: "user", content: text });

  if (history.length > MAX_HISTORY) {
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
