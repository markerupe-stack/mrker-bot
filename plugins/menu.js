module.exports = async (sock, from, text) => {
    if (text === "menu") {
        await sock.sendMessage(from, {
            text: "🤖 MENU\n\nhi\nmenu\nalive\nai <text>"
        });
    }
};
