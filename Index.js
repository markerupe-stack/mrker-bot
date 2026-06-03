const {
  default: makeWASocket,
  useMultiFileAuthState,
  fetchLatestBaileysVersion,
  DisconnectReason
} = require("@whiskeysockets/baileys");

const P = require("pino");
const readline = require("readline");
const { handleMessage } = require("./lib/handler");
require("dotenv").config();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = (text) => new Promise(res => rl.question(text, res));

async function startBot() {
  const { state, saveCreds } = await useMultiFileAuthState("session");
  const { version } = await fetchLatestBaileysVersion();

  const sock = makeWASocket({
    version,
    auth: state,
    logger: P({ level: "silent" })
  });

  // 🔐 Pairing (first time only)
  if (!sock.authState.creds.registered) {
    const phone = await question("📱 Enter WhatsApp number: ");
    const code = await sock.requestPairingCode(phone.trim());

    console.log("\n🔑 PAIRING CODE:", code, "\n");
  }

  sock.ev.on("creds.update", saveCreds);

  sock.ev.on("messages.upsert", async ({ messages }) => {
    const msg = messages[0];
    if (!msg.message) return;

    const text =
      msg.message.conversation ||
      msg.message.extendedTextMessage?.text;

    await handleMessage(sock, msg, text);
  });

  sock.ev.on("connection.update", (update) => {
    const { connection, lastDisconnect } = update;

    if (connection === "close") {
      const reason = lastDisconnect?.error?.output?.statusCode;

      if (reason !== DisconnectReason.loggedOut) {
        console.log("♻️ Reconnecting...");
        startBot();
      } else {
        console.log("❌ Logged out. Delete session and re-pair.");
      }
    }

    if (connection === "open") {
      console.log("✅ Bot ONLINE");
    }
  });

  console.log("🤖 Bot started...");
}

startBot();
