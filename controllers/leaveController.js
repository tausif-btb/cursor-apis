const Leave = require('../models/Leave');

// @desc    Apply for leave
// @route   POST /api/leaves/apply
// @access  Private
exports.applyLeave = async (req, res) => {
  try {
    // Add employee to req.body
    req.body.employee = req.employee.id;

    const leave = await Leave.create(req.body);

    res.status(201).json({
      success: true,
      data: leave
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Get pending leave requests
// @route   GET /api/leaves/pending
// @access  Private/Admin
exports.getPendingLeaves = async (req, res) => {
  try {
    const leaves = await Leave.find({ status: 'Pending' }).populate({
      path: 'employee',
      select: 'name email department'
    });

    res.status(200).json({
      success: true,
      count: leaves.length,
      data: leaves
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Approve leave request
// @route   PATCH /api/leaves/:id/approve
// @access  Private/Admin
exports.approveLeave = async (req, res) => {
  try {
    let leave = await Leave.findById(req.params.id);

    if (!leave) {
      return res.status(404).json({
        success: false,
        error: 'Leave request not found'
      });
    }

    leave = await Leave.findByIdAndUpdate(
      req.params.id,
      { status: 'Approved' },
      { new: true, runValidators: true }
    ).populate({
      path: 'employee',
      select: 'name email department'
    });

    res.status(200).json({
      success: true,
      data: leave
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Reject leave request
// @route   PATCH /api/leaves/:id/reject
// @access  Private/Admin
exports.rejectLeave = async (req, res) => {
  try {
    let leave = await Leave.findById(req.params.id);

    if (!leave) {
      return res.status(404).json({
        success: false,
        error: 'Leave request not found'
      });
    }

    leave = await Leave.findByIdAndUpdate(
      req.params.id,
      { status: 'Rejected' },
      { new: true, runValidators: true }
    ).populate({
      path: 'employee',
      select: 'name email department'
    });

    res.status(200).json({
      success: true,
      data: leave
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Get leave history
// @route   GET /api/leaves/history
// @access  Private
exports.getLeaveHistory = async (req, res) => {
  try {
    let query;

    // If employee role is admin, get all leave history
    if (req.employee.role === 'admin') {
      query = Leave.find().populate({
        path: 'employee',
        select: 'name email department'
      });
    } else {
      // If employee role is employee, get only their leave history
      query = Leave.find({ employee: req.employee.id });
    }

    const leaves = await query;

    res.status(200).json({
      success: true,
      count: leaves.length,
      data: leaves
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
}; 