import React from 'react';
import './Layout.css';
import Sidebar from '../Sidebar/Sidebar.jsx';
import Toolbar from '../Toolbar/Toolbar.jsx';
import Canvas from '../Canvas/Canvas.jsx';

const Layout = ({userData}) => {
  return (
    <div className="layout">
      <Sidebar notebookData={userData}/>
      <main className="layout-main">
        <Canvas/>
      </main>
    </div>
  );
};

export default Layout;