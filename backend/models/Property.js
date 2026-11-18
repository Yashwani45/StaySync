const mongoose = require('mongoose');

const PropertySchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    title: {
      type: String,
      required: [true, 'Please add a property title']
    },
    description: {
      type: String,
      required: [true, 'Please add a description']
    },
    propertyType: {
      type: String,
      enum: ['Room', 'Flat', 'PG', 'Hostel'],
      default: 'Hostel'
    },
    hostelCategory: {
      type: String,
      enum: ['Girls Hostel', 'Boys Hostel', 'Girls & Boys Hostel'],
      default: 'Girls & Boys Hostel',
      index: true
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
    location: {
      address: {
        type: String,
        default: ''
      },
      city: {
        type: String,
        default: ''
      },
      locality: {
        type: String,
        default: ''
      },
      area: {
        type: String,
        default: ''
      },
      landmark: {
        type: String,
        default: ''
      },
      state: {
        type: String,
        default: 'Madhya Pradesh'
      },
      pincode: {
        type: String,
        default: ''
      },
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point'
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        default: undefined
      },
      formattedAddress: {
        type: String,
        default: ''
      },
      visibility: {
        type: String,
        enum: ['public', 'approximate', 'approved', 'booked'],
        default: 'public'
      },
      verified: {
        type: Boolean,
        default: false
      },
      lastUpdatedAt: {
        type: Date,
        default: Date.now
      }
    },
    monthlyRent: {
      type: Number,
      required: [true, 'Please specify monthly rent'],
      index: true
    },
    rentPerPerson: {
      type: Number,
      default: function() {
        return this.monthlyRent;
      }
    },
    securityDeposit: {
      type: Number,
      required: [true, 'Please specify security deposit']
    },
    roomType: {
      type: String,
      default: '2-Seater Room',
      index: true
    },
    occupancy: {
      type: Number,
      default: 2
    },
    totalBeds: {
      type: Number,
      default: 2
    },
    availableBeds: {
      type: Number,
      default: 1
    },
    roomTypesOffered: {
      type: [String],
      default: []
    },
    roomTiers: [
      {
        roomType: {
          type: String,
          required: true
        },
        occupancy: {
          type: Number,
          required: true,
          default: 1
        },
        rentPerPerson: {
          type: Number,
          required: true
        },
        totalBeds: {
          type: Number,
          default: 1
        },
        availableBeds: {
          type: Number,
          default: 1
        },
        isAvailable: {
          type: Boolean,
          default: true
        }
      }
    ],
    // Structured room units with bed level tracking
    rooms: [
      {
        roomNumber: {
          type: String,
          required: true
        },
        tierName: {
          type: String,
          required: true
        },
        floor: {
          type: Number,
          default: 1
        },
        beds: [
          {
            bedNumber: {
              type: String,
              required: true
            },
            isOccupied: {
              type: Boolean,
              default: false
            },
            currentTenant: {
              type: mongoose.Schema.Types.ObjectId,
              ref: 'User',
              default: null
            }
          }
        ]
      }
    ],
    cancellationPolicy: {
      type: String,
      enum: ['Flexible', 'Moderate', 'Strict'],
      default: 'Moderate'
    },
    // PG / Room / Flat specific fields
    furnishing: {
      type: String,
      default: 'Semi-Furnished'
    },
    preferredTenants: {
      type: String,
      default: 'Any'
    },
    maintenanceCharges: {
      type: Number,
      default: 0
    },
    electricityCharges: {
      type: String,
      default: 'As per meter'
    },
    noticePeriod: {
      type: String,
      default: '1 Month'
    },
    gateTiming: {
      type: String,
      default: 'No Curfew'
    },
    foodPolicy: {
      type: String,
      default: '3 Meals Included'
    },
    floorNumber: {
      type: String,
      default: '1st Floor'
    },
    kitchenType: {
      type: String,
      default: 'Dedicated Private Kitchen'
    },
    amenities: {
      type: [String],
      default: []
    },
    foodAvailable: {
      type: Boolean,
      default: false
    },
    messMenu: {
      breakfast: {
        type: String,
        default: 'Poha, Jalebi / Idli Sambhar & Hot Masala Chai'
      },
      lunch: {
        type: String,
        default: 'Dal Tadka, Shahi Paneer, 4 Butter Phulkas, Steamed Rice & Green Salad'
      },
      dinner: {
        type: String,
        default: 'Mix Veg Curry, Yellow Dal Fry, 4 Butter Rotis & Jeera Rice'
      },
      weeklyMenu: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
      }
    },
    rules: {
      type: [String],
      default: []
    },
    photos: {
      type: [String],
      default: ['https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=600']
    },
    verificationStatus: {
      type: String,
      enum: ['Pending', 'Verified', 'Rejected'],
      default: 'Pending',
      index: true
    },
    rating: {
      type: Number,
      default: 4.0
    },
    reviewsCount: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: true
  }
);

// Pre-save hook: ensure 2-way sync between legacy latitude/longitude and location.coordinates [lng, lat]
PropertySchema.pre('save', function (next) {
  if (this.location && Array.isArray(this.location.coordinates) && this.location.coordinates.length === 2) {
    this.longitude = Number(this.location.coordinates[0]);
    this.latitude = Number(this.location.coordinates[1]);
    this.location.type = 'Point';
  } else if (this.latitude !== undefined && this.longitude !== undefined) {
    if (!this.location) {
      this.location = {};
    }
    this.location.type = 'Point';
    this.location.coordinates = [Number(this.longitude), Number(this.latitude)];
  }

  if (this.location) {
    if (!this.location.address && this.address) this.location.address = this.address;
    if (!this.location.city && this.city) this.location.city = this.city;
    if (!this.location.formattedAddress) {
      const parts = [
        this.location.address || this.address, 
        this.location.locality || this.location.area, 
        this.location.city || this.city, 
        this.location.state
      ].filter(Boolean);
      this.location.formattedAddress = parts.join(', ');
    }
    this.location.lastUpdatedAt = new Date();
  }

  next();
});

// Indexes for search and geo-queries
PropertySchema.index({ city: 1, monthlyRent: 1 });
PropertySchema.index({ city: 1, hostelCategory: 1, roomType: 1 });
PropertySchema.index({ latitude: 1, longitude: 1 });
PropertySchema.index({ 'location.coordinates': '2dsphere' });

module.exports = mongoose.model('Property', PropertySchema);
