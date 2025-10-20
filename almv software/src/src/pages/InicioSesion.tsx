import React, { useState, useEffect, useRef } from 'react';

// Íconos genéricos en SVG para evitar dependencias externas (emulando Lucide React)
const UserIcon = (props: any) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;
const LogInIcon = (props: any) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" x2="3" y1="12" y2="12"/></svg>;
const StoreIcon = (props: any) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 10.5V12a10 10 0 0 1-10 10c-5.52 0-10-4.48-10-10a10 10 0 0 1 10-10v1.5"/><path d="M10 2a2 2 0 0 0-2 2v1.5a1 1 0 0 0 1 1h4a1 1 0 0 0 1-1V4a2 2 0 0 0-2-2z"/><path d="M15 15h1.5a1.5 1.5 0 0 0 1.5-1.5V9a1 1 0 0 0-1-1H9a1 1 0 0 0-1 1v4.5a1.5 1.5 0 0 0 1.5 1.5H12"/><path d="M16 8h-4"/><path d="M18 10h-6"/></svg>;

// --- TIPOS DE DATOS ---
type User = {
  id: number | string;
  name: string;
  role: string;
};

// --- DATOS DE EJEMPLO ---
const users: User[] = [
  { id: 1, name: 'Valentina Rodriguez', role: 'Gerente' },
  { id: 2, name: 'Javier Morales', role: 'Coordinador' },
  { id: 3, name: 'Sofia Castillo', role: 'Operador' },
  { id: 4, name: 'Mateo Jimenez', role: 'Auxiliar' },
  { id: 5, name: 'Isabella Gómez', role: 'Supervisor' },
];

// --- COMPONENTE DE ICONO (FLECHA DESPLEGABLE) ---
const ChevronDownIcon = ({ isOpen }: { isOpen: boolean }) => (
  <svg
    className={`w-5 h-5 text-gray-500 transition-transform duration-300 group-hover:text-gray-600 ${isOpen ? 'rotate-180' : ''}`}
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 20 20"
    fill="currentColor"
    aria-hidden="true"
  >
    <path
      fillRule="evenodd"
      d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
      clipRule="evenodd"
    />
  </svg>
);

// --- COMPONENTE PRINCIPAL DE LA APLICACIÓN ---
export default function App() {
  // --- ESTADOS ---
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [cardHovered, setCardHovered] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // --- EFECTOS ---
  // Manejar clics fuera del dropdown para cerrarlo
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // --- MANEJADORES DE EVENTOS ---
  const handleSelectUser = (user: User) => {
    setSelectedUser(user);
    setIsDropdownOpen(false);
  };
  
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;

    setIsLoading(true);
    // Simulación de autenticación exitosa
    setTimeout(() => {
      setIsLoading(false);
      setIsLoggedIn(true);
    }, 1500); 
  };
  
  const handleLogout = () => {
    setIsLoggedIn(false);
    setSelectedUser(null);
  }

  // --- RENDERIZADO ---
  return (
    // CLASE MODIFICADA: Aplica el fondo claro con movimiento animado
    <div className="min-h-screen w-full font-sans flex items-center justify-center p-4 relative overflow-hidden background-movement">
      
      {/* Fondo animado (Tonos bajos, formas suaves) - Aún visibles para el efecto de profundidad */}
      <div className="absolute inset-0 overflow-hidden z-0">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-sky-400/50 rounded-full mix-blend-soft-light filter blur-3xl opacity-10 animate-move-blob" style={{ animationDelay: '0s' }}></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-300/50 rounded-full mix-blend-soft-light filter blur-3xl opacity-10 animate-move-blob" style={{ animationDelay: '-8s', animationDuration: '20s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-gray-300 rounded-full mix-blend-soft-light filter blur-3xl opacity-5 animate-move-blob" style={{ animationDelay: '-15s', animationDuration: '30s' }}></div>
      </div>

      <div className="relative w-full max-w-md z-10 animate-fade-in-up">
        {/* Sombra animada de la tarjeta */}
        <div className="absolute inset-0 bg-gradient-to-r from-sky-300/80 to-indigo-400/80 shadow-2xl rounded-3xl blur-xl opacity-30 transform rotate-1 transition-opacity duration-700"></div>
        
        <div 
          className={`relative bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl p-8 md:p-10 border border-gray-200 transform transition-all duration-300 ${cardHovered ? 'scale-[1.01]' : 'scale-100'}`}
          onMouseEnter={() => setCardHovered(true)}
          onMouseLeave={() => setCardHovered(false)}
        >
          
          {/* Contenedores para la transición de vista (El Login se desliza a la izquierda) */}
          <div className={`transition-all duration-700 ease-in-out ${isLoggedIn ? 'opacity-0 -translate-x-full' : 'opacity-100 translate-x-0'} absolute top-0 left-0 w-full`}>
            <div className="p-8 md:p-10">
              {/* Logo y Títulos */}
              <div className="flex flex-col items-center text-center">
                <img
                  src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRwznMpanZo8joZkePlBwsbRgQe82yuhR8Qvw&s"
                  alt="Logo FAA"
                  className="w-24 h-24 object-cover rounded-full border-4 border-gray-200 shadow-lg transition-transform duration-500 hover:scale-110 hover:rotate-2"
                />
                <h1 className="mt-4 text-3xl font-bold text-gray-900 tracking-wide animate-slide-down" style={{animationDelay: '0.2s'}}>
                  ALMACEN DE VIVERES FAA
                </h1>
                <p className="text-gray-500 text-lg animate-slide-up" style={{animationDelay: '0.3s'}}>Inicio de Sesión</p>
                <div className="h-1 w-20 bg-gradient-to-r from-sky-500 to-indigo-600 mx-auto rounded-full mt-3"></div>
              </div>

              <form onSubmit={handleLogin} className="mt-8 space-y-6">
                
                {/* Custom Dropdown (ComboBox de Usuarios) */}
                <div className="relative animate-fade-in" ref={dropdownRef} style={{animationDelay: '0.4s'}}>
                  <label className="block text-gray-700 text-sm font-medium mb-3 flex items-center gap-2">
                    <UserIcon className="w-4 h-4 text-indigo-500" />
                    Seleccionar Usuario
                  </label>
                  <div 
                    className="relative flex items-center justify-between w-full p-4 bg-gray-100 rounded-xl border border-gray-300 cursor-pointer transition-all duration-300 hover:border-indigo-400 group"
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  >
                     <div className="flex items-center">
                        {selectedUser ? (
                          <div className="flex flex-col">
                            <span className="text-gray-800 font-medium">{selectedUser.name}</span>
                            <span className="text-xs text-gray-500">{selectedUser.role}</span>
                          </div>
                        ) : (
                          <span className="text-gray-500">Seleccionar un usuario...</span>
                        )}
                     </div>
                     <ChevronDownIcon isOpen={isDropdownOpen} />
                  </div>

                  {isDropdownOpen && (
                     <div className="absolute z-20 mt-2 w-full bg-white rounded-xl border border-gray-200 shadow-2xl overflow-hidden animate-fadeIn">
                       <div className="max-h-60 overflow-y-auto custom-scrollbar">
                         {users.map((user, index) => (
                           <div
                              key={user.id}
                              className="flex items-center p-4 hover:bg-gray-100 transition-all duration-200 cursor-pointer border-b border-gray-200 last:border-b-0 animate-fade-in-list"
                              onClick={() => handleSelectUser(user)}
                              style={{ animationDelay: `${0.2 + index * 0.05}s` }}
                           >
                              {/* Icono de Almacén (Store) */}
                              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-sky-600/50 to-indigo-700/50 flex items-center justify-center mr-3 flex-shrink-0 shadow-md">
                                <StoreIcon className="w-5 h-5 text-white"/>
                              </div>
                              <div className='flex flex-col'>
                                <span className="text-gray-800 font-medium">{user.name}</span>
                                <span className="text-gray-500 text-xs">{user.role}</span>
                              </div>
                           </div>
                         ))}
                       </div>
                     </div>
                  )}
                </div>

                {/* Botón de Ingreso con Feedback de Carga (Emulando whileHover/whileTap) */}
                <button
                  type="submit"
                  disabled={!selectedUser || isLoading}
                  className={`
                    w-full py-3.5 rounded-xl font-semibold text-white transition-all duration-300 transform flex items-center justify-center gap-2 shadow-lg animate-fade-in
                    ${!selectedUser || isLoading
                       ? 'bg-gray-400 opacity-70 cursor-not-allowed' 
                       : 'bg-gradient-to-r from-indigo-500 to-blue-600 hover:from-indigo-600 hover:to-blue-700 hover:shadow-indigo-400/50 hover:scale-[1.02] active:scale-[0.98]'
                    }
                  `}
                  style={{ animationDelay: '0.6s' }}
                >
                  {isLoading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Ingresando...</span>
                    </>
                  ) : (
                    <>
                      <LogInIcon className="w-5 h-5" />
                      <span>Ingresar al Sistema</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* Contenedor de Bienvenida (se desliza desde la derecha) */}
          <div className={`transition-all duration-700 ease-in-out ${isLoggedIn ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-full'} absolute top-0 left-0 w-full`}>
             <div className="p-8 md:p-10 text-center">
                 <div className="w-20 h-20 mx-auto bg-green-500/20 rounded-full flex items-center justify-center border-2 border-green-500/50 shadow-xl animate-fade-in">
                     <svg className="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                 </div>
                 <h2 className="mt-4 text-2xl font-bold text-gray-900 animate-slide-down" style={{ animationDelay: '0.1s' }}>¡Bienvenido!</h2>
                 <p className="mt-2 text-gray-700 text-lg animate-fade-in" style={{ animationDelay: '0.2s' }}>{selectedUser?.name}</p>
                 <p className="text-gray-500 animate-fade-in" style={{ animationDelay: '0.3s' }}>{selectedUser?.role}</p>
                 <button 
                    onClick={handleLogout}
                    className="mt-8 w-full px-4 py-3 font-semibold text-indigo-600 bg-indigo-100/50
                    rounded-xl shadow-sm transition-all duration-300 ease-in-out
                    transform hover:scale-105 hover:bg-indigo-100
                    focus:outline-none focus:ring-4 focus:ring-indigo-300/50"
                  >
                    Cerrar Sesión
                 </button>
             </div>
          </div>
          
          {/* Contenedor de espacio (invisible) para mantener la altura constante durante las transiciones */}
          <div className="p-8 md:p-10 invisible">
             <div className="flex flex-col items-center text-center">
                <div className="w-24 h-24"></div>
                <h1 className="mt-4 text-3xl font-bold">.</h1>
                <p>.</p>
             </div>
             <div className="mt-8 space-y-6">
                <div className="h-[60px]"></div> {/* Altura del dropdown */}
                <div className="h-[52px]"></div> {/* Altura del botón de login */}
             </div>
          </div>
        </div>
      </div>
      <style>{`
        /* Animación para el fondo de color ligero con movimiento */
        .background-movement {
          /* Define el gradiente con colores base claros */
          background: linear-gradient(135deg, #ffffff, #f0f4f8, #e8edf3, #ffffff); 
          background-size: 400% 400%; /* Asegura que el gradiente sea más grande que la vista */
          animation: gradient-shift 30s ease infinite; /* Animación lenta y continua */
        }
        @keyframes gradient-shift {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }

        /* Animaciones CSS para efectos de entrada y fondo */
        @keyframes fade-in { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); }}
        @keyframes slide-down { from { opacity: 0; transform: translateY(-20px); } to { opacity: 1; transform: translateY(0); }}
        @keyframes slide-up { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); }}

        /* Animación para la entrada inicial de la tarjeta */
        .animate-fade-in-up { 
          animation: fade-in-up 0.8s ease-out forwards;
        }
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(50px); } 
          to { opacity: 1; transform: translateY(0); }
        }

        /* Animación del Fondo (Emula movimiento complejo de Framer Motion) */
        .animate-move-blob {
          animation: move-blob 25s infinite cubic-bezier(0.4, 0, 0.6, 1);
        }
        @keyframes move-blob {
          0%, 100% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
        }
        
        .animate-fade-in { animation: fade-in 0.6s ease-out forwards; opacity: 0; }
        .animate-slide-down { animation: slide-down 0.6s ease-out forwards; opacity: 0; }
        .animate-slide-up { animation: slide-up 0.6s ease-out forwards; opacity: 0; }

        /* Animación para la apertura suave del dropdown */
        .animate-fadeIn { animation: fadeIn 0.3s ease-out; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
        
        /* Estilos personalizados para el scrollbar en navegadores WebKit */
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: rgba(0, 0, 0, 0.1); border-radius: 3px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(0, 0, 0, 0.2); border-radius: 3px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(0, 0, 0, 0.4); }
      `}</style>
    </div>
  );
}

