const fs = require("fs");
const path = require("path");

module.exports = async (sock, from, text) => {
    const files = fs.readdirSync(path.join(__dirname, "../plugins"));

    for (let file of files) {
        const plugin = require(`../plugins/${file}`);
        try {
            await plugin(sock, from, text);
        } catch (e) {
            console.log("Plugin error:", file);
        }
    }
};
