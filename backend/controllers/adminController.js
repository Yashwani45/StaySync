const User = require('../models/User');
const Property = require('../models/Property');
const ServiceProvider = require('../models/ServiceProvider');
const Request = require('../models/Request');
const Review = require('../models/Review');
const Payment = require('../models/Payment');
const Notification = require('../models/Notification');
const AuditLog = require('../models/AuditLog');
const Report = require('../models/Report');
const PlatformSettings = require('../models/PlatformSettings');

// Helper to log audit actions
const createAuditRecord = async (actorId, action, targetType, targetId, reason, metadata = {}) => {
  try {
    const actorUser = await User.findById(actorId);
    return await AuditLog.create({
      actor: actorId,
      actorName: actorUser ? actorUser.name : 'Super Admin',
      action,
      targetType,
      targetId: targetId ? targetId.toString() : 'SYSTEM',
      reason: reason || 'Super Admin operations decision',
      metadata
    });
  } catch (err) {
    console.error('[AuditLog] Error recording action:', err.message);
  }
};

// ============================================================================
// 1. DASHBOARD OVERVIEW & ANALYTICS
// ============================================================================
exports.getStats = async (req, res) => {
  try {
    const [
      totalUsers,
      totalTenants,
      totalOwners,
      totalProviders,
      totalAdmins,
      totalProperties,
      verifiedProperties,
      pendingProperties,
      totalServices,
      verifiedServices,
      pendingServices,
      totalBookings,
      pendingBookings,
      acceptedBookings,
      cancelledBookings,
      completedBookings,
      openReports,
      completedPayments
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: 'USER' }),
      User.countDocuments({ role: { $in: ['PROPERTY_OWNER', 'HOSTEL_OWNER', 'PG_OWNER', 'ROOM_OWNER'] } }),
      User.countDocuments({ role: { $in: ['PROVIDER', 'TIFFIN_PROVIDER', 'CLEANING_LAUNDRY_PROVIDER'] } }),
      User.countDocuments({ role: { $in: ['ADMIN', 'SUPER_ADMIN'] } }),
      Property.countDocuments(),
      Property.countDocuments({ verificationStatus: 'Verified' }),
      Property.countDocuments({ verificationStatus: { $ne: 'Verified' } }),
      ServiceProvider.countDocuments(),
      ServiceProvider.countDocuments({ verificationStatus: 'Verified' }),
      ServiceProvider.countDocuments({ verificationStatus: { $ne: 'Verified' } }),
      Request.countDocuments(),
      Request.countDocuments({ status: 'Pending' }),
      Request.countDocuments({ status: 'Accepted' }),
      Request.countDocuments({ status: 'Cancelled' }),
      Request.countDocuments({ status: 'Completed' }),
      Report.countDocuments({ status: { $in: ['OPEN', 'INVESTIGATING'] } }),
      Payment.find({ status: 'Captured' }).select('amount')
    ]);

    // Financial calculation based on real Payment records
    const grossVolume = completedPayments.reduce((sum, p) => sum + (p.amount || 0), 0);
    const platformRevenue = Math.round(grossVolume * 0.05); // Standard 5% platform service fee

    // Booking breakdown by accommodation type
    const propertyTypeCounts = await Property.aggregate([
      { $group: { _id: '$propertyType', count: { $sum: 1 } } }
    ]);

    // Service category breakdown
    const serviceCategoryCounts = await ServiceProvider.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } }
    ]);

    // Date-filtered analytics (7d, 30d, 90d)
    const { period = '7d' } = req.query;
    let daysBack = 7;
    if (period === '30d') daysBack = 30;
    else if (period === '90d') daysBack = 90;

    const filterStartDate = new Date();
    filterStartDate.setDate(filterStartDate.getDate() - daysBack);

    // Registration trends
    const registrationTrend = await User.aggregate([
      { $match: { createdAt: { $gte: filterStartDate } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Revenue trends (captured payments)
    const revenueTrend = await Payment.aggregate([
      { $match: { status: 'Captured', createdAt: { $gte: filterStartDate } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          volume: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Booking trends
    const bookingTrend = await Request.aggregate([
      { $match: { createdAt: { $gte: filterStartDate } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Recent platform activities from AuditLog
    const recentActivity = await AuditLog.find()
      .sort({ createdAt: -1 })
      .limit(8);

    res.json({
      success: true,
      stats: {
        users: totalUsers,
        tenants: totalTenants,
        owners: totalOwners,
        providers: totalProviders,
        admins: totalAdmins,
        properties: totalProperties,
        verifiedProperties,
        pendingProperties,
        services: totalServices,
        verifiedServices,
        pendingServices,
        pendingVerifications: pendingProperties + pendingServices,
        bookings: totalBookings,
        activeRequests: pendingBookings,
        acceptedBookings,
        cancelledBookings,
        completedBookings,
        openReports,
        grossVolume,
        platformRevenue,
        propertyTypeCounts,
        serviceCategoryCounts,
        registrationTrend,
        revenueTrend,
        bookingTrend,
        recentActivity,
        period
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// ============================================================================
// 2. USER & ROLE MANAGEMENT
// ============================================================================
exports.getUsers = async (req, res) => {
  try {
    const { role, status, search, page = 1, limit = 20 } = req.query;
    const conditions = [];

    if (role && role !== 'ALL') {
      if (role === 'PROPERTY_OWNER' || role === 'OWNERS') {
        conditions.push({ role: { $in: ['PROPERTY_OWNER', 'HOSTEL_OWNER', 'PG_OWNER', 'ROOM_OWNER'] } });
      } else if (role === 'HOSTEL_OWNER' || role === 'HOSTEL') {
        conditions.push({
          $or: [
            { role: 'HOSTEL_OWNER' },
            { role: 'PROPERTY_OWNER', propertyType: 'Hostel' }
          ]
        });
      } else if (role === 'PG_OWNER' || role === 'PG') {
        conditions.push({
          $or: [
            { role: 'PG_OWNER' },
            { role: 'PROPERTY_OWNER', propertyType: 'PG' }
          ]
        });
      } else if (role === 'ROOM_OWNER' || role === 'ROOM') {
        conditions.push({
          $or: [
            { role: 'ROOM_OWNER' },
            { role: 'PROPERTY_OWNER', propertyType: { $in: ['Room', 'Flat'] } }
          ]
        });
      } else if (role === 'PROVIDER' || role === 'PROVIDERS') {
        conditions.push({ role: { $in: ['PROVIDER', 'TIFFIN_PROVIDER', 'CLEANING_LAUNDRY_PROVIDER'] } });
      } else if (role === 'CLEANING_PROVIDER' || role === 'CLEANING') {
        conditions.push({
          $or: [
            { role: 'CLEANING_LAUNDRY_PROVIDER' },
            { role: 'PROVIDER', providerType: { $regex: /clean/i } },
            { role: 'PROVIDER', name: { $regex: /clean/i } }
          ]
        });
      } else if (role === 'TIFFIN_PROVIDER' || role === 'TIFFIN') {
        conditions.push({
          $or: [
            { role: 'TIFFIN_PROVIDER' },
            { role: 'PROVIDER', providerType: { $regex: /tiffin/i } },
            { role: 'PROVIDER', name: { $regex: /tiffin/i } }
          ]
        });
      } else if (role === 'LAUNDRY_PROVIDER' || role === 'LAUNDRY') {
        conditions.push({
          $or: [
            { role: 'CLEANING_LAUNDRY_PROVIDER' },
            { role: 'PROVIDER', providerType: { $regex: /laundry/i } },
            { role: 'PROVIDER', name: { $regex: /laundry/i } }
          ]
        });
      } else if (role === 'ADMIN' || role === 'ADMINS') {
        conditions.push({ role: { $in: ['ADMIN', 'SUPER_ADMIN'] } });
      } else if (role === 'USER' || role === 'TENANTS') {
        conditions.push({ role: 'USER' });
      } else {
        conditions.push({ role });
      }
    }
    if (status && status !== 'ALL') {
      conditions.push({ accountStatus: status });
    }
    if (search) {
      const searchRegex = new RegExp(search.trim(), 'i');
      conditions.push({
        $or: [
          { name: searchRegex },
          { email: searchRegex },
          { phone: searchRegex }
        ]
      });
    }

    const query = conditions.length > 0 ? { $and: conditions } : {};

    const [total, users, allUsers] = await Promise.all([
      User.countDocuments(query),
      User.find(query)
        .select('-password')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(parseInt(limit)),
      User.find({}).select('role providerType propertyType name')
    ]);

    const roleCounts = {
      ALL: allUsers.length,
      USER: allUsers.filter(u => u.role === 'USER').length,
      PROPERTY_OWNER: allUsers.filter(u => ['PROPERTY_OWNER', 'HOSTEL_OWNER', 'PG_OWNER', 'ROOM_OWNER'].includes(u.role)).length,
      HOSTEL_OWNER: allUsers.filter(u => u.role === 'HOSTEL_OWNER' || (u.role === 'PROPERTY_OWNER' && u.propertyType === 'Hostel')).length,
      PG_OWNER: allUsers.filter(u => u.role === 'PG_OWNER' || (u.role === 'PROPERTY_OWNER' && u.propertyType === 'PG')).length,
      ROOM_OWNER: allUsers.filter(u => u.role === 'ROOM_OWNER' || (u.role === 'PROPERTY_OWNER' && ['Room', 'Flat'].includes(u.propertyType))).length,
      PROVIDER: allUsers.filter(u => ['PROVIDER', 'TIFFIN_PROVIDER', 'CLEANING_LAUNDRY_PROVIDER'].includes(u.role)).length,
      CLEANING: allUsers.filter(u => u.role === 'CLEANING_LAUNDRY_PROVIDER' || (u.providerType && /clean/i.test(u.providerType)) || (u.name && /clean/i.test(u.name))).length,
      TIFFIN: allUsers.filter(u => u.role === 'TIFFIN_PROVIDER' || (u.providerType && /tiffin/i.test(u.providerType)) || (u.name && /tiffin/i.test(u.name))).length,
      LAUNDRY: allUsers.filter(u => (u.providerType && /laundry/i.test(u.providerType)) || (u.name && /laundry/i.test(u.name))).length,
      ADMIN: allUsers.filter(u => ['ADMIN', 'SUPER_ADMIN'].includes(u.role)).length
    };

    res.json({
      success: true,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      count: users.length,
      roleCounts,
      data: users
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getUserDetails = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const [bookings, properties, services, auditTrail] = await Promise.all([
      Request.find({ sender: user._id })
        .populate('itemId')
        .populate('receiver', 'name email phone')
        .sort({ createdAt: -1 })
        .limit(10),
      Property.find({ owner: user._id }).sort({ createdAt: -1 }),
      ServiceProvider.find({ user: user._id }).sort({ createdAt: -1 }),
      AuditLog.find({ targetId: user._id.toString() }).sort({ createdAt: -1 }).limit(10)
    ]);

    res.json({
      success: true,
      data: {
        user,
        bookings,
        properties,
        services,
        auditTrail
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.updateUserStatus = async (req, res) => {
  const { status, reason } = req.body;
  try {
    const targetUser = await User.findById(req.params.id);
    if (!targetUser) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Safety Guard: Prevent suspending the last active Super Admin
    if (targetUser.role === 'SUPER_ADMIN' && (status === 'Suspended' || status === 'Deactivated')) {
      const activeSuperAdmins = await User.countDocuments({
        role: 'SUPER_ADMIN',
        accountStatus: 'Active',
        _id: { $ne: targetUser._id }
      });
      if (activeSuperAdmins === 0) {
        return res.status(400).json({
          success: false,
          message: 'Safety rule: Cannot suspend or deactivate the last remaining active Super Admin.'
        });
      }
    }

    targetUser.accountStatus = status;
    targetUser.suspensionReason = reason || '';
    await targetUser.save();

    await createAuditRecord(
      req.user.id,
      status === 'Active' ? 'USER_ACTIVATED' : 'USER_SUSPENDED',
      'User',
      targetUser._id,
      reason || `Account status changed to ${status}`,
      { targetEmail: targetUser.email, targetRole: targetUser.role }
    );

    res.json({
      success: true,
      message: `User account status updated to ${status}`,
      data: targetUser
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.updateUserRole = async (req, res) => {
  const { userId, role } = req.body;
  try {
    const targetUser = await User.findById(userId);
    if (!targetUser) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Prevent demoting last active Super Admin
    if (targetUser.role === 'SUPER_ADMIN' && role !== 'SUPER_ADMIN') {
      const activeSuperAdmins = await User.countDocuments({
        role: 'SUPER_ADMIN',
        accountStatus: 'Active',
        _id: { $ne: targetUser._id }
      });
      if (activeSuperAdmins === 0) {
        return res.status(400).json({
          success: false,
          message: 'Cannot demote the last remaining active Super Admin.'
        });
      }
    }

    // Only SUPER_ADMIN can promote users to ADMIN or SUPER_ADMIN
    if ((role === 'ADMIN' || role === 'SUPER_ADMIN') && req.user.role !== 'SUPER_ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Only a Super Admin can promote users to administrative roles.'
      });
    }

    const previousRole = targetUser.role;
    targetUser.role = role;
    await targetUser.save();

    await createAuditRecord(
      req.user.id,
      'ROLE_UPDATED',
      'User',
      targetUser._id,
      `Role updated from ${previousRole} to ${role}`,
      { previousRole, newRole: role, targetEmail: targetUser.email }
    );

    res.json({
      success: true,
      message: `User role successfully updated to ${role}`,
      data: targetUser
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// ============================================================================
// 3. OWNER & SERVICE PROVIDER VERIFICATION QUEUE
// ============================================================================
exports.getVerificationQueue = async (req, res) => {
  try {
    const [pendingProperties, pendingServices] = await Promise.all([
      Property.find({ verificationStatus: { $ne: 'Verified' } })
        .populate('owner', 'name email phone currentCity')
        .sort({ createdAt: -1 }),
      ServiceProvider.find({ verificationStatus: { $ne: 'Verified' } })
        .populate('user', 'name email phone currentCity')
        .sort({ createdAt: -1 })
    ]);

    res.json({
      success: true,
      data: {
        properties: pendingProperties,
        services: pendingServices,
        total: pendingProperties.length + pendingServices.length
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.toggleVerification = async (req, res) => {
  const { targetType, targetId, status, reason } = req.body; // status: 'Verified' or 'Rejected'
  try {
    let targetDoc;
    let userId;

    if (targetType === 'Property') {
      targetDoc = await Property.findById(targetId);
      if (!targetDoc) return res.status(404).json({ success: false, message: 'Property not found' });
      targetDoc.verificationStatus = status;
      userId = targetDoc.owner;
      await targetDoc.save();
    } else if (targetType === 'ServiceProvider') {
      targetDoc = await ServiceProvider.findById(targetId);
      if (!targetDoc) return res.status(404).json({ success: false, message: 'Service Provider not found' });
      targetDoc.verificationStatus = status;
      userId = targetDoc.user;
      await targetDoc.save();
    } else {
      return res.status(400).json({ success: false, message: 'Invalid target type' });
    }

    await createAuditRecord(
      req.user.id,
      status === 'Verified' ? `${targetType.toUpperCase()}_APPROVED` : `${targetType.toUpperCase()}_REJECTED`,
      targetType,
      targetId,
      reason || `Verification status marked as ${status}`,
      { status, title: targetDoc.title || targetDoc.businessName }
    );

    // Send notification to owner/provider
    if (userId) {
      await Notification.create({
        user: userId,
        title: `Verification Update: ${status}`,
        message: `Your listing "${targetDoc.title || targetDoc.businessName}" has been marked as ${status} by StaySync Admin. Note: ${reason || 'Reviewed by Admin Team'}`,
        type: 'Verification'
      });
    }

    res.json({
      success: true,
      message: `Verification status updated to ${status}`,
      data: targetDoc
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// ============================================================================
// 4. PROPERTY & LISTING MANAGEMENT
// ============================================================================
exports.getPropertiesAdmin = async (req, res) => {
  try {
    const { propertyType, status, search, city } = req.query;
    const query = {};

    if (propertyType && propertyType !== 'ALL') query.propertyType = propertyType;
    if (status && status !== 'ALL') query.verificationStatus = status;
    if (city && city !== 'ALL') query.city = new RegExp(city, 'i');
    if (search) {
      query.$or = [
        { title: new RegExp(search.trim(), 'i') },
        { address: new RegExp(search.trim(), 'i') }
      ];
    }

    const properties = await Property.find(query)
      .populate('owner', 'name email phone')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: properties.length, data: properties });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.updatePropertyStatusAdmin = async (req, res) => {
  const { verificationStatus, isAvailable, reason } = req.body;
  try {
    const property = await Property.findById(req.params.id);
    if (!property) return res.status(404).json({ success: false, message: 'Property not found' });

    if (verificationStatus) property.verificationStatus = verificationStatus;
    if (isAvailable !== undefined) property.isAvailable = isAvailable;
    await property.save();

    await createAuditRecord(
      req.user.id,
      'PROPERTY_MODERATED',
      'Property',
      property._id,
      reason || 'Property status updated by Admin',
      { verificationStatus, isAvailable, title: property.title }
    );

    res.json({ success: true, message: 'Property updated successfully', data: property });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// ============================================================================
// 5. SERVICE MANAGEMENT
// ============================================================================
exports.getServicesAdmin = async (req, res) => {
  try {
    const { category, status, search, city } = req.query;
    const query = {};

    if (category && category !== 'ALL') query.category = category;
    if (status && status !== 'ALL') query.verificationStatus = status;
    if (city && city !== 'ALL') query.city = new RegExp(city, 'i');
    if (search) {
      query.$or = [
        { businessName: new RegExp(search.trim(), 'i') },
        { address: new RegExp(search.trim(), 'i') }
      ];
    }

    const services = await ServiceProvider.find(query)
      .populate('user', 'name email phone')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: services.length, data: services });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.updateServiceStatusAdmin = async (req, res) => {
  const { verificationStatus, isAvailable, reason } = req.body;
  try {
    const service = await ServiceProvider.findById(req.params.id);
    if (!service) return res.status(404).json({ success: false, message: 'Service not found' });

    if (verificationStatus) service.verificationStatus = verificationStatus;
    if (isAvailable !== undefined) service.isAvailable = isAvailable;
    await service.save();

    await createAuditRecord(
      req.user.id,
      'SERVICE_MODERATED',
      'ServiceProvider',
      service._id,
      reason || 'Service status updated by Admin',
      { verificationStatus, isAvailable, businessName: service.businessName }
    );

    res.json({ success: true, message: 'Service status updated successfully', data: service });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// ============================================================================
// 6. CENTRAL BOOKING MANAGEMENT
// ============================================================================
exports.getBookingsAdmin = async (req, res) => {
  try {
    const { itemType, status, paymentStatus, search } = req.query;
    const query = {};

    if (itemType && itemType !== 'ALL') query.itemType = itemType;
    if (status && status !== 'ALL') query.status = status;
    if (paymentStatus && paymentStatus !== 'ALL') query.paymentStatus = paymentStatus;

    const bookings = await Request.find(query)
      .populate('sender', 'name email phone currentCity')
      .populate('receiver', 'name email phone')
      .populate('itemId')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: bookings.length, data: bookings });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// ============================================================================
// 7. PAYMENTS & FINANCIAL OVERSIGHT
// ============================================================================
exports.getPaymentsAdmin = async (req, res) => {
  try {
    const { status } = req.query;
    const query = {};
    if (status && status !== 'ALL') query.status = status;

    const payments = await Payment.find(query)
      .populate('payer', 'name email phone')
      .populate('payee', 'name email phone')
      .populate('bookingId')
      .sort({ createdAt: -1 });

    const grossVolume = payments
      .filter(p => p.status === 'Captured')
      .reduce((sum, p) => sum + (p.amount || 0), 0);
    const platformFee = Math.round(grossVolume * 0.05);

    res.json({
      success: true,
      metrics: {
        totalTransactions: payments.length,
        capturedCount: payments.filter(p => p.status === 'Captured').length,
        grossVolume,
        platformFee
      },
      data: payments
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// ============================================================================
// 8. COMPLAINTS & DISPUTES QUEUE
// ============================================================================
exports.getComplaintsAdmin = async (req, res) => {
  try {
    const { status } = req.query;
    const query = {};
    if (status && status !== 'ALL') query.status = status;

    const reports = await Report.find(query)
      .populate('reporter', 'name email phone')
      .populate('resolvedBy', 'name email')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: reports.length, data: reports });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.updateComplaintAdmin = async (req, res) => {
  const { status, adminNotes } = req.body;
  try {
    const report = await Report.findById(req.params.id);
    if (!report) return res.status(404).json({ success: false, message: 'Report not found' });

    report.status = status || report.status;
    report.adminNotes = adminNotes || report.adminNotes;
    if (status === 'RESOLVED' || status === 'DISMISSED') {
      report.resolvedBy = req.user.id;
    }
    await report.save();

    await createAuditRecord(
      req.user.id,
      'COMPLAINT_RESOLVED',
      'Report',
      report._id,
      `Report status changed to ${status}. Notes: ${adminNotes || 'None'}`
    );

    res.json({ success: true, message: 'Report updated successfully', data: report });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// ============================================================================
// 9. REVIEWS & RATINGS MODERATION
// ============================================================================
exports.getReviewsAdmin = async (req, res) => {
  try {
    const reviews = await Review.find()
      .populate('author', 'name email')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: reviews.length, data: reviews });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.deleteReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ success: false, message: 'Review not found' });

    const targetId = review.targetId;
    const targetType = review.targetType;

    await createAuditRecord(
      req.user.id,
      'REVIEW_DELETED',
      'Review',
      review._id,
      'Review removed for violation or moderation'
    );

    await review.deleteOne();

    // Recalculate target rating
    if (targetType === 'Property') {
      const remainingReviews = await Review.find({ targetId });
      const avg = remainingReviews.length ? remainingReviews.reduce((s, r) => s + r.rating, 0) / remainingReviews.length : 0;
      await Property.findByIdAndUpdate(targetId, { rating: avg, reviewsCount: remainingReviews.length });
    } else if (targetType === 'ServiceProvider') {
      const remainingReviews = await Review.find({ targetId });
      const avg = remainingReviews.length ? remainingReviews.reduce((s, r) => s + r.rating, 0) / remainingReviews.length : 4.0;
      await ServiceProvider.findByIdAndUpdate(targetId, { rating: avg });
    }

    res.json({ success: true, message: 'Review moderated and removed successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// ============================================================================
// 10. ADMIN MANAGEMENT & PERMISSIONS
// ============================================================================
exports.getAdmins = async (req, res) => {
  try {
    const admins = await User.find({ role: { $in: ['ADMIN', 'SUPER_ADMIN'] } })
      .select('-password')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: admins.length, data: admins });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.createAdmin = async (req, res) => {
  const { name, email, password, phone, role = 'ADMIN', permissions = ['ALL'] } = req.body;
  try {
    // Only SUPER_ADMIN can create new admin accounts
    if (req.user.role !== 'SUPER_ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Only a Super Administrator can provision new administrator accounts.'
      });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'An account with this email already exists' });
    }

    const newAdmin = await User.create({
      name,
      email,
      password,
      phone,
      role: role === 'SUPER_ADMIN' ? 'SUPER_ADMIN' : 'ADMIN',
      permissions,
      accountStatus: 'Active'
    });

    await createAuditRecord(
      req.user.id,
      'ADMIN_PROVISIONED',
      'User',
      newAdmin._id,
      `New administrative account created (${newAdmin.role})`,
      { email: newAdmin.email, role: newAdmin.role }
    );

    res.status(201).json({
      success: true,
      message: `${newAdmin.role} account created successfully`,
      data: {
        id: newAdmin._id,
        name: newAdmin.name,
        email: newAdmin.email,
        role: newAdmin.role,
        permissions: newAdmin.permissions
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// ============================================================================
// 11. PLATFORM SETTINGS
// ============================================================================
exports.getSettings = async (req, res) => {
  try {
    let settings = await PlatformSettings.findOne();
    if (!settings) {
      settings = await PlatformSettings.create({});
    }
    res.json({ success: true, data: settings });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.updateSettings = async (req, res) => {
  try {
    let settings = await PlatformSettings.findOne();
    if (!settings) {
      settings = await PlatformSettings.create(req.body);
    } else {
      Object.assign(settings, req.body);
      await settings.save();
    }

    await createAuditRecord(
      req.user.id,
      'PLATFORM_SETTINGS_UPDATED',
      'PlatformSettings',
      settings._id,
      'Platform configuration adjusted by Super Admin'
    );

    res.json({ success: true, message: 'Platform settings updated successfully', data: settings });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// ============================================================================
// 12. AUDIT LOGS
// ============================================================================
exports.getAuditLogs = async (req, res) => {
  try {
    const { action, limit = 50 } = req.query;
    const query = {};
    if (action && action !== 'ALL') query.action = action;

    const logs = await AuditLog.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));

    res.json({ success: true, count: logs.length, data: logs });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
