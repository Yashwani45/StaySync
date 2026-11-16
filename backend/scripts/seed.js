const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const mongoose = require('mongoose');
const connectDB = require('../config/db');
const User = require('../models/User');
const RoommateProfile = require('../models/RoommateProfile');
const Property = require('../models/Property');
const ServiceProvider = require('../models/ServiceProvider');
const Request = require('../models/Request');
const Review = require('../models/Review');
const Expense = require('../models/Expense');
const Notification = require('../models/Notification');
const Conversation = require('../models/Conversation');
const Message = require('../models/Message');

const seedData = async () => {
  try {
    console.log('Seed: Connecting to Database...');
    await connectDB();
    console.log('Seed: Connected to Database successfully');

    // 1. Clear existing collections
    await User.deleteMany();
    await RoommateProfile.deleteMany();
    await Property.deleteMany();
    await ServiceProvider.deleteMany();
    await Request.deleteMany();
    await Review.deleteMany();
    await Expense.deleteMany();
    await Notification.deleteMany();
    await Conversation.deleteMany();
    await Message.deleteMany();

    console.log('Seed: Cleared old data');

    // 2. Create Core Accounts
    const tenantUser = await User.create({
      name: 'Yashwani Sharma',
      email: 'user@staysync.com',
      password: 'password123',
      phone: '+919876543210',
      role: 'USER',
      currentCity: 'Bhopal',
      preferredCity: 'Indore',
      isVerified: true,
      profileImage:
        'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150'
    });

    const ownerUser = await User.create({
      name: 'Ramesh Juneja',
      email: 'owner@staysync.com',
      password: 'password123',
      phone: '+919988776655',
      role: 'PROPERTY_OWNER',
      currentCity: 'Indore',
      preferredCity: 'Indore',
      isVerified: true,
      profileImage:
        'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150'
    });

    const serviceProvider = await User.create({
      name: 'Rajesh Tiffin & Laundry',
      email: 'provider@staysync.com',
      password: 'password123',
      phone: '+919123456789',
      role: 'PROVIDER',
      currentCity: 'Indore',
      isVerified: true,
      profileImage:
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150'
    });

    const adminUser = await User.create({
      name: 'StaySync Administrator',
      email: 'admin@staysync.com',
      password: 'password123',
      phone: '+919000011111',
      role: 'ADMIN',
      currentCity: 'Indore',
      isVerified: true
    });

    // 3. Create Tenant User's Preference Profile
    const tenantProfile = await RoommateProfile.create({
      user: tenantUser._id,
      age: 21,
      gender: 'Female',
      occupation: 'Student at SGSITS Indore',
      collegeOrOffice: 'SGSITS College, Indore',
      monthlyBudget: 12000,
      foodPreference: 'Veg',
      sleepSchedule: 'Flexible',
      wakeupTime: '07:30 AM',
      cleanliness: 'High',
      noiseTolerance: 'Low',
      smoking: 'No',
      drinking: 'No',
      acPreference: 'AC',
      preferredGender: 'Female',
      hobbies: ['Reading', 'Badminton', 'Cooking'],
      selectedServices: ['room', 'roommate', 'tiffin']
    });

    console.log('Seed: Created main user preference profile');

    // 4. Create Potential Roommates
    const roommatesData = [
      {
        name: 'Priya Verma',
        email: 'priya@staysync.com',
        phone: '+918887776661',
        age: 21,
        gender: 'Female',
        occupation: 'Software Intern',
        collegeOrOffice: 'SGSITS College, Indore',
        monthlyBudget: 11000,
        foodPreference: 'Veg',
        sleepSchedule: 'Flexible',
        wakeupTime: '08:00 AM',
        cleanliness: 'High',
        noiseTolerance: 'Low',
        smoking: 'No',
        drinking: 'No',
        acPreference: 'AC',
        hobbies: ['Reading', 'Music'],
        profileImage:
          'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150'
      },
      {
        name: 'Sneha Patel',
        email: 'sneha@staysync.com',
        phone: '+918887776662',
        age: 22,
        gender: 'Female',
        occupation: 'MBA Student',
        collegeOrOffice: 'IIPS DAVV, Indore',
        monthlyBudget: 13000,
        foodPreference: 'Any',
        sleepSchedule: 'Night Owl',
        wakeupTime: '10:00 AM',
        cleanliness: 'Moderate',
        noiseTolerance: 'Moderate',
        smoking: 'No',
        drinking: 'Socially',
        acPreference: 'No Preference',
        hobbies: ['Dancing', 'Travel'],
        profileImage:
          'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150'
      },
      {
        name: 'Rohan Joshi',
        email: 'rohan@staysync.com',
        phone: '+918887776663',
        age: 22,
        gender: 'Male',
        occupation: 'Student',
        collegeOrOffice: 'IIT Indore',
        monthlyBudget: 15000,
        foodPreference: 'Non-Veg',
        sleepSchedule: 'Early Bird',
        wakeupTime: '06:00 AM',
        cleanliness: 'High',
        noiseTolerance: 'Low',
        smoking: 'No',
        drinking: 'No',
        acPreference: 'AC',
        hobbies: ['Gaming', 'Cricket'],
        profileImage:
          'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150'
      },
      {
        name: 'Amit Khurana',
        email: 'amit@staysync.com',
        phone: '+918887776664',
        age: 23,
        gender: 'Male',
        occupation: 'Analyst',
        collegeOrOffice: 'Crystal IT Park, Indore',
        monthlyBudget: 8000,
        foodPreference: 'Any',
        sleepSchedule: 'Night Owl',
        wakeupTime: '09:00 AM',
        cleanliness: 'Low',
        noiseTolerance: 'High',
        smoking: 'Yes',
        drinking: 'Yes',
        acPreference: 'Non-AC',
        hobbies: ['Fitness', 'Movies'],
        profileImage:
          'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150'
      }
    ];

    for (const rm of roommatesData) {
      const u = await User.create({
        name: rm.name,
        email: rm.email,
        password: 'password123',
        phone: rm.phone,
        role: 'USER',
        currentCity: 'Indore',
        preferredCity: 'Indore',
        isVerified: true,
        profileImage: rm.profileImage
      });

      await RoommateProfile.create({
        user: u._id,
        age: rm.age,
        gender: rm.gender,
        occupation: rm.occupation,
        collegeOrOffice: rm.collegeOrOffice,
        monthlyBudget: rm.monthlyBudget,
        foodPreference: rm.foodPreference,
        sleepSchedule: rm.sleepSchedule,
        wakeupTime: rm.wakeupTime,
        cleanliness: rm.cleanliness,
        noiseTolerance: rm.noiseTolerance,
        smoking: rm.smoking,
        drinking: rm.drinking,
        acPreference: rm.acPreference,
        hobbies: rm.hobbies,
        selectedServices: ['room', 'roommate']
      });
    }

    console.log('Seed: Created roommate profiles');

    // 5. Create Properties (Hostels with 1, 2, 3-Seater Rooms & Categories)
    const propertyListings = [
      {
        title: 'Greenfield Premium Girls Hostel',
        description:
          'Premier Girls Hostel located 200m from SGSITS College. Features 24/7 biometric security, 3-course pure veg buffet mess, high-speed fiber Wi-Fi, geyser, study desks, and daily housekeeping.',
        propertyType: 'Hostel',
        hostelCategory: 'Girls Hostel',
        address: '22, Vallabh Nagar, near SGSITS College, A.B. Road',
        city: 'Indore',
        latitude: 22.7244,
        longitude: 75.8711,
        monthlyRent: 6000,
        rentPerPerson: 6000,
        securityDeposit: 6000,
        roomType: '2-Seater Room',
        occupancy: 2,
        totalBeds: 2,
        availableBeds: 1,
        amenities: ['Wifi', 'AC', 'Geyser', 'Security', 'Laundry', 'Cleaning'],
        foodAvailable: true,
        rules: ['No entry after 10 PM', 'No smoking / drinking', 'Female residents and female guests only'],
        photos: ['https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=600'],
        verificationStatus: 'Verified',
        rating: 4.8,
        reviewsCount: 18,
        roomTiers: [
          {
            roomType: '1-Seater Room',
            occupancy: 1,
            rentPerPerson: 8500,
            totalBeds: 1,
            availableBeds: 1,
            isAvailable: true
          },
          {
            roomType: '2-Seater Room',
            occupancy: 2,
            rentPerPerson: 6000,
            totalBeds: 2,
            availableBeds: 1,
            isAvailable: true
          },
          {
            roomType: '3-Seater Room',
            occupancy: 3,
            rentPerPerson: 4800,
            totalBeds: 3,
            availableBeds: 2,
            isAvailable: true
          }
        ]
      },
      {
        title: 'Shivaji Executive Boys Hostel',
        description:
          'Top-rated student and working boys hostel near Bhawarkua coaching hub. Offers nutritious north & central Indian thali, high speed Wi-Fi, backup generator, RO water, and spacious shared rooms.',
        propertyType: 'Hostel',
        hostelCategory: 'Boys Hostel',
        address: '14, Professor Colony, Bhawarkua Main Road',
        city: 'Indore',
        latitude: 22.6934,
        longitude: 75.8672,
        monthlyRent: 5500,
        rentPerPerson: 5500,
        securityDeposit: 5000,
        roomType: '2-Seater Room',
        occupancy: 2,
        totalBeds: 2,
        availableBeds: 1,
        amenities: ['Wifi', 'Geyser', 'Security', 'Laundry', 'Cleaning', 'Power Backup'],
        foodAvailable: true,
        rules: ['No loud music during study hours', 'Smoking strictly prohibited in rooms'],
        photos: ['https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=600'],
        verificationStatus: 'Verified',
        rating: 4.6,
        reviewsCount: 15,
        roomTiers: [
          {
            roomType: '1-Seater Room',
            occupancy: 1,
            rentPerPerson: 7500,
            totalBeds: 1,
            availableBeds: 1,
            isAvailable: true
          },
          {
            roomType: '2-Seater Room',
            occupancy: 2,
            rentPerPerson: 5500,
            totalBeds: 2,
            availableBeds: 1,
            isAvailable: true
          },
          {
            roomType: '3-Seater Room',
            occupancy: 3,
            rentPerPerson: 4200,
            totalBeds: 3,
            availableBeds: 2,
            isAvailable: true
          }
        ]
      },
      {
        title: 'Zolo Crown Co-Ed Residency & Hostel',
        description:
          'Modern co-ed living community with separate female and male residential wings. Fully furnished air-conditioned rooms, gaming lounge, cafeteria with meal plans, gym access, and high-speed Wi-Fi.',
        propertyType: 'Hostel',
        hostelCategory: 'Girls & Boys Hostel',
        address: '702, Scheme 54, Vijay Nagar, near C21 Mall',
        city: 'Indore',
        latitude: 22.7533,
        longitude: 75.8937,
        monthlyRent: 6800,
        rentPerPerson: 6800,
        securityDeposit: 10000,
        roomType: '2-Seater Room',
        occupancy: 2,
        totalBeds: 2,
        availableBeds: 2,
        amenities: ['Wifi', 'AC', 'Geyser', 'Gym', 'Parking', 'Power Backup', 'Security', 'Laundry'],
        foodAvailable: true,
        rules: ['Zero tolerance for harassment', 'Quiet hours from 11 PM to 6 AM'],
        photos: ['https://images.unsplash.com/photo-1598928506311-c55ded91a20c?w=600'],
        verificationStatus: 'Verified',
        rating: 4.9,
        reviewsCount: 31,
        roomTiers: [
          {
            roomType: '1-Seater Room',
            occupancy: 1,
            rentPerPerson: 9500,
            totalBeds: 1,
            availableBeds: 2,
            isAvailable: true
          },
          {
            roomType: '2-Seater Room',
            occupancy: 2,
            rentPerPerson: 6800,
            totalBeds: 2,
            availableBeds: 2,
            isAvailable: true
          },
          {
            roomType: '3-Seater Room',
            occupancy: 3,
            rentPerPerson: 5200,
            totalBeds: 3,
            availableBeds: 3,
            isAvailable: true
          }
        ]
      },
      {
        title: 'Stanza Living Orchid Girls Hostel',
        description:
          'Designer living space for young women. Equipped with high-speed internet, ergonomic study desks, round-the-clock security surveillance, air conditioning, and professional housekeeping.',
        propertyType: 'Hostel',
        hostelCategory: 'Girls Hostel',
        address: '45-B, Geeta Bhawan Square, A.B. Road',
        city: 'Indore',
        latitude: 22.718,
        longitude: 75.882,
        monthlyRent: 7500,
        rentPerPerson: 7500,
        securityDeposit: 12000,
        roomType: '1-Seater Room',
        occupancy: 1,
        totalBeds: 1,
        availableBeds: 1,
        amenities: ['Wifi', 'AC', 'Geyser', 'Gym', 'Security', 'Cleaning', 'Laundry'],
        foodAvailable: true,
        rules: ['No late night loud noise', 'Guests allowed in lobby area only'],
        photos: ['https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=600'],
        verificationStatus: 'Verified',
        rating: 4.7,
        reviewsCount: 22,
        roomTiers: [
          {
            roomType: '1-Seater Room',
            occupancy: 1,
            rentPerPerson: 11000,
            totalBeds: 1,
            availableBeds: 1,
            isAvailable: true
          },
          {
            roomType: '2-Seater Room',
            occupancy: 2,
            rentPerPerson: 7500,
            totalBeds: 2,
            availableBeds: 2,
            isAvailable: true
          },
          {
            roomType: '3-Seater Room',
            occupancy: 3,
            rentPerPerson: 5500,
            totalBeds: 3,
            availableBeds: 3,
            isAvailable: true
          }
        ]
      },
      {
        title: 'Scholars Den Boys Hostel',
        description:
          'Budget-friendly and disciplined hostel for male engineering and medical aspirants. Pure vegetarian mess with 3 daily meals, Wi-Fi, power backup, and quiet library room.',
        propertyType: 'Hostel',
        hostelCategory: 'Boys Hostel',
        address: '88, Anand Bazaar, Old Palasia',
        city: 'Indore',
        latitude: 22.721,
        longitude: 75.889,
        monthlyRent: 4500,
        rentPerPerson: 4500,
        securityDeposit: 4500,
        roomType: '3-Seater Room',
        occupancy: 3,
        totalBeds: 3,
        availableBeds: 1,
        amenities: ['Wifi', 'Geyser', 'Security', 'Cleaning', 'Power Backup'],
        foodAvailable: true,
        rules: ['Quiet hours during study time', 'No tobacco or alcohol'],
        photos: ['https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=600'],
        verificationStatus: 'Verified',
        rating: 4.4,
        reviewsCount: 11,
        roomTiers: [
          {
            roomType: '1-Seater Room',
            occupancy: 1,
            rentPerPerson: 7000,
            totalBeds: 1,
            availableBeds: 1,
            isAvailable: true
          },
          {
            roomType: '2-Seater Room',
            occupancy: 2,
            rentPerPerson: 5400,
            totalBeds: 2,
            availableBeds: 1,
            isAvailable: true
          },
          {
            roomType: '3-Seater Room',
            occupancy: 3,
            rentPerPerson: 4500,
            totalBeds: 3,
            availableBeds: 1,
            isAvailable: true
          }
        ]
      },
      {
        title: 'Silver Springs Co-Ed Student Hostel',
        description:
          'Spacious co-ed hostel facility in Bhopal with dedicated male and female blocks. Includes high-speed Wi-Fi, hygienic mess dining hall, RO water, solar water heaters, and round the clock security.',
        propertyType: 'Hostel',
        hostelCategory: 'Girls & Boys Hostel',
        address: '102, Zone-II, MP Nagar',
        city: 'Bhopal',
        latitude: 23.2332,
        longitude: 77.4343,
        monthlyRent: 5200,
        rentPerPerson: 5200,
        securityDeposit: 5000,
        roomType: '2-Seater Room',
        occupancy: 2,
        totalBeds: 2,
        availableBeds: 2,
        amenities: ['Wifi', 'Geyser', 'Security', 'Cleaning', 'Parking'],
        foodAvailable: true,
        rules: ['Campus closes at 10:30 PM', 'ID card mandatory at gate'],
        photos: ['https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=600'],
        verificationStatus: 'Verified',
        rating: 4.5,
        reviewsCount: 9,
        roomTiers: [
          {
            roomType: '1-Seater Room',
            occupancy: 1,
            rentPerPerson: 7200,
            totalBeds: 1,
            availableBeds: 1,
            isAvailable: true
          },
          {
            roomType: '2-Seater Room',
            occupancy: 2,
            rentPerPerson: 5200,
            totalBeds: 2,
            availableBeds: 2,
            isAvailable: true
          },
          {
            roomType: '3-Seater Room',
            occupancy: 3,
            rentPerPerson: 4000,
            totalBeds: 3,
            availableBeds: 3,
            isAvailable: true
          }
        ]
      },
      {
        title: 'Lake View Executive Boys PG & Rooms',
        description:
          'Comfortable paying guest accommodation for working professionals and male college students in MP Nagar, Bhopal. Includes 3 meals daily, high-speed Wi-Fi, geyser, study tables, and regular housekeeping.',
        propertyType: 'PG',
        hostelCategory: 'Boys Hostel',
        address: 'Plot 34, Zone-I, Maharana Pratap Nagar',
        city: 'Bhopal',
        latitude: 23.235,
        longitude: 77.436,
        monthlyRent: 5500,
        rentPerPerson: 5500,
        securityDeposit: 5000,
        roomType: '2-Seater Room',
        occupancy: 2,
        totalBeds: 2,
        availableBeds: 2,
        amenities: ['Wifi', 'Geyser', 'Security', 'Cleaning', 'Food'],
        foodAvailable: true,
        photos: ['https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=600'],
        verificationStatus: 'Verified',
        rating: 4.6,
        reviewsCount: 14,
        roomTiers: [
          { roomType: '1-Seater Room', occupancy: 1, rentPerPerson: 7500, totalBeds: 1, availableBeds: 1, isAvailable: true },
          { roomType: '2-Seater Room', occupancy: 2, rentPerPerson: 5500, totalBeds: 2, availableBeds: 2, isAvailable: true },
          { roomType: '3-Seater Room', occupancy: 3, rentPerPerson: 4200, totalBeds: 3, availableBeds: 3, isAvailable: true }
        ]
      },
      {
        title: 'Arera Royal Luxury Girls PG',
        description:
          'Safe, premium paying guest accommodation for young women and female students near DB City Mall, Bhopal. High security biometric access, CCTV, organic home-style meals, study desks, and daily housekeeping.',
        propertyType: 'PG',
        hostelCategory: 'Girls Hostel',
        address: 'E-3, Arera Colony, near DB City Mall',
        city: 'Bhopal',
        latitude: 23.228,
        longitude: 77.442,
        monthlyRent: 6000,
        rentPerPerson: 6000,
        securityDeposit: 6000,
        roomType: '2-Seater Room',
        occupancy: 2,
        totalBeds: 2,
        availableBeds: 2,
        amenities: ['Wifi', 'AC', 'Geyser', 'Security', 'Cleaning', 'Food'],
        foodAvailable: true,
        photos: ['https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=600'],
        verificationStatus: 'Verified',
        rating: 4.8,
        reviewsCount: 20,
        roomTiers: [
          { roomType: '1-Seater Room', occupancy: 1, rentPerPerson: 8500, totalBeds: 1, availableBeds: 1, isAvailable: true },
          { roomType: '2-Seater Room', occupancy: 2, rentPerPerson: 6000, totalBeds: 2, availableBeds: 2, isAvailable: true },
          { roomType: '3-Seater Room', occupancy: 3, rentPerPerson: 4800, totalBeds: 3, availableBeds: 3, isAvailable: true }
        ]
      }
    ];

    for (const prop of propertyListings) {
      await Property.create({
        owner: ownerUser._id,
        ...prop
      });
    }

    console.log('Seed: Created properties');

    // 6. Create Service Providers

    await ServiceProvider.create({
      user: serviceProvider._id,
      businessName: 'Annapurna Healthy Tiffin Services',
      category: 'Tiffin',
      description:
        'Hygienic home-cooked vegetarian meals delivered straight to your door. We use minimal oil and organic vegetables. Offers breakfast, lunch, and dinner plans.',
      address: '14, Chappan Dukan Back Alley',
      city: 'Indore',
      latitude: 22.724,
      longitude: 75.878,
      serviceRadius: 5,
      rating: 4.7,
      verificationStatus: 'Verified',
      tiffinDetails: {
        vegPrice: 80,
        nonVegPrice: 0,
        monthlyPrice: 2400,
        meals: ['Breakfast', 'Lunch', 'Dinner'],
        menu: {
          monday: 'Roti, Dal Tadka, Seasonal Veg, Rice, Salad',
          tuesday: 'Roti, Paneer Masala, Jeera Rice, Curd',
          wednesday: 'Roti, Yellow Dal, Aloo Gobi, Rice, Salad',
          thursday: 'Roti, Mix Veg, Dal Fry, Steamed Rice',
          friday: 'Roti, Special Matar Paneer, Pulao, Raita',
          saturday: 'Kadi Chawal, Roti, Seasonal Bhindi fry',
          sunday: 'Roti, Veg Biryani, Mirchi Salan, Sweet Kheer'
        }
      }
    });

    await ServiceProvider.create({
      user: serviceProvider._id,
      businessName: 'QuickWash Express Laundry',
      category: 'Laundry',
      description:
        'Superfast professional dry-cleaners and regular steam-iron washers. Free pickup and drop service inside a 3km radius. Express delivery available.',
      address: '22, Scheme 54, Vijay Nagar',
      city: 'Indore',
      latitude: 22.751,
      longitude: 75.891,
      serviceRadius: 4,
      rating: 4.4,
      verificationStatus: 'Verified',
      laundryDetails: {
        pricePerKg: 60,
        ironingPrice: 8,
        pickupAvailable: true,
        turnaroundHours: 24
      }
    });

    await ServiceProvider.create({
      user: serviceProvider._id,
      businessName: 'ShinyHomes Eco-Cleaning',
      category: 'Cleaning',
      description:
        'Eco-friendly deep cleaning service for student rooms, bathrooms, and complete PG/hostel properties. Fully vaccinated professional staff.',
      address: '89, Tilak Nagar',
      city: 'Indore',
      latitude: 22.716,
      longitude: 75.897,
      serviceRadius: 10,
      rating: 4.6,
      verificationStatus: 'Verified',
      cleaningDetails: {
        services: ['Regular Room', 'Bathroom', 'Deep Clean'],
        priceMap: {
          'Regular Room': 150,
          Bathroom: 100,
          'Deep Clean': 450
        }
      }
    });

    await ServiceProvider.create({
      user: serviceProvider._id,
      businessName: 'FastFix Electric & Plumbing',
      category: 'Maintenance',
      description:
        'Verified emergency repair experts. AC servicing, fan repairs, water pump installation, and Wi-Fi cabling setups.',
      address: 'Square Market, Simrol',
      city: 'Indore',
      latitude: 22.52,
      longitude: 75.918,
      serviceRadius: 12,
      rating: 4.5,
      verificationStatus: 'Verified',
      maintenanceDetails: {
        subCategory: 'Electrician',
        calloutFee: 150,
        hourlyRate: 100
      }
    });

    await ServiceProvider.create({
      user: serviceProvider._id,
      businessName: 'SuperFast Packers & Movers',
      category: 'Movers',
      description:
        'Hassle-free packing and luggage relocation when moving between cities. Free bubble-wraps and carton packaging.',
      address: 'LIG Colony Main Road',
      city: 'Indore',
      latitude: 22.741,
      longitude: 75.885,
      serviceRadius: 50,
      rating: 4.9,
      verificationStatus: 'Verified',
      moversDetails: {
        baseFee: 2500,
        pricePerKm: 10,
        vehicleTypes: ['Mini Truck', 'Pickup']
      }
    });

    console.log('Seed: Created service providers');

    // 7. Notifications
    await Notification.create({
      user: tenantUser._id,
      title: 'Welcome to StaySync! 👋',
      message:
        'Explore compatible rooms, roommates, and customizable tiffin services to plan your relocation.',
      type: 'General'
    });

    await Notification.create({
      user: tenantUser._id,
      title: '95% Roommate Match Found!',
      message:
        'Priya Verma matches your sleep schedule, food preference, and cleanliness. Message her now!',
      type: 'Recommendation'
    });

    // 8. Expenses
    await Expense.create({
      user: tenantUser._id,
      category: 'Rent',
      amount: 7000,
      description: 'Monthly PG rent',
      date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      type: 'Expense'
    });

    await Expense.create({
      user: tenantUser._id,
      category: 'Food',
      amount: 2400,
      description: 'Annapurna tiffin subscription',
      date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      type: 'Expense'
    });

    await Expense.create({
      user: tenantUser._id,
      category: 'Laundry',
      amount: 450,
      description: 'Laundry charges for 7.5kg',
      date: new Date(),
      type: 'Expense'
    });

    console.log('Seed: Created notifications & expenses');

    if (require.main === module) {
      await mongoose.connection.close();
      process.exit(0);
    }
  } catch (error) {
    console.error('Seeding error:', error);
    if (require.main === module) {
      try {
        await mongoose.connection.close();
      } catch (closeError) {}
      process.exit(1);
    }
  }
};

module.exports = seedData;

if (require.main === module) {
  seedData();
}