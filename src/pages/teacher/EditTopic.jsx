import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getMyTopics, updateTopic } from '../../services/topicService';
import toast from 'react-hot-toast';

const EditTopic = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [form, setForm] = useState({
    title: '', description: '', requirements: '', field: '', max_students: 2
  });

  useEffect(() => {
    getMyTopics().then(res => {
      const topic = res.data.find(t => t.id === parseInt(id));
      if (!topic) { toast.error('Không tìm thấy đề tài!'); navigate('/my-topics'); return; }
      setForm({
        title: topic.title,
        description: topic.description,
        requirements: topic.requirements || '',
        field: topic.field,
        max_students: topic.max_students,
      });
    }).finally(() => setFetching(false));
  }, [id, navigate]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await updateTopic(id, form);
      toast.success('Đã cập nhật! Đề tài sẽ chờ trưởng ngành duyệt lại.');
      navigate('/my-topics');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Có lỗi xảy ra!');
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = { width: '100%', padding: '10px 12px', border: '1px solid #ddd', borderRadius: 8, fontSize: 14, boxSizing: 'border-box', fontFamily: 'inherit' };
  const labelStyle = { display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 6 };

  if (fetching) return <div style={{ padding: 32 }}>Đang tải...</div>;

  return (
    <div style={{ maxWidth: 600, margin: '0 auto', padding: '24px 16px' }}>
      <h2 style={{ marginBottom: 4 }}>Chỉnh sửa đề tài</h2>
      <p style={{ color: '#888', marginBottom: 24, fontSize: 14 }}>
        Sau khi chỉnh sửa, đề tài sẽ chờ trưởng ngành duyệt lại
      </p>
      <div style={{ background: 'white', border: '1px solid #eee', borderRadius: 12, padding: 24 }}>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 18 }}>
            <label style={labelStyle}>Tên đề tài *</label>
            <input name="title" value={form.title} onChange={handleChange} required style={inputStyle} />
          </div>
          <div style={{ marginBottom: 18 }}>
            <label style={labelStyle}>Lĩnh vực nghiên cứu *</label>
            <input name="field" value={form.field} onChange={handleChange}
              placeholder="Ví dụ: Trí tuệ nhân tạo, Kế toán..." required style={inputStyle} />
          </div>
          <div style={{ marginBottom: 18 }}>
            <label style={labelStyle}>Mô tả đề tài *</label>
            <textarea name="description" value={form.description} onChange={handleChange}
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
            <select name="max_students" value={form.max_students} onChange={handleChange} style={{ ...inputStyle, width: 140 }}>
              <option value={1}>1 sinh viên</option>
              <option value={2}>2 sinh viên</option>
              <option value={3}>3 sinh viên</option>
            </select>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button type="submit" disabled={loading} style={{
              padding: '10px 24px', background: loading ? '#aaa' : '#1D9E75',
              color: 'white', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: 'pointer',
            }}>
              {loading ? 'Đang lưu...' : 'Lưu thay đổi'}
            </button>
            <button type="button" onClick={() => navigate('/my-topics')} style={{
              padding: '10px 20px', border: '1px solid #ddd', borderRadius: 8, background: 'white', fontSize: 14, cursor: 'pointer',
            }}>
              Huỷ
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditTopic;