require('dotenv').config();
const axios = require('axios');
const webhookURL = process.env.WEBHOOK_URL;
// const fetch = require('node-fetch'); // Import fetch library

// Function definition for replaceUrlsInText
function replaceUrlsInText(text) {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    return text.replace(urlRegex, '<URL>');
}

function getIpFromRequest(req) {
    return req.headers['x-forwarded-for'] || req.connection.remoteAddress;
}

exports.slackLogger = async (title, descriptionParam, error, req, hook = webhookURL) => {
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
    if (error) {
        const errorMessage = error && (typeof error === 'string' ? error : error.message);
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

        if (error.response && error.response.data) {
            attachments.push({
                blocks: [{
                    block_id: 'error-details',
                    type: 'context',
                    elements: [
                        {
                            type: 'mrkdwn',
                            text: `*Error: Body:* \`${replaceUrlsInText(JSON.stringify(error.response.data))}\``.substring(0, 3000),
                        },
                    ],
                }],
            });
        }
        if (error && error.stack) {
            let { stack } = error;
            if (stack.length > 2900) {
                stack = `${stack.substring(0, 500)}...\n\n${stack.substring(
                    stack.length - 2500,
                    stack.length
                )}`;
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
        text: replaceUrlsInText(`${title}\r\n${error && error.message}`).substring(0, 100),
    };
    try {
        await axios.post(hook, slackBody);
        console.log('error sent successfully');
    } catch (error) {
        console.error('Failed to send error to Slack:', error);
    }    
    // try {
    //     // Use fetch to make HTTP POST request
    //     const response = await fetch(hook, {
    //         method: 'POST',
    //         headers: { 'Content-Type': 'application/json' },
    //         body: JSON.stringify(slackBody),
    //     });
    //     if (!response.ok) {
    //         throw new Error(`Failed to send error to Slack. Status: ${response.status}`);
    //     }
    //     console.log('Error sent successfully');
    // } catch (error) {
    //     console.error('Failed to send error to Slack:', error);
    // }
//} catch (error) {
//console.error(`Error verifying mobile number: ${error}`);
//await slackLogger('Error verifying mobile number', error.message, error, null, webHookURL);
//res.status(500).send({ message: "Internal Server Error", error: error.message });}
}