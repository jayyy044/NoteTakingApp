// import React, { createContext, useContext, useEffect, useState } from 'react';

// const NotebooksContext = createContext();

// export const NotebooksProvider = ({ children }) => {
//   const [notebooks, setNotebooks] = useState([]);
//   const [currentPageId, setCurrentPageId] = useState(null);
//   const [loading, setLoading] = useState(true);

//   // 🔑 central source of truth
//   const notesFolder = window.electron?.notesFolder;

//   useEffect(() => {
//     loadNotebooks();
//   }, []);

//   const loadNotebooks = async () => {
//     setLoading(true);

//     const data = await window.electron.loadNotebooksFromDisk();
//     setNotebooks(data);

//     // ✅ only auto-select ONCE
//     if (
//       !currentPageId &&
//       data.length > 0 &&
//       data[0].sections?.length > 0 &&
//       data[0].sections[0].pages?.length > 0
//     ) {
//       setCurrentPageId(data[0].sections[0].pages[0].id);
//     }

//     setLoading(false);
//   };

//   const toggleNotebook = (id) => {
//     setNotebooks(prev =>
//       prev.map(nb =>
//         nb.id === id ? { ...nb, isExpanded: !nb.isExpanded } : nb
//       )
//     );
//   };

//   const toggleSection = (notebookId, sectionId) => {
//     setNotebooks(prev =>
//       prev.map(nb =>
//         nb.id === notebookId
//           ? {
//               ...nb,
//               sections: nb.sections.map(sec =>
//                 sec.id === sectionId
//                   ? { ...sec, isExpanded: !sec.isExpanded }
//                   : sec
//               )
//             }
//           : nb
//       )
//     );
//   };

//   const addNotebook = async (title, color) => {
//     const pageId = crypto.randomUUID();

//     await window.electron.createNotebookOnDisk(title);

//     setNotebooks(prev => [
//       ...prev,
//       {
//         id: crypto.randomUUID(),
//         title,
//         color,
//         folderName: title,
//         isExpanded: true,
//         sections: [
//           {
//             id: crypto.randomUUID(),
//             title: 'Untitled Section',
//             folderName: 'Untitled Section',
//             isExpanded: true,
//             pages: [
//               {
//                 id: pageId,
//                 title: 'Untitled Page',
//                 folderName: 'Untitled Page',
//                 lastModified: Date.now()
//               }
//             ]
//           }
//         ]
//       }
//     ]);

//     setCurrentPageId(pageId);
//   };

//   const value = {
//     notebooks,
//     currentPageId,
//     setCurrentPageId,
//     toggleNotebook,
//     toggleSection,
//     loading,
//     notesFolder, // ✅ EXPOSED
//     reloadNotebooks: loadNotebooks,
//     addNotebook,
//   };

//   return (
//     <NotebooksContext.Provider value={value}>
//       {children}
//     </NotebooksContext.Provider>
//   );
// };

// export const useNotebooks = () => useContext(NotebooksContext);


import { createContext, useContext, useEffect, useState } from 'react';
import { readDir, readTextFile, writeTextFile } from '@tauri-apps/plugin-fs';
import { join } from '@tauri-apps/api/path';

const NotebookContext = createContext(null);

export function NotebooksProvider({ notesFolder, children }) {
  const [notebookData, setNotebookData] = useState([]);
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

  const loadNotebooks = async () => {
    try {
      setLoading(true);
      const tempData = [];

      const notebookDirs = await readDir(notesFolder);

      for (const notebook of notebookDirs) {
        if (!notebook.isDirectory) continue;
        const currentnotebook = {};
        const notebookPath = await join(notesFolder, notebook.name);
        currentnotebook.name = notebook.name;
        currentnotebook.path = notebookPath;
        currentnotebook.isExpanded = false;

        currentnotebook.sections = []; 
        currentnotebook.pages = {};
        try {
          const notebookJsonPath = await join(notebookPath, 'notebook.json');
          const notebookJsonContent = await readTextFile(notebookJsonPath);
          const parsedNotebookContent = JSON.parse(notebookJsonContent);

          if (parsedNotebookContent.color) {
            currentnotebook.color = parsedNotebookContent.color;
          }

          currentnotebook.id = parsedNotebookContent.id;
        } catch (err) {
          console.error(`Failed to read notebook.json for ${notebook.name}: `, err);
        }

        const sectionDirs = await readDir(notebookPath);
        for (const sectionEntry of sectionDirs) {
          if (!sectionEntry.isDirectory) continue;

          const sectionName = sectionEntry.name;
          const sectionPath = await join(notebookPath, sectionName);
          try {
            const sectionJsonPath = await join(sectionPath, 'section.json');
            const sectionJsonContent = await readTextFile(sectionJsonPath);
            const parsedSectionContent = JSON.parse(sectionJsonContent);


            currentnotebook.sections.push({
              name: sectionName,
              isExpanded: false,
              id: parsedSectionContent.id,
              color: parsedSectionContent.color
            });
          } catch (err) {
            console.error(`Failed to read section.json for ${sectionName}: `, err);
          }
          


          const pageEntries = await readDir(sectionPath);
          currentnotebook.pages[sectionName] = [];

          for (const pageEntry of pageEntries) {
            if (!pageEntry.isDirectory) continue;
            const pagePath = await join(sectionPath, pageEntry.name);
            const pageJsonPath = await join(pagePath, 'page.json'); 
            try {
              const json = await readTextFile(pageJsonPath);
              const pageData = JSON.parse(json);

              currentnotebook.pages[sectionName].push({
                id: pageData.id,
                title: pageData.title,
                pageName: pageEntry.name,
              });
            } catch (err) {
              console.error(`Failed to read page.json for ${pageEntry.name}`,err);
            }

          }
        }  
        tempData.push(currentnotebook);
      }
      console.log('Loaded Notebooks:', tempData);
      setNotebookData(tempData);
      setCurrentPageId(null)
    } catch (err) {
      console.error('An error occurred while trying to load notebooks ', err);
    } finally {
      setLoading(false);
    }
  };

  const addNotebook = async (folderPath) => {
    try {
      const notebookPath = await join(folderPath, 'Untitled Notebook');
      const sectionPath = await join(notebookPath, 'Untitled Section');
      const pagePath = await join(sectionPath, 'Untitled Page');
      
      await mkdir(pagePath, { recursive: true });
      
      const notebookColor = getRandomColor();
      
      // CREATE NOTEBOOK.JSON with color (ADD THIS)
      const notebookJsonPath = await join(notebookPath, 'notebook.json');
      const notebookData = {
        color: notebookColor,
        id: crypto.randomUUID(),
        name: 'Untitled Notebook',
      };
      await writeTextFile(notebookJsonPath, JSON.stringify(notebookData, null, 2));

      const sectionJsonPath = await join(sectionPath, 'section.json');
      const sectionData = {
        id: crypto.randomUUID(),
        name: 'Untitled Section',
      };
      await writeTextFile(sectionJsonPath, JSON.stringify(sectionData, null, 3));
      
      const pageJsonPath = await join(pagePath, 'page.json');
      const initialPage = {
        id: crypto.randomUUID(),
        title: 'Untitled Page',
        created: new Date().toISOString(),
        lastModified: new Date().toISOString(),
        text: '',
        images: [],
        attachments: [],
        hasDrawing: false  
      };
      
      await writeTextFile(pageJsonPath, JSON.stringify(initialPage, null, 2));
      
      console.log('New notebook created at :', folderPath);
    } catch (error) {
      console.error('Error creating new notebook:', error);
      throw error;
    }
  }

  const toggleNotebook = (notebookId) => {
    setNotebookData(prevData => 
      prevData.map(notebook => 
        notebook.id === notebookId 
          ? { ...notebook, isExpanded: !notebook.isExpanded } 
          : notebook
      )
    );
  };

  const toggleSection = (notebookId, sectionId) => {
    setNotebookData(prevNotebooks => 
      prevNotebooks.map(notebook => {
        // 1. Find the target notebook
        if (notebook.id === notebookId) {
          return {
            ...notebook,
            // 2. Map through sections to find the target section
            sections: notebook.sections.map(section => 
              section.id === sectionId 
                ? { ...section, isExpanded: !section.isExpanded } 
                : section
            )
          };
        }
        // 3. Return unchanged notebooks
        return notebook;
      })
    );
  };

  useEffect(() => {
    if (!notesFolder) return;
    loadNotebooks();
  }, [notesFolder]);

  return (
    <NotebookContext.Provider
      value={{
        notesFolder,
        notebookData,
        currentPageId,
        setCurrentPageId,
        loading,
        toggleNotebook,
        toggleSection,
        addNotebook,
        reloadNotebooks: loadNotebooks,
      }}
    >
      {children}
    </NotebookContext.Provider>
  );
}


export function useNotebooks() {
  const ctx = useContext(NotebookContext);
  if (!ctx) {
    throw new Error('useNotebooks must be used inside NotebooksProvider');
  }
  return ctx;
}