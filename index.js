const express = require("express");
const scrapeTwitter = require("./scrape");

const app = express();
const PORT = 6000;

app.set("view engine", "ejs");
app.set("views", "./views");

app.get("/", (req, res) => {
    res.render("index");
});

app.get("/run-script", async (req, res) => {
    try {
        const result = await scrapeTwitter();
        res.json(result);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to scrape Twitter trends." });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
