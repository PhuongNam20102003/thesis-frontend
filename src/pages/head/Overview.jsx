import { useState, useEffect } from 'react';
import { getOverview } from '../../services/councilService';

const Overview = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getOverview().then(res => setData(res.data)).finally(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ padding: 32 }}>Đang tải...</div>;

  const stats = [
    { label: 'Tổng đề tài',   value: data.total_topics, color: '#0F6E56', bg: '#E1F5EE' },
    { label: 'Số lượng sinh viên đã đăng ký', value: data.total_students_registered, color: '#185FA5', bg: '#E6F1FB'},
    { label: 'Đã duyệt',      value: data.approved,     color: '#3B6D11', bg: '#EAF3DE' },
    { label: 'Chờ duyệt',     value: data.pending,      color: '#854F0B', bg: '#FAEEDA' },
    { label: 'Từ chối',       value: data.rejected,     color: '#A32D2D', bg: '#FCEBEB' },
  ];

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '24px 16px' }}>
      <h2 style={{ marginBottom: 4 }}>Tổng quan hệ thống</h2>
      <p style={{ color: '#888', marginBottom: 24, fontSize: 14 }}>
        Bộ môn Công nghệ thông tin — Học kỳ 2, 2024-2025
      </p>

      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 28 }}>
        {stats.map(s => (
          <div key={s.label} style={{
            background: s.bg, borderRadius: 10, padding: '16px 20px',
          }}>
            <div style={{ fontSize: 12, color: s.color, marginBottom: 6, opacity: 0.8 }}>{s.label}</div>
            <div style={{ fontSize: 28, fontWeight: 600, color: s.color }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Biểu đồ đơn giản — tỉ lệ duyệt */}
      <div style={{ background: 'white', border: '1px solid #eee', borderRadius: 12, padding: 24, marginBottom: 24 }}>
        <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 16 }}>Tỉ lệ xét duyệt</h3>
        {(() => {
          const total = data.approved + data.pending + data.rejected || 1;
          const bars = [
            { label: 'Đã duyệt', value: data.approved, color: '#1D9E75' },
            { label: 'Chờ duyệt', value: data.pending, color: '#EF9F27' },
            { label: 'Từ chối', value: data.rejected, color: '#E24B4A' },
          ];
          return bars.map(bar => (
            <div key={bar.label} style={{ marginBottom: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
                <span style={{ color: '#555' }}>{bar.label}</span>
                <span style={{ fontWeight: 500 }}>{bar.value} ({Math.round(bar.value / total * 100)}%)</span>
              </div>
              <div style={{ height: 8, background: '#f5f5f5', borderRadius: 4, overflow: 'hidden' }}>
                <div style={{
                  height: '100%', width: `${bar.value / total * 100}%`,
                  background: bar.color, borderRadius: 4, transition: 'width 0.5s ease',
                }} />
              </div>
            </div>
          ));
        })()}
      </div>

      {/* Danh sách giảng viên */}
      <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>Tóm tắt theo giảng viên</h3>
      {data.teachers.map(t => (
        <div key={t.id} style={{
          background: 'white', border: '1px solid #eee', borderRadius: 10,
          padding: '14px 20px', marginBottom: 10,
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 500 }}>{t.full_name}</div>
            <div style={{ fontSize: 12, color: '#888', marginTop: 2 }}>{t.research_field || 'Chưa cập nhật lĩnh vực'}</div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <span style={{ background: '#E6F1FB', color: '#185FA5', padding: '3px 10px', borderRadius: 6, fontSize: 12 }}>
              {t.topic_count} đề tài
            </span>
            <span style={{ background: '#EAF3DE', color: '#3B6D11', padding: '3px 10px', borderRadius: 6, fontSize: 12 }}>
              {t.student_count} sinh viên
            </span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Overview;