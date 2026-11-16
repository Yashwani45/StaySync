const MaintenanceTicket = require('../models/MaintenanceTicket');
const RentSchedule = require('../models/RentSchedule');
const RentalAgreement = require('../models/RentalAgreement');
const Inspection = require('../models/Inspection');
const CommunityPost = require('../models/CommunityPost');
const Request = require('../models/Request');
const Property = require('../models/Property');
const Notification = require('../models/Notification');
const Payment = require('../models/Payment');

// ============================================================================
// 1. MAINTENANCE TICKETS
// ============================================================================

// @desc    Submit a maintenance complaint
// @route   POST /api/resident/maintenance
// @access  Private (Resident)
exports.createMaintenanceTicket = async (req, res) => {
  try {
    const { propertyId, roomNumber, bedNumber, category, priority, title, description, photos } = req.body;

    if (!propertyId || !category || !title || !description) {
      return res.status(400).json({ success: false, message: 'Property, Category, Title, and Description are required' });
    }

    const property = await Property.findById(propertyId);
    if (!property) {
      return res.status(404).json({ success: false, message: 'Property not found' });
    }

    const ticket = await MaintenanceTicket.create({
      property: propertyId,
      tenant: req.user.id,
      owner: property.owner,
      roomNumber: roomNumber || '',
      bedNumber: bedNumber || '',
      category,
      priority: priority || 'Medium',
      title,
      description,
      photos: photos || [],
      status: 'Submitted',
      statusHistory: [
        {
          status: 'Submitted',
          updatedBy: req.user.id,
          note: 'Ticket submitted by resident'
        }
      ]
    });

    // Notify Owner
    await Notification.create({
      user: property.owner,
      title: `🔧 Maintenance Ticket: ${title}`,
      message: `Resident ${req.user.name} reported a ${category} issue in ${property.title} (${roomNumber || 'Room'}). Priority: ${priority || 'Medium'}.`,
      type: 'Request'
    });

    res.status(201).json({
      success: true,
      message: 'Maintenance ticket submitted successfully',
      data: ticket
    });
  } catch (error) {
    console.error('Error in createMaintenanceTicket:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get maintenance tickets (Resident, Owner, Admin)
// @route   GET /api/resident/maintenance
// @access  Private
exports.getMaintenanceTickets = async (req, res) => {
  try {
    let query = {};
    if (req.user.role === 'ADMIN' || req.user.role === 'SUPER_ADMIN') {
      query = {};
    } else if (
      req.user.role === 'PROPERTY_OWNER' ||
      req.user.role === 'HOSTEL_OWNER' ||
      req.user.role === 'PG_OWNER' ||
      req.user.role === 'ROOM_OWNER'
    ) {
      query = { owner: req.user.id };
    } else {
      query = { tenant: req.user.id };
    }

    const tickets = await MaintenanceTicket.find(query)
      .populate('property', 'title address city')
      .populate('tenant', 'name email phone')
      .populate('owner', 'name email phone')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: tickets.length,
      data: tickets
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update ticket status (Assign, In Progress, Resolve, Close, Reopen)
// @route   PUT /api/resident/maintenance/:id/status
// @access  Private
exports.updateTicketStatus = async (req, res) => {
  try {
    const { status, note, assignedTo, resolutionNotes, satisfactionRating } = req.body;
    const ticket = await MaintenanceTicket.findById(req.params.id)
      .populate('tenant', 'name email')
      .populate('property', 'title');

    if (!ticket) {
      return res.status(404).json({ success: false, message: 'Ticket not found' });
    }

    ticket.status = status;
    if (assignedTo) ticket.assignedTo = { ...assignedTo, assignedAt: new Date() };
    if (resolutionNotes) ticket.resolutionNotes = resolutionNotes;
    if (satisfactionRating) ticket.satisfactionRating = satisfactionRating;
    if (status === 'Resolved' || status === 'Closed') ticket.resolvedAt = new Date();

    ticket.statusHistory.push({
      status,
      updatedBy: req.user.id,
      note: note || `Status updated to ${status}`
    });

    await ticket.save();

    // Notify resident if owner updated status
    if (req.user.id !== ticket.tenant._id.toString()) {
      await Notification.create({
        user: ticket.tenant._id,
        title: `🔧 Ticket Updated: ${ticket.title}`,
        message: `Your maintenance ticket is now "${status}". ${note ? `Note: ${note}` : ''}`,
        type: 'Request'
      });
    }

    res.json({
      success: true,
      message: `Ticket updated to ${status}`,
      data: ticket
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ============================================================================
// 2. RENT MANAGEMENT
// ============================================================================

// @desc    Get rent schedule & upcoming dues
// @route   GET /api/resident/rent
// @access  Private
exports.getRentSchedule = async (req, res) => {
  try {
    let query = {};
    if (req.user.role === 'ADMIN' || req.user.role === 'SUPER_ADMIN') {
      query = {};
    } else if (
      req.user.role === 'PROPERTY_OWNER' ||
      req.user.role === 'HOSTEL_OWNER' ||
      req.user.role === 'PG_OWNER' ||
      req.user.role === 'ROOM_OWNER'
    ) {
      query = { owner: req.user.id };
    } else {
      query = { tenant: req.user.id };
    }

    const rentRecords = await RentSchedule.find(query)
      .populate('property', 'title address city')
      .populate('tenant', 'name email phone')
      .populate('booking')
      .sort({ dueDate: 1 });

    const totalCollected = rentRecords.filter(r => r.status === 'Paid').reduce((sum, r) => sum + r.totalDue, 0);
    const totalPending = rentRecords.filter(r => r.status === 'Due' || r.status === 'Overdue' || r.status === 'Upcoming').reduce((sum, r) => sum + r.totalDue, 0);

    res.json({
      success: true,
      summary: {
        totalCollected,
        totalPending,
        count: rentRecords.length
      },
      data: rentRecords
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Generate rent bills for a confirmed booking
// @route   POST /api/resident/rent/generate
// @access  Private (Owner / Admin)
exports.generateRentSchedule = async (req, res) => {
  try {
    const { bookingId, monthsCount = 3 } = req.body;

    const booking = await Request.findById(bookingId).populate('itemId');
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    const baseRent = booking.proposedPrice || booking.pricingDetails?.baseAmount || 6000;
    const now = new Date();
    const createdRecords = [];

    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

    for (let i = 0; i < monthsCount; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() + i, 5); // 5th of each month
      const monthStr = `${monthNames[d.getMonth()]} ${d.getFullYear()}`;

      const existing = await RentSchedule.findOne({ booking: booking._id, month: monthStr });
      if (!existing) {
        const status = i === 0 ? 'Due' : 'Upcoming';
        const rentRecord = await RentSchedule.create({
          booking: booking._id,
          property: booking.itemId._id || booking.itemId,
          tenant: booking.sender,
          owner: booking.receiver,
          month: monthStr,
          dueDate: d,
          baseRent,
          utilityCharges: 500,
          totalDue: baseRent + 500,
          status,
          receiptNumber: `REC-${d.getFullYear()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`
        });
        createdRecords.push(rentRecord);
      }
    }

    res.status(201).json({
      success: true,
      message: `Generated ${createdRecords.length} monthly rent records`,
      data: createdRecords
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Pay rent online via Razorpay
// @route   POST /api/resident/rent/:id/pay
// @access  Private (Resident)
exports.payRent = async (req, res) => {
  try {
    const rentRecord = await RentSchedule.findById(req.params.id)
      .populate('property')
      .populate('owner');

    if (!rentRecord) {
      return res.status(404).json({ success: false, message: 'Rent record not found' });
    }

    if (rentRecord.tenant.toString() !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ success: false, message: 'Not authorized to pay this rent' });
    }

    const { paymentMethod = 'UPI', gatewayPaymentId } = req.body;
    const txnId = gatewayPaymentId || `pay_rent_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

    // Create payment record
    const payment = await Payment.create({
      bookingId: rentRecord.booking,
      payer: req.user.id,
      payee: rentRecord.owner._id,
      amount: rentRecord.totalDue,
      currency: 'INR',
      gateway: 'Razorpay',
      gatewayOrderId: `order_rent_${Date.now()}`,
      gatewayPaymentId: txnId,
      status: 'Captured',
      paymentMethod,
      itemType: 'Property',
      itemTitle: `${rentRecord.property.title} (${rentRecord.month} Rent)`,
      notes: `Monthly Rent for ${rentRecord.month}`
    });

    rentRecord.status = 'Paid';
    rentRecord.amountPaid = rentRecord.totalDue;
    rentRecord.paidAt = new Date();
    rentRecord.payment = payment._id;
    await rentRecord.save();

    await Notification.create({
      user: rentRecord.owner._id,
      title: 'Rent Payment Received',
      message: `Resident ${req.user.name} paid ₹${rentRecord.totalDue.toLocaleString('en-IN')} for ${rentRecord.month} (Ref: ${txnId}).`,
      type: 'Request'
    });

    res.json({
      success: true,
      message: `Rent for ${rentRecord.month} paid successfully`,
      data: rentRecord
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ============================================================================
// 3. DIGITAL RENTAL AGREEMENTS
// ============================================================================

// @desc    Get user rental agreements
// @route   GET /api/resident/agreements
// @access  Private
exports.getAgreements = async (req, res) => {
  try {
    let query = {};
    if (req.user.role === 'ADMIN' || req.user.role === 'SUPER_ADMIN') {
      query = {};
    } else if (
      req.user.role === 'PROPERTY_OWNER' ||
      req.user.role === 'HOSTEL_OWNER' ||
      req.user.role === 'PG_OWNER' ||
      req.user.role === 'ROOM_OWNER'
    ) {
      query = { owner: req.user.id };
    } else {
      query = { tenant: req.user.id };
    }

    const agreements = await RentalAgreement.find(query)
      .populate('property', 'title address city')
      .populate('tenant', 'name email phone currentCity')
      .populate('owner', 'name email phone')
      .populate('booking')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: agreements.length,
      data: agreements
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Generate digital agreement from booking
// @route   POST /api/resident/agreements/generate
// @access  Private (Owner / Admin / Resident)
exports.generateAgreement = async (req, res) => {
  try {
    const { bookingId } = req.body;
    const booking = await Request.findById(bookingId).populate('itemId');

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    const property = booking.itemId;
    const agreementNum = `AGR-${new Date().getFullYear()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;

    const startDate = booking.bookingDetails?.checkInDate || new Date();
    const endDate = booking.bookingDetails?.checkOutDate || new Date(Date.now() + 180 * 24 * 60 * 60 * 1000);

    const defaultTerms = [
      'The resident agrees to pay monthly rent by the 5th of every calendar month.',
      'A 30-day notice period is mandatory prior to move-out or termination.',
      'Smoking, narcotics, and alcohol consumption are strictly prohibited on property premises.',
      'Quiet hours are enforced from 10:30 PM to 6:30 AM for undisturbed study and sleep.',
      'Any property or furniture damage will be deducted from the security deposit upon move-out.'
    ];

    const agreement = await RentalAgreement.create({
      agreementNumber: agreementNum,
      booking: booking._id,
      property: property._id,
      tenant: booking.sender,
      owner: booking.receiver,
      roomNumber: booking.assignedBed?.roomNumber || 'Room 101',
      bedNumber: booking.assignedBed?.bedNumber || 'Bed A',
      startDate,
      endDate,
      monthlyRent: booking.proposedPrice || 6000,
      securityDeposit: property.securityDeposit || 5000,
      termsAndConditions: defaultTerms,
      status: 'Pending Acknowledgment'
    });

    res.status(201).json({
      success: true,
      message: 'Rental agreement drafted successfully',
      data: agreement
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Digital acknowledgment of agreement
// @route   PUT /api/resident/agreements/:id/acknowledge
// @access  Private
exports.acknowledgeAgreement = async (req, res) => {
  try {
    const agreement = await RentalAgreement.findById(req.params.id);
    if (!agreement) {
      return res.status(404).json({ success: false, message: 'Agreement not found' });
    }

    if (agreement.tenant.toString() === req.user.id) {
      agreement.tenantAcknowledged = true;
      agreement.tenantAcknowledgedAt = new Date();
    } else if (agreement.owner.toString() === req.user.id) {
      agreement.ownerAcknowledged = true;
      agreement.ownerAcknowledgedAt = new Date();
    } else if (req.user.role === 'ADMIN' || req.user.role === 'SUPER_ADMIN') {
      agreement.tenantAcknowledged = true;
      agreement.ownerAcknowledged = true;
      agreement.tenantAcknowledgedAt = new Date();
      agreement.ownerAcknowledgedAt = new Date();
    } else {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    if (agreement.tenantAcknowledged && agreement.ownerAcknowledged) {
      agreement.status = 'Active';
    }

    await agreement.save();

    res.json({
      success: true,
      message: 'Agreement acknowledged successfully',
      data: agreement
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ============================================================================
// 4. MOVE-IN / MOVE-OUT INSPECTIONS
// ============================================================================

// @desc    Get inspection reports
// @route   GET /api/resident/inspections
// @access  Private
exports.getInspections = async (req, res) => {
  try {
    let query = {};
    if (req.user.role === 'ADMIN' || req.user.role === 'SUPER_ADMIN') {
      query = {};
    } else if (
      req.user.role === 'PROPERTY_OWNER' ||
      req.user.role === 'HOSTEL_OWNER' ||
      req.user.role === 'PG_OWNER' ||
      req.user.role === 'ROOM_OWNER'
    ) {
      query = { owner: req.user.id };
    } else {
      query = { tenant: req.user.id };
    }

    const inspections = await Inspection.find(query)
      .populate('property', 'title address city')
      .populate('tenant', 'name email phone')
      .populate('owner', 'name email phone')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: inspections.length,
      data: inspections
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create Move-in or Move-out Inspection
// @route   POST /api/resident/inspections
// @access  Private
exports.createInspection = async (req, res) => {
  try {
    const {
      bookingId,
      type, // 'MoveIn' or 'MoveOut'
      roomConditionRating,
      checklist,
      photos,
      depositAmount,
      estimatedDamageDeduction = 0,
      deductionReason = '',
      notes = ''
    } = req.body;

    const booking = await Request.findById(bookingId).populate('itemId');
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    const depAmount = depositAmount || booking.pricingDetails?.deposit || 5000;
    const finalRefund = Math.max(0, depAmount - estimatedDamageDeduction);

    const defaultChecklist = [
      { item: 'Mattress & Bed Frame Condition', status: 'Good', notes: 'No tears or structural defects' },
      { item: 'Study Desk & Chair', status: 'Good', notes: 'Firm and scratch-free' },
      { item: 'Attached Washroom Geyser & Plumbing', status: 'Good', notes: 'Hot water operational' },
      { item: 'Cupboard / Wardrobe Lock & Keys', status: 'Good', notes: 'Key handed over' },
      { item: 'Window Latch & Curtains', status: 'Good', notes: 'Intact' },
      { item: 'Electrical Switches & Ceiling Fan', status: 'Good', notes: 'Working properly' }
    ];

    const inspection = await Inspection.create({
      booking: booking._id,
      property: booking.itemId._id || booking.itemId,
      tenant: booking.sender,
      owner: booking.receiver,
      roomNumber: booking.assignedBed?.roomNumber || 'Room 101',
      type: type || 'MoveIn',
      roomConditionRating: roomConditionRating || 5,
      checklist: checklist || defaultChecklist,
      photos: photos || [],
      depositAmount: depAmount,
      estimatedDamageDeduction,
      deductionReason,
      finalRefundAmount: finalRefund,
      settlementStatus: type === 'MoveIn' ? 'Settled' : 'Pending',
      tenantConfirmed: true,
      notes
    });

    res.status(201).json({
      success: true,
      message: `${type} inspection recorded successfully`,
      data: inspection
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ============================================================================
// 5. RESIDENT COMMUNITY BOARD
// ============================================================================

// @desc    Get community board posts
// @route   GET /api/resident/community
// @access  Public / Private
exports.getCommunityPosts = async (req, res) => {
  try {
    const { city = 'Indore', type } = req.query;
    const query = { moderationStatus: 'Visible' };

    if (city && city !== 'All') {
      query.$or = [{ city: new RegExp(city, 'i') }, { city: 'Global' }];
    }
    if (type && type !== 'All') {
      query.type = type;
    }

    const posts = await CommunityPost.find(query)
      .populate('author', 'name profileImage currentCity')
      .sort({ pinned: -1, createdAt: -1 })
      .limit(30);

    res.json({
      success: true,
      count: posts.length,
      data: posts
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create community post / announcement
// @route   POST /api/resident/community
// @access  Private
exports.createCommunityPost = async (req, res) => {
  try {
    const { title, content, type = 'Discussion', city = 'Indore', propertyId } = req.body;

    if (!title || !content) {
      return res.status(400).json({ success: false, message: 'Title and content are required' });
    }

    let authorRole = 'Resident';
    if (req.user.role === 'ADMIN' || req.user.role === 'SUPER_ADMIN') {
      authorRole = 'Administrator';
    } else if (
      req.user.role === 'HOSTEL_OWNER' ||
      req.user.role === 'PG_OWNER' ||
      req.user.role === 'PROPERTY_OWNER'
    ) {
      authorRole = 'Property Manager';
    }

    const isPinned = (req.user.role === 'ADMIN' || req.user.role === 'SUPER_ADMIN') && type === 'Announcement';

    const post = await CommunityPost.create({
      property: propertyId || null,
      city: city || req.user.currentCity || 'Indore',
      author: req.user.id,
      authorName: req.user.name,
      authorRole,
      title,
      content,
      type,
      pinned: isPinned
    });

    res.status(201).json({
      success: true,
      message: 'Community post published',
      data: post
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Like / Unlike community post
// @route   POST /api/resident/community/:id/like
// @access  Private
exports.toggleLikePost = async (req, res) => {
  try {
    const post = await CommunityPost.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    const index = post.likes.indexOf(req.user.id);
    if (index === -1) {
      post.likes.push(req.user.id);
    } else {
      post.likes.splice(index, 1);
    }

    await post.save();

    res.json({
      success: true,
      likesCount: post.likes.length,
      hasLiked: index === -1
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Add comment to community post
// @route   POST /api/resident/community/:id/comment
// @access  Private
exports.addComment = async (req, res) => {
  try {
    const { text } = req.body;
    if (!text || text.trim().length === 0) {
      return res.status(400).json({ success: false, message: 'Comment text is required' });
    }

    const post = await CommunityPost.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    let role = 'Resident';
    if (req.user.role === 'ADMIN' || req.user.role === 'SUPER_ADMIN') role = 'Admin';
    if (req.user.role.includes('OWNER')) role = 'Owner';

    post.comments.push({
      author: req.user.id,
      authorName: req.user.name,
      authorRole: role,
      text: text.trim(),
      createdAt: new Date()
    });

    await post.save();

    res.status(201).json({
      success: true,
      message: 'Comment added',
      data: post.comments
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Report post for moderation
// @route   PUT /api/resident/community/:id/report
// @access  Private
exports.reportCommunityPost = async (req, res) => {
  try {
    const post = await CommunityPost.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    post.reported = true;
    post.moderationStatus = 'Flagged';
    await post.save();

    res.json({
      success: true,
      message: 'Post flagged for administrator review'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
