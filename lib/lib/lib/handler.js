const plugins = require("./plugins");

module.exports = async (sock, msg) => {
    if (!msg.message || msg.key.fromMe) return;

    const from = msg.key.remoteJid;

    const text =
        msg.message.conversation ||
        msg.message.extendedTextMessage?.text ||
        "";

    if (!text) return;

    console.log("MSG:", text);

    await plugins(sock, from, text);
};
