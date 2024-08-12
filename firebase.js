const admin = require('firebase-admin');
const serviceAccount = require('./wayumart-9e794-firebase-adminsdk-gx86d-425bd46890.json');

// Initialize Firebase admin
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

const remoteConfig = admin.remoteConfig();
async function getWebhookUrl() {
  try {
      const template = await remoteConfig.getTemplate();
      const parameter = template.parameters['WEBHOOK_URL']; // Adjust parameter name
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
async function getSecret() {
  try {
      const template = await remoteConfig.getTemplate();
      const parameter = template.parameters['SECRET']; // Adjust parameter name
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
module.exports = { remoteConfig,getWebhookUrl,getSecret };
