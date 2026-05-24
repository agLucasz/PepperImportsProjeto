import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  CreditCard,
  Package,
  Layers,
  LayoutGrid,
  BarChart2,
  Users,
  Settings,
  LogOut,
  Wallet,
  Tag,
} from 'lucide-react';
import { clearSession } from '../../Services/authService';
import logoPepper from '../../assets/logo-pepper.png';
import '../../Styles/Admin/sidebar.css';

interface SideBarProps {
  badges?: { [key: string]: number };
}

interface NavItem {
  key: string;
  label: string;
  path: string;
  icon: React.ReactNode;
  live?: boolean;
}

const SZ = 18;
const SW = 1.8;

const OPERACAO: NavItem[] = [
  { key: 'dashboard', label: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard size={SZ} strokeWidth={SW} /> },
  { key: 'pdv', label: 'Venda · PDV', path: '/pdv', icon: <CreditCard size={SZ} strokeWidth={SW} />, live: true },
  { key: 'produtos', label: 'Produtos', path: '/produtos', icon: <Package size={SZ} strokeWidth={SW} /> },
  { key: 'estoque', label: 'Entrada Estoque', path: '/estoque', icon: <Layers size={SZ} strokeWidth={SW} /> },
  { key: 'categorias', label: 'Categorias', path: '/categorias', icon: <LayoutGrid size={SZ} strokeWidth={SW} /> },
];

const FINANCEIRO: NavItem[] = [
  { key: 'contas-a-pagar', label: 'Contas a Pagar', path: '/contas-a-pagar', icon: <Wallet size={SZ} strokeWidth={SW} /> },
  { key: 'despesas', label: 'Despesas', path: '/despesas', icon: <Tag size={SZ} strokeWidth={SW} /> },
];

const ATALHOS: NavItem[] = [
  { key: 'relatorios', label: 'Relatórios', path: '/relatorios', icon: <BarChart2 size={SZ} strokeWidth={SW} /> },
  { key: 'configuracoes', label: 'Configurações', path: '/configuracoes', icon: <Settings size={SZ} strokeWidth={SW} /> },
];

function getInitials(nome: string): string {
  const parts = nome.trim().split(' ').filter(Boolean);
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

const SideBar: React.FC<SideBarProps> = ({ badges = {} }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const raw = localStorage.getItem('pepper_user');
  const user = raw
    ? (JSON.parse(raw) as { nome: string; email: string })
    : { nome: 'Admin', email: '' };
  const initials = getInitials(user.nome);

  const isActive = (path: string) => location.pathname === path;

  const handleLogout = () => {
    clearSession();
    navigate('/login');
  };

  const renderNav = (items: NavItem[]) =>
    items.map(item => (
      <button
        key={item.key}
        className={`sidebar-link${isActive(item.path) ? ' active' : ''}`}
        onClick={() => navigate(item.path)}
      >
        {item.icon}
        {item.label}
        {!item.live && badges[item.key] != null && (
          <span className="badge">{badges[item.key]}</span>
        )}
      </button>
    ));

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <img src={logoPepper} alt="Pepper Imports" className="sidebar-logo" />
      </div>

      <p className="sidebar-section">Operação</p>
      <nav className="sidebar-nav">{renderNav(OPERACAO)}</nav>

      <p className="sidebar-section">Financeiro</p>
      <nav className="sidebar-nav">{renderNav(FINANCEIRO)}</nav>

      <p className="sidebar-section">Atalhos</p>
      <nav className="sidebar-nav">{renderNav(ATALHOS)}</nav>

      <div className="sidebar-user">
        <div className="user-info">
          <b>{user.nome}</b>
          <small>Administrador</small>
        </div>
        <button className="sidebar-logout" onClick={handleLogout} title="Sair">
          <LogOut size={16} strokeWidth={1.8} />
        </button>
      </div>
    </aside>
  );
};

export default SideBar;
