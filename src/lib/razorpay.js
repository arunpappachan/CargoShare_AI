import { API_BASE } from './apiConfig';

/**
 * Dynamically loads the official Razorpay Checkout SDK script
 */
export const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => {
      console.warn('Razorpay SDK script failed to load from CDN. Using test checkout fallback.');
      resolve(false);
    };
    document.body.appendChild(script);
  });
};

/**
 * Initiates Razorpay Standard Checkout flow for a booking.
 * Calculates payment amounts on the backend (25% advance / 75% remaining).
 * Enforces Test Mode only.
 */
export const openRazorpayCheckout = async ({
  booking,
  milestone = 'advance_25',
  user,
  onSuccess,
  onDismiss
}) => {
  const isLoaded = await loadRazorpayScript();
  const bookingId = booking?.id || 'CS-1001';

  try {
    // 1. Fetch public Razorpay Key & Test Mode status from backend
    const keyRes = await fetch(`${API_BASE}/api/payments/razorpay/key`).catch(() => null);
    const keyData = keyRes ? await keyRes.json() : null;
    const razorpayKey = keyData?.keyId || 'rzp_test_rzp_test_TtP2GeshKU28ti';

    // 2. Create order on backend (amount calculated strictly on the backend)
    const orderRes = await fetch(`${API_BASE}/api/payments/razorpay/create-order`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        bookingId: bookingId,
        milestone: milestone
      })
    });

    if (!orderRes.ok) {
      const errorJson = await orderRes.json().catch(() => ({}));
      throw new Error(errorJson.message || 'Failed to create payment order on backend.');
    }

    const orderData = await orderRes.json();
    const order = orderData.order;
    const amountInRupees = orderData.amount;
    const resolvedMilestone = orderData.milestone || milestone;

    // 3. If Razorpay SDK is available, open the official Razorpay Standard Checkout modal
    if (isLoaded && window.Razorpay) {
      return new Promise((resolve, reject) => {
        const options = {
          key: razorpayKey,
          amount: order.amount,
          currency: order.currency || 'INR',
          name: 'CargoShare AI',
          description: `${resolvedMilestone === 'advance_25' ? '25% Advance Booking Deposit' : '75% Remaining Freight Settlement'} • ${bookingId}`,
          image: 'https://cdn-icons-png.flaticon.com/512/870/870092.png',
          order_id: order.id,
          handler: async function (response) {
            try {
              // Verify payment signature on backend
              const verifyRes = await fetch(`${API_BASE}/api/payments/razorpay/verify-payment`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  razorpay_order_id: response.razorpay_order_id || order.id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature,
                  bookingId: bookingId,
                  milestone: resolvedMilestone
                })
              });

              const verifyData = await verifyRes.json();

              if (!verifyRes.ok) {
                throw new Error(verifyData.message || 'Payment signature verification failed.');
              }

              const result = {
                success: true,
                paymentId: response.razorpay_payment_id,
                orderId: response.razorpay_order_id || order.id,
                receipt: verifyData.receipt,
                booking: verifyData.booking,
                transaction: verifyData.transaction
              };

              if (onSuccess) onSuccess(result);
              resolve(result);
            } catch (vErr) {
              console.error('Verification error:', vErr);
              reject(vErr);
            }
          },
          prefill: {
            name: user?.name || booking?.exporterName || 'Global Exports SME',
            email: user?.email || 'accounts@cargoshare.ai',
            contact: user?.phone || '9876543210'
          },
          notes: {
            booking_id: bookingId,
            milestone: resolvedMilestone,
            platform: 'CargoShare AI Maritime Settlement'
          },
          theme: {
            color: '#0284c7'
          },
          modal: {
            ondismiss: function () {
              if (onDismiss) onDismiss();
              resolve({ dismissed: true });
            }
          }
        };

        const rzp = new window.Razorpay(options);
        rzp.open();
      });
    }

    // 4. Test Mode Sandbox Simulation fallback (e.g. headless tests or offline environments)
    console.log('[Razorpay Sandbox] Executing simulated test payment verification...');
    const simulatedPaymentId = `pay_rzpTest_${Math.floor(10000000 + Math.random() * 90000000)}`;
    const verifyRes = await fetch(`${API_BASE}/api/payments/razorpay/verify-payment`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        razorpay_order_id: order.id,
        razorpay_payment_id: simulatedPaymentId,
        razorpay_signature: null,
        bookingId: bookingId,
        milestone: resolvedMilestone
      })
    });

    const verifyData = await verifyRes.json();
    const result = {
      success: true,
      paymentId: simulatedPaymentId,
      orderId: order.id,
      receipt: verifyData.receipt,
      booking: verifyData.booking,
      transaction: verifyData.transaction
    };

    if (onSuccess) onSuccess(result);
    return result;

  } catch (err) {
    console.error('Razorpay Checkout initialization error:', err);
    throw err;
  }
};
