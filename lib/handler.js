const { askAI } = require("./ai");
require("dotenv").config();

const OWNER = process.env.OWNER_NUMBER;

function getRole(sender) {
  if (sender.includes(OWNER)) return "owner";
  return "user";
}

async function handleMessage(sock, msg, text) {
  const sender = msg.key.remoteJid;

  if (!text) return;

  // commands
  if (text === ".ping") {
    return sock.sendMessage(sender, { text: "✅ Bot is alive" });
  }

  if (text === ".help") {
    return sock.sendMessage(sender, {
      text: "🤖 Just chat with me normally"
    });
  }

  // AI reply (default mode)
  const reply = await askAI(sender, text);

  await sock.sendMessage(sender, { text: reply });
}

module.exports = { handleMessage };
