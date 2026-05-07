// Archivo de prueba para verificar la creación de carrito
// Este archivo simula el proceso de registro y creación de carrito

async function testUserRegistrationAndCartCreation() {
  console.log('🧪 Iniciando prueba de registro y creación de carrito...');
  
  try {
    // 1. Simular registro de usuario
    console.log('📝 Registrando usuario...');
    const registerResponse = await fetch('http://177.7.42.180:3000/api/users/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        Firs_name_user: 'Test',
        Last_name_user: 'User',
        Email: 'testuser' + Date.now() + '@floralia.com',
        Password_user: 'password123',
        Num_rol: 2,
        Num_cat_state: 1
      })
    });

    if (!registerResponse.ok) {
      const error = await registerResponse.json();
      console.error('❌ Error en registro:', error);
      return;
    }

    const userData = await registerResponse.json();
    console.log('✅ Usuario creado:', userData);
    
    // 2. Obtener ID del usuario
    const userId = userData.user?.Num_user || userData.Num_user || userData.id;
    
    if (!userId) {
      console.error('❌ No se pudo obtener el ID del usuario');
      return;
    }
    
    console.log('🆔 ID del usuario:', userId);
    
    // 3. Crear carrito
    console.log('🛒 Creando carrito...');
    const cartResponse = await fetch('http://177.7.42.180:3000/api/cart/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': userId.toString()
      }
    });

    if (!cartResponse.ok) {
      const cartError = await cartResponse.json();
      console.error('❌ Error al crear carrito:', cartError);
      return;
    }

    const cartData = await cartResponse.json();
    console.log('✅ Carrito creado exitosamente:', cartData);
    console.log('🎉 Prueba completada exitosamente!');
    
  } catch (error) {
    console.error('❌ Error en la prueba:', error);
  }
}

// Ejecutar prueba
testUserRegistrationAndCartCreation();
