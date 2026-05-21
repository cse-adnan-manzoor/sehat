const express = require('express');
const router = express.Router();
const { getMedicines, getCategories, getMedicine, getCart, addToCart, updateCartItem, removeFromCart, clearCart, createOrder, getOrders, getOrder, getPharmacies, createStripeSession } = require('../controllers/medicineController');
const { protect } = require('../middleware/authMiddleware');

// Public
router.get('/medicines', getMedicines);
router.get('/medicines/categories', getCategories);
router.get('/medicines/:id', getMedicine);

// Protected
router.get('/cart', protect, getCart);
router.post('/cart/add', protect, addToCart);
router.put('/cart/item/:itemId', protect, updateCartItem);
router.delete('/cart/item/:itemId', protect, removeFromCart);
router.delete('/cart', protect, clearCart);

router.post('/orders', protect, createOrder);
router.post('/payment/stripe/create-session', protect, createStripeSession);
router.get('/orders', protect, getOrders);
router.get('/orders/:id', protect, getOrder);

module.exports = router;
