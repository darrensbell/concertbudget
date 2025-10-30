
import { NavLink } from 'react-router-dom';
import './Sidebar.css';

const Sidebar = () => {
  const isConnected = true; // This would be dynamic in a real app

  return (
    <div className="sidebar">
      <h1 className="nav-logo">Concert</h1>
      <nav className="sidebar-nav">
        <NavLink to="/" end>Shows</NavLink>
        <NavLink to="/create-show">Create Show</NavLink>
      </nav>

      <div className={`db-status ${isConnected ? 'connected' : 'disconnected'}`}>
        <div className="db-status-icon"></div>
        <span className="db-status-text">
          {isConnected ? 'Connected' : 'Disconnected'}
        </span>
      </div>
    </div>
  );
};

export default Sidebar;
