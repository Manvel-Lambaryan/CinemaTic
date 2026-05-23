const User = require("../models/User");
const Payment = require("../models/Payment");
const { hashPassword, comparePassword } = require("./hash.service");
const { sendWelcomeEmail } = require("./mail.service");
const jwt = require("jsonwebtoken");
const env = require("../config/env");
const fs = require("fs");
const path = require("path");

const generateTokens = (user) => {
  const accessToken = jwt.sign(
    { id: user._id, role: user.role, username: user.name },
    env.jwt.accessSecret,
    { expiresIn: env.jwt.accessExpiration },
  );
  return { accessToken };
};

const register = async (name, email, password) => {
  const candidate = await User.findOne({ email });
  if (candidate) throw new Error("User with this email already exists");

  const hashed = await hashPassword(password);

  const user = await User.create({
    name,
    email,
    password: hashed,
    loginAttempts: 0,
  });

  sendWelcomeEmail(user.email, user.name).catch((err) =>
    console.error("Mail Error:", err),
  );

  return generateTokens(user);
};

const login = async (email, password) => {
  const user = await User.findOne({ email }).select(
    "+password +loginAttempts +lockUntil",
  );

  if (!user) throw new Error("Invalid email or password");

  const currentTime = Date.now();
  if (user.lockUntil && user.lockUntil > currentTime) {
    const remainingTime = Math.ceil((user.lockUntil - currentTime) / 1000);
    throw new Error(
      `Too many attempts. Account locked. Try again in ${remainingTime} seconds.`,
    );
  }

  const isMatch = await comparePassword(password, user.password);

  if (!isMatch) {
    const newAttempts = (user.loginAttempts || 0) + 1;

    if (newAttempts >= 3) {
      const lockTime = Date.now() + 3 * 60 * 1000;
      await User.updateOne(
        { _id: user._id },
        { $set: { lockUntil: lockTime, loginAttempts: 0 } },
      );
      throw new Error(
        "Too many attempts. Your account is blocked for 3 minutes.",
      );
    }

    await User.updateOne(
      { _id: user._id },
      { $set: { loginAttempts: newAttempts } },
    );

    throw new Error(
      `Invalid email or password. Attempts left: ${3 - newAttempts}`,
    );
  }

  await User.updateOne(
    { _id: user._id },
    {
      $set: { loginAttempts: 0 },
      $unset: { lockUntil: "" }, 
    },
  );

  return {
    ...generateTokens(user),
    user: {
      id: user._id,
      balance: user.balance,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  };
};

const getUserById = async (id) => {
  const user = await User.findById(id).select("-password");
  if (!user) throw new Error("User not found");
  return user;
};

const getUserAnalytics = async (id) => {
  const user = await User.findById(id).select("-password");
  if (!user) throw new Error("User not found");

  const payments = await Payment.find({ user: id });
  const bookings = payments.filter((p) => p.amount < 0);
  const deposits = payments.filter((p) => p.amount > 0);

  return {
    totalSpent: bookings.reduce((sum, p) => sum + Math.abs(p.amount), 0),
    totalDeposited: deposits.reduce((sum, p) => sum + p.amount, 0),
    totalBookings: bookings.length,
    totalTransactions: payments.length,
    currentBalance: user.balance,
    memberSince: user.createdAt,
  };
};

const changeEmail = async (userId, newEmail, currentPassword) => {
  const user = await User.findById(userId).select("+password");
  if (!user) throw new Error("User not found");

  if (user.password) {
    const isMatch = await comparePassword(currentPassword, user.password);
    if (!isMatch) throw new Error("Invalid password");
  }

  const existing = await User.findOne({ email: newEmail.toLowerCase().trim() });
  if (existing && existing._id.toString() !== userId) {
    throw new Error("Email already in use");
  }

  user.email = newEmail.toLowerCase().trim();
  await user.save();
  return await getUserById(userId);
};

const changePassword = async (userId, currentPassword, newPassword) => {
  const user = await User.findById(userId).select("+password");
  if (!user) throw new Error("User not found");
  if (!user.password) throw new Error("Password change is not available for this account");

  const isMatch = await comparePassword(currentPassword, user.password);
  if (!isMatch) throw new Error("Invalid current password");

  user.password = await hashPassword(newPassword);
  await user.save();
  return await getUserById(userId);
};

const changeAvatar = async (userId, avatarPath) => {
  const user = await User.findById(userId);
  if (!user) throw new Error("User not found");

  if (user.avatarUrl) {
    const oldPath = path.join(process.cwd(), "public", user.avatarUrl);
    if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
  }

  user.avatarUrl = avatarPath;
  await user.save();
  return await getUserById(userId);
};

const deleteAccount = async (userId, password) => {
  const user = await User.findById(userId).select("+password");
  if (!user) throw new Error("User not found");

  if (user.password) {
    const isMatch = await comparePassword(password, user.password);
    if (!isMatch) throw new Error("Invalid password");
  }

  if (user.avatarUrl) {
    const avatarPath = path.join(process.cwd(), "public", user.avatarUrl);
    if (fs.existsSync(avatarPath)) fs.unlinkSync(avatarPath);
  }

  await Payment.deleteMany({ user: userId });
  await User.findByIdAndDelete(userId);
};

module.exports = {
  register,
  login,
  getUserById,
  getUserAnalytics,
  changeEmail,
  changePassword,
  changeAvatar,
  deleteAccount,
};
