import React from 'react';
import { Outlet, NavLink } from 'react-router-dom';

// Iconos simplificados para el menú
const Icono = ({ children }) => <span style={{ marginRight: '10px' }}>{children}</span>;

export default function Layout() {
  const navLinkStyle = ({ isActive }) => ({
    display: 'flex',
    alignItems: 'center',
    padding: '12px 16px',
    color: isActive ? 'white' : '#374151',
    backgroundColor: isActive ? '#3b82f6' : 'white',
    borderRadius: '8px',
    fontWeight: isActive ? '600' : '500',
    textDecoration: 'none',
    transition: 'all 0.2s',
    marginBottom: '8px',
  });

  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: 'sans-serif', backgroundColor: '#f5f7fa' }}>
      {/* Sidebar (Basado en menuPrincipal.html) */}
      <aside style={{ width: '260px', backgroundColor: 'white', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '1rem', borderBottom: '1px solid #e5e7eb', textAlign: 'center' }}>
          {/* Aquí puedes poner tu logo */}
          <h2 style={{ color: '#2c3e50' }}>ALMV FAA</h2>
        </div>
        <nav style={{ padding: '1rem', flexGrow: 1 }}>
          <NavLink to="/app" style={navLinkStyle} end>
            <Icono>🏠</Icono><span>Dashboard</span>
          </NavLink>
          <NavLink to="/app/inventario" style={navLinkStyle}>
            <Icono>📦</Icono><span>Inventario</span>
          </NavLink>
          <NavLink to="/app/salidas" style={navLinkStyle}>
            <Icono>🚚</Icono><span>Salidas</span>
          </NavLink>
          <NavLink to="/app/entradas" style={navLinkStyle}>
            <Icono>📥</Icono><span>Entradas</span>
          </NavLink>
          <NavLink to="/app/contratos" style={navLinkStyle}>
            <Icono>📄</Icono><span>Contratos</span>
          </NavLink>
          <NavLink to="/app/financieros" style={navLinkStyle}>
            <Icono>💰</Icono><span>Recursos Financieros</span>
          </NavLink>
          <NavLink to="/app/programacion" style={navLinkStyle}>
            <Icono>📅</Icono><span>Programación Mensual</span>
          </NavLink>
          {/* Agrega más enlaces para el resto de tus vistas */}
        </nav>
      </aside>

      {/* Main Content Area */}
      <main style={{ flex: 1, padding: '30px', overflowY: 'auto' }}>
        {/* El Outlet renderizará el componente de la ruta activa (ej: <Entradas />) */}
        <Outlet /> 
      </main>
    </div>
  );
}