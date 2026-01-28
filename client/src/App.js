import React from "react";
import { Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import LandingPage from "./pages/LandingPage";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ForgotPassword from "./pages/ForgotPassword";
import Dashboard from "./pages/Dashboard";
import ProfileSetup from "./pages/ProfileSetup";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminRoute from "./components/AdminRoute";
import AdminDashboard from "./pages/AdminDashboard";
import AuthRoute from "./components/AuthRoute";
import Ideas from "./pages/Ideas";
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

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
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
      </Routes>
    </AuthProvider>
  );
}

export default App;
