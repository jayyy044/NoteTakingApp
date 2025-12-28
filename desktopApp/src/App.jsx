import { useState, useEffect } from 'react';
import Layout from './Components/Layout/Layout.jsx';
import FolderForm from './Components/FolderForm/FolderForm.jsx';
import './App.css';
import { load } from '@tauri-apps/plugin-store';
import { open } from '@tauri-apps/plugin-dialog';
import { toast } from 'react-toastify'

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
