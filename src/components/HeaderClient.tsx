import React, { useState, useEffect } from 'react';
import CartModal from './CartModal';
import PickupOrdersModal from './PickupOrdersModal';
import PaymentsModal from './PaymentsModal';

const HeaderClient: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [cartCount, setCartCount] = useState(0);
  const [pickupOrdersCount, setPickupOrdersCount] = useState(0);
  const [isCartModalOpen, setIsCartModalOpen] = useState(false);
  const [isPickupOrdersModalOpen, setIsPickupOrdersModalOpen] = useState(false);
  const [isPaymentsModalOpen, setIsPaymentsModalOpen] = useState(false);

  // Obtener contador de pedidos pendientes de retiro desde el backend
  const fetchPickupOrdersCount = async () => {
    if (typeof window === 'undefined') return;
    
    try {
      // Obtener el userId del localStorage
      const savedUser = localStorage.getItem('user');
      if (!savedUser) {
        setPickupOrdersCount(0);
        return;
      }
      
      const user = JSON.parse(savedUser);
      const userId = user.id || user.userId;
      
      if (!userId) {
        setPickupOrdersCount(0);
        return;
      }
      
      // Hacer la petición GET al backend para obtener los pedidos pendientes de retiro
      const response = await fetch('http://177.7.42.180:3000/api/pickup/user', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': userId.toString()
        }
      });
      
      if (!response.ok) {
        throw new Error(`Error al obtener pedidos pendientes: ${response.status}`);
      }
      
      const result = await response.json();
      // Usar el array pickups de la respuesta del backend
      const pendingOrders = result.pickups || [];
      // Contar pedidos con estado 'pendiente' o similar
      const pendingCount = pendingOrders.filter((order: any) => 
        order.Status === 'pendiente' || 
        order.Status === 'pending' ||
        order.Status === 'listo_para_retiro'
      ).length;
      
      setPickupOrdersCount(pendingCount);
      
    } catch (error) {
      console.error('Error al obtener contador de pedidos pendientes:', error);
      setPickupOrdersCount(0);
    }
  };

  // Obtener contador del carrito desde el backend
  const fetchCartCount = async () => {
    if (typeof window === 'undefined') return;
    
    try {
      // Obtener el userId del localStorage
      const savedUser = localStorage.getItem('user');
      if (!savedUser) {
        setCartCount(0);
        return;
      }
      
      const user = JSON.parse(savedUser);
      const userId = user.id || user.userId;
      
      if (!userId) {
        setCartCount(0);
        return;
      }
      
      // Hacer la petición GET al backend para obtener el carrito
      const response = await fetch('http://177.7.42.180:3000/api/cart/items', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': userId.toString()
        }
      });
      
      if (!response.ok) {
        throw new Error(`Error al obtener carrito: ${response.status}`);
      }
      
      const result = await response.json();
      // Usar items_count del backend si está disponible, si no calcularlo
      if (result.items_count !== undefined) {
        setCartCount(result.items_count);
      } else {
        const items = result.items || [];
        const totalCount = items.reduce((total: number, item: any) => total + item.Quantity, 0);
        setCartCount(totalCount);
      }
      
    } catch (error) {
      console.error('Error al obtener contador del carrito:', error);
      setCartCount(0);
    }
  };

  useEffect(() => {
    // Verificar si hay un usuario guardado en localStorage
    const savedUser = localStorage.getItem('user');
    
    if (savedUser) {
      const user = JSON.parse(savedUser);
      if (user.isLoggedIn) {
        setUser(user);
        setIsLoggedIn(true);
        // Cargar contador del carrito cuando el usuario está logueado
        fetchCartCount();
        // Cargar contador de pedidos pendientes de retiro
        fetchPickupOrdersCount();
      }
    }

    // Escuchar eventos de actualización del carrito
    const handleCartUpdate = () => {
      fetchCartCount();
    };

    // Escuchar eventos de actualización de pedidos
    const handleOrdersUpdate = () => {
      fetchPickupOrdersCount();
    };

    window.addEventListener('cartUpdated', handleCartUpdate);
    window.addEventListener('ordersUpdated', handleOrdersUpdate);
    
    return () => {
      window.removeEventListener('cartUpdated', handleCartUpdate);
      window.removeEventListener('ordersUpdated', handleOrdersUpdate);
    };
  }, []);

  const handleLogin = () => {
    window.location.href = '/auth';
  };

  const handleCartClick = () => {
    setIsCartModalOpen(true);
  };

  const handlePickupOrdersClick = () => {
    setIsPickupOrdersModalOpen(true);
  };

  const handlePaymentsClick = () => {
    setIsPaymentsModalOpen(true);
  };

  const handleLogout = () => {
    // Limpiar completamente el localStorage
    localStorage.removeItem('user');
    localStorage.removeItem('cartCount');
    localStorage.removeItem('token');
    
    // Limpiar estado local
    setIsLoggedIn(false);
    setUser(null);
    
    // Forzar recarga de página
    window.location.href = '/';
  };

  return (
    <>
      <header className="bg-white border-b border-[#A2A09D]/20 py-6 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-6 flex justify-between items-center">
          <div className="logo">
            <div className="flex flex-col">
              <h1 className="m-0 text-[#496B90] text-3xl font-light tracking-wide">Floralia</h1>
              <p className="m-0 text-[#A2A09D] text-xs tracking-wider uppercase">flores y arreglos</p>
              {isLoggedIn && user?.email && (
                <p className="m-0 text-[#496B90] text-sm mt-2">{user.email}</p>
              )}
            </div>
          </div>
          <nav className="nav">
            {isLoggedIn ? (
              <div className="flex items-center gap-6">
                <div className="text-right">
                  <span className="text-[#496B90] text-sm font-medium">
                    {user?.name}
                  </span>
                </div>
                
                {/* Pedidos Pendientes de Retiro - Texto Botón */}
                <button
                  onClick={handlePickupOrdersClick}
                  className="text-[#D4AF37] hover:text-[#B8941F] font-medium text-sm transition-colors duration-200 relative"
                >
                  Pedidos Pendientes
                  {pickupOrdersCount > 0 && (
                    <span className="absolute -top-2 -right-3 bg-[#E74C3C] text-white text-xs w-4 h-4 rounded-full flex items-center justify-center font-bold text-[10px]">
                      {pickupOrdersCount}
                    </span>
                  )}
                </button>
                
                {/* Pagos Realizados - Texto Botón */}
                <button
                  onClick={handlePaymentsClick}
                  className="text-[#496B90] hover:text-[#3A5270] font-medium text-sm transition-colors duration-200"
                >
                  Pagos Realizados
                </button>
                
                {/* Carrito */}
                <div className="relative">
                  <button 
                    onClick={handleCartClick}
                    className="bg-[#496B90] text-white border-0 p-3 rounded-lg cursor-pointer transition-all duration-200 hover:bg-[#3A5270]"
                  >
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
      
      {/* Modal del Carrito */}
      <CartModal 
        isOpen={isCartModalOpen} 
        onClose={() => setIsCartModalOpen(false)} 
      />
      
      {/* Modal de Pedidos Pendientes de Retiro */}
      <PickupOrdersModal 
        isOpen={isPickupOrdersModalOpen} 
        onClose={() => setIsPickupOrdersModalOpen(false)} 
      />
      
      {/* Modal de Pagos Realizados */}
      <PaymentsModal 
        isOpen={isPaymentsModalOpen} 
        onClose={() => setIsPaymentsModalOpen(false)} 
      />
    </>
  );
};

export default HeaderClient;
