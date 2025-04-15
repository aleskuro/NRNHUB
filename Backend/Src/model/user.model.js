const { Schema, model } = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new Schema({
  username: {
    type: String,
    required: [true, 'Username is required'],
    unique: true,
    trim: true, // Remove leading/trailing whitespace
    validate: {
      validator: function (value) {
        return !/\s/.test(value); // Disallow spaces
      },
      message: 'Username cannot contain spaces',
    },
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    trim: true,
    lowercase: true, // Store emails in lowercase for consistency
    match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email address'], // Basic email format validation
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [8, 'Password must be at least 8 characters long'], // Enforce 8-char minimum
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
    enum: ['user', 'admin'], // Optional: Restrict roles
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Hash password before saving
userSchema.pre('save', async function (next) {
  try {
    if (!this.isModified('password')) {
      return next();
    }
    const salt = await bcrypt.genSalt(10); // Generate salt
    this.password = await bcrypt.hash(this.password, salt); // Hash password
    next();
  } catch (error) {
    next(error); // Pass error to Mongoose
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