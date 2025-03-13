const express = require('express');
const {
  applyLeave,
  getPendingLeaves,
  approveLeave,
  rejectLeave,
  getLeaveHistory
} = require('../controllers/leaveController');

const { protect, authorize } = require('../middleware/authMiddleware');
const { leaveValidation, validate } = require('../middleware/validationMiddleware');

const router = express.Router();

/**
 * @swagger
 * /api/leaves/apply:
 *   post:
 *     summary: Apply for leave
 *     tags: [Leaves]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - leaveType
 *               - startDate
 *               - endDate
 *               - reason
 *             properties:
 *               leaveType:
 *                 type: string
 *                 enum: [Annual, Sick, Personal, Other]
 *                 description: Type of leave
 *               startDate:
 *                 type: string
 *                 format: date
 *                 description: Start date of leave (YYYY-MM-DD)
 *               endDate:
 *                 type: string
 *                 format: date
 *                 description: End date of leave (YYYY-MM-DD)
 *               reason:
 *                 type: string
 *                 description: Reason for leave
 *     responses:
 *       201:
 *         description: Leave application submitted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Leave'
 *       400:
 *         description: Validation error
 *       401:
 *         description: Not authorized
 *       500:
 *         description: Server error
 */
router.post('/apply', protect, leaveValidation, validate, applyLeave);

/**
 * @swagger
 * /api/leaves/pending:
 *   get:
 *     summary: Get all pending leave requests (Admin only)
 *     tags: [Leaves]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of pending leave requests
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 count:
 *                   type: integer
 *                   description: Number of leave requests
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Leave'
 *       401:
 *         description: Not authorized
 *       403:
 *         description: Not authorized for non-admin
 *       500:
 *         description: Server error
 */
router.get('/pending', protect, authorize('admin'), getPendingLeaves);

/**
 * @swagger
 * /api/leaves/{id}/approve:
 *   patch:
 *     summary: Approve a leave request (Admin only)
 *     tags: [Leaves]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the leave request to approve
 *     responses:
 *       200:
 *         description: Leave request approved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Leave'
 *       401:
 *         description: Not authorized
 *       403:
 *         description: Not authorized for non-admin
 *       404:
 *         description: Leave request not found
 *       500:
 *         description: Server error
 */
router.patch('/:id/approve', protect, authorize('admin'), approveLeave);

/**
 * @swagger
 * /api/leaves/{id}/reject:
 *   patch:
 *     summary: Reject a leave request (Admin only)
 *     tags: [Leaves]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the leave request to reject
 *     responses:
 *       200:
 *         description: Leave request rejected successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Leave'
 *       401:
 *         description: Not authorized
 *       403:
 *         description: Not authorized for non-admin
 *       404:
 *         description: Leave request not found
 *       500:
 *         description: Server error
 */
router.patch('/:id/reject', protect, authorize('admin'), rejectLeave);

/**
 * @swagger
 * /api/leaves/history:
 *   get:
 *     summary: Get leave history (Employee sees own history, Admin sees all)
 *     tags: [Leaves]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Leave history
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 count:
 *                   type: integer
 *                   description: Number of leave requests
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Leave'
 *       401:
 *         description: Not authorized
 *       500:
 *         description: Server error
 */
router.get('/history', protect, getLeaveHistory);

module.exports = router; 