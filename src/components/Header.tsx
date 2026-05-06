import React, { useState, useEffect } from 'react';

const Header: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    // Verificar si hay un usuario guardado en localStorage
    const savedUser = localStorage.getItem('user');
    
    if (savedUser) {
      const user = JSON.parse(savedUser);
      if (user.isLoggedIn) {
        setUser(user);
        setIsLoggedIn(true);
      }
    }

    // Cargar contador del carrito
    const count = parseInt(localStorage.getItem('cartCount') || '0');
    setCartCount(count);

    // Escuchar actualizaciones del carrito
    const handleCartUpdate = () => {
      const newCount = parseInt(localStorage.getItem('cartCount') || '0');
      setCartCount(newCount);
    };

    window.addEventListener('cartUpdated', handleCartUpdate);
    
    return () => {
      window.removeEventListener('cartUpdated', handleCartUpdate);
    };
  }, []);

  const handleLogin = () => {
    window.location.href = '/auth';
  };

  const handleLogout = () => {
    // Limpiar completamente el localStorage
    localStorage.removeItem('user');
    localStorage.removeItem('cartCount');
    localStorage.removeItem('token');
    
    // Limpiar estado local
    setIsLoggedIn(false);
    setUser(null);
    setCartCount(0);
    
    // Forzar recarga de página
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
                  {user?.name}
                </span>
                <br />
                <span className="text-[#A2A09D] text-xs">
                  {user?.email}
                </span>
              </div>
              
              {/* Carrito */}
              <div className="relative">
                <button className="bg-[#496B90] text-white border-0 p-3 rounded-lg cursor-pointer transition-all duration-200 hover:bg-[#3A5270]">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  {cartCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-[#D4AF37] text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                      {cartCount}
                    </span>
                  )}
                </button>
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
