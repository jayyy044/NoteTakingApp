import  { useState, useEffect } from 'react';
import './Sidebar.css';
import { FiPlus } from "react-icons/fi";
import { useNotebooks } from '../Context/NotebookContext.jsx';
import { FaCircle, FaChevronRight } from "react-icons/fa6";
import { IoBookOutline } from "react-icons/io5";
import Loader from '../Loader/Loader.jsx';
import { CiFolderOn } from "react-icons/ci";
import { FiFileText } from "react-icons/fi";


const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [contextMenu, setContextMenu] = useState(null);
  const [rename, setRename] = useState({
    notebook: false,
    section: false,
    page: false
  })
  const {         
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
        reloadNotebooks } = useNotebooks();

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  const openContextMenu = (e, type, data) => {
    e.preventDefault();
    e.stopPropagation();

    // clamp position so menu doesn't overflow the window
    const menuWidth = 220, menuHeight = 200;
    const x = Math.min(e.clientX, window.innerWidth - menuWidth);
    const y = Math.min(e.clientY, window.innerHeight - menuHeight);

    setContextMenu({ x, y, type, data });
  };

  //On Sidebar
  useEffect(() => {
    const onDocClick = () => setContextMenu(null);
    window.addEventListener('click', onDocClick);
    window.addEventListener('blur', onDocClick);
    return () => {
      window.removeEventListener('click', onDocClick);
      window.removeEventListener('blur', onDocClick);
    };
  }, []);

  //Global Catcher
  useEffect(() => {
    const onContextMenuCapture = (e) => {
      const inSidebar = e.target.closest?.('.sidebar');
      const inCustomMenu = e.target.closest?.('.context-menu');

      // Block native menu ONLY if:
      // 1) Right-click is inside sidebar
      // 2) OR right-click is on the custom context menu itself
      if (inSidebar || inCustomMenu) {
        e.preventDefault();
        return;
      }
      // Otherwise:
      // - If user right-clicks elsewhere, close our menu
      // - Allow native browser menu
      if (contextMenu) {
        setContextMenu(null);
      }
    };
    document.addEventListener('contextmenu', onContextMenuCapture, { capture: true });
    return () => {
      document.removeEventListener('contextmenu', onContextMenuCapture, { capture: true });
    };
  }, [contextMenu]);

  const handleRename = async () =>{

  }


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

      {contextMenu && (
        <div
          className="context-menu"
          style={{
            top: contextMenu.y,
            left: contextMenu.x,
            position: 'fixed'
          }}
        >
          {contextMenu.type === 'notebook' && (
            <>
              <div onClick={() => addSection(contextMenu.data.id)}>Add Section</div>
              <div >Rename Notebook</div>
              <div>Delete Notebook</div>
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
              <div>Rename Section</div>
              <div>Delete Section</div>
            </>
          )}

          {contextMenu.type === 'page' && (
            <>
              <div>Rename Page</div>
              <div>Delete Page</div>
            </>
          )}
        </div>
      )}

      <div className="notebooks-container">
        {notebookData.map((notebook) => (
          <div key={notebook.id} className='notebook-cont'>
            <div className="notebook-item" 
              onClick={() => toggleNotebook(notebook.id)}
              onContextMenu={(e) => openContextMenu(e, 'notebook', notebook)}>
              <span className={`notebook-item-chevron ${notebook.isExpanded ? 'expanded' : ''}`}>
                  <FaChevronRight />
                </span>
              <FaCircle className="notebook-circle" style={{ color: notebook.color}} />
              <span className="notebook-item-title">{notebook.name}</span>
            </div> 

            {notebook.isExpanded && (
              <div className="sections-container">
                {notebook.sections.map((section) => (
                  <div key={section.id}>
                    <div className="section-header" 
                      onClick={() => toggleSection(notebook.id, section.id)}
                      onContextMenu={(e) => openContextMenu(e, 'section', { notebookId: notebook.id, section })}
                      >
                      <span className={`section-chevron ${section.isExpanded ? 'expanded' : ''}`}>
                        <FaChevronRight />
                      </span>
                      <CiFolderOn style={{color: `${section.color}`}}/>
                      <p className='section-title'>
                        {section.name}
                      </p>
                    </div>
                    
 
                    {section.isExpanded && (
                      <div className="pages-container">
                        {(notebook.pages[section.name] || []).map((page) => (
                          <div 
                            key={page.id} 
                            className={`page-item ${currentPageId === page.id ? 'selected' : ''}`}
                            onClick={() => setCurrentPageId(page.id)}
                            onContextMenu={(e) => openContextMenu(e, 'page', { notebookId: notebook.id, sectionId: section.id, page })}
                          >
                            <div className="page-item-content">
                              <FiFileText/>
                              <p >{page.title}</p>
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