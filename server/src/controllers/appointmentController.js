const prisma = require('../config/db');
const asyncHandler = require('../middleware/asyncHandler');

// @desc    Create appointment
// @route   POST /api/appointments
exports.createAppointment = asyncHandler(async (req, res) => {
  const { doctorId, date, timeSlot, type, symptoms } = req.body;

  const patient = await prisma.patientProfile.findUnique({ where: { userId: req.user.id } });
  if (!patient) return res.status(400).json({ success: false, message: 'Patient profile not found' });

  const doctor = await prisma.doctorProfile.findUnique({ where: { id: doctorId } });
  if (!doctor) return res.status(404).json({ success: false, message: 'Doctor not found' });

  const appointment = await prisma.appointment.create({
    data: {
      patientId: patient.id,
      doctorId,
      date: new Date(date),
      timeSlot,
      type: type || 'video',
      symptoms,
      paymentAmount: doctor.consultationFee,
      status: 'CONFIRMED',
      paymentStatus: doctor.consultationFee === 0 ? 'COMPLETED' : 'PENDING',
    },
    include: {
      doctor: { include: { user: { select: { name: true, avatar: true } } } },
      patient: { include: { user: { select: { name: true, avatar: true } } } },
    },
  });

  res.status(201).json({ success: true, appointment });
});

// @desc    Get user appointments
// @route   GET /api/appointments
exports.getAppointments = asyncHandler(async (req, res) => {
  const { status, page = 1, limit = 10 } = req.query;
  const skip = (parseInt(page) - 1) * parseInt(limit);

  let where = {};
  if (status) where.status = status;

  if (req.user.role === 'PATIENT') {
    const patient = await prisma.patientProfile.findUnique({ where: { userId: req.user.id } });
    if (patient) where.patientId = patient.id;
  } else if (req.user.role === 'DOCTOR') {
    const doctor = await prisma.doctorProfile.findUnique({ where: { userId: req.user.id } });
    if (doctor) where.doctorId = doctor.id;
  }

  const [appointments, total] = await Promise.all([
    prisma.appointment.findMany({
      where,
      include: {
        doctor: { include: { user: { select: { id: true, name: true, avatar: true } } } },
        patient: { include: { user: { select: { id: true, name: true, avatar: true } } } },
      },
      skip,
      take: parseInt(limit),
      orderBy: { date: 'desc' },
    }),
    prisma.appointment.count({ where }),
  ]);

  res.json({ success: true, appointments, pagination: { page: parseInt(page), total, pages: Math.ceil(total / parseInt(limit)) } });
});

// @desc    Get single appointment
// @route   GET /api/appointments/:id
exports.getAppointment = asyncHandler(async (req, res) => {
  const appointment = await prisma.appointment.findUnique({
    where: { id: req.params.id },
    include: {
      doctor: { include: { user: { select: { id: true, name: true, avatar: true, email: true } } } },
      patient: { include: { user: { select: { id: true, name: true, avatar: true, email: true } } } },
    },
  });

  if (!appointment) return res.status(404).json({ success: false, message: 'Appointment not found' });
  res.json({ success: true, appointment });
});

// @desc    Update appointment status
// @route   PUT /api/appointments/:id/status
exports.updateStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const appointment = await prisma.appointment.update({
    where: { id: req.params.id },
    data: { status },
    include: {
      doctor: { include: { user: { select: { name: true } } } },
      patient: { include: { user: { select: { name: true } } } },
    },
  });

  res.json({ success: true, appointment });
});

// @desc    Add prescription
// @route   PUT /api/appointments/:id/prescription
exports.addPrescription = asyncHandler(async (req, res) => {
  const { prescription, notes } = req.body;
  const appointment = await prisma.appointment.update({
    where: { id: req.params.id },
    data: { prescription, notes, status: 'COMPLETED' },
  });
  res.json({ success: true, appointment });
});

// @desc    Cancel appointment
// @route   PUT /api/appointments/:id/cancel
exports.cancelAppointment = asyncHandler(async (req, res) => {
  const appointment = await prisma.appointment.update({
    where: { id: req.params.id },
    data: { status: 'CANCELLED' },
  });
  res.json({ success: true, appointment });
});
