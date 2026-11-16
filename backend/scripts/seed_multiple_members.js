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

async function seedMultipleMembers() {
  try {
    console.log('Connecting to MongoDB...');
    await connectDB();
    console.log('Connected successfully.');

    const COMMON_PASSWORD = 'password123';
    const now = new Date();
    const daysAgo = (d) => new Date(now.getTime() - d * 24 * 60 * 60 * 1000);
    const futureDate = new Date(now.getTime() + 180 * 24 * 60 * 60 * 1000);

    // =========================================================================
    // 1. CREATE USERS
    // =========================================================================
    console.log('Creating users...');

    const usersToCreate = [
      // --- Residents / Tenants ---
      {
        name: 'Aarav Mehta',
        email: 'aarav.resident@staysync.com',
        phone: '+919826011221',
        role: 'USER',
        currentCity: 'Indore',
        preferredCity: 'Indore',
        gender: 'Male',
        monthlyBudget: 8500,
        foodPreference: 'Veg',
        isVerified: true,
        profileImage: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150'
      },
      {
        name: 'Ananya Sen',
        email: 'ananya.resident@staysync.com',
        phone: '+919826011222',
        role: 'USER',
        currentCity: 'Bhopal',
        preferredCity: 'Indore',
        gender: 'Female',
        monthlyBudget: 14000,
        foodPreference: 'Veg',
        isVerified: true,
        profileImage: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'
      },
      {
        name: 'Rohit Deshmukh',
        email: 'rohit.resident@staysync.com',
        phone: '+919826011223',
        role: 'USER',
        currentCity: 'Indore',
        preferredCity: 'Indore',
        gender: 'Male',
        monthlyBudget: 10500,
        foodPreference: 'Non-Veg',
        isVerified: true,
        profileImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150'
      },
      {
        name: 'Pooja Hegde',
        email: 'pooja.resident@staysync.com',
        phone: '+919826011224',
        role: 'USER',
        currentCity: 'Indore',
        preferredCity: 'Indore',
        gender: 'Female',
        monthlyBudget: 7500,
        foodPreference: 'Veg',
        isVerified: true,
        profileImage: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150'
      },
      {
        name: 'Vikramaditya Rao',
        email: 'vikram.resident@staysync.com',
        phone: '+919826011225',
        role: 'USER',
        currentCity: 'Bhopal',
        preferredCity: 'Bhopal',
        gender: 'Male',
        monthlyBudget: 12000,
        foodPreference: 'Veg',
        isVerified: true,
        profileImage: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150'
      },

      // --- Property Owners ---
      {
        name: 'Harish Chouksey',
        email: 'harish.hostel@staysync.com',
        phone: '+919826022331',
        role: 'HOSTEL_OWNER',
        propertyType: 'Hostel',
        currentCity: 'Indore',
        isVerified: true,
        profileImage: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150'
      },
      {
        name: 'Kavita Singhal',
        email: 'kavita.pg@staysync.com',
        phone: '+919826022332',
        role: 'PG_OWNER',
        propertyType: 'PG',
        currentCity: 'Indore',
        isVerified: true,
        profileImage: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150'
      },
      {
        name: 'Manish Tiwari',
        email: 'manish.flats@staysync.com',
        phone: '+919826022333',
        role: 'ROOM_OWNER',
        propertyType: 'Flat',
        currentCity: 'Bhopal',
        isVerified: true,
        profileImage: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150'
      },

      // --- Service Providers ---
      {
        name: 'Devendra Sharma',
        email: 'devendra.tiffin@staysync.com',
        phone: '+919826033441',
        role: 'TIFFIN_PROVIDER',
        providerType: 'Tiffin',
        currentCity: 'Indore',
        isVerified: true,
        profileImage: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150'
      },
      {
        name: 'Sunil Rathore',
        email: 'sunil.laundry@staysync.com',
        phone: '+919826033442',
        role: 'CLEANING_LAUNDRY_PROVIDER',
        providerType: 'Cleaning',
        currentCity: 'Indore',
        isVerified: true,
        profileImage: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=150'
      },
      {
        name: 'Pooja Verma',
        email: 'pooja.cleaners@staysync.com',
        phone: '+919826033443',
        role: 'CLEANING_LAUNDRY_PROVIDER',
        providerType: 'Cleaning',
        currentCity: 'Indore',
        isVerified: true,
        profileImage: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150'
      },

      // --- Admin / Operations ---
      {
        name: 'Neha Gupta',
        email: 'neha.admin@staysync.com',
        phone: '+919826044551',
        role: 'ADMIN',
        currentCity: 'Indore',
        isVerified: true,
        profileImage: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150'
      }
    ];

    const userMap = {};

    for (const uData of usersToCreate) {
      let existing = await User.findOne({ email: uData.email });
      if (!existing) {
        existing = await User.create({
          ...uData,
          password: COMMON_PASSWORD
        });
        console.log(`Created user: ${existing.email} (${existing.role})`);
      } else {
        // Ensure role & properties are set
        existing.role = uData.role;
        existing.isVerified = true;
        if (uData.propertyType) existing.propertyType = uData.propertyType;
        if (uData.providerType) existing.providerType = uData.providerType;
        existing.password = COMMON_PASSWORD;
        await existing.save();
        console.log(`Updated user: ${existing.email} (${existing.role})`);
      }
      userMap[uData.email] = existing;
    }

    // =========================================================================
    // 2. ROOMMATE PROFILES (For Resident Members)
    // =========================================================================
    console.log('Creating roommate profiles...');

    const profilesData = [
      {
        email: 'aarav.resident@staysync.com',
        profile: {
          age: 21,
          gender: 'Male',
          occupation: 'CS Engineering Student at SGSITS',
          collegeOrOffice: 'SGSITS College, Indore',
          monthlyBudget: 8500,
          foodPreference: 'Veg',
          sleepSchedule: 'Early Bird',
          wakeupTime: '06:30 AM',
          cleanliness: 'High',
          noiseTolerance: 'Low',
          smoking: 'No',
          drinking: 'No',
          acPreference: 'Non-AC',
          preferredGender: 'Male',
          hobbies: ['Chess', 'Coding', 'Badminton'],
          selectedServices: ['room', 'roommate', 'tiffin']
        }
      },
      {
        email: 'ananya.resident@staysync.com',
        profile: {
          age: 23,
          gender: 'Female',
          occupation: 'UI/UX Product Designer',
          collegeOrOffice: 'Crystal IT Park, Indore',
          monthlyBudget: 14000,
          foodPreference: 'Veg',
          sleepSchedule: 'Flexible',
          wakeupTime: '08:30 AM',
          cleanliness: 'High',
          noiseTolerance: 'Moderate',
          smoking: 'No',
          drinking: 'Socially',
          acPreference: 'AC',
          preferredGender: 'Female',
          hobbies: ['Digital Art', 'Coffee Brewing', 'Yoga'],
          selectedServices: ['room', 'roommate', 'tiffin', 'cleaning']
        }
      },
      {
        email: 'rohit.resident@staysync.com',
        profile: {
          age: 24,
          gender: 'Male',
          occupation: 'Resident Medical Intern',
          collegeOrOffice: 'MGM Medical College, Indore',
          monthlyBudget: 10500,
          foodPreference: 'Non-Veg',
          sleepSchedule: 'Night Owl',
          wakeupTime: '09:00 AM',
          cleanliness: 'Moderate',
          noiseTolerance: 'High',
          smoking: 'No',
          drinking: 'Socially',
          acPreference: 'AC',
          preferredGender: 'Male',
          hobbies: ['Gym', 'Music', 'Cricket'],
          selectedServices: ['room', 'tiffin', 'laundry']
        }
      },
      {
        email: 'pooja.resident@staysync.com',
        profile: {
          age: 22,
          gender: 'Female',
          occupation: 'Civil Services UPSC Aspirant',
          collegeOrOffice: 'Kautilya Academy, Bhawarkua',
          monthlyBudget: 7500,
          foodPreference: 'Veg',
          sleepSchedule: 'Early Bird',
          wakeupTime: '05:30 AM',
          cleanliness: 'High',
          noiseTolerance: 'Low',
          smoking: 'No',
          drinking: 'No',
          acPreference: 'Non-AC',
          preferredGender: 'Female',
          hobbies: ['Reading Books', 'Journaling', 'Classical Music'],
          selectedServices: ['room', 'roommate', 'tiffin', 'laundry']
        }
      },
      {
        email: 'vikram.resident@staysync.com',
        profile: {
          age: 25,
          gender: 'Male',
          occupation: 'Senior Financial Analyst',
          collegeOrOffice: 'DB City Corporate Tower, Bhopal',
          monthlyBudget: 12000,
          foodPreference: 'Veg',
          sleepSchedule: 'Early Bird',
          wakeupTime: '07:00 AM',
          cleanliness: 'High',
          noiseTolerance: 'Moderate',
          smoking: 'No',
          drinking: 'No',
          acPreference: 'AC',
          preferredGender: 'Male',
          hobbies: ['Stocks & Crypto', 'Running', 'Cooking'],
          selectedServices: ['room', 'tiffin']
        }
      }
    ];

    for (const p of profilesData) {
      const u = userMap[p.email];
      if (u) {
        let prof = await RoommateProfile.findOne({ user: u._id });
        if (!prof) {
          await RoommateProfile.create({ user: u._id, ...p.profile });
        } else {
          Object.assign(prof, p.profile);
          await prof.save();
        }
      }
    }
    console.log('Roommate profiles updated.');

    // =========================================================================
    // 3. EXPENSES FOR RESIDENT MEMBERS
    // =========================================================================
    console.log('Creating expenses for residents...');

    const aarav = userMap['aarav.resident@staysync.com'];
    const ananya = userMap['ananya.resident@staysync.com'];

    if (aarav) {
      const aaravExpenses = [
        { user: aarav._id, type: 'Income', category: 'Other', amount: 18000, description: 'Monthly Family Allowance & Scholarship', date: daysAgo(25) },
        { user: aarav._id, type: 'Expense', category: 'Rent', amount: 5500, description: 'Boys Hostel Double Sharing Bed - November', date: daysAgo(22) },
        { user: aarav._id, type: 'Expense', category: 'Food', amount: 2600, description: 'Monthly Pure Veg Tiffin Plan', date: daysAgo(20) },
        { user: aarav._id, type: 'Expense', category: 'Internet', amount: 499, description: 'Hostel Shared WiFi Fiber Bill', date: daysAgo(17) },
        { user: aarav._id, type: 'Expense', category: 'Laundry', amount: 450, description: 'Fortnightly Laundry & Ironing (12 Clothes)', date: daysAgo(12) },
        { user: aarav._id, type: 'Expense', category: 'Transport', amount: 350, description: 'iBus Indore City Transit Card Recharge', date: daysAgo(8) },
        { user: aarav._id, type: 'Expense', category: 'Other', amount: 750, description: 'Engineering Lab Manuals & Stationary', date: daysAgo(3) }
      ];
      for (const exp of aaravExpenses) {
        const ex = await Expense.findOne({ user: exp.user, description: exp.description });
        if (!ex) await Expense.create(exp);
      }
    }

    if (ananya) {
      const ananyaExpenses = [
        { user: ananya._id, type: 'Income', category: 'Other', amount: 35000, description: 'Monthly Product Designer Salary', date: daysAgo(28) },
        { user: ananya._id, type: 'Expense', category: 'Rent', amount: 7500, description: 'Furnished 2BHK Flat Share Rent - Scheme 54', date: daysAgo(24) },
        { user: ananya._id, type: 'Expense', category: 'Food', amount: 3200, description: 'Premium Tiffin Plan (Lunch + Dinner)', date: daysAgo(21) },
        { user: ananya._id, type: 'Expense', category: 'Electricity', amount: 650, description: 'Flat AC & Geyser Electricity Sub-meter', date: daysAgo(18) },
        { user: ananya._id, type: 'Expense', category: 'Internet', amount: 899, description: 'High Speed 200 Mbps Fiber WiFi', date: daysAgo(14) },
        { user: ananya._id, type: 'Expense', category: 'Laundry', amount: 700, description: 'Doorstep Wash & Fold Laundry Package', date: daysAgo(9) },
        { user: aarav ? aarav._id : ananya._id, type: 'Expense', category: 'Food', amount: 1200, description: 'Weekend Cafe & Groceries with Friends', date: daysAgo(4) }
      ];
      for (const exp of ananyaExpenses) {
        const ex = await Expense.findOne({ user: exp.user, description: exp.description });
        if (!ex) await Expense.create(exp);
      }
    }
    console.log('Expenses created.');

    // =========================================================================
    // 4. PROPERTIES FOR PROPERTY OWNERS
    // =========================================================================
    console.log('Creating properties for owners...');

    const harish = userMap['harish.hostel@staysync.com'];
    const kavita = userMap['kavita.pg@staysync.com'];
    const manish = userMap['manish.flats@staysync.com'];

    let choukseyHostel = null;
    let singhalPG = null;
    let tiwariFlats = null;

    if (harish) {
      choukseyHostel = await Property.findOne({ owner: harish._id, title: 'Chouksey Grand Executive Boys Hostel' });
      if (!choukseyHostel) {
        choukseyHostel = await Property.create({
          owner: harish._id,
          title: 'Chouksey Grand Executive Boys Hostel',
          description: 'Premium student hostel right next to Bhanwarkua Square. 100 Mbps WiFi, RO drinking water, CCTV security, study tables, and biometric access.',
          propertyType: 'Hostel',
          hostelCategory: 'Boys Hostel',
          address: 'Plot 15, Professor Colony, Near Bhanwarkua Square',
          city: 'Indore',
          latitude: 22.6953,
          longitude: 75.8655,
          monthlyRent: 5800,
          rentPerPerson: 5800,
          securityDeposit: 5000,
          verificationStatus: 'Verified',
          isAvailable: true,
          amenities: ['WiFi', 'Air Conditioning', 'Power Backup', 'Water Purifier', 'CCTV', 'Attached Washroom', 'Daily Cleaning'],
          images: [
            'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800',
            'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?w=800'
          ],
          roomTiers: [
            { roomType: 'Double Sharing (AC)', rentPerPerson: 6500, totalBeds: 8, availableBeds: 3, occupancy: 2 },
            { roomType: 'Double Sharing (Non-AC)', rentPerPerson: 5800, totalBeds: 12, availableBeds: 5, occupancy: 2 }
          ]
        });
        console.log('Created Chouksey Grand Hostel.');
      }
    }

    if (kavita) {
      singhalPG = await Property.findOne({ owner: kavita._id, title: 'Singhal Blossom Girls Luxury PG' });
      if (!singhalPG) {
        singhalPG = await Property.create({
          owner: kavita._id,
          title: 'Singhal Blossom Girls Luxury PG',
          description: 'Safe and peaceful PG for working women and girl students in Scheme 54 Vijay Nagar. 24/7 security guard, biometric gate, and included tiffin option.',
          propertyType: 'PG',
          hostelCategory: 'Girls Hostel',
          address: '42, Scheme 54, Near C21 Mall, Vijay Nagar',
          city: 'Indore',
          latitude: 22.7533,
          longitude: 75.8937,
          monthlyRent: 7200,
          rentPerPerson: 7200,
          securityDeposit: 6000,
          verificationStatus: 'Verified',
          isAvailable: true,
          amenities: ['WiFi', 'Air Conditioning', 'Security Guard', 'Balcony', 'Geyser', 'Washing Machine', 'Daily Housekeeping'],
          images: [
            'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800',
            'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800'
          ],
          roomTiers: [
            { roomType: 'Single Seater (Private AC)', rentPerPerson: 9500, totalBeds: 4, availableBeds: 1, occupancy: 1 },
            { roomType: 'Double Sharing (AC)', rentPerPerson: 7200, totalBeds: 10, availableBeds: 4, occupancy: 2 }
          ]
        });
        console.log('Created Singhal Blossom PG.');
      }
    }

    if (manish) {
      tiwariFlats = await Property.findOne({ owner: manish._id, title: 'Tiwari Heights Furnished 2BHK Flats' });
      if (!tiwariFlats) {
        tiwariFlats = await Property.create({
          owner: manish._id,
          title: 'Tiwari Heights Furnished 2BHK Flats',
          description: 'Spacious semi-furnished and fully-furnished 2BHK flats with modular kitchen, lift, 24-hr water, and reserved two-wheeler parking in prime Arera Colony.',
          propertyType: 'Flat',
          hostelCategory: 'Girls & Boys Hostel',
          address: 'B-12, E-4 Arera Colony, Near Habibganj',
          city: 'Bhopal',
          latitude: 23.2156,
          longitude: 77.4359,
          monthlyRent: 13500,
          rentPerPerson: 6750,
          securityDeposit: 15000,
          verificationStatus: 'Verified',
          isAvailable: true,
          amenities: ['Balcony', 'Modular Kitchen', 'Lift', 'Parking', '24x7 Water Supply', 'Gated Community'],
          images: [
            'https://images.unsplash.com/photo-1502005229762-ae1b460020e2?w=800',
            'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800'
          ]
        });
        console.log('Created Tiwari Heights Flats.');
      }
    }

    // =========================================================================
    // 5. SERVICES FOR SERVICE PROVIDERS
    // =========================================================================
    console.log('Creating services for providers...');

    const devendra = userMap['devendra.tiffin@staysync.com'];
    const sunil = userMap['sunil.laundry@staysync.com'];
    const poojaClean = userMap['pooja.cleaners@staysync.com'];

    let ganeshTiffin = null;
    let speedyLaundry = null;
    let ecoCleanService = null;

    if (devendra) {
      ganeshTiffin = await ServiceProvider.findOne({ user: devendra._id, businessName: 'Shree Ganesh Pure Desi Tiffin Services' });
      if (!ganeshTiffin) {
        ganeshTiffin = await ServiceProvider.create({
          user: devendra._id,
          businessName: 'Shree Ganesh Pure Desi Tiffin Services',
          category: 'Tiffin',
          description: 'Homely, hygienic, pure vegetarian food cooked in pure ghee and mustard oil. Timely doorstep delivery for students and office goers.',
          address: '18, Sarwate Bus Stand Road, Near Railway Station',
          city: 'Indore',
          latitude: 22.7126,
          longitude: 75.8648,
          serviceRadius: 8,
          rating: 4.8,
          verificationStatus: 'Verified',
          isAvailable: true,
          pricePerMeal: 80,
          monthlyPrice: 2600,
          tiffinType: 'Pure Veg',
          cuisineTypes: ['North Indian', 'Indori', 'Gujarati'],
          photos: ['https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=800']
        });
        console.log('Created Ganesh Tiffin.');
      }
    }

    if (sunil) {
      speedyLaundry = await ServiceProvider.findOne({ user: sunil._id, businessName: 'SpeedyWash Doorstep Laundry & Dry Cleaners' });
      if (!speedyLaundry) {
        speedyLaundry = await ServiceProvider.create({
          user: sunil._id,
          businessName: 'SpeedyWash Doorstep Laundry & Dry Cleaners',
          category: 'Laundry',
          description: 'Same-day pickup and 24-hr delivery. Wash, fabric softening, antiseptic rinse, and steam iron fold. Monthly student packages available.',
          address: '5, Bholaram Ustad Marg, Bhawarkua',
          city: 'Indore',
          latitude: 22.6978,
          longitude: 75.8661,
          serviceRadius: 10,
          rating: 4.7,
          verificationStatus: 'Verified',
          isAvailable: true,
          monthlyPrice: 599,
          photos: ['https://images.unsplash.com/photo-1545173168-9f1947eebb7f?w=800']
        });
        console.log('Created SpeedyWash Laundry.');
      }
    }

    if (poojaClean) {
      ecoCleanService = await ServiceProvider.findOne({ user: poojaClean._id, businessName: 'EcoClean Deep Home & Hostel Sanitize' });
      if (!ecoCleanService) {
        ecoCleanService = await ServiceProvider.create({
          user: poojaClean._id,
          businessName: 'EcoClean Deep Home & Hostel Sanitize',
          category: 'Cleaning',
          description: 'Professional room deep cleaning, bathroom de-scaling, kitchen degreasing, and balcony pressure washing with eco-friendly sanitizers.',
          address: '22, Vijay Nagar Square, AB Road',
          city: 'Indore',
          latitude: 22.7533,
          longitude: 75.8937,
          serviceRadius: 12,
          rating: 4.9,
          verificationStatus: 'Verified',
          isAvailable: true,
          monthlyPrice: 899,
          photos: ['https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800']
        });
        console.log('Created EcoClean Service.');
      }
    }

    // =========================================================================
    // 6. BOOKING REQUESTS & BED RESERVATIONS
    // =========================================================================
    console.log('Creating booking requests and bed reservations...');

    if (aarav && choukseyHostel && harish) {
      // 1. Aarav -> Chouksey Hostel (Confirmed)
      const exReq = await Request.findOne({ sender: aarav._id, itemId: choukseyHostel._id });
      if (!exReq) {
        await Request.create({
          sender: aarav._id,
          receiver: harish._id,
          itemType: 'Property',
          itemId: choukseyHostel._id,
          status: 'Confirmed',
          message: 'Booking double sharing AC bed in Room 101 for the upcoming college semester.',
          proposedPrice: 5800,
          roomNumber: 'Room 101',
          bedNumber: 'Bed A',
          moveInDate: daysAgo(15),
          durationMonths: 6,
          paymentStatus: 'Paid',
          advanceAmountPaid: 2000
        });
      }

      const exBed = await BedReservation.findOne({ property: choukseyHostel._id, roomNumber: 'Room 101', bedNumber: 'Bed A' });
      if (!exBed) {
        await BedReservation.create({
          property: choukseyHostel._id,
          roomNumber: 'Room 101',
          bedNumber: 'Bed A',
          tenant: aarav._id,
          checkInDate: daysAgo(15),
          checkOutDate: futureDate,
          status: 'CONFIRMED',
          expiresAt: futureDate
        });
      }
    }

    if (ananya && singhalPG && kavita) {
      // 2. Ananya -> Singhal Blossom PG (Confirmed)
      const exReq = await Request.findOne({ sender: ananya._id, itemId: singhalPG._id });
      if (!exReq) {
        await Request.create({
          sender: ananya._id,
          receiver: kavita._id,
          itemType: 'Property',
          itemId: singhalPG._id,
          status: 'Confirmed',
          message: 'Relocating for IT Park job. Need AC double-sharing bed with quiet environment.',
          proposedPrice: 7200,
          roomNumber: 'Room 201',
          bedNumber: 'Bed B',
          moveInDate: daysAgo(10),
          durationMonths: 12,
          paymentStatus: 'Paid',
          advanceAmountPaid: 2500
        });
      }

      const exBed = await BedReservation.findOne({ property: singhalPG._id, roomNumber: 'Room 201', bedNumber: 'Bed B' });
      if (!exBed) {
        await BedReservation.create({
          property: singhalPG._id,
          roomNumber: 'Room 201',
          bedNumber: 'Bed B',
          tenant: ananya._id,
          checkInDate: daysAgo(10),
          checkOutDate: futureDate,
          status: 'CONFIRMED',
          expiresAt: futureDate
        });
      }
    }

    if (aarav && ganeshTiffin && devendra) {
      // 3. Aarav -> Ganesh Tiffin (Accepted)
      const exReq = await Request.findOne({ sender: aarav._id, itemId: ganeshTiffin._id });
      if (!exReq) {
        await Request.create({
          sender: aarav._id,
          receiver: devendra._id,
          itemType: 'ServiceProvider',
          itemId: ganeshTiffin._id,
          status: 'Accepted',
          message: 'Subscribed to 30-day double meal plan (lunch + dinner) delivered at Chouksey Hostel.',
          proposedPrice: 2600,
          paymentStatus: 'Paid',
          advanceAmountPaid: 2600
        });
      }
    }

    if (ananya && speedyLaundry && sunil) {
      // 4. Ananya -> SpeedyWash Laundry (Completed)
      const exReq = await Request.findOne({ sender: ananya._id, itemId: speedyLaundry._id });
      if (!exReq) {
        await Request.create({
          sender: ananya._id,
          receiver: sunil._id,
          itemType: 'ServiceProvider',
          itemId: speedyLaundry._id,
          status: 'Completed',
          message: 'Doorstep pickup of 15 garments wash and steam press.',
          proposedPrice: 599,
          paymentStatus: 'Paid',
          advanceAmountPaid: 599
        });
      }
    }

    // =========================================================================
    // 7. LIVE CONVERSATIONS FOR NEW MEMBERS
    // =========================================================================
    console.log('Creating conversations & messages for members...');

    if (aarav && harish) {
      let conv = await Conversation.findOne({ participants: { $all: [aarav._id, harish._id] } });
      if (!conv) {
        conv = await Conversation.create({
          participants: [aarav._id, harish._id],
          lastMessage: 'Your bed is all set Aarav, keys are with the warden!'
        });
        await Message.create({
          conversation: conv._id,
          sender: aarav._id,
          text: 'Namaste Harish ji, I have completed the ₹2,000 token payment on StaySync for Room 101 Bed A.',
          readStatus: true
        });
        await Message.create({
          conversation: conv._id,
          sender: harish._id,
          text: 'Received Aarav! Your bed is all set, keys are with the warden. Welcome to Chouksey Hostel!',
          readStatus: true
        });
      }
    }

    if (ananya && kavita) {
      let conv = await Conversation.findOne({ participants: { $all: [ananya._id, kavita._id] } });
      if (!conv) {
        conv = await Conversation.create({
          participants: [ananya._id, kavita._id],
          lastMessage: 'Yes, biometric entry is active 24/7 for all residents.'
        });
        await Message.create({
          conversation: conv._id,
          sender: ananya._id,
          text: 'Hello Kavita ji! Does Room 201 have an attached washroom and a dedicated study desk?',
          readStatus: true
        });
        await Message.create({
          conversation: conv._id,
          sender: kavita._id,
          text: 'Hello Ananya! Yes, it has a modern attached washroom with solar hot water and an ergonomic study chair and desk.',
          readStatus: true
        });
        await Message.create({
          conversation: conv._id,
          sender: ananya._id,
          text: 'That sounds perfect. How does security work for late shifts?',
          readStatus: true
        });
        await Message.create({
          conversation: conv._id,
          sender: kavita._id,
          text: 'Yes, biometric entry is active 24/7 for all residents.',
          readStatus: true
        });
      }
    }

    if (aarav && devendra) {
      let conv = await Conversation.findOne({ participants: { $all: [aarav._id, devendra._id] } });
      if (!conv) {
        conv = await Conversation.create({
          participants: [aarav._id, devendra._id],
          lastMessage: 'Done! Lunch will reach Room 101 by 12:45 PM sharp.'
        });
        await Message.create({
          conversation: conv._id,
          sender: aarav._id,
          text: 'Bhaiya, please note my delivery address: Room 101, Chouksey Hostel, Professor Colony.',
          readStatus: true
        });
        await Message.create({
          conversation: conv._id,
          sender: devendra._id,
          text: 'Done! Lunch will reach Room 101 by 12:45 PM sharp.',
          readStatus: true
        });
      }
    }

    // =========================================================================
    // 8. NOTIFICATIONS FOR NEW MEMBERS
    // =========================================================================
    console.log('Creating notifications for members...');

    const memberNotifs = [
      {
        user: aarav ? aarav._id : null,
        title: 'Bed Confirmed at Chouksey Hostel!',
        message: 'Your reservation for Room 101, Bed A has been confirmed by Harish Chouksey.',
        type: 'Request'
      },
      {
        user: ananya ? ananya._id : null,
        title: 'Welcome to Singhal Blossom PG!',
        message: 'Your stay booking for Room 201 Bed B is confirmed. Download your receipt from My Requests.',
        type: 'Request'
      },
      {
        user: harish ? harish._id : null,
        title: 'New Booking Confirmed (Room 101)',
        message: 'Aarav Mehta has paid the advance token for Bed A.',
        type: 'Request'
      },
      {
        user: devendra ? devendra._id : null,
        title: 'New Monthly Tiffin Order',
        message: 'Aarav Mehta subscribed to your Pure Veg 30-day double meal plan.',
        type: 'Request'
      },
      {
        user: userMap['neha.admin@staysync.com'] ? userMap['neha.admin@staysync.com']._id : null,
        title: 'Platform Audit Notice',
        message: 'Quarterly provider and property hygiene verification audit is scheduled for Indore zone.',
        type: 'Verification'
      }
    ];

    for (const notif of memberNotifs) {
      if (notif.user) {
        const exNotif = await Notification.findOne({ user: notif.user, title: notif.title });
        if (!exNotif) {
          await Notification.create({ ...notif, readStatus: false });
        }
      }
    }

    console.log('========================================================');
    console.log('SUCCESS: All 12 members and their complete test data created!');
    console.log('========================================================');
    process.exit(0);
  } catch (err) {
    console.error('Error seeding multiple members:', err);
    process.exit(1);
  }
}

seedMultipleMembers();
