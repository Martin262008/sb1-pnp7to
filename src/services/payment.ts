import { PaymentInfo, PaymentResponse, PaymentGatewayResponse } from '../types';

const TEST_CARDS = {
  visa: {
    success: ['4111111111111111', '4532111111111111'],
    failure: ['4111111111111112']
  },
  mastercard: {
    success: ['5431111111111111', '5531111111111111'],
    failure: ['5431111111111112']
  },
  amex: {
    success: ['371111111111114', '371111111111111'],
    failure: ['371111111111113']
  },
  mercadopago: {
    success: ['5031111111111111', '5031755111111111'],
    failure: ['5031111111111112']
  }
};

const detectCardType = (cardNumber: string): string => {
  const patterns = {
    visa: /^4[0-9]{12}(?:[0-9]{3})?$/,
    mastercard: /^5[1-5][0-9]{14}$/,
    amex: /^3[47][0-9]{13}$/,
    mercadopago: /^503175[0-9]{10}$|^503[0-9]{13}$/
  };

  for (const [type, pattern] of Object.entries(patterns)) {
    if (pattern.test(cardNumber.replace(/\s/g, ''))) return type;
  }
  
  return 'unknown';
};

const validateCardNumber = (number: string): boolean => {
  const cleanNumber = number.replace(/\s/g, '');
  if (!/^\d+$/.test(cleanNumber)) return false;
  
  const digits = cleanNumber.split('').map(Number);
  let sum = 0;
  let isEven = false;

  for (let i = digits.length - 1; i >= 0; i--) {
    let digit = digits[i];

    if (isEven) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }

    sum += digit;
    isEven = !isEven;
  }

  return sum % 10 === 0;
};

const validateExpiryDate = (expiryDate: string): boolean => {
  const match = expiryDate.match(/^(0[1-9]|1[0-2])\/([0-9]{2})$/);
  if (!match) return false;

  const [, monthStr, yearStr] = match;
  const month = parseInt(monthStr, 10);
  const year = parseInt(yearStr, 10) + 2000;

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;

  if (year < currentYear || (year === currentYear && month < currentMonth)) {
    return false;
  }

  return true;
};

const mockPaymentGateway = async (
  paymentInfo: PaymentInfo,
  amount: number
): Promise<PaymentGatewayResponse> => {
  await new Promise(resolve => setTimeout(resolve, 2000));

  const cardType = detectCardType(paymentInfo.cardNumber);
  const cleanCardNumber = paymentInfo.cardNumber.replace(/\s/g, '');
  
  const isSuccessCard = TEST_CARDS[cardType as keyof typeof TEST_CARDS]?.success.includes(cleanCardNumber);
  const isFailureCard = TEST_CARDS[cardType as keyof typeof TEST_CARDS]?.failure.includes(cleanCardNumber);

  if (isSuccessCard) {
    return {
      status: 'approved',
      statusDetail: 'Pago aprobado',
      transactionId: `TX-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      authorizationCode: Math.random().toString(36).substr(2, 6).toUpperCase()
    };
  }

  if (isFailureCard) {
    return {
      status: 'rejected',
      statusDetail: 'Tarjeta rechazada por el banco emisor',
      transactionId: `TX-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    };
  }

  // Para tarjetas que no son de prueba, simulamos un comportamiento aleatorio
  const isApproved = Math.random() > 0.3;
  
  return isApproved ? {
    status: 'approved',
    statusDetail: 'Pago aprobado',
    transactionId: `TX-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    authorizationCode: Math.random().toString(36).substr(2, 6).toUpperCase()
  } : {
    status: 'rejected',
    statusDetail: 'Transacción rechazada',
    transactionId: `TX-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  };
};

export const processPayment = async (
  paymentInfo: PaymentInfo,
  amount: number
): Promise<PaymentResponse> => {
  const cleanCardNumber = paymentInfo.cardNumber.replace(/\s/g, '');

  if (!validateCardNumber(cleanCardNumber)) {
    throw new Error('El número de tarjeta es inválido');
  }

  if (!validateExpiryDate(paymentInfo.expiryDate)) {
    throw new Error('La fecha de vencimiento es inválida');
  }

  const cardType = detectCardType(cleanCardNumber);
  if (cardType === 'unknown') {
    throw new Error('Tipo de tarjeta no soportado');
  }

  try {
    const gatewayResponse = await mockPaymentGateway(paymentInfo, amount);

    if (gatewayResponse.status === 'approved') {
      return {
        success: true,
        transactionId: gatewayResponse.transactionId,
        message: 'Pago procesado exitosamente',
        authorizationCode: gatewayResponse.authorizationCode,
        cardLastFourDigits: cleanCardNumber.slice(-4)
      };
    } else {
      throw new Error(gatewayResponse.statusDetail);
    }
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Error al procesar el pago');
  }
};