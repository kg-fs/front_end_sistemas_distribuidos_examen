// Archivo para debug de la API del carrito
// Ejecutar en la consola del navegador para diagnosticar problemas

async function debugCartAPI() {
  console.log('🔍 Iniciando debug de la API del carrito...');
  
  // 1. Probar con un ID de usuario específico
  const testUserId = 33416; // ID que mencionaste que se creó
  
  console.log('📋 Probando con ID de usuario:', testUserId);
  
  try {
    const response = await fetch('http://177.7.42.180:3000/api/cart/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': testUserId.toString()
      }
    });
    
    console.log('📡 Status de respuesta:', response.status);
    console.log('📡 Headers de respuesta:', [...response.headers.entries()]);
    
    const responseText = await response.text();
    console.log('📄 Respuesta completa:', responseText);
    
    if (response.ok) {
      console.log('✅ Carrito creado exitosamente');
      try {
        const responseData = JSON.parse(responseText);
        console.log('📊 Datos del carrito:', responseData);
      } catch (e) {
        console.log('⚠️ La respuesta no es JSON válido:', responseText);
      }
    } else {
      console.error('❌ Error al crear carrito');
      try {
        const errorData = JSON.parse(responseText);
        console.error('📄 Error details:', errorData);
      } catch (e) {
        console.error('⚠️ Error response no es JSON:', responseText);
      }
    }
    
  } catch (error) {
    console.error('❌ Error de conexión:', error);
  }
  
  // 2. Verificar si el endpoint existe con OPTIONS
  console.log('\n🔍 Verificando endpoint con OPTIONS...');
  try {
    const optionsResponse = await fetch('http://177.7.42.180:3000/api/cart/', {
      method: 'OPTIONS'
    });
    console.log('📡 OPTIONS Status:', optionsResponse.status);
    console.log('📡 OPTIONS Headers:', [...optionsResponse.headers.entries()]);
  } catch (error) {
    console.error('❌ Error en OPTIONS:', error);
  }
}

// Ejecutar debug
debugCartAPI();
