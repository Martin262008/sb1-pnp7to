import React from 'react';
import { Trash2, Plus, Minus } from 'lucide-react';
import { useStore } from '../store/useStore';
import { formatPrice } from '../utils/format';

export const Cart: React.FC = () => {
  const { cart, removeFromCart, updateQuantity, getTotalPrice } = useStore();

  if (cart.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Tu carrito está vacío</p>
      </div>
    );
  }

  const subtotal = cart.reduce((total, item) => 
    total + (item.product.price * item.quantity), 0);

  return (
    <div className="space-y-4">
      {cart.map((item) => (
        <div key={item.product.id} className="flex items-center gap-4 bg-white p-4 rounded-lg shadow">
          <img
            src={item.product.image}
            alt={item.product.name}
            className="w-20 h-20 object-cover rounded"
          />
          <div className="flex-1">
            <h3 className="font-semibold">{item.product.name}</h3>
            <p className="text-gray-600">{formatPrice(item.product.price)}</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => updateQuantity(item.product.id, Math.max(0, item.quantity - 1))}
              className="p-1 rounded-full hover:bg-gray-100"
            >
              <Minus size={20} />
            </button>
            <span className="w-8 text-center">{item.quantity}</span>
            <button
              onClick={() => updateQuantity(item.product.id, Math.min(item.product.stock, item.quantity + 1))}
              className="p-1 rounded-full hover:bg-gray-100"
            >
              <Plus size={20} />
            </button>
            <button
              onClick={() => removeFromCart(item.product.id)}
              className="p-1 rounded-full hover:bg-gray-100 text-red-500"
            >
              <Trash2 size={20} />
            </button>
          </div>
        </div>
      ))}
      <div className="border-t pt-4 space-y-2">
        <div className="flex justify-between text-gray-600">
          <span>Subtotal:</span>
          <span>{formatPrice(subtotal)}</span>
        </div>
        <div className="flex justify-between text-gray-600">
          <span>Costo de envío:</span>
          <span>{formatPrice(2000)}</span>
        </div>
        <div className="flex justify-between text-xl font-bold">
          <span>Total:</span>
          <span>{formatPrice(getTotalPrice())}</span>
        </div>
      </div>
    </div>
  );
};