export default function Sidebar() {
    return (
      <aside className="sidebar">
        <div className="sidebarBrand">TANGO</div>
  
        <nav className="sidebarNav">
          <a className="active">Dashboard</a>
          <a>Profile</a>
          <a>Settings</a>
        </nav>
  
        <div className="sidebarFooter">
          <button>Logout</button>
        </div>
      </aside>
    );
  }
  