import { createContext, useContext, useEffect, useState } from 'react';
import { readDir, readTextFile, writeTextFile, mkdir, rename, remove, exists } from '@tauri-apps/plugin-fs';
import { join } from '@tauri-apps/api/path';

const NotebookContext = createContext(null);

export function NotebooksProvider({ notesFolder, children }) {
  const [notebookData, setNotebookData] = useState([]);
  const [currentPageId, setCurrentPageId] = useState(null);
  const [loading, setLoading] = useState(true);

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
          let sectionId = ''
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

            sectionId = parsedSectionContent.id
          } catch (err) {
            console.error(`Failed to read section.json for ${sectionName}: `, err);
          }
          


          const pageEntries = await readDir(sectionPath);
          currentnotebook.pages[sectionId] = [];

          for (const pageEntry of pageEntries) {
            if (!pageEntry.isDirectory) continue;
            const pagePath = await join(sectionPath, pageEntry.name);
            const pageJsonPath = await join(pagePath, 'page.json'); 
            try {
              const json = await readTextFile(pageJsonPath);
              const pageData = JSON.parse(json);

              currentnotebook.pages[sectionId].push({
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

  //Add Functions 

  const getRandomColor = () => {
    const random255 = () => Math.floor(Math.random() * 256);
    const r = random255();
    const g = random255();
    const b = random255();
    const color = `rgb(${r}, ${g}, ${b})`;
    return color;
  };

  const getNextUntitledName = async (parentPath, baseName) => {
    const entries = await readDir(parentPath, { recursive: false });

    const usedNumbers = new Set();

    for (const entry of entries) {
      if (!entry.isDirectory || !entry.name) continue;

      if (entry.name === baseName) {
        usedNumbers.add(0);
        continue;
      }

      const match = entry.name.match(new RegExp(`^${baseName} (\\d+)$`));
      if (match) {
        usedNumbers.add(parseInt(match[1], 10));
      }
    }

    let i = 0;
    while (usedNumbers.has(i)) {
      i++;
    }

    return i === 0 ? baseName : `${baseName} ${i}`;
  };

  const addNotebook = async () => {
    try {
      const notebookName = await getNextUntitledName(notesFolder, 'Untitled Notebook');
      const notebookPath = await join(notesFolder, notebookName);
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


      const sectionColor = getRandomColor();
      const sectionJsonPath = await join(sectionPath, 'section.json');
      const sectionData = {
        id: crypto.randomUUID(),
        name: 'Untitled Section',
        color: sectionColor,
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
      // await loadNotebooks();

      setNotebookData(prev => [
        ...prev,
        {
          id: notebookData.id,
          name: notebookName,
          color: notebookColor,
          path: notebookPath,
          isExpanded: true,
          sections: [
            {
              id: sectionData.id,
              name: 'Untitled Section',
              isExpanded: true,
              color: sectionColor,
            }
          ],
          pages: {
            [sectionData.id]: [
              {
                id: initialPage.id,
                title: 'Untitled Page',
                pageName: 'Untitled Page',
              }
            ]
          }
        }
      ]);
      
      console.log('New notebook created at :', notebookPath);
    } catch (error) {
      console.error('Error creating new notebook:', error);
      throw error;
    }
  }

  const addSection = async(notebookId) => {
    try {
      const notebook = notebookData.find(nb => nb.id === notebookId);
      if (!notebook) return;

      const sectionName = await getNextUntitledName(notebook.path, 'Untitled Section');
      const sectionPath = await join(notebook.path, sectionName);
      await mkdir(sectionPath, { recursive: true });

      const sectionColor = getRandomColor();
      const sectionData = {
        name: sectionName,
        isExpanded: true,
        id: crypto.randomUUID(),
        color: sectionColor,
      };
        
      const sectionJsonPath = await join(sectionPath, 'section.json');
      await writeTextFile(sectionJsonPath, JSON.stringify(sectionData, null, 2));

      const pageName = 'Untitled Page';
      const pagePath = await join(sectionPath, pageName);
      await mkdir(pagePath, { recursive: true });

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

      const pageJsonPath = await join(pagePath, 'page.json');
      await writeTextFile(pageJsonPath, JSON.stringify(newPage, null, 2));

      setNotebookData(prev =>
        prev.map(nb => {
          if (nb.id !== notebookId) return nb;

          return {
            ...nb,
            sections: [
              ...nb.sections,
              {
                id: sectionData.id,
                name: sectionName,
                color: sectionColor,
                isExpanded: true,
              }
            ],
            pages: {
              ...nb.pages,
              [sectionData.id]: [
                {
                  id: newPage.id,
                  title: newPage.title,
                }
              ]
            }
          };
        })
      );
      console.log('New section created with initial page:');
    }
    catch(error){
      console.error("An error occured while trying to create new section ", error)
      throw error
    }


  }

  const addPage = async (notebookId, sectionId) => {
    try {
      const notebook = notebookData.find(nb => nb.id === notebookId);
      if (!notebook) return;

      const section = notebook.sections.find(sec => sec.id === sectionId);
      if (!section) return;

      const sectionPath = await join(notebook.path, section.name);

      const pageName = await getNextUntitledName(sectionPath, 'Untitled Page');
      const pagePath = await join(sectionPath, pageName);

      await mkdir(pagePath, { recursive: true });

      const pageData = {
        id: crypto.randomUUID(),
        title: pageName,
        created: new Date().toISOString(),
        lastModified: new Date().toISOString(),
        text: '',
        images: [],
        attachments: [],
        hasDrawing: false,
      };

      const pageJsonPath = await join(pagePath, 'page.json');
      await writeTextFile(pageJsonPath, JSON.stringify(pageData, null, 2));

      // 3️⃣ Update React state
      setNotebookData(prev =>
        prev.map(nb => {
          if (nb.id !== notebookId) return nb;

          return {
            ...nb,
            pages: {
              ...nb.pages,
              [sectionId]: [
                ...(nb.pages[sectionId] ?? []),
                {
                  id: pageData.id,
                  title: pageData.title,
                  pageName,
                }
              ]
            }
          };
        })
      );

      console.log('New page created:', pageName);
    } catch (error) {
      console.error('Error creating page:', error);
      throw error;
    }
  };

  //Rename Functions

  const renameNotebook = async (notebookId, newName) => {
    try {
      const notebook = notebookData.find(nb => nb.id === notebookId);
      if (!notebook) return;

      const trimmed = newName.trim();
      if (!trimmed) return;

      const newPath = await join(notesFolder, trimmed);

      // 1️⃣ Prevent name collision
      const siblings = await readDir(notesFolder, { recursive: false });
      if (siblings.some(e => e.isDirectory && e.name === trimmed)) {
        throw new Error('Notebook name already exists');
      }

      // 2️⃣ Rename folder
      await rename(notebook.path, newPath);

      // 3️⃣ Update notebook.json
      const notebookJsonPath = await join(newPath, 'notebook.json');
      const json = JSON.parse(await readTextFile(notebookJsonPath));
      json.name = trimmed;
      await writeTextFile(notebookJsonPath, JSON.stringify(json, null, 2));

      // 4️⃣ Update React state
      setNotebookData(prev =>
        prev.map(nb =>
          nb.id === notebookId
            ? { ...nb, name: trimmed, path: newPath }
            : nb
        )
      );
    } catch (err) {
      console.error('Failed to rename notebook:', err);
    }
  };

  const renameSection = async (notebookId, sectionId, newName) => {
    try {
      const notebook = notebookData.find(nb => nb.id === notebookId);
      if (!notebook) return;

      const section = notebook.sections.find(sec => sec.id === sectionId);
      if (!section) return;

      const trimmed = newName.trim();
      if (!trimmed) return;

      const oldPath = await join(notebook.path, section.name);
      const newPath = await join(notebook.path, trimmed);

      const siblings = await readDir(notebook.path, { recursive: false });
      if (siblings.some(e => e.isDirectory && e.name === trimmed)) {
        throw new Error('Section name already exists');
      }

      await rename(oldPath, newPath);

      const sectionJsonPath = await join(newPath, 'section.json');
      const json = JSON.parse(await readTextFile(sectionJsonPath));
      json.name = trimmed;
      await writeTextFile(sectionJsonPath, JSON.stringify(json, null, 2));

      setNotebookData(prev =>
        prev.map(nb => {
          if (nb.id !== notebookId) return nb;

          return {
            ...nb,
            sections: nb.sections.map(sec =>
              sec.id === sectionId
                ? { ...sec, name: trimmed }
                : sec
            )
            // ✅ pages untouched
          };
        })
      );

    } catch (err) {
      console.error('Failed to rename section:', err);
    }
  };

  const renamePage = async (notebookId, sectionId, pageId, newName) => {
    try {
      const notebook = notebookData.find(nb => nb.id === notebookId);
      if (!notebook) return;

      const section = notebook.sections.find(sec => sec.id === sectionId);
      if (!section) return;

      const pages = notebook.pages[sectionId] ?? [];
      const page = pages.find(p => p.id === pageId);
      if (!page) return;

      const trimmed = newName.trim();
      if (!trimmed) return;

      const sectionPath = await join(notebook.path, section.name);
      const oldPath = await join(sectionPath, page.pageName);
      const newPath = await join(sectionPath, trimmed);

      const siblings = await readDir(sectionPath, { recursive: false });
      if (siblings.some(e => e.isDirectory && e.name === trimmed)) {
        throw new Error('Page name already exists');
      }

      await rename(oldPath, newPath);

      const pageJsonPath = await join(newPath, 'page.json');
      const json = JSON.parse(await readTextFile(pageJsonPath));
      json.title = trimmed;
      json.lastModified = new Date().toISOString();
      await writeTextFile(pageJsonPath, JSON.stringify(json, null, 2));

      setNotebookData(prev =>
        prev.map(nb => {
          if (nb.id !== notebookId) return nb;

          return {
            ...nb,
            pages: {
              ...nb.pages,
              [sectionId]: nb.pages[sectionId].map(p =>
                p.id === pageId
                  ? { ...p, title: trimmed, pageName: trimmed }
                  : p
              )
            }
          };
        })
      );
    } catch (err) {
      console.error('Failed to rename page:', err);
    }
  };

  //Delete Functions
  const deleteNotebook = async (notebookID) => {
    try {
      const notebook = notebookData.find(n => n.id === notebookID);
      if (!notebook) return;

      const notebookPath = await join(notesFolder, notebook.name);

      if (await exists(notebookPath)) {
        await remove(notebookPath, { recursive: true });
      }

      setNotebookData(prev => prev.filter(n => n.id !== notebookID));

    } catch (err) {
      console.error("Failed to delete notebook:", err);
    }
  };

  const deleteSection = async (notebookID, sectionID) => {
    try {
      const notebook = notebookData.find(n => n.id === notebookID);
      const section = notebook?.sections.find(s => s.id === sectionID);
      if (!section) return;

      const sectionPath = await join(
        notesFolder,
        notebook.name,
        section.name
      );

      if (await exists(sectionPath)) {
        await remove(sectionPath, { recursive: true });
      }

      setNotebookData(prev =>
        prev.map(n => {
          if (n.id !== notebookID) return n;

          const { [sectionID]: _, ...restPages } = n.pages;

          return {
            ...n,
            sections: n.sections.filter(s => s.id !== sectionID),
            pages: restPages
          };
        })
      );

    } catch (err) {
      console.error("Failed to delete section:", err);
    }
  };

  const deletePage = async (notebookID, sectionID, pageID) => {
    try {
      const notebook = notebookData.find(n => n.id === notebookID);
      if (!notebook) return;

      const section = notebook.sections.find(s => s.id === sectionID);
      if (!section) return;

      const pages = notebook.pages[sectionID] ?? [];
      const page = pages.find(p => p.id === pageID);
      if (!page) return;

      const pagePath = await join(
        notesFolder,
        notebook.name,
        section.name,
        page.pageName
      );

      if (await exists(pagePath)) {
        await remove(pagePath);
      }

      setNotebookData(prev =>
        prev.map(n =>
          n.id === notebookID
            ? {
                ...n,
                pages: {
                  ...n.pages,
                  [sectionID]: n.pages[sectionID].filter(p => p.id !== pageID)
                }
              }
            : n
        )
      );
    } catch (err) {
      console.error("Failed to delete page:", err);
    }
  };


  //Toggle Functions
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
        addSection,
        addPage,
        renameNotebook,
        renameSection,
        renamePage,
        deleteNotebook,
        deleteSection,
        deletePage,
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