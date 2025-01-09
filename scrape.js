const puppeteer = require('puppeteer');
const axios = require('axios');
const { MongoClient } = require('mongodb');

// ProxyMesh credentials
const PROXY_URL = "http://username:pass@proxy.proxy_mesh.com:31280";

// MongoDB configuration
const MONGO_URI = "mongodb://localhost:27017";
const DB_NAME = "stir_tech";

async function scrapeTwitter() {
    const browser = await puppeteer.launch({
        headless: true,
        args: [`--proxy-server=${PROXY_URL}`],
    });
    const page = await browser.newPage();

    try {
        // Log in to Twitter
        await page.goto("https://twitter.com/login", { waitUntil: "networkidle2" });
        await page.type('input[name="session[username_or_email]"]', 'usename');
        await page.type('input[name="session[password]"]', 'pasword');
        await page.click('div[data-testid="LoginForm_Login_Button"]');
        await page.waitForTimeout(5000);

        // Scrape top 5 trending topics
        const trends = await page.$$eval('[data-testid="trend"]', (elements) =>
            elements.slice(0, 5).map((el) => el.textContent.split("\n")[0])
        );

        // Generate unique ID and timestamp
        const uniqueId = Date.now().toString();
        const timestamp = new Date().toISOString();

        // Get the proxy IP address
        const response = await axios.get("http://lumtest.com/myip.json", {
            proxy: {
                host: "proxy.proxy_mesh.com",
                port: 31280,
                auth: {
                    username: "username",
                    password: "password",
                },
            },
        });
        const proxyIp = response.data.ip;

        // Save to MongoDB
        const client = new MongoClient(MONGO_URI);
        await client.connect();
        const db = client.db(DB_NAME);
        const result = {
            _id: uniqueId,
            trends,
            timestamp,
            proxyIp,
        };
        await db.collection("twitter_trends").insertOne(result);
        await client.close();

        return result;
    } finally {
        await browser.close();
    }
}

module.exports = scrapeTwitter;
