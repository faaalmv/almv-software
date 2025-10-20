import React, { useState, useMemo, useCallback, useEffect, CSSProperties } from 'react';

//==============================================================================
// 1. DEFINICIÓN DE TIPOS (TypeScript)
//==============================================================================
interface DailyData {
  programacion: number;
  desayuno: number;
  comida: number;
  cena: number;
}

interface DataItem {
  id: string;
  code: string;
  description: string;
  unit: string;
  group: {
    id: number;
    name: string;
  };
  maxQuantity: number;
  dailyData: { [day: number]: DailyData };
}

interface GroupedData {
  [groupName: string]: {
    items: DataItem[];
    totalProgramado: number;
    totalMaximo: number;
  };
}

type ActiveTab = 'programacion' | 'diaria' | 'consolidado';
type MealType = 'programacion' | 'desayuno' | 'comida' | 'cena';

//==============================================================================
// 2. DATOS DE EJEMPLO
//==============================================================================
const generateMockData = (): DataItem[] => {
  const groups = [
    { id: 1, name: "CARNES Y AVES" },
    { id: 2, name: "PESCADOS Y MARISCOS" },
    { id: 3, name: "FRUTAS Y VERDURAS" },
  ];
  const items = [
    { code: "CAR001", description: "Pechuga de Pollo sin Hueso", unit: "kg", group: groups[0], max: 150 },
    { code: "CAR002", description: "Bistec de Res", unit: "kg", group: groups[0], max: 120 },
    { code: "PES001", description: "Filete de Salmón Fresco", unit: "kg", group: groups[1], max: 80 },
    { code: "FRU001", description: "Manzana Gala", unit: "kg", group: groups[2], max: 200 },
    { code: "VER001", description: "Tomate Saladette", unit: "kg", group: groups[2], max: 250 },
  ];

  return items.map((item, index) => {
    const dailyData: { [day: number]: DailyData } = {};
    for (let i = 1; i <= 31; i++) {
      dailyData[i] = {
        programacion: Math.random() > 0.6 ? Math.floor(Math.random() * 10) : 0,
        desayuno: Math.random() > 0.8 ? Math.floor(Math.random() * 3) : 0,
        comida: Math.random() > 0.8 ? Math.floor(Math.random() * 5) : 0,
        cena: Math.random() > 0.8 ? Math.floor(Math.random() * 3) : 0,
      };
    }
    return {
      id: `item-${index}`,
      code: item.code,
      description: item.description,
      unit: item.unit,
      group: item.group,
      maxQuantity: item.max,
      dailyData,
    };
  });
};

//==============================================================================
// 3. OBJETOS DE ESTILO (CSS-in-JS Dependency-Free) - ¡NUEVO DISEÑO!
//==============================================================================
const PALETTE = {
  primary: 'rgba(0, 122, 255, 1)',
  primaryLight: 'rgba(0, 122, 255, 0.1)',
  primaryDark: 'rgba(0, 90, 200, 1)',
  backgroundStart: '#f8f9fa',
  surface: 'rgba(255, 255, 255, 0.7)',
  surfaceHeader: 'rgba(255, 255, 255, 0.85)',
  text: '#212529',
  textSecondary: '#6c757d',
  border: 'rgba(0, 0, 0, 0.1)',
  borderLight: 'rgba(0, 0, 0, 0.05)',
  success: '#28a745',
  warning: '#ffc107',
  danger: '#dc3545',
  shadow: '0 8px 32px 0 rgba(31, 38, 135, 0.15)',
  surfaceOpaque: '#ffffff',
  primaryLightOpaque: '#eaf5ff',
};

const GROUP_HEADER_COLORS = ['rgba(231, 245, 255, 0.8)', 'rgba(230, 252, 245, 0.8)', 'rgba(255, 248, 225, 0.8)'];

const STYLES: { [key: string]: CSSProperties } = {
  // --- Layout & Global ---
  appContainer: { 
    fontFamily: `'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif`, 
    backgroundColor: PALETTE.backgroundStart, 
    padding: '2rem', 
    minHeight: '100vh', 
    boxSizing: 'border-box',
    opacity: 0,
    animation: 'fadeIn 0.5s ease-out forwards',
    position: 'relative',
    overflow: 'hidden',
  },
  // --- Header ---
  header: { 
    backgroundColor: PALETTE.surfaceHeader,
    backdropFilter: 'blur(12px) saturate(180%)',
    WebkitBackdropFilter: 'blur(12px) saturate(180%)',
    padding: '1.5rem 2rem', 
    borderRadius: '16px', 
    boxShadow: PALETTE.shadow,
    marginBottom: '2rem',
    border: `1px solid rgba(255, 255, 255, 0.25)`,
  },
  headerTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1.5rem' },
  headerTitle: { margin: 0, fontSize: '2rem', color: PALETTE.primary, fontWeight: 700, letterSpacing: '-0.5px' },
  headerSubtitle: { margin: '0.25rem 0 0', color: PALETTE.textSecondary, fontSize: '1rem', fontWeight: 500 },
  headerRightContainer: { display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.75rem' },
  userInfo: { display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: PALETTE.textSecondary, fontWeight: 500 },
  headerControls: { display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' },
  selectGroup: { display: 'flex', flexDirection: 'column' },
  selectLabel: { fontSize: '0.8rem', color: PALETTE.textSecondary, marginBottom: '0.25rem' },
  styledSelect: { 
    padding: '0.5rem 0.75rem', 
    border: `1px solid ${PALETTE.border}`, 
    borderRadius: '8px', 
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    minWidth: '150px', 
    cursor: 'pointer',
    transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
  },
  btn: { 
    padding: '0.6rem 1.2rem', 
    border: 'none', 
    borderRadius: '8px', 
    backgroundColor: PALETTE.primary, 
    color: 'white', 
    cursor: 'pointer', 
    display: 'inline-flex', 
    alignItems: 'center', 
    gap: '0.5rem', 
    fontWeight: 500,
    transition: 'background-color 0.2s ease, transform 0.1s ease, box-shadow 0.2s ease',
  },
  // --- Main Content & Controls ---
  mainContent: { 
    backgroundColor: PALETTE.surface,
    backdropFilter: 'blur(12px) saturate(180%)',
    WebkitBackdropFilter: 'blur(12px) saturate(180%)',
    borderRadius: '16px', 
    boxShadow: PALETTE.shadow, 
    padding: '1.5rem 2rem',
    border: `1px solid rgba(255, 255, 255, 0.25)`,
  },
  controlsBar: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' },
  tabs: { display: 'flex', borderBottom: `2px solid ${PALETTE.border}` },
  tab: { 
    padding: '0.75rem 0.25rem',
    margin: '0 1rem',
    cursor: 'pointer', 
    border: 'none', 
    background: 'none', 
    color: PALETTE.textSecondary, 
    fontSize: '1rem', 
    fontWeight: 500,
    borderBottomWidth: '2px',
    borderBottomStyle: 'solid',
    borderBottomColor: 'transparent',
    marginBottom: '-2px', 
    transition: 'color 0.2s ease, border-bottom-color 0.2s ease' 
  },
  tabActive: { color: PALETTE.primary, borderBottomColor: PALETTE.primary },
  searchAndSaveContainer: { display: 'flex', alignItems: 'center', gap: '1rem', flexGrow: 1, justifyContent: 'flex-end' },
  searchInput: { 
    width: '100%',
    maxWidth: '350px', 
    padding: '0.6rem 1rem', 
    border: `1px solid ${PALETTE.border}`, 
    borderRadius: '8px',
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
  },
  // --- Table ---
  datatableWrapper: { overflow: 'auto', maxHeight: '65vh', border: `1px solid ${PALETTE.border}`, borderRadius: '8px' },
  table: { width: '100%', borderCollapse: 'separate', borderSpacing: 0, fontSize: '0.875rem' },
  th: {
    padding: '0.85rem 1rem',
    textAlign: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.75)',
    backdropFilter: 'blur(10px)',
    WebkitBackdropFilter: 'blur(10px)',
    color: PALETTE.text,
    fontWeight: 700,
    textTransform: 'uppercase',
    fontSize: '0.75rem',
    letterSpacing: '0.5px',
    position: 'sticky', top: 0, zIndex: 2,
    borderBottom: `2px solid ${PALETTE.border}`,
    borderRight: 'none',
    boxShadow: `inset -1px 0 0 ${PALETTE.border}`,
  },
  td: { 
    padding: '0.75rem 1rem', 
    textAlign: 'left', 
    borderBottom: `1px solid ${PALETTE.borderLight}`, 
    whiteSpace: 'nowrap', 
    backgroundColor: 'inherit',
    borderRight: `1px solid ${PALETTE.borderLight}`,
  },
  tableRow: { backgroundColor: 'transparent', transition: 'background-color 0.15s ease' },
  stickyCell: { 
    position: 'sticky', 
    zIndex: 1, 
    backgroundColor: PALETTE.surfaceOpaque,
  },
  stickyHeader: { zIndex: 3, backgroundColor: 'rgba(255, 255, 255, 0.75)' },
  // --- Group Header ---
  groupHeaderRow: { cursor: 'pointer', transition: 'background-color 0.2s ease' },
  groupHeaderCell: { fontWeight: 600, padding: '0.75rem 1rem', borderTop: `1px solid ${PALETTE.border}` },
  groupInfo: { display: 'flex', alignItems: 'center', gap: '1rem', color: PALETTE.text },
  toggleIcon: { transition: 'transform 0.3s ease-in-out', color: PALETTE.primary },
  toggleIconCollapsed: { transform: 'rotate(-90deg)' },
  itemCount: { 
    backgroundColor: 'rgba(0, 122, 255, 0.15)', 
    padding: '0.2rem 0.6rem', 
    borderRadius: '12px', 
    fontSize: '0.75rem', 
    color: PALETTE.primary,
    fontWeight: 500,
  },
  progressBarContainer: { flexGrow: 1, maxWidth: '200px', height: '8px', backgroundColor: PALETTE.border, borderRadius: '4px', overflow: 'hidden' },
  progressBar: { height: '100%', backgroundColor: PALETTE.primary, transition: 'width 0.4s ease' },
  // --- Number Stepper ---
  stepper: { display: 'inline-flex', alignItems: 'center' },
  stepperBtn: { 
    width: '24px', height: '24px', 
    border: `1px solid ${PALETTE.border}`, 
    backgroundColor: 'rgba(255, 255, 255, 0.5)', 
    color: PALETTE.textSecondary, 
    cursor: 'pointer', 
    display: 'flex', 
    justifyContent: 'center', 
    alignItems: 'center', 
    transition: 'background-color 0.2s, color 0.2s',
  },
  stepperInput: { 
    width: '40px', 
    height: '24px', 
    textAlign: 'center', 
    border: 'none', 
    borderTop: `1px solid ${PALETTE.border}`,
    borderBottom: `1px solid ${PALETTE.border}`,
    padding: 0, 
    color: PALETTE.text,
    backgroundColor: 'rgba(248, 249, 250, 0.8)',
    appearance: 'none', 
    margin: 0, 
    outline: 'none',
  },
  // --- Modal Styles ---
  modalBackdrop: {
    position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    backdropFilter: 'blur(5px)',
    WebkitBackdropFilter: 'blur(5px)',
    display: 'flex', justifyContent: 'center', alignItems: 'center',
    zIndex: 1000,
    animation: 'fadeIn 0.3s ease'
  },
  modalContent: {
    backgroundColor: PALETTE.surfaceHeader,
    padding: '2rem',
    borderRadius: '16px',
    boxShadow: PALETTE.shadow,
    border: `1px solid rgba(255, 255, 255, 0.25)`,
    width: '100%',
    maxWidth: '400px',
    animation: 'slideInUp 0.3s ease-out'
  },
  modalTitle: { margin: '0 0 0.5rem 0', fontSize: '1.25rem', color: PALETTE.text, fontWeight: 600 },
  modalText: { margin: '0 0 1.5rem 0', color: PALETTE.textSecondary, fontSize: '0.9rem' },
  modalActions: { display: 'flex', justifyContent: 'flex-end', gap: '1rem' },
  modalButton: {
    padding: '0.6rem 1.2rem', 
    border: 'none', 
    borderRadius: '8px', 
    cursor: 'pointer',
    fontWeight: 500,
    transition: 'background-color 0.2s, transform 0.1s'
  },
  modalButtonConfirm: { backgroundColor: PALETTE.primary, color: 'white' },
  modalButtonCancel: { backgroundColor: PALETTE.border, color: PALETTE.textSecondary },
};

//==============================================================================
// 4. COMPONENTES HIJOS
//==============================================================================
const StatusIcon = ({ total, max }: { total: number; max: number }) => {
  if (total > max) {
    return <svg style={{ color: PALETTE.warning, width: 20, height: 20, verticalAlign: 'middle' }} fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.21 3.03-1.742 3.03H4.42c-1.532 0-2.492-1.696-1.742-3.03l5.58-9.92zM10 13a1 1 0 110-2 1 1 0 010 2zm-1-8a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1z" clipRule="evenodd"></path></svg>;
  }
  if (total > 0) {
    return <svg style={{ color: PALETTE.success, width: 20, height: 20, verticalAlign: 'middle' }} fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path></svg>;
  }
  return <svg style={{ color: PALETTE.border, width: 20, height: 20, verticalAlign: 'middle' }} fill="currentColor" viewBox="0 0 20 20"><path d="M10 2a8 8 0 100 16 8 8 0 000-16zM5.293 6.707a1 1 0 011.414-1.414L10 8.586l3.293-3.293a1 1 0 111.414 1.414L11.414 10l3.293 3.293a1 1 0 01-1.414 1.414L10 11.414l-3.293 3.293a1 1 0 01-1.414-1.414L8.586 10 5.293 6.707z" /></svg>;
};

const NumberStepper = ({ value, onChange }: { value: number; onChange: (newValue: number) => void; }) => {
  const handleStep = (step: number) => {
    const newValue = value + step;
    if (newValue >= 0) {
      onChange(newValue);
    }
  };
    
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = parseInt(e.target.value, 10);
      if (!isNaN(newValue) && newValue >= 0) {
          onChange(newValue);
      } else if (e.target.value === '') {
          onChange(0);
      }
  };

  return (
    <div style={STYLES.stepper}>
      <button style={{...STYLES.stepperBtn, borderRadius: '4px 0 0 4px'}} onMouseDown={e => e.currentTarget.style.backgroundColor = PALETTE.border} onMouseUp={e => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.5)'} onClick={() => handleStep(-1)}>-</button>
      <input type="text" pattern="\d*" value={value} onChange={handleChange} style={STYLES.stepperInput} />
      <button style={{...STYLES.stepperBtn, borderRadius: '0 4px 4px 0'}} onMouseDown={e => e.currentTarget.style.backgroundColor = PALETTE.border} onMouseUp={e => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.5)'} onClick={() => handleStep(1)}>+</button>
    </div>
  );
};

const ConfirmationModal = ({ isVisible, onConfirm, onCancel, title, children }: { isVisible: boolean, onConfirm: () => void, onCancel: () => void, title: string, children: React.ReactNode }) => {
  if (!isVisible) return null;
  return (
    <div style={STYLES.modalBackdrop}>
      <div style={STYLES.modalContent}>
        <h2 style={STYLES.modalTitle}>{title}</h2>
        <p style={STYLES.modalText}>{children}</p>
        <div style={STYLES.modalActions}>
          <button className="btn-active" onClick={onCancel} style={{ ...STYLES.modalButton, ...STYLES.modalButtonCancel }}>No, Cancelar</button>
          <button className="btn-active" onClick={onConfirm} style={{ ...STYLES.modalButton, ...STYLES.modalButtonConfirm }}>Sí, Guardar</button>
        </div>
      </div>
    </div>
  );
};

//==============================================================================
// 5. COMPONENTE PRINCIPAL: App
//==============================================================================
const App = () => {
  const [data, setData] = useState<DataItem[]>([]);
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth());
  const [selectedService, setSelectedService] = useState<string>("PACIENTES");
  const [activeTab, setActiveTab] = useState<ActiveTab>("programacion");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set());
  const [showToast, setShowToast] = useState<{ message: string; visible: boolean; type: 'success' | 'warning' }>({ message: '', visible: false, type: 'warning' });
  const [isConfirmModalVisible, setIsConfirmModalVisible] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setData(generateMockData());
    const timer = setTimeout(() => setIsLoaded(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const totals = useMemo(() => {
    const itemTotals: { [itemId: string]: { programacion: number; diaria: number } } = {};
    data.forEach(item => {
      let progTotal = 0;
      let diaTotal = 0;
      Object.values(item.dailyData).forEach(d => {
        progTotal += d.programacion;
        diaTotal += d.desayuno + d.comida + d.cena;
      });
      itemTotals[item.id] = { programacion: progTotal, diaria: diaTotal };
    });
    return itemTotals;
  }, [data]);

  const groupedData = useMemo<GroupedData>(() => {
    const term = searchTerm.toLowerCase().trim();
    const sourceData = data.reduce<GroupedData>((acc, item) => {
        const groupName = item.group.name;
        if (!acc[groupName]) {
            acc[groupName] = { items: [], totalProgramado: 0, totalMaximo: 0 };
        }
        acc[groupName].items.push(item);
        return acc;
    }, {});

    if (!term) {
        return sourceData;
    }

    const filteredData: GroupedData = {};
    Object.keys(sourceData).forEach(groupName => {
        const filteredItems = sourceData[groupName].items.filter(item =>
            item.code.toLowerCase().includes(term) ||
            item.description.toLowerCase().includes(term)
        );
        if (filteredItems.length > 0) {
            filteredData[groupName] = { ...sourceData[groupName], items: filteredItems };
        }
    });

    return filteredData;
  }, [data, searchTerm]);
  
  useEffect(() => {
    Object.keys(groupedData).forEach(groupName => {
        let totalProgramado = 0;
        let totalMaximo = 0;
        groupedData[groupName].items.forEach(item => {
            totalProgramado += totals[item.id]?.programacion || 0;
            totalMaximo += item.maxQuantity;
        });
        groupedData[groupName].totalProgramado = totalProgramado;
        groupedData[groupName].totalMaximo = totalMaximo;
    });
  }, [groupedData, totals]);

  const handleShowToast = useCallback((message: string, type: 'success' | 'warning' = 'warning') => {
    setShowToast({ message, visible: true, type });
    setTimeout(() => setShowToast({ message: '', visible: false, type }), 3000);
  }, []);

  const handleValueChange = useCallback((itemId: string, day: number, type: MealType, newValue: number) => {
    setData(prevData => {
      const newData = [...prevData];
      const itemIndex = newData.findIndex(i => i.id === itemId);
      if (itemIndex === -1) return prevData;

      const itemToUpdate = { ...newData[itemIndex] };
      const currentDailyData = { ...itemToUpdate.dailyData[day] };
      const oldValue = currentDailyData[type];
      const currentTotal = totals[itemId].programacion;
      
      let newProgramacionTotal = currentTotal;
      if (type === 'programacion') newProgramacionTotal = currentTotal - oldValue + newValue;
      
      if (type === 'programacion' && newProgramacionTotal > itemToUpdate.maxQuantity) {
        handleShowToast(`Excede el máximo permitido (${itemToUpdate.maxQuantity})`, 'warning');
        return prevData;
      }

      currentDailyData[type] = newValue;
      itemToUpdate.dailyData = { ...itemToUpdate.dailyData, [day]: currentDailyData };
      newData[itemIndex] = itemToUpdate;
      
      return newData;
    });
  }, [totals, handleShowToast]);

  const toggleGroup = useCallback((groupName: string) => {
    setCollapsedGroups(prev => {
      const newSet = new Set(prev);
      if (newSet.has(groupName)) {
        newSet.delete(groupName);
      } else {
        newSet.add(groupName);
      }
      return newSet;
    });
  }, []);
  
  const handleSave = () => {
    setIsConfirmModalVisible(true);
  };
  
  const handleConfirmSave = () => {
    const newOrderId = `PED-${Date.now()}`;
    
    // Reset data logic
    setData(prevData => prevData.map(item => {
      const newDailyData = { ...item.dailyData };
      Object.keys(newDailyData).forEach(day => {
        newDailyData[day] = { programacion: 0, desayuno: 0, comida: 0, cena: 0 };
      });
      return { ...item, dailyData: newDailyData };
    }));
    
    setIsConfirmModalVisible(false);
    handleShowToast(`¡Guardado con éxito! Pedido: ${newOrderId}`, 'success');
  };

  const handleExport = useCallback(() => {
    handleShowToast(`Exportando datos de: ${activeTab.toUpperCase()}`, 'success');
  }, [activeTab, handleShowToast]);

  const months = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
  const services = ["PACIENTES", "COMEDOR", "NUTRICIÓN CLÍNICA"];
  const daysArray = Array.from({ length: 31 }, (_, i) => i + 1);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        
        @keyframes fadeIn { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes slideInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes move-aurora {
          0% { transform: translate(var(--x-0), var(--y-0)); }
          25% { transform: translate(var(--x-1), var(--y-1)); }
          50% { transform: translate(var(--x-2), var(--y-2)); }
          75% { transform: translate(var(--x-3), var(--y-3)); }
          100% { transform: translate(var(--x-0), var(--y-0)); }
        }

        .select-focus:focus, .input-focus:focus { 
          outline: none; 
          border-color: ${PALETTE.primary}; 
          box-shadow: 0 0 0 3px ${PALETTE.primaryLight}; 
        }
        .btn-hover:hover { 
          background-color: ${PALETTE.primaryDark}; 
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 122, 255, 0.3);
        }
        .btn-active:active { 
          transform: translateY(-1px);
          box-shadow: 0 2px 6px rgba(0, 122, 255, 0.3);
        }
        .table-row-hover:hover { 
          background-color: ${PALETTE.primaryLight} !important; 
        }
        
        .table-row-hover:hover .sticky-cell-class {
          background-color: ${PALETTE.primaryLightOpaque} !important;
        }

        /* Custom Scrollbar */
        .datatable-wrapper::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }
        .datatable-wrapper::-webkit-scrollbar-track {
          background: rgba(0,0,0,0.05);
          border-radius: 4px;
        }
        .datatable-wrapper::-webkit-scrollbar-thumb {
          background: rgba(0,0,0,0.2);
          border-radius: 4px;
        }
        .datatable-wrapper::-webkit-scrollbar-thumb:hover {
          background: rgba(0,0,0,0.3);
        }
      `}</style>
      <div style={STYLES.appContainer}>
        {/* Animated Aurora Background */}
        <div style={{
          content: '""', position: 'absolute', top: 0, left: 0, width: '150%', height: '150%', zIndex: -1,
          '--x-0': '-50vw', '--y-0': '-50vh', '--x-1': '50vw', '--y-1': '-25vh', '--x-2': '0vw', '--y-2': '50vh', '--x-3': '-30vw', '--y-3': '20vh',
          animation: 'move-aurora 25s linear infinite',
          backgroundImage: 'radial-gradient(circle at center, rgba(0, 122, 255, 0.15) 0%, transparent 40%)',
          filter: 'blur(100px)',
        }}></div>
        <div style={{
          content: '""', position: 'absolute', top: 0, left: 0, width: '150%', height: '150%', zIndex: -1,
          '--x-0': '50vw', '--y-0': '50vh', '--x-1': '-20vw', '--y-1': '20vh', '--x-2': '30vw', '--y-2': '-40vh', '--x-3': '0vw', '--y-3': '0vh',
          animation: 'move-aurora 35s linear infinite reverse',
          backgroundImage: 'radial-gradient(circle at center, rgba(80, 227, 194, 0.15) 0%, transparent 40%)',
          filter: 'blur(100px)',
        }}></div>
        
        <header style={STYLES.header}>
          <div style={STYLES.headerTop}>
            <div>
              <h1 style={STYLES.headerTitle}>{`PROGRAMACIÓN ${months[selectedMonth].toUpperCase()} 2025`}</h1>
              <p style={STYLES.headerSubtitle}>{selectedService}</p>
            </div>
            <div style={STYLES.headerRightContainer}>
              <p style={STYLES.userInfo}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style={{ color: PALETTE.textSecondary }}><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"></path></svg>
                <span>Usuario Activo: <strong>Juan Pérez</strong></span>
              </p>
              <div style={STYLES.headerControls}>
                <div style={STYLES.selectGroup}>
                  <label htmlFor="month-select" style={STYLES.selectLabel}>Mes</label>
                  <select id="month-select" className="select-focus" style={STYLES.styledSelect} value={selectedMonth} onChange={e => setSelectedMonth(Number(e.target.value))}>
                    {months.map((m, i) => <option key={i} value={i}>{m}</option>)}
                  </select>
                </div>
                <div style={STYLES.selectGroup}>
                  <label htmlFor="service-select" style={STYLES.selectLabel}>Servicio</label>
                  <select id="service-select" className="select-focus" style={STYLES.styledSelect} value={selectedService} onChange={e => setSelectedService(e.target.value)}>
                    {services.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <button className="btn-hover btn-active" style={STYLES.btn} onClick={handleExport}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                  Exportar
                </button>
              </div>
            </div>
          </div>
        </header>
        
        <main style={STYLES.mainContent}>
          <div style={STYLES.controlsBar}>
            <div style={STYLES.tabs}>
              {(['programacion', 'diaria', 'consolidado'] as ActiveTab[]).map(tab => (
                <button key={tab} style={{...STYLES.tab, ...(activeTab === tab && STYLES.tabActive)}} onClick={() => setActiveTab(tab)}>
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>
            <div style={STYLES.searchAndSaveContainer}>
              <input type="search" placeholder="Buscar por código o descripción..." className="input-focus" style={STYLES.searchInput} value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
              <button className="btn-hover btn-active" style={{...STYLES.btn, backgroundColor: PALETTE.success}} onClick={handleSave}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path><polyline points="17 21 17 13 7 13 7 21"></polyline><polyline points="7 3 7 8 15 8"></polyline></svg>
                Guardar
              </button>
            </div>
          </div>

          <div style={STYLES.datatableWrapper} className="datatable-wrapper">
            <table style={STYLES.table}>
              <thead>
                <tr>
                  <th style={{...STYLES.th, ...STYLES.stickyHeader, left: 0, minWidth: '80px', boxShadow: `inset -1px 0 0 ${PALETTE.border}`}}>Código</th>
                  <th style={{...STYLES.th, ...STYLES.stickyHeader, left: '81px', minWidth: '200px', boxShadow: `inset -1px 0 0 ${PALETTE.border}` }}>Descripción</th>
                  <th style={{...STYLES.th, ...STYLES.stickyHeader, left: '282px', minWidth: '80px', borderRight: `1px solid ${PALETTE.border}` }}>Unidad</th>
                  
                  {activeTab === 'programacion' && daysArray.map(day => <th key={day} style={STYLES.th}>{day}</th>)}
                  
                  {activeTab === 'diaria' && daysArray.map(day => <th key={day} colSpan={3} style={{...STYLES.th, textAlign: 'center', borderRight: `2px solid ${PALETTE.border}`, boxShadow: `inset -1px 0 0 ${PALETTE.border}`}}>{day}</th>)}
                  
                  {activeTab === 'consolidado' && <>
                      <th style={STYLES.th}>Total Programado</th>
                      <th style={STYLES.th}>Total Diario</th>
                  </>}
                  
                  <th style={{...STYLES.th, ...STYLES.stickyHeader, right: '180px', minWidth: '100px' }}>Máximo</th>
                  <th style={{...STYLES.th, ...STYLES.stickyHeader, right: '80px', minWidth: '100px' }}>Disponible</th>
                  <th style={{...STYLES.th, ...STYLES.stickyHeader, right: 0, minWidth: '80px', boxShadow: 'none' }}>Status</th>
                </tr>
                {activeTab === 'diaria' && (
                  <tr>
                    <th style={{...STYLES.th, ...STYLES.stickyHeader, top: '53px', left: 0, boxShadow: `inset -1px 0 0 ${PALETTE.border}` }}></th>
                    <th style={{...STYLES.th, ...STYLES.stickyHeader, top: '53px', left: '81px', boxShadow: `inset -1px 0 0 ${PALETTE.border}` }}></th>
                    <th style={{...STYLES.th, ...STYLES.stickyHeader, top: '53px', left: '282px', borderRight: `1px solid ${PALETTE.border}` }}></th>
                    
                    {daysArray.map(day => (
                      <React.Fragment key={`sub-${day}`}>
                          <th style={{...STYLES.th, top: '53px'}}>D</th>
                          <th style={{...STYLES.th, top: '53px'}}>C</th>
                          <th style={{...STYLES.th, top: '53px', borderRight: `2px solid ${PALETTE.border}`, boxShadow: `inset -1px 0 0 ${PALETTE.border}`}}>N</th>
                      </React.Fragment>
                    ))}

                    <th style={{...STYLES.th, ...STYLES.stickyHeader, top: '53px', right: '180px'}}></th>
                    <th style={{...STYLES.th, ...STYLES.stickyHeader, top: '53px', right: '80px' }}></th>
                    <th style={{...STYLES.th, ...STYLES.stickyHeader, top: '53px', right: 0, boxShadow: 'none' }}></th>
                  </tr>
                )}
              </thead>
              <tbody>
                {Object.entries(groupedData).map(([groupName, group], groupIndex) => (
                  <React.Fragment key={groupName}>
                    <tr style={{ ...STYLES.groupHeaderRow, backgroundColor: GROUP_HEADER_COLORS[groupIndex % GROUP_HEADER_COLORS.length] }} onClick={() => toggleGroup(groupName)}>
                      <td colSpan={99} style={{ ...STYLES.groupHeaderCell, borderBottomColor: `rgba(0,0,0,0.1)` }}>
                        <div style={STYLES.groupInfo}>
                          <svg style={{ ...STYLES.toggleIcon, ...(collapsedGroups.has(groupName) && STYLES.toggleIconCollapsed) }} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="6 9 12 15 18 9"></polyline></svg>
                          <span>{groupName}</span>
                          <span style={STYLES.itemCount}>{group.items.length} artículos</span>
                          <div style={STYLES.progressBarContainer}>
                            <div style={{ ...STYLES.progressBar, width: `${Math.min(100, (group.totalProgramado / (group.totalMaximo || 1)) * 100)}%` }}></div>
                          </div>
                          <small style={{ fontWeight: 500, color: PALETTE.textSecondary }}>
                            {group.totalProgramado} / {group.totalMaximo}
                          </small>
                        </div>
                      </td>
                    </tr>
                    {!collapsedGroups.has(groupName) && group.items.map(item => {
                      const itemTotals = totals[item.id] || { programacion: 0, diaria: 0};
                      const available = item.maxQuantity - itemTotals.programacion;
                      return (
                        <tr key={item.id} style={STYLES.tableRow} className="table-row-hover">
                          <td className="sticky-cell-class" style={{...STYLES.td, ...STYLES.stickyCell, left: 0, borderRight: 'none'}}>{item.code}</td>
                          <td className="sticky-cell-class" style={{...STYLES.td, ...STYLES.stickyCell, left: '81px', borderRight: 'none'}}>{item.description}</td>
                          <td className="sticky-cell-class" style={{...STYLES.td, ...STYLES.stickyCell, left: '282px', borderRight: `1px solid ${PALETTE.border}`}}>{item.unit}</td>

                          {activeTab === 'programacion' && daysArray.map(day => (<td key={day} style={STYLES.td}><NumberStepper value={item.dailyData[day]?.programacion || 0} onChange={(val) => handleValueChange(item.id, day, 'programacion', val)} /></td>))}
                          
                          {activeTab === 'diaria' && daysArray.map((day) => (
                            <React.Fragment key={day}>
                              <td style={STYLES.td}><NumberStepper value={item.dailyData[day]?.desayuno || 0} onChange={(val) => handleValueChange(item.id, day, 'desayuno', val)} /></td>
                              <td style={STYLES.td}><NumberStepper value={item.dailyData[day]?.comida || 0} onChange={(val) => handleValueChange(item.id, day, 'comida', val)} /></td>
                              <td style={{...STYLES.td, borderRight: `2px solid ${PALETTE.border}`}}><NumberStepper value={item.dailyData[day]?.cena || 0} onChange={(val) => handleValueChange(item.id, day, 'cena', val)} /></td>
                            </React.Fragment>
                          ))}

                          {activeTab === 'consolidado' && (<><td style={STYLES.td}>{itemTotals.programacion}</td><td style={STYLES.td}>{itemTotals.diaria}</td></>)}
                          
                          <td className="sticky-cell-class" style={{...STYLES.td, ...STYLES.stickyCell, right: '180px'}}>{item.maxQuantity}</td>
                          <td className="sticky-cell-class" style={{...STYLES.td, ...STYLES.stickyCell, right: '80px', color: available < 0 ? PALETTE.danger : PALETTE.text}}>{available}</td>
                          <td className="sticky-cell-class" style={{...STYLES.td, ...STYLES.stickyCell, right: 0, textAlign: 'center', borderRight: 'none' }}><StatusIcon total={itemTotals.programacion} max={item.maxQuantity} /></td>
                        </tr>
                      );
                    })}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
          
          <ConfirmationModal 
            isVisible={isConfirmModalVisible}
            onConfirm={handleConfirmSave}
            onCancel={() => setIsConfirmModalVisible(false)}
            title="Confirmar Guardado"
          >
            ¿Estás seguro de que deseas guardar y finalizar la programación? Los valores actuales se restablecerán a cero.
          </ConfirmationModal>

          {showToast.visible && (
            <div style={{
              position: 'fixed', bottom: '20px', left: '50%', transform: 'translateX(-50%)',
              backgroundColor: showToast.type === 'success' ? PALETTE.success : PALETTE.warning, 
              color: 'white', padding: '12px 20px',
              borderRadius: '8px', boxShadow: PALETTE.shadow, zIndex: 1000,
              animation: 'slideInUp 0.3s ease-out forwards'
            }}>
              {showToast.message}
            </div>
          )}
        </main>
      </div>
    </>
  );
};

export default App;


