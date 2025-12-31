import { createContext, useContext, useEffect, useState } from 'react';
import { readDir, readTextFile, writeTextFile, mkdir } from '@tauri-apps/plugin-fs';
import { join } from '@tauri-apps/api/path';

const NotebookContext = createContext(null);

export function NotebooksProvider({ notesFolder, children }) {
  const [notebookData, setNotebookData] = useState([]);
  const [currentPageId, setCurrentPageId] = useState(null);
  const [loading, setLoading] = useState(true);

  const getRandomColor = () => {
    const random255 = () => Math.floor(Math.random() * 256);
    const r = random255();
    const g = random255();
    const b = random255();
    const color = `rgb(${r}, ${g}, ${b})`;
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

  const getNextUntitledNotebookName = async (notesFolder) => {
    const entries = await readDir(notesFolder, { recursive: false });

    let hasBase = false;
    let maxNumber = 0;

    for (const entry of entries) {
      if (!entry.isDirectory || !entry.name) continue;

      if (entry.name === "Untitled Notebook") {
        hasBase = true;
        continue;
      }

      const match = entry.name.match(/^Untitled Notebook (\d+)$/);
      if (match) {
        const num = parseInt(match[1], 10);
        maxNumber = Math.max(maxNumber, num);
      }
    }

    // No notebooks at all
    if (!hasBase && maxNumber === 0) {
      return "Untitled Notebook";
    }

    // Base exists, but no numbered ones yet
    if (hasBase && maxNumber === 0) {
      return "Untitled Notebook 1";
    }

    // Numbered notebooks exist
    return `Untitled Notebook ${maxNumber + 1}`;
  };
 
  const getNextUntitledSectionName = async (notebookPath) => {
    const entries = await readDir(notebookPath, { recursive: false });

    let hasBase = false;
    let maxNumber = 0;

    for (const entry of entries) {
      if (!entry.isDirectory || !entry.name) continue;

      if (entry.name === "Untitled Section") {
        hasBase = true;
        continue;
      }

      const match = entry.name.match(/^Untitled Section (\d+)$/);
      if (match) {
        const num = parseInt(match[1], 10);
        maxNumber = Math.max(maxNumber, num);
      }
    }

    if (!hasBase && maxNumber === 0) {
      return "Untitled Section";
    }

    if (hasBase && maxNumber === 0) {
      return "Untitled Section 1";
    }

    return `Untitled Section ${maxNumber + 1}`;
  }

  const getNextUntitledPageName = async (sectionPath) => {

    const entries = await readDir(sectionPath, { recursive: false });

    let hasBase = false;
    let maxNumber = 0;

    for (const entry of entries) {
      if (!entry.isDirectory || !entry.name) continue;

      if (entry.name === "Untitled Page") {
        hasBase = true;
        continue;
      }

      const match = entry.name.match(/^Untitled Page (\d+)$/);
      if (match) {
        const num = parseInt(match[1], 10);
        maxNumber = Math.max(maxNumber, num);
      }
    }

    if (!hasBase && maxNumber === 0) {
      return "Untitled Page";
    }

    if (hasBase && maxNumber === 0) {
      return "Untitled Page 1";
    }

    return `Untitled Page ${maxNumber + 1}`;

  }

  const addNotebook = async () => {
    try {
      const notebookName = await getNextUntitledNotebookName(notesFolder);
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
            'Untitled Section': [
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

      const sectionName = await getNextUntitledSectionName(notebook.path);
      const sectionPath = await join(notebook.path, sectionName);
      await mkdir(sectionPath, { recursive: true });

      const sectionColor = getRandomColor();
      const sectionData = {
        name: sectionName,
        isExpanded: false,
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
              [sectionName]: [
                {
                  id: newPage.id,
                  title: newPage.title,
                  pageName,
                }
              ]
            }
          };
        })
      );
      console.log('New section created with initial page:');
    }
    catch(error){
      console.error("An error occured while trying to create new section ", err)
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

      const pageName = await getNextUntitledPageName(sectionPath);
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
              [section.name]: [
                ...(nb.pages[section.name] ?? []),
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