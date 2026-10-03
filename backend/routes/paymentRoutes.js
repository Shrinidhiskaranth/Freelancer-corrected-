const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const verifyToken = require('../middleware/authMiddleware');
const requireRole = require('../middleware/roleMiddleware');

const clientOnly = [verifyToken, requireRole('CLIENT')];

// Create checkout session
router.post('/create-checkout-session', clientOnly, paymentController.createCheckoutSession);

// Direct confirmation fallback (for testing without webhook tunnel setup)
router.post('/confirm-direct', clientOnly, paymentController.confirmDirectPayment);

// Razorpay Payment Routes
router.post('/razorpay-order', clientOnly, paymentController.createRazorpayOrder);
router.post('/razorpay-confirm', clientOnly, paymentController.confirmRazorpayPayment);

// Webhook endpoint (Requires express.raw parser config in app.js for real webhook signature validation)
router.post('/webhook', express.raw({ type: 'application/json' }), paymentController.handleWebhook);

module.exports = router;
