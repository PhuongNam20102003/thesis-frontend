import { useEffect, useState } from 'react';
import api from '../../services/api';

const FORMS = ['BM02', 'BM04', 'BM08'];

const STATUS_MAP = {
  approved: { bg: '#dcfce7', color: '#15803d', border: '#86efac', icon: '✓' },
  submitted:{ bg: '#fef9c3', color: '#854d0e', border: '#fde047', icon: '⏳' },
  rejected: { bg: '#fee2e2', color: '#dc2626', border: '#fca5a5', icon: '↩' },
  draft:    { bg: '#f3f4f6', color: '#9ca3af', border: '#e5e7eb', icon: '✎' },
  null:     { bg: '#f9fafb', color: '#d1d5db', border: '#e5e7eb', icon: '□' },
};

const FormProgress = ({ role = 'student' }) => {

  const [rows, setRows]       = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortKey, setSortKey] = useState(null);
  const [sortDir, setSortDir] = useState('asc');
  const [filter, setFilter]   = useState('');

  useEffect(() => {
    const endpoint = role === 'student'
      ? '/forms/progress/my'
      : '/forms/progress/all';
    api.get(endpoint)
      .then(res => setRows(res.data || []))
      .catch(err => { console.error(err); setRows([]); })
      .finally(() => setLoading(false));
  }, [role]);

  // ── Sort ───────────────────────────────────────────────────────
  const handleSort = (key) => {
    setSortDir(d => sortKey === key ? (d === 'asc' ? 'desc' : 'asc') : 'asc');
    setSortKey(key);
  };

  const arrow = (key) =>
    sortKey === key ? (sortDir === 'asc' ? ' ▲' : ' ▼') : ' ⇅';

  // ── Filter + Sort ──────────────────────────────────────────────
  const displayed = [...rows]
    .filter(r => {
      const q = filter.toLowerCase();
      return !q
        || r.title?.toLowerCase().includes(q)
        || r.field?.toLowerCase().includes(q)
        || r.supervisor?.toLowerCase().includes(q)
        || r.student_name?.toLowerCase().includes(q);
    })
    .sort((a, b) => {
      if (!sortKey) return 0;
      const va = a[sortKey] ?? '';
      const vb = b[sortKey] ?? '';
      return sortDir === 'asc'
        ? String(va).localeCompare(String(vb), 'vi')
        : String(vb).localeCompare(String(va), 'vi');
    });

  // ── Status badge ───────────────────────────────────────────────
  const Badge = ({ status }) => {
    const s = STATUS_MAP[status] || STATUS_MAP['null'];
    return (
      <span style={{
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        width: 30, height: 30, borderRadius: 7,
        background: s.bg, color: s.color,
        border: `1.5px solid ${s.border}`,
        fontWeight: 700, fontSize: 13,
      }} title={status || 'Chưa nộp'}>
        {s.icon}
      </span>
    );
  };

  // ── Sortable TH ────────────────────────────────────────────────
  const SortTh = ({ label, k, center, width }) => (
    <th
      onClick={() => handleSort(k)}
      style={{
        ...th,
        textAlign: center ? 'center' : 'left',
        width, cursor: 'pointer', userSelect: 'none',
        color: sortKey === k ? '#2563eb' : '#374151',
        background: sortKey === k ? '#eff6ff' : '#f8fafc',
      }}
    >
      {label}
      <span style={{ opacity: sortKey === k ? 1 : 0.3, fontSize: 10 }}>
        {arrow(k)}
      </span>
    </th>
  );

  const PlainTh = ({ label, center, width }) => (
    <th style={{ ...th, textAlign: center ? 'center' : 'left', width }}>
      {label}
    </th>
  );

  if (loading) return <div style={{ padding: 40, textAlign: 'center', color: '#9ca3af' }}>Loading...</div>;

  // ── Summary counts ─────────────────────────────────────────────
  const total    = displayed.length;
  const allDone  = displayed.filter(r =>
    r.bm02 === 'approved' && r.bm04 === 'approved' && r.bm08 === 'approved'
  ).length;
  const pending  = displayed.filter(r =>
    r.bm02 === 'submitted' || r.bm04 === 'submitted' || r.bm08 === 'submitted'
  ).length;

  return (
    <div style={{ maxWidth: 1300, margin: '0 auto', padding: '24px 16px' }}>

      {/* ── Header ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h2 style={{ margin: 0 }}>Thesis Form Progress</h2>
          <p style={{ color: '#9ca3af', fontSize: 13, marginTop: 4, marginBottom: 0 }}>
            Theo dõi trạng thái nộp biểu mẫu
          </p>
        </div>
        <input
          placeholder="Tìm tên đề tài, lĩnh vực, giảng viên..."
          value={filter}
          onChange={e => setFilter(e.target.value)}
          style={{
            padding: '9px 14px', borderRadius: 10,
            border: '1px solid #d1d5db', fontSize: 13,
            width: 280, outline: 'none',
          }}
        />
      </div>

      {/* ── Summary cards ── */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
        {[
          { label: 'Tổng đề tài', value: total,   bg: '#f0f9ff', color: '#0369a1' },
          { label: 'Hoàn thành',  value: allDone, bg: '#f0fdf4', color: '#15803d' },
          { label: 'Đang chờ duyệt', value: pending, bg: '#fefce8', color: '#854d0e' },
        ].map(c => (
          <div key={c.label} style={{
            background: c.bg, borderRadius: 12, padding: '12px 20px',
            minWidth: 130,
          }}>
            <div style={{ fontSize: 24, fontWeight: 700, color: c.color }}>{c.value}</div>
            <div style={{ fontSize: 12, color: c.color, opacity: 0.8 }}>{c.label}</div>
          </div>
        ))}
      </div>

      {/* ── Legend ── */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 14, fontSize: 12, flexWrap: 'wrap' }}>
        {Object.entries(STATUS_MAP).map(([key, s]) => (
          <span key={key} style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#374151' }}>
            <span style={{
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              width: 22, height: 22, borderRadius: 5,
              background: s.bg, color: s.color, border: `1.5px solid ${s.border}`,
              fontWeight: 700, fontSize: 11,
            }}>{s.icon}</span>
            {key === 'null' ? 'Chưa nộp' : key.charAt(0).toUpperCase() + key.slice(1)}
          </span>
        ))}
      </div>

      {/* ── Table ── */}
      <div style={{
        background: 'white', border: '1px solid #e5e7eb',
        borderRadius: 14, overflow: 'auto',
        boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
      }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 860 }}>

          <thead>
            <tr>
              <PlainTh label="No."          center width={52} />
              <SortTh  label="Supervisor"   k="supervisor"  width={180} />
              <PlainTh label="Số SV"        center          width={72} />
              <SortTh  label="Tên đề tài"   k="title" />
              {FORMS.map(f => (
                <PlainTh key={f} label={f} center width={72} />
              ))}
            </tr>
          </thead>

          <tbody>
            {displayed.length === 0 && (
              <tr>
                <td colSpan={6}
                  style={{ padding: 50, textAlign: 'center', color: '#9ca3af', fontSize: 14 }}>
                  Không có dữ liệu
                </td>
              </tr>
            )}

            {displayed.map((r, idx) => (
              <tr
                key={r.topic_id || idx}
                style={{ background: idx % 2 === 0 ? 'white' : '#fafafa', transition: 'background 0.1s' }}
                onMouseEnter={e => e.currentTarget.style.background = '#f0f7ff'}
                onMouseLeave={e => e.currentTarget.style.background = idx % 2 === 0 ? 'white' : '#fafafa'}
              >

                <td style={{ ...td, textAlign: 'center', color: '#9ca3af', fontSize: 12 }}>
                  {idx + 1}
                </td>

                <td style={td}>
                  <div style={{ fontSize: 13, fontWeight: 500 }}>{r.supervisor || '—'}</div>
                </td>

                <td style={{ ...td, textAlign: 'center', fontWeight: 600 }}>
                  {r.actual_students ?? 0}
                </td>

                <td style={{ ...td, maxWidth: 320, lineHeight: 1.5 }}>
                  <div>{r.title || '—'}</div>
                  {r.field && (
                    <span style={{
                      display: 'inline-block', marginTop: 4,
                      background: '#fef9c3', color: '#854d0e',
                      padding: '2px 7px', borderRadius: 5,
                      fontSize: 11, fontWeight: 700,
                    }}>
                      {r.field}
                    </span>
                  )}
                </td>

                {FORMS.map(f => (
                  <td key={f} style={{ ...td, textAlign: 'center' }}>
                    <Badge status={r[f.toLowerCase()]} />
                  </td>
                ))}

              </tr>
            ))}
          </tbody>

        </table>
      </div>

    </div>
  );
};

/* ═══════════ STYLES ═══════════ */

const th = {
  padding: '12px 14px',
  fontSize: 12,
  fontWeight: 600,
  color: '#374151',
  borderBottom: '2px solid #e5e7eb',
  background: '#f8fafc',
  whiteSpace: 'nowrap',
};

const td = {
  padding: '12px 14px',
  fontSize: 13,
  borderBottom: '1px solid #f3f4f6',
  verticalAlign: 'middle',
};

export default FormProgress;