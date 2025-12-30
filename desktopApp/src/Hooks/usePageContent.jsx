import { useEffect, useRef, useState } from 'react';

export const usePageContent = (currentPageId, notebooks, notesFolder, loading) => {
  const [textBoxes, setTextBoxes] = useState([]);
  const [selectedBox, setSelectedBox] = useState(null);

  const lastPageRef = useRef(null);

  // 📄 Load page content
  useEffect(() => {
    if (loading || !currentPageId || !notesFolder) return;

    // prevent unnecessary reload
    if (lastPageRef.current === currentPageId) return;
    lastPageRef.current = currentPageId;

    const load = async () => {
      const content = await window.electron.loadPageContent(
        notesFolder,
        currentPageId
      );

      setTextBoxes(content?.textBoxes ?? []);
      setSelectedBox(null);
    };

    load();
  }, [currentPageId, notesFolder, loading]);

  // 💾 Auto-save
  useEffect(() => {
    if (!currentPageId || loading) return;

    window.electron.savePageContent(notesFolder, currentPageId, {
      textBoxes,
    });
  }, [textBoxes]);

  const addTextBox = (x, y) => {
    setTextBoxes(prev => [
      ...prev,
      {
        id: crypto.randomUUID(),
        x,
        y,
        width: 200,
        height: 100,
        text: '',
      },
    ]);
  };

  const handleTextChange = (id, value) => {
    setTextBoxes(prev =>
      prev.map(box =>
        box.id === id ? { ...box, text: value } : box
      )
    );
  };

  return {
    textBoxes,
    setTextBoxes,
    selectedBox,
    setSelectedBox,
    addTextBox,
    handleTextChange,
  };
};
