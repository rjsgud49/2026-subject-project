import { Routes, Route } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import ProtectedRoute from './components/ProtectedRoute';
import Landing from './pages/Landing';
import CourseList from './pages/CourseList';
import CourseDetail from './pages/CourseDetail';
import VideoPlayerPage from './pages/VideoPlayerPage';
import Dashboard from './pages/Dashboard';
import Cart from './pages/Cart';
import CheckoutComplete from './pages/CheckoutComplete';
import QuestionNew from './pages/QuestionNew';
import QuestionDetail from './pages/QuestionDetail';
import QuestionEdit from './pages/QuestionEdit';
import Login from './pages/Login';
import Signup from './pages/Signup';
import FeedbackMain from './pages/FeedbackMain';
import FeedbackBuy from './pages/FeedbackBuy';
import FeedbackNew from './pages/FeedbackNew';
import FeedbackHistory from './pages/FeedbackHistory';
import InstructorProfile from './pages/InstructorProfile';

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route element={<MainLayout />}>
        <Route path="/" element={<Landing />} />
        <Route path="/courses" element={<CourseList />} />
        <Route path="/courses/:courseId" element={<CourseDetail />} />
        <Route
          path="/courses/:courseId/questions/new"
          element={
            <ProtectedRoute>
              <QuestionNew />
            </ProtectedRoute>
          }
        />
        <Route path="/questions/:questionId" element={<QuestionDetail />} />
        <Route
          path="/questions/:questionId/edit"
          element={
            <ProtectedRoute>
              <QuestionEdit />
            </ProtectedRoute>
          }
        />
        <Route
          path="/cart"
          element={
            <ProtectedRoute>
              <Cart />
            </ProtectedRoute>
          }
        />
        <Route path="/checkout/complete" element={<CheckoutComplete />} />
        <Route path="/instructors/:name" element={<InstructorProfile />} />
        <Route path="/feedback" element={<FeedbackMain />} />
        <Route path="/feedback/buy" element={<FeedbackBuy />} />
        <Route path="/feedback/new" element={<FeedbackNew />} />
        <Route path="/feedback/history" element={<FeedbackHistory />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/learn/:enrollmentId"
          element={
            <ProtectedRoute>
              <VideoPlayerPage />
            </ProtectedRoute>
          }
        />
      </Route>
    </Routes>
  );
}

