import React from 'react';
import { Toaster, toast } from 'react-hot-toast';
import { ShoppingCart as CartIcon } from 'lucide-react';
import { products } from './data/products';
import { ProductCard } from './components/ProductCard';
import { Cart } from './components/Cart';
import { CustomerForm } from './components/CustomerForm';
import { PaymentForm } from './components/PaymentForm';
import { useStore } from './store/useStore';

function App() {
  const [step, setStep] = React.useState<'products' | 'cart' | 'customer' | 'payment'>('products');
  const { cart, customerInfo, clearCart } = useStore();

  const handlePaymentComplete = () => {
    toast.success('¡Pago exitoso! Se ha enviado la confirmación a tu correo.');
    clearCart();
    setStep('products');
  };

  const handleCustomerComplete = () => {
    setStep('payment');
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Toaster position="top-right" />
      
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Nuestra Tienda</h1>
          {step === 'products' && (
            <button
              onClick={() => setStep('cart')}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
            >
              <CartIcon size={20} />
              Carrito ({cart.length})
            </button>
          )}
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {step !== 'products' && (
          <button
            onClick={() => setStep(step === 'cart' ? 'products' : step === 'customer' ? 'cart' : 'customer')}
            className="mb-4 text-blue-600 hover:text-blue-800 flex items-center gap-1"
          >
            ← Volver
          </button>
        )}

        {step === 'products' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}

        {step === 'cart' && (
          <div className="max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold mb-4">Carrito de Compras</h2>
            <Cart />
            {cart.length > 0 && (
              <button
                onClick={() => setStep('customer')}
                className="mt-4 w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
              >
                Continuar con la Compra
              </button>
            )}
          </div>
        )}

        {step === 'customer' && (
          <div className="max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold mb-4">Información del Cliente</h2>
            <CustomerForm onComplete={handleCustomerComplete} />
          </div>
        )}

        {step === 'payment' && customerInfo && (
          <div className="max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold mb-4">Información de Pago</h2>
            <PaymentForm onComplete={handlePaymentComplete} />
          </div>
        )}
      </main>
    </div>
  );
}

export default App;