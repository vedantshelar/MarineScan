import {
    Bell,
    Search,
    ChevronDown
  } from "lucide-react";
  
  function Navbar() {
  
    return (
      <header className="navbar">
  
        <div className="navbar-left">
  
          <div className="search-box">
  
            <Search size={18} />
  
            <input
              type="text"
              placeholder="Search scans, detections..."
            />
  
            <span className="search-shortcut">
              ⌘ K
            </span>
  
          </div>
  
        </div>
  
  
        <div className="navbar-right">
  
          <div className="notification">
  
            <Bell size={19} />
  
            <span className="notification-dot"></span>
  
          </div>
  
  
          <div className="user-profile">
  
            <div className="avatar">
              VS
            </div>
  
            <div className="user-info">
  
              <strong>Vedant</strong>
  
              <span>Administrator</span>
  
            </div>
  
            <ChevronDown size={16} />
  
          </div>
  
        </div>
  
      </header>
    );
  }
  
  export default Navbar;