import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import toast from 'react-hot-toast';

const Profile = () => {
  const { user, login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    full_name: '',
    student_class: '',
    gpa: '',
    research_field: '',
  });

  useEffect(() => {
    if (user) {
      setForm({
        full_name: user.full_name || '',
        student_class: user.student_class || '',
        gpa: user.gpa || '',
        research_field: user.research_field || '',
      });
    }
  }, [user]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.full_name.trim()) { toast.error('Họ tên không được để trống!'); return; }
    setLoading(true);
    try {
      const res = await api.put('/auth/profile', form);
      // Cập nhật lại user trong AuthContext
      const updatedUser = { ...user, ...res.data.user };
      login(updatedUser, localStorage.getItem('token'));
      toast.success('Đã cập nhật thông tin!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Có lỗi xảy ra!');
    } finally {
      setLoading(false);
    }
  };

  const roleLabel = { student: 'Sinh viên', teacher: 'Giảng viên', head: 'Trưởng ngành' };

  const inp = {
    width: '100%', padding: '10px 12px', border: '1px solid #ddd',
    borderRadius: 8, fontSize: 14, boxSizing: 'border-box', fontFamily: 'inherit',
  };
  const lbl = { display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 6, color: '#555' };

  return (
    <div style={{ maxWidth: 600, margin: '0 auto', padding: '24px 16px' }}>
      <h2 style={{ marginBottom: 4 }}>Thông tin cá nhân</h2>
      <p style={{ color: '#888', marginBottom: 24, fontSize: 14 }}>Xem và chỉnh sửa thông tin tài khoản</p>

      {/* Avatar card */}
      <div style={{
        background: 'linear-gradient(135deg, #0F6E56, #1D9E75)',
        borderRadius: 12, padding: 24, marginBottom: 20,
        display: 'flex', alignItems: 'center', gap: 16,
      }}>
        <div style={{
          width: 64, height: 64, borderRadius: '50%',
          background: 'rgba(255,255,255,0.25)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'white', fontWeight: 700, fontSize: 26,
          border: '2px solid rgba(255,255,255,0.4)',
          flexShrink: 0,
        }}>
          {user?.full_name?.charAt(0).toUpperCase()}
        </div>
        <div>
          <div style={{ color: 'white', fontWeight: 700, fontSize: 18 }}>{user?.full_name}</div>
          <div style={{ color: 'rgba(255,255,255,0.85)', fontSize: 13, marginTop: 2 }}>{user?.email}</div>
          <div style={{
            display: 'inline-block', marginTop: 6,
            background: 'rgba(255,255,255,0.2)', color: 'white',
            padding: '2px 10px', borderRadius: 20, fontSize: 12,
          }}>
            {roleLabel[user?.role]}
          </div>
        </div>
      </div>

      {/* Form chỉnh sửa */}
      <div style={{ background: 'white', border: '1px solid #eee', borderRadius: 12, padding: 24 }}>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 18 }}>
            <label style={lbl}>Họ và tên *</label>
            <input name="full_name" value={form.full_name} onChange={handleChange}
              placeholder="Nguyễn Văn A" required style={inp} />
          </div>

          <div style={{ marginBottom: 18 }}>
            <label style={lbl}>Email</label>
            <input value={user?.email || ''} disabled
              style={{ ...inp, background: '#f9f9f9', color: '#aaa', cursor: 'not-allowed' }} />
            <div style={{ fontSize: 11, color: '#bbb', marginTop: 4 }}>Email không thể thay đổi</div>
          </div>

          {user?.role === 'student' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 18 }}>
              <div>
                <label style={lbl}>Lớp</label>
                <input name="student_class" value={form.student_class} onChange={handleChange}
                  placeholder="CNTT2021A" style={inp} />
              </div>
              <div>
                <label style={lbl}>GPA</label>
                <input name="gpa" type="number" step="0.1" min="0" max="4"
                  value={form.gpa} onChange={handleChange}
                  placeholder="3.5" style={inp} />
              </div>
            </div>
          )}

          {user?.role === 'teacher' && (
            <div style={{ marginBottom: 18 }}>
              <label style={lbl}>Lĩnh vực nghiên cứu</label>
              <input name="research_field" value={form.research_field} onChange={handleChange}
                placeholder="Ví dụ: Trí tuệ nhân tạo, Kế toán..." style={inp} />
            </div>
          )}

          <button type="submit" disabled={loading} style={{
            padding: '10px 24px', background: loading ? '#aaa' : '#1D9E75',
            color: 'white', border: 'none', borderRadius: 8,
            fontSize: 14, fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer',
          }}>
            {loading ? 'Đang lưu...' : 'Lưu thay đổi'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Profile;