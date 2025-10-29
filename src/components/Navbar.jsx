import { NavLink } from 'react-router-dom';
import './Navbar.css';

function Navbar() {
  return (
    <nav className="navbar">
      <NavLink to="/" className="nav-logo">CONCERT</NavLink>
      <div className="nav-links">
        <NavLink to="/" end>Shows</NavLink>
        <NavLink to="/budget">Budget</NavLink>
        <NavLink to="/create-show">Create Show</NavLink>
      </div>
    </nav>
  );
}

export default Navbar;
