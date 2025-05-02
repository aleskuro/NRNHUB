const { Schema, model } = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new Schema({
  username: {
    type: String,
    required: [true, 'Username is required'],
    unique: true,
    trim: true,
    validate: {
      validator: function (value) {
        return !/\s/.test(value);
      },
      message: 'Username cannot contain spaces',
    },
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email address'],
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [8, 'Password must be at least 8 characters long'],
  },
  birthdate: {
    type: Date,
    required: [true, 'Birthdate is required'],
    validate: {
      validator: function (value) {
        const age = Math.floor(
          (Date.now() - value) / (1000 * 60 * 60 * 24 * 365.25)
        );
        return age >= 6;
      },
      message: 'User must be at least 6 years old',
    },
  },
  gender: {
    type: String,
    required: [true, 'Gender is required'],
    enum: {
      values: ['male', 'female', 'other'],
      message: 'Gender must be male, female, or other',
    },
  },
  role: {
    type: String,
    default: 'user',
    enum: ['user', 'admin'],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  lastOnline: {
    type: Date,
    default: null,
  },
  loginHistory: [
    {
      timestamp: {
        type: Date,
        default: Date.now,
      },
      ipAddress: {
        type: String,
        default: null,
      },
      userAgent: {
        type: String,
        default: null,
      },
    },
  ],
  sessions: [
    {
      startTime: {
        type: Date,
        default: Date.now,
      },
      duration: {
        type: Number, // Duration in seconds
        default: 0,
      },
      // _id is automatically included as ObjectId; no need to specify
    },
  ],
  activity: {
    features: {
      profileViews: {
        type: Number,
        default: 0,
      },
      posts: {
        type: Number,
        default: 0,
      },
      comments: {
        type: Number,
        default: 0,
      },
      likes: {
        type: Number,
        default: 0,
      },
      shares: {
        type: Number,
        default: 0,
      },
    },
    social: {
      type: Number,
      default: 0,
    },
    content: {
      type: Number,
      default: 0,
    },
  },
});

// Hash password before saving
userSchema.pre('save', async function (next) {
  try {
    if (!this.isModified('password')) {
      return next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password for login
userSchema.methods.comparePassword = async function (givenPassword) {
  try {
    return await bcrypt.compare(givenPassword, this.password);
  } catch (error) {
    throw new Error('Error comparing passwords');
  }
};

const User = model('User', userSchema);

module.exports = User;