import React, { useState, useEffect } from 'react';

interface Order {
  Num_pickup: number;
  Num_order: number;
  Pickup_date: string;
  Pickup_time: string;
  Status: string;
  created_at: string;
  order_total: string;
  order_status: string;
  user_name: string;
  user_email: string;
  Num_user: number;
}

interface PickupOrdersModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PickupOrdersModal: React.FC<PickupOrdersModalProps> = ({ isOpen, onClose }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetchPickupOrders();
    }
  }, [isOpen]);

  const fetchPickupOrders = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Obtener el userId del localStorage
      const savedUser = localStorage.getItem('user');
      if (!savedUser) {
        setError('No hay usuario autenticado');
        return;
      }
      
      const user = JSON.parse(savedUser);
      const userId = user.id || user.userId;
      
      if (!userId) {
        setError('ID de usuario no encontrado');
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
      // Filtrar pedidos con estado 'pendiente' o similar
      const filteredOrders = pendingOrders.filter((order: any) => 
        order.Status === 'pendiente' || 
        order.Status === 'pending' ||
        order.Status === 'listo_para_retiro'
      );
      
      setOrders(filteredOrders);
      
    } catch (error) {
      console.error('Error al obtener pedidos pendientes:', error);
      setError('No se pudieron cargar los pedidos pendientes');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatTime = (timeString: string) => {
    const [hours, minutes] = timeString.split(':');
    return `${hours}:${minutes}`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-[#606A7B] bg-opacity-70 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="bg-[#496B90] text-white p-6 flex justify-between items-center">
          <h2 className="text-xl font-semibold">Pedidos Pendientes de Retiro</h2>
          <button
            onClick={onClose}
            className="text-white hover:text-gray-200 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {loading ? (
            <div className="text-center py-8">
              <div className="w-8 h-8 border-2 border-[#A2A09D]/30 border-t-[#496B90] rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-[#A2A09D]">Cargando pedidos...</p>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <p className="text-red-500 mb-4">{error}</p>
              <button
                onClick={fetchPickupOrders}
                className="bg-[#496B90] text-white px-4 py-2 rounded hover:bg-[#3A5270] transition-colors"
              >
                Reintentar
              </button>
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-[#A2A09D]">No tienes pedidos pendientes de retiro</p>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <div key={order.Num_pickup} className="border border-[#A2A09D]/20 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-semibold text-[#496B90] text-lg">
                        Pedido #{order.Num_order}
                      </h3>
                      <p className="text-[#A2A09D] text-sm">
                        Fecha: {formatDate(order.Pickup_date)}
                      </p>
                      <p className="text-[#A2A09D] text-sm">
                        Hora: {formatTime(order.Pickup_time)}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="inline-block bg-[#D4AF37] text-white px-3 py-1 rounded-full text-sm font-medium">
                        {order.Status}
                      </span>
                      <p className="text-[#496B90] font-semibold mt-2">
                        ${parseFloat(order.order_total).toFixed(2)}
                      </p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-[#A2A09D]">Cliente:</span>
                      <span className="ml-2 text-gray-700">{order.user_name}</span>
                    </div>
                    <div>
                      <span className="text-[#A2A09D]">Email:</span>
                      <span className="ml-2 text-gray-700 text-xs">{order.user_email}</span>
                    </div>
                    <div>
                      <span className="text-[#A2A09D]">Estado del pedido:</span>
                      <span className="ml-2 text-gray-700">{order.order_status}</span>
                    </div>
                    <div>
                      <span className="text-[#A2A09D]">ID Usuario:</span>
                      <span className="ml-2 text-gray-700">{order.Num_user}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-[#A2A09D]/20 p-4 bg-gray-50">
          <div className="flex justify-between items-center">
            <p className="text-[#A2A09D] text-sm">
              Total de pedidos pendientes: <span className="font-semibold text-[#496B90]">{orders.length}</span>
            </p>
            <button
              onClick={onClose}
              className="bg-[#A2A09D] text-white px-6 py-2 rounded hover:bg-[#8B8A87] transition-colors"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PickupOrdersModal;
