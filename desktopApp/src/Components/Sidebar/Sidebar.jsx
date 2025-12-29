import React, { useState } from 'react';
import './Sidebar.css';
import { FiPlus } from "react-icons/fi";
import { useNotebooks } from '../Context/notebookcontext.jsx';
import { FaCircle } from "react-icons/fa6";
import { FaRegFolderClosed } from "react-icons/fa6";
import { IoBookOutline } from "react-icons/io5";

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { notebooks, 
          currentPageId, 
          setCurrentPageId, 
          toggleNotebook, 
          toggleSection, 
          loading, 
          addNotebook,
          addSection,
          addPage } = useNotebooks();

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
          <span className="logo-text">Note Flow</span>
        </div>
        <div className="loading-notebooks">Loading notebooks...</div>
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
        {notebooks.map((notebook) => (
          <div key={notebook.id} className='notebook-cont'>
            <div className="notebook-item" onClick={() => toggleNotebook(notebook.id)}>
              <FaCircle className="notebook-circle" style={{ color: notebook.color}} />
              <span className="notebook-item-title">{notebook.title}</span>
            </div>

            {notebook.isExpanded && (
              <div className="sections-container">
                {notebook.sections.map((section) => (
                  <div key={section.id}>
                    <div className="section-item" onClick={() => toggleSection(notebook.id, section.id)}>
                      <FaRegFolderClosed style={{color: notebook.color}}/>
                      <span className="section-item-title">{section.title}</span>
                    </div>

                    {section.isExpanded && (
                      <div className="pages-container">
                        {section.pages.map((page) => (
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