import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';

import Login from './pages/Login';
import Register from './pages/Register';
import TopicList from './pages/student/TopicList';
import MyRegistration from './pages/student/MyRegistration';
import MyTopics from './pages/teacher/MyTopics';
import PostTopic from './pages/teacher/PostTopic';
import PendingRegs from './pages/teacher/PendingRegs';
import Overview from './pages/head/Overview';
import Council from './pages/head/Council';
import ExportList from './pages/head/ExportList';
import EditTopic from './pages/teacher/EditTopic';
import PendingTopics from './pages/head/PendingTopics';
import NotFound from './pages/NotFound';
import Profile from './pages/Profile';
import ChangePassword from './pages/ChangePassword';
import FormBM02 from './pages/student/FormBM02';
import MyForms from './pages/student/MyForms';
import FormBM04 from './pages/student/FormBM04';
import FormBM08 from './pages/student/FormBM08';
import FormSubmissions from './pages/teacher/FormSubmissions';
import FormDetail from './pages/teacher/FormDetail';
import FormProgress from './pages/student/FormProgress';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster position="top-right" />
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Student routes */}
          <Route path="/topics" element={
            <ProtectedRoute role="student">
              <Navbar /><TopicList />
            </ProtectedRoute>
          } />
          <Route path="/my-registration" element={
            <ProtectedRoute role="student">
              <Navbar /><MyRegistration />
            </ProtectedRoute>
          } />

          {/* Teacher routes */}
          <Route path="/my-topics" element={
            <ProtectedRoute role="teacher">
              <Navbar /><MyTopics />
            </ProtectedRoute>
          } />
          <Route path="/post-topic" element={
            <ProtectedRoute role="teacher">
              <Navbar /><PostTopic />
            </ProtectedRoute>
          } />
          <Route path="/pending-regs" element={
            <ProtectedRoute role="teacher">
              <Navbar /><PendingRegs />
            </ProtectedRoute>
          } />

          {/* Head routes */}
          <Route path="/overview" element={
            <ProtectedRoute role="head">
              <Navbar /><Overview />
            </ProtectedRoute>
          } />
          <Route path="/council" element={
            <ProtectedRoute role="head">
              <Navbar /><Council />
            </ProtectedRoute>
          } />
          <Route path="/export" element={
            <ProtectedRoute role="head">
              <Navbar /><ExportList />
            </ProtectedRoute>
          } />
          <Route path="/my-forms" element={
  <ProtectedRoute role="student">
    <Navbar /><MyForms />
  </ProtectedRoute>
} />
<Route path="/form-bm02" element={
  <ProtectedRoute role="student">
    <Navbar /><FormBM02 />
  </ProtectedRoute>
} />

<Route path="/form-bm04" element={
  <ProtectedRoute role="student">
    <Navbar /><FormBM04 />
  </ProtectedRoute>
} />

<Route path="/upload-bm08" element={
  <ProtectedRoute role="student">
    <Navbar /><FormBM08 />
  </ProtectedRoute>
} />

<Route path="/form-submissions" element={
  <ProtectedRoute role="teacher">
    <Navbar /><FormSubmissions />
  </ProtectedRoute>
} />

<Route path="/form-detail/:id" element={
  <ProtectedRoute role="teacher">
    <Navbar /><FormDetail />
  </ProtectedRoute>
} />

// Student xem tiến độ của mình
<Route path="/my-progress" element={
  <ProtectedRoute role="student">
    <Navbar /><FormProgress role="student" />
  </ProtectedRoute>
} />

<Route
  path="/form-progress"
  element={
    <ProtectedRoute roles={['teacher', 'head']}>
      <Navbar />
      <FormProgress role="teacher" />
    </ProtectedRoute>
  }
/>

          <Route path="/profile" element={
  <ProtectedRoute>
    <Navbar /><Profile />
  </ProtectedRoute>
} />
<Route path="/change-password" element={
  <ProtectedRoute>
    <Navbar /><ChangePassword />
  </ProtectedRoute>
} />
          <Route path="/edit-topic/:id" element={
  <ProtectedRoute role="teacher">
    <Navbar /><EditTopic />
  </ProtectedRoute>
} />

<Route path="/pending-topics" element={
  <ProtectedRoute role="head">
    <Navbar /><PendingTopics />
  </ProtectedRoute>
} />
<Route path="*" element={<NotFound />} />
          {/* Redirect về trang phù hợp */}
          <Route path="/" element={<Navigate to="/login" />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;