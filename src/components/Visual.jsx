import React, { useRef, useEffect, useState } from 'react';
import './Visual.css';

const Board = () => {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [prevPosition, setPrevPosition] = useState({ x: 0, y: 0 });
  const [brushColor, setBrushColor] = useState('black');
  const [brushSize, setBrushSize] = useState(2);
  const [isErasing, setIsErasing] = useState(false);
  const [canvasHistory, setCanvasHistory] = useState([]);
  const [canvasHistoryIndex, setCanvasHistoryIndex] = useState(-1);
  const [selectedShape, setSelectedShape] = useState(null);

  // Added state for drawing data points
  const [drawingData, setDrawingData] = useState([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    context.lineCap = 'round';
  }, []);

  const handleMouseDown = (e) => {
    if (selectedShape) {
      // Draw shape
      drawShape(e);
      return;
    }
    setIsDrawing(true);
    const newPosition = { x: e.nativeEvent.offsetX, y: e.nativeEvent.offsetY };
    setPrevPosition(newPosition);

    // Capture data point for drawing
    const dataPoint = {
      x: newPosition.x,
      y: newPosition.y,
      color: brushColor,
      size: brushSize,
      isErasing,
    };
    setDrawingData([...drawingData, dataPoint]);
  };

  const handleMouseUp = () => {
    setIsDrawing(false);
    if (canvasHistoryIndex !== canvasHistory.length - 1) {
      // If we draw after undo, clear the future history
      setCanvasHistory(canvasHistory.slice(0, canvasHistoryIndex + 1));
    }
    const canvas = canvasRef.current;
    setCanvasHistory([...canvasHistory, canvas.toDataURL()]);
    setCanvasHistoryIndex(canvasHistory.length);
  };

  const handleMouseMove = (e) => {
    if (!isDrawing) return;

    if (selectedShape) return; // Don't draw freehand when a shape is selected

    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    const newPosition = { x: e.nativeEvent.offsetX, y: e.nativeEvent.offsetY };

    context.beginPath();
    context.moveTo(prevPosition.x, prevPosition.y);
    context.lineTo(newPosition.x, newPosition.y);

    if (isErasing) {
      context.strokeStyle = 'white'; // Set eraser color
      context.lineWidth = brushSize * 6; // Adjust eraser size
    } else {
      context.strokeStyle = brushColor;
      context.lineWidth = brushSize;
    }

    context.stroke();

    setPrevPosition(newPosition);

    // Capture data point for drawing
    const dataPoint = {
      x: newPosition.x,
      y: newPosition.y,
      color: brushColor,
      size: brushSize,
      isErasing,
    };
    setDrawingData([...drawingData, dataPoint]);
  };

  const drawShape = (e) => {
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    context.strokeStyle = brushColor;
    context.lineWidth = brushSize;

    const currentPosition = { x: e.nativeEvent.offsetX, y: e.nativeEvent.offsetY };

    const fixedSize = 20; // Set the fixed size for all shapes

    if (selectedShape === 'circle') {
      const radius = fixedSize / 2;
      context.beginPath();
      context.arc(currentPosition.x, currentPosition.y, radius, 0, 2 * Math.PI);
    } else if (selectedShape === 'square') {
      context.beginPath();
      context.rect(
        currentPosition.x - fixedSize / 2,
        currentPosition.y - fixedSize / 2,
        fixedSize,
        fixedSize
      );
    } else if (selectedShape === 'triangle') {
      context.beginPath();
      context.moveTo(currentPosition.x, currentPosition.y - fixedSize / 2);
      context.lineTo(
        currentPosition.x + (Math.sqrt(3) / 2) * (fixedSize / 2),
        currentPosition.y + fixedSize / 2
      );
      context.lineTo(
        currentPosition.x - (Math.sqrt(3) / 2) * (fixedSize / 2),
        currentPosition.y + fixedSize / 2
      );
      context.closePath();
    } else if (selectedShape === 'rectangle') {
      context.beginPath();
      context.rect(
        currentPosition.x - fixedSize / 2,
        currentPosition.y - (fixedSize / 2) / 2,
        fixedSize,
        fixedSize / 2
      );
    }

    context.stroke();
  };

  const handleBrushColorChange = (color) => {
    setIsErasing(false);
    setSelectedShape(null); // Deselect the current shape
    setBrushColor(color);
  };

  const handleBrushSizeChange = (size) => {
    setIsErasing(false);
    setSelectedShape(null); // Deselect the current shape
    setBrushSize(size);
  };

  const handleEraser = () => {
    setSelectedShape(null); // Deselect the current shape
    setIsErasing(true);
  };

  const handleClear = () => {
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    context.clearRect(0, 0, canvas.width, canvas.height);
    setCanvasHistory([]);
    setCanvasHistoryIndex(-1);
    setSelectedShape(null); // Deselect the current shape
  };

  const handleUndo = () => {
    if (canvasHistoryIndex > 0) {
      setCanvasHistoryIndex(canvasHistoryIndex - 1);
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      const img = new Image();
      img.src = canvasHistory[canvasHistoryIndex - 1];
      img.onload = () => {
        context.clearRect(0, 0, canvas.width, canvas.height);
        context.drawImage(img, 0, 0);
      };
    }
    setSelectedShape(null); // Deselect the current shape
  };

  const handleRedo = () => {
    if (canvasHistoryIndex < canvasHistory.length - 1) {
      setCanvasHistoryIndex(canvasHistoryIndex + 1);
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      const img = new Image();
      img.src = canvasHistory[canvasHistoryIndex + 1];
      img.onload = () => {
        context.clearRect(0, 0, canvas.width, canvas.height);
        context.drawImage(img, 0, 0);
      };
    }
    setSelectedShape(null); // Deselect the current shape
  };

  const handleSave = () => {
    const canvas = canvasRef.current;
    const link = document.createElement('a');
    link.download = 'drawing.png';
    link.href = canvas.toDataURL();
    link.click();
  };

  const handleShapeSelect = (shape) => {
    setIsErasing(false);
    setSelectedShape(shape);
  };

  const handleResize = () => {
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    const imageData = context.getImageData(0, 0, canvas.width, canvas.height);

    canvas.width = window.innerWidth * 0.8;
    canvas.height = window.innerHeight * 0.8;

    context.putImageData(imageData, 0, 0);
  };

  window.addEventListener('resize', handleResize);

  return (
    <div>
      <div className="menu-bar">
        <div className="color-buttons">
          <button className="color-button black" onClick={() => handleBrushColorChange('black')}>
            Black
          </button>
          <button className="color-button red" onClick={() => handleBrushColorChange('red')}>
            Red
          </button>
          <button className="color-button blue" onClick={() => handleBrushColorChange('blue')}>
            Blue
          </button>
        </div>
        <div className="brush-controls">
          <input
            type="range"
            min="1"
            max="10"
            value={brushSize}
            onChange={(e) => handleBrushSizeChange(e.target.value)}
          />
          <button className="brush-button eraser" onClick={handleEraser}>
            Erase
          </button>
          <button className="brush-button clear" onClick={handleClear}>
            Clear
          </button>
          <button className="brush-button undo" onClick={handleUndo} disabled={canvasHistoryIndex <= 0}>
            Undo
          </button>
          <button className="brush-button redo" onClick={handleRedo} disabled={canvasHistoryIndex === canvasHistory.length - 1}>
            Redo
          </button>
          <button className="brush-button save" onClick={handleSave}>
            Save
          </button>
        </div>
        <div className="shape-buttons">
          <button className="shape-button circle" onClick={() => handleShapeSelect('circle')}>
            Circle
          </button>
          <button className="shape-button square" onClick={() => handleShapeSelect('square')}>
            Square
          </button>
          <button className="shape-button triangle" onClick={() => handleShapeSelect('triangle')}>
            Triangle
          </button>
          <button className="shape-button rectangle" onClick={() => handleShapeSelect('rectangle')}>
            Rectangle
          </button>
        </div>
      </div>
      <div className="ui-wrapper">
       
        </div>

      <canvas
        ref={canvasRef}
        className="board"
        width={1525} // Set your desired width
        height={500} // Set your desired height
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseMove={handleMouseMove}
      />
    </div>
  );
};

export default Board;





