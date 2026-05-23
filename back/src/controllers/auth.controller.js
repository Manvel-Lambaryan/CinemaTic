const authService = require("../services/auth.service");

const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const result = await authService.register(name, email, password);
    res.status(201).json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const result = await authService.login(email, password);

    res.json(result);
  } catch (error) {
    res.status(401).json({ error: error.message });
  }
};

const user = async (req, res) => {
  try {
    const userId = req.user.id;
    const currentUser = await authService.getUserById(userId);
    res.json(currentUser);
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
};

const deposit = async (req, res) => {
  try {
    const { userId, amount } = req.body;
    const user = await authService.findById(userId);
    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });

    user.balance += Number(amount);
    await user.save();

    res.status(200).json({
      success: true,
      newBalance: user.balance,
      message: "Deposit successful",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

const analytics = async (req, res) => {
  try {
    const data = await authService.getUserAnalytics(req.user.id);
    res.json({ data });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const changeEmail = async (req, res) => {
  try {
    const { email, currentPassword } = req.body;
    const updatedUser = await authService.changeEmail(
      req.user.id,
      email,
      currentPassword,
    );
    res.json({ data: updatedUser, message: "Email updated successfully" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    await authService.changePassword(req.user.id, currentPassword, newPassword);
    res.json({ message: "Password updated successfully" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const changeAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No avatar file provided" });
    }

    const avatarPath = `/uploads/avatars/${req.file.filename}`;
    const updatedUser = await authService.changeAvatar(req.user.id, avatarPath);
    res.json({ data: updatedUser, message: "Avatar updated successfully" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const deleteAccount = async (req, res) => {
  try {
    const { password } = req.body;
    await authService.deleteAccount(req.user.id, password);
    res.json({ message: "Account deleted successfully" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

module.exports = {
  register,
  login,
  user,
  deposit,
  analytics,
  changeEmail,
  changePassword,
  changeAvatar,
  deleteAccount,
};
