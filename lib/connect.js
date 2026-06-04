const fs = require("fs");
const P = require("pino");
const readline = require("readline");
const {
    default: makeWASocket,
    useMultiFileAuthState,
    DisconnectReason,
    fetchLatestBaileysVersion
} = require("@whiskeysockets/baileys");

const handler = require("./handler");

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

function ask(question) {
    return new Promise(resolve => rl.question(question, resolve));
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

    // 🔑 PAIRING CODE LOGIC
    if (!sock.authState.creds.registered) {
        const phone = await ask("📱 Enter your WhatsApp number (with country code): ");
        const code = await sock.requestPairingCode(phone.trim());

        console.log("\n🔑 PAIRING CODE:", code);
        console.log("👉 Go to WhatsApp → Linked Devices → Link with code\n");
    }

    sock.ev.on("connection.update", (update) => {
        const { connection, lastDisconnect } = update;

        if (connection === "open") {
            console.log("🤖 BOT CONNECTED SUCCESSFULLY");
        }

        if (connection === "close") {
            const shouldReconnect =
                lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;

            console.log("Reconnecting:", shouldReconnect);

            if (shouldReconnect) startBot();
        }
    });

    sock.ev.on("messages.upsert", async ({ messages }) => {
        handler(sock, messages[0]);
    });
}

startBot();
