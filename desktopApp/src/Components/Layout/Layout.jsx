import {useState} from 'react';
import './Layout.css';
import Sidebar from '../Sidebar/Sidebar.jsx';
import Canvas from '../Canvas/Canvas.jsx';
import SettingsPage from '../Settings/SettingsPage.jsx';

const Layout = () => {
  const [contextMenu, setContextMenu] = useState(null);
  const [settingPage, setSettingPage] = useState(true)
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
        setSettingPage={setSettingPage}
      />
      <main className="layout-main">
        {settingPage ? (
          <SettingsPage setSettingPage={setSettingPage}/>
        ):
        <Canvas
          contextMenu={contextMenu}
          setContextMenu={setContextMenu}
        />
        }
      </main>
    </div>
  );
};

export default Layout;