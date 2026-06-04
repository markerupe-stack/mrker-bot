const fs = require("fs");
const P = require("pino");
const {
    default: makeWASocket,
    useMultiFileAuthState,
    DisconnectReason
} = require("@whiskeysockets/baileys");

const handler = require("./handler");

if (!fs.existsSync("./auth")) fs.mkdirSync("./auth");

async function startBot() {
    const { state, saveCreds } = await useMultiFileAuthState("./auth");

    const sock = makeWASocket({
        auth: state,
        logger: P({ level: "silent" })
    });

    sock.ev.on("creds.update", saveCreds);

    sock.ev.on("connection.update", (update) => {
        const { connection, lastDisconnect } = update;

        if (connection === "close") {
            const shouldReconnect =
                lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;

            console.log("Reconnecting...");
            if (shouldReconnect) startBot();
        }

        if (connection === "open") {
            console.log("🤖 BOT CONNECTED");
        }
    });

    sock.ev.on("messages.upsert", async ({ messages }) => {
        handler(sock, messages[0]);
    });
}

startBot();
