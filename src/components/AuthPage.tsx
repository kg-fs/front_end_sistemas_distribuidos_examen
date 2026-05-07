import React, { useState, useEffect } from 'react';

const AuthPage: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    emailPrefix: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    // Verificar si ya está logueado (basado en datos del usuario)
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      const user = JSON.parse(savedUser);
      if (user.isLoggedIn) {
        // Redirigir según el rol del usuario ya logueado
        const userRole = user.Num_rol || user.role;
        const roleNum = parseInt(userRole);
        
        console.log('Usuario logueado detectado, rol:', userRole, 'roleNum:', roleNum);
        
        if (roleNum === 1 || roleNum === 3 || userRole === 'Administrador' || userRole === 'Empleado') {
          console.log('Redirigiendo a admin-dashboard');
          window.location.href = '/admin-dashboard';
        } else if (roleNum === 2 || userRole === 'Cliente') {
          console.log('Redirigiendo a dashboard');
          window.location.href = '/dashboard';
        } else {
          console.log('Rol no reconocido, permaneciendo en auth');
          // No redirigir, dejar al usuario en la página de auth
        }
      }
    }
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch('http://177.7.42.180:3000/api/users/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password
        })
      });

      if (response.ok) {
        // Obtener datos del usuario
        const userData = await response.json();
        
        // Mostrar Num_rol por consola
        console.log('DATOS COMPLETOS DEL USUARIO:', userData);
        console.log('NUM_ROL DEL USUARIO:', userData.user.Num_rol);
        console.log('EMAIL DEL USUARIO:', formData.email);
        
        // Guardar datos completos del usuario en localStorage
        const userDataToStore = {
          id: userData.user.Num_user,
          email: formData.email,
          Num_rol: userData.user.Num_rol,
          Firs_name_user: userData.user.Firs_name_user,
          Last_name_user: userData.user.Last_name_user,
          isLoggedIn: true,
          loginTimestamp: new Date().toISOString()
        };
        
        localStorage.setItem('user', JSON.stringify(userDataToStore));
        console.log('Usuario guardado en localStorage:', userDataToStore);

        setSuccess('¡Inicio de sesión exitoso!');
        
        // Redirigir según Num_rol
        setTimeout(() => {
          const userNumRol = userData.user.Num_rol;
          
          if (userNumRol === 1 || userNumRol === 3) {
            console.log('Redirigiendo a admin-dashboard (Num_rol = ' + userNumRol + ')');
            window.location.href = '/admin-dashboard';
          } else if (userNumRol === 2) {
            console.log('Redirigiendo a dashboard de cliente (Num_rol = ' + userNumRol + ')');
            window.location.href = '/dashboard';
          } else {
            console.log('Num_rol no reconocido, yendo a home (Num_rol = ' + userNumRol + ')');
            window.location.href = '/';
          }
        }, 1500);
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Error al iniciar sesión');
      }
    } catch (err) {
      setError('Error de conexión. Inténtalo nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    if (formData.password !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('http://177.7.42.180:3000/api/users/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          Firs_name_user: formData.firstName,
          Last_name_user: formData.lastName,
          Email: formData.emailPrefix + '@floralia.com',
          Password_user: formData.password,
          Num_rol: 2,
          Num_cat_state: 1
        })
      });

      if (response.ok) {
        const userData = await response.json();
        console.log('Usuario creado:', userData);
        
        // Obtener el ID del usuario creado
        const userId = userData.insertId || userData.user?.Num_user || userData.Num_user || userData.id;
        
        if (!userId) {
          console.error('No se pudo obtener el ID del usuario:', userData);
          setError('Error al obtener ID del usuario creado');
          setLoading(false);
          return;
        }

        console.log('ID del usuario creado:', userId);
        
        // Crear carrito para el usuario
        try {
          console.log('🛒 Iniciando creación de carrito para usuario ID:', userId);
          console.log('📡 Enviando request a: http://177.7.42.180:3000/api/cart/');
          console.log('📋 Headers: Content-Type: application/json, x-user-id:', userId);
          
          const cartResponse = await fetch('http://177.7.42.180:3000/api/cart/', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-user-id': userId.toString()
            }
          });

          console.log('📡 Response status:', cartResponse.status);
          console.log('📡 Response headers:', [...cartResponse.headers.entries()]);
          
          const responseText = await cartResponse.text();
          console.log('📄 Response body:', responseText);

          if (cartResponse.ok) {
            console.log('✅ Carrito creado exitosamente para el usuario:', userId);
            try {
              const cartData = JSON.parse(responseText);
              console.log('📊 Datos del carrito:', cartData);
            } catch (e) {
              console.log('⚠️ Response no es JSON válido:', responseText);
            }
            setSuccess('¡Cuenta y carrito creados exitosamente! Redirigiendo al login...');
          } else {
            console.error('❌ Error al crear carrito. Status:', cartResponse.status);
            try {
              const cartError = JSON.parse(responseText);
              console.error('📄 Error details:', cartError);
              setError(`Error al crear carrito: ${cartError.message || 'Error desconocido'}`);
            } catch (e) {
              console.error('⚠️ Error response no es JSON:', responseText);
              setError(`Error al crear carrito: ${responseText}`);
            }
            setSuccess('¡Cuenta creada! (Error al crear carrito, pero puedes continuar) Redirigiendo al login...');
          }
        } catch (cartError) {
          console.error('❌ Error de conexión al crear carrito:', cartError);
          const errorMessage = cartError instanceof Error ? cartError.message : 'Error desconocido';
          setError(`Error de conexión al crear carrito: ${errorMessage}`);
          setSuccess('¡Cuenta creada! (Error al crear carrito, pero puedes continuar) Redirigiendo al login...');
        }

        setTimeout(() => {
          setIsLogin(true);
          setFormData({ firstName: '', lastName: '', emailPrefix: '', email: '', password: '', confirmPassword: '' });
        }, 2000);
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Error al crear cuenta');
      }
    } catch (err) {
      setError('Error de conexión. Inténtalo nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F8F8] flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-light text-[#496B90] mb-2">Floralia</h1>
          <p className="text-sm text-[#A2A09D] tracking-wider uppercase">flores y arreglos</p>
        </div>

        <div className="bg-white rounded-lg border border-[#A2A09D]/20 p-8">
          <div className="flex justify-center mb-8">
            <button
              onClick={() => {
                setIsLogin(true);
                setError('');
                setSuccess('');
              }}
              className={`px-6 py-2 text-sm font-medium transition-colors ${
                isLogin 
                  ? 'text-[#496B90] border-b-2 border-[#496B90]' 
                  : 'text-[#A2A09D] hover:text-[#496B90]'
              }`}
            >
              Iniciar Sesión
            </button>
            <button
              onClick={() => {
                setIsLogin(false);
                setError('');
                setSuccess('');
              }}
              className={`px-6 py-2 text-sm font-medium transition-colors ${
                !isLogin 
                  ? 'text-[#496B90] border-b-2 border-[#496B90]' 
                  : 'text-[#A2A09D] hover:text-[#496B90]'
              }`}
            >
              Crear Cuenta
            </button>
          </div>

          {error && (
            <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-600 text-sm text-center">{error}</p>
            </div>
          )}

          {success && (
            <div className="mb-6 p-3 bg-green-50 border border-green-200 rounded-md">
              <p className="text-green-600 text-sm text-center">{success}</p>
            </div>
          )}

          {isLogin ? (
            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-[#496B90] mb-2">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email || ''}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full px-4 py-2 border border-[#A2A09D]/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#496B90] focus:border-transparent"
                  placeholder="tu@floralia.com"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-[#496B90] mb-2">
                  Contraseña
                </label>
                <input
                  type="password"
                  name="password"
                  required
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-[#A2A09D]/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#496B90] focus:border-transparent"
                  placeholder="••••••••"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#496B90] text-white py-3 rounded-lg font-medium hover:bg-[#3A5270] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleRegister} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-[#496B90] mb-2">
                  Primer Nombre
                </label>
                <input
                  type="text"
                  name="firstName"
                  required
                  value={formData.firstName}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-[#A2A09D]/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#496B90] focus:border-transparent"
                  placeholder="Tu primer nombre"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#496B90] mb-2">
                  Apellido
                </label>
                <input
                  type="text"
                  name="lastName"
                  required
                  value={formData.lastName}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-[#A2A09D]/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#496B90] focus:border-transparent"
                  placeholder="Tu apellido"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#496B90] mb-2">
                  Email
                </label>
                <div className="flex">
                  <input
                    type="text"
                    name="emailPrefix"
                    required
                    value={formData.emailPrefix}
                    onChange={handleInputChange}
                    className="flex-1 px-4 py-2 border border-[#A2A09D]/30 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-[#496B90] focus:border-transparent"
                    placeholder="usuario"
                  />
                  <div className="px-3 py-2 bg-[#F8F8F8] border border-l-0 border-[#A2A09D]/30 rounded-r-lg flex items-center text-[#A2A09D] text-sm">
                    @floralia.com
                  </div>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-[#496B90] mb-2">
                  Contraseña
                </label>
                <input
                  type="password"
                  name="password"
                  required
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-[#A2A09D]/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#496B90] focus:border-transparent"
                  placeholder="••••••••"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#496B90] mb-2">
                  Confirmar Contraseña
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  required
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-[#A2A09D]/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#496B90] focus:border-transparent"
                  placeholder="••••••••"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#496B90] text-white py-3 rounded-lg font-medium hover:bg-[#3A5270] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Creando cuenta...' : 'Crear Cuenta'}
              </button>
            </form>
          )}

          <div className="mt-6 text-center">
            <a href="/" className="text-[#A2A09D] hover:text-[#496B90] text-sm transition-colors">
              ← Volver al inicio
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
