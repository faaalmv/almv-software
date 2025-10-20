import React, { useState, useMemo, useEffect, useCallback, useRef, memo, FC } from 'react';

//==============================================================================
// 1. TIPOS Y CONSTANTES
//==============================================================================

type DeliveryStatus = 'Pendiente' | 'En Camino' | 'Entregado' | 'Rechazado';
type Priority = 'Alta' | 'Media' | 'Baja'; // Nuevo tipo de prioridad

interface Delivery {
  id: string;
  proveedor: string;
  fecha: string; // Formato YYYY-MM-DD
  descripcion: string;
  estado: DeliveryStatus;
  folio: number;
  codigo: number;
  cantidad: number;
  um: string;
  prioridad: Priority; // Campo introducido desde codec.txt
}

interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  deliveries: Delivery[];
  hasHighPriority: boolean; // Nuevo indicador
}

const MONTH_NAMES = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
const WEEK_DAYS = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];
const CALENDAR_GRID_SIZE = 42;
const PROVIDER_COLORS = ['#ef4444', '#f97316', '#eab308', '#84cc16', '#22c55e', '#10b981', '#06b6d4', '#3b82f6', '#8b5cf6', '#d946ef', '#ec4899'];

//==============================================================================
// 2. LÓGICA DE DATOS Y SERVICIO (Mock Data con simulación de latencia)
//==============================================================================

const generateMockDeliveries = (): Delivery[] => {
  const providers = ['Proveedor Alfa', 'Proveedor Beta', 'Proveedor Gamma', 'Proveedor Delta'];
  const statuses: DeliveryStatus[] = ['Pendiente', 'En Camino', 'Entregado', 'Rechazado'];
  const priorities: Priority[] = ['Alta', 'Media', 'Baja'];
  const products = [
    { codigo: 501, descripcion: 'Tornillos de Acero M8', um: 'pzas' }, { codigo: 502, descripcion: 'Resistencia Térmica 10kOhm', um: 'pzas' },
    { codigo: 503, descripcion: 'Placa de Aluminio 3mm', um: 'm2' }, { codigo: 504, descripcion: 'Sensor de Proximidad Inductivo', um: 'pzas' },
    { codigo: 505, descripcion: 'Cable de Cobre Calibre 12', um: 'mts' }, { codigo: 506, descripcion: 'Válvula Solenoide 1/2"', um: 'pzas' },
  ];
  const deliveries: Delivery[] = [];
  const today = new Date();
  for (let i = 0; i < 50; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + Math.floor(Math.random() * 50) - 25);
    const product = products[Math.floor(Math.random() * products.length)];
    deliveries.push({
      id: `delivery-${Date.now()}-${i}`,
      proveedor: providers[Math.floor(Math.random() * providers.length)],
      fecha: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`,
      descripcion: product.descripcion,
      estado: statuses[Math.floor(Math.random() * statuses.length)],
      folio: 2024000 + i + 1,
      codigo: product.codigo,
      cantidad: Math.floor(Math.random() * 1000) + 5,
      um: product.um,
      prioridad: priorities[Math.floor(Math.random() * priorities.length)],
    });
  }
  return deliveries;
};

// Hook con estados de carga y error (del archivo codec.txt)
const useDeliveryService = () => {
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => {
      try {
        setDeliveries(generateMockDeliveries());
        setError(null);
      } catch (e) {
        setError(e instanceof Error ? e : new Error('Error al generar datos de prueba'));
      } finally {
        setLoading(false);
      }
    }, 500); // Simulación de carga
    return () => clearTimeout(timer);
  }, []);

  const updateStatus = useCallback((id: string, newStatus: DeliveryStatus) => {
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        setDeliveries(prev => prev.map(d => d.id === id ? { ...d, estado: newStatus } : d));
        resolve();
      }, 300); // Simulación de actualización
    });
  }, []);

  return { deliveries, loading, error, updateStatus };
};

//==============================================================================
// 3. SISTEMA DE ESTILOS Y UTILIDADES DE UI
//==============================================================================

const theme = {
    colors: {
      light: { primary: '#6d28d9', secondary: '#ede9fe', background: '#f8fafc', surface: '#ffffff', surface2: '#f1f5f9', textPrimary: '#1e293b', textSecondary: '#64748b', border: '#e2e8f0', error: '#dc2626' },
      dark: { primary: '#a78bfa', secondary: '#4338ca', background: '#0f172a', surface: '#1e293b', surface2: '#334155', textPrimary: '#f8fafc', textSecondary: '#94a3b8', border: '#475569', error: '#f87171' },
      status: {
        Pendiente: { bg: '#fef9c3', text: '#ca8a04', darkBg: 'rgba(234, 179, 8, 0.15)', darkText: '#fde047', icon: '🕒' },
        'En Camino': { bg: '#dbeafe', text: '#2563eb', darkBg: 'rgba(59, 130, 246, 0.15)', darkText: '#93c5fd', icon: '🚚' },
        Entregado: { bg: '#dcfce7', text: '#16a34a', darkBg: 'rgba(34, 197, 94, 0.15)', darkText: '#86efac', icon: '✅' },
        Rechazado: { bg: '#fee2e2', text: '#dc2626', darkBg: 'rgba(239, 68, 68, 0.15)', darkText: '#fca5a5', icon: '❌' },
      },
      priority: {
        Alta: { color: '#ef4444', darkColor: '#fca5a5' }, Media: { color: '#f97316', darkColor: '#fdba74' }, Baja: { color: '#3b82f6', darkColor: '#93c5fd' },
      }
    },
    shadows: { sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)', lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)' },
    borderRadius: { md: '0.375rem', lg: '0.5rem', xl: '0.75rem', full: '9999px' },
    font: { sans: 'Inter, system-ui, -apple-system, sans-serif' }
};

const formatDateForInput = (date: Date): string => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

//==============================================================================
// 4. COMPONENTES HIJOS ATÓMICOS Y MODULARES
//==============================================================================

const LoadingSpinner: FC<{ size?: number, color?: string }> = ({ size = 40, color = 'currentColor' }) => (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', width: '100%', padding: '2rem' }}>
        <div style={{ width: `${size}px`, height: `${size}px`, border: `4px solid ${color}`, borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite', opacity: 0.6 }} />
        <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
    </div>
);

// Componente de lista optimizado con memo (del archivo codec.txt)
interface DeliveryListItemProps { delivery: Delivery; providerColor: string; onClick: (delivery: Delivery) => void; isDarkMode: boolean; }

const DeliveryListItem: FC<DeliveryListItemProps> = memo(({ delivery, providerColor, onClick, isDarkMode }) => {
    const { colors } = theme;
    const statusTheme = colors.status[delivery.estado];
    const priorityTheme = colors.priority[delivery.prioridad];
    const styles = {
        container: { backgroundColor: isDarkMode ? colors.dark.surface : colors.light.surface, borderRadius: theme.borderRadius.lg, padding: '1rem', marginBottom: '0.75rem', borderLeft: `4px solid ${providerColor}`, cursor: 'pointer', transition: 'all 0.2s', border: `1px solid ${isDarkMode ? colors.dark.border : 'transparent'}`, position: 'relative' as const },
        priorityIndicator: { position: 'absolute' as const, top: '0.5rem', right: '0.5rem', width: '10px', height: '10px', borderRadius: '50%', backgroundColor: isDarkMode ? priorityTheme.darkColor : priorityTheme.color },
        header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.75rem' },
        description: { fontWeight: 600, color: isDarkMode ? colors.dark.textPrimary : colors.light.textPrimary, lineHeight: 1.3 },
        code: { fontWeight: 400, color: isDarkMode ? colors.dark.textSecondary : colors.light.textSecondary, fontSize: '0.875rem', marginRight: '0.5rem' },
        quantity: { fontSize: '1.25rem', fontWeight: 700, color: isDarkMode ? colors.dark.primary : colors.light.primary },
        footer: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: `1px solid ${isDarkMode ? colors.dark.border : colors.light.border}` },
        status: { fontSize: '0.75rem', padding: '0.25rem 0.75rem', borderRadius: theme.borderRadius.full, fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.25rem', backgroundColor: isDarkMode ? statusTheme.darkBg : statusTheme.bg, color: isDarkMode ? statusTheme.darkText : statusTheme.text },
    };
    return (
        <div onClick={() => onClick(delivery)} style={styles.container} role="button" tabIndex={0} onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onClick(delivery)} className="delivery-list-item-hover">
            {/* El indicador de prioridad visual en la lista se mantiene aquí, ya que es útil */}
            <div style={styles.priorityIndicator} title={`Prioridad: ${delivery.prioridad}`} />
            <div style={styles.header}>
                <div>
                    <p style={styles.description}><span style={styles.code}>[{delivery.codigo}]</span>{delivery.descripcion}</p>
                    <p style={{ fontSize: '0.75rem', color: isDarkMode ? colors.dark.textSecondary : colors.light.textSecondary, marginTop: '0.25rem' }}>Folio: {delivery.folio}</p>
                </div>
                <div style={{ textAlign: 'right' as const }}><p style={styles.quantity}>{delivery.cantidad}</p><p style={{ fontSize: '0.875rem', color: isDarkMode ? colors.dark.textSecondary : colors.light.textSecondary }}>{delivery.um}</p></div>
            </div>
            <div style={styles.footer}><p style={{ fontSize: '0.875rem', color: isDarkMode ? colors.dark.textSecondary : colors.light.textSecondary }}>{delivery.proveedor}</p><p style={styles.status}><span>{statusTheme.icon} {delivery.estado}</span></p></div>
        </div>
    );
});
DeliveryListItem.displayName = "DeliveryListItem";


// Componente Modal con accesibilidad mejorada (del archivo codec.txt)
interface DeliveryModalProps { delivery: Delivery | null; onClose: () => void; onUpdateStatus: (id: string, newStatus: DeliveryStatus) => Promise<void>; isDarkMode: boolean; }

const DeliveryModal: FC<DeliveryModalProps> = ({ delivery, onClose, onUpdateStatus, isDarkMode }) => {
    const modalRef = useRef<HTMLDivElement>(null);
    const [isUpdating, setIsUpdating] = useState(false);

    // Lógica para atrapar el foco y cerrar con ESC (del archivo codec.txt)
    useEffect(() => {
        if (!delivery) return;
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
            if (e.key === 'Tab') { 
                const focusableElements = modalRef.current?.querySelectorAll<HTMLElement>('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
                if (!focusableElements || focusableElements.length === 0) return;
                const firstElement = focusableElements[0];
                const lastElement = focusableElements[focusableElements.length - 1];
                if (e.shiftKey) {
                    if (document.activeElement === firstElement) { e.preventDefault(); lastElement.focus(); }
                } else {
                    if (document.activeElement === lastElement) { e.preventDefault(); firstElement.focus(); }
                }
            }
        };
        const firstFocusable = modalRef.current?.querySelector<HTMLElement>('select, button');
        firstFocusable?.focus();
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [delivery, onClose]);

    if (!delivery) return null;

    const handleStatusChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
        if (e.target.value === delivery.estado) return;
        setIsUpdating(true);
        await onUpdateStatus(delivery.id, e.target.value as DeliveryStatus);
        setIsUpdating(false);
    };

    const { colors } = theme;
    const uiColors = isDarkMode ? colors.dark : colors.light;
    const priorityTheme = colors.priority[delivery.prioridad];
    
    const styles = {
        overlay: { position: 'fixed' as const, inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' },
        modal: { backgroundColor: uiColors.surface, borderRadius: theme.borderRadius.xl, padding: '2rem', width: '100%', maxWidth: '500px', boxShadow: theme.shadows.lg, border: `1px solid ${uiColors.border}`, position: 'relative' as const },
        closeButton: { position: 'absolute' as const, top: '1rem', right: '1rem', background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: uiColors.textSecondary, transition: 'color 0.2s' },
        select: { width: '100%', padding: '0.75rem', fontSize: '1rem', borderRadius: theme.borderRadius.lg, border: `2px solid ${uiColors.border}`, backgroundColor: uiColors.surface2, color: 'inherit', marginTop: '1rem', cursor: 'pointer' },
        detailRow: { display: 'flex', justifyContent: 'space-between', padding: '0.75rem 0', borderBottom: `1px solid ${uiColors.border}` },
        label: { fontWeight: 500, color: uiColors.textSecondary },
        value: { fontWeight: 600, textAlign: 'right' as const },
        priorityBadge: { backgroundColor: isDarkMode ? priorityTheme.darkColor : priorityTheme.color, color: 'white', padding: '0.25rem 0.5rem', borderRadius: theme.borderRadius.md, fontSize: '0.8rem' }
    };

    const statusTheme = colors.status[delivery.estado];

    return (
        <div style={styles.overlay} onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="modal-title">
            <div ref={modalRef} style={styles.modal} onClick={e => e.stopPropagation()}>
                <button style={styles.closeButton} onClick={onClose} aria-label="Cerrar modal" className="close-button-hover">&times;</button>
                <h2 id="modal-title" style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1.5rem', borderBottom: `2px solid ${uiColors.primary}`, paddingBottom: '0.5rem' }}>Detalles de Entrega</h2>
                <div style={{ marginBottom: '1rem' }}>
                    <div style={styles.detailRow}><span style={styles.label}>Producto</span><span style={styles.value}>{delivery.descripcion}</span></div>
                    <div style={styles.detailRow}><span style={styles.label}>Proveedor</span><span style={styles.value}>{delivery.proveedor}</span></div>
                    <div style={styles.detailRow}><span style={styles.label}>Folio / Código</span><span style={styles.value}>{delivery.folio} / {delivery.codigo}</span></div>
                    <div style={styles.detailRow}><span style={styles.label}>Cantidad</span><span style={styles.value}>{delivery.cantidad} {delivery.um}</span></div>
                    <div style={styles.detailRow}><span style={styles.label}>Fecha Programada</span><span style={styles.value}>{new Date(delivery.fecha + 'T00:00:00').toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}</span></div>
                    <div style={styles.detailRow}><span style={styles.label}>Prioridad</span><span style={styles.priorityBadge}>{delivery.prioridad}</span></div>
                    <div style={{...styles.detailRow, borderBottom: 'none'}}><span style={styles.label}>Estado Actual</span><span style={{...styles.value, ...statusTheme, padding: '0.25rem 0.5rem', borderRadius: theme.borderRadius.md, fontWeight: 700, backgroundColor: isDarkMode ? statusTheme.darkBg : statusTheme.bg, color: isDarkMode ? statusTheme.darkText : statusTheme.text}}>{statusTheme.icon} {delivery.estado}</span></div>
                </div>
                <label htmlFor="status-select" style={{ fontWeight: 600, fontSize: '0.9rem', color: uiColors.textPrimary }}>Actualizar Estado:</label>
                <select id="status-select" style={styles.select} value={delivery.estado} onChange={handleStatusChange} disabled={isUpdating} aria-label="Cambiar estado de la entrega">
                    {['Pendiente', 'En Camino', 'Entregado', 'Rechazado'].map(s => <option key={s} value={s}>{colors.status[s as DeliveryStatus].icon} {s}</option>)}
                </select>
                {isUpdating && <div style={{position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: theme.borderRadius.xl }}><LoadingSpinner size={50} color={uiColors.primary} /></div>}
            </div>
        </div>
    );
};

// Componente para la sección de detalles y filtros
interface DeliveryDetailsSectionProps {
  selectedDay: CalendarDay | null;
  filteredDayDeliveries: Delivery[];
  statusFilter: DeliveryStatus | 'all';
  setStatusFilter: (status: DeliveryStatus | 'all') => void;
  providerColorMap: Map<string, string>;
  openDeliveryModal: (delivery: Delivery) => void;
  isDarkMode: boolean;
}

const DeliveryDetailsSection: FC<DeliveryDetailsSectionProps> = ({ selectedDay, filteredDayDeliveries, statusFilter, setStatusFilter, providerColorMap, openDeliveryModal, isDarkMode }) => {
    const { colors, borderRadius, shadows } = theme;
    const uiColors = isDarkMode ? colors.dark : colors.light;
    
    // Estilos internos
    const styles: { [key: string]: React.CSSProperties } = {
        container: {
            flex: '1 1 350px',
            minWidth: '300px',
        },
        card: {
            backgroundColor: uiColors.surface,
            borderRadius: borderRadius.xl,
            boxShadow: shadows.lg,
            padding: '1.5rem',
            position: 'sticky',
            top: '2rem',
            border: `1px solid ${uiColors.border}`,
        },
        title: {
            fontSize: '1.25rem',
            fontWeight: 600,
            color: uiColors.textPrimary,
            marginBottom: '0.25rem',
        },
        filterBar: {
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            marginBottom: '1.5rem',
            backgroundColor: uiColors.surface2,
            padding: '0.25rem',
            borderRadius: borderRadius.lg
        },
        listContainer: {
            maxHeight: '65vh',
            overflowY: 'auto',
            paddingRight: '0.5rem', // Para compensar el scrollbar
        },
        emptyState: {
            textAlign: 'center' as const,
            padding: '2.5rem 0',
        }
    };
    
    // Estilos para los botones de filtro
    const getFilterButtonStyles = (filter: DeliveryStatus | 'all'): React.CSSProperties => ({
        flex: 1,
        padding: '0.5rem',
        fontSize: '0.875rem',
        fontWeight: 600,
        borderRadius: borderRadius.md,
        border: 'none',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        whiteSpace: 'nowrap',
        backgroundColor: statusFilter === filter
            ? uiColors.surface
            : 'transparent',
        color: statusFilter === filter
            ? uiColors.primary
            : uiColors.textSecondary,
        boxShadow: statusFilter === filter ? shadows.sm : 'none',
    });

    if (!selectedDay) {
        return (
            <div style={styles.container}>
                <div style={{ ...styles.card, textAlign: 'center', padding: '4rem 2rem' }}>
                    <h3 style={styles.title}>Bienvenido al Calendario</h3>
                    <p style={{ color: uiColors.textSecondary, marginTop: '0.25rem' }}>Selecciona un día con entregas para ver la programación detallada.</p>
                </div>
            </div>
        );
    }

    return (
        <div style={styles.container} className="details-section">
            <div style={styles.card}>
                <h3 style={styles.title}>
                    Entregas para el {selectedDay.date.toLocaleDateString('es-ES', { day: 'numeric', month: 'long' })}
                </h3>
                <p style={{ color: uiColors.textSecondary, marginBottom: '1rem', fontSize: '0.9rem' }}>
                    {selectedDay.deliveries.length} entregas programadas.
                </p>

                <div style={styles.filterBar}>
                    <button onClick={() => setStatusFilter('all')} style={getFilterButtonStyles('all')}>Todos</button>
                    {(['Pendiente', 'En Camino', 'Entregado'] as const).map(s => (
                        <button key={s} onClick={() => setStatusFilter(s)} style={getFilterButtonStyles(s)}>
                            {theme.colors.status[s].icon} {s}
                        </button>
                    ))}
                </div>

                <div style={styles.listContainer}>
                    {filteredDayDeliveries.length > 0 ? (
                        filteredDayDeliveries.map(delivery => (
                            <DeliveryListItem
                                key={delivery.id}
                                delivery={delivery}
                                providerColor={providerColorMap.get(delivery.proveedor) || uiColors.border}
                                onClick={openDeliveryModal}
                                isDarkMode={isDarkMode}
                            />
                        ))
                    ) : (
                        <div style={styles.emptyState}>
                            <p style={{ color: uiColors.textSecondary }}>No hay entregas que coincidan con el filtro.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

//==============================================================================
// 5. COMPONENTE PRINCIPAL ORQUESTADOR
//==============================================================================
const App: FC = () => {
    const { deliveries, loading, error, updateStatus } = useDeliveryService();
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedProvider, setSelectedProvider] = useState('all');
    const [searchTerm, setSearchTerm] = useState(''); // Estado de búsqueda introducido
    const [statusFilter, setStatusFilter] = useState<DeliveryStatus | 'all'>('all');
    const [selectedDateStr, setSelectedDateStr] = useState<string | null>(null);
    const [modalDelivery, setModalDelivery] = useState<Delivery | null>(null);
    const calendarGridRef = useRef<HTMLDivElement>(null);

    // Dark Mode Effect & Initialization
    useEffect(() => {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        const savedTheme = localStorage.getItem('theme');
        const dark = savedTheme === 'dark' || (savedTheme === null && prefersDark);
        setIsDarkMode(dark);
        document.body.style.backgroundColor = dark ? theme.colors.dark.background : theme.colors.light.background;
        document.body.style.color = dark ? theme.colors.dark.textPrimary : theme.colors.light.textPrimary;
    }, []);

    const toggleDarkMode = useCallback(() => {
        setIsDarkMode(prev => {
            const newMode = !prev;
            localStorage.setItem('theme', newMode ? 'dark' : 'light');
            document.body.style.backgroundColor = newMode ? theme.colors.dark.background : theme.colors.light.background;
            document.body.style.color = newMode ? theme.colors.dark.textPrimary : theme.colors.light.textPrimary;
            return newMode;
        });
    }, []);

    // Derived state para optimización
    const providers = useMemo(() => ['all', ...[...new Set(deliveries.map(d => d.proveedor))].sort()], [deliveries]);
    const providerColorMap = useMemo(() => {
        const map = new Map<string, string>();
        providers.filter(p => p !== 'all').forEach((p, i) => map.set(p, PROVIDER_COLORS[i % PROVIDER_COLORS.length]));
        return map;
    }, [providers]);

    // Filtrado (incluyendo búsqueda)
    const filteredDeliveries = useMemo(() => {
        return deliveries
            .filter(d => selectedProvider === 'all' || d.proveedor === selectedProvider)
            .filter(d => searchTerm === '' || d.descripcion.toLowerCase().includes(searchTerm.toLowerCase()) || String(d.codigo).includes(searchTerm) || String(d.folio).includes(searchTerm));
    }, [deliveries, selectedProvider, searchTerm]);

    // Generación de la cuadrícula del calendario
    const calendarGrid = useMemo<CalendarDay[]>(() => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const firstDay = new Date(year, month, 1);
        const startDayOfWeek = (firstDay.getDay() + 6) % 7;
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const grid: CalendarDay[] = [];
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Días del mes anterior
        const prevMonthLastDay = new Date(year, month, 0).getDate();
        for (let i = startDayOfWeek; i > 0; i--) {
            grid.push({ date: new Date(year, month - 1, prevMonthLastDay - i + 1), isCurrentMonth: false, isToday: false, deliveries: [], hasHighPriority: false });
        }
        // Días del mes actual
        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(year, month, day);
            const dateStr = formatDateForInput(date);
            const dayDeliveries = filteredDeliveries.filter(d => d.fecha === dateStr);
            grid.push({ date, isCurrentMonth: true, isToday: date.getTime() === today.getTime(), deliveries: dayDeliveries, hasHighPriority: dayDeliveries.some(d => d.prioridad === 'Alta') });
        }
        // Relleno
        const gridEndFill = CALENDAR_GRID_SIZE - grid.length;
        for (let day = 1; day <= gridEndFill; day++) {
            grid.push({ date: new Date(year, month + 1, day), isCurrentMonth: false, isToday: false, deliveries: [], hasHighPriority: false });
        }
        return grid;
    }, [currentDate, filteredDeliveries]);

    const selectedDay = useMemo(() => selectedDateStr ? calendarGrid.find(d => formatDateForInput(d.date) === selectedDateStr) : null, [calendarGrid, selectedDateStr]);
    
    // Filtro de entregas del día seleccionado
    const filteredDayDeliveries = useMemo(() => {
        if (!selectedDay) return [];
        // Ordenar por prioridad: Alta > Media > Baja
        const sorted = [...selectedDay.deliveries].sort((a, b) => {
            const priorityOrder = { 'Alta': 1, 'Media': 2, 'Baja': 3 };
            return priorityOrder[a.prioridad] - priorityOrder[b.prioridad];
        });
        
        return statusFilter === 'all' ? sorted : sorted.filter(d => d.estado === statusFilter);
    }, [selectedDay, statusFilter]);

    // Auto-selección inicial y manejo de cambios de mes/filtro
    useEffect(() => { 
        // Si no hay un día seleccionado, intenta seleccionar hoy (si tiene data) o el primer día con data
        if (loading || selectedDateStr) return; 
        const firstDayWithData = calendarGrid.find(d => d.isToday && d.deliveries.length > 0) || calendarGrid.find(d => d.isCurrentMonth && d.deliveries.length > 0);
        if (firstDayWithData) setSelectedDateStr(formatDateForInput(firstDayWithData.date));
    }, [loading, calendarGrid, selectedDateStr]);
    
    // Scroll al día seleccionado (del archivo codec.txt)
    useEffect(() => {
        if (selectedDay && calendarGridRef.current) {
            const dayElement = calendarGridRef.current.querySelector<HTMLElement>(`[data-date-str="${formatDateForInput(selectedDay.date)}"]`);
            dayElement?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
    }, [selectedDay]);

    const handlePreviousMonth = useCallback(() => {
        setCurrentDate(d => new Date(d.getFullYear(), d.getMonth() - 1, 1));
        setSelectedDateStr(null);
    }, []);

    const handleNextMonth = useCallback(() => {
        setCurrentDate(d => new Date(d.getFullYear(), d.getMonth() + 1, 1));
        setSelectedDateStr(null);
    }, []);
    
    const handleSelectDay = useCallback((day: CalendarDay) => {
        if (day.isCurrentMonth && day.deliveries.length > 0) {
            setSelectedDateStr(formatDateForInput(day.date));
            setStatusFilter('all');
        } else if (day.isCurrentMonth) {
            setSelectedDateStr(formatDateForInput(day.date)); // Permite seleccionar días vacíos en el mes actual
            setStatusFilter('all');
        }
    }, []);

    const uiColors = isDarkMode ? theme.colors.dark : theme.colors.light;

    if (error) return <div style={{color: uiColors.error, padding: '2rem'}}>Error: {error.message}. Por favor, recarga la página.</div>;

    // Estilos dinámicos y responsivos
    const calendarStyles: React.CSSProperties = {
        flex: '1 1 600px',
        backgroundColor: uiColors.surface,
        borderRadius: theme.borderRadius.xl,
        boxShadow: theme.shadows.lg,
        padding: '1.5rem',
        border: `1px solid ${uiColors.border}`,
    };

    const navButtonStyles: React.CSSProperties = {
        background: uiColors.surface2,
        border: 'none',
        color: uiColors.textPrimary,
        fontSize: '1.5rem',
        fontWeight: 700,
        cursor: 'pointer',
        padding: '0.5rem 1rem',
        borderRadius: theme.borderRadius.md,
        transition: 'background-color 0.2s ease',
    };

    return (
        <div style={{ fontFamily: theme.font.sans, padding: '2rem' }}>
            {/* -------------------- HEADER -------------------- */}
            <header style={{ backgroundColor: uiColors.surface, borderRadius: theme.borderRadius.xl, padding: '1.5rem', marginBottom: '2rem', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', boxShadow: theme.shadows.lg, border: `1px solid ${uiColors.border}` }}>
                <h1 style={{ fontSize: '1.875rem', fontWeight: 800, background: `linear-gradient(to right, ${uiColors.primary}, #a855f7)`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', margin: 0 }}>Programación Mensual de Entregas</h1>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
                    <input type="text" placeholder="Buscar..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} style={{ padding: '0.625rem 1rem', borderRadius: theme.borderRadius.lg, border: `1px solid ${uiColors.border}`, backgroundColor: uiColors.surface2, color: 'inherit', minWidth: '150px' }}/>
                    <select value={selectedProvider} onChange={(e) => setSelectedProvider(e.target.value)} style={{ padding: '0.625rem 1rem', borderRadius: theme.borderRadius.lg, border: `1px solid ${uiColors.border}`, backgroundColor: uiColors.surface2, color: 'inherit', cursor: 'pointer' }}>
                        {providers.map(p => <option key={p} value={p}>{p === 'all' ? 'Todos los proveedores' : p}</option>)}
                    </select>
                    <button onClick={toggleDarkMode} aria-label="Cambiar tema" style={{ padding: '0.625rem', borderRadius: '50%', border: 'none', backgroundColor: uiColors.surface2, cursor: 'pointer', display: 'flex', transition: 'background-color 0.2s' }} className="dark-mode-button-hover" >
                        {isDarkMode ? '☀️' : '🌙'}
                    </button>
                </div>
            </header>

            {/* -------------------- MAIN CONTENT -------------------- */}
            {loading ? <LoadingSpinner size={60} color={uiColors.primary}/> : (
                <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', alignItems: 'flex-start' }} className="content-area">
                    
                    {/* -------------------- CALENDARIO -------------------- */}
                    <div style={calendarStyles}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                            <button onClick={handlePreviousMonth} style={navButtonStyles} className="nav-button-hover">{'<'}</button>
                            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, textAlign: 'center' }}>
                                {`${MONTH_NAMES[currentDate.getMonth()]} ${currentDate.getFullYear()}`}
                            </h2>
                            <button onClick={handleNextMonth} style={navButtonStyles} className="nav-button-hover">{'>'}</button>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', textAlign: 'center', fontWeight: 600, color: uiColors.primary, marginBottom: '0.5rem' }}>
                            {/* FIX: Corregido el error de clave duplicada usando el índice (idx) */}
                            {WEEK_DAYS.map((day, idx) => <div key={`${day}-${idx}`} style={{ padding: '0.5rem' }}>{day}</div>)}
                        </div>

                        <div ref={calendarGridRef} style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', borderTop: `1px solid ${uiColors.border}`, borderLeft: `1px solid ${uiColors.border}` }}>
                            {calendarGrid.map((day) => {
                                const isSelected = selectedDay?.date.getTime() === day.date.getTime();
                                const hasDeliveries = day.deliveries.length > 0;
                                const isClickable = day.isCurrentMonth && hasDeliveries;

                                const dayStyle: React.CSSProperties = {
                                    position: 'relative',
                                    aspectRatio: '1 / 1',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    justifyContent: 'space-between',
                                    alignItems: 'flex-start',
                                    padding: '0.5rem',
                                    borderBottom: `1px solid ${uiColors.border}`,
                                    borderRight: `1px solid ${uiColors.border}`,
                                    transition: 'background-color 0.2s ease, transform 0.1s ease',
                                    
                                    backgroundColor: isSelected
                                        ? uiColors.primary
                                        : (!day.isCurrentMonth ? uiColors.surface2 : 'transparent'),
                                        
                                    color: isSelected
                                        ? theme.colors.light.surface
                                        : (day.isCurrentMonth ? uiColors.textPrimary : uiColors.textSecondary),
                                    cursor: isClickable ? 'pointer' : 'default',
                                };
                                
                                const dayNumberStyle: React.CSSProperties = {
                                    alignSelf: 'flex-end',
                                    fontWeight: day.isToday && !isSelected ? 700 : 400,
                                    fontSize: '1rem',
                                    lineHeight: 1,
                                    color: isSelected ? theme.colors.light.surface : (day.isToday ? theme.colors.light.primary : 'inherit'),
                                };

                                return (
                                    <div
                                        key={day.date.toDateString()}
                                        data-date-str={formatDateForInput(day.date)} // Para el scroll-into-view
                                        onClick={() => handleSelectDay(day)}
                                        style={dayStyle}
                                        className={isClickable ? "day-cell-hover" : ""}
                                        title={hasDeliveries ? `${day.deliveries.length} entregas` : undefined}
                                    >
                                        <span style={dayNumberStyle}>
                                            {day.date.getDate()}
                                        </span>
                                        {hasDeliveries && (
                                            <span style={{
                                                backgroundColor: isSelected ? 'white' : uiColors.primary,
                                                color: isSelected ? uiColors.primary : 'white',
                                                borderRadius: theme.borderRadius.full,
                                                padding: '2px 6px',
                                                fontSize: '10px',
                                                fontWeight: 600,
                                            }}>
                                                {day.deliveries.length}
                                            </span>
                                        )}
                                        {/* REMOVIDO: Se elimina el indicador de alta prioridad (🚨) de las celdas */}
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* -------------------- DETALLES DE ENTREGA -------------------- */}
                    <DeliveryDetailsSection
                        selectedDay={selectedDay}
                        filteredDayDeliveries={filteredDayDeliveries}
                        statusFilter={statusFilter}
                        setStatusFilter={setStatusFilter}
                        providerColorMap={providerColorMap}
                        openDeliveryModal={setModalDelivery}
                        isDarkMode={isDarkMode}
                    />
                </div>
            )}

            {/* -------------------- MODAL -------------------- */}
            <DeliveryModal
                delivery={modalDelivery}
                onClose={() => setModalDelivery(null)}
                onUpdateStatus={updateStatus}
                isDarkMode={isDarkMode}
            />

            {/* -------------------- ESTILOS GLOBALES -------------------- */}
            <style>
                {`
                    body { margin: 0; }
                    /* Clases para efectos de hover */
                    .nav-button-hover:hover { background-color: ${isDarkMode ? uiColors.surface : uiColors.surface}; box-shadow: ${theme.shadows.sm}; }
                    .dark-mode-button-hover:hover { background-color: ${isDarkMode ? uiColors.surface : uiColors.surface}; box-shadow: ${theme.shadows.md}; }
                    .day-cell-hover:hover { background-color: ${isDarkMode ? uiColors.surface2 : uiColors.surface2}; transform: scale(1.02); }
                    .delivery-list-item-hover:hover { box-shadow: ${theme.shadows.md}; transform: translateY(-2px); }
                    .close-button-hover:hover { color: ${uiColors.error}; transform: scale(1.1); }

                    /* Estilo para el scrollbar */
                    .listContainer::-webkit-scrollbar { width: 8px; }
                    .listContainer::-webkit-scrollbar-track { background: ${uiColors.surface2}; border-radius: ${theme.borderRadius.full}; }
                    .listContainer::-webkit-scrollbar-thumb { background: ${uiColors.textSecondary}; border-radius: ${theme.borderRadius.full}; }
                    .listContainer::-webkit-scrollbar-thumb:hover { background: ${uiColors.textPrimary}; }

                    /* Media query para responsividad */
                    @media (max-width: 1024px) {
                        .content-area { flex-direction: column; }
                        .details-section { order: -1; } /* Mueve los detalles encima del calendario en móvil */
                    }
                    @media (max-width: 768px) {
                        div[style*="padding: 2rem"] { padding: 1rem; }
                        input[type="text"], select { min-width: 100%; }
                        header div[style*="flex-wrap: wrap"] { justify-content: space-around; }
                    }
                `}
            </style>
        </div>
    );
};

export default App;

