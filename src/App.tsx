import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// --- Importa tus componentes de la nueva ubicación correcta ---
import Layout from './components/Layout';
import InicioSesion from './pages/InicioSesion';
import Contratos from './pages/Contratos'; 
import Entradas from './pages/Entradas';
import Salidas from './pages/Salidas';
import RecursosFinancieros from './pages/RecursosFinancieros';
import ProgramacionMensual from './pages/ProgramacionMensual';
import EntregasMensuales from './pages/EntregasMensuales';

// Componente simple para el Dashboard mientras no tengas uno
const Dashboard = () => (
    <div>
        <h1 style={{fontSize: '2.5rem', fontWeight: 'bold', borderBottom: '2px solid #ddd', paddingBottom: '10px'}}>Dashboard Principal</h1>
        <p style={{marginTop: '20px', fontSize: '1.2rem'}}>Bienvenido al sistema de Almacén de Víveres.</p>
    </div>
); 

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Ruta de Inicio de Sesión (Sin Menú) */}
        <Route path="/" element={<InicioSesion />} /> 
        
        {/* Rutas Protegidas (Con el Menú del Layout) */}
        <Route path="/app" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="entradas" element={<Entradas />} />
          <Route path="salidas" element={<Salidas />} />
          <Route path="contratos" element={<Contratos />} />
          <Route path="recursos-financieros" element={<RecursosFinancieros />} />
          <Route path="programacion-mensual" element={<ProgramacionMensual />} />
          <Route path="entregas-mensuales" element={<EntregasMensuales />} />
          
          {/* Ruta para manejar páginas no encontradas dentro de la app */}
          <Route path="*" element={
            <div style={{padding: '30px', textAlign: 'center'}}>
                <h2>404 - Página no encontrada</h2>
            </div>
          } />
        </Route>
        
        {/* Si alguien intenta ir a una ruta no definida, lo mandamos al login */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;