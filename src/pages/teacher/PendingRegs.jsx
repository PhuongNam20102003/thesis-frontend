import { useState, useEffect } from 'react';
import { getPendingRegs, updateRegStatus } from '../../services/regService';
import toast from 'react-hot-toast';

const PendingRegs = () => {
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterTopic, setFilterTopic] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const res = await getPendingRegs();
      setRegistrations(res.data);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (id, status) => {
    try {
      await updateRegStatus(id, status);
      toast.success(status === 'approved' ? '✅ Đã duyệt và gửi email!' : '❌ Đã từ chối và gửi email!');
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Có lỗi xảy ra!');
    }
  };

  // Lấy danh sách đề tài duy nhất để làm bộ lọc
  const uniqueTopics = [...new Map(
    registrations.map(r => [r.topic_id, { id: r.topic_id, title: r.topic_title }])
  ).values()];

  // Lọc theo đề tài và trạng thái
  const filtered = registrations.filter(r => {
    const matchTopic = !filterTopic || r.topic_id === parseInt(filterTopic);
    const matchStatus = filterStatus === 'all' || r.status === filterStatus;
    return matchTopic && matchStatus;
  });

  // Nhóm theo đề tài
  const grouped = filtered.reduce((acc, reg) => {
    const key = reg.topic_id;
    if (!acc[key]) {
      acc[key] = { topic_id: reg.topic_id, topic_title: reg.topic_title, regs: [] };
    }
    acc[key].regs.push(reg);
    return acc;
  }, {});

  const groupedList = Object.values(grouped);

  const statusConfig = {
    pending:  { label: 'Chờ duyệt', bg: '#FAEEDA', color: '#854F0B' },
    approved: { label: 'Đã duyệt',  bg: '#EAF3DE', color: '#3B6D11' },
    rejected: { label: 'Từ chối',   bg: '#FCEBEB', color: '#A32D2D' },
  };

  const totalPending = registrations.filter(r => r.status === 'pending').length;

  if (loading) return <div style={{ padding: 32 }}>Đang tải...</div>;

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '24px 16px' }}>
      <div style={{ marginBottom: 20 }}>
        <h2 style={{ marginBottom: 4 }}>Quản lý đăng ký</h2>
        <p style={{ color: '#888', fontSize: 14 }}>
          Tổng: {registrations.length} đăng ký
          {totalPending > 0 && (
            <span style={{ marginLeft: 8, background: '#FAEEDA', color: '#854F0B', padding: '2px 8px', borderRadius: 6, fontSize: 12 }}>
              {totalPending} chờ duyệt
            </span>
          )}
        </p>
      </div>

      {/* Bộ lọc */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
        <select
          value={filterTopic}
          onChange={e => setFilterTopic(e.target.value)}
          style={{ flex: 1, minWidth: 200, padding: '8px 12px', border: '1px solid #ddd', borderRadius: 8, fontSize: 13, fontFamily: 'inherit' }}
        >
          <option value="">Tất cả đề tài</option>
          {uniqueTopics.map(t => (
            <option key={t.id} value={t.id}>{t.title}</option>
          ))}
        </select>

        <div style={{ display: 'flex', gap: 6 }}>
          {[
            { value: 'all', label: 'Tất cả' },
            { value: 'pending', label: 'Chờ duyệt' },
            { value: 'approved', label: 'Đã duyệt' },
            { value: 'rejected', label: 'Từ chối' },
          ].map(opt => (
            <button
              key={opt.value}
              onClick={() => setFilterStatus(opt.value)}
              style={{
                padding: '7px 14px', borderRadius: 8, fontSize: 12, cursor: 'pointer',
                border: `1px solid ${filterStatus === opt.value ? '#1D9E75' : '#ddd'}`,
                background: filterStatus === opt.value ? '#E1F5EE' : 'white',
                color: filterStatus === opt.value ? '#0F6E56' : '#555',
                fontWeight: filterStatus === opt.value ? 600 : 400,
              }}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Kết quả */}
      {groupedList.length === 0 && (
        <div style={{ textAlign: 'center', padding: 60, color: '#aaa' }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>📭</div>
          Không có đăng ký nào phù hợp
        </div>
      )}

      {/* Nhóm theo đề tài */}
      {groupedList.map(group => {
        const pendingCount = group.regs.filter(r => r.status === 'pending').length;
        const approvedCount = group.regs.filter(r => r.status === 'approved').length;

        return (
          <div key={group.topic_id} style={{
            background: 'white', border: '1px solid #eee',
            borderRadius: 12, marginBottom: 16, overflow: 'hidden',
          }}>
            {/* Header nhóm */}
            <div style={{
              background: '#F8FAF9', padding: '12px 20px',
              borderBottom: '1px solid #eee',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, color: '#333' }}>
                  📋 {group.topic_title}
                </div>
                <div style={{ fontSize: 12, color: '#888', marginTop: 2 }}>
                  {group.regs.length} sinh viên đăng ký
                </div>
              </div>
              <div style={{ display: 'flex', gap: 6 }}>
                {approvedCount > 0 && (
                  <span style={{ background: '#EAF3DE', color: '#3B6D11', padding: '3px 10px', borderRadius: 6, fontSize: 12 }}>
                    {approvedCount} đã duyệt
                  </span>
                )}
                {pendingCount > 0 && (
                  <span style={{ background: '#FAEEDA', color: '#854F0B', padding: '3px 10px', borderRadius: 6, fontSize: 12 }}>
                    {pendingCount} chờ duyệt
                  </span>
                )}
              </div>
            </div>

            {/* Danh sách sinh viên trong nhóm */}
            {group.regs.map((reg, idx) => {
              const st = statusConfig[reg.status];
              return (
                <div key={reg.id} style={{
                  display: 'flex', alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 20px',
                  borderBottom: idx < group.regs.length - 1 ? '1px solid #f5f5f5' : 'none',
                  background: reg.status === 'pending' ? '#FFFDF5' : 'white',
                }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 500 }}>{reg.student_name}</div>
                    <div style={{ fontSize: 12, color: '#888', marginTop: 2 }}>
                      {reg.student_email}
                      {reg.student_class && ` · ${reg.student_class}`}
                      {reg.gpa && ` · GPA: ${reg.gpa}`}
                    </div>
                    <div style={{ fontSize: 11, color: '#bbb', marginTop: 2 }}>
                      Đăng ký lúc: {new Date(reg.registered_at).toLocaleDateString('vi-VN')}
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <span style={{
                      padding: '3px 10px', borderRadius: 6, fontSize: 12,
                      background: st.bg, color: st.color, whiteSpace: 'nowrap',
                    }}>
                      {st.label}
                    </span>
                    {reg.status === 'pending' && (
                      <>
                        <button onClick={() => handleUpdate(reg.id, 'approved')} style={{
                          padding: '5px 12px', border: '1px solid #C0DD97', borderRadius: 6,
                          background: '#EAF3DE', color: '#3B6D11', fontSize: 12, cursor: 'pointer', whiteSpace: 'nowrap',
                        }}>
                          ✅ Duyệt
                        </button>
                        <button onClick={() => handleUpdate(reg.id, 'rejected')} style={{
                          padding: '5px 12px', border: '1px solid #F09595', borderRadius: 6,
                          background: '#FCEBEB', color: '#A32D2D', fontSize: 12, cursor: 'pointer', whiteSpace: 'nowrap',
                        }}>
                          ❌ Từ chối
                        </button>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
};

export default PendingRegs;