import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import SignaturePad from '../../components/SignaturePad';
import toast from 'react-hot-toast';

// 6 reporting periods
const PERIODS = [1, 2, 3, 4, 5, 6];

const emptyForm = (index) => ({
  student_name:  '',
  teacher_name:  '',
  student_id:    '',
  student_class: '',
  intake:        '',
  major:         '',

  report_index: index,
  week_from:    '',
  week_to:      '',

  thesis_title: '',

  research_activities:    '',
  results_obtained:       '',
  relevance:              '',
  feedback_incorporation: '',
  negative_learning:      '',

  changes_description: '',
  has_no_change:       false,

  planned_activities:  '',
  expected_challenges: '',
  timeline:            '',

  other_comments: '',
});

const FormBM04 = ({
  readonly = false,
  previewData = null,
  teacherView = false,
  onTeacherSignatureChange = null,
}) => {

  const { user } = useAuth();
  const printRef = useRef(null);

  const [loading, setLoading]   = useState(true);
  const [saving, setSaving]     = useState(false);
  const [regInfo, setRegInfo]   = useState(null);

  // selectedPeriod: which period tab is active (1–6)
  const [selectedPeriod, setSelectedPeriod] = useState(1);

  // periods: map of report_index → { form_data, status, student_signature,
  //           teacher_signature, teacher_comment, id }
  const [periods, setPeriods] = useState(() =>
    Object.fromEntries(PERIODS.map(i => [i, {
      form_data:         emptyForm(i),
      status:            'new',       // 'new' = never submitted
      student_signature: null,
      teacher_signature: null,
      teacher_comment:   '',
      id:                null,
    }]))
  );

  // ── Load ──────────────────────────────────────────────────────────

  useEffect(() => {

    // teacherView: previewData is a single form
    if (previewData) {
      const idx = previewData.form_data?.report_index || 1;
      setPeriods(prev => ({
        ...prev,
        [idx]: {
          form_data:         previewData.form_data || emptyForm(idx),
          status:            previewData.status || 'draft',
          student_signature: previewData.student_signature,
          teacher_signature: previewData.teacher_signature,
          teacher_comment:   previewData.teacher_comment || '',
          id:                previewData.id,
        },
      }));
      setSelectedPeriod(idx);
      setLoading(false);
      return;
    }

    // Student view: load all submitted periods
    api.get('/forms/my/BM04')
      .then(res => {
        setRegInfo(res.data.registration);

        const serverForms = res.data.forms || [];  // array of all BM04 forms

        setPeriods(prev => {
          const next = { ...prev };

          PERIODS.forEach(i => {
            const found = serverForms.find(
              f => f.form_data?.report_index === i
            );

            if (found) {
              next[i] = {
                form_data:         found.form_data,
                status:            found.status || 'draft',
                student_signature: found.student_signature,
                teacher_signature: found.teacher_signature,
                teacher_comment:   found.teacher_comment || '',
                id:                found.id,
              };
            } else {
              // Pre-fill student info for new periods
              next[i] = {
                ...next[i],
                form_data: {
                  ...emptyForm(i),
                  student_name:  user?.full_name || '',
                  teacher_name:  res.data.registration?.teacher_name || '',
                  student_id:    user?.student_id || '',
                  student_class: user?.student_class || '',
                  intake:        user?.intake || '',
                  major:         user?.major || 'Information Technology',
                  thesis_title:  res.data.registration?.topic_title || '',
                },
              };
            }
          });

          return next;
        });

        // Auto-select first open period
        const firstOpen = serverForms.length < 6
          ? (serverForms.length + 1)
          : 1;
        setSelectedPeriod(Math.min(firstOpen, 6));
      })
      .catch(() => toast.error('Không thể tải BM04!'))
      .finally(() => setLoading(false));

  }, [user, previewData]);

  // ── Helpers ───────────────────────────────────────────────────────

  const current     = periods[selectedPeriod];
  const data        = current.form_data;
  const formStatus  = current.status;

  const isLocked = (idx) => {
    const s = periods[idx].status;
    return s === 'submitted' || s === 'approved';
  };

  const canEdit =
    !readonly &&
    !isLocked(selectedPeriod) &&
    formStatus !== 'approved';

  const periodLabel = (i) => `Weeks ${i * 2 - 1} & ${i * 2}`;

  // ── Change ────────────────────────────────────────────────────────

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setPeriods(prev => ({
      ...prev,
      [selectedPeriod]: {
        ...prev[selectedPeriod],
        form_data: {
          ...prev[selectedPeriod].form_data,
          [name]: type === 'checkbox' ? checked : value,
        },
      },
    }));
  };

  const setSignature = (sig) => {
    setPeriods(prev => ({
      ...prev,
      [selectedPeriod]: {
        ...prev[selectedPeriod],
        student_signature: sig,
      },
    }));
  };

  const handleTeacherSignatureSave = (sig) => {
    setPeriods(prev => ({
      ...prev,
      [selectedPeriod]: {
        ...prev[selectedPeriod],
        teacher_signature: sig,
      },
    }));
    if (onTeacherSignatureChange) onTeacherSignatureChange(sig);
  };

  // ── Save ──────────────────────────────────────────────────────────

  const handleSave = async (action) => {
    if (action === 'submit' && !current.student_signature) {
      toast.error('Vui lòng ký tên trước khi nộp!');
      return;
    }
    if (!regInfo) {
      toast.error('Không tìm thấy thông tin đề tài!');
      return;
    }

    setSaving(true);
    try {
      await api.post('/forms/submit', {
        topic_id:          regInfo.topic_id,
        form_type:         'BM04',
        form_data:         { ...data, report_index: selectedPeriod },
        student_signature: current.student_signature,
        action,
      });

      toast.success(
        action === 'submit' ? `Đã nộp ${periodLabel(selectedPeriod)}!` : 'Đã lưu bản nháp!'
      );

      if (action === 'submit') {
        setPeriods(prev => ({
          ...prev,
          [selectedPeriod]: {
            ...prev[selectedPeriod],
            status: 'submitted',
          },
        }));
      }

    } catch (err) {
      toast.error(err.response?.data?.message || 'Có lỗi xảy ra!');
    } finally {
      setSaving(false);
    }
  };

  // ── Loading / no topic ────────────────────────────────────────────

  if (loading) return <div style={{ padding: 30 }}>Loading...</div>;

  if (!regInfo && !previewData && !teacherView) {
    return (
      <div style={{ padding: 30, textAlign: 'center' }}>
        Bạn chưa có đề tài được duyệt.
      </div>
    );
  }

  // ── Render ────────────────────────────────────────────────────────

  return (
    <div style={page}>

      {/* ── ACTION BAR ── */}
      {!readonly && (
        <div style={topbar}>
          <div>
            <h2 style={{ margin: 0 }}>BM04 — Biweekly Progress Report</h2>
            <div style={{ fontSize: 13, color: '#666', marginTop: 4 }}>
              Fill all required information
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            {canEdit && (
              <>
                <button onClick={() => handleSave('save')} disabled={saving} style={btnWhite}>
                  Lưu bản nháp
                </button>
                <button onClick={() => handleSave('submit')} disabled={saving} style={btnGreen}>
                  Nộp biểu mẫu
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* ── PERIOD TABS ─────────────────────────────────────────── */}
      <div style={{
        maxWidth: '210mm',
        margin: '0 auto 20px',
        display: 'grid',
        gridTemplateColumns: 'repeat(6, 1fr)',
        gap: 8,
      }}>
        {PERIODS.map(i => {
          const s       = periods[i].status;
          const locked  = isLocked(i);
          const active  = selectedPeriod === i;
          const isNew   = s === 'new';

          const tabColor =
            s === 'approved' ? { bg: '#dcfce7', border: '#22c55e', text: '#15803d' } :
            s === 'rejected' ? { bg: '#fee2e2', border: '#f87171', text: '#dc2626' } :
            s === 'submitted'? { bg: '#dbeafe', border: '#60a5fa', text: '#1d4ed8' } :
            s === 'draft'    ? { bg: '#fef9c3', border: '#facc15', text: '#854d0e' } :
                               { bg: '#f3f4f6', border: '#d1d5db', text: '#6b7280' };

          return (
            <button
              key={i}
              onClick={() => setSelectedPeriod(i)}
              style={{
                padding: '10px 6px',
                borderRadius: 10,
                border: active
                  ? `2px solid ${tabColor.border}`
                  : `1px solid ${tabColor.border}`,
                background: active ? tabColor.bg : 'white',
                color: tabColor.text,
                cursor: 'pointer',
                fontSize: 12,
                fontWeight: active ? 700 : 500,
                textAlign: 'center',
                transition: 'all 0.15s',
                boxShadow: active ? `0 0 0 3px ${tabColor.border}33` : 'none',
              }}
            >
              <div style={{ fontSize: 13, marginBottom: 3 }}>
                {periodLabel(i)}
              </div>
              <div style={{ fontSize: 11, opacity: 0.85 }}>
                {locked  ? '🔒 Locked' :
                 s === 'draft'    ? '✏️ Draft' :
                 s === 'rejected' ? '❌ Rejected' :
                                    '📝 Open'}
              </div>
            </button>
          );
        })}
      </div>

      {/* ── STATUS BANNER ── */}
      {formStatus === 'submitted' && (
        <div style={statusBlue}>⏳ {periodLabel(selectedPeriod)} đã gửi và đang chờ duyệt</div>
      )}
      {formStatus === 'approved' && (
        <div style={statusGreen}>✅ {periodLabel(selectedPeriod)} đã được phê duyệt</div>
      )}
      {formStatus === 'rejected' && (
        <div style={statusRed}>❌ {periodLabel(selectedPeriod)} bị từ chối — vui lòng chỉnh sửa và nộp lại</div>
      )}

      {/* ── TEACHER COMMENT ── */}
      {current.teacher_comment && (
        <div style={commentBox}>
          <b>Teacher Comment:</b>
          <div style={{ marginTop: 8 }}>{current.teacher_comment}</div>
        </div>
      )}

      {/* ── A4 PAPER ── */}
      <div id="print-area" ref={printRef} style={paper}>

        {/* HEADER */}
        <div style={header}>
          <div>
            <div style={{ fontWeight: 700 }}>NGUYEN TAT THANH UNIVERSITY</div>
            <div>NTT INSTITUTE OF INTERNATIONAL EDUCATION</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontWeight: 700 }}>SOCIALIST REPUBLIC OF VIETNAM</div>
            <div>Independence – Freedom – Happiness</div>
          </div>
        </div>

        {/* TITLE */}
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <h1 style={{ margin: 0, fontSize: 26, fontFamily: 'Times New Roman' }}>
            BIWEEKLY PROGRESS REPORT
          </h1>
        </div>

        <div style={content}>

          {/* REPORTING PERIOD */}
          <div style={{ textAlign: 'center', marginBottom: 20, fontSize: 15 }}>
            <b>Reporting Period: {periodLabel(selectedPeriod)}</b>
            <span style={{ marginLeft: 20 }}>
              From:{' '}
              <input type="date" name="week_from" value={data.week_from || ''}
                onChange={handleChange} disabled={!canEdit}
                style={{ ...dateInput, marginLeft: 6, marginRight: 12 }} />
              To:{' '}
              <input type="date" name="week_to" value={data.week_to || ''}
                onChange={handleChange} disabled={!canEdit}
                style={{ ...dateInput, marginLeft: 6 }} />
            </span>
          </div>

          {/* STUDENT INFO */}
          <div style={row}>
            <b>Student Name:</b>
            <input name="student_name" value={data.student_name || ''} onChange={handleChange}
              disabled={!canEdit} style={inlineInput} />
          </div>
          <div style={grid2}>
            <div style={row}>
              <b>Student ID:</b>
              <input name="student_id" value={data.student_id || ''} onChange={handleChange}
                disabled={!canEdit} style={inlineInput} />
            </div>
            <div style={row}>
              <b>Major:</b>
              <input name="major" value={data.major || ''} onChange={handleChange}
                disabled={!canEdit} style={inlineInput} />
            </div>
          </div>
          <div style={grid2}>
            <div style={row}>
              <b>Class:</b>
              <input name="student_class" value={data.student_class || ''} onChange={handleChange}
                disabled={!canEdit} style={inlineInput} />
            </div>
            <div style={row}>
              <b>Intake:</b>
              <input name="intake" value={data.intake || ''} onChange={handleChange}
                disabled={!canEdit} style={inlineInput} />
            </div>
          </div>
          <div style={row}>
            <b>Supervisor:</b>
            <input name="teacher_name" value={data.teacher_name || ''} onChange={handleChange}
              disabled={!canEdit} style={inlineInput} />
          </div>

          {/* THESIS TITLE */}
          <div style={{ marginTop: 20 }}>
            <b>Thesis Title:</b>
            <span style={{ fontSize: 13, color: '#666', marginLeft: 8, fontStyle: 'italic' }}>
              (If changed, briefly explain why)
            </span>
            <textarea name="thesis_title" value={data.thesis_title || ''} onChange={handleChange}
              disabled={!canEdit} rows={3} style={textarea} />
          </div>

          {/* 1. PROGRESS */}
          <div style={sectionTitle}>1. Progress to Date</div>
          <p style={sectionHint}>
            Present research work undertaken since your last report: results obtained,
            relevance to project, feedback incorporation, and lessons from negative results.
          </p>
          <SubField label="Research Activities Undertaken" name="research_activities"
            value={data.research_activities} onChange={handleChange} canEdit={canEdit} />
          <SubField label="Results Obtained" name="results_obtained"
            value={data.results_obtained} onChange={handleChange} canEdit={canEdit} />
          <SubField label="Relevance to Project" name="relevance"
            value={data.relevance} onChange={handleChange} canEdit={canEdit} />
          <SubField label="Feedback Incorporation" name="feedback_incorporation"
            value={data.feedback_incorporation} onChange={handleChange} canEdit={canEdit} />
          <SubField label="Learning from Negative Results" name="negative_learning"
            value={data.negative_learning} onChange={handleChange} canEdit={canEdit} />

          {/* 2. CHANGES */}
          <div style={sectionTitle}>2. Significant Changes from the Research Proposal</div>
          <p style={sectionHint}>
            Describe shortly if there have been significant changes from the original project plan.
          </p>
          <b>Description of Changes:</b>
          <textarea name="changes_description" value={data.changes_description || ''}
            onChange={handleChange}
            disabled={!canEdit || data.has_no_change}
            rows={4}
            style={{
              ...textarea,
              background: data.has_no_change ? '#f3f4f6' : 'white',
              cursor: (data.has_no_change || !canEdit) ? 'not-allowed' : 'text',
            }}
          />
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 10, fontSize: 15 }}>
            <input type="checkbox" name="has_no_change" checked={!!data.has_no_change}
              onChange={handleChange} disabled={!canEdit} style={{ width: 16, height: 16 }} />
            Check here if No Change
          </label>

          {/* 3. NEXT STEPS */}
          <div style={sectionTitle}>3. Potential Next Steps</div>
          <p style={sectionHint}>Describe which next steps you plan to do in your research work.</p>
          <SubField label="Planned Activities" name="planned_activities"
            value={data.planned_activities} onChange={handleChange} canEdit={canEdit} />
          <SubField label="Expected Challenges and Solutions" name="expected_challenges"
            value={data.expected_challenges} onChange={handleChange} canEdit={canEdit} />
          <SubField label="Tentative Timeline / Milestones" name="timeline"
            value={data.timeline} onChange={handleChange} canEdit={canEdit} rows={3} />

          {/* 4. OTHER */}
          <div style={sectionTitle}>4. Other Comments / Pertinent Information</div>
          <p style={sectionHint}>Include any personal challenges, resource needs, etc.</p>
          <textarea name="other_comments" value={data.other_comments || ''} onChange={handleChange}
            disabled={!canEdit} rows={4} style={textarea} />

          {/* DATE */}
          <div style={cityDate}>
            Ho Chi Minh City, {new Date().toLocaleDateString()}
          </div>

          {/* SIGNATURES */}
          <div style={signGrid}>

            <div>
              <b>Student</b>
              <div>(Name & signature)</div>
              <div style={{ marginTop: 15 }}>
                <SignaturePad
                  existingSignature={current.student_signature}
                  onSave={setSignature}
                  readonly={!canEdit}
                />
              </div>
              <div style={{ marginTop: 10 }}>
                {(readonly || teacherView) ? data.student_name : user?.full_name}
              </div>
            </div>

            <div>
              <b>Supervisor</b>
              <div>(Name & signature)</div>
              <div style={{ marginTop: 15 }}>
                {teacherView ? (
                  <SignaturePad
                    existingSignature={current.teacher_signature}
                    onSave={handleTeacherSignatureSave}
                    readonly={false}
                  />
                ) : current.teacher_signature ? (
                  <img src={current.teacher_signature} alt="teacher-sign"
                    style={{ width: 180, objectFit: 'contain' }} />
                ) : (
                  <div style={{
                    height: 120, border: '1px dashed #ccc', borderRadius: 8,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#888',
                  }}>
                    Pending approval
                  </div>
                )}
              </div>
              <div style={{ marginTop: 10 }}>
                {regInfo?.teacher_name || data.teacher_name}
              </div>
            </div>

          </div>

        </div>
      </div>

      <style>{`
        @media print {
          body * { visibility: hidden; }
          #print-area, #print-area * { visibility: visible; }
          #print-area { position: absolute; left: 0; top: 0; width: 100%; margin: 0; box-shadow: none; }
        }
      `}</style>

    </div>
  );
};

// ── Sub-field ─────────────────────────────────────────────────────
const SubField = ({ label, name, value, onChange, canEdit, rows = 4 }) => (
  <div style={{ marginBottom: 16 }}>
    <b>{label}:</b>
    <textarea name={name} value={value || ''} onChange={onChange}
      disabled={!canEdit} rows={rows} style={textarea} />
  </div>
);

/* ═══════════ STYLES ═══════════ */

const page       = { background: '#f3f4f6', minHeight: '100vh', padding: 30 };
const topbar     = { maxWidth: '210mm', margin: '0 auto 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' };
const paper      = { width: '210mm', minHeight: '297mm', background: '#fff', margin: '0 auto', padding: '25mm', boxSizing: 'border-box', boxShadow: '0 0 10px rgba(0,0,0,0.1)' };
const header     = { display: 'flex', justifyContent: 'space-between', marginBottom: 30, fontSize: 13, fontFamily: 'Times New Roman' };
const content    = { fontSize: 15, lineHeight: 1.9, fontFamily: 'Times New Roman' };
const sectionTitle = { fontWeight: 700, fontSize: 16, marginTop: 30, marginBottom: 6, borderBottom: '1px solid #ddd', paddingBottom: 6 };
const sectionHint  = { fontSize: 13, color: '#666', fontStyle: 'italic', marginTop: 0, marginBottom: 14 };
const row        = { display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 };
const grid2      = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 40, marginBottom: 10 };
const inlineInput= { border: 'none', borderBottom: '1px solid #000', outline: 'none', background: 'transparent', fontSize: 15, fontFamily: 'Times New Roman', flex: 1, padding: '2px 4px' };
const textarea   = { width: '100%', marginTop: 8, padding: 12, border: '1px solid #ccc', fontSize: 14, lineHeight: 1.8, resize: 'vertical', fontFamily: 'Times New Roman', boxSizing: 'border-box' };
const dateInput  = { border: 'none', borderBottom: '1px solid #000', outline: 'none', background: 'transparent', fontSize: 14, padding: 4, fontFamily: 'Times New Roman' };
const cityDate   = { marginTop: 50, textAlign: 'right', fontStyle: 'italic' };
const signGrid   = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 30, marginTop: 50, textAlign: 'center' };
const btnWhite   = { padding: '10px 16px', borderRadius: 10, border: '1px solid #ddd', background: '#fff', cursor: 'pointer' };
const btnGreen   = { padding: '10px 18px', borderRadius: 10, border: 'none', background: '#22c55e', color: '#fff', cursor: 'pointer', fontWeight: 600 };
const statusBlue = { maxWidth: '210mm', margin: '0 auto 20px', padding: 14, borderRadius: 10, background: '#dbeafe', color: '#1d4ed8' };
const statusGreen= { maxWidth: '210mm', margin: '0 auto 20px', padding: 14, borderRadius: 10, background: '#dcfce7', color: '#15803d' };
const statusRed  = { maxWidth: '210mm', margin: '0 auto 20px', padding: 14, borderRadius: 10, background: '#fee2e2', color: '#dc2626' };
const commentBox = { maxWidth: '210mm', margin: '0 auto 20px', padding: 16, borderRadius: 10, background: '#fff7ed', border: '1px solid #fdba74' };

export default FormBM04;