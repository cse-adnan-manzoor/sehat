const express = require('express');
const router = express.Router();
const { getDoctors, getDoctor, getSpecialties, updateDoctorProfile, toggleOnline } = require('../controllers/doctorController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/', getDoctors);
router.get('/specialties', getSpecialties);
router.get('/:id', getDoctor);
router.put('/profile', protect, authorize('DOCTOR'), updateDoctorProfile);
router.put('/toggle-online', protect, authorize('DOCTOR'), toggleOnline);

module.exports = router;
