import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { register as registerService } from '../services/authService';
import toast from 'react-hot-toast';

const Register = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    full_name: '',
    email: '',
    password: '',
    confirm_password: '',
    role: 'student',
    student_class: '',
    gpa: '',
    research_field: '',
  });

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Kiểm tra mật khẩu khớp
    if (form.password !== form.confirm_password) {
      toast.error('Mật khẩu xác nhận không khớp!');
      return;
    }
    if (form.password.length < 6) {
      toast.error('Mật khẩu phải có ít nhất 6 ký tự!');
      return;
    }

    setLoading(true);
    try {
      await registerService({
        full_name: form.full_name,
        email: form.email,
        password: form.password,
        role: form.role,
        student_class: form.role === 'student' ? form.student_class : null,
        gpa: form.role === 'student' ? parseFloat(form.gpa) || null : null,
        research_field: form.role === 'teacher' ? form.research_field : null,
      });
      toast.success('Đăng ký thành công! Vui lòng đăng nhập.');
      navigate('/login');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Đăng ký thất bại!');
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    width: '100%', padding: '10px 12px', border: '1px solid #ddd',
    borderRadius: 8, fontSize: 14, boxSizing: 'border-box', fontFamily: 'inherit',
  };
  const labelStyle = { display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 6 };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f5f5f5', padding: '24px 16px' }}>
      <div style={{ background: 'white', padding: 40, borderRadius: 12, width: 460, boxShadow: '0 2px 12px rgba(0,0,0,0.08)' }}>
        <h2 style={{ textAlign: 'center', marginBottom: 4, color: '#1D9E75' }}>Tạo tài khoản</h2>
        <p style={{ textAlign: 'center', color: '#888', marginBottom: 28, fontSize: 14 }}>Hệ thống quản lý đề tài khóa luận</p>

        <form onSubmit={handleSubmit}>
          {/* Họ tên */}
          <div style={{ marginBottom: 16 }}>
            <label style={labelStyle}>Họ và tên *</label>
            <input name="full_name" value={form.full_name} onChange={handleChange}
              placeholder="Nguyễn Văn A" required style={inputStyle} />
          </div>

          {/* Email */}
          <div style={{ marginBottom: 16 }}>
            <label style={labelStyle}>Email *</label>
            <input name="email" type="email" value={form.email} onChange={handleChange}
              placeholder="email@edu.vn" required style={inputStyle} />
          </div>

          {/* Vai trò */}
          <div style={{ marginBottom: 16 }}>
            <label style={labelStyle}>Vai trò *</label>
            <div style={{ display: 'flex', gap: 10 }}>
              {[
                { value: 'student', label: '🎓 Sinh viên' },
                { value: 'teacher', label: '👨‍🏫 Giảng viên' },
                { value: 'head', label: '🏛️ Trưởng ngành' },
              ].map(r => (
                <label key={r.value} style={{
                  flex: 1, padding: '10px', border: `1.5px solid ${form.role === r.value ? '#1D9E75' : '#ddd'}`,
                  borderRadius: 8, textAlign: 'center', cursor: 'pointer', fontSize: 13,
                  background: form.role === r.value ? '#E1F5EE' : 'white',
                  color: form.role === r.value ? '#0F6E56' : '#555',
                  transition: 'all 0.15s',
                }}>
                  <input type="radio" name="role" value={r.value} checked={form.role === r.value}
                    onChange={handleChange} style={{ display: 'none' }} />
                  {r.label}
                </label>
              ))}
            </div>
          </div>

          {/* Thông tin bổ sung theo role */}
          {form.role === 'student' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
              <div>
                <label style={labelStyle}>Lớp</label>
                <input name="student_class" value={form.student_class} onChange={handleChange}
                  placeholder="CNTT2021A" style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>GPA</label>
                <input name="gpa" type="number" step="0.1" min="0" max="4" value={form.gpa}
                  onChange={handleChange} placeholder="3.5" style={inputStyle} />
              </div>
            </div>
          )}

         {form.role === 'teacher' && (
  <div style={{ marginBottom: 16 }}>
    <label style={labelStyle}>Lĩnh vực nghiên cứu</label>
    <input
      id="research_field"
      name="research_field"
      value={form.research_field}
      onChange={handleChange}
      placeholder="Ví dụ: Trí tuệ nhân tạo, Kế toán, Luật..."
      style={inputStyle}
    />
  </div>
)}

          {/* Mật khẩu */}
          <div style={{ marginBottom: 16 }}>
            <label style={labelStyle}>Mật khẩu *</label>
            <input name="password" type="password" value={form.password} onChange={handleChange}
              placeholder="Ít nhất 6 ký tự" required style={inputStyle} />
          </div>

          <div style={{ marginBottom: 24 }}>
            <label style={labelStyle}>Xác nhận mật khẩu *</label>
            <input name="confirm_password" type="password" value={form.confirm_password}
              onChange={handleChange} placeholder="Nhập lại mật khẩu" required style={inputStyle} />
          </div>

          <button type="submit" disabled={loading} style={{
            width: '100%', padding: 11, background: loading ? '#aaa' : '#1D9E75',
            color: 'white', border: 'none', borderRadius: 8, fontSize: 15,
            fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer',
          }}>
            {loading ? 'Đang tạo tài khoản...' : 'Đăng ký'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: 20, fontSize: 13, color: '#666' }}>
          Đã có tài khoản? <Link to="/login" style={{ color: '#1D9E75' }}>Đăng nhập</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;