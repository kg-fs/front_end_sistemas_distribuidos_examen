import React, { useEffect } from 'react';

interface SessionManagerProps {
  children: React.ReactNode;
}

const SessionManager: React.FC<SessionManagerProps> = ({ children }) => {
  useEffect(() => {
    // Verificar si hay un usuario guardado en localStorage
    const savedUser = localStorage.getItem('user');
    
    if (savedUser) {
      try {
        const user = JSON.parse(savedUser);
        
        if (user.isLoggedIn) {
          // Verificar si la sesión ha expirado (24 horas)
          const loginTime = new Date(user.loginTimestamp);
          const now = new Date();
          const hoursDiff = (now.getTime() - loginTime.getTime()) / (1000 * 60 * 60);
          
          if (hoursDiff > 24) {
            // Sesión expirada, limpiar y redirigir
            console.log('Sesión expirada, limpiando datos');
            localStorage.removeItem('user');
            localStorage.removeItem('cartCount');
            localStorage.removeItem('token');
            localStorage.removeItem('adminData');
            localStorage.removeItem('clientData');
            return;
          }
          
          // Obtener la ruta actual
          const currentPath = window.location.pathname;
          
          // Redirigir según el rol del usuario si está en una página no autorizada
          const userRole = user.Num_rol;
          const roleNum = parseInt(userRole);
          
          console.log('Verificando sesión - Rol:', userRole, 'Ruta actual:', currentPath);
          
          // Si está en páginas de auth o landing, redirigir según rol
          if (currentPath === '/' || currentPath === '/auth') {
            if (roleNum === 1 || roleNum === 3 || userRole === 'Administrador' || userRole === 'Empleado') {
              console.log('Redirigiendo a admin-dashboard desde SessionManager');
              window.location.href = '/admin-dashboard';
            } else if (roleNum === 2 || userRole === 'Cliente') {
              console.log('Redirigiendo a dashboard desde SessionManager');
              window.location.href = '/dashboard';
            }
          }
          
          // Verificar si está en la página correcta según su rol
          if (roleNum === 1 || roleNum === 3 || userRole === 'Administrador' || userRole === 'Empleado') {
            // Admin no debería estar en páginas de cliente
            if (currentPath === '/dashboard') {
              console.log('Administrador en página de cliente, redirigiendo a admin-dashboard');
              window.location.href = '/admin-dashboard';
            }
          } else if (roleNum === 2 || userRole === 'Cliente') {
            // Cliente no debería estar en páginas de admin
            if (currentPath.startsWith('/admin') || currentPath === '/admin-dashboard') {
              console.log('Cliente en página de admin, redirigiendo a dashboard');
              window.location.href = '/dashboard';
            }
          }
        }
      } catch (error) {
        console.error('Error al parsear datos de usuario:', error);
        // Limpiar datos corruptos
        localStorage.removeItem('user');
      }
    }
  }, []);

  return <>{children}</>;
};

export default SessionManager;
