import { useMemo, useRef, useState } from "react";
import "./styles.css";

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

export default function App() {
  const canvasRef = useRef(null);
  const historyRef = useRef([]);
  const baseImageRef = useRef(null);
  const drawingRef = useRef(false);
  const startPointRef = useRef(null);
  const draggedRef = useRef(false);

  const [mode, setMode] = useState("brush");
  const [tileSize, setTileSize] = useState(18);
  const [brushSize, setBrushSize] = useState(64);
  const [rectW, setRectW] = useState(240);
  const [rectH, setRectH] = useState(160);
  const [status, setStatus] = useState("請先載入圖片");

  const modeText = useMemo(() => (mode === "brush" ? "筆刷塗抹" : "矩形框選"), [mode]);

  function getCtx() {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    return canvas.getContext("2d");
  }

  function getPointer(event) {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    return {
      x: clamp((event.clientX - rect.left) * scaleX, 0, canvas.width),
      y: clamp((event.clientY - rect.top) * scaleY, 0, canvas.height),
    };
  }

  function pushHistory() {
    const canvas = canvasRef.current;
    const ctx = getCtx();
    if (!canvas || !ctx || !canvas.width || !canvas.height) return;
    historyRef.current.push(ctx.getImageData(0, 0, canvas.width, canvas.height));
    if (historyRef.current.length > 20) historyRef.current.shift();
  }

  function applyMosaic(x, y, width, height, mosaicTileSize) {
    const canvas = canvasRef.current;
    const ctx = getCtx();
    if (!canvas || !ctx) return;

    const px = Math.floor(clamp(x, 0, canvas.width));
    const py = Math.floor(clamp(y, 0, canvas.height));
    const pw = Math.floor(clamp(width, 0, canvas.width - px));
    const ph = Math.floor(clamp(height, 0, canvas.height - py));
    const size = Math.max(2, Number(mosaicTileSize) || 18);

    if (pw <= 0 || ph <= 0) return;

    const src = ctx.getImageData(px, py, pw, ph);
    const srcData = src.data;
    const dst = ctx.createImageData(pw, ph);
    const dstData = dst.data;

    for (let by = 0; by < ph; by += size) {
      for (let bx = 0; bx < pw; bx += size) {
        const sampleIndex = (by * pw + bx) * 4;
        const r = srcData[sampleIndex];
        const g = srcData[sampleIndex + 1];
        const b = srcData[sampleIndex + 2];
        const a = srcData[sampleIndex + 3];
        const maxY = Math.min(by + size, ph);
        const maxX = Math.min(bx + size, pw);

        for (let y2 = by; y2 < maxY; y2 += 1) {
          for (let x2 = bx; x2 < maxX; x2 += 1) {
            const i = (y2 * pw + x2) * 4;
            dstData[i] = r;
            dstData[i + 1] = g;
            dstData[i + 2] = b;
            dstData[i + 3] = a;
          }
        }
      }
    }

    ctx.putImageData(dst, px, py);
  }

  function drawPreviewRect(rect) {
    const ctx = getCtx();
    if (!ctx || historyRef.current.length === 0) return;

    const base = historyRef.current[historyRef.current.length - 1];
    ctx.putImageData(base, 0, 0);
    ctx.save();
    ctx.strokeStyle = "#1f6fff";
    ctx.setLineDash([7, 4]);
    ctx.lineWidth = 2;
    ctx.strokeRect(rect.x, rect.y, rect.w, rect.h);
    ctx.restore();
  }

  function handleFileChange(event) {
    const file = event.target.files?.[0];
    if (!file) return;

    const canvas = canvasRef.current;
    const ctx = getCtx();
    if (!canvas || !ctx) return;

    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
      baseImageRef.current = ctx.getImageData(0, 0, canvas.width, canvas.height);
      historyRef.current = [];
      setStatus(`已載入：${img.width} x ${img.height}`);
      URL.revokeObjectURL(url);
    };

    img.src = url;
  }

  function handleMouseDown(event) {
    const canvas = canvasRef.current;
    if (!canvas || !canvas.width || !canvas.height) return;

    const point = getPointer(event);
    if (!point) return;

    drawingRef.current = true;
    draggedRef.current = false;
    startPointRef.current = point;
    pushHistory();

    if (mode === "brush") {
      applyMosaic(
        point.x - brushSize / 2,
        point.y - brushSize / 2,
        brushSize,
        brushSize,
        tileSize,
      );
    }
  }

  function handleMouseMove(event) {
    if (!drawingRef.current || !startPointRef.current) return;

    const point = getPointer(event);
    if (!point) return;

    const dx = point.x - startPointRef.current.x;
    const dy = point.y - startPointRef.current.y;
    if (Math.abs(dx) > 2 || Math.abs(dy) > 2) draggedRef.current = true;

    if (mode === "brush") {
      applyMosaic(point.x - brushSize / 2, point.y - brushSize / 2, brushSize, brushSize, tileSize);
      return;
    }

    drawPreviewRect({
      x: dx >= 0 ? startPointRef.current.x : point.x,
      y: dy >= 0 ? startPointRef.current.y : point.y,
      w: Math.abs(dx),
      h: Math.abs(dy),
    });
  }

  function commitRect(event) {
    if (!drawingRef.current || !startPointRef.current) return;

    if (mode !== "rect") {
      drawingRef.current = false;
      startPointRef.current = null;
      return;
    }

    const point = getPointer(event);
    if (!point) return;

    const w = point.x - startPointRef.current.x;
    const h = point.y - startPointRef.current.y;
    const x = w >= 0 ? startPointRef.current.x : point.x;
    const y = h >= 0 ? startPointRef.current.y : point.y;

    if (Math.abs(w) > 1 || Math.abs(h) > 1) {
      applyMosaic(x, y, Math.abs(w), Math.abs(h), tileSize);
    }

    drawingRef.current = false;
    startPointRef.current = null;
  }

  function handleMouseUp(event) {
    commitRect(event);
  }

  function handleMouseLeave(event) {
    if (drawingRef.current) commitRect(event);
  }

  function handleCanvasClick(event) {
    const canvas = canvasRef.current;
    if (!canvas || mode !== "rect" || draggedRef.current) return;

    const point = getPointer(event);
    if (!point) return;

    pushHistory();
    applyMosaic(point.x - rectW / 2, point.y - rectH / 2, rectW, rectH, tileSize);
  }

  function handleUndo() {
    const ctx = getCtx();
    if (!ctx || historyRef.current.length === 0) return;
    const prev = historyRef.current.pop();
    ctx.putImageData(prev, 0, 0);
  }

  function handleReset() {
    const ctx = getCtx();
    if (!ctx || !baseImageRef.current) return;
    ctx.putImageData(baseImageRef.current, 0, 0);
    historyRef.current = [];
  }

  function handleClearPreview() {
    const ctx = getCtx();
    if (!ctx || historyRef.current.length === 0) return;
    const latest = historyRef.current[historyRef.current.length - 1];
    ctx.putImageData(latest, 0, 0);
  }

  function handleDownload() {
    const canvas = canvasRef.current;
    if (!canvas || !canvas.width || !canvas.height) return;
    const link = document.createElement("a");
    link.download = "mosaic-output.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
  }

  function handleModeChange(nextMode) {
    setMode(nextMode);
    setStatus(nextMode === "brush" ? "模式：筆刷塗抹" : "模式：矩形框選");
  }

  return (
    <div className="shell">
      <aside className="card sidebar">
        <h1 className="title">Mosaic Studio</h1>
        <p className="subtitle">矩形框選 + 筆刷塗抹，快速做局部隱私處理。</p>

        <section className="group">
          <p className="group-title">圖片</p>
          <div className="field">
            <label htmlFor="fileInput">載入圖片</label>
            <input id="fileInput" type="file" accept="image/*" onChange={handleFileChange} />
          </div>
        </section>

        <section className="group">
          <p className="group-title">馬賽克參數</p>

          <div className="field">
            <label htmlFor="mode">模式</label>
            <select id="mode" value={mode} onChange={(e) => handleModeChange(e.target.value)}>
              <option value="brush">筆刷塗抹</option>
              <option value="rect">矩形框選</option>
            </select>
          </div>

          <div className="field">
            <label htmlFor="tileSize">顆粒尺寸 (px)</label>
            <input
              id="tileSize"
              type="number"
              min="2"
              max="150"
              value={tileSize}
              onChange={(e) => setTileSize(Number(e.target.value) || 2)}
            />
          </div>

          <div className="field">
            <label htmlFor="brushSize">筆刷範圍 (px)</label>
            <input
              id="brushSize"
              type="number"
              min="4"
              max="500"
              value={brushSize}
              onChange={(e) => setBrushSize(Number(e.target.value) || 4)}
            />
          </div>

          <div className="field">
            <label>固定矩形尺寸 (px)</label>
            <div className="split">
              <input
                id="rectW"
                type="number"
                min="4"
                max="2000"
                value={rectW}
                onChange={(e) => setRectW(Number(e.target.value) || 4)}
              />
              <input
                id="rectH"
                type="number"
                min="4"
                max="2000"
                value={rectH}
                onChange={(e) => setRectH(Number(e.target.value) || 4)}
              />
            </div>
          </div>
        </section>

        <section className="group">
          <p className="group-title">操作</p>
          <div className="split">
            <button className="ghost" type="button" onClick={handleUndo}>
              復原
            </button>
            <button className="warn" type="button" onClick={handleReset}>
              重置
            </button>
          </div>
          <div className="split">
            <button className="primary" type="button" onClick={handleDownload}>
              下載圖片
            </button>
            <button className="ghost" type="button" onClick={handleClearPreview}>
              清除框選
            </button>
          </div>
        </section>

        <p className="tips">
          筆刷模式：按住拖曳即套用。
          <br />
          矩形模式：拖曳框選後放開套用；或直接點擊使用固定框。
        </p>
      </aside>

      <main className="card stage">
        <div className="toolbar">
          <span className="status">{status}</span>
          <span className="chip">{modeText}</span>
        </div>

        <div className="canvas-wrap">
          <canvas
            id="canvas"
            ref={canvasRef}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseLeave}
            onClick={handleCanvasClick}
          />
        </div>
      </main>
    </div>
  );
}
