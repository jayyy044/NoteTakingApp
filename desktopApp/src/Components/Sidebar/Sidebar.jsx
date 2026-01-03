import  { useState } from 'react';
import './Sidebar.css';
import { FiPlus } from "react-icons/fi";
import { useNotebooks } from '../Context/NotebookContext.jsx';
import { FaCircle, FaChevronRight } from "react-icons/fa6";
import { IoBookOutline } from "react-icons/io5";
import Loader from '../Loader/Loader.jsx';
import { CiFolderOn } from "react-icons/ci";
import { FiFileText } from "react-icons/fi";
import Settings from '../Settings/SettingsPage.jsx';
import { IoMdSettings } from "react-icons/io";


const Sidebar = ({ contextMenu, setContextMenu, setSettingPage}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [rename, setRename] = useState({
    notebook: null,
    section: null,
    page: null
  })
  const {         
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
        } = useNotebooks();

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  const openContextMenu = (e, type, data) => {
    e.preventDefault();
    e.stopPropagation();

    const menuWidth = 220, menuHeight = 200;
    const x = Math.min(e.clientX, window.innerWidth - menuWidth);
    const y = Math.min(e.clientY, window.innerHeight - menuHeight);

    setContextMenu({
      x,
      y,
      type,
      data,
      source: 'sidebar'
    });
  };

  // Add this handler after your existing openContextMenu function
  const handleSidebarEmptySpace = (e) => {
    e.preventDefault();
    e.stopPropagation();

    const menuWidth = 220, menuHeight = 200;
    const x = Math.min(e.clientX, window.innerWidth - menuWidth);
    const y = Math.min(e.clientY, window.innerHeight - menuHeight);

    setContextMenu({
      x,
      y,
      type: 'sidebar-empty',
      source: 'sidebar'
    });
  };

  const handleRename = (notebookId = null, sectionId = null, pageId = null, newName) => {
    if (notebookId && !sectionId && !pageId) {
      renameNotebook(notebookId, newName);
    } else if (notebookId && sectionId && !pageId) {
      renameSection(notebookId, sectionId, newName);
    } else if (notebookId && sectionId && pageId) {
      renamePage(notebookId, sectionId, pageId, newName);
    }
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
        <button className="add-notebook-btn" onClick={() => addNotebook()}>
          <FiPlus />
        </button>
      </div>

      {contextMenu && contextMenu.source === 'sidebar' && (
        <div
          className="context-menu"
          style={{
            top: contextMenu.y,
            left: contextMenu.x,
            position: 'fixed'
          }}
        > 
          {contextMenu.type === 'sidebar-empty' && (
            <div onClick={() => {
              addNotebook();
              setContextMenu(null);
            }}>
              Add Notebook
            </div>
          )}

          {contextMenu.type === 'notebook' && (
            <>
              <div onClick={() => addSection(contextMenu.data.id)}>Add Section</div>
              <div onClick={() => setRename(prev => ({ ...prev, notebook: contextMenu.data.id }))} >Rename Notebook</div>
              <div onClick={() => deleteNotebook(contextMenu.data.id)}>Delete Notebook</div>
            </>
          )}

          {contextMenu.type === 'section' && (
            <>
              <div onClick={() => addPage(
                contextMenu.data.notebookId,
                contextMenu.data.section.id
              )}>
                Add Page
              </div>
              <div 
                onClick={() => 
                  setRename(prev => ({...prev, 
                    section: contextMenu.data.section.id
                  }))}
              >Rename Section</div>
              <div onClick={() => deleteSection(contextMenu.data.notebookId, contextMenu.data.section.id)}>Delete Section</div>
            </>
          )}

          {contextMenu.type === 'page' && (
            <>
              <div onClick={() => setRename(prev => ({...prev, page: contextMenu.data.page.id }))}>Rename Page</div>
              <div
                onClick={() =>
                  deletePage(
                    contextMenu.data.notebookId,
                    contextMenu.data.sectionId,
                    contextMenu.data.page.id
                  )}
              >Delete Page</div>
            </>
          )}
        </div>
      )}

      <div className="notebooks-container"
        onContextMenu={handleSidebarEmptySpace}
      >
        {notebookData.map((notebook) => (
          <div key={notebook.id} className='notebook-cont'>
            <div className="notebook-item" 
              onClick={() => {
                toggleNotebook(notebook.id)
                setSettingPage(false)
              }}
              onContextMenu={(e) => openContextMenu(e, 'notebook', notebook)}>
              <span className={`notebook-item-chevron ${notebook.isExpanded ? 'expanded' : ''}`}>
                  <FaChevronRight />
                </span>
              <FaCircle className="notebook-circle" style={{ color: notebook.color}} />
                {rename.notebook === notebook.id ? (
                  <input
                    autoFocus
                    className="rename-input"
                    defaultValue={notebook.name}
                    // "onBlur" triggers when the user clicks anywhere else
                    onBlur={() => setRename(prev => ({ ...prev, notebook: null, section: null }))}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleRename(notebook.id, null, null, e.target.value);
                        setRename(prev => ({ ...prev, notebook: null }));
                      }
                      if (e.key === 'Escape') {
                        setRename(prev => ({ ...prev, notebook: null }));
                      }
                    }}
                    // Stop click from bubbling up to the notebook toggle function
                    onClick={(e) => e.stopPropagation()} 
                  />
                ) : (
                  <p className="notebook-item-title">
                    {notebook.name}
                  </p>
                )}
            </div> 

            {notebook.isExpanded && (
              <div className="sections-container">
                {notebook.sections.map((section) => (
                  <div key={section.id}>
                    <div className="section-header" 
                      onClick={() => {
                        toggleSection(notebook.id, section.id)
                        setSettingPage(false)
                      }}
                      onContextMenu={(e) => openContextMenu(e, 'section', { notebookId : notebook.id, section})}
                      >
                      <span className={`section-chevron ${section.isExpanded ? 'expanded' : ''}`}>
                        <FaChevronRight />
                      </span>
                      <CiFolderOn style={{color: `${section.color}`}}/>
                        {(rename.section === section.id) ? (
                          <input
                            autoFocus
                            className="rename-input-section"
                            defaultValue={section.name}
                            // "onBlur" triggers when the user clicks anywhere else
                            onBlur={() => setRename({ notebook: null, section: null, page: null })}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                handleRename(notebook.id, section.id, null, e.target.value);
                                setRename({ notebook: null, section: null, page: null });
                              }
                              if (e.key === 'Escape') {
                                setRename({ notebook: null, section: null, page: null });
                              }
                            }}
                            // Stop click from bubbling up to the notebook toggle function
                            onClick={(e) => e.stopPropagation()} 
                          />
                        ) : (
                          <p className="section-title">
                            {section.name}
                          </p>
                        )}
                    </div>
                    
 
                    {section.isExpanded && (
                      <div className="pages-container">
                        {(notebook.pages[section.id] || []).map((page) => (
                          <div 
                            key={page.id} 
                            className={`page-item ${currentPageId === page.id ? 'selected' : ''}`}
                            onClick={() => {
                              setCurrentPageId(page.id)
                              setSettingPage(false)
                            }}
                            onContextMenu={(e) => openContextMenu(e, 'page', {notebookId: notebook.id, sectionId: section.id, page})}
                          >
                            <div className="page-item-content">
                              <FiFileText/>
                              {(rename.page === page.id) ? (
                                <input
                                  autoFocus
                                  className="rename-input-page"
                                  defaultValue={page.title}
                                  // "onBlur" triggers when the user clicks anywhere else
                                  onBlur={() => setRename({ notebook: null, section: null, page: null })}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                      handleRename(notebook.id, section.id, page.id, e.target.value);
                                      setRename({ notebook: null, section: null, page: null });
                                    }
                                    if (e.key === 'Escape') {
                                      setRename({ notebook: null, section: null, page: null });
                                    }
                                  }}
                                  // Stop click from bubbling up to the notebook toggle function
                                  onClick={(e) => e.stopPropagation()} 
                                />
                              ) : (
                                <p >{page.title}</p>
                              )}
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

      <div className="settings-container" onClick={() => setSettingPage(true)}>
        <button className='settings-icon'>
          <IoMdSettings size={23}/>
        </button>
        {isOpen && <span className="settings-text">Settings</span>}
      </div>
    </div>
  );
};

export default Sidebar;