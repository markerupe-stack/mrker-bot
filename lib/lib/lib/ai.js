const OpenAI = require("openai");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

const memory = new Map();

const SYSTEM_PROMPT = `
You are MRK.ER Bot, a WhatsApp AI assistant.
Be helpful, short, and natural.
`;

async function askAI(user, text) {
  if (!memory.has(user)) memory.set(user, []);

  const history = memory.get(user);

  history.push({ role: "user", content: text });

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
