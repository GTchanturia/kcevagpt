import paypal from '@paypal/checkout-server-sdk'
import { PAYPAL_CLIENT_ID, PAYPAL_CLIENT_SECRET, PAYPAL_ENVIRONMENT } from '$env/static/private'

function environment() {
  const clientId = PAYPAL_CLIENT_ID
  const clientSecret = PAYPAL_CLIENT_SECRET
  
  return PAYPAL_ENVIRONMENT === 'sandbox' 
    ? new paypal.core.SandboxEnvironment(clientId, clientSecret)
    : new paypal.core.LiveEnvironment(clientId, clientSecret)
}

export const paypalClient = new paypal.core.PayPalHttpClient(environment())

export async function createPayPalOrder(amount, currency = 'USD') {
  const request = new paypal.orders.OrdersCreateRequest()
  request.prefer('return=representation')
  request.requestBody({
    intent: 'CAPTURE',
    purchase_units: [{
      amount: {
        currency_code: currency,
        value: amount.toString()
      }
    }]
  })
  
  try {
    const order = await paypalClient.execute(request)
    return order.result
  } catch (error) {
    console.error('PayPal order creation error:', error)
    throw error
  }
}

export async function capturePayPalOrder(orderId) {
  const request = new paypal.orders.OrdersCaptureRequest(orderId)
  request.requestBody({})
  
  try {
    const capture = await paypalClient.execute(request)
    return capture.result
  } catch (error) {
    console.error('PayPal capture error:', error)
    throw error
  }
}