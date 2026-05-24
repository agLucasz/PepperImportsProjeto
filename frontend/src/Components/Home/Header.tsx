import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import logo from '../../assets/logo-pepper.png';
import '../../Styles/Home/header.css';

interface NavItem {
  label: string;
  path: string;
}

const NAV: NavItem[] = [
  { label: 'Início',    path: '/'        },
  { label: 'Catálogo',  path: '/catalogo' },
];

const Header: React.FC = () => {
  const navigate  = useNavigate();
  const location  = useLocation();
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <header className="site-header">
      <div className="site-header-inner">

        {/* Brand */}
        <a
          className="site-header-brand"
          href="/"
          onClick={e => { e.preventDefault(); navigate('/'); }}
        >
          <img src={logo} alt="Pepper Imports" className="site-header-logo" />
        </a>

        {/* Nav */}
        <nav className="site-header-nav">
          {NAV.map(item => (
            <button
              key={item.path}
              className={`site-nav-link${location.pathname === item.path ? ' active' : ''}`}
              onClick={() => navigate(item.path)}
            >
              {item.label}
            </button>
          ))}
        </nav>

        {/* Actions */}
        <div className="site-header-actions">

          {/* Admin */}
          <button
            className="site-header-admin-btn"
            onClick={() => navigate('/login')}
            title="Acesso administrativo"
          >
            <span className="site-header-admin-icon" />
            Admin
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
