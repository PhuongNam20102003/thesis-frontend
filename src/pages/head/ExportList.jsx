import { useState, useEffect } from 'react';
import { getCouncilList } from '../../services/councilService';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import toast from 'react-hot-toast';

const ExportList = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCouncilList().then(res => setData(res.data)).finally(() => setLoading(false));
  }, []);

  const handleExport = () => {
    const rows = data.map((row, i) => ({
      'STT': i + 1,
      'Tên đề tài': row.topic_title,
      'Lĩnh vực': row.field,
      'GV Hướng dẫn': row.teacher_name,
      'Sinh viên': row.students || 'Chưa có',
      'Trưởng Ban': row.chairman_name || 'Chưa phân công',
      'GV Phản biện': row.reviewer_name || 'Chưa phân công',
      'Thư ký ': row.secretary_name || 'Chưa phân công',
    }));

    const ws = XLSX.utils.json_to_sheet(rows);
    ws['!cols'] = [
      { wch: 5 }, { wch: 40 }, { wch: 20 }, { wch: 22 },
      { wch: 25 }, { wch: 22 }, { wch: 22 }, { wch: 22 }
    ];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Danh sách hội đồng');

    const buf = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    saveAs(new Blob([buf], { type: 'application/octet-stream' }), 'danh_sach_hoi_dong.xlsx');
    toast.success('Đã xuất file Excel thành công!');
  };

  if (loading) return <div style={{ padding: 32 }}>Đang tải...</div>;

  const headers = ['#', 'Tên đề tài', 'Lĩnh vực', 'GV Hướng dẫn', 'Sinh viên', 'Chủ tịch HĐ', 'GV Phản biện', 'Thư ký HĐ'];

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '24px 16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <h2 style={{ marginBottom: 4 }}>Xuất danh sách hội đồng</h2>
          <p style={{ color: '#888', fontSize: 14 }}>Danh sách phân công phản biện, chủ tịch và thư ký</p>
        </div>
        <button onClick={handleExport} style={{
          padding: '10px 20px', background: '#1D9E75', color: 'white',
          border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: 'pointer'
        }}>
           Xuất Excel
        </button>
      </div>

      {/* Thống kê nhanh */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, marginBottom: 20 }}>
        {[
          { label: 'Đã có Trưởng Ban', count: data.filter(r => r.chairman_name).length, color: '#0F6E56', bg: '#E1F5EE' },
          { label: 'Đã có GV Phản biện', count: data.filter(r => r.reviewer_name).length, color: '#185FA5', bg: '#E6F1FB' },
          { label: 'Đã có Thư ký', count: data.filter(r => r.secretary_name).length, color: '#854F0B', bg: '#FAEEDA' },
        ].map(s => (
          <div key={s.label} style={{ background: s.bg, borderRadius: 10, padding: '12px 16px' }}>
            <div style={{ fontSize: 11, color: s.color, marginBottom: 4 }}>{s.label}</div>
            <div style={{ fontSize: 22, fontWeight: 600, color: s.color }}>
              {s.count}/{data.length}
            </div>
          </div>
        ))}
      </div>

      <div style={{ background: 'white', border: '1px solid #eee', borderRadius: 12, overflow: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
          <thead>
            <tr style={{ background: '#f9f9f9' }}>
              {headers.map(h => (
                <th key={h} style={{
                  padding: '12px 14px', textAlign: 'left', fontWeight: 600,
                  color: '#555', borderBottom: '1px solid #eee', whiteSpace: 'nowrap'
                }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, i) => (
              <tr key={row.topic_id} style={{ borderBottom: '1px solid #f5f5f5' }}>
                <td style={{ padding: '12px 14px', color: '#aaa' }}>{i + 1}</td>
                <td style={{ padding: '12px 14px', fontWeight: 500, maxWidth: 180 }}>{row.topic_title}</td>
                <td style={{ padding: '12px 14px' }}>
                  <span style={{ background: '#E6F1FB', color: '#185FA5', padding: '2px 8px', borderRadius: 6, fontSize: 11 }}>
                    {row.field}
                  </span>
                </td>
                <td style={{ padding: '12px 14px' }}>{row.teacher_name}</td>
                <td style={{ padding: '12px 14px', color: row.students ? '#333' : '#bbb' }}>
                  {row.students || 'Chưa có'}
                </td>
                <td style={{ padding: '12px 14px' }}>
                  {row.chairman_name
                    ? <span style={{ color: '#0F6E56', fontWeight: 500 }}>{row.chairman_name}</span>
                    : <span style={{ color: '#bbb' }}>Chưa phân công</span>
                  }
                </td>
                <td style={{ padding: '12px 14px' }}>
                  {row.reviewer_name
                    ? <span style={{ color: '#185FA5', fontWeight: 500 }}>{row.reviewer_name}</span>
                    : <span style={{ color: '#bbb' }}>Chưa phân công</span>
                  }
                </td>
                <td style={{ padding: '12px 14px' }}>
                  {row.secretary_name
                    ? <span style={{ color: '#854F0B', fontWeight: 500 }}>{row.secretary_name}</span>
                    : <span style={{ color: '#bbb' }}>Chưa phân công</span>
                  }
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ExportList;