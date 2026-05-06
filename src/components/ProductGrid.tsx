import React, { useState, useEffect } from 'react';
import ProductCard from './ProductCard';

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

const ProductGrid: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await fetch('http://177.7.42.180:3000/api/products');
        
        if (!response.ok) {
          throw new Error(`Error: ${response.status}`);
        }
        
        const responseJson = await response.json();
        setProducts(responseJson.data || []);
      } catch (err) {
        console.error('Error fetching products:', err);
        setError('No se pudieron cargar los productos. Intenta nuevamente.');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  if (loading) {
    return (
      <div className="text-center py-16 px-8">
        <div className="w-8 h-8 border-2 border-[#A2A09D]/30 border-t-[#496B90] rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-[#A2A09D]">Cargando productos...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-16 px-8">
        <p className="text-[#A2A09D] mb-4">{error}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="bg-[#496B90] text-white border-0 py-2 px-6 text-sm font-medium cursor-pointer transition-all duration-200 hover:bg-[#3A5270]"
        >
          Reintentar
        </button>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-16 px-8">
        <p className="text-[#A2A09D]">No hay productos disponibles en este momento.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {products.map((product) => (
        <ProductCard key={product.Num_product} product={product} />
      ))}
    </div>
  );
};

export default ProductGrid;
