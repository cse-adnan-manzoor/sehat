const prisma = require('../config/db');
const asyncHandler = require('../middleware/asyncHandler');

// @desc    Get health records
// @route   GET /api/health-records
exports.getHealthRecords = asyncHandler(async (req, res) => {
  const records = await prisma.healthRecord.findMany({
    where: { userId: req.user.id },
    orderBy: { date: 'desc' },
  });
  res.json({ success: true, records });
});

// @desc    Create health record
// @route   POST /api/health-records
exports.createHealthRecord = asyncHandler(async (req, res) => {
  const { title, type, description, fileUrl, fileName, fileSize, doctorName, date } = req.body;
  const record = await prisma.healthRecord.create({
    data: { userId: req.user.id, title, type, description, fileUrl, fileName, fileSize, doctorName, date: date ? new Date(date) : new Date() },
  });
  res.status(201).json({ success: true, record });
});

// @desc    Delete health record
// @route   DELETE /api/health-records/:id
exports.deleteHealthRecord = asyncHandler(async (req, res) => {
  await prisma.healthRecord.delete({ where: { id: req.params.id } });
  res.json({ success: true, message: 'Record deleted' });
});

// NOTIFICATIONS
// @desc    Get notifications
// @route   GET /api/notifications
exports.getNotifications = asyncHandler(async (req, res) => {
  const notifications = await prisma.notification.findMany({
    where: { userId: req.user.id },
    orderBy: { createdAt: 'desc' },
    take: 50,
  });
  const unreadCount = await prisma.notification.count({ where: { userId: req.user.id, isRead: false } });
  res.json({ success: true, notifications, unreadCount });
});

// @desc    Mark notification as read
// @route   PUT /api/notifications/:id/read
exports.markAsRead = asyncHandler(async (req, res) => {
  await prisma.notification.update({ where: { id: req.params.id }, data: { isRead: true } });
  res.json({ success: true });
});

// @desc    Mark all as read
// @route   PUT /api/notifications/read-all
exports.markAllAsRead = asyncHandler(async (req, res) => {
  await prisma.notification.updateMany({ where: { userId: req.user.id, isRead: false }, data: { isRead: true } });
  res.json({ success: true });
});

// REVIEWS
// @desc    Create review
// @route   POST /api/reviews
exports.createReview = asyncHandler(async (req, res) => {
  const { doctorId, rating, comment } = req.body;
  const review = await prisma.review.create({
    data: { authorId: req.user.id, doctorId, rating, comment },
    include: { author: { select: { name: true, avatar: true } } },
  });

  // Update doctor average rating
  const reviews = await prisma.review.findMany({ where: { doctorId } });
  const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
  const doctorProfile = await prisma.doctorProfile.findFirst({ where: { userId: doctorId } });
  if (doctorProfile) {
    await prisma.doctorProfile.update({ where: { id: doctorProfile.id }, data: { rating: Math.round(avgRating * 10) / 10, totalReviews: reviews.length } });
  }

  res.status(201).json({ success: true, review });
});

// @desc    Get doctor reviews
// @route   GET /api/reviews/doctor/:doctorId
exports.getDoctorReviews = asyncHandler(async (req, res) => {
  const reviews = await prisma.review.findMany({
    where: { doctorId: req.params.doctorId },
    include: { author: { select: { name: true, avatar: true } } },
    orderBy: { createdAt: 'desc' },
  });
  res.json({ success: true, reviews });
});

// SYMPTOM CHECKER (Rule-based engine)
exports.checkSymptoms = asyncHandler(async (req, res) => {
  const { symptoms, age, gender } = req.body;

  const symptomDB = {
    'headache': { conditions: ['Tension Headache', 'Migraine', 'Sinusitis'], severity: 'mild', specialty: 'General Medicine' },
    'fever': { conditions: ['Viral Fever', 'Flu', 'COVID-19', 'Dengue'], severity: 'moderate', specialty: 'General Medicine' },
    'cough': { conditions: ['Common Cold', 'Bronchitis', 'Asthma', 'COVID-19'], severity: 'mild', specialty: 'Pulmonology' },
    'chest pain': { conditions: ['Angina', 'GERD', 'Muscle Strain', 'Heart Attack'], severity: 'severe', specialty: 'Cardiology' },
    'stomach pain': { conditions: ['Gastritis', 'Food Poisoning', 'Appendicitis', 'IBS'], severity: 'moderate', specialty: 'Gastroenterology' },
    'back pain': { conditions: ['Muscle Strain', 'Herniated Disc', 'Sciatica', 'Kidney Stones'], severity: 'moderate', specialty: 'Orthopedics' },
    'fatigue': { conditions: ['Anemia', 'Thyroid Disorder', 'Diabetes', 'Depression'], severity: 'mild', specialty: 'General Medicine' },
    'skin rash': { conditions: ['Allergic Reaction', 'Eczema', 'Psoriasis', 'Fungal Infection'], severity: 'mild', specialty: 'Dermatology' },
    'joint pain': { conditions: ['Arthritis', 'Gout', 'Lupus', 'Tendinitis'], severity: 'moderate', specialty: 'Orthopedics' },
    'breathing difficulty': { conditions: ['Asthma', 'Pneumonia', 'COPD', 'Anxiety'], severity: 'severe', specialty: 'Pulmonology' },
    'nausea': { conditions: ['Food Poisoning', 'Gastritis', 'Pregnancy', 'Migraine'], severity: 'mild', specialty: 'Gastroenterology' },
    'dizziness': { conditions: ['Vertigo', 'Low Blood Pressure', 'Anemia', 'Inner Ear Issue'], severity: 'moderate', specialty: 'ENT' },
    'sore throat': { conditions: ['Pharyngitis', 'Tonsillitis', 'Strep Throat', 'Allergies'], severity: 'mild', specialty: 'ENT' },
    'eye pain': { conditions: ['Conjunctivitis', 'Glaucoma', 'Eye Strain', 'Corneal Abrasion'], severity: 'moderate', specialty: 'Ophthalmology' },
    'toothache': { conditions: ['Cavity', 'Gum Disease', 'Abscess', 'TMJ Disorder'], severity: 'moderate', specialty: 'Dentistry' },
  };

  const matchedConditions = [];
  let maxSeverity = 'mild';
  const specialties = new Set();
  const severityOrder = { mild: 1, moderate: 2, severe: 3 };

  const symptomList = Array.isArray(symptoms) ? symptoms : symptoms.split(',').map(s => s.trim().toLowerCase());

  symptomList.forEach(symptom => {
    const match = symptomDB[symptom.toLowerCase()];
    if (match) {
      matchedConditions.push(...match.conditions);
      specialties.add(match.specialty);
      if (severityOrder[match.severity] > severityOrder[maxSeverity]) maxSeverity = match.severity;
    }
  });

  const uniqueConditions = [...new Set(matchedConditions)];
  const recommendations = maxSeverity === 'severe'
    ? ['Seek immediate medical attention', 'Visit the nearest emergency room', 'Call emergency services if symptoms worsen']
    : maxSeverity === 'moderate'
    ? ['Schedule an appointment with a specialist', 'Monitor symptoms for 24-48 hours', 'Take OTC pain relief if needed']
    : ['Rest and stay hydrated', 'Monitor symptoms', 'Consult a doctor if symptoms persist beyond 3 days'];

  res.json({
    success: true,
    result: {
      possibleConditions: uniqueConditions.slice(0, 5),
      severity: maxSeverity,
      recommendedSpecialties: [...specialties],
      recommendations,
      disclaimer: 'This is an AI-assisted preliminary assessment. Please consult a qualified healthcare provider for proper diagnosis and treatment.',
    },
  });
});

// PATIENT PROFILE
// @desc    Update patient profile
// @route   PUT /api/patient/profile
exports.updatePatientProfile = asyncHandler(async (req, res) => {
  const { dateOfBirth, gender, bloodGroup, height, weight, allergies, chronicConditions, emergencyContact, address } = req.body;

  let profile = await prisma.patientProfile.findUnique({ where: { userId: req.user.id } });
  if (!profile) {
    profile = await prisma.patientProfile.create({ data: { userId: req.user.id } });
  }

  const updated = await prisma.patientProfile.update({
    where: { userId: req.user.id },
    data: { dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined, gender, bloodGroup, height: height ? parseFloat(height) : undefined, weight: weight ? parseFloat(weight) : undefined, allergies: allergies || [], chronicConditions: chronicConditions || [], emergencyContact, address },
    include: { user: { select: { id: true, name: true, email: true, avatar: true, phone: true } } },
  });

  res.json({ success: true, profile: updated });
});

// @desc    Get patient profile
// @route   GET /api/patient/profile
exports.getPatientProfile = asyncHandler(async (req, res) => {
  const profile = await prisma.patientProfile.findUnique({
    where: { userId: req.user.id },
    include: { user: { select: { id: true, name: true, email: true, avatar: true, phone: true } } },
  });
  res.json({ success: true, profile });
});

// PHARMACIES
// @desc    Get pharmacies
// @route   GET /api/pharmacies
exports.getPharmacies = asyncHandler(async (req, res) => {
  const pharmacies = await prisma.pharmacy.findMany({ orderBy: { rating: 'desc' } });
  res.json({ success: true, pharmacies });
});

// MESSAGES
// @desc    Get chat messages
// @route   GET /api/messages/:roomId
exports.getMessages = asyncHandler(async (req, res) => {
  const messages = await prisma.message.findMany({
    where: { roomId: req.params.roomId },
    include: { sender: { select: { id: true, name: true, avatar: true } } },
    orderBy: { createdAt: 'asc' },
    take: 100,
  });
  res.json({ success: true, messages });
});

// @desc    Get chat rooms for user
// @route   GET /api/messages/rooms
exports.getChatRooms = asyncHandler(async (req, res) => {
  const messages = await prisma.message.findMany({
    where: { OR: [{ senderId: req.user.id }, { receiverId: req.user.id }] },
    include: {
      sender: { select: { id: true, name: true, avatar: true, role: true } },
      receiver: { select: { id: true, name: true, avatar: true, role: true } },
    },
    orderBy: { createdAt: 'desc' },
    distinct: ['roomId'],
  });

  const rooms = messages.map(msg => ({
    roomId: msg.roomId,
    otherUser: msg.senderId === req.user.id ? msg.receiver : msg.sender,
    lastMessage: msg.content,
    lastMessageAt: msg.createdAt,
    isRead: msg.isRead,
  }));

  res.json({ success: true, rooms });
});

// ADMIN STATS
// @desc    Get admin dashboard stats
// @route   GET /api/admin/stats
exports.getAdminStats = asyncHandler(async (req, res) => {
  const [totalUsers, totalDoctors, totalPatients, totalAppointments, totalOrders, totalMedicines, recentAppointments] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { role: 'DOCTOR' } }),
    prisma.user.count({ where: { role: 'PATIENT' } }),
    prisma.appointment.count(),
    prisma.order.count(),
    prisma.medicine.count(),
    prisma.appointment.findMany({ take: 5, orderBy: { createdAt: 'desc' }, include: { doctor: { include: { user: { select: { name: true } } } }, patient: { include: { user: { select: { name: true } } } } } }),
  ]);

  res.json({
    success: true,
    stats: { totalUsers, totalDoctors, totalPatients, totalAppointments, totalOrders, totalMedicines },
    recentAppointments,
  });
});
