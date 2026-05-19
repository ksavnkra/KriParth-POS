const User = require("../models/user");

const getUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: users });
  } catch (err) {
    console.error('Get users error:', err.message);
    res.status(500).json({ success: false, error: { message: 'Failed to fetch users.' } });
  }
};

const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const allowed = ['isActive', 'role', 'name', 'contact'];
    const data = {};
    allowed.forEach(k => { if (updates[k] !== undefined) data[k] = updates[k]; });

    const targetUser = await User.findById(id);
    if (!targetUser) return res.status(404).json({ success: false, error: { message: 'User not found' } });

    if (data.isActive === false && targetUser.role === 'admin') {
      if (req.user._id.toString() !== id) {
        return res.status(403).json({
          success: false,
          error: {
            code: "CANNOT_DEACTIVATE_OTHER_ADMIN",
            message: "Cannot deactivate other admin accounts. Admins can only deactivate themselves."
          }
        });
      }
      const activeAdminCount = await User.countDocuments({ role: 'admin', isActive: true });
      if (activeAdminCount <= 1) {
        return res.status(403).json({
          success: false,
          error: {
            code: "LAST_ADMIN",
            message: "Cannot deactivate — you are the only active admin. Promote another user first."
          }
        });
      }
    }

    if (data.role && data.role !== targetUser.role && targetUser.role === 'admin') {
      return res.status(403).json({
        success: false,
        error: {
          code: "CANNOT_CHANGE_ADMIN_ROLE",
          message: "Cannot change the role of admin accounts."
        }
      });
    }

    const user = await User.findByIdAndUpdate(id, data, { new: true }).select('-password');
    res.status(200).json({ success: true, data: user });
  } catch (err) {
    console.error('Update user error:', err.message);
    res.status(500).json({ success: false, error: { message: 'Failed to update user.' } });
  }
};

module.exports = { getUsers, updateUser };
