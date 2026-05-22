import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import NotificationBell from './Notificationbell';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
    setMenuOpen(false);
  };

  const navLinks = {
    student: [
      { path: '/topics', label: 'Danh sách đề tài'},
      { path: '/my-registration', label: 'Đề tài của tôi' },
      { path: '/my-forms', label: 'Biểu mẫu khóa luận' },
      { path: '/my-progress', label: 'Tiến độ khóa luận' },
      { path: '/profile', label: 'Thông tin cá nhân' },
      { path: '/change-password', label: 'Đổi mật khẩu' },
    ],
    teacher: [
      { path: '/my-topics', label: 'Đề tài của tôi' },
      { path: '/post-topic', label: 'Đăng đề tài' },
      { path: '/pending-regs', label: 'Chờ duyệt' },
      { path: '/form-submissions', label: 'Duyệt biểu mẫu'},
      { path: '/form-progress', label: 'Tiến độ sinh viên' },
      { path: '/profile', label: 'Thông tin cá nhân' },
      { path: '/change-password', label: 'Đổi mật khẩu' },
    ],
    head: [
      { path: '/overview', label: 'Tổng quan' },
      { path: '/pending-topics', label: 'Duyệt đề tài' },
      { path: '/form-progress', label: 'Theo dõi tiến độ' },
      { path: '/council', label: 'Phân công hội đồng' },
      { path: '/export', label: 'Xuất danh sách' },
      { path: '/profile', label: 'Thông tin cá nhân' },
      { path: '/change-password', label: 'Đổi mật khẩu' },
    ],
    admin: [
  { path: '/admin/users',     label: 'Quản lý tài khoản' },
  { path: '/profile',         label: 'Thông tin cá nhân' },
  { path: '/change-password', label: 'Đổi mật khẩu' },
],
  };

  const roleLabel = { student: 'Sinh viên', teacher: 'Giảng viên', head: 'Trưởng ngành', admin: 'Quản trị viên' };
  const links = navLinks[user?.role] || [];

  return (
    <>
      {/* Topbar */}
      <nav style={{
        background: 'white', borderBottom: '1px solid #eee',
        padding: '0 20px', display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', height: 56,
        position: 'sticky', top: 0, zIndex: 100,
        boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
      }}>
        {/* Hamburger + Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              padding: 6, borderRadius: 8, display: 'flex', flexDirection: 'column',
              gap: 5, transition: 'background 0.15s',
            }}
            onMouseEnter={e => e.currentTarget.style.background = '#f5f5f5'}
            onMouseLeave={e => e.currentTarget.style.background = 'none'}
          >
            {[0, 1, 2].map(i => (
              <span key={i} style={{
                display: 'block', width: 22, height: 2,
                background: menuOpen ? '#1D9E75' : '#555',
                borderRadius: 2,
                transform: menuOpen
                  ? i === 0 ? 'translateY(7px) rotate(45deg)'
                  : i === 2 ? 'translateY(-7px) rotate(-45deg)'
                  : 'scaleX(0)'
                  : 'none',
                transition: 'all 0.25s ease',
                transformOrigin: 'center',
              }} />
            ))}
          </button>

          <span style={{ fontWeight: 700, color: '#1D9E75', fontSize: 18, letterSpacing: -0.5 }}>
            EduThesis
          </span>
        </div>

        {/* User info + Bell */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>

          {/* 🔔 Notification Bell */}
          <NotificationBell />

          {/* Divider */}
          <div style={{ width: 1, height: 24, background: '#e5e7eb', margin: '0 4px' }} />

          {/* Tên + role */}
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#333' }}>{user?.full_name}</div>
            <div style={{ fontSize: 11, color: '#aaa' }}>{roleLabel[user?.role]}</div>
          </div>

          {/* Avatar */}
          <div style={{
            width: 36, height: 36, borderRadius: '50%',
            background: 'linear-gradient(135deg, #0F6E56, #1D9E75)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'white', fontWeight: 700, fontSize: 14,
          }}>
            {user?.full_name?.charAt(0).toUpperCase()}
          </div>
        </div>
      </nav>

      {/* Overlay */}
      {menuOpen && (
        <div
          onClick={() => setMenuOpen(false)}
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.3)',
            zIndex: 150, backdropFilter: 'blur(2px)',
          }}
        />
      )}

      {/* Sidebar drawer */}
      <div style={{
        position: 'fixed', top: 0, left: 0, bottom: 0,
        width: 280, background: 'white',
        zIndex: 200, boxShadow: '4px 0 20px rgba(0,0,0,0.1)',
        transform: menuOpen ? 'translateX(0)' : 'translateX(-100%)',
        transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        display: 'flex', flexDirection: 'column',
      }}>
        {/* Header sidebar */}
        <div style={{
          padding: '20px 20px 16px',
          borderBottom: '1px solid #f0f0f0',
          background: 'linear-gradient(135deg, #0F6E56, #1D9E75)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 44, height: 44, borderRadius: '50%',
              background: 'rgba(255,255,255,0.25)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'white', fontWeight: 700, fontSize: 18,
              border: '2px solid rgba(255,255,255,0.4)',
            }}>
              {user?.full_name?.charAt(0).toUpperCase()}
            </div>
            <div>
              <div style={{ fontWeight: 700, color: 'white', fontSize: 14 }}>{user?.full_name}</div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.8)', marginTop: 2 }}>
                {roleLabel[user?.role]}
              </div>
            </div>
          </div>
        </div>

        {/* Navigation links */}
        <div style={{ flex: 1, padding: '12px 0', overflowY: 'auto' }}>
          <div style={{ padding: '8px 16px 4px', fontSize: 10, fontWeight: 700, color: '#bbb', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            Menu
          </div>
          {links.map(link => {
            const isActive = location.pathname === link.path;
            return (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setMenuOpen(false)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '11px 20px', textDecoration: 'none',
                  color: isActive ? '#0F6E56' : '#555',
                  background: isActive ? '#E1F5EE' : 'transparent',
                  borderLeft: `3px solid ${isActive ? '#1D9E75' : 'transparent'}`,
                  fontWeight: isActive ? 600 : 400,
                  fontSize: 14, transition: 'all 0.15s',
                }}
                onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = '#f9f9f9'; }}
                onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent'; }}
              >
                <span style={{ fontSize: 18, width: 24, textAlign: 'center' }}>{link.icon}</span>
                {link.label}
              </Link>
            );
          })}
        </div>

        {/* Đăng xuất */}
        <div style={{ padding: '12px 16px', borderTop: '1px solid #f0f0f0' }}>
          <button
            onClick={handleLogout}
            style={{
              width: '100%', padding: '11px 16px',
              display: 'flex', alignItems: 'center', gap: 12,
              background: '#FFF5F5', border: '1px solid #FFD5D5',
              borderRadius: 8, cursor: 'pointer', color: '#D14343',
              fontSize: 14, fontWeight: 500, transition: 'all 0.15s',
            }}
            onMouseEnter={e => e.currentTarget.style.background = '#FFEBEB'}
            onMouseLeave={e => e.currentTarget.style.background = '#FFF5F5'}
          >
            Đăng xuất
          </button>
        </div>
      </div>
    </>
  );
};

export default Navbar;