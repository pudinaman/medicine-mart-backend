require('dotenv').config();
const axios = require('axios');
const webhookURL = process.env.WEBHOOK_URL;

function replaceUrlsInText(text) {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    return text.replace(urlRegex, '<URL>');
}

function getIpFromRequest(req) {
    return req.headers['x-forwarded-for'] || req.connection.remoteAddress;
}

const slackLogger = async (err, req, res, next) => {
    const title = 'Error Occurred';
    const descriptionParam = err.message;
    const blocks = [];

    blocks.push({
        block_id: 'title',
        type: 'section',
        text: { text: `*${replaceUrlsInText(title)}*`, type: 'mrkdwn' },
    });

    let description = replaceUrlsInText(descriptionParam);
    if (descriptionParam && typeof descriptionParam === 'object') {
        description = JSON.stringify(descriptionParam);
    }

    blocks.push({
        block_id: 'description',
        type: 'context',
        elements: [{ text: description, type: 'plain_text' }],
    });

    const attachments = [];
    if (req) {
        const elements = [];
        if (req.userId) {
            elements.push({
                type: 'mrkdwn',
                text: `\`UserId: ${req.userId || '--'}\``,
            });
        }
        elements.push({
            type: 'mrkdwn',
            text: `*Request:*\n\`${req.method}: ${req.hostname}${req.originalUrl}\`\n\`${req.body ? replaceUrlsInText(JSON.stringify(req.body)) : ''}\``,
        });
        elements.push({
            type: 'mrkdwn',
            text: `*User-Agent:* ${req.headers && req.headers['user-agent']}\n*IP:* ${getIpFromRequest(req)}`,
        });

        blocks.push({
            block_id: 'request',
            type: 'context',
            elements,
        });
    }

    if (err) {
        const errorMessage = err && (typeof err === 'string' ? err : err.message);
        attachments.push({
            blocks: [{
                block_id: 'error-message',
                type: 'section',
                text: {
                    text: `\`${replaceUrlsInText(errorMessage)}\``.substring(0, 3000),
                    type: 'mrkdwn',
                },
            }],
        });

        if (err.response && err.response.data) {
            attachments.push({
                blocks: [{
                    block_id: 'error-details',
                    type: 'context',
                    elements: [
                        {
                            type: 'mrkdwn',
                            text: `*Error: Body:* \`${replaceUrlsInText(JSON.stringify(err.response.data))}\``.substring(0, 3000),
                        },
                    ],
                }],
            });
        }

        if (err.stack) {
            let { stack } = err;
            if (stack.length > 2900) {
                stack = `${stack.substring(0, 500)}...\n\n${stack.substring(stack.length - 2500, stack.length)}`;
            }

            attachments.push({
                blocks: [{
                    block_id: 'error-stack',
                    elements: [
                        {
                            type: 'mrkdwn',
                            text: `*Stack:* \`${replaceUrlsInText(stack)}\``,
                        },
                    ],
                    type: 'context',
                }],
            });
        }
    }

    const slackBody = {
        blocks,
        attachments,
        text: replaceUrlsInText(`${title}\r\n${err && err.message}`).substring(0, 100),
    };

    try {
        await axios.post(webhookURL, slackBody);
        console.log('Error sent to Slack successfully');
    } catch (error) {
        console.error('Failed to send error to Slack:', error);
    }

    next();
};

module.exports = { slackLogger, webhookURL };
