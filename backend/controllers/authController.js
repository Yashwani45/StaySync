const User = require('../models/User');
const RoommateProfile = require('../models/RoommateProfile');
const ServiceProvider = require('../models/ServiceProvider');
const Property = require('../models/Property');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');

const googleClient = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID || '736170863949-2nde53svlm4eep3rcv57am7qtaqi2oa9.apps.googleusercontent.com'
);

// Generate Token
const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET || 'staysync_jwt_secret_key_12345', {
    expiresIn: '30d'
  });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res) => {
  const { 
    name, email, password, phone, role, providerType, businessName, 
    address, city, monthlyPrice, pricePerKg, vegPrice,
    breakfast, lunch, dinner, sundaySpecial, meals,
    propertyTitle, propertyType, roomType, monthlyRent, securityDeposit, foodAvailable, amenities,
    // Tenant specific details
    gender, age, occupation, collegeOrOffice, monthlyBudget, foodPreference, acPreference,
    preferredRoomType, roomShare,
    // Cleaning specific details
    bathroomPrice, cleaningPrice, ironingPrice, turnaroundHours, pickupAvailable, cleaningServices
  } = req.body;

  try {
    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({ success: false, message: 'User already exists' });
    }

    const assignedRole = role || 'USER';
    if (assignedRole === 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Administrative accounts cannot be registered via public registration.'
      });
    }
    const assignedProviderType = assignedRole === 'PROVIDER' ? (providerType || 'Tiffin') : '';

    const user = await User.create({
      name,
      email,
      password,
      phone,
      role: assignedRole,
      providerType: assignedProviderType,
      propertyType: req.body.propertyType || req.body.preferredRoomType || '',
      preferredRoomType: req.body.preferredRoomType || req.body.propertyType || '',
      gender: gender || req.body.tenantGender || '',
      roomShare: roomShare || req.body.tenantRoomShare || '',
      monthlyBudget: monthlyBudget ? parseInt(monthlyBudget) : 0,
      foodPreference: foodPreference || req.body.tenantFoodPref || '',
      currentCity: city || 'Indore',
      preferredCity: city || 'Indore'
    });

    if (user) {
      const CITY_COORDS = {
        Indore: [22.7196, 75.8577],
        Bhopal: [23.2599, 77.4126],
        Bangalore: [12.9716, 77.5946],
        Bengaluru: [12.9716, 77.5946],
        Pune: [18.5204, 73.8567],
        Mumbai: [19.0760, 72.8777],
        Delhi: [28.6139, 77.2090],
        Jaipur: [26.9124, 75.7873],
        Hyderabad: [17.3850, 78.4867],
        Kota: [25.2138, 75.8648],
        Ujjain: [23.1765, 75.7885],
        Gwalior: [26.2183, 78.1828],
        Jabalpur: [23.1815, 79.9864],
        Ahmedabad: [23.0225, 72.5714],
        Lucknow: [26.8467, 80.9462],
        Chandigarh: [30.7333, 76.7794]
      };
      const chosenCity = city || 'Indore';
      const cityBase = CITY_COORDS[chosenCity] || CITY_COORDS.Indore;

      // Create linked entity automatically based on role
      if (user.role === 'USER') {
        // 1. Role === 'USER' (Tenant / Roommate)
        await RoommateProfile.create({
          user: user._id,
          name: user.name,
          gender: gender || 'Any',
          age: age || 21,
          occupation: occupation || 'Student',
          collegeOrOffice: collegeOrOffice || 'DAVV / SGSITS / Corporate Park',
          city: chosenCity,
          monthlyBudget: monthlyBudget ? parseInt(monthlyBudget) : 8000,
          roomType: preferredRoomType || 'Single',
          roomShare: roomShare || 'Single',
          foodPreference: foodPreference || 'Veg',
          acPreference: acPreference || 'No Preference',
          selectedServices: ['room']
        });
      } else if (user.role === 'PROVIDER') {
        // 2. Role === 'PROVIDER' (Tiffin or Cleaning Provider)
        const cat = assignedProviderType === 'Cleaning' ? 'Cleaning' : 'Tiffin';
        await ServiceProvider.create({
          user: user._id,
          businessName: businessName || (cat === 'Tiffin' ? `${name}'s Tiffin Services` : `${name}'s Cleaning Services`),
          category: cat,
          description: cat === 'Tiffin' 
            ? 'Fresh, hygienic, home-cooked daily lunch and dinner meals with doorstep delivery.' 
            : 'Professional room deep cleaning, washroom sanitization, and doorstep laundry services.',
          address: address || `Central Hub, ${chosenCity}`,
          city: chosenCity,
          latitude: cityBase[0] + (Math.random() - 0.5) * 0.03,
          longitude: cityBase[1] + (Math.random() - 0.5) * 0.03,
          verificationStatus: 'Verified',
          tiffinDetails: cat === 'Tiffin' ? {
            monthlyPrice: monthlyPrice ? parseInt(monthlyPrice) : 3200,
            vegPrice: vegPrice ? parseInt(vegPrice) : 90,
            meals: Array.isArray(meals) && meals.length > 0 ? meals : ['Breakfast', 'Lunch', 'Dinner', 'Sunday Special'],
            breakfast: breakfast || 'Poha, Jalebi / Idli Sambhar & Hot Masala Chai',
            lunch: lunch || 'Dal Tadka, Shahi Paneer, 4 Phulkas, Rice & Salad',
            dinner: dinner || 'Mix Veg Sabzi, Yellow Dal, 4 Rotis, Jeera Rice & Sweet Bite',
            sundaySpecial: sundaySpecial || 'Special Royal Thali: Paneer Butter Masala, Pulao & Sweet Kheer',
            menu: {
              breakfast: breakfast || 'Poha, Jalebi / Idli Sambhar & Hot Masala Chai',
              lunch: lunch || 'Dal Tadka, Shahi Paneer, 4 Phulkas, Rice & Salad',
              dinner: dinner || 'Mix Veg Sabzi, Yellow Dal, 4 Rotis, Jeera Rice & Sweet Bite',
              sundaySpecial: sundaySpecial || 'Special Royal Thali: Paneer Butter Masala, Pulao & Sweet Kheer',
              monday: lunch || 'Dal Tadka, Paneer Butter Masala, 4 Rotis, Rice',
              tuesday: 'Rajma Masala, Aloo Gobi, 4 Rotis, Jeera Rice',
              wednesday: 'Chole, Mix Veg Sabzi, 4 Rotis, Steamed Rice',
              thursday: 'Kadhi Pakoda, Bhindi Masala, 4 Rotis, Rice',
              friday: 'Dal Makhani, Shahi Paneer, 4 Butter Rotis, Pulao',
              saturday: 'Sev Tamatar, Yellow Dal, 4 Rotis, Rice',
              sunday: sundaySpecial || 'Special Sunday Paneer Thali & Gulab Jamun'
            },
            weeklyMenu: {
              monday: {
                breakfast: 'Poha, Jalebi / Idli Sambhar & Hot Masala Chai',
                lunch: 'Dal Tadka, Shahi Paneer, 4 Phulkas, Steamed Rice & Salad',
                dinner: 'Aloo Gobi, Yellow Dal Fry, 4 Butter Rotis & Jeera Rice'
              },
              tuesday: {
                breakfast: 'Aloo Pyaz Paratha with Fresh Curd & Pickle',
                lunch: 'Kadhi Pakoda, Bhindi Masala, 4 Rotis & Jeera Rice',
                dinner: 'Sev Tamatar, Yellow Dal, 4 Rotis & Steamed Rice'
              },
              wednesday: {
                breakfast: 'Idli Sambhar & Fresh Coconut Chutney',
                lunch: 'Chole Masala, Paneer Bhurji, 4 Phulkas & Jeera Rice',
                dinner: 'Matar Paneer, Dal Fry, 4 Butter Rotis & Gulab Jamun'
              },
              thursday: {
                breakfast: 'Methi Thepla with Fresh Curd & Pickle',
                lunch: 'Dal Makhani, Dum Aloo, 4 Rotis & Steamed Rice',
                dinner: 'Lauki Kofta Curry, Moong Dal Fry, 4 Rotis & Rice'
              },
              friday: {
                breakfast: 'Veg Upma / Bread Roll with Mint Chutney',
                lunch: 'Rajma Masala, Aloo Jeera, 4 Phulkas, Veg Pulao & Salad',
                dinner: 'Baingan Bharta, Chana Dal Fry, 4 Phulkas & Sweet'
              },
              saturday: {
                breakfast: 'Moong Dal Chilla / Puri Sabzi',
                lunch: 'Pav Bhaji / Paneer Do Pyaza, Dal Tadka, 4 Rotis & Rice',
                dinner: 'Mix Veg Curry, Masoor Dal, 4 Rotis & Jeera Rice'
              },
              sunday: {
                breakfast: 'Masala Dosa / Bedmi Puri with Aloo Sabzi',
                lunch: 'Special Royal Thali: Paneer Butter Masala, Chole Bhature, Pulao & Sweet Kheer',
                dinner: 'Light Khichdi / Kadai Paneer, Butter Naan & Sweet Bite',
                special: sundaySpecial || 'Special Royal Thali: Paneer Butter Masala, Pulao & Sweet Kheer'
              }
            }
          } : undefined,
          cleaningDetails: cat === 'Cleaning' ? {
            services: Array.isArray(cleaningServices) && cleaningServices.length > 0 
              ? cleaningServices 
              : ['Regular Room', 'Bathroom', 'Deep Clean', 'Laundry Wash'],
            priceMap: {
              'Regular Room': cleaningPrice ? parseInt(cleaningPrice) : 350,
              'Bathroom': bathroomPrice ? parseInt(bathroomPrice) : 200,
              'Deep Clean': 499
            }
          } : undefined,
          laundryDetails: cat === 'Cleaning' ? {
            pricePerKg: pricePerKg ? parseInt(pricePerKg) : 50,
            ironingPrice: ironingPrice ? parseInt(ironingPrice) : 8,
            pickupAvailable: pickupAvailable !== undefined ? Boolean(pickupAvailable) : true,
            turnaroundHours: turnaroundHours ? parseInt(turnaroundHours) : 24
          } : undefined
        });
      } else if (user.role === 'PROPERTY_OWNER' && (req.body.createInitialProperty || req.body.propertyTitle || req.body.businessName)) {
        const propTitle = propertyTitle || businessName || (
          propertyType === 'PG' ? `${name}'s Premium PG` :
          (propertyType === 'Room' || propertyType === 'Flat') ? `${name}'s Private Room / Flat` :
          `${name}'s Premium Hostel`
        );
        const pType = propertyType && ['Hostel', 'PG', 'Room', 'Flat'].includes(propertyType) ? propertyType : 'Hostel';
        const rent = monthlyRent ? parseInt(monthlyRent) : 6500;
        const deposit = securityDeposit ? parseInt(securityDeposit) : (rent || 6000);
        let rType = roomType || '2-Seater Room';
        if (rType === 'Single') rType = '1-Seater Room';
        if (rType === 'Shared') rType = '2-Seater Room';
        const occ = rType === '1-Seater Room' ? 1 : rType === '3-Seater Room' ? 3 : (rType === '1 RK' || rType === '1 BHK') ? 1 : 2;
        const hCat = req.body.hostelCategory || 'Girls & Boys Hostel';
        const food = foodAvailable !== undefined ? Boolean(foodAvailable) : (pType === 'Hostel' ? true : false);
        const amen = Array.isArray(amenities) && amenities.length > 0 ? amenities : ['Wifi', 'AC', 'Geyser', 'Security', 'Laundry', 'Cleaning'];

        // Build room tiers if provided, or construct from roomTypesOffered
        let finalRoomTiers = Array.isArray(req.body.roomTiers) && req.body.roomTiers.length > 0
          ? req.body.roomTiers
          : [];

        const offeredTypes = Array.isArray(req.body.roomTypesOffered) ? req.body.roomTypesOffered : [];

        if (finalRoomTiers.length === 0) {
          if (pType === 'PG') {
            const pgTypes = offeredTypes.length > 0 ? offeredTypes : ['Single Room (Private)', 'Double Sharing (2 Beds)', 'Triple Sharing (3 Beds)'];
            finalRoomTiers = pgTypes.map(t => {
              const isSingle = t.includes('1') || t.includes('Single');
              const isTriple = t.includes('3') || t.includes('Triple');
              const isFour = t.includes('4');
              const tOcc = isSingle ? 1 : isTriple ? 3 : isFour ? 4 : 2;
              const tRent = isSingle ? Math.round(rent * 1.25 / 100) * 100 : isTriple ? Math.round(rent * 0.85 / 100) * 100 : isFour ? Math.round(rent * 0.75 / 100) * 100 : rent;
              return {
                roomType: t,
                occupancy: tOcc,
                rentPerPerson: tRent,
                totalBeds: tOcc,
                availableBeds: tOcc,
                isAvailable: true
              };
            });
          } else if (offeredTypes.length > 0) {
            finalRoomTiers = offeredTypes.map(t => {
              const isSingle = t.includes('1-Seater') || t.includes('Single');
              const isTriple = t.includes('3-Seater') || t.includes('Triple');
              const isFour = t.includes('4-Seater') || t.includes('Dorm');
              const tOcc = isSingle ? 1 : isTriple ? 3 : isFour ? 4 : 2;
              const tRent = isSingle ? Math.round(rent * 1.3 / 100) * 100 : isTriple ? Math.round(rent * 0.8 / 100) * 100 : rent;
              return {
                roomType: t,
                occupancy: tOcc,
                rentPerPerson: tRent,
                totalBeds: tOcc,
                availableBeds: tOcc,
                isAvailable: true
              };
            });
          }
        }

        // Custom description according to property type
        let desc = '';
        if (pType === 'Hostel') {
          desc = `Spacious and well-maintained ${hCat} offering ${offeredTypes.length > 0 ? offeredTypes.join(', ') : rType} accommodation in ${address || `Prime Area, ${chosenCity}`}. Includes high-speed Wi-Fi, 24x7 security, daily mess meals, and student amenities.`;
        } else if (pType === 'PG') {
          desc = `Comfortable and modern PG accommodation for ${hCat.replace('Hostel', 'residents')} at ${address || `Prime Area, ${chosenCity}`}. Offers ${offeredTypes.length > 0 ? offeredTypes.join(', ') : rType}, food policy: ${req.body.foodPolicy || (food ? 'Meals Included' : 'Self Cooking')}, and all essential facilities.`;
        } else {
          desc = `Independent ${rType} (${req.body.furnishing || 'Semi-Furnished'}) situated at ${address || `Prime Area, ${chosenCity}`}. Ideal for ${req.body.preferredTenants || 'students and working professionals'}. Features peaceful living with essential amenities.`;
        }

        const totalBedsCount = finalRoomTiers.length > 0 
          ? finalRoomTiers.reduce((sum, t) => sum + t.totalBeds, 0)
          : (req.body.totalBeds ? parseInt(req.body.totalBeds) : (pType === 'Hostel' ? 12 : pType === 'PG' ? 6 : 1));
        const availBedsCount = finalRoomTiers.length > 0
          ? finalRoomTiers.reduce((sum, t) => sum + t.availableBeds, 0)
          : Math.max(1, Math.floor(totalBedsCount * 0.5));

        await Property.create({
          owner: user._id,
          title: propTitle,
          description: desc,
          propertyType: pType,
          hostelCategory: hCat,
          address: address || `Prime Area, ${chosenCity}`,
          city: chosenCity,
          latitude: cityBase[0] + (Math.random() - 0.5) * 0.03,
          longitude: cityBase[1] + (Math.random() - 0.5) * 0.03,
          monthlyRent: rent,
          rentPerPerson: rent,
          securityDeposit: deposit,
          roomType: rType,
          roomTypesOffered: offeredTypes.length > 0 ? offeredTypes : (finalRoomTiers.map(t => t.roomType)),
          roomTiers: finalRoomTiers,
          occupancy: occ,
          totalBeds: totalBedsCount,
          availableBeds: availBedsCount,
          amenities: amen,
          foodAvailable: food,
          furnishing: req.body.furnishing || 'Semi-Furnished',
          preferredTenants: req.body.preferredTenants || 'Any',
          maintenanceCharges: req.body.maintenanceCharges ? parseInt(req.body.maintenanceCharges) : 0,
          electricityCharges: req.body.electricityCharges || 'As per meter',
          noticePeriod: req.body.noticePeriod || (pType === 'PG' ? '1 Month' : 'None'),
          gateTiming: req.body.gateTiming || 'No Curfew',
          foodPolicy: req.body.foodPolicy || (food ? '3 Meals Included' : 'No Food'),
          floorNumber: req.body.floorNumber || '1st Floor',
          verificationStatus: 'Verified',
          photos: [
            pType === 'Hostel'
              ? 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=600'
              : pType === 'PG'
              ? 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=600'
              : 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=600'
          ],
          roomTiers: finalRoomTiers.length > 0 ? finalRoomTiers : [
            {
              roomType: '1-Seater Room',
              occupancy: 1,
              rentPerPerson: Math.round(rent * 1.3 / 100) * 100,
              totalBeds: 1,
              availableBeds: 1,
              isAvailable: true
            },
            {
              roomType: '2-Seater Room',
              occupancy: 2,
              rentPerPerson: rent,
              totalBeds: 2,
              availableBeds: 1,
              isAvailable: true
            },
            {
              roomType: '3-Seater Room',
              occupancy: 3,
              rentPerPerson: Math.round(rent * 0.8 / 100) * 100,
              totalBeds: 3,
              availableBeds: 2,
              isAvailable: true
            }
          ]
        });
      }

      res.status(201).json({
        success: true,
        token: generateToken(user._id, user.role),
        user: {
          id: user._id,
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          providerType: user.providerType || assignedProviderType,
          propertyType: user.propertyType || req.body.propertyType || '',
          phone: user.phone,
          currentCity: user.currentCity || chosenCity,
          preferredCity: user.preferredCity || chosenCity
        }
      });
    } else {
      res.status(400).json({ success: false, message: 'Invalid user data' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message, error: error.message });
  }
};

const DEMO_ACCOUNTS = {
  'user@staysync.com': {
    name: 'Yashwani Sharma',
    role: 'USER',
    phone: '+919876543210',
    currentCity: 'Bhopal',
    preferredCity: 'Indore',
    profileImage: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150'
  },
  'owner@staysync.com': {
    name: 'Ramesh Juneja',
    role: 'PROPERTY_OWNER',
    phone: '+919988776655',
    currentCity: 'Indore',
    preferredCity: 'Indore',
    profileImage: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150'
  },
  'tiffin@staysync.com': {
    name: 'Annapurna Tiffin Services',
    role: 'PROVIDER',
    providerType: 'Tiffin',
    phone: '+919826011223',
    currentCity: 'Indore',
    preferredCity: 'Indore',
    profileImage: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=150',
    businessName: 'Annapurna Tiffin Services',
    category: 'Tiffin',
    tiffinDetails: {
      vegPrice: 90,
      monthlyPrice: 3200,
      meals: ['Breakfast', 'Lunch', 'Dinner'],
      breakfast: 'Poha, Jalebi / Idli Sambhar & Hot Masala Chai',
      lunch: 'Dal Tadka, Paneer Butter Masala, 4 Phulkas, Steamed Rice & Salad',
      dinner: 'Mix Veg Curry, Yellow Dal, 4 Rotis, Jeera Rice & Sweet Gulab Jamun',
      sundaySpecial: 'Special Royal Thali: Paneer Butter Masala, Pulao & Sweet Kheer',
      menu: {
        breakfast: 'Poha, Jalebi / Idli Sambhar & Hot Masala Chai',
        lunch: 'Dal Tadka, Paneer Butter Masala, 4 Phulkas, Steamed Rice & Salad',
        dinner: 'Mix Veg Curry, Yellow Dal, 4 Rotis, Jeera Rice & Sweet Gulab Jamun',
        sundaySpecial: 'Special Royal Thali: Paneer Butter Masala, Pulao & Sweet Kheer',
        monday: 'Dal Tadka, Paneer Butter Masala, 4 Rotis, Rice',
        tuesday: 'Rajma Masala, Aloo Gobi, 4 Rotis, Jeera Rice',
        wednesday: 'Chole, Mix Veg Sabzi, 4 Rotis, Steamed Rice',
        thursday: 'Kadhi Pakoda, Bhindi Masala, 4 Rotis, Rice',
        friday: 'Dal Makhani, Shahi Paneer, 4 Butter Rotis, Pulao',
        saturday: 'Sev Tamatar, Yellow Dal, 4 Rotis, Rice',
        sunday: 'Special Sunday Paneer Thali & Gulab Jamun'
      }
    }
  },
  'cleaning@staysync.com': {
    name: 'SmartClean Housekeeping & Laundry',
    role: 'PROVIDER',
    providerType: 'Cleaning',
    phone: '+919826044556',
    currentCity: 'Indore',
    preferredCity: 'Indore',
    profileImage: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=150',
    businessName: 'SmartClean Doorstep Services',
    category: 'Cleaning',
    cleaningDetails: {
      services: ['Regular Room', 'Bathroom', 'Deep Clean']
    },
    laundryDetails: {
      pricePerKg: 50,
      ironingPrice: 8,
      pickupAvailable: true,
      turnaroundHours: 24
    }
  },
  'provider@staysync.com': {
    name: 'Rajesh Tiffin & Meals',
    role: 'PROVIDER',
    providerType: 'Tiffin',
    phone: '+919123456789',
    currentCity: 'Indore',
    preferredCity: 'Indore',
    profileImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150'
  },
  'admin@staysync.com': {
    name: 'StaySync Administrator',
    role: 'ADMIN',
    phone: '+919000011111',
    currentCity: 'Indore',
    preferredCity: 'Indore',
    profileImage: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'
  },
  // Additional Tenants
  'tenant1@staysync.com': {
    name: 'Aman Verma',
    role: 'USER',
    phone: '+919811122201',
    currentCity: 'Indore',
    preferredCity: 'Indore',
    profileImage: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'
  },
  'tenant2@staysync.com': {
    name: 'Riya Sharma',
    role: 'USER',
    phone: '+919811122202',
    currentCity: 'Bhopal',
    preferredCity: 'Indore',
    profileImage: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150'
  },
  'tenant3@staysync.com': {
    name: 'Kunal Mehra',
    role: 'USER',
    phone: '+919811122203',
    currentCity: 'Indore',
    preferredCity: 'Indore',
    profileImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150'
  },
  // Additional Hostel Owners
  'owner1@staysync.com': {
    name: 'Suresh Patidar',
    role: 'PROPERTY_OWNER',
    phone: '+919822233301',
    currentCity: 'Indore',
    preferredCity: 'Indore',
    profileImage: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150'
  },
  'owner2@staysync.com': {
    name: 'Sunita Deshmukh',
    role: 'PROPERTY_OWNER',
    phone: '+919822233302',
    currentCity: 'Indore',
    preferredCity: 'Indore',
    profileImage: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150'
  },
  'owner3@staysync.com': {
    name: 'Vikram Rathore',
    role: 'PROPERTY_OWNER',
    phone: '+919822233303',
    currentCity: 'Indore',
    preferredCity: 'Indore',
    profileImage: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150'
  },
  // Additional Tiffin Providers
  'tiffin1@staysync.com': {
    name: 'Maharaja Tiffin Center',
    role: 'PROVIDER',
    providerType: 'Tiffin',
    phone: '+919833344401',
    currentCity: 'Indore',
    preferredCity: 'Indore',
    profileImage: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=150',
    businessName: 'Maharaja Desi Kitchen & Mess',
    category: 'Tiffin',
    tiffinDetails: {
      vegPrice: 80,
      monthlyPrice: 2600,
      meals: ['Breakfast', 'Lunch', 'Dinner'],
      breakfast: 'Indori Poha with Sev, Jalebi & Kadak Masala Chai',
      lunch: 'Sev Tamatar, Dal Tadka, 4 Butter Phulkas, Jeera Rice & Salad',
      dinner: 'Aloo Matar Rasedar, Yellow Dal, 4 Tawa Rotis & Steamed Rice',
      sundaySpecial: 'Dal Bafla Laddu with Desi Ghee & Spicy Chutney'
    }
  },
  'tiffin2@staysync.com': {
    name: 'Maa Sharda Homely Mess',
    role: 'PROVIDER',
    providerType: 'Tiffin',
    phone: '+919833344402',
    currentCity: 'Indore',
    preferredCity: 'Indore',
    profileImage: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=150',
    businessName: 'Maa Sharda Homestyle Mess',
    category: 'Tiffin',
    tiffinDetails: {
      vegPrice: 85,
      monthlyPrice: 2800,
      meals: ['Breakfast', 'Lunch', 'Dinner'],
      breakfast: 'Methi Thepla / Veg Sandwich with Hot Tea',
      lunch: 'Paneer Shimla Mirch, Arhar Dal, 4 Phulkas, Rice & Curd',
      dinner: 'Dahi Aloo, Toor Dal Tadka, 4 Rotis & Rice',
      sundaySpecial: 'Special Maharaja Thali: Paneer Butter Masala, Pulao & Kheer'
    }
  },
  'tiffin3@staysync.com': {
    name: 'Swad Express Tiffin Service',
    role: 'PROVIDER',
    providerType: 'Tiffin',
    phone: '+919833344403',
    currentCity: 'Indore',
    preferredCity: 'Indore',
    profileImage: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=150',
    businessName: 'Swad Express Pure Veg Tiffin',
    category: 'Tiffin',
    tiffinDetails: {
      vegPrice: 95,
      monthlyPrice: 3100,
      meals: ['Breakfast', 'Lunch', 'Dinner'],
      breakfast: 'Stuffed Gobhi/Paneer Paratha & Chilled Dahi',
      lunch: 'Shahi Paneer, Dhaba Dal, 4 Butter Rotis, Jeera Rice & Papad',
      dinner: 'Malai Kofta, Yellow Dal, 4 Rotis & Steamed Rice',
      sundaySpecial: 'Special Chole Kulche / Royal Paneer Thali & Ice Cream'
    }
  },
  // Additional Laundry & Cleaning Providers
  'cleaning1@staysync.com': {
    name: 'Express Laundry & Dry Cleaners',
    role: 'PROVIDER',
    providerType: 'Cleaning',
    phone: '+919844455501',
    currentCity: 'Indore',
    preferredCity: 'Indore',
    profileImage: 'https://images.unsplash.com/photo-1517677208171-0bc6725a3e60?w=150',
    businessName: 'Express Wash Doorstep Laundry',
    category: 'Cleaning',
    laundryDetails: {
      pricePerKg: 45,
      ironingPrice: 7,
      pickupAvailable: true,
      turnaroundHours: 24
    },
    cleaningDetails: {
      services: ['Wash & Fold', 'Steam Ironing', 'Dry Clean']
    }
  },
  'cleaning2@staysync.com': {
    name: 'UrbanClean Deep Cleaners',
    role: 'PROVIDER',
    providerType: 'Cleaning',
    phone: '+919844455502',
    currentCity: 'Indore',
    preferredCity: 'Indore',
    profileImage: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=150',
    businessName: 'UrbanClean Professional Deep Cleaning',
    category: 'Cleaning',
    cleaningDetails: {
      services: ['Regular Room Clean', 'Bathroom Scrub', 'Deep Sanitization Move-In Clean']
    },
    laundryDetails: {
      pricePerKg: 50,
      ironingPrice: 8,
      pickupAvailable: true,
      turnaroundHours: 24
    }
  },
  // Additional Admin
  'admin1@staysync.com': {
    name: 'StaySync Verification Lead',
    role: 'ADMIN',
    phone: '+919855566601',
    currentCity: 'Indore',
    preferredCity: 'Indore',
    profileImage: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'
  }
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    const cleanEmail = email.trim().toLowerCase();
    let user = await User.findOne({ email: cleanEmail }).select('+password');

    // Auto-provision or repair demo accounts if requested with password123
    if ((!user || !(await user.matchPassword(password))) && password === 'password123' && DEMO_ACCOUNTS[cleanEmail]) {
      const demoData = DEMO_ACCOUNTS[cleanEmail];
      if (!user) {
        user = await User.create({
          name: demoData.name,
          email: cleanEmail,
          password: 'password123',
          phone: demoData.phone,
          role: demoData.role,
          providerType: demoData.providerType || '',
          currentCity: demoData.currentCity,
          preferredCity: demoData.preferredCity,
          isVerified: true,
          profileImage: demoData.profileImage
        });

        if (user.role === 'USER') {
          await RoommateProfile.create({
            user: user._id,
            age: 21,
            gender: 'Female',
            occupation: 'Student at SGSITS Indore',
            collegeOrOffice: 'SGSITS College, Indore',
            monthlyBudget: 12000,
            foodPreference: 'Veg',
            sleepSchedule: 'Flexible',
            cleanliness: 'High',
            noiseTolerance: 'Low',
            smoking: 'No',
            drinking: 'No',
            acPreference: 'AC',
            preferredGender: 'Female',
            selectedServices: ['room', 'roommate', 'tiffin']
          });
        } else if (user.role === 'PROVIDER' && demoData.businessName) {
          await ServiceProvider.create({
            user: user._id,
            businessName: demoData.businessName,
            category: demoData.category || 'Tiffin',
            description: demoData.category === 'Cleaning' 
              ? 'Professional room deep cleaning, sanitization & doorstep laundry.'
              : 'Nutritious, authentic home-style veg lunch and dinner delivery.',
            address: 'Vijay Nagar, Indore',
            city: 'Indore',
            latitude: 22.7196,
            longitude: 75.8577,
            tiffinDetails: demoData.tiffinDetails,
            cleaningDetails: demoData.cleaningDetails,
            laundryDetails: demoData.laundryDetails
          });
        }
      } else {
        user.password = 'password123';
        if (demoData.providerType) user.providerType = demoData.providerType;
        await user.save();

        if (user.role === 'PROVIDER' && demoData.businessName) {
          const existingProv = await ServiceProvider.findOne({ user: user._id });
          if (!existingProv) {
            await ServiceProvider.create({
              user: user._id,
              businessName: demoData.businessName,
              category: demoData.category || 'Tiffin',
              description: demoData.category === 'Cleaning' 
                ? 'Professional room deep cleaning, sanitization & doorstep laundry.'
                : 'Nutritious, authentic home-style veg lunch and dinner delivery.',
              address: 'Vijay Nagar, Indore',
              city: 'Indore',
              latitude: 22.7196,
              longitude: 75.8577,
              tiffinDetails: demoData.tiffinDetails,
              cleaningDetails: demoData.cleaningDetails,
              laundryDetails: demoData.laundryDetails
            });
          }
        }
      }
    }

    if (user && (await user.matchPassword(password))) {
      return res.json({
        success: true,
        token: generateToken(user._id, user.role),
        user: {
          id: user._id,
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          providerType: user.providerType || '',
          propertyType: user.propertyType || user.preferredRoomType || '',
          preferredRoomType: user.preferredRoomType || user.propertyType || '',
          gender: user.gender || '',
          roomShare: user.roomShare || '',
          monthlyBudget: user.monthlyBudget || 0,
          foodPreference: user.foodPreference || '',
          currentCity: user.currentCity || '',
          preferredCity: user.preferredCity || '',
          phone: user.phone,
          profileImage: user.profileImage
        }
      });
    } else {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Get user profile (User details + Roommate details)
// @route   GET /api/auth/profile
// @access  Private
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    let roommateProfile = null;
    if (user.role === 'USER') {
      roommateProfile = await RoommateProfile.findOne({ user: user._id })
        .populate('selectedStay')
        .populate('selectedProviders');
    }

    res.json({
      success: true,
      user: {
        id: user._id,
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        providerType: user.providerType || '',
        propertyType: user.propertyType || user.preferredRoomType || roommateProfile?.roomType || '',
        preferredRoomType: user.preferredRoomType || user.propertyType || roommateProfile?.roomType || '',
        gender: user.gender || roommateProfile?.gender || '',
        roomShare: user.roomShare || roommateProfile?.roomShare || '',
        monthlyBudget: user.monthlyBudget || roommateProfile?.monthlyBudget || 0,
        foodPreference: user.foodPreference || roommateProfile?.foodPreference || '',
        phone: user.phone,
        currentCity: user.currentCity,
        preferredCity: user.preferredCity,
        profileImage: user.profileImage,
        isVerified: user.isVerified,
        businessName: user.businessName || '',
        businessAddress: user.businessAddress || '',
        businessType: user.businessType || '',
        state: user.state || '',
        accountStatus: user.accountStatus || 'Active',
        createdAt: user.createdAt
      },
      roommateProfile
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Update user profile & preferences
// @route   PUT /api/auth/profile
// @access  Private
exports.updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Update user details
    user.name = req.body.name || user.name;
    user.phone = req.body.phone !== undefined ? req.body.phone : user.phone;
    user.currentCity = req.body.currentCity !== undefined ? req.body.currentCity : user.currentCity;
    user.preferredCity = req.body.preferredCity !== undefined ? req.body.preferredCity : user.preferredCity;
    user.profileImage = req.body.profileImage || user.profileImage;
    if (req.body.businessName !== undefined) user.businessName = req.body.businessName;
    if (req.body.businessAddress !== undefined) user.businessAddress = req.body.businessAddress;
    if (req.body.businessType !== undefined) user.businessType = req.body.businessType;
    if (req.body.state !== undefined) user.state = req.body.state;

    // Handle password change if requested
    if (req.body.newPassword) {
      if (req.body.oldPassword) {
        // Need to select password to verify
        const userWithPass = await User.findById(req.user.id).select('+password');
        const isMatch = await userWithPass.matchPassword(req.body.oldPassword);
        if (!isMatch) {
          return res.status(400).json({ success: false, message: 'Current password does not match.' });
        }
      }
      user.password = req.body.newPassword;
    }

    await user.save();

    // Sync business details to ServiceProvider record if present
    try {
      const ServiceProvider = require('../models/ServiceProvider');
      if (req.body.businessName || req.body.businessAddress) {
        await ServiceProvider.updateMany(
          { user: user._id },
          { 
            ...(req.body.businessName ? { businessName: req.body.businessName } : {}),
            ...(req.body.businessAddress ? { address: req.body.businessAddress } : {})
          }
        );
      }
    } catch (e) {
      console.error('Error syncing ServiceProvider info:', e.message);
    }

    let roommateProfile = null;
    // Update roommate preferences if user is a standard USER
    if (user.role === 'USER') {
      roommateProfile = await RoommateProfile.findOne({ user: user._id });
      
      const profileData = {
        age: req.body.age || roommateProfile?.age || 21,
        gender: req.body.gender || roommateProfile?.gender || 'Other',
        occupation: req.body.occupation || roommateProfile?.occupation || 'Not Specified',
        collegeOrOffice: req.body.collegeOrOffice !== undefined ? req.body.collegeOrOffice : roommateProfile?.collegeOrOffice || '',
        monthlyBudget: req.body.monthlyBudget || roommateProfile?.monthlyBudget || 10000,
        foodPreference: req.body.foodPreference || roommateProfile?.foodPreference || 'Any',
        sleepSchedule: req.body.sleepSchedule || roommateProfile?.sleepSchedule || 'Flexible',
        wakeupTime: req.body.wakeupTime || roommateProfile?.wakeupTime || '08:00 AM',
        cleanliness: req.body.cleanliness || roommateProfile?.cleanliness || 'Moderate',
        noiseTolerance: req.body.noiseTolerance || roommateProfile?.noiseTolerance || 'Moderate',
        smoking: req.body.smoking || roommateProfile?.smoking || 'No',
        drinking: req.body.drinking || roommateProfile?.drinking || 'No',
        acPreference: req.body.acPreference || roommateProfile?.acPreference || 'No Preference',
        preferredGender: req.body.preferredGender || roommateProfile?.preferredGender || 'Any',
        hobbies: req.body.hobbies || roommateProfile?.hobbies || [],
        selectedServices: req.body.selectedServices || roommateProfile?.selectedServices || ['room']
      };

      if (req.body.selectedStay !== undefined) {
        profileData.selectedStay = req.body.selectedStay || null;
      }
      if (req.body.selectedProviders !== undefined) {
        profileData.selectedProviders = req.body.selectedProviders || [];
      }

      if (!roommateProfile) {
        roommateProfile = await RoommateProfile.create({ user: user._id, ...profileData });
      } else {
        Object.assign(roommateProfile, profileData);
        await roommateProfile.save();
      }

      await roommateProfile.populate('selectedStay');
      await roommateProfile.populate('selectedProviders');
    }

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        providerType: user.providerType || '',
        phone: user.phone,
        currentCity: user.currentCity,
        preferredCity: user.preferredCity,
        profileImage: user.profileImage,
        isVerified: user.isVerified,
        businessName: user.businessName || '',
        businessAddress: user.businessAddress || '',
        businessType: user.businessType || '',
        state: user.state || '',
        accountStatus: user.accountStatus || 'Active',
        createdAt: user.createdAt
      },
      roommateProfile
    });
  } catch (error) {
    console.error('Error in updateProfile:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Authenticate with Google OAuth ID Token
// @route   POST /api/auth/google
// @access  Public
exports.googleAuth = async (req, res) => {
  const { credential } = req.body;

  try {
    if (!credential) {
      return res.status(400).json({ success: false, message: 'Google credential is required' });
    }

    const clientId = process.env.GOOGLE_CLIENT_ID || '736170863949-2nde53svlm4eep3rcv57am7qtaqi2oa9.apps.googleusercontent.com';
    let payload;

    try {
      const ticket = await googleClient.verifyIdToken({
        idToken: credential,
        audience: clientId
      });
      payload = ticket.getPayload();
    } catch (verifyErr) {
      // Fallback verification via Google's tokeninfo endpoint
      const googleRes = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(credential)}`);
      if (!googleRes.ok) {
        throw new Error('Google token verification failed');
      }
      payload = await googleRes.json();
    }

    if (!payload || !payload.email) {
      return res.status(400).json({ success: false, message: 'Could not retrieve email from Google profile' });
    }

    const { email, name, picture, sub: googleId } = payload;
    const cleanEmail = email.trim().toLowerCase();

    let user = await User.findOne({ email: cleanEmail });

    if (!user) {
      // Create new Resident account automatically for Google user
      user = await User.create({
        name: name || 'Google User',
        email: cleanEmail,
        googleId: googleId,
        authProvider: 'google',
        role: 'USER',
        phone: '',
        profileImage: picture || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
        currentCity: 'Indore',
        preferredCity: 'Indore',
        isVerified: true
      });
    } else {
      // Update Google ID and profile image if not set
      let needsSave = false;
      if (!user.googleId) {
        user.googleId = googleId;
        needsSave = true;
      }
      if (!user.profileImage && picture) {
        user.profileImage = picture;
        needsSave = true;
      }
      if (needsSave) {
        await user.save();
      }
    }

    if (user.accountStatus === 'Suspended') {
      return res.status(403).json({
        success: false,
        message: `Account is suspended: ${user.suspensionReason || 'Violation of platform terms.'}`
      });
    }

    return res.json({
      success: true,
      token: generateToken(user._id, user.role),
      user: {
        id: user._id,
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        providerType: user.providerType || '',
        propertyType: user.propertyType || user.preferredRoomType || '',
        preferredRoomType: user.preferredRoomType || user.propertyType || '',
        gender: user.gender || '',
        roomShare: user.roomShare || '',
        monthlyBudget: user.monthlyBudget || 0,
        foodPreference: user.foodPreference || '',
        currentCity: user.currentCity || '',
        preferredCity: user.preferredCity || '',
        phone: user.phone || '',
        profileImage: user.profileImage || picture
      }
    });
  } catch (error) {
    console.error('Google Auth Error:', error);
    return res.status(401).json({ success: false, message: 'Google authentication failed: ' + error.message });
  }
};
