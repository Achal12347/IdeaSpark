import "../styles/appPageTheme.css";

export default function Privacy() {
  return (
    <div className="app-page">
      <div className="app-container">
        <div className="app-header">
          <div>
            <h1 className="app-title">Privacy & Terms</h1>
            <p className="app-subtitle">
              How IdeaSpark handles your data and platform usage.
            </p>
          </div>
        </div>

        <section id="privacy" className="app-card">
          <h3>Privacy Policy</h3>
          <p>
            We collect only the information you share to help you collaborate,
            showcase ideas, and connect with teams or investors. Your profile
            details are visible to other users based on your activity. We never
            sell your data.
          </p>
          <p>
            You can update or remove your profile info at any time in Settings
            or Profile.
          </p>
        </section>

        <section id="terms" className="app-card">
          <h3>Terms of Use</h3>
          <p>
            By using IdeaSpark, you agree to post respectful content and keep
            your ideas authentic. Collaboration requests and investor offers are
            handled directly between users.
          </p>
          <p>
            IdeaSpark does not guarantee funding or partnership outcomes. Please
            verify all offers independently.
          </p>
        </section>
      </div>
    </div>
  );
}
