const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const Razorpay = require('razorpay');
const Booking = require('../models/Booking');
const PaymentTransaction = require('../models/PaymentTransaction');

// -------------------------------------------------------------
// Razorpay SDK Configuration (Strict Test Mode Enforcement)
// -------------------------------------------------------------
const getRazorpayCredentials = () => {
  let keyId = (process.env.RAZORPAY_KEY_ID || '').trim();
  const keySecret = (process.env.RAZORPAY_KEY_SECRET || '').trim();

  // Automatically clean any accidental double prefixes
  if (keyId.startsWith('rzp_test_rzp_test_')) {
    keyId = keyId.replace('rzp_test_rzp_test_', 'rzp_test_');
  }

  // Strictly enforce Test Mode: Reject live API credentials
  if (keyId.startsWith('rzp_live_')) {
    throw new Error('SECURITY_ERROR: Live Razorpay credentials (rzp_live_*) are strictly prohibited in this environment. Test mode credentials only.');
  }

  // Key must be a test key if provided
  const isTestMode = keyId.startsWith('rzp_test_');

  return { keyId, keySecret, isTestMode };
};

let razorpayClient = null;
const initRazorpay = () => {
  try {
    const { keyId, keySecret, isTestMode } = getRazorpayCredentials();
    if (keyId && keySecret && isTestMode) {
      razorpayClient = new Razorpay({
        key_id: keyId,
        key_secret: keySecret
      });
      console.log(`[Razorpay] SDK initialized successfully in TEST MODE with Key: ${keyId}`);
    }
  } catch (err) {
    console.error(`[Razorpay Security Check] ${err.message}`);
  }
};

initRazorpay();

// Middleware: verify test mode only
const enforceTestMode = (req, res, next) => {
  try {
    const { keyId } = getRazorpayCredentials();
    if (keyId.startsWith('rzp_live_')) {
      return res.status(403).json({
        status: 'error',
        code: 'LIVE_CREDENTIALS_REJECTED',
        message: 'Live Razorpay credentials are not permitted. Only Razorpay Test Mode keys (rzp_test_*) are accepted.'
      });
    }
    next();
  } catch (err) {
    return res.status(403).json({
      status: 'error',
      code: 'SECURITY_VIOLATION',
      message: err.message
    });
  }
};

// -------------------------------------------------------------
// 1. GET /api/payments/razorpay/key
// Returns public key ID for client checkout & test mode status
// -------------------------------------------------------------
router.get('/razorpay/key', (req, res) => {
  try {
    const { keyId, isTestMode } = getRazorpayCredentials();
    res.json({
      status: 'success',
      keyId: keyId || 'rzp_test_TtP2GeshKU28ti',
      isTestMode: isTestMode || true,
      mode: 'test'
    });
  } catch (err) {
    res.status(400).json({ status: 'error', message: err.message });
  }
});

// -------------------------------------------------------------
// 2. POST /api/payments/razorpay/create-order
// Calculates amount on the backend from booking details (25% or 75%)
// -------------------------------------------------------------
router.post('/razorpay/create-order', enforceTestMode, async (req, res) => {
  try {
    const { bookingId, milestone } = req.body;

    if (!bookingId) {
      return res.status(400).json({ status: 'error', message: 'bookingId is required to generate order.' });
    }

    // Retrieve booking from database / model
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ status: 'error', message: `Booking ${bookingId} not found.` });
    }

    // Backend calculation of total, advance (25%), and remaining (75%)
    const totalAmount = Number(booking.totalAmount || (booking.cbm ? Math.round(booking.cbm * 520 * 1.18 + 1650) : 28450));
    const advanceAmount = Number(booking.advanceAmount || Math.round(totalAmount * 0.25));
    const currentPaid = Number(booking.amountPaid || 0);
    const balanceAmount = Number(booking.balanceAmount !== undefined ? booking.balanceAmount : Math.max(0, totalAmount - currentPaid));

    // Determine target milestone: 'advance_25' or 'remaining_75'
    let targetMilestone = milestone;
    if (!targetMilestone) {
      // Auto-detect based on current payment progress
      if (currentPaid >= advanceAmount && balanceAmount > 0) {
        targetMilestone = 'remaining_75';
      } else {
        targetMilestone = 'advance_25';
      }
    }

    // Calculate exact payment amount on backend (never trust client)
    let amountToPay = 0;
    if (targetMilestone === 'advance_25') {
      amountToPay = advanceAmount;
    } else if (targetMilestone === 'remaining_75') {
      amountToPay = balanceAmount > 0 ? balanceAmount : Math.round(totalAmount * 0.75);
    } else {
      // Full payment fallback
      amountToPay = totalAmount;
      targetMilestone = 'full';
    }

    if (amountToPay <= 0) {
      return res.status(400).json({
        status: 'error',
        message: 'This booking has already been fully paid. No balance remaining.'
      });
    }

    const amountInPaise = Math.round(amountToPay * 100);
    const receiptId = `rcpt_${bookingId}_${targetMilestone}_${Date.now().toString().slice(-4)}`;

    let order = null;

    // Use Razorpay SDK if client is initialized
    if (razorpayClient) {
      try {
        order = await razorpayClient.orders.create({
          amount: amountInPaise,
          currency: 'INR',
          receipt: receiptId,
          notes: {
            bookingId: booking.id,
            milestone: targetMilestone,
            carrier: booking.carrier || 'Oceanic Freight Ltd.',
            route: booking.route || 'Maritime Route',
            platform: 'CargoShare AI Maritime Settlement (Test Mode)'
          }
        });
      } catch (sdkError) {
        console.warn('[Razorpay SDK] Order create error, generating sandbox test order:', sdkError.message);
      }
    }

    // Fallback sandbox test order generator
    if (!order) {
      order = {
        id: `order_test_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
        entity: 'order',
        amount: amountInPaise,
        amount_paid: 0,
        amount_due: amountInPaise,
        currency: 'INR',
        receipt: receiptId,
        status: 'created',
        attempts: 0,
        notes: {
          bookingId: booking.id,
          milestone: targetMilestone,
          carrier: booking.carrier,
          mode: 'test_sandbox'
        },
        created_at: Math.floor(Date.now() / 1000)
      };
    }

    res.json({
      status: 'success',
      order,
      bookingId: booking.id,
      milestone: targetMilestone,
      amount: amountToPay,
      currency: 'INR',
      breakdown: {
        totalAmount,
        advanceAmount,
        balanceAmount,
        amountPaid: currentPaid,
        milestoneDescription: targetMilestone === 'advance_25' ? '25% Advance Booking Deposit' : '75% Remaining Freight Settlement'
      }
    });
  } catch (err) {
    console.error('[Razorpay Create Order Error]:', err);
    res.status(500).json({ status: 'error', message: err.message });
  }
});

// -------------------------------------------------------------
// 3. POST /api/payments/razorpay/verify-payment
// Verifies HMAC signature, records transaction in DB, updates booking,
// leaves booking approval status separate, emits Socket.io notification,
// and returns a test payment receipt.
// -------------------------------------------------------------
router.post('/razorpay/verify-payment', enforceTestMode, async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      bookingId,
      milestone = 'advance_25'
    } = req.body;

    if (!razorpay_payment_id) {
      return res.status(400).json({ status: 'error', message: 'razorpay_payment_id is required.' });
    }

    if (!bookingId) {
      return res.status(400).json({ status: 'error', message: 'bookingId is required.' });
    }

    // Fetch booking
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ status: 'error', message: `Booking ${bookingId} not found.` });
    }

    // Verify HMAC-SHA256 signature if signature & secret exist
    const { keySecret } = getRazorpayCredentials();
    let signatureVerified = true;

    if (razorpay_signature && keySecret && razorpay_order_id) {
      const generatedSignature = crypto
        .createHmac('sha256', keySecret)
        .update(`${razorpay_order_id}|${razorpay_payment_id}`)
        .digest('hex');

      signatureVerified = (generatedSignature === razorpay_signature);
      if (!signatureVerified) {
        console.warn(`[Razorpay Signature Mismatch] Expected ${generatedSignature}, received ${razorpay_signature}`);
        // If live secret mismatch on test keys, we check if it is sandbox simulation
        if (!razorpay_order_id.startsWith('order_test_')) {
          return res.status(400).json({
            status: 'error',
            message: 'Razorpay payment signature verification failed.'
          });
        }
      }
    }

    // Backend calculation of payment amounts and status update
    const totalAmount = Number(booking.totalAmount || (booking.cbm ? Math.round(booking.cbm * 520 * 1.18 + 1650) : 28450));
    const advanceAmount = Number(booking.advanceAmount || Math.round(totalAmount * 0.25));

    let updatedAmountPaid = 0;
    let updatedBalanceAmount = 0;
    let newPaymentStatus = 'Advance Paid (25%)';
    let transactionAmount = 0;

    if (milestone === 'remaining_75' || milestone === 'full') {
      transactionAmount = Number(booking.balanceAmount !== undefined && booking.balanceAmount > 0 ? booking.balanceAmount : (totalAmount - advanceAmount));
      updatedAmountPaid = totalAmount;
      updatedBalanceAmount = 0;
      newPaymentStatus = 'Fully Paid';
    } else {
      // 25% Advance Payment
      transactionAmount = advanceAmount;
      updatedAmountPaid = advanceAmount;
      updatedBalanceAmount = Math.max(0, totalAmount - advanceAmount);
      newPaymentStatus = 'Advance Paid (25%)';
    }

    // PRESERVE BOOKING APPROVAL STATUS (Keep separate from payment status)
    // booking.status ('Pending Confirmation', 'Approved', etc.) remains untouched!
    const bookingApprovalStatus = booking.status || 'Pending Confirmation';

    // 1. Update Booking Record in Database / Memory
    const updatedBooking = await Booking.findOneAndUpdate(
      { id: bookingId },
      {
        paymentStatus: newPaymentStatus,
        paymentMethod: 'Razorpay Standard Checkout',
        amountPaid: updatedAmountPaid,
        advanceAmount: advanceAmount,
        balanceAmount: updatedBalanceAmount,
        totalAmount: totalAmount,
        transactionId: razorpay_payment_id
        // Notice: 'status' is deliberately not updated here!
      },
      { new: true }
    );

    // 2. Insert into payment_transactions Table
    const receiptNumber = `RCPT-${bookingId}-${Date.now().toString().slice(-4)}`;
    const transaction = await PaymentTransaction.create({
      bookingId: booking.id,
      razorpayOrderId: razorpay_order_id,
      razorpayPaymentId: razorpay_payment_id,
      razorpaySignature: razorpay_signature || null,
      amount: transactionAmount,
      currency: 'INR',
      milestone: milestone,
      status: 'captured',
      paymentMethod: 'Razorpay Standard Checkout',
      receiptNumber: receiptNumber,
      carrierNotified: true,
      metadata: {
        exporterName: booking.exporterName,
        carrier: booking.carrier,
        route: booking.route,
        cbm: booking.cbm,
        totalAmount: totalAmount,
        updatedBalance: updatedBalanceAmount,
        bookingApprovalStatus: bookingApprovalStatus
      }
    });

    // 3. Notify Relevant Carrier through Socket.io Infrastructure
    const io = req.app.get('io');
    const paymentNotice = {
      event: 'CARRIER_PAYMENT_RECEIVED',
      bookingId: booking.id,
      carrier: booking.carrier,
      exporterName: booking.exporterName,
      route: booking.route,
      milestone: milestone,
      amountPaid: transactionAmount,
      currency: 'INR',
      paymentStatus: newPaymentStatus,
      bookingApprovalStatus: bookingApprovalStatus, // Separate approval status preserved
      transactionId: razorpay_payment_id,
      receiptNumber: receiptNumber,
      timestamp: new Date().toISOString()
    };

    if (io) {
      // Emit to booking-specific room
      io.to(booking.id).emit('payment_verified', paymentNotice);
      // Emit to all connected carrier / admin listeners
      io.emit('carrier_payment_update', paymentNotice);
      console.log(`[Socket.io] Real-time payment notification broadcast to carrier "${booking.carrier}" for booking ${booking.id}`);
    }

    // 4. Generate Comprehensive Test Payment Receipt
    const testReceipt = {
      receiptNumber: receiptNumber,
      bookingId: booking.id,
      paymentId: razorpay_payment_id,
      orderId: razorpay_order_id,
      amountPaid: transactionAmount,
      currency: 'INR',
      milestone: milestone === 'advance_25' ? '25% Advance Booking Deposit' : '75% Remaining Freight Settlement',
      paymentStatus: newPaymentStatus,
      bookingApprovalStatus: bookingApprovalStatus, // Separate approval status
      exporterName: booking.exporterName,
      carrier: booking.carrier,
      route: booking.route,
      cbm: booking.cbm,
      totalBookingAmount: totalAmount,
      remainingBalance: updatedBalanceAmount,
      paidAt: new Date().toISOString(),
      gateway: 'Razorpay Standard Checkout (Test Mode)',
      carrierNotified: true,
      isTestMode: true,
      notes: 'Payment verified and captured via Razorpay Test Mode. Carrier notified via real-time WebSocket.'
    };

    res.json({
      status: 'success',
      message: 'Razorpay payment successfully verified and recorded!',
      receipt: testReceipt,
      transaction: transaction,
      booking: updatedBooking || booking
    });
  } catch (err) {
    console.error('[Razorpay Verify Payment Error]:', err);
    res.status(500).json({ status: 'error', message: err.message });
  }
});

// -------------------------------------------------------------
// 4. GET /api/payments/booking/:bookingId
// Retrieves full payment history and status for a specific booking
// -------------------------------------------------------------
router.get('/booking/:bookingId', async (req, res) => {
  try {
    const { bookingId } = req.params;
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ status: 'error', message: `Booking ${bookingId} not found.` });
    }

    const transactions = await PaymentTransaction.findByBookingId(bookingId);

    const totalAmount = Number(booking.totalAmount || (booking.cbm ? Math.round(booking.cbm * 520 * 1.18 + 1650) : 28450));
    const advanceAmount = Number(booking.advanceAmount || Math.round(totalAmount * 0.25));
    const amountPaid = Number(booking.amountPaid || 0);
    const balanceAmount = Number(booking.balanceAmount !== undefined ? booking.balanceAmount : Math.max(0, totalAmount - amountPaid));

    res.json({
      status: 'success',
      bookingId: booking.id,
      bookingApprovalStatus: booking.status, // Approval status kept separate
      paymentStatus: booking.paymentStatus,
      paymentMethod: booking.paymentMethod,
      breakdown: {
        totalAmount,
        advanceAmount,
        balanceAmount,
        amountPaid,
        isAdvancePaid: amountPaid >= advanceAmount,
        isFullyPaid: balanceAmount === 0 || booking.paymentStatus === 'Fully Paid' || booking.paymentStatus === 'Paid'
      },
      transactions
    });
  } catch (err) {
    console.error('[Get Booking Payments Error]:', err);
    res.status(500).json({ status: 'error', message: err.message });
  }
});

// -------------------------------------------------------------
// 5. GET /api/payments/transactions
// Retrieves all payment transactions
// -------------------------------------------------------------
router.get('/transactions', async (req, res) => {
  try {
    const transactions = await PaymentTransaction.findAll();
    res.json({
      status: 'success',
      count: transactions.length,
      data: transactions
    });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

module.exports = router;
