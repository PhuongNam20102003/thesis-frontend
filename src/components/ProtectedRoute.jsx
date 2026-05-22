import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, role }) => {
  const { user, loading } = useAuth();

  if (loading) return <div style={{ padding: 32 }}>Đang tải...</div>;

  if (!user) return <Navigate to="/login" />;

  if (role && user.role !== role) {
    // Điều hướng về trang đúng của từng role
    const homePages = { student: '/topics', teacher: '/my-topics', head: '/overview', admin:'/admin/users'};
    return <Navigate to={homePages[user.role] || '/login'} />;
  }

  return children;
};

export default ProtectedRoute;