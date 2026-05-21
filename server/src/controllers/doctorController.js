const prisma = require('../config/db');
const asyncHandler = require('../middleware/asyncHandler');

// @desc    Get all doctors with filters
// @route   GET /api/doctors
exports.getDoctors = asyncHandler(async (req, res) => {
  const { specialty, search, minRating, maxFee, available, page = 1, limit = 10 } = req.query;
  const skip = (parseInt(page) - 1) * parseInt(limit);

  const where = {};
  if (specialty) where.specialty = { contains: specialty, mode: 'insensitive' };
  if (minRating) where.rating = { gte: parseFloat(minRating) };
  if (maxFee) where.consultationFee = { lte: parseFloat(maxFee) };
  if (available === 'true') where.isAvailable = true;
  if (search) {
    where.OR = [
      { specialty: { contains: search, mode: 'insensitive' } },
      { user: { name: { contains: search, mode: 'insensitive' } } },
      { hospitalName: { contains: search, mode: 'insensitive' } },
    ];
  }

  const [doctors, total] = await Promise.all([
    prisma.doctorProfile.findMany({
      where,
      include: { user: { select: { id: true, name: true, email: true, avatar: true, phone: true } } },
      skip,
      take: parseInt(limit),
      orderBy: { rating: 'desc' },
    }),
    prisma.doctorProfile.count({ where }),
  ]);

  res.json({
    success: true,
    doctors,
    pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / parseInt(limit)) },
  });
});

// @desc    Get single doctor
// @route   GET /api/doctors/:id
exports.getDoctor = asyncHandler(async (req, res) => {
  const doctor = await prisma.doctorProfile.findUnique({
    where: { id: req.params.id },
    include: {
      user: { select: { id: true, name: true, email: true, avatar: true, phone: true, reviewsReceived: { include: { author: { select: { name: true, avatar: true } } }, orderBy: { createdAt: 'desc' }, take: 10 } } },
    },
  });

  if (!doctor) return res.status(404).json({ success: false, message: 'Doctor not found' });
  res.json({ success: true, doctor });
});

// @desc    Get specialties
// @route   GET /api/doctors/specialties
exports.getSpecialties = asyncHandler(async (req, res) => {
  const specialties = await prisma.doctorProfile.findMany({
    select: { specialty: true },
    distinct: ['specialty'],
  });
  res.json({ success: true, specialties: specialties.map(s => s.specialty) });
});

// @desc    Update doctor profile
// @route   PUT /api/doctors/profile
exports.updateDoctorProfile = asyncHandler(async (req, res) => {
  const { specialty, qualification, experience, consultationFee, bio, languages, isAvailable, availableSlots, hospitalName, hospitalAddress } = req.body;

  const doctor = await prisma.doctorProfile.update({
    where: { userId: req.user.id },
    data: { specialty, qualification, experience, consultationFee, bio, languages, isAvailable, availableSlots, hospitalName, hospitalAddress },
    include: { user: { select: { id: true, name: true, email: true, avatar: true } } },
  });

  res.json({ success: true, doctor });
});

// @desc    Toggle online status
// @route   PUT /api/doctors/toggle-online
exports.toggleOnline = asyncHandler(async (req, res) => {
  const doctor = await prisma.doctorProfile.findUnique({ where: { userId: req.user.id } });
  const updated = await prisma.doctorProfile.update({
    where: { userId: req.user.id },
    data: { isOnline: !doctor.isOnline },
  });
  res.json({ success: true, isOnline: updated.isOnline });
});
