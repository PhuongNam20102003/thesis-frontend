import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { login as loginService } from '../services/authService';
import toast from 'react-hot-toast';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await loginService(email, password);
      login(res.data.user, res.data.token);
      const pages = { student: '/topics', teacher: '/my-topics', head: '/overview' };
      navigate(pages[res.data.user.role] || '/login');
      toast.success(`Chào mừng, ${res.data.user.full_name}!`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Email hoặc mật khẩu không đúng!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex',
      background: 'linear-gradient(135deg, #0F6E56 0%, #1D9E75 50%, #2DD4BF 100%)',
    }}>
      {/* Cột trái — Branding */}
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: '48px', color: 'white',
      }}>
        {/* Logo */}
        <div style={{
          width: 80, height: 80, borderRadius: 20,
          background: 'rgba(255,255,255,0.2)',
          backdropFilter: 'blur(10px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          marginBottom: 24, fontSize: 40,
          border: '1.5px solid rgba(255,255,255,0.3)',
        }}>
          🎓
        </div>

        <h1 style={{ fontSize: 36, fontWeight: 700, marginBottom: 8, textAlign: 'center' }}>
          EduThesis
        </h1>
        <p style={{ fontSize: 16, opacity: 0.85, marginBottom: 48, textAlign: 'center', lineHeight: 1.6 }}>
          HỆ THỐNG QUẢN LÝ ĐỀ TÀI<br />KHÓA LUẬN 
        </p>

        {/* Tính năng nổi bật */}
        {[
          { icon: '📋', text: 'Đăng Ký Đề Tài Trực Tuyến Dễ Dàng' },
          { icon: '✅', text: 'Duyệt Và Theo Dõi Trạng Thái Tức Thì' },
          { icon: '📧', text: 'Thông Báo Email Tự Động' },
          { icon: '📊', text: 'Quản Lý Hội Đồng Phản Biện' },
        ].map((item, i) => (
          <div key={i} style={{
            display: 'flex', alignItems: 'center', gap: 12,
            marginBottom: 16, width: '100%', maxWidth: 320,
          }}>
            <div style={{
              width: 40, height: 40, borderRadius: 10,
              background: 'rgba(255,255,255,0.15)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 18, flexShrink: 0,
            }}>
              {item.icon}
            </div>
            <span style={{ fontSize: 14, opacity: 0.9, lineHeight: 1.4 }}>{item.text}</span>
          </div>
        ))}

        {/* Decorative dots */}
        <div style={{ marginTop: 48, display: 'flex', gap: 8 }}>
          {[1,2,3,4,5].map(i => (
            <div key={i} style={{
              width: i === 1 ? 24 : 8, height: 8, borderRadius: 4,
              background: i === 1 ? 'white' : 'rgba(255,255,255,0.4)',
              transition: 'all 0.3s',
            }} />
          ))}
        </div>
      </div>

      {/* Cột phải — Form đăng nhập */}
      <div style={{
        width: 480, display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '32px', background: 'white',
        borderRadius: '24px 0 0 24px',
      }}>
        <div style={{ width: '100%', maxWidth: 380 }}>
          {/* Header */}
          <div style={{ marginBottom: 36 }}>
            <h2 style={{ fontSize: 26, fontWeight: 700, color: '#1a1a1a', marginBottom: 6 }}>
              ĐĂNG NHẬP
            </h2>
            <p style={{ fontSize: 14, color: '#888' }}>
              Vui lòng đăng nhập để tiếp tục sử dụng hệ thống
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            {/* Email */}
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#444', marginBottom: 8 }}>
                ĐỊA CHỈ EMAIL
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  id="email" type="email" value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="email@edu.vn" required
                  style={{
                    width: '100%', padding: '13px 14px',
                    border: '1.5px solid #e8e8e8', borderRadius: 10,
                    fontSize: 14, color: '#333', boxSizing: 'border-box',
                    outline: 'none', transition: 'border-color 0.2s',
                    fontFamily: 'inherit',
                  }}
                  onFocus={e => e.target.style.borderColor = '#1D9E75'}
                  onBlur={e => e.target.style.borderColor = '#e8e8e8'}
                />
              </div>
            </div>

            {/* Mật khẩu */}
            <div style={{ marginBottom: 12 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#444', marginBottom: 8 }}>
                MẬT KHẨU
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  id="password"
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Nhập mật khẩu" required
                  style={{
                    width: '100%', padding: '13px 44px 13px 14px',
                    border: '1.5px solid #e8e8e8', borderRadius: 10,
                    fontSize: 14, color: '#333', boxSizing: 'border-box',
                    outline: 'none', transition: 'border-color 0.2s',
                    fontFamily: 'inherit',
                  }}
                  onFocus={e => e.target.style.borderColor = '#1D9E75'}
                  onBlur={e => e.target.style.borderColor = '#e8e8e8'}
                />
                <button type="button" onClick={() => setShowPass(!showPass)} style={{
                  position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', cursor: 'pointer', fontSize: 16, color: '#aaa',
                }}>
                  {showPass ? (
    // Con mắt bình thường — đang hiện mật khẩu
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
      <circle cx="12" cy="12" r="3"/>
    </svg>
  ) : (
    // Con mắt bị gạch chéo — đang ẩn mật khẩu
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
      <line x1="1" y1="1" x2="23" y2="23"/>
    </svg>
  )}
                </button>
              </div>
            </div>

            {/* Nút đăng nhập */}
            <button type="submit" disabled={loading} style={{
              width: '100%', padding: '14px',
              background: loading
                ? '#aaa'
                : 'linear-gradient(135deg, #0F6E56, #1D9E75)',
              color: 'white', border: 'none', borderRadius: 10,
              fontSize: 15, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer',
              marginTop: 20, letterSpacing: 0.5,
              boxShadow: loading ? 'none' : '0 4px 15px rgba(29,158,117,0.35)',
              transition: 'all 0.2s',
            }}>
              {loading ? '⏳ Đang đăng nhập...' : 'Đăng nhập →'}
            </button>
          </form>

          {/* Đăng ký */}
          <p style={{ textAlign: 'center', marginTop: 24, fontSize: 13, color: '#888' }}>
            Chưa có tài khoản?{' '}
            <Link to="/register" style={{ color: '#1D9E75', fontWeight: 600, textDecoration: 'none' }}>
              Đăng ký ngay
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;