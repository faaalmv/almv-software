import React from 'react';
import { Outlet, NavLink } from 'react-router-dom';

// Iconos simplificados para el menú
const Icono = ({ children }) => <span style={{ marginRight: '10px', width: '20px', textAlign: 'center' }}>{children}</span>;

export default function Layout() {
  const navLinkStyle = ({ isActive }) => ({
    display: 'flex',
    alignItems: 'center',
    padding: '12px 16px',
    color: isActive ? 'white' : '#374151',
    backgroundColor: isActive ? '#3b82f6' : 'transparent',
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
          <img 
            src="https://hcg.gob.mx/hcg/sites/hcgtransparencia.dd/files/styles/boletines_galeria_eventos/public/imgEventosCS/Logotipo%20HCG_2.jpg?itok=BxoX-M0A" 
            alt="Logo HCG" 
            style={{ width: '80%', height: 'auto', objectFit: 'contain' }} 
          />
        </div>
        <nav style={{ padding: '1rem', flexGrow: 1 }}>
          <NavLink to="/app" style={navLinkStyle} end>
            <Icono>🏠</Icono><span>Dashboard</span>
          </NavLink>
          <NavLink to="/app/entradas" style={navLinkStyle}>
            <Icono>📥</Icono><span>Entradas</span>
          </NavLink>
          <NavLink to="/app/salidas" style={navLinkStyle}>
            <Icono>🚚</Icono><span>Salidas</span>
          </NavLink>
          <NavLink to="/app/contratos" style={navLinkStyle}>
            <Icono>📄</Icono><span>Contratos</span>
          </NavLink>
          <NavLink to="/app/recursos-financieros" style={navLinkStyle}>
            <Icono>💰</Icono><span>Recursos Financieros</span>
          </NavLink>
          <NavLink to="/app/programacion-mensual" style={navLinkStyle}>
            <Icono>📅</Icono><span>Programación Mensual</span>
          </NavLink>
           <NavLink to="/app/entregas-mensuales" style={navLinkStyle}>
            <Icono>📦</Icono><span>Entregas Mensuales</span>
          </NavLink>
        </nav>
         <div style={{ padding: '1rem', borderTop: '1px solid #e5e7eb', textAlign: 'center' }}>
            <p style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                © 2025 HCG - ALMV
            </p>
        </div>
      </aside>

      {/* Main Content Area */}
      <main style={{ flex: 1, padding: '30px', overflowY: 'auto' }}>
        <Outlet /> 
      </main>
    </div>
  );
}