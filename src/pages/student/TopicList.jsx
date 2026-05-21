import { useState, useEffect } from 'react';
import { getAllTopics, getTeachers } from '../../services/topicService';
import { registerTopic, getMyRegistration } from '../../services/regService';
import toast from 'react-hot-toast';

const TopicList = () => {
  const [topics, setTopics] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [myReg, setMyReg] = useState(null);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [field, setField] = useState('');
  const [teacherId, setTeacherId] = useState('');
  const [loading, setLoading] = useState(true);
  const [expandedDesc, setExpandedDesc] = useState({});

  useEffect(() => { fetchData(); }, []);

  useEffect(() => {
    const timer = setTimeout(() => setSearch(searchInput), 400);
    return () => clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => { fetchTopics(); }, [search, field, teacherId]);

  const fetchData = async () => {
    try {
      const [topicsRes, teachersRes, myRegRes] = await Promise.all([
        getAllTopics(), getTeachers(), getMyRegistration(),
      ]);
      setTopics(topicsRes.data);
      setTeachers(teachersRes.data);
      setMyReg(myRegRes.data);
    } finally { setLoading(false); }
  };

  const fetchTopics = async () => {
    const params = {};
    if (search) params.search = search;
    if (field) params.field = field;
    if (teacherId) params.teacher_id = teacherId;
    const res = await getAllTopics(params);
    setTopics(res.data);
  };

  const handleRegister = async (topicId) => {
    try {
      await registerTopic(topicId);
      toast.success('Đăng ký thành công! Đang chờ giảng viên duyệt.');
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Đăng ký thất bại!');
    }
  };

  const toggleDesc = (id) => setExpandedDesc(prev => ({ ...prev, [id]: !prev[id] }));

  if (loading) return <div style={{ padding: 32, textAlign: 'center', color: '#888' }}>Đang tải...</div>;

  const statusMap = { pending: '⏳ Chờ duyệt', approved: '✅ Đã duyệt', rejected: '❌ Từ chối' };
  const statusColor = { pending: '#854F0B', approved: '#3B6D11', rejected: '#A32D2D' };
  const statusBg   = { pending: '#FAEEDA', approved: '#EAF3DE', rejected: '#FCEBEB' };

  return (
    <div style={{ padding: '20px 16px' }}>
      <h2 style={{ marginBottom: 4 }}>Danh sách đề tài</h2>
      <p style={{ color: '#888', marginBottom: 16, fontSize: 14 }}>
        Tìm kiếm và đăng ký đề tài khóa luận / thực tập
      </p>

      {/* Thông báo đăng ký */}
      {myReg && (
        <div style={{
          background: statusBg[myReg.status], padding: '10px 16px',
          borderRadius: 8, marginBottom: 16, fontSize: 13,
          color: statusColor[myReg.status],
        }}>
          📌 Bạn đã đăng ký: <strong>{myReg.topic_title}</strong>
          {' — '}{statusMap[myReg.status]}
        </div>
      )}

      {/* Bộ lọc */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
        <input
          placeholder="🔍 Tìm kiếm đề tài..."
          value={searchInput}
          onChange={e => setSearchInput(e.target.value)}
          style={{
            flex: 1, minWidth: 200, padding: '8px 12px',
            border: '1px solid #ddd', borderRadius: 8, fontSize: 13, fontFamily: 'inherit',
          }}
        />
        <input
          placeholder="Lĩnh vực..."
          value={field}
          onChange={e => setField(e.target.value)}
          style={{
            minWidth: 140, padding: '8px 12px',
            border: '1px solid #ddd', borderRadius: 8, fontSize: 13, fontFamily: 'inherit',
          }}
        />
        <select
          value={teacherId}
          onChange={e => setTeacherId(e.target.value)}
          style={{
            padding: '8px 12px', border: '1px solid #ddd',
            borderRadius: 8, fontSize: 13, fontFamily: 'inherit',
          }}
        >
          <option value="">Tất cả giảng viên</option>
          {teachers.map(t => <option key={t.id} value={t.id}>{t.full_name}</option>)}
        </select>
      </div>

      {/* Bảng đề tài */}
      {topics.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 60, color: '#aaa' }}>
          Không tìm thấy đề tài phù hợp.
        </div>
      ) : (
        <div style={{ overflowX: 'auto', border: '1px solid #ddd', borderRadius: 10, background: 'white' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ background: '#f0f7f4' }}>
                {['#', 'Giảng viên HD', 'Hướng nghiên cứu', 'Tên đề tài', 'Email', 'Mô tả', 'Yêu cầu', 'Đăng ký'].map(h => (
                  <th key={h} style={{
                    padding: '12px 14px', textAlign: 'left', fontWeight: 600,
                    color: '#0F6E56', borderBottom: '2px solid #1D9E75',
                    fontSize: 12, whiteSpace: 'nowrap',
                  }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {topics.map((topic, idx) => {
                const isFull   = parseInt(topic.approved_count) >= topic.max_students;
                const isMyReg  = myReg?.topic_id === topic.id;
                const isExpand = expandedDesc[topic.id];
                const desc     = topic.description || '';
                const shortDesc = desc.length > 120 ? desc.slice(0, 120) + '...' : desc;

                return (
                  <tr key={topic.id} style={{
                    borderBottom: '1px solid #f0f0f0',
                    background: idx % 2 === 0 ? 'white' : '#fafafa',
                  }}>
                    {/* STT */}
                    <td style={{ padding: '12px 14px', color: '#aaa', textAlign: 'center', verticalAlign: 'top' }}>
                      {idx + 1}
                    </td>

                    {/* Giảng viên */}
                    <td style={{ padding: '12px 14px', verticalAlign: 'top', minWidth: 140 }}>
                      <div style={{ fontWeight: 600, color: '#333' }}>{topic.teacher_name}</div>
                      <div style={{ marginTop: 4 }}>
                        <span style={{
                          background: isFull ? '#FCEBEB' : '#E1F5EE',
                          color: isFull ? '#A32D2D' : '#0F6E56',
                          padding: '2px 8px', borderRadius: 20, fontSize: 11,
                        }}>
                          {isFull ? 'Đã đủ' : `Còn chỗ (${topic.approved_count}/${topic.max_students})`}
                        </span>
                      </div>
                    </td>

                    {/* Hướng nghiên cứu */}
                    <td style={{ padding: '12px 14px', verticalAlign: 'top', minWidth: 130 }}>
                      <span style={{
                        background: '#E6F1FB', color: '#185FA5',
                        padding: '3px 8px', borderRadius: 6, fontSize: 12,
                      }}>
                        {topic.field}
                      </span>
                    </td>

                    {/* Tên đề tài */}
                    <td style={{ padding: '12px 14px', verticalAlign: 'top', minWidth: 200, maxWidth: 220 }}>
                      <div style={{ fontWeight: 600, color: '#222', lineHeight: 1.5 }}>
                        {topic.title}
                      </div>
                    </td>

                    {/* Email */}
                    <td style={{ padding: '12px 14px', verticalAlign: 'top', minWidth: 160 }}>
                      <a href={`mailto:${topic.teacher_email}`} style={{ color: '#185FA5', fontSize: 12 }}>
                        {topic.teacher_email || '—'}
                      </a>
                    </td>

                    {/* Mô tả */}
                    <td style={{ padding: '12px 14px', verticalAlign: 'top', minWidth: 220, maxWidth: 280 }}>
                      <div style={{ color: '#555', lineHeight: 1.6, fontSize: 12 }}>
                        {isExpand ? desc : shortDesc}
                        {desc.length > 120 && (
                          <span
                            onClick={() => toggleDesc(topic.id)}
                            style={{ color: '#1D9E75', cursor: 'pointer', marginLeft: 4, fontSize: 12 }}
                          >
                            {isExpand ? ' Thu gọn' : ' Xem thêm'}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Yêu cầu */}
                    <td style={{ padding: '12px 14px', verticalAlign: 'top', minWidth: 160, maxWidth: 200 }}>
                      <div style={{ color: '#777', fontSize: 12, fontStyle: 'italic', lineHeight: 1.5 }}>
                        {topic.requirements || '—'}
                      </div>
                    </td>

                    {/* Đăng ký */}
                    <td style={{ padding: '12px 14px', verticalAlign: 'top', textAlign: 'center', minWidth: 100 }}>
                      {isMyReg ? (
                        <span style={{
                          background: '#FAEEDA', color: '#854F0B',
                          padding: '4px 10px', borderRadius: 6, fontSize: 11, fontWeight: 500,
                        }}>
                          Đã đăng ký
                        </span>
                      ) : myReg ? (
                        <span style={{ color: '#bbb', fontSize: 12 }}>Đã chọn<br/>đề tài khác</span>
                      ) : isFull ? (
                        <span style={{
                          background: '#f5f5f5', color: '#aaa',
                          padding: '4px 10px', borderRadius: 6, fontSize: 11,
                        }}>
                          Đã đủ
                        </span>
                      ) : (
                        <button onClick={() => handleRegister(topic.id)} style={{
                          padding: '6px 14px', background: '#1D9E75',
                          color: 'white', border: 'none', borderRadius: 6,
                          fontSize: 12, fontWeight: 600, cursor: 'pointer',
                          whiteSpace: 'nowrap',
                        }}>
                          Đăng ký
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Footer info */}
      <div style={{ marginTop: 12, fontSize: 12, color: '#bbb', textAlign: 'right' }}>
        Tổng cộng {topics.length} đề tài
      </div>
    </div>
  );
};

export default TopicList;