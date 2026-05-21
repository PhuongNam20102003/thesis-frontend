import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMyTopics, deleteTopic } from '../../services/topicService';
import { getTopicRegistrations, updateRegStatus } from '../../services/regService';
import toast from 'react-hot-toast';
import ConfirmModal from '../../components/ConfirmModal';

const statusTopicConfig = {
  pending:  { label: 'Chờ trưởng ngành duyệt', bg: '#FAEEDA', color: '#854F0B' },
  approved: { label: 'Đã duyệt', bg: '#EAF3DE', color: '#3B6D11' },
  rejected: { label: 'Bị từ chối', bg: '#FCEBEB', color: '#A32D2D' },
};

const statusRegConfig = {
  pending:  { label: 'Chờ duyệt', bg: '#FAEEDA', color: '#854F0B' },
  approved: { label: 'Đã duyệt',  bg: '#EAF3DE', color: '#3B6D11' },
  rejected: { label: 'Từ chối',   bg: '#FCEBEB', color: '#A32D2D' },
};

const MyTopics = () => {
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [regs, setRegs] = useState([]);
  const [filterStatus, setFilterStatus] = useState('all');
  const [activeTab, setActiveTab] = useState('all');
  const navigate = useNavigate();
  const [confirmModal, setConfirmModal] = useState({ open: false, topicId: null });

  useEffect(() => { fetchTopics(); }, []);

  const fetchTopics = async () => {
    try {
      const res = await getMyTopics();
      setTopics(res.data);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (id) => {
  setConfirmModal({ open: true, topicId: id });
};

const confirmDelete = async () => {
  try {
    await deleteTopic(confirmModal.topicId);
    toast.success('Đã xoá đề tài!');
    fetchTopics();
  } catch (err) {
    toast.error(err.response?.data?.message || 'Không thể xoá!');
  } finally {
    setConfirmModal({ open: false, topicId: null });
  }
};

  const handleViewRegs = async (topic) => {
    setSelectedTopic(topic);
    setFilterStatus('all');
    try {
      const res = await getTopicRegistrations();
      setRegs(res.data.filter(r => parseInt(r.topic_id) === parseInt(topic.id)));
    } catch (err) {
      toast.error('Không thể tải danh sách đăng ký!');
    }
  };

  const handleUpdateStatus = async (regId, status) => {
    try {
      await updateRegStatus(regId, status);
      toast.success(status === 'approved' ? '✅ Đã duyệt và gửi email!' : '❌ Đã từ chối!');
      setRegs(prev => prev.map(r => r.id === regId ? { ...r, status } : r));
      fetchTopics();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Có lỗi xảy ra!');
    }
  };

  // Lọc đăng ký theo trạng thái trong modal
  const filteredRegs = filterStatus === 'all'
    ? regs
    : regs.filter(r => r.status === filterStatus);

  const pendingCount = regs.filter(r => r.status === 'pending').length;
  const approvedCount = regs.filter(r => r.status === 'approved').length;

  if (loading) return <div style={{ padding: 32 }}>Đang tải...</div>;

  // Lọc đề tài theo tab
  const filteredTopics = activeTab === 'all'
    ? topics
    : topics.filter(t => t.status === activeTab);

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '24px 16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <h2 style={{ marginBottom: 4 }}>Đề tài của tôi</h2>
          <p style={{ color: '#888', fontSize: 14 }}>Quản lý các đề tài bạn đã đăng</p>
        </div>
        <button onClick={() => navigate('/post-topic')} style={{
          padding: '9px 18px', background: '#1D9E75', color: 'white',
          border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: 'pointer',
        }}>
          + Đăng đề tài mới
        </button>
      </div>

      {/* Tab lọc đề tài */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 20 }}>
        {[
          { value: 'all', label: `Tất cả (${topics.length})` },
          { value: 'approved', label: `Đã duyệt (${topics.filter(t => t.status === 'approved').length})` },
          { value: 'pending', label: `Chờ duyệt (${topics.filter(t => t.status === 'pending').length})` },
          { value: 'rejected', label: `Bị từ chối (${topics.filter(t => t.status === 'rejected').length})` },
        ].map(tab => (
          <button key={tab.value} onClick={() => setActiveTab(tab.value)} style={{
            padding: '7px 14px', borderRadius: 8, fontSize: 12, cursor: 'pointer',
            border: `1px solid ${activeTab === tab.value ? '#1D9E75' : '#ddd'}`,
            background: activeTab === tab.value ? '#E1F5EE' : 'white',
            color: activeTab === tab.value ? '#0F6E56' : '#555',
            fontWeight: activeTab === tab.value ? 600 : 400,
          }}>
            {tab.label}
          </button>
        ))}
      </div>

      {filteredTopics.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 60, color: '#aaa' }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>📭</div>
          <p style={{ marginBottom: 20 }}>
            {activeTab === 'all' ? 'Bạn chưa đăng đề tài nào.' : 'Không có đề tài nào trong mục này.'}
          </p>
          {activeTab === 'all' && (
            <button onClick={() => navigate('/post-topic')} style={{
              padding: '10px 24px', background: '#1D9E75', color: 'white',
              border: 'none', borderRadius: 8, fontSize: 14, cursor: 'pointer',
            }}>
              Đăng đề tài đầu tiên
            </button>
          )}
        </div>
      ) : (
        filteredTopics.map(topic => {
          const st = statusTopicConfig[topic.status] || statusTopicConfig.pending;
          return (
            <div key={topic.id} style={{
              background: 'white', border: '1px solid #eee', borderRadius: 10,
              padding: '16px 20px', marginBottom: 12,
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                <h3 style={{ fontSize: 15, fontWeight: 600, flex: 1, marginRight: 16, lineHeight: 1.4 }}>
                  {topic.title}
                </h3>
                <div style={{ display: 'flex', gap: 8, flexShrink: 0, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                  {/* Badge trạng thái duyệt */}
                  <span style={{
                    padding: '3px 10px', borderRadius: 6, fontSize: 12, fontWeight: 500,
                    background: st.bg, color: st.color,
                  }}>
                    {st.label}
                  </span>
                  {/* Badge sinh viên */}
                  <span style={{
                    padding: '3px 10px', borderRadius: 6, fontSize: 12, fontWeight: 500,
                    background: '#E1F5EE', color: '#0F6E56',
                  }}>
                    {topic.approved_count}/{topic.max_students} SV
                  </span>
                  {parseInt(topic.pending_count) > 0 && (
                    <span style={{
                      padding: '3px 10px', borderRadius: 6, fontSize: 12, fontWeight: 500,
                      background: '#FAEEDA', color: '#854F0B',
                    }}>
                      {topic.pending_count} chờ duyệt
                    </span>
                  )}
                </div>
              </div>

              <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
                <span style={{ background: '#E6F1FB', color: '#185FA5', padding: '2px 8px', borderRadius: 6, fontSize: 12 }}>
                  {topic.field}
                </span>
              </div>

              <p style={{ fontSize: 13, color: '#666', lineHeight: 1.6, marginBottom: 14 }}>
                {topic.description}
              </p>

              {/* Thông báo nếu chưa được duyệt */}
              {topic.status === 'pending' && (
                <div style={{ padding: '8px 12px', background: '#FAEEDA', borderRadius: 6, fontSize: 12, color: '#854F0B', marginBottom: 12 }}>
                  ⏳ Đề tài đang chờ trưởng ngành duyệt. Sinh viên chưa thể đăng ký.
                </div>
              )}
              {topic.status === 'rejected' && (
                <div style={{ padding: '8px 12px', background: '#FCEBEB', borderRadius: 6, fontSize: 12, color: '#A32D2D', marginBottom: 12 }}>
                  ❌ Đề tài bị từ chối. Bạn có thể chỉnh sửa và gửi lại.
                </div>
              )}

              <div style={{ display: 'flex', gap: 8 }}>
                {topic.status === 'approved' && (
                  <button onClick={() => handleViewRegs(topic)} style={{
                    padding: '6px 14px', border: '1px solid #ddd', borderRadius: 6,
                    background: 'white', fontSize: 13, cursor: 'pointer',
                  }}>
                    👥 Xem đăng ký ({parseInt(topic.approved_count) + parseInt(topic.pending_count)})
                  </button>
                )}
                <button onClick={() => navigate(`/edit-topic/${topic.id}`)} style={{
                  padding: '6px 14px', border: '1px solid #B5D4F4', borderRadius: 6,
                  background: '#E6F1FB', color: '#185FA5', fontSize: 13, cursor: 'pointer',
                }}>
                  ✏️ Sửa
                </button>
                <button onClick={() => handleDelete(topic.id)} style={{
                  padding: '6px 14px', border: '1px solid #F09595', borderRadius: 6,
                  background: '#FCEBEB', color: '#A32D2D', fontSize: 13, cursor: 'pointer',
                }}>
                  🗑️ Xoá
                </button>
              </div>
            </div>
          );
        })
      )}

      {/* Modal xem & lọc đăng ký */}
      {selectedTopic && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)',
          zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center',
        }} onClick={() => setSelectedTopic(null)}>
          <div style={{
            background: 'white', borderRadius: 12, padding: 24,
            width: 600, maxWidth: '90vw', maxHeight: '85vh', overflowY: 'auto',
          }} onClick={e => e.stopPropagation()}>

            {/* Header modal */}
            <h3 style={{ marginBottom: 2, fontSize: 16 }}>Danh sách đăng ký</h3>
            <p style={{ color: '#888', fontSize: 13, marginBottom: 12 }}>{selectedTopic.title}</p>

            {/* Thống kê nhanh */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
              <span style={{ background: '#f5f5f5', color: '#555', padding: '4px 12px', borderRadius: 6, fontSize: 12 }}>
                Tổng: {regs.length}
              </span>
              <span style={{ background: '#EAF3DE', color: '#3B6D11', padding: '4px 12px', borderRadius: 6, fontSize: 12 }}>
                Đã duyệt: {approvedCount}
              </span>
              <span style={{ background: '#FAEEDA', color: '#854F0B', padding: '4px 12px', borderRadius: 6, fontSize: 12 }}>
                Chờ duyệt: {pendingCount}
              </span>
            </div>

            {/* Bộ lọc trạng thái */}
            <div style={{ display: 'flex', gap: 6, marginBottom: 16 }}>
              {[
                { value: 'all', label: 'Tất cả' },
                { value: 'pending', label: 'Chờ duyệt' },
                { value: 'approved', label: 'Đã duyệt' },
                { value: 'rejected', label: 'Từ chối' },
              ].map(opt => (
                <button key={opt.value} onClick={() => setFilterStatus(opt.value)} style={{
                  padding: '5px 12px', borderRadius: 6, fontSize: 12, cursor: 'pointer',
                  border: `1px solid ${filterStatus === opt.value ? '#1D9E75' : '#ddd'}`,
                  background: filterStatus === opt.value ? '#E1F5EE' : 'white',
                  color: filterStatus === opt.value ? '#0F6E56' : '#555',
                  fontWeight: filterStatus === opt.value ? 600 : 400,
                }}>
                  {opt.label}
                </button>
              ))}
            </div>

            {/* Danh sách */}
            {filteredRegs.length === 0 ? (
              <p style={{ color: '#aaa', textAlign: 'center', padding: 24 }}>
                Không có sinh viên nào trong mục này.
              </p>
            ) : (
              filteredRegs.map(reg => {
                const st = statusRegConfig[reg.status];
                return (
                  <div key={reg.id} style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '12px 0', borderBottom: '1px solid #f5f5f5',
                    background: reg.status === 'pending' ? '#FFFDF5' : 'white',
                  }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 14, fontWeight: 500 }}>{reg.student_name}</div>
                      <div style={{ fontSize: 12, color: '#888', marginTop: 2 }}>
                        {reg.student_email}
                        {reg.student_class && ` · ${reg.student_class}`}
                        {reg.gpa && ` · GPA: ${reg.gpa}`}
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                      <span style={{ padding: '3px 10px', borderRadius: 6, fontSize: 12, background: st.bg, color: st.color }}>
                        {st.label}
                      </span>
                      {reg.status === 'pending' && (
                        <>
                          <button onClick={() => handleUpdateStatus(reg.id, 'approved')} style={{
                            padding: '4px 10px', border: '1px solid #C0DD97', borderRadius: 6,
                            background: '#EAF3DE', color: '#3B6D11', fontSize: 12, cursor: 'pointer',
                          }}>
                            Duyệt
                          </button>
                          <button onClick={() => handleUpdateStatus(reg.id, 'rejected')} style={{
                            padding: '4px 10px', border: '1px solid #F09595', borderRadius: 6,
                            background: '#FCEBEB', color: '#A32D2D', fontSize: 12, cursor: 'pointer',
                          }}>
                            Từ chối
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                );
              })
            )}

            <div style={{ marginTop: 20, textAlign: 'right' }}>
              <button onClick={() => setSelectedTopic(null)} style={{
                padding: '8px 20px', border: '1px solid #ddd', borderRadius: 8,
                background: 'white', fontSize: 14, cursor: 'pointer',
              }}>
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
      <ConfirmModal
  isOpen={confirmModal.open}
  title="Xoá đề tài"
  message="Bạn chắc chắn muốn xoá đề tài này? Tất cả đăng ký liên quan cũng sẽ bị xoá."
  confirmText="Xoá đề tài"
  onConfirm={confirmDelete}
  onCancel={() => setConfirmModal({ open: false, topicId: null })}
/>
    </div>
  );
};

export default MyTopics;