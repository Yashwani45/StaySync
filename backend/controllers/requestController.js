const Request = require('../models/Request');
const Property = require('../models/Property');
const ServiceProvider = require('../models/ServiceProvider');
const Notification = require('../models/Notification');
const User = require('../models/User');
const {
  sendInquiryNotificationToOwner,
  sendInquiryConfirmationToCustomer,
  sendStatusUpdateEmailToCustomer
} = require('../utils/emailService');

// @desc    Get user requests / bookings
// @route   GET /api/requests
// @access  Private
exports.getRequests = async (req, res) => {
  try {
    let requests;
    const isOwnerOrProvider = [
      'PROPERTY_OWNER',
      'HOSTEL_OWNER',
      'PG_OWNER',
      'ROOM_OWNER',
      'PROVIDER',
      'TIFFIN_PROVIDER',
      'CLEANING_LAUNDRY_PROVIDER'
    ].includes(req.user.role);

    // Providers / Property Owners see incoming requests. Normal users see outgoing requests.
    if (req.user.role === 'ADMIN') {
      requests = await Request.find({})
        .populate('sender', 'name phone email profileImage')
        .populate('receiver', 'name phone email profileImage')
        .populate('itemId')
        .sort({ createdAt: -1 });
    } else if (isOwnerOrProvider && req.query.as !== 'sender') {
      requests = await Request.find({ receiver: req.user.id })
        .populate('sender', 'name phone email profileImage')
        .populate('itemId')
        .sort({ createdAt: -1 });
    } else {
      // Normal USER role (or owner acting as tenant)
      requests = await Request.find({ sender: req.user.id })
        .populate('receiver', 'name phone email profileImage')
        .populate('itemId')
        .sort({ createdAt: -1 });
    }

    res.json({ success: true, count: requests.length, data: requests });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Create a new booking or contact request
// @route   POST /api/requests
// @access  Private
exports.createRequest = async (req, res) => {
  const { 
    itemType, 
    itemId, 
    message, 
    proposedPrice,
    bookingDetails,
    serviceDetails,
    pricingDetails,
    paymentStatus,
    paymentReference
  } = req.body;

  if (!itemId) {
    return res.status(400).json({ success: false, message: 'Item ID is required' });
  }

  try {
    let receiverId;
    let targetItem = null;

    // Resolve the receiver user ID depending on target type
    if (itemType === 'Property') {
      const property = await Property.findById(itemId);
      if (!property) {
        return res.status(404).json({ success: false, message: 'Property not found' });
      }

      // Gender suitability check (Prevent males booking girls hostels & vice versa)
      const { validateGenderMatch } = require('../utils/genderValidator');
      const genderCheck = await validateGenderMatch(req.user, property);
      if (!genderCheck.valid) {
        return res.status(400).json({ success: false, message: genderCheck.message });
      }

      // Check available inventory to prevent overbooking
      if (property.availableBeds !== undefined && property.availableBeds <= 0) {
        return res.status(400).json({ 
          success: false, 
          message: 'All beds and units for this property are currently occupied. Please choose another stay.' 
        });
      }

      targetItem = property;
      receiverId = property.owner;
      // Fallback if property has no owner assigned
      if (!receiverId) {
        const fallbackOwner = await User.findOne({ role: 'PROPERTY_OWNER' }) || await User.findOne({ role: 'ADMIN' });
        receiverId = fallbackOwner ? fallbackOwner._id : null;
      }
    } else if (itemType === 'ServiceProvider') {
      const provider = await ServiceProvider.findById(itemId);
      if (!provider) {
        return res.status(404).json({ success: false, message: 'Service provider not found' });
      }
      targetItem = provider;
      receiverId = provider.user;
      if (!receiverId) {
        const fallbackProvider = await User.findOne({ role: 'PROVIDER' }) || await User.findOne({ role: 'ADMIN' });
        receiverId = fallbackProvider ? fallbackProvider._id : null;
      }
    } else if (itemType === 'Roommate') {
      let targetUser = await User.findById(itemId);
      if (!targetUser) {
        // Fallback: itemId might be RoommateProfile ID
        const RoommateProfile = require('../models/RoommateProfile');
        const profile = await RoommateProfile.findById(itemId);
        if (profile) {
          targetUser = await User.findById(profile.user);
        }
      }
      if (!targetUser) {
        return res.status(404).json({ success: false, message: 'Roommate user not found' });
      }
      targetItem = targetUser;
      receiverId = targetUser._id;
    } else {
      return res.status(400).json({ success: false, message: 'Invalid item type. Must be Property, ServiceProvider, or Roommate.' });
    }

    if (!receiverId) {
      return res.status(400).json({ success: false, message: 'Recipient owner or provider not found for this listing' });
    }

    if (receiverId.toString() === req.user.id) {
      return res.status(400).json({ success: false, message: 'You cannot send a request to your own listing. Please select another PG or provider to send an inquiry.' });
    }

    // Calculate structured pricing breakdown
    let calculatedPricing = pricingDetails;
    if (!calculatedPricing) {
      const baseRent = proposedPrice || (targetItem ? (targetItem.rentPerPerson || targetItem.monthlyRent || targetItem.tiffinDetails?.monthlyPrice || 0) : 0);
      const deposit = targetItem?.securityDeposit || 0;
      const serviceFee = Math.round(baseRent * 0.05);
      calculatedPricing = {
        baseAmount: baseRent,
        deposit,
        serviceFee,
        totalAmount: baseRent + deposit + serviceFee
      };
    }

    const request = await Request.create({
      sender: req.user.id,
      receiver: receiverId,
      itemType,
      itemId,
      message,
      proposedPrice: proposedPrice ? Number(proposedPrice) : calculatedPricing.baseAmount,
      bookingDetails: bookingDetails || {},
      serviceDetails: serviceDetails || {},
      pricingDetails: calculatedPricing,
      paymentStatus: paymentStatus || 'Pending',
      paymentReference: paymentReference || ''
    });

    // Only auto-sync ServiceProvider on request creation if instant.
    // For Property, stay is strictly PENDING until accepted by Owner / Admin!
    try {
      const RoommateProfile = require('../models/RoommateProfile');
      if (itemType === 'ServiceProvider') {
        await RoommateProfile.findOneAndUpdate(
          { user: req.user.id },
          { $addToSet: { selectedProviders: itemId } },
          { new: true }
        );
      }
    } catch (e) {
      console.error('Error auto-syncing profile selection on request:', e);
    }

    // Create a Notification for the receiver (Owner / Provider)
    const senderUser = await User.findById(req.user.id);
    const receiverUser = await User.findById(receiverId);

    if (senderUser) {
      await Notification.create({
        user: receiverId,
        title: `New Booking Request from ${senderUser.name}`,
        message: `You have received a new booking request for your ${itemType}: "${message.substring(0, 50)}..."`,
        type: 'Request'
      });

      // Also create booking pending notification for the tenant (sender)
      await Notification.create({
        user: req.user.id,
        title: `⏳ Booking Request Submitted: ${itemType}`,
        message: `Your booking request has been submitted to the property owner and admin (Ref: #SS-${request._id.toString().slice(-6).toUpperCase()}). Status: Pending Approval.`,
        type: 'Request'
      });

      // Dispatch Instant Email Notifications (To Owner & Customer)
      if (receiverUser && targetItem) {
        sendInquiryNotificationToOwner({
          request,
          sender: senderUser,
          receiver: receiverUser,
          item: targetItem,
          itemType
        }).catch(err => console.error('[EmailService] Owner notification error:', err.message));

        sendInquiryConfirmationToCustomer({
          request,
          sender: senderUser,
          receiver: receiverUser,
          item: targetItem,
          itemType
        }).catch(err => console.error('[EmailService] Customer confirmation error:', err.message));
      }
    }

    res.status(201).json({ success: true, data: request });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Update request status (Accept / Reject / Complete / Cancel)
// @route   PUT /api/requests/:id
// @access  Private
exports.updateRequestStatus = async (req, res) => {
  const { status, responseMessage } = req.body;

  try {
    let request = await Request.findById(req.params.id);

    if (!request) {
      return res.status(404).json({ success: false, message: 'Request not found' });
    }

    // Verify authorized user (receiver handles accept/reject/complete, sender handles cancel)
    const isReceiver = request.receiver.toString() === req.user.id;
    const isSender = request.sender.toString() === req.user.id;
    const canAcceptOrReject = isReceiver || req.user.role === 'ADMIN';

    if (!isReceiver && !isSender && req.user.role !== 'ADMIN') {
      return res.status(403).json({ success: false, message: 'Not authorized to access or modify this booking request' });
    }

    const previousStatus = request.status;

    // Prevent transitions on terminal bookings
    if (previousStatus === 'Cancelled') {
      return res.status(400).json({ success: false, message: 'This booking has already been cancelled.' });
    }
    if (previousStatus === 'Rejected') {
      return res.status(400).json({ success: false, message: 'This booking has already been rejected.' });
    }
    if (previousStatus === 'Completed' && status !== 'Completed') {
      return res.status(400).json({ success: false, message: 'Completed bookings cannot change status.' });
    }

    if (status === 'Cancelled') {
      if (!isSender && req.user.role !== 'ADMIN') {
        return res.status(403).json({ success: false, message: 'Only the resident who booked this item can cancel it' });
      }
    }

    if ((status === 'Accepted' || status === 'Rejected' || status === 'Completed') && !canAcceptOrReject) {
      return res.status(403).json({ success: false, message: 'Only the designated owner/provider or administrator can accept, reject, or complete this request' });
    }

    // Atomic inventory locking & overbooking protection
    if (status === 'Accepted' && previousStatus !== 'Accepted' && request.itemType === 'Property') {
      const updatedProperty = await Property.findOneAndUpdate(
        { _id: request.itemId, availableBeds: { $gt: 0 } },
        { $inc: { availableBeds: -1 } },
        { new: true }
      );

      if (!updatedProperty) {
        return res.status(400).json({
          success: false,
          message: 'Cannot accept booking: All vacant beds for this property are already occupied.'
        });
      }
    }

    request.status = status;
    if (responseMessage) {
      request.responseMessage = responseMessage;
    }
    await request.save();

    // Inventory Adjustment & Profile Sync
    if (status === 'Accepted') {
      try {
        const RoommateProfile = require('../models/RoommateProfile');
        if (request.itemType === 'Property') {
          await RoommateProfile.findOneAndUpdate(
            { user: request.sender },
            { selectedStay: request.itemId },
            { new: true, upsert: true }
          );
          await User.findByIdAndUpdate(request.sender, { selectedStay: request.itemId });
        } else if (request.itemType === 'ServiceProvider') {
          await RoommateProfile.findOneAndUpdate(
            { user: request.sender },
            { $addToSet: { selectedProviders: request.itemId } },
            { new: true, upsert: true }
          );
        }
      } catch (err) {
        console.error('Error syncing profile on request acceptance:', err);
      }
    } else if (status === 'Cancelled' || status === 'Rejected') {
      try {
        const RoommateProfile = require('../models/RoommateProfile');
        if (request.itemType === 'Property') {
          // Release any held bed reservations
          const BedReservation = require('../models/BedReservation');
          await BedReservation.updateMany(
            { bookingRequest: request._id },
            { status: 'RELEASED' }
          );

          if (request.assignedBed?.roomNumber) {
            await Property.updateOne(
              {
                _id: request.itemId,
                'rooms.roomNumber': request.assignedBed.roomNumber,
                'rooms.beds.bedNumber': request.assignedBed.bedNumber
              },
              {
                $set: {
                  'rooms.$[r].beds.$[b].isOccupied': false,
                  'rooms.$[r].beds.$[b].currentTenant': null
                }
              },
              {
                arrayFilters: [
                  { 'r.roomNumber': request.assignedBed.roomNumber },
                  { 'b.bedNumber': request.assignedBed.bedNumber }
                ]
              }
            );
          }

          // If previously accepted, restore inventory vacancy safely (once)
          if (previousStatus === 'Accepted') {
            await Property.findByIdAndUpdate(request.itemId, {
              $inc: { availableBeds: 1 }
            });
          }
          await RoommateProfile.findOneAndUpdate(
            { user: request.sender, selectedStay: request.itemId },
            { selectedStay: null }
          );
          await User.findOneAndUpdate(
            { _id: request.sender, selectedStay: request.itemId },
            { selectedStay: null }
          );
        }
      } catch (err) {
        console.error('Error unlinking profile on request cancel/reject:', err);
      }
    }

    // Notify the other party
    const targetUserId = isReceiver ? request.sender : request.receiver;
    const modifierName = req.user.role === 'ADMIN' || req.body.asAdmin ? 'Admin' : (isReceiver ? 'Provider/Owner' : 'User');
    
    await Notification.create({
      user: targetUserId,
      title: status === 'Accepted' ? `🎉 Booking Accepted & Confirmed!` : `Request ${status}`,
      message: status === 'Accepted'
        ? `Your booking for ${request.itemType} has been accepted by ${modifierName}! Your resident living dashboard is now active.`
        : `Your request for ${request.itemType} has been marked as ${status} by ${modifierName}.`,
      type: 'Request'
    });

    // Send Status Update Email to Customer
    if (status === 'Accepted' || status === 'Rejected') {
      try {
        const senderUser = await User.findById(request.sender);
        const receiverUser = await User.findById(request.receiver);
        let item = null;
        if (request.itemType === 'Property') {
          item = await Property.findById(request.itemId);
        } else if (request.itemType === 'ServiceProvider') {
          item = await ServiceProvider.findById(request.itemId);
        }
        if (senderUser && receiverUser && item) {
          sendStatusUpdateEmailToCustomer({
            request,
            sender: senderUser,
            receiver: receiverUser,
            item,
            itemType: request.itemType,
            status,
            responseMessage
          }).catch(err => console.error('[EmailService] Status email error:', err.message));
        }
      } catch (emailErr) {
        console.error('[EmailService] Error preparing status email:', emailErr.message);
      }
    }

    res.json({ success: true, data: request });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
