const Payment = require('../models/Payment');
const Request = require('../models/Request');
const Refund = require('../models/Refund');
const Settlement = require('../models/Settlement');
const Notification = require('../models/Notification');
const AuditLog = require('../models/AuditLog');
const PlatformSettings = require('../models/PlatformSettings');
const crypto = require('crypto');

// Helper to get platform commission rate
const getCommissionRate = async () => {
  try {
    const settings = await PlatformSettings.findOne({});
    return settings ? settings.platformFeePercent : 5;
  } catch (e) {
    return 5;
  }
};

// @desc    Initiate payment order for a booking or service
// @route   POST /api/payments/create-order
// @access  Private
exports.createPaymentOrder = async (req, res) => {
  try {
    const { bookingId, paymentMethod = 'UPI', paymentType = 'Advance Token', customAmount, notes = '' } = req.body;

    if (!bookingId) {
      return res.status(400).json({ success: false, message: 'Booking ID is required' });
    }

    const booking = await Request.findById(bookingId)
      .populate('itemId')
      .populate('receiver', 'name email phone');

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    if (booking.sender.toString() !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ success: false, message: 'Not authorized to pay for this booking' });
    }

    // Check if there is already a Captured payment for this booking
    const existingCaptured = await Payment.findOne({ bookingId: booking._id, status: 'Captured' });
    if (existingCaptured && paymentType === 'Advance Token') {
      return res.status(400).json({
        success: false,
        message: 'This booking has already been paid for and confirmed.',
        paymentId: existingCaptured._id
      });
    }

    let amount = customAmount;
    if (!amount) {
      if (paymentType === 'Advance Token') {
        amount = booking.pricingDetails?.deposit || booking.pricingDetails?.baseAmount || booking.proposedPrice || 2000;
      } else {
        amount = booking.pricingDetails?.totalAmount || booking.proposedPrice || 1000;
      }
    }

    const orderId = `order_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    // Create payment record in 'Created' state
    const payment = await Payment.create({
      bookingId: booking._id,
      payer: req.user.id,
      payee: booking.receiver?._id || booking.receiver,
      amount: Number(amount),
      currency: 'INR',
      gateway: process.env.RAZORPAY_KEY_ID ? 'Razorpay' : 'Razorpay (Test / Sandbox)',
      gatewayOrderId: orderId,
      status: 'Created',
      paymentMethod,
      itemType: booking.itemType,
      itemTitle: booking.itemId?.title || booking.itemId?.businessName || 'StaySync Booking',
      notes: notes || paymentType
    });

    res.status(201).json({
      success: true,
      message: 'Payment order created successfully',
      order: {
        id: orderId,
        amount,
        currency: 'INR',
        paymentId: payment._id,
        itemTitle: payment.itemTitle,
        razorpayKeyId: process.env.RAZORPAY_KEY_ID || 'rzp_test_staysync_demo'
      }
    });
  } catch (error) {
    console.error('Error in createPaymentOrder:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Verify and capture payment callback
// @route   POST /api/payments/verify
// @access  Private
exports.verifyPayment = async (req, res) => {
  try {
    const { paymentId, gatewayPaymentId, gatewayOrderId, gatewaySignature } = req.body;

    const payment = await Payment.findById(paymentId);
    if (!payment) {
      return res.status(404).json({ success: false, message: 'Payment record not found' });
    }

    // Enforce payer authorization
    if (payment.payer.toString() !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ success: false, message: 'Not authorized to verify this payment record' });
    }

    // Idempotency: Prevent duplicate payment verification
    if (payment.status === 'Captured') {
      return res.status(200).json({
        success: true,
        message: 'Payment has already been captured and verified.',
        data: payment
      });
    }

    // Server-side Razorpay signature verification if RAZORPAY_KEY_SECRET is provided
    if (process.env.RAZORPAY_KEY_SECRET && gatewaySignature && gatewayOrderId && gatewayPaymentId) {
      const generatedSignature = crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
        .update(`${gatewayOrderId}|${gatewayPaymentId}`)
        .digest('hex');

      if (generatedSignature !== gatewaySignature) {
        payment.status = 'Failed';
        await payment.save();
        return res.status(400).json({
          success: false,
          message: 'Razorpay signature verification failed. Untrusted payment attempt.'
        });
      }
    }

    const resolvedTxnId = gatewayPaymentId || `pay_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;

    payment.gatewayPaymentId = resolvedTxnId;
    payment.status = 'Captured';
    await payment.save();

    // Update matching booking request payment status and transition status
    const booking = await Request.findById(payment.bookingId);
    if (booking) {
      booking.paymentStatus = 'Paid';
      booking.paymentReference = resolvedTxnId;
      if (booking.status === 'Payment Pending' || booking.status === 'Owner Approved' || booking.status === 'Pending') {
        booking.status = 'Confirmed';
      }
      await booking.save();
    }

    // Notify payer & payee
    await Notification.create({
      user: payment.payer,
      title: 'Payment Successful',
      message: `Your payment of ₹${payment.amount.toLocaleString('en-IN')} for "${payment.itemTitle}" has been confirmed (Ref: ${resolvedTxnId}).`,
      type: 'Request'
    });

    await Notification.create({
      user: payment.payee,
      title: 'Payment Received',
      message: `You have received a payment of ₹${payment.amount.toLocaleString('en-IN')} for "${payment.itemTitle}" (Ref: ${resolvedTxnId}).`,
      type: 'Request'
    });

    res.json({
      success: true,
      message: 'Payment verified and captured successfully',
      data: payment
    });
  } catch (error) {
    console.error('Error in verifyPayment:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Razorpay Webhook Handler
// @route   POST /api/payments/webhook
// @access  Public (Webhook verification via secret)
exports.handleRazorpayWebhook = async (req, res) => {
  try {
    const webhookSignature = req.headers['x-razorpay-signature'];
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

    if (webhookSecret && webhookSignature) {
      const shasum = crypto.createHmac('sha256', webhookSecret);
      shasum.update(JSON.stringify(req.body));
      const digest = shasum.digest('hex');

      if (digest !== webhookSignature) {
        return res.status(400).json({ status: 'Invalid webhook signature' });
      }
    }

    const { event, payload } = req.body;

    if (event === 'payment.captured') {
      const paymentEntity = payload.payment.entity;
      const orderId = paymentEntity.order_id;
      const paymentId = paymentEntity.id;

      const payment = await Payment.findOne({ gatewayOrderId: orderId });
      if (payment && payment.status !== 'Captured') {
        payment.status = 'Captured';
        payment.gatewayPaymentId = paymentId;
        await payment.save();

        await Request.findByIdAndUpdate(payment.bookingId, {
          paymentStatus: 'Paid',
          paymentReference: paymentId,
          status: 'Confirmed'
        });
      }
    }

    res.json({ status: 'ok' });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// @desc    Get printable / downloadable PDF invoice data
// @route   GET /api/payments/invoice/:paymentId
// @access  Private
exports.getPaymentInvoice = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.paymentId)
      .populate('payer', 'name email phone currentCity')
      .populate('payee', 'name email phone')
      .populate({
        path: 'bookingId',
        populate: { path: 'itemId' }
      });

    if (!payment) {
      return res.status(404).json({ success: false, message: 'Payment record not found' });
    }

    const isAuthorized =
      payment.payer._id.toString() === req.user.id ||
      payment.payee._id.toString() === req.user.id ||
      req.user.role === 'ADMIN' ||
      req.user.role === 'SUPER_ADMIN';

    if (!isAuthorized) {
      return res.status(403).json({ success: false, message: 'Not authorized to view this invoice' });
    }

    const invoiceNumber = `INV-${new Date(payment.createdAt).getFullYear()}-${payment._id.toString().slice(-6).toUpperCase()}`;
    const baseAmount = Math.round(payment.amount / 1.18);
    const gstAmount = payment.amount - baseAmount;

    const invoiceData = {
      invoiceNumber,
      date: payment.createdAt,
      paymentId: payment._id,
      transactionId: payment.gatewayPaymentId || 'N/A',
      orderId: payment.gatewayOrderId,
      paymentMethod: payment.paymentMethod,
      status: payment.status,
      customer: {
        name: payment.payer.name,
        email: payment.payer.email,
        phone: payment.payer.phone || 'N/A',
        city: payment.payer.currentCity || 'Indore'
      },
      merchant: {
        name: payment.payee.name,
        email: payment.payee.email,
        phone: payment.payee.phone || 'N/A'
      },
      item: {
        title: payment.itemTitle,
        type: payment.itemType,
        notes: payment.notes
      },
      bookingDetails: payment.bookingId ? {
        roomNumber: payment.bookingId.assignedBed?.roomNumber || 'Assigned Room',
        bedNumber: payment.bookingId.assignedBed?.bedNumber || 'Assigned Bed',
        checkInDate: payment.bookingId.bookingDetails?.checkInDate,
        checkOutDate: payment.bookingId.bookingDetails?.checkOutDate
      } : null,
      financials: {
        baseAmount,
        cgst: Math.round(gstAmount / 2),
        sgst: Math.round(gstAmount / 2),
        totalAmount: payment.amount,
        currency: 'INR'
      }
    };

    res.json({
      success: true,
      invoice: invoiceData
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Request a refund (Resident or Owner)
// @route   POST /api/payments/refund
// @access  Private
exports.requestRefund = async (req, res) => {
  try {
    const { bookingId, reason } = req.body;

    if (!bookingId || !reason) {
      return res.status(400).json({ success: false, message: 'Booking ID and cancellation reason are required' });
    }

    const booking = await Request.findById(bookingId).populate('itemId');
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    const isResident = booking.sender.toString() === req.user.id;
    const isOwner = booking.receiver.toString() === req.user.id;
    const isAdmin = req.user.role === 'ADMIN' || req.user.role === 'SUPER_ADMIN';

    if (!isResident && !isOwner && !isAdmin) {
      return res.status(403).json({ success: false, message: 'Not authorized to request refund for this booking' });
    }

    const payment = await Payment.findOne({ bookingId: booking._id, status: 'Captured' });
    if (!payment) {
      return res.status(400).json({ success: false, message: 'No captured payment found for this booking to refund' });
    }

    // Check if refund already exists
    const existingRefund = await Refund.findOne({ booking: booking._id, status: { $in: ['Pending', 'Approved', 'Processed'] } });
    if (existingRefund) {
      return res.status(400).json({ success: false, message: 'A refund request is already active for this booking', refund: existingRefund });
    }

    // Cancellation Tier Calculation:
    // If checkInDate is > 7 days away: 100% refund
    // If checkInDate is 2-7 days away: 50% refund
    // If < 2 days: 0% / Non-refundable
    let refundPercentage = 100;
    let ruleApplied = 'Full Refund (>7 days before check-in)';
    const checkIn = booking.bookingDetails?.checkInDate;

    if (checkIn) {
      const now = new Date();
      const diffDays = Math.ceil((new Date(checkIn).getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      if (diffDays >= 7) {
        refundPercentage = 100;
        ruleApplied = 'Full Refund (>7 days before move-in)';
      } else if (diffDays >= 2) {
        refundPercentage = 50;
        ruleApplied = 'Partial 50% Refund (2 to 7 days before move-in)';
      } else {
        refundPercentage = 25;
        ruleApplied = 'Emergency 25% Token Refund (<48 hours before move-in)';
      }
    }

    const calculatedRefundAmount = Math.round((payment.amount * refundPercentage) / 100);

    const refund = await Refund.create({
      booking: booking._id,
      payment: payment._id,
      payer: booking.sender,
      payee: booking.receiver,
      amount: calculatedRefundAmount,
      originalAmount: payment.amount,
      refundType: refundPercentage === 100 ? 'Full' : 'Partial',
      reason,
      cancellationRuleApplied: ruleApplied,
      status: 'Pending'
    });

    // Update booking status
    booking.status = 'Refund Pending';
    await booking.save();

    await Notification.create({
      user: booking.sender,
      title: 'Refund Request Submitted',
      message: `Your refund request of ₹${calculatedRefundAmount.toLocaleString('en-IN')} (${ruleApplied}) is submitted for approval.`,
      type: 'Request'
    });

    res.status(201).json({
      success: true,
      message: 'Refund request submitted successfully',
      data: refund
    });
  } catch (error) {
    console.error('Error in requestRefund:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all refunds (Admin / Owner / Resident)
// @route   GET /api/payments/refunds
// @access  Private
exports.getRefunds = async (req, res) => {
  try {
    let query = {};
    if (req.user.role !== 'ADMIN' && req.user.role !== 'SUPER_ADMIN') {
      query = { $or: [{ payer: req.user.id }, { payee: req.user.id }] };
    }

    const refunds = await Refund.find(query)
      .populate('payer', 'name email phone')
      .populate('payee', 'name email phone')
      .populate('booking')
      .populate('payment')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: refunds.length,
      data: refunds
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Approve / Process Refund (Admin Only)
// @route   PUT /api/payments/refunds/:id/approve
// @access  Private (Admin Only)
exports.approveRefund = async (req, res) => {
  try {
    const { action, adminNotes } = req.body; // 'APPROVE' or 'REJECT'
    const refund = await Refund.findById(req.params.id)
      .populate('payer')
      .populate('booking');

    if (!refund) {
      return res.status(404).json({ success: false, message: 'Refund request not found' });
    }

    if (action === 'APPROVE') {
      const razorpayRefundId = `rfn_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      refund.status = 'Processed';
      refund.razorpayRefundId = razorpayRefundId;
      refund.approvedBy = req.user.id;
      refund.approvedAt = new Date();
      refund.adminNotes = adminNotes || 'Approved by administrator';
      await refund.save();

      // Update booking status
      if (refund.booking) {
        refund.booking.status = refund.refundType === 'Full' ? 'Refunded' : 'Partially Refunded';
        refund.booking.paymentStatus = 'Refunded';
        await refund.booking.save();
      }

      // Notify resident
      await Notification.create({
        user: refund.payer._id,
        title: 'Refund Approved & Dispatched',
        message: `Your refund of ₹${refund.amount.toLocaleString('en-IN')} has been approved and processed back to your original payment method (Ref: ${razorpayRefundId}).`,
        type: 'Request'
      });

      // Audit Log
      await AuditLog.create({
        actor: req.user.id,
        actorName: req.user.name,
        action: 'REPORT_RESOLVED',
        targetType: 'Report',
        targetId: refund._id.toString(),
        reason: `Refund of ₹${refund.amount} approved. ${adminNotes || ''}`,
        metadata: { refundId: refund._id, amount: refund.amount }
      });

      return res.json({
        success: true,
        message: 'Refund approved and marked as processed',
        data: refund
      });
    } else {
      refund.status = 'Rejected';
      refund.adminNotes = adminNotes || 'Rejected by administrator';
      refund.approvedBy = req.user.id;
      refund.approvedAt = new Date();
      await refund.save();

      if (refund.booking) {
        refund.booking.status = 'Cancelled';
        await refund.booking.save();
      }

      await Notification.create({
        user: refund.payer._id,
        title: 'Refund Request Declined',
        message: `Your refund request was declined. Reason: ${adminNotes || 'Does not qualify under cancellation terms'}.`,
        type: 'Request'
      });

      return res.json({
        success: true,
        message: 'Refund request rejected',
        data: refund
      });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get Owner Settlements & Commission Ledger
// @route   GET /api/payments/settlements/owner
// @access  Private (Owner Only)
exports.getOwnerSettlements = async (req, res) => {
  try {
    const ownerId = req.user.id;
    const commissionRate = await getCommissionRate();

    // Fetch all Captured payments where payee is this owner
    const payments = await Payment.find({ payee: ownerId, status: 'Captured' })
      .populate('bookingId')
      .populate('payer', 'name email');

    const totalGross = payments.reduce((sum, p) => sum + p.amount, 0);
    const totalCommission = Math.round((totalGross * commissionRate) / 100);
    const netEarnings = totalGross - totalCommission;

    // Fetch existing settlements
    const settlements = await Settlement.find({ owner: ownerId }).sort({ createdAt: -1 });
    const settledAmount = settlements
      .filter(s => s.status === 'Settled')
      .reduce((sum, s) => sum + s.netPayoutAmount, 0);

    const pendingPayout = Math.max(0, netEarnings - settledAmount);

    res.json({
      success: true,
      summary: {
        totalGross,
        commissionRate,
        totalCommission,
        netEarnings,
        settledAmount,
        pendingPayout
      },
      settlements,
      recentPayments: payments.slice(0, 10)
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get All Settlements (Admin Only)
// @route   GET /api/payments/settlements/admin
// @access  Private (Admin Only)
exports.getAdminSettlements = async (req, res) => {
  try {
    const settlements = await Settlement.find({})
      .populate('owner', 'name email phone currentCity')
      .sort({ createdAt: -1 });

    const totalSettled = settlements
      .filter(s => s.status === 'Settled')
      .reduce((sum, s) => sum + s.netPayoutAmount, 0);

    const totalPending = settlements
      .filter(s => s.status === 'Pending' || s.status === 'Processing')
      .reduce((sum, s) => sum + s.netPayoutAmount, 0);

    const commissionCollected = settlements
      .filter(s => s.status === 'Settled')
      .reduce((sum, s) => sum + s.commissionAmount, 0);

    res.json({
      success: true,
      summary: {
        totalSettled,
        totalPending,
        commissionCollected
      },
      data: settlements
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Process Payout Settlement (Admin Only)
// @route   POST /api/payments/settlements/process
// @access  Private (Admin Only)
exports.processSettlement = async (req, res) => {
  try {
    const { ownerId, periodStart, periodEnd, transactionReference, notes } = req.body;

    if (!ownerId) {
      return res.status(400).json({ success: false, message: 'Owner ID is required' });
    }

    const commissionRate = await getCommissionRate();

    const pStart = periodStart ? new Date(periodStart) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const pEnd = periodEnd ? new Date(periodEnd) : new Date();

    const payments = await Payment.find({
      payee: ownerId,
      status: 'Captured',
      createdAt: { $gte: pStart, $lte: pEnd }
    });

    const totalGross = payments.reduce((sum, p) => sum + p.amount, 0);
    const commissionAmount = Math.round((totalGross * commissionRate) / 100);
    const netPayout = totalGross - commissionAmount;

    if (totalGross === 0) {
      return res.status(400).json({ success: false, message: 'No payments eligible for settlement in this period' });
    }

    const utr = transactionReference || `UTR_${Date.now()}_${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

    const settlement = await Settlement.create({
      owner: ownerId,
      periodStart: pStart,
      periodEnd: pEnd,
      totalBookingsAmount: totalGross,
      platformCommissionRate: commissionRate,
      commissionAmount,
      netPayoutAmount: netPayout,
      bookingIds: payments.map(p => p.bookingId),
      status: 'Settled',
      transactionReference: utr,
      settledAt: new Date(),
      processedBy: req.user.id,
      notes: notes || 'Verified payout release by StaySync Finance Desk'
    });

    await Notification.create({
      user: ownerId,
      title: 'Settlement Payout Released',
      message: `Your payout of ₹${netPayout.toLocaleString('en-IN')} (Ref: ${utr}) has been settled to your registered account.`,
      type: 'Request'
    });

    await AuditLog.create({
      actor: req.user.id,
      actorName: req.user.name,
      action: 'SYSTEM_CONFIG_UPDATED',
      targetType: 'User',
      targetId: ownerId.toString(),
      reason: `Payout settlement of ₹${netPayout} released to owner`,
      metadata: { settlementId: settlement._id, utr, amount: netPayout }
    });

    res.status(201).json({
      success: true,
      message: 'Settlement processed and logged successfully',
      data: settlement
    });
  } catch (error) {
    console.error('Error in processSettlement:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get user payment history / receipts
// @route   GET /api/payments/history
// @access  Private
exports.getPaymentHistory = async (req, res) => {
  try {
    const query = req.user.role === 'ADMIN' || req.user.role === 'SUPER_ADMIN'
      ? {}
      : { $or: [{ payer: req.user.id }, { payee: req.user.id }] };

    const payments = await Payment.find(query)
      .populate('payer', 'name email phone')
      .populate('payee', 'name email phone')
      .populate('bookingId')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: payments.length,
      data: payments
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
