import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createTopic } from '../../services/topicService';
import toast from 'react-hot-toast';

const PostTopic = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: '', description: '', requirements: '',
    field: 'Trí tuệ nhân tạo', max_students: 2
  });

  const fields = ['Trí tuệ nhân tạo', 'Kỹ thuật phần mềm', 'Mạng máy tính', 'Cơ sở dữ liệu', 'An toàn thông tin'];

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await createTopic(form);
      toast.success('Đã đăng đề tài thành công!');
      navigate('/my-topics');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Có lỗi xảy ra!');
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    width: '100%', padding: '10px 12px', border: '1px solid #ddd',
    borderRadius: 8, fontSize: 14, boxSizing: 'border-box', fontFamily: 'inherit'
  };
  const labelStyle = { display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 6 };

  return (
    <div style={{ maxWidth: 600, margin: '0 auto', padding: '24px 16px' }}>
      <h2 style={{ marginBottom: 4 }}>Đăng đề tài mới</h2>
      <p style={{ color: '#888', marginBottom: 24, fontSize: 14 }}>Tạo đề xuất đề tài cho sinh viên đăng ký</p>

      <div style={{ background: 'white', border: '1px solid #eee', borderRadius: 12, padding: '24px' }}>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 18 }}>
            <label style={labelStyle}>Tên đề tài *</label>
            <input name="title" value={form.title} onChange={handleChange}
              placeholder="Nhập tên đề tài..." required style={inputStyle} />
          </div>

          <div style={{ marginBottom: 18 }}>
  <label style={labelStyle}>Lĩnh vực nghiên cứu *</label>
  <input
    name="field"
    value={form.field}
    onChange={handleChange}
    placeholder="Ví dụ: Trí tuệ nhân tạo, Kế toán, Luật..."
    required
    style={inputStyle}
  />
</div>

          <div style={{ marginBottom: 18 }}>
            <label style={labelStyle}>Mô tả đề tài *</label>
            <textarea name="description" value={form.description} onChange={handleChange}
              placeholder="Mô tả mục tiêu, phương pháp và kết quả mong đợi..."
              rows={4} required style={inputStyle} />
          </div>

          <div style={{ marginBottom: 18 }}>
  <label style={labelStyle}>Yêu cầu sinh viên</label>
  <textarea
    name="requirements"
    value={form.requirements}
    onChange={handleChange}
    placeholder="Ví dụ: Python, ML cơ bản, GPA ≥ 3.0..."
    rows={3}
    style={inputStyle}
  />
</div>

          <div style={{ marginBottom: 24 }}>
            <label style={labelStyle}>Số sinh viên tối đa</label>
            <select name="max_students" value={form.max_students} onChange={handleChange} style={{ ...inputStyle, width: 120 }}>
              <option value={1}>1 sinh viên</option>
              <option value={2}>2 sinh viên</option>
              <option value={3}>3 sinh viên</option>
            </select>
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            <button type="submit" disabled={loading} style={{
              padding: '10px 24px', background: loading ? '#aaa' : '#1D9E75',
              color: 'white', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: 'pointer'
            }}>
              {loading ? 'Đang đăng...' : 'Đăng đề tài'}
            </button>
            <button type="button" onClick={() => navigate('/my-topics')} style={{
              padding: '10px 20px', border: '1px solid #ddd', borderRadius: 8,
              background: 'white', fontSize: 14, cursor: 'pointer'
            }}>
              Huỷ
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PostTopic;