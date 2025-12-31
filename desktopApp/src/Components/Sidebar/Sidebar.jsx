import React, { useState } from 'react';
import './Sidebar.css';
import { FiPlus } from "react-icons/fi";
import { useNotebooks } from '../Context/NotebookContext.jsx';
import { FaCircle } from "react-icons/fa6";
import { FaRegFolderClosed } from "react-icons/fa6";
import { IoBookOutline } from "react-icons/io5";
import Loader from '../Loader/Loader.jsx';

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const {         
        notesFolder,
        notebookData,
        currentPageId,
        setCurrentPageId,
        loading,
        toggleNotebook,
        toggleSection,
        addNotebook,
        reloadNotebooks } = useNotebooks();

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  const formatTime = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className={`sidebar ${isOpen ? 'open' : 'closed'}`}>
        <div className="sidebar-header">
          <button className="toggle-btn" onClick={toggleSidebar}>
            <IoBookOutline />
          </button>
          <p className='logo-text'>Note Flow</p>
        </div>
        <div className="loading-notebooks"><Loader h={30} w={30}/></div>
      </div>
    );
  }

  return (
    <div className={`sidebar ${isOpen ? 'open' : 'closed'}`}>
      <div className="sidebar-header">
        <button className="toggle-btn" onClick={toggleSidebar}>
          <IoBookOutline />
        </button>
        <span className="logo-text">Note Flow</span>
      </div>

      <div className="add-notebooks">
        <span>NOTEBOOKS</span>
        <button className="add-notebook-btn" onClick={addNotebook}>
          <FiPlus />
        </button>
      </div>

      <div className="notebooks-container">
        {notebookData.map((notebook) => (
          <div key={notebook.id} className='notebook-cont'>
            <div className="notebook-item" onClick={() => toggleNotebook(notebook.id)}>
              <FaCircle className="notebook-circle" style={{ color: notebook.color}} />
              <span className="notebook-item-title">{notebook.name}</span>
            </div> 

            {notebook.isExpanded && (
              <div className="sections-container">
                {notebook.sections.map((section) => (
                  <div key={section.id}>
                    {/* <div className="section-item" onClick={() => toggleSection(notebook.id, section.id)}>
                      <FaRegFolderClosed style={{color: notebook.color}}/>
                      <span className="section-item-title">{section.name}</span>
                    </div> */}
                    <p className='section-title'>{section.name}</p>
 
                    {section.isExpanded && (
                      <div className="pages-container">
                        {(notebook.pages[section.name] || []).map((page) => (
                          <div 
                            key={page.id} 
                            className={`page-item ${currentPageId === page.id ? 'selected' : ''}`}
                            onClick={() => setCurrentPageId(page.id)}
                          >
                            <div className="page-item-content">
                              <p >{page.title}</p>
                              {/* <div className="page-item__time">{formatTime(page.lastModified)}</div> */}
                            </div>
                          </div>
                        ))}
                        <div className="add-page-btn" onClick={() => addPage(notebook.id, section.id)}>
                          <FiPlus />
                          <span>Add Page</span>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
                <div className="add-section-btn" onClick={() => addSection(notebook.id)}>
                  <FiPlus/>
                  <p>Add Section</p>
                </div>
              </div>
            )}
          </div>
        ))}
      </div> 
    </div>
  );
};

export default Sidebar;