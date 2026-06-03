require("dotenv").config();

const {
  default: makeWASocket,
  useMultiFileAuthState,
  fetchLatestBaileysVersion,
  DisconnectReason
} = require("@whiskeysockets/baileys");

const P = require("pino");
const { handleMessage } = require("./lib/handler");

async function startBot() {
  try {
    const { state, saveCreds } = await useMultiFileAuthState("session");
    const { version } = await fetchLatestBaileysVersion();

    const sock = makeWASocket({
      version,
      auth: state,
      logger: P({ level: "silent" })
    });

    console.log("🤖 MRK.ER Bot starting...");

    // Save session
    sock.ev.on("creds.update", saveCreds);

    // Messages
    sock.ev.on("messages.upsert", async ({ messages }) => {
      try {
        const msg = messages[0];
        if (!msg.message) return;

        const sender = msg.key.remoteJid;

        const text =
          msg.message.conversation ||
          msg.message.extendedTextMessage?.text;

        await handleMessage(sock, sender, text, msg);
      } catch (err) {
        console.log("Message error:", err.message);
      }
    });

    // Connection handling
    sock.ev.on("connection.update", (update) => {
      const { connection, lastDisconnect } = update;

      if (connection === "open") {
        console.log("✅ MRK.ER Bot is ONLINE");
      }

      if (connection === "close") {
        const reason =
          lastDisconnect?.error?.output?.statusCode;

        console.log("⚠️ Disconnected:", reason);

        if (reason !== DisconnectReason.loggedOut) {
          startBot(); // auto restart
        } else {
          console.log("❌ Logged out. Delete session and re-pair.");
        }
      }
    });

  } catch (err) {
    console.log("Fatal error:", err.message);
  }
}

startBot();
