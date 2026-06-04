module.exports = async (sock, msg) => {
    if (!msg.message || msg.key.fromMe) return;

    const from = msg.key.remoteJid;

    const text =
        msg.message.conversation ||
        msg.message.extendedTextMessage?.text ||
        "";

    if (!text) return;

    if (text.toLowerCase() === "hi") {
        return sock.sendMessage(from, { text: "👋 Hello!" });
    }

    if (text.toLowerCase() === "menu") {
        return sock.sendMessage(from, { text: "🤖 MENU\nhi\nmenu" });
    }

    return sock.sendMessage(from, { text: "You said: " + text });
};
