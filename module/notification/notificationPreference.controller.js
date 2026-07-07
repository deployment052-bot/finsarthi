
import NotificationPreference from "./notification-preference.model.js";

/**
 * GET /notification-preferences
 */
export const getPreferences = async (
  req,
  res
) => {
  try {
    let preference =
      await NotificationPreference.findOne({
        user: req.user._id,
      });

    if (!preference) {
      preference =
        await NotificationPreference.create({
          user: req.user._id,
        });
    }

    return res.status(200).json({
      success: true,
      data: preference,
    });
  } catch (error) {
    console.error(
      "Get Preferences Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * PATCH /notification-preferences
 */
export const updatePreferences =
  async (req, res) => {
    try {
      const preference =
        await NotificationPreference.findOneAndUpdate(
          {
            user: req.user._id,
          },
          req.body,
          {
            new: true,
            upsert: true,
            runValidators: true,
          }
        );

      return res.status(200).json({
        success: true,
        message:
          "Preferences updated successfully",
        data: preference,
      });
    } catch (error) {
      console.error(
        "Update Preferences Error:",
        error
      );

      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  };

/**
 * PATCH /notification-preferences/enable-all
 */
export const enableAllNotifications =
  async (req, res) => {
    try {
      const preference =
        await NotificationPreference.findOneAndUpdate(
          {
            user: req.user._id,
          },
          {
            pushEnabled: true,
            emiReminders: true,
            paymentAlerts: true,
            savingGoalUpdates: true,
            loanUpdates: true,
            creditScoreUpdates: true,
            transactionAlerts: true,
            promotionalOffers: true,
            dailySummary: true,
            weeklySummary: true,
            monthlySummary: true,
          },
          {
            new: true,
            upsert: true,
          }
        );

      return res.status(200).json({
        success: true,
        message:
          "All notifications enabled",
        data: preference,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  };

/**
 * PATCH /notification-preferences/disable-all
 */
export const disableAllNotifications =
  async (req, res) => {
    try {
      const preference =
        await NotificationPreference.findOneAndUpdate(
          {
            user: req.user._id,
          },
          {
            pushEnabled: false,
            emiReminders: false,
            paymentAlerts: false,
            savingGoalUpdates: false,
            loanUpdates: false,
            creditScoreUpdates: false,
            transactionAlerts: false,
            promotionalOffers: false,
            dailySummary: false,
            weeklySummary: false,
            monthlySummary: false,
          },
          {
            new: true,
            upsert: true,
          }
        );

      return res.status(200).json({
        success: true,
        message:
          "All notifications disabled",
        data: preference,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  };

