import { useState, useEffect } from 'react';
import Layout from './Components/Layout/Layout.jsx';
import FolderForm from './Components/FolderForm/FolderForm.jsx';
import './App.css';
import { load } from '@tauri-apps/plugin-store';
import { open } from '@tauri-apps/plugin-dialog';
import { toast } from 'react-toastify'
import { join } from '@tauri-apps/api/path';
import { mkdir, writeTextFile } from '@tauri-apps/plugin-fs';

function App() {
  const [isSetupComplete, setIsSetupComplete] = useState(false);
  const [notesFolder, setNotesFolder] = useState(null);
  const [loading, setLoading] = useState(true);

    async function checkSetup() {
    try {
      const store = await load('settings.json', { autoSave: true });
      const folder = await store.get('notesFolder');
      
      if (folder) {
        setNotesFolder(folder);
        setIsSetupComplete(true);
      }
    } catch (error) {
      console.error('Error checking setup:', error);
      toast.error('Failed to load settings');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    checkSetup();
  }, []);

  async function createInitialStructure(folderPath) {
    try {
      const notebookPath = await join(folderPath, 'Untitled Notebook');
      const sectionPath = await join(notebookPath, 'Untitled Section');
      const pagePath = await join(sectionPath, 'Untitled Page');
      
      // Changed from createDir to mkdir
      await mkdir(pagePath, { recursive: true });
      
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
      
      console.log('Initial structure created at:', folderPath);
    } catch (error) {
      console.error('Error creating initial structure:', error);
      throw error;
    }
  }

  async function handleFolderSelection() {
    try {
      console.log('Opening folder selection dialog');
      const selected = await open({
        directory: true,
        multiple: false,
        title: 'Choose where to save your notes'
      });

      if (selected) {
        const store = await load('settings.json', { autoSave: true });
        await store.set('notesFolder', selected);
        await store.save();
        
        await createInitialStructure(selected);

        setNotesFolder(selected);
        setIsSetupComplete(true);
        
        toast.success('Folder saved successfully!');
      }
    } catch (error) {
      console.error('Error selecting folder:', error);
      toast.error('Failed to save folder selection');
    }
  }

  if (loading) {
    return (
      <div className="loading-screen">
        <p>Loading...</p>
      </div>
    );
  }
  return (<>
    {isSetupComplete ? 
      <Layout userData={notesFolder}/>
      :
      <FolderForm folderselectfunc={handleFolderSelection} />
    }
    </>
  )
}

export default App
