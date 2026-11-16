const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const User = require('../models/User');
const Property = require('../models/Property');
const Request = require('../models/Request');
const BedReservation = require('../models/BedReservation');

const runTest = async () => {
  try {
    console.log('--- Phase 2 Test: Booking Lifecycle & Bed Reservation Engine ---');
    await connectDB();

    // 1. Find a demo tenant & property
    const tenant = await User.findOne({ email: 'user@staysync.com' }) || await User.findOne({ role: 'USER' });
    const owner = await User.findOne({ role: 'PROPERTY_OWNER' });
    const property = await Property.findOne({ propertyType: 'Hostel' }) || await Property.findOne();

    if (!tenant || !property) {
      console.error('Missing demo tenant or property. Please run seed script first.');
      process.exit(1);
    }

    console.log(`Using Tenant: ${tenant.name} (${tenant._id})`);
    console.log(`Using Property: ${property.title} (${property._id})`);

    // Clean previous test reservations
    await BedReservation.deleteMany({ property: property._id });

    // 2. Test ensurePropertyRooms / getAvailableBeds logic
    const { getAvailableBeds, holdBed, createBooking, updateBookingStatus, cancelBooking } = require('../controllers/bookingController');

    // Mock Req/Res for getAvailableBeds
    let resData = null;
    let resStatus = 200;
    const mockRes = {
      status: (code) => { resStatus = code; return mockRes; },
      json: (d) => { resData = d; return mockRes; }
    };

    console.log('\n[1/5] Testing GET /api/bookings/available-beds...');
    await getAvailableBeds(
      { params: { propertyId: property._id.toString() }, query: {} },
      mockRes
    );

    if (!resData?.success || !resData.data.rooms?.length) {
      throw new Error('Failed to fetch rooms and beds: ' + JSON.stringify(resData));
    }
    console.log(`✓ Fetched ${resData.data.rooms.length} rooms with concrete bed identifiers.`);
    const firstRoom = resData.data.rooms[0];
    const firstBed = firstRoom.beds[0];
    console.log(`Target: ${firstRoom.roomNumber} - ${firstBed.bedNumber} (Status: ${firstBed.status})`);

    // 3. Test holdBed (15-min lock)
    console.log('\n[2/5] Testing POST /api/bookings/hold-bed...');
    const now = new Date();
    const checkIn = new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000); // 2 days later
    const checkOut = new Date(now.getTime() + 32 * 24 * 60 * 60 * 1000);

    let holdResData = null;
    const holdMockRes = {
      status: (code) => { resStatus = code; return holdMockRes; },
      json: (d) => { holdResData = d; return holdMockRes; }
    };

    await holdBed(
      {
        user: { id: tenant._id.toString() },
        body: {
          propertyId: property._id.toString(),
          roomNumber: firstRoom.roomNumber,
          bedNumber: firstBed.bedNumber,
          checkInDate: checkIn.toISOString(),
          checkOutDate: checkOut.toISOString()
        }
      },
      holdMockRes
    );

    if (!holdResData?.success) {
      throw new Error('holdBed failed: ' + JSON.stringify(holdResData));
    }
    console.log(`✓ Bed locked successfully for 15 minutes. Reservation ID: ${holdResData.data.reservationId}`);

    // Test conflicting lock by another tenant
    console.log('\n[3/5] Testing Overlapping Lock Prevention...');
    let conflictResData = null;
    let conflictCode = 200;
    const conflictMockRes = {
      status: (code) => { conflictCode = code; return conflictMockRes; },
      json: (d) => { conflictResData = d; return conflictMockRes; }
    };

    // Another mock user
    const otherUserId = new mongoose.Types.ObjectId().toString();
    await holdBed(
      {
        user: { id: otherUserId },
        body: {
          propertyId: property._id.toString(),
          roomNumber: firstRoom.roomNumber,
          bedNumber: firstBed.bedNumber,
          checkInDate: checkIn.toISOString(),
          checkOutDate: checkOut.toISOString()
        }
      },
      conflictMockRes
    );

    if (conflictCode === 409) {
      console.log(`✓ Correctly rejected conflicting hold with 409 Conflict: "${conflictResData.message}"`);
    } else {
      throw new Error(`Expected 409 Conflict, got ${conflictCode}: ${JSON.stringify(conflictResData)}`);
    }

    // 4. Test createBooking
    console.log('\n[4/5] Testing POST /api/bookings/create...');
    let createResData = null;
    const createMockRes = {
      status: (code) => { resStatus = code; return createMockRes; },
      json: (d) => { createResData = d; return createMockRes; }
    };

    await createBooking(
      {
        user: { id: tenant._id.toString() },
        body: {
          propertyId: property._id.toString(),
          roomNumber: firstRoom.roomNumber,
          bedNumber: firstBed.bedNumber,
          roomType: firstRoom.tierName,
          checkInDate: checkIn.toISOString(),
          checkOutDate: checkOut.toISOString(),
          durationMonths: 1,
          message: 'Phase 2 Test Booking'
        }
      },
      createMockRes
    );

    if (!createResData?.success || !createResData.data?._id) {
      throw new Error('createBooking failed: ' + JSON.stringify(createResData));
    }
    const booking = createResData.data;
    console.log(`✓ Booking created with ID: ${booking._id}, status: ${booking.status}`);
    console.log(`  Assigned: ${booking.assignedBed.roomNumber} - ${booking.assignedBed.bedNumber}`);
    console.log(`  Total Pricing: ₹${booking.pricingDetails.totalAmount}`);

    // 5. Test Owner Lifecycle: updateBookingStatus (Accept -> Payment Pending -> Checked In -> Completed)
    console.log('\n[5/5] Testing Lifecycle Status Transitions...');

    // Accept -> moves to Payment Pending
    let updateResData = null;
    const updateMockRes = {
      status: (code) => { resStatus = code; return updateMockRes; },
      json: (d) => { updateResData = d; return updateMockRes; }
    };

    await updateBookingStatus(
      {
        params: { id: booking._id.toString() },
        user: { id: property.owner.toString(), role: 'PROPERTY_OWNER' },
        body: { status: 'Accepted' }
      },
      updateMockRes
    );

    if (updateResData?.data?.status !== 'Payment Pending') {
      throw new Error(`Expected status to transition to Payment Pending, got code ${resStatus}: ` + JSON.stringify(updateResData));
    }
    console.log(`✓ Owner Accepted -> Status transitioned to "${updateResData.data.status}"`);

    // Check In
    await updateBookingStatus(
      {
        params: { id: booking._id.toString() },
        user: { id: owner ? owner._id.toString() : property.owner.toString(), role: 'ADMIN' },
        body: { status: 'Checked In' }
      },
      updateMockRes
    );
    console.log(`✓ Marked Checked In -> checkInCompletedAt recorded: ${updateResData.data.checkInCompletedAt}`);

    // Test Cancellation Policy
    console.log('\nTesting Cancellation Policy & Refund Calculation...');
    let cancelResData = null;
    const cancelMockRes = {
      status: (code) => { resStatus = code; return cancelMockRes; },
      json: (d) => { cancelResData = d; return cancelMockRes; }
    };

    // Create a fresh booking to test cancel
    const testCancelBooking = await Request.create({
      sender: tenant._id,
      receiver: property.owner,
      itemType: 'Property',
      itemId: property._id,
      message: 'Cancel test',
      status: 'Confirmed',
      paymentStatus: 'Paid',
      assignedBed: { roomNumber: 'Room 101', bedNumber: 'Bed A' },
      bookingDetails: { checkInDate: checkIn, checkOutDate: checkOut },
      pricingDetails: { totalAmount: 10000 }
    });

    await cancelBooking(
      {
        params: { id: testCancelBooking._id.toString() },
        user: { id: tenant._id.toString(), role: 'USER' },
        body: { reason: 'Test user relocation cancelled' }
      },
      cancelMockRes
    );

    if (!cancelResData?.success) {
      throw new Error('cancelBooking failed: ' + JSON.stringify(cancelResData));
    }
    console.log(`✓ Cancellation successfully handled under ${cancelResData.data.policy} Policy.`);
    console.log(`  Hours to check-in: ${cancelResData.data.hoursToCheckIn}h`);
    console.log(`  Refund %: ${cancelResData.data.refundPercentage}%`);
    console.log(`  Refund Amount: ₹${cancelResData.data.refundAmount}`);

    // Clean test records
    await Request.findByIdAndDelete(testCancelBooking._id);
    await Request.findByIdAndDelete(booking._id);
    await BedReservation.deleteMany({ property: property._id });

    console.log('\n======================================================');
    console.log('ALL PHASE 2 TESTS PASSED SUCCESSFULLY! 🚀');
    console.log('======================================================');
    process.exit(0);
  } catch (err) {
    console.error('\n❌ Test Error:', err);
    process.exit(1);
  }
};

runTest();
