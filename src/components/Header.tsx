import React, { useState, useEffect } from 'react';

const Header: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    // Verificar si hay un usuario guardado en localStorage
    const savedUser = localStorage.getItem('user');
    
    if (savedUser) {
      const user = JSON.parse(savedUser);
      if (user.isLoggedIn) {
        setUser(user);
        setIsLoggedIn(true);
        
        // Verificar si la sesión ha expirado (opcional: 24 horas)
        const loginTime = new Date(user.loginTimestamp);
        const now = new Date();
        const hoursDiff = (now.getTime() - loginTime.getTime()) / (1000 * 60 * 60);
        
        if (hoursDiff > 24) {
          // Sesión expirada, limpiar y redirigir
          handleLogout();
        }
      }
    }
  }, []);

  const handleLogin = () => {
    window.location.href = '/auth';
  };

  const handleLogout = () => {
    // Limpiar completamente el localStorage
    localStorage.removeItem('user');
    localStorage.removeItem('cartCount');
    localStorage.removeItem('token');
    
    // Limpiar cualquier otro dato de sesión
    localStorage.removeItem('adminData');
    localStorage.removeItem('clientData');
    
    // Limpiar estado local
    setIsLoggedIn(false);
    setUser(null);
    
    console.log('Sesión cerrada, redirigiendo al landing page');
    
    // Redirigir al landing page con recarga completa
    window.location.href = '/';
  };

  return (
    <header className="bg-white border-b border-[#A2A09D]/20 py-6 sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-6 flex justify-between items-center">
        <div className="logo">
          <div className="flex flex-col">
            <h1 className="m-0 text-[#496B90] text-3xl font-light tracking-wide">Floralia</h1>
            <p className="m-0 text-[#A2A09D] text-xs tracking-wider uppercase">flores y arreglos</p>
          </div>
        </div>
        <nav className="nav">
          {isLoggedIn ? (
            <div className="flex items-center gap-6">
              <div className="text-right">
                <span className="text-[#496B90] text-sm font-medium">
                  {user?.Firs_name_user} {user?.Last_name_user}
                </span>
                <br />
                <span className="text-[#A2A09D] text-xs">
                  {user?.email}
                </span>
              </div>
              
              <button 
                onClick={handleLogout}
                className="bg-[#A2A09D] text-white border-0 py-2 px-6 text-sm font-medium cursor-pointer transition-all duration-200 hover:bg-[#8B8A87]"
              >
                Cerrar Sesión
              </button>
            </div>
          ) : (
            <button 
              onClick={handleLogin}
              className="bg-[#496B90] text-white border-0 py-2 px-6 text-sm font-medium cursor-pointer transition-all duration-200 hover:bg-[#3A5270]"
            >
              Iniciar Sesión
            </button>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;
