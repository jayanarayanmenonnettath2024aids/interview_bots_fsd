import { Navigate, Route, Routes } from 'react-router-dom';
import AppShell from '@/components/layout/AppShell';
import ProtectedRoute from '@/components/layout/ProtectedRoute';
import { useAuth } from '@/context/AuthContext';
import LoginPage from '@/pages/LoginPage';
import RegisterPage from '@/pages/RegisterPage';
import DashboardPage from '@/pages/DashboardPage';
import MockInterviewPage from '@/pages/MockInterviewPage';
import InterviewSessionPage from '@/pages/InterviewSessionPage';
import PerformancePage from '@/pages/PerformancePage';
import FeedbackPage from '@/pages/FeedbackPage';
import QuestionBankPage from '@/pages/QuestionBankPage';
import ProfilePage from '@/pages/ProfilePage';
import SettingsPage from '@/pages/SettingsPage';

function RootRedirect() {
  const { isAuthenticated } = useAuth();
  return <Navigate to={isAuthenticated ? '/dashboard' : '/auth/login'} replace />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<RootRedirect />} />
      <Route path="/auth/login" element={<LoginPage />} />
      <Route path="/auth/register" element={<RegisterPage />} />

      <Route
        element={
          <ProtectedRoute>
            <AppShell />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/mock-interviews" element={<MockInterviewPage />} />
        <Route path="/interview/session" element={<InterviewSessionPage />} />
        <Route path="/performance" element={<PerformancePage />} />
        <Route path="/feedback" element={<FeedbackPage />} />
        <Route path="/question-bank" element={<QuestionBankPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
