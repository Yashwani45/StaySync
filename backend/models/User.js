const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please add a name']
    },
    email: {
      type: String,
      required: [true, 'Please add an email'],
      unique: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        'Please add a valid email'
      ]
    },
    password: {
      type: String,
      minlength: 6,
      select: false
    },
    phone: {
      type: String,
      default: ''
    },
    googleId: {
      type: String,
      default: ''
    },
    authProvider: {
      type: String,
      enum: ['local', 'google'],
      default: 'local'
    },
    role: {
      type: String,
      enum: [
        'USER',
        'HOSTEL_OWNER',
        'PG_OWNER',
        'ROOM_OWNER',
        'TIFFIN_PROVIDER',
        'CLEANING_LAUNDRY_PROVIDER',
        'PROPERTY_OWNER',
        'PROVIDER',
        'ADMIN',
        'SUPER_ADMIN'
      ],
      default: 'USER'
    },
    accountStatus: {
      type: String,
      enum: ['Active', 'Suspended', 'Deactivated'],
      default: 'Active'
    },
    suspensionReason: {
      type: String,
      default: ''
    },
    permissions: {
      type: [String],
      default: ['ALL']
    },
    providerType: {
      type: String,
      enum: ['Tiffin', 'Cleaning', 'Both', ''],
      default: ''
    },
    propertyType: {
      type: String,
      enum: ['Hostel', 'PG', 'Room', 'Flat', ''],
      default: ''
    },
    businessName: {
      type: String,
      default: ''
    },
    businessAddress: {
      type: String,
      default: ''
    },
    businessType: {
      type: String,
      default: ''
    },
    state: {
      type: String,
      default: ''
    },
    currentCity: {
      type: String,
      default: ''
    },
    preferredCity: {
      type: String,
      default: ''
    },
    gender: {
      type: String,
      default: ''
    },
    preferredRoomType: {
      type: String,
      default: ''
    },
    roomShare: {
      type: String,
      default: ''
    },
    monthlyBudget: {
      type: Number,
      default: 0
    },
    foodPreference: {
      type: String,
      default: ''
    },
    isVerified: {
      type: Boolean,
      default: false
    },
    profileImage: {
      type: String,
      default: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'
    }
  },
  {
    timestamps: true
  }
);

// Hash password before saving
UserSchema.pre('save', async function () {
  if (!this.isModified('password')) {
    return;
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Compare password
UserSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);
