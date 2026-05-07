import React, { useState, useEffect } from 'react';

interface User {
  Num_user: number;
  Firs_name_user: string;
  Last_name_user: string;
  Email: string;
  Num_rol: number;
  Num_cat_state: number;
  created_at: string;
}

const AdminUsers: React.FC = () => {
  console.log('AdminUsers montado');
  
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    Firs_name_user: '',
    Last_name_user: '',
    Email: '',
    Password_user: '',
    Num_rol: 2,
    Num_cat_state: 1
  });
  const [formError, setFormError] = useState('');
  const [formLoading, setFormLoading] = useState(false);

  useEffect(() => {
    console.log('AdminUsers useEffect llamado');
    fetchUsers();
  }, []);

  // Prevenir doble scroll cuando se abre/cierra la modal
  useEffect(() => {
    if (isModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    
    // Limpiar cuando se desmonta el componente
    return () => {
      document.body.style.overflow = '';
    };
  }, [isModalOpen]);

  const fetchUsers = async () => {
    try {
      console.log('Iniciando fetchUsers');
      setLoading(true);
      setError('');

      const response = await fetch('http://177.7.42.180:3000/api/users/', {
        method: 'GET'
      });
      
      console.log('Response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Datos recibidos:', data);
        console.log('Tipo de datos:', typeof data);
        console.log('¿Es array?:', Array.isArray(data));
        console.log('Longitud:', Array.isArray(data) ? data.length : 'No es array');
        
        // Intentar diferentes estructuras posibles
        let usersArray = [];
        if (Array.isArray(data)) {
          usersArray = data;
        } else if (data && data.users && Array.isArray(data.users)) {
          usersArray = data.users;
        } else if (data && data.data && Array.isArray(data.data)) {
          usersArray = data.data;
        }
        
        console.log('Array final de usuarios:', usersArray);
        setUsers(usersArray);
      } else {
        console.log('Error en response:', response.statusText);
        setError('Error al cargar los usuarios');
      }
    } catch (err) {
      console.log('Error en fetchUsers:', err);
      setError('Error de conexión al cargar usuarios');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      setSearchError('Por favor ingrese un ID de usuario');
      return;
    }

    try {
      setLoading(true);
      setSearchError('');
      
      const searchValue = searchTerm.trim();
      const isNumericSearch = !isNaN(Number(searchValue)) && searchValue !== '';
      
      if (!isNumericSearch) {
        setSearchError('Por favor ingrese solo números para buscar por ID de usuario');
        return;
      }

      // Buscar por ID de usuario
      const response = await fetch('http://177.7.42.180:3000/api/users/profile', {
        method: 'GET',
        headers: {
          'x-user-id': searchValue
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data) {
          setUsers([data.data]);
          setIsSearching(true);
        } else {
          setSearchError('Usuario no encontrado');
          setUsers([]);
        }
      } else {
        setSearchError('Error al buscar el usuario');
        setUsers([]);
      }
    } catch (err) {
      console.error('Error en búsqueda:', err);
      setSearchError('Error de conexión al buscar');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const clearSearch = () => {
    setSearchTerm('');
    setIsSearching(false);
    setSearchError('');
    fetchUsers();
  };

  const openModal = () => setIsModalOpen(true);
  
  const closeModal = () => {
    setIsModalOpen(false);
    setFormError('');
    setFormData({
      Firs_name_user: '',
      Last_name_user: '',
      Email: '',
      Password_user: '',
      Num_rol: 2,
      Num_cat_state: 1
    });
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validar formulario
    if (!formData.Firs_name_user.trim() || !formData.Last_name_user.trim() || 
        !formData.Email.trim() || !formData.Password_user.trim()) {
      setFormError('Todos los campos son obligatorios');
      return;
    }

    // Validar email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.Email)) {
      setFormError('Por favor ingrese un email válido');
      return;
    }

    try {
      setFormLoading(true);
      setFormError('');

      const response = await fetch('http://177.7.42.180:3000/api/users/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Usuario creado:', result);
        closeModal();
        fetchUsers(); // Recargar la lista de usuarios
      } else {
        const errorData = await response.json();
        setFormError(errorData.message || 'Error al crear el usuario');
      }
    } catch (err) {
      console.error('Error al crear usuario:', err);
      setFormError('Error de conexión al crear usuario');
    } finally {
      setFormLoading(false);
    }
  };

  const getRolName = (numRol: number): string => {
    switch (numRol) {
      case 1: return 'Administrador';
      case 2: return 'Cliente';
      case 3: return 'Empleado';
      default: return 'Desconocido';
    }
  };

  const getStateName = (numState: number): string => {
    switch (numState) {
      case 1: return 'Activo';
      case 2: return 'Inactivo';
      case 3: return 'Suspendido';
      default: return 'Desconocido';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="text-[#A2A09D]">Cargando usuarios...</div>
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
          Gestión de Usuarios
        </h2>
        <div className="flex gap-3 items-center">
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Buscar por ID de usuario..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              className="px-3 py-2 border border-[#A2A09D]/20 rounded-md focus:outline-none focus:ring-2 focus:ring-[#496B90] text-sm"
            />
            <button
              onClick={handleSearch}
              disabled={loading}
              className="bg-[#496B90] text-white border-0 py-2 px-4 text-sm font-medium cursor-pointer transition-all duration-200 hover:bg-[#3a5a7a] disabled:opacity-50"
            >
              {loading ? 'Buscando...' : 'Buscar'}
            </button>
            {isSearching && (
              <button
                onClick={clearSearch}
                className="text-[#A2A09D] hover:text-[#496B90] text-sm font-medium transition-colors"
              >
                Limpiar
              </button>
            )}
          </div>
          <button
            onClick={() => fetchUsers()}
            className="bg-[#496B90] text-white border-0 py-2 px-6 text-sm font-medium cursor-pointer transition-all duration-200 hover:bg-[#3a5a7a]"
          >
            Actualizar
          </button>
          <button
            onClick={openModal}
            className="bg-[#5cb85c] text-white border-0 py-2 px-6 text-sm font-medium cursor-pointer transition-all duration-200 hover:bg-[#4cae4c]"
          >
            Crear Usuario
          </button>
        </div>
      </div>
      
      {isSearching && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
          <p className="text-sm text-blue-800">
            Mostrando resultados para: <strong>{searchTerm}</strong>
          </p>
        </div>
      )}
      
      {searchError && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-800">
            {searchError}
          </p>
        </div>
      )}
      
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-[#A2A09D]/20">
              <th className="text-left py-3 px-4 text-[#496B90] font-medium">ID Usuario</th>
              <th className="text-left py-3 px-4 text-[#496B90] font-medium">Nombre</th>
              <th className="text-left py-3 px-4 text-[#496B90] font-medium">Apellido</th>
              <th className="text-left py-3 px-4 text-[#496B90] font-medium">Email</th>
              <th className="text-left py-3 px-4 text-[#496B90] font-medium">Rol</th>
              <th className="text-left py-3 px-4 text-[#496B90] font-medium">Estado</th>
              <th className="text-left py-3 px-4 text-[#496B90] font-medium">Fecha Creación</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.Num_user} className="border-b border-[#A2A09D]/10 hover:bg-[#F8F8F8]">
                <td className="py-3 px-4 text-[#496B90]">{user.Num_user}</td>
                <td className="py-3 px-4 text-[#496B90]">{user.Firs_name_user}</td>
                <td className="py-3 px-4 text-[#496B90]">{user.Last_name_user}</td>
                <td className="py-3 px-4 text-[#A2A09D] text-sm">{user.Email}</td>
                <td className="py-3 px-4">
                  <span className={`px-2 py-1 rounded text-xs ${
                    user.Num_rol === 1 
                      ? 'bg-purple-100 text-purple-800' 
                      : user.Num_rol === 2
                      ? 'bg-blue-100 text-blue-800'
                      : user.Num_rol === 3
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {getRolName(user.Num_rol)}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <span className={`px-2 py-1 rounded text-xs ${
                    user.Num_cat_state === 1 
                      ? 'bg-green-100 text-green-800' 
                      : user.Num_cat_state === 2
                      ? 'bg-red-100 text-red-800'
                      : user.Num_cat_state === 3
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {getStateName(user.Num_cat_state)}
                  </span>
                </td>
                <td className="py-3 px-4 text-[#A2A09D] text-sm">
                  {new Date(user.created_at).toLocaleDateString('es-ES', {
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
        
        {users.length === 0 && (
          <div className="text-center py-8 text-[#A2A09D]">
            No hay usuarios disponibles
          </div>
        )}
      </div>
      
      {/* Modal para crear usuario */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-xl text-[#496B90] font-light tracking-wide mb-4">
              Crear Nuevo Usuario
            </h3>
            
            <form onSubmit={handleCreateUser}>
              {formError && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-sm text-red-800">{formError}</p>
                </div>
              )}
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[#496B90] mb-1">
                    Nombre
                  </label>
                  <input
                    type="text"
                    value={formData.Firs_name_user}
                    onChange={(e) => setFormData({...formData, Firs_name_user: e.target.value})}
                    className="w-full px-3 py-2 border border-[#A2A09D]/20 rounded-md focus:outline-none focus:ring-2 focus:ring-[#496B90]"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-[#496B90] mb-1">
                    Apellido
                  </label>
                  <input
                    type="text"
                    value={formData.Last_name_user}
                    onChange={(e) => setFormData({...formData, Last_name_user: e.target.value})}
                    className="w-full px-3 py-2 border border-[#A2A09D]/20 rounded-md focus:outline-none focus:ring-2 focus:ring-[#496B90]"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-[#496B90] mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={formData.Email}
                    onChange={(e) => setFormData({...formData, Email: e.target.value})}
                    className="w-full px-3 py-2 border border-[#A2A09D]/20 rounded-md focus:outline-none focus:ring-2 focus:ring-[#496B90]"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-[#496B90] mb-1">
                    Contraseña
                  </label>
                  <input
                    type="password"
                    value={formData.Password_user}
                    onChange={(e) => setFormData({...formData, Password_user: e.target.value})}
                    className="w-full px-3 py-2 border border-[#A2A09D]/20 rounded-md focus:outline-none focus:ring-2 focus:ring-[#496B90]"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-[#496B90] mb-1">
                    Rol
                  </label>
                  <select
                    value={formData.Num_rol}
                    onChange={(e) => setFormData({...formData, Num_rol: parseInt(e.target.value)})}
                    className="w-full px-3 py-2 border border-[#A2A09D]/20 rounded-md focus:outline-none focus:ring-2 focus:ring-[#496B90]"
                  >
                    <option value={1}>Administrador</option>
                    <option value={2}>Cliente</option>
                    <option value={3}>Empleado</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-[#496B90] mb-1">
                    Estado
                  </label>
                  <select
                    value={formData.Num_cat_state}
                    onChange={(e) => setFormData({...formData, Num_cat_state: parseInt(e.target.value)})}
                    className="w-full px-3 py-2 border border-[#A2A09D]/20 rounded-md focus:outline-none focus:ring-2 focus:ring-[#496B90]"
                  >
                    <option value={1}>Activo</option>
                    <option value={2}>Inactivo</option>
                    <option value={3}>Suspendido</option>
                  </select>
                </div>
              </div>
              
              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={formLoading}
                  className="px-4 py-2 text-[#496B90] border border-[#496B90] rounded-md hover:bg-[#496B90] hover:text-white transition-colors disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={formLoading}
                  className="px-4 py-2 bg-[#5cb85c] text-white rounded-md hover:bg-[#4cae4c] transition-colors disabled:opacity-50"
                >
                  {formLoading ? 'Creando...' : 'Crear Usuario'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;
