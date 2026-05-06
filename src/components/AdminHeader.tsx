import React, { useState, useEffect } from 'react';

const AdminHeader: React.FC = () => {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    // Verificar si hay un usuario guardado en localStorage
    const savedUser = localStorage.getItem('user');
    
    if (savedUser) {
      const user = JSON.parse(savedUser);
      if (user.isLoggedIn) {
        setUser(user);
      }
    }
  }, []);

  const handleLogout = () => {
    // Limpiar completamente el localStorage
    localStorage.removeItem('user');
    localStorage.removeItem('cartCount');
    localStorage.removeItem('token');
    
    // Forzar recarga de página para limpiar estado
    window.location.href = '/';
  };

  return (
    <header className="bg-white border-b border-[#A2A09D]/20 py-6 sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-6 flex justify-between items-center">
        <div className="logo">
          <div className="flex flex-col">
            <h1 className="m-0 text-[#496B90] text-3xl font-light tracking-wide">Floralia</h1>
            <p className="m-0 text-[#A2A09D] text-xs tracking-wider uppercase">Panel de Administración</p>
          </div>
        </div>
        <nav className="nav">
          <div className="flex items-center gap-6">
            <div className="text-right">
              <span className="text-[#496B90] text-sm font-medium">
                {user?.email}
              </span>
              <br />
              <span className="text-[#A2A09D] text-xs">
                {user?.role === 1 || user?.role === 'Administrador' ? 'Administrador' : 'Empleado'}
              </span>
            </div>
            
            <button 
              onClick={handleLogout}
              className="bg-[#A2A09D] text-white border-0 py-2 px-6 text-sm font-medium cursor-pointer transition-all duration-200 hover:bg-[#8B8A87]"
            >
              Cerrar Sesión
            </button>
          </div>
        </nav>
      </div>
    </header>
  );
};

export default AdminHeader;
