import React, { useState, useEffect } from 'react';

interface Product {
  Num_product: number;
  Name_product: string;
  Description: string;
  Price: number;
  Stock: number;
  Num_cat_state: number;
  Image_url?: string;
}

const AdminProducts: React.FC = () => {
  console.log('AdminProducts montado');
  
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    Name_product: '',
    Description: '',
    Image_url: '',
    Price: '',
    Stock: '',
    Type: '',
    Num_cat_state: 1
  });
  const [formError, setFormError] = useState('');
  const [formLoading, setFormLoading] = useState(false);
  const [searchId, setSearchId] = useState('');
  const [searchResult, setSearchResult] = useState<Product | null>(null);
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState('');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editFormData, setEditFormData] = useState({
    Name_product: '',
    Description: '',
    Image_url: '',
    Price: '',
    Stock: '',
    Type: '',
    Num_cat_state: 1
  });
  const [editFormError, setEditFormError] = useState('');
  const [editFormLoading, setEditFormLoading] = useState(false);
  const [isStockModalOpen, setIsStockModalOpen] = useState(false);
  const [stockProduct, setStockProduct] = useState<Product | null>(null);
  const [stockChange, setStockChange] = useState('');
  const [stockChangeType, setStockChangeType] = useState<'add' | 'subtract'>('add');
  const [stockFormError, setStockFormError] = useState('');
  const [stockFormLoading, setStockFormLoading] = useState(false);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => {
    setIsModalOpen(false);
    setFormError('');
    setFormData({
      Name_product: '',
      Description: '',
      Image_url: '',
      Price: '',
      Stock: '',
      Type: '',
      Num_cat_state: 1
    });
  };

  useEffect(() => {
    console.log('AdminProducts useEffect llamado');
    fetchProducts();
  }, []);

  // Prevenir doble scroll cuando se abren/cierran las modales
  useEffect(() => {
    if (isModalOpen || isEditModalOpen || isStockModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    
    // Limpiar cuando se desmonta el componente
    return () => {
      document.body.style.overflow = '';
    };
  }, [isModalOpen, isEditModalOpen, isStockModalOpen]);

  const fetchProducts = async () => {
    try {
      console.log('Iniciando fetchProducts');
      setLoading(true);
      const response = await fetch('http://177.7.42.180:3000/api/products');
      
      console.log('Response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Datos recibidos:', data);
        console.log('Array de productos:', data.data);
        setProducts(data.data);
      } else {
        console.log('Error en response:', response.statusText);
        setError('Error al cargar los productos');
      }
    } catch (err) {
      console.log('Error en fetchProducts:', err);
      setError('Error de conexión al cargar productos');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'Price' || name === 'Stock' || name === 'Num_cat_state' 
        ? value === '' ? '' : Number(value) 
        : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setFormLoading(true);

    try {
      const response = await fetch('http://177.7.42.180:3000/api/products/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Producto creado:', result);
        closeModal();
        fetchProducts(); // Recargar la lista de productos
      } else {
        const errorData = await response.json();
        setFormError(errorData.message || 'Error al crear el producto');
      }
    } catch (err) {
      console.error('Error al crear producto:', err);
      setFormError('Error de conexión al crear el producto');
    } finally {
      setFormLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchId.trim()) {
      setSearchError('Por favor ingrese un ID o nombre de producto');
      return;
    }

    try {
      setSearchLoading(true);
      setSearchError('');
      
      // Determinar si es búsqueda por ID (numérico) o por nombre (texto)
      const searchValue = searchId.trim();
      const isNumericSearch = !isNaN(Number(searchValue)) && searchValue !== '';
      
      let response;
      if (isNumericSearch) {
        // Búsqueda por ID
        response = await fetch('http://177.7.42.180:3000/api/products/detail', {
          method: 'GET',
          headers: {
            'x-product-id': searchValue
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.data) {
            setSearchResult(data.data);
          } else {
            setSearchError('Producto no encontrado');
            setSearchResult(null);
          }
        } else {
          setSearchError('Error al buscar el producto');
          setSearchResult(null);
        }
      } else {
        // Búsqueda por nombre (búsqueda parcial/similitud)
        response = await fetch('http://177.7.42.180:3000/api/products/search', {
          method: 'GET',
          headers: {
            'x-product-name': searchValue
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.data && data.data.length > 0) {
            // Si hay resultados, mostrar todos los productos coincidentes
            setSearchResults(data.data);
            setSearchResult(null); // Limpiar resultado individual
          } else {
            setSearchError('No se encontraron productos con ese nombre');
            setSearchResults([]);
            setSearchResult(null);
          }
        } else {
          setSearchError('Error al buscar productos por nombre');
          setSearchResults([]);
          setSearchResult(null);
        }
      }
    } catch (err) {
      console.error('Error al buscar producto:', err);
      setSearchError('Error de conexión al buscar producto');
      setSearchResult(null);
    } finally {
      setSearchLoading(false);
    }
  };

  const clearSearch = () => {
    setSearchId('');
    setSearchResult(null);
    setSearchResults([]);
    setSearchError('');
  };

  const openEditModal = (product: Product) => {
    setEditingProduct(product);
    setEditFormData({
      Name_product: product.Name_product,
      Description: product.Description,
      Image_url: '',
      Price: String(product.Price),
      Stock: String(product.Stock),
      Type: '',
      Num_cat_state: product.Num_cat_state
    });
    setEditFormError('');
    setIsEditModalOpen(true);
  };

  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setEditingProduct(null);
    setEditFormData({
      Name_product: '',
      Description: '',
      Image_url: '',
      Price: '',
      Stock: '',
      Type: '',
      Num_cat_state: 1
    });
    setEditFormError('');
  };

  const openStockModal = (product: Product) => {
    setStockProduct(product);
    setStockChange('');
    setStockChangeType('add');
    setStockFormError('');
    setIsStockModalOpen(true);
  };

  const closeStockModal = () => {
    setIsStockModalOpen(false);
    setStockProduct(null);
    setStockChange('');
    setStockChangeType('add');
    setStockFormError('');
  };

  const handleStockInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setStockChange(value === '' ? '' : value);
  };

  const handleStockTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setStockChangeType(e.target.value as 'add' | 'subtract');
  };

  const handleStockSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stockProduct || !stockChange) return;
    
    setStockFormError('');
    setStockFormLoading(true);

    try {
      const response = await fetch('http://177.7.42.180:3000/api/products/stock', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-product-id': String(stockProduct.Num_product)
        },
        body: JSON.stringify({
          cantidad: Number(stockChange),
          tipo: stockChangeType === 'add' ? 1 : 2
        })
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Stock actualizado:', result);
        closeStockModal();
        fetchProducts(); // Recargar la lista de productos
      } else {
        const errorData = await response.json();
        setStockFormError(errorData.message || 'Error al actualizar el stock');
      }
    } catch (err) {
      console.error('Error al actualizar stock:', err);
      setStockFormError('Error de conexión al actualizar el stock');
    } finally {
      setStockFormLoading(false);
    }
  };

  const handleEditInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({
      ...prev,
      [name]: name === 'Price' || name === 'Stock' || name === 'Num_cat_state' 
        ? value === '' ? '' : Number(value) 
        : value
    }));
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    
    setEditFormError('');
    setEditFormLoading(true);

    try {
      const response = await fetch('http://177.7.42.180:3000/api/products/update', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-product-id': String(editingProduct.Num_product)
        },
        body: JSON.stringify(editFormData)
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Producto actualizado:', result);
        closeEditModal();
        fetchProducts(); // Recargar la lista de productos
      } else {
        const errorData = await response.json();
        setEditFormError(errorData.message || 'Error al actualizar el producto');
      }
    } catch (err) {
      console.error('Error al actualizar producto:', err);
      setEditFormError('Error de conexión al actualizar el producto');
    } finally {
      setEditFormLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="text-[#A2A09D]">Cargando productos...</div>
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
          Gestión de Productos
        </h2>
        <div className="flex gap-3 items-center">
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Buscar por ID o nombre..."
              value={searchId}
              onChange={(e) => setSearchId(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              className="px-3 py-2 border border-[#A2A09D]/20 rounded-md focus:outline-none focus:ring-2 focus:ring-[#496B90] text-sm"
            />
            <button
              onClick={handleSearch}
              disabled={searchLoading}
              className="bg-[#496B90] text-white border-0 py-2 px-4 text-sm font-medium cursor-pointer transition-all duration-200 hover:bg-[#3a5a7a] disabled:opacity-50"
            >
              {searchLoading ? 'Buscando...' : 'Buscar'}
            </button>
            {(searchResult || searchResults.length > 0) && (
              <button
                onClick={clearSearch}
                className="text-[#A2A09D] hover:text-[#496B90] text-sm font-medium transition-colors"
              >
                Limpiar
              </button>
            )}
          </div>
          <button
            onClick={openModal}
            className="bg-[#496B90] text-white border-0 py-2 px-6 text-sm font-medium cursor-pointer transition-all duration-200 hover:bg-[#3a5a7a]"
          >
            Agregar Producto
          </button>
        </div>
      </div>
      
      {searchError && (
        <div className="mb-4 text-red-500 text-sm">
          {searchError}
        </div>
      )}
      
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-[#A2A09D]/20">
              <th className="text-left py-3 px-4 text-[#496B90] font-medium">ID</th>
              <th className="text-left py-3 px-4 text-[#496B90] font-medium">Imagen</th>
              <th className="text-left py-3 px-4 text-[#496B90] font-medium">Nombre</th>
              <th className="text-left py-3 px-4 text-[#496B90] font-medium">Descripción</th>
              <th className="text-left py-3 px-4 text-[#496B90] font-medium">Precio</th>
              <th className="text-left py-3 px-4 text-[#496B90] font-medium">Stock</th>
              <th className="text-left py-3 px-4 text-[#496B90] font-medium">Estado</th>
              <th className="text-left py-3 px-4 text-[#496B90] font-medium">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {searchResult ? (
              <tr key={searchResult.Num_product} className="border-b border-[#A2A09D]/10 hover:bg-[#F8F8F8]">
                <td className="py-3 px-4 text-[#496B90]">{searchResult.Num_product}</td>
                <td className="py-3 px-4">
                  {searchResult.Image_url ? (
                    <div className="flex items-center justify-center">
                      <img 
                        src={searchResult.Image_url} 
                        alt={searchResult.Name_product}
                        className="w-12 h-12 object-cover rounded-lg border border-[#A2A09D]/20 shadow-sm hover:shadow-md transition-shadow duration-200 cursor-pointer"
                        onClick={() => window.open(searchResult.Image_url, '_blank')}
                        title="Ver imagen completa"
                      />
                    </div>
                  ) : (
                    <div className="w-12 h-12 bg-gray-100 rounded-lg border border-[#A2A09D]/20 flex items-center justify-center">
                      <span className="text-gray-400 text-xs">Sin imagen</span>
                    </div>
                  )}
                </td>
                <td className="py-3 px-4 text-[#496B90]">{searchResult.Name_product}</td>
                <td className="py-3 px-4 text-[#A2A09D] text-sm">{searchResult.Description}</td>
                <td className="py-3 px-4 text-[#D4AF37] font-medium">${parseFloat(String(searchResult.Price)).toFixed(2)}</td>
                <td className="py-3 px-4 text-[#496B90]">{searchResult.Stock}</td>
                <td className="py-3 px-4">
                  <span className={`px-2 py-1 rounded text-xs ${
                    searchResult.Num_cat_state === 1 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {searchResult.Num_cat_state === 1 ? 'Activo' : 'Inactivo'}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <button
                    onClick={() => openEditModal(searchResult)}
                    className="text-blue-500 hover:text-blue-700 transition-colors mr-2"
                    title="Editar producto"
                  >
                    ✏️
                  </button>
                  <button
                    onClick={() => openStockModal(searchResult)}
                    className="text-green-500 hover:text-green-700 transition-colors"
                    title="Modificar stock"
                  >
                    📦
                  </button>
                </td>
              </tr>
            ) : searchResults.length > 0 ? (
              searchResults.map((product) => (
                <tr key={product.Num_product} className="border-b border-[#A2A09D]/10 bg-green-50">
                  <td className="py-3 px-4 text-[#496B90] font-semibold">{product.Num_product}</td>
                  <td className="py-3 px-4 text-[#496B90] font-semibold">{product.Name_product}</td>
                  <td className="py-3 px-4 text-[#A2A09D] text-sm">{product.Description}</td>
                  <td className="py-3 px-4 text-[#D4AF37] font-medium">${parseFloat(String(product.Price)).toFixed(2)}</td>
                  <td className="py-3 px-4 text-[#496B90]">{product.Stock}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded text-xs ${
                      product.Num_cat_state === 1 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {product.Num_cat_state === 1 ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <button
                      onClick={() => openEditModal(product)}
                      className="text-blue-500 hover:text-blue-700 transition-colors mr-2"
                      title="Editar producto"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => openStockModal(product)}
                      className="text-green-500 hover:text-green-700 transition-colors"
                      title="Modificar stock"
                    >
                      📦
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              products.map((product) => (
                <tr key={product.Num_product} className="border-b border-[#A2A09D]/10 hover:bg-[#F8F8F8]">
                  <td className="py-3 px-4 text-[#496B90]">{product.Num_product}</td>
                  <td className="py-3 px-4">
                    {product.Image_url ? (
                      <div className="flex items-center justify-center">
                        <img 
                          src={product.Image_url} 
                          alt={product.Name_product}
                          className="w-12 h-12 object-cover rounded-lg border border-[#A2A09D]/20 shadow-sm hover:shadow-md transition-shadow duration-200 cursor-pointer"
                          onClick={() => window.open(product.Image_url, '_blank')}
                          title="Ver imagen completa"
                        />
                      </div>
                    ) : (
                      <div className="w-12 h-12 bg-gray-100 rounded-lg border border-[#A2A09D]/20 flex items-center justify-center">
                        <span className="text-gray-400 text-xs">Sin imagen</span>
                      </div>
                    )}
                  </td>
                  <td className="py-3 px-4 text-[#496B90]">{product.Name_product}</td>
                  <td className="py-3 px-4 text-[#A2A09D] text-sm">{product.Description}</td>
                  <td className="py-3 px-4 text-[#D4AF37] font-medium">${parseFloat(String(product.Price)).toFixed(2)}</td>
                  <td className="py-3 px-4 text-[#496B90]">{product.Stock}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded text-xs ${
                      product.Num_cat_state === 1 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {product.Num_cat_state === 1 ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <button
                      onClick={() => openEditModal(product)}
                      className="text-blue-500 hover:text-blue-700 transition-colors mr-2"
                      title="Editar producto"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => openStockModal(product)}
                      className="text-green-500 hover:text-green-700 transition-colors"
                      title="Modificar stock"
                    >
                      📦
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        
        {products.length === 0 && (
          <div className="text-center py-8 text-[#A2A09D]">
            No hay productos disponibles
          </div>
        )}
      </div>
      
      {/* Modal para agregar producto */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-xl text-[#496B90] font-light tracking-wide mb-4">
              Agregar Nuevo Producto
            </h3>
            
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <label className="block text-[#496B90] text-sm font-medium mb-1">
                    Nombre del Producto *
                  </label>
                  <input
                    type="text"
                    name="Name_product"
                    value={formData.Name_product}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-[#A2A09D]/20 rounded-md focus:outline-none focus:ring-2 focus:ring-[#496B90]"
                  />
                </div>
                
                <div>
                  <label className="block text-[#496B90] text-sm font-medium mb-1">
                    Descripción
                  </label>
                  <textarea
                    name="Description"
                    value={formData.Description}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-3 py-2 border border-[#A2A09D]/20 rounded-md focus:outline-none focus:ring-2 focus:ring-[#496B90]"
                  />
                </div>
                
                <div>
                  <label className="block text-[#496B90] text-sm font-medium mb-1">
                    URL de Imagen
                  </label>
                  <input
                    type="text"
                    name="Image_url"
                    value={formData.Image_url}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-[#A2A09D]/20 rounded-md focus:outline-none focus:ring-2 focus:ring-[#496B90]"
                  />
                </div>
                
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-[#496B90] text-sm font-medium mb-1">
                      Precio *
                    </label>
                    <input
                      type="number"
                      name="Price"
                      value={formData.Price}
                      onChange={handleInputChange}
                      required
                      step="0.01"
                      min="0"
                      className="w-full px-3 py-2 border border-[#A2A09D]/20 rounded-md focus:outline-none focus:ring-2 focus:ring-[#496B90]"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-[#496B90] text-sm font-medium mb-1">
                    Tipo *
                  </label>
                  <input
                    type="text"
                    name="Type"
                    value={formData.Type}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-[#A2A09D]/20 rounded-md focus:outline-none focus:ring-2 focus:ring-[#496B90]"
                  />
                </div>
                
                <div>
                  <label className="block text-[#496B90] text-sm font-medium mb-1">
                    Estado
                  </label>
                  <select
                    name="Num_cat_state"
                    value={formData.Num_cat_state}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-[#A2A09D]/20 rounded-md focus:outline-none focus:ring-2 focus:ring-[#496B90]"
                  >
                    <option value={1}>Activo</option>
                    <option value={2}>Inactivo</option>
                  </select>
                </div>
              </div>
              
              {formError && (
                <div className="mt-4 text-red-500 text-sm">
                  {formError}
                </div>
              )}
              
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
                  className="px-4 py-2 bg-[#496B90] text-white rounded-md hover:bg-[#3a5a7a] transition-colors disabled:opacity-50"
                >
                  {formLoading ? 'Creando...' : 'Crear Producto'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {/* Modal para editar producto */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-xl text-[#496B90] font-light tracking-wide mb-4">
              Editar Producto #{editingProduct?.Num_product}
            </h3>
            
            <form onSubmit={handleEditSubmit}>
              <div className="space-y-4">
                <div>
                  <label className="block text-[#496B90] text-sm font-medium mb-1">
                    Nombre del Producto *
                  </label>
                  <input
                    type="text"
                    name="Name_product"
                    value={editFormData.Name_product}
                    onChange={handleEditInputChange}
                    required
                    className="w-full px-3 py-2 border border-[#A2A09D]/20 rounded-md focus:outline-none focus:ring-2 focus:ring-[#496B90]"
                  />
                </div>
                
                <div>
                  <label className="block text-[#496B90] text-sm font-medium mb-1">
                    Descripción
                  </label>
                  <textarea
                    name="Description"
                    value={editFormData.Description}
                    onChange={handleEditInputChange}
                    rows={3}
                    className="w-full px-3 py-2 border border-[#A2A09D]/20 rounded-md focus:outline-none focus:ring-2 focus:ring-[#496B90]"
                  />
                </div>
                
                <div>
                  <label className="block text-[#496B90] text-sm font-medium mb-1">
                    URL de Imagen
                  </label>
                  <input
                    type="text"
                    name="Image_url"
                    value={editFormData.Image_url}
                    onChange={handleEditInputChange}
                    className="w-full px-3 py-2 border border-[#A2A09D]/20 rounded-md focus:outline-none focus:ring-2 focus:ring-[#496B90]"
                  />
                </div>
                
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-[#496B90] text-sm font-medium mb-1">
                      Precio *
                    </label>
                    <input
                      type="number"
                      name="Price"
                      value={editFormData.Price}
                      onChange={handleEditInputChange}
                      required
                      step="0.01"
                      min="0"
                      className="w-full px-3 py-2 border border-[#A2A09D]/20 rounded-md focus:outline-none focus:ring-2 focus:ring-[#496B90]"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-[#496B90] text-sm font-medium mb-1">
                    Tipo *
                  </label>
                  <input
                    type="text"
                    name="Type"
                    value={editFormData.Type}
                    onChange={handleEditInputChange}
                    required
                    className="w-full px-3 py-2 border border-[#A2A09D]/20 rounded-md focus:outline-none focus:ring-2 focus:ring-[#496B90]"
                  />
                </div>
                
                <div>
                  <label className="block text-[#496B90] text-sm font-medium mb-1">
                    Estado
                  </label>
                  <select
                    name="Num_cat_state"
                    value={editFormData.Num_cat_state}
                    onChange={handleEditInputChange}
                    className="w-full px-3 py-2 border border-[#A2A09D]/20 rounded-md focus:outline-none focus:ring-2 focus:ring-[#496B90]"
                  >
                    <option value={1}>Activo</option>
                    <option value={2}>Inactivo</option>
                  </select>
                </div>
              </div>
              
              {editFormError && (
                <div className="mt-4 text-red-500 text-sm">
                  {editFormError}
                </div>
              )}
              
              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={closeEditModal}
                  disabled={editFormLoading}
                  className="px-4 py-2 text-[#496B90] border border-[#496B90] rounded-md hover:bg-[#496B90] hover:text-white transition-colors disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={editFormLoading}
                  className="px-4 py-2 bg-[#496B90] text-white rounded-md hover:bg-[#3a5a7a] transition-colors disabled:opacity-50"
                >
                  {editFormLoading ? 'Actualizando...' : 'Actualizar Producto'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {/* Modal para modificar stock */}
      {isStockModalOpen && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-xl text-[#496B90] font-light tracking-wide mb-4">
              Modificar Stock - {stockProduct?.Name_product}
            </h3>
            
            <form onSubmit={handleStockSubmit}>
              <div className="space-y-4">
                <div>
                  <label className="block text-[#496B90] text-sm font-medium mb-1">
                    Stock Actual
                  </label>
                  <div className="px-3 py-2 bg-gray-100 border border-[#A2A09D]/20 rounded-md text-[#496B90]">
                    {stockProduct?.Stock} unidades
                  </div>
                </div>
                
                <div>
                  <label className="block text-[#496B90] text-sm font-medium mb-1">
                    Operación
                  </label>
                  <select
                    value={stockChangeType}
                    onChange={handleStockTypeChange}
                    className="w-full px-3 py-2 border border-[#A2A09D]/20 rounded-md focus:outline-none focus:ring-2 focus:ring-[#496B90]"
                  >
                    <option value="add">Agregar al stock (+)</option>
                    <option value="subtract">Restar del stock (-)</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-[#496B90] text-sm font-medium mb-1">
                    Cantidad *
                  </label>
                  <input
                    type="number"
                    value={stockChange}
                    onChange={handleStockInputChange}
                    required
                    min="1"
                    className="w-full px-3 py-2 border border-[#A2A09D]/20 rounded-md focus:outline-none focus:ring-2 focus:ring-[#496B90]"
                    placeholder="Ingrese la cantidad"
                  />
                </div>
                
                <div className="p-3 bg-blue-50 rounded-md">
                  <p className="text-sm text-[#496B90]">
                    <strong>Resultado:</strong> Stock actual ({stockProduct?.Stock}) 
                    {stockChangeType === 'add' ? ' + ' : ' - '}
                    {stockChange || '0'} = 
                    <strong> {stockChangeType === 'add' 
                      ? (Number(stockProduct?.Stock || 0) + Number(stockChange || 0))
                      : Math.max(0, Number(stockProduct?.Stock || 0) - Number(stockChange || 0))
                    } unidades</strong>
                  </p>
                </div>
              </div>
              
              {stockFormError && (
                <div className="mt-4 text-red-500 text-sm">
                  {stockFormError}
                </div>
              )}
              
              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={closeStockModal}
                  disabled={stockFormLoading}
                  className="px-4 py-2 text-[#496B90] border border-[#496B90] rounded-md hover:bg-[#496B90] hover:text-white transition-colors disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={stockFormLoading}
                  className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors disabled:opacity-50"
                >
                  {stockFormLoading ? 'Actualizando...' : 'Actualizar Stock'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProducts;
