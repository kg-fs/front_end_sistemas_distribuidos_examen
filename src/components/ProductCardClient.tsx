import React, { useState } from 'react';

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

  const handleAddToCart = () => {
    setIsAdding(true);
    
    // Simulación de añadir al carrito
    setTimeout(() => {
      setIsAdding(false);
      setAdded(true);
      
      // Actualizar contador del carrito en el header
      const cartCount = parseInt(localStorage.getItem('cartCount') || '0');
      localStorage.setItem('cartCount', (cartCount + 1).toString());
      
      // Disparar evento para actualizar el header
      window.dispatchEvent(new Event('cartUpdated'));
      
      // Resetear el estado después de 2 segundos
      setTimeout(() => setAdded(false), 2000);
    }, 1000);
  };

  return (
    <div className="bg-white border border-[#A2A09D]/20 rounded-lg overflow-hidden transition-all duration-200 hover:shadow-sm">
      <div className="h-48 overflow-hidden bg-[#F8F8F8] flex items-center justify-center">
        {product.Image_url ? (
          <img 
            src={product.Image_url} 
            alt={product.Name_product}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
        ) : (
          <div className="text-[#A2A09D] text-sm">Sin imagen</div>
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
