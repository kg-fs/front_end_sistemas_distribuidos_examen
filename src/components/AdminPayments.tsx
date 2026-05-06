import React, { useState, useEffect } from 'react';

interface Payment {
  Num_payment: number;
  Num_user: number;
  order_total: string;
  Payment_method: string;
  Payment_status: string;
  created_at: string;
  user_name: string;
  user_email: string;
}

interface PaymentDetail {
  Num_payment: number;
  Num_user: number;
  Amount: string;
  Payment_method: string;
  Status: string;
  created_at: string;
  user_name: string;
  user_email: string;
  // Agregar más campos si la API de detalles devuelve información adicional
}

const AdminPayments: React.FC = () => {
  console.log('AdminPayments montado');
  
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchUserId, setSearchUserId] = useState('');
  const [isSearchingByUser, setIsSearchingByUser] = useState(false);
    const [searchOrderId, setSearchOrderId] = useState('');
  const [isSearchingByOrder, setIsSearchingByOrder] = useState(false);

  useEffect(() => {
    console.log('AdminPayments useEffect llamado');
    fetchPayments();
  }, []);

  const fetchPayments = async (userId: string | null = null) => {
    try {
      console.log('Iniciando fetchPayments');
      setLoading(true);
      setError('');

      let url = 'http://177.7.42.180:3000/api/payments/';
      const headers: HeadersInit = {};

      if (userId) {
        url = 'http://177.7.42.180:3000/api/payments/user';
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
        console.log('Array de pagos:', data.payments);
        setPayments(data.payments || []);
      } else {
        console.log('Error en response:', response.statusText);
        setError('Error al cargar los pagos');
      }
    } catch (err) {
      console.log('Error en fetchPayments:', err);
      setError('Error de conexión al cargar pagos');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchByUser = () => {
    if (searchUserId.trim()) {
      fetchPayments(searchUserId.trim());
      setIsSearchingByUser(true);
    } else {
      // Si el campo está vacío, cargar todos los pagos
      fetchPayments();
      setIsSearchingByUser(false);
    }
  };

  const clearUserSearch = () => {
    setSearchUserId('');
    setIsSearchingByUser(false);
    fetchPayments(); // Cargar todos los pagos
  };

  
  const handleSearchByOrder = async () => {
    if (!searchOrderId.trim()) {
      clearOrderSearch();
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      const response = await fetch('http://177.7.42.180:3000/api/payments/order', {
        method: 'GET',
        headers: {
          'x-order-id': searchOrderId.trim()
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.payments && data.payments.length > 0) {
          // Convertir el pago individual al formato esperado por la tabla
          const paymentData = {
            Num_payment: data.payments[0].Num_payment,
            Num_user: data.payments[0].Num_user,
            order_total: data.payments[0].order_total || data.payments[0].Amount,
            Payment_method: data.payments[0].Payment_method,
            Payment_status: data.payments[0].Payment_status || data.payments[0].Status,
            created_at: data.payments[0].created_at,
            user_name: data.payments[0].user_name,
            user_email: data.payments[0].user_email
          };
          setPayments([paymentData]); // Mostrar solo este pago
          setIsSearchingByOrder(true);
        } else {
          setError('Pago no encontrado para esta orden');
          setPayments([]);
        }
      } else {
        setError('Error al buscar el pago por orden');
        setPayments([]);
      }
    } catch (err) {
      console.error('Error al buscar pago por orden:', err);
      setError('Error de conexión al buscar pago por orden');
      setPayments([]);
    } finally {
      setLoading(false);
    }
  };

  const clearOrderSearch = () => {
    setSearchOrderId('');
    setIsSearchingByOrder(false);
    fetchPayments(); // Cargar todos los pagos
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="text-[#A2A09D]">Cargando pagos...</div>
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
          Gestión de Pagos
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
            onClick={() => fetchPayments()}
            className="bg-[#496B90] text-white border-0 py-2 px-6 text-sm font-medium cursor-pointer transition-all duration-200 hover:bg-[#3a5a7a]"
          >
            Actualizar
          </button>
        </div>
      </div>
      
      {isSearchingByUser && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
          <p className="text-sm text-blue-800">
            Mostrando pagos del usuario ID: <strong>{searchUserId}</strong>
          </p>
        </div>
      )}
      
            
      {isSearchingByOrder && (
        <div className="mb-4 p-3 bg-purple-50 border border-purple-200 rounded-md">
          <p className="text-sm text-purple-800">
            Mostrando pago de la orden ID: <strong>{searchOrderId}</strong>
          </p>
        </div>
      )}
      
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-[#A2A09D]/20">
              <th className="text-left py-3 px-4 text-[#496B90] font-medium">ID Pago</th>
              <th className="text-left py-3 px-4 text-[#496B90] font-medium">Cliente</th>
              <th className="text-left py-3 px-4 text-[#496B90] font-medium">Email</th>
              <th className="text-left py-3 px-4 text-[#496B90] font-medium">Monto</th>
              <th className="text-left py-3 px-4 text-[#496B90] font-medium">Método</th>
              <th className="text-left py-3 px-4 text-[#496B90] font-medium">Estado</th>
              <th className="text-left py-3 px-4 text-[#496B90] font-medium">Fecha</th>
            </tr>
          </thead>
          <tbody>
            {payments.map((payment) => (
              <tr key={payment.Num_payment} className="border-b border-[#A2A09D]/10 hover:bg-[#F8F8F8]">
                <td className="py-3 px-4 text-[#496B90]">{payment.Num_payment}</td>
                <td className="py-3 px-4 text-[#496B90]">{payment.user_name}</td>
                <td className="py-3 px-4 text-[#A2A09D] text-sm">{payment.user_email}</td>
                <td className="py-3 px-4 text-[#D4AF37] font-medium">
                  ${payment.order_total ? parseFloat(payment.order_total).toFixed(2) : '0.00'}
                </td>
                <td className="py-3 px-4 text-[#496B90]">{payment.Payment_method || 'N/A'}</td>
                <td className="py-3 px-4">
                  <span className={`px-2 py-1 rounded text-xs ${
                    payment.Payment_status && (payment.Payment_status.toLowerCase() === 'completado' || payment.Payment_status.toLowerCase() === 'pagado')
                      ? 'bg-green-100 text-green-800' 
                      : payment.Payment_status && payment.Payment_status.toLowerCase() === 'pendiente'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {payment.Payment_status || 'Sin estado'}
                  </span>
                </td>
                <td className="py-3 px-4 text-[#A2A09D] text-sm">
                  {new Date(payment.created_at).toLocaleDateString('es-ES', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {payments.length === 0 && (
          <div className="text-center py-8 text-[#A2A09D]">
            No hay pagos disponibles
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPayments;
