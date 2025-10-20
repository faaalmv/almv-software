import React, { useState, useMemo, useCallback, useEffect, FC, CSSProperties } from 'react';

// =================================================================================
// 1. TIPOS Y MODELO DE DOMINIO (Inspirado en #1 y #5)
// =================================================================================

// Usamos un objeto constante para simular un enum, es una práctica común en JS/TS
const EstadoFactura = {
  RECEPCION: 'Recepción',
  EN_VALIDACION: 'En Validación',
  APROBADA: 'Aprobada',
  RECHAZADA: 'Rechazada',
  PAGADA: 'Pagada',
} as const; // 'as const' hace que los valores sean readonly y literales

const RolUsuario = {
  PROVEEDOR: 'Proveedor',
  VALIDADOR: 'Validador',
} as const;

type ValueOf<T> = T[keyof T];

interface User {
  id: string;
  nombre: string;
  rol: ValueOf<typeof RolUsuario>;
  rfc: string;
}

interface HistoryEntry {
  fecha: string; // ISO 8601
  etapa: ValueOf<typeof EstadoFactura>;
  usuario: string;
  motivo?: string;
}

interface Factura {
  id: string;
  proveedorId: string;
  folioFiscal: string;
  razonSocial: string;
  rfc: string;
  monto: number;
  fechaCarga: string; // ISO 8601
  estadoActual: ValueOf<typeof EstadoFactura>;
  ordenDeCompraId: string | null;
  historial: HistoryEntry[];
}

interface OrdenDeCompra {
  id: string;
  numeroOC: string;
  montoTotal: number;
  montoConsumido: number;
  proveedorRfc: string;
}

// =================================================================================
// 2. DATOS MOCK (Inspirado en #1 y #5)
// =================================================================================

const MOCK_USUARIOS: User[] = [
  { id: 'prov-01', nombre: 'Tech Solutions S.A. de C.V.', rol: RolUsuario.PROVEEDOR, rfc: 'TSO010101XYZ' },
  { id: 'valid-01', nombre: 'Ana García (Finanzas)', rol: RolUsuario.VALIDADOR, rfc: 'AGE010101ABC' },
];

const MOCK_OCS: OrdenDeCompra[] = [
  { id: 'oc-01', numeroOC: 'OC-2025-4521', montoTotal: 50000, montoConsumido: 15000, proveedorRfc: 'TSO010101XYZ' },
  { id: 'oc-02', numeroOC: 'OC-2025-7890', montoTotal: 20000, montoConsumido: 0, proveedorRfc: 'TSO010101XYZ' },
  { id: 'oc-03', numeroOC: 'OC-2025-9912', montoTotal: 10000, montoConsumido: 8000, proveedorRfc: 'TSO010101XYZ' },
];

const MOCK_FACTURAS: Factura[] = [
    { id: 'fac-001', proveedorId: 'prov-01', folioFiscal: 'A1B2C3D4-E5F6-4A5B-8C9D-0E1F2A3B4C5D', monto: 15086.06, fechaCarga: new Date(Date.now() - 2 * 86400000).toISOString(), estadoActual: EstadoFactura.EN_VALIDACION, razonSocial: 'Tech Solutions S.A. de C.V.', rfc: 'TSO010101XYZ', ordenDeCompraId: 'oc-01', historial: [{ etapa: EstadoFactura.RECEPCION, fecha: new Date(Date.now() - 2 * 86400000).toISOString(), usuario: 'Sistema' }] },
    { id: 'fac-002', proveedorId: 'prov-01', folioFiscal: 'F6E5D4C3-B2A1-4B5C-8D9E-0F1E2D3C4B5A', monto: 7834.00, fechaCarga: new Date(Date.now() - 5 * 86400000).toISOString(), estadoActual: EstadoFactura.PAGADA, razonSocial: 'Tech Solutions S.A. de C.V.', rfc: 'TSO010101XYZ', ordenDeCompraId: 'oc-01', historial: [{ etapa: EstadoFactura.RECEPCION, fecha: new Date(Date.now() - 5 * 86400000).toISOString(), usuario: 'Sistema' }, { etapa: EstadoFactura.EN_VALIDACION, fecha: new Date(Date.now() - 4 * 86400000).toISOString(), usuario: 'Ana García' }, { etapa: EstadoFactura.APROBADA, fecha: new Date(Date.now() - 4 * 86400000).toISOString(), usuario: 'Ana García' }, { etapa: EstadoFactura.PAGADA, fecha: new Date(Date.now() - 3 * 86400000).toISOString(), usuario: 'Tesorería' }] },
    { id: 'fac-003', proveedorId: 'prov-01', folioFiscal: '9A8B7C6D-5E4F-4A3B-2C1D-0F9E8D7C6B5A', monto: 21300.75, fechaCarga: new Date(Date.now() - 10 * 86400000).toISOString(), estadoActual: EstadoFactura.RECHAZADA, razonSocial: 'Tech Solutions S.A. de C.V.', rfc: 'TSO010101XYZ', ordenDeCompraId: null, historial: [{ etapa: EstadoFactura.RECEPCION, fecha: new Date(Date.now() - 10 * 86400000).toISOString(), usuario: 'Sistema' }, { etapa: EstadoFactura.RECHAZADA, fecha: new Date(Date.now() - 9 * 86400000).toISOString(), usuario: 'Ana García', motivo: 'El monto excede el saldo de la OC.' }] },
];

const MOTIVOS_RECHAZO_COMUNES = ["Monto no coincide con OC", "Documentación incompleta", "Factura duplicada", "Servicio/Producto no recibido"];

// =================================================================================
// 3. FUNCIONES HELPER
// =================================================================================

const formatCurrency = (amount: number): string => new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(amount);
const formatDate = (dateString: string): string => new Date(dateString).toLocaleDateString('es-MX', { year: 'numeric', month: 'short', day: 'numeric' });

// =================================================================================
// 4. ESTILOS CSS-IN-JS (Inspirado en #5, traducido a objetos JS)
// =================================================================================

const styles: { [key: string]: CSSProperties } = {
    // Layout & General
    appContainer: { fontFamily: 'sans-serif', backgroundColor: '#f1f5f9', minHeight: '100vh', color: '#334155' },
    mainContent: { maxWidth: '1280px', margin: '0 auto', padding: '2rem' },
    card: { backgroundColor: 'white', borderRadius: '0.75rem', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)', overflow: 'hidden' },
    
    // Header
    header: { backgroundColor: 'white', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)', position: 'sticky', top: 0, zIndex: 50 },
    headerNav: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', maxWidth: '1280px', margin: '0 auto', padding: '0.75rem 2rem' },
    headerTitle: { fontSize: '1.25rem', fontWeight: 'bold', color: '#1e3a8a' },
    userSwitcher: { padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '0.375rem', fontSize: '0.875rem' },

    // Botones
    button: { padding: '0.5rem 1rem', borderRadius: '0.375rem', fontWeight: 600, color: 'white', transition: 'all 0.2s', border: 'none', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' },
    buttonPrimary: { backgroundColor: '#2563eb', ':hover': { backgroundColor: '#1d4ed8' } },
    buttonSuccess: { backgroundColor: '#16a34a', ':hover': { backgroundColor: '#15803d' } },
    buttonDanger: { backgroundColor: '#dc2626', ':hover': { backgroundColor: '#b91c1c' } },
    buttonSecondary: { backgroundColor: '#64748b', color: 'white', ':hover': { backgroundColor: '#475569' } },
    buttonDisabled: { opacity: 0.5, cursor: 'not-allowed' },

    // Badges de Estado
    badge: { padding: '0.25rem 0.75rem', fontSize: '0.75rem', fontWeight: 500, borderRadius: '9999px', display: 'inline-block' },
    badgeRecepcion: { backgroundColor: '#fef3c7', color: '#92400e' },
    badgeEnValidacion: { backgroundColor: '#dbeafe', color: '#1e40af' },
    badgeAprobada: { backgroundColor: '#d1fae5', color: '#065f46' },
    badgeRechazada: { backgroundColor: '#fee2e2', color: '#991b1b' },
    badgePagada: { backgroundColor: '#e5e7eb', color: '#374151' },
    
    // Modal
    modalOverlay: { position: 'fixed', inset: 0, backgroundColor: 'rgba(0, 0, 0, 0.5)', zIndex: 100, display: 'flex', justifyContent: 'center', alignItems: 'center' },
    modalContent: { backgroundColor: 'white', borderRadius: '0.5rem', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', width: '90%', maxWidth: '640px' },
    modalHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 1.5rem', borderBottom: '1px solid #e5e7eb' },
    modalBody: { padding: '1.5rem' },

    // Uploader
    dropzone: { padding: '2.5rem', border: '2px dashed #d1d5db', borderRadius: '0.5rem', textAlign: 'center', cursor: 'pointer', transition: 'all 0.2s' },
    dropzoneActive: { borderColor: '#2563eb', backgroundColor: '#eff6ff' },

    // Factura Item & Detail
    facturaItemHeader: { padding: '1rem', cursor: 'pointer', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' },
    facturaDetailContainer: { borderTop: '1px solid #e5e7eb', backgroundColor: 'rgba(249, 250, 251, 0.5)' },
    detailGrid: { padding: '2rem', display: 'grid', gridTemplateColumns: 'repeat(1, 1fr)', gap: '2rem', '@media (min-width: 1024px)': { gridTemplateColumns: 'repeat(10, 1fr)' } },
    detailCol4: { gridColumn: 'span 1', '@media (min-width: 1024px)': { gridColumn: 'span 4' } },
    detailCol6: { gridColumn: 'span 1', '@media (min-width: 1024px)': { gridColumn: 'span 6' } },
    
    // Timeline
    timelineItem: { position: 'relative', display: 'flex', alignItems: 'flex-start', gap: '1rem' },
    timelineConnector: { position: 'absolute', top: '2.5rem', left: '1.25rem', width: '2px', height: 'calc(100% - 1rem)', backgroundColor: '#e5e7eb' },
    timelineIconWrapper: { width: '2.5rem', height: '2.5rem', borderRadius: '9999px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, zIndex: 10, ring: '4px', ringColor: 'white' },
    
    // KPI Card
    kpiCard: { padding: '1rem', borderRadius: '0.5rem', borderLeft: '4px solid', display: 'flex', alignItems: 'center', gap: '1rem' },
};

const getStatusBadgeStyle = (status: ValueOf<typeof EstadoFactura>): CSSProperties => {
    const statusMap = {
        [EstadoFactura.RECEPCION]: styles.badgeRecepcion,
        [EstadoFactura.EN_VALIDACION]: styles.badgeEnValidacion,
        [EstadoFactura.APROBADA]: styles.badgeAprobada,
        [EstadoFactura.RECHAZADA]: styles.badgeRechazada,
        [EstadoFactura.PAGADA]: styles.badgePagada,
    };
    return { ...styles.badge, ...statusMap[status] };
};


// =================================================================================
// 5. COMPONENTES REUTILIZABLES (Inspirado en #5)
// =================================================================================

const Icon: FC<{ path: string; className?: string }> = ({ path, className = 'w-6 h-6' }) => {
    const sizeMap: { [key: string]: string } = { 'w-4': '1rem', 'h-4': '1rem', 'w-5': '1.25rem', 'h-5': '1.25rem', 'w-6': '1.5rem', 'h-6': '1.5rem' };
    const style: CSSProperties = {
        width: sizeMap[className.split(' ')[0]] || '1.5rem',
        height: sizeMap[className.split(' ')[1]] || '1.5rem',
    };
    return (
        <svg xmlns="http://www.w3.org/2000/svg" style={style} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d={path} />
        </svg>
    );
};
const UploadIcon: FC = () => <Icon path="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />;
const CheckCircleIcon: FC = () => <Icon path="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />;
const XCircleIcon: FC = () => <Icon path="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />;
const ChevronDownIcon: FC<{ isExpanded: boolean }> = ({ isExpanded }) => (
    <div style={{ transition: 'transform 0.2s', transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)' }}>
        <Icon path="M19 9l-7 7-7-7" />
    </div>
);
const LinkIcon: FC = () => <Icon path="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />;
const XIcon: FC = () => <Icon path="M6 18L18 6M6 6l12 12" />;
const CheckIcon: FC = () => <Icon path="M5 13l4 4L19 7" />;
const CurrencyDollarIcon: FC = () => <Icon path="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />;
const ExclamationTriangleIcon: FC = () => <Icon path="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />;


interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'success' | 'danger';
}

const Button: FC<ButtonProps> = ({ variant = 'primary', children, disabled, ...props }) => {
    const variantStyle = styles[`button${variant.charAt(0).toUpperCase() + variant.slice(1)}`];
    const finalStyle = { ...styles.button, ...variantStyle, ...(disabled ? styles.buttonDisabled : {}) };
    return <button style={finalStyle} disabled={disabled} {...props}>{children}</button>;
};

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
}

const Modal: FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
    if (!isOpen) return null;
    return (
        <div style={styles.modalOverlay} onClick={onClose}>
            <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                <div style={styles.modalHeader}>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#1f2937' }}>{title}</h3>
                    <button onClick={onClose} style={{ color: '#9ca3af', background: 'none', border: 'none', cursor: 'pointer' }}><XIcon /></button>
                </div>
                <div style={styles.modalBody}>{children}</div>
            </div>
        </div>
    );
};

// =================================================================================
// 6. COMPONENTES DE NEGOCIO
// =================================================================================

interface FacturaUploaderProps {
    onUploadSuccess: (data: Omit<Factura, 'id' | 'proveedorId'>) => void;
    currentUser: User;
}

const FacturaUploader: FC<FacturaUploaderProps> = ({ onUploadSuccess, currentUser }) => {
    const [xmlFile, setXmlFile] = useState<File | null>(null);
    const [pdfFile, setPdfFile] = useState<File | null>(null);
    const [extractedData, setExtractedData] = useState<Omit<Factura, 'id' | 'proveedorId' | 'ordenDeCompraId'> | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isDragActive, setIsDragActive] = useState(false);

    const parseCFDI = (xmlString: string): Promise<any> => {
        // Lógica de parseo realista (Inspirado en #3)
        return new Promise((resolve, reject) => {
            try {
                const parser = new DOMParser();
                const xmlDoc = parser.parseFromString(xmlString, 'application/xml');
                if (xmlDoc.querySelector('parsererror')) reject(new Error('XML mal formado.'));

                const comprobante = xmlDoc.getElementsByTagName('cfdi:Comprobante')[0];
                const emisor = comprobante.getElementsByTagName('cfdi:Emisor')[0];
                const timbre = xmlDoc.getElementsByTagName('tfd:TimbreFiscalDigital')[0];
                if (!comprobante || !emisor || !timbre) reject(new Error('XML no contiene nodos CFDI requeridos.'));
                
                resolve({
                    razonSocial: emisor.getAttribute('Nombre') || 'N/A',
                    rfc: emisor.getAttribute('Rfc') || 'N/A',
                    monto: parseFloat(comprobante.getAttribute('Total') || '0'),
                    folioFiscal: timbre.getAttribute('UUID') || 'N/A',
                });
            } catch (e) { reject(new Error('Error crítico al procesar XML.')); }
        });
    };

    const handleFiles = useCallback(async (files: FileList) => {
        setError(null);
        setExtractedData(null);
        const xml = Array.from(files).find(f => f.name.toLowerCase().endsWith('.xml'));
        const pdf = Array.from(files).find(f => f.name.toLowerCase().endsWith('.pdf'));
        if(pdf) setPdfFile(pdf);
        if(xml) {
            setXmlFile(xml);
            const reader = new FileReader();
            reader.onload = async (e) => {
                try {
                    const data = await parseCFDI(e.target?.result as string);
                    if (data.rfc !== currentUser.rfc) {
                        setError(`Conflicto de RFC: El archivo indica ${data.rfc} pero tu usuario es ${currentUser.rfc}.`);
                        return;
                    }
                    const now = new Date().toISOString();
                    setExtractedData({ ...data, fechaCarga: now, estadoActual: EstadoFactura.RECEPCION, historial: [{ etapa: EstadoFactura.RECEPCION, fecha: now, usuario: currentUser.nombre }] });
                } catch (err: any) { setError(err.message); }
            };
            reader.readAsText(xml);
        }
    }, [currentUser.rfc, currentUser.nombre]);
    
    const onDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragActive(false);
        if (e.dataTransfer.files) handleFiles(e.dataTransfer.files);
    }, [handleFiles]);

    const onDragOver = (e: React.DragEvent<HTMLDivElement>) => { e.preventDefault(); e.stopPropagation(); setIsDragActive(true); };
    const onDragLeave = (e: React.DragEvent<HTMLDivElement>) => { e.preventDefault(); e.stopPropagation(); setIsDragActive(false); };
    const onFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => { if (e.target.files) handleFiles(e.target.files); };
    
    const handleSubmit = () => { if (extractedData) onUploadSuccess(extractedData); };

    return (
        <div>
            <label htmlFor="file-upload-input" style={{...styles.dropzone, ...(isDragActive ? styles.dropzoneActive : {})}} onDrop={onDrop} onDragOver={onDragOver} onDragLeave={onDragLeave}>
                <UploadIcon />
                <p>Arrastra archivos XML y PDF aquí, o haz clic para seleccionar</p>
                <input id="file-upload-input" type="file" multiple accept=".xml,.pdf" onChange={onFileInputChange} style={{ display: 'none' }} />
            </label>
            {error && <div style={{...getStatusBadgeStyle(EstadoFactura.RECHAZADA), marginTop: '1rem', display:'flex', alignItems:'center', gap: '0.5rem'}}><XCircleIcon /> {error}</div>}
            {extractedData && <div style={{marginTop: '1.5rem', borderTop: '1px solid #e5e7eb', paddingTop: '1.5rem'}}>
                <h4 style={{fontSize: '1.125rem', fontWeight: 600}}>Datos Verificados</h4>
                <div style={{...styles.detailGrid, padding: '1rem 0 0 0'}}>
                    <div style={styles.detailCol4}><p><b>Folio:</b> {extractedData.folioFiscal}</p></div>
                    <div style={styles.detailCol6}><p><b>Monto:</b> {formatCurrency(extractedData.monto)}</p></div>
                </div>
            </div>}
             <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-end' }}>
                <Button onClick={handleSubmit} variant="success" disabled={!extractedData || !pdfFile}>Confirmar Carga</Button>
            </div>
        </div>
    );
};

const ResumenVisualFactura: FC<{ factura: Factura }> = ({ factura }) => (
    <div style={{...styles.card, padding: '1.5rem'}}>
        <div style={{...styles.modalHeader, padding: '0 0 1rem 0'}}>
            <h3 style={{...styles.headerTitle, color: '#334155'}}>Resumen de Factura</h3>
            <span style={{ fontFamily: 'monospace', fontSize: '0.875rem' }}>{factura.folioFiscal.substring(0, 8)}...</span>
        </div>
        <div style={{padding: '1.5rem 0'}}>
            <p><b>Razón Social:</b> {factura.razonSocial}</p>
            <p><b>RFC:</b> {factura.rfc}</p>
        </div>
        <div style={{borderTop: '1px solid #e5e7eb', paddingTop: '1rem', textAlign: 'right'}}>
            <span style={{color: '#4b5563'}}>Total: </span>
            <span style={{fontSize: '2rem', fontWeight: 700, color: '#1e3a8a'}}>{formatCurrency(factura.monto)}</span>
        </div>
    </div>
);

const LineaDeTiempoAuditable: FC<{ historial: HistoryEntry[] }> = ({ historial }) => (
    <div>
        <h3 style={{fontSize: '1.25rem', fontWeight: 600, marginBottom: '1rem'}}>Línea de Tiempo</h3>
        {historial.map((item, index) => (
            <div key={index} style={styles.timelineItem}>
                {index < historial.length - 1 && <div style={styles.timelineConnector}></div>}
                <div style={{...styles.timelineIconWrapper, backgroundColor: item.etapa === EstadoFactura.RECHAZADA ? '#ef4444' : '#2563eb'}}>
                     {item.etapa === EstadoFactura.RECHAZADA ? <XIcon/> : <CheckIcon />}
                </div>
                <div style={{ flex: 1, paddingBottom: '1.5rem' }}>
                    <p style={{ fontWeight: 600 }}>{item.etapa}</p>
                    <p style={{ fontSize: '0.875rem', color: '#64748b' }}>{formatDate(item.fecha)} por {item.usuario}</p>
                    {item.motivo && <p style={{ fontSize: '0.875rem', marginTop: '0.5rem', padding: '0.5rem', ...getStatusBadgeStyle(EstadoFactura.RECHAZADA) }}>Motivo: {item.motivo}</p>}
                </div>
            </div>
        ))}
    </div>
);

const TarjetaResumenOC: FC<{ oc: OrdenDeCompra }> = ({ oc }) => {
    const usage = (oc.montoConsumido / oc.montoTotal) * 100;
    return (
        <div style={{...styles.card, padding: '1rem', border: '1px solid #e5e7eb' }}>
            <div style={{...styles.modalHeader, padding: 0, border: 'none'}}>
                <h4 style={{ fontWeight: 600 }}>{oc.numeroOC}</h4>
                <span style={getStatusBadgeStyle(EstadoFactura.PAGADA)}>Vinculada</span>
            </div>
            <div style={{width: '100%', backgroundColor: '#e5e7eb', borderRadius: '9999px', height: '0.75rem', marginTop: '1rem'}}>
                <div style={{width: `${usage}%`, backgroundColor: '#2563eb', height: '100%', borderRadius: '9999px'}}></div>
            </div>
            <div style={{display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem', fontSize: '0.875rem'}}>
                <span>Consumido: {formatCurrency(oc.montoConsumido)}</span>
                <span>Total: {formatCurrency(oc.montoTotal)}</span>
            </div>
        </div>
    );
};

const FacturaDetailView: FC<{
    factura: Factura;
    ocs: OrdenDeCompra[];
    currentUser: User;
    onUpdateFactura: (factura: Factura) => void;
}> = ({ factura, ocs, currentUser, onUpdateFactura }) => {
    const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
    const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
    const [motivoRechazo, setMotivoRechazo] = useState('');

    const linkedOC = useMemo(() => ocs.find(oc => oc.id === factura.ordenDeCompraId), [factura, ocs]);
    const availableOCs = useMemo(() => ocs.filter(oc => oc.proveedorRfc === factura.rfc && (oc.montoTotal - oc.montoConsumido >= factura.monto)), [ocs, factura]);
    
    const handleAction = (newState: ValueOf<typeof EstadoFactura>, motivo?: string) => {
        const newHistoryEntry: HistoryEntry = {
            fecha: new Date().toISOString(),
            etapa: newState,
            usuario: currentUser.nombre,
            ...(motivo && { motivo }),
        };
        const updatedFactura: Factura = { ...factura, estadoActual: newState, historial: [...factura.historial, newHistoryEntry] };
        
        onUpdateFactura(updatedFactura);
    };

    const handleLinkOC = (ocId: string) => {
        onUpdateFactura({ ...factura, ordenDeCompraId: ocId });
        setIsLinkModalOpen(false);
    };

    return (
        <div style={{ ...styles.detailGrid, paddingTop: 0 }}>
            <div style={styles.detailCol4}><ResumenVisualFactura factura={factura} /></div>
            <div style={styles.detailCol6}><LineaDeTiempoAuditable historial={factura.historial} /></div>
            <div style={styles.detailCol4}>
                <h3 style={{fontSize: '1.25rem', fontWeight: 600, marginBottom: '1rem'}}>Reconciliación OC</h3>
                {linkedOC ? <TarjetaResumenOC oc={linkedOC} /> : <Button onClick={() => setIsLinkModalOpen(true)}><LinkIcon /> Vincular a OC</Button>}
            </div>
            {currentUser.rol === RolUsuario.VALIDADOR && factura.estadoActual === EstadoFactura.EN_VALIDACION &&
                <div style={{ ...styles.detailCol6, borderTop: '1px solid #e5e7eb', paddingTop: '2rem' }}>
                    <h3 style={{fontSize: '1.25rem', fontWeight: 600, marginBottom: '1rem'}}>Acciones de Validación</h3>
                    <div style={{display: 'flex', gap: '1rem'}}>
                        <Button variant="success" onClick={() => handleAction(EstadoFactura.APROBADA)} disabled={!factura.ordenDeCompraId}><CheckIcon /> Aprobar</Button>
                        <Button variant="danger" onClick={() => setIsRejectModalOpen(true)}><XIcon /> Rechazar</Button>
                        {!factura.ordenDeCompraId && <span style={{fontSize: '0.875rem', color: '#64748b'}}>* Se debe vincular una OC para poder aprobar.</span>}
                    </div>
                </div>
            }

            <Modal isOpen={isLinkModalOpen} onClose={() => setIsLinkModalOpen(false)} title="Vincular Orden de Compra">
                {availableOCs.length > 0 ? availableOCs.map(oc => (
                    <div key={oc.id} style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', borderBottom: '1px solid #e5e7eb'}}>
                        <div><p>{oc.numeroOC}</p><p style={{fontSize: '0.875rem'}}>Saldo: {formatCurrency(oc.montoTotal - oc.montoConsumido)}</p></div>
                        <Button onClick={() => handleLinkOC(oc.id)}>Vincular</Button>
                    </div>
                )) : <p>No hay Órdenes de Compra con saldo suficiente para esta factura.</p>}
            </Modal>
            
            <Modal isOpen={isRejectModalOpen} onClose={() => setIsRejectModalOpen(false)} title="Motivo de Rechazo">
                <select value={motivoRechazo} onChange={(e) => setMotivoRechazo(e.target.value)} style={styles.userSwitcher}>
                    <option value="">-- Seleccione un motivo --</option>
                    {MOTIVOS_RECHAZO_COMUNES.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
                <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-end' }}>
                    <Button variant="danger" onClick={() => handleAction(EstadoFactura.RECHAZADA, motivoRechazo)} disabled={!motivoRechazo}>Confirmar Rechazo</Button>
                </div>
            </Modal>
        </div>
    );
};

const FacturaItem: FC<{ 
    factura: Factura;
    currentUser: User;
    ocs: OrdenDeCompra[];
    onUpdateFactura: (factura: Factura) => void;
}> = ({ factura, currentUser, ocs, onUpdateFactura }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    return (
        <div style={styles.card}>
            <div style={styles.facturaItemHeader} onClick={() => setIsExpanded(!isExpanded)}>
                <div style={{ flex: 1, minWidth: '200px' }}>
                    <p style={{ fontFamily: 'monospace', fontSize: '0.875rem' }}>{factura.folioFiscal}</p>
                    <p style={{ fontSize: '1.5rem', fontWeight: 700 }}>{formatCurrency(factura.monto)}</p>
                </div>
                <div style={{ flex: 1, minWidth: '150px' }}>
                    <p style={{ fontSize: '0.875rem', color: '#64748b' }}>Cargada</p>
                    <p style={{ fontWeight: 600 }}>{formatDate(factura.fechaCarga)}</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <span style={getStatusBadgeStyle(factura.estadoActual)}>{factura.estadoActual}</span>
                    <ChevronDownIcon isExpanded={isExpanded} />
                </div>
            </div>
            {isExpanded && <div style={styles.facturaDetailContainer}>
                <FacturaDetailView factura={factura} currentUser={currentUser} ocs={ocs} onUpdateFactura={onUpdateFactura} />
            </div>}
        </div>
    );
};

const TarjetaKPI: FC<{ title: string, value: string | number, icon: React.ReactNode, color: string }> = ({ title, value, icon, color }) => (
    <div style={{...styles.kpiCard, borderColor: color}}>
        <div style={{padding: '0.5rem', borderRadius: '9999px', backgroundColor: `${color}20`}}>{icon}</div>
        <div>
            <p style={{fontSize: '0.875rem', color: '#475569'}}>{title}</p>
            <p style={{fontSize: '1.5rem', fontWeight: 700}}>{typeof value === 'number' ? formatCurrency(value) : value}</p>
        </div>
    </div>
);

// =================================================================================
// 7. VISTAS PRINCIPALES (PROVEEDOR Y VALIDADOR)
// =================================================================================

const PortalProveedor: FC<{ 
    facturas: Factura[];
    currentUser: User;
    ocs: OrdenDeCompra[];
    onAddFactura: (data: Omit<Factura, 'id' | 'proveedorId'>) => void;
    onUpdateFactura: (factura: Factura) => void;
}> = ({ facturas, currentUser, ocs, onAddFactura, onUpdateFactura }) => {
    const [isUploaderOpen, setIsUploaderOpen] = useState(false);
    const sortedFacturas = useMemo(() => [...facturas].sort((a, b) => new Date(b.fechaCarga).getTime() - new Date(a.fechaCarga).getTime()), [facturas]);

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h1 style={{ fontSize: '1.875rem', fontWeight: 700 }}>Mis Facturas</h1>
                <Button onClick={() => setIsUploaderOpen(true)}><UploadIcon /> Cargar Factura</Button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {sortedFacturas.map(factura => <FacturaItem key={factura.id} factura={factura} currentUser={currentUser} ocs={ocs} onUpdateFactura={onUpdateFactura} />)}
            </div>
            <Modal isOpen={isUploaderOpen} onClose={() => setIsUploaderOpen(false)} title="Cargar Nueva Factura">
                <FacturaUploader onUploadSuccess={onAddFactura} currentUser={currentUser} />
            </Modal>
        </div>
    );
};

const DashboardInterno: FC<{ 
    facturas: Factura[];
    currentUser: User;
    ocs: OrdenDeCompra[];
    onUpdateFactura: (factura: Factura) => void;
}> = ({ facturas, currentUser, ocs, onUpdateFactura }) => {
    const [selectedFactura, setSelectedFactura] = useState<Factura | null>(null);

    const kpis = useMemo(() => ({
        totalPendiente: facturas.filter(f => f.estadoActual === EstadoFactura.EN_VALIDACION).reduce((sum, f) => sum + f.monto, 0),
        facturasConDiscrepancias: facturas.filter(f => f.estadoActual === EstadoFactura.RECHAZADA).length,
    }), [facturas]);

    const tareasPendientes = useMemo(() => facturas.filter(f => f.estadoActual === EstadoFactura.EN_VALIDACION), [facturas]);
    
    if (selectedFactura) {
        return (
            <div>
                <Button onClick={() => setSelectedFactura(null)} variant="secondary" style={{marginBottom: '1rem'}}>Volver al Dashboard</Button>
                <FacturaItem factura={selectedFactura} currentUser={currentUser} ocs={ocs} onUpdateFactura={onUpdateFactura} />
            </div>
        );
    }
    
    return (
        <div style={{display: 'flex', flexDirection: 'column', gap: '2rem'}}>
            <h1 style={{ fontSize: '1.875rem', fontWeight: 700 }}>Dashboard de Validación</h1>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
                <TarjetaKPI title="Total Pendiente de Aprobación" value={kpis.totalPendiente} icon={<CurrencyDollarIcon />} color="#3b82f6" />
                <TarjetaKPI title="Facturas Rechazadas" value={kpis.facturasConDiscrepancias} icon={<ExclamationTriangleIcon />} color="#f59e0b" />
            </div>
            <div>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '1rem' }}>Bandeja de Tareas ({tareasPendientes.length})</h2>
                {tareasPendientes.length > 0 ? (
                    <div style={{...styles.card, padding: '1rem'}}>
                    {tareasPendientes.map(factura => (
                        <div key={factura.id} style={{...styles.facturaItemHeader, borderBottom: '1px solid #f3f4f6'}} onClick={() => setSelectedFactura(factura)}>
                            <p>{factura.razonSocial}</p>
                            <p style={{fontWeight: 600}}>{formatCurrency(factura.monto)}</p>
                            <span style={getStatusBadgeStyle(factura.estadoActual)}>{factura.estadoActual}</span>
                        </div>
                    ))}
                    </div>
                ) : <p>No hay tareas pendientes.</p>}
            </div>
        </div>
    );
};


// =================================================================================
// 8. COMPONENTE RAÍZ DE LA APLICACIÓN
// =================================================================================

const App: FC = () => {
    // ---- ESTADO CENTRALIZADO (Inspirado en #4) ----
    const [facturas, setFacturas] = useState<Factura[]>(MOCK_FACTURAS);
    const [ocs, setOcs] = useState<OrdenDeCompra[]>(MOCK_OCS);
    const [currentUser, setCurrentUser] = useState<User>(MOCK_USUARIOS[0]);

    // ---- MANEJADORES DE ESTADO (Lógica centralizada) ----
    const handleAddFactura = (data: Omit<Factura, 'id' | 'proveedorId'>) => {
        if (!currentUser || currentUser.rol !== RolUsuario.PROVEEDOR) return;
        const newFactura: Factura = {
            ...data,
            id: `fac-${Date.now()}`,
            proveedorId: currentUser.id,
            ordenDeCompraId: null, // Se asigna después
            estadoActual: EstadoFactura.EN_VALIDACION, // Pasa a validación
            historial: [...data.historial, { fecha: new Date().toISOString(), etapa: EstadoFactura.EN_VALIDACION, usuario: 'Sistema' }]
        };
        setFacturas(prev => [newFactura, ...prev]);
    };

    const handleUpdateFactura = (updatedFactura: Factura) => {
        setFacturas(prev => prev.map(f => f.id === updatedFactura.id ? updatedFactura : f));
        
        // Lógica de negocio para actualizar OCs al vincular
        const originalFactura = facturas.find(f => f.id === updatedFactura.id);
        if (updatedFactura.ordenDeCompraId && originalFactura?.ordenDeCompraId !== updatedFactura.ordenDeCompraId) {
            setOcs(prevOcs => prevOcs.map(oc => {
                if (oc.id === updatedFactura.ordenDeCompraId) {
                    return { ...oc, montoConsumido: oc.montoConsumido + updatedFactura.monto };
                }
                return oc;
            }));
        }
    };
    
    const facturasUsuarioActual = useMemo(() => {
        if (currentUser.rol === RolUsuario.PROVEEDOR) {
            return facturas.filter(f => f.proveedorId === currentUser.id);
        }
        return facturas; // El validador ve todas
    }, [facturas, currentUser]);

    return (
        <div style={styles.appContainer}>
            <header style={styles.header}>
                <nav style={styles.headerNav}>
                    <h1 style={styles.headerTitle}>Módulo de Pago a Proveedores</h1>
                    <div>
                        <label htmlFor="user-switcher" style={{fontSize: '0.875rem', marginRight: '0.5rem'}}>Vista como:</label>
                        <select
                            id="user-switcher"
                            value={currentUser.id}
                            onChange={(e) => setCurrentUser(MOCK_USUARIOS.find(u => u.id === e.target.value) || MOCK_USUARIOS[0])}
                            style={styles.userSwitcher}
                        >
                            {MOCK_USUARIOS.map(user => <option key={user.id} value={user.id}>{user.nombre}</option>)}
                        </select>
                    </div>
                </nav>
            </header>
            <main style={styles.mainContent}>
                {currentUser.rol === RolUsuario.PROVEEDOR ?
                    <PortalProveedor
                        facturas={facturasUsuarioActual}
                        currentUser={currentUser}
                        ocs={ocs}
                        onAddFactura={handleAddFactura}
                        onUpdateFactura={handleUpdateFactura}
                    /> :
                    <DashboardInterno
                        facturas={facturasUsuarioActual}
                        currentUser={currentUser}
                        ocs={ocs}
                        onUpdateFactura={handleUpdateFactura}
                    />
                }
            </main>
        </div>
    );
};

export default App;
