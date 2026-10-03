const Project = require('../models/Project');
const Proposal = require('../models/Proposal');


// Accept a proposal exactly once and lock the project to that freelancer.
// The conditional project update makes the operation safe against two
// acceptance/payment requests arriving at nearly the same time.
async function activatePaidProposal(proposalId, projectId) {
  const proposal = await Proposal.findById(proposalId).populate('project freelancer');
  if (!proposal) {
    const error = new Error('Proposal not found');
    error.statusCode = 404;
    throw error;
  }

  const project = proposal.project;
  if (!project || project._id.toString() !== projectId.toString()) {
    const error = new Error('Proposal does not belong to this project');
    error.statusCode = 400;
    throw error;
  }

  // Idempotency: a repeated webhook/confirmation for the same accepted
  // proposal should not create a second assignment.
  if (proposal.status === 'accepted' && project.status === 'In Progress') {
    return { proposal, project, alreadyActivated: true };
  }

  if (proposal.status !== 'pending') {
    const error = new Error('This proposal is no longer pending');
    error.statusCode = 409;
    throw error;
  }

  // Only the first request can change Open -> In Progress.
  const claimedProject = await Project.findOneAndUpdate(
    { _id: project._id, status: 'Open' },
    { $set: { status: 'In Progress', paymentStatus: 'Escrow' } },
    { new: true }
  );

  if (!claimedProject) {
    const currentProject = await Project.findById(project._id);
    const currentAccepted = await Proposal.findOne({
      project: project._id,
      status: 'accepted',
    });

    if (currentAccepted && currentAccepted._id.toString() === proposal._id.toString()) {
      return { proposal: currentAccepted, project: currentProject, alreadyActivated: true };
    }

    const error = new Error('This project has already been assigned to another freelancer or is no longer open.');
    error.statusCode = 409;
    throw error;
  }

  await Proposal.findByIdAndUpdate(proposal._id, { $set: { status: 'accepted' } });

  // All other pending bids become unavailable immediately.
  await Proposal.updateMany(
    { project: project._id, _id: { $ne: proposal._id }, status: 'pending' },
    { $set: { status: 'rejected' } }
  );

  return {
    proposal: await Proposal.findById(proposal._id),
    project: claimedProject,
    alreadyActivated: false,
  };
}

/* ── Create Stripe Checkout Session ──────────────── */
exports.createCheckoutSession = async (req, res) => {
  try {
    const { proposalId } = req.body;

    const proposal = await Proposal.findById(proposalId).populate('project freelancer');
    if (!proposal) {
      return res.status(404).json({ success: false, message: 'Proposal not found' });
    }

    const project = proposal.project;
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }
    if (project.clientId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    if (project.status !== 'Open' || proposal.status !== 'pending') {
      return res.status(409).json({ success: false, message: 'This project is already assigned or this proposal is no longer pending.' });
    }

    // Determine return domain URL
    const origin = req.headers.origin || 'http://localhost:3000';

    const stripeSecret = process.env.STRIPE_SECRET_KEY;
    let stripeInstance = null;
    if (stripeSecret && stripeSecret.startsWith('sk_')) {
      try {
        stripeInstance = require('stripe')(stripeSecret);
      } catch (err) {
        console.warn('Failed to load stripe package dynamically:', err.message);
      }
    }

    if (!stripeInstance) {
      // Missing Stripe Key -> fallback immediately to direct confirm simulation URL
      console.log('Stripe key missing. Using simulated checkout fallback url.');
      return res.status(200).json({ 
        success: true, 
        url: `${origin}/client/project/${project._id}?payment_success=true&proposal_id=${proposalId}` 
      });
    }

    // Stripe checkout session parameters
    const session = await stripeInstance.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'inr',
            product_data: {
              name: `Escrow Payment: ${project.title}`,
              description: `Payment to freelancer: ${proposal.freelancer?.fullName || 'Freelancer'}`,
            },
            unit_amount: Math.round(proposal.bidAmount * 100), // Stripe takes amounts in cents
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${origin}/client/project/${project._id}?payment_success=true&proposal_id=${proposalId}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/client/project/${project._id}?payment_cancelled=true`,
      metadata: {
        proposalId: proposalId.toString(),
        projectId: project._id.toString(),
      },
    });

    res.status(200).json({ success: true, url: session.url });
  } catch (error) {
    console.error('Stripe session creation error:', error);
    res.status(500).json({ success: false, message: 'Failed to create payment session', error: error.message });
  }
};

/* ── Stripe Webhook Handler ──────────────────────── */
exports.handleWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    if (process.env.STRIPE_WEBHOOK_SECRET) {
      const stripeSecret = process.env.STRIPE_SECRET_KEY;
      const stripeInstance = stripeSecret && stripeSecret.startsWith('sk_') ? require('stripe')(stripeSecret) : null;
      if (!stripeInstance) throw new Error('Stripe is not configured');
      event = stripeInstance.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
    } else {
      event = req.body;
    }
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle checkout.session.completed event
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const { proposalId, projectId } = session.metadata;

    try {
      await activatePaidProposal(proposalId, projectId);
      console.log(`Payment confirmed & Escrow established for Project ${projectId}`);
    } catch (dbErr) {
      console.error('Database update failed on checkout.session.completed:', dbErr);
    }
  }

  res.json({ received: true });
};

/* ── Fallback Direct Confirmation (for instant activation) ── */
exports.confirmDirectPayment = async (req, res) => {
  try {
    const { proposalId, projectId } = req.body;
    const proposal = await Proposal.findById(proposalId).populate('project');
    if (!proposal) return res.status(404).json({ success: false, message: 'Proposal not found' });
    if (!proposal.project || proposal.project._id.toString() !== projectId.toString()) {
      return res.status(400).json({ success: false, message: 'Invalid project for proposal' });
    }
    if (proposal.project.clientId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    await activatePaidProposal(proposalId, projectId);
    res.status(200).json({ success: true, message: 'Direct payment activated successfully' });
  } catch (error) {
    res.status(error.statusCode || 500).json({ success: false, message: error.message || 'Direct confirmation failed' });
  }
};

/* ── Create Razorpay Order ───────────────────────── */
exports.createRazorpayOrder = async (req, res) => {
  try {
    const { proposalId } = req.body;
    const proposal = await Proposal.findById(proposalId).populate('project freelancer');
    if (!proposal) {
      return res.status(404).json({ success: false, message: 'Proposal not found' });
    }

    const Razorpay = require('razorpay');
    const rzp = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET
    });

    const options = {
      amount: Math.round(proposal.bidAmount * 100), // in paise (INR sub-units)
      currency: 'INR',
      receipt: `receipt_prop_${proposalId.toString().substring(0, 10)}`,
      payment_capture: 1
    };

    const order = await rzp.orders.create(options);
    res.status(200).json({
      success: true,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.RAZORPAY_KEY_ID,
      proposalId,
      projectId: proposal.project?._id
    });
  } catch (error) {
    console.error('Razorpay order creation error:', error);
    res.status(500).json({ success: false, message: 'Failed to create Razorpay order', error: error.message });
  }
};

/* ── Confirm Razorpay Payment ────────────────────── */
exports.confirmRazorpayPayment = async (req, res) => {
  try {
    const { proposalId, projectId, razorpay_payment_id, razorpay_order_id, razorpay_signature } = req.body;

    // Verify signature
    const crypto = require('crypto');
    const secret = process.env.RAZORPAY_KEY_SECRET;
    const shasum = crypto.createHmac('sha256', secret);
    shasum.update(`${razorpay_order_id}|${razorpay_payment_id}`);
    const digest = shasum.digest('hex');

    if (digest !== razorpay_signature) {
      return res.status(400).json({ success: false, message: 'Payment verification signature mismatch' });
    }

    const proposal = await Proposal.findById(proposalId).populate('project');
    if (!proposal) return res.status(404).json({ success: false, message: 'Proposal not found' });
    if (!proposal.project || proposal.project._id.toString() !== projectId.toString()) {
      return res.status(400).json({ success: false, message: 'Invalid project for proposal' });
    }
    if (proposal.project.clientId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    await activatePaidProposal(proposalId, projectId);
    res.status(200).json({ success: true, message: 'Payment verified and project started' });
  } catch (error) {
    res.status(error.statusCode || 500).json({ success: false, message: error.message || 'Verification failed' });
  }
};
