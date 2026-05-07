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

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const handleImageLoad = () => {
    setImageLoaded(true);
  };

  const handleImageError = () => {
    setImageError(true);
    setImageLoaded(true);
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
        <div className="flex justify-between items-center">
          <span className="text-xl text-[#D4AF37] font-light">${parseFloat(product.Price).toFixed(2)}</span>
          <span className={`text-xs font-medium ${
            product.Stock > 0 
              ? 'text-[#A2A09D]' 
              : 'text-[#A2A09D]/50'
          }`}>
            {product.Stock > 0 ? `Stock: ${product.Stock}` : 'Agotado'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
