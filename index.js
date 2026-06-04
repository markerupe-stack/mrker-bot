const express = require("express");
const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = require("@whiskeysockets/baileys");
const P = require("pino");

const app = express();
const PORT = process.env.PORT || 3000;

// Keep Render alive
app.get("/", (req, res) => {
    res.send("WhatsApp bot is running 🚀");
});

app.listen(PORT, () => {
    console.log("Server running on port", PORT);
});

async function startBot() {
    const { state, saveCreds } = await useMultiFileAuthState("./auth");

    const sock = makeWASocket({
        auth: state,
        logger: P({ level: "silent" }),
        printQRInTerminal: true
    });

    sock.ev.on("creds.update", saveCreds);

    sock.ev.on("connection.update", (update) => {
        const { connection, lastDisconnect } = update;

        if (connection === "close") {
            const shouldReconnect =
                lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;

            console.log("Connection closed. Reconnecting:", shouldReconnect);

            if (shouldReconnect) {
                startBot();
            }
        }

        if (connection === "open") {
            console.log("WhatsApp connected successfully ✅");
        }
    });

    sock.ev.on("messages.upsert", async ({ messages }) => {
        const msg = messages[0];
        if (!msg.message || msg.key.fromMe) return;

        const from = msg.key.remoteJid;
        const text =
            msg.message.conversation ||
            msg.message.extendedTextMessage?.text;

        console.log("Message received:", text);

        if (!text) return;

        // Simple reply logic
        if (text.toLowerCase() === "hi") {
            await sock.sendMessage(from, { text: "Hello 👋 I am your bot!" });
        } else {
            await sock.sendMessage(from, { text: "You said: " + text });
        }
    });
}

startBot();
