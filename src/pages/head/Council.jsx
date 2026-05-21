import { useState, useEffect } from 'react';
import { getCouncilList, assignRole, assignAllRoles } from '../../services/councilService';
import { getTeachers } from '../../services/topicService';
import toast from 'react-hot-toast';

const roleConfig = [
  { key: 'reviewer', label: 'GV Phản biện', nameKey: 'reviewer_name', color: '#185FA5' },
  { key: 'chairman', label: 'Trưởng Ban', nameKey: 'chairman_name', color: '#0F6E56' },
  { key: 'secretary', label: 'Thư ký', nameKey: 'secretary_name', color: '#854F0B' },
];

const Council = () => {
  const [topics, setTopics] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const [councilRes, teachersRes] = await Promise.all([
        getCouncilList(),
        getTeachers(),
      ]);
      setTopics(councilRes.data);
      setTeachers(teachersRes.data);
    } finally {
      setLoading(false);
    }
  };

const handleAssign = async (topicId, role, personId) => {
  // Lấy topic hiện tại
  const topic = topics.find(t => t.topic_id === topicId);

  // Lấy ID đang chọn của các vai trò hiện tại
  const curReviewer  = teachers.find(t => t.full_name === topic.reviewer_name)?.id  || null;
  const curChairman  = teachers.find(t => t.full_name === topic.chairman_name)?.id  || null;
  const curSecretary = teachers.find(t => t.full_name === topic.secretary_name)?.id || null;

  // Xây dựng bộ phân công mới (thay đổi 1 vai trò, giữ nguyên 2 vai trò còn lại)
  const newAssignment = {
    reviewer_id:  role === 'reviewer'  ? (personId || null) : curReviewer,
    chairman_id:  role === 'chairman'  ? (personId || null) : curChairman,
    secretary_id: role === 'secretary' ? (personId || null) : curSecretary,
  };

  try {
    await assignAllRoles(topicId, newAssignment);
    const roleLabel = { reviewer: 'GV phản biện', chairman: 'Trưởng Ban', secretary: 'Thư ký' };
    toast.success(personId
      ? `Đã phân công ${roleLabel[role]}!`
      : `Đã huỷ phân công ${roleLabel[role]}!`
    );

    // Cập nhật UI ngay
    setTopics(prev => prev.map(t => {
      if (t.topic_id !== topicId) return t;
      const person = teachers.find(tc => tc.id === parseInt(personId));
      return {
        ...t,
        reviewer_name:  role === 'reviewer'  ? (person?.full_name || null) : t.reviewer_name,
        chairman_name:  role === 'chairman'  ? (person?.full_name || null) : t.chairman_name,
        secretary_name: role === 'secretary' ? (person?.full_name || null) : t.secretary_name,
      };
    }));
  } catch (err) {
    toast.error(err.response?.data?.message || 'Có lỗi xảy ra!');
  }
};

  if (loading) return <div style={{ padding: 32 }}>Đang tải...</div>;

  const fullAssigned = topics.filter(t =>
    t.reviewer_name && t.chairman_name && t.secretary_name
  ).length;

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '24px 16px' }}>
      <h2 style={{ marginBottom: 4 }}>Phân công hội đồng phản biện</h2>
      <p style={{ color: '#888', marginBottom: 16, fontSize: 14 }}>
        Đã phân công đủ hội đồng: {fullAssigned}/{topics.length} đề tài
      </p>

      {/* Thanh tiến trình */}
      <div style={{ background: '#f5f5f5', borderRadius: 8, height: 8, marginBottom: 20, overflow: 'hidden' }}>
        <div style={{
          height: '100%', background: '#1D9E75', borderRadius: 8,
          width: `${topics.length ? fullAssigned / topics.length * 100 : 0}%`,
          transition: 'width 0.4s ease',
        }} />
      </div>

      {/* Chú thích */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 12 }}>
        {roleConfig.map(r => (
          <div key={r.key} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#666' }}>
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: r.color }} />
            {r.label}
          </div>
        ))}
      </div>

      <div style={{ background: '#E6F1FB', padding: '10px 16px', borderRadius: 8, fontSize: 13, color: '#185FA5', marginBottom: 20 }}>
        ℹ️ Các thành viên hội đồng không được trùng nhau và không được trùng GV hướng dẫn.
      </div>

      {topics.map(topic => {
        const supervisorId = teachers.find(t => t.full_name === topic.teacher_name)?.id;

        // ID đang chọn cho từng vai trò
        const selectedReviewer  = teachers.find(t => t.full_name === topic.reviewer_name)?.id;
        const selectedChairman  = teachers.find(t => t.full_name === topic.chairman_name)?.id;
        const selectedSecretary = teachers.find(t => t.full_name === topic.secretary_name)?.id;

        // Lọc dropdown: bỏ GV hướng dẫn + bỏ người đã chọn ở 2 vai trò còn lại
       const getOptions = (currentRole) => {
  const currentSelected = {
    reviewer:  selectedReviewer,
    chairman:  selectedChairman,
    secretary: selectedSecretary,
  }[currentRole];

  return teachers.filter(t => {
    if (t.id === supervisorId) return false;
    // Luôn giữ người đang chọn của vai trò này trong dropdown
    if (t.id === currentSelected) return true;
    // Bỏ người đã chọn ở 2 vai trò còn lại
    if (currentRole !== 'reviewer'  && t.id === selectedReviewer)  return false;
    if (currentRole !== 'chairman'  && t.id === selectedChairman)  return false;
    if (currentRole !== 'secretary' && t.id === selectedSecretary) return false;
    return true;
  });
};
        const isComplete = topic.reviewer_name && topic.chairman_name && topic.secretary_name;

        return (
          <div key={topic.topic_id} style={{
            background: 'white', border: '1px solid #eee',
            borderRadius: 12, padding: '16px 20px', marginBottom: 12,
          }}>
            {/* Header đề tài */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 6 }}>{topic.topic_title}</div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                  <span style={{ background: '#E6F1FB', color: '#185FA5', padding: '2px 8px', borderRadius: 6, fontSize: 11 }}>
                    {topic.field}
                  </span>
                  <span style={{ fontSize: 12, color: '#888' }}>GV hướng dẫn: <strong>{topic.teacher_name}</strong></span>
                  {topic.students && (
                    <span style={{ fontSize: 12, color: '#888' }}>· SV: {topic.students}</span>
                  )}
                </div>
              </div>
              <span style={{
                padding: '4px 12px', borderRadius: 6, fontSize: 11, whiteSpace: 'nowrap',
                background: isComplete ? '#EAF3DE' : '#FAEEDA',
                color: isComplete ? '#3B6D11' : '#854F0B',
                fontWeight: 500,
              }}>
                {isComplete ? '✅ Đủ hội đồng' : '⏳ Chưa đủ'}
              </span>
            </div>

            {/* 3 dropdown phân công */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
              {roleConfig.map(role => {
                const options = getOptions(role.key);
                const currentPerson = teachers.find(t => t.full_name === topic[role.nameKey]);

                return (
                  <div key={role.key}>
                    <div style={{ fontSize: 11, fontWeight: 600, color: role.color, marginBottom: 6 }}>
                      {role.label}
                    </div>
                    <select
                      value={currentPerson?.id || ''}
                      onChange={e => handleAssign(topic.topic_id, role.key, e.target.value)}
                      style={{
                        width: '100%', padding: '7px 10px',
                        border: `1.5px solid ${currentPerson ? role.color : '#ddd'}`,
                        borderRadius: 6, background: currentPerson ? 'white' : 'white',
                        fontSize: 12, color: '#333', fontFamily: 'inherit',
                        outline: 'none',
                      }}
                    >
                      <option value="">-- Chưa phân công --</option>
                      {options.map(t => (
                        <option key={t.id} value={t.id}>{t.full_name}</option>
                      ))}
                    </select>
                    {/* Hiện tên đang chọn */}
                    {currentPerson && (
                      <div style={{ fontSize: 11, color: role.color, marginTop: 4, fontWeight: 500 }}>
                        ✓ {currentPerson.full_name}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default Council;