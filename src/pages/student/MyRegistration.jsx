import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMyRegistration, cancelRegistration } from '../../services/regService';
import toast from 'react-hot-toast';

const MyRegistration = () => {
  const [reg, setReg] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const res = await getMyRegistration();
      setReg(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!window.confirm('Bạn chắc chắn muốn huỷ đăng ký?')) return;
    try {
      await cancelRegistration();
      toast.success('Đã huỷ đăng ký thành công!');
      setReg(null);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Có lỗi xảy ra!');
    }
  };

  if (loading) return <div style={{ padding: 32 }}>Đang tải...</div>;

  // Chưa đăng ký đề tài nào
  if (!reg) return (
    <div style={{ maxWidth: 600, margin: '0 auto', padding: '24px 16px', textAlign: 'center' }}>
      <h2 style={{ marginBottom: 4 }}>Đề tài của tôi</h2>
      <div style={{ marginTop: 60 }}>
        <div style={{ fontSize: 56, marginBottom: 16 }}>📭</div>
        <p style={{ color: '#888', marginBottom: 20 }}>Bạn chưa đăng ký đề tài nào.</p>
        <button onClick={() => navigate('/topics')} style={{
          padding: '10px 24px', background: '#1D9E75', color: 'white',
          border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: 'pointer',
        }}>
          Xem danh sách đề tài
        </button>
      </div>
    </div>
  );

  const statusConfig = {
    pending:  { label: '⏳ Chờ giảng viên duyệt', bg: '#FAEEDA', color: '#854F0B' },
    approved: { label: '✅ Đã được chấp nhận',     bg: '#EAF3DE', color: '#3B6D11' },
    rejected: { label: '❌ Bị từ chối',            bg: '#FCEBEB', color: '#A32D2D' },
  };
  const status = statusConfig[reg.status];

  // Các bước tiến trình
  const steps = [
    { label: 'Đã đăng ký',       done: true },
    { label: 'Giảng viên duyệt', done: reg.status !== 'pending' },
    { label: 'Xác nhận',         done: reg.status === 'approved' },
  ];

  return (
    <div style={{ maxWidth: 640, margin: '0 auto', padding: '24px 16px' }}>
      <h2 style={{ marginBottom: 4 }}>Đề tài của tôi</h2>
      <p style={{ color: '#888', marginBottom: 20, fontSize: 14 }}>Trạng thái đăng ký khóa luận</p>

      <div style={{ background: 'white', border: '1px solid #eee', borderRadius: 12, padding: '24px' }}>
        {/* Tên đề tài + trạng thái */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
          <h3 style={{ fontSize: 16, fontWeight: 600, flex: 1, marginRight: 16, lineHeight: 1.5 }}>
            {reg.topic_title}
          </h3>
          <span style={{
            padding: '4px 12px', borderRadius: 8, fontSize: 12, fontWeight: 500,
            whiteSpace: 'nowrap', background: status.bg, color: status.color,
          }}>
            {status.label}
          </span>
        </div>

        {/* Thông tin đề tài */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
          <span style={{ background: '#E6F1FB', color: '#185FA5', padding: '2px 10px', borderRadius: 6, fontSize: 12 }}>
            {reg.field}
          </span>
          <span style={{ fontSize: 12, color: '#777' }}>👤 {reg.teacher_name}</span>
          <span style={{ fontSize: 12, color: '#777' }}>✉️ {reg.teacher_email}</span>
        </div>

        <p style={{ fontSize: 13, color: '#555', lineHeight: 1.6, marginBottom: 20 }}>
          {reg.description}
        </p>

        {/* Thanh tiến trình */}
        <div style={{ display: 'flex', marginBottom: 20, position: 'relative' }}>
          {/* Đường kẻ nối các bước */}
          <div style={{
            position: 'absolute', top: 11, left: '16%', right: '16%',
            height: 2, background: '#eee', zIndex: 0,
          }} />
          {steps.map((step, i) => (
            <div key={i} style={{ flex: 1, textAlign: 'center', position: 'relative', zIndex: 1 }}>
              <div style={{
                width: 24, height: 24, borderRadius: '50%', margin: '0 auto 8px',
                background: step.done ? '#1D9E75' : 'white',
                border: `2px solid ${step.done ? '#1D9E75' : '#ddd'}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {step.done
                  ? <span style={{ color: 'white', fontSize: 12 }}>✓</span>
                  : <span style={{ color: '#ccc', fontSize: 11 }}>{i + 1}</span>
                }
              </div>
              <div style={{ fontSize: 11, color: step.done ? '#0F6E56' : '#aaa', fontWeight: step.done ? 500 : 400 }}>
                {step.label}
              </div>
            </div>
          ))}
        </div>

        {/* Ngày đăng ký */}
        <div style={{ fontSize: 12, color: '#aaa', borderTop: '1px solid #f5f5f5', paddingTop: 16 }}>
          📅 Ngày đăng ký: {new Date(reg.registered_at).toLocaleDateString('vi-VN')}
        </div>

        {/* Thông báo kết quả */}
        {reg.status === 'approved' && (
          <div style={{ marginTop: 16, padding: '12px 16px', background: '#EAF3DE', borderRadius: 8, fontSize: 13, color: '#3B6D11' }}>
            🎉 Chúc mừng! Bạn đã được nhận vào đề tài. Hãy liên hệ giảng viên để bắt đầu triển khai.
          </div>
        )}
        {reg.status === 'rejected' && (
          <div style={{ marginTop: 16 }}>
            <div style={{ padding: '12px 16px', background: '#FCEBEB', borderRadius: 8, fontSize: 13, color: '#A32D2D', marginBottom: 12 }}>
              😔 Đăng ký bị từ chối. Bạn có thể huỷ và đăng ký đề tài khác.
            </div>
            <button onClick={handleCancel} style={{
              padding: '8px 18px', background: '#FCEBEB', border: '1px solid #F09595',
              color: '#A32D2D', borderRadius: 8, fontSize: 13, cursor: 'pointer', fontWeight: 500,
            }}>
              Huỷ đăng ký & chọn đề tài khác
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyRegistration;