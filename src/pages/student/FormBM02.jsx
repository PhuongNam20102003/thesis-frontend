import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import SignaturePad from '../../components/SignaturePad';
import toast from 'react-hot-toast';

const FormBM02 = ({
  readonly = false,
  previewData = null,
  teacherView = false,
  // FIX #4: nhận callback để emit teacherSignature lên FormDetail
  onTeacherSignatureChange = null,
}) => {

  const { user } = useAuth();

  // FIX #6: bỏ printRef vì handlePrint chỉ dùng window.print()
  const printRef = useRef(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [regInfo, setRegInfo] = useState(null);

  const [signature, setSignature] =
    useState(null);

  const [teacherSignature, setTeacherSignature] =
    useState(null);

  const [formStatus, setFormStatus] =
    useState('draft');

  const [teacherComment, setTeacherComment] =
    useState('');

  const [form, setForm] = useState({
    student_name: '',
    teacher_name: '',
    student_id: '',
    student_class: '',
    intake: '',
    major: '',
    thesis_title_en: '',
    thesis_title_vn: '',
    objectives: '',
    expected_outcomes: '',
    start_date: '',
    end_date: '',
  });

  const data = previewData?.form_data || form;

  // ================= LOAD =================

  useEffect(() => {

    if (previewData) {

      setForm(
        previewData.form_data || {}
      );

      setSignature(
        previewData.student_signature
      );

      setTeacherSignature(
        previewData.teacher_signature
      );

      setTeacherComment(
        previewData.teacher_comment || ''
      );

      setFormStatus(
        previewData.status || 'draft'
      );

      setLoading(false);

      return;
    }

    api.get('/forms/my/BM02')

      .then(res => {

        setRegInfo(
          res.data.registration
        );

        if (res.data.form) {

          const f = res.data.form;

          setForm(f.form_data);

          setSignature(
            f.student_signature
          );

          setTeacherSignature(
            f.teacher_signature
          );

          setTeacherComment(
            f.teacher_comment || ''
          );

          setFormStatus(
            f.status || 'draft'
          );

        } else {

          setForm(prev => ({
            ...prev,

            student_name:
              user?.full_name || '',

            teacher_name:
              res.data.registration
                ?.teacher_name || '',

            student_id:
              user?.student_id || '',

            student_class:
              user?.student_class || '',

            intake:
              user?.intake || '',

            major:
              user?.major ||
              'Information Technology',

            thesis_title_en:
              res.data.registration
                ?.topic_title || '',
          }));
        }
      })

      .catch(() => {

        toast.error(
          'Không thể tải biểu mẫu!'
        );

      })

      .finally(() => {

        setLoading(false);

      });

  }, [user, previewData]);

  // ================= RULE =================

  const canEdit =
    !readonly &&
    (
      formStatus === 'draft' ||
      formStatus === 'rejected'
    );

  // ================= CHANGE =================

  const handleChange = (e) => {

    setForm({
      ...form,
      [e.target.name]:
        e.target.value,
    });
  };

  // FIX #4: khi giáo viên ký, emit lên FormDetail qua callback
  const handleTeacherSignatureSave = (sig) => {
    setTeacherSignature(sig);
    if (onTeacherSignatureChange) {
      onTeacherSignatureChange(sig);
    }
  };

  // ================= SAVE =================

  const handleSave = async (action) => {

    if (
      action === 'submit' &&
      !signature
    ) {

      toast.error(
        'Vui lòng ký tên trước khi nộp!'
      );

      return;
    }

    // FIX #2: guard nếu regInfo null (không phải teacherView nhưng chưa load xong)
    if (!regInfo) {
      toast.error('Không tìm thấy thông tin đề tài!');
      return;
    }

    setSaving(true);

    try {

      await api.post(
        '/forms/submit',
        {
          topic_id: regInfo.topic_id,
          form_type: 'BM02',
          form_data: form,
          student_signature: signature,
          action,
        }
      );

      toast.success(
        action === 'submit'
          ? 'Đã nộp BM02!'
          : 'Đã lưu bản nháp!'
      );

      if (action === 'submit') {
        setFormStatus('submitted');
      }

    } catch (err) {

      toast.error(
        err.response?.data?.message ||
        'Có lỗi xảy ra!'
      );

    } finally {

      setSaving(false);

    }
  };

  // ================= PRINT =================

  const handlePrint = () => {
    window.print();
  };

  // ================= LOADING =================

  if (loading) {

    return (
      <div style={{ padding: 30 }}>
        Loading...
      </div>
    );
  }

  // ================= NO TOPIC =================

  // FIX #2: chỉ hiện cảnh báo khi không phải teacherView và không có regInfo
  if (!regInfo && !previewData && !teacherView) {

    return (
      <div
        style={{
          padding: 30,
          textAlign: 'center',
        }}
      >
        Bạn chưa có đề tài được duyệt.
      </div>
    );
  }

  // ================= UI =================

  return (

    <div style={page}>

      {/* ACTION BAR */}
      {!readonly && (

        <div style={topbar}>

          <div>

            <h2 style={{ margin: 0 }}>
              BM02 — Thesis Assignment Form
            </h2>

            <div
              style={{
                fontSize: 13,
                color: '#666',
                marginTop: 4,
              }}
            >
              Fill all required information
            </div>

          </div>

          <div
            style={{
              display: 'flex',
              gap: 10,
            }}
          >

            {canEdit && (
              <>
                <button
                  onClick={() =>
                    handleSave('save')
                  }
                  disabled={saving}
                  style={btnWhite}
                >
                  Lưu bản nháp
                </button>

                <button
                  onClick={() =>
                    handleSave('submit')
                  }
                  disabled={saving}
                  style={btnGreen}
                >
                  Nộp biểu mẫu
                </button>
              </>
            )}

          </div>

        </div>
      )}

      {/* STATUS */}
      {formStatus === 'submitted' && (
        <div style={statusBlue}>
          ⏳ BM02 đã được gửi và đang chờ duyệt
        </div>
      )}

      {formStatus === 'approved' && (
        <div style={statusGreen}>
          ✅ BM02 đã được phê duyệt
        </div>
      )}

      {formStatus === 'rejected' && (
        <div style={statusRed}>
          ❌ BM02 bị từ chối — vui lòng chỉnh sửa và nộp lại
        </div>
      )}

      {/* TEACHER COMMENT */}
      {teacherComment && (

        <div style={commentBox}>

          <b>Teacher Comment:</b>

          <div style={{ marginTop: 8 }}>
            {teacherComment}
          </div>

        </div>
      )}

      {/* A4 PAPER */}
      <div
        id="print-area"
        ref={printRef}
        style={paper}
      >

        {/* HEADER */}
        <div style={header}>

          <div>

            <div style={{ fontWeight: 700 }}>
              NGUYEN TAT THANH UNIVERSITY
            </div>

            <div>
              NTT INSTITUTE OF
              INTERNATIONAL EDUCATION
            </div>

          </div>

          <div style={{ textAlign: 'right' }}>

            <div style={{ fontWeight: 700 }}>
              SOCIALIST REPUBLIC OF VIETNAM
            </div>

            <div>
              Independence – Freedom – Happiness
            </div>

          </div>

        </div>

        {/* TITLE */}
        <div
          style={{
            textAlign: 'center',
            marginBottom: 40,
          }}
        >

          <h1
            style={{
              margin: 0,
              fontSize: 28,
              fontFamily: 'Times New Roman',
            }}
          >
            THESIS ASSIGNMENT FORM
          </h1>

        </div>

        {/* CONTENT */}
        <div style={content}>

          {/* STUDENT NAME */}
          <div style={row}>

            <b>Student Name:</b>

            <input
              name="student_name"
              value={data.student_name}
              onChange={handleChange}
              disabled={!canEdit}
              style={inlineInput}
            />

          </div>

          {/* ID + MAJOR */}
          <div style={grid2}>

            <div style={row}>

              <b>Student ID:</b>

              <input
                name="student_id"
                value={data.student_id}
                onChange={handleChange}
                disabled={!canEdit}
                style={{
                  ...inlineInput,
                  cursor: canEdit ? 'text' : 'default',
                }}
              />

            </div>

            <div style={row}>

              <b>Major:</b>

              <input
                name="major"
                value={data.major}
                onChange={handleChange}
                disabled={!canEdit}
                style={{
                  ...inlineInput,
                  cursor: canEdit ? 'text' : 'default',
                }}
              />

            </div>

          </div>

          {/* CLASS + INTAKE */}
          <div style={grid2}>

            <div style={row}>

              <b>Class:</b>

              <input
                name="student_class"
                value={data.student_class}
                onChange={handleChange}
                disabled={!canEdit}
                style={inlineInput}
              />

            </div>

            <div style={row}>

              <b>Intake:</b>

              <input
                name="intake"
                value={data.intake}
                onChange={handleChange}
                disabled={!canEdit}
                style={{
                  ...inlineInput,
                  cursor: canEdit ? 'text' : 'default',
                }}
              />

            </div>

          </div>

          {/* SUPERVISOR */}
          <div style={row}>

            <b>Supervisor:</b>

            <input
              name="teacher_name"
              value={data.teacher_name}
              onChange={handleChange}
              disabled={!canEdit}
              style={inlineInput}
            />

          </div>

          {/* THESIS TITLE */}
          <div style={{ marginTop: 20 }}>

            <b>Thesis Title:</b>

            <textarea
              name="thesis_title_en"
              value={data.thesis_title_en}
              onChange={handleChange}
              disabled={!canEdit}
              rows={3}
              style={textarea}
            />

          </div>

          {/* VN TITLE */}
          <div style={{ marginTop: 20 }}>

            <b>Vietnamese:</b>

            <textarea
              name="thesis_title_vn"
              value={data.thesis_title_vn}
              onChange={handleChange}
              disabled={!canEdit}
              rows={3}
              style={textarea}
            />

          </div>

          {/* OBJECTIVES */}
          <div style={{ marginTop: 25 }}>

            <b>Thesis Objectives:</b>

            <textarea
              name="objectives"
              value={data.objectives}
              onChange={handleChange}
              disabled={!canEdit}
              rows={12}
              style={textarea}
            />

          </div>

          {/* EXPECTED */}
          <div style={{ marginTop: 25 }}>

            <b>Expected Outcomes:</b>

            <textarea
              name="expected_outcomes"
              value={data.expected_outcomes}
              onChange={handleChange}
              disabled={!canEdit}
              rows={12}
              style={textarea}
            />

          </div>

          {/* TIME */}
          <div style={{ marginTop: 30 }}>

            <b>
              Timeframe for Completion:
            </b>

            <div style={{ marginTop: 12 }}>

              from

              <input
                type="date"
                name="start_date"
                value={data.start_date}
                onChange={handleChange}
                disabled={!canEdit}
                style={{
                  ...dateInput,
                  marginLeft: 10,
                  marginRight: 10,
                }}
              />

              to

              <input
                type="date"
                name="end_date"
                value={data.end_date}
                onChange={handleChange}
                disabled={!canEdit}
                style={{
                  ...dateInput,
                  marginLeft: 10,
                }}
              />

            </div>

          </div>

          {/* DATE */}
          <div style={cityDate}>
            Ho Chi Minh City,{' '}
            {new Date().toLocaleDateString()}
          </div>

          {/* SIGNATURE */}
          <div style={signGrid}>

            {/* STUDENT */}
            <div>

              <b>Student</b>

              <div>
                (Name & signature)
              </div>

              <div style={{ marginTop: 15 }}>

                <SignaturePad
                  existingSignature={signature}
                  onSave={setSignature}
                  readonly={!canEdit}
                />

              </div>

              {/* FIX #1: teacherView/readonly thì lấy tên từ form_data, còn lại lấy từ user */}
              <div style={{ marginTop: 10 }}>
                {(readonly || teacherView)
                  ? data.student_name
                  : user?.full_name}
              </div>

            </div>

            {/* SUPERVISOR */}
            <div>

              <b>Supervisor</b>

              <div>
                (Name & signature)
              </div>

              <div style={{ marginTop: 15 }}>

                {teacherView ? (

                  // FIX #4: giáo viên có thể ký trực tiếp trên form khi teacherView
                  <SignaturePad
                    existingSignature={teacherSignature}
                    onSave={handleTeacherSignatureSave}
                    readonly={false}
                  />

                ) : teacherSignature ? (

                  <img
                    src={teacherSignature}
                    alt="teacher-sign"
                    style={{
                      width: 180,
                      objectFit: 'contain',
                    }}
                  />

                ) : (

                  <div
                    style={{
                      height: 120,
                      border: '1px dashed #ccc',
                      borderRadius: 8,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#888',
                    }}
                  >
                    Pending approval
                  </div>

                )}

              </div>

              <div style={{ marginTop: 10 }}>
                {regInfo?.teacher_name || data.teacher_name}
              </div>

            </div>

            {/* PROGRAM */}
            <div>

              <b>Program Manager</b>

              <div>
                (Name & signature)
              </div>

            </div>

          </div>

        </div>

      </div>

      {/* PRINT */}
      <style>{`
        @media print {

          body * {
            visibility: hidden;
          }

          #print-area,
          #print-area * {
            visibility: visible;
          }

          #print-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            margin: 0;
            box-shadow: none;
          }
        }
      `}</style>

    </div>
  );
};

/* ================= STYLES ================= */

const page = {
  background: '#f3f4f6',
  minHeight: '100vh',
  padding: 30,
};

const topbar = {
  maxWidth: 1000,
  margin: '0 auto 20px',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
};

const paper = {
  width: '210mm',
  minHeight: '297mm',
  background: '#fff',
  margin: '0 auto',
  padding: '25mm',
  boxSizing: 'border-box',
  boxShadow: '0 0 10px rgba(0,0,0,0.1)',
};

const header = {
  display: 'flex',
  justifyContent: 'space-between',
  marginBottom: 30,
  fontSize: 13,
  fontFamily: 'Times New Roman',
};

const content = {
  fontSize: 17,
  lineHeight: 2,
  fontFamily: 'Times New Roman',
};

const row = {
  display: 'flex',
  alignItems: 'center',
  gap: 10,
  marginBottom: 12,
};

const grid2 = {
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: 40,
  marginBottom: 10,
};

const inlineInput = {
  border: 'none',
  borderBottom: '1px solid #000',
  outline: 'none',
  background: 'transparent',
  fontSize: 17,
  fontFamily: 'Times New Roman',
  flex: 1,
  padding: '2px 4px',
};

const textarea = {
  width: '100%',
  marginTop: 10,
  padding: 12,
  border: '1px solid #ccc',
  fontSize: 15,
  lineHeight: 1.8,
  resize: 'vertical',
  fontFamily: 'Times New Roman',
  boxSizing: 'border-box',
};

const dateInput = {
  border: 'none',
  borderBottom: '1px solid #000',
  outline: 'none',
  background: 'transparent',
  fontSize: 16,
  padding: 4,
};

const cityDate = {
  marginTop: 50,
  textAlign: 'right',
  fontStyle: 'italic',
};

const signGrid = {
  display: 'grid',
  gridTemplateColumns: '1fr 1fr 1fr',
  gap: 30,
  marginTop: 50,
  textAlign: 'center',
};

const btnWhite = {
  padding: '10px 16px',
  borderRadius: 10,
  border: '1px solid #ddd',
  background: '#fff',
  cursor: 'pointer',
};

const btnGreen = {
  padding: '10px 18px',
  borderRadius: 10,
  border: 'none',
  background: '#22c55e',
  color: '#fff',
  cursor: 'pointer',
  fontWeight: 600,
};

const statusBlue = {
  maxWidth: 1000,
  margin: '0 auto 20px',
  padding: 14,
  borderRadius: 10,
  background: '#dbeafe',
  color: '#1d4ed8',
};

const statusGreen = {
  maxWidth: 1000,
  margin: '0 auto 20px',
  padding: 14,
  borderRadius: 10,
  background: '#dcfce7',
  color: '#15803d',
};

const statusRed = {
  maxWidth: 1000,
  margin: '0 auto 20px',
  padding: 14,
  borderRadius: 10,
  background: '#fee2e2',
  color: '#dc2626',
};

const commentBox = {
  maxWidth: 1000,
  margin: '0 auto 20px',
  padding: 16,
  borderRadius: 10,
  background: '#fff7ed',
  border: '1px solid #fdba74',
};

export default FormBM02;