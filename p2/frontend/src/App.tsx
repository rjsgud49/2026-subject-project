import { Routes, Route, Navigate } from 'react-router-dom';
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
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers from './pages/admin/AdminUsers';
import AdminCourses from './pages/admin/AdminCourses';
import TeacherDashboard from './pages/teacher/TeacherDashboard';
import TeacherCourses from './pages/teacher/TeacherCourses';
import TeacherCourseForm from './pages/teacher/TeacherCourseForm';
import TeacherProfile from './pages/teacher/TeacherProfile';
import TeacherSettlement from './pages/teacher/TeacherSettlement';
import TeacherFeedback from './pages/teacher/TeacherFeedback';
import StudentDashboard from './pages/student/StudentDashboard';
import StudentBrowse from './pages/student/StudentBrowse';
import StudentMyCourses from './pages/student/StudentMyCourses';
import StudentFeedbackNew from './pages/student/StudentFeedbackNew';
import StudentFeedbackList from './pages/student/StudentFeedbackList';

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
            <ProtectedRoute roles={['student']}>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/learn/:enrollmentId"
          element={
            <ProtectedRoute roles={['student']}>
              <VideoPlayerPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin"
          element={
            <ProtectedRoute roles={['admin']}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/users"
          element={
            <ProtectedRoute roles={['admin']}>
              <AdminUsers />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/courses"
          element={
            <ProtectedRoute roles={['admin']}>
              <AdminCourses />
            </ProtectedRoute>
          }
        />

        <Route
          path="/teacher"
          element={
            <ProtectedRoute roles={['teacher']}>
              <TeacherDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/teacher/courses"
          element={
            <ProtectedRoute roles={['teacher']}>
              <TeacherCourses />
            </ProtectedRoute>
          }
        />
        <Route
          path="/teacher/courses/new"
          element={
            <ProtectedRoute roles={['teacher']}>
              <TeacherCourseForm />
            </ProtectedRoute>
          }
        />
        <Route
          path="/teacher/courses/:courseId/edit"
          element={
            <ProtectedRoute roles={['teacher']}>
              <TeacherCourseForm />
            </ProtectedRoute>
          }
        />
        <Route
          path="/teacher/feedback"
          element={
            <ProtectedRoute roles={['teacher']}>
              <TeacherFeedback />
            </ProtectedRoute>
          }
        />
        <Route
          path="/teacher/profile"
          element={
            <ProtectedRoute roles={['teacher']}>
              <TeacherProfile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/teacher/settlement"
          element={
            <ProtectedRoute roles={['teacher']}>
              <TeacherSettlement />
            </ProtectedRoute>
          }
        />

        <Route
          path="/student"
          element={
            <ProtectedRoute roles={['student']}>
              <StudentDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/browse"
          element={
            <ProtectedRoute roles={['student']}>
              <StudentBrowse />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/my"
          element={
            <ProtectedRoute roles={['student']}>
              <StudentMyCourses />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/feedback"
          element={
            <ProtectedRoute roles={['student']}>
              <StudentFeedbackList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/feedback/new"
          element={
            <ProtectedRoute roles={['student']}>
              <StudentFeedbackNew />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
