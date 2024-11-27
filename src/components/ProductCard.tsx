import React from 'react';
import { ShoppingCart } from 'lucide-react';
import { Product } from '../types';
import { useStore } from '../store/useStore';
import { formatPrice } from '../utils/format';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const addToCart = useStore(state => state.addToCart);

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <img 
        src={product.image} 
        alt={product.name}
        className="w-full h-48 object-cover"
      />
      <div className="p-4">
        <h3 className="text-lg font-semibold">{product.name}</h3>
        <p className="text-gray-600 mt-1">{product.description}</p>
        <div className="mt-2 flex items-center justify-between">
          <span className="text-xl font-bold">{formatPrice(product.price)}</span>
          <span className="text-sm text-gray-500">Stock: {product.stock}</span>
        </div>
        <button
          onClick={() => addToCart(product)}
          disabled={product.stock === 0}
          className="mt-4 w-full bg-blue-600 text-white py-2 px-4 rounded-md
                   hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed
                   flex items-center justify-center gap-2"
        >
          <ShoppingCart size={20} />
          Agregar al Carrito
        </button>
      </div>
    </div>
  );
};