import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

const MyForms = () => {
  const [regInfo, setRegInfo] = useState(null);
  const [forms, setForms] = useState({});
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // ================= FORM LIST (UPDATED) =================
  const formList = [
    {
      code: 'BM02',
      name: 'Phiếu đăng ký thực hiện khóa luận',
      path: '/form-bm02',
      type: 'form'
    },
    {
      code: 'BM04',
      name: 'Phiếu báo cáo tiến độ khóa luận',
      path: '/form-bm04',
      type: 'form'
    },
    {
      code: 'BM08',
      name: 'File báo cáo khóa luận (Upload Word)',
      path: '/upload-bm08',
      type: 'upload'
    }
  ];

  // ================= LOAD BM02 (giữ logic như cũ) =================
  useEffect(() => {
    api.get('/forms/my/BM02')
      .then(res => {
        setRegInfo(res.data.registration);
        if (res.data.form) {
          setForms(prev => ({ ...prev, BM02: res.data.form }));
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const statusConfig = {
    draft: { label: 'Đang soạn', bg: '#f5f5f5', color: '#888' },
    submitted: { label: 'Đã nộp', bg: '#E6F1FB', color: '#185FA5' },
    approved: { label: 'Đã duyệt', bg: '#EAF3DE', color: '#3B6D11' },
  };

  if (loading) return <div style={{ padding: 32 }}>Đang tải...</div>;

  if (!regInfo) return (
    <div style={{ maxWidth: 600, margin: '0 auto', padding: '24px 16px', textAlign: 'center' }}>
      <div style={{ fontSize: 48, marginBottom: 12 }}>📄</div>
      <h2>Biểu mẫu khóa luận</h2>
      <p style={{ color: '#888', marginTop: 8 }}>
        Biểu mẫu sẽ hiển thị sau khi đề tài được duyệt.
      </p>
    </div>
  );

  // ================= UI =================
  return (
    <div style={{ maxWidth: 700, margin: '0 auto', padding: '24px 16px' }}>

      <h2 style={{ marginBottom: 4 }}>Biểu mẫu khóa luận</h2>

      <p style={{ color: '#888', marginBottom: 20, fontSize: 14 }}>
        Đề tài: <strong>{regInfo.topic_title}</strong> — GV: {regInfo.teacher_name}
      </p>

      <div style={{
        background: '#E1F5EE',
        padding: '10px 16px',
        borderRadius: 8,
        marginBottom: 20,
        fontSize: 13,
        color: '#0F6E56'
      }}>
         Đề tài đã được duyệt. Hoàn thành các biểu mẫu và báo cáo bên dưới.
      </div>

      {/* ================= FORM LIST ================= */}
      {formList.map(item => {
        const formData = forms[item.code];
        const status = formData ? statusConfig[formData.status] : null;

        return (
          <div
            key={item.code}
            style={{
              background: 'white',
              border: '1px solid #eee',
              borderRadius: 10,
              padding: '16px 20px',
              marginBottom: 12,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}
          >

            {/* LEFT INFO */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                <span style={{
                  background: '#E6F1FB',
                  color: '#185FA5',
                  padding: '2px 8px',
                  borderRadius: 6,
                  fontSize: 12,
                  fontWeight: 700,
                }}>
                  {item.code}
                </span>

                <span style={{ fontSize: 14, fontWeight: 500 }}>
                  {item.name}
                </span>
              </div>

              {/* STATUS (chỉ cho BM02/BM04) */}
              {item.type === 'form' && status && (
                <span style={{
                  padding: '2px 8px',
                  borderRadius: 6,
                  fontSize: 11,
                  background: status.bg,
                  color: status.color,
                }}>
                  {status.label}
                </span>
              )}

              {/* UPLOAD NOTE FOR BM08 */}
              {item.type === 'upload' && (
                <span style={{
                  fontSize: 11,
                  color: '#888'
                }}>
                  Upload file .docx báo cáo khóa luận
                </span>
              )}
            </div>

            {/* RIGHT BUTTON */}
            {item.type === 'form' ? (
              <button
                onClick={() => navigate(item.path)}
                style={{
                  padding: '8px 18px',
                  background: '#1D9E75',
                  color: 'white',
                  border: 'none',
                  borderRadius: 8,
                  fontSize: 13,
                  fontWeight: 500,
                  cursor: 'pointer'
                }}
              >
                {formData ? 'Xem / Chỉnh sửa' : 'Điền biểu mẫu'}
              </button>
            ) : (
              <button
                onClick={() => navigate(item.path)}
                style={{
                  padding: '8px 18px',
                  background: '#1d5fa7',
                  color: 'white',
                  border: 'none',
                  borderRadius: 8,
                  fontSize: 13,
                  fontWeight: 500,
                  cursor: 'pointer'
                }}
              >
                Upload File
              </button>
            )}

          </div>
        );
      })}

    </div>
  );
};

export default MyForms;