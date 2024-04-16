require('dotenv').config();

module.exports = {
    webhookURL: process.env.WEBHOOK_URL,
    serverUrl: process.env.SERVER_URL,
}