const express = require('express');
const router  = express.Router();
const stripe  = require('stripe')(process.env.STRIPE_SECRET_KEY);

router.post('/create-intent', async (req, res) => {
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount:      1250,   // €12.50 — amount is in cents
      currency:    'eur',
      description: 'Piercing Deposit — NR40 Athens',
      automatic_payment_methods: { enabled: true },
    });
    res.json({ clientSecret: paymentIntent.client_secret });
  } catch (err) {
    console.error('[Stripe] create-intent error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

router.post('/webhook', express.raw({ type: 'application/json' }), (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('[Stripe] Webhook signature error:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }
  if (event.type === 'payment_intent.succeeded') {
    const pi = event.data.object;
    console.log(`[Stripe] Payment succeeded: ${pi.id} — €${(pi.amount_received / 100).toFixed(2)}`);
  }
  res.json({ received: true });
});

module.exports = router;