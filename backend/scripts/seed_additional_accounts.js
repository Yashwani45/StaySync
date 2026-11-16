const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const User = require('../models/User');
const Property = require('../models/Property');
const ServiceProvider = require('../models/ServiceProvider');
const RoommateProfile = require('../models/RoommateProfile');

const additionalAccounts = [
  // 1. Tenants
  {
    type: 'tenant',
    user: {
      name: 'Aman Verma',
      email: 'tenant1@staysync.com',
      password: 'password123',
      phone: '+919811122201',
      role: 'USER',
      currentCity: 'Indore',
      preferredCity: 'Indore',
      isVerified: true,
      profileImage: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'
    },
    profile: {
      age: 21,
      gender: 'Male',
      occupation: 'Engineering Student at SGSITS',
      collegeOrOffice: 'SGSITS College, Indore',
      monthlyBudget: 8500,
      foodPreference: 'Veg',
      sleepSchedule: 'Early Bird',
      cleanliness: 'High',
      noiseTolerance: 'Low',
      smoking: 'No',
      drinking: 'No',
      acPreference: 'Non-AC',
      preferredGender: 'Male',
      selectedServices: ['room', 'tiffin']
    }
  },
  {
    type: 'tenant',
    user: {
      name: 'Riya Sharma',
      email: 'tenant2@staysync.com',
      password: 'password123',
      phone: '+919811122202',
      role: 'USER',
      currentCity: 'Bhopal',
      preferredCity: 'Indore',
      isVerified: true,
      profileImage: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150'
    },
    profile: {
      age: 23,
      gender: 'Female',
      occupation: 'Software Engineer',
      collegeOrOffice: 'Crystal IT Park, Indore',
      monthlyBudget: 13000,
      foodPreference: 'Veg',
      sleepSchedule: 'Flexible',
      cleanliness: 'High',
      noiseTolerance: 'Moderate',
      smoking: 'No',
      drinking: 'No',
      acPreference: 'AC',
      preferredGender: 'Female',
      selectedServices: ['room', 'tiffin', 'cleaning']
    }
  },
  {
    type: 'tenant',
    user: {
      name: 'Kunal Mehra',
      email: 'tenant3@staysync.com',
      password: 'password123',
      phone: '+919811122203',
      role: 'USER',
      currentCity: 'Indore',
      preferredCity: 'Indore',
      isVerified: true,
      profileImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150'
    },
    profile: {
      age: 22,
      gender: 'Male',
      occupation: 'MBA Student',
      collegeOrOffice: 'IIPS DAVV, Indore',
      monthlyBudget: 15000,
      foodPreference: 'Any',
      sleepSchedule: 'Night Owl',
      cleanliness: 'Moderate',
      noiseTolerance: 'High',
      smoking: 'No',
      drinking: 'No',
      acPreference: 'AC',
      preferredGender: 'Male',
      selectedServices: ['room', 'tiffin', 'laundry']
    }
  },

  // 2. Hostel & PG Owners
  {
    type: 'owner',
    user: {
      name: 'Suresh Patidar',
      email: 'owner1@staysync.com',
      password: 'password123',
      phone: '+919822233301',
      role: 'PROPERTY_OWNER',
      currentCity: 'Indore',
      preferredCity: 'Indore',
      isVerified: true,
      profileImage: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150'
    },
    property: {
      title: 'Shree Ram Executive Boys Hostel',
      description: 'Top-rated student and working boys hostel near Bhawarkua coaching hub. Offers nutritious north & central Indian thali, high speed Wi-Fi, backup generator, RO water, and spacious shared rooms.',
      propertyType: 'Hostel',
      hostelCategory: 'Boys Hostel',
      address: '42, Professor Colony, Bhawarkua Main Road',
      city: 'Indore',
      latitude: 22.6954,
      longitude: 75.8692,
      monthlyRent: 5500,
      rentPerPerson: 5500,
      securityDeposit: 5000,
      roomType: '2-Seater Room',
      occupancy: 2,
      totalBeds: 24,
      availableBeds: 6,
      amenities: ['Wifi', 'Geyser', 'Security', 'Laundry', 'Cleaning', 'Power Backup'],
      foodAvailable: true,
      rules: ['No loud music during study hours', 'Smoking strictly prohibited in rooms'],
      photos: ['https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=600'],
      verificationStatus: 'Verified',
      rating: 4.7,
      reviewsCount: 22,
      roomTiers: [
        { roomType: '1-Seater Room', occupancy: 1, rentPerPerson: 7500, totalBeds: 6, availableBeds: 2, isAvailable: true },
        { roomType: '2-Seater Room', occupancy: 2, rentPerPerson: 5500, totalBeds: 12, availableBeds: 3, isAvailable: true },
        { roomType: '3-Seater Room', occupancy: 3, rentPerPerson: 4500, totalBeds: 6, availableBeds: 1, isAvailable: true }
      ]
    }
  },
  {
    type: 'owner',
    user: {
      name: 'Sunita Deshmukh',
      email: 'owner2@staysync.com',
      password: 'password123',
      phone: '+919822233302',
      role: 'PROPERTY_OWNER',
      currentCity: 'Indore',
      preferredCity: 'Indore',
      isVerified: true,
      profileImage: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150'
    },
    property: {
      title: 'Radha Krishna Girls Premium PG',
      description: 'Premier Girls Hostel & PG located in Vijay Nagar. Features 24/7 CCTV surveillance, biometric access, 3-time home-style veg food, high-speed fiber Wi-Fi, geyser, study desks, and daily housekeeping.',
      propertyType: 'Hostel',
      hostelCategory: 'Girls Hostel',
      address: '18, Scheme 54, Near Vijay Nagar Square',
      city: 'Indore',
      latitude: 22.7533,
      longitude: 75.8937,
      monthlyRent: 6800,
      rentPerPerson: 6800,
      securityDeposit: 6000,
      roomType: '2-Seater Room',
      occupancy: 2,
      totalBeds: 20,
      availableBeds: 5,
      amenities: ['Wifi', 'AC', 'Geyser', 'Security', 'Laundry', 'Cleaning'],
      foodAvailable: true,
      rules: ['No entry after 10 PM', 'No smoking / drinking', 'Female residents and female guests only'],
      photos: ['https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=600'],
      verificationStatus: 'Verified',
      rating: 4.9,
      reviewsCount: 31,
      roomTiers: [
        { roomType: '1-Seater Room', occupancy: 1, rentPerPerson: 9000, totalBeds: 4, availableBeds: 1, isAvailable: true },
        { roomType: '2-Seater Room', occupancy: 2, rentPerPerson: 6800, totalBeds: 12, availableBeds: 3, isAvailable: true },
        { roomType: '3-Seater Room', occupancy: 3, rentPerPerson: 5200, totalBeds: 4, availableBeds: 1, isAvailable: true }
      ]
    }
  },
  {
    type: 'owner',
    user: {
      name: 'Vikram Rathore',
      email: 'owner3@staysync.com',
      password: 'password123',
      phone: '+919822233303',
      role: 'PROPERTY_OWNER',
      currentCity: 'Indore',
      preferredCity: 'Indore',
      isVerified: true,
      profileImage: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150'
    },
    property: {
      title: 'Apex Luxury Co-Living & Suites',
      description: 'Modern luxury co-living hostel with air-conditioned studio rooms, dedicated co-working zone, high-speed fiber internet, gym area, and healthy breakfast & dinner buffet included.',
      propertyType: 'Hostel',
      hostelCategory: 'Girls & Boys Hostel',
      address: '77, Industry House Road, Old Palasia',
      city: 'Indore',
      latitude: 22.7244,
      longitude: 75.8811,
      monthlyRent: 8500,
      rentPerPerson: 8500,
      securityDeposit: 8000,
      roomType: '1-Seater Room',
      occupancy: 1,
      totalBeds: 16,
      availableBeds: 4,
      amenities: ['Wifi', 'AC', 'Geyser', 'Security', 'Laundry', 'Cleaning', 'Power Backup'],
      foodAvailable: true,
      rules: ['Quiet hours after 11 PM', 'Guests allowed in lounge only'],
      photos: ['https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=600'],
      verificationStatus: 'Verified',
      rating: 4.8,
      reviewsCount: 19,
      roomTiers: [
        { roomType: '1-Seater Room', occupancy: 1, rentPerPerson: 11000, totalBeds: 8, availableBeds: 2, isAvailable: true },
        { roomType: '2-Seater Room', occupancy: 2, rentPerPerson: 8500, totalBeds: 8, availableBeds: 2, isAvailable: true }
      ]
    }
  },

  // 3. Tiffin Providers
  {
    type: 'provider',
    user: {
      name: 'Maharaja Tiffin Center',
      email: 'tiffin1@staysync.com',
      password: 'password123',
      phone: '+919833344401',
      role: 'PROVIDER',
      providerType: 'Tiffin',
      currentCity: 'Indore',
      preferredCity: 'Indore',
      isVerified: true,
      profileImage: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=150'
    },
    providerDetails: {
      businessName: 'Maharaja Desi Kitchen & Mess',
      category: 'Tiffin',
      description: 'Authentic Malwi and North Indian thali delivery. Pure Desi Ghee rotis, fresh green sabzi, thick daal, and special Sunday feasts.',
      address: 'Bhawarkua Square, Main Road',
      city: 'Indore',
      latitude: 22.6934,
      longitude: 75.8672,
      tiffinDetails: {
        vegPrice: 80,
        monthlyPrice: 2600,
        mealType: 'Pure Veg',
        meals: ['Breakfast', 'Lunch', 'Dinner'],
        breakfast: 'Indori Poha with Sev, Jalebi & Kadak Masala Chai',
        lunch: 'Sev Tamatar, Dal Tadka, 4 Butter Phulkas, Jeera Rice & Salad',
        dinner: 'Aloo Matar Rasedar, Yellow Dal, 4 Tawa Rotis & Steamed Rice',
        sundaySpecial: 'Dal Bafla Laddu with Desi Ghee & Spicy Chutney',
        weeklyMenu: {
          monday: { label: 'Monday', breakfast: 'Indori Poha & Chai', lunch: 'Sev Tamatar, Dal Tadka, 4 Rotis, Rice', dinner: 'Kadhi Pakoda, Aloo Jeera, 4 Rotis, Rice', special: 'Gulab Jamun (1 pc)', highlight: 'Malwi Comfort' },
          tuesday: { label: 'Tuesday', breakfast: 'Upma & Coconut Chutney', lunch: 'Rajma Masala, Aloo Gobi, 4 Rotis, Rice', dinner: 'Chana Dal Fry, Bhindi Masala, 4 Rotis, Rice', special: 'Sweet Boondi', highlight: 'Dhaba Style' },
          wednesday: { label: 'Wednesday', breakfast: 'Idli Sambhar', lunch: 'Matar Paneer, Dal Fry, 4 Rotis, Rice', dinner: 'Lauki Kofta, Arhar Dal, 4 Rotis, Rice', special: 'Moong Halwa', highlight: 'Paneer Treat' },
          thursday: { label: 'Thursday', breakfast: 'Aloo Paratha & Dahi', lunch: 'Chole Masala, 4 Rotis, Jeera Rice', dinner: 'Mix Veg, Moong Dal, 4 Rotis, Rice', special: 'Besan Ladoo', highlight: 'Desi Feast' },
          friday: { label: 'Friday', breakfast: 'Masala Dosa', lunch: 'Shahi Paneer, Dal Makhani, 4 Rotis, Rice', dinner: 'Baingan Bharta, Dal Tadka, 4 Rotis, Rice', special: 'Kaju Katli', highlight: 'Royal Friday' },
          saturday: { label: 'Saturday', breakfast: 'Poori Sabzi & Halwa', lunch: 'Dum Aloo, Palak Dal, 4 Rotis, Rice', dinner: 'Khichdi with Desi Ghee & Papad', special: 'Rasgulla', highlight: 'Weekend Special' },
          sunday: { label: 'Sunday Special', breakfast: 'Chole Bhature & Lassi', lunch: 'Dal Bafla with Desi Ghee, Laddu, Kadhi & Baingan Bharta', dinner: 'Pav Bhaji with Butter Pav / Veg Pulao', special: 'Special Dal Bafla & Kheer', highlight: 'Grand Malwa Feast' }
        }
      }
    }
  },
  {
    type: 'provider',
    user: {
      name: 'Maa Sharda Homely Mess',
      email: 'tiffin2@staysync.com',
      password: 'password123',
      phone: '+919833344402',
      role: 'PROVIDER',
      providerType: 'Tiffin',
      currentCity: 'Indore',
      preferredCity: 'Indore',
      isVerified: true,
      profileImage: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=150'
    },
    providerDetails: {
      businessName: 'Maa Sharda Homestyle Mess',
      category: 'Tiffin',
      description: 'Ghar jaisa swadist aur poshtik khana. Low oil, no soda, 100% hygienic tiffin delivered fresh to your hostel room.',
      address: 'Geeta Bhawan, A.B. Road',
      city: 'Indore',
      latitude: 22.7196,
      longitude: 75.8777,
      tiffinDetails: {
        vegPrice: 85,
        monthlyPrice: 2800,
        mealType: 'Pure Veg',
        meals: ['Breakfast', 'Lunch', 'Dinner'],
        breakfast: 'Methi Thepla / Veg Sandwich with Hot Tea',
        lunch: 'Paneer Shimla Mirch, Arhar Dal, 4 Phulkas, Rice & Curd',
        dinner: 'Dahi Aloo, Toor Dal Tadka, 4 Rotis & Rice',
        sundaySpecial: 'Special Maharaja Thali: Paneer Butter Masala, Pulao & Kheer',
        weeklyMenu: {
          monday: { label: 'Monday', breakfast: 'Poha Sev & Chai', lunch: 'Dal Fry, Aloo Gobhi, 4 Rotis, Rice', dinner: 'Kadhi Chawal, 4 Rotis & Salad', special: 'Gulab Jamun', highlight: 'Light Homestyle' },
          tuesday: { label: 'Tuesday', breakfast: 'Upma & Chutney', lunch: 'Rajma Chawal, 4 Rotis, Curd', dinner: 'Bhindi Fry, Dal, 4 Rotis', special: 'Jalebi', highlight: 'Punjabi Tadka' },
          wednesday: { label: 'Wednesday', breakfast: 'Veg Cutlet & Tea', lunch: 'Kadhai Paneer, Dal, 4 Rotis, Rice', dinner: 'Mix Veg, Dal, 4 Rotis', special: 'Suji Halwa', highlight: 'Paneer Day' },
          thursday: { label: 'Thursday', breakfast: 'Aloo Pyaz Paratha', lunch: 'Amritsari Chole, 4 Rotis, Rice', dinner: 'Shimla Mirch Besan, Dal, 4 Rotis', special: 'Boondi Ladoo', highlight: 'Desi Delight' },
          friday: { label: 'Friday', breakfast: 'Idli Vada Sambhar', lunch: 'Palak Paneer, Dal Tadka, 4 Rotis', dinner: 'Aloo Baingan, Dal, 4 Rotis', special: 'Kaju Sweets', highlight: 'Special Thali' },
          saturday: { label: 'Saturday', breakfast: 'Methi Thepla & Pickle', lunch: 'Dum Aloo, Dal Fry, 4 Rotis, Rice', dinner: 'Moong Khichdi & Curd', special: 'Rasgulla', highlight: 'Comfort Sat' },
          sunday: { label: 'Sunday Special', breakfast: 'Bedmi Poori & Aloo Sabzi', lunch: 'Maharaja Paneer Thali, Veg Biryani & Kesar Kheer', dinner: 'Fried Rice & Manchurian Gravy', special: 'Kheer & Gulab Jamun', highlight: 'Sunday Feast' }
        }
      }
    }
  },
  {
    type: 'provider',
    user: {
      name: 'Swad Express Tiffin Service',
      email: 'tiffin3@staysync.com',
      password: 'password123',
      phone: '+919833344403',
      role: 'PROVIDER',
      providerType: 'Tiffin',
      currentCity: 'Indore',
      preferredCity: 'Indore',
      isVerified: true,
      profileImage: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=150'
    },
    providerDetails: {
      businessName: 'Swad Express Pure Veg Tiffin',
      category: 'Tiffin',
      description: 'Express hot tiffin delivery within 30 minutes in Vijay Nagar & LIG. 3 courses, salad, sweet and hot chapatis in insulated box.',
      address: 'Vijay Nagar Square, Near C21 Mall',
      city: 'Indore',
      latitude: 22.7533,
      longitude: 75.8937,
      tiffinDetails: {
        vegPrice: 95,
        monthlyPrice: 3100,
        mealType: 'Pure Veg',
        meals: ['Breakfast', 'Lunch', 'Dinner'],
        breakfast: 'Stuffed Gobhi/Paneer Paratha & Chilled Dahi',
        lunch: 'Shahi Paneer, Dhaba Dal, 4 Butter Rotis, Jeera Rice & Papad',
        dinner: 'Malai Kofta, Yellow Dal, 4 Rotis & Steamed Rice',
        sundaySpecial: 'Special Chole Kulche / Royal Paneer Thali & Ice Cream',
        weeklyMenu: {
          monday: { label: 'Monday', breakfast: 'Poha Sev & Jalebi', lunch: 'Paneer Butter Masala, Dal, 4 Rotis, Rice', dinner: 'Sev Tamatar, Dal, 4 Rotis', special: 'Gulab Jamun', highlight: 'Power Start' },
          tuesday: { label: 'Tuesday', breakfast: 'South Indian Dosa', lunch: 'Rajma Masala, 4 Rotis, Rice, Raita', dinner: 'Aloo Shimla, Dal, 4 Rotis', special: 'Kheer', highlight: 'Dhaba Style' },
          wednesday: { label: 'Wednesday', breakfast: 'Idli Sambhar', lunch: 'Kadhai Paneer, Dal Makhani, 4 Rotis', dinner: 'Mix Veg, Dal Tadka, 4 Rotis', special: 'Rasmalai', highlight: 'Chef Special' },
          thursday: { label: 'Thursday', breakfast: 'Paneer Paratha', lunch: 'Chole Bhature / Chole Chawal', dinner: 'Kadhi Pakoda, 4 Rotis, Rice', special: 'Halwa', highlight: 'Homestyle' },
          friday: { label: 'Friday', breakfast: 'Veg Club Sandwich', lunch: 'Matar Paneer, Dal Fry, 4 Rotis', dinner: 'Bhindi Masala, Dal, 4 Rotis', special: 'Kaju Katli', highlight: 'Royal Feast' },
          saturday: { label: 'Saturday', breakfast: 'Poori Bhaji', lunch: 'Kashmiri Dum Aloo, 4 Rotis, Pulao', dinner: 'Dal Khichdi with Ghee', special: 'Rasgulla', highlight: 'Weekend Relax' },
          sunday: { label: 'Sunday Special', breakfast: 'Chole Bhature & Lassi', lunch: 'Royal Thali: 2 Sabzi, Dal Makhani, Pulao, Sweets', dinner: 'Pav Bhaji / Veg Fried Rice', special: 'Royal Kheer & Jamun', highlight: 'Grand Sunday' }
        }
      }
    }
  },

  // 4. Housekeeping & Laundry Providers
  {
    type: 'provider',
    user: {
      name: 'Express Laundry & Dry Cleaners',
      email: 'cleaning1@staysync.com',
      password: 'password123',
      phone: '+919844455501',
      role: 'PROVIDER',
      providerType: 'Cleaning',
      currentCity: 'Indore',
      preferredCity: 'Indore',
      isVerified: true,
      profileImage: 'https://images.unsplash.com/photo-1517677208171-0bc6725a3e60?w=150'
    },
    providerDetails: {
      businessName: 'Express Wash Doorstep Laundry',
      category: 'Cleaning',
      description: 'Doorstep pickup and delivery laundry service for college students and working professionals. Wash, dry, steam press and folding in 24 hours.',
      address: 'Bhawarkua, Near Holkar Science College',
      city: 'Indore',
      latitude: 22.6954,
      longitude: 75.8692,
      laundryDetails: {
        pricePerKg: 45,
        ironingPrice: 7,
        pickupAvailable: true,
        turnaroundHours: 24
      },
      cleaningDetails: {
        services: ['Wash & Fold', 'Steam Ironing', 'Dry Clean']
      }
    }
  },
  {
    type: 'provider',
    user: {
      name: 'UrbanClean Deep Cleaners',
      email: 'cleaning2@staysync.com',
      password: 'password123',
      phone: '+919844455502',
      role: 'PROVIDER',
      providerType: 'Cleaning',
      currentCity: 'Indore',
      preferredCity: 'Indore',
      isVerified: true,
      profileImage: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=150'
    },
    providerDetails: {
      businessName: 'UrbanClean Professional Deep Cleaning',
      category: 'Cleaning',
      description: 'Professional room deep cleaning, bathroom scrub, odor removal, and floor sanitization before move-in or weekly maintenance.',
      address: 'New Palasia, Near 56 Dukan',
      city: 'Indore',
      latitude: 22.7244,
      longitude: 75.8811,
      cleaningDetails: {
        services: ['Regular Room Clean', 'Bathroom Scrub', 'Deep Sanitization Move-In Clean']
      },
      laundryDetails: {
        pricePerKg: 50,
        ironingPrice: 8,
        pickupAvailable: true,
        turnaroundHours: 24
      }
    }
  },

  // 5. Additional Administrator
  {
    type: 'admin',
    user: {
      name: 'StaySync Verification Lead',
      email: 'admin1@staysync.com',
      password: 'password123',
      phone: '+919855566601',
      role: 'ADMIN',
      currentCity: 'Indore',
      preferredCity: 'Indore',
      isVerified: true,
      profileImage: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'
    }
  }
];

const seedAdditional = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await connectDB();
    console.log('Connected to MongoDB.');

    for (const item of additionalAccounts) {
      console.log(`Processing ${item.user.email}...`);
      let user = await User.findOne({ email: item.user.email });
      if (!user) {
        user = await User.create(item.user);
        console.log(` Created user ${item.user.name} (${item.user.email})`);
      } else {
        user.password = item.user.password;
        user.role = item.user.role;
        user.name = item.user.name;
        user.isVerified = true;
        await user.save();
        console.log(` Updated existing user ${item.user.email}`);
      }

      if (item.type === 'tenant') {
        const existingProf = await RoommateProfile.findOne({ user: user._id });
        if (!existingProf) {
          await RoommateProfile.create({
            user: user._id,
            ...item.profile
          });
          console.log(` Created profile for ${item.user.name}`);
        }
      } else if (item.type === 'owner' && item.property) {
        const existingProp = await Property.findOne({ owner: user._id, title: item.property.title });
        if (!existingProp) {
          await Property.create({
            owner: user._id,
            ...item.property
          });
          console.log(` Created property "${item.property.title}" for ${item.user.name}`);
        }
      } else if (item.type === 'provider' && item.providerDetails) {
        const existingProv = await ServiceProvider.findOne({ user: user._id });
        if (!existingProv) {
          await ServiceProvider.create({
            user: user._id,
            ...item.providerDetails
          });
          console.log(` Created service provider "${item.providerDetails.businessName}"`);
        }
      }
    }

    console.log('All additional accounts successfully created and seeded!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding additional accounts:', error);
    process.exit(1);
  }
};

seedAdditional();
