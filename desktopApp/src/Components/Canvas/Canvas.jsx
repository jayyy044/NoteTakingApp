// import React, { useRef, useEffect, useState } from 'react';
// import './Canvas.css';
// import Toolbar from '../Toolbar/Toolbar.jsx';

// const Canvas = () => {
//   const containerRef = useRef(null);
//   const canvasRef = useRef(null);
//   const [textBoxes, setTextBoxes] = useState([]);
//   const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });
//   const [selectedBox, setSelectedBox] = useState(null);
//   const [resizing, setResizing] = useState(null);
//   const [toolSelect, setToolSelect] = useState(null);
//   const [isScrolling, setIsScrolling] = useState(false);
//   const scrollTimeout = useRef(null);
//   const PADDING = 250;

//   // Initialize canvas to container size
//   useEffect(() => {
//     const updateCanvasSize = () => {
//       if (containerRef.current) {
//         const container = containerRef.current;
//         setCanvasSize({
//           width: container.clientWidth,
//           height: container.clientHeight
//         });
//       }
//     };
    
//     updateCanvasSize();
//     window.addEventListener('resize', updateCanvasSize);
//     return () => window.removeEventListener('resize', updateCanvasSize);
//   }, []);

//   // Dynamically expand canvas based on content bounds
//   useEffect(() => {
//     if (!containerRef.current) return;

//     const container = containerRef.current;
//     let needsResize = false;
//     let newWidth = container.clientWidth;
//     let newHeight = container.clientHeight;

//     if (textBoxes.length > 0) {
//       textBoxes.forEach(box => {
//         const boxRight = box.x + box.width;
//         const boxBottom = box.y + box.height;
        
//         if (boxRight + PADDING > newWidth) {
//           newWidth = boxRight + PADDING;
//           needsResize = true;
//         }
        
//         if (boxBottom + PADDING > newHeight) {
//           newHeight = boxBottom + PADDING;
//           needsResize = true;
//         }
//       });
//     }

//     if (needsResize) {
//       setCanvasSize({ width: newWidth, height: newHeight });
//       handleScroll();
//     }
//   }, [textBoxes]);

//   // Draw canvas
//   useEffect(() => {
//     const canvas = canvasRef.current;
//     if (!canvas || canvasSize.width === 0 || canvasSize.height === 0) return;
    
//     const ctx = canvas.getContext('2d');
    
//     canvas.width = canvasSize.width;
//     canvas.height = canvasSize.height;
    
//     ctx.clearRect(0, 0, canvas.width, canvas.height);
    
//     drawGrid(ctx, canvas.width, canvas.height);
//   }, [canvasSize]);

//   const drawGrid = (ctx, width, height) => {
//     const gridSize = 50;
//     ctx.strokeStyle = '#2a2a2a';
//     ctx.lineWidth = 1;
    
//     for (let x = 0; x < width; x += gridSize) {
//       ctx.beginPath();
//       ctx.moveTo(x, 0);
//       ctx.lineTo(x, height);
//       ctx.stroke();
//     }
    
//     for (let y = 0; y < height; y += gridSize) {
//       ctx.beginPath();
//       ctx.moveTo(0, y);
//       ctx.lineTo(width, y);
//       ctx.stroke();
//     }
//   };

//   const handleCanvasClick = (e) => {
//     if (toolSelect === 'Text') {
//       const canvas = canvasRef.current;
//       const rect = canvas.getBoundingClientRect();
      
//       const x = e.clientX - rect.left + containerRef.current.scrollLeft;
//       const y = e.clientY - rect.top + containerRef.current.scrollTop;
      
//       const newBox = {
//         id: Date.now(),
//         x: x,
//         y: y,
//         width: 200,
//         height: 100,
//         text: ''
//       };
      
//       setTextBoxes(prev => [...prev, newBox]);
//       setSelectedBox(newBox.id);
      
//       // Switch back to select tool after creating text box
//       setToolSelect(null);
//     }
//   };

//   const getCursor = () => {
//     if (toolSelect === 'Text') return 'crosshair';
//     return 'default';
//   };

//   // Handle double-click to create text box
//   const handleDoubleClick = (e) => {
//     const canvas = canvasRef.current;
//     const rect = canvas.getBoundingClientRect();
    
//     const x = e.clientX - rect.left + containerRef.current.scrollLeft;
//     const y = e.clientY - rect.top + containerRef.current.scrollTop;
    
//     const newBox = {
//       id: Date.now(),
//       x: x,
//       y: y,
//       width: 200,
//       height: 100,
//       text: ''
//     };
    
//     setTextBoxes(prev => [...prev, newBox]);
//     setSelectedBox(newBox.id);
//   };

//   const handleTextChange = (id, newText) => {
//     setTextBoxes(prev => prev.map(box =>
//       box.id === id ? { ...box, text: newText } : box
//     ));
//   };

//   const handleResizeStart = (e, id, direction) => {
//     e.stopPropagation();
    
//     // Find the box being resized
//     const box = textBoxes.find(b => b.id === id);
//     if (!box) return;
    
//     // Store initial state
//     setResizing({ 
//       id, 
//       direction, 
//       startX: e.clientX, 
//       startY: e.clientY,
//       initialBox: { ...box } // Store initial dimensions and position
//     });
//   };

//   const handleMouseMove = (e) => {
//     if (!resizing) return;

//     const deltaX = e.clientX - resizing.startX;
//     const deltaY = e.clientY - resizing.startY;

//     setTextBoxes(prev => prev.map(box => {
//       if (box.id !== resizing.id) return box;

//       const { initialBox } = resizing;
//       let newWidth = initialBox.width;
//       let newHeight = initialBox.height;
//       let newX = initialBox.x;
//       let newY = initialBox.y;

//       switch (resizing.direction) {
//         case 'se': // Bottom-right
//           newWidth = Math.max(100, initialBox.width + deltaX);
//           newHeight = Math.max(50, initialBox.height + deltaY);
//           break;
//         case 'sw': // Bottom-left
//           newWidth = Math.max(100, initialBox.width - deltaX);
//           newHeight = Math.max(50, initialBox.height + deltaY);
//           if (newWidth > 100) {
//             newX = initialBox.x + deltaX;
//           }
//           break;
//         case 'ne': // Top-right
//           newWidth = Math.max(100, initialBox.width + deltaX);
//           newHeight = Math.max(50, initialBox.height - deltaY);
//           if (newHeight > 50) {
//             newY = initialBox.y + deltaY;
//           }
//           break;
//         case 'nw': // Top-left
//           newWidth = Math.max(100, initialBox.width - deltaX);
//           newHeight = Math.max(50, initialBox.height - deltaY);
//           if (newWidth > 100) {
//             newX = initialBox.x + deltaX;
//           }
//           if (newHeight > 50) {
//             newY = initialBox.y + deltaY;
//           }
//           break;
//       }

//       return { ...box, width: newWidth, height: newHeight, x: newX, y: newY };
//     }));
//   };

//   const handleMouseUp = () => {
//     setResizing(null);
//   };

//   useEffect(() => {
//     if (resizing) {
//       window.addEventListener('mousemove', handleMouseMove);
//       window.addEventListener('mouseup', handleMouseUp);
//       return () => {
//         window.removeEventListener('mousemove', handleMouseMove);
//         window.removeEventListener('mouseup', handleMouseUp);
//       };
//     }
//   }, [resizing, textBoxes]);


//   const handleScroll = () => {
//     setIsScrolling(true);

//     if (scrollTimeout.current) {
//       clearTimeout(scrollTimeout.current);
//     }

//     scrollTimeout.current = setTimeout(() => {
//       setIsScrolling(false);
//     }, 1000);
//   };




//   return (
//     <div className="canvas-wrapper">
//       <Toolbar currentTool={toolSelect} onToolChange={setToolSelect} />
//       <div 
//         ref={containerRef}
//         onScroll={handleScroll}
//         className={`canvas-container ${isScrolling ? 'scrolling' : ''}`}
//         onClick={() => setSelectedBox(null)}
//       >
//         <canvas 
//           ref={canvasRef}
//           className="drawing-canvas"
//           onDoubleClick={handleDoubleClick}
//           onClick={handleCanvasClick}  
//           style={{
//             width: `${canvasSize.width}px`,
//             height: `${canvasSize.height}px`,
//             cursor: getCursor()  
//           }}
//         />
        
//         {textBoxes.map(box => (
//           <div
//             key={box.id}
//             className={`text-box ${selectedBox === box.id ? 'selected' : ''}`}
//             style={{
//               position: 'absolute',
//               left: `${box.x}px`,
//               top: `${box.y}px`,
//               width: `${box.width}px`,
//               height: `${box.height}px`,
//               pointerEvents: toolSelect === 'Text' ? 'none' : 'auto',  
//             }}
//             onClick={(e) => {
//               e.stopPropagation();
//               setSelectedBox(box.id);
//             }}
//           >
//             <textarea
//               value={box.text}
//               onChange={(e) => handleTextChange(box.id, e.target.value)}
//               placeholder="Type here..."
//               className="text-box-input"
//               style={{
//                 width: '100%',
//                 height: '100%',
//               }}
//             />
            
//             {selectedBox === box.id && toolSelect !== 'Text' && (  
//               <>
//                 <div 
//                   className="resize-handle se"
//                   onMouseDown={(e) => handleResizeStart(e, box.id, 'se')}
//                 />
//                 <div 
//                   className="resize-handle sw"
//                   onMouseDown={(e) => handleResizeStart(e, box.id, 'sw')}
//                 />
//                 <div 
//                   className="resize-handle ne"
//                   onMouseDown={(e) => handleResizeStart(e, box.id, 'ne')}
//                 />
//                 <div 
//                   className="resize-handle nw"
//                   onMouseDown={(e) => handleResizeStart(e, box.id, 'nw')}
//                 />
//               </>
//             )}
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// };

// export default Canvas;

import React, { useRef, useEffect, useState } from 'react';
import './Canvas.css';
import Toolbar from '../Toolbar/Toolbar.jsx';
import { useNotebooks } from '../Context/NotebookContext.jsx';
import { usePageContent } from '../../Hooks/usePageContent.jsx';

const Canvas = () => {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });
  const [resizing, setResizing] = useState(null);
  const [toolSelect, setToolSelect] = useState(null);
  const [isScrolling, setIsScrolling] = useState(false);
  const scrollTimeout = useRef(null);
  
  // Get data from contexts and hook
  const { currentPageId, notebooks, notesFolder, loading } = useNotebooks();

  const {
    textBoxes,
    setTextBoxes,
    selectedBox,
    setSelectedBox,
    addTextBox,
    handleTextChange,
  } = usePageContent(currentPageId, notebooks, notesFolder, loading);

  const PADDING = 250;

  // Initialize canvas to container size
  useEffect(() => {
    const updateCanvasSize = () => {
      if (containerRef.current) {
        const container = containerRef.current;
        setCanvasSize({
          width: container.clientWidth,
          height: container.clientHeight
        });
      }
    };
    
    updateCanvasSize();
    window.addEventListener('resize', updateCanvasSize);
    return () => window.removeEventListener('resize', updateCanvasSize);
  }, []);

  // Dynamically expand canvas based on content bounds
  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    let needsResize = false;
    let newWidth = container.clientWidth;
    let newHeight = container.clientHeight;

    if (textBoxes.length > 0) {
      textBoxes.forEach(box => {
        const boxRight = box.x + box.width;
        const boxBottom = box.y + box.height;
        
        if (boxRight + PADDING > newWidth) {
          newWidth = boxRight + PADDING;
          needsResize = true;
        }
        
        if (boxBottom + PADDING > newHeight) {
          newHeight = boxBottom + PADDING;
          needsResize = true;
        }
      });
    }

    if (needsResize) {
      setCanvasSize({ width: newWidth, height: newHeight });
      handleScroll();
    }
  }, [textBoxes]);

  // Draw canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || canvasSize.width === 0 || canvasSize.height === 0) return;
    
    const ctx = canvas.getContext('2d');
    canvas.width = canvasSize.width;
    canvas.height = canvasSize.height;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawGrid(ctx, canvas.width, canvas.height);
  }, [canvasSize]);

  const drawGrid = (ctx, width, height) => {
    const gridSize = 50;
    ctx.strokeStyle = '#2a2a2a';
    ctx.lineWidth = 1;
    
    for (let x = 0; x < width; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    
    for (let y = 0; y < height; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }
  };

  const handleCanvasClick = (e) => {
    if (toolSelect === 'Text') {
      const canvas = canvasRef.current;
      const rect = canvas.getBoundingClientRect();
      
      const x = e.clientX - rect.left + containerRef.current.scrollLeft;
      const y = e.clientY - rect.top + containerRef.current.scrollTop;
      
      addTextBox(x, y);
      setToolSelect(null);
    }
  };

  const getCursor = () => {
    if (toolSelect === 'Text') return 'crosshair';
    return 'default';
  };

  const handleDoubleClick = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    
    const x = e.clientX - rect.left + containerRef.current.scrollLeft;
    const y = e.clientY - rect.top + containerRef.current.scrollTop;
    
    addTextBox(x, y);
  };

  const handleResizeStart = (e, id, direction) => {
    e.stopPropagation();
    const box = textBoxes.find(b => b.id === id);
    if (!box) return;
    
    setResizing({ 
      id, 
      direction, 
      startX: e.clientX, 
      startY: e.clientY,
      initialBox: { ...box }
    });
  };

  const handleMouseMove = (e) => {
    if (!resizing) return;

    const deltaX = e.clientX - resizing.startX;
    const deltaY = e.clientY - resizing.startY;

    setTextBoxes(prev => prev.map(box => {
      if (box.id !== resizing.id) return box;

      const { initialBox } = resizing;
      let newWidth = initialBox.width;
      let newHeight = initialBox.height;
      let newX = initialBox.x;
      let newY = initialBox.y;

      switch (resizing.direction) {
        case 'se':
          newWidth = Math.max(100, initialBox.width + deltaX);
          newHeight = Math.max(50, initialBox.height + deltaY);
          break;
        case 'sw':
          newWidth = Math.max(100, initialBox.width - deltaX);
          newHeight = Math.max(50, initialBox.height + deltaY);
          if (newWidth > 100) {
            newX = initialBox.x + deltaX;
          }
          break;
        case 'ne':
          newWidth = Math.max(100, initialBox.width + deltaX);
          newHeight = Math.max(50, initialBox.height - deltaY);
          if (newHeight > 50) {
            newY = initialBox.y + deltaY;
          }
          break;
        case 'nw':
          newWidth = Math.max(100, initialBox.width - deltaX);
          newHeight = Math.max(50, initialBox.height - deltaY);
          if (newWidth > 100) {
            newX = initialBox.x + deltaX;
          }
          if (newHeight > 50) {
            newY = initialBox.y + deltaY;
          }
          break;
      }

      return { ...box, width: newWidth, height: newHeight, x: newX, y: newY };
    }));
  };

  const handleMouseUp = () => {
    setResizing(null);
  };

  useEffect(() => {
    if (resizing) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [resizing, textBoxes]);

  const handleScroll = () => {
    setIsScrolling(true);
    if (scrollTimeout.current) {
      clearTimeout(scrollTimeout.current);
    }
    scrollTimeout.current = setTimeout(() => {
      setIsScrolling(false);
    }, 1000);
  };

  return (
    <div className="canvas-wrapper">
      <Toolbar currentTool={toolSelect} onToolChange={setToolSelect} />
      <div 
        ref={containerRef}
        onScroll={handleScroll}
        className={`canvas-container ${isScrolling ? 'scrolling' : ''}`}
        onClick={() => setSelectedBox(null)}
        style={{ pointerEvents: loading ? 'none' : 'auto' }}
      >
        <canvas 
          ref={canvasRef}
          className="drawing-canvas"
          onDoubleClick={handleDoubleClick}
          onClick={handleCanvasClick}
          style={{
            width: `${canvasSize.width}px`,
            height: `${canvasSize.height}px`,
            cursor: getCursor()
          }}
        />
        
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
              pointerEvents: toolSelect === 'Text' ? 'none' : 'auto',
            }}
            onClick={(e) => {
              e.stopPropagation();
              setSelectedBox(box.id);
            }}
          >
            <textarea
              value={box.text}
              onChange={(e) => handleTextChange(box.id, e.target.value)}
              placeholder="Type here..."
              className="text-box-input"
              style={{
                width: '100%',
                height: '100%',
              }}
            />
            
            {selectedBox === box.id && toolSelect !== 'Text' && (
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
  );
};

export default Canvas;

// import React from 'react'

// const Canvas = () => {
//   return (
//     <div >Canvas</div>
//   )
// }

// export default Canvas