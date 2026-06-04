const fs = require("fs");
const P = require("pino");
const {
    default: makeWASocket,
    useMultiFileAuthState,
    DisconnectReason,
    fetchLatestBaileysVersion
} = require("@whiskeysockets/baileys");

const handler = require("./handler");

if (!fs.existsSync("./auth")) fs.mkdirSync("./auth");

async function startBot() {
    const { state, saveCreds } = await useMultiFileAuthState("./auth");
    const { version } = await fetchLatestBaileysVersion();

    const sock = makeWASocket({
        version,
        auth: state,
        logger: P({ level: "silent" }),
        printQRInTerminal: true,   // IMPORTANT FOR FIRST LOGIN
        browser: ["MRKER-BOT", "Chrome", "1.0"]
    });

    sock.ev.on("creds.update", saveCreds);

    sock.ev.on("connection.update", (update) => {
        const { connection, lastDisconnect } = update;

        if (connection === "open") {
            console.log("🤖 BOT CONNECTED SUCCESSFULLY");
        }

        if (connection === "close") {
            const code = lastDisconnect?.error?.output?.statusCode;

            const shouldReconnect = code !== DisconnectReason.loggedOut;

            console.log("Connection closed. Reconnecting:", shouldReconnect);

            if (shouldReconnect) {
                setTimeout(startBot, 5000);
            }
        }
    });

    sock.ev.on("messages.upsert", async ({ messages }) => {
        handler(sock, messages[0]);
    });
}

startBot();
