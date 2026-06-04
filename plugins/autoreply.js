module.exports = async (sock, from, text) => {
    if (text.toLowerCase().includes("hello")) {
        await sock.sendMessage(from, {
            text: "👋 Auto Reply: Hello!"
        });
    }
};
