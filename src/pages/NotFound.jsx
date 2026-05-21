import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const NotFound = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const goHome = () => {
    const pages = { student: '/topics', teacher: '/my-topics', head: '/overview' };
    navigate(user ? pages[user.role] : '/login');
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      background: '#f5f5f5', textAlign: 'center', padding: 24,
    }}>
      <div style={{
        fontSize: 100, fontWeight: 800, lineHeight: 1,
        background: 'linear-gradient(135deg, #0F6E56, #2DD4BF)',
        WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
        marginBottom: 8,
      }}>
        404
      </div>
      <div style={{ fontSize: 22, fontWeight: 600, color: '#333', marginBottom: 8 }}>
        Không tìm thấy trang
      </div>
      <p style={{ color: '#888', fontSize: 14, marginBottom: 28, maxWidth: 360 }}>
        Trang bạn tìm kiếm không tồn tại hoặc đã bị xoá.
      </p>
      <button onClick={goHome} style={{
        padding: '11px 28px', background: 'linear-gradient(135deg, #0F6E56, #1D9E75)',
        color: 'white', border: 'none', borderRadius: 10,
        fontSize: 14, fontWeight: 600, cursor: 'pointer',
        boxShadow: '0 4px 12px rgba(29,158,117,0.3)',
      }}>
        Về trang chủ
      </button>
    </div>
  );
};

export default NotFound;