import { useState } from "react";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../firebase";
import { Link } from "react-router-dom";
import "../styles/ForgotPassword.css";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleReset = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");
    setLoading(true);

    try {
      await sendPasswordResetEmail(auth, email);
      setMessage("We’ve sent a password reset link to your email.");
    } catch (err) {
      setError("Unable to send reset email. Please check your email address.");
    }

    setLoading(false);
  };

  return (
    <div className="fp-wrapper">
      <form className="fp-card" onSubmit={handleReset}>
        <h1>Forgot Password</h1>
        <p className="subtitle">
          Enter your registered email and we’ll send you a reset link.
        </p>

        {message && <div className="fp-success">{message}</div>}
        {error && <div className="fp-error">{error}</div>}

        <input
          type="email"
          placeholder="Email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <button type="submit" disabled={loading}>
          {loading ? "Sending..." : "Send Reset Link"}
        </button>

        <div className="fp-footer">
          <Link to="/login">← Back to Login</Link>
        </div>
      </form>
    </div>
  );
}
