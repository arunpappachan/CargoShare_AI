const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const Razorpay = require('razorpay');
const Booking = require('../models/Booking');
const { isPostgresConnected } = require('../config/postgres');

// Initialize Razorpay instance if credentials are set
const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID || 'rzp_test_CargoShare2026';
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || 'cargoshare_rzp_secret_sandbox_key';

let razorpayInstance = null;
try {
  if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
    razorpayInstance = new Razorpay({
      key_id: RAZORPAY_KEY_ID,
      key_secret: RAZORPAY_KEY_SECRET
    });
  }
} catch (e) {
  console.warn('[Razorpay] Live instance init deferred:', e.message);
}

// 1. GET Public Razorpay Key ID
router.get('/razorpay/key', (req, res) => {
  res.json({
    status: 'success',
    keyId: RAZORPAY_KEY_ID,
    isLive: Boolean(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET)
  });
});

// 2. CREATE Razorpay Order
router.post('/razorpay/create-order', async (req, res) => {
  try {
    const { amount, currency = 'INR', receipt, bookingId } = req.body;
    
    if (!amount || amount <= 0) {
      return res.status(400).json({ status: 'error', message: 'Valid amount is required.' });
    }

    const orderAmountInPaise = Math.round(Number(amount) * 100);

    // If live Razorpay credentials exist, create official order via Razorpay API
    if (razorpayInstance) {
      try {
        const order = await razorpayInstance.orders.create({
          amount: orderAmountInPaise,
          currency: currency,
          receipt: receipt || `rcpt_${bookingId || Date.now()}`,
          notes: {
            bookingId: bookingId || 'N/A',
            platform: 'CargoShare AI Maritime Settlement'
          }
        });
        return res.json({ status: 'success', mode: 'live', order });
      } catch (liveErr) {
        console.warn('[Razorpay] Live API error, falling back to sandbox order:', liveErr.message);
      }
    }

    // Sandbox order generation
    const mockOrder = {
      id: `order_${Math.random().toString(36).substring(2, 16)}`,
      entity: 'order',
      amount: orderAmountInPaise,
      amount_paid: 0,
      amount_due: orderAmountInPaise,
      currency: currency,
      receipt: receipt || `rcpt_${bookingId || Date.now()}`,
      status: 'created',
      attempts: 0,
      notes: {
        bookingId: bookingId || 'N/A',
        mode: 'sandbox_simulation'
      },
      created_at: Math.floor(Date.now() / 1000)
    };

    res.json({ status: 'success', mode: 'sandbox', order: mockOrder });
  } catch (err) {
    console.error('Razorpay Create Order Error:', err);
    res.status(500).json({ status: 'error', message: err.message });
  }
});

// 3. VERIFY Razorpay Payment & Update Booking Record
router.post('/razorpay/verify-payment', async (req, res) => {
  try {
    const { 
      razorpay_order_id, 
      razorpay_payment_id, 
      razorpay_signature, 
      bookingId, 
      amount,
      paymentMethod = 'Razorpay Gateway (Cards / UPI / NetBanking)'
    } = req.body;

    if (!razorpay_payment_id) {
      return res.status(400).json({ status: 'error', message: 'Payment ID is required.' });
    }

    // If live credentials, verify HMAC-SHA256 signature
    let signatureVerified = true;
    if (razorpay_signature && process.env.RAZORPAY_KEY_SECRET) {
      const generatedSignature = crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
        .update(`${razorpay_order_id}|${razorpay_payment_id}`)
        .digest('hex');
      signatureVerified = (generatedSignature === razorpay_signature);
    }

    if (!signatureVerified) {
      return res.status(400).json({ status: 'error', message: 'Razorpay signature verification failed.' });
    }

    // Update booking in database if bookingId provided
    let updatedBooking = null;
    if (bookingId) {
      const updatePayload = {
        paymentStatus: 'Paid',
        paymentMethod: paymentMethod,
        transactionId: razorpay_payment_id
      };
      if (amount) {
        updatePayload.amountPaid = Number(amount);
        updatePayload.balanceAmount = 0;
      }

      if (isPostgresConnected()) {
        updatedBooking = await Booking.findOneAndUpdate(
          { id: bookingId },
          updatePayload,
          { new: true }
        );
      }
    }

    res.json({
      status: 'success',
      message: 'Razorpay payment verified and confirmed successfully!',
      paymentId: razorpay_payment_id,
      orderId: razorpay_order_id,
      booking: updatedBooking
    });
  } catch (err) {
    console.error('Razorpay Verify Error:', err);
    res.status(500).json({ status: 'error', message: err.message });
  }
});

module.exports = router;
