import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import toast from 'react-hot-toast';

// npm install mammoth
// (dùng để render file .docx thành HTML inline trên trình duyệt)

// Chuyển relative URL (/uploads/...) → absolute URL về backend
const BACKEND_URL =
  (process.env.REACT_APP_API_URL || 'http://localhost:5000/api')
    .replace('/api', '');

const getFileUrl = (url) => {
  if (!url) return null;
  if (url.startsWith('http')) return url;
  return BACKEND_URL + url;
};

const FormBM08 = ({
  readonly = false,
  previewData = null,
  teacherView = false,
}) => {

  const { user } = useAuth();

  const [loading, setLoading]         = useState(true);
  const [saving, setSaving]           = useState(false);
  const [regInfo, setRegInfo]         = useState(null);

  const [formStatus, setFormStatus]   = useState('draft');
  const [teacherComment, setTeacherComment] = useState('');

  // File sinh viên chọn (chưa upload)
  const [selectedFile, setSelectedFile] = useState(null);
  // File đã lưu trên server
  const [savedFile, setSavedFile]       = useState(null); // { url, name, size }

  // Nội dung docx đã render thành HTML (teacher view)
  const [docHtml, setDocHtml]         = useState('');
  const [renderingDoc, setRenderingDoc] = useState(false);

  // Tab teacher: 'preview' | 'download'
  const [viewTab, setViewTab]         = useState('preview');

  const fileInputRef = useRef(null);

  // ── Load ──────────────────────────────────────────────────────

  useEffect(() => {

    if (previewData) {
      setFormStatus(previewData.status || 'draft');
      setTeacherComment(previewData.teacher_comment || '');
      setSavedFile(previewData.file || null);
      setLoading(false);

      // Nếu teacherView → tự động render docx
      if (teacherView && previewData.file?.url) {
        renderDocx(getFileUrl(previewData.file.url));
      }
      return;
    }

    api.get('/forms/my/BM08')
      .then(res => {
        setRegInfo(res.data.registration);
        if (res.data.form) {
          const f = res.data.form;
          setFormStatus(f.status || 'draft');
          setTeacherComment(f.teacher_comment || '');
          setSavedFile(f.file || null);
        }
      })
      .catch(() => toast.error('Không thể tải BM08!'))
      .finally(() => setLoading(false));

  }, [user, previewData, teacherView]);

  // ── Render docx → HTML (dùng mammoth) ──────────────────────────

  const renderDocx = async (fileUrl) => {
    setRenderingDoc(true);
    try {
      const mammoth = (await import('mammoth')).default;

      // Fetch file về dạng ArrayBuffer
      const resp = await fetch(getFileUrl(fileUrl));
      const buf  = await resp.arrayBuffer();

      const result = await mammoth.convertToHtml({ arrayBuffer: buf });
      setDocHtml(result.value);
    } catch (err) {
      console.error(err);
      setDocHtml('<p style="color:#dc2626">Không thể render file. Vui lòng tải về để xem.</p>');
    } finally {
      setRenderingDoc(false);
    }
  };

  // ── File select ────────────────────────────────────────────────

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const allowed = [
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];
    if (!allowed.includes(file.type) && !file.name.match(/\.(doc|docx)$/i)) {
      toast.error('Chỉ chấp nhận file .doc hoặc .docx!');
      return;
    }
    if (file.size > 20 * 1024 * 1024) {
      toast.error('File không được vượt quá 20MB!');
      return;
    }
    setSelectedFile(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
      const fakeEvent = { target: { files: [file] } };
      handleFileSelect(fakeEvent);
    }
  };

  // ── Submit ─────────────────────────────────────────────────────

  const handleSubmit = async () => {
    if (!selectedFile && !savedFile) {
      toast.error('Vui lòng chọn file báo cáo!');
      return;
    }
    if (!regInfo) {
      toast.error('Không tìm thấy thông tin đề tài!');
      return;
    }

    setSaving(true);
    try {
      const formData = new FormData();
      formData.append('form_type', 'BM08');
      formData.append('topic_id',  regInfo.topic_id);
      if (selectedFile) formData.append('file', selectedFile);

      await api.post('/forms/submit-file', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      toast.success('Đã nộp BM08!');
      setFormStatus('submitted');
      if (selectedFile) {
        setSavedFile({
          name: selectedFile.name,
          size: selectedFile.size,
          url:  null,
        });
        setSelectedFile(null);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Có lỗi xảy ra!');
    } finally {
      setSaving(false);
    }
  };

  // ── Download ───────────────────────────────────────────────────

  const handleDownload = () => {
    if (!savedFile?.url) return;
    const a = document.createElement('a');
    a.href = getFileUrl(savedFile.url);
    a.download = savedFile.name || 'report.docx';
    a.click();
  };

  const formatSize = (bytes) => {
    if (!bytes) return '';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  };

  const canEdit =
    !readonly &&
    !teacherView &&
    (formStatus === 'draft' || formStatus === 'rejected');

  // ── Render ─────────────────────────────────────────────────────

  if (loading) return <div style={{ padding: 30 }}>Loading...</div>;

  if (!regInfo && !previewData && !teacherView) {
    return (
      <div style={{ padding: 30, textAlign: 'center' }}>
        Bạn chưa có đề tài được duyệt.
      </div>
    );
  }

  return (
    <div style={page}>

      {/* ── ACTION BAR ── */}
      {!readonly && !teacherView && (
        <div style={topbar}>
          <div>
            <h2 style={{ margin: 0 }}>BM08 — Thesis Report Submission</h2>
            <div style={{ fontSize: 13, color: '#666', marginTop: 4 }}>
              Upload your thesis report file (.doc / .docx)
            </div>
          </div>
          {canEdit && (
            <button
              onClick={handleSubmit}
              disabled={saving || (!selectedFile && !savedFile)}
              style={{
                ...btnGreen,
                opacity: (!selectedFile && !savedFile) ? 0.5 : 1,
              }}
            >
              {saving ? 'Đang nộp...' : 'Nộp báo cáo'}
            </button>
          )}
        </div>
      )}

      {/* ── STATUS BANNER ── */}
      {formStatus === 'submitted' && (
        <div style={statusBlue}>⏳ BM08 đã được gửi và đang chờ duyệt</div>
      )}
      {formStatus === 'approved' && (
        <div style={statusGreen}>✅ BM08 đã được phê duyệt</div>
      )}
      {formStatus === 'rejected' && (
        <div style={statusRed}>❌ BM08 bị trả về — vui lòng chỉnh sửa và nộp lại</div>
      )}

      {/* ── TEACHER COMMENT ── */}
      {teacherComment && (
        <div style={commentBox}>
          <b>Nhận xét của giảng viên:</b>
          <div style={{ marginTop: 8, lineHeight: 1.7 }}>{teacherComment}</div>
        </div>
      )}

      {/* ══════════════════════════════════════
          STUDENT VIEW — Upload area
          ══════════════════════════════════════ */}
      {!teacherView && (
        <div style={{ maxWidth: 700, margin: '0 auto' }}>

          {/* Saved file info */}
          {savedFile && (
            <div style={savedFileCard}>
              <span style={{ fontSize: 28 }}>📄</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: 15 }}>{savedFile.name}</div>
                {savedFile.size && (
                  <div style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>
                    {formatSize(savedFile.size)}
                  </div>
                )}
              </div>
              <span style={{
                background: formStatus === 'approved' ? '#dcfce7' :
                             formStatus === 'rejected' ? '#fee2e2' :
                             formStatus === 'submitted' ? '#dbeafe' : '#f3f4f6',
                color:      formStatus === 'approved' ? '#15803d' :
                             formStatus === 'rejected' ? '#dc2626' :
                             formStatus === 'submitted' ? '#1d4ed8' : '#374151',
                padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 600,
              }}>
                {formStatus === 'approved' ? 'Approved' :
                 formStatus === 'rejected' ? 'Rejected' :
                 formStatus === 'submitted' ? 'Submitted' : 'Draft'}
              </span>
            </div>
          )}

          {/* Upload drop zone */}
          {canEdit && (
            <>
              <div
                onClick={() => fileInputRef.current?.click()}
                onDragOver={e => e.preventDefault()}
                onDrop={handleDrop}
                style={{
                  ...dropZone,
                  borderColor: selectedFile ? '#22c55e' : '#d1d5db',
                  background:  selectedFile ? '#f0fdf4' : '#fafafa',
                }}
              >
                <div style={{ fontSize: 40, marginBottom: 10 }}>
                  {selectedFile ? '✅' : '📁'}
                </div>
                {selectedFile ? (
                  <>
                    <div style={{ fontWeight: 600, fontSize: 15, color: '#15803d' }}>
                      {selectedFile.name}
                    </div>
                    <div style={{ fontSize: 13, color: '#6b7280', marginTop: 4 }}>
                      {formatSize(selectedFile.size)} · Click để chọn file khác
                    </div>
                  </>
                ) : (
                  <>
                    <div style={{ fontWeight: 600, fontSize: 15, color: '#374151' }}>
                      Kéo thả file vào đây hoặc click để chọn
                    </div>
                    <div style={{ fontSize: 13, color: '#9ca3af', marginTop: 6 }}>
                      Chỉ nhận file .doc hoặc .docx · Tối đa 20MB
                    </div>
                  </>
                )}
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept=".doc,.docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                onChange={handleFileSelect}
                style={{ display: 'none' }}
              />

              {selectedFile && (
                <button onClick={handleSubmit} disabled={saving} style={{ ...btnGreen, width: '100%', marginTop: 14, padding: 14, fontSize: 15 }}>
                  {saving ? 'Đang nộp...' : '📤 Nộp báo cáo'}
                </button>
              )}
            </>
          )}

        </div>
      )}

      {/* ══════════════════════════════════════
          TEACHER VIEW — File viewer
          ══════════════════════════════════════ */}
      {teacherView && savedFile && (
        <div style={{ maxWidth: '210mm', margin: '0 auto' }}>

          {/* File info bar + actions */}
          <div style={{
            background: 'white',
            border: '1px solid #e5e7eb',
            borderRadius: 12,
            padding: '14px 20px',
            display: 'flex',
            alignItems: 'center',
            gap: 14,
            marginBottom: 16,
          }}>
            <span style={{ fontSize: 28 }}>📄</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600, fontSize: 15 }}>{savedFile.name}</div>
              {savedFile.size && (
                <div style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>
                  {formatSize(savedFile.size)}
                </div>
              )}
            </div>

            {/* View tabs */}
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                onClick={() => {
                  setViewTab('preview');
                  if (!docHtml && savedFile.url) renderDocx(getFileUrl(savedFile.url));
                }}
                style={{
                  ...tabBtn,
                  background: viewTab === 'preview' ? '#2563eb' : 'white',
                  color:      viewTab === 'preview' ? 'white' : '#374151',
                  border:     viewTab === 'preview' ? 'none' : '1px solid #d1d5db',
                }}
              >
                👁 Xem trực tiếp
              </button>
              <button
                onClick={() => setViewTab('download')}
                style={{
                  ...tabBtn,
                  background: viewTab === 'download' ? '#2563eb' : 'white',
                  color:      viewTab === 'download' ? 'white' : '#374151',
                  border:     viewTab === 'download' ? 'none' : '1px solid #d1d5db',
                }}
              >
                ⬇ Tải về xem sau
              </button>
            </div>
          </div>

          {/* Preview panel */}
          {viewTab === 'preview' && (
            <div style={{
              background: 'white',
              border: '1px solid #e5e7eb',
              borderRadius: 12,
              padding: '30px 40px',
              marginBottom: 16,
              minHeight: 400,
            }}>
              {renderingDoc ? (
                <div style={{ textAlign: 'center', padding: 60, color: '#6b7280' }}>
                  <div style={{ fontSize: 32, marginBottom: 12 }}>⏳</div>
                  Đang tải nội dung file...
                </div>
              ) : docHtml ? (
                <div
                  style={{
                    fontFamily: 'Times New Roman, serif',
                    fontSize: 15,
                    lineHeight: 1.9,
                    color: '#1f2937',
                  }}
                  dangerouslySetInnerHTML={{ __html: docHtml }}
                />
              ) : (
                <div style={{ textAlign: 'center', padding: 60, color: '#6b7280' }}>
                  <div style={{ fontSize: 32, marginBottom: 12 }}>📄</div>
                  <div>Click "Xem trực tiếp" để load nội dung file</div>
                </div>
              )}
            </div>
          )}

          {/* Download panel */}
          {viewTab === 'download' && (
            <div style={{
              background: 'white',
              border: '1px solid #e5e7eb',
              borderRadius: 12,
              padding: 40,
              textAlign: 'center',
              marginBottom: 16,
            }}>
              <div style={{ fontSize: 64, marginBottom: 16 }}>📥</div>
              <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>
                {savedFile.name}
              </div>
              <div style={{ fontSize: 13, color: '#6b7280', marginBottom: 24 }}>
                {formatSize(savedFile.size)} · Mở bằng Microsoft Word hoặc Google Docs để xem đầy đủ định dạng
              </div>
              <button onClick={handleDownload} style={{ ...btnGreen, padding: '12px 28px', fontSize: 15 }}>
                ⬇ Tải file về máy
              </button>
            </div>
          )}

        </div>
      )}

      {/* Nếu chưa có file */}
      {teacherView && !savedFile && (
        <div style={{
          maxWidth: '210mm', margin: '0 auto',
          background: 'white', border: '1px solid #e5e7eb',
          borderRadius: 12, padding: 60, textAlign: 'center', color: '#9ca3af',
        }}>
          <div style={{ fontSize: 36, marginBottom: 12 }}>📂</div>
          Sinh viên chưa nộp file báo cáo
        </div>
      )}

    </div>
  );
};

/* ═══════════ STYLES ═══════════ */

const page     = { background: '#f3f4f6', minHeight: '100vh', padding: 30 };
const topbar   = { maxWidth: 700, margin: '0 auto 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' };

const dropZone = {
  border: '2px dashed',
  borderRadius: 16,
  padding: '48px 24px',
  textAlign: 'center',
  cursor: 'pointer',
  marginTop: 16,
  transition: 'all 0.2s',
};

const savedFileCard = {
  display: 'flex', alignItems: 'center', gap: 14,
  background: 'white', border: '1px solid #e5e7eb',
  borderRadius: 12, padding: '14px 18px', marginBottom: 16,
};

const tabBtn = {
  padding: '8px 14px', borderRadius: 8,
  cursor: 'pointer', fontSize: 13, fontWeight: 500,
};

const btnGreen = {
  padding: '10px 18px', borderRadius: 10,
  border: 'none', background: '#22c55e',
  color: '#fff', cursor: 'pointer', fontWeight: 600,
};

const statusBlue  = { maxWidth: 700, margin: '0 auto 16px', padding: 14, borderRadius: 10, background: '#dbeafe', color: '#1d4ed8' };
const statusGreen = { maxWidth: 700, margin: '0 auto 16px', padding: 14, borderRadius: 10, background: '#dcfce7', color: '#15803d' };
const statusRed   = { maxWidth: 700, margin: '0 auto 16px', padding: 14, borderRadius: 10, background: '#fee2e2', color: '#dc2626' };
const commentBox  = { maxWidth: 700, margin: '0 auto 16px', padding: 16, borderRadius: 10, background: '#fff7ed', border: '1px solid #fdba74' };

export default FormBM08;