require('dotenv').config();

module.exports = {
    token: process.env.TOKEN
}
async function getWebhookUrl() {
    try {
        const template = await remoteConfig.getTemplate();
        const parameter = template.parameters['webhook_url']; // Adjust parameter name
        if (parameter && parameter.defaultValue) {
            return parameter.defaultValue.value;
        } else {
            throw new Error('Webhook URL parameter not found');
        }
    } catch (error) {
        console.error('Failed to fetch webhook URL from Remote Config:', error);
        throw error;
    }
}