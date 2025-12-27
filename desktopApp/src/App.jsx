import { useState } from 'react';
import Layout from './Components/Layout/Layout.jsx';
import FolderForm from './Components/FolderForm/FolderForm.jsx';
import './App.css';

function App() {
  const [folderSelection, setFolderSelection] = useState(false);
  return (<>
    {folderSelection ? 
      <Layout />
      :
      <FolderForm />
    }
    </>
  )
}

export default App
