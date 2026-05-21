const ConfirmModal = ({ isOpen, title, message, onConfirm, onCancel, confirmText = 'Xác nhận', confirmColor = '#E24B4A' }) => {
  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)',
      zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center',
      backdropFilter: 'blur(2px)',
    }} onClick={onCancel}>
      <div style={{
        background: 'white', borderRadius: 16, padding: 28,
        width: 380, maxWidth: '90vw',
        boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
        animation: 'popIn 0.2s ease',
      }} onClick={e => e.stopPropagation()}>
        <div style={{ fontSize: 40, textAlign: 'center', marginBottom: 12 }}>⚠️</div>
        <h3 style={{ textAlign: 'center', fontSize: 18, fontWeight: 600, marginBottom: 8, color: '#333' }}>
          {title}
        </h3>
        <p style={{ textAlign: 'center', color: '#888', fontSize: 14, marginBottom: 24, lineHeight: 1.6 }}>
          {message}
        </p>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={onCancel} style={{
            flex: 1, padding: '10px', border: '1px solid #ddd',
            borderRadius: 8, background: 'white', fontSize: 14,
            cursor: 'pointer', color: '#555',
          }}>
            Huỷ
          </button>
          <button onClick={onConfirm} style={{
            flex: 1, padding: '10px', border: 'none',
            borderRadius: 8, background: confirmColor,
            color: 'white', fontSize: 14, fontWeight: 600, cursor: 'pointer',
          }}>
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;