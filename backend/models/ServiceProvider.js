const mongoose = require('mongoose');

const ServiceProviderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    businessName: {
      type: String,
      required: [true, 'Please add a business name']
    },
    category: {
      type: String,
      enum: ['Tiffin', 'Laundry', 'Cleaning', 'Maintenance', 'Movers'],
      required: [true, 'Please specify category'],
      index: true
    },
    description: {
      type: String,
      required: [true, 'Please add a description']
    },
    address: {
      type: String,
      required: [true, 'Please add address']
    },
    city: {
      type: String,
      required: [true, 'Please specify the city'],
      index: true
    },
    latitude: {
      type: Number,
      required: true
    },
    longitude: {
      type: Number,
      required: true
    },
    serviceRadius: {
      type: Number,
      default: 5 // in km
    },
    rating: {
      type: Number,
      default: 4.0
    },
    verificationStatus: {
      type: String,
      enum: ['Pending', 'Verified', 'Rejected'],
      default: 'Pending',
      index: true
    },
    isAvailable: {
      type: Boolean,
      default: true,
      index: true
    },
    photos: {
      type: [String],
      default: []
    },
    photoUrl: {
      type: String,
      default: ''
    },
    
    // Category-specific details
    tiffinDetails: {
      isPureVeg: {
        type: Boolean,
        default: true
      },
      vegPrice: Number,
      nonVegPrice: Number,
      monthlyPrice: Number, // base Veg subscription
      meals: {
        type: [String],
        enum: ['Breakfast', 'Lunch', 'Dinner', 'Sunday Special'],
        default: ['Breakfast', 'Lunch', 'Dinner', 'Sunday Special']
      },
      breakfast: {
        type: String,
        default: 'Poha, Jalebi / Idli Sambhar & Hot Masala Chai'
      },
      lunch: {
        type: String,
        default: 'Dal Tadka, Shahi Paneer, 4 Phulkas, Steamed Rice & Fresh Salad'
      },
      dinner: {
        type: String,
        default: 'Mix Veg Curry, Yellow Dal Fry, 4 Butter Rotis, Jeera Rice & Sweet Gulab Jamun'
      },
      sundaySpecial: {
        type: String,
        default: 'Special Royal Thali: Paneer Butter Masala, Chole Bhature, Pulao & Sweet Kheer'
      },
      menu: {
        monday: String,
        tuesday: String,
        wednesday: String,
        thursday: String,
        friday: String,
        saturday: String,
        sunday: String,
        breakfast: String,
        lunch: String,
        dinner: String,
        sundaySpecial: String
      },
      weeklyMenu: {
        monday: { breakfast: String, lunch: String, dinner: String },
        tuesday: { breakfast: String, lunch: String, dinner: String },
        wednesday: { breakfast: String, lunch: String, dinner: String },
        thursday: { breakfast: String, lunch: String, dinner: String },
        friday: { breakfast: String, lunch: String, dinner: String },
        saturday: { breakfast: String, lunch: String, dinner: String },
        sunday: { breakfast: String, lunch: String, dinner: String, special: String }
      }
    },
    
    laundryDetails: {
      pricePerKg: Number,
      ironingPrice: Number,
      pickupAvailable: {
        type: Boolean,
        default: false
      },
      turnaroundHours: {
        type: Number,
        default: 24
      }
    },
    
    cleaningDetails: {
      services: {
        type: [String],
        default: ['Regular Room', 'Bathroom', 'Deep Clean']
      },
      priceMap: {
        type: Map,
        of: Number
      }
    },
    
    maintenanceDetails: {
      subCategory: {
        type: String,
        enum: ['Electrician', 'Plumber', 'AC Repair', 'RO Repair', 'Carpenter', 'Internet/Wi-Fi'],
      },
      calloutFee: Number,
      hourlyRate: Number
    },
    
    moversDetails: {
      baseFee: Number,
      pricePerKm: Number,
      vehicleTypes: {
        type: [String],
        default: ['Mini Truck', 'Pickup', 'Large Container']
      }
    }
  },
  {
    timestamps: true
  }
);

ServiceProviderSchema.index({ city: 1, category: 1 });

module.exports = mongoose.model('ServiceProvider', ServiceProviderSchema);
