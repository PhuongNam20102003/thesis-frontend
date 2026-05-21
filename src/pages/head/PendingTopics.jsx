import { useState, useEffect } from 'react';
import { getPendingTopics, approveOrRejectTopic } from '../../services/topicService';
import toast from 'react-hot-toast';

const PendingTopics = () => {
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const res = await getPendingTopics();
      setTopics(res.data);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (id, status) => {
    try {
      await approveOrRejectTopic(id, status);
      toast.success(status === 'approved' ? '✅ Đã duyệt đề tài!' : '❌ Đã từ chối đề tài!');
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Có lỗi xảy ra!');
    }
  };

  if (loading) return <div style={{ padding: 32 }}>Đang tải...</div>;

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '24px 16px' }}>
      <h2 style={{ marginBottom: 4 }}>Duyệt đề tài</h2>
      <p style={{ color: '#888', marginBottom: 20, fontSize: 14 }}>
        {topics.length} đề tài đang chờ duyệt
      </p>

      {topics.length === 0 && (
        <div style={{ textAlign: 'center', padding: 60, color: '#aaa' }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>✅</div>
          Không có đề tài nào đang chờ duyệt
        </div>
      )}

      {topics.map(topic => (
        <div key={topic.id} style={{
          background: 'white', border: '1px solid #eee',
          borderRadius: 10, padding: '16px 20px', marginBottom: 12,
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
            <h3 style={{ fontSize: 15, fontWeight: 600, flex: 1, marginRight: 16, lineHeight: 1.4 }}>
              {topic.title}
            </h3>
            <span style={{ background: '#FAEEDA', color: '#854F0B', padding: '3px 10px', borderRadius: 6, fontSize: 12, whiteSpace: 'nowrap' }}>
              Chờ duyệt
            </span>
          </div>

          <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
            <span style={{ background: '#E6F1FB', color: '#185FA5', padding: '2px 8px', borderRadius: 6, fontSize: 12 }}>{topic.field}</span>
            <span style={{ fontSize: 12, color: '#777' }}>👤 {topic.teacher_name}</span>
            <span style={{ fontSize: 12, color: '#777' }}>✉️ {topic.teacher_email}</span>
          </div>

          <p style={{ fontSize: 13, color: '#555', lineHeight: 1.6, marginBottom: 8 }}>{topic.description}</p>
          <p style={{ fontSize: 12, color: '#999', fontStyle: 'italic', marginBottom: 14 }}>
            Yêu cầu: {topic.requirements || 'Không có'}
          </p>

          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={() => handleAction(topic.id, 'approved')} style={{
              padding: '7px 18px', borderRadius: 6, border: '1px solid #C0DD97',
              background: '#EAF3DE', color: '#3B6D11', fontSize: 13, fontWeight: 500, cursor: 'pointer',
            }}>
              ✅ Duyệt đề tài
            </button>
            <button onClick={() => handleAction(topic.id, 'rejected')} style={{
              padding: '7px 18px', borderRadius: 6, border: '1px solid #F09595',
              background: '#FCEBEB', color: '#A32D2D', fontSize: 13, fontWeight: 500, cursor: 'pointer',
            }}>
              ❌ Từ chối
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default PendingTopics;