import React, { useState, useEffect } from 'react';

interface Order {
  Num_order: number;
  Num_user: number;
  Total: string;
  Status: string;
  created_at: string;
  user_name: string;
  user_email: string;
}

interface OrderDetail {
  Num_order: number;
  Num_user: number;
  Total: string;
  Status: string;
  created_at: string;
  user_name: string;
  user_email: string;
  items: {
    Num_order_item: number;
    Quantity: number;
    Price: string;
    Name_product: string;
  }[];
}

const AdminOrders: React.FC = () => {
  console.log('AdminOrders montado');
  
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<OrderDetail | null>(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [detailsError, setDetailsError] = useState('');
  const [searchUserId, setSearchUserId] = useState('');
  const [isSearchingByUser, setIsSearchingByUser] = useState(false);
  const [searchOrderId, setSearchOrderId] = useState('');
  const [isSearchingByOrder, setIsSearchingByOrder] = useState(false);

  useEffect(() => {
    console.log('AdminOrders useEffect llamado');
    fetchOrders();
  }, []);

  const fetchOrders = async (userId: string | null = null) => {
    try {
      console.log('Iniciando fetchOrders');
      setLoading(true);
      setError('');

      let url = 'http://177.7.42.180:3000/api/orders/';
      const headers: HeadersInit = {};

      if (userId) {
        url = 'http://177.7.42.180:3000/api/orders/user';
        headers['x-user-id'] = userId;
      }

      const response = await fetch(url, {
        method: 'GET',
        headers: headers
      });
      
      console.log('Response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Datos recibidos:', data);
        console.log('Array de órdenes:', data.orders);
        setOrders(data.orders || []);
      } else {
        console.log('Error en response:', response.statusText);
        setError('Error al cargar las órdenes');
      }
    } catch (err) {
      console.log('Error en fetchOrders:', err);
      setError('Error de conexión al cargar órdenes');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchByUser = () => {
    if (searchUserId.trim()) {
      fetchOrders(searchUserId.trim());
      setIsSearchingByUser(true);
    } else {
      // Si el campo está vacío, cargar todas las órdenes
      fetchOrders();
      setIsSearchingByUser(false);
    }
  };

  const clearUserSearch = () => {
    setSearchUserId('');
    setIsSearchingByUser(false);
    fetchOrders(); // Cargar todas las órdenes
  };

  const handleSearchByOrder = async () => {
    if (!searchOrderId.trim()) {
      clearOrderSearch();
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      const response = await fetch('http://177.7.42.180:3000/api/orders/detail', {
        method: 'GET',
        headers: {
          'x-order-id': searchOrderId.trim()
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data) {
          // Convertir la orden individual al formato esperado por la tabla
          const orderData = {
            Num_order: data.data.Num_order,
            Num_user: data.data.Num_user,
            Total: data.data.Total,
            Status: data.data.Status,
            created_at: data.data.created_at,
            user_name: data.data.user_name,
            user_email: data.data.user_email
          };
          setOrders([orderData]); // Mostrar solo esta orden
          setIsSearchingByOrder(true);
        } else {
          setError('Orden no encontrada');
          setOrders([]);
        }
      } else {
        setError('Error al buscar la orden');
        setOrders([]);
      }
    } catch (err) {
      console.error('Error al buscar orden:', err);
      setError('Error de conexión al buscar orden');
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const clearOrderSearch = () => {
    setSearchOrderId('');
    setIsSearchingByOrder(false);
    fetchOrders(); // Cargar todas las órdenes
  };

  const fetchOrderDetails = async (orderId: number) => {
    try {
      setDetailsLoading(true);
      setDetailsError('');
      
      const response = await fetch('http://177.7.42.180:3000/api/orders/detail', {
        method: 'GET',
        headers: {
          'x-order-id': String(orderId)
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data) {
          setSelectedOrder(data.data);
          setIsDetailsModalOpen(true);
        } else {
          setDetailsError('No se encontraron detalles de la orden');
        }
      } else {
        setDetailsError('Error al cargar los detalles de la orden');
      }
    } catch (err) {
      console.error('Error al cargar detalles:', err);
      setDetailsError('Error de conexión al cargar detalles');
    } finally {
      setDetailsLoading(false);
    }
  };

  const handleViewDetails = (orderId: number) => {
    fetchOrderDetails(orderId);
  };

  const closeDetailsModal = () => {
    setIsDetailsModalOpen(false);
    setSelectedOrder(null);
    setDetailsError('');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="text-[#A2A09D]">Cargando órdenes...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-[#A2A09D]/20 p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl text-[#496B90] font-light tracking-wide">
          Gestión de Órdenes (Ventas)
        </h2>
        <div className="flex gap-3 items-center">
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Buscar por ID de Usuario"
              value={searchUserId}
              onChange={(e) => setSearchUserId(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearchByUser()}
              className="px-3 py-2 border border-[#A2A09D]/20 rounded-md focus:outline-none focus:ring-2 focus:ring-[#496B90] text-sm"
            />
            <button
              onClick={handleSearchByUser}
              disabled={loading}
              className="bg-[#496B90] text-white border-0 py-2 px-4 text-sm font-medium cursor-pointer transition-all duration-200 hover:bg-[#3a5a7a] disabled:opacity-50"
            >
              {loading ? 'Buscando...' : 'Buscar Usuario'}
            </button>
            {isSearchingByUser && (
              <button
                onClick={clearUserSearch}
                className="text-[#A2A09D] hover:text-[#496B90] text-sm font-medium transition-colors"
              >
                Limpiar
              </button>
            )}
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Buscar por ID de Orden"
              value={searchOrderId}
              onChange={(e) => setSearchOrderId(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearchByOrder()}
              className="px-3 py-2 border border-[#A2A09D]/20 rounded-md focus:outline-none focus:ring-2 focus:ring-[#496B90] text-sm"
            />
            <button
              onClick={handleSearchByOrder}
              disabled={loading}
              className="bg-[#496B90] text-white border-0 py-2 px-4 text-sm font-medium cursor-pointer transition-all duration-200 hover:bg-[#3a5a7a] disabled:opacity-50"
            >
              {loading ? 'Buscando...' : 'Buscar Orden'}
            </button>
            {isSearchingByOrder && (
              <button
                onClick={clearOrderSearch}
                className="text-[#A2A09D] hover:text-[#496B90] text-sm font-medium transition-colors"
              >
                Limpiar
              </button>
            )}
          </div>
          <button
            onClick={() => fetchOrders()}
            className="bg-[#496B90] text-white border-0 py-2 px-6 text-sm font-medium cursor-pointer transition-all duration-200 hover:bg-[#3a5a7a]"
          >
            Actualizar
          </button>
        </div>
      </div>
      
      {isSearchingByUser && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
          <p className="text-sm text-blue-800">
            Mostrando órdenes del usuario ID: <strong>{searchUserId}</strong>
          </p>
        </div>
      )}
      
      {isSearchingByOrder && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md">
          <p className="text-sm text-green-800">
            Mostrando orden ID: <strong>{searchOrderId}</strong>
          </p>
        </div>
      )}
      
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-[#A2A09D]/20">
              <th className="text-left py-3 px-4 text-[#496B90] font-medium">ID Orden</th>
              <th className="text-left py-3 px-4 text-[#496B90] font-medium">Cliente</th>
              <th className="text-left py-3 px-4 text-[#496B90] font-medium">Email</th>
              <th className="text-left py-3 px-4 text-[#496B90] font-medium">Total</th>
              <th className="text-left py-3 px-4 text-[#496B90] font-medium">Estado</th>
              <th className="text-left py-3 px-4 text-[#496B90] font-medium">Fecha</th>
              <th className="text-left py-3 px-4 text-[#496B90] font-medium">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.Num_order} className="border-b border-[#A2A09D]/10 hover:bg-[#F8F8F8]">
                <td className="py-3 px-4 text-[#496B90]">{order.Num_order}</td>
                <td className="py-3 px-4 text-[#496B90]">{order.user_name}</td>
                <td className="py-3 px-4 text-[#A2A09D] text-sm">{order.user_email}</td>
                <td className="py-3 px-4 text-[#D4AF37] font-medium">${parseFloat(order.Total).toFixed(2)}</td>
                <td className="py-3 px-4">
                  <span className={`px-2 py-1 rounded text-xs ${
                    order.Status === 'pagado' 
                      ? 'bg-green-100 text-green-800' 
                      : order.Status === 'pendiente'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {order.Status}
                  </span>
                </td>
                <td className="py-3 px-4 text-[#A2A09D] text-sm">
                  {new Date(order.created_at).toLocaleDateString('es-ES', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </td>
                <td className="py-3 px-4">
                  <button
                    onClick={() => handleViewDetails(order.Num_order)}
                    disabled={detailsLoading}
                    className="bg-[#496B90] text-white py-1 px-3 rounded text-xs font-medium hover:bg-[#3a5a7a] transition-all duration-200 disabled:opacity-50"
                  >
                    {detailsLoading ? 'Cargando...' : 'Ver Detalles'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {orders.length === 0 && (
          <div className="text-center py-8 text-[#A2A09D]">
            No hay órdenes disponibles
          </div>
        )}
      </div>
      
      {/* Modal para ver detalles de la orden */}
      {isDetailsModalOpen && selectedOrder && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl text-[#496B90] font-light tracking-wide">
                Detalles de la Orden #{selectedOrder.Num_order}
              </h3>
              <button
                onClick={closeDetailsModal}
                className="text-[#A2A09D] hover:text-[#496B90] text-2xl"
              >
                ×
              </button>
            </div>
            
            {detailsError ? (
              <div className="text-red-500 text-center py-4">
                {detailsError}
              </div>
            ) : (
              <div className="space-y-6">
                {/* Información del cliente */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-[#F8F8F8] p-4 rounded-lg">
                    <h4 className="font-medium text-[#496B90] mb-2">Información del Cliente</h4>
                    <p className="text-sm text-[#A2A09D]">Nombre: {selectedOrder.user_name}</p>
                    <p className="text-sm text-[#A2A09D]">Email: {selectedOrder.user_email}</p>
                    <p className="text-sm text-[#A2A09D]">ID Usuario: {selectedOrder.Num_user}</p>
                  </div>
                  <div className="bg-[#F8F8F8] p-4 rounded-lg">
                    <h4 className="font-medium text-[#496B90] mb-2">Información de la Orden</h4>
                    <p className="text-sm text-[#A2A09D]">Estado: 
                      <span className={`ml-2 px-2 py-1 rounded text-xs ${
                        selectedOrder.Status === 'pagado' 
                          ? 'bg-green-100 text-green-800' 
                          : selectedOrder.Status === 'pendiente'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {selectedOrder.Status}
                      </span>
                    </p>
                    <p className="text-sm text-[#A2A09D]">Total: <span className="text-[#D4AF37] font-medium">${parseFloat(selectedOrder.Total).toFixed(2)}</span></p>
                    <p className="text-sm text-[#A2A09D]">Fecha: {new Date(selectedOrder.created_at).toLocaleDateString('es-ES', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}</p>
                  </div>
                </div>
                
                {/* Productos de la orden */}
                <div>
                  <h4 className="font-medium text-[#496B90] mb-4">Productos de la Orden</h4>
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="border-b border-[#A2A09D]/20">
                          <th className="text-left py-3 px-4 text-[#496B90] font-medium">Producto</th>
                          <th className="text-left py-3 px-4 text-[#496B90] font-medium">Cantidad</th>
                          <th className="text-left py-3 px-4 text-[#496B90] font-medium">Precio Unitario</th>
                          <th className="text-left py-3 px-4 text-[#496B90] font-medium">Subtotal</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedOrder.items.map((item) => (
                          <tr key={item.Num_order_item} className="border-b border-[#A2A09D]/10 hover:bg-[#F8F8F8]">
                            <td className="py-3 px-4 text-[#496B90]">{item.Name_product}</td>
                            <td className="py-3 px-4 text-[#496B90]">{item.Quantity}</td>
                            <td className="py-3 px-4 text-[#D4AF37] font-medium">${parseFloat(item.Price).toFixed(2)}</td>
                            <td className="py-3 px-4 text-[#D4AF37] font-medium">
                              ${(parseFloat(item.Price) * item.Quantity).toFixed(2)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
            
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={closeDetailsModal}
                className="px-4 py-2 text-[#496B90] border border-[#496B90] rounded-md hover:bg-[#496B90] hover:text-white transition-colors"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminOrders;
