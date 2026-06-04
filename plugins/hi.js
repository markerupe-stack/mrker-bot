module.exports = async (sock, from, text) => {
    if (text === "hi") {
        await sock.sendMessage(from, { text: "👋 Hello from MRKER BOT" });
    }
};
