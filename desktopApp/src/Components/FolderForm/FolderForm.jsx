import React from 'react'
import './FolderForm.css'
import { FolderOpenOutlined } from '@ant-design/icons';

const FolderForm = () => {
  return (
    <div className="folder-form">
        <div className="folder-form-title">
            <p>Select a Folder to Store Your Notebooks</p>
            <FolderOpenOutlined />
        </div>
        
    </div>
  )
}

export default FolderForm