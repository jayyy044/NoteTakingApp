import React, { useState } from 'react';
import './Sidebar.css';
import {createMockNotebooks} from '../Mockdata/mockdata.js';

const Sidebar = ({}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [notebooks, setNotebooks] = useState(createMockNotebooks());
  const [currentPageId, setCurrentPageId] = useState(null);

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  // Toggle Notebook Open/Closed
  const onToggleNotebook = (id) => {
    setNotebooks(notebooks.map(nb => 
      nb.id === id ? { ...nb, isExpanded: !nb.isExpanded } : nb
    ));
  };

  // Toggle Section Open/Closed
  const onToggleSection = (nbId, secId) => {
    setNotebooks(notebooks.map(nb => {
      if (nb.id !== nbId) return nb;
      return {
        ...nb,
        sections: nb.sections.map(sec => 
          sec.id === secId ? { ...sec, isExpanded: !sec.isExpanded } : sec
        )
      };
    }));
  };

  const formatTime = (date) => {
    // Simple helper to match your "1h ago" requirement
    return "1h ago"; 
  };

  const ChevronRight = () => (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M9 18l6-6-6-6" />
    </svg>
  );

  const Plus = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 5v14M5 12h14" />
    </svg>
  );

  const FileText = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14,2 14,8 20,8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
    </svg>
  );

  const Folder = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
    </svg>
  );
  return (
    <div className={`sidebar ${isOpen ? 'open' : 'closed'}`}>
      
      {/* 1. Header / Toggle Button */}
      <div className="sidebar-header">
        <button className="toggle-btn" onClick={toggleSidebar}>
            <svg width="25" height="25" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
                <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
            </svg>
        </button>
        <span className="logo-text">Note Flow</span>
      </div>
      <div className="add-notebooks">
        <span>NOTEBOOKS</span>
        <button className="add-notebook-btn">
            <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
        </button>
      </div>

      <div className="sidebar__content">
        {notebooks.map((notebook) => (
          <div key={notebook.id} className="notebook-group">
            {/* Notebook Row */}
            <div className="notebook-item" onClick={() => onToggleNotebook(notebook.id)}>
              <span className={`notebook-item__expand ${notebook.isExpanded ? 'expanded' : ''}`}>
                <ChevronRight />
              </span>
              {/* Forced to red as requested */}
              <span className="notebook-item__icon" style={{ backgroundColor: 'red' }} />
              <span className="notebook-item__title">{notebook.title}</span>
            </div>

            {/* Sections List */}
            {notebook.isExpanded && (
              <div className="sections-container">
                {notebook.sections.map((section) => (
                  <div key={section.id}>
                    <div className="section-item" onClick={() => onToggleSection(notebook.id, section.id)}>
                      <span className={`section-item__expand ${section.isExpanded ? 'expanded' : ''}`}>
                        <ChevronRight/>
                      </span>
                      <span className="section-item__icon"><Folder/></span>
                      <span className="section-item__title">{section.title}</span>
                    </div>

                    {/* Pages List */}
                    {section.isExpanded && (
                      <div className="pages-container">
                        {section.pages.map((page) => (
                          <div 
                            key={page.id} 
                            className={`page-item ${currentPageId === page.id ? 'selected' : ''}`}
                            onClick={() => setCurrentPageId(page.id)}
                          >
                            <span className="page-item__icon"><FileText/></span>
                            <div className="page-item__content">
                              <div className="page-item__title">{page.title}</div>
                              <div className="page-item__time">{formatTime(page.lastModified)}</div>
                            </div>
                          </div>
                        ))}
                        {/* Add Page Button */}
                        <div className="add-page-btn">
                          <Plus/>
                          <span>Add Page</span>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
                
                {/* Add Section Button (Inside the notebook, after all sections) */}
                <div className="add-section-btn">
                  <span>Add Section</span>
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