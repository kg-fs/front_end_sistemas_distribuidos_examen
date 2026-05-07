import React, { useEffect, useState } from 'react';

interface PayPalButtonProps {
  amount: string;
  onSuccess: (details: any) => void;
  onError: (error: any) => void;
}

declare global {
  interface Window {
    paypal: any;
  }
}

const PayPalButton: React.FC<PayPalButtonProps> = ({ amount, onSuccess, onError }) => {
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);
  const [buttonRendered, setButtonRendered] = useState(false);
  const [pickupDate, setPickupDate] = useState('');
  const [pickupTime, setPickupTime] = useState('');
  const [isProcessingPickup, setIsProcessingPickup] = useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Cargar el SDK de PayPal solo una vez globalmente
    if (!window.paypal) {
      const script = document.createElement('script');
      script.src = 'https://www.paypal.com/sdk/js?client-id=ARCGmHN4RX5Ek2d3tPuZFv6Sh9yGDd8q9f-HD9c5tS5vCt0D-tlHzZkoJGDNVje0W-OJxNPf9OtQ7iQz&currency=USD';
      script.async = true;
      script.onload = () => setIsScriptLoaded(true);
      script.onerror = () => {
        console.error('Error al cargar el SDK de PayPal');
        onError(new Error('No se pudo cargar el SDK de PayPal'));
      };
      document.body.appendChild(script);
    } else {
      setIsScriptLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (isScriptLoaded && window.paypal && !buttonRendered && containerRef.current && pickupDate && pickupTime) {
      console.log('✅ Intentando renderizar botón PayPal');
      
      // Limpiar el contenedor antes de renderizar
      containerRef.current.innerHTML = '';
      
      try {
        // Renderizar el botón de PayPal - versión simplificada
        window.paypal.Buttons({
          // Usar el flujo más simple sin captura manual
          createOrder: (data: any, actions: any) => {
            console.log('✅ Creando orden PayPal con monto:', amount);
            return actions.order.create({
              purchase_units: [{
                amount: {
                  value: amount,
                  currency_code: 'USD'
                }
              }]
            });
          },
          onApprove: async (data: any) => {
            console.log('✅ Pago aprobado:', data);
            try {
              // Obtener datos del usuario desde localStorage
              const savedUser = localStorage.getItem('user');
              if (!savedUser) {
                throw new Error('Usuario no encontrado en localStorage');
              }
              
              const user = JSON.parse(savedUser);
              const userId = user.id;
              
              console.log('👤 Usuario ID:', userId);
              console.log('💰 Monto del pago:', amount);
              console.log('📋 OrderID PayPal:', data.orderID);

              // 1. PRIMERO: Actualizar el stock de los productos ANTES del checkout
              console.log('🔄 Paso 1: Actualizando stock de productos...');
              try {
                console.log('🛒 Obteniendo items del carrito para usuario:', userId);
                
                let cartItems = [];
                try {
                  const cartResponse = await fetch('http://177.7.42.180:3000/api/cart/items', {
                    method: 'GET',
                    headers: {
                      'Content-Type': 'application/json',
                      'x-user-id': userId.toString()
                    }
                  });
                  
                  if (cartResponse.ok) {
                    const cartResult = await cartResponse.json();
                    cartItems = cartResult.items || [];
                    console.log(`📦 Encontrados ${cartItems.length} items en el carrito`);
                    
                    // Si no hay items, usar datos de ejemplo
                    if (cartItems.length === 0) {
                      console.warn('⚠️ No hay items en el carrito, usando datos de ejemplo para prueba');
                      cartItems = [
                        {
                          Num_product: 91897,
                          Quantity: 1,
                          Name_product: "Caja de Flores Variadas"
                        }
                      ];
                    }
                  } else {
                    console.warn('⚠️ No se pudieron obtener items del carrito, usando datos de ejemplo');
                    cartItems = [
                      {
                        Num_product: 91897,
                        Quantity: 1,
                        Name_product: "Caja de Flores Variadas"
                      }
                    ];
                  }
                } catch (cartError) {
                  console.warn('⚠️ Error obteniendo carrito, usando datos de ejemplo:', cartError);
                  cartItems = [
                    {
                      Num_product: 91897,
                      Quantity: 1,
                      Name_product: "Caja de Flores Variadas"
                    }
                  ];
                }
                
                // Actualizar stock para cada item
                for (const item of cartItems) {
                  console.log(`📦 Ajustando stock para producto ${item.Num_product}, cantidad: ${item.Quantity}`);
                  
                  const adjustResponse = await fetch('http://177.7.42.180:3000/api/products/stock', {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                      'x-product-id': item.Num_product.toString()
                    },
                    body: JSON.stringify({
                      cantidad: item.Quantity,
                      tipo: 2 // tipo 2 = restar stock
                    })
                  });

                  console.log('📡 Adjust response status:', adjustResponse.status);
                  
                  if (adjustResponse.ok) {
                    const adjustData = await adjustResponse.json();
                    console.log(`✅ Stock ajustado para producto ${item.Num_product}:`, adjustData);
                  } else {
                    const errorText = await adjustResponse.text();
                    console.error(`❌ Error ajustando stock para producto ${item.Num_product}:`, errorText);
                  }
                }
              } catch (error) {
                console.error('❌ Error actualizando stock:', error);
                // No detener el flujo si hay error en stock
              }

              // 2. Ejecutar el checkout
              console.log('🔄 Paso 2: Ejecutando endpoint de checkout...');
              
              const checkoutResponse = await fetch('http://177.7.42.180:3000/api/orders/checkout', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'x-user-id': userId.toString()
                },
                body: JSON.stringify({
                  user_id: userId
                })
              });

              if (!checkoutResponse.ok) {
                const errorText = await checkoutResponse.text();
                console.error('❌ Error en endpoint checkout:', errorText);
                throw new Error(`Error en endpoint de checkout: ${checkoutResponse.status}`);
              }

              const checkoutData = await checkoutResponse.json();
              console.log('✅ Checkout procesado:', checkoutData);
              
              const numOrder = checkoutData.order?.Num_order || checkoutData.Num_order;
              if (!numOrder) {
                throw new Error('No se pudo obtener el Num_order del checkout');
              }
              
              console.log('📋 Num_order obtenido:', numOrder);

              // 3. Ejecutar el payment
              console.log('🔄 Paso 3: Ejecutando endpoint de payments/create...');
              
              const paymentResponse = await fetch('http://177.7.42.180:3000/api/payments/create', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                  Num_order: numOrder,
                  Payment_method: 'PayPal',
                  Amount: 100,
                  Status: 'completado'
                })
              });

              if (!paymentResponse.ok) {
                const errorText = await paymentResponse.text();
                console.error('❌ Error en endpoint payments:', errorText);
                throw new Error(`Error en endpoint de payments: ${paymentResponse.status}`);
              }

              const paymentData = await paymentResponse.json();
              console.log('✅ Payment procesado:', paymentData);

              // 4. Verificar pickup y ejecutar pickup/create
              console.log('🔍 Verificando campos de pickup:');
              console.log('  - pickupDate:', pickupDate);
              console.log('  - pickupTime:', pickupTime);
              
              if (!pickupDate || !pickupTime) {
                throw new Error('Por favor, ingresa la fecha y hora de entrega antes de continuar.');
              }

              const pickupResponse = await fetch('http://177.7.42.180:3000/api/pickup/create', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                  Num_order: numOrder,
                  Pickup_date: pickupDate,
                  Pickup_time: pickupTime + ':00',
                  Status: 'pendiente'
                })
              });

              if (!pickupResponse.ok) {
                const errorText = await pickupResponse.text();
                console.error('❌ Error en endpoint pickup:', errorText);
                throw new Error(`Error en endpoint de pickup: ${pickupResponse.status}`);
              }

              const pickupData = await pickupResponse.json();
              console.log('✅ Pickup creado:', pickupData);

              // 5. Notificar éxito completo
              const details = {
                orderID: data.orderID,
                status: 'APPROVED',
                purchase_units: [{
                  amount: {
                    value: amount
                  }
                }],
                checkoutData: checkoutData,
                paymentData: paymentData,
                pickupData: pickupData
              };
              
              console.log('✅ Proceso completo exitoso:', details);
              onSuccess(details);

              // Limpiar los campos de pickup
              setPickupDate('');
              setPickupTime('');

            } catch (error) {
              console.error('❌ Error procesando pago y checkout:', error);
              onError(error);
            }
          },
          onError: (err: any) => {
            console.error('❌ Error en PayPal:', err);
            console.error('❌ Detalles del error PayPal:', JSON.stringify(err, null, 2));
            onError(err);
          },
          onCancel: (data: any) => {
            console.log('❌ Pago cancelado:', data);
            onError(new Error('Pago cancelado por el usuario'));
          }
        }).render(containerRef.current);
        
        setButtonRendered(true);
        console.log('✅ Botón PayPal renderizado exitosamente');
      } catch (error) {
        console.error('❌ Error al renderizar botón PayPal:', error);
        onError(error);
      }
    }
  }, [isScriptLoaded, amount, onSuccess, onError, buttonRendered, pickupDate, pickupTime]);

  // Resetear el botón de PayPal cuando los campos de pickup cambian
  useEffect(() => {
    if (buttonRendered && (!pickupDate || !pickupTime)) {
      console.log('🔄 Resetando botón PayPal por cambios en pickup');
      setButtonRendered(false);
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
    }
  }, [pickupDate, pickupTime, buttonRendered]);

  return (
    <div className="space-y-4">
      {/* Campos de fecha y hora de entrega */}
      <div className="bg-white rounded-lg border border-[#A2A09D]/20 p-4">
        <h3 className="text-lg font-medium text-[#496B90] mb-4">
          Programar Entrega
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-[#496B90] mb-2">
              Fecha de Entrega
            </label>
            <input
              type="date"
              required
              value={pickupDate}
              onChange={(e) => {
                console.log('📅 Fecha seleccionada:', e.target.value);
                setPickupDate(e.target.value);
              }}
              className="w-full px-4 py-2 border border-[#A2A09D]/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#496B90] focus:border-transparent"
              min={new Date().toISOString().split('T')[0]} // Solo fechas futuras
              disabled={isProcessingPickup}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#496B90] mb-2">
              Hora de Entrega
            </label>
            <input
              type="time"
              required
              value={pickupTime}
              onChange={(e) => {
                console.log('⏰ Hora seleccionada:', e.target.value);
                setPickupTime(e.target.value);
              }}
              className="w-full px-4 py-2 border border-[#A2A09D]/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#496B90] focus:border-transparent"
              min="09:00"
              max="18:00"
              disabled={isProcessingPickup}
            />
            <p className="text-xs text-[#A2A09D] mt-1">
              Horario de atención: 9:00 AM - 6:00 PM
            </p>
          </div>
        </div>
      </div>

      {/* Botón de PayPal */}
      <div ref={containerRef}>
        {!isScriptLoaded ? (
          <div className="text-center py-4">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#496B90]"></div>
            <p className="text-gray-600 mt-2">Cargando PayPal...</p>
          </div>
        ) : !pickupDate || !pickupTime ? (
          <div className="text-center py-8 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="text-yellow-600 mb-2">
              <svg className="w-8 h-8 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-yellow-700 font-medium">Por favor, selecciona fecha y hora de entrega</p>
            <p className="text-yellow-600 text-sm mt-1">El botón de PayPal aparecerá cuando completes los campos</p>
          </div>
        ) : null}
      </div>

      {/* Mensaje de procesamiento */}
      {isProcessingPickup && (
        <div className="text-center py-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mr-2"></div>
          <span className="text-blue-600">Procesando entrega...</span>
        </div>
      )}
    </div>
  );
};

export default PayPalButton;
