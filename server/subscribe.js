const Razorpay = require('razorpay');
require('dotenv').config();

var instance = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_SECRET
});

instance.subscriptions.create({
    plan_id: "plan_OCfYwVV27iaSO5",
    customer_notify: 1,
    quantity: 5,
    total_count: 6,
    start_at: Math.floor(Date.now() / 1000) + 3600, // Start 1 hour from now
}).then((response) => {
    console.log('Subscription created:', response);
}).catch((error) => {
    console.log('Error:', error);
});
