const { body, validationResult } = require('express-validator');

// Validation rules for registration
exports.registerValidation = [
  body('name').notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Please include a valid email'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),
  body('department').notEmpty().withMessage('Department is required')
];

// Validation rules for login
exports.loginValidation = [
  body('email').isEmail().withMessage('Please include a valid email'),
  body('password').exists().withMessage('Password is required')
];

// Validation rules for leave application
exports.leaveValidation = [
  body('leaveType')
    .isIn(['Annual', 'Sick', 'Personal', 'Other'])
    .withMessage('Invalid leave type'),
  body('startDate').isISO8601().withMessage('Invalid start date'),
  body('endDate').isISO8601().withMessage('Invalid end date'),
  body('reason').notEmpty().withMessage('Reason is required')
];

// Middleware to check for validation errors
exports.validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
}; 