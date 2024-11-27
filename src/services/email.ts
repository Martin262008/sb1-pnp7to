import emailjs from '@emailjs/browser';

const EMAILJS_SERVICE_ID = 'service_ecommerce';
const EMAILJS_TEMPLATE_ID = 'template_order';
const EMAILJS_PUBLIC_KEY = 'public_key';

export const sendConfirmationEmail = async (
  customerName: string,
  customerEmail: string,
  orderDetails: string,
  totalAmount: string
) => {
  try {
    if (!EMAILJS_SERVICE_ID || !EMAILJS_TEMPLATE_ID || !EMAILJS_PUBLIC_KEY) {
      throw new Error('Configuración de EmailJS incompleta');
    }

    const templateParams = {
      to_name: customerName,
      to_email: customerEmail,
      order_details: orderDetails,
      total_amount: totalAmount,
    };

    await emailjs.init(EMAILJS_PUBLIC_KEY);
    
    const response = await emailjs.send(
      EMAILJS_SERVICE_ID,
      EMAILJS_TEMPLATE_ID,
      templateParams
    );

    if (response.status === 200) {
      return response;
    }

    throw new Error(`Error al enviar el email: ${response.text}`);
  } catch (error) {
    console.error('Error sending email:', error);
    throw new Error('No se pudo enviar el email de confirmación. Por favor, contacte al soporte.');
  }
};