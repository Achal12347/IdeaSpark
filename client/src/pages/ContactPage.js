import React, { useState } from "react";
import MarketingLayout from "../components/MarketingLayout";
import "../styles/LandingPage.css";

const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [status, setStatus] = useState({ type: "", message: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const apiBaseUrl = process.env.REACT_APP_API_URL;

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setStatus({ type: "", message: "" });

    if (!apiBaseUrl) {
      setStatus({
        type: "error",
        message: "Missing API URL. Please configure REACT_APP_API_URL.",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch(`${apiBaseUrl}/api/contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Unable to submit your message.");
      }

      setStatus({ type: "success", message: data.message });
      setFormData({ name: "", email: "", message: "" });
    } catch (error) {
      setStatus({
        type: "error",
        message: error.message || "Something went wrong. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <MarketingLayout>
      <section className="page-hero">
        <span className="eyebrow">Contact</span>
        <h1>Talk with the IdeaSpark team.</h1>
        <p>
          We are here to help founders, investors, and community partners build
          the right program for their goals.
        </p>
      </section>

      <section className="page-section">
        <div className="contact-grid">
          <div className="contact-card">
            <h3>Headquarters</h3>
            <p>IdeaSpark Labs</p>
            <p>San Francisco, CA</p>
            <p>hello@ideaspark.com</p>
          </div>
          <div className="contact-card">
            <h3>Community</h3>
            <p>Mentor matching</p>
            <p>Investor relations</p>
            <p>University programs</p>
          </div>
          <div className="contact-card">
            <h3>Send a message</h3>
            <form className="contact-form" onSubmit={handleSubmit}>
              <input
                type="text"
                name="name"
                placeholder="Your name"
                value={formData.name}
                onChange={handleChange}
                required
              />
              <input
                type="email"
                name="email"
                placeholder="Email address"
                value={formData.email}
                onChange={handleChange}
                required
              />
              <textarea
                name="message"
                placeholder="Tell us about your goals"
                value={formData.message}
                onChange={handleChange}
                required
              ></textarea>
              <button className="primary-btn" type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Sending..." : "Submit"}
              </button>
              {status.message ? (
                <p className={`form-status ${status.type}`}>{status.message}</p>
              ) : null}
            </form>
          </div>
        </div>
      </section>
    </MarketingLayout>
  );
};

export default ContactPage;
