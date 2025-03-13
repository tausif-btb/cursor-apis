const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const asyncHandler = require('../middleware/async');
const ErrorResponse = require('../utils/errorResponse');

/**
 * @desc    Create a subscription
 * @route   POST /api/v1/subscriptions
 * @access  Private
 */
exports.createSubscription = asyncHandler(async (req, res, next) => {
  const { customerId, priceId, paymentMethodId } = req.body;

  if (!customerId || !priceId) {
    return next(new ErrorResponse('Please provide a customer ID and price ID', 400));
  }

  try {
    // Attach payment method to customer if provided
    if (paymentMethodId) {
      await stripe.paymentMethods.attach(paymentMethodId, {
        customer: customerId,
      });

      // Set as default payment method
      await stripe.customers.update(customerId, {
        invoice_settings: {
          default_payment_method: paymentMethodId,
        },
      });
    }

    // Create subscription
    const subscription = await stripe.subscriptions.create({
      customer: customerId,
      items: [{ price: priceId }],
      expand: ['latest_invoice.payment_intent'],
    });

    res.status(201).json({
      success: true,
      data: subscription,
    });
  } catch (error) {
    return next(new ErrorResponse(error.message, 400));
  }
});

/**
 * @desc    Get all subscriptions
 * @route   GET /api/v1/subscriptions
 * @access  Private
 */
exports.getSubscriptions = asyncHandler(async (req, res, next) => {
  const { customer } = req.query;
  let params = {};

  if (customer) {
    params.customer = customer;
  }

  const subscriptions = await stripe.subscriptions.list(params);

  res.status(200).json({
    success: true,
    count: subscriptions.data.length,
    data: subscriptions.data,
  });
});

/**
 * @desc    Get single subscription
 * @route   GET /api/v1/subscriptions/:id
 * @access  Private
 */
exports.getSubscription = asyncHandler(async (req, res, next) => {
  try {
    const subscription = await stripe.subscriptions.retrieve(req.params.id);

    res.status(200).json({
      success: true,
      data: subscription,
    });
  } catch (error) {
    return next(new ErrorResponse(`No subscription found with id ${req.params.id}`, 404));
  }
});

/**
 * @desc    Update subscription
 * @route   PUT /api/v1/subscriptions/:id
 * @access  Private
 */
exports.updateSubscription = asyncHandler(async (req, res, next) => {
  try {
    const { priceId, paymentMethodId } = req.body;
    const subscriptionId = req.params.id;

    // Get current subscription to retrieve customer ID
    const currentSubscription = await stripe.subscriptions.retrieve(subscriptionId);

    // Update payment method if provided
    if (paymentMethodId) {
      await stripe.paymentMethods.attach(paymentMethodId, {
        customer: currentSubscription.customer,
      });

      await stripe.customers.update(currentSubscription.customer, {
        invoice_settings: {
          default_payment_method: paymentMethodId,
        },
      });
    }

    // Update subscription items if price ID provided
    let updatedSubscription;
    if (priceId) {
      // Get subscription items
      const subscriptionItems = await stripe.subscriptionItems.list({
        subscription: subscriptionId,
      });

      // Update the subscription item with the new price
      updatedSubscription = await stripe.subscriptions.update(subscriptionId, {
        items: [
          {
            id: subscriptionItems.data[0].id,
            price: priceId,
          },
        ],
      });
    } else {
      // Just update other fields if no price change
      updatedSubscription = await stripe.subscriptions.update(subscriptionId, req.body);
    }

    res.status(200).json({
      success: true,
      data: updatedSubscription,
    });
  } catch (error) {
    return next(new ErrorResponse(error.message, 400));
  }
});

/**
 * @desc    Cancel subscription
 * @route   DELETE /api/v1/subscriptions/:id
 * @access  Private
 */
exports.cancelSubscription = asyncHandler(async (req, res, next) => {
  try {
    const deleted = await stripe.subscriptions.del(req.params.id);

    res.status(200).json({
      success: true,
      data: deleted,
    });
  } catch (error) {
    return next(new ErrorResponse(error.message, 400));
  }
});

/**
 * @desc    Resume canceled subscription
 * @route   POST /api/v1/subscriptions/:id/resume
 * @access  Private
 */
exports.resumeSubscription = asyncHandler(async (req, res, next) => {
  try {
    const subscription = await stripe.subscriptions.retrieve(req.params.id);
    
    if (!subscription.cancel_at_period_end) {
      return next(new ErrorResponse('This subscription is not scheduled for cancellation', 400));
    }

    const resumedSubscription = await stripe.subscriptions.update(req.params.id, {
      cancel_at_period_end: false,
    });

    res.status(200).json({
      success: true,
      data: resumedSubscription,
    });
  } catch (error) {
    return next(new ErrorResponse(error.message, 400));
  }
});

/**
 * @desc    Create subscription schedule
 * @route   POST /api/v1/subscriptions/schedule
 * @access  Private
 */
exports.createSubscriptionSchedule = asyncHandler(async (req, res, next) => {
  try {
    const { customerId, phases } = req.body;

    if (!customerId || !phases) {
      return next(new ErrorResponse('Please provide customer ID and schedule phases', 400));
    }

    const schedule = await stripe.subscriptionSchedules.create({
      customer: customerId,
      start_date: req.body.start_date || 'now',
      phases: phases,
    });

    res.status(201).json({
      success: true,
      data: schedule,
    });
  } catch (error) {
    return next(new ErrorResponse(error.message, 400));
  }
});

/**
 * @desc    Get invoice for subscription
 * @route   GET /api/v1/subscriptions/:id/invoice
 * @access  Private
 */
exports.getSubscriptionInvoices = asyncHandler(async (req, res, next) => {
  try {
    const subscriptionId = req.params.id;
    
    const invoices = await stripe.invoices.list({
      subscription: subscriptionId
    });

    res.status(200).json({
      success: true,
      count: invoices.data.length,
      data: invoices.data
    });
  } catch (error) {
    return next(new ErrorResponse(error.message, 400));
  }
}); 