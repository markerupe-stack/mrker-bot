module.exports = async (sock, from, text) => {
    if (text === ".alive") {
        await sock.sendMessage(from, {
            text: "🤖 MRKER-BOT is alive ✔"
        });
    }
};
