const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

/**
 * @swagger
 * components:
 *   schemas:
 *     Employee:
 *       type: object
 *       required:
 *         - name
 *         - email
 *         - password
 *         - department
 *       properties:
 *         _id:
 *           type: string
 *           description: Employee ID (auto-generated)
 *         name:
 *           type: string
 *           description: Employee name
 *         email:
 *           type: string
 *           description: Employee email
 *           format: email
 *         password:
 *           type: string
 *           description: Hashed password (not returned in responses)
 *           format: password
 *         role:
 *           type: string
 *           enum: [employee, admin]
 *           description: Employee role
 *           default: employee
 *         department:
 *           type: string
 *           description: Employee department
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Date when employee was created
 *       example:
 *         _id: 60d0fe4f5311236168a109ca
 *         name: John Doe
 *         email: john@example.com
 *         role: employee
 *         department: Engineering
 *         createdAt: 2023-10-20T07:45:00.000Z
 */
const EmployeeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a name'],
    trim: true
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
    required: [true, 'Please add a password'],
    minlength: 6,
    select: false
  },
  role: {
    type: String,
    enum: ['employee', 'admin'],
    default: 'employee'
  },
  department: {
    type: String,
    required: [true, 'Please add a department']
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Encrypt password using bcrypt
EmployeeSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Sign JWT and return
EmployeeSchema.methods.getSignedJwtToken = function() {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE
  });
};

// Match user entered password to hashed password in database
EmployeeSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('Employee', EmployeeSchema); 