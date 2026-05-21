const prisma = require('../config/db');
const asyncHandler = require('../middleware/asyncHandler');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder');

// @desc    Get medicines
// @route   GET /api/medicines
exports.getMedicines = asyncHandler(async (req, res) => {
  const { search, category, page = 1, limit = 12 } = req.query;
  const skip = (parseInt(page) - 1) * parseInt(limit);
  const where = {};
  if (search) where.OR = [{ name: { contains: search, mode: 'insensitive' } }, { genericName: { contains: search, mode: 'insensitive' } }];
  if (category) where.category = category;

  const [medicines, total] = await Promise.all([
    prisma.medicine.findMany({ where, skip, take: parseInt(limit), orderBy: { name: 'asc' } }),
    prisma.medicine.count({ where }),
  ]);
  res.json({ success: true, medicines, pagination: { page: parseInt(page), total, pages: Math.ceil(total / parseInt(limit)) } });
});

// @desc    Get categories
// @route   GET /api/medicines/categories
exports.getCategories = asyncHandler(async (req, res) => {
  const categories = await prisma.medicine.findMany({ select: { category: true }, distinct: ['category'] });
  res.json({ success: true, categories: categories.map(c => c.category) });
});

// @desc    Get single medicine
// @route   GET /api/medicines/:id
exports.getMedicine = asyncHandler(async (req, res) => {
  const medicine = await prisma.medicine.findUnique({ where: { id: req.params.id } });
  if (!medicine) return res.status(404).json({ success: false, message: 'Medicine not found' });
  res.json({ success: true, medicine });
});

// CART
// @desc    Get cart
// @route   GET /api/cart
exports.getCart = asyncHandler(async (req, res) => {
  let cart = await prisma.cart.findUnique({
    where: { userId: req.user.id },
    include: { items: { include: { medicine: true } } },
  });
  if (!cart) {
    cart = await prisma.cart.create({ data: { userId: req.user.id }, include: { items: { include: { medicine: true } } } });
  }
  res.json({ success: true, cart });
});

// @desc    Add to cart
// @route   POST /api/cart/add
exports.addToCart = asyncHandler(async (req, res) => {
  const { medicineId, quantity = 1 } = req.body;
  let cart = await prisma.cart.findUnique({ where: { userId: req.user.id } });
  if (!cart) cart = await prisma.cart.create({ data: { userId: req.user.id } });

  const existing = await prisma.cartItem.findFirst({ where: { cartId: cart.id, medicineId } });
  if (existing) {
    await prisma.cartItem.update({ where: { id: existing.id }, data: { quantity: existing.quantity + quantity } });
  } else {
    await prisma.cartItem.create({ data: { cartId: cart.id, medicineId, quantity } });
  }

  const updatedCart = await prisma.cart.findUnique({ where: { id: cart.id }, include: { items: { include: { medicine: true } } } });
  res.json({ success: true, cart: updatedCart });
});

// @desc    Update cart item quantity
// @route   PUT /api/cart/item/:itemId
exports.updateCartItem = asyncHandler(async (req, res) => {
  const { quantity } = req.body;
  if (quantity <= 0) {
    await prisma.cartItem.delete({ where: { id: req.params.itemId } });
  } else {
    await prisma.cartItem.update({ where: { id: req.params.itemId }, data: { quantity } });
  }
  const cart = await prisma.cart.findUnique({ where: { userId: req.user.id }, include: { items: { include: { medicine: true } } } });
  res.json({ success: true, cart });
});

// @desc    Remove from cart
// @route   DELETE /api/cart/item/:itemId
exports.removeFromCart = asyncHandler(async (req, res) => {
  await prisma.cartItem.delete({ where: { id: req.params.itemId } });
  const cart = await prisma.cart.findUnique({ where: { userId: req.user.id }, include: { items: { include: { medicine: true } } } });
  res.json({ success: true, cart });
});

// @desc    Clear cart
// @route   DELETE /api/cart
exports.clearCart = asyncHandler(async (req, res) => {
  const cart = await prisma.cart.findUnique({ where: { userId: req.user.id } });
  if (cart) await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
  res.json({ success: true, message: 'Cart cleared' });
});

// ORDERS
// @desc    Create order from cart
// @route   POST /api/orders
exports.createOrder = asyncHandler(async (req, res) => {
  let { shippingAddress, paymentMethod, sessionId } = req.body;
  let paymentId = null;
  let paymentStatus = 'PENDING';

  if (paymentMethod === 'ONLINE') {
    if (!sessionId) {
      return res.status(400).json({ success: false, message: 'Payment verification failed: missing session ID' });
    }
    
    // Verify Stripe session
    try {
      const session = await stripe.checkout.sessions.retrieve(sessionId);
      if (session.payment_status !== 'paid') {
        return res.status(400).json({ success: false, message: 'Payment not completed' });
      }
      paymentId = session.payment_intent || session.id;
      paymentStatus = 'COMPLETED';
      
      // Use address from metadata if not explicitly provided
      if (!shippingAddress && session.metadata && session.metadata.shippingAddress) {
        shippingAddress = session.metadata.shippingAddress;
      }
    } catch (error) {
      return res.status(400).json({ success: false, message: 'Invalid session ID' });
    }
  }

  const cart = await prisma.cart.findUnique({ where: { userId: req.user.id }, include: { items: { include: { medicine: true } } } });
  if (!cart || cart.items.length === 0) return res.status(400).json({ success: false, message: 'Cart is empty' });

  const totalAmount = cart.items.reduce((sum, item) => sum + item.medicine.price * item.quantity, 0);

  const order = await prisma.order.create({
    data: {
      userId: req.user.id,
      totalAmount,
      shippingAddress,
      paymentMethod: paymentMethod || 'COD',
      paymentId: paymentId || null,
      paymentStatus: paymentStatus,
      items: { create: cart.items.map(item => ({ medicineId: item.medicineId, quantity: item.quantity, price: item.medicine.price })) },
    },
    include: { items: { include: { medicine: true } } },
  });

  await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
  res.status(201).json({ success: true, order });
});

// @desc    Create Stripe Checkout Session
// @route   POST /api/payment/stripe/create-session
exports.createStripeSession = asyncHandler(async (req, res) => {
  const { shippingAddress } = req.body;
  const cart = await prisma.cart.findUnique({ where: { userId: req.user.id }, include: { items: { include: { medicine: true } } } });
  if (!cart || cart.items.length === 0) return res.status(400).json({ success: false, message: 'Cart is empty' });

  const line_items = cart.items.map(item => ({
    price_data: {
      currency: 'inr',
      product_data: {
        name: item.medicine.name,
      },
      unit_amount: Math.round(item.medicine.price * 100),
    },
    quantity: item.quantity,
  }));

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items,
      mode: 'payment',
      success_url: `${process.env.CLIENT_URL || 'http://localhost:5173'}/patient/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.CLIENT_URL || 'http://localhost:5173'}/patient/cart`,
      metadata: {
        userId: req.user.id,
        shippingAddress,
      }
    });

    res.json({ success: true, url: session.url });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || 'Failed to create Stripe session' });
  }
});

// @desc    Get user orders
// @route   GET /api/orders
exports.getOrders = asyncHandler(async (req, res) => {
  const orders = await prisma.order.findMany({
    where: { userId: req.user.id },
    include: { items: { include: { medicine: true } } },
    orderBy: { createdAt: 'desc' },
  });
  res.json({ success: true, orders });
});

// @desc    Get single order
// @route   GET /api/orders/:id
exports.getOrder = asyncHandler(async (req, res) => {
  const order = await prisma.order.findUnique({
    where: { id: req.params.id },
    include: { items: { include: { medicine: true } } },
  });
  if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
  res.json({ success: true, order });
});
