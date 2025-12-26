import { useState } from 'react'
import Layout from './Components/Layout/Layout.jsx';

function App() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  return (
    <Layout
      isSidebarCollapsed={isSidebarCollapsed}
      sidebar={
        <div style={{ padding: '20px', color: 'white' }}>
          <h3>Sidebar</h3>
          <button onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}>
            Toggle
          </button>
        </div>
      }
      toolbar={
        <div style={{ padding: '20px', color: 'white' }}>
          <h3>Toolbar</h3>
        </div>
      }
      canvas={
        <div style={{ padding: '20px', color: 'white' }}>
          <h3>Canvas Area</h3>
        </div>
      }
    />
  )
}

export default App
