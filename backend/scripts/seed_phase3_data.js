const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const connectDB = require('../config/db');

const User = require('../models/User');
const Property = require('../models/Property');
const Request = require('../models/Request');
const Payment = require('../models/Payment');
const MaintenanceTicket = require('../models/MaintenanceTicket');
const RentSchedule = require('../models/RentSchedule');
const RentalAgreement = require('../models/RentalAgreement');
const Inspection = require('../models/Inspection');
const CommunityPost = require('../models/CommunityPost');
const Settlement = require('../models/Settlement');
const Refund = require('../models/Refund');

async function seedPhase3Data() {
  try {
    console.log('Connecting to DB for Phase 3 seeding...');
    await connectDB();

    const user = await User.findOne({ email: 'user@staysync.com' });
    const aarav = await User.findOne({ email: 'aarav.resident@staysync.com' }) || user;
    const ananya = await User.findOne({ email: 'ananya.resident@staysync.com' }) || user;
    const owner = await User.findOne({ email: 'owner@staysync.com' });
    const harish = await User.findOne({ email: 'harish.hostel@staysync.com' }) || owner;
    const admin = await User.findOne({ email: 'admin@staysync.com' });

    const property = await Property.findOne({ owner: { $in: [owner._id, harish._id] } }) || await Property.findOne({});
    const booking = await Request.findOne({ sender: { $in: [user._id, aarav._id, ananya._id] }, itemType: 'Property' }) || await Request.findOne({});

    if (!property || !booking) {
      console.log('Property or booking missing, aborting seed.');
      process.exit(1);
    }

    console.log('Using Property:', property.title);
    console.log('Using Booking:', booking._id);

    // 1. Seed Maintenance Tickets
    console.log('Seeding Maintenance Tickets...');
    const tickets = [
      {
        property: property._id,
        tenant: user._id,
        owner: property.owner,
        roomNumber: 'Room 101',
        bedNumber: 'Bed A',
        category: 'Plumbing',
        priority: 'High',
        title: 'Geyser Hot Water Valve Leaking',
        description: 'The bathroom geyser valve started dripping hot water slowly. Need plumber to tighten or replace the washer.',
        status: 'In Progress',
        assignedTo: { name: 'Ramesh Plumber', phone: '+91 98260 99881', assignedAt: new Date(Date.now() - 24 * 3600 * 1000) },
        statusHistory: [
          { status: 'Submitted', updatedBy: user._id, note: 'Reported by resident' },
          { status: 'Assigned', updatedBy: property.owner, note: 'Assigned to trusted building technician' },
          { status: 'In Progress', updatedBy: property.owner, note: 'Technician visiting today at 3 PM' }
        ]
      },
      {
        property: property._id,
        tenant: aarav._id,
        owner: property.owner,
        roomNumber: 'Room 102',
        bedNumber: 'Bed B',
        category: 'Internet',
        priority: 'Medium',
        title: '2nd Floor Wi-Fi Router Intermittent',
        description: 'Wi-Fi disconnects frequently during evening study hours (8 PM - 11 PM). Router might need reboot or firmware update.',
        status: 'Resolved',
        assignedTo: { name: 'Airtel Fiber Tech', phone: '+91 98260 77441', assignedAt: new Date(Date.now() - 48 * 3600 * 1000) },
        resolutionNotes: 'Mesh node replaced on 2nd floor corridor. Signal strength verified above -55 dBm.',
        resolvedAt: new Date(),
        satisfactionRating: 5
      }
    ];

    for (const t of tickets) {
      const ex = await MaintenanceTicket.findOne({ title: t.title });
      if (!ex) await MaintenanceTicket.create(t);
    }

    // 2. Seed Rent Schedules
    console.log('Seeding Rent Schedules...');
    const rentRecords = [
      {
        booking: booking._id,
        property: property._id,
        tenant: user._id,
        owner: property.owner,
        month: 'November 2026',
        dueDate: new Date('2026-11-05'),
        baseRent: 6000,
        utilityCharges: 500,
        totalDue: 6500,
        amountPaid: 6500,
        status: 'Paid',
        paidAt: new Date('2026-11-03'),
        receiptNumber: 'REC-2026-NOV-8812'
      },
      {
        booking: booking._id,
        property: property._id,
        tenant: user._id,
        owner: property.owner,
        month: 'December 2026',
        dueDate: new Date('2026-12-05'),
        baseRent: 6000,
        utilityCharges: 500,
        totalDue: 6500,
        amountPaid: 0,
        status: 'Upcoming',
        receiptNumber: 'REC-2026-DEC-9941'
      }
    ];

    for (const r of rentRecords) {
      const ex = await RentSchedule.findOne({ tenant: r.tenant, month: r.month });
      if (!ex) await RentSchedule.create(r);
    }

    // 3. Seed Rental Agreement
    console.log('Seeding Rental Agreement...');
    const exAgr = await RentalAgreement.findOne({ booking: booking._id });
    if (!exAgr) {
      await RentalAgreement.create({
        agreementNumber: 'AGR-2026-IND-7701',
        booking: booking._id,
        property: property._id,
        tenant: user._id,
        owner: property.owner,
        roomNumber: 'Room 101',
        bedNumber: 'Bed A',
        startDate: new Date('2026-11-01'),
        endDate: new Date('2027-04-30'),
        monthlyRent: 6000,
        securityDeposit: 5000,
        noticePeriodDays: 30,
        termsAndConditions: [
          'Rent is due on or before the 5th of each calendar month via the StaySync online portal.',
          'A formal 30-day notice must be submitted prior to vacation of premises.',
          'Consumption of tobacco, cigarettes, and alcoholic beverages is strictly prohibited inside the hostel.',
          'Common room and study hours are maintained between 10:30 PM to 6:30 AM.',
          'Security deposit is refundable upon clearance of room inventory during move-out inspection.'
        ],
        status: 'Active',
        tenantAcknowledged: true,
        tenantAcknowledgedAt: new Date('2026-11-01'),
        ownerAcknowledged: true,
        ownerAcknowledgedAt: new Date('2026-11-01')
      });
    }

    // 4. Seed Move-In Inspection
    console.log('Seeding Move-In Inspection...');
    const exInsp = await Inspection.findOne({ booking: booking._id, type: 'MoveIn' });
    if (!exInsp) {
      await Inspection.create({
        booking: booking._id,
        property: property._id,
        tenant: user._id,
        owner: property.owner,
        roomNumber: 'Room 101',
        type: 'MoveIn',
        roomConditionRating: 5,
        depositAmount: 5000,
        finalRefundAmount: 5000,
        settlementStatus: 'Settled',
        tenantConfirmed: true,
        ownerConfirmed: true,
        notes: 'Room cleaned and disinfected before key handover. All fittings operational.'
      });
    }

    // 5. Seed Community Posts
    console.log('Seeding Community Board Posts...');
    const posts = [
      {
        city: 'Indore',
        author: admin._id,
        authorName: 'StaySync Operations Desk',
        authorRole: 'Administrator',
        title: '📢 Diwali Hostel Security & Guest Access Guidelines',
        content: 'Residents are requested to inform wardens 24 hours in advance regarding holiday travel schedules. Security teams will conduct nightly sweeps of closed rooms.',
        type: 'Announcement',
        pinned: true
      },
      {
        city: 'Indore',
        author: user._id,
        authorName: 'Yashwani Sharma',
        authorRole: 'Resident',
        title: 'Anyone interested in shared weekend badminton at SGSITS indoor court?',
        content: 'We usually play every Saturday morning at 7:30 AM. Looking for 2 more players for doubles practice!',
        type: 'Event',
        pinned: false,
        comments: [
          {
            author: aarav._id,
            authorName: 'Aarav Mehta',
            authorRole: 'Resident',
            text: 'I would love to join! Count me in for this Saturday.'
          }
        ]
      },
      {
        city: 'Indore',
        author: ananya._id,
        authorName: 'Ananya Sen',
        authorRole: 'Resident',
        title: 'Best library or study cafe near Vijay Nagar / Scheme 54?',
        content: 'Looking for a calm workspace with good coffee and stable Wi-Fi for weekend design sprints. Any recommendations?',
        type: 'Discussion',
        pinned: false
      }
    ];

    for (const p of posts) {
      const ex = await CommunityPost.findOne({ title: p.title });
      if (!ex) await CommunityPost.create(p);
    }

    // 6. Seed Settlement
    console.log('Seeding Settlement...');
    const exSettlement = await Settlement.findOne({ owner: property.owner });
    if (!exSettlement) {
      await Settlement.create({
        owner: property.owner,
        periodStart: new Date('2026-10-01'),
        periodEnd: new Date('2026-10-31'),
        totalBookingsAmount: 28500,
        platformCommissionRate: 5,
        commissionAmount: 1425,
        netPayoutAmount: 27075,
        status: 'Settled',
        transactionReference: 'UTR_HDFC_9918237461',
        settledAt: new Date('2026-11-02'),
        processedBy: admin._id,
        notes: 'Monthly batch settlement verified and cleared'
      });
    }

    console.log('SUCCESS: Phase 3 resident experience data seeded successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Error in seedPhase3Data:', err);
    process.exit(1);
  }
}

seedPhase3Data();
