import React, { useState } from 'react';
import AdminProducts from './AdminProducts';
import AdminOrders from './AdminOrders';
import AdminPayments from './AdminPayments';
import AdminPickups from './AdminPickups';
import AdminUsers from './AdminUsers';

const AdminDashboard: React.FC = () => {
  const [activeSection, setActiveSection] = useState<string>('welcome');

  const menuItems = [
    { id: 'products', label: 'Productos', icon: '📦' },
    { id: 'delivery-orders', label: 'Órdenes de Entrega', icon: '🚚' },
    { id: 'orders', label: 'Órdenes (Ventas)', icon: '🛒' },
    { id: 'payments', label: 'Pagos', icon: '💳' },
    { id: 'users', label: 'Usuarios', icon: '👥' }
  ];

  const renderContent = () => {
    console.log('renderContent llamado con activeSection:', activeSection);
    
    switch (activeSection) {
      case 'products':
        console.log('Cargando AdminProducts');
        return <AdminProducts />;
      case 'orders':
        console.log('Cargando AdminOrders');
        return <AdminOrders />;
      case 'payments':
        console.log('Cargando AdminPayments');
        return <AdminPayments />;
      case 'delivery-orders':
        console.log('Cargando AdminPickups');
        return <AdminPickups />;
      case 'users':
        console.log('Cargando AdminUsers');
        return <AdminUsers />;
      default:
        return (
          <div className="bg-white rounded-lg border border-[#A2A09D]/20 p-12 text-center">
            <h1 className="text-4xl text-[#496B90] font-light tracking-wide mb-6">
              Panel de Administración
            </h1>
            <p className="text-xl text-[#A2A09D] mb-8">
              Bienvenido al panel de administración de Floralia
            </p>
            <div className="text-[#A2A09D] mb-8">
              <p className="mb-4">Selecciona una opción del menú lateral para comenzar:</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto text-left">
                <div className="flex items-center gap-3 p-4 bg-[#F8F8F8] rounded-lg">
                  <span className="text-2xl">📦</span>
                  <div>
                    <div className="font-medium text-[#496B90]">Productos</div>
                    <div className="text-sm text-[#A2A09D]">Gestión del catálogo</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 bg-[#F8F8F8] rounded-lg">
                  <span className="text-2xl">🚚</span>
                  <div>
                    <div className="font-medium text-[#496B90]">Órdenes de Entrega</div>
                    <div className="text-sm text-[#A2A09D]">Gestión de entregas</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 bg-[#F8F8F8] rounded-lg">
                  <span className="text-2xl">🛒</span>
                  <div>
                    <div className="font-medium text-[#496B90]">Órdenes (Ventas)</div>
                    <div className="text-sm text-[#A2A09D]">Historial de ventas</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 bg-[#F8F8F8] rounded-lg">
                  <span className="text-2xl">💳</span>
                  <div>
                    <div className="font-medium text-[#496B90]">Pagos</div>
                    <div className="text-sm text-[#A2A09D]">Gestión de pagos</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 bg-[#F8F8F8] rounded-lg">
                  <span className="text-2xl">👥</span>
                  <div>
                    <div className="font-medium text-[#496B90]">Usuarios</div>
                    <div className="text-sm text-[#A2A09D]">Gestión de usuarios</div>
                  </div>
                </div>
              </div>
            </div>
            <p className="text-sm text-[#A2A09D]">
              Las funcionalidades estarán disponibles próximamente.
            </p>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F8F8]">
      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-white border-r border-[#A2A09D]/20 min-h-screen">
          <div className="p-6">
            <h2 className="text-xl text-[#496B90] font-light tracking-wide mb-8">
              Dashboard Admin
            </h2>
            <nav className="space-y-2">
              {menuItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveSection(item.id)}
                  className={`w-full text-left px-4 py-3 rounded-lg transition-all duration-200 flex items-center gap-3 ${
                    activeSection === item.id
                      ? 'bg-[#496B90] text-white'
                      : 'text-[#A2A09D] hover:bg-[#F8F8F8] hover:text-[#496B90]'
                  }`}
                >
                  <span className="text-xl">{item.icon}</span>
                  <span className="font-medium">{item.label}</span>
                </button>
              ))}
            </nav>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-8">
          <div className="max-w-6xl mx-auto">
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
