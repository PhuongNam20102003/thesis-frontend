import { useState, useEffect } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';

const ROLES = [
  { value: 'student',  label: 'Sinh viên',    icon: '🎓' },
  { value: 'teacher',  label: 'Giảng viên',   icon: '👨‍🏫' },
  { value: 'head',     label: 'Trưởng ngành', icon: '👔' },
];

const emptyForm = {
  full_name: '', email: '', password: '',
  role: 'student', student_class: '', gpa: '', research_field: '',
};

const AdminUsers = () => {

  const [users, setUsers]         = useState([]);
  const [loading, setLoading]     = useState(true);
  const [saving, setSaving]       = useState(false);
  const [showForm, setShowForm]   = useState(false);
  const [editUser, setEditUser]   = useState(null); // null = tạo mới
  const [form, setForm]           = useState(emptyForm);
  const [showPass, setShowPass]   = useState(false);
  const [filterRole, setFilterRole] = useState('all');
  const [search, setSearch]       = useState('');
  const [confirmDelete, setConfirmDelete] = useState(null);

  useEffect(() => { fetchUsers(); }, []);

  const fetchUsers = async () => {
    try {
      const res = await api.get('/auth/admin/users');
      setUsers(res.data);
    } catch { toast.error('Không tải được danh sách!'); }
    finally { setLoading(false); }
  };

  // ── Open form ─────────────────────────────────────────────────
  const openCreate = () => {
    setEditUser(null);
    setForm(emptyForm);
    setShowPass(false);
    setShowForm(true);
  };

  const openEdit = (u) => {
    setEditUser(u);
    setForm({
      full_name:      u.full_name,
      email:          u.email,
      password:       '',
      role:           u.role,
      student_class:  u.student_class || '',
      gpa:            u.gpa || '',
      research_field: u.research_field || '',
    });
    setShowPass(false);
    setShowForm(true);
  };

  // ── Submit ────────────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!form.full_name || !form.email || (!editUser && !form.password)) {
      toast.error('Vui lòng nhập đầy đủ thông tin!');
      return;
    }

    setSaving(true);
    try {
      if (editUser) {
        await api.patch(`/auth/admin/users/${editUser.id}`, form);
        toast.success('Đã cập nhật tài khoản!');
      } else {
        await api.post('/auth/admin/users', form);
        toast.success('Đã tạo tài khoản!');
      }
      setShowForm(false);
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Có lỗi xảy ra!');
    } finally {
      setSaving(false);
    }
  };

  // ── Delete ────────────────────────────────────────────────────
  const handleDelete = async (id) => {
    try {
      await api.delete(`/auth/admin/users/${id}`);
      toast.success('Đã xoá tài khoản!');
      setConfirmDelete(null);
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Có lỗi xảy ra!');
    }
  };

  // ── Filter ────────────────────────────────────────────────────
  const displayed = users.filter(u => {
    const matchRole = filterRole === 'all' || u.role === filterRole;
    const matchSearch = !search ||
      u.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase());
    return matchRole && matchSearch;
  });

  const roleInfo = (role) => ROLES.find(r => r.value === role) || { label: role, icon: '👤' };

  if (loading) return <div style={{ padding: 40, textAlign: 'center' }}>Loading...</div>;

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '24px 16px' }}>

      {/* ── Header ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h2 style={{ margin: 0 }}>Quản lý tài khoản</h2>
          <p style={{ color: '#9ca3af', fontSize: 13, marginTop: 4 }}>
            {users.length} tài khoản trong hệ thống
          </p>
        </div>
        <button onClick={openCreate} style={btnGreen}>
          + Tạo tài khoản mới
        </button>
      </div>

      {/* ── Summary cards ── */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
        {ROLES.map(r => (
          <div key={r.value} style={{
            background: 'white', border: '1px solid #e5e7eb',
            borderRadius: 12, padding: '12px 20px', minWidth: 130,
          }}>
            <div style={{ fontSize: 22, marginBottom: 4 }}>{r.icon}</div>
            <div style={{ fontSize: 22, fontWeight: 700, color: '#111' }}>
              {users.filter(u => u.role === r.value).length}
            </div>
            <div style={{ fontSize: 12, color: '#6b7280' }}>{r.label}</div>
          </div>
        ))}
      </div>

      {/* ── Filters ── */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
        <input
          placeholder="Tìm tên hoặc email..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{
            padding: '9px 14px', borderRadius: 10,
            border: '1px solid #d1d5db', fontSize: 13,
            width: 260, outline: 'none',
          }}
        />
        <div style={{ display: 'flex', gap: 6 }}>
          {[{ value: 'all', label: 'Tất cả' }, ...ROLES].map(r => (
            <button
              key={r.value}
              onClick={() => setFilterRole(r.value)}
              style={{
                padding: '8px 14px', borderRadius: 8, fontSize: 12,
                border: '1px solid',
                borderColor: filterRole === r.value ? '#1D9E75' : '#d1d5db',
                background: filterRole === r.value ? '#e6f9f1' : 'white',
                color: filterRole === r.value ? '#0F6E56' : '#374151',
                cursor: 'pointer', fontWeight: filterRole === r.value ? 600 : 400,
              }}
            >
              {r.label || 'Tất cả'}
            </button>
          ))}
        </div>
      </div>

      {/* ── Table ── */}
      <div style={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: 14, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f8fafc' }}>
              {['Họ tên', 'Email', 'Vai trò', 'Lớp / Chuyên môn', 'Hành động'].map(h => (
                <th key={h} style={th}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {displayed.length === 0 && (
              <tr>
                <td colSpan={5} style={{ padding: 40, textAlign: 'center', color: '#9ca3af' }}>
                  Không có tài khoản nào
                </td>
              </tr>
            )}
            {displayed.map((u, idx) => {
              const r = roleInfo(u.role);
              return (
                <tr key={u.id}
                  style={{ background: idx % 2 === 0 ? 'white' : '#fafafa' }}
                  onMouseEnter={e => e.currentTarget.style.background = '#f0f7ff'}
                  onMouseLeave={e => e.currentTarget.style.background = idx % 2 === 0 ? 'white' : '#fafafa'}
                >
                  <td style={td}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{
                        width: 36, height: 36, borderRadius: '50%',
                        background: 'linear-gradient(135deg, #0F6E56, #1D9E75)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: 'white', fontWeight: 700, fontSize: 14, flexShrink: 0,
                      }}>
                        {u.full_name?.charAt(0).toUpperCase()}
                      </div>
                      <div style={{ fontWeight: 500 }}>{u.full_name}</div>
                    </div>
                  </td>
                  <td style={{ ...td, color: '#6b7280' }}>{u.email}</td>
                  <td style={td}>
                    <span style={{
                      background: u.role === 'student' ? '#eff6ff' : u.role === 'teacher' ? '#f0fdf4' : '#fef9c3',
                      color:      u.role === 'student' ? '#1d4ed8' : u.role === 'teacher' ? '#15803d' : '#854d0e',
                      padding: '4px 10px', borderRadius: 20,
                      fontSize: 12, fontWeight: 600,
                    }}>
                      {r.icon} {r.label}
                    </span>
                  </td>
                  <td style={{ ...td, color: '#6b7280', fontSize: 12 }}>
                    {u.role === 'student'
                      ? `${u.student_class || '—'} ${u.gpa ? `· GPA: ${u.gpa}` : ''}`
                      : u.research_field || '—'}
                  </td>
                  <td style={td}>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button onClick={() => openEdit(u)} style={btnEdit}>✏️ Sửa</button>
                      <button onClick={() => setConfirmDelete(u)} style={btnDel}>🗑</button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* ── Modal tạo/sửa tài khoản ── */}
      {showForm && (
        <div style={overlay} onClick={() => setShowForm(false)}>
          <div style={modal} onClick={e => e.stopPropagation()}>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <h3 style={{ margin: 0 }}>
                {editUser ? '✏️ Cập nhật tài khoản' : '➕ Tạo tài khoản mới'}
              </h3>
              <button onClick={() => setShowForm(false)} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: '#9ca3af' }}>✕</button>
            </div>

            {/* Role selector */}
            <div style={{ marginBottom: 20 }}>
              <label style={labelStyle}>Vai trò</label>
              <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                {ROLES.map(r => (
                  <button
                    key={r.value}
                    onClick={() => setForm(f => ({ ...f, role: r.value }))}
                    style={{
                      flex: 1, padding: '10px 8px', borderRadius: 10,
                      border: '1.5px solid',
                      borderColor: form.role === r.value ? '#1D9E75' : '#e5e7eb',
                      background: form.role === r.value ? '#e6f9f1' : 'white',
                      color: form.role === r.value ? '#0F6E56' : '#374151',
                      cursor: 'pointer', fontSize: 13, fontWeight: form.role === r.value ? 700 : 400,
                      textAlign: 'center',
                    }}
                  >
                    <div style={{ fontSize: 20, marginBottom: 4 }}>{r.icon}</div>
                    {r.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Họ tên */}
            <Field label="Họ và tên *" value={form.full_name}
              onChange={v => setForm(f => ({ ...f, full_name: v }))}
              placeholder="Nguyễn Văn A" />

            {/* Email */}
            <Field label="Email *" type="email" value={form.email}
              onChange={v => setForm(f => ({ ...f, email: v }))}
              placeholder="email@edu.vn" />

            {/* Mật khẩu */}
            <div style={{ marginBottom: 16 }}>
              <label style={labelStyle}>
                {editUser ? 'Mật khẩu mới (để trống nếu không đổi)' : 'Mật khẩu *'}
              </label>
              <div style={{ position: 'relative', marginTop: 6 }}>
                <input
                  type={showPass ? 'text' : 'password'}
                  value={form.password}
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                  placeholder={editUser ? 'Để trống nếu không đổi' : 'Nhập mật khẩu'}
                  style={{ ...inputStyle, paddingRight: 44 }}
                />
                <button type="button" onClick={() => setShowPass(p => !p)} style={{
                  position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af',
                }}>
                  {showPass ? '🙈' : '👁'}
                </button>
              </div>
            </div>

            {/* Student fields */}
            {form.role === 'student' && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <Field label="Lớp" value={form.student_class}
                  onChange={v => setForm(f => ({ ...f, student_class: v }))}
                  placeholder="21BITV04" />
                <Field label="GPA" type="number" value={form.gpa}
                  onChange={v => setForm(f => ({ ...f, gpa: v }))}
                  placeholder="3.5" />
              </div>
            )}

            {/* Teacher/Head field */}
            {(form.role === 'teacher' || form.role === 'head') && (
              <Field label="Chuyên môn / Lĩnh vực" value={form.research_field}
                onChange={v => setForm(f => ({ ...f, research_field: v }))}
                placeholder="Trí tuệ nhân tạo, Web..." />
            )}

            {/* Buttons */}
            <div style={{ display: 'flex', gap: 10, marginTop: 24 }}>
              <button onClick={() => setShowForm(false)} style={{ ...btnWhite, flex: 1 }}>
                Huỷ
              </button>
              <button onClick={handleSubmit} disabled={saving} style={{ ...btnGreen, flex: 2 }}>
                {saving ? 'Đang lưu...' : editUser ? 'Cập nhật' : 'Tạo tài khoản'}
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ── Modal xác nhận xoá ── */}
      {confirmDelete && (
        <div style={overlay} onClick={() => setConfirmDelete(null)}>
          <div style={{ ...modal, maxWidth: 380 }} onClick={e => e.stopPropagation()}>
            <div style={{ textAlign: 'center', marginBottom: 20 }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>⚠️</div>
              <h3 style={{ margin: 0, marginBottom: 8 }}>Xoá tài khoản?</h3>
              <p style={{ color: '#6b7280', fontSize: 14 }}>
                Bạn chắc chắn muốn xoá tài khoản của <b>{confirmDelete.full_name}</b>?<br />
                Hành động này không thể hoàn tác.
              </p>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setConfirmDelete(null)} style={{ ...btnWhite, flex: 1 }}>Huỷ</button>
              <button onClick={() => handleDelete(confirmDelete.id)} style={{
                flex: 1, padding: '11px', borderRadius: 10,
                border: 'none', background: '#ef4444',
                color: 'white', cursor: 'pointer', fontWeight: 600,
              }}>
                Xoá
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

// ── Field helper ───────────────────────────────────────────────────
const Field = ({ label, value, onChange, placeholder, type = 'text' }) => (
  <div style={{ marginBottom: 16 }}>
    <label style={labelStyle}>{label}</label>
    <input
      type={type} value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      style={{ ...inputStyle, marginTop: 6 }}
    />
  </div>
);

/* ═══════════ STYLES ═══════════ */
const th = { padding: '12px 16px', fontSize: 12, fontWeight: 600, color: '#374151', borderBottom: '2px solid #e5e7eb', textAlign: 'left' };
const td = { padding: '12px 16px', fontSize: 13, borderBottom: '1px solid #f3f4f6', verticalAlign: 'middle' };
const btnGreen = { padding: '10px 18px', borderRadius: 10, border: 'none', background: 'linear-gradient(135deg, #0F6E56, #1D9E75)', color: '#fff', cursor: 'pointer', fontWeight: 600, fontSize: 13 };
const btnWhite = { padding: '10px 16px', borderRadius: 10, border: '1px solid #d1d5db', background: '#fff', cursor: 'pointer', fontSize: 13 };
const btnEdit  = { padding: '6px 12px', borderRadius: 8, border: '1px solid #d1d5db', background: 'white', cursor: 'pointer', fontSize: 12 };
const btnDel   = { padding: '6px 10px', borderRadius: 8, border: '1px solid #fca5a5', background: '#fff1f2', cursor: 'pointer', fontSize: 12 };
const overlay  = { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 };
const modal    = { background: 'white', borderRadius: 16, padding: 28, width: '100%', maxWidth: 480, boxShadow: '0 20px 60px rgba(0,0,0,0.15)', maxHeight: '90vh', overflowY: 'auto' };
const labelStyle = { fontSize: 13, fontWeight: 600, color: '#374151' };
const inputStyle = { width: '100%', padding: '11px 14px', border: '1.5px solid #e5e7eb', borderRadius: 10, fontSize: 14, boxSizing: 'border-box', outline: 'none', fontFamily: 'inherit' };

export default AdminUsers;