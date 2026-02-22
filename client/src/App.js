import React, { useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { useAuth } from "./context/AuthContext";
import { fetchUserProfile } from "./services/userService";
import LandingPage from "./pages/LandingPage";
import AboutUs from "./pages/AboutUs";
import FeaturesPage from "./pages/FeaturesPage";
import PricingPage from "./pages/PricingPage";
import ContactPage from "./pages/ContactPage";
import FaqPage from "./pages/FaqPage";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ForgotPassword from "./pages/ForgotPassword";
import Dashboard from "./pages/Dashboard";
import ProfileSetup from "./pages/ProfileSetup";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminRoute from "./components/AdminRoute";
import AdminDashboard from "./pages/AdminDashboard";
import AuthRoute from "./components/AuthRoute";
import PublicRoute from "./components/PublicRoute";
import Ideas from "./pages/Ideas";
import Investors from "./pages/Investors";
import PostIdea from "./pages/PostIdea";
import IdeaDetails from "./pages/IdeaDetails";
import Profile from "./pages/Profile";
import Teams from "./pages/Teams";
import Hackathons from "./pages/Hackathons";
import InvestorDashboard from "./pages/InvestorDashboard";
import TeamChat from "./pages/TeamChat";
import Bookmarks from "./pages/Bookmarks";
import Activity from "./pages/Activity";
import Members from "./pages/Members";
import TrendingIdeas from "./pages/TrendingIdeas";
import WeeklyStats from "./pages/WeeklyStats";
import SuggestedCollaborators from "./pages/SuggestedCollaborators";
import Settings from "./pages/Settings";
import Reports from "./pages/Reports";
import MyIdeas from "./pages/MyIdeas";
import Privacy from "./pages/Privacy";
import Messages from "./pages/Messages";
import AccountDeleted from "./pages/AccountDeleted";
import Analytics from "./pages/Analytics";
import Unauthorized from "./pages/Unauthorized";

function ThemeSync() {
  const { currentUser, loading } = useAuth();

  useEffect(() => {
    const syncTheme = async () => {
      if (loading) return;
      if (!currentUser) {
        document.documentElement.removeAttribute("data-theme");
        return;
      }
      try {
        const profile = await fetchUserProfile();
        const theme = profile?.appearanceSettings?.theme || "light";
        document.documentElement.setAttribute("data-theme", theme);
      } catch (error) {
        console.error("Unable to sync theme:", error);
      }
    };
    syncTheme();
  }, [currentUser, loading]);

  return null;
}

function App() {
  return (
    <AuthProvider>
      <ThemeSync />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/about" element={<AboutUs />} />
        <Route path="/features" element={<FeaturesPage />} />
        <Route path="/pricing" element={<PricingPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/faq" element={<FaqPage />} />
        <Route
          path="/login"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />
        <Route
          path="/signup"
          element={
            <PublicRoute>
              <Signup />
            </PublicRoute>
          }
        />
        <Route
          path="/forgot-password"
          element={
            <PublicRoute>
              <ForgotPassword />
            </PublicRoute>
          }
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile-setup"
          element={
            <AuthRoute>
              <ProfileSetup />
            </AuthRoute>
          }
        />
        <Route
          path="/admin/dashboard"
          element={
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          }
        />
        <Route
          path="/ideas"
          element={
            <ProtectedRoute>
              <Ideas />
            </ProtectedRoute>
          }
        />
        <Route
          path="/investors"
          element={
            <ProtectedRoute>
              <Investors />
            </ProtectedRoute>
          }
        />
        <Route
          path="/my-ideas"
          element={
            <ProtectedRoute>
              <MyIdeas />
            </ProtectedRoute>
          }
        />
        <Route
          path="/add-idea"
          element={
            <ProtectedRoute>
              <PostIdea />
            </ProtectedRoute>
          }
        />
        <Route
          path="/idea/:id"
          element={
            <ProtectedRoute>
              <IdeaDetails />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/teams"
          element={
            <ProtectedRoute>
              <Teams />
            </ProtectedRoute>
          }
        />
        <Route
          path="/hackathons"
          element={
            <ProtectedRoute>
              <Hackathons />
            </ProtectedRoute>
          }
        />
        <Route
          path="/investor/dashboard"
          element={
            <ProtectedRoute>
              <InvestorDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/team-chat"
          element={
            <ProtectedRoute>
              <TeamChat />
            </ProtectedRoute>
          }
        />
        <Route
          path="/bookmarks"
          element={
            <ProtectedRoute>
              <Bookmarks />
            </ProtectedRoute>
          }
        />
        <Route
          path="/activity"
          element={
            <ProtectedRoute>
              <Activity />
            </ProtectedRoute>
          }
        />
        <Route
          path="/members"
          element={
            <ProtectedRoute>
              <Members />
            </ProtectedRoute>
          }
        />
        <Route
          path="/trending-ideas"
          element={
            <ProtectedRoute>
              <TrendingIdeas />
            </ProtectedRoute>
          }
        />
        <Route
          path="/weekly-stats"
          element={
            <ProtectedRoute>
              <WeeklyStats />
            </ProtectedRoute>
          }
        />
        <Route
          path="/suggested-collaborators"
          element={
            <ProtectedRoute>
              <SuggestedCollaborators />
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <Settings />
            </ProtectedRoute>
          }
        />
        <Route
          path="/reports"
          element={
            <AdminRoute>
              <Reports />
            </AdminRoute>
          }
        />
        <Route
          path="/analytics"
          element={
            <AdminRoute>
              <Analytics />
            </AdminRoute>
          }
        />
        <Route
          path="/explore"
          element={
            <PublicRoute>
              <Unauthorized />
            </PublicRoute>
          }
        />
        <Route
          path="/messages"
          element={
            <ProtectedRoute>
              <Messages />
            </ProtectedRoute>
          }
        />
        <Route path="/account-deleted" element={<AccountDeleted />} />
        <Route path="/privacy" element={<Privacy />} />
      </Routes>
    </AuthProvider>
  );
}

export default App;
