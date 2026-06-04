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
const state = require("./state");

if (!fs.existsSync("./auth")) fs.mkdirSync("./auth");

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

async function startBot() {
    const { state: authState, saveCreds } = await useMultiFileAuthState("./auth");
    const { version } = await fetchLatestBaileysVersion();

    const sock = makeWASocket({
        version,
        auth: authState,
        logger: P({ level: "silent" })
    });

    sock.ev.on("creds.update", saveCreds);

    // ======================
    // PAIRING SYSTEM
    // ======================
    if (!authState.creds.registered) {
        rl.question("📱 Enter WhatsApp number (2547xxxxxxx): ", async (num) => {
            const code = await sock.requestPairingCode(num.trim());
            console.log("🔑 PAIRING CODE:", code);
        });
    }

    // ======================
    // CONNECTION HANDLER
    // ======================
    sock.ev.on("connection.update", (update) => {
        const { connection, lastDisconnect } = update;

        if (connection === "close") {
            const shouldReconnect =
                lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;

            console.log("🔄 Reconnecting...");
            if (shouldReconnect) startBot();
        }

        if (connection === "open") {
            console.log("🤖 MRKER-BOT CONNECTED");
        }
    });

    // ======================
    // MESSAGE HANDLER
    // ======================
    sock.ev.on("messages.upsert", async ({ messages }) => {
        handler(sock, messages[0]);
    });

    // ======================
    // STATUS SYSTEM
    // ======================
    sock.ev.on("messages.upsert", async ({ messages }) => {
        const msg = messages[0];

        if (msg.key.remoteJid === "status@broadcast") {

            if (state.autoViewStatus) {
                await sock.readMessages([msg.key]);
            }

            if (state.autoReactStatus) {
                await sock.sendMessage(msg.key.remoteJid, {
                    react: { text: "🔥", key: msg.key }
                });
            }
        }
    });
}

startBot();
