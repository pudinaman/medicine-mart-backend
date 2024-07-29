const Billing = require('../models/billing.model');
const User = require('../models/user.model');
const { slackLogger } = require('../middlewares/webHook');

exports.createBilling = async (req, res) => {
    try {
        const user_id = req.body.user_id;
        const user = await User.findById(user_id);
        if (!user) {
            return res.status(404).send({ error: 'User not found' });
        }

        const billingInfo = { ...req.body };
        delete billingInfo.user_id;

        const existingBilling = await Billing.findOne({ user_id, 'billings': { $elemMatch: billingInfo } });
        if (existingBilling) {
            return res.status(400).json({ error: 'Billing information already exists' });
        }

        const billing = await Billing.findOneAndUpdate(
            { user_id },
            { $push: { billings: billingInfo } },
            { upsert: true, new: true }
        );

        res.status(201).json(billing);
    } catch (error) {
        console.error('Error creating billing:', error);
        slackLogger(error); // Log error to Slack
        res.status(500).json({ error: 'Error creating billing' });
    }
};

exports.getBillingByUserId = async (req, res) => {
    try {
        const user_id = req.params.user_id;
        const billing = await Billing.findOne({ user_id });
        if (!billing) {
            return res.status(404).json({ error: 'Billing information not found' });
        }

        res.json(billing.billings);
    } catch (error) {
        console.error('Error retrieving billing:', error);
        slackLogger(error); // Log error to Slack
        res.status(500).json({ error: 'Error retrieving billing information' });
    }
};

exports.updateBilling = async (req, res) => {
    try {
        const user_id = req.params.user_id;
        const billingInfo = { ...req.body };
        delete billingInfo.user_id;

        const billing = await Billing.findOneAndUpdate(
            { user_id },
            { $set: { billings: [billingInfo] } },
            { new: true }
        );

        if (!billing) {
            return res.status(404).json({ error: 'Billing information not found' });
        }

        res.json(billing);
    } catch (error) {
        console.error('Error updating billing:', error);
        slackLogger(error); // Log error to Slack
        res.status(500).json({ error: 'Error updating billing information' });
    }
};

exports.deleteBilling = async (req, res) => {
    try {
        const user_id = req.params.user_id;
        const billing = await Billing.findOneAndUpdate(
            { user_id },
            { $unset: { billings: 1 } },
            { new: true }
        );

        if (!billing) {
            return res.status(404).json({ error: 'Billing information not found' });
        }

        res.json({ message: 'Billing information deleted successfully' });
    } catch (error) {
        console.error('Error deleting billing:', error);
        slackLogger(error); // Log error to Slack
        res.status(500).json({ error: 'Error deleting billing information' });
    }
};

exports.getBillingById = async (req, res) => {
    try {
        const user_id = req.params.user_id;
        const billing_id = req.params.billing_id;
        const user = await Billing.findOne({ user_id });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const billing = user.billings.id(billing_id);

        if (!billing) {
            return res.status(404).json({ error: 'Billing information not found' });
        }

        res.json(billing);
    } catch (error) {
        console.error('Error fetching billing:', error);
        slackLogger(error); // Log error to Slack
        res.status(500).json({ error: 'Error fetching billing information' });
    }
};
