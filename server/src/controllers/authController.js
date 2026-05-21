const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../config/db');
const asyncHandler = require('../middleware/asyncHandler');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE || '7d' });
};

const generateRefreshToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_REFRESH_SECRET, { expiresIn: process.env.JWT_REFRESH_EXPIRE || '30d' });
};

// @desc    Register user
// @route   POST /api/auth/register
exports.register = asyncHandler(async (req, res) => {
  const { name, email, password, role, phone } = req.body;

  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    return res.status(400).json({ success: false, message: 'User already exists' });
  }

  const hashedPassword = await bcrypt.hash(password, 12);
  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  const user = await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
      role: role || 'PATIENT',
      phone,
      otp,
      otpExpiry: new Date(Date.now() + 10 * 60 * 1000),
      isVerified: true, // Auto-verify for dev
    },
  });

  // Create profile based on role
  if (user.role === 'DOCTOR') {
    await prisma.doctorProfile.create({
      data: {
        userId: user.id,
        specialty: req.body.specialty || 'General Medicine',
        qualification: req.body.qualification || 'MBBS',
        experience: req.body.experience || 0,
        consultationFee: req.body.consultationFee || 0,
      },
    });
  } else if (user.role === 'PATIENT') {
    await prisma.patientProfile.create({
      data: { userId: user.id },
    });
  }

  const token = generateToken(user.id);
  const refreshToken = generateRefreshToken(user.id);

  await prisma.user.update({ where: { id: user.id }, data: { refreshToken } });

  res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  res.status(201).json({
    success: true,
    token,
    refreshToken,
    user: { id: user.id, name: user.name, email: user.email, role: user.role, avatar: user.avatar },
  });
});

// @desc    Login user
// @route   POST /api/auth/login
exports.login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return res.status(401).json({ success: false, message: 'Invalid credentials' });
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return res.status(401).json({ success: false, message: 'Invalid credentials' });
  }

  const token = generateToken(user.id);
  const refreshToken = generateRefreshToken(user.id);

  await prisma.user.update({ where: { id: user.id }, data: { refreshToken } });

  res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  res.json({
    success: true,
    token,
    refreshToken,
    user: { id: user.id, name: user.name, email: user.email, role: user.role, avatar: user.avatar, phone: user.phone },
  });
});

// @desc    Get current user profile
// @route   GET /api/auth/me
exports.getMe = asyncHandler(async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
    include: {
      doctorProfile: true,
      patientProfile: true,
    },
  });

  res.json({ success: true, user });
});

// @desc    Refresh token
// @route   POST /api/auth/refresh
exports.refreshToken = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) {
    return res.status(401).json({ success: false, message: 'No refresh token' });
  }

  const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
  const user = await prisma.user.findUnique({ where: { id: decoded.id } });

  if (!user || user.refreshToken !== refreshToken) {
    return res.status(401).json({ success: false, message: 'Invalid refresh token' });
  }

  const newToken = generateToken(user.id);
  const newRefreshToken = generateRefreshToken(user.id);

  await prisma.user.update({ where: { id: user.id }, data: { refreshToken: newRefreshToken } });

  res.json({ success: true, token: newToken, refreshToken: newRefreshToken });
});

// @desc    Forgot password
// @route   POST /api/auth/forgot-password
exports.forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return res.json({ success: true, message: 'If email exists, reset link sent' });
  }

  const resetToken = Math.floor(100000 + Math.random() * 900000).toString();
  await prisma.user.update({
    where: { id: user.id },
    data: { resetToken, resetTokenExpiry: new Date(Date.now() + 10 * 60 * 1000) },
  });

  res.json({ success: true, message: 'Reset OTP sent to email', resetToken }); // In production, don't return token
});

// @desc    Reset password
// @route   POST /api/auth/reset-password
exports.resetPassword = asyncHandler(async (req, res) => {
  const { email, otp, newPassword } = req.body;

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || user.resetToken !== otp || new Date() > user.resetTokenExpiry) {
    return res.status(400).json({ success: false, message: 'Invalid or expired OTP' });
  }

  const hashedPassword = await bcrypt.hash(newPassword, 12);
  await prisma.user.update({
    where: { id: user.id },
    data: { password: hashedPassword, resetToken: null, resetTokenExpiry: null },
  });

  res.json({ success: true, message: 'Password reset successful' });
});

// @desc    Verify OTP
// @route   POST /api/auth/verify-otp
exports.verifyOtp = asyncHandler(async (req, res) => {
  const { email, otp } = req.body;
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user || user.otp !== otp || new Date() > user.otpExpiry) {
    return res.status(400).json({ success: false, message: 'Invalid or expired OTP' });
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { isVerified: true, otp: null, otpExpiry: null },
  });

  res.json({ success: true, message: 'Email verified successfully' });
});

// @desc    Update profile
// @route   PUT /api/auth/profile
exports.updateProfile = asyncHandler(async (req, res) => {
  const { name, phone, avatar } = req.body;

  const user = await prisma.user.update({
    where: { id: req.user.id },
    data: { name, phone, avatar },
  });

  res.json({ success: true, user: { id: user.id, name: user.name, email: user.email, role: user.role, avatar: user.avatar, phone: user.phone } });
});

// @desc    Logout
// @route   POST /api/auth/logout
exports.logout = asyncHandler(async (req, res) => {
  await prisma.user.update({ where: { id: req.user.id }, data: { refreshToken: null } });
  res.clearCookie('token');
  res.json({ success: true, message: 'Logged out' });
});
