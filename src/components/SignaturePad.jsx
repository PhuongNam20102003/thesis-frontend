import { useRef, useEffect, useState } from 'react';

const SignaturePad = ({ onSave, existingSignature, label = 'Ký tên' }) => {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isEmpty, setIsEmpty] = useState(true);
  const [saved, setSaved] = useState(!!existingSignature);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.strokeStyle = '#1a1a1a';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // Hiển thị chữ ký cũ nếu có
    if (existingSignature) {
      const img = new Image();
      img.onload = () => ctx.drawImage(img, 0, 0);
      img.src = existingSignature;
      setIsEmpty(false);
    }
  }, [existingSignature]);

  const getPos = (e, canvas) => {
    const rect = canvas.getBoundingClientRect();
    const touch = e.touches ? e.touches[0] : e;
    return {
      x: (touch.clientX - rect.left) * (canvas.width / rect.width),
      y: (touch.clientY - rect.top) * (canvas.height / rect.height),
    };
  };

  const startDraw = (e) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const pos = getPos(e, canvas);
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
    setIsDrawing(true);
    setIsEmpty(false);
    setSaved(false);
  };

  const draw = (e) => {
    e.preventDefault();
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const pos = getPos(e, canvas);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
  };

  const endDraw = () => setIsDrawing(false);

  const clear = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setIsEmpty(true);
    setSaved(false);
    onSave(null);
  };

  const save = () => {
    if (isEmpty) { alert('Vui lòng ký tên trước!'); return; }
    const dataURL = canvasRef.current.toDataURL('image/png');
    onSave(dataURL);
    setSaved(true);
  };

  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ fontSize: 13, fontWeight: 500, color: '#555', marginBottom: 6 }}>
        {label}
      </div>
      <div style={{
        border: `2px solid ${saved ? '#1D9E75' : '#ddd'}`,
        borderRadius: 8, overflow: 'hidden', background: '#fafafa',
        position: 'relative',
      }}>
        <canvas
          ref={canvasRef}
          width={380} height={120}
          style={{ display: 'block', width: '100%', cursor: 'crosshair', touchAction: 'none' }}
          onMouseDown={startDraw} onMouseMove={draw} onMouseUp={endDraw} onMouseLeave={endDraw}
          onTouchStart={startDraw} onTouchMove={draw} onTouchEnd={endDraw}
        />
        {isEmpty && (
          <div style={{
            position: 'absolute', top: '50%', left: '50%',
            transform: 'translate(-50%,-50%)',
            color: '#ccc', fontSize: 13, pointerEvents: 'none',
          }}>
            Ký tên tại đây
          </div>
        )}
      </div>
      <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
        <button type="button" onClick={clear} style={{
          padding: '5px 14px', border: '1px solid #ddd', borderRadius: 6,
          background: 'white', fontSize: 12, cursor: 'pointer', color: '#555',
        }}>
          Xoá
        </button>
        <button type="button" onClick={save} style={{
          padding: '5px 14px', border: 'none', borderRadius: 6,
          background: saved ? '#EAF3DE' : '#1D9E75',
          color: saved ? '#3B6D11' : 'white',
          fontSize: 12, cursor: 'pointer', fontWeight: 500,
        }}>
          {saved ? '✓ Đã lưu chữ ký' : 'Lưu chữ ký'}
        </button>
      </div>
    </div>
  );
};

export default SignaturePad;