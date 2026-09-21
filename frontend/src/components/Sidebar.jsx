import { NavLink } from "react-router-dom";

import {
  LayoutDashboard,
  ScanSearch,
  Map,
  BarChart3,
  History,
  FileText,
  Settings,
  Waves,
  CircleHelp
} from "lucide-react";

function Sidebar() {

  const menuItems = [
    {
      name: "Dashboard",
      path: "/dashboard",
      icon: LayoutDashboard
    },
    {
      name: "AI Detection",
      path: "/detection",
      icon: ScanSearch
    },
    {
      name: "Marine Map",
      path: "/map",
      icon: Map
    },
    {
      name: "Analytics",
      path: "/analytics",
      icon: BarChart3
    },
    {
      name: "Scan History",
      path: "/scans",
      icon: History
    },
    {
      name: "Reports",
      path: "/reports",
      icon: FileText
    }
  ];

  return (
    <aside className="sidebar">

      <div className="sidebar-logo">

        <div className="logo-icon">
          <Waves size={24} />
        </div>

        <div>
          <h2>MarineScan</h2>
          <span>AI Marine Intelligence</span>
        </div>

      </div>


      <div className="menu-section">

        <p className="menu-title">
          MAIN MENU
        </p>

        {menuItems.map((item) => {

          const Icon = item.icon;

          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `sidebar-link ${isActive ? "active" : ""}`
              }
            >

              <Icon size={19} />

              <span>
                {item.name}
              </span>

            </NavLink>
          );

        })}

      </div>


      <div className="sidebar-bottom">

        <NavLink
          to="/settings"
          className={({ isActive }) =>
            `sidebar-link ${isActive ? "active" : ""}`
          }
        >
          <Settings size={19} />
          <span>Settings</span>
        </NavLink>


        <div className="system-status">

          <div className="status-dot"></div>

          <div>
            <strong>AI System Online</strong>
            <span>YOLO Detection Engine</span>
          </div>

        </div>


        <div className="sidebar-help">

          <CircleHelp size={18} />

          <div>
            <strong>Need help?</strong>
            <span>View documentation</span>
          </div>

        </div>

      </div>

    </aside>
  );
}

export default Sidebar;