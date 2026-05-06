import React, { useState, useEffect } from 'react';

interface Pickup {
  Num_pickup: number;
  Num_order: number;
  Pickup_date: string;
  Pickup_time: string;
  Status: string;
  created_at: string;
  order_total: string;
  order_status: string;
  user_name: string;
  user_email: string;
  Num_user: number;
}

const AdminPickups: React.FC = () => {
  console.log('AdminPickups montado');
  
  const [pickups, setPickups] = useState<Pickup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState('');

  useEffect(() => {
    console.log('AdminPickups useEffect llamado');
    fetchPickups();
  }, []);

  const fetchPickups = async (userId: string | null = null, orderId: string | null = null) => {
    try {
      console.log('Iniciando fetchPickups');
      setLoading(true);
      setError('');

      let url = 'http://177.7.42.180:3000/api/pickup/';
      const headers: HeadersInit = {};

      if (userId) {
        url = 'http://177.7.42.180:3000/api/pickup/user';
        headers['x-user-id'] = userId;
      } else if (orderId) {
        url = 'http://177.7.42.180:3000/api/pickup/order';
        headers['x-order-id'] = orderId;
      }

      const response = await fetch(url, {
        method: 'GET',
        headers: headers
      });
      
      console.log('Response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Datos recibidos:', data);
        console.log('Array de pickups:', data.pickups);
        setPickups(data.pickups || []);
      } else {
        console.log('Error en response:', response.statusText);
        setError('Error al cargar las órdenes de entrega');
      }
    } catch (err) {
      console.log('Error en fetchPickups:', err);
      setError('Error de conexión al cargar órdenes de entrega');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      setSearchError('Por favor ingrese un ID de usuario, ID de orden o estado');
      return;
    }

    try {
      setLoading(true);
      setSearchError('');
      
      const searchValue = searchTerm.trim();
      const isNumericSearch = !isNaN(Number(searchValue)) && searchValue !== '';
      
      let response;
      if (isNumericSearch) {
        // Si es numérico, primero intentar buscar por ID de orden
        response = await fetch('http://177.7.42.180:3000/api/pickup/order', {
          method: 'GET',
          headers: {
            'x-order-id': searchValue
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.pickups && data.pickups.length > 0) {
            setPickups(data.pickups);
            setIsSearching(true);
          } else {
            // Si no se encuentra por orden, intentar por ID de usuario
            const userResponse = await fetch('http://177.7.42.180:3000/api/pickup/user', {
              method: 'GET',
              headers: {
                'x-user-id': searchValue
              }
            });
            
            if (userResponse.ok) {
              const userData = await userResponse.json();
              setPickups(userData.pickups || []);
              setIsSearching(true);
            } else {
              setSearchError('No se encontraron resultados para este ID');
              setPickups([]);
            }
          }
        } else {
          setSearchError('Error al buscar por ID de orden');
          setPickups([]);
        }
      } else {
        // Si es texto, buscar por estado (filtrar localmente)
        const allResponse = await fetch('http://177.7.42.180:3000/api/pickup/');
        
        if (allResponse.ok) {
          const allData = await allResponse.json();
          const filteredPickups = allData.pickups.filter((pickup: Pickup) => 
            pickup.Status && pickup.Status.toLowerCase().includes(searchValue.toLowerCase())
          );
          
          if (filteredPickups.length > 0) {
            setPickups(filteredPickups);
            setIsSearching(true);
          } else {
            setSearchError(`No se encontraron entregas con estado "${searchValue}"`);
            setPickups([]);
          }
        } else {
          setSearchError('Error al cargar todas las entregas');
          setPickups([]);
        }
      }
    } catch (err) {
      console.error('Error en búsqueda:', err);
      setSearchError('Error de conexión al buscar');
      setPickups([]);
    } finally {
      setLoading(false);
    }
  };

  const clearSearch = () => {
    setSearchTerm('');
    setIsSearching(false);
    setSearchError('');
    fetchPickups();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="text-[#A2A09D]">Cargando órdenes de entrega...</div>
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
          Gestión de Órdenes de Entrega
        </h2>
        <div className="flex gap-3 items-center">
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Buscar por ID de usuario, ID de orden o estado..."
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
            onClick={() => fetchPickups()}
            className="bg-[#496B90] text-white border-0 py-2 px-6 text-sm font-medium cursor-pointer transition-all duration-200 hover:bg-[#3a5a7a]"
          >
            Actualizar
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
              <th className="text-left py-3 px-4 text-[#496B90] font-medium">ID Entrega</th>
              <th className="text-left py-3 px-4 text-[#496B90] font-medium">ID Orden</th>
              <th className="text-left py-3 px-4 text-[#496B90] font-medium">Cliente</th>
              <th className="text-left py-3 px-4 text-[#496B90] font-medium">Email</th>
              <th className="text-left py-3 px-4 text-[#496B90] font-medium">Total Orden</th>
              <th className="text-left py-3 px-4 text-[#496B90] font-medium">Fecha Entrega</th>
              <th className="text-left py-3 px-4 text-[#496B90] font-medium">Hora</th>
              <th className="text-left py-3 px-4 text-[#496B90] font-medium">Estado</th>
              <th className="text-left py-3 px-4 text-[#496B90] font-medium">Fecha Creación</th>
            </tr>
          </thead>
          <tbody>
            {pickups.map((pickup) => (
              <tr key={pickup.Num_pickup} className="border-b border-[#A2A09D]/10 hover:bg-[#F8F8F8]">
                <td className="py-3 px-4 text-[#496B90]">{pickup.Num_pickup}</td>
                <td className="py-3 px-4 text-[#496B90]">{pickup.Num_order}</td>
                <td className="py-3 px-4 text-[#496B90]">{pickup.user_name}</td>
                <td className="py-3 px-4 text-[#A2A09D] text-sm">{pickup.user_email}</td>
                <td className="py-3 px-4 text-[#D4AF37] font-medium">
                  ${pickup.order_total ? parseFloat(pickup.order_total).toFixed(2) : '0.00'}
                </td>
                <td className="py-3 px-4 text-[#496B90]">
                  {new Date(pickup.Pickup_date).toLocaleDateString('es-ES', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric'
                  })}
                </td>
                <td className="py-3 px-4 text-[#496B90]">{pickup.Pickup_time}</td>
                <td className="py-3 px-4">
                  <span className={`px-2 py-1 rounded text-xs ${
                    pickup.Status && pickup.Status.toLowerCase() === 'completado'
                      ? 'bg-green-100 text-green-800' 
                      : pickup.Status && pickup.Status.toLowerCase() === 'pendiente'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {pickup.Status || 'Sin estado'}
                  </span>
                </td>
                <td className="py-3 px-4 text-[#A2A09D] text-sm">
                  {new Date(pickup.created_at).toLocaleDateString('es-ES', {
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
        
        {pickups.length === 0 && (
          <div className="text-center py-8 text-[#A2A09D]">
            No hay órdenes de entrega disponibles
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPickups;
