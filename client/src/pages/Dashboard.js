import React, { useEffect, useState } from "react";
import { auth } from "../firebase";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const [userData, setUserData] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      const token = await auth.currentUser.getIdToken();
      const res = await fetch(
        `http://localhost:5000/api/users/${auth.currentUser.uid}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const data = await res.json();
      setUserData(data);
    };
    fetchUser();
  }, []);

  const handleLogout = async () => {
    await auth.signOut();
    navigate("/login");
  };

  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <h1>Welcome, {userData?.name || "User"}</h1>
      <button onClick={handleLogout}>Logout</button>
    </div>
  );
};

export default Dashboard;
