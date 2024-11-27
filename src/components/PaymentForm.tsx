import React from 'react';
import { useStore } from '../store/useStore';
import { formatPrice } from '../utils/format';
import { sendConfirmationEmail } from '../services/email';
import { processPayment } from '../services/payment';
import { toast } from 'react-hot-toast';
import { CardType } from '../types';
import { CreditCard } from 'lucide-react';

export const PaymentForm: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const { setPaymentInfo, getTotalPrice, cart, customerInfo } = useStore();
  const [formData, setFormData] = React.useState({
    cardNumber: '',
    cardHolder: '',
    expiryDate: '',
    cvv: '',
    cardType: '' as CardType
  });
  const [isProcessing, setIsProcessing] = React.useState(false);
  const [errors, setErrors] = React.useState<Record<string, string>>({});

  // Detectar tipo de tarjeta
  const detectCardType = (number: string): CardType | '' => {
    const patterns = {
      visa: /^4/,
      mastercard: /^5[1-5]/,
      amex: /^3[47]/,
      mercadopago: /^503175|^503/
    };

    for (const [type, pattern] of Object.entries(patterns)) {
      if (pattern.test(number)) return type as CardType;
    }
    
    return '';
  };

  const handleCardNumberChange = (value: string) => {
    const cleanValue = value.replace(/\D/g, '');
    const cardType = detectCardType(cleanValue);
    
    handleInputChange('cardNumber', cleanValue);
    handleInputChange('cardType', cardType);
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.cardType) {
      newErrors.cardNumber = 'Tipo de tarjeta no soportado';
    }

    const cardLength = formData.cardType === 'amex' ? 15 : 16;
    if (formData.cardNumber.length !== cardLength) {
      newErrors.cardNumber = `El número de tarjeta debe tener ${cardLength} dígitos`;
    }

    if (!formData.cardHolder.trim()) {
      newErrors.cardHolder = 'El nombre del titular es requerido';
    }

    if (!/^(0[1-9]|1[0-2])\/([0-9]{2})$/.test(formData.expiryDate)) {
      newErrors.expiryDate = 'Formato inválido (MM/YY)';
    }

    const cvvLength = formData.cardType === 'amex' ? 4 : 3;
    if (formData.cvv.length !== cvvLength) {
      newErrors.cvv = `El CVV debe tener ${cvvLength} dígitos`;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsProcessing(true);

    try {
      const response = await processPayment(formData, getTotalPrice());
      
      if (response.success) {
        setPaymentInfo(formData);

        const orderDetails = cart
          .map(item => `${item.product.name} x${item.quantity} - ${formatPrice(item.product.price * item.quantity)}`)
          .join('\n');

        if (customerInfo) {
          await sendConfirmationEmail(
            customerInfo.name,
            customerInfo.email,
            `${orderDetails}\n\nNúmero de autorización: ${response.authorizationCode}\nÚltimos 4 dígitos: ${response.cardLastFourDigits}`,
            formatPrice(getTotalPrice())
          );
        }

        toast.success('¡Pago procesado exitosamente!');
        onComplete();
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al procesar el pago';
      toast.error(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const getCardIcon = () => {
    switch (formData.cardType) {
      case 'visa':
        return '💳 Visa';
      case 'mastercard':
        return '💳 Mastercard';
      case 'amex':
        return '💳 American Express';
      case 'mercadopago':
        return '💳 MercadoPago';
      default:
        return <CreditCard className="w-6 h-6" />;
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="text-xl font-bold mb-4">
        Total a Pagar: {formatPrice(getTotalPrice())}
      </div>
      
      <div className="bg-blue-50 p-4 rounded-md mb-4">
        <h3 className="font-semibold mb-2">Tarjetas de prueba:</h3>
        <ul className="text-sm space-y-1">
          <li>Visa: 4111111111111111</li>
          <li>Mastercard: 5431111111111111</li>
          <li>American Express: 371111111111114</li>
          <li>MercadoPago: 5031755111111111</li>
        </ul>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Número de Tarjeta</label>
        <div className="mt-1 relative rounded-md shadow-sm">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            {getCardIcon()}
          </div>
          <input
            type="text"
            required
            maxLength={16}
            placeholder="1234 5678 9012 3456"
            className={`pl-12 block w-full rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500
              ${errors.cardNumber ? 'border-red-500' : 'border-gray-300'}`}
            value={formData.cardNumber}
            onChange={(e) => handleCardNumberChange(e.target.value)}
            disabled={isProcessing}
          />
        </div>
        {errors.cardNumber && (
          <p className="mt-1 text-sm text-red-600">{errors.cardNumber}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Titular de la Tarjeta</label>
        <input
          type="text"
          required
          className={`mt-1 block w-full rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500
            ${errors.cardHolder ? 'border-red-500' : 'border-gray-300'}`}
          value={formData.cardHolder}
          onChange={(e) => handleInputChange('cardHolder', e.target.value)}
          disabled={isProcessing}
        />
        {errors.cardHolder && (
          <p className="mt-1 text-sm text-red-600">{errors.cardHolder}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Fecha de Vencimiento</label>
          <input
            type="text"
            required
            placeholder="MM/YY"
            className={`mt-1 block w-full rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500
              ${errors.expiryDate ? 'border-red-500' : 'border-gray-300'}`}
            value={formData.expiryDate}
            onChange={(e) => {
              const value = e.target.value.replace(/\D/g, '');
              if (value.length <= 4) {
                const formatted = value.length > 2 ? `${value.slice(0, 2)}/${value.slice(2)}` : value;
                handleInputChange('expiryDate', formatted);
              }
            }}
            disabled={isProcessing}
          />
          {errors.expiryDate && (
            <p className="mt-1 text-sm text-red-600">{errors.expiryDate}</p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">CVV</label>
          <input
            type="text"
            required
            maxLength={4}
            className={`mt-1 block w-full rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500
              ${errors.cvv ? 'border-red-500' : 'border-gray-300'}`}
            value={formData.cvv}
            onChange={(e) => handleInputChange('cvv', e.target.value.replace(/\D/g, ''))}
            disabled={isProcessing}
          />
          {errors.cvv && (
            <p className="mt-1 text-sm text-red-600">{errors.cvv}</p>
          )}
        </div>
      </div>

      <button
        type="submit"
        className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 
                 disabled:bg-gray-400 disabled:cursor-not-allowed"
        disabled={isProcessing}
      >
        {isProcessing ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            Procesando Pago...
          </span>
        ) : (
          'Pagar Ahora'
        )}
      </button>
    </form>
  );
};