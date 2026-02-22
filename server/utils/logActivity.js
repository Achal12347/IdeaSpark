const Activity = require("../models/Activity");

const logActivity = async ({
  userId,
  type,
  title,
  message,
  link,
  metadata,
  io,
}) => {
  if (!userId || !type) return null;
  try {
    const activity = await Activity.create({
      user: userId,
      type,
      title,
      message,
      link,
      metadata,
    });
    if (io) {
      io.emit("activityUpdated", { userId: userId.toString() });
    }
    return activity;
  } catch (error) {
    console.error("Activity log error:", error);
    return null;
  }
};

module.exports = logActivity;
