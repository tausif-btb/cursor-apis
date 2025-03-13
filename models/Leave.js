const mongoose = require('mongoose');

/**
 * @swagger
 * components:
 *   schemas:
 *     Leave:
 *       type: object
 *       required:
 *         - employee
 *         - leaveType
 *         - startDate
 *         - endDate
 *         - reason
 *       properties:
 *         _id:
 *           type: string
 *           description: Leave request ID (auto-generated)
 *         employee:
 *           type: string
 *           description: Reference to the employee who applied for leave
 *         leaveType:
 *           type: string
 *           enum: [Annual, Sick, Medical, Personal, Other]
 *           description: Type of leave
 *         startDate:
 *           type: string
 *           format: date
 *           description: Start date of leave
 *         endDate:
 *           type: string
 *           format: date
 *           description: End date of leave
 *         reason:
 *           type: string
 *           description: Reason for leave
 *         status:
 *           type: string
 *           enum: [Pending, Approved, Rejected]
 *           description: Status of leave request
 *           default: Pending
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Date when leave request was created
 *       example:
 *         _id: 60d0fe4f5311236168a109cb
 *         employee: 60d0fe4f5311236168a109ca
 *         leaveType: Annual
 *         startDate: 2023-12-20
 *         endDate: 2023-12-25
 *         reason: Family vacation
 *         status: Pending
 *         createdAt: 2023-10-20T08:15:00.000Z
 */
const LeaveSchema = new mongoose.Schema({
  employee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    required: true
  },
  leaveType: {
    type: String,
    required: [true, 'Please specify leave type'],
    enum: ['Annual', 'Sick', 'Medical', 'Personal', 'Other']
  },
  startDate: {
    type: Date,
    required: [true, 'Please add a start date']
  },
  endDate: {
    type: Date,
    required: [true, 'Please add an end date']
  },
  reason: {
    type: String,
    required: [true, 'Please add a reason for leave']
  },
  status: {
    type: String,
    enum: ['Pending', 'Approved', 'Rejected'],
    default: 'Pending'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Leave', LeaveSchema); 