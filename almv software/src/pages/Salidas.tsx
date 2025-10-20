import React, { useState, useEffect, useCallback, useRef } from 'react';

//==============================================================================
// 1. TIPOS Y ESTRUCTURAS DE DATOS (Type-First Development)
//==============================================================================

interface Article {
  codigo: string;
  descripcion: string;
  unidad: string;
}

interface StaffMember {
  id: string;
  name: string;
}

interface OrderItem {
  codigo: string;
  descripcion: string;
  unidad: string;
  cantPedida: number;
  cantSurtida: string;
  observaciones: string;
  isNew?: boolean; // Flag para diferenciar filas nuevas de las precargadas
}

interface ModalState {
  isOpen: boolean;
  itemIndex: number | null;
  reason: string;
}

// Alias para React.CSSProperties para mayor claridad
type StyleObject = React.CSSProperties;

//==============================================================================
// 2. DATOS MAESTROS Y CONSTANTES
//==============================================================================

const ARTICLES_DATA: Article[] = [
  { codigo: 'VIV-001', descripcion: 'ACEITE COMESTIBLE', unidad: 'LT' },
  { codigo: 'VIV-002', descripcion: 'ARROZ SUPER EXTRA', unidad: 'KG' },
  { codigo: 'VIV-003', descripcion: 'ATUN EN ACEITE', unidad: 'LATA' },
  { codigo: 'VIV-004', descripcion: 'AVENA EN HOJUELAS', unidad: 'KG' },
  { codigo: 'VIV-005', descripcion: 'AZUCAR ESTANDAR', unidad: 'KG' },
  { codigo: 'VIV-006', descripcion: 'FRIJOL NEGRO', unidad: 'KG' },
  { codigo: 'VIV-007', descripcion: 'HUEVO BLANCO', unidad: 'KG' },
  { codigo: 'VIV-008', descripcion: 'LECHE ENTERA', unidad: 'LT' },
];

const STAFF_DATA: StaffMember[] = [
  { id: '001', name: 'GARCIA LOPEZ, ANA' },
  { id: '002', name: 'MARTINEZ RUIZ, JUAN' },
  { id: '003', name: 'PEREZ SOTO, MARIA' },
];

const ACTIVE_USER = STAFF_DATA[2]; // Simulación de usuario activo

const PRESET_SIGNATURES = {
    jefeServicio: "KARLA MABEL GUTIERREZ VELASCO",
    almacen: "OSCAR BECERRA GONZALEZ",
    jefeServicioRud: "2866868",
    almacenRud: "9889833",
    entregadoDefault: "Seleccione firmante...",
    recibidoDefault: "2819945" 
};

const SERVICES_DATA: string[] = ['PACIENTES', 'COMEDOR', 'NUTRICIÓN CLÍNICA', 'DIRECCIÓN'];

const PARTIAL_DELIVERY_REASONS: string[] = [
  'Falta de stock en almacén',
  'Artículo dañado o en mal estado',
  'Ajuste por inventario',
  'Otro (especificar en observaciones)',
];

const MONTHLY_SCHEDULE_DATA: Record<string, Record<string, { cantidad: number }>> = {
  'PACIENTES': { 'VIV-002': { cantidad: 15 }, 'VIV-007': { cantidad: 20 }, 'VIV-008': { cantidad: 30 } },
  'COMEDOR': { 'VIV-001': { cantidad: 10 }, 'VIV-005': { cantidad: 50 }, 'VIV-006': { cantidad: 25 } },
  'NUTRICIÓN CLÍNICA': { 'VIV-003': { cantidad: 12 }, 'VIV-004': { cantidad: 8 } }
};

//==============================================================================
// 3. FUNCIONES DE UTILIDAD PURAS
//==============================================================================
const numberToWords = (n: number): string => {
  if (isNaN(n) || n < 0) return '';
  const num = Math.floor(n);
  if (num === 0) return 'CERO';
  const unidades = ['', 'UNO', 'DOS', 'TRES', 'CUATRO', 'CINCO', 'SEIS', 'SIETE', 'OCHO', 'NUEVE'];
  const decenas = ['', 'DIEZ', 'VEINTE', 'TREINTA', 'CUARENTA', 'CINCUENTA', 'SESENTA', 'SETENTA', 'OCHENTA', 'NOVENTA'];
  const centenas = ['', 'CIENTO', 'DOSCIENTOS', 'TRESCIENTOS', 'CUATROCIENTOS', 'QUINIENTOS', 'SEISCIENTOS', 'SETECIENTOS', 'OCHOCIENTOS', 'NOVECIENTOS'];
  if (num >= 1000) return String(num);
  let words = '';
  let tempN = num;
  if (tempN >= 100) {
    if (tempN === 100) return 'CIEN';
    words += centenas[Math.floor(tempN / 100)] + ' ';
    tempN %= 100;
  }
  if (tempN >= 10) {
    if (tempN < 20) {
      const teens: Record<number, string> = {10: 'DIEZ', 11: 'ONCE', 12: 'DOCE', 13: 'TRECE', 14: 'CATORCE', 15: 'QUINCE'};
      words += teens[tempN] || 'DIECI' + unidades[tempN - 10];
      tempN = 0;
    } else {
      words += decenas[Math.floor(tempN / 10)];
      if (tempN % 10 > 0) words += ' Y ';
      tempN %= 10;
    }
  }
  if (tempN > 0) words += unidades[tempN];
  return words.trim();
};

// Componente para la caja de firma con el diseño EXACTO de la imagen
const SignatureBox: React.FC<{ 
    title: string, 
    name: string, 
    rud: string | React.ReactNode, 
    isEditable: boolean, 
    selectValue?: string, 
    onSelectChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void,
    isLocked?: boolean 
}> = ({ title, name, rud, isEditable, selectValue, onSelectChange, isLocked }) => {

    const showRud = !title.includes('JEFE') && !title.includes('ALMACÉN');
    
    // Contenido que va en el selector o el nombre fijo
    const content = isEditable ? (
        <select 
            value={selectValue} 
            onChange={onSelectChange} 
            style={styles.signatureSelect}
            disabled={isLocked}
        >
            <option value="">{PRESET_SIGNATURES.entregadoDefault}</option>
            {STAFF_DATA.map(p => <option key={p.id} value={p.name}>{p.name}</option>)}
        </select>
    ) : (
        <div style={styles.signatureNameDisplay}>{name}</div>
    );

    return (
        <div style={styles.signatureOuterBox}>
            {/* Título Superior con Separador */}
            <div style={styles.signatureTitle}>{title}</div>
            
            <div style={styles.signatureContent}>
                
                {/* Nombre/Selector */}
                <div style={isEditable ? styles.signatureSelectContainer : {}}>
                    {content}
                </div>

                {/* Línea R.U.D. / Cédula (Solo visible si no es Jefe/Almacén) */}
                <div style={styles.signatureRUD}>
                    {showRud ? rud : PRESET_SIGNATURES.jefeServicioRud}
                </div>
                
                {/* Línea de Firma Inferior (Nombre y Firma / Nombre y R.U.D.) */}
                <div style={styles.signatureLabelFinal}>
                    {showRud ? 'NOMBRE Y R.U.D.' : 'NOMBRE Y FIRMA'}
                </div>
            </div>
        </div>
    );
};


//==============================================================================
// 4. EL COMPONENTE PRINCIPAL (App)
//==============================================================================
const App: React.FC = () => {
  const [orderDate, setOrderDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [requestingService, setRequestingService] = useState<string>('');
  const [items, setItems] = useState<OrderItem[]>([]);
  const [folio, setFolio] = useState<{ number: string; timestamp: string } | null>(null);
  const [isFormLocked, setIsFormLocked] = useState<boolean>(false);
  const [deliveredBy, setDeliveredBy] = useState<string>('');
  const [receivedBy, setReceivedBy] = useState<string>('');
  const [modalState, setModalState] = useState<ModalState>({ isOpen: false, itemIndex: null, reason: '' });
  const [autocomplete, setAutocomplete] = useState<{ index: number | null; term: string }>({ index: null, term: '' });
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [error, setError] = useState<{ message: string; show: boolean }>({ message: '', show: false });

  const surtidaInputsRef = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    surtidaInputsRef.current = surtidaInputsRef.current.slice(0, items.length);
  }, [items.length]);

  useEffect(() => {
    // Inicializa el campo 'Recibido Por' con el usuario activo simulado
    setReceivedBy(ACTIVE_USER.name);
  }, []);

  useEffect(() => {
    if (isFormLocked) return;
    if (requestingService && MONTHLY_SCHEDULE_DATA[requestingService]) {
      const scheduledItems = MONTHLY_SCHEDULE_DATA[requestingService];
      const newItems: OrderItem[] = Object.entries(scheduledItems).map(([itemCode, data]) => {
        const article = ARTICLES_DATA.find(a => a.codigo === itemCode);
        return {
          codigo: itemCode,
          descripcion: article?.descripcion || 'Artículo no encontrado',
          unidad: article?.unidad || 'N/A',
          cantPedida: data.cantidad,
          cantSurtida: '',
          observaciones: '',
          isNew: false, // Marcar como fila precargada
        };
      });
      setItems(newItems);
    } else {
      setItems([]);
    }
  }, [requestingService, isFormLocked]);

  useEffect(() => {
    const style = document.createElement('style');
    style.innerHTML = `
      @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap');
      @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
      @keyframes stampIn { 0% { opacity: 0; transform: scale(0.5); } 70% { opacity: 1; transform: scale(1.05); } 100% { opacity: 1; transform: scale(1); } }
      @keyframes popIn { from { opacity: 0; transform: scale(0.9); } to { opacity: 1; transform: scale(1); } }
      @media print {
        body { background: #fff !important; } .no-print { display: none !important; }
        .printable-area { box-shadow: none !important; border: 1px solid #ccc; width: 210mm !important; min-height: 297mm !important; margin: 0 auto; background: #fff !important; }
        .signatureBox > div { height: 40px; } /* Ajuste de altura para impresión */
      }`;
    document.head.appendChild(style);
    return () => { document.head.removeChild(style); };
  }, []);

  const handleAddItemRow = useCallback(() => {
    if (isFormLocked) return;
    setItems(prev => [...prev, { codigo: '', descripcion: '', unidad: '', cantPedida: 0, cantSurtida: '', observaciones: '', isNew: true }]);
  }, [isFormLocked]);
  
  const handleSurtidaChange = useCallback((index: number, value: string) => {
    if (isFormLocked) return;
    setItems(prev => {
      const newItems = [...prev];
      newItems[index] = { ...newItems[index], cantSurtida: value };
      return newItems;
    });
  }, [isFormLocked]);
  
  const handleSurtidaKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key !== 'Enter') return;
    e.preventDefault();

    const item = items[index];
    const cantPedida = Number(item.cantPedida);
    const cantSurtidaNum = Number(item.cantSurtida);

    if (isNaN(cantSurtidaNum) || item.cantSurtida === '') return;

    if (cantSurtidaNum > cantPedida) {
      setError({ message: 'La cantidad surtida no puede ser mayor a la pedida.', show: true });
      setTimeout(() => setError({ message: '', show: false }), 3000);
      return;
    }
    
    setItems(prev => {
        const newItems = [...prev];
        newItems[index] = { ...newItems[index], observaciones: numberToWords(cantSurtidaNum) };
        return newItems;
    });

    if (cantSurtidaNum < cantPedida) {
      setModalState({ isOpen: true, itemIndex: index, reason: '' });
    } else {
      const nextInput = surtidaInputsRef.current[index + 1];
      if (nextInput) { nextInput.focus(); } else { (e.target as HTMLInputElement).blur(); }
    }
  }, [items]);

  const handleAutocompleteSelect = useCallback((itemIndex: number, article: Article) => {
    if (isFormLocked) return;
    setItems(prev => {
        const newItems = [...prev];
        // Para nuevas filas, si se selecciona un artículo, se asume que la cantidad pedida debe ser ingresada por el usuario.
        newItems[itemIndex] = { ...newItems[itemIndex], ...article, cantPedida: newItems[itemIndex].cantPedida || 1 }; 
        return newItems;
    });
    setAutocomplete({ index: null, term: '' });
  }, [isFormLocked]);
  
  const handleConfirmPartialDelivery = useCallback(() => {
    if (modalState.itemIndex === null || isFormLocked) return;
    
    setItems(prev => {
        const newItems = [...prev];
        const item = newItems[modalState.itemIndex];
        item.observaciones += ` (MOTIVO: ${modalState.reason.toUpperCase()})`;
        return newItems;
    });

    const nextInput = surtidaInputsRef.current[modalState.itemIndex + 1];
    if (nextInput) nextInput.focus();

    setModalState({ isOpen: false, itemIndex: null, reason: '' });
  }, [modalState, isFormLocked]);

  const handleCancelPartialDelivery = useCallback(() => {
    if (modalState.itemIndex !== null) {
      setItems(prev => {
          const newItems = [...prev];
          newItems[modalState.itemIndex] = { ...newItems[modalState.itemIndex], cantSurtida: '', observaciones: '' };
          return newItems;
      });
    }
    setModalState({ isOpen: false, itemIndex: null, reason: '' });
  }, [modalState.itemIndex]);
  
  const handleRegisterFolio = useCallback(() => {
    if (isFormLocked) return;
    const now = new Date();
    const folioNumber = `F.R.A. ${String(Math.floor(Math.random() * 9000000) + 1000000)}`; 
    setFolio({
      number: folioNumber,
      timestamp: now.toLocaleString('es-MX', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: true })
    });
    setIsFormLocked(true);
  }, [isFormLocked]);
  
  const handleResetForm = useCallback(() => setIsResetModalOpen(true), []);

  const handleConfirmReset = useCallback(() => {
    setOrderDate(new Date().toISOString().split('T')[0]);
    setRequestingService('');
    setItems([]);
    setFolio(null);
    setIsFormLocked(false);
    setDeliveredBy('');
    setReceivedBy(ACTIVE_USER.name);
    setModalState({ isOpen: false, itemIndex: null, reason: '' });
    setAutocomplete({ index: null, term: '' });
    setIsResetModalOpen(false);
    setError({ message: '', show: false });
  }, []);
  
  const filteredArticles = autocomplete.term.length > 1
    ? ARTICLES_DATA.filter(art => art.descripcion.toLowerCase().includes(autocomplete.term.toLowerCase()))
    : [];

  return (
    <div style={styles.page}>
      
      {error.show && <div className="no-print" style={styles.errorBanner}>{error.message}</div>}

      <div style={styles.container} className="printable-area">
        {folio && (
          <div style={{...styles.folioStamp, animation: 'stampIn 0.5s ease-out forwards'}}>
            <p style={styles.folioLine1}>{folio.number.split(' ')[0]} {folio.number.split(' ')[1]}</p>
            <p style={styles.folioLine2}>{folio.timestamp.toUpperCase()}</p>
            <p style={styles.folioLine3}>ALMACÉN DE VÍVERES FAA SALIDAS</p>
          </div>
        )}

        <header style={styles.header}>
          <img src="https://hcg.gob.mx/hcg/sites/hcgtransparencia.dd/files/styles/boletines_galeria_eventos/public/imgEventosCS/Logotipo%20HCG_2.jpg?itok=BxoX-M0A" alt="Logo HCG" style={styles.headerLogo} />
          <div style={styles.headerText}>
            <h1 style={styles.headerTitle}>HOSPITAL CIVIL DE GUADALAJARA</h1>
            <h2 style={styles.headerSubtitle}>PEDIDO AL ALMACEN DE VÍVERES</h2>
          </div>
        </header>

        <section style={styles.controlsSection}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', minWidth: '250px' }}>
            <span style={styles.inputLabelBold}>Fecha:</span>
             <div style={styles.inputWithIconContainer}>
               {/* El icono de calendario lo maneja input type=date. Se ajusta padding para evitar conflictos */}
               <input type="date" value={orderDate} onChange={e => setOrderDate(e.target.value)} style={{...styles.input, paddingRight: '0.7rem', cursor: isFormLocked ? 'default' : 'text', flex: 1}} disabled={isFormLocked} readOnly={isFormLocked} />
             </div>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', width: '300px', maxWidth: '300px' }}>
            <span style={styles.inputLabelBold}>Servicio:</span>
             <div style={styles.inputWithIconContainer}>
               <span style={styles.inputIconService}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
               </span>
               <select value={requestingService} onChange={e => setRequestingService(e.target.value)} style={{...styles.select, paddingLeft: '2.5rem', cursor: isFormLocked ? 'default' : 'pointer'}} disabled={isFormLocked}>
                 <option value="">-- Seleccionar Servicio --</option>
                 {SERVICES_DATA.map(s => <option key={s} value={s}>{s}</option>)}
               </select>
             </div>
          </div>
        </section>

        <section style={{ marginTop: '2rem' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={styles.table}>
              <thead>
                <tr>
                  {['Código', 'Descripción del Artículo', 'Unidad de Medida', 'Cantidad Pedida', 'Cantidad Surtida', 'Observaciones'].map(h => 
                    <th key={h} style={{...styles.tableHeader, textAlign: (h.includes('Descripción') || h === 'Observaciones') ? 'left' : 'center', paddingLeft: (h.includes('Descripción') || h === 'Observaciones') ? '1rem' : '0'}}>
                        {h}
                    </th>
                  )}
                </tr>
              </thead>
              <tbody>
                {items.map((item, index) => {
                  const isCellLocked = isFormLocked || !item.isNew;
                  const isQtyEditable = !isFormLocked;
                  const isCantPedidaEditable = item.isNew && !isFormLocked;
                  // La celda de la Cantidad Surtida SIEMPRE es enfocable si el formulario no está bloqueado.
                  const isSurtidaCellFocusable = !isFormLocked;

                  return (
                    <tr key={index} style={modalState.itemIndex === index ? {...styles.tableRow, ...styles.highlightRow} : styles.tableRow}>
                      {/* Código - Centrado (Bloqueado) */}
                      <td style={{...styles.tableCell, textAlign: 'center'}}>
                          <input type="text" value={item.codigo} style={{...styles.inputTable, ...styles.inputLockedWhite, textAlign: 'center'}} readOnly={true} tabIndex={-1} />
                      </td>
                      {/* Descripción - Izquierda (Bloqueado o Editable) */}
                      <td style={{...styles.tableCell, position: 'relative', textAlign: 'left'}}>
                          {item.isNew && !isFormLocked ? (
                              <>
                                  <input type="text" value={autocomplete.index === index ? autocomplete.term : item.descripcion} onChange={e => setAutocomplete({ index, term: e.target.value })} onFocus={() => setAutocomplete({ index, term: item.descripcion })} onBlur={() => setTimeout(() => setAutocomplete({ index: null, term: '' }), 200)} style={styles.inputTable} placeholder="Buscar artículo..." disabled={isFormLocked} />
                                  {autocomplete.index === index && filteredArticles.length > 0 && (
                                      <div style={styles.autocompleteItems}>
                                      {filteredArticles.map(art => ( <div key={art.codigo} onClick={() => handleAutocompleteSelect(index, art)} style={styles.autocompleteItem}><strong>[{art.codigo}]</strong> {art.descripcion}</div>))}
                                      </div>
                                  )}
                              </>
                          ) : (
                              <input type="text" value={item.descripcion} style={{...styles.inputTable, ...styles.inputLockedWhite}} readOnly={true} tabIndex={-1} />
                          )}
                      </td>
                      {/* Unidad de Medida - Centrado (Bloqueado) */}
                      <td style={{...styles.tableCell, textAlign: 'center'}}>
                          <input type="text" value={item.unidad} style={{...styles.inputTable, ...styles.inputLockedWhite, textAlign: 'center'}} readOnly={true} tabIndex={-1} />
                      </td>
                      {/* Cantidad Pedida - Centrado (Bloqueado o Editable si es nueva fila) */}
                      <td style={{...styles.tableCell, textAlign: 'center'}}>
                          <input type="text" value={item.cantPedida} 
                             onChange={e => {
                                 if(isCantPedidaEditable) setItems(prev => {
                                      const newItems = [...prev];
                                      newItems[index] = { ...newItems[index], cantPedida: Number(e.target.value) || 0 };
                                      return newItems;
                                 });
                             }}
                             style={{...styles.inputTable, ...(isCantPedidaEditable ? styles.inputEditable : styles.inputLockedWhite), textAlign: 'center'}} 
                             readOnly={!isCantPedidaEditable}
                             tabIndex={!isCantPedidaEditable ? -1 : 0} // Permitir foco si es editable
                          />
                      </td>
                      {/* Cantidad Surtida - Centrado (Siempre enfocable si el formulario no está bloqueado) */}
                      <td style={{...styles.tableCell, textAlign: 'center'}}>
                        <input ref={el => surtidaInputsRef.current[index] = el} type="number" min="0" max={item.cantPedida || undefined} value={item.cantSurtida} onChange={e => handleSurtidaChange(index, e.target.value)} onKeyDown={e => handleSurtidaKeyDown(e, index)} style={{...styles.inputTable, textAlign: 'center'}} disabled={!isQtyEditable} tabIndex={isSurtidaCellFocusable ? 0 : -1} />
                      </td>
                      {/* Observaciones - Izquierda (Bloqueado) */}
                      <td style={{...styles.tableCell, textAlign: 'left'}}>
                          <input type="text" value={item.observaciones} style={{...styles.inputTable, ...styles.inputLockedWhite, fontSize: '0.75rem'}} readOnly={true} tabIndex={-1} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div style={{ marginTop: '1rem', textAlign: 'right' }}>
            <button onClick={handleAddItemRow} style={isFormLocked ? {...styles.button, ...styles.buttonDisabled} : styles.button} disabled={isFormLocked}>+ Agregar Fila</button>
          </div>
        </section>

        <footer style={styles.footer}>
            <SignatureBox 
                title="JEFE DE SERVICIO DIETOLOGÍA" 
                name={PRESET_SIGNATURES.jefeServicio} 
                rud={PRESET_SIGNATURES.jefeServicioRud}
                isEditable={false}
            />
            <SignatureBox 
                title="ALMACÉN DE VÍVERES" 
                name={PRESET_SIGNATURES.almacen} 
                rud={PRESET_SIGNATURES.almacenRud}
                isEditable={false}
            />
            <SignatureBox 
                title="ENTREGADO POR" 
                name={deliveredBy || "MARTINEZ RUIZ, JUAN"} // Usamos un nombre de ejemplo si no hay selección
                rud={"2822349"} // Usamos un RUD de ejemplo
                isEditable={true}
                selectValue={deliveredBy}
                onSelectChange={e => setDeliveredBy(e.target.value)}
                isLocked={isFormLocked}
            />
            <SignatureBox 
                title="RECIBIDO POR" 
                name={receivedBy}
                rud={"2819945"} // Usamos un RUD de ejemplo
                isEditable={false}
            />
        </footer>
      </div>

      <div className="no-print" style={styles.fabContainer}>
        <button onClick={handleRegisterFolio} style={{...styles.fab, ...styles.fabGreen}} title="Registrar y Bloquear Folio" disabled={isFormLocked}>✓</button>
        <button onClick={() => window.print()} style={{...styles.fab, ...styles.fabBlue}} title="Imprimir Pedido">🖨️</button>
        <button onClick={handleResetForm} style={{...styles.fab, ...styles.fabRed}} title="Limpiar Formulario">🗑️</button>
      </div>

      {modalState.isOpen && (<div className="no-print" style={styles.modalOverlay}><div style={{...styles.modalContent, animation: 'popIn 0.3s ease-out forwards'}}><h3 style={styles.modalTitle}>Motivo de Entrega Parcial</h3><p style={styles.modalText}>La cantidad surtida es menor a la pedida. Por favor, seleccione un motivo.</p><select value={modalState.reason} onChange={e => setModalState(s => ({...s, reason: e.target.value}))} style={{...styles.select, width: '100%', marginTop: '1rem'}} disabled={isFormLocked}><option value="">-- Seleccionar Motivo --</option>{PARTIAL_DELIVERY_REASONS.map(r => <option key={r} value={r}>{r}</option>)}</select><div style={styles.modalActions}><button onClick={handleCancelPartialDelivery} style={{...styles.button, ...styles.buttonSecondary}}>Cancelar</button><button onClick={handleConfirmPartialDelivery} style={!modalState.reason || isFormLocked ? {...styles.button, ...styles.buttonDisabled} : styles.button} disabled={!modalState.reason || isFormLocked}>Confirmar</button></div></div></div>)}
      {isResetModalOpen && (<div className="no-print" style={styles.modalOverlay}><div style={{...styles.modalContent, animation: 'popIn 0.3s ease-out forwards'}}><h3 style={styles.modalTitle}>Confirmar Limpieza</h3><p style={styles.modalText}>¿Está seguro de que desea limpiar todos los campos del formulario? Esta acción no se puede deshacer.</p><div style={styles.modalActions}><button onClick={() => setIsResetModalOpen(false)} style={{...styles.button, ...styles.buttonSecondary}}>Cancelar</button><button onClick={handleConfirmReset} style={{...styles.button, ...styles.buttonRed}}>Limpiar Formulario</button></div></div></div>)}
    </div>
  );
};

//==============================================================================
// 5. ESTILOS (CSS-in-JS con enfoque moderno e institucional)
//==============================================================================
const styles: Record<string, StyleObject> = {
  page: { backgroundColor: '#eaf2f8', backgroundImage: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)', padding: '2rem', fontFamily: "'Poppins', sans-serif", minHeight: '100vh' },
  container: { backgroundColor: '#ffffff', maxWidth: '1200px', margin: '0 auto', padding: '2.5rem', borderRadius: '16px', boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)', border: '1px solid #e0e0e0', position: 'relative', animation: 'fadeIn 0.6s ease-out forwards', },
  folioStamp: { border: '3px double #b71c1c', color: '#b71c1c', padding: '10px 15px', borderRadius: '10px', fontFamily: "'Courier New', monospace", fontWeight: 'bold', textAlign: 'center', position: 'absolute', top: '2rem', right: '2.5rem', zIndex: 10 },
  folioLine1: { margin: 0, fontSize: '1rem', fontWeight: 700 },
  folioLine2: { margin: '2px 0', fontSize: '0.8rem' },
  folioLine3: { margin: 0, fontSize: '0.7rem', fontWeight: 600 },
  header: { display: 'flex', alignItems: 'center', gap: '1.5rem', paddingBottom: '1.5rem', borderBottom: '1px solid #003063' },
  headerLogo: { width: '70px', height: 'auto', objectFit: 'contain' },
  headerText: { flex: 1, textAlign: 'left' },
  headerTitle: { margin: 0, fontSize: '1.4rem', fontWeight: 700, color: '#003063' },
  headerSubtitle: { margin: '0.1rem 0', fontSize: '1.15rem', color: '#333', fontWeight: 700 },
  controlsSection: { display: 'flex', flexWrap: 'wrap', gap: '2rem', marginTop: '2rem', alignItems: 'flex-start' },
  
  // Etiqueta en negritas para Fecha/Servicio
  inputLabelBold: { fontWeight: 700, color: '#333', marginRight: '0.5rem', fontSize: '0.9rem', whiteSpace: 'nowrap', alignSelf: 'center' }, // Añadido alignSelf
  
  // Contenedor del input para manejar el icono interno
  inputWithIconContainer: { position: 'relative', display: 'flex', alignItems: 'center', flex: 1 },

  // Icono a la izquierda del servicio
  inputIconService: { position: 'absolute', left: '0.7rem', top: '50%', transform: 'translateY(-50%)', color: '#888', pointerEvents: 'none' }, 
  
  input: { width: '100%', padding: '0.7rem', border: '1px solid #ccc', borderRadius: '4px', boxSizing: 'border-box', fontSize: '0.9rem', transition: 'border-color 0.3s, box-shadow 0.3s', flexGrow: 1, paddingRight: '0.7rem' }, // Eliminado paddingLeft innecesario
  select: { width: '100%', padding: '0.7rem', border: '1px solid #ccc', borderRadius: '4px', backgroundColor: '#fff', fontSize: '0.9rem', transition: 'border-color 0.3s, box-shadow 0.3s', appearance: 'none', flexGrow: 1, paddingLeft: '2.5rem' },
  
  // Estilos de la tabla: Input sin bordes para la sensación de celda blanca
  inputTable: { width: '100%', padding: '0.5rem 0.2rem', border: 'none', backgroundColor: 'transparent', fontSize: '0.9rem', boxSizing: 'border-box', cursor: 'not-allowed' }, // Cursor not-allowed default
  inputLockedWhite: { backgroundColor: '#ffffff', color: '#333', border: 'none', cursor: 'not-allowed' }, // Cursor not-allowed asegurado
  inputEditable: { backgroundColor: '#fff', color: '#333', cursor: 'text', border: 'none' },

  // Estilos de la Tabla (con bordes internos)
  table: { width: '100%', borderCollapse: 'collapse', border: '1px solid #e0e0e0' },
  tableHeader: { 
    padding: '0.8rem 1rem', 
    border: '1px solid #e0e0e0',
    backgroundColor: '#f8f9fa',
    fontSize: '0.75rem', 
    fontWeight: 700, 
    textTransform: 'uppercase', 
    color: '#003063',
  },
  tableRow: { transition: 'background-color 0.2s' },
  highlightRow: { backgroundColor: 'rgba(255, 243, 205, 0.5)' },
  tableCell: { 
    padding: '0.1rem 0.3rem', 
    verticalAlign: 'middle',
    border: '1px solid #e0e0e0',
    backgroundColor: '#ffffff'
  },
  
  autocompleteItems: { position: 'absolute', backgroundColor: '#fff', border: '1px solid #003063', borderRadius: '4px', zIndex: 100, width: 'calc(100% - 2px)', maxHeight: '150px', overflowY: 'auto', boxShadow: '0 4px 8px rgba(0,0,0,0.1)' },
  autocompleteItem: { padding: '0.6rem', cursor: 'pointer', fontSize: '0.85rem', transition: 'background-color 0.2s' },
  
  // FOOTER AJUSTADO A UNA SOLA LÍNEA HORIZONTAL
  footer: { display: 'flex', justifyContent: 'space-between', gap: '1.5rem', marginTop: '4rem', paddingTop: '1.5rem' },

  // Estilos de Firma (Diseño EXACTO de la Réplica)
  signatureOuterBox: {
    backgroundColor: '#fff',
    borderRadius: '8px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    padding: '0rem 1rem 1rem 1rem',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'stretch',
    minHeight: '170px',
    flex: '1 1 200px',
  },
  signatureTitle: {
    fontSize: '0.8rem', 
    fontWeight: 600,
    color: '#4a5472', 
    padding: '1rem 0 0.5rem 0',
    borderBottom: '1px solid #e0e0e0',
    marginBottom: '0.5rem',
    textAlign: 'center',
    textTransform: 'uppercase',
  },
  signatureContent: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    flexGrow: 1,
    padding: '0.5rem 0',
    justifyContent: 'space-between' 
  },
  signatureNameDisplay: {
    fontWeight: 700, 
    fontSize: '0.9rem',
    color: '#333', 
    padding: '0.2rem 0',
    textAlign: 'center',
    lineHeight: 1.2,
  },
  signatureRUD: {
    fontSize: '0.75rem',
    color: '#4a5472', 
    marginTop: '0.2rem',
    marginBottom: '0.5rem', 
  },
  // Estilos para el campo seleccionable (Entregado Por)
  signatureSelectContainer: {
    width: '100%',
    padding: '0.5rem 0',
    borderBottom: '1px solid #e0e0e0', 
    marginBottom: '0.5rem',
    textAlign: 'center',
    minHeight: '30px', 
  },
  signatureSelect: {
    width: '100%',
    border: 'none',
    textAlign: 'center',
    fontWeight: '700', 
    fontSize: '0.9rem',
    appearance: 'none',
    backgroundColor: 'transparent',
    cursor: 'pointer',
    color: '#333', 
  },
  // Línea de texto final (NOMBRE Y FIRMA / NOMBRE Y R.U.D.)
  signatureLabelFinal: {
    paddingTop: '0.4rem',
    fontSize: '0.7rem',
    fontWeight: 600,
    color: '#4a5472', 
    textTransform: 'uppercase',
    borderTop: '1px solid transparent', 
  },
  // ---
  
  button: { padding: '0.7rem 1.2rem', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 600, transition: 'all 0.2s ease', fontSize: '0.9rem', backgroundColor: '#0056b3', color: '#fff', boxShadow: '0 2px 5px rgba(0, 86, 179, 0.2)' },
  buttonSecondary: { backgroundColor: '#6c757d' },
  buttonRed: { backgroundColor: '#c82333' },
  buttonDisabled: { backgroundColor: '#adb5bd', cursor: 'not-allowed', boxShadow: 'none' },
  fabContainer: { position: 'fixed', bottom: '2rem', right: '2rem', display: 'flex', flexDirection: 'column', gap: '0.8rem', zIndex: 1000 },
  fab: { width: '50px', height: '50px', borderRadius: '50%', color: '#fff', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem', boxShadow: '0 4px 10px rgba(0,0,0,0.2)', cursor: 'pointer', transition: 'all 0.2s ease' },
  fabGreen: { backgroundColor: '#28a745' },
  fabBlue: { backgroundColor: '#007bff' },
  fabRed: { backgroundColor: '#dc3545' },
  modalOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0, 0, 0, 0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000 },
  modalContent: { backgroundColor: '#fff', padding: '2rem', borderRadius: '8px', width: '100%', maxWidth: '450px', boxShadow: '0 5px 15px rgba(0,0,0,0.3)' },
  modalTitle: { marginTop: 0, fontSize: '1.3rem', color: '#003063', fontWeight: 700 },
  modalText: { color: '#333', lineHeight: 1.5 },
  modalActions: { display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1.5rem' },
  errorBanner: { position: 'fixed', top: '20px', left: '50%', transform: 'translateX(-50%)', backgroundColor: '#dc3545', color: '#fff', padding: '0.8rem 1.2rem', borderRadius: '6px', boxShadow: '0 2px 10px rgba(220, 53, 69, 0.4)', zIndex: 3000, fontSize: '0.9rem', animation: 'fadeIn 0.5s' },
};

export default App;

