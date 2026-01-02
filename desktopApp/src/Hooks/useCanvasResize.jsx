// import { useState, useEffect, useRef } from 'react';

// export function useCanvasResize(containerRef, boxes, PADDING = 250) {
//   const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });

//   // Initialize canvas to viewport size
//   useEffect(() => {
//     const updateCanvasSize = () => {
//       if (containerRef.current) {
//         setCanvasSize({
//           width: Math.max(containerRef.current.clientWidth, canvasSize.width),
//           height: Math.max(containerRef.current.clientHeight, canvasSize.height)
//         });
//       }
//     };
    
//     updateCanvasSize();
//     window.addEventListener('resize', updateCanvasSize);
//     return () => window.removeEventListener('resize', updateCanvasSize);
//   }, []);

//   // Dynamically expand canvas when content gets close to edges
//   useEffect(() => {
//     if (!containerRef.current || boxes.length === 0) return;

//     let newWidth = canvasSize.width;
//     let newHeight = canvasSize.height;
//     let needsResize = false;

//     boxes.forEach(box => {
//       const boxRight = box.x + box.width;
//       const boxBottom = box.y + box.height;
      
//       if (boxRight + PADDING > newWidth) {
//         newWidth = boxRight + PADDING;
//         needsResize = true;
//       }
      
//       if (boxBottom + PADDING > newHeight) {
//         newHeight = boxBottom + PADDING;
//         needsResize = true;
//       }
//     });

//     if (needsResize) {
//       setCanvasSize({ width: newWidth, height: newHeight });
//     }
//   }, [boxes, canvasSize.width, canvasSize.height, PADDING]);

//   return canvasSize;
// }


import { useState, useEffect } from 'react';

export function useCanvasResize(containerRef, boxes, PADDING = 250) {
  const [canvasSize, setCanvasSize] = useState(() => ({
    width: containerRef.current?.clientWidth ?? 0,
    height: containerRef.current?.clientHeight ?? 0,
  }));

  // Ensure canvas is at least viewport size
  useEffect(() => {
    const updateCanvasSize = () => {
      if (!containerRef.current) return;

      const { clientWidth, clientHeight } = containerRef.current;

      setCanvasSize(prev => ({
        width: Math.max(clientWidth, prev.width),
        height: Math.max(clientHeight, prev.height),
      }));
    };

    updateCanvasSize();
    window.addEventListener('resize', updateCanvasSize);
    return () => window.removeEventListener('resize', updateCanvasSize);
  }, []);

  // Expand canvas when content approaches edges
  useEffect(() => {
    if (!boxes.length) return;

    let newWidth = canvasSize.width;
    let newHeight = canvasSize.height;

    boxes.forEach(box => {
      const boxRight = box.x + box.width;
      const boxBottom = box.y + box.height;

      if (boxRight + PADDING > newWidth) {
        newWidth = boxRight + PADDING;
      }

      if (boxBottom + PADDING > newHeight) {
        newHeight = boxBottom + PADDING;
      }
    });

    if (newWidth !== canvasSize.width || newHeight !== canvasSize.height) {
      setCanvasSize({ width: newWidth, height: newHeight });
    }
  }, [boxes, canvasSize, PADDING]);

  return canvasSize;
}
