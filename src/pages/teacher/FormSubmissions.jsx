import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import toast from 'react-hot-toast';

const FormSubmissions = () => {

  const navigate = useNavigate();

  const [forms, setForms] = useState([]);
  // track which topic cards are collapsed
  const [collapsed, setCollapsed] = useState({});

  useEffect(() => {
    fetchForms();
  }, []);

  const fetchForms = async () => {
    try {
      const res = await api.get('/forms/teacher/submissions');
      setForms(res.data);
    } catch (err) {
      console.log(err);
      toast.error('Không tải được submissions');
    }
  };

  // ── Group forms by topic_title ──────────────────────────────────
  const grouped = forms.reduce((acc, f) => {
    const key = f.topic_title || 'Không có đề tài';
    if (!acc[key]) acc[key] = [];
    acc[key].push(f);
    return acc;
  }, {});

  const topics = Object.entries(grouped);

  const toggleCollapse = (title) => {
    setCollapsed(prev => ({
      ...prev,
      [title]: !prev[title],
    }));
  };

  // ── Status badge ────────────────────────────────────────────────
  const getStatusStyle = (status) => {
    switch (status) {
      case 'approved':
        return { bg: '#DCFCE7', color: '#166534', label: 'Approved' };
      case 'rejected':
        return { bg: '#FEE2E2', color: '#991B1B', label: 'Rejected' };
      case 'submitted':
        return { bg: '#DBEAFE', color: '#1D4ED8', label: 'Submitted' };
      default:
        return { bg: '#F3F4F6', color: '#374151', label: 'Draft' };
    }
  };

  // ── Summary badge counts per topic ──────────────────────────────
  const countByStatus = (list) => {
    return list.reduce((acc, f) => {
      acc[f.status] = (acc[f.status] || 0) + 1;
      return acc;
    }, {});
  };

  // ── Render ───────────────────────────────────────────────────────
  return (
    <div style={{
      maxWidth: 1100,
      margin: '0 auto',
      padding: '24px 16px',
    }}>

      {/* Page header */}
      <div style={{ marginBottom: 28 }}>
        <h2 style={{ marginBottom: 4 }}>
          Student Form Submissions
        </h2>
        <p style={{ color: '#888', fontSize: 14 }}>
          {topics.length} đề tài · {forms.length} forms
        </p>
      </div>

      {/* Empty state */}
      {topics.length === 0 && (
        <div style={{
          background: 'white',
          border: '1px solid #eee',
          borderRadius: 14,
          padding: 60,
          textAlign: 'center',
          color: '#888',
          fontSize: 14,
        }}>
          No submissions found
        </div>
      )}

      {/* Topic groups */}
      {topics.map(([topicTitle, topicForms]) => {

        const counts   = countByStatus(topicForms);
        const isOpen   = !collapsed[topicTitle];
        const pending  = counts['submitted'] || 0;

        return (
          <div
            key={topicTitle}
            style={{
              background: 'white',
              border: '1px solid #e5e7eb',
              borderRadius: 14,
              marginBottom: 16,
              overflow: 'hidden',
              boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
            }}
          >

            {/* ── Topic header (clickable) ── */}
            <div
              onClick={() => toggleCollapse(topicTitle)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '16px 20px',
                cursor: 'pointer',
                background: isOpen ? '#f8fafc' : 'white',
                borderBottom: isOpen ? '1px solid #e5e7eb' : 'none',
                userSelect: 'none',
              }}
            >

              {/* Left: topic info */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, flex: 1 }}>

                {/* Collapse arrow */}
                <span style={{
                  fontSize: 12,
                  color: '#9ca3af',
                  transition: 'transform 0.2s',
                  transform: isOpen ? 'rotate(90deg)' : 'rotate(0deg)',
                  display: 'inline-block',
                }}>
                  ▶
                </span>

                <div>
                  <div style={{
                    fontWeight: 700,
                    fontSize: 15,
                    color: '#111',
                    marginBottom: 3,
                  }}>
                    {topicTitle}
                  </div>

                  <div style={{ fontSize: 12, color: '#6b7280' }}>
                    {topicForms.length} form{topicForms.length > 1 ? 's' : ''}
                    {topicForms[0]?.student_name && (
                      <span style={{ marginLeft: 8 }}>
                        · {topicForms[0].student_name}
                      </span>
                    )}
                  </div>
                </div>

              </div>

              {/* Right: status summary badges */}
              <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>

                {pending > 0 && (
                  <span style={{
                    background: '#DBEAFE', color: '#1D4ED8',
                    padding: '3px 10px', borderRadius: 20,
                    fontSize: 12, fontWeight: 600,
                  }}>
                    {pending} pending
                  </span>
                )}

                {counts['approved'] > 0 && (
                  <span style={{
                    background: '#DCFCE7', color: '#166534',
                    padding: '3px 10px', borderRadius: 20,
                    fontSize: 12, fontWeight: 600,
                  }}>
                    {counts['approved']} approved
                  </span>
                )}

                {counts['rejected'] > 0 && (
                  <span style={{
                    background: '#FEE2E2', color: '#991B1B',
                    padding: '3px 10px', borderRadius: 20,
                    fontSize: 12, fontWeight: 600,
                  }}>
                    {counts['rejected']} rejected
                  </span>
                )}

              </div>

            </div>

            {/* ── Forms table (collapsible) ── */}
            {isOpen && (
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>

                <thead>
                  <tr style={{ background: '#fafafa' }}>
                    <th style={th}>Student</th>
                    <th style={th}>Form</th>
                    <th style={th}>Submitted</th>
                    <th style={th}>Status</th>
                    <th style={th}>Action</th>
                  </tr>
                </thead>

                <tbody>
                  {topicForms.map((f) => {
                    const st = getStatusStyle(f.status);

                    return (
                      <tr
                        key={f.id}
                        style={{ transition: 'background 0.15s' }}
                        onMouseEnter={e => e.currentTarget.style.background = '#f9fafb'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                      >

                        <td style={td}>
                          <div style={{ fontWeight: 500, marginBottom: 2 }}>
                            {f.student_name}
                          </div>
                          <div style={{ color: '#9ca3af', fontSize: 12 }}>
                            {f.student_email}
                          </div>
                        </td>

                        <td style={td}>
                          <span style={{
                            background: '#E6F1FB', color: '#185FA5',
                            padding: '4px 10px', borderRadius: 8,
                            fontSize: 12, fontWeight: 700,
                          }}>
                            {f.form_type}
                          </span>
                        </td>

                        <td style={td}>
                          {f.submitted_at
                            ? new Date(f.submitted_at).toLocaleDateString('vi-VN')
                            : '-'}
                        </td>

                        <td style={td}>
                          <span style={{
                            background: st.bg, color: st.color,
                            padding: '4px 10px', borderRadius: 8,
                            fontSize: 12, fontWeight: 600,
                          }}>
                            {st.label}
                          </span>
                        </td>

                        <td style={td}>
                          <button
                            onClick={() => navigate(`/form-detail/${f.id}`)}
                            style={{
                              padding: '7px 14px',
                              background: '#2563eb',
                              color: 'white',
                              border: 'none',
                              borderRadius: 8,
                              cursor: 'pointer',
                              fontSize: 13,
                              fontWeight: 500,
                            }}
                          >
                            View Form
                          </button>
                        </td>

                      </tr>
                    );
                  })}
                </tbody>

              </table>
            )}

          </div>
        );
      })}

    </div>
  );
};

/* ═══════════ STYLES ═══════════ */

const th = {
  padding: '11px 16px',
  textAlign: 'left',
  fontSize: 12,
  fontWeight: 600,
  color: '#6b7280',
  borderBottom: '1px solid #f0f0f0',
};

const td = {
  padding: '13px 16px',
  fontSize: 13,
  borderBottom: '1px solid #f3f4f6',
  verticalAlign: 'middle',
};

export default FormSubmissions;