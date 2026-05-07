import React, { useState, useEffect } from 'react';
import PayPalButton from './PayPalButton';

interface CartItem {
  Num_cart_item?: number;
  Num_product: number;
  Name_product: string;
  Price: string;
  Image_url?: string;
  Quantity: number;
  Stock: number;
}

interface CartModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CartModal: React.FC<CartModalProps> = ({ isOpen, onClose }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [showPayPal, setShowPayPal] = useState(false);
  const [processingPayment, setProcessingPayment] = useState(false);

  // Obtener items del carrito desde el backend
  const fetchCartItems = async () => {
    if (typeof window === 'undefined') return;
    
    try {
      setLoading(true);
      
      // Obtener el userId del localStorage
      const savedUser = localStorage.getItem('user');
      if (!savedUser) {
        console.error('No hay usuario autenticado');
        setCartItems([]);
        return;
      }
      
      const user = JSON.parse(savedUser);
      const userId = user.id || user.userId;
      
      if (!userId) {
        console.error('No se encontró el ID del usuario');
        setCartItems([]);
        return;
      }
      
      // Hacer la petición GET al backend
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
      setCartItems(result.items || []);
      
    } catch (error) {
      console.error('Error al obtener items del carrito:', error);
      setCartItems([]);
    } finally {
      setLoading(false);
    }
  };

  // Prevenir doble scroll cuando se abre/cierra la modal
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      fetchCartItems();
    } else {
      document.body.style.overflow = '';
    }
    
    // Limpiar cuando se desmonta el componente
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const cartTotal = cartItems.reduce((total, item) => {
    const price = parseFloat(item.Price) || 0;
    return total + (price * item.Quantity);
  }, 0);

  // Manejar éxito del pago
  const handlePaymentSuccess = async (details: any) => {
    try {
      console.log('✅ Pago exitoso iniciado:', details);
      setProcessingPayment(true);
      
      // Aquí puedes enviar los detalles del pago a tu backend
      // await savePaymentDetails(details);
      
      // Mostrar mensaje de éxito
      alert('¡Pago procesado exitosamente!');
      
      // Cerrar modal y resetear estados
      setShowPayPal(false);
      setProcessingPayment(false);
      onClose();
      
      // Disparar evento para actualizar el header
      window.dispatchEvent(new Event('cartUpdated'));
      
    } catch (error) {
      console.error('❌ Error procesando pago exitoso:', error);
      setProcessingPayment(false);
      alert('Hubo un error al procesar el pago. Por favor intenta nuevamente.');
    }
  };

  // Manejar error del pago
  const handlePaymentError = (error: any) => {
    console.error('❌ Error en el pago:', error);
    console.error('❌ Detalles del error:', JSON.stringify(error, null, 2));
    setProcessingPayment(false);
    
    // Mensaje más específico
    let errorMessage = 'Hubo un error al procesar el pago. Por favor intenta nuevamente.';
    
    if (error.message) {
      errorMessage = `Error: ${error.message}`;
    }
    
    alert(errorMessage);
  };

  // Mostrar/ocultar PayPal
  const togglePayPal = () => {
    setShowPayPal(!showPayPal);
  };

  const handleRemoveItem = async (num_cart_item: number) => {
    if (typeof window === 'undefined') return;
    
    try {
      // Obtener el userId del localStorage
      const savedUser = localStorage.getItem('user');
      if (!savedUser) {
        console.error('No hay usuario autenticado');
        return;
      }
      
      const user = JSON.parse(savedUser);
      const userId = user.id || user.userId;
      
      if (!userId) {
        console.error('No se encontró el ID del usuario');
        return;
      }
      
      // Hacer la petición DELETE al backend con num_cart_item en el body
      const response = await fetch(`http://177.7.42.180:3000/api/cart/items`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': userId.toString()
        },
        body: JSON.stringify({
          num_cart_item: num_cart_item
        })
      });
      
      if (!response.ok) {
        throw new Error(`Error al eliminar item: ${response.status}`);
      }
      
      // Recargar los items del carrito
      await fetchCartItems();
      
      // Disparar evento para actualizar el header
      window.dispatchEvent(new Event('cartUpdated'));
      
    } catch (error) {
      console.error('Error al eliminar item del carrito:', error);
    }
  };

  const handleUpdateQuantity = async (num_cart_item: number, newQuantity: number) => {
    if (typeof window === 'undefined') return;
    if (newQuantity < 1) return;
    
    try {
      // Obtener el userId del localStorage
      const savedUser = localStorage.getItem('user');
      if (!savedUser) {
        console.error('No hay usuario autenticado');
        return;
      }
      
      const user = JSON.parse(savedUser);
      const userId = user.id || user.userId;
      
      if (!userId) {
        console.error('No se encontró el ID del usuario');
        return;
      }
      
      // Hacer la petición PUT al backend usando num_cart_item
      const response = await fetch(`http://177.7.42.180:3000/api/cart/items`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': userId.toString()
        },
        body: JSON.stringify({
          num_cart_item: num_cart_item,
          quantity: newQuantity
        })
      });
      
      if (!response.ok) {
        throw new Error(`Error al actualizar cantidad: ${response.status}`);
      }
      
      // Recargar los items del carrito
      await fetchCartItems();
      
      // Disparar evento para actualizar el header
      window.dispatchEvent(new Event('cartUpdated'));
      
    } catch (error) {
      console.error('Error al actualizar cantidad del item:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-hidden">
        <h3 className="text-xl text-[#496B90] font-light tracking-wide mb-4 flex items-center justify-between">
          <span>Mi Carrito</span>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl leading-none"
          >
            ×
          </button>
        </h3>

        {/* Total y botones de acción arriba */}
        {cartItems.length > 0 && (
          <div className="border-b border-gray-200 pb-4 mb-4">
            <div className="flex justify-between items-center mb-4">
              <span className="text-lg font-semibold text-[#496B90]">Total:</span>
              <span className="text-lg font-bold text-[#496B90]">${cartTotal.toFixed(2)}</span>
            </div>
            {!showPayPal ? (
            <div className="flex justify-end gap-4">
              <button
                onClick={onClose}
                className="px-6 py-3 text-[#496B90] border border-[#496B90] rounded-lg hover:bg-[#496B90] hover:text-white transition-colors font-semibold shadow-md"
              >
                Seguir Comprando
              </button>
              <button
                onClick={togglePayPal}
                disabled={processingPayment}
                className="px-6 py-3 bg-[#496B90] text-white rounded-lg hover:bg-[#3A5270] transition-colors font-semibold shadow-md disabled:opacity-50"
              >
                {processingPayment ? 'Procesando...' : 'Proceder al Pago'}
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <button
                  onClick={togglePayPal}
                  disabled={processingPayment}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  ← Volver
                </button>
                <h4 className="text-lg font-semibold text-[#496B90]">Pagar con PayPal</h4>
                <div className="w-16"></div>
              </div>
              
              <div className="border-t border-gray-200 pt-4">
                <PayPalButton 
                  amount={cartTotal.toFixed(2)}
                  onSuccess={handlePaymentSuccess}
                  onError={handlePaymentError}
                />
              </div>
            </div>
          )}
          </div>
        )}

        {/* Contenido */}
        <div className="overflow-y-auto max-h-[calc(90vh-280px)] pb-4">
          {loading ? (
            <div className="text-center py-8">
              <p className="text-gray-500">Cargando carrito...</p>
            </div>
          ) : cartItems.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">Tu carrito está vacío</p>
            </div>
          ) : (
            <div>
              {cartItems.map((item) => (
                <div key={item.Num_product} className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg mb-4 last:mb-0">
                  {/* Imagen */}
                  {item.Image_url && (
                    <img 
                      src={item.Image_url} 
                      alt={item.Name_product}
                      className="w-20 h-20 object-cover rounded"
                    />
                  )}
                  
                  {/* Detalles */}
                  <div className="flex-1">
                    <h3 className="font-medium text-[#496B90]">{item.Name_product}</h3>
                    <p className="text-sm text-gray-600">Precio: ${item.Price}</p>
                    <p className="text-sm text-gray-600">Stock: {item.Stock}</p>
                  </div>

                  {/* Controles */}
                  <div className="flex items-center gap-3">
                    <div className="flex items-center border border-[#A2A09D]/30 rounded-lg">
                      <button
                        onClick={() => item.Num_cart_item && handleUpdateQuantity(item.Num_cart_item, item.Quantity - 1)}
                        className="px-4 py-2 bg-[#496B90] text-white hover:bg-[#3A5270] transition-colors font-medium"
                      >
                        -
                      </button>
                      <span className="px-4 py-2 text-center min-w-12 font-medium text-[#496B90] bg-gray-50">
                        {item.Quantity}
                      </span>
                      <button
                        onClick={() => item.Num_cart_item && handleUpdateQuantity(item.Num_cart_item, item.Quantity + 1)}
                        className="px-4 py-2 bg-[#496B90] text-white hover:bg-[#3A5270] transition-colors font-medium"
                      >
                        +
                      </button>
                    </div>
                    
                    <button
                      onClick={() => item.Num_cart_item && handleRemoveItem(item.Num_cart_item)}
                      className="px-4 py-2 bg-red-500 text-white hover:bg-red-600 rounded-lg transition-colors font-medium"
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CartModal;
