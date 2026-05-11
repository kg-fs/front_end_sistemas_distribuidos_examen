import React, { useState, useEffect } from 'react';

interface Payment {
  Num_payment: number;
  Num_order: number;
  Payment_method: string;
  Payment_status: string;
  Transaction_id: string | null;
  created_at: string;
  order_total: string;
  order_status: string;
  user_name: string;
  user_email: string;
  Num_user: number;
}

interface PaymentsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PaymentsModal: React.FC<PaymentsModalProps> = ({ isOpen, onClose }) => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetchPayments();
    }
  }, [isOpen]);

  const fetchPayments = async () => {
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
      
      // Hacer la petición GET al backend para obtener los pagos realizados
      const response = await fetch('http://177.7.42.180:3000/api/payments/user', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': userId.toString()
        }
      });
      
      if (!response.ok) {
        throw new Error(`Error al obtener pagos realizados: ${response.status}`);
      }
      
      const result = await response.json();
      // Usar el array payments de la respuesta del backend
      const paymentsData = result.payments || [];
      setPayments(paymentsData);
      
    } catch (error) {
      console.error('Error al obtener pagos realizados:', error);
      setError('No se pudieron cargar los pagos realizados');
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

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-[#606A7B] bg-opacity-70 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="bg-[#496B90] text-white p-6 flex justify-between items-center">
          <h2 className="text-xl font-semibold">Pagos Realizados</h2>
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
              <p className="text-[#A2A09D]">Cargando pagos...</p>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <p className="text-red-500 mb-4">{error}</p>
              <button
                onClick={fetchPayments}
                className="bg-[#496B90] text-white px-4 py-2 rounded hover:bg-[#3A5270] transition-colors"
              >
                Reintentar
              </button>
            </div>
          ) : payments.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-[#A2A09D]">No tienes pagos realizados</p>
            </div>
          ) : (
            <div className="space-y-4">
              {payments.map((payment) => (
                <div key={payment.Num_payment} className="border border-[#A2A09D]/20 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-semibold text-[#496B90] text-lg">
                        Pago #{payment.Num_payment}
                      </h3>
                      <p className="text-[#A2A09D] text-sm">
                        Pedido #{payment.Num_order}
                      </p>
                      <p className="text-[#A2A09D] text-sm">
                        Fecha: {formatDate(payment.created_at)}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                        payment.Payment_status === 'completado' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {payment.Payment_status}
                      </span>
                      <p className="text-[#496B90] font-semibold mt-2">
                        ${parseFloat(payment.order_total).toFixed(2)}
                      </p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-[#A2A09D]">Cliente:</span>
                      <span className="ml-2 text-gray-700">{payment.user_name}</span>
                    </div>
                    <div>
                      <span className="text-[#A2A09D]">Email:</span>
                      <span className="ml-2 text-gray-700 text-xs">{payment.user_email}</span>
                    </div>
                    <div>
                      <span className="text-[#A2A09D]">Método de pago:</span>
                      <span className="ml-2 text-gray-700">{payment.Payment_method}</span>
                    </div>
                                        <div>
                      <span className="text-[#A2A09D]">Estado del pedido:</span>
                      <span className="ml-2 text-gray-700">{payment.order_status}</span>
                    </div>
                    <div>
                      <span className="text-[#A2A09D]">ID Usuario:</span>
                      <span className="ml-2 text-gray-700">{payment.Num_user}</span>
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
              Total de pagos realizados: <span className="font-semibold text-[#496B90]">{payments.length}</span>
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

export default PaymentsModal;
