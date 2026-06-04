const express = require("express");
const app = express();

const PORT = process.env.PORT || 10000;

// 🌐 KEEP ALIVE WEB SERVER (REQUIRED FOR RENDER)
app.get("/", (req, res) => {
    res.send("🤖 MRKER-BOT is alive");
});

app.listen(PORT, () => {
    console.log("🌐 Web server running on port", PORT);
});

// 🤖 START WHATSAPP BOT
require("./lib/connect");
