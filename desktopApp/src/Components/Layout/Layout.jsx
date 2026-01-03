import {useState} from 'react';
import './Layout.css';
import Sidebar from '../Sidebar/Sidebar.jsx';
import Canvas from '../Canvas/Canvas.jsx';

const Layout = () => {
  const [contextMenu, setContextMenu] = useState(null);
  return (
    <div className="layout"
      onClick={() => setContextMenu(null)}
      onContextMenu={(e) => {
        if (!e.target.closest('.context-menu')) {
          setContextMenu(null);
        }
      }}
    >
      <Sidebar 
        contextMenu={contextMenu}
        setContextMenu={setContextMenu}
      />
      <main className="layout-main">
        <Canvas
          contextMenu={contextMenu}
          setContextMenu={setContextMenu}
        />
      </main>
    </div>
  );
};

export default Layout;