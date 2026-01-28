import { useState, useEffect } from "react";
import apiRequest from "../services/api";

export default function Forums() {
  const [forums, setForums] = useState([]);
  const [selectedForum, setSelectedForum] = useState(null);
  const [newForumTitle, setNewForumTitle] = useState('');
  const [newForumDescription, setNewForumDescription] = useState('');
  const [newPost, setNewPost] = useState('');

  useEffect(() => {
    loadForums();
  }, []);

  const loadForums = async () => {
    try {
      const data = await apiRequest('/api/forums');
      setForums(data);
    } catch (error) {
      console.error("Error loading forums:", error);
    }
  };

  const handleCreateForum = async () => {
    if (!newForumTitle.trim() || !newForumDescription.trim()) return;
    try {
      await apiRequest('/api/forums', 'POST', { title: newForumTitle, description: newForumDescription });
      setNewForumTitle('');
      setNewForumDescription('');
      loadForums();
    } catch (error) {
      console.error("Error creating forum:", error);
    }
  };

  const handleSelectForum = async (forumId) => {
    try {
      const data = await apiRequest(`/api/forums/${forumId}`);
      setSelectedForum(data);
    } catch (error) {
      console.error("Error loading forum:", error);
    }
  };

  const handleAddPost = async () => {
    if (!newPost.trim() || !selectedForum) return;
    try {
      await apiRequest(`/api/forums/${selectedForum._id}/posts`, 'POST', { content: newPost });
      setNewPost('');
      handleSelectForum(selectedForum._id); // Refresh forum
    } catch (error) {
      console.error("Error adding post:", error);
    }
  };

  return (
    <div className="forums-page">
      <h2>Public Forums</h2>
      <div className="create-forum">
        <h3>Create New Forum</h3>
        <input
          type="text"
          placeholder="Forum Title"
          value={newForumTitle}
          onChange={(e) => setNewForumTitle(e.target.value)}
        />
        <textarea
          placeholder="Forum Description"
          value={newForumDescription}
          onChange={(e) => setNewForumDescription(e.target.value)}
        />
        <button onClick={handleCreateForum}>Create Forum</button>
      </div>
      <div className="forums-list">
        <h3>Forums</h3>
        {forums.map((forum) => (
          <div key={forum._id} className="forum-item" onClick={() => handleSelectForum(forum._id)}>
            <h4>{forum.title}</h4>
            <p>{forum.description}</p>
            <small>By {forum.author?.name} on {new Date(forum.createdAt).toLocaleDateString()}</small>
          </div>
        ))}
      </div>
      {selectedForum && (
        <div className="forum-details">
          <h3>{selectedForum.title}</h3>
          <p>{selectedForum.description}</p>
          <div className="posts">
            {selectedForum.posts?.map((post, index) => (
              <div key={index} className="post">
                <p>{post.content}</p>
                <small>By {post.author?.name} on {new Date(post.createdAt).toLocaleDateString()}</small>
              </div>
            ))}
          </div>
          <div className="add-post">
            <textarea
              placeholder="Add a post..."
              value={newPost}
              onChange={(e) => setNewPost(e.target.value)}
            />
            <button onClick={handleAddPost}>Post</button>
          </div>
        </div>
      )}
    </div>
  );
}
