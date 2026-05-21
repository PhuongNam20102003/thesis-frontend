const LoadingSpinner = ({ text = 'Đang tải...' }) => (
  <div style={{
    display: 'flex', flexDirection: 'column',
    alignItems: 'center', justifyContent: 'center',
    padding: 60, color: '#888',
  }}>
    <div style={{
      width: 40, height: 40, borderRadius: '50%',
      border: '3px solid #E1F5EE',
      borderTopColor: '#1D9E75',
      animation: 'spin 0.8s linear infinite',
      marginBottom: 12,
    }} />
    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    <div style={{ fontSize: 13 }}>{text}</div>
  </div>
);

export default LoadingSpinner;