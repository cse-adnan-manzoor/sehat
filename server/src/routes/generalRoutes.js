const express = require('express');
const router = express.Router();
const g = require('../controllers/generalController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Health Records
router.get('/health-records', protect, g.getHealthRecords);
router.post('/health-records', protect, g.createHealthRecord);
router.delete('/health-records/:id', protect, g.deleteHealthRecord);

// Notifications
router.get('/notifications', protect, g.getNotifications);
router.put('/notifications/:id/read', protect, g.markAsRead);
router.put('/notifications/read-all', protect, g.markAllAsRead);

// Reviews
router.post('/reviews', protect, g.createReview);
router.get('/reviews/doctor/:doctorId', g.getDoctorReviews);

// Symptom Checker
router.post('/symptom-checker', g.checkSymptoms);

// Patient Profile
router.get('/patient/profile', protect, g.getPatientProfile);
router.put('/patient/profile', protect, g.updatePatientProfile);

// Pharmacies
router.get('/pharmacies', g.getPharmacies);

// Messages
router.get('/messages/rooms', protect, g.getChatRooms);
router.get('/messages/:roomId', protect, g.getMessages);

// Admin
router.get('/admin/stats', protect, authorize('ADMIN'), g.getAdminStats);

module.exports = router;
