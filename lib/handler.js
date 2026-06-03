const { askAI } = require("./ai");

async function handleMessage(sock, sender, text) {
    if (!text) return;

    // simple commands
    if (text === ".ping") {
        return sock.sendMessage(sender, { text: "✅ MRK.ER Bot is alive" });
    }

    if (text === ".help") {
        return sock.sendMessage(sender, {
            text: "🤖 MRK.ER Bot\nJust chat normally with me"
        });
    }

    try {
        const reply = await askAI(sender, text);
        await sock.sendMessage(sender, { text: reply });
    } catch (err) {
        console.log("Handler error:", err.message);
        await sock.sendMessage(sender, { text: "⚠️ Error processing request" });
    }
}

module.exports = { handleMessage };
