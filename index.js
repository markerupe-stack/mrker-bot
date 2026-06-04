const express = require("express");
const app = express();

const PORT = process.env.PORT || 10000;

// 🌐 MUST KEEP SERVER ALIVE FOR RENDER
app.get("/", (req, res) => {
    res.status(200).send("🤖 MRKER-BOT is alive");
});

app.get("/ping", (req, res) => {
    res.status(200).send("OK");
});

app.listen(PORT, () => {
    console.log("🌐 Server running on port", PORT);
});

// 🤖 START BOT AFTER SERVER IS UP
setTimeout(() => {
    try {
        require("./lib/connect");
    } catch (err) {
        console.log("❌ Bot failed to start:", err.message);
    }
}, 3000);
