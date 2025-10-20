import React, { useState, useMemo, useCallback, useEffect } from 'react';

// --- ICONS (Self-contained SVGs to remove dependencies) ---
const ICONS = {
  warehouse: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 21V7L12 1 2 7v14h20zM12 21V11"/></svg>,
  package: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10V5a2 2 0 00-2-2H5a2 2 0 00-2 2v5h18zM2 14h10v7H2v-7zm12 0h8v7h-8v-7z"/></svg>,
  truck: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="3" width="15" height="13"></rect><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon><circle cx="5.5" cy="18.5" r="2.5"></circle><circle cx="18.5" cy="18.5" r="2.5"></circle></svg>,
  settings: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z"/></svg>,
  power: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18.36 6.64a9 9 0 11-12.73 0"></path><line x1="12" y1="2" x2="12" y2="12"></line></svg>,
  camera: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path><circle cx="12" cy="13" r="4"></circle></svg>,
  calendar: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>,
  document: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>
};


// --- TYPE DEFINITIONS (JSDoc) ---
/**
 * @typedef {object} PurchaseOrderItem
 * @property {string} clave
 * @property {string} articulo
 * @property {number} cantidad_oc
 * @property {number} precio_simp
 * @property {string | null} fecha_programada
 */

/**
 * @typedef {object} PurchaseOrder
 * @property {string} id
 * @property {string} proveedor
 * @property {PurchaseOrderItem[]} items
 */

/**
 * @typedef {PurchaseOrderItem & {
 * cantidad_recibida: number | '',
 * lote: string,
 * caducidad: string,
 * status: 'A tiempo' | 'Atrasado' | 'Pendiente',
 * dias_atraso: number,
 * penalizacion_item: { monto: number, justificacion: string }
 * }} TableItem
 */

/**
 * @typedef {object} CalendarDay
 * @property {Date} date
 * @property {number} dayOfMonth
 * @property {boolean} isCurrentMonth
 * @property {boolean} isToday
 * @property {boolean} hasDelivery
 */

// --- MOCK DATA ---
const MOCK_PURCHASE_ORDERS = {
  '2025': [{
    id: '10401651',
    proveedor: 'PROVEEDOR EJEMPLO S.A. DE C.V.',
    items: [
        { clave: '2212008007', articulo: 'BOLLILO CON SAL DE 160 GRAMOS', cantidad_oc: 80, precio_simp: 10.00, fecha_programada: '2025-09-01' }, // Atrasado
        { clave: '2212008008', articulo: 'BOLLILO MINI SIN SAL DE 80 GRAMOS', cantidad_oc: 560, precio_simp: 4.90, fecha_programada: '2025-09-04' }, // Hoy/A tiempo
        { clave: '2212008011', articulo: 'PAN DULCE DE 100 GRAMOS', cantidad_oc: 4448, precio_simp: 10.80, fecha_programada: '2025-09-10' }, // Futuro
        { clave: '2212008028', articulo: 'BOLLILO FLEIMAN DE 150GR C/U', cantidad_oc: 600, precio_simp: 6.80, fecha_programada: null },
        { clave: '2212008029', articulo: 'CUERNITO (DAÑADO) DE 100 GRAMOS', cantidad_oc: 37, precio_simp: 10.90, fecha_programada: '2025-08-28' }, // Atrasado
        { clave: '2212008037', articulo: 'BOLLILO MINI CON SAL DE 80 GRAMOS', cantidad_oc: 2200, precio_simp: 4.90, fecha_programada: '2025-08-20' }, // Atrasado
    ]
  }],
  '2024': [{
    id: '2024-ABC',
    proveedor: 'PANIFICADORA LA LUZ',
    items: [
        { clave: 'P-001', articulo: 'CONCHA DE CHOCOLATE', cantidad_oc: 200, precio_simp: 8.50, fecha_programada: '2024-12-15' },
        { clave: 'P-002', articulo: 'OREJA DE HOJALDRE', cantidad_oc: 150, precio_simp: 9.00, fecha_programada: '2024-12-20' },
    ]
  }]
};

const TODAY = new Date('2025-09-04T00:00:00');

// --- DESIGN SYSTEM (CSS-in-JS) ---
const theme = {
  colors: {
    primary: '#007bff', // Azul brillante para botones principales
    primaryDark: '#0056b3',
    background: '#f8f9fa', // Gris muy claro
    surface: '#ffffff',
    textPrimary: '#212529',
    textSecondary: '#6c757d',
    border: '#ced4da',
    danger: '#dc3545',
    success: '#28a745',
    warning: '#ffc107',
    sidebar: '#343a40', // Sidebar oscuro
    sidebarText: '#dee2e6',
    headerBg: '#f8f9fa',
    tabActive: '#e9ecef', // Fondo de pestaña activa
  },
  spacing: { xs: '4px', sm: '8px', md: '16px', lg: '24px' },
  borderRadius: '4px',
  shadow: '0 .125rem .25rem rgba(0,0,0,.075)',
};

/** @type {{[key: string]: React.CSSProperties}} */
const styles = {
  // Eliminamos estilos de sidebar, adaptando el contenedor principal
  appContainer: { display: 'flex', height: '100vh', backgroundColor: theme.colors.background, fontFamily: 'sans-serif', fontSize: '14px', flexDirection: 'column' },
  mainContent: { flex: 1, display: 'flex', flexDirection: 'column', maxHeight: '100vh', width: '100%' },
  header: { backgroundColor: theme.colors.surface, boxShadow: theme.shadow, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: `${theme.spacing.sm} ${theme.spacing.lg}`, borderBottom: `1px solid ${theme.colors.border}`, flexShrink: 0 },
  contentArea: { flex: 1, padding: theme.spacing.md, overflowY: 'auto' },
  tabBar: { display: 'flex', borderBottom: `2px solid ${theme.colors.border}`, marginBottom: theme.spacing.md },
  tabButton: (isActive) => ({
      padding: '10px 15px',
      cursor: 'pointer',
      border: 'none',
      backgroundColor: isActive ? theme.colors.surface : theme.colors.background,
      borderTop: `2px solid ${theme.colors.border}`,
      borderLeft: `1px solid ${theme.colors.border}`,
      borderRight: `1px solid ${theme.colors.border}`,
      borderBottom: isActive ? `2px solid ${theme.colors.surface}` : 'none',
      transform: isActive ? 'translateY(2px)' : 'none',
      marginBottom: isActive ? '-2px' : '0',
      color: theme.colors.textPrimary,
      fontWeight: isActive ? 600 : 400,
      display: 'flex', alignItems: 'center', gap: theme.spacing.xs,
      borderRadius: `${theme.borderRadius} ${theme.borderRadius} 0 0`,
  }),
  formPanel: { backgroundColor: theme.colors.surface, padding: theme.spacing.md, border: `1px solid ${theme.colors.border}`, borderRadius: theme.borderRadius, boxShadow: theme.shadow },
  formGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: theme.spacing.md, alignItems: 'flex-end' },
  formGroup: { display: 'flex', flexDirection: 'column' },
  formLabel: { fontSize: '12px', fontWeight: 500, color: theme.colors.textSecondary, marginBottom: theme.spacing.xs },
  formInput: { width: '100%', padding: '8px', border: `1px solid ${theme.colors.border}`, borderRadius: theme.borderRadius, boxSizing: 'border-box' },
  formInputReadonly: { backgroundColor: theme.colors.background, cursor: 'not-allowed' },
  button: { padding: '8px 16px', border: 'none', borderRadius: theme.borderRadius, cursor: 'pointer', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: theme.spacing.sm, transition: 'background-color 0.2s' },
  buttonPrimary: { backgroundColor: theme.colors.primary, color: 'white' },
  buttonSecondary: { backgroundColor: '#e9ecef', color: theme.colors.textPrimary, border: `1px solid ${theme.colors.border}` },
  buttonWarning: { backgroundColor: theme.colors.warning, color: theme.colors.textPrimary },
  tablePanel: { marginTop: theme.spacing.md, border: `1px solid ${theme.colors.border}`, borderRadius: theme.borderRadius, boxShadow: theme.shadow, backgroundColor: theme.colors.surface, overflowX: 'auto' },
  table: { minWidth: '100%', borderCollapse: 'collapse' },
  tableHeader: { backgroundColor: '#e9ecef', color: theme.colors.textSecondary, fontSize: '12px', textTransform: 'uppercase', textAlign: 'left' },
  tableCell: { padding: '8px 12px', borderBottom: `1px solid ${theme.colors.border}`, borderRight: `1px solid ${theme.colors.border}`, verticalAlign: 'middle', whiteSpace: 'nowrap' },
  tableCellLast: { borderRight: 'none' },
  statusIndicator: { width: '12px', height: '12px', borderRadius: '50%', display: 'inline-block' },
  modalOverlay: { position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: theme.spacing.md },
  modalContent: { backgroundColor: theme.colors.surface, borderRadius: theme.borderRadius, boxShadow: '0 5px 15px rgba(0,0,0,.5)', width: '100%', maxWidth: '900px', maxHeight: '90vh', display: 'flex', flexDirection: 'column' },
  modalHeader: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: theme.spacing.md, borderBottom: `1px solid ${theme.colors.border}` },
  modalBody: { padding: theme.spacing.md, flex: 1, overflowY: 'auto' },
  notification: { position: 'fixed', top: theme.spacing.md, left: '50%', transform: 'translateX(-50%)', padding: '12px 20px', borderRadius: theme.borderRadius, color: 'white', boxShadow: '0 4px 12px rgba(0,0,0,0.2)', zIndex: 100, fontSize: '14px' },
  calendarGrid: { display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px', border: `1px solid ${theme.colors.border}`, padding: '4px', borderRadius: theme.borderRadius },
};

// --- REUSABLE SUB-COMPONENTS ---

/** @param {{items: TableItem[], onUpdate: Function}} props */
const ItemsTable = ({ items, onUpdate }) => {
    if (items.length === 0) {
        return <div style={{ textAlign: 'center', padding: theme.spacing.lg, color: theme.colors.textSecondary }}>Seleccione una orden y presione "Cargar Orden" para ver los artículos.</div>;
    }

    const getStatusStyle = (status) => ({
        'A tiempo': { backgroundColor: theme.colors.success },
        'Atrasado': { backgroundColor: theme.colors.danger },
        'Pendiente': { backgroundColor: theme.colors.warning },
    }[status]);

    return (
        <table style={styles.table}>
            <thead style={styles.tableHeader}>
                <tr>
                    <th colSpan={5} style={{...styles.tableCell, backgroundColor: '#f0f8ff', color: theme.colors.primary, borderBottom: `2px solid ${theme.colors.primary}` }}>Datos a Ingresar</th>
                    <th colSpan={4} style={{...styles.tableCell, ...styles.tableCellLast, backgroundColor: '#e2f0d9', color: theme.colors.success, borderBottom: `2px solid ${theme.colors.success}` }}>Orden de Compra</th>
                </tr>
                <tr style={{ fontWeight: 500 }}>
                    <th style={styles.tableCell}>Estado</th>
                    <th style={styles.tableCell}>Cant. Recibida</th>
                    <th style={styles.tableCell}>Lote</th>
                    <th style={styles.tableCell}>Caducidad</th>
                    <th style={styles.tableCell}>Penalización</th>
                    <th style={{...styles.tableCell, backgroundColor: '#f9fafb'}}>Clave</th>
                    <th style={{...styles.tableCell, backgroundColor: '#f9fafb'}}>Artículo</th>
                    <th style={{...styles.tableCell, backgroundColor: '#f9fafb'}}>Cant. O.C.</th>
                    <th style={{...styles.tableCell, ...styles.tableCellLast, backgroundColor: '#f9fafb'}}>Precio s/imp</th>
                </tr>
            </thead>
            <tbody>
                {items.map((row, index) => (
                    <tr key={row.clave} style={{backgroundColor: index % 2 === 0 ? theme.colors.surface : '#f9fafb'}}>
                        <td style={{ ...styles.tableCell, textAlign: 'center' }}>
                            <div style={{ ...styles.statusIndicator, ...getStatusStyle(row.status) }} title={`${row.status}${row.dias_atraso > 0 ? ` por ${row.dias_atraso} día(s)` : ''}`} />
                        </td>
                        <td style={styles.tableCell}><input type="number" value={row.cantidad_recibida} onChange={e => onUpdate(index, 'cantidad_recibida', e.target.valueAsNumber || 0)} style={{...styles.formInput, width: '80px', padding: '5px'}} /></td>
                        <td style={styles.tableCell}><input type="text" value={row.lote} onChange={e => onUpdate(index, 'lote', e.target.value)} style={{...styles.formInput, width: '120px', padding: '5px'}} /></td>
                        <td style={styles.tableCell}><input type="date" value={row.caducidad} onChange={e => onUpdate(index, 'caducidad', e.target.value)} style={{...styles.formInput, width: '130px', padding: '5px'}} /></td>
                        <td style={{ ...styles.tableCell, textAlign: 'right', color: theme.colors.danger, fontWeight: 500 }} title={row.penalizacion_item.justificacion}>
                            {(row.penalizacion_item.monto || 0).toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })}
                        </td>
                        <td style={{...styles.tableCell, backgroundColor: '#fcfcfc'}}>{row.clave}</td>
                        <td style={{...styles.tableCell, whiteSpace: 'normal', backgroundColor: '#fcfcfc'}}>{row.articulo}</td>
                        <td style={{ ...styles.tableCell, textAlign: 'right', backgroundColor: '#fcfcfc' }}>{row.cantidad_oc}</td>
                        <td style={{ ...styles.tableCell, ...styles.tableCellLast, textAlign: 'right', backgroundColor: '#fcfcfc' }}>
                            {row.precio_simp.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })}
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
};

const Notification = ({ message, type, onDismiss }) => {
    if (!message) return null;
    const baseStyle = styles.notification;
    const typeStyle = {
        success: { backgroundColor: theme.colors.success },
        error: { backgroundColor: theme.colors.danger },
        info: { backgroundColor: theme.colors.primary },
    }[type];

    return (
        <div style={{ ...baseStyle, ...typeStyle }}>
            {message}
            <button onClick={onDismiss} style={{ background: 'none', border: 'none', color: 'white', marginLeft: '16px', fontSize: '16px', cursor: 'pointer' }}>&times;</button>
        </div>
    );
};

/** @param {{day: CalendarDay, isSelected: boolean, onSelect: Function}} props */
const CalendarDayComponent = ({ day, isSelected, onSelect }) => {
    const { date, dayOfMonth, isCurrentMonth, isToday, hasDelivery } = day;

    const dayStyle = {
        padding: '8px',
        textAlign: 'center',
        cursor: 'pointer',
        borderRadius: theme.borderRadius,
        border: `1px solid ${isSelected ? theme.colors.primary : theme.colors.border}`,
        backgroundColor: hasDelivery ? '#e6f4e6' : isCurrentMonth ? theme.colors.surface : theme.colors.background,
        color: isCurrentMonth ? theme.colors.textPrimary : theme.colors.textSecondary,
        minHeight: '80px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'flex-start',
        position: 'relative',
        transition: 'background-color 0.2s',
    };

    const numberStyle = {
        fontWeight: isToday ? 700 : 400,
        backgroundColor: isToday ? theme.colors.primary : 'transparent',
        color: isToday ? 'white' : 'inherit',
        borderRadius: '50%',
        width: '24px',
        height: '24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: '4px',
    };

    return (
        <div style={dayStyle} onClick={() => onSelect(day)}>
            <span style={numberStyle}>{dayOfMonth}</span>
            {hasDelivery > 0 && <div style={{ fontSize: '10px', color: theme.colors.success }}>Entrega ({hasDelivery})</div>}
        </div>
    );
};


// --- CALENDAR MODAL COMPONENT ---

/** @param {{isVisible: boolean, onClose: Function, selectedOrder: PurchaseOrder, showNotification: Function}} props */
const CalendarModal = ({ isVisible, onClose, selectedOrder }) => {
    const [calendarViewDate, setCalendarViewDate] = useState(TODAY);
    const [selectedDay, setSelectedDay] = useState(null);

    const deliveriesByDate = useMemo(() => {
        const map = new Map();
        selectedOrder?.items.forEach(item => {
            if (item.fecha_programada) {
                if (!map.has(item.fecha_programada)) {
                    map.set(item.fecha_programada, []);
                }
                map.get(item.fecha_programada).push(item);
            }
        });
        return map;
    }, [selectedOrder]);

    const daysInCalendar = useMemo(() => {
        const year = calendarViewDate.getFullYear();
        const month = calendarViewDate.getMonth();
        const firstDayOfMonth = new Date(year, month, 1);
        const lastDayOfMonth = new Date(year, month + 1, 0);
        
        const days = [];
        const startDayOfWeek = firstDayOfMonth.getDay();
        for (let i = startDayOfWeek; i > 0; i--) { // Días del mes anterior
            days.push(new Date(year, month, 1 - i));
        }
        for (let i = 1; i <= lastDayOfMonth.getDate(); i++) { // Días del mes actual
            days.push(new Date(year, month, i));
        }
        const endDayOfWeek = lastDayOfMonth.getDay();
        for (let i = 1; i < 7 - endDayOfWeek; i++) { // Días del mes siguiente
            days.push(new Date(year, month + 1, i));
        }

        return days.map(date => ({
            date,
            dayOfMonth: date.getDate(),
            isCurrentMonth: date.getMonth() === month,
            isToday: date.toDateString() === TODAY.toDateString(),
            hasDelivery: deliveriesByDate.has(date.toISOString().split('T')[0]) ? deliveriesByDate.get(date.toISOString().split('T')[0]).length : 0,
        }));
    }, [calendarViewDate, deliveriesByDate]);

    const changeMonth = (offset) => {
        setCalendarViewDate(d => new Date(d.getFullYear(), d.getMonth() + offset, 1));
        setSelectedDay(null);
    };

    const handleSelectDay = (day) => {
        setSelectedDay(day);
    };

    const selectedDayDeliveries = selectedDay ? 
        deliveriesByDate.get(selectedDay.date.toISOString().split('T')[0]) || []
        : [];
        
    if (!isVisible) return null;

    return (
        <div style={styles.modalOverlay} onClick={onClose}>
            <div style={styles.modalContent} onClick={e => e.stopPropagation()}>
                <header style={styles.modalHeader}>
                    <h2 style={{ fontSize: '18px', fontWeight: 600 }}>Calendario de Entregas - {selectedOrder?.proveedor || 'Sin Orden Seleccionada'}</h2>
                    <div>
                        <button onClick={() => changeMonth(-1)} style={{ ...styles.buttonSecondary, padding: '6px 10px', marginRight: theme.spacing.sm }}>{'<'}</button>
                        <button onClick={() => changeMonth(1)} style={{ ...styles.buttonSecondary, padding: '6px 10px' }}>{'>'}</button>
                    </div>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: theme.colors.textSecondary }}>&times;</button>
                </header>
                <div style={styles.modalBody}>
                    <h3 style={{fontSize: '16px', fontWeight: 600, marginBottom: theme.spacing.sm}}>
                        {calendarViewDate.toLocaleDateString('es-MX', { month: 'long', year: 'numeric' }).replace(/^\w/, c => c.toUpperCase())}
                    </h3>
                    <div style={{ marginBottom: '8px', display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px', fontWeight: 600, color: theme.colors.textSecondary }}>
                        {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map(day => <div key={day} style={{ textAlign: 'center' }}>{day}</div>)}
                    </div>
                    <div style={styles.calendarGrid}>
                        {daysInCalendar.map(day => (
                            <CalendarDayComponent 
                                key={day.date.toISOString()} 
                                day={day} 
                                isSelected={selectedDay?.date.toDateString() === day.date.toDateString()}
                                onSelect={handleSelectDay}
                            />
                        ))}
                    </div>
                    {selectedDay && (
                        <div style={{marginTop: theme.spacing.lg, paddingTop: theme.spacing.md, borderTop: `1px solid ${theme.colors.border}`}}>
                            <h4 style={{fontSize: '14px', fontWeight: 600, color: theme.colors.textPrimary}}>Detalles para el {selectedDay.date.toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long' })}</h4>
                            {selectedDayDeliveries.length > 0 ? (
                                <ul style={{listStyle: 'disc', paddingLeft: theme.spacing.md, marginTop: theme.spacing.sm, fontSize: '13px'}}>
                                    {selectedDayDeliveries.map(item => (
                                        <li key={item.clave} style={{color: theme.colors.textPrimary}}>
                                            <span style={{fontWeight: 600}}>{item.clave}</span> - {item.articulo} (Cant. O.C.: {item.cantidad_oc})
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p style={{color: theme.colors.textSecondary, marginTop: theme.spacing.sm}}>No hay entregas programadas para este día.</p>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

// --- MAIN APP COMPONENT ---
export default function App() {
    const [almacen, setAlmacen] = useState('ALIMENTOS FAA');
    const [selectedYear, setSelectedYear] = useState('2025');
    const [selectedOrderId, setSelectedOrderId] = useState('');
    const [folioFactura, setFolioFactura] = useState('');
    const [fechaFactura, setFechaFactura] = useState('');
    const [folioRB, setFolioRB] = useState('RB-000000'); // Campo R.B. visible, pre-asignado a 0
    const [tableData, setTableData] = useState([]);
    const [qrItemUpdates, setQrItemUpdates] = useState({});
    const [isCalendarVisible, setCalendarVisible] = useState(false);
    const [notification, setNotification] = useState({ message: '', type: '' });
    
    // Simulación de último folio registrado para autoincremento
    // NOTA: En un entorno real, esto vendría de Firestore.
    const [lastRBNumber, setLastRBNumber] = useState(12345);

    const purchaseOrders = useMemo(() => MOCK_PURCHASE_ORDERS[selectedYear] || [], [selectedYear]);
    const selectedOrder = useMemo(() => purchaseOrders.find(order => order.id === selectedOrderId), [selectedOrderId, purchaseOrders]);

    const calculateItemStatus = useCallback((fechaProgramada) => {
        if (!fechaProgramada) return { status: 'Pendiente', dias_atraso: 0 };
        const fechaProg = new Date(fechaProgramada + 'T00:00:00');
        const diffTime = TODAY.getTime() - fechaProg.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        if (diffDays > 0) return { status: 'Atrasado', dias_atraso: diffDays };
        return { status: 'A tiempo', dias_atraso: 0 };
    }, []);

    const calculatePenalty = useCallback((item) => {
        if (item.status !== 'Atrasado' || !item.cantidad_recibida || item.cantidad_recibida <= 0) {
            return { monto: 0, justificacion: '' };
        }
        const { dias_atraso, cantidad_recibida, precio_simp } = item;
        let porcentaje = 0;
        if (dias_atraso >= 1 && dias_atraso <= 5) porcentaje = 3;
        else if (dias_atraso >= 6 && dias_atraso <= 10) porcentaje = 6;
        else if (dias_atraso >= 11) porcentaje = 10;
        
        const valorTotal = cantidad_recibida * precio_simp;
        const monto = valorTotal * (porcentaje / 100);
        return { monto, justificacion: `Atraso de ${dias_atraso} día(s). Se aplica ${porcentaje}%.` };
    }, []);

    const totalPenalty = useMemo(() => 
        tableData.reduce((acc, item) => acc + (item.penalizacion_item?.monto || 0), 0)
    , [tableData]);

    const showNotification = (message, type = 'info', duration = 3000) => {
        setNotification({ message, type });
        setTimeout(() => setNotification({ message: '', type: '' }), duration);
    };

    const handleLoadOrder = useCallback(() => {
        if (!selectedOrder) {
            showNotification("Por favor, seleccione una orden de compra.", "error");
            setTableData([]);
            return;
        }
        const newTableData = selectedOrder.items.map(item => {
            const { status, dias_atraso } = calculateItemStatus(item.fecha_programada);
            return {
                ...item,
                cantidad_recibida: '', lote: '', caducidad: '',
                status, dias_atraso,
                penalizacion_item: { monto: 0, justificacion: '' },
            };
        });
        setTableData(newTableData);
        showNotification(`Orden ${selectedOrder.id} cargada exitosamente.`, "success");
    }, [selectedOrder, calculateItemStatus]);

    const updateTableData = useCallback((index, field, value) => {
        setTableData(prevData => {
            const newData = [...prevData];
            const updatedItem = { ...newData[index], [field]: value };
            if (field === 'cantidad_recibida') {
                updatedItem.penalizacion_item = calculatePenalty(updatedItem);
            }
            newData[index] = updatedItem;
            return newData;
        });
    }, [calculatePenalty]);
    
    // --- SIDE EFFECTS ---
    useEffect(() => {
        if (selectedOrderId) handleLoadOrder();
        else setTableData([]);
    }, [selectedOrderId, handleLoadOrder]);

    useEffect(() => {
        if (Object.keys(qrItemUpdates).length > 0 && tableData.length > 0) {
            setTableData(prevData => prevData.map(row => {
                if (qrItemUpdates[row.clave]) {
                    const updatedItem = { ...row, ...qrItemUpdates[row.clave] };
                    updatedItem.penalizacion_item = calculatePenalty(updatedItem);
                    return updatedItem;
                }
                return row;
            }));
            setQrItemUpdates({}); 
        }
    }, [tableData, qrItemUpdates, calculatePenalty]);

    // --- HANDLERS ---
    const handleScanQR = useCallback(() => {
        const qrString = "10401651]2025-09-03]FAC-XYZ-789Ç2212008007|80|LOTE-A1|2026-09-01Ç2212008029|30|LOTE-B2|2026-08-28";
        try {
            const [orderId, fecha, factAndItems] = qrString.split(']');
            const [factura, ...itemsParts] = factAndItems.split('Ç');
            
            setSelectedYear(TODAY.getFullYear().toString());
            setSelectedOrderId(orderId);
            setFechaFactura(fecha);
            setFolioFactura(factura);

            const updates = {};
            itemsParts.forEach(itemStr => {
                const [clave, cantidad, lote, caducidad] = itemStr.split('|');
                if (clave) {
                    updates[clave] = {
                        cantidad_recibida: Number(cantidad) || 0,
                        lote: lote || '',
                        caducidad: caducidad || ''
                    };
                }
            });
            setQrItemUpdates(updates);
            showNotification("QR procesado y datos cargados.", "success");
        } catch (error) {
            console.error("Error al procesar QR:", error);
            showNotification("El formato del código QR no es válido.", "error");
        }
    }, []);

    const handleRegisterEntry = () => {
        if (!tableData.some(item => item.cantidad_recibida > 0)) {
            showNotification("No hay cantidades recibidas para registrar.", "error");
            return;
        }

        // 1. Lógica de Autoincremento de Folio R.B.
        const newRBNumber = lastRBNumber + 1;
        const newFolioRB = `RB-${String(newRBNumber).padStart(6, '0')}`;
        setLastRBNumber(newRBNumber); // Actualizar el último número
        setFolioRB(newFolioRB);      // Mostrar el nuevo folio asignado

        // 2. Data Assembly (incluyendo el nuevo folio)
        const entryData = {
            folio_rb: newFolioRB, // Campo asignado
            almacen,
            ordenCompra: selectedOrderId,
            folioFactura,
            fechaFactura,
            penalizacionTotal: totalPenalty,
            items: tableData.filter(item => item.cantidad_recibida > 0)
        };
        console.log("--- REGISTRO DE ENTRADA GENERADO ---", JSON.stringify(entryData, null, 2));
        showNotification(`Entrada registrada exitosamente. Folio R.B.: ${newFolioRB}`, "success");

        // Opcional: Limpiar el formulario después del registro
        // setTableData([]);
        // setFolioFactura('');
        // setFechaFactura('');
    };

    return (
        // El contenedor principal ahora ocupa el 100% sin barra lateral
        <div style={styles.appContainer}> 
            <Notification message={notification.message} type={notification.type} onDismiss={() => setNotification({message: '', type: ''})} />
            
            <main style={styles.mainContent}>
                <header style={styles.header}>
                    <h1 style={{fontSize: '18px', fontWeight: 600, color: theme.colors.textPrimary}}>Recepción de Mercancía</h1>
                    <div style={{ color: theme.colors.textSecondary }}>Usuario: Oscar B.G.</div>
                </header>

                <div style={styles.contentArea}>
                    
                    {/* Tabs Area */}
                    <div style={styles.tabBar}>
                        <button style={styles.tabButton(true)}>{ICONS.document} Entradas</button>
                        <button style={styles.tabButton(false)}>{ICONS.document} Ingresar Facturas RS</button>
                        <button style={styles.tabButton(false)}>{ICONS.document} Facturas Ingresadas</button>
                    </div>

                    <section style={styles.formPanel}>
                        {/* Form Inputs (Añadido R.B.) */}
                        <div style={styles.formGrid}>
                             {/* CAMPO R.B. (Nuevo) */}
                            <div style={styles.formGroup}>
                                <label style={styles.formLabel}>R.B. (Recepción Bodega)</label>
                                <input type="text" readOnly value={folioRB} style={{...styles.formInput, ...styles.formInputReadonly, fontWeight: 700}}/>
                            </div>
                            <div style={styles.formGroup}>
                                <label style={styles.formLabel}>Almacen *</label>
                                <select value={almacen} onChange={e => setAlmacen(e.target.value)} style={styles.formInput}>
                                    <option>ALIMENTOS FAA</option>
                                    <option>ALMACEN GENERAL</option>
                                </select>
                            </div>
                            <div style={styles.formGroup}>
                                <label style={styles.formLabel}>Año</label>
                                <select value={selectedYear} onChange={e => { setSelectedYear(e.target.value); setSelectedOrderId(''); }} style={styles.formInput}>
                                    {Object.keys(MOCK_PURCHASE_ORDERS).sort((a,b) => Number(b)-Number(a)).map(year => <option key={year} value={year}>{year}</option>)}
                                </select>
                            </div>
                            <div style={styles.formGroup}>
                                <label style={styles.formLabel}>No. de Orden</label>
                                <select value={selectedOrderId} onChange={e => setSelectedOrderId(e.target.value)} style={styles.formInput} disabled={!selectedYear}>
                                    <option value="">Seleccionar...</option>
                                    {purchaseOrders.map(order => <option key={order.id} value={order.id}>{order.id}</option>)}
                                </select>
                            </div>
                            <div style={{...styles.formGroup, gridColumn: 'span 2'}}>
                                <label style={styles.formLabel}>Proveedor</label>
                                <input type="text" readOnly value={selectedOrder?.proveedor || ''} style={{...styles.formInput, ...styles.formInputReadonly}}/>
                            </div>
                            <div style={styles.formGroup}>
                                <label style={styles.formLabel}>Folio Factura</label>
                                <input type="text" value={folioFactura} onChange={e => setFolioFactura(e.target.value)} style={styles.formInput}/>
                            </div>
                            <div style={styles.formGroup}>
                                <label style={styles.formLabel}>Fecha Factura</label>
                                <input type="date" value={fechaFactura} onChange={e => setFechaFactura(e.target.value)} style={styles.formInput}/>
                            </div>
                        </div>
                        
                        {/* Action Buttons & Penalty Summary (Bottom Row) */}
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: theme.spacing.md, marginTop: theme.spacing.md, borderTop: `1px solid ${theme.colors.border}`, paddingTop: theme.spacing.md, alignItems: 'center' }}>
                            <div style={{ flex: '1 1 auto', display: 'flex', gap: theme.spacing.sm, flexWrap: 'wrap' }}>
                                <button onClick={handleScanQR} style={{...styles.button, ...styles.buttonWarning}}>{ICONS.camera} Escanear QR</button>
                                <button onClick={handleLoadOrder} style={{...styles.button, ...styles.buttonSecondary}}>Cargar Orden</button>
                                <button onClick={() => selectedOrder ? setCalendarVisible(true) : showNotification("Seleccione una orden para ver el calendario.", "info")} style={{...styles.button, ...styles.buttonSecondary}}>{ICONS.calendar} Ver Calendario de Entregas</button>
                            </div>
                            <div style={{display: 'flex', alignItems: 'center', gap: theme.spacing.lg, flex: '1 1 300px', justifyContent: 'flex-end'}}>
                                <div style={{textAlign: 'right'}}>
                                    <span style={{...styles.formLabel, fontSize: '14px', color: theme.colors.danger}}>Penalización Total:</span>
                                    <span style={{ fontSize: '20px', fontWeight: 'bold', color: theme.colors.danger, display: 'block' }}>
                                        {totalPenalty.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })}
                                    </span>
                                </div>
                                <button onClick={handleRegisterEntry} style={{...styles.button, ...styles.buttonPrimary}}>Registrar Entrada</button>
                            </div>
                        </div>
                    </section>
                    
                    <section style={styles.tablePanel}>
                        <ItemsTable items={tableData} onUpdate={updateTableData} />
                    </section>
                </div>
            </main>
            
            <CalendarModal 
                isVisible={isCalendarVisible} 
                onClose={() => setCalendarVisible(false)} 
                selectedOrder={selectedOrder}
            />
        </div>
    );
}

