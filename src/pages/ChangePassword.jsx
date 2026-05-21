import { useState } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';

const ChangePassword = () => {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    current_password: '',
    new_password: '',
    confirm_password: '',
  });
  const [show, setShow] = useState({ current: false, new: false, confirm: false });

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const toggleShow = (field) => setShow(prev => ({ ...prev, [field]: !prev[field] }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.new_password.length < 6) { toast.error('Mật khẩu mới phải có ít nhất 6 ký tự!'); return; }
    if (form.new_password !== form.confirm_password) { toast.error('Mật khẩu xác nhận không khớp!'); return; }
    if (form.current_password === form.new_password) { toast.error('Mật khẩu mới phải khác mật khẩu cũ!'); return; }

    setLoading(true);
    try {
      await api.put('/auth/change-password', {
        current_password: form.current_password,
        new_password: form.new_password,
      });
      toast.success('Đổi mật khẩu thành công!');
      setForm({ current_password: '', new_password: '', confirm_password: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Có lỗi xảy ra!');
    } finally {
      setLoading(false);
    }
  };

  const EyeIcon = ({ visible }) => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      {visible ? (
        <>
          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
          <circle cx="12" cy="12" r="3"/>
        </>
      ) : (
        <>
          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
          <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
          <line x1="1" y1="1" x2="23" y2="23"/>
        </>
      )}
    </svg>
  );

  const fields = [
    { name: 'current_password', label: 'Mật khẩu hiện tại', showKey: 'current' },
    { name: 'new_password', label: 'Mật khẩu mới', showKey: 'new' },
    { name: 'confirm_password', label: 'Xác nhận mật khẩu mới', showKey: 'confirm' },
  ];

  return (
    <div style={{ maxWidth: 480, margin: '0 auto', padding: '24px 16px' }}>
      <h2 style={{ marginBottom: 4 }}>Đổi mật khẩu</h2>
      <p style={{ color: '#888', marginBottom: 24, fontSize: 14 }}>
        Mật khẩu mới phải có ít nhất 6 ký tự
      </p>

      <div style={{ background: 'white', border: '1px solid #eee', borderRadius: 12, padding: 24 }}>
        <form onSubmit={handleSubmit}>
          {fields.map(field => (
            <div key={field.name} style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 6, color: '#555' }}>
                {field.label} *
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  name={field.name}
                  type={show[field.showKey] ? 'text' : 'password'}
                  value={form[field.name]}
                  onChange={handleChange}
                  placeholder="••••••••"
                  required
                  style={{
                    width: '100%', padding: '10px 44px 10px 12px',
                    border: '1px solid #ddd', borderRadius: 8,
                    fontSize: 14, boxSizing: 'border-box', fontFamily: 'inherit',
                  }}
                />
                <button type="button" onClick={() => toggleShow(field.showKey)} style={{
                  position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', cursor: 'pointer', color: '#aaa',
                  display: 'flex', alignItems: 'center',
                }}>
                  <EyeIcon visible={show[field.showKey]} />
                </button>
              </div>
            </div>
          ))}

          {/* Yêu cầu mật khẩu */}
          <div style={{
            background: '#F8FAF9', borderRadius: 8, padding: '10px 14px',
            marginBottom: 20, fontSize: 12, color: '#888',
          }}>
            <div style={{ fontWeight: 500, marginBottom: 4, color: '#555' }}>Yêu cầu mật khẩu:</div>
            <div style={{ color: form.new_password.length >= 6 ? '#1D9E75' : '#bbb' }}>
              {form.new_password.length >= 6 ? '✓' : '○'} Ít nhất 6 ký tự
            </div>
            <div style={{ color: form.new_password && form.new_password !== form.current_password ? '#1D9E75' : '#bbb' }}>
              {form.new_password && form.new_password !== form.current_password ? '✓' : '○'} Khác mật khẩu cũ
            </div>
            <div style={{ color: form.confirm_password && form.new_password === form.confirm_password ? '#1D9E75' : '#bbb' }}>
              {form.confirm_password && form.new_password === form.confirm_password ? '✓' : '○'} Mật khẩu khớp nhau
            </div>
          </div>

          <button type="submit" disabled={loading} style={{
            width: '100%', padding: '11px',
            background: loading ? '#aaa' : 'linear-gradient(135deg, #0F6E56, #1D9E75)',
            color: 'white', border: 'none', borderRadius: 8,
            fontSize: 14, fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer',
            boxShadow: loading ? 'none' : '0 4px 12px rgba(29,158,117,0.3)',
          }}>
            {loading ? 'Đang đổi...' : 'Đổi mật khẩu'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChangePassword;