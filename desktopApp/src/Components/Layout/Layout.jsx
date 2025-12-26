import React from 'react';
import './Layout.css';
import Sidebar from '../Sidebar/Sidebar.jsx';
import Toolbar from '../Toolbar/Toolbar.jsx';
import Canvas from '../Canvas/Canvas.jsx';

const Layout = () => {
  return (
    <div className="layout">
      <Sidebar/>
      <main className="layout-main">
        <Toolbar/>
        <Canvas/>
      </main>
    </div>
  );
};

export default Layout;