import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../../services/api';
import toast from 'react-hot-toast';

import FormBM02 from '../student/FormBM02';
import FormBM04 from '../student/FormBM04';
import FormBM08 from '../student/FormBM08';

// ─────────────────────────────────────────
// Cài đặt thêm (chạy 1 lần trong project):
//   npm install html2pdf.js docx file-saver
// ─────────────────────────────────────────

const FormDetail = () => {

  const { id } = useParams();

  const [form, setForm] = useState(null);
  const [exporting, setExporting] = useState(false);

  const [teacherSignature, setTeacherSignature] =
    useState(null);

  const [comment, setComment] = useState('');

  useEffect(() => {
    fetchForm();
  }, []);

  const fetchForm = async () => {
    try {
      const res = await api.get(`/forms/detail/${id}`);
      setForm(res.data);
      setComment(res.data.teacher_comment || '');
      setTeacherSignature(res.data.teacher_signature || null);
    } catch {
      toast.error('Không tải được form');
    }
  };

  const handleReview = async (status) => {
    try {
      await api.patch(`/forms/review/${id}`, {
        status,
        teacher_comment: comment,
        teacher_signature: teacherSignature,
      });
      toast.success('Đã cập nhật!');
      await fetchForm();
    } catch {
      toast.error('Có lỗi xảy ra');
    }
  };

  // ─── EXPORT PDF ───────────────────────────────────────────────────
  const handleExportPDF = async () => {
    const element = document.getElementById('print-area');
    if (!element) {
      toast.error('Không tìm thấy nội dung để xuất!');
      return;
    }

    setExporting(true);
    toast('Đang tạo PDF...', { icon: '⏳' });

    // ── Inject CSS tạm để dọn giao diện trước khi capture ──────────
    const style = document.createElement('style');
    style.id = '__pdf_clean__';
    style.innerHTML = `
      /* Bỏ box-shadow và căn lề paper */
      #print-area {
        box-shadow: none !important;
        margin: 0 !important;
        width: 100% !important;
      }
      /* Input / textarea: chỉ giữ border dưới, bỏ nền */
      #print-area input,
      #print-area select {
        border: none !important;
        border-bottom: 1px solid #000 !important;
        background: transparent !important;
        box-shadow: none !important;
        outline: none !important;
      }
      #print-area textarea {
        border: 1px solid #aaa !important;
        background: transparent !important;
        box-shadow: none !important;
        outline: none !important;
        resize: none !important;
      }
      /* Ẩn toàn bộ button (Xoá, Lưu chữ ký...) */
      #print-area button {
        display: none !important;
      }
      /* Ẩn chữ "Ký tên" phía trên canvas và toolbar dưới canvas */
      #print-area canvas ~ *,
      #print-area canvas + * {
        display: none !important;
      }
      /* Bỏ border xanh của canvas SignaturePad */
      #print-area canvas {
        border: 1px solid #999 !important;
        border-radius: 4px !important;
        outline: none !important;
      }
      /* Ẩn p/div "Ký tên" ngay trước canvas */
      #print-area div:has(> canvas) > *:not(canvas) {
        display: none !important;
      }
    `;
    document.head.appendChild(style);

    // Lấy đúng width thực của element để không bị cắt
    const elementWidth = element.scrollWidth;

    try {
      const html2pdf = (await import('html2pdf.js')).default;
      const studentName = form?.form_data?.student_name || 'form';

      await html2pdf()
        .set({
          margin:      [10, 10, 10, 10],
          filename:    `${form.form_type}_${studentName}.pdf`,
          image:       { type: 'jpeg', quality: 0.98 },
          html2canvas: {
            scale:       2,
            useCORS:     true,
            logging:     false,
            windowWidth: elementWidth + 40, // +40 để không bị cắt sát lề
          },
          jsPDF:       { unit: 'mm', format: 'a4', orientation: 'portrait' },
          pagebreak:   { mode: ['css', 'legacy'] },
        })
        .from(element)
        .save();

      toast.success('Đã xuất PDF!');
    } catch (err) {
      console.error(err);
      toast.error('Xuất PDF thất bại!');
    } finally {
      document.getElementById('__pdf_clean__')?.remove();
      setExporting(false);
    }
  };

  // ─── EXPORT DOCX ──────────────────────────────────────────────────
  const handleExportDOCX = async () => {
    if (!form?.form_data) {
      toast.error('Không có dữ liệu để xuất!');
      return;
    }

    setExporting(true);
    toast('Đang tạo DOCX...', { icon: '⏳' });

    try {
      const { Document, Paragraph, TextRun, ImageRun,
              HeadingLevel, AlignmentType, Table, TableRow,
              TableCell, WidthType, BorderStyle, Packer } =
        await import('docx');
      const { saveAs } = await import('file-saver');

      const d = form.form_data;

      // Helper tạo dòng label + value
      const field = (label, value) =>
        new Paragraph({
          children: [
            new TextRun({ text: `${label}: `, bold: true, font: 'Times New Roman', size: 26 }),
            new TextRun({ text: value || '—', font: 'Times New Roman', size: 26 }),
          ],
          spacing: { after: 160 },
        });

      // Helper chuyển base64 signature → buffer
      const base64ToBuffer = (base64) => {
        const b64 = base64.split(',')[1] || base64;
        const binary = atob(b64);
        const buf = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) {
          buf[i] = binary.charCodeAt(i);
        }
        return buf;
      };

      // Chữ ký sinh viên
      const studentSignatureBlock = [];
      if (form.student_signature) {
        studentSignatureBlock.push(
          new Paragraph({
            children: [
              new ImageRun({
                data: base64ToBuffer(form.student_signature),
                transformation: { width: 120, height: 60 },
                type: 'png',
              }),
            ],
            alignment: AlignmentType.CENTER,
          })
        );
      }

      // Chữ ký giáo viên
      const teacherSignatureBlock = [];
      if (teacherSignature) {
        teacherSignatureBlock.push(
          new Paragraph({
            children: [
              new ImageRun({
                data: base64ToBuffer(teacherSignature),
                transformation: { width: 120, height: 60 },
                type: 'png',
              }),
            ],
            alignment: AlignmentType.CENTER,
          })
        );
      }

      const doc = new Document({
        sections: [
          {
            properties: {
              page: {
                margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 },
              },
            },
            children: [

              // ── HEADER ──
              new Paragraph({
                children: [
                  new TextRun({
                    text: 'NGUYEN TAT THANH UNIVERSITY',
                    bold: true, font: 'Times New Roman', size: 22,
                  }),
                ],
              }),
              new Paragraph({
                children: [
                  new TextRun({
                    text: 'NTT Institute of International Education',
                    font: 'Times New Roman', size: 22,
                  }),
                ],
                spacing: { after: 200 },
              }),

              // ── TIÊU ĐỀ ──
              new Paragraph({
                text: form.form_type === 'BM02'
                  ? 'THESIS ASSIGNMENT FORM'
                  : `FORM ${form.form_type}`,
                heading: HeadingLevel.HEADING_1,
                alignment: AlignmentType.CENTER,
                spacing: { before: 200, after: 400 },
              }),

              // ── THÔNG TIN SINH VIÊN ──
              field('Student Name',  d.student_name),
              field('Student ID',    d.student_id),
              field('Class',         d.student_class),
              field('Intake',        d.intake),
              field('Major',         d.major),
              field('Supervisor',    d.teacher_name),

              // ── TIÊU ĐỀ LUẬN VĂN ──
              new Paragraph({
                children: [new TextRun({ text: 'Thesis Title (English):', bold: true, font: 'Times New Roman', size: 26 })],
                spacing: { before: 300, after: 100 },
              }),
              new Paragraph({
                text: d.thesis_title_en || '—',
                style: 'Normal',
                spacing: { after: 200 },
                indent: { left: 360 },
              }),

              new Paragraph({
                children: [new TextRun({ text: 'Thesis Title (Vietnamese):', bold: true, font: 'Times New Roman', size: 26 })],
                spacing: { after: 100 },
              }),
              new Paragraph({
                text: d.thesis_title_vn || '—',
                style: 'Normal',
                spacing: { after: 300 },
                indent: { left: 360 },
              }),

              // ── NỘI DUNG ──
              new Paragraph({
                children: [new TextRun({ text: 'Thesis Objectives:', bold: true, font: 'Times New Roman', size: 26 })],
                spacing: { after: 100 },
              }),
              new Paragraph({
                text: d.objectives || '—',
                style: 'Normal',
                spacing: { after: 300 },
                indent: { left: 360 },
              }),

              new Paragraph({
                children: [new TextRun({ text: 'Expected Outcomes:', bold: true, font: 'Times New Roman', size: 26 })],
                spacing: { after: 100 },
              }),
              new Paragraph({
                text: d.expected_outcomes || '—',
                style: 'Normal',
                spacing: { after: 300 },
                indent: { left: 360 },
              }),

              // ── THỜI GIAN ──
              field('Start Date', d.start_date),
              field('End Date',   d.end_date),

              // ── NHẬN XÉT GIÁO VIÊN ──
              ...(comment ? [
                new Paragraph({
                  children: [new TextRun({ text: 'Teacher Comment:', bold: true, font: 'Times New Roman', size: 26 })],
                  spacing: { before: 300, after: 100 },
                }),
                new Paragraph({
                  text: comment,
                  style: 'Normal',
                  spacing: { after: 300 },
                  indent: { left: 360 },
                }),
              ] : []),

              // ── TRẠNG THÁI ──
              new Paragraph({
                children: [
                  new TextRun({ text: 'Status: ', bold: true, font: 'Times New Roman', size: 26 }),
                  new TextRun({
                    text: form.status?.toUpperCase() || '—',
                    font: 'Times New Roman', size: 26,
                    color: form.status === 'approved' ? '15803d'
                         : form.status === 'rejected' ? 'dc2626'
                         : '1d4ed8',
                  }),
                ],
                spacing: { before: 300, after: 400 },
              }),

              // ── CHỮ KÝ ──
              new Table({
                width: { size: 100, type: WidthType.PERCENTAGE },
                borders: {
                  top:          { style: BorderStyle.NONE },
                  bottom:       { style: BorderStyle.NONE },
                  left:         { style: BorderStyle.NONE },
                  right:        { style: BorderStyle.NONE },
                  insideH:      { style: BorderStyle.NONE },
                  insideV:      { style: BorderStyle.NONE },
                },
                rows: [
                  new TableRow({
                    children: [
                      new TableCell({
                        width: { size: 33, type: WidthType.PERCENTAGE },
                        children: [
                          new Paragraph({ text: 'Student', alignment: AlignmentType.CENTER,
                            children: [new TextRun({ text: 'Student', bold: true, font: 'Times New Roman', size: 26 })] }),
                          new Paragraph({ text: '(Name & signature)', alignment: AlignmentType.CENTER,
                            children: [new TextRun({ text: '(Name & signature)', font: 'Times New Roman', size: 22 })] }),
                          ...studentSignatureBlock,
                          new Paragraph({ text: d.student_name || '', alignment: AlignmentType.CENTER,
                            children: [new TextRun({ text: d.student_name || '', font: 'Times New Roman', size: 24 })] }),
                        ],
                      }),
                      new TableCell({
                        width: { size: 33, type: WidthType.PERCENTAGE },
                        children: [
                          new Paragraph({ alignment: AlignmentType.CENTER,
                            children: [new TextRun({ text: 'Supervisor', bold: true, font: 'Times New Roman', size: 26 })] }),
                          new Paragraph({ alignment: AlignmentType.CENTER,
                            children: [new TextRun({ text: '(Name & signature)', font: 'Times New Roman', size: 22 })] }),
                          ...teacherSignatureBlock,
                          new Paragraph({ alignment: AlignmentType.CENTER,
                            children: [new TextRun({ text: d.teacher_name || '', font: 'Times New Roman', size: 24 })] }),
                        ],
                      }),
                      new TableCell({
                        width: { size: 34, type: WidthType.PERCENTAGE },
                        children: [
                          new Paragraph({ alignment: AlignmentType.CENTER,
                            children: [new TextRun({ text: 'Program Manager', bold: true, font: 'Times New Roman', size: 26 })] }),
                          new Paragraph({ alignment: AlignmentType.CENTER,
                            children: [new TextRun({ text: '(Name & signature)', font: 'Times New Roman', size: 22 })] }),
                        ],
                      }),
                    ],
                  }),
                ],
              }),

            ],
          },
        ],
      });

      const blob = await Packer.toBlob(doc);
      const studentName = d.student_name || 'form';
      saveAs(blob, `${form.form_type}_${studentName}.docx`);
      toast.success('Đã xuất DOCX!');

    } catch (err) {
      console.error(err);
      toast.error('Xuất DOCX thất bại!');
    } finally {
      setExporting(false);
    }
  };

  // ─── RENDER ───────────────────────────────────────────────────────

  if (!form) {
    return <div>Loading...</div>;
  }

  return (
    <div style={{ padding: 24 }}>

      {/* BM02 */}
      {form.form_type === 'BM02' && (
        <FormBM02
          readonly
          teacherView
          previewData={form}
          onTeacherSignatureChange={setTeacherSignature}
        />
      )}

      {/* BM04 */}
      {form.form_type === 'BM04' && (
        <FormBM04
          readonly
          teacherView
          previewData={form}
          onTeacherSignatureChange={setTeacherSignature}
        />
      )}

      {/* BM08 */}
      {form.form_type === 'BM08' && (
        <FormBM08
          readonly
          teacherView
          previewData={form}
        />
      )}

      {/* Teacher Review */}
      <div style={{
        marginTop: 24,
        background: 'white',
        padding: 24,
        borderRadius: 12,
      }}>

        <h3 style={{ marginTop: 0 }}>Teacher Review</h3>

        {/* Nhận xét */}
        <label style={{ fontSize: 13, fontWeight: 600, color: '#374151' }}>
          {form.form_type === 'BM08'
            ? 'Nhận xét / Yêu cầu chỉnh sửa báo cáo'
            : 'Nhận xét cho sinh viên'}
        </label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder={
            form.form_type === 'BM08'
              ? 'Nhập nhận xét về nội dung báo cáo, yêu cầu chỉnh sửa cụ thể...'
              : 'Nhập nhận xét cho sinh viên...'
          }
          rows={5}
          style={{
            width: '100%', marginTop: 8, padding: 12,
            boxSizing: 'border-box', borderRadius: 8,
            border: '1px solid #d1d5db', fontSize: 14, lineHeight: 1.6,
          }}
        />

        {/* ── REVIEW BUTTONS ── */}
        <div style={{ display: 'flex', gap: 12, marginTop: 16, flexWrap: 'wrap' }}>

          <button onClick={() => handleReview('rejected')} style={btnRed}>
            ↩ Trả về — Yêu cầu chỉnh sửa
          </button>

          <button onClick={() => handleReview('approved')} style={btnGreen}>
            ✓ Duyệt
          </button>

        </div>

        {/* ── EXPORT BUTTONS — chỉ với BM02 / BM04 ── */}
        {form.form_type !== 'BM08' && (
        <div style={{
          display: 'flex',
          gap: 12,
          marginTop: 16,
          paddingTop: 16,
          borderTop: '1px solid #e5e7eb',
          flexWrap: 'wrap',
        }}>

          <span style={{ fontSize: 13, color: '#6b7280', alignSelf: 'center' }}>
            Xuất file:
          </span>

          <button onClick={handleExportPDF} disabled={exporting} style={btnPDF}>
            📄 Xuất PDF
          </button>

          <button onClick={handleExportDOCX} disabled={exporting} style={btnDOCX}>
            📝 Xuất DOCX
          </button>

        </div>
        )}

      </div>

    </div>
  );
};

/* ═══════════ STYLES ═══════════ */

const btnRed = {
  padding: '10px 18px',
  borderRadius: 10,
  border: 'none',
  background: '#ef4444',
  color: '#fff',
  cursor: 'pointer',
  fontWeight: 600,
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

const btnPDF = {
  padding: '9px 16px',
  borderRadius: 10,
  border: '1px solid #fca5a5',
  background: '#fff1f2',
  color: '#dc2626',
  cursor: 'pointer',
  fontWeight: 500,
};

const btnDOCX = {
  padding: '9px 16px',
  borderRadius: 10,
  border: '1px solid #93c5fd',
  background: '#eff6ff',
  color: '#1d4ed8',
  cursor: 'pointer',
  fontWeight: 500,
};

export default FormDetail;