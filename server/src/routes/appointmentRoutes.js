const express = require('express');
const router = express.Router();
const { createAppointment, getAppointments, getAppointment, updateStatus, addPrescription, cancelAppointment } = require('../controllers/appointmentController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);
router.post('/', createAppointment);
router.get('/', getAppointments);
router.get('/:id', getAppointment);
router.put('/:id/status', updateStatus);
router.put('/:id/prescription', addPrescription);
router.put('/:id/cancel', cancelAppointment);

module.exports = router;
