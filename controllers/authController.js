const Employee = require('../models/Employee');

// @desc    Register employee
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res) => {
  try {
    const { name, email, password, role, department } = req.body;

    // Check if employee already exists
    const employeeExists = await Employee.findOne({ email });

    if (employeeExists) {
      return res.status(400).json({
        success: false,
        error: 'Employee already exists'
      });
    }

    // Create employee
    const employee = await Employee.create({
      name,
      email,
      password,
      role,
      department
    });

    sendTokenResponse(employee, 201, res);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Login employee
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check for employee
    const employee = await Employee.findOne({ email }).select('+password');

    if (!employee) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }

    // Check if password matches
    const isMatch = await employee.matchPassword(password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }

    sendTokenResponse(employee, 200, res);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Logout employee
// @route   POST /api/auth/logout
// @access  Private
exports.logout = async (req, res) => {
  res.status(200).json({
    success: true,
    data: {}
  });
};

// Get token from model, create cookie and send response
const sendTokenResponse = (employee, statusCode, res) => {
  // Create token
  const token = employee.getSignedJwtToken();

  res.status(statusCode).json({
    success: true,
    token
  });
}; 