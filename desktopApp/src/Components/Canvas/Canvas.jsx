import { useRef, useState, useEffect } from 'react'
import './Canvas.css'
import Toolbar from '../Toolbar/Toolbar'
import { useCanvasResize } from '../../Hooks/useCanvasResize'
import { useTextBoxes } from '../../Hooks/useTextBoxes'

const Canvas = ({contextMenu, setContextMenu}) => {
  const [viewMode, setViewMode] = useState('');
  const containerRef = useRef(null);
  const [clipboardBox, setClipboardBox] = useState(null);
  const {
    textBoxes,
    selectedBox,
    setSelectedBox,
    createTextBox,
    updateTextBox,
    deleteTextBox,
    startDragging,
    startResizing,
    copyTextBox,
    pasteTextBox
  } = useTextBoxes();

  const canvasSize = useCanvasResize(containerRef, textBoxes, 250);

  const handleDoubleClick = (e) => {
    e.stopPropagation()
    const container = containerRef.current;
    const rect = container.getBoundingClientRect();
    
    const clickX = e.clientX - rect.left + container.scrollLeft;
    const clickY = e.clientY - rect.top + container.scrollTop;
    
    createTextBox(clickX, clickY);
  };

  const handleDragStart = (e, id) => {
    if (e.target.tagName === 'TEXTAREA' || e.target.classList.contains('resize-handle')) {
      return;
    }
    
    e.stopPropagation();
    startDragging(id, e.clientX, e.clientY);
  };

  const handleResizeStart = (e, id, direction) => {
    e.stopPropagation();
    startResizing(id, direction, e.clientX, e.clientY);
  };

  const handleCanvasContextMenu = (e) => {
    // Only trigger if clicking directly on canvas (not text boxes)
    if (e.target.classList.contains('drawing-canvas-wrapper') || 
        e.target.classList.contains('drawing-canvas')) {
      e.preventDefault();
      e.stopPropagation();

      const container = containerRef.current;
      const rect = container.getBoundingClientRect();

      setContextMenu({
        x: e.clientX - rect.left + container.scrollLeft,
        y: e.clientY - rect.top + container.scrollTop,
        target: 'canvas',
        source: 'canvas'
      });
    }
  };

  const handleKeyDown = (e) => {
    // Don't trigger shortcuts when typing in textarea
    if (e.target.matches('textarea')) return;

    // Delete selected box
    if (e.key === 'Delete' && selectedBox) {
      deleteTextBox(selectedBox);
    }

    // Copy with Ctrl+C
    if ((e.ctrlKey || e.metaKey) && e.key === 'c' && selectedBox) {
      e.preventDefault();
      const copied = copyTextBox(selectedBox);
      setClipboardBox(copied);
    }

    // Paste with Ctrl+V
    if ((e.ctrlKey || e.metaKey) && e.key === 'v' && clipboardBox) {
      e.preventDefault();
      const container = containerRef.current;
      const rect = container.getBoundingClientRect();
      
      // Paste at center of viewport
      const centerX = container.scrollLeft + (rect.width / 2);
      const centerY = container.scrollTop + (rect.height / 2);
      
      pasteTextBox({
        ...clipboardBox,
        id: Date.now(),
        x: centerX - 100, // Center the box
        y: centerY - 50
      });
    }
  };

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedBox, clipboardBox]);

  return (
    <div className="canvas-container">
      <Toolbar onViewChange={setViewMode}/>
      <div
        ref={containerRef}
        className="drawing-canvas-wrapper"
        onDoubleClick={handleDoubleClick}
        onClick={(e) => {
          // Only clear if clicking wrapper directly
          if (e.target.classList.contains('drawing-canvas-wrapper') || 
              e.target.classList.contains('drawing-canvas')) {
            setSelectedBox(null);
            setContextMenu(null);
          }
        }}
        onContextMenu={handleCanvasContextMenu}
      >
        <div 
          className={`drawing-canvas ${viewMode}`}
          style={{
            width: `${canvasSize.width}px`,
            height: `${canvasSize.height}px`,
            position: 'relative'
          }}
        >
          {contextMenu && contextMenu.source === 'canvas' && (
            <div
              className="context-menu"
              style={{
                position: 'absolute',
                left: contextMenu.x,
                top: contextMenu.y,
                zIndex: 1000
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {contextMenu.target === 'canvas' && (
                <>
                  <div
                    className="context-item"
                    onClick={() => {
                      createTextBox(contextMenu.x, contextMenu.y);
                      setContextMenu(null);
                    }}
                  >
                    Add Text Box
                  </div>

                  {clipboardBox && (
                    <div
                      className="context-item"
                      onClick={() => {
                        pasteTextBox({
                          ...clipboardBox,
                          id: Date.now(),
                          x: contextMenu.x,
                          y: contextMenu.y
                        });
                        setContextMenu(null);
                      }}
                    >
                      Paste
                    </div>
                  )}
                </>
              )}

              {contextMenu.target === 'box' && (
                <>
                  <div
                    className="context-item"
                    onClick={() => {
                      const copied = copyTextBox(contextMenu.boxId);
                      setClipboardBox(copied);
                      setContextMenu(null);
                    }}
                  >
                    Copy
                  </div>

                  <div
                    className="context-item danger"
                    onClick={() => {
                      deleteTextBox(contextMenu.boxId);
                      setContextMenu(null);
                    }}
                  >
                    Delete
                  </div>
                </>
              )}
            </div>
          )}

          {textBoxes.map(box => (
            <div
              key={box.id}
              className={`text-box ${selectedBox === box.id ? 'selected' : ''}`}
              style={{
                position: 'absolute',
                left: `${box.x}px`,
                top: `${box.y}px`,
                width: `${box.width}px`,
                height: `${box.height}px`,
              }}
              onClick={(e) => {
                e.stopPropagation();
                setSelectedBox(box.id);
              }}
              onMouseDown={(e) => {
                if (e.target.tagName === 'TEXTAREA') return;
                handleDragStart(e, box.id);
              }}
              onContextMenu={(e) => {
                e.preventDefault();
                e.stopPropagation();

                const container = containerRef.current;
                const rect = container.getBoundingClientRect();

                setContextMenu({
                  x: e.clientX - rect.left + container.scrollLeft,
                  y: e.clientY - rect.top + container.scrollTop,
                  target: 'box',
                  boxId: box.id,
                  source: 'canvas'
                });
              }}
            >
              <textarea
                value={box.text}
                onChange={(e) => updateTextBox(box.id, e.target.value)}
                placeholder="Type here..."
                className="text-box-input"
                style={{
                  width: '100%',
                  height: '100%',
                }}
              />
              
              {selectedBox === box.id && (
                <>
                  <div 
                    className="resize-handle se"
                    onMouseDown={(e) => handleResizeStart(e, box.id, 'se')}
                  />
                  <div 
                    className="resize-handle sw"
                    onMouseDown={(e) => handleResizeStart(e, box.id, 'sw')}
                  />
                  <div 
                    className="resize-handle ne"
                    onMouseDown={(e) => handleResizeStart(e, box.id, 'ne')}
                  />
                  <div 
                    className="resize-handle nw"
                    onMouseDown={(e) => handleResizeStart(e, box.id, 'nw')}
                  />
                </>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Canvas