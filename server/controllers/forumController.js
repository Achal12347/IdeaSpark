const Forum = require('../models/Forum');

exports.createForum = async (req, res) => {
  try {
    const { title, description } = req.body;
    const author = req.user.id;

    const newForum = new Forum({
      title,
      description,
      author,
    });

    await newForum.save();
    res.status(201).json(newForum);
  } catch (error) {
    res.status(500).json({ message: 'Error creating forum', error });
  }
};

exports.getForums = async (req, res) => {
  try {
    const forums = await Forum.find().populate('author', 'name email');
    res.json(forums);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching forums', error });
  }
};

exports.getForum = async (req, res) => {
  try {
    const { id } = req.params;
    const forum = await Forum.findById(id).populate('author', 'name email').populate('posts.author', 'name email');
    if (!forum) {
      return res.status(404).json({ message: 'Forum not found' });
    }
    res.json(forum);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching forum', error });
  }
};

exports.addPost = async (req, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;
    const author = req.user.id;

    const forum = await Forum.findById(id);
    if (!forum) {
      return res.status(404).json({ message: 'Forum not found' });
    }

    forum.posts.push({ content, author });
    await forum.save();
    res.json({ message: 'Post added successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error adding post', error });
  }
};
