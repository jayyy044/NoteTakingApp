import React from 'react';
import './Layout.css';

const Layout = ({ 
  sidebar, 
  toolbar, 
  canvas, 
  isSidebarCollapsed 
}) => {
  return (
    <div className="layout">
      <aside className={`layout__sidebar ${isSidebarCollapsed ? 'collapsed' : ''}`}>
        {sidebar}
      </aside>
      <main className="layout__main">
        <header className="layout__toolbar">
          {toolbar}
        </header>
        <section className="layout__canvas">
          {canvas}
        </section>
      </main>
    </div>
  );
};

export default Layout;