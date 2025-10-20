import React, { useState, useMemo, useCallback, useEffect } from 'react';// --- CORRECCIÓN DE COMPATIBILIDAD ---
// Se eliminan los 'imports' de ESM ('import React from "react"') para asegurar la compatibilidad
// con entornos de ejecución (como Canvas) que cargan React y ReactDOM a través de etiquetas <script>.
// En dichos entornos, 'React' y 'ReactDOM' están disponibles como variables globales.
const { useState, useMemo, useEffect, useCallback } = React;

// --- ARQUITECTURA: THEME Y ESTILOS CENTRALIZADOS ---
// Se define un objeto 'theme' para centralizar los tokens de diseño (colores, espaciado, etc.).
const theme = {
  colors: {
    primary: '#4f46e5', // Indigo
    primaryLight: 'rgba(79, 70, 229, 0.1)',
    secondary: '#10b981', // Green
    warning: '#f59e0b', // Amber
    danger: '#ef4444', // Red
    info: '#5b21b6', // Violet
    background: '#f8fafc',
    surface: '#ffffff',
    text: '#1f2937',
    textSecondary: '#6b7280',
    border: '#e5e7eb',
  },
};

// --- ICONOS SVG EMBEDIDOS (Ligeros y adaptados al diseño de la imagen) ---
const DashboardIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="9"></rect><rect x="14" y="3" width="7" height="5"></rect><rect x="14" y="12" width="7" height="9"></rect><rect x="3" y="16" width="7" height="5"></rect></svg>
);
const ContractsIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
);
const PackageIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path><path d="M12 15V3"></path><path d="M15 6 12 3 9 6"></path></svg>);
const TruckIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 18H3c-1.1 0-2-.9-2-2V8c0-1.1.9-2 2-2h3"></path><path d="M15 18h2c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-3"></path><path d="M7 18V6"></path><path d="M13 18V6"></path><path d="M10 22h4"></path><path d="M10 18h4"></path></svg>);
const WarningIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>);
const MinusCircleIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="8" y1="12" x2="16" y2="12"></line></svg>);
const DollarSignIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>);
const SearchIcon = () => (<svg className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>);
const XIcon = () => (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>);
const ChevronLeftIcon = () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>);
const ChevronRightIcon = () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>);


// --- DATOS MOCK (Simulando una base de datos más completa) ---
const proveedores = [
    { id: 1, name: "ARTICULOS MEDICOS Y HOSPITALARIOS S.A. DE C.V." }, { id: 2, name: "BANUELOS AREVALO MARIA DOLORES" }, { id: 3, name: "BUENISSIMO MEAT, S.A. DE C.V." }, { id: 4, name: "CHIC & CHICKEN SA DE CV" }, { id: 5, name: "COMERCIALIZADORA ELECTROPURA, S. DE R. L. DE C. V." }, { id: 6, name: "CORPORATIVO DAAGALBA, S.A. DE C.V." }, { id: 7, name: "MORALES RIOS FELIPE DE JESUS" }, { id: 8, name: "NUNEZ DE LA O ALFONSO" }, { id: 9, name: "PENA PENA FRANCISCA LETICIA" }, { id: 10, name: "TMEDIC DISTRIBUIDORA DE MEDICAMENTOS S.A. DE C.V." }
];
const licitaciones = [ { id: 1, identifier: "LPL02/2025" }, { id: 2, identifier: "LPL05/2025" }, { id: 3, identifier: "LPL25/2025" }, { id: 4, identifier: "LPN04/2025" } ];
const productos = [
    { id: 1, code: 2212012004, description: "FORMULA LIQUIDA PARA PREMATUROS", price: 33.04, iva: 0, ieps: 0 }, { id: 2, code: 2212012008, description: "FORMULA INFANTIL A BASE DE SOYA", price: 202.72, iva: 0, ieps: 0 }, { id: 3, code: 2212012010, description: "FORMULA INFANTIL PREMATUROS BAJO PESO", price: 144.44, iva: 0, ieps: 0 }, { id: 4, code: 2212002003, description: "BISTECK DE RES AGUAYON", price: 170.0, iva: 0, ieps: 0 }, { id: 5, code: 2212006004, description: "HUEVO KILO", price: 40.5, iva: 0, ieps: 0 }, { id: 6, code: 2212001032, description: "GALLETA SURTIDO RICO 436 GRS", price: 62, iva: 0, ieps: 8 }, { id: 7, code: 2212005016, description: "MANTEQUILLA CON SAL EN BARRA KILO", price: 140, iva: 0, ieps: 0 }, { id: 8, code: 2212008010, description: "PAN BLANCO DE CAJA GRANDE", price: 46, iva: 0, ieps: 0 }, { id: 9, code: 2212001167, description: "AGUA PURIFICADA GARRAFON 20 LTS", price: 32, iva: 0, ieps: 0 }, { id: 10, code: 2212010035, description: "JITOMATE SALADET", price: 22, iva: 0, ieps: 0 }, { id: 11, code: 2212010008, description: "AGUACATE", price: 75, iva: 0, ieps: 0 }, { id: 12, code: 2212002005, description: "CARNE DE RES PARA COCIDO", price: 148, iva: 0, ieps: 0 }
];
const contratos = [
    { tender_id: 1, provider_id: 1, product_id: 1, cantidad: 16800, consumido: 6452, disponible: 10348 }, { tender_id: 1, provider_id: 1, product_id: 2, cantidad: 120, consumido: 110, disponible: 10 }, { tender_id: 2, provider_id: 2, product_id: 3, cantidad: 3000, consumido: 2980, disponible: 20 }, { tender_id: 2, provider_id: 2, product_id: 4, cantidad: 1800, consumido: 1800, disponible: 0 }, { tender_id: 3, provider_id: 3, product_id: 5, cantidad: 5000, consumido: 2500, disponible: 2500 }, { tender_id: 3, provider_id: 3, product_id: 6, cantidad: 1500, consumido: 750, disponible: 750 }, { tender_id: 1, provider_id: 4, product_id: 7, cantidad: 4000, consumido: 1000, disponible: 3000 }, { tender_id: 2, provider_id: 5, product_id: 8, cantidad: 10000, consumido: 9500, disponible: 500 }, { tender_id: 3, provider_id: 1, product_id: 9, cantidad: 8000, consumido: 2000, disponible: 6000 }, { tender_id: 1, provider_id: 2, product_id: 10, cantidad: 1200, consumido: 300, disponible: 900 }, { tender_id: 2, provider_id: 3, product_id: 1, cantidad: 500, consumido: 100, disponible: 400 }, { tender_id: 4, provider_id: 6, product_id: 11, cantidad: 2000, consumido: 1950, disponible: 50 }, { tender_id: 4, provider_id: 7, product_id: 12, cantidad: 350, consumido: 350, disponible: 0 }
];


// --- COMPONENTES DE LA UI ---

function StatCard({ title, value, icon: Icon, color, iconColor }) {
  // Colores para el fondo semitransparente del icono (basado en el diseño de la imagen)
  const bgColors = {
      '#4f46e5': 'bg-indigo-50', // Primary
      '#10b981': 'bg-green-50', // Secondary
      '#f59e0b': 'bg-amber-50', // Warning
      '#ef4444': 'bg-red-50',   // Danger
      '#5b21b6': 'bg-violet-50'  // Info
  };
  
  const iconWrapperStyle = `rounded-xl w-14 h-14 flex items-center justify-center ${bgColors[color] || 'bg-gray-100'}`;

  return (
    <div className="bg-white p-5 rounded-xl shadow-md flex items-center gap-4 transition-all duration-300 hover:shadow-lg hover:scale-[1.01] border-l-4" style={{ borderColor: color }}>
      
      {/* Icono con fondo púrpura claro */}
      <div className={iconWrapperStyle}>
         {/* El icono usa el color principal del tema */}
         {React.cloneElement(Icon, { style: { color: iconColor || color, width: '28px', height: '28px' }})}
      </div>
      
      <div className='flex flex-col justify-center h-full'>
        <p className="text-sm font-medium text-gray-500">{title}</p>
        <p className="text-3xl font-bold text-gray-800">{value}</p>
      </div>
    </div>
  );
}

function StockProgressBar({ disponible, cantidad }) {
  if (cantidad === 0) return <div className="text-xs text-gray-400">N/A</div>;
  const percentage = (disponible / cantidad) * 100;
  let color = theme.colors.secondary;
  if (percentage < 20) color = theme.colors.danger;
  else if (percentage < 50) color = theme.colors.warning;
  return (
    <div className="w-full bg-gray-200 rounded-full h-2.5">
      <div className="h-2.5 rounded-full transition-all duration-500" style={{ width: `${percentage}%`, backgroundColor: color }}></div>
    </div>
  );
}

// Componente de Gráfico de Dona sin dependencias, renderizado con SVG para máxima portabilidad.
function DonutChart({ data }) {
    const totalValue = useMemo(() => data.reduce((sum, item) => sum + item.value, 0), [data]);
    let cumulativePercentage = 0;

    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-full flex flex-col">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Distribución por Proveedor</h2>
            <div className="flex-grow flex items-start justify-between md:flex-row flex-col gap-6">
                
                {/* Contenedor del Donut Chart */}
                <div className="relative w-48 h-48 flex-shrink-0 mx-auto md:mx-0">
                    <svg viewBox="0 0 36 36" className="transform -rotate-90">
                        <circle cx="18" cy="18" r="15.915" className="stroke-current text-gray-200" fill="transparent" strokeWidth="3"></circle>
                        {data.map(item => {
                            const percentage = (item.value / totalValue) * 100;
                            const offset = cumulativePercentage;
                            cumulativePercentage += percentage;
                            return (
                                <circle key={item.name} cx="18" cy="18" r="15.915" fill="transparent"
                                    strokeWidth="3.5"
                                    stroke={item.color}
                                    strokeDasharray={`${percentage} 100`}
                                    strokeDashoffset={-offset}
                                    className="transition-all duration-500 ease-in-out"></circle>
                            );
                        })}
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-xs text-gray-500">Valor Total</span>
                        <span className="text-xl font-bold text-gray-800">{totalValue.toLocaleString('es-MX', { style: 'currency', currency: 'MXN', notation: 'compact' })}</span>
                    </div>
                </div>
                
                {/* Leyenda y Detalles */}
                <div className="overflow-y-auto max-h-60 pr-2 w-full md:w-auto flex-1">
                    <ul className="space-y-2">
                        {data.map(item => (
                            <li key={item.name} className="flex items-center justify-between text-sm">
                                <div className="flex items-center gap-2">
                                    <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }}></span>
                                    <span className="font-medium text-gray-700 truncate max-w-40" title={item.name}>{item.name}</span>
                                </div>
                                <div className='text-right'>
                                    <span className="font-bold text-gray-800 block">{item.value.toLocaleString('es-MX', { style: 'currency', currency: 'MXN', minimumFractionDigits: 0 })}</span>
                                    <span className="text-xs text-gray-500">({(item.value / totalValue * 100).toFixed(1)}%)</span>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
}

function DetalleProductoModal({ product, onClose }) {
  if (!product) return null;
  const productContracts = contratos.filter(c => c.product_id === product.id);
  const precioFinal = product.price * (1 + product.iva / 100) * (1 + product.ieps / 100);
  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 animate-fade-in" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl m-4 text-gray-800 animate-fade-in-up" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-5 border-b border-gray-200">
          <h3 className="text-xl font-semibold text-gray-800">Detalle del Producto</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-800 transition-colors rounded-full w-8 h-8 flex items-center justify-center hover:bg-gray-100"><XIcon /></button>
        </div>
        <div className="p-6 max-h-[70vh] overflow-y-auto">
          <div className="mb-6"><p className="text-sm font-semibold uppercase" style={{ color: theme.colors.primary }}>Código: {product.code}</p><h4 className="text-2xl font-bold text-gray-900">{product.description}</h4></div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-5 border-t border-gray-100 mb-6">
            <div className="bg-gray-50 p-4 rounded-lg text-center"><p className="text-sm font-medium text-gray-500">Precio Unitario</p><p className="text-xl font-semibold text-gray-800">{product.price.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })}</p></div>
            <div className="bg-gray-50 p-4 rounded-lg text-center"><p className="text-sm font-medium text-gray-500">IVA</p><p className="text-xl font-semibold text-gray-800">{product.iva}%</p></div>
            <div className="bg-gray-50 p-4 rounded-lg text-center"><p className="text-sm font-medium text-gray-500">IEPS</p><p className="text-xl font-semibold text-gray-800">{product.ieps}%</p></div>
            <div className="bg-green-50 p-4 rounded-lg text-center"><p className="text-sm font-medium text-green-700">Precio Final</p><p className="text-xl font-bold text-green-600">{precioFinal.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })}</p></div>
          </div>
          <div>
            <h5 className="text-lg font-semibold text-gray-800 mb-3">Contratos Asociados</h5>
            <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white max-h-64"><table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-100 sticky top-0"><tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Licitación</th><th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Proveedor</th><th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Total</th><th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Consumido</th><th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Disponible</th>
                </tr></thead>
                <tbody className="divide-y divide-gray-200">
                  {productContracts.map((item, index) => (<tr key={index} className="hover:bg-indigo-50">
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">{licitaciones.find(l => l.id === item.tender_id)?.identifier}</td><td className="px-4 py-3 whitespace-nowrap text-sm text-gray-800 font-medium">{proveedores.find(p => p.id === item.provider_id)?.name}</td><td className="px-4 py-3 whitespace-nowrap text-center text-sm text-gray-500">{item.cantidad.toLocaleString()}</td><td className="px-4 py-3 whitespace-nowrap text-center text-sm text-gray-500">{item.consumido.toLocaleString()}</td><td className="px-4 py-3 whitespace-nowrap text-center text-sm font-bold" style={{ color: theme.colors.primary }}>{item.disponible.toLocaleString()}</td>
                  </tr>))}
                </tbody>
            </table></div>
          </div>
        </div>
      </div>
    </div>
  );
}

// --- VISTAS PRINCIPALES ---

function PanelDeControl() {
  const stats = useMemo(() => {
    const lowStockThreshold = 0.2;
    const valorTotalContratos = contratos.reduce((acc, c) => acc + (productos.find(p => p.id === c.product_id)?.price || 0) * c.cantidad, 0);
    return {
      productosTotales: productos.length,
      proveedoresTotales: proveedores.length,
      stockBajo: contratos.filter(c => c.cantidad > 0 && (c.disponible / c.cantidad) < lowStockThreshold && c.disponible > 0).length,
      agotados: contratos.filter(c => c.disponible === 0).length,
      valorTotalContratos: valorTotalContratos,
    };
  }, []);
  
  const distribucionPorProveedor = useMemo(() => {
    // Colores usados en el gráfico de dona (inspirados en la imagen)
    const colors = ['#84CC16', '#EC4899', '#F59E0B', '#10B981', '#7C3AED', '#3B82F6', '#D946EF', '#4F46E5', '#A78BFA', '#F472B6'];
    const distributionMap = new Map();
    const productsMap = new Map(productos.map(p => [p.id, p]));

    contratos.forEach(c => {
        const product = productsMap.get(c.product_id);
        const provider = proveedores.find(p => p.id === c.provider_id);
        const value = (product?.price || 0) * c.cantidad;
        
        if (distributionMap.has(c.provider_id)) {
            distributionMap.get(c.provider_id).value += value;
        } else {
            distributionMap.set(c.provider_id, {
                name: provider?.name || 'Desconocido',
                value: value,
                providerId: c.provider_id,
            });
        }
    });

    return Array.from(distributionMap.values())
        .filter(p => p.value > 0)
        .sort((a,b) => b.value - a.value)
        .map((p, index) => ({
            ...p,
            color: colors[index % colors.length]
        }));
  }, []);

  const inventarioCritico = useMemo(() => {
    return contratos.filter(c => c.cantidad > 0).map(c => {
        const product = productos.find(p => p.id === c.product_id);
        const provider = proveedores.find(p => p.id === c.provider_id);
        return {
            ...c,
            productName: product?.description || 'N/A',
            providerName: provider?.name || 'N/A',
            percentage: c.disponible / c.cantidad
        };
    }).sort((a, b) => a.percentage - b.percentage).slice(0, 5);
  }, []);

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Encabezado Principal */}
      <h1 className="text-3xl font-bold text-gray-800">Panel de Control</h1>
      
      {/* Tarjetas de Métricas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
        <StatCard title="Productos Totales" value={stats.productosTotales} icon={<PackageIcon />} color={theme.colors.primary} />
        <StatCard title="Proveedores Totales" value={stats.proveedoresTotales} icon={<TruckIcon />} color={theme.colors.secondary} />
        <StatCard title="Stock Bajo" value={stats.stockBajo} icon={<WarningIcon />} color={theme.colors.warning} />
        <StatCard title="Agotados" value={stats.agotados} icon={<MinusCircleIcon />} color={theme.colors.danger} />
        <StatCard title="Valor Total Contratos" value={stats.valorTotalContratos.toLocaleString('es-MX', { style: 'currency', currency: 'MXN', notation: 'compact' })} icon={<DollarSignIcon />} color={theme.colors.info} iconColor={theme.colors.info} />
      </div>
      
      {/* Contenido Principal (Gráfico y Críticos) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Gráfico de Distribución (2/3 de ancho) */}
        <div className="lg:col-span-2"><DonutChart data={distribucionPorProveedor} /></div>
        
        {/* Niveles de Inventario Críticos (1/3 de ancho) */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Niveles de Inventario Críticos</h2>
          <div className="space-y-3">
            {inventarioCritico.length > 0 ? (
                inventarioCritico.map(item => (
                    <div key={`${item.product_id}-${item.provider_id}`} className="p-3 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors">
                        <p className="font-semibold text-sm text-gray-800 truncate" title={item.productName}>{item.productName}</p>
                        <p className="text-xs text-gray-500 mb-2">{item.providerName}</p>
                         <div className="flex justify-between items-center text-xs">
                            <span className="font-bold text-gray-800">{item.disponible.toLocaleString()}</span>
                            <span className="text-gray-500">de {item.cantidad.toLocaleString()}</span>
                         </div>
                        <StockProgressBar disponible={item.disponible} cantidad={item.cantidad} />
                    </div>
                ))
            ) : (
                 <div className="text-center py-8">
                    <p className="text-gray-500">No hay ítems críticos.</p>
                </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function GestionContratos() {
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedProductId, setSelectedProductId] = useState(null);
    const itemsPerPage = 10;
    
    const contratosConNombres = useMemo(() => contratos.map(c => ({ ...c, productName: productos.find(p => p.id === c.product_id)?.description || 'N/A', providerName: proveedores.find(p => p.id === c.provider_id)?.name || 'N/A', licitacionIdentifier: licitaciones.find(l => l.id === c.tender_id)?.identifier || 'N/A' })), []);

    const filteredData = useMemo(() => {
        const lowercasedFilter = searchTerm.toLowerCase();
        return contratosConNombres.filter(item => item.productName.toLowerCase().includes(lowercasedFilter) || item.providerName.toLowerCase().includes(lowercasedFilter) || item.licitacionIdentifier.toLowerCase().includes(lowercasedFilter));
    }, [searchTerm, contratosConNombres]);

    const paginatedData = useMemo(() => filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage), [filteredData, currentPage, itemsPerPage]);
    const totalPages = Math.ceil(filteredData.length / itemsPerPage);
    const handleRowClick = useCallback(productId => setSelectedProductId(productId), []);
    const handleCloseModal = useCallback(() => setSelectedProductId(null), []);
    const selectedProduct = useMemo(() => productos.find(p => p.id === selectedProductId), [selectedProductId]);

    return (
        <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-sm border border-gray-100 h-full flex flex-col animate-fade-in">
            <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
                <h3 className="text-xl font-bold text-gray-800">Detalle de Contratos y Consumos</h3>
                <div className="relative w-full sm:w-auto"><SearchIcon /><input type="text" placeholder="Buscar por producto, proveedor..." value={searchTerm} onChange={e => {setSearchTerm(e.target.value); setCurrentPage(1);}} className="bg-gray-50 border border-gray-200 rounded-lg py-2.5 pl-10 pr-4 w-full sm:w-80 focus:ring-2 focus:ring-indigo-400 focus:border-indigo-500 transition-all duration-200"/></div>
            </div>
            <div className="flex-1 overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50"><tr>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Producto</th><th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Proveedor</th><th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Licitación</th><th className="px-6 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Disponible</th><th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Estado de Stock</th>
                    </tr></thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {paginatedData.map((item, index) => (
                            <tr key={`${item.product_id}-${item.provider_id}-${index}`} onClick={() => handleRowClick(item.product_id)} className="hover:bg-indigo-50 transition-colors duration-200 cursor-pointer group">
                                <td className="px-6 py-4 whitespace-nowrap"><div className="text-sm font-semibold text-gray-900 group-hover:text-indigo-600">{item.productName}</div></td><td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 truncate max-w-xs" title={item.providerName}>{item.providerName}</td><td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.licitacionIdentifier}</td><td className="px-6 py-4 whitespace-nowrap text-center text-sm font-bold text-gray-700">{item.disponible.toLocaleString()} / {item.cantidad.toLocaleString()}</td><td className="px-6 py-4 whitespace-nowrap"><StockProgressBar disponible={item.disponible} cantidad={item.cantidad} /></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                 {paginatedData.length === 0 && (<div className="text-center py-16 text-gray-500"><p className="font-semibold">No se encontraron resultados</p><p className="text-sm">Intenta con otro término de búsqueda.</p></div>)}
            </div>
            {totalPages > 1 && (
                <div className="pt-4 mt-4 border-t border-gray-200 flex items-center justify-between">
                    <span className="text-sm text-gray-600">Página <span className="font-semibold">{currentPage}</span> de <span className="font-semibold">{totalPages}</span></span>
                    <div className="inline-flex items-center space-x-2">
                        <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="flex items-center gap-2 px-4 h-9 text-sm font-medium bg-white border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"><ChevronLeftIcon /> Anterior</button>
                        <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="flex items-center gap-2 px-4 h-9 text-sm font-medium bg-white border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed">Siguiente <ChevronRightIcon /></button>
                    </div>
                </div>
            )}
            <DetalleProductoModal product={selectedProduct} onClose={handleCloseModal} />
        </div>
    );
}

// --- Componente de Navegación de Pestañas (Reemplaza al Sidebar) ---
function TabsComponent({ currentView, setView }) {
    const TabButton = ({ view, label, icon: Icon }) => (
        <button onClick={() => setView(view)} className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold transition-colors duration-200 border-b-2 ${currentView === view ? 'text-indigo-600 border-indigo-600' : 'text-gray-500 border-transparent hover:text-indigo-600 hover:border-gray-300'}`}>
            {Icon && React.cloneElement(Icon, { className: 'w-5 h-5' })}
            {label}
        </button>
    );

    return (
        <div className="flex border-b border-gray-200 bg-white px-6">
            <TabButton view="dashboard" label="Panel de Control" icon={<DashboardIcon />} />
            <TabButton view="contracts" label="Contratos" icon={<ContractsIcon />} />
        </div>
    );
}


// --- COMPONENTE PRINCIPAL DE LA APLICACIÓN ---
function App() {
  const [currentView, setCurrentView] = useState('dashboard');
  
  // Encabezado de la aplicación (Módulo de Administración de Viveres)
  const Header = () => (
      <header className="h-20 bg-white/75 backdrop-blur-sm border-b border-gray-200 flex items-center px-6 justify-between sticky top-0 z-10">
          <div className='flex items-center'>
            <h2 className="text-xl font-bold text-gray-800 mr-4">Módulo de Contratos</h2>
            <p className="text-sm text-gray-500 hidden sm:block">Gestión de Viveres</p>
          </div>
          <div className="flex items-center space-x-4">
              <button className="text-gray-500 hover:text-indigo-600 transition-colors duration-200 rounded-full w-10 h-10 flex items-center justify-center hover:bg-gray-100">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
              </button>
              <div className="w-10 h-10 rounded-full ring-2 ring-offset-2 ring-indigo-500">
                  <img src="https://placehold.co/100x100/4f46e5/ffffff?text=U" alt="User Avatar" className="rounded-full w-full h-full object-cover"/>
              </div>
          </div>
      </header>
  );
  
  return (
    <div className="flex flex-col h-screen font-sans antialiased" style={{ backgroundColor: theme.colors.background }}>
      <Header />
      <TabsComponent currentView={currentView} setView={setCurrentView} />
      <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
        {currentView === 'dashboard' ? <PanelDeControl /> : <GestionContratos />}
      </main>
    </div>
  );
}

// --- RENDERIZADO DE LA APLICACIÓN ---
// Se fuerza la inicialización *después* de la carga completa de la página (window.onload) 
// y se utiliza el método moderno (createRoot) para eliminar conflictos de renderizado 
// y el TypeError relacionado con la disponibilidad de 'App'.
window.onload = function() {
    const container = document.getElementById('root');
    if (container && typeof ReactDOM.createRoot === 'function') {
        // Limpiar el contenedor (opcional, pero ayuda con conflictos)
        container.innerHTML = '';
        
        // Usar la API moderna de React 18
        ReactDOM.createRoot(container).render(<App />);
    } else if (container) {
        // Fallback para entornos antiguos que solo tienen ReactDOM.render
        ReactDOM.render(<App />, container);
    }
};

