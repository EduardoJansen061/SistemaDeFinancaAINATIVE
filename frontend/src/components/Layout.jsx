import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen flex">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <main className="main-content flex-1">
        <Outlet context={{ onMenuClick: () => setSidebarOpen(true) }} />
      </main>
    </div>
  );
};

export default Layout;
