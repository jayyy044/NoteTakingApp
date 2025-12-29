import { createContext, useContext, useState, useEffect } from 'react';
import { readDir, readTextFile,  mkdir, writeTextFile } from '@tauri-apps/plugin-fs';
import { join } from '@tauri-apps/api/path';
import { toast } from 'react-toastify';

const NotebooksContext = createContext();

export function NotebooksProvider({ notesFolder, children }) {
  const [notebooks, setNotebooks] = useState([]);
  const [currentPageId, setCurrentPageId] = useState(null);
  const [loading, setLoading] = useState(true);

  const getRandomColor = () => {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  };

  // Load notebooks when notesFolder changes
  useEffect(() => {
    if (notesFolder) {
      loadNotebooks();
    }
  }, [notesFolder]);

  async function loadNotebooks() {
    try {
      setLoading(true);
      
      // Read all folders in the notes directory (each folder = notebook)
      const notebookEntries = await readDir(notesFolder);
      
      const notebooksData = [];

      for (const notebookEntry of notebookEntries) {
        if (!notebookEntry.isDirectory) continue; // Skip files

        const notebookPath = await join(notesFolder, notebookEntry.name);
        
        // READ NOTEBOOK COLOR FROM notebook.json
        let notebookColor = '#378C80'; // Default color
        try {
          const notebookJsonPath = await join(notebookPath, 'notebook.json');
          const notebookJsonContent = await readTextFile(notebookJsonPath);
          const notebookData = JSON.parse(notebookJsonContent);
          notebookColor = notebookData.color || notebookColor;
        } catch (error) {
          console.log('No notebook.json found for', notebookEntry.name, '- using default color');
        }
        
        // Read sections in this notebook
        const sectionEntries = await readDir(notebookPath);
        const sections = [];

        for (const sectionEntry of sectionEntries) {
          // Skip files AND skip notebook.json specifically
          if (!sectionEntry.isDirectory) continue;
          // notebook.json is a file, so it's already skipped above

          const sectionPath = await join(notebookPath, sectionEntry.name);
          
          // Read pages in this section
          const pageEntries = await readDir(sectionPath);
          const pages = [];

          for (const pageEntry of pageEntries) {
            if (!pageEntry.isDirectory) continue; // Skip files

            const pagePath = await join(sectionPath, pageEntry.name);
            const pageJsonPath = await join(pagePath, 'page.json');

            try {
              // Read page.json to get metadata
              const pageJsonContent = await readTextFile(pageJsonPath);
              const pageData = JSON.parse(pageJsonContent);

              pages.push({
                id: pageData.id,
                title: pageData.title,
                lastModified: pageData.lastModified,
                folderName: pageEntry.name,
              });
            } catch (error) {
              console.error(`Error reading page ${pageEntry.name}:`, error);
            }
          }

          sections.push({
            id: `section_${sectionEntry.name}`,
            title: sectionEntry.name,
            isExpanded: false,
            pages: pages,
            folderName: sectionEntry.name,
          });
        }

        notebooksData.push({
          id: `notebook_${notebookEntry.name}`,
          title: notebookEntry.name,
          isExpanded: false,
          sections: sections,
          folderName: notebookEntry.name,
          color: notebookColor
        });
      }

      setNotebooks(notebooksData);
      
      // Set first page as current if exists
      if (notebooksData.length > 0 && 
          notebooksData[0].sections.length > 0 && 
          notebooksData[0].sections[0].pages.length > 0) {
        setCurrentPageId(notebooksData[0].sections[0].pages[0].id);
      }

    } catch (error) {
      console.error('Error loading notebooks:', error);
      toast.error('Failed to load notebooks');
    } finally {
      setLoading(false);
    }
  }

  async function addNotebook() {
    try {
      // Generate unique notebook name
      let notebookName = 'Untitled Notebook';
      let counter = 1;
      
      // Check if name exists, increment if needed
      while (notebooks.some(nb => nb.title === notebookName)) {
        notebookName = `Untitled Notebook ${counter}`;
        counter++;
      }

      const notebookColor = getRandomColor();

      // Create folder structure: Notebook/Untitled Section/Untitled Page/
      const notebookPath = await join(notesFolder, notebookName);
      const sectionPath = await join(notebookPath, 'Untitled Section');
      const pagePath = await join(sectionPath, 'Untitled Page');
      
      await mkdir(pagePath, { recursive: true });
      
      // CREATE NOTEBOOK.JSON with color (ADD THIS)
      const notebookJsonPath = await join(notebookPath, 'notebook.json');
      const notebookData = {
        color: notebookColor,
        created: new Date().toISOString()
      };
      await writeTextFile(notebookJsonPath, JSON.stringify(notebookData, null, 2));
      
      // CREATE PAGE.JSON (remove color from here)
      const pageJsonPath = await join(pagePath, 'page.json');
      const initialPage = {
        id: crypto.randomUUID(),
        title: 'Untitled Page',
        created: new Date().toISOString(),
        lastModified: new Date().toISOString(),
        text: '',
        images: [],
        attachments: [],
        hasDrawing: false  // Removed color property
      };
      
      await writeTextFile(pageJsonPath, JSON.stringify(initialPage, null, 2));
      
      // Reload notebooks to show the new one
      await loadNotebooks();
      
      toast.success(`Created ${notebookName}`);
    } catch (error) {
      console.error('Error adding notebook:', error);
      toast.error('Failed to create notebook');
    }
  }

  async function addSection(notebookId) {
    try {
      const notebook = notebooks.find(nb => nb.id === notebookId);
      if (!notebook) {
        toast.error('Notebook not found');
        return;
      }

      let sectionName = 'Untitled Section';
      let counter = 1;
      
      while (notebook.sections.some(sec => sec.title === sectionName)) {
        sectionName = `Untitled Section ${counter}`;
        counter++;
      }

      const notebookPath = await join(notesFolder, notebook.folderName);
      const sectionPath = await join(notebookPath, sectionName);
      const pagePath = await join(sectionPath, 'Untitled Page');
      
      await mkdir(pagePath, { recursive: true });
      
      const pageJsonPath = await join(pagePath, 'page.json');
      const newPage = {
        id: crypto.randomUUID(),
        title: 'Untitled Page',
        created: new Date().toISOString(),
        lastModified: new Date().toISOString(),
        text: '',
        images: [],
        attachments: [],
        hasDrawing: false
      };
      
      await writeTextFile(pageJsonPath, JSON.stringify(newPage, null, 2));
      
      // Update state directly instead of reloading
      const newSection = {
        id: `section_${sectionName}`,
        title: sectionName,
        isExpanded: false,
        pages: [
          {
            id: newPage.id,
            title: newPage.title,
            lastModified: newPage.lastModified,
            folderName: 'Untitled Page',
          }
        ],
        folderName: sectionName,
      };

      setNotebooks(notebooks.map(nb =>
        nb.id === notebookId
          ? { ...nb, sections: [...nb.sections, newSection] }
          : nb
      ));
      
      toast.success(`Created ${sectionName}`);
    } catch (error) {
      console.error('Error adding section:', error);
      toast.error('Failed to create section');
    }
  }

  async function addPage(notebookId, sectionId) {
    try {
      const notebook = notebooks.find(nb => nb.id === notebookId);
      if (!notebook) {
        toast.error('Notebook not found');
        return;
      }

      const section = notebook.sections.find(sec => sec.id === sectionId);
      if (!section) {
        toast.error('Section not found');
        return;
      }

      let pageName = 'Untitled Page';
      let counter = 1;
      
      while (section.pages.some(page => page.title === pageName)) {
        pageName = `Untitled Page ${counter}`;
        counter++;
      }

      const notebookPath = await join(notesFolder, notebook.folderName);
      const sectionPath = await join(notebookPath, section.folderName);
      const pagePath = await join(sectionPath, pageName);
      
      await mkdir(pagePath, { recursive: true });
      
      const pageJsonPath = await join(pagePath, 'page.json');
      const newPage = {
        id: crypto.randomUUID(),
        title: pageName,
        created: new Date().toISOString(),
        lastModified: new Date().toISOString(),
        text: '',
        images: [],
        attachments: [],
        hasDrawing: false
      };
      
      await writeTextFile(pageJsonPath, JSON.stringify(newPage, null, 2));
      
      // Update state directly instead of reloading
      const newPageData = {
        id: newPage.id,
        title: newPage.title,
        lastModified: newPage.lastModified,
        folderName: pageName,
      };

      setNotebooks(notebooks.map(nb =>
        nb.id === notebookId
          ? {
              ...nb,
              sections: nb.sections.map(sec =>
                sec.id === sectionId
                  ? { ...sec, pages: [...sec.pages, newPageData] }
                  : sec
              )
            }
          : nb
      ));
      
      setCurrentPageId(newPage.id);
      
      toast.success(`Created ${pageName}`);
    } catch (error) {
      console.error('Error adding page:', error);
      toast.error('Failed to create page');
    }
  }

  function toggleNotebook(notebookId) {
    setNotebooks(notebooks.map(notebook => 
      notebook.id === notebookId 
        ? { ...notebook, isExpanded: !notebook.isExpanded }
        : notebook
    ));
  }

  function toggleSection(notebookId, sectionId) {
    setNotebooks(notebooks.map(notebook => 
      notebook.id === notebookId
        ? {
            ...notebook,
            sections: notebook.sections.map(section =>
              section.id === sectionId
                ? { ...section, isExpanded: !section.isExpanded }
                : section
            )
          }
        : notebook
    ));
  }

  const value = {
    notebooks,
    currentPageId,
    setCurrentPageId,
    toggleNotebook,
    toggleSection,
    loading,
    addNotebook,
    addSection,
    addPage,
    reloadNotebooks: loadNotebooks,
  };

  return (
    <NotebooksContext.Provider value={value}>
      {children}
    </NotebooksContext.Provider>
  );
}

export function useNotebooks() {
  const context = useContext(NotebooksContext);
  if (!context) {
    throw new Error('useNotebooks must be used within NotebooksProvider');
  }
  return context;
}