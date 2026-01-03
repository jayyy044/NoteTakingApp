import { useState, useEffect } from 'react';

export const useTextBoxes = () => {
    const [textBoxes, setTextBoxes] = useState([]);
    const [selectedBox, setSelectedBox] = useState(null);
    const [resizing, setResizing] = useState(null);
    const [dragging, setDragging] = useState(null);

  // Create new text box
    const createTextBox = (x, y) => {
        const newBox = {
        id: Date.now(),
        x,
        y,
        width: 200,
        height: 100,
        text: ''
        };
        
        setTextBoxes(prev => [...prev, newBox]);
        setSelectedBox(newBox.id);
        return newBox.id;
    };

  // Update text content
    const updateTextBox = (id, newText) => {
        setTextBoxes(prev => prev.map(box =>
        box.id === id ? { ...box, text: newText } : box
        ));
    };

  // Delete text box
    const deleteTextBox = (id) => {
        setTextBoxes(prev => prev.filter(box => box.id !== id));
        if (selectedBox === id) setSelectedBox(null);
    };

  // Start dragging
    const startDragging = (id, startX, startY) => {
        setDragging(() => {
            const box = textBoxes.find(b => b.id === id);
            if (!box) return null;

            return {
            id,
            startX,
            startY,
            originalX: box.x,
            originalY: box.y
            };
        });
    };


    const startResizing = (id, direction, startX, startY) => {
        setResizing(() => {
            const box = textBoxes.find(b => b.id === id);
            if (!box) return null;

            return { 
            id,
            direction,
            startX,
            startY,
            originalWidth: box.width,
            originalHeight: box.height,
            originalX: box.x,
            originalY: box.y
            };
        });
    };


    const handleMouseMove = (e) => {
        // Handle resizing
        if (resizing) {
            const deltaX = e.clientX - resizing.startX;
            const deltaY = e.clientY - resizing.startY;

            setTextBoxes(prev => prev.map(box => {
            if (box.id !== resizing.id) return box;

            let newWidth = box.width;
            let newHeight = box.height;
            let newX = box.x;
            let newY = box.y;

            switch (resizing.direction) {
                case 'se':
                newWidth = Math.max(100, resizing.originalWidth + deltaX);
                newHeight = Math.max(50, resizing.originalHeight + deltaY);
                break;
                case 'sw':
                newWidth = Math.max(100, resizing.originalWidth - deltaX);
                newHeight = Math.max(50, resizing.originalHeight + deltaY);
                newX = resizing.originalX + (resizing.originalWidth - newWidth);
                // Prevent going past left boundary
                newX = Math.max(0, newX);
                break;
                case 'ne':
                newWidth = Math.max(100, resizing.originalWidth + deltaX);
                newHeight = Math.max(50, resizing.originalHeight - deltaY);
                newY = resizing.originalY + (resizing.originalHeight - newHeight);
                // Prevent going past top boundary
                newY = Math.max(0, newY);
                break;
                case 'nw':
                newWidth = Math.max(100, resizing.originalWidth - deltaX);
                newHeight = Math.max(50, resizing.originalHeight - deltaY);
                newX = resizing.originalX + (resizing.originalWidth - newWidth);
                newY = resizing.originalY + (resizing.originalHeight - newHeight);
                // Prevent going past boundaries
                newX = Math.max(0, newX);
                newY = Math.max(0, newY);
                break;
            }

            return { ...box, width: newWidth, height: newHeight, x: newX, y: newY };
            }));
            return;
        }

        // Handle dragging
        if (dragging) {
            const deltaX = e.clientX - dragging.startX;
            const deltaY = e.clientY - dragging.startY;

            setTextBoxes(prev => prev.map(box => {
            if (box.id !== dragging.id) return box;
            
            // Calculate new position
            let newX = dragging.originalX + deltaX;
            let newY = dragging.originalY + deltaY;
            
            // Apply boundaries - can't go below 0 on x or y axis
            newX = Math.max(0, newX);
            newY = Math.max(0, newY);
            
            return {
                ...box,
                x: newX,
                y: newY
            };
            }));
        }
    };

    const copyTextBox = (id) => {
      const box = textBoxes.find(b => b.id === id);
      if (!box) return null;

      return {
        ...box,
        id: Date.now(),
        x: box.x + 40,
        y: box.y + 40
      };
    };

    const pasteTextBox = (box) => {
      setTextBoxes(prev => [...prev, box]);
      setSelectedBox(box.id);
    };

  // Handle mouse up
  const handleMouseUp = () => {
    setResizing(null);
    setDragging(null);
  };

  // Add/remove event listeners
  useEffect(() => {
    if (resizing || dragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [resizing, dragging]);

  return {
    textBoxes,
    selectedBox,
    setSelectedBox,
    resizing,
    dragging,
    createTextBox,
    updateTextBox,
    deleteTextBox,
    startDragging,
    startResizing,
    copyTextBox,
    pasteTextBox
  };
};