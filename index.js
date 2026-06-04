const express = require("express");
const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = require("@whiskeysockets/baileys");
const P = require("pino");

const app = express();
const PORT = process.env.PORT || 3000;

// ===== Render keep-alive server =====
app.get("/", (req, res) => {
    res.send("🤖 MRKER-BOT is running...");
});

app.listen(PORT, () => {
    console.log("Server running on port", PORT);
});

// ===== WhatsApp Bot Start =====
async function startBot() {
    const { state, saveCreds } = await useMultiFileAuthState("./auth");

    const sock = makeWASocket({
        auth: state,
        logger: P({ level: "silent" }),
        printQRInTerminal: true
    });

    // Save login state
    sock.ev.on("creds.update", saveCreds);

    // Connection handling
    sock.ev.on("connection.update", (update) => {
        const { connection, lastDisconnect } = update;

        if (connection === "close") {
            const shouldReconnect =
                lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;

            console.log("Connection closed. Reconnecting:", shouldReconnect);

            if (shouldReconnect) startBot();
        }

        if (connection === "open") {
            console.log("🤖 MRKER-BOT connected successfully!");
        }
    });

    // Message handler
    sock.ev.on("messages.upsert", async ({ messages }) => {
        const msg = messages[0];
        if (!msg.message || msg.key.fromMe) return;

        const from = msg.key.remoteJid;

        const text =
            msg.message.conversation ||
            msg.message.extendedTextMessage?.text ||
            "";

        console.log("Incoming:", text);

        if (!text) return;

        // ===== Basic bot commands =====
        if (text.toLowerCase() === "menu") {
            await sock.sendMessage(from, {
                text: "🤖 MRKER-BOT MENU\n\n• hi - greet\n• menu - show this"
            });
        } else if (text.toLowerCase() === "hi") {
            await sock.sendMessage(from, {
                text: "👋 Hello! I am MRKER-BOT"
            });
        } else {
            await sock.sendMessage(from, {
                text: "You said: " + text
            });
        }
    });
}

// Start bot
startBot();
