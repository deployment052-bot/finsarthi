import User from "../User/models.js";

export const getSettings = async (req, res) => {
  const user = await User.findById(req.user.id);

  res.json({
    success: true,
    settings: user.settings
  });
};

export const updateSettings = async (req, res) => {
  try {
    const allowedFields = [
      "biometricEnabled",
      "emailNotification",
      "pushNotification",
    ];

    const updates = {};

    for (const key of allowedFields) {
      if (typeof req.body[key] === "boolean") {
        updates[`settings.${key}`] = req.body[key];
      }
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: updates },
      { new: true }
    );

    return res.status(200).json({
      success: true,
      settings: user.settings,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};