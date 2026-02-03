const ContactMessage = require("../models/ContactMessage");

const isValidEmail = (email) => /\S+@\S+\.\S+/.test(email);

exports.createContactMessage = async (req, res) => {
  try {
    const { name, email, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({ message: "All fields are required." });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({ message: "Please enter a valid email." });
    }

    const contactMessage = await ContactMessage.create({
      name,
      email,
      message,
    });

    res.status(201).json({
      message: "Thanks! Your message has been received.",
      id: contactMessage._id,
    });
  } catch (error) {
    res.status(500).json({ message: "Error submitting contact form." });
  }
};

exports.getContactMessages = async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit, 10) || 50, 200);
    const messages = await ContactMessage.find()
      .sort({ createdAt: -1 })
      .limit(limit);

    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: "Error fetching contact messages." });
  }
};
