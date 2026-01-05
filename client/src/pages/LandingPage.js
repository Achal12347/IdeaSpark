import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import "../styles/LandingPage.css";

const LandingPage = () => {
  return (
    <div className="landing-container">
      <div className="overlay"></div>

      <motion.div
        className="landing-content"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <motion.h1
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          IdeaSpark 🚀
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          A platform where innovators, startups, and investors connect to turn
          ideas into reality.
        </motion.p>

        <motion.div
          className="button-group"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
        >
          <Link to="/login">
            <motion.button
              className="btn login-btn"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Login
            </motion.button>
          </Link>

          <Link to="/signup">
            <motion.button
              className="btn signup-btn"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Sign Up
            </motion.button>
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default LandingPage;
