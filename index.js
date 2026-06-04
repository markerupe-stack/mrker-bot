const express = require("express");
const fs = require("fs");
const P = require("pino");
const {
    default: makeWASocket,
    useMultiFileAuthState,
    DisconnectReason,
    fetchLatestBaileysVersion
} = require("@whiskeysockets/baileys");

const app = express();
const PORT = process.env.PORT || 3000;

// Keep Render alive
app.get("/", (req, res) => {
    res.send("🤖 MRKER-BOT is running...");
});

app.listen(PORT, () => {
    console.log("Server running on port", PORT);
});

// Ensure auth folder exists
if (!fs.existsSync("./auth")) {
    fs.mkdirSync("./auth");
}

async function startBot() {
    const { state, saveCreds } = await useMultiFileAuthState("./auth");
    const { version } = await fetchLatestBaileysVersion();

    const sock = makeWASocket({
        version,
        auth: state,
        logger: P({ level: "silent" })
    });

    sock.ev.on("creds.update", saveCreds);

    // 🔥 PAIRING CODE SYSTEM (NO QR)
    if (!sock.authState.creds.registered) {
        const phoneNumber = "2547XXXXXXXX"; // 👈 PUT YOUR NUMBER HERE (WITH COUNTRY CODE)

        setTimeout(async () => {
            const code = await sock.requestPairingCode(phoneNumber);
            console.log("🔑 YOUR PAIRING CODE:", code);
        }, 3000);
    }

    sock.ev.on("connection.update", (update) => {
        const { connection, lastDisconnect } = update;

        if (connection === "close") {
            const shouldReconnect =
                lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;

            console.log("Connection closed. Reconnecting:", shouldReconnect);

            if (shouldReconnect) startBot();
        }

        if (connection === "open") {
            console.log("🤖 MRKER-BOT CONNECTED SUCCESSFULLY!");
        }
    });

    sock.ev.on("messages.upsert", async ({ messages }) => {
        const msg = messages[0];
        if (!msg.message || msg.key.fromMe) return;

        const from = msg.key.remoteJid;

        const text =
            msg.message.conversation ||
            msg.message.extendedTextMessage?.text ||
            "";

        if (!text) return;

        console.log("Message:", text);

        if (text.toLowerCase() === "menu") {
            await sock.sendMessage(from, {
                text: "🤖 MRKER-BOT MENU\n\n• hi\n• menu\n• ping"
            });
        } else if (text.toLowerCase() === "hi") {
            await sock.sendMessage(from, {
                text: "👋 Hello! MRKER-BOT is active"
            });
        } else {
            await sock.sendMessage(from, {
                text: "You said: " + text
            });
        }
    });
}

startBot();        } else if (text.toLowerCase() === "hi") {
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
