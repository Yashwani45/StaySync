const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const connectDB = require('../config/db');

const User = require('../models/User');
const Property = require('../models/Property');
const ServiceProvider = require('../models/ServiceProvider');
const RoommateProfile = require('../models/RoommateProfile');
const Request = require('../models/Request');
const Review = require('../models/Review');
const Expense = require('../models/Expense');
const Notification = require('../models/Notification');
const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const BedReservation = require('../models/BedReservation');
const Payment = require('../models/Payment');
const Report = require('../models/Report');
const AuditLog = require('../models/AuditLog');

async function seedRichDummyData() {
  try {
    console.log('--- Connecting to Database ---');
    await connectDB();
    console.log('--- Connected Successfully ---');

    // 1. Fetch Key Users
    const user = await User.findOne({ email: 'user@staysync.com' });
    const owner = await User.findOne({ email: 'owner@staysync.com' });
    const provider = await User.findOne({ email: 'provider@staysync.com' });
    const admin = await User.findOne({ email: 'admin@staysync.com' });
    const mamta = await User.findOne({ email: 'mamtakushwaha@gmail.com' });
    const tenant1 = await User.findOne({ email: 'tenant1@staysync.com' }) || user;
    const tenant2 = await User.findOne({ email: 'tenant2@staysync.com' }) || user;
    const tenant3 = await User.findOne({ email: 'tenant3@staysync.com' }) || user;

    if (!user || !owner || !provider || !admin) {
      console.error('Core demo users (user, owner, provider, admin) missing! Run base seed first.');
      process.exit(1);
    }

    console.log('Core users verified.');

    // 2. Fetch Key Properties and Services
    const properties = await Property.find({}).limit(10);
    const services = await ServiceProvider.find({}).limit(10);

    const defaultProperty = properties[0];
    const secondProperty = properties[1] || properties[0];
    const defaultService = services[0];
    const secondService = services[1] || services[0];

    // =========================================================================
    // 3. EXPENSES (For user@staysync.com & tenant1)
    // =========================================================================
    console.log('Seeding Expenses...');
    const now = new Date();
    const daysAgo = (days) => new Date(now.getTime() - days * 24 * 60 * 60 * 1000);

    const expenseItems = [
      { user: user._id, type: 'Income', category: 'Other', amount: 25000, description: 'Monthly Internship Stipend & Parent Allowance', date: daysAgo(28) },
      { user: user._id, type: 'Income', category: 'Other', amount: 4500, description: 'Freelance Design Project Payment', date: daysAgo(10) },
      { user: user._id, type: 'Expense', category: 'Rent', amount: 6000, description: 'Double Sharing AC Room Rent - November', date: daysAgo(25) },
      { user: user._id, type: 'Expense', category: 'Food', amount: 3200, description: 'Monthly Lunch & Dinner Tiffin Subscription', date: daysAgo(24) },
      { user: user._id, type: 'Expense', category: 'Internet', amount: 799, description: 'Airtel Xstream Fiber 100 Mbps Plan', date: daysAgo(20) },
      { user: user._id, type: 'Expense', category: 'Laundry', amount: 650, description: 'Weekly Wash & Iron Service (15 Clothes)', date: daysAgo(18) },
      { user: user._id, type: 'Expense', category: 'Electricity', amount: 480, description: 'Sub-meter Electricity Bill Units', date: daysAgo(15) },
      { user: user._id, type: 'Expense', category: 'Food', amount: 850, description: 'Weekend Cafe & Groceries with Roommates', date: daysAgo(12) },
      { user: user._id, type: 'Expense', category: 'Transport', amount: 600, description: 'Monthly Indore iBus Transit Pass', date: daysAgo(9) },
      { user: user._id, type: 'Expense', category: 'Maintenance', amount: 350, description: 'Room Cleaning supplies & Handwash kit', date: daysAgo(7) },
      { user: user._id, type: 'Expense', category: 'Laundry', amount: 400, description: 'Bedsheet & Blanket Dry Cleaning', date: daysAgo(5) },
      { user: user._id, type: 'Expense', category: 'Food', amount: 520, description: 'Late Night Study Snacks & Fruits', date: daysAgo(2) },
      { user: user._id, type: 'Expense', category: 'Other', amount: 900, description: 'College Reference Books & Stationary', date: daysAgo(1) }
    ];

    for (const exp of expenseItems) {
      const exists = await Expense.findOne({ user: exp.user, description: exp.description });
      if (!exists) {
        await Expense.create(exp);
      }
    }
    console.log('Expenses seeded.');

    // =========================================================================
    // 4. CHAT CONVERSATIONS & MESSAGES
    // =========================================================================
    console.log('Seeding Chat Conversations & Messages...');

    const conversationsData = [
      {
        participants: [user._id, owner._id],
        lastMessage: "I have held Bed B in Room 102 for you until Saturday.",
        messages: [
          { sender: user._id, text: "Hello Ramesh ji, I saw your Shivaji Executive Hostel listing on StaySync.", hoursAgo: 48 },
          { sender: owner._id, text: "Namaste Yashwani! Yes, the double sharing AC room is available.", hoursAgo: 46 },
          { sender: user._id, text: "Is high-speed Wi-Fi and power backup included in the ₹6,000 rent?", hoursAgo: 44 },
          { sender: owner._id, text: "Yes, 100 Mbps fiber Wi-Fi, 24/7 solar hot water, and inverter backup are all included.", hoursAgo: 42 },
          { sender: user._id, text: "Can I come by for an in-person visit tomorrow around 5 PM?", hoursAgo: 24 },
          { sender: owner._id, text: "I have held Bed B in Room 102 for you until Saturday.", hoursAgo: 12 }
        ]
      },
      {
        participants: [user._id, provider._id],
        lastMessage: "Sure Yashwani! Your 7-day trial pure-veg tiffin starts tomorrow afternoon.",
        messages: [
          { sender: user._id, text: "Hi Rajesh ji, do you deliver pure vegetarian tiffins near SGSITS college?", hoursAgo: 36 },
          { sender: provider._id, text: "Yes! Lunch reaches by 12:45 PM and dinner by 8:15 PM hot in insulated casseroles.", hoursAgo: 34 },
          { sender: user._id, text: "What is included in the daily menu?", hoursAgo: 30 },
          { sender: provider._id, text: "4 ghee chapatis, seasonal green vegetable, dal fry, basmati rice, salad, and sweet on Sundays.", hoursAgo: 28 },
          { sender: user._id, text: "Sounds delicious! Can I book the 7-day trial plan first?", hoursAgo: 15 },
          { sender: provider._id, text: "Sure Yashwani! Your 7-day trial pure-veg tiffin starts tomorrow afternoon.", hoursAgo: 6 }
        ]
      },
      {
        participants: [user._id, tenant2._id],
        lastMessage: "Awesome! Let's schedule a flat visit this Sunday at 11 AM.",
        messages: [
          { sender: tenant2._id, text: "Hey Yashwani! I saw on StaySync that we have an 88% compatibility match for 2BHK flat sharing in Indore!", hoursAgo: 50 },
          { sender: user._id, text: "Hi Riya! That's great! Our sleep schedules and cleanliness preferences match really closely.", hoursAgo: 45 },
          { sender: tenant2._id, text: "Yes! I also prefer quiet study hours after 10 PM. Are you looking around Vijay Nagar or Palasia?", hoursAgo: 40 },
          { sender: user._id, text: "Vijay Nagar or Geeta Bhawan is ideal for me because of easy transit.", hoursAgo: 30 },
          { sender: tenant2._id, text: "There's a lovely furnished 2BHK flat near Scheme 54 for ₹14k total (₹7k each).", hoursAgo: 18 },
          { sender: user._id, text: "That fits right into my budget! Can we visit it together?", hoursAgo: 10 },
          { sender: tenant2._id, text: "Awesome! Let's schedule a flat visit this Sunday at 11 AM.", hoursAgo: 2 }
        ]
      },
      {
        participants: [owner._id, tenant1._id],
        lastMessage: "Payment received! Welcome to Shivaji Executive Hostel.",
        messages: [
          { sender: tenant1._id, text: "Respected Sir, I submitted a booking request for Room 101 Bed A.", hoursAgo: 72 },
          { sender: owner._id, text: "Hello Aman, I verified your student ID. Request approved.", hoursAgo: 60 },
          { sender: tenant1._id, text: "I have paid the ₹2,000 security token via UPI on the portal.", hoursAgo: 36 },
          { sender: owner._id, text: "Payment received! Welcome to Shivaji Executive Hostel.", hoursAgo: 20 }
        ]
      }
    ];

    for (const cData of conversationsData) {
      let conv = await Conversation.findOne({
        participants: { $all: cData.participants }
      });

      if (!conv) {
        conv = await Conversation.create({
          participants: cData.participants,
          lastMessage: cData.lastMessage
        });
      } else {
        conv.lastMessage = cData.lastMessage;
        await conv.save();
      }

      for (const msg of cData.messages) {
        const msgTime = new Date(now.getTime() - msg.hoursAgo * 60 * 60 * 1000);
        const existingMsg = await Message.findOne({
          conversation: conv._id,
          sender: msg.sender,
          text: msg.text
        });

        if (!existingMsg) {
          await Message.create({
            conversation: conv._id,
            sender: msg.sender,
            text: msg.text,
            readStatus: true,
            createdAt: msgTime,
            updatedAt: msgTime
          });
        }
      }
    }
    console.log('Conversations & Messages seeded.');

    // =========================================================================
    // 5. BED RESERVATIONS
    // =========================================================================
    console.log('Seeding Bed Reservations...');
    const futureDate = new Date(now.getTime() + 180 * 24 * 60 * 60 * 1000); // 6 months in future

    const bedReservationItems = [
      {
        property: defaultProperty._id,
        roomNumber: 'Room 101',
        bedNumber: 'Bed A',
        tenant: user._id,
        checkInDate: daysAgo(20),
        checkOutDate: futureDate,
        status: 'CONFIRMED',
        expiresAt: futureDate
      },
      {
        property: defaultProperty._id,
        roomNumber: 'Room 101',
        bedNumber: 'Bed B',
        tenant: tenant2._id,
        checkInDate: daysAgo(15),
        checkOutDate: futureDate,
        status: 'CONFIRMED',
        expiresAt: futureDate
      },
      {
        property: secondProperty._id,
        roomNumber: 'Room 201',
        bedNumber: 'Bed A',
        tenant: tenant1._id,
        checkInDate: daysAgo(10),
        checkOutDate: futureDate,
        status: 'CONFIRMED',
        expiresAt: futureDate
      },
      {
        property: secondProperty._id,
        roomNumber: 'Room 201',
        bedNumber: 'Bed B',
        tenant: tenant3._id,
        checkInDate: daysAgo(2),
        checkOutDate: futureDate,
        status: 'HELD',
        expiresAt: new Date(now.getTime() + 48 * 60 * 60 * 1000)
      }
    ];

    for (const resItem of bedReservationItems) {
      const exists = await BedReservation.findOne({
        property: resItem.property,
        roomNumber: resItem.roomNumber,
        bedNumber: resItem.bedNumber
      });
      if (!exists) {
        await BedReservation.create(resItem);
      }
    }
    console.log('Bed Reservations seeded.');

    // =========================================================================
    // 6. REVIEWS
    // =========================================================================
    console.log('Seeding Reviews...');
    const reviewItems = [
      {
        author: user._id,
        targetId: defaultProperty._id,
        targetType: 'Property',
        rating: 5,
        comment: 'Outstanding student hostel! Very clean rooms, high speed Wi-Fi, 24/7 security guard, and respectful management.'
      },
      {
        author: tenant1._id,
        targetId: defaultProperty._id,
        targetType: 'Property',
        rating: 4,
        comment: 'Great amenities and peaceful study environment. Close to library and bus stop. Highly recommended!'
      },
      {
        author: tenant2._id,
        targetId: secondProperty._id,
        targetType: 'Property',
        rating: 5,
        comment: 'Spacious balcony, modern interior, and hot water always available. Friendly owner who resolves issues quickly.'
      },
      {
        author: user._id,
        targetId: defaultService._id,
        targetType: 'ServiceProvider',
        rating: 5,
        comment: 'Authentic homestyle food! Low oil, fresh vegetables every day, and delivery is always on time in warm casseroles.'
      },
      {
        author: tenant1._id,
        targetId: defaultService._id,
        targetType: 'ServiceProvider',
        rating: 4,
        comment: 'Very dependable tiffin service. The Sunday sweet treat is a great bonus. Generous portion sizes.'
      },
      {
        author: tenant3._id,
        targetId: secondService._id,
        targetType: 'ServiceProvider',
        rating: 5,
        comment: 'Doorstep laundry was collected and delivered neatly pressed within 24 hours. Excellent service!'
      },
      {
        author: user._id,
        targetId: tenant2._id,
        targetType: 'Roommate',
        rating: 5,
        comment: 'Ideal roommate! Very clean, always quiet during late night study hours, and shared all chores cooperatively.'
      },
      {
        author: tenant2._id,
        targetId: user._id,
        targetType: 'Roommate',
        rating: 5,
        comment: 'Wonderful co-living partner! Respectful of privacy, polite, and great at keeping the common spaces tidy.'
      }
    ];

    for (const rev of reviewItems) {
      const exists = await Review.findOne({
        author: rev.author,
        targetId: rev.targetId
      });
      if (!exists) {
        await Review.create(rev);
      }
    }
    console.log('Reviews seeded.');

    // =========================================================================
    // 7. PAYMENTS & TRANSACTIONS
    // =========================================================================
    console.log('Seeding Payments & Transactions...');
    const dummyReq = await Request.findOne({}) || { _id: new (require('mongoose').Types.ObjectId)() };

    const paymentItems = [
      {
        bookingId: dummyReq._id,
        payer: user._id,
        payee: owner._id,
        amount: 6000,
        currency: 'INR',
        gateway: 'Razorpay',
        gatewayOrderId: 'order_IndoreStay_901',
        gatewayPaymentId: 'pay_SSync_901842',
        status: 'Captured',
        paymentMethod: 'UPI',
        itemType: 'Property',
        itemTitle: defaultProperty.title,
        notes: 'Monthly advance rent payment via Google Pay'
      },
      {
        bookingId: dummyReq._id,
        payer: user._id,
        payee: provider._id,
        amount: 3200,
        currency: 'INR',
        gateway: 'Razorpay',
        gatewayOrderId: 'order_TiffinHub_402',
        gatewayPaymentId: 'pay_SSync_402115',
        status: 'Captured',
        paymentMethod: 'UPI',
        itemType: 'ServiceProvider',
        itemTitle: defaultService.businessName,
        notes: 'Monthly 30-day double meal tiffin plan'
      },
      {
        bookingId: dummyReq._id,
        payer: tenant1._id,
        payee: owner._id,
        amount: 2000,
        currency: 'INR',
        gateway: 'Razorpay',
        gatewayOrderId: 'order_Deposit_703',
        gatewayPaymentId: 'pay_SSync_703891',
        status: 'Captured',
        paymentMethod: 'Net Banking',
        itemType: 'Property',
        itemTitle: secondProperty.title,
        notes: 'Room reservation token & security deposit'
      },
      {
        bookingId: dummyReq._id,
        payer: tenant2._id,
        payee: provider._id,
        amount: 999,
        currency: 'INR',
        gateway: 'Razorpay',
        gatewayOrderId: 'order_Clean_504',
        gatewayPaymentId: 'pay_SSync_504289',
        status: 'Captured',
        paymentMethod: 'UPI',
        itemType: 'ServiceProvider',
        itemTitle: 'UrbanClean Professional Deep Cleaning',
        notes: 'Move-in deep sanitize and scrubbing'
      },
      {
        bookingId: dummyReq._id,
        payer: tenant3._id,
        payee: owner._id,
        amount: 5500,
        currency: 'INR',
        gateway: 'Razorpay',
        gatewayOrderId: 'order_Rent_805',
        gatewayPaymentId: 'pay_SSync_805123',
        status: 'Authorized',
        paymentMethod: 'Credit Card',
        itemType: 'Property',
        itemTitle: 'Silver Springs Student Hostel',
        notes: 'Pending bank clearance for room rent'
      }
    ];

    for (const p of paymentItems) {
      const exists = await Payment.findOne({ gatewayPaymentId: p.gatewayPaymentId });
      if (!exists) {
        await Payment.create(p);
      }
    }
    console.log('Payments seeded.');

    // =========================================================================
    // 8. REPORTS FOR ADMIN MODERATION
    // =========================================================================
    console.log('Seeding Reports for Admin Dashboard...');
    const reportItems = [
      {
        reporter: user._id,
        targetType: 'Property',
        targetId: defaultProperty._id.toString(),
        category: 'Fake Listing',
        description: 'Listing says 4-wheeler parking is available, but the building only has space for two-wheelers on the street.',
        status: 'OPEN',
        evidenceUrl: ''
      },
      {
        reporter: tenant1._id,
        targetType: 'User',
        targetId: tenant3._id.toString(),
        category: 'Suspicious Behavior',
        description: 'Sent multiple repetitive messages late at night asking for personal contact numbers outside the platform.',
        status: 'INVESTIGATING',
        adminNotes: 'Contacted user to warn against communication policy violation.'
      },
      {
        reporter: tenant2._id,
        targetType: 'ServiceProvider',
        targetId: defaultService._id.toString(),
        category: 'Inappropriate Content',
        description: 'The uploaded menu photo has low resolution and incorrect price list from 2023.',
        status: 'RESOLVED',
        adminNotes: 'Provider updated their daily menu card and verified pricing.',
        resolvedBy: admin._id
      },
      {
        reporter: tenant3._id,
        targetType: 'Review',
        targetId: defaultProperty._id.toString(),
        category: 'Scam / Fraud',
        description: 'Spam 1-star review submitted by competitor with false allegations.',
        status: 'DISMISSED',
        adminNotes: 'Review checked against verified stay log; confirmed genuine resident experience.',
        resolvedBy: admin._id
      }
    ];

    for (const rep of reportItems) {
      const exists = await Report.findOne({ reporter: rep.reporter, description: rep.description });
      if (!exists) {
        await Report.create(rep);
      }
    }
    console.log('Reports seeded.');

    // =========================================================================
    // 9. AUDIT LOGS FOR ADMIN DASHBOARD
    // =========================================================================
    console.log('Seeding Audit Logs...');
    const auditItems = [
      {
        actor: admin._id,
        actorName: 'StaySync Administrator',
        action: 'PROPERTY_APPROVED',
        targetType: 'Property',
        targetId: defaultProperty._id.toString(),
        reason: 'Ownership title deed and municipal electricity bill verified successfully.',
        metadata: { propertyTitle: defaultProperty.title, city: defaultProperty.city }
      },
      {
        actor: admin._id,
        actorName: 'StaySync Administrator',
        action: 'PROVIDER_VERIFIED',
        targetType: 'ServiceProvider',
        targetId: defaultService._id.toString(),
        reason: 'FSSAI food hygiene license and kitchen inspection passed with A grade.',
        metadata: { businessName: defaultService.businessName, category: defaultService.category }
      },
      {
        actor: admin._id,
        actorName: 'StaySync Administrator',
        action: 'REPORT_RESOLVED',
        targetType: 'Report',
        targetId: 'REP-2026-004',
        reason: 'Listing owner updated menu and accurate photo gallery.',
        metadata: { resolution: 'Updated credentials' }
      },
      {
        actor: admin._id,
        actorName: 'StaySync Administrator',
        action: 'SYSTEM_CONFIG_UPDATED',
        targetType: 'User',
        targetId: 'SYSTEM',
        reason: 'Updated Razorpay webhook timeout and enabled automated receipt emails.',
        metadata: { configVersion: '2.4.1' }
      },
      {
        actor: admin._id,
        actorName: 'StaySync Administrator',
        action: 'PROPERTY_APPROVED',
        targetType: 'Property',
        targetId: secondProperty._id.toString(),
        reason: 'Physical site verification completed by Indore city operations lead.',
        metadata: { propertyTitle: secondProperty.title }
      }
    ];

    for (const aud of auditItems) {
      const exists = await AuditLog.findOne({ action: aud.action, reason: aud.reason });
      if (!exists) {
        await AuditLog.create(aud);
      }
    }
    console.log('Audit Logs seeded.');

    // =========================================================================
    // 10. BOOKING REQUESTS (Rich Status Variety)
    // =========================================================================
    console.log('Seeding Booking Requests...');
    const requestItems = [
      {
        sender: user._id,
        receiver: owner._id,
        itemType: 'Property',
        itemId: defaultProperty._id,
        status: 'Confirmed',
        message: 'Looking for a double-sharing AC bed for the academic semester starting December.',
        proposedPrice: 6000,
        roomNumber: 'Room 101',
        bedNumber: 'Bed A',
        moveInDate: daysAgo(10),
        durationMonths: 6,
        paymentStatus: 'Paid',
        advanceAmountPaid: 2000
      },
      {
        sender: tenant1._id,
        receiver: owner._id,
        itemType: 'Property',
        itemId: defaultProperty._id,
        status: 'Payment Pending',
        message: 'Requesting Room 102 Bed B. Will complete payment via portal today.',
        proposedPrice: 5500,
        roomNumber: 'Room 102',
        bedNumber: 'Bed B',
        moveInDate: daysAgo(3),
        durationMonths: 12,
        paymentStatus: 'Pending',
        advanceAmountPaid: 0
      },
      {
        sender: tenant2._id,
        receiver: owner._id,
        itemType: 'Property',
        itemId: defaultProperty._id,
        status: 'Pending',
        message: 'Interested in single-seater room if available for quiet preparation.',
        proposedPrice: 7500,
        roomNumber: 'Room 201',
        bedNumber: 'Bed A',
        moveInDate: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000),
        durationMonths: 6,
        paymentStatus: 'Pending',
        advanceAmountPaid: 0
      },
      {
        sender: user._id,
        receiver: provider._id,
        itemType: 'ServiceProvider',
        itemId: defaultService._id,
        status: 'Accepted',
        message: 'Need monthly lunch & dinner tiffin delivery at Vallabh Nagar.',
        proposedPrice: 3200,
        paymentStatus: 'Paid',
        advanceAmountPaid: 3200
      },
      {
        sender: tenant3._id,
        receiver: provider._id,
        itemType: 'ServiceProvider',
        itemId: secondService._id,
        status: 'Completed',
        message: 'Doorstep pickup for 20 clothes laundry with wash, steam iron, and fold.',
        proposedPrice: 650,
        paymentStatus: 'Paid',
        advanceAmountPaid: 650
      }
    ];

    for (const reqItem of requestItems) {
      const exists = await Request.findOne({
        sender: reqItem.sender,
        receiver: reqItem.receiver,
        itemId: reqItem.itemId,
        message: reqItem.message
      });
      if (!exists) {
        await Request.create(reqItem);
      }
    }
    console.log('Booking Requests seeded.');

    // =========================================================================
    // 11. NOTIFICATIONS
    // =========================================================================
    console.log('Seeding Notifications...');
    const notificationItems = [
      {
        user: user._id,
        title: 'Booking Confirmed!',
        message: 'Your stay booking at ' + defaultProperty.title + ' has been confirmed by the owner.',
        type: 'Request',
        readStatus: false
      },
      {
        user: user._id,
        title: 'New High Roommate Match (88%)',
        message: 'Riya Sharma in Indore matches your sleep schedule, food preference, and budget!',
        type: 'Recommendation',
        readStatus: false
      },
      {
        user: owner._id,
        title: 'New Booking Inquiry Received',
        message: 'Aman Verma has requested a bed reservation in Room 102.',
        type: 'Request',
        readStatus: false
      },
      {
        user: provider._id,
        title: 'New Tiffin Order Placed',
        message: 'Yashwani Sharma subscribed to your Monthly Lunch & Dinner Plan.',
        type: 'Request',
        readStatus: false
      },
      {
        user: admin._id,
        title: 'New Property Pending Review',
        message: 'Green Valley Boys Hostel submitted ownership documents for verification badge.',
        type: 'Verification',
        readStatus: false
      }
    ];

    for (const notif of notificationItems) {
      const exists = await Notification.findOne({ user: notif.user, title: notif.title });
      if (!exists) {
        await Notification.create(notif);
      }
    }
    console.log('Notifications seeded.');

    // =========================================================================
    // 12. MORE ROOMMATE PROFILES (Rich Diverse Compatibility)
    // =========================================================================
    console.log('Seeding Diverse Roommate Profiles...');
    const usersWithoutProfiles = await User.find({ role: 'USER' }).lean();

    const diverseProfiles = [
      {
        age: 22,
        gender: 'Female',
        occupation: 'Data Science Intern',
        collegeOrOffice: 'TCS Indore',
        monthlyBudget: 11000,
        foodPreference: 'Veg',
        sleepSchedule: 'Night Owl',
        wakeupTime: '09:00 AM',
        cleanliness: 'High',
        noiseTolerance: 'Moderate',
        smoking: 'No',
        drinking: 'Socially',
        acPreference: 'AC',
        preferredGender: 'Female',
        hobbies: ['Badminton', 'Coding', 'Podcasts'],
        selectedServices: ['room', 'roommate', 'tiffin', 'laundry']
      },
      {
        age: 24,
        gender: 'Male',
        occupation: 'Full Stack Developer',
        collegeOrOffice: 'Crystal IT Park',
        monthlyBudget: 14000,
        foodPreference: 'Non-Veg',
        sleepSchedule: 'Flexible',
        wakeupTime: '08:30 AM',
        cleanliness: 'Moderate',
        noiseTolerance: 'High',
        smoking: 'No',
        drinking: 'No',
        acPreference: 'AC',
        preferredGender: 'Male',
        hobbies: ['Gaming', 'Guitar', 'Gym'],
        selectedServices: ['room', 'roommate', 'cleaning']
      },
      {
        age: 20,
        gender: 'Female',
        occupation: 'Medical Student',
        collegeOrOffice: 'MGM Medical College, Indore',
        monthlyBudget: 9500,
        foodPreference: 'Veg',
        sleepSchedule: 'Early Bird',
        wakeupTime: '06:00 AM',
        cleanliness: 'High',
        noiseTolerance: 'Low',
        smoking: 'No',
        drinking: 'No',
        acPreference: 'Non-AC',
        preferredGender: 'Female',
        hobbies: ['Reading', 'Yoga', 'Cooking'],
        selectedServices: ['room', 'tiffin']
      },
      {
        age: 23,
        gender: 'Male',
        occupation: 'Civil Services Aspirant',
        collegeOrOffice: 'Kautilya Academy, Bhawarkua',
        monthlyBudget: 7500,
        foodPreference: 'Veg',
        sleepSchedule: 'Early Bird',
        wakeupTime: '05:30 AM',
        cleanliness: 'Moderate',
        noiseTolerance: 'Low',
        smoking: 'No',
        drinking: 'No',
        acPreference: 'Non-AC',
        preferredGender: 'Male',
        hobbies: ['Current Affairs', 'Chess', 'Running'],
        selectedServices: ['room', 'tiffin', 'laundry']
      }
    ];

    let profIdx = 0;
    for (const u of usersWithoutProfiles) {
      const existingProfile = await RoommateProfile.findOne({ user: u._id });
      if (!existingProfile && profIdx < diverseProfiles.length) {
        const pData = diverseProfiles[profIdx++];
        await RoommateProfile.create({
          user: u._id,
          ...pData,
          selectedStay: defaultProperty._id
        });
      }
    }
    console.log('Roommate Profiles seeded.');

    console.log('========================================================');
    console.log('SUCCESS: All dummy data populated for full testing!');
    console.log('========================================================');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding rich dummy data:', error);
    process.exit(1);
  }
}

seedRichDummyData();
