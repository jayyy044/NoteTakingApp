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

// import React, { useRef, useEffect, useState } from 'react';
// import './Canvas.css';
// import Toolbar from '../Toolbar/Toolbar.jsx';
// import { useNotebooks } from '../Context/NotebookContext.jsx';
// import { usePageContent } from '../../Hooks/usePageContent.jsx';

// const Canvas = () => {
//   const containerRef = useRef(null);
//   const canvasRef = useRef(null);
//   const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });
//   const [resizing, setResizing] = useState(null);
//   const [toolSelect, setToolSelect] = useState(null);
//   const [isScrolling, setIsScrolling] = useState(false);
//   const scrollTimeout = useRef(null);
  
//   // Get data from contexts and hook
//   const { currentPageId, notebooks, notesFolder, loading } = useNotebooks();

//   const {
//     textBoxes,
//     setTextBoxes,
//     selectedBox,
//     setSelectedBox,
//     addTextBox,
//     handleTextChange,
//   } = usePageContent(currentPageId, notebooks, notesFolder, loading);

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
      
//       addTextBox(x, y);
//       setToolSelect(null);
//     }
//   };

//   const getCursor = () => {
//     if (toolSelect === 'Text') return 'crosshair';
//     return 'default';
//   };

//   const handleDoubleClick = (e) => {
//     const canvas = canvasRef.current;
//     const rect = canvas.getBoundingClientRect();
    
//     const x = e.clientX - rect.left + containerRef.current.scrollLeft;
//     const y = e.clientY - rect.top + containerRef.current.scrollTop;
    
//     addTextBox(x, y);
//   };

//   const handleResizeStart = (e, id, direction) => {
//     e.stopPropagation();
//     const box = textBoxes.find(b => b.id === id);
//     if (!box) return;
    
//     setResizing({ 
//       id, 
//       direction, 
//       startX: e.clientX, 
//       startY: e.clientY,
//       initialBox: { ...box }
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
//         case 'se':
//           newWidth = Math.max(100, initialBox.width + deltaX);
//           newHeight = Math.max(50, initialBox.height + deltaY);
//           break;
//         case 'sw':
//           newWidth = Math.max(100, initialBox.width - deltaX);
//           newHeight = Math.max(50, initialBox.height + deltaY);
//           if (newWidth > 100) {
//             newX = initialBox.x + deltaX;
//           }
//           break;
//         case 'ne':
//           newWidth = Math.max(100, initialBox.width + deltaX);
//           newHeight = Math.max(50, initialBox.height - deltaY);
//           if (newHeight > 50) {
//             newY = initialBox.y + deltaY;
//           }
//           break;
//         case 'nw':
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
//         style={{ pointerEvents: loading ? 'none' : 'auto' }}
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

// import { useState, useRef } from 'react'
// import './Canvas.css'
// import Toolbar from '../Toolbar/Toolbar'
// import { useCanvasResize } from '../../Hooks/useCanvasResize'

// const Canvas = () => {
//   const [viewMode, setViewMode] = useState('');
//   const containerRef = useRef(null);
//   const [boxes, setBoxes] = useState([]);
//   const canvasSize = useCanvasResize(containerRef, boxes, 250)

//   const handleDoubleClick = (e) => {
//     const container = containerRef.current;
//     const rect = container.getBoundingClientRect();
    
//     const clickX = e.clientX - rect.left + container.scrollLeft;
//     const clickY = e.clientY - rect.top + container.scrollTop;
    
//     const x = Math.max(0, clickX - 50);
//     const y = Math.max(0, clickY - 50);
    
//     const newBox = {
//       id: Date.now(),
//       x: x,
//       y: y,
//       width: 100,
//       height: 100,
//       color: `hsl(${Math.random() * 360}, 70%, 60%)`
//     };
    
//     setBoxes(prev => [...prev, newBox]);
//   };

//   return (
//     <div className="canvas-container">
//       <Toolbar onViewChange={setViewMode}/>
//       <div
//         ref={containerRef}
//         className="drawing-canvas-wrapper"
//         onDoubleClick={handleDoubleClick}
//       >
//         <div 
//           className={`drawing-canvas ${viewMode}`}
//           style={{
//             width: `${canvasSize.width}px`,
//             height: `${canvasSize.height}px`,
//             position: 'relative'
//           }}
//         >
//           {boxes.map(box => (
//             <div
//               key={box.id}
//               style={{
//                 position: 'absolute',
//                 left: `${box.x}px`,
//                 top: `${box.y}px`,
//                 width: `${box.width}px`,
//                 height: `${box.height}px`,
//                 backgroundColor: box.color,
//                 border: '2px solid rgba(255, 255, 255, 0.3)',
//                 borderRadius: '8px',
//                 boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)'
//               }}
//             />
//           ))}
//         </div>
//       </div>
//     </div>
//   )
// }

// export default Canvas


// import { useState, useRef, useEffect } from 'react'
// import './Canvas.css'
// import Toolbar from '../Toolbar/Toolbar'
// import { useCanvasResize } from '../../Hooks/useCanvasResize'

// const Canvas = () => {
//   const [viewMode, setViewMode] = useState('');
//   const containerRef = useRef(null);
//   const [textBoxes, setTextBoxes] = useState([]);
//   const [selectedBox, setSelectedBox] = useState(null);
//   const [resizing, setResizing] = useState(null);
//   const [dragging, setDragging] = useState(null);
//   const canvasSize = useCanvasResize(containerRef, textBoxes, 250);

//   const handleDoubleClick = (e) => {
//     e.preventDefault();
//     e.stopPropagation();
//     const container = containerRef.current;
//     const rect = container.getBoundingClientRect();
    
//     const clickX = e.clientX - rect.left + container.scrollLeft;
//     const clickY = e.clientY - rect.top + container.scrollTop;
    
//     const newBox = {
//       id: Date.now(),
//       x: clickX,
//       y: clickY,
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

//   // Drag handlers
//   const handleDragStart = (e, id) => {
//     // Don't start drag if clicking on textarea or resize handle
//     if (e.target.tagName === 'TEXTAREA' || e.target.classList.contains('resize-handle')) {
//       return;
//     }
    
//     e.stopPropagation();
//     const box = textBoxes.find(b => b.id === id);
//     if (!box) return;

//     setDragging({
//       id,
//       startX: e.clientX,
//       startY: e.clientY,
//       originalX: box.x,
//       originalY: box.y
//     });
//   };

//   const handleMouseMove = (e) => {
//     // Handle resizing
//     if (resizing) {
//       const deltaX = e.clientX - resizing.startX;
//       const deltaY = e.clientY - resizing.startY;

//       setTextBoxes(prev => prev.map(box => {
//         if (box.id !== resizing.id) return box;

//         let newWidth = box.width;
//         let newHeight = box.height;
//         let newX = box.x;
//         let newY = box.y;

//         switch (resizing.direction) {
//           case 'se':
//             newWidth = Math.max(100, box.width + deltaX);
//             newHeight = Math.max(50, box.height + deltaY);
//             break;
//           case 'sw':
//             newWidth = Math.max(100, box.width - deltaX);
//             newHeight = Math.max(50, box.height + deltaY);
//             newX = box.x + deltaX;
//             break;
//           case 'ne':
//             newWidth = Math.max(100, box.width + deltaX);
//             newHeight = Math.max(50, box.height - deltaY);
//             newY = box.y + deltaY;
//             break;
//           case 'nw':
//             newWidth = Math.max(100, box.width - deltaX);
//             newHeight = Math.max(50, box.height - deltaY);
//             newX = box.x + deltaX;
//             newY = box.y + deltaY;
//             break;
//         }

//         return { ...box, width: newWidth, height: newHeight, x: newX, y: newY };
//       }));

//       setResizing({ ...resizing, startX: e.clientX, startY: e.clientY });
//       return;
//     }

//     // Handle dragging
//     if (dragging) {
//       const deltaX = e.clientX - dragging.startX;
//       const deltaY = e.clientY - dragging.startY;

//       setTextBoxes(prev => prev.map(box => {
//         if (box.id !== dragging.id) return box;
//         return {
//           ...box,
//           x: dragging.originalX + deltaX,
//           y: dragging.originalY + deltaY
//         };
//       }));
//     }
//   };

//   const handleMouseUp = () => {
//     setResizing(null);
//     setDragging(null);
//   };

//   const handleResizeStart = (e, id, direction) => {
//     e.stopPropagation();
//     const box = textBoxes.find(b => b.id === id);
//     setResizing({ 
//       id, 
//       direction, 
//       startX: e.clientX, 
//       startY: e.clientY,
//       originalWidth: box.width,
//       originalHeight: box.height,
//       originalX: box.x,
//       originalY: box.y
//     });
//   };

//   // Add event listeners for drag and resize
//   useEffect(() => {
//     if (resizing || dragging) {
//       window.addEventListener('mousemove', handleMouseMove);
//       window.addEventListener('mouseup', handleMouseUp);
//       return () => {
//         window.removeEventListener('mousemove', handleMouseMove);
//         window.removeEventListener('mouseup', handleMouseUp);
//       };
//     }
//   }, [resizing, dragging, textBoxes]);

//   return (
//     <div className="canvas-container">
//       <Toolbar onViewChange={setViewMode}/>
//       <div
//         ref={containerRef}
//         className="drawing-canvas-wrapper"
//         onDoubleClick={handleDoubleClick}
//         onClick={() => setSelectedBox(null)}
//       >
//         <div 
//           className={`drawing-canvas ${viewMode}`}
//           style={{
//             width: `${canvasSize.width}px`,
//             height: `${canvasSize.height}px`,
//             position: 'relative'
//           }}
//         >
//           {textBoxes.map(box => (
//             <div
//               key={box.id}
//               className={`text-box ${selectedBox === box.id ? 'selected' : ''}`}
//               style={{
//                 position: 'absolute',
//                 left: `${box.x}px`,
//                 top: `${box.y}px`,
//                 width: `${box.width}px`,
//                 height: `${box.height}px`,
//               }}
//               onClick={(e) => {
//                 e.stopPropagation();
//                 setSelectedBox(box.id);
//               }}
//               onMouseDown={(e) => handleDragStart(e, box.id)}
//             >
//               <textarea
//                 value={box.text}
//                 onChange={(e) => handleTextChange(box.id, e.target.value)}
//                 placeholder="Type here..."
//                 className="text-box-input"
//                 style={{
//                   width: '100%',
//                   height: '100%',
//                 }}
//               />
              
//               {selectedBox === box.id && (
//                 <>
//                   <div 
//                     className="resize-handle se"
//                     onMouseDown={(e) => handleResizeStart(e, box.id, 'se')}
//                   />
//                   <div 
//                     className="resize-handle sw"
//                     onMouseDown={(e) => handleResizeStart(e, box.id, 'sw')}
//                   />
//                   <div 
//                     className="resize-handle ne"
//                     onMouseDown={(e) => handleResizeStart(e, box.id, 'ne')}
//                   />
//                   <div 
//                     className="resize-handle nw"
//                     onMouseDown={(e) => handleResizeStart(e, box.id, 'nw')}
//                   />
//                 </>
//               )}
//             </div>
//           ))}
//         </div>
//       </div>
//     </div>
//   )
// }

// export default Canvas


import { useRef, useState, useEffect } from 'react'
import './Canvas.css'
import Toolbar from '../Toolbar/Toolbar'
import { useCanvasResize } from '../../Hooks/useCanvasResize'
import { useTextBoxes } from '../../Hooks/useTextBoxes'

const Canvas = () => {
  const [viewMode, setViewMode] = useState('');
  const containerRef = useRef(null);
  const [contextMenu, setContextMenu] = useState(null);
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
    e.preventDefault();

    const container = containerRef.current;
    const rect = container.getBoundingClientRect();

    setContextMenu({
      x: e.clientX - rect.left + container.scrollLeft,
      y: e.clientY - rect.top + container.scrollTop,
      target: 'canvas',
    });
  };

  // Handle Delete key
  const handleKeyDown = (e) => {
    if (e.key === 'Delete' && selectedBox && !e.target.matches('textarea')) {
      deleteTextBox(selectedBox);
    }
  };

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedBox]);

  return (
    <div className="canvas-container">
      <Toolbar onViewChange={setViewMode}/>
      <div
        ref={containerRef}
        className="drawing-canvas-wrapper"
        onDoubleClick={handleDoubleClick}
        onClick={() => {
          setSelectedBox(null)
          setContextMenu(null)
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
          {contextMenu && (
            <div
              className="context-menu"
              style={{
                position: 'absolute',
                left: contextMenu.x,
                top: contextMenu.y,
                zIndex: 1000
              }}
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
                  boxId: box.id
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