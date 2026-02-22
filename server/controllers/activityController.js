const Activity = require("../models/Activity");
const User = require("../models/User");

const getUserByFirebaseUid = (uid) => User.findOne({ firebaseUID: uid });

exports.getActivity = async (req, res) => {
  try {
    const user = await getUserByFirebaseUid(req.user.uid);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const { type, undismissed, limit } = req.query;
    const filter = { user: user._id };
    if (type) {
      filter.type = type;
    }
    if (undismissed === "true") {
      filter.isDismissed = false;
    }

    const max = Math.min(Number(limit) || 50, 200);
    const items = await Activity.find(filter)
      .sort({ createdAt: -1 })
      .limit(max)
      .lean();

    res.json(items);
  } catch (error) {
    res.status(500).json({ message: "Error fetching activity", error });
  }
};

exports.dismissActivity = async (req, res) => {
  try {
    const user = await getUserByFirebaseUid(req.user.uid);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const { id } = req.params;
    const { type, ids } = req.body || {};
    const filter = { user: user._id };

    if (id) {
      filter._id = id;
    } else if (Array.isArray(ids) && ids.length > 0) {
      filter._id = { $in: ids };
    }

    if (type) {
      filter.type = type;
    }

    const result = await Activity.updateMany(filter, { $set: { isDismissed: true } });
    res.json({ success: true, updated: result.modifiedCount || 0 });
  } catch (error) {
    res.status(500).json({ message: "Error dismissing activity", error });
  }
};
