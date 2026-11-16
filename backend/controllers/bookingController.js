const Property = require('../models/Property');
const Request = require('../models/Request');
const BedReservation = require('../models/BedReservation');
const Notification = require('../models/Notification');
const User = require('../models/User');
const {
  sendInquiryNotificationToOwner,
  sendInquiryConfirmationToCustomer,
  sendStatusUpdateEmailToCustomer
} = require('../utils/emailService');

// Helper to auto-generate concrete rooms and beds from roomTiers if property.rooms is empty
const ensurePropertyRooms = async (property) => {
  if (property.rooms && property.rooms.length > 0) {
    return property.rooms;
  }

  const generatedRooms = [];
  let roomCounter = 101;

  if (property.roomTiers && property.roomTiers.length > 0) {
    for (const tier of property.roomTiers) {
      const occupancy = tier.occupancy || (tier.roomType?.includes('1-Seater') ? 1 : tier.roomType?.includes('3-Seater') ? 3 : 2);
      const totalBedsInTier = tier.totalBeds || occupancy * 2;
      const roomsNeeded = Math.max(1, Math.ceil(totalBedsInTier / occupancy));

      for (let r = 0; r < roomsNeeded; r++) {
        const beds = [];
        for (let b = 0; b < occupancy; b++) {
          const bedLetter = String.fromCharCode(65 + b); // 'Bed A', 'Bed B', etc.
          beds.push({
            bedNumber: `Bed ${bedLetter}`,
            isOccupied: false,
            currentTenant: null
          });
        }

        generatedRooms.push({
          roomNumber: `Room ${roomCounter++}`,
          tierName: tier.roomType || 'Standard Room',
          floor: Math.floor((roomCounter - 100) / 10) + 1,
          beds
        });
      }
    }
  } else {
    // Default 2 rooms if no roomTiers configured
    generatedRooms.push(
      {
        roomNumber: 'Room 101',
        tierName: '2-Seater Room',
        floor: 1,
        beds: [
          { bedNumber: 'Bed A', isOccupied: false, currentTenant: null },
          { bedNumber: 'Bed B', isOccupied: false, currentTenant: null }
        ]
      },
      {
        roomNumber: 'Room 102',
        tierName: '1-Seater Room',
        floor: 1,
        beds: [
          { bedNumber: 'Bed A', isOccupied: false, currentTenant: null }
        ]
      }
    );
  }

  property.rooms = generatedRooms;
  await property.save();
  return property.rooms;
};

// @desc    Get available rooms and beds for a property with live availability & hold status
// @route   GET /api/bookings/available-beds/:propertyId
// @access  Public / Private
exports.getAvailableBeds = async (req, res) => {
  try {
    const { propertyId } = req.params;
    const { checkInDate, checkOutDate } = req.query;

    const property = await Property.findById(propertyId);
    if (!property) {
      return res.status(404).json({ success: false, message: 'Property not found' });
    }

    // Ensure rooms array is populated
    const rooms = await ensurePropertyRooms(property);

    const now = new Date();
    const inDate = checkInDate ? new Date(checkInDate) : now;
    const outDate = checkOutDate ? new Date(checkOutDate) : new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    // Auto-release expired temporary holds so accurate live availability is always returned
    await BedReservation.updateMany(
      { property: propertyId, status: 'HELD', expiresAt: { $lte: now } },
      { status: 'RELEASED' }
    );

    // 1. Fetch active temporary bed reservations that overlap
    const activeReservations = await BedReservation.find({
      property: propertyId,
      status: { $in: ['HELD', 'CONFIRMED'] },
      expiresAt: { $gt: now },
      $or: [
        { checkInDate: { $lt: outDate }, checkOutDate: { $gt: inDate } }
      ]
    });

    // 2. Fetch active confirmed bookings that overlap
    const activeBookings = await Request.find({
      itemType: 'Property',
      itemId: propertyId,
      status: { $in: ['Confirmed', 'Checked In', 'Payment Pending'] },
      $or: [
        { 'bookingDetails.checkInDate': { $lt: outDate }, 'bookingDetails.checkOutDate': { $gt: inDate } }
      ]
    });

    // Map through rooms and beds to flag availability
    const roomsWithAvailability = rooms.map(room => {
      const bedsStatus = room.beds.map(bed => {
        // Overlap with temporary reservation
        const matchedReservation = activeReservations.find(
          res => res.roomNumber === room.roomNumber && res.bedNumber === bed.bedNumber
        );

        // Overlap with confirmed booking
        const matchedBooking = activeBookings.find(
          bk => bk.assignedBed?.roomNumber === room.roomNumber && bk.assignedBed?.bedNumber === bed.bedNumber
        );

        let status = 'AVAILABLE';
        let heldByMe = false;
        let expiresAt = null;

        if (matchedBooking) {
          status = 'OCCUPIED';
        } else if (matchedReservation) {
          if (matchedReservation.status === 'CONFIRMED') {
            status = 'OCCUPIED';
          } else if (matchedReservation.status === 'HELD') {
            status = 'HELD';
            expiresAt = matchedReservation.expiresAt;
            if (req.user && matchedReservation.tenant.toString() === req.user.id) {
              heldByMe = true;
            }
          }
        } else if (bed.isOccupied) {
          status = 'OCCUPIED';
        }

        return {
          bedNumber: bed.bedNumber,
          status,
          heldByMe,
          expiresAt,
          isOccupied: status === 'OCCUPIED'
        };
      });

      // Find matching room tier pricing
      const tierInfo = property.roomTiers?.find(t => t.roomType === room.tierName) || {
        rentPerPerson: property.rentPerPerson || property.monthlyRent || 6000,
        occupancy: room.beds.length
      };

      return {
        roomNumber: room.roomNumber,
        tierName: room.tierName,
        floor: room.floor,
        rentPerPerson: tierInfo.rentPerPerson,
        occupancy: room.beds.length,
        beds: bedsStatus,
        availableBedsCount: bedsStatus.filter(b => b.status === 'AVAILABLE' || b.heldByMe).length
      };
    });

    res.json({
      success: true,
      data: {
        propertyId: property._id,
        propertyTitle: property.title,
        cancellationPolicy: property.cancellationPolicy || 'Moderate',
        securityDeposit: property.securityDeposit || property.monthlyRent || 0,
        rooms: roomsWithAvailability
      }
    });
  } catch (error) {
    console.error('Error in getAvailableBeds:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Hold a specific bed temporarily for 15 minutes during checkout
// @route   POST /api/bookings/hold-bed
// @access  Private
exports.holdBed = async (req, res) => {
  try {
    const { propertyId, roomNumber, bedNumber, checkInDate, checkOutDate } = req.body;

    if (!propertyId || !roomNumber || !bedNumber || !checkInDate || !checkOutDate) {
      return res.status(400).json({
        success: false,
        message: 'Property ID, Room Number, Bed Number, Check-In Date, and Check-Out Date are required'
      });
    }

    const inDate = new Date(checkInDate);
    const outDate = new Date(checkOutDate);

    if (inDate >= outDate) {
      return res.status(400).json({
        success: false,
        message: 'Check-out date must be strictly after check-in date'
      });
    }

    const property = await Property.findById(propertyId);
    if (!property) {
      return res.status(404).json({ success: false, message: 'Property not found' });
    }

    // Check if bed is already occupied by confirmed booking in requested date range
    const existingConfirmedBooking = await Request.findOne({
      itemType: 'Property',
      itemId: propertyId,
      'assignedBed.roomNumber': roomNumber,
      'assignedBed.bedNumber': bedNumber,
      status: { $in: ['Confirmed', 'Checked In'] },
      'bookingDetails.checkInDate': { $lt: outDate },
      'bookingDetails.checkOutDate': { $gt: inDate }
    });

    if (existingConfirmedBooking) {
      return res.status(409).json({
        success: false,
        message: 'This bed is already booked and occupied for the selected dates. Please choose another bed.'
      });
    }

    const now = new Date();
    const expiryTime = new Date(now.getTime() + 15 * 60 * 1000); // 15-minute temporary hold

    // Check if another resident has an active HELD reservation for this bed
    const activeLock = await BedReservation.findOne({
      property: propertyId,
      roomNumber,
      bedNumber,
      status: 'HELD',
      expiresAt: { $gt: now },
      tenant: { $ne: req.user.id },
      checkInDate: { $lt: outDate },
      checkOutDate: { $gt: inDate }
    });

    if (activeLock) {
      const remainingSecs = Math.max(0, Math.round((activeLock.expiresAt - now) / 1000));
      return res.status(409).json({
        success: false,
        message: `This bed is currently locked by another resident completing their booking. Please choose another bed or retry in ${Math.ceil(remainingSecs / 60)} minutes.`
      });
    }

    // Atomic upsert: Update current user's existing reservation or create a new hold
    const reservation = await BedReservation.findOneAndUpdate(
      {
        property: propertyId,
        tenant: req.user.id,
        status: 'HELD'
      },
      {
        property: propertyId,
        roomNumber,
        bedNumber,
        tenant: req.user.id,
        checkInDate: inDate,
        checkOutDate: outDate,
        status: 'HELD',
        expiresAt: expiryTime
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    res.status(200).json({
      success: true,
      message: `${roomNumber} · ${bedNumber} is locked for you for 15 minutes.`,
      data: {
        reservationId: reservation._id,
        roomNumber: reservation.roomNumber,
        bedNumber: reservation.bedNumber,
        expiresAt: reservation.expiresAt,
        ttlSeconds: 15 * 60
      }
    });
  } catch (error) {
    console.error('Error in holdBed:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Release a held bed reservation if checkout is abandoned
// @route   POST /api/bookings/release-bed
// @access  Private
exports.releaseBed = async (req, res) => {
  try {
    const { reservationId, propertyId, roomNumber, bedNumber } = req.body;

    let query = { tenant: req.user.id, status: 'HELD' };
    if (reservationId) {
      query._id = reservationId;
    } else if (propertyId && roomNumber && bedNumber) {
      query.property = propertyId;
      query.roomNumber = roomNumber;
      query.bedNumber = bedNumber;
    }

    await BedReservation.updateMany(query, { status: 'RELEASED' });

    res.json({
      success: true,
      message: 'Bed reservation hold released successfully.'
    });
  } catch (error) {
    console.error('Error in releaseBed:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create a formal booking request with room & bed reservation
// @route   POST /api/bookings/create
// @access  Private
exports.createBooking = async (req, res) => {
  try {
    const {
      propertyId,
      roomNumber,
      bedNumber,
      roomType,
      checkInDate,
      checkOutDate,
      durationMonths = 1,
      message = 'Accommodation booking via StaySync',
      pricingDetails
    } = req.body;

    if (!propertyId || !roomNumber || !bedNumber || !checkInDate || !checkOutDate) {
      return res.status(400).json({
        success: false,
        message: 'Property, room number, bed number, check-in, and check-out dates are required'
      });
    }

    const inDate = new Date(checkInDate);
    const outDate = new Date(checkOutDate);

    const property = await Property.findById(propertyId);
    if (!property) {
      return res.status(404).json({ success: false, message: 'Property not found' });
    }

    if (property.owner && property.owner.toString() === req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'You cannot book your own property listing.'
      });
    }

    // Verify bed reservation hold
    let reservation = await BedReservation.findOne({
      property: propertyId,
      roomNumber,
      bedNumber,
      tenant: req.user.id,
      status: 'HELD',
      expiresAt: { $gt: new Date() }
    });

    if (!reservation) {
      // Create instant reservation lock
      reservation = await BedReservation.create({
        property: propertyId,
        roomNumber,
        bedNumber,
        tenant: req.user.id,
        checkInDate: inDate,
        checkOutDate: outDate,
        status: 'HELD',
        expiresAt: new Date(Date.now() + 15 * 60 * 1000)
      });
    }

    // Resolve rent, deposit, service fee
    const baseRent = pricingDetails?.baseAmount || property.rentPerPerson || property.monthlyRent || 6000;
    const deposit = pricingDetails?.deposit !== undefined ? pricingDetails.deposit : (property.securityDeposit || baseRent);
    const serviceFee = pricingDetails?.serviceFee !== undefined ? pricingDetails.serviceFee : Math.round(baseRent * 0.05);
    const totalAmount = baseRent + deposit + serviceFee;

    const calculatedPricing = {
      baseAmount: baseRent,
      deposit,
      serviceFee,
      totalAmount
    };

    const newBooking = await Request.create({
      sender: req.user.id,
      receiver: property.owner,
      itemType: 'Property',
      itemId: propertyId,
      message,
      proposedPrice: baseRent,
      status: 'Pending',
      assignedBed: {
        roomNumber,
        bedNumber
      },
      bookingDetails: {
        checkInDate: inDate,
        checkOutDate: outDate,
        durationMonths: Number(durationMonths) || 1,
        occupants: 1,
        roomType: roomType || property.roomType || 'Hostel Room'
      },
      pricingDetails: calculatedPricing,
      paymentStatus: 'Pending'
    });

    // Link booking ID to reservation
    reservation.bookingRequest = newBooking._id;
    await reservation.save();

    // Create notifications for Owner & Tenant
    const senderUser = await User.findById(req.user.id);
    const receiverUser = await User.findById(property.owner);

    await Notification.create({
      user: property.owner,
      title: `New Booking Request: ${roomNumber} (${bedNumber})`,
      message: `${senderUser?.name || 'A resident'} requested to book ${roomNumber} (${bedNumber}) at "${property.title}" from ${inDate.toLocaleDateString('en-IN')}.`,
      type: 'Request'
    });

    await Notification.create({
      user: req.user.id,
      title: `Booking Request Submitted (#SS-${newBooking._id.toString().slice(-6).toUpperCase()})`,
      message: `Your booking request for ${property.title} (${roomNumber} · ${bedNumber}) is pending approval by the owner.`,
      type: 'Request'
    });

    // Dispatch Email confirmation
    if (senderUser && receiverUser) {
      sendInquiryNotificationToOwner({
        request: newBooking,
        sender: senderUser,
        receiver: receiverUser,
        item: property,
        itemType: 'Property'
      }).catch(err => console.error('[EmailService] Owner alert error:', err.message));

      sendInquiryConfirmationToCustomer({
        request: newBooking,
        sender: senderUser,
        receiver: receiverUser,
        item: property,
        itemType: 'Property'
      }).catch(err => console.error('[EmailService] Customer confirmation error:', err.message));
    }

    res.status(201).json({
      success: true,
      message: 'Booking request submitted successfully. Awaiting owner approval.',
      data: newBooking
    });
  } catch (error) {
    console.error('Error in createBooking:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update booking lifecycle status (Accept -> Payment Pending, Confirmed, Checked In, Completed, Reject)
// @route   PUT /api/bookings/:id/status
// @access  Private (Owner / Admin)
exports.updateBookingStatus = async (req, res) => {
  try {
    const { status, responseMessage } = req.body;
    const booking = await Request.findById(req.params.id)
      .populate('itemId')
      .populate('sender', 'name email phone')
      .populate('receiver', 'name email phone');

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking request not found' });
    }

    const isReceiver = booking.receiver?._id.toString() === req.user.id;
    const isSender = booking.sender?._id.toString() === req.user.id;
    const isAdmin = req.user.role === 'ADMIN' || req.user.role === 'SUPER_ADMIN';

    if (!isReceiver && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Only the property owner or administrator can update this booking status.'
      });
    }

    const prevStatus = booking.status;

    // Transition handling
    if (status === 'Owner Approved' || status === 'Accepted' || status === 'Payment Pending') {
      // Owner approves -> moves to 'Payment Pending' so tenant can pay rent + deposit
      booking.status = 'Payment Pending';

      // Keep bed reservation active for 24 hours payment window
      await BedReservation.updateMany(
        { bookingRequest: booking._id },
        { status: 'HELD', expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) }
      );

      await Notification.create({
        user: booking.sender._id,
        title: '🎉 Booking Approved! Please Complete Payment',
        message: `Your booking for ${booking.assignedBed?.roomNumber || 'room'} (${booking.assignedBed?.bedNumber || 'bed'}) has been approved. Please complete payment to confirm your stay.`,
        type: 'Request'
      });
    } else if (status === 'Confirmed') {
      booking.status = 'Confirmed';
      booking.paymentStatus = 'Paid';

      await BedReservation.updateMany(
        { bookingRequest: booking._id },
        { status: 'CONFIRMED', expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) }
      );

      await Notification.create({
        user: booking.sender._id,
        title: '✅ Stay Confirmed!',
        message: `Your bed at ${booking.itemId?.title || 'the property'} (${booking.assignedBed?.roomNumber || ''} ${booking.assignedBed?.bedNumber || ''}) is confirmed.`,
        type: 'Request'
      });
    } else if (status === 'Expired') {
      booking.status = 'Expired';
      await BedReservation.updateMany(
        { bookingRequest: booking._id },
        { status: 'RELEASED' }
      );
    } else if (status === 'Checked In') {
      if (prevStatus !== 'Confirmed' && prevStatus !== 'Accepted' && !isAdmin) {
        return res.status(400).json({
          success: false,
          message: 'Booking must be Confirmed before checking in the resident.'
        });
      }
      booking.status = 'Checked In';
      booking.checkInCompletedAt = new Date();

      // Mark bed as occupied in Property.rooms
      if (booking.assignedBed?.roomNumber) {
        await Property.updateOne(
          {
            _id: booking.itemId._id,
            'rooms.roomNumber': booking.assignedBed.roomNumber,
            'rooms.beds.bedNumber': booking.assignedBed.bedNumber
          },
          {
            $set: {
              'rooms.$[r].beds.$[b].isOccupied': true,
              'rooms.$[r].beds.$[b].currentTenant': booking.sender._id
            }
          },
          {
            arrayFilters: [
              { 'r.roomNumber': booking.assignedBed.roomNumber },
              { 'b.bedNumber': booking.assignedBed.bedNumber }
            ]
          }
        );
      }

      await Notification.create({
        user: booking.sender._id,
        title: '🏠 Welcome to Your New Stay!',
        message: `Your check-in at ${booking.itemId.title} (${booking.assignedBed.roomNumber}) has been officially completed. Welcome home!`,
        type: 'Request'
      });
    } else if (status === 'Completed') {
      booking.status = 'Completed';
      booking.checkOutCompletedAt = new Date();

      // Release bed in Property.rooms
      if (booking.assignedBed?.roomNumber) {
        await Property.updateOne(
          {
            _id: booking.itemId._id,
            'rooms.roomNumber': booking.assignedBed.roomNumber,
            'rooms.beds.bedNumber': booking.assignedBed.bedNumber
          },
          {
            $set: {
              'rooms.$[r].beds.$[b].isOccupied': false,
              'rooms.$[r].beds.$[b].currentTenant': null
            }
          },
          {
            arrayFilters: [
              { 'r.roomNumber': booking.assignedBed.roomNumber },
              { 'b.bedNumber': booking.assignedBed.bedNumber }
            ]
          }
        );
      }

      await Notification.create({
        user: booking.sender._id,
        title: 'Check-out Completed',
        message: `Your stay at ${booking.itemId.title} has been closed. We hope you had a comfortable living experience!`,
        type: 'Request'
      });
    } else if (status === 'Rejected') {
      booking.status = 'Rejected';
      // Release held bed immediately
      await BedReservation.updateMany(
        { bookingRequest: booking._id },
        { status: 'RELEASED' }
      );

      await Notification.create({
        user: booking.sender._id,
        title: 'Booking Request Declined',
        message: `Your booking request for ${booking.assignedBed?.roomNumber || 'the property'} was declined by the owner. ${responseMessage ? `Note: "${responseMessage}"` : ''}`,
        type: 'Request'
      });
    } else {
      booking.status = status;
    }

    if (responseMessage) {
      booking.responseMessage = responseMessage;
    }

    await booking.save();

    res.json({
      success: true,
      message: `Booking status updated to ${booking.status}`,
      data: booking
    });
  } catch (error) {
    console.error('Error in updateBookingStatus:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Cancel booking according to property cancellation policy
// @route   POST /api/bookings/:id/cancel
// @access  Private (Tenant / Admin)
exports.cancelBooking = async (req, res) => {
  try {
    const { reason = 'Cancelled by resident' } = req.body;
    const booking = await Request.findById(req.params.id).populate('itemId');

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    const isSender = booking.sender.toString() === req.user.id;
    const isAdmin = req.user.role === 'ADMIN' || req.user.role === 'SUPER_ADMIN';

    if (!isSender && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Only the resident who booked this item can cancel it.'
      });
    }

    if (booking.status === 'Cancelled') {
      return res.status(400).json({ success: false, message: 'Booking is already cancelled.' });
    }

    if (booking.status === 'Completed') {
      return res.status(400).json({ success: false, message: 'Completed bookings cannot be cancelled.' });
    }

    const property = booking.itemId;
    const policy = property?.cancellationPolicy || 'Moderate';
    const checkInDate = booking.bookingDetails?.checkInDate ? new Date(booking.bookingDetails.checkInDate) : new Date();
    const now = new Date();
    const hoursToCheckIn = (checkInDate - now) / (1000 * 60 * 60);

    let refundPercentage = 0;
    if (booking.paymentStatus === 'Paid') {
      if (policy === 'Flexible') {
        refundPercentage = hoursToCheckIn >= 24 ? 100 : 70;
      } else if (policy === 'Moderate') {
        if (hoursToCheckIn >= 120) refundPercentage = 100; // >= 5 days
        else if (hoursToCheckIn >= 48) refundPercentage = 50; // 2 to 5 days
        else refundPercentage = 0; // < 48 hours
      } else if (policy === 'Strict') {
        refundPercentage = hoursToCheckIn >= 168 ? 50 : 0; // >= 7 days: 50%
      }
    }

    const paidAmount = booking.pricingDetails?.totalAmount || booking.proposedPrice || 0;
    const refundAmount = Math.round((paidAmount * refundPercentage) / 100);

    booking.status = 'Cancelled';
    booking.cancellationDetails = {
      cancelledBy: req.user.id,
      cancelledAt: now,
      reason,
      refundAmount,
      refundStatus: refundAmount > 0 ? 'Initiated' : 'None'
    };

    await booking.save();

    // Release bed lock
    await BedReservation.updateMany(
      { bookingRequest: booking._id },
      { status: 'RELEASED' }
    );

    // Free bed in Property.rooms if it was marked occupied
    if (booking.assignedBed?.roomNumber && property?._id) {
      await Property.updateOne(
        {
          _id: property._id,
          'rooms.roomNumber': booking.assignedBed.roomNumber,
          'rooms.beds.bedNumber': booking.assignedBed.bedNumber
        },
        {
          $set: {
            'rooms.$[r].beds.$[b].isOccupied': false,
            'rooms.$[r].beds.$[b].currentTenant': null
          }
        },
        {
          arrayFilters: [
            { 'r.roomNumber': booking.assignedBed.roomNumber },
            { 'b.bedNumber': booking.assignedBed.bedNumber }
          ]
        }
      );
    }

    // Notify Owner
    await Notification.create({
      user: booking.receiver,
      title: 'Booking Cancelled',
      message: `Booking for ${booking.assignedBed?.roomNumber || 'your property'} has been cancelled by the tenant. Cancellation Policy: ${policy}.`,
      type: 'Request'
    });

    res.json({
      success: true,
      message: `Booking cancelled successfully under ${policy} Cancellation Policy.`,
      data: {
        bookingId: booking._id,
        policy,
        hoursToCheckIn: Math.round(hoursToCheckIn),
        refundPercentage,
        refundAmount,
        status: booking.status
      }
    });
  } catch (error) {
    console.error('Error in cancelBooking:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get owner occupancy calendar & live tenant bookings
// @route   GET /api/bookings/owner-calendar/:propertyId
// @access  Private (Owner / Admin)
exports.getOwnerOccupancyCalendar = async (req, res) => {
  try {
    const { propertyId } = req.params;

    const property = await Property.findById(propertyId);
    if (!property) {
      return res.status(404).json({ success: false, message: 'Property not found' });
    }

    const isOwner = property.owner && property.owner.toString() === req.user.id;
    const isAdmin = req.user.role === 'ADMIN' || req.user.role === 'SUPER_ADMIN';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ success: false, message: 'Not authorized to view this property calendar.' });
    }

    const bookings = await Request.find({
      itemType: 'Property',
      itemId: propertyId,
      status: { $in: ['Confirmed', 'Checked In', 'Payment Pending', 'Pending', 'Completed'] }
    })
      .populate('sender', 'name email phone profileImage')
      .sort({ 'bookingDetails.checkInDate': 1 });

    const rooms = await ensurePropertyRooms(property);

    res.json({
      success: true,
      data: {
        propertyTitle: property.title,
        propertyType: property.propertyType,
        rooms,
        bookings
      }
    });
  } catch (error) {
    console.error('Error in getOwnerOccupancyCalendar:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};
