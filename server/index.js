const express = require("express");
const Razorpay = require("razorpay");
const cors = require("cors");
const bodyParser = require('body-parser');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

const instance = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_SECRET
});

app.use(bodyParser.json());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors());

const calculateExpireBy = (startAt, period, interval) => {
    const intervalMapping = {
        daily: 1 * 24 * 60 * 60, // 1 day in seconds
        weekly: 7 * 24 * 60 * 60, // 1 week in seconds
        monthly: 30 * 24 * 60 * 60, // 30 days in seconds
        yearly: 365 * 24 * 60 * 60 // 1 year in seconds
    };

    const duration = intervalMapping[period.toLowerCase()] * interval;
    return startAt + duration;
};

// Endpoint to get all plans
app.get('/api/plans', async (req, res) => {
    try {
        const plans = await instance.plans.all();
        const firstThreePlans = plans.items.slice(0, 3); // Get the first three plans
        res.json(firstThreePlans); // Send the list of first three plans
    } catch (error) {
        console.error('Error fetching plans:', error);
        res.status(500).json({ error: error.message });
    }
});

// Endpoint to create a subscription
app.post('/api/create-subscription', async (req, res) => {
    try {
        const { plan_id, total_count, quantity, customer_notify, addons, notes, notify_info } = req.body;

        // Fetch plan details to get the plan amount and duration
        const plan = await instance.plans.fetch(plan_id);

        if (!plan) {
            return res.status(404).json({ error: 'Plan not found' });
        }

        const startAt = Math.floor(Date.now() / 1000);
        const expireBy = calculateExpireBy(startAt, plan.period, plan.interval);

        const subscription = await instance.subscriptions.create({
            plan_id,
            total_count,
            quantity,
            expire_by: expireBy,
            customer_notify,
            addons,
            notes,
            notify_info
        });

        res.json({ short_url: subscription.short_url, id: subscription.id }); // Return the short_url and id
    } catch (error) {
        console.error('Error creating subscription:', error);
        res.status(500).json({ error: error.message });
    }
});

// Endpoint to fetch subscription details
app.get('/api/create-subscription/:id', async (req, res) => {
    try {
        const subscriptionId = req.params.id;
        const subscription = await instance.subscriptions.fetch(subscriptionId);
        res.json(subscription);
    } catch (error) {
        console.error('Error fetching subscription:', error);
        res.status(500).json({ error: error.message });
    }
});

// Endpoint to cancel subscription
app.post('/api/cancel-subscription', async (req, res) => {
    try {
        const { subscription_id } = req.body;
        const cancellation = await instance.subscriptions.cancel(subscription_id);
        res.json(cancellation);
    } catch (error) {
        console.error('Error cancelling subscription:', error);
        res.status(500).json({ error: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`);
});
