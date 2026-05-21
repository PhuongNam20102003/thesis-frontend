import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const NotificationBell = () => {

  const [notifications, setNotifications] = useState([]);
  const [open, setOpen]     = useState(false);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);
  const navigate    = useNavigate();

  const unread = notifications.filter(n => !n.is_read).length;

  // ── Fetch ───────────────────────────────────────────────────────
  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await api.get('/notifications');
      setNotifications(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Poll mỗi 30s để nhận thông báo mới
  useEffect(() => {
    fetchNotifications();
    const timer = setInterval(fetchNotifications, 30000);
    return () => clearInterval(timer);
  }, []);

  // Đóng dropdown khi click ra ngoài
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // ── Mark all read ───────────────────────────────────────────────
  const handleMarkAllRead = async (e) => {
    e.stopPropagation();
    try {
      await api.patch('/notifications/read-all');
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    } catch (err) {
      console.error(err);
    }
  };

  // ── Click notification ──────────────────────────────────────────
  const handleClick = async (n) => {
    // Đánh dấu đã đọc
    if (!n.is_read) {
      try {
        await api.patch(`/notifications/${n.id}/read`);
        setNotifications(prev =>
          prev.map(x => x.id === n.id ? { ...x, is_read: true } : x)
        );
      } catch (err) { console.error(err); }
    }

    setOpen(false);

    // Điều hướng theo link
    if (n.link) navigate(n.link);
  };

  // ── Icon theo type ──────────────────────────────────────────────
  const typeIcon = (type) => {
    const map = {
      form_approved: '✅',
      form_rejected: '↩️',
      form_submitted:'📋',
      system:        '📢',
    };
    return map[type] || '🔔';
  };

  const timeAgo = (dateStr) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const m = Math.floor(diff / 60000);
    if (m < 1)  return 'Vừa xong';
    if (m < 60) return `${m} phút trước`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h} giờ trước`;
    return `${Math.floor(h / 24)} ngày trước`;
  };

  // ── Render ──────────────────────────────────────────────────────
  return (
    <div ref={dropdownRef} style={{ position: 'relative' }}>

      {/* Bell button */}
      <button
        onClick={() => { setOpen(o => !o); if (!open) fetchNotifications(); }}
        style={{
          position: 'relative',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          padding: '6px 8px',
          borderRadius: 10,
          fontSize: 20,
          lineHeight: 1,
          color: '#374151',
          transition: 'background 0.15s',
        }}
        onMouseEnter={e => e.currentTarget.style.background = '#f3f4f6'}
        onMouseLeave={e => e.currentTarget.style.background = 'none'}
        title="Thông báo"
      >
        🔔
        {unread > 0 && (
          <span style={{
            position: 'absolute',
            top: 2, right: 2,
            background: '#ef4444',
            color: 'white',
            borderRadius: 999,
            fontSize: 10,
            fontWeight: 700,
            minWidth: 16,
            height: 16,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '0 4px',
            lineHeight: 1,
          }}>
            {unread > 99 ? '99+' : unread}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div style={{
          position: 'absolute',
          top: 'calc(100% + 8px)',
          right: 0,
          width: 360,
          background: 'white',
          border: '1px solid #e5e7eb',
          borderRadius: 14,
          boxShadow: '0 8px 30px rgba(0,0,0,0.12)',
          zIndex: 1000,
          overflow: 'hidden',
        }}>

          {/* Header */}
          <div style={{
            display: 'flex', justifyContent: 'space-between',
            alignItems: 'center',
            padding: '14px 16px',
            borderBottom: '1px solid #f3f4f6',
          }}>
            <span style={{ fontWeight: 700, fontSize: 15 }}>
              Thông báo {unread > 0 && (
                <span style={{
                  background: '#ef4444', color: 'white',
                  borderRadius: 999, fontSize: 11, padding: '1px 7px',
                  marginLeft: 6, fontWeight: 600,
                }}>
                  {unread}
                </span>
              )}
            </span>
            {unread > 0 && (
              <button
                onClick={handleMarkAllRead}
                style={{
                  background: 'none', border: 'none',
                  color: '#2563eb', fontSize: 12,
                  cursor: 'pointer', fontWeight: 500,
                }}
              >
                Đánh dấu tất cả đã đọc
              </button>
            )}
          </div>

          {/* List */}
          <div style={{ maxHeight: 420, overflowY: 'auto' }}>

            {loading && (
              <div style={{ padding: 30, textAlign: 'center', color: '#9ca3af', fontSize: 13 }}>
                Đang tải...
              </div>
            )}

            {!loading && notifications.length === 0 && (
              <div style={{ padding: 40, textAlign: 'center', color: '#9ca3af' }}>
                <div style={{ fontSize: 32, marginBottom: 8 }}>🔕</div>
                <div style={{ fontSize: 13 }}>Không có thông báo nào</div>
              </div>
            )}

            {!loading && notifications.map(n => (
              <div
                key={n.id}
                onClick={() => handleClick(n)}
                style={{
                  display: 'flex', gap: 12, alignItems: 'flex-start',
                  padding: '12px 16px',
                  cursor: n.link ? 'pointer' : 'default',
                  background: n.is_read ? 'white' : '#eff6ff',
                  borderBottom: '1px solid #f9fafb',
                  transition: 'background 0.1s',
                }}
                onMouseEnter={e => {
                  if (n.link) e.currentTarget.style.background = n.is_read ? '#f9fafb' : '#dbeafe';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = n.is_read ? 'white' : '#eff6ff';
                }}
              >

                {/* Icon */}
                <div style={{
                  width: 38, height: 38, borderRadius: 10,
                  background: n.is_read ? '#f3f4f6' : '#dbeafe',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 18, flexShrink: 0,
                }}>
                  {typeIcon(n.type)}
                </div>

                {/* Content */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    fontSize: 13, lineHeight: 1.5,
                    color: n.is_read ? '#374151' : '#1e3a5f',
                    fontWeight: n.is_read ? 400 : 500,
                  }}>
                    {n.message}
                  </div>
                  <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 3 }}>
                    {timeAgo(n.created_at)}
                  </div>
                </div>

                {/* Unread dot */}
                {!n.is_read && (
                  <div style={{
                    width: 8, height: 8, borderRadius: 999,
                    background: '#2563eb', flexShrink: 0, marginTop: 4,
                  }} />
                )}

              </div>
            ))}
          </div>

        </div>
      )}
    </div>
  );
};

export default NotificationBell;