import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// --- Importa tus componentes de la carpeta 'pages' ---
import Layout from './components/Layout';
import InicioSesion from './pages/InicioSesion';
// Crea un componente simple para el Dashboard por ahora
const Dashboard = () => <div style={{fontSize: '2rem', fontWeight: 'bold'}}>Dashboard Principal</div>; 

// Asegúrate de que tus archivos en src/pages/ exporten su componente principal como 'export default'
import Contratos from './pages/Contratos'; 
import Entradas from './pages/Entradas';
import Salidas from './pages/Salidas';
import RecursosFinancieros from './pages/RecursosFinancieros';
import ProgramacionMensual from './pages/ProgramacionMensual';
import EntregasMensuales from './pages/EntregasMensuales';


function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* 1. Ruta de Inicio de Sesión (Sin Layout/Menú) */}
        {/* Usamos path="/" para que sea la página de bienvenida/login */}
        <Route path="/" element={<InicioSesion />} /> 
        
        {/* 2. Rutas Protegidas (Con Layout/Menú) */}
        <Route path="/app" element={<Layout />}>
          <Route index element={<Dashboard />} /> {/* Ruta: /app */}
          <Route path="inventario" element={<Dashboard />} /> {/* Temporal, no tienes vista de inventario aún */}
          
          {/* Módulos principales */}
          <Route path="entradas" element={<Entradas />} />
          <Route path="salidas" element={<Salidas />} />
          <Route path="contratos" element={<Contratos />} />
          <Route path="financieros" element={<RecursosFinancieros />} />
          <Route path="programacion" element={<ProgramacionMensual />} />
          <Route path="entregas" element={<EntregasMensuales />} />
          
          {/* Puedes agregar una ruta para manejo de 404 si el path no existe */}
          <Route path="*" element={
            <div style={{padding: '30px', textAlign: 'center'}}>
                <h2>404 - Página no encontrada</h2>
                <p>La ruta a la que intentas acceder no existe.</p>
            </div>
          } />
        </Route>
        
        {/* Redirección para cualquier otra ruta que no coincida */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;