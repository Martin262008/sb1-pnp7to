export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  image: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface CustomerInfo {
  name: string;
  email: string;
  phone: string;
  address: string;
}

export interface PaymentInfo {
  cardNumber: string;
  cardHolder: string;
  expiryDate: string;
  cvv: string;
  cardType: CardType;
}

export type CardType = 'visa' | 'mastercard' | 'amex' | 'mercadopago';

export interface PaymentResponse {
  success: boolean;
  transactionId: string;
  message: string;
  authorizationCode?: string;
  cardLastFourDigits: string;
}

export interface PaymentGatewayResponse {
  status: 'approved' | 'rejected' | 'pending';
  statusDetail: string;
  transactionId: string;
  authorizationCode?: string;
}