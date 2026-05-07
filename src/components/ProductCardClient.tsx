import React, { useState } from 'react';
import ImageSkeleton from './ImageSkeleton';

interface Product {
  Num_product: number;
  Name_product: string;
  Description: string;
  Price: string;
  Stock: number;
  Image_url?: string;
  Type: string;
  Num_cat_state: number;
  created_at: string;
}

interface ProductCardClientProps {
  product: Product;
}

const ProductCardClient: React.FC<ProductCardClientProps> = ({ product }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [added, setAdded] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const handleImageLoad = () => {
    setImageLoaded(true);
  };

  const handleImageError = () => {
    setImageError(true);
    setImageLoaded(true);
  };

  const handleAddToCart = async () => {
    if (typeof window === 'undefined') return;
    
    setIsAdding(true);
    
    try {
      // Obtener el userId del localStorage
      const savedUser = localStorage.getItem('user');
      if (!savedUser) {
        console.error('No hay usuario autenticado');
        setIsAdding(false);
        return;
      }
      
      const user = JSON.parse(savedUser);
      const userId = user.id || user.userId;
      
      if (!userId) {
        console.error('No se encontró el ID del usuario');
        setIsAdding(false);
        return;
      }
      
      // Hacer la petición POST al backend
      const response = await fetch('http://177.7.42.180:3000/api/cart/items', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': userId.toString()
        },
        body: JSON.stringify({
          num_product: product.Num_product,
          quantity: 1
        })
      });
      
      if (!response.ok) {
        throw new Error(`Error al agregar al carrito: ${response.status}`);
      }
      
      const result = await response.json();
      console.log('Producto agregado al carrito:', result);
      
      setIsAdding(false);
      setAdded(true);
      
      // Disparar evento para actualizar el header
      window.dispatchEvent(new Event('cartUpdated'));
      
      // Resetear el estado después de 2 segundos
      setTimeout(() => setAdded(false), 2000);
      
    } catch (error) {
      console.error('Error al agregar producto al carrito:', error);
      setIsAdding(false);
      // Aquí podrías mostrar un mensaje de error al usuario
    }
  };

  return (
    <div className="bg-white border border-[#A2A09D]/20 rounded-lg overflow-hidden transition-all duration-200 hover:shadow-sm">
      <div className="h-48 overflow-hidden bg-[#F8F8F8] flex items-center justify-center relative">
        {product.Image_url && !imageError ? (
          <>
            {!imageLoaded && <ImageSkeleton className="absolute inset-0" />}
            <img 
              src={product.Image_url} 
              alt={product.Name_product}
              className={`w-full h-full object-cover transition-opacity duration-300 ${
                imageLoaded ? 'opacity-100' : 'opacity-0'
              }`}
              loading="lazy"
              onLoad={handleImageLoad}
              onError={handleImageError}
            />
          </>
        ) : (
          <div className="text-[#A2A09D] text-sm">
            {imageError ? 'Error al cargar imagen' : 'Sin imagen'}
          </div>
        )}
      </div>
      <div className="p-6">
        <h3 className="text-lg text-[#496B90] mb-3 font-light">{product.Name_product}</h3>
        <p className="text-[#A2A09D] text-sm mb-6 leading-relaxed">{product.Description}</p>
        <div className="flex justify-between items-center mb-4">
          <span className="text-xl text-[#D4AF37] font-light">${parseFloat(product.Price).toFixed(2)}</span>
          <span className={`text-xs font-medium ${
            product.Stock > 0 
              ? 'text-[#A2A09D]' 
              : 'text-[#A2A09D]/50'
          }`}>
            {product.Stock > 0 ? `Stock: ${product.Stock}` : 'Agotado'}
          </span>
        </div>
        <button
          onClick={handleAddToCart}
          disabled={product.Stock === 0 || isAdding || added}
          className={`w-full py-3 rounded-lg font-medium transition-all duration-200 ${
            product.Stock === 0
              ? 'bg-[#A2A09D]/20 text-[#A2A09D]/50 cursor-not-allowed'
              : added
              ? 'bg-green-600 text-white'
              : isAdding
              ? 'bg-[#496B90]/70 text-white cursor-wait'
              : 'bg-[#496B90] text-white hover:bg-[#3A5270]'
          }`}
        >
          {isAdding ? (
            'Añadiendo...'
          ) : added ? (
            '✓ Añadido'
          ) : product.Stock === 0 ? (
            'Agotado'
          ) : (
            'Añadir al carrito'
          )}
        </button>
      </div>
    </div>
  );
};

export default ProductCardClient;
